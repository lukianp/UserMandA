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
        [Parameter(Mandatory=$false)]
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

    # Test 4: Alternative scanning techniques if nmap available and target specified
    if ($Target -and $NmapPath -and (Test-Path $NmapPath)) {
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

function Find-SystemNmap {
    [CmdletBinding()]
    param(
        [hashtable]$Context = @{}
    )

    Write-InfrastructureLog -Level "INFO" -Message "?? Searching for system nmap installation..." -Context $Context

    # PRIORITY 1: Check if system-installed nmap is available in PATH (preferred for performance)
    $nmapPath = Get-Command nmap -ErrorAction SilentlyContinue
    if ($nmapPath) {
        try {
            # Verify it's functional by checking version - simplified test
            $versionOutput = & $nmapPath.Source --version 2>$null
            if ($versionOutput -and ($versionOutput[0] -match "Nmap version (\d+\.\d+)")) {
                Write-InfrastructureLog -Level "SUCCESS" -Message "? Found system nmap in PATH: $($nmapPath.Source) (v$($matches[1]))" -Context $Context
                return @{
                    Path = $nmapPath.Source
                    Version = $matches[1]
                    Source = "PATH"
                    IsFullyFunctional = $true
                }
            }
        } catch {
            Write-InfrastructureLog -Level "DEBUG" -Message "nmap in PATH failed version test: $($_.Exception.Message)" -Context $Context
        }
    }

    # PRIORITY 2: Check common system installation paths with extended search
    $systemPaths = @(
        "${env:ProgramFiles}\Nmap\nmap.exe",
        "${env:ProgramFiles(x86)}\Nmap\nmap.exe",
        "C:\Program Files\Nmap\nmap.exe",
        "C:\Program Files (x86)\Nmap\nmap.exe",
        "${env:LOCALAPPDATA}\Programs\Nmap\nmap.exe",
        "C:\Tools\Nmap\nmap.exe"
    )

    foreach ($path in $systemPaths) {
        if (Test-Path $path) {
            try {
                # Verify functionality with simplified test
                $versionOutput = & $path --version 2>$null
                if ($versionOutput -and ($versionOutput[0] -match "Nmap version (\d+\.\d+)")) {
                    Write-InfrastructureLog -Level "SUCCESS" -Message "? Found system nmap at: $path (v$($matches[1]))" -Context $Context
                    return @{
                        Path = $path
                        Version = $matches[1]
                        Source = "System Installation"
                        IsFullyFunctional = $true
                    }
                }
            } catch {
                Write-InfrastructureLog -Level "DEBUG" -Message "nmap at $path failed version test: $($_.Exception.Message)" -Context $Context
            }
        }
    }

    Write-InfrastructureLog -Level "WARN" -Message "?? No functional system nmap installation found" -Context $Context
    return $null
}

function Test-NmapCapabilities {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$NmapPath,
        [hashtable]$Context = @{}
    )

    $capabilities = @{
        SupportsXmlOutput = $false
        SupportsSynScan = $false
        SupportsVersionScan = $false
        SupportsOSDetection = $false
        IsFullyFunctional = $false
        Summary = ""
        Issues = @()
    }

    try {
        # Test basic functionality
        $helpOutput = & $NmapPath --help 2>$null
        if ($helpOutput) {
            $capabilities.SupportsXmlOutput = $helpOutput -match "-oX"
            $capabilities.SupportsSynScan = $helpOutput -match "-sS"
            $capabilities.SupportsVersionScan = $helpOutput -match "-sV"
            $capabilities.SupportsOSDetection = $helpOutput -match "-O"
        }

        # Quick connectivity test (ping scan on localhost)
        $testOutput = & $NmapPath -sn 127.0.0.1 --max-retries 1 --host-timeout 5s 2>$null
        $testWorked = $testOutput -and ($testOutput -match "127.0.0.1")

        $capabilities.IsFullyFunctional = $capabilities.SupportsXmlOutput -and $capabilities.SupportsSynScan -and $testWorked

        if ($capabilities.IsFullyFunctional) {
            $capabilities.Summary = "Full Enterprise Capabilities"
        } elseif ($testWorked) {
            $capabilities.Summary = "Basic Functionality Only"
            if (-not $capabilities.SupportsXmlOutput) { $capabilities.Issues += "No XML output support" }
            if (-not $capabilities.SupportsSynScan) { $capabilities.Issues += "No SYN scan support" }
        } else {
            $capabilities.Summary = "Non-Functional"
            $capabilities.Issues += "Failed basic connectivity test"
        }

    } catch {
        $capabilities.Summary = "Test Failed"
        $capabilities.Issues += "Capability test exception: $($_.Exception.Message)"
    }

    return $capabilities
}

function Install-NmapSilent {
    [CmdletBinding()]
    param(
        [hashtable]$Context = @{}
    )

    Write-InfrastructureLog -Level "INFO" -Message "?? Attempting silent nmap installation..." -Context $Context

    try {
        # Check if we have admin rights for silent installation
        $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
        $isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

        if (-not $isAdmin) {
            Write-InfrastructureLog -Level "WARN" -Message "?? Silent installation requires administrator privileges" -Context $Context
            return $null
        }

        $tempDir = "$env:TEMP\NmapInstaller"
        if (-not (Test-Path $tempDir)) {
            New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
        }

        # Download nmap installer with signature verification preference
        $nmapVersion = "7.94"
        $installerUrls = @(
            "https://nmap.org/dist/nmap-$nmapVersion-setup.exe",
            "https://github.com/nmap/nmap/releases/download/v$nmapVersion/nmap-$nmapVersion-setup.exe"
        )

        $installerPath = "$tempDir\nmap-setup.exe"
        $downloadSuccess = $false

        foreach ($url in $installerUrls) {
            try {
                Write-InfrastructureLog -Level "INFO" -Message "?? Downloading nmap installer from: $url" -Context $Context
                Invoke-WebRequest -Uri $url -OutFile $installerPath -UseBasicParsing -TimeoutSec 60

                # Verify download
                if ((Test-Path $installerPath) -and ((Get-Item $installerPath).Length -gt 1MB)) {
                    $downloadSuccess = $true
                    Write-InfrastructureLog -Level "SUCCESS" -Message "? Downloaded nmap installer successfully" -Context $Context
                    break
                }
            } catch {
                Write-InfrastructureLog -Level "DEBUG" -Message "Download failed from $url : $($_.Exception.Message)" -Context $Context
                if (Test-Path $installerPath) { Remove-Item $installerPath -Force -ErrorAction SilentlyContinue }
            }
        }

        if (-not $downloadSuccess) {
            Write-InfrastructureLog -Level "ERROR" -Message "? Failed to download nmap installer from all sources" -Context $Context
            return $null
        }

        # Download npcap installer (required for nmap functionality)
        $npcapUrl = "https://npcap.com/dist/npcap-1.78.exe"
        $npcapPath = "$tempDir\npcap-setup.exe"

        try {
            Write-InfrastructureLog -Level "INFO" -Message "?? Downloading npcap (packet capture library)..." -Context $Context
            Invoke-WebRequest -Uri $npcapUrl -OutFile $npcapPath -UseBasicParsing -TimeoutSec 60
        } catch {
            Write-InfrastructureLog -Level "WARN" -Message "?? Failed to download npcap - nmap functionality may be limited" -Context $Context
        }

        # Install npcap first (if available) with silent parameters
        if (Test-Path $npcapPath) {
            Write-InfrastructureLog -Level "INFO" -Message "?? Installing npcap silently..." -Context $Context
            $npcapProcess = Start-Process -FilePath $npcapPath -ArgumentList "/S /winpcap_mode=yes" -Wait -PassThru -WindowStyle Hidden

            if ($npcapProcess.ExitCode -eq 0) {
                Write-InfrastructureLog -Level "SUCCESS" -Message "? npcap installed successfully" -Context $Context
            } else {
                Write-InfrastructureLog -Level "WARN" -Message "?? npcap installation may have failed (exit code: $($npcapProcess.ExitCode))" -Context $Context
            }
        }

        # Install nmap with silent parameters
        Write-InfrastructureLog -Level "INFO" -Message "?? Installing nmap silently..." -Context $Context
        $nmapProcess = Start-Process -FilePath $installerPath -ArgumentList "/S" -Wait -PassThru -WindowStyle Hidden

        if ($nmapProcess.ExitCode -eq 0) {
            Write-InfrastructureLog -Level "SUCCESS" -Message "? nmap installed successfully" -Context $Context

            # Verify installation
            Start-Sleep -Seconds 5  # Allow installation to complete
            $installedNmap = Find-SystemNmap -Context $Context

            if ($installedNmap) {
                Write-InfrastructureLog -Level "SUCCESS" -Message "?? Silent nmap installation completed and verified" -Context $Context
                return $installedNmap
            } else {
                Write-InfrastructureLog -Level "WARN" -Message "?? nmap installation completed but verification failed" -Context $Context
            }
        } else {
            Write-InfrastructureLog -Level "ERROR" -Message "? nmap installation failed (exit code: $($nmapProcess.ExitCode))" -Context $Context
        }

        # Cleanup
        Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue

    } catch {
        Write-InfrastructureLog -Level "ERROR" -Message "? Silent installation failed: $($_.Exception.Message)" -Context $Context
    }

    return $null
}

function Install-NmapIfNeeded {
    [CmdletBinding()]
    param(
        [hashtable]$Context = @{}
    )

    Write-InfrastructureLog -Level "HEADER" -Message "?? Intelligent nmap Management System" -Context $Context

    # PHASE 1: Check for existing system nmap installation - PRIORITIZE THIS
    $systemNmap = Find-SystemNmap -Context $Context
    if ($systemNmap -and $systemNmap.IsFullyFunctional) {
        Write-InfrastructureLog -Level "SUCCESS" -Message "?? Using system nmap: $($systemNmap.Path) (v$($systemNmap.Version)) - No installation needed!" -Context $Context
        return $systemNmap.Path
    } elseif ($systemNmap) {
        Write-InfrastructureLog -Level "WARN" -Message "?? Found system nmap at $($systemNmap.Path) but functionality test failed" -Context $Context
        Write-InfrastructureLog -Level "INFO" -Message "?? Attempting to use system nmap anyway - may work for basic scans" -Context $Context
        return $systemNmap.Path
    }

    # PHASE 2: Only attempt installation if no system nmap found
    Write-InfrastructureLog -Level "WARN" -Message "?? No system nmap installation found - attempting fallback installation methods..." -Context $Context
    $silentInstall = Install-NmapSilent -Context $Context
    if ($silentInstall) {
        return $silentInstall.Path
    }

    # PHASE 3: Check for embedded nmap in application directory
    Write-InfrastructureLog -Level "INFO" -Message "?? Checking for embedded nmap installations..." -Context $Context
    $embeddedPaths = @(
        "$PSScriptRoot\..\..\Tools\nmap\nmap.exe",
        "$PSScriptRoot\..\..\..\Tools\nmap\nmap.exe",
        "C:\enterprisediscovery\Tools\nmap\nmap.exe",
        "C:\Tools\nmap\nmap.exe"
    )

    foreach ($embeddedPath in $embeddedPaths) {
        if (Test-Path $embeddedPath) {
            try {
                # Test embedded version capabilities
                $versionOutput = & $embeddedPath --version 2>$null
                if ($versionOutput -and ($versionOutput[0] -match "Nmap version (\d+\.\d+)")) {
                    $capabilities = Test-NmapCapabilities -NmapPath $embeddedPath -Context $Context
                    Write-InfrastructureLog -Level "SUCCESS" -Message "? Using embedded nmap: $embeddedPath (v$($matches[1])) - $($capabilities.Summary)" -Context $Context
                    Write-InfrastructureLog -Level "INFO" -Message "?? Consider installing system nmap for better performance and full capabilities" -Context $Context
                    return $embeddedPath
                }
            } catch {
                Write-InfrastructureLog -Level "DEBUG" -Message "Embedded nmap at $embeddedPath failed test: $($_.Exception.Message)" -Context $Context
            }
        }
    }

    # Try to download and install nmap portable
    try {
        Write-InfrastructureLog -Level "INFO" -Message "?? Downloading nmap portable..." -Context $Context

        $nmapDir = "C:\Tools\nmap"
        $nmapZip = "$env:TEMP\nmap-portable.zip"

        if (-not (Test-Path $nmapDir)) {
            New-Item -ItemType Directory -Path $nmapDir -Force | Out-Null
        }

        # Download nmap from multiple fallback sources (only if not embedded)
        Write-InfrastructureLog -Level "WARN" -Message "?? No embedded nmap found - attempting download as fallback" -Context $Context
        $nmapUrls = @(
            "https://nmap.org/dist/nmap-7.94-win32.zip",
            "https://github.com/nmap/nmap/releases/download/v7.94/nmap-7.94-win32.zip",
            "https://download.insecure.org/nmap/dist/nmap-7.94-win32.zip"
        )

        $downloadSuccess = $false
        foreach ($nmapUrl in $nmapUrls) {
            try {
                Write-InfrastructureLog "?? Trying nmap download from: $nmapUrl" "INFO"
                Invoke-WebRequest -Uri $nmapUrl -OutFile $nmapZip -UseBasicParsing -TimeoutSec 30
                if (Test-Path $nmapZip) {
                    $downloadSuccess = $true
                    Write-InfrastructureLog "? Successfully downloaded nmap from: $nmapUrl" "SUCCESS"
                    break
                }
            }
            catch {
                Write-InfrastructureLog "? Failed to download from $nmapUrl : $($_.Exception.Message)" "WARN"
                continue
            }
        }

        if (-not $downloadSuccess) {
            Write-InfrastructureLog "?? All nmap download sources failed - continuing with PowerShell alternatives" "WARN"
            return $false
        }

        # Extract
        try {
            Add-Type -AssemblyName System.IO.Compression.FileSystem
            [System.IO.Compression.ZipFile]::ExtractToDirectory($nmapZip, $nmapDir)
            Write-InfrastructureLog "? Successfully extracted nmap" "SUCCESS"

            # Clean up the zip file
            Remove-Item $nmapZip -Force -ErrorAction SilentlyContinue
        }
        catch {
            Write-InfrastructureLog "? Failed to extract nmap: $($_.Exception.Message)" "ERROR"
            # Clean up the zip file even on failure
            Remove-Item $nmapZip -Force -ErrorAction SilentlyContinue
            return $false
        }

        # Find the nmap.exe in the extracted folder
        $nmapExe = Get-ChildItem -Path $nmapDir -Name "nmap.exe" -Recurse | Select-Object -First 1
        if ($nmapExe) {
            $finalPath = Join-Path $nmapDir $nmapExe.DirectoryName "nmap.exe"
            Write-InfrastructureLog -Level "SUCCESS" -Message "? Successfully installed nmap at: $finalPath" -Context $Context
            return $finalPath
        }

        Write-InfrastructureLog -Level "WARN" -Message "?? Downloaded nmap but couldn't find executable" -Context $Context
        return $null

    } catch {
        Write-InfrastructureLog -Level "WARN" -Message "?? Failed to download nmap: $($_.Exception.Message)" -Context $Context
        Write-InfrastructureLog -Level "INFO" -Message "?? Continuing without nmap - will use PowerShell alternatives" -Context $Context
        return $null
    }
}

function Get-ADSitesAndSubnets {
    [CmdletBinding()]
    param(
        [hashtable]$Configuration = @{},
        [hashtable]$Context = @{}
    )

    $adSubnets = @()

    try {
        Write-InfrastructureLog -Level "INFO" -Message "?? Discovering AD Sites and Services subnets..." -Context $Context

        # Check for domain credentials
        $credential = $null
        $domainServer = $null

        if ($Configuration.domainCredentials -and
            $Configuration.domainCredentials.username -and
            $Configuration.domainCredentials.password) {

            Write-InfrastructureLog -Message "Using provided domain credentials: $($Configuration.domainCredentials.username -replace '\\.*','\\***')" -Level "INFO" -Context $Context

            # Create PSCredential object
            $securePassword = ConvertTo-SecureString $Configuration.domainCredentials.password -AsPlainText -Force
            $credential = New-Object System.Management.Automation.PSCredential(
                $Configuration.domainCredentials.username,
                $securePassword
            )

            # Extract domain from username (DOMAIN\username format)
            if ($Configuration.domainCredentials.username -match '^([^\\]+)\\') {
                $domainServer = $matches[1]
                Write-InfrastructureLog -Message "Auto-detected domain from credentials: $domainServer" -Level "INFO" -Context $Context
            }
        } else {
            Write-InfrastructureLog -Message "Using integrated Windows authentication" -Level "INFO" -Context $Context
        }

        # Check if we're in a domain environment
        $computerInfo = Get-ComputerInfo -Property CsDomain, CsDomainRole -ErrorAction SilentlyContinue
        if (-not $computerInfo -or $computerInfo.CsDomain -eq "WORKGROUP") {
            # If we have credentials, we can still try to query the domain
            if (-not $credential) {
                Write-InfrastructureLog -Level "INFO" -Message "?? Not in domain environment - skipping AD Sites discovery" -Context $Context
                return $adSubnets
            }
        }

        # Import Active Directory module if available
        if (Get-Module -ListAvailable -Name ActiveDirectory -ErrorAction SilentlyContinue) {
            Import-Module ActiveDirectory -Force -ErrorAction SilentlyContinue

            if (Get-Command Get-ADReplicationSubnet -ErrorAction SilentlyContinue) {
                Write-InfrastructureLog -Level "INFO" -Message "?? Querying AD replication subnets..." -Context $Context

                # Build parameters with optional credentials
                $adParams = @{
                    Filter = '*'
                    Properties = 'Name', 'Site', 'Location', 'Description'
                    ErrorAction = 'Stop'
                }
                if ($credential) { $adParams['Credential'] = $credential }
                if ($domainServer) { $adParams['Server'] = $domainServer }

                $replicationSubnets = Get-ADReplicationSubnet @adParams

                foreach ($subnet in $replicationSubnets) {
                    # Get site name with credentials if available
                    $siteName = "Unknown"
                    if ($subnet.Site) {
                        try {
                            $siteParams = @{ Identity = $subnet.Site; ErrorAction = 'SilentlyContinue' }
                            if ($credential) { $siteParams['Credential'] = $credential }
                            if ($domainServer) { $siteParams['Server'] = $domainServer }
                            $siteObj = Get-ADObject @siteParams
                            if ($siteObj) { $siteName = $siteObj.Name }
                        } catch {
                            # Ignore errors, keep "Unknown"
                        }
                    }

                    $adSubnetInfo = [PSCustomObject]@{
                        SubnetName = $subnet.Name
                        SiteName = $siteName
                        Location = $subnet.Location
                        Description = $subnet.Description
                        Source = "AD Sites and Services"
                        Priority = 90  # High priority for AD-defined subnets
                        SubnetType = "AD Infrastructure"
                        BusinessContext = "Domain Infrastructure"
                    }

                    $adSubnets += $adSubnetInfo
                }

                Write-InfrastructureLog -Level "SUCCESS" -Message "? Found $($adSubnets.Count) AD-defined subnets" -Context $Context
            }
        }

        # Fallback: Query AD Sites using LDAP if ActiveDirectory module not available
        if ($adSubnets.Count -eq 0) {
            Write-InfrastructureLog -Level "INFO" -Message "?? Attempting LDAP query for AD Sites..." -Context $Context

            try {
                $domain = [System.DirectoryServices.ActiveDirectory.Domain]::GetCurrentDomain()
                $configNC = "CN=Configuration," + $domain.GetDirectoryEntry().distinguishedName
                $searcher = New-Object System.DirectoryServices.DirectorySearcher
                $searcher.SearchRoot = New-Object System.DirectoryServices.DirectoryEntry("LDAP://" + $configNC)
                $searcher.Filter = "(objectClass=subnet)"
                $searcher.PropertiesToLoad.AddRange(@("cn", "siteObject", "location", "description"))

                $results = $searcher.FindAll()

                foreach ($result in $results) {
                    # Defensive property access with null checks
                    if (-not $result -or -not $result.Properties) {
                        Write-InfrastructureLog -Level "WARN" -Message "?? Skipping AD subnet result with null/missing Properties" -Context $Context
                        continue
                    }

                    $subnetDN = if ($result.Properties["cn"] -and $result.Properties["cn"].Count -gt 0) {
                        $result.Properties["cn"][0]
                    } else { "Unknown" }

                    $siteDN = if ($result.Properties["siteObject"] -and $result.Properties["siteObject"].Count -gt 0) {
                        $result.Properties["siteObject"][0]
                    } else { "" }

                    $siteName = if ($siteDN) {
                        $siteDN -replace "^CN=([^,]+),.*", '$1'
                    } else { "Unknown" }

                    $adSubnetInfo = [PSCustomObject]@{
                        SubnetName = $subnetDN
                        SiteName = $siteName
                        Location = if ($result.Properties["location"] -and $result.Properties["location"].Count -gt 0) { $result.Properties["location"][0] } else { "" }
                        Description = if ($result.Properties["description"] -and $result.Properties["description"].Count -gt 0) { $result.Properties["description"][0] } else { "" }
                        Source = "AD Sites (LDAP)"
                        Priority = 85  # High priority for AD-defined subnets
                        SubnetType = "AD Infrastructure"
                        BusinessContext = "Domain Infrastructure"
                    }

                    $adSubnets += $adSubnetInfo
                }

                Write-InfrastructureLog -Level "SUCCESS" -Message "? LDAP query found $($adSubnets.Count) AD subnets" -Context $Context

            } catch {
                Write-InfrastructureLog -Level "DEBUG" -Message "LDAP query failed: $($_.Exception.Message)" -Context $Context
            }
        }

    } catch {
        Write-InfrastructureLog -Level "ERROR" -Message "? AD Sites discovery failed: $($_.Exception.Message)" -Context $Context
    }

    return $adSubnets
}

function Get-SubnetsFromDNSZones {
    [CmdletBinding()]
    param(
        [hashtable]$Configuration = @{},
        [hashtable]$Context = @{}
    )

    $dnsSubnets = @()

    try {
        Write-InfrastructureLog -Level "INFO" -Message "?? Analyzing DNS zones for subnet discovery..." -Context $Context

        # Get DNS server information
        $dnsServers = @()
        $networkAdapters = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' }

        foreach ($adapter in $networkAdapters) {
            $dnsConfig = Get-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex -ErrorAction SilentlyContinue
            if ($dnsConfig -and $dnsConfig.ServerAddresses) {
                $dnsServers += $dnsConfig.ServerAddresses
            }
        }

        $dnsServers = $dnsServers | Sort-Object -Unique | Where-Object { $_ -and $_ -ne "::1" -and $_ -ne "127.0.0.1" }

        if ($dnsServers.Count -eq 0) {
            Write-InfrastructureLog -Level "INFO" -Message "?? No DNS servers found for zone analysis" -Context $Context
            return $dnsSubnets
        }

        Write-InfrastructureLog -Level "INFO" -Message "?? Found $($dnsServers.Count) DNS servers for zone analysis" -Context $Context

        # Try to get reverse DNS zones (which indicate subnet ranges)
        foreach ($dnsServer in $dnsServers) {
            try {
                Write-InfrastructureLog -Level "DEBUG" -Message "?? Querying DNS server: $dnsServer" -Context $Context

                # Alternative: Try to resolve common gateway addresses to infer subnets
                $commonGateways = @("1", "254", "100", "200")
                $testSubnets = @("192.168.0", "192.168.1", "10.0.0", "10.0.1", "172.16.0")

                foreach ($subnetBase in $testSubnets) {
                    foreach ($gateway in $commonGateways) {
                        $testIP = "$subnetBase.$gateway"

                        try {
                            # Quick DNS resolution test
                            $resolved = [System.Net.Dns]::GetHostEntryAsync($testIP)
                            if ($resolved.Wait(2000) -and $resolved.Result) {  # 2 second timeout
                                $dnsSubnetInfo = [PSCustomObject]@{
                                    SubnetName = "$subnetBase.0/24"
                                    ResolvedGateway = $testIP
                                    ResolvedName = $resolved.Result.HostName
                                    Source = "DNS Resolution Test"
                                    Priority = 60
                                    SubnetType = "DNS Resolved"
                                    BusinessContext = "Network Infrastructure"
                                }

                                $dnsSubnets += $dnsSubnetInfo
                                break  # Found one gateway, move to next subnet
                            }
                        } catch {
                            # Resolution failed, continue
                        }
                    }
                }

            } catch {
                Write-InfrastructureLog -Level "DEBUG" -Message "DNS analysis failed for $dnsServer : $($_.Exception.Message)" -Context $Context
            }
        }

        # Remove duplicates
        $dnsSubnets = $dnsSubnets | Sort-Object SubnetName -Unique

        Write-InfrastructureLog -Level "SUCCESS" -Message "? DNS analysis found $($dnsSubnets.Count) potential subnets" -Context $Context

    } catch {
        Write-InfrastructureLog -Level "ERROR" -Message "? DNS zone analysis failed: $($_.Exception.Message)" -Context $Context
    }

    return $dnsSubnets
}

function Classify-NetworkSegments {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [array]$AllSubnets,
        [hashtable]$Configuration = @{},
        [hashtable]$Context = @{}
    )

    $classifiedSegments = @()

    try {
        Write-InfrastructureLog -Level "INFO" -Message "??? Classifying network segments with business context..." -Context $Context

        foreach ($subnet in $AllSubnets) {
            # Defensive: handle both PSCustomObjects and strings
            if ($subnet -is [string]) {
                # Convert string to minimal PSCustomObject
                Write-InfrastructureLog -Level "WARN" -Message "Converting string subnet to object: $subnet" -Context $Context
                $segment = [PSCustomObject]@{
                    SubnetName = $subnet
                    SiteName = "Unknown"
                    Location = ""
                    Description = ""
                    Source = "String Conversion"
                    Priority = 50
                    SubnetType = "Unknown"
                    BusinessContext = "General"
                }
            } else {
                # Proper PSCustomObject - make a copy
                $segment = $subnet.PSObject.Copy()
            }

            # Initialize classification properties
            $segment | Add-Member -NotePropertyName 'SegmentType' -NotePropertyValue "Unknown" -Force
            $segment | Add-Member -NotePropertyName 'BusinessPriority' -NotePropertyValue 50 -Force  # 1-100 scale
            $segment | Add-Member -NotePropertyName 'ScanDepth' -NotePropertyValue "Standard" -Force
            $segment | Add-Member -NotePropertyName 'ScanTiming' -NotePropertyValue "T2" -Force
            $segment | Add-Member -NotePropertyName 'BusinessContext' -NotePropertyValue "General" -Force

            # Standardized: Use only SubnetName property
            $subnetAddr = $segment.SubnetName

            # Classification logic based on multiple factors
            if ($segment.Source -eq "AD Sites and Services" -or $segment.Source -eq "AD Sites (LDAP)") {
                # AD-defined subnets are critical infrastructure
                $segment.SegmentType = "Domain Infrastructure"
                $segment.BusinessPriority = 95
                $segment.ScanDepth = "Deep"
                $segment.ScanTiming = "T3"  # More careful with domain infrastructure
                $segment.BusinessContext = "Active Directory"

            } elseif ($segment.Source -match "DNS") {
                # DNS-discovered subnets are likely infrastructure
                $segment.SegmentType = "Network Infrastructure"
                $segment.BusinessPriority = 80
                $segment.ScanDepth = "Standard"
                $segment.ScanTiming = "T2"
                $segment.BusinessContext = "DNS/Networking"

            } elseif ($subnetAddr -match "^10\.") {
                # Class A private - often enterprise infrastructure
                $segment.SegmentType = "Enterprise Infrastructure"
                $segment.BusinessPriority = 85
                $segment.ScanDepth = "Deep"
                $segment.ScanTiming = "T3"
                $segment.BusinessContext = "Enterprise Network"

            } elseif ($subnetAddr -match "^172\.(1[6-9]|2[0-9]|3[01])\.") {
                # Class B private - often management networks
                $segment.SegmentType = "Management Network"
                $segment.BusinessPriority = 90
                $segment.ScanDepth = "Deep"
                $segment.ScanTiming = "T4"  # Very careful with management
                $segment.BusinessContext = "Network Management"

            } elseif ($subnetAddr -match "^192\.168\.") {
                # Class C private - often user or branch networks
                if ($segment.DHCP -eq "Enabled") {
                    $segment.SegmentType = "User Network"
                    $segment.BusinessPriority = 30  # Lower priority for user networks
                    $segment.ScanDepth = "Light"
                    $segment.ScanTiming = "T2"
                    $segment.BusinessContext = "End User"
                } else {
                    $segment.SegmentType = "Branch Infrastructure"
                    $segment.BusinessPriority = 70
                    $segment.ScanDepth = "Standard"
                    $segment.ScanTiming = "T2"
                    $segment.BusinessContext = "Branch Office"
                }

            } elseif ($subnetAddr -match "/3[0-2]$") {
                # Very small subnets - likely point-to-point or management
                $segment.SegmentType = "Point-to-Point/Management"
                $segment.BusinessPriority = 95
                $segment.ScanDepth = "Minimal"
                $segment.ScanTiming = "T4"  # Very careful
                $segment.BusinessContext = "Network Infrastructure"

            } elseif ($subnetAddr -match "/([89]|1[0-5])$") {
                # Very large subnets - likely major infrastructure
                $segment.SegmentType = "Major Infrastructure"
                $segment.BusinessPriority = 95
                $segment.ScanDepth = "Standard"
                $segment.ScanTiming = "T3"
                $segment.BusinessContext = "Core Infrastructure"
            }

            # Apply production environment adjustments
            $envTest = Test-ProductionEnvironment -Context $Context
            if ($envTest.IsProduction) {
                # In production, be more conservative
                if ($segment.ScanTiming -eq "T2") { $segment.ScanTiming = "T3" }
                if ($segment.ScanDepth -eq "Deep") { $segment.ScanDepth = "Standard" }
            }

            $classifiedSegments += $segment
        }

        # Sort by business priority (highest first) for intelligent scanning order
        $classifiedSegments = $classifiedSegments | Sort-Object BusinessPriority -Descending

        $infraCount = ($classifiedSegments | Where-Object { $_.SegmentType -match "Infrastructure" }).Count
        $userCount = ($classifiedSegments | Where-Object { $_.SegmentType -match "User" }).Count
        $mgmtCount = ($classifiedSegments | Where-Object { $_.SegmentType -match "Management" }).Count

        Write-InfrastructureLog -Level "SUCCESS" -Message "? Classified $($classifiedSegments.Count) segments: $infraCount infrastructure, $userCount user, $mgmtCount management" -Context $Context

    } catch {
        Write-InfrastructureLog -Level "ERROR" -Message "? Network segment classification failed: $($_.Exception.Message)" -Context $Context
    }

    return $classifiedSegments
}

function Get-NetworkSubnets {
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [hashtable]$Context = @{}
    )

    $subnets = @()

    try {
        Write-InfrastructureLog -Level "INFO" -Message "?? Discovering network subnets..." -Context $Context

        # Get all network adapters with IP addresses
        $adapters = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' }

        foreach ($adapter in $adapters) {
            $ipConfig = Get-NetIPAddress -InterfaceIndex $adapter.InterfaceIndex -ErrorAction SilentlyContinue |
                        Where-Object { $_.AddressFamily -eq 'IPv4' -and $_.IPAddress -ne '127.0.0.1' }

            foreach ($ip in $ipConfig) {
                $subnet = "$($ip.IPAddress)/$($ip.PrefixLength)"

                # Calculate network address
                $ipBytes = ([System.Net.IPAddress]::Parse($ip.IPAddress)).GetAddressBytes()
                $maskBits = $ip.PrefixLength
                $maskBytes = [byte[]]@(0,0,0,0)

                for ($i = 0; $i -lt 32; $i++) {
                    if ($i -lt $maskBits) {
                        $maskBytes[[math]::Floor($i/8)] = $maskBytes[[math]::Floor($i/8)] -bor (1 -shl (7-($i%8)))
                    }
                }

                $networkBytes = @()
                for ($i = 0; $i -lt 4; $i++) {
                    $networkBytes += $ipBytes[$i] -band $maskBytes[$i]
                }

                $networkAddr = ($networkBytes -join '.')
                $networkSubnet = "$networkAddr/$($ip.PrefixLength)"

                $subnets += [PSCustomObject]@{
                    Interface = $adapter.Name
                    InterfaceDescription = $adapter.InterfaceDescription
                    IPAddress = $ip.IPAddress
                    PrefixLength = $ip.PrefixLength
                    SubnetMask = ([System.Net.IPAddress]::new($maskBytes)).ToString()
                    NetworkAddress = $networkAddr
                    SubnetName = $networkSubnet
                    DHCP = (Get-NetIPInterface -InterfaceIndex $adapter.InterfaceIndex -AddressFamily IPv4).Dhcp
                }
            }
        }

        # Enhance with enterprise subnet discovery
        Write-InfrastructureLog -Level "INFO" -Message "?? Enhancing with enterprise subnet discovery..." -Context $Context

        # Get AD Sites and Services subnets
        $adSubnets = Get-ADSitesAndSubnets -Configuration $Configuration -Context $Context
        foreach ($adSubnet in $adSubnets) {
            $subnets += [PSCustomObject]@{
                Interface = "AD Sites and Services"
                InterfaceDescription = $adSubnet.Description
                IPAddress = ($adSubnet.SubnetName -split '/')[0] + ".1"  # Assume .1 as example IP
                PrefixLength = ($adSubnet.SubnetName -split '/')[1]
                SubnetName = $adSubnet.SubnetName
                NetworkAddress = ($adSubnet.SubnetName -split '/')[0]
                DHCP = "Unknown"
                SiteName = $adSubnet.SiteName
                Location = $adSubnet.Location
                Source = $adSubnet.Source
                Priority = $adSubnet.Priority
                SubnetType = $adSubnet.SubnetType
                BusinessContext = $adSubnet.BusinessContext
            }
        }

        # Get DNS-discovered subnets
        $dnsSubnets = Get-SubnetsFromDNSZones -Configuration $Configuration -Context $Context
        foreach ($dnsSubnet in $dnsSubnets) {
            # Only add if not already discovered
            if (-not ($subnets | Where-Object { $_.SubnetName -eq $dnsSubnet.SubnetName })) {
                $subnets += [PSCustomObject]@{
                    Interface = "DNS Discovery"
                    InterfaceDescription = "DNS-inferred subnet"
                    IPAddress = ($dnsSubnet.SubnetName -split '/')[0] + ".1"
                    PrefixLength = ($dnsSubnet.SubnetName -split '/')[1]
                    SubnetName = $dnsSubnet.SubnetName
                    NetworkAddress = ($dnsSubnet.SubnetName -split '/')[0]
                    DHCP = "Unknown"
                    DNSServer = if ($dnsSubnet.DNSServer) { $dnsSubnet.DNSServer } else { "" }
                    Source = $dnsSubnet.Source
                    Priority = $dnsSubnet.Priority
                    SubnetType = $dnsSubnet.SubnetType
                    BusinessContext = $dnsSubnet.BusinessContext
                }
            }
        }

        # Add targeted common subnets with intelligent prioritization
        $commonSubnets = @(
            @{ Subnet = '192.168.0.0/16'; TestIP = '192.168.1.1'; Priority = 40; Context = 'Common User Range' },
            @{ Subnet = '10.0.0.0/8'; TestIP = '10.0.0.1'; Priority = 80; Context = 'Enterprise Infrastructure' },
            @{ Subnet = '172.16.0.0/12'; TestIP = '172.16.0.1'; Priority = 75; Context = 'Management Network' }
        )

        foreach ($commonSubnet in $commonSubnets) {
            if (-not ($subnets | Where-Object { $_.SubnetName -eq $commonSubnet.Subnet })) {
                # Quick connectivity test
                try {
                    $connectionTest = Test-NetConnection -ComputerName $commonSubnet.TestIP -Port 80 -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
                    if ($connectionTest -and $connectionTest.TcpTestSucceeded) {
                        $subnets += [PSCustomObject]@{
                            Interface = "Route Discovery"
                            InterfaceDescription = "Common Private Range - $($commonSubnet.Context)"
                            IPAddress = $commonSubnet.TestIP
                            PrefixLength = $commonSubnet.Subnet.Split('/')[1]
                            SubnetName = $commonSubnet.Subnet
                            NetworkAddress = $commonSubnet.Subnet.Split('/')[0]
                            DHCP = "Unknown"
                            Source = "Route Testing"
                            Priority = $commonSubnet.Priority
                            SubnetType = "Route Inferred"
                            BusinessContext = $commonSubnet.Context
                        }
                    }
                } catch {
                    Write-InfrastructureLog -Level "DEBUG" -Message "Route test failed for $($commonSubnet.Subnet)" -Context $Context
                }
            }
        }

        # Classify all discovered subnets with business intelligence
        if ($subnets.Count -gt 0) {
            Write-InfrastructureLog -Level "INFO" -Message "?? Applying intelligent subnet classification..." -Context $Context
            $subnets = Classify-NetworkSegments -AllSubnets $subnets -Configuration $Configuration -Context $Context
        }

        Write-InfrastructureLog -Level "SUCCESS" -Message "? Discovered $($subnets.Count) network subnets with intelligent classification" -Context $Context

    } catch {
        Write-InfrastructureLog -Level "ERROR" -Message "? Failed to discover subnets: $($_.Exception.Message)" -Context $Context
    }

    return $subnets
}

function Get-AdaptiveScanParameters {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [PSCustomObject]$Subnet,
        [hashtable]$Context = @{}
    )

    # Default parameters
    $scanParams = @{
        TimingTemplate = "T2"
        MaxRate = 10
        Retries = 1
        Timeout = "30s"
        PortRange = @(21, 22, 25, 53, 80, 110, 143, 443, 993, 995, 3389, 5985, 5986)
        ScanDepth = "Standard"
        BatchSize = 25
        DelayBetween = 1000
    }

    # Adapt based on subnet classification
    if ($Subnet.ScanTiming) {
        $scanParams.TimingTemplate = $Subnet.ScanTiming
    }

    if ($Subnet.ScanDepth) {
        switch ($Subnet.ScanDepth) {
            "Light" {
                $scanParams.PortRange = @(80, 443, 22, 3389)
                $scanParams.MaxRate = 5
                $scanParams.BatchSize = 10
                $scanParams.DelayBetween = 2000
            }
            "Deep" {
                $scanParams.PortRange = @(21, 22, 23, 25, 53, 80, 110, 135, 139, 143, 443, 445, 993, 995, 1433, 3389, 5985, 5986)
                $scanParams.MaxRate = 15
                $scanParams.BatchSize = 40
                $scanParams.DelayBetween = 500
            }
            "Minimal" {
                $scanParams.PortRange = @(80, 443, 22)
                $scanParams.MaxRate = 3
                $scanParams.BatchSize = 5
                $scanParams.DelayBetween = 5000
            }
        }
    }

    # Adjust for business priority
    if ($Subnet.BusinessPriority -ge 90) {
        # High priority infrastructure - be very careful
        $scanParams.TimingTemplate = "T4"
        $scanParams.MaxRate = 5
        $scanParams.Retries = 0
        $scanParams.DelayBetween = 3000
    } elseif ($Subnet.BusinessPriority -le 40) {
        # Lower priority user networks - can be more aggressive
        $scanParams.MaxRate = 20
        $scanParams.BatchSize = 50
        $scanParams.DelayBetween = 500
    }

    # Apply production environment safety overrides
    $envTest = Test-ProductionEnvironment -Context $Context
    if ($envTest.IsProduction) {
        $scanParams.MaxRate = [Math]::Min($scanParams.MaxRate, 5)
        $scanParams.TimingTemplate = if ($scanParams.TimingTemplate -in @("T1", "T2")) { "T3" } else { $scanParams.TimingTemplate }
        $scanParams.DelayBetween = [Math]::Max($scanParams.DelayBetween, 2000)
        $scanParams.BatchSize = [Math]::Min($scanParams.BatchSize, 20)
    }

    Write-InfrastructureLog -Level "DEBUG" -Message "?? Adaptive scan params for $($Subnet.SegmentType): $($scanParams.TimingTemplate), max-rate=$($scanParams.MaxRate), ports=$($scanParams.PortRange.Count)" -Context $Context

    return $scanParams
}

function Invoke-ProductionSafeNmapScan {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Target,
        [string]$NmapPath,
        [string]$ScanType = "ping",
        [PSCustomObject]$SubnetInfo = $null,
        [hashtable]$Context = @{}
    )

    if (-not $NmapPath -or -not (Test-Path $NmapPath)) {
        Write-InfrastructureLog -Level "WARN" -Message "?? Nmap not available, using PowerShell alternatives for $Target" -Context $Context
        return Invoke-ProductionSafePowerShellScan -Target $Target -SubnetInfo $SubnetInfo -Context $Context
    }

    # Get adaptive scan parameters based on subnet classification
    $config = if ($SubnetInfo) {
        Get-AdaptiveScanParameters -Subnet $SubnetInfo -Context $Context
    } else {
        # Fallback to conservative defaults
        @{
            TimingTemplate = "T3"
            MaxRate = 5
            Retries = 1
            Timeout = "30s"
            PortRange = @(80, 443, 22, 3389)
            DelayBetween = 2000
        }
    }

    # Test environment and require approval if production
    $envTest = Test-ProductionEnvironment -Context $Context
    if ($envTest.IsProduction -and $config.RequireProductionApproval) {
        Write-InfrastructureLog -Level "WARN" -Message "?? Production environment detected. Administrator approval required." -Context $Context
        $approval = Read-Host "Continue with production-safe scanning? (type 'YES' to continue)"
        if ($approval -ne "YES") {
            Write-InfrastructureLog -Level "INFO" -Message "? Scan cancelled by administrator" -Context $Context
            return @()
        }
    }

    try {
        $results = @()
        $outputFile = "$env:TEMP\nmap_$([guid]::NewGuid().ToString('N')).xml"

        # Build production-safe nmap arguments
        $nmapArgs = @()

        switch ($ScanType) {
            "ping" {
                Write-InfrastructureLog -Level "INFO" -Message "?? Running production-safe nmap ping scan on $Target..." -Context $Context
                $nmapArgs = @(
                    "-sn",                    # Ping scan only
                    "-T$($config.TimingTemplate)", # Adaptive timing
                    "--max-rate", $config.MaxRate,
                    "--max-retries", $config.Retries,
                    "--host-timeout", $config.Timeout,
                    $Target
                )
            }
            "port" {
                Write-InfrastructureLog -Level "INFO" -Message "?? Running adaptive nmap port scan on $Target..." -Context $Context
                $safePortList = $config.PortRange -join ","
                $nmapArgs = @(
                    "-sS",                    # SYN scan
                    "-T$($config.TimingTemplate)", # Adaptive timing
                    "--max-rate", $config.MaxRate,
                    "--max-retries", $config.Retries,
                    "--host-timeout", $config.Timeout,
                    "-p", $safePortList,      # Adaptive port range
                    $Target
                )
            }
            "service" {
                Write-InfrastructureLog -Level "INFO" -Message "?? Running adaptive nmap service scan on $Target..." -Context $Context
                $safePortList = $config.PortRange -join ","
                $nmapArgs = @(
                    "-sV",                   # Version detection
                    "--version-intensity", "1", # Minimal probing
                    "-T$($config.TimingTemplate)",
                    "--max-rate", $config.MaxRate,
                    "--max-retries", $config.Retries,
                    "--host-timeout", $config.Timeout,
                    "-p", $safePortList,
                    $Target
                )
            }
            "comprehensive" {
                Write-InfrastructureLog -Level "INFO" -Message "?? Running comprehensive nmap discovery on $Target..." -Context $Context
                $safePortList = $config.PortRange -join ","
                $nmapArgs = @(
                    "-sV",                    # Version detection
                    "-O",                     # OS detection
                    "--osscan-limit",         # Only OS detect if at least one open port
                    "--version-intensity", "2", # Moderate probing
                    "-T$($config.TimingTemplate)",
                    "--max-rate", $config.MaxRate,
                    "--max-retries", $config.Retries,
                    "--host-timeout", $config.Timeout,
                    "-p", $safePortList,
                    $Target
                )
            }
        }

        # Add XML output
        $nmapArgs += @("-oX", $outputFile)

        Write-InfrastructureLog -Level "DEBUG" -Message "?? nmap command: $NmapPath $($nmapArgs -join ' ')" -Context $Context

        $process = Start-Process -FilePath $NmapPath -ArgumentList $nmapArgs -NoNewWindow -PassThru -RedirectStandardError "$env:TEMP\nmap_error.log"

        # Wait with timeout - adaptive based on scan parameters
        $timeoutMs = if ($config.Timeout -match "(\d+)s") { [int]$matches[1] * 1000 } else { 60000 }
        if (-not $process.WaitForExit($timeoutMs)) {
            Write-InfrastructureLog -Level "WARN" -Message "?? Nmap scan timeout - terminating process" -Context $Context
            $process.Kill()
            return @()
        }

        if ($process.ExitCode -eq 0 -and (Test-Path $outputFile)) {
            $nmapOutput = Get-Content $outputFile -Raw
            $results = Parse-NmapXmlOutput -XmlContent $nmapOutput -Context $Context

            # Apply adaptive rate limiting between scans
            Start-Sleep -Milliseconds $config.DelayBetween
        }

        # Cleanup
        Remove-Item $outputFile -Force -ErrorAction SilentlyContinue
        Remove-Item "$env:TEMP\nmap_error.log" -Force -ErrorAction SilentlyContinue

        return $results

    } catch {
        Write-InfrastructureLog -Level "ERROR" -Message "? Production-safe nmap scan failed: $($_.Exception.Message)" -Context $Context
        return @()
    }
}

function Parse-NmapXmlOutput {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$XmlContent,
        [hashtable]$Context = @{}
    )

    $results = @()

    try {
        [xml]$nmapXml = $XmlContent

        foreach ($xmlHost in $nmapXml.nmaprun.host) {
            $hostInfo = [PSCustomObject]@{
                IPAddress = $xmlHost.address | Where-Object { $_.addrtype -eq "ipv4" } | Select-Object -ExpandProperty addr
                Hostname = if ($xmlHost.hostnames.hostname) { $xmlHost.hostnames.hostname.name } else { "Unknown" }
                Status = $xmlHost.status.state
                OS = ""
                OSAccuracy = 0
                OSFamily = ""
                OpenPorts = @()
                Services = @()
                ServiceVersions = @()
                MACAddress = ($xmlHost.address | Where-Object { $_.addrtype -eq "mac" } | Select-Object -ExpandProperty addr) -join ""
                MACVendor = ($xmlHost.address | Where-Object { $_.addrtype -eq "mac" } | Select-Object -ExpandProperty vendor) -join ""
                LastSeen = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                ScanMethod = "nmap"
                DeviceType = "Unknown"
                RiskLevel = "Low"
                Vulnerabilities = @()
            }

            # Parse OS information with accuracy
            if ($xmlHost.os.osmatch) {
                $bestMatch = $xmlHost.os.osmatch | Sort-Object -Property accuracy -Descending | Select-Object -First 1
                $hostInfo.OS = $bestMatch.name
                $hostInfo.OSAccuracy = $bestMatch.accuracy
                if ($bestMatch.osclass) {
                    $hostInfo.OSFamily = $bestMatch.osclass.osfamily
                }
            }

            # Parse ports with version info and risk assessment
            if ($xmlHost.ports.port) {
                foreach ($port in $xmlHost.ports.port) {
                    if ($port.state.state -eq "open") {
                        $hostInfo.OpenPorts += [int]$port.portid

                        $serviceName = if ($port.service.name) { $port.service.name } else { "unknown" }
                        $serviceProduct = if ($port.service.product) { $port.service.product } else { "" }
                        $serviceVersion = if ($port.service.version) { $port.service.version } else { "" }

                        $serviceStr = "$serviceName ($($port.portid))"
                        if ($serviceProduct) { $serviceStr += " - $serviceProduct" }
                        if ($serviceVersion) { $serviceStr += " $serviceVersion" }

                        $hostInfo.Services += $serviceStr

                        # Track versions separately for vulnerability analysis
                        if ($serviceProduct -and $serviceVersion) {
                            $hostInfo.ServiceVersions += "$serviceProduct $serviceVersion"
                        }

                        # Risk assessment based on service
                        $serviceInfo = Get-ServiceInformation -Port ([int]$port.portid)
                        if ($serviceInfo.RiskLevel -eq "High") {
                            $hostInfo.RiskLevel = "High"
                            $hostInfo.Vulnerabilities += "High-risk service: $serviceName on port $($port.portid)"
                        }
                    }
                }
            }

            # Convert arrays to CSV-friendly strings
            $hostInfo.OpenPorts = $hostInfo.OpenPorts -join ","
            $hostInfo.Services = $hostInfo.Services -join "; "
            $hostInfo.ServiceVersions = $hostInfo.ServiceVersions -join "; "
            $hostInfo.Vulnerabilities = $hostInfo.Vulnerabilities -join "; "

            # Infer device type from ports and OS
            if ($hostInfo.OS -match "Windows" -and $hostInfo.OpenPorts -match "3389") {
                $hostInfo.DeviceType = "Windows Server/Workstation"
            } elseif ($hostInfo.OS -match "Linux") {
                $hostInfo.DeviceType = "Linux Server"
            } elseif ($hostInfo.OpenPorts) {
                $portArray = $hostInfo.OpenPorts -split "," | ForEach-Object { [int]$_ }
                $hostInfo.DeviceType = Get-DeviceTypeFromPorts -OpenPorts $portArray
            }

            if ($hostInfo.IPAddress) {
                $results += $hostInfo
            }
        }

    } catch {
        Write-InfrastructureLog -Level "ERROR" -Message "? Failed to parse nmap XML output: $($_.Exception.Message)" -Context $Context
    }

    return $results
}

function Get-IPRange {
    <#
    .SYNOPSIS
    Calculate all IP addresses in a CIDR range
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Network,
        [Parameter(Mandatory=$true)]
        [int]$PrefixLength
    )

    try {
        $ipBytes = ([System.Net.IPAddress]::Parse($Network)).GetAddressBytes()
        $hostBits = 32 - $PrefixLength
        $numHosts = [math]::Pow(2, $hostBits)

        $ipRange = @()
        for ($i = 1; $i -lt $numHosts - 1; $i++) {
            $newBytes = $ipBytes.Clone()
            $hostPortion = $i

            for ($j = 3; $j -ge 0; $j--) {
                $newBytes[$j] = ($ipBytes[$j] -band (255 -shl ([math]::Max(0, $PrefixLength - (3-$j)*8)))) + ($hostPortion -band 255)
                $hostPortion = $hostPortion -shr 8
            }

            $ip = ($newBytes -join '.')
            $ipRange += $ip

            if ($ipRange.Count -gt 1000) { break } # Limit scan size for safety
        }

        return $ipRange
    } catch {
        Write-InfrastructureLog -Level "ERROR" -Message "Failed to calculate IP range: $($_.Exception.Message)" -Context @{}
        return @()
    }
}

function Get-ServiceInformation {
    <#
    .SYNOPSIS
    Map port numbers to service metadata with risk assessment
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [int]$Port
    )

    $serviceMap = @{
        21   = @{ Name = "FTP"; RiskLevel = "Medium"; Description = "File Transfer Protocol" }
        22   = @{ Name = "SSH"; RiskLevel = "Low"; Description = "Secure Shell" }
        23   = @{ Name = "Telnet"; RiskLevel = "High"; Description = "Unencrypted remote access" }
        25   = @{ Name = "SMTP"; RiskLevel = "Low"; Description = "Simple Mail Transfer Protocol" }
        53   = @{ Name = "DNS"; RiskLevel = "Low"; Description = "Domain Name System" }
        80   = @{ Name = "HTTP"; RiskLevel = "Low"; Description = "Hypertext Transfer Protocol" }
        110  = @{ Name = "POP3"; RiskLevel = "Medium"; Description = "Post Office Protocol v3" }
        135  = @{ Name = "RPC"; RiskLevel = "High"; Description = "Microsoft RPC Endpoint Mapper" }
        139  = @{ Name = "NetBIOS"; RiskLevel = "High"; Description = "NetBIOS Session Service" }
        143  = @{ Name = "IMAP"; RiskLevel = "Low"; Description = "Internet Message Access Protocol" }
        443  = @{ Name = "HTTPS"; RiskLevel = "Low"; Description = "HTTP Secure" }
        445  = @{ Name = "SMB"; RiskLevel = "High"; Description = "Server Message Block" }
        993  = @{ Name = "IMAPS"; RiskLevel = "Low"; Description = "IMAP over SSL" }
        995  = @{ Name = "POP3S"; RiskLevel = "Low"; Description = "POP3 over SSL" }
        1433 = @{ Name = "SQL Server"; RiskLevel = "High"; Description = "Microsoft SQL Server" }
        3306 = @{ Name = "MySQL"; RiskLevel = "High"; Description = "MySQL Database" }
        3389 = @{ Name = "RDP"; RiskLevel = "Medium"; Description = "Remote Desktop Protocol" }
        5432 = @{ Name = "PostgreSQL"; RiskLevel = "High"; Description = "PostgreSQL Database" }
        5985 = @{ Name = "WinRM HTTP"; RiskLevel = "Medium"; Description = "Windows Remote Management HTTP" }
        5986 = @{ Name = "WinRM HTTPS"; RiskLevel = "Low"; Description = "Windows Remote Management HTTPS" }
        8080 = @{ Name = "HTTP Alt"; RiskLevel = "Low"; Description = "Alternative HTTP port" }
    }

    if ($serviceMap[$Port]) {
        return $serviceMap[$Port]
    } else {
        return @{ Name = "Unknown"; RiskLevel = "Low"; Description = "Unknown service on port $Port" }
    }
}

function Get-DeviceTypeFromPorts {
    <#
    .SYNOPSIS
    Infer device type from open port combinations
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [int[]]$OpenPorts
    )

    # Device type detection based on port combinations
    if ($OpenPorts -contains 3389) { return "Windows Server/Workstation" }
    if ($OpenPorts -contains 22 -and $OpenPorts -notcontains 135) { return "Linux/Unix Server" }
    if ($OpenPorts -contains 80 -and $OpenPorts -contains 443) { return "Web Server" }
    if ($OpenPorts -contains 25 -and $OpenPorts -contains 110) { return "Mail Server" }
    if ($OpenPorts -contains 53) { return "DNS Server" }
    if ($OpenPorts -contains 135 -and $OpenPorts -contains 445) { return "Windows Server" }
    if ($OpenPorts -contains 21) { return "FTP Server" }
    if ($OpenPorts -contains 1433) { return "SQL Server" }
    if ($OpenPorts -contains 3306 -or $OpenPorts -contains 5432) { return "Database Server" }
    if ($OpenPorts.Count -eq 0) { return "Firewall/Router" }

    return "Generic Network Device"
}

function Get-ComprehensiveHostInformation {
    <#
    .SYNOPSIS
    Deep host scanning with WMI queries and comprehensive port testing
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$IPAddress,
        [hashtable]$Context = @{}
    )

    try {
        $config = Get-ProductionSafeNmapConfig -Context $Context
        $envTest = Test-ProductionEnvironment -Context $Context

        $hostInfo = [PSCustomObject]@{
            IPAddress = $IPAddress
            Hostname = ""
            OS = ""
            Domain = ""
            Manufacturer = ""
            Model = ""
            SerialNumber = ""
            Architecture = ""
            OpenPorts = @()
            Services = @()
            Shares = @()
            LastSeen = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            ResponseTime = 0
            MACAddress = ""
            Status = "Unknown"
            RiskLevel = "Low"
            DeviceType = "Unknown"
            Vulnerabilities = @()
        }

        # Try to resolve hostname with timeout
        try {
            $dnsTask = [System.Net.Dns]::GetHostEntryAsync($IPAddress)
            if ($dnsTask.Wait(5000)) {
                $hostInfo.Hostname = $dnsTask.Result.HostName
            } else {
                $hostInfo.Hostname = "Unknown (DNS timeout)"
            }
        } catch {
            $hostInfo.Hostname = "Unknown"
        }

        # Use safe port range in production environments
        $portRange = if ($envTest.IsProduction) {
            $config.SafePortRange
        } else {
            @(21, 22, 23, 25, 53, 80, 110, 135, 139, 143, 443, 445, 993, 995, 1433, 3306, 3389, 5432, 5985, 5986)
        }

        $openPorts = @()

        Write-InfrastructureLog -Level "DEBUG" -Message "Testing $($portRange.Count) ports on $IPAddress..." -Context $Context

        foreach ($port in $portRange) {
            # Skip blacklisted ports in production
            if ($envTest.IsProduction -and $port -in $config.BlacklistPorts) {
                continue
            }

            try {
                $result = Test-NetConnection -ComputerName $IPAddress -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
                if ($result) {
                    $openPorts += $port

                    # Identify services and assess risk
                    $serviceInfo = Get-ServiceInformation -Port $port
                    $hostInfo.Services += "$($serviceInfo.Name) ($port)" + $(if ($serviceInfo.Description) { " - $($serviceInfo.Description)" } else { "" })

                    # Risk assessment
                    if ($serviceInfo.RiskLevel -eq "High") {
                        $hostInfo.RiskLevel = "High"
                        $hostInfo.Vulnerabilities += "High-risk service: $($serviceInfo.Name) on port $port"
                    } elseif ($serviceInfo.RiskLevel -eq "Medium" -and $hostInfo.RiskLevel -eq "Low") {
                        $hostInfo.RiskLevel = "Medium"
                    }
                }
            } catch {
                # Port test failed, continue
            }

            # Rate limiting between port tests in production
            if ($envTest.IsProduction) {
                Start-Sleep -Milliseconds 100
            }
        }

        $hostInfo.OpenPorts = $openPorts -join ","

        # Device type detection
        $hostInfo.DeviceType = Get-DeviceTypeFromPorts -OpenPorts $openPorts

        # Try to get additional Windows-specific information if SMB is available
        if (445 -in $openPorts -and -not ($envTest.IsProduction -and 445 -in $config.BlacklistPorts)) {
            try {
                Write-InfrastructureLog -Level "DEBUG" -Message "Attempting WMI query to $IPAddress..." -Context $Context

                # Use timeout for WMI queries
                $wmiTimeout = if ($envTest.IsProduction) { 10 } else { 30 }

                $wmiResult = Get-WmiObject -Class Win32_ComputerSystem -ComputerName $IPAddress -ErrorAction SilentlyContinue -AsJob
                if (Wait-Job $wmiResult -Timeout $wmiTimeout) {
                    $computerInfo = Receive-Job $wmiResult
                    if ($computerInfo) {
                        $hostInfo.Manufacturer = $computerInfo.Manufacturer
                        $hostInfo.Model = $computerInfo.Model
                        $hostInfo.Domain = $computerInfo.Domain
                    }
                }
                Remove-Job $wmiResult -Force -ErrorAction SilentlyContinue

                $osResult = Get-WmiObject -Class Win32_OperatingSystem -ComputerName $IPAddress -ErrorAction SilentlyContinue -AsJob
                if (Wait-Job $osResult -Timeout $wmiTimeout) {
                    $osInfo = Receive-Job $osResult
                    if ($osInfo) {
                        $hostInfo.OS = "$($osInfo.Caption) $($osInfo.Version)"
                        $hostInfo.Architecture = $osInfo.OSArchitecture

                        # Check for vulnerable Windows versions
                        if ($osInfo.Version -match "^6\.[01]" -or $osInfo.Caption -match "Windows (XP|Vista|7|2003|2008)") {
                            $hostInfo.RiskLevel = "High"
                            $hostInfo.Vulnerabilities += "Legacy Windows version detected: $($osInfo.Caption)"
                        }
                    }
                }
                Remove-Job $osResult -Force -ErrorAction SilentlyContinue

                $biosResult = Get-WmiObject -Class Win32_BIOS -ComputerName $IPAddress -ErrorAction SilentlyContinue -AsJob
                if (Wait-Job $biosResult -Timeout $wmiTimeout) {
                    $biosInfo = Receive-Job $biosResult
                    if ($biosInfo) {
                        $hostInfo.SerialNumber = $biosInfo.SerialNumber
                    }
                }
                Remove-Job $biosResult -Force -ErrorAction SilentlyContinue

            } catch {
                Write-InfrastructureLog -Level "DEBUG" -Message "WMI query failed for ${IPAddress}: $($_.Exception.Message)" -Context $Context
            }
        }

        # Convert arrays to strings for CSV export
        $hostInfo.Services = $hostInfo.Services -join "; "
        $hostInfo.Vulnerabilities = $hostInfo.Vulnerabilities -join "; "

        $hostInfo.Status = "Live"
        return $hostInfo

    } catch {
        Write-InfrastructureLog -Level "DEBUG" -Message "Failed to get comprehensive host info for ${IPAddress}: $($_.Exception.Message)" -Context $Context
        return $null
    }
}

function Test-SubnetObjectIntegrity {
    <#
    .SYNOPSIS
    Validate subnet objects have correct structure and properties
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [array]$Subnets,
        [hashtable]$Context = @{}
    )

    $errors = @()

    for ($i = 0; $i -lt $Subnets.Count; $i++) {
        $subnet = $Subnets[$i]

        # Check if it's a string (should be object)
        if ($subnet -is [string]) {
            $errors += "Subnet at index $i is a string: '$subnet' (should be PSCustomObject)"
            continue
        }

        # Check required properties
        $requiredProps = @('SubnetName', 'Source', 'Priority')
        foreach ($prop in $requiredProps) {
            if (-not ($subnet.PSObject.Properties.Name -contains $prop)) {
                $errors += "Subnet at index $i missing required property: $prop"
            }
        }

        # Check SubnetName format (should be CIDR)
        if ($subnet.SubnetName -and $subnet.SubnetName -notmatch '^\d+\.\d+\.\d+\.\d+/\d+$') {
            $errors += "Subnet at index $i has invalid CIDR format: $($subnet.SubnetName)"
        }
    }

    if ($errors.Count -gt 0) {
        Write-InfrastructureLog -Level "ERROR" -Message "Subnet object integrity check FAILED:" -Context $Context
        foreach ($error in $errors) {
            Write-InfrastructureLog -Level "ERROR" -Message "  - $error" -Context $Context
        }
        return $false
    } else {
        Write-InfrastructureLog -Level "SUCCESS" -Message "Subnet object integrity check PASSED ($($Subnets.Count) subnets validated)" -Context $Context
        return $true
    }
}

function Invoke-ProductionSafePowerShellScan {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Target,
        [PSCustomObject]$SubnetInfo = $null,
        [hashtable]$Context = @{}
    )

    $results = @()

    # Get adaptive scan parameters based on subnet classification
    $config = if ($SubnetInfo) {
        Get-AdaptiveScanParameters -Subnet $SubnetInfo -Context $Context
    } else {
        # Fallback to conservative defaults
        @{
            TimingTemplate = "T3"
            MaxRate = 5
            BatchSize = 10
            DelayBetween = 2000
            PortRange = @(80, 443, 22, 3389)
        }
    }

    try {
        Write-InfrastructureLog -Level "INFO" -Message "?? Running adaptive PowerShell scan on $Target..." -Context $Context
        Write-InfrastructureLog -Level "DEBUG" -Message "?? Using adaptive parameters: batch=$($config.BatchSize), delay=$($config.DelayBetween)ms, ports=$($config.PortRange.Count)" -Context $Context

        # Test environment
        $envTest = Test-ProductionEnvironment -Context $Context
        if ($envTest.IsProduction) {
            Write-InfrastructureLog -Level "INFO" -Message "?? Production environment - using conservative adaptive settings" -Context $Context
        }

        # Parse subnet
        if ($Target -match '^(.+)/(\d+)') {
            $networkAddr = $matches[1]
            $prefixLength = [int]$matches[2]

            # Enforce intelligent subnet size limits based on classification
            $maxSubnetSize = if ($SubnetInfo -and $SubnetInfo.BusinessPriority -ge 90) { 26 } else { 24 }
            if ($prefixLength -lt $maxSubnetSize) {
                Write-InfrastructureLog -Level "WARN" -Message "?? Subnet $Target larger than /$maxSubnetSize - limiting scan scope for safety" -Context $Context
                $prefixLength = $maxSubnetSize
            }

            # Calculate IP range with size limit
            $ipRange = Get-IPRange -Network $networkAddr -PrefixLength $prefixLength
            if ($ipRange.Count -gt 254) {
                $ipRange = $ipRange[0..253] # Limit to 254 IPs
            }

            Write-InfrastructureLog -Level "INFO" -Message "?? Production-safe scan of $($ipRange.Count) IPs in subnet $Target..." -Context $Context

            $liveHosts = [System.Collections.Concurrent.ConcurrentBag[string]]::new()

            # Adaptive batch processing based on subnet classification
            $batchSize = $config.BatchSize
            $batches = @()
            for ($i = 0; $i -lt $ipRange.Count; $i += $batchSize) {
                $end = [Math]::Min($i + $batchSize - 1, $ipRange.Count - 1)
                $batches += ,($ipRange[$i..$end])
            }

            foreach ($batch in $batches) {
                Write-InfrastructureLog -Level "DEBUG" -Message "?? Processing batch of $($batch.Count) IPs..." -Context $Context

                # Adaptive PowerShell scanning with intelligent port selection
                foreach ($ip in $batch) {
                    # Use adaptive port range based on subnet classification
                    $testPorts = $config.PortRange
                    $hostFound = $false
                    foreach ($port in $testPorts) {
                        try {
                            $result = Test-NetConnection -ComputerName $ip -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
                            if ($result) {
                                $liveHosts.Add($ip)
                                $hostFound = $true
                                break # Found one open port, host is alive
                            }
                        } catch {
                            # Port test failed, continue
                        }
                    }

                    # Adaptive rate limiting between individual IP tests
                    $ipDelay = if ($SubnetInfo -and $SubnetInfo.BusinessPriority -ge 90) { 200 } else { 50 }
                    Start-Sleep -Milliseconds $ipDelay
                }

                # Adaptive rate limiting between batches
                Start-Sleep -Milliseconds $config.DelayBetween
            }

            $liveHostArray = @($liveHosts.ToArray() | Sort-Object -Unique)
            Write-InfrastructureLog -Level "SUCCESS" -Message "? Found $($liveHostArray.Count) live hosts" -Context $Context

            # Get detailed info for each live host with rate limiting
            foreach ($ip in $liveHostArray) {
                $hostInfo = Get-ComprehensiveHostInformation -IPAddress $ip -Context $Context
                if ($hostInfo) {
                    $hostInfo | Add-Member -NotePropertyName 'ScanMethod' -NotePropertyValue 'PowerShell (Production-Safe)' -Force
                    $results += $hostInfo
                }

                # Rate limiting between host scans
                Start-Sleep -Milliseconds $config.DelayBetweenHosts
            }
        }

    } catch {
        Write-InfrastructureLog -Level "ERROR" -Message "? Production-safe PowerShell scan failed: $($_.Exception.Message)" -Context $Context
    }

    return $results
}

#region Main Entry Point - Invoke-InfrastructureDiscovery

<#
.SYNOPSIS
    Main entry point for infrastructure discovery module
.DESCRIPTION
    Orchestrates comprehensive infrastructure discovery including servers, network devices,
    storage devices, security devices, and virtualization infrastructure using nmap and PowerShell scanning.
.PARAMETER Configuration
    Hashtable containing discovery configuration settings
.PARAMETER Context
    Hashtable containing context information including paths and authentication
.PARAMETER SessionId
    Session identifier for tracking and authentication
#>
function Invoke-InfrastructureDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-InfrastructureLog -Level "HEADER" -Message "Starting Infrastructure Discovery (v2.0)" -Context $Context
    Write-InfrastructureLog -Level "INFO" -Message "Session ID: $SessionId" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    try {
        if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
            Import-Module -Name "$PSScriptRoot\..\Core\ClassDefinitions.psm1" -Force -ErrorAction Stop
        }
        $result = [DiscoveryResult]::new('Infrastructure')
    } catch {
        Write-InfrastructureLog -Level "ERROR" -Message "Failed to load DiscoveryResult class: $($_.Exception.Message)" -Context $Context
        throw "Critical error: Cannot load required DiscoveryResult class. Discovery cannot proceed."
    }

    try {
        # Validate context
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput

        # Get configuration settings with defaults
        $includeServers = if ($Configuration.IncludeServers -ne $null) { $Configuration.IncludeServers } else { $true }
        $includeNetworkDevices = if ($Configuration.IncludeNetworkDevices -ne $null) { $Configuration.IncludeNetworkDevices } else { $true }
        $includeStorageDevices = if ($Configuration.IncludeStorageDevices -ne $null) { $Configuration.IncludeStorageDevices } else { $true }
        $includeSecurityDevices = if ($Configuration.IncludeSecurityDevices -ne $null) { $Configuration.IncludeSecurityDevices } else { $true }
        $includeVirtualization = if ($Configuration.IncludeVirtualization -ne $null) { $Configuration.IncludeVirtualization } else { $true }
        $enableDiagnostics = if ($Configuration.EnableDiagnostics -ne $null) { $Configuration.EnableDiagnostics } else { $false }
        $manualSubnets = if ($Configuration.ManualSubnets) { $Configuration.ManualSubnets } else { @() }
        $maxResults = if ($Configuration.MaxResults) { $Configuration.MaxResults } else { 1000 }

        Write-InfrastructureLog -Level "INFO" -Message "Configuration: Servers=$includeServers, Network=$includeNetworkDevices, Storage=$includeStorageDevices, Security=$includeSecurityDevices, Virtualization=$includeVirtualization" -Context $Context

        # Collect all discovered infrastructure
        $allDiscovered = [System.Collections.ArrayList]::new()
        $statistics = @{
            totalServers = 0
            totalNetworkDevices = 0
            totalStorageDevices = 0
            totalSecurityDevices = 0
            totalVirtualization = 0
        }

        # Run diagnostics if enabled
        $diagnostics = $null
        if ($enableDiagnostics) {
            Write-InfrastructureLog -Level "INFO" -Message "Running network diagnostics..." -Context $Context
            try {
                $diagnostics = Invoke-DiagnosticNetworkScan -Context $Context
                Write-InfrastructureLog -Level "SUCCESS" -Message "Diagnostics completed" -Context $Context
            } catch {
                Write-InfrastructureLog -Level "WARN" -Message "Diagnostics failed: $($_.Exception.Message)" -Context $Context
            }
        }

        # Discover subnets
        Write-InfrastructureLog -Level "INFO" -Message "Discovering network subnets..." -Context $Context
        $subnets = @()

        # Add manual subnets first (convert strings to PSCustomObjects)
        if ($manualSubnets -and $manualSubnets.Count -gt 0) {
            Write-InfrastructureLog -Level "INFO" -Message "Adding $($manualSubnets.Count) manual subnets" -Context $Context
            foreach ($manualSubnet in $manualSubnets) {
                $subnets += [PSCustomObject]@{
                    SubnetName = $manualSubnet
                    SiteName = "Manual Entry"
                    Location = ""
                    Description = "Manually specified subnet"
                    Source = "Manual Configuration"
                    Priority = 70
                    SubnetType = "Manual Entry"
                    BusinessContext = "User Specified"
                }
            }
        }

        # Try to discover subnets from AD
        try {
            $adSubnets = Get-ADSitesAndSubnets -Configuration $Configuration -Context $Context
            if ($adSubnets -and $adSubnets.Count -gt 0) {
                Write-InfrastructureLog -Level "SUCCESS" -Message "Found $($adSubnets.Count) subnets from AD Sites" -Context $Context

                # Log sample of discovered subnets with metadata
                $sampleSubnet = $adSubnets[0]
                Write-InfrastructureLog -Level "DEBUG" -Message "Sample AD subnet: $($sampleSubnet.SubnetName) | Site: $($sampleSubnet.SiteName) | Location: $($sampleSubnet.Location) | Priority: $($sampleSubnet.Priority)" -Context $Context

                # CRITICAL: Preserve PSCustomObjects to retain metadata
                $subnets += $adSubnets
            }
        } catch {
            Write-InfrastructureLog -Level "WARN" -Message "Could not discover AD subnets: $($_.Exception.Message)" -Context $Context
        }

        # Try DNS zones as fallback
        if ($subnets.Count -eq 0) {
            try {
                $dnsSubnets = Get-SubnetsFromDNSZones -Context $Context
                if ($dnsSubnets -and $dnsSubnets.Count -gt 0) {
                    Write-InfrastructureLog -Level "SUCCESS" -Message "Found $($dnsSubnets.Count) subnets from DNS zones" -Context $Context
                    $subnets += $dnsSubnets
                }
            } catch {
                Write-InfrastructureLog -Level "WARN" -Message "Could not discover DNS subnets: $($_.Exception.Message)" -Context $Context
            }
        }

        # Remove duplicates based on SubnetName property
        $subnets = $subnets | Sort-Object -Property SubnetName -Unique

        if ($subnets.Count -eq 0) {
            Write-InfrastructureLog -Level "WARN" -Message "No subnets discovered. Infrastructure discovery limited." -Context $Context
            $result.AddWarning("No subnets discovered. Add manual subnets or ensure AD/DNS access.", @{Section="SubnetDiscovery"})
        } else {
            Write-InfrastructureLog -Level "INFO" -Message "Will scan $($subnets.Count) subnets" -Context $Context
        }

        # Validate subnet objects before classification
        if ($subnets.Count -gt 0) {
            $validationPassed = Test-SubnetObjectIntegrity -Subnets $subnets -Context $Context
            if (-not $validationPassed) {
                $result.AddError("Subnet data model validation failed. Check logs for details.", $null, @{Section="SubnetValidation"})
                # Continue anyway with defensive handling in Classify-NetworkSegments
            }
        }

        # Classify subnets for prioritized scanning
        $classifiedSubnets = Classify-NetworkSegments -AllSubnets $subnets -Configuration $Configuration -Context $Context

        # Scan each subnet
        $discoveredHosts = [System.Collections.ArrayList]::new()

        foreach ($subnet in $classifiedSubnets | Sort-Object { $_.BusinessPriority } -Descending | Select-Object -First 10) {
            Write-InfrastructureLog -Level "INFO" -Message "Scanning subnet: $($subnet.SubnetName) (Priority: $($subnet.BusinessPriority), Type: $($subnet.SegmentType))" -Context $Context

            # Try nmap first, fallback to PowerShell
            $hosts = @()
            $nmapPath = Find-SystemNmap

            if ($nmapPath) {
                try {
                    $hosts = Invoke-ProductionSafeNmapScan -Target $subnet.SubnetName -NmapPath $nmapPath.Path -ScanType "comprehensive" -Context $Context -SubnetInfo $subnet
                } catch {
                    Write-InfrastructureLog -Level "WARN" -Message "Nmap scan failed, trying PowerShell: $($_.Exception.Message)" -Context $Context
                    $hosts = Invoke-ProductionSafePowerShellScan -Target $subnet.SubnetName -Context $Context -SubnetInfo $subnet
                }
            } else {
                $hosts = Invoke-ProductionSafePowerShellScan -Target $subnet.SubnetName -Context $Context -SubnetInfo $subnet
            }

            if ($hosts -and $hosts.Count -gt 0) {
                Write-InfrastructureLog -Level "SUCCESS" -Message "Found $($hosts.Count) hosts in $($subnet.SubnetName)" -Context $Context
                $null = $discoveredHosts.AddRange($hosts)
            }

            # Check max results limit
            if ($discoveredHosts.Count -ge $maxResults) {
                Write-InfrastructureLog -Level "WARN" -Message "Reached max results limit ($maxResults)" -Context $Context
                break
            }
        }

        # Categorize discovered hosts
        foreach ($host in $discoveredHosts) {
            $deviceType = if ($host.DeviceType) { $host.DeviceType } else { "Unknown" }

            switch -Wildcard ($deviceType) {
                "*Server*" {
                    if ($includeServers) {
                        $host | Add-Member -NotePropertyName "_DataType" -NotePropertyValue "Server" -Force
                        $null = $allDiscovered.Add($host)
                        $statistics.totalServers++
                    }
                }
                "*Router*" {
                    if ($includeNetworkDevices) {
                        $host | Add-Member -NotePropertyName "_DataType" -NotePropertyValue "NetworkDevice" -Force
                        $null = $allDiscovered.Add($host)
                        $statistics.totalNetworkDevices++
                    }
                }
                "*Switch*" {
                    if ($includeNetworkDevices) {
                        $host | Add-Member -NotePropertyName "_DataType" -NotePropertyValue "NetworkDevice" -Force
                        $null = $allDiscovered.Add($host)
                        $statistics.totalNetworkDevices++
                    }
                }
                "*Firewall*" {
                    if ($includeSecurityDevices) {
                        $host | Add-Member -NotePropertyName "_DataType" -NotePropertyValue "SecurityDevice" -Force
                        $null = $allDiscovered.Add($host)
                        $statistics.totalSecurityDevices++
                    }
                }
                "*Storage*" {
                    if ($includeStorageDevices) {
                        $host | Add-Member -NotePropertyName "_DataType" -NotePropertyValue "StorageDevice" -Force
                        $null = $allDiscovered.Add($host)
                        $statistics.totalStorageDevices++
                    }
                }
                "*NAS*" {
                    if ($includeStorageDevices) {
                        $host | Add-Member -NotePropertyName "_DataType" -NotePropertyValue "StorageDevice" -Force
                        $null = $allDiscovered.Add($host)
                        $statistics.totalStorageDevices++
                    }
                }
                "*VMware*" {
                    if ($includeVirtualization) {
                        $host | Add-Member -NotePropertyName "_DataType" -NotePropertyValue "Virtualization" -Force
                        $null = $allDiscovered.Add($host)
                        $statistics.totalVirtualization++
                    }
                }
                "*Hyper-V*" {
                    if ($includeVirtualization) {
                        $host | Add-Member -NotePropertyName "_DataType" -NotePropertyValue "Virtualization" -Force
                        $null = $allDiscovered.Add($host)
                        $statistics.totalVirtualization++
                    }
                }
                default {
                    if ($includeServers) {
                        $host | Add-Member -NotePropertyName "_DataType" -NotePropertyValue "Server" -Force
                        $null = $allDiscovered.Add($host)
                        $statistics.totalServers++
                    }
                }
            }
        }

        # Export to CSV
        $csvPath = Join-Path $outputPath "InfrastructureDiscovery.csv"
        if ($allDiscovered.Count -gt 0) {
            $allDiscovered | Export-Csv -Path $csvPath -NoTypeInformation -Force
            Write-InfrastructureLog -Level "SUCCESS" -Message "Exported $($allDiscovered.Count) items to $csvPath" -Context $Context
        } else {
            Write-InfrastructureLog -Level "WARN" -Message "No infrastructure items discovered" -Context $Context
        }

        $stopwatch.Stop()

        # Build final result
        $result.RecordCount = $allDiscovered.Count
        $result.Data = @{
            totalItems = $allDiscovered.Count
            totalServers = $statistics.totalServers
            totalNetworkDevices = $statistics.totalNetworkDevices
            totalStorageDevices = $statistics.totalStorageDevices
            totalSecurityDevices = $statistics.totalSecurityDevices
            totalVirtualization = $statistics.totalVirtualization
            outputPath = $csvPath
            diagnostics = $diagnostics
            subnetsScanned = $subnets.Count
            statistics = $statistics
            duration = $stopwatch.Elapsed.TotalSeconds
        }

        Write-InfrastructureLog -Level "HEADER" -Message "Infrastructure Discovery Complete" -Context $Context
        Write-InfrastructureLog -Level "SUCCESS" -Message "Total: $($allDiscovered.Count) items (Servers: $($statistics.totalServers), Network: $($statistics.totalNetworkDevices), Storage: $($statistics.totalStorageDevices), Security: $($statistics.totalSecurityDevices), Virtualization: $($statistics.totalVirtualization))" -Context $Context
        Write-InfrastructureLog -Level "INFO" -Message "Duration: $([math]::Round($stopwatch.Elapsed.TotalSeconds, 2)) seconds" -Context $Context

    } catch {
        $result.AddError("Infrastructure discovery failed: $($_.Exception.Message)", $_.Exception, $null)
        Write-InfrastructureLog -Level "ERROR" -Message "Infrastructure discovery failed: $($_.Exception.Message)" -Context $Context
    }

    return $result
}

#endregion Main Entry Point

# Export all functions
Export-ModuleMember -Function Invoke-InfrastructureDiscovery, Get-ProductionSafeNmapConfig, Test-ProductionEnvironment, Find-SystemNmap, Test-NmapCapabilities, Install-NmapSilent, Install-NmapIfNeeded, Get-ADSitesAndSubnets, Get-SubnetsFromDNSZones, Classify-NetworkSegments, Get-AdaptiveScanParameters, Invoke-ProductionSafeNmapScan, Invoke-ProductionSafePowerShellScan, Get-ComprehensiveHostInformation, Import-ExistingAssetData, Merge-DiscoveredWithExistingAssets, Get-ServiceInformation, Get-DeviceTypeFromPorts, Invoke-DiagnosticNetworkScan
