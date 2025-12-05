# -*- coding: utf-8-bom -*-
#Requires -Version 5.1


# Fallback logging function if Write-MandALog is not available
if (-not (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
    function Write-MandALog {
        param(
            [string]$Message,
            [string]$Level = "INFO",
            [string]$Component = "Discovery",
            [hashtable]$Context = @{}
        )
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        Write-Host "[$timestamp] [$Level] [$Component] $Message" -ForegroundColor $(
            switch ($Level) {
                'ERROR' { 'Red' }
                'WARN' { 'Yellow' }
                'SUCCESS' { 'Green' }
                'HEADER' { 'Cyan' }
                'DEBUG' { 'Gray' }
                default { 'White' }
            }
        )
    }
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

function Invoke-NetworkInfrastructureDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-NetworkInfrastructureLog -Level "HEADER" -Message "Starting Discovery (v4.0 - Clean Session Auth)" -Context $Context
    Write-NetworkInfrastructureLog -Level "INFO" -Message "Using authentication session: $SessionId" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    # Ensure ClassDefinitions module is loaded
    try {
        if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
            Import-Module -Name "$PSScriptRoot\..\Core\ClassDefinitions.psm1" -Force -ErrorAction Stop
        }
        $result = [DiscoveryResult]::new('NetworkInfrastructure')
    } catch {
        Write-NetworkInfrastructureLog -Level "ERROR" -Message "Failed to load DiscoveryResult class: $($_.Exception.Message)" -Context $Context
        throw "Critical error: Cannot load required DiscoveryResult class. Discovery cannot proceed."
    }

    try {
        # Validate context
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Ensure-Path -Path $outputPath

        # Authenticate using session (if needed for this service type)
        if ("Network" -eq "Graph") {
            Write-NetworkInfrastructureLog -Level "INFO" -Message "Getting authentication for Graph service..." -Context $Context
            try {
                $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId
                Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Connected to Microsoft Graph via session authentication" -Context $Context
            } catch {
                $result.AddError("Failed to authenticate with Graph service: $($_.Exception.Message)", $_.Exception, $null)
                return $result
            }
        } else {
            Write-NetworkInfrastructureLog -Level "INFO" -Message "Using session-based authentication for Network service" -Context $Context
        }

        # Perform comprehensive network discovery
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        Write-NetworkInfrastructureLog -Level "INFO" -Message "Starting comprehensive network infrastructure discovery" -Context $Context
        
        # Discover network adapters and IP configuration
        Write-NetworkInfrastructureLog -Level "INFO" -Message "Discovering network adapters..." -Context $Context
        $networkAdapters = Get-NetworkAdapterInfo
        foreach ($adapter in $networkAdapters) {
            $adapter._DataType = 'NetworkAdapter'
            $null = $allDiscoveredData.Add($adapter)
        }
        
        # Discover routing table
        Write-NetworkInfrastructureLog -Level "INFO" -Message "Discovering routing table..." -Context $Context
        $routes = Get-NetworkRoutes
        foreach ($route in $routes) {
            $route._DataType = 'NetworkRoute'
            $null = $allDiscoveredData.Add($route)
        }
        
        # Discover ARP table for topology mapping
        Write-NetworkInfrastructureLog -Level "INFO" -Message "Discovering ARP table..." -Context $Context
        $arpEntries = Get-ARPTable
        foreach ($arp in $arpEntries) {
            $arp._DataType = 'ARPEntry'
            $null = $allDiscoveredData.Add($arp)
        }
        
        # Discover DHCP servers
        Write-NetworkInfrastructureLog -Level "INFO" -Message "Discovering DHCP servers..." -Context $Context
        $dhcpServers = Get-DHCPServers
        foreach ($dhcp in $dhcpServers) {
            $dhcp._DataType = 'DHCPServer'
            $null = $allDiscoveredData.Add($dhcp)
        }
        
        # Discover DNS servers and zones
        Write-NetworkInfrastructureLog -Level "INFO" -Message "Discovering DNS infrastructure..." -Context $Context
        $dnsInfo = Get-DNSInfrastructure
        foreach ($dns in $dnsInfo) {
            $dns._DataType = 'DNSInfrastructure'
            $null = $allDiscoveredData.Add($dns)
        }
        
        # Discover network switches and routers via SNMP (if configured)
        if ($Configuration.discovery.networkInfrastructure.enableSNMP) {
            Write-NetworkInfrastructureLog -Level "INFO" -Message "Discovering SNMP devices..." -Context $Context
            $snmpDevices = Get-SNMPDevices -Configuration $Configuration
            foreach ($device in $snmpDevices) {
                $device._DataType = 'SNMPDevice'
                $null = $allDiscoveredData.Add($device)
            }
        }
        
        # Discover network shares
        Write-NetworkInfrastructureLog -Level "INFO" -Message "Discovering network shares..." -Context $Context
        $networkShares = Get-NetworkShares
        foreach ($share in $networkShares) {
            $share._DataType = 'NetworkShare'
            $null = $allDiscoveredData.Add($share)
        }
        
        # Discover firewall rules (Windows Firewall)
        Write-NetworkInfrastructureLog -Level "INFO" -Message "Discovering firewall rules..." -Context $Context
        $firewallRules = Get-FirewallConfiguration
        foreach ($rule in $firewallRules) {
            $rule._DataType = 'FirewallRule'
            $null = $allDiscoveredData.Add($rule)
        }

        # Export data
        if ($allDiscoveredData.Count -gt 0) {
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $data = $group.Group
                $data | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "NetworkInfrastructure" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }
                
                $fileName = "NetworkInfrastructure_$($group.Name).csv"
                $filePath = Join-Path $outputPath $fileName
                $data | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                Write-NetworkInfrastructureLog -Level "SUCCESS" -Message "Exported $($data.Count) $($group.Name) records to $fileName" -Context $Context
            }
        }

        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-NetworkInfrastructureLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        if ("Network" -eq "Graph") {
            Disconnect-MgGraph -ErrorAction SilentlyContinue
        }
        $stopwatch.Stop()
        $result.EndTime = Get-Date
        Write-NetworkInfrastructureLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

function Get-NetworkAdapterInfo {
    [CmdletBinding()]
    param()
    
    try {
        $adapters = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' }
        $results = @()
        
        foreach ($adapter in $adapters) {
            $ipConfig = Get-NetIPConfiguration -InterfaceIndex $adapter.InterfaceIndex -ErrorAction SilentlyContinue
            $ipAddress = ($ipConfig.IPv4Address | Select-Object -First 1).IPAddress
            $subnetMask = ($ipConfig.IPv4Address | Select-Object -First 1).PrefixLength
            $gateway = ($ipConfig.IPv4DefaultGateway | Select-Object -First 1).NextHop
            $dnsServers = $ipConfig.DNSServer.ServerAddresses -join ';'
            
            $results += [PSCustomObject]@{
                InterfaceName = $adapter.Name
                InterfaceDescription = $adapter.InterfaceDescription
                MACAddress = $adapter.MacAddress
                IPAddress = $ipAddress
                SubnetMask = $subnetMask
                DefaultGateway = $gateway
                DNSServers = $dnsServers
                Speed = $adapter.LinkSpeed
                Status = $adapter.Status
                VlanID = $adapter.VlanID
                ComputerName = $env:COMPUTERNAME
            }
        }
        return $results
    } catch {
        Write-NetworkInfrastructureLog -Level "ERROR" -Message "Failed to get network adapter info: $($_.Exception.Message)"
        return @()
    }
}

function Get-NetworkRoutes {
    [CmdletBinding()]
    param()
    
    try {
        $routes = Get-NetRoute | Where-Object { $_.RouteMetric -lt 1000 }
        $results = @()
        
        foreach ($route in $routes) {
            $results += [PSCustomObject]@{
                DestinationPrefix = $route.DestinationPrefix
                NextHop = $route.NextHop
                InterfaceIndex = $route.InterfaceIndex
                InterfaceAlias = $route.InterfaceAlias
                RouteMetric = $route.RouteMetric
                Protocol = $route.Protocol
                AddressFamily = $route.AddressFamily
                ComputerName = $env:COMPUTERNAME
            }
        }
        return $results
    } catch {
        Write-NetworkInfrastructureLog -Level "ERROR" -Message "Failed to get network routes: $($_.Exception.Message)"
        return @()
    }
}

function Get-ARPTable {
    [CmdletBinding()]
    param()
    
    try {
        $arpEntries = Get-NetNeighbor | Where-Object { $_.State -ne 'Unreachable' }
        $results = @()
        
        foreach ($entry in $arpEntries) {
            $results += [PSCustomObject]@{
                IPAddress = $entry.IPAddress
                MACAddress = $entry.LinkLayerAddress
                InterfaceIndex = $entry.InterfaceIndex
                InterfaceAlias = $entry.InterfaceAlias
                State = $entry.State
                AddressFamily = $entry.AddressFamily
                ComputerName = $env:COMPUTERNAME
            }
        }
        return $results
    } catch {
        Write-NetworkInfrastructureLog -Level "ERROR" -Message "Failed to get ARP table: $($_.Exception.Message)"
        return @()
    }
}

function Get-DHCPServers {
    [CmdletBinding()]
    param()
    
    try {
        $results = @()
        $adapters = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' }
        
        foreach ($adapter in $adapters) {
            $dhcpEnabled = (Get-NetIPInterface -InterfaceIndex $adapter.InterfaceIndex -AddressFamily IPv4).Dhcp
            if ($dhcpEnabled -eq 'Enabled') {
                $ipConfig = Get-NetIPConfiguration -InterfaceIndex $adapter.InterfaceIndex
                $dhcpServer = $ipConfig.NetProfile.IPv4Connectivity
                
                $results += [PSCustomObject]@{
                    InterfaceName = $adapter.Name
                    InterfaceIndex = $adapter.InterfaceIndex
                    DHCPEnabled = $true
                    DHCPServer = "Unknown" # DHCP server discovery requires WMI or registry parsing
                    ComputerName = $env:COMPUTERNAME
                }
            }
        }
        return $results
    } catch {
        Write-NetworkInfrastructureLog -Level "ERROR" -Message "Failed to get DHCP servers: $($_.Exception.Message)"
        return @()
    }
}

function Get-DNSInfrastructure {
    [CmdletBinding()]
    param()
    
    try {
        $results = @()
        $dnsServers = Get-DnsClientServerAddress | Where-Object { $_.AddressFamily -eq 2 }
        
        foreach ($server in $dnsServers) {
            foreach ($address in $server.ServerAddresses) {
                $results += [PSCustomObject]@{
                    InterfaceIndex = $server.InterfaceIndex
                    InterfaceAlias = $server.InterfaceAlias
                    DNSServer = $address
                    AddressFamily = 'IPv4'
                    ComputerName = $env:COMPUTERNAME
                }
            }
        }
        
        # Get DNS cache for additional insight
        $dnsCache = Get-DnsClientCache | Select-Object -First 100
        foreach ($entry in $dnsCache) {
            $results += [PSCustomObject]@{
                RecordName = $entry.Name
                RecordType = $entry.Type
                TTL = $entry.TimeToLive
                Data = $entry.Data
                Status = $entry.Status
                ComputerName = $env:COMPUTERNAME
                _DataType = 'DNSCache'
            }
        }
        
        return $results
    } catch {
        Write-NetworkInfrastructureLog -Level "ERROR" -Message "Failed to get DNS infrastructure: $($_.Exception.Message)"
        return @()
    }
}

function Get-SNMPDevices {
    [CmdletBinding()]
    param(
        [hashtable]$Configuration
    )
    
    try {
        $results = @()
        
        # This is a placeholder for SNMP discovery
        # In a real implementation, you would use SNMP libraries or external tools
        Write-NetworkInfrastructureLog -Level "INFO" -Message "SNMP discovery requires additional SNMP libraries"
        
        # Example structure for SNMP devices
        $results += [PSCustomObject]@{
            DeviceIP = "Not Implemented"
            DeviceType = "SNMP discovery requires additional libraries"
            SystemName = "N/A"
            SystemDescription = "N/A"
            Uptime = "N/A"
            Location = "N/A"
            Contact = "N/A"
            ComputerName = $env:COMPUTERNAME
        }
        
        return $results
    } catch {
        Write-NetworkInfrastructureLog -Level "ERROR" -Message "Failed to get SNMP devices: $($_.Exception.Message)"
        return @()
    }
}

function Get-NetworkShares {
    [CmdletBinding()]
    param()
    
    try {
        $shares = Get-SmbShare
        $results = @()
        
        foreach ($share in $shares) {
            $results += [PSCustomObject]@{
                ShareName = $share.Name
                Path = $share.Path
                Description = $share.Description
                ShareType = $share.ShareType
                ShareState = $share.ShareState
                Availability = $share.Availability
                ContinuouslyAvailable = $share.ContinuouslyAvailable
                ComputerName = $env:COMPUTERNAME
            }
        }
        return $results
    } catch {
        Write-NetworkInfrastructureLog -Level "ERROR" -Message "Failed to get network shares: $($_.Exception.Message)"
        return @()
    }
}

function Get-FirewallConfiguration {
    [CmdletBinding()]
    param()
    
    try {
        $firewallRules = Get-NetFirewallRule | Where-Object { $_.Enabled -eq $true } | Select-Object -First 50
        $results = @()
        
        foreach ($rule in $firewallRules) {
            $addressFilter = Get-NetFirewallAddressFilter -AssociatedNetFirewallRule $rule
            $portFilter = Get-NetFirewallPortFilter -AssociatedNetFirewallRule $rule
            
            $results += [PSCustomObject]@{
                RuleName = $rule.DisplayName
                Direction = $rule.Direction
                Action = $rule.Action
                Profile = $rule.Profile
                LocalAddress = $addressFilter.LocalAddress -join ';'
                RemoteAddress = $addressFilter.RemoteAddress -join ';'
                LocalPort = $portFilter.LocalPort -join ';'
                RemotePort = $portFilter.RemotePort -join ';'
                Protocol = $portFilter.Protocol
                Enabled = $rule.Enabled
                ComputerName = $env:COMPUTERNAME
            }
        }
        return $results
    } catch {
        Write-NetworkInfrastructureLog -Level "ERROR" -Message "Failed to get firewall configuration: $($_.Exception.Message)"
        return @()
    }
}

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

Export-ModuleMember -Function Invoke-NetworkInfrastructureDiscovery, Get-NetworkAdapterInfo, Get-NetworkRoutes, Get-ARPTable, Get-DHCPServers, Get-DNSInfrastructure, Get-SNMPDevices, Get-NetworkShares, Get-FirewallConfiguration

