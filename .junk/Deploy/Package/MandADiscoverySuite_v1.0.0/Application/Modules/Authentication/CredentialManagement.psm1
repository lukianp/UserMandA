# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Secure credential management for M&A Discovery Suite authentication
.DESCRIPTION
    Provides secure credential storage and retrieval for the session-based authentication system. This module handles 
    encrypted credential storage, interactive credential collection, validation, and secure credential management 
    operations. It integrates with the CredentialFormatHandler for secure file operations and supports both 
    interactive and automated credential workflows.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, CredentialFormatHandler module
#>

# Import credential format handler
$script:CredentialFormatHandlerLoaded = $false

function Ensure-CredentialFormatHandler {
    if ($script:CredentialFormatHandlerLoaded) {
        return $true
    }
    
    # Try to find the credential format handler
    $formatHandlerPath = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "Modules\Utilities\CredentialFormatHandler.psm1"
    
    if (Test-Path $formatHandlerPath) {
        Import-Module $formatHandlerPath -Force
        $script:CredentialFormatHandlerLoaded = $true
        return $true
    } else {
        # Try simple version
        $simpleHandlerPath = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "Modules\Utilities\CredentialFormatHandler_Simple.psm1"
        if (Test-Path $simpleHandlerPath) {
            Import-Module $simpleHandlerPath -Force
            $script:CredentialFormatHandlerLoaded = $true
            return $true
        } else {
            throw "Cannot find CredentialFormatHandler module"
        }
    }
}

function Get-SecureCredentials {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    
    try {
        # Ensure the format handler is loaded
        Ensure-CredentialFormatHandler
        
        # Get credential path from configuration
        $credentialPath = if ($Configuration.authentication -and $Configuration.authentication.credentialStorePath) {
            $Configuration.authentication.credentialStorePath
        } else {
            # Fallback to default path
            Join-Path $env:USERPROFILE "credentials.json"
        }
        
        Write-Verbose "[CredentialMgmt] Attempting to load credentials from: $credentialPath"
        
        # Try to read existing credentials
        if (Test-Path $credentialPath -PathType Leaf) {
            try {
                $credentialData = Read-CredentialFile -Path $credentialPath
                
                # Validate we have the required fields
                if ($credentialData.ClientId -and $credentialData.ClientSecret -and $credentialData.TenantId) {
                    Write-Verbose "[CredentialMgmt] Credentials loaded successfully from file"
                    
                    return @{
                        Success = $true
                        ClientId = $credentialData.ClientId
                        ClientSecret = $credentialData.ClientSecret
                        TenantId = $credentialData.TenantId
                        ExpiryDate = $credentialData.ExpiryDate
                        Source = "File"
                    }
                } else {
                    Write-Warning "[CredentialMgmt] Credential file exists but is missing required fields"
                }
            } catch {
                Write-Warning "[CredentialMgmt] Failed to read credential file: $($_.Exception.Message)"
            }
        } else {
            Write-Verbose "[CredentialMgmt] Credential file not found at: $credentialPath"
        }
        
        # If we get here, we need interactive credentials
        Write-Host "[CredentialMgmt] Stored credentials not available, prompting for interactive input" -ForegroundColor Yellow
        return Get-InteractiveCredentials -Configuration $Configuration
        
    } catch {
        Write-Error "[CredentialMgmt] Error retrieving credentials: $($_.Exception.Message)"
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

function Get-InteractiveCredentials {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    
    try {
        Write-Host "`n" -NoNewline
        Write-Host "===================================================================" -ForegroundColor Cyan
        Write-Host "       M&A Discovery Suite - Credential Input Required             " -ForegroundColor Cyan
        Write-Host "===================================================================" -ForegroundColor Cyan
        Write-Host "`nPlease provide Azure AD service principal credentials:`n" -ForegroundColor White
        
        # Get Client ID
        do {
            $clientId = Read-Host "Client ID (App ID)"
            $clientId = $clientId.Trim()
            if ([string]::IsNullOrWhiteSpace($clientId)) {
                Write-Host "[X] Client ID cannot be empty" -ForegroundColor Red
            } elseif ($clientId -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
                Write-Host "[X] Client ID must be a valid GUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)" -ForegroundColor Red
                $clientId = $null
            }
        } while ([string]::IsNullOrWhiteSpace($clientId))
        
        # Get Tenant ID
        do {
            $tenantId = Read-Host "Tenant ID"
            $tenantId = $tenantId.Trim()
            if ([string]::IsNullOrWhiteSpace($tenantId)) {
                Write-Host "[X] Tenant ID cannot be empty" -ForegroundColor Red
            } elseif ($tenantId -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
                Write-Host "[X] Tenant ID must be a valid GUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)" -ForegroundColor Red
                $tenantId = $null
            }
        } while ([string]::IsNullOrWhiteSpace($tenantId))
        
        # Get Client Secret
        do {
            $clientSecretSecure = Read-Host "Client Secret" -AsSecureString
            $clientSecret = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
                [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($clientSecretSecure)
            )
            if ([string]::IsNullOrWhiteSpace($clientSecret)) {
                Write-Host "[X] Client Secret cannot be empty" -ForegroundColor Red
            }
        } while ([string]::IsNullOrWhiteSpace($clientSecret))
        
        Write-Host "`n[OK] Credentials collected successfully`n" -ForegroundColor Green
        
        # Ask to save credentials
        $saveChoice = Read-Host "Save credentials securely for future use? (y/N)"
        if ($saveChoice -eq 'y' -or $saveChoice -eq 'Y') {
            $saved = Set-SecureCredentials -ClientId $clientId -ClientSecret $clientSecret -TenantId $tenantId -Configuration $Configuration
            if ($saved) {
                Write-Host "[OK] Credentials saved successfully" -ForegroundColor Green
            } else {
                Write-Host "[!]  Failed to save credentials, but will continue with current session" -ForegroundColor Yellow
            }
        }
        
        Write-Host "===================================================================`n" -ForegroundColor Cyan
        
        return @{
            Success = $true
            ClientId = $clientId
            ClientSecret = $clientSecret
            TenantId = $tenantId
            Source = "Interactive"
        }
        
    } catch {
        Write-Error "[CredentialMgmt] Interactive credential collection failed: $($_.Exception.Message)"
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

function Set-SecureCredentials {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$ClientId,
        
        [Parameter(Mandatory=$true)]
        [string]$ClientSecret,
        
        [Parameter(Mandatory=$true)]
        [string]$TenantId,
        
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$false)]
        [DateTime]$ExpiryDate = (Get-Date).AddYears(1)
    )
    
    try {
        # Ensure the format handler is loaded
        Ensure-CredentialFormatHandler
        
        $credentialData = @{
            ClientId = $ClientId
            ClientSecret = $ClientSecret
            TenantId = $TenantId
            CreatedDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            ExpiryDate = $ExpiryDate.ToString("yyyy-MM-dd HH:mm:ss")
            ApplicationName = "M&A Discovery Suite v3.0"
            CreatedBy = $env:USERNAME
            CreatedOnComputer = $env:COMPUTERNAME
            Version = "3.0.0"
        }
        
        # Get credential path
        $credentialPath = if ($Configuration.authentication -and $Configuration.authentication.credentialStorePath) {
            $Configuration.authentication.credentialStorePath
        } else {
            Join-Path $env:USERPROFILE "credentials.json"
        }
        
        $result = Save-CredentialFile -Path $credentialPath -CredentialData $credentialData
        
        if ($result) {
            Write-Verbose "[CredentialMgmt] Credentials saved securely to: $credentialPath"
            
            # Verify we can read it back
            try {
                $verifyData = Read-CredentialFile -Path $credentialPath
                if ($verifyData.ClientId -eq $ClientId) {
                    Write-Verbose "[CredentialMgmt] Credential file verification successful"
                } else {
                    throw "Verification failed - data mismatch"
                }
            } catch {
                Write-Warning "[CredentialMgmt] Saved credentials but verification failed: $($_.Exception.Message)"
            }
        }
        
        return $result
        
    } catch {
        Write-Error "[CredentialMgmt] Failed to save credentials: $($_.Exception.Message)"
        return $false
    }
}

function Test-CredentialValidity {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        $Credentials
    )
    
    try {
        # Extract credential data from various formats
        $credData = $null
        if ($Credentials -is [hashtable]) {
            if ($Credentials.ContainsKey('Success') -and $Credentials.Success) {
                $credData = @{
                    ClientId = $Credentials.ClientId
                    ClientSecret = $Credentials.ClientSecret
                    TenantId = $Credentials.TenantId
                }
            } else {
                $credData = $Credentials
            }
        } else {
            Write-Warning "[CredentialMgmt] Invalid credential format provided"
            return $false
        }
        
        # Basic validation
        if (-not ($credData.ClientId -and $credData.ClientSecret -and $credData.TenantId)) {
            Write-Warning "[CredentialMgmt] Incomplete credentials: missing required fields"
            return $false
        }
        
        # GUID format validation
        if ($credData.ClientId -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
            Write-Warning "[CredentialMgmt] Invalid ClientId format: Must be a valid GUID"
            return $false
        }
        
        if ($credData.TenantId -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
            Write-Warning "[CredentialMgmt] Invalid TenantId format: Must be a valid GUID"
            return $false
        }
        
        Write-Verbose "[CredentialMgmt] Credential format validation passed"
        return $true
        
    } catch {
        Write-Error "[CredentialMgmt] Error during credential validation: $($_.Exception.Message)"
        return $false
    }
}

function Remove-StoredCredentials {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    
    try {
        # Get credential path
        $credentialPath = if ($Configuration.authentication -and $Configuration.authentication.credentialStorePath) {
            $Configuration.authentication.credentialStorePath
        } else {
            Join-Path $env:USERPROFILE "credentials.json"
        }
        
        if (Test-Path $credentialPath) {
            Remove-Item $credentialPath -Force
            Write-Verbose "[CredentialMgmt] Stored credentials removed successfully"
            return $true
        } else {
            Write-Verbose "[CredentialMgmt] No stored credentials found to remove"
            return $true
        }
        
    } catch {
        Write-Error "[CredentialMgmt] Failed to remove stored credentials: $($_.Exception.Message)"
        return $false
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Get-SecureCredentials',
    'Set-SecureCredentials',
    'Test-CredentialValidity',
    'Remove-StoredCredentials'
)

Write-Host "[CredentialManagement.psm1] Simplified credential management loaded" -ForegroundColor Green