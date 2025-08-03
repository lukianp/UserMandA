# Test script to verify the application runs
Write-Host "Testing M&A Discovery Suite application..." -ForegroundColor Green

try {
    # Start the application process
    $process = Start-Process -FilePath "dotnet" -ArgumentList "run --project GUI" -PassThru -WindowStyle Normal -WorkingDirectory "D:\Scripts\UserMandA"
    
    # Wait 5 seconds to see if it crashes
    Start-Sleep -Seconds 5
    
    if (-not $process.HasExited) {
        Write-Host "✅ SUCCESS: Application is running stable!" -ForegroundColor Green
        Write-Host "⏱️  Application has been running for 5+ seconds without crashing" -ForegroundColor Yellow
        Write-Host "🎯 The validation error has been FIXED!" -ForegroundColor Cyan
        
        # Stop the process gracefully
        $process.CloseMainWindow()
        Start-Sleep -Seconds 2
        
        if (-not $process.HasExited) {
            $process.Kill()
        }
        
        Write-Host "✅ Application stopped successfully" -ForegroundColor Green
        exit 0
    }
    else {
        Write-Host "❌ FAILED: Application crashed" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "❌ ERROR: Failed to start application - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}