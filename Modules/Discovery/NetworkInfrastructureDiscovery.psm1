# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

#================================================================================
# M&A Discovery Module: NetworkInfrastructure
# Description: Discovers DHCP, DNS, and network configuration information.
#================================================================================

function Get-AuthInfoFromConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    # Add debugging to see what's in the configuration
    Write-MandALog -Message "AuthCheck: Received config keys: $($Configuration.Keys -join ', ')" -Level "DEBUG" -Component "NetworkInfrastructureDiscovery"

    # Check all possible locations for auth info
    if ($Configuration._AuthContext) { return $Configuration._AuthContext }
    if ($Configuration._Credentials) { return $Configuration._Credentials }
    if ($Configuration.authentication) {
        if ($Configuration.authentication._Credentials) { 
            return $Configuration.authentication._Credentials 
        }
        if ($Configuration.authentication.ClientId -and 
            $Configuration.authentication.ClientSecret -and 
            $Configuration.authentication.TenantId) {
            return @{
                ClientId     = $Configuration.authentication.ClientId
                ClientSecret = $Configuration.authentication.ClientSecret
                TenantId     = $Configuration.authentication.TenantId
            }
        }
    }
    if ($Configuration.ClientId -and $Configuration.ClientSecret -and $Configuration.TenantId) {
        return @{
            ClientId     = $Configuration.ClientId
            ClientSecret = $Configuration.ClientSecret
            TenantId     = $Configuration.TenantId
        }
    }
    return $null
}

function Write-NetworkInfrastructureLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    Write-MandALog -Message "[NetworkInfrastructure] $Message" -Level $Level -Component "NetworkInfrastructureDiscovery" -Context $Context
}

# --- Main Discovery Function ---

function Invoke-NetworkInfrastructureDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )

    Write-NetworkInfrastructureLog -Level "HEADER" -Message "Starting Discovery" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # 1. INITIALIZE RESULT OBJECT
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('NetworkInfrastructure')
    } else {
        # Fallback to hashtable
        $result = @{
            Success      = $true; ModuleName = 'NetworkInfrastructure'; RecordCount = 0;
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
        Write-NetworkInfrastructureLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-NetworkInfrastructureLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
        Ensure-Path -Path $outputPath

        # 3. VALIDATE MODULE-SPECIFIC CONFIGURATION
        # NetworkInfrastructure is primarily on-premises focused

        # 4. AUTHENTICATE & CONNECT
        Write-NetworkInfrastructureLog -Level "INFO" -Message "Extracting authentication information..." -Context $Context
        $authInfo = Get-AuthInfoFromConfiguration -Configuration $Configuration
        
        if (-not $authInfo) {
            Write-NetworkInfrastructureLog -Level "INFO" -Message "No cloud authentication needed for on-premises discovery" -Context $Context
            # Continue with local system auth
        } else {
            Write-NetworkInfrastructureLog -Level "DEBUG" -Message "Auth info found. ClientId: $($authInfo.ClientId.Substring(0,8))..." -Context $Context
        }

        # No specific service connection needed for network infrastructure discovery
        # These are all on-premises AD/DNS/DHCP queries

        # 5. PERFORM DISCOVERY
        Write-NetworkInfrastructureLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Initialize counters
        $sectionResults = @{
            DHCPServers = 0
            DHCPScopes = 0
            DHCPReservations = 0
            DHCPOptions = 0
            DNSServers = 0
            DNSZones = 0
            DNSRecords = 0
            ADSubnets = 0
            ADSites = 0
        }
        
        # DHCP Discovery
        try {
            Write-NetworkInfrastructureLog -Level "INFO" -Message "Starting DHCP infrastructure discovery..." -Context $Context
            
            # Check if DHCP management tools are available
            if (Get-Command Get-DhcpServerInDC -ErrorAction SilentlyContinue) {
                # Get DHCP Servers
                $dhcpServers = Get-DHCPServersData -Configuration $Configuration -Context $Context
                if ($dhcpServers -and $dhcpServers.Count -gt 0) {
                    $null = $allDiscoveredData.AddRange($dhcpServers)
                    $sectionResults.DHCPServers = $dhcpServers.Count
                    Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Discovered $($dhcpServers.Count) DHCP servers" -Context $Context
                }
                
                # Get DHCP Scopes
                $dhcpScopes = Get-DHCPScopesData -Configuration $Configuration -Context $Context
                if ($dhcpScopes -and $dhcpScopes.Count -gt 0) {
                    $null = $allDiscoveredData.AddRange($dhcpScopes)
                    $sectionResults.DHCPScopes = $dhcpScopes.Count
                    Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Discovered $($dhcpScopes.Count) DHCP scopes" -Context $Context
                }
                
                # Get DHCP Reservations
                $dhcpReservations = Get-DHCPReservationsData -Configuration $Configuration -Context $Context
                if ($dhcpReservations -and $dhcpReservations.Count -gt 0) {
                    $null = $allDiscoveredData.AddRange($dhcpReservations)
                    $sectionResults.DHCPReservations = $dhcpReservations.Count
                    Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Discovered $($dhcpReservations.Count) DHCP reservations" -Context $Context
                }
                
                # Get DHCP Options
                $dhcpOptions = Get-DHCPOptionsData -Configuration $Configuration -Context $Context
                if ($dhcpOptions -and $dhcpOptions.Count -gt 0) {
                    $null = $allDiscoveredData.AddRange($dhcpOptions)
                    $sectionResults.DHCPOptions = $dhcpOptions.Count
                    Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Discovered $($dhcpOptions.Count) DHCP options" -Context $Context
                }
            } else {
                Write-NetworkInfrastructureLog -Level "WARN" -Message "DHCP Server management tools not available" -Context $Context
                $result.AddWarning("DHCP Server management tools not installed", @{Section="DHCP"})
            }
        } catch {
            Write-NetworkInfrastructureLog -Level "ERROR" -Message "Error in DHCP discovery: $($_.Exception.Message)" -Context $Context
            $result.AddWarning("Failed to discover DHCP infrastructure: $($_.Exception.Message)", @{Section="DHCP"})
        }
        
        # DNS Discovery
        try {
            Write-NetworkInfrastructureLog -Level "INFO" -Message "Starting DNS infrastructure discovery..." -Context $Context
            
            # Get DNS Servers
            $dnsServers = Get-DNSServersData -Configuration $Configuration -Context $Context
            if ($dnsServers -and $dnsServers.Count -gt 0) {
                $null = $allDiscoveredData.AddRange($dnsServers)
                $sectionResults.DNSServers = $dnsServers.Count
                Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Discovered $($dnsServers.Count) DNS servers" -Context $Context
            }
            
            # Get DNS Zones (only if DNS tools available)
            if (Get-Command Get-DnsServerZone -ErrorAction SilentlyContinue) {
                $dnsZones = Get-DNSZonesData -Configuration $Configuration -Context $Context
                if ($dnsZones -and $dnsZones.Count -gt 0) {
                    $null = $allDiscoveredData.AddRange($dnsZones)
                    $sectionResults.DNSZones = $dnsZones.Count
                    Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Discovered $($dnsZones.Count) DNS zones" -Context $Context
                }
                
                # Get DNS Records (limited to important types)
                $dnsRecords = Get-DNSRecordsData -Configuration $Configuration -Context $Context
                if ($dnsRecords -and $dnsRecords.Count -gt 0) {
                    $null = $allDiscoveredData.AddRange($dnsRecords)
                    $sectionResults.DNSRecords = $dnsRecords.Count
                    Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Discovered $($dnsRecords.Count) DNS records" -Context $Context
                }
            } else {
                Write-NetworkInfrastructureLog -Level "WARN" -Message "DNS Server management tools not available" -Context $Context
                $result.AddWarning("DNS Server management tools not installed", @{Section="DNS"})
            }
        } catch {
            Write-NetworkInfrastructureLog -Level "ERROR" -Message "Error in DNS discovery: $($_.Exception.Message)" -Context $Context
            $result.AddWarning("Failed to discover DNS infrastructure: $($_.Exception.Message)", @{Section="DNS"})
        }
        
        # Network Configuration Discovery
        try {
            Write-NetworkInfrastructureLog -Level "INFO" -Message "Starting network configuration discovery..." -Context $Context
            
            # Get AD Subnets
            $adSubnets = Get-ADSubnetsData -Configuration $Configuration -Context $Context
            if ($adSubnets -and $adSubnets.Count -gt 0) {
                $null = $allDiscoveredData.AddRange($adSubnets)
                $sectionResults.ADSubnets = $adSubnets.Count
                Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Discovered $($adSubnets.Count) AD subnets" -Context $Context
            }
            
            # Get AD Sites
            $adSites = Get-ADSitesData -Configuration $Configuration -Context $Context
            if ($adSites -and $adSites.Count -gt 0) {
                $null = $allDiscoveredData.AddRange($adSites)
                $sectionResults.ADSites = $adSites.Count
                Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Discovered $($adSites.Count) AD sites" -Context $Context
            }
        } catch {
            Write-NetworkInfrastructureLog -Level "ERROR" -Message "Error in network configuration discovery: $($_.Exception.Message)" -Context $Context
            $result.AddWarning("Failed to discover network configuration: $($_.Exception.Message)", @{Section="NetworkConfig"})
        }

        # 6. EXPORT DATA TO CSV
        if ($allDiscoveredData.Count -gt 0) {
            Write-NetworkInfrastructureLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            
            # Export with standardized filenames expected by orchestrator
            # Group by data type and export
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $data = $group.Group
                
                # Add metadata to each record
                $data | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "NetworkInfrastructure" -Force
                }
                
                # Map to expected filenames
                $fileName = switch ($dataType) {
                    "DHCPServers" { "NetworkInfrastructure_DHCPServers.csv" }
                    "DHCPScopes" { "NetworkInfrastructure_DHCPScopes.csv" }
                    "DHCPReservations" { "NetworkInfrastructure_DHCPReservations.csv" }
                    "DHCPOptions" { "NetworkInfrastructure_DHCPOptions.csv" }
                    "DNSServers" { "NetworkInfrastructure_DNSServers.csv" }
                    "DNSZones" { "NetworkInfrastructure_DNSZones.csv" }
                    "DNSRecords" { "NetworkInfrastructure_DNSRecords.csv" }
                    "ADSubnets" { "NetworkInfrastructure_ADSubnets.csv" }
                    "ADSites" { "NetworkInfrastructure_ADSites.csv" }
                    default { "NetworkInfrastructure_$dataType.csv" }
                }
                
                $filePath = Join-Path $outputPath $fileName
                $data | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Exported $($data.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-NetworkInfrastructureLog -Level "WARN" -Message "No data discovered to export" -Context $Context
        }

        # 7. FINALIZE METADATA
        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $allDiscoveredData.Count
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        $result.Metadata["SectionResults"] = $sectionResults
        $result.Metadata["ToolsAvailable"] = @{
            DHCP = (Get-Command Get-DhcpServerInDC -ErrorAction SilentlyContinue) -ne $null
            DNS = (Get-Command Get-DnsServerZone -ErrorAction SilentlyContinue) -ne $null
            AD = (Get-Command Get-ADDomainController -ErrorAction SilentlyContinue) -ne $null
        }

    } catch {
        # Top-level error handler
        Write-NetworkInfrastructureLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        # 8. CLEANUP & COMPLETE
        Write-NetworkInfrastructureLog -Level "INFO" -Message "Cleaning up..." -Context $Context
        
        # No service connections to disconnect for network infrastructure
        
        $stopwatch.Stop()
        $result.Complete()
        
        # Safe record count display
        $recordCount = 0
        if ($result -is [hashtable]) {
            $recordCount = if ($result.RecordCount) { $result.RecordCount } else { 0 }
        } else {
            $recordCount = if ($result.RecordCount) { $result.RecordCount } else { 0 }
        }
        
        Write-NetworkInfrastructureLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $recordCount." -Context $Context
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

# --- DHCP Discovery Functions ---
function Get-DHCPServersData {
    param(
        [hashtable]$Configuration,
        [hashtable]$Context
    )
    
    $dhcpServers = [System.Collections.ArrayList]::new()
    
    try {
        Write-NetworkInfrastructureLog -Message "Retrieving DHCP servers from Active Directory" -Level "INFO" -Context $Context
        
        # Get DHCP servers from AD
        $dhcpServerList = Get-DhcpServerInDC -ErrorAction Stop
        
        foreach ($server in $dhcpServerList) {
            Write-NetworkInfrastructureLog -Message "Querying DHCP server: $($server.DnsName)" -Level "DEBUG" -Context $Context
            
            try {
                # Get server statistics
                $serverStats = Get-DhcpServerv4Statistics -ComputerName $server.DnsName -ErrorAction Stop
                $serverVersion = Get-DhcpServerVersion -ComputerName $server.DnsName -ErrorAction Stop
                
                $null = $dhcpServers.Add([PSCustomObject]@{
                    _DataType = "DHCPServers"
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
                Write-NetworkInfrastructureLog -Message "Error querying DHCP server $($server.DnsName): $($_.Exception.Message)" -Level "WARN" -Context $Context
                
                # Add basic info if detailed query fails
                $null = $dhcpServers.Add([PSCustomObject]@{
                    _DataType = "DHCPServers"
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
        Write-NetworkInfrastructureLog -Message "Unable to retrieve DHCP servers: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    
    return $dhcpServers
}

function Get-DHCPScopesData {
    param(
        [hashtable]$Configuration,
        [hashtable]$Context
    )
    
    $dhcpScopes = [System.Collections.ArrayList]::new()
    
    try {
        # Get DHCP servers first
        $dhcpServers = Get-DhcpServerInDC -ErrorAction SilentlyContinue
        
        foreach ($server in $dhcpServers) {
            Write-NetworkInfrastructureLog -Message "Retrieving scopes from DHCP server: $($server.DnsName)" -Level "DEBUG" -Context $Context
            
            try {
                $scopes = Get-DhcpServerv4Scope -ComputerName $server.DnsName -ErrorAction Stop
                
                foreach ($scope in $scopes) {
                    # Get scope statistics
                    $scopeStats = Get-DhcpServerv4ScopeStatistics -ComputerName $server.DnsName -ScopeId $scope.ScopeId -ErrorAction SilentlyContinue
                    
                    $null = $dhcpScopes.Add([PSCustomObject]@{
                        _DataType = "DHCPScopes"
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
                Write-NetworkInfrastructureLog -Message "Error retrieving scopes from $($server.DnsName): $($_.Exception.Message)" -Level "WARN" -Context $Context
            }
        }
    } catch {
        Write-NetworkInfrastructureLog -Message "Error retrieving DHCP Scopes: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    
    return $dhcpScopes
}

function Get-DHCPReservationsData {
    param(
        [hashtable]$Configuration,
        [hashtable]$Context
    )
    
    $dhcpReservations = [System.Collections.ArrayList]::new()
    
    try {
        $dhcpServers = Get-DhcpServerInDC -ErrorAction SilentlyContinue
        
        foreach ($server in $dhcpServers) {
            try {
                $scopes = Get-DhcpServerv4Scope -ComputerName $server.DnsName -ErrorAction Stop
                
                foreach ($scope in $scopes) {
                    try {
                        $reservations = Get-DhcpServerv4Reservation -ComputerName $server.DnsName -ScopeId $scope.ScopeId -ErrorAction Stop
                        
                        foreach ($reservation in $reservations) {
                            $null = $dhcpReservations.Add([PSCustomObject]@{
                                _DataType = "DHCPReservations"
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
                Write-NetworkInfrastructureLog -Message "Error retrieving reservations from $($server.DnsName): $($_.Exception.Message)" -Level "WARN" -Context $Context
            }
        }
    } catch {
        Write-NetworkInfrastructureLog -Message "Error retrieving DHCP Reservations: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    
    return $dhcpReservations
}

function Get-DHCPOptionsData {
    param(
        [hashtable]$Configuration,
        [hashtable]$Context
    )
    
    $dhcpOptions = [System.Collections.ArrayList]::new()
    
    try {
        $dhcpServers = Get-DhcpServerInDC -ErrorAction SilentlyContinue
        
        foreach ($server in $dhcpServers) {
            try {
                # Get server-level options
                $serverOptions = Get-DhcpServerv4OptionValue -ComputerName $server.DnsName -All -ErrorAction Stop
                
                foreach ($option in $serverOptions) {
                    $null = $dhcpOptions.Add([PSCustomObject]@{
                        _DataType = "DHCPOptions"
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
                            $null = $dhcpOptions.Add([PSCustomObject]@{
                                _DataType = "DHCPOptions"
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
                Write-NetworkInfrastructureLog -Message "Error retrieving options from $($server.DnsName): $($_.Exception.Message)" -Level "WARN" -Context $Context
            }
        }
    } catch {
        Write-NetworkInfrastructureLog -Message "Error retrieving DHCP Options: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    
    return $dhcpOptions
}

# --- DNS Discovery Functions ---
function Get-DNSServersData {
    param(
        [hashtable]$Configuration,
        [hashtable]$Context
    )
    
    $dnsServers = [System.Collections.ArrayList]::new()
    
    try {
        Write-NetworkInfrastructureLog -Message "Retrieving DNS servers from Active Directory" -Level "INFO" -Context $Context
        
        # Check if AD cmdlets are available
        if (Get-Command Get-ADDomainController -ErrorAction SilentlyContinue) {
            # Get all DCs (they typically run DNS)
            $domainControllers = Get-ADDomainController -Filter * -ErrorAction Stop
            
            foreach ($dc in $domainControllers) {
                try {
                    # Test if DNS service is running
                    $dnsService = Get-Service -ComputerName $dc.HostName -Name "DNS" -ErrorAction Stop
                    
                    if ($dnsService) {
                        $dnsServerData = [PSCustomObject]@{
                            _DataType = "DNSServers"
                            ServerName = $dc.HostName
                            IPAddress = $dc.IPv4Address
                            OperatingSystem = $dc.OperatingSystem
                            IsGlobalCatalog = $dc.IsGlobalCatalog
                            IsReadOnly = $dc.IsReadOnly
                            Site = $dc.Site
                            DNSServiceStatus = $dnsService.Status
                        }
                        
                        # Try to get DNS server configuration if DNS cmdlets are available
                        if (Get-Command Get-DnsServer -ErrorAction SilentlyContinue) {
                            try {
                                $dnsServerConfig = Get-DnsServer -ComputerName $dc.HostName -ErrorAction Stop
                                
                                $dnsServerData | Add-Member -MemberType NoteProperty -Name RoundRobin -Value $dnsServerConfig.ServerSetting.RoundRobin -Force
                                $dnsServerData | Add-Member -MemberType NoteProperty -Name LocalNetPriority -Value $dnsServerConfig.ServerSetting.LocalNetPriority -Force
                                $dnsServerData | Add-Member -MemberType NoteProperty -Name SecureResponse -Value $dnsServerConfig.ServerSetting.SecureResponse -Force
                                $dnsServerData | Add-Member -MemberType NoteProperty -Name RecursionEnabled -Value $dnsServerConfig.ServerRecursion.Enable -Force
                                $dnsServerData | Add-Member -MemberType NoteProperty -Name Forwarders -Value ($dnsServerConfig.ServerForwarder.IPAddress.IPAddressToString -join "; ") -Force
                            } catch {
                                Write-NetworkInfrastructureLog -Message "Could not get DNS configuration for $($dc.HostName)" -Level "DEBUG" -Context $Context
                            }
                        }
                        
                        $null = $dnsServers.Add($dnsServerData)
                    }
                } catch {
                    Write-NetworkInfrastructureLog -Message "Error querying DNS on $($dc.HostName): $($_.Exception.Message)" -Level "WARN" -Context $Context
                }
            }
        } else {
            Write-NetworkInfrastructureLog -Message "Active Directory cmdlets not available" -Level "WARN" -Context $Context
        }
    } catch {
        Write-NetworkInfrastructureLog -Message "Error retrieving DNS Servers: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    
    return $dnsServers
}

function Get-DNSZonesData {
    param(
        [hashtable]$Configuration,
        [hashtable]$Context
    )
    
    $dnsZones = [System.Collections.ArrayList]::new()
    
    try {
        # Get primary DNS server
        $primaryDC = Get-ADDomainController -Discover -Service "PrimaryDC" -ErrorAction SilentlyContinue
        $dnsServer = if ($primaryDC) { $primaryDC.HostName } else { $env:COMPUTERNAME }
        
        Write-NetworkInfrastructureLog -Message "Retrieving DNS zones from server: $dnsServer" -Level "INFO" -Context $Context
        
        $zones = Get-DnsServerZone -ComputerName $dnsServer -ErrorAction Stop
        
        foreach ($zone in $zones) {
            $zoneData = [PSCustomObject]@{
                _DataType = "DNSZones"
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
            }
            
            # Try to get record count
            try {
                $recordCount = (Get-DnsServerResourceRecord -ComputerName $dnsServer -ZoneName $zone.ZoneName -ErrorAction SilentlyContinue | Measure-Object).Count
                $zoneData | Add-Member -MemberType NoteProperty -Name RecordCount -Value $recordCount -Force
            } catch {
                $zoneData | Add-Member -MemberType NoteProperty -Name RecordCount -Value 0 -Force
            }
            
            $null = $dnsZones.Add($zoneData)
        }
    } catch {
        Write-NetworkInfrastructureLog -Message "Error retrieving DNS Zones: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    
    return $dnsZones
}

function Get-DNSRecordsData {
    param(
        [hashtable]$Configuration,
        [hashtable]$Context
    )
    
    $dnsRecords = [System.Collections.ArrayList]::new()
    
    try {
        # Get primary DNS server
        $primaryDC = Get-ADDomainController -Discover -Service "PrimaryDC" -ErrorAction SilentlyContinue
        $dnsServer = if ($primaryDC) { $primaryDC.HostName } else { $env:COMPUTERNAME }
        
        # Get all zones
        $zones = Get-DnsServerZone -ComputerName $dnsServer -ErrorAction Stop | Where-Object { -not $_.IsReverseLookupZone }
        
        # Focus on important record types to avoid overwhelming data
        $importantRecordTypes = @("A", "AAAA", "CNAME", "MX", "SRV", "TXT")
        
        foreach ($zone in $zones) {
            Write-NetworkInfrastructureLog -Message "Processing DNS records for zone: $($zone.ZoneName)" -Level "DEBUG" -Context $Context
            
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
                    
                    $null = $dnsRecords.Add([PSCustomObject]@{
                        _DataType = "DNSRecords"
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
                Write-NetworkInfrastructureLog -Message "Error retrieving records from zone $($zone.ZoneName): $($_.Exception.Message)" -Level "WARN" -Context $Context
            }
        }
    } catch {
        Write-NetworkInfrastructureLog -Message "Error retrieving DNS Records: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    
    return $dnsRecords
}

# --- Network Configuration Functions ---
function Get-ADSubnetsData {
    param(
        [hashtable]$Configuration,
        [hashtable]$Context
    )
    
    $subnets = [System.Collections.ArrayList]::new()
    
    try {
        Write-NetworkInfrastructureLog -Message "Retrieving AD Sites and Services subnet information" -Level "INFO" -Context $Context
        
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
            
            $null = $subnets.Add([PSCustomObject]@{
                _DataType = "ADSubnets"
                SubnetName = $subnet["name"][0]
                Site = $siteName
                Description = if ($subnet["description"]) { $subnet["description"][0] } else { "" }
                Location = if ($subnet["location"]) { $subnet["location"][0] } else { "" }
                Created = if ($subnet["whencreated"]) { $subnet["whencreated"][0] } else { $null }
                Modified = if ($subnet["whenchanged"]) { $subnet["whenchanged"][0] } else { $null }
            })
        }
        
        $results.Dispose()
        $searcher.Dispose()
        
    } catch {
        Write-NetworkInfrastructureLog -Message "Error retrieving AD Subnets: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    
    return $subnets
}

function Get-ADSitesData {
    param(
        [hashtable]$Configuration,
        [hashtable]$Context
    )
    
    $sites = [System.Collections.ArrayList]::new()
    
    try {
        Write-NetworkInfrastructureLog -Message "Retrieving AD Sites information" -Level "INFO" -Context $Context
        
        # Check if AD cmdlets are available
        if (Get-Command Get-ADReplicationSite -ErrorAction SilentlyContinue) {
            # Get all AD sites using AD cmdlets
            $adSites = Get-ADReplicationSite -Filter * -Properties * -ErrorAction Stop
            
            foreach ($site in $adSites) {
                # Count subnets for this site
                $subnetCount = (Get-ADReplicationSubnet -Filter "Site -eq '$($site.DistinguishedName)'" -ErrorAction SilentlyContinue | Measure-Object).Count
                
                # Get site links
                $siteLinks = Get-ADReplicationSiteLink -Filter * -ErrorAction SilentlyContinue | 
                    Where-Object { $_.SitesIncluded -contains $site.DistinguishedName }
                
                # Get DCs in site
                $siteDCs = Get-ADDomainController -Filter "Site -eq '$($site.Name)'" -ErrorAction SilentlyContinue
                
                $null = $sites.Add([PSCustomObject]@{
                    _DataType = "ADSites"
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
        } else {
            Write-NetworkInfrastructureLog -Message "AD Replication cmdlets not available. Using ADSI instead." -Level "WARN" -Context $Context
            
            # Use ADSI as fallback
            $configNC = ([ADSI]"LDAP://RootDSE").configurationNamingContext
            $sitesContainer = [ADSI]"LDAP://CN=Sites,$configNC"
            
            $searcher = New-Object System.DirectoryServices.DirectorySearcher($sitesContainer)
            $searcher.Filter = "(objectClass=site)"
            $searcher.PropertiesToLoad.AddRange(@("name", "description", "location", "whenCreated", "whenChanged"))
            
            $results = $searcher.FindAll()
            
            foreach ($result in $results) {
                $site = $result.Properties
                
                $null = $sites.Add([PSCustomObject]@{
                    _DataType = "ADSites"
                    SiteName = $site["name"][0]
                    Description = if ($site["description"]) { $site["description"][0] } else { "" }
                    Location = if ($site["location"]) { $site["location"][0] } else { "" }
                    Created = if ($site["whencreated"]) { $site["whencreated"][0] } else { $null }
                    Modified = if ($site["whenchanged"]) { $site["whenchanged"][0] } else { $null }
                })
            }
            
            $results.Dispose()
            $searcher.Dispose()
        }
    } catch {
        Write-NetworkInfrastructureLog -Message "Error retrieving AD Sites: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    
    return $sites
}

# --- Module Export ---
Export-ModuleMember -Function Invoke-NetworkInfrastructureDiscovery