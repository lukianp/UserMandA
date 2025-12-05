# Test from build directory
Write-Host "Testing from build directory..." -ForegroundColor Cyan
$app = Start-Process "D:\Scripts\UserMandA\GUI\bin\Release\net6.0-windows\MandADiscoverySuite.exe" -PassThru
Start-Sleep -Seconds 5
if (Get-Process -Id $app.Id -ErrorAction SilentlyContinue) {
    Write-Host "STATUS: RUNNING from build dir!" -ForegroundColor Green
    $proc = Get-Process -Id $app.Id
    Write-Host "  Window Title: $($proc.MainWindowTitle)" -ForegroundColor Green
    Write-Host "  Memory: $([math]::Round($proc.WorkingSet64/1MB, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "STATUS: EXITED from build dir" -ForegroundColor Red
}
