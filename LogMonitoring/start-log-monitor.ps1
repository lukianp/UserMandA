# Log Monitor Launcher
# Starts the log monitoring script with error handling and logging

$logMonitorScript = "D:\Scripts\UserMandA\LogMonitoring\log-monitor.ps1"
$logOutputPath = "D:\Scripts\UserMandA\LogMonitoring\defect-tracking.json"
$errorLogPath = "D:\Scripts\UserMandA\LogMonitoring\monitor-errors.log"

# Ensure clean start
if (Test-Path $logOutputPath) { Remove-Item $logOutputPath }
if (Test-Path $errorLogPath) { Remove-Item $errorLogPath }

try {
    Write-Host "Starting M&A Discovery Log Monitor..."
    & powershell.exe -ExecutionPolicy Bypass -File $logMonitorScript -ErrorAction Stop
}
catch {
    $errorMessage = "Log Monitor Failed: $($_.Exception.Message)"
    Add-Content -Path $errorLogPath -Value $errorMessage
    Write-Error $errorMessage
}