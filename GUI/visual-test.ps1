# Visual Test - Don't wait, just launch
$exePath = "D:\Scripts\UserMandA\GUI\bin\Debug\net6.0-windows\MandADiscoverySuite.exe"

Write-Host "Launching application (will stay open for manual inspection)..."
Write-Host "Close the window manually when done testing"
Write-Host ""

Start-Process -FilePath $exePath

Write-Host "Application launched. Waiting 10 seconds to check logs..."
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "========================================="
Write-Host "Emergency Log:"
Write-Host "========================================="
if (Test-Path "C:\Temp\manda-emergency-startup.log") {
    Get-Content "C:\Temp\manda-emergency-startup.log"
} else {
    Write-Host "No emergency log"
}

Write-Host ""
Write-Host "========================================="
Write-Host "Serilog Log:"
Write-Host "========================================="
$logPath = "C:\discoverydata\ljpops\Logs"
$logFiles = Get-ChildItem "$logPath\MandADiscoverySuite_*.log" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending

if ($logFiles) {
    $latestLog = $logFiles[0]
    Write-Host "Found: $($latestLog.Name)"
    Get-Content $latestLog.FullName -Tail 50
} else {
    Write-Host "No Serilog logs found"
}

Write-Host ""
Write-Host "========================================="