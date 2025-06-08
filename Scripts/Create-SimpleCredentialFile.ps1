# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Creates a new credential file using simplified approach
.DESCRIPTION
    This script creates a new encrypted credential file without complex ACL operations
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
    [string]$CompanyName = "Zedra"
)

$ErrorActionPreference = "Stop"

try {
    Write-Host "`n========================================================================" -ForegroundColor Cyan
    Write-Host "        M&A Discovery Suite - Simple Credential File Creator            " -ForegroundColor Cyan
    Write-Host "========================================================================" -ForegroundColor Cyan
    Write-Host ""

    # Validate GUID formats
    if ($AppId -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
        throw "Invalid AppId format. Must be a valid GUID"
    }
    
    if ($TenantId -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
        throw "Invalid TenantId format. Must be a valid GUID"
    }

    Write-Host "[INFO] Creating credential file for company: $CompanyName" -ForegroundColor Yellow
    Write-Host "  App ID: $AppId" -ForegroundColor Gray
    Write-Host "  Tenant ID: $TenantId" -ForegroundColor Gray
    Write-Host "  Client Secret: $('*' * $ClientSecret.Length)" -ForegroundColor Gray

    # Determine paths
    $SuiteRoot = Split-Path $PSScriptRoot -Parent
    $ProfilePath = "C:\MandADiscovery\Profiles\$CompanyName"
    $CredentialPath = Join-Path $ProfilePath "credentials.config"
    
    Write-Host "`n[INFO] Target credential file: $CredentialPath" -ForegroundColor Yellow
    
    # Ensure profile directory exists
    if (-not (Test-Path $ProfilePath)) {
        Write-Host "[INFO] Creating profile directory: $ProfilePath" -ForegroundColor Yellow
        New-Item -Path $ProfilePath -ItemType Directory -Force | Out-Null
    }
    
    # Load simplified credential handler
    $SimplePath = Join-Path $SuiteRoot "Modules\Utilities\CredentialFormatHandler_Simple.psm1"
    Import-Module $SimplePath -Force
    Write-Host "[OK] Simple CredentialFormatHandler loaded" -ForegroundColor Green
    
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
    exit 1
}