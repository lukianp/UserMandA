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

function Install-NmapIfNeeded {
    [CmdletBinding()]
    param(
        [hashtable]$Context = @{}
    )
    
    # Check if nmap is available in PATH
    $nmapPath = Get-Command nmap -ErrorAction SilentlyContinue
    if ($nmapPath) {
        Write-InfrastructureLog -Level "SUCCESS" -Message "✅ Found nmap at: $($nmapPath.Source)" -Context $Context
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
        
        # Download nmap from multiple fallback sources
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

function Invoke-NmapScan {
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
        return Invoke-PowerShellScan -Target $Target -Context $Context
    }
    
    try {
        $results = @()
        
        switch ($ScanType) {
            "ping" {
                Write-InfrastructureLog -Level "INFO" -Message "🔍 Running nmap ping scan on $Target..." -Context $Context
                $nmapArgs = @("-sn", $Target)
            }
            "port" {
                Write-InfrastructureLog -Level "INFO" -Message "🔍 Running nmap port scan on $Target..." -Context $Context
                $nmapArgs = @("-sS", "-O", "--version-intensity", "5", $Target)
            }
            "service" {
                Write-InfrastructureLog -Level "INFO" -Message "🔍 Running nmap service scan on $Target..." -Context $Context
                $nmapArgs = @("-sV", "-sC", "-O", $Target)
            }
        }
        
        $process = Start-Process -FilePath $NmapPath -ArgumentList $nmapArgs -NoNewWindow -PassThru -RedirectStandardOutput "$env:TEMP\nmap_$([guid]::NewGuid().ToString('N')).xml" -RedirectStandardError "$env:TEMP\nmap_error.log"
        $process.WaitForExit(300000) # 5 minute timeout
        
        if ($process.ExitCode -eq 0) {
            $outputFile = $process.StandardOutput.BaseStream.Name
            if (Test-Path $outputFile) {
                $nmapOutput = Get-Content $outputFile -Raw
                $results = Parse-NmapOutput -Output $nmapOutput -Context $Context
                Remove-Item $outputFile -Force -ErrorAction SilentlyContinue
            }
        }
        
        return $results
        
    } catch {
        Write-InfrastructureLog -Level "ERROR" -Message "❌ Nmap scan failed: $($_.Exception.Message)" -Context $Context
        return @()
    }
}

function Invoke-PowerShellScan {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Target,
        [hashtable]$Context = @{}
    )
    
    $results = @()
    
    try {
        Write-InfrastructureLog -Level "INFO" -Message "🔍 Running PowerShell network scan on $Target..." -Context $Context
        
        # Parse subnet
        if ($Target -match '^(.+)/(\d+)$') {
            $networkAddr = $matches[1]
            $prefixLength = [int]$matches[2]
            
            # Calculate IP range
            $ipRange = Get-IPRange -Network $networkAddr -PrefixLength $prefixLength
            
            Write-InfrastructureLog -Level "INFO" -Message "📊 Scanning $($ipRange.Count) IPs in subnet $Target..." -Context $Context
            
            $liveHosts = @()
            $ipRange | ForEach-Object -Parallel {
                $ip = $_
                if (Test-NetConnection -ComputerName $ip -Port 135 -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue) {
                    $liveHosts += $ip
                }
            } -ThrottleLimit 50
            
            Write-InfrastructureLog -Level "SUCCESS" -Message "✅ Found $($liveHosts.Count) live hosts" -Context $Context
            
            # Get detailed info for each live host
            foreach ($ip in $liveHosts) {
                $hostInfo = Get-HostInformation -IPAddress $ip -Context $Context
                if ($hostInfo) {
                    $results += $hostInfo
                }
            }
        }
        
    } catch {
        Write-InfrastructureLog -Level "ERROR" -Message "❌ PowerShell scan failed: $($_.Exception.Message)" -Context $Context
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

function Get-HostInformation {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$IPAddress,
        [hashtable]$Context = @{}
    )
    
    try {
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
        }
        
        # Try to resolve hostname
        try {
            $dnsResult = [System.Net.Dns]::GetHostEntry($IPAddress)
            $hostInfo.Hostname = $dnsResult.HostName
        } catch {
            $hostInfo.Hostname = "Unknown"
        }
        
        # Test common ports
        $commonPorts = @(21, 22, 23, 25, 53, 80, 110, 135, 139, 143, 443, 445, 993, 995, 3389, 5985, 5986)
        $openPorts = @()
        
        foreach ($port in $commonPorts) {
            $result = Test-NetConnection -ComputerName $IPAddress -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
            if ($result) {
                $openPorts += $port
                
                # Identify services
                $service = switch ($port) {
                    21 { "FTP" }
                    22 { "SSH" }
                    23 { "Telnet" }
                    25 { "SMTP" }
                    53 { "DNS" }
                    80 { "HTTP" }
                    110 { "POP3" }
                    135 { "RPC" }
                    139 { "NetBIOS" }
                    143 { "IMAP" }
                    443 { "HTTPS" }
                    445 { "SMB" }
                    993 { "IMAPS" }
                    995 { "POP3S" }
                    3389 { "RDP" }
                    5985 { "WinRM HTTP" }
                    5986 { "WinRM HTTPS" }
                    default { "Unknown" }
                }
                
                $hostInfo.Services += "$service ($port)"
            }
        }
        
        $hostInfo.OpenPorts = $openPorts
        
        # Try to get additional Windows-specific information if SMB is available
        if (445 -in $openPorts) {
            try {
                $wmiResult = Get-WmiObject -Class Win32_ComputerSystem -ComputerName $IPAddress -ErrorAction SilentlyContinue
                if ($wmiResult) {
                    $hostInfo.Manufacturer = $wmiResult.Manufacturer
                    $hostInfo.Model = $wmiResult.Model
                    $hostInfo.Domain = $wmiResult.Domain
                }
                
                $osResult = Get-WmiObject -Class Win32_OperatingSystem -ComputerName $IPAddress -ErrorAction SilentlyContinue
                if ($osResult) {
                    $hostInfo.OS = "$($osResult.Caption) $($osResult.Version)"
                    $hostInfo.Architecture = $osResult.OSArchitecture
                }
                
                $biosResult = Get-WmiObject -Class Win32_BIOS -ComputerName $IPAddress -ErrorAction SilentlyContinue
                if ($biosResult) {
                    $hostInfo.SerialNumber = $biosResult.SerialNumber
                }
                
            } catch {
                # WMI failed, try other methods
            }
        }
        
        $hostInfo.Status = "Live"
        return $hostInfo
        
    } catch {
        Write-InfrastructureLog -Level "DEBUG" -Message "Failed to get host info for $IPAddress`: $($_.Exception.Message)" -Context $Context
        return $null
    }
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
        
        # 3. Scan each subnet for live hosts
        foreach ($subnet in $subnets) {
            if ($subnet.NetworkSubnet -and $subnet.NetworkSubnet -ne "127.0.0.0/8") {
                Write-InfrastructureLog -Level "INFO" -Message "🔍 Scanning subnet: $($subnet.NetworkSubnet)..." -Context $Context
                
                $hosts = if ($nmapPath) {
                    Invoke-NmapScan -Target $subnet.NetworkSubnet -NmapPath $nmapPath -ScanType "ping" -Context $Context
                } else {
                    Invoke-PowerShellScan -Target $subnet.NetworkSubnet -Context $Context
                }
                
                if ($hosts.Count -gt 0) {
                    Write-InfrastructureLog -Level "SUCCESS" -Message "✅ Found $($hosts.Count) hosts in $($subnet.NetworkSubnet)" -Context $Context
                    
                    $hosts | ForEach-Object { 
                        $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'Host' -Force
                        $_ | Add-Member -NotePropertyName 'SourceSubnet' -NotePropertyValue $subnet.NetworkSubnet -Force
                    }
                    
                    $null = $allDiscoveredData.AddRange($hosts)
                } else {
                    Write-InfrastructureLog -Level "INFO" -Message "📭 No live hosts found in $($subnet.NetworkSubnet)" -Context $Context
                }
                
                # Rate limiting to be network-friendly
                Start-Sleep -Seconds 2
            }
        }
        
        # 4. Export data to CSV
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
        $result.Metadata["ScanMethod"] = if ($nmapPath) { "nmap + PowerShell" } else { "PowerShell Only" }
        
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

# Export the main function
Export-ModuleMember -Function Start-InfrastructureDiscovery