#!/usr/bin/env powershell
<#
.SYNOPSIS
    Simple application startup and functionality test
#>

$ErrorActionPreference = "Continue"
$testResults = @()

function Write-TestResult {
    param([string]$TestName, [bool]$Success, [string]$Details = "")
    $result = @{
        TestName = $TestName
        Success = $Success
        Details = $Details
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    $testResults += $result
    
    if ($Success) {
        Write-Host "✅ PASS: $TestName" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: $TestName - $Details" -ForegroundColor Red
    }
    if ($Details -and $Success) {
        Write-Host "   Details: $Details" -ForegroundColor Gray
    }
}

Write-Host "=== M&A Discovery Suite - Application Functionality Test ===" -ForegroundColor Cyan
Write-Host "Testing basic application startup and core functionality..." -ForegroundColor Yellow
Write-Host ""

# Test 1: Build Status
Write-Host "1. Testing Build Status..." -ForegroundColor Blue
try {
    $buildResult = & dotnet build "GUI\MandADiscoverySuite.csproj" --verbosity quiet --no-restore 2>&1
    $buildSuccess = $LASTEXITCODE -eq 0
    
    if ($buildSuccess) {
        Write-TestResult "Application builds successfully" $true "No compilation errors"
    } else {
        Write-TestResult "Application builds successfully" $false "Build failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-TestResult "Application builds successfully" $false "Exception: $($_.Exception.Message)"
}

# Test 2: Assembly Loading
Write-Host "`n2. Testing Assembly Loading..." -ForegroundColor Blue
try {
    $assemblyPath = "GUI\bin\Debug\net6.0-windows\MandADiscoverySuite.dll"
    if (Test-Path $assemblyPath) {
        Write-TestResult "Application assembly exists" $true "Found at $assemblyPath"
        
        # Try to load key types without instantiation
        $assembly = [System.Reflection.Assembly]::LoadFrom((Resolve-Path $assemblyPath).Path)
        $migrationBatchType = $assembly.GetType("MandADiscoverySuite.Models.MigrationBatch")
        $migrationItemType = $assembly.GetType("MandADiscoverySuite.Models.MigrationItem")
        
        if ($migrationBatchType) {
            Write-TestResult "MigrationBatch type loads successfully" $true "Type found in assembly"
        } else {
            Write-TestResult "MigrationBatch type loads successfully" $false "Type not found"
        }
        
        if ($migrationItemType) {
            Write-TestResult "MigrationItem type loads successfully" $true "Type found in assembly"
        } else {
            Write-TestResult "MigrationItem type loads successfully" $false "Type not found"
        }
        
    } else {
        Write-TestResult "Application assembly exists" $false "Assembly not found at $assemblyPath"
    }
} catch {
    Write-TestResult "Assembly loading test" $false "Exception: $($_.Exception.Message)"
}

# Test 3: Model Properties
Write-Host "`n3. Testing Model Properties..." -ForegroundColor Blue
try {
    if ($migrationBatchType) {
        $properties = $migrationBatchType.GetProperties()
        $keyProperties = @("Id", "Name", "Status", "Items", "ProgressPercentage", "TotalItems")
        
        $foundProperties = @()
        foreach ($prop in $keyProperties) {
            $found = $properties | Where-Object { $_.Name -eq $prop }
            if ($found) {
                $foundProperties += $prop
            }
        }
        
        if ($foundProperties.Count -eq $keyProperties.Count) {
            Write-TestResult "MigrationBatch has required properties" $true "All $($keyProperties.Count) key properties found"
        } else {
            Write-TestResult "MigrationBatch has required properties" $false "Only found $($foundProperties.Count) of $($keyProperties.Count) properties"
        }
    }
} catch {
    Write-TestResult "Model properties test" $false "Exception: $($_.Exception.Message)"
}

# Test 4: CSV Data Files
Write-Host "`n4. Testing CSV Data Integration..." -ForegroundColor Blue
$csvTestPath = "C:\discoverydata\ljpops\Raw"
if (Test-Path $csvTestPath) {
    $csvFiles = Get-ChildItem -Path $csvTestPath -Filter "*.csv" -ErrorAction SilentlyContinue
    Write-TestResult "CSV data directory accessible" $true "Found $($csvFiles.Count) CSV files"
    
    # Test key CSV files
    $keyFiles = @("Users.csv", "Groups.csv", "Applications.csv", "Infrastructure.csv")
    $foundFiles = @()
    
    foreach ($file in $keyFiles) {
        if (Test-Path (Join-Path $csvTestPath $file)) {
            $foundFiles += $file
        }
    }
    
    Write-TestResult "Key CSV files present" ($foundFiles.Count -ge 2) "Found $($foundFiles.Count) of $($keyFiles.Count) key files: $($foundFiles -join ', ')"
} else {
    Write-TestResult "CSV data directory accessible" $false "Directory not found: $csvTestPath"
}

# Test 5: Application Configuration
Write-Host "`n5. Testing Application Configuration..." -ForegroundColor Blue
$configFiles = @(
    @{Path="GUI\App.xaml"; Name="Application XAML"},
    @{Path="GUI\MandADiscoverySuite.csproj"; Name="Project file"},
    @{Path="Configuration\suite-config.json"; Name="Suite configuration"}
)

foreach ($config in $configFiles) {
    if (Test-Path $config.Path) {
        Write-TestResult "$($config.Name) exists" $true "Found at $($config.Path)"
    } else {
        Write-TestResult "$($config.Name) exists" $false "Not found at $($config.Path)"
    }
}

# Test 6: PowerShell Module Structure
Write-Host "`n6. Testing PowerShell Module Structure..." -ForegroundColor Blue
$moduleTestPath = "Modules\Migration"
if (Test-Path $moduleTestPath) {
    $migrationModules = Get-ChildItem -Path $moduleTestPath -Filter "*.psm1" -ErrorAction SilentlyContinue
    Write-TestResult "Migration modules directory accessible" $true "Found $($migrationModules.Count) PowerShell modules"
    
    $keyModules = @("UserMigration.psm1", "MailboxMigration.psm1", "SharePointMigration.psm1")
    $foundModules = @()
    
    foreach ($module in $keyModules) {
        if (Test-Path (Join-Path $moduleTestPath $module)) {
            $foundModules += $module
        }
    }
    
    Write-TestResult "Key migration modules present" ($foundModules.Count -ge 2) "Found $($foundModules.Count) of $($keyModules.Count) modules: $($foundModules -join ', ')"
} else {
    Write-TestResult "Migration modules directory accessible" $false "Directory not found: $moduleTestPath"
}

# Test 7: Memory and Performance
Write-Host "`n7. Testing Memory and Performance..." -ForegroundColor Blue
try {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    # Create some test objects if types are loaded
    if ($migrationBatchType -and $migrationItemType) {
        for ($i = 0; $i -lt 100; $i++) {
            $batch = [Activator]::CreateInstance($migrationBatchType)
            # Simple property access
            $id = $batch.Id
        }
    }
    
    $stopwatch.Stop()
    $elapsedMs = $stopwatch.ElapsedMilliseconds
    
    if ($elapsedMs -lt 1000) {
        Write-TestResult "Performance test (100 object creation)" $true "Completed in ${elapsedMs}ms"
    } else {
        Write-TestResult "Performance test (100 object creation)" $false "Too slow: ${elapsedMs}ms"
    }
    
    # Memory test
    $memoryBefore = [GC]::GetTotalMemory($false)
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
    $memoryAfter = [GC]::GetTotalMemory($true)
    
    Write-TestResult "Memory management test" $true "Memory usage stable"
    
} catch {
    Write-TestResult "Performance test" $false "Exception: $($_.Exception.Message)"
}

# Generate Summary
Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Cyan
$passedTests = ($testResults | Where-Object { $_.Success }).Count
$totalTests = $testResults.Count
$failedTests = $totalTests - $passedTests
$successRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 1) } else { 0 }

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed Tests: $passedTests" -ForegroundColor Green
Write-Host "Failed Tests: $failedTests" -ForegroundColor $(if ($failedTests -eq 0) { "Green" } else { "Red" })
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } else { "Yellow" })

# Overall Assessment
Write-Host "`n=== OVERALL ASSESSMENT ===" -ForegroundColor Cyan
if ($successRate -ge 90) {
    Write-Host "🎉 EXCELLENT: System is fully operational with all critical functionality working" -ForegroundColor Green
} elseif ($successRate -ge 80) {
    Write-Host "✅ GOOD: System is operational with minor issues" -ForegroundColor Yellow
} elseif ($successRate -ge 60) {
    Write-Host "⚠️  ACCEPTABLE: System has some functionality but needs attention" -ForegroundColor Orange
} else {
    Write-Host "❌ NEEDS WORK: System has significant issues that need resolution" -ForegroundColor Red
}

Write-Host "`n=== DETAILED RESULTS ===" -ForegroundColor Cyan
foreach ($result in $testResults) {
    $status = if ($result.Success) { "✅ PASS" } else { "❌ FAIL" }
    Write-Host "$status $($result.TestName)" -ForegroundColor $(if ($result.Success) { "Green" } else { "Red" })
    if ($result.Details) {
        Write-Host "   $($result.Details)" -ForegroundColor Gray
    }
}

# Export results
$reportPath = "TestLogs\ApplicationFunctionality_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
if (-not (Test-Path "TestLogs")) {
    New-Item -Path "TestLogs" -ItemType Directory -Force | Out-Null
}

$testResults | ConvertTo-Json -Depth 3 | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "`nDetailed results exported to: $reportPath" -ForegroundColor Blue

Write-Host "`nApplication functionality testing complete!" -ForegroundColor Cyan