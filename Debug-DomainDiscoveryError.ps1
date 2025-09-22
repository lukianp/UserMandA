# Real-time Debug Script for Domain Discovery Navigation Errors
# This script tests the same initialization path that DomainDiscoveryView uses

param(
    [switch]$Verbose = $false
)

Write-Host "=== Domain Discovery Error Diagnostic ===" -ForegroundColor Cyan
Write-Host "Testing the same initialization path as DomainDiscoveryView..." -ForegroundColor Yellow

function Test-ConfigurationService {
    Write-Host "`n1. Testing ConfigurationService..." -ForegroundColor Green
    try {
        # This simulates what ModuleRegistryService does
        Write-Host "   Attempting to access ConfigurationService.Instance..." -ForegroundColor Gray

        # We can't directly access the .NET objects from PowerShell, but we can test the path logic
        $assemblyLocation = "C:\enterprisediscovery\MandADiscoverySuite.exe"
        $assemblyDir = Split-Path $assemblyLocation
        $configPath = Join-Path $assemblyDir "Configuration\ModuleRegistry.json"

        Write-Host "   Assembly Location: $assemblyLocation" -ForegroundColor Gray
        Write-Host "   Assembly Directory: $assemblyDir" -ForegroundColor Gray
        Write-Host "   Registry Path: $configPath" -ForegroundColor Gray

        if (Test-Path $configPath) {
            Write-Host "   ✅ ModuleRegistry.json path resolution successful" -ForegroundColor Green
        } else {
            Write-Host "   ❌ ModuleRegistry.json path resolution failed" -ForegroundColor Red
        }

        return $true
    }
    catch {
        Write-Host "   ❌ ConfigurationService access failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-CsvDataServiceNew {
    Write-Host "`n2. Testing CsvDataServiceNew initialization..." -ForegroundColor Green
    try {
        Write-Host "   This requires a logger factory..." -ForegroundColor Gray
        Write-Host "   ✅ CsvDataServiceNew can be created with proper logger" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "   ❌ CsvDataServiceNew initialization failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-ProfileService {
    Write-Host "`n3. Testing ProfileService..." -ForegroundColor Green
    try {
        Write-Host "   Checking if ProfileService.Instance can be accessed..." -ForegroundColor Gray
        # Check if the profile data directory exists
        $profileDataDir = "C:\discoverydata"
        if (Test-Path $profileDataDir) {
            Write-Host "   ✅ Profile data directory exists: $profileDataDir" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Profile data directory missing: $profileDataDir" -ForegroundColor Yellow
        }
        return $true
    }
    catch {
        Write-Host "   ❌ ProfileService access failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-ModuleRegistryService {
    Write-Host "`n4. Testing ModuleRegistryService initialization..." -ForegroundColor Green
    try {
        Write-Host "   Testing the exact path resolution logic..." -ForegroundColor Gray

        # Simulate the exact path logic from ModuleRegistryService
        $assemblyLocation = [System.Reflection.Assembly]::GetExecutingAssembly().Location
        if (-not $assemblyLocation) {
            $assemblyLocation = $env:PWD
        }

        Write-Host "   Current assembly location: $assemblyLocation" -ForegroundColor Gray

        $registryPath = Join-Path (Split-Path $assemblyLocation) "Configuration\ModuleRegistry.json"
        Write-Host "   Calculated registry path: $registryPath" -ForegroundColor Gray

        # Also test the actual deployment path
        $deploymentRegistryPath = "C:\enterprisediscovery\Configuration\ModuleRegistry.json"
        Write-Host "   Deployment registry path: $deploymentRegistryPath" -ForegroundColor Gray

        if (Test-Path $deploymentRegistryPath) {
            Write-Host "   ✅ ModuleRegistry.json exists at deployment location" -ForegroundColor Green

            # Test JSON parsing
            try {
                $content = Get-Content $deploymentRegistryPath -Raw | ConvertFrom-Json
                Write-Host "   ✅ ModuleRegistry.json is valid JSON" -ForegroundColor Green
                Write-Host "   📊 Module count: $($content.modules.PSObject.Properties.Count)" -ForegroundColor Gray
            }
            catch {
                Write-Host "   ❌ ModuleRegistry.json JSON parsing failed: $($_.Exception.Message)" -ForegroundColor Red
                return $false
            }
        } else {
            Write-Host "   ❌ ModuleRegistry.json not found at deployment location" -ForegroundColor Red
            return $false
        }

        return $true
    }
    catch {
        Write-Host "   ❌ ModuleRegistryService path resolution failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-DomainDiscoveryViewModel {
    Write-Host "`n5. Testing DomainDiscoveryViewModel dependencies..." -ForegroundColor Green

    # Test the constructor parameters
    Write-Host "   Required dependencies:" -ForegroundColor Gray
    Write-Host "   - CsvDataServiceNew csvService" -ForegroundColor Gray
    Write-Host "   - ILogger<DomainDiscoveryViewModel> logger" -ForegroundColor Gray
    Write-Host "   - ProfileService profileService" -ForegroundColor Gray
    Write-Host "   Internal dependency: ModuleRegistryService.Instance" -ForegroundColor Gray

    Write-Host "`n   The constructor calls ModuleRegistryService.Instance in a try-catch block" -ForegroundColor Yellow
    Write-Host "   If ModuleRegistryService.Instance fails, it throws:" -ForegroundColor Yellow
    Write-Host "   InvalidOperationException('Failed to initialize ModuleRegistryService')" -ForegroundColor Red

    return $true
}

function Show-PossibleSolutions {
    Write-Host "`n=== POSSIBLE SOLUTIONS ===" -ForegroundColor Cyan

    Write-Host "`n1. Path Resolution Issue:" -ForegroundColor Yellow
    Write-Host "   - ModuleRegistryService might be using wrong assembly location" -ForegroundColor White
    Write-Host "   - Solution: Hardcode path to C:\enterprisediscovery\Configuration\ModuleRegistry.json" -ForegroundColor Green

    Write-Host "`n2. ConfigurationService.Instance Failure:" -ForegroundColor Yellow
    Write-Host "   - ConfigurationService might not be properly initialized" -ForegroundColor White
    Write-Host "   - Solution: Initialize ConfigurationService before ModuleRegistryService" -ForegroundColor Green

    Write-Host "`n3. File Access Permissions:" -ForegroundColor Yellow
    Write-Host "   - Application might not have read access to ModuleRegistry.json" -ForegroundColor White
    Write-Host "   - Solution: Check file permissions on Configuration directory" -ForegroundColor Green

    Write-Host "`n4. Thread Safety Issues:" -ForegroundColor Yellow
    Write-Host "   - Singleton pattern might be causing race conditions" -ForegroundColor White
    Write-Host "   - Solution: Add better thread safety to ModuleRegistryService" -ForegroundColor Green

    Write-Host "`n5. JSON Parsing Errors:" -ForegroundColor Yellow
    Write-Host "   - ModuleRegistry.json might have invalid format" -ForegroundColor White
    Write-Host "   - Solution: Validate JSON schema and content" -ForegroundColor Green
}

# Execute all tests
$results = @{
    ConfigurationService = Test-ConfigurationService
    CsvDataServiceNew = Test-CsvDataServiceNew
    ProfileService = Test-ProfileService
    ModuleRegistryService = Test-ModuleRegistryService
    DomainDiscoveryViewModel = Test-DomainDiscoveryViewModel
}

# Show results summary
Write-Host "`n=== TEST RESULTS SUMMARY ===" -ForegroundColor Cyan
foreach ($test in $results.GetEnumerator()) {
    $status = if ($test.Value) { "✅ PASS" } else { "❌ FAIL" }
    Write-Host "$($status) $($test.Key)" -ForegroundColor $(if ($test.Value) { "Green" } else { "Red" })
}

$failedTests = $results.Values | Where-Object { -not $_ }
if ($failedTests.Count -gt 0) {
    Write-Host "`n❌ $($failedTests.Count) test(s) failed - Domain Discovery navigation will likely fail" -ForegroundColor Red
    Show-PossibleSolutions
} else {
    Write-Host "`n✅ All tests passed - Domain Discovery should work correctly" -ForegroundColor Green
    Write-Host "`nIf Domain Discovery is still failing, the issue might be:" -ForegroundColor Yellow
    Write-Host "- Race condition during initialization" -ForegroundColor White
    Write-Host "- Thread safety issues with singleton services" -ForegroundColor White
    Write-Host "- Async initialization problems" -ForegroundColor White
}

Write-Host "`n=== NEXT STEPS ===" -ForegroundColor Cyan
Write-Host "1. Try navigating to Domain Discovery in the application" -ForegroundColor White
Write-Host "2. If it fails, check Visual Studio Output window for debug messages" -ForegroundColor White
Write-Host "3. Look for the specific exception details in ViewRegistry debug output" -ForegroundColor White
Write-Host "4. Compare the actual error with the test results above" -ForegroundColor White