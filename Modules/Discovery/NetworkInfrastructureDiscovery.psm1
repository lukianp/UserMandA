# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

#================================================================================
# M&A Discovery Module: NetworkInfrastructure
# Description: Discovers DHCP, DNS, and network configuration information.
# Version: 2.0.0 - Fixed RecordCount property handling
#================================================================================

function Get-AuthInfoFromConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    # Standardized pattern to extract credentials passed by the orchestrator.
    if ($Configuration._AuthContext) { return $Configuration._AuthContext }
    if ($Configuration._Credentials) { return $Configuration._Credentials }
    if ($Configuration.authentication -and $Configuration.authentication._Credentials) { return $Configuration.authentication._Credentials }
    if ($Configuration.ClientId -and $Configuration.ClientSecret -and $Configuration.TenantId) {
        return @{
            ClientId     = $Configuration.ClientId
            ClientSecret = $Configuration.ClientSecret
            TenantId     = $Configuration.TenantId
        }
    }
    # Return null if no credentials found
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
    # Module-specific wrapper for consistent logging component name.
    Write-MandALog -Message "[NetworkInfrastructure] $Message" -Level $Level -Component "NetworkInfrastructureDiscovery" -Context $Context
}

# Helper function to safely set a property on either DiscoveryResult or hashtable
function Set-ResultProperty {
    param(
        $Result,
        [string]$PropertyName,
        $Value
    )
    
    if ($Result -is [hashtable]) {
        $Result[$PropertyName] = $Value
    } else {
        $Result.$PropertyName = $Value
    }
}

# Helper function to safely get a property from either DiscoveryResult or hashtable
function Get-ResultProperty {
    param(
        $Result,
        [string]$PropertyName
    )
    
    if ($Result -is [hashtable]) {
        return $Result[$PropertyName]
    } else {
        return $Result.$PropertyName
    }
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
    $result = $null
    $isHashtableResult = $false
    
    # Try to create DiscoveryResult instance
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        try {
            $result = [DiscoveryResult]::new('NetworkInfrastructure')
            Write-NetworkInfrastructureLog -Level "DEBUG" -Message "Created DiscoveryResult class instance" -Context $Context
        } catch {
            Write-NetworkInfrastructureLog -Level "WARN" -Message "Failed to create DiscoveryResult instance: $_" -Context $Context
        }
    }
    
    # Fallback to hashtable if class creation failed
    if (-not $result) {
        $isHashtableResult = $true
        Write-NetworkInfrastructureLog -Level "DEBUG" -Message "Using hashtable fallback for result object" -Context $Context
        
        $result = @{
            Success      = $true
            ModuleName   = 'NetworkInfrastructure'
            RecordCount  = 0
            Errors       = [System.Collections.ArrayList]::new()
            Warnings     = [System.Collections.ArrayList]::new()
            Metadata     = @{}
            StartTime    = Get-Date
            EndTime      = $null
            ExecutionId  = [guid]::NewGuid().ToString()
        }
        
        # Add methods as script blocks for hashtable
        $result.AddError = {
            param($m, $e, $c)
            $errorEntry = @{Message=$m; Exception=$e; Context=$c; Timestamp=Get-Date}
            $this.Errors.Add($errorEntry) | Out-Null
            $this.Success = $false
        }.GetNewClosure()
        
        $result.AddWarning = {
            param($m, $c)
            $warningEntry = @{Message=$m; Context=$c; Timestamp=Get-Date}
            $this.Warnings.Add($warningEntry) | Out-Null
        }.GetNewClosure()
        
        $result.Complete = {
            $this.EndTime = Get-Date
            if ($this.StartTime -and $this.EndTime) {
                $duration = $this.EndTime - $this.StartTime
                $this.Metadata['Duration'] = $duration
                $this.Metadata['DurationSeconds'] = $duration.TotalSeconds
            }
        }.GetNewClosure()
    }

    try {
        # 2. VALIDATE PREREQUISITES & CONTEXT
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Ensure-Path -Path $outputPath

        # 3. AUTHENTICATE & CONNECT
        $authInfo = Get-AuthInfoFromConfiguration -Configuration $Configuration
        
        # For on-premises network discovery, authentication might not be required
        if (-not $authInfo) {
            Write-NetworkInfrastructureLog -Level "INFO" -Message "No authentication context found - proceeding with local system authentication" -Context $Context
        } else {
            Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Authentication context available" -Context $Context
        }

        # 4. PERFORM DISCOVERY
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Initialize section counters in metadata
        if ($isHashtableResult) {
            $result.Metadata['SectionsProcessed'] = 0
            $result.Metadata['SectionErrors'] = 0
        } else {
            $result.Metadata['SectionsProcessed'] = 0
            $result.Metadata['SectionErrors'] = 0
        }
        
        # DHCP Discovery
        try {
            Write-NetworkInfrastructureLog -Level "INFO" -Message "Starting DHCP infrastructure discovery..." -Context $Context
            
            # Get DHCP Servers
            $dhcpServers = Get-DHCPServersData -Configuration $Configuration -Context $Context
            if ($dhcpServers -and $dhcpServers.Count -gt 0) {
                $null = $allDiscoveredData.AddRange($dhcpServers)
                Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Discovered $($dhcpServers.Count) DHCP servers." -Context $Context
            }
            
            # Get DHCP Scopes
            $dhcpScopes = Get-DHCPScopesData -Configuration $Configuration -Context $Context
            if ($dhcpScopes -and $dhcpScopes.Count -gt 0) {
                $null = $allDiscoveredData.AddRange($dhcpScopes)
                Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Discovered $($dhcpScopes.Count) DHCP scopes." -Context $Context
            }
            
            # Get DHCP Reservations
            $dhcpReservations = Get-DHCPReservationsData -Configuration $Configuration -Context $Context
            if ($dhcpReservations -and $dhcpReservations.Count -gt 0) {
                $null = $allDiscoveredData.AddRange($dhcpReservations)
                Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Discovered $($dhcpReservations.Count) DHCP reservations." -Context $Context
            }
            
            # Get DHCP Options
            $dhcpOptions = Get-DHCPOptionsData -Configuration $Configuration -Context $Context
            if ($dhcpOptions -and $dhcpOptions.Count -gt 0) {
                $null = $allDiscoveredData.AddRange($dhcpOptions)
                Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Discovered $($dhcpOptions.Count) DHCP options." -Context $Context
            }
            
            if ($isHashtableResult) {
                $result.Metadata['SectionsProcessed']++
            } else {
                $result.Metadata['SectionsProcessed']++
            }
        } catch {
            $result.AddWarning("Failed to discover DHCP infrastructure: $($_.Exception.Message)", @{Section="DHCP"})
            if ($isHashtableResult) {
                $result.Metadata['SectionErrors']++
            } else {
                $result.Metadata['SectionErrors']++
            }
        }
        
        # DNS Discovery
        try {
            Write-NetworkInfrastructureLog -Level "INFO" -Message "Starting DNS infrastructure discovery..." -Context $Context
            
            # Get DNS Servers
            $dnsServers = Get-DNSServersData -Configuration $Configuration -Context $Context
            if ($dnsServers -and $dnsServers.Count -gt 0) {
                $null = $allDiscoveredData.AddRange($dnsServers)
                Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Discovered $($dnsServers.Count) DNS servers." -Context $Context
            }
            
            # Get DNS Zones
            $dnsZones = Get-DNSZonesData -Configuration $Configuration -Context $Context
            if ($dnsZones -and $dnsZones.Count -gt 0) {
                $null = $allDiscoveredData.AddRange($dnsZones)
                Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Discovered $($dnsZones.Count) DNS zones." -Context $Context
            }
            
            # Get DNS Records
            $dnsRecords = Get-DNSRecordsData -Configuration $Configuration -Context $Context
            if ($dnsRecords -and $dnsRecords.Count -gt 0) {
                $null = $allDiscoveredData.AddRange($dnsRecords)
                Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Discovered $($dnsRecords.Count) DNS records." -Context $Context
            }
            
            if ($isHashtableResult) {
                $result.Metadata['SectionsProcessed']++
            } else {
                $result.Metadata['SectionsProcessed']++
            }
        } catch {
            $result.AddWarning("Failed to discover DNS infrastructure: $($_.Exception.Message)", @{Section="DNS"})
            if ($isHashtableResult) {
                $result.Metadata['SectionErrors']++
            } else {
                $result.Metadata['SectionErrors']++
            }
        }
        
        # Network Configuration Discovery
        try {
            Write-NetworkInfrastructureLog -Level "INFO" -Message "Starting network configuration discovery..." -Context $Context
            
            # Get AD Subnets
            $adSubnets = Get-ADSubnetsData -Configuration $Configuration -Context $Context
            if ($adSubnets -and $adSubnets.Count -gt 0) {
                $null = $allDiscoveredData.AddRange($adSubnets)
                Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Discovered $($adSubnets.Count) AD subnets." -Context $Context
            }
            
            # Get AD Sites
            $adSites = Get-ADSitesData -Configuration $Configuration -Context $Context
            if ($adSites -and $adSites.Count -gt 0) {
                $null = $allDiscoveredData.AddRange($adSites)
                Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Discovered $($adSites.Count) AD sites." -Context $Context
            }
            
            if ($isHashtableResult) {
                $result.Metadata['SectionsProcessed']++
            } else {
                $result.Metadata['SectionsProcessed']++
            }
        } catch {
            $result.AddWarning("Failed to discover network configuration: $($_.Exception.Message)", @{Section="NetworkConfig"})
            if ($isHashtableResult) {
                $result.Metadata['SectionErrors']++
            } else {
                $result.Metadata['SectionErrors']++
            }
        }

        # 5. EXPORT DATA TO CSV
        if ($allDiscoveredData.Count -gt 0) {
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            
            # Group data by type and export to separate CSV files
            $dataTypes = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($typeGroup in $dataTypes) {
                $dataType = $typeGroup.Name
                $data = $typeGroup.Group
                
                # Add metadata to each record
                $data | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "NetworkInfrastructure" -Force
                }
                
                # Determine output file name
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
            
            Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Total records exported: $($allDiscoveredData.Count)" -Context $Context
        } else {
            Write-NetworkInfrastructureLog -Level "WARNING" -Message "No network infrastructure data discovered." -Context $Context
        }

        # 6. FINALIZE & UPDATE METADATA
        # CRITICAL FIX: Ensure RecordCount property exists and is set correctly
        if ($isHashtableResult) {
            # For hashtable, ensure RecordCount key exists and is set
            $result.RecordCount = $allDiscoveredData.Count
            $result['RecordCount'] = $allDiscoveredData.Count  # Ensure both access methods work
            $result.Metadata['TotalRecords'] = $allDiscoveredData.Count
            $result.Metadata['ElapsedTimeSeconds'] = $stopwatch.Elapsed.TotalSeconds
            $result.Metadata['TotalSections'] = 3
        } else {
            # For DiscoveryResult object, set the property directly
            $result.RecordCount = $allDiscoveredData.Count
            $result.Metadata['TotalRecords'] = $allDiscoveredData.Count
            $result.Metadata['ElapsedTimeSeconds'] = $stopwatch.Elapsed.TotalSeconds
            $result.Metadata['TotalSections'] = 3
        }

    } catch {
        # This is the top-level catch for critical, unrecoverable errors.
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
        Write-NetworkInfrastructureLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        Write-NetworkInfrastructureLog -Level "DEBUG" -Message "Stack trace: $($_.ScriptStackTrace)" -Context $Context
    } finally {
        # 7. CLEANUP & COMPLETE
        $stopwatch.Stop()
        $result.Complete() # Sets EndTime
        
        # Get final record count safely - SAFE ACCESS
        $finalRecordCount = 0
        try {
            if ($isHashtableResult) {
                $finalRecordCount = if ($result.ContainsKey('RecordCount')) { $result['RecordCount'] } else { 0 }
            } else {
                $finalRecordCount = if ($result -and $result.PSObject.Properties['RecordCount']) { $result.RecordCount } else { 0 }
            }
        } catch {
            $finalRecordCount = 0
        }
        
        Write-NetworkInfrastructureLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $finalRecordCount." -Context $Context
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
    
    $dhcpServers = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    try {
        Write-NetworkInfrastructureLog -Message "Retrieving DHCP servers from Active Directory" -Level "INFO" -Context $Context
        
        # Check if DHCP server cmdlets are available
        if (-not (Get-Command Get-DhcpServerInDC -ErrorAction SilentlyContinue)) {
            Write-NetworkInfrastructureLog -Message "DHCP Server cmdlets not available. Ensure DHCP Server Tools are installed." -Level "WARN" -Context $Context
            return $dhcpServers
        }
        
        # Get DHCP servers from AD
        $dhcpServerList = Get-DhcpServerInDC -ErrorAction Stop
        
        foreach ($server in $dhcpServerList) {
            Write-NetworkInfrastructureLog -Message "Querying DHCP server: $($server.DnsName)" -Level "INFO" -Context $Context
            
            try {
                # Get server statistics
                $serverStats = Get-DhcpServerv4Statistics -ComputerName $server.DnsName -ErrorAction Stop
                $serverVersion = Get-DhcpServerVersion -ComputerName $server.DnsName -ErrorAction Stop
                
                $dhcpServers.Add([PSCustomObject]@{
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
                $dhcpServers.Add([PSCustomObject]@{
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
        Write-NetworkInfrastructureLog -Message "Unable to retrieve DHCP servers from AD: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    
    return $dhcpServers
}

function Get-DHCPScopesData {
    param(
        [hashtable]$Configuration,
        [hashtable]$Context
    )
    
    $dhcpScopes = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    try {
        if (-not (Get-Command Get-DhcpServerInDC -ErrorAction SilentlyContinue)) {
            return $dhcpScopes
        }
        
        # Get DHCP servers first
        $dhcpServers = Get-DhcpServerInDC -ErrorAction SilentlyContinue
        
        foreach ($server in $dhcpServers) {
            Write-NetworkInfrastructureLog -Message "Retrieving scopes from DHCP server: $($server.DnsName)" -Level "INFO" -Context $Context
            
            try {
                $scopes = Get-DhcpServerv4Scope -ComputerName $server.DnsName -ErrorAction Stop
                
                foreach ($scope in $scopes) {
                    # Get scope statistics
                    $scopeStats = Get-DhcpServerv4ScopeStatistics -ComputerName $server.DnsName -ScopeId $scope.ScopeId -ErrorAction SilentlyContinue
                    
                    $dhcpScopes.Add([PSCustomObject]@{
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
    
    $dhcpReservations = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    try {
        if (-not (Get-Command Get-DhcpServerInDC -ErrorAction SilentlyContinue)) {
            return $dhcpReservations
        }
        
        $dhcpServers = Get-DhcpServerInDC -ErrorAction SilentlyContinue
        
        foreach ($server in $dhcpServers) {
            try {
                $scopes = Get-DhcpServerv4Scope -ComputerName $server.DnsName -ErrorAction Stop
                
                foreach ($scope in $scopes) {
                    try {
                        $reservations = Get-DhcpServerv4Reservation -ComputerName $server.DnsName -ScopeId $scope.ScopeId -ErrorAction Stop
                        
                        foreach ($reservation in $reservations) {
                            $dhcpReservations.Add([PSCustomObject]@{
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
    
    $dhcpOptions = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    try {
        if (-not (Get-Command Get-DhcpServerInDC -ErrorAction SilentlyContinue)) {
            return $dhcpOptions
        }
        
        $dhcpServers = Get-DhcpServerInDC -ErrorAction SilentlyContinue
        
        foreach ($server in $dhcpServers) {
            try {
                # Get server-level options
                $serverOptions = Get-DhcpServerv4OptionValue -ComputerName $server.DnsName -All -ErrorAction Stop
                
                foreach ($option in $serverOptions) {
                    $dhcpOptions.Add([PSCustomObject]@{
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
                            $dhcpOptions.Add([PSCustomObject]@{
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
    
    $dnsServers = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    try {
        Write-NetworkInfrastructureLog -Message "Retrieving DNS servers from Active Directory" -Level "INFO" -Context $Context
        
        # Check if AD cmdlets are available
        if (-not (Get-Command Get-ADDomainController -ErrorAction SilentlyContinue)) {
            Write-NetworkInfrastructureLog -Message "Active Directory cmdlets not available. Ensure RSAT-AD-PowerShell is installed." -Level "WARN" -Context $Context
            return $dnsServers
        }
        
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
                            
                            # Add additional properties
                            $dnsServerData | Add-Member -MemberType NoteProperty -Name ServerVersion -Value $dnsServerConfig.ServerSetting.Version -Force
                            $dnsServerData | Add-Member -MemberType NoteProperty -Name RoundRobin -Value $dnsServerConfig.ServerSetting.RoundRobin -Force
                            $dnsServerData | Add-Member -MemberType NoteProperty -Name LocalNetPriority -Value $dnsServerConfig.ServerSetting.LocalNetPriority -Force
                            $dnsServerData | Add-Member -MemberType NoteProperty -Name SecureResponse -Value $dnsServerConfig.ServerSetting.SecureResponse -Force
                            $dnsServerData | Add-Member -MemberType NoteProperty -Name RecursionEnabled -Value $dnsServerConfig.ServerRecursion.Enable -Force
                            $dnsServerData | Add-Member -MemberType NoteProperty -Name Forwarders -Value ($dnsServerConfig.ServerForwarder.IPAddress.IPAddressToString -join "; ") -Force
                            $dnsServerData | Add-Member -MemberType NoteProperty -Name RootHints -Value $dnsServerConfig.ServerRootHint.Count -Force
                            $dnsServerData | Add-Member -MemberType NoteProperty -Name CacheSize -Value $dnsServerConfig.ServerCache.MaxKBSize -Force
                        } catch {
                            Write-NetworkInfrastructureLog -Message "Could not get DNS configuration for $($dc.HostName)" -Level "DEBUG" -Context $Context
                        }
                    }
                    
                    $dnsServers.Add($dnsServerData)
                }
            } catch {
                Write-NetworkInfrastructureLog -Message "Error querying DNS on $($dc.HostName): $($_.Exception.Message)" -Level "WARN" -Context $Context
                
                # Add basic info if detailed query fails
                $dnsServers.Add([PSCustomObject]@{
                    _DataType = "DNSServers"
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
    
    $dnsZones = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    try {
        # Check if DNS Server cmdlets are available
        if (-not (Get-Command Get-DnsServerZone -ErrorAction SilentlyContinue)) {
            Write-NetworkInfrastructureLog -Message "DNS Server cmdlets not available. Ensure DNS Server Tools are installed." -Level "WARN" -Context $Context
            return $dnsZones
        }
        
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
                SecureSecondaries = $zone.SecureSecondaries
                NotifyServers = ($zone.NotifyServers -join "; ")
                MasterServers = ($zone.MasterServers -join "; ")
                LastZoneTransfer = $zone.LastZoneTransferResult
            }
            
            # Try to get record count
            try {
                $recordCount = (Get-DnsServerResourceRecord -ComputerName $dnsServer -ZoneName $zone.ZoneName -ErrorAction SilentlyContinue | Measure-Object).Count
                $zoneData | Add-Member -MemberType NoteProperty -Name RecordCount -Value $recordCount -Force
            } catch {
                $zoneData | Add-Member -MemberType NoteProperty -Name RecordCount -Value 0 -Force
            }
            
            $dnsZones.Add($zoneData)
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
    
    $dnsRecords = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    try {
        # Check if DNS Server cmdlets are available
        if (-not (Get-Command Get-DnsServerResourceRecord -ErrorAction SilentlyContinue)) {
            Write-NetworkInfrastructureLog -Message "DNS Server cmdlets not available. Ensure DNS Server Tools are installed." -Level "WARN" -Context $Context
            return $dnsRecords
        }
        
        # Get primary DNS server
        $primaryDC = Get-ADDomainController -Discover -Service "PrimaryDC" -ErrorAction SilentlyContinue
        $dnsServer = if ($primaryDC) { $primaryDC.HostName } else { $env:COMPUTERNAME }
        
        # Get all zones
        $zones = Get-DnsServerZone -ComputerName $dnsServer -ErrorAction Stop | Where-Object { -not $_.IsReverseLookupZone }
        
        # Focus on important record types to avoid overwhelming data
        $importantRecordTypes = @("A", "AAAA", "CNAME", "MX", "SRV", "TXT")
        
        foreach ($zone in $zones) {
            Write-NetworkInfrastructureLog -Message "Processing DNS records for zone: $($zone.ZoneName)" -Level "INFO" -Context $Context
            
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
    
    $subnets = [System.Collections.Generic.List[PSCustomObject]]::new()
    
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
            
            $subnets.Add([PSCustomObject]@{
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
    
    $sites = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    try {
        Write-NetworkInfrastructureLog -Message "Retrieving AD Sites information" -Level "INFO" -Context $Context
        
        # Check if AD cmdlets are available
        if (-not (Get-Command Get-ADReplicationSite -ErrorAction SilentlyContinue)) {
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
                
                $sites.Add([PSCustomObject]@{
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
            
            return $sites
        }
        
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
            
            $sites.Add([PSCustomObject]@{
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
    } catch {
        Write-NetworkInfrastructureLog -Message "Error retrieving AD Sites: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    
    return $sites
}

# --- Module Export ---
Export-ModuleMember -Function Invoke-NetworkInfrastructureDiscovery