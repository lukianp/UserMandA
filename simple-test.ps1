Write-Host "Testing M&A Discovery Suite startup..." -ForegroundColor Green

# Kill any running instances
Get-Process -Name "MandADiscoverySuite" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Start the application
$process = Start-Process -FilePath "C:\EnterpriseDiscovery\MandADiscoverySuite.exe" -PassThru

# Wait 5 seconds
Start-Sleep -Seconds 5

# Check if still running
if ($process.HasExited) {
    Write-Host "Application crashed with exit code: $($process.ExitCode)" -ForegroundColor Red
} else {
    Write-Host "Application is running - MainWindow: $($process.MainWindowTitle)" -ForegroundColor Green
    $process.Kill()
}