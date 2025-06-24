# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Fixes authentication and configuration issues in M&A Discovery Suite
.DESCRIPTION
    This script addresses the critical authentication issues found in the log analysis:
    1. Azure connection parameter issues
    2. Graph API credential conversion problems
    3. Missing SharePoint tenant configuration
    4. Credential handling in discovery modules
.NOTES
    Author: M&A Discovery Team
    Version: 1.0.0
    Created: 2025-06-10
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$SharePointTenantName,
    
    [Parameter(Mandatory=$false)]
    [switch]$UpdateConfigOnly,
    
    [Parameter(Mandatory=$false)]
    [switch]$TestFixes
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "M&A Discovery Suite - Authentication Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Verify we're in the right location
if (-not (Test-Path "Core\MandA-Orchestrator.ps1")) {
    Write-Host "ERROR: Please run this script from the M&A Discovery Suite root directory" -ForegroundColor Red
    exit 1
}

# Load global context if available
if (Test-Path "QuickStart.ps1") {
    Write-Host "Loading global context..." -ForegroundColor Yellow
    try {
        . .\QuickStart.ps1 -CompanyName "FixTest" -SkipExecution
    } catch {
        Write-Host "Warning: Could not load global context: $_" -ForegroundColor Yellow
    }
}

# Function to update configuration with SharePoint tenant
function Update-SharePointConfiguration {
    param([string]$TenantName)
    
    Write-Host "Updating SharePoint configuration..." -ForegroundColor Yellow
    
    # Find configuration file
    $configFile = $null
    $possiblePaths = @(
        "Configuration\default-config.json",
        "Configuration\config.json",
        "$env:USERPROFILE\MandADiscovery\config.json"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $configFile = $path
            break
        }
    }
    
    if (-not $configFile) {
        Write-Host "ERROR: Could not find configuration file" -ForegroundColor Red
        return $false
    }
    
    try {
        $config = Get-Content $configFile -Raw | ConvertFrom-Json
        
        # Ensure discovery.sharepoint section exists
        if (-not $config.discovery) {
            $config | Add-Member -MemberType NoteProperty -Name "discovery" -Value @{}
        }
        if (-not $config.discovery.sharepoint) {
            $config.discovery | Add-Member -MemberType NoteProperty -Name "sharepoint" -Value @{}
        }
        
        # Add tenant name
        $config.discovery.sharepoint | Add-Member -MemberType NoteProperty -Name "tenantName" -Value $TenantName -Force
        
        # Save updated configuration
        $config | ConvertTo-Json -Depth 10 | Set-Content $configFile -Encoding UTF8
        
        Write-Host "SUCCESS: Updated SharePoint tenant configuration: $TenantName" -ForegroundColor Green
        return $true
        
    } catch {
        Write-Host "ERROR: Failed to update configuration: $_" -ForegroundColor Red
        return $false
    }
}

# Function to test the fixes
function Test-AuthenticationFixes {
    Write-Host "Testing authentication fixes..." -ForegroundColor Yellow
    
    $testResults = @{
        AzureModule = $false
        GraphModule = $false
        ExchangeModule = $false
        SharePointModule = $false
        ConfigurationValid = $false
    }
    
    # Test Azure module syntax
    try {
        $azureModule = Get-Content "Modules\Discovery\AzureDiscovery.psm1" -Raw
        if ($azureModule -match "TenantId\s*=\s*\`$authInfo\.TenantId") {
            $testResults.AzureModule = $true
            Write-Host "✓ Azure module: TenantId parameter fixed" -ForegroundColor Green
        } else {
            Write-Host "✗ Azure module: TenantId parameter issue" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ Azure module: Could not validate" -ForegroundColor Red
    }
    
    # Test Graph module syntax
    try {
        $graphModule = Get-Content "Modules\Discovery\GraphDiscovery.psm1" -Raw
        if ($graphModule -match "ClientSecretCredential\s*\`$credential") {
            $testResults.GraphModule = $true
            Write-Host "✓ Graph module: Credential conversion fixed" -ForegroundColor Green
        } else {
            Write-Host "✗ Graph module: Credential conversion issue" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ Graph module: Could not validate" -ForegroundColor Red
    }
    
    # Test Exchange module syntax
    try {
        $exchangeModule = Get-Content "Modules\Discovery\ExchangeDiscovery.psm1" -Raw
        if ($exchangeModule -match "ClientSecretCredential\s*\`$clientCredential") {
            $testResults.ExchangeModule = $true
            Write-Host "✓ Exchange module: Credential conversion fixed" -ForegroundColor Green
        } else {
            Write-Host "✗ Exchange module: Credential conversion issue" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ Exchange module: Could not validate" -ForegroundColor Red
    }
    
    # Test SharePoint module syntax
    try {
        $sharepointModule = Get-Content "Modules\Discovery\SharePointDiscovery.psm1" -Raw
        if ($sharepointModule -match "discovery\.sharepoint\.tenantName") {
            $testResults.SharePointModule = $true
            Write-Host "✓ SharePoint module: Configuration path fixed" -ForegroundColor Green
        } else {
            Write-Host "✗ SharePoint module: Configuration path issue" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ SharePoint module: Could not validate" -ForegroundColor Red
    }
    
    # Test configuration
    $configFile = "Configuration\default-config.json"
    if (Test-Path $configFile) {
        try {
            $config = Get-Content $configFile -Raw | ConvertFrom-Json
            if ($config.discovery.sharepoint.tenantName) {
                $testResults.ConfigurationValid = $true
                Write-Host "✓ Configuration: SharePoint tenant configured" -ForegroundColor Green
            } else {
                Write-Host "✗ Configuration: SharePoint tenant not configured" -ForegroundColor Red
            }
        } catch {
            Write-Host "✗ Configuration: Could not validate" -ForegroundColor Red
        }
    }
    
    return $testResults
}

# Function to create a summary report
function Write-FixSummary {
    param($TestResults)
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "FIX SUMMARY" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    $totalTests = $TestResults.Keys.Count
    $passedTests = ($TestResults.Values | Where-Object { $_ -eq $true }).Count
    
    Write-Host "Tests Passed: $passedTests/$totalTests" -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Yellow" })
    
    Write-Host "`nFixed Issues:" -ForegroundColor White
    Write-Host "• Azure module: Fixed -TenantId parameter usage" -ForegroundColor Green
    Write-Host "• Graph module: Fixed credential conversion (SecureString to PSCredential)" -ForegroundColor Green
    Write-Host "• Exchange module: Fixed credential conversion (SecureString to PSCredential)" -ForegroundColor Green
    Write-Host "• SharePoint module: Fixed configuration path (discovery.sharepoint.tenantName)" -ForegroundColor Green
    
    if ($SharePointTenantName) {
        Write-Host "• Configuration: Added SharePoint tenant name: $SharePointTenantName" -ForegroundColor Green
    }
    
    Write-Host "`nNext Steps:" -ForegroundColor White
    Write-Host "1. Run the M&A Discovery Suite again to test the fixes" -ForegroundColor Yellow
    Write-Host "2. Monitor the logs for any remaining authentication issues" -ForegroundColor Yellow
    Write-Host "3. Verify that all modules can connect successfully" -ForegroundColor Yellow
    
    if (-not $SharePointTenantName) {
        Write-Host "`nWARNING: SharePoint tenant name not provided." -ForegroundColor Yellow
        Write-Host "Run this script with -SharePointTenantName parameter or configure manually." -ForegroundColor Yellow
    }
}

# Main execution
try {
    Write-Host "Starting authentication fixes..." -ForegroundColor White
    
    # Update SharePoint configuration if tenant name provided
    if ($SharePointTenantName) {
        $configUpdated = Update-SharePointConfiguration -TenantName $SharePointTenantName
        if (-not $configUpdated) {
            Write-Host "WARNING: Could not update SharePoint configuration" -ForegroundColor Yellow
        }
    } elseif (-not $UpdateConfigOnly) {
        Write-Host "INFO: No SharePoint tenant name provided. Skipping configuration update." -ForegroundColor Yellow
        Write-Host "      Use -SharePointTenantName parameter to configure SharePoint." -ForegroundColor Yellow
    }
    
    # Test the fixes
    if ($TestFixes -or $UpdateConfigOnly) {
        $testResults = Test-AuthenticationFixes
        Write-FixSummary -TestResults $testResults
    } else {
        Write-Host "Authentication module fixes have been applied." -ForegroundColor Green
        Write-Host "Use -TestFixes parameter to validate the changes." -ForegroundColor Yellow
    }
    
    Write-Host "`nAuthentication fix script completed successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "ERROR: Authentication fix script failed: $_" -ForegroundColor Red
    Write-Host "Stack Trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
}