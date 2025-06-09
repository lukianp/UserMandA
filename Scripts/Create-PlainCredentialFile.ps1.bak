# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Creates a plain JSON credential file for testing
.DESCRIPTION
    This script creates a simple JSON credential file for immediate testing
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
    Write-Host "        M&A Discovery Suite - Plain Credential File Creator             " -ForegroundColor Cyan
    Write-Host "========================================================================" -ForegroundColor Cyan
    Write-Host ""

    # Validate GUID formats
    if ($AppId -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
        throw "Invalid AppId format. Must be a valid GUID"
    }
    
    if ($TenantId -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
        throw "Invalid TenantId format. Must be a valid GUID"
    }

    Write-Host "[INFO] Creating plain credential file for company: $CompanyName" -ForegroundColor Yellow
    Write-Host "  App ID: $AppId" -ForegroundColor Gray
    Write-Host "  Tenant ID: $TenantId" -ForegroundColor Gray
    Write-Host "  Client Secret: $('*' * $ClientSecret.Length)" -ForegroundColor Gray

    # Determine paths
    $ProfilePath = "C:\MandADiscovery\Profiles\$CompanyName"
    $CredentialPath = Join-Path $ProfilePath "credentials.json"
    
    Write-Host "`n[INFO] Target credential file: $CredentialPath" -ForegroundColor Yellow
    
    # Ensure profile directory exists
    if (-not (Test-Path $ProfilePath)) {
        Write-Host "[INFO] Creating profile directory: $ProfilePath" -ForegroundColor Yellow
        New-Item -Path $ProfilePath -ItemType Directory -Force | Out-Null
    }
    
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
    
    Write-Host "`n[INFO] Creating plain JSON credential file..." -ForegroundColor Yellow
    
    # Convert to JSON and save
    $jsonData = $credentialData | ConvertTo-Json -Depth 10
    Set-Content -Path $CredentialPath -Value $jsonData -Encoding UTF8
    
    Write-Host "[SUCCESS] Plain credential file created successfully!" -ForegroundColor Green
    
    # Verify the file can be read back
    Write-Host "`n[INFO] Verifying credential file..." -ForegroundColor Yellow
    try {
        $verifyContent = Get-Content $CredentialPath -Raw -Encoding UTF8
        $verifyData = $verifyContent | ConvertFrom-Json
        
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
    
    Write-Host "`n[SUCCESS] Plain credential file is ready for testing!" -ForegroundColor Green
    Write-Host "[NOTE] This is a plain text file for testing. For production, use encrypted credentials." -ForegroundColor Yellow
    Write-Host "========================================================================" -ForegroundColor Cyan
    
} catch {
    Write-Host "`n[ERROR] Failed to create credential file" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}