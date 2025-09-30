# Capture crash with full .NET diagnostics
$env:COREHOST_TRACE = "1"
$env:COREHOST_TRACEFILE = "C:\Temp\dotnet-host-trace.log"

Write-Host "Launching with full .NET Core host tracing..." -ForegroundColor Cyan

$proc = Start-Process "dotnet" `
    -ArgumentList "C:\enterprisediscovery\MandADiscoverySuite.dll" `
    -PassThru `
    -RedirectStandardError "C:\Temp\app-stderr.log" `
    -RedirectStandardOutput "C:\Temp\app-stdout.log" `
    -WindowStyle Hidden

Start-Sleep -Seconds 5

if (Get-Process -Id $proc.Id -ErrorAction SilentlyContinue) {
    Write-Host "SUCCESS: App is running!" -ForegroundColor Green
    Stop-Process -Id $proc.Id -Force
} else {
    Write-Host "CRASHED: Checking logs..." -ForegroundColor Red

    if (Test-Path "C:\Temp\dotnet-host-trace.log") {
        Write-Host "`n=== .NET HOST TRACE ===" -ForegroundColor Yellow
        Get-Content "C:\Temp\dotnet-host-trace.log"
    }

    if (Test-Path "C:\Temp\app-stderr.log") {
        $stderr = Get-Content "C:\Temp\app-stderr.log"
        if ($stderr) {
            Write-Host "`n=== STDERR ===" -ForegroundColor Red
            $stderr
        }
    }

    if (Test-Path "C:\Temp\app-stdout.log") {
        $stdout = Get-Content "C:\Temp\app-stdout.log"
        if ($stdout) {
            Write-Host "`n=== STDOUT ===" -ForegroundColor Yellow
            $stdout
        }
    }
}
