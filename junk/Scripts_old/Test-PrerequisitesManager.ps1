<#
.SYNOPSIS
    Test script for PrerequisitesManager functionality

.DESCRIPTION
    Tests the PrerequisitesManager system to ensure it properly detects, installs,
    and validates prerequisites for discovery modules.

.PARAMETER TestMode
    Type of test to run: Basic, Full, or ModuleSpecific

.PARAMETER ModuleName
    Specific module to test prerequisites for

.PARAMETER Install
    Whether to attempt automatic installation of missing prerequisites

.PARAMETER OutputFile
    Path to save test results

.EXAMPLE
    .\Test-PrerequisitesManager.ps1 -TestMode "Full" -Install

.EXAMPLE
    .\Test-PrerequisitesManager.ps1 -ModuleName "MultiDomainForestDiscovery" -OutputFile "C:\Temp\TestResults.txt"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("Basic", "Full", "ModuleSpecific")]
    [string]$TestMode = "Basic",

    [Parameter(Mandatory=$false)]
    [string]$ModuleName = "InfrastructureDiscovery",

    [Parameter(Mandatory=$false)]
    [switch]$Install,

    [Parameter(Mandatory=$false)]
    [string]$OutputFile
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Continue'

# Test script metadata
$scriptVersion = "1.0.0"
$scriptName = "PrerequisitesManager Test Suite"
$testStartTime = Get-Date

Write-Host "=== $scriptName v$scriptVersion ===" -ForegroundColor Cyan
Write-Host "Test Mode: $TestMode" -ForegroundColor White
Write-Host "Module Name: $ModuleName" -ForegroundColor White
Write-Host "Install Mode: $($Install.IsPresent)" -ForegroundColor White
Write-Host "Start Time: $testStartTime" -ForegroundColor Gray
Write-Host ""

# Initialize test results
$testResults = @{
    OverallSuccess = $false
    TestsRun = 0
    TestsPassed = 0
    TestsFailed = 0
    TestsSkipped = 0
    Errors = @()
    Warnings = @()
    TestDetails = @()
    Recommendations = @()
    ExecutionTime = $null
}
# Load PrerequisitesManager module
$prereqPath = Join-Path $PSScriptRoot "Prerequisites\PrerequisitesManager.psm1"
if (-not (Test-Path $prereqPath)) {
    Write-TestLog "PrerequisitesManager.psm1 not found at: $prereqPath" -Level "ERROR"
    exit 1
}
Import-Module $prereqPath -Force


# Test logging function
function Write-TestLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,

        [Parameter(Mandatory=$false)]
        [ValidateSet("INFO", "SUCCESS", "WARN", "ERROR", "HEADER")]
        [string]$Level = "INFO",

        [Parameter(Mandatory=$false)]
        [switch]$NoConsoleOutput
    )

    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $fullMessage = "[$timestamp] [$Level] $Message"

    if (-not $NoConsoleOutput) {
        $color = switch ($Level) {
            'SUCCESS' { 'Green' }
            'WARN' { 'Yellow' }
            'ERROR' { 'Red' }
            'HEADER' { 'Cyan' }
            default { 'White' }
        }
        Write-Host $fullMessage -ForegroundColor $color
    }

    # Store in test results
    $testResult = @{
        Timestamp = $timestamp
        Level = $Level
        Message = $Message
    }
    $testResults.TestDetails += $testResult

    # Store in collections
    if ($Level -eq "ERROR") {
        $testResults.Errors += $Message
    } elseif ($Level -eq "WARN") {
        $testResults.Warnings += $Message
    }
}

# Test execution function
function Test-Execution {
    param([string]$TestName, [scriptblock]$TestScript, [switch]$Skip)

    $testResults.TestsRun++

    if ($Skip) {
        $testResults.TestsSkipped++
        Write-TestLog "SKIP - $TestName" -Level "WARN"
        return $true
    }

    Write-TestLog "RUNNING - $TestName" -Level "INFO"

    try {
        $result = & $TestScript

        if ($result -is [bool] -and $result) {
            $testResults.TestsPassed++
            Write-TestLog "PASS - $TestName" -Level "SUCCESS"
            return $true
        } elseif ($result -is [hashtable] -and $result.Success) {
            $testResults.TestsPassed++
            Write-TestLog "PASS - $TestName" -Level "SUCCESS"
            return $true
        } else {
            $testResults.TestsFailed++
            Write-TestLog "FAIL - $TestName" -Level "ERROR"
            return $false
        }
    } catch {
        $testResults.TestsFailed++
        Write-TestLog "EXCEPTION - $TestName - $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

try {
    # TEST 1: Prerequisites Manager Module Import
    Test-Execution -TestName "PrerequisitesManager Module Import" -TestScript {
        Write-TestLog "PrerequisitesManager module imported successfully" -Level "INFO" -NoConsoleOutput
        return $true
    }

    # TEST 2: Environment Information Collection
    Test-Execution -TestName "Environment Information Collection" -TestScript {
        try {
            $osInfo = Get-WmiObject -Class Win32_OperatingSystem
            Write-TestLog "Operating System: $($osInfo.Caption)" -Level "INFO" -NoConsoleOutput
            Write-TestLog "Build Number: $($osInfo.BuildNumber)" -Level "INFO" -NoConsoleOutput

            $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
            Write-TestLog "Is Administrator: $isAdmin" -Level "INFO" -NoConsoleOutput

            return $true
        } catch {
            Write-TestLog "Failed to collect environment info: $($_.Exception.Message)" -Level "ERROR" -NoConsoleOutput
            return $false
        }
    }

    # TEST 3: Prerequisites Check Function Availability
    Test-Execution -TestName "Prerequisites Check Function Availability" -TestScript {
        $requiredFunctions = @(
            "Invoke-PrerequisitesCheck",
            "Test-PowerShellModule",
            "Test-AdministratorPrivileges",
            "Test-WindowsCompatibility",
            "Install-ActiveDirectoryModule"
        )

        foreach ($func in $requiredFunctions) {
            if (-not (Get-Command $func -ErrorAction SilentlyContinue)) {
                Write-TestLog "Required function not available: $func" -Level "ERROR" -NoConsoleOutput
                return $false
            }
        }

        Write-TestLog "All required functions available" -Level "INFO" -NoConsoleOutput
        return $true
    }

    # TEST 4: Basic Prerequisites Check (No Installation)
    Test-Execution -TestName "Basic Prerequisites Check (No Installation)" -TestScript {
        try {
            $checkResult = Invoke-PrerequisitesCheck -ModuleName $ModuleName -Install:$false

            Write-TestLog "Prerequisites check completed with $($checkResult.Prerequisites.Count) checks" -Level "INFO" -NoConsoleOutput
            Write-TestLog "Installed items: $($checkResult.Installed.Count)" -Level "INFO" -NoConsoleOutput
            Write-TestLog "Missing items: $($checkResult.Errors.Count)" -Level "INFO" -NoConsoleOutput
            Write-TestLog "Warnings: $($checkResult.Warnings.Count)" -Level "INFO" -NoConsoleOutput
            Write-TestLog "Overall success: $($checkResult.OverallSuccess)" -Level "INFO" -NoConsoleOutput

            return $true
        } catch {
            Write-TestLog "Prerequisites check failed: $($_.Exception.Message)" -Level "ERROR" -NoConsoleOutput
            return $false
        }
    }

    # TEST 5: ActiveDirectory Module Detection
    Test-Execution -TestName "ActiveDirectory Module Detection Test" -TestScript {
        $adDetectionResult = Test-PowerShellModule -ModuleName "ActiveDirectory"

        if ($adDetectionResult.Installed) {
            Write-TestLog "ActiveDirectory module is available (Version: $($adDetectionResult.Version))" -Level "INFO" -NoConsoleOutput
        } else {
            Write-TestLog "ActiveDirectory module is not available" -Level "WARN" -NoConsoleOutput
        }

        # Store result for installation test
        $script:ActiveDirectoryStatus = $adDetectionResult
        return $true
    }

    # TEST 6: Administrator Privileges Test
    Test-Execution -TestName "Administrator Privileges Test" -TestScript {
        $adminResult = Test-AdministratorPrivileges

        if ($adminResult.Installed) {
            Write-TestLog "Running with administrator privileges" -Level "INFO" -NoConsoleOutput
            $script:HasAdminRights = $true
        } else {
            Write-TestLog "Not running with administrator privileges - installation tests will be skipped" -Level "WARN" -NoConsoleOutput
            $script:HasAdminRights = $false
        }

        return $true
    }

    # TEST 7: Windows Compatibility Test
    Test-Execution -TestName "Windows Compatibility Test" -TestScript {
        $compatibilityResult = Test-WindowsCompatibility

        if ($compatibilityResult.Installed) {
            Write-TestLog "Windows version is compatible (Build: $($compatibilityResult.Version))" -Level "INFO" -NoConsoleOutput
            return $true
        } else {
            Write-TestLog "Windows version may not be fully compatible: $($compatibilityResult.Status)" -Level "WARN" -NoConsoleOutput
            return $true # Not a failure, just a warning
        }
    }

    # TEST 8: ActiveDirectory Installation Test (Only if needed and allowed)
    Test-Execution -TestName "ActiveDirectory Installation Test" -TestScript {
        if ($script:ActiveDirectoryStatus.Installed) {
            Write-TestLog "Skipping installation test - ActiveDirectory module already available" -Level "INFO" -NoConsoleOutput
            return $true
        }

        if (-not $Install) {
            Write-TestLog "Skipping installation test - Install parameter not specified" -Level "INFO" -NoConsoleOutput
            $testResults.TestsSkipped++
            $testResults.TestsRun--
            return $true
        }

        if (-not $script:HasAdminRights) {
            Write-TestLog "Skipping installation test - administrator privileges required" -Level "WARN" -NoConsoleOutput
            $testResults.TestsSkipped++
            $testResults.TestsRun--
            return $true
        }

        try {
            Write-TestLog "Attempting ActiveDirectory module installation..." -Level "INFO" -NoConsoleOutput
            $installResult = Install-ActiveDirectoryModule -Force
            Write-TestLog "Installation result: $($installResult.Success)" -Level "INFO" -NoConsoleOutput

            if ($installResult.Success) {
                Write-TestLog "ActiveDirectory module installed successfully" -Level "SUCCESS" -NoConsoleOutput
                return $true
            } else {
                Write-TestLog "ActiveDirectory module installation failed: $($installResult.Message)" -Level "ERROR" -NoConsoleOutput
                return $false
            }
        } catch {
            Write-TestLog "Installation test exception: $($_.Exception.Message)" -Level "ERROR" -NoConsoleOutput
            return $false
        }
    }

    # TEST 9: Full Prerequisites Check with Installation
    Test-Execution -TestName "Full Prerequisites Check with Installation" -TestScript {
        if (-not $Install) {
            Write-TestLog "Skipping full prerequisites check - Install parameter not specified" -Level "INFO" -NoConsoleOutput
            $testResults.TestsSkipped++
            $testResults.TestsRun--
            return $true
        }

        try {
            $fullCheckResult = Invoke-PrerequisitesCheck -ModuleName $ModuleName -Install:$true -Interactive:$false

            Write-TestLog "Full prerequisites check completed" -Level "INFO" -NoConsoleOutput
            Write-TestLog "Overall success: $($fullCheckResult.OverallSuccess)" -Level "INFO" -NoConsoleOutput

            if ($fullCheckResult.OverallSuccess) {
                Write-TestLog "All prerequisites are now satisfied!" -Level "SUCCESS" -NoConsoleOutput
            } else {
                Write-TestLog "Some prerequisites could not be resolved automatically" -Level "WARN" -NoConsoleOutput
            }

            return $fullCheckResult.OverallSuccess
        } catch {
            Write-TestLog "Full prerequisites check failed: $($_.Exception.Message)" -Level "ERROR" -NoConsoleOutput
            return $false
        }
    }

    # TEST 10: nmap Installation Detection Test
    Test-Execution -TestName "nmap Installation Detection Test" -TestScript {
        try {
            $nmapResult = Test-NmapInstallation
            
            Write-TestLog "nmap detection completed" -Level "INFO" -NoConsoleOutput
            Write-TestLog "Installed: $($nmapResult.Installed)" -Level "INFO" -NoConsoleOutput
            Write-TestLog "Version: $($nmapResult.Version)" -Level "INFO" -NoConsoleOutput
            Write-TestLog "Path: $($nmapResult.Path)" -Level "INFO" -NoConsoleOutput
            Write-TestLog "Installation Type: $($nmapResult.InstallationType)" -Level "INFO" -NoConsoleOutput
            Write-TestLog "Status: $($nmapResult.Status)" -Level "INFO" -NoConsoleOutput
            
            # Store result for installation test
            $script:NmapDetectionResult = $nmapResult
            return $true
        } catch {
            Write-TestLog "nmap detection test failed: $($_.Exception.Message)" -Level "ERROR" -NoConsoleOutput
            return $false
        }
    }
    
    # TEST 11: nmap Functionality Test (Only if nmap is available)
    Test-Execution -TestName "nmap Functionality Test" -TestScript {
        if (-not $script:NmapDetectionResult.Installed) {
            Write-TestLog "Skipping functionality test - nmap not available" -Level "INFO" -NoConsoleOutput
            $testResults.TestsSkipped++
            $testResults.TestsRun--
            return $true
        }
        
        try {
            $functionalityResult = Test-NmapFunctionality -NmapPath $script:NmapDetectionResult.Path
            
            Write-TestLog "nmap functionality test completed" -Level "INFO" -NoConsoleOutput
            Write-TestLog "Success: $($functionalityResult.Success)" -Level "INFO" -NoConsoleOutput
            Write-TestLog "Result: $($functionalityResult.Result)" -Level "INFO" -NoConsoleOutput
            Write-TestLog "Test Type: $($functionalityResult.TestType)" -Level "INFO" -NoConsoleOutput
            
            return $functionalityResult.Success
        } catch {
            Write-TestLog "nmap functionality test failed: $($_.Exception.Message)" -Level "ERROR" -NoConsoleOutput
            return $false
        }
    }
    
    # TEST 12: Infrastructure Discovery Prerequisites Check
    Test-Execution -TestName "Infrastructure Discovery Prerequisites Check" -TestScript {
        try {
            $infrastructurePrereqCheck = Invoke-PrerequisitesCheck -ModuleName "InfrastructureDiscovery" -Install:$false
            
            Write-TestLog "Infrastructure Discovery prerequisites check completed" -Level "INFO" -NoConsoleOutput
            Write-TestLog "Prerequisites checked: $($infrastructurePrereqCheck.Prerequisites.Count)" -Level "INFO" -NoConsoleOutput
            Write-TestLog "Installed items: $($infrastructurePrereqCheck.Installed.Count)" -Level "INFO" -NoConsoleOutput
            Write-TestLog "Missing items: $($infrastructurePrereqCheck.Errors.Count)" -Level "INFO" -NoConsoleOutput
            Write-TestLog "Warnings: $($infrastructurePrereqCheck.Warnings.Count)" -Level "INFO" -NoConsoleOutput
            Write-TestLog "Overall success: $($infrastructurePrereqCheck.OverallSuccess)" -Level "INFO" -NoConsoleOutput
            
            return $true
        } catch {
            Write-TestLog "Infrastructure Discovery prerequisites check failed: $($_.Exception.Message)" -Level "ERROR" -NoConsoleOutput
            return $false
        }
    }
    
    # TEST 13: nmap Installation Test (Only if needed and allowed)
    Test-Execution -TestName "nmap Installation Test" -TestScript {
        if ($script:NmapDetectionResult.Installed) {
            Write-TestLog "Skipping installation test - nmap already available" -Level "INFO" -NoConsoleOutput
            return $true
        }

        if (-not $Install) {
            Write-TestLog "Skipping installation test - Install parameter not specified" -Level "INFO" -NoConsoleOutput
            $testResults.TestsSkipped++
            $testResults.TestsRun--
            return $true
        }

        if (-not $script:HasAdminRights) {
            Write-TestLog "Skipping installation test - administrator privileges required" -Level "WARN" -NoConsoleOutput
            $testResults.TestsSkipped++
            $testResults.TestsRun--
            return $true
        }

        try {
            Write-TestLog "Attempting nmap installation..." -Level "INFO" -NoConsoleOutput
            $installResult = Install-NmapPrerequisite -Force
            Write-TestLog "Installation result: $($installResult.Success)" -Level "INFO" -NoConsoleOutput

            if ($installResult.Success) {
                Write-TestLog "nmap installed successfully" -Level "SUCCESS" -NoConsoleOutput
                Write-TestLog "Installation path: $($installResult.Path)" -Level "INFO" -NoConsoleOutput
                Write-TestLog "Version: $($installResult.Version)" -Level "INFO" -NoConsoleOutput
                return $true
            } else {
                Write-TestLog "nmap installation failed: $($installResult.Message)" -Level "ERROR" -NoConsoleOutput
                return $false
            }
        } catch {
            Write-TestLog "Installation test exception: $($_.Exception.Message)" -Level "ERROR" -NoConsoleOutput
            return $false
        }
    }

    # TEST 14: Discovery Launcher Integration Test
    Test-Execution -TestName "Discovery Launcher Integration Test" -TestScript {
        $launcherPath = Join-Path $PSScriptRoot "DiscoveryModuleLauncher.ps1"

        if (-not (Test-Path $launcherPath)) {
            Write-TestLog "DiscoveryModuleLauncher.ps1 not found" -Level "ERROR" -NoConsoleOutput
            return $false
        }

        # Check if launcher contains prerequisites integration
        $launcherContent = Get-Content $launcherPath -Raw

        if ($launcherContent -match "PrerequisitesManager") {
            Write-TestLog "Discovery launcher contains prerequisites integration" -Level "SUCCESS" -NoConsoleOutput
            return $true
        } else {
            Write-TestLog "Discovery launcher does not contain prerequisites integration" -Level "ERROR" -NoConsoleOutput
            return $false
        }
    }

    if ($TestMode -eq "ModuleSpecific") {
        # TEST 15: Module-Specific Prerequisites Check
        Test-Execution -TestName "Module-Specific Prerequisites Check ($ModuleName)" -TestScript {
            $modulePrereqCheck = Invoke-PrerequisitesCheck -ModuleName $ModuleName -Install:$false

            Write-TestLog "Module-specific check for $ModuleName completed" -Level "INFO" -NoConsoleOutput
            Write-TestLog "Module has $($modulePrereqCheck.Prerequisites.Count) prerequisites" -Level "INFO" -NoConsoleOutput

            return $true
        }
    }

    if ($TestMode -eq "Full") {
        # TEST 16: Performance Test
        Test-Execution -TestName "Prerequisites Check Performance Test" -TestScript {
            $performanceResults = @()

            for ($i = 1; $i -le 3; $i++) {
                $startTime = Get-Date
                $perfTest = Invoke-PrerequisitesCheck -ModuleName $ModuleName -Install:$false
                $endTime = Get-Date

                $duration = ($endTime - $startTime).TotalMilliseconds
                $performanceResults += $duration

                Write-TestLog "Performance test run $i - Duration: $([math]::Round($duration, 2))ms" -Level "INFO" -NoConsoleOutput
            }

            $averageTime = [math]::Round(($performanceResults | Measure-Object -Average).Average, 2)
            Write-TestLog "Average prerequisites check time: ${averageTime}ms" -Level "INFO" -NoConsoleOutput

            # Performance threshold: should complete within 10 seconds
            if ($averageTime -lt 10000) {
                Write-TestLog "Performance test passed" -Level "SUCCESS" -NoConsoleOutput
                return $true
            } else {
                Write-TestLog "Performance test failed - too slow (>${averageTime}ms)" -Level "ERROR" -NoConsoleOutput
                return $false
            }
        }
    }

} finally {
    # Calculate execution time
    $testEndTime = Get-Date
    $testDuration = $testEndTime - $testStartTime
    $testResults.ExecutionTime = $testDuration

    # Determine overall success
    $testResults.OverallSuccess = ($testResults.TestsFailed -eq 0)

    # Generate recommendations
    if ($testResults.Errors.Count -gt 0) {
        $testResults.Recommendations += "Address the $($testResults.Errors.Count) errors identified during testing"
    }

    if ($testResults.Warnings.Count -gt 0) {
        $testResults.Recommendations += "Review the $($testResults.Warnings.Count) warnings for potential improvements"
    }

    if (-not $testResults.OverallSuccess) {
        $testResults.Recommendations += "Resolve all critical test failures before production deployment"
    }

    # SUMMARY REPORT
    Write-Host ""
    Write-Host "=== Test Results Summary ===" -ForegroundColor Cyan
    Write-Host "Overall Success: $(if ($testResults.OverallSuccess) { 'PASS' } else { 'FAIL' })" -ForegroundColor $(if ($testResults.OverallSuccess) { 'Green' } else { 'Red' })
    Write-Host "Tests Run: $($testResults.TestsRun)" -ForegroundColor White
    Write-Host "Tests Passed: $($testResults.TestsPassed)" -ForegroundColor Green
    Write-Host "Tests Failed: $($testResults.TestsFailed)" -ForegroundColor Red
    Write-Host "Tests Skipped: $($testResults.TestsSkipped)" -ForegroundColor Yellow
    Write-Host "Execution Time: $($testDuration.ToString('hh\:mm\:ss'))" -ForegroundColor White
    Write-Host ""

    if ($testResults.Errors.Count -gt 0) {
        Write-Host "=== Errors ===" -ForegroundColor Red
        foreach ($testError in $testResults.Errors) {
            Write-Host "  • $testError" -ForegroundColor Red
        }
        Write-Host ""
    }

    if ($testResults.Warnings.Count -gt 0) {
        Write-Host "=== Warnings ===" -ForegroundColor Yellow
        foreach ($warning in $testResults.Warnings) {
            Write-Host "  • $warning" -ForegroundColor Yellow
        }
        Write-Host ""
    }

    if ($testResults.Recommendations.Count -gt 0) {
        Write-Host "=== Recommendations ===" -ForegroundColor Cyan
        foreach ($recommendation in $testResults.Recommendations) {
            Write-Host "  • $recommendation" -ForegroundColor White
        }
        Write-Host ""
    }

    # Save results to file if specified
    if ($OutputFile) {
        try {
            $resultObject = [PSCustomObject]@{
                TestSummary = @{
                    OverallSuccess = $testResults.OverallSuccess
                    TestsRun = $testResults.TestsRun
                    TestsPassed = $testResults.TestsPassed
                    TestsFailed = $testResults.TestsFailed
                    TestsSkipped = $testResults.TestsSkipped
                    ExecutionTime = $testResults.ExecutionTime.ToString()
                    StartTime = $testStartTime.ToString("yyyy-MM-dd HH:mm:ss")
                    EndTime = $testEndTime.ToString("yyyy-MM-dd HH:mm:ss")
                }
                Errors = $testResults.Errors
                Warnings = $testResults.Warnings
                Recommendations = $testResults.Recommendations
                TestDetails = $testResults.TestDetails
            }

            $resultObject | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputFile -Encoding UTF8 -Force
            Write-Host "Test results saved to: $OutputFile" -ForegroundColor Green
        } catch {
            Write-Host "Failed to save results to file: $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    Write-Host "=== Prerequisites Manager Test Complete ===" -ForegroundColor Cyan
    Write-Host ""

    # Set exit code based on success
    if (-not $testResults.OverallSuccess) {
        exit 1
    }
}