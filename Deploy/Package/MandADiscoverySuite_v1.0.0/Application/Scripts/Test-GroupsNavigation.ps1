# Test Groups Navigation Script
# Tests the Groups view navigation specifically

$ErrorActionPreference = "Continue"
$VerbosePreference = "Continue"

Write-Host "=== Groups Navigation Test ===" -ForegroundColor Green

# Clear previous debug logs
$debugLogPath = "C:\DiscoveryData\ljpops\Logs\viewregistry-debug.log"
if (Test-Path $debugLogPath) {
    Write-Host "Clearing previous ViewRegistry debug log..." -ForegroundColor Yellow
    Clear-Content $debugLogPath
}

Write-Host "Starting application..." -ForegroundColor Yellow
$appPath = "D:\Scripts\UserMandA\GUI\publish\MandADiscoverySuite.exe"

if (Test-Path $appPath) {
    # Start the application
    $process = Start-Process -FilePath $appPath -PassThru -WindowStyle Normal
    
    Write-Host "Application started with PID: $($process.Id)" -ForegroundColor Green
    
    # Wait for application to initialize
    Start-Sleep -Seconds 5
    
    Write-Host "`nInstructions:" -ForegroundColor Cyan
    Write-Host "1. Click on 'Groups' in the left navigation menu" -ForegroundColor White
    Write-Host "2. Observe if the Groups view loads correctly" -ForegroundColor White
    Write-Host "3. Check for any error messages or red banners" -ForegroundColor White
    Write-Host "4. Press any key here when done testing..." -ForegroundColor White
    
    # Wait for user input
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    Write-Host "`nChecking ViewRegistry debug log for Groups navigation..." -ForegroundColor Yellow
    if (Test-Path $debugLogPath) {
        $debugContent = Get-Content $debugLogPath
        $groupsEntries = $debugContent | Where-Object { $_ -like "*groups*" -or $_ -like "*Groups*" }
        
        if ($groupsEntries) {
            Write-Host "Groups navigation entries found:" -ForegroundColor Green
            $groupsEntries | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
        } else {
            Write-Host "No Groups navigation entries found in debug log!" -ForegroundColor Red
        }
        
        # Show all recent entries
        Write-Host "`nAll recent ViewRegistry entries:" -ForegroundColor Yellow
        $debugContent | Select-Object -Last 10 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    } else {
        Write-Host "ViewRegistry debug log not found!" -ForegroundColor Red
    }
    
    # Check structured logs for Groups
    Write-Host "`nChecking structured logs for Groups activity..." -ForegroundColor Yellow
    $structuredLogPath = "C:\DiscoveryData\ljpops\Logs\structured_log_$(Get-Date -Format 'yyyyMMdd').log"
    if (Test-Path $structuredLogPath) {
        $recentLogs = Get-Content $structuredLogPath | Select-Object -Last 50
        $groupsLogs = $recentLogs | Where-Object { $_ -like "*groups*" -or $_ -like "*Groups*" }
        
        if ($groupsLogs) {
            Write-Host "Groups activity found in structured logs:" -ForegroundColor Green
            $groupsLogs | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
        } else {
            Write-Host "No Groups activity found in structured logs!" -ForegroundColor Red
        }
    }
    
    Write-Host "`nClosing application..." -ForegroundColor Yellow
    try {
        $process.CloseMainWindow()
        Start-Sleep -Seconds 2
        if (!$process.HasExited) {
            $process.Kill()
        }
        Write-Host "Application closed." -ForegroundColor Green
    } catch {
        Write-Host "Error closing application: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} else {
    Write-Host "Application not found at: $appPath" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green