# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Example script showing how to run the orchestrator-module integration test
.DESCRIPTION
    This script demonstrates how to use the Test-OrchestratorModuleIntegration.ps1 
    script to validate the relationship between the orchestrator and discovery modules.
.NOTES
    Author: M&A Discovery Team
    Version: 1.0.0
    Created: 2025-06-09
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [switch]$SkipSetup
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ORCHESTRATOR-MODULE INTEGRATION TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Setup minimal global context if not already available
if (-not $SkipSetup -and (-not $global:MandA -or -not $global:MandA.Initialized)) {
    Write-Host "Setting up minimal test environment..." -ForegroundColor Yellow
    
    # Create minimal global context for testing
    $global:MandA = @{
        Initialized = $true
        CompanyName = "TestCompany"
        Version = "7.0.0"
        Paths = @{
            SuiteRoot = (Get-Location).Path
            Discovery = ".\Modules\Discovery"
            RawDataOutput = ".\Output\RawData"
            ProcessedDataOutput = ".\Output\ProcessedData"
            ExportOutput = ".\Output\Export"
            LogOutput = ".\Output\Logs"
        }
        Config = @{
            discovery = @{
                enabledSources = @("Azure", "Graph", "ActiveDirectory")
                maxConcurrentJobs = 3
            }
            export = @{
                formats = @("CSV", "JSON")
            }
        }
    }
    
    # Create output directories
    foreach ($pathKey in @("RawDataOutput", "ProcessedDataOutput", "ExportOutput", "LogOutput")) {
        $path = $global:MandA.Paths[$pathKey]
        if (-not (Test-Path $path)) {
            New-Item -Path $path -ItemType Directory -Force | Out-Null
            Write-Host "Created directory: $path" -ForegroundColor Green
        }
    }
    
    Write-Host "Test environment setup complete." -ForegroundColor Green
    Write-Host ""
}

# Run the integration test
Write-Host "Running orchestrator-module integration test..." -ForegroundColor Cyan
Write-Host ""

try {
    # Test with authentication skipped (for modules that don't require external connections)
    Write-Host "=== TEST 1: Basic Module Structure and Loading ===" -ForegroundColor Yellow
    & ".\Scripts\Test-OrchestratorModuleIntegration.ps1" -ModulesToTest @("Azure") -SkipAuthentication -DetailedOutput
    
    Write-Host ""
    Write-Host "=== TEST 2: Multiple Modules (Structure Only) ===" -ForegroundColor Yellow
    & ".\Scripts\Test-OrchestratorModuleIntegration.ps1" -ModulesToTest @("Azure", "Graph", "ActiveDirectory") -SkipAuthentication
    
    Write-Host ""
    Write-Host "Integration test completed successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "Integration test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INTEGRATION TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "The integration test validates:" -ForegroundColor White
Write-Host "✓ Global M&A context is properly initialized" -ForegroundColor Green
Write-Host "✓ DiscoveryResult class is available and functional" -ForegroundColor Green
Write-Host "✓ Discovery modules can be loaded and imported" -ForegroundColor Green
Write-Host "✓ Module functions are properly exported" -ForegroundColor Green
Write-Host "✓ Modules return proper DiscoveryResult objects" -ForegroundColor Green
Write-Host "✓ Data flow works correctly from modules to orchestrator" -ForegroundColor Green
Write-Host "✓ Error handling is properly implemented" -ForegroundColor Green
Write-Host ""
Write-Host "This ensures the orchestrator can successfully:" -ForegroundColor White
Write-Host "• Call discovery modules in parallel runspaces" -ForegroundColor Gray
Write-Host "• Receive structured results back from modules" -ForegroundColor Gray
Write-Host "• Process module data for aggregation and export" -ForegroundColor Gray
Write-Host "• Handle module errors gracefully" -ForegroundColor Gray
Write-Host ""
Write-Host "Check ValidationResults folder for detailed test reports." -ForegroundColor Cyan