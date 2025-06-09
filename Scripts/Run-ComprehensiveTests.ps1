# Simple Test Runner for Comprehensive Discovery Module Testing
# Demonstrates various testing scenarios and configurations

param(
    [string]$TestType = "Basic",
    [string]$ModulesPath = "Modules/Discovery",
    [string]$OutputPath = "TestResults"
)

function Write-TestHeader {
    param([string]$Title)
    Write-Host "`n" -NoNewline
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host " $Title " -ForegroundColor Yellow
    Write-Host "=" * 60 -ForegroundColor Cyan
}

function Write-TestInfo {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Gray
}

function Write-TestSuccess {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-TestError {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Main test execution
Write-TestHeader "Comprehensive Discovery Module Testing Protocol"

Write-TestInfo "Test Type: $TestType"
Write-TestInfo "Modules Path: $ModulesPath"
Write-TestInfo "Output Path: $OutputPath"

try {
    switch ($TestType.ToLower()) {
        "basic" {
            Write-TestHeader "Running Basic Functional Tests"
            Write-TestInfo "Executing functional tests only..."
            
            & "$PSScriptRoot\Comprehensive-DiscoveryModuleTesting.ps1" `
                -ModulesPath $ModulesPath `
                -OutputPath $OutputPath
        }
        
        "performance" {
            Write-TestHeader "Running Performance Tests"
            Write-TestInfo "Executing functional and performance tests..."
            
            & "$PSScriptRoot\Comprehensive-DiscoveryModuleTesting.ps1" `
                -ModulesPath $ModulesPath `
                -OutputPath $OutputPath `
                -PerformanceTest
        }
        
        "load" {
            Write-TestHeader "Running Load Tests"
            Write-TestInfo "Executing functional and load tests..."
            
            & "$PSScriptRoot\Comprehensive-DiscoveryModuleTesting.ps1" `
                -ModulesPath $ModulesPath `
                -OutputPath $OutputPath `
                -LoadTest `
                -LoadTestUsers 15 `
                -LoadTestDuration 90
        }
        
        "integration" {
            Write-TestHeader "Running Integration Tests"
            Write-TestInfo "Executing functional and integration tests..."
            
            & "$PSScriptRoot\Comprehensive-DiscoveryModuleTesting.ps1" `
                -ModulesPath $ModulesPath `
                -OutputPath $OutputPath `
                -IntegrationTest
        }
        
        "regression" {
            Write-TestHeader "Running Regression Tests"
            Write-TestInfo "Executing functional and regression tests..."
            
            & "$PSScriptRoot\Comprehensive-DiscoveryModuleTesting.ps1" `
                -ModulesPath $ModulesPath `
                -OutputPath $OutputPath `
                -RegressionTest
        }
        
        "comprehensive" {
            Write-TestHeader "Running Comprehensive Test Suite"
            Write-TestInfo "Executing all test categories with result export..."
            
            & "$PSScriptRoot\Comprehensive-DiscoveryModuleTesting.ps1" `
                -ModulesPath $ModulesPath `
                -OutputPath $OutputPath `
                -PerformanceTest `
                -LoadTest `
                -IntegrationTest `
                -RegressionTest `
                -ExportResults `
                -LoadTestUsers 20 `
                -LoadTestDuration 120
        }
        
        "quick" {
            Write-TestHeader "Running Quick Validation Tests"
            Write-TestInfo "Executing minimal test set for quick validation..."
            
            & "$PSScriptRoot\Comprehensive-DiscoveryModuleTesting.ps1" `
                -ModulesPath $ModulesPath `
                -OutputPath $OutputPath `
                -LoadTestUsers 5 `
                -LoadTestDuration 30
        }
        
        default {
            Write-TestError "Unknown test type: $TestType"
            Write-TestInfo "Available test types:"
            Write-TestInfo "  - Basic: Functional tests only"
            Write-TestInfo "  - Performance: Functional + Performance tests"
            Write-TestInfo "  - Load: Functional + Load tests"
            Write-TestInfo "  - Integration: Functional + Integration tests"
            Write-TestInfo "  - Regression: Functional + Regression tests"
            Write-TestInfo "  - Comprehensive: All test categories"
            Write-TestInfo "  - Quick: Minimal test set for quick validation"
            exit 1
        }
    }
    
    Write-TestSuccess "Test execution completed successfully!"
    
} catch {
    Write-TestError "Test execution failed: $($_.Exception.Message)"
    exit 1
}

Write-TestHeader "Test Execution Summary"
Write-TestInfo "Check the output above for detailed test results"
Write-TestInfo "Test artifacts saved to: $OutputPath"

# Display usage examples
Write-TestHeader "Usage Examples"
Write-Host @"
# Run basic functional tests
.\Scripts\Run-ComprehensiveTests.ps1 -TestType Basic

# Run performance tests
.\Scripts\Run-ComprehensiveTests.ps1 -TestType Performance

# Run comprehensive test suite
.\Scripts\Run-ComprehensiveTests.ps1 -TestType Comprehensive

# Run tests with custom paths
.\Scripts\Run-ComprehensiveTests.ps1 -TestType Basic -ModulesPath "Custom\Path" -OutputPath "Custom\Results"
"@ -ForegroundColor Gray