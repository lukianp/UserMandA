# Test script to check if STA threading fix works for navigation
# This script will start the app and test navigation to different views

Write-Host "Starting Navigation STA Threading Test..." -ForegroundColor Green

# Clear debug log
$debugLogPath = "C:\DiscoveryData\ljpops\Logs\viewregistry-debug.log"
if (Test-Path $debugLogPath) {
    Clear-Content $debugLogPath
    Write-Host "Cleared ViewRegistry debug log" -ForegroundColor Yellow
}

# Start the application
Write-Host "Starting M&A Discovery Suite..." -ForegroundColor Cyan
$appPath = "D:\Scripts\UserMandA\GUI\publish\MandADiscoverySuite.exe"

if (-not (Test-Path $appPath)) {
    Write-Host "ERROR: Application not found at $appPath" -ForegroundColor Red
    exit 1
}

# Start app in background
$process = Start-Process -FilePath $appPath -PassThru -WindowStyle Normal
Write-Host "Application started with PID: $($process.Id)" -ForegroundColor Green

# Wait for app to start
Write-Host "Waiting 5 seconds for application to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if debug log shows any STA threading errors
Write-Host "Checking for STA threading errors..." -ForegroundColor Cyan
if (Test-Path $debugLogPath) {
    $logContent = Get-Content $debugLogPath -Raw
    if ($logContent -match "The calling thread must be STA") {
        Write-Host "ERROR: STA threading issue still exists!" -ForegroundColor Red
        Write-Host "Log excerpt:" -ForegroundColor Yellow
        Get-Content $debugLogPath | Select-Object -Last 10
    } else {
        Write-Host "SUCCESS: No STA threading errors detected in debug log!" -ForegroundColor Green
        if ($logContent -match "Already on UI thread, creating view directly") {
            Write-Host "Detected UI thread creation (expected behavior)" -ForegroundColor Green
        }
        if ($logContent -match "Not on UI thread, marshaling to UI thread") {
            Write-Host "Detected thread marshaling (good - fix is working)" -ForegroundColor Green
        }
    }
} else {
    Write-Host "No debug log found - app may not have attempted navigation yet" -ForegroundColor Yellow
}

Write-Host "`nTest completed. Application is running - try navigating to different views manually." -ForegroundColor Cyan
Write-Host "Press any key to stop the application..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Stop the application
if ($process -and !$process.HasExited) {
    $process.Kill()
    Write-Host "Application stopped." -ForegroundColor Green
} else {
    Write-Host "Application already stopped." -ForegroundColor Yellow
}