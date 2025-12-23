# Extract nmap binaries from installer
param(
    [string]$InstallerPath = "C:\Users\lukia\AppData\Local\Temp\nmap-download\nmap-7.98-setup.exe"
)

$extractDir = Join-Path $env:TEMP 'nmap-extract'
$targetDir = "D:\Scripts\UserMandA\Tools\nmap"

Write-Host "Creating extraction directories..."
New-Item -ItemType Directory -Force -Path $extractDir | Out-Null
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

Write-Host "Extracting nmap installer using 7zip..."
try {
    # Try to extract using 7zip (if available)
    $sevenZipPath = "${env:ProgramFiles}\7-Zip\7z.exe"
    if (Test-Path $sevenZipPath) {
        & $sevenZipPath x $InstallerPath -o"$extractDir" -y
        Write-Host "Extraction completed with 7zip"
    } else {
        # Fallback: Run installer silently to a temp directory
        Write-Host "7zip not found, running installer silently..."
        $installTempDir = Join-Path $env:TEMP 'nmap-install'
        Start-Process -FilePath $InstallerPath -ArgumentList "/S", "/D=$installTempDir" -Wait
        
        if (Test-Path $installTempDir) {
            Copy-Item -Path "$installTempDir\*" -Destination $extractDir -Recurse -Force
            Remove-Item -Path $installTempDir -Recurse -Force
        }
    }
    
    Write-Host "Looking for nmap.exe and required files..."
    
    # Find nmap.exe in extracted files
    $nmapExe = Get-ChildItem -Path $extractDir -Name "nmap.exe" -Recurse | Select-Object -First 1
    if ($nmapExe) {
        $nmapPath = Get-ChildItem -Path $extractDir -Filter "nmap.exe" -Recurse | Select-Object -First 1
        $sourceDir = $nmapPath.Directory.FullName
        
        Write-Host "Found nmap.exe at: $sourceDir"
        
        # Copy essential nmap files to target directory
        $essentialFiles = @(
            "nmap.exe",
            "nmap-service-probes",
            "nmap-services",
            "nmap-os-db",
            "nmap-payloads",
            "nmap-protocols",
            "nmap-rpc"
        )
        
        foreach ($file in $essentialFiles) {
            $sourcePath = Join-Path $sourceDir $file
            $destPath = Join-Path $targetDir $file
            
            if (Test-Path $sourcePath) {
                Copy-Item -Path $sourcePath -Destination $destPath -Force
                Write-Host "Copied: $file"
                
                if ($file -eq "nmap.exe") {
                    $fileInfo = Get-Item $destPath
                    Write-Host "nmap.exe size: $($fileInfo.Length) bytes"
                }
            } else {
                Write-Warning "File not found: $file"
            }
        }
        
        # Also copy any DLL files that might be needed
        $dllFiles = Get-ChildItem -Path $sourceDir -Filter "*.dll" | Where-Object { $_.Name -notlike "*msvc*" -and $_.Name -notlike "*api-*" }
        foreach ($dll in $dllFiles) {
            $destPath = Join-Path $targetDir $dll.Name
            Copy-Item -Path $dll.FullName -Destination $destPath -Force
            Write-Host "Copied DLL: $($dll.Name)"
        }
        
        Write-Host "`nEmbedded nmap files:"
        Get-ChildItem -Path $targetDir | Select-Object Name, Length, LastWriteTime
        
    } else {
        Write-Error "Could not find nmap.exe in extracted files"
    }
    
} catch {
    Write-Error "Failed to extract nmap: $_"
} finally {
    # Clean up extraction directory
    if (Test-Path $extractDir) {
        Remove-Item -Path $extractDir -Recurse -Force
    }
}

Write-Host "nmap extraction complete. Files embedded in: $targetDir"