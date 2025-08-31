# Download-NmapInstallers.ps1
# Downloads official nmap and npcap installers for silent installation

[CmdletBinding()]
param(
    [string]$DestinationPath = "$PSScriptRoot\Installers",
    [switch]$Force,
    [switch]$VerifySignatures
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Write-DownloadLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $(
        switch ($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "SUCCESS" { "Green" }
            default { "Cyan" }
        }
    )
}

function Get-NmapDownloadUrl {
    try {
        Write-DownloadLog "Fetching latest nmap download URL from nmap.org..."
        
        # Get the latest nmap version info
        $response = Invoke-WebRequest -Uri "https://nmap.org/download.html" -UseBasicParsing
        
        # Look for the Windows installer download link
        $downloadPattern = 'href="([^"]*nmap-[\d\.]+-setup\.exe)"'
        $match = [regex]::Match($response.Content, $downloadPattern)
        
        if ($match.Success) {
            $relativeUrl = $match.Groups[1].Value
            if ($relativeUrl.StartsWith('/')) {
                return "https://nmap.org$relativeUrl"
            } elseif ($relativeUrl.StartsWith('http')) {
                return $relativeUrl
            } else {
                return "https://nmap.org/$relativeUrl"
            }
        }
        
        # Fallback to known pattern
        Write-DownloadLog "Could not parse latest URL, using fallback pattern" -Level WARN
        return "https://nmap.org/dist/nmap-7.95-setup.exe"
        
    } catch {
        Write-DownloadLog "Error fetching nmap URL: $($_.Exception.Message)" -Level ERROR
        # Fallback to known working version
        return "https://nmap.org/dist/nmap-7.95-setup.exe"
    }
}

function Get-NpcapDownloadUrl {
    try {
        Write-DownloadLog "Fetching latest npcap download URL from npcap.com..."
        
        # Get the latest npcap version
        $response = Invoke-WebRequest -Uri "https://npcap.com/" -UseBasicParsing
        
        # Look for download link pattern
        $downloadPattern = 'href="([^"]*npcap-[\d\.]]+\.exe)"'
        $match = [regex]::Match($response.Content, $downloadPattern)
        
        if ($match.Success) {
            $relativeUrl = $match.Groups[1].Value
            if ($relativeUrl.StartsWith('/')) {
                return "https://npcap.com$relativeUrl"
            } elseif ($relativeUrl.StartsWith('http')) {
                return $relativeUrl
            } else {
                return "https://npcap.com/$relativeUrl"
            }
        }
        
        # Fallback to direct download URL pattern
        Write-DownloadLog "Could not parse latest npcap URL, trying distribution page" -Level WARN
        
        $distResponse = Invoke-WebRequest -Uri "https://npcap.com/dist/" -UseBasicParsing
        $distMatch = [regex]::Match($distResponse.Content, 'href="(npcap-[\d\.]+\.exe)"')
        
        if ($distMatch.Success) {
            return "https://npcap.com/dist/$($distMatch.Groups[1].Value)"
        }
        
        # Final fallback
        return "https://npcap.com/dist/npcap-1.83.exe"
        
    } catch {
        Write-DownloadLog "Error fetching npcap URL: $($_.Exception.Message)" -Level ERROR
        return "https://npcap.com/dist/npcap-1.83.exe"
    }
}

function Download-File {
    param(
        [string]$Url,
        [string]$OutputPath,
        [string]$FileName
    )
    
    $fullPath = Join-Path $OutputPath $FileName
    
    if ((Test-Path $fullPath) -and -not $Force) {
        Write-DownloadLog "File already exists: $FileName (use -Force to re-download)"
        return $fullPath
    }
    
    Write-DownloadLog "Downloading: $Url"
    Write-DownloadLog "Destination: $fullPath"
    
    try {
        # Use Invoke-WebRequest for reliable downloading
        Invoke-WebRequest -Uri $Url -OutFile $fullPath -UseBasicParsing
        
        # Verify download
        if (Test-Path $fullPath) {
            $size = (Get-Item $fullPath).Length
            Write-DownloadLog "Download completed: $FileName ($([math]::Round($size/1MB,2)) MB)" -Level SUCCESS
            return $fullPath
        } else {
            throw "Downloaded file not found: $fullPath"
        }
        
    } catch {
        Write-DownloadLog "Download failed: $($_.Exception.Message)" -Level ERROR
        if (Test-Path $fullPath) {
            Remove-Item $fullPath -Force
        }
        throw
    }
}

function Verify-FileSignature {
    param([string]$FilePath)
    
    if (-not $VerifySignatures) {
        return $true
    }
    
    try {
        Write-DownloadLog "Verifying digital signature: $(Split-Path $FilePath -Leaf)"
        
        $signature = Get-AuthenticodeSignature $FilePath
        
        switch ($signature.Status) {
            "Valid" {
                Write-DownloadLog "✅ Signature valid: $($signature.SignerCertificate.Subject)" -Level SUCCESS
                return $true
            }
            "NotSigned" {
                Write-DownloadLog "⚠️ File is not digitally signed" -Level WARN
                return $true  # Allow unsigned files with warning
            }
            default {
                Write-DownloadLog "❌ Invalid signature: $($signature.Status) - $($signature.StatusMessage)" -Level ERROR
                return $false
            }
        }
    } catch {
        Write-DownloadLog "Signature verification failed: $($_.Exception.Message)" -Level WARN
        return $true  # Allow if verification fails
    }
}

# Main execution
Write-DownloadLog "=== nmap/npcap Installer Download Started ==="
Write-DownloadLog "Destination: $DestinationPath"

# Ensure destination directory exists
if (-not (Test-Path $DestinationPath)) {
    New-Item -Path $DestinationPath -ItemType Directory -Force | Out-Null
    Write-DownloadLog "Created directory: $DestinationPath"
}

$downloadResults = @{
    NmapSuccess = $false
    NpcapSuccess = $false
    NmapPath = $null
    NpcapPath = $null
    DownloadErrors = @()
}

# Download nmap installer
try {
    $nmapUrl = Get-NmapDownloadUrl
    $nmapFileName = Split-Path $nmapUrl -Leaf
    
    $nmapPath = Download-File -Url $nmapUrl -OutputPath $DestinationPath -FileName $nmapFileName
    
    if (Verify-FileSignature $nmapPath) {
        $downloadResults.NmapSuccess = $true
        $downloadResults.NmapPath = $nmapPath
        Write-DownloadLog "✅ nmap installer ready: $nmapPath" -Level SUCCESS
    } else {
        $downloadResults.DownloadErrors += "nmap signature verification failed"
    }
    
} catch {
    $error = "nmap download failed: $($_.Exception.Message)"
    $downloadResults.DownloadErrors += $error
    Write-DownloadLog $error -Level ERROR
}

# Download npcap installer  
try {
    $npcapUrl = Get-NpcapDownloadUrl
    $npcapFileName = Split-Path $npcapUrl -Leaf
    
    $npcapPath = Download-File -Url $npcapUrl -OutputPath $DestinationPath -FileName $npcapFileName
    
    if (Verify-FileSignature $npcapPath) {
        $downloadResults.NpcapSuccess = $true
        $downloadResults.NpcapPath = $npcapPath
        Write-DownloadLog "✅ npcap installer ready: $npcapPath" -Level SUCCESS
    } else {
        $downloadResults.DownloadErrors += "npcap signature verification failed"
    }
    
} catch {
    $error = "npcap download failed: $($_.Exception.Message)"
    $downloadResults.DownloadErrors += $error
    Write-DownloadLog $error -Level ERROR
}

# Summary
Write-DownloadLog "=== Download Summary ==="
Write-DownloadLog "nmap: $(if ($downloadResults.NmapSuccess) { '✅ Success' } else { '❌ Failed' })"
Write-DownloadLog "npcap: $(if ($downloadResults.NpcapSuccess) { '✅ Success' } else { '❌ Failed' })"

if ($downloadResults.DownloadErrors.Count -gt 0) {
    Write-DownloadLog "Errors encountered:" -Level WARN
    $downloadResults.DownloadErrors | ForEach-Object { Write-DownloadLog "  - $_" -Level WARN }
}

# List downloaded files
$installerFiles = Get-ChildItem -Path $DestinationPath -Filter "*.exe" | Sort-Object Name
if ($installerFiles) {
    Write-DownloadLog "Available installers:"
    foreach ($file in $installerFiles) {
        $sizeMB = [math]::Round($file.Length/1MB, 2)
        Write-DownloadLog "  - $($file.Name) ($sizeMB MB)"
    }
}

Write-DownloadLog "=== Download Complete ==="

return $downloadResults