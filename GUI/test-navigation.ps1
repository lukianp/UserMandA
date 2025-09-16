# Test script to verify navigation functionality
param(
    [string]$ViewName = "dashboard"
)

Write-Host "Testing Navigation for View: $ViewName" -ForegroundColor Green

# Start the application in headless mode for testing
$appPath = "C:\enterprisediscovery\MandADiscoverySuite.exe"
$logPath = "C:\discoverydata\ljpops\Logs"

if (-not (Test-Path $appPath)) {
    Write-Error "Application not found at $appPath"
    exit 1
}

Write-Host "Starting application with view test..." -ForegroundColor Yellow

# Start application and wait for logs
$process = Start-Process -FilePath $appPath -ArgumentList "--test-view", $ViewName -NoNewWindow -PassThru

# Wait up to 10 seconds for startup
$timeout = 10
$elapsed = 0
while ($elapsed -lt $timeout -and -not $process.HasExited) {
    Start-Sleep -Seconds 1
    $elapsed++
    Write-Host "." -NoNewline
}

if ($process.HasExited) {
    Write-Host ""
    Write-Host "Application exited with code: $($process.ExitCode)" -ForegroundColor $(if($process.ExitCode -eq 0) { "Green" } else { "Red" })
} else {
    Write-Host ""
    Write-Host "Application still running after $timeout seconds" -ForegroundColor Yellow
    $process.Kill()
}

# Check latest log file for navigation events
$latestLog = Get-ChildItem -Path $logPath -Filter "MandADiscovery_*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($latestLog) {
    Write-Host "`nChecking log file: $($latestLog.FullName)" -ForegroundColor Cyan
    $logContent = Get-Content $latestLog.FullName | Where-Object { $_ -match "TabsService|ViewRegistry|OpenTab|Navigation" }

    if ($logContent) {
        Write-Host "Navigation-related log entries:" -ForegroundColor Green
        $logContent | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    } else {
        Write-Host "No navigation-related log entries found" -ForegroundColor Yellow
    }
} else {
    Write-Host "No log files found in $logPath" -ForegroundColor Red
}