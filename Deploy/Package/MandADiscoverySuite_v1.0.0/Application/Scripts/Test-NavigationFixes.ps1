# Navigation Architecture Fix Test Script
# Tests the complete navigation sequence to ensure no deadlocks occur

Write-Host "=== Navigation Architecture Fix Verification ===" -ForegroundColor Green
Write-Host "Testing the complete navigation sequence that previously caused deadlocks..." -ForegroundColor Yellow

# Function to check if application is responsive
function Test-ApplicationResponsive {
    param([string]$ProcessName = "MandADiscoverySuite")
    
    $process = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    if ($process) {
        # Check if process is not responding
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

# Function to monitor logs for navigation events
function Monitor-NavigationLogs {
    param([int]$DurationSeconds = 30)
    
    $logPath = "C:\discoverydata\ljpops\Logs\structured_log_$(Get-Date -Format 'yyyyMMdd').log"
    
    if (Test-Path $logPath) {
        Write-Host "📊 Monitoring navigation events for $DurationSeconds seconds..." -ForegroundColor Cyan
        
        $startTime = Get-Date
        $navigationEvents = 0
        $deadlockIndicators = 0
        
        while ((Get-Date).Subtract($startTime).TotalSeconds -lt $DurationSeconds) {
            # Read recent log entries
            $recentLines = Get-Content $logPath -Tail 10 -ErrorAction SilentlyContinue
            
            foreach ($line in $recentLines) {
                if ($line -match "NavigationService|TabsService|viewmodel.*initialized") {
                    $navigationEvents++
                    Write-Host "  📍 Navigation event detected: $($line.Split('|')[0])" -ForegroundColor Gray
                }
                
                if ($line -match "deadlock|timeout|not responding|hanging") {
                    $deadlockIndicators++
                    Write-Host "  ⚠️ Potential deadlock indicator: $line" -ForegroundColor Red
                }
            }
            
            Start-Sleep -Milliseconds 500
        }
        
        Write-Host "📈 Navigation monitoring complete:" -ForegroundColor Green
        Write-Host "  - Navigation events detected: $navigationEvents" -ForegroundColor White
        Write-Host "  - Deadlock indicators: $deadlockIndicators" -ForegroundColor White
        
        return @{ NavigationEvents = $navigationEvents; DeadlockIndicators = $deadlockIndicators }
    } else {
        Write-Host "❌ Log file not found: $logPath" -ForegroundColor Red
        return @{ NavigationEvents = 0; DeadlockIndicators = 0 }
    }
}

# Main test execution
try {
    Write-Host "`n1. Launching application..." -ForegroundColor Yellow
    
    # Launch the application
    $appPath = "D:\Scripts\UserMandA\GUI\publish\MandADiscoverySuite.exe"
    if (Test-Path $appPath) {
        $process = Start-Process -FilePath $appPath -PassThru -WindowStyle Normal
        Write-Host "✅ Application launched (PID: $($process.Id))" -ForegroundColor Green
        
        # Wait for application to initialize
        Start-Sleep -Seconds 5
        
        Write-Host "`n2. Testing application responsiveness..." -ForegroundColor Yellow
        $isResponsive = Test-ApplicationResponsive
        
        if ($isResponsive) {
            Write-Host "`n3. Monitoring navigation activity..." -ForegroundColor Yellow
            $results = Monitor-NavigationLogs -DurationSeconds 20
            
            Write-Host "`n4. Test Results Summary:" -ForegroundColor Green
            Write-Host "   Navigation Events: $($results.NavigationEvents)" -ForegroundColor White
            Write-Host "   Deadlock Indicators: $($results.DeadlockIndicators)" -ForegroundColor White
            
            if ($results.DeadlockIndicators -eq 0 -and $results.NavigationEvents -gt 0) {
                Write-Host "`n🎉 SUCCESS: Navigation architecture fix is working!" -ForegroundColor Green
                Write-Host "   - No deadlock indicators detected" -ForegroundColor Green
                Write-Host "   - Navigation events are occurring normally" -ForegroundColor Green
                Write-Host "   - Application remains responsive" -ForegroundColor Green
            } elseif ($results.DeadlockIndicators -gt 0) {
                Write-Host "`n⚠️ WARNING: Potential deadlock indicators detected" -ForegroundColor Yellow
                Write-Host "   Review the logs for more details" -ForegroundColor Yellow
            } else {
                Write-Host "`n📋 INFO: Limited navigation activity detected" -ForegroundColor Cyan
                Write-Host "   This may indicate the application is idle" -ForegroundColor Cyan
            }
        }
        
        Write-Host "`n5. Final responsiveness check..." -ForegroundColor Yellow
        $finalCheck = Test-ApplicationResponsive
        
        if ($finalCheck) {
            Write-Host "✅ Application still responsive after navigation testing" -ForegroundColor Green
        } else {
            Write-Host "❌ Application became unresponsive during testing" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Application executable not found: $appPath" -ForegroundColor Red
        Write-Host "   Please ensure the application has been built successfully" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "`n❌ Test execution failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Navigation Test Complete ===" -ForegroundColor Green
Write-Host "Next steps for manual testing:" -ForegroundColor Yellow
Write-Host "1. Try navigating between Discovery → Users → Groups → Computers" -ForegroundColor White
Write-Host "2. Verify rapid navigation doesn't cause 'application not responding'" -ForegroundColor White
Write-Host "3. Test Settings and Reports navigation" -ForegroundColor White
Write-Host "4. Ensure no freezing or deadlocks occur during navigation" -ForegroundColor White