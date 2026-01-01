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
    - Management Groups hierarchy
    - PIM Eligible Role Assignments
    - Subscription Owners
    - Key Vault Access Policies
    - Managed Identities
    - Service Principal Credentials

    Part of the Azure Discovery refactoring initiative to break monolithic
    AzureDiscovery.psm1 into focused, maintainable modules.
.NOTES
    Version: 1.0.1
    Author: System Enhancement
    Created: 2025-12-19
    Last Modified: 2025-12-31
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

        #region Management Groups Discovery (AzureHound-inspired Phase 3)
        Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Discovering Azure Management Groups..." -Level "INFO"

        try {
            $managementGroups = @()
            $mgUri = "https://management.azure.com/providers/Microsoft.Management/managementGroups?api-version=2021-04-01"

            try {
                $mgResponse = Invoke-MgGraphRequest -Uri $mgUri -Method GET
                $managementGroups = $mgResponse.value
            } catch {
                Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Could not enumerate Management Groups - may require elevated permissions" -Level "WARNING"
                $managementGroups = @()
            }

            foreach ($mg in $managementGroups) {
                # Get management group details
                $mgDetails = $null
                try {
                    $mgDetailUri = "https://management.azure.com/providers/Microsoft.Management/managementGroups/$($mg.name)?api-version=2021-04-01&`$expand=children,ancestors"
                    $mgDetails = Invoke-MgGraphRequest -Uri $mgDetailUri -Method GET
                } catch {
                    $mgDetails = $mg
                }

                $properties = $mgDetails.properties
                $childCount = if ($properties.children) { @($properties.children).Count } else { 0 }
                $ancestorCount = if ($properties.path) { @($properties.path).Count } else { 0 }

                # Calculate hierarchy level
                $level = 0
                if ($properties.path) {
                    $level = @($properties.path).Count
                }

                # Get child subscriptions and management groups
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

                    # Hierarchy
                    Level = $level
                    ParentId = if ($properties.details.parent) { $properties.details.parent.id } else { $null }
                    ParentName = if ($properties.details.parent) { $properties.details.parent.displayName } else { $null }

                    # Children
                    ChildCount = $childCount
                    ChildSubscriptionCount = $childSubscriptions.Count
                    ChildMGCount = $childMGs.Count
                    ChildSubscriptions = ($childSubscriptions | ForEach-Object { $_.displayName }) -join '; '
                    ChildManagementGroups = ($childMGs | ForEach-Object { $_.displayName }) -join '; '

                    # Ancestors path
                    AncestorPath = if ($properties.path) { ($properties.path | ForEach-Object { $_.displayName }) -join ' > ' } else { $null }

                    _DataType = 'ManagementGroups'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($mgData)
            }

            $Result.Metadata["ManagementGroupCount"] = $managementGroups.Count
            Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Management Group Discovery - Found $($managementGroups.Count) management groups" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover Management Groups: $($_.Exception.Message)", $_.Exception, @{Section="ManagementGroups"})
        }
        #endregion

        #region PIM Eligible Roles Discovery (AzureHound-inspired Phase 3)
        Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Discovering PIM Eligible Role Assignments..." -Level "INFO"

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
                Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Could not enumerate PIM Eligible Roles - may require PIM license or elevated permissions" -Level "WARNING"
                $pimAssignments = @()
            }

            foreach ($assignment in $pimAssignments) {
                # Get role definition name
                $roleName = "Unknown"
                try {
                    $roleUri = "https://graph.microsoft.com/v1.0/directoryRoles?`$filter=roleTemplateId eq '$($assignment.roleDefinitionId)'"
                    $roleResponse = Invoke-MgGraphRequest -Uri $roleUri -Method GET
                    if ($roleResponse.value -and $roleResponse.value.Count -gt 0) {
                        $roleName = $roleResponse.value[0].displayName
                    } else {
                        # Try roleDefinitions
                        $roleDefUri = "https://graph.microsoft.com/v1.0/roleManagement/directory/roleDefinitions/$($assignment.roleDefinitionId)"
                        $roleDefResponse = Invoke-MgGraphRequest -Uri $roleDefUri -Method GET
                        $roleName = $roleDefResponse.displayName
                    }
                } catch {
                    $roleName = $assignment.roleDefinitionId
                }

                # Get principal details
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

                # Security assessment
                $isHighPrivilege = $false
                $highPrivilegeRoles = @('Global Administrator', 'Privileged Role Administrator', 'Security Administrator', 'User Administrator', 'Exchange Administrator', 'SharePoint Administrator')
                if ($roleName -in $highPrivilegeRoles) {
                    $isHighPrivilege = $true
                }

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

                    # Security Assessment
                    IsHighPrivilege = $isHighPrivilege

                    _DataType = 'PIMEligibleRoles'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($pimData)
            }

            $Result.Metadata["PIMEligibleRoleCount"] = $pimAssignments.Count
            $highPrivCount = @($allDiscoveredData | Where-Object { $_._DataType -eq 'PIMEligibleRoles' -and $_.IsHighPrivilege }).Count
            $Result.Metadata["HighPrivilegePIMCount"] = $highPrivCount
            Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "PIM Discovery - Found $($pimAssignments.Count) eligible role assignments ($highPrivCount high privilege)" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover PIM Eligible Roles: $($_.Exception.Message)", $_.Exception, @{Section="PIM"})
        }
        #endregion

        #region Subscription Owners Discovery (AzureHound-inspired Phase 3)
        Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Discovering Subscription Owners..." -Level "INFO"

        try {
            $subscriptionOwners = @()

            # Use subscriptions already discovered in RBAC section
            if (-not $subscriptions) {
                try {
                    $subsUri = "https://management.azure.com/subscriptions?api-version=2020-01-01"
                    $subsResponse = Invoke-MgGraphRequest -Uri $subsUri -Method GET
                    $subscriptions = $subsResponse.value
                } catch {
                    $subscriptions = @()
                }
            }

            foreach ($subscription in $subscriptions) {
                $subId = $subscription.subscriptionId
                $subName = $subscription.displayName

                # Get Owner role assignments for this subscription
                try {
                    $ownerRoleId = "8e3af657-a8ff-443c-a75c-2fe8c4bcb635" # Built-in Owner role GUID
                    $ownerUri = "https://management.azure.com/subscriptions/$subId/providers/Microsoft.Authorization/roleAssignments?api-version=2022-04-01&`$filter=roleDefinitionId eq '/subscriptions/$subId/providers/Microsoft.Authorization/roleDefinitions/$ownerRoleId'"

                    $ownerResponse = Invoke-MgGraphRequest -Uri $ownerUri -Method GET
                    $owners = $ownerResponse.value

                    foreach ($owner in $owners) {
                        $properties = $owner.properties

                        # Get principal details
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
                    Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Could not get owners for subscription $subName" -Level "WARNING"
                }
            }

            $ownerCount = @($allDiscoveredData | Where-Object { $_._DataType -eq 'SubscriptionOwners' }).Count
            $Result.Metadata["SubscriptionOwnerCount"] = $ownerCount
            Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Subscription Owner Discovery - Found $ownerCount owner assignments across $($subscriptions.Count) subscriptions" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover Subscription Owners: $($_.Exception.Message)", $_.Exception, @{Section="SubscriptionOwners"})
        }
        #endregion

        #region Key Vault Access Policies Discovery (AzureHound-inspired Phase 4)
        Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Discovering Key Vault Access Policies..." -Level "INFO"

        try {
            $keyVaultAccessPolicies = @()

            # Use subscriptions already discovered
            if (-not $subscriptions) {
                try {
                    $subsUri = "https://management.azure.com/subscriptions?api-version=2020-01-01"
                    $subsResponse = Invoke-MgGraphRequest -Uri $subsUri -Method GET
                    $subscriptions = $subsResponse.value
                } catch {
                    $subscriptions = @()
                }
            }

            foreach ($subscription in $subscriptions) {
                $subId = $subscription.subscriptionId
                $subName = $subscription.displayName

                # Get all Key Vaults in this subscription
                try {
                    $kvUri = "https://management.azure.com/subscriptions/$subId/providers/Microsoft.KeyVault/vaults?api-version=2022-07-01"
                    $kvResponse = Invoke-MgGraphRequest -Uri $kvUri -Method GET
                    $keyVaults = $kvResponse.value

                    foreach ($kv in $keyVaults) {
                        $kvName = $kv.name
                        $kvId = $kv.id
                        $kvLocation = $kv.location
                        $resourceGroup = ($kvId -split '/resourceGroups/')[1] -split '/' | Select-Object -First 1

                        # Get Key Vault properties with access policies
                        try {
                            $kvDetailUri = "https://management.azure.com$kvId`?api-version=2022-07-01"
                            $kvDetails = Invoke-MgGraphRequest -Uri $kvDetailUri -Method GET
                            $properties = $kvDetails.properties
                            $accessPolicies = $properties.accessPolicies

                            foreach ($policy in $accessPolicies) {
                                # Get principal details
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

                                # Security assessment
                                $hasSecretsAccess = $false
                                $hasKeysAccess = $false
                                $hasCertificatesAccess = $false
                                $hasFullAccess = $false

                                $secretPerms = @($policy.permissions.secrets) -join '; '
                                $keyPerms = @($policy.permissions.keys) -join '; '
                                $certPerms = @($policy.permissions.certificates) -join '; '
                                $storagePerms = @($policy.permissions.storage) -join '; '

                                if ($policy.permissions.secrets -and $policy.permissions.secrets.Count -gt 0) { $hasSecretsAccess = $true }
                                if ($policy.permissions.keys -and $policy.permissions.keys.Count -gt 0) { $hasKeysAccess = $true }
                                if ($policy.permissions.certificates -and $policy.permissions.certificates.Count -gt 0) { $hasCertificatesAccess = $true }
                                if ($secretPerms -match 'all' -or $keyPerms -match 'all' -or $certPerms -match 'all') { $hasFullAccess = $true }

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

                                    # Security flags
                                    HasSecretsAccess = $hasSecretsAccess
                                    HasKeysAccess = $hasKeysAccess
                                    HasCertificatesAccess = $hasCertificatesAccess
                                    HasFullAccess = $hasFullAccess

                                    # Key Vault settings
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
                            Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Could not get access policies for Key Vault $kvName" -Level "WARNING"
                        }
                    }
                } catch {
                    Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Could not enumerate Key Vaults in subscription $subName" -Level "WARNING"
                }
            }

            $kvAccessCount = @($allDiscoveredData | Where-Object { $_._DataType -eq 'KeyVaultAccessPolicies' }).Count
            $fullAccessCount = @($allDiscoveredData | Where-Object { $_._DataType -eq 'KeyVaultAccessPolicies' -and $_.HasFullAccess }).Count
            $Result.Metadata["KeyVaultAccessPolicyCount"] = $kvAccessCount
            $Result.Metadata["KeyVaultFullAccessCount"] = $fullAccessCount
            Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Key Vault Access Discovery - Found $kvAccessCount access policies ($fullAccessCount with full access)" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover Key Vault Access Policies: $($_.Exception.Message)", $_.Exception, @{Section="KeyVaultAccess"})
        }
        #endregion

        #region Managed Identities Discovery (AzureHound-inspired Phase 4)
        Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Discovering Managed Identities..." -Level "INFO"

        try {
            $managedIdentities = @()

            # Use subscriptions already discovered
            if (-not $subscriptions) {
                try {
                    $subsUri = "https://management.azure.com/subscriptions?api-version=2020-01-01"
                    $subsResponse = Invoke-MgGraphRequest -Uri $subsUri -Method GET
                    $subscriptions = $subsResponse.value
                } catch {
                    $subscriptions = @()
                }
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

                        # Get role assignments for this managed identity
                        $roleAssignmentCount = 0
                        $roleAssignments = @()
                        try {
                            $raUri = "https://management.azure.com/subscriptions/$subId/providers/Microsoft.Authorization/roleAssignments?api-version=2022-04-01&`$filter=principalId eq '$($uami.properties.principalId)'"
                            $raResponse = Invoke-MgGraphRequest -Uri $raUri -Method GET
                            $roleAssignments = $raResponse.value
                            $roleAssignmentCount = @($roleAssignments).Count
                        } catch { }

                        $miData = [PSCustomObject]@{
                            ObjectType = "ManagedIdentity"
                            Id = $uami.id
                            Name = $uami.name
                            Type = "UserAssigned"
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
                    Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Could not enumerate User-Assigned Managed Identities in subscription $subName" -Level "WARNING"
                }

                # Get resources with System-Assigned Managed Identities
                # Check VMs, App Services, Function Apps, etc.
                try {
                    # Virtual Machines with System-Assigned Identity
                    $vmUri = "https://management.azure.com/subscriptions/$subId/providers/Microsoft.Compute/virtualMachines?api-version=2023-03-01"
                    $vmResponse = Invoke-MgGraphRequest -Uri $vmUri -Method GET
                    $vms = $vmResponse.value

                    foreach ($vm in $vms) {
                        if ($vm.identity -and $vm.identity.type -match 'SystemAssigned') {
                            $resourceGroup = ($vm.id -split '/resourceGroups/')[1] -split '/' | Select-Object -First 1
                            $principalId = $vm.identity.principalId

                            # Get role assignments
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

                            # Get role assignments
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
                    Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Could not enumerate System-Assigned Managed Identities in subscription $subName" -Level "WARNING"
                }
            }

            $miCount = @($allDiscoveredData | Where-Object { $_._DataType -eq 'ManagedIdentities' }).Count
            $userAssignedCount = @($allDiscoveredData | Where-Object { $_._DataType -eq 'ManagedIdentities' -and $_.Type -eq 'UserAssigned' }).Count
            $systemAssignedCount = @($allDiscoveredData | Where-Object { $_._DataType -eq 'ManagedIdentities' -and $_.Type -eq 'SystemAssigned' }).Count
            $Result.Metadata["ManagedIdentityCount"] = $miCount
            $Result.Metadata["UserAssignedMICount"] = $userAssignedCount
            $Result.Metadata["SystemAssignedMICount"] = $systemAssignedCount
            Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Managed Identity Discovery - Found $miCount identities ($userAssignedCount user-assigned, $systemAssignedCount system-assigned)" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover Managed Identities: $($_.Exception.Message)", $_.Exception, @{Section="ManagedIdentities"})
        }
        #endregion

        #region Service Principal Credentials Discovery (AzureHound-inspired Phase 5)
        Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Discovering Service Principal Credentials..." -Level "INFO"

        try {
            $appRegistrations = @()
            $appsUri = "https://graph.microsoft.com/v1.0/applications?`$select=id,appId,displayName,passwordCredentials,keyCredentials,createdDateTime,signInAudience"

            try {
                do {
                    $response = Invoke-MgGraphRequest -Uri $appsUri -Method GET
                    $appRegistrations += $response.value
                    $appsUri = $response.'@odata.nextLink'
                } while ($appsUri)
            } catch {
                Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "Could not enumerate App Registrations - may require Application.Read.All permission" -Level "WARNING"
                $appRegistrations = @()
            }

            foreach ($app in $appRegistrations) {
                # Process password credentials (secrets)
                foreach ($secret in $app.passwordCredentials) {
                    $expiryDate = if ($secret.endDateTime) { [DateTime]$secret.endDateTime } else { $null }
                    $startDate = if ($secret.startDateTime) { [DateTime]$secret.startDateTime } else { $null }
                    $isExpired = if ($expiryDate) { $expiryDate -lt (Get-Date) } else { $false }
                    $daysUntilExpiry = if ($expiryDate -and -not $isExpired) { ($expiryDate - (Get-Date)).Days } else { 0 }
                    $isExpiringSoon = $daysUntilExpiry -gt 0 -and $daysUntilExpiry -le 30

                    # Calculate credential age
                    $credentialAge = if ($startDate) { ((Get-Date) - $startDate).Days } else { $null }
                    $isLongLived = $credentialAge -and $credentialAge -gt 365

                    $credData = [PSCustomObject]@{
                        ObjectType = "ServicePrincipalCredential"
                        ApplicationId = $app.id
                        AppId = $app.appId
                        ApplicationName = $app.displayName
                        CredentialType = "Secret"
                        CredentialId = $secret.keyId
                        DisplayName = $secret.displayName
                        Hint = $secret.hint
                        StartDateTime = $startDate
                        EndDateTime = $expiryDate
                        IsExpired = $isExpired
                        IsExpiringSoon = $isExpiringSoon
                        DaysUntilExpiry = $daysUntilExpiry
                        CredentialAgeDays = $credentialAge
                        IsLongLived = $isLongLived
                        SignInAudience = $app.signInAudience
                        ApplicationCreatedDateTime = $app.createdDateTime

                        _DataType = 'ServicePrincipalCredentials'
                        SessionId = $SessionId
                    }
                    $null = $allDiscoveredData.Add($credData)
                }

                # Process key credentials (certificates)
                foreach ($cert in $app.keyCredentials) {
                    $expiryDate = if ($cert.endDateTime) { [DateTime]$cert.endDateTime } else { $null }
                    $startDate = if ($cert.startDateTime) { [DateTime]$cert.startDateTime } else { $null }
                    $isExpired = if ($expiryDate) { $expiryDate -lt (Get-Date) } else { $false }
                    $daysUntilExpiry = if ($expiryDate -and -not $isExpired) { ($expiryDate - (Get-Date)).Days } else { 0 }
                    $isExpiringSoon = $daysUntilExpiry -gt 0 -and $daysUntilExpiry -le 30

                    $credentialAge = if ($startDate) { ((Get-Date) - $startDate).Days } else { $null }
                    $isLongLived = $credentialAge -and $credentialAge -gt 365

                    $credData = [PSCustomObject]@{
                        ObjectType = "ServicePrincipalCredential"
                        ApplicationId = $app.id
                        AppId = $app.appId
                        ApplicationName = $app.displayName
                        CredentialType = "Certificate"
                        CredentialId = $cert.keyId
                        DisplayName = $cert.displayName
                        CertificateType = $cert.type
                        CertificateUsage = $cert.usage
                        StartDateTime = $startDate
                        EndDateTime = $expiryDate
                        IsExpired = $isExpired
                        IsExpiringSoon = $isExpiringSoon
                        DaysUntilExpiry = $daysUntilExpiry
                        CredentialAgeDays = $credentialAge
                        IsLongLived = $isLongLived
                        SignInAudience = $app.signInAudience
                        ApplicationCreatedDateTime = $app.createdDateTime

                        _DataType = 'ServicePrincipalCredentials'
                        SessionId = $SessionId
                    }
                    $null = $allDiscoveredData.Add($credData)
                }
            }

            $spCredCount = @($allDiscoveredData | Where-Object { $_._DataType -eq 'ServicePrincipalCredentials' }).Count
            $expiredCount = @($allDiscoveredData | Where-Object { $_._DataType -eq 'ServicePrincipalCredentials' -and $_.IsExpired }).Count
            $expiringSoonCount = @($allDiscoveredData | Where-Object { $_._DataType -eq 'ServicePrincipalCredentials' -and $_.IsExpiringSoon }).Count
            $Result.Metadata["ServicePrincipalCredentialCount"] = $spCredCount
            $Result.Metadata["ExpiredCredentialCount"] = $expiredCount
            $Result.Metadata["ExpiringSoonCredentialCount"] = $expiringSoonCount
            Write-ModuleLog -ModuleName "AzureSecurityDiscovery" -Message "SP Credential Discovery - Found $spCredCount credentials ($expiredCount expired, $expiringSoonCount expiring soon)" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover Service Principal Credentials: $($_.Exception.Message)", $_.Exception, @{Section="ServicePrincipalCredentials"})
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
