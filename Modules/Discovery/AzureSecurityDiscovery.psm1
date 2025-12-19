# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-12-19
# Last Modified: 2025-12-19

<#
.SYNOPSIS
    Azure Security Discovery Module - Conditional Access, Directory Roles, RBAC
.DESCRIPTION
    Extracts Azure security configurations for migration planning and security audit.
    Discovers:
    - Conditional Access Policies with migration assessment
    - Azure Directory Roles and Role Assignments
    - Azure RBAC Assignments (subscription-level)

    Part of the Azure Discovery refactoring initiative to break monolithic
    AzureDiscovery.psm1 into focused, maintainable modules.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-12-19
    Requires: PowerShell 5.1+, Microsoft.Graph modules
#>

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Invoke-AzureSecurityDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Starting Azure Security Discovery (CA Policies, Directory Roles, RBAC)..." -Level "INFO"

    # Define discovery script
    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)

        $allDiscoveredData = [System.Collections.ArrayList]::new()

        #region Conditional Access Policies Discovery
        Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Discovering Conditional Access Policies..." -Level "INFO"

        try {
            $caPolicies = @()
            $caUri = "https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies"

            do {
                $response = Invoke-MgGraphRequest -Uri $caUri -Method GET
                $caPolicies += $response.value
                $caUri = $response.'@odata.nextLink'
            } while ($caUri)

            foreach ($policy in $caPolicies) {
                # Analyze policy complexity for migration
                $migrationNotes = @()
                $migrationComplexity = 'Low'

                # Check conditions complexity
                $conditions = $policy.conditions
                if ($conditions.users.includeUsers -contains 'All' -or $conditions.users.excludeUsers.Count -gt 0) {
                    $migrationNotes += 'Uses user conditions - verify user mapping in target tenant'
                }
                if ($conditions.users.includeGroups.Count -gt 0 -or $conditions.users.excludeGroups.Count -gt 0) {
                    $migrationNotes += "References $(@($conditions.users.includeGroups).Count + @($conditions.users.excludeGroups).Count) groups - ensure groups are migrated first"
                    $migrationComplexity = 'Medium'
                }
                if ($conditions.applications.includeApplications -and $conditions.applications.includeApplications -notcontains 'All') {
                    $migrationNotes += "Targets specific applications - verify app registration in target tenant"
                    $migrationComplexity = 'Medium'
                }
                if ($conditions.locations) {
                    $migrationNotes += 'Uses named locations - recreate location definitions in target tenant'
                    $migrationComplexity = 'High'
                }
                if ($conditions.platforms) {
                    $migrationNotes += 'Has platform conditions - verify platform support in target tenant'
                }
                if ($conditions.clientAppTypes -and $conditions.clientAppTypes.Count -gt 0) {
                    $migrationNotes += "Filters by client app types: $($conditions.clientAppTypes -join ', ')"
                }

                # Check grant controls
                $grantControls = $policy.grantControls
                $grantControlsList = @()
                if ($grantControls) {
                    if ($grantControls.builtInControls) {
                        $grantControlsList += $grantControls.builtInControls
                    }
                    if ($grantControls.customAuthenticationFactors) {
                        $migrationNotes += 'Uses custom authentication factors - requires manual configuration in target'
                        $migrationComplexity = 'High'
                    }
                    if ($grantControls.termsOfUse) {
                        $migrationNotes += 'References Terms of Use - recreate ToU in target tenant'
                        $migrationComplexity = 'High'
                    }
                }

                # Check session controls
                $sessionControls = $policy.sessionControls
                $sessionControlsList = @()
                if ($sessionControls) {
                    if ($sessionControls.applicationEnforcedRestrictions) {
                        $sessionControlsList += 'applicationEnforcedRestrictions'
                    }
                    if ($sessionControls.cloudAppSecurity) {
                        $sessionControlsList += 'cloudAppSecurity'
                        $migrationNotes += 'Uses Cloud App Security - configure MCAS integration in target'
                        $migrationComplexity = 'High'
                    }
                    if ($sessionControls.signInFrequency) {
                        $sessionControlsList += 'signInFrequency'
                    }
                    if ($sessionControls.persistentBrowser) {
                        $sessionControlsList += 'persistentBrowser'
                    }
                }

                $caData = [PSCustomObject]@{
                    ObjectType = "ConditionalAccessPolicy"
                    Id = $policy.id
                    DisplayName = $policy.displayName
                    Description = $policy.description
                    State = $policy.state
                    CreatedDateTime = $policy.createdDateTime
                    ModifiedDateTime = $policy.modifiedDateTime

                    # User Conditions
                    IncludeUsers = ($conditions.users.includeUsers -join '; ')
                    ExcludeUsers = ($conditions.users.excludeUsers -join '; ')
                    IncludeGroups = ($conditions.users.includeGroups -join '; ')
                    ExcludeGroups = ($conditions.users.excludeGroups -join '; ')
                    IncludeRoles = ($conditions.users.includeRoles -join '; ')
                    ExcludeRoles = ($conditions.users.excludeRoles -join '; ')

                    # Application Conditions
                    IncludeApplications = ($conditions.applications.includeApplications -join '; ')
                    ExcludeApplications = ($conditions.applications.excludeApplications -join '; ')

                    # Other Conditions
                    ClientAppTypes = ($conditions.clientAppTypes -join '; ')
                    Platforms = if ($conditions.platforms) { ($conditions.platforms.includePlatforms -join '; ') } else { $null }
                    Locations = if ($conditions.locations) { ($conditions.locations.includeLocations -join '; ') } else { $null }
                    DeviceStates = if ($conditions.devices) { "Configured" } else { "Not Configured" }
                    SignInRiskLevels = if ($conditions.signInRiskLevels) { ($conditions.signInRiskLevels -join '; ') } else { $null }
                    UserRiskLevels = if ($conditions.userRiskLevels) { ($conditions.userRiskLevels -join '; ') } else { $null }

                    # Controls
                    GrantControls = ($grantControlsList -join '; ')
                    GrantOperator = if ($grantControls) { $grantControls.operator } else { $null }
                    SessionControls = ($sessionControlsList -join '; ')

                    # Migration Assessment
                    MigrationComplexity = $migrationComplexity
                    MigrationNotes = ($migrationNotes -join '; ')

                    _DataType = 'ConditionalAccessPolicies'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($caData)
            }

            $Result.Metadata["ConditionalAccessPolicyCount"] = $caPolicies.Count
            $Result.Metadata["EnabledCAPolicies"] = @($caPolicies | Where-Object { $_.state -eq 'enabled' }).Count
            $Result.Metadata["ReportOnlyCAPolicies"] = @($caPolicies | Where-Object { $_.state -eq 'enabledForReportingButNotEnforced' }).Count
            $Result.Metadata["DisabledCAPolicies"] = @($caPolicies | Where-Object { $_.state -eq 'disabled' }).Count

            Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "CA Policy Discovery - Found $($caPolicies.Count) policies (Enabled: $($Result.Metadata['EnabledCAPolicies']), Report-Only: $($Result.Metadata['ReportOnlyCAPolicies']), Disabled: $($Result.Metadata['DisabledCAPolicies']))" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover Conditional Access Policies: $($_.Exception.Message)", $_.Exception, @{Section="ConditionalAccess"})
        }
        #endregion

        #region Directory Roles Discovery
        Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Discovering Azure Directory Roles and Assignments..." -Level "INFO"

        try {
            $directoryRoles = @()
            $rolesUri = "https://graph.microsoft.com/v1.0/directoryRoles?`$expand=members"

            do {
                $response = Invoke-MgGraphRequest -Uri $rolesUri -Method GET
                $directoryRoles += $response.value
                $rolesUri = $response.'@odata.nextLink'
            } while ($rolesUri)

            foreach ($role in $directoryRoles) {
                $members = @($role.members)
                $memberCount = $members.Count

                # Categorize members
                $userMembers = @($members | Where-Object { $_.'@odata.type' -eq '#microsoft.graph.user' })
                $groupMembers = @($members | Where-Object { $_.'@odata.type' -eq '#microsoft.graph.group' })
                $spMembers = @($members | Where-Object { $_.'@odata.type' -eq '#microsoft.graph.servicePrincipal' })

                # Migration assessment for privileged roles
                $migrationNotes = @()
                $isPrivileged = $false
                $privilegedRoles = @('Global Administrator', 'Privileged Role Administrator', 'Security Administrator', 'User Administrator', 'Exchange Administrator', 'SharePoint Administrator', 'Teams Administrator', 'Intune Administrator', 'Cloud Application Administrator', 'Application Administrator')

                if ($role.displayName -in $privilegedRoles) {
                    $isPrivileged = $true
                    $migrationNotes += 'Privileged role - requires careful migration planning and access review'
                }
                if ($memberCount -gt 5) {
                    $migrationNotes += "Has $memberCount members - review for principle of least privilege"
                }
                if ($groupMembers.Count -gt 0) {
                    $migrationNotes += "Has $($groupMembers.Count) group assignments - ensure groups are migrated first"
                }
                if ($spMembers.Count -gt 0) {
                    $migrationNotes += "Has $($spMembers.Count) service principal assignments - verify app migrations"
                }

                $roleData = [PSCustomObject]@{
                    ObjectType = "AzureDirectoryRole"
                    Id = $role.id
                    DisplayName = $role.displayName
                    Description = $role.description
                    RoleTemplateId = $role.roleTemplateId

                    # Member Statistics
                    MemberCount = $memberCount
                    UserMemberCount = $userMembers.Count
                    GroupMemberCount = $groupMembers.Count
                    ServicePrincipalMemberCount = $spMembers.Count

                    # Member Details (sample)
                    UserMembers = ($userMembers | ForEach-Object { $_.displayName }) -join '; '
                    GroupMembers = ($groupMembers | ForEach-Object { $_.displayName }) -join '; '
                    ServicePrincipalMembers = ($spMembers | ForEach-Object { $_.displayName }) -join '; '

                    # Security Assessment
                    IsPrivileged = $isPrivileged
                    MigrationNotes = ($migrationNotes -join '; ')

                    _DataType = 'DirectoryRoles'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($roleData)
            }

            $Result.Metadata["DirectoryRoleCount"] = $directoryRoles.Count
            $Result.Metadata["PrivilegedRoleCount"] = @($directoryRoles | Where-Object { $_.displayName -in $privilegedRoles }).Count
            $totalRoleAssignments = ($directoryRoles | ForEach-Object { @($_.members).Count } | Measure-Object -Sum).Sum
            $Result.Metadata["TotalRoleAssignments"] = $totalRoleAssignments

            Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Directory Role Discovery - Found $($directoryRoles.Count) roles with $totalRoleAssignments total assignments" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover Directory Roles: $($_.Exception.Message)", $_.Exception, @{Section="DirectoryRoles"})
        }
        #endregion

        #region Azure RBAC Assignments Discovery (Subscription Level)
        Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Discovering Azure RBAC Assignments..." -Level "INFO"

        try {
            # Get all subscriptions first
            $subscriptions = @()
            $subsUri = "https://management.azure.com/subscriptions?api-version=2020-01-01"

            try {
                $subsResponse = Invoke-MgGraphRequest -Uri $subsUri -Method GET
                $subscriptions = $subsResponse.value
            } catch {
                Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Could not enumerate subscriptions - Azure Resource Manager access may not be configured. Skipping RBAC discovery." -Level "WARNING"
                $subscriptions = @()
            }

            foreach ($subscription in $subscriptions) {
                $subId = $subscription.subscriptionId
                $subName = $subscription.displayName

                # Get role assignments for this subscription
                $roleAssignments = @()
                $raUri = "https://management.azure.com/subscriptions/$subId/providers/Microsoft.Authorization/roleAssignments?api-version=2022-04-01"

                try {
                    $raResponse = Invoke-MgGraphRequest -Uri $raUri -Method GET
                    $roleAssignments = $raResponse.value
                } catch {
                    Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Could not get role assignments for subscription $subName" -Level "WARNING"
                    continue
                }

                foreach ($ra in $roleAssignments) {
                    $properties = $ra.properties

                    # Get role definition name
                    $roleDefName = "Unknown"
                    try {
                        $roleDefUri = "https://management.azure.com$($properties.roleDefinitionId)?api-version=2022-04-01"
                        $roleDefResponse = Invoke-MgGraphRequest -Uri $roleDefUri -Method GET
                        $roleDefName = $roleDefResponse.properties.roleName
                    } catch {
                        # Use last part of roleDefinitionId as fallback
                        $roleDefName = ($properties.roleDefinitionId -split '/')[-1]
                    }

                    # Migration assessment
                    $migrationNotes = @()
                    $isHighPrivilege = $false
                    $highPrivilegeRoles = @('Owner', 'Contributor', 'User Access Administrator')

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

                        # Assignment Details
                        PrincipalId = $properties.principalId
                        PrincipalType = $properties.principalType
                        RoleDefinitionId = $properties.roleDefinitionId
                        RoleDefinitionName = $roleDefName
                        Scope = $properties.scope
                        Condition = $properties.condition
                        ConditionVersion = $properties.conditionVersion

                        # Subscription Context
                        SubscriptionId = $subId
                        SubscriptionName = $subName

                        # Timestamps
                        CreatedOn = $properties.createdOn
                        UpdatedOn = $properties.updatedOn
                        CreatedBy = $properties.createdBy
                        UpdatedBy = $properties.updatedBy

                        # Security Assessment
                        IsHighPrivilege = $isHighPrivilege
                        MigrationNotes = ($migrationNotes -join '; ')

                        _DataType = 'RBACAssignments'
                        SessionId = $SessionId
                    }
                    $null = $allDiscoveredData.Add($rbacData)
                }
            }

            $rbacCount = @($allDiscoveredData | Where-Object { $_._DataType -eq 'RBACAssignments' }).Count
            $Result.Metadata["RBACAssignmentCount"] = $rbacCount
            $Result.Metadata["SubscriptionCount"] = $subscriptions.Count

            Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "RBAC Discovery - Found $rbacCount assignments across $($subscriptions.Count) subscriptions" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover RBAC Assignments: $($_.Exception.Message)", $_.Exception, @{Section="RBAC"})
        }
        #endregion

        $Result.RecordCount = $allDiscoveredData.Count
        Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Security Discovery Complete - Total Records: $($allDiscoveredData.Count)" -Level "SUCCESS"

        # Group by data type for CSV export
        return $allDiscoveredData | Group-Object -Property _DataType
    }

    # Execute discovery using base module
    Start-DiscoveryModule `
        -ModuleName "AzureSecurityDiscovery" `
        -DiscoveryScript $discoveryScript `
        -Configuration $Configuration `
        -Context $Context `
        -SessionId $SessionId `
        -RequiredServices @()
}

Export-ModuleMember -Function Invoke-AzureSecurityDiscovery
