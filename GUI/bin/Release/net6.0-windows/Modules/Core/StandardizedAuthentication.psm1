# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-08-03
# Last Modified: 2025-08-03

<#
.SYNOPSIS
    Standardized authentication patterns for M&A Discovery Suite
.DESCRIPTION
    Provides consistent authentication patterns and helper functions for all discovery modules.
    Ensures consistent credential loading, session management, and error handling.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-08-03
    Requires: PowerShell 5.1+, SessionManager, AuthenticationService
#>

# Import dependencies
Import-Module (Join-Path $PSScriptRoot "..\Authentication\SessionManager.psm1") -Force
Import-Module (Join-Path $PSScriptRoot "..\Authentication\AuthenticationService.psm1") -Force
Import-Module (Join-Path $PSScriptRoot "CredentialLoader.psm1") -Force

function Initialize-DiscoveryAuthentication {
    <#
    .SYNOPSIS
        Initializes authentication for a discovery module
    .DESCRIPTION
        Loads credentials from company profile and creates authenticated session
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$CompanyName,
        
        [Parameter(Mandatory=$false)]
        [string[]]$RequiredServices = @('Graph'),
        
        [Parameter(Mandatory=$false)]
        [hashtable]$Configuration
    )
    
    try {
        Write-Verbose "Initializing authentication for company: $CompanyName"
        
        # Load credentials from company profile (fallback to Configuration if provided)
        if ($Configuration -and $Configuration.TenantId -and $Configuration.ClientId -and $Configuration.ClientSecret) {
            Write-Verbose "Using provided configuration credentials"
            $credentials = @{
                TenantId = $Configuration.TenantId
                ClientId = $Configuration.ClientId
                ClientSecret = $Configuration.ClientSecret
            }
        } else {
            Write-Verbose "Loading credentials from company profile"
            $credentials = Get-CompanyCredentials -CompanyName $CompanyName
        }
        
        # Create authentication session
        $secureCredentials = ConvertTo-SecureCredentials -Credentials $credentials
        $sessionId = New-AuthenticationSession -TenantId $secureCredentials.TenantId -ClientId $secureCredentials.ClientId -ClientSecret $secureCredentials.ClientSecret
        
        # Initialize service connections
        $connections = @{}
        foreach ($service in $RequiredServices) {
            Write-Verbose "Initializing connection to service: $service"
            $authResult = Get-AuthenticationForService -Service $service -SessionId $sessionId
            if ($authResult) {
                $connections[$service] = $authResult
            } else {
                throw "Failed to authenticate to service: $service"
            }
        }
        
        return @{
            SessionId = $sessionId
            Connections = $connections
            Credentials = $credentials
            Success = $true
        }
    }
    catch {
        Write-Error "Failed to initialize authentication: $($_.Exception.Message)"
        return @{
            SessionId = $null
            Connections = @{}
            Credentials = $null
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

function Test-DiscoveryAuthentication {
    <#
    .SYNOPSIS
        Tests if discovery authentication is valid
    .DESCRIPTION
        Validates session status and connection health
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$SessionId,
        
        [Parameter(Mandatory=$false)]
        [hashtable]$Connections = @{}
    )
    
    try {
        # Test session validity
        $sessionStatus = Test-SessionExpiry -SessionId $SessionId
        
        if (-not $sessionStatus.Valid) {
            return @{
                Valid = $false
                Reason = $sessionStatus.Reason
                NeedsRenewal = $false
            }
        }
        
        # Test connections if provided
        foreach ($service in $Connections.Keys) {
            try {
                switch ($service) {
                    'Graph' {
                        # Test Graph connection with simple call
                        Invoke-MgGraphRequest -Uri "https://graph.microsoft.com/v1.0/me" -Method GET -ErrorAction Stop | Out-Null
                    }
                    'Azure' {
                        # Test Azure connection
                        Get-AzContext -ErrorAction Stop | Out-Null
                    }
                }
            }
            catch {
                return @{
                    Valid = $false
                    Reason = "Service $service connection failed: $($_.Exception.Message)"
                    NeedsRenewal = $true
                }
            }
        }
        
        return @{
            Valid = $true
            Reason = "Authentication is valid"
            NeedsRenewal = $sessionStatus.NeedsRenewal
            MinutesRemaining = $sessionStatus.MinutesRemaining
        }
    }
    catch {
        return @{
            Valid = $false
            Reason = "Authentication test failed: $($_.Exception.Message)"
            NeedsRenewal = $true
        }
    }
}

function Remove-DiscoveryAuthentication {
    <#
    .SYNOPSIS
        Cleans up discovery authentication
    .DESCRIPTION
        Properly disconnects services and removes session
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$SessionId,
        
        [Parameter(Mandatory=$false)]
        [hashtable]$Connections = @{}
    )
    
    try {
        Write-Verbose "Cleaning up authentication for session: $SessionId"
        
        # Disconnect from services
        foreach ($service in $Connections.Keys) {
            try {
                switch ($service) {
                    'Graph' {
                        Disconnect-MgGraph -ErrorAction SilentlyContinue
                    }
                    'Azure' {
                        Disconnect-AzAccount -ErrorAction SilentlyContinue
                    }
                }
                Write-Verbose "Disconnected from service: $service"
            }
            catch {
                Write-Warning "Failed to disconnect from service $service`: $($_.Exception.Message)"
            }
        }
        
        # Remove authentication session
        $removed = Remove-AuthenticationSession -SessionId $SessionId
        Write-Verbose "Authentication session removed: $removed"
        
        return $true
    }
    catch {
        Write-Warning "Failed to clean up authentication: $($_.Exception.Message)"
        return $false
    }
}

function New-StandardizedAuthenticationContext {
    <#
    .SYNOPSIS
        Creates a standardized authentication context for discovery modules
    .DESCRIPTION
        Combines authentication initialization with consistent error handling
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$true)]
        [string]$CompanyName,
        
        [Parameter(Mandatory=$false)]
        [string[]]$RequiredServices = @('Graph'),
        
        [Parameter(Mandatory=$false)]
        [hashtable]$Configuration = @{}
    )
    
    try {
        # Initialize authentication
        $authResult = Initialize-DiscoveryAuthentication -CompanyName $CompanyName -RequiredServices $RequiredServices -Configuration $Configuration
        
        if (-not $authResult.Success) {
            throw $authResult.Error
        }
        
        # Test authentication
        $authTest = Test-DiscoveryAuthentication -SessionId $authResult.SessionId -Connections $authResult.Connections
        
        if (-not $authTest.Valid) {
            throw $authTest.Reason
        }
        
        if ($authTest.NeedsRenewal) {
            Write-Warning "Authentication expires in $($authTest.MinutesRemaining) minutes"
        }
        
        # Return standardized context
        return @{
            Success = $true
            SessionId = $authResult.SessionId
            Connections = $authResult.Connections
            CompanyName = $CompanyName
            ModuleName = $ModuleName
            RequiredServices = $RequiredServices
            Error = $null
            CleanupFunction = {
                Remove-DiscoveryAuthentication -SessionId $authResult.SessionId -Connections $authResult.Connections
            }
        }
    }
    catch {
        return @{
            Success = $false
            SessionId = $null
            Connections = @{}
            CompanyName = $CompanyName
            ModuleName = $ModuleName
            RequiredServices = $RequiredServices
            Error = $_.Exception.Message
            CleanupFunction = { }
        }
    }
}

Export-ModuleMember -Function Initialize-DiscoveryAuthentication, Test-DiscoveryAuthentication, Remove-DiscoveryAuthentication, New-StandardizedAuthenticationContext

Write-Host "[StandardizedAuthentication.psm1] Standardized authentication module loaded" -ForegroundColor Green