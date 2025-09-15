# Test UI Interaction Logging System
param(
    [string]$LogsPath = $env:MANDA_LOGS_PATH
)

Write-Host "UI Interaction Logging System Test" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Get the latest log file using standardized path
$logPath = if ($LogsPath) { $LogsPath } elseif ($env:MANDA_DISCOVERY_PATH) { "$env:MANDA_DISCOVERY_PATH\ljpops\Logs" } else { "c:\discoverydata\ljpops\Logs" }
$latestLog = Get-ChildItem "$logPath\MandADiscovery_*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($latestLog) {
    Write-Host "Monitoring log file: $($latestLog.Name)" -ForegroundColor Green
    Write-Host "Created: $($latestLog.CreationTime)" -ForegroundColor Yellow
    Write-Host "Size: $([math]::Round($latestLog.Length / 1KB, 2)) KB" -ForegroundColor Yellow
    Write-Host ""
    
    # Check for UI interaction logging initialization
    Write-Host "Checking UI Logging Service Status..." -ForegroundColor Cyan
    $content = Get-Content $latestLog.FullName
    
    $uiInitLog = $content | Where-Object { $_ -match "UI INTERACTION LOGGING" }
    if ($uiInitLog) {
        Write-Host "UI Logging Service: ACTIVE" -ForegroundColor Green
        $uiInitLog | ForEach-Object { Write-Host "   $_" -ForegroundColor DarkGreen }
    } else {
        Write-Host "UI Logging Service: NOT DETECTED" -ForegroundColor Red
    }
    
    # Check for any existing UI interactions
    Write-Host ""
    Write-Host "Searching for UI Interaction Logs..." -ForegroundColor Cyan
    $interactions = $content | Where-Object { 
        $_ -match "MOUSE_DOWN|CLICK|BUTTON_CLICK|COMMAND_EXECUTE|TEXT_CHANGED|SELECTION_CHANGED|NAVIGATION" 
    }
    
    if ($interactions.Count -gt 0) {
        Write-Host "Found $($interactions.Count) UI interactions:" -ForegroundColor Green
        $interactions | Select-Object -Last 10 | ForEach-Object { 
            Write-Host "   $_" -ForegroundColor Magenta 
        }
    } else {
        Write-Host "No UI interactions logged yet (application may be idle)" -ForegroundColor Yellow
        Write-Host "Try clicking buttons in the application to generate logs" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Log File Statistics:" -ForegroundColor Cyan
    Write-Host "   Total lines: $($content.Count)" -ForegroundColor White
    Write-Host "   Startup events: $(($content | Where-Object { $_ -match 'OnStartup|Initialize|Constructor' }).Count)" -ForegroundColor White
    Write-Host "   Error events: $(($content | Where-Object { $_ -match 'ERROR|EXCEPTION|CRITICAL' }).Count)" -ForegroundColor White
    
} else {
    Write-Host "No log files found in $logPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "To monitor logs in real-time:" -ForegroundColor Yellow
Write-Host "Get-Content '$logPath\MandADiscovery_*.log' | Sort-Object LastWriteTime -Desc | Select -First 1 | Get-Content -Wait -Tail 5" -ForegroundColor Gray