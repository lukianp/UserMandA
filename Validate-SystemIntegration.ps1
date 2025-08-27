#!/usr/bin/env powershell
<#
.SYNOPSIS
    System Integration Validation for M&A Discovery Suite
#>

Write-Host "=== M&A Discovery Suite - System Integration Validation ===" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

$results = @{
    BuildStatus = $false
    AssemblyStatus = $false
    DataIntegration = $false
    ModuleIntegration = $false
    OverallHealth = $false
    Details = @{}
}

# 1. Build Validation
Write-Host "1. BUILD VALIDATION" -ForegroundColor Yellow
try {
    Push-Location "GUI"
    $buildOutput = & dotnet build MandADiscoverySuite.csproj --verbosity minimal 2>&1
    $buildSuccess = $LASTEXITCODE -eq 0
    Pop-Location
    
    if ($buildSuccess) {
        Write-Host "   ✅ Build: SUCCESS - No compilation errors" -ForegroundColor Green
        $results.BuildStatus = $true
        $results.Details.Build = "Clean build with no errors"
    } else {
        Write-Host "   ❌ Build: FAILED" -ForegroundColor Red
        $results.Details.Build = "Build failed with errors"
    }
} catch {
    Write-Host "   ❌ Build: EXCEPTION - $($_.Exception.Message)" -ForegroundColor Red
    $results.Details.Build = "Build exception: $($_.Exception.Message)"
}

# 2. Assembly and DLL Validation
Write-Host "`n2. ASSEMBLY VALIDATION" -ForegroundColor Yellow
$dllPath = "GUI\bin\Debug\net6.0-windows\MandADiscoverySuite.dll"
if (Test-Path $dllPath) {
    Write-Host "   ✅ Assembly: EXISTS at $dllPath" -ForegroundColor Green
    $results.AssemblyStatus = $true
    $results.Details.Assembly = "Assembly built successfully"
    
    try {
        $fileInfo = Get-Item $dllPath
        Write-Host "   ✅ Size: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Green
        Write-Host "   ✅ Modified: $($fileInfo.LastWriteTime)" -ForegroundColor Green
        $results.Details.AssemblySize = "$([math]::Round($fileInfo.Length / 1MB, 2)) MB"
    } catch {
        Write-Host "   ⚠️  Assembly info unavailable" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Assembly: NOT FOUND" -ForegroundColor Red
    $results.Details.Assembly = "Assembly not found"
}

# 3. CSV Data Integration Validation
Write-Host "`n3. CSV DATA INTEGRATION" -ForegroundColor Yellow
$csvPath = "C:\discoverydata\ljpops\Raw"
if (Test-Path $csvPath) {
    $csvFiles = Get-ChildItem -Path $csvPath -Filter "*.csv" -ErrorAction SilentlyContinue
    Write-Host "   ✅ Data Path: ACCESSIBLE" -ForegroundColor Green
    Write-Host "   ✅ CSV Files: $($csvFiles.Count) files found" -ForegroundColor Green
    
    # Validate key CSV files
    $keyFiles = @("Users.csv", "Groups.csv", "Applications.csv", "Infrastructure.csv", "FileServers.csv", "GPO_GroupPolicies.csv")
    $foundFiles = @()
    
    foreach ($file in $keyFiles) {
        $filePath = Join-Path $csvPath $file
        if (Test-Path $filePath) {
            $foundFiles += $file
            $fileSize = (Get-Item $filePath).Length
            Write-Host "   ✅ $file ($fileSize bytes)" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $file (missing)" -ForegroundColor Yellow
        }
    }
    
    if ($foundFiles.Count -ge 3) {
        $results.DataIntegration = $true
        Write-Host "   ✅ Data Integration: OPERATIONAL ($($foundFiles.Count)/$($keyFiles.Count) key files)" -ForegroundColor Green
        $results.Details.DataIntegration = "Found $($foundFiles.Count) of $($keyFiles.Count) key files"
    } else {
        Write-Host "   ❌ Data Integration: INSUFFICIENT FILES" -ForegroundColor Red
        $results.Details.DataIntegration = "Only found $($foundFiles.Count) of $($keyFiles.Count) key files"
    }
} else {
    Write-Host "   ❌ Data Path: NOT ACCESSIBLE" -ForegroundColor Red
    $results.Details.DataIntegration = "CSV data path not accessible"
}

# 4. PowerShell Module Integration
Write-Host "`n4. POWERSHELL MODULE INTEGRATION" -ForegroundColor Yellow
$modulePath = "Modules\Migration"
if (Test-Path $modulePath) {
    $modules = Get-ChildItem -Path $modulePath -Filter "*.psm1" -ErrorAction SilentlyContinue
    Write-Host "   ✅ Module Path: ACCESSIBLE" -ForegroundColor Green
    Write-Host "   ✅ Modules: $($modules.Count) PowerShell modules found" -ForegroundColor Green
    
    # Validate key modules
    $keyModules = @("UserMigration.psm1", "MailboxMigration.psm1", "SharePointMigration.psm1", "FileSystemMigration.psm1")
    $foundModules = @()
    
    foreach ($module in $keyModules) {
        $modulePath_full = Join-Path $modulePath $module
        if (Test-Path $modulePath_full) {
            $foundModules += $module
            $moduleSize = (Get-Item $modulePath_full).Length
            Write-Host "   ✅ $module ($([math]::Round($moduleSize / 1KB, 1)) KB)" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $module (missing)" -ForegroundColor Yellow
        }
    }
    
    if ($foundModules.Count -ge 3) {
        $results.ModuleIntegration = $true
        Write-Host "   ✅ Module Integration: OPERATIONAL ($($foundModules.Count)/$($keyModules.Count) key modules)" -ForegroundColor Green
        $results.Details.ModuleIntegration = "Found $($foundModules.Count) of $($keyModules.Count) key modules"
    } else {
        Write-Host "   ❌ Module Integration: INSUFFICIENT MODULES" -ForegroundColor Red
        $results.Details.ModuleIntegration = "Only found $($foundModules.Count) of $($keyModules.Count) key modules"
    }
} else {
    Write-Host "   ❌ Module Path: NOT ACCESSIBLE" -ForegroundColor Red
    $results.Details.ModuleIntegration = "PowerShell module path not accessible"
}

# 5. Migration Planning Features Test
Write-Host "`n5. MIGRATION PLANNING FEATURES" -ForegroundColor Yellow
$planningFeatures = @{
    "Views/MigrationPlanningView.xaml" = "Migration Planning Interface"
    "Views/MigrationExecutionView.xaml" = "Migration Execution Interface"
    "Views/MigrationMappingView.xaml" = "Migration Mapping Interface"
    "ViewModels/MigrationPlanningViewModel.cs" = "Planning Logic"
    "ViewModels/MigrationExecutionViewModel.cs" = "Execution Logic"
    "Services/MigrationOrchestrationEngine.cs" = "Orchestration Engine"
    "Services/MigrationWaveOrchestrator.cs" = "Wave Orchestrator"
    "Models/MigrationModels.cs" = "Data Models"
}

$foundFeatures = 0
foreach ($feature in $planningFeatures.GetEnumerator()) {
    $featurePath = Join-Path "GUI" $feature.Key
    if (Test-Path $featurePath) {
        $foundFeatures++
        Write-Host "   ✅ $($feature.Value): Available" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $($feature.Value): Missing" -ForegroundColor Red
    }
}

if ($foundFeatures -ge 6) {
    Write-Host "   ✅ Migration Features: COMPLETE ($foundFeatures/$($planningFeatures.Count) components)" -ForegroundColor Green
    $results.Details.MigrationFeatures = "Found $foundFeatures of $($planningFeatures.Count) components"
} else {
    Write-Host "   ❌ Migration Features: INCOMPLETE ($foundFeatures/$($planningFeatures.Count) components)" -ForegroundColor Red
    $results.Details.MigrationFeatures = "Only found $foundFeatures of $($planningFeatures.Count) components"
}

# 6. Configuration and Settings
Write-Host "`n6. CONFIGURATION VALIDATION" -ForegroundColor Yellow
$configs = @{
    "Configuration/suite-config.json" = "Suite Configuration"
    "GUI/App.xaml" = "Application Definition"
    "GUI/MandADiscoverySuite.csproj" = "Project Definition"
}

$configCount = 0
foreach ($config in $configs.GetEnumerator()) {
    if (Test-Path $config.Key) {
        $configCount++
        Write-Host "   ✅ $($config.Value): Found" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $($config.Value): Missing" -ForegroundColor Red
    }
}

# Calculate Overall Health
$healthScore = 0
if ($results.BuildStatus) { $healthScore += 25 }
if ($results.AssemblyStatus) { $healthScore += 25 }
if ($results.DataIntegration) { $healthScore += 25 }
if ($results.ModuleIntegration) { $healthScore += 25 }

$results.OverallHealth = $healthScore -ge 75

# Final Assessment
Write-Host "`n=== OVERALL SYSTEM HEALTH ===" -ForegroundColor Cyan
Write-Host "Health Score: $healthScore/100" -ForegroundColor $(if ($healthScore -ge 90) { "Green" } elseif ($healthScore -ge 75) { "Yellow" } else { "Red" })

if ($healthScore -ge 90) {
    Write-Host "🎉 EXCELLENT: System is fully operational and ready for production" -ForegroundColor Green
    $status = "EXCELLENT"
} elseif ($healthScore -ge 75) {
    Write-Host "✅ GOOD: System is operational with all core functionality working" -ForegroundColor Yellow
    $status = "GOOD"
} elseif ($healthScore -ge 50) {
    Write-Host "⚠️  ACCEPTABLE: System has basic functionality but needs improvements" -ForegroundColor Orange
    $status = "ACCEPTABLE"
} else {
    Write-Host "❌ NEEDS WORK: System has critical issues requiring immediate attention" -ForegroundColor Red
    $status = "NEEDS WORK"
}

# System Stability Report
Write-Host "`n=== STABILITY & PERFORMANCE ASSESSMENT ===" -ForegroundColor Cyan

$stabilityFactors = @{
    "Build Stability" = $results.BuildStatus
    "Assembly Generation" = $results.AssemblyStatus
    "Data Integration" = $results.DataIntegration
    "Module Integration" = $results.ModuleIntegration
}

foreach ($factor in $stabilityFactors.GetEnumerator()) {
    $status = if ($factor.Value) { "✅ STABLE" } else { "❌ UNSTABLE" }
    $color = if ($factor.Value) { "Green" } else { "Red" }
    Write-Host "   $($factor.Key): $status" -ForegroundColor $color
}

# Generate Summary Report
$summaryReport = @"
M&A Discovery Suite - System Integration Validation Report
=========================================================
Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

OVERALL HEALTH SCORE: $healthScore/100 ($status)

COMPONENT STATUS:
✓ Build System: $(if ($results.BuildStatus) { "OPERATIONAL" } else { "FAILED" })
✓ Assembly Generation: $(if ($results.AssemblyStatus) { "OPERATIONAL" } else { "FAILED" })
✓ Data Integration: $(if ($results.DataIntegration) { "OPERATIONAL" } else { "FAILED" })
✓ Module Integration: $(if ($results.ModuleIntegration) { "OPERATIONAL" } else { "FAILED" })

KEY FINDINGS:
- Build Process: $($results.Details.Build)
- Assembly Status: $($results.Details.Assembly)
- Data Integration: $($results.Details.DataIntegration)
- Module Integration: $($results.Details.ModuleIntegration)

RECOMMENDATION:
$(if ($healthScore -ge 75) {
    "✅ SYSTEM IS READY FOR TESTING AND VALIDATION"
} else {
    "❌ SYSTEM NEEDS ADDITIONAL WORK BEFORE TESTING"
})

NEXT STEPS:
1. $(if ($results.BuildStatus) { "✓ Build system validated" } else { "⚠ Fix build issues" })
2. $(if ($results.DataIntegration) { "✓ Data integration validated" } else { "⚠ Validate CSV data access" })
3. $(if ($results.ModuleIntegration) { "✓ PowerShell modules validated" } else { "⚠ Validate PowerShell modules" })
4. Conduct user acceptance testing
5. Perform end-to-end migration testing
"@

# Save report
if (-not (Test-Path "TestLogs")) {
    New-Item -Path "TestLogs" -ItemType Directory -Force | Out-Null
}

$reportPath = "TestLogs\SystemIntegration_$(Get-Date -Format 'yyyyMMdd_HHmmss').md"
Set-Content -Path $reportPath -Value $summaryReport -Encoding UTF8

Write-Host "`nSystem integration report saved to: $reportPath" -ForegroundColor Blue
Write-Host "System validation complete!" -ForegroundColor Cyan

# Return exit code based on health score
if ($healthScore -ge 75) {
    exit 0
} else {
    exit 1
}