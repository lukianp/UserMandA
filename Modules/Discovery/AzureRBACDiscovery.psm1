# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-12-30

<#
.SYNOPSIS
    Azure RBAC Assignments Discovery Module
.DESCRIPTION
    Focused module for discovering Azure RBAC Assignments at subscription level.
    Extracted from monolithic AzureSecurityDiscovery.psm1.
.NOTES
    Version: 1.0.0
    Requires: PowerShell 5.1+, Azure Resource Manager access
#>

Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Invoke-AzureRBACDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [hashtable]$Context,
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-ModuleLog -ModuleName "AzureRBACDiscovery" -Message "Starting Azure RBAC Discovery..." -Level "INFO"

    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)

        $allDiscoveredData = [System.Collections.ArrayList]::new()

        try {
            $subscriptions = @()
            $subsUri = "https://management.azure.com/subscriptions?api-version=2020-01-01"

            try {
                $subsResponse = Invoke-MgGraphRequest -Uri $subsUri -Method GET
                $subscriptions = $subsResponse.value
            } catch {
                Write-ModuleLog -ModuleName "AzureRBACDiscovery" -Message "Could not enumerate subscriptions - Azure Resource Manager access may not be configured." -Level "WARNING"
                $subscriptions = @()
            }

            $highPrivilegeRoles = @('Owner', 'Contributor', 'User Access Administrator')

            foreach ($subscription in $subscriptions) {
                $subId = $subscription.subscriptionId
                $subName = $subscription.displayName

                $roleAssignments = @()
                $raUri = "https://management.azure.com/subscriptions/$subId/providers/Microsoft.Authorization/roleAssignments?api-version=2022-04-01"

                try {
                    $raResponse = Invoke-MgGraphRequest -Uri $raUri -Method GET
                    $roleAssignments = $raResponse.value
                } catch {
                    Write-ModuleLog -ModuleName "AzureRBACDiscovery" -Message "Could not get role assignments for subscription $subName" -Level "WARNING"
                    continue
                }

                foreach ($ra in $roleAssignments) {
                    $properties = $ra.properties

                    $roleDefName = "Unknown"
                    try {
                        $roleDefUri = "https://management.azure.com$($properties.roleDefinitionId)?api-version=2022-04-01"
                        $roleDefResponse = Invoke-MgGraphRequest -Uri $roleDefUri -Method GET
                        $roleDefName = $roleDefResponse.properties.roleName
                    } catch {
                        $roleDefName = ($properties.roleDefinitionId -split '/')[-1]
                    }

                    $migrationNotes = @()
                    $isHighPrivilege = $false

                    if ($roleDefName -in $highPrivilegeRoles) {
                        $isHighPrivilege = $true
                        $migrationNotes += 'High privilege role - requires careful review before migration'
                    }
                    if ($properties.scope -eq "/subscriptions/$subId") {
                        $migrationNotes += 'Subscription-level assignment - broad scope'
                    }

                    $rbacData = [PSCustomObject]@{
                        ObjectType = "AzureRBACAssignment"
                        Id = $ra.id
                        Name = $ra.name
                        PrincipalId = $properties.principalId
                        PrincipalType = $properties.principalType
                        RoleDefinitionId = $properties.roleDefinitionId
                        RoleDefinitionName = $roleDefName
                        Scope = $properties.scope
                        Condition = $properties.condition
                        ConditionVersion = $properties.conditionVersion
                        SubscriptionId = $subId
                        SubscriptionName = $subName
                        CreatedOn = $properties.createdOn
                        UpdatedOn = $properties.updatedOn
                        CreatedBy = $properties.createdBy
                        UpdatedBy = $properties.updatedBy
                        IsHighPrivilege = $isHighPrivilege
                        MigrationNotes = ($migrationNotes -join '; ')
                        _DataType = 'RBACAssignments'
                        SessionId = $SessionId
                    }
                    $null = $allDiscoveredData.Add($rbacData)
                }
            }

            $rbacCount = @($allDiscoveredData).Count
            $Result.Metadata["RBACAssignmentCount"] = $rbacCount
            $Result.Metadata["SubscriptionCount"] = @($subscriptions).Count

            Write-ModuleLog -ModuleName "AzureRBACDiscovery" -Message "Found $rbacCount assignments across $(@($subscriptions).Count) subscriptions" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover RBAC Assignments: $($_.Exception.Message)", $_.Exception, @{Section="RBAC"})
        }

        $Result.RecordCount = @($allDiscoveredData).Count
        return $allDiscoveredData | Group-Object -Property _DataType
    }

    $params = @{
        ModuleName = "AzureRBACDiscovery"
        Configuration = $Configuration
        Context = $Context
        SessionId = $SessionId
        DiscoveryScript = $discoveryScript
        RequiredConnections = @('Graph', 'Azure')
    }

    return Invoke-StandardDiscovery @params
}

Export-ModuleMember -Function Invoke-AzureRBACDiscovery
