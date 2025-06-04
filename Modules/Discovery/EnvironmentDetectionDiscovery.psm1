#Requires -Modules ActiveDirectory
<#
.SYNOPSIS
    Enhanced Environment Detection Discovery Module
.DESCRIPTION
    Detects the type of environment (Cloud-only, Hybrid, On-prem only) with
    improved structure and context-based operations.
.NOTES
    Version: 3.0.0
    Enhanced: 2025-01-03
#>




# Main detection function
function Get-EnvironmentType {
    param(
        [hashtable]$Configuration,
        $Context
    )
    
    $environmentInfo = Initialize-EnvironmentInfo
    
    # Check for on-premises AD
    $environmentInfo = Test-OnPremisesAD -EnvironmentInfo $environmentInfo -Context $Context
    
    # Check for Azure AD / Microsoft Graph
    $environmentInfo = Test-AzureAD -EnvironmentInfo $environmentInfo -Context $Context
    
    # Check for AD Connect
    if ($environmentInfo.HasOnPremAD -and $environmentInfo.HasAzureAD) {
        $environmentInfo = Test-ADConnect -EnvironmentInfo $environmentInfo -Context $Context
    }
    
    # Check other Microsoft 365 services
    if ($environmentInfo.HasAzureAD) {
        $environmentInfo = Test-Microsoft365Services -EnvironmentInfo $environmentInfo -Context $Context
    }
    
    # Determine environment type
    $environmentInfo.Type = Determine-EnvironmentType -EnvironmentInfo $environmentInfo
    
    # Log summary
    Write-EnvironmentSummary -EnvironmentInfo $environmentInfo -Context $Context
    
    return $environmentInfo
}

function Initialize-EnvironmentInfo {
    return @{
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
}

function Test-OnPremisesAD {
    param($EnvironmentInfo, $Context)
    
    try {
        Write-MandALog "Checking for on-premises Active Directory..." -Level "INFO" -Context $Context
        
        $adDomain = Get-ADDomain -ErrorAction Stop
        $adForest = Get-ADForest -ErrorAction Stop
        
        $EnvironmentInfo.HasOnPremAD = $true
        $EnvironmentInfo.OnPremDomains += $adDomain.DNSRoot
        $EnvironmentInfo.EnvironmentDetails.ADForestName = $adForest.Name
        $EnvironmentInfo.EnvironmentDetails.ADForestMode = $adForest.ForestMode.ToString()
        $EnvironmentInfo.EnvironmentDetails.ADDomainCount = @($adForest.Domains).Count
        
        # Get user count
        try {
            $adUsers = @(Get-ADUser -Filter * -ErrorAction Stop)
            $EnvironmentInfo.UserCorrelation.TotalOnPremUsers = $adUsers.Count
        }
        catch {
            $Context.ErrorCollector.AddWarning("EnvironmentDetection", "Could not retrieve AD user count")
        }
        
        Write-MandALog "On-premises AD detected: $($adDomain.DNSRoot)" -Level "SUCCESS" -Context $Context
    }
    catch {
        Write-MandALog "No on-premises AD detected or not accessible" -Level "INFO" -Context $Context
    }
    
    return $EnvironmentInfo
}

function Test-AzureAD {
    param($EnvironmentInfo, $Context)
    
    try {
        Write-MandALog "Checking for Azure AD / Microsoft Graph connection..." -Level "INFO" -Context $Context
        
        $mgContext = Get-MgContext -ErrorAction SilentlyContinue
        
        if ($mgContext) {
            $EnvironmentInfo.HasAzureAD = $true
            $EnvironmentInfo.EnvironmentDetails.GraphAPIConnected = $true
            $EnvironmentInfo.EnvironmentDetails.AzureTenantId = $mgContext.TenantId
            
            # Get organization details
            $EnvironmentInfo = Get-OrganizationDetails -EnvironmentInfo $EnvironmentInfo -Context $Context
            
            # Get domain information
            $EnvironmentInfo = Get-DomainInformation -EnvironmentInfo $EnvironmentInfo -Context $Context
            
            # Get user statistics
            $EnvironmentInfo = Get-CloudUserStatistics -EnvironmentInfo $EnvironmentInfo -Context $Context
            
            Write-MandALog "Azure AD detected: Tenant $($EnvironmentInfo.EnvironmentDetails.AzureTenantName)" -Level "SUCCESS" -Context $Context
        }
        else {
            Write-MandALog "No Azure AD / Microsoft Graph connection detected" -Level "INFO" -Context $Context
        }
    }
    catch {
        $Context.ErrorCollector.AddWarning("EnvironmentDetection", "Error checking Azure AD: $($_.Exception.Message)")
    }
    
    return $EnvironmentInfo
}

function Get-OrganizationDetails {
    param($EnvironmentInfo, $Context)
    
    try {
        $org = Get-MgOrganization -ErrorAction Stop | Select-Object -First 1
        
        if ($org) {
            $EnvironmentInfo.EnvironmentDetails.AzureTenantName = $org.DisplayName
            
            # Check for directory sync
            if ($org.OnPremisesSyncEnabled) {
                $EnvironmentInfo.HasADConnect = $true
                $EnvironmentInfo.ADConnectStatus = "Enabled"
                $EnvironmentInfo.LastSyncTime = $org.OnPremisesLastSyncDateTime
            }
        }
    }
    catch {
        $Context.ErrorCollector.AddWarning("EnvironmentDetection", "Could not retrieve organization details")
    }
    
    return $EnvironmentInfo
}

function Get-DomainInformation {
    param($EnvironmentInfo, $Context)
    
    try {
        $domains = Get-MgDomain -ErrorAction Stop
        
        foreach ($domain in $domains) {
            if ($domain.AuthenticationType -eq "Federated") {
                $EnvironmentInfo.SyncedDomains += $domain.Id
            }
            elseif ($domain.AuthenticationType -eq "Managed" -and $domain.IsVerified) {
                $EnvironmentInfo.CloudOnlyDomains += $domain.Id
            }
        }
    }
    catch {
        $Context.ErrorCollector.AddWarning("EnvironmentDetection", "Could not retrieve domain information")
    }
    
    return $EnvironmentInfo
}

function Get-CloudUserStatistics {
    param($EnvironmentInfo, $Context)
    
    try {
        # Use pagination for large environments
        $pageSize = 999
        $cloudUsers = @()
        
        do {
            $batch = Get-MgUser -Top $pageSize -Property OnPremisesSyncEnabled,UserPrincipalName -ErrorAction Stop
            $cloudUsers += $batch
        } while ($batch.Count -eq $pageSize)
        
        $EnvironmentInfo.UserCorrelation.TotalCloudUsers = $cloudUsers.Count
        $EnvironmentInfo.UserCorrelation.SyncedUsers = @($cloudUsers | Where-Object { $_.OnPremisesSyncEnabled -eq $true }).Count
        $EnvironmentInfo.UserCorrelation.CloudOnlyUsers = @($cloudUsers | Where-Object { $_.OnPremisesSyncEnabled -ne $true }).Count
    }
    catch {
        $Context.ErrorCollector.AddWarning("EnvironmentDetection", "Could not retrieve cloud user statistics")
    }
    
    return $EnvironmentInfo
}

function Test-ADConnect {
    param($EnvironmentInfo, $Context)
    
    try {
        Write-MandALog "Searching for AD Connect servers..." -Level "INFO" -Context $Context
        
        # Search using multiple methods
        $adConnectServers = Find-ADConnectServers -Context $Context
        
        if ($adConnectServers) {
            foreach ($server in $adConnectServers) {
                $EnvironmentInfo.ADConnectServers += [PSCustomObject]@{
                    ServerName = $server.Name
                    DNSHostName = $server.DNSHostName
                    OperatingSystem = $server.OperatingSystem
                    Description = $server.Description
                    DiscoveryMethod = $server.DiscoveryMethod
                }
            }
            
            Write-MandALog "Found $($adConnectServers.Count) potential AD Connect servers" -Level "INFO" -Context $Context
        }
    }
    catch {
        $Context.ErrorCollector.AddWarning("EnvironmentDetection", "Could not search for AD Connect servers")
    }
    
    return $EnvironmentInfo
}

function Find-ADConnectServers {
    param($Context)
    
    $servers = @()
    
    # Method 1: Search by ServicePrincipalName
    try {
        $spnServers = Get-ADComputer -Filter {ServicePrincipalName -like "*ADSync*"} -Properties OperatingSystem,Description -ErrorAction Stop
        foreach ($server in $spnServers) {
            $server | Add-Member -NotePropertyName DiscoveryMethod -NotePropertyValue "SPN" -Force
            $servers += $server
        }
    }
    catch {
        $Context.ErrorCollector.AddWarning("EnvironmentDetection", "SPN search for AD Connect failed")
    }
    
    # Method 2: Search by common AD Connect service names
    try {
        $serviceNames = @("ADSync", "Azure AD Sync", "Azure AD Connect")
        foreach ($serviceName in $serviceNames) {
            $svcServers = Get-ADComputer -Filter {Description -like "*$serviceName*"} -Properties OperatingSystem,Description -ErrorAction Stop
            foreach ($server in $svcServers) {
                if ($servers.Name -notcontains $server.Name) {
                    $server | Add-Member -NotePropertyName DiscoveryMethod -NotePropertyValue "ServiceName" -Force
                    $servers += $server
                }
            }
        }
    }
    catch {
        $Context.ErrorCollector.AddWarning("EnvironmentDetection", "Service name search for AD Connect failed")
    }
    
    return $servers
}

function Test-Microsoft365Services {
    param($EnvironmentInfo, $Context)
    
    # Check Exchange Online
    try {
        $exoConnection = Get-PSSession | Where-Object { 
            $_.ConfigurationName -eq "Microsoft.Exchange" -and $_.State -eq "Opened" 
        }
        if ($exoConnection) {
            $EnvironmentInfo.EnvironmentDetails.ExchangeOnlineConnected = $true
        }
    }
    catch {}
    
    # Check SharePoint Online
    try {
        if (Get-Command Get-SPOSite -ErrorAction SilentlyContinue) {
            $EnvironmentInfo.EnvironmentDetails.SharePointOnlineConnected = $true
        }
    }
    catch {}
    
    # Check Teams
    try {
        if (Get-Command Get-Team -ErrorAction SilentlyContinue) {
            $EnvironmentInfo.EnvironmentDetails.TeamsConnected = $true
        }
    }
    catch {}
    
    return $EnvironmentInfo
}

function Determine-EnvironmentType {
    param($EnvironmentInfo)
    
    if ($EnvironmentInfo.HasAzureAD -and -not $EnvironmentInfo.HasOnPremAD) {
        $EnvironmentInfo.Type = "CloudOnly"
        $EnvironmentInfo.UserCorrelation.Method = "CloudOnly"
    }
    elseif ($EnvironmentInfo.HasAzureAD -and $EnvironmentInfo.HasOnPremAD -and $EnvironmentInfo.HasADConnect) {
        $EnvironmentInfo.Type = "HybridSynced"
        $EnvironmentInfo.UserCorrelation.Method = "ADConnect"
        
        # Calculate on-prem only users
        if ($EnvironmentInfo.UserCorrelation.TotalOnPremUsers -gt 0 -and $EnvironmentInfo.UserCorrelation.SyncedUsers -gt 0) {
            $EnvironmentInfo.UserCorrelation.OnPremOnlyUsers = [Math]::Max(0, 
                $EnvironmentInfo.UserCorrelation.TotalOnPremUsers - $EnvironmentInfo.UserCorrelation.SyncedUsers)
        }
    }
    elseif ($EnvironmentInfo.HasAzureAD -and $EnvironmentInfo.HasOnPremAD -and -not $EnvironmentInfo.HasADConnect) {
        $EnvironmentInfo.Type = "HybridDisconnected"
        $EnvironmentInfo.UserCorrelation.Method = "Manual"
    }
    elseif ($EnvironmentInfo.HasOnPremAD -and -not $EnvironmentInfo.HasAzureAD) {
        $EnvironmentInfo.Type = "OnPremOnly"
        $EnvironmentInfo.UserCorrelation.Method = "NotApplicable"
    }
    
    return $EnvironmentInfo.Type
}

function Write-EnvironmentSummary {
    param($EnvironmentInfo, $Context)
    
    Write-MandALog "Environment Detection Complete:" -Level "SUCCESS" -Context $Context
    Write-MandALog "  - Type: $($EnvironmentInfo.Type)" -Level "INFO" -Context $Context
    Write-MandALog "  - On-Prem AD: $($EnvironmentInfo.HasOnPremAD)" -Level "INFO" -Context $Context
    Write-MandALog "  - Azure AD: $($EnvironmentInfo.HasAzureAD)" -Level "INFO" -Context $Context
    Write-MandALog "  - AD Connect: $($EnvironmentInfo.HasADConnect)" -Level "INFO" -Context $Context
    
    if ($EnvironmentInfo.HasOnPremAD) {
        Write-MandALog "  - On-Prem Users: $($EnvironmentInfo.UserCorrelation.TotalOnPremUsers)" -Level "INFO" -Context $Context
    }
    
    if ($EnvironmentInfo.HasAzureAD) {
        Write-MandALog "  - Cloud Users: $($EnvironmentInfo.UserCorrelation.TotalCloudUsers)" -Level "INFO" -Context $Context
        Write-MandALog "  - Synced Users: $($EnvironmentInfo.UserCorrelation.SyncedUsers)" -Level "INFO" -Context $Context
    }
}

# Main exported function
function Invoke-EnvironmentDetectionDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    # Create minimal context if not provided
    if (-not $Context) {
        $Context = @{
            ErrorCollector = [PSCustomObject]@{
                AddError = { param($s,$m,$e) Write-Warning "Error in $s`: $m" }
                AddWarning = { param($s,$m) Write-Warning "Warning in $s`: $m" }
            }
            Paths = @{
                RawDataOutput = Join-Path $Configuration.environment.outputPath "Raw"
            }
        }
    }
    
    try {
        Write-MandALog "--- Starting Environment Detection Discovery (v3.0.0) ---" -Level "HEADER" -Context $Context
        
        # Run environment detection
        $environmentInfo = Get-EnvironmentType -Configuration $Configuration -Context $Context
        
        # Export main environment info
        $outputFile = Join-Path $Context.Paths.RawDataOutput "EnvironmentDetection.csv"
        $envData = ConvertTo-EnvironmentDataObject -EnvironmentInfo $environmentInfo
        Export-DataToCSV -Data @($envData) -FilePath $outputFile -Context $Context
        
        # Export AD Connect servers if found
        if ($environmentInfo.ADConnectServers -and $environmentInfo.ADConnectServers.Count -gt 0) {
            $adcOutputFile = Join-Path $Context.Paths.RawDataOutput "ADConnectServers.csv"
            Export-DataToCSV -Data $environmentInfo.ADConnectServers -FilePath $adcOutputFile -Context $Context
        }
        
        # Store in global context if available
        if ($null -ne $global:MandA) {
            $global:MandA.EnvironmentType = $environmentInfo.Type
            $global:MandA.EnvironmentInfo = $environmentInfo
        }
        
        Write-MandALog "--- Environment Detection Discovery Completed ---" -Level "SUCCESS" -Context $Context
        return $environmentInfo
        
    }
    catch {
        $Context.ErrorCollector.AddError("EnvironmentDetection", "Discovery failed", $_.Exception)
        Write-MandALog "Environment detection failed: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        
        return @{
            Type = "Unknown"
            Error = $_.Exception.Message
        }
    }
}

function ConvertTo-EnvironmentDataObject {
    param($EnvironmentInfo)
    
    return [PSCustomObject]@{
        EnvironmentType = $EnvironmentInfo.Type
        HasOnPremAD = $EnvironmentInfo.HasOnPremAD
        HasAzureAD = $EnvironmentInfo.HasAzureAD
        HasADConnect = $EnvironmentInfo.HasADConnect
        ADConnectStatus = $EnvironmentInfo.ADConnectStatus
        LastSyncTime = $EnvironmentInfo.LastSyncTime
        ADForestName = $EnvironmentInfo.EnvironmentDetails.ADForestName
        ADForestMode = $EnvironmentInfo.EnvironmentDetails.ADForestMode
        ADDomainCount = $EnvironmentInfo.EnvironmentDetails.ADDomainCount
        AzureTenantId = $EnvironmentInfo.EnvironmentDetails.AzureTenantId
        AzureTenantName = $EnvironmentInfo.EnvironmentDetails.AzureTenantName
        GraphAPIConnected = $EnvironmentInfo.EnvironmentDetails.GraphAPIConnected
        ExchangeOnlineConnected = $EnvironmentInfo.EnvironmentDetails.ExchangeOnlineConnected
        SharePointOnlineConnected = $EnvironmentInfo.EnvironmentDetails.SharePointOnlineConnected
        TeamsConnected = $EnvironmentInfo.EnvironmentDetails.TeamsConnected
        TotalOnPremUsers = $EnvironmentInfo.UserCorrelation.TotalOnPremUsers
        TotalCloudUsers = $EnvironmentInfo.UserCorrelation.TotalCloudUsers
        SyncedUsers = $EnvironmentInfo.UserCorrelation.SyncedUsers
        CloudOnlyUsers = $EnvironmentInfo.UserCorrelation.CloudOnlyUsers
        OnPremOnlyUsers = $EnvironmentInfo.UserCorrelation.OnPremOnlyUsers
        UserCorrelationMethod = $EnvironmentInfo.UserCorrelation.Method
        OnPremDomains = ($EnvironmentInfo.OnPremDomains -join ";")
        SyncedDomains = ($EnvironmentInfo.SyncedDomains -join ";")
        CloudOnlyDomains = ($EnvironmentInfo.CloudOnlyDomains -join ";")
        DiscoveredAt = $EnvironmentInfo.DiscoveredAt
    }
}

# Export module members
Export-ModuleMember -Function @(
    'Get-EnvironmentType',
    'Invoke-EnvironmentDetectionDiscovery'
)
