# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Master Orchestrator
# Version: 1.0.0
# Created: 2025-08-30
# Last Modified: 2025-08-30

<#
.SYNOPSIS
    Comprehensive Infrastructure discovery module with nmap integration for M&A Discovery Suite
.DESCRIPTION
    Advanced network infrastructure discovery using nmap and PowerShell to systematically scan subnets,
    identify live hosts, enumerate services, detect operating systems, and collect detailed hardware/software
    inventory. This module provides comprehensive network topology mapping, vulnerability detection,
    and asset inventory capabilities essential for M&A due diligence and infrastructure assessment.
.NOTES
    Version: 1.0.0
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
    
    Write-InfrastructureLog -Level "INFO" -Message "🔍 Detecting environment type..." -Context $Context
    
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
        Write-InfrastructureLog -Level "WARN" -Message "⚠️ Production environment detected: $($productionSignals -join ', ')" -Context $Context
    } else {
        Write-InfrastructureLog -Level "SUCCESS" -Message "✅ Non-production environment detected" -Context $Context
    }
    
    return @{
        IsProduction = $isProduction
        Signals = $productionSignals
    }
}

function Install-NmapIfNeeded {
    [CmdletBinding()]
    param(
        [hashtable]$Context = @{}
    )
    
    # First check for embedded nmap in application directory
    $appNmapPaths = @(
        "$PSScriptRoot\..\..\Tools\nmap\nmap.exe",
        "$PSScriptRoot\..\..\..\Tools\nmap\nmap.exe",
        "C:\enterprisediscovery\Tools\nmap\nmap.exe"
    )
    
    foreach ($embeddedPath in $appNmapPaths) {
        if (Test-Path $embeddedPath) {
            Write-InfrastructureLog -Level "SUCCESS" -Message "✅ Found embedded nmap at: $embeddedPath" -Context $Context
            return $embeddedPath
        }
    }
    
    # Check if nmap is available in PATH
    $nmapPath = Get-Command nmap -ErrorAction SilentlyContinue
    if ($nmapPath) {
        Write-InfrastructureLog -Level "SUCCESS" -Message "✅ Found nmap in PATH: $($nmapPath.Source)" -Context $Context
        return $nmapPath.Source
    }
    
    # Check common installation paths
    $possiblePaths = @(
        "${env:ProgramFiles}\Nmap\nmap.exe",
        "${env:ProgramFiles(x86)}\Nmap\nmap.exe",
        "C:\Tools\nmap\nmap.exe"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            Write-InfrastructureLog -Level "SUCCESS" -Message "✅ Found nmap at: $path" -Context $Context
            return $path
        }
    }
    
    # Try to download and install nmap portable
    try {
        Write-InfrastructureLog -Level "INFO" -Message "📥 Downloading nmap portable..." -Context $Context
        
        $nmapDir = "C:\Tools\nmap"
        $nmapZip = "$env:TEMP\nmap-portable.zip"
        
        if (-not (Test-Path $nmapDir)) {
            New-Item -ItemType Directory -Path $nmapDir -Force | Out-Null
        }
        
        # Download nmap from multiple fallback sources (only if not embedded)
        Write-InfrastructureLog -Level "WARN" -Message "⚠️ No embedded nmap found - attempting download as fallback" -Context $Context
        $nmapUrls = @(
            "https://nmap.org/dist/nmap-7.95-win32.zip",
            "https://github.com/nmap/nmap/releases/download/v7.95/nmap-7.95-win32.zip",
            "https://download.insecure.org/nmap/dist/nmap-7.95-win32.zip"
        )
        
        $downloadSuccess = $false
        foreach ($nmapUrl in $nmapUrls) {
            try {
                Write-InfrastructureLog "📥 Trying nmap download from: $nmapUrl" "INFO"
                Invoke-WebRequest -Uri $nmapUrl -OutFile $nmapZip -UseBasicParsing -TimeoutSec 30
                if (Test-Path $nmapZip) {
                    $downloadSuccess = $true
                    Write-InfrastructureLog "✅ Successfully downloaded nmap from: $nmapUrl" "SUCCESS"
                    break
                }
            }
            catch {
                Write-InfrastructureLog "❌ Failed to download from $nmapUrl : $($_.Exception.Message)" "WARN"
                continue
            }
        }
        
        if (-not $downloadSuccess) {
            Write-InfrastructureLog "⚠️ All nmap download sources failed - continuing with PowerShell alternatives" "WARN"
            return $false
        }
        
        # Extract
        try {
            Add-Type -AssemblyName System.IO.Compression.FileSystem
            [System.IO.Compression.ZipFile]::ExtractToDirectory($nmapZip, $nmapDir)
            Write-InfrastructureLog "✅ Successfully extracted nmap" "SUCCESS"
            
            # Clean up the zip file
            Remove-Item $nmapZip -Force -ErrorAction SilentlyContinue
        }
        catch {
            Write-InfrastructureLog "❌ Failed to extract nmap: $($_.Exception.Message)" "ERROR"
            # Clean up the zip file even on failure
            Remove-Item $nmapZip -Force -ErrorAction SilentlyContinue
            return $false
        }
        
        # Find the nmap.exe in the extracted folder
        $nmapExe = Get-ChildItem -Path $nmapDir -Name "nmap.exe" -Recurse | Select-Object -First 1
        if ($nmapExe) {
            $finalPath = Join-Path $nmapDir $nmapExe.DirectoryName "nmap.exe"
            Write-InfrastructureLog -Level "SUCCESS" -Message "✅ Successfully installed nmap at: $finalPath" -Context $Context
            return $finalPath
        }
        
        Write-InfrastructureLog -Level "WARN" -Message "⚠️ Downloaded nmap but couldn't find executable" -Context $Context
        return $null
        
    } catch {
        Write-InfrastructureLog -Level "WARN" -Message "⚠️ Failed to download nmap: $($_.Exception.Message)" -Context $Context
        Write-InfrastructureLog -Level "INFO" -Message "💡 Continuing without nmap - will use PowerShell alternatives" -Context $Context
        return $null
    }
}

function Get-NetworkSubnets {
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [hashtable]$Context = @{}
    )
    
    $subnets = @()
    
    try {
        Write-InfrastructureLog -Level "INFO" -Message "🌐 Discovering network subnets..." -Context $Context
        
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
                    NetworkSubnet = $networkSubnet
                    DHCP = (Get-NetIPInterface -InterfaceIndex $adapter.InterfaceIndex -AddressFamily IPv4).Dhcp
                }
            }
        }
        
        # Add common private subnets if not found
        $commonSubnets = @('192.168.0.0/16', '10.0.0.0/8', '172.16.0.0/12')
        foreach ($commonSubnet in $commonSubnets) {
            if (-not ($subnets | Where-Object { $_.NetworkSubnet -eq $commonSubnet })) {
                # Check if we can reach this subnet
                $testIP = switch ($commonSubnet) {
                    '192.168.0.0/16' { '192.168.1.1' }
                    '10.0.0.0/8' { '10.0.0.1' }
                    '172.16.0.0/12' { '172.16.0.1' }
                }
                
                if (Test-NetConnection -ComputerName $testIP -Port 80 -InformationLevel Quiet -WarningAction SilentlyContinue) {
                    $subnets += [PSCustomObject]@{
                        Interface = "External Route"
                        InterfaceDescription = "Common Private Range"
                        IPAddress = $testIP
                        PrefixLength = $commonSubnet.Split('/')[1]
                        NetworkSubnet = $commonSubnet
                        NetworkAddress = $commonSubnet.Split('/')[0]
                        DHCP = "Unknown"
                    }
                }
            }
        }
        
        Write-InfrastructureLog -Level "SUCCESS" -Message "✅ Discovered $($subnets.Count) network subnets" -Context $Context
        
    } catch {
        Write-InfrastructureLog -Level "ERROR" -Message "❌ Failed to discover subnets: $($_.Exception.Message)" -Context $Context
    }
    
    return $subnets
}

function Invoke-ProductionSafeNmapScan {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Target,
        [string]$NmapPath,
        [string]$ScanType = "ping",
        [hashtable]$Context = @{}
    )
    
    if (-not $NmapPath -or -not (Test-Path $NmapPath)) {
        Write-InfrastructureLog -Level "WARN" -Message "⚠️ Nmap not available, using PowerShell alternatives for $Target" -Context $Context
        return Invoke-ProductionSafePowerShellScan -Target $Target -Context $Context
    }
    
    # Get production-safe configuration
    $config = Get-ProductionSafeNmapConfig -Context $Context
    
    # Test environment and require approval if production
    $envTest = Test-ProductionEnvironment -Context $Context
    if ($envTest.IsProduction -and $config.RequireProductionApproval) {
        Write-InfrastructureLog -Level "WARN" -Message "🚨 Production environment detected. Administrator approval required." -Context $Context
        $approval = Read-Host "Continue with production-safe scanning? (type 'YES' to continue)"
        if ($approval -ne "YES") {
            Write-InfrastructureLog -Level "INFO" -Message "❌ Scan cancelled by administrator" -Context $Context
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
                Write-InfrastructureLog -Level "INFO" -Message "🔍 Running production-safe nmap ping scan on $Target..." -Context $Context
                $nmapArgs = @(
                    "-sn",                    # Ping scan only
                    "-T$($config.TimingTemplate)", # Polite timing
                    "--max-rate", $config.MaxPacketsPerSecond,
                    "--max-retries", "1",    # Minimal retries
                    "--host-timeout", "30s", # Conservative timeout
                    $Target
                )
            }
            "port" {
                Write-InfrastructureLog -Level "INFO" -Message "🔍 Running production-safe nmap port scan on $Target..." -Context $Context
                $safePortList = $config.SafePortRange -join ","
                $nmapArgs = @(
                    "-sS",                    # SYN scan
                    "-T$($config.TimingTemplate)", # Polite timing  
                    "--max-rate", $config.MaxPacketsPerSecond,
                    "--max-retries", "1",
                    "--host-timeout", "60s",
                    "-p", $safePortList,      # Limited port range
                    "--exclude-ports", ($config.BlacklistPorts -join ","),
                    $Target
                )
            }
            "service" {
                Write-InfrastructureLog -Level "INFO" -Message "🔍 Running production-safe nmap service scan on $Target..." -Context $Context
                $safePortList = $config.SafePortRange -join ","
                $nmapArgs = @(
                    "-sV",                   # Version detection
                    "--version-intensity", "1", # Minimal probing
                    "-T$($config.TimingTemplate)",
                    "--max-rate", $config.MaxPacketsPerSecond,
                    "--max-retries", "1",
                    "--host-timeout", "60s",
                    "-p", $safePortList,
                    "--exclude-ports", ($config.BlacklistPorts -join ","),
                    $Target
                )
            }
        }
        
        # Add XML output
        $nmapArgs += @("-oX", $outputFile)
        
        Write-InfrastructureLog -Level "DEBUG" -Message "🔧 nmap command: $NmapPath $($nmapArgs -join ' ')" -Context $Context
        
        $process = Start-Process -FilePath $NmapPath -ArgumentList $nmapArgs -NoNewWindow -PassThru -RedirectStandardError "$env:TEMP\nmap_error.log"
        
        # Wait with timeout
        $timeoutMs = $config.ScanTimeoutSeconds * 1000
        if (-not $process.WaitForExit($timeoutMs)) {
            Write-InfrastructureLog -Level "WARN" -Message "⚠️ Nmap scan timeout - terminating process" -Context $Context
            $process.Kill()
            return @()
        }
        
        if ($process.ExitCode -eq 0 -and (Test-Path $outputFile)) {
            $nmapOutput = Get-Content $outputFile -Raw
            $results = Parse-NmapXmlOutput -XmlContent $nmapOutput -Context $Context
            
            # Apply rate limiting between scans
            Start-Sleep -Milliseconds $config.DelayBetweenHosts
        }
        
        # Cleanup
        Remove-Item $outputFile -Force -ErrorAction SilentlyContinue
        Remove-Item "$env:TEMP\nmap_error.log" -Force -ErrorAction SilentlyContinue
        
        return $results
        
    } catch {
        Write-InfrastructureLog -Level "ERROR" -Message "❌ Production-safe nmap scan failed: $($_.Exception.Message)" -Context $Context
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
        
        foreach ($host in $nmapXml.nmaprun.host) {
            $hostInfo = [PSCustomObject]@{
                IPAddress = $host.address | Where-Object { $_.addrtype -eq "ipv4" } | Select-Object -ExpandProperty addr
                Hostname = if ($host.hostnames.hostname) { $host.hostnames.hostname.name } else { "Unknown" }
                Status = $host.status.state
                OS = ""
                OpenPorts = @()
                Services = @()
                MACAddress = ($host.address | Where-Object { $_.addrtype -eq "mac" } | Select-Object -ExpandProperty addr) -join ""
                LastSeen = Get-Date
                ScanMethod = "nmap"
            }
            
            # Parse OS information
            if ($host.os.osmatch) {
                $hostInfo.OS = $host.os.osmatch[0].name
            }
            
            # Parse ports
            if ($host.ports.port) {
                foreach ($port in $host.ports.port) {
                    if ($port.state.state -eq "open") {
                        $hostInfo.OpenPorts += [int]$port.portid
                        
                        $serviceName = if ($port.service.name) { $port.service.name } else { "unknown" }
                        $serviceVersion = if ($port.service.version) { $port.service.version } else { "" }
                        $hostInfo.Services += "$serviceName ($($port.portid))" + $(if ($serviceVersion) { " - $serviceVersion" } else { "" })
                    }
                }
            }
            
            if ($hostInfo.IPAddress) {
                $results += $hostInfo
            }
        }
        
    } catch {
        Write-InfrastructureLog -Level "ERROR" -Message "❌ Failed to parse nmap XML output: $($_.Exception.Message)" -Context $Context
    }
    
    return $results
}

function Invoke-ProductionSafePowerShellScan {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Target,
        [hashtable]$Context = @{}
    )
    
    $results = @()
    $config = Get-ProductionSafeNmapConfig -Context $Context
    
    try {
        Write-InfrastructureLog -Level "INFO" -Message "🔍 Running production-safe PowerShell scan on $Target..." -Context $Context
        
        # Test environment
        $envTest = Test-ProductionEnvironment -Context $Context
        if ($envTest.IsProduction -and $config.RequireProductionApproval) {
            Write-InfrastructureLog -Level "WARN" -Message "🚨 Production environment detected. Using minimal scanning." -Context $Context
        }
        
        # Parse subnet
        if ($Target -match '^(.+)/(\d+)$') {
            $networkAddr = $matches[1]
            $prefixLength = [int]$matches[2]
            
            # Enforce subnet size limits
            if ($prefixLength -lt $config.MaxSubnetSize) {
                Write-InfrastructureLog -Level "WARN" -Message "⚠️ Subnet $Target larger than /$($config.MaxSubnetSize) - limiting scan scope" -Context $Context
                $prefixLength = $config.MaxSubnetSize
            }
            
            # Calculate IP range with size limit
            $ipRange = Get-IPRange -Network $networkAddr -PrefixLength $prefixLength
            if ($ipRange.Count -gt 254) {
                $ipRange = $ipRange[0..253] # Limit to 254 IPs
            }
            
            Write-InfrastructureLog -Level "INFO" -Message "📊 Production-safe scan of $($ipRange.Count) IPs in subnet $Target..." -Context $Context
            
            $liveHosts = [System.Collections.Concurrent.ConcurrentBag[string]]::new()
            
            # Batch processing with rate limiting
            $batchSize = if ($envTest.IsProduction) { 10 } else { 25 }
            $batches = @()
            for ($i = 0; $i -lt $ipRange.Count; $i += $batchSize) {
                $end = [Math]::Min($i + $batchSize - 1, $ipRange.Count - 1)
                $batches += ,($ipRange[$i..$end])
            }
            
            foreach ($batch in $batches) {
                Write-InfrastructureLog -Level "DEBUG" -Message "🔍 Processing batch of $($batch.Count) IPs..." -Context $Context
                
                $batch | ForEach-Object -Parallel {
                    $ip = $_
                    $liveHostsBag = $using:liveHosts
                    
                    # Test multiple ports for better detection
                    $testPorts = @(80, 443, 135, 445, 22, 3389)
                    foreach ($port in $testPorts) {
                        if (Test-NetConnection -ComputerName $ip -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue) {
                            $liveHostsBag.Add($ip)
                            break # Found one open port, host is alive
                        }
                    }
                } -ThrottleLimit $config.ConcurrentScans
                
                # Rate limiting between batches
                Start-Sleep -Milliseconds ($config.DelayBetweenHosts * 2)
            }
            
            $liveHostArray = @($liveHosts.ToArray() | Sort-Object -Unique)
            Write-InfrastructureLog -Level "SUCCESS" -Message "✅ Found $($liveHostArray.Count) live hosts" -Context $Context
            
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
        Write-InfrastructureLog -Level "ERROR" -Message "❌ Production-safe PowerShell scan failed: $($_.Exception.Message)" -Context $Context
    }
    
    return $results
}

function Get-IPRange {
    param(
        [string]$Network,
        [int]$PrefixLength
    )
    
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
        
        if ($ipRange.Count -gt 1000) { break } # Limit scan size
    }
    
    return $ipRange
}

function Get-ComprehensiveHostInformation {
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
            LastSeen = Get-Date
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
            if ($dnsTask.Wait(5000)) { # 5 second timeout
                $hostInfo.Hostname = $dnsTask.Result.HostName
            } else {
                $hostInfo.Hostname = "Unknown (DNS timeout)"
            }
        } catch {
            $hostInfo.Hostname = "Unknown"
        }
        
        # Use safe port range in production environments
        $portRange = if ($envTest.IsProduction) { $config.SafePortRange } else { @(21, 22, 23, 25, 53, 80, 110, 135, 139, 143, 443, 445, 993, 995, 3389, 5985, 5986) }
        $openPorts = @()
        
        Write-InfrastructureLog -Level "DEBUG" -Message "🔍 Testing $($portRange.Count) ports on $IPAddress..." -Context $Context
        
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
                    $hostInfo.Services += "$($serviceInfo.Name) ($port)" + $(if ($serviceInfo.Version) { " - $($serviceInfo.Version)" } else { "" })
                    
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
        
        $hostInfo.OpenPorts = $openPorts
        
        # Device type detection
        $hostInfo.DeviceType = Get-DeviceTypeFromPorts -OpenPorts $openPorts
        
        # Try to get additional Windows-specific information if SMB is available and not in production blacklist
        if (445 -in $openPorts -and -not ($envTest.IsProduction -and 445 -in $config.BlacklistPorts)) {
            try {
                Write-InfrastructureLog -Level "DEBUG" -Message "🔍 Attempting WMI query to $IPAddress..." -Context $Context
                
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
                Write-InfrastructureLog -Level "DEBUG" -Message "WMI query failed for $IPAddress`: $($_.Exception.Message)" -Context $Context
            }
        }
        
        $hostInfo.Status = "Live"
        return $hostInfo
        
    } catch {
        Write-InfrastructureLog -Level "DEBUG" -Message "Failed to get comprehensive host info for $IPAddress`: $($_.Exception.Message)" -Context $Context
        return $null
    }
}

function Get-ServiceInformation {
    [CmdletBinding()]
    param(
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
        3389 = @{ Name = "RDP"; RiskLevel = "Medium"; Description = "Remote Desktop Protocol" }
        5985 = @{ Name = "WinRM HTTP"; RiskLevel = "Medium"; Description = "Windows Remote Management HTTP" }
        5986 = @{ Name = "WinRM HTTPS"; RiskLevel = "Low"; Description = "Windows Remote Management HTTPS" }
    }
    
    if ($serviceMap[$Port]) { 
        return $serviceMap[$Port] 
    } else { 
        return @{ Name = "Unknown"; RiskLevel = "Low"; Description = "Unknown service" } 
    }
}

function Get-DeviceTypeFromPorts {
    [CmdletBinding()]
    param(
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
    if ($OpenPorts.Count -eq 0) { return "Firewall/Router" }
    
    return "Generic Network Device"
}

function Import-ExistingAssetData {
    [CmdletBinding()]
    param(
        [string]$AssetCsvPath,
        [hashtable]$Context = @{}
    )
    
    $existingAssets = @()
    
    try {
        if (Test-Path $AssetCsvPath) {
            Write-InfrastructureLog -Level "INFO" -Message "📥 Importing existing asset data from $AssetCsvPath..." -Context $Context
            $existingAssets = Import-Csv $AssetCsvPath
            Write-InfrastructureLog -Level "SUCCESS" -Message "✅ Imported $($existingAssets.Count) existing assets" -Context $Context
        } else {
            Write-InfrastructureLog -Level "WARN" -Message "⚠️ Asset CSV not found: $AssetCsvPath" -Context $Context
        }
    } catch {
        Write-InfrastructureLog -Level "ERROR" -Message "❌ Failed to import asset data: $($_.Exception.Message)" -Context $Context
    }
    
    return $existingAssets
}

function Merge-DiscoveredWithExistingAssets {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [array]$DiscoveredHosts,
        [array]$ExistingAssets = @(),
        [hashtable]$Context = @{}
    )
    
    $mergedAssets = @()
    
    try {
        Write-InfrastructureLog -Level "INFO" -Message "🔗 Merging discovered hosts with existing asset inventory..." -Context $Context
        
        foreach ($host in $DiscoveredHosts) {
            # Find matching existing asset by IP address or hostname
            $existingAsset = $ExistingAssets | Where-Object { 
                $_.IPAddress -eq $host.IPAddress -or 
                $_.Hostname -eq $host.Hostname 
            } | Select-Object -First 1
            
            $mergedAsset = [PSCustomObject]@{
                # Discovery data
                IPAddress = $host.IPAddress
                Hostname = $host.Hostname
                OS = $host.OS
                Domain = $host.Domain
                Manufacturer = $host.Manufacturer
                Model = $host.Model
                SerialNumber = $host.SerialNumber
                Architecture = $host.Architecture
                OpenPorts = if ($host.OpenPorts) { $host.OpenPorts -join "," } else { "" }
                Services = if ($host.Services) { $host.Services -join ";" } else { "" }
                LastSeen = $host.LastSeen
                RiskLevel = $host.RiskLevel
                DeviceType = $host.DeviceType
                ScanMethod = $host.ScanMethod
                
                # Asset inventory data (if available)
                AssetTag = if ($existingAsset) { $existingAsset.AssetTag } else { "" }
                Owner = if ($existingAsset) { $existingAsset.Owner } else { "" }
                Location = if ($existingAsset) { $existingAsset.Location } else { "" }
                PurchaseDate = if ($existingAsset) { $existingAsset.PurchaseDate } else { "" }
                WarrantyExpiry = if ($existingAsset) { $existingAsset.WarrantyExpiry } else { "" }
                
                # Data quality indicators
                DataSource = if ($existingAsset) { "Discovery + Asset DB" } else { "Discovery Only" }
                Confidence = if ($existingAsset) { "High" } else { "Medium" }
                RequiresValidation = if ($existingAsset) { $false } else { $true }
            }
            
            $mergedAssets += $mergedAsset
        }
        
        # Add existing assets that weren't discovered (offline devices)
        foreach ($asset in $ExistingAssets) {
            $discovered = $DiscoveredHosts | Where-Object { 
                $_.IPAddress -eq $asset.IPAddress -or 
                $_.Hostname -eq $asset.Hostname 
            }
            
            if (-not $discovered) {
                $offlineAsset = [PSCustomObject]@{
                    # Asset inventory data
                    IPAddress = if ($asset.IPAddress) { $asset.IPAddress } else { "" }
                    Hostname = if ($asset.Hostname) { $asset.Hostname } else { "" }
                    OS = if ($asset.OS) { $asset.OS } else { "" }
                    Domain = if ($asset.Domain) { $asset.Domain } else { "" }
                    Manufacturer = if ($asset.Manufacturer) { $asset.Manufacturer } else { "" }
                    Model = if ($asset.Model) { $asset.Model } else { "" }
                    SerialNumber = if ($asset.SerialNumber) { $asset.SerialNumber } else { "" }
                    Architecture = if ($asset.Architecture) { $asset.Architecture } else { "" }
                    AssetTag = if ($asset.AssetTag) { $asset.AssetTag } else { "" }
                    Owner = if ($asset.Owner) { $asset.Owner } else { "" }
                    Location = if ($asset.Location) { $asset.Location } else { "" }
                    PurchaseDate = if ($asset.PurchaseDate) { $asset.PurchaseDate } else { "" }
                    WarrantyExpiry = if ($asset.WarrantyExpiry) { $asset.WarrantyExpiry } else { "" }
                    
                    # Discovery status
                    OpenPorts = ""
                    Services = ""
                    LastSeen = ""
                    RiskLevel = "Unknown"
                    DeviceType = "Offline/Unknown"
                    ScanMethod = "Not Scanned"
                    DataSource = "Asset DB Only"
                    Confidence = "Low"
                    RequiresValidation = $true
                }
                
                $mergedAssets += $offlineAsset
            }
        }
        
        Write-InfrastructureLog -Level "SUCCESS" -Message "✅ Merged data: $($mergedAssets.Count) total assets" -Context $Context
        Write-InfrastructureLog -Level "INFO" -Message "📊 Stats: $($DiscoveredHosts.Count) discovered, $($ExistingAssets.Count) in inventory" -Context $Context
        
    } catch {
        Write-InfrastructureLog -Level "ERROR" -Message "❌ Failed to merge asset data: $($_.Exception.Message)" -Context $Context
        return $DiscoveredHosts  # Return original discovery data on failure
    }
    
    return $mergedAssets
}

function Start-InfrastructureDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [hashtable]$Context = @{},
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-InfrastructureLog -Level "HEADER" -Message "🚀 Starting Infrastructure Discovery (v1.0 - Network Scanning)" -Context $Context
    Write-InfrastructureLog -Level "INFO" -Message "📡 Session: $SessionId | Profile: $($Configuration.ProfileName)" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    $result = [PSCustomObject]@{
        Success = $false
        RecordCount = 0
        Errors = @()
        Warnings = @()
        Metadata = @{}
        Data = @()
    }
    
    $result.PSObject.Methods.Add([PSScriptMethod]::new('AddError', {
        param($message, $context = @{})
        $this.Errors += @{ Message = $message; Context = $context; Timestamp = Get-Date }
    }))
    
    $result.PSObject.Methods.Add([PSScriptMethod]::new('AddWarning', {
        param($message, $context = @{})
        $this.Warnings += @{ Message = $message; Context = $context; Timestamp = Get-Date }
    }))
    
    $result.PSObject.Methods.Add([PSScriptMethod]::new('Complete', {
        $this.Success = $this.Errors.Count -eq 0
        $this.RecordCount = $this.Data.Count
    }))
    
    try {
        Write-InfrastructureLog -Level "HEADER" -Message "🔧 Preparing infrastructure discovery tools..." -Context $Context
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # 1. Install/locate nmap
        $nmapPath = Install-NmapIfNeeded -Context $Context
        
        # 2. Discover network subnets
        Write-InfrastructureLog -Level "INFO" -Message "🌐 Discovering network topology..." -Context $Context
        $subnets = Get-NetworkSubnets -Configuration $Configuration -Context $Context
        
        if ($subnets.Count -gt 0) {
            $subnets | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'Subnet' -Force }
            $null = $allDiscoveredData.AddRange($subnets)
            $result.Metadata["SubnetCount"] = $subnets.Count
        }
        
        # 3. Production-safe scanning of each subnet for live hosts
        $config = Get-ProductionSafeNmapConfig -Context $Context
        $envTest = Test-ProductionEnvironment -Context $Context
        
        Write-InfrastructureLog -Level "INFO" -Message "🛡️ Using production-safe scanning configuration" -Context $Context
        Write-InfrastructureLog -Level "INFO" -Message "📊 Rate limit: $($config.MaxPacketsPerSecond) pps, Delay: $($config.DelayBetweenHosts)ms" -Context $Context
        
        foreach ($subnet in $subnets) {
            if ($subnet.NetworkSubnet -and $subnet.NetworkSubnet -ne "127.0.0.0/8") {
                Write-InfrastructureLog -Level "INFO" -Message "🔍 Production-safe scanning subnet: $($subnet.NetworkSubnet)..." -Context $Context
                
                $hosts = if ($nmapPath) {
                    Invoke-ProductionSafeNmapScan -Target $subnet.NetworkSubnet -NmapPath $nmapPath -ScanType "ping" -Context $Context
                } else {
                    Invoke-ProductionSafePowerShellScan -Target $subnet.NetworkSubnet -Context $Context
                }
                
                if ($hosts.Count -gt 0) {
                    Write-InfrastructureLog -Level "SUCCESS" -Message "✅ Found $($hosts.Count) hosts in $($subnet.NetworkSubnet)" -Context $Context
                    
                    $hosts | ForEach-Object { 
                        $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'Host' -Force
                        $_ | Add-Member -NotePropertyName 'SourceSubnet' -NotePropertyValue $subnet.NetworkSubnet -Force
                        $_ | Add-Member -NotePropertyName 'ProductionSafe' -NotePropertyValue $true -Force
                    }
                    
                    $null = $allDiscoveredData.AddRange($hosts)
                } else {
                    Write-InfrastructureLog -Level "INFO" -Message "📭 No live hosts found in $($subnet.NetworkSubnet)" -Context $Context
                }
                
                # Enhanced rate limiting for production safety
                $delaySeconds = if ($envTest.IsProduction) { 5 } else { 2 }
                Write-InfrastructureLog -Level "DEBUG" -Message "⏳ Waiting $delaySeconds seconds between subnets..." -Context $Context
                Start-Sleep -Seconds $delaySeconds
            }
        }
        
        # 4. Merge with existing asset inventory if available
        $discoveredHosts = $allDiscoveredData | Where-Object { $_._DataType -eq 'Host' }
        if ($discoveredHosts.Count -gt 0) {
            # Look for existing asset CSV
            $assetCsvPath = Join-Path $Configuration.OutputDirectory "ComputerAssets.csv"
            $existingAssets = Import-ExistingAssetData -AssetCsvPath $assetCsvPath -Context $Context
            
            if ($existingAssets.Count -gt 0) {
                Write-InfrastructureLog -Level "INFO" -Message "🔗 Integrating with existing asset inventory..." -Context $Context
                $mergedAssets = Merge-DiscoveredWithExistingAssets -DiscoveredHosts $discoveredHosts -ExistingAssets $existingAssets -Context $Context
                
                # Replace discovered hosts with merged data
                $allDiscoveredData = [System.Collections.ArrayList]::new()
                $subnets = $result.Data | Where-Object { $_._DataType -eq 'Subnet' }
                if ($subnets) {
                    $null = $allDiscoveredData.AddRange($subnets)
                }
                
                $mergedAssets | ForEach-Object { 
                    $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'EnrichedHost' -Force
                }
                $null = $allDiscoveredData.AddRange($mergedAssets)
                
                Write-InfrastructureLog -Level "SUCCESS" -Message "✅ Asset integration complete: $($mergedAssets.Count) enriched records" -Context $Context
            }
        }
        
        # 5. Export data to CSV
        if ($allDiscoveredData.Count -gt 0) {
            Write-InfrastructureLog -Level "INFO" -Message "📊 Exporting $($allDiscoveredData.Count) infrastructure records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            
            # Group by type and export
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $fileName = "InfrastructureDiscovery_${dataType}.csv"
                $outputPath = Join-Path $Configuration.OutputDirectory $fileName
                
                try {
                    $exportData = $group.Group | ForEach-Object {
                        $obj = $_.PSObject.Copy()
                        $obj | Add-Member -NotePropertyName 'DiscoveredAt' -NotePropertyValue $timestamp -Force
                        $obj | Add-Member -NotePropertyName 'SessionId' -NotePropertyValue $SessionId -Force
                        $obj | Add-Member -NotePropertyName 'ProfileName' -NotePropertyValue $Configuration.ProfileName -Force
                        return $obj
                    }
                    
                    $exportData | Export-Csv -NoTypeInformation -Encoding UTF8 -Path $outputPath
                    Write-InfrastructureLog -Level "SUCCESS" -Message "✅ Exported $($group.Count) $dataType records to $fileName" -Context $Context
                    
                } catch {
                    Write-InfrastructureLog -Level "ERROR" -Message "❌ Failed to export $dataType data: $($_.Exception.Message)" -Context $Context
                    $result.AddError("Export failed for $dataType", @{FileName=$fileName})
                }
            }
        }
        
        # Set result data
        $result.Data = $allDiscoveredData.ToArray()
        $result.Metadata["TotalHosts"] = ($allDiscoveredData | Where-Object { $_._DataType -eq 'Host' }).Count
        $result.Metadata["TotalSubnets"] = ($allDiscoveredData | Where-Object { $_._DataType -eq 'Subnet' }).Count
        $result.Metadata["ScanMethod"] = if ($nmapPath) { "Production-Safe nmap + PowerShell" } else { "Production-Safe PowerShell Only" }
        $result.Metadata["ProductionEnvironment"] = $envTest.IsProduction
        $result.Metadata["ProductionSignals"] = $envTest.Signals -join ", "
        $result.Metadata["SafetyConfig"] = @{
            MaxPacketsPerSecond = $config.MaxPacketsPerSecond
            DelayBetweenHosts = $config.DelayBetweenHosts
            TimingTemplate = $config.TimingTemplate
            RequireApproval = $config.RequireProductionApproval
        }
        
        Write-InfrastructureLog -Level "INFO" -Message "🧹 Cleaning up..." -Context $Context
        
        $stopwatch.Stop()
        $result.Complete()
        Write-InfrastructureLog -Level "HEADER" -Message "🎉 Infrastructure Discovery completed in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')) - Found $($result.RecordCount) records!" -Context $Context
    }
    catch {
        $result.AddError("Infrastructure discovery failed: $($_.Exception.Message)", @{})
        Write-InfrastructureLog -Level "ERROR" -Message "❌ Infrastructure discovery failed: $($_.Exception.Message)" -Context $Context
    }

    return $result
}

# Export all functions
Export-ModuleMember -Function Start-InfrastructureDiscovery, Get-ProductionSafeNmapConfig, Test-ProductionEnvironment, Install-NmapIfNeeded, Invoke-ProductionSafeNmapScan, Invoke-ProductionSafePowerShellScan, Get-ComprehensiveHostInformation, Import-ExistingAssetData, Merge-DiscoveredWithExistingAssets, Get-ServiceInformation, Get-DeviceTypeFromPorts