<#
.SYNOPSIS
    Enhanced connection manager with robust authentication fallbacks
.DESCRIPTION
    Provides multiple authentication methods and better error handling for M&A Discovery Suite
#>

# Global connection status tracking
$script:ConnectionStatus = @{
    Graph = @{ Connected = $false; LastError = $null; ConnectedTime = $null; Context = $null; Method = $null }
    Azure = @{ Connected = $false; LastError = $null; ConnectedTime = $null; Context = $null; Method = $null }
    ExchangeOnline = @{ Connected = $false; LastError = $null; ConnectedTime = $null; Context = $null; Method = $null }
}

function Initialize-AllConnections {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "🔗 Initializing service connections with enhanced authentication" -Level "HEADER"
        
        $authContext = Get-AuthenticationContext
        if (-not $authContext) {
            throw "Authentication context not available"
        }
        
        $connectionResults = @{}
        $enabledSources = $Configuration.discovery.enabledSources
        
        # Microsoft Graph connection with fallbacks
        if ($enabledSources -contains "Graph" -or $enabledSources -contains "Intune") {
            Write-MandALog "🔄 Connecting to Microsoft Graph..." -Level "PROGRESS"
            $connectionResults.Graph = Connect-MandAGraphEnhanced -AuthContext $authContext -Configuration $Configuration
        }
        
        # Azure connection with fallbacks
        if ($enabledSources -contains "Azure") {
            Write-MandALog "🔄 Connecting to Azure..." -Level "PROGRESS"
            $connectionResults.Azure = Connect-MandAAzureEnhanced -AuthContext $authContext -Configuration $Configuration
        }
        
        # Exchange Online connection with multiple methods
        if ($enabledSources -contains "Exchange") {
            Write-MandALog "🔄 Connecting to Exchange Online..." -Level "PROGRESS"
            $connectionResults.ExchangeOnline = Connect-MandAExchangeEnhanced -Configuration $Configuration
        }
        
        # Enhanced summary with visual indicators
        $connectedServices = ($connectionResults.Values | Where-Object { $_ -eq $true }).Count
        $totalServices = $connectionResults.Count
        
        Write-MandALog "══════════════════════════════════════════════════════════════════════════════════════════" -Level "HEADER"
        Write-MandALog "  🌐 CONNECTION SUMMARY" -Level "HEADER"
        Write-MandALog "  📊 Service availability status for discovery operations" -Level "HEADER"
        Write-MandALog "══════════════════════════════════════════════════════════════════════════════════════════" -Level "HEADER"
        
        # Display individual connection status with enhanced formatting
        foreach ($service in $connectionResults.GetEnumerator()) {
            $status = $script:ConnectionStatus[$service.Key]
            if ($service.Value) {
                $connectTime = if ($status.ConnectedTime) { $status.ConnectedTime.ToString("HH:mm:ss") } else { "Unknown" }
                $method = if ($status.Method) { " via $($status.Method)" } else { "" }
                Write-MandALog "✅✅ $($service.Key): Connected at $connectTime$method" -Level "SUCCESS"
            } else {
                $lastError = if ($status.LastError) { " - $($status.LastError)" } else { "" }
                Write-MandALog "❌❌ $($service.Key): Failed$lastError" -Level "ERROR"
            }
        }
        
        # Connection quality assessment
        $connectionQuality = switch ($connectedServices) {
            $totalServices { "EXCELLENT" }
            { $_ -ge ($totalServices * 0.75) } { "GOOD" }
            { $_ -ge ($totalServices * 0.5) } { "PARTIAL" }
            default { "POOR" }
        }
        
        $qualityColor = switch ($connectionQuality) {
            "EXCELLENT" { "SUCCESS" }
            "GOOD" { "SUCCESS" }
            "PARTIAL" { "WARN" }
            default { "ERROR" }
        }
        
        Write-MandALog "⚠️ Connection Summary: $connectedServices of $totalServices services connected ($connectionQuality)" -Level $qualityColor
        
        # Provide recommendations if not all services connected
        if ($connectedServices -lt $totalServices) {
            Write-MandALog "🔧 Recommended fixes:" -Level "IMPORTANT"
            if (-not $connectionResults.ExchangeOnline) {
                Write-MandALog "1. Run from a machine with direct internet access (no proxy)" -Level "IMPORTANT"
                Write-MandALog "2. Configure proxy exception for *.office365.com" -Level "IMPORTANT"
                Write-MandALog "3. Run as administrator to ensure proper network access" -Level "IMPORTANT"
                Write-MandALog "4. Try: netsh winhttp reset proxy" -Level "IMPORTANT"
                Write-MandALog "5. Ensure Windows Remote Management (WinRM) service is running" -Level "IMPORTANT"
            }
        }
        
        return ($connectedServices -ge 1)
        
    } catch {
        Write-MandALog "Connection initialization failed: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Connect-MandAGraphEnhanced {
    param(
        [hashtable]$AuthContext,
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "🔄 Establishing Microsoft Graph connection..." -Level "PROGRESS"
        
        # Check if Microsoft.Graph modules are available
        $requiredModules = @("Microsoft.Graph.Authentication", "Microsoft.Graph.Users", "Microsoft.Graph.Groups")
        foreach ($module in $requiredModules) {
            if (-not (Get-Module -ListAvailable -Name $module)) {
                Write-MandALog "❌ Required module not available: $module" -Level "ERROR"
                $script:ConnectionStatus.Graph.LastError = "Missing module: $module"
                return $false
            }
        }
        
        # Import required modules
        Import-Module Microsoft.Graph.Authentication -Force -ErrorAction SilentlyContinue
        Import-Module Microsoft.Graph.Users -Force -ErrorAction SilentlyContinue
        Import-Module Microsoft.Graph.Groups -Force -ErrorAction SilentlyContinue
        
        $maxRetries = $Configuration.environment.maxRetries
        $retryDelay = 5
        
        for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
            try {
                Write-MandALog "🔄 Graph connection attempt $attempt of $maxRetries..." -Level "PROGRESS"
                
                # Check for existing valid connection
                $existingContext = Get-MgContext -ErrorAction SilentlyContinue
                if ($existingContext -and $existingContext.ClientId -eq $AuthContext.ClientId) {
                    try {
                        $org = Get-MgOrganization -Top 1 -ErrorAction Stop
                        Write-MandALog "✅ Using existing valid Graph connection" -Level "SUCCESS"
                        $script:ConnectionStatus.Graph.Connected = $true
                        $script:ConnectionStatus.Graph.Context = $existingContext
                        $script:ConnectionStatus.Graph.ConnectedTime = Get-Date
                        $script:ConnectionStatus.Graph.Method = "Existing Session"
                        
                        # Display organization info
                        Write-MandALog "ℹ️   Organization: $($org.DisplayName)" -Level "INFO"
                        Write-MandALog "ℹ️   Tenant ID: $($existingContext.TenantId)" -Level "INFO"
                        
                        # Get and display scopes
                        $scopes = $existingContext.Scopes
                        Write-MandALog "ℹ️   Scopes: $($scopes.Count) granted" -Level "INFO"
                        
                        return $true
                    } catch {
                        Write-MandALog "⚠️ Existing connection invalid, reconnecting..." -Level "WARN"
                        Disconnect-MgGraph -ErrorAction SilentlyContinue
                    }
                }
                
                # Try multiple authentication methods
                $authMethods = @(
                    @{ Name = "Client Secret"; Method = "ClientSecret" },
                    @{ Name = "Certificate"; Method = "Certificate" },
                    @{ Name = "Interactive"; Method = "Interactive" }
                )
                
                foreach ($authMethod in $authMethods) {
                    try {
                        Write-MandALog "🔐 Attempting $($authMethod.Name) authentication..." -Level "INFO"
                        
                        switch ($authMethod.Method) {
                            "ClientSecret" {
                                if ($AuthContext.ClientSecret) {
                                    $secureSecret = ConvertTo-SecureString $AuthContext.ClientSecret -AsPlainText -Force
                                    $clientCredential = New-Object System.Management.Automation.PSCredential ($AuthContext.ClientId, $secureSecret)
                                    Connect-MgGraph -ClientSecretCredential $clientCredential -TenantId $AuthContext.TenantId -NoWelcome -ErrorAction Stop
                                    $script:ConnectionStatus.Graph.Method = "Client Secret"
                                }
                            }
                            "Certificate" {
                                if ($Configuration.authentication.certificateThumbprint) {
                                    Connect-MgGraph -ClientId $AuthContext.ClientId -TenantId $AuthContext.TenantId -CertificateThumbprint $Configuration.authentication.certificateThumbprint -NoWelcome -ErrorAction Stop
                                    $script:ConnectionStatus.Graph.Method = "Certificate"
                                }
                            }
                            "Interactive" {
                                if ($Configuration.authentication.useInteractiveAuth) {
                                    Connect-MgGraph -ClientId $AuthContext.ClientId -TenantId $AuthContext.TenantId -NoWelcome -ErrorAction Stop
                                    $script:ConnectionStatus.Graph.Method = "Interactive"
                                }
                            }
                        }
                        
                        # Verify connection
                        $context = Get-MgContext -ErrorAction Stop
                        if (-not $context) {
                            throw "Failed to establish Graph context"
                        }
                        
                        # Test functionality
                        $org = Get-MgOrganization -Top 1 -ErrorAction Stop
                        if (-not $org) {
                            throw "Cannot access organization data"
                        }
                        
                        Write-MandALog "✅✅ Successfully connected to Microsoft Graph" -Level "SUCCESS"
                        Write-MandALog "ℹ️   Organization: $($org.DisplayName)" -Level "INFO"
                        Write-MandALog "ℹ️   Tenant ID: $($context.TenantId)" -Level "INFO"
                        
                        # Get and display scopes
                        $scopes = $context.Scopes
                        Write-MandALog "ℹ️   Scopes: $($scopes.Count) granted" -Level "INFO"
                        
                        $script:ConnectionStatus.Graph.Connected = $true
                        $script:ConnectionStatus.Graph.Context = $context
                        $script:ConnectionStatus.Graph.LastError = $null
                        $script:ConnectionStatus.Graph.ConnectedTime = Get-Date
                        
                        return $true
                        
                    } catch {
                        Write-MandALog "❌ $($authMethod.Name) authentication failed: $($_.Exception.Message)" -Level "WARN"
                        continue
                    }
                }
                
            } catch {
                $errorMessage = $_.Exception.Message
                Write-MandALog "❌ Graph connection attempt $attempt failed: $errorMessage" -Level "ERROR"
                
                $script:ConnectionStatus.Graph.LastError = $errorMessage
                
                if ($attempt -lt $maxRetries) {
                    Write-MandALog "⏳ Retrying in $retryDelay seconds..." -Level "INFO"
                    Start-Sleep -Seconds $retryDelay
                    $retryDelay += 2
                }
            }
        }
        
        Write-MandALog "❌ Failed to establish Graph connection after $maxRetries attempts" -Level "ERROR"
        $script:ConnectionStatus.Graph.Connected = $false
        return $false
        
    } catch {
        Write-MandALog "❌ Graph connection error: $($_.Exception.Message)" -Level "ERROR"
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
        Write-MandALog "🔄 Establishing Azure connection..." -Level "PROGRESS"
        
        # Check if Az modules are available
        if (-not (Get-Module -ListAvailable -Name "Az.Accounts")) {
            Write-MandALog "❌ Az.Accounts module not available" -Level "ERROR"
            $script:ConnectionStatus.Azure.LastError = "Missing Az.Accounts module"
            return $false
        }
        
        Import-Module Az.Accounts -Force -ErrorAction SilentlyContinue
        
        $maxRetries = $Configuration.environment.maxRetries
        
        for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
            try {
                Write-MandALog "🔄 Azure connection attempt $attempt of $maxRetries..." -Level "PROGRESS"
                
                # Try multiple authentication methods
                $authMethods = @(
                    @{ Name = "Service Principal"; Method = "ServicePrincipal" },
                    @{ Name = "Managed Identity"; Method = "ManagedIdentity" },
                    @{ Name = "Interactive"; Method = "Interactive" }
                )
                
                foreach ($authMethod in $authMethods) {
                    try {
                        Write-MandALog "🔐 Attempting $($authMethod.Name) authentication..." -Level "INFO"
                        
                        $azContext = $null
                        switch ($authMethod.Method) {
                            "ServicePrincipal" {
                                if ($AuthContext.ClientSecret) {
                                    $secureSecret = ConvertTo-SecureString $AuthContext.ClientSecret -AsPlainText -Force
                                    $credential = New-Object System.Management.Automation.PSCredential ($AuthContext.ClientId, $secureSecret)
                                    $azContext = Connect-AzAccount -ServicePrincipal -Credential $credential -TenantId $AuthContext.TenantId -ErrorAction Stop
                                    $script:ConnectionStatus.Azure.Method = "Service Principal"
                                }
                            }
                            "ManagedIdentity" {
                                try {
                                    $azContext = Connect-AzAccount -Identity -ErrorAction Stop
                                    $script:ConnectionStatus.Azure.Method = "Managed Identity"
                                } catch {
                                    # Managed Identity not available, continue to next method
                                    continue
                                }
                            }
                            "Interactive" {
                                if ($Configuration.authentication.useInteractiveAuth) {
                                    $azContext = Connect-AzAccount -TenantId $AuthContext.TenantId -ErrorAction Stop
                                    $script:ConnectionStatus.Azure.Method = "Interactive"
                                }
                            }
                        }
                        
                        if ($azContext) {
                            Write-MandALog "✅✅ Successfully connected to Azure" -Level "SUCCESS"
                            Write-MandALog "ℹ️   Tenant: $($azContext.Context.Tenant.Id)" -Level "INFO"
                            
                            # Get subscription information
                            $subscriptions = Get-AzSubscription -ErrorAction SilentlyContinue
                            if ($subscriptions) {
                                $totalSubs = $subscriptions.Count
                                $activeSubs = ($subscriptions | Where-Object { $_.State -eq "Enabled" }).Count
                                Write-MandALog "ℹ️   Total Subscriptions: $totalSubs" -Level "INFO"
                                Write-MandALog "ℹ️   Active Subscriptions: $activeSubs" -Level "INFO"
                                
                                # Set context to first active subscription
                                $activeSubscription = $subscriptions | Where-Object { $_.State -eq "Enabled" } | Select-Object -First 1
                                if ($activeSubscription) {
                                    Set-AzContext -SubscriptionId $activeSubscription.Id -ErrorAction SilentlyContinue
                                    Write-MandALog "ℹ️ Selected subscription: $($activeSubscription.Name)" -Level "INFO"
                                }
                            }
                            
                            $script:ConnectionStatus.Azure.Connected = $true
                            $script:ConnectionStatus.Azure.Context = $azContext
                            $script:ConnectionStatus.Azure.LastError = $null
                            $script:ConnectionStatus.Azure.ConnectedTime = Get-Date
                            
                            return $true
                        }
                        
                    } catch {
                        Write-MandALog "❌ $($authMethod.Name) authentication failed: $($_.Exception.Message)" -Level "WARN"
                        continue
                    }
                }
                
            } catch {
                $errorMessage = $_.Exception.Message
                Write-MandALog "❌ Azure connection attempt $attempt failed: $errorMessage" -Level "ERROR"
                $script:ConnectionStatus.Azure.LastError = $errorMessage
                
                if ($attempt -lt $maxRetries) {
                    Start-Sleep -Seconds 3
                }
            }
        }
        
        Write-MandALog "❌ Failed to establish Azure connection after $maxRetries attempts" -Level "ERROR"
        $script:ConnectionStatus.Azure.Connected = $false
        return $false
        
    } catch {
        Write-MandALog "❌ Azure connection failed: $($_.Exception.Message)" -Level "ERROR"
        $script:ConnectionStatus.Azure.Connected = $false
        $script:ConnectionStatus.Azure.LastError = $_.Exception.Message
        return $false
    }
}

function Connect-MandAExchangeEnhanced {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "🔄 Establishing Exchange Online connection..." -Level "PROGRESS"
        
        # Check if ExchangeOnlineManagement module is available
        if (-not (Get-Module -ListAvailable -Name "ExchangeOnlineManagement")) {
            Write-MandALog "❌ ExchangeOnlineManagement module not available" -Level "ERROR"
            $script:ConnectionStatus.ExchangeOnline.LastError = "Missing ExchangeOnlineManagement module"
            return $false
        }
        
        Import-Module ExchangeOnlineManagement -Force -ErrorAction SilentlyContinue
        
        $authContext = Get-AuthenticationContext
        $maxRetries = $Configuration.environment.maxRetries
        
        # Enhanced connectivity diagnostics
        Write-MandALog "ℹ️ Checking proxy configuration..." -Level "INFO"
        $proxyInfo = Get-ProxyConfiguration
        if ($proxyInfo.HasProxy) {
            Write-MandALog "⚠️ Proxy detected: $($proxyInfo.ProxyServer)" -Level "WARN"
        } else {
            Write-MandALog "ℹ️ No proxy detected" -Level "INFO"
        }
        
        # Try multiple connection methods
        $connectionMethods = @(
            @{ Name = "Modern Auth with Proxy Bypass"; Method = "ModernAuthBypass" },
            @{ Name = "WinRM Proxy Configuration"; Method = "WinRMProxy" },
            @{ Name = "Direct Connection"; Method = "Direct" },
            @{ Name = "Manual Remote PowerShell"; Method = "ManualRemote" }
        )
        
        foreach ($method in $connectionMethods) {
            try {
                Write-MandALog "ℹ️ Attempting $($method.Name)..." -Level "INFO"
                
                switch ($method.Method) {
                    "ModernAuthBypass" {
                        # Try modern auth with proxy bypass
                        if ($authContext.ClientSecret) {
                            $connectParams = @{
                                AppId = $authContext.ClientId
                                ClientSecret = $authContext.ClientSecret
                                Organization = $authContext.TenantId
                                ShowBanner = $false
                                ErrorAction = "Stop"
                            }
                            
                            # Set proxy bypass for Exchange Online
                            $env:HTTPS_PROXY = ""
                            $env:HTTP_PROXY = ""
                            
                            Connect-ExchangeOnline @connectParams
                            $script:ConnectionStatus.ExchangeOnline.Method = "Modern Auth with Proxy Bypass"
                        }
                    }
                    "WinRMProxy" {
                        # Configure WinRM proxy settings
                        try {
                            $winrmConfig = winhttp show proxy
                            if ($winrmConfig -match "Direct access") {
                                # Try with explicit proxy configuration
                                Connect-ExchangeOnline -AppId $authContext.ClientId -ClientSecret $authContext.ClientSecret -Organization $authContext.TenantId -ShowBanner:$false -ErrorAction Stop
                                $script:ConnectionStatus.ExchangeOnline.Method = "WinRM Proxy Configuration"
                            }
                        } catch {
                            throw "WinRM proxy configuration failed"
                        }
                    }
                    "Direct" {
                        # Direct connection without proxy considerations
                        Connect-ExchangeOnline -AppId $authContext.ClientId -ClientSecret $authContext.ClientSecret -Organization $authContext.TenantId -ShowBanner:$false -ErrorAction Stop
                        $script:ConnectionStatus.ExchangeOnline.Method = "Direct Connection"
                    }
                    "ManualRemote" {
                        # Manual remote PowerShell session
                        $sessionOption = New-PSSessionOption -ProxyAccessType NoProxyServer
                        $session = New-PSSession -ConfigurationName Microsoft.Exchange -ConnectionUri "https://ps.outlook.com/powershell/" -Credential (Get-Credential) -Authentication Basic -AllowRedirection -SessionOption $sessionOption -ErrorAction Stop
                        Import-PSSession $session -DisableNameChecking -ErrorAction Stop
                        $script:ConnectionStatus.ExchangeOnline.Method = "Manual Remote PowerShell"
                    }
                }
                
                # Test connection
                $mailboxCount = (Get-Mailbox -ResultSize 1 -ErrorAction Stop | Measure-Object).Count
                
                Write-MandALog "✅✅ Successfully connected to Exchange Online" -Level "SUCCESS"
                Write-MandALog "ℹ️   Connection Method: $($method.Name)" -Level "INFO"
                
                $script:ConnectionStatus.ExchangeOnline.Connected = $true
                $script:ConnectionStatus.ExchangeOnline.LastError = $null
                $script:ConnectionStatus.ExchangeOnline.ConnectedTime = Get-Date
                
                return $true
                
            } catch {
                $errorMessage = $_.Exception.Message
                Write-MandALog "❌❌ $($method.Name) failed: $errorMessage" -Level "ERROR"
                $script:ConnectionStatus.ExchangeOnline.LastError = $errorMessage
                continue
            }
        }
        
        # If all methods failed, run connectivity verification
        Write-MandALog "ℹ️ Running final connectivity verification..." -Level "INFO"
        Test-ExchangeConnectivity
        
        Write-MandALog "❌ All Exchange Online connection methods failed" -Level "ERROR"
        $script:ConnectionStatus.ExchangeOnline.Connected = $false
        return $false
        
    } catch {
        Write-MandALog "❌ Exchange Online connection failed: $($_.Exception.Message)" -Level "ERROR"
        $script:ConnectionStatus.ExchangeOnline.Connected = $false
        $script:ConnectionStatus.ExchangeOnline.LastError = $_.Exception.Message
        return $false
    }
}

function Get-ProxyConfiguration {
    try {
        $proxyInfo = @{
            HasProxy = $false
            ProxyServer = $null
            IEProxy = $null
            WinHTTP = $null
        }
        
        # Check IE proxy settings
        $ieProxy = netsh winhttp show proxy 2>$null
        if ($ieProxy -match "Proxy Server\(s\)\s*:\s*(.+)") {
            $proxyInfo.IEProxy = $matches[1].Trim()
            $proxyInfo.HasProxy = $true
        }
        
        # Check WinHTTP proxy settings
        $winHttpProxy = (netsh winhttp show proxy | Out-String)
        $proxyInfo.WinHTTP = $winHttpProxy.Trim()
        
        return $proxyInfo
    } catch {
        return @{ HasProxy = $false; ProxyServer = $null; IEProxy = $null; WinHTTP = "Unable to determine" }
    }
}

function Test-ExchangeConnectivity {
    Write-MandALog "ℹ️ Running connectivity diagnostics..." -Level "INFO"
    
    $endpoints = @(
        @{ Name = "Exchange Online"; Host = "outlook.office365.com"; Port = 443 },
        @{ Name = "Exchange PS"; Host = "ps.outlook.com"; Port = 443 },
        @{ Name = "Azure AD"; Host = "login.microsoftonline.com"; Port = 443 }
    )
    
    foreach ($endpoint in $endpoints) {
        try {
            $connection = Test-NetConnection -ComputerName $endpoint.Host -Port $endpoint.Port -InformationLevel Quiet -WarningAction SilentlyContinue
            if ($connection) {
                Write-MandALog "✅✅ ✓ Can reach $($endpoint.Name)" -Level "SUCCESS"
            } else {
                Write-MandALog "❌ ✗ Cannot reach $($endpoint.Name)" -Level "ERROR"
            }
        } catch {
            Write-MandALog "❌ ✗ Error testing $($endpoint.Name): $($_.Exception.Message)" -Level "ERROR"
        }
    }
    
    # Display proxy configuration
    $proxyInfo = Get-ProxyConfiguration
    Write-MandALog "ℹ️  Proxy Configuration:" -Level "INFO"
    Write-MandALog "ℹ️   IE Proxy: $($proxyInfo.IEProxy)" -Level "INFO"
    Write-MandALog "ℹ️   WinHTTP:  $($proxyInfo.WinHTTP)" -Level "INFO"
}

function Get-ConnectionStatus {
    return $script:ConnectionStatus
}

function Disconnect-AllServices {
    try {
        Write-MandALog "🔌 Disconnecting from all services" -Level "INFO"
        
        # Disconnect from Microsoft Graph
        if ($script:ConnectionStatus.Graph.Connected) {
            try {
                Disconnect-MgGraph -ErrorAction SilentlyContinue
                Write-MandALog "✅ Disconnected from Microsoft Graph" -Level "SUCCESS"
            } catch {
                Write-MandALog "⚠️ Error disconnecting from Graph: $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        # Disconnect from Azure
        if ($script:ConnectionStatus.Azure.Connected) {
            try {
                Disconnect-AzAccount -ErrorAction SilentlyContinue
                Write-MandALog "✅ Disconnected from Azure" -Level "SUCCESS"
            } catch {
                Write-MandALog "⚠️ Error disconnecting from Azure: $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        # Disconnect from Exchange Online
        if ($script:ConnectionStatus.ExchangeOnline.Connected) {
            try {
                Disconnect-ExchangeOnline -Confirm:$false -ErrorAction SilentlyContinue
                Write-MandALog "✅ Disconnected from Exchange Online" -Level "SUCCESS"
            } catch {
                Write-MandALog "⚠️ Error disconnecting from Exchange: $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        # Clear connection status
        foreach ($service in $script:ConnectionStatus.Keys) {
            $script:ConnectionStatus[$service].Connected = $false
            $script:ConnectionStatus[$service].Context = $null
            $script:ConnectionStatus[$service].ConnectedTime = $null
            $script:ConnectionStatus[$service].Method = $null
        }
        
        Write-MandALog "✅ All services disconnected" -Level "SUCCESS"
        
    } catch {
        Write-MandALog "❌ Error during service disconnection: $($_.Exception.Message)" -Level "ERROR"
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Initialize-AllConnections',
    'Connect-MandAGraphEnhanced',
    'Connect-MandAAzureEnhanced', 
    'Connect-MandAExchangeEnhanced',
    'Get-ConnectionStatus',
    'Disconnect-AllServices',
    'Test-ExchangeConnectivity'
)