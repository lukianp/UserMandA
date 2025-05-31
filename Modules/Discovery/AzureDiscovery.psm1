# Module: AzureDiscovery.psm1
# Description: Handles discovery of Azure resources using Azure PowerShell (Az) modules.
# Version: 1.2.0 (Multiple fixes and new data points)
# Date: 2025-05-31

#Requires -Modules Az.Accounts, Az.Resources, Az.Compute, Az.Network, Az.PolicyInsights, Az.RecoveryServices, Az.Storage, Az.KeyVault, Az.ManagedServiceIdentity

# --- Helper Functions (Assumed to be available globally from Utility Modules) ---
# Export-DataToCSV -FunctionPath $global:MandAUtilitiesModulesPath\FileOperations.psm1
# Write-MandALog -FunctionPath $global:MandAUtilitiesModulesPath\EnhancedLogging.psm1

# --- Private Internal Discovery Functions ---

function Get-AzureSubscriptionsInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "Discovering Azure Subscriptions..." -Level "INFO"
    $outputPath = Join-Path $Configuration.environment.outputPath "Raw"
    $allSubscriptions = [System.Collections.Generic.List[PSObject]]::new()
    try {
        $subscriptions = Get-AzSubscription -ErrorAction SilentlyContinue
        if ($subscriptions) {
            $subscriptions | ForEach-Object {
                $allSubscriptions.Add([PSCustomObject]@{
                    SubscriptionId   = $_.Id
                    SubscriptionName = $_.Name
                    TenantId         = $_.TenantId
                    State            = $_.State
                })
            }
            if ($allSubscriptions.Count -gt 0) {
                Export-DataToCSV -InputObject $allSubscriptions -FileName "AzureSubscriptions.csv" -OutputPath $outputPath
                Write-MandALog "Successfully exported $($allSubscriptions.Count) Azure Subscriptions." -Level "SUCCESS"
            } else {
                 Write-MandALog "Constructed subscription list is empty after processing Get-AzSubscription." -Level "INFO"
            }
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
        [PSObject]$SubscriptionContext
    )
    Write-MandALog "Discovering Resource Groups in subscription '$($SubscriptionContext.Name)'..." -Level "INFO"
    $allRGs = [System.Collections.Generic.List[PSObject]]::new()
    try {
        $rgs = Get-AzResourceGroup -ErrorAction SilentlyContinue
        if ($rgs) {
            $rgs | ForEach-Object {
                $allRGs.Add([PSCustomObject]@{
                    SubscriptionId    = $SubscriptionContext.Id
                    SubscriptionName  = $SubscriptionContext.Name
                    ResourceGroupName = $_.ResourceGroupName
                    Location          = $_.Location
                    ProvisioningState = $_.ProvisioningState
                    Tags              = $_.Tags | ConvertTo-Json -Compress
                })
            }
        } else {
            Write-MandALog "No Resource Groups found in subscription '$($SubscriptionContext.Name)'." -Level "DEBUG"
        }
    } catch {
        Write-MandALog "Error retrieving Resource Groups from '$($SubscriptionContext.Name)': $($_.Exception.Message)" -Level "ERROR"
    }
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
    Write-MandALog "Discovering VMs in subscription '$($SubscriptionContext.Name)'..." -Level "INFO"
    $allVMs = [System.Collections.Generic.List[PSObject]]::new()
    try {
        $vms = Get-AzVM -Status -ErrorAction SilentlyContinue
        if ($vms) {
            foreach ($vm in $vms) {
                $vmNics = Get-AzNetworkInterface -ResourceGroupName $vm.ResourceGroupName -ErrorAction SilentlyContinue | Where-Object {$_.VirtualMachine.Id -eq $vm.Id}
                $ipConfigurations = @()
                if($vmNics){
                    foreach($nic in $vmNics){
                        $nic.IpConfigurations | ForEach-Object {
                            $ipConfigurations.Add([PSCustomObject]@{
                                NicName = $nic.Name
                                PrivateIPAddress = $_.PrivateIpAddress
                                PublicIPAddressId = $_.PublicIpAddress.Id
                                SubnetId = $_.Subnet.Id
                            })
                        }
                    }
                }
                $vmObj = [PSCustomObject]@{
                    SubscriptionId    = $SubscriptionContext.Id
                    SubscriptionName  = $SubscriptionContext.Name
                    VMName            = $vm.Name
                    ResourceGroupName = $vm.ResourceGroupName
                    Location          = $vm.Location
                    VMId              = $vm.Id
                    VMSize            = $vm.HardwareProfile.VmSize
                    OSType            = $vm.StorageProfile.OsDisk.OsType
                    ProvisioningState = $vm.ProvisioningState
                    PowerState        = ($vm.Statuses | Where-Object Code -like 'PowerState/*' | Select-Object -ExpandProperty DisplayStatus -First 1)
                    Tags              = $vm.Tags | ConvertTo-Json -Compress
                    IPConfigurations  = $ipConfigurations | ConvertTo-Json -Compress -Depth 3
                }
                $allVMs.Add($vmObj)
            }
        } else {
             Write-MandALog "No VMs found in subscription '$($SubscriptionContext.Name)'." -Level "DEBUG"
        }
    } catch {
         Write-MandALog "Error retrieving VMs from '$($SubscriptionContext.Name)': $($_.Exception.Message)" -Level "ERROR"
    }
    return $allVMs
}

function Get-AzureADApplicationsInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [PSObject]$SubscriptionContext # Context for logging, AD Apps are tenant-level
    )
    Write-MandALog "Discovering Azure AD Applications (App Registrations) in tenant '$($SubscriptionContext.TenantId)'..." -Level "INFO"
    $allADApps = [System.Collections.Generic.List[PSObject]]::new()
    $allAppOwners = [System.Collections.Generic.List[PSObject]]::new()
    try {
        $apps = Get-AzADApplication -First 10000 -ErrorAction SilentlyContinue # Consider -All if available and performant
        if ($apps) {
            foreach ($app in $apps) {
                $allADApps.Add([PSCustomObject]@{
                    TenantId          = $SubscriptionContext.TenantId # For context
                    ApplicationId     = $app.AppId
                    ObjectId          = $app.Id
                    DisplayName       = $app.DisplayName
                    SignInAudience    = $app.SignInAudience
                    CreatedDateTime   = $app.CreatedDateTime
                    WebRedirectUris   = ($app.Web.RedirectUris -join ';')
                    SpaRedirectUris   = ($app.Spa.RedirectUris -join ';')
                    PublicClientRedirectUris = ($app.PublicClient.RedirectUris -join ';')
                })
                # Get Owners - Corrected cmdlet
                $owners = Get-AzADAppOwner -ApplicationObjectId $app.Id -ErrorAction SilentlyContinue
                if ($owners) {
                    $owners | ForEach-Object {
                        $allAppOwners.Add([PSCustomObject]@{
                            ApplicationObjectId = $app.Id
                            ApplicationDisplayName = $app.DisplayName
                            OwnerObjectId     = $_.Id
                            OwnerType         = $_.GetType().Name # e.g., Microsoft.Azure.Commands.ActiveDirectory.Models.PSADUser
                            OwnerDisplayName  = $_.DisplayName
                            OwnerUserPrincipalName = if ($_.PSObject.Properties['UserPrincipalName']) {$_.UserPrincipalName} else {$null}
                        })
                    }
                }
            }
        } else {
            Write-MandALog "No Azure AD Applications found in tenant '$($SubscriptionContext.TenantId)'." -Level "DEBUG"
        }
    } catch {
        Write-MandALog "Error retrieving Azure AD Applications: $($_.Exception.Message)" -Level "ERROR"
    }
    return @{Applications = $allADApps; Owners = $allAppOwners}
}

function Get-AzureServicePrincipalsInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [PSObject]$SubscriptionContext # Context for logging, SPs are tenant-level
    )
    Write-MandALog "Discovering Azure Service Principals in tenant '$($SubscriptionContext.TenantId)'..." -Level "INFO"
    $allSPs = [System.Collections.Generic.List[PSObject]]::new()
    $allSPOwners = [System.Collections.Generic.List[PSObject]]::new()
    try {
        $sps = Get-AzADServicePrincipal -First 10000 -ErrorAction SilentlyContinue # Consider -All
        if ($sps) {
            foreach ($sp in $sps) {
                $allSPs.Add([PSCustomObject]@{
                    TenantId             = $SubscriptionContext.TenantId
                    ServicePrincipalId   = $sp.Id
                    ApplicationId        = $sp.AppId
                    DisplayName          = $sp.DisplayName
                    ServicePrincipalType = $sp.ServicePrincipalType
                    AccountEnabled       = $sp.AccountEnabled
                    LoginUrl             = $sp.LoginUrl
                    LogoutUrl            = $sp.LogoutUrl
                    Homepage             = $sp.Homepage
                })
                # Get Owners - Corrected parameter name
                $owners = Get-AzADServicePrincipalOwner -ServicePrincipalObjectId $sp.Id -ErrorAction SilentlyContinue
                if ($owners) {
                    $owners | ForEach-Object {
                        $allSPOwners.Add([PSCustomObject]@{
                            ServicePrincipalObjectId = $sp.Id
                            ServicePrincipalDisplayName = $sp.DisplayName
                            OwnerObjectId     = $_.Id
                            OwnerType         = $_.GetType().Name
                            OwnerDisplayName  = $_.DisplayName
                            OwnerUserPrincipalName = if ($_.PSObject.Properties['UserPrincipalName']) {$_.UserPrincipalName} else {$null}
                        })
                    }
                }
            }
        } else {
            Write-MandALog "No Azure Service Principals found in tenant '$($SubscriptionContext.TenantId)'." -Level "DEBUG"
        }
    } catch {
         Write-MandALog "Error retrieving Azure Service Principals: $($_.Exception.Message)" -Level "ERROR"
    }
    return @{ServicePrincipals = $allSPs; Owners = $allSPOwners}
}

# --- New Azure Data Collection Functions from previous response (Get-AzurePolicyDataInternal, etc.) would go here ---
# Get-AzurePolicyDataInternal, Get-AzureNetworkSecurityDataInternal, Get-AzureBackupAndRecoveryDataInternal
# (Copied from previous response, assuming they are self-contained and use $SubscriptionContext and $Configuration)

function Get-AzurePolicyDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [PSObject]$SubscriptionContext
    )
    Write-MandALog "Starting Azure Policy Assignments and Compliance Discovery in '$($SubscriptionContext.Name)'" -Level "INFO"
    $allPolicyAssignments = [System.Collections.Generic.List[PSObject]]::new()
    $allPolicyCompliance = [System.Collections.Generic.List[PSObject]]::new()
    try {
        $assignments = Get-AzPolicyAssignment -ErrorAction SilentlyContinue
        if ($assignments) {
            foreach ($assignment in $assignments) {
                $allPolicyAssignments.Add([PSCustomObject]@{
                    SubscriptionId      = $SubscriptionContext.Id
                    SubscriptionName    = $SubscriptionContext.Name
                    PolicyAssignmentId  = $assignment.PolicyAssignmentId
                    PolicyAssignmentName = $assignment.Name
                    DisplayName         = $assignment.DisplayName
                    Description         = $assignment.Description
                    Scope               = $assignment.Scope
                    PolicyDefinitionId  = $assignment.PolicyDefinitionId
                    EnforcementMode     = $assignment.EnforcementMode.ToString()
                    Parameters          = $assignment.ParametersText
                })
            }
        }
        $discoverCompliance = $true # Default, make this configurable if needed
        if ($Configuration.discovery.azure.discoverPolicyComplianceStates -ne $null) {
            $discoverCompliance = [System.Convert]::ToBoolean($Configuration.discovery.azure.discoverPolicyComplianceStates)
        }
        if ($discoverCompliance) {
            $complianceStates = Get-AzPolicyState -SubscriptionId $SubscriptionContext.Id -ErrorAction SilentlyContinue
            if ($complianceStates) {
                foreach ($state in $complianceStates) {
                     $allPolicyCompliance.Add([PSCustomObject]@{
                        SubscriptionId      = $state.SubscriptionId
                        Timestamp           = $state.Timestamp
                        ResourceId          = $state.ResourceId
                        PolicyAssignmentId  = $state.PolicyAssignmentId
                        PolicyDefinitionId  = $state.PolicyDefinitionId
                        IsCompliant         = $state.IsCompliant
                        ComplianceState     = $state.ComplianceState
                        PolicySetDefinitionId = $state.PolicySetDefinitionId
                        ManagementGroupIds  = $state.ManagementGroupIds
                     })
                }
            }
        }
    } catch { Write-MandALog "Error during Azure Policy Discovery in '$($SubscriptionContext.Name)': $($_.Exception.Message)" -Level "ERROR" }
    return @{ PolicyAssignments = $allPolicyAssignments; PolicyComplianceStates = $allPolicyCompliance }
}

function Get-AzureNetworkSecurityDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [PSObject]$SubscriptionContext
    )
    Write-MandALog "Starting Azure Network Security (NSGs, Firewalls) Discovery in '$($SubscriptionContext.Name)'" -Level "INFO"
    $allNSGs = [System.Collections.Generic.List[PSObject]]::new()
    $allNSGRules = [System.Collections.Generic.List[PSObject]]::new()
    $allFirewalls = [System.Collections.Generic.List[PSObject]]::new()
    $allFirewallPolicies = [System.Collections.Generic.List[PSObject]]::new()
    $allFirewallRuleCollectionGroups = [System.Collections.Generic.List[PSObject]]::new()
    try {
        $nsgs = Get-AzNetworkSecurityGroup -ErrorAction SilentlyContinue
        if ($nsgs) {
            foreach ($nsg in $nsgs) {
                $allNSGs.Add([PSCustomObject]@{
                    SubscriptionId    = $SubscriptionContext.Id; SubscriptionName  = $SubscriptionContext.Name
                    NSGName           = $nsg.Name; ResourceGroupName = $nsg.ResourceGroupName; Location          = $nsg.Location
                    Id                = $nsg.Id; ProvisioningState = $nsg.ProvisioningState; Tags = $nsg.Tag | ConvertTo-Json -Compress
                })
                $nsg.SecurityRules | ForEach-Object { $allNSGRules.Add([PSCustomObject]@{
                    SubscriptionId = $SubscriptionContext.Id; NSGName = $nsg.Name; NSGResourceGroupName = $nsg.ResourceGroupName; RuleName = $_.Name
                    Description = $_.Description; Protocol = $_.Protocol.ToString(); SourcePortRange = ($_.SourcePortRange -join ',')
                    DestinationPortRange  = ($_.DestinationPortRange -join ','); SourceAddressPrefix   = ($_.SourceAddressPrefix -join ',')
                    SourceAddressPrefixes = ($_.SourceAddressPrefixes -join ','); SourceApplicationSecurityGroups = ($_.SourceApplicationSecurityGroups.Id -join ';')
                    DestinationAddressPrefix = ($_.DestinationAddressPrefix -join ','); DestinationAddressPrefixes = ($_.DestinationAddressPrefixes -join ',')
                    DestinationApplicationSecurityGroups = ($_.DestinationApplicationSecurityGroups.Id -join ';'); Access = $_.Access.ToString()
                    Priority = $_.Priority; Direction = $_.Direction.ToString()
                })}
            }
        }
        $firewalls = Get-AzFirewall -ErrorAction SilentlyContinue
        if ($firewalls) {
            foreach ($fw in $firewalls) {
                $allFirewalls.Add([PSCustomObject]@{
                    SubscriptionId = $SubscriptionContext.Id; SubscriptionName = $SubscriptionContext.Name; FirewallName = $fw.Name
                    ResourceGroupName = $fw.ResourceGroupName; Location = $fw.Location; Id = $fw.Id; ProvisioningState = $fw.ProvisioningState
                    ThreatIntelMode = $fw.ThreatIntelMode.ToString(); SKUName = $fw.Sku.Name; SKUTier = $fw.Sku.Tier.ToString()
                    FirewallPolicyId = $fw.FirewallPolicy.Id; VirtualHubId = $fw.VirtualHub.Id
                    HubIpAddresses = ($fw.HubIPAddresses.PublicIPs.Addresses -join ','); Tags = $fw.Tag | ConvertTo-Json -Compress
                    IpConfigurations = ($fw.IpConfigurations | Select-Object Name, @{N='SubnetId';E={$_.Subnet.Id}}, @{N='PublicIpAddressId';E={$_.PublicIpAddress.Id}}) | ConvertTo-Json -Compress
                })
                if ($fw.FirewallPolicy.Id) {
                    try {
                        $fwPolicy = Get-AzFirewallPolicy -ResourceId $fw.FirewallPolicy.Id -ErrorAction Stop
                        $allFirewallPolicies.Add([PSCustomObject]@{
                            SubscriptionId = $SubscriptionContext.Id; PolicyName = $fwPolicy.Name; ResourceGroupName = $fwPolicy.ResourceGroupName
                            Location = $fwPolicy.Location; Id = $fwPolicy.Id; BasePolicyId = $fwPolicy.BasePolicy.Id
                            ThreatIntelMode = $fwPolicy.ThreatIntelMode.ToString(); SkuTier = $fwPolicy.Sku.Tier.ToString()
                            DnsEnableProxy = $fwPolicy.DnsSettings.EnableProxy; RuleCollectionGroupsCount = ($fwPolicy.RuleCollectionGroups | Measure-Object).Count
                            Tags = $fwPolicy.Tag | ConvertTo-Json -Compress
                        })
                        $fwPolicy.RuleCollectionGroups | ForEach-Object {
                            $rcg = Get-AzFirewallPolicyRuleCollectionGroup -ResourceId $_.Id -ErrorAction SilentlyContinue
                            if ($rcg) { $allFirewallRuleCollectionGroups.Add([PSCustomObject]@{
                                SubscriptionId = $SubscriptionContext.Id; FirewallPolicyName = $fwPolicy.Name; RCGName = $rcg.Name; Id = $rcg.Id
                                Priority = $rcg.Priority; RuleCollections = ($rcg.RuleCollection | ForEach-Object {
                                    [PSCustomObject]@{ Name = $_.Name; ActionType = $_.Action.Type.ToString(); RuleCollectionType = $_.GetType().Name; RulesCount = ($_.Rule | Measure-Object).Count }
                                }) | ConvertTo-Json -Compress -Depth 4
                            })}
                        }
                    } catch { Write-MandALog "Could not get Firewall Policy '$($fw.FirewallPolicy.Id)': $($_.Exception.Message)" -Level "WARN" }
                }
            }
        }
    } catch { Write-MandALog "Error during Azure Network Security Discovery in '$($SubscriptionContext.Name)': $($_.Exception.Message)" -Level "ERROR" }
    return @{ NSGs = $allNSGs; NSGRules = $allNSGRules; Firewalls = $allFirewalls; FirewallPolicies = $allFirewallPolicies; FirewallRCGs = $allFirewallRuleCollectionGroups }
}

function Get-AzureBackupAndRecoveryDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [PSObject]$SubscriptionContext
    )
    Write-MandALog "Starting Azure Backup and Site Recovery (ASR) Discovery in '$($SubscriptionContext.Name)'" -Level "INFO"
    $allVaults = [System.Collections.Generic.List[PSObject]]::new()
    $allBackupItems = [System.Collections.Generic.List[PSObject]]::new()
    $allBackupPolicies = [System.Collections.Generic.List[PSObject]]::new()
    $allASRItems = [System.Collections.Generic.List[PSObject]]::new()
    $allASRFabrics = [System.Collections.Generic.List[PSObject]]::new()
    $allASRRecoveryPlans = [System.Collections.Generic.List[PSObject]]::new()
    try {
        $vaults = Get-AzRecoveryServicesVault -ErrorAction SilentlyContinue
        if ($vaults) {
            foreach ($vault in $vaults) {
                $backupStorageRedundancy = try { (Get-AzRecoveryServicesBackupProperty -VaultId $vault.ID -ErrorAction SilentlyContinue).BackupStorageRedundancy } catch { "Unknown" }
                $allVaults.Add([PSCustomObject]@{
                    SubscriptionId = $SubscriptionContext.Id; SubscriptionName = $SubscriptionContext.Name; VaultName = $vault.Name
                    ResourceGroupName = $vault.ResourceGroupName; Location = $vault.Location; Id = $vault.ID; SKU = $vault.Sku.Name
                    StorageRedundancy = $backupStorageRedundancy; Tags = $vault.Tags | ConvertTo-Json -Compress
                })
                Set-AzRecoveryServicesVaultContext -Vault $vault -ErrorAction SilentlyContinue
                $policies = Get-AzRecoveryServicesBackupProtectionPolicy -ErrorAction SilentlyContinue
                if ($policies) { $policies | ForEach-Object { $allBackupPolicies.Add([PSCustomObject]@{
                    SubscriptionId = $SubscriptionContext.Id; VaultName = $vault.Name; PolicyName = $_.Name; WorkloadType = $_.WorkloadType
                    BackupManagementType = $_.BackupManagementType; RetentionPolicy = $_.RetentionPolicy | ConvertTo-Json -Compress -Depth 3
                    SchedulePolicy = $_.SchedulePolicy | ConvertTo-Json -Compress -Depth 3
                })}}
                @("AzureVM", "AzureStorage", "AzureWorkload", "MAB", "SAPHANA", "AzureFiles") | ForEach-Object {
                    $bmt = $_; $workloadType = $bmt; if ($bmt -eq "MAB") {$workloadType = "WindowsServer"} if ($bmt -eq "SAPHANA") {$workloadType = "SAPHanaDatabase"}
                    $items = Get-AzRecoveryServicesBackupItem -BackupManagementType $bmt -WorkloadType $workloadType -ErrorAction SilentlyContinue
                    if ($items) { $items | ForEach-Object { $allBackupItems.Add([PSCustomObject]@{
                        SubscriptionId = $SubscriptionContext.Id; VaultName = $vault.Name; ItemName = $_.Name; ContainerName = $_.ContainerName
                        BackupManagementType = $_.BackupManagementType; WorkloadType = $_.WorkloadType; ProtectionState = $_.ProtectionState.ToString()
                        LastBackupStatus = $_.LastBackupStatus; LastBackupTime = $_.LastBackupTime; PolicyName = $_.PolicyName
                        FriendlyName = $_.FriendlyName; SourceResourceId = $_.SourceResourceId
                    })}}
                }
                $asrFabrics = Get-AzRecoveryServicesAsrFabric -ErrorAction SilentlyContinue
                if ($asrFabrics) {
                    $asrFabrics | ForEach-Object { $allASRFabrics.Add([PSCustomObject]@{
                        SubscriptionId = $SubscriptionContext.Id; VaultName = $vault.Name; FabricName = $_.Name; FriendlyName = $_.FriendlyName; Type = $_.Type
                    })}
                    foreach ($fabric in $asrFabrics) {
                        $containers = Get-AzRecoveryServicesAsrProtectionContainer -Fabric $fabric -ErrorAction SilentlyContinue
                        foreach ($container in $containers) {
                            $asrReplicatedItems = Get-AzRecoveryServicesAsrReplicationProtectedItem -ProtectionContainer $container -ErrorAction SilentlyContinue
                            if ($asrReplicatedItems) { $asrReplicatedItems | ForEach-Object { $allASRItems.Add([PSCustomObject]@{
                                SubscriptionId = $SubscriptionContext.Id; VaultName = $vault.Name; FabricName = $fabric.Name; ProtectionContainerName = $container.Name
                                ASRItemName = $_.Name; FriendlyName = $_.FriendlyName; ProtectedItemType = $_.ProtectedItemType; ReplicationHealth = $_.ReplicationHealth
                                ActiveLocation = $_.ActiveLocation; TestFailoverStatus = $_.TestFailoverStatus; RecoveryAzureVMName = $_.RecoveryAzureVMName
                                PolicyFriendlyName = $_.PolicyFriendlyName; SourceServerId = $_.InnerObject.Properties.ProviderSpecificDetails.InstanceType
                            })}}
                        }
                    }
                }
                $recoveryPlans = Get-AzRecoveryServicesAsrRecoveryPlan -ErrorAction SilentlyContinue
                if ($recoveryPlans) { $recoveryPlans | ForEach-Object { $allASRRecoveryPlans.Add([PSCustomObject]@{
                    SubscriptionId = $SubscriptionContext.Id; VaultName = $vault.Name; RecoveryPlanName = $_.Name; FriendlyName = $_.FriendlyName
                    PrimaryFabricId = $_.PrimaryFabricId; RecoveryFabricId = $_.RecoveryFabricId; GroupsCount = ($_.Groups | Measure-Object).Count
                })}}
            }
        }
    } catch { Write-MandALog "Error during Azure Backup/ASR Discovery in '$($SubscriptionContext.Name)': $($_.Exception.Message)" -Level "ERROR" }
    return @{ Vaults = $allVaults; BackupPolicies = $allBackupPolicies; BackupItems = $allBackupItems; ASRFabrics = $allASRFabrics; ASRItems = $allASRItems; ASRRecoveryPlans = $allASRRecoveryPlans }
}


# --- Main Public Function (Exported) ---

function Invoke-AzureDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    Write-MandALog "--- Starting Azure Discovery Phase ---" -Level "HEADER"
    $overallStatus = $true
    $allDiscoveredAzureData = @{
        Subscriptions = [System.Collections.Generic.List[PSObject]]::new();
        ResourceGroups = [System.Collections.Generic.List[PSObject]]::new();
        VirtualMachines = [System.Collections.Generic.List[PSObject]]::new();
        VirtualNetworks = [System.Collections.Generic.List[PSObject]]::new(); # Assuming you have Get-AzureVNETsDataInternal
        Subnets = [System.Collections.Generic.List[PSObject]]::new(); # Assuming you have Get-AzureVNETsDataInternal which populates subnets
        StorageAccounts = [System.Collections.Generic.List[PSObject]]::new(); # Placeholder
        KeyVaults = [System.Collections.Generic.List[PSObject]]::new(); # Placeholder
        RoleAssignments = [System.Collections.Generic.List[PSObject]]::new(); # Placeholder
        ADApplications = [System.Collections.Generic.List[PSObject]]::new();
        ADApplicationOwners = [System.Collections.Generic.List[PSObject]]::new();
        ServicePrincipals = [System.Collections.Generic.List[PSObject]]::new();
        ServicePrincipalOwners = [System.Collections.Generic.List[PSObject]]::new();
        ManagedIdentities = [System.Collections.Generic.List[PSObject]]::new(); # Placeholder
        PolicyAssignments = [System.Collections.Generic.List[PSObject]]::new();
        PolicyComplianceStates = [System.Collections.Generic.List[PSObject]]::new();
        NetworkSecurityGroups = [System.Collections.Generic.List[PSObject]]::new();
        NSGRules = [System.Collections.Generic.List[PSObject]]::new();
        Firewalls = [System.Collections.Generic.List[PSObject]]::new();
        FirewallPolicies = [System.Collections.Generic.List[PSObject]]::new();
        FirewallRuleCollectionGroups = [System.Collections.Generic.List[PSObject]]::new();
        RecoveryServicesVaults = [System.Collections.Generic.List[PSObject]]::new();
        BackupPolicies = [System.Collections.Generic.List[PSObject]]::new();
        BackupItems = [System.Collections.Generic.List[PSObject]]::new();
        ASRFabrics = [System.Collections.Generic.List[PSObject]]::new();
        ASRReplicatedItems = [System.Collections.Generic.List[PSObject]]::new();
        ASRRecoveryPlans = [System.Collections.Generic.List[PSObject]]::new();
    }
    $outputPath = Join-Path $Configuration.environment.outputPath "Raw"

    if (-not (Get-Module -Name Az.Accounts -ListAvailable)) { Write-MandALog "Az.Accounts module not available." -Level "ERROR"; return $null }
    if (-not (Get-AzContext -ErrorAction SilentlyContinue)) { Write-MandALog "Not connected to Azure." -Level "ERROR"; return $null }
    Write-MandALog "Azure context active: $((Get-AzContext).Name)" -Level "INFO"

    try {
        $subscriptions = Get-AzureSubscriptionsInternal -Configuration $Configuration
        if ($subscriptions -and $subscriptions.Count -gt 0) {
            $allDiscoveredAzureData.Subscriptions.AddRange($subscriptions)
            
            # Tenant level Azure AD object discovery (once per tenant)
            $tenantADDataProcessed = @{} # To process each tenant only once for AD objects
            foreach($subContextForTenant in $subscriptions){ # Iterate through sub contexts to get unique tenant IDs
                 if(-not $tenantADDataProcessed.ContainsKey($subContextForTenant.TenantId)){
                    Write-MandALog "Processing Tenant-Level Azure AD Objects for Tenant: $($subContextForTenant.TenantId)" -Level "INFO"
                    # Temporarily set context to this subscription to ensure tenant context for AzAD cmdlets
                    Set-AzContext -SubscriptionId $subContextForTenant.SubscriptionId -TenantId $subContextForTenant.TenantId -ErrorAction Stop | Out-Null

                    $adAppsData = Get-AzureADApplicationsInternal -Configuration $Configuration -SubscriptionContext $subContextForTenant
                    if ($adAppsData.Applications) { $allDiscoveredAzureData.ADApplications.AddRange($adAppsData.Applications) }
                    if ($adAppsData.Owners) { $allDiscoveredAzureData.ADApplicationOwners.AddRange($adAppsData.Owners) }

                    $spData = Get-AzureServicePrincipalsInternal -Configuration $Configuration -SubscriptionContext $subContextForTenant
                    if ($spData.ServicePrincipals) { $allDiscoveredAzureData.ServicePrincipals.AddRange($spData.ServicePrincipals) }
                    if ($spData.Owners) { $allDiscoveredAzureData.ServicePrincipalOwners.AddRange($spData.Owners) }
                    
                    $tenantADDataProcessed[$subContextForTenant.TenantId] = $true
                 }
            }


            foreach ($subContext in $subscriptions) {
                Write-MandALog "Switching to subscription context: $($subContext.SubscriptionName) ($($subContext.SubscriptionId))" -Level "INFO"
                Set-AzContext -SubscriptionId $subContext.SubscriptionId -TenantId $subContext.TenantId -ErrorAction Stop | Out-Null

                # Resource Groups
                $rgs = Get-AzureResourceGroupsInternal -Configuration $Configuration -SubscriptionContext $subContext
                if ($rgs) { $allDiscoveredAzureData.ResourceGroups.AddRange($rgs) }
                
                # VMs
                $vms = Get-AzureVMsDataInternal -Configuration $Configuration -SubscriptionContext $subContext
                if ($vms) { $allDiscoveredAzureData.VirtualMachines.AddRange($vms) }

                # --- Call other existing Azure discovery functions here, passing $subContext ---
                # e.g., Get-AzureVNETsDataInternal, Get-AzureStorageAccountsInternal, etc.
                # Example:
                # $vnetData = Get-AzureVNETsDataInternal -Configuration $Configuration -SubscriptionContext $subContext
                # if ($vnetData.VNETs) { $allDiscoveredAzureData.VirtualNetworks.AddRange($vnetData.VNETs) }
                # if ($vnetData.Subnets) { $allDiscoveredAzureData.Subnets.AddRange($vnetData.Subnets) }

                # New discovery functions
                $policyData = Get-AzurePolicyDataInternal -Configuration $Configuration -SubscriptionContext $subContext
                if ($policyData.PolicyAssignments) { $allDiscoveredAzureData.PolicyAssignments.AddRange($policyData.PolicyAssignments) }
                if ($policyData.PolicyComplianceStates) { $allDiscoveredAzureData.PolicyComplianceStates.AddRange($policyData.PolicyComplianceStates) }

                $netSecData = Get-AzureNetworkSecurityDataInternal -Configuration $Configuration -SubscriptionContext $subContext
                if ($netSecData.NSGs) { $allDiscoveredAzureData.NetworkSecurityGroups.AddRange($netSecData.NSGs) }
                if ($netSecData.NSGRules) { $allDiscoveredAzureData.NSGRules.AddRange($netSecData.NSGRules) }
                if ($netSecData.Firewalls) { $allDiscoveredAzureData.Firewalls.AddRange($netSecData.Firewalls) }
                if ($netSecData.FirewallPolicies) { $allDiscoveredAzureData.FirewallPolicies.AddRange($netSecData.FirewallPolicies) }
                if ($netSecData.FirewallRCGs) { $allDiscoveredAzureData.FirewallRuleCollectionGroups.AddRange($netSecData.FirewallRCGs) }


                $backupData = Get-AzureBackupAndRecoveryDataInternal -Configuration $Configuration -SubscriptionContext $subContext
                if ($backupData.Vaults) { $allDiscoveredAzureData.RecoveryServicesVaults.AddRange($backupData.Vaults) }
                if ($backupData.BackupPolicies) { $allDiscoveredAzureData.BackupPolicies.AddRange($backupData.BackupPolicies) }
                if ($backupData.BackupItems) { $allDiscoveredAzureData.BackupItems.AddRange($backupData.BackupItems) }
                if ($backupData.ASRFabrics) { $allDiscoveredAzureData.ASRFabrics.AddRange($backupData.ASRFabrics) }
                if ($backupData.ASRItems) { $allDiscoveredAzureData.ASRReplicatedItems.AddRange($backupData.ASRItems) }
                if ($backupData.ASRRecoveryPlans) { $allDiscoveredAzureData.ASRRecoveryPlans.AddRange($backupData.ASRRecoveryPlans) }
            }
        }

        # Export all collected data
        foreach ($key in $allDiscoveredAzureData.PSObject.Properties.Name) {
            $dataList = $allDiscoveredAzureData[$key]
            if ($dataList -and $dataList.Count -gt 0) {
                Export-DataToCSV -InputObject $dataList -FileName "Azure$($key).csv" -OutputPath $outputPath
                Write-MandALog "Exported $($dataList.Count) items for Azure $key." -Level "SUCCESS"
            } elseif ($dataList) { # It's a list, but empty
                 Write-MandALog "No data found/collected for Azure $key to export." -Level "INFO"
            }
        }
        
    } catch {
        Write-MandALog "An error occurred during the Azure Discovery Phase: $($_.Exception.Message)" -Level "ERROR"
        $overallStatus = $false
    }

    if ($overallStatus) {
        Write-MandALog "--- Azure Discovery Phase Completed Successfully ---" -Level "SUCCESS"
    } else {
        Write-MandALog "--- Azure Discovery Phase Completed With Errors ---" -Level "ERROR"
    }
    
    return $allDiscoveredAzureData
}

Export-ModuleMember -Function Invoke-AzureDiscovery
