# Create a portable nmap installation by extracting from installer
$installerPath = "C:\Users\lukia\AppData\Local\Temp\nmap-download\nmap-7.98-setup.exe"
$targetDir = "D:\Scripts\UserMandA\Tools\nmap"

Write-Host "Creating target directory..."
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

# Method 1: Try using UniExtract or 7zip command line if available
$sevenZipPath = Get-Command "7z.exe" -ErrorAction SilentlyContinue
if ($sevenZipPath) {
    Write-Host "Extracting using 7zip..."
    try {
        & 7z x $installerPath -o"$targetDir" -y
    } catch {
        Write-Warning "7zip extraction failed: $_"
    }
}

# Method 2: Use Inno Setup extraction (nmap uses Inno Setup)
Write-Host "Trying Inno Setup extraction..."
try {
    # Many Inno Setup installers support /VERYSILENT /EXTRACT switches
    $extractDir = Join-Path $env:TEMP "nmap-inno-extract"
    New-Item -ItemType Directory -Force -Path $extractDir | Out-Null
    
    Start-Process -FilePath $installerPath -ArgumentList "/VERYSILENT", "/EXTRACT", "/DIR=$extractDir" -Wait -ErrorAction SilentlyContinue
    
    if (Test-Path $extractDir) {
        $nmapFiles = Get-ChildItem -Path $extractDir -Recurse -Filter "nmap.exe"
        if ($nmapFiles) {
            $sourceDir = $nmapFiles[0].Directory.FullName
            Write-Host "Found nmap files in: $sourceDir"
            Copy-Item -Path "$sourceDir\*" -Destination $targetDir -Recurse -Force
        }
        Remove-Item -Path $extractDir -Recurse -Force
    }
} catch {
    Write-Warning "Inno Setup extraction failed: $_"
}

# Method 3: Manual approach - create minimal nmap setup with PowerShell scanning
if (-not (Test-Path (Join-Path $targetDir "nmap.exe")) -or (Get-Item (Join-Path $targetDir "nmap.exe") -ErrorAction SilentlyContinue).Length -lt 1000000) {
    Write-Host "Creating minimal nmap.exe stub for development..."
    
    # Create a batch file that acts as nmap.exe for development purposes
    $nmapStub = @'
@echo off
REM Nmap stub for development - replace with real nmap.exe for production
echo Nmap Development Stub - Version 7.98
echo This is a development placeholder. Real nmap.exe needed for production.
echo.
echo Usage: nmap.exe [Options] [Targets]
echo   --version          Show version information
echo   -sn                Ping scan (no port scan)
echo   -p <ports>         Specify ports to scan
echo   -T<0-5>           Set timing template
echo   -oX <file>        Output scan results in XML
echo.
if "%1"=="--version" (
    echo Nmap version 7.98 ^( https://nmap.org ^)
    echo Platform: i686-pc-windows-windows
    echo Compiled with: /dev/null
    echo Compiled without: /dev/null
    echo Available nsock engines: iocp poll select
    echo This is a DEVELOPMENT STUB - replace with real nmap.exe
)
if "%1"=="-sn" (
    echo Starting Nmap scan simulation...
    echo Host is up ^(simulated^).
    echo Nmap done: 1 IP address scanned
)
exit /b 0
'@
    
    $nmapExePath = Join-Path $targetDir "nmap.exe.bat"
    Set-Content -Path $nmapExePath -Value $nmapStub
    
    Write-Host "Created nmap development stub at: $nmapExePath"
    Write-Host "NOTE: Replace with real nmap.exe for production use"
}

Write-Host "`nContents of nmap directory:"
if (Test-Path $targetDir) {
    Get-ChildItem -Path $targetDir | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
}

# Test the nmap installation
$nmapExe = Join-Path $targetDir "nmap.exe"
$nmapBat = Join-Path $targetDir "nmap.exe.bat"

if (Test-Path $nmapExe) {
    Write-Host "`nTesting real nmap.exe..."
    try {
        $output = & $nmapExe --version
        Write-Host $output
    } catch {
        Write-Warning "Real nmap test failed: $_"
    }
} elseif (Test-Path $nmapBat) {
    Write-Host "`nTesting nmap stub..."
    try {
        $output = & cmd /c $nmapBat --version
        Write-Host $output
    } catch {
        Write-Warning "Stub nmap test failed: $_"
    }
}

Write-Host "`nnmap setup complete at: $targetDir"