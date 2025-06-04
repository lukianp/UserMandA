#Requires -Modules ActiveDirectory, DnsServer
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
Import-Module "$PSScriptRoot\..\Utilities\DataExport.psm1" -Force
$outputPath = $Context.Paths.RawDataOutput
# Private discovery functions
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
            Export-DataToCSV -Data $allUsers -FilePath (Join-Path $Context.Paths.RawDataOutput "ADUsers.csv") -Context $Context
            
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
            Export-DataToCSV -Data $allGroups -FilePath (Join-Path $Context.Paths.RawDataOutput "ADGroups.csv") -Context $Context
            Export-DataToCSV -Data $allGroupMembers -FilePath (Join-Path $Context.Paths.RawDataOutput "ADGroupMembers.csv") -Context $Context
            
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
            
            Export-DataToCSV -Data $allComputers -FilePath (Join-Path $Context.Paths.RawDataOutput "ADComputers.csv") -Context $Context
            
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
        Export-DataToCSV -Data $result.Sites -FilePath (Join-Path $Context.Paths.RawDataOutput "ADSites.csv") -Context $Context
        Export-DataToCSV -Data $result.SiteLinks -FilePath (Join-Path $Context.Paths.RawDataOutput "ADSiteLinks.csv") -Context $Context
        Export-DataToCSV -Data $result.Subnets -FilePath (Join-Path $Context.Paths.RawDataOutput "ADSubnets.csv") -Context $Context
        
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
        Export-DataToCSV -Data $result.Zones -FilePath (Join-Path $Context.Paths.RawDataOutput "ADDNSZones.csv") -Context $Context
        
        if ($result.Records.Count -gt 0) {
            Export-DataToCSV -Data $result.Records -FilePath (Join-Path $Context.Paths.RawDataOutput "ADDNSRecords_Detailed.csv") -Context $Context
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

# Main exported function
function Invoke-ActiveDirectoryDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        $Context
    )
    
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
    
    # Validate Active Directory module
    if (-not (Get-Module -Name ActiveDirectory -ListAvailable)) {
        $Context.ErrorCollector.AddError("ActiveDirectory", "ActiveDirectory PowerShell module is not available", $null)
        Write-MandALog "ActiveDirectory module not available. Please install RSAT." -Level "ERROR" -Context $Context
        return $null
    }
    
    # Validate connectivity
    $targetServer = $Configuration.environment.globalCatalog
    if (-not $targetServer) { $targetServer = $Configuration.environment.domainController }
    
    if ($targetServer) {
        if (-not (Test-Connection -ComputerName $targetServer -Count 1 -Quiet)) {
            $Context.ErrorCollector.AddError("ActiveDirectory", "Cannot reach AD server: $targetServer", $null)
            Write-MandALog "Target AD server unreachable: $targetServer" -Level "ERROR" -Context $Context
            return $null
        }
    }
    
    # Execute discovery functions
    $discoveredData = @{}
    
    try {
        $discoveredData.Users = Get-ADUsersDataInternal -Configuration $Configuration -Context $Context
        $discoveredData.GroupsAndMembers = Get-ADGroupsDataInternal -Configuration $Configuration -Context $Context
        $discoveredData.Computers = Get-ADComputersDataInternal -Configuration $Configuration -Context $Context
        $discoveredData.OUs = Get-ADOUsDataInternal -Configuration $Configuration -Context $Context
        $discoveredData.SitesAndServices = Get-ADSitesAndServicesDataInternal -Configuration $Configuration -Context $Context
        $discoveredData.DNSInfo = Get-ADDNSZoneDataInternal -Configuration $Configuration -Context $Context
        
        Write-MandALog "--- Active Directory Discovery Phase Completed Successfully ---" -Level "SUCCESS" -Context $Context
    }
    catch {
        $Context.ErrorCollector.AddError("ActiveDirectory", "Critical error during discovery", $_.Exception)
        Write-MandALog "Critical error during AD Discovery: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    
    return $discoveredData
}

# Export module members
Export-ModuleMember -Function @('Invoke-ActiveDirectoryDiscovery')