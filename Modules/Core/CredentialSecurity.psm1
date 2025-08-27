# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-08-03
# Last Modified: 2025-08-03

<#
.SYNOPSIS
    Credential security functions for M&A Discovery Suite
.DESCRIPTION
    Provides functions to encrypt and decrypt credential files using DPAPI (Data Protection API)
    for enhanced security while maintaining compatibility with existing credential files.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-08-03
    Requires: PowerShell 5.1+, Windows DPAPI
#>

function Protect-CredentialFile {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath,
        
        [Parameter(Mandatory=$false)]
        [switch]$CreateBackup
    )
    
    try {
        if (-not (Test-Path $FilePath)) {
            throw "Credential file not found: $FilePath"
        }
        
        # Create backup if requested
        if ($CreateBackup) {
            $backupPath = "$FilePath.backup"
            Copy-Item -Path $FilePath -Destination $backupPath -Force
            Write-Verbose "Backup created: $backupPath"
        }
        
        # Read the current file content
        $content = Get-Content -Path $FilePath -Raw
        
        # Parse JSON to validate format
        $credentials = $content | ConvertFrom-Json
        
        # Encrypt sensitive fields using DPAPI
        if ($credentials.ClientSecret) {
            $secureSecret = ConvertTo-SecureString -String $credentials.ClientSecret -AsPlainText -Force
            $encryptedSecret = ConvertFrom-SecureString -SecureString $secureSecret
            $credentials.ClientSecret = $encryptedSecret
            $credentials | Add-Member -NotePropertyName "Encrypted" -NotePropertyValue $true -Force
        }
        
        # Save encrypted version
        $credentials | ConvertTo-Json -Depth 5 | Set-Content -Path $FilePath -Encoding UTF8
        
        Write-Host "Credential file encrypted successfully: $FilePath" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Error "Failed to encrypt credential file: $($_.Exception.Message)"
        return $false
    }
}

function Unprotect-CredentialFile {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath
    )
    
    try {
        if (-not (Test-Path $FilePath)) {
            throw "Credential file not found: $FilePath"
        }
        
        # Read the encrypted file
        $content = Get-Content -Path $FilePath -Raw
        $credentials = $content | ConvertFrom-Json
        
        # Check if file is encrypted
        if (-not $credentials.Encrypted) {
            Write-Verbose "File is not encrypted, returning as-is"
            return $credentials
        }
        
        # Decrypt sensitive fields
        if ($credentials.ClientSecret) {
            $secureSecret = ConvertTo-SecureString -String $credentials.ClientSecret
            $decryptedSecret = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureSecret))
            $credentials.ClientSecret = $decryptedSecret
        }
        
        # Remove encryption flag for return object
        $credentials.PSObject.Properties.Remove("Encrypted")
        
        return $credentials
    }
    catch {
        Write-Error "Failed to decrypt credential file: $($_.Exception.Message)"
        throw
    }
}

function Test-CredentialEncryption {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath
    )
    
    try {
        if (-not (Test-Path $FilePath)) {
            return @{ Exists = $false; Encrypted = $false }
        }
        
        $content = Get-Content -Path $FilePath -Raw | ConvertFrom-Json
        
        return @{
            Exists = $true
            Encrypted = [bool]$content.Encrypted
            HasClientSecret = [bool]$content.ClientSecret
        }
    }
    catch {
        return @{ Exists = $true; Encrypted = $false; Error = $_.Exception.Message }
    }
}

# Enhanced credential loader that handles encryption
function Get-SecureCompanyCredentials {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$CompanyName,
        
        [Parameter(Mandatory=$false)]
        [string]$CredentialsPath
    )
    
    try {
        # If no path provided, use default company profile path
        if (-not $CredentialsPath) {
            # Try both possible path structures
            $primaryPath = "c:\discoverydata\$CompanyName\Credentials\discoverycredentials.config"
            $fallbackPath = "c:\discoverydata\Profiles\$CompanyName\Credentials\discoverycredentials.config"
            
            if (Test-Path $primaryPath) {
                $CredentialsPath = $primaryPath
            } elseif (Test-Path $fallbackPath) {
                $CredentialsPath = $fallbackPath
            } else {
                $CredentialsPath = $primaryPath  # Use primary path for error message consistency
            }
        }
        
        # Check encryption status
        $encryptionStatus = Test-CredentialEncryption -FilePath $CredentialsPath
        
        if (-not $encryptionStatus.Exists) {
            throw "Credentials file not found: $CredentialsPath"
        }
        
        # Load credentials (decrypting if necessary)
        if ($encryptionStatus.Encrypted) {
            Write-Verbose "Loading encrypted credentials"
            $credentials = Unprotect-CredentialFile -FilePath $CredentialsPath
        } else {
            Write-Warning "Credentials file is not encrypted - consider encrypting for security"
            $credentials = Get-Content -Path $CredentialsPath -Raw | ConvertFrom-Json
        }
        
        # Validate required fields
        if (-not $credentials.TenantId) {
            throw "TenantId not found in credentials file"
        }
        
        if (-not $credentials.ClientId) {
            throw "ClientId not found in credentials file"
        }
        
        if (-not $credentials.ClientSecret) {
            throw "ClientSecret not found in credentials file"
        }
        
        # Return standardized credential object
        return @{
            TenantId = $credentials.TenantId
            ClientId = $credentials.ClientId
            ClientSecret = $credentials.ClientSecret
            ApplicationName = $credentials.ApplicationName
            ExpiryDate = $credentials.ExpiryDate
            CreatedDate = $credentials.CreatedDate
            AzureRoles = $credentials.AzureRoles
            AzureADRoles = $credentials.AzureADRoles
            PermissionCount = $credentials.PermissionCount
            IsEncrypted = $encryptionStatus.Encrypted
        }
    }
    catch {
        Write-Error "Failed to load secure credentials for company '$CompanyName': $($_.Exception.Message)"
        throw
    }
}

Export-ModuleMember -Function Protect-CredentialFile, Unprotect-CredentialFile, Test-CredentialEncryption, Get-SecureCompanyCredentials

Write-Host "[CredentialSecurity.psm1] Credential security module loaded" -ForegroundColor Green