# Test Demo Launch
$demoDir = "D:\Scripts\UserMandA\DemoPackage"
Set-Location $demoDir

Write-Host "Testing Demo Launch..." -ForegroundColor Cyan
Write-Host "Directory: $demoDir" -ForegroundColor Gray

# Check if Electron is available
$electronPath = Join-Path $demoDir "node_modules\.bin\electron.cmd"
if (-not (Test-Path $electronPath)) {
    Write-Host "Installing Electron..." -ForegroundColor Yellow
    npm install electron --save-dev 2>&1 | Out-Null
}

Write-Host "Launching application..." -ForegroundColor Green
$proc = Start-Process -FilePath $electronPath -ArgumentList "." -PassThru

Start-Sleep -Seconds 5

$running = Get-Process -Id $proc.Id -ErrorAction SilentlyContinue
if ($running) {
    Write-Host "SUCCESS: Electron is running (PID: $($proc.Id))" -ForegroundColor Green
} else {
    Write-Host "ERROR: Electron failed to start" -ForegroundColor Red
}
