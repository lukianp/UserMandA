# Test Application Startup Script
$exePath = "D:\Scripts\UserMandA\GUI\bin\Debug\net6.0-windows\MandADiscoverySuite.exe"

Write-Host "========================================="
Write-Host "M&A Discovery Suite Startup Test"
Write-Host "========================================="

if (Test-Path $exePath) {
    Write-Host "Executable found: $exePath"
    Write-Host "Starting application..."

    try {
        $process = Start-Process -FilePath $exePath -PassThru -WindowStyle Normal
        Write-Host "Process started - PID: $($process.Id)"

        Start-Sleep -Seconds 5

        $isRunning = Get-Process -Id $process.Id -ErrorAction SilentlyContinue

        if ($null -ne $isRunning) {
            Write-Host "SUCCESS: Application is running!"
            Write-Host "  - Process ID: $($process.Id)"
            Write-Host "  - Memory Usage: $([math]::Round($isRunning.WorkingSet64 / 1MB, 2)) MB"
            Write-Host "  - Main Window Title: $($isRunning.MainWindowTitle)"
            Write-Host ""
            Write-Host "Terminating application for analysis..."
            Stop-Process -Id $process.Id -Force
            Write-Host "Application terminated successfully"
        } else {
            Write-Host "FAILURE: Application exited early"
            Write-Host "Check log files for errors"
        }
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)"
    }
} else {
    Write-Host "ERROR: Executable not found at $exePath"
    Write-Host "Please build the project first"
}

Write-Host ""
Write-Host "========================================="
Write-Host "Checking log files..."
Write-Host "========================================="

$logPath = "C:\discoverydata\ljpops\Logs"
$logFiles = Get-ChildItem "$logPath\MandADiscoverySuite_*.log" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending

if ($logFiles) {
    $latestLog = $logFiles[0]
    Write-Host "Latest log file: $($latestLog.Name)"
    Write-Host "Last modified: $($latestLog.LastWriteTime)"
    Write-Host ""
    Write-Host "Last 30 lines of log:"
    Write-Host "========================================="
    Get-Content $latestLog.FullName -Tail 30
} else {
    Write-Host "No log files found in $logPath"
}