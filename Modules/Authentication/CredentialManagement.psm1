<#
.SYNOPSIS
    Secure credential storage and retrieval for M&A Discovery Suite
.DESCRIPTION
    Handles encrypted credential storage using DPAPI with standardized format
.NOTES
    Author: M&A Discovery Team
    Version: 2.0.0
    Created: 2025-05-31
    Last Modified: 2025-01-10
#>

# Import the credential format handler
#Updated global logging thingy
        if ($null -eq $global:MandA) {
    throw "Global environment not initialized"
}
        $outputPath = $Context.Paths.RawDataOutput

        if (-not (Test-Path $Context.Paths.RawDataOutput)) {
    New-Item -Path $Context.Paths.RawDataOutput -ItemType Directory -Force
}
$formatHandlerPath = Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\CredentialFormatHandler.psm1"
if (Test-Path $formatHandlerPath) {
   $formatHandlerPathFromGlobal = Join-Path $global:MandA.Paths.Utilities "CredentialFormatHandler.psm1"
Import-Module $formatHandlerPathFromGlobal -Force
} else {
    throw "Cannot find CredentialFormatHandler.psm1 at: $formatHandlerPath"
}

function Get-SecureCredentials {
    param([hashtable]$Configuration)
    
    try {
        $credentialPath = $Configuration.authentication.credentialStorePath
        
        Write-MandALog "Attempting to load credentials from: $credentialPath" -Level "INFO"
        
        # Try to read existing credentials
        if (Test-Path $credentialPath -PathType Leaf) {
            try {
                $credentialData = Read-CredentialFile -Path $credentialPath
                
                # Validate we have the required fields
                if ($credentialData.ClientId -and $credentialData.ClientSecret -and $credentialData.TenantId) {
                    Write-MandALog "Credentials loaded successfully from file" -Level "SUCCESS"
                    
                    return @{
                        Success = $true
                        ClientId = $credentialData.ClientId
                        ClientSecret = $credentialData.ClientSecret
                        TenantId = $credentialData.TenantId
                        ExpiryDate = $credentialData.ExpiryDate
                    }
                } else {
                    Write-MandALog "Credential file exists but is missing required fields" -Level "ERROR"
                }
            } catch {
                Write-MandALog "Failed to read credential file: $($_.Exception.Message)" -Level "ERROR"
            }
        } else {
            Write-MandALog "Credential file not found at: $credentialPath" -Level "INFO"
        }
        
        # If we get here, we need interactive credentials
        Write-MandALog "Stored credentials not available, prompting for interactive input" -Level "WARN"
        return Get-InteractiveCredentials -Configuration $Configuration
        
    } catch {
        Write-MandALog "Error retrieving credentials: $($_.Exception.Message)" -Level "ERROR"
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

function Get-InteractiveCredentials {
    param([hashtable]$Configuration)
    
    try {
        Write-Host "`n" -NoNewline
        Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host "       M&A Discovery Suite - Credential Input Required             " -ForegroundColor Cyan
        Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host "`nPlease provide Azure AD service principal credentials:`n" -ForegroundColor White
        
        # Get Client ID
        do {
            $clientId = Read-Host "Client ID (App ID)"
            $clientId = $clientId.Trim()
            if ([string]::IsNullOrWhiteSpace($clientId)) {
                Write-Host "❌ Client ID cannot be empty" -ForegroundColor Red
            } elseif ($clientId -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
                Write-Host "❌ Client ID must be a valid GUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)" -ForegroundColor Red
                $clientId = $null
            }
        } while ([string]::IsNullOrWhiteSpace($clientId))
        
        # Get Tenant ID
        do {
            $tenantId = Read-Host "Tenant ID"
            $tenantId = $tenantId.Trim()
            if ([string]::IsNullOrWhiteSpace($tenantId)) {
                Write-Host "❌ Tenant ID cannot be empty" -ForegroundColor Red
            } elseif ($tenantId -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
                Write-Host "❌ Tenant ID must be a valid GUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)" -ForegroundColor Red
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
                Write-Host "❌ Client Secret cannot be empty" -ForegroundColor Red
            }
        } while ([string]::IsNullOrWhiteSpace($clientSecret))
        
        Write-Host "`n✅ Credentials collected successfully`n" -ForegroundColor Green
        
        # Ask to save credentials
        $saveChoice = Read-Host "Save credentials securely for future use? (y/N)"
        if ($saveChoice -eq 'y' -or $saveChoice -eq 'Y') {
            $saved = Set-SecureCredentials -ClientId $clientId -ClientSecret $clientSecret -TenantId $tenantId -Configuration $Configuration
            if ($saved) {
                Write-Host "✅ Credentials saved successfully" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Failed to save credentials, but will continue with current session" -ForegroundColor Yellow
            }
        }
        
        Write-Host "═══════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
        
        return @{
            Success = $true
            ClientId = $clientId
            ClientSecret = $clientSecret
            TenantId = $tenantId
        }
        
    } catch {
        Write-MandALog "Interactive credential collection failed: $($_.Exception.Message)" -Level "ERROR"
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

function Set-SecureCredentials {
    param(
        [string]$ClientId,
        [string]$ClientSecret,
        [string]$TenantId,
        [hashtable]$Configuration,
        [DateTime]$ExpiryDate = (Get-Date).AddYears(1)
    )
    
    try {
        $credentialData = @{
            ClientId = $ClientId
            ClientSecret = $ClientSecret
            TenantId = $TenantId
            CreatedDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            ExpiryDate = $ExpiryDate.ToString("yyyy-MM-dd HH:mm:ss")
            ApplicationName = "M&A Discovery Suite"
            CreatedBy = $env:USERNAME
            CreatedOnComputer = $env:COMPUTERNAME
        }
        
        $credentialPath = $Configuration.authentication.credentialStorePath
        $result = Save-CredentialFile -Path $credentialPath -CredentialData $credentialData
        
        if ($result) {
            Write-MandALog "Credentials saved securely to: $credentialPath" -Level "SUCCESS"
            
            # Verify we can read it back
            try {
                $verifyData = Read-CredentialFile -Path $credentialPath
                if ($verifyData.ClientId -eq $ClientId) {
                    Write-MandALog "Credential file verification successful" -Level "SUCCESS"
                } else {
                    throw "Verification failed - data mismatch"
                }
            } catch {
                Write-MandALog "WARNING: Saved credentials but verification failed: $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        return $result
        
    } catch {
        Write-MandALog "Failed to save credentials: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Test-CredentialValidity {
    param(
        [Parameter(Mandatory=$true)]
        $Credentials,
        [hashtable]$Configuration
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
            Write-MandALog "Invalid credential format provided" -Level "ERROR"
            return $false
        }
        
        # Basic validation
        if (-not ($credData.ClientId -and $credData.ClientSecret -and $credData.TenantId)) {
            Write-MandALog "Incomplete credentials: missing required fields" -Level "ERROR"
            return $false
        }
        
        # GUID format validation
        if ($credData.ClientId -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
            Write-MandALog "Invalid ClientId format: Must be a valid GUID" -Level "ERROR"
            return $false
        }
        
        if ($credData.TenantId -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
            Write-MandALog "Invalid TenantId format: Must be a valid GUID" -Level "ERROR"
            return $false
        }
        
        Write-MandALog "Credential format validation passed" -Level "SUCCESS"
        return $true
        
    } catch {
        Write-MandALog "Error during credential validation: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Remove-StoredCredentials {
    param([hashtable]$Configuration)
    
    try {
        $credentialPath = $Configuration.authentication.credentialStorePath
        
        if (Test-Path $credentialPath) {
            Remove-Item $credentialPath -Force
            Write-MandALog "Stored credentials removed successfully" -Level "SUCCESS"
            return $true
        } else {
            Write-MandALog "No stored credentials found to remove" -Level "INFO"
            return $true
        }
        
    } catch {
        Write-MandALog "Failed to remove stored credentials: $($_.Exception.Message)" -Level "ERROR"
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
