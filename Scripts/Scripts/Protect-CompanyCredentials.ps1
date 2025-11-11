#Requires -Version 5.1
<#
.SYNOPSIS
    Encrypts company credentials for M&A Discovery Suite
.DESCRIPTION
    This script encrypts the plain text credentials file using Windows DPAPI for enhanced security.
    It creates a backup of the original file before encryption.
.PARAMETER CompanyName
    Name of the company profile
.PARAMETER CredentialsPath
    Optional path to credentials file. If not specified, uses default location.
.PARAMETER SkipBackup
    Skip creating a backup of the original file
.EXAMPLE
    .\Protect-CompanyCredentials.ps1 -CompanyName "ljpops"
    
    Encrypts the credentials for company "ljpops" with backup
.EXAMPLE
    .\Protect-CompanyCredentials.ps1 -CompanyName "ljpops" -SkipBackup
    
    Encrypts the credentials without creating a backup
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$CompanyName,
    
    [Parameter(Mandatory=$false)]
    [string]$CredentialsPath,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBackup
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Stop'

try {
    Write-Host "=== M&A Discovery Suite Credential Encryption ===" -ForegroundColor Cyan
    Write-Host "Company: $CompanyName" -ForegroundColor White
    Write-Host ""
    
    # Get script root path
    $ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
    $RootPath = Split-Path -Parent $ScriptRoot
    $ModulesPath = Join-Path $RootPath "Modules"
    
    # Import required modules
    Write-Host "Loading security modules..." -ForegroundColor Yellow
    Import-Module (Join-Path $ModulesPath "Core\CredentialSecurity.psm1") -Force
    Import-Module (Join-Path $ModulesPath "Core\CredentialLoader.psm1") -Force
    
    # Determine credentials path
    if (-not $CredentialsPath) {
        $profilePath = "C:\DiscoveryData\Profiles\$CompanyName"
        $CredentialsPath = Join-Path $profilePath "Credentials\discoverycredentials.config"
    }
    
    Write-Host "Credentials file: $CredentialsPath" -ForegroundColor Gray
    
    # Check current encryption status
    Write-Host "Checking encryption status..." -ForegroundColor Yellow
    $status = Test-CredentialEncryption -FilePath $CredentialsPath
    
    if (-not $status.Exists) {
        throw "Credentials file not found: $CredentialsPath"
    }
    
    if ($status.Encrypted) {
        Write-Host "Credentials are already encrypted!" -ForegroundColor Green
        Write-Host "No action needed." -ForegroundColor Gray
        exit 0
    }
    
    # Test credential validity before encryption
    Write-Host "Validating credentials..." -ForegroundColor Yellow
    $credentials = Get-CompanyCredentials -CompanyName $CompanyName -CredentialsPath $CredentialsPath
    $expiryCheck = Test-CredentialExpiry -Credentials $credentials
    
    if (-not $expiryCheck.Valid) {
        Write-Warning "Credentials have expired: $($expiryCheck.Message)"
        $response = Read-Host "Do you want to continue encrypting expired credentials? (Y/N)"
        if ($response -ne 'Y') {
            Write-Host "Encryption cancelled." -ForegroundColor Yellow
            exit 0
        }
    } elseif ($expiryCheck.Warning) {
        Write-Warning $expiryCheck.Message
    }
    
    # Display credential info
    Write-Host ""
    Write-Host "Credential Information:" -ForegroundColor Cyan
    Write-Host "  Application: $($credentials.ApplicationName)" -ForegroundColor Gray
    Write-Host "  Tenant ID: $($credentials.TenantId)" -ForegroundColor Gray
    Write-Host "  Client ID: $($credentials.ClientId)" -ForegroundColor Gray
    Write-Host "  Created: $($credentials.CreatedDate)" -ForegroundColor Gray
    Write-Host "  Expires: $($credentials.ExpiryDate)" -ForegroundColor Gray
    Write-Host ""
    
    # Confirm encryption
    Write-Host "This will encrypt the ClientSecret using Windows DPAPI." -ForegroundColor Yellow
    Write-Host "The encrypted file can only be decrypted by the same user on the same machine." -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Do you want to encrypt the credentials? (Y/N)"
    
    if ($response -ne 'Y') {
        Write-Host "Encryption cancelled." -ForegroundColor Yellow
        exit 0
    }
    
    # Perform encryption
    Write-Host ""
    Write-Host "Encrypting credentials..." -ForegroundColor Yellow
    
    $result = Protect-CredentialFile -FilePath $CredentialsPath -CreateBackup:(-not $SkipBackup)
    
    if ($result) {
        Write-Host ""
        Write-Host "=== Encryption Successful ===" -ForegroundColor Green
        Write-Host "The credentials have been encrypted successfully." -ForegroundColor White
        
        if (-not $SkipBackup) {
            Write-Host "Backup saved as: $CredentialsPath.backup" -ForegroundColor Gray
        }
        
        # Verify encryption
        Write-Host ""
        Write-Host "Verifying encryption..." -ForegroundColor Yellow
        $newStatus = Test-CredentialEncryption -FilePath $CredentialsPath
        
        if ($newStatus.Encrypted) {
            Write-Host "✓ Encryption verified successfully" -ForegroundColor Green
            
            # Test decryption
            Write-Host "Testing decryption..." -ForegroundColor Yellow
            $decrypted = Get-SecureCompanyCredentials -CompanyName $CompanyName -CredentialsPath $CredentialsPath
            
            if ($decrypted.ClientId -eq $credentials.ClientId) {
                Write-Host "✓ Decryption test passed" -ForegroundColor Green
            } else {
                Write-Warning "Decryption test failed - credentials may be corrupted"
            }
        } else {
            Write-Warning "Encryption verification failed"
        }
        
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. The discovery modules will automatically decrypt credentials when needed" -ForegroundColor White
        Write-Host "2. No changes to your workflow are required" -ForegroundColor White
        Write-Host "3. Delete the backup file once you've verified everything works" -ForegroundColor White
        
    } else {
        throw "Encryption failed"
    }
    
} catch {
    Write-Host ""
    Write-Host "=== Encryption Failed ===" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if (Test-Path "$CredentialsPath.backup") {
        Write-Host ""
        Write-Host "A backup file exists at: $CredentialsPath.backup" -ForegroundColor Yellow
        Write-Host "You can restore it if needed." -ForegroundColor Yellow
    }
    
    exit 1
}