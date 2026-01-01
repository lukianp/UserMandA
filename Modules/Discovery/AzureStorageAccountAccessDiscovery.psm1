# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Azure Storage Account Access Discovery Module
.DESCRIPTION
    Comprehensive module for discovering Azure Storage Account configurations, security settings, and access controls.
    Discovers storage account properties, RBAC assignments, access keys, containers, file shares, and public access configurations.
    Extracted from monolithic AzureSecurityDiscovery.psm1 with enhanced data collection capabilities.
.NOTES
    Enhanced to extract maximum information using Azure REST APIs with credential fallback support.
    Last Modified: 2025-12-31
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
                $subsResponse = Invoke-AzRestMethod -Uri $subsUri -Method GET | ConvertFrom-Json
                $subscriptions = $subsResponse.value
            } catch {
                $subscriptions = @()
            }

            foreach ($subscription in $subscriptions) {
                $subId = $subscription.subscriptionId
                $subName = $subscription.displayName

                try {
                    $storageUri = "https://management.azure.com/subscriptions/$subId/providers/Microsoft.Storage/storageAccounts?api-version=2023-01-01"
                    $storageResponse = Invoke-AzRestMethod -Uri $storageUri -Method GET | ConvertFrom-Json
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

                        # Get RBAC assignments for this storage account
                        $rbacAssignments = @()
                        $rbacUri = "https://management.azure.com$($storage.id)/providers/Microsoft.Authorization/roleAssignments?api-version=2022-04-01"
                        try {
                            $rbacResponse = Invoke-AzRestMethod -Uri $rbacUri -Method GET | ConvertFrom-Json
                            $rbacAssignments = $rbacResponse.value
                        } catch {
                            # RBAC access may not be permitted
                        }
                        $rbacAssignmentCount = $rbacAssignments.Count
                        $highPrivilegeRoles = @('Owner', 'Contributor', 'Storage Account Contributor', 'Storage Blob Data Owner')
                        $highPrivilegeAssignments = @($rbacAssignments | Where-Object {
                            $roleDefId = $_.properties.roleDefinitionId
                            $roleName = try {
                                $roleUri = "https://management.azure.com$roleDefId?api-version=2022-04-01"
                                $roleResponse = Invoke-AzRestMethod -Uri $roleUri -Method GET | ConvertFrom-Json
                                $roleResponse.properties.roleName
                            } catch { $null }
                            $roleName -in $highPrivilegeRoles
                        }).Count

                        # Get access keys (if permitted)
                        $accessKeys = @()
                        $keysUri = "https://management.azure.com$($storage.id)/listKeys?api-version=2023-01-01"
                        try {
                            $keysResponse = Invoke-AzRestMethod -Uri $keysUri -Method POST | ConvertFrom-Json
                            $accessKeys = $keysResponse.keys
                        } catch {
                            # Key access may not be permitted
                        }
                        $accessKeyCount = $accessKeys.Count
                        $hasAccessKeys = $accessKeyCount -gt 0

                        # Get blob containers
                        $containers = @()
                        $containersUri = "https://management.azure.com$($storage.id)/blobServices/default/containers?api-version=2021-09-01"
                        try {
                            $containersResponse = Invoke-AzRestMethod -Uri $containersUri -Method GET | ConvertFrom-Json
                            $containers = $containersResponse.value
                        } catch {
                            # Container access may not be permitted
                        }
                        $publicContainers = @($containers | Where-Object { $_.properties.publicAccess -ne 'None' })
                        $containerCount = $containers.Count
                        $publicContainerCount = $publicContainers.Count

                        # Get file shares
                        $fileShares = @()
                        $sharesUri = "https://management.azure.com$($storage.id)/fileServices/default/shares?api-version=2021-09-01"
                        try {
                            $sharesResponse = Invoke-AzRestMethod -Uri $sharesUri -Method GET | ConvertFrom-Json
                            $fileShares = $sharesResponse.value
                        } catch {
                            # File share access may not be permitted
                        }
                        $fileShareCount = $fileShares.Count

                        # Get SAS policies (stored access policies)
                        $sasPolicies = @()
                        # SAS policies are per container/share, this would require enumerating each
                        # For now, we'll note if there are containers/shares that might have policies

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

                            # Enhanced Security Data
                            RBACAssignmentCount = $rbacAssignmentCount
                            HighPrivilegeRBACCount = $highPrivilegeAssignments
                            AccessKeyCount = $accessKeyCount
                            HasAccessKeys = $hasAccessKeys
                            ContainerCount = $containerCount
                            PublicContainerCount = $publicContainerCount
                            FileShareCount = $fileShareCount
                            TotalPublicAccessCount = $publicContainerCount + $publicBlobAccess

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
            $totalRBACAssignments = @($allDiscoveredData | Measure-Object -Property RBACAssignmentCount -Sum).Sum
            $highPrivilegeRBAC = @($allDiscoveredData | Measure-Object -Property HighPrivilegeRBACCount -Sum).Sum
            $accountsWithKeys = @($allDiscoveredData | Where-Object { $_.HasAccessKeys }).Count
            $totalContainers = @($allDiscoveredData | Measure-Object -Property ContainerCount -Sum).Sum
            $totalPublicContainers = @($allDiscoveredData | Measure-Object -Property PublicContainerCount -Sum).Sum
            $totalFileShares = @($allDiscoveredData | Measure-Object -Property FileShareCount -Sum).Sum
            $totalPublicAccess = @($allDiscoveredData | Measure-Object -Property TotalPublicAccessCount -Sum).Sum

            $Result.Metadata["StorageAccountCount"] = $storageCount
            $Result.Metadata["PublicBlobAccessCount"] = $publicBlobCount
            $Result.Metadata["PublicNetworkAccessCount"] = $publicNetworkCount
            $Result.Metadata["WeakTlsCount"] = $weakTlsCount
            $Result.Metadata["TotalRBACAssignments"] = $totalRBACAssignments
            $Result.Metadata["HighPrivilegeRBACCount"] = $highPrivilegeRBAC
            $Result.Metadata["StorageAccountsWithKeys"] = $accountsWithKeys
            $Result.Metadata["TotalContainers"] = $totalContainers
            $Result.Metadata["TotalPublicContainers"] = $totalPublicContainers
            $Result.Metadata["TotalFileShares"] = $totalFileShares
            $Result.Metadata["TotalPublicAccessPoints"] = $totalPublicAccess

            Write-ModuleLog -ModuleName "AzureStorageAccountAccessDiscovery" -Message "Found $storageCount accounts ($publicBlobCount public blob, $publicNetworkCount public network, $weakTlsCount weak TLS, $totalRBACAssignments RBAC assignments, $accountsWithKeys with keys)" -Level "SUCCESS"

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
