#Requires -Version 5.1

<#
.SYNOPSIS
    Diagnoses credential file corruption and recreates with correct values
.DESCRIPTION
    This script analyzes the corrupted credential file and recreates it with the correct
    ClientId and TenantId values that were identified in the mixup detection.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$CompanyName = "Zedra",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

$ErrorActionPreference = "Stop"
Write-Host "=== Credential File Diagnosis and Recovery ===" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# Known correct values from the mixup detection
$correctTenantId = "c405117b-3153-4ed8-8c65-b3475764ab8f"
$correctClientId = "1d5c5c4a-2ff1-4e50-83a3-008ffb30b1da"

$profilesBasePath = "C:\MandADiscovery\Profiles"
$credentialPath = Join-Path $profilesBasePath "$CompanyName\credentials.config"
$backupPath = "$credentialPath.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"

Write-Host "Credential file path: $credentialPath" -ForegroundColor White
Write-Host "Backup path: $backupPath" -ForegroundColor White
Write-Host ""

# Load credential format handler
$formatHandlerPath = Join-Path (Split-Path $PSScriptRoot -Parent) "Modules\Utilities\CredentialFormatHandler.psm1"
if (-not (Test-Path $formatHandlerPath)) {
    Write-Host "[ERROR] CredentialFormatHandler module not found at: $formatHandlerPath" -ForegroundColor Red
    exit 1
}

Import-Module $formatHandlerPath -Force

# Check if credential file exists
if (-not (Test-Path $credentialPath)) {
    Write-Host "[INFO] No credential file found - will create new one" -ForegroundColor Yellow
} else {
    Write-Host "[INFO] Credential file exists - analyzing..." -ForegroundColor Yellow
    
    # Create backup of corrupted file
    try {
        Copy-Item $credentialPath $backupPath -Force
        Write-Host "[OK] Backup created: $backupPath" -ForegroundColor Green
    } catch {
        Write-Host "[WARNING] Failed to create backup: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    # Try to read the corrupted file
    try {
        $credData = Read-CredentialFile -Path $credentialPath
        Write-Host "[UNEXPECTED] File is readable - credentials may not be corrupted" -ForegroundColor Yellow
        Write-Host "Current credentials:" -ForegroundColor White
        Write-Host "  ClientId: $($credData.ClientId)" -ForegroundColor Gray
        Write-Host "  TenantId: $($credData.TenantId)" -ForegroundColor Gray
        
        if ($credData.ClientId -eq $correctClientId -and $credData.TenantId -eq $correctTenantId) {
            Write-Host "[OK] Credentials are already correct!" -ForegroundColor Green
            exit 0
        }
    } catch {
        Write-Host "[CONFIRMED] Credential file is corrupted: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "[INFO] Will recreate with correct values" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Credential Recreation ===" -ForegroundColor Cyan

# Prompt for ClientSecret
Write-Host "To recreate the credential file, we need the ClientSecret for:" -ForegroundColor White
Write-Host "  ClientId: $correctClientId" -ForegroundColor Green
Write-Host "  TenantId: $correctTenantId" -ForegroundColor Green
Write-Host ""

if (-not $Force) {
    $proceed = Read-Host "Do you want to proceed with credential recreation? (y/N)"
    if ($proceed -ne 'y' -and $proceed -ne 'Y') {
        Write-Host "Operation cancelled by user" -ForegroundColor Yellow
        exit 0
    }
}

# Get ClientSecret
$clientSecret = Read-Host "Enter the ClientSecret for the application registration" -AsSecureString
$clientSecretPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($clientSecret)
)

if ([string]::IsNullOrWhiteSpace($clientSecretPlain)) {
    Write-Host "[ERROR] ClientSecret cannot be empty" -ForegroundColor Red
    exit 1
}

# Create new credential data
$newCredData = @{
    ClientId = $correctClientId
    TenantId = $correctTenantId
    ClientSecret = $clientSecretPlain
    CreatedDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    ExpiryDate = (Get-Date).AddYears(1).ToString("yyyy-MM-dd HH:mm:ss")
    ApplicationName = "M&A Discovery Suite"
    CreatedBy = $env:USERNAME
    CreatedOnComputer = $env:COMPUTERNAME
    _FormatVersion = "1.0"
    _RecreatedReason = "Credential file corruption after field mixup fix"
}

# Save new credentials
Write-Host "Creating new credential file..." -ForegroundColor Yellow
try {
    $result = Save-CredentialFile -Path $credentialPath -CredentialData $newCredData
    if ($result) {
        Write-Host "[OK] New credential file created successfully" -ForegroundColor Green
        
        # Verify the new file
        Write-Host "Verifying new credential file..." -ForegroundColor Yellow
        $verifyData = Read-CredentialFile -Path $credentialPath
        Write-Host "Verified credentials:" -ForegroundColor White
        Write-Host "  ClientId: $($verifyData.ClientId)" -ForegroundColor Green
        Write-Host "  TenantId: $($verifyData.TenantId)" -ForegroundColor Green
        Write-Host "  Created: $($verifyData.CreatedDate)" -ForegroundColor Gray
        
        if ($verifyData.ClientId -eq $correctClientId -and $verifyData.TenantId -eq $correctTenantId) {
            Write-Host "[SUCCESS] Credential file recreation completed successfully!" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Verification failed - credentials don't match expected values" -ForegroundColor Red
        }
    } else {
        Write-Host "[ERROR] Failed to save new credential file" -ForegroundColor Red
    }
} catch {
    Write-Host "[ERROR] Error creating new credential file: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Test authentication by running the discovery suite" -ForegroundColor Yellow
Write-Host "2. If successful, you can delete the backup file: $backupPath" -ForegroundColor Yellow
Write-Host "3. Monitor authentication logs for any remaining issues" -ForegroundColor Yellow
Write-Host ""
Write-Host "=== Recovery Complete ===" -ForegroundColor Green