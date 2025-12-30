# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Azure Storage Account Access Discovery Module
.DESCRIPTION
    Focused module for discovering Azure Storage Account Access configurations and security settings.
    Extracted from monolithic AzureSecurityDiscovery.psm1.
#>

Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Invoke-AzureStorageAccountAccessDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [hashtable]$Context,
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-ModuleLog -ModuleName "AzureStorageAccountAccessDiscovery" -Message "Starting Storage Account Access Discovery..." -Level "INFO"

    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)

        $allDiscoveredData = [System.Collections.ArrayList]::new()

        try {
            $subscriptions = @()
            try {
                $subsUri = "https://management.azure.com/subscriptions?api-version=2020-01-01"
                $subsResponse = Invoke-MgGraphRequest -Uri $subsUri -Method GET
                $subscriptions = $subsResponse.value
            } catch {
                $subscriptions = @()
            }

            foreach ($subscription in $subscriptions) {
                $subId = $subscription.subscriptionId
                $subName = $subscription.displayName

                try {
                    $storageUri = "https://management.azure.com/subscriptions/$subId/providers/Microsoft.Storage/storageAccounts?api-version=2023-01-01"
                    $storageResponse = Invoke-MgGraphRequest -Uri $storageUri -Method GET
                    $storageAccounts = $storageResponse.value

                    foreach ($storage in $storageAccounts) {
                        $resourceGroup = ($storage.id -split '/resourceGroups/')[1] -split '/' | Select-Object -First 1
                        $properties = $storage.properties

                        $allowBlobPublicAccess = $properties.allowBlobPublicAccess -eq $true
                        $allowSharedKeyAccess = $properties.allowSharedKeyAccess -ne $false
                        $httpsOnly = $properties.supportsHttpsTrafficOnly -eq $true
                        $minimumTlsVersion = $properties.minimumTlsVersion
                        $isTls12 = $minimumTlsVersion -eq 'TLS1_2'

                        $networkRules = $properties.networkAcls
                        $defaultAction = if ($networkRules) { $networkRules.defaultAction } else { 'Allow' }
                        $isPubliclyAccessible = $defaultAction -eq 'Allow'
                        $virtualNetworkRules = if ($networkRules.virtualNetworkRules) { @($networkRules.virtualNetworkRules).Count } else { 0 }
                        $ipRules = if ($networkRules.ipRules) { @($networkRules.ipRules).Count } else { 0 }
                        $bypass = if ($networkRules.bypass) { $networkRules.bypass } else { 'None' }

                        $encryption = $properties.encryption
                        $keySource = if ($encryption) { $encryption.keySource } else { 'Microsoft.Storage' }
                        $isCustomerManagedKey = $keySource -ne 'Microsoft.Storage'
                        $requireInfraEncryption = $encryption.requireInfrastructureEncryption -eq $true

                        $storageData = [PSCustomObject]@{
                            ObjectType = "StorageAccountAccess"
                            Id = $storage.id
                            Name = $storage.name
                            Location = $storage.location
                            ResourceGroup = $resourceGroup
                            SubscriptionId = $subId
                            SubscriptionName = $subName
                            Kind = $storage.kind
                            SkuName = $storage.sku.name
                            SkuTier = $storage.sku.tier
                            CreationTime = $properties.creationTime
                            PrimaryLocation = $properties.primaryLocation
                            StatusOfPrimary = $properties.statusOfPrimary
                            AllowBlobPublicAccess = $allowBlobPublicAccess
                            AllowSharedKeyAccess = $allowSharedKeyAccess
                            HttpsOnly = $httpsOnly
                            MinimumTlsVersion = $minimumTlsVersion
                            IsTls12 = $isTls12
                            NetworkDefaultAction = $defaultAction
                            IsPubliclyAccessible = $isPubliclyAccessible
                            VirtualNetworkRuleCount = $virtualNetworkRules
                            IpRuleCount = $ipRules
                            NetworkBypass = $bypass
                            KeySource = $keySource
                            IsCustomerManagedKey = $isCustomerManagedKey
                            RequireInfrastructureEncryption = $requireInfraEncryption
                            BlobEndpoint = $properties.primaryEndpoints.blob
                            FileEndpoint = $properties.primaryEndpoints.file
                            TableEndpoint = $properties.primaryEndpoints.table
                            QueueEndpoint = $properties.primaryEndpoints.queue
                            HasPublicBlobAccess = $allowBlobPublicAccess
                            HasWeakTls = -not $isTls12
                            HasPublicNetworkAccess = $isPubliclyAccessible
                            _DataType = 'StorageAccountAccess'
                            SessionId = $SessionId
                        }
                        $null = $allDiscoveredData.Add($storageData)
                    }
                } catch {
                    Write-ModuleLog -ModuleName "AzureStorageAccountAccessDiscovery" -Message "Could not enumerate Storage Accounts in subscription $subName" -Level "WARNING"
                }
            }

            $storageCount = @($allDiscoveredData).Count
            $publicBlobCount = @($allDiscoveredData | Where-Object { $_.HasPublicBlobAccess }).Count
            $publicNetworkCount = @($allDiscoveredData | Where-Object { $_.HasPublicNetworkAccess }).Count
            $weakTlsCount = @($allDiscoveredData | Where-Object { $_.HasWeakTls }).Count
            $Result.Metadata["StorageAccountCount"] = $storageCount
            $Result.Metadata["PublicBlobAccessCount"] = $publicBlobCount
            $Result.Metadata["PublicNetworkAccessCount"] = $publicNetworkCount
            $Result.Metadata["WeakTlsCount"] = $weakTlsCount
            Write-ModuleLog -ModuleName "AzureStorageAccountAccessDiscovery" -Message "Found $storageCount accounts ($publicBlobCount public blob, $publicNetworkCount public network, $weakTlsCount weak TLS)" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover Storage Account Access: $($_.Exception.Message)", $_.Exception, @{Section="StorageAccountAccess"})
        }

        $Result.RecordCount = @($allDiscoveredData).Count
        return $allDiscoveredData | Group-Object -Property _DataType
    }

    $params = @{
        ModuleName = "AzureStorageAccountAccessDiscovery"
        Configuration = $Configuration
        Context = $Context
        SessionId = $SessionId
        DiscoveryScript = $discoveryScript
        RequiredConnections = @('Azure')
    }

    return Invoke-StandardDiscovery @params
}

Export-ModuleMember -Function Invoke-AzureStorageAccountAccessDiscovery
