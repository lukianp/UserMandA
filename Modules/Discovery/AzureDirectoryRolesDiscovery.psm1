# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-12-30

<#
.SYNOPSIS
    Azure Directory Roles Discovery Module
.DESCRIPTION
    Focused module for discovering Azure Directory Roles and their assignments.
    Extracted from monolithic AzureSecurityDiscovery.psm1.
.NOTES
    Version: 1.0.0
    Requires: PowerShell 5.1+, Microsoft.Graph modules
#>

Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Invoke-AzureDirectoryRolesDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [hashtable]$Context,
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-ModuleLog -ModuleName "AzureDirectoryRolesDiscovery" -Message "Starting Directory Roles Discovery..." -Level "INFO"

    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)

        $allDiscoveredData = [System.Collections.ArrayList]::new()

        try {
            $directoryRoles = @()
            $rolesUri = "https://graph.microsoft.com/v1.0/directoryRoles?`$expand=members"

            do {
                $response = Invoke-MgGraphRequest -Uri $rolesUri -Method GET
                $directoryRoles += $response.value
                $rolesUri = $response.'@odata.nextLink'
            } while ($rolesUri)

            $privilegedRoles = @('Global Administrator', 'Privileged Role Administrator', 'Security Administrator', 'User Administrator', 'Exchange Administrator', 'SharePoint Administrator', 'Teams Administrator', 'Intune Administrator', 'Cloud Application Administrator', 'Application Administrator')

            foreach ($role in $directoryRoles) {
                $members = @($role.members)
                $memberCount = @($members).Count

                $userMembers = @($members | Where-Object { $_.'@odata.type' -eq '#microsoft.graph.user' })
                $groupMembers = @($members | Where-Object { $_.'@odata.type' -eq '#microsoft.graph.group' })
                $spMembers = @($members | Where-Object { $_.'@odata.type' -eq '#microsoft.graph.servicePrincipal' })

                $migrationNotes = @()
                $isPrivileged = $false

                if ($role.displayName -in $privilegedRoles) {
                    $isPrivileged = $true
                    $migrationNotes += 'Privileged role - requires careful migration planning and access review'
                }
                if ($memberCount -gt 5) {
                    $migrationNotes += "Has $memberCount members - review for principle of least privilege"
                }
                if (@($groupMembers).Count -gt 0) {
                    $migrationNotes += "Has $(@($groupMembers).Count) group assignments - ensure groups are migrated first"
                }
                if (@($spMembers).Count -gt 0) {
                    $migrationNotes += "Has $(@($spMembers).Count) service principal assignments - verify app migrations"
                }

                $roleData = [PSCustomObject]@{
                    ObjectType = "AzureDirectoryRole"
                    Id = $role.id
                    DisplayName = $role.displayName
                    Description = $role.description
                    RoleTemplateId = $role.roleTemplateId
                    MemberCount = $memberCount
                    UserMemberCount = @($userMembers).Count
                    GroupMemberCount = @($groupMembers).Count
                    ServicePrincipalMemberCount = @($spMembers).Count
                    UserMembers = ($userMembers | ForEach-Object { $_.displayName }) -join '; '
                    GroupMembers = ($groupMembers | ForEach-Object { $_.displayName }) -join '; '
                    ServicePrincipalMembers = ($spMembers | ForEach-Object { $_.displayName }) -join '; '
                    IsPrivileged = $isPrivileged
                    MigrationNotes = ($migrationNotes -join '; ')
                    _DataType = 'DirectoryRoles'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($roleData)
            }

            $Result.Metadata["DirectoryRoleCount"] = @($directoryRoles).Count
            $Result.Metadata["PrivilegedRoleCount"] = @($directoryRoles | Where-Object { $_.displayName -in $privilegedRoles }).Count
            $totalRoleAssignments = ($directoryRoles | ForEach-Object { @($_.members).Count } | Measure-Object -Sum).Sum
            $Result.Metadata["TotalRoleAssignments"] = $totalRoleAssignments

            Write-ModuleLog -ModuleName "AzureDirectoryRolesDiscovery" -Message "Found $(@($directoryRoles).Count) roles with $totalRoleAssignments total assignments" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover Directory Roles: $($_.Exception.Message)", $_.Exception, @{Section="DirectoryRoles"})
        }

        $Result.RecordCount = @($allDiscoveredData).Count
        return $allDiscoveredData | Group-Object -Property _DataType
    }

    $params = @{
        ModuleName = "AzureDirectoryRolesDiscovery"
        Configuration = $Configuration
        Context = $Context
        SessionId = $SessionId
        DiscoveryScript = $discoveryScript
        RequiredConnections = @('Graph')
    }

    return Invoke-StandardDiscovery @params
}

Export-ModuleMember -Function Invoke-AzureDirectoryRolesDiscovery
