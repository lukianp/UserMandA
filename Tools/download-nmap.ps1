# Download nmap 7.98 official installer
$tempDir = Join-Path $env:TEMP 'nmap-download'
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

$nmapUrl = 'https://nmap.org/dist/nmap-7.98-setup.exe'
$installerPath = Join-Path $tempDir 'nmap-7.98-setup.exe'

Write-Host 'Downloading nmap 7.98 installer from official source...'
try {
    Invoke-WebRequest -Uri $nmapUrl -OutFile $installerPath -UseBasicParsing
    if (Test-Path $installerPath) {
        $fileSize = (Get-Item $installerPath).Length
        Write-Host "Downloaded nmap installer: $fileSize bytes"
        Write-Host "Installer saved to: $installerPath"
        Get-Item $installerPath | Select-Object Name, Length, LastWriteTime
        
        # Return the path for use in extraction
        return $installerPath
    }
} catch {
    Write-Error "Failed to download nmap: $_"
}