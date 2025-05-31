# Module: ActiveDirectoryDiscovery.psm1
# Description: Handles discovery of on-premises Active Directory objects,
#              including users, groups, computers, OUs, Sites, Services, and DNS.
# Version: 1.2.2 (Improved Password Expiry Date handling & other FileTime conversions)
# Date: 2025-05-31

#Requires -Modules ActiveDirectory

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
                        # Ensure the value is positive before attempting conversion
                        if ($user.LastLogonTimestamp -gt 0) {
                            $lastLogonDate = [datetime]::FromFileTime($user.LastLogonTimestamp)
                        } else {
                             Write-MandALog "Invalid (negative or zero) LastLogonTimestamp '$($user.LastLogonTimestamp)' for user '$($user.SamAccountName)'. Setting to null." -Level "DEBUG"
                        }
                    }
                } catch { Write-MandALog "Could not convert LastLogonTimestamp '$($user.LastLogonTimestamp)' for user '$($user.SamAccountName)'. Error: $($_.Exception.Message)" -Level "WARN" }

                # Handle PasswordExpiryDate
                $passwordExpiryDateValue = "Not Set/Error" # Initial default
                $expiryTimeComputed = $user.'msDS-UserPasswordExpiryTimeComputed'

                if ($user.PasswordNeverExpires -eq $true) {
                    $passwordExpiryDateValue = "PasswordNeverExpires (User Flag)"
                } elseif ($expiryTimeComputed -ne $null) {
                    if ($expiryTimeComputed -eq 0) {
                        $passwordExpiryDateValue = "UserMustChangePasswordAtNextLogon (pwdLastSet=0)"
                    } elseif ($expiryTimeComputed -eq ([long]::MaxValue)) {
                        $passwordExpiryDateValue = "Never (Calculated as MaxValue)"
                    } elseif ($expiryTimeComputed -lt 0) { # Catch negative values explicitly
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
                    SamAccountName        = $user.SamAccountName
                    UserPrincipalName     = $user.UserPrincipalName
                    DisplayName           = $user.DisplayName
                    Enabled               = $user.Enabled
                    LastLogonDate         = $lastLogonDate
                    PasswordExpiryDate    = $passwordExpiryDateValue 
                    PasswordNeverExpires  = $user.PasswordNeverExpires 
                    PasswordLastSet       = $user.PasswordLastSet
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
                    CannotChangePassword  = $user.CannotChangePassword
                    PasswordNotRequired   = $user.PasswordNotRequired
                    Raw_msDSUserPasswordExpiryTimeComputed = $expiryTimeComputed 
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
    # For potential referral issues, consider targeting a Global Catalog:
    # if ($Configuration.discovery.ad.useGlobalCatalog) { $serverParams.Server = "$domainController:3268" } 

    try {
        $groupProperties = @('SamAccountName', 'Name', 'GroupCategory', 'GroupScope', 'Description', 'DistinguishedName', 'whenCreated', 'whenChanged', 'mail', 'ManagedBy', 'member')
        $adGroups = Get-ADGroup -Filter * -Properties $groupProperties @serverParams -ErrorAction SilentlyContinue
        
        if ($adGroups) {
            foreach ($group in $adGroups) {
                $allGroups.Add([PSCustomObject]@{
                    SamAccountName    = $group.SamAccountName; Name = $group.Name; GroupCategory = $group.GroupCategory
                    GroupScope        = $group.GroupScope; Description = $group.Description; DistinguishedName = $group.DistinguishedName
                    CreatedDate       = $group.whenCreated; ModifiedDate = $group.whenChanged; EmailAddress = $group.mail
                    ManagedBy         = $group.ManagedBy; MemberCount = ($group.member | Measure-Object).Count
                })
                if ($group.member) { # Check if member property exists and is not null
                    foreach ($memberDN in $group.member) {
                        try {
                            $memberObj = Get-ADObject -Identity $memberDN -Properties SamAccountName, ObjectClass @serverParams -ErrorAction Stop # Use Stop to catch specific errors if identity is bad
                            if ($memberObj) {
                                $allGroupMembers.Add([PSCustomObject]@{
                                    GroupDN              = $group.DistinguishedName; GroupName = $group.SamAccountName; MemberDN = $memberDN
                                    MemberSamAccountName = $memberObj.SamAccountName; MemberObjectClass = $memberObj.ObjectClass
                                })
                            }
                        } catch {
                            Write-MandALog "Could not resolve member '$memberDN' for group '$($group.SamAccountName)': $($_.Exception.Message)" -Level "WARN"
                        }
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
                $lastLogon = $null; 
                try { 
                    if ($computer.LastLogonTimestamp -ne $null -and $computer.LastLogonTimestamp -ne 0 -and $computer.LastLogonTimestamp -gt 0) { 
                        $lastLogon = [datetime]::FromFileTime($computer.LastLogonTimestamp) 
                    } 
                } catch { Write-MandALog "Could not convert LastLogonTimestamp '$($computer.LastLogonTimestamp)' for computer '$($computer.Name)'. Error: $($_.Exception.Message)" -Level "WARN"}
                
                $allComputers.Add([PSCustomObject]@{
                    Name                        = $computer.Name; DNSHostName = $computer.DNSHostName; OperatingSystem = $computer.OperatingSystem
                    OperatingSystemVersion      = $computer.OperatingSystemVersion; OperatingSystemServicePack = $computer.OperatingSystemServicePack
                    Enabled                     = $computer.Enabled; DistinguishedName = $computer.DistinguishedName; CreatedDate = $computer.whenCreated
                    ModifiedDate                = $computer.whenChanged; LastLogonDate = $lastLogon; Description = $computer.Description
                    ManagedBy                   = $computer.ManagedBy; MemberOfGroupsCount = ($computer.MemberOf | Measure-Object).Count
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
        $adOUs = Get-ADOrganizationalUnit -Filter * -Properties $ouPropertiesToSelect @serverParams -ErrorAction SilentlyContinue
        if ($adOUs) {
            foreach ($ou in $adOUs) {
                $ouData = @{}
                foreach ($propName in $ouPropertiesToSelect) {
                    if ($ou.PSObject.Properties[$propName]) { $ouData[$propName] = $ou.PSObject.Properties[$propName].Value } 
                    else { $ouData[$propName] = $null }
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
                try { $serversInSiteCount = (Get-ADComputer -Filter "Enabled -eq `$true -and UserAccountControl -notmatch 'WORKSTATION_TRUST_ACCOUNT|SERVER_TRUST_ACCOUNT'" -SearchBase $site.DistinguishedName @serverParams -ErrorAction SilentlyContinue | Measure-Object).Count } 
                catch { Write-MandALog "Could not determine ServersInSite for '$($site.Name)': $($_.Exception.Message)" -Level "WARN" }

                $dcInSiteCount = 0
                try { $dcInSiteCount = (Get-ADDomainController -Filter * -Site $site.Name @serverParams -ErrorAction SilentlyContinue | Measure-Object).Count } 
                catch { Write-MandALog "Could not determine DomainControllersInSite for '$($site.Name)': $($_.Exception.Message)" -Level "WARN" }

                $allSiteData.Add([PSCustomObject]@{
                    SiteName                   = $site.Name; DistinguishedName = $site.DistinguishedName; Location = $site.Location; Description = $site.Description
                    IntersiteTopologyGenerator = if ($site.PSObject.Properties['Options'] -and $site.Options -ne $null) { ($site.Options -band [Microsoft.ActiveDirectory.Management.ADReplicationSiteOptions]::IntersiteTopologyGenerator) -as [bool] } else { $null }
                    IsStaleSite                = if ($site.PSObject.Properties['Options'] -and $site.Options -ne $null) { ($site.Options -band [Microsoft.ActiveDirectory.Management.ADReplicationSiteOptions]::IsStaleSite) -as [bool] } else { $null }
                    GroupMembershipCaching     = if ($site.PSObject.Properties['Options'] -and $site.Options -ne $null) { ($site.Options -band [Microsoft.ActiveDirectory.Management.ADReplicationSiteOptions]::GroupMembershipCaching) -as [bool] } else { $null }
                    ServersInSite              = $serversInSiteCount; DomainControllersInSite = $dcInSiteCount
                })
            }
            if ($allSiteData.Count -gt 0) { Export-DataToCSV -InputObject $allSiteData -FileName "ADSites.csv" -OutputPath $outputPath; Write-MandALog "Exported $($allSiteData.Count) AD Sites." -Level "SUCCESS" }
            else { Write-MandALog "No AD Site objects processed." -Level "INFO" }
        } else { Write-MandALog "No AD Sites found." -Level "WARN" }

        Write-MandALog "Discovering AD Replication Site Links..." -Level "INFO"
        $siteLinks = Get-ADReplicationSiteLink -Filter * @serverParams -ErrorAction SilentlyContinue
        if ($siteLinks) {
            $siteLinks | ForEach-Object { $allSiteLinkData.Add([PSCustomObject]@{ Name = $_.Name; DistinguishedName = $_.DistinguishedName; Cost = $_.Cost; ReplicationFrequencyInMinutes = $_.ReplicationFrequencyInMinutes; SitesIncluded = ($_.SitesIncluded | ForEach-Object {$_.Name}) -join ';'; Description = $_.Description }) }
            if ($allSiteLinkData.Count -gt 0) { Export-DataToCSV -InputObject $allSiteLinkData -FileName "ADSiteLinks.csv" -OutputPath $outputPath; Write-MandALog "Exported $($allSiteLinkData.Count) AD Site Links." -Level "SUCCESS" }
             else { Write-MandALog "No AD Site Link objects processed." -Level "INFO" }
        } else { Write-MandALog "No AD Site Links found." -Level "WARN" }
        
        Write-MandALog "Discovering AD Replication Subnets..." -Level "INFO"
        $subnets = Get-ADReplicationSubnet -Filter * @serverParams -ErrorAction SilentlyContinue
        if ($subnets) {
            $subnets | ForEach-Object { $allSubnetData.Add([PSCustomObject]@{ Name = $_.Name; DistinguishedName = $_.DistinguishedName; Location = $_.Location; Site = if ($null -ne $_.Site) { $_.Site.Name } else { $null } }) }
            if ($allSubnetData.Count -gt 0) { Export-DataToCSV -InputObject $allSubnetData -FileName "ADSubnets.csv" -OutputPath $outputPath; Write-MandALog "Exported $($allSubnetData.Count) AD Subnets." -Level "SUCCESS" }
             else { Write-MandALog "No AD Subnet objects processed." -Level "INFO" }
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

    if (-not (Get-Module -Name DnsServer -ListAvailable)) { Write-MandALog "DnsServer module not available. Skipping. Install RSAT: DNS Server Tools." -Level "WARN"; return @{Zones = $allDNSZoneData; Records = $allDNSRecordData} }
    $dnsServerParams = @{}
    $targetDnsServer = $DnsServerParam
    if (-not $targetDnsServer -and $Configuration.discovery.adDns.dnsServer) { $targetDnsServer = $Configuration.discovery.adDns.dnsServer }
    if (-not $targetDnsServer) { $targetDnsServer = $Configuration.environment.domainController }
    if ($targetDnsServer) { $dnsServerParams.ComputerName = $targetDnsServer; Write-MandALog "Targeting DNS server: $targetDnsServer." -Level "INFO" }
    else { Write-MandALog "No DNS server specified, using local/default." -Level "WARN" }
    
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
                    ZoneName = $zone.ZoneName; ZoneType = $zone.ZoneType.ToString(); IsReverseLookup = $zone.IsReverseLookupZone
                    IsDsIntegrated = $zone.IsDsIntegrated; IsSigned = $zone.IsSigned; DynamicUpdate = $zone.DynamicUpdate.ToString()
                    ReplicationScope = $replicationScopeValue
                })
                if ($zonesToDetail -contains $zone.ZoneName) {
                    $records = Get-DnsServerResourceRecord -ZoneName $zone.ZoneName @dnsServerParams -RRType All -ErrorAction SilentlyContinue
                    if ($records) {
                        foreach ($record in $records) {
                            $allDNSRecordData.Add([PSCustomObject]@{
                                ZoneName = $zone.ZoneName; HostName = $record.HostName; RecordType = $record.RecordType.ToString()
                                Timestamp = if ($record.Timestamp) {$record.Timestamp} else {$null}; TimeToLive = $record.TimeToLive.ToString()
                                RecordData = switch ($record.RecordType) {
                                    "A"     { $record.RecordData.IPV4Address.IPAddressToString } "AAAA"  { $record.RecordData.IPV6Address.IPAddressToString }
                                    "CNAME" { $record.RecordData.HostNameAlias } "MX"    { "Pref=$($record.RecordData.Preference);Exch=$($record.RecordData.MailExchange)" }
                                    "NS"    { $record.RecordData.NameServer } "PTR"   { $record.RecordData.PtrDomainName }
                                    "SOA"   { "PriSrv=$($record.RecordData.PrimaryServer);RespP=$($record.RecordData.ResponsiblePerson);Serial=$($record.RecordData.SerialNumber)"}
                                    "SRV"   { "Dom=$($record.RecordData.DomainName);Port=$($record.RecordData.Port);Pri=$($record.RecordData.Priority);Wght=$($record.RecordData.Weight)" }
                                    "TXT"   { ($record.RecordData.DescriptiveText -join '; ') } default { "Unhandled: $($record.RecordType)" } }}) }
                    } else { Write-MandALog "No records for zone $($zone.ZoneName)." -Level "DEBUG" } } }
            if ($allDNSZoneData.Count -gt 0) { Export-DataToCSV -InputObject $allDNSZoneData -FileName "ADDNSZones.csv" -OutputPath $outputPath; Write-MandALog "Exported $($allDNSZoneData.Count) DNS Zones." -Level "SUCCESS" }
            else { Write-MandALog "No DNS Zone objects processed." -Level "INFO" }
            if ($allDNSRecordData.Count -gt 0) { Export-DataToCSV -InputObject $allDNSRecordData -FileName "ADDNSRecords_Detailed.csv" -OutputPath $outputPath; Write-MandALog "Exported $($allDNSRecordData.Count) detailed DNS records." -Level "SUCCESS" }
            else { Write-MandALog "No detailed DNS Record objects processed." -Level "INFO" }
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
    if (-not (Get-Module -Name ActiveDirectory -ListAvailable)) { Write-MandALog "ActiveDirectory module not available. Install RSAT." -Level "ERROR"; return $null }
    $dc = $Configuration.environment.domainController
    if (-not $dc) { Write-MandALog "DC not specified. Skipping AD Discovery." -Level "ERROR"; return $null }
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
