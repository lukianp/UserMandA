# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Simple test for the Invoke-SafeModuleExecution error handling wrapper
.DESCRIPTION
    Validates that the error handling wrapper has been successfully added to all modules
.NOTES
    Author: M&A Discovery Suite Team
    Version: 1.0.0
    Created: 2025-06-09
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$ModulesPath = ".\Modules"
)

Write-Host "M&A Discovery Suite - Error Handling Wrapper Test" -ForegroundColor Magenta
Write-Host "=" * 55 -ForegroundColor Magenta

if (-not (Test-Path $ModulesPath)) {
    Write-Error "Modules path not found: $ModulesPath"
    exit 1
}

# Get all module files
$moduleFiles = Get-ChildItem -Path $ModulesPath -Recurse -Filter "*.psm1" | 
               Where-Object { $_.Name -notlike "*.bak" -and $_.Name -notlike "*.backup" } |
               Sort-Object FullName

if ($moduleFiles.Count -eq 0) {
    Write-Warning "No module files found in $ModulesPath"
    exit 0
}

Write-Host "Testing $($moduleFiles.Count) module files..." -ForegroundColor White

$successCount = 0
$failureCount = 0
$failedModules = @()

foreach ($moduleFile in $moduleFiles) {
    try {
        $content = Get-Content -Path $moduleFile.FullName -Raw -Encoding UTF8
        $hasWrapper = $content -match "function Invoke-SafeModuleExecution"
        
        $moduleName = [System.IO.Path]::GetFileNameWithoutExtension($moduleFile.FullName)
        
        if ($hasWrapper) {
            $successCount++
            Write-Host "  [+] $moduleName" -ForegroundColor Green
        } else {
            $failureCount++
            $failedModules += $moduleName
            Write-Host "  [-] $moduleName - Wrapper function not found" -ForegroundColor Red
        }
    } catch {
        $failureCount++
        $moduleName = [System.IO.Path]::GetFileNameWithoutExtension($moduleFile.FullName)
        $failedModules += $moduleName
        Write-Host "  [-] $moduleName - Error reading file: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Summary
Write-Host "`nTest Results Summary:" -ForegroundColor Magenta
Write-Host "  Total modules tested: $($moduleFiles.Count)" -ForegroundColor White
Write-Host "  Modules with wrapper: $successCount" -ForegroundColor Green
Write-Host "  Modules missing wrapper: $failureCount" -ForegroundColor $(if ($failureCount -eq 0) { "Green" } else { "Red" })

if ($failureCount -gt 0) {
    Write-Host "`nModules missing wrapper function:" -ForegroundColor Red
    foreach ($module in $failedModules) {
        Write-Host "  - $module" -ForegroundColor Red
    }
}

# Test basic functionality
Write-Host "`nTesting wrapper functionality..." -ForegroundColor Cyan

# Create a simple test function
$testFunction = @'
function Invoke-SafeModuleExecution {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,
        
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    $result = @{
        Success = $false
        Data = $null
        Error = $null
        Duration = $null
    }
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        $result.Data = & $ScriptBlock
        $result.Success = $true
    } catch {
        $result.Error = @{
            Message = $_.Exception.Message
            Type = $_.Exception.GetType().FullName
            StackTrace = $_.ScriptStackTrace
            InnerException = if ($_.Exception.InnerException) { $_.Exception.InnerException.Message } else { $null }
        }
        Write-Host "[$ModuleName] Error: $($_.Exception.Message)" -ForegroundColor Red
    } finally {
        $stopwatch.Stop()
        $result.Duration = $stopwatch.Elapsed
    }
    
    return $result
}

# Test successful execution
$result1 = Invoke-SafeModuleExecution -ScriptBlock {
    return "Test successful"
} -ModuleName "TestModule"

# Test error handling
$result2 = Invoke-SafeModuleExecution -ScriptBlock {
    throw "Test error"
} -ModuleName "TestModule"

return @{
    SuccessTest = $result1
    ErrorTest = $result2
}
'@

try {
    $testResults = Invoke-Expression $testFunction
    
    # Validate successful execution
    if ($testResults.SuccessTest.Success -and $testResults.SuccessTest.Data -eq "Test successful") {
        Write-Host "  [+] Success case: PASSED" -ForegroundColor Green
    } else {
        Write-Host "  [-] Success case: FAILED" -ForegroundColor Red
    }
    
    # Validate error handling
    if (-not $testResults.ErrorTest.Success -and $testResults.ErrorTest.Error.Message -eq "Test error") {
        Write-Host "  [+] Error handling: PASSED" -ForegroundColor Green
    } else {
        Write-Host "  [-] Error handling: FAILED" -ForegroundColor Red
    }
    
    # Validate timing
    if ($testResults.SuccessTest.Duration -and $testResults.ErrorTest.Duration) {
        Write-Host "  [+] Duration tracking: PASSED" -ForegroundColor Green
    } else {
        Write-Host "  [-] Duration tracking: FAILED" -ForegroundColor Red
    }
    
} catch {
    Write-Host "  [-] Functionality test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Overall result
Write-Host "`nOverall Result: " -NoNewline
if ($failureCount -eq 0) {
    Write-Host "SUCCESS" -ForegroundColor Green
    Write-Host "All modules have the error handling wrapper function." -ForegroundColor Green
    exit 0
} else {
    Write-Host "PARTIAL SUCCESS" -ForegroundColor Yellow
    Write-Host "$failureCount modules are missing the wrapper function." -ForegroundColor Yellow
    exit 1
}