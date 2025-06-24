#Requires -Version 5.1

<#
.SYNOPSIS
    Detects and fixes credential field mixup in M&A Discovery Suite
.DESCRIPTION
    This script specifically addresses the issue where TenantId and ClientId 
    fields are swapped in the stored credentials, causing authentication failures.
.PARAMETER CompanyName
    The company name used for profile paths (default: Zedra)
.PARAMETER Force
    Skip confirmation prompts
.EXAMPLE
    .\Scripts\Fix-CredentialFieldMixup.ps1 -CompanyName "Zedra"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$CompanyName = "Zedra",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

$ErrorActionPreference = "Stop"
Write-Host "=== Credential Field Mixup Detection and Fix ===" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# Known correct values (confirmed from error logs)
$correctTenantId = "c405117b-3153-4ed8-8c65-b3475764ab8f"
$correctClientId = "1d5c5c4a-2ff1-4e50-83a3-008ffb30b1da"

Write-Host "Expected correct values:" -ForegroundColor White
Write-Host "  TenantId: $correctTenantId" -ForegroundColor Green
Write-Host "  ClientId: $correctClientId" -ForegroundColor Green
Write-Host ""

# Determine credential file path
$profilesBasePath = "C:\MandADiscovery\Profiles"
$credentialPath = Join-Path $profilesBasePath "$CompanyName\credentials.config"

Write-Host "Checking credential file: $credentialPath" -ForegroundColor White

if (-not (Test-Path $credentialPath)) {
    Write-Host "[OK] No credential file found - system is ready for fresh credentials" -ForegroundColor Green
    Write-Host "  When prompted, use the correct values shown above" -ForegroundColor Yellow
    exit 0
}

# Load credential format handler
$formatHandlerPath = Join-Path (Split-Path $PSScriptRoot -Parent) "Modules\Utilities\CredentialFormatHandler.psm1"
if (-not (Test-Path $formatHandlerPath)) {
    Write-Host "[ERROR] CredentialFormatHandler module not found at: $formatHandlerPath" -ForegroundColor Red
    exit 1
}

Import-Module $formatHandlerPath -Force

if (-not (Get-Command Read-CredentialFile -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Read-CredentialFile function not available" -ForegroundColor Red
    exit 1
}

# Read current credentials
Write-Host "Reading current credential file..." -ForegroundColor Yellow
try {
    $credData = Read-CredentialFile -Path $credentialPath
} catch {
    Write-Host "[ERROR] Failed to read credential file: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Current stored credentials:" -ForegroundColor White
Write-Host "  ClientId: $($credData.ClientId)" -ForegroundColor Gray
Write-Host "  TenantId: $($credData.TenantId)" -ForegroundColor Gray
Write-Host ""

# Analyze the mixup
$mixupDetected = $false
$fixAction = ""

if ($credData.ClientId -eq $correctTenantId -and $credData.TenantId -eq $correctClientId) {
    Write-Host "[DETECTED] FIELD MIXUP DETECTED!" -ForegroundColor Red
    Write-Host "  The ClientId and TenantId fields are SWAPPED!" -ForegroundColor Red
    Write-Host "  Current ClientId ($($credData.ClientId)) should be TenantId" -ForegroundColor Yellow
    Write-Host "  Current TenantId ($($credData.TenantId)) should be ClientId" -ForegroundColor Yellow
    $mixupDetected = $true
    $fixAction = "swap"
} elseif ($credData.TenantId -eq $correctTenantId -and $credData.ClientId -eq $correctClientId) {
    Write-Host "[OK] Credentials appear to be correctly stored" -ForegroundColor Green
    Write-Host "  The field mixup is not in the stored file" -ForegroundColor Yellow
    Write-Host "  The issue may be in how the credentials are being read or used" -ForegroundColor Yellow
    $fixAction = "investigate"
} else {
    Write-Host "[WARNING] Credentials don't match expected values" -ForegroundColor Yellow
    Write-Host "  Neither field contains the expected correct values" -ForegroundColor Yellow
    Write-Host "  This suggests the credentials are completely incorrect" -ForegroundColor Yellow
    $fixAction = "replace"
}

Write-Host ""

# Determine fix action
switch ($fixAction) {
    "swap" {
        Write-Host "RECOMMENDED ACTION: Swap the ClientId and TenantId fields" -ForegroundColor Green
        
        if (-not $Force) {
            $choice = Read-Host "Do you want to swap the ClientId and TenantId fields? (y/N)"
            if ($choice -ne 'y' -and $choice -ne 'Y') {
                Write-Host "Operation cancelled by user" -ForegroundColor Yellow
                exit 0
            }
        }
        
        Write-Host "Swapping ClientId and TenantId fields..." -ForegroundColor Yellow
        
        # Create corrected credential data as hashtable
        $correctedCredData = @{
            ClientId = $correctClientId  # Was stored as TenantId
            TenantId = $correctTenantId  # Was stored as ClientId
            ClientSecret = $credData.ClientSecret
            CreatedDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            CreatedBy = $credData.CreatedBy
            _FormatVersion = $credData._FormatVersion
        }
        
        # Save corrected credentials
        try {
            if (Get-Command Save-CredentialFile -ErrorAction SilentlyContinue) {
                $result = Save-CredentialFile -Path $credentialPath -CredentialData $correctedCredData
                if ($result) {
                    Write-Host "[OK] Credentials corrected and saved successfully" -ForegroundColor Green
                    
                    # Verify the fix
                    try {
                        $verifyData = Read-CredentialFile -Path $credentialPath
                        Write-Host "Verified corrected credentials:" -ForegroundColor White
                        Write-Host "  ClientId: $($verifyData.ClientId)" -ForegroundColor Green
                        Write-Host "  TenantId: $($verifyData.TenantId)" -ForegroundColor Green
                    } catch {
                        Write-Host "[ERROR] Verification failed - credential file may be corrupted: $($_.Exception.Message)" -ForegroundColor Red
                        Write-Host "[SOLUTION] Run .\Scripts\Diagnose-CredentialFile.ps1 to recreate the credential file" -ForegroundColor Yellow
                    }
                } else {
                    Write-Host "[ERROR] Failed to save corrected credentials" -ForegroundColor Red
                }
            } else {
                Write-Host "[ERROR] Save-CredentialFile function not available" -ForegroundColor Red
            }
        } catch {
            Write-Host "[ERROR] Error saving corrected credentials: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "[SOLUTION] The credential file may be corrupted. Run .\Scripts\Diagnose-CredentialFile.ps1 to recreate it" -ForegroundColor Yellow
        }
    }
    
    "investigate" {
        Write-Host "RECOMMENDED ACTION: Investigate credential reading logic" -ForegroundColor Yellow
        Write-Host "The stored credentials appear correct, but the system is using wrong values." -ForegroundColor Yellow
        Write-Host "Check the credential reading and authentication modules for field mapping issues." -ForegroundColor Yellow
    }
    
    "replace" {
        Write-Host "RECOMMENDED ACTION: Replace with correct credentials" -ForegroundColor Yellow
        
        if (-not $Force) {
            $choice = Read-Host "Do you want to replace the credentials with correct values? (y/N)"
            if ($choice -ne 'y' -and $choice -ne 'Y') {
                Write-Host "Operation cancelled by user" -ForegroundColor Yellow
                exit 0
            }
        }
        
        Write-Host "You need to provide the correct ClientSecret for the new credentials." -ForegroundColor Yellow
        $clientSecret = Read-Host "Enter the ClientSecret for ClientId $correctClientId" -AsSecureString
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
        }
        
        # Save new credentials
        try {
            if (Get-Command Save-CredentialFile -ErrorAction SilentlyContinue) {
                $result = Save-CredentialFile -Path $credentialPath -CredentialData $newCredData
                if ($result) {
                    Write-Host "[OK] New credentials saved successfully" -ForegroundColor Green
                } else {
                    Write-Host "[ERROR] Failed to save new credentials" -ForegroundColor Red
                }
            } else {
                Write-Host "[ERROR] Save-CredentialFile function not available" -ForegroundColor Red
            }
        } catch {
            Write-Host "[ERROR] Error saving new credentials: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Test the authentication by running the discovery suite" -ForegroundColor Yellow
Write-Host "2. If issues persist, check the credential reading logic in the authentication modules" -ForegroundColor Yellow
Write-Host "3. Verify that the application registration has the correct permissions" -ForegroundColor Yellow
Write-Host ""
Write-Host "=== Fix Complete ===" -ForegroundColor Green