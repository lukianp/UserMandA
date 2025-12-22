# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Enhanced Microsoft Graph Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Comprehensive Microsoft Graph discovery module providing advanced capabilities for discovering and analyzing 
    Microsoft 365 environments. This module leverages the Microsoft Graph API to discover users, groups, applications, 
    devices, and organizational settings with advanced filtering, batching, and throttling capabilities for 
    large-scale enterprise environments.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, Microsoft.Graph modules, DiscoveryBase module
#>

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

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
    .PARAMETER Configuration
        Configuration hashtable containing TenantId, ClientId, ClientSecret, and/or CertificateThumbprint
    .PARAMETER Result
        Result object for tracking warnings and errors
    .OUTPUTS
        Microsoft.Graph.PowerShell.Authentication.Models.GraphContext or $null if all strategies fail
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [object]$Result
    )

    Write-ModuleLog -ModuleName "GraphAuth" -Message "Attempting Microsoft Graph authentication with multiple strategies..." -Level "INFO"

    # Define Graph-specific scopes
    $graphScopes = @(
        "User.Read.All",
        "Group.Read.All",
        "Application.Read.All",
        "Device.Read.All",
        "Directory.Read.All"
    )

    # Strategy 1: Client Secret Credential (preferred for automation)
    if ($Configuration.TenantId -and $Configuration.ClientId -and $Configuration.ClientSecret) {
        try {
            Write-ModuleLog -ModuleName "GraphAuth" -Message "Strategy 1: Attempting Client Secret authentication..." -Level "INFO"

            $secureSecret = ConvertTo-SecureString $Configuration.ClientSecret -AsPlainText -Force
            $credential = New-Object System.Management.Automation.PSCredential($Configuration.ClientId, $secureSecret)

            Connect-MgGraph -ClientSecretCredential $credential -TenantId $Configuration.TenantId -NoWelcome -ErrorAction Stop

            # Verify connection
            $context = Get-MgContext
            if ($context -and $context.TenantId) {
                Write-ModuleLog -ModuleName "GraphAuth" -Message "Strategy 1: Client Secret authentication successful" -Level "SUCCESS"
                return $context
            }
        } catch {
            Write-ModuleLog -ModuleName "GraphAuth" -Message "Strategy 1: Client Secret auth failed: $($_.Exception.Message)" -Level "WARN"
            $Result.AddWarning("Client Secret authentication failed", @{Error=$_.Exception.Message})
        }
    }

    # Strategy 2: Certificate-Based Authentication (secure, headless)
    if ($Configuration.TenantId -and $Configuration.ClientId -and $Configuration.CertificateThumbprint) {
        try {
            Write-ModuleLog -ModuleName "GraphAuth" -Message "Strategy 2: Attempting Certificate authentication..." -Level "INFO"

            Connect-MgGraph -ClientId $Configuration.ClientId -TenantId $Configuration.TenantId -CertificateThumbprint $Configuration.CertificateThumbprint -NoWelcome -ErrorAction Stop

            # Verify connection
            $context = Get-MgContext
            if ($context -and $context.TenantId) {
                Write-ModuleLog -ModuleName "GraphAuth" -Message "Strategy 2: Certificate authentication successful" -Level "SUCCESS"
                return $context
            }
        } catch {
            Write-ModuleLog -ModuleName "GraphAuth" -Message "Strategy 2: Certificate auth failed: $($_.Exception.Message)" -Level "WARN"
            $Result.AddWarning("Certificate authentication failed", @{Error=$_.Exception.Message})
        }
    }

    # Strategy 3: Device Code Flow (headless-friendly interactive)
    if ($Configuration.TenantId) {
        try {
            Write-ModuleLog -ModuleName "GraphAuth" -Message "Strategy 3: Attempting Device Code authentication..." -Level "INFO"

            Connect-MgGraph -TenantId $Configuration.TenantId -Scopes $graphScopes -UseDeviceCode -NoWelcome -ErrorAction Stop

            # Verify connection
            $context = Get-MgContext
            if ($context -and $context.TenantId) {
                Write-ModuleLog -ModuleName "GraphAuth" -Message "Strategy 3: Device Code authentication successful" -Level "SUCCESS"
                return $context
            }
        } catch {
            Write-ModuleLog -ModuleName "GraphAuth" -Message "Strategy 3: Device Code auth failed: $($_.Exception.Message)" -Level "WARN"
            $Result.AddWarning("Device Code authentication failed", @{Error=$_.Exception.Message})
        }
    }

    # Strategy 4: Interactive Browser Authentication (GUI required - last resort)
    try {
        Write-ModuleLog -ModuleName "GraphAuth" -Message "Strategy 4: Attempting Interactive authentication..." -Level "INFO"

        if ($Configuration.TenantId) {
            Connect-MgGraph -TenantId $Configuration.TenantId -Scopes $graphScopes -NoWelcome -ErrorAction Stop
        } else {
            Connect-MgGraph -Scopes $graphScopes -NoWelcome -ErrorAction Stop
        }

        # Verify connection
        $context = Get-MgContext
        if ($context -and $context.TenantId) {
            Write-ModuleLog -ModuleName "GraphAuth" -Message "Strategy 4: Interactive authentication successful" -Level "SUCCESS"
            return $context
        }
    } catch {
        Write-ModuleLog -ModuleName "GraphAuth" -Message "Strategy 4: Interactive auth failed: $($_.Exception.Message)" -Level "ERROR"
        $Result.AddError("All Microsoft Graph authentication strategies failed", $_.Exception, @{Section="GraphAuthentication"})
    }

    Write-ModuleLog -ModuleName "GraphAuth" -Message "All Graph authentication strategies exhausted" -Level "ERROR"
    return $null
}

function Invoke-GraphDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    # Define discovery script
    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)
        
        $allData = [System.Collections.ArrayList]::new()
        
        try {
            # Discover Users with enhanced fields
            Write-ModuleLog -ModuleName "Graph" -Message "Starting user discovery..." -Level "INFO"
            
            $userFields = @(
                'id', 'userPrincipalName', 'displayName', 'mail', 'mailNickname',
                'givenName', 'surname', 'jobTitle', 'department', 'companyName',
                'officeLocation', 'mobilePhone', 'businessPhones', 'employeeId',
                'employeeType', 'createdDateTime', 'accountEnabled', 'userType',
                'usageLocation', 'assignedLicenses', 'assignedPlans',
                'onPremisesSyncEnabled', 'onPremisesImmutableId',
                'onPremisesSamAccountName', 'onPremisesUserPrincipalName',
                'lastPasswordChangeDateTime', 'passwordPolicies',
                'signInActivity', 'manager'
            )
            
            $uri = "https://graph.microsoft.com/beta/users?`$select=$($userFields -join ',')&`$top=999"
            $uri += "&`$expand=manager(`$select=id,displayName,userPrincipalName)"
            
            $users = Invoke-GraphAPIWithPaging -Uri $uri -ModuleName "Graph"
            
            # Process users
            foreach ($user in $users) {
                $userObj = [PSCustomObject]@{
                    # Core Identity
                    id = $user.id
                    userPrincipalName = $user.userPrincipalName
                    displayName = $user.displayName
                    mail = $user.mail
                    mailNickname = $user.mailNickname
                    
                    # Personal Info
                    givenName = $user.givenName
                    surname = $user.surname
                    jobTitle = $user.jobTitle
                    department = $user.department
                    companyName = $user.companyName
                    employeeId = $user.employeeId
                    employeeType = $user.employeeType
                    
                    # Contact Info
                    officeLocation = $user.officeLocation
                    mobilePhone = $user.mobilePhone
                    businessPhones = ($user.businessPhones -join ';')
                    
                    # Account Status
                    accountEnabled = $user.accountEnabled
                    userType = $user.userType
                    usageLocation = $user.usageLocation
                    createdDateTime = $user.createdDateTime
                    
                    # Licensing
                    assignedLicenses = ($user.assignedLicenses | ForEach-Object { $_.skuId }) -join ';'
                    licenseCount = @($user.assignedLicenses).Count
                    
                    # Sync Status
                    onPremisesSyncEnabled = $user.onPremisesSyncEnabled
                    onPremisesImmutableId = $user.onPremisesImmutableId
                    onPremisesSamAccountName = $user.onPremisesSamAccountName
                    onPremisesUserPrincipalName = $user.onPremisesUserPrincipalName
                    
                    # Security
                    lastPasswordChangeDateTime = $user.lastPasswordChangeDateTime
                    passwordPolicies = $user.passwordPolicies
                    lastSignInDateTime = if ($user.signInActivity) { $user.signInActivity.lastSignInDateTime } else { $null }
                    
                    # Manager
                    managerUPN = if ($user.manager) { $user.manager.userPrincipalName } else { $null }
                    managerId = if ($user.manager) { $user.manager.id } else { $null }
                    managerDisplayName = if ($user.manager) { $user.manager.displayName } else { $null }
                    
                    _DataType = 'User'
                }
                
                $null = $allData.Add($userObj)
            }
            
            Write-ModuleLog -ModuleName "Graph" -Message "Discovered $($users.Count) users" -Level "SUCCESS"
            
            # Export users
            Export-DiscoveryResults -Data ($allData | Where-Object { $_._DataType -eq 'User' }) `
                -FileName "GraphUsers.csv" `
                -OutputPath $Context.Paths.RawDataOutput `
                -ModuleName "Graph" `
                -SessionId $SessionId
            
            # Discover Groups
            Write-ModuleLog -ModuleName "Graph" -Message "Starting group discovery..." -Level "INFO"
            
            $groupFields = @(
                'id', 'displayName', 'mailEnabled', 'mailNickname', 'mail',
                'securityEnabled', 'groupTypes', 'description', 'visibility',
                'createdDateTime', 'membershipRule', 'membershipRuleProcessingState',
                'onPremisesSyncEnabled', 'proxyAddresses', 'classification',
                'isAssignableToRole', 'resourceProvisioningOptions'
            )
            
            $uri = "https://graph.microsoft.com/v1.0/groups?`$select=$($groupFields -join ',')&`$top=999"
            $groups = Invoke-GraphAPIWithPaging -Uri $uri -ModuleName "Graph"
            
            foreach ($group in $groups) {
                $groupType = 'SecurityGroup'
                if ($group.groupTypes -contains 'Unified') { $groupType = 'Microsoft365Group' }
                if ($group.mailEnabled -and -not $group.securityEnabled) { $groupType = 'DistributionList' }
                
                $groupObj = [PSCustomObject]@{
                    id = $group.id
                    displayName = $group.displayName
                    mail = $group.mail
                    mailNickname = $group.mailNickname
                    mailEnabled = $group.mailEnabled
                    securityEnabled = $group.securityEnabled
                    groupType = $groupType
                    groupTypes = ($group.groupTypes -join ';')
                    description = $group.description
                    visibility = $group.visibility
                    classification = $group.classification
                    createdDateTime = $group.createdDateTime
                    membershipRule = $group.membershipRule
                    isDynamic = ($null -ne $group.membershipRule)
                    onPremisesSyncEnabled = $group.onPremisesSyncEnabled
                    proxyAddresses = if ($group.proxyAddresses) { ($group.proxyAddresses -join ';') } else { $null }
                    isAssignableToRole = $group.isAssignableToRole
                    _DataType = 'Group'
                }
                
                $null = $allData.Add($groupObj)
            }
            
            Write-ModuleLog -ModuleName "Graph" -Message "Discovered $($groups.Count) groups" -Level "SUCCESS"
            
            # Export groups
            Export-DiscoveryResults -Data ($allData | Where-Object { $_._DataType -eq 'Group' }) `
                -FileName "GraphGroups.csv" `
                -OutputPath $Context.Paths.RawDataOutput `
                -ModuleName "Graph" `
                -SessionId $SessionId
                
        } catch {
            $Result.AddError("Error during Graph discovery", $_.Exception, @{Phase = "Discovery"})
        }
        
        return $allData
    }

    # Initialize result object
    $result = [PSCustomObject]@{
        Success = $true
        Message = "Graph discovery completed successfully"
        Data = @()
        Errors = @()
        Warnings = @()
    }

    # Helper methods for error/warning tracking
    $result | Add-Member -MemberType ScriptMethod -Name "AddError" -Value {
        param($message, $exception, $context)
        $this.Success = $false
        $this.Errors += [PSCustomObject]@{
            Message = $message
            Exception = $exception
            Context = $context
            Timestamp = Get-Date
        }
        Write-ModuleLog -ModuleName "Graph" -Message $message -Level "ERROR"
    }

    $result | Add-Member -MemberType ScriptMethod -Name "AddWarning" -Value {
        param($message, $context)
        $this.Warnings += [PSCustomObject]@{
            Message = $message
            Context = $context
            Timestamp = Get-Date
        }
        Write-ModuleLog -ModuleName "Graph" -Message $message -Level "WARN"
    }

    try {
        # Direct multi-strategy authentication
        Write-ModuleLog -ModuleName "Graph" -Message "Connecting to Graph service..." -Level "INFO"
        $graphContext = Connect-MgGraphWithMultipleStrategies -Configuration $Configuration -Result $result

        if (-not $graphContext) {
            Write-ModuleLog -ModuleName "Graph" -Message "Session auth failed for Graph. Trying direct credential auth..." -Level "WARN"
            Write-ModuleLog -ModuleName "Graph" -Message "Direct auth failed - missing credentials. TenantId: $([bool]$Configuration.TenantId), ClientId: $([bool]$Configuration.ClientId), ClientSecret: $([bool]$Configuration.ClientSecret)" -Level "ERROR"
            Write-ModuleLog -ModuleName "Graph" -Message "Attempting interactive Graph authentication..." -Level "INFO"

            # Try interactive as final fallback
            try {
                Connect-MgGraph -Scopes "User.Read.All", "Group.Read.All", "Application.Read.All", "Device.Read.All", "Directory.Read.All" -NoWelcome -ErrorAction Stop
                $graphContext = Get-MgContext
                Write-ModuleLog -ModuleName "Graph" -Message "Connected to Graph via interactive authentication successfully" -Level "SUCCESS"
            } catch {
                $result.AddError("All Graph authentication methods failed", $_.Exception, @{Section="Authentication"})
                return $result
            }
        }

        # Execute discovery script with authenticated connection
        Write-ModuleLog -ModuleName "Graph" -Message "Starting Graph discovery..." -Level "INFO"

        # Create connections object for discovery script
        $connections = @{
            Graph = $graphContext
        }

        # Execute the discovery script
        $discoveryData = & $discoveryScript $Configuration $Context $SessionId $connections $result

        if ($result.Success) {
            $result.Data = $discoveryData
            Write-ModuleLog -ModuleName "Graph" -Message "Discovery completed successfully. Discovered $($discoveryData.Count) items." -Level "SUCCESS"
        }

    } catch {
        $result.AddError("Critical error during Graph discovery: $($_.Exception.Message)", $_.Exception, @{Phase="Execution"})
    } finally {
        # Disconnect from Graph
        try {
            Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null
        } catch {
            # Ignore disconnect errors
        }
    }

    return $result
}

Export-ModuleMember -Function Invoke-GraphDiscovery