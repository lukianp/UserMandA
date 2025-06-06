# Test script to verify DiscoveryResult class is accessible to all discovery modules
param(
    [switch]$Verbose
)

Write-Host "Testing DiscoveryResult class accessibility across all discovery modules..." -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Initialize the global context (simulate what QuickStart does)
$scriptPath = Split-Path $PSScriptRoot -Parent
. (Join-Path $scriptPath "Scripts\Set-SuiteEnvironment.ps1")

# Test the global DiscoveryResult class first
Write-Host "`n1. Testing Global DiscoveryResult Class Definition..." -ForegroundColor Yellow
try {
    # This should be defined by the Orchestrator's Add-Type
    $testResult = [DiscoveryResult]::new('TestModule')
    Write-Host "   ✓ Global DiscoveryResult class is accessible" -ForegroundColor Green
    Write-Host "   ✓ Constructor works: ModuleName = $($testResult.ModuleName)" -ForegroundColor Green
    Write-Host "   ✓ Success property: $($testResult.Success)" -ForegroundColor Green
    
    # Test methods
    $testResult.AddError("Test error", $null)
    Write-Host "   ✓ AddError method works: Error count = $($testResult.Errors.Count)" -ForegroundColor Green
    
    $testResult.AddWarning("Test warning")
    Write-Host "   ✓ AddWarning method works: Warning count = $($testResult.Warnings.Count)" -ForegroundColor Green
    
    $testResult.Complete()
    Write-Host "   ✓ Complete method works: EndTime = $($testResult.EndTime)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Global DiscoveryResult class test failed: $_" -ForegroundColor Red
    return
}

# Test each discovery module
Write-Host "`n2. Testing Discovery Modules..." -ForegroundColor Yellow

$discoveryModules = @(
    "ActiveDirectoryDiscovery",
    "AzureDiscovery", 
    "EnvironmentDetectionDiscovery",
    "ExchangeDiscovery",
    "ExternalIdentityDiscovery",
    "FileServerDiscovery",
    "GPODiscovery",
    "GraphDiscovery",
    "IntuneDiscovery",
    "LicensingDiscovery",
    "NetworkInfrastructureDiscovery",
    "SharePointDiscovery",
    "TeamsDiscovery"
)

$successCount = 0
$failureCount = 0

foreach ($module in $discoveryModules) {
    $modulePath = Join-Path $global:MandA.Paths.Discovery "$module.psm1"
    
    if (Test-Path $modulePath) {
        try {
            Write-Host "   Testing $module..." -ForegroundColor Gray
            
            # Import the module
            Import-Module $modulePath -Force -ErrorAction Stop
            
            # Test if the module can create a DiscoveryResult
            $moduleResult = [DiscoveryResult]::new($module)
            
            # Test basic functionality
            $moduleResult.AddError("Test error for $module", $null)
            $moduleResult.AddWarning("Test warning for $module")
            $moduleResult.Complete()
            
            Write-Host "   ✓ $module - DiscoveryResult class accessible and functional" -ForegroundColor Green
            $successCount++
            
            if ($Verbose) {
                Write-Host "     - ModuleName: $($moduleResult.ModuleName)" -ForegroundColor DarkGray
                Write-Host "     - Success: $($moduleResult.Success)" -ForegroundColor DarkGray
                Write-Host "     - Errors: $($moduleResult.Errors.Count)" -ForegroundColor DarkGray
                Write-Host "     - Warnings: $($moduleResult.Warnings.Count)" -ForegroundColor DarkGray
            }
            
        } catch {
            Write-Host "   ✗ $module - Failed: $_" -ForegroundColor Red
            $failureCount++
        }
    } else {
        Write-Host "   ⚠ $module - Module file not found: $modulePath" -ForegroundColor Yellow
    }
}

# Summary
Write-Host "`n3. Test Summary" -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Total Modules Tested: $($successCount + $failureCount)" -ForegroundColor White
Write-Host "Successful: $successCount" -ForegroundColor Green
Write-Host "Failed: $failureCount" -ForegroundColor $(if ($failureCount -eq 0) { "Green" } else { "Red" })

if ($failureCount -eq 0) {
    Write-Host "`n🎉 ALL TESTS PASSED! DiscoveryResult class fix is working correctly." -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n❌ Some tests failed. The fix may need additional work." -ForegroundColor Red
    exit 1
}