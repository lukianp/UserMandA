#Requires -Version 5.1

<#
.SYNOPSIS
    Downloads and embeds nmap binaries for production deployment

.DESCRIPTION
    This script downloads the official nmap Windows binaries and embeds them in the
    M&A Discovery Suite for self-contained Infrastructure Discovery capabilities.
    
    The embedded nmap enables production-safe network scanning without requiring
    external dependencies or internet access during discovery operations.

.NOTES
    Version: 1.0.0
    Author: Master Orchestrator
    Created: 2025-08-30
    Requires: PowerShell 5.1+, Internet access for initial download
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$NmapVersion = "7.98",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

$ErrorActionPreference = 'Stop'

function Write-SetupLog {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $color = switch ($Level) {
        'ERROR' { 'Red' }
        'WARN' { 'Yellow' }
        'SUCCESS' { 'Green' }
        'HEADER' { 'Cyan' }
        default { 'White' }
    }
    
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Test-ExistingNmap {
    param([string]$NmapDir)
    
    $nmapExe = Join-Path $NmapDir "nmap.exe"
    $requiredFiles = @("nmap.exe", "nmap-service-probes", "nmap-services", "nmap-protocols")
    
    if (-not (Test-Path $nmapExe)) {
        return $false
    }
    
    # Check file size (real nmap.exe should be several MB)
    $fileSize = (Get-Item $nmapExe).Length
    if ($fileSize -lt 1000000) { # Less than 1MB is likely placeholder
        return $false
    }
    
    # Check for required support files
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path (Join-Path $NmapDir $file))) {
            Write-SetupLog "Missing required file: $file" "WARN"
            return $false
        }
    }
    
    return $true
}

function Download-NmapBinary {
    param(
        [string]$Version,
        [string]$DestinationDir
    )
    
    Write-SetupLog "Downloading nmap v$Version for Windows..." "HEADER"
    
    # Official nmap download URLs (try multiple versions and sources)
    $nmapUrls = @(
        "https://nmap.org/dist/nmap-$Version-win32.zip",
        "https://nmap.org/dist/nmap-7.95-win32.zip",
        "https://nmap.org/dist/nmap-7.94-win32.zip", 
        "https://nmap.org/dist/nmap-7.93-win32.zip",
        "https://github.com/nmap/nmap/releases/download/v$Version/nmap-$Version-win32.zip",
        "https://github.com/nmap/nmap/releases/download/v7.95/nmap-7.95-win32.zip",
        "https://github.com/nmap/nmap/releases/download/v7.94/nmap-7.94-win32.zip"
    )
    
    $tempDir = Join-Path $env:TEMP "nmap-setup-$(Get-Random)"
    $downloadFile = Join-Path $tempDir "nmap-$Version.zip"
    
    try {
        # Create temp directory
        New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
        
        # Try downloading from each source
        $downloadSuccess = $false
        foreach ($url in $nmapUrls) {
            try {
                Write-SetupLog "Trying download from: $url" "INFO"
                
                # Use TLS 1.2 and bypass SSL certificate validation if needed
                [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
                
                # First try with standard SSL validation
                try {
                    Invoke-WebRequest -Uri $url -OutFile $downloadFile -UseBasicParsing -TimeoutSec 60 -UserAgent "M&A-Discovery-Suite/1.0"
                } catch {
                    Write-SetupLog "Standard download failed, trying with relaxed SSL validation..." "WARN"
                    
                    # Temporarily bypass SSL validation for problematic certificates
                    $originalCallback = [System.Net.ServicePointManager]::ServerCertificateValidationCallback
                    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
                    
                    try {
                        Invoke-WebRequest -Uri $url -OutFile $downloadFile -UseBasicParsing -TimeoutSec 60 -UserAgent "M&A-Discovery-Suite/1.0"
                    } finally {
                        # Restore original SSL validation
                        [System.Net.ServicePointManager]::ServerCertificateValidationCallback = $originalCallback
                    }
                }
                
                # Verify download
                if ((Test-Path $downloadFile) -and (Get-Item $downloadFile).Length -gt 10000000) { # At least 10MB
                    Write-SetupLog "Successfully downloaded nmap from: $url" "SUCCESS"
                    Write-SetupLog "Downloaded file size: $([math]::Round((Get-Item $downloadFile).Length / 1MB, 2)) MB" "INFO"
                    $downloadSuccess = $true
                    break
                } else {
                    Write-SetupLog "Download incomplete from: $url" "WARN"
                    Remove-Item $downloadFile -Force -ErrorAction SilentlyContinue
                }
            } catch {
                Write-SetupLog "Download failed from $url`: $($_.Exception.Message)" "WARN"
                Remove-Item $downloadFile -Force -ErrorAction SilentlyContinue
            }
        }
        
        if (-not $downloadSuccess) {
            throw "All nmap download sources failed"
        }
        
        # Extract nmap
        Write-SetupLog "Extracting nmap archive..." "INFO"
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        
        $extractDir = Join-Path $tempDir "extracted"
        [System.IO.Compression.ZipFile]::ExtractToDirectory($downloadFile, $extractDir)
        
        # Find nmap folder in extraction
        $nmapFolder = Get-ChildItem -Path $extractDir -Directory | Where-Object { $_.Name -like "*nmap*" } | Select-Object -First 1
        
        if (-not $nmapFolder) {
            throw "Could not find nmap folder in extracted archive"
        }
        
        $nmapSourcePath = $nmapFolder.FullName
        Write-SetupLog "Found nmap installation at: $nmapSourcePath" "SUCCESS"
        
        # Verify essential files exist
        $nmapExe = Join-Path $nmapSourcePath "nmap.exe"
        if (-not (Test-Path $nmapExe)) {
            throw "nmap.exe not found in extracted archive"
        }
        
        # Copy to destination
        Write-SetupLog "Installing nmap to: $DestinationDir" "INFO"
        
        if (Test-Path $DestinationDir) {
            Remove-Item -Path $DestinationDir -Recurse -Force
        }
        New-Item -ItemType Directory -Path $DestinationDir -Force | Out-Null
        
        # Copy all files
        Copy-Item -Path "$nmapSourcePath\*" -Destination $DestinationDir -Recurse -Force
        
        # Verify installation
        $installedNmap = Join-Path $DestinationDir "nmap.exe"
        if (-not (Test-Path $installedNmap)) {
            throw "nmap installation verification failed"
        }
        
        # Get version info
        try {
            $versionOutput = & $installedNmap --version 2>&1 | Select-Object -First 1
            Write-SetupLog "Installed nmap: $versionOutput" "SUCCESS"
        } catch {
            Write-SetupLog "nmap installed but version check failed" "WARN"
        }
        
        # List installed files
        $installedFiles = Get-ChildItem -Path $DestinationDir -File | Measure-Object
        Write-SetupLog "Installed $($installedFiles.Count) nmap files ($(([math]::Round((Get-ChildItem -Path $DestinationDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB, 2))) MB total)" "INFO"
        
        return $true
        
    } finally {
        # Cleanup temp directory
        if (Test-Path $tempDir) {
            Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

# Main script execution
try {
    Write-SetupLog "Setting up embedded nmap for M&A Discovery Suite..." "HEADER"
    
    $nmapDir = $PSScriptRoot
    Write-SetupLog "Target directory: $nmapDir" "INFO"
    
    # Check if nmap is already properly installed
    if (-not $Force -and (Test-ExistingNmap -NmapDir $nmapDir)) {
        Write-SetupLog "nmap is already properly installed and verified" "SUCCESS"
        
        # Show current installation info
        $nmapExe = Join-Path $nmapDir "nmap.exe"
        try {
            $versionOutput = & $nmapExe --version 2>&1 | Select-Object -First 1
            Write-SetupLog "Current installation: $versionOutput" "INFO"
        } catch { }
        
        $fileCount = (Get-ChildItem -Path $nmapDir -File | Measure-Object).Count
        $totalSize = [math]::Round((Get-ChildItem -Path $nmapDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
        Write-SetupLog "Installation contains $fileCount files ($totalSize MB total)" "INFO"
        
        Write-SetupLog "Use -Force parameter to reinstall" "INFO"
        exit 0
    }
    
    # Download and install nmap
    if (Download-NmapBinary -Version $NmapVersion -DestinationDir $nmapDir) {
        Write-SetupLog "nmap embedded successfully for production deployment!" "SUCCESS"
        Write-SetupLog "Infrastructure Discovery will use embedded nmap for production-safe scanning" "INFO"
    } else {
        throw "nmap installation failed"
    }
    
} catch {
    Write-SetupLog "Setup failed: $($_.Exception.Message)" "ERROR"
    Write-SetupLog "Infrastructure Discovery will fall back to PowerShell-only scanning" "WARN"
    exit 1
}