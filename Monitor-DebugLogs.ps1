# Real-time Debug Log Monitor for M&A Discovery Suite
param(
    [int]$RefreshIntervalMs = 1000
)

Clear-Host
Write-Host "=== M&A DISCOVERY SUITE - REAL-TIME DEBUG MONITOR ===" -ForegroundColor Cyan
Write-Host "Time Started: $(Get-Date)" -ForegroundColor Green
Write-Host "Refresh Interval: $RefreshIntervalMs ms" -ForegroundColor Gray
Write-Host ""

# Initialize tracking variables
$lastGuiLogSize = 0
$lastAppLogSize = 0
$lastErrorLogSize = 0
$clickCount = 0

# Define log file paths
$guiLogPath = "c:\discoverydata\ljpops\Logs\gui-debug.log"
$appLogPath = "c:\discoverydata\ljpops\Logs\Application\app_log_$(Get-Date -Format 'yyyyMMdd').json"
$errorLogPath = "c:\discoverydata\ljpops\Logs\error_log_$(Get-Date -Format 'yyyyMMdd').txt"

Write-Host "Monitoring Log Files:" -ForegroundColor Yellow
Write-Host "  GUI Debug: $guiLogPath" -ForegroundColor Gray
Write-Host "  App Log:   $appLogPath" -ForegroundColor Gray  
Write-Host "  Error Log: $errorLogPath" -ForegroundColor Gray
Write-Host ""

# Check application status
$process = Get-Process MandADiscoverySuite -ErrorAction SilentlyContinue
if ($process) {
    Write-Host "✓ Application Status: RUNNING (PID: $($process.Id))" -ForegroundColor Green
    $memoryMB = [math]::Round($process.WorkingSet64 / 1MB, 2)
    Write-Host "  Memory Usage: $memoryMB MB" -ForegroundColor Gray
} else {
    Write-Host "✗ Application Status: NOT RUNNING" -ForegroundColor Red
    Write-Host "  Please start the application to begin monitoring" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Waiting for user interactions..." -ForegroundColor White
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Main monitoring loop
while ($true) {
    $timestamp = Get-Date -Format "HH:mm:ss.fff"
    $newActivity = $false
    
    # Monitor GUI debug log
    if (Test-Path $guiLogPath) {
        $currentSize = (Get-Item $guiLogPath).Length
        if ($currentSize -gt $lastGuiLogSize) {
            $newContent = Get-Content $guiLogPath -Tail (($currentSize - $lastGuiLogSize) / 50) -ErrorAction SilentlyContinue
            foreach ($line in $newContent) {
                if ($line -and $line.Trim() -ne "") {
                    Write-Host "[$timestamp] [GUI-DEBUG] $line" -ForegroundColor Yellow
                    $newActivity = $true
                    
                    # Track clicks and interactions
                    if ($line -like "*click*" -or $line -like "*button*" -or $line -like "*command*") {
                        $clickCount++
                        Write-Host "    >>> USER INTERACTION #$($clickCount) DETECTED <<<" -ForegroundColor Magenta
                    }
                }
            }
            $lastGuiLogSize = $currentSize
        }
    }
    
    # Monitor application JSON log
    if (Test-Path $appLogPath) {
        $currentSize = (Get-Item $appLogPath).Length
        if ($currentSize -gt $lastAppLogSize) {
            $newContent = Get-Content $appLogPath -Tail 10 -ErrorAction SilentlyContinue
            foreach ($line in $newContent) {
                if ($line -and $line.Trim() -ne "") {
                    try {
                        $logEntry = $line | ConvertFrom-Json
                        $level = $logEntry.level
                        $message = $logEntry.message
                        $category = if ($logEntry.category) { $logEntry.category } else { "Unknown" }
                        
                        $color = switch ($level) {
                            "ERROR" { "Red" }
                            "WARN" { "Yellow" }
                            "INFO" { "White" }
                            "DEBUG" { "Gray" }
                            default { "Cyan" }
                        }
                        
                        Write-Host "[$timestamp] [APP-$level] [$category] $message" -ForegroundColor $color
                        $newActivity = $true
                        
                        # Highlight critical events
                        if ($level -eq "ERROR" -or $message -like "*exception*" -or $message -like "*failed*") {
                            Write-Host "    >>> CRITICAL: $message <<<" -ForegroundColor Red -BackgroundColor Black
                        }
                    }
                    catch {
                        Write-Host "[$timestamp] [APP-RAW] $line" -ForegroundColor Cyan
                        $newActivity = $true
                    }
                }
            }
            $lastAppLogSize = $currentSize
        }
    }
    
    # Monitor error log
    if (Test-Path $errorLogPath) {
        $currentSize = (Get-Item $errorLogPath).Length
        if ($currentSize -gt $lastErrorLogSize) {
            $newContent = Get-Content $errorLogPath -Tail 5 -ErrorAction SilentlyContinue
            foreach ($line in $newContent) {
                if ($line -and $line.Trim() -ne "") {
                    Write-Host "[$timestamp] [ERROR-FILE] $line" -ForegroundColor Red
                    Write-Host "    >>> SYSTEM ERROR DETECTED <<<" -ForegroundColor Red -BackgroundColor Black
                    $newActivity = $true
                }
            }
            $lastErrorLogSize = $currentSize
        }
    }
    
    # Check if application is still running
    $process = Get-Process MandADiscoverySuite -ErrorAction SilentlyContinue
    if (-not $process) {
        Write-Host "[$timestamp] [MONITOR] Application has stopped running!" -ForegroundColor Red
        Write-Host "Press Ctrl+C to exit monitor or restart the application" -ForegroundColor Yellow
    }
    
    # Add separator for readability when there's activity
    if ($newActivity) {
        Write-Host ""
    }
    
    Start-Sleep -Milliseconds $RefreshIntervalMs
}