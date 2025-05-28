<#
.SYNOPSIS
    Centralized connection orchestration for M&A Discovery Suite
.DESCRIPTION
    Manages connections to all required services and provides unified status monitoring
#>

# Global connection status tracking
$script:ConnectionStatus = @{
    Graph = @{ Connected = $false; LastError = $null; ConnectedTime = $null; Context = $null }
    Azure = @{ Connected = $false; LastError = $null; ConnectedTime = $null; Context = $null }
    ExchangeOnline = @{ Connected = $false; LastError = $null; ConnectedTime = $null; Context = $null }
}

function Initialize-AllConnections {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Initializing service connections" -Level "HEADER"
        
        $authContext = Get-AuthenticationContext
        if (-not $authContext) {
            throw "Authentication context not available"
        }
        
        $connectionResults = @{}
        $enabledSources = $Configuration.discovery.enabledSources
        
        # Microsoft Graph connection
        if ($enabledSources -contains "Graph" -or $enabledSources -contains "Intune") {
            Write-MandALog "Connecting to Microsoft Graph..." -Level "INFO"
            $connectionResults.Graph = Connect-MandAGraph -AuthContext $authContext -Configuration $Configuration
        }
        
        # Azure connection
        if ($enabledSources -contains "Azure") {
            Write-MandALog "Connecting to Azure..." -Level "INFO"
            $connectionResults.Azure = Connect-MandAAzure -AuthContext $authContext -Configuration $Configuration
        }
        
        # Exchange Online connection
        if ($enabledSources -contains "Exchange") {
            Write-MandALog "Connecting to Exchange Online..." -Level "INFO"
            $connectionResults.ExchangeOnline = Connect-MandAExchange -Configuration $Configuration
        }
        
        # Summary
        $connectedServices = ($connectionResults.Values | Where-Object { $_ -eq $true }).Count
        $totalServices = $connectionResults.Count
        
        Write-MandALog "Connection Summary: $connectedServices of $totalServices services connected" -Level $(if ($connectedServices -eq $totalServices) { "SUCCESS" } elseif ($connectedServices -gt 0) { "WARN" } else { "ERROR" })
        
        # Display individual connection status
        foreach ($service in $connectionResults.GetEnumerator()) {
            $status = $script:ConnectionStatus[$service.Key]
            if ($service.Value) {
                $connectTime = if ($status.ConnectedTime) { $status.ConnectedTime.ToString("HH:mm:ss") } else { "Unknown" }
                Write-MandALog "$($service.Key): Connected at $connectTime" -Level "SUCCESS"
            } else {
                $lastError = if ($status.LastError) { " - $($status.LastError)" } else { "" }
                Write-MandALog "$($service.Key): Failed$lastError" -Level "ERROR"
            }
        }
        
        return ($connectedServices -ge 1)
        
    } catch {
        Write-MandALog "Connection initialization failed: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Connect-MandAGraph {
    param(
        [hashtable]$AuthContext,
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "Establishing Microsoft Graph connection..." -Level "INFO"
        
        # Check if Microsoft.Graph modules are available
        $requiredModules = @("Microsoft.Graph.Authentication", "Microsoft.Graph.Users", "Microsoft.Graph.Groups")
        foreach ($module in $requiredModules) {
            if (-not (Get-Module -ListAvailable -Name $module)) {
                Write-MandALog "Required module not available: $module" -Level "ERROR"
                $script:ConnectionStatus.Graph.LastError = "Missing module: $module"
                return $false
            }
        }
        
        # Import required modules
        Import-Module Microsoft.Graph.Authentication -Force
        Import-Module Microsoft.Graph.Users -Force
        Import-Module Microsoft.Graph.Groups -Force
        
        $maxRetries = $Configuration.environment.maxRetries
        $retryDelay = 5
        
        for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
            try {
                Write-MandALog "Graph connection attempt $attempt of $maxRetries..." -Level "INFO"
                
                # Check for existing valid connection
                $existingContext = Get-MgContext -ErrorAction SilentlyContinue
                if ($existingContext -and $existingContext.ClientId -eq $AuthContext.ClientId) {
                    try {
                        Get-MgOrganization -Top 1 -ErrorAction Stop | Out-Null
                        Write-MandALog "Using existing valid Graph connection" -Level "SUCCESS"
                        $script:ConnectionStatus.Graph.Connected = $true
                        $script:ConnectionStatus.Graph.Context = $existingContext
                        $script:ConnectionStatus.Graph.ConnectedTime = Get-Date
                        return $true
                    } catch {
                        Write-MandALog "Existing connection invalid, reconnecting..." -Level "WARN"
                        Disconnect-MgGraph -ErrorAction SilentlyContinue
                    }
                }
                
                # Create new connection
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
                if (-not $org) {
                    throw "Cannot access organization data"
                }
                
                Write-MandALog "Successfully connected to Microsoft Graph" -Level "SUCCESS"
                Write-MandALog "  Organization: $($org.DisplayName)" -Level "INFO"
                Write-MandALog "  Tenant ID: $($context.TenantId)" -Level "INFO"
                
                $script:ConnectionStatus.Graph.Connected = $true
                $script:ConnectionStatus.Graph.Context = $context
                $script:ConnectionStatus.Graph.LastError = $null
                $script:ConnectionStatus.Graph.ConnectedTime = Get-Date
                
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

function Connect-MandAAzure {
    param(
        [hashtable]$AuthContext,
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "Establishing Azure connection..." -Level "INFO"
        
        # Check if Az modules are available
        if (-not (Get-Module -ListAvailable -Name "Az.Accounts")) {
            Write-MandALog "Az.Accounts module not available" -Level "ERROR"
            $script:ConnectionStatus.Azure.LastError = "Missing Az.Accounts module"
            return $false
        }
        
        Import-Module Az.Accounts -Force
        
        # Create credential object
        $secureSecret = ConvertTo-SecureString $AuthContext.ClientSecret -AsPlainText -Force
        $credential = New-Object System.Management.Automation.PSCredential ($AuthContext.ClientId, $secureSecret)
        
        # Connect to Azure
        $azContext = Connect-AzAccount -ServicePrincipal -Credential $credential -TenantId $AuthContext.TenantId -ErrorAction Stop
        
        if ($azContext) {
            Write-MandALog "Successfully connected to Azure" -Level "SUCCESS"
            Write-MandALog "  Subscription: $($azContext.Context.Subscription.Name)" -Level "INFO"
            
            $script:ConnectionStatus.Azure.Connected = $true
            $script:ConnectionStatus.Azure.Context = $azContext
            $script:ConnectionStatus.Azure.LastError = $null
            $script:ConnectionStatus.Azure.ConnectedTime = Get-Date
            
            return $true
        }
        
        return $false
        
    } catch {
        Write-MandALog "Azure connection failed: $($_.Exception.Message)" -Level "ERROR"
        $script:ConnectionStatus.Azure.Connected = $false
        $script:ConnectionStatus.Azure.LastError = $_.Exception.Message
        return $false
    }
}

function Connect-MandAExchange {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Establishing Exchange Online connection..." -Level "INFO"
        
        # Check if ExchangeOnlineManagement module is available
        if (-not (Get-Module -ListAvailable -Name "ExchangeOnlineManagement")) {
            Write-MandALog "ExchangeOnlineManagement module not available" -Level "ERROR"
            $script:ConnectionStatus.ExchangeOnline.LastError = "Missing ExchangeOnlineManagement module"
            return $false
        }
        
        Import-Module ExchangeOnlineManagement -Force
        
        $authContext = Get-AuthenticationContext
        
        # Connect using app-only authentication
        Connect-ExchangeOnline -AppId $authContext.ClientId -ClientSecret $authContext.ClientSecret -Organization "$($authContext.TenantId)" -ShowBanner:$false -ErrorAction Stop
        
        # Test connection
        Get-Mailbox -ResultSize 1 -ErrorAction Stop | Out-Null
        
        Write-MandALog "Successfully connected to Exchange Online" -Level "SUCCESS"
        
        $script:ConnectionStatus.ExchangeOnline.Connected = $true
        $script:ConnectionStatus.ExchangeOnline.LastError = $null
        $script:ConnectionStatus.ExchangeOnline.ConnectedTime = Get-Date
        
        return $true
        
    } catch {
        Write-MandALog "Exchange Online connection failed: $($_.Exception.Message)" -Level "ERROR"
        $script:ConnectionStatus.ExchangeOnline.Connected = $false
        $script:ConnectionStatus.ExchangeOnline.LastError = $_.Exception.Message
        return $false
    }
}

function Test-ServiceConnectivity {
    param([hashtable]$Configuration)
    
    $connectivityResults = @{}
    
    # Test network connectivity to required endpoints
    $endpoints = @(
        @{ Name = "Microsoft Graph"; Host = "graph.microsoft.com"; Port = 443 },
        @{ Name = "Azure Management"; Host = "management.azure.com"; Port = 443 },
        @{ Name = "Exchange Online"; Host = "outlook.office365.com"; Port = 443 },
        @{ Name = "Azure AD"; Host = "login.microsoftonline.com"; Port = 443 }
    )
    
    foreach ($endpoint in $endpoints) {
        try {
            $connection = Test-NetConnection -ComputerName $endpoint.Host -Port $endpoint.Port -InformationLevel Quiet -WarningAction SilentlyContinue
            $connectivityResults[$endpoint.Name] = $connection
            
            if ($connection) {
                Write-MandALog "Connectivity to $($endpoint.Name): Available" -Level "SUCCESS"
            } else {
                Write-MandALog "Connectivity to $($endpoint.Name): Failed" -Level "ERROR"
            }
        } catch {
            $connectivityResults[$endpoint.Name] = $false
            Write-MandALog "Connectivity test failed for $($endpoint.Name): $($_.Exception.Message)" -Level "ERROR"
        }
    }
    
    return $connectivityResults
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
        }
        
        Write-MandALog "All services disconnected" -Level "SUCCESS"
        
    } catch {
        Write-MandALog "Error during service disconnection: $($_.Exception.Message)" -Level "ERROR"
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Initialize-AllConnections',
    'Connect-MandAGraph',
    'Connect-MandAAzure', 
    'Connect-MandAExchange',
    'Test-ServiceConnectivity',
    'Get-ConnectionStatus',
    'Disconnect-AllServices'
)