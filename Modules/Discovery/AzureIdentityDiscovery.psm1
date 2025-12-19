# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-12-19
# Last Modified: 2025-12-19

<#
.SYNOPSIS
    Azure Identity Discovery Module - Users, Groups, and Administrative Units
.DESCRIPTION
    Extracts Azure AD identities for migration planning and analysis.
    Discovers:
    - Azure AD Users with migration readiness assessment
    - Azure AD Groups (Security, M365, Distribution)
    - Administrative Units with delegated admin model

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

function Invoke-AzureIdentityDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-ModuleLog -ModuleName "AzureIdentityDiscovery" -Message "Starting Azure Identity Discovery (Users, Groups, Administrative Units)..." -Level "INFO"

    # Define discovery script
    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)

        $allDiscoveredData = [System.Collections.ArrayList]::new()

        #region Enhanced User Discovery - Foundation for Migration Planning
        Write-ModuleLog -ModuleName "AzureIdentityDiscovery" -Message "Discovering Azure AD Users with migration readiness assessment..." -Level "INFO"

        try {
            # Get all users with comprehensive enhanced fields from Graph API beta
            $users = @()
            $userUri = "https://graph.microsoft.com/beta/users?`$select=id,userPrincipalName,displayName,mail,mailNickname,givenName,surname,jobTitle,department,companyName,officeLocation,mobilePhone,businessPhones,employeeId,employeeType,createdDateTime,accountEnabled,userType,usageLocation,assignedLicenses,assignedPlans,onPremisesSyncEnabled,onPremisesImmutableId,onPremisesSamAccountName,onPremisesUserPrincipalName,lastPasswordChangeDateTime,passwordPolicies&`$expand=manager(`$select=id,displayName,userPrincipalName)&`$top=999"

            do {
                $response = Invoke-MgGraphRequest -Uri $userUri -Method GET
                $users += $response.value
                $userUri = $response.'@odata.nextLink'
            } while ($userUri)

            foreach ($user in $users) {
                # Get additional user details with error handling
                $userId = $user.id

                # Get user's group memberships with enhanced details
                $groupMemberships = @()
                $groupMembershipCount = 0
                try {
                    $groupsUri = "https://graph.microsoft.com/beta/users/$userId/memberOf?`$select=id,displayName,groupTypes,mailEnabled,securityEnabled"
                    $groupsResponse = Invoke-MgGraphRequest -Uri $groupsUri -Method GET
                    $groupMemberships = $groupsResponse.value | Where-Object { $_.'@odata.type' -eq '#microsoft.graph.group' }
                    $groupMembershipCount = $groupMemberships.Count
                } catch {
                    $groupMembershipCount = 0
                }

                # Get user's app role assignments count only to avoid complex queries
                $appRoleAssignmentCount = 0
                try {
                    $appRolesUri = "https://graph.microsoft.com/v1.0/users/$userId/appRoleAssignments?`$select=id"
                    $appRolesResponse = Invoke-MgGraphRequest -Uri $appRolesUri -Method GET
                    $appRoleAssignmentCount = $appRolesResponse.value.Count
                } catch {
                    $appRoleAssignmentCount = 0
                }

                # Enhanced sign-in activity information
                $signInActivity = if ($user.signInActivity) { $user.signInActivity } else { $null }

                # ===== MIGRATION READINESS ASSESSMENT =====
                # Determine user classification for migration planning
                $userClassification = switch ($true) {
                    ($user.userType -eq 'Guest') { 'Guest' }
                    ($user.onPremisesSyncEnabled -eq $true) { 'Synced' }
                    ($user.userPrincipalName -like '*#EXT#*') { 'External' }
                    default { 'Cloud-Only' }
                }

                # Migration readiness assessment
                $migrationReadiness = 'Ready'
                $migrationNotes = @()
                $migrationBlockers = @()

                if ($user.onPremisesSyncEnabled) {
                    $migrationNotes += 'Synced from on-premises - requires AD migration first'
                    $migrationReadiness = 'Dependent'
                    $migrationBlockers += 'OnPremisesSync'
                }

                if ($user.userType -eq 'Guest') {
                    $migrationNotes += 'Guest account - may need re-invitation in target tenant'
                    if ($migrationReadiness -ne 'Dependent') {
                        $migrationReadiness = 'Review'
                    }
                }

                if (-not $user.accountEnabled) {
                    $migrationNotes += 'Account disabled - verify if migration needed'
                    if ($migrationReadiness -ne 'Dependent') {
                        $migrationReadiness = 'Review'
                    }
                }

                if ($appRoleAssignmentCount -gt 0) {
                    $migrationNotes += "Has $appRoleAssignmentCount app role assignments to migrate"
                }

                if ($groupMembershipCount -gt 10) {
                    $migrationNotes += "Member of $groupMembershipCount groups - review group migration dependencies"
                }

                if (-not $user.usageLocation) {
                    $migrationNotes += 'No usage location set - may affect licensing in target tenant'
                    if ($migrationReadiness -eq 'Ready') {
                        $migrationReadiness = 'Review'
                    }
                }

                # Create enhanced comprehensive user object
                $userData = [PSCustomObject]@{
                    ObjectType = "AzureADUser"
                    Id = $user.id
                    UserPrincipalName = $user.userPrincipalName
                    DisplayName = $user.displayName
                    Mail = $user.mail
                    MailNickname = $user.mailNickname

                    # Personal Info
                    GivenName = $user.givenName
                    Surname = $user.surname
                    JobTitle = $user.jobTitle
                    Department = $user.department
                    CompanyName = $user.companyName

                    # Contact Info
                    OfficeLocation = $user.officeLocation
                    MobilePhone = $user.mobilePhone
                    BusinessPhones = ($user.businessPhones -join ';')

                    # Employee Info
                    EmployeeId = $user.employeeId
                    EmployeeType = $user.employeeType

                    # Account Status
                    AccountEnabled = $user.accountEnabled
                    UserType = $user.userType
                    UsageLocation = $user.usageLocation
                    CreatedDateTime = $user.createdDateTime

                    # Licensing - Enhanced
                    AssignedLicenses = ($user.assignedLicenses | ForEach-Object { $_.skuId }) -join '; '
                    AssignedPlans = ($user.assignedPlans | ForEach-Object { $_.servicePlanId }) -join '; '
                    LicenseCount = @($user.assignedLicenses).Count

                    # Sync Status - Enhanced
                    OnPremisesSyncEnabled = $user.onPremisesSyncEnabled
                    OnPremisesImmutableId = $user.onPremisesImmutableId
                    OnPremisesSamAccountName = $user.onPremisesSamAccountName
                    OnPremisesUserPrincipalName = $user.onPremisesUserPrincipalName

                    # Security - Enhanced
                    LastPasswordChangeDateTime = $user.lastPasswordChangeDateTime
                    PasswordPolicies = $user.passwordPolicies
                    LastSignInDateTime = if ($signInActivity) { $signInActivity.lastSignInDateTime } else { $null }

                    # Manager - Enhanced
                    ManagerUPN = if ($user.manager) { $user.manager.userPrincipalName } else { $null }
                    ManagerId = if ($user.manager) { $user.manager.id } else { $null }
                    ManagerDisplayName = if ($user.manager) { $user.manager.displayName } else { $null }

                    # Relationships
                    GroupMembershipCount = $groupMembershipCount
                    GroupMemberships = ($groupMemberships | ForEach-Object { $_.displayName }) -join '; '
                    AppRoleAssignmentCount = $appRoleAssignmentCount

                    # ===== MIGRATION ASSESSMENT FIELDS =====
                    UserClassification = $userClassification
                    MigrationReadiness = $migrationReadiness
                    MigrationNotes = ($migrationNotes -join '; ')
                    MigrationBlockers = ($migrationBlockers -join '; ')

                    _DataType = 'Users'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($userData)
            }

            $Result.Metadata["UserCount"] = $users.Count
            $Result.Metadata["GuestCount"] = @($users | Where-Object { $_.userType -eq 'Guest' }).Count
            $Result.Metadata["SyncedCount"] = @($users | Where-Object { $_.onPremisesSyncEnabled -eq $true }).Count
            $Result.Metadata["CloudOnlyCount"] = @($users | Where-Object { $_.onPremisesSyncEnabled -ne $true -and $_.userType -ne 'Guest' }).Count

            Write-ModuleLog -ModuleName "AzureIdentityDiscovery" -Message "User Discovery - Found $($users.Count) users (Guests: $($Result.Metadata['GuestCount']), Synced: $($Result.Metadata['SyncedCount']), Cloud-Only: $($Result.Metadata['CloudOnlyCount']))" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover users: $($_.Exception.Message)", $_.Exception, @{Section="Users"})
        }
        #endregion

        #region Enhanced Azure Groups Discovery via Graph API
        Write-ModuleLog -ModuleName "AzureIdentityDiscovery" -Message "Discovering Azure Groups with enhanced analysis..." -Level "INFO"

        try {
            $groups = @()
            $groupUri = "https://graph.microsoft.com/beta/groups?`$select=id,displayName,mailEnabled,mailNickname,mail,securityEnabled,groupTypes,description,visibility,createdDateTime,membershipRule,membershipRuleProcessingState,onPremisesSyncEnabled,proxyAddresses,classification,isAssignableToRole,resourceProvisioningOptions"

            do {
                $response = Invoke-MgGraphRequest -Uri $groupUri -Method GET
                $groups += $response.value
                $groupUri = $response.'@odata.nextLink'
            } while ($groupUri)

            foreach ($group in $groups) {
                # Get Group Owners with enhanced details
                $owners = @()
                $ownerCount = 0
                try {
                    $ownersUri = "https://graph.microsoft.com/beta/groups/$($group.id)/owners"
                    $ownersResponse = Invoke-MgGraphRequest -Uri $ownersUri -Method GET
                    $owners = $ownersResponse.value
                    $ownerCount = $owners.Count
                } catch {
                    $ownerCount = 0
                }

                # Get Group Members (sample for performance - full member list can be huge)
                $members = @()
                $memberCount = 0
                try {
                    $membersUri = "https://graph.microsoft.com/beta/groups/$($group.id)/members?`$top=100"
                    $membersResponse = Invoke-MgGraphRequest -Uri $membersUri -Method GET
                    $members = $membersResponse.value
                    $memberCount = $members.Count

                    # Get full member count if available
                    if ($membersResponse.'@odata.count') {
                        $memberCount = $membersResponse.'@odata.count'
                    }
                } catch {
                    $memberCount = 0
                }

                # Enhanced Group Type Analysis
                $groupType = 'SecurityGroup'
                if ($group.groupTypes -contains 'Unified') { $groupType = 'Microsoft365Group' }
                if ($group.mailEnabled -and -not $group.securityEnabled) { $groupType = 'DistributionList' }

                # Determine if dynamic group
                $isDynamic = ($null -ne $group.membershipRule)

                # Migration assessment for groups
                $groupMigrationNotes = @()
                if ($group.onPremisesSyncEnabled) {
                    $groupMigrationNotes += 'Synced from on-premises - requires migration planning'
                }
                if ($isDynamic) {
                    $groupMigrationNotes += 'Dynamic group - membership rule must be recreated in target tenant'
                }
                if ($group.isAssignableToRole) {
                    $groupMigrationNotes += 'Role-assignable group - requires elevated permissions in target tenant'
                }
                if ($memberCount -gt 100) {
                    $groupMigrationNotes += "Large group with $memberCount members - plan bulk member migration"
                }

                $groupData = [PSCustomObject]@{
                    ObjectType = "AzureGroup"
                    Id = $group.id
                    DisplayName = $group.displayName
                    Mail = $group.mail
                    MailNickname = $group.mailNickname
                    MailEnabled = $group.mailEnabled
                    SecurityEnabled = $group.securityEnabled
                    GroupType = $groupType
                    GroupTypes = ($group.groupTypes -join ';')
                    Description = $group.description
                    Visibility = $group.visibility
                    Classification = $group.classification
                    CreatedDateTime = $group.createdDateTime
                    MembershipRule = $group.membershipRule
                    MembershipRuleProcessingState = $group.membershipRuleProcessingState
                    IsDynamic = $isDynamic
                    OnPremisesSyncEnabled = $group.onPremisesSyncEnabled
                    ProxyAddresses = if ($group.proxyAddresses) { ($group.proxyAddresses -join ';') } else { $null }
                    IsAssignableToRole = $group.isAssignableToRole

                    OwnerCount = $ownerCount
                    MemberCount = $memberCount
                    Owners = ($owners | ForEach-Object {
                        if ($_.displayName) { $_.displayName }
                        elseif ($_.userPrincipalName) { $_.userPrincipalName }
                        else { $_.id }
                    }) -join '; '

                    SampleMembers = ($members | ForEach-Object {
                        if ($_.displayName) { $_.displayName }
                        elseif ($_.userPrincipalName) { $_.userPrincipalName }
                        else { $_.id }
                    }) -join '; '

                    SampleMemberTypes = ($members.'@odata.type' -join '; ')

                    # Migration assessment
                    MigrationNotes = ($groupMigrationNotes -join '; ')

                    _DataType = 'Groups'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($groupData)
            }

            $Result.Metadata["GroupCount"] = $groups.Count
            $Result.Metadata["SecurityGroupCount"] = @($groups | Where-Object { $_.securityEnabled -and ($_.groupTypes -notcontains 'Unified') }).Count
            $Result.Metadata["M365GroupCount"] = @($groups | Where-Object { $_.groupTypes -contains 'Unified' }).Count
            $Result.Metadata["DistributionListCount"] = @($groups | Where-Object { $_.mailEnabled -and -not $_.securityEnabled }).Count
            $Result.Metadata["DynamicGroupCount"] = @($groups | Where-Object { $null -ne $_.membershipRule }).Count

            Write-ModuleLog -ModuleName "AzureIdentityDiscovery" -Message "Group Discovery - Found $($groups.Count) groups (Security: $($Result.Metadata['SecurityGroupCount']), M365: $($Result.Metadata['M365GroupCount']), Distribution: $($Result.Metadata['DistributionListCount']), Dynamic: $($Result.Metadata['DynamicGroupCount']))" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover groups: $($_.Exception.Message)", $_.Exception, @{Section="Groups"})
        }
        #endregion

        #region Administrative Units Discovery - CRITICAL FOR DELEGATED ADMIN MODEL
        Write-ModuleLog -ModuleName "AzureIdentityDiscovery" -Message "Discovering Administrative Units..." -Level "INFO"

        try {
            $adminUnits = @()
            $auUri = "https://graph.microsoft.com/v1.0/directory/administrativeUnits"

            do {
                $response = Invoke-MgGraphRequest -Uri $auUri -Method GET
                $adminUnits += $response.value
                $auUri = $response.'@odata.nextLink'
            } while ($auUri)

            foreach ($au in $adminUnits) {
                # Get members for this AU
                $members = @()
                $memberCount = 0
                try {
                    $membersUri = "https://graph.microsoft.com/v1.0/directory/administrativeUnits/$($au.id)/members"
                    $membersResponse = Invoke-MgGraphRequest -Uri $membersUri -Method GET
                    $members = $membersResponse.value
                    $memberCount = $members.Count
                } catch {
                    $memberCount = 0
                }

                # Get scoped role members for this AU
                $scopedRoleMembers = @()
                $scopedRoleMemberCount = 0
                try {
                    $scopedRoleUri = "https://graph.microsoft.com/v1.0/directory/administrativeUnits/$($au.id)/scopedRoleMembers"
                    $scopedRoleResponse = Invoke-MgGraphRequest -Uri $scopedRoleUri -Method GET
                    $scopedRoleMembers = $scopedRoleResponse.value
                    $scopedRoleMemberCount = $scopedRoleMembers.Count
                } catch {
                    $scopedRoleMemberCount = 0
                }

                # Migration assessment
                $auMigrationNotes = @()
                if ($memberCount -gt 0) {
                    $auMigrationNotes += "Contains $memberCount members - plan member migration"
                }
                if ($scopedRoleMemberCount -gt 0) {
                    $auMigrationNotes += "Has $scopedRoleMemberCount scoped role assignments - recreate role assignments in target tenant"
                }

                $auData = [PSCustomObject]@{
                    ObjectType              = "AdministrativeUnit"
                    Id                      = $au.id
                    DisplayName             = $au.displayName
                    Description             = $au.description
                    Visibility              = $au.visibility
                    MemberCount             = $memberCount
                    ScopedRoleMemberCount   = $scopedRoleMemberCount
                    Members                 = ($members.id -join '; ')
                    MemberTypes             = ($members.'@odata.type' -join '; ')
                    ScopedRoleMembers       = ($scopedRoleMembers | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)

                    # Migration assessment
                    MigrationNotes          = ($auMigrationNotes -join '; ')

                    _DataType               = 'AdministrativeUnits'
                    SessionId               = $SessionId
                }
                $null = $allDiscoveredData.Add($auData)
            }

            $Result.Metadata["AdministrativeUnitCount"] = $adminUnits.Count
            Write-ModuleLog -ModuleName "AzureIdentityDiscovery" -Message "AU Discovery - Found $($adminUnits.Count) administrative units" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover Administrative Units: $($_.Exception.Message)", $_.Exception, @{Section="AdministrativeUnits"})
        }
        #endregion

        $Result.RecordCount = $allDiscoveredData.Count
        Write-ModuleLog -ModuleName "AzureIdentityDiscovery" -Message "Identity Discovery Complete - Total Records: $($allDiscoveredData.Count)" -Level "SUCCESS"

        # Group by data type for CSV export
        return $allDiscoveredData | Group-Object -Property _DataType
    }

    # Execute discovery using base module
    Start-DiscoveryModule `
        -ModuleName "AzureIdentityDiscovery" `
        -DiscoveryScript $discoveryScript `
        -Configuration $Configuration `
        -Context $Context `
        -SessionId $SessionId `
        -RequiredServices @()  # Empty array - module handles its own Graph API auth
}

Export-ModuleMember -Function Invoke-AzureIdentityDiscovery
