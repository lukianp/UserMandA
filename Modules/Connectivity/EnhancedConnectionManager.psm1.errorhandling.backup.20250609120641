# -*- coding: utf-8-bom -*-

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-05
# Last Modified: 2025-06-06
# Change Log: Updated version control header


# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-05
# Last Modified: 2025-06-06
# Change Log: Initial version - any future changes require version increment

#
# EnhancedConnectionManager.psm1
# Enhanced connection manager with robust authentication fallbacks and extensive debugging
#

# Global connection status tracking


# Fix-ConnectionManager.ps1


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


$modulePath = ".\Modules\Connectivity\EnhancedConnectionManager.psm1"


# Module initialization - no global dependency at load time
$script:ConnectionStatus = @{
    Graph = @{ Connected = $false; LastError = $null; ConnectedTime = $null; Context = $null; Method = $null }
    Azure = @{ Connected = $false; LastError = $null; ConnectedTime = $null; Context = $null; Method = $null }
    ExchangeOnline = @{ Connected = $false; LastError = $null; ConnectedTime = $null; Context = $null; Method = $null }
    ActiveDirectory = @{ Connected = $false; LastError = $null; ConnectedTime = $null; Context = $null; Method = $null }
}


function Initialize-MandAAuthentication {
    param(
        [Parameter(Mandatory=$false)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        $Context
    )
    # Handle both parameter types
}
# Helper functions for progress display
function Write-ProgressHeader {
    param([string]$Title)
    Write-Host ""
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
}

function Write-ProgressStep {
    param(
        [string]$Message,
        [string]$Status = "Info"
    )
    
    $color = switch ($Status) {
        "Progress" { "Yellow" }
        "Success" { "Green" }
        "Warning" { "Yellow" }
        "Error" { "Red" }
        default { "White" }
    }
    
    Write-Host "  $Message" -ForegroundColor $color
}

function Show-ConnectionStatus {
    param(
        [string]$Service,
        [string]$Status,
        [string]$Details = ""
    )
    
    $statusColor = switch ($Status) {
        "Connecting" { "Yellow" }
        "Connected" { "Green" }
        "Failed" { "Red" }
        "Skipped" { "Gray" }
        default { "White" }
    }
    
    $statusIcon = switch ($Status) {
        "Connecting" { "[...]" }
        "Connected" { "[OK]" }
        "Failed" { "[X]" }
        "Skipped" { "??" }
        default { "[i]?" }
    }
    
    $message = "  $statusIcon $Service : $Status"
    if ($Details) {
        $message += " - $Details"
    }
    
    Write-Host $message -ForegroundColor $statusColor
}

function Initialize-AllConnections {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$true)]
        $AuthContext,
        
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    Write-ProgressHeader -Title "SERVICE CONNECTION INITIALIZATION"
    
    $services = @(
        @{Name = 'Microsoft Graph'; Function = 'Connect-ToMicrosoftGraph'},
        @{Name = 'Exchange Online'; Function = 'Connect-ToExchangeOnline'},
        @{Name = 'SharePoint Online'; Function = 'Connect-ToSharePointOnline'},
        @{Name = 'Teams'; Function = 'Connect-ToTeams'},
        @{Name = 'Azure'; Function = 'Connect-ToAzure'}
    )
    
    $connectionResults = @{}
    $totalServices = $services.Count
    $currentService = 0
    
    foreach ($service in $services) {
        $currentService++
        $serviceName = $service.Name
        
        # Show progress
        Write-ProgressStep "Connecting to $serviceName [$currentService/$totalServices]" -Status Progress
        
        try {
            # Animated waiting indicator
            $connectStart = Get-Date
            
            # Attempt connection
            if (Get-Command $service.Function -ErrorAction SilentlyContinue) {
                Show-ConnectionStatus -Service $serviceName -Status "Connecting" -Details "Authenticating..."
                
                $result = & $service.Function -Configuration $Configuration -AuthContext $AuthContext
                
                $connectDuration = ((Get-Date) - $connectStart).TotalSeconds
                
                if ($result) {
                    Show-ConnectionStatus -Service $serviceName -Status "Connected" `
                        -Details "Completed in $([Math]::Round($connectDuration, 1))s"
                    $connectionResults[$serviceName] = @{Connected = $true; Duration = $connectDuration}
                } else {
                    Show-ConnectionStatus -Service $serviceName -Status "Failed" -Details "Connection refused"
                    $connectionResults[$serviceName] = @{Connected = $false; Error = "Connection refused"}
                }
            } else {
                Show-ConnectionStatus -Service $serviceName -Status "Skipped" -Details "Module not available"
                $connectionResults[$serviceName] = @{Connected = $false; Error = "Module not available"}
            }
            
        } catch {
            Show-ConnectionStatus -Service $serviceName -Status "Failed" -Details $_.Exception.Message
            $connectionResults[$serviceName] = @{Connected = $false; Error = $_.Exception.Message}
        }
        
        # Small delay for visual effect
        Start-Sleep -Milliseconds 100
    }
    
    # Summary
    Write-Host ""
    $connected = ($connectionResults.Values | Where-Object { $_.Connected }).Count
    $failed = $totalServices - $connected
    
    Write-ProgressStep "Connection Summary: $connected connected, $failed failed" `
        -Status $(if ($failed -eq 0) { 'Success' } else { 'Warning' })
    
    return $connectionResults
}

# Individual connection functions called by Initialize-AllConnections
function Connect-ToMicrosoftGraph {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$true)]
        $AuthContext
    )
    
    return Connect-MandAGraphEnhanced -AuthContext $AuthContext -Configuration $Configuration
}

function Connect-ToExchangeOnline {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$true)]
        $AuthContext
    )
    
    # Exchange data is now accessed via Graph API - no separate connection needed
    # Just verify Graph connection is working
    try {
        Write-MandALog "Exchange Online: Using Graph API (no separate connection required)" -Level "SUCCESS"
        
        # Test Graph connection for Exchange data
        if (Get-Command Get-MgUser -ErrorAction SilentlyContinue) {
            $testUser = Get-MgUser -Top 1 -ErrorAction Stop
            Write-MandALog "[OK] Graph API available for Exchange data" -Level "SUCCESS"
            return $true
        } else {
            Write-MandALog "ERROR: Graph API not available for Exchange data" -Level "ERROR"
            return $false
        }
    } catch {
        Write-MandALog "ERROR: Graph API test failed for Exchange: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Connect-ToSharePointOnline {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$true)]
        $AuthContext
    )
    
    # SharePoint data is now accessed via Graph API - no separate connection needed
    # Just verify Graph connection is working for SharePoint endpoints
    try {
        Write-MandALog "SharePoint Online: Using Graph API (no separate connection required)" -Level "SUCCESS"
        
        # Test Graph connection for SharePoint data
        if (Get-Command Get-MgSite -ErrorAction SilentlyContinue) {
            # Test with root site
            $rootSite = Get-MgSite -SiteId "root" -ErrorAction Stop
            Write-MandALog "[OK] Graph API available for SharePoint data" -Level "SUCCESS"
            Write-MandALog "  - Root site: $($rootSite.DisplayName)" -Level "INFO"
            return $true
        } else {
            Write-MandALog "ERROR: Graph API not available for SharePoint data" -Level "ERROR"
            return $false
        }
    } catch {
        Write-MandALog "ERROR: Graph API test failed for SharePoint: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Connect-ToTeams {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$true)]
        $AuthContext
    )
    
    # Teams data is now accessed via Graph API - no separate connection needed
    # Just verify Graph connection is working for Teams endpoints
    try {
        Write-MandALog "Microsoft Teams: Using Graph API (no separate connection required)" -Level "SUCCESS"
        
        # Test Graph connection for Teams data
        if (Get-Command Get-MgGroup -ErrorAction SilentlyContinue) {
            # Test with groups that have Teams enabled
            $teamsGroups = Get-MgGroup -Filter "resourceProvisioningOptions/Any(x:x eq 'Team')" -Top 1 -ErrorAction Stop
            Write-MandALog "[OK] Graph API available for Teams data" -Level "SUCCESS"
            if ($teamsGroups) {
                Write-MandALog "  - Found Teams-enabled groups" -Level "INFO"
            }
            return $true
        } else {
            Write-MandALog "ERROR: Graph API not available for Teams data" -Level "ERROR"
            return $false
        }
    } catch {
        Write-MandALog "ERROR: Graph API test failed for Teams: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Connect-ToAzure {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$true)]
        $AuthContext
    )
    
    return Connect-MandAAzureEnhanced -AuthContext $AuthContext -Configuration $Configuration
}

function Connect-MandAGraphEnhanced {
    param(
        [hashtable]$AuthContext,
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "Starting Microsoft Graph connection process..." -Level "PROGRESS"
        
        # Debug logging
        Write-MandALog "DEBUG: Connect-MandAGraphEnhanced called with:" -Level "DEBUG"
        Write-MandALog "  - AuthContext type: $($AuthContext.GetType().Name)" -Level "DEBUG"
        Write-MandALog "  - AuthContext keys: $($AuthContext.Keys -join ', ')" -Level "DEBUG"
        Write-MandALog "  - ClientId present: $($null -ne $AuthContext.ClientId)" -Level "DEBUG"
        Write-MandALog "  - TenantId present: $($null -ne $AuthContext.TenantId)" -Level "DEBUG"
        Write-MandALog "  - ClientSecret present: $($null -ne $AuthContext.ClientSecret)" -Level "DEBUG"
        
        # Validate auth context
        if (-not $AuthContext -or -not $AuthContext.ClientId -or -not $AuthContext.TenantId -or -not $AuthContext.ClientSecret) {
            Write-MandALog "ERROR: Invalid or incomplete authentication context for Graph" -Level "ERROR"
            $script:ConnectionStatus.Graph.LastError = "Missing required authentication properties"
            return $false
        }
        
        Write-MandALog "DEBUG: Loading Microsoft Graph modules..." -Level "DEBUG"
        
        # Import required modules
        $modulesToImport = @(
            'Microsoft.Graph.Authentication',
            'Microsoft.Graph.Users',
            'Microsoft.Graph.Groups'
        )
        
        foreach ($module in $modulesToImport) {
            try {
                Import-Module $module -Force -ErrorAction Stop
                Write-MandALog "  - Loaded: $module" -Level "DEBUG"
            } catch {
                Write-MandALog "  - WARNING: Could not load $module : $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        $maxRetries = $Configuration.environment.maxRetries
        $retryDelay = 5
        
        for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
            try {
                Write-MandALog "Graph connection attempt $attempt of $maxRetries..." -Level "PROGRESS"
                
                # Check for existing valid connection
                Write-MandALog "DEBUG: Checking for existing Graph connection..." -Level "DEBUG"
                $existingContext = $null
                try {
                    $existingContext = Get-MgContext -ErrorAction SilentlyContinue
                } catch {
                    Write-MandALog "DEBUG: No existing context found" -Level "DEBUG"
                }
                
                if ($existingContext -and $existingContext.ClientId -eq $AuthContext.ClientId) {
                    Write-MandALog "DEBUG: Found existing context with matching ClientId" -Level "DEBUG"
                    try {
                        # Test the connection
                        $org = Get-MgOrganization -Top 1 -ErrorAction Stop
                        Write-MandALog "[OK] Using existing valid Graph connection" -Level "SUCCESS"
                        $script:ConnectionStatus.Graph.Connected = $true
                        $script:ConnectionStatus.Graph.Context = $existingContext
                        $script:ConnectionStatus.Graph.ConnectedTime = Get-Date
                        $script:ConnectionStatus.Graph.Method = "Existing Session"
                        $script:ConnectionStatus.Graph.LastError = $null
                        
                        Write-MandALog "  - Organization: $($org.DisplayName)" -Level "INFO"
                        Write-MandALog "  - Tenant ID: $($existingContext.TenantId)" -Level "INFO"
                        
                        return $true
                    } catch {
                        Write-MandALog "DEBUG: Existing connection is invalid, will reconnect..." -Level "WARN"
                        Write-MandALog "  - Error: $($_.Exception.Message)" -Level "DEBUG"
                        try {
                            Disconnect-MgGraph -ErrorAction SilentlyContinue
                        } catch {
                            Write-MandALog "DEBUG: Error disconnecting: $($_.Exception.Message)" -Level "DEBUG"
                        }
                    }
                }
                
                # Connect with client secret
                Write-MandALog "DEBUG: Attempting client secret authentication..." -Level "INFO"
                Write-MandALog "  - ClientId: $($AuthContext.ClientId)" -Level "DEBUG"
                Write-MandALog "  - TenantId: $($AuthContext.TenantId)" -Level "DEBUG"
                
                # Create secure credential
                $secureSecret = ConvertTo-SecureString $AuthContext.ClientSecret -AsPlainText -Force
                $clientCredential = New-Object System.Management.Automation.PSCredential ($AuthContext.ClientId, $secureSecret)
                
                Write-MandALog "DEBUG: Calling Connect-MgGraph..." -Level "DEBUG"
                Connect-MgGraph -ClientSecretCredential $clientCredential -TenantId $AuthContext.TenantId -NoWelcome -ErrorAction Stop
                
                Write-MandALog "DEBUG: Connect-MgGraph completed, verifying connection..." -Level "DEBUG"
                
                # Verify connection
                $context = Get-MgContext -ErrorAction Stop
                if (-not $context) {
                    throw "Failed to establish Graph context after connection"
                }
                
                Write-MandALog "DEBUG: Got context, testing with Get-MgOrganization..." -Level "DEBUG"
                
                # Test functionality
                $org = Get-MgOrganization -Top 1 -ErrorAction Stop
                
                Write-MandALog "[OK] Successfully connected to Microsoft Graph" -Level "SUCCESS"
                Write-MandALog "  - Organization: $($org.DisplayName)" -Level "INFO"
                Write-MandALog "  - Tenant ID: $($context.TenantId)" -Level "INFO"
                Write-MandALog "  - Client App ID: $($context.ClientId)" -Level "INFO"
                Write-MandALog "  - Scopes: $($context.Scopes -join ', ')" -Level "DEBUG"
                
                $script:ConnectionStatus.Graph.Connected = $true
                $script:ConnectionStatus.Graph.Context = $context
                $script:ConnectionStatus.Graph.LastError = $null
                $script:ConnectionStatus.Graph.ConnectedTime = Get-Date
                $script:ConnectionStatus.Graph.Method = "Client Secret"
                
                return $true
                
            } catch {
                $errorMessage = $_.Exception.Message
                Write-MandALog "ERROR: Graph connection attempt $attempt failed: $errorMessage" -Level "ERROR"
                Write-MandALog "DEBUG: Full error: $($_.Exception.ToString())" -Level "DEBUG"
                Write-MandALog "DEBUG: Stack trace: $($_.ScriptStackTrace)" -Level "DEBUG"
                
                $script:ConnectionStatus.Graph.LastError = $errorMessage
                
                if ($attempt -lt $maxRetries) {
                    Write-MandALog "Retrying in $retryDelay seconds..." -Level "INFO"
                    Start-Sleep -Seconds $retryDelay
                    $retryDelay += 2
                }
            }
        }
        
        Write-MandALog "ERROR: Failed to establish Graph connection after $maxRetries attempts" -Level "ERROR"
        $script:ConnectionStatus.Graph.Connected = $false
        return $false
        
    } catch {
        Write-MandALog "CRITICAL ERROR in Connect-MandAGraphEnhanced: $($_.Exception.Message)" -Level "ERROR"
        Write-MandALog "Stack Trace: $($_.ScriptStackTrace)" -Level "DEBUG"
        $script:ConnectionStatus.Graph.Connected = $false
        $script:ConnectionStatus.Graph.LastError = $_.Exception.Message
        return $false
    }
}

function Connect-MandAAzureEnhanced {
    param(
        [hashtable]$AuthContext,
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "Starting Azure connection process..." -Level "PROGRESS"
        
        # Debug logging
        Write-MandALog "DEBUG: Connect-MandAAzureEnhanced called with:" -Level "DEBUG"
        Write-MandALog "  - AuthContext present: $($null -ne $AuthContext)" -Level "DEBUG"
        Write-MandALog "  - ClientId: $(if($AuthContext.ClientId){$AuthContext.ClientId}else{'NULL'})" -Level "DEBUG"
        Write-MandALog "  - TenantId: $(if($AuthContext.TenantId){$AuthContext.TenantId}else{'NULL'})" -Level "DEBUG"
        
        # Validate auth context
        if (-not $AuthContext -or -not $AuthContext.ClientId -or -not $AuthContext.TenantId -or -not $AuthContext.ClientSecret) {
            Write-MandALog "ERROR: Invalid or incomplete authentication context for Azure" -Level "ERROR"
            $script:ConnectionStatus.Azure.LastError = "Missing required authentication properties"
            return $false
        }
        
        Write-MandALog "DEBUG: Loading Azure modules..." -Level "DEBUG"
        
        # Import module
        try {
            Import-Module Az.Accounts -Force -ErrorAction Stop
            Write-MandALog "  - Loaded: Az.Accounts" -Level "DEBUG"
        } catch {
            Write-MandALog "  - WARNING: Could not load Az.Accounts: $($_.Exception.Message)" -Level "WARN"
        }
        
        $maxRetries = $Configuration.environment.maxRetries
        
        for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
            try {
                Write-MandALog "Azure connection attempt $attempt of $maxRetries..." -Level "PROGRESS"
                
                # Check for existing connection
                Write-MandALog "DEBUG: Checking for existing Azure connection..." -Level "DEBUG"
                $currentContext = Get-AzContext -ErrorAction SilentlyContinue
                
                if ($currentContext -and $currentContext.Account.Id -eq $AuthContext.ClientId) {
                    Write-MandALog "DEBUG: Found existing context with matching ClientId" -Level "DEBUG"
                    try {
                        # Test the connection
                        $testSub = Get-AzSubscription -ErrorAction Stop | Select-Object -First 1
                        if ($testSub) {
                            Write-MandALog "[OK] Using existing valid Azure connection" -Level "SUCCESS"
                            $script:ConnectionStatus.Azure.Connected = $true
                            $script:ConnectionStatus.Azure.Context = $currentContext
                            $script:ConnectionStatus.Azure.ConnectedTime = Get-Date
                            $script:ConnectionStatus.Azure.Method = "Existing Session"
                            $script:ConnectionStatus.Azure.LastError = $null
                            return $true
                        }
                    } catch {
                        Write-MandALog "DEBUG: Existing connection is invalid, will reconnect..." -Level "WARN"
                    }
                }
                
                # Connect with service principal
                Write-MandALog "DEBUG: Attempting service principal authentication..." -Level "INFO"
                
                $secureSecret = ConvertTo-SecureString $AuthContext.ClientSecret -AsPlainText -Force
                $credential = New-Object System.Management.Automation.PSCredential ($AuthContext.ClientId, $secureSecret)
                
                Write-MandALog "DEBUG: Calling Connect-AzAccount..." -Level "DEBUG"
                $azContext = Connect-AzAccount -ServicePrincipal -Credential $credential -TenantId $AuthContext.TenantId -ErrorAction Stop
                
                if ($azContext) {
                    Write-MandALog "[OK] Successfully connected to Azure" -Level "SUCCESS"
                    Write-MandALog "  - Tenant: $($azContext.Context.Tenant.Id)" -Level "INFO"
                    Write-MandALog "  - Account: $($azContext.Context.Account.Id)" -Level "INFO"
                    
                    # Get subscription information
                    Write-MandALog "DEBUG: Retrieving subscription information..." -Level "DEBUG"
                    $subscriptions = Get-AzSubscription -ErrorAction SilentlyContinue
                    if ($subscriptions) {
                        $totalSubs = $subscriptions.Count
                        $activeSubs = ($subscriptions | Where-Object { $_.State -eq "Enabled" }).Count
                        Write-MandALog "  - Total Subscriptions: $totalSubs" -Level "INFO"
                        Write-MandALog "  - Active Subscriptions: $activeSubs" -Level "INFO"
                        
                        # List first few subscriptions
                        $subscriptions | Select-Object -First 3 | ForEach-Object {
                            Write-MandALog "    - $($_.Name) [$($_.Id)]" -Level "DEBUG"
                        }
                    }
                    
                    $script:ConnectionStatus.Azure.Connected = $true
                    $script:ConnectionStatus.Azure.Context = $azContext
                    $script:ConnectionStatus.Azure.LastError = $null
                    $script:ConnectionStatus.Azure.ConnectedTime = Get-Date
                    $script:ConnectionStatus.Azure.Method = "Service Principal"
                    
                    return $true
                }
                
            } catch {
                $errorMessage = $_.Exception.Message
                Write-MandALog "ERROR: Azure connection attempt $attempt failed: $errorMessage" -Level "ERROR"
                Write-MandALog "DEBUG: Full error: $($_.Exception.ToString())" -Level "DEBUG"
                $script:ConnectionStatus.Azure.LastError = $errorMessage
                
                if ($attempt -lt $maxRetries) {
                    Write-MandALog "Retrying in 3 seconds..." -Level "INFO"
                    Start-Sleep -Seconds 3
                }
            }
        }
        
        Write-MandALog "ERROR: Failed to establish Azure connection after $maxRetries attempts" -Level "ERROR"
        $script:ConnectionStatus.Azure.Connected = $false
        return $false
        
    } catch {
        Write-MandALog "CRITICAL ERROR in Connect-MandAAzureEnhanced: $($_.Exception.Message)" -Level "ERROR"
        Write-MandALog "Stack Trace: $($_.ScriptStackTrace)" -Level "DEBUG"
        $script:ConnectionStatus.Azure.Connected = $false
        $script:ConnectionStatus.Azure.LastError = $_.Exception.Message
        return $false
    }
}

# Exchange connection is now handled via Graph API - no separate connection function needed

function Connect-MandAActiveDirectory {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Starting Active Directory connection process..." -Level "PROGRESS"
        
        $domainController = $Configuration.environment.domainController
        Write-MandALog "DEBUG: Target Domain Controller: $domainController" -Level "DEBUG"
        
        # Test AD connectivity
        Write-MandALog "DEBUG: Testing AD connectivity..." -Level "DEBUG"
        
        try {
            $adTest = Get-ADDomain -Server $domainController -ErrorAction Stop
            Write-MandALog "[OK] Successfully connected to Active Directory" -Level "SUCCESS"
            Write-MandALog "  - Domain: $($adTest.Name)" -Level "INFO"
            Write-MandALog "  - Forest: $($adTest.Forest)" -Level "INFO"
            Write-MandALog "  - Domain Controller: $domainController" -Level "INFO"
            
            $script:ConnectionStatus.ActiveDirectory.Connected = $true
            $script:ConnectionStatus.ActiveDirectory.Context = $adTest
            $script:ConnectionStatus.ActiveDirectory.LastError = $null
            $script:ConnectionStatus.ActiveDirectory.ConnectedTime = Get-Date
            $script:ConnectionStatus.ActiveDirectory.Method = "Direct"
            
            return $true
            
        } catch {
            Write-MandALog "ERROR: Failed to connect to Active Directory: $($_.Exception.Message)" -Level "ERROR"
            $script:ConnectionStatus.ActiveDirectory.Connected = $false
            $script:ConnectionStatus.ActiveDirectory.LastError = $_.Exception.Message
            return $false
        }
        
    } catch {
        Write-MandALog "CRITICAL ERROR in Connect-MandAActiveDirectory: $($_.Exception.Message)" -Level "ERROR"
        $script:ConnectionStatus.ActiveDirectory.Connected = $false
        $script:ConnectionStatus.ActiveDirectory.LastError = $_.Exception.Message
        return $false
    }
}

function Test-GraphConnection {
    [CmdletBinding()]
    param()
    
    try {
        Write-MandALog "Testing Microsoft Graph connection..." -Level "DEBUG"
        
        # Check if we have a connection status
        if (-not $script:ConnectionStatus.Graph.Connected) {
            return @{
                Connected = $false
                Error = "No active Graph connection"
                Service = "Microsoft Graph"
                LastTested = Get-Date
            }
        }
        
        # Test the connection by making a simple API call
        try {
            $context = Get-MgContext -ErrorAction Stop
            if (-not $context) {
                throw "No Graph context available"
            }
            
            # Test with a simple organization query
            $org = Get-MgOrganization -Top 1 -ErrorAction Stop
            
            return @{
                Connected = $true
                Service = "Microsoft Graph"
                Details = @{
                    TenantId = $context.TenantId
                    ClientId = $context.ClientId
                    Organization = $org.DisplayName
                    Scopes = $context.Scopes -join ', '
                }
                LastTested = Get-Date
                ResponseTime = (Measure-Command { Get-MgOrganization -Top 1 -ErrorAction Stop }).TotalMilliseconds
            }
            
        } catch {
            # Update connection status
            $script:ConnectionStatus.Graph.Connected = $false
            $script:ConnectionStatus.Graph.LastError = $_.Exception.Message
            
            return @{
                Connected = $false
                Error = $_.Exception.Message
                Service = "Microsoft Graph"
                LastTested = Get-Date
            }
        }
        
    } catch {
        return @{
            Connected = $false
            Error = $_.Exception.Message
            Service = "Microsoft Graph"
            LastTested = Get-Date
        }
    }
}

function Test-AzureConnection {
    [CmdletBinding()]
    param()
    
    try {
        Write-MandALog "Testing Azure connection..." -Level "DEBUG"
        
        # Check if we have a connection status
        if (-not $script:ConnectionStatus.Azure.Connected) {
            return @{
                Connected = $false
                Error = "No active Azure connection"
                Service = "Azure"
                LastTested = Get-Date
            }
        }
        
        # Test the connection
        try {
            $context = Get-AzContext -ErrorAction Stop
            if (-not $context) {
                throw "No Azure context available"
            }
            
            # Test with a simple subscription query
            $subscriptions = Get-AzSubscription -ErrorAction Stop | Select-Object -First 1
            
            return @{
                Connected = $true
                Service = "Azure"
                Details = @{
                    TenantId = $context.Tenant.Id
                    AccountId = $context.Account.Id
                    SubscriptionCount = (Get-AzSubscription).Count
                    Environment = $context.Environment.Name
                }
                LastTested = Get-Date
                ResponseTime = (Measure-Command { Get-AzSubscription -ErrorAction Stop | Select-Object -First 1 }).TotalMilliseconds
            }
            
        } catch {
            # Update connection status
            $script:ConnectionStatus.Azure.Connected = $false
            $script:ConnectionStatus.Azure.LastError = $_.Exception.Message
            
            return @{
                Connected = $false
                Error = $_.Exception.Message
                Service = "Azure"
                LastTested = Get-Date
            }
        }
        
    } catch {
        return @{
            Connected = $false
            Error = $_.Exception.Message
            Service = "Azure"
            LastTested = Get-Date
        }
    }
}

function Test-ExchangeConnection {
    [CmdletBinding()]
    param()
    
    try {
        Write-MandALog "Testing Exchange Online connection..." -Level "DEBUG"
        
        # Check if we have a connection status
        if (-not $script:ConnectionStatus.ExchangeOnline.Connected) {
            return @{
                Connected = $false
                Error = "No active Exchange Online connection"
                Service = "Exchange Online"
                LastTested = Get-Date
            }
        }
        
        # Test the connection
        try {
            # Test with a simple mailbox query
            $mailbox = Get-Mailbox -ResultSize 1 -ErrorAction Stop
            
            # Get connection info
            $connectionInfo = Get-ConnectionInformation -ErrorAction SilentlyContinue
            
            return @{
                Connected = $true
                Service = "Exchange Online"
                Details = @{
                    Organization = if ($connectionInfo) { $connectionInfo.Organization } else { "Unknown" }
                    UserPrincipalName = if ($connectionInfo) { $connectionInfo.UserPrincipalName } else { "Service Principal" }
                    ConnectionMethod = $script:ConnectionStatus.ExchangeOnline.Method
                }
                LastTested = Get-Date
                ResponseTime = (Measure-Command { Get-Mailbox -ResultSize 1 -ErrorAction Stop }).TotalMilliseconds
            }
            
        } catch {
            # Update connection status
            $script:ConnectionStatus.ExchangeOnline.Connected = $false
            $script:ConnectionStatus.ExchangeOnline.LastError = $_.Exception.Message
            
            return @{
                Connected = $false
                Error = $_.Exception.Message
                Service = "Exchange Online"
                LastTested = Get-Date
            }
        }
        
    } catch {
        return @{
            Connected = $false
            Error = $_.Exception.Message
            Service = "Exchange Online"
            LastTested = Get-Date
        }
    }
}

function Test-ActiveDirectoryConnection {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "Testing Active Directory connection..." -Level "DEBUG"
        
        # Check if we have a connection status
        if (-not $script:ConnectionStatus.ActiveDirectory.Connected) {
            return @{
                Connected = $false
                Error = "No active Active Directory connection"
                Service = "Active Directory"
                LastTested = Get-Date
            }
        }
        
        # Test the connection
        try {
            # Get domain controller from configuration or use default
            $domainController = if ($Configuration -and $Configuration.environment.domainController) {
                $Configuration.environment.domainController
            } else {
                $null
            }
            
            # Test with a simple domain query
            $domain = if ($domainController) {
                Get-ADDomain -Server $domainController -ErrorAction Stop
            } else {
                Get-ADDomain -ErrorAction Stop
            }
            
            return @{
                Connected = $true
                Service = "Active Directory"
                Details = @{
                    DomainName = $domain.Name
                    Forest = $domain.Forest
                    DomainController = $domainController
                    NetBIOSName = $domain.NetBIOSName
                }
                LastTested = Get-Date
                ResponseTime = (Measure-Command {
                    if ($domainController) {
                        Get-ADDomain -Server $domainController -ErrorAction Stop
                    } else {
                        Get-ADDomain -ErrorAction Stop
                    }
                }).TotalMilliseconds
            }
            
        } catch {
            # Update connection status
            $script:ConnectionStatus.ActiveDirectory.Connected = $false
            $script:ConnectionStatus.ActiveDirectory.LastError = $_.Exception.Message
            
            return @{
                Connected = $false
                Error = $_.Exception.Message
                Service = "Active Directory"
                LastTested = Get-Date
            }
        }
        
    } catch {
        return @{
            Connected = $false
            Error = $_.Exception.Message
            Service = "Active Directory"
            LastTested = Get-Date
        }
    }
}

function Test-AllConnections {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "Starting comprehensive connection validation..." -Level "PROGRESS"
        
        # Define connection test functions
        $connections = @{
            'Graph' = { Test-GraphConnection }
            'Azure' = { Test-AzureConnection }
            'Exchange' = { Test-ExchangeConnection }
            'ActiveDirectory' = { Test-ActiveDirectoryConnection -Configuration $Configuration }
        }
        
        $results = @{}
        $totalConnections = $connections.Keys.Count
        $currentConnection = 0
        
        foreach ($service in $connections.Keys) {
            $currentConnection++
            
            try {
                Write-MandALog "Testing $service connection [$currentConnection/$totalConnections]..." -Level "INFO"
                
                # Execute the test function
                $testStart = Get-Date
                $testResult = & $connections[$service]
                $testDuration = ((Get-Date) - $testStart).TotalMilliseconds
                
                # Add test duration to result
                $testResult.TestDuration = $testDuration
                
                # Store result
                $results[$service] = $testResult
                
                # Log result
                if ($testResult.Connected) {
                    Write-MandALog "[OK] $service connection validated" -Level "SUCCESS"
                    if ($testResult.Details) {
                        foreach ($key in $testResult.Details.Keys) {
                            Write-MandALog "  - $key : $($testResult.Details[$key])" -Level "DEBUG"
                        }
                    }
                    if ($testResult.ResponseTime) {
                        Write-MandALog "  - Response Time: $([Math]::Round($testResult.ResponseTime, 1))ms" -Level "DEBUG"
                    }
                } else {
                    Write-MandALog "[FAIL] $service connection failed: $($testResult.Error)" -Level "ERROR"
                }
                
            } catch {
                Write-MandALog "ERROR: Exception during $service connection test: $($_.Exception.Message)" -Level "ERROR"
                $results[$service] = @{
                    Connected = $false
                    Error = $_.Exception.Message
                    Service = $service
                    LastTested = Get-Date
                    TestDuration = ((Get-Date) - $testStart).TotalMilliseconds
                }
            }
        }
        
        # Generate summary
        $connectedServices = ($results.Values | Where-Object { $_.Connected }).Count
        $failedServices = $totalConnections - $connectedServices
        
        Write-MandALog "" -Level "INFO"
        Write-MandALog "===============================================" -Level "INFO"
        Write-MandALog "CONNECTION VALIDATION SUMMARY" -Level "INFO"
        Write-MandALog "===============================================" -Level "INFO"
        Write-MandALog "Total Services Tested: $totalConnections" -Level "INFO"
        Write-MandALog "Connected Services: $connectedServices" -Level "SUCCESS"
        Write-MandALog "Failed Services: $failedServices" -Level $(if ($failedServices -eq 0) { "SUCCESS" } else { "ERROR" })
        
        # List connected services
        if ($connectedServices -gt 0) {
            Write-MandALog "" -Level "INFO"
            Write-MandALog "Connected Services:" -Level "SUCCESS"
            foreach ($service in $results.Keys) {
                if ($results[$service].Connected) {
                    $responseTime = if ($results[$service].ResponseTime) { " ($([Math]::Round($results[$service].ResponseTime, 1))ms)" } else { "" }
                    Write-MandALog "  [+] $service$responseTime" -Level "SUCCESS"
                }
            }
        }
        
        # List failed services
        if ($failedServices -gt 0) {
            Write-MandALog "" -Level "INFO"
            Write-MandALog "Failed Services:" -Level "ERROR"
            foreach ($service in $results.Keys) {
                if (-not $results[$service].Connected) {
                    Write-MandALog "  [-] $service : $($results[$service].Error)" -Level "ERROR"
                }
            }
        }
        
        Write-MandALog "===============================================" -Level "INFO"
        
        # Add overall summary to results
        $results.Summary = @{
            TotalTested = $totalConnections
            Connected = $connectedServices
            Failed = $failedServices
            SuccessRate = [Math]::Round(($connectedServices / $totalConnections) * 100, 1)
            TestCompleted = Get-Date
        }
        
        return $results
        
    } catch {
        Write-MandALog "CRITICAL ERROR in Test-AllConnections: $($_.Exception.Message)" -Level "ERROR"
        Write-MandALog "Stack Trace: $($_.ScriptStackTrace)" -Level "DEBUG"
        
        return @{
            Error = $_.Exception.Message
            TestCompleted = Get-Date
            Summary = @{
                TotalTested = 0
                Connected = 0
                Failed = 0
                SuccessRate = 0
            }
        }
    }
}

function Get-ConnectionStatus {
    Write-MandALog "DEBUG: Returning connection status for $($script:ConnectionStatus.Keys.Count) services" -Level "DEBUG"
    foreach ($service in $script:ConnectionStatus.Keys) {
        $status = $script:ConnectionStatus[$service]
        Write-MandALog "  - $service : Connected=$($status.Connected), Method=$($status.Method)" -Level "DEBUG"
    }
    return $script:ConnectionStatus
}

function Disconnect-AllServices {
    try {
        Write-MandALog "===============================================" -Level "INFO"
        Write-MandALog "Disconnecting from all services" -Level "INFO"
        Write-MandALog "===============================================" -Level "INFO"
        
        # Disconnect from Microsoft Graph
        if ($script:ConnectionStatus.Graph.Connected) {
            try {
                Write-MandALog "DEBUG: Disconnecting from Microsoft Graph..." -Level "DEBUG"
                Disconnect-MgGraph -ErrorAction SilentlyContinue
                Write-MandALog "[OK] Disconnected from Microsoft Graph" -Level "SUCCESS"
            } catch {
                Write-MandALog "WARN: Error disconnecting from Graph: $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        # Disconnect from Azure
        if ($script:ConnectionStatus.Azure.Connected) {
            try {
                Write-MandALog "DEBUG: Disconnecting from Azure..." -Level "DEBUG"
                Disconnect-AzAccount -ErrorAction SilentlyContinue
                Write-MandALog "[OK] Disconnected from Azure" -Level "SUCCESS"
            } catch {
                Write-MandALog "WARN: Error disconnecting from Azure: $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        # Disconnect from Exchange Online
        if ($script:ConnectionStatus.ExchangeOnline.Connected) {
            try {
                Write-MandALog "DEBUG: Disconnecting from Exchange Online..." -Level "DEBUG"
                Disconnect-ExchangeOnline -Confirm:$false -ErrorAction SilentlyContinue
                Write-MandALog "[OK] Disconnected from Exchange Online" -Level "SUCCESS"
            } catch {
                Write-MandALog "WARN: Error disconnecting from Exchange: $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        # Clear connection status
        foreach ($service in $script:ConnectionStatus.Keys) {
            $script:ConnectionStatus[$service].Connected = $false
            $script:ConnectionStatus[$service].Context = $null
            $script:ConnectionStatus[$service].ConnectedTime = $null
            $script:ConnectionStatus[$service].Method = $null
        }
        
        Write-MandALog "[OK] All services disconnected" -Level "SUCCESS"
        
    } catch {
        Write-MandALog "ERROR during service disconnection: $($_.Exception.Message)" -Level "ERROR"
        Write-MandALog "Stack Trace: $($_.ScriptStackTrace)" -Level "DEBUG"
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Initialize-AllConnections',
    'Connect-ToMicrosoftGraph',
    'Connect-ToExchangeOnline',
    'Connect-ToSharePointOnline',
    'Connect-ToTeams',
    'Connect-ToAzure',
    'Connect-MandAGraphEnhanced',
    'Connect-MandAAzureEnhanced',
    
    'Connect-MandAActiveDirectory',
    'Get-ConnectionStatus',
    'Disconnect-AllServices',
    'Test-AllConnections',
    'Test-GraphConnection',
    'Test-AzureConnection',
    'Test-ExchangeConnection',
    'Test-ActiveDirectoryConnection'
)

if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
    Write-MandALog "EnhancedConnectionManager module loaded successfully" -Level "DEBUG"
} else {
    Write-Host "[DEBUG] EnhancedConnectionManager module loaded successfully" -ForegroundColor Gray
}

