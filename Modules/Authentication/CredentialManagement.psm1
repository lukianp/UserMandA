# -*- coding: utf-8-bom -*-

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-05
# Last Modified: 2025-06-06
# Change Log: Updated version control header

<#
.SYNOPSIS
    Secure credential storage and retrieval for M&A Discovery Suite
.DESCRIPTION
    Handles encrypted credential storage using DPAPI with standardized format
.NOTES
    Author: M&A Discovery Team
    Version: 2.1.0
    Created: 2025-05-31
    Last Modified: 2025-01-10
    Fixed: 2025-01-15 - Removed global dependency at module load time
#>

# Module-scope context variable
$script:ModuleContext = $null

# Lazy initialization function
function Get-ModuleContext {
    try {
        if ($null -eq $script:ModuleContext) {
            if ($null -ne $global:MandA) {
                $script:ModuleContext = $global:MandA
            } else {
                throw "Module context not available"
            }
        }
        return $script:ModuleContext
    } catch {
        Write-Host "Error in function 'Get-ModuleContext': $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

function Invoke-SafeModuleExecution {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,
        
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    $result = @{
        Success = $false
        Data = $null
        Error = $null
        Duration = $null
    }
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        # Validate global context
        if (-not $global:MandA -or -not $global:MandA.Initialized) {
            throw "Global M&A context not initialized"
        }
        
        # Execute the module function
        $result.Data = & $ScriptBlock
        $result.Success = $true
    } catch {
        $result.Error = @{
            Message = $_.Exception.Message
            Type = $_.Exception.GetType().FullName
            StackTrace = $_.ScriptStackTrace
            InnerException = if ($_.Exception.InnerException) { $_.Exception.InnerException.Message } else { $null }
        }
        
        # Log to both file and console
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "[$ModuleName] Error: $($_.Exception.Message)" -Level "ERROR" -Component $ModuleName -Context $Context
        } else {
            Write-Host "[$ModuleName] Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Don't rethrow - let caller handle based on result
    } finally {
        $stopwatch.Stop()
        $result.Duration = $stopwatch.Elapsed
    }
    
    return $result
}

# Module-scoped variables
$script:CredentialFormatHandlerLoaded = $false

function Ensure-CredentialFormatHandler {
    if ($script:CredentialFormatHandlerLoaded) {
        return $true
    }
    
    $formatHandlerPath = $null

    # Try to get from module context first
    try {
        $moduleContext = Get-ModuleContext
        if ($moduleContext.Paths.Utilities) {
            $formatHandlerPath = Join-Path $moduleContext.Paths.Utilities "CredentialFormatHandler.psm1"
        }
    } catch {
        # Fallback if context not available
    }

    # If not found, try relative path
    if (-not $formatHandlerPath -or -not (Test-Path $formatHandlerPath)) {
        $formatHandlerPath = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "Modules\Utilities\CredentialFormatHandler.psm1"
    }
    
    if ($formatHandlerPath -and (Test-Path $formatHandlerPath)) {
        Import-Module $formatHandlerPath -Force
        $script:CredentialFormatHandlerLoaded = $true
        return $true
    } else {
        # Try to find it using Get-Module
        $utilModule = Get-Module -ListAvailable -Name "CredentialFormatHandler" | Select-Object -First 1
        if ($utilModule) {
            Import-Module $utilModule.Path -Force
            $script:CredentialFormatHandlerLoaded = $true
            return $true
        } else {
            throw "Cannot find CredentialFormatHandler.psm1. Searched at: $formatHandlerPath"
        }
    }
}

function Get-SecureCredentials {
    param([hashtable]$Configuration)
    
    try {
        # Ensure the format handler is loaded
        Ensure-CredentialFormatHandler
        
        $credentialPath = $Configuration.authentication.credentialStorePath
        
        Write-CredentialLog "Attempting to load credentials from: $credentialPath" -Level "INFO"
        
        # Try to read existing credentials
        if (Test-Path $credentialPath -PathType Leaf) {
            try {
                $credentialData = Read-CredentialFile -Path $credentialPath
                
                # Validate we have the required fields
                if ($credentialData.ClientId -and $credentialData.ClientSecret -and $credentialData.TenantId) {
                    Write-CredentialLog "Credentials loaded successfully from file" -Level "SUCCESS"
                    
                    return @{
                        Success = $true
                        ClientId = $credentialData.ClientId
                        ClientSecret = $credentialData.ClientSecret
                        TenantId = $credentialData.TenantId
                        ExpiryDate = $credentialData.ExpiryDate
                    }
                } else {
                    Write-CredentialLog "Credential file exists but is missing required fields" -Level "ERROR"
                }
            } catch {
                Write-CredentialLog "Failed to read credential file: $($_.Exception.Message)" -Level "ERROR"
            }
        } else {
            Write-CredentialLog "Credential file not found at: $credentialPath" -Level "INFO"
        }
        
        # If we get here, we need interactive credentials
        Write-CredentialLog "Stored credentials not available, prompting for interactive input" -Level "WARN"
        return Get-InteractiveCredentials -Configuration $Configuration
    } catch {
        Write-CredentialLog "Error retrieving credentials: $($_.Exception.Message)" -Level "ERROR"
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

function Get-InteractiveCredentials {
    param([hashtable]$Configuration)
    
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
        }
    } catch {
        Write-CredentialLog "Interactive credential collection failed: $($_.Exception.Message)" -Level "ERROR"
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
        # Ensure the format handler is loaded
        Ensure-CredentialFormatHandler
        
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
            Write-CredentialLog "Credentials saved securely to: $credentialPath" -Level "SUCCESS"
            
            # Verify we can read it back
            try {
                $verifyData = Read-CredentialFile -Path $credentialPath
                if ($verifyData.ClientId -eq $ClientId) {
                    Write-CredentialLog "Credential file verification successful" -Level "SUCCESS"
                } else {
                    throw "Verification failed - data mismatch"
                }
            } catch {
                Write-CredentialLog "WARNING: Saved credentials but verification failed: $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        return $result
    } catch {
        Write-CredentialLog "Failed to save credentials: $($_.Exception.Message)" -Level "ERROR"
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
            Write-CredentialLog "Invalid credential format provided" -Level "ERROR"
            return $false
        }
        
        # Basic validation
        if (-not ($credData.ClientId -and $credData.ClientSecret -and $credData.TenantId)) {
            Write-CredentialLog "Incomplete credentials: missing required fields" -Level "ERROR"
            return $false
        }
        
        # GUID format validation
        if ($credData.ClientId -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
            Write-CredentialLog "Invalid ClientId format: Must be a valid GUID" -Level "ERROR"
            return $false
        }
        
        if ($credData.TenantId -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
            Write-CredentialLog "Invalid TenantId format: Must be a valid GUID" -Level "ERROR"
            return $false
        }
        
        Write-CredentialLog "Credential format validation passed" -Level "SUCCESS"
        return $true
    } catch {
        Write-CredentialLog "Error during credential validation: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Remove-StoredCredentials {
    param([hashtable]$Configuration)
    
    try {
        $credentialPath = $Configuration.authentication.credentialStorePath
        
        if (Test-Path $credentialPath) {
            Remove-Item $credentialPath -Force
            Write-CredentialLog "Stored credentials removed successfully" -Level "SUCCESS"
            return $true
        } else {
            Write-CredentialLog "No stored credentials found to remove" -Level "INFO"
            return $true
        }
    } catch {
        Write-CredentialLog "Failed to remove stored credentials: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

# Helper function for logging when Write-MandALog might not be available
function Write-CredentialLog {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    try {
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue -CommandType Function) {
            & Write-MandALog $Message -Level $Level
        } else {
            $color = switch ($Level) {
                "ERROR" { "Red" }
                "WARN" { "Yellow" }
                "SUCCESS" { "Green" }
                "INFO" { "White" }
                default { "Gray" }
            }
            Write-Host "[CredentialManagement] $Message" -ForegroundColor $color
        }
    } catch {
        Write-Host "Error in function 'Write-CredentialLog': $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Get-SecureCredentials',
    'Set-SecureCredentials',
    'Test-CredentialValidity',
    'Remove-StoredCredentials',
    'Get-ModuleContext',
    'Invoke-SafeModuleExecution'
)

Write-Host "[CredentialManagement.psm1] Module loaded successfully." -ForegroundColor Green
