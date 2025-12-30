# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Azure Management Groups Discovery Module
.DESCRIPTION
    Focused module for discovering Azure Management Groups and hierarchy.
    Extracted from monolithic AzureSecurityDiscovery.psm1.
#>

Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Invoke-AzureManagementGroupsDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [hashtable]$Context,
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-ModuleLog -ModuleName "AzureManagementGroupsDiscovery" -Message "Starting Management Groups Discovery..." -Level "INFO"

    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)

        $allDiscoveredData = [System.Collections.ArrayList]::new()

        try {
            $managementGroups = @()
            $mgUri = "https://management.azure.com/providers/Microsoft.Management/managementGroups?api-version=2021-04-01"

            try {
                $mgResponse = Invoke-MgGraphRequest -Uri $mgUri -Method GET
                $managementGroups = $mgResponse.value
            } catch {
                Write-ModuleLog -ModuleName "AzureManagementGroupsDiscovery" -Message "Could not enumerate Management Groups - may require elevated permissions" -Level "WARNING"
                $managementGroups = @()
            }

            foreach ($mg in $managementGroups) {
                $mgDetails = $null
                try {
                    $mgDetailUri = "https://management.azure.com/providers/Microsoft.Management/managementGroups/$($mg.name)?api-version=2021-04-01&`$expand=children,ancestors"
                    $mgDetails = Invoke-MgGraphRequest -Uri $mgDetailUri -Method GET
                } catch {
                    $mgDetails = $mg
                }

                $properties = $mgDetails.properties
                $childCount = if ($properties.children) { @($properties.children).Count } else { 0 }

                $level = 0
                if ($properties.path) {
                    $level = @($properties.path).Count
                }

                $childSubscriptions = @()
                $childMGs = @()
                if ($properties.children) {
                    $childSubscriptions = @($properties.children | Where-Object { $_.type -eq '/subscriptions' })
                    $childMGs = @($properties.children | Where-Object { $_.type -eq 'Microsoft.Management/managementGroups' })
                }

                $mgData = [PSCustomObject]@{
                    ObjectType = "ManagementGroup"
                    Id = $mg.id
                    Name = $mg.name
                    DisplayName = $properties.displayName
                    TenantId = $properties.tenantId
                    Type = $mg.type
                    Level = $level
                    ParentId = if ($properties.details.parent) { $properties.details.parent.id } else { $null }
                    ParentName = if ($properties.details.parent) { $properties.details.parent.displayName } else { $null }
                    ChildCount = $childCount
                    ChildSubscriptionCount = @($childSubscriptions).Count
                    ChildMGCount = @($childMGs).Count
                    ChildSubscriptions = ($childSubscriptions | ForEach-Object { $_.displayName }) -join '; '
                    ChildManagementGroups = ($childMGs | ForEach-Object { $_.displayName }) -join '; '
                    AncestorPath = if ($properties.path) { ($properties.path | ForEach-Object { $_.displayName }) -join ' > ' } else { $null }
                    _DataType = 'ManagementGroups'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($mgData)
            }

            $Result.Metadata["ManagementGroupCount"] = @($managementGroups).Count
            Write-ModuleLog -ModuleName "AzureManagementGroupsDiscovery" -Message "Found $(@($managementGroups).Count) management groups" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover Management Groups: $($_.Exception.Message)", $_.Exception, @{Section="ManagementGroups"})
        }

        $Result.RecordCount = @($allDiscoveredData).Count
        return $allDiscoveredData | Group-Object -Property _DataType
    }

    $params = @{
        ModuleName = "AzureManagementGroupsDiscovery"
        Configuration = $Configuration
        Context = $Context
        SessionId = $SessionId
        DiscoveryScript = $discoveryScript
        RequiredConnections = @('Azure')
    }

    return Invoke-StandardDiscovery @params
}

Export-ModuleMember -Function Invoke-AzureManagementGroupsDiscovery
