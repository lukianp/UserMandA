# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Azure Managed Identities Discovery Module
.DESCRIPTION
    Focused module for discovering Azure Managed Identities (User-Assigned and System-Assigned).
    Extracted from monolithic AzureSecurityDiscovery.psm1.
#>

Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Invoke-AzureManagedIdentitiesDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [hashtable]$Context,
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-ModuleLog -ModuleName "AzureManagedIdentitiesDiscovery" -Message "Starting Managed Identities Discovery..." -Level "INFO"

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

                # Get User-Assigned Managed Identities
                try {
                    $uamiUri = "https://management.azure.com/subscriptions/$subId/providers/Microsoft.ManagedIdentity/userAssignedIdentities?api-version=2023-01-31"
                    $uamiResponse = Invoke-MgGraphRequest -Uri $uamiUri -Method GET
                    $userAssignedIdentities = $uamiResponse.value

                    foreach ($uami in $userAssignedIdentities) {
                        $resourceGroup = ($uami.id -split '/resourceGroups/')[1] -split '/' | Select-Object -First 1

                        $roleAssignmentCount = 0
                        try {
                            $raUri = "https://management.azure.com/subscriptions/$subId/providers/Microsoft.Authorization/roleAssignments?api-version=2022-04-01&`$filter=principalId eq '$($uami.properties.principalId)'"
                            $raResponse = Invoke-MgGraphRequest -Uri $raUri -Method GET
                            $roleAssignmentCount = @($raResponse.value).Count
                        } catch { }

                        $miData = [PSCustomObject]@{
                            ObjectType = "ManagedIdentity"
                            Id = $uami.id
                            Name = $uami.name
                            Type = "UserAssigned"
                            ResourceType = $null
                            Location = $uami.location
                            ResourceGroup = $resourceGroup
                            SubscriptionId = $subId
                            SubscriptionName = $subName
                            PrincipalId = $uami.properties.principalId
                            ClientId = $uami.properties.clientId
                            TenantId = $uami.properties.tenantId
                            Tags = ($uami.tags | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                            RoleAssignmentCount = $roleAssignmentCount
                            _DataType = 'ManagedIdentities'
                            SessionId = $SessionId
                        }
                        $null = $allDiscoveredData.Add($miData)
                    }
                } catch {
                    Write-ModuleLog -ModuleName "AzureManagedIdentitiesDiscovery" -Message "Could not enumerate User-Assigned Managed Identities in subscription $subName" -Level "WARNING"
                }

                # Get System-Assigned Managed Identities from VMs
                try {
                    $vmUri = "https://management.azure.com/subscriptions/$subId/providers/Microsoft.Compute/virtualMachines?api-version=2023-03-01"
                    $vmResponse = Invoke-MgGraphRequest -Uri $vmUri -Method GET
                    $vms = $vmResponse.value

                    foreach ($vm in $vms) {
                        if ($vm.identity -and $vm.identity.type -match 'SystemAssigned') {
                            $resourceGroup = ($vm.id -split '/resourceGroups/')[1] -split '/' | Select-Object -First 1
                            $principalId = $vm.identity.principalId

                            $roleAssignmentCount = 0
                            try {
                                if ($principalId) {
                                    $raUri = "https://management.azure.com/subscriptions/$subId/providers/Microsoft.Authorization/roleAssignments?api-version=2022-04-01&`$filter=principalId eq '$principalId'"
                                    $raResponse = Invoke-MgGraphRequest -Uri $raUri -Method GET
                                    $roleAssignmentCount = @($raResponse.value).Count
                                }
                            } catch { }

                            $miData = [PSCustomObject]@{
                                ObjectType = "ManagedIdentity"
                                Id = $vm.id
                                Name = $vm.name
                                Type = "SystemAssigned"
                                ResourceType = "VirtualMachine"
                                Location = $vm.location
                                ResourceGroup = $resourceGroup
                                SubscriptionId = $subId
                                SubscriptionName = $subName
                                PrincipalId = $principalId
                                ClientId = $vm.identity.clientId
                                TenantId = $vm.identity.tenantId
                                Tags = ($vm.tags | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                RoleAssignmentCount = $roleAssignmentCount
                                _DataType = 'ManagedIdentities'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($miData)
                        }
                    }

                    # Web Apps with System-Assigned Identity
                    $webAppUri = "https://management.azure.com/subscriptions/$subId/providers/Microsoft.Web/sites?api-version=2022-03-01"
                    $webAppResponse = Invoke-MgGraphRequest -Uri $webAppUri -Method GET
                    $webApps = $webAppResponse.value

                    foreach ($webApp in $webApps) {
                        if ($webApp.identity -and $webApp.identity.type -match 'SystemAssigned') {
                            $resourceGroup = ($webApp.id -split '/resourceGroups/')[1] -split '/' | Select-Object -First 1
                            $principalId = $webApp.identity.principalId

                            $roleAssignmentCount = 0
                            try {
                                if ($principalId) {
                                    $raUri = "https://management.azure.com/subscriptions/$subId/providers/Microsoft.Authorization/roleAssignments?api-version=2022-04-01&`$filter=principalId eq '$principalId'"
                                    $raResponse = Invoke-MgGraphRequest -Uri $raUri -Method GET
                                    $roleAssignmentCount = @($raResponse.value).Count
                                }
                            } catch { }

                            $miData = [PSCustomObject]@{
                                ObjectType = "ManagedIdentity"
                                Id = $webApp.id
                                Name = $webApp.name
                                Type = "SystemAssigned"
                                ResourceType = "WebApp"
                                Location = $webApp.location
                                ResourceGroup = $resourceGroup
                                SubscriptionId = $subId
                                SubscriptionName = $subName
                                PrincipalId = $principalId
                                ClientId = $webApp.identity.clientId
                                TenantId = $webApp.identity.tenantId
                                Tags = ($webApp.tags | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                RoleAssignmentCount = $roleAssignmentCount
                                _DataType = 'ManagedIdentities'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($miData)
                        }
                    }
                } catch {
                    Write-ModuleLog -ModuleName "AzureManagedIdentitiesDiscovery" -Message "Could not enumerate System-Assigned Managed Identities in subscription $subName" -Level "WARNING"
                }
            }

            $miCount = @($allDiscoveredData).Count
            $userAssignedCount = @($allDiscoveredData | Where-Object { $_.Type -eq 'UserAssigned' }).Count
            $systemAssignedCount = @($allDiscoveredData | Where-Object { $_.Type -eq 'SystemAssigned' }).Count
            $Result.Metadata["ManagedIdentityCount"] = $miCount
            $Result.Metadata["UserAssignedMICount"] = $userAssignedCount
            $Result.Metadata["SystemAssignedMICount"] = $systemAssignedCount
            Write-ModuleLog -ModuleName "AzureManagedIdentitiesDiscovery" -Message "Found $miCount identities ($userAssignedCount user-assigned, $systemAssignedCount system-assigned)" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover Managed Identities: $($_.Exception.Message)", $_.Exception, @{Section="ManagedIdentities"})
        }

        $Result.RecordCount = @($allDiscoveredData).Count
        return $allDiscoveredData | Group-Object -Property _DataType
    }

    $params = @{
        ModuleName = "AzureManagedIdentitiesDiscovery"
        Configuration = $Configuration
        Context = $Context
        SessionId = $SessionId
        DiscoveryScript = $discoveryScript
        RequiredConnections = @('Azure')
    }

    return Invoke-StandardDiscovery @params
}

Export-ModuleMember -Function Invoke-AzureManagedIdentitiesDiscovery
