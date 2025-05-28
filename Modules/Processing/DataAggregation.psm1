# Enhanced DataAggregation.psm1
function Build-ComprehensiveRelationshipGraph {
    param(
        [hashtable]$AggregatedData,
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "Building comprehensive relationship graph" -Level "HEADER"
        
        $relationships = @{
            UserToGroup = @{}
            GroupNesting = @{}
            ServicePrincipalPermissions = @{}
            ApplicationOwners = @{}
            DelegatedPermissions = @{}
            RoleAssignments = @{}
            AdminUnitMemberships = @{}
            ConditionalAccessTargets = @{}
            TransitiveMemberships = @{}
            PrivilegedAccessPaths = @{}
        }
        
        # Build user to group relationships with transitive membership
        if ($AggregatedData.Users -and $AggregatedData.Groups) {
            Write-MandALog "Building user to group relationships..." -Level "INFO"
            $relationships.UserToGroup = Build-UserToGroupRelationships -Users $AggregatedData.Users -Groups $AggregatedData.Groups
            
            Write-MandALog "Calculating transitive memberships..." -Level "INFO"
            $relationships.TransitiveMemberships = Calculate-TransitiveMemberships -DirectMemberships $relationships.UserToGroup -Groups $AggregatedData.Groups
        }
        
        # Build group nesting hierarchy
        if ($AggregatedData.Groups) {
            Write-MandALog "Building group nesting hierarchy..." -Level "INFO"
            $relationships.GroupNesting = Build-GroupNestingHierarchy -Groups $AggregatedData.Groups
        }
        
        # Map service principal permissions
        if ($AggregatedData.ServicePrincipals -and $AggregatedData.OAuth2Grants) {
            Write-MandALog "Mapping service principal permissions..." -Level "INFO"
            $relationships.ServicePrincipalPermissions = Map-ServicePrincipalPermissions `
                -ServicePrincipals $AggregatedData.ServicePrincipals `
                -OAuth2Grants $AggregatedData.OAuth2Grants
        }
        
        # Map application ownership and permissions
        if ($AggregatedData.Applications) {
            Write-MandALog "Mapping application ownership..." -Level "INFO"
            $relationships.ApplicationOwners = Map-ApplicationOwnership -Applications $AggregatedData.Applications
        }
        
        # Map role assignments
        if ($AggregatedData.DirectoryRoles) {
            Write-MandALog "Mapping role assignments..." -Level "INFO"
            $relationships.RoleAssignments = Map-RoleAssignments -Roles $AggregatedData.DirectoryRoles
        }
        
        # Calculate privileged access paths
        Write-MandALog "Calculating privileged access paths..." -Level "INFO"
        $relationships.PrivilegedAccessPaths = Find-PrivilegedAccessPaths -Relationships $relationships
        
        # Generate relationship statistics
        $stats = Generate-RelationshipStatistics -Relationships $relationships
        Write-MandALog "Relationship mapping completed. Stats: $($stats | ConvertTo-Json -Compress)" -Level "SUCCESS"
        
        return $relationships
        
    } catch {
        Write-MandALog "Error building relationship graph: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Build-UserToGroupRelationships {
    param($Users, $Groups)
    
    $userGroupMap = @{}
    
    foreach ($user in $Users) {
        $userGroups = @()
        
        # Get direct group memberships
        try {
            $memberOf = Invoke-SafeGraphOperation -Operation {
                Get-MgUserMemberOf -UserId $user.Id -All
            } -OperationName "Get-UserGroups" -Context @{UserId = $user.Id}
            
            foreach ($membership in $memberOf) {
                if ($membership.AdditionalProperties["@odata.type"] -eq "#microsoft.graph.group") {
                    $userGroups += @{
                        GroupId = $membership.Id
                        GroupName = $membership.AdditionalProperties.displayName
                        MembershipType = "Direct"
                    }
                }
            }
        } catch {
            Write-MandALog "Error getting groups for user $($user.UserPrincipalName): $($_.Exception.Message)" -Level "WARN"
        }
        
        $userGroupMap[$user.Id] = $userGroups
    }
    
    return $userGroupMap
}

function Calculate-TransitiveMemberships {
    param($DirectMemberships, $Groups)
    
    $transitiveMemberships = @{}
    
    # Build group membership graph
    $groupGraph = @{}
    foreach ($group in $Groups) {
        try {
            $groupMembers = Invoke-SafeGraphOperation -Operation {
                Get-MgGroupMemberOf -GroupId $group.Id -All
            } -OperationName "Get-GroupNesting" -Context @{GroupId = $group.Id}
            
            $parentGroups = $groupMembers | Where-Object { 
                $_.AdditionalProperties["@odata.type"] -eq "#microsoft.graph.group" 
            } | ForEach-Object { $_.Id }
            
            $groupGraph[$group.Id] = $parentGroups
        } catch {
            Write-MandALog "Error getting parent groups for $($group.DisplayName): $($_.Exception.Message)" -Level "WARN"
        }
    }
    
    # Calculate transitive closure for each user
    foreach ($userId in $DirectMemberships.Keys) {
        $allGroups = @{}
        $directGroups = $DirectMemberships[$userId] | ForEach-Object { $_.GroupId }
        
        foreach ($groupId in $directGroups) {
            $visited = @{}
            Get-TransitiveGroups -GroupId $groupId -GroupGraph $groupGraph -Visited $visited -AllGroups $allGroups
        }
        
        $transitiveMemberships[$userId] = $allGroups.Keys
    }
    
    return $transitiveMemberships
}

function Get-TransitiveGroups {
    param($GroupId, $GroupGraph, $Visited, $AllGroups)
    
    if ($Visited.ContainsKey($GroupId)) { return }
    
    $Visited[$GroupId] = $true
    $AllGroups[$GroupId] = $true
    
    if ($GroupGraph.ContainsKey($GroupId)) {
        foreach ($parentGroup in $GroupGraph[$GroupId]) {
            Get-TransitiveGroups -GroupId $parentGroup -GroupGraph $GroupGraph -Visited $Visited -AllGroups $AllGroups
        }
    }
}

function Map-ServicePrincipalPermissions {
    param($ServicePrincipals, $OAuth2Grants)
    
    $permissionMap = @{}
    
    foreach ($sp in $ServicePrincipals) {
        $permissions = @{
            ApplicationPermissions = @()
            DelegatedPermissions = @()
            AppRoleAssignments = @()
            OAuth2Permissions = @()
            TotalPermissionCount = 0
            HighRiskPermissionCount = 0
            ResourceAccess = @{}
        }
        
        # Get app role assignments (application permissions)
        try {
            $appRoleAssignments = Invoke-SafeGraphOperation -Operation {
                Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $sp.Id -All
            } -OperationName "Get-AppRoleAssignments" -Context @{ServicePrincipalId = $sp.Id}
            
            foreach ($assignment in $appRoleAssignments) {
                $resourceSp = Invoke-SafeGraphOperation -Operation {
                    Get-MgServicePrincipal -ServicePrincipalId $assignment.ResourceId -ErrorAction SilentlyContinue
                } -OperationName "Get-ResourceSP"
                
                $appRole = $resourceSp.AppRoles | Where-Object { $_.Id -eq $assignment.AppRoleId }
                
                $permissionDetail = @{
                    ResourceId = $assignment.ResourceId
                    ResourceName = $assignment.ResourceDisplayName
                    Permission = if ($appRole) { $appRole.Value } else { $assignment.AppRoleId }
                    PermissionType = "Application"
                    IsHighRisk = Test-HighRiskPermission -Permission $appRole.Value
                }
                
                $permissions.ApplicationPermissions += $permissionDetail
                
                if ($permissionDetail.IsHighRisk) {
                    $permissions.HighRiskPermissionCount++
                }
            }
        } catch {
            Write-MandALog "Error getting app role assignments for $($sp.DisplayName): $($_.Exception.Message)" -Level "WARN"
        }
        
        # Get OAuth2 delegated permissions
        $spOAuth2Grants = $OAuth2Grants | Where-Object { $_.ClientId -eq $sp.Id }
        foreach ($grant in $spOAuth2Grants) {
            $scopes = $grant.Scope -split ' '
            foreach ($scope in $scopes) {
                if ($scope) {
                    $permissionDetail = @{
                        ResourceId = $grant.ResourceId
                        ResourceName = $grant.ResourceDisplayName
                        Permission = $scope
                        PermissionType = "Delegated"
                        ConsentType = $grant.ConsentType
                        IsHighRisk = Test-HighRiskPermission -Permission $scope
                    }
                    
                    $permissions.DelegatedPermissions += $permissionDetail
                    
                    if ($permissionDetail.IsHighRisk) {
                        $permissions.HighRiskPermissionCount++
                    }
                }
            }
        }
        
        $permissions.TotalPermissionCount = $permissions.ApplicationPermissions.Count + $permissions.DelegatedPermissions.Count
        
        # Group by resource
        foreach ($perm in ($permissions.ApplicationPermissions + $permissions.DelegatedPermissions)) {
            if (-not $permissions.ResourceAccess.ContainsKey($perm.ResourceId)) {
                $permissions.ResourceAccess[$perm.ResourceId] = @{
                    ResourceName = $perm.ResourceName
                    Permissions = @()
                }
            }
            $permissions.ResourceAccess[$perm.ResourceId].Permissions += $perm.Permission
        }
        
        $permissionMap[$sp.Id] = $permissions
    }
    
    return $permissionMap
}

function Find-PrivilegedAccessPaths {
    param($Relationships)
    
    $privilegedPaths = @{
        UserToPrivilegedRole = @{}
        ServicePrincipalToPrivilegedAccess = @{}
        GroupToPrivilegedAccess = @{}
        AccessChains = @()
    }
    
    # Define privileged roles
    $privilegedRoles = @(
        "Global Administrator",
        "Privileged Role Administrator", 
        "Security Administrator",
        "Application Administrator",
        "Cloud Application Administrator",
        "Authentication Administrator",
        "Billing Administrator",
        "Conditional Access Administrator",
        "Exchange Administrator",
        "SharePoint Administrator",
        "User Administrator"
    )
    
    # Find direct privileged role assignments
    foreach ($roleAssignment in $Relationships.RoleAssignments.GetEnumerator()) {
        if ($roleAssignment.Value.RoleName -in $privilegedRoles) {
            foreach ($member in $roleAssignment.Value.Members) {
                if ($member.Type -eq "User") {
                    if (-not $privilegedPaths.UserToPrivilegedRole.ContainsKey($member.Id)) {
                        $privilegedPaths.UserToPrivilegedRole[$member.Id] = @()
                    }
                    $privilegedPaths.UserToPrivilegedRole[$member.Id] += @{
                        Role = $roleAssignment.Value.RoleName
                        AssignmentType = "Direct"
                        Path = @($member.Id, $roleAssignment.Key)
                    }
                }
            }
        }
    }
    
    # Find indirect paths through group membership
    foreach ($roleAssignment in $Relationships.RoleAssignments.GetEnumerator()) {
        if ($roleAssignment.Value.RoleName -in $privilegedRoles) {
            foreach ($member in $roleAssignment.Value.Members) {
                if ($member.Type -eq "Group") {
                    # Find all users who are members of this group (including transitive)
                    $groupMembers = Find-GroupMembers -GroupId $member.Id -TransitiveMemberships $Relationships.TransitiveMemberships
                    
                    foreach ($userId in $groupMembers) {
                        if (-not $privilegedPaths.UserToPrivilegedRole.ContainsKey($userId)) {
                            $privilegedPaths.UserToPrivilegedRole[$userId] = @()
                        }
                        $privilegedPaths.UserToPrivilegedRole[$userId] += @{
                            Role = $roleAssignment.Value.RoleName
                            AssignmentType = "Indirect"
                            Path = @($userId, $member.Id, $roleAssignment.Key)
                            Via = "Group: $($member.Name)"
                        }
                    }
                }
            }
        }
    }
    
    # Find service principals with dangerous permissions
    foreach ($spPermissions in $Relationships.ServicePrincipalPermissions.GetEnumerator()) {
        if ($spPermissions.Value.HighRiskPermissionCount -gt 0) {
            $privilegedPaths.ServicePrincipalToPrivilegedAccess[$spPermissions.Key] = @{
                HighRiskPermissions = $spPermissions.Value.ApplicationPermissions + $spPermissions.Value.DelegatedPermissions | 
                    Where-Object { $_.IsHighRisk }
                TotalHighRiskCount = $spPermissions.Value.HighRiskPermissionCount
            }
        }
    }
    
    return $privilegedPaths
}
