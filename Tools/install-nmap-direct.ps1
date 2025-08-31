# Install nmap directly and copy files to embedded location
param(
    [string]$InstallerPath = "C:\Users\lukia\AppData\Local\Temp\nmap-download\nmap-7.98-setup.exe"
)

$targetDir = "D:\Scripts\UserMandA\Tools\nmap"
$installDir = "${env:ProgramFiles(x86)}\Nmap"
$installDir64 = "${env:ProgramFiles}\Nmap"

Write-Host "Creating target directory..."
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

# Check if nmap is already installed
$nmapInstalled = $false
if (Test-Path "$installDir\nmap.exe") {
    $nmapInstalled = $true
    $sourceDir = $installDir
    Write-Host "Found existing nmap installation at: $installDir"
} elseif (Test-Path "$installDir64\nmap.exe") {
    $nmapInstalled = $true  
    $sourceDir = $installDir64
    Write-Host "Found existing nmap installation at: $installDir64"
}

if (-not $nmapInstalled) {
    Write-Host "Installing nmap using installer..."
    try {
        # Run the installer silently
        $process = Start-Process -FilePath $InstallerPath -ArgumentList "/S" -Wait -PassThru
        Write-Host "Installer completed with exit code: $($process.ExitCode)"
        
        # Wait a moment for installation to complete
        Start-Sleep -Seconds 3
        
        # Check installation locations
        if (Test-Path "$installDir\nmap.exe") {
            $sourceDir = $installDir
        } elseif (Test-Path "$installDir64\nmap.exe") {
            $sourceDir = $installDir64
        } else {
            Write-Error "nmap installation failed - executable not found"
            return
        }
    } catch {
        Write-Error "Failed to run installer: $_"
        return
    }
}

Write-Host "Copying nmap files from: $sourceDir"

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

# Also copy required DLL files
$dllFiles = Get-ChildItem -Path $sourceDir -Filter "*.dll" -ErrorAction SilentlyContinue
foreach ($dll in $dllFiles) {
    $destPath = Join-Path $targetDir $dll.Name
    Copy-Item -Path $dll.FullName -Destination $destPath -Force
    Write-Host "Copied DLL: $($dll.Name)"
}

Write-Host "`nEmbedded nmap files:"
if (Test-Path $targetDir) {
    Get-ChildItem -Path $targetDir | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
}

# Test nmap executable
$nmapPath = Join-Path $targetDir "nmap.exe"
if (Test-Path $nmapPath) {
    Write-Host "`nTesting nmap executable..."
    try {
        $output = & $nmapPath --version
        Write-Host "nmap version test successful:"
        Write-Host $output
    } catch {
        Write-Warning "nmap executable test failed: $_"
    }
}

Write-Host "`nnmap embedding complete. Files available at: $targetDir"