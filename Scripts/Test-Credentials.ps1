# -*- coding: utf-8-bom -*-
<#
.SYNOPSIS
    Tests the credential file functionality
.DESCRIPTION
    Diagnostic tool to test credential file reading/writing
.NOTES
    Author: Lukian Poleschtschuk
    Version: 1.0.0
    Created: 2025-06-03
    Last Modified: 2025-06-03
    Change Log: Initial version - any future changes require version increment
#>

param(
    [string]$CredentialFile = "C:\MandADiscovery\Output\credentials.config",
    [switch]$CreateTest,
    [switch]$ReadTest,
    [switch]$FixFormat
)

# Get the script root
$scriptRoot = Split-Path $PSScriptRoot -Parent

# Import required modules
Import-Module "$scriptRoot\Modules\Utilities\CredentialFormatHandler.psm1" -Force
Import-Module "$scriptRoot\Modules\Utilities\EnhancedLogging.psm1" -Force

Write-Host "M&A Discovery Suite - Credential File Diagnostic Tool" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

if ($CreateTest) {
    Write-Host "`nTesting credential file creation..." -ForegroundColor Yellow
    
    $testData = @{
        ClientId = "12345678-1234-1234-1234-123456789012"
        ClientSecret = "TestSecret123!"
        TenantId = "87654321-4321-4321-4321-210987654321"
        CreatedDate = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    }
    
    try {
        Save-CredentialFile -Path $CredentialFile -CredentialData $testData
        Write-Host "[OK] Test credential file created successfully" -ForegroundColor Green
    } catch {
        Write-Host "[X] Failed to create test file: $($_.Exception.Message)" -ForegroundColor Red
    }
}

if ($ReadTest -or -not ($CreateTest -or $FixFormat)) {
    Write-Host "`nTesting credential file reading..." -ForegroundColor Yellow
    
    if (Test-Path $CredentialFile) {
        Write-Host "Found credential file at: $CredentialFile" -ForegroundColor Green
        
        try {
            $data = Read-CredentialFile -Path $CredentialFile
            Write-Host "[OK] Successfully read credential file" -ForegroundColor Green
            Write-Host "`nCredential data:" -ForegroundColor Cyan
            Write-Host "  Client ID: $($data.ClientId)" -ForegroundColor White
            Write-Host "  Tenant ID: $($data.TenantId)" -ForegroundColor White
            Write-Host "  Has Secret: $(if($data.ClientSecret){'Yes'}else{'No'})" -ForegroundColor White
            if ($data.CreatedDate) {
                Write-Host "  Created: $($data.CreatedDate)" -ForegroundColor White
            }
            if ($data.ExpiryDate) {
                Write-Host "  Expires: $($data.ExpiryDate)" -ForegroundColor White
            }
        } catch {
            Write-Host "[X] Failed to read credential file: $($_.Exception.Message)" -ForegroundColor Red
            
            # Try to diagnose the issue
            Write-Host "`nDiagnostic information:" -ForegroundColor Yellow
            
            $fileInfo = Get-Item $CredentialFile
            Write-Host "  File size: $($fileInfo.Length) bytes" -ForegroundColor Gray
            Write-Host "  Last modified: $($fileInfo.LastWriteTime)" -ForegroundColor Gray
            Write-Host "  Current user: $env:USERNAME" -ForegroundColor Gray
            Write-Host "  Computer: $env:COMPUTERNAME" -ForegroundColor Gray
        }
    } else {
        Write-Host "[X] Credential file not found at: $CredentialFile" -ForegroundColor Red
    }
}

if ($FixFormat) {
    Write-Host "`nAttempting to fix credential file format..." -ForegroundColor Yellow
    
    if (Test-Path $CredentialFile) {
        try {
            # Try to read with various methods
            $content = Get-Content $CredentialFile -Raw
            
            # Try direct DPAPI decryption
            $secureString = ConvertTo-SecureString -String $content.Trim() -ErrorAction Stop
            $plainText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
                [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureString)
            )
            
            $data = $plainText | ConvertFrom-Json
            
            Write-Host "[OK] Successfully decoded credential file" -ForegroundColor Green
            
            # Rewrite in standard format
            $hashtable = @{}
            $data.PSObject.Properties | ForEach-Object {
                $hashtable[$_.Name] = $_.Value
            }
            
            Save-CredentialFile -Path "$CredentialFile.fixed" -CredentialData $hashtable
            Write-Host "[OK] Fixed credential file saved to: $CredentialFile.fixed" -ForegroundColor Green
            Write-Host "   You can rename this to replace the original file" -ForegroundColor Yellow
            
        } catch {
            Write-Host "[X] Could not fix credential file: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`nDiagnostic complete." -ForegroundColor Cyan