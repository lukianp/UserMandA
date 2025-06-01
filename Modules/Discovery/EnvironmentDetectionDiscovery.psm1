# New Module: Modules/Discovery/EnvironmentDetection.psm1

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
        UserCorrelation = @{
            Method = "None"
            IdentityMapping = @{}
        }
    }
    
    # Check for on-prem AD
    try {
        $adDomain = Get-ADDomain -ErrorAction Stop
        $environmentInfo.HasOnPremAD = $true
        $environmentInfo.OnPremDomains += $adDomain.DNSRoot
    } catch {
        Write-MandALog "No on-premises AD detected or not accessible" -Level "INFO"
    }
    
    # Check for Azure AD
    try {
        $azureADTenant = Get-MgOrganization -ErrorAction Stop
        $environmentInfo.HasAzureAD = $true
        
        # Check for AD Connect
        $syncStatus = Get-MgOrganizationDirectorySyncState
        if ($syncStatus.DirectorySyncEnabled) {
            $environmentInfo.HasADConnect = $true
            $environmentInfo.ADConnectStatus = "Enabled"
            
            # Get sync details
            $syncedDomains = Get-MgDomain | Where-Object { $_.AuthenticationType -eq "Federated" -or $_.AuthenticationType -eq "Managed" }
            $environmentInfo.SyncedDomains = $syncedDomains.Id
        }
    } catch {
        Write-MandALog "Azure AD not accessible" -Level "INFO"
    }
    
    # Determine environment type
    if ($environmentInfo.HasAzureAD -and -not $environmentInfo.HasOnPremAD) {
        $environmentInfo.Type = "CloudOnly"
    } elseif ($environmentInfo.HasAzureAD -and $environmentInfo.HasOnPremAD -and $environmentInfo.HasADConnect) {
        $environmentInfo.Type = "HybridSynced"
    } elseif ($environmentInfo.HasAzureAD -and $environmentInfo.HasOnPremAD -and -not $environmentInfo.HasADConnect) {
        $environmentInfo.Type = "HybridDisconnected"
    } elseif ($environmentInfo.HasOnPremAD -and -not $environmentInfo.HasAzureAD) {
        $environmentInfo.Type = "OnPremOnly"
    }
    
    return $environmentInfo
}
