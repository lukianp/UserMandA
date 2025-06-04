#Requires -Modules Az.Accounts, Az.Resources, Az.Compute, Az.Network, Az.PolicyInsights, Az.RecoveryServices
<#
.SYNOPSIS
    Enhanced Azure Discovery Module with API Throttling Support
.DESCRIPTION
    Provides comprehensive Azure resource discovery with improved error handling,
    API throttling, and context-based operations.
.NOTES
    Version: 2.0.0
    Enhanced: 2025-01-03
#>

# Import shared utilities
Import-Module "$PSScriptRoot\..\Utilities\DataExport.psm1" -Force

# API Throttling Configuration
$script:ThrottleConfig = @{
    DefaultDelay = 1
    ThrottleDelay = 60
    MaxRetries = 3
    RetryableErrors = @(
        "TooManyRequests",
        "429",
        "Throttled",
        "RequestThrottled",
        "OperationThrottled"
    )
}

# Core throttling function
function Invoke-AzureOperationWithThrottling {
    param(
        [scriptblock]$Operation,
        [string]$OperationName,
        $Context,
        [int]$MaxRetries = $script:ThrottleConfig.MaxRetries
    )
    
    $retryCount = 0
    $lastError = $null
    
    while ($retryCount -lt $MaxRetries) {
        try {
            # Add small delay to prevent hitting rate limits
            if ($retryCount -gt 0) {
                Start-Sleep -Seconds $script:ThrottleConfig.DefaultDelay
            }
            
            # Execute the operation
            $result = & $Operation
            return $result
        }
        catch {
            $lastError = $_
            
            # Check if error is throttling-related
            $isThrottled = $false
            foreach ($errorPattern in $script:ThrottleConfig.RetryableErrors) {
                if ($_.Exception.Message -match $errorPattern) {
                    $isThrottled = $true
                    break
                }
            }
            
            if ($isThrottled) {
                $retryCount++
                $waitTime = $script:ThrottleConfig.ThrottleDelay * $retryCount
                
                Write-MandALog "API throttled for $OperationName. Waiting $waitTime seconds (Retry $retryCount/$MaxRetries)" -Level "WARN" -Context $Context
                $Context.ErrorCollector.AddWarning("Azure_$OperationName", "API throttled, retry $retryCount")
                
                Start-Sleep -Seconds $waitTime
            }
            else {
                # Non-throttling error, throw immediately
                throw
            }
        }
    }
    
    # Max retries exceeded
    $Context.ErrorCollector.AddError("Azure_$OperationName", "Max retries exceeded after throttling", $lastError.Exception)
    throw "Max retries exceeded for $OperationName`: $($lastError.Exception.Message)"
}

# Discovery Functions
function Get-AzureSubscriptionsInternal {
    param(
        [hashtable]$Configuration,
        $Context
    )
    
    Write-MandALog "Discovering Azure Subscriptions..." -Level "INFO" -Context $Context
    $allSubscriptions = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        $subscriptions = Invoke-AzureOperationWithThrottling -Operation {
            Get-AzSubscription -ErrorAction Stop
        } -OperationName "GetSubscriptions" -Context $Context
        
        if ($subscriptions) {
            foreach ($sub in $subscriptions) {
                $allSubscriptions.Add([PSCustomObject]@{
                    SubscriptionId = $sub.Id
                    SubscriptionName = $sub.Name
                    TenantId = $sub.TenantId
                    State = $sub.State.ToString()
                })
            }
            
            Write-MandALog "Retrieved $($allSubscriptions.Count) Azure Subscriptions" -Level "INFO" -Context $Context
        }
    }
    catch {
        $Context.ErrorCollector.AddError("Azure_Subscriptions", "Failed to retrieve subscriptions", $_.Exception)
        Write-MandALog "Error retrieving Azure Subscriptions: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    
    return $allSubscriptions
}

function Get-AzureResourceGroupsInternal {
    param(
        [hashtable]$Configuration,
        $SubscriptionContext,
        $Context
    )
    
    Write-MandALog "Discovering Resource Groups in subscription '$($SubscriptionContext.Name)'..." -Level "INFO" -Context $Context
    $allRGs = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        $rgs = Invoke-AzureOperationWithThrottling -Operation {
            Get-AzResourceGroup -ErrorAction Stop
        } -OperationName "GetResourceGroups_$($SubscriptionContext.Name)" -Context $Context
        
        if ($rgs) {
            foreach ($rg in $rgs) {
                $allRGs.Add([PSCustomObject]@{
                    SubscriptionId = $SubscriptionContext.Id
                    SubscriptionName = $SubscriptionContext.Name
                    ResourceGroupName = $rg.ResourceGroupName
                    Location = $rg.Location
                    ProvisioningState = $rg.ProvisioningState
                    Tags = if ($rg.Tags) { $rg.Tags | ConvertTo-Json -Compress -Depth 3 } else { $null }
                })
            }
        }
    }
    catch {
        $Context.ErrorCollector.AddError("Azure_ResourceGroups", "Failed to retrieve RGs from '$($SubscriptionContext.Name)'", $_.Exception)
    }
    
    return $allRGs
}

function Get-AzureVMsDataInternal {
    param(
        [hashtable]$Configuration,
        $SubscriptionContext,
        $Context
    )
    
    Write-MandALog "Discovering VMs in subscription '$($SubscriptionContext.Name)'..." -Level "INFO" -Context $Context
    $allVMs = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        $vms = Invoke-AzureOperationWithThrottling -Operation {
            Get-AzVM -Status -ErrorAction Stop
        } -OperationName "GetVMs_$($SubscriptionContext.Name)" -Context $Context
        
        if ($vms) {
            foreach ($vm in $vms) {
                $vmObj = ConvertTo-VMObject -VM $vm -SubscriptionContext $SubscriptionContext -Context $Context
                $allVMs.Add($vmObj)
            }
        }
    }
    catch {
        $Context.ErrorCollector.AddError("Azure_VMs", "Failed to retrieve VMs from '$($SubscriptionContext.Name)'", $_.Exception)
    }
    
    return $allVMs
}

function ConvertTo-VMObject {
    param($VM, $SubscriptionContext, $Context)
    
    # Get IP configurations with throttling
    $ipConfigs = @()
    
    if ($VM.NetworkProfile.NetworkInterfaces) {
        foreach ($nicRef in $VM.NetworkProfile.NetworkInterfaces) {
            try {
                $nic = Invoke-AzureOperationWithThrottling -Operation {
                    Get-AzNetworkInterface -ResourceId $nicRef.Id -ErrorAction Stop
                } -OperationName "GetNIC_$($VM.Name)" -Context $Context
                
                if ($nic.IpConfigurations) {
                    $ipConfigs += $nic.IpConfigurations | Select-Object Name, PrivateIpAddress, 
                        @{N='PublicIpAddressId';E={$_.PublicIpAddress.Id}}, 
                        @{N='SubnetId';E={$_.Subnet.Id}}
                }
            }
            catch {
                $Context.ErrorCollector.AddWarning("Azure_VMs", "Failed to get NIC for VM: $($VM.Name)")
            }
        }
    }
    
    return [PSCustomObject]@{
        SubscriptionId = $SubscriptionContext.Id
        SubscriptionName = $SubscriptionContext.Name
        VMName = $VM.Name
        ResourceGroupName = $VM.ResourceGroupName
        Location = $VM.Location
        VMId = $VM.Id
        VMSize = $VM.HardwareProfile.VmSize
        OSType = $VM.StorageProfile.OsDisk.OsType
        ProvisioningState = $VM.ProvisioningState
        PowerState = ($VM.Statuses | Where-Object Code -like 'PowerState/*' | Select-Object -ExpandProperty DisplayStatus -First 1)
        Tags = if ($VM.Tags) { $VM.Tags | ConvertTo-Json -Compress } else { $null }
        IPConfigurations = if ($ipConfigs) { $ipConfigs | ConvertTo-Json -Compress -Depth 3 } else { $null }
    }
}

function Get-AzureADApplicationsInternal {
    param(
        [hashtable]$Configuration,
        [string]$TenantId,
        $Context
    )
    
    Write-MandALog "Discovering Azure AD Applications in tenant '$TenantId'..." -Level "INFO" -Context $Context
    
    $result = @{
        Applications = [System.Collections.Generic.List[PSObject]]::new()
        Owners = [System.Collections.Generic.List[PSObject]]::new()
    }
    
    try {
        # Get applications with pagination support
        $skip = 0
        $batchSize = 1000
        $hasMore = $true
        
        while ($hasMore) {
            $apps = Invoke-AzureOperationWithThrottling -Operation {
                Get-AzADApplication -First $batchSize -Skip $skip -ErrorAction Stop
            } -OperationName "GetADApplications_$skip" -Context $Context
            
            if ($apps -and $apps.Count -gt 0) {
                foreach ($app in $apps) {
                    $appObj = ConvertTo-ADApplicationObject -Application $app -TenantId $TenantId
                    $result.Applications.Add($appObj)
                    
                    # Get owners
                    Process-ADApplicationOwners -Application $app -OwnersList $result.Owners -Context $Context
                }
                
                $skip += $apps.Count
                $hasMore = ($apps.Count -eq $batchSize)
            }
            else {
                $hasMore = $false
            }
        }
        
        Write-MandALog "Discovered $($result.Applications.Count) AD Applications" -Level "INFO" -Context $Context
    }
    catch {
        $Context.ErrorCollector.AddError("Azure_ADApplications", "Failed to retrieve AD applications", $_.Exception)
    }
    
    return $result
}

function ConvertTo-ADApplicationObject {
    param($Application, [string]$TenantId)
    
    return [PSCustomObject]@{
        TenantId = $TenantId
        ApplicationId = $Application.AppId
        ObjectId = $Application.Id
        DisplayName = $Application.DisplayName
        SignInAudience = $Application.SignInAudience
        CreatedDateTime = $Application.CreatedDateTime
        IdentifierUris = if ($Application.IdentifierUris) { $Application.IdentifierUris -join ';' } else { $null }
        PublisherDomain = $Application.PublisherDomain
        IsDeviceOnlyAuthSupported = $Application.IsDeviceOnlyAuthSupported
    }
}

function Process-ADApplicationOwners {
    param($Application, $OwnersList, $Context)
    
    try {
        $owners = Invoke-AzureOperationWithThrottling -Operation {
            Get-AzADAppOwner -ApplicationObjectId $Application.Id -ErrorAction Stop
        } -OperationName "GetAppOwners_$($Application.DisplayName)" -Context $Context
        
        if ($owners) {
            foreach ($owner in $owners) {
                $OwnersList.Add([PSCustomObject]@{
                    ApplicationObjectId = $Application.Id
                    ApplicationDisplayName = $Application.DisplayName
                    OwnerObjectId = $owner.Id
                    OwnerType = $owner.GetType().Name
                    OwnerDisplayName = $owner.DisplayName
                    OwnerUserPrincipalName = if ($owner.PSObject.Properties['UserPrincipalName']) { $owner.UserPrincipalName } else { $null }
                })
            }
        }
    }
    catch {
        $Context.ErrorCollector.AddWarning("Azure_ADApplications", "Failed to get owners for app: $($Application.DisplayName)")
    }
}

function Get-AzureServicePrincipalsInternal {
    param(
        [hashtable]$Configuration,
        [string]$TenantId,
        $Context
    )
    
    Write-MandALog "Discovering Azure Service Principals in tenant '$TenantId'..." -Level "INFO" -Context $Context
    
    $result = @{
        ServicePrincipals = [System.Collections.Generic.List[PSObject]]::new()
        Owners = [System.Collections.Generic.List[PSObject]]::new()
    }
    
    try {
        # Get service principals with pagination
        $skip = 0
        $batchSize = 1000
        $hasMore = $true
        
        while ($hasMore) {
            $sps = Invoke-AzureOperationWithThrottling -Operation {
                Get-AzADServicePrincipal -First $batchSize -Skip $skip -ErrorAction Stop
            } -OperationName "GetServicePrincipals_$skip" -Context $Context
            
            if ($sps -and $sps.Count -gt 0) {
                foreach ($sp in $sps) {
                    $spObj = ConvertTo-ServicePrincipalObject -ServicePrincipal $sp -TenantId $TenantId
                    $result.ServicePrincipals.Add($spObj)
                    
                    # Get owners
                    Process-ServicePrincipalOwners -ServicePrincipal $sp -OwnersList $result.Owners -Context $Context
                }
                
                $skip += $sps.Count
                $hasMore = ($sps.Count -eq $batchSize)
            }
            else {
                $hasMore = $false
            }
        }
        
        Write-MandALog "Discovered $($result.ServicePrincipals.Count) Service Principals" -Level "INFO" -Context $Context
    }
    catch {
        $Context.ErrorCollector.AddError("Azure_ServicePrincipals", "Failed to retrieve service principals", $_.Exception)
    }
    
    return $result
}

function ConvertTo-ServicePrincipalObject {
    param($ServicePrincipal, [string]$TenantId)
    
    return [PSCustomObject]@{
        TenantId = $TenantId
        ServicePrincipalId = $ServicePrincipal.Id
        ApplicationId = $ServicePrincipal.AppId
        DisplayName = $ServicePrincipal.DisplayName
        ServicePrincipalType = $ServicePrincipal.ServicePrincipalType
        AccountEnabled = $ServicePrincipal.AccountEnabled
        AppOwnerOrganizationId = $ServicePrincipal.AppOwnerOrganizationId
        CreatedDateTime = $ServicePrincipal.CreatedDateTime
    }
}

function Process-ServicePrincipalOwners {
    param($ServicePrincipal, $OwnersList, $Context)
    
    try {
        $owners = Invoke-AzureOperationWithThrottling -Operation {
            Get-AzADServicePrincipalOwner -ServicePrincipalObjectId $ServicePrincipal.Id -ErrorAction Stop
        } -OperationName "GetSPOwners_$($ServicePrincipal.DisplayName)" -Context $Context
        
        if ($owners) {
            foreach ($owner in $owners) {
                $OwnersList.Add([PSCustomObject]@{
                    ServicePrincipalObjectId = $ServicePrincipal.Id
                    ServicePrincipalDisplayName = $ServicePrincipal.DisplayName
                    OwnerObjectId = $owner.Id
                    OwnerType = $owner.GetType().Name
                    OwnerDisplayName = $owner.DisplayName
                    OwnerUserPrincipalName = if ($owner.PSObject.Properties['UserPrincipalName']) { $owner.UserPrincipalName } else { $null }
                })
            }
        }
    }
    catch {
        $Context.ErrorCollector.AddWarning("Azure_ServicePrincipals", "Failed to get owners for SP: $($ServicePrincipal.DisplayName)")
    }
}

# Main discovery function
function Invoke-AzureDiscovery {
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
    
    Write-MandALog "--- Starting Azure Discovery Phase (v2.0.0) ---" -Level "HEADER" -Context $Context
    
    # Validate Azure connection
    if (-not (Get-Module -Name Az.Accounts -ListAvailable)) {
        $Context.ErrorCollector.AddError("Azure", "Az.Accounts module not available", $null)
        return $null
    }
    
    $currentAzContext = Get-AzContext -ErrorAction SilentlyContinue
    if (-not $currentAzContext) {
        $Context.ErrorCollector.AddError("Azure", "Not connected to Azure", $null)
        return $null
    }
    
    Write-MandALog "Azure context: $($currentAzContext.Name) | Tenant: $($currentAzContext.Tenant.Id)" -Level "INFO" -Context $Context
    
    # Initialize result structure
    $allDiscoveredData = Initialize-AzureDiscoveryResults
    
    try {
        # Get subscriptions
        $subscriptions = Get-AzureSubscriptionsInternal -Configuration $Configuration -Context $Context
        
        if ($subscriptions -and $subscriptions.Count -gt 0) {
            $allDiscoveredData.Subscriptions.AddRange($subscriptions)
            
            # Process tenant-level resources once per tenant
            $processedTenants = @{}
            
            foreach ($sub in $subscriptions) {
                # Process tenant-level resources
                if (-not $processedTenants.ContainsKey($sub.TenantId)) {
                    Process-TenantLevelResources -TenantId $sub.TenantId -SubscriptionContext $sub -DiscoveredData $allDiscoveredData -Configuration $Configuration -Context $Context
                    $processedTenants[$sub.TenantId] = $true
                }
                
                # Process subscription-level resources
                Process-SubscriptionLevelResources -Subscription $sub -DiscoveredData $allDiscoveredData -Configuration $Configuration -Context $Context
            }
        }
        
        # Export all collected data
        Export-AzureDiscoveryData -DiscoveredData $allDiscoveredData -Context $Context
        
        Write-MandALog "--- Azure Discovery Phase Completed Successfully ---" -Level "SUCCESS" -Context $Context
    }
    catch {
        $Context.ErrorCollector.AddError("Azure", "Critical error during discovery", $_.Exception)
        Write-MandALog "Critical error in Azure Discovery: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    
    return $allDiscoveredData
}

function Initialize-AzureDiscoveryResults {
    return @{
        Subscriptions = [System.Collections.Generic.List[PSObject]]::new()
        ResourceGroups = [System.Collections.Generic.List[PSObject]]::new()
        VirtualMachines = [System.Collections.Generic.List[PSObject]]::new()
        ADApplications = [System.Collections.Generic.List[PSObject]]::new()
        ADApplicationOwners = [System.Collections.Generic.List[PSObject]]::new()
        ServicePrincipals = [System.Collections.Generic.List[PSObject]]::new()
        ServicePrincipalOwners = [System.Collections.Generic.List[PSObject]]::new()
    }
}

function Process-TenantLevelResources {
    param($TenantId, $SubscriptionContext, $DiscoveredData, $Configuration, $Context)
    
    Write-MandALog "Processing tenant-level resources for: $TenantId" -Level "INFO" -Context $Context
    
    # Set context to the subscription
    try {
        Invoke-AzureOperationWithThrottling -Operation {
            Set-AzContext -SubscriptionId $SubscriptionContext.SubscriptionId -TenantId $TenantId -ErrorAction Stop | Out-Null
        } -OperationName "SetContext_Tenant_$TenantId" -Context $Context
        
        # Get AD Applications
        $adAppsData = Get-AzureADApplicationsInternal -Configuration $Configuration -TenantId $TenantId -Context $Context
        if ($adAppsData.Applications) { $DiscoveredData.ADApplications.AddRange($adAppsData.Applications) }
        if ($adAppsData.Owners) { $DiscoveredData.ADApplicationOwners.AddRange($adAppsData.Owners) }
        
        # Get Service Principals
        $spData = Get-AzureServicePrincipalsInternal -Configuration $Configuration -TenantId $TenantId -Context $Context
        if ($spData.ServicePrincipals) { $DiscoveredData.ServicePrincipals.AddRange($spData.ServicePrincipals) }
        if ($spData.Owners) { $DiscoveredData.ServicePrincipalOwners.AddRange($spData.Owners) }
    }
    catch {
        $Context.ErrorCollector.AddError("Azure_Tenant", "Failed to process tenant resources for: $TenantId", $_.Exception)
    }
}

function Process-SubscriptionLevelResources {
    param($Subscription, $DiscoveredData, $Configuration, $Context)
    
    Write-MandALog "Processing subscription: $($Subscription.SubscriptionName)" -Level "INFO" -Context $Context
    
    try {
        # Set subscription context
        Invoke-AzureOperationWithThrottling -Operation {
            Set-AzContext -SubscriptionId $Subscription.SubscriptionId -TenantId $Subscription.TenantId -ErrorAction Stop | Out-Null
        } -OperationName "SetContext_Sub_$($Subscription.SubscriptionName)" -Context $Context
        
        # Get Resource Groups
        $rgs = Get-AzureResourceGroupsInternal -Configuration $Configuration -SubscriptionContext $Subscription -Context $Context
        if ($rgs) { $DiscoveredData.ResourceGroups.AddRange($rgs) }
        
        # Get Virtual Machines
        $vms = Get-AzureVMsDataInternal -Configuration $Configuration -SubscriptionContext $Subscription -Context $Context
        if ($vms) { $DiscoveredData.VirtualMachines.AddRange($vms) }
        
        # Add other resource types as needed...
        
    }
    catch {
        $Context.ErrorCollector.AddError("Azure_Subscription", "Failed to process subscription: $($Subscription.SubscriptionName)", $_.Exception)
    }
}

function Export-AzureDiscoveryData {
    param($DiscoveredData, $Context)
    
   

#Updated global logging thingy
        if ($null -eq $global:MandA) {
    throw "Global environment not initialized"
}
        $outputPath = $Context.Paths.RawDataOutput

        if (-not (Test-Path $Context.Paths.RawDataOutput)) {
    New-Item -Path $Context.Paths.RawDataOutput -ItemType Directory -Force
}
    
    foreach ($key in $DiscoveredData.Keys) {
        $dataList = $DiscoveredData[$key]
        
        if ($dataList -and $dataList.Count -gt 0) {
            $fileName = "Azure$key.csv"
            $filePath = Join-Path $outputPath $fileName
            
            Export-DataToCSV -Data $dataList -FilePath $filePath -Context $Context
            Write-MandALog "Exported $($dataList.Count) items for Azure $key" -Level "SUCCESS" -Context $Context
        }
    }
}

# Export module members
Export-ModuleMember -Function @('Invoke-AzureDiscovery')
