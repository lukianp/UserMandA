# Generate Test Data for UserMandA Discovery System
# This script creates realistic dummy CSV data for testing all discovery modules

param(
    [string]$OutputPath = "C:\discoverydata\ljpops\Raw",
    [string]$CompanyName = "ljpops",
    [string]$SessionId = [Guid]::NewGuid().ToString()
)

$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

Write-Host "Generating test data for company: $CompanyName" -ForegroundColor Cyan
Write-Host "Output directory: $OutputPath" -ForegroundColor Cyan
Write-Host "Session ID: $SessionId" -ForegroundColor Cyan
Write-Host "Timestamp: $timestamp" -ForegroundColor Cyan

# Ensure output directory exists
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

#region Active Directory Data
Write-Host "`nGenerating Active Directory data..." -ForegroundColor Yellow

# AD Users
$adUsers = @()
$departments = @('IT', 'Finance', 'HR', 'Sales', 'Marketing', 'Operations', 'Legal', 'Engineering', 'Support')
$locations = @('New York', 'London', 'Tokyo', 'Sydney', 'Berlin', 'Singapore', 'Dubai', 'Toronto')

for ($i = 1; $i -le 150; $i++) {
    $firstName = @('John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Robert', 'Lisa', 'James', 'Mary')[$i % 10]
    $lastName = "User$i"
    $dept = $departments[$i % $departments.Count]
    $location = $locations[$i % $locations.Count]
    
    $adUsers += [PSCustomObject]@{
        SamAccountName = "user$i"
        UserPrincipalName = "user$i@$CompanyName.com"
        DisplayName = "$firstName $lastName"
        Enabled = if ($i % 20 -eq 0) { $false } else { $true }
        LastLogonDate = (Get-Date).AddDays(-($i % 365))
        PasswordExpiryDate = (Get-Date).AddDays(90 - ($i % 180))
        PasswordNeverExpires = if ($i % 30 -eq 0) { $true } else { $false }
        PasswordLastSet = (Get-Date).AddDays(-($i % 90))
        GivenName = $firstName
        Surname = $lastName
        Description = "$dept $location Employee"
        DistinguishedName = "CN=$firstName $lastName,OU=$dept,OU=Users,DC=$CompanyName,DC=com"
        CreatedDate = (Get-Date).AddDays(-($i * 10))
        ModifiedDate = (Get-Date).AddDays(-($i % 30))
        EmailAddress = "user$i@$CompanyName.com"
        Department = $dept
        Office = $location
        Title = @('Manager', 'Senior Analyst', 'Developer', 'Administrator', 'Specialist', 'Director', 'VP', 'Coordinator')[$i % 8]
        Manager = if ($i % 10 -eq 0) { $null } else { "CN=Manager$($i % 10),OU=Users,DC=$CompanyName,DC=com" }
        MemberOfGroupsCount = $i % 15
        AccountExpirationDate = if ($i % 50 -eq 0) { (Get-Date).AddDays(30) } else { $null }
        PhoneNumber = "+1-555-$('{0:D4}' -f ($i * 7))"
        _DataType = 'Users'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'ActiveDirectory'
        _SessionId = $SessionId
    }
}
$adUsers | Export-Csv -Path "$OutputPath\ActiveDirectoryDiscovery_Users.csv" -NoTypeInformation -Encoding UTF8

# AD Computers
$adComputers = @()
$osVersions = @('Windows 10 Enterprise', 'Windows 11 Pro', 'Windows Server 2019', 'Windows Server 2022', 'Windows 10 Pro')

for ($i = 1; $i -le 100; $i++) {
    $computerType = if ($i % 5 -eq 0) { 'SERVER' } else { 'WORKSTATION' }
    $prefix = if ($computerType -eq 'SERVER') { 'SRV' } else { 'WKS' }
    
    $adComputers += [PSCustomObject]@{
        Name = "$prefix-$CompanyName$('{0:D3}' -f $i)"
        DNSHostName = "$prefix-$CompanyName$('{0:D3}' -f $i).$CompanyName.com"
        OperatingSystem = $osVersions[$i % $osVersions.Count]
        OperatingSystemVersion = "10.0.$(19040 + ($i % 5))"
        OperatingSystemServicePack = ""
        Enabled = if ($i % 25 -eq 0) { $false } else { $true }
        DistinguishedName = "CN=$prefix-$CompanyName$('{0:D3}' -f $i),OU=Computers,DC=$CompanyName,DC=com"
        CreatedDate = (Get-Date).AddDays(-($i * 15))
        ModifiedDate = (Get-Date).AddDays(-($i % 60))
        LastLogonDate = (Get-Date).AddDays(-($i % 30))
        Description = "$computerType in $($locations[$i % $locations.Count])"
        ManagedBy = "CN=Admin$($i % 5),OU=IT,DC=$CompanyName,DC=com"
        MemberOfGroupsCount = $i % 8
        IPv4Address = "192.168.$($i % 255).$($i % 254 + 1)"
        _DataType = 'Computers'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'ActiveDirectory'
        _SessionId = $SessionId
    }
}
$adComputers | Export-Csv -Path "$OutputPath\ActiveDirectoryDiscovery_Computers.csv" -NoTypeInformation -Encoding UTF8

# AD Groups
$adGroups = @()
$groupTypes = @('Security', 'Distribution')
$groupScopes = @('Global', 'Universal', 'DomainLocal')

for ($i = 1; $i -le 80; $i++) {
    $groupName = @('Domain Admins', 'IT Support', 'Finance Team', 'HR Access', 'VPN Users', 
                   'File Share Access', 'Email Users', 'Remote Desktop', 'Backup Operators', 
                   'Print Operators')[$i % 10] + $(if ($i -gt 10) { "_$i" } else { "" })
    
    $adGroups += [PSCustomObject]@{
        SamAccountName = $groupName.Replace(' ', '_')
        Name = $groupName
        GroupCategory = $groupTypes[$i % 2]
        GroupScope = $groupScopes[$i % 3]
        Description = "Group for $groupName access and permissions"
        DistinguishedName = "CN=$groupName,OU=Groups,DC=$CompanyName,DC=com"
        CreatedDate = (Get-Date).AddDays(-($i * 20))
        ModifiedDate = (Get-Date).AddDays(-($i % 45))
        EmailAddress = if ($i % 3 -eq 0) { "$($groupName.Replace(' ', '.'))@$CompanyName.com" } else { $null }
        ManagedBy = "CN=Admin$($i % 5),OU=IT,DC=$CompanyName,DC=com"
        MemberCount = $i * 3
        _DataType = 'Groups'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'ActiveDirectory'
        _SessionId = $SessionId
    }
}
$adGroups | Export-Csv -Path "$OutputPath\ActiveDirectoryDiscovery_Groups.csv" -NoTypeInformation -Encoding UTF8
#endregion

#region Azure Data
Write-Host "Generating Azure data..." -ForegroundColor Yellow

# Azure Users
$azureUsers = @()
for ($i = 1; $i -le 100; $i++) {
    $firstName = @('Alex', 'Morgan', 'Jordan', 'Casey', 'Riley', 'Taylor', 'Drew', 'Blake', 'Avery', 'Quinn')[$i % 10]
    $lastName = "Azure$i"
    
    $azureUsers += [PSCustomObject]@{
        ObjectId = [Guid]::NewGuid().ToString()
        UserPrincipalName = "$firstName.$lastName@$CompanyName.onmicrosoft.com"
        DisplayName = "$firstName $lastName"
        GivenName = $firstName
        Surname = $lastName
        UserType = if ($i % 20 -eq 0) { 'Guest' } else { 'Member' }
        AccountEnabled = if ($i % 30 -eq 0) { $false } else { $true }
        Mail = "$firstName.$lastName@$CompanyName.com"
        Department = $departments[$i % $departments.Count]
        JobTitle = @('Cloud Architect', 'DevOps Engineer', 'Security Analyst', 'Data Scientist')[$i % 4]
        Country = @('USA', 'UK', 'Germany', 'Japan', 'Australia')[$i % 5]
        CreatedDateTime = (Get-Date).AddDays(-($i * 8))
        LastSignInDateTime = (Get-Date).AddDays(-($i % 15))
        LicenseAssigned = if ($i % 4 -eq 0) { 'E3' } elseif ($i % 3 -eq 0) { 'E5' } else { 'Business Basic' }
        _DataType = 'AzureUsers'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'Azure'
        _SessionId = $SessionId
    }
}
$azureUsers | Export-Csv -Path "$OutputPath\AzureDiscovery_Users.csv" -NoTypeInformation -Encoding UTF8

# Azure Resources
$azureResources = @()
$resourceTypes = @('Virtual Machine', 'Storage Account', 'SQL Database', 'App Service', 'Key Vault', 'Network Security Group', 'Load Balancer', 'Virtual Network')

for ($i = 1; $i -le 120; $i++) {
    $resourceType = $resourceTypes[$i % $resourceTypes.Count]
    $resourceName = "$($resourceType.Replace(' ', '').ToLower())$CompanyName$i"
    
    $azureResources += [PSCustomObject]@{
        ResourceId = "/subscriptions/$(New-Guid)/resourceGroups/rg-$CompanyName-$($i % 5)/providers/Microsoft.Compute/$resourceName"
        ResourceName = $resourceName
        ResourceType = $resourceType
        ResourceGroup = "rg-$CompanyName-$($i % 5)"
        Location = @('eastus', 'westeurope', 'southeastasia', 'australiaeast', 'uksouth')[$i % 5]
        SubscriptionId = if ($i % 3 -eq 0) { 'sub-prod-001' } else { 'sub-dev-001' }
        Tags = "Environment=$(if ($i % 2 -eq 0) { 'Production' } else { 'Development' });Owner=$($departments[$i % $departments.Count])"
        CreatedTime = (Get-Date).AddDays(-($i * 5))
        ModifiedTime = (Get-Date).AddDays(-($i % 20))
        ProvisioningState = 'Succeeded'
        SKU = if ($resourceType -eq 'Virtual Machine') { @('Standard_D2s_v3', 'Standard_D4s_v3', 'Standard_B2ms')[$i % 3] } else { 'Standard' }
        _DataType = 'AzureResources'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'AzureResource'
        _SessionId = $SessionId
    }
}
$azureResources | Export-Csv -Path "$OutputPath\AzureResourceDiscovery_Resources.csv" -NoTypeInformation -Encoding UTF8
#endregion

#region Exchange Data
Write-Host "Generating Exchange data..." -ForegroundColor Yellow

$exchangeMailboxes = @()
$mailboxTypes = @('UserMailbox', 'SharedMailbox', 'RoomMailbox', 'EquipmentMailbox')

for ($i = 1; $i -le 100; $i++) {
    $mailboxType = $mailboxTypes[$i % $mailboxTypes.Count]
    $exchangeMailboxes += [PSCustomObject]@{
        Identity = "mailbox$i@$CompanyName.com"
        DisplayName = if ($mailboxType -eq 'RoomMailbox') { "Conference Room $i" } elseif ($mailboxType -eq 'EquipmentMailbox') { "Equipment $i" } else { "User $i Mailbox" }
        PrimarySmtpAddress = "mailbox$i@$CompanyName.com"
        RecipientTypeDetails = $mailboxType
        Database = "EXDB$(($i % 3) + 1)"
        ServerName = "EXCH$(($i % 2) + 1)"
        TotalItemSize = "$([math]::Round((Get-Random -Minimum 100 -Maximum 5000), 2)) MB"
        ItemCount = Get-Random -Minimum 100 -Maximum 50000
        ProhibitSendQuota = "50 GB"
        IssueWarningQuota = "45 GB"
        LastLogonTime = (Get-Date).AddDays(-($i % 30))
        CreatedDate = (Get-Date).AddDays(-($i * 10))
        HiddenFromAddressListsEnabled = if ($i % 20 -eq 0) { $true } else { $false }
        LitigationHoldEnabled = if ($i % 15 -eq 0) { $true } else { $false }
        ArchiveEnabled = if ($i % 5 -eq 0) { $true } else { $false }
        _DataType = 'Mailboxes'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'Exchange'
        _SessionId = $SessionId
    }
}
$exchangeMailboxes | Export-Csv -Path "$OutputPath\ExchangeDiscovery_Mailboxes.csv" -NoTypeInformation -Encoding UTF8

# Distribution Groups
$distGroups = @()
for ($i = 1; $i -le 50; $i++) {
    $distGroups += [PSCustomObject]@{
        Identity = "DL-$($departments[$i % $departments.Count])-$i"
        DisplayName = "$($departments[$i % $departments.Count]) Distribution List $i"
        PrimarySmtpAddress = "dl.$($departments[$i % $departments.Count].ToLower())$i@$CompanyName.com"
        GroupType = 'Distribution'
        MemberCount = Get-Random -Minimum 5 -Maximum 100
        ManagedBy = "Admin$($i % 5)"
        RequireSenderAuthenticationEnabled = if ($i % 3 -eq 0) { $false } else { $true }
        CreatedDate = (Get-Date).AddDays(-($i * 15))
        _DataType = 'DistributionGroups'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'Exchange'
        _SessionId = $SessionId
    }
}
$distGroups | Export-Csv -Path "$OutputPath\ExchangeDiscovery_DistributionGroups.csv" -NoTypeInformation -Encoding UTF8
#endregion

#region Teams Data
Write-Host "Generating Teams data..." -ForegroundColor Yellow

$teams = @()
for ($i = 1; $i -le 60; $i++) {
    $teamName = "$($departments[$i % $departments.Count]) Team $i"
    $teams += [PSCustomObject]@{
        TeamId = [Guid]::NewGuid().ToString()
        DisplayName = $teamName
        Description = "Collaboration space for $teamName"
        Visibility = if ($i % 5 -eq 0) { 'Private' } else { 'Public' }
        CreatedDateTime = (Get-Date).AddDays(-($i * 7))
        MemberCount = Get-Random -Minimum 5 -Maximum 50
        OwnerCount = Get-Random -Minimum 1 -Maximum 3
        GuestCount = if ($i % 10 -eq 0) { Get-Random -Minimum 1 -Maximum 5 } else { 0 }
        ChannelCount = Get-Random -Minimum 3 -Maximum 15
        IsArchived = if ($i % 30 -eq 0) { $true } else { $false }
        Classification = if ($i % 3 -eq 0) { 'Confidential' } elseif ($i % 2 -eq 0) { 'Internal' } else { 'General' }
        _DataType = 'Teams'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'Teams'
        _SessionId = $SessionId
    }
}
$teams | Export-Csv -Path "$OutputPath\TeamsDiscovery_Teams.csv" -NoTypeInformation -Encoding UTF8

# Channels
$channels = @()
$channelTypes = @('Standard', 'Private', 'Shared')
foreach ($team in $teams | Select-Object -First 30) {
    for ($j = 1; $j -le 3; $j++) {
        $channels += [PSCustomObject]@{
            ChannelId = [Guid]::NewGuid().ToString()
            TeamId = $team.TeamId
            DisplayName = @('General', 'Planning', 'Development', 'Support', 'Announcements')[$j % 5]
            Description = "Channel for $($team.DisplayName)"
            MembershipType = $channelTypes[$j % 3]
            CreatedDateTime = $team.CreatedDateTime
            _DataType = 'Channels'
            _DiscoveryTimestamp = $timestamp
            _DiscoveryModule = 'Teams'
            _SessionId = $SessionId
        }
    }
}
$channels | Export-Csv -Path "$OutputPath\TeamsDiscovery_Channels.csv" -NoTypeInformation -Encoding UTF8
#endregion

#region SharePoint Data
Write-Host "Generating SharePoint data..." -ForegroundColor Yellow

$spSites = @()
$siteTemplates = @('Team Site', 'Communication Site', 'Document Center', 'Project Site')

for ($i = 1; $i -le 70; $i++) {
    $siteName = "$($departments[$i % $departments.Count])Site$i"
    $spSites += [PSCustomObject]@{
        SiteId = [Guid]::NewGuid().ToString()
        Title = "$($departments[$i % $departments.Count]) Site $i"
        Url = "https://$CompanyName.sharepoint.com/sites/$siteName"
        Template = $siteTemplates[$i % $siteTemplates.Count]
        StorageUsed = Get-Random -Minimum 100 -Maximum 10000
        StorageQuota = 25600
        LastContentModifiedDate = (Get-Date).AddDays(-($i % 60))
        CreatedDateTime = (Get-Date).AddDays(-($i * 10))
        SharingCapability = @('ExternalUserAndGuestSharing', 'ExternalUserSharingOnly', 'ExistingExternalUserSharingOnly', 'Disabled')[$i % 4]
        GroupId = if ($i % 3 -eq 0) { [Guid]::NewGuid().ToString() } else { $null }
        HubSiteId = if ($i % 10 -eq 0) { [Guid]::NewGuid().ToString() } else { $null }
        IsHubSite = if ($i % 20 -eq 0) { $true } else { $false }
        _DataType = 'Sites'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'SharePoint'
        _SessionId = $SessionId
    }
}
$spSites | Export-Csv -Path "$OutputPath\SharePointDiscovery_Sites.csv" -NoTypeInformation -Encoding UTF8

# Document Libraries
$docLibs = @()
foreach ($site in $spSites | Select-Object -First 30) {
    for ($j = 1; $j -le 2; $j++) {
        $docLibs += [PSCustomObject]@{
            LibraryId = [Guid]::NewGuid().ToString()
            SiteId = $site.SiteId
            Title = @('Documents', 'Shared Documents', 'Archive', 'Templates', 'Reports')[$j % 5]
            ItemCount = Get-Random -Minimum 10 -Maximum 5000
            SizeInMB = Get-Random -Minimum 50 -Maximum 5000
            LastModified = (Get-Date).AddDays(-($j % 30))
            VersioningEnabled = if ($j % 2 -eq 0) { $true } else { $false }
            _DataType = 'Libraries'
            _DiscoveryTimestamp = $timestamp
            _DiscoveryModule = 'SharePoint'
            _SessionId = $SessionId
        }
    }
}
$docLibs | Export-Csv -Path "$OutputPath\SharePointDiscovery_Libraries.csv" -NoTypeInformation -Encoding UTF8
#endregion

#region SQL Server Data
Write-Host "Generating SQL Server data..." -ForegroundColor Yellow

$sqlInstances = @()
$sqlVersions = @('SQL Server 2019', 'SQL Server 2017', 'SQL Server 2016', 'SQL Server 2022')

for ($i = 1; $i -le 15; $i++) {
    $sqlInstances += [PSCustomObject]@{
        InstanceName = "SQLSRV$('{0:D2}' -f $i)\$(if ($i % 3 -eq 0) { 'PROD' } else { 'DEV' })"
        ServerName = "SQLSRV$('{0:D2}' -f $i)"
        Version = $sqlVersions[$i % $sqlVersions.Count]
        Edition = @('Enterprise', 'Standard', 'Developer')[$i % 3]
        ProductLevel = 'RTM'
        Collation = 'SQL_Latin1_General_CP1_CI_AS'
        IsClustered = if ($i % 5 -eq 0) { $true } else { $false }
        IsAlwaysOn = if ($i % 4 -eq 0) { $true } else { $false }
        DatabaseCount = Get-Random -Minimum 5 -Maximum 50
        MaxMemoryMB = @(8192, 16384, 32768, 65536)[$i % 4]
        CPUCount = @(4, 8, 16, 32)[$i % 4]
        _DataType = 'Instances'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'SQLServer'
        _SessionId = $SessionId
    }
}
$sqlInstances | Export-Csv -Path "$OutputPath\SQLServerDiscovery_Instances.csv" -NoTypeInformation -Encoding UTF8

# Databases
$databases = @()
$dbTypes = @('User', 'System', 'Distribution', 'ReportServer')

foreach ($instance in $sqlInstances) {
    $dbCount = Get-Random -Minimum 3 -Maximum 10
    for ($j = 1; $j -le $dbCount; $j++) {
        $databases += [PSCustomObject]@{
            DatabaseId = Get-Random -Minimum 1000 -Maximum 9999
            DatabaseName = @('AppDB', 'CustomerDB', 'OrderDB', 'ProductDB', 'AnalyticsDB', 'ReportingDB')[$j % 6] + "_$j"
            InstanceName = $instance.InstanceName
            SizeMB = Get-Random -Minimum 100 -Maximum 50000
            DataFileSizeMB = Get-Random -Minimum 50 -Maximum 25000
            LogFileSizeMB = Get-Random -Minimum 10 -Maximum 5000
            RecoveryModel = @('FULL', 'SIMPLE', 'BULK_LOGGED')[$j % 3]
            CompatibilityLevel = @(140, 150, 160)[$j % 3]
            State = 'ONLINE'
            CreatedDate = (Get-Date).AddDays(-(Get-Random -Minimum 100 -Maximum 1000))
            LastBackupDate = (Get-Date).AddDays(-(Get-Random -Minimum 0 -Maximum 7))
            _DataType = 'Databases'
            _DiscoveryTimestamp = $timestamp
            _DiscoveryModule = 'SQLServer'
            _SessionId = $SessionId
        }
    }
}
$databases | Export-Csv -Path "$OutputPath\SQLServerDiscovery_Databases.csv" -NoTypeInformation -Encoding UTF8
#endregion

#region File Server Data
Write-Host "Generating File Server data..." -ForegroundColor Yellow

$fileShares = @()
$shareTypes = @('Department', 'Project', 'Public', 'Archive', 'Home')

for ($i = 1; $i -le 80; $i++) {
    $shareType = $shareTypes[$i % $shareTypes.Count]
    $fileShares += [PSCustomObject]@{
        ShareName = "$shareType$(if ($i -gt 5) { $i } else { '' })"
        Path = "\\FILESRV$(($i % 3) + 1)\$shareType$(if ($i -gt 5) { $i } else { '' })"
        ServerName = "FILESRV$(($i % 3) + 1)"
        Description = "$shareType share for $($departments[$i % $departments.Count])"
        SizeGB = [math]::Round((Get-Random -Minimum 10 -Maximum 5000) / 1024, 2)
        UsedSpaceGB = [math]::Round((Get-Random -Minimum 5 -Maximum 2500) / 1024, 2)
        FreeSpaceGB = [math]::Round((Get-Random -Minimum 5 -Maximum 2500) / 1024, 2)
        FileCount = Get-Random -Minimum 100 -Maximum 100000
        FolderCount = Get-Random -Minimum 10 -Maximum 1000
        CreatedDate = (Get-Date).AddDays(-(Get-Random -Minimum 100 -Maximum 2000))
        LastAccessDate = (Get-Date).AddDays(-($i % 30))
        SharePermissions = 'Everyone:Read;IT_Admins:FullControl'
        IsHidden = if ($i % 20 -eq 0) { $true } else { $false }
        EncryptionEnabled = if ($i % 3 -eq 0) { $true } else { $false }
        _DataType = 'FileShares'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'FileServer'
        _SessionId = $SessionId
    }
}
$fileShares | Export-Csv -Path "$OutputPath\FileServerDiscovery_Shares.csv" -NoTypeInformation -Encoding UTF8
#endregion

#region VMware Data
Write-Host "Generating VMware data..." -ForegroundColor Yellow

$vms = @()
$vmOSTypes = @('Windows Server 2019', 'Windows Server 2022', 'Ubuntu 20.04', 'CentOS 8', 'Windows 10')

for ($i = 1; $i -le 90; $i++) {
    $vms += [PSCustomObject]@{
        VMId = "vm-$i"
        Name = "VM-$CompanyName-$('{0:D3}' -f $i)"
        PowerState = if ($i % 10 -eq 0) { 'PoweredOff' } else { 'PoweredOn' }
        GuestOS = $vmOSTypes[$i % $vmOSTypes.Count]
        CPUCount = @(2, 4, 8, 16)[$i % 4]
        MemoryGB = @(4, 8, 16, 32, 64)[$i % 5]
        ProvisionedSpaceGB = Get-Random -Minimum 40 -Maximum 500
        UsedSpaceGB = Get-Random -Minimum 20 -Maximum 250
        Host = "ESXi-Host-$(($i % 5) + 1)"
        Cluster = "Cluster-$(($i % 2) + 1)"
        Datacenter = "Datacenter-$(($i % 2) + 1)"
        Datastore = "Datastore-$(($i % 3) + 1)"
        Network = "VLAN-$(($i % 10) * 10 + 100)"
        VMwareTools = @('Running', 'Not Running', 'Out of Date')[$i % 3]
        CreatedDate = (Get-Date).AddDays(-(Get-Random -Minimum 30 -Maximum 1000))
        HardwareVersion = "vmx-$(Get-Random -Minimum 13 -Maximum 19)"
        SnapshotCount = if ($i % 5 -eq 0) { Get-Random -Minimum 1 -Maximum 5 } else { 0 }
        _DataType = 'VirtualMachines'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'VMware'
        _SessionId = $SessionId
    }
}
$vms | Export-Csv -Path "$OutputPath\VMwareDiscovery_VMs.csv" -NoTypeInformation -Encoding UTF8

# ESXi Hosts
$esxiHosts = @()
for ($i = 1; $i -le 10; $i++) {
    $esxiHosts += [PSCustomObject]@{
        HostId = "host-$i"
        Name = "ESXi-Host-$i"
        Version = "7.0.$(Get-Random -Minimum 0 -Maximum 3)"
        Build = Get-Random -Minimum 15000000 -Maximum 20000000
        Manufacturer = @('Dell Inc.', 'HPE', 'Cisco', 'Lenovo')[$i % 4]
        Model = @('PowerEdge R740', 'ProLiant DL380 Gen10', 'UCS C240 M5', 'ThinkSystem SR650')[$i % 4]
        CPUModel = @('Intel Xeon Gold 6248', 'Intel Xeon Silver 4214', 'AMD EPYC 7302')[$i % 3]
        CPUCores = @(20, 24, 32, 40)[$i % 4]
        CPUSockets = 2
        MemoryGB = @(256, 384, 512, 768)[$i % 4]
        VMCount = Get-Random -Minimum 10 -Maximum 30
        ConnectionState = 'Connected'
        PowerState = 'On'
        MaintenanceMode = if ($i % 10 -eq 0) { $true } else { $false }
        _DataType = 'Hosts'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'VMware'
        _SessionId = $SessionId
    }
}
$esxiHosts | Export-Csv -Path "$OutputPath\VMwareDiscovery_Hosts.csv" -NoTypeInformation -Encoding UTF8
#endregion

#region Application Data
Write-Host "Generating Application data..." -ForegroundColor Yellow

$applications = @()
$appVendors = @('Microsoft', 'Adobe', 'Oracle', 'SAP', 'Salesforce', 'IBM', 'Cisco', 'VMware', 'Autodesk', 'Symantec')
$appCategories = @('Productivity', 'Security', 'Development', 'Database', 'Graphics', 'Communication', 'Utilities', 'Business')

for ($i = 1; $i -le 150; $i++) {
    $vendor = $appVendors[$i % $appVendors.Count]
    $applications += [PSCustomObject]@{
        ApplicationId = [Guid]::NewGuid().ToString()
        Name = @('Office 365', 'Visual Studio', 'SQL Server', 'Exchange', 'Adobe Creative Cloud', 
                'Oracle Database', 'SAP ERP', 'AutoCAD', 'Endpoint Protection', 'Teams')[$i % 10] + $(if ($i -gt 10) { " $i" } else { "" })
        Version = "$(Get-Random -Minimum 2019 -Maximum 2024).$(Get-Random -Minimum 0 -Maximum 12).$(Get-Random -Minimum 0 -Maximum 30)"
        Vendor = $vendor
        Category = $appCategories[$i % $appCategories.Count]
        InstallCount = Get-Random -Minimum 1 -Maximum 500
        LicenseType = @('Per User', 'Per Device', 'Site License', 'Subscription')[$i % 4]
        LicenseCount = Get-Random -Minimum 10 -Maximum 1000
        LicensesUsed = Get-Random -Minimum 5 -Maximum 800
        CriticalityLevel = @('Critical', 'High', 'Medium', 'Low')[$i % 4]
        SupportStatus = @('Mainstream', 'Extended', 'End of Life', 'Custom')[$i % 4]
        LastUpdated = (Get-Date).AddDays(-(Get-Random -Minimum 0 -Maximum 90))
        _DataType = 'Applications'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'Application'
        _SessionId = $SessionId
    }
}
$applications | Export-Csv -Path "$OutputPath\ApplicationDiscovery_Applications.csv" -NoTypeInformation -Encoding UTF8

# Application Dependencies
$dependencies = @()
foreach ($app in $applications | Select-Object -First 50) {
    $depCount = Get-Random -Minimum 0 -Maximum 3
    for ($j = 0; $j -lt $depCount; $j++) {
        $targetApp = $applications | Get-Random
        if ($targetApp.ApplicationId -ne $app.ApplicationId) {
            $dependencies += [PSCustomObject]@{
                SourceAppId = $app.ApplicationId
                SourceAppName = $app.Name
                TargetAppId = $targetApp.ApplicationId
                TargetAppName = $targetApp.Name
                DependencyType = @('Required', 'Optional', 'Conditional')[$j % 3]
                Direction = @('Upstream', 'Downstream', 'Bidirectional')[$j % 3]
                _DataType = 'Dependencies'
                _DiscoveryTimestamp = $timestamp
                _DiscoveryModule = 'ApplicationDependency'
                _SessionId = $SessionId
            }
        }
    }
}
$dependencies | Export-Csv -Path "$OutputPath\ApplicationDependencyMapping_Dependencies.csv" -NoTypeInformation -Encoding UTF8
#endregion

#region Security Data
Write-Host "Generating Security data..." -ForegroundColor Yellow

# Security Groups
$securityGroups = @()
for ($i = 1; $i -le 60; $i++) {
    $securityGroups += [PSCustomObject]@{
        GroupId = [Guid]::NewGuid().ToString()
        GroupName = @('Domain Admins', 'Enterprise Admins', 'Schema Admins', 'Backup Operators', 
                     'Server Operators', 'Account Operators', 'Print Operators', 'Remote Desktop Users',
                     'DnsAdmins', 'DHCP Administrators')[$i % 10] + $(if ($i -gt 10) { "_$i" } else { "" })
        GroupType = 'Security'
        Scope = @('Global', 'Domain Local', 'Universal')[$i % 3]
        MemberCount = Get-Random -Minimum 1 -Maximum 100
        NestedGroups = Get-Random -Minimum 0 -Maximum 5
        PrivilegeLevel = @('High', 'Medium', 'Low')[$i % 3]
        RiskScore = Get-Random -Minimum 1 -Maximum 10
        LastModified = (Get-Date).AddDays(-(Get-Random -Minimum 0 -Maximum 365))
        _DataType = 'SecurityGroups'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'SecurityGroupAnalysis'
        _SessionId = $SessionId
    }
}
$securityGroups | Export-Csv -Path "$OutputPath\SecurityGroupAnalysis_Groups.csv" -NoTypeInformation -Encoding UTF8

# Certificates
$certificates = @()
$certTypes = @('SSL/TLS', 'Code Signing', 'Email', 'Client Authentication', 'Root CA', 'Intermediate CA')

for ($i = 1; $i -le 80; $i++) {
    $certificates += [PSCustomObject]@{
        Thumbprint = (1..40 | ForEach-Object { '{0:X}' -f (Get-Random -Maximum 16) }) -join ''
        Subject = "CN=$CompanyName-$(($certTypes[$i % $certTypes.Count]).Replace('/', '-'))-$i"
        Issuer = if ($i % 5 -eq 0) { "CN=$CompanyName-RootCA" } else { "CN=External-CA-$($i % 3)" }
        CertificateType = $certTypes[$i % $certTypes.Count]
        KeyLength = @(2048, 4096)[$i % 2]
        SignatureAlgorithm = @('SHA256', 'SHA384', 'SHA512')[$i % 3]
        NotBefore = (Get-Date).AddDays(-(Get-Random -Minimum 30 -Maximum 730))
        NotAfter = (Get-Date).AddDays((Get-Random -Minimum 30 -Maximum 730))
        DaysUntilExpiry = Get-Random -Minimum -30 -Maximum 730
        IsExpired = if ($i % 20 -eq 0) { $true } else { $false }
        InstalledOn = "Server$($i % 10)"
        _DataType = 'Certificates'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'CertificateDiscovery'
        _SessionId = $SessionId
    }
}
$certificates | Export-Csv -Path "$OutputPath\CertificateDiscovery_Certificates.csv" -NoTypeInformation -Encoding UTF8
#endregion

#region Group Policy Data
Write-Host "Generating Group Policy data..." -ForegroundColor Yellow

$gpos = @()
$gpoCategories = @('Security', 'Software', 'User Configuration', 'Computer Configuration', 'Network')

for ($i = 1; $i -le 70; $i++) {
    $gpos += [PSCustomObject]@{
        GPOId = [Guid]::NewGuid().ToString()
        DisplayName = @('Default Domain Policy', 'Password Policy', 'Software Deployment', 
                       'Security Hardening', 'User Settings', 'Drive Mappings', 
                       'Printer Deployment', 'Internet Explorer Settings')[$i % 8] + $(if ($i -gt 8) { " $i" } else { "" })
        Category = $gpoCategories[$i % $gpoCategories.Count]
        CreatedTime = (Get-Date).AddDays(-(Get-Random -Minimum 100 -Maximum 1000))
        ModifiedTime = (Get-Date).AddDays(-(Get-Random -Minimum 0 -Maximum 90))
        LinksCount = Get-Random -Minimum 1 -Maximum 10
        WMIFilterName = if ($i % 5 -eq 0) { "WMIFilter$($i % 3)" } else { $null }
        UserEnabled = if ($i % 10 -eq 0) { $false } else { $true }
        ComputerEnabled = if ($i % 15 -eq 0) { $false } else { $true }
        Status = @('Enabled', 'PartiallyDisabled', 'AllSettingsDisabled')[$i % 3]
        _DataType = 'GroupPolicies'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'GPO'
        _SessionId = $SessionId
    }
}
$gpos | Export-Csv -Path "$OutputPath\GPODiscovery_Policies.csv" -NoTypeInformation -Encoding UTF8
#endregion

#region Network Infrastructure Data
Write-Host "Generating Network Infrastructure data..." -ForegroundColor Yellow

# Network Devices
$networkDevices = @()
$deviceTypes = @('Switch', 'Router', 'Firewall', 'Load Balancer', 'Access Point', 'VPN Gateway')

for ($i = 1; $i -le 60; $i++) {
    $deviceType = $deviceTypes[$i % $deviceTypes.Count]
    $networkDevices += [PSCustomObject]@{
        DeviceId = "NET-$('{0:D4}' -f $i)"
        HostName = "$($deviceType.Replace(' ', ''))-$CompanyName-$i"
        DeviceType = $deviceType
        Manufacturer = @('Cisco', 'Juniper', 'HP', 'Aruba', 'Fortinet', 'Palo Alto')[$i % 6]
        Model = @('Catalyst 9300', 'Nexus 9000', 'MX480', 'FortiGate 600', 'PA-5220')[$i % 5]
        IPAddress = "10.$($i % 255).$($i % 254 + 1).1"
        Location = $locations[$i % $locations.Count]
        SerialNumber = "SN$(Get-Random -Minimum 100000 -Maximum 999999)"
        FirmwareVersion = "$(Get-Random -Minimum 12 -Maximum 16).$(Get-Random -Minimum 0 -Maximum 9).$(Get-Random -Minimum 0 -Maximum 99)"
        Status = if ($i % 20 -eq 0) { 'Down' } else { 'Up' }
        UptimeDays = Get-Random -Minimum 1 -Maximum 365
        PortCount = @(24, 48, 96)[$i % 3]
        ActivePorts = Get-Random -Minimum 10 -Maximum 48
        _DataType = 'NetworkDevices'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'NetworkInfrastructure'
        _SessionId = $SessionId
    }
}
$networkDevices | Export-Csv -Path "$OutputPath\NetworkInfrastructureDiscovery_Devices.csv" -NoTypeInformation -Encoding UTF8

# VLANs
$vlans = @()
for ($i = 1; $i -le 30; $i++) {
    $vlans += [PSCustomObject]@{
        VLANId = $i * 10 + 100
        Name = "$($departments[$i % $departments.Count])_VLAN"
        Description = "VLAN for $($departments[$i % $departments.Count]) department"
        Subnet = "10.$($i * 10).$($i % 255).0/24"
        Gateway = "10.$($i * 10).$($i % 255).1"
        DeviceCount = Get-Random -Minimum 10 -Maximum 200
        Type = @('Data', 'Voice', 'Management', 'Guest')[$i % 4]
        _DataType = 'VLANs'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'NetworkInfrastructure'
        _SessionId = $SessionId
    }
}
$vlans | Export-Csv -Path "$OutputPath\NetworkInfrastructureDiscovery_VLANs.csv" -NoTypeInformation -Encoding UTF8
#endregion

#region Physical Server Data
Write-Host "Generating Physical Server data..." -ForegroundColor Yellow

$physicalServers = @()
$serverModels = @('Dell PowerEdge R740', 'HP ProLiant DL380 Gen10', 'IBM System x3650', 'Cisco UCS C240')

for ($i = 1; $i -le 40; $i++) {
    $physicalServers += [PSCustomObject]@{
        AssetTag = "ASSET$('{0:D6}' -f (1000 + $i))"
        HostName = "PHYS-SRV-$('{0:D3}' -f $i)"
        Manufacturer = @('Dell', 'HP', 'IBM', 'Cisco')[$i % 4]
        Model = $serverModels[$i % $serverModels.Count]
        SerialNumber = "SRV$(Get-Random -Minimum 100000 -Maximum 999999)"
        ProcessorModel = @('Intel Xeon Gold 6248', 'Intel Xeon Silver 4214', 'AMD EPYC 7302')[$i % 3]
        ProcessorCount = @(2, 4)[$i % 2]
        CoreCount = @(20, 24, 32)[$i % 3]
        MemoryGB = @(128, 256, 512, 768)[$i % 4]
        StorageTB = @(2, 4, 8, 16)[$i % 4]
        RaidController = @('PERC H740P', 'Smart Array P408i', 'ServeRAID M5210')[$i % 3]
        NetworkAdapters = @(2, 4, 6)[$i % 3]
        PowerSupplies = 2
        Location = "$($locations[$i % $locations.Count]) - Rack $(Get-Random -Minimum 1 -Maximum 50)"
        WarrantyExpiry = (Get-Date).AddDays((Get-Random -Minimum -365 -Maximum 1095))
        PurchaseDate = (Get-Date).AddDays(-(Get-Random -Minimum 365 -Maximum 1825))
        _DataType = 'PhysicalServers'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'PhysicalServer'
        _SessionId = $SessionId
    }
}
$physicalServers | Export-Csv -Path "$OutputPath\PhysicalServerDiscovery_Servers.csv" -NoTypeInformation -Encoding UTF8
#endregion

#region Intune Data
Write-Host "Generating Intune data..." -ForegroundColor Yellow

$intuneDevices = @()
$devicePlatforms = @('Windows', 'iOS', 'Android', 'macOS')

for ($i = 1; $i -le 100; $i++) {
    $platform = $devicePlatforms[$i % $devicePlatforms.Count]
    $intuneDevices += [PSCustomObject]@{
        DeviceId = [Guid]::NewGuid().ToString()
        DeviceName = "$platform-Device-$('{0:D3}' -f $i)"
        UserPrincipalName = "user$i@$CompanyName.com"
        Platform = $platform
        OSVersion = if ($platform -eq 'Windows') { '10.0.19044' } elseif ($platform -eq 'iOS') { '15.7' } elseif ($platform -eq 'Android') { '12.0' } else { '13.0' }
        Model = if ($platform -eq 'Windows') { @('Surface Pro 7', 'Dell Latitude 7420', 'HP EliteBook 840')[$i % 3] } 
                elseif ($platform -eq 'iOS') { @('iPhone 13', 'iPad Pro', 'iPhone 14')[$i % 3] }
                elseif ($platform -eq 'Android') { @('Samsung Galaxy S22', 'Pixel 6', 'OnePlus 9')[$i % 3] }
                else { @('MacBook Pro', 'MacBook Air', 'iMac')[$i % 3] }
        EnrollmentDate = (Get-Date).AddDays(-(Get-Random -Minimum 30 -Maximum 730))
        LastSyncDateTime = (Get-Date).AddDays(-(Get-Random -Minimum 0 -Maximum 7))
        ComplianceState = @('Compliant', 'NonCompliant', 'InGracePeriod', 'Unknown')[$i % 4]
        ManagementState = @('Managed', 'RetirePending', 'WipePending')[$i % 3]
        Encrypted = if ($i % 10 -eq 0) { $false } else { $true }
        JailBroken = if ($i % 50 -eq 0) { $true } else { $false }
        _DataType = 'ManagedDevices'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'Intune'
        _SessionId = $SessionId
    }
}
$intuneDevices | Export-Csv -Path "$OutputPath\IntuneDiscovery_Devices.csv" -NoTypeInformation -Encoding UTF8
#endregion

#region Storage Array Data
Write-Host "Generating Storage Array data..." -ForegroundColor Yellow

$storageArrays = @()
$storageVendors = @('NetApp', 'EMC', 'Pure Storage', 'HPE Nimble', 'Dell PowerStore')

for ($i = 1; $i -le 20; $i++) {
    $storageArrays += [PSCustomObject]@{
        ArrayId = "STORAGE-$('{0:D3}' -f $i)"
        Name = "$($storageVendors[$i % $storageVendors.Count])-Array-$i"
        Vendor = $storageVendors[$i % $storageVendors.Count]
        Model = @('FAS8200', 'Unity XT 480', 'FlashArray//X', 'AF40', 'PowerStore 1000T')[$i % 5]
        SerialNumber = "STG$(Get-Random -Minimum 100000 -Maximum 999999)"
        TotalCapacityTB = @(50, 100, 200, 500, 1000)[$i % 5]
        UsedCapacityTB = Get-Random -Minimum 10 -Maximum 400
        FreeCapacityTB = Get-Random -Minimum 10 -Maximum 600
        VolumeCount = Get-Random -Minimum 10 -Maximum 100
        LunCount = Get-Random -Minimum 20 -Maximum 200
        ProtocolSupport = 'iSCSI, FC, NFS, SMB'
        DeduplicationRatio = "$(Get-Random -Minimum 2 -Maximum 5):1"
        CompressionRatio = "$(Get-Random -Minimum 2 -Maximum 4):1"
        Location = $locations[$i % $locations.Count]
        _DataType = 'StorageArrays'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'StorageArray'
        _SessionId = $SessionId
    }
}
$storageArrays | Export-Csv -Path "$OutputPath\StorageArrayDiscovery_Arrays.csv" -NoTypeInformation -Encoding UTF8
#endregion

#region Licensing Data
Write-Host "Generating Licensing data..." -ForegroundColor Yellow

$licenses = @()
$licenseProducts = @('Microsoft 365 E3', 'Microsoft 365 E5', 'Windows 10 Enterprise', 'Office 2021', 'Visual Studio Enterprise',
                     'SQL Server Enterprise', 'Exchange Online Plan 2', 'Azure AD Premium P2', 'Power BI Pro', 'Project Online')

for ($i = 1; $i -le 80; $i++) {
    $product = $licenseProducts[$i % $licenseProducts.Count]
    $licenses += [PSCustomObject]@{
        LicenseId = [Guid]::NewGuid().ToString()
        ProductName = $product
        SKU = $product.Replace(' ', '_').ToUpper()
        Vendor = if ($product -like 'Microsoft*' -or $product -like 'Windows*' -or $product -like 'Office*' -or $product -like 'SQL*' -or $product -like 'Exchange*' -or $product -like 'Azure*' -or $product -like 'Power*' -or $product -like 'Project*' -or $product -like 'Visual*') { 'Microsoft' } else { 'Other' }
        TotalLicenses = Get-Random -Minimum 50 -Maximum 500
        ConsumedLicenses = Get-Random -Minimum 10 -Maximum 450
        AvailableLicenses = Get-Random -Minimum 5 -Maximum 100
        LicenseType = @('User', 'Device', 'Subscription', 'Perpetual')[$i % 4]
        ExpiryDate = (Get-Date).AddDays((Get-Random -Minimum -30 -Maximum 730))
        PurchaseDate = (Get-Date).AddDays(-(Get-Random -Minimum 180 -Maximum 1095))
        Cost = Get-Random -Minimum 1000 -Maximum 100000
        Department = $departments[$i % $departments.Count]
        _DataType = 'Licenses'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'Licensing'
        _SessionId = $SessionId
    }
}
$licenses | Export-Csv -Path "$OutputPath\LicensingDiscovery_Licenses.csv" -NoTypeInformation -Encoding UTF8
#endregion

#region Multi-Domain Forest Data
Write-Host "Generating Multi-Domain Forest data..." -ForegroundColor Yellow

$domains = @()
$forests = @('corp.local', 'subsidiary.local', 'acquired.com')

for ($i = 1; $i -le 10; $i++) {
    $forestName = $forests[$i % $forests.Count]
    $domains += [PSCustomObject]@{
        DomainId = [Guid]::NewGuid().ToString()
        DomainName = if ($i -le 3) { $forestName } else { "child$i.$forestName" }
        ForestName = $forestName
        DomainMode = @('Windows2016Domain', 'Windows2019Domain', 'Windows2022Domain')[$i % 3]
        ForestMode = @('Windows2016Forest', 'Windows2019Forest', 'Windows2022Forest')[$i % 3]
        IsGlobalCatalog = if ($i % 3 -eq 0) { $true } else { $false }
        IsInfrastructureMaster = if ($i -eq 1) { $true } else { $false }
        IsPDCEmulator = if ($i -eq 1) { $true } else { $false }
        IsRIDMaster = if ($i -eq 1) { $true } else { $false }
        IsSchemaMaster = if ($i -eq 1) { $true } else { $false }
        IsDomainNamingMaster = if ($i -eq 1) { $true } else { $false }
        TrustCount = Get-Random -Minimum 0 -Maximum 5
        SiteCount = Get-Random -Minimum 1 -Maximum 10
        DCCount = Get-Random -Minimum 2 -Maximum 8
        UserCount = Get-Random -Minimum 100 -Maximum 5000
        ComputerCount = Get-Random -Minimum 50 -Maximum 2000
        _DataType = 'Domains'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'MultiDomainForest'
        _SessionId = $SessionId
    }
}
$domains | Export-Csv -Path "$OutputPath\MultiDomainForestDiscovery_Domains.csv" -NoTypeInformation -Encoding UTF8
#endregion

#region Entra ID App Data
Write-Host "Generating Entra ID App data..." -ForegroundColor Yellow

$entraApps = @()
$appTypes = @('Enterprise Application', 'App Registration', 'Service Principal', 'Managed Identity')

for ($i = 1; $i -le 60; $i++) {
    $entraApps += [PSCustomObject]@{
        AppId = [Guid]::NewGuid().ToString()
        DisplayName = @('HR Portal', 'Finance App', 'CRM System', 'ERP Platform', 'Custom API', 
                       'Mobile App', 'Web Portal', 'Integration Service', 'Reporting Tool', 'Analytics Dashboard')[$i % 10] + $(if ($i -gt 10) { " $i" } else { "" })
        AppType = $appTypes[$i % $appTypes.Count]
        SignInAudience = @('AzureADMyOrg', 'AzureADMultipleOrgs', 'AzureADandPersonalMicrosoftAccount')[$i % 3]
        CreatedDateTime = (Get-Date).AddDays(-(Get-Random -Minimum 30 -Maximum 730))
        ModifiedDateTime = (Get-Date).AddDays(-(Get-Random -Minimum 0 -Maximum 30))
        Publisher = if ($i % 3 -eq 0) { 'Third Party Vendor' } else { $CompanyName }
        VerifiedPublisher = if ($i % 4 -eq 0) { $false } else { $true }
        PermissionScopes = @('User.Read', 'Mail.Send', 'Files.ReadWrite', 'Directory.Read.All')[$i % 4]
        OAuth2PermissionScopes = Get-Random -Minimum 1 -Maximum 10
        AppRoles = Get-Random -Minimum 0 -Maximum 5
        PasswordCredentials = Get-Random -Minimum 0 -Maximum 3
        KeyCredentials = Get-Random -Minimum 0 -Maximum 2
        _DataType = 'EntraIDApps'
        _DiscoveryTimestamp = $timestamp
        _DiscoveryModule = 'EntraIDApp'
        _SessionId = $SessionId
    }
}
$entraApps | Export-Csv -Path "$OutputPath\EntraIDAppDiscovery_Apps.csv" -NoTypeInformation -Encoding UTF8
#endregion

# Summary
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Test Data Generation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Company: $CompanyName" -ForegroundColor Cyan
Write-Host "Session ID: $SessionId" -ForegroundColor Cyan
Write-Host "Output Directory: $OutputPath" -ForegroundColor Cyan
Write-Host "`nGenerated files:" -ForegroundColor Yellow

$csvFiles = Get-ChildItem -Path $OutputPath -Filter "*.csv" | Where-Object { $_.LastWriteTime -gt (Get-Date).AddMinutes(-5) }
foreach ($file in $csvFiles) {
    $rowCount = (Import-Csv $file.FullName).Count
    Write-Host "  - $($file.Name): $rowCount rows" -ForegroundColor White
}

Write-Host "`nTotal CSV files created: $($csvFiles.Count)" -ForegroundColor Green
Write-Host "Total data rows: $((Get-ChildItem -Path $OutputPath -Filter "*.csv" | ForEach-Object { (Import-Csv $_.FullName).Count } | Measure-Object -Sum).Sum)" -ForegroundColor Green