<#
.SYNOPSIS
    Environment Detection Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Detects the type of environment (Cloud-only, Hybrid, On-prem only) and gathers
    environment configuration information including AD Connect status and identity mapping.
.NOTES
    Version: 2.0.0 (Fixed - Added Invoke function)
    Date: 2025-06-02
#>

#Requires -Modules ActiveDirectory

# --- Helper Functions ---
function Export-DataToCSV {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [object[]]$Data,
        [Parameter(Mandatory=$true)]
        [string]$FilePath
    )
    
    if ($null -eq $Data -or $Data.Count -eq 0) {
        Write-MandALog "No data to export to $FilePath" -Level "WARN"
        return
    }
    
    try {
        $Data | Export-Csv -Path $FilePath -NoTypeInformation -Encoding UTF8
        Write-MandALog "Exported $($Data.Count) records to $FilePath" -Level "SUCCESS"
    } catch {
        Write-MandALog "Failed to export data to $FilePath $($_.Exception.Message)" -Level "ERROR"
    }
}

# --- Main Detection Function ---
function Get-EnvironmentType {
    param([hashtable]$Configuration)
    
    $environmentInfo = @{
        Type = "Unknown"
        HasOnPremAD = $false
        HasAzureAD = $false
        HasADConnect = $false
        ADConnectStatus = $null
        SyncedDomains = @()
        OnPremDomains = @()
        CloudOnlyDomains = @()
        ADConnectServers = @()
        LastSyncTime = $null
        SyncErrors = @()
        UserCorrelation = @{
            Method = "None"
            IdentityMapping = @{}
            TotalOnPremUsers = 0
            TotalCloudUsers = 0
            SyncedUsers = 0
            CloudOnlyUsers = 0
            OnPremOnlyUsers = 0
        }
        EnvironmentDetails = @{
            ADForestName = $null
            ADForestMode = $null
            ADDomainCount = 0
            AzureTenantId = $null
            AzureTenantName = $null
            GraphAPIConnected = $false
            ExchangeOnlineConnected = $false
            SharePointOnlineConnected = $false
            TeamsConnected = $false
        }
        DiscoveredAt = Get-Date
    }
    
    # Check for on-prem AD
    try {
        Write-MandALog "Checking for on-premises Active Directory..." -Level "INFO"
        $adDomain = Get-ADDomain -ErrorAction Stop
        $adForest = Get-ADForest -ErrorAction Stop
        
        $environmentInfo.HasOnPremAD = $true
        $environmentInfo.OnPremDomains += $adDomain.DNSRoot
        $environmentInfo.EnvironmentDetails.ADForestName = $adForest.Name
        $environmentInfo.EnvironmentDetails.ADForestMode = $adForest.ForestMode
        $environmentInfo.EnvironmentDetails.ADDomainCount = ($adForest.Domains | Measure-Object).Count
        
        # Get user count
        try {
            $adUsers = Get-ADUser -Filter * -ErrorAction Stop
            $environmentInfo.UserCorrelation.TotalOnPremUsers = ($adUsers | Measure-Object).Count
        } catch {
            Write-MandALog "Could not retrieve AD user count: $($_.Exception.Message)" -Level "WARN"
        }
        
        Write-MandALog "On-premises AD detected: $($adDomain.DNSRoot)" -Level "SUCCESS"
    } catch {
        Write-MandALog "No on-premises AD detected or not accessible: $($_.Exception.Message)" -Level "INFO"
    }
    
    # Check for Azure AD / Microsoft Graph
    try {
        Write-MandALog "Checking for Azure AD / Microsoft Graph connection..." -Level "INFO"
        $mgContext = Get-MgContext -ErrorAction SilentlyContinue
        
        if ($mgContext) {
            $environmentInfo.HasAzureAD = $true
            $environmentInfo.EnvironmentDetails.GraphAPIConnected = $true
            $environmentInfo.EnvironmentDetails.AzureTenantId = $mgContext.TenantId
            
            # Get organization details
            try {
                $org = Get-MgOrganization -ErrorAction Stop
                if ($org) {
                    $environmentInfo.EnvironmentDetails.AzureTenantName = $org.DisplayName
                    
                    # Check for directory sync
                    if ($org.OnPremisesSyncEnabled) {
                        $environmentInfo.HasADConnect = $true
                        $environmentInfo.ADConnectStatus = "Enabled"
                        $environmentInfo.LastSyncTime = $org.OnPremisesLastSyncDateTime
                    }
                }
            } catch {
                Write-MandALog "Could not retrieve organization details: $($_.Exception.Message)" -Level "WARN"
            }
            
            # Get verified domains
            try {
                $domains = Get-MgDomain -ErrorAction Stop
                foreach ($domain in $domains) {
                    if ($domain.AuthenticationType -eq "Federated") {
                        $environmentInfo.SyncedDomains += $domain.Id
                    } elseif ($domain.AuthenticationType -eq "Managed") {
                        if ($domain.IsVerified) {
                            $environmentInfo.CloudOnlyDomains += $domain.Id
                        }
                    }
                }
            } catch {
                Write-MandALog "Could not retrieve domain information: $($_.Exception.Message)" -Level "WARN"
            }
            
            # Get user count and sync status
            try {
                $cloudUsers = Get-MgUser -All -Property OnPremisesSyncEnabled,UserPrincipalName -ErrorAction Stop
                $environmentInfo.UserCorrelation.TotalCloudUsers = ($cloudUsers | Measure-Object).Count
                $environmentInfo.UserCorrelation.SyncedUsers = ($cloudUsers | Where-Object { $_.OnPremisesSyncEnabled -eq $true } | Measure-Object).Count
                $environmentInfo.UserCorrelation.CloudOnlyUsers = ($cloudUsers | Where-Object { $_.OnPremisesSyncEnabled -ne $true } | Measure-Object).Count
            } catch {
                Write-MandALog "Could not retrieve cloud user statistics: $($_.Exception.Message)" -Level "WARN"
            }
            
            Write-MandALog "Azure AD detected: Tenant $($environmentInfo.EnvironmentDetails.AzureTenantName)" -Level "SUCCESS"
        } else {
            Write-MandALog "No Azure AD / Microsoft Graph connection detected" -Level "INFO"
        }
    } catch {
        Write-MandALog "Error checking Azure AD: $($_.Exception.Message)" -Level "WARN"
    }
    
    # Check for AD Connect servers if on-prem AD exists
    if ($environmentInfo.HasOnPremAD -and $environmentInfo.HasADConnect) {
        try {
            Write-MandALog "Searching for AD Connect servers..." -Level "INFO"
            
            # Search for computers with AD Connect installed
            $adConnectServers = Get-ADComputer -Filter {ServicePrincipalName -like "*ADSync*"} -Properties OperatingSystem,Description -ErrorAction SilentlyContinue
            
            if ($adConnectServers) {
                foreach ($server in $adConnectServers) {
                    $environmentInfo.ADConnectServers += [PSCustomObject]@{
                        ServerName = $server.Name
                        DNSHostName = $server.DNSHostName
                        OperatingSystem = $server.OperatingSystem
                        Description = $server.Description
                    }
                }
                Write-MandALog "Found $($adConnectServers.Count) potential AD Connect servers" -Level "INFO"
            }
        } catch {
            Write-MandALog "Could not search for AD Connect servers: $($_.Exception.Message)" -Level "WARN"
        }
    }
    
    # Check other Microsoft 365 service connections
    if ($environmentInfo.HasAzureAD) {
        # Check Exchange Online
        try {
            $exoConnection = Get-PSSession | Where-Object { $_.ConfigurationName -eq "Microsoft.Exchange" -and $_.State -eq "Opened" }
            if ($exoConnection) {
                $environmentInfo.EnvironmentDetails.ExchangeOnlineConnected = $true
            }
        } catch {}
        
        # Check SharePoint Online
        try {
            $spoConnection = Get-Command Get-SPOSite -ErrorAction SilentlyContinue
            if ($spoConnection) {
                $environmentInfo.EnvironmentDetails.SharePointOnlineConnected = $true
            }
        } catch {}
        
        # Check Teams
        try {
            $teamsConnection = Get-Command Get-Team -ErrorAction SilentlyContinue
            if ($teamsConnection) {
                $environmentInfo.EnvironmentDetails.TeamsConnected = $true
            }
        } catch {}
    }
    
    # Determine environment type
    if ($environmentInfo.HasAzureAD -and -not $environmentInfo.HasOnPremAD) {
        $environmentInfo.Type = "CloudOnly"
        $environmentInfo.UserCorrelation.Method = "CloudOnly"
    } elseif ($environmentInfo.HasAzureAD -and $environmentInfo.HasOnPremAD -and $environmentInfo.HasADConnect) {
        $environmentInfo.Type = "HybridSynced"
        $environmentInfo.UserCorrelation.Method = "ADConnect"
        
        # Calculate on-prem only users
        if ($environmentInfo.UserCorrelation.TotalOnPremUsers -gt 0 -and $environmentInfo.UserCorrelation.SyncedUsers -gt 0) {
            $environmentInfo.UserCorrelation.OnPremOnlyUsers = $environmentInfo.UserCorrelation.TotalOnPremUsers - $environmentInfo.UserCorrelation.SyncedUsers
        }
    } elseif ($environmentInfo.HasAzureAD -and $environmentInfo.HasOnPremAD -and -not $environmentInfo.HasADConnect) {
        $environmentInfo.Type = "HybridDisconnected"
        $environmentInfo.UserCorrelation.Method = "Manual"
    } elseif ($environmentInfo.HasOnPremAD -and -not $environmentInfo.HasAzureAD) {
        $environmentInfo.Type = "OnPremOnly"
        $environmentInfo.UserCorrelation.Method = "NotApplicable"
    }
    
    # Log summary
    Write-MandALog "Environment Detection Complete:" -Level "SUCCESS"
    Write-MandALog "  - Type: $($environmentInfo.Type)" -Level "INFO"
    Write-MandALog "  - On-Prem AD: $($environmentInfo.HasOnPremAD)" -Level "INFO"
    Write-MandALog "  - Azure AD: $($environmentInfo.HasAzureAD)" -Level "INFO"
    Write-MandALog "  - AD Connect: $($environmentInfo.HasADConnect)" -Level "INFO"
    if ($environmentInfo.HasOnPremAD) {
        Write-MandALog "  - On-Prem Users: $($environmentInfo.UserCorrelation.TotalOnPremUsers)" -Level "INFO"
    }
    if ($environmentInfo.HasAzureAD) {
        Write-MandALog "  - Cloud Users: $($environmentInfo.UserCorrelation.TotalCloudUsers)" -Level "INFO"
        Write-MandALog "  - Synced Users: $($environmentInfo.UserCorrelation.SyncedUsers)" -Level "INFO"
    }
    
    return $environmentInfo
}

# --- Main Invoke Function ---
function Invoke-EnvironmentDetectionDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "--- Starting Environment Detection Discovery ---" -Level "HEADER"
        
        # Run environment detection
        $environmentInfo = Get-EnvironmentType -Configuration $Configuration
        
        # Prepare output
        $outputPath = $Context.Paths.RawDataOutput
        if (-not (Test-Path $outputPath)) {
            New-Item -Path $outputPath -ItemType Directory -Force | Out-Null
        }
        
        # Export main environment info
        $outputFile = Join-Path $outputPath "EnvironmentDetection.csv"
        $envData = [PSCustomObject]@{
            EnvironmentType = $environmentInfo.Type
            HasOnPremAD = $environmentInfo.HasOnPremAD
            HasAzureAD = $environmentInfo.HasAzureAD
            HasADConnect = $environmentInfo.HasADConnect
            ADConnectStatus = $environmentInfo.ADConnectStatus
            LastSyncTime = $environmentInfo.LastSyncTime
            ADForestName = $environmentInfo.EnvironmentDetails.ADForestName
            ADForestMode = $environmentInfo.EnvironmentDetails.ADForestMode
            ADDomainCount = $environmentInfo.EnvironmentDetails.ADDomainCount
            AzureTenantId = $environmentInfo.EnvironmentDetails.AzureTenantId
            AzureTenantName = $environmentInfo.EnvironmentDetails.AzureTenantName
            GraphAPIConnected = $environmentInfo.EnvironmentDetails.GraphAPIConnected
            ExchangeOnlineConnected = $environmentInfo.EnvironmentDetails.ExchangeOnlineConnected
            SharePointOnlineConnected = $environmentInfo.EnvironmentDetails.SharePointOnlineConnected
            TeamsConnected = $environmentInfo.EnvironmentDetails.TeamsConnected
            TotalOnPremUsers = $environmentInfo.UserCorrelation.TotalOnPremUsers
            TotalCloudUsers = $environmentInfo.UserCorrelation.TotalCloudUsers
            SyncedUsers = $environmentInfo.UserCorrelation.SyncedUsers
            CloudOnlyUsers = $environmentInfo.UserCorrelation.CloudOnlyUsers
            OnPremOnlyUsers = $environmentInfo.UserCorrelation.OnPremOnlyUsers
            UserCorrelationMethod = $environmentInfo.UserCorrelation.Method
            OnPremDomains = ($environmentInfo.OnPremDomains -join ";")
            SyncedDomains = ($environmentInfo.SyncedDomains -join ";")
            CloudOnlyDomains = ($environmentInfo.CloudOnlyDomains -join ";")
            DiscoveredAt = $environmentInfo.DiscoveredAt
        }
        
        Export-DataToCSV -Data @($envData) -FilePath $outputFile
        
        # Export AD Connect servers if found
        if ($environmentInfo.ADConnectServers -and $environmentInfo.ADConnectServers.Count -gt 0) {
            $adcOutputFile = Join-Path $outputPath "ADConnectServers.csv"
            Export-DataToCSV -Data $environmentInfo.ADConnectServers -FilePath $adcOutputFile
        }
        
        # Store environment type in global context for other modules to use
        if ($null -ne $global:MandA) {
            $global:MandA.EnvironmentType = $environmentInfo.Type
            $global:MandA.EnvironmentInfo = $environmentInfo
        }
        
        Write-MandALog "--- Environment Detection Discovery Completed ---" -Level "SUCCESS"
        return $environmentInfo
        
    } catch {
        Write-MandALog "Environment detection failed: $($_.Exception.Message)" -Level "ERROR"
        Write-MandALog "Stack trace: $($_.ScriptStackTrace)" -Level "DEBUG"
        return @{
            Type = "Unknown"
            Error = $_.Exception.Message
        }
    }
}

# Export module functions
Export-ModuleMember -Function @(
    'Get-EnvironmentType',
    'Invoke-EnvironmentDetectionDiscovery'
)
