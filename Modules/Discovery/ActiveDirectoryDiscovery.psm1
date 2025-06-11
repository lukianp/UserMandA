# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

#================================================================================
# M&A Discovery Module: ActiveDirectory
# Description: Discovers Active Directory users, groups, computers, OUs, sites and DNS zones.
#================================================================================

function Get-AuthInfoFromConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    # For on-premises AD, we don't need cloud authentication
    # Return a dummy auth object to satisfy the template
    Write-ActiveDirectoryLog -Message "ActiveDirectory module uses Windows authentication, no cloud credentials needed" -Level "DEBUG"
    return @{
        AuthType = "WindowsIntegrated"
        Domain = $Configuration.environment.domainController
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

    Write-ActiveDirectoryLog -Level "HEADER" -Message "Starting Discovery (v3.0 - Session-based)" -Context $Context
    Write-ActiveDirectoryLog -Level "INFO" -Message "Using authentication session: $SessionId" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # 1. INITIALIZE RESULT OBJECT
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('ActiveDirectory')
    } else {
        # Fallback to hashtable
        $result = @{
            Success      = $true; ModuleName = 'ActiveDirectory'; RecordCount = 0;
            Errors       = [System.Collections.ArrayList]::new(); 
            Warnings     = [System.Collections.ArrayList]::new(); 
            Metadata     = @{};
            StartTime    = Get-Date; EndTime = $null; 
            ExecutionId  = [guid]::NewGuid().ToString();
            AddError     = { param($m, $e, $c) $this.Errors.Add(@{Message=$m; Exception=$e; Context=$c}); $this.Success = $false }.GetNewClosure()
            AddWarning   = { param($m, $c) $this.Warnings.Add(@{Message=$m; Context=$c}) }.GetNewClosure()
            Complete     = { $this.EndTime = Get-Date }.GetNewClosure()
        }
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
        
        Ensure-Path -Path $outputPath

        # 3. VALIDATE MODULE-SPECIFIC CONFIGURATION
        # AD needs domain controller or global catalog
        if (-not $Configuration.environment.domainController -and -not $Configuration.environment.globalCatalog) {
            $result.AddError("No domain controller or global catalog configured", $null, $null)
            return $result
        }

        # 4. AUTHENTICATE & CONNECT
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
        Write-ActiveDirectoryLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Discover Users
        try {
            Write-ActiveDirectoryLog -Level "INFO" -Message "Discovering AD Users..." -Context $Context
            $users = Get-ADUsersData -Configuration $Configuration -Context $Context -ServerParams $serverParams
            if ($users.Count -gt 0) {
                $users | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'User' -Force }
                $null = $allDiscoveredData.AddRange($users)
                $result.Metadata["UserCount"] = $users.Count
            }
            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "Discovered $($users.Count) users" -Context $Context
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
            
            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "Discovered $($groupData.Groups.Count) groups with $($groupData.Members.Count) memberships" -Context $Context
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

        # 6. EXPORT DATA TO CSV
        if ($allDiscoveredData.Count -gt 0) {
            Write-ActiveDirectoryLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
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
                    'Computer' = 'ADComputers.csv'
                    'OU' = 'ADOrganizationalUnits.csv'
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
        $result.Complete()
        Write-ActiveDirectoryLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

# --- Helper Functions ---
function Ensure-Path {
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
    
    if ($Configuration.environment.globalCatalog) {
        $params.Server = $Configuration.environment.globalCatalog
    } elseif ($Configuration.environment.domainController) {
        $params.Server = $Configuration.environment.domainController
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
            'PasswordNotRequired', 'msDS-UserPasswordExpiryTimeComputed'
        )
        
        # Build filter
        $filter = if ($Configuration.discovery.excludeDisabledUsers) {
            "Enabled -eq `$true"
        } else {
            "*"
        }
        
        $adUsers = Get-ADUser -Filter $filter -Properties $userProperties @ServerParams -ErrorAction Stop
        
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
    
    try {
        $groupProperties = @(
            'SamAccountName', 'Name', 'GroupCategory', 'GroupScope',
            'Description', 'DistinguishedName', 'whenCreated', 'whenChanged',
            'mail', 'ManagedBy', 'member'
        )
        
        $adGroups = Get-ADGroup -Filter * -Properties $groupProperties @ServerParams -ErrorAction Stop
        
        foreach ($group in $adGroups) {
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
        
    } catch {
        throw
    }
    
    return @{
        Groups = $groups.ToArray()
        Members = $groupMembers.ToArray()
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
            'ManagedBy', 'MemberOf'
        )
        
        $adComputers = Get-ADComputer -Filter * -Properties $computerProperties @ServerParams -ErrorAction Stop
        
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

function ConvertTo-ComputerObject {
    param([Microsoft.ActiveDirectory.Management.ADComputer]$ADComputer)
    
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

# --- Module Export ---
Export-ModuleMember -Function Invoke-ActiveDirectoryDiscovery