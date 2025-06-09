# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Creates a new credential file for M&A Discovery Suite
.DESCRIPTION
    This script creates a new encrypted credential file using the provided
    App ID, Tenant ID, and Client Secret for Azure authentication.
.PARAMETER AppId
    The Azure App Registration Application (Client) ID
.PARAMETER TenantId
    The Azure Tenant ID
.PARAMETER ClientSecret
    The Azure App Registration Client Secret
.PARAMETER CompanyName
    The company name for the profile (default: Zedra)
.PARAMETER Force
    Force overwrite existing credential file
.NOTES
    Author: M&A Discovery Team
    Version: 1.0.0
    Created: 2025-06-08
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$AppId,
    
    [Parameter(Mandatory=$true)]
    [string]$TenantId,
    
    [Parameter(Mandatory=$true)]
    [string]$ClientSecret,
    
    [Parameter(Mandatory=$false)]
    [string]$CompanyName = "Zedra",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

$ErrorActionPreference = "Stop"

try {
    Write-Host "`n" -NoNewline
    Write-Host "========================================================================" -ForegroundColor Cyan
    Write-Host "        M&A Discovery Suite - Credential File Creator                   " -ForegroundColor Cyan
    Write-Host "========================================================================" -ForegroundColor Cyan
    Write-Host ""

    # Validate GUID formats
    if ($AppId -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
        throw "Invalid AppId format. Must be a valid GUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)"
    }
    
    if ($TenantId -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
        throw "Invalid TenantId format. Must be a valid GUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)"
    }
    
    if ([string]::IsNullOrWhiteSpace($ClientSecret)) {
        throw "ClientSecret cannot be empty"
    }

    Write-Host "[INFO] Validating input parameters..." -ForegroundColor Yellow
    Write-Host "  App ID: $AppId" -ForegroundColor Gray
    Write-Host "  Tenant ID: $TenantId" -ForegroundColor Gray
    Write-Host "  Client Secret: $('*' * $ClientSecret.Length)" -ForegroundColor Gray
    Write-Host "  Company: $CompanyName" -ForegroundColor Gray

    # Determine paths
    $SuiteRoot = Split-Path $PSScriptRoot -Parent
    $ProfilePath = "C:\MandADiscovery\Profiles\$CompanyName"
    $CredentialPath = Join-Path $ProfilePath "credentials.config"
    
    Write-Host "`n[INFO] Target credential file: $CredentialPath" -ForegroundColor Yellow
    
    # Check if credential file exists
    if ((Test-Path $CredentialPath) -and -not $Force) {
        $response = Read-Host "`n[WARNING] Credential file already exists. Overwrite? (y/N)"
        if ($response -ne 'y' -and $response -ne 'Y') {
            Write-Host "[INFO] Operation cancelled by user." -ForegroundColor Yellow
            return
        }
    }
    
    # Ensure profile directory exists
    if (-not (Test-Path $ProfilePath)) {
        Write-Host "[INFO] Creating profile directory: $ProfilePath" -ForegroundColor Yellow
        New-Item -Path $ProfilePath -ItemType Directory -Force | Out-Null
    }
    
    # Load required modules
    Write-Host "`n[INFO] Loading credential management modules..." -ForegroundColor Yellow
    
    $CredentialFormatHandlerPath = Join-Path $SuiteRoot "Modules\Utilities\CredentialFormatHandler.psm1"
    if (-not (Test-Path $CredentialFormatHandlerPath)) {
        throw "CredentialFormatHandler.psm1 not found at: $CredentialFormatHandlerPath"
    }
    
    Import-Module $CredentialFormatHandlerPath -Force
    Write-Host "[OK] CredentialFormatHandler loaded" -ForegroundColor Green
    
    # Create credential data structure
    $credentialData = @{
        ClientId = $AppId
        ClientSecret = $ClientSecret
        TenantId = $TenantId
        CreatedDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        ExpiryDate = (Get-Date).AddYears(1).ToString("yyyy-MM-dd HH:mm:ss")
        ApplicationName = "M&A Discovery Suite"
        CreatedBy = $env:USERNAME
        CreatedOnComputer = $env:COMPUTERNAME
        Version = "2.0.0"
    }
    
    Write-Host "`n[INFO] Creating encrypted credential file..." -ForegroundColor Yellow
    
    # Save the credential file
    $result = Save-CredentialFile -Path $CredentialPath -CredentialData $credentialData
    
    if ($result) {
        Write-Host "[SUCCESS] Credential file created successfully!" -ForegroundColor Green
        
        # Verify the file can be read back
        Write-Host "`n[INFO] Verifying credential file..." -ForegroundColor Yellow
        try {
            $verifyData = Read-CredentialFile -Path $CredentialPath
            if ($verifyData.ClientId -eq $AppId -and $verifyData.TenantId -eq $TenantId) {
                Write-Host "[SUCCESS] Credential file verification passed!" -ForegroundColor Green
                
                Write-Host "`n[INFO] Credential file details:" -ForegroundColor Cyan
                Write-Host "  File Path: $CredentialPath" -ForegroundColor Gray
                Write-Host "  Created: $($credentialData.CreatedDate)" -ForegroundColor Gray
                Write-Host "  Expires: $($credentialData.ExpiryDate)" -ForegroundColor Gray
                Write-Host "  Created By: $($credentialData.CreatedBy)" -ForegroundColor Gray
                Write-Host "  Computer: $($credentialData.CreatedOnComputer)" -ForegroundColor Gray
                
            } else {
                throw "Verification failed - credential data mismatch"
            }
        } catch {
            Write-Host "[ERROR] Credential file verification failed: $($_.Exception.Message)" -ForegroundColor Red
            throw
        }
    } else {
        throw "Failed to create credential file"
    }
    
    Write-Host "`n[SUCCESS] New credential file is ready for use!" -ForegroundColor Green
    Write-Host "You can now run the QuickStart.ps1 script again." -ForegroundColor White
    Write-Host "========================================================================" -ForegroundColor Cyan
    
} catch {
    Write-Host "`n[ERROR] Failed to create credential file" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ScriptStackTrace) {
        Write-Host "`nStack Trace:" -ForegroundColor DarkRed
        Write-Host $_.ScriptStackTrace -ForegroundColor DarkGray
    }
    
    Write-Host "`n[INFO] Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Ensure the App ID and Tenant ID are valid GUIDs" -ForegroundColor Gray
    Write-Host "  2. Verify the Client Secret is correct and not expired" -ForegroundColor Gray
    Write-Host "  3. Check that you have write permissions to the profile directory" -ForegroundColor Gray
    Write-Host "  4. Ensure the CredentialFormatHandler module is available" -ForegroundColor Gray
    
    exit 1
}