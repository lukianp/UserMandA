# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Master Orchestrator
# Version: 2.0.0
# Created: 2025-08-30
# Last Modified: 2025-12-29

<#
.SYNOPSIS
    Comprehensive Infrastructure discovery module with nmap integration and diagnostic capabilities for M&A Discovery Suite
.DESCRIPTION
    Advanced network infrastructure discovery using nmap and PowerShell to systematically scan subnets,
    identify live hosts, enumerate services, detect operating systems, and collect detailed hardware/software
    inventory. This module provides comprehensive network topology mapping, vulnerability detection,
    asset inventory capabilities, and diagnostic tools for troubleshooting discovery issues.
.NOTES
    Version: 2.0.0
    Author: Master Orchestrator
    Created: 2025-08-30
    Requires: PowerShell 5.1+, nmap (auto-downloaded if not found), Network access
#>

# Fallback logging function if Write-MandALog is not available
if (-not (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
    function Write-MandALog {
        param(
            [string]$Message,
            [string]$Level = "INFO",
            [string]$Component = "Infrastructure",
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

function Write-InfrastructureLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context = @{}
    )
    Write-MandALog -Message $Message -Level $Level -Component "Infrastructure" -Context $Context
}

function Get-AuthInfoFromConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    $authInfo = @{
        UseCurrentUser = $true
        Credential = $null
        Server = $null
    }

    if ($Configuration.ContainsKey("Credential") -and $Configuration.Credential) {
        $authInfo.UseCurrentUser = $false
        $authInfo.Credential = $Configuration.Credential
    }

    if ($Configuration.ContainsKey("Server") -and $Configuration.Server) {
        $authInfo.Server = $Configuration.Server
    }

    return $authInfo
}

function Get-ProductionSafeNmapConfig {
    [CmdletBinding()]
    param(
        [hashtable]$Context = @{}
    )

    return @{
        # Rate limiting for production safety
        DelayBetweenHosts = 1000        # 1 second minimum delay
        MaxPacketsPerSecond = 10        # Conservative rate limit
        TimingTemplate = "T2"           # Polite timing template
        ConcurrentScans = 1             # Serial scanning only

        # Scan limitations
        MaxSubnetSize = 24              # Limit to /24 subnets (254 IPs max)
        ScanTimeoutSeconds = 300        # 5-minute timeout per subnet

        # Safety gates
        RequireProductionApproval = $true

        # Blacklisted ports (skip potentially disruptive services)
        BlacklistPorts = @(23, 135, 445, 1433, 1521, 3306, 5432)

        # Safe port scanning scope
        SafePortRange = @(21, 22, 25, 53, 80, 110, 143, 443, 993, 995, 3389, 5985, 5986)
    }
}

function Test-ProductionEnvironment {
    [CmdletBinding()]
    param(
        [hashtable]$Context = @{}
    )

    Write-InfrastructureLog -Level "INFO" -Message "?? Detecting environment type..." -Context $Context

    $productionSignals = @()

    # Check for domain controllers (port 88 - Kerberos)
    try {
        $dcFound = Get-NetTCPConnection -LocalPort 88 -ErrorAction SilentlyContinue
        if ($dcFound) {
            $productionSignals += "Domain Controller Detected"
        }
    } catch { }

    # Check for Exchange servers (port 25 SMTP)
    try {
        $exchangeFound = Test-NetConnection -ComputerName "localhost" -Port 25 -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($exchangeFound) {
            $productionSignals += "Exchange Server Detected"
        }
    } catch { }

    # Check for SQL Server (port 1433)
    try {
        $sqlFound = Test-NetConnection -ComputerName "localhost" -Port 1433 -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($sqlFound) {
            $productionSignals += "SQL Server Detected"
        }
    } catch { }

    # Check domain membership
    try {
        $computerInfo = Get-ComputerInfo -Property CsDomain, CsDomainRole -ErrorAction SilentlyContinue
        if ($computerInfo.CsDomainRole -in @("DomainController", "Server") -and $computerInfo.CsDomain -ne "WORKGROUP") {
            $productionSignals += "Domain-joined Server"
        }
    } catch { }

    $isProduction = $productionSignals.Count -gt 0

    if ($isProduction) {
        Write-InfrastructureLog -Level "WARN" -Message "?? Production environment detected: $($productionSignals -join ', ')" -Context $Context
    } else {
        Write-InfrastructureLog -Level "SUCCESS" -Message "? Non-production environment detected" -Context $Context
    }

    return @{
        IsProduction = $isProduction
        Signals = $productionSignals
    }
}

function Invoke-DiagnosticNetworkScan {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Target,
        [string]$NmapPath,
        [hashtable]$Context = @{}
    )

    Write-InfrastructureLog -Level "HEADER" -Message "?? Running Network Diagnostics" -Context $Context

    $diagnosticResults = @{
        ConnectivityTests = @()
        AlternativeScans = @()
        Recommendations = @()
        IssuesDetected = @()
    }

    # Test 1: Basic connectivity and routing
    Write-InfrastructureLog -Level "INFO" -Message "?? Testing basic network connectivity..." -Context $Context
    try {
        $testResult = Test-NetConnection -ComputerName "8.8.8.8" -Port 53 -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        if ($testResult) {
            $diagnosticResults.ConnectivityTests += @{ Test = "Internet Connectivity"; Result = "PASS"; Details = "Can reach Google DNS (8.8.8.8:53)" }
            Write-InfrastructureLog -Level "SUCCESS" -Message "? Internet connectivity confirmed" -Context $Context
        } else {
            $diagnosticResults.ConnectivityTests += @{ Test = "Internet Connectivity"; Result = "FAIL"; Details = "Cannot reach external DNS server" }
            $diagnosticResults.IssuesDetected += "Limited or no internet connectivity"
            Write-InfrastructureLog -Level "WARN" -Message "?? Internet connectivity test failed" -Context $Context
        }
    } catch {
        $diagnosticResults.ConnectivityTests += @{ Test = "Internet Connectivity"; Result = "ERROR"; Details = $_.Exception.Message }
        Write-InfrastructureLog -Level "ERROR" -Message "? Connectivity test error: $($_.Exception.Message)" -Context $Context
    }

    # Test 2: Local network connectivity
    Write-InfrastructureLog -Level "INFO" -Message "?? Testing local network connectivity..." -Context $Context
    try {
        $localTest = Test-NetConnection -ComputerName "127.0.0.1" -Port 135 -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        if ($localTest) {
            $diagnosticResults.ConnectivityTests += @{ Test = "Local Network"; Result = "PASS"; Details = "Local RPC service accessible" }
        } else {
            $diagnosticResults.ConnectivityTests += @{ Test = "Local Network"; Result = "FAIL"; Details = "Cannot connect to local services" }
            $diagnosticResults.IssuesDetected += "Local network issues detected"
        }
    } catch {
        $diagnosticResults.ConnectivityTests += @{ Test = "Local Network"; Result = "ERROR"; Details = $_.Exception.Message }
    }

    # Test 3: Parse target subnet and test gateway reachability
    if ($Target -match '^(.+)/(\d+)$') {
        $networkAddr = $matches[1]
        $prefixLength = [int]$matches[2]

        # Calculate potential gateway IPs (common patterns)
        $gatewayIPs = @()
        $octets = $networkAddr -split '\.'
        if ($octets.Count -eq 4) {
            # .1, .254, .100, .200 are common gateway addresses
            $gatewayIPs = @(
                "$($octets[0]).$($octets[1]).$($octets[2]).1",
                "$($octets[0]).$($octets[1]).$($octets[2]).254",
                "$($octets[0]).$($octets[1]).$($octets[2]).100",
                "$($octets[0]).$($octets[1]).$($octets[2]).200"
            )
        }

        foreach ($gatewayIP in $gatewayIPs) {
            try {
                $gatewayTest = Test-NetConnection -ComputerName $gatewayIP -Port 80 -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
                if ($gatewayTest) {
                    $diagnosticResults.ConnectivityTests += @{ Test = "Gateway Reachability ($gatewayIP)"; Result = "PASS"; Details = "Potential gateway responds on port 80" }
                    break
                }
            } catch {
                # Continue testing other gateways
            }
        }

        if ($diagnosticResults.ConnectivityTests | Where-Object { $_.Test -match "Gateway" -and $_.Result -eq "PASS" }) {
            Write-InfrastructureLog -Level "SUCCESS" -Message "? Gateway connectivity confirmed" -Context $Context
        } else {
            $diagnosticResults.IssuesDetected += "No gateway response in target subnet"
            Write-InfrastructureLog -Level "WARN" -Message "?? No gateway response detected in subnet" -Context $Context
        }
    }

    # Test 4: Alternative scanning techniques if nmap available
    if ($NmapPath -and (Test-Path $NmapPath)) {
        Write-InfrastructureLog -Level "INFO" -Message "?? Running alternative nmap scans..." -Context $Context

        # ARP scan (layer 2 discovery)
        try {
            Write-InfrastructureLog -Level "DEBUG" -Message "?? Attempting ARP scan..." -Context $Context
            $arpOutput = & $NmapPath -sn -PR $Target --max-retries 1 --host-timeout 10s 2>$null
            $arpHosts = ($arpOutput | Select-String -Pattern "(\d+\.\d+\.\d+\.\d+)" -AllMatches).Matches | ForEach-Object { $_.Value } | Sort-Object -Unique
            if ($arpHosts.Count -gt 0) {
                $diagnosticResults.AlternativeScans += @{ Method = "ARP Scan"; HostsFound = $arpHosts.Count; Details = "Found hosts: $($arpHosts -join ', ')" }
                Write-InfrastructureLog -Level "SUCCESS" -Message "? ARP scan found $($arpHosts.Count) hosts" -Context $Context
            } else {
                $diagnosticResults.AlternativeScans += @{ Method = "ARP Scan"; HostsFound = 0; Details = "No hosts found via ARP" }
            }
        } catch {
            Write-InfrastructureLog -Level "DEBUG" -Message "ARP scan failed: $($_.Exception.Message)" -Context $Context
        }

        # Aggressive ping scan
        try {
            Write-InfrastructureLog -Level "DEBUG" -Message "?? Attempting aggressive ping scan..." -Context $Context
            $pingOutput = & $NmapPath -sn -PE -PP -PM -PO $Target --max-retries 2 --host-timeout 15s 2>$null
            $pingHosts = ($pingOutput | Select-String -Pattern "(\d+\.\d+\.\d+\.\d+)" -AllMatches).Matches | ForEach-Object { $_.Value } | Sort-Object -Unique
            if ($pingHosts.Count -gt 0) {
                $diagnosticResults.AlternativeScans += @{ Method = "Aggressive Ping"; HostsFound = $pingHosts.Count; Details = "Found hosts: $($pingHosts -join ', ')" }
                Write-InfrastructureLog -Level "SUCCESS" -Message "? Aggressive ping found $($pingHosts.Count) hosts" -Context $Context
            } else {
                $diagnosticResults.AlternativeScans += @{ Method = "Aggressive Ping"; HostsFound = 0; Details = "No hosts found via aggressive ping" }
            }
        } catch {
            Write-InfrastructureLog -Level "DEBUG" -Message "Aggressive ping scan failed: $($_.Exception.Message)" -Context $Context
        }
    }

    # Generate recommendations based on findings
    Write-InfrastructureLog -Level "INFO" -Message "?? Analyzing diagnostic results..." -Context $Context

    if ($diagnosticResults.IssuesDetected -contains "Limited or no internet connectivity") {
        $diagnosticResults.Recommendations += "Check network connectivity and firewall settings"
    }

    if ($diagnosticResults.IssuesDetected -contains "No gateway response in target subnet") {
        $diagnosticResults.Recommendations += "Verify subnet configuration and routing"
        $diagnosticResults.Recommendations += "Consider manually specifying target subnets"
    }

    if (($diagnosticResults.AlternativeScans | Where-Object { $_.HostsFound -gt 0 }).Count -eq 0) {
        $diagnosticResults.Recommendations += "Try different scanning parameters or manual subnet entry"
        $diagnosticResults.Recommendations += "Check if target network requires VPN connection"
        $diagnosticResults.Recommendations += "Verify firewall rules allow scanning traffic"
    }

    # Always provide manual subnet option
    $diagnosticResults.Recommendations += "Use manual subnet entry to specify known network ranges"

    Write-InfrastructureLog -Level "SUCCESS" -Message "? Network diagnostics completed" -Context $Context

    return $diagnosticResults
}

# Export diagnostic function
Export-ModuleMember -Function Invoke-DiagnosticNetworkScan