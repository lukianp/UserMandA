<#
.SYNOPSIS
    Secure credential storage and retrieval for M&A Discovery Suite
.DESCRIPTION
    Handles encrypted credential storage using DPAPI and certificate-based encryption
#>

function Get-SecureCredentials {
    param([hashtable]$Configuration)
    
    try {
        $credentialPath = $Configuration.authentication.credentialStorePath
        
        Write-MandALog "Attempting to load credentials from: $credentialPath" -Level "INFO"
        
        if (Test-Path $credentialPath) {
            $credentials = Read-EncryptedCredentials -Path $credentialPath -Configuration $Configuration
            if ($credentials.Success) {
                return $credentials
            }
        }
        
        Write-MandALog "Stored credentials not available, prompting for interactive input" -Level "WARN"
        $interactiveCredentials = Get-InteractiveCredentials -Configuration $Configuration
        return $interactiveCredentials
        
    } catch {
        Write-MandALog "Error retrieving credentials: $($_.Exception.Message)" -Level "ERROR"
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

function Read-EncryptedCredentials {
    param(
        [string]$Path,
        [hashtable]$Configuration
    )
    
    try {
        if (-not (Test-Path $Path)) {
            throw "Credential file not found: $Path"
        }
        
        $encryptedData = Get-Content $Path -Raw -ErrorAction Stop
        if ([string]::IsNullOrWhiteSpace($encryptedData)) {
            throw "Credential file is empty or corrupted: $Path"
        }
        
        # Try DPAPI decryption first
        try {
            $secureString = ConvertTo-SecureString -String $encryptedData -ErrorAction Stop
            $jsonData = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
                [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureString)
            )
            $credentialData = $jsonData | ConvertFrom-Json -ErrorAction Stop
        } catch {
            # Try certificate-based decryption if DPAPI fails
            if ($Configuration.authentication.certificateThumbprint) {
                $credentialData = Decrypt-WithCertificate -EncryptedData $encryptedData -Thumbprint $Configuration.authentication.certificateThumbprint
            } else {
                throw "DPAPI decryption failed and no certificate configured"
            }
        }
        
        # Validate credential data
        if (-not ($credentialData.ClientId -and $credentialData.ClientSecret -and $credentialData.TenantId)) {
            throw "Incomplete credential data"
        }
        
        # Check expiry if available
        if ($credentialData.ExpiryDate) {
            $expiryDate = [DateTime]$credentialData.ExpiryDate
            if ((Get-Date) -gt $expiryDate) {
                throw "Client secret has expired"
            }
            
            $daysUntilExpiry = ($expiryDate - (Get-Date)).Days
            if ($daysUntilExpiry -le 30) {
                Write-MandALog "WARNING: Client secret expires in $daysUntilExpiry days" -Level "WARN"
            }
        }
        
        Write-MandALog "Credentials loaded successfully" -Level "SUCCESS"
        return @{
            Success = $true
            ClientId = $credentialData.ClientId
            ClientSecret = $credentialData.ClientSecret
            TenantId = $credentialData.TenantId
            ExpiryDate = $credentialData.ExpiryDate
        }
        
    } catch {
        Write-MandALog "Failed to read encrypted credentials: $($_.Exception.Message)" -Level "ERROR"
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
            $clientId = Read-Host "Client ID (GUID format)"
            if ([string]::IsNullOrWhiteSpace($clientId)) {
                Write-Host "❌ Client ID cannot be empty" -ForegroundColor Red
            } elseif ($clientId -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
                Write-Host "❌ Client ID must be a valid GUID format" -ForegroundColor Red
                $clientId = $null
            }
        } while ([string]::IsNullOrWhiteSpace($clientId))
        
        # Get Tenant ID
        do {
            $tenantId = Read-Host "Tenant ID (GUID format)"
            if ([string]::IsNullOrWhiteSpace($tenantId)) {
                Write-Host "❌ Tenant ID cannot be empty" -ForegroundColor Red
            } elseif ($tenantId -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
                Write-Host "❌ Tenant ID must be a valid GUID format" -ForegroundColor Red
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
        Write-Host "═══════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
        
        # Optionally save credentials
        $saveChoice = Read-Host "Save credentials securely for future use? (y/N)"
        if ($saveChoice -eq 'y' -or $saveChoice -eq 'Y') {
            Set-SecureCredentials -ClientId $clientId -ClientSecret $clientSecret -TenantId $tenantId -Configuration $Configuration
        }
        
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
        }
        
        $jsonData = $credentialData | ConvertTo-Json
        
        # Use DPAPI encryption by default
        $secureString = ConvertTo-SecureString -String $jsonData -AsPlainText -Force
        $encryptedData = ConvertFrom-SecureString -SecureString $secureString
        
        # Ensure directory exists
        $credentialDir = Split-Path $Configuration.authentication.credentialStorePath -Parent
        if (-not (Test-Path $credentialDir)) {
            New-Item -Path $credentialDir -ItemType Directory -Force | Out-Null
        }
        
        # Save encrypted credentials
        $encryptedData | Set-Content -Path $Configuration.authentication.credentialStorePath -Encoding UTF8
        
        Write-MandALog "Credentials saved securely to: $($Configuration.authentication.credentialStorePath)" -Level "SUCCESS"
        return $true
        
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
        # Handle different credential formats
        $credData = $null
        if ($Credentials -is [hashtable]) {
            if ($Credentials.ContainsKey('Success')) {
                # It's a wrapped credential object
                $credData = @{
                    ClientId = $Credentials.ClientId
                    ClientSecret = $Credentials.ClientSecret
                    TenantId = $Credentials.TenantId
                }
            } else {
                # It's already just the credential data
                $credData = $Credentials
            }
        } else {
            Write-MandALog "Invalid Credentials parameter type: Expected hashtable, got $($Credentials.GetType().FullName)" -Level "ERROR"
            return $false
        }
        
        # Basic format validation
        if (-not ($credData.ClientId -and $credData.ClientSecret -and $credData.TenantId)) {
            Write-MandALog "Incomplete credentials: ClientId, ClientSecret, or TenantId missing" -Level "ERROR"
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
        
        # Test authentication with Microsoft Graph
        try {
            # Check if Microsoft.Graph module is available
            if (-not (Get-Module -ListAvailable -Name "Microsoft.Graph.Authentication")) {
                Write-MandALog "Microsoft.Graph.Authentication module not available for credential validation" -Level "WARN"
                return $true # Assume valid if we can't test
            }
            
            Import-Module Microsoft.Graph.Authentication -Force
            
            $secureSecret = ConvertTo-SecureString $credData.ClientSecret -AsPlainText -Force
            $clientCredential = New-Object System.Management.Automation.PSCredential ($credData.ClientId, $secureSecret)
            
            # Attempt to connect to Graph
            Connect-MgGraph -ClientSecretCredential $clientCredential -TenantId $credData.TenantId -NoWelcome -ErrorAction Stop
            
            # Test basic Graph access
            $org = Get-MgOrganization -Top 1 -ErrorAction Stop
            
            if ($org) {
                Write-MandALog "Credential validation successful" -Level "SUCCESS"
                return $true
            }
            
        } catch {
            Write-MandALog "Credential validation failed: $($_.Exception.Message)" -Level "ERROR"
            return $false
        } finally {
            # Disconnect from Graph
            try {
                Disconnect-MgGraph -ErrorAction SilentlyContinue
            } catch {
                # Ignore disconnect errors
            }
        }
        
        return $false
        
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
