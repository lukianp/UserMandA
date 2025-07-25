﻿#Requires -Version 5.1
# -*- coding: utf-8-bom -*-

<#
.SYNOPSIS
    Fixes Microsoft Graph and Azure authentication credentials for M&A Discovery Suite
.DESCRIPTION
    This script helps resolve authentication issues by:
    1. Removing invalid credential files
    2. Clearing any cached authentication contexts
    3. Preparing the system for fresh credential input
.PARAMETER CompanyName
    The company name used for profile paths (default: Zedra)
.PARAMETER Force
    Skip confirmation prompts
.EXAMPLE
    .\Scripts\Fix-AuthenticationCredentials.ps1 -CompanyName "Zedra"
.EXAMPLE
    .\Scripts\Fix-AuthenticationCredentials.ps1 -CompanyName "Zedra" -Force
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$CompanyName = "Zedra",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

$ErrorActionPreference = "Stop"
Write-Host "=== Authentication Credentials Fix Utility ===" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# Determine credential file path
$profilesBasePath = "C:\MandADiscovery\Profiles"
$credentialPath = Join-Path $profilesBasePath "$CompanyName\credentials.config"

Write-Host "Target credential file: $credentialPath" -ForegroundColor White
Write-Host ""

# Check if credential file exists
if (-not (Test-Path $credentialPath)) {
    Write-Host "[+] No credential file found - system is ready for fresh credentials" -ForegroundColor Green
    Write-Host "  The discovery suite will prompt for credentials on next run" -ForegroundColor Yellow
    exit 0
}

Write-Host "Found existing credential file" -ForegroundColor Yellow

# Try to read and display current credentials (safely)
$needsRemoval = $true
try {
    $formatHandlerPath = Join-Path (Split-Path $PSScriptRoot -Parent) "Modules\Utilities\CredentialFormatHandler.psm1"
    if (Test-Path $formatHandlerPath) {
        Import-Module $formatHandlerPath -Force -ErrorAction SilentlyContinue
        
        if (Get-Command Read-CredentialFile -ErrorAction SilentlyContinue) {
            $credData = Read-CredentialFile -Path $credentialPath
            Write-Host "Current credentials:" -ForegroundColor White
            $clientIdDisplay = if ($credData.ClientId.Length -gt 8) { "$($credData.ClientId.Substring(0, 8))..." } else { $credData.ClientId }
            Write-Host "  ClientId: $clientIdDisplay" -ForegroundColor Gray
            Write-Host "  TenantId: $($credData.TenantId)" -ForegroundColor Gray
            Write-Host "  Created: $($credData.CreatedDate)" -ForegroundColor Gray
            
            # Check if this is the problematic tenant ID
            if ($credData.TenantId -eq "1d5c5c4a-2ff1-4e50-83a3-008ffb30b1da") {
                Write-Host "  [!]?  This tenant ID matches the one causing authentication failures!" -ForegroundColor Red
                $needsRemoval = $true
            } else {
                Write-Host "  [i]?  This tenant ID is different from the one in the error logs" -ForegroundColor Yellow
                $needsRemoval = $false
            }
        }
    }
} catch {
    Write-Host "Could not read credential file details: $($_.Exception.Message)" -ForegroundColor Yellow
    $needsRemoval = $true
}

Write-Host ""

# Determine action
if (-not $Force) {
    if ($needsRemoval) {
        Write-Host "The current credentials appear to be causing authentication failures." -ForegroundColor Red
        Write-Host "Removing them will allow the system to prompt for new, correct credentials." -ForegroundColor Yellow
    } else {
        Write-Host "The current credentials may or may not be causing issues." -ForegroundColor Yellow
        Write-Host "You can remove them to force re-authentication with fresh credentials." -ForegroundColor Yellow
    }
    
    Write-Host ""
    $choice = Read-Host "Do you want to remove the current credential file? (y/N)"
    
    if ($choice -ne 'y' -and $choice -ne 'Y') {
        Write-Host "Operation cancelled by user" -ForegroundColor Yellow
        exit 0
    }
}

# Remove credential file
Write-Host "Removing credential file..." -ForegroundColor Yellow
try {
    Remove-Item $credentialPath -Force
    Write-Host "[+] Credential file removed successfully" -ForegroundColor Green
} catch {
    Write-Host "[-] Failed to remove credential file: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Clear any cached authentication contexts if modules are loaded
Write-Host "Clearing any cached authentication contexts..." -ForegroundColor Yellow

# Try to clear Graph authentication
try {
    if (Get-Command Disconnect-MgGraph -ErrorAction SilentlyContinue) {
        Disconnect-MgGraph -ErrorAction SilentlyContinue
        Write-Host "  [+] Microsoft Graph context cleared" -ForegroundColor Green
    }
} catch {
    # Ignore errors
}

# Try to clear Azure context
try {
    if (Get-Command Disconnect-AzAccount -ErrorAction SilentlyContinue) {
        Disconnect-AzAccount -ErrorAction SilentlyContinue | Out-Null
        Write-Host "  [+] Azure context cleared" -ForegroundColor Green
    }
} catch {
    # Ignore errors
}

# Try to clear Exchange context
try {
    if (Get-Command Disconnect-ExchangeOnline -ErrorAction SilentlyContinue) {
        Disconnect-ExchangeOnline -Confirm:$false -ErrorAction SilentlyContinue
        Write-Host "  [+] Exchange Online context cleared" -ForegroundColor Green
    }
} catch {
    # Ignore errors
}

Write-Host ""
Write-Host "=== Credential Fix Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Re-run the M&A Discovery Suite" -ForegroundColor Yellow
Write-Host "2. When prompted, enter the CORRECT credentials:" -ForegroundColor Yellow
Write-Host "   - Correct Tenant ID (verify with your Azure AD admin)" -ForegroundColor Gray
Write-Host "   - Application (Client) ID" -ForegroundColor Gray
Write-Host "   - Client Secret" -ForegroundColor Gray
Write-Host "3. Choose to save credentials when prompted" -ForegroundColor Yellow
Write-Host ""
Write-Host "If you continue to have issues:" -ForegroundColor White
Write-Host "- Run the diagnostic script: .\Scripts\Diagnose-AuthenticationIssue.ps1" -ForegroundColor Gray
Write-Host "- Contact your Azure AD administrator for correct tenant information" -ForegroundColor Gray
Write-Host ""