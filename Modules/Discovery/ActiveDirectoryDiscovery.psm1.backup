# -*- coding: utf-8-bom -*-
#Requires -Modules ActiveDirectory, DnsServer

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-06
# Last Modified: 2025-06-06
# Change Log: Updated version control header

<#
.SYNOPSIS
    Enhanced Active Directory Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Provides comprehensive Active Directory discovery with improved error handling,
    simplified null checks, and context-based operations.
.NOTES
    Version: 2.0.0
    Enhanced: 2025-01-03
#>

# Import shared utilities

# Module-scope context variable
$script:ModuleContext = $null

# Lazy initialization function
function Get-ModuleContext {
    if ($null -eq $script:ModuleContext) {
        if ($null -ne $global:MandA) {
            $script:ModuleContext = $global:MandA
        } else {
            throw "Module context not available"
        }
    }
    return $script:ModuleContext
}

# Enhanced error handling functions with retry logic and batch processing
function Test-ADDiscoveryPrerequisites {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [DiscoveryResult]$Result,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    Write-MandALog "Validating AD Discovery prerequisites..." -Level "INFO" -Context $Context
    
    try {
        # Validate Active Directory module
        if (-not (Get-Module -Name ActiveDirectory -ListAvailable)) {
            $Result.AddError("ActiveDirectory PowerShell module is not available", $null, @{
                Prerequisite = 'ActiveDirectory Module'
                Resolution = 'Install RSAT or ActiveDirectory PowerShell module'
            })
            return
        }
        
        # Import the module if not already loaded
        if (-not (Get-Module -Name ActiveDirectory)) {
            Import-Module ActiveDirectory -ErrorAction Stop
            Write-MandALog "ActiveDirectory module imported successfully" -Level "DEBUG" -Context $Context
        }
        
        # Validate connectivity to domain controller
        $targetServer = $Configuration.environment.globalCatalog
        if (-not $targetServer) { $targetServer = $Configuration.environment.domainController }
        
        if ($targetServer) {
            Write-MandALog "Testing connectivity to AD server: $targetServer" -Level "DEBUG" -Context $Context
            
            # Use Invoke-WithRetry for connectivity test
            $connectivityTest = Invoke-WithRetry -ScriptBlock {
                Test-Connection -ComputerName $targetServer -Count 1 -Quiet -ErrorAction Stop
            } -MaxRetries 3 -DelaySeconds 2 -OperationName "AD Connectivity Test" -Context $Context
            
            if (-not $connectivityTest) {
                $Result.AddError("Cannot reach AD server: $targetServer", $null, @{
                    Prerequisite = 'Network Connectivity'
                    TargetServer = $targetServer
                    Resolution = 'Check network connectivity, DNS resolution, and firewall settings'
                })
                return
            }
            
            Write-MandALog "Successfully connected to AD server: $targetServer" -Level "SUCCESS" -Context $Context
        }
        
        # Test AD authentication
        try {
            $testDomain = Get-ADDomain -ErrorAction Stop
            Write-MandALog "Successfully authenticated to domain: $($testDomain.DNSRoot)" -Level "SUCCESS" -Context $Context
            $Result.Metadata['DomainDNSRoot'] = $testDomain.DNSRoot
            $Result.Metadata['DomainNetBIOSName'] = $testDomain.NetBIOSName
        }
        catch {
            $Result.AddError("Failed to authenticate to Active Directory", $_.Exception, @{
                Prerequisite = 'AD Authentication'
                Resolution = 'Check credentials and domain membership'
            })
            return
        }
        
        Write-MandALog "All AD Discovery prerequisites validated successfully" -Level "SUCCESS" -Context $Context
        
    }
    catch {
        $Result.AddError("Unexpected error during prerequisites validation", $_.Exception, @{
            Prerequisite = 'General Validation'
        })
    }
}

function Get-ADUsersWithErrorHandling {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    $users = [System.Collections.ArrayList]::new()
    $batchSize = if ($Configuration.discovery.batchSize) { $Configuration.discovery.batchSize } else { 1000 }
    $retryCount = 0
    $maxRetries = 3
    
    # Get total count first for progress tracking
    $totalCount = 0
    try {
        $serverParams = Get-ServerParameters -Configuration $Configuration
        $totalCount = (Get-ADUser -Filter * @serverParams -ResultSetSize $null).Count
        Write-MandALog "Found $totalCount total AD users to process" -Level "INFO" -Context $Context
    }
    catch {
        Write-MandALog "Could not get total user count: $_" -Level "WARN" -Context $Context
    }
    
    # Process in batches with retry logic
    $processedCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            $userProperties = @(
                'SamAccountName', 'UserPrincipalName', 'GivenName', 'Surname', 'DisplayName',
                'Description', 'DistinguishedName', 'Enabled', 'LastLogonTimestamp',
                'whenCreated', 'whenChanged', 'mail', 'proxyAddresses', 'Department',
                'Title', 'Manager', 'employeeID', 'physicalDeliveryOfficeName',
                'telephoneNumber', 'mobile', 'company', 'AccountExpirationDate',
                'PasswordLastSet', 'PasswordNeverExpires', 'CannotChangePassword',
                'PasswordNotRequired', 'msDS-UserPasswordExpiryTimeComputed'
            )
            
            # Build filter based on discovery scope
            $filter = BuildADFilter -Configuration $Configuration -ObjectType "User"
            $serverParams = Get-ServerParameters -Configuration $Configuration
            
            # Use paging for large directories
            $pageSize = [Math]::Min($batchSize, 1000)
            $adUsers = Get-ADUser -Filter $filter -Properties $userProperties @serverParams -ResultPageSize $pageSize -ErrorAction Stop
            
            # Process results with individual error handling
            foreach ($user in $adUsers) {
                try {
                    $userObj = ConvertTo-UserObject -ADUser $user -Context $Context
                    $null = $users.Add($userObj)
                    $processedCount++
                    
                    # Progress update every 100 users
                    if ($processedCount % 100 -eq 0) {
                        Write-MandALog "Processed $processedCount/$totalCount users" -Level "PROGRESS" -Context $Context
                    }
                }
                catch {
                    Write-MandALog "Error processing user at index $processedCount`: $_" -Level "WARN" -Context $Context
                    # Continue processing other users
                }
            }
            
            # Export data
            if ($users.Count -gt 0) {
                Export-DataToCSV -Data $users -FilePath (Join-Path (Get-ModuleContext).Paths.RawDataOutput "ADUsers.csv") -Context $Context
            }
            
            # Success - exit retry loop
            break
        }
        catch {
            $retryCount++
            if ($retryCount -ge $maxRetries) {
                throw "Failed to retrieve AD users after $maxRetries attempts: $_"
            }
            
            $waitTime = [Math]::Pow(2, $retryCount) * 2  # Exponential backoff
            Write-MandALog "AD user query failed (attempt $retryCount/$maxRetries). Waiting $waitTime seconds..." -Level "WARN" -Context $Context
            Start-Sleep -Seconds $waitTime
        }
    }
    
    return $users.ToArray()
}

function Get-ADGroupsWithErrorHandling {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    $groups = [System.Collections.ArrayList]::new()
    $groupMembers = [System.Collections.ArrayList]::new()
    $batchSize = if ($Configuration.discovery.batchSize) { $Configuration.discovery.batchSize } else { 1000 }
    $retryCount = 0
    $maxRetries = 3
    
    while ($retryCount -lt $maxRetries) {
        try {
            $groupProperties = @(
                'SamAccountName', 'Name', 'GroupCategory', 'GroupScope',
                'Description', 'DistinguishedName', 'whenCreated', 'whenChanged',
                'mail', 'ManagedBy', 'member'
            )
            
            $serverParams = Get-ServerParameters -Configuration $Configuration
            $pageSize = [Math]::Min($batchSize, 1000)
            $adGroups = Get-ADGroup -Filter * -Properties $groupProperties @serverParams -ResultPageSize $pageSize -ErrorAction Stop
            
            $processedCount = 0
            foreach ($group in $adGroups) {
                try {
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
                    }
                    $null = $groups.Add($groupObj)
                    
                    # Process group members with error handling
                    if ($group.member) {
                        Process-GroupMembersWithErrorHandling -Group $group -Members $group.member -MembersList $groupMembers -ServerParams $serverParams -Context $Context
                    }
                    
                    $processedCount++
                    if ($processedCount % 50 -eq 0) {
                        Write-MandALog "Processed $processedCount groups" -Level "PROGRESS" -Context $Context
                    }
                }
                catch {
                    Write-MandALog "Error processing group '$($group.SamAccountName)': $_" -Level "WARN" -Context $Context
                    # Continue with other groups
                }
            }
            
            # Export data
            if ($groups.Count -gt 0) {
                Export-DataToCSV -Data $groups -FilePath (Join-Path (Get-ModuleContext).Paths.RawDataOutput "ADGroups.csv") -Context $Context
            }
            if ($groupMembers.Count -gt 0) {
                Export-DataToCSV -Data $groupMembers -FilePath (Join-Path (Get-ModuleContext).Paths.RawDataOutput "ADGroupMembers.csv") -Context $Context
            }
            
            # Success - exit retry loop
            break
        }
        catch {
            $retryCount++
            if ($retryCount -ge $maxRetries) {
                throw "Failed to retrieve AD groups after $maxRetries attempts: $_"
            }
            
            $waitTime = [Math]::Pow(2, $retryCount) * 2  # Exponential backoff
            Write-MandALog "AD group query failed (attempt $retryCount/$maxRetries). Waiting $waitTime seconds..." -Level "WARN" -Context $Context
            Start-Sleep -Seconds $waitTime
        }
    }
    
    return @{
        Groups = $groups.ToArray()
        Members = $groupMembers.ToArray()
    }
}

function Process-GroupMembersWithErrorHandling {
    param(
        $Group,
        $Members,
        $MembersList,
        $ServerParams,
        $Context
    )
    
    foreach ($memberDN in $Members) {
        try {
            # Use retry logic for member resolution
            $memberObj = Invoke-WithRetry -ScriptBlock {
                Get-ADObject -Identity $memberDN -Properties SamAccountName, ObjectClass @ServerParams -ErrorAction Stop
            } -MaxRetries 2 -DelaySeconds 1 -OperationName "Resolve Group Member" -Context $Context
            
            if ($memberObj) {
                $null = $MembersList.Add([PSCustomObject]@{
                    GroupDN = $Group.DistinguishedName
                    GroupName = $Group.SamAccountName
                    MemberDN = $memberDN
                    MemberSamAccountName = $memberObj.SamAccountName
                    MemberObjectClass = $memberObj.ObjectClass
                })
            }
        }
        catch {
            Write-MandALog "Failed to resolve member '$memberDN' for group '$($Group.SamAccountName)': $_" -Level "WARN" -Context $Context
            # Continue with other members
        }
    }
}

function Get-ADComputersWithErrorHandling {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    $computers = [System.Collections.ArrayList]::new()
    $batchSize = if ($Configuration.discovery.batchSize) { $Configuration.discovery.batchSize } else { 1000 }
    $retryCount = 0
    $maxRetries = 3
    
    while ($retryCount -lt $maxRetries) {
        try {
            $computerProperties = @(
                'Name', 'DNSHostName', 'OperatingSystem', 'OperatingSystemVersion',
                'OperatingSystemServicePack', 'Enabled', 'DistinguishedName',
                'whenCreated', 'whenChanged', 'LastLogonTimestamp', 'Description',
                'ManagedBy', 'MemberOf'
            )
            
            $serverParams = Get-ServerParameters -Configuration $Configuration
            $pageSize = [Math]::Min($batchSize, 1000)
            $adComputers = Get-ADComputer -Filter * -Properties $computerProperties @serverParams -ResultPageSize $pageSize -ErrorAction Stop
            
            $processedCount = 0
            foreach ($computer in $adComputers) {
                try {
                    $computerObj = ConvertTo-ComputerObject -ADComputer $computer -Context $Context
                    $null = $computers.Add($computerObj)
                    $processedCount++
                    
                    if ($processedCount % 100 -eq 0) {
                        Write-MandALog "Processed $processedCount computers" -Level "PROGRESS" -Context $Context
                    }
                }
                catch {
                    Write-MandALog "Error processing computer '$($computer.Name)': $_" -Level "WARN" -Context $Context
                    # Continue with other computers
                }
            }
            
            # Export data
            if ($computers.Count -gt 0) {
                Export-DataToCSV -Data $computers -FilePath (Join-Path (Get-ModuleContext).Paths.RawDataOutput "ADComputers.csv") -Context $Context
            }
            
            # Success - exit retry loop
            break
        }
        catch {
            $retryCount++
            if ($retryCount -ge $maxRetries) {
                throw "Failed to retrieve AD computers after $maxRetries attempts: $_"
            }
            
            $waitTime = [Math]::Pow(2, $retryCount) * 2  # Exponential backoff
            Write-MandALog "AD computer query failed (attempt $retryCount/$maxRetries). Waiting $waitTime seconds..." -Level "WARN" -Context $Context
            Start-Sleep -Seconds $waitTime
        }
    }
    
    return $computers.ToArray()
}

function Get-ADOUsWithErrorHandling {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    $ous = [System.Collections.ArrayList]::new()
    $retryCount = 0
    $maxRetries = 3
    
    while ($retryCount -lt $maxRetries) {
        try {
            $ouProperties = @(
                'Name', 'DistinguishedName', 'Description', 'whenCreated', 'whenChanged',
                'ManagedBy', 'ProtectedFromAccidentalDeletion'
            )
            
            $serverParams = Get-ServerParameters -Configuration $Configuration
            $adOUs = Get-ADOrganizationalUnit -Filter * -Properties $ouProperties @serverParams -ErrorAction Stop
            
            foreach ($ou in $adOUs) {
                try {
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
                catch {
                    Write-MandALog "Error processing OU '$($ou.Name)': $_" -Level "WARN" -Context $Context
                    # Continue with other OUs
                }
            }
            
            # Export data
            if ($ous.Count -gt 0) {
                Export-DataToCSV -Data $ous -FilePath (Join-Path (Get-ModuleContext).Paths.RawDataOutput "ADOrganizationalUnits.csv") -Context $Context
            }
            
            # Success - exit retry loop
            break
        }
        catch {
            $retryCount++
            if ($retryCount -ge $maxRetries) {
                throw "Failed to retrieve AD organizational units after $maxRetries attempts: $_"
            }
            
            $waitTime = [Math]::Pow(2, $retryCount) * 2  # Exponential backoff
            Write-MandALog "AD OU query failed (attempt $retryCount/$maxRetries). Waiting $waitTime seconds..." -Level "WARN" -Context $Context
            Start-Sleep -Seconds $waitTime
        }
    }
    
    return $ous.ToArray()
}

# Legacy function for backward compatibility
function Get-ADUsersDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    Write-MandALog "Starting AD Users Discovery..." -Level "INFO" -Context $Context
    $allUsers = [System.Collections.Generic.List[PSObject]]::new()
    
    # Determine server parameters
    $serverParams = @{}
    if ($Configuration.environment.globalCatalog) {
        $serverParams.Server = $Configuration.environment.globalCatalog
    } elseif ($Configuration.environment.domainController) {
        $serverParams.Server = $Configuration.environment.domainController
    }
    
    try {
        $userProperties = @(
            'SamAccountName', 'UserPrincipalName', 'GivenName', 'Surname', 'DisplayName',
            'Description', 'DistinguishedName', 'Enabled', 'LastLogonTimestamp',
            'whenCreated', 'whenChanged', 'mail', 'proxyAddresses', 'Department',
            'Title', 'Manager', 'employeeID', 'physicalDeliveryOfficeName',
            'telephoneNumber', 'mobile', 'company', 'AccountExpirationDate',
            'PasswordLastSet', 'PasswordNeverExpires', 'CannotChangePassword',
            'PasswordNotRequired', 'msDS-UserPasswordExpiryTimeComputed'
        )
        
        # Build filter based on discovery scope
        $filter = BuildADFilter -Configuration $Configuration -ObjectType "User"
        
        $adUsers = Get-ADUser -Filter $filter -Properties $userProperties @serverParams -ErrorAction Stop
        
        if ($adUsers) {
            foreach ($user in $adUsers) {
                $userObj = ConvertTo-UserObject -ADUser $user -Context $Context
                $allUsers.Add($userObj)
            }
            
            # Export data
            Export-DataToCSV -Data $allUsers -FilePath (Join-Path (Get-ModuleContext).Paths.RawDataOutput "ADUsers.csv") -Context $Context
            
            Write-MandALog "Discovered $($allUsers.Count) AD users" -Level "SUCCESS" -Context $Context
        } else {
            Write-MandALog "No AD users found with current filter" -Level "WARN" -Context $Context
        }
    }
    catch {
        $Context.ErrorCollector.AddError("ADUsers", "Failed to discover AD users", $_.Exception)
        Write-MandALog "Error during AD Users Discovery: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    
    return $allUsers
}

function ConvertTo-UserObject {
    param(
        [Microsoft.ActiveDirectory.Management.ADUser]$ADUser,
        $Context
    )
    
    # Simplified null checks and conversions
    $lastLogonDate = if ($ADUser.LastLogonTimestamp -and $ADUser.LastLogonTimestamp -gt 0) {
        try { [datetime]::FromFileTime($ADUser.LastLogonTimestamp) } catch { $null }
    } else { $null }
    
    # Password expiry calculation
    $passwordExpiryDate = Get-PasswordExpiryDate -User $ADUser -Context $Context
    
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
    }
}

function Get-PasswordExpiryDate {
    param(
        [Microsoft.ActiveDirectory.Management.ADUser]$User,
        $Context
    )
    
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
        $Context.ErrorCollector.AddWarning("ADUsers", "Invalid password expiry time for user: $($User.SamAccountName)")
        return "Invalid"
    }
    
    try {
        return [datetime]::FromFileTime($expiryTime)
    }
    catch {
        $Context.ErrorCollector.AddWarning("ADUsers", "Failed to convert password expiry time for user: $($User.SamAccountName)")
        return "Conversion Error"
    }
}

function Get-ADGroupsDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    Write-MandALog "Starting AD Groups Discovery..." -Level "INFO" -Context $Context
    $allGroups = [System.Collections.Generic.List[PSObject]]::new()
    $allGroupMembers = [System.Collections.Generic.List[PSObject]]::new()
    
    $serverParams = Get-ServerParameters -Configuration $Configuration
    
    try {
        $groupProperties = @(
            'SamAccountName', 'Name', 'GroupCategory', 'GroupScope',
            'Description', 'DistinguishedName', 'whenCreated', 'whenChanged',
            'mail', 'ManagedBy', 'member'
        )
        
        $adGroups = Get-ADGroup -Filter * -Properties $groupProperties @serverParams -ErrorAction Stop
        
        if ($adGroups) {
            foreach ($group in $adGroups) {
                # Add group object
                $allGroups.Add([PSCustomObject]@{
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
                })
                
                # Process group members
                if ($group.member) {
                    Process-GroupMembers -Group $group -Members $group.member -MembersList $allGroupMembers -ServerParams $serverParams -Context $Context
                }
            }
            
            # Export data
            Export-DataToCSV -Data $allGroups -FilePath (Join-Path (Get-ModuleContext).Paths.RawDataOutput "ADGroups.csv") -Context $Context
            Export-DataToCSV -Data $allGroupMembers -FilePath (Join-Path (Get-ModuleContext).Paths.RawDataOutput "ADGroupMembers.csv") -Context $Context
            
            Write-MandALog "Discovered $($allGroups.Count) AD groups with $($allGroupMembers.Count) total memberships" -Level "SUCCESS" -Context $Context
        }
    }
    catch {
        $Context.ErrorCollector.AddError("ADGroups", "Failed to discover AD groups", $_.Exception)
        Write-MandALog "Error during AD Groups Discovery: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    
    return @{
        Groups = $allGroups
        Members = $allGroupMembers
    }
}

function Process-GroupMembers {
    param(
        $Group,
        $Members,
        $MembersList,
        $ServerParams,
        $Context
    )
    
    foreach ($memberDN in $Members) {
        try {
            $memberObj = Get-ADObject -Identity $memberDN -Properties SamAccountName, ObjectClass @ServerParams -ErrorAction Stop
            
            if ($memberObj) {
                $MembersList.Add([PSCustomObject]@{
                    GroupDN = $Group.DistinguishedName
                    GroupName = $Group.SamAccountName
                    MemberDN = $memberDN
                    MemberSamAccountName = $memberObj.SamAccountName
                    MemberObjectClass = $memberObj.ObjectClass
                })
            }
        }
        catch {
            $Context.ErrorCollector.AddWarning("ADGroups", "Failed to resolve member '$memberDN' for group '$($Group.SamAccountName)'")
        }
    }
}

function Get-ADComputersDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    Write-MandALog "Starting AD Computers Discovery..." -Level "INFO" -Context $Context
    $allComputers = [System.Collections.Generic.List[PSObject]]::new()
    
    $serverParams = Get-ServerParameters -Configuration $Configuration
    
    try {
        $computerProperties = @(
            'Name', 'DNSHostName', 'OperatingSystem', 'OperatingSystemVersion',
            'OperatingSystemServicePack', 'Enabled', 'DistinguishedName',
            'whenCreated', 'whenChanged', 'LastLogonTimestamp', 'Description',
            'ManagedBy', 'MemberOf'
        )
        
        $adComputers = Get-ADComputer -Filter * -Properties $computerProperties @serverParams -ErrorAction Stop
        
        if ($adComputers) {
            foreach ($computer in $adComputers) {
                $computerObj = ConvertTo-ComputerObject -ADComputer $computer -Context $Context
                $allComputers.Add($computerObj)
            }
            
            Export-DataToCSV -Data $allComputers -FilePath (Join-Path (Get-ModuleContext).Paths.RawDataOutput "ADComputers.csv") -Context $Context
            
            Write-MandALog "Discovered $($allComputers.Count) AD computers" -Level "SUCCESS" -Context $Context
        }
    }
    catch {
        $Context.ErrorCollector.AddError("ADComputers", "Failed to discover AD computers", $_.Exception)
        Write-MandALog "Error during AD Computers Discovery: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    
    return $allComputers
}

function ConvertTo-ComputerObject {
    param(
        [Microsoft.ActiveDirectory.Management.ADComputer]$ADComputer,
        $Context
    )
    
    $lastLogonDate = if ($ADComputer.LastLogonTimestamp -and $ADComputer.LastLogonTimestamp -gt 0) {
        try { [datetime]::FromFileTime($ADComputer.LastLogonTimestamp) } catch { $null }
    } else { $null }
    
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
    }
}

function Get-ADSitesAndServicesDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    Write-MandALog "Starting AD Sites and Services Discovery" -Level "INFO" -Context $Context
    
    $result = @{
        Sites = [System.Collections.Generic.List[PSObject]]::new()
        SiteLinks = [System.Collections.Generic.List[PSObject]]::new()
        Subnets = [System.Collections.Generic.List[PSObject]]::new()
    }
    
    $serverParams = Get-ServerParameters -Configuration $Configuration
    
    try {
        # Discover Sites
        $sites = Get-ADReplicationSite -Filter * -Properties * @serverParams -ErrorAction Stop
        
        foreach ($site in $sites) {
            $siteObj = Process-ADSite -Site $site -ServerParams $serverParams -Context $Context
            $result.Sites.Add($siteObj)
        }
        
        # Discover Site Links
        $siteLinks = Get-ADReplicationSiteLink -Filter * @serverParams -ErrorAction Stop
        
        foreach ($siteLink in $siteLinks) {
            $result.SiteLinks.Add([PSCustomObject]@{
                Name = $siteLink.Name
                DistinguishedName = $siteLink.DistinguishedName
                Cost = $siteLink.Cost
                ReplicationFrequencyInMinutes = $siteLink.ReplicationFrequencyInMinutes
                SitesIncluded = ($siteLink.SitesIncluded | ForEach-Object { $_.Name }) -join ';'
                Description = $siteLink.Description
            })
        }
        
        # Discover Subnets
        $subnets = Get-ADReplicationSubnet -Filter * -Properties Site @serverParams -ErrorAction Stop
        
        foreach ($subnet in $subnets) {
            $result.Subnets.Add([PSCustomObject]@{
                Name = $subnet.Name
                DistinguishedName = $subnet.DistinguishedName
                Location = $subnet.Location
                Site = if ($subnet.Site) { $subnet.Site.Name } else { $null }
            })
        }
        
        # Export data
        Export-DataToCSV -Data $result.Sites -FilePath (Join-Path (Get-ModuleContext).Paths.RawDataOutput "ADSites.csv") -Context $Context
        Export-DataToCSV -Data $result.SiteLinks -FilePath (Join-Path (Get-ModuleContext).Paths.RawDataOutput "ADSiteLinks.csv") -Context $Context
        Export-DataToCSV -Data $result.Subnets -FilePath (Join-Path (Get-ModuleContext).Paths.RawDataOutput "ADSubnets.csv") -Context $Context
        
        Write-MandALog "Discovered $($result.Sites.Count) sites, $($result.SiteLinks.Count) site links, $($result.Subnets.Count) subnets" -Level "SUCCESS" -Context $Context
    }
    catch {
        $Context.ErrorCollector.AddError("ADSitesServices", "Failed to discover AD Sites and Services", $_.Exception)
        Write-MandALog "Error during AD Sites/Services Discovery: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    
    return $result
}

function Process-ADSite {
    param($Site, $ServerParams, $Context)
    
    # Count domain controllers in site
    $dcCount = 0
    try {
        if ($ServerParams.ContainsKey('Server')) {
            $allDCs = Get-ADDomainController -Filter * @ServerParams -ErrorAction Stop
            $dcCount = @($allDCs | Where-Object { $_.Site -eq $Site.Name }).Count
        } else {
            $siteDCs = Get-ADDomainController -Site $Site.Name -ErrorAction Stop
            $dcCount = @($siteDCs).Count
        }
    }
    catch {
        $Context.ErrorCollector.AddWarning("ADSites", "Could not count DCs for site: $($Site.Name)")
    }
    
    # Count servers in site
    $serverCount = 0
    try {
        $filter = { userAccountControl -band 8192 -eq 0 }  # Non-DC computers
        $servers = Get-ADComputer -Filter $filter -SearchBase $Site.DistinguishedName @ServerParams -ErrorAction Stop
        $serverCount = @($servers).Count
    }
    catch {
        # SearchBase might not work for sites, this is expected
    }
    
    return [PSCustomObject]@{
        SiteName = $Site.Name
        DistinguishedName = $Site.DistinguishedName
        Location = $Site.Location
        Description = $Site.Description
        DomainControllersInSiteCount = $dcCount
        ServersInSiteCount = $serverCount
        InterSiteTopologyGenerator = Test-SiteOption -Site $Site -Option 'IntersiteTopologyGenerator'
        GroupMembershipCaching = Test-SiteOption -Site $Site -Option 'GroupMembershipCaching'
    }
}

function Get-ADDNSZoneDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    Write-MandALog "Starting AD DNS Zone Discovery" -Level "INFO" -Context $Context
    
    $result = @{
        Zones = [System.Collections.Generic.List[PSObject]]::new()
        Records = [System.Collections.Generic.List[PSObject]]::new()
    }
    
    # Check if DnsServer module is available
    if (-not (Get-Module -Name DnsServer -ListAvailable)) {
        Write-MandALog "DnsServer module not available. Skipping DNS Discovery." -Level "WARN" -Context $Context
        return $result
    }
    
    # Determine DNS server
    $dnsServer = Get-TargetDNSServer -Configuration $Configuration
    $dnsServerParams = if ($dnsServer) { @{ComputerName = $dnsServer} } else { @{} }
    
    try {
        $zones = Get-DnsServerZone @dnsServerParams -ErrorAction Stop
        
        foreach ($zone in $zones) {
            $zoneObj = ConvertTo-DNSZoneObject -Zone $zone
            $result.Zones.Add($zoneObj)
            
            # Check if detailed records should be collected
            if (Should-CollectZoneDetails -ZoneName $zone.ZoneName -Configuration $Configuration) {
                Collect-DNSRecords -Zone $zone -RecordsList $result.Records -ServerParams $dnsServerParams -Context $Context
            }
        }
        
        # Export data
        Export-DataToCSV -Data $result.Zones -FilePath (Join-Path (Get-ModuleContext).Paths.RawDataOutput "ADDNSZones.csv") -Context $Context
        
        if ($result.Records.Count -gt 0) {
            Export-DataToCSV -Data $result.Records -FilePath (Join-Path (Get-ModuleContext).Paths.RawDataOutput "ADDNSRecords_Detailed.csv") -Context $Context
        }
        
        Write-MandALog "Discovered $($result.Zones.Count) DNS zones with $($result.Records.Count) detailed records" -Level "SUCCESS" -Context $Context
    }
    catch {
        $Context.ErrorCollector.AddError("ADDNS", "Failed to discover DNS zones", $_.Exception)
        Write-MandALog "Error during DNS Zone Discovery: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    
    return $result
}

# Helper Functions
function Get-ServerParameters {
    param([hashtable]$Configuration)
    
    $params = @{}
    
    if ($Configuration.environment.globalCatalog) {
        $params.Server = $Configuration.environment.globalCatalog
    } elseif ($Configuration.environment.domainController) {
        $params.Server = $Configuration.environment.domainController
    }
    
    return $params
}

function BuildADFilter {
    param(
        [hashtable]$Configuration,
        [string]$ObjectType
    )
    
    # Start with base filter
    $filter = "*"
    
    # Add scope-based filtering if configured
    if ($Configuration.discovery.discoveryScope) {
        # This is a simplified example - expand based on your needs
        if ($ObjectType -eq "User" -and $Configuration.discovery.excludeDisabledUsers) {
            $filter = "Enabled -eq `$true"
        }
    }
    
    return $filter
}

function Test-SiteOption {
    param($Site, [string]$Option)
    
    if (-not $Site.Options) { return $false }
    
    try {
        $optionValue = [Microsoft.ActiveDirectory.Management.ADReplicationSiteOptions]::$Option
        return ($Site.Options -band $optionValue) -as [bool]
    }
    catch {
        return $false
    }
}

function Get-TargetDNSServer {
    param([hashtable]$Configuration)
    
    if ($Configuration.discovery.adDns.dnsServer) {
        return $Configuration.discovery.adDns.dnsServer
    } elseif ($Configuration.environment.globalCatalog) {
        return $Configuration.environment.globalCatalog
    } elseif ($Configuration.environment.domainController) {
        return $Configuration.environment.domainController
    }
    
    return $null
}

function Should-CollectZoneDetails {
    param(
        [string]$ZoneName,
        [hashtable]$Configuration
    )
    
    $detailedZones = $Configuration.discovery.adDns.detailedZones
    
    if (-not $detailedZones) { return $false }
    
    return ($detailedZones -contains $ZoneName) -or ($detailedZones -contains "*")
}

function ConvertTo-DNSZoneObject {
    param($Zone)
    
    $replicationScope = if ($Zone.IsDsIntegrated -and $Zone.ReplicationScope) {
        try { $Zone.ReplicationScope.ToString() } catch { "Unknown" }
    } else { "N/A" }
    
    return [PSCustomObject]@{
        ZoneName = $Zone.ZoneName
        ZoneType = $Zone.ZoneType.ToString()
        IsReverseLookupZone = $Zone.IsReverseLookupZone
        IsDsIntegrated = $Zone.IsDsIntegrated
        IsSigned = $Zone.IsSigned
        DynamicUpdate = $Zone.DynamicUpdate.ToString()
        ReplicationScope = $replicationScope
    }
}

function Collect-DNSRecords {
    param($Zone, $RecordsList, $ServerParams, $Context)
    
    try {
        $records = Get-DnsServerResourceRecord -ZoneName $Zone.ZoneName @ServerParams -RRType All -ErrorAction Stop
        
        foreach ($record in $records) {
            $recordObj = ConvertTo-DNSRecordObject -Record $record -ZoneName $Zone.ZoneName
            $RecordsList.Add($recordObj)
        }
    }
    catch {
        $Context.ErrorCollector.AddWarning("ADDNS", "Failed to collect records for zone: $($Zone.ZoneName)")
    }
}

function ConvertTo-DNSRecordObject {
    param($Record, [string]$ZoneName)
    
    $recordData = switch ($Record.RecordType) {
        "A" { $Record.RecordData.IPV4Address.IPAddressToString }
        "AAAA" { $Record.RecordData.IPV6Address.IPAddressToString }
        "CNAME" { $Record.RecordData.HostNameAlias }
        "MX" { "Preference=$($Record.RecordData.Preference); Exchange=$($Record.RecordData.MailExchange)" }
        "NS" { $Record.RecordData.NameServer }
        "PTR" { $Record.RecordData.PtrDomainName }
        "SOA" { 
            "PrimaryServer=$($Record.RecordData.PrimaryServer); " +
            "ResponsiblePerson=$($Record.RecordData.ResponsiblePerson); " +
            "SerialNumber=$($Record.RecordData.SerialNumber)"
        }
        "SRV" { 
            "Target=$($Record.RecordData.DomainName); " +
            "Port=$($Record.RecordData.Port); " +
            "Priority=$($Record.RecordData.Priority); " +
            "Weight=$($Record.RecordData.Weight)"
        }
        "TXT" { ($Record.RecordData.DescriptiveText -join '; ') }
        default { "Type: $($Record.RecordType)" }
    }
    
    return [PSCustomObject]@{
        ZoneName = $ZoneName
        HostName = $Record.HostName
        RecordType = $Record.RecordType.ToString()
        Timestamp = $Record.Timestamp
        TimeToLive = $Record.TimeToLive.ToString()
        RecordData = $recordData
    }
}

# Helper function for CSV export with error handling
function Export-DataToCSV {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [System.Collections.IEnumerable]$Data,
        [Parameter(Mandatory=$true)]
        [string]$FilePath,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    try {
        if ($Data -and @($Data).Count -gt 0) {
            # Ensure directory exists
            $directory = Split-Path -Path $FilePath -Parent
            if (-not (Test-Path -Path $directory)) {
                New-Item -Path $directory -ItemType Directory -Force | Out-Null
                Write-MandALog "Created directory: $directory" -Level "DEBUG" -Context $Context
            }
            
            # Export to CSV with error handling
            $Data | Export-Csv -Path $FilePath -NoTypeInformation -Encoding UTF8 -ErrorAction Stop
            Write-MandALog "Successfully exported $(@($Data).Count) records to: $FilePath" -Level "DEBUG" -Context $Context
        } else {
            Write-MandALog "No data to export for: $FilePath" -Level "WARN" -Context $Context
        }
    }
    catch {
        Write-MandALog "Failed to export data to CSV: $FilePath. Error: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        if ($Context.ErrorCollector) {
            $Context.ErrorCollector.AddWarning("DataExport", "Failed to export data to: $FilePath")
        }
    }
}
# Main exported function
function Invoke-ActiveDirectoryDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    # Initialize result object using the DiscoveryResult class
    $result = [DiscoveryResult]::new('ActiveDirectory')
    
    # Set up error handling preferences
    $originalErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Stop'
    
    try {
        # Create minimal context if not provided (backward compatibility)
        if (-not $Context) {
            $Context = @{
                ErrorCollector = [PSCustomObject]@{
                    AddError = { param($s,$m,$e) Write-Warning "Error in $s`: $m" }
                    AddWarning = { param($s,$m) Write-Warning "Warning in $s`: $m" }
                }
                Paths = @{
                    RawDataOutput = Join-Path $Configuration.environment.outputPath "Raw"
                }
            }
        }
        
        Write-MandALog "--- Starting Active Directory Discovery Phase (v2.0.0) ---" -Level "HEADER" -Context $Context
        
        # Validate prerequisites
        Test-ADDiscoveryPrerequisites -Configuration $Configuration -Result $result -Context $Context
        
        if (-not $result.Success) {
            Write-MandALog "Prerequisites check failed, aborting AD discovery" -Level "ERROR" -Context $Context
            return $result
        }
        
        # Main discovery logic with nested error handling
        $adData = @{
            Users = @()
            Groups = @()
            GroupMembers = @()
            Computers = @()
            OUs = @()
            SitesAndServices = @{}
            DNSInfo = @{}
        }
        
        # Discover Users with specific error handling
        try {
            Write-MandALog "Discovering AD Users..." -Level "INFO" -Context $Context
            $adData.Users = Get-ADUsersWithErrorHandling -Configuration $Configuration -Context $Context
            $result.Metadata['UserCount'] = $adData.Users.Count
            Write-MandALog "Successfully discovered $($adData.Users.Count) AD users" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover AD users",
                $_.Exception,
                @{
                    Operation = 'Get-ADUser'
                    DomainController = $Configuration.environment.domainController
                    Filter = $Configuration.discovery.userFilter
                }
            )
            Write-MandALog "Error discovering AD users: $($_.Exception.Message)" -Level "ERROR" -Context $Context
            # Continue with other discoveries even if users fail
        }
        
        # Discover Groups with specific error handling
        try {
            Write-MandALog "Discovering AD Groups..." -Level "INFO" -Context $Context
            $groupData = Get-ADGroupsWithErrorHandling -Configuration $Configuration -Context $Context
            $adData.Groups = $groupData.Groups
            $adData.GroupMembers = $groupData.Members
            $result.Metadata['GroupCount'] = $adData.Groups.Count
            $result.Metadata['GroupMembershipCount'] = $adData.GroupMembers.Count
            Write-MandALog "Successfully discovered $($adData.Groups.Count) AD groups with $($adData.GroupMembers.Count) memberships" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover AD groups",
                $_.Exception,
                @{
                    Operation = 'Get-ADGroup'
                    DomainController = $Configuration.environment.domainController
                }
            )
            Write-MandALog "Error discovering AD groups: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Discover Computers with specific error handling
        try {
            Write-MandALog "Discovering AD Computers..." -Level "INFO" -Context $Context
            $adData.Computers = Get-ADComputersWithErrorHandling -Configuration $Configuration -Context $Context
            $result.Metadata['ComputerCount'] = $adData.Computers.Count
            Write-MandALog "Successfully discovered $($adData.Computers.Count) AD computers" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover AD computers",
                $_.Exception,
                @{
                    Operation = 'Get-ADComputer'
                    DomainController = $Configuration.environment.domainController
                }
            )
            Write-MandALog "Error discovering AD computers: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Discover OUs with specific error handling
        try {
            Write-MandALog "Discovering AD Organizational Units..." -Level "INFO" -Context $Context
            $adData.OUs = Get-ADOUsWithErrorHandling -Configuration $Configuration -Context $Context
            $result.Metadata['OUCount'] = $adData.OUs.Count
            Write-MandALog "Successfully discovered $($adData.OUs.Count) AD organizational units" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover AD organizational units",
                $_.Exception,
                @{
                    Operation = 'Get-ADOrganizationalUnit'
                    DomainController = $Configuration.environment.domainController
                }
            )
            Write-MandALog "Error discovering AD OUs: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Discover Sites and Services with specific error handling
        try {
            Write-MandALog "Discovering AD Sites and Services..." -Level "INFO" -Context $Context
            $adData.SitesAndServices = Get-ADSitesAndServicesDataInternal -Configuration $Configuration -Context $Context
            $result.Metadata['SiteCount'] = $adData.SitesAndServices.Sites.Count
            Write-MandALog "Successfully discovered AD Sites and Services" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover AD sites and services",
                $_.Exception,
                @{
                    Operation = 'Get-ADReplicationSite'
                    DomainController = $Configuration.environment.domainController
                }
            )
            Write-MandALog "Error discovering AD Sites and Services: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Discover DNS Information with specific error handling
        try {
            Write-MandALog "Discovering AD DNS Information..." -Level "INFO" -Context $Context
            $adData.DNSInfo = Get-ADDNSZoneDataInternal -Configuration $Configuration -Context $Context
            $result.Metadata['DNSZoneCount'] = $adData.DNSInfo.Zones.Count
            Write-MandALog "Successfully discovered AD DNS information" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover AD DNS information",
                $_.Exception,
                @{
                    Operation = 'Get-DnsServerZone'
                    DomainController = $Configuration.environment.domainController
                }
            )
            Write-MandALog "Error discovering AD DNS: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Set the data even if partially successful
        $result.Data = $adData
        
        # Determine overall success based on critical data
        if ($adData.Users.Count -eq 0 -and $adData.Groups.Count -eq 0 -and $adData.Computers.Count -eq 0) {
            $result.Success = $false
            $result.AddError("No critical data retrieved from Active Directory")
            Write-MandALog "AD Discovery failed - no critical data retrieved" -Level "ERROR" -Context $Context
        } else {
            Write-MandALog "--- Active Directory Discovery Phase Completed Successfully ---" -Level "SUCCESS" -Context $Context
        }
        
    }
    catch {
        # Catch-all for unexpected errors
        $result.AddError(
            "Unexpected error in AD discovery",
            $_.Exception,
            @{
                ErrorPoint = 'Main Discovery Block'
                LastOperation = $MyInvocation.MyCommand.Name
            }
        )
        Write-MandALog "Unexpected error in AD Discovery: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    finally {
        # Always execute cleanup
        $ErrorActionPreference = $originalErrorActionPreference
        $result.Complete()
        
        # Log summary
        Write-MandALog "AD Discovery completed. Success: $($result.Success), Errors: $($result.Errors.Count), Warnings: $($result.Warnings.Count)" -Level "INFO" -Context $Context
        
        # Clean up connections if needed
        try {
            if (Get-Variable -Name 'ADSession' -ErrorAction SilentlyContinue) {
                Remove-Variable -Name 'ADSession' -Force
            }
        }
        catch {
            Write-MandALog "Cleanup warning: $_" -Level "WARN" -Context $Context
        }
    }
    
    return $result
}

# Export module members
Export-ModuleMember -Function @('Invoke-ActiveDirectoryDiscovery')