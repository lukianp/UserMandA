#
# EnhancedConnectionManager.psm1
# Enhanced connection manager with robust authentication fallbacks and extensive debugging
#

# Global connection status tracking


# Fix-ConnectionManager.ps1
$modulePath = ".\Modules\Connectivity\EnhancedConnectionManager.psm1"


# Module initialization - no global dependency at load time
$script:ConnectionStatus = @{
    Graph = @{ Connected = $false; LastError = $null; ConnectedTime = $null; Context = $null; Method = $null }
    Azure = @{ Connected = $false; LastError = $null; ConnectedTime = $null; Context = $null; Method = $null }
    ExchangeOnline = @{ Connected = $false; LastError = $null; ConnectedTime = $null; Context = $null; Method = $null }
    ActiveDirectory = @{ Connected = $false; LastError = $null; ConnectedTime = $null; Context = $null; Method = $null }
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

function Connect-MandAExchangeEnhanced {
    param(
        [hashtable]$AuthContext,
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "Starting Exchange Online connection process..." -Level "PROGRESS"
        
        # Debug logging
        Write-MandALog "DEBUG: Connect-MandAExchangeEnhanced called" -Level "DEBUG"
        Write-MandALog "  - AuthContext present: $($null -ne $AuthContext)" -Level "DEBUG"
        
        # Validate auth context
        if (-not $AuthContext -or -not $AuthContext.ClientId -or -not $AuthContext.TenantId) {
            Write-MandALog "ERROR: Invalid or incomplete authentication context for Exchange" -Level "ERROR"
            $script:ConnectionStatus.ExchangeOnline.LastError = "Missing required authentication properties"
            return $false
        }
        
        Write-MandALog "DEBUG: Loading Exchange Online module..." -Level "DEBUG"
        
        # Import module
        try {
            Import-Module ExchangeOnlineManagement -Force -ErrorAction Stop
            Write-MandALog "  - Loaded: ExchangeOnlineManagement" -Level "DEBUG"
        } catch {
            Write-MandALog "  - WARNING: Could not load ExchangeOnlineManagement: $($_.Exception.Message)" -Level "WARN"
            $script:ConnectionStatus.ExchangeOnline.LastError = "ExchangeOnlineManagement module not available"
            return $false
        }
        
        $maxRetries = $Configuration.environment.maxRetries
        
        for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
            try {
                Write-MandALog "Exchange connection attempt $attempt of $maxRetries..." -Level "PROGRESS"
                
                # Check if we have a certificate thumbprint for app-only auth
                $certificateThumbprint = $Configuration.authentication.certificateThumbprint
                
                if ($certificateThumbprint) {
                    Write-MandALog "DEBUG: Certificate thumbprint found, attempting app-only authentication" -Level "INFO"
                    Write-MandALog "  - Certificate: $certificateThumbprint" -Level "DEBUG"
                    Write-MandALog "  - AppId: $($AuthContext.ClientId)" -Level "DEBUG"
                    Write-MandALog "  - Organization: $($AuthContext.TenantId).onmicrosoft.com" -Level "DEBUG"
                    
                    $connectParams = @{
                        AppId = $AuthContext.ClientId
                        CertificateThumbprint = $certificateThumbprint
                        Organization = "$($AuthContext.TenantId).onmicrosoft.com"
                        ShowBanner = $false
                        ErrorAction = "Stop"
                    }
                    
                    Connect-ExchangeOnline @connectParams
                    $script:ConnectionStatus.ExchangeOnline.Method = "Certificate (App-Only)"
                    
                } else {
                    Write-MandALog "WARN: No certificate thumbprint configured for Exchange Online" -Level "WARN"
                    Write-MandALog "Exchange Online requires certificate-based authentication for app-only access" -Level "WARN"
                    Write-MandALog "Attempting delegated authentication (will require user interaction)..." -Level "INFO"
                    
                    # Try delegated auth as fallback
                    $connectParams = @{
                        UserPrincipalName = $null  # Will prompt
                        ShowBanner = $false
                        ErrorAction = "Stop"
                    }
                    
                    Connect-ExchangeOnline @connectParams
                    $script:ConnectionStatus.ExchangeOnline.Method = "Delegated (Interactive)"
                }
                
                # Test connection
                Write-MandALog "DEBUG: Testing Exchange connection..." -Level "DEBUG"
                $mailbox = Get-Mailbox -ResultSize 1 -ErrorAction Stop
                
                Write-MandALog "[OK] Successfully connected to Exchange Online" -Level "SUCCESS"
                Write-MandALog "  - Connection method: $($script:ConnectionStatus.ExchangeOnline.Method)" -Level "INFO"
                
                $script:ConnectionStatus.ExchangeOnline.Connected = $true
                $script:ConnectionStatus.ExchangeOnline.LastError = $null
                $script:ConnectionStatus.ExchangeOnline.ConnectedTime = Get-Date
                
                return $true
                
            } catch {
                $errorMessage = $_.Exception.Message
                Write-MandALog "ERROR: Exchange connection attempt $attempt failed: $errorMessage" -Level "ERROR"
                Write-MandALog "DEBUG: Full error: $($_.Exception.ToString())" -Level "DEBUG"
                $script:ConnectionStatus.ExchangeOnline.LastError = $errorMessage
                
                if ($attempt -lt $maxRetries) {
                    Write-MandALog "Retrying in 5 seconds..." -Level "INFO"
                    Start-Sleep -Seconds 5
                }
            }
        }
        
        Write-MandALog "ERROR: Failed to establish Exchange Online connection" -Level "ERROR"
        Write-MandALog "NOTE: Exchange Online requires certificate-based authentication for app-only access" -Level "INFO"
        Write-MandALog "To enable Exchange discovery, configure a certificate in the authentication settings" -Level "INFO"
        $script:ConnectionStatus.ExchangeOnline.Connected = $false
        return $false
        
    } catch {
        Write-MandALog "CRITICAL ERROR in Connect-MandAExchangeEnhanced: $($_.Exception.Message)" -Level "ERROR"
        Write-MandALog "Stack Trace: $($_.ScriptStackTrace)" -Level "DEBUG"
        $script:ConnectionStatus.ExchangeOnline.Connected = $false
        $script:ConnectionStatus.ExchangeOnline.LastError = $_.Exception.Message
        return $false
    }
}

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
    'Connect-MandAGraphEnhanced',
    'Connect-MandAAzureEnhanced', 
    'Connect-MandAExchangeEnhanced',
    'Connect-MandAActiveDirectory',
    'Get-ConnectionStatus',
    'Disconnect-AllServices'
)

Write-MandALog "EnhancedConnectionManager module loaded successfully" -Level "DEBUG"
