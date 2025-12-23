# Simple Navigation Test Script
Write-Host "=== Navigation Architecture Fix Verification ===" -ForegroundColor Green

function Test-ApplicationResponsive {
    param([string]$ProcessName = "MandADiscoverySuite")
    
    $process = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    if ($process) {
        if ($process.Responding -eq $false) {
            Write-Host "❌ Application is NOT RESPONDING" -ForegroundColor Red
            return $false
        } else {
            Write-Host "✅ Application is responsive" -ForegroundColor Green
            return $true
        }
    } else {
        Write-Host "❌ Application process not found" -ForegroundColor Red
        return $false
    }
}

try {
    Write-Host "1. Testing application responsiveness..." -ForegroundColor Yellow
    $isResponsive = Test-ApplicationResponsive
    
    if ($isResponsive) {
        Write-Host "2. Checking log activity..." -ForegroundColor Yellow
        $logPath = "C:\discoverydata\ljpops\Logs\structured_log_$(Get-Date -Format 'yyyyMMdd').log"
        
        if (Test-Path $logPath) {
            $recentLines = Get-Content $logPath -Tail 20 | Where-Object { $_ -match "NavigationService|TabsService|viewmodel.*initialized" }
            
            Write-Host "📊 Recent navigation events found: $($recentLines.Count)" -ForegroundColor Cyan
            
            if ($recentLines.Count -gt 0) {
                Write-Host "🎉 SUCCESS: Navigation system is active and working!" -ForegroundColor Green
                Write-Host "   Recent navigation activity detected in logs" -ForegroundColor Green
            } else {
                Write-Host "📋 INFO: No recent navigation activity in logs" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ Log file not found: $logPath" -ForegroundColor Red
        }
        
        Write-Host "3. Final responsiveness check..." -ForegroundColor Yellow
        $finalCheck = Test-ApplicationResponsive
        
        if ($finalCheck) {
            Write-Host "✅ Application remains responsive" -ForegroundColor Green
        } else {
            Write-Host "❌ Application became unresponsive" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "❌ Test execution failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Navigation Test Complete ===" -ForegroundColor Green
Write-Host "Manual test steps:" -ForegroundColor Yellow
Write-Host "1. Navigate: Discovery → Users → Groups → Computers" -ForegroundColor White
Write-Host "2. Verify no 'application not responding' messages" -ForegroundColor White
Write-Host "3. Test rapid navigation between tabs" -ForegroundColor White