# Test .NET Runtime Directly
Write-Host "=== .NET Runtime Test ===" -ForegroundColor Cyan

# Test 1: Check .NET version
Write-Host "`n1. Checking .NET SDK/Runtime..." -ForegroundColor Yellow
dotnet --list-runtimes | Select-String "Microsoft.WindowsDesktop.App"

# Test 2: Try running with dotnet.exe directly
Write-Host "`n2. Testing with dotnet.exe launcher..." -ForegroundColor Yellow
$proc = Start-Process "dotnet" -ArgumentList "C:\enterprisediscovery\MandADiscoverySuite.dll" -PassThru -RedirectStandardError "C:\Temp\stderr.log" -RedirectStandardOutput "C:\Temp\stdout.log" -NoNewWindow
Start-Sleep -Seconds 5

if (Get-Process -Id $proc.Id -ErrorAction SilentlyContinue) {
    Write-Host "  SUCCESS: Running via dotnet.exe!" -ForegroundColor Green
    Stop-Process -Id $proc.Id -Force
} else {
    Write-Host "  FAILED: Also exits via dotnet.exe" -ForegroundColor Red
}

# Check output
if (Test-Path "C:\Temp\stderr.log") {
    $stderr = Get-Content "C:\Temp\stderr.log"
    if ($stderr) {
        Write-Host "`n3. STDERR Output:" -ForegroundColor Red
        $stderr
    }
}

if (Test-Path "C:\Temp\stdout.log") {
    $stdout = Get-Content "C:\Temp\stdout.log"
    if ($stdout) {
        Write-Host "`n4. STDOUT Output:" -ForegroundColor Yellow
        $stdout
    }
}

# Test 3: Check if Windows Defender or antivirus is blocking
Write-Host "`n5. Checking Windows Defender exclusions..." -ForegroundColor Yellow
Get-MpPreference | Select-Object ExclusionPath

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
