# Find and display the most recent log
$logPath = "C:\discoverydata\ljpops\Logs"
$latestLog = Get-ChildItem $logPath -Filter "*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($latestLog) {
    Write-Host "Latest log: $($latestLog.Name) (Modified: $($latestLog.LastWriteTime))" -ForegroundColor Cyan
    Write-Host "`nLast 50 lines:" -ForegroundColor Yellow
    Get-Content $latestLog.FullName -Tail 50
} else {
    Write-Host "No log files found in $logPath" -ForegroundColor Red
}
