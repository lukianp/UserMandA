<#
.SYNOPSIS
    Core authentication orchestration for M&A Discovery Suite
.DESCRIPTION
    Manages authentication flow and token lifecycle with comprehensive error handling
.NOTES
    Author: Enhanced Version
    Version: 2.1.0
    Created: 2025-06-02
    Fixed: 2025-01-15 - Removed global dependency at module load time
#>

# Module-scoped variables
$script:AuthContext = $null
$script:LastAuthAttempt = $null

function Initialize-MandAAuthentication {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "===============================================" -Level "HEADER"
        Write-MandALog "INITIALIZING AUTHENTICATION" -Level "HEADER"
        Write-MandALog "===============================================" -Level "INFO"
        
        # Debug configuration
        Write-MandALog "DEBUG: Authentication configuration:" -Level "DEBUG"
        Write-MandALog "  - Use Service Principal: $($Configuration.authentication.useServicePrincipal)" -Level "DEBUG"
        Write-MandALog "  - Use Interactive Auth: $($Configuration.authentication.useInteractiveAuth)" -Level "DEBUG"
        Write-MandALog "  - Credential Store Path: $($Configuration.authentication.credentialStorePath)" -Level "DEBUG"
        Write-MandALog "  - Authentication Method: $($Configuration.authentication.authenticationMethod)" -Level "DEBUG"
        
        # Clear any existing auth context
        $script:AuthContext = $null
        $script:LastAuthAttempt = Get-Date

        # Get credentials
        Write-MandALog "Retrieving credentials..." -Level "INFO"
        $credentials = Get-SecureCredentials -Configuration $Configuration
        
        # Validate credential retrieval result
        if (-not $credentials) {
            Write-MandALog "ERROR: Get-SecureCredentials returned null" -Level "ERROR"
            return @{
                Authenticated = $false
                Error = "Failed to obtain credentials - null result"
                Timestamp = Get-Date
            }
        }
        
        if ($credentials -is [hashtable]) {
            Write-MandALog "DEBUG: Credentials returned as hashtable" -Level "DEBUG"
            Write-MandALog "  - Has Success property: $($credentials.ContainsKey('Success'))" -Level "DEBUG"
            Write-MandALog "  - Success value: $($credentials.Success)" -Level "DEBUG"
            Write-MandALog "  - Has Error property: $($credentials.ContainsKey('Error'))" -Level "DEBUG"
            
            if (-not $credentials.Success) {
                $errorMsg = if ($credentials.Error) { $credentials.Error } else { "Unknown error in credential retrieval" }
                Write-MandALog "ERROR: Failed to obtain credentials: $errorMsg" -Level "ERROR"
                return @{
                    Authenticated = $false
                    Error = "Failed to obtain valid credentials: $errorMsg"
                    Timestamp = Get-Date
                }
            }
            
            # Validate required properties
            $requiredProps = @('ClientId', 'ClientSecret', 'TenantId')
            $missingProps = @()
            
            foreach ($prop in $requiredProps) {
                if (-not $credentials.$prop -or [string]::IsNullOrWhiteSpace($credentials.$prop)) {
                    $missingProps += $prop
                    Write-MandALog "ERROR: Missing required credential property: $prop" -Level "ERROR"
                }
            }
            
            if ($missingProps.Count -gt 0) {
                return @{
                    Authenticated = $false
                    Error = "Missing required credential properties: $($missingProps -join ', ')"
                    Timestamp = Get-Date
                }
            }
        } else {
            Write-MandALog "ERROR: Unexpected credential type: $($credentials.GetType().Name)" -Level "ERROR"
            return @{
                Authenticated = $false
                Error = "Invalid credential object type returned"
                Timestamp = Get-Date
            }
        }
        
        Write-MandALog "✅ Credentials obtained successfully" -Level "SUCCESS"
        Write-MandALog "  - Client ID: $($credentials.ClientId)" -Level "DEBUG"
        Write-MandALog "  - Tenant ID: $($credentials.TenantId)" -Level "DEBUG"
        Write-MandALog "  - Has Secret: $(if($credentials.ClientSecret){'Yes'}else{'No'})" -Level "DEBUG"
        
        # Validate credentials
        Write-MandALog "Validating credentials..." -Level "INFO"
        $validationResult = Test-CredentialValidity -Credentials $credentials -Configuration $Configuration
        
        if (-not $validationResult) {
            Write-MandALog "ERROR: Credential validation failed" -Level "ERROR"
            return @{
                Authenticated = $false
                Error = "Credential validation failed - invalid format or missing data"
                Timestamp = Get-Date
            }
        }
        
        Write-MandALog "✅ Credentials validated successfully" -Level "SUCCESS"
        
        # Store authentication context in module scope
        $script:AuthContext = @{
            ClientId = $credentials.ClientId
            ClientSecret = $credentials.ClientSecret
            TenantId = $credentials.TenantId
            TokenExpiry = (Get-Date).AddSeconds($Configuration.authentication.tokenRefreshThreshold)
            LastRefresh = Get-Date
            CredentialSource = if ($credentials.ContainsKey('Source')) { $credentials.Source } else { "Unknown" }
            AuthenticationMethod = $Configuration.authentication.authenticationMethod
        }
        
        Write-MandALog "DEBUG: Stored authentication context in module scope" -Level "DEBUG"
        Write-MandALog "  - AuthContext keys: $($script:AuthContext.Keys -join ', ')" -Level "DEBUG"
        
        # Create return object with all necessary information
        $authResult = @{
            Authenticated = $true
            ClientId = $credentials.ClientId
            TenantId = $credentials.TenantId
            TokenExpiry = $script:AuthContext.TokenExpiry
            AuthenticationMethod = $script:AuthContext.AuthenticationMethod
            CredentialSource = $script:AuthContext.CredentialSource
            Context = $script:AuthContext  # Include the full context
            Timestamp = Get-Date
        }
        
        Write-MandALog "✅ Authentication initialized successfully" -Level "SUCCESS"
        Write-MandALog "  - Result type: Hashtable" -Level "DEBUG"
        Write-MandALog "  - Result keys: $($authResult.Keys -join ', ')" -Level "DEBUG"
        Write-MandALog "===============================================" -Level "INFO"
        
        return $authResult
        
    } catch {
        $errorDetails = @{
            Message = $_.Exception.Message
            Type = $_.Exception.GetType().Name
            StackTrace = $_.ScriptStackTrace
            Timestamp = Get-Date
        }
        
        Write-MandALog "CRITICAL ERROR in authentication initialization:" -Level "ERROR"
        Write-MandALog "  - Error: $($errorDetails.Message)" -Level "ERROR"
        Write-MandALog "  - Type: $($errorDetails.Type)" -Level "ERROR"
        Write-MandALog "  - Stack: $($errorDetails.StackTrace)" -Level "DEBUG"
        
        # Clear any partial auth context
        $script:AuthContext = $null
        
        return @{
            Authenticated = $false
            Error = $errorDetails.Message
            ErrorDetails = $errorDetails
            Timestamp = Get-Date
        }
    }
}

function Test-AuthenticationStatus {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "DEBUG: Testing authentication status..." -Level "DEBUG"
        
        if (-not $script:AuthContext) {
            Write-MandALog "WARN: No authentication context found" -Level "WARN"
            return $false
        }
        
        Write-MandALog "DEBUG: Auth context exists with keys: $($script:AuthContext.Keys -join ', ')" -Level "DEBUG"
        
        # Check if token needs refresh
        if ((Get-Date) -gt $script:AuthContext.TokenExpiry) {
            Write-MandALog "Authentication token expired, refreshing..." -Level "WARN"
            return Update-AuthenticationTokens -Configuration $Configuration
        }
        
        Write-MandALog "DEBUG: Authentication is valid" -Level "DEBUG"
        return $true
        
    } catch {
        Write-MandALog "ERROR: Failed to test authentication status: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Update-AuthenticationTokens {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Refreshing authentication tokens..." -Level "INFO"
        
        # Re-authenticate with stored credentials
        $refreshResult = Initialize-MandAAuthentication -Configuration $Configuration
        
        if ($refreshResult -and $refreshResult.Authenticated) {
            Write-MandALog "✅ Authentication tokens refreshed successfully" -Level "SUCCESS"
            return $true
        } else {
            $errorMsg = if ($refreshResult.Error) { $refreshResult.Error } else { "Unknown error" }
            Write-MandALog "ERROR: Token refresh failed: $errorMsg" -Level "ERROR"
            return $false
        }
        
    } catch {
        Write-MandALog "ERROR: Token refresh failed with exception: $($_.Exception.Message)" -Level "ERROR"
        Write-MandALog "Stack trace: $($_.ScriptStackTrace)" -Level "DEBUG"
        return $false
    }
}

function Get-AuthenticationContext {
    try {
        if ($script:AuthContext) {
            Write-MandALog "DEBUG: Returning stored auth context with keys: $($script:AuthContext.Keys -join ', ')" -Level "DEBUG"
            
            # Validate context has required properties
            $requiredProps = @('ClientId', 'ClientSecret', 'TenantId')
            $missingProps = @()
            
            foreach ($prop in $requiredProps) {
                if (-not $script:AuthContext.$prop) {
                    $missingProps += $prop
                }
            }
            
            if ($missingProps.Count -gt 0) {
                Write-MandALog "WARN: Auth context missing properties: $($missingProps -join ', ')" -Level "WARN"
                return $null
            }
            
            return $script:AuthContext
        } else {
            Write-MandALog "DEBUG: No authentication context available" -Level "DEBUG"
            return $null
        }
    } catch {
        Write-MandALog "ERROR: Failed to get authentication context: $($_.Exception.Message)" -Level "ERROR"
        return $null
    }
}

function Clear-AuthenticationContext {
    try {
        $script:AuthContext = $null
        $script:LastAuthAttempt = $null
        Write-MandALog "✅ Authentication context cleared" -Level "INFO"
    } catch {
        Write-MandALog "ERROR: Failed to clear authentication context: $($_.Exception.Message)" -Level "ERROR"
    }
}

function Get-AuthenticationStatus {
    <#
    .SYNOPSIS
        Returns detailed authentication status information
    #>
    try {
        $status = @{
            IsAuthenticated = ($null -ne $script:AuthContext)
            HasValidContext = $false
            LastAuthAttempt = $script:LastAuthAttempt
            TokenExpiry = $null
            TimeRemaining = $null
            ContextKeys = @()
        }
        
        if ($script:AuthContext) {
            $status.ContextKeys = $script:AuthContext.Keys
            $status.TokenExpiry = $script:AuthContext.TokenExpiry
            
            # Check if context has required properties
            $requiredProps = @('ClientId', 'ClientSecret', 'TenantId')
            $hasAllProps = $true
            foreach ($prop in $requiredProps) {
                if (-not $script:AuthContext.$prop) {
                    $hasAllProps = $false
                    break
                }
            }
            
            $status.HasValidContext = $hasAllProps
            
            if ($script:AuthContext.TokenExpiry) {
                $timeRemaining = $script:AuthContext.TokenExpiry - (Get-Date)
                $status.TimeRemaining = $timeRemaining
                $status.IsExpired = $timeRemaining.TotalSeconds -le 0
            }
        }
        
        return $status
        
    } catch {
        Write-MandALog "ERROR: Failed to get authentication status: $($_.Exception.Message)" -Level "ERROR"
        return @{
            IsAuthenticated = $false
            Error = $_.Exception.Message
        }
    }
}

# Helper function for logging when Write-MandALog might not be available
function Write-MandALog {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue -CommandType Function) {
        & Write-MandALog $Message -Level $Level
    } else {
        $color = switch ($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "SUCCESS" { "Green" }
            "INFO" { "White" }
            "HEADER" { "Cyan" }
            "DEBUG" { "Gray" }
            default { "Gray" }
        }
        Write-Host "[Authentication] $Message" -ForegroundColor $color
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Initialize-MandAAuthentication',
    'Test-AuthenticationStatus', 
    'Update-AuthenticationTokens',
    'Get-AuthenticationContext',
    'Clear-AuthenticationContext',
    'Get-AuthenticationStatus'
)

Write-Host "[Authentication] Module loaded successfully" -ForegroundColor Gray
