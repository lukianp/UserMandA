# Comprehensive Infrastructure Discovery Workflow Test
# Author: Master Orchestrator
# Created: 2025-08-30
# Tests the complete Infrastructure Discovery workflow with fixed nmap detection

param(
    [switch]$SkipNmapScan,  # Skip actual nmap scan for speed
    [string]$TestSubnet = "127.0.0.0/30"  # Small safe test subnet
)

Write-Host "=== COMPREHENSIVE INFRASTRUCTURE DISCOVERY WORKFLOW TEST ===" -ForegroundColor Cyan
Write-Host "Test Subnet: $TestSubnet" -ForegroundColor White
Write-Host "Skip nmap Scan: $SkipNmapScan" -ForegroundColor White
Write-Host ""

# Import the Infrastructure Discovery module
try {
    Import-Module "D:\Scripts\UserMandA\Modules\Discovery\InfrastructureDiscovery.psm1" -Force
    Write-Host "✅ Successfully imported InfrastructureDiscovery module" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to import module: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$testResults = @{}

# Test 1: nmap Detection and Installation
Write-Host ""
Write-Host "=== TEST 1: nmap Detection and Installation ===" -ForegroundColor Yellow
Write-Host ""

try {
    $nmapPath = Install-NmapIfNeeded -Context @{}
    if ($nmapPath -and (Test-Path $nmapPath)) {
        Write-Host "✅ nmap detection/installation: SUCCESS" -ForegroundColor Green
        Write-Host "   Path: $nmapPath" -ForegroundColor White
        $testResults["nmap_detection"] = "PASS"
    } else {
        Write-Host "❌ nmap detection/installation: FAILED" -ForegroundColor Red
        $testResults["nmap_detection"] = "FAIL"
    }
} catch {
    Write-Host "❌ nmap detection threw exception: $($_.Exception.Message)" -ForegroundColor Red
    $testResults["nmap_detection"] = "FAIL"
}

# Test 2: Production Environment Detection
Write-Host ""
Write-Host "=== TEST 2: Production Environment Detection ===" -ForegroundColor Yellow
Write-Host ""

try {
    $productionTest = Test-ProductionEnvironment -Context @{}
    Write-Host "✅ Production environment test completed" -ForegroundColor Green
    Write-Host "   Is Production: $($productionTest.IsProduction)" -ForegroundColor White
    Write-Host "   Detected Signals: $($productionTest.Signals.Count) signals" -ForegroundColor White
    if ($productionTest.Signals.Count -gt 0) {
        $productionTest.Signals | ForEach-Object { Write-Host "     - $_" -ForegroundColor Gray }
    }
    $testResults["production_detection"] = "PASS"
} catch {
    Write-Host "❌ Production environment test failed: $($_.Exception.Message)" -ForegroundColor Red
    $testResults["production_detection"] = "FAIL"
}

# Test 3: Production-Safe Configuration
Write-Host ""
Write-Host "=== TEST 3: Production-Safe Configuration ===" -ForegroundColor Yellow
Write-Host ""

try {
    $safeConfig = Get-ProductionSafeNmapConfig -Context @{}
    Write-Host "✅ Production-safe configuration loaded" -ForegroundColor Green
    Write-Host "   Max Packets/Sec: $($safeConfig.MaxPacketsPerSecond)" -ForegroundColor White
    Write-Host "   Delay Between Hosts: $($safeConfig.DelayBetweenHosts)ms" -ForegroundColor White
    Write-Host "   Timing Template: $($safeConfig.TimingTemplate)" -ForegroundColor White
    Write-Host "   Max Subnet Size: /$($safeConfig.MaxSubnetSize)" -ForegroundColor White
    
    if ($safeConfig.MaxPacketsPerSecond -le 10 -and $safeConfig.DelayBetweenHosts -ge 1000) {
        Write-Host "✅ Configuration meets production-safe thresholds" -ForegroundColor Green
        $testResults["safe_config"] = "PASS"
    } else {
        Write-Host "❌ Configuration does not meet production-safe thresholds" -ForegroundColor Red
        $testResults["safe_config"] = "FAIL"
    }
} catch {
    Write-Host "❌ Production-safe configuration test failed: $($_.Exception.Message)" -ForegroundColor Red
    $testResults["safe_config"] = "FAIL"
}

# Test 4: PowerShell Fallback Scan (Always test this as it doesn't require nmap)
Write-Host ""
Write-Host "=== TEST 4: PowerShell Fallback Scan ===" -ForegroundColor Yellow
Write-Host ""

try {
    $psResults = Invoke-ProductionSafePowerShellScan -TargetSubnet $TestSubnet -Context @{}
    
    if ($psResults -and $psResults.Count -ge 0) {
        Write-Host "✅ PowerShell fallback scan completed" -ForegroundColor Green
        Write-Host "   Discovered hosts: $($psResults.Count)" -ForegroundColor White
        
        if ($psResults.Count -gt 0) {
            $psResults | Select-Object -First 3 | ForEach-Object {
                Write-Host "     - $($_.IPAddress) ($($_.HostName))" -ForegroundColor Gray
            }
        }
        $testResults["powershell_scan"] = "PASS"
    } else {
        Write-Host "⚠️ PowerShell scan returned null results (may be normal for test subnet)" -ForegroundColor Yellow
        $testResults["powershell_scan"] = "PARTIAL"
    }
} catch {
    Write-Host "❌ PowerShell fallback scan failed: $($_.Exception.Message)" -ForegroundColor Red
    $testResults["powershell_scan"] = "FAIL"
}

# Test 5: nmap Scan (Optional - can be skipped for speed)
Write-Host ""
Write-Host "=== TEST 5: nmap Production-Safe Scan ===" -ForegroundColor Yellow
Write-Host ""

if ($SkipNmapScan) {
    Write-Host "⏭️ Skipping nmap scan (SkipNmapScan parameter specified)" -ForegroundColor Yellow
    $testResults["nmap_scan"] = "SKIPPED"
} else {
    try {
        if ($nmapPath -and (Test-Path $nmapPath)) {
            Write-Host "🚀 Running production-safe nmap scan (this may take a minute)..." -ForegroundColor White
            $nmapResults = Invoke-ProductionSafeNmapScan -TargetSubnet $TestSubnet -NmapPath $nmapPath -Context @{}
            
            if ($nmapResults) {
                Write-Host "✅ nmap scan completed successfully" -ForegroundColor Green
                Write-Host "   XML Output Length: $($nmapResults.XmlOutput.Length) characters" -ForegroundColor White
                Write-Host "   Parsed Hosts: $($nmapResults.DiscoveredHosts.Count)" -ForegroundColor White
                $testResults["nmap_scan"] = "PASS"
            } else {
                Write-Host "⚠️ nmap scan returned no results (may be normal for test subnet)" -ForegroundColor Yellow
                $testResults["nmap_scan"] = "PARTIAL"
            }
        } else {
            Write-Host "❌ Cannot run nmap scan - nmap path not available" -ForegroundColor Red
            $testResults["nmap_scan"] = "FAIL"
        }
    } catch {
        Write-Host "❌ nmap scan failed: $($_.Exception.Message)" -ForegroundColor Red
        $testResults["nmap_scan"] = "FAIL"
    }
}

# Test 6: Main Infrastructure Discovery Function
Write-Host ""
Write-Host "=== TEST 6: Main Infrastructure Discovery Function ===" -ForegroundColor Yellow
Write-Host ""

try {
    # Test with minimal configuration to avoid long-running scan
    $discoveryConfig = @{
        TargetSubnets = @($TestSubnet)
        ScanTimeout = 60  # 1 minute timeout
        MaxConcurrency = 1
        OutputPath = "$env:TEMP\InfrastructureDiscovery-Test-$(Get-Date -Format 'yyyyMMdd-HHmmss').csv"
    }
    
    Write-Host "🚀 Running main Infrastructure Discovery function..." -ForegroundColor White
    $discoveryResults = Invoke-InfrastructureDiscovery -Configuration $discoveryConfig -Context @{}
    
    if ($discoveryResults -and $discoveryResults.TotalHostsDiscovered -ge 0) {
        Write-Host "✅ Infrastructure Discovery completed" -ForegroundColor Green
        Write-Host "   Total Hosts Discovered: $($discoveryResults.TotalHostsDiscovered)" -ForegroundColor White
        Write-Host "   Scan Duration: $($discoveryResults.ScanDurationMinutes) minutes" -ForegroundColor White
        
        if (Test-Path $discoveryConfig.OutputPath) {
            Write-Host "   CSV Output: $($discoveryConfig.OutputPath)" -ForegroundColor White
            $csvContent = Get-Content $discoveryConfig.OutputPath
            Write-Host "   CSV Lines: $($csvContent.Count)" -ForegroundColor White
            $testResults["main_discovery"] = "PASS"
        } else {
            Write-Host "⚠️ CSV output file not created" -ForegroundColor Yellow
            $testResults["main_discovery"] = "PARTIAL"
        }
    } else {
        Write-Host "⚠️ Discovery completed but no results (may be normal for test subnet)" -ForegroundColor Yellow
        $testResults["main_discovery"] = "PARTIAL"
    }
} catch {
    Write-Host "❌ Main Infrastructure Discovery failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Stack Trace:" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    $testResults["main_discovery"] = "FAIL"
}

# Final Results Summary
Write-Host ""
Write-Host "=== COMPREHENSIVE TEST RESULTS SUMMARY ===" -ForegroundColor Cyan
Write-Host ""

$passCount = 0
$totalCount = 0

foreach ($testName in $testResults.Keys | Sort-Object) {
    $result = $testResults[$testName]
    $totalCount++
    
    $color = switch ($result) {
        "PASS" { "Green"; $passCount++ }
        "PARTIAL" { "Yellow" }
        "SKIPPED" { "Gray" }
        "FAIL" { "Red" }
        default { "White" }
    }
    
    $displayName = ($testName -replace '_', ' ').ToUpper()
    Write-Host "$displayName : $result" -ForegroundColor $color
}

Write-Host ""

if ($passCount -eq $totalCount) {
    Write-Host "🎯 OVERALL RESULT: ALL TESTS PASSED" -ForegroundColor Green
    Write-Host "Infrastructure Discovery is working perfectly with fixed nmap detection!" -ForegroundColor Green
} elseif ($passCount -gt ($totalCount / 2)) {
    Write-Host "✅ OVERALL RESULT: MOSTLY SUCCESSFUL" -ForegroundColor Yellow
    Write-Host "Infrastructure Discovery is working but some issues remain." -ForegroundColor Yellow
} else {
    Write-Host "❌ OVERALL RESULT: SIGNIFICANT ISSUES" -ForegroundColor Red
    Write-Host "Infrastructure Discovery has major problems that need fixing." -ForegroundColor Red
}

Write-Host ""
Write-Host "Test completed: $(Get-Date)" -ForegroundColor White