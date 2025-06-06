# Simple test to verify DiscoveryResult class works
Write-Host "Testing DiscoveryResult class..." -ForegroundColor Cyan

# Initialize environment
$scriptPath = Split-Path $PSScriptRoot -Parent
. (Join-Path $scriptPath "Scripts\Set-SuiteEnvironment.ps1")

try {
    # Test global class
    $result = [DiscoveryResult]::new('TestModule')
    Write-Host "SUCCESS: DiscoveryResult class is accessible" -ForegroundColor Green
    Write-Host "ModuleName: $($result.ModuleName)" -ForegroundColor Gray
    Write-Host "Success: $($result.Success)" -ForegroundColor Gray
    
    # Test methods
    $result.AddError("Test error", $null)
    $result.AddWarning("Test warning")
    $result.Complete()
    
    Write-Host "SUCCESS: All methods work correctly" -ForegroundColor Green
    Write-Host "Errors: $($result.Errors.Count)" -ForegroundColor Gray
    Write-Host "Warnings: $($result.Warnings.Count)" -ForegroundColor Gray
    
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
    exit 1
}

# Test a few key modules
$testModules = @("ActiveDirectoryDiscovery", "AzureDiscovery", "GraphDiscovery")
foreach ($module in $testModules) {
    try {
        $modulePath = Join-Path $global:MandA.Paths.Discovery "$module.psm1"
        Import-Module $modulePath -Force
        $moduleResult = [DiscoveryResult]::new($module)
        Write-Host "SUCCESS: $module can use DiscoveryResult" -ForegroundColor Green
    } catch {
        Write-Host "FAILED: $module - $_" -ForegroundColor Red
    }
}

Write-Host "Test completed!" -ForegroundColor Cyan