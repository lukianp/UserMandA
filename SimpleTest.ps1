Write-Host "Testing application startup" -ForegroundColor Green

$ExePath = "C:\EnterpriseDiscovery\bin\Release\MandADiscoverySuite.exe"

if (Test-Path $ExePath) {
    Write-Host "Executable found" -ForegroundColor Green
    Start-Process -FilePath $ExePath -WorkingDirectory "C:\EnterpriseDiscovery\bin\Release"
} else {
    Write-Host "Executable not found" -ForegroundColor Red
}