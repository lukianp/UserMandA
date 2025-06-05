#Requires -Version 5.1
<#
.SYNOPSIS
    Validates M&A Discovery Suite integrity after updates
.DESCRIPTION
    Comprehensive validation script to ensure all components are properly configured
.EXAMPLE
    .\Validate-SuiteIntegrity.ps1 -Verbose
#>

[CmdletBinding()]
param()

$script:ValidationResults = @{
    Passed = 0
    Failed = 0
    Warnings = 0
    Details = @()
}

function Test-Component {
    param(
        [string]$Name,
        [scriptblock]$Test,
        [string]$Category = "General"
    )
    
    Write-Verbose "Testing: $Name"
    $result = @{
        Name = $Name
        Category = $Category
        Status = "Unknown"
        Message = ""
    }
    
    try {
        $testResult = & $Test
        if ($testResult -eq $true) {
            $result.Status = "Passed"
            $script:ValidationResults.Passed++
            Write-Host "✓ $Name" -ForegroundColor Green
        } elseif ($testResult -is [string]) {
            $result.Status = "Warning"
            $result.Message = $testResult
            $script:ValidationResults.Warnings++
            Write-Host "[!] $Name - $testResult" -ForegroundColor Yellow
        } else {
            $result.Status = "Failed"
            $result.Message = "Test returned false"
            $script:ValidationResults.Failed++
            Write-Host "✗ $Name" -ForegroundColor Red
        }
    } catch {
        $result.Status = "Failed"
        $result.Message = $_.Exception.Message
        $script:ValidationResults.Failed++
        Write-Host "✗ $Name - $_" -ForegroundColor Red
    }
    
    $script:ValidationResults.Details += $result
}

# Header
Write-Host "`nM&A Discovery Suite Integrity Validation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test PowerShell Version
Test-Component -Name "PowerShell Version" -Category "Prerequisites" -Test {
    $version = $PSVersionTable.PSVersion
    if ($version.Major -ge 5 -and $version.Minor -ge 1) {
        return $true
    }
    return "PowerShell 5.1+ required. Current: $version"
}

# Test Suite Structure
Test-Component -Name "Suite Root Structure" -Category "Structure" -Test {
    $requiredDirs = @("Core", "Modules", "Scripts", "Configuration")
    $suiteRoot = $PSScriptRoot
    
    foreach ($dir in $requiredDirs) {
        if (-not (Test-Path (Join-Path $suiteRoot $dir))) {
            return "Missing directory: $dir"
        }
    }
    return $true
}

# Test Critical Files
$criticalFiles = @(
    @{Path = "QuickStart.ps1"; Category = "Core"},
    @{Path = "Core\MandA-Orchestrator.ps1"; Category = "Core"},
    @{Path = "Scripts\Set-SuiteEnvironment.ps1"; Category = "Core"},
    @{Path = "Configuration\default-config.json"; Category = "Configuration"},
    @{Path = "Configuration\config.schema.json"; Category = "Configuration"}
)

foreach ($file in $criticalFiles) {
    Test-Component -Name "File: $($file.Path)" -Category $file.Category -Test {
        $fullPath = Join-Path $PSScriptRoot $file.Path
        if (Test-Path $fullPath) {
            return $true
        }
        return "File not found"
    }
}

# Test Configuration
Test-Component -Name "Configuration Validity" -Category "Configuration" -Test {
    $configPath = Join-Path $PSScriptRoot "Configuration\default-config.json"
    try {
        $config = Get-Content $configPath -Raw | ConvertFrom-Json
        if ($config.metadata -and $config.environment -and $config.discovery) {
            return $true
        }
        return "Invalid configuration structure"
    } catch {
        return "Failed to parse configuration: $_"
    }
}

# Test UTF-8 BOM Issues
Test-Component -Name "UTF-8 BOM Check" -Category "Encoding" -Test {
    $problemFiles = @()
    $psFiles = Get-ChildItem -Path $PSScriptRoot -Include "*.ps1", "*.psm1" -Recurse
    
    foreach ($file in $psFiles) {
        try {
            $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
            if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
                $problemFiles += $file.Name
            }
        } catch {}
    }
    
    if ($problemFiles.Count -gt 0) {
        return "$($problemFiles.Count) files with BOM: $($problemFiles -join ', ')"
    }
    return $true
}

# Test Module Duplicates
Test-Component -Name "Module Duplicates" -Category "Modules" -Test {
    $utilsPath = Join-Path $PSScriptRoot "Modules\Utilities"
    if ((Test-Path (Join-Path $utilsPath "logging.psm1")) -and 
        (Test-Path (Join-Path $utilsPath "EnhancedLogging.psm1"))) {
        return "Duplicate logging modules found"
    }
    return $true
}

# Test Module Loading
$coreModules = @(
    "Modules\Utilities\EnhancedLogging.psm1",
    "Modules\Utilities\ErrorHandling.psm1",
    "Modules\Utilities\FileOperations.psm1",
    "Modules\Processing\DataAggregation.psm1"
)

foreach ($module in $coreModules) {
    Test-Component -Name "Module Load: $(Split-Path $module -Leaf)" -Category "Modules" -Test {
        $modulePath = Join-Path $PSScriptRoot $module
        if (-not (Test-Path $modulePath)) {
            return "Module file not found"
        }
        
        try {
            # Test syntax
            $null = [System.Management.Automation.Language.Parser]::ParseFile(
                $modulePath, 
                [ref]$null, 
                [ref]$null
            )
            return $true
        } catch {
            return "Syntax error: $_"
        }
    }
}

# Test Environment Initialization
Test-Component -Name "Environment Initialization" -Category "Environment" -Test {
    try {
        # Save current state
        $savedMandA = $global:MandA
        
        # Test initialization
        $envScript = Join-Path $PSScriptRoot "Scripts\Set-SuiteEnvironment.ps1"
        . $envScript -CompanyName "TestCompany" -ProvidedSuiteRoot $PSScriptRoot
        
        $result = if ($global:MandA -and $global:MandA.Initialized) { $true } else { "Initialization failed" }
        
        # Restore state
        $global:MandA = $savedMandA
        
        return $result
    } catch {
        return "Environment script error: $_"
    }
}

# Summary
Write-Host "`nValidation Summary" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "Passed:   $($script:ValidationResults.Passed)" -ForegroundColor Green
Write-Host "Warnings: $($script:ValidationResults.Warnings)" -ForegroundColor Yellow
Write-Host "Failed:   $($script:ValidationResults.Failed)" -ForegroundColor Red

# Recommendations
if ($script:ValidationResults.Failed -gt 0 -or $script:ValidationResults.Warnings -gt 0) {
    Write-Host "`nRecommendations:" -ForegroundColor Cyan
    
    $bomIssues = $script:ValidationResults.Details | Where-Object { 
        $_.Name -eq "UTF-8 BOM Check" -and $_.Status -ne "Passed" 
    }
    if ($bomIssues) {
        Write-Host "  - Run Fix-UTF8BOM.ps1 to fix encoding issues" -ForegroundColor Yellow
    }
    
    $dupModules = $script:ValidationResults.Details | Where-Object { 
        $_.Name -eq "Module Duplicates" -and $_.Status -ne "Passed" 
    }
    if ($dupModules) {
        Write-Host "  - Remove duplicate logging.psm1 module" -ForegroundColor Yellow
    }
    
    $missingFiles = $script:ValidationResults.Details | Where-Object { 
        $_.Category -in @("Core", "Configuration") -and $_.Status -eq "Failed" 
    }
    if ($missingFiles) {
        Write-Host "  - Restore missing critical files from backup" -ForegroundColor Red
    }
}

# Export detailed results
$reportPath = Join-Path $PSScriptRoot "ValidationReport_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
$script:ValidationResults | ConvertTo-Json -Depth 5 | Set-Content -Path $reportPath -Encoding UTF8
Write-Host "`nDetailed report saved to: $reportPath" -ForegroundColor Gray

# Exit code
$exitCode = if ($script:ValidationResults.Failed -gt 0) { 1 } else { 0 }
exit $exitCode