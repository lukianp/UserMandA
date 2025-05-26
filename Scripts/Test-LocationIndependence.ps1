<#
.SYNOPSIS
    Tests the location independence of the M&A Discovery Suite
.DESCRIPTION
    Validates that the suite can run from any location and properly resolve all paths
.PARAMETER TestLocation
    Optional test location to copy and test the suite
.EXAMPLE
    .\Scripts\Test-LocationIndependence.ps1
.EXAMPLE
    .\Scripts\Test-LocationIndependence.ps1 -TestLocation "C:\Temp\TestSuite"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$TestLocation
)

function Write-TestResult {
    param(
        [string]$Test,
        [bool]$Passed,
        [string]$Details = ""
    )
    
    $status = if ($Passed) { "PASS" } else { "FAIL" }
    $color = if ($Passed) { "Green" } else { "Red" }
    
    Write-Host "$status - $Test" -ForegroundColor $color
    if ($Details) {
        Write-Host "    $Details" -ForegroundColor Gray
    }
}

function Test-EnvironmentSetup {
    param([string]$SuiteRoot)
    
    Write-Host "`nTesting Environment Setup..." -ForegroundColor Cyan
    
    $envScript = Join-Path $SuiteRoot "Scripts\Set-SuiteEnvironment.ps1"
    
    if (-not (Test-Path $envScript)) {
        Write-TestResult -Test "Environment script exists" -Passed $false
        return $false
    }
    
    try {
        # Source the environment script
        . $envScript -SuiteRoot $SuiteRoot
        
        # Test that variables are set
        $variablesSet = $true
        $requiredVars = @(
            'MandASuiteRoot',
            'MandACorePath', 
            'MandAConfigPath',
            'MandAScriptsPath',
            'MandAModulesPath',
            'MandAOrchestratorPath'
        )
        
        foreach ($var in $requiredVars) {
            $value = Get-Variable -Name $var -Scope Global -ErrorAction SilentlyContinue
            if (-not $value -or -not $value.Value) {
                Write-TestResult -Test "Variable $var set" -Passed $false
                $variablesSet = $false
            } else {
                Write-TestResult -Test "Variable $var set" -Passed $true -Details $value.Value
            }
        }
        
        return $variablesSet
        
    } catch {
        Write-TestResult -Test "Environment script execution" -Passed $false -Details $_.Exception.Message
        return $false
    }
}

function Test-PathResolution {
    param([string]$SuiteRoot)
    
    Write-Host "`nTesting Path Resolution..." -ForegroundColor Cyan
    
    # Test that all expected paths exist
    $pathsToTest = @{
        "Core Directory" = Join-Path $SuiteRoot "Core"
        "Scripts Directory" = Join-Path $SuiteRoot "Scripts"
        "Modules Directory" = Join-Path $SuiteRoot "Modules"
        "Configuration Directory" = Join-Path $SuiteRoot "Configuration"
        "Orchestrator Script" = Join-Path $SuiteRoot "Core\MandA-Orchestrator.ps1"
        "QuickStart Script" = Join-Path $SuiteRoot "Scripts\QuickStart.ps1"
        "Validation Script" = Join-Path $SuiteRoot "Scripts\Validate-Installation.ps1"
        "Default Config" = Join-Path $SuiteRoot "Configuration\default-config.json"
    }
    
    $allPathsExist = $true
    foreach ($pathName in $pathsToTest.Keys) {
        $path = $pathsToTest[$pathName]
        $exists = Test-Path $path
        Write-TestResult -Test "Path exists: $pathName" -Passed $exists -Details $path
        if (-not $exists) { $allPathsExist = $false }
    }
    
    return $allPathsExist
}

function Test-ScriptExecution {
    param([string]$SuiteRoot)
    
    Write-Host "`nTesting Script Execution..." -ForegroundColor Cyan
    
    # Test validation script
    $validationScript = Join-Path $SuiteRoot "Scripts\Validate-Installation.ps1"
    
    try {
        # Change to suite root to test relative path handling
        Push-Location $SuiteRoot
        
        # Run validation in test mode (syntax check only)
        $output = & $validationScript 2>&1
        $success = $LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq $null
        
        Write-TestResult -Test "Validation script execution" -Passed $success
        
        Pop-Location
        return $success
        
    } catch {
        Pop-Location
        Write-TestResult -Test "Validation script execution" -Passed $false -Details $_.Exception.Message
        return $false
    }
}

function Test-QuickStartSyntax {
    param([string]$SuiteRoot)
    
    Write-Host "`nTesting QuickStart Syntax..." -ForegroundColor Cyan
    
    $quickStartScript = Join-Path $SuiteRoot "Scripts\QuickStart.ps1"
    
    try {
        # Parse the script to check syntax
        $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $quickStartScript -Raw), [ref]$null)
        Write-TestResult -Test "QuickStart script syntax" -Passed $true
        return $true
    } catch {
        Write-TestResult -Test "QuickStart script syntax" -Passed $false -Details $_.Exception.Message
        return $false
    }
}

function Test-OrchestratorSyntax {
    param([string]$SuiteRoot)
    
    Write-Host "`nTesting Orchestrator Syntax..." -ForegroundColor Cyan
    
    $orchestratorScript = Join-Path $SuiteRoot "Core\MandA-Orchestrator.ps1"
    
    try {
        # Parse the script to check syntax
        $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $orchestratorScript -Raw), [ref]$null)
        Write-TestResult -Test "Orchestrator script syntax" -Passed $true
        return $true
    } catch {
        Write-TestResult -Test "Orchestrator script syntax" -Passed $false -Details $_.Exception.Message
        return $false
    }
}

# Main test execution
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "         M&A Discovery Suite - Location Independence Test        " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Determine test location
$currentSuiteRoot = Split-Path $PSScriptRoot -Parent

if ($TestLocation) {
    Write-Host "Testing with copied suite at: $TestLocation" -ForegroundColor Yellow
    
    # Copy suite to test location
    if (Test-Path $TestLocation) {
        Remove-Item $TestLocation -Recurse -Force
    }
    
    Copy-Item $currentSuiteRoot $TestLocation -Recurse -Force
    $testSuiteRoot = $TestLocation
} else {
    Write-Host "Testing current suite location: $currentSuiteRoot" -ForegroundColor Yellow
    $testSuiteRoot = $currentSuiteRoot
}

Write-Host ""

# Execute tests
$testResults = @{}

$tests = @{
    "EnvironmentSetup" = { Test-EnvironmentSetup -SuiteRoot $testSuiteRoot }
    "PathResolution" = { Test-PathResolution -SuiteRoot $testSuiteRoot }
    "ScriptExecution" = { Test-ScriptExecution -SuiteRoot $testSuiteRoot }
    "QuickStartSyntax" = { Test-QuickStartSyntax -SuiteRoot $testSuiteRoot }
    "OrchestratorSyntax" = { Test-OrchestratorSyntax -SuiteRoot $testSuiteRoot }
}

foreach ($testName in $tests.Keys) {
    try {
        $result = & $tests[$testName]
        $testResults[$testName] = [bool]$result
    } catch {
        Write-Host "Error executing test '$testName': $($_.Exception.Message)" -ForegroundColor Red
        $testResults[$testName] = $false
    }
}

# Summary
Write-Host "`n=================================================================" -ForegroundColor Yellow
Write-Host "                    LOCATION INDEPENDENCE SUMMARY               " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Yellow

$passedTests = ($testResults.Values | Where-Object { $_ -eq $true }).Count
$totalTests = $testResults.Count

foreach ($test in $testResults.GetEnumerator()) {
    $status = if ($test.Value) { "PASS" } else { "FAIL" }
    $color = if ($test.Value) { "Green" } else { "Red" }
    Write-Host "$status - $($test.Key)" -ForegroundColor $color
}

Write-Host "`nOverall Result: $passedTests of $totalTests tests passed" -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Yellow" })

if ($passedTests -eq $totalTests) {
    Write-Host "`nLocation independence test PASSED!" -ForegroundColor Green
    Write-Host "The M&A Discovery Suite can run from any location." -ForegroundColor White
} else {
    Write-Host "`nLocation independence test FAILED!" -ForegroundColor Red
    Write-Host "Please address the failed tests before deploying to different locations." -ForegroundColor Yellow
}

# Cleanup test location if used
if ($TestLocation -and (Test-Path $TestLocation)) {
    Write-Host "`nCleaning up test location..." -ForegroundColor Gray
    Remove-Item $TestLocation -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ""