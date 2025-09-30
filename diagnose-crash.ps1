# Diagnose Application Crash via Event Viewer
Write-Host "=== Diagnosing Application Crash ===" -ForegroundColor Cyan

# Clear old emergency log
if (Test-Path "C:\Temp\manda-emergency-startup.log") {
    Remove-Item "C:\Temp\manda-emergency-startup.log" -Force
    Write-Host "Cleared old emergency log" -ForegroundColor Yellow
}

# Get event log baseline
$beforeTime = Get-Date
Write-Host "Baseline time: $beforeTime" -ForegroundColor Yellow

# Launch application
Write-Host "`nLaunching application..." -ForegroundColor Yellow
$app = Start-Process "C:\enterprisediscovery\MandADiscoverySuite.exe" -PassThru -WindowStyle Normal
Write-Host "  Process ID: $($app.Id)" -ForegroundColor Green

# Wait and monitor
Write-Host "`nMonitoring for 10 seconds..." -ForegroundColor Yellow
for ($i = 1; $i -le 10; $i++) {
    Start-Sleep -Seconds 1
    $running = Get-Process -Id $app.Id -ErrorAction SilentlyContinue
    if ($running) {
        Write-Host "  [$i] RUNNING - Memory: $([math]::Round($running.WorkingSet64/1MB, 2)) MB" -ForegroundColor Green
    } else {
        Write-Host "  [$i] EXITED at $i seconds" -ForegroundColor Red
        break
    }
}

# Check Windows Event Viewer for .NET crashes
Write-Host "`nChecking Windows Event Viewer for .NET errors..." -ForegroundColor Yellow
$events = Get-WinEvent -FilterHashtable @{
    LogName='Application'
    ProviderName='.NET Runtime'
    StartTime=$beforeTime
} -ErrorAction SilentlyContinue | Select-Object -First 5

if ($events) {
    Write-Host "  FOUND .NET RUNTIME ERRORS:" -ForegroundColor Red
    foreach ($event in $events) {
        Write-Host "`n  Time: $($event.TimeCreated)" -ForegroundColor Red
        Write-Host "  Message: $($event.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "  No .NET runtime errors found" -ForegroundColor Green
}

# Check for WPF errors
$wpfEvents = Get-WinEvent -FilterHashtable @{
    LogName='Application'
    StartTime=$beforeTime
} -ErrorAction SilentlyContinue | Where-Object { $_.Message -like "*MandADiscoverySuite*" -or $_.Message -like "*WPF*" } | Select-Object -First 5

if ($wpfEvents) {
    Write-Host "`n  FOUND APPLICATION ERRORS:" -ForegroundColor Red
    foreach ($event in $wpfEvents) {
        Write-Host "`n  Time: $($event.TimeCreated)" -ForegroundColor Red
        Write-Host "  Level: $($event.LevelDisplayName)" -ForegroundColor Red
        Write-Host "  Message: $($event.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "  No WPF/application errors found" -ForegroundColor Yellow
}

# Check emergency log
Write-Host "`nChecking emergency log..." -ForegroundColor Yellow
if (Test-Path "C:\Temp\manda-emergency-startup.log") {
    Write-Host "  EMERGENCY LOG:" -ForegroundColor Red
    Get-Content "C:\Temp\manda-emergency-startup.log"
} else {
    Write-Host "  No emergency log created" -ForegroundColor Yellow
}

Write-Host "`n=== Diagnosis Complete ===" -ForegroundColor Cyan
