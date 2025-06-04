<#
.SYNOPSIS
    Network Infrastructure discovery for M&A Discovery Suite
.DESCRIPTION
    Discovers DHCP, DNS, and network configuration information
#>

function Invoke-NetworkInfrastructureDiscovery {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Starting Network Infrastructure discovery" -Level "HEADER"
        
        $outputPath = $Context.Paths.RawDataOutput
        $discoveryResults = @{}
        
        # DHCP Discovery
        Write-MandALog "Discovering DHCP Infrastructure..." -Level "INFO"
        $discoveryResults.DHCPServers = Get-DHCPServersData -OutputPath $outputPath -Configuration $Configuration
        $discoveryResults.DHCPScopes = Get-DHCPScopesData -OutputPath $outputPath -Configuration $Configuration
        $discoveryResults.DHCPReservations = Get-DHCPReservationsData -OutputPath $outputPath -Configuration $Configuration
        $discoveryResults.DHCPOptions = Get-DHCPOptionsData -OutputPath $outputPath -Configuration $Configuration
        
        # DNS Discovery
        Write-MandALog "Discovering DNS Infrastructure..." -Level "INFO"
        $discoveryResults.DNSServers = Get-DNSServersData -OutputPath $outputPath -Configuration $Configuration
        $discoveryResults.DNSZones = Get-DNSZonesData -OutputPath $outputPath -Configuration $Configuration
        $discoveryResults.DNSRecords = Get-DNSRecordsData -OutputPath $outputPath -Configuration $Configuration
        
        # Network Configuration
        Write-MandALog "Discovering Network Configuration..." -Level "INFO"
        $discoveryResults.Subnets = Get-ADSubnetsData -OutputPath $outputPath -Configuration $Configuration
        $discoveryResults.Sites = Get-ADSitesData -OutputPath $outputPath -Configuration $Configuration
        
        Write-MandALog "Network Infrastructure discovery completed successfully" -Level "SUCCESS"
        return $discoveryResults
        
    } catch {
        Write-MandALog "Network Infrastructure discovery failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Get-DHCPServersData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "DHCPServers.csv"
    $dhcpServers = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "DHCP Servers CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving DHCP servers from Active Directory" -Level "INFO"
        
        # Get DHCP servers from AD
        $domain = [System.DirectoryServices.ActiveDirectory.Domain]::GetCurrentDomain()
        $forest = $domain.Forest
        
        # Try to get authorized DHCP servers
        try {
            $dhcpServerList = Get-DhcpServerInDC -ErrorAction Stop
            
            foreach ($server in $dhcpServerList) {
                Write-MandALog "Querying DHCP server: $($server.DnsName)" -Level "INFO"
                
                try {
                    # Get server statistics
                    $serverStats = Get-DhcpServerv4Statistics -ComputerName $server.DnsName -ErrorAction Stop
                    $serverVersion = Get-DhcpServerVersion -ComputerName $server.DnsName -ErrorAction Stop
                    
                    $dhcpServers.Add([PSCustomObject]@{
                        ServerName = $server.DnsName
                        IPAddress = $server.IPAddress
                        ServerVersion = $serverVersion.MinorVersion
                        IsAuthorized = $true
                        TotalScopes = $serverStats.ScopesTotal
                        ActiveScopes = $serverStats.ScopesWithDelayConfigured
                        TotalAddresses = $serverStats.AddressesTotal
                        AddressesInUse = $serverStats.AddressesInUse
                        AddressesFree = $serverStats.AddressesFree
                        PercentInUse = $serverStats.PercentageInUse
                        TotalReservations = $serverStats.ReservationsTotal
                        LastDiscovered = Get-Date
                    })
                } catch {
                    Write-MandALog "Error querying DHCP server $($server.DnsName): $($_.Exception.Message)" -Level "WARN"
                    
                    # Add basic info if detailed query fails
                    $dhcpServers.Add([PSCustomObject]@{
                        ServerName = $server.DnsName
                        IPAddress = $server.IPAddress
                        ServerVersion = "Unknown"
                        IsAuthorized = $true
                        TotalScopes = 0
                        ActiveScopes = 0
                        TotalAddresses = 0
                        AddressesInUse = 0
                        AddressesFree = 0
                        PercentInUse = 0
                        TotalReservations = 0
                        LastDiscovered = Get-Date
                        Error = $_.Exception.Message
                    })
                }
            }
        } catch {
            Write-MandALog "Unable to retrieve DHCP servers from AD: $($_.Exception.Message)" -Level "ERROR"
        }
        
        Write-MandALog "Found $($dhcpServers.Count) DHCP servers" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $dhcpServers -FilePath $outputFile
        return $dhcpServers
        
    } catch {
        Write-MandALog "Error retrieving DHCP Servers: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            ServerName = $null; IPAddress = $null; ServerVersion = $null
            IsAuthorized = $null; TotalScopes = $null; ActiveScopes = $null
            TotalAddresses = $null; AddressesInUse = $null; AddressesFree = $null
            PercentInUse = $null; TotalReservations = $null; LastDiscovered = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

function Get-DHCPScopesData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "DHCPScopes.csv"
    $dhcpScopes = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "DHCP Scopes CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        # Get DHCP servers first
        $dhcpServers = Get-DhcpServerInDC -ErrorAction SilentlyContinue
        
        foreach ($server in $dhcpServers) {
            Write-MandALog "Retrieving scopes from DHCP server: $($server.DnsName)" -Level "INFO"
            
            try {
                $scopes = Get-DhcpServerv4Scope -ComputerName $server.DnsName -ErrorAction Stop
                
                foreach ($scope in $scopes) {
                    # Get scope statistics
                    $scopeStats = Get-DhcpServerv4ScopeStatistics -ComputerName $server.DnsName -ScopeId $scope.ScopeId -ErrorAction SilentlyContinue
                    
                    $dhcpScopes.Add([PSCustomObject]@{
                        ServerName = $server.DnsName
                        ScopeId = $scope.ScopeId
                        ScopeName = $scope.Name
                        SubnetMask = $scope.SubnetMask
                        StartRange = $scope.StartRange
                        EndRange = $scope.EndRange
                        LeaseDuration = $scope.LeaseDuration
                        State = $scope.State
                        Type = $scope.Type
                        TotalAddresses = if ($scopeStats) { $scopeStats.AddressesFree + $scopeStats.AddressesInUse } else { 0 }
                        AddressesInUse = if ($scopeStats) { $scopeStats.AddressesInUse } else { 0 }
                        AddressesFree = if ($scopeStats) { $scopeStats.AddressesFree } else { 0 }
                        PercentInUse = if ($scopeStats) { $scopeStats.PercentageInUse } else { 0 }
                        ReservedAddresses = if ($scopeStats) { $scopeStats.ReservedAddress } else { 0 }
                        Description = $scope.Description
                    })
                }
            } catch {
                Write-MandALog "Error retrieving scopes from $($server.DnsName): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-MandALog "Found $($dhcpScopes.Count) DHCP scopes" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $dhcpScopes -FilePath $outputFile
        return $dhcpScopes
        
    } catch {
        Write-MandALog "Error retrieving DHCP Scopes: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            ServerName = $null; ScopeId = $null; ScopeName = $null; SubnetMask = $null
            StartRange = $null; EndRange = $null; LeaseDuration = $null; State = $null
            Type = $null; TotalAddresses = $null; AddressesInUse = $null; AddressesFree = $null
            PercentInUse = $null; ReservedAddresses = $null; Description = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

function Get-DHCPReservationsData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "DHCPReservations.csv"
    $dhcpReservations = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "DHCP Reservations CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        $dhcpServers = Get-DhcpServerInDC -ErrorAction SilentlyContinue
        
        foreach ($server in $dhcpServers) {
            try {
                $scopes = Get-DhcpServerv4Scope -ComputerName $server.DnsName -ErrorAction Stop
                
                foreach ($scope in $scopes) {
                    try {
                        $reservations = Get-DhcpServerv4Reservation -ComputerName $server.DnsName -ScopeId $scope.ScopeId -ErrorAction Stop
                        
                        foreach ($reservation in $reservations) {
                            $dhcpReservations.Add([PSCustomObject]@{
                                ServerName = $server.DnsName
                                ScopeId = $scope.ScopeId
                                ScopeName = $scope.Name
                                IPAddress = $reservation.IPAddress
                                ClientId = $reservation.ClientId
                                Name = $reservation.Name
                                Description = $reservation.Description
                                Type = $reservation.Type
                            })
                        }
                    } catch {
                        # Scope might not have reservations
                    }
                }
            } catch {
                Write-MandALog "Error retrieving reservations from $($server.DnsName): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-MandALog "Found $($dhcpReservations.Count) DHCP reservations" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $dhcpReservations -FilePath $outputFile
        return $dhcpReservations
        
    } catch {
        Write-MandALog "Error retrieving DHCP Reservations: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            ServerName = $null; ScopeId = $null; ScopeName = $null
            IPAddress = $null; ClientId = $null; Name = $null
            Description = $null; Type = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

function Get-DHCPOptionsData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "DHCPOptions.csv"
    $dhcpOptions = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "DHCP Options CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        $dhcpServers = Get-DhcpServerInDC -ErrorAction SilentlyContinue
        
        foreach ($server in $dhcpServers) {
            try {
                # Get server-level options
                $serverOptions = Get-DhcpServerv4OptionValue -ComputerName $server.DnsName -All -ErrorAction Stop
                
                foreach ($option in $serverOptions) {
                    $dhcpOptions.Add([PSCustomObject]@{
                        ServerName = $server.DnsName
                        Scope = "Server"
                        OptionId = $option.OptionId
                        Name = $option.Name
                        Value = ($option.Value -join "; ")
                        VendorClass = $option.VendorClass
                        UserClass = $option.UserClass
                    })
                }
                
                # Get scope-level options
                $scopes = Get-DhcpServerv4Scope -ComputerName $server.DnsName -ErrorAction Stop
                
                foreach ($scope in $scopes) {
                    try {
                        $scopeOptions = Get-DhcpServerv4OptionValue -ComputerName $server.DnsName -ScopeId $scope.ScopeId -All -ErrorAction Stop
                        
                        foreach ($option in $scopeOptions) {
                            $dhcpOptions.Add([PSCustomObject]@{
                                ServerName = $server.DnsName
                                Scope = $scope.ScopeId.ToString()
                                OptionId = $option.OptionId
                                Name = $option.Name
                                Value = ($option.Value -join "; ")
                                VendorClass = $option.VendorClass
                                UserClass = $option.UserClass
                            })
                        }
                    } catch {
                        # Scope might not have options
                    }
                }
            } catch {
                Write-MandALog "Error retrieving options from $($server.DnsName): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-MandALog "Found $($dhcpOptions.Count) DHCP options" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $dhcpOptions -FilePath $outputFile
        return $dhcpOptions
        
    } catch {
        Write-MandALog "Error retrieving DHCP Options: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            ServerName = $null; Scope = $null; OptionId = $null
            Name = $null; Value = $null; VendorClass = $null; UserClass = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

function Get-DNSServersData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "DNSServers.csv"
    $dnsServers = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "DNS Servers CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving DNS servers from Active Directory" -Level "INFO"
        
        # Get all DCs (they typically run DNS)
        $domainControllers = Get-ADDomainController -Filter * -ErrorAction Stop
        
        foreach ($dc in $domainControllers) {
            try {
                # Test if DNS service is running
                $dnsService = Get-Service -ComputerName $dc.HostName -Name "DNS" -ErrorAction Stop
                
                if ($dnsService) {
                    # Get DNS server configuration
                    $dnsServerConfig = Get-DnsServer -ComputerName $dc.HostName -ErrorAction Stop
                    
                    $dnsServers.Add([PSCustomObject]@{
                        ServerName = $dc.HostName
                        IPAddress = $dc.IPv4Address
                        OperatingSystem = $dc.OperatingSystem
                        IsGlobalCatalog = $dc.IsGlobalCatalog
                        IsReadOnly = $dc.IsReadOnly
                        Site = $dc.Site
                        DNSServiceStatus = $dnsService.Status
                        ServerVersion = $dnsServerConfig.ServerSetting.Version
                        RoundRobin = $dnsServerConfig.ServerSetting.RoundRobin
                        LocalNetPriority = $dnsServerConfig.ServerSetting.LocalNetPriority
                        SecureResponse = $dnsServerConfig.ServerSetting.SecureResponse
                        RecursionEnabled = $dnsServerConfig.ServerRecursion.Enable
                        Forwarders = ($dnsServerConfig.ServerForwarder.IPAddress.IPAddressToString -join "; ")
                        RootHints = $dnsServerConfig.ServerRootHint.Count
                        CacheSize = $dnsServerConfig.ServerCache.MaxKBSize
                    })
                }
            } catch {
                Write-MandALog "Error querying DNS on $($dc.HostName): $($_.Exception.Message)" -Level "WARN"
                
                # Add basic info if detailed query fails
                $dnsServers.Add([PSCustomObject]@{
                    ServerName = $dc.HostName
                    IPAddress = $dc.IPv4Address
                    OperatingSystem = $dc.OperatingSystem
                    IsGlobalCatalog = $dc.IsGlobalCatalog
                    IsReadOnly = $dc.IsReadOnly
                    Site = $dc.Site
                    DNSServiceStatus = "Unknown"
                    Error = $_.Exception.Message
                })
            }
        }
        
        Write-MandALog "Found $($dnsServers.Count) DNS servers" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $dnsServers -FilePath $outputFile
        return $dnsServers
        
    } catch {
        Write-MandALog "Error retrieving DNS Servers: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            ServerName = $null; IPAddress = $null; OperatingSystem = $null
            IsGlobalCatalog = $null; IsReadOnly = $null; Site = $null
            DNSServiceStatus = $null; ServerVersion = $null; RoundRobin = $null
            LocalNetPriority = $null; SecureResponse = $null; RecursionEnabled = $null
            Forwarders = $null; RootHints = $null; CacheSize = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

function Get-DNSZonesData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "DNSZones.csv"
    $dnsZones = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "DNS Zones CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        # Get primary DNS server
        $primaryDC = Get-ADDomainController -Discover -Service "PrimaryDC" -ErrorAction SilentlyContinue
        $dnsServer = if ($primaryDC) { $primaryDC.HostName } else { $env:COMPUTERNAME }
        
        Write-MandALog "Retrieving DNS zones from server: $dnsServer" -Level "INFO"
        
        $zones = Get-DnsServerZone -ComputerName $dnsServer -ErrorAction Stop
        
        foreach ($zone in $zones) {
            $dnsZones.Add([PSCustomObject]@{
                ZoneName = $zone.ZoneName
                ZoneType = $zone.ZoneType
                IsDsIntegrated = $zone.IsDsIntegrated
                IsReverseLookupZone = $zone.IsReverseLookupZone
                IsSigned = $zone.IsSigned
                DynamicUpdate = $zone.DynamicUpdate
                ReplicationScope = $zone.ReplicationScope
                DirectoryPartitionName = $zone.DirectoryPartitionName
                IsAutoCreated = $zone.IsAutoCreated
                IsPaused = $zone.IsPaused
                IsShutdown = $zone.IsShutdown
                SecureSecondaries = $zone.SecureSecondaries
                NotifyServers = ($zone.NotifyServers -join "; ")
                MasterServers = ($zone.MasterServers -join "; ")
                LastZoneTransfer = $zone.LastZoneTransferResult
                RecordCount = (Get-DnsServerResourceRecord -ComputerName $dnsServer -ZoneName $zone.ZoneName -ErrorAction SilentlyContinue | Measure-Object).Count
            })
        }
        
        Write-MandALog "Found $($dnsZones.Count) DNS zones" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $dnsZones -FilePath $outputFile
        return $dnsZones
        
    } catch {
        Write-MandALog "Error retrieving DNS Zones: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            ZoneName = $null; ZoneType = $null; IsDsIntegrated = $null
            IsReverseLookupZone = $null; IsSigned = $null; DynamicUpdate = $null
            ReplicationScope = $null; DirectoryPartitionName = $null; IsAutoCreated = $null
            IsPaused = $null; IsShutdown = $null; SecureSecondaries = $null
            NotifyServers = $null; MasterServers = $null; LastZoneTransfer = $null; RecordCount = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

function Get-DNSRecordsData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "DNSRecords.csv"
    $dnsRecords = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "DNS Records CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        # Get primary DNS server
        $primaryDC = Get-ADDomainController -Discover -Service "PrimaryDC" -ErrorAction SilentlyContinue
        $dnsServer = if ($primaryDC) { $primaryDC.HostName } else { $env:COMPUTERNAME }
        
        # Get all zones
        $zones = Get-DnsServerZone -ComputerName $dnsServer -ErrorAction Stop | Where-Object { -not $_.IsReverseLookupZone }
        
        # Focus on important record types to avoid overwhelming data
        $importantRecordTypes = @("A", "AAAA", "CNAME", "MX", "SRV", "TXT")
        
        foreach ($zone in $zones) {
            Write-MandALog "Processing DNS records for zone: $($zone.ZoneName)" -Level "INFO"
            
            try {
                $records = Get-DnsServerResourceRecord -ComputerName $dnsServer -ZoneName $zone.ZoneName -ErrorAction Stop |
                    Where-Object { $_.RecordType -in $importantRecordTypes }
                
                $processedCount = 0
                foreach ($record in $records) {
                    $processedCount++
                    if ($processedCount % 100 -eq 0) {
                        Write-Progress -Activity "Processing DNS Records" -Status "Zone: $($zone.ZoneName)" -PercentComplete (($processedCount / $records.Count) * 100)
                    }
                    
                    $recordData = switch ($record.RecordType) {
                        "A" { $record.RecordData.IPv4Address.IPAddressToString }
                        "AAAA" { $record.RecordData.IPv6Address.IPAddressToString }
                        "CNAME" { $record.RecordData.HostNameAlias }
                        "MX" { "$($record.RecordData.Preference) $($record.RecordData.MailExchange)" }
                        "SRV" { "$($record.RecordData.Priority) $($record.RecordData.Weight) $($record.RecordData.Port) $($record.RecordData.DomainName)" }
                        "TXT" { $record.RecordData.DescriptiveText -join " " }
                        default { "Unknown" }
                    }
                    
                    $dnsRecords.Add([PSCustomObject]@{
                        ZoneName = $zone.ZoneName
                        HostName = $record.HostName
                        RecordType = $record.RecordType
                        RecordData = $recordData
                        TimeToLive = $record.TimeToLive
                        Timestamp = $record.Timestamp
                        RecordClass = $record.RecordClass
                    })
                }
                
                Write-Progress -Activity "Processing DNS Records" -Completed
                
            } catch {
                Write-MandALog "Error retrieving records from zone $($zone.ZoneName): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-MandALog "Found $($dnsRecords.Count) DNS records" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $dnsRecords -FilePath $outputFile
        return $dnsRecords
        
    } catch {
        Write-MandALog "Error retrieving DNS Records: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            ZoneName = $null; HostName = $null; RecordType = $null
            RecordData = $null; TimeToLive = $null; Timestamp = $null; RecordClass = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

function Get-ADSubnetsData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "ADSubnets.csv"
    $subnets = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "AD Subnets CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving AD Sites and Services subnet information" -Level "INFO"
        
        # Get AD subnets from Sites and Services
        $configNC = ([ADSI]"LDAP://RootDSE").configurationNamingContext
        $subnetContainer = [ADSI]"LDAP://CN=Subnets,CN=Sites,$configNC"
        
        $searcher = New-Object System.DirectoryServices.DirectorySearcher($subnetContainer)
        $searcher.Filter = "(objectClass=subnet)"
        $searcher.PropertiesToLoad.AddRange(@("name", "siteObject", "description", "location", "whenCreated", "whenChanged"))
        
        $results = $searcher.FindAll()
        
        foreach ($result in $results) {
            $subnet = $result.Properties
            
            # Extract site name from DN
            $siteDN = $subnet["siteobject"][0]
            $siteName = if ($siteDN) {
                if ($siteDN -match "CN=([^,]+),") { $matches[1] } else { "Unknown" }
            } else { "Not Assigned" }
            
            $subnets.Add([PSCustomObject]@{
                SubnetName = $subnet["name"][0]
                Site = $siteName
                Description = if ($subnet["description"]) { $subnet["description"][0] } else { "" }
                Location = if ($subnet["location"]) { $subnet["location"][0] } else { "" }
                Created = if ($subnet["whencreated"]) { $subnet["whencreated"][0] } else { $null }
                Modified = if ($subnet["whenchanged"]) { $subnet["whenchanged"][0] } else { $null }
            })
        }
        
        Write-MandALog "Found $($subnets.Count) AD subnets" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $subnets -FilePath $outputFile
        return $subnets
        
    } catch {
        Write-MandALog "Error retrieving AD Subnets: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            SubnetName = $null; Site = $null; Description = $null
            Location = $null; Created = $null; Modified = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

function Get-ADSitesData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "ADSites.csv"
    $sites = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "AD Sites CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving AD Sites information" -Level "INFO"
        
        # Get all AD sites
        $adSites = Get-ADReplicationSite -Filter * -Properties * -ErrorAction Stop
        
        foreach ($site in $adSites) {
            # Count subnets for this site
            $subnetCount = (Get-ADReplicationSubnet -Filter "Site -eq '$($site.DistinguishedName)'" -ErrorAction SilentlyContinue | Measure-Object).Count
            
            # Get site links
            $siteLinks = Get-ADReplicationSiteLink -Filter * -ErrorAction SilentlyContinue | 
                Where-Object { $_.SitesIncluded -contains $site.DistinguishedName }
            
            # Get DCs in site
            $siteDCs = Get-ADDomainController -Filter "Site -eq '$($site.Name)'" -ErrorAction SilentlyContinue
            
            $sites.Add([PSCustomObject]@{
                SiteName = $site.Name
                Description = $site.Description
                Location = $site.Location
                SubnetCount = $subnetCount
                DCCount = ($siteDCs | Measure-Object).Count
                DomainControllers = ($siteDCs.HostName -join "; ")
                SiteLinks = ($siteLinks.Name -join "; ")
                InterSiteTopologyGenerator = $site.InterSiteTopologyGenerator
                Options = $site.Options
                Created = $site.Created
                Modified = $site.Modified
                ProtectedFromAccidentalDeletion = $site.ProtectedFromAccidentalDeletion
            })
        }
        
        Write-MandALog "Found $($sites.Count) AD sites" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $sites -FilePath $outputFile
        return $sites
        
    } catch {
        Write-MandALog "Error retrieving AD Sites: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            SiteName = $null; Description = $null; Location = $null
            SubnetCount = $null; DCCount = $null; DomainControllers = $null
            SiteLinks = $null; InterSiteTopologyGenerator = $null; Options = $null
            Created = $null; Modified = $null; ProtectedFromAccidentalDeletion = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Invoke-NetworkInfrastructureDiscovery',
    'Get-DHCPServersData',
    'Get-DHCPScopesData',
    'Get-DHCPReservationsData',
    'Get-DHCPOptionsData',
    'Get-DNSServersData',
    'Get-DNSZonesData',
    'Get-DNSRecordsData',
    'Get-ADSubnetsData',
    'Get-ADSitesData'
)
