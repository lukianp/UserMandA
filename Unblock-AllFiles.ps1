# -*- coding: utf-8-bom -*-
<#
.SYNOPSIS
    Unblock all PowerShell files in the M&A Discovery Suite
.DESCRIPTION
    Removes the "downloaded from internet" flag from all .ps1 and .psm1 files
    to prevent security warnings during execution
.PARAMETER Path
    Root path of the M&A Discovery Suite installation
.EXAMPLE
    .\Unblock-AllFiles.ps1 -Path "C:\UserMigration"
.NOTES
    Author: Lukian Poleschtschuk
    Version: 1.0.0
    Created: 2025-06-03
    Last Modified: 2025-06-03
    Change Log: Initial version - any future changes require version increment
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$Path = $PSScriptRoot
)

Write-Host "M&A Discovery Suite - File Unblocking Utility" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Target Path: $Path" -ForegroundColor Yellow
Write-Host ""

# Find all PowerShell files
$powerShellFiles = Get-ChildItem -Path $Path -Recurse -Include "*.ps1", "*.psm1" -File

if ($powerShellFiles.Count -eq 0) {
    Write-Host "No PowerShell files found in the specified path." -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($powerShellFiles.Count) PowerShell files to unblock..." -ForegroundColor Green
Write-Host ""

$unblockedCount = 0
$alreadyUnblockedCount = 0
$errorCount = 0

foreach ($file in $powerShellFiles) {
    try {
        # Check if file is blocked
        $zone = Get-Content -Path "$($file.FullName):Zone.Identifier" -ErrorAction SilentlyContinue
        
        if ($zone) {
            # File is blocked, unblock it
            Unblock-File -Path $file.FullName -ErrorAction Stop
            Write-Host "  Unblocked: $($file.Name)" -ForegroundColor Green
            $unblockedCount++
        } else {
            # File is not blocked
            Write-Host "  Already unblocked: $($file.Name)" -ForegroundColor Gray
            $alreadyUnblockedCount++
        }
    } catch {
        Write-Host "  Error unblocking $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "Unblocking Summary:" -ForegroundColor Cyan
Write-Host "  Files unblocked: $unblockedCount" -ForegroundColor Green
Write-Host "  Already unblocked: $alreadyUnblockedCount" -ForegroundColor Gray
Write-Host "  Errors: $errorCount" -ForegroundColor Red

if ($errorCount -eq 0) {
    Write-Host "`nAll files processed successfully!" -ForegroundColor Green
    Write-Host "You should no longer see security warnings when running the scripts." -ForegroundColor White
} else {
    Write-Host "`nSome files could not be unblocked. You may still see security warnings." -ForegroundColor Yellow
}

Write-Host ""