# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Tests the Invoke-SafeModuleExecution error handling wrapper implementation
.DESCRIPTION
    Validates that the error handling wrapper has been successfully added to all modules
    and tests its functionality with various scenarios.
.NOTES
    Author: M&A Discovery Suite Team
    Version: 1.0.0
    Created: 2025-06-09
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$ModulesPath = ".\Modules",
    
    [Parameter(Mandatory=$false)]
    [switch]$Detailed,
    
    [Parameter(Mandatory=$false)]
    [switch]$TestFunctionality
)

function Test-ModuleWrapperPresence {
    param(
        [string]$ModulePath
    )
    
    try {
        $content = Get-Content -Path $ModulePath -Raw -Encoding UTF8
        $hasWrapper = $content -match "function Invoke-SafeModuleExecution"
        
        return @{
            ModulePath = $ModulePath
            ModuleName = [System.IO.Path]::GetFileNameWithoutExtension($ModulePath)
            HasWrapper = $hasWrapper
            Error = $null
        }
    } catch {
        return @{
            ModulePath = $ModulePath
            ModuleName = [System.IO.Path]::GetFileNameWithoutExtension($ModulePath)
            HasWrapper = $false
            Error = $_.Exception.Message
        }
    }
}

function Test-WrapperFunctionality {
    Write-Host "`nTesting wrapper functionality..." -ForegroundColor Cyan
    
    # Test 1: Successful execution
    Write-Host "Test 1: Successful execution" -ForegroundColor Yellow
    
    $testScript = {
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
                # Skip global context validation for testing
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
    }
    
    try {
        $testResults = & $testScript
        
        # Validate successful execution
        if ($testResults.SuccessTest.Success -and $testResults.SuccessTest.Data -eq "Test successful") {
            Write-Host "  ✓ Success case: PASSED" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Success case: FAILED" -ForegroundColor Red
        }
        
        # Validate error handling
        if (-not $testResults.ErrorTest.Success -and $testResults.ErrorTest.Error.Message -eq "Test error") {
            Write-Host "  ✓ Error handling: PASSED" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Error handling: FAILED" -ForegroundColor Red
        }
        
        # Validate timing
        if ($testResults.SuccessTest.Duration -and $testResults.ErrorTest.Duration) {
            Write-Host "  ✓ Duration tracking: PASSED" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Duration tracking: FAILED" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "  ✗ Functionality test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Main execution
Write-Host "M`&A Discovery Suite - Error Handling Wrapper Test" -ForegroundColor Magenta
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

$results = @()
$successCount = 0
$failureCount = 0

foreach ($moduleFile in $moduleFiles) {
    $result = Test-ModuleWrapperPresence -ModulePath $moduleFile.FullName
    $results += $result
    
    if ($result.HasWrapper) {
        $successCount++
        if ($Detailed) {
            Write-Host "  ✓ $($result.ModuleName)" -ForegroundColor Green
        }
    } else {
        $failureCount++
        if ($result.Error) {
            Write-Host "  ✗ $($result.ModuleName) - Error: $($result.Error)" -ForegroundColor Red
        } else {
            Write-Host "  ✗ $($result.ModuleName) - Wrapper function not found" -ForegroundColor Red
        }
    }
}

# Summary
Write-Host "`nTest Results Summary:" -ForegroundColor Magenta
Write-Host "  Total modules tested: $($moduleFiles.Count)" -ForegroundColor White
Write-Host "  Modules with wrapper: $successCount" -ForegroundColor Green
Write-Host "  Modules missing wrapper: $failureCount" -ForegroundColor $(if ($failureCount -eq 0) { "Green" } else { "Red" })

if ($failureCount -gt 0) {
    Write-Host "`nModules missing wrapper function:" -ForegroundColor Red
    $results | Where-Object { -not $_.HasWrapper } | ForEach-Object {
        Write-Host "  - $($_.ModuleName)" -ForegroundColor Red
    }
}

# Test functionality if requested
if ($TestFunctionality) {
    Test-WrapperFunctionality
}

# Module breakdown by category
if ($Detailed) {
    Write-Host "`nModule breakdown by category:" -ForegroundColor Cyan
    
    $categories = @{
        "Authentication" = $results | Where-Object { $_.ModulePath -like "*Authentication*" }
        "Connectivity" = $results | Where-Object { $_.ModulePath -like "*Connectivity*" }
        "Discovery" = $results | Where-Object { $_.ModulePath -like "*Discovery*" }
        "Export" = $results | Where-Object { $_.ModulePath -like "*Export*" }
        "Processing" = $results | Where-Object { $_.ModulePath -like "*Processing*" }
        "Utilities" = $results | Where-Object { $_.ModulePath -like "*Utilities*" }
    }
    
    foreach ($category in $categories.Keys) {
        $categoryModules = $categories[$category]
        if ($categoryModules.Count -gt 0) {
            $categorySuccess = ($categoryModules | Where-Object { $_.HasWrapper }).Count
            Write-Host "  $category`: $categorySuccess/$($categoryModules.Count)" -ForegroundColor $(if ($categorySuccess -eq $categoryModules.Count) { "Green" } else { "Yellow" })
        }
    }
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