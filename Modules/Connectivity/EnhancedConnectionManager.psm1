#
# EnhancedConnectionManager.psm1
# Enhanced connection manager with robust authentication fallbacks
#

# Global connection status tracking
$script:ConnectionStatus = @{
    Graph = @{ Connected = $false; LastError = $null; ConnectedTime = $null; Context = $null; Method = $null }
    Azure = @{ Connected = $false; LastError = $null; ConnectedTime = $null; Context = $null; Method = $null }
    ExchangeOnline = @{ Connected = $false; LastError = $null; ConnectedTime = $null; Context = $null; Method = $null }
}

function Initialize-AllConnections {
    param(
        [hashtable]$Configuration,
        [hashtable]$AuthContext
    )
    
    try {
        Write-MandALog "Initializing service connections with enhanced authentication" -Level "HEADER"
        
        # Validate AuthContext
        if (-not $AuthContext) {
            Write-MandALog "No authentication context provided" -Level "ERROR"
            return @{
                Graph = @{ Connected = $false; Error = "No authentication context" }
                Azure = @{ Connected = $false; Error = "No authentication context" }
                ExchangeOnline = @{ Connected = $false; Error = "No authentication context" }
            }
        }
        
        # Log what we have in AuthContext for debugging
        Write-MandALog "AuthContext contains ClientId: $($AuthContext.ClientId)" -Level "DEBUG"
        Write-MandALog "AuthContext contains TenantId: $($AuthContext.TenantId)" -Level "DEBUG"
        Write-MandALog "AuthContext has ClientSecret: $(if($AuthContext.ClientSecret){'Yes'}else{'No'})" -Level "DEBUG"
        
        $connectionResults = @{}
        $enabledSources = $Configuration.discovery.enabledSources
        
        # Microsoft Graph connection
        if ($enabledSources -contains "Graph" -or $enabledSources -contains "Intune") {
            Write-MandALog "Connecting to Microsoft Graph..." -Level "PROGRESS"
            $connectionResults["Graph"] = Connect-MandAGraphEnhanced -AuthContext $AuthContext -Configuration $Configuration
        }
        
        # Azure connection
        if ($enabledSources -contains "Azure") {
            Write-MandALog "Connecting to Azure..." -Level "PROGRESS"
            $connectionResults["Azure"] = Connect-MandAAzureEnhanced -AuthContext $AuthContext -Configuration $Configuration
        }
        
        # Exchange Online connection
        if ($enabledSources -contains "Exchange") {
            Write-MandALog "Connecting to Exchange Online..." -Level "PROGRESS"
            # Exchange needs AppId and TenantId from AuthContext
            if ($AuthContext.ClientId -and $AuthContext.TenantId) {
                $connectionResults["ExchangeOnline"] = Connect-MandAExchangeEnhanced -Configuration $Configuration -AuthContext $AuthContext
            } else {
                Write-MandALog "Missing ClientId or TenantId for Exchange connection" -Level "ERROR"
                $connectionResults["ExchangeOnline"] = $false
            }
        }
        
        # Summary
        $connectedServices = ($connectionResults.Values | Where-Object { $_ -eq $true }).Count
        $totalServices = $connectionResults.Count
        
        Write-MandALog "CONNECTION SUMMARY" -Level "HEADER"
        Write-MandALog "Service availability status for discovery operations" -Level "HEADER"
        
        # Display individual connection status
        foreach ($service in $connectionResults.GetEnumerator()) {
            $status = $script:ConnectionStatus[$service.Key]
            if ($service.Value) {
                $connectTime = if ($status.ConnectedTime) { $status.ConnectedTime.ToString("HH:mm:ss") } else { "Unknown" }
                $method = if ($status.Method) { " via $($status.Method)" } else { "" }
                Write-MandALog "$($service.Key): Connected at $connectTime$method" -Level "SUCCESS"
            } else {
                $lastError = if ($status.LastError) { " - $($status.LastError)" } else { "" }
                Write-MandALog "$($service.Key): Failed$lastError" -Level "ERROR"
            }
        }
        
        Write-MandALog "Connection Summary: $connectedServices of $totalServices services connected" -Level $(if ($connectedServices -eq $totalServices) { "SUCCESS" } elseif ($connectedServices -gt 0) { "WARN" } else { "ERROR" })
        
        # Return the connection results hashtable, not a boolean
        return $connectionResults
        
    } catch {
        Write-MandALog "Connection initialization failed: $($_.Exception.Message)" -Level "ERROR"
        return @{
            Graph = @{ Connected = $false; Error = $_.Exception.Message }
            Azure = @{ Connected = $false; Error = $_.Exception.Message }
            ExchangeOnline = @{ Connected = $false; Error = $_.Exception.Message }
        }
    }
}

function Connect-MandAGraphEnhanced {
    param(
        [hashtable]$AuthContext,
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "Establishing Microsoft Graph connection..." -Level "PROGRESS"
        
        # Validate AuthContext
        if (-not $AuthContext -or -not $AuthContext.ClientId -or -not $AuthContext.ClientSecret -or -not $AuthContext.TenantId) {
            Write-MandALog "Invalid or incomplete authentication context for Graph" -Level "ERROR"
            $script:ConnectionStatus.Graph.LastError = "Missing authentication credentials"
            return $false
        }
        
        # Import required modules
        Import-Module Microsoft.Graph.Authentication -Force -ErrorAction SilentlyContinue
        Import-Module Microsoft.Graph.Users -Force -ErrorAction SilentlyContinue
        Import-Module Microsoft.Graph.Groups -Force -ErrorAction SilentlyContinue
        
        $maxRetries = $Configuration.environment.maxRetries
        $retryDelay = 5
        
        for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
            try {
                Write-MandALog "Graph connection attempt $attempt of $maxRetries..." -Level "PROGRESS"
                
                # Check for existing valid connection
                $existingContext = Get-MgContext -ErrorAction SilentlyContinue
                if ($existingContext -and $existingContext.ClientId -eq $AuthContext.ClientId) {
                    try {
                        $org = Get-MgOrganization -Top 1 -ErrorAction Stop
                        Write-MandALog "Using existing valid Graph connection" -Level "SUCCESS"
                        $script:ConnectionStatus.Graph.Connected = $true
                        $script:ConnectionStatus.Graph.Context = $existingContext
                        $script:ConnectionStatus.Graph.ConnectedTime = Get-Date
                        $script:ConnectionStatus.Graph.Method = "Existing Session"
                        
                        Write-MandALog "Organization: $($org.DisplayName)" -Level "INFO"
                        Write-MandALog "Tenant ID: $($existingContext.TenantId)" -Level "INFO"
                        
                        return $true
                    } catch {
                        Write-MandALog "Existing connection invalid, reconnecting..." -Level "WARN"
                        Disconnect-MgGraph -ErrorAction SilentlyContinue
                    }
                }
                
                # Try client secret authentication
                Write-MandALog "Attempting Client Secret authentication..." -Level "INFO"
                
                $secureSecret = ConvertTo-SecureString $AuthContext.ClientSecret -AsPlainText -Force
                $clientCredential = New-Object System.Management.Automation.PSCredential ($AuthContext.ClientId, $secureSecret)
                
                Connect-MgGraph -ClientSecretCredential $clientCredential -TenantId $AuthContext.TenantId -NoWelcome -ErrorAction Stop
                
                # Verify connection
                $context = Get-MgContext -ErrorAction Stop
                if (-not $context) {
                    throw "Failed to establish Graph context"
                }
                
                # Test functionality
                $org = Get-MgOrganization -Top 1 -ErrorAction Stop
                
                Write-MandALog "Successfully connected to Microsoft Graph" -Level "SUCCESS"
                Write-MandALog "Organization: $($org.DisplayName)" -Level "INFO"
                Write-MandALog "Tenant ID: $($context.TenantId)" -Level "INFO"
                
                $script:ConnectionStatus.Graph.Connected = $true
                $script:ConnectionStatus.Graph.Context = $context
                $script:ConnectionStatus.Graph.LastError = $null
                $script:ConnectionStatus.Graph.ConnectedTime = Get-Date
                $script:ConnectionStatus.Graph.Method = "Client Secret"
                
                return $true
                
            } catch {
                $errorMessage = $_.Exception.Message
                Write-MandALog "Graph connection attempt $attempt failed: $errorMessage" -Level "ERROR"
                
                $script:ConnectionStatus.Graph.LastError = $errorMessage
                
                if ($attempt -lt $maxRetries) {
                    Write-MandALog "Retrying in $retryDelay seconds..." -Level "INFO"
                    Start-Sleep -Seconds $retryDelay
                    $retryDelay += 2
                }
            }
        }
        
        Write-MandALog "Failed to establish Graph connection after $maxRetries attempts" -Level "ERROR"
        $script:ConnectionStatus.Graph.Connected = $false
        return $false
        
    } catch {
        Write-MandALog "Graph connection error: $($_.Exception.Message)" -Level "ERROR"
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
        Write-MandALog "Establishing Azure connection..." -Level "PROGRESS"
        
        # Validate AuthContext
        if (-not $AuthContext -or -not $AuthContext.ClientId -or -not $AuthContext.ClientSecret -or -not $AuthContext.TenantId) {
            Write-MandALog "Invalid or incomplete authentication context for Azure" -Level "ERROR"
            $script:ConnectionStatus.Azure.LastError = "Missing authentication credentials"
            return $false
        }
        
        # Import module
        Import-Module Az.Accounts -Force -ErrorAction SilentlyContinue
        
        $maxRetries = $Configuration.environment.maxRetries
        
        for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
            try {
                Write-MandALog "Azure connection attempt $attempt of $maxRetries..." -Level "PROGRESS"
                
                # Check for existing connection
                $existingAzContext = Get-AzContext -ErrorAction SilentlyContinue
                if ($existingAzContext -and $existingAzContext.Account) {
                    try {
                        Get-AzSubscription -ErrorAction Stop | Out-Null
                        Write-MandALog "Using existing Azure connection" -Level "SUCCESS"
                        $script:ConnectionStatus.Azure.Connected = $true
                        $script:ConnectionStatus.Azure.Context = $existingAzContext
                        return $true
                    } catch {
                        Write-MandALog "Existing Azure connection invalid, reconnecting..." -Level "WARN"
                    }
                }
                
                # Create credential object for Azure
                $secureSecret = ConvertTo-SecureString $AuthContext.ClientSecret -AsPlainText -Force
                $credential = New-Object System.Management.Automation.PSCredential ($AuthContext.ClientId, $secureSecret)
                
                # Connect with service principal
                $azContext = Connect-AzAccount -ServicePrincipal -Credential $credential -TenantId $AuthContext.TenantId -ErrorAction Stop
                
                if ($azContext) {
                    Write-MandALog "Successfully connected to Azure" -Level "SUCCESS"
                    Write-MandALog "Tenant: $($azContext.Context.Tenant.Id)" -Level "INFO"
                    
                    # Get subscription information
                    $subscriptions = Get-AzSubscription -ErrorAction SilentlyContinue
                    if ($subscriptions) {
                        $totalSubs = $subscriptions.Count
                        $activeSubs = ($subscriptions | Where-Object { $_.State -eq "Enabled" }).Count
                        Write-MandALog "Total Subscriptions: $totalSubs" -Level "INFO"
                        Write-MandALog "Active Subscriptions: $activeSubs" -Level "INFO"
                    }
                    
                    $script:ConnectionStatus.Azure.Connected = $true
                    $script:ConnectionStatus.Azure.Context = $azContext.Context
                    $script:ConnectionStatus.Azure.LastError = $null
                    $script:ConnectionStatus.Azure.ConnectedTime = Get-Date
                    $script:ConnectionStatus.Azure.Method = "Service Principal"
                    
                    return $true
                }
                
            } catch {
                $errorMessage = $_.Exception.Message
                Write-MandALog "Azure connection attempt $attempt failed: $errorMessage" -Level "ERROR"
                $script:ConnectionStatus.Azure.LastError = $errorMessage
                
                if ($attempt -lt $maxRetries) {
                    Start-Sleep -Seconds 3
                }
            }
        }
        
        Write-MandALog "Failed to establish Azure connection after $maxRetries attempts" -Level "ERROR"
        $script:ConnectionStatus.Azure.Connected = $false
        return $false
        
    } catch {
        Write-MandALog "Azure connection failed: $($_.Exception.Message)" -Level "ERROR"
        $script:ConnectionStatus.Azure.Connected = $false
        $script:ConnectionStatus.Azure.LastError = $_.Exception.Message
        return $false
    }
}

function Connect-MandAExchangeEnhanced {
    param(
        [hashtable]$Configuration,
        [hashtable]$AuthContext
    )
    
    try {
        Write-MandALog "Establishing Exchange Online connection..." -Level "PROGRESS"
        
        # For Exchange, we need the AppId and TenantId from AuthContext
        if (-not $AuthContext -or -not $AuthContext.ClientId -or -not $AuthContext.TenantId) {
            Write-MandALog "Invalid or incomplete authentication context for Exchange" -Level "ERROR"
            $script:ConnectionStatus.ExchangeOnline.LastError = "Missing AppId or TenantId"
            return $false
        }
        
        # Import module
        Import-Module ExchangeOnlineManagement -Force -ErrorAction SilentlyContinue
        
        $maxRetries = $Configuration.environment.maxRetries
        $retryDelay = 5
        
        for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
            try {
                Write-MandALog "Exchange connection attempt $attempt of $maxRetries..." -Level "PROGRESS"
                
                # Check for existing session
                $existingSession = Get-PSSession | Where-Object { 
                    $_.ConfigurationName -eq "Microsoft.Exchange" -and 
                    $_.State -eq "Opened" 
                }
                
                if ($existingSession) {
                    try {
                        Invoke-Command -Session $existingSession -ScriptBlock { Get-OrganizationConfig } -ErrorAction Stop | Out-Null
                        Write-MandALog "Using existing Exchange Online session" -Level "SUCCESS"
                        $script:ConnectionStatus.ExchangeOnline.Connected = $true
                        $script:ConnectionStatus.ExchangeOnline.Session = $existingSession
                        return $true
                    } catch {
                        Write-MandALog "Existing Exchange session invalid, reconnecting..." -Level "WARN"
                        Remove-PSSession $existingSession -ErrorAction SilentlyContinue
                    }
                }
                
                Write-MandALog "Note: Exchange Online typically requires certificate authentication for app-only access" -Level "WARN"
                Write-MandALog "Attempting delegated authentication for Exchange Online..." -Level "INFO"
                
                # For now, connect with delegated permissions
                Connect-ExchangeOnline -ShowBanner:$false -ErrorAction Stop
                
                # Verify connection
                $orgConfig = Get-OrganizationConfig -ErrorAction Stop
                if (-not $orgConfig) {
                    throw "Failed to retrieve organization configuration"
                }
                
                Write-MandALog "Successfully connected to Exchange Online" -Level "SUCCESS"
                Write-MandALog "Organization: $($orgConfig.Name)" -Level "INFO"
                
                $script:ConnectionStatus.ExchangeOnline.Connected = $true
                $script:ConnectionStatus.ExchangeOnline.LastError = $null
                $script:ConnectionStatus.ExchangeOnline.ConnectedTime = Get-Date
                $script:ConnectionStatus.ExchangeOnline.Method = "Delegated"
                
                return $true
                
            } catch {
                $errorMessage = $_.Exception.Message
                Write-MandALog "Exchange connection attempt $attempt failed: $errorMessage" -Level "ERROR"
                
                $script:ConnectionStatus.ExchangeOnline.LastError = $errorMessage
                
                if ($attempt -lt $maxRetries) {
                    Write-MandALog "Retrying in $retryDelay seconds..." -Level "PROGRESS"
                    Start-Sleep -Seconds $retryDelay
                    $retryDelay += 2
                }
            }
        }
        
        Write-MandALog "Failed to establish Exchange Online connection after $maxRetries attempts" -Level "ERROR"
        Write-MandALog "Note: Exchange Online requires certificate-based authentication for app-only access" -Level "INFO"
        $script:ConnectionStatus.ExchangeOnline.Connected = $false
        return $false
        
    } catch {
        Write-MandALog "Exchange Online connection failed: $($_.Exception.Message)" -Level "ERROR"
        $script:ConnectionStatus.ExchangeOnline.Connected = $false
        $script:ConnectionStatus.ExchangeOnline.LastError = $_.Exception.Message
        return $false
    }
}

function Get-ConnectionStatus {
    return $script:ConnectionStatus
}

function Disconnect-AllServices {
    try {
        Write-MandALog "Disconnecting from all services" -Level "INFO"
        
        # Disconnect from Microsoft Graph
        if ($script:ConnectionStatus.Graph.Connected) {
            try {
                Disconnect-MgGraph -ErrorAction SilentlyContinue
                Write-MandALog "Disconnected from Microsoft Graph" -Level "SUCCESS"
            } catch {
                Write-MandALog "Error disconnecting from Graph: $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        # Disconnect from Azure
        if ($script:ConnectionStatus.Azure.Connected) {
            try {
                Disconnect-AzAccount -ErrorAction SilentlyContinue
                Write-MandALog "Disconnected from Azure" -Level "SUCCESS"
            } catch {
                Write-MandALog "Error disconnecting from Azure: $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        # Disconnect from Exchange Online
        if ($script:ConnectionStatus.ExchangeOnline.Connected) {
            try {
                Disconnect-ExchangeOnline -Confirm:$false -ErrorAction SilentlyContinue
                Write-MandALog "Disconnected from Exchange Online" -Level "SUCCESS"
            } catch {
                Write-MandALog "Error disconnecting from Exchange: $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        # Clear connection status
        foreach ($service in $script:ConnectionStatus.Keys) {
            $script:ConnectionStatus[$service].Connected = $false
            $script:ConnectionStatus[$service].Context = $null
            $script:ConnectionStatus[$service].ConnectedTime = $null
            $script:ConnectionStatus[$service].Method = $null
        }
        
        Write-MandALog "All services disconnected" -Level "SUCCESS"
        
    } catch {
        Write-MandALog "Error during service disconnection: $($_.Exception.Message)" -Level "ERROR"
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Initialize-AllConnections',
    'Connect-MandAGraphEnhanced',
    'Connect-MandAAzureEnhanced', 
    'Connect-MandAExchangeEnhanced',
    'Get-ConnectionStatus',
    'Disconnect-AllServices'
)