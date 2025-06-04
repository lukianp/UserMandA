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

# Add at module level (outside the function)
$script:AuthInitializationInProgress = $false
$script:AuthInitializationAttempts = 0
$script:MaxAuthAttempts = 3

function Initialize-MandAAuthentication {
    param([hashtable]$Configuration)
    
    # Protect against recursive calls
    if ($script:AuthInitializationInProgress) {
        Write-MandALog "WARNING: Authentication initialization already in progress - preventing recursion" -Level "WARN"
        return @{
            Authenticated = $false
            Error = "Authentication initialization already in progress"
            Timestamp = Get-Date
        }
    }
    
    # Check if we've exceeded max attempts
    if ($script:AuthInitializationAttempts -ge $script:MaxAuthAttempts) {
        Write-MandALog "ERROR: Maximum authentication attempts ($script:MaxAuthAttempts) exceeded" -Level "ERROR"
        return @{
            Authenticated = $false
            Error = "Maximum authentication attempts exceeded"
            Timestamp = Get-Date
        }
    }
    
    # Set flags to prevent recursion
    $script:AuthInitializationInProgress = $true
    $script:AuthInitializationAttempts++
    
    try {
        Write-MandALog "===============================================" -Level "HEADER"
        Write-MandALog "INITIALIZING AUTHENTICATION (Attempt $script:AuthInitializationAttempts/$script:MaxAuthAttempts)" -Level "HEADER"
        Write-MandALog "===============================================" -Level "INFO"
        
        # Validate configuration parameter
        if ($null -eq $Configuration) {
            throw "Configuration parameter is null"
        }
        
        if ($null -eq $Configuration.authentication) {
            throw "Configuration.authentication section is missing"
        }
        
        # Debug configuration
        Write-MandALog "DEBUG: Authentication configuration:" -Level "DEBUG"
        Write-MandALog "  - Use Service Principal: $($Configuration.authentication.useServicePrincipal)" -Level "DEBUG"
        Write-MandALog "  - Use Interactive Auth: $($Configuration.authentication.useInteractiveAuth)" -Level "DEBUG"
        Write-MandALog "  - Credential Store Path: $($Configuration.authentication.credentialStorePath)" -Level "DEBUG"
        Write-MandALog "  - Authentication Method: $($Configuration.authentication.authenticationMethod)" -Level "DEBUG"
        
        # Clear any existing auth context
        $script:AuthContext = $null
        $script:LastAuthAttempt = Get-Date

        # Check if Get-SecureCredentials function exists
        if (-not (Get-Command Get-SecureCredentials -ErrorAction SilentlyContinue)) {
            throw "Get-SecureCredentials function not found. Ensure CredentialManagement module is loaded."
        }

        # Get credentials with timeout protection
        Write-MandALog "Retrieving credentials..." -Level "INFO"
        
        $credentialJob = Start-Job -ScriptBlock {
            param($config, $modulePath)
            
            # Import required module in job context
            if (Test-Path $modulePath) {
                Import-Module $modulePath -Force
            }
            
            # Call Get-SecureCredentials
            Get-SecureCredentials -Configuration $config
        } -ArgumentList $Configuration, (Join-Path $PSScriptRoot "CredentialManagement.psm1")
        
        # Wait for job with timeout (30 seconds)
        $credentials = $null
        $jobCompleted = Wait-Job -Job $credentialJob -Timeout 30
        
        if ($jobCompleted) {
            $credentials = Receive-Job -Job $credentialJob -ErrorAction Stop
            Remove-Job -Job $credentialJob -Force
        } else {
            Stop-Job -Job $credentialJob
            Remove-Job -Job $credentialJob -Force
            throw "Credential retrieval timed out after 30 seconds"
        }
        
        # Validate credential retrieval result
        if (-not $credentials) {
            throw "Get-SecureCredentials returned null"
        }
        
        if ($credentials -is [hashtable]) {
            Write-MandALog "DEBUG: Credentials returned as hashtable" -Level "DEBUG"
            
            if ($credentials.ContainsKey('Success') -and -not $credentials.Success) {
                $errorMsg = if ($credentials.Error) { $credentials.Error } else { "Unknown error in credential retrieval" }
                throw "Failed to obtain credentials: $errorMsg"
            }
            
            # Validate required properties
            $requiredProps = @('ClientId', 'ClientSecret', 'TenantId')
            $missingProps = @()
            
            foreach ($prop in $requiredProps) {
                if (-not $credentials.ContainsKey($prop) -or [string]::IsNullOrWhiteSpace($credentials.$prop)) {
                    $missingProps += $prop
                }
            }
            
            if ($missingProps.Count -gt 0) {
                throw "Missing required credential properties: $($missingProps -join ', ')"
            }
        } else {
            throw "Invalid credential object type returned: $($credentials.GetType().Name)"
        }
        
        Write-MandALog "✅ Credentials obtained successfully" -Level "SUCCESS"
        Write-MandALog "  - Client ID: $($credentials.ClientId.Substring(0,8))..." -Level "DEBUG"
        Write-MandALog "  - Tenant ID: $($credentials.TenantId.Substring(0,8))..." -Level "DEBUG"
        Write-MandALog "  - Has Secret: $(if($credentials.ClientSecret){'Yes'}else{'No'})" -Level "DEBUG"
        
        # Skip Test-CredentialValidity if it might cause recursion
        $skipValidation = $false
        if (Get-Command Test-CredentialValidity -ErrorAction SilentlyContinue) {
            # Check if Test-CredentialValidity might call back to Initialize-MandAAuthentication
            $validationFunc = Get-Command Test-CredentialValidity
            if ($validationFunc.ScriptBlock -match 'Initialize-MandAAuthentication') {
                Write-MandALog "WARNING: Skipping credential validation to prevent recursion" -Level "WARN"
                $skipValidation = $true
            }
        } else {
            Write-MandALog "WARNING: Test-CredentialValidity function not found - skipping validation" -Level "WARN"
            $skipValidation = $true
        }
        
        if (-not $skipValidation) {
            Write-MandALog "Validating credentials..." -Level "INFO"
            
            # Run validation in a job to prevent recursion
            $validationJob = Start-Job -ScriptBlock {
                param($creds, $config, $modulePath)
                
                if (Test-Path $modulePath) {
                    Import-Module $modulePath -Force
                }
                
                Test-CredentialValidity -Credentials $creds -Configuration $config
            } -ArgumentList $credentials, $Configuration, (Join-Path $PSScriptRoot "CredentialManagement.psm1")
            
            $validationResult = $null
            $jobCompleted = Wait-Job -Job $validationJob -Timeout 10
            
            if ($jobCompleted) {
                $validationResult = Receive-Job -Job $validationJob -ErrorAction Stop
                Remove-Job -Job $validationJob -Force
            } else {
                Stop-Job -Job $validationJob
                Remove-Job -Job $validationJob -Force
                Write-MandALog "WARNING: Credential validation timed out - proceeding without validation" -Level "WARN"
                $validationResult = $true  # Assume valid if timeout
            }
            
            if (-not $validationResult) {
                throw "Credential validation failed"
            }
            
            Write-MandALog "✅ Credentials validated successfully" -Level "SUCCESS"
        }
        
        # Store authentication context in module scope
        $script:AuthContext = @{
            ClientId = $credentials.ClientId
            ClientSecret = $credentials.ClientSecret
            TenantId = $credentials.TenantId
            TokenExpiry = (Get-Date).AddSeconds(3600)  # Default 1 hour
            LastRefresh = Get-Date
            CredentialSource = if ($credentials.ContainsKey('Source')) { $credentials.Source } else { "Unknown" }
            AuthenticationMethod = $Configuration.authentication.authenticationMethod
        }
        
        # Apply token refresh threshold if specified
        if ($Configuration.authentication.tokenRefreshThreshold -gt 0) {
            $script:AuthContext.TokenExpiry = (Get-Date).AddSeconds($Configuration.authentication.tokenRefreshThreshold)
        }
        
        Write-MandALog "DEBUG: Stored authentication context in module scope" -Level "DEBUG"
        
        # Create return object with all necessary information
        $authResult = @{
            Authenticated = $true
            ClientId = $credentials.ClientId
            TenantId = $credentials.TenantId
            TokenExpiry = $script:AuthContext.TokenExpiry
            AuthenticationMethod = $script:AuthContext.AuthenticationMethod
            CredentialSource = $script:AuthContext.CredentialSource
            Context = @{
                ClientId = $script:AuthContext.ClientId
                TenantId = $script:AuthContext.TenantId
                TokenExpiry = $script:AuthContext.TokenExpiry
                AuthenticationMethod = $script:AuthContext.AuthenticationMethod
            }  # Include safe subset of context
            Timestamp = Get-Date
        }
        
        Write-MandALog "✅ Authentication initialized successfully" -Level "SUCCESS"
        Write-MandALog "===============================================" -Level "INFO"
        
        # Reset attempt counter on success
        $script:AuthInitializationAttempts = 0
        
        return $authResult
        
    } catch {
        $errorDetails = @{
            Message = $_.Exception.Message
            Type = $_.Exception.GetType().Name
            StackTrace = $_.ScriptStackTrace
            Timestamp = Get-Date
            Attempt = $script:AuthInitializationAttempts
        }
        
        Write-MandALog "CRITICAL ERROR in authentication initialization:" -Level "ERROR"
        Write-MandALog "  - Error: $($errorDetails.Message)" -Level "ERROR"
        Write-MandALog "  - Type: $($errorDetails.Type)" -Level "ERROR"
        Write-MandALog "  - Attempt: $($errorDetails.Attempt)" -Level "ERROR"
        Write-MandALog "  - Stack: $($errorDetails.StackTrace)" -Level "DEBUG"
        
        # Clear any partial auth context
        $script:AuthContext = $null
        $script:LastAuthAttempt = Get-Date
        $script:AuthInitializationInProgress = $false

        return @{
            Authenticated = $false
            Error = $errorDetails.Message
            ErrorDetails = $errorDetails
            Timestamp = Get-Date
        }
    } finally {
        # Always clear the in-progress flag
        $script:AuthInitializationInProgress = $false
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
