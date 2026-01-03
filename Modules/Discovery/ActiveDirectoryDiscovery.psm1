# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 2.1.0
# Created: 2025-01-18
# Last Modified: 2026-01-02

<#
.SYNOPSIS
    Active Directory discovery module for M&A Discovery Suite
.DESCRIPTION
    Discovers Active Directory users, groups, computers, organizational units, sites, and DNS zones for comprehensive 
    on-premises infrastructure assessment. This module provides detailed Active Directory topology discovery, 
    permission analysis, group membership mapping, and security assessment capabilities essential for 
    M&A due diligence and migration planning.
.NOTES
    Version: 2.1.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Last Modified: 2026-01-02
    Requires: PowerShell 5.1+, ActiveDirectory module, Windows authentication

    Changelog:
    - v2.1.0 (2026-01-02): Migration enhancement
      - Added MemberOfGroups field to user export (full group DN list)
      - Enables direct migration planning without cross-referencing
    - v2.0.0 (2026-01-02): Major security enhancement
      - Added nested group membership expansion (recursive)
      - Extended user attributes (adminCount, userAccountControl, SPN, Kerberos)
      - Extended group attributes (objectSid, adminCount, privileged group detection)
      - Extended computer attributes (SPN, server role detection)
      - Added retry logic with exponential backoff
      - Added 3 new CSV exports: ADNestedGroupMemberships, ADPrivilegedAccounts, ADKerberosDelegation
      - Total CSV files: 10 → 16
    - v1.0.0 (2025-01-18): Initial release
#>

# Fallback logging function if Write-MandALog is not available
if (-not (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
    function Write-MandALog {
        param(
            [string]$Message,
            [string]$Level = "INFO",
            [string]$Component = "Discovery",
            [hashtable]$Context = @{}
        )
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        Write-Host "[$timestamp] [$Level] [$Component] $Message" -ForegroundColor $(
            switch ($Level) {
                'ERROR' { 'Red' }
                'WARN' { 'Yellow' }
                'SUCCESS' { 'Green' }
                'HEADER' { 'Cyan' }
                'DEBUG' { 'Gray' }
                default { 'White' }
            }
        )
    }
}

function Get-AuthInfoFromConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    # Extract credentials from Configuration
    $TenantId = $Configuration.TenantId
    $ClientId = $Configuration.ClientId
    $ClientSecret = $Configuration.ClientSecret

    if (-not $TenantId -or -not $ClientId -or -not $ClientSecret) {
        Write-ActiveDirectoryLog -Message "Missing Graph API credentials in configuration. TenantId: $($null -ne $TenantId), ClientId: $($null -ne $ClientId), ClientSecret: $($null -ne $ClientSecret)" -Level "WARN"
        # Fallback to Windows integrated authentication for on-premises
        Write-ActiveDirectoryLog -Message "Falling back to Windows authentication for on-premises AD" -Level "DEBUG"
        return @{
            AuthType = "WindowsIntegrated"
            Domain = $Configuration.environment.domainController
        }
    }

    Write-ActiveDirectoryLog -Message "Auth - Using Graph API credentials. Tenant: $TenantId, Client: $ClientId" -Level "INFO"

    return @{
        AuthType = "GraphAPI"
        TenantId = $TenantId
        ClientId = $ClientId
        ClientSecret = $ClientSecret
    }
}

function Write-ActiveDirectoryLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    Write-MandALog -Message "[ActiveDirectory] $Message" -Level $Level -Component "ActiveDirectoryDiscovery" -Context $Context
}

function Invoke-ADCommandWithRetry {
    <#
    .SYNOPSIS
        Executes an AD command with retry logic and exponential backoff
    .DESCRIPTION
        Wraps AD cmdlets with automatic retry on transient failures, using exponential backoff strategy
    .PARAMETER Command
        The scriptblock to execute
    .PARAMETER MaxRetries
        Maximum number of retry attempts (default: 3)
    .PARAMETER RetryDelaySeconds
        Initial retry delay in seconds (default: 2, doubles each retry)
    .PARAMETER Context
        Context hashtable for logging
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$Command,
        [int]$MaxRetries = 3,
        [int]$RetryDelaySeconds = 2,
        [hashtable]$Context = @{}
    )

    $attempt = 0
    $lastError = $null

    while ($attempt -lt $MaxRetries) {
        try {
            $attempt++
            return & $Command
        } catch {
            $lastError = $_
            if ($attempt -lt $MaxRetries) {
                Write-ActiveDirectoryLog -Message "Attempt $attempt failed, retrying in $RetryDelaySeconds seconds: $($_.Exception.Message)" -Level "WARN" -Context $Context
                Start-Sleep -Seconds $RetryDelaySeconds
                $RetryDelaySeconds *= 2  # Exponential backoff
            }
        }
    }

    throw "Failed after $MaxRetries attempts: $($lastError.Exception.Message)"
}

function Get-ADGroupMembershipExpanded {
    <#
    .SYNOPSIS
        Recursively expands group membership including nested groups
    .DESCRIPTION
        Discovers all members of a group including indirect membership through nested groups.
        Tracks membership paths and prevents infinite loops in circular group references.
    .PARAMETER Group
        The AD group object to expand
    .PARAMETER ServerParams
        Server connection parameters
    .PARAMETER MembershipPath
        Current membership path (for recursion tracking)
    .PARAMETER ProcessedGroups
        HashSet of already processed groups (prevents infinite loops)
    .PARAMETER Context
        Context hashtable for logging
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        $Group,
        [Parameter(Mandatory=$true)]
        [hashtable]$ServerParams,
        [Parameter(Mandatory=$false)]
        [string]$MembershipPath = "",
        [Parameter(Mandatory=$false)]
        [System.Collections.Generic.HashSet[string]]$ProcessedGroups = [System.Collections.Generic.HashSet[string]]::new(),
        [hashtable]$Context = @{}
    )

    $members = @()
    $groupDN = $Group.DistinguishedName

    # Prevent infinite loops in nested groups
    if ($ProcessedGroups.Contains($groupDN)) {
        return $members
    }
    $ProcessedGroups.Add($groupDN) | Out-Null

    # Build membership path
    $currentPath = if ($MembershipPath) { "$MembershipPath > $($Group.SamAccountName)" } else { $Group.SamAccountName }

    # Get direct members
    if ($Group.member) {
        foreach ($memberDN in $Group.member) {
            try {
                $memberObj = Get-ADObject -Identity $memberDN -Properties SamAccountName, ObjectClass, memberOf @ServerParams -ErrorAction Stop

                # Add direct member
                $members += [PSCustomObject]@{
                    GroupDN = $groupDN
                    GroupName = $Group.SamAccountName
                    MemberDN = $memberDN
                    MemberSamAccountName = $memberObj.SamAccountName
                    MemberObjectClass = $memberObj.ObjectClass
                    MembershipType = 'Direct'
                    MembershipPath = $currentPath
                    NestingLevel = ($currentPath -split '>').Count - 1
                }

                # If member is a group, recurse to get nested members
                if ($memberObj.ObjectClass -eq 'group') {
                    try {
                        $nestedGroup = Get-ADGroup -Identity $memberDN -Properties member, SamAccountName @ServerParams -ErrorAction Stop
                        $nestedMembers = Get-ADGroupMembershipExpanded -Group $nestedGroup -ServerParams $ServerParams -MembershipPath $currentPath -ProcessedGroups $ProcessedGroups -Context $Context

                        # Mark nested members as indirect
                        foreach ($nm in $nestedMembers) {
                            $nm.MembershipType = 'Indirect'
                            $members += $nm
                        }
                    } catch {
                        Write-ActiveDirectoryLog -Message "Failed to expand nested group '$memberDN' for group '$($Group.SamAccountName)': $_" -Level "WARN" -Context $Context
                    }
                }
            } catch {
                Write-ActiveDirectoryLog -Message "Failed to expand member '$memberDN' for group '$($Group.SamAccountName)': $_" -Level "WARN" -Context $Context
            }
        }
    }

    return $members
}

function Connect-MgGraphWithMultipleStrategies {
    <#
    .SYNOPSIS
        Connects to Microsoft Graph using multiple authentication strategies with automatic fallback
    .DESCRIPTION
        Attempts to authenticate to Microsoft Graph using 4 different strategies in order:
        1. Client Secret Credential (preferred for automation)
        2. Certificate-Based Authentication (secure, headless)
        3. Device Code Flow (headless-friendly interactive)
        4. Interactive Browser (GUI required - last resort)
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )

    Write-ActiveDirectoryLog -Level "INFO" -Message "Attempting Microsoft Graph authentication with multiple strategies..." -Context $Context

    # Define AD-specific scopes
    $adScopes = @(
        "Directory.Read.All",
        "Domain.Read.All",
        "User.Read.All",
        "Group.Read.All",
        "GroupMember.Read.All"
    )

    # Strategy 1: Client Secret Credential (preferred for automation)
    if ($Configuration.TenantId -and $Configuration.ClientId -and $Configuration.ClientSecret) {
        try {
            Write-ActiveDirectoryLog -Level "INFO" -Message "Strategy 1: Attempting Client Secret authentication..." -Context $Context
            $secureSecret = ConvertTo-SecureString $Configuration.ClientSecret -AsPlainText -Force
            $credential = New-Object System.Management.Automation.PSCredential($Configuration.ClientId, $secureSecret)
            Connect-MgGraph -ClientSecretCredential $credential -TenantId $Configuration.TenantId -NoWelcome -ErrorAction Stop
            $context = Get-MgContext
            if ($context -and $context.TenantId) {
                Write-ActiveDirectoryLog -Level "SUCCESS" -Message "Strategy 1: Client Secret authentication successful" -Context $Context
                return $context
            }
        } catch {
            Write-ActiveDirectoryLog -Level "WARN" -Message "Strategy 1: Client Secret auth failed: $($_.Exception.Message)" -Context $Context
        }
    }

    # Strategy 2: Certificate-Based Authentication (secure, headless)
    if ($Configuration.TenantId -and $Configuration.ClientId -and $Configuration.CertificateThumbprint) {
        try {
            Write-ActiveDirectoryLog -Level "INFO" -Message "Strategy 2: Attempting Certificate authentication..." -Context $Context
            Connect-MgGraph -ClientId $Configuration.ClientId -TenantId $Configuration.TenantId -CertificateThumbprint $Configuration.CertificateThumbprint -NoWelcome -ErrorAction Stop
            $context = Get-MgContext
            if ($context -and $context.TenantId) {
                Write-ActiveDirectoryLog -Level "SUCCESS" -Message "Strategy 2: Certificate authentication successful" -Context $Context
                return $context
            }
        } catch {
            Write-ActiveDirectoryLog -Level "WARN" -Message "Strategy 2: Certificate auth failed: $($_.Exception.Message)" -Context $Context
        }
    }

    # Strategy 3: Device Code Flow (headless-friendly interactive)
    if ($Configuration.TenantId) {
        try {
            Write-ActiveDirectoryLog -Level "INFO" -Message "Strategy 3: Attempting Device Code authentication..." -Context $Context
            Connect-MgGraph -TenantId $Configuration.TenantId -Scopes $adScopes -UseDeviceCode -NoWelcome -ErrorAction Stop
            $context = Get-MgContext
            if ($context -and $context.TenantId) {
                Write-ActiveDirectoryLog -Level "SUCCESS" -Message "Strategy 3: Device Code authentication successful" -Context $Context
                return $context
            }
        } catch {
            Write-ActiveDirectoryLog -Level "WARN" -Message "Strategy 3: Device Code auth failed: $($_.Exception.Message)" -Context $Context
        }
    }

    # Strategy 4: Interactive Browser Authentication (GUI required - last resort)
    try {
        Write-ActiveDirectoryLog -Level "INFO" -Message "Strategy 4: Attempting Interactive authentication..." -Context $Context
        if ($Configuration.TenantId) {
            Connect-MgGraph -TenantId $Configuration.TenantId -Scopes $adScopes -NoWelcome -ErrorAction Stop
        } else {
            Connect-MgGraph -Scopes $adScopes -NoWelcome -ErrorAction Stop
        }
        $context = Get-MgContext
        if ($context -and $context.TenantId) {
            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "Strategy 4: Interactive authentication successful" -Context $Context
            return $context
        }
    } catch {
        Write-ActiveDirectoryLog -Level "ERROR" -Message "Strategy 4: Interactive auth failed: $($_.Exception.Message)" -Context $Context
    }

    Write-ActiveDirectoryLog -Level "ERROR" -Message "All Microsoft Graph authentication strategies exhausted" -Context $Context
    return $null
}

# --- Main Discovery Function ---

function Invoke-ActiveDirectoryDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,
        
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

        # Module version
    $moduleVersion = "2.1.0"

    Write-ActiveDirectoryLog -Level "HEADER" -Message "Active Directory Discovery Module v$moduleVersion" -Context $Context
    Write-ActiveDirectoryLog -Level "INFO" -Message "Session ID: $SessionId" -Context $Context
    Write-ActiveDirectoryLog -Level "INFO" -Message "Features: Nested groups | Org chart mapping | Security attributes | 16 CSV exports" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # 1. INITIALIZE RESULT OBJECT
    # Ensure ClassDefinitions module is loaded
    try {
        if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
            Import-Module -Name "$PSScriptRoot\..\Core\ClassDefinitions.psm1" -Force -ErrorAction Stop
        }
        $result = [DiscoveryResult]::new('ActiveDirectory')
    } catch {
        Write-ActiveDirectoryLog -Level "ERROR" -Message "Failed to load DiscoveryResult class: $($_.Exception.Message)" -Context $Context
        throw "Critical error: Cannot load required DiscoveryResult class. Discovery cannot proceed."
    }

    try {
        # 2. VALIDATE PREREQUISITES & CONTEXT
        Write-ActiveDirectoryLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-ActiveDirectoryLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context

        Confirm-Path -Path $outputPath

        # 3. VALIDATE MODULE-SPECIFIC CONFIGURATION
        # AD needs domain controller or global catalog (or can auto-detect from machine)
        # Skip this validation if domain credentials are provided (we'll auto-detect the domain)
        $hasDomainCredentials = $Configuration.domainCredentials -and
                                $Configuration.domainCredentials.username -and
                                $Configuration.domainCredentials.password

        if (-not $Configuration.environment.domainController -and
            -not $Configuration.environment.globalCatalog -and
            -not $env:USERDNSDOMAIN -and
            -not $hasDomainCredentials) {
            $result.AddError("No domain controller or global catalog configured, and machine is not domain-joined", $null, $null)
            return $result
        }

        # If domain credentials are provided, log them
        if ($hasDomainCredentials) {
            Write-ActiveDirectoryLog -Level "INFO" -Message "Domain credentials provided: $($Configuration.domainCredentials.username -replace '\\.*$','\\***')" -Context $Context
        }

        # 4. AUTHENTICATE & CONNECT
        Write-ActiveDirectoryLog -Level "INFO" -Message "Checking authentication method..." -Context $Context

        # Get authentication info
        $authInfo = Get-AuthInfoFromConfiguration -Configuration $Configuration

        # If Graph API credentials are available, connect to Microsoft Graph
        if ($authInfo.AuthType -eq "GraphAPI") {
            try {
                Write-ActiveDirectoryLog -Level "INFO" -Message "Connecting to Microsoft Graph with provided credentials..." -Context $Context

                # Check if Microsoft.Graph.Authentication module is available
                if (-not (Get-Module -Name Microsoft.Graph.Authentication -ListAvailable)) {
                    Write-ActiveDirectoryLog -Level "WARN" -Message "Microsoft.Graph.Authentication module not available, falling back to AD module" -Context $Context
                } else {
                    # Import the module
                    Import-Module Microsoft.Graph.Authentication -ErrorAction Stop

                    # Connect to Microsoft Graph
                    $secureSecret = ConvertTo-SecureString $authInfo.ClientSecret -AsPlainText -Force
                    $credential = New-Object System.Management.Automation.PSCredential($authInfo.ClientId, $secureSecret)

                    Connect-MgGraph -ClientSecretCredential $credential -TenantId $authInfo.TenantId -NoWelcome -ErrorAction Stop

                    Write-ActiveDirectoryLog -Level "SUCCESS" -Message "Connected to Microsoft Graph successfully" -Context $Context
                    $result.Metadata['AuthenticationMethod'] = 'GraphAPI'
                    $result.Metadata['TenantId'] = $authInfo.TenantId
                }
            } catch {
                Write-ActiveDirectoryLog -Level "WARN" -Message "Failed to connect to Graph API: $($_.Exception.Message). Falling back to AD module." -Context $Context
            }
        }

        Write-ActiveDirectoryLog -Level "INFO" -Message "Checking Active Directory module..." -Context $Context

        # Check if Active Directory module is available
        if (-not (Get-Module -Name ActiveDirectory -ListAvailable)) {
            $result.AddError("ActiveDirectory PowerShell module is not available. Install RSAT or ActiveDirectory module.", $null, $null)
            return $result
        }

        # Import the module if not already loaded
        if (-not (Get-Module -Name ActiveDirectory)) {
            Import-Module ActiveDirectory -ErrorAction Stop
            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "ActiveDirectory module imported successfully" -Context $Context
        }

        # Test AD connectivity
        try {
            $serverParams = Get-ServerParameters -Configuration $Configuration
            $testDomain = Get-ADDomain @serverParams -ErrorAction Stop
            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "Connected to domain: $($testDomain.DNSRoot)" -Context $Context
            $result.Metadata['DomainDNSRoot'] = $testDomain.DNSRoot
            $result.Metadata['DomainNetBIOSName'] = $testDomain.NetBIOSName
        } catch {
            $result.AddError("Failed to connect to Active Directory: $($_.Exception.Message)", $_.Exception, $null)
            return $result
        }
        # 5. PERFORM DISCOVERY
        Write-ActiveDirectoryLog -Level "HEADER" -Message "?? Starting comprehensive data discovery" -Context $Context
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Discover Users
        try {
            Write-ActiveDirectoryLog -Level "INFO" -Message "?? Discovering AD Users..." -Context $Context
            $users = Get-ADUsersData -Configuration $Configuration -Context $Context -ServerParams $serverParams
            if ($users.Count -gt 0) {
                $users | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'User' -Force }
                $null = $allDiscoveredData.AddRange($users)
                $result.Metadata["UserCount"] = $users.Count
            }
            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "? Discovered $($users.Count) users" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover users: $($_.Exception.Message)", @{Section="Users"})
        }
        
        # Discover Groups
        try {
            Write-ActiveDirectoryLog -Level "INFO" -Message "Discovering AD Groups..." -Context $Context
            $groupData = Get-ADGroupsData -Configuration $Configuration -Context $Context -ServerParams $serverParams
            
            if ($groupData.Groups.Count -gt 0) {
                $groupData.Groups | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'Group' -Force }
                $null = $allDiscoveredData.AddRange($groupData.Groups)
                $result.Metadata["GroupCount"] = $groupData.Groups.Count
            }
            
            if ($groupData.Members.Count -gt 0) {
                $groupData.Members | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'GroupMember' -Force }
                $null = $allDiscoveredData.AddRange($groupData.Members)
                $result.Metadata["GroupMembershipCount"] = $groupData.Members.Count
            }

            # Nested group members (v2.0.0)
            if ($groupData.NestedMembers.Count -gt 0) {
                $groupData.NestedMembers | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'NestedGroupMember' -Force }
                $null = $allDiscoveredData.AddRange($groupData.NestedMembers)
                $result.Metadata["NestedGroupMembershipCount"] = $groupData.NestedMembers.Count
            }

            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "Discovered $($groupData.Groups.Count) groups with $($groupData.Members.Count) direct memberships and $($groupData.NestedMembers.Count) nested memberships" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover groups: $($_.Exception.Message)", @{Section="Groups"})
        }
        
        # Discover Computers
        try {
            Write-ActiveDirectoryLog -Level "INFO" -Message "Discovering AD Computers..." -Context $Context
            $computers = Get-ADComputersData -Configuration $Configuration -Context $Context -ServerParams $serverParams
            if ($computers.Count -gt 0) {
                $computers | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'Computer' -Force }
                $null = $allDiscoveredData.AddRange($computers)
                $result.Metadata["ComputerCount"] = $computers.Count
            }
            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "Discovered $($computers.Count) computers" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover computers: $($_.Exception.Message)", @{Section="Computers"})
        }
        
        # Discover OUs
        try {
            Write-ActiveDirectoryLog -Level "INFO" -Message "Discovering Organizational Units..." -Context $Context
            $ous = Get-ADOUsData -Configuration $Configuration -Context $Context -ServerParams $serverParams
            if ($ous.Count -gt 0) {
                $ous | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'OU' -Force }
                $null = $allDiscoveredData.AddRange($ous)
                $result.Metadata["OUCount"] = $ous.Count
            }
            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "Discovered $($ous.Count) organizational units" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover OUs: $($_.Exception.Message)", @{Section="OUs"})
        }
        
        # Discover Domain Trusts
        try {
            Write-ActiveDirectoryLog -Level "INFO" -Message "Discovering Domain Trusts..." -Context $Context
            $trusts = Get-ADTrustsData -Configuration $Configuration -Context $Context -ServerParams $serverParams
            if ($trusts.Count -gt 0) {
                $trusts | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'Trust' -Force }
                $null = $allDiscoveredData.AddRange($trusts)
                $result.Metadata["TrustCount"] = $trusts.Count
            }
            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "Discovered $($trusts.Count) domain trusts" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover trusts: $($_.Exception.Message)", @{Section="Trusts"})
        }
        
        # Discover AD Sites with Enhanced Topology Data
        try {
            Write-ActiveDirectoryLog -Level "INFO" -Message "??? Discovering AD Sites & Topology..." -Context $Context
            $sites = Get-ADSitesData -Configuration $Configuration -Context $Context -ServerParams $serverParams
            if ($sites.Count -gt 0) {
                $sites | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'Site' -Force }
                $null = $allDiscoveredData.AddRange($sites)
                $result.Metadata["SiteCount"] = $sites.Count
            }
            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "? Discovered $($sites.Count) AD sites with topology data" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover sites: $($_.Exception.Message)", @{Section="Sites"})
        }
        
        # Discover Site Links & Replication Topology 
        try {
            Write-ActiveDirectoryLog -Level "INFO" -Message "?? Analyzing replication topology..." -Context $Context
            $siteLinks = Get-ADSiteLinksData -Configuration $Configuration -Context $Context -ServerParams $serverParams
            if ($siteLinks.Count -gt 0) {
                $siteLinks | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'SiteLink' -Force }
                $null = $allDiscoveredData.AddRange($siteLinks)
                $result.Metadata["SiteLinkCount"] = $siteLinks.Count
            }
            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "? Mapped $($siteLinks.Count) site links for replication analysis" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover site links: $($_.Exception.Message)", @{Section="SiteLinks"})
        }
        
        # Discover AD Subnets
        try {
            Write-ActiveDirectoryLog -Level "INFO" -Message "Discovering AD Subnets..." -Context $Context
            $subnets = Get-ADSubnetsData -Configuration $Configuration -Context $Context -ServerParams $serverParams
            if ($subnets.Count -gt 0) {
                $subnets | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'Subnet' -Force }
                $null = $allDiscoveredData.AddRange($subnets)
                $result.Metadata["SubnetCount"] = $subnets.Count
            }
            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "Discovered $($subnets.Count) AD subnets" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover subnets: $($_.Exception.Message)", @{Section="Subnets"})
        }
        
        # Discover FSMO Roles
        try {
            Write-ActiveDirectoryLog -Level "INFO" -Message "Discovering FSMO Roles..." -Context $Context
            $fsmoRoles = Get-ADFSMORolesData -Configuration $Configuration -Context $Context -ServerParams $serverParams
            if ($fsmoRoles.Count -gt 0) {
                $fsmoRoles | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'FSMORole' -Force }
                $null = $allDiscoveredData.AddRange($fsmoRoles)
                $result.Metadata["FSMORoleCount"] = $fsmoRoles.Count
            }
            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "Discovered $($fsmoRoles.Count) FSMO roles" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover FSMO roles: $($_.Exception.Message)", @{Section="FSMORoles"})
        }
        
        # Discover Domain Controllers
        try {
            Write-ActiveDirectoryLog -Level "INFO" -Message "Discovering Domain Controllers..." -Context $Context
            $domainControllers = Get-ADDomainControllersData -Configuration $Configuration -Context $Context -ServerParams $serverParams
            if ($domainControllers.Count -gt 0) {
                $domainControllers | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'DomainController' -Force }
                $null = $allDiscoveredData.AddRange($domainControllers)
                $result.Metadata["DomainControllerCount"] = $domainControllers.Count
            }
            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "Discovered $($domainControllers.Count) domain controllers" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover domain controllers: $($_.Exception.Message)", @{Section="DomainControllers"})
        }

        # Discover Password Policies & Security Settings
        try {
            Write-ActiveDirectoryLog -Level "INFO" -Message "?? Analyzing password policies & security settings..." -Context $Context
            $passwordPolicies = Get-ADPasswordPoliciesData -Configuration $Configuration -Context $Context -ServerParams $serverParams
            if ($passwordPolicies.Count -gt 0) {
                $passwordPolicies | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'PasswordPolicy' -Force }
                $null = $allDiscoveredData.AddRange($passwordPolicies)
                $result.Metadata["PasswordPolicyCount"] = $passwordPolicies.Count
            }
            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "? Analyzed $($passwordPolicies.Count) password policies" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover password policies: $($_.Exception.Message)", @{Section="PasswordPolicies"})
        }

        # Discover Service Accounts & Special Accounts
        try {
            Write-ActiveDirectoryLog -Level "INFO" -Message "?? Identifying service accounts & privileged users..." -Context $Context
            $serviceAccounts = Get-ADServiceAccountsData -Configuration $Configuration -Context $Context -ServerParams $serverParams
            if ($serviceAccounts.Count -gt 0) {
                $serviceAccounts | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'ServiceAccount' -Force }
                $null = $allDiscoveredData.AddRange($serviceAccounts)
                $result.Metadata["ServiceAccountCount"] = $serviceAccounts.Count
            }
            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "? Identified $($serviceAccounts.Count) service & special accounts" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover service accounts: $($_.Exception.Message)", @{Section="ServiceAccounts"})
        }

        # Generate Privileged Accounts Report (v2.0.0)
        try {
            Write-ActiveDirectoryLog -Level "INFO" -Message "Generating privileged accounts report..." -Context $Context
            $privilegedAccounts = @()

            # Find privileged users
            $privilegedUsers = $allDiscoveredData | Where-Object { $_._DataType -eq 'User' -and ($_IsPrivileged -eq $true -or $_.AdminCount -eq 1) }
            foreach ($user in $privilegedUsers) {
                $privilegedAccounts += [PSCustomObject]@{
                    ObjectType = 'User'
                    SamAccountName = $user.SamAccountName
                    DistinguishedName = $user.DistinguishedName
                    Reason = if ($user.AdminCount -eq 1) { "adminCount=1" } else { "IsPrivileged flag" }
                    KerberosDelegationType = $user.KerberosDelegationType
                    ServicePrincipalNames = $user.ServicePrincipalNames
                }
            }

            # Find privileged groups
            $privilegedGroups = $allDiscoveredData | Where-Object { $_._DataType -eq 'Group' -and ($_IsPrivilegedGroup -eq $true -or $_.AdminCount -eq 1) }
            foreach ($group in $privilegedGroups) {
                $privilegedAccounts += [PSCustomObject]@{
                    ObjectType = 'Group'
                    SamAccountName = $group.SamAccountName
                    DistinguishedName = $group.DistinguishedName
                    Reason = if ($group.AdminCount -eq 1) { "adminCount=1" } else { "Well-known privileged group" }
                    MemberCount = $group.MemberCount
                    GroupScope = $group.GroupScope
                }
            }

            if ($privilegedAccounts.Count -gt 0) {
                $privilegedAccounts | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'PrivilegedAccount' -Force }
                $null = $allDiscoveredData.AddRange($privilegedAccounts)
                $result.Metadata["PrivilegedAccountCount"] = $privilegedAccounts.Count
            }
            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "Identified $($privilegedAccounts.Count) privileged accounts" -Context $Context
        } catch {
            $result.AddWarning("Failed to generate privileged accounts report: $($_.Exception.Message)", @{Section="PrivilegedAccounts"})
        }

        # Generate Kerberos Delegation Report (v2.0.0)
        try {
            Write-ActiveDirectoryLog -Level "INFO" -Message "Generating Kerberos delegation report..." -Context $Context
            $delegationRecords = @()

            # Find users with Kerberos delegation
            $delegatedUsers = $allDiscoveredData | Where-Object { $_._DataType -eq 'User' -and $_.KerberosDelegationType -ne 'None' }
            foreach ($user in $delegatedUsers) {
                $delegationRecords += [PSCustomObject]@{
                    ObjectName = $user.SamAccountName
                    ObjectType = 'User'
                    DelegationType = $user.KerberosDelegationType
                    ServicePrincipalNames = $user.ServicePrincipalNames
                    TrustedToAuthForDelegation = $user.DelegationPermitted
                    DistinguishedName = $user.DistinguishedName
                }
            }

            # Find computers with Kerberos delegation (server SPNs)
            $delegatedComputers = $allDiscoveredData | Where-Object { $_._DataType -eq 'Computer' -and $_.ServicePrincipalNames -and $_.ServerRoles -ne 'None' }
            foreach ($computer in $delegatedComputers) {
                $delegationRecords += [PSCustomObject]@{
                    ObjectName = $computer.Name
                    ObjectType = 'Computer'
                    DelegationType = 'Service Account'
                    ServicePrincipalNames = $computer.ServicePrincipalNames
                    ServerRoles = $computer.ServerRoles
                    DistinguishedName = $computer.DistinguishedName
                }
            }

            if ($delegationRecords.Count -gt 0) {
                $delegationRecords | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'KerberosDelegation' -Force }
                $null = $allDiscoveredData.AddRange($delegationRecords)
                $result.Metadata["KerberosDelegationCount"] = $delegationRecords.Count
            }
            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "Identified $($delegationRecords.Count) delegation configurations" -Context $Context
        } catch {
            $result.AddWarning("Failed to generate Kerberos delegation report: $($_.Exception.Message)", @{Section="KerberosDelegation"})
        }

        # 6. EXPORT DATA TO CSV
        if ($allDiscoveredData.Count -gt 0) {
            Write-ActiveDirectoryLog -Level "INFO" -Message "?? Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            
            # Group by type and export to separate files
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                
                # Map data types to file names
                $fileMap = @{
                    'User' = 'ADUsers.csv'
                    'Group' = 'ADGroups.csv'
                    'GroupMember' = 'ADGroupMembers.csv'
                    'NestedGroupMember' = 'ADNestedGroupMemberships.csv'
                    'Computer' = 'ADComputers.csv'
                    'OU' = 'ADOrganizationalUnits.csv'
                    'Trust' = 'ADTrusts.csv'
                    'Site' = 'ADSites.csv'
                    'Subnet' = 'ADSubnets.csv'
                    'FSMORole' = 'ADFSMORoles.csv'
                    'DomainController' = 'ADDomainControllers.csv'
                    'PrivilegedAccount' = 'ADPrivilegedAccounts.csv'
                    'KerberosDelegation' = 'ADKerberosDelegation.csv'
                }
                
                $fileName = if ($fileMap.ContainsKey($dataType)) { $fileMap[$dataType] } else { "AD_$dataType.csv" }
                $filePath = Join-Path $outputPath $fileName
                
                # Add metadata to each record
                $group.Group | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "ActiveDirectory" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }
                
                # Export to CSV
                $group.Group | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
                
                Write-ActiveDirectoryLog -Level "SUCCESS" -Message "Exported $($group.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-ActiveDirectoryLog -Level "WARN" -Message "No data discovered to export" -Context $Context
        }

        # 7. FINALIZE METADATA
        # CRITICAL FIX: Ensure RecordCount property exists and is set correctly
        if ($result -is [hashtable]) {
            # For hashtable, ensure RecordCount key exists and is set
            $result.RecordCount = $allDiscoveredData.Count
            $result['RecordCount'] = $allDiscoveredData.Count  # Ensure both access methods work
        } else {
            # For DiscoveryResult object, set the property directly
            $result.RecordCount = $allDiscoveredData.Count
        }
        $result.Metadata["TotalRecords"] = $allDiscoveredData.Count
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        # Top-level error handler
        Write-ActiveDirectoryLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        # 8. CLEANUP & COMPLETE
        Write-ActiveDirectoryLog -Level "INFO" -Message "Cleaning up..." -Context $Context
        
        $stopwatch.Stop()
        $result.EndTime = Get-Date
        Write-ActiveDirectoryLog -Level "HEADER" -Message "?? Discovery completed in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')) - Found $($result.RecordCount) records!" -Context $Context
    }

    return $result
}

# --- Helper Functions ---
function Confirm-Path {
    param($Path)
    if (-not (Test-Path -Path $Path -PathType Container)) {
        try {
            New-Item -Path $Path -ItemType Directory -Force -ErrorAction Stop | Out-Null
        } catch {
            throw "Failed to create output directory: $Path. Error: $($_.Exception.Message)"
        }
    }
}

function Get-ServerParameters {
    param([hashtable]$Configuration)

    $params = @{}

    # Add server parameter
    if ($Configuration.environment.globalCatalog) {
        $params.Server = $Configuration.environment.globalCatalog
    } elseif ($Configuration.environment.domainController) {
        $params.Server = $Configuration.environment.domainController
    } elseif ($env:USERDNSDOMAIN) {
        $params.Server = $env:USERDNSDOMAIN
    } else {
        # Try to extract domain from domain credentials (DOMAIN\username format)
        if ($Configuration.domainCredentials -and $Configuration.domainCredentials.username) {
            if ($Configuration.domainCredentials.username -match '^([^\\]+)\\') {
                $domainName = $matches[1]
                $params.Server = $domainName
                Write-ActiveDirectoryLog -Level "INFO" -Message "Auto-detected domain from credentials: $domainName"
            }
        }
    }

    # Add credential parameter if domain credentials are provided
    if ($Configuration.domainCredentials -and
        $Configuration.domainCredentials.username -and
        $Configuration.domainCredentials.password) {
        try {
            $securePassword = ConvertTo-SecureString $Configuration.domainCredentials.password -AsPlainText -Force
            $credential = New-Object System.Management.Automation.PSCredential(
                $Configuration.domainCredentials.username,
                $securePassword
            )
            $params.Credential = $credential

            Write-ActiveDirectoryLog -Level "INFO" -Message "Using domain credentials for authentication: $($Configuration.domainCredentials.username -replace '\\.*$','\\***')"
        } catch {
            Write-ActiveDirectoryLog -Level "WARN" -Message "Failed to create PSCredential from domain credentials: $($_.Exception.Message)"
        }
    } else {
        Write-ActiveDirectoryLog -Level "INFO" -Message "Using integrated Windows authentication (no domain credentials provided)"
    }

    return $params
}

function Get-ADUsersData {
    param(
        [hashtable]$Configuration,
        [hashtable]$Context,
        [hashtable]$ServerParams
    )
    
    $users = [System.Collections.ArrayList]::new()
    
    try {
        $userProperties = @(
            'SamAccountName', 'UserPrincipalName', 'GivenName', 'Surname', 'DisplayName',
            'Description', 'DistinguishedName', 'Enabled', 'LastLogonTimestamp',
            'whenCreated', 'whenChanged', 'mail', 'proxyAddresses', 'Department',
            'Title', 'Manager', 'employeeID', 'physicalDeliveryOfficeName',
            'telephoneNumber', 'mobile', 'company', 'AccountExpirationDate',
            'PasswordLastSet', 'PasswordNeverExpires', 'CannotChangePassword',
            'PasswordNotRequired', 'msDS-UserPasswordExpiryTimeComputed',
            # Security-critical attributes (v2.0.0)
            'adminCount', 'LastLogon', 'badPwdCount', 'badPasswordTime',
            'userAccountControl', 'objectSid', 'objectGUID', 'servicePrincipalName',
            'msDS-SupportedEncryptionTypes', 'primaryGroupID', 'memberOf', 'LockedOut',
            'PasswordExpired'
        )
        
        # Build filter
        $filter = if ($Configuration.discovery.excludeDisabledUsers) {
            "Enabled -eq `$true"
        } else {
            "*"
        }
        
        $adUsers = Invoke-ADCommandWithRetry -Command {
            Get-ADUser -Filter $filter -Properties $userProperties @ServerParams -ErrorAction Stop
        } -Context $Context
        
        foreach ($user in $adUsers) {
            $userObj = ConvertTo-UserObject -ADUser $user
            $null = $users.Add($userObj)
        }
        
    } catch {
        throw
    }
    
    return $users.ToArray()
}

function Get-ADGroupsData {
    param(
        [hashtable]$Configuration,
        [hashtable]$Context,
        [hashtable]$ServerParams
    )
    
    $groups = [System.Collections.ArrayList]::new()
    $groupMembers = [System.Collections.ArrayList]::new()
    $nestedGroupMembers = [System.Collections.ArrayList]::new()
    
    try {
        $groupProperties = @(
            'SamAccountName', 'Name', 'GroupCategory', 'GroupScope',
            'Description', 'DistinguishedName', 'whenCreated', 'whenChanged',
            'mail', 'ManagedBy', 'member',
            # Security attributes (v2.0.0)
            'objectSid', 'objectGUID', 'adminCount', 'groupType'
        )
        
        $adGroups = Invoke-ADCommandWithRetry -Command {
            Get-ADGroup -Filter * -Properties $groupProperties @ServerParams -ErrorAction Stop
        } -Context $Context

        # Well-known privileged groups (v2.0.0)
        $privilegedGroups = @(
            'Domain Admins', 'Enterprise Admins', 'Schema Admins', 'Administrators',
            'Account Operators', 'Backup Operators', 'Server Operators', 'Print Operators',
            'DNSAdmins', 'Group Policy Creator Owners', 'Cryptographic Operators',
            'Distributed COM Users', 'Network Configuration Operators', 'Performance Log Users',
            'Performance Monitor Users', 'Remote Desktop Users', 'Replicator'
        )
        
        foreach ($group in $adGroups) {
            # Detect privileged groups (v2.0.0)
            $isPrivilegedGroup = if ($group.SamAccountName -in $privilegedGroups -or $group.adminCount -eq 1) { $true } else { $false }

            # Add group object
            $groupObj = [PSCustomObject]@{
                SamAccountName = $group.SamAccountName
                Name = $group.Name
                GroupCategory = $group.GroupCategory
                GroupScope = $group.GroupScope
                Description = $group.Description
                DistinguishedName = $group.DistinguishedName
                CreatedDate = $group.whenCreated
                ModifiedDate = $group.whenChanged
                EmailAddress = $group.mail
                ManagedBy = $group.ManagedBy
                MemberCount = if ($group.member) { $group.member.Count } else { 0 }
                # Security attributes (v2.0.0)
                IsPrivilegedGroup = $isPrivilegedGroup
                AdminCount = $group.adminCount
                ObjectSid = $group.objectSid
                ObjectGUID = $group.objectGUID
                GroupType = $group.groupType
            }
            $null = $groups.Add($groupObj)
            
            # Process group members
            if ($group.member) {
                foreach ($memberDN in $group.member) {
                    try {
                        $memberObj = Get-ADObject -Identity $memberDN -Properties SamAccountName, ObjectClass @ServerParams -ErrorAction Stop
                        
                        $null = $groupMembers.Add([PSCustomObject]@{
                            GroupDN = $group.DistinguishedName
                            GroupName = $group.SamAccountName
                            MemberDN = $memberDN
                            MemberSamAccountName = $memberObj.SamAccountName
                            MemberObjectClass = $memberObj.ObjectClass
                        })
                    } catch {
                        Write-ActiveDirectoryLog -Message "Failed to resolve member '$memberDN' for group '$($group.SamAccountName)': $_" -Level "WARN" -Context $Context
                    }
                }
            }
        }

        # Perform nested group membership expansion (v2.0.0)
        Write-ActiveDirectoryLog -Message "Expanding nested group memberships..." -Level "INFO" -Context $Context
        foreach ($group in $adGroups) {
            try {
                $expandedMembers = Get-ADGroupMembershipExpanded -Group $group -ServerParams $ServerParams -Context $Context
                foreach ($member in $expandedMembers) {
                    $null = $nestedGroupMembers.Add($member)
                }
            } catch {
                Write-ActiveDirectoryLog -Message "Failed to expand nested members for group '$($group.SamAccountName)': $_" -Level "WARN" -Context $Context
            }
        }
        Write-ActiveDirectoryLog -Message "Nested group expansion complete. Total memberships: $($nestedGroupMembers.Count)" -Level "SUCCESS" -Context $Context

    } catch {
        throw
    }

    return @{
        Groups = $groups.ToArray()
        Members = $groupMembers.ToArray()
        NestedMembers = $nestedGroupMembers.ToArray()
    }
}

function Get-ADComputersData {
    param(
        [hashtable]$Configuration,
        [hashtable]$Context,
        [hashtable]$ServerParams
    )
    
    $computers = [System.Collections.ArrayList]::new()
    
    try {
        $computerProperties = @(
            'Name', 'DNSHostName', 'OperatingSystem', 'OperatingSystemVersion',
            'OperatingSystemServicePack', 'Enabled', 'DistinguishedName',
            'whenCreated', 'whenChanged', 'LastLogonTimestamp', 'Description',
            'ManagedBy', 'MemberOf',
            # Security attributes (v2.0.0)
            'servicePrincipalName', 'badPwdCount', 'badPasswordTime',
            'userAccountControl', 'primaryGroupID', 'objectSid', 'objectGUID'
        )

        $adComputers = Invoke-ADCommandWithRetry -Command {
            Get-ADComputer -Filter * -Properties $computerProperties @ServerParams -ErrorAction Stop
        } -Context $Context
        
        foreach ($computer in $adComputers) {
            $computerObj = ConvertTo-ComputerObject -ADComputer $computer
            $null = $computers.Add($computerObj)
        }
        
    } catch {
        throw
    }
    
    return $computers.ToArray()
}

function Get-ADOUsData {
    param(
        [hashtable]$Configuration,
        [hashtable]$Context,
        [hashtable]$ServerParams
    )
    
    $ous = [System.Collections.ArrayList]::new()
    
    try {
        $ouProperties = @(
            'Name', 'DistinguishedName', 'Description', 'whenCreated', 'whenChanged',
            'ManagedBy', 'ProtectedFromAccidentalDeletion'
        )
        
        $adOUs = Get-ADOrganizationalUnit -Filter * -Properties $ouProperties @ServerParams -ErrorAction Stop
        
        foreach ($ou in $adOUs) {
            $ouObj = [PSCustomObject]@{
                Name = $ou.Name
                DistinguishedName = $ou.DistinguishedName
                Description = $ou.Description
                CreatedDate = $ou.whenCreated
                ModifiedDate = $ou.whenChanged
                ManagedBy = $ou.ManagedBy
                ProtectedFromAccidentalDeletion = $ou.ProtectedFromAccidentalDeletion
            }
            $null = $ous.Add($ouObj)
        }
        
    } catch {
        throw
    }
    
    return $ous.ToArray()
}

function ConvertTo-UserObject {
    param([Microsoft.ActiveDirectory.Management.ADUser]$ADUser)
    
    $lastLogonDate = if ($ADUser.LastLogonTimestamp -and $ADUser.LastLogonTimestamp -gt 0) {
        try { [datetime]::FromFileTime($ADUser.LastLogonTimestamp) } catch { $null }
    } else { $null }
    
    # Password expiry calculation
    $passwordExpiryDate = Get-PasswordExpiryDate -User $ADUser

    # Security attributes (v2.0.0)
    $uac = $ADUser.userAccountControl

    # Detect privileged accounts
    $isPrivileged = if ($ADUser.adminCount -eq 1) { $true } else { $false }

    # Calculate days since last logon
    $lastLogon = if ($ADUser.LastLogonTimestamp) {
        try { [DateTime]::FromFileTime($ADUser.LastLogonTimestamp) } catch { $null }
    } else { $null }
    $daysSinceLastLogon = if ($lastLogon) { ([DateTime]::Now - $lastLogon).Days } else { $null }

    # Decode userAccountControl flags
    $isDisabled = if ($uac -band 0x0002) { $true } else { $false }
    $passwordNotRequired = if ($uac -band 0x0020) { $true } else { $false }
    $dontExpirePassword = if ($uac -band 0x10000) { $true } else { $false }
    $smartcardRequired = if ($uac -band 0x40000) { $true } else { $false }
    $delegationPermitted = if (-not ($uac -band 0x100000)) { $true } else { $false }
    $useDesKeyOnly = if ($uac -band 0x200000) { $true } else { $false }
    $dontReqPreauth = if ($uac -band 0x400000) { $true } else { $false }

    # Kerberos delegation type
    $delegationType = 'None'
    if ($ADUser.servicePrincipalName -and $uac) {
        if ($uac -band 0x80000) {
            $delegationType = 'Unconstrained'
        } elseif ($uac -band 0x1000000) {
            $delegationType = 'Constrained'
        }
    }

    return [PSCustomObject]@{
        SamAccountName = $ADUser.SamAccountName
        UserPrincipalName = $ADUser.UserPrincipalName
        DisplayName = $ADUser.DisplayName
        Enabled = $ADUser.Enabled
        LastLogonDate = $lastLogonDate
        PasswordExpiryDate = $passwordExpiryDate
        PasswordNeverExpires = $ADUser.PasswordNeverExpires
        PasswordLastSet = $ADUser.PasswordLastSet
        GivenName = $ADUser.GivenName
        Surname = $ADUser.Surname
        Description = $ADUser.Description
        DistinguishedName = $ADUser.DistinguishedName
        CreatedDate = $ADUser.whenCreated
        ModifiedDate = $ADUser.whenChanged
        EmailAddress = $ADUser.mail
        ProxyAddresses = ($ADUser.proxyAddresses -join ';')
        Department = $ADUser.Department
        Title = $ADUser.Title
        Manager = $ADUser.Manager
        EmployeeID = $ADUser.employeeID
        Office = $ADUser.physicalDeliveryOfficeName
        TelephoneNumber = $ADUser.telephoneNumber
        MobileNumber = $ADUser.mobile
        Company = $ADUser.company
        AccountExpirationDate = $ADUser.AccountExpirationDate
        CannotChangePassword = $ADUser.CannotChangePassword
        PasswordNotRequired = $ADUser.PasswordNotRequired
        # Security attributes (v2.0.0)
        IsPrivileged = $isPrivileged
        AdminCount = $ADUser.adminCount
        DaysSinceLastLogon = $daysSinceLastLogon
        BadPwdCount = $ADUser.badPwdCount
        BadPasswordTime = $ADUser.badPasswordTime
        UserAccountControl = $uac
        IsDisabled = $isDisabled
        PasswordNotRequiredFlag = $passwordNotRequired
        DontExpirePassword = $dontExpirePassword
        SmartcardRequired = $smartcardRequired
        DelegationPermitted = $delegationPermitted
        UseDesKeyOnly = $useDesKeyOnly
        DontReqPreauth = $dontReqPreauth
        KerberosDelegationType = $delegationType
        ServicePrincipalNames = ($ADUser.servicePrincipalName -join ';')
        ObjectSid = $ADUser.objectSid
        ObjectGUID = $ADUser.objectGUID
        LockedOut = $ADUser.LockedOut
        PasswordExpired = $ADUser.PasswordExpired
        MemberOfCount = if ($ADUser.memberOf) { $ADUser.memberOf.Count } else { 0 }
        MemberOfGroups = if ($ADUser.memberOf) { ($ADUser.memberOf -join ';') } else { '' }
    }
}

function ConvertTo-ComputerObject {
    param([Microsoft.ActiveDirectory.Management.ADComputer]$ADComputer)

    $lastLogonDate = if ($ADComputer.LastLogonTimestamp -and $ADComputer.LastLogonTimestamp -gt 0) {
        try { [datetime]::FromFileTime($ADComputer.LastLogonTimestamp) } catch { $null }
    } else { $null }

    # Server role detection from SPNs (v2.0.0)
    $spns = $ADComputer.servicePrincipalName
    $roles = @()
    if ($spns) {
        if ($spns -match 'MSSQLSvc') { $roles += 'SQL Server' }
        if ($spns -match 'HTTP') { $roles += 'Web Server' }
        if ($spns -match 'TERMSRV') { $roles += 'Terminal Server' }
        if ($spns -match 'kadmin/changepw') { $roles += 'Domain Controller' }
        if ($spns -match 'E3514235-4B06-11D1-AB04-00C04FC2DCD2') { $roles += 'Domain Controller' }
    }
    $serverRoles = if ($roles.Count -gt 0) { $roles -join '; ' } else { 'None' }

    # Detect if this is a server OS
    $isServer = if ($ADComputer.OperatingSystem -match 'Server') { $true } else { $false }

    return [PSCustomObject]@{
        Name = $ADComputer.Name
        DNSHostName = $ADComputer.DNSHostName
        OperatingSystem = $ADComputer.OperatingSystem
        OperatingSystemVersion = $ADComputer.OperatingSystemVersion
        OperatingSystemServicePack = $ADComputer.OperatingSystemServicePack
        Enabled = $ADComputer.Enabled
        DistinguishedName = $ADComputer.DistinguishedName
        CreatedDate = $ADComputer.whenCreated
        ModifiedDate = $ADComputer.whenChanged
        LastLogonDate = $lastLogonDate
        Description = $ADComputer.Description
        ManagedBy = $ADComputer.ManagedBy
        MemberOfGroupsCount = if ($ADComputer.MemberOf) { $ADComputer.MemberOf.Count } else { 0 }
        # Security attributes (v2.0.0)
        IsServer = $isServer
        ServerRoles = $serverRoles
        ServicePrincipalNames = ($spns -join ';')
        BadPwdCount = $ADComputer.badPwdCount
        BadPasswordTime = $ADComputer.badPasswordTime
        UserAccountControl = $ADComputer.userAccountControl
        ObjectSid = $ADComputer.objectSid
        ObjectGUID = $ADComputer.objectGUID
    }
}

function Get-PasswordExpiryDate {
    param([Microsoft.ActiveDirectory.Management.ADUser]$User)
    
    if ($User.PasswordNeverExpires) {
        return "Never (Policy)"
    }
    
    $expiryTime = $User.'msDS-UserPasswordExpiryTimeComputed'
    
    if (-not $expiryTime) {
        return "Not Set"
    }
    
    if ($expiryTime -eq 0) {
        return "Must Change at Next Logon"
    }
    
    if ($expiryTime -eq [long]::MaxValue) {
        return "Never (Computed)"
    }
    
    if ($expiryTime -lt 0) {
        return "Invalid"
    }
    
    try {
        return [datetime]::FromFileTime($expiryTime)
    } catch {
        return "Conversion Error"
    }
}

function Get-ADTrustsData {
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [hashtable]$Context,
        [hashtable]$ServerParams
    )
    
    $trusts = @()
    try {
        $domainTrusts = Get-ADTrust -Filter * @ServerParams
        foreach ($trust in $domainTrusts) {
            $trusts += [PSCustomObject]@{
                Source = $trust.Source
                Target = $trust.Target
                Direction = $trust.Direction
                TrustType = $trust.TrustType
                TrustAttributes = $trust.TrustAttributes
                SelectiveAuthentication = $trust.SelectiveAuthentication
                SIDFilteringForestAware = $trust.SIDFilteringForestAware
                SIDFilteringQuarantined = $trust.SIDFilteringQuarantined
                UplevelOnly = $trust.UplevelOnly
                UsesRC4Encryption = $trust.UsesRC4Encryption
                UsesAESKeys = $trust.UsesAESKeys
                TGTDelegation = $trust.TGTDelegation
                TrustedPolicy = $trust.TrustedPolicy
                TrustingPolicy = $trust.TrustingPolicy
                CreatedDate = $trust.whenCreated
                ModifiedDate = $trust.whenChanged
                DistinguishedName = $trust.DistinguishedName
            }
        }
    } catch {
        Write-ActiveDirectoryLog -Level "WARN" -Message "Could not retrieve trust information: $($_.Exception.Message)"
    }
    return $trusts
}

function Get-ADSitesData {
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [hashtable]$Context,
        [hashtable]$ServerParams
    )
    
    $sites = @()
    try {
        $adSites = Get-ADReplicationSite -Filter * @ServerParams
        foreach ($site in $adSites) {
            $siteLinks = Get-ADReplicationSiteLink -Filter "SitesIncluded -eq '$($site.DistinguishedName)'" @ServerParams -ErrorAction SilentlyContinue
            $subnets = Get-ADReplicationSubnet -Filter "Site -eq '$($site.DistinguishedName)'" @ServerParams -ErrorAction SilentlyContinue
            
            $sites += [PSCustomObject]@{
                Name = $site.Name
                Description = $site.Description
                Location = $site.Location
                ManagedBy = $site.ManagedBy
                CreatedDate = $site.whenCreated
                ModifiedDate = $site.whenChanged
                DistinguishedName = $site.DistinguishedName
                InterSiteTopologyGenerator = $site.InterSiteTopologyGenerator
                SiteLinkCount = if ($siteLinks) { $siteLinks.Count } else { 0 }
                SubnetCount = if ($subnets) { $subnets.Count } else { 0 }
                SiteLinks = if ($siteLinks) { ($siteLinks.Name -join '; ') } else { 'None' }
                AssignedSubnets = if ($subnets) { ($subnets.Name -join '; ') } else { 'None' }
            }
        }
    } catch {
        Write-ActiveDirectoryLog -Level "WARN" -Message "Could not retrieve site information: $($_.Exception.Message)"
    }
    return $sites
}

function Get-ADSubnetsData {
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [hashtable]$Context,
        [hashtable]$ServerParams
    )
    
    $subnets = @()
    try {
        $adSubnets = Get-ADReplicationSubnet -Filter * @ServerParams
        foreach ($subnet in $adSubnets) {
            $subnets += [PSCustomObject]@{
                Name = $subnet.Name
                Site = $subnet.Site
                Description = $subnet.Description
                Location = $subnet.Location
                CreatedDate = $subnet.whenCreated
                ModifiedDate = $subnet.whenChanged
                DistinguishedName = $subnet.DistinguishedName
            }
        }
    } catch {
        Write-ActiveDirectoryLog -Level "WARN" -Message "Could not retrieve subnet information: $($_.Exception.Message)"
    }
    return $subnets
}

function Get-ADFSMORolesData {
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [hashtable]$Context,
        [hashtable]$ServerParams
    )
    
    $fsmoRoles = @()
    try {
        $domain = Get-ADDomain @ServerParams
        $forest = Get-ADForest @ServerParams
        
        # Domain-level FSMO roles
        $fsmoRoles += [PSCustomObject]@{
            RoleName = "PDC Emulator"
            RoleLevel = "Domain"
            RoleHolder = $domain.PDCEmulator
            Domain = $domain.DNSRoot
            Forest = $forest.Name
            OperationMasterRole = "PDCEmulator"
        }
        
        $fsmoRoles += [PSCustomObject]@{
            RoleName = "RID Master"
            RoleLevel = "Domain"
            RoleHolder = $domain.RIDMaster
            Domain = $domain.DNSRoot
            Forest = $forest.Name
            OperationMasterRole = "RIDMaster"
        }
        
        $fsmoRoles += [PSCustomObject]@{
            RoleName = "Infrastructure Master"
            RoleLevel = "Domain"
            RoleHolder = $domain.InfrastructureMaster
            Domain = $domain.DNSRoot
            Forest = $forest.Name
            OperationMasterRole = "InfrastructureMaster"
        }
        
        # Forest-level FSMO roles
        $fsmoRoles += [PSCustomObject]@{
            RoleName = "Schema Master"
            RoleLevel = "Forest"
            RoleHolder = $forest.SchemaMaster
            Domain = $domain.DNSRoot
            Forest = $forest.Name
            OperationMasterRole = "SchemaMaster"
        }
        
        $fsmoRoles += [PSCustomObject]@{
            RoleName = "Domain Naming Master"
            RoleLevel = "Forest"
            RoleHolder = $forest.DomainNamingMaster
            Domain = $domain.DNSRoot
            Forest = $forest.Name
            OperationMasterRole = "DomainNamingMaster"
        }
        
    } catch {
        Write-ActiveDirectoryLog -Level "WARN" -Message "Could not retrieve FSMO role information: $($_.Exception.Message)"
    }
    return $fsmoRoles
}

function Get-ADDomainControllersData {
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [hashtable]$Context,
        [hashtable]$ServerParams
    )
    
    $domainControllers = @()
    try {
        $dcs = Get-ADDomainController -Filter * @ServerParams
        foreach ($dc in $dcs) {
            $domainControllers += [PSCustomObject]@{
                Name = $dc.Name
                HostName = $dc.HostName
                IPv4Address = $dc.IPv4Address
                IPv6Address = $dc.IPv6Address
                Domain = $dc.Domain
                Forest = $dc.Forest
                Site = $dc.Site
                OperatingSystem = $dc.OperatingSystem
                OperatingSystemVersion = $dc.OperatingSystemVersion
                OperatingSystemServicePack = $dc.OperatingSystemServicePack
                IsGlobalCatalog = $dc.IsGlobalCatalog
                IsReadOnly = $dc.IsReadOnly
                Enabled = $dc.Enabled
                LdapPort = $dc.LdapPort
                SslPort = $dc.SslPort
                Partitions = ($dc.Partitions -join '; ')
                ServerObjectDN = $dc.ServerObjectDN
                ServerObjectGuid = $dc.ServerObjectGuid
                ComputerObjectDN = $dc.ComputerObjectDN
                NTDSSettingsObjectDN = $dc.NTDSSettingsObjectDN
                DefaultPartition = $dc.DefaultPartition
                InvocationId = $dc.InvocationId
            }
        }
    } catch {
        Write-ActiveDirectoryLog -Level "WARN" -Message "Could not retrieve domain controller information: $($_.Exception.Message)"
    }
    return $domainControllers
}

# --- Module Export ---
Export-ModuleMember -Function Invoke-ActiveDirectoryDiscovery

#region M&A Enhancements (Non-breaking): Export-DiscoveryResultsEnhanced
# This wrapper enriches discovery objects with additional, optional metadata
# before delegating to the standard Export-DiscoveryResults. Authentication flows
# and discovery logic remain untouched.
function Export-DiscoveryResultsEnhanced {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [System.Collections.IEnumerable] $Data,
        [Parameter(Mandatory=$true)]
        [string] $OutputDirectory,
        [Parameter(Mandatory=$true)]
        [string] $ModuleName,
        [Parameter(Mandatory=$false)]
        [string] $SessionId,
        [Parameter(Mandatory=$false)]
        [string] $FilePrefix = $null
    )

    # Local helper: attempts to enrich an object in a conservative, additive way.
    function Add-EnhancedMetadata {
        param([object]$obj)

        # Title / Description
        $titleCandidates = @(
            $obj.Title,
            $obj.DisplayName,
            $obj.Name,
            $obj.ComputerName,
            $obj.ServerName,
            $obj.ResourceGroupName,
            $obj.Id
        ) | Where-Object { $_ -and ($_.ToString().Trim() -ne '') }
        $descCandidates = @(
            $obj.Description,
            $obj.Notes,
            $obj.Comment,
            $obj.Summary
        ) | Where-Object { $_ -and ($_.ToString().Trim() -ne '') }

        if (-not ($obj.PSObject.Properties.Name -contains 'Title')) {
            $t = $null
            foreach ($c in $titleCandidates) { if ($c) { $t = $c; break } }
            if ($t) { Add-Member -InputObject $obj -NotePropertyName 'Title' -NotePropertyValue $t -Force }
            else     { Add-Member -InputObject $obj -NotePropertyName 'Title' -NotePropertyValue '' -Force }
        }
        if (-not ($obj.PSObject.Properties.Name -contains 'Description')) {
            $d = $null
            foreach ($c in $descCandidates) { if ($c) { $d = $c; break } }
            if ($d) { Add-Member -InputObject $obj -NotePropertyName 'Description' -NotePropertyValue $d -Force }
            else     { Add-Member -InputObject $obj -NotePropertyName 'Description' -NotePropertyValue '' -Force }
        }

        # Protocols / Ports (heuristics: Protocol property, URL scheme, known fields)
        if (-not ($obj.PSObject.Properties.Name -contains 'Protocols')) {
            $protocols = New-Object System.Collections.Generic.HashSet[string]
            foreach ($propName in @('Protocol','Protocols','Scheme','Transport','DiscoveryProtocol')) {
                if ($obj.PSObject.Properties.Name -contains $propName) {
                    $val = $obj.$propName
                    if ($val) {
                        foreach ($p in ($val -split '[,;/\s]+' | Where-Object { $_ })) { [void]$protocols.Add(($p.ToString()).ToUpper()) }
                    }
                }
            }
            foreach ($propName in @('Url','URL','Uri','URI','Endpoint','Address')) {
                if ($obj.PSObject.Properties.Name -contains $propName) {
                    $v = $obj.$propName
                    if ($v) {
                        try {
                            $u = [Uri]$v
                            if ($u.Scheme) { [void]$protocols.Add($u.Scheme.ToUpper()) }
                        } catch {}
                    }
                }
            }
            $protoOut = if ($protocols.Count -gt 0) { ($protocols.ToArray() -join ', ') } else { '' }
            Add-Member -InputObject $obj -NotePropertyName 'Protocols' -NotePropertyValue $protoOut -Force
        }

        if (-not ($obj.PSObject.Properties.Name -contains 'Ports')) {
            $ports = New-Object System.Collections.Generic.HashSet[string]
            foreach ($propName in @('Port','Ports','TcpPort','UdpPort','ServicePort','ListenPort')) {
                if ($obj.PSObject.Properties.Name -contains $propName) {
                    $val = $obj.$propName
                    if ($val) {
                        foreach ($p in ($val -split '[,;/\s]+' | Where-Object { $_ })) {
                            if ($p -match '^\d{1,5}$') { [void]$ports.Add($p) }
                        }
                    }
                }
            }
            foreach ($propName in @('Url','URL','Uri','URI','Endpoint','Address')) {
                if ($obj.PSObject.Properties.Name -contains $propName) {
                    $v = $obj.$propName
                    if ($v) {
                        try {
                            $u = [Uri]$v
                            if ($u.Port -and $u.Port -gt 0) { [void]$ports.Add(($u.Port).ToString()) }
                        } catch {}
                    }
                }
            }
            $portOut = if ($ports.Count -gt 0) { ($ports.ToArray() | Sort-Object {[int]$_}) -join ', ' } else { '' }
            Add-Member -InputObject $obj -NotePropertyName 'Ports' -NotePropertyValue $portOut -Force
        }

        # AuthRequired (heuristic based on presence of "Everyone"/"Anonymous" in permissions-like fields)
        if (-not ($obj.PSObject.Properties.Name -contains 'AuthRequired')) {
            $auth = $null
            foreach ($propName in @('RequiresAuthentication','AuthRequired','Authentication','Access','Permissions','SharePermissions','Acl','Security')) {
                if ($obj.PSObject.Properties.Name -contains $propName) {
                    $val = $obj.$propName
                    if ($val) {
                        $s = $val.ToString()
                        if ($s -match '(Everyone|Anonymous|Guest)') { $auth = $false }
                        elseif ($s -ne '') { $auth = $true }
                    }
                }
            }
            if ($null -eq $auth) { $auth = '' } # unknown
            Add-Member -InputObject $obj -NotePropertyName 'AuthRequired' -NotePropertyValue $auth -Force
        }

        return $obj
    }

    # Materialize and enrich all items conservatively
    $dataArray = @()
    foreach ($item in $Data) {
        if ($null -ne $item) {
            $dataArray += (Add-EnhancedMetadata -obj $item)
        }
    }

    # Delegate to standard exporter if available; otherwise fallback to Export-Csv for each _DataType group
    if (Get-Command -Name Export-DiscoveryResults -ErrorAction SilentlyContinue) {
Export-DiscoveryResultsEnhanced -Data $dataArray -OutputDirectory $OutputDirectory -ModuleName $ModuleName -SessionId $SessionId -FilePrefix $FilePrefix
    } else {
        # Fallback: mimic grouping behavior without changing existing file names too much
        $groups = $dataArray | Group-Object -Property _DataType
        foreach ($g in $groups) {
            $type = if ($g.Name) { $g.Name } else { 'Data' }
            $prefix = if ($FilePrefix) { $FilePrefix } else { $ModuleName }
            $file = Join-Path $OutputDirectory ("{0}_{1}.csv" -f $prefix,$type)
            $g.Group | Export-Csv -NoTypeInformation -Encoding UTF8 -Path $file
        }
    }
}
# New Enhanced Discovery Functions

function Get-ADSiteLinksData {
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [hashtable]$Context,
        [hashtable]$ServerParams
    )
    
    $siteLinks = @()
    try {
        Write-ActiveDirectoryLog -Level "DEBUG" -Message "Querying AD site links..." -Context $Context
        
        $adSiteLinks = Get-ADReplicationSiteLink -Filter * @ServerParams | Select-Object -Property *
        
        foreach ($siteLink in $adSiteLinks) {
            $obj = [PSCustomObject]@{
                Name = $siteLink.Name
                Cost = $siteLink.Cost
                ReplicationFrequencyInMinutes = $siteLink.ReplicationFrequencyInMinutes
                SitesIncluded = ($siteLink.SitesIncluded -join ', ')
                InterSiteTransportProtocol = $siteLink.InterSiteTransportProtocol
                Description = $siteLink.Description
                Created = $siteLink.Created
                Modified = $siteLink.Modified
                DistinguishedName = $siteLink.DistinguishedName
            }
            $siteLinks += $obj
        }
        
        Write-ActiveDirectoryLog -Level "DEBUG" -Message "Retrieved $($siteLinks.Count) site links" -Context $Context
    }
    catch {
        Write-ActiveDirectoryLog -Level "WARN" -Message "Failed to get site links: $($_.Exception.Message)" -Context $Context
    }
    
    return $siteLinks
}

function Get-ADPasswordPoliciesData {
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [hashtable]$Context,
        [hashtable]$ServerParams
    )
    
    $policies = @()
    try {
        Write-ActiveDirectoryLog -Level "DEBUG" -Message "Querying password policies..." -Context $Context
        
        # Default Domain Policy
        $defaultPolicy = Get-ADDefaultDomainPasswordPolicy @ServerParams
        if ($defaultPolicy) {
            $obj = [PSCustomObject]@{
                PolicyType = "Default Domain Policy"
                MinPasswordLength = $defaultPolicy.MinPasswordLength
                MaxPasswordAge = $defaultPolicy.MaxPasswordAge.Days
                MinPasswordAge = $defaultPolicy.MinPasswordAge.Days
                PasswordHistoryCount = $defaultPolicy.PasswordHistoryCount
                ComplexityEnabled = $defaultPolicy.ComplexityEnabled
                ReversibleEncryptionEnabled = $defaultPolicy.ReversibleEncryptionEnabled
                LockoutThreshold = $defaultPolicy.LockoutThreshold
                LockoutDuration = if ($defaultPolicy.LockoutDuration.TotalMinutes -eq 0) { "Until Admin Unlocks" } else { "$($defaultPolicy.LockoutDuration.TotalMinutes) minutes" }
                LockoutObservationWindow = "$($defaultPolicy.LockoutObservationWindow.TotalMinutes) minutes"
                DistinguishedName = (Get-ADDomain @ServerParams).DistinguishedName
            }
            $policies += $obj
        }
        
        # Fine-Grained Password Policies
        try {
            $fgPolicies = Get-ADFineGrainedPasswordPolicy -Filter * @ServerParams | Select-Object -Property *
            foreach ($fgPolicy in $fgPolicies) {
                $obj = [PSCustomObject]@{
                    PolicyType = "Fine-Grained Policy"
                    Name = $fgPolicy.Name
                    MinPasswordLength = $fgPolicy.MinPasswordLength
                    MaxPasswordAge = $fgPolicy.MaxPasswordAge.Days
                    MinPasswordAge = $fgPolicy.MinPasswordAge.Days
                    PasswordHistoryCount = $fgPolicy.PasswordHistoryCount
                    ComplexityEnabled = $fgPolicy.ComplexityEnabled
                    ReversibleEncryptionEnabled = $fgPolicy.ReversibleEncryptionEnabled
                    LockoutThreshold = $fgPolicy.LockoutThreshold
                    LockoutDuration = if ($fgPolicy.LockoutDuration.TotalMinutes -eq 0) { "Until Admin Unlocks" } else { "$($fgPolicy.LockoutDuration.TotalMinutes) minutes" }
                    LockoutObservationWindow = "$($fgPolicy.LockoutObservationWindow.TotalMinutes) minutes"
                    Precedence = $fgPolicy.Precedence
                    AppliesTo = ($fgPolicy.AppliesTo -join '; ')
                    DistinguishedName = $fgPolicy.DistinguishedName
                }
                $policies += $obj
            }
        } catch {
            Write-ActiveDirectoryLog -Level "DEBUG" -Message "No fine-grained password policies found or insufficient permissions" -Context $Context
        }
        
        Write-ActiveDirectoryLog -Level "DEBUG" -Message "Retrieved $($policies.Count) password policies" -Context $Context
    }
    catch {
        Write-ActiveDirectoryLog -Level "WARN" -Message "Failed to get password policies: $($_.Exception.Message)" -Context $Context
    }
    
    return $policies
}

function Get-ADServiceAccountsData {
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [hashtable]$Context,
        [hashtable]$ServerParams
    )
    
    $serviceAccounts = @()
    try {
        Write-ActiveDirectoryLog -Level "DEBUG" -Message "Identifying service accounts and special accounts..." -Context $Context
        
        # Get all users with service account indicators
        $users = Get-ADUser -Filter * -Properties * @ServerParams | Where-Object {
            $_.ServicePrincipalNames.Count -gt 0 -or 
            $_.Name -like "*service*" -or 
            $_.Name -like "*svc*" -or
            $_.SamAccountName -like "*service*" -or
            $_.SamAccountName -like "*svc*" -or
            $_.Description -like "*service*" -or
            $_.UserPrincipalName -like "*service*" -or
            $_.PasswordNeverExpires -eq $true -or
            ($_.MemberOf | Where-Object { $_ -match "service|admin|privileged" })
        }
        
        foreach ($user in $users) {
            $obj = [PSCustomObject]@{
                Name = $user.Name
                SamAccountName = $user.SamAccountName
                UserPrincipalName = $user.UserPrincipalName
                AccountType = if ($user.ServicePrincipalNames.Count -gt 0) { "Service Account (SPN)" } else { "Potential Service Account" }
                Enabled = $user.Enabled
                PasswordNeverExpires = $user.PasswordNeverExpires
                PasswordLastSet = $user.PasswordLastSet
                LastLogonDate = $user.LastLogonDate
                ServicePrincipalNames = ($user.ServicePrincipalNames -join '; ')
                MemberOfGroups = (($user.MemberOf | ForEach-Object { (Get-ADGroup $_ @ServerParams).Name }) -join '; ')
                Description = $user.Description
                Department = $user.Department
                Title = $user.Title
                Manager = if ($user.Manager) { (Get-ADUser $user.Manager @ServerParams).Name } else { "" }
                Created = $user.Created
                DistinguishedName = $user.DistinguishedName
                RiskLevel = if ($user.ServicePrincipalNames.Count -gt 0 -and $user.PasswordNeverExpires) { "HIGH" } 
                          elseif ($user.ServicePrincipalNames.Count -gt 0) { "MEDIUM" } else { "LOW" }
            }
            $serviceAccounts += $obj
        }
        
        Write-ActiveDirectoryLog -Level "DEBUG" -Message "Identified $($serviceAccounts.Count) service/special accounts" -Context $Context
    }
    catch {
        Write-ActiveDirectoryLog -Level "WARN" -Message "Failed to identify service accounts: $($_.Exception.Message)" -Context $Context
    }
    
    return $serviceAccounts
}

#endregion M&A Enhancements (Non-breaking): Export-DiscoveryResultsEnhanced

