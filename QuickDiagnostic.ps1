# Quick Diagnostic Script for M&A Discovery Suite

Write-Host "M&A Discovery Suite - Quick Diagnostic" -ForegroundColor Cyan

$ExePath = "C:\EnterpriseDiscovery\bin\Release\MandADiscoverySuite.exe"

# Check if executable exists
if (Test-Path $ExePath) {
    Write-Host "✓ Application executable found" -ForegroundColor Green
    
    # Check if already running
    $runningProcesses = Get-Process -Name "MandADiscoverySuite" -ErrorAction SilentlyContinue
    if ($runningProcesses) {
        Write-Host "⚠ Application is already running (PID: $($runningProcesses[0].Id))" -ForegroundColor Yellow
    } else {
        Write-Host "✓ No running instances found" -ForegroundColor Green
        
        # Try to start it
        Write-Host "Starting application..." -ForegroundColor White
        try {
            Start-Process -FilePath $ExePath -WorkingDirectory "C:\EnterpriseDiscovery\bin\Release" -PassThru
            Write-Host "✓ Application started successfully" -ForegroundColor Green
        } catch {
            Write-Host "✗ Failed to start: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "✗ Application executable not found at: $ExePath" -ForegroundColor Red
}