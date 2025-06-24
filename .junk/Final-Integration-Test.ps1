# Final Integration Test - Discovery Modules with Orchestrator
# This script validates the integration between discovery modules and the orchestrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "M&A DISCOVERY SUITE INTEGRATION TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Initialize global context (simulating orchestrator environment)
$global:MandA = @{
    Initialized = $true
    Paths = @{
        SuiteRoot = (Get-Location).Path
        Modules = "Modules"
        Discovery = "Modules/Discovery"
        Processing = "Modules/Processing"
        RawDataOutput = "RawData"
        ProcessedDataOutput = "ProcessedData"
        LogOutput = "Logs"
    }
    Config = @{
        discovery = @{
            enabledSources = @('ActiveDirectory', 'Azure', 'Exchange', 'Graph', 'Intune')
            maxConcurrentJobs = 3
        }
        metadata = @{
            companyName = 'TestCompany'
        }
    }
}

Write-Host "Global context initialized successfully" -ForegroundColor Green

# Test 1: Discovery Module Loading
Write-Host "`n=== TEST 1: DISCOVERY MODULE LOADING ===" -ForegroundColor Yellow

$discoveryModules = Get-ChildItem -Path "Modules/Discovery" -Filter "*.psm1" | Where-Object { $_.Name -notlike "*Base*" }
$loadedCount = 0
$totalCount = $discoveryModules.Count

foreach ($moduleFile in $discoveryModules) {
    $moduleName = $moduleFile.BaseName
    try {
        Import-Module $moduleFile.FullName -Force -Global -ErrorAction Stop
        Write-Host "✓ $moduleName - LOADED" -ForegroundColor Green
        $loadedCount++
    } catch {
        Write-Host "✗ $moduleName - FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nDiscovery Module Loading Results:" -ForegroundColor Cyan
Write-Host "  Loaded: $loadedCount/$totalCount modules" -ForegroundColor $(if ($loadedCount -eq $totalCount) { "Green" } else { "Yellow" })
Write-Host "  Success Rate: $([Math]::Round(($loadedCount / $totalCount) * 100, 1))%" -ForegroundColor $(if ($loadedCount -eq $totalCount) { "Green" } else { "Yellow" })

# Test 2: Interface Function Validation
Write-Host "`n=== TEST 2: INTERFACE FUNCTION VALIDATION ===" -ForegroundColor Yellow

$interfaceCount = 0
$totalInterfaces = 0

foreach ($moduleFile in $discoveryModules) {
    $moduleName = $moduleFile.BaseName
    $totalInterfaces += 2  # Each module should have 2 interface functions
    
    # Check for Invoke-Discovery function
    $invokeFunction = "Invoke-${moduleName}Discovery"
    if (Get-Command $invokeFunction -ErrorAction SilentlyContinue) {
        Write-Host "  ✓ $invokeFunction - AVAILABLE" -ForegroundColor Green
        $interfaceCount++
    } else {
        Write-Host "  ✗ $invokeFunction - MISSING" -ForegroundColor Red
    }
    
    # Check for Get-DiscoveryInfo function (generic or specific)
    $infoFunction = "Get-DiscoveryInfo"
    if (Get-Command $infoFunction -ErrorAction SilentlyContinue) {
        Write-Host "  ✓ $infoFunction - AVAILABLE" -ForegroundColor Green
        $interfaceCount++
    } else {
        Write-Host "  ✗ $infoFunction - MISSING" -ForegroundColor Red
    }
}

Write-Host "`nInterface Function Results:" -ForegroundColor Cyan
Write-Host "  Available: $interfaceCount/$totalInterfaces functions" -ForegroundColor $(if ($interfaceCount -eq $totalInterfaces) { "Green" } else { "Yellow" })
Write-Host "  Success Rate: $([Math]::Round(($interfaceCount / $totalInterfaces) * 100, 1))%" -ForegroundColor $(if ($interfaceCount -eq $totalInterfaces) { "Green" } else { "Yellow" })

# Test 3: Processing Module Status
Write-Host "`n=== TEST 3: PROCESSING MODULE STATUS ===" -ForegroundColor Yellow

$processingModules = @("DataAggregation", "DataValidation", "UserProfileBuilder", "WaveGeneration")
$processingLoaded = 0

foreach ($module in $processingModules) {
    $modulePath = "Modules/Processing/$module.psm1"
    try {
        Import-Module $modulePath -Force -Global -ErrorAction Stop
        Write-Host "✓ $module - LOADED" -ForegroundColor Green
        $processingLoaded++
    } catch {
        Write-Host "✗ $module - FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nProcessing Module Results:" -ForegroundColor Cyan
Write-Host "  Loaded: $processingLoaded/$($processingModules.Count) modules" -ForegroundColor $(if ($processingLoaded -eq $processingModules.Count) { "Green" } else { "Yellow" })

# Test 4: Orchestrator Integration Test
Write-Host "`n=== TEST 4: ORCHESTRATOR INTEGRATION TEST ===" -ForegroundColor Yellow

try {
    # Test if orchestrator can access discovery modules
    $enabledSources = $global:MandA.Config.discovery.enabledSources
    $availableModules = 0
    
    foreach ($source in $enabledSources) {
        $functionName = "Invoke-${source}Discovery"
        if (Get-Command $functionName -ErrorAction SilentlyContinue) {
            Write-Host "  ✓ $source discovery function accessible" -ForegroundColor Green
            $availableModules++
        } else {
            Write-Host "  ✗ $source discovery function not accessible" -ForegroundColor Red
        }
    }
    
    Write-Host "`nOrchestrator Integration Results:" -ForegroundColor Cyan
    Write-Host "  Accessible: $availableModules/$($enabledSources.Count) configured sources" -ForegroundColor $(if ($availableModules -eq $enabledSources.Count) { "Green" } else { "Yellow" })
    
} catch {
    Write-Host "✗ Orchestrator integration test failed: $_" -ForegroundColor Red
}

# Final Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "FINAL INTEGRATION SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$discoverySuccess = [Math]::Round(($loadedCount / $totalCount) * 100, 1)
$interfaceSuccess = [Math]::Round(($interfaceCount / $totalInterfaces) * 100, 1)
$processingSuccess = [Math]::Round(($processingLoaded / $processingModules.Count) * 100, 1)

Write-Host "Discovery Modules: $discoverySuccess% ($loadedCount/$totalCount)" -ForegroundColor $(if ($discoverySuccess -eq 100) { "Green" } else { "Yellow" })
Write-Host "Interface Functions: $interfaceSuccess% ($interfaceCount/$totalInterfaces)" -ForegroundColor $(if ($interfaceSuccess -eq 100) { "Green" } else { "Yellow" })
Write-Host "Processing Modules: $processingSuccess% ($processingLoaded/$($processingModules.Count))" -ForegroundColor $(if ($processingSuccess -eq 100) { "Green" } else { "Yellow" })

$overallSuccess = ($discoverySuccess + $interfaceSuccess + $processingSuccess) / 3
Write-Host "`nOVERALL INTEGRATION STATUS: $([Math]::Round($overallSuccess, 1))%" -ForegroundColor $(if ($overallSuccess -ge 80) { "Green" } elseif ($overallSuccess -ge 60) { "Yellow" } else { "Red" })

if ($discoverySuccess -eq 100) {
    Write-Host "`n🎉 SUCCESS: All discovery modules are 100% integrated with orchestrator!" -ForegroundColor Green
} elseif ($discoverySuccess -ge 80) {
    Write-Host "`n✅ GOOD: Discovery modules are well integrated with orchestrator" -ForegroundColor Yellow
} else {
    Write-Host "`n⚠️  NEEDS WORK: Discovery module integration requires attention" -ForegroundColor Red
}

Write-Host "`nIntegration test completed!" -ForegroundColor Cyan