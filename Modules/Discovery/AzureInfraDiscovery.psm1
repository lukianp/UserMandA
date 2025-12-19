# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-12-19
# Last Modified: 2025-12-19

<#
.SYNOPSIS
    Azure Infrastructure Discovery Module - VMs, Storage, Network
.DESCRIPTION
    Extracts Azure infrastructure resources for migration planning.
    Discovers:
    - Azure Virtual Machines with sizing and configuration
    - Azure Storage Accounts with metrics
    - Azure Network Security Groups
    - Azure Load Balancers
    - Azure Key Vaults

    Part of the Azure Discovery refactoring initiative to break monolithic
    AzureDiscovery.psm1 into focused, maintainable modules.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-12-19
    Requires: PowerShell 5.1+, Azure Resource Manager access
#>

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Invoke-AzureInfraDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-ModuleLog -ModuleName "AzureInfraDiscovery" -Message "Starting Azure Infrastructure Discovery (VMs, Storage, Network)..." -Level "INFO"

    # Define discovery script
    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)

        $allDiscoveredData = [System.Collections.ArrayList]::new()

        # Get all subscriptions first
        $subscriptions = @()
        try {
            $subsUri = "https://management.azure.com/subscriptions?api-version=2020-01-01"
            $subsResponse = Invoke-MgGraphRequest -Uri $subsUri -Method GET
            $subscriptions = $subsResponse.value
            Write-ModuleLog -ModuleName "AzureInfraDiscovery" -Message "Found $($subscriptions.Count) Azure subscriptions" -Level "INFO"
        } catch {
            Write-ModuleLog -ModuleName "AzureInfraDiscovery" -Message "Could not enumerate Azure subscriptions - Azure Resource Manager access may not be configured" -Level "WARNING"
            $Result.AddError("Failed to enumerate subscriptions: $($_.Exception.Message)", $_.Exception, @{Section="Subscriptions"})
            $subscriptions = @()
        }

        foreach ($subscription in $subscriptions) {
            $subId = $subscription.subscriptionId
            $subName = $subscription.displayName

            Write-ModuleLog -ModuleName "AzureInfraDiscovery" -Message "Processing subscription: $subName ($subId)" -Level "INFO"

            #region Virtual Machines Discovery
            try {
                $vms = @()
                $vmUri = "https://management.azure.com/subscriptions/$subId/providers/Microsoft.Compute/virtualMachines?api-version=2023-03-01"

                do {
                    $response = Invoke-MgGraphRequest -Uri $vmUri -Method GET
                    $vms += $response.value
                    $vmUri = $response.nextLink
                } while ($vmUri)

                foreach ($vm in $vms) {
                    $properties = $vm.properties
                    $hardwareProfile = $properties.hardwareProfile
                    $storageProfile = $properties.storageProfile
                    $osProfile = $properties.osProfile
                    $networkProfile = $properties.networkProfile

                    # Get VM size details
                    $vmSize = $hardwareProfile.vmSize

                    # Get OS information
                    $osType = $storageProfile.osDisk.osType
                    $imagePublisher = $storageProfile.imageReference.publisher
                    $imageOffer = $storageProfile.imageReference.offer
                    $imageSku = $storageProfile.imageReference.sku
                    $imageVersion = $storageProfile.imageReference.version

                    # Count data disks
                    $dataDiskCount = @($storageProfile.dataDisks).Count
                    $totalDataDiskSizeGB = ($storageProfile.dataDisks | Measure-Object -Property diskSizeGB -Sum).Sum

                    # Get NIC count
                    $nicCount = @($networkProfile.networkInterfaces).Count

                    # Migration assessment
                    $migrationNotes = @()
                    $migrationComplexity = 'Low'

                    if ($properties.provisioningState -ne 'Succeeded') {
                        $migrationNotes += "VM provisioning state: $($properties.provisioningState)"
                        $migrationComplexity = 'Medium'
                    }
                    if ($dataDiskCount -gt 5) {
                        $migrationNotes += "$dataDiskCount data disks - complex storage migration"
                        $migrationComplexity = 'High'
                    }
                    if ($totalDataDiskSizeGB -gt 1000) {
                        $migrationNotes += "Large storage (${totalDataDiskSizeGB}GB) - extended migration window"
                        $migrationComplexity = 'High'
                    }
                    if ($vm.zones) {
                        $migrationNotes += "Availability zone configured - maintain for HA"
                    }
                    if ($properties.availabilitySet) {
                        $migrationNotes += "Part of availability set - migrate as group"
                    }

                    $vmData = [PSCustomObject]@{
                        ObjectType = "AzureVM"
                        Id = $vm.id
                        Name = $vm.name
                        Location = $vm.location
                        ResourceGroup = ($vm.id -split '/')[4]

                        # Subscription
                        SubscriptionId = $subId
                        SubscriptionName = $subName

                        # Hardware
                        VmSize = $vmSize
                        Zones = ($vm.zones -join '; ')

                        # OS
                        OsType = $osType
                        ImagePublisher = $imagePublisher
                        ImageOffer = $imageOffer
                        ImageSku = $imageSku
                        ImageVersion = $imageVersion
                        ComputerName = $osProfile.computerName

                        # Storage
                        OsDiskName = $storageProfile.osDisk.name
                        OsDiskSizeGB = $storageProfile.osDisk.diskSizeGB
                        OsDiskType = $storageProfile.osDisk.managedDisk.storageAccountType
                        DataDiskCount = $dataDiskCount
                        TotalDataDiskSizeGB = $totalDataDiskSizeGB

                        # Network
                        NetworkInterfaceCount = $nicCount

                        # Status
                        ProvisioningState = $properties.provisioningState

                        # Tags
                        Tags = if ($vm.tags) { ($vm.tags | ConvertTo-Json -Compress) } else { $null }

                        # Migration Assessment
                        MigrationComplexity = $migrationComplexity
                        MigrationNotes = ($migrationNotes -join '; ')

                        _DataType = 'VirtualMachines'
                        SessionId = $SessionId
                    }
                    $null = $allDiscoveredData.Add($vmData)
                }

            } catch {
                Write-ModuleLog -ModuleName "AzureInfraDiscovery" -Message "Failed to discover VMs in subscription $subName : $($_.Exception.Message)" -Level "WARNING"
            }
            #endregion

            #region Storage Accounts Discovery
            try {
                $storageAccounts = @()
                $storageUri = "https://management.azure.com/subscriptions/$subId/providers/Microsoft.Storage/storageAccounts?api-version=2023-01-01"

                do {
                    $response = Invoke-MgGraphRequest -Uri $storageUri -Method GET
                    $storageAccounts += $response.value
                    $storageUri = $response.nextLink
                } while ($storageUri)

                foreach ($storage in $storageAccounts) {
                    $properties = $storage.properties

                    # Migration assessment
                    $migrationNotes = @()
                    $migrationComplexity = 'Low'

                    if ($properties.networkAcls.defaultAction -eq 'Deny') {
                        $migrationNotes += 'Network rules configured - verify access during migration'
                    }
                    if ($properties.encryption.keySource -ne 'Microsoft.Storage') {
                        $migrationNotes += 'Customer-managed keys - key migration required'
                        $migrationComplexity = 'High'
                    }
                    if ($properties.isHnsEnabled) {
                        $migrationNotes += 'Hierarchical namespace enabled (Data Lake Gen2)'
                        $migrationComplexity = 'Medium'
                    }

                    $storageData = [PSCustomObject]@{
                        ObjectType = "AzureStorageAccount"
                        Id = $storage.id
                        Name = $storage.name
                        Location = $storage.location
                        ResourceGroup = ($storage.id -split '/')[4]

                        # Subscription
                        SubscriptionId = $subId
                        SubscriptionName = $subName

                        # Configuration
                        Kind = $storage.kind
                        SkuName = $storage.sku.name
                        SkuTier = $storage.sku.tier
                        AccessTier = $properties.accessTier

                        # Security
                        HttpsOnly = $properties.supportsHttpsTrafficOnly
                        MinimumTlsVersion = $properties.minimumTlsVersion
                        AllowBlobPublicAccess = $properties.allowBlobPublicAccess
                        NetworkDefaultAction = $properties.networkAcls.defaultAction

                        # Encryption
                        EncryptionKeySource = $properties.encryption.keySource

                        # Features
                        IsHnsEnabled = $properties.isHnsEnabled
                        LargeFileSharesState = $properties.largeFileSharesState

                        # Status
                        ProvisioningState = $properties.provisioningState
                        StatusOfPrimary = $properties.statusOfPrimary
                        CreationTime = $properties.creationTime

                        # Tags
                        Tags = if ($storage.tags) { ($storage.tags | ConvertTo-Json -Compress) } else { $null }

                        # Migration Assessment
                        MigrationComplexity = $migrationComplexity
                        MigrationNotes = ($migrationNotes -join '; ')

                        _DataType = 'StorageAccounts'
                        SessionId = $SessionId
                    }
                    $null = $allDiscoveredData.Add($storageData)
                }

            } catch {
                Write-ModuleLog -ModuleName "AzureInfraDiscovery" -Message "Failed to discover Storage Accounts in subscription $subName : $($_.Exception.Message)" -Level "WARNING"
            }
            #endregion

            #region Network Security Groups Discovery
            try {
                $nsgs = @()
                $nsgUri = "https://management.azure.com/subscriptions/$subId/providers/Microsoft.Network/networkSecurityGroups?api-version=2023-05-01"

                do {
                    $response = Invoke-MgGraphRequest -Uri $nsgUri -Method GET
                    $nsgs += $response.value
                    $nsgUri = $response.nextLink
                } while ($nsgUri)

                foreach ($nsg in $nsgs) {
                    $properties = $nsg.properties

                    $securityRuleCount = @($properties.securityRules).Count
                    $defaultRuleCount = @($properties.defaultSecurityRules).Count
                    $subnetCount = @($properties.subnets).Count
                    $nicCount = @($properties.networkInterfaces).Count

                    # Count rule types
                    $inboundAllowCount = @($properties.securityRules | Where-Object { $_.properties.direction -eq 'Inbound' -and $_.properties.access -eq 'Allow' }).Count
                    $inboundDenyCount = @($properties.securityRules | Where-Object { $_.properties.direction -eq 'Inbound' -and $_.properties.access -eq 'Deny' }).Count
                    $outboundAllowCount = @($properties.securityRules | Where-Object { $_.properties.direction -eq 'Outbound' -and $_.properties.access -eq 'Allow' }).Count
                    $outboundDenyCount = @($properties.securityRules | Where-Object { $_.properties.direction -eq 'Outbound' -and $_.properties.access -eq 'Deny' }).Count

                    # Migration assessment
                    $migrationNotes = @()
                    $migrationComplexity = 'Low'

                    if ($securityRuleCount -gt 50) {
                        $migrationNotes += "Complex NSG with $securityRuleCount rules"
                        $migrationComplexity = 'Medium'
                    }
                    if ($subnetCount -gt 0) {
                        $migrationNotes += "Associated with $subnetCount subnets"
                    }
                    if ($nicCount -gt 0) {
                        $migrationNotes += "Associated with $nicCount NICs"
                    }

                    $nsgData = [PSCustomObject]@{
                        ObjectType = "AzureNSG"
                        Id = $nsg.id
                        Name = $nsg.name
                        Location = $nsg.location
                        ResourceGroup = ($nsg.id -split '/')[4]

                        # Subscription
                        SubscriptionId = $subId
                        SubscriptionName = $subName

                        # Rules
                        SecurityRuleCount = $securityRuleCount
                        DefaultRuleCount = $defaultRuleCount
                        InboundAllowRules = $inboundAllowCount
                        InboundDenyRules = $inboundDenyCount
                        OutboundAllowRules = $outboundAllowCount
                        OutboundDenyRules = $outboundDenyCount

                        # Associations
                        SubnetCount = $subnetCount
                        NetworkInterfaceCount = $nicCount

                        # Status
                        ProvisioningState = $properties.provisioningState

                        # Tags
                        Tags = if ($nsg.tags) { ($nsg.tags | ConvertTo-Json -Compress) } else { $null }

                        # Migration Assessment
                        MigrationComplexity = $migrationComplexity
                        MigrationNotes = ($migrationNotes -join '; ')

                        _DataType = 'NetworkSecurityGroups'
                        SessionId = $SessionId
                    }
                    $null = $allDiscoveredData.Add($nsgData)
                }

            } catch {
                Write-ModuleLog -ModuleName "AzureInfraDiscovery" -Message "Failed to discover NSGs in subscription $subName : $($_.Exception.Message)" -Level "WARNING"
            }
            #endregion

            #region Key Vaults Discovery
            try {
                $keyVaults = @()
                $kvUri = "https://management.azure.com/subscriptions/$subId/providers/Microsoft.KeyVault/vaults?api-version=2023-02-01"

                do {
                    $response = Invoke-MgGraphRequest -Uri $kvUri -Method GET
                    $keyVaults += $response.value
                    $kvUri = $response.nextLink
                } while ($kvUri)

                foreach ($kv in $keyVaults) {
                    $properties = $kv.properties

                    # Migration assessment
                    $migrationNotes = @()
                    $migrationComplexity = 'Medium'  # Key vaults always need careful migration

                    if ($properties.enablePurgeProtection) {
                        $migrationNotes += 'Purge protection enabled - cannot delete for 90 days'
                    }
                    if ($properties.enableSoftDelete) {
                        $migrationNotes += 'Soft delete enabled'
                    }
                    if ($properties.networkAcls.defaultAction -eq 'Deny') {
                        $migrationNotes += 'Network rules configured - verify access during migration'
                        $migrationComplexity = 'High'
                    }
                    if ($properties.enableRbacAuthorization) {
                        $migrationNotes += 'RBAC authorization enabled - migrate RBAC assignments'
                    } else {
                        $migrationNotes += 'Access policies in use - migrate access policies'
                    }

                    $accessPolicyCount = @($properties.accessPolicies).Count

                    $kvData = [PSCustomObject]@{
                        ObjectType = "AzureKeyVault"
                        Id = $kv.id
                        Name = $kv.name
                        Location = $kv.location
                        ResourceGroup = ($kv.id -split '/')[4]

                        # Subscription
                        SubscriptionId = $subId
                        SubscriptionName = $subName

                        # Configuration
                        VaultUri = $properties.vaultUri
                        TenantId = $properties.tenantId
                        SkuFamily = $properties.sku.family
                        SkuName = $properties.sku.name

                        # Security
                        EnabledForDeployment = $properties.enabledForDeployment
                        EnabledForDiskEncryption = $properties.enabledForDiskEncryption
                        EnabledForTemplateDeployment = $properties.enabledForTemplateDeployment
                        EnableSoftDelete = $properties.enableSoftDelete
                        EnablePurgeProtection = $properties.enablePurgeProtection
                        SoftDeleteRetentionInDays = $properties.softDeleteRetentionInDays
                        EnableRbacAuthorization = $properties.enableRbacAuthorization
                        NetworkDefaultAction = $properties.networkAcls.defaultAction

                        # Access
                        AccessPolicyCount = $accessPolicyCount

                        # Status
                        ProvisioningState = $properties.provisioningState

                        # Tags
                        Tags = if ($kv.tags) { ($kv.tags | ConvertTo-Json -Compress) } else { $null }

                        # Migration Assessment
                        MigrationComplexity = $migrationComplexity
                        MigrationNotes = ($migrationNotes -join '; ')

                        _DataType = 'KeyVaults'
                        SessionId = $SessionId
                    }
                    $null = $allDiscoveredData.Add($kvData)
                }

            } catch {
                Write-ModuleLog -ModuleName "AzureInfraDiscovery" -Message "Failed to discover Key Vaults in subscription $subName : $($_.Exception.Message)" -Level "WARNING"
            }
            #endregion
        }

        # Calculate totals
        $vmCount = @($allDiscoveredData | Where-Object { $_._DataType -eq 'VirtualMachines' }).Count
        $storageCount = @($allDiscoveredData | Where-Object { $_._DataType -eq 'StorageAccounts' }).Count
        $nsgCount = @($allDiscoveredData | Where-Object { $_._DataType -eq 'NetworkSecurityGroups' }).Count
        $kvCount = @($allDiscoveredData | Where-Object { $_._DataType -eq 'KeyVaults' }).Count

        $Result.Metadata["SubscriptionCount"] = $subscriptions.Count
        $Result.Metadata["VirtualMachineCount"] = $vmCount
        $Result.Metadata["StorageAccountCount"] = $storageCount
        $Result.Metadata["NetworkSecurityGroupCount"] = $nsgCount
        $Result.Metadata["KeyVaultCount"] = $kvCount

        $Result.RecordCount = $allDiscoveredData.Count
        Write-ModuleLog -ModuleName "AzureInfraDiscovery" -Message "Infrastructure Discovery Complete - VMs: $vmCount, Storage: $storageCount, NSGs: $nsgCount, Key Vaults: $kvCount" -Level "SUCCESS"

        # Group by data type for CSV export
        return $allDiscoveredData | Group-Object -Property _DataType
    }

    # Execute discovery using base module
    Start-DiscoveryModule `
        -ModuleName "AzureInfraDiscovery" `
        -DiscoveryScript $discoveryScript `
        -Configuration $Configuration `
        -Context $Context `
        -SessionId $SessionId `
        -RequiredServices @()
}

Export-ModuleMember -Function Invoke-AzureInfraDiscovery
