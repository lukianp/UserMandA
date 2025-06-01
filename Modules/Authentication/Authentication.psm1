<#
.SYNOPSIS
    Core authentication orchestration for M&A Discovery Suite
.DESCRIPTION
    Manages authentication flow and token lifecycle
.NOTES
    Author: Lukian Poleschtschuk
    Version: 1.0.0
    Created: 2025-05-31
    Last Modified: 2025-05-31
#>


function Initialize-MandAAuthentication {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Initializing authentication" -Level "INFO"
        
        # Get credentials
        $credentials = Get-SecureCredentials -Configuration $Configuration
        if (-not $credentials.Success) {
            Write-MandALog "Failed to obtain credentials: $($credentials.Error)" -Level "ERROR"
            return @{
                Authenticated = $false
                Error = "Failed to obtain valid credentials"
            }
        }
        
        Write-MandALog "Credentials obtained successfully" -Level "SUCCESS"
        
        # Validate credentials
        $validationResult = Test-CredentialValidity -Credentials $credentials -Configuration $Configuration
        if (-not $validationResult) {
            Write-MandALog "Credential validation failed" -Level "ERROR"
            return @{
                Authenticated = $false
                Error = "Credential validation failed"
            }
        }
        
        Write-MandALog "Credentials validated successfully" -Level "SUCCESS"
        
        # Store authentication context
        $script:AuthContext = @{
            ClientId = $credentials.ClientId
            ClientSecret = $credentials.ClientSecret
            TenantId = $credentials.TenantId
            TokenExpiry = (Get-Date).AddSeconds($Configuration.authentication.tokenRefreshThreshold)
            LastRefresh = Get-Date
        }
        
        Write-MandALog "Authentication initialized successfully" -Level "SUCCESS"
        
        # Return a proper authentication result
        return @{
            Authenticated = $true
            ClientId = $credentials.ClientId
            TenantId = $credentials.TenantId
            Context = $script:AuthContext
        }
        
    } catch {
        Write-MandALog "Authentication initialization failed: $($_.Exception.Message)" -Level "ERROR"
        return @{
            Authenticated = $false
            Error = $_.Exception.Message
        }
    }
}

function Test-AuthenticationStatus {
    param([hashtable]$Configuration)
    
    if (-not $script:AuthContext) {
        return $false
    }
    
    # Check if token needs refresh
    if ((Get-Date) -gt $script:AuthContext.TokenExpiry) {
        Write-MandALog "Authentication token expired, refreshing..." -Level "WARN"
        return Update-AuthenticationTokens -Configuration $Configuration
    }
    
    return $true
}

function Update-AuthenticationTokens {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Refreshing authentication tokens" -Level "INFO"
        
        # Re-authenticate with stored credentials
        $refreshResult = Initialize-MandAAuthentication -Configuration $Configuration
        
        if ($refreshResult) {
            Write-MandALog "Authentication tokens refreshed successfully" -Level "SUCCESS"
        }
        
        return $refreshResult
        
    } catch {
        Write-MandALog "Token refresh failed: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Get-AuthenticationContext {
    return $script:AuthContext
}

function Clear-AuthenticationContext {
    $script:AuthContext = $null
    Write-MandALog "Authentication context cleared" -Level "INFO"
}

# Export functions
Export-ModuleMember -Function @(
    'Initialize-MandAAuthentication',
    'Test-AuthenticationStatus', 
    'Update-AuthenticationTokens',
    'Get-AuthenticationContext',
    'Clear-AuthenticationContext'
)
