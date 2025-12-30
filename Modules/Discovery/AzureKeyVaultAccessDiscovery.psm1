# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Azure Key Vault Access Policies Discovery Module
.DESCRIPTION
    Focused module for discovering Azure Key Vault Access Policies.
    Extracted from monolithic AzureSecurityDiscovery.psm1.
#>

Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Invoke-AzureKeyVaultAccessDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [hashtable]$Context,
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-ModuleLog -ModuleName "AzureKeyVaultAccessDiscovery" -Message "Starting Key Vault Access Policies Discovery..." -Level "INFO"

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
                    $kvUri = "https://management.azure.com/subscriptions/$subId/providers/Microsoft.KeyVault/vaults?api-version=2022-07-01"
                    $kvResponse = Invoke-MgGraphRequest -Uri $kvUri -Method GET
                    $keyVaults = $kvResponse.value

                    foreach ($kv in $keyVaults) {
                        $kvName = $kv.name
                        $kvId = $kv.id
                        $kvLocation = $kv.location
                        $resourceGroup = ($kvId -split '/resourceGroups/')[1] -split '/' | Select-Object -First 1

                        try {
                            $kvDetailUri = "https://management.azure.com$kvId`?api-version=2022-07-01"
                            $kvDetails = Invoke-MgGraphRequest -Uri $kvDetailUri -Method GET
                            $properties = $kvDetails.properties
                            $accessPolicies = $properties.accessPolicies

                            foreach ($policy in $accessPolicies) {
                                $principalName = "Unknown"
                                $principalType = "Unknown"
                                try {
                                    $principalUri = "https://graph.microsoft.com/v1.0/directoryObjects/$($policy.objectId)"
                                    $principalResponse = Invoke-MgGraphRequest -Uri $principalUri -Method GET
                                    $principalName = $principalResponse.displayName
                                    $principalType = switch ($principalResponse.'@odata.type') {
                                        '#microsoft.graph.user' { 'User' }
                                        '#microsoft.graph.group' { 'Group' }
                                        '#microsoft.graph.servicePrincipal' { 'ServicePrincipal' }
                                        default { $principalResponse.'@odata.type' }
                                    }
                                } catch { }

                                $secretPerms = @($policy.permissions.secrets) -join '; '
                                $keyPerms = @($policy.permissions.keys) -join '; '
                                $certPerms = @($policy.permissions.certificates) -join '; '
                                $storagePerms = @($policy.permissions.storage) -join '; '

                                $hasSecretsAccess = $policy.permissions.secrets -and @($policy.permissions.secrets).Count -gt 0
                                $hasKeysAccess = $policy.permissions.keys -and @($policy.permissions.keys).Count -gt 0
                                $hasCertificatesAccess = $policy.permissions.certificates -and @($policy.permissions.certificates).Count -gt 0
                                $hasFullAccess = $secretPerms -match 'all' -or $keyPerms -match 'all' -or $certPerms -match 'all'

                                $kvAccessData = [PSCustomObject]@{
                                    ObjectType = "KeyVaultAccessPolicy"
                                    KeyVaultName = $kvName
                                    KeyVaultId = $kvId
                                    KeyVaultLocation = $kvLocation
                                    ResourceGroup = $resourceGroup
                                    SubscriptionId = $subId
                                    SubscriptionName = $subName
                                    TenantId = $policy.tenantId
                                    ObjectId = $policy.objectId
                                    PrincipalName = $principalName
                                    PrincipalType = $principalType
                                    ApplicationId = $policy.applicationId
                                    SecretsPermissions = $secretPerms
                                    KeysPermissions = $keyPerms
                                    CertificatesPermissions = $certPerms
                                    StoragePermissions = $storagePerms
                                    HasSecretsAccess = $hasSecretsAccess
                                    HasKeysAccess = $hasKeysAccess
                                    HasCertificatesAccess = $hasCertificatesAccess
                                    HasFullAccess = $hasFullAccess
                                    EnableRbacAuthorization = $properties.enableRbacAuthorization
                                    EnableSoftDelete = $properties.enableSoftDelete
                                    EnablePurgeProtection = $properties.enablePurgeProtection
                                    SoftDeleteRetentionDays = $properties.softDeleteRetentionInDays
                                    _DataType = 'KeyVaultAccessPolicies'
                                    SessionId = $SessionId
                                }
                                $null = $allDiscoveredData.Add($kvAccessData)
                            }
                        } catch {
                            Write-ModuleLog -ModuleName "AzureKeyVaultAccessDiscovery" -Message "Could not get access policies for Key Vault $kvName" -Level "WARNING"
                        }
                    }
                } catch {
                    Write-ModuleLog -ModuleName "AzureKeyVaultAccessDiscovery" -Message "Could not enumerate Key Vaults in subscription $subName" -Level "WARNING"
                }
            }

            $kvAccessCount = @($allDiscoveredData).Count
            $fullAccessCount = @($allDiscoveredData | Where-Object { $_.HasFullAccess }).Count
            $Result.Metadata["KeyVaultAccessPolicyCount"] = $kvAccessCount
            $Result.Metadata["KeyVaultFullAccessCount"] = $fullAccessCount
            Write-ModuleLog -ModuleName "AzureKeyVaultAccessDiscovery" -Message "Found $kvAccessCount access policies ($fullAccessCount with full access)" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover Key Vault Access Policies: $($_.Exception.Message)", $_.Exception, @{Section="KeyVaultAccess"})
        }

        $Result.RecordCount = @($allDiscoveredData).Count
        return $allDiscoveredData | Group-Object -Property _DataType
    }

    $params = @{
        ModuleName = "AzureKeyVaultAccessDiscovery"
        Configuration = $Configuration
        Context = $Context
        SessionId = $SessionId
        DiscoveryScript = $discoveryScript
        RequiredConnections = @('Graph', 'Azure')
    }

    return Invoke-StandardDiscovery @params
}

Export-ModuleMember -Function Invoke-AzureKeyVaultAccessDiscovery
