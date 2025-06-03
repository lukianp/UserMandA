<#
.SYNOPSIS
    Handles discovery of Azure resources for M&A Discovery Suite
.DESCRIPTION
    This module provides comprehensive Azure resource discovery capabilities
    including subscriptions, resource groups, VMs, AD applications, and more.
.NOTES
    Author: Lukian Poleschtschuk
    Version: 1.0.0
    Created: 2025-06-03
    Last Modified: 2025-06-03
    Change Log: Initial version - any future changes require version increment
#>

#Requires -Modules Az.Accounts, Az.Resources, Az.Compute, Az.Network, Az.PolicyInsights, Az.RecoveryServices, Az.Storage, Az.KeyVault, Az.ManagedServiceIdentity

# --- Helper Functions (Assumed to be available globally) ---
# Export-DataToCSV
# Write-MandALog

# --- Private Internal Discovery Functions ---

function Get-AzureSubscriptionsInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "Discovering Azure Subscriptions..." -Level "INFO"
    # OutputPath is determined by the main Invoke-AzureDiscovery function for consistency
    $allSubscriptions = [System.Collections.Generic.List[PSObject]]::new()
    try {
        $subscriptions = Get-AzSubscription -ErrorAction SilentlyContinue
        if ($subscriptions) {
            $subscriptions | ForEach-Object {
                $allSubscriptions.Add([PSCustomObject]@{
                    SubscriptionId   = $_.Id
                    SubscriptionName = $_.Name
                    TenantId         = $_.TenantId
                    State            = $_.State.ToString() # Ensure string
                })
            }
            # Export is handled by the main Invoke-AzureDiscovery function
            Write-MandALog "Retrieved $($allSubscriptions.Count) Azure Subscriptions." -Level "INFO"
        } else {
            Write-MandALog "No Azure Subscriptions found or accessible." -Level "WARN"
        }
    } catch {
        Write-MandALog "Error retrieving Azure Subscriptions: $($_.Exception.Message)" -Level "ERROR"
    }
    return $allSubscriptions
}

function Get-AzureResourceGroupsInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [PSObject]$SubscriptionContext # Current subscription object from Get-AzSubscription
    )
    Write-MandALog "Discovering Resource Groups in subscription '$($SubscriptionContext.SubscriptionName)'..." -Level "INFO"
    $allRGs = [System.Collections.Generic.List[PSObject]]::new()
    try {
        $rgs = Get-AzResourceGroup -ErrorAction SilentlyContinue
        if ($rgs) {
            $rgs | ForEach-Object {
                $allRGs.Add([PSCustomObject]@{
                    SubscriptionId    = $SubscriptionContext.SubscriptionId
                    SubscriptionName  = $SubscriptionContext.SubscriptionName
                    ResourceGroupName = $_.ResourceGroupName
                    Location          = $_.Location
                    ProvisioningState = $_.ProvisioningState
                    Tags              = $_.Tags | ConvertTo-Json -Compress -Depth 3
                })
            }
        } else { Write-MandALog "No Resource Groups found in '$($SubscriptionContext.SubscriptionName)'." -Level "DEBUG" }
    } catch { Write-MandALog "Error retrieving RGs from '$($SubscriptionContext.SubscriptionName)': $($_.Exception.Message)" -Level "ERROR" }
    return $allRGs
}

function Get-AzureVMsDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [PSObject]$SubscriptionContext
    )
    Write-MandALog "Discovering VMs in subscription '$($SubscriptionContext.SubscriptionName)'..." -Level "INFO"
    $allVMs = [System.Collections.Generic.List[PSObject]]::new()
    try {
        $vms = Get-AzVM -Status -ErrorAction SilentlyContinue
        if ($vms) {
            foreach ($vm in $vms) {
                # Simplified IP Config collection for brevity
                $ipConfigs = ($vm.NetworkProfile.NetworkInterfaces | ForEach-Object { 
                    $nic = Get-AzNetworkInterface -ResourceId $_.Id -ErrorAction SilentlyContinue
                    if ($nic) { $nic.IpConfigurations | Select-Object Name, PrivateIpAddress, @{N='PublicIpAddressId';E={$_.PublicIpAddress.Id}}, @{N='SubnetId';E={$_.Subnet.Id}} }
                })
                $allVMs.Add([PSCustomObject]@{
                    SubscriptionId = $SubscriptionContext.SubscriptionId; SubscriptionName = $SubscriptionContext.SubscriptionName
                    VMName = $vm.Name; ResourceGroupName = $vm.ResourceGroupName; Location = $vm.Location; VMId = $vm.Id
                    VMSize = $vm.HardwareProfile.VmSize; OSType = $vm.StorageProfile.OsDisk.OsType
                    ProvisioningState = $vm.ProvisioningState; PowerState = ($vm.Statuses | Where-Object Code -like 'PowerState/*' | Select-Object -ExpandProperty DisplayStatus -First 1)
                    Tags = $vm.Tags | ConvertTo-Json -Compress; IPConfigurations = $ipConfigs | ConvertTo-Json -Compress -Depth 3
                })
            }
        } else { Write-MandALog "No VMs found in '$($SubscriptionContext.SubscriptionName)'." -Level "DEBUG" }
    } catch { Write-MandALog "Error retrieving VMs from '$($SubscriptionContext.SubscriptionName)': $($_.Exception.Message)" -Level "ERROR" }
    return $allVMs
}

function Get-AzureADApplicationsInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [string]$TenantIdForContext # Pass TenantId for logging context
    )
    Write-MandALog "Discovering Azure AD Applications (App Registrations) in tenant '$TenantIdForContext'..." -Level "INFO"
    $allADApps = [System.Collections.Generic.List[PSObject]]::new()
    $allAppOwners = [System.Collections.Generic.List[PSObject]]::new()
    try {
        # AzADApplication cmdlets are tenant-wide, no subscription context needed beyond initial login
        $apps = Get-AzADApplication -First 10000 -ErrorAction SilentlyContinue 
        if ($apps) {
            foreach ($app in $apps) {
                $allADApps.Add([PSCustomObject]@{
                    TenantId = $TenantIdForContext; ApplicationId = $app.AppId; ObjectId = $app.Id; DisplayName = $app.DisplayName
                    SignInAudience = $app.SignInAudience; CreatedDateTime = $app.CreatedDateTime
                    # Add other relevant properties if needed
                })
                $owners = Get-AzADAppOwner -ApplicationObjectId $app.Id -ErrorAction SilentlyContinue
                if ($owners) {
                    $owners | ForEach-Object { $allAppOwners.Add([PSCustomObject]@{
                        ApplicationObjectId = $app.Id; ApplicationDisplayName = $app.DisplayName
                        OwnerObjectId = $_.Id; OwnerType = $_.GetType().Name; OwnerDisplayName = $_.DisplayName
                        OwnerUserPrincipalName = if ($_.PSObject.Properties['UserPrincipalName']) {$_.UserPrincipalName} else {$null}
                    })}
                }
            }
        } else { Write-MandALog "No Azure AD Applications found in tenant '$TenantIdForContext'." -Level "DEBUG" }
    } catch { Write-MandALog "Error retrieving Azure AD Applications: $($_.Exception.Message)" -Level "ERROR" }
    return @{Applications = $allADApps; Owners = $allAppOwners}
}

function Get-AzureServicePrincipalsInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [string]$TenantIdForContext
    )
    Write-MandALog "Discovering Azure Service Principals in tenant '$TenantIdForContext'..." -Level "INFO"
    $allSPs = [System.Collections.Generic.List[PSObject]]::new()
    $allSPOwners = [System.Collections.Generic.List[PSObject]]::new()
    try {
        $sps = Get-AzADServicePrincipal -First 10000 -ErrorAction SilentlyContinue
        if ($sps) {
            foreach ($sp in $sps) {
                $allSPs.Add([PSCustomObject]@{
                    TenantId = $TenantIdForContext; ServicePrincipalId = $sp.Id; ApplicationId = $sp.AppId; DisplayName = $sp.DisplayName
                    ServicePrincipalType = $sp.ServicePrincipalType; AccountEnabled = $sp.AccountEnabled
                    # Add other relevant properties
                })
                $owners = Get-AzADServicePrincipalOwner -ServicePrincipalObjectId $sp.Id -ErrorAction SilentlyContinue
                if ($owners) {
                    $owners | ForEach-Object { $allSPOwners.Add([PSCustomObject]@{
                        ServicePrincipalObjectId = $sp.Id; ServicePrincipalDisplayName = $sp.DisplayName
                        OwnerObjectId = $_.Id; OwnerType = $_.GetType().Name; OwnerDisplayName = $_.DisplayName
                        OwnerUserPrincipalName = if ($_.PSObject.Properties['UserPrincipalName']) {$_.UserPrincipalName} else {$null}
                    })}
                }
            }
        } else { Write-MandALog "No Azure Service Principals found in tenant '$TenantIdForContext'." -Level "DEBUG" }
    } catch { Write-MandALog "Error retrieving Azure Service Principals: $($_.Exception.Message)" -Level "ERROR" }
    return @{ServicePrincipals = $allSPs; Owners = $allSPOwners}
}

# --- (Copy Get-AzurePolicyDataInternal, Get-AzureNetworkSecurityDataInternal, Get-AzureBackupAndRecoveryDataInternal from previous correct version here) ---
# Ensure they take $SubscriptionContext as a parameter.

# --- Main Public Function (Exported) ---
function Invoke-AzureDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "--- Starting Azure Discovery Phase ---" -Level "HEADER"
    $overallStatus = $true
    $allDiscoveredAzureData = @{ Subscriptions = [System.Collections.Generic.List[PSObject]]::new(); ResourceGroups = [System.Collections.Generic.List[PSObject]]::new(); VirtualMachines = [System.Collections.Generic.List[PSObject]]::new(); ADApplications = [System.Collections.Generic.List[PSObject]]::new(); ADApplicationOwners = [System.Collections.Generic.List[PSObject]]::new(); ServicePrincipals = [System.Collections.Generic.List[PSObject]]::new(); ServicePrincipalOwners = [System.Collections.Generic.List[PSObject]]::new(); PolicyAssignments = [System.Collections.Generic.List[PSObject]]::new(); PolicyComplianceStates = [System.Collections.Generic.List[PSObject]]::new(); NetworkSecurityGroups = [System.Collections.Generic.List[PSObject]]::new(); NSGRules = [System.Collections.Generic.List[PSObject]]::new(); Firewalls = [System.Collections.Generic.List[PSObject]]::new(); FirewallPolicies = [System.Collections.Generic.List[PSObject]]::new(); FirewallRuleCollectionGroups = [System.Collections.Generic.List[PSObject]]::new(); RecoveryServicesVaults = [System.Collections.Generic.List[PSObject]]::new(); BackupPolicies = [System.Collections.Generic.List[PSObject]]::new(); BackupItems = [System.Collections.Generic.List[PSObject]]::new(); ASRFabrics = [System.Collections.Generic.List[PSObject]]::new(); ASRReplicatedItems = [System.Collections.Generic.List[PSObject]]::new(); ASRRecoveryPlans = [System.Collections.Generic.List[PSObject]]::new() }
    $outputPath = Join-Path $Configuration.environment.outputPath "Raw"

    if (-not (Get-Module -Name Az.Accounts -ListAvailable)) { Write-MandALog "Az.Accounts module not available." -Level "ERROR"; return $null }
    $currentAzContext = Get-AzContext -ErrorAction SilentlyContinue
    if (-not $currentAzContext) { Write-MandALog "Not connected to Azure." -Level "ERROR"; return $null }
    Write-MandALog "Azure context active: $($currentAzContext.Name) | Tenant: $($currentAzContext.Tenant.Id)" -Level "INFO"

    try {
        $subscriptions = Get-AzureSubscriptionsInternal -Configuration $Configuration
        if ($subscriptions -and $subscriptions.Count -gt 0) {
            $allDiscoveredAzureData.Subscriptions.AddRange($subscriptions)
            
            $processedTenantsForADObjects = @{} # To process each tenant only once for AD objects
            foreach ($subEntry in $subscriptions) {
                $tenantId = $subEntry.TenantId
                if (-not $processedTenantsForADObjects.ContainsKey($tenantId)) {
                    Write-MandALog "Processing Tenant-Level Azure AD Objects for Tenant: $tenantId" -Level "INFO"
                    # AzAD cmdlets are tenant-wide, context of one sub in that tenant is fine
                    Set-AzContext -SubscriptionId $subEntry.SubscriptionId -TenantId $tenantId -ErrorAction Stop | Out-Null
                    
                    $adAppsData = Get-AzureADApplicationsInternal -Configuration $Configuration -TenantIdForContext $tenantId
                    if ($adAppsData.Applications) { $allDiscoveredAzureData.ADApplications.AddRange($adAppsData.Applications) }
                    if ($adAppsData.Owners) { $allDiscoveredAzureData.ADApplicationOwners.AddRange($adAppsData.Owners) }

                    $spData = Get-AzureServicePrincipalsInternal -Configuration $Configuration -TenantIdForContext $tenantId
                    if ($spData.ServicePrincipals) { $allDiscoveredAzureData.ServicePrincipals.AddRange($spData.ServicePrincipals) }
                    if ($spData.Owners) { $allDiscoveredAzureData.ServicePrincipalOwners.AddRange($spData.Owners) }
                    
                    $processedTenantsForADObjects[$tenantId] = $true
                }

                # Switch context for subscription-specific resources
                Write-MandALog "Switching to subscription context: $($subEntry.SubscriptionName) ($($subEntry.SubscriptionId))" -Level "INFO"
                Set-AzContext -SubscriptionId $subEntry.SubscriptionId -TenantId $subEntry.TenantId -ErrorAction Stop | Out-Null
                $currentSubscriptionContext = Get-AzContext # Get the full context object for passing

                $rgs = Get-AzureResourceGroupsInternal -Configuration $Configuration -SubscriptionContext $currentSubscriptionContext
                if ($rgs) { $allDiscoveredAzureData.ResourceGroups.AddRange($rgs) }
                
                $vms = Get-AzureVMsDataInternal -Configuration $Configuration -SubscriptionContext $currentSubscriptionContext
                if ($vms) { $allDiscoveredAzureData.VirtualMachines.AddRange($vms) }
                
                # Call new data point functions
                $policyData = Get-AzurePolicyDataInternal -Configuration $Configuration -SubscriptionContext $currentSubscriptionContext
                if ($policyData.PolicyAssignments) { $allDiscoveredAzureData.PolicyAssignments.AddRange($policyData.PolicyAssignments) }
                if ($policyData.PolicyComplianceStates) { $allDiscoveredAzureData.PolicyComplianceStates.AddRange($policyData.PolicyComplianceStates) }

                $netSecData = Get-AzureNetworkSecurityDataInternal -Configuration $Configuration -SubscriptionContext $currentSubscriptionContext
                if ($netSecData.NSGs) { $allDiscoveredAzureData.NetworkSecurityGroups.AddRange($netSecData.NSGs) }
                if ($netSecData.NSGRules) { $allDiscoveredAzureData.NSGRules.AddRange($netSecData.NSGRules) }
                # ... add other netsec data ...

                $backupData = Get-AzureBackupAndRecoveryDataInternal -Configuration $Configuration -SubscriptionContext $currentSubscriptionContext
                if ($backupData.Vaults) { $allDiscoveredAzureData.RecoveryServicesVaults.AddRange($backupData.Vaults) }
                # ... add other backup data ...
            }
        } else {
             Write-MandALog "No Azure subscriptions retrieved. Azure discovery will be limited." -Level "WARN"
        }

        # Export all collected data
        foreach ($key in $allDiscoveredAzureData.PSObject.Properties.Name) {
            $dataList = $allDiscoveredAzureData[$key]
            if ($dataList -and $dataList.Count -gt 0) {
                Export-DataToCSV -InputObject $dataList -FileName "Azure$($key).csv" -OutputPath $outputPath
                Write-MandALog "Exported $($dataList.Count) items for Azure $key." -Level "SUCCESS"
            } elseif ($dataList -and $dataList.Count -eq 0) { # Check if it's an empty list
                 Write-MandALog "No data collected for Azure $key to export." -Level "INFO"
            }
        }
    } catch { Write-MandALog "Error in Azure Discovery Phase: $($_.Exception.Message)" -Level "ERROR"; $overallStatus = $false }
    if ($overallStatus) { Write-MandALog "--- Azure Discovery Phase Completed Successfully ---" -Level "SUCCESS" }
    else { Write-MandALog "--- Azure Discovery Phase Completed With Errors ---" -Level "ERROR" }
    return $allDiscoveredAzureData
}
Export-ModuleMember -Function Invoke-AzureDiscovery
