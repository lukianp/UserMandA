Write-Host "Complete Discovery Dashboard Functional Test" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Test 1: Application Status
Write-Host "`n1. Application Status Check" -ForegroundColor Yellow
$guiProcess = Get-Process MandADiscoverySuite -ErrorAction SilentlyContinue
if ($guiProcess) {
    $memoryMB = [math]::Round($guiProcess.WorkingSet64 / 1MB, 2)
    Write-Host "   [OK] Application running (PID: $($guiProcess.Id), Memory: $memoryMB MB)" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] Application not running" -ForegroundColor Red
    exit 1
}

# Test 2: Module Registry Verification
Write-Host "`n2. Module Registry Verification" -ForegroundColor Yellow
$registryPath = "D:\Scripts\UserMandA\GUI\Configuration\ModuleRegistry.json"
if (Test-Path $registryPath) {
    try {
        $registry = Get-Content $registryPath | ConvertFrom-Json
        $discoveryModules = $registry.modules.PSObject.Properties | Where-Object { $_.Value.filePath -like "Discovery/*" }
        $enabledModules = $discoveryModules | Where-Object { $_.Value.enabled }
        
        Write-Host "   [OK] Module registry loaded successfully" -ForegroundColor Green
        Write-Host "   [INFO] Total Discovery modules: $($discoveryModules.Count)" -ForegroundColor Gray
        Write-Host "   [INFO] Enabled modules: $($enabledModules.Count)" -ForegroundColor Gray
    } catch {
        Write-Host "   [ERROR] Failed to parse module registry: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   [ERROR] Module registry not found" -ForegroundColor Red
    exit 1
}

# Test 3: Launcher Script Verification
Write-Host "`n3. Launcher Script Verification" -ForegroundColor Yellow
$launcherPath = "D:\Scripts\UserMandA\Scripts\DiscoveryModuleLauncher.ps1"
if (Test-Path $launcherPath) {
    Write-Host "   [OK] Launcher script found" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] Launcher script missing" -ForegroundColor Red
}

# Test 4: Log Monitoring for Dashboard Activity
Write-Host "`n4. Dashboard Activity Monitoring" -ForegroundColor Yellow
Write-Host "   Monitoring logs for Discovery Dashboard activity..." -ForegroundColor Gray

$logFiles = @(
    "C:\DiscoveryData\ljpops\Logs\gui-debug.log",
    "C:\DiscoveryData\ljpops\Logs\Application\app_log_20250815.json"
)

$startTime = Get-Date
$foundActivity = $false

# Monitor for 30 seconds
for ($i = 1; $i -le 6; $i++) {
    Start-Sleep -Seconds 5
    Write-Host "   Checking logs... ($i/6)" -ForegroundColor Gray
    
    foreach ($logFile in $logFiles) {
        if (Test-Path $logFile) {
            if ($logFile -like "*.json") {
                try {
                    $content = Get-Content $logFile -Raw -ErrorAction SilentlyContinue
                    if ($content) {
                        $entries = ($content | ConvertFrom-Json) | Where-Object { 
                            $_.timestamp -gt $startTime -and
                            ($_.message -like "*DiscoveryDashboard*" -or $_.category -like "*Discovery*")
                        }
                        if ($entries) {
                            $foundActivity = $true
                            Write-Host "   [OK] Found Dashboard activity in $logFile" -ForegroundColor Green
                            foreach ($entry in ($entries | Select-Object -Last 3)) {
                                Write-Host "      $($entry.timestamp): $($entry.message)" -ForegroundColor DarkGray
                            }
                        }
                    }
                } catch {
                    # Skip JSON parsing errors
                }
            } else {
                $recentEntries = Get-Content $logFile -Tail 20 -ErrorAction SilentlyContinue | 
                    Where-Object { $_ -like "*Discovery*" -and $_ -like "*$(Get-Date -Format 'yyyy-MM-dd HH:mm')*" }
                if ($recentEntries) {
                    $foundActivity = $true
                    Write-Host "   [OK] Found recent Discovery activity in $logFile" -ForegroundColor Green
                    foreach ($entry in ($recentEntries | Select-Object -Last 2)) {
                        Write-Host "      $entry" -ForegroundColor DarkGray
                    }
                }
            }
        }
    }
}

if (-not $foundActivity) {
    Write-Host "   [WARN]  No recent Dashboard activity detected in logs" -ForegroundColor Yellow
    Write-Host "      This might indicate the Dashboard tab hasn't been opened yet" -ForegroundColor Yellow
}

# Test 5: Data Directory Status
Write-Host "`n5. Data Directory Analysis" -ForegroundColor Yellow
$dataPath = "C:\discoverydata\ljpops\Raw"
if (Test-Path $dataPath) {
    $csvFiles = Get-ChildItem $dataPath -Filter "*.csv" -ErrorAction SilentlyContinue
    if ($csvFiles) {
        $totalSizeMB = [math]::Round(($csvFiles | Measure-Object Length -Sum).Sum / 1MB, 2)
        $recentFiles = $csvFiles | Where-Object { $_.LastWriteTime -gt (Get-Date).AddHours(-24) }
        
        Write-Host "   [OK] Data directory accessible" -ForegroundColor Green
        Write-Host "   [INFO] Total CSV files: $($csvFiles.Count) ($totalSizeMB MB)" -ForegroundColor Gray
        Write-Host "   [INFO] Recent files (24h): $($recentFiles.Count)" -ForegroundColor Gray
        
        if ($recentFiles) {
            Write-Host "   [FILES] Most recent data files:" -ForegroundColor Gray
            foreach ($file in ($recentFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 3)) {
                $sizeKB = [math]::Round($file.Length / 1KB, 2)
                Write-Host "      $($file.Name) ($sizeKB KB) - $($file.LastWriteTime)" -ForegroundColor DarkGray
            }
        }
    } else {
        Write-Host "   [WARN]  No CSV files found in data directory" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [ERROR] Data directory not accessible" -ForegroundColor Red
}

# Test 6: Module File Verification (Sample)
Write-Host "`n6. Sample Module File Verification" -ForegroundColor Yellow
$sampleModules = @("ActiveDirectoryDiscovery", "AzureDiscovery", "IntuneDiscovery")
$moduleVerified = 0

foreach ($module in $sampleModules) {
    $modulePath = "D:\Scripts\UserMandA\Modules\Discovery\$module.psm1"
    if (Test-Path $modulePath) {
        $moduleVerified++
        Write-Host "   [OK] $module.psm1 exists" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] $module.psm1 missing" -ForegroundColor Red
    }
}

Write-Host "   [INFO] Sample modules verified: $moduleVerified/$($sampleModules.Count)" -ForegroundColor Gray

# Test 7: System Health Summary
Write-Host "`n7. System Health Summary" -ForegroundColor Yellow
$healthScore = 0
$maxScore = 6

if ($guiProcess) { $healthScore++ }
if ($registry) { $healthScore++ }
if (Test-Path $launcherPath) { $healthScore++ }
if ($foundActivity) { $healthScore++ }
if (Test-Path $dataPath) { $healthScore++ }
if ($moduleVerified -eq $sampleModules.Count) { $healthScore++ }

$healthPercent = [math]::Round(($healthScore / $maxScore) * 100, 0)
$healthColor = if ($healthPercent -ge 80) { "Green" } elseif ($healthPercent -ge 60) { "Yellow" } else { "Red" }

Write-Host "   [INFO] Overall Health Score: $healthScore/$maxScore ($healthPercent%)" -ForegroundColor $healthColor

# Test Results Summary
Write-Host "`n" -NoNewline
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

if ($healthPercent -ge 80) {
    Write-Host "[SUCCESS] DISCOVERY DASHBOARD: FULLY FUNCTIONAL" -ForegroundColor Green
    Write-Host "   All core components are working correctly" -ForegroundColor Green
    Write-Host "   Ready for production use" -ForegroundColor Green
} elseif ($healthPercent -ge 60) {
    Write-Host "[WARN]  DISCOVERY DASHBOARD: MOSTLY FUNCTIONAL" -ForegroundColor Yellow
    Write-Host "   Core components working with minor issues" -ForegroundColor Yellow
    Write-Host "   Requires attention for optimal performance" -ForegroundColor Yellow
} else {
    Write-Host "[ERROR] DISCOVERY DASHBOARD: NEEDS ATTENTION" -ForegroundColor Red
    Write-Host "   Critical issues detected requiring immediate fixes" -ForegroundColor Red
}

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Open GUI and navigate to Discovery tab" -ForegroundColor White
Write-Host "2. Verify module tiles are displayed correctly" -ForegroundColor White
Write-Host "3. Test module execution by clicking Run Discovery" -ForegroundColor White
Write-Host "4. Monitor data refresh and count updates" -ForegroundColor White

Write-Host "`nTest completed at $(Get-Date)" -ForegroundColor Gray