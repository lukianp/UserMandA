<#
.SYNOPSIS
    Core authentication orchestration for M&A Discovery Suite
.DESCRIPTION
    Manages authentication flow and token lifecycle
#>

function Initialize-MandAAuthentication {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Initializing authentication" -Level "INFO"
        
        # Get credentials
        $credentials = Get-SecureCredentials -Configuration $Configuration
        if (-not $credentials.Success) {
            throw "Failed to obtain valid credentials"
        }
        
        # Test credential validity
        if (-not (Test-CredentialValidity -Credentials $credentials -Configuration $Configuration)) {
            throw "Credential validation failed"
        }
        
        # Store authentication context
        $script:AuthContext = @{
            ClientId = $credentials.ClientId
            ClientSecret = $credentials.ClientSecret
            TenantId = $credentials.TenantId
            TokenExpiry = (Get-Date).AddSeconds($Configuration.authentication.tokenRefreshThreshold)
            LastRefresh = Get-Date
        }
        
        Write-MandALog "Authentication initialized successfully" -Level "SUCCESS"
        return $true
        
    } catch {
        Write-MandALog "Authentication initialization failed: $($_.Exception.Message)" -Level "ERROR"
        return $false
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