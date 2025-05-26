<#
.SYNOPSIS
    Data aggregation for M&A Discovery Suite
.DESCRIPTION
    Handles aggregation and correlation of data from multiple sources
#>

function Start-DataAggregation {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Starting data aggregation" -Level "HEADER"
        
        $outputPath = $Configuration.environment.outputPath
        $aggregatedData = @{}
        
        # Load all available data sources
        $dataSources = Get-AvailableDataSources -OutputPath $outputPath
        
        # Aggregate user data
        Write-MandALog "Aggregating user data..." -Level "INFO"
        $aggregatedData.Users = Merge-UserData -DataSources $dataSources -Configuration $Configuration
        
        # Aggregate group data
        Write-MandALog "Aggregating group data..." -Level "INFO"
        $aggregatedData.Groups = Merge-GroupData -DataSources $dataSources -Configuration $Configuration
        
        # Aggregate device data
        Write-MandALog "Aggregating device data..." -Level "INFO"
        $aggregatedData.Devices = Merge-DeviceData -DataSources $dataSources -Configuration $Configuration
        
        # Create correlation mappings
        Write-MandALog "Creating correlation mappings..." -Level "INFO"
        $aggregatedData.Correlations = New-CorrelationMappings -AggregatedData $aggregatedData -Configuration $Configuration
        
        Write-MandALog "Data aggregation completed successfully" -Level "SUCCESS"
        return $aggregatedData
        
    } catch {
        Write-MandALog "Data aggregation failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Get-AvailableDataSources {
    param([string]$OutputPath)
    
    $dataSources = @{}
    
    # Check for AD data
    $adUsersFile = Join-Path $OutputPath "ADUsers.csv"
    if (Test-Path $adUsersFile) {
        $dataSources.ADUsers = Import-DataFromCSV -FilePath $adUsersFile
        Write-MandALog "Loaded $($dataSources.ADUsers.Count) AD users" -Level "INFO"
    }
    
    $adGroupsFile = Join-Path $OutputPath "SecurityGroups.csv"
    if (Test-Path $adGroupsFile) {
        $dataSources.ADGroups = Import-DataFromCSV -FilePath $adGroupsFile
        Write-MandALog "Loaded $($dataSources.ADGroups.Count) AD groups" -Level "INFO"
    }
    
    $adComputersFile = Join-Path $OutputPath "ADComputers.csv"
    if (Test-Path $adComputersFile) {
        $dataSources.ADComputers = Import-DataFromCSV -FilePath $adComputersFile
        Write-MandALog "Loaded $($dataSources.ADComputers.Count) AD computers" -Level "INFO"
    }
    
    # Check for Graph data
    $graphUsersFile = Join-Path $OutputPath "GraphUsers.csv"
    if (Test-Path $graphUsersFile) {
        $dataSources.GraphUsers = Import-DataFromCSV -FilePath $graphUsersFile
        Write-MandALog "Loaded $($dataSources.GraphUsers.Count) Graph users" -Level "INFO"
    }
    
    $graphGroupsFile = Join-Path $OutputPath "GraphGroups.csv"
    if (Test-Path $graphGroupsFile) {
        $dataSources.GraphGroups = Import-DataFromCSV -FilePath $graphGroupsFile
        Write-MandALog "Loaded $($dataSources.GraphGroups.Count) Graph groups" -Level "INFO"
    }
    
    $graphDevicesFile = Join-Path $OutputPath "GraphDevices.csv"
    if (Test-Path $graphDevicesFile) {
        $dataSources.GraphDevices = Import-DataFromCSV -FilePath $graphDevicesFile
        Write-MandALog "Loaded $($dataSources.GraphDevices.Count) Graph devices" -Level "INFO"
    }
    
    # Check for Exchange data
    $exchangeMailboxesFile = Join-Path $OutputPath "ExchangeMailboxes.csv"
    if (Test-Path $exchangeMailboxesFile) {
        $dataSources.ExchangeMailboxes = Import-DataFromCSV -FilePath $exchangeMailboxesFile
        Write-MandALog "Loaded $($dataSources.ExchangeMailboxes.Count) Exchange mailboxes" -Level "INFO"
    }
    
    return $dataSources
}

function Merge-UserData {
    param(
        [hashtable]$DataSources,
        [hashtable]$Configuration
    )
    
    $mergedUsers = [System.Collections.Generic.List[PSCustomObject]]::new()
    $userLookup = @{}
    
    try {
        # Start with AD users as the base
        if ($DataSources.ADUsers) {
            foreach ($adUser in $DataSources.ADUsers) {
                if ([string]::IsNullOrWhiteSpace($adUser.UserPrincipalName)) { continue }
                
                $mergedUser = [PSCustomObject]@{
                    # Identity
                    UserPrincipalName = $adUser.UserPrincipalName
                    SamAccountName = $adUser.SamAccountName
                    DisplayName = $adUser.DisplayName
                    
                    # Personal Info
                    GivenName = $adUser.GivenName
                    Surname = $adUser.Surname
                    Mail = $adUser.mail
                    
                    # Organization
                    Department = $adUser.Department
                    Title = $adUser.Title
                    Company = $adUser.Company
                    Office = $adUser.Office
                    Manager = $adUser.manager
                    
                    # Status
                    Enabled = $adUser.Enabled
                    AccountCreated = $adUser.whenCreated
                    LastLogon = $adUser.LastLogonDate
                    PasswordLastSet = $adUser.PasswordLastSet
                    
                    # Source tracking
                    HasADAccount = $true
                    HasGraphAccount = $false
                    HasExchangeMailbox = $false
                    
                    # Additional fields
                    GraphId = $null
                    AssignedLicenses = $null
                    MailboxType = $null
                    MailboxSize = $null
                    
                    # Complexity indicators
                    ComplexityScore = 0
                    MigrationWave = $null
                }
                
                $mergedUsers.Add($mergedUser)
                $userLookup[$adUser.UserPrincipalName.ToLower()] = $mergedUser
            }
        }
        
        # Merge Graph user data
        if ($DataSources.GraphUsers) {
            foreach ($graphUser in $DataSources.GraphUsers) {
                if ([string]::IsNullOrWhiteSpace($graphUser.UserPrincipalName)) { continue }
                
                $upn = $graphUser.UserPrincipalName.ToLower()
                
                if ($userLookup.ContainsKey($upn)) {
                    # Update existing user
                    $existingUser = $userLookup[$upn]
                    $existingUser.HasGraphAccount = $true
                    $existingUser.GraphId = $graphUser.Id
                    $existingUser.AssignedLicenses = $graphUser.AssignedLicenses
                    
                    # Fill in missing data from Graph
                    if ([string]::IsNullOrWhiteSpace($existingUser.DisplayName)) {
                        $existingUser.DisplayName = $graphUser.DisplayName
                    }
                    if ([string]::IsNullOrWhiteSpace($existingUser.Department)) {
                        $existingUser.Department = $graphUser.Department
                    }
                    if ([string]::IsNullOrWhiteSpace($existingUser.Title)) {
                        $existingUser.Title = $graphUser.JobTitle
                    }
                    if ([string]::IsNullOrWhiteSpace($existingUser.Mail)) {
                        $existingUser.Mail = $graphUser.Mail
                    }
                } else {
                    # Create new user from Graph data
                    $newUser = [PSCustomObject]@{
                        UserPrincipalName = $graphUser.UserPrincipalName
                        SamAccountName = $graphUser.OnPremisesSamAccountName
                        DisplayName = $graphUser.DisplayName
                        GivenName = $graphUser.GivenName
                        Surname = $graphUser.Surname
                        Mail = $graphUser.Mail
                        Department = $graphUser.Department
                        Title = $graphUser.JobTitle
                        Company = $graphUser.CompanyName
                        Office = $graphUser.OfficeLocation
                        Manager = $null
                        Enabled = $graphUser.AccountEnabled
                        AccountCreated = $graphUser.CreatedDateTime
                        LastLogon = $graphUser.LastSignInDateTime
                        PasswordLastSet = $null
                        HasADAccount = $false
                        HasGraphAccount = $true
                        HasExchangeMailbox = $false
                        GraphId = $graphUser.Id
                        AssignedLicenses = $graphUser.AssignedLicenses
                        MailboxType = $null
                        MailboxSize = $null
                        ComplexityScore = 0
                        MigrationWave = $null
                    }
                    
                    $mergedUsers.Add($newUser)
                    $userLookup[$upn] = $newUser
                }
            }
        }
        
        # Merge Exchange mailbox data
        if ($DataSources.ExchangeMailboxes) {
            foreach ($mailbox in $DataSources.ExchangeMailboxes) {
                if ([string]::IsNullOrWhiteSpace($mailbox.UserPrincipalName)) { continue }
                
                $upn = $mailbox.UserPrincipalName.ToLower()
                
                if ($userLookup.ContainsKey($upn)) {
                    $existingUser = $userLookup[$upn]
                    $existingUser.HasExchangeMailbox = $true
                    $existingUser.MailboxType = $mailbox.RecipientTypeDetails
                    $existingUser.MailboxSize = $mailbox.TotalItemSize
                }
            }
        }
        
        Write-MandALog "Merged data for $($mergedUsers.Count) users" -Level "SUCCESS"
        return $mergedUsers
        
    } catch {
        Write-MandALog "Error merging user data: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Merge-GroupData {
    param(
        [hashtable]$DataSources,
        [hashtable]$Configuration
    )
    
    $mergedGroups = [System.Collections.Generic.List[PSCustomObject]]::new()
    $groupLookup = @{}
    
    try {
        # Start with AD groups
        if ($DataSources.ADGroups) {
            foreach ($adGroup in $DataSources.ADGroups) {
                if ([string]::IsNullOrWhiteSpace($adGroup.SamAccountName)) { continue }
                
                $mergedGroup = [PSCustomObject]@{
                    SamAccountName = $adGroup.SamAccountName
                    DisplayName = $adGroup.Name
                    Description = $adGroup.Description
                    GroupScope = $adGroup.GroupScope
                    GroupCategory = $adGroup.GroupCategory
                    MemberCount = $adGroup.MemberCount
                    Created = $adGroup.whenCreated
                    HasADGroup = $true
                    HasGraphGroup = $false
                    GraphId = $null
                    MailEnabled = $false
                    SecurityEnabled = $true
                }
                
                $mergedGroups.Add($mergedGroup)
                $groupLookup[$adGroup.SamAccountName.ToLower()] = $mergedGroup
            }
        }
        
        # Merge Graph groups
        if ($DataSources.GraphGroups) {
            foreach ($graphGroup in $DataSources.GraphGroups) {
                if ([string]::IsNullOrWhiteSpace($graphGroup.DisplayName)) { continue }
                
                $samAccountName = if ($graphGroup.OnPremisesSamAccountName) { 
                    $graphGroup.OnPremisesSamAccountName.ToLower() 
                } else { 
                    $graphGroup.DisplayName.ToLower() 
                }
                
                if ($groupLookup.ContainsKey($samAccountName)) {
                    # Update existing group
                    $existingGroup = $groupLookup[$samAccountName]
                    $existingGroup.HasGraphGroup = $true
                    $existingGroup.GraphId = $graphGroup.Id
                    $existingGroup.MailEnabled = $graphGroup.MailEnabled
                    
                    # Update member count if Graph has more recent data
                    if ($graphGroup.MemberCount -gt 0) {
                        $existingGroup.MemberCount = $graphGroup.MemberCount
                    }
                } else {
                    # Create new group from Graph data
                    $newGroup = [PSCustomObject]@{
                        SamAccountName = $graphGroup.OnPremisesSamAccountName
                        DisplayName = $graphGroup.DisplayName
                        Description = $graphGroup.Description
                        GroupScope = $null
                        GroupCategory = if ($graphGroup.SecurityEnabled) { "Security" } else { "Distribution" }
                        MemberCount = $graphGroup.MemberCount
                        Created = $graphGroup.CreatedDateTime
                        HasADGroup = $false
                        HasGraphGroup = $true
                        GraphId = $graphGroup.Id
                        MailEnabled = $graphGroup.MailEnabled
                        SecurityEnabled = $graphGroup.SecurityEnabled
                    }
                    
                    $mergedGroups.Add($newGroup)
                    $groupLookup[$samAccountName] = $newGroup
                }
            }
        }
        
        Write-MandALog "Merged data for $($mergedGroups.Count) groups" -Level "SUCCESS"
        return $mergedGroups
        
    } catch {
        Write-MandALog "Error merging group data: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Merge-DeviceData {
    param(
        [hashtable]$DataSources,
        [hashtable]$Configuration
    )
    
    $mergedDevices = [System.Collections.Generic.List[PSCustomObject]]::new()
    $deviceLookup = @{}
    
    try {
        # Start with AD computers
        if ($DataSources.ADComputers) {
            foreach ($adComputer in $DataSources.ADComputers) {
                if ([string]::IsNullOrWhiteSpace($adComputer.Name)) { continue }
                
                $mergedDevice = [PSCustomObject]@{
                    Name = $adComputer.Name
                    SamAccountName = $adComputer.SamAccountName
                    DistinguishedName = $adComputer.DistinguishedName
                    Enabled = $adComputer.Enabled
                    OperatingSystem = $adComputer.OperatingSystem
                    OperatingSystemVersion = $adComputer.OperatingSystemVersion
                    LastLogon = $adComputer.LastLogonDate
                    Created = $adComputer.whenCreated
                    IPv4Address = $adComputer.IPv4Address
                    DNSHostName = $adComputer.DNSHostName
                    HasADComputer = $true
                    HasGraphDevice = $false
                    GraphDeviceId = $null
                    IsManaged = $false
                    IsCompliant = $false
                    TrustType = $null
                }
                
                $mergedDevices.Add($mergedDevice)
                $deviceLookup[$adComputer.Name.ToLower()] = $mergedDevice
            }
        }
        
        # Merge Graph devices
        if ($DataSources.GraphDevices) {
            foreach ($graphDevice in $DataSources.GraphDevices) {
                if ([string]::IsNullOrWhiteSpace($graphDevice.DisplayName)) { continue }
                
                $deviceName = $graphDevice.DisplayName.ToLower()
                
                if ($deviceLookup.ContainsKey($deviceName)) {
                    # Update existing device
                    $existingDevice = $deviceLookup[$deviceName]
                    $existingDevice.HasGraphDevice = $true
                    $existingDevice.GraphDeviceId = $graphDevice.Id
                    $existingDevice.IsManaged = $graphDevice.IsManaged
                    $existingDevice.IsCompliant = $graphDevice.IsCompliant
                    $existingDevice.TrustType = $graphDevice.TrustType
                } else {
                    # Create new device from Graph data
                    $newDevice = [PSCustomObject]@{
                        Name = $graphDevice.DisplayName
                        SamAccountName = $null
                        DistinguishedName = $null
                        Enabled = $true
                        OperatingSystem = $graphDevice.OperatingSystem
                        OperatingSystemVersion = $graphDevice.OperatingSystemVersion
                        LastLogon = $graphDevice.ApproximateLastSignInDateTime
                        Created = $graphDevice.RegistrationDateTime
                        IPv4Address = $null
                        DNSHostName = $null
                        HasADComputer = $false
                        HasGraphDevice = $true
                        GraphDeviceId = $graphDevice.Id
                        IsManaged = $graphDevice.IsManaged
                        IsCompliant = $graphDevice.IsCompliant
                        TrustType = $graphDevice.TrustType
                    }
                    
                    $mergedDevices.Add($newDevice)
                    $deviceLookup[$deviceName] = $newDevice
                }
            }
        }
        
        Write-MandALog "Merged data for $($mergedDevices.Count) devices" -Level "SUCCESS"
        return $mergedDevices
        
    } catch {
        Write-MandALog "Error merging device data: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function New-CorrelationMappings {
    param(
        [hashtable]$AggregatedData,
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "Creating correlation mappings" -Level "INFO"
        
        $correlations = @{
            UserToDevice = @{}
            UserToGroup = @{}
            OrphanedAccounts = @()
            DuplicateAccounts = @()
            InconsistentData = @()
        }
        
        # Find orphaned accounts (exist in one system but not others)
        foreach ($user in $AggregatedData.Users) {
            if ($user.HasADAccount -and -not $user.HasGraphAccount) {
                $correlations.OrphanedAccounts += [PSCustomObject]@{
                    Type = "AD Only"
                    UserPrincipalName = $user.UserPrincipalName
                    DisplayName = $user.DisplayName
                    Issue = "User exists in AD but not in Azure AD"
                }
            }
            
            if ($user.HasGraphAccount -and -not $user.HasADAccount) {
                $correlations.OrphanedAccounts += [PSCustomObject]@{
                    Type = "Cloud Only"
                    UserPrincipalName = $user.UserPrincipalName
                    DisplayName = $user.DisplayName
                    Issue = "User exists in Azure AD but not in on-premises AD"
                }
            }
        }
        
        # Find data inconsistencies
        foreach ($user in $AggregatedData.Users) {
            if ($user.HasADAccount -and $user.HasGraphAccount) {
                $issues = @()
                
                # Check for display name mismatches
                if ($user.DisplayName -ne $user.DisplayName) {
                    $issues += "Display name mismatch between AD and Azure AD"
                }
                
                # Check for enabled status mismatches
                if ($user.Enabled -ne $user.AccountEnabled) {
                    $issues += "Account enabled status mismatch between AD and Azure AD"
                }
                
                if ($issues.Count -gt 0) {
                    $correlations.InconsistentData += [PSCustomObject]@{
                        UserPrincipalName = $user.UserPrincipalName
                        Issues = ($issues -join '; ')
                    }
                }
            }
        }
        
        Write-MandALog "Created correlation mappings" -Level "SUCCESS"
        Write-MandALog "  Orphaned accounts: $($correlations.OrphanedAccounts.Count)" -Level "INFO"
        Write-MandALog "  Inconsistent data: $($correlations.InconsistentData.Count)" -Level "INFO"
        
        return $correlations
        
    } catch {
        Write-MandALog "Error creating correlation mappings: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Start-DataAggregation',
    'Get-AvailableDataSources',
    'Merge-UserData',
    'Merge-GroupData',
    'Merge-DeviceData',
    'New-CorrelationMappings'
)