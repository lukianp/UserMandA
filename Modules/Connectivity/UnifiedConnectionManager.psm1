# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Unified Connection Manager for M&A Discovery Suite - Certificate-Free Authentication
.DESCRIPTION
    Provides unified connection management for all Microsoft services using client secret authentication only.
    Eliminates certificate dependencies for Exchange Online, SharePoint Online, Teams, and Microsoft Graph.
.NOTES
    Author: M&A Discovery Team
    Version: 1.0.0
    Created: 2025-06-08
    Purpose: Certificate Elimination Implementation
#>

# Module-scope variables
$script:ConnectionStatus = @{
    Graph = @{ Connected = $false; LastError = $null; Context = $null }
    ExchangeOnline = @{ Connected = $false; LastError = $null; Context = $null }
    SharePointOnline = @{ Connected = $false; LastError = $null; Context = $null }
    Teams = @{ Connected = $false; LastError = $null; Context = $null }
}

$script:AuthContext = $null



function Invoke-SafeModuleExecution {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,
        
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    $result = @{
        Success = $false
        Data = $null
        Error = $null
        Duration = $null
    }
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        # Validate global context
        if (-not $global:MandA -or -not $global:MandA.Initialized) {
            throw "Global M&A context not initialized"
        }
        
        # Execute the module function
        $result.Data = & $ScriptBlock
        $result.Success = $true
        
    } catch {
        $result.Error = @{
            Message = $_.Exception.Message
            Type = $_.Exception.GetType().FullName
            StackTrace = $_.ScriptStackTrace
            InnerException = if ($_.Exception.InnerException) { $_.Exception.InnerException.Message } else { $null }
        }
        
        # Log to both file and console
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "[$ModuleName] Error: $($_.Exception.Message)" -Level "ERROR" -Component $ModuleName -Context $Context
        } else {
            Write-Host "[$ModuleName] Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Don't rethrow - let caller handle based on result
    } finally {
        $stopwatch.Stop()
        $result.Duration = $stopwatch.Elapsed
    }
    
    return $result
}


function Initialize-UnifiedAuthentication {
    <#
    .SYNOPSIS
        Initializes unified authentication context for all services
    .PARAMETER Configuration
        Configuration object containing authentication settings
    .PARAMETER Context
        Optional context object for logging
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    try {
        Write-MandALog "Initializing unified authentication context..." -Level "INFO" -Component "UnifiedConnection" -Context $Context
        
        # Get credentials using the existing credential management system
        $credentials = Get-SecureCredentials -Configuration $Configuration
        
        if (-not $credentials -or -not $credentials.Success) {
            throw "Failed to retrieve credentials: $($credentials.Error)"
        }
        
        # Create unified auth context
        $script:AuthContext = @{
            ClientId = $credentials.ClientId
            ClientSecret = $credentials.ClientSecret
            TenantId = $credentials.TenantId
            SecureClientSecret = ConvertTo-SecureString $credentials.ClientSecret -AsPlainText -Force
            Credential = New-Object System.Management.Automation.PSCredential($credentials.ClientId, (ConvertTo-SecureString $credentials.ClientSecret -AsPlainText -Force))
            LastRefresh = Get-Date
        }
        
        Write-MandALog "Unified authentication context initialized successfully" -Level "SUCCESS" -Component "UnifiedConnection" -Context $Context
        return $true
        
    } catch {
        Write-MandALog "Failed to initialize unified authentication: $($_.Exception.Message)" -Level "ERROR" -Component "UnifiedConnection" -Context $Context
        return $false
    }
}

function Connect-UnifiedMicrosoftGraph {
    <#
    .SYNOPSIS
        Connects to Microsoft Graph using client secret authentication
    .PARAMETER Context
        Optional context object for logging
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    try {
        Write-MandALog "Connecting to Microsoft Graph..." -Level "INFO" -Component "UnifiedConnection" -Context $Context
        
        if (-not $script:AuthContext) {
            throw "Authentication context not initialized. Call Initialize-UnifiedAuthentication first."
        }
        
        # Check if already connected
        $existingContext = Get-MgContext -ErrorAction SilentlyContinue
        if ($existingContext -and $existingContext.Account) {
            Write-MandALog "Using existing Microsoft Graph connection" -Level "SUCCESS" -Component "UnifiedConnection" -Context $Context
            $script:ConnectionStatus.Graph.Connected = $true
            $script:ConnectionStatus.Graph.Context = $existingContext
            return $true
        }
        
        # Connect using client secret
        $connectParams = @{
            ClientId = $script:AuthContext.ClientId
            TenantId = $script:AuthContext.TenantId
            ClientSecret = $script:AuthContext.SecureClientSecret
            NoWelcome = $true
        }
        
        Connect-MgGraph @connectParams -ErrorAction Stop
        
        # Verify connection
        $context = Get-MgContext -ErrorAction Stop
        if (-not $context -or -not $context.Account) {
            throw "Failed to establish valid Graph context"
        }
        
        $script:ConnectionStatus.Graph.Connected = $true
        $script:ConnectionStatus.Graph.Context = $context
        $script:ConnectionStatus.Graph.LastError = $null
        
        Write-MandALog "Successfully connected to Microsoft Graph" -Level "SUCCESS" -Component "UnifiedConnection" -Context $Context
        Write-MandALog "  Account: $($context.Account)" -Level "INFO" -Component "UnifiedConnection" -Context $Context
        Write-MandALog "  Tenant: $($context.TenantId)" -Level "INFO" -Component "UnifiedConnection" -Context $Context
        
        return $true
        
    } catch {
        $errorMessage = $_.Exception.Message
        $script:ConnectionStatus.Graph.Connected = $false
        $script:ConnectionStatus.Graph.LastError = $errorMessage
        Write-MandALog "Failed to connect to Microsoft Graph: $errorMessage" -Level "ERROR" -Component "UnifiedConnection" -Context $Context
        return $false
    }
}

function Connect-UnifiedExchangeOnline {
    <#
    .SYNOPSIS
        Connects to Exchange Online using client secret authentication
    .PARAMETER Context
        Optional context object for logging
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    try {
        Write-MandALog "Connecting to Exchange Online..." -Level "INFO" -Component "UnifiedConnection" -Context $Context
        
        if (-not $script:AuthContext) {
            throw "Authentication context not initialized. Call Initialize-UnifiedAuthentication first."
        }
        
        # Check if already connected
        $existingSession = Get-PSSession | Where-Object {
            $_.ConfigurationName -eq "Microsoft.Exchange" -and $_.State -eq "Opened"
        }
        
        if ($existingSession) {
            Write-MandALog "Using existing Exchange Online connection" -Level "SUCCESS" -Component "UnifiedConnection" -Context $Context
            $script:ConnectionStatus.ExchangeOnline.Connected = $true
            return $true
        }
        
        # Connect using client secret
        $connectParams = @{
            AppId = $script:AuthContext.ClientId
            ClientSecret = $script:AuthContext.SecureClientSecret
            Organization = $script:AuthContext.TenantId
            ShowBanner = $false
        }
        
        Connect-ExchangeOnline @connectParams -ErrorAction Stop
        
        # Verify connection by testing a simple command
        $testResult = Get-OrganizationConfig -ErrorAction Stop
        if (-not $testResult) {
            throw "Exchange Online connection test failed"
        }
        
        $script:ConnectionStatus.ExchangeOnline.Connected = $true
        $script:ConnectionStatus.ExchangeOnline.LastError = $null
        
        Write-MandALog "Successfully connected to Exchange Online" -Level "SUCCESS" -Component "UnifiedConnection" -Context $Context
        Write-MandALog "  Organization: $($testResult.DisplayName)" -Level "INFO" -Component "UnifiedConnection" -Context $Context
        
        return $true
        
    } catch {
        $errorMessage = $_.Exception.Message
        $script:ConnectionStatus.ExchangeOnline.Connected = $false
        $script:ConnectionStatus.ExchangeOnline.LastError = $errorMessage
        Write-MandALog "Failed to connect to Exchange Online: $errorMessage" -Level "ERROR" -Component "UnifiedConnection" -Context $Context
        return $false
    }
}

function Connect-UnifiedSharePointOnline {
    <#
    .SYNOPSIS
        Connects to SharePoint Online using client secret authentication
    .PARAMETER Configuration
        Configuration object containing SharePoint settings
    .PARAMETER Context
        Optional context object for logging
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    try {
        Write-MandALog "Connecting to SharePoint Online..." -Level "INFO" -Component "UnifiedConnection" -Context $Context
        
        if (-not $script:AuthContext) {
            throw "Authentication context not initialized. Call Initialize-UnifiedAuthentication first."
        }
        
        # Get tenant name from configuration or derive from tenant ID
        $tenantName = $Configuration.sharepoint.tenantName
        if (-not $tenantName) {
            # Try to derive from tenant ID or use a default approach
            $tenantName = $script:AuthContext.TenantId -replace '\.onmicrosoft\.com$', ''
        }
        
        $adminUrl = "https://$tenantName-admin.sharepoint.com"
        
        # Check if already connected
        try {
            $testSite = Get-SPOSite -Limit 1 -ErrorAction Stop
            if ($testSite) {
                Write-MandALog "Using existing SharePoint Online connection" -Level "SUCCESS" -Component "UnifiedConnection" -Context $Context
                $script:ConnectionStatus.SharePointOnline.Connected = $true
                return $true
            }
        } catch {
            # Not connected, proceed with connection
        }
        
        # Connect using client secret
        $connectParams = @{
            Url = $adminUrl
            ClientId = $script:AuthContext.ClientId
            ClientSecret = $script:AuthContext.ClientSecret
        }
        
        Connect-SPOService @connectParams -ErrorAction Stop
        
        # Verify connection
        $testSite = Get-SPOSite -Limit 1 -ErrorAction Stop
        if (-not $testSite) {
            throw "SharePoint Online connection test failed"
        }
        
        $script:ConnectionStatus.SharePointOnline.Connected = $true
        $script:ConnectionStatus.SharePointOnline.LastError = $null
        
        Write-MandALog "Successfully connected to SharePoint Online" -Level "SUCCESS" -Component "UnifiedConnection" -Context $Context
        Write-MandALog "  Admin URL: $adminUrl" -Level "INFO" -Component "UnifiedConnection" -Context $Context
        
        return $true
        
    } catch {
        $errorMessage = $_.Exception.Message
        $script:ConnectionStatus.SharePointOnline.Connected = $false
        $script:ConnectionStatus.SharePointOnline.LastError = $errorMessage
        Write-MandALog "Failed to connect to SharePoint Online: $errorMessage" -Level "ERROR" -Component "UnifiedConnection" -Context $Context
        return $false
    }
}

function Connect-UnifiedMicrosoftTeams {
    <#
    .SYNOPSIS
        Connects to Microsoft Teams using client secret authentication
    .PARAMETER Context
        Optional context object for logging
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    try {
        Write-MandALog "Connecting to Microsoft Teams..." -Level "INFO" -Component "UnifiedConnection" -Context $Context
        
        if (-not $script:AuthContext) {
            throw "Authentication context not initialized. Call Initialize-UnifiedAuthentication first."
        }
        
        # Check if already connected
        try {
            $testTeams = Get-Team -ErrorAction Stop | Select-Object -First 1
            if ($testTeams) {
                Write-MandALog "Using existing Microsoft Teams connection" -Level "SUCCESS" -Component "UnifiedConnection" -Context $Context
                $script:ConnectionStatus.Teams.Connected = $true
                return $true
            }
        } catch {
            # Not connected, proceed with connection
        }
        
        # Connect using client secret
        $connectParams = @{
            ApplicationId = $script:AuthContext.ClientId
            ClientSecret = $script:AuthContext.ClientSecret
            TenantId = $script:AuthContext.TenantId
        }
        
        Connect-MicrosoftTeams @connectParams -ErrorAction Stop
        
        # Verify connection
        $testTeams = Get-Team -ErrorAction Stop | Select-Object -First 1
        
        $script:ConnectionStatus.Teams.Connected = $true
        $script:ConnectionStatus.Teams.LastError = $null
        
        Write-MandALog "Successfully connected to Microsoft Teams" -Level "SUCCESS" -Component "UnifiedConnection" -Context $Context
        Write-MandALog "  Teams accessible: Yes" -Level "INFO" -Component "UnifiedConnection" -Context $Context
        
        return $true
        
    } catch {
        $errorMessage = $_.Exception.Message
        $script:ConnectionStatus.Teams.Connected = $false
        $script:ConnectionStatus.Teams.LastError = $errorMessage
        Write-MandALog "Failed to connect to Microsoft Teams: $errorMessage" -Level "ERROR" -Component "UnifiedConnection" -Context $Context
        return $false
    }
}

function Connect-AllUnifiedServices {
    <#
    .SYNOPSIS
        Connects to all Microsoft services using unified client secret authentication
    .PARAMETER Configuration
        Configuration object containing authentication and service settings
    .PARAMETER Context
        Optional context object for logging
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    try {
        Write-MandALog "Connecting to all Microsoft services using unified authentication..." -Level "HEADER" -Component "UnifiedConnection" -Context $Context
        
        # Initialize authentication context
        if (-not (Initialize-UnifiedAuthentication -Configuration $Configuration -Context $Context)) {
            throw "Failed to initialize unified authentication"
        }
        
        $connectionResults = @{
            Graph = $false
            ExchangeOnline = $false
            SharePointOnline = $false
            Teams = $false
        }
        
        # Connect to Microsoft Graph
        $connectionResults.Graph = Connect-UnifiedMicrosoftGraph -Context $Context
        
        # Connect to Exchange Online
        $connectionResults.ExchangeOnline = Connect-UnifiedExchangeOnline -Context $Context
        
        # Connect to SharePoint Online
        $connectionResults.SharePointOnline = Connect-UnifiedSharePointOnline -Configuration $Configuration -Context $Context
        
        # Connect to Microsoft Teams
        $connectionResults.Teams = Connect-UnifiedMicrosoftTeams -Context $Context
        
        # Summary
        $successCount = ($connectionResults.Values | Where-Object { $_ }).Count
        $totalCount = $connectionResults.Count
        
        Write-MandALog "Unified connection summary: $successCount/$totalCount services connected successfully" -Level "INFO" -Component "UnifiedConnection" -Context $Context
        
        foreach ($service in $connectionResults.GetEnumerator()) {
            $status = if ($service.Value) { "✅ Connected" } else { "❌ Failed" }
            Write-MandALog "  $($service.Key): $status" -Level $(if ($service.Value) { "SUCCESS" } else { "ERROR" }) -Component "UnifiedConnection" -Context $Context
        }
        
        return $connectionResults
        
    } catch {
        Write-MandALog "Failed to connect to unified services: $($_.Exception.Message)" -Level "ERROR" -Component "UnifiedConnection" -Context $Context
        return $false
    }
}

function Get-UnifiedConnectionStatus {
    <#
    .SYNOPSIS
        Returns the current connection status for all services
    #>
    [CmdletBinding()]
    param()
    
    return $script:ConnectionStatus
}

function Disconnect-AllUnifiedServices {
    <#
    .SYNOPSIS
        Disconnects from all Microsoft services
    .PARAMETER Context
        Optional context object for logging
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    try {
        Write-MandALog "Disconnecting from all Microsoft services..." -Level "INFO" -Component "UnifiedConnection" -Context $Context
        
        # Disconnect from Microsoft Graph
        if ($script:ConnectionStatus.Graph.Connected) {
            try {
                Disconnect-MgGraph -ErrorAction SilentlyContinue
                $script:ConnectionStatus.Graph.Connected = $false
                Write-MandALog "Disconnected from Microsoft Graph" -Level "SUCCESS" -Component "UnifiedConnection" -Context $Context
            } catch {
                Write-MandALog "Error disconnecting from Microsoft Graph: $($_.Exception.Message)" -Level "WARN" -Component "UnifiedConnection" -Context $Context
            }
        }
        
        # Disconnect from Exchange Online
        if ($script:ConnectionStatus.ExchangeOnline.Connected) {
            try {
                Disconnect-ExchangeOnline -Confirm:$false -ErrorAction SilentlyContinue
                $script:ConnectionStatus.ExchangeOnline.Connected = $false
                Write-MandALog "Disconnected from Exchange Online" -Level "SUCCESS" -Component "UnifiedConnection" -Context $Context
            } catch {
                Write-MandALog "Error disconnecting from Exchange Online: $($_.Exception.Message)" -Level "WARN" -Component "UnifiedConnection" -Context $Context
            }
        }
        
        # Disconnect from SharePoint Online
        if ($script:ConnectionStatus.SharePointOnline.Connected) {
            try {
                Disconnect-SPOService -ErrorAction SilentlyContinue
                $script:ConnectionStatus.SharePointOnline.Connected = $false
                Write-MandALog "Disconnected from SharePoint Online" -Level "SUCCESS" -Component "UnifiedConnection" -Context $Context
            } catch {
                Write-MandALog "Error disconnecting from SharePoint Online: $($_.Exception.Message)" -Level "WARN" -Component "UnifiedConnection" -Context $Context
            }
        }
        
        # Disconnect from Microsoft Teams
        if ($script:ConnectionStatus.Teams.Connected) {
            try {
                Disconnect-MicrosoftTeams -ErrorAction SilentlyContinue
                $script:ConnectionStatus.Teams.Connected = $false
                Write-MandALog "Disconnected from Microsoft Teams" -Level "SUCCESS" -Component "UnifiedConnection" -Context $Context
            } catch {
                Write-MandALog "Error disconnecting from Microsoft Teams: $($_.Exception.Message)" -Level "WARN" -Component "UnifiedConnection" -Context $Context
            }
        }
        
        # Clear authentication context
        $script:AuthContext = $null
        
        Write-MandALog "All services disconnected successfully" -Level "SUCCESS" -Component "UnifiedConnection" -Context $Context
        
    } catch {
        Write-MandALog "Error during unified disconnect: $($_.Exception.Message)" -Level "ERROR" -Component "UnifiedConnection" -Context $Context
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Initialize-UnifiedAuthentication',
    'Connect-UnifiedMicrosoftGraph',
    'Connect-UnifiedExchangeOnline', 
    'Connect-UnifiedSharePointOnline',
    'Connect-UnifiedMicrosoftTeams',
    'Connect-AllUnifiedServices',
    'Get-UnifiedConnectionStatus',
    'Disconnect-AllUnifiedServices'
)
