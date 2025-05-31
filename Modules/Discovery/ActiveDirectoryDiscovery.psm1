# Module: ActiveDirectoryDiscovery.psm1
# Description: Handles discovery of on-premises Active Directory objects.
# Version: 1.2.1 (Syntax fixes in Get-ADSitesAndServicesDataInternal)
# Date: 2025-05-31

#Requires -Modules ActiveDirectory

# --- Helper Functions (Assumed to be available globally) ---
# Export-DataToCSV
# Write-MandALog

# --- Private Functions ---

function Get-ADUsersDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "Starting AD Users Discovery..." -Level "INFO"
    $outputPath = Join-Path $Configuration.environment.outputPath "Raw"
    $allUsers = [System.Collections.Generic.List[PSObject]]::new()
    $domainController = $Configuration.environment.domainController
    $serverParams = if ($domainController) { @{ Server = $domainController } } else { @{} }

    try {
        $userProperties = @(
            'SamAccountName', 'UserPrincipalName', 'GivenName', 'Surname', 'DisplayName', 'Description',
            'DistinguishedName', 'Enabled', 'LastLogonTimestamp', 'whenCreated', 'whenChanged',
            'mail', 'proxyAddresses', 'Department', 'Title', 'Manager', 'employeeID',
            'physicalDeliveryOfficeName', 'telephoneNumber', 'mobile', 'company', 'AccountExpirationDate',
            'PasswordLastSet', 'PasswordNeverExpires', 'CannotChangePassword', 'PasswordNotRequired',
            'msDS-UserPasswordExpiryTimeComputed'
        )
        $filter = "*" # Add OU filtering logic here if needed from $Configuration.discovery.discoveryScope
        
        $adUsers = Get-ADUser -Filter $filter -Properties $userProperties @serverParams -ErrorAction SilentlyContinue
        
        if ($adUsers) {
            foreach ($user in $adUsers) {
                $lastLogonDate = $null
                try {
                    if ($user.LastLogonTimestamp -ne $null -and $user.LastLogonTimestamp -ne 0) {
                        $lastLogonDate = [datetime]::FromFileTime($user.LastLogonTimestamp)
                    }
                } catch { Write-MandALog "Could not convert LastLogonTimestamp '$($user.LastLogonTimestamp)' for user '$($user.SamAccountName)'. Error: $($_.Exception.Message)" -Level "WARN" }

                $passwordExpiryDate = "Never or Not Set"
                try {
                    if ($user.'msDS-UserPasswordExpiryTimeComputed' -ne $null -and $user.'msDS-UserPasswordExpiryTimeComputed' -ne 0 -and $user.'msDS-UserPasswordExpiryTimeComputed' -ne ([long]::MaxValue / 2) ) {
                        $passwordExpiryDate = [datetime]::FromFileTime($user.'msDS-UserPasswordExpiryTimeComputed')
                    }
                } catch { Write-MandALog "Could not convert msDS-UserPasswordExpiryTimeComputed '$($user.'msDS-UserPasswordExpiryTimeComputed')' for user '$($user.SamAccountName)'. Error: $($_.Exception.Message)" -Level "WARN" }

                $userObj = [PSCustomObject]@{
                    SamAccountName        = $user.SamAccountName
                    UserPrincipalName     = $user.UserPrincipalName
                    DisplayName           = $user.DisplayName
                    Enabled               = $user.Enabled
                    LastLogonDate         = $lastLogonDate
                    PasswordExpiryDate    = $passwordExpiryDate
                    GivenName             = $user.GivenName
                    Surname               = $user.Surname
                    Description           = $user.Description
                    DistinguishedName     = $user.DistinguishedName
                    CreatedDate           = $user.whenCreated
                    ModifiedDate          = $user.whenChanged
                    EmailAddress          = $user.mail
                    ProxyAddresses        = ($user.proxyAddresses -join ';')
                    Department            = $user.Department
                    Title                 = $user.Title
                    Manager               = $user.Manager
                    EmployeeID            = $user.employeeID
                    Office                = $user.physicalDeliveryOfficeName
                    TelephoneNumber       = $user.telephoneNumber
                    MobileNumber          = $user.mobile
                    Company               = $user.company
                    AccountExpirationDate = $user.AccountExpirationDate
                    PasswordLastSet       = $user.PasswordLastSet
                    PasswordNeverExpires  = $user.PasswordNeverExpires
                    CannotChangePassword  = $user.CannotChangePassword
                    PasswordNotRequired   = $user.PasswordNotRequired
                }
                $allUsers.Add($userObj)
            }
            if ($allUsers.Count -gt 0) {
                Export-DataToCSV -InputObject $allUsers -FileName "ADUsers.csv" -OutputPath $outputPath
                Write-MandALog "Successfully discovered and exported $($allUsers.Count) AD Users." -Level "SUCCESS"
            } else { Write-MandALog "No AD User objects were processed into the final list." -Level "INFO" }
        } else {
            Write-MandALog "No AD Users found or accessible from $domainController." -Level "WARN"
        }
    } catch {
        Write-MandALog "Error during AD Users Discovery: $($_.Exception.Message)" -Level "ERROR"
    }
    return $allUsers
}

function Get-ADGroupsDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "Starting AD Groups Discovery..." -Level "INFO"
    $outputPath = Join-Path $Configuration.environment.outputPath "Raw"
    $allGroups = [System.Collections.Generic.List[PSObject]]::new()
    $allGroupMembers = [System.Collections.Generic.List[PSObject]]::new()
    $domainController = $Configuration.environment.domainController
    $serverParams = if ($domainController) { @{ Server = $domainController } } else { @{} }

    try {
        $groupProperties = @('SamAccountName', 'Name', 'GroupCategory', 'GroupScope', 'Description', 'DistinguishedName', 'whenCreated', 'whenChanged', 'mail', 'ManagedBy', 'member')
        $adGroups = Get-ADGroup -Filter * -Properties $groupProperties @serverParams -ErrorAction SilentlyContinue
        
        if ($adGroups) {
            foreach ($group in $adGroups) {
                $allGroups.Add([PSCustomObject]@{
                    SamAccountName    = $group.SamAccountName
                    Name              = $group.Name
                    GroupCategory     = $group.GroupCategory
                    GroupScope        = $group.GroupScope
                    Description       = $group.Description
                    DistinguishedName = $group.DistinguishedName
                    CreatedDate       = $group.whenCreated
                    ModifiedDate      = $group.whenChanged
                    EmailAddress      = $group.mail
                    ManagedBy         = $group.ManagedBy
                    MemberCount       = ($group.member | Measure-Object).Count
                })
                foreach ($memberDN in $group.member) {
                    $memberObj = Get-ADObject -Identity $memberDN -Properties SamAccountName, ObjectClass @serverParams -ErrorAction SilentlyContinue
                    if ($memberObj) {
                        $allGroupMembers.Add([PSCustomObject]@{
                            GroupDN              = $group.DistinguishedName
                            GroupName            = $group.SamAccountName
                            MemberDN             = $memberDN
                            MemberSamAccountName = $memberObj.SamAccountName
                            MemberObjectClass    = $memberObj.ObjectClass
                        })
                    }
                }
            }
            if ($allGroups.Count -gt 0) {
                Export-DataToCSV -InputObject $allGroups -FileName "ADGroups.csv" -OutputPath $outputPath
                Write-MandALog "Successfully exported $($allGroups.Count) AD Groups." -Level "SUCCESS"
            } else { Write-MandALog "No AD Group objects processed." -Level "INFO" }
            if ($allGroupMembers.Count -gt 0) {
                Export-DataToCSV -InputObject $allGroupMembers -FileName "ADGroupMembers.csv" -OutputPath $outputPath
                Write-MandALog "Successfully exported $($allGroupMembers.Count) AD Group Memberships." -Level "SUCCESS"
            }
        } else { Write-MandALog "No AD Groups found or accessible from $domainController." -Level "WARN" }
    } catch { Write-MandALog "Error during AD Groups Discovery: $($_.Exception.Message). If due to referrals, try configuring a Global Catalog server." -Level "ERROR" }
    return @{Groups = $allGroups; Members = $allGroupMembers }
}

function Get-ADComputersDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "Starting AD Computers Discovery..." -Level "INFO"
    $outputPath = Join-Path $Configuration.environment.outputPath "Raw"
    $allComputers = [System.Collections.Generic.List[PSObject]]::new()
    $domainController = $Configuration.environment.domainController
    $serverParams = if ($domainController) { @{ Server = $domainController } } else { @{} }

    try {
        $computerProperties = @('Name', 'DNSHostName', 'OperatingSystem', 'OperatingSystemVersion', 'OperatingSystemServicePack', 'Enabled', 'DistinguishedName', 'whenCreated', 'whenChanged', 'LastLogonTimestamp', 'Description', 'ManagedBy', 'MemberOf')
        $adComputers = Get-ADComputer -Filter * -Properties $computerProperties @serverParams -ErrorAction SilentlyContinue
        if ($adComputers) {
            foreach ($computer in $adComputers) {
                $lastLogon = $null; try { if ($computer.LastLogonTimestamp -ne $null -and $computer.LastLogonTimestamp -ne 0) { $lastLogon = [datetime]::FromFileTime($computer.LastLogonTimestamp) } } catch {}
                $allComputers.Add([PSCustomObject]@{
                    Name                        = $computer.Name
                    DNSHostName                 = $computer.DNSHostName
                    OperatingSystem             = $computer.OperatingSystem
                    OperatingSystemVersion      = $computer.OperatingSystemVersion
                    OperatingSystemServicePack  = $computer.OperatingSystemServicePack
                    Enabled                     = $computer.Enabled
                    DistinguishedName           = $computer.DistinguishedName
                    CreatedDate                 = $computer.whenCreated
                    ModifiedDate                = $computer.whenChanged
                    LastLogonDate               = $lastLogon
                    Description                 = $computer.Description
                    ManagedBy                   = $computer.ManagedBy
                    MemberOfGroupsCount         = ($computer.MemberOf | Measure-Object).Count
                })
            }
            if ($allComputers.Count -gt 0) {
                Export-DataToCSV -InputObject $allComputers -FileName "ADComputers.csv" -OutputPath $outputPath
                Write-MandALog "Successfully exported $($allComputers.Count) AD Computers." -Level "SUCCESS"
            } else { Write-MandALog "No AD Computer objects processed." -Level "INFO" }
        } else { Write-MandALog "No AD Computers found from $domainController." -Level "WARN" }
    } catch { Write-MandALog "Error during AD Computers Discovery: $($_.Exception.Message)" -Level "ERROR" }
    return $allComputers
}

function Get-ADOUsDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "Starting AD OUs Discovery..." -Level "INFO"
    $outputPath = Join-Path $Configuration.environment.outputPath "Raw"
    $allOUs = [System.Collections.Generic.List[PSObject]]::new()
    $domainController = $Configuration.environment.domainController
    $serverParams = if ($domainController) { @{ Server = $domainController } } else { @{} }
    try {
        $ouPropertiesToSelect = @('Name', 'DistinguishedName', 'Description', 'ManagedBy', 'ProtectedFromAccidentalDeletion', 'whenCreated', 'whenChanged')
        # Ensure all properties needed for selection are requested from Get-ADOrganizationalUnit
        $adOUs = Get-ADOrganizationalUnit -Filter * -Properties $ouPropertiesToSelect @serverParams -ErrorAction SilentlyContinue
        if ($adOUs) {
            # Corrected way to create PSCustomObject with selected properties
            foreach ($ou in $adOUs) {
                $ouData = @{}
                foreach ($propName in $ouPropertiesToSelect) {
                    if ($ou.PSObject.Properties[$propName]) {
                        $ouData[$propName] = $ou.PSObject.Properties[$propName].Value
                    } else {
                        $ouData[$propName] = $null
                    }
                }
                $allOUs.Add([PSCustomObject]$ouData)
            }

            if ($allOUs.Count -gt 0) {
                Export-DataToCSV -InputObject $allOUs -FileName "ADOUs.csv" -OutputPath $outputPath
                Write-MandALog "Successfully exported $($allOUs.Count) AD OUs." -Level "SUCCESS"
            } else { Write-MandALog "No AD OU objects processed." -Level "INFO" }
        } else { Write-MandALog "No AD OUs found from $domainController." -Level "WARN" }
    } catch { Write-MandALog "Error during AD OUs Discovery: $($_.Exception.Message)" -Level "ERROR" }
    return $allOUs
}

function Get-ADSitesAndServicesDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "Starting AD Sites and Services Discovery" -Level "INFO"
    $allSiteData = [System.Collections.Generic.List[PSObject]]::new()
    $allSiteLinkData = [System.Collections.Generic.List[PSObject]]::new()
    $allSubnetData = [System.Collections.Generic.List[PSObject]]::new()
    $outputPath = Join-Path $Configuration.environment.outputPath "Raw"
    $domainController = $Configuration.environment.domainController
    $serverParams = if ($domainController) { @{ Server = $domainController } } else { @{} }
    try {
        Write-MandALog "Discovering AD Replication Sites..." -Level "INFO"
        $sites = Get-ADReplicationSite -Filter * @serverParams -ErrorAction SilentlyContinue
        if ($sites) {
            foreach ($site in $sites) {
                $serversInSiteCount = 0
                try {
                    $serversInSiteCount = (Get-ADComputer -Filter "Enabled -eq `$true -and UserAccountControl -notmatch 'WORKSTATION_TRUST_ACCOUNT|SERVER_TRUST_ACCOUNT'" -SearchBase $site.DistinguishedName @serverParams -ErrorAction SilentlyContinue | Measure-Object).Count
                } catch {
                    Write-MandALog "Could not determine ServersInSite for site '$($site.Name)'. Error: $($_.Exception.Message)" -Level "WARN"
                }

                $dcInSiteCount = 0
                try {
                    $dcInSiteCount = (Get-ADDomainController -Filter * -Site $site.Name @serverParams -ErrorAction SilentlyContinue | Measure-Object).Count
                } catch {
                    Write-MandALog "Could not determine DomainControllersInSite for site '$($site.Name)'. Error: $($_.Exception.Message)" -Level "WARN"
                }

                $allSiteData.Add([PSCustomObject]@{
                    SiteName                   = $site.Name
                    DistinguishedName          = $site.DistinguishedName
                    Location                   = $site.Location
                    Description                = $site.Description
                    IntersiteTopologyGenerator = if ($site.PSObject.Properties['Options'] -and $site.Options -ne $null) { ($site.Options -band [Microsoft.ActiveDirectory.Management.ADReplicationSiteOptions]::IntersiteTopologyGenerator) -as [bool] } else { $null }
                    IsStaleSite                = if ($site.PSObject.Properties['Options'] -and $site.Options -ne $null) { ($site.Options -band [Microsoft.ActiveDirectory.Management.ADReplicationSiteOptions]::IsStaleSite) -as [bool] } else { $null }
                    GroupMembershipCaching     = if ($site.PSObject.Properties['Options'] -and $site.Options -ne $null) { ($site.Options -band [Microsoft.ActiveDirectory.Management.ADReplicationSiteOptions]::GroupMembershipCaching) -as [bool] } else { $null }
                    ServersInSite              = $serversInSiteCount
                    DomainControllersInSite    = $dcInSiteCount
                })
            }
            if ($allSiteData.Count -gt 0) { Export-DataToCSV -InputObject $allSiteData -FileName "ADSites.csv" -OutputPath $outputPath; Write-MandALog "Exported $($allSiteData.Count) AD Sites." -Level "SUCCESS" }
        } else { Write-MandALog "No AD Sites found." -Level "WARN" }

        Write-MandALog "Discovering AD Replication Site Links..." -Level "INFO"
        $siteLinks = Get-ADReplicationSiteLink -Filter * @serverParams -ErrorAction SilentlyContinue
        if ($siteLinks) {
            $siteLinks | ForEach-Object { 
                $allSiteLinkData.Add([PSCustomObject]@{ 
                    Name                          = $_.Name
                    DistinguishedName             = $_.DistinguishedName
                    Cost                          = $_.Cost
                    ReplicationFrequencyInMinutes = $_.ReplicationFrequencyInMinutes
                    SitesIncluded                 = ($_.SitesIncluded | ForEach-Object {$_.Name}) -join ';'
                    Description                   = $_.Description 
                }) 
            }
            if ($allSiteLinkData.Count -gt 0) { Export-DataToCSV -InputObject $allSiteLinkData -FileName "ADSiteLinks.csv" -OutputPath $outputPath; Write-MandALog "Exported $($allSiteLinkData.Count) AD Site Links." -Level "SUCCESS" }
        } else { Write-MandALog "No AD Site Links found." -Level "WARN" }
        
        Write-MandALog "Discovering AD Replication Subnets..." -Level "INFO"
        $subnets = Get-ADReplicationSubnet -Filter * @serverParams -ErrorAction SilentlyContinue
        if ($subnets) {
            $subnets | ForEach-Object { 
                $allSubnetData.Add([PSCustomObject]@{ 
                    Name              = $_.Name
                    DistinguishedName = $_.DistinguishedName
                    Location          = $_.Location
                    Site              = if ($null -ne $_.Site) { $_.Site.Name } else { $null } 
                }) 
            }
            if ($allSubnetData.Count -gt 0) { Export-DataToCSV -InputObject $allSubnetData -FileName "ADSubnets.csv" -OutputPath $outputPath; Write-MandALog "Exported $($allSubnetData.Count) AD Subnets." -Level "SUCCESS" }
        } else { Write-MandALog "No AD Subnets found." -Level "WARN" }
    } catch { Write-MandALog "Error during AD Sites/Services Discovery: $($_.Exception.Message)" -Level "ERROR" }
    Write-MandALog "Finished AD Sites and Services Discovery." -Level "INFO"
    return @{ Sites = $allSiteData; SiteLinks = $allSiteLinkData; Subnets = $allSubnetData }
}

function Get-ADDNSZoneDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        [string[]]$SpecificZonesToDetail,
        [Parameter(Mandatory=$false)]
        [string]$DnsServerParam 
    )
    Write-MandALog "Starting AD DNS Zone Discovery" -Level "INFO"
    $allDNSZoneData = [System.Collections.Generic.List[PSObject]]::new()
    $allDNSRecordData = [System.Collections.Generic.List[PSObject]]::new()
    $outputPath = Join-Path $Configuration.environment.outputPath "Raw"

    if (-not (Get-Module -Name DnsServer -ListAvailable)) {
        Write-MandALog "DnsServer module not available. Skipping DNS discovery. Install RSAT: DNS Server Tools." -Level "WARN"
        return # Return empty or specific status object if preferred
    }
    $dnsServerParams = @{}
    $targetDnsServer = $DnsServerParam
    if (-not $targetDnsServer -and $Configuration.discovery.adDns.dnsServer) { $targetDnsServer = $Configuration.discovery.adDns.dnsServer }
    if (-not $targetDnsServer) { $targetDnsServer = $Configuration.environment.domainController }
    if ($targetDnsServer) { $dnsServerParams.ComputerName = $targetDnsServer; Write-MandALog "Targeting DNS server: $targetDnsServer." -Level "INFO" }
    else { Write-MandALog "No DNS server specified, using local/default. This may fail if not on a DNS server/DC." -Level "WARN" }
    
    $zonesToDetail = $SpecificZonesToDetail
    if (-not $zonesToDetail -and $Configuration.discovery.adDns.detailedZones) { $zonesToDetail = @($Configuration.discovery.adDns.detailedZones) } 
    if (-not $zonesToDetail) { $zonesToDetail = @(); Write-MandALog "No specific DNS zones for detailed export." -Level "INFO" }

    try {
        $zones = Get-DnsServerZone @dnsServerParams -ErrorAction SilentlyContinue
        if ($zones) {
            foreach ($zone in $zones) {
                $replicationScopeValue = "N/A"
                if ($zone.IsDsIntegrated -and $zone.PSObject.Properties['ReplicationScope'] -and $null -ne $zone.ReplicationScope) { 
                    try { $replicationScopeValue = $zone.ReplicationScope.ToString() } catch { $replicationScopeValue = "ErrorReadingScope" }
                }
                $allDNSZoneData.Add([PSCustomObject]@{
                    ZoneName         = $zone.ZoneName
                    ZoneType         = $zone.ZoneType.ToString()
                    IsReverseLookup  = $zone.IsReverseLookupZone
                    IsDsIntegrated   = $zone.IsDsIntegrated
                    IsSigned         = $zone.IsSigned
                    DynamicUpdate    = $zone.DynamicUpdate.ToString()
                    ReplicationScope = $replicationScopeValue
                })
                if ($zonesToDetail -contains $zone.ZoneName) {
                    $records = Get-DnsServerResourceRecord -ZoneName $zone.ZoneName @dnsServerParams -RRType All -ErrorAction SilentlyContinue
                    if ($records) {
                        foreach ($record in $records) {
                            $allDNSRecordData.Add([PSCustomObject]@{
                                ZoneName    = $zone.ZoneName
                                HostName    = $record.HostName
                                RecordType  = $record.RecordType.ToString()
                                Timestamp   = if ($record.Timestamp) {$record.Timestamp} else {$null}
                                TimeToLive  = $record.TimeToLive.ToString()
                                RecordData  = switch ($record.RecordType) {
                                    "A"     { $record.RecordData.IPV4Address.IPAddressToString } 
                                    "AAAA"  { $record.RecordData.IPV6Address.IPAddressToString }
                                    "CNAME" { $record.RecordData.HostNameAlias } 
                                    "MX"    { "Pref=$($record.RecordData.Preference);Exch=$($record.RecordData.MailExchange)" }
                                    "NS"    { $record.RecordData.NameServer } 
                                    "PTR"   { $record.RecordData.PtrDomainName }
                                    "SOA"   { "PriSrv=$($record.RecordData.PrimaryServer);RespP=$($record.RecordData.ResponsiblePerson);Serial=$($record.RecordData.SerialNumber)"}
                                    "SRV"   { "Dom=$($record.RecordData.DomainName);Port=$($record.RecordData.Port);Pri=$($record.RecordData.Priority);Wght=$($record.RecordData.Weight)" }
                                    "TXT"   { ($record.RecordData.DescriptiveText -join '; ') } 
                                    default { "Unhandled: $($record.RecordType)" }
                                }
                            }) 
                        }
                    } else { Write-MandALog "No records for zone $($zone.ZoneName)." -Level "DEBUG" }
                }
            }
            if ($allDNSZoneData.Count -gt 0) { Export-DataToCSV -InputObject $allDNSZoneData -FileName "ADDNSZones.csv" -OutputPath $outputPath; Write-MandALog "Exported $($allDNSZoneData.Count) DNS Zones." -Level "SUCCESS" }
            if ($allDNSRecordData.Count -gt 0) { Export-DataToCSV -InputObject $allDNSRecordData -FileName "ADDNSRecords_Detailed.csv" -OutputPath $outputPath; Write-MandALog "Exported $($allDNSRecordData.Count) detailed DNS records." -Level "SUCCESS" }
        } else { Write-MandALog "No DNS Zones found from $targetDnsServer." -Level "WARN" }
    } catch { Write-MandALog "Error during DNS Zone Discovery: $($_.Exception.Message)" -Level "ERROR" }
    Write-MandALog "Finished AD DNS Zone Discovery." -Level "INFO"
    return @{ Zones = $allDNSZoneData; Records = $allDNSRecordData }
}

# --- Public Function (Exported) ---
function Invoke-ActiveDirectoryDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "--- Starting Active Directory Discovery Phase ---" -Level "HEADER"
    $overallStatus = $true; $discoveredData = @{}
    if (-not (Get-Module -Name ActiveDirectory -ListAvailable)) { Write-MandALog "ActiveDirectory module not available. Install RSAT: AD DS Tools." -Level "ERROR"; return $null }
    $dc = $Configuration.environment.domainController
    if (-not $dc) { Write-MandALog "Domain controller not specified. Skipping AD Discovery." -Level "ERROR"; return $null }
    if (-not (Test-Connection -ComputerName $dc -Count 1 -Quiet -ErrorAction SilentlyContinue)) { Write-MandALog "DC '$dc' unreachable. Skipping AD Discovery." -Level "ERROR"; return $null }
    Write-MandALog "DC '$dc' reachable." -Level "INFO"
    try {
        $discoveredData.Users = Get-ADUsersDataInternal -Configuration $Configuration
        $discoveredData.GroupsAndMembers = Get-ADGroupsDataInternal -Configuration $Configuration
        $discoveredData.Computers = Get-ADComputersDataInternal -Configuration $Configuration
        $discoveredData.OUs = Get-ADOUsDataInternal -Configuration $Configuration
        $discoveredData.SitesAndServices = Get-ADSitesAndServicesDataInternal -Configuration $Configuration
        $discoveredData.DNSInfo = Get-ADDNSZoneDataInternal -Configuration $Configuration
    } catch { Write-MandALog "Error in AD Discovery Phase: $($_.Exception.Message)" -Level "ERROR"; $overallStatus = $false }
    if ($overallStatus) { Write-MandALog "--- AD Discovery Phase Completed Successfully ---" -Level "SUCCESS" }
    else { Write-MandALog "--- AD Discovery Phase Completed With Errors ---" -Level "ERROR" }
    return $discoveredData
}
Export-ModuleMember -Function Invoke-ActiveDirectoryDiscovery
