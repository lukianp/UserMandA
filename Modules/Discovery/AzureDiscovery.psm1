# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 2.0.0
# Created: 2025-08-03
# Last Modified: 2025-08-03

<#
.SYNOPSIS
    Comprehensive Azure Infrastructure Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Performs deep Azure infrastructure discovery inspired by AzureHound methodology.
    Extracts maximum data for user migration and infrastructure assessment including:
    - Azure AD Users with full attributes for migration planning
    - Virtual Machines with configurations
    - Network Security Groups and rules
    - Load Balancers and configurations
    - Storage Accounts with access policies
    - Key Vaults with access policies
    - Azure Database for MySQL flexible servers
    - Network infrastructure
    - RBAC assignments
.NOTES
    Version: 2.0.0
    Author: System Enhancement
    Created: 2025-08-03
    Requires: PowerShell 5.1+, Az modules, Microsoft.Graph modules
#>

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Invoke-AzureDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,
        
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    # Define discovery script
    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)
        
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Get connections
        $graphConnection = $Connections["Graph"]
        $azureConnection = $null
        
        try {
            # Try to get Azure connection
            if ($Connections.ContainsKey("Azure")) {
                $azureConnection = $Connections["Azure"]
            } else {
                # Try to connect to Azure using available credentials
                if ($Configuration.TenantId -and $Configuration.ClientId -and $Configuration.ClientSecret) {
                    try {
                        # Check if Az module is available
                        if (Get-Module -ListAvailable -Name "Az.Accounts") {
                            $secureSecret = ConvertTo-SecureString $Configuration.ClientSecret -AsPlainText -Force
                            $credential = New-Object System.Management.Automation.PSCredential($Configuration.ClientId, $secureSecret)
                            $azureConnection = Connect-AzAccount -ServicePrincipal -Credential $credential -Tenant $Configuration.TenantId -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
                        }
                    } catch {
                        Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Azure connection failed, continuing with Graph API only: $($_.Exception.Message)" -Level "WARN"
                    }
                }
            }
        } catch {
            $Result.AddWarning("Could not establish Azure connection, will use Graph API where possible", @{Error=$_.Exception.Message})
        }
        
        #region User Discovery - Foundation for Migration Planning
        Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering Azure AD Users - Extracting comprehensive user data..." -Level "INFO"
        
        try {
            # Get all users with basic properties first, then expand as needed
            $users = @()
            $userUri = "https://graph.microsoft.com/v1.0/users?`$select=id,userPrincipalName,displayName,givenName,surname,mail,otherMails,proxyAddresses,accountEnabled,userType,creationType,createdDateTime,jobTitle,department,companyName,officeLocation,streetAddress,city,state,country,postalCode,mobilePhone,businessPhones,employeeId,employeeType,onPremisesSamAccountName,onPremisesDistinguishedName,onPremisesUserPrincipalName,onPremisesSyncEnabled,onPremisesLastSyncDateTime,preferredLanguage,usageLocation,assignedLicenses"
            
            do {
                $response = Invoke-MgGraphRequest -Uri $userUri -Method GET
                $users += $response.value
                $userUri = $response.'@odata.nextLink'
            } while ($userUri)
            
            foreach ($user in $users) {
                # Get additional user details with error handling
                $userId = $user.id
                
                # Get user's group memberships (simplified)
                $groupMemberships = @()
                $groupMembershipCount = 0
                try {
                    $groupsUri = "https://graph.microsoft.com/v1.0/users/$userId/memberOf?`$select=id,displayName"
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
                
                # Skip authentication methods for now to avoid permission issues
                $authMethodCount = 0
                
                # Create comprehensive user object
                $userData = [PSCustomObject]@{
                    ObjectType = "AzureADUser"
                    Id = $user.id
                    UserPrincipalName = $user.userPrincipalName
                    DisplayName = $user.displayName
                    GivenName = $user.givenName
                    Surname = $user.surname
                    Mail = $user.mail
                    OtherMails = ($user.otherMails -join '; ')
                    ProxyAddresses = ($user.proxyAddresses -join '; ')
                    AccountEnabled = $user.accountEnabled
                    UserType = $user.userType
                    CreationType = $user.creationType
                    CreatedDateTime = $user.createdDateTime
                    LastSignInDateTime = $user.signInActivity.lastSignInDateTime
                    JobTitle = $user.jobTitle
                    Department = $user.department
                    CompanyName = $user.companyName
                    OfficeLocation = $user.officeLocation
                    StreetAddress = $user.streetAddress
                    City = $user.city
                    State = $user.state
                    Country = $user.country
                    PostalCode = $user.postalCode
                    MobilePhone = $user.mobilePhone
                    BusinessPhones = ($user.businessPhones -join '; ')
                    EmployeeId = $user.employeeId
                    EmployeeType = $user.employeeType
                    OnPremisesSamAccountName = $user.onPremisesSamAccountName
                    OnPremisesDistinguishedName = $user.onPremisesDistinguishedName
                    OnPremisesUserPrincipalName = $user.onPremisesUserPrincipalName
                    OnPremisesSyncEnabled = $user.onPremisesSyncEnabled
                    OnPremisesLastSyncDateTime = $user.onPremisesLastSyncDateTime
                    PreferredLanguage = $user.preferredLanguage
                    UsageLocation = $user.usageLocation
                    ManagerId = $null
                    ManagerDisplayName = $null
                    GroupMembershipCount = $groupMembershipCount
                    GroupMemberships = ($groupMemberships | ForEach-Object { $_.displayName }) -join '; '
                    AppRoleAssignmentCount = $appRoleAssignmentCount
                    AuthenticationMethodCount = $authMethodCount
                    AuthenticationMethods = $null
                    AssignedLicenses = ($user.assignedLicenses | ForEach-Object { $_.skuId }) -join '; '
                    _DataType = 'Users'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($userData)
            }
            
            $Result.Metadata["UserCount"] = $users.Count
            Write-ModuleLog -ModuleName "AzureDiscovery" -Message "User Discovery - Discovered $($users.Count) users" -Level "SUCCESS"
            
        } catch {
            $Result.AddError("Failed to discover users: $($_.Exception.Message)", $_.Exception, @{Section="Users"})
        }
        #endregion
        
        #region Azure Applications Discovery via Graph API
        Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering Azure Applications..." -Level "INFO"
        
        try {
            $applications = @()
            $appUri = "https://graph.microsoft.com/v1.0/applications?`$select=id,appId,displayName,createdDateTime,publisherDomain,signInAudience,tags,web,spa,publicClient,requiredResourceAccess"
            
            do {
                $response = Invoke-MgGraphRequest -Uri $appUri -Method GET
                $applications += $response.value
                $appUri = $response.'@odata.nextLink'
            } while ($appUri)
            
            foreach ($app in $applications) {
                # Get Application Owners
                $owners = @()
                $ownerCount = 0
                try {
                    $ownersUri = "https://graph.microsoft.com/v1.0/applications/$($app.id)/owners"
                    $ownersResponse = Invoke-MgGraphRequest -Uri $ownersUri -Method GET
                    $owners = $ownersResponse.value
                    $ownerCount = $owners.Count
                } catch {
                    $ownerCount = 0
                }
                
                $appData = [PSCustomObject]@{
                    ObjectType = "AzureApplication"
                    Id = $app.id
                    AppId = $app.appId
                    DisplayName = $app.displayName
                    CreatedDateTime = $app.createdDateTime
                    PublisherDomain = $app.publisherDomain
                    SignInAudience = $app.signInAudience
                    Tags = ($app.tags -join '; ')
                    RequiredResourceAccessCount = $app.requiredResourceAccess.Count
                    RequiredResourceAccess = ($app.requiredResourceAccess | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                    OwnerCount = $ownerCount
                    Owners = ($owners.id -join '; ')
                    OwnerTypes = ($owners.'@odata.type' -join '; ')
                    _DataType = 'Applications'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($appData)
            }
            
            $Result.Metadata["ApplicationCount"] = $applications.Count
            Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Application Discovery - Discovered $($applications.Count) applications" -Level "SUCCESS"
            
        } catch {
            $Result.AddError("Failed to discover applications: $($_.Exception.Message)", $_.Exception, @{Section="Applications"})
        }
        #endregion
        
        #region Azure Service Principals Discovery via Graph API
        Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering Azure Service Principals..." -Level "INFO"
        
        try {
            $servicePrincipals = @()
            $spUri = "https://graph.microsoft.com/v1.0/servicePrincipals?`$select=id,appId,displayName,createdDateTime,servicePrincipalType,tags,homepage,replyUrls,servicePrincipalNames"
            
            do {
                $response = Invoke-MgGraphRequest -Uri $spUri -Method GET
                $servicePrincipals += $response.value
                $spUri = $response.'@odata.nextLink'
            } while ($spUri)
            
            foreach ($sp in $servicePrincipals) {
                # Get Service Principal Owners
                $owners = @()
                $ownerCount = 0
                try {
                    $ownersUri = "https://graph.microsoft.com/v1.0/servicePrincipals/$($sp.id)/owners"
                    $ownersResponse = Invoke-MgGraphRequest -Uri $ownersUri -Method GET
                    $owners = $ownersResponse.value
                    $ownerCount = $owners.Count
                } catch {
                    $ownerCount = 0
                }
                
                $spData = [PSCustomObject]@{
                    ObjectType = "AzureServicePrincipal"
                    Id = $sp.id
                    AppId = $sp.appId
                    DisplayName = $sp.displayName
                    CreatedDateTime = $sp.createdDateTime
                    ServicePrincipalType = $sp.servicePrincipalType
                    Tags = ($sp.tags -join '; ')
                    Homepage = $sp.homepage
                    ReplyUrls = ($sp.replyUrls -join '; ')
                    ServicePrincipalNames = ($sp.servicePrincipalNames -join '; ')
                    OwnerCount = $ownerCount
                    Owners = ($owners.id -join '; ')
                    OwnerTypes = ($owners.'@odata.type' -join '; ')
                    _DataType = 'ServicePrincipals'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($spData)
            }
            
            $Result.Metadata["ServicePrincipalCount"] = $servicePrincipals.Count
            Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Service Principal Discovery - Discovered $($servicePrincipals.Count) service principals" -Level "SUCCESS"
            
        } catch {
            $Result.AddError("Failed to discover service principals: $($_.Exception.Message)", $_.Exception, @{Section="ServicePrincipals"})
        }
        #endregion
        
        #region Azure Groups Discovery via Graph API
        Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering Azure Groups..." -Level "INFO"
        
        try {
            $groups = @()
            $groupUri = "https://graph.microsoft.com/v1.0/groups?`$select=id,displayName,description,groupTypes,createdDateTime,mail,mailEnabled,securityEnabled,visibility,onPremisesSyncEnabled"
            
            do {
                $response = Invoke-MgGraphRequest -Uri $groupUri -Method GET
                $groups += $response.value
                $groupUri = $response.'@odata.nextLink'
            } while ($groupUri)
            
            foreach ($group in $groups) {
                # Get Group Owners
                $owners = @()
                $ownerCount = 0
                try {
                    $ownersUri = "https://graph.microsoft.com/v1.0/groups/$($group.id)/owners"
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
                    $membersUri = "https://graph.microsoft.com/v1.0/groups/$($group.id)/members?`$top=100"
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
                
                $groupData = [PSCustomObject]@{
                    ObjectType = "AzureGroup"
                    Id = $group.id
                    DisplayName = $group.displayName
                    Description = $group.description
                    GroupTypes = ($group.groupTypes -join '; ')
                    CreatedDateTime = $group.createdDateTime
                    Mail = $group.mail
                    MailEnabled = $group.mailEnabled
                    SecurityEnabled = $group.securityEnabled
                    Visibility = $group.visibility
                    OnPremisesSyncEnabled = $group.onPremisesSyncEnabled
                    OwnerCount = $ownerCount
                    MemberCount = $memberCount
                    Owners = ($owners.id -join '; ')
                    OwnerTypes = ($owners.'@odata.type' -join '; ')
                    SampleMembers = ($members.id -join '; ')
                    SampleMemberTypes = ($members.'@odata.type' -join '; ')
                    _DataType = 'Groups'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($groupData)
            }
            
            $Result.Metadata["GroupCount"] = $groups.Count
            Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Group Discovery - Discovered $($groups.Count) groups" -Level "SUCCESS"
            
        } catch {
            $Result.AddError("Failed to discover groups: $($_.Exception.Message)", $_.Exception, @{Section="Groups"})
        }
        #endregion
        
        #region Azure Directory Roles Discovery via Graph API
        Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering Azure Directory Roles..." -Level "INFO"
        
        try {
            $directoryRoles = @()
            $roleUri = "https://graph.microsoft.com/v1.0/directoryRoles?`$select=id,displayName,description,roleTemplateId"
            
            do {
                $response = Invoke-MgGraphRequest -Uri $roleUri -Method GET
                $directoryRoles += $response.value
                $roleUri = $response.'@odata.nextLink'
            } while ($roleUri)
            
            foreach ($role in $directoryRoles) {
                # Get role members
                $memberCount = 0
                try {
                    $membersUri = "https://graph.microsoft.com/v1.0/directoryRoles/$($role.id)/members?`$select=id"
                    $membersResponse = Invoke-MgGraphRequest -Uri $membersUri -Method GET
                    $memberCount = $membersResponse.value.Count
                } catch {
                    $memberCount = 0
                }
                
                $roleData = [PSCustomObject]@{
                    ObjectType = "AzureDirectoryRole"
                    Id = $role.id
                    DisplayName = $role.displayName
                    Description = $role.description
                    RoleTemplateId = $role.roleTemplateId
                    MemberCount = $memberCount
                    _DataType = 'DirectoryRoles'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($roleData)
            }
            
            $Result.Metadata["DirectoryRoleCount"] = $directoryRoles.Count
            Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Directory Role Discovery - Discovered $($directoryRoles.Count) directory roles" -Level "SUCCESS"
            
        } catch {
            $Result.AddError("Failed to discover directory roles: $($_.Exception.Message)", $_.Exception, @{Section="DirectoryRoles"})
        }
        #endregion
        
        #region Azure Devices Discovery via Graph API
        Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering Azure Devices..." -Level "INFO"
        
        try {
            $devices = @()
            $deviceUri = "https://graph.microsoft.com/v1.0/devices?`$select=id,displayName,deviceId,operatingSystem,operatingSystemVersion,createdDateTime,lastSignInDateTime,accountEnabled,isCompliant,isManaged,deviceVersion,deviceMetadata,deviceOwnership,enrollmentType"
            
            do {
                $response = Invoke-MgGraphRequest -Uri $deviceUri -Method GET
                $devices += $response.value
                $deviceUri = $response.'@odata.nextLink'
            } while ($deviceUri)
            
            foreach ($device in $devices) {
                $deviceData = [PSCustomObject]@{
                    ObjectType = "AzureDevice"
                    Id = $device.id
                    DisplayName = $device.displayName
                    DeviceId = $device.deviceId
                    OperatingSystem = $device.operatingSystem
                    OperatingSystemVersion = $device.operatingSystemVersion
                    CreatedDateTime = $device.createdDateTime
                    LastSignInDateTime = $device.lastSignInDateTime
                    AccountEnabled = $device.accountEnabled
                    IsCompliant = $device.isCompliant
                    IsManaged = $device.isManaged
                    DeviceVersion = $device.deviceVersion
                    DeviceOwnership = $device.deviceOwnership
                    EnrollmentType = $device.enrollmentType
                    _DataType = 'Devices'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($deviceData)
            }
            
            $Result.Metadata["DeviceCount"] = $devices.Count
            Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Device Discovery - Discovered $($devices.Count) devices" -Level "SUCCESS"
            
        } catch {
            $Result.AddError("Failed to discover devices: $($_.Exception.Message)", $_.Exception, @{Section="Devices"})
        }
        #endregion
        
        #region Conditional Access Policies Discovery - CRITICAL FOR SECURITY MIGRATION
        Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering Conditional Access Policies..." -Level "INFO"
        
        try {
            $caPolicies = @()
            $caUri = "https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies"
            
            do {
                $response = Invoke-MgGraphRequest -Uri $caUri -Method GET
                $caPolicies += $response.value
                $caUri = $response.'@odata.nextLink'
            } while ($caUri)
            
            foreach ($policy in $caPolicies) {
                $policyData = [PSCustomObject]@{
                    ObjectType              = "ConditionalAccessPolicy"
                    Id                      = $policy.id
                    DisplayName             = $policy.displayName
                    State                   = $policy.state
                    CreatedDateTime         = $policy.createdDateTime
                    ModifiedDateTime        = $policy.modifiedDateTime
                    IncludedUsers           = ($policy.conditions.users.includeUsers -join '; ')
                    ExcludedUsers           = ($policy.conditions.users.excludeUsers -join '; ')
                    IncludedGroups          = ($policy.conditions.users.includeGroups -join '; ')
                    ExcludedGroups          = ($policy.conditions.users.excludeGroups -join '; ')
                    IncludedRoles           = ($policy.conditions.users.includeRoles -join '; ')
                    ExcludedRoles           = ($policy.conditions.users.excludeRoles -join '; ')
                    IncludedApps            = ($policy.conditions.applications.includeApplications -join '; ')
                    ExcludedApps            = ($policy.conditions.applications.excludeApplications -join '; ')
                    IncludedUserActions     = ($policy.conditions.applications.includeUserActions -join '; ')
                    IncludedLocations       = ($policy.conditions.locations.includeLocations -join '; ')
                    ExcludedLocations       = ($policy.conditions.locations.excludeLocations -join '; ')
                    DevicePlatforms         = ($policy.conditions.platforms.includePlatforms -join '; ')
                    ExcludedPlatforms       = ($policy.conditions.platforms.excludePlatforms -join '; ')
                    SignInRiskLevels        = ($policy.conditions.signInRiskLevels -join '; ')
                    UserRiskLevels          = ($policy.conditions.userRiskLevels -join '; ')
                    GrantControls           = ($policy.grantControls.builtInControls -join '; ')
                    GrantControlsOperator   = $policy.grantControls.operator
                    CustomAuthFactors       = ($policy.grantControls.customAuthenticationFactors -join '; ')
                    TermsOfUse              = ($policy.grantControls.termsOfUse -join '; ')
                    SessionControls         = ($policy.sessionControls | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                    ClientAppTypes          = ($policy.conditions.clientAppTypes -join '; ')
                    DeviceStates            = ($policy.conditions.deviceStates -join '; ')
                    _DataType               = 'ConditionalAccessPolicies'
                    SessionId               = $SessionId
                }
                $null = $allDiscoveredData.Add($policyData)
            }
            
            $Result.Metadata["ConditionalAccessPolicyCount"] = $caPolicies.Count
            Write-ModuleLog -ModuleName "AzureDiscovery" -Message "CA Policy Discovery - Discovered $($caPolicies.Count) policies" -Level "SUCCESS"
            
        } catch {
            $Result.AddError("Failed to discover Conditional Access policies: $($_.Exception.Message)", $_.Exception, @{Section="ConditionalAccess"})
        }
        #endregion
        
        #region Administrative Units Discovery - CRITICAL FOR DELEGATED ADMIN MODEL
        Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering Administrative Units..." -Level "INFO"
        
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
                    _DataType               = 'AdministrativeUnits'
                    SessionId               = $SessionId
                }
                $null = $allDiscoveredData.Add($auData)
            }
            
            $Result.Metadata["AdministrativeUnitCount"] = $adminUnits.Count
            Write-ModuleLog -ModuleName "AzureDiscovery" -Message "AU Discovery - Discovered $($adminUnits.Count) units" -Level "SUCCESS"
            
        } catch {
            $Result.AddError("Failed to discover Administrative Units: $($_.Exception.Message)", $_.Exception, @{Section="AdministrativeUnits"})
        }
        #endregion
        
        #region Azure Tenant Information Discovery via Graph API
        Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering Azure Tenant Information..." -Level "INFO"
        
        try {
            $organization = @()
            $orgUri = "https://graph.microsoft.com/v1.0/organization?`$select=id,displayName,createdDateTime,country,countryLetterCode,city,state,street,postalCode,businessPhones,technicalNotificationMails,marketingNotificationEmails,privacyProfile,verifiedDomains"
            
            $response = Invoke-MgGraphRequest -Uri $orgUri -Method GET
            $organization = $response.value
            
            foreach ($org in $organization) {
                $orgData = [PSCustomObject]@{
                    ObjectType = "AzureTenant"
                    Id = $org.id
                    DisplayName = $org.displayName
                    CreatedDateTime = $org.createdDateTime
                    Country = $org.country
                    CountryLetterCode = $org.countryLetterCode
                    City = $org.city
                    State = $org.state
                    Street = $org.street
                    PostalCode = $org.postalCode
                    BusinessPhones = ($org.businessPhones -join '; ')
                    TechnicalNotificationMails = ($org.technicalNotificationMails -join '; ')
                    MarketingNotificationEmails = ($org.marketingNotificationEmails -join '; ')
                    VerifiedDomains = ($org.verifiedDomains | ForEach-Object { "$($_.name):$($_.isDefault)" }) -join '; '
                    _DataType = 'Tenant'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($orgData)
            }
            
            $Result.Metadata["TenantCount"] = $organization.Count
            Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Tenant Discovery - Discovered $($organization.Count) tenant information" -Level "SUCCESS"
            
        } catch {
            $Result.AddError("Failed to discover tenant information: $($_.Exception.Message)", $_.Exception, @{Section="Tenant"})
        }
        #endregion
        
        #region Azure Subscriptions Discovery via Graph API (Beta)
        Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering Azure Subscriptions via Graph API..." -Level "INFO"
        
        try {
            $subscriptions = @()
            # Note: This requires specific permissions and might not work for all tenants
            $subUri = "https://graph.microsoft.com/beta/directory/subscriptions?`$select=id,skuId,skuPartNumber,consumedUnits,prepaidUnits"
            
            try {
                $response = Invoke-MgGraphRequest -Uri $subUri -Method GET
                $subscriptions = $response.value
                
                foreach ($sub in $subscriptions) {
                    $subData = [PSCustomObject]@{
                        ObjectType = "AzureSubscription"
                        Id = $sub.id
                        SkuId = $sub.skuId
                        SkuPartNumber = $sub.skuPartNumber
                        ConsumedUnits = $sub.consumedUnits
                        PrepaidUnits = $sub.prepaidUnits.enabled
                        _DataType = 'Subscriptions'
                        SessionId = $SessionId
                    }
                    $null = $allDiscoveredData.Add($subData)
                }
                
                $Result.Metadata["SubscriptionCount"] = $subscriptions.Count
                Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Subscription Discovery - Discovered $($subscriptions.Count) subscriptions" -Level "SUCCESS"
            } catch {
                Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Subscription discovery via Graph API not available (requires specific permissions)" -Level "WARN"
            }
            
        } catch {
            $Result.AddWarning("Failed to discover subscriptions via Graph API: $($_.Exception.Message)", @{Section="Subscriptions"})
        }
        #endregion
        
        #region Azure Subscriptions Discovery via Graph API Beta
        Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering Azure Subscriptions via Graph API Beta..." -Level "INFO"
        
        try {
            $azureSubscriptions = @()
            # Use Graph API beta to discover Azure subscriptions
            $subUri = "https://graph.microsoft.com/beta/solutions/cloudPc/subscriptions"
            
            try {
                $response = Invoke-MgGraphRequest -Uri $subUri -Method GET
                if ($response.value) {
                    $azureSubscriptions = $response.value
                    
                    foreach ($sub in $azureSubscriptions) {
                        $subData = [PSCustomObject]@{
                            ObjectType = "AzureSubscriptionBeta"
                            Id = $sub.id
                            DisplayName = $sub.displayName
                            State = $sub.state
                            SubscriptionId = $sub.subscriptionId
                            _DataType = 'AzureSubscriptions'
                            SessionId = $SessionId
                        }
                        $null = $allDiscoveredData.Add($subData)
                    }
                    
                    Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Azure Subscription Discovery - Discovered $($azureSubscriptions.Count) subscriptions via Graph Beta" -Level "SUCCESS"
                }
            } catch {
                Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Azure subscription discovery via Graph Beta not available: $($_.Exception.Message)" -Level "WARN"
            }
            
        } catch {
            $Result.AddWarning("Failed to discover Azure subscriptions via Graph Beta: $($_.Exception.Message)", @{Section="AzureSubscriptions"})
        }
        #endregion
        
        #region Azure Resources Discovery via Graph API Beta
        Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering Azure Resources via Graph API Beta..." -Level "INFO"
        
        try {
            # Try to discover Azure resources via Graph API beta endpoints
            $resourceTypes = @(
                @{Name = "Virtual Machines"; Endpoint = "solutions/virtualMachines"; Type = "AzureVM"}
                @{Name = "Storage Accounts"; Endpoint = "solutions/storageAccounts"; Type = "AzureStorage"}
                @{Name = "Key Vaults"; Endpoint = "solutions/keyVaults"; Type = "AzureKeyVault"}
                @{Name = "Network Interfaces"; Endpoint = "solutions/networkInterfaces"; Type = "AzureNetworkInterface"}
                @{Name = "Public IP Addresses"; Endpoint = "solutions/publicIpAddresses"; Type = "AzurePublicIP"}
                @{Name = "Virtual Networks"; Endpoint = "solutions/virtualNetworks"; Type = "AzureVirtualNetwork"}
            )
            
            foreach ($resourceType in $resourceTypes) {
                try {
                    Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Attempting to discover $($resourceType.Name)..." -Level "DEBUG"
                    $resourceUri = "https://graph.microsoft.com/beta/$($resourceType.Endpoint)"
                    
                    $response = Invoke-MgGraphRequest -Uri $resourceUri -Method GET -ErrorAction SilentlyContinue
                    if ($response.value -and $response.value.Count -gt 0) {
                        foreach ($resource in $response.value) {
                            $resourceData = [PSCustomObject]@{
                                ObjectType = $resourceType.Type
                                Id = $resource.id
                                Name = $resource.name
                                DisplayName = $resource.displayName
                                Location = $resource.location
                                ResourceGroup = $resource.resourceGroup
                                SubscriptionId = $resource.subscriptionId
                                Properties = ($resource.properties | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                _DataType = $resourceType.Name.Replace(' ', '')
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($resourceData)
                        }
                        Write-ModuleLog -ModuleName "AzureDiscovery" -Message "$($resourceType.Name) Discovery - Discovered $($response.value.Count) resources" -Level "SUCCESS"
                    }
                } catch {
                    Write-ModuleLog -ModuleName "AzureDiscovery" -Message "$($resourceType.Name) discovery not available via Graph Beta" -Level "DEBUG"
                }
            }
            
        } catch {
            Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Azure resource discovery via Graph Beta not fully available" -Level "INFO"
        }
        #endregion
        
        #region Azure Resource Groups Discovery via Graph API Beta
        Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering Azure Resource Groups..." -Level "INFO"
        
        try {
            $resourceGroups = @()
            $rgUri = "https://graph.microsoft.com/beta/solutions/resourceGroups"
            
            try {
                $response = Invoke-MgGraphRequest -Uri $rgUri -Method GET
                if ($response.value) {
                    $resourceGroups = $response.value
                    
                    foreach ($rg in $resourceGroups) {
                        $rgData = [PSCustomObject]@{
                            ObjectType = "AzureResourceGroup"
                            Id = $rg.id
                            Name = $rg.name
                            Location = $rg.location
                            SubscriptionId = $rg.subscriptionId
                            Properties = ($rg.properties | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                            Tags = ($rg.tags | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                            _DataType = 'ResourceGroups'
                            SessionId = $SessionId
                        }
                        $null = $allDiscoveredData.Add($rgData)
                    }
                    
                    Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Resource Group Discovery - Discovered $($resourceGroups.Count) resource groups" -Level "SUCCESS"
                }
            } catch {
                Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Resource group discovery via Graph Beta not available" -Level "WARN"
            }
            
        } catch {
            $Result.AddWarning("Failed to discover resource groups via Graph Beta: $($_.Exception.Message)", @{Section="ResourceGroups"})
        }
        #endregion
        
        #region Microsoft 365 Workloads Discovery via Graph API
        Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering Microsoft 365 Workloads..." -Level "INFO"
        
        try {
            # Exchange Online
            try {
                $mailboxes = @()
                $mailboxUri = "https://graph.microsoft.com/v1.0/users?`$select=id,mail,mailboxSettings&`$filter=mail ne null"
                $response = Invoke-MgGraphRequest -Uri $mailboxUri -Method GET
                $mailboxes = $response.value
                
                foreach ($mailbox in $mailboxes) {
                    $mailboxData = [PSCustomObject]@{
                        ObjectType = "ExchangeMailbox"
                        UserId = $mailbox.id
                        EmailAddress = $mailbox.mail
                        AutomaticRepliesSetting = $mailbox.mailboxSettings.automaticRepliesSetting.status
                        Language = $mailbox.mailboxSettings.language.locale
                        TimeZone = $mailbox.mailboxSettings.timeZone
                        _DataType = 'ExchangeMailboxes'
                        SessionId = $SessionId
                    }
                    $null = $allDiscoveredData.Add($mailboxData)
                }
                
                Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Exchange Mailbox Discovery - Discovered $($mailboxes.Count) mailboxes" -Level "SUCCESS"
            } catch {
                Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Exchange mailbox discovery not available" -Level "DEBUG"
            }
            
            # SharePoint Sites
            try {
                $sites = @()
                $sitesUri = "https://graph.microsoft.com/v1.0/sites?`$select=id,name,displayName,webUrl,createdDateTime,lastModifiedDateTime"
                $response = Invoke-MgGraphRequest -Uri $sitesUri -Method GET
                $sites = $response.value
                
                foreach ($site in $sites) {
                    $siteData = [PSCustomObject]@{
                        ObjectType = "SharePointSite"
                        Id = $site.id
                        Name = $site.name
                        DisplayName = $site.displayName
                        WebUrl = $site.webUrl
                        CreatedDateTime = $site.createdDateTime
                        LastModifiedDateTime = $site.lastModifiedDateTime
                        _DataType = 'SharePointSites'
                        SessionId = $SessionId
                    }
                    $null = $allDiscoveredData.Add($siteData)
                }
                
                Write-ModuleLog -ModuleName "AzureDiscovery" -Message "SharePoint Sites Discovery - Discovered $($sites.Count) sites" -Level "SUCCESS"
            } catch {
                Write-ModuleLog -ModuleName "AzureDiscovery" -Message "SharePoint sites discovery not available" -Level "DEBUG"
            }
            
            # Teams
            try {
                $teams = @()
                $teamsUri = "https://graph.microsoft.com/v1.0/groups?`$filter=resourceProvisioningOptions/Any(x:x eq 'Team')&`$select=id,displayName,description,createdDateTime,visibility"
                $response = Invoke-MgGraphRequest -Uri $teamsUri -Method GET
                $teams = $response.value
                
                foreach ($team in $teams) {
                    $teamData = [PSCustomObject]@{
                        ObjectType = "MicrosoftTeam"
                        Id = $team.id
                        DisplayName = $team.displayName
                        Description = $team.description
                        CreatedDateTime = $team.createdDateTime
                        Visibility = $team.visibility
                        _DataType = 'MicrosoftTeams'
                        SessionId = $SessionId
                    }
                    $null = $allDiscoveredData.Add($teamData)
                }
                
                Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Microsoft Teams Discovery - Discovered $($teams.Count) teams" -Level "SUCCESS"
            } catch {
                Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Microsoft Teams discovery not available" -Level "DEBUG"
            }
            
        } catch {
            $Result.AddWarning("Failed to discover Microsoft 365 workloads: $($_.Exception.Message)", @{Section="M365Workloads"})
        }
        #endregion
        
        #region Intune/Endpoint Manager Policies Discovery - CRITICAL FOR DEVICE SECURITY
        Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering Intune Policies..." -Level "INFO"
        
        try {
            # Device Compliance Policies
            try {
                $compliancePolicies = @()
                $complianceUri = "https://graph.microsoft.com/v1.0/deviceManagement/deviceCompliancePolicies"
                
                do {
                    $response = Invoke-MgGraphRequest -Uri $complianceUri -Method GET
                    $compliancePolicies += $response.value
                    $complianceUri = $response.'@odata.nextLink'
                } while ($complianceUri)
                
                foreach ($policy in $compliancePolicies) {
                    # Get assignments for this policy
                    $assignments = @()
                    try {
                        $assignUri = "https://graph.microsoft.com/v1.0/deviceManagement/deviceCompliancePolicies/$($policy.id)/assignments"
                        $assignResponse = Invoke-MgGraphRequest -Uri $assignUri -Method GET
                        $assignments = $assignResponse.value
                    } catch {}
                    
                    $policyData = [PSCustomObject]@{
                        ObjectType              = "IntuneCompliancePolicy"
                        Id                      = $policy.id
                        DisplayName             = $policy.displayName
                        Description             = $policy.description
                        Platform                = $policy.'@odata.type' -replace '#microsoft.graph.', ''
                        CreatedDateTime         = $policy.createdDateTime
                        LastModifiedDateTime    = $policy.lastModifiedDateTime
                        Version                 = $policy.version
                        AssignmentCount         = $assignments.Count
                        Assignments             = ($assignments | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                        Settings                = ($policy | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                        _DataType               = 'IntuneCompliancePolicies'
                        SessionId               = $SessionId
                    }
                    $null = $allDiscoveredData.Add($policyData)
                }
                
                Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Intune Compliance Policy Discovery - Discovered $($compliancePolicies.Count) policies" -Level "SUCCESS"
            } catch {
                Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Intune compliance policies discovery not available" -Level "DEBUG"
            }
            
            # Device Configuration Policies
            try {
                $configPolicies = @()
                $configUri = "https://graph.microsoft.com/v1.0/deviceManagement/deviceConfigurations"
                
                do {
                    $response = Invoke-MgGraphRequest -Uri $configUri -Method GET
                    $configPolicies += $response.value
                    $configUri = $response.'@odata.nextLink'
                } while ($configUri)
                
                foreach ($policy in $configPolicies) {
                    # Get assignments for this policy
                    $assignments = @()
                    try {
                        $assignUri = "https://graph.microsoft.com/v1.0/deviceManagement/deviceConfigurations/$($policy.id)/assignments"
                        $assignResponse = Invoke-MgGraphRequest -Uri $assignUri -Method GET
                        $assignments = $assignResponse.value
                    } catch {}
                    
                    $policyData = [PSCustomObject]@{
                        ObjectType              = "IntuneConfigurationPolicy"
                        Id                      = $policy.id
                        DisplayName             = $policy.displayName
                        Description             = $policy.description
                        Platform                = $policy.'@odata.type' -replace '#microsoft.graph.', ''
                        CreatedDateTime         = $policy.createdDateTime
                        LastModifiedDateTime    = $policy.lastModifiedDateTime
                        Version                 = $policy.version
                        AssignmentCount         = $assignments.Count
                        Assignments             = ($assignments | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                        Settings                = ($policy | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                        _DataType               = 'IntuneConfigurationPolicies'
                        SessionId               = $SessionId
                    }
                    $null = $allDiscoveredData.Add($policyData)
                }
                
                Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Intune Configuration Policy Discovery - Discovered $($configPolicies.Count) policies" -Level "SUCCESS"
            } catch {
                Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Intune configuration policies discovery not available" -Level "DEBUG"
            }
            
            # App Protection Policies
            try {
                $appProtectionPolicies = @()
                
                # iOS App Protection Policies
                $iosUri = "https://graph.microsoft.com/v1.0/deviceAppManagement/iosManagedAppProtections"
                $iosResponse = Invoke-MgGraphRequest -Uri $iosUri -Method GET
                $appProtectionPolicies += $iosResponse.value | ForEach-Object { $_ | Add-Member -NotePropertyName Platform -NotePropertyValue "iOS" -PassThru }
                
                # Android App Protection Policies
                $androidUri = "https://graph.microsoft.com/v1.0/deviceAppManagement/androidManagedAppProtections"
                $androidResponse = Invoke-MgGraphRequest -Uri $androidUri -Method GET
                $appProtectionPolicies += $androidResponse.value | ForEach-Object { $_ | Add-Member -NotePropertyName Platform -NotePropertyValue "Android" -PassThru }
                
                foreach ($policy in $appProtectionPolicies) {
                    $policyData = [PSCustomObject]@{
                        ObjectType              = "IntuneAppProtectionPolicy"
                        Id                      = $policy.id
                        DisplayName             = $policy.displayName
                        Description             = $policy.description
                        Platform                = $policy.Platform
                        CreatedDateTime         = $policy.createdDateTime
                        LastModifiedDateTime    = $policy.lastModifiedDateTime
                        Version                 = $policy.version
                        Settings                = ($policy | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                        _DataType               = 'IntuneAppProtectionPolicies'
                        SessionId               = $SessionId
                    }
                    $null = $allDiscoveredData.Add($policyData)
                }
                
                Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Intune App Protection Policy Discovery - Discovered $($appProtectionPolicies.Count) policies" -Level "SUCCESS"
            } catch {
                Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Intune app protection policies discovery not available" -Level "DEBUG"
            }
            
        } catch {
            $Result.AddWarning("Failed to discover Intune policies: $($_.Exception.Message)", @{Section="IntunePolicies"})
        }
        #endregion
        
        #region Legacy Azure Subscription Discovery (if Azure PowerShell works)
        if ($azureConnection) {
            Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering Azure Subscriptions - Enumerating subscriptions..." -Level "INFO"
            
            try {
                $subscriptions = Get-AzSubscription
                
                foreach ($sub in $subscriptions) {
                    Set-AzContext -SubscriptionId $sub.Id | Out-Null
                    
                    $subData = [PSCustomObject]@{
                        ObjectType = "AzureSubscription"
                        SubscriptionId = $sub.Id
                        SubscriptionName = $sub.Name
                        State = $sub.State
                        TenantId = $sub.TenantId
                        _DataType = 'Subscriptions'
                        SessionId = $SessionId
                    }
                    $null = $allDiscoveredData.Add($subData)
                    
                    #region Virtual Machines
                    Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering Virtual Machines - Processing subscription: $($sub.Name)" -Level "INFO"
                    
                    try {
                        $vms = Get-AzVM -Status
                        
                        foreach ($vm in $vms) {
                            # Get VM network interfaces
                            $nicDetails = @()
                            foreach ($nicRef in $vm.NetworkProfile.NetworkInterfaces) {
                                $nic = Get-AzNetworkInterface -ResourceId $nicRef.Id
                                $nicDetails += @{
                                    Name = $nic.Name
                                    PrivateIpAddress = $nic.IpConfigurations[0].PrivateIpAddress
                                    PublicIpAddress = if ($nic.IpConfigurations[0].PublicIpAddress) {
                                        (Get-AzPublicIpAddress -ResourceId $nic.IpConfigurations[0].PublicIpAddress.Id).IpAddress
                                    } else { $null }
                                }
                            }
                            
                            $vmData = [PSCustomObject]@{
                                ObjectType = "AzureVM"
                                SubscriptionId = $sub.Id
                                ResourceGroup = $vm.ResourceGroupName
                                VMName = $vm.Name
                                Location = $vm.Location
                                VMSize = $vm.HardwareProfile.VmSize
                                OSType = $vm.StorageProfile.OsDisk.OsType
                                OSPublisher = $vm.StorageProfile.ImageReference.Publisher
                                OSOffer = $vm.StorageProfile.ImageReference.Offer
                                OSSku = $vm.StorageProfile.ImageReference.Sku
                                OSVersion = $vm.StorageProfile.ImageReference.Version
                                ProvisioningState = $vm.ProvisioningState
                                PowerState = ($vm.PowerState -split '/')[-1]
                                LicenseType = $vm.LicenseType
                                AvailabilitySetId = $vm.AvailabilitySetReference.Id
                                VmId = $vm.VmId
                                NetworkInterfaces = ($nicDetails | ConvertTo-Json -Compress)
                                DataDiskCount = $vm.StorageProfile.DataDisks.Count
                                Tags = ($vm.Tags | ConvertTo-Json -Compress)
                                _DataType = 'VirtualMachines'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($vmData)
                        }
                        
                        $Result.Metadata["VM_$($sub.Name)"] = $vms.Count
                        
                    } catch {
                        $Result.AddWarning("Failed to discover VMs in subscription $($sub.Name): $($_.Exception.Message)", @{Subscription=$sub.Name})
                    }
                    #endregion
                    
                    #region Network Security Groups
                    Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering Network Security Groups - Processing subscription: $($sub.Name)" -Level "INFO"
                    
                    try {
                        $nsgs = Get-AzNetworkSecurityGroup
                        
                        foreach ($nsg in $nsgs) {
                            # Extract security rules
                            $inboundRules = @()
                            $outboundRules = @()
                            
                            foreach ($rule in $nsg.SecurityRules) {
                                $ruleData = @{
                                    Name = $rule.Name
                                    Priority = $rule.Priority
                                    Direction = $rule.Direction
                                    Access = $rule.Access
                                    Protocol = $rule.Protocol
                                    SourcePortRange = ($rule.SourcePortRange -join ',')
                                    DestinationPortRange = ($rule.DestinationPortRange -join ',')
                                    SourceAddressPrefix = ($rule.SourceAddressPrefix -join ',')
                                    DestinationAddressPrefix = ($rule.DestinationAddressPrefix -join ',')
                                }
                                
                                if ($rule.Direction -eq 'Inbound') {
                                    $inboundRules += $ruleData
                                } else {
                                    $outboundRules += $ruleData
                                }
                            }
                            
                            $nsgData = [PSCustomObject]@{
                                ObjectType = "AzureNSG"
                                SubscriptionId = $sub.Id
                                ResourceGroup = $nsg.ResourceGroupName
                                NSGName = $nsg.Name
                                Location = $nsg.Location
                                ProvisioningState = $nsg.ProvisioningState
                                InboundRuleCount = $inboundRules.Count
                                OutboundRuleCount = $outboundRules.Count
                                InboundRules = ($inboundRules | ConvertTo-Json -Compress)
                                OutboundRules = ($outboundRules | ConvertTo-Json -Compress)
                                NetworkInterfaceCount = $nsg.NetworkInterfaces.Count
                                SubnetCount = $nsg.Subnets.Count
                                Tags = ($nsg.Tags | ConvertTo-Json -Compress)
                                _DataType = 'NetworkSecurityGroups'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($nsgData)
                        }
                        
                        $Result.Metadata["NSG_$($sub.Name)"] = $nsgs.Count
                        
                    } catch {
                        $Result.AddWarning("Failed to discover NSGs in subscription $($sub.Name): $($_.Exception.Message)", @{Subscription=$sub.Name})
                    }
                    #endregion
                    
                    #region Load Balancers
                    Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering Load Balancers - Processing subscription: $($sub.Name)" -Level "INFO"
                    
                    try {
                        $loadBalancers = Get-AzLoadBalancer
                        
                        foreach ($lb in $loadBalancers) {
                            $lbData = [PSCustomObject]@{
                                ObjectType = "AzureLoadBalancer"
                                SubscriptionId = $sub.Id
                                ResourceGroup = $lb.ResourceGroupName
                                LoadBalancerName = $lb.Name
                                Location = $lb.Location
                                Sku = $lb.Sku.Name
                                Type = if ($lb.FrontendIpConfigurations[0].PublicIpAddress) { "Public" } else { "Internal" }
                                ProvisioningState = $lb.ProvisioningState
                                FrontendIPCount = $lb.FrontendIpConfigurations.Count
                                BackendPoolCount = $lb.BackendAddressPools.Count
                                LoadBalancingRuleCount = $lb.LoadBalancingRules.Count
                                ProbeCount = $lb.Probes.Count
                                InboundNatRuleCount = $lb.InboundNatRules.Count
                                OutboundRuleCount = $lb.OutboundRules.Count
                                Tags = ($lb.Tags | ConvertTo-Json -Compress)
                                _DataType = 'LoadBalancers'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($lbData)
                        }
                        
                        $Result.Metadata["LB_$($sub.Name)"] = $loadBalancers.Count
                        
                    } catch {
                        $Result.AddWarning("Failed to discover Load Balancers in subscription $($sub.Name): $($_.Exception.Message)", @{Subscription=$sub.Name})
                    }
                    #endregion
                    
                    #region Storage Accounts
                    Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering Storage Accounts - Processing subscription: $($sub.Name)" -Level "INFO"
                    
                    try {
                        $storageAccounts = Get-AzStorageAccount
                        
                        foreach ($sa in $storageAccounts) {
                            # Get storage account keys and access policies
                            $keys = Get-AzStorageAccountKey -ResourceGroupName $sa.ResourceGroupName -Name $sa.StorageAccountName
                            
                            $saData = [PSCustomObject]@{
                                ObjectType = "AzureStorageAccount"
                                SubscriptionId = $sub.Id
                                ResourceGroup = $sa.ResourceGroupName
                                StorageAccountName = $sa.StorageAccountName
                                Location = $sa.Location
                                SkuName = $sa.Sku.Name
                                Kind = $sa.Kind
                                AccessTier = $sa.AccessTier
                                CreationTime = $sa.CreationTime
                                ProvisioningState = $sa.ProvisioningState
                                StatusPrimary = $sa.StatusOfPrimary
                                StatusSecondary = $sa.StatusOfSecondary
                                EnableHttpsTrafficOnly = $sa.EnableHttpsTrafficOnly
                                MinimumTlsVersion = $sa.MinimumTlsVersion
                                AllowBlobPublicAccess = $sa.AllowBlobPublicAccess
                                NetworkRuleSet = ($sa.NetworkRuleSet | ConvertTo-Json -Compress)
                                BlobServiceEnabled = $sa.PrimaryEndpoints.Blob -ne $null
                                FileServiceEnabled = $sa.PrimaryEndpoints.File -ne $null
                                QueueServiceEnabled = $sa.PrimaryEndpoints.Queue -ne $null
                                TableServiceEnabled = $sa.PrimaryEndpoints.Table -ne $null
                                Tags = ($sa.Tags | ConvertTo-Json -Compress)
                                _DataType = 'StorageAccounts'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($saData)
                        }
                        
                        $Result.Metadata["Storage_$($sub.Name)"] = $storageAccounts.Count
                        
                    } catch {
                        $Result.AddWarning("Failed to discover Storage Accounts in subscription $($sub.Name): $($_.Exception.Message)", @{Subscription=$sub.Name})
                    }
                    #endregion
                    
                    #region Key Vaults
                    Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering Key Vaults - Processing subscription: $($sub.Name)" -Level "INFO"
                    
                    try {
                        $keyVaults = Get-AzKeyVault
                        
                        foreach ($kv in $keyVaults) {
                            # Get detailed key vault info
                            $kvDetail = Get-AzKeyVault -VaultName $kv.VaultName -ResourceGroupName $kv.ResourceGroupName
                            
                            # Get access policies
                            $accessPolicies = @()
                            foreach ($policy in $kvDetail.AccessPolicies) {
                                $accessPolicies += @{
                                    TenantId = $policy.TenantId
                                    ObjectId = $policy.ObjectId
                                    ApplicationId = $policy.ApplicationId
                                    PermissionsToKeys = ($policy.PermissionsToKeys -join ',')
                                    PermissionsToSecrets = ($policy.PermissionsToSecrets -join ',')
                                    PermissionsToCertificates = ($policy.PermissionsToCertificates -join ',')
                                }
                            }
                            
                            $kvData = [PSCustomObject]@{
                                ObjectType = "AzureKeyVault"
                                SubscriptionId = $sub.Id
                                ResourceGroup = $kv.ResourceGroupName
                                VaultName = $kv.VaultName
                                Location = $kv.Location
                                VaultUri = $kvDetail.VaultUri
                                TenantId = $kvDetail.TenantId
                                Sku = $kvDetail.Sku
                                EnabledForDeployment = $kvDetail.EnabledForDeployment
                                EnabledForDiskEncryption = $kvDetail.EnabledForDiskEncryption
                                EnabledForTemplateDeployment = $kvDetail.EnabledForTemplateDeployment
                                EnableSoftDelete = $kvDetail.EnableSoftDelete
                                SoftDeleteRetentionInDays = $kvDetail.SoftDeleteRetentionInDays
                                EnableRbacAuthorization = $kvDetail.EnableRbacAuthorization
                                EnablePurgeProtection = $kvDetail.EnablePurgeProtection
                                AccessPolicyCount = $accessPolicies.Count
                                AccessPolicies = ($accessPolicies | ConvertTo-Json -Compress)
                                NetworkRuleSet = ($kvDetail.NetworkAcls | ConvertTo-Json -Compress)
                                Tags = ($kv.Tags | ConvertTo-Json -Compress)
                                _DataType = 'KeyVaults'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($kvData)
                        }
                        
                        $Result.Metadata["KeyVault_$($sub.Name)"] = $keyVaults.Count
                        
                    } catch {
                        $Result.AddWarning("Failed to discover Key Vaults in subscription $($sub.Name): $($_.Exception.Message)", @{Subscription=$sub.Name})
                    }
                    #endregion
                    
                    #region Azure Database for MySQL Flexible Servers
                    Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering MySQL Flexible Servers - Processing subscription: $($sub.Name)" -Level "INFO"
                    
                    try {
                        # Get MySQL flexible servers
                        $mySqlServers = Get-AzResource -ResourceType "Microsoft.DBforMySQL/flexibleServers" -ExpandProperties
                        
                        foreach ($mysql in $mySqlServers) {
                            $mysqlData = [PSCustomObject]@{
                                ObjectType = "AzureMySQLFlexible"
                                SubscriptionId = $sub.Id
                                ResourceGroup = $mysql.ResourceGroupName
                                ServerName = $mysql.Name
                                Location = $mysql.Location
                                Version = $mysql.Properties.version
                                State = $mysql.Properties.state
                                SkuName = $mysql.Properties.sku.name
                                SkuTier = $mysql.Properties.sku.tier
                                StorageSizeGB = $mysql.Properties.storage.storageSizeGB
                                BackupRetentionDays = $mysql.Properties.backup.backupRetentionDays
                                GeoRedundantBackup = $mysql.Properties.backup.geoRedundantBackup
                                HighAvailabilityMode = $mysql.Properties.highAvailability.mode
                                HighAvailabilityState = $mysql.Properties.highAvailability.state
                                PublicNetworkAccess = $mysql.Properties.publicNetworkAccess
                                SslEnforcement = $mysql.Properties.sslEnforcement
                                MinimalTlsVersion = $mysql.Properties.minimalTlsVersion
                                AdministratorLogin = $mysql.Properties.administratorLogin
                                FullyQualifiedDomainName = $mysql.Properties.fullyQualifiedDomainName
                                Tags = ($mysql.Tags | ConvertTo-Json -Compress)
                                _DataType = 'MySQLFlexibleServers'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($mysqlData)
                        }
                        
                        $Result.Metadata["MySQL_$($sub.Name)"] = $mySqlServers.Count
                        
                    } catch {
                        $Result.AddWarning("Failed to discover MySQL Flexible Servers in subscription $($sub.Name): $($_.Exception.Message)", @{Subscription=$sub.Name})
                    }
                    #endregion
                    
                    #region RBAC Role Assignments
                    Write-ModuleLog -ModuleName "AzureDiscovery" -Message "Discovering RBAC Assignments - Processing subscription: $($sub.Name)" -Level "INFO"
                    
                    try {
                        $roleAssignments = Get-AzRoleAssignment
                        
                        foreach ($ra in $roleAssignments) {
                            $raData = [PSCustomObject]@{
                                ObjectType = "AzureRBACAssignment"
                                SubscriptionId = $sub.Id
                                RoleAssignmentId = $ra.RoleAssignmentId
                                Scope = $ra.Scope
                                DisplayName = $ra.DisplayName
                                SignInName = $ra.SignInName
                                RoleDefinitionName = $ra.RoleDefinitionName
                                RoleDefinitionId = $ra.RoleDefinitionId
                                ObjectId = $ra.ObjectId
                                PrincipalType = $ra.ObjectType
                                CanDelegate = $ra.CanDelegate
                                Description = $ra.Description
                                ConditionVersion = $ra.ConditionVersion
                                Condition = $ra.Condition
                                _DataType = 'RBACAssignments'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($raData)
                        }
                        
                        $Result.Metadata["RBAC_$($sub.Name)"] = $roleAssignments.Count
                        
                    } catch {
                        $Result.AddWarning("Failed to discover RBAC assignments in subscription $($sub.Name): $($_.Exception.Message)", @{Subscription=$sub.Name})
                    }
                    #endregion
                }
                
            } catch {
                $Result.AddError("Failed to enumerate Azure subscriptions: $($_.Exception.Message)", $_.Exception, @{Section="Subscriptions"})
            }
        }
        #endregion
        
        # Store all discovered data
        $Result.RecordCount = $allDiscoveredData.Count
        
        # Return data grouped by type
        return $allDiscoveredData | Group-Object -Property _DataType
    }

    # Execute discovery using the base module
    Start-DiscoveryModule `
        -ModuleName "AzureDiscovery" `
        -DiscoveryScript $discoveryScript `
        -Configuration $Configuration `
        -Context $Context `
        -SessionId $SessionId `
        -RequiredServices @("Graph")
}

# Export the module function
Export-ModuleMember -Function Invoke-AzureDiscovery