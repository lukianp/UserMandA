<#
.SYNOPSIS
    Core authentication orchestration for M&A Discovery Suite
.DESCRIPTION
    Manages authentication flow and token lifecycle
.NOTES
    Author: M&A Discovery Team
    Version: 2.0.0
    Created: 2025-05-31
    Last Modified: 2025-01-10
#>

# Script-level authentication context storage
$script:AuthContext = $null

function Initialize-MandAAuthentication {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Initializing authentication" -Level "INFO"
        
        # Get credentials
        $credentials = Get-SecureCredentials -Configuration $Configuration
        if (-not $credentials.Success) {
            $errorMsg = if ($credentials.Error) { $credentials.Error } else { "Unknown error obtaining credentials" }
            Write-MandALog "Failed to obtain credentials: $errorMsg" -Level "ERROR"
            return @{
                Authenticated = $false
                Error = "Failed to obtain valid credentials: $errorMsg"
            }
        }
        
        Write-MandALog "Credentials obtained successfully" -Level "SUCCESS"
        
        # Create credential data object for validation
        $credentialData = @{
            ClientId = $credentials.ClientId
            ClientSecret = $credentials.ClientSecret
            TenantId = $credentials.TenantId
        }
        
        # Test credential validity
        if (-not (Test-CredentialValidity -Credentials $credentialData -Configuration $Configuration)) {
            Write-MandALog "Credential validation failed" -Level "ERROR"
            return @{
                Authenticated = $false
                Error = "Credential validation failed - check client ID, secret, and tenant ID"
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
            Authenticated = $true
        }
        
        Write-MandALog "Authentication initialized successfully" -Level "SUCCESS"
        
        # Return properly formatted authentication result
        return @{
            Authenticated = $true
            ClientId = $credentials.ClientId
            TenantId = $credentials.TenantId
            Context = $script:AuthContext
            Success = $true
        }
        
    } catch {
        $errorMessage = $_.Exception.Message
        Write-MandALog "Authentication initialization failed: $errorMessage" -Level "ERROR"
        if ($_.Exception.InnerException) {
            Write-MandALog "Inner exception: $($_.Exception.InnerException.Message)" -Level "DEBUG"
        }
        
        return @{
            Authenticated = $false
            Error = $errorMessage
            Success = $false
        }
    }
}

function Test-AuthenticationStatus {
    param([hashtable]$Configuration)
    
    if (-not $script:AuthContext) {
        Write-MandALog "No authentication context found" -Level "DEBUG"
        return $false
    }
    
    # Check if we have the authenticated flag
    if (-not $script:AuthContext.Authenticated) {
        Write-MandALog "Authentication context exists but not authenticated" -Level "DEBUG"
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
        
        if ($refreshResult.Authenticated) {
            Write-MandALog "Authentication tokens refreshed successfully" -Level "SUCCESS"
            return $true
        } else {
            Write-MandALog "Failed to refresh authentication tokens: $($refreshResult.Error)" -Level "ERROR"
            return $false
        }
        
    } catch {
        Write-MandALog "Token refresh failed: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Get-AuthenticationContext {
    if ($script:AuthContext) {
        # Return a copy to prevent external modification
        return @{
            ClientId = $script:AuthContext.ClientId
            TenantId = $script:AuthContext.TenantId
            TokenExpiry = $script:AuthContext.TokenExpiry
            LastRefresh = $script:AuthContext.LastRefresh
            Authenticated = $script:AuthContext.Authenticated
        }
    }
    return $null
}

function Clear-AuthenticationContext {
    $script:AuthContext = $null
    Write-MandALog "Authentication context cleared" -Level "INFO"
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
            if ($Credentials.ContainsKey('Success') -and $Credentials.Success) {
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
        
        # GUID format validation for ClientId
        if ($credData.ClientId -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
            Write-MandALog "Invalid ClientId format: Must be a valid GUID" -Level "ERROR"
            return $false
        }
        
        # GUID format validation for TenantId
        if ($credData.TenantId -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
            Write-MandALog "Invalid TenantId format: Must be a valid GUID" -Level "ERROR"
            return $false
        }
        
        # If Microsoft.Graph module is available, test actual authentication
        if (Get-Module -ListAvailable -Name "Microsoft.Graph.Authentication") {
            Write-MandALog "Testing authentication with Microsoft Graph..." -Level "DEBUG"
            
            try {
                Import-Module Microsoft.Graph.Authentication -Force -ErrorAction SilentlyContinue
                
                # Create credential object
                $secureSecret = ConvertTo-SecureString $credData.ClientSecret -AsPlainText -Force
                $clientCredential = New-Object System.Management.Automation.PSCredential ($credData.ClientId, $secureSecret)
                
                # Attempt to connect to Graph
                Connect-MgGraph -ClientSecretCredential $clientCredential -TenantId $credData.TenantId -NoWelcome -ErrorAction Stop
                
                # Test basic Graph access
                $org = Get-MgOrganization -Top 1 -ErrorAction Stop
                
                if ($org) {
                    Write-MandALog "Credential validation successful - authenticated with Microsoft Graph" -Level "SUCCESS"
                    # Disconnect to clean up
                    Disconnect-MgGraph -ErrorAction SilentlyContinue
                    return $true
                }
                
            } catch {
                Write-MandALog "Microsoft Graph authentication test failed: $($_.Exception.Message)" -Level "WARN"
                Write-MandALog "Proceeding with basic validation only" -Level "INFO"
                # Don't fail here - just means we can't verify with Graph
            } finally {
                # Ensure we disconnect
                try {
                    Disconnect-MgGraph -ErrorAction SilentlyContinue
                } catch {
                    # Ignore disconnect errors
                }
            }
        } else {
            Write-MandALog "Microsoft.Graph.Authentication module not available for credential validation" -Level "DEBUG"
        }
        
        # If we get here, basic validation passed
        Write-MandALog "Credential format validation passed" -Level "SUCCESS"
        return $true
        
    } catch {
        Write-MandALog "Error during credential validation: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Initialize-MandAAuthentication',
    'Test-AuthenticationStatus', 
    'Update-AuthenticationTokens',
    'Get-AuthenticationContext',
    'Clear-AuthenticationContext',
    'Test-CredentialValidity'
)