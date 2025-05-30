# Module: ActiveDirectoryDiscovery.psm1
# Description: Handles discovery of on-premises Active Directory objects,
#              including users, groups, computers, OUs, Sites, Services, and DNS.
# Version: 1.1.0
# Date: 2025-05-30

#Requires -Modules ActiveDirectory # DnsServer module is checked dynamically within Get-ADDNSZoneData

# --- Helper Functions (Assumed to be available globally from Utility Modules like FileOperations.psm1 and EnhancedLogging.psm1) ---
# Export-DataToCSV -FunctionPath $global:MandAUtilitiesModulesPath\FileOperations.psm1
# Write-MandALog -FunctionPath $global:MandAUtilitiesModulesPath\EnhancedLogging.psm1

# --- Private Functions (Specific to this module) ---

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

    try {
        $userProperties = @(
            'SamAccountName', 'UserPrincipalName', 'GivenName', 'Surname', 'DisplayName', 'Description',
            'DistinguishedName', 'Enabled', 'LastLogonTimestamp', 'whenCreated', 'whenChanged',
            'mail', 'proxyAddresses', 'Department', 'Title', 'Manager', 'employeeID',
            'physicalDeliveryOfficeName', 'telephoneNumber', 'mobile', 'company', 'AccountExpirationDate',
            'PasswordLastSet', 'PasswordNeverExpires', 'CannotChangePassword', 'PasswordNotRequired',
            'msDS-UserPasswordExpiryTimeComputed' # For password expiry date
        )
        
        # Add filter for discoveryScope if defined in config
        $filter = "*"
        if ($Configuration.discovery.discoveryScope.includedOUs.Count -gt 0) {
            # Complex logic to build OU based filter, or iterate Get-ADUser per OU
            Write-MandALog "OU specific filtering for users is not fully implemented in this example. Discovering all users." -Level "WARN"
        }

        $adUsers = Get-ADUser -Filter $filter -Properties $userProperties -Server $domainController -ErrorAction SilentlyContinue
        
        if ($adUsers) {
            foreach ($user in $adUsers) {
                $userObj = [PSCustomObject]@{
                    SamAccountName        = $user.SamAccountName
                    UserPrincipalName     = $user.UserPrincipalName
                    GivenName             = $user.GivenName
                    Surname               = $user.Surname
                    DisplayName           = $user.DisplayName
                    Description           = $user.Description
                    DistinguishedName     = $user.DistinguishedName
                    Enabled               = $user.Enabled
                    LastLogonDate         = if ($null -ne $user.LastLogonTimestamp -and 0 -ne $user.LastLogonTimestamp) { [datetime]::FromFileTime($user.LastLogonTimestamp) } else { $null }
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
                    PasswordExpiryDate    = if ($user.'msDS-UserPasswordExpiryTimeComputed' -ne $null -and $user.'msDS-UserPasswordExpiryTimeComputed' -ne 0 -and $user.'msDS-UserPasswordExpiryTimeComputed' -ne ([long]::MaxValue / 2) ) { [datetime]::FromFileTime($user.'msDS-UserPasswordExpiryTimeComputed') } else { "Never or Not Set" }
                }
                $allUsers.Add($userObj)
            }
            Export-DataToCSV -InputObject $allUsers -FileName "ADUsers.csv" -OutputPath $outputPath
            Write-MandALog "Successfully discovered and exported $($allUsers.Count) AD Users." -Level "SUCCESS"
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

    try {
        $groupProperties = @(
            'SamAccountName', 'Name', 'GroupCategory', 'GroupScope', 'Description',
            'DistinguishedName', 'whenCreated', 'whenChanged', 'mail', 'ManagedBy', 'member'
        )
        $adGroups = Get-ADGroup -Filter * -Properties $groupProperties -Server $domainController -ErrorAction SilentlyContinue
        
        if ($adGroups) {
            foreach ($group in $adGroups) {
                $groupObj = [PSCustomObject]@{
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
                }
                $allGroups.Add($groupObj)

                # Get Members
                foreach ($memberDN in $group.member) {
                    $memberObj = Get-ADObject -Identity $memberDN -Properties SamAccountName, ObjectClass -Server $domainController -ErrorAction SilentlyContinue
                    if ($memberObj) {
                        $allGroupMembers.Add([PSCustomObject]@{
                            GroupDN         = $group.DistinguishedName
                            GroupName       = $group.SamAccountName
                            MemberDN        = $memberDN
                            MemberSamAccountName = $memberObj.SamAccountName
                            MemberObjectClass = $memberObj.ObjectClass
                        })
                    }
                }
            }
            Export-DataToCSV -InputObject $allGroups -FileName "ADGroups.csv" -OutputPath $outputPath
            Write-MandALog "Successfully discovered and exported $($allGroups.Count) AD Groups." -Level "SUCCESS"
            
            Export-DataToCSV -InputObject $allGroupMembers -FileName "ADGroupMembers.csv" -OutputPath $outputPath
            Write-MandALog "Successfully discovered and exported $($allGroupMembers.Count) AD Group Memberships." -Level "SUCCESS"
        } else {
            Write-MandALog "No AD Groups found or accessible from $domainController." -Level "WARN"
        }
    } catch {
        Write-MandALog "Error during AD Groups Discovery: $($_.Exception.Message)" -Level "ERROR"
    }
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

    try {
        $computerProperties = @(
            'Name', 'DNSHostName', 'OperatingSystem', 'OperatingSystemVersion', 'OperatingSystemServicePack',
            'Enabled', 'DistinguishedName', 'whenCreated', 'whenChanged', 'LastLogonTimestamp', 'Description',
            'ManagedBy', 'MemberOf'
        )
        $adComputers = Get-ADComputer -Filter * -Properties $computerProperties -Server $domainController -ErrorAction SilentlyContinue
        
        if ($adComputers) {
            foreach ($computer in $adComputers) {
                $computerObj = [PSCustomObject]@{
                    Name                    = $computer.Name
                    DNSHostName             = $computer.DNSHostName
                    OperatingSystem         = $computer.OperatingSystem
                    OperatingSystemVersion  = $computer.OperatingSystemVersion
                    OperatingSystemServicePack = $computer.OperatingSystemServicePack
                    Enabled                 = $computer.Enabled
                    DistinguishedName       = $computer.DistinguishedName
                    CreatedDate             = $computer.whenCreated
                    ModifiedDate            = $computer.whenChanged
                    LastLogonDate           = if ($computer.LastLogonTimestamp -ne $null -and $computer.LastLogonTimestamp -ne 0) { [datetime]::FromFileTime($computer.LastLogonTimestamp) } else { $null }
                    Description             = $computer.Description
                    ManagedBy               = $computer.ManagedBy
                    MemberOfGroupsCount     = ($computer.MemberOf | Measure-Object).Count
                }
                $allComputers.Add($computerObj)
            }
            Export-DataToCSV -InputObject $allComputers -FileName "ADComputers.csv" -OutputPath $outputPath
            Write-MandALog "Successfully discovered and exported $($allComputers.Count) AD Computers." -Level "SUCCESS"
        } else {
            Write-MandALog "No AD Computers found or accessible from $domainController." -Level "WARN"
        }
    } catch {
        Write-MandALog "Error during AD Computers Discovery: $($_.Exception.Message)" -Level "ERROR"
    }
    return $allComputers
}

function Get-ADOUsDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "Starting AD Organizational Units (OUs) Discovery..." -Level "INFO"
    $outputPath = Join-Path $Configuration.environment.outputPath "Raw"
    $allOUs = [System.Collections.Generic.List[PSObject]]::new()
    $domainController = $Configuration.environment.domainController

    try {
        $ouProperties = @(
            'Name', 'DistinguishedName', 'Description', 'ManagedBy', 'ProtectedFromAccidentalDeletion',
            'whenCreated', 'whenChanged'
        )
        $adOUs = Get-ADOrganizationalUnit -Filter * -Properties $ouProperties -Server $domainController -ErrorAction SilentlyContinue
        
        if ($adOUs) {
            foreach ($ou in $adOUs) {
                $ouObj = [PSCustomObject]@{
                    Name              = $ou.Name
                    DistinguishedName = $ou.DistinguishedName
                    Description       = $ou.Description
                    ManagedBy         = $ou.ManagedBy
                    ProtectedFromAccidentalDeletion = $ou.ProtectedFromAccidentalDeletion
                    CreatedDate       = $ou.whenCreated
                    ModifiedDate      = $ou.whenChanged
                    # Add User/Computer/Group counts if needed (can be slow)
                    # UserCount         = (Get-ADUser -Filter * -SearchBase $ou.DistinguishedName -SearchScope OneLevel -ErrorAction SilentlyContinue).Count
                }
                $allOUs.Add($ouObj)
            }
            Export-DataToCSV -InputObject $allOUs -FileName "ADOUs.csv" -OutputPath $outputPath
            Write-MandALog "Successfully discovered and exported $($allOUs.Count) AD OUs." -Level "SUCCESS"
        } else {
            Write-MandALog "No AD OUs found or accessible from $domainController." -Level "WARN"
        }
    } catch {
        Write-MandALog "Error during AD OUs Discovery: $($_.Exception.Message)" -Level "ERROR"
    }
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

    try {
        Write-MandALog "Discovering AD Replication Sites..." -Level "INFO"
        $sites = Get-ADReplicationSite -Filter * -Server $domainController -ErrorAction SilentlyContinue
        if ($sites) {
            foreach ($site in $sites) {
                $siteInfo = [PSCustomObject]@{
                    SiteName                = $site.Name
                    DistinguishedName       = $site.DistinguishedName
                    Location                = $site.Location
                    Description             = $site.Description
                    IntersiteTopologyGenerator = if ($site.PSObject.Properties['Options'] -and $site.Options -ne $null) { ($site.Options -band [Microsoft.ActiveDirectory.Management.ADReplicationSiteOptions]::IntersiteTopologyGenerator) -as [bool] } else { $null }
                    IsStaleSite             = if ($site.PSObject.Properties['Options'] -and $site.Options -ne $null) { ($site.Options -band [Microsoft.ActiveDirectory.Management.ADReplicationSiteOptions]::IsStaleSite) -as [bool] } else { $null }
                    GroupMembershipCaching  = if ($site.PSObject.Properties['Options'] -and $site.Options -ne $null) { ($site.Options -band [Microsoft.ActiveDirectory.Management.ADReplicationSiteOptions]::GroupMembershipCaching) -as [bool] } else { $null }
                    ServersInSite           = try { (Get-ADComputer -Filter "Enabled -eq `$true -and UserAccountControl -notmatch 'WORKSTATION_TRUST_ACCOUNT|SERVER_TRUST_ACCOUNT'" -SearchBase $site.DistinguishedName -Server $domainController -ErrorAction SilentlyContinue | Measure-Object).Count } catch {0}
                }
                $allSiteData.Add($siteInfo)
            }
            Export-DataToCSV -InputObject $allSiteData -FileName "ADSites.csv" -OutputPath $outputPath
            Write-MandALog "Successfully discovered and exported $($allSiteData.Count) AD Sites." -Level "SUCCESS"
        } else {
            Write-MandALog "No AD Replication Sites found or accessible from $domainController." -Level "WARN"
        }

        Write-MandALog "Discovering AD Replication Site Links..." -Level "INFO"
        $siteLinks = Get-ADReplicationSiteLink -Filter * -Server $domainController -ErrorAction SilentlyContinue
        if ($siteLinks) {
            $siteLinks | ForEach-Object {
                $allSiteLinkData.Add([PSCustomObject]@{
                    Name = $_.Name
                    DistinguishedName = $_.DistinguishedName
                    Cost = $_.Cost
                    ReplicationFrequencyInMinutes = $_.ReplicationFrequencyInMinutes
                    SitesIncluded = ($_.SitesIncluded | ForEach-Object {$_.Name}) -join ';' # Get site names
                    Description = $_.Description
                })
            }
            Export-DataToCSV -InputObject $allSiteLinkData -FileName "ADSiteLinks.csv" -OutputPath $outputPath
            Write-MandALog "Successfully discovered and exported $($allSiteLinkData.Count) AD Site Links." -Level "SUCCESS"
        } else {
            Write-MandALog "No AD Replication Site Links found or accessible from $domainController." -Level "WARN"
        }
        
        Write-MandALog "Discovering AD Replication Subnets..." -Level "INFO"
        $subnets = Get-ADReplicationSubnet -Filter * -Server $domainController -ErrorAction SilentlyContinue
        if ($subnets) {
            $subnets | ForEach-Object {
                $allSubnetData.Add([PSCustomObject]@{
                    Name = $_.Name
                    DistinguishedName = $_.DistinguishedName
                    Location = $_.Location
                    Site = if ($null -ne $_.Site) { $_.Site.Name } else { $null } # Get site name safely
                })
            }
            Export-DataToCSV -InputObject $allSubnetData -FileName "ADSubnets.csv" -OutputPath $outputPath
            Write-MandALog "Successfully discovered and exported $($allSubnetData.Count) AD Subnets." -Level "SUCCESS"
        } else {
            Write-MandALog "No AD Replication Subnets found or accessible from $domainController." -Level "WARN"
        }

    } catch {
        Write-MandALog "Error during AD Sites and Services Discovery: $($_.Exception.Message)" -Level "ERROR"
    }
    Write-MandALog "Finished AD Sites and Services Discovery." -Level "INFO"
    return @{ Sites = $allSiteData; SiteLinks = $allSiteLinkData; Subnets = $allSubnetData }
}

function Get-ADDNSZoneDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        [string[]]$SpecificZonesToDetail, # Example: $Configuration.discovery.adDns.detailedZones
        [Parameter(Mandatory=$false)]
        [string]$DnsServer # Optional: target a specific DNS server for queries
    )

    Write-MandALog "Starting AD DNS Zone Discovery" -Level "INFO"
    $allDNSZoneData = [System.Collections.Generic.List[PSObject]]::new()
    $allDNSRecordData = [System.Collections.Generic.List[PSObject]]::new()
    $outputPath = Join-Path $Configuration.environment.outputPath "Raw"

    if (-not (Get-Module -Name DnsServer -ListAvailable)) {
        Write-MandALog "DnsServer PowerShell module is not available. Skipping detailed DNS zone discovery. Please install RSAT: DNS Server Tools." -Level "WARN"
        return
    }

    $dnsServerParams = @{}
    # Prioritize DnsServer from param, then config, then fallback to domainController from config
    $targetDnsServer = $DnsServer # From parameter
    if (-not $targetDnsServer -and $Configuration.discovery.adDns.dnsServer) {
        $targetDnsServer = $Configuration.discovery.adDns.dnsServer
    }
    if (-not $targetDnsServer) {
        $targetDnsServer = $Configuration.environment.domainController
    }

    if ($targetDnsServer) {
        $dnsServerParams.ComputerName = $targetDnsServer
        Write-MandALog "Targeting DNS server: $targetDnsServer for DNS queries." -Level "INFO"
    } else {
        Write-MandALog "No specific DNS server targeted for DNS queries, using local or default. This might fail if not run on a DNS server or DC." -Level "WARN"
    }
    
    $zonesToDetail = $SpecificZonesToDetail
    if (-not $zonesToDetail -and $Configuration.discovery.adDns.detailedZones) {
        $zonesToDetail = $Configuration.discovery.adDns.detailedZones
    }
    if (-not $zonesToDetail) {
        $zonesToDetail = @() # Ensure it's an empty array if not defined
        Write-MandALog "No specific DNS zones configured for detailed record export (Configuration.discovery.adDns.detailedZones)." -Level "INFO"
    }


    try {
        Write-MandALog "Discovering DNS Zones..." -Level "INFO"
        $zones = Get-DnsServerZone @dnsServerParams -ErrorAction SilentlyContinue
        if ($zones) {
            foreach ($zone in $zones) {
                $zoneInfo = [PSCustomObject]@{
                    ZoneName        = $zone.ZoneName
                    ZoneType        = $zone.ZoneType.ToString()
                    IsReverseLookup = $zone.IsReverseLookupZone
                    IsDsIntegrated  = $zone.IsDsIntegrated
                    IsSigned        = $zone.IsSigned
                    DynamicUpdate   = $zone.DynamicUpdate.ToString()
                    ReplicationScope = if ($zone.IsDsIntegrated) { try {$zone.ReplicationScope.ToString()} catch{"ErrorReadingScope"} } else { "N/A" }
                }
                $allDNSZoneData.Add($zoneInfo)

                if ($zonesToDetail -contains $zone.ZoneName) {
                    Write-MandALog "Getting records for DNS Zone: $($zone.ZoneName)..." -Level "DEBUG"
                    $records = Get-DnsServerResourceRecord -ZoneName $zone.ZoneName @dnsServerParams -RRType All -ErrorAction SilentlyContinue
                    if ($records) {
                        foreach ($record in $records) {
                            $recordDetail = [PSCustomObject]@{
                                ZoneName    = $zone.ZoneName
                                HostName    = $record.HostName
                                RecordType  = $record.RecordType.ToString()
                                Timestamp   = if ($record.Timestamp) {$record.Timestamp} else {$null} # Timestamp might be $null
                                TimeToLive  = $record.TimeToLive.ToString()
                                RecordData  = switch ($record.RecordType) {
                                    "A"       { $record.RecordData.IPV4Address.IPAddressToString }
                                    "AAAA"    { $record.RecordData.IPV6Address.IPAddressToString }
                                    "CNAME"   { $record.RecordData.HostNameAlias }
                                    "MX"      { "Preference=$($record.RecordData.Preference); Exchange=$($record.RecordData.MailExchange)" }
                                    "NS"      { $record.RecordData.NameServer }
                                    "PTR"     { $record.RecordData.PtrDomainName }
                                    "SOA"     { "PrimaryServer=$($record.RecordData.PrimaryServer); ResponsiblePerson=$($record.RecordData.ResponsiblePerson); SerialNumber=$($record.RecordData.SerialNumber)"}
                                    "SRV"     { "DomainName=$($record.RecordData.DomainName); Port=$($record.RecordData.Port); Priority=$($record.RecordData.Priority); Weight=$($record.RecordData.Weight)" }
                                    "TXT"     { ($record.RecordData.DescriptiveText -join '; ') }
                                    default   { "Complex or Unhandled Type: $($record.RecordType)" }
                                }
                            }
                            $allDNSRecordData.Add($recordDetail)
                        }
                    } else {
                         Write-MandALog "No records found for DNS Zone: $($zone.ZoneName) or error occurred." -Level "DEBUG"
                    }
                }
            }
            Export-DataToCSV -InputObject $allDNSZoneData -FileName "ADDNSZones.csv" -OutputPath $outputPath
            Write-MandALog "Successfully discovered and exported $($allDNSZoneData.Count) AD DNS Zones." -Level "SUCCESS"
            if ($allDNSRecordData.Count -gt 0) {
                Export-DataToCSV -InputObject $allDNSRecordData -FileName "ADDNSRecords_Detailed.csv" -OutputPath $outputPath
                Write-MandALog "Successfully exported $($allDNSRecordData.Count) DNS records from specified zones." -Level "SUCCESS"
            }
        } else {
            Write-MandALog "No DNS Zones found or accessible via Get-DnsServerZone from $targetDnsServer." -Level "WARN"
        }
    } catch {
        Write-MandALog "Error during AD DNS Zone Discovery: $($_.Exception.Message)" -Level "ERROR"
    }
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
    $overallStatus = $true
    $discoveredData = @{}

    # Check if ActiveDirectory module is available
    if (-not (Get-Module -Name ActiveDirectory -ListAvailable)) {
        Write-MandALog "ActiveDirectory PowerShell module is not available. Skipping AD discovery. Please install RSAT: AD DS Tools." -Level "ERROR"
        return $null # Or an object indicating failure/skip
    }
    
    # Check Domain Controller connectivity (basic ping test)
    $dc = $Configuration.environment.domainController
    if (-not $dc) {
        Write-MandALog "Domain controller not specified in configuration (environment.domainController). Skipping AD Discovery." -Level "ERROR"
        return $null
    }
    if (-not (Test-Connection -ComputerName $dc -Count 1 -Quiet -ErrorAction SilentlyContinue)) {
        Write-MandALog "Domain controller '$dc' is not reachable. Skipping AD Discovery." -Level "ERROR"
        return $null
    }
    Write-MandALog "Domain controller '$dc' is reachable." -Level "INFO"


    try {
        $discoveredData.Users = Get-ADUsersDataInternal -Configuration $Configuration
        $discoveredData.GroupsAndMembers = Get-ADGroupsDataInternal -Configuration $Configuration
        $discoveredData.Computers = Get-ADComputersDataInternal -Configuration $Configuration
        $discoveredData.OUs = Get-ADOUsDataInternal -Configuration $Configuration
        $discoveredData.SitesAndServices = Get-ADSitesAndServicesDataInternal -Configuration $Configuration
        $discoveredData.DNSInfo = Get-ADDNSZoneDataInternal -Configuration $Configuration
        
        # Add calls to other internal AD discovery functions here if they exist
        # e.g., $discoveredData.GPOs = Get-ADGPOsInternal -Configuration $Configuration
        
    } catch {
        Write-MandALog "An error occurred during the Active Directory Discovery Phase: $($_.Exception.Message)" -Level "CRITICAL_ERROR"
        $overallStatus = $false
    }

    if ($overallStatus) {
        Write-MandALog "--- Active Directory Discovery Phase Completed Successfully ---" -Level "SUCCESS"
    } else {
        Write-MandALog "--- Active Directory Discovery Phase Completed With Errors ---" -Level "ERROR"
    }
    
    return $discoveredData # Return all collected data
}

Export-ModuleMember -Function Invoke-ActiveDirectoryDiscovery
