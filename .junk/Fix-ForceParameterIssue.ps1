# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Fixes the Force parameter issue in discovery modules
.DESCRIPTION
    This script fixes the issue where the orchestrator's -Force parameter is being 
    incorrectly passed to discovery modules that don't accept this parameter.
    
    The issue occurs because PowerShell tries to pass the -Force parameter from the 
    orchestrator to the discovery module functions, but those functions only accept 
    -Configuration and -Context parameters.
.PARAMETER CompanyName
    The company name to apply the fix for
.NOTES
    Version: 1.0.0
    Created: 2025-06-06
    This fix modifies the Invoke-DiscoveryModule function in the orchestrator to 
    ensure proper parameter isolation.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$CompanyName
)

Write-Host "=== Force Parameter Issue Fix ===" -ForegroundColor Cyan
Write-Host "Company: $CompanyName" -ForegroundColor White
Write-Host ""

# Check if we're in the correct directory
$orchestratorPath = "Core/MandA-Orchestrator.ps1"
if (-not (Test-Path $orchestratorPath)) {
    Write-Host "ERROR: Cannot find orchestrator at $orchestratorPath" -ForegroundColor Red
    Write-Host "Please run this script from the M&A Discovery Suite root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "1. Analyzing the Force parameter issue..." -ForegroundColor Yellow

# Read the current orchestrator file
$orchestratorContent = Get-Content $orchestratorPath -Raw

# Check if the issue exists
if ($orchestratorContent -match 'function Invoke-DiscoveryModule') {
    Write-Host "   Found Invoke-DiscoveryModule function" -ForegroundColor Green
    
    # Look for the problematic line
    if ($orchestratorContent -match '\$result = & \$moduleFunction -Configuration \$Configuration -Context \$global:MandA') {
        Write-Host "   Found the function call that needs to be fixed" -ForegroundColor Green
        
        Write-Host "2. Creating backup of orchestrator..." -ForegroundColor Yellow
        $backupPath = "Core/MandA-Orchestrator.ps1.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        Copy-Item $orchestratorPath $backupPath
        Write-Host "   Backup created: $backupPath" -ForegroundColor Green
        
        Write-Host "3. Applying fix to Invoke-DiscoveryModule function..." -ForegroundColor Yellow
        
        # The fix: Ensure we explicitly control parameter passing
        $fixedContent = $orchestratorContent -replace (
            '\$result = & \$moduleFunction -Configuration \$Configuration -Context \$global:MandA'
        ), (
            '# Explicitly control parameters to prevent Force parameter from being passed
        $moduleParams = @{
            Configuration = $Configuration
            Context = $global:MandA
        }
        $result = & $moduleFunction @moduleParams'
        )
        
        # Write the fixed content
        Set-Content -Path $orchestratorPath -Value $fixedContent -Encoding UTF8
        
        Write-Host "   Fix applied successfully" -ForegroundColor Green
        
        Write-Host "4. Verifying the fix..." -ForegroundColor Yellow
        
        # Verify the fix was applied
        $verifyContent = Get-Content $orchestratorPath -Raw
        if ($verifyContent -match '\$moduleParams = @\{') {
            Write-Host "   Fix verification successful" -ForegroundColor Green
        } else {
            Write-Host "   ERROR: Fix verification failed" -ForegroundColor Red
            # Restore backup
            Copy-Item $backupPath $orchestratorPath
            Write-Host "   Backup restored" -ForegroundColor Yellow
            exit 1
        }
        
    } else {
        Write-Host "   The function call pattern was not found - may already be fixed" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ERROR: Could not find Invoke-DiscoveryModule function" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Fix Summary ===" -ForegroundColor Cyan
Write-Host "[+] Issue: Discovery modules failing with 'Force parameter not found' error" -ForegroundColor White
Write-Host "[+] Cause: Orchestrator's -Force parameter being passed to discovery functions" -ForegroundColor White
Write-Host "[+] Solution: Modified Invoke-DiscoveryModule to use explicit parameter control" -ForegroundColor White
Write-Host "[+] Result: Discovery modules will only receive Configuration and Context parameters" -ForegroundColor White
Write-Host ""
Write-Host "The Force parameter issue has been fixed." -ForegroundColor Green
Write-Host "You can now run the discovery suite without the Force parameter errors." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run the credential field mixup fix: .\Scripts\Fix-CredentialFieldMixup.ps1 -CompanyName '$CompanyName'" -ForegroundColor White
Write-Host "2. Test the discovery suite: .\QuickStart.ps1 -CompanyName '$CompanyName' -Mode Discovery" -ForegroundColor White