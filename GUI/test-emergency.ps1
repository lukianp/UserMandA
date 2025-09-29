# Test with Emergency Logging
$exePath = "D:\Scripts\UserMandA\GUI\bin\Debug\net6.0-windows\MandADiscoverySuite.exe"
$emergencyLog = "C:\Temp\manda-emergency-startup.log"

Write-Host "========================================="
Write-Host "Testing with Emergency Logging"
Write-Host "========================================="

if (Test-Path $emergencyLog) {
    Remove-Item $emergencyLog -Force
    Write-Host "Cleared previous emergency log"
}

Write-Host ""
Write-Host "Starting application..."
$process = Start-Process -FilePath $exePath -PassThru
Start-Sleep -Seconds 3

Write-Host "Checking if process is still running..."
$isRunning = Get-Process -Id $process.Id -ErrorAction SilentlyContinue

if ($isRunning) {
    Write-Host "Application is RUNNING!"
    Stop-Process -Id $process.Id -Force
} else {
    Write-Host "Application exited"
}

Write-Host ""
Write-Host "========================================="
Write-Host "Emergency Log Contents:"
Write-Host "========================================="

if (Test-Path $emergencyLog) {
    Get-Content $emergencyLog
} else {
    Write-Host "ERROR: No emergency log was created!"
    Write-Host "This means the App constructor was never called."
    Write-Host "The application is failing BEFORE .NET instantiates the App class."
}

Write-Host ""
Write-Host "========================================="