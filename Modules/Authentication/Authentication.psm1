# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-04
# Last Modified: 2025-06-06
# Change Log: Updated version control header

<#
.SYNOPSIS


# Module-scope context variable

$script:ModuleContext = $null



# Lazy initialization function

function Get-ModuleContext {

    if ($null -eq $script:ModuleContext) {

        if ($null -ne $global:MandA) {

            $script:ModuleContext = $global:MandA

        } else {

            throw "Module context not available"

        }

    }

    return $script:ModuleContext

}
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
function Write-MandALog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Component = "General",
        $Context
    )
    
    # This is a fallback - the real function should be loaded from EnhancedLogging
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue -CommandType Function) {
        # Call the real function if it exists
        & Write-MandALog $Message -Level $Level -Component $Component -Context $Context
    } else {
        # Basic fallback
        $color = switch ($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "SUCCESS" { "Green" }
            "INFO" { "White" }
            "DEBUG" { "Gray" }
            "HEADER" { "Cyan" }
            "CRITICAL" { "Magenta" }
            default { "White" }
        }
        Write-Host "[$Level] [$Component] $Message" -ForegroundColor $color
    }
}

function Initialize-MandAAuthentication {
    <#
    .SYNOPSIS
        Initializes authentication for M&A Discovery Suite operations
    .DESCRIPTION
        Handles authentication initialization with support for both Configuration hashtable
        and Context objects. Includes enhanced error handling and debug output.
    .PARAMETER Configuration
        Hashtable containing the suite configuration
    .PARAMETER Context
        Alternative parameter accepting a context object with embedded configuration
    .EXAMPLE
        Initialize-MandAAuthentication -Configuration $config
    .EXAMPLE
        Initialize-MandAAuthentication -Context $global:MandA
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false, ParameterSetName='Configuration')]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$false, ParameterSetName='Context')]
        [object]$Context
    )
    
    # Initialize result object
    $authResult = @{
        Authenticated = $false
        Context = $null
        Error = $null
        Timestamp = Get-Date
        Method = $null
    }
    
    try {
        Write-Verbose "[Initialize-MandAAuthentication] Starting authentication initialization..."
        Write-Verbose "[Initialize-MandAAuthentication] Parameter set: $($PSCmdlet.ParameterSetName)"
        
        # Determine configuration source
        $workingConfig = $null
        $configSource = ""
        
        if ($PSCmdlet.ParameterSetName -eq 'Configuration' -and $Configuration) {
            $workingConfig = $Configuration
            $configSource = "Configuration parameter"
            Write-Verbose "[Initialize-MandAAuthentication] Using configuration from: $configSource"
        }
        elseif ($PSCmdlet.ParameterSetName -eq 'Context' -and $Context) {
            # Handle different context object types
            if ($Context -is [hashtable] -and $Context.ContainsKey('Config')) {
                $workingConfig = $Context.Config
                $configSource = "Context.Config (hashtable)"
            }
            elseif ($Context.PSObject.Properties['Config']) {
                $workingConfig = $Context.Config
                $configSource = "Context.Config (PSCustomObject)"
            }
            elseif ($Context -is [hashtable]) {
                # Context itself might be the configuration
                $workingConfig = $Context
                $configSource = "Context as configuration"
            }
            else {
                throw "Context parameter provided but no Config property found"
            }
            Write-Verbose "[Initialize-MandAAuthentication] Using configuration from: $configSource"
        }
        else {
            # Fallback to global context
            if ($global:MandA -and $global:MandA.Config) {
                $workingConfig = $global:MandA.Config
                $configSource = "Global MandA context"
                Write-Verbose "[Initialize-MandAAuthentication] Using configuration from: $configSource"
            }
            else {
                throw "No configuration provided and global context not available"
            }
        }
        
        # Validate configuration
        if (-not $workingConfig) {
            throw "No valid configuration found from source: $configSource"
        }
        
        Write-Verbose "[Initialize-MandAAuthentication] Configuration type: $($workingConfig.GetType().FullName)"
        
        # Validate required configuration sections
        $requiredSections = @('authentication')
        foreach ($section in $requiredSections) {
            if (-not $workingConfig.$section) {
                throw "Required configuration section missing: $section"
            }
        }
        
        # Log authentication configuration (without sensitive data)
        Write-Verbose "[Initialize-MandAAuthentication] Authentication configuration:"
        Write-Verbose "  Method: $($workingConfig.authentication.authenticationMethod)"
        Write-Verbose "  UseServicePrincipal: $($workingConfig.authentication.useServicePrincipal)"
        Write-Verbose "  UseInteractiveAuth: $($workingConfig.authentication.useInteractiveAuth)"
        Write-Verbose "  TokenRefreshThreshold: $($workingConfig.authentication.tokenRefreshThreshold)"
        
        # Clear any existing authentication context
        if ($script:AuthContext) {
            Write-Verbose "[Initialize-MandAAuthentication] Clearing existing authentication context"
            $script:AuthContext = $null
        }
        
        # Initialize authentication timestamp
        $script:LastAuthAttempt = Get-Date
        
        # Get credentials
        Write-Verbose "[Initialize-MandAAuthentication] Retrieving credentials..."
        $credentials = Get-SecureCredentials -Configuration $workingConfig
        
        if (-not $credentials -or $credentials.Error) {
            $errorMsg = if ($credentials.Error) { $credentials.Error } else { "Unknown error in credential retrieval" }
            throw "Failed to retrieve credentials: $errorMsg"
        }
        
        Write-Verbose "[Initialize-MandAAuthentication] Credentials retrieved successfully"
        Write-Verbose "[Initialize-MandAAuthentication] Credential type: $($credentials.GetType().FullName)"
        
        # Validate credentials based on authentication method
        $authMethod = $workingConfig.authentication.authenticationMethod
        Write-Verbose "[Initialize-MandAAuthentication] Validating credentials for method: $authMethod"
        
        switch ($authMethod) {
            "ClientSecret" {
                $requiredProps = @('ClientId', 'ClientSecret', 'TenantId')
                $missingProps = @()
                
                foreach ($prop in $requiredProps) {
                    if (-not $credentials.$prop -or [string]::IsNullOrWhiteSpace($credentials.$prop)) {
                        $missingProps += $prop
                    }
                }
                
                if ($missingProps.Count -gt 0) {
                    throw "Missing required credential properties for ClientSecret authentication: $($missingProps -join ', ')"
                }
                
                Write-Verbose "[Initialize-MandAAuthentication] All required properties present for ClientSecret authentication"
                $authResult.Method = "ClientSecret"
            }
            
            "Certificate" {
                if (-not $credentials.ClientId -or -not $credentials.TenantId) {
                    throw "Certificate authentication requires ClientId and TenantId"
                }
                
                $certThumbprint = $workingConfig.authentication.certificateThumbprint
                if ([string]::IsNullOrWhiteSpace($certThumbprint)) {
                    throw "Certificate authentication requires certificateThumbprint in configuration"
                }
                
                Write-Verbose "[Initialize-MandAAuthentication] Certificate thumbprint: $certThumbprint"
                $authResult.Method = "Certificate"
            }
            
            "Interactive" {
                Write-Verbose "[Initialize-MandAAuthentication] Interactive authentication selected"
                $authResult.Method = "Interactive"
            }
            
            default {
                throw "Unsupported authentication method: $authMethod"
            }
        }
        
        # Additional validation
        Write-Verbose "[Initialize-MandAAuthentication] Performing additional credential validation..."
        $validationResult = Test-CredentialValidity -Credentials $credentials -Configuration $workingConfig
        
        if (-not $validationResult.IsValid) {
            throw "Credential validation failed: $($validationResult.Error)"
        }
        
        # Create authentication context
        Write-Verbose "[Initialize-MandAAuthentication] Creating authentication context..."
        $script:AuthContext = @{
            ClientId = $credentials.ClientId
            TenantId = $credentials.TenantId
            ClientSecret = $credentials.ClientSecret
            CertificateThumbprint = if ($authMethod -eq "Certificate") { $workingConfig.authentication.certificateThumbprint } else { $null }
            AuthenticationMethod = $authMethod
            TokenExpiry = (Get-Date).AddMinutes(60)  # Default 60 minutes, will be updated by actual token
            LastRefresh = Get-Date
            UseServicePrincipal = $workingConfig.authentication.useServicePrincipal
            UseInteractiveAuth = $workingConfig.authentication.useInteractiveAuth
            Configuration = $workingConfig
        }
        
        # Log success (without sensitive data)
        Write-Verbose "[Initialize-MandAAuthentication] Authentication context created successfully"
        Write-Verbose "[Initialize-MandAAuthentication] Context details:"
        Write-Verbose "  ClientId: $($script:AuthContext.ClientId.Substring(0, 8))..."
        Write-Verbose "  TenantId: $($script:AuthContext.TenantId)"
        Write-Verbose "  Method: $($script:AuthContext.AuthenticationMethod)"
        Write-Verbose "  UseServicePrincipal: $($script:AuthContext.UseServicePrincipal)"
        
        # Update result
        $authResult.Authenticated = $true
        $authResult.Context = $script:AuthContext
        $authResult.Method = $authMethod
        
        # Write success message
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "Authentication initialized successfully using $authMethod" -Level "SUCCESS" -Component "Authentication"
        } else {
            Write-Host "[SUCCESS] Authentication initialized successfully using $authMethod" -ForegroundColor Green
        }
        
    } catch {
        # Capture error details
        $errorDetails = @{
            Message = $_.Exception.Message
            Type = $_.Exception.GetType().FullName
            StackTrace = $_.ScriptStackTrace
            Timestamp = Get-Date
        }
        
        $authResult.Error = $errorDetails.Message
        
        # Log error
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "Authentication initialization failed: $($errorDetails.Message)" -Level "ERROR" -Component "Authentication"
        } else {
            Write-Host "[ERROR] Authentication initialization failed: $($errorDetails.Message)" -ForegroundColor Red
        }
        
        Write-Verbose "[Initialize-MandAAuthentication] Error details:"
        Write-Verbose "  Type: $($errorDetails.Type)"
        Write-Verbose "  Stack: $($errorDetails.StackTrace)"
        
        # Clear any partial context
        $script:AuthContext = $null
        $script:LastAuthAttempt = $null
    }
    
    # Return result
    return $authResult
}

# Helper function to test credential validity
function Test-CredentialValidity {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        $Credentials,
        
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    
    $result = @{
        IsValid = $true
        Error = $null
    }
    
    try {
        Write-Verbose "[Test-CredentialValidity] Starting credential validation..."
        
        # Basic property validation
        if (-not $Credentials) {
            throw "Credentials object is null"
        }
        
        # Check for ClientId (always required)
        if ([string]::IsNullOrWhiteSpace($Credentials.ClientId)) {
            throw "ClientId is missing or empty"
        }
        
        # Validate ClientId format (basic GUID check)
        try {
            $null = [System.Guid]::Parse($Credentials.ClientId)
            Write-Verbose "[Test-CredentialValidity] ClientId format valid"
        } catch {
            throw "ClientId is not a valid GUID format"
        }
        
        # Check for TenantId (always required)
        if ([string]::IsNullOrWhiteSpace($Credentials.TenantId)) {
            throw "TenantId is missing or empty"
        }
        
        # Validate TenantId format
        try {
            $null = [System.Guid]::Parse($Credentials.TenantId)
            Write-Verbose "[Test-CredentialValidity] TenantId format valid"
        } catch {
            # TenantId might be a domain name
            if ($Credentials.TenantId -notmatch '\.') {
                throw "TenantId is neither a valid GUID nor a domain name"
            }
            Write-Verbose "[Test-CredentialValidity] TenantId appears to be a domain name"
        }
        
        # Method-specific validation
        $authMethod = $Configuration.authentication.authenticationMethod
        
        switch ($authMethod) {
            "ClientSecret" {
                if ([string]::IsNullOrWhiteSpace($Credentials.ClientSecret)) {
                    throw "ClientSecret is required for ClientSecret authentication method"
                }
                Write-Verbose "[Test-CredentialValidity] ClientSecret present"
            }
            
            "Certificate" {
                $thumbprint = $Configuration.authentication.certificateThumbprint
                if ([string]::IsNullOrWhiteSpace($thumbprint)) {
                    throw "Certificate thumbprint not found in configuration"
                }
                
                # Try to find certificate
                $cert = Get-ChildItem -Path "Cert:\CurrentUser\My\$thumbprint" -ErrorAction SilentlyContinue
                if (-not $cert) {
                    $cert = Get-ChildItem -Path "Cert:\LocalMachine\My\$thumbprint" -ErrorAction SilentlyContinue
                }
                
                if (-not $cert) {
                    throw "Certificate with thumbprint $thumbprint not found in certificate store"
                }
                
                Write-Verbose "[Test-CredentialValidity] Certificate found: $($cert.Subject)"
            }
        }
        
        Write-Verbose "[Test-CredentialValidity] Credential validation passed"
        
    } catch {
        $result.IsValid = $false
        $result.Error = $_.Exception.Message
        Write-Verbose "[Test-CredentialValidity] Validation failed: $($_.Exception.Message)"
    }
    
    return $result
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
        Write-MandALog "Testing authentication status..." -Level "DEBUG" -Component "Authentication" -Context $Context
        if (-not $script:AuthContext) {
            Write-MandALog "No authentication context found. Re-initializing." -Level "WARN" -Component "Authentication" -Context $Context
            # Attempt to re-initialize. This could be a source of recursion if not handled well.
            # Consider if this function should simply report status rather than trigger re-auth.
            $initResult = Initialize-MandAAuthentication -Configuration $Configuration -Context $Context
            return ($initResult -and $initResult.Authenticated)
        }
        
        if ((Get-Date) -gt $script:AuthContext.TokenExpiry) {
            Write-MandALog "Authentication token expired. Refreshing..." -Level "WARN" -Component "Authentication" -Context $Context
            return Update-AuthenticationTokens -Configuration $Configuration -Context $Context
        }
        Write-MandALog "Authentication is valid." -Level "DEBUG" -Component "Authentication" -Context $Context
        return $true
    } catch {
        Write-MandALog "Failed to test authentication status: $($_.Exception.Message)" -Level "ERROR" -Component "Authentication" -Context $Context
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
        Write-MandALog "Refreshing authentication tokens..." -Level "INFO" -Component "Authentication" -Context $Context
        # This directly calls Initialize-MandAAuthentication again.
        # The recursion guards in Initialize-MandAAuthentication are critical here.
        $refreshResult = Initialize-MandAAuthentication -Configuration $Configuration -Context $Context
        
        if ($refreshResult -and $refreshResult.Authenticated) {
            Write-MandALog "Authentication tokens refreshed successfully." -Level "SUCCESS" -Component "Authentication" -Context $Context
            return $true
        } else {
            $errorMsg = $refreshResult.Error | Get-OrElse "Unknown error during token refresh"
            Write-MandALog "Token refresh failed: $errorMsg" -Level "ERROR" -Component "Authentication" -Context $Context
            return $false
        }
    } catch {
        Write-MandALog "Token refresh failed with exception: $($_.Exception.Message)" -Level "ERROR" -Component "Authentication" -Context $Context
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
            Write-MandALog "Returning stored auth context." -Level "DEBUG" -Component "Authentication" -Context $Context
            # Ensure the returned context is a clone or a safe subset if it's to be modified elsewhere
            return $script:AuthContext.Clone() 
        } else {
            Write-MandALog "No authentication context available to return." -Level "DEBUG" -Component "Authentication" -Context $Context
            return $null
        }
    } catch {
        Write-MandALog "Failed to get authentication context: $($_.Exception.Message)" -Level "ERROR" -Component "Authentication" -Context $Context
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
        Write-MandALog "Authentication context cleared." -Level "INFO" -Component "Authentication" -Context $Context
    } catch {
        Write-MandALog "Failed to clear authentication context: $($_.Exception.Message)" -Level "ERROR" -Component "Authentication" -Context $Context
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
        Write-MandALog "Failed to get authentication status: $($_.Exception.Message)" -Level "ERROR" -Component "Authentication" -Context $Context
        return @{ IsAuthenticated = $false; Error = $_.Exception.Message }
    }
}

Export-ModuleMember -Function Initialize-MandAAuthentication, Test-AuthenticationStatus, Update-AuthenticationTokens, Get-AuthenticationContext, Clear-AuthenticationContext, Get-AuthenticationStatus

Write-MandALog "[Authentication.psm1] Module loaded. Recursion guard initialized." -Level "DEBUG" -Component "Authentication"

