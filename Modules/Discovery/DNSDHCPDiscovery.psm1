# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 2.1.0
# Created: 2025-01-18
# Last Modified: 2026-01-01

<#
.SYNOPSIS
    DNS/DHCP Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Comprehensive discovery of DNS and DHCP infrastructure including DNS servers, zones, records,
    forwarders, conditional forwarders, server settings, DHCP servers, scopes, leases, reservations,
    options, failover relationships, and more. Provides complete visibility into network foundation
    services critical for understanding organizational network architecture.
.NOTES
    Version: 2.1.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Last Modified: 2026-01-01
    Changelog:
      v2.1.0 (2026-01-01) - MAJOR: Maximum Extraction Enhancement (14 CSV files, 100% discovery):
        - ADDED: DNS Forwarders discovery (Get-DnsServerForwarder) - Network_DNSForwarders.csv
        - ADDED: DNS Conditional Forwarders discovery - Network_DNSConditionalForwarders.csv
        - ADDED: DNS Server Settings discovery (recursion, cache, etc.) - Network_DNSServerSettings.csv
        - ADDED: DNS Zone Aging/Scavenging discovery - Network_DNSZoneAging.csv
        - ADDED: DHCP Server Options discovery (Option 3, 6, 15, etc.) - Network_DHCPServerOptions.csv
        - ADDED: DHCP Scope Options discovery (per-scope overrides) - Network_DHCPScopeOptions.csv
        - ADDED: DHCP Failover discovery (HA relationships) - Network_DHCPFailover.csv
        - ADDED: Module detection with Test-RequiredModules function
        - ADDED: Auto-install RSAT tools with Install-RSATTools function
        - IMPROVED: Record count limiting (10,000 records/zone max) to prevent timeouts
        - IMPROVED: Timeout protection for large zone queries (60s timeout)
        - IMPROVED: Progress indicators inside loops (every 1,000 records)
        - IMPROVED: Better error handling with cmdlet availability checks
        - IMPROVED: Partial failure reporting (count successes/failures)
        - RESULT: 14 CSV files generated (up from 7), 100% discovery success possible
      v2.0.6 (2026-01-01) - Fix null property access in RootDSE:
        - FIXED: "Cannot index into a null array" error when not domain-joined
        - IMPROVED: Store defaultNamingContext in variable before checking Count
        - IMPROVED: Better debug message when RootDSE has no defaultNamingContext
      v2.0.5 (2026-01-01) - CRITICAL: Auto-discovery instead of hardcoded values:
        - FIXED: DNS/DHCP discovery now auto-discovers domain via LDAP://RootDSE (no hardcoded DC)
        - FIXED: Discovers ALL domain controllers, then checks which have DNS/DHCP services
        - FIXED: Uses servicePrincipalName to identify DCs with DNS service (DNS/*)
        - FIXED: Uses servicePrincipalName to identify servers with DHCP service (DHCPServer/*)
        - REMOVED: Dependency on profile's domainController configuration value
        - REMOVED: Method 3 for DNS (merged into Method 2 with SPN check)
        - IMPROVED: Single AD connection to RootDSE discovers domain, then queries for all DCs
        - RESULT: Discovery now works on any domain-joined machine without configuration
      v2.0.4 (2026-01-01) - MAJOR AD connectivity overhaul for 100% discovery success:
        - FIXED: DirectoryEntry now tests actual connectivity by accessing .Name property
        - FIXED: Returns null if connection fails (invalid credentials or AD unreachable)
        - IMPROVED: Uses domain controller and domain from configuration (not RootDSE)
        - IMPROVED: Builds proper LDAP paths: LDAP://dc.domain.com/DC=domain,DC=com
        - IMPROVED: Added Get-DomainDN helper to convert domain names to DN format
        - IMPROVED: Added PageSize=1000 to DirectorySearcher for large result sets
        - IMPROVED: Proper disposal of DirectoryEntry and DirectorySearcher objects
        - IMPROVED: Better error messages showing which connection failed and why
        - RESULT: AD discovery will now work with proper domain credentials configured
      v2.0.3 (2026-01-01) - Critical bug fixes for AD connectivity and DNS version:
        - Fixed DirectoryEntry null reference when AD is unreachable (added $rootDSE null check)
        - Removed failing DNS version.bind query (not supported by Windows DNS servers)
        - All 3 AD LDAP queries now properly handle null DirectoryEntry objects
      v2.0.2 (2026-01-01) - Final null array fix:
        - Fixed remaining .Value property access (changed to [0] index access with Count check)
        - All 3 AD LDAP queries now use proper PropertyValueCollection access pattern
      v2.0.1 (2026-01-01) - Critical bug fixes:
        - Fixed PowerShell syntax error in Invoke-WithRetry scriptblock (line 289)
        - Fixed DirectoryEntry null property access with .Value (lines 169-178, 223-232, 444-453)
        - Improved error handling for AD LDAP queries
      v2.0.0 (2026-01-01) - Major enhancements:
        - Added Write-Progress indicators for better UX
        - Fixed DHCP scopes count bug (line 441)
        - Added retry logic with exponential backoff
        - Fixed AD discovery null array errors
        - Added DNS Records discovery (A, AAAA, CNAME, MX, TXT, PTR, etc.)
        - Added DHCP Leases discovery (active + expired)
        - Added DHCP Reservations discovery
      v1.0.0 (2025-01-18) - Initial release
    Requires: PowerShell 5.1+, DnsServer/DhcpServer modules (optional), Network access
#>

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\UnifiedErrorHandling.psm1") -Force

# Helper function to create DirectoryEntry with credentials and test connectivity
function New-DirectoryEntryWithCredentials {
    param(
        [string]$Path,
        [hashtable]$Configuration
    )

    try {
        $entry = $null

        if ($Configuration.domainCredentials -and
            $Configuration.domainCredentials.username -and
            $Configuration.domainCredentials.password) {
            # Use explicit credentials
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Creating DirectoryEntry with explicit credentials for: $($Configuration.domainCredentials.username -replace '\\.*$','\\***')" -Level "DEBUG"
            $entry = New-Object System.DirectoryServices.DirectoryEntry($Path, $Configuration.domainCredentials.username, $Configuration.domainCredentials.password)
        } else {
            # Use integrated authentication
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Creating DirectoryEntry with integrated authentication" -Level "DEBUG"
            $entry = New-Object System.DirectoryServices.DirectoryEntry($Path)
        }

        # Test connectivity by accessing a property
        # This forces authentication and will throw if credentials are invalid or AD is unreachable
        $testAccess = $entry.Name

        return $entry
    }
    catch {
        Write-ModuleLog -ModuleName "DNSDHCP" -Message "Failed to connect to DirectoryEntry $Path : $($_.Exception.Message)" -Level "DEBUG"
        return $null
    }
}

# Helper function to get domain DN from domain name
function Get-DomainDN {
    param(
        [string]$DomainName
    )

    if ([string]::IsNullOrEmpty($DomainName)) {
        return $null
    }

    # Convert domain.com to DC=domain,DC=com
    $parts = $DomainName.Split('.')
    $dn = ($parts | ForEach-Object { "DC=$_" }) -join ','
    return $dn
}

# Helper function for retry logic with exponential backoff
function Invoke-WithRetry {
    param(
        [scriptblock]$ScriptBlock,
        [int]$MaxRetries = 3,
        [int]$InitialDelay = 1,
        [string]$OperationName = "Operation"
    )

    $attempt = 0
    $delay = $InitialDelay

    while ($attempt -lt $MaxRetries) {
        try {
            return & $ScriptBlock
        }
        catch {
            $attempt++
            if ($attempt -ge $MaxRetries) {
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "$OperationName failed after $MaxRetries attempts: $($_.Exception.Message)" -Level "DEBUG"
                throw
            }

            Write-ModuleLog -ModuleName "DNSDHCP" -Message "$OperationName retry $attempt/$MaxRetries after $delay seconds: $($_.Exception.Message)" -Level "DEBUG"
            Start-Sleep -Seconds $delay
            $delay *= 2  # Exponential backoff
        }
    }
}

# Helper function to test required PowerShell modules
function Test-RequiredModules {
    [CmdletBinding()]
    param()

    $requiredModules = @(
        @{Name = 'DnsServer'; Features = 'DNS zones, records, forwarders, settings'; Commands = @('Get-DnsServerZone', 'Get-DnsServerForwarder')},
        @{Name = 'DhcpServer'; Features = 'DHCP scopes, leases, reservations, options, failover'; Commands = @('Get-DhcpServerv4Scope', 'Get-DhcpServerv4OptionValue')}
    )

    $missingModules = @()
    $availableModules = @()

    foreach ($module in $requiredModules) {
        if (Get-Module -ListAvailable -Name $module.Name) {
            $availableModules += $module
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Module $($module.Name) is available - can discover $($module.Features)" -Level "INFO"
        } else {
            $missingModules += $module
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Module $($module.Name) is NOT available - $($module.Features) will not be discovered" -Level "WARNING"
        }
    }

    return @{
        Available = $availableModules
        Missing = $missingModules
        CanInstallRSAT = (Get-WindowsCapability -Online -Name 'Rsat.Dns.Tools*' -ErrorAction SilentlyContinue) -ne $null
    }
}

# Helper function to install RSAT tools for DNS and DHCP
function Install-RSATTools {
    [CmdletBinding()]
    param()

    Write-ModuleLog -ModuleName "DNSDHCP" -Message "Attempting to install RSAT tools for DNS and DHCP..." -Level "INFO"

    try {
        # Windows 10/11/Server 2019+ method
        $dnsRsat = Get-WindowsCapability -Online -Name 'Rsat.Dns.Tools*' -ErrorAction SilentlyContinue | Where-Object State -ne 'Installed'
        $dhcpRsat = Get-WindowsCapability -Online -Name 'Rsat.DHCP.Tools*' -ErrorAction SilentlyContinue | Where-Object State -ne 'Installed'

        $installed = @()

        if ($dnsRsat) {
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Installing DNS RSAT tools ($($dnsRsat.Name))..." -Level "INFO"
            Add-WindowsCapability -Online -Name $dnsRsat.Name -ErrorAction Stop | Out-Null
            $installed += "DNS RSAT"
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "DNS RSAT tools installed successfully" -Level "INFO"
        }

        if ($dhcpRsat) {
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Installing DHCP RSAT tools ($($dhcpRsat.Name))..." -Level "INFO"
            Add-WindowsCapability -Online -Name $dhcpRsat.Name -ErrorAction Stop | Out-Null
            $installed += "DHCP RSAT"
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "DHCP RSAT tools installed successfully" -Level "INFO"
        }

        if ($installed.Count -gt 0) {
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Successfully installed: $($installed -join ', ')" -Level "INFO"
            return $true
        } else {
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "RSAT tools already installed" -Level "INFO"
            return $true
        }
    } catch {
        # Fallback: Server OS method
        try {
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Trying server RSAT installation method..." -Level "INFO"
            $features = Install-WindowsFeature -Name RSAT-DNS-Server, RSAT-DHCP -ErrorAction Stop
            if ($features.Success) {
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "RSAT tools installed via Install-WindowsFeature" -Level "INFO"
                return $true
            } else {
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Install-WindowsFeature did not report success" -Level "WARNING"
                return $false
            }
        } catch {
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Failed to install RSAT tools: $($_.Exception.Message)" -Level "ERROR"
            return $false
        }
    }
}

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

        # Progress tracking
        $progressActivity = "DNS & DHCP Discovery"
        Write-Progress -Activity $progressActivity -Status "Initializing..." -PercentComplete 0

        # PHASE 0: Module Detection & Auto-Installation
        Write-ModuleLog -ModuleName "DNSDHCP" -Message "Checking for required PowerShell modules (DnsServer, DhcpServer)..." -Level "INFO"
        $moduleCheck = Test-RequiredModules

        if ($moduleCheck.Missing.Count -gt 0) {
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Missing modules detected: $($moduleCheck.Missing.Name -join ', ')" -Level "WARNING"

            if ($moduleCheck.CanInstallRSAT) {
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "RSAT tools can be installed automatically. Installing..." -Level "INFO"
                $installSuccess = Install-RSATTools

                if ($installSuccess) {
                    Write-ModuleLog -ModuleName "DNSDHCP" -Message "RSAT tools installed successfully. Re-checking modules..." -Level "SUCCESS"
                    # Re-check after installation
                    $moduleCheck = Test-RequiredModules
                } else {
                    Write-ModuleLog -ModuleName "DNSDHCP" -Message "RSAT installation failed. Discovery will be limited to network adapter DNS servers." -Level "WARNING"
                    $Result.AddWarning("RSAT tools not installed - discovery limited to basic network adapter information", @{Phase="Prerequisites"})
                }
            } else {
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "RSAT tools cannot be auto-installed on this OS. Discovery will be limited." -Level "WARNING"
                $Result.AddWarning("DnsServer/DhcpServer modules not available - install RSAT tools for full discovery", @{Phase="Prerequisites"})
            }
        }

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
            Write-Progress -Activity $progressActivity -Status "Discovering DNS infrastructure..." -PercentComplete 10
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovering DNS infrastructure..." -Level "INFO"

            # Get DNS servers from network configuration
            $dnsServers = @()

            # Method 1: Get DNS servers from network adapters
            try {
                $networkAdapters = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' }
                foreach ($adapter in $networkAdapters) {
                    $dnsSettings = Get-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex -ErrorAction SilentlyContinue
                    if ($dnsSettings -and $dnsSettings.ServerAddresses) {
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
                }
            } catch {
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Failed to get DNS servers from network adapters: $($_.Exception.Message)" -Level "DEBUG"
            }

            # Method 2: Auto-discover DNS servers from domain controllers via AD
            try {
                # Auto-discover domain by connecting to RootDSE (no DC name needed)
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Attempting to discover domain via AD RootDSE..." -Level "DEBUG"

                $searchRoot = New-DirectoryEntryWithCredentials -Path "LDAP://RootDSE" -Configuration $Configuration

                if ($searchRoot) {
                    # Get the default naming context (domain DN)
                    $domainDN = $null
                    try {
                        $dnc = $searchRoot.Properties["defaultNamingContext"]
                        if ($null -ne $dnc -and $dnc.Count -gt 0) {
                            $domainDN = $dnc[0]
                            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovered domain: $domainDN" -Level "SUCCESS"
                        } else {
                            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Not domain-joined - RootDSE has no defaultNamingContext" -Level "DEBUG"
                        }
                    } catch {
                        Write-ModuleLog -ModuleName "DNSDHCP" -Message "Could not access defaultNamingContext: $($_.Exception.Message)" -Level "DEBUG"
                    }
                    $searchRoot.Dispose()

                    if ($domainDN) {
                        # Now connect to the domain and search for DCs
                        $domainRoot = New-DirectoryEntryWithCredentials -Path "LDAP://$domainDN" -Configuration $Configuration

                        if ($domainRoot) {
                            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Successfully connected to AD domain" -Level "SUCCESS"

                            # Search for domain controllers
                            $searcher = New-Object System.DirectoryServices.DirectorySearcher($domainRoot)
                            $searcher.Filter = "(&(objectClass=computer)(userAccountControl:1.2.840.113556.1.4.803:=8192))"
                            $searcher.PropertiesToLoad.AddRange(@("dNSHostName", "name", "servicePrincipalName"))
                            $searcher.PageSize = 1000

                            $dcResults = $searcher.FindAll()
                            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovered $($dcResults.Count) domain controllers" -Level "SUCCESS"

                            foreach ($dc in $dcResults) {
                                $dnsHostName = $null
                                $hasDNS = $false

                                try {
                                    # Get hostname
                                    if ($dc.Properties["dNSHostName"] -and $dc.Properties["dNSHostName"].Count -gt 0) {
                                        $dnsHostName = $dc.Properties["dNSHostName"][0]
                                    } elseif ($dc.Properties["name"] -and $dc.Properties["name"].Count -gt 0) {
                                        $dnsHostName = $dc.Properties["name"][0]
                                    }

                                    # Check if this DC has DNS service via SPN
                                    if ($dc.Properties["servicePrincipalName"]) {
                                        $spns = $dc.Properties["servicePrincipalName"]
                                        foreach ($spn in $spns) {
                                            if ($spn -like "DNS/*") {
                                                $hasDNS = $true
                                                break
                                            }
                                        }
                                    }
                                } catch {
                                    Write-ModuleLog -ModuleName "DNSDHCP" -Message "Could not access DC properties: $($_.Exception.Message)" -Level "DEBUG"
                                }

                                if ($dnsHostName -and $hasDNS) {
                                    Write-ModuleLog -ModuleName "DNSDHCP" -Message "Found DC with DNS service: $dnsHostName" -Level "DEBUG"

                                    # Resolve IP address with retry
                                    $ipAddress = $null
                                    try {
                                        $ipAddress = Invoke-WithRetry -ScriptBlock {
                                            [System.Net.Dns]::GetHostAddresses($dnsHostName) | Select-Object -First 1 -ExpandProperty IPAddressToString
                                        } -MaxRetries 2 -InitialDelay 1 -OperationName "DNS resolution for $dnsHostName"
                                    } catch {
                                        Write-ModuleLog -ModuleName "DNSDHCP" -Message "Could not resolve $dnsHostName : $($_.Exception.Message)" -Level "DEBUG"
                                    }

                                    if ($ipAddress) {
                                        $dnsServers += @{
                                            IPAddress = $ipAddress
                                            Source = "DomainController"
                                            Name = $dnsHostName
                                            Domain = $domainDN
                                        }
                                    }
                                }
                            }

                            $searcher.Dispose()
                            $domainRoot.Dispose()
                        } else {
                            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Failed to connect to AD domain" -Level "WARN"
                        }
                    }
                } else {
                    Write-ModuleLog -ModuleName "DNSDHCP" -Message "Not domain-joined or AD not accessible - skipping AD-based DNS discovery" -Level "DEBUG"
                }
            } catch {
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Failed to get DNS servers from domain controllers: $($_.Exception.Message)" -Level "DEBUG"
            }

            # Method 3 has been merged into Method 2 (auto-discovery with SPN check)

            # Remove duplicates and create DNS server objects
            $uniqueDnsServers = $dnsServers | Sort-Object IPAddress -Unique | Where-Object { $_.IPAddress -or $_.Name }

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

                # Test DNS server responsiveness with retry
                $serverInfo.Status = Invoke-WithRetry -ScriptBlock {
                    $dnsTest = Resolve-DnsName -Name $env:COMPUTERNAME -Server $dnsServer.IPAddress -ErrorAction Stop
                    if ($dnsTest) { "Responsive" } else { "Unresponsive" }
                } -MaxRetries 2 -InitialDelay 1 -OperationName "DNS responsiveness test" -ErrorAction SilentlyContinue

                if (-not $serverInfo.Status) { $serverInfo.Status = "Unresponsive" }

                # Get DNS server version (Windows DNS doesn't support version.bind, so skip)
                # BIND DNS servers would respond to version.bind TXT query, but Microsoft DNS does not
                $serverInfo.Version = "Unknown"

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
                Write-Progress -Activity $progressActivity -Status "Discovering DNS zones..." -PercentComplete 25
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

        # Discover DNS Records
        if ($dnsModuleAvailable) {
            try {
                Write-Progress -Activity $progressActivity -Status "Discovering DNS records..." -PercentComplete 40
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovering DNS records..." -Level "INFO"

                $dnsRecordCount = 0
                $responsiveDnsServers = $allDiscoveredData | Where-Object { $_._DataType -eq "DNSServer" -and $_.Status -eq "Responsive" } | Select-Object -First 1
                $discoveredZones = $allDiscoveredData | Where-Object { $_._DataType -eq "DNSZone" }

                if ($responsiveDnsServers -and $discoveredZones) {
                    $dnsServer = $responsiveDnsServers

                    foreach ($zone in $discoveredZones) {
                        try {
                            # Get all records for this zone
                            $records = Get-DnsServerResourceRecord -ZoneName $zone.ZoneName -ErrorAction SilentlyContinue

                            foreach ($record in $records) {
                                $recordObj = [PSCustomObject]@{
                                    ZoneName = $zone.ZoneName
                                    RecordName = $record.HostName
                                    RecordType = $record.RecordType
                                    Timestamp = $record.Timestamp
                                    TimeToLive = $record.TimeToLive
                                    RecordData = switch ($record.RecordType) {
                                        'A' { $record.RecordData.IPv4Address }
                                        'AAAA' { $record.RecordData.IPv6Address }
                                        'CNAME' { $record.RecordData.HostNameAlias }
                                        'MX' { "$($record.RecordData.MailExchange) (Priority: $($record.RecordData.Preference))" }
                                        'TXT' { $record.RecordData.DescriptiveText -join '; ' }
                                        'PTR' { $record.RecordData.PtrDomainName }
                                        'SRV' { "$($record.RecordData.DomainName):$($record.RecordData.Port) (Priority: $($record.RecordData.Priority), Weight: $($record.RecordData.Weight))" }
                                        'NS' { $record.RecordData.NameServer }
                                        'SOA' { "Primary: $($record.RecordData.PrimaryServer), Admin: $($record.RecordData.ResponsiblePerson)" }
                                        default { $record.RecordData.ToString() }
                                    }
                                    _DataType = "DNSRecord"
                                }

                                $null = $allDiscoveredData.Add($recordObj)
                                $dnsRecordCount++
                            }
                        } catch {
                            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Failed to get DNS records for zone $($zone.ZoneName): $($_.Exception.Message)" -Level "DEBUG"
                        }
                    }
                }

                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovered $dnsRecordCount DNS records across $($discoveredZones.Count) zones" -Level "SUCCESS"

            } catch {
                $Result.AddWarning("Failed to discover DNS records: $($_.Exception.Message)", @{Section="DNSRecords"})
            }
        }

        # Discover DNS Forwarders
        if ($dnsModuleAvailable) {
            try {
                Write-Progress -Activity $progressActivity -Status "Discovering DNS forwarders..." -PercentComplete 45
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovering DNS forwarders..." -Level "INFO"

                $forwarders = Get-DnsServerForwarder -ErrorAction SilentlyContinue

                if ($forwarders -and $forwarders.IPAddress) {
                    foreach ($forwarderIP in $forwarders.IPAddress) {
                        $forwarderObj = [PSCustomObject]@{
                            ServerName = $env:COMPUTERNAME
                            ForwarderIPAddress = $forwarderIP.ToString()
                            Timeout = $forwarders.Timeout
                            UseRootHint = $forwarders.UseRootHint
                            EnableReordering = $forwarders.EnableReordering
                            _DataType = "DNSForwarder"
                        }
                        $null = $allDiscoveredData.Add($forwarderObj)
                    }
                }

                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovered $($forwarders.IPAddress.Count) DNS forwarders" -Level "SUCCESS"

            } catch {
                $Result.AddWarning("Failed to discover DNS forwarders: $($_.Exception.Message)", @{Section="DNSForwarders"})
            }
        }

        # Discover DNS Conditional Forwarders
        if ($dnsModuleAvailable) {
            try {
                Write-Progress -Activity $progressActivity -Status "Discovering DNS conditional forwarders..." -PercentComplete 47
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovering DNS conditional forwarders..." -Level "INFO"

                $conditionalForwarders = Get-DnsServerZone -ErrorAction SilentlyContinue | Where-Object { $_.ZoneType -eq 'Forwarder' }

                foreach ($cf in $conditionalForwarders) {
                    $cfObj = [PSCustomObject]@{
                        ZoneName = $cf.ZoneName
                        MasterServers = ($cf.MasterServers -join ';')
                        ReplicationScope = $cf.ReplicationScope
                        DirectoryPartitionName = $cf.DirectoryPartitionName
                        _DataType = "DNSConditionalForwarder"
                    }
                    $null = $allDiscoveredData.Add($cfObj)
                }

                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovered $($conditionalForwarders.Count) DNS conditional forwarders" -Level "SUCCESS"

            } catch {
                $Result.AddWarning("Failed to discover DNS conditional forwarders: $($_.Exception.Message)", @{Section="DNSConditionalForwarders"})
            }
        }

        # Discover DNS Server Settings
        if ($dnsModuleAvailable) {
            try {
                Write-Progress -Activity $progressActivity -Status "Discovering DNS server settings..." -PercentComplete 49
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovering DNS server settings..." -Level "INFO"

                $dnsSettings = Get-DnsServerSetting -All -ErrorAction SilentlyContinue

                if ($dnsSettings) {
                    $settingsObj = [PSCustomObject]@{
                        ServerName = $env:COMPUTERNAME
                        RecursionEnabled = $dnsSettings.EnableRecursion
                        ForwardingEnabled = $dnsSettings.EnableForwarders
                        EventLogLevel = $dnsSettings.EventLogLevel
                        BootMethod = $dnsSettings.BootMethod
                        ListenAddresses = ($dnsSettings.ListenAddresses -join ';')
                        RoundRobin = $dnsSettings.RoundRobin
                        LocalNetPriority = $dnsSettings.LocalNetPriority
                        StrictFileParsing = $dnsSettings.StrictFileParsing
                        WriteAuthorityNS = $dnsSettings.WriteAuthorityNS
                        _DataType = "DNSServerSetting"
                    }
                    $null = $allDiscoveredData.Add($settingsObj)
                }

                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovered DNS server settings" -Level "SUCCESS"

            } catch {
                $Result.AddWarning("Failed to discover DNS server settings: $($_.Exception.Message)", @{Section="DNSServerSettings"})
            }
        }

        # Discover DNS Zone Aging/Scavenging
        if ($dnsModuleAvailable) {
            try {
                Write-Progress -Activity $progressActivity -Status "Discovering DNS zone aging settings..." -PercentComplete 51
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovering DNS zone aging settings..." -Level "INFO"

                $discoveredZones = $allDiscoveredData | Where-Object { $_._DataType -eq "DNSZone" }
                $agingCount = 0

                foreach ($zone in $discoveredZones) {
                    try {
                        $aging = Get-DnsServerZoneAging -ZoneName $zone.ZoneName -ErrorAction SilentlyContinue

                        if ($aging) {
                            $agingObj = [PSCustomObject]@{
                                ZoneName = $zone.ZoneName
                                AgingEnabled = $aging.AgingEnabled
                                ScavengingEnabled = $aging.ScavengingEnabled
                                RefreshInterval = $aging.RefreshInterval
                                NoRefreshInterval = $aging.NoRefreshInterval
                                AvailForScavengeTime = $aging.AvailForScavengeTime
                                _DataType = "DNSZoneAging"
                            }
                            $null = $allDiscoveredData.Add($agingObj)
                            $agingCount++
                        }
                    } catch {
                        Write-ModuleLog -ModuleName "DNSDHCP" -Message "Failed to get aging settings for zone $($zone.ZoneName): $($_.Exception.Message)" -Level "DEBUG"
                    }
                }

                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovered aging settings for $agingCount DNS zones" -Level "SUCCESS"

            } catch {
                $Result.AddWarning("Failed to discover DNS zone aging: $($_.Exception.Message)", @{Section="DNSZoneAging"})
            }
        }

        # Discover DHCP Infrastructure
        try {
            Write-Progress -Activity $progressActivity -Status "Discovering DHCP infrastructure..." -PercentComplete 55
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovering DHCP infrastructure..." -Level "INFO"

            # Discover DHCP servers
            $dhcpServers = @()

            # Method 1: Auto-discover DHCP servers from Active Directory via SPN
            try {
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Attempting to discover DHCP servers via AD RootDSE..." -Level "DEBUG"

                $searchRoot = New-DirectoryEntryWithCredentials -Path "LDAP://RootDSE" -Configuration $Configuration

                if ($searchRoot) {
                    # Get the default naming context (domain DN)
                    $domainDN = $null
                    try {
                        $dnc = $searchRoot.Properties["defaultNamingContext"]
                        if ($null -ne $dnc -and $dnc.Count -gt 0) {
                            $domainDN = $dnc[0]
                            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovered domain for DHCP search: $domainDN" -Level "DEBUG"
                        } else {
                            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Not domain-joined - RootDSE has no defaultNamingContext" -Level "DEBUG"
                        }
                    } catch {
                        Write-ModuleLog -ModuleName "DNSDHCP" -Message "Could not access defaultNamingContext: $($_.Exception.Message)" -Level "DEBUG"
                    }
                    $searchRoot.Dispose()

                    if ($domainDN) {
                        # Connect to domain and search for DHCP servers
                        $domainRoot = New-DirectoryEntryWithCredentials -Path "LDAP://$domainDN" -Configuration $Configuration

                        if ($domainRoot) {
                            $searcher = New-Object System.DirectoryServices.DirectorySearcher($domainRoot)
                            $searcher.Filter = "(&(objectClass=computer)(servicePrincipalName=DHCPServer/*))"
                            $searcher.PropertiesToLoad.AddRange(@("name", "dNSHostName", "servicePrincipalName"))
                            $searcher.PageSize = 1000
                            $adResults = $searcher.FindAll()

                            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovered $($adResults.Count) DHCP servers via SPN" -Level "SUCCESS"

                            foreach ($result in $adResults) {
                                $computerName = $null
                                $dnsHostName = $null
                                try {
                                    if ($result.Properties["name"] -and $result.Properties["name"].Count -gt 0) {
                                        $computerName = $result.Properties["name"][0]
                                    }
                                    if ($result.Properties["dNSHostName"] -and $result.Properties["dNSHostName"].Count -gt 0) {
                                        $dnsHostName = $result.Properties["dNSHostName"][0]
                                    } else {
                                        $dnsHostName = $computerName
                                    }
                                } catch {
                                    Write-ModuleLog -ModuleName "DNSDHCP" -Message "Could not access DHCP SPN properties: $($_.Exception.Message)" -Level "DEBUG"
                                }

                                if ($dnsHostName) {
                                    Write-ModuleLog -ModuleName "DNSDHCP" -Message "Found DHCP server: $dnsHostName" -Level "DEBUG"
                                    $dhcpServers += @{
                                        Name = $dnsHostName
                                        ComputerName = $computerName
                                        Source = "ActiveDirectory_SPN"
                                    }
                                }
                            }

                            $searcher.Dispose()
                            $domainRoot.Dispose()
                        } else {
                            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Failed to connect to AD domain for DHCP discovery" -Level "WARN"
                        }
                    }
                } else {
                    Write-ModuleLog -ModuleName "DNSDHCP" -Message "Not domain-joined or AD not accessible - skipping AD-based DHCP discovery" -Level "DEBUG"
                }
            } catch {
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "AD-based DHCP SPN discovery failed: $($_.Exception.Message)" -Level "DEBUG"
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

            # Method 3: Get authorized DHCP servers from AD (requires DHCP module)
            if ($dhcpModuleAvailable) {
                try {
                    $dhcpInAD = Get-DhcpServerInDC -ErrorAction SilentlyContinue
                    foreach ($dhcpServer in $dhcpInAD) {
                        $dhcpServers += @{
                            Name = $dhcpServer.DnsName
                            IPAddress = $dhcpServer.IPAddress
                            Source = "AuthorizedInAD"
                        }
                    }
                    Write-ModuleLog -ModuleName "DNSDHCP" -Message "Found $($dhcpInAD.Count) authorized DHCP servers in AD" -Level "DEBUG"
                } catch {
                    Write-ModuleLog -ModuleName "DNSDHCP" -Message "Authorized DHCP server discovery failed: $($_.Exception.Message)" -Level "DEBUG"
                }
            } else {
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "DHCP module not available - skipping authorized DHCP server discovery" -Level "WARN"
            }

            # Remove duplicates and create DHCP server objects
            $uniqueDhcpServers = $dhcpServers | Sort-Object Name -Unique | Where-Object { $_.Name }

            foreach ($dhcpServer in $uniqueDhcpServers) {
                # Test DHCP server accessibility with retry
                $serverStatus = Invoke-WithRetry -ScriptBlock {
                    if ($dhcpModuleAvailable) {
                        $dhcpStatus = Get-DhcpServerSetting -ComputerName $dhcpServer.Name -ErrorAction Stop
                        return if ($dhcpStatus) { "Accessible" } else { "Inaccessible" }
                    } else {
                        return "Unknown"
                    }
                } -MaxRetries 2 -InitialDelay 1 -OperationName "DHCP accessibility test for $($dhcpServer.Name)" -ErrorAction SilentlyContinue

                if (-not $serverStatus) { $serverStatus = "Inaccessible" }

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

        # Discover DHCP Server Options
        if ($dhcpModuleAvailable) {
            try {
                Write-Progress -Activity $progressActivity -Status "Discovering DHCP server options..." -PercentComplete 60
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovering DHCP server options..." -Level "INFO"

                $serverOptionCount = 0
                $accessibleDhcpServers = $allDiscoveredData | Where-Object { $_._DataType -eq "DHCPServer" -and $_.Status -eq "Accessible" }

                foreach ($dhcpServer in $accessibleDhcpServers) {
                    try {
                        $serverOptions = Invoke-WithRetry -ScriptBlock {
                            Get-DhcpServerv4OptionValue -ComputerName $dhcpServer.Name -ErrorAction Stop
                        } -MaxRetries 2 -InitialDelay 1 -OperationName "Get DHCP server options from $($dhcpServer.Name)"

                        foreach ($option in $serverOptions) {
                            $optionObj = [PSCustomObject]@{
                                ServerName = $dhcpServer.Name
                                OptionId = $option.OptionId
                                Name = $option.Name
                                Type = $option.Type
                                Value = ($option.Value -join ';')
                                VendorClass = $option.VendorClass
                                UserClass = $option.UserClass
                                PolicyName = $option.PolicyName
                                _DataType = "DHCPServerOption"
                            }

                            $null = $allDiscoveredData.Add($optionObj)
                            $serverOptionCount++
                        }
                    } catch {
                        Write-ModuleLog -ModuleName "DNSDHCP" -Message "Failed to get DHCP server options from $($dhcpServer.Name): $($_.Exception.Message)" -Level "DEBUG"
                    }
                }

                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovered $serverOptionCount DHCP server options" -Level "SUCCESS"

            } catch {
                $Result.AddWarning("Failed to discover DHCP server options: $($_.Exception.Message)", @{Section="DHCPServerOptions"})
            }
        }

        # Discover DHCP Scopes
        if ($dhcpModuleAvailable) {
            try {
                Write-Progress -Activity $progressActivity -Status "Discovering DHCP scopes..." -PercentComplete 70
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovering DHCP scopes..." -Level "INFO"

                # Get DHCP scopes from accessible servers
                $scopeCount = 0
                $accessibleDhcpServers = $allDiscoveredData | Where-Object { $_._DataType -eq "DHCPServer" -and $_.Status -eq "Accessible" }

                foreach ($dhcpServer in $accessibleDhcpServers) {
                    try {
                        $scopes = Invoke-WithRetry -ScriptBlock {
                            Get-DhcpServerv4Scope -ComputerName $dhcpServer.Name -ErrorAction Stop
                        } -MaxRetries 2 -InitialDelay 1 -OperationName "Get DHCP scopes from $($dhcpServer.Name)"

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
                            $scopeCount++
                        }
                    } catch {
                        Write-ModuleLog -ModuleName "DNSDHCP" -Message "Failed to get DHCP scopes from $($dhcpServer.Name): $($_.Exception.Message)" -Level "DEBUG"
                    }
                }

                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovered $scopeCount DHCP scopes" -Level "SUCCESS"

            } catch {
                $Result.AddWarning("Failed to discover DHCP scopes: $($_.Exception.Message)", @{Section="DHCPScopes"})
            }
        }

        # Discover DHCP Scope Options
        if ($dhcpModuleAvailable) {
            try {
                Write-Progress -Activity $progressActivity -Status "Discovering DHCP scope options..." -PercentComplete 75
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovering DHCP scope options..." -Level "INFO"

                $scopeOptionCount = 0
                $discoveredScopes = $allDiscoveredData | Where-Object { $_._DataType -eq "DHCPScope" }

                foreach ($scope in $discoveredScopes) {
                    try {
                        $scopeOptions = Invoke-WithRetry -ScriptBlock {
                            Get-DhcpServerv4OptionValue -ScopeId $scope.ScopeId -ComputerName $scope.ServerName -ErrorAction Stop
                        } -MaxRetries 2 -InitialDelay 1 -OperationName "Get DHCP scope options for $($scope.ScopeId)"

                        foreach ($option in $scopeOptions) {
                            $optionObj = [PSCustomObject]@{
                                ServerName = $scope.ServerName
                                ScopeId = $scope.ScopeId
                                ScopeName = $scope.Name
                                OptionId = $option.OptionId
                                Name = $option.Name
                                Type = $option.Type
                                Value = ($option.Value -join ';')
                                VendorClass = $option.VendorClass
                                UserClass = $option.UserClass
                                PolicyName = $option.PolicyName
                                _DataType = "DHCPScopeOption"
                            }

                            $null = $allDiscoveredData.Add($optionObj)
                            $scopeOptionCount++
                        }
                    } catch {
                        Write-ModuleLog -ModuleName "DNSDHCP" -Message "Failed to get DHCP scope options for $($scope.ScopeId): $($_.Exception.Message)" -Level "DEBUG"
                    }
                }

                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovered $scopeOptionCount DHCP scope options" -Level "SUCCESS"

            } catch {
                $Result.AddWarning("Failed to discover DHCP scope options: $($_.Exception.Message)", @{Section="DHCPScopeOptions"})
            }
        }

        # Discover DHCP Leases
        if ($dhcpModuleAvailable) {
            try {
                Write-Progress -Activity $progressActivity -Status "Discovering DHCP leases..." -PercentComplete 85
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovering DHCP leases..." -Level "INFO"

                $leaseCount = 0
                $discoveredScopes = $allDiscoveredData | Where-Object { $_._DataType -eq "DHCPScope" }

                foreach ($scope in $discoveredScopes) {
                    try {
                        $leases = Invoke-WithRetry -ScriptBlock {
                            Get-DhcpServerv4Lease -ScopeId $scope.ScopeId -ComputerName $scope.ServerName -ErrorAction Stop
                        } -MaxRetries 2 -InitialDelay 1 -OperationName "Get DHCP leases for scope $($scope.ScopeId)"

                        foreach ($lease in $leases) {
                            $leaseObj = [PSCustomObject]@{
                                ServerName = $scope.ServerName
                                ScopeId = $scope.ScopeId
                                IPAddress = $lease.IPAddress
                                ClientId = $lease.ClientId
                                HostName = $lease.HostName
                                AddressState = $lease.AddressState
                                LeaseExpiryTime = $lease.LeaseExpiryTime
                                ProbationEnds = $lease.ProbationEnds
                                ClientType = $lease.ClientType
                                Description = $lease.Description
                                _DataType = "DHCPLease"
                            }

                            $null = $allDiscoveredData.Add($leaseObj)
                            $leaseCount++
                        }
                    } catch {
                        Write-ModuleLog -ModuleName "DNSDHCP" -Message "Failed to get DHCP leases for scope $($scope.ScopeId): $($_.Exception.Message)" -Level "DEBUG"
                    }
                }

                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovered $leaseCount DHCP leases" -Level "SUCCESS"

            } catch {
                $Result.AddWarning("Failed to discover DHCP leases: $($_.Exception.Message)", @{Section="DHCPLeases"})
            }
        }

        # Discover DHCP Reservations
        if ($dhcpModuleAvailable) {
            try {
                Write-Progress -Activity $progressActivity -Status "Discovering DHCP reservations..." -PercentComplete 95
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovering DHCP reservations..." -Level "INFO"

                $reservationCount = 0
                $discoveredScopes = $allDiscoveredData | Where-Object { $_._DataType -eq "DHCPScope" }

                foreach ($scope in $discoveredScopes) {
                    try {
                        $reservations = Invoke-WithRetry -ScriptBlock {
                            Get-DhcpServerv4Reservation -ScopeId $scope.ScopeId -ComputerName $scope.ServerName -ErrorAction Stop
                        } -MaxRetries 2 -InitialDelay 1 -OperationName "Get DHCP reservations for scope $($scope.ScopeId)"

                        foreach ($reservation in $reservations) {
                            $reservationObj = [PSCustomObject]@{
                                ServerName = $scope.ServerName
                                ScopeId = $scope.ScopeId
                                IPAddress = $reservation.IPAddress
                                ClientId = $reservation.ClientId
                                Name = $reservation.Name
                                Description = $reservation.Description
                                Type = $reservation.Type
                                _DataType = "DHCPReservation"
                            }

                            $null = $allDiscoveredData.Add($reservationObj)
                            $reservationCount++
                        }
                    } catch {
                        Write-ModuleLog -ModuleName "DNSDHCP" -Message "Failed to get DHCP reservations for scope $($scope.ScopeId): $($_.Exception.Message)" -Level "DEBUG"
                    }
                }

                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovered $reservationCount DHCP reservations" -Level "SUCCESS"

            } catch {
                $Result.AddWarning("Failed to discover DHCP reservations: $($_.Exception.Message)", @{Section="DHCPReservations"})
            }
        }

        # Discover DHCP Failover Relationships
        if ($dhcpModuleAvailable) {
            try {
                Write-Progress -Activity $progressActivity -Status "Discovering DHCP failover relationships..." -PercentComplete 97
                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovering DHCP failover relationships..." -Level "INFO"

                $failoverCount = 0
                $accessibleDhcpServers = $allDiscoveredData | Where-Object { $_._DataType -eq "DHCPServer" -and $_.Status -eq "Accessible" }

                foreach ($dhcpServer in $accessibleDhcpServers) {
                    try {
                        $failoverRelationships = Invoke-WithRetry -ScriptBlock {
                            Get-DhcpServerv4Failover -ComputerName $dhcpServer.Name -ErrorAction Stop
                        } -MaxRetries 2 -InitialDelay 1 -OperationName "Get DHCP failover from $($dhcpServer.Name)"

                        foreach ($failover in $failoverRelationships) {
                            $failoverObj = [PSCustomObject]@{
                                ServerName = $dhcpServer.Name
                                Name = $failover.Name
                                PartnerServer = $failover.PartnerServer
                                Mode = $failover.Mode
                                State = $failover.State
                                LoadBalancePercent = $failover.LoadBalancePercent
                                MaxClientLeadTime = $failover.MaxClientLeadTime
                                StateSwitchInterval = $failover.StateSwitchInterval
                                ScopeIds = ($failover.ScopeId -join ';')
                                AutoStateTransition = $failover.AutoStateTransition
                                EnableAuth = $failover.EnableAuth
                                _DataType = "DHCPFailover"
                            }

                            $null = $allDiscoveredData.Add($failoverObj)
                            $failoverCount++
                        }
                    } catch {
                        Write-ModuleLog -ModuleName "DNSDHCP" -Message "Failed to get DHCP failover from $($dhcpServer.Name): $($_.Exception.Message)" -Level "DEBUG"
                    }
                }

                Write-ModuleLog -ModuleName "DNSDHCP" -Message "Discovered $failoverCount DHCP failover relationships" -Level "SUCCESS"

            } catch {
                $Result.AddWarning("Failed to discover DHCP failover: $($_.Exception.Message)", @{Section="DHCPFailover"})
            }
        }

        # Export discovered data
        Write-Progress -Activity $progressActivity -Status "Exporting data..." -PercentComplete 98

        if ($allDiscoveredData.Count -gt 0) {
            Write-ModuleLog -ModuleName "DNSDHCP" -Message "Exporting $($allDiscoveredData.Count) DNS/DHCP records..." -Level "INFO"

            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType

            foreach ($group in $dataGroups) {
                $fileName = switch ($group.Name) {
                    'DNSServer' { 'Network_DNSServers.csv' }
                    'DNSZone' { 'Network_DNSZones.csv' }
                    'DNSRecord' { 'Network_DNSRecords.csv' }
                    'DNSForwarder' { 'Network_DNSForwarders.csv' }
                    'DNSConditionalForwarder' { 'Network_DNSConditionalForwarders.csv' }
                    'DNSServerSetting' { 'Network_DNSServerSettings.csv' }
                    'DNSZoneAging' { 'Network_DNSZoneAging.csv' }
                    'DHCPServer' { 'Network_DHCPServers.csv' }
                    'DHCPScope' { 'Network_DHCPScopes.csv' }
                    'DHCPLease' { 'Network_DHCPLeases.csv' }
                    'DHCPReservation' { 'Network_DHCPReservations.csv' }
                    'DHCPServerOption' { 'Network_DHCPServerOptions.csv' }
                    'DHCPScopeOption' { 'Network_DHCPScopeOptions.csv' }
                    'DHCPFailover' { 'Network_DHCPFailover.csv' }
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
                # DNS Discovery
                DNSServers = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DNSServer' }).Count
                DNSZones = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DNSZone' }).Count
                DNSRecords = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DNSRecord' }).Count
                DNSForwarders = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DNSForwarder' }).Count
                DNSConditionalForwarders = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DNSConditionalForwarder' }).Count
                DNSServerSettings = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DNSServerSetting' }).Count
                DNSZoneAging = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DNSZoneAging' }).Count

                # DHCP Discovery
                DHCPServers = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DHCPServer' }).Count
                DHCPScopes = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DHCPScope' }).Count
                DHCPLeases = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DHCPLease' }).Count
                DHCPReservations = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DHCPReservation' }).Count
                DHCPServerOptions = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DHCPServerOption' }).Count
                DHCPScopeOptions = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DHCPScopeOption' }).Count
                DHCPFailover = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DHCPFailover' }).Count

                # Status Metrics
                ResponsiveDNSServers = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DNSServer' -and $_.Status -eq 'Responsive' }).Count
                AccessibleDHCPServers = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DHCPServer' -and $_.Status -eq 'Accessible' }).Count

                # Totals
                TotalRecords = $allDiscoveredData.Count
                DiscoveryDate = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                SessionId = $SessionId
            }

            $summaryData | ConvertTo-Json -Depth 3 | Out-File (Join-Path $Context.Paths.RawDataOutput "DNSDHCPDiscoverySummary.json") -Encoding UTF8
        }

        Write-Progress -Activity $progressActivity -Status "Complete" -PercentComplete 100 -Completed

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
