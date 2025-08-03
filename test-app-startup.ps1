# Test application startup
Write-Host "Testing M&A Discovery Suite application startup..." -ForegroundColor Green

try {
    # Kill any existing instances
    Get-Process -Name "MandADiscoverySuite" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
    
    Write-Host "Starting application..." -ForegroundColor Yellow
    $startTime = Get-Date
    
    # Start the application
    $process = Start-Process -FilePath "C:\EnterpriseDiscovery\MandADiscoverySuite.exe" -PassThru -WindowStyle Normal
    
    # Monitor for 10 seconds
    for ($i = 1; $i -le 10; $i++) {
        Start-Sleep -Seconds 1
        
        if ($process.HasExited) {
            Write-Host "❌ Application crashed after $i seconds" -ForegroundColor Red
            Write-Host "Exit Code: $($process.ExitCode)" -ForegroundColor Red
            break
        } else {
            Write-Host "⏱️  Running for $i seconds..." -ForegroundColor Gray
        }
    }
    
    if (-not $process.HasExited) {
        Write-Host "✅ SUCCESS: Application is running stable for 10+ seconds!" -ForegroundColor Green
        
        # Check if window is visible by looking for main window
        $mainWindow = $process.MainWindowTitle
        if ($mainWindow) {
            Write-Host "📋 Main Window Title: $mainWindow" -ForegroundColor Cyan
        } else {
            Write-Host "⚠️  WARNING: Application running but no main window detected" -ForegroundColor Yellow
        }
        
        # Stop the process
        Write-Host "Stopping application..." -ForegroundColor Yellow
        $process.CloseMainWindow()
        Start-Sleep -Seconds 2
        
        if (-not $process.HasExited) {
            $process.Kill()
        }
        Write-Host "✅ Application stopped successfully" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
}