# Simple Integration Test - Discovery Modules with Orchestrator

Write-Host "M&A DISCOVERY SUITE INTEGRATION TEST" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Initialize global context
$global:MandA = @{
    Initialized = $true
    Paths = @{
        Discovery = "Modules/Discovery"
        Processing = "Modules/Processing"
    }
    Config = @{
        discovery = @{
            enabledSources = @('ActiveDirectory', 'Azure', 'Exchange')
        }
    }
}

Write-Host "Global context initialized" -ForegroundColor Green

# Test Discovery Module Loading
Write-Host "`nTesting Discovery Module Loading..." -ForegroundColor Yellow

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
        Write-Host "✗ $moduleName - FAILED" -ForegroundColor Red
    }
}

# Test Interface Functions
Write-Host "`nTesting Interface Functions..." -ForegroundColor Yellow

$interfaceCount = 0
$totalInterfaces = 0

foreach ($moduleFile in $discoveryModules) {
    $moduleName = $moduleFile.BaseName
    $totalInterfaces += 1
    
    $invokeFunction = "Invoke-${moduleName}Discovery"
    if (Get-Command $invokeFunction -ErrorAction SilentlyContinue) {
        Write-Host "  ✓ $invokeFunction - AVAILABLE" -ForegroundColor Green
        $interfaceCount++
    } else {
        Write-Host "  ✗ $invokeFunction - MISSING" -ForegroundColor Red
    }
}

# Test Processing Modules
Write-Host "`nTesting Processing Modules..." -ForegroundColor Yellow

$processingModules = @("DataAggregation", "DataValidation")
$processingLoaded = 0

foreach ($module in $processingModules) {
    $modulePath = "Modules/Processing/$module.psm1"
    try {
        Import-Module $modulePath -Force -Global -ErrorAction Stop
        Write-Host "✓ $module - LOADED" -ForegroundColor Green
        $processingLoaded++
    } catch {
        Write-Host "✗ $module - FAILED" -ForegroundColor Red
    }
}

# Final Results
Write-Host "`n====================================" -ForegroundColor Cyan
Write-Host "INTEGRATION TEST RESULTS" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

$discoverySuccess = [Math]::Round(($loadedCount / $totalCount) * 100, 1)
$interfaceSuccess = [Math]::Round(($interfaceCount / $totalInterfaces) * 100, 1)
$processingSuccess = [Math]::Round(($processingLoaded / $processingModules.Count) * 100, 1)

Write-Host "Discovery Modules: $discoverySuccess% ($loadedCount/$totalCount)" -ForegroundColor Green
Write-Host "Interface Functions: $interfaceSuccess% ($interfaceCount/$totalInterfaces)" -ForegroundColor Green
Write-Host "Processing Modules: $processingSuccess% ($processingLoaded/$($processingModules.Count))" -ForegroundColor Green

$overallSuccess = ($discoverySuccess + $interfaceSuccess + $processingSuccess) / 3
Write-Host "`nOVERALL INTEGRATION: $([Math]::Round($overallSuccess, 1))%" -ForegroundColor $(if ($overallSuccess -ge 80) { "Green" } else { "Yellow" })

if ($discoverySuccess -eq 100) {
    Write-Host "`nSUCCESS: Discovery modules are 100% integrated!" -ForegroundColor Green
} else {
    Write-Host "`nPARTIAL: Discovery modules partially integrated" -ForegroundColor Yellow
}

Write-Host "`nIntegration test completed!" -ForegroundColor Cyan