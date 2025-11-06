# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    DNS/DHCP Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Comprehensive discovery of DNS and DHCP infrastructure including DNS servers, zones, records,
    DHCP servers, scopes, reservations, and network services. Provides detailed visibility into
    network foundation services critical for understanding organizational network architecture.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, DnsServer/DhcpServer modules (optional), Network access
#>

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\UnifiedErrorHandling.psm1") -Force

function Invoke-DNSDHCPDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,
        
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)
        
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Check if DNS/DHCP modules are available
        $dnsModuleAvailable = $false
        $dhcpModuleAvailable = $false
        
        try {
            if (Get-Module -ListAvailable -Name DnsServer) {
                Import-Module DnsServer -Force
                $dnsModuleAvailable = $true
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "DNS Server module loaded successfully" -Level "SUCCESS"
            }
        } catch {
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "DNS Server module not available" -Level "WARN"
        }
        
        try {
            if (Get-Module -ListAvailable -Name DhcpServer) {
                Import-Module DhcpServer -Force
                $dhcpModuleAvailable = $true
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "DHCP Server module loaded successfully" -Level "SUCCESS"
            }
        } catch {
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "DHCP Server module not available" -Level "WARN"
        }
        
        # Discover DNS Infrastructure
        try {
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovering DNS infrastructure..." -Level "INFO"
            
            # Get DNS servers from network configuration
            $dnsServers = @()
            
            # Method 1: Get DNS servers from network adapters
            try {
                $networkAdapters = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' }
                foreach ($adapter in $networkAdapters) {
                    $dnsSettings = Get-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex -ErrorAction SilentlyContinue
                    foreach ($dnsAddress in $dnsSettings.ServerAddresses) {
                        if ($dnsAddress -and $dnsAddress -ne "127.0.0.1" -and $dnsAddress -ne "::1") {
                            $dnsServers += @{
                                IPAddress = $dnsAddress
                                Source = "NetworkAdapter"
                                AdapterName = $adapter.Name
                                InterfaceIndex = $adapter.InterfaceIndex
                            }
                        }
                    }
                }
            } catch {
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Failed to get DNS servers from network adapters: $($_.Exception.Message)" -Level "DEBUG"
            }
            
            # Method 2: Get DNS servers from domain controllers
            try {
                $domain = [System.DirectoryServices.ActiveDirectory.Domain]::GetCurrentDomain()
                $domainControllers = $domain.DomainControllers
                
                foreach ($dc in $domainControllers) {
                    $dnsServers += @{
                        IPAddress = $dc.IPAddress
                        Source = "DomainController"
                        Name = $dc.Name
                        Forest = $dc.Forest
                        Domain = $dc.Domain
                    }
                }
            } catch {
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Failed to get DNS servers from domain controllers: $($_.Exception.Message)" -Level "DEBUG"
            }
            
            # Method 3: Active Directory discovery
            try {
                $adSearcher = [adsisearcher]"(&(objectClass=computer)(servicePrincipalName=*DNS*))"
                $adResults = $adSearcher.FindAll()
                
                foreach ($result in $adResults) {
                    $computerName = $result.Properties["name"][0]
                    $dnsHostName = $result.Properties["dnshostname"][0]
                    
                    $dnsServers += @{
                        Name = $dnsHostName
                        ComputerName = $computerName
                        Source = "ActiveDirectory"
                    }
                }
            } catch {
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "AD-based DNS discovery failed: $($_.Exception.Message)" -Level "DEBUG"
            }
            
            # Remove duplicates and create DNS server objects
            $uniqueDnsServers = $dnsServers | Sort-Object IPAddress -Unique
            
            foreach ($dnsServer in $uniqueDnsServers) {
                # Get additional server information
                $serverInfo = @{
                    IPAddress = $dnsServer.IPAddress
                    Name = $dnsServer.Name
                    ComputerName = $dnsServer.ComputerName
                    Source = $dnsServer.Source
                    AdapterName = $dnsServer.AdapterName
                    InterfaceIndex = $dnsServer.InterfaceIndex
                    Forest = $dnsServer.Forest
                    Domain = $dnsServer.Domain
                }
                
                # Test DNS server responsiveness
                try {
                    $dnsTest = Resolve-DnsName -Name $env:COMPUTERNAME -Server $dnsServer.IPAddress -ErrorAction SilentlyContinue
                    $serverInfo.Status = if ($dnsTest) { "Responsive" } else { "Unresponsive" }
                } catch {
                    $serverInfo.Status = "Unresponsive"
                }
                
                # Get DNS server version (if accessible)
                try {
                    $versionQuery = Resolve-DnsName -Name "version.bind" -Type TXT -Server $dnsServer.IPAddress -ErrorAction SilentlyContinue
                    $serverInfo.Version = $versionQuery.Strings -join ' '
                } catch {
                    $serverInfo.Version = "Unknown"
                }
                
                $dnsServerObj = [PSCustomObject]@{
                    IPAddress = $serverInfo.IPAddress
                    Name = $serverInfo.Name
                    ComputerName = $serverInfo.ComputerName
                    Source = $serverInfo.Source
                    AdapterName = $serverInfo.AdapterName
                    InterfaceIndex = $serverInfo.InterfaceIndex
                    Forest = $serverInfo.Forest
                    Domain = $serverInfo.Domain
                    Status = $serverInfo.Status
                    Version = $serverInfo.Version
                    LastChecked = Get-Date
                    _DataType = "DNSServer"
                }
                
                $null = $allDiscoveredData.Add($dnsServerObj)
            }
            
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovered $($uniqueDnsServers.Count) DNS servers" -Level "SUCCESS"
            
        } catch {
            $Result.AddError("Failed to discover DNS infrastructure: $($_.Exception.Message)", $_.Exception, @{Section="DNSServers"})
        }
        
        # Discover DNS Zones
        if ($dnsModuleAvailable) {
            try {
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovering DNS zones..." -Level "INFO"
                
                # Get DNS zones from local DNS server
                $dnsZones = Get-DnsServerZone -ErrorAction SilentlyContinue
                
                foreach ($zone in $dnsZones) {
                    $zoneObj = [PSCustomObject]@{
                        # Identity
                        ZoneName = $zone.ZoneName
                        ZoneType = $zone.ZoneType
                        
                        # Configuration
                        IsDsIntegrated = $zone.IsDsIntegrated
                        IsAutoCreated = $zone.IsAutoCreated
                        IsPaused = $zone.IsPaused
                        IsReadOnly = $zone.IsReadOnly
                        IsReverseLookupZone = $zone.IsReverseLookupZone
                        IsShutdown = $zone.IsShutdown
                        
                        # Replication
                        DirectoryPartitionName = $zone.DirectoryPartitionName
                        ReplicationScope = $zone.ReplicationScope
                        
                        # Security
                        SecureSecondaries = $zone.SecureSecondaries
                        NotifyServers = ($zone.NotifyServers -join ';')
                        
                        # File information
                        ZoneFile = $zone.ZoneFile
                        
                        # Dynamic updates
                        DynamicUpdate = $zone.DynamicUpdate
                        
                        _DataType = "DNSZone"
                    }
                    
                    $null = $allDiscoveredData.Add($zoneObj)
                }
                
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovered $($dnsZones.Count) DNS zones" -Level "SUCCESS"
                
            } catch {
                $Result.AddWarning("Failed to discover DNS zones: $($_.Exception.Message)", @{Section="DNSZones"})
            }
        }
        
        # Discover DHCP Infrastructure
        try {
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovering DHCP infrastructure..." -Level "INFO"
            
            # Discover DHCP servers
            $dhcpServers = @()
            
            # Method 1: Active Directory discovery
            try {
                $adSearcher = [adsisearcher]"(&(objectClass=computer)(servicePrincipalName=*DHCP*))"
                $adResults = $adSearcher.FindAll()
                
                foreach ($result in $adResults) {
                    if ($result -and $result.Properties -and $result.Properties["name"]) {
                        $computerName = $result.Properties["name"][0]
                        $dnsHostName = if ($result.Properties["dnshostname"]) { $result.Properties["dnshostname"][0] } else { $computerName }
                    } else {
                        Write-ModuleLog -ModuleName "DNSDHCP" -Message "AD result missing required properties, skipping" -Level "DEBUG"
                        continue
                    }
                    
                    $dhcpServers += @{
                        Name = $dnsHostName
                        ComputerName = $computerName
                        Source = "ActiveDirectory"
                    }
                }
            } catch {
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "AD-based DHCP discovery failed: $($_.Exception.Message)" -Level "DEBUG"
            }
            
            # Method 2: Registry-based discovery on local machine
            try {
                $dhcpServicePath = "HKLM:\SYSTEM\CurrentControlSet\Services\DHCPServer"
                if (Test-Path $dhcpServicePath) {
                    $dhcpServers += @{
                        Name = $env:COMPUTERNAME
                        ComputerName = $env:COMPUTERNAME
                        Source = "LocalRegistry"
                    }
                }
            } catch {
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Registry-based DHCP discovery failed: $($_.Exception.Message)" -Level "DEBUG"
            }
            
            # Method 3: Network scan for DHCP servers
            try {
                # Get authorized DHCP servers from AD
                $dhcpInAD = Get-DhcpServerInDC -ErrorAction SilentlyContinue
                foreach ($dhcpServer in $dhcpInAD) {
                    $dhcpServers += @{
                        Name = $dhcpServer.DnsName
                        IPAddress = $dhcpServer.IPAddress
                        Source = "AuthorizedInAD"
                    }
                }
            } catch {
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Authorized DHCP server discovery failed: $($_.Exception.Message)" -Level "DEBUG"
            }
            
            # Remove duplicates and create DHCP server objects
            $uniqueDhcpServers = $dhcpServers | Sort-Object Name -Unique
            
            foreach ($dhcpServer in $uniqueDhcpServers) {
                # Test DHCP server accessibility
                $serverStatus = "Unknown"
                try {
                    if ($dhcpModuleAvailable) {
                        $dhcpStatus = Get-DhcpServerSetting -ComputerName $dhcpServer.Name -ErrorAction SilentlyContinue
                        $serverStatus = if ($dhcpStatus) { "Accessible" } else { "Inaccessible" }
                    }
                } catch {
                    $serverStatus = "Inaccessible"
                }
                
                $dhcpServerObj = [PSCustomObject]@{
                    Name = $dhcpServer.Name
                    ComputerName = $dhcpServer.ComputerName
                    IPAddress = $dhcpServer.IPAddress
                    Source = $dhcpServer.Source
                    Status = $serverStatus
                    LastChecked = Get-Date
                    _DataType = "DHCPServer"
                }
                
                $null = $allDiscoveredData.Add($dhcpServerObj)
            }
            
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovered $($uniqueDhcpServers.Count) DHCP servers" -Level "SUCCESS"
            
        } catch {
            $Result.AddError("Failed to discover DHCP infrastructure: $($_.Exception.Message)", $_.Exception, @{Section="DHCPServers"})
        }
        
        # Discover DHCP Scopes
        if ($dhcpModuleAvailable) {
            try {
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovering DHCP scopes..." -Level "INFO"
                
                # Get DHCP scopes from accessible servers
                $dhcpScopes = @()
                $accessibleDhcpServers = $allDiscoveredData | Where-Object { $_._DataType -eq "DHCPServer" -and $_.Status -eq "Accessible" }
                
                foreach ($dhcpServer in $accessibleDhcpServers) {
                    try {
                        $scopes = Get-DhcpServerv4Scope -ComputerName $dhcpServer.Name -ErrorAction SilentlyContinue
                        
                        foreach ($scope in $scopes) {
                            $scopeObj = [PSCustomObject]@{
                                # Server Info
                                ServerName = $dhcpServer.Name
                                ServerIPAddress = $dhcpServer.IPAddress
                                
                                # Scope Identity
                                ScopeId = $scope.ScopeId
                                Name = $scope.Name
                                Description = $scope.Description
                                
                                # IP Range
                                StartRange = $scope.StartRange
                                EndRange = $scope.EndRange
                                SubnetMask = $scope.SubnetMask
                                
                                # Configuration
                                State = $scope.State
                                Type = $scope.Type
                                LeaseDuration = $scope.LeaseDuration
                                
                                # Statistics
                                AddressesInUse = $scope.AddressesInUse
                                AddressesFree = $scope.AddressesFree
                                PercentageInUse = $scope.PercentageInUse
                                
                                _DataType = "DHCPScope"
                            }
                            
                            $null = $allDiscoveredData.Add($scopeObj)
                        }
                    } catch {
                        Write-ModuleLog -ModuleName "DNSDHCP" -Message "Failed to get DHCP scopes from $($dhcpServer.Name): $($_.Exception.Message)" -Level "DEBUG"
                    }
                }
                
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovered $($dhcpScopes.Count) DHCP scopes" -Level "SUCCESS"
                
            } catch {
                $Result.AddWarning("Failed to discover DHCP scopes: $($_.Exception.Message)", @{Section="DHCPScopes"})
            }
        }
        
        # Export discovered data
        if ($allDiscoveredData.Count -gt 0) {
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Exporting $($allDiscoveredData.Count) DNS/DHCP records..." -Level "INFO"
            
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $fileName = switch ($group.Name) {
                    'DNSServer' { 'Network_DNSServers.csv' }
                    'DNSZone' { 'Network_DNSZones.csv' }
                    'DHCPServer' { 'Network_DHCPServers.csv' }
                    'DHCPScope' { 'Network_DHCPScopes.csv' }
                    default { "Network_$($group.Name).csv" }
                }
                
                Export-DiscoveryResults -Data $group.Group `
                    -FileName $fileName `
                    -OutputPath $Context.Paths.RawDataOutput `
                    -ModuleName "DNSDHCP" `
                    -SessionId $SessionId
            }
            
            # Create summary report
            $summaryData = @{
                DNSServers = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DNSServer' }).Count
                DNSZones = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DNSZone' }).Count
                DHCPServers = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DHCPServer' }).Count
                DHCPScopes = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DHCPScope' }).Count
                ResponsiveDNSServers = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DNSServer' -and $_.Status -eq 'Responsive' }).Count
                AccessibleDHCPServers = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DHCPServer' -and $_.Status -eq 'Accessible' }).Count
                TotalRecords = $allDiscoveredData.Count
                DiscoveryDate = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                SessionId = $SessionId
            }
            
            $summaryData | ConvertTo-Json -Depth 3 | Out-File (Join-Path $Context.Paths.RawDataOutput "DNSDHCPDiscoverySummary.json") -Encoding UTF8
        }
        
        return $allDiscoveredData
    }
    
    # Execute using base module
    return Start-DiscoveryModule -ModuleName "DNSDHCP" `
        -Configuration $Configuration `
        -Context $Context `
        -SessionId $SessionId `
        -RequiredServices @() `
        -DiscoveryScript $discoveryScript
}

Export-ModuleMember -Function Invoke-DNSDHCPDiscovery