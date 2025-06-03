#Requires -Modules ActiveDirectory, DnsServer
<#
.SYNOPSIS
    Handles discovery of on-premises Active Directory objects.
    Includes users, groups, computers, OUs, Sites, Services, and DNS.
.DESCRIPTION
    This module provides comprehensive Active Directory discovery capabilities
    for the M&A Discovery Suite. It collects detailed information and exports
    it to CSV files in the specified 'Raw' output directory.
    Incorporates robust error handling, referral mitigation by using Global Catalog,
    and correct filter syntax.
.NOTES
    Version: 2.1.2 (Fixed)
    Author: M&A Discovery Suite Team
    Date: 2025-06-03
    Changes: Fixed LDAP filter syntax and parameter set conflicts in Get-ADSitesAndServicesDataInternal
#>

# --- Helper Function ---
function Export-MandAData {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [object[]]$Data,
        [Parameter(Mandatory=$true)]
        [string]$FileName,
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        [string]$SubFolder = "Raw" # Allows specifying a subfolder like "Raw/AD"
    )
    $baseOutputPath = $Configuration.environment.outputPath
    $outputPath = Join-Path $baseOutputPath $SubFolder
    
    if (-not (Test-Path $outputPath -PathType Container)) {
        try {
            New-Item -Path $outputPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
            Write-MandALog "Created directory: $outputPath" -Level "INFO"
        } catch {
            Write-MandALog "Failed to create directory $outputPath. Error: $($_.Exception.Message)" -Level "ERROR"
            return # Cannot proceed without output path
        }
    }

    $fullPath = Join-Path $outputPath "$($FileName).csv"

    if ($null -eq $Data -or $Data.Count -eq 0) {
        Write-MandALog "No data provided to export for $FileName." -Level "WARN"
        return
    }

    try {
        Write-MandALog "Exporting $($Data.Count) records to $fullPath..." -Level "INFO"
        $Data | Export-Csv -Path $fullPath -NoTypeInformation -Force -Encoding UTF8
        Write-MandALog "Successfully exported $FileName to $fullPath" -Level "SUCCESS"
    } catch {
        Write-MandALog "Failed to export data to $fullPath. Error: $($_.Exception.Message)" -Level "ERROR"
    }
}

# --- Private Functions (Specific to this module) ---

function Get-ADUsersDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "Starting AD Users Discovery..." -Level "INFO"
    $allUsers = [System.Collections.Generic.List[PSObject]]::new()
    $globalCatalog = $Configuration.environment.globalCatalog
    $serverParams = if ($globalCatalog) { @{ Server = $globalCatalog } } else { @{} }

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
        
        $adUsers = Get-ADUser -Filter $filter -Properties $userProperties @serverParams -ErrorAction Stop
        
        if ($null -ne $adUsers) {
            foreach ($user in $adUsers) {
                $lastLogonDate = $null
                try {
                    if ($null -ne $user.LastLogonTimestamp -and 0 -ne $user.LastLogonTimestamp) { # Corrected null check
                        if ($user.LastLogonTimestamp -gt 0) {
                            $lastLogonDate = [datetime]::FromFileTime($user.LastLogonTimestamp)
                        } else {
                             Write-MandALog "Invalid (negative or zero) LastLogonTimestamp '$($user.LastLogonTimestamp)' for user '$($user.SamAccountName)'. Setting to null." -Level "DEBUG"
                        }
                    }
                } catch { Write-MandALog "Could not convert LastLogonTimestamp '$($user.LastLogonTimestamp)' for user '$($user.SamAccountName)'. Error: $($_.Exception.Message)" -Level "WARN" }

                $passwordExpiryDateValue = "Not Set/Error"
                $expiryTimeComputed = $user.'msDS-UserPasswordExpiryTimeComputed'

                if ($user.PasswordNeverExpires -eq $true) {
                    $passwordExpiryDateValue = "PasswordNeverExpires (User Flag)"
                } elseif ($null -ne $expiryTimeComputed) { # Corrected null check
                    if (0 -eq $expiryTimeComputed) { # Corrected null check (though 0 isn't null)
                        $passwordExpiryDateValue = "UserMustChangePasswordAtNextLogon (pwdLastSet=0)"
                    } elseif ($expiryTimeComputed -eq ([long]::MaxValue)) {
                        $passwordExpiryDateValue = "Never (Calculated as MaxValue)"
                    } elseif ($expiryTimeComputed -lt 0) {
                        Write-MandALog "Invalid (negative) msDS-UserPasswordExpiryTimeComputed '$expiryTimeComputed' for user '$($user.SamAccountName)'. Interpreting as 'SpecialCondition'." -Level "WARN"
                        $passwordExpiryDateValue = "SpecialCondition (e.g., Negative FileTime)"
                    } else {
                        try {
                            $passwordExpiryDateValue = [datetime]::FromFileTime($expiryTimeComputed)
                        } catch {
                            Write-MandALog "Could not convert msDS-UserPasswordExpiryTimeComputed '$expiryTimeComputed' for user '$($user.SamAccountName)'. Error: $($_.Exception.Message)" -Level "WARN"
                            $passwordExpiryDateValue = "Invalid FileTime Value: $expiryTimeComputed"
                        }
                    }
                }

                $userObj = [PSCustomObject]@{
                    SamAccountName      = $user.SamAccountName
                    UserPrincipalName   = $user.UserPrincipalName
                    DisplayName         = $user.DisplayName
                    Enabled             = $user.Enabled
                    LastLogonDate       = $lastLogonDate
                    PasswordExpiryDate  = $passwordExpiryDateValue
                    PasswordNeverExpires= $user.PasswordNeverExpires
                    PasswordLastSet     = $user.PasswordLastSet
                    GivenName           = $user.GivenName
                    Surname             = $user.Surname
                    Description         = $user.Description
                    DistinguishedName   = $user.DistinguishedName
                    CreatedDate         = $user.whenCreated
                    ModifiedDate        = $user.whenChanged
                    EmailAddress        = $user.mail
                    ProxyAddresses      = ($user.proxyAddresses -join ';')
                    Department          = $user.Department
                    Title               = $user.Title
                    Manager             = $user.Manager
                    EmployeeID          = $user.employeeID
                    Office              = $user.physicalDeliveryOfficeName
                    TelephoneNumber     = $user.telephoneNumber
                    MobileNumber        = $user.mobile
                    Company             = $user.company
                    AccountExpirationDate = $user.AccountExpirationDate
                    CannotChangePassword= $user.CannotChangePassword
                    PasswordNotRequired = $user.PasswordNotRequired
                    Raw_msDSUserPasswordExpiryTimeComputed = $expiryTimeComputed
                }
                $allUsers.Add($userObj)
            }
            if ($allUsers.Count -gt 0) {
                Export-MandAData -Data $allUsers -FileName "ADUsers" -Configuration $Configuration
            } else { Write-MandALog "No AD User objects were processed into the final list." -Level "INFO" }
        } else {
            Write-MandALog "No AD Users found or accessible from $globalCatalog." -Level "WARN"
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
    $allGroups = [System.Collections.Generic.List[PSObject]]::new()
    $allGroupMembers = [System.Collections.Generic.List[PSObject]]::new()
    $globalCatalog = $Configuration.environment.globalCatalog
    $serverParams = if ($globalCatalog) { @{ Server = $globalCatalog } } else { @{} }

    try {
        $groupProperties = @('SamAccountName', 'Name', 'GroupCategory', 'GroupScope', 'Description', 'DistinguishedName', 'whenCreated', 'whenChanged', 'mail', 'ManagedBy', 'member')
        $adGroups = Get-ADGroup -Filter * -Properties $groupProperties @serverParams -ErrorAction Stop
        
        if ($null -ne $adGroups) { # Corrected null check
            foreach ($group in $adGroups) {
                $allGroups.Add([PSCustomObject]@{
                    SamAccountName  = $group.SamAccountName
                    Name            = $group.Name
                    GroupCategory   = $group.GroupCategory
                    GroupScope      = $group.GroupScope
                    Description     = $group.Description
                    DistinguishedName= $group.DistinguishedName
                    CreatedDate     = $group.whenCreated
                    ModifiedDate    = $group.whenChanged
                    EmailAddress    = $group.mail
                    ManagedBy       = $group.ManagedBy
                    MemberCount     = ($group.member | Measure-Object).Count # Direct members
                })
                if ($null -ne $group.member) { # Corrected null check
                    foreach ($memberDN in $group.member) {
                        try {
                            $memberObj = Get-ADObject -Identity $memberDN -Properties SamAccountName, ObjectClass @serverParams -ErrorAction Stop
                            if ($null -ne $memberObj) { # Corrected null check
                                $allGroupMembers.Add([PSCustomObject]@{
                                    GroupDN             = $group.DistinguishedName
                                    GroupName           = $group.SamAccountName
                                    MemberDN            = $memberDN
                                    MemberSamAccountName= $memberObj.SamAccountName
                                    MemberObjectClass   = $memberObj.ObjectClass
                                })
                            }
                        } catch {
                            Write-MandALog "Could not resolve member '$memberDN' for group '$($group.SamAccountName)': $($_.Exception.Message)" -Level "WARN"
                        }
                    }
                }
            }
            if ($allGroups.Count -gt 0) {
                Export-MandAData -Data $allGroups -FileName "ADGroups" -Configuration $Configuration
            } else { Write-MandALog "No AD Group objects processed." -Level "INFO" }
            if ($allGroupMembers.Count -gt 0) {
                Export-MandAData -Data $allGroupMembers -FileName "ADGroupMembers" -Configuration $Configuration
            } else { Write-MandALog "No AD Group Membership records processed." -Level "INFO" }
        } else { Write-MandALog "No AD Groups found or accessible from $globalCatalog." -Level "WARN" }
    } catch { Write-MandALog "Error during AD Groups Discovery: $($_.Exception.Message)." -Level "ERROR" }
    return @{Groups = $allGroups; Members = $allGroupMembers }
}

function Get-ADComputersDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "Starting AD Computers Discovery..." -Level "INFO"
    $allComputers = [System.Collections.Generic.List[PSObject]]::new()
    $globalCatalog = $Configuration.environment.globalCatalog
    $serverParams = if ($globalCatalog) { @{ Server = $globalCatalog } } else { @{} }

    try {
        $computerProperties = @('Name', 'DNSHostName', 'OperatingSystem', 'OperatingSystemVersion', 'OperatingSystemServicePack', 'Enabled', 'DistinguishedName', 'whenCreated', 'whenChanged', 'LastLogonTimestamp', 'Description', 'ManagedBy', 'MemberOf')
        $adComputers = Get-ADComputer -Filter * -Properties $computerProperties @serverParams -ErrorAction Stop
        if ($null -ne $adComputers) { # Corrected null check
            foreach ($computer in $adComputers) {
                $lastLogon = $null
                try { 
                    if ($null -ne $computer.LastLogonTimestamp -and 0 -ne $computer.LastLogonTimestamp -and $computer.LastLogonTimestamp -gt 0) { # Corrected null check
                        $lastLogon = [datetime]::FromFileTime($computer.LastLogonTimestamp) 
                    } 
                } catch { Write-MandALog "Could not convert LastLogonTimestamp '$($computer.LastLogonTimestamp)' for computer '$($computer.Name)'. Error: $($_.Exception.Message)" -Level "WARN"}
                
                $allComputers.Add([PSCustomObject]@{
                    Name                    = $computer.Name
                    DNSHostName             = $computer.DNSHostName
                    OperatingSystem         = $computer.OperatingSystem
                    OperatingSystemVersion  = $computer.OperatingSystemVersion
                    OperatingSystemServicePack = $computer.OperatingSystemServicePack
                    Enabled                 = $computer.Enabled
                    DistinguishedName       = $computer.DistinguishedName
                    CreatedDate             = $computer.whenCreated
                    ModifiedDate            = $computer.whenChanged
                    LastLogonDate           = $lastLogon
                    Description             = $computer.Description
                    ManagedBy               = $computer.ManagedBy
                    MemberOfGroupsCount     = ($computer.MemberOf | Measure-Object).Count
                })
            }
            if ($allComputers.Count -gt 0) {
                Export-MandAData -Data $allComputers -FileName "ADComputers" -Configuration $Configuration
            } else { Write-MandALog "No AD Computer objects processed." -Level "INFO" }
        } else { Write-MandALog "No AD Computers found from $globalCatalog." -Level "WARN" }
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
    $allOUs = [System.Collections.Generic.List[PSObject]]::new()
    $globalCatalog = $Configuration.environment.globalCatalog
    $serverParams = if ($globalCatalog) { @{ Server = $globalCatalog } } else { @{} }
    try {
        $ouPropertiesToSelect = @('Name', 'DistinguishedName', 'Description', 'ManagedBy', 'ProtectedFromAccidentalDeletion', 'whenCreated', 'whenChanged')
        $adOUs = Get-ADOrganizationalUnit -Filter * -Properties $ouPropertiesToSelect @serverParams -ErrorAction Stop
        if ($null -ne $adOUs) { # Corrected null check
            foreach ($ou in $adOUs) {
                $ouData = @{}
                foreach ($propName in $ouPropertiesToSelect) {
                    if ($null -ne $ou.PSObject.Properties[$propName]) { $ouData[$propName] = $ou.PSObject.Properties[$propName].Value } # Corrected null check
                    else { $ouData[$propName] = $null }
                }
                $allOUs.Add([PSCustomObject]$ouData)
            }
            if ($allOUs.Count -gt 0) {
                Export-MandAData -Data $allOUs -FileName "ADOUs" -Configuration $Configuration
            } else { Write-MandALog "No AD OU objects processed." -Level "INFO" }
        } else { Write-MandALog "No AD OUs found from $globalCatalog." -Level "WARN" }
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
    $globalCatalog = $Configuration.environment.globalCatalog
    $serverParams = if ($globalCatalog) { @{ Server = $globalCatalog } } else { @{} }
    
    try {
        Write-MandALog "Discovering AD Replication Sites..." -Level "INFO"
        $sites = Get-ADReplicationSite -Filter * -Properties Options @serverParams -ErrorAction Stop
        if ($null -ne $sites) {
            foreach ($site in $sites) {
                $serversInSite = @()
                $dcInSite = @()
                
                # FIXED: Get non-DC computers in the site using proper PowerShell filter syntax
                try {
                    # Using PowerShell's -band operator to check if computer is NOT a domain controller
                    # Domain controllers have the SERVER_TRUST_ACCOUNT flag (8192) set in userAccountControl
                    $nonDCFilter = "userAccountControl -band 8192 -eq 0"
                    $serversInSite = Get-ADComputer -Filter $nonDCFilter -SearchBase $site.DistinguishedName @serverParams -ErrorAction SilentlyContinue
                } catch { 
                    Write-MandALog "Could not determine Member Servers for site '$($site.Name)': $($_.Exception.Message)" -Level "WARN" 
                }
                
                # FIXED: Get domain controllers for the site without parameter conflicts
                try {
                    if ($serverParams.ContainsKey('Server')) {
                        # If we have a specific server parameter, get all DCs and filter by site
                        $allDCs = Get-ADDomainController -Filter * @serverParams -ErrorAction SilentlyContinue
                        if ($allDCs) {
                            $dcInSite = $allDCs | Where-Object { $_.Site -eq $site.Name }
                        }
                    } else {
                        # If no server specified, use -Site parameter directly
                        $dcInSite = Get-ADDomainController -Site $site.Name -ErrorAction SilentlyContinue
                    }
                } catch { 
                    Write-MandALog "Could not determine Domain Controllers for site '$($site.Name)': $($_.Exception.Message)" -Level "WARN" 
                }

                $siteOptions = $site.Options
                $allSiteData.Add([PSCustomObject]@{
                    SiteName                    = $site.Name
                    DistinguishedName           = $site.DistinguishedName
                    Location                    = $site.Location
                    Description                 = $site.Description
                    IntersiteTopologyGenerator  = if ($null -ne $siteOptions) { ($siteOptions -band [Microsoft.ActiveDirectory.Management.ADReplicationSiteOptions]::IntersiteTopologyGenerator) -as [bool] } else { $null }
                    IsStaleSite                 = if ($null -ne $siteOptions) { ($siteOptions -band [Microsoft.ActiveDirectory.Management.ADReplicationSiteOptions]::IsStaleSite) -as [bool] } else { $null }
                    GroupMembershipCaching      = if ($null -ne $siteOptions) { ($siteOptions -band [Microsoft.ActiveDirectory.Management.ADReplicationSiteOptions]::GroupMembershipCaching) -as [bool] } else { $null }
                    ServersInSiteCount          = ($serversInSite | Measure-Object).Count
                    DomainControllersInSiteCount= ($dcInSite | Measure-Object).Count
                })
            }
            if ($allSiteData.Count -gt 0) { 
                Export-MandAData -Data $allSiteData -FileName "ADSites" -Configuration $Configuration 
            } else { 
                Write-MandALog "No AD Site objects processed." -Level "INFO" 
            }
        } else { 
            Write-MandALog "No AD Sites found." -Level "WARN" 
        }

        Write-MandALog "Discovering AD Replication Site Links..." -Level "INFO"
        $siteLinks = Get-ADReplicationSiteLink -Filter * @serverParams -ErrorAction Stop
        if ($null -ne $siteLinks) {
            $siteLinks | ForEach-Object { 
                $allSiteLinkData.Add([PSCustomObject]@{ 
                    Name = $_.Name
                    DistinguishedName = $_.DistinguishedName
                    Cost = $_.Cost
                    ReplicationFrequencyInMinutes = $_.ReplicationFrequencyInMinutes
                    SitesIncluded = ($_.SitesIncluded | ForEach-Object {$_.Name}) -join ';'
                    Description = $_.Description 
                }) 
            }
            if ($allSiteLinkData.Count -gt 0) { 
                Export-MandAData -Data $allSiteLinkData -FileName "ADSiteLinks" -Configuration $Configuration 
            } else { 
                Write-MandALog "No AD Site Link objects processed." -Level "INFO" 
            }
        } else { 
            Write-MandALog "No AD Site Links found." -Level "WARN" 
        }
        
        Write-MandALog "Discovering AD Replication Subnets..." -Level "INFO"
        $subnets = Get-ADReplicationSubnet -Filter * -Properties Site @serverParams -ErrorAction Stop
        if ($null -ne $subnets) {
            $subnets | ForEach-Object { 
                $allSubnetData.Add([PSCustomObject]@{ 
                    Name = $_.Name
                    DistinguishedName = $_.DistinguishedName
                    Location = $_.Location
                    Site = if ($null -ne $_.Site) { $_.Site.Name } else { $null }
                }) 
            }
            if ($allSubnetData.Count -gt 0) { 
                Export-MandAData -Data $allSubnetData -FileName "ADSubnets" -Configuration $Configuration 
            } else { 
                Write-MandALog "No AD Subnet objects processed." -Level "INFO" 
            }
        } else { 
            Write-MandALog "No AD Subnets found." -Level "WARN" 
        }
    } catch { 
        Write-MandALog "Error during AD Sites/Services Discovery: $($_.Exception.Message)" -Level "ERROR" 
    }
    
    Write-MandALog "Finished AD Sites and Services Discovery." -Level "INFO"
    return @{ Sites = $allSiteData; SiteLinks = $allSiteLinkData; Subnets = $allSubnetData }
}

function Get-ADDNSZoneDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "Starting AD DNS Zone Discovery" -Level "INFO"
    $allDNSZoneData = [System.Collections.Generic.List[PSObject]]::new()
    $allDNSRecordData = [System.Collections.Generic.List[PSObject]]::new()

    if (-not (Get-Module -Name DnsServer -ListAvailable)) {
        Write-MandALog "DnsServer module not available. Skipping DNS Discovery. Install RSAT: DNS Server Tools if needed." -Level "WARN"
        return @{Zones = $allDNSZoneData; Records = $allDNSRecordData}
    }

    $dnsServerParams = @{}
    $targetDnsServer = $Configuration.discovery.adDns.dnsServer 
    if (-not $targetDnsServer) { $targetDnsServer = $Configuration.environment.globalCatalog } 
    if (-not $targetDnsServer) { $targetDnsServer = $Configuration.environment.domainController }

    if ($targetDnsServer) {
        $dnsServerParams.ComputerName = $targetDnsServer
        Write-MandALog "Targeting DNS server: $targetDnsServer for DNS discovery." -Level "INFO"
    } else {
        Write-MandALog "No DNS server specified. Using local/default DNS server." -Level "WARN"
    }
    
    $zonesToDetail = @($Configuration.discovery.adDns.detailedZones) 
    if (-not $zonesToDetail) { $zonesToDetail = @() }

    try {
        $zones = Get-DnsServerZone @dnsServerParams -ErrorAction Stop
        if ($null -ne $zones) { # Corrected null check
            foreach ($zone in $zones) {
                $replicationScopeValue = "N/A"
                if ($zone.IsDsIntegrated -and $null -ne $zone.PSObject.Properties['ReplicationScope'] -and $null -ne $zone.ReplicationScope) { # Corrected null check
                    try { $replicationScopeValue = $zone.ReplicationScope.ToString() } catch { $replicationScopeValue = "ErrorReadingScope" }
                }
                $allDNSZoneData.Add([PSCustomObject]@{
                    ZoneName = $zone.ZoneName
                    ZoneType = $zone.ZoneType.ToString()
                    IsReverseLookupZone = $zone.IsReverseLookupZone
                    IsDsIntegrated = $zone.IsDsIntegrated
                    IsSigned = $zone.IsSigned
                    DynamicUpdate = $zone.DynamicUpdate.ToString()
                    ReplicationScope = $replicationScopeValue
                })
                if ($zonesToDetail -contains $zone.ZoneName -or ($zonesToDetail -contains "*")) {
                    $records = Get-DnsServerResourceRecord -ZoneName $zone.ZoneName @dnsServerParams -RRType All -ErrorAction SilentlyContinue
                    if ($null -ne $records) { # Corrected null check
                        foreach ($record in $records) {
                            $allDNSRecordData.Add([PSCustomObject]@{
                                ZoneName    = $zone.ZoneName
                                HostName    = $record.HostName
                                RecordType  = $record.RecordType.ToString()
                                Timestamp   = if ($null -ne $record.Timestamp) {$record.Timestamp} else {$null} # Corrected null check
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
                                    default { "Unhandled Type: $($record.RecordType); Data: $($record.RecordData | Out-String -Stream | Select-Object -First 1)" }
                                }
                            })
                        }
                    } else { Write-MandALog "No records found for detailed zone $($zone.ZoneName)." -Level "DEBUG" }
                }
            }
            if ($allDNSZoneData.Count -gt 0) { Export-MandAData -Data $allDNSZoneData -FileName "ADDNSZones" -Configuration $Configuration }
            else { Write-MandALog "No DNS Zone objects processed." -Level "INFO" }
            if ($allDNSRecordData.Count -gt 0) { Export-MandAData -Data $allDNSRecordData -FileName "ADDNSRecords_Detailed" -Configuration $Configuration }
            else { Write-MandALog "No detailed DNS Record objects processed (check configuration for 'detailedZones')." -Level "INFO" }
        } else { Write-MandALog "No DNS Zones found from $targetDnsServer." -Level "WARN" }
    } catch { Write-MandALog "Error during DNS Zone Discovery: $($_.Exception.Message)" -Level "ERROR" }
    Write-MandALog "Finished AD DNS Zone Discovery." -Level "INFO"
    return @{ Zones = $allDNSZoneData; Records = $allDNSRecordData }
}

# --- Public Function (Exported) ---
function Invoke-ActiveDirectoryDiscovery {
    [CmdletBinding()]
    [OutputType([hashtable])]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "--- Starting Active Directory Discovery Phase (v2.1.2) ---" -Level "HEADER"
    $overallStatus = $true
    $discoveredData = @{}

    if (-not (Get-Module -Name ActiveDirectory -ListAvailable)) {
        Write-MandALog "ActiveDirectory PowerShell module is not available. Please install RSAT: AD DS and AD LDS Tools." -Level "ERROR"
        return $null
    }

    $globalCatalog = $Configuration.environment.globalCatalog
    if ([string]::IsNullOrWhiteSpace($globalCatalog)) {
        Write-MandALog "Global Catalog server (`environment.globalCatalog`) not specified in config. This is highly recommended for multi-domain environments to resolve referrals. Falling back to `environment.domainController`." -Level "WARN"
        $globalCatalog = $Configuration.environment.domainController
    }
    if (-not $globalCatalog) {
        Write-MandALog "Neither Global Catalog nor Domain Controller specified in configuration. Skipping Active Directory Discovery." -Level "ERROR"
        return $null
    }
    if (-not (Test-Connection -ComputerName $globalCatalog -Count 1 -Quiet -ErrorAction SilentlyContinue)) {
        Write-MandALog "Target server '$globalCatalog' (GC/DC) is unreachable. Skipping Active Directory Discovery." -Level "ERROR"
        return $null
    }
    Write-MandALog "Targeting AD server: '$globalCatalog' (GC or DC)." -Level "INFO"

    try {
        $discoveredData.Users             = Get-ADUsersDataInternal -Configuration $Configuration
        $discoveredData.GroupsAndMembers  = Get-ADGroupsDataInternal -Configuration $Configuration
        $discoveredData.Computers         = Get-ADComputersDataInternal -Configuration $Configuration
        $discoveredData.OUs               = Get-ADOUsDataInternal -Configuration $Configuration
        $discoveredData.SitesAndServices  = Get-ADSitesAndServicesDataInternal -Configuration $Configuration
        $discoveredData.DNSInfo           = Get-ADDNSZoneDataInternal -Configuration $Configuration
    } catch {
        Write-MandALog "A critical error occurred during the Active Directory Discovery Phase: $($_.Exception.Message)" -Level "ERROR"
        $overallStatus = $false
    }

    if ($overallStatus) {
        Write-MandALog "--- Active Directory Discovery Phase Completed Successfully ---" -Level "SUCCESS"
    } else {
        Write-MandALog "--- Active Directory Discovery Phase Completed With Errors. Please review logs. ---" -Level "ERROR"
    }
    return $discoveredData
}

Export-ModuleMember -Function Invoke-ActiveDirectoryDiscovery
