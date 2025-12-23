# Download nmap ZIP distribution and extract to embedded location
$tempDir = Join-Path $env:TEMP 'nmap-zip-download'
$targetDir = "D:\Scripts\UserMandA\Tools\nmap"

Write-Host "Creating directories..."
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

$nmapZipUrl = 'https://nmap.org/dist/nmap-7.98-win32.zip'
$zipPath = Join-Path $tempDir 'nmap-7.98-win32.zip'

Write-Host 'Downloading nmap 7.98 ZIP from official source...'
try {
    Invoke-WebRequest -Uri $nmapZipUrl -OutFile $zipPath -UseBasicParsing
    if (Test-Path $zipPath) {
        $fileSize = (Get-Item $zipPath).Length
        Write-Host "Downloaded nmap ZIP: $fileSize bytes"
        
        # Extract ZIP
        Write-Host "Extracting nmap ZIP..."
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::ExtractToDirectory($zipPath, $tempDir)
        
        # Find the nmap directory in extracted files
        $nmapDir = Get-ChildItem -Path $tempDir -Directory | Where-Object { $_.Name -like "*nmap*" } | Select-Object -First 1
        if ($nmapDir) {
            $sourceDir = $nmapDir.FullName
            Write-Host "Found nmap directory: $sourceDir"
            
            # Copy all files to target directory
            Copy-Item -Path "$sourceDir\*" -Destination $targetDir -Recurse -Force
            
            Write-Host "`nEmbedded nmap files:"
            Get-ChildItem -Path $targetDir | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
            
            # Test nmap executable
            $nmapPath = Join-Path $targetDir "nmap.exe"
            if (Test-Path $nmapPath) {
                Write-Host "`nTesting nmap executable..."
                try {
                    $output = & $nmapPath --version
                    Write-Host "nmap version test successful:"
                    Write-Host $output
                    
                    # Get file size of nmap.exe
                    $nmapSize = (Get-Item $nmapPath).Length
                    Write-Host "`nnmap.exe file size: $nmapSize bytes"
                    
                } catch {
                    Write-Warning "nmap executable test failed: $_"
                }
            }
        } else {
            Write-Error "Could not find nmap directory in extracted files"
        }
    }
} catch {
    Write-Error "Failed to download/extract nmap: $_"
} finally {
    # Clean up temp directory
    if (Test-Path $tempDir) {
        Remove-Item -Path $tempDir -Recurse -Force
    }
}

Write-Host "`nnmap embedding complete. Real nmap.exe embedded at: $targetDir"