# Simple Discovery Module Monitor with Real-Time Output
# Focused testing of discovery modules for orchestrator integration

Write-Host "=== DISCOVERY MODULE ORCHESTRATOR INTEGRATION MONITOR ===" -ForegroundColor Cyan
Write-Host "Starting comprehensive testing of all discovery modules..." -ForegroundColor Gray
Write-Host ""

# Initialize results
$results = @()
$startTime = Get-Date

# Get discovery modules
$discoveryPath = "Modules\Discovery"
$modules = Get-ChildItem $discoveryPath -Filter "*.psm1" | Where-Object { $_.Name -notlike "*.bak*" }

Write-Host "Found $($modules.Count) discovery modules:" -ForegroundColor Green
foreach ($module in $modules) {
    Write-Host "  - $($module.Name) ($([math]::Round($module.Length/1KB, 1)) KB)" -ForegroundColor Gray
}
Write-Host ""

# Test each module
foreach ($module in $modules) {
    $moduleName = $module.BaseName
    Write-Host "Testing: $moduleName" -ForegroundColor Yellow
    
    $result = @{
        Module = $moduleName
        Status = "UNKNOWN"
        ImportSuccess = $false
        HasInvokeDiscovery = $false
        HasGetDiscoveryInfo = $false
        FunctionCount = 0
        ErrorMessage = ""
    }
    
    try {
        # Import module
        Write-Host "  Importing module..." -ForegroundColor Gray
        Import-Module $module.FullName -Force -DisableNameChecking -ErrorAction Stop
        $result.ImportSuccess = $true
        Write-Host "  ✓ Import: SUCCESS" -ForegroundColor Green
        
        # Get exported functions
        $commands = Get-Command -Module $moduleName -ErrorAction SilentlyContinue
        $result.FunctionCount = $commands.Count
        Write-Host "  ✓ Functions: $($commands.Count) exported" -ForegroundColor Green
        
        # Check for required functions
        $invokeDiscovery = Get-Command "Invoke-Discovery" -ErrorAction SilentlyContinue
        $getDiscoveryInfo = Get-Command "Get-DiscoveryInfo" -ErrorAction SilentlyContinue
        
        $result.HasInvokeDiscovery = $null -ne $invokeDiscovery
        $result.HasGetDiscoveryInfo = $null -ne $getDiscoveryInfo
        
        if ($result.HasInvokeDiscovery -and $result.HasGetDiscoveryInfo) {
            $result.Status = "READY"
            Write-Host "  ✓ Orchestrator Interface: COMPLETE" -ForegroundColor Green
            Write-Host "    - Invoke-Discovery: Available" -ForegroundColor Green
            Write-Host "    - Get-DiscoveryInfo: Available" -ForegroundColor Green
        }
        elseif ($result.HasInvokeDiscovery) {
            $result.Status = "PARTIAL"
            Write-Host "  ⚠ Orchestrator Interface: PARTIAL" -ForegroundColor Yellow
            Write-Host "    - Invoke-Discovery: Available" -ForegroundColor Green
            Write-Host "    - Get-DiscoveryInfo: Missing" -ForegroundColor Red
        }
        else {
            $result.Status = "NOT_READY"
            Write-Host "  ✗ Orchestrator Interface: MISSING" -ForegroundColor Red
            Write-Host "    - Invoke-Discovery: Missing" -ForegroundColor Red
            Write-Host "    - Get-DiscoveryInfo: Missing" -ForegroundColor Red
        }
        
        # Test Get-DiscoveryInfo if available
        if ($result.HasGetDiscoveryInfo) {
            try {
                $info = Get-DiscoveryInfo
                Write-Host "  ✓ Module Info: $($info.Name) v$($info.Version)" -ForegroundColor Green
            }
            catch {
                Write-Host "  ⚠ Module Info Error: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
        
    }
    catch {
        $result.ImportSuccess = $false
        $result.Status = "IMPORT_FAILED"
        $result.ErrorMessage = $_.Exception.Message
        Write-Host "  ✗ Import: FAILED" -ForegroundColor Red
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    $results += $result
    Write-Host "  Status: $($result.Status)" -ForegroundColor $(
        switch ($result.Status) {
            "READY" { "Green" }
            "PARTIAL" { "Yellow" }
            default { "Red" }
        }
    )
    Write-Host ""
}

# Generate summary
$duration = (Get-Date) - $startTime
Write-Host "=== COMPREHENSIVE SUMMARY ===" -ForegroundColor Cyan
Write-Host "Test Duration: $($duration.TotalSeconds.ToString('F2')) seconds" -ForegroundColor Gray
Write-Host ""

$ready = ($results | Where-Object { $_.Status -eq "READY" }).Count
$partial = ($results | Where-Object { $_.Status -eq "PARTIAL" }).Count
$notReady = ($results | Where-Object { $_.Status -eq "NOT_READY" }).Count
$failed = ($results | Where-Object { $_.Status -eq "IMPORT_FAILED" }).Count

Write-Host "DISCOVERY MODULE STATUS:" -ForegroundColor White
Write-Host "  Total Modules: $($results.Count)" -ForegroundColor White
Write-Host "  Ready for Orchestrator: $ready" -ForegroundColor Green
Write-Host "  Partially Ready: $partial" -ForegroundColor Yellow
Write-Host "  Not Ready: $notReady" -ForegroundColor Red
Write-Host "  Import Failed: $failed" -ForegroundColor Red
Write-Host ""

# Detailed breakdown
if ($ready -gt 0) {
    Write-Host "READY MODULES (Full orchestrator compatibility):" -ForegroundColor Green
    $readyModules = $results | Where-Object { $_.Status -eq "READY" }
    foreach ($mod in $readyModules) {
        Write-Host "  ✓ $($mod.Module) - $($mod.FunctionCount) functions" -ForegroundColor Green
    }
    Write-Host ""
}

if ($partial -gt 0) {
    Write-Host "PARTIAL MODULES (Missing Get-DiscoveryInfo):" -ForegroundColor Yellow
    $partialModules = $results | Where-Object { $_.Status -eq "PARTIAL" }
    foreach ($mod in $partialModules) {
        Write-Host "  ⚠ $($mod.Module) - $($mod.FunctionCount) functions" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($notReady -gt 0) {
    Write-Host "NOT READY MODULES (Missing orchestrator interface):" -ForegroundColor Red
    $notReadyModules = $results | Where-Object { $_.Status -eq "NOT_READY" }
    foreach ($mod in $notReadyModules) {
        Write-Host "  ✗ $($mod.Module) - $($mod.FunctionCount) functions" -ForegroundColor Red
    }
    Write-Host ""
}

if ($failed -gt 0) {
    Write-Host "FAILED MODULES (Import errors):" -ForegroundColor Red
    $failedModules = $results | Where-Object { $_.Status -eq "IMPORT_FAILED" }
    foreach ($mod in $failedModules) {
        Write-Host "  ✗ $($mod.Module) - $($mod.ErrorMessage)" -ForegroundColor Red
    }
    Write-Host ""
}

# Overall assessment
$readyPercentage = [math]::Round(($ready / $results.Count) * 100, 1)
$functionalPercentage = [math]::Round((($ready + $partial) / $results.Count) * 100, 1)

Write-Host "ORCHESTRATOR READINESS ASSESSMENT:" -ForegroundColor Cyan
Write-Host "  Fully Ready: $readyPercentage% ($ready/$($results.Count))" -ForegroundColor White
Write-Host "  Functionally Ready: $functionalPercentage% ($($ready + $partial)/$($results.Count))" -ForegroundColor White
Write-Host ""

if ($ready -eq $results.Count) {
    Write-Host "🎯 ALL DISCOVERY MODULES ARE ORCHESTRATOR-READY!" -ForegroundColor Green
    Write-Host "   Complete orchestrator integration achieved" -ForegroundColor Green
}
elseif ($functionalPercentage -ge 80) {
    Write-Host "⚠️ DISCOVERY MODULES MOSTLY READY FOR ORCHESTRATOR" -ForegroundColor Yellow
    Write-Host "   Most modules functional, some missing Get-DiscoveryInfo" -ForegroundColor Yellow
}
else {
    Write-Host "❌ DISCOVERY MODULES NEED WORK FOR ORCHESTRATOR" -ForegroundColor Red
    Write-Host "   Multiple modules require interface implementation" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== MONITORING COMPLETE ===" -ForegroundColor Cyan

# Export results
$logPath = "Logs"
if (-not (Test-Path $logPath)) { New-Item -Path $logPath -ItemType Directory -Force | Out-Null }
$resultsFile = Join-Path $logPath "DiscoveryModuleResults_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"

$exportData = @{
    Timestamp = Get-Date
    TestDuration = $duration
    Summary = @{
        TotalModules = $results.Count
        ReadyModules = $ready
        PartialModules = $partial
        NotReadyModules = $notReady
        FailedModules = $failed
        ReadyPercentage = $readyPercentage
        FunctionalPercentage = $functionalPercentage
    }
    Results = $results
}

$exportData | ConvertTo-Json -Depth 5 | Out-File -FilePath $resultsFile -Encoding UTF8
Write-Host "Results exported to: $resultsFile" -ForegroundColor Green

# Return exit code
if ($failed -eq 0 -and $notReady -eq 0) {
    exit 0
}
elseif ($functionalPercentage -ge 80) {
    exit 1
}
else {
    exit 2
}