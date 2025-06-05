# -*- coding: utf-8-bom -*-
<#
.SYNOPSIS
    Test script to verify Setup-AppRegistration.ps1 syntax and basic functionality
.DESCRIPTION
    This script provides syntax checking and function analysis for the Setup-AppRegistration.ps1 script
.NOTES
    Author: Lukian Poleschtschuk
    Version: 1.0.0
    Created: 2025-06-03
    Last Modified: 2025-06-03
    Change Log: Initial version - any future changes require version increment
#>

param(
    [switch]$TestSyntax,
    [switch]$TestFunctions
)

Write-Host "Testing M&A Discovery Suite App Registration Script..." -ForegroundColor Cyan

if ($TestSyntax) {
    Write-Host "Checking PowerShell syntax..." -ForegroundColor Yellow
    try {
        $errors = $null
        $tokens = $null
        $ast = [System.Management.Automation.Language.Parser]::ParseFile("$PSScriptRoot\Setup-AppRegistration.ps1", [ref]$tokens, [ref]$errors)
        
        if ($errors.Count -eq 0) {
            Write-Host "[OK] Syntax check passed - no errors found" -ForegroundColor Green
        } else {
            Write-Host "[X] Syntax errors found:" -ForegroundColor Red
            $errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
        }
    } catch {
        Write-Host "[X] Syntax check failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

if ($TestFunctions) {
    Write-Host "Testing function definitions..." -ForegroundColor Yellow
    try {
        # Load the script content without executing
        $scriptContent = Get-Content "$PSScriptRoot\Setup-AppRegistration.ps1" -Raw
        
        # Count functions
        $functionMatches = [regex]::Matches($scriptContent, 'function\s+([A-Za-z0-9-_]+)')
        Write-Host "[OK] Found $($functionMatches.Count) function definitions:" -ForegroundColor Green
        
        $functionMatches | ForEach-Object {
            Write-Host "  - $($_.Groups[1].Value)" -ForegroundColor Cyan
        }
        
    } catch {
        Write-Host "[X] Function analysis failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nTest completed!" -ForegroundColor Green
Write-Host "To run the actual app registration script:" -ForegroundColor Yellow
Write-Host "  .\Scripts\Setup-AppRegistration.ps1 -TenantId 'your-tenant-id' -ValidateOnly" -ForegroundColor White