# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Azure PIM Eligible Roles Discovery Module
.DESCRIPTION
    Focused module for discovering PIM Eligible Role Assignments.
    Extracted from monolithic AzureSecurityDiscovery.psm1.
#>

Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Invoke-AzurePIMDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [hashtable]$Context,
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-ModuleLog -ModuleName "AzurePIMDiscovery" -Message "Starting PIM Eligible Roles Discovery..." -Level "INFO"

    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)

        $allDiscoveredData = [System.Collections.ArrayList]::new()
        $highPrivilegeRoles = @('Global Administrator', 'Privileged Role Administrator', 'Security Administrator', 'User Administrator', 'Exchange Administrator', 'SharePoint Administrator')

        try {
            $pimAssignments = @()
            $pimUri = "https://graph.microsoft.com/v1.0/roleManagement/directory/roleEligibilityScheduleInstances"

            try {
                do {
                    $response = Invoke-MgGraphRequest -Uri $pimUri -Method GET
                    $pimAssignments += $response.value
                    $pimUri = $response.'@odata.nextLink'
                } while ($pimUri)
            } catch {
                Write-ModuleLog -ModuleName "AzurePIMDiscovery" -Message "Could not enumerate PIM Eligible Roles - may require PIM license or elevated permissions" -Level "WARNING"
                $pimAssignments = @()
            }

            foreach ($assignment in $pimAssignments) {
                $roleName = "Unknown"
                try {
                    $roleUri = "https://graph.microsoft.com/v1.0/directoryRoles?`$filter=roleTemplateId eq '$($assignment.roleDefinitionId)'"
                    $roleResponse = Invoke-MgGraphRequest -Uri $roleUri -Method GET
                    if ($roleResponse.value -and @($roleResponse.value).Count -gt 0) {
                        $roleName = $roleResponse.value[0].displayName
                    } else {
                        $roleDefUri = "https://graph.microsoft.com/v1.0/roleManagement/directory/roleDefinitions/$($assignment.roleDefinitionId)"
                        $roleDefResponse = Invoke-MgGraphRequest -Uri $roleDefUri -Method GET
                        $roleName = $roleDefResponse.displayName
                    }
                } catch {
                    $roleName = $assignment.roleDefinitionId
                }

                $principalName = "Unknown"
                $principalType = "Unknown"
                try {
                    $principalUri = "https://graph.microsoft.com/v1.0/directoryObjects/$($assignment.principalId)"
                    $principalResponse = Invoke-MgGraphRequest -Uri $principalUri -Method GET
                    $principalName = $principalResponse.displayName
                    $principalType = switch ($principalResponse.'@odata.type') {
                        '#microsoft.graph.user' { 'User' }
                        '#microsoft.graph.group' { 'Group' }
                        '#microsoft.graph.servicePrincipal' { 'ServicePrincipal' }
                        default { $principalResponse.'@odata.type' }
                    }
                } catch { }

                $isHighPrivilege = $roleName -in $highPrivilegeRoles

                $pimData = [PSCustomObject]@{
                    ObjectType = "PIMEligibleRole"
                    Id = $assignment.id
                    PrincipalId = $assignment.principalId
                    PrincipalName = $principalName
                    PrincipalType = $principalType
                    RoleDefinitionId = $assignment.roleDefinitionId
                    RoleName = $roleName
                    DirectoryScopeId = $assignment.directoryScopeId
                    AppScopeId = $assignment.appScopeId
                    StartDateTime = $assignment.startDateTime
                    EndDateTime = $assignment.endDateTime
                    MemberType = $assignment.memberType
                    AssignmentType = $assignment.assignmentType
                    IsHighPrivilege = $isHighPrivilege
                    _DataType = 'PIMEligibleRoles'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($pimData)
            }

            $Result.Metadata["PIMEligibleRoleCount"] = @($pimAssignments).Count
            $highPrivCount = @($allDiscoveredData | Where-Object { $_.IsHighPrivilege }).Count
            $Result.Metadata["HighPrivilegePIMCount"] = $highPrivCount
            Write-ModuleLog -ModuleName "AzurePIMDiscovery" -Message "Found $(@($pimAssignments).Count) eligible role assignments ($highPrivCount high privilege)" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover PIM Eligible Roles: $($_.Exception.Message)", $_.Exception, @{Section="PIM"})
        }

        $Result.RecordCount = @($allDiscoveredData).Count
        return $allDiscoveredData | Group-Object -Property _DataType
    }

    $params = @{
        ModuleName = "AzurePIMDiscovery"
        Configuration = $Configuration
        Context = $Context
        SessionId = $SessionId
        DiscoveryScript = $discoveryScript
        RequiredConnections = @('Graph')
    }

    return Invoke-StandardDiscovery @params
}

Export-ModuleMember -Function Invoke-AzurePIMDiscovery
