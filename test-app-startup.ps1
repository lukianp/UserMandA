# Test Application Startup and Monitor Logs
Write-Host "=== M&A Discovery Suite Startup Test ===" -ForegroundColor Cyan

# Launch application
Write-Host "Launching application..." -ForegroundColor Yellow
$app = Start-Process "C:\enterprisediscovery\MandADiscoverySuite.exe" -PassThru
Write-Host "  Process ID: $($app.Id)" -ForegroundColor Green
Write-Host "  Process Name: $($app.ProcessName)" -ForegroundColor Green

# Wait for startup
Write-Host "`nWaiting 5 seconds for startup..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if still running
$running = Get-Process -Id $app.Id -ErrorAction SilentlyContinue
if ($running) {
    Write-Host "  STATUS: Application is RUNNING" -ForegroundColor Green
    Write-Host "  Window Title: $($running.MainWindowTitle)" -ForegroundColor Green
    Write-Host "  Memory: $([math]::Round($running.WorkingSet64/1MB, 2)) MB" -ForegroundColor Green
    Write-Host "  Responding: $($running.Responding)" -ForegroundColor Green
} else {
    Write-Host "  STATUS: Application EXITED" -ForegroundColor Red
}

# Check for emergency log
Write-Host "`nChecking emergency log..." -ForegroundColor Yellow
if (Test-Path "C:\Temp\manda-emergency-startup.log") {
    Write-Host "  EMERGENCY LOG FOUND:" -ForegroundColor Red
    Get-Content "C:\Temp\manda-emergency-startup.log"
} else {
    Write-Host "  No emergency log (normal startup)" -ForegroundColor Green
}

# Check latest application logs
Write-Host "`nChecking latest logs..." -ForegroundColor Yellow
$today = Get-Date -Format "yyyyMMdd"
$latestLog = Get-ChildItem "C:\discoverydata\ljpops\Logs\" -Filter "*$today*.log" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($latestLog) {
    Write-Host "  Latest log: $($latestLog.Name)" -ForegroundColor Green
    Write-Host "  Last modified: $($latestLog.LastWriteTime)" -ForegroundColor Green
    Write-Host "`n  Last 20 log entries:" -ForegroundColor Cyan
    Get-Content $latestLog.FullName -Tail 20
} else {
    Write-Host "  No logs created today - checking recent logs..." -ForegroundColor Yellow
    $recentLog = Get-ChildItem "C:\discoverydata\ljpops\Logs\" -Filter "*.log" |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($recentLog) {
        Write-Host "  Most recent log: $($recentLog.Name)" -ForegroundColor Yellow
        Write-Host "  Last modified: $($recentLog.LastWriteTime)" -ForegroundColor Yellow
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
