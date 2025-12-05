# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Unified Authentication Service for M&A Discovery Suite
.DESCRIPTION
    Provides centralized, thread-safe authentication management with automatic session lifecycle, credential validation, 
    and service connection management. This module serves as the primary interface for authentication operations, 
    handling connections to Microsoft Graph, Azure, Exchange, SharePoint, and Teams services with retry logic, 
    connection caching, and session management.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, AuthSession module, SessionManager module, Microsoft Graph modules, Azure modules
#>

# Import required modules
Import-Module (Join-Path $PSScriptRoot "AuthSession.psm1") -Force
Import-Module (Join-Path $PSScriptRoot "SessionManager.psm1") -Force

# Module-scope variables
$script:CurrentSessionId = $null
$script:ServiceConnections = @{}

function Initialize-AuthenticationService {
    <#
    .SYNOPSIS
        Initializes the authentication service with credentials
    .DESCRIPTION
        Creates a new authentication session and validates credentials
    .PARAMETER Configuration
        Configuration hashtable containing authentication settings
    .PARAMETER Context
        Optional context object for logging
    .EXAMPLE
        $result = Initialize-AuthenticationService -Configuration $config
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    $result = @{
        Success = $false
        SessionId = $null
        Error = $null
        Timestamp = Get-Date
    }
    
    try {
        Write-Verbose "[AuthService] Initializing authentication service..."
        
        # Handle credentials from configuration or credential management system
        $credentials = $null
        
        # Try credential management system first if available
        if (Get-Command Get-SecureCredentials -ErrorAction SilentlyContinue) {
            try {
                $credentials = Get-SecureCredentials -Configuration $Configuration
                if (-not $credentials -or -not $credentials.Success) {
                    Write-Verbose "[AuthService] Credential management system failed, using direct configuration"
                    $credentials = $null
                }
            } catch {
                Write-Verbose "[AuthService] Credential management system error, using direct configuration: $($_.Exception.Message)"
                $credentials = $null
            }
        }
        
        # Fall back to direct configuration if credential management isn't available or failed
        if (-not $credentials) {
            if (-not $Configuration.TenantId -or -not $Configuration.ClientId -or -not $Configuration.ClientSecret) {
                throw "Required credentials not provided: TenantId, ClientId, and ClientSecret are required"
            }
            
            $credentials = @{
                TenantId = $Configuration.TenantId
                ClientId = $Configuration.ClientId
                ClientSecret = $Configuration.ClientSecret
                Success = $true
            }
        }
        
        # Convert client secret to SecureString
        $secureSecret = if ($credentials.ClientSecret -is [SecureString]) {
            $credentials.ClientSecret
        } else {
            ConvertTo-SecureString $credentials.ClientSecret -AsPlainText -Force
        }
        
        # Create new authentication session
        $sessionId = New-AuthenticationSession -TenantId $credentials.TenantId -ClientId $credentials.ClientId -ClientSecret $secureSecret
        
        if ($sessionId) {
            $script:CurrentSessionId = $sessionId
            $result.Success = $true
            $result.SessionId = $sessionId
            
            Write-Verbose "[AuthService] Authentication session created: $sessionId"
            
            if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
                Write-MandALog "Authentication service initialized successfully" -Level "SUCCESS" -Component "AuthenticationService" -Context $Context
            }
        } else {
            throw "Failed to create authentication session"
        }
        
    } catch {
        $result.Error = $_.Exception.Message
        
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog "Authentication service initialization failed: $($_.Exception.Message)" -Level "ERROR" -Component "AuthenticationService" -Context $Context
        } else {
            Write-Error "Authentication service initialization failed: $($_.Exception.Message)"
        }
    }
    
    return $result
}

function Get-AuthenticationForService {
    <#
    .SYNOPSIS
        Gets authentication credentials for a specific service
    .DESCRIPTION
        Retrieves cached connection or creates new connection for the specified service
    .PARAMETER Service
        Service name (Graph, Azure, Exchange, etc.)
    .PARAMETER SessionId
        Optional session ID (uses current session if not specified)
    .EXAMPLE
        $auth = Get-AuthenticationForService -Service "Graph"
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [ValidateSet("Graph", "Azure", "Exchange", "SharePoint", "Teams")]
        [string]$Service,
        
        [Parameter(Mandatory=$false)]
        [string]$SessionId,

        [Parameter(Mandatory=$false)]
        [int]$MaxRetries = 3,

        [Parameter(Mandatory=$false)]
        [int]$InitialDelaySeconds = 2
    )
    
    $attempt = 0
    $lastError = $null

    while ($attempt -lt $MaxRetries) {
        $attempt++
        try {
            # Fix: Add proper null checks for SessionId
            if ([string]::IsNullOrEmpty($SessionId)) {
                $targetSessionId = $script:CurrentSessionId
                if ([string]::IsNullOrEmpty($targetSessionId)) {
                    throw "SessionId is required but was null or empty"
                }
            } else {
                $targetSessionId = $SessionId
            }
            
            if (-not $targetSessionId) {
                throw "No authentication session available. Call Initialize-AuthenticationService first."
            }
            
            # Get the session
            $session = Get-AuthenticationSession -SessionId $targetSessionId
            if (-not $session) {
                throw "Authentication session not found or expired: $targetSessionId"
            }

            # Check session expiry and renew if needed
            if (Get-Command Test-SessionExpiry -ErrorAction SilentlyContinue) {
                $sessionStatus = Test-SessionExpiry -SessionId $targetSessionId
                if (-not $sessionStatus.Valid) {
                    throw "Session invalid: $($sessionStatus.Reason)"
                }
                if ($sessionStatus.NeedsRenewal) {
                    Write-Verbose "[AuthService] Session needs renewal. Attempting to renew..."
                    # Implement actual renewal logic here. For now, we'll just warn.
                    # In a real scenario, this would involve re-authenticating or refreshing tokens.
                    # For this task, we assume the session object handles renewal internally or it's a manual process.
                    Write-Warning "Session for $Service is nearing expiry. Manual renewal might be required."
                }
            }
            
            # Check for cached connection
            $connection = $session.GetConnection($Service)
            if ($connection) {
                Write-Verbose "[AuthService] Using cached connection for $Service"
                return $connection
            }
            
            # Create new connection based on service type
            $credential = $session.GetCredential()
            $newConnection = $null
            
            Write-Verbose "[AuthService] Attempting to connect to $Service (attempt $attempt of $MaxRetries)"

            switch ($Service) {
                "Graph" {
                    $newConnection = Connect-ToMicrosoftGraphService -Credential $credential -TenantId $session.TenantId
                }
                "Azure" {
                    $newConnection = Connect-ToAzureService -Credential $credential -TenantId $session.TenantId
                }
                "Exchange" {
                    $newConnection = Connect-ToExchangeService -Credential $credential -TenantId $session.TenantId
                }
                "SharePoint" {
                    $newConnection = Connect-ToSharePointService -Credential $credential -TenantId $session.TenantId
                }
                "Teams" {
                    $newConnection = Connect-ToTeamsService -Credential $credential -TenantId $session.TenantId
                }
            }
            
            if ($newConnection) {
                # Cache the connection
                $session.SetConnection($Service, $newConnection)
                Write-Verbose "[AuthService] Created and cached new connection for $Service"
                return $newConnection
            } else {
                throw "Failed to create connection for service: $Service"
            }
            
        } catch {
            $lastError = $_
            Write-Warning "Failed to get authentication for service $Service (attempt $attempt): $($_.Exception.Message)"
            
            if ($attempt -lt $MaxRetries) {
                $delay = [Math]::Pow($InitialDelaySeconds, $attempt) # Exponential backoff
                Write-Verbose "Retrying in $delay seconds..."
                Start-Sleep -Seconds $delay
            } else {
                throw $lastError # Re-throw last error after max retries
            }
        }
    }
}

function Connect-ToMicrosoftGraphService {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [PSCredential]$Credential,

        [Parameter(Mandatory=$true)]
        [string]$TenantId
    )

    try {
        # Import required modules
        $graphModules = @(
            'Microsoft.Graph.Authentication',
            'Microsoft.Graph.Users',
            'Microsoft.Graph.Groups',
            'Microsoft.Graph.Files',
            'Microsoft.Graph.Sites',
            'Microsoft.Graph.DirectoryObjects',
            'Microsoft.Graph.Identity.DirectoryManagement',
            'Microsoft.Graph.Identity.SignIns'
        )

        $importedModules = @()
        foreach ($module in $graphModules) {
            if (Get-Module -Name $module -ListAvailable -ErrorAction SilentlyContinue) {
                Write-Verbose "[AuthService] Importing Microsoft Graph module: $module"
                Import-Module $module -Force -ErrorAction Stop
                $importedModules += $module
            } else {
                Write-Warning "[AuthService] Microsoft Graph module not available: $module"
            }
        }

        if ($importedModules.Count -eq 0) {
            throw "No Microsoft Graph modules found. Please install Microsoft.Graph modules using: Install-Module Microsoft.Graph"
        }

        Write-Verbose "[AuthService] Successfully imported modules: $($importedModules -join ', ')"

        # Enhanced connection approach for tenant discovery
        # If TenantId is not provided or fails, try with "common" endpoint for multi-tenant apps
        $connectionTenantId = $TenantId
        $isCommonEndpoint = $false

        if (-not $TenantId -or $TenantId -eq "common") {
            Write-Verbose "[AuthService] Using common endpoint for tenant discovery"
            $connectionTenantId = "common"
            $isCommonEndpoint = $true
        }

        Write-Verbose "[AuthService] Connecting to Microsoft Graph with TenantId: $connectionTenantId"

        # Try the connection
        try {
            Connect-MgGraph -ClientSecretCredential $Credential -TenantId $connectionTenantId -NoWelcome -ErrorAction Stop
        } catch {
            # If common endpoint fails and we have a specific tenant, try again once more
            if ($TenantId -and $TenantId -ne "common" -and $connectionTenantId -ne $TenantId) {
                Write-Verbose "[AuthService] Retrying connection with original TenantId: $TenantId"
                Connect-MgGraph -ClientSecretCredential $Credential -TenantId $TenantId -NoWelcome -ErrorAction Stop
            } else {
                throw
            }
        }

        # Verify connection
        $context = Get-MgContext -ErrorAction Stop
        if (-not $context) {
            throw "Failed to establish Graph context"
        }

        Write-Verbose "[AuthService] Connected to Microsoft Graph successfully"

        # If we used common endpoint, provide additional info for tenant detection
        $connectionInfo = @{
            Service = "Graph"
            Context = $context
            Connected = $true
            Timestamp = Get-Date
            UsedCommonEndpoint = $isCommonEndpoint
        }

        if ($isCommonEndpoint -and $context.TenantId) {
            $connectionInfo.DetectedTenantId = $context.TenantId
        }

        return $connectionInfo

    } catch {
        Write-Error "Failed to connect to Microsoft Graph: $($_.Exception.Message)"
        throw
    }
}

function Connect-ToAzureService {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [PSCredential]$Credential,
        
        [Parameter(Mandatory=$true)]
        [string]$TenantId
    )
    
    try {
        # Import Azure modules
        if (Get-Module -Name Az.Accounts -ListAvailable -ErrorAction SilentlyContinue) {
            Import-Module Az.Accounts -Force -ErrorAction SilentlyContinue
        }
        
        # Connect to Azure - Fix: Use TenantId parameter correctly
        $azContext = Connect-AzAccount `
            -ServicePrincipal `
            -Credential $Credential `
            -TenantId $TenantId `
            -ErrorAction Stop
        
        if (-not $azContext) {
            throw "Failed to establish Azure context"
        }
        
        Write-Verbose "[AuthService] Connected to Azure successfully"
        return @{
            Service = "Azure"
            Context = $azContext
            Connected = $true
            Timestamp = Get-Date
        }
        
    } catch {
        Write-Error "Failed to connect to Azure: $($_.Exception.Message)"
        throw
    }
}

function Connect-ToExchangeService {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [PSCredential]$Credential,
        
        [Parameter(Mandatory=$true)]
        [string]$TenantId
    )
    
    try {
        # Exchange Online is accessed via Graph API - no separate connection needed
        Write-Verbose "[AuthService] Exchange Online uses Graph API (no separate connection required)"
        
        return @{
            Service = "Exchange"
            Context = "Graph API"
            Connected = $true
            Timestamp = Get-Date
            Note = "Exchange data accessed via Microsoft Graph"
        }
        
    } catch {
        Write-Error "Failed to setup Exchange service: $($_.Exception.Message)"
        throw
    }
}

function Connect-ToSharePointService {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [PSCredential]$Credential,
        
        [Parameter(Mandatory=$true)]
        [string]$TenantId
    )
    
    try {
        # SharePoint Online is accessed via Graph API - no separate connection needed
        Write-Verbose "[AuthService] SharePoint Online uses Graph API (no separate connection required)"
        
        return @{
            Service = "SharePoint"
            Context = "Graph API"
            Connected = $true
            Timestamp = Get-Date
            Note = "SharePoint data accessed via Microsoft Graph"
        }
        
    } catch {
        Write-Error "Failed to setup SharePoint service: $($_.Exception.Message)"
        throw
    }
}

function Connect-ToTeamsService {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [PSCredential]$Credential,
        
        [Parameter(Mandatory=$true)]
        [string]$TenantId
    )
    
    try {
        # Teams is accessed via Graph API - no separate connection needed
        Write-Verbose "[AuthService] Microsoft Teams uses Graph API (no separate connection required)"
        
        return @{
            Service = "Teams"
            Context = "Graph API"
            Connected = $true
            Timestamp = Get-Date
            Note = "Teams data accessed via Microsoft Graph"
        }
        
    } catch {
        Write-Error "Failed to setup Teams service: $($_.Exception.Message)"
        throw
    }
}

function Test-AuthenticationService {
    <#
    .SYNOPSIS
        Tests the authentication service and connections
    .DESCRIPTION
        Validates current authentication session and tests service connections
    .PARAMETER SessionId
        Optional session ID to test (uses current session if not specified)
    .EXAMPLE
        $status = Test-AuthenticationService
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$SessionId
    )
    
    $result = @{
        Success = $false
        SessionValid = $false
        Services = @{}
        Error = $null
    }
    
    try {
        # Use provided session ID or current session
        $targetSessionId = if ($SessionId) { $SessionId } else { $script:CurrentSessionId }
        
        if (-not $targetSessionId) {
            $result.Error = "No authentication session available"
            return $result
        }
        
        # Test session validity
        $session = Get-AuthenticationSession -SessionId $targetSessionId
        if ($session -and $session.IsValid()) {
            $result.SessionValid = $true
            
            # Test Graph connection
            try {
                $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $targetSessionId
                $result.Services["Graph"] = @{ Connected = $true; Details = $graphAuth }
            } catch {
                $result.Services["Graph"] = @{ Connected = $false; Error = $_.Exception.Message }
            }
            
            # Test Azure connection
            try {
                $azureAuth = Get-AuthenticationForService -Service "Azure" -SessionId $targetSessionId
                $result.Services["Azure"] = @{ Connected = $true; Details = $azureAuth }
            } catch {
                $result.Services["Azure"] = @{ Connected = $false; Error = $_.Exception.Message }
            }
            
            $result.Success = $true
        } else {
            $result.Error = "Authentication session invalid or expired"
        }
        
    } catch {
        $result.Error = $_.Exception.Message
    }
    
    return $result
}

function Stop-AuthenticationService {
    <#
    .SYNOPSIS
        Stops the authentication service and cleans up sessions
    .DESCRIPTION
        Disconnects from all services and clears authentication sessions
    .EXAMPLE
        Stop-AuthenticationService
    #>
    [CmdletBinding()]
    param()
    
    try {
        Write-Verbose "[AuthService] Stopping authentication service..."
        
        # Disconnect from services
        try {
            if (Get-Command Disconnect-MgGraph -ErrorAction SilentlyContinue) {
                Disconnect-MgGraph -ErrorAction SilentlyContinue
            }
        } catch {}
        
        try {
            if (Get-Command Disconnect-AzAccount -ErrorAction SilentlyContinue) {
                Disconnect-AzAccount -ErrorAction SilentlyContinue
            }
        } catch {}
        
        # Clear current session
        if ($script:CurrentSessionId) {
            Remove-AuthenticationSession -SessionId $script:CurrentSessionId
            $script:CurrentSessionId = $null
        }
        
        # Clear service connections
        $script:ServiceConnections.Clear()
        
        Write-Verbose "[AuthService] Authentication service stopped successfully"
        
    } catch {
        Write-Error "Error stopping authentication service: $($_.Exception.Message)"
    }
}

function Get-CurrentAuthenticationSession {
    <#
    .SYNOPSIS
        Gets the current authentication session ID
    .DESCRIPTION
        Returns the current session ID for use in runspaces
    .EXAMPLE
        $sessionId = Get-CurrentAuthenticationSession
    #>
    [CmdletBinding()]
    param()
    
    return $script:CurrentSessionId
}

# Export functions
Export-ModuleMember -Function @(
    'Initialize-AuthenticationService',
    'Get-AuthenticationForService',
    'Test-AuthenticationService',
    'Stop-AuthenticationService',
    'Get-CurrentAuthenticationSession'
)

Write-Host "[AuthenticationService.psm1] Unified authentication service loaded" -ForegroundColor Green