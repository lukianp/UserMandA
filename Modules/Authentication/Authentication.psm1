#Requires -Version 5.1
<#
.SYNOPSIS
    Core authentication orchestration for M&A Discovery Suite
.DESCRIPTION
    Manages authentication flow and token lifecycle with comprehensive error handling.
    Relies on CredentialManagement.psm1 for credential storage and retrieval.
.NOTES
    Author: Enhanced Version
    Version: 2.2.0
    Created: 2025-06-02
    Last Modified: 2025-06-05
    Changes: 
    - Simplified credential retrieval (removed Start-Job as per user feedback).
    - Enhanced recursion protection and attempt counting.
    - Passes $Context to Write-MandALog calls.
    - Clarified that Test-CredentialValidity is responsible for actual auth test (e.g., Graph call).
#>

# Module-scoped variables to manage authentication state and prevent recursion
$script:AuthContext = $null
$script:LastAuthAttemptTimestamp = $null # Renamed from LastAuthAttempt for clarity
$script:AuthInitializationInProgress = $false
$script:AuthInitializationAttempts = 0
$script:MaxAuthInitializationAttempts = 3 # Max attempts for a single Initialize-MandAAuthentication call chain

# Ensure Write-MandALog is available or provide a fallback for internal logging
# This module should ideally be loaded after EnhancedLogging.psm1 by the orchestrator.
function _AuthLog {
    param([string]$Message, [string]$Level = "INFO", [MandAContext]$ContextForLog = $null)
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        # If Context is passed, use it, otherwise try to use global context if available for logging
        $effectiveContext = $ContextForLog
        if ($null -eq $effectiveContext -and $global:MandA) {
            $effectiveContext = $global:MandA # Assuming $global:MandA is the structure Write-MandALog expects for Config
        }
        try {
            Write-MandALog -Message $Message -Level $Level -Component "Authentication" -Context $effectiveContext
        } catch { Write-Host "[AUTH-$Level] $Message (Write-MandALog failed: $($_.Exception.Message))" }
    } else {
        Write-Host "[AUTH-$Level] $Message"
    }
}

function Initialize-MandAAuthentication {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$false)] # Make $Context mandatory if it's always needed
        [MandAContext]$Context 
    )
    
    if ($script:AuthInitializationInProgress) {
        _AuthLog "WARNING: Authentication initialization already in progress - preventing recursion." -Level "WARN" -ContextForLog $Context
        return @{ Authenticated = $false; Error = "Authentication initialization already in progress"; Timestamp = Get-Date }
    }
    
    if ($script:AuthInitializationAttempts -ge $script:MaxAuthInitializationAttempts) {
        _AuthLog "ERROR: Maximum authentication attempts ($script:MaxAuthInitializationAttempts) exceeded." -Level "ERROR" -ContextForLog $Context
        return @{ Authenticated = $false; Error = "Maximum authentication attempts exceeded"; Timestamp = Get-Date }
    }
    
    $script:AuthInitializationInProgress = $true
    $script:AuthInitializationAttempts++
    
    try {
        _AuthLog "===============================================" -Level "HEADER" -ContextForLog $Context
        _AuthLog "INITIALIZING AUTHENTICATION (Attempt $($script:AuthInitializationAttempts)/$($script:MaxAuthInitializationAttempts))" -Level "HEADER" -ContextForLog $Context
        _AuthLog "===============================================" -Level "INFO" -ContextForLog $Context
        
        if ($null -eq $Configuration) { throw "Configuration parameter is null" }
        if ($null -eq $Configuration.authentication) { throw "Configuration.authentication section is missing" }

        _AuthLog "DEBUG: Auth Config - Use SP: $($Configuration.authentication.useServicePrincipal), Interactive: $($Configuration.authentication.useInteractiveAuth), Method: $($Configuration.authentication.authenticationMethod)" -Level "DEBUG" -ContextForLog $Context
        _AuthLog "DEBUG: Auth Config - Credential Store Path: $($Configuration.authentication.credentialStorePath)" -Level "DEBUG" -ContextForLog $Context
        
        $script:AuthContext = $null # Clear previous context
        $script:LastAuthAttemptTimestamp = Get-Date

        if (-not (Get-Command Get-SecureCredentials -ErrorAction SilentlyContinue)) {
            throw "Get-SecureCredentials function not found. Ensure CredentialManagement.psm1 module is loaded."
        }

        _AuthLog "Retrieving credentials directly..." -Level "INFO" -ContextForLog $Context
        # Direct credential retrieval as per user feedback (removed Start-Job)
        $credentials = Get-SecureCredentials -Configuration $Configuration -Context $Context # Pass Context if Get-SecureCredentials needs it for logging
        
        if (-not $credentials) { throw "Get-SecureCredentials returned null or empty." }

        if ($credentials -is [hashtable]) {
             _AuthLog "DEBUG: Credentials obtained: $($credentials.Keys -join ', ')" -Level "DEBUG" -ContextForLog $Context
            if ($credentials.ContainsKey('Success') -and -not $credentials.Success) {
                $errorMsg = $credentials.Error | Get-OrElse "Unknown error in credential retrieval"
                throw "Failed to obtain credentials: $errorMsg"
            }
            $requiredProps = @('ClientId', 'ClientSecret', 'TenantId')
            $missingProps = $requiredProps | Where-Object { -not $credentials.ContainsKey($_) -or [string]::IsNullOrWhiteSpace($credentials.$_) }
            if ($missingProps.Count -gt 0) {
                throw "Missing required credential properties: $($missingProps -join ', ')"
            }
        } else {
            throw "Invalid credential object type returned: $($credentials.GetType().Name)"
        }

        _AuthLog "Credentials obtained successfully." -Level "SUCCESS" -ContextForLog $Context
        _AuthLog "  - Client ID: $($credentials.ClientId.Substring(0,[System.Math]::Min($credentials.ClientId.Length, 8)))..." -Level "DEBUG" -ContextForLog $Context
        
        # The actual connection and token acquisition using these credentials would typically happen
        # in the Connectivity modules (e.g., Connect-MandAGraph in EnhancedConnectionManager.psm1).
        # Initialize-MandAAuthentication primarily ensures credentials are valid and available.
        # A simple validation (like Test-CredentialValidity) can be done here if it doesn't create recursive calls.

        $skipValidation = $false
        if (Get-Command Test-CredentialValidity -ErrorAction SilentlyContinue) {
            # This is a conceptual check. If Test-CredentialValidity makes a Graph call that itself needs this auth context,
            # it could lead to issues if not handled carefully.
            # For simplicity, assume Test-CredentialValidity is a lightweight check or handles its own minimal auth.
            _AuthLog "Validating credentials (conceptual call)..." -Level "INFO" -ContextForLog $Context
            if (-not (Test-CredentialValidity -Credentials $credentials -Configuration $Configuration -Context $Context)) { # Pass Context
                 throw "Credential validation failed by Test-CredentialValidity."
            }
            _AuthLog "Credentials conceptually validated." -Level "SUCCESS" -ContextForLog $Context
        } else {
            _AuthLog "Test-CredentialValidity function not found. Skipping active validation of credentials." -Level "WARN" -ContextForLog $Context
            # $skipValidation = $true # Or decide to throw if validation is critical
        }
        
        $tokenExpirySeconds = $Configuration.authentication.tokenRefreshThreshold | Get-OrElse 3600
        $script:AuthContext = @{
            ClientId             = $credentials.ClientId
            ClientSecret         = $credentials.ClientSecret # Storing plain text secret here; ensure it's handled securely
            TenantId             = $credentials.TenantId
            TokenExpiry          = (Get-Date).AddSeconds($tokenExpirySeconds)
            LastRefresh          = Get-Date
            CredentialSource     = $credentials.Source | Get-OrElse "StoredCredentialFile"
            AuthenticationMethod = $Configuration.authentication.authenticationMethod | Get-OrElse "ClientSecret"
        }
        _AuthLog "Authentication context stored in module scope." -Level "DEBUG" -ContextForLog $Context

        $script:AuthInitializationAttempts = 0 # Reset attempts on success
        
        return @{
            Authenticated        = $true
            Context              = $script:AuthContext # Return the created context
            Error                = $null
            Timestamp            = Get-Date
        }
        
    } catch {
        $errorDetails = @{
            Message       = $_.Exception.Message
            Type          = $_.Exception.GetType().Name
            StackTrace    = $_.ScriptStackTrace
            Timestamp     = Get-Date
            Attempt       = $script:AuthInitializationAttempts
        }
        _AuthLog "CRITICAL ERROR in authentication initialization: $($errorDetails.Message)" -Level "ERROR" -ContextForLog $Context
        _AuthLog "  - Type: $($errorDetails.Type), Attempt: $($errorDetails.Attempt)" -Level "ERROR" -ContextForLog $Context
        _AuthLog "  - Stack: $($errorDetails.StackTrace)" -Level "DEBUG" -ContextForLog $Context
        
        $script:AuthContext = $null
        $script:LastAuthAttemptTimestamp = Get-Date
        
        return @{
            Authenticated = $false
            Error         = $errorDetails.Message
            ErrorDetails  = $errorDetails
            Timestamp     = Get-Date
        }
    } finally {
        $script:AuthInitializationInProgress = $false # CRITICAL: Always reset this flag
    }
}

function Test-AuthenticationStatus {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        [MandAContext]$Context
    )
    try {
        _AuthLog "Testing authentication status..." -Level "DEBUG" -ContextForLog $Context
        if (-not $script:AuthContext) {
            _AuthLog "No authentication context found. Re-initializing." -Level "WARN" -ContextForLog $Context
            # Attempt to re-initialize. This could be a source of recursion if not handled well.
            # Consider if this function should simply report status rather than trigger re-auth.
            $initResult = Initialize-MandAAuthentication -Configuration $Configuration -Context $Context
            return ($initResult -and $initResult.Authenticated)
        }
        
        if ((Get-Date) -gt $script:AuthContext.TokenExpiry) {
            _AuthLog "Authentication token expired. Refreshing..." -Level "WARN" -ContextForLog $Context
            return Update-AuthenticationTokens -Configuration $Configuration -Context $Context
        }
        _AuthLog "Authentication is valid." -Level "DEBUG" -ContextForLog $Context
        return $true
    } catch {
        _AuthLog "Failed to test authentication status: $($_.Exception.Message)" -Level "ERROR" -ContextForLog $Context
        return $false
    }
}

function Update-AuthenticationTokens {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        [MandAContext]$Context
    )
    try {
        _AuthLog "Refreshing authentication tokens..." -Level "INFO" -ContextForLog $Context
        # This directly calls Initialize-MandAAuthentication again.
        # The recursion guards in Initialize-MandAAuthentication are critical here.
        $refreshResult = Initialize-MandAAuthentication -Configuration $Configuration -Context $Context
        
        if ($refreshResult -and $refreshResult.Authenticated) {
            _AuthLog "Authentication tokens refreshed successfully." -Level "SUCCESS" -ContextForLog $Context
            return $true
        } else {
            $errorMsg = $refreshResult.Error | Get-OrElse "Unknown error during token refresh"
            _AuthLog "Token refresh failed: $errorMsg" -Level "ERROR" -ContextForLog $Context
            return $false
        }
    } catch {
        _AuthLog "Token refresh failed with exception: $($_.Exception.Message)" -Level "ERROR" -ContextForLog $Context
        return $false
    }
}

function Get-AuthenticationContext {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [MandAContext]$Context # For logging context, not for deriving auth context
    )
    try {
        if ($script:AuthContext) {
            _AuthLog "Returning stored auth context." -Level "DEBUG" -ContextForLog $Context
            # Ensure the returned context is a clone or a safe subset if it's to be modified elsewhere
            return $script:AuthContext.Clone() 
        } else {
            _AuthLog "No authentication context available to return." -Level "DEBUG" -ContextForLog $Context
            return $null
        }
    } catch {
        _AuthLog "Failed to get authentication context: $($_.Exception.Message)" -Level "ERROR" -ContextForLog $Context
        return $null
    }
}

function Clear-AuthenticationContext {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [MandAContext]$Context # For logging context
    )
    try {
        $script:AuthContext = $null
        $script:LastAuthAttemptTimestamp = $null
        $script:AuthInitializationAttempts = 0 # Reset attempts as well
        _AuthLog "Authentication context cleared." -Level "INFO" -ContextForLog $Context
    } catch {
        _AuthLog "Failed to clear authentication context: $($_.Exception.Message)" -Level "ERROR" -ContextForLog $Context
    }
}

function Get-AuthenticationStatus {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [MandAContext]$Context # For logging context
    )
    try {
        $status = @{
            IsAuthenticated = ($null -ne $script:AuthContext)
            HasValidContext = $false # Will be determined
            LastAuthAttempt = $script:LastAuthAttemptTimestamp
            TokenExpiry = $null
            TimeRemaining = $null
            IsExpired = $true # Default to expired if no context
            ContextKeys = @()
            AuthMethod = $null
        }
        
        if ($script:AuthContext) {
            $status.ContextKeys = $script:AuthContext.Keys
            $status.TokenExpiry = $script:AuthContext.TokenExpiry
            $status.AuthMethod = $script:AuthContext.AuthenticationMethod
            
            $requiredProps = @('ClientId', 'ClientSecret', 'TenantId')
            $status.HasValidContext = ($requiredProps | ForEach-Object { $script:AuthContext.ContainsKey($_) -and -not [string]::IsNullOrWhiteSpace($script:AuthContext.$_) } | Where-Object {$_ -eq $false} | Measure-Object).Count -eq 0
            
            if ($script:AuthContext.TokenExpiry) {
                $timeRemaining = $script:AuthContext.TokenExpiry - (Get-Date)
                $status.TimeRemaining = $timeRemaining
                $status.IsExpired = $timeRemaining.TotalSeconds -le 0
            }
        }
        return $status
    } catch {
        _AuthLog "Failed to get authentication status: $($_.Exception.Message)" -Level "ERROR" -ContextForLog $Context
        return @{ IsAuthenticated = $false; Error = $_.Exception.Message }
    }
}

Export-ModuleMember -Function Initialize-MandAAuthentication, Test-AuthenticationStatus, Update-AuthenticationTokens, Get-AuthenticationContext, Clear-AuthenticationContext, Get-AuthenticationStatus

_AuthLog "[Authentication.psm1] Module loaded. Recursion guard initialized." -Level "DEBUG"

