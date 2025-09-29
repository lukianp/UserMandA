# Dependency Checker
Write-Host "========================================="
Write-Host "Dependency Checker"
Write-Host "========================================="

$exePath = "D:\Scripts\UserMandA\GUI\bin\Debug\net6.0-windows\MandADiscoverySuite.exe"
$binPath = Split-Path $exePath

Write-Host ""
Write-Host "Checking for System.Data.SQLite native DLLs..."
$sqliteX64 = Join-Path $binPath "x64\SQLite.Interop.dll"
$sqliteX86 = Join-Path $binPath "x86\SQLite.Interop.dll"

if (Test-Path $sqliteX64) {
    Write-Host "OK: $sqliteX64 exists"
} else {
    Write-Host "MISSING: $sqliteX64"
}

if (Test-Path $sqliteX86) {
    Write-Host "OK: $sqliteX86 exists"
} else {
    Write-Host "MISSING: $sqliteX86"
}

Write-Host ""
Write-Host "Attempting to run with dotnet.exe directly..."
Write-Host "This bypasses the exe wrapper and might show more errors..."
Write-Host ""

$dllPath = Join-Path $binPath "MandADiscoverySuite.dll"
if (Test-Path $dllPath) {
    try {
        $process = Start-Process "dotnet" -ArgumentList "exec `"$dllPath`"" -PassThru -NoNewWindow -Wait
        Write-Host "Process exited with code: $($process.ExitCode)"
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)"
    }
} else {
    Write-Host "ERROR: DLL not found at $dllPath"
}

Write-Host ""
Write-Host "Checking for emergency log again..."
if (Test-Path "C:\Temp\manda-emergency-startup.log") {
    Write-Host "EMERGENCY LOG FOUND:"
    Get-Content "C:\Temp\manda-emergency-startup.log"
} else {
    Write-Host "Still no emergency log"
}

Write-Host ""
Write-Host "========================================="