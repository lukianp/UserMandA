# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Azure Subscription Owners Discovery Module
.DESCRIPTION
    Focused module for discovering Azure Subscription Owners.
    Extracted from monolithic AzureSecurityDiscovery.psm1.
#>

Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Invoke-AzureSubscriptionOwnersDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [hashtable]$Context,
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-ModuleLog -ModuleName "AzureSubscriptionOwnersDiscovery" -Message "Starting Subscription Owners Discovery..." -Level "INFO"

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
                    $ownerRoleId = "8e3af657-a8ff-443c-a75c-2fe8c4bcb635"
                    $ownerUri = "https://management.azure.com/subscriptions/$subId/providers/Microsoft.Authorization/roleAssignments?api-version=2022-04-01&`$filter=roleDefinitionId eq '/subscriptions/$subId/providers/Microsoft.Authorization/roleDefinitions/$ownerRoleId'"

                    $ownerResponse = Invoke-MgGraphRequest -Uri $ownerUri -Method GET
                    $owners = $ownerResponse.value

                    foreach ($owner in $owners) {
                        $properties = $owner.properties

                        $principalName = "Unknown"
                        $principalType = $properties.principalType
                        $principalEmail = $null
                        try {
                            $principalUri = "https://graph.microsoft.com/v1.0/directoryObjects/$($properties.principalId)"
                            $principalResponse = Invoke-MgGraphRequest -Uri $principalUri -Method GET
                            $principalName = $principalResponse.displayName
                            if ($principalResponse.mail) {
                                $principalEmail = $principalResponse.mail
                            } elseif ($principalResponse.userPrincipalName) {
                                $principalEmail = $principalResponse.userPrincipalName
                            }
                        } catch { }

                        $ownerData = [PSCustomObject]@{
                            ObjectType = "SubscriptionOwner"
                            Id = $owner.id
                            AssignmentName = $owner.name
                            SubscriptionId = $subId
                            SubscriptionName = $subName
                            PrincipalId = $properties.principalId
                            PrincipalName = $principalName
                            PrincipalType = $principalType
                            PrincipalEmail = $principalEmail
                            Scope = $properties.scope
                            CreatedOn = $properties.createdOn
                            CreatedBy = $properties.createdBy
                            UpdatedOn = $properties.updatedOn
                            _DataType = 'SubscriptionOwners'
                            SessionId = $SessionId
                        }
                        $null = $allDiscoveredData.Add($ownerData)
                    }
                } catch {
                    Write-ModuleLog -ModuleName "AzureSubscriptionOwnersDiscovery" -Message "Could not get owners for subscription $subName" -Level "WARNING"
                }
            }

            $ownerCount = @($allDiscoveredData).Count
            $Result.Metadata["SubscriptionOwnerCount"] = $ownerCount
            $Result.Metadata["SubscriptionCount"] = @($subscriptions).Count
            Write-ModuleLog -ModuleName "AzureSubscriptionOwnersDiscovery" -Message "Found $ownerCount owner assignments across $(@($subscriptions).Count) subscriptions" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover Subscription Owners: $($_.Exception.Message)", $_.Exception, @{Section="SubscriptionOwners"})
        }

        $Result.RecordCount = @($allDiscoveredData).Count
        return $allDiscoveredData | Group-Object -Property _DataType
    }

    $params = @{
        ModuleName = "AzureSubscriptionOwnersDiscovery"
        Configuration = $Configuration
        Context = $Context
        SessionId = $SessionId
        DiscoveryScript = $discoveryScript
        RequiredConnections = @('Graph', 'Azure')
    }

    return Invoke-StandardDiscovery @params
}

Export-ModuleMember -Function Invoke-AzureSubscriptionOwnersDiscovery
