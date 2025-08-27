# Test script to verify STA threading fix works for navigation
# This script tests the corrected application from C:\enterprisediscovery

Write-Host "Testing Fixed Navigation STA Threading..." -ForegroundColor Green

# Clear debug log
$debugLogPath = "C:\DiscoveryData\ljpops\Logs\viewregistry-debug.log"
if (Test-Path $debugLogPath) {
    Clear-Content $debugLogPath
    Write-Host "Cleared ViewRegistry debug log" -ForegroundColor Yellow
}

# Start the corrected application from C:\enterprisediscovery
Write-Host "Starting M&A Discovery Suite from C:\enterprisediscovery..." -ForegroundColor Cyan
$appPath = "C:\enterprisediscovery\MandADiscoverySuite.exe"

if (-not (Test-Path $appPath)) {
    Write-Host "ERROR: Application not found at $appPath" -ForegroundColor Red
    exit 1
}

# Check the build timestamp to confirm we're using the correct build
$buildInfo = Get-ItemProperty $appPath | Select Name, LastWriteTime
Write-Host "Application build time: $($buildInfo.LastWriteTime)" -ForegroundColor Cyan

# Start app in background
$process = Start-Process -FilePath $appPath -PassThru -WindowStyle Normal
Write-Host "Application started with PID: $($process.Id)" -ForegroundColor Green

# Wait for app to start and attempt navigation
Write-Host "Waiting 8 seconds for application to initialize and auto-navigate..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Check debug log for results
Write-Host "Checking ViewRegistry debug log for STA threading results..." -ForegroundColor Cyan
if (Test-Path $debugLogPath) {
    $logContent = Get-Content $debugLogPath -Raw
    
    if ($logContent -match "The calling thread must be STA") {
        Write-Host "FAILED: STA threading issue still exists!" -ForegroundColor Red
        Write-Host "Error log excerpt:" -ForegroundColor Yellow
        Get-Content $debugLogPath | Select-Object -Last 15
    } elseif ($logContent -match "Forcing view creation through Dispatcher.Invoke") {
        Write-Host "SUCCESS: STA threading fix is working!" -ForegroundColor Green
        Write-Host "Found evidence of Dispatcher.Invoke usage" -ForegroundColor Green
        
        if ($logContent -match "Executing factory\(\) on dispatcher thread") {
            Write-Host "CONFIRMED: View creation is happening on dispatcher thread" -ForegroundColor Green
        }
        
        if ($logContent -match "Factory completed successfully") {
            Write-Host "CONFIRMED: View creation completed successfully" -ForegroundColor Green
        }
        
        # Show relevant log entries
        Write-Host "`nRelevant log entries:" -ForegroundColor Cyan
        Get-Content $debugLogPath | Where-Object { $_ -match "Forcing view creation|Executing factory|Factory completed|Successfully created" }
        
    } else {
        Write-Host "NEUTRAL: No navigation detected yet" -ForegroundColor Yellow
        Write-Host "Application may not have attempted navigation yet" -ForegroundColor Yellow
        if ($logContent.Trim()) {
            Write-Host "Available log content:" -ForegroundColor Yellow
            Get-Content $debugLogPath
        }
    }
} else {
    Write-Host "No debug log found - app may not have attempted navigation yet" -ForegroundColor Yellow
}

Write-Host "`nApplication is running. Try clicking different menu items to test navigation." -ForegroundColor Cyan
Write-Host "Watch the debug log at: $debugLogPath" -ForegroundColor Cyan
Write-Host "Press any key to stop the application..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Stop the application
if ($process -and !$process.HasExited) {
    $process.Kill()
    Write-Host "Application stopped." -ForegroundColor Green
} else {
    Write-Host "Application already stopped." -ForegroundColor Yellow
}