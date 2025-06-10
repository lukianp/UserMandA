# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

#================================================================================
# M&A Discovery Module: Graph
# Description: Discovers Azure AD users, groups, devices, applications, and directory data.
#================================================================================

function Get-AuthInfoFromConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    # Add this for debugging:
    Write-MandALog -Message "AuthCheck: Received config keys: $($Configuration.Keys -join ', ')" -Level "DEBUG" -Component "GraphDiscovery"

    # Check all possible locations for auth info
    if ($Configuration._AuthContext) { return $Configuration._AuthContext }
    if ($Configuration._Credentials) { return $Configuration._Credentials }
    if ($Configuration.authentication) {
        if ($Configuration.authentication._Credentials) { 
            return $Configuration.authentication._Credentials 
        }
        if ($Configuration.authentication.ClientId -and 
            $Configuration.authentication.ClientSecret -and 
            $Configuration.authentication.TenantId) {
            return @{
                ClientId     = $Configuration.authentication.ClientId
                ClientSecret = $Configuration.authentication.ClientSecret
                TenantId     = $Configuration.authentication.TenantId
            }
        }
    }
    if ($Configuration.ClientId -and $Configuration.ClientSecret -and $Configuration.TenantId) {
        return @{
            ClientId     = $Configuration.ClientId
            ClientSecret = $Configuration.ClientSecret
            TenantId     = $Configuration.TenantId
        }
    }
    return $null
}

function Write-GraphLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    Write-MandALog -Message "[Graph] $Message" -Level $Level -Component "GraphDiscovery" -Context $Context
}

# --- Main Discovery Function ---

function Invoke-GraphDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )

    Write-GraphLog -Level "HEADER" -Message "Starting Discovery" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # 1. INITIALIZE RESULT OBJECT
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('Graph')
    } else {
        # Fallback to hashtable
        $result = @{
            Success      = $true; ModuleName = 'Graph'; RecordCount = 0;
            Errors       = [System.Collections.ArrayList]::new(); 
            Warnings     = [System.Collections.ArrayList]::new(); 
            Metadata     = @{};
            StartTime    = Get-Date; EndTime = $null; 
            ExecutionId  = [guid]::NewGuid().ToString();
            AddError     = { param($m, $e, $c) $this.Errors.Add(@{Message=$m; Exception=$e; Context=$c}); $this.Success = $false }.GetNewClosure()
            AddWarning   = { param($m, $c) $this.Warnings.Add(@{Message=$m; Context=$c}) }.GetNewClosure()
            Complete     = { $this.EndTime = Get-Date }.GetNewClosure()
        }
    }

    try {
        # 2. VALIDATE PREREQUISITES & CONTEXT
        Write-GraphLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-GraphLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
        Ensure-Path -Path $outputPath

        # 3. VALIDATE MODULE-SPECIFIC CONFIGURATION
        $pageSize = 999
        $includeSignInActivity = $false
        $includeManager = $true
        $includeDevices = $true
        $includeApplications = $true
        $includeServicePrincipals = $true
        $includeDirectoryRoles = $true
        $includeAdministrativeUnits = $false
        
        if ($Configuration.discovery -and $Configuration.discovery.graph) {
            $graphConfig = $Configuration.discovery.graph
            if ($null -ne $graphConfig.includeSignInActivity) { $includeSignInActivity = $graphConfig.includeSignInActivity }
            if ($null -ne $graphConfig.includeManager) { $includeManager = $graphConfig.includeManager }
            if ($null -ne $graphConfig.includeDevices) { $includeDevices = $graphConfig.includeDevices }
            if ($null -ne $graphConfig.includeApplications) { $includeApplications = $graphConfig.includeApplications }
            if ($null -ne $graphConfig.includeServicePrincipals) { $includeServicePrincipals = $graphConfig.includeServicePrincipals }
            if ($null -ne $graphConfig.includeDirectoryRoles) { $includeDirectoryRoles = $graphConfig.includeDirectoryRoles }
            if ($null -ne $graphConfig.includeAdministrativeUnits) { $includeAdministrativeUnits = $graphConfig.includeAdministrativeUnits }
        }

        # 4. AUTHENTICATE & CONNECT
        Write-GraphLog -Level "INFO" -Message "Extracting authentication information..." -Context $Context
        $authInfo = Get-AuthInfoFromConfiguration -Configuration $Configuration
        
        # Reconstruct auth from thread-safe config
        if (-not $authInfo -and $Configuration._AuthContext) {
            $authInfo = $Configuration._AuthContext
            Write-GraphLog -Level "DEBUG" -Message "Using injected auth context" -Context $Context
        }
        
        if (-not $authInfo) {
            Write-GraphLog -Level "ERROR" -Message "No authentication found in configuration" -Context $Context
            $result.AddError("Authentication information could not be found in the provided configuration.", $null, $null)
            return $result
        }
        
        Write-GraphLog -Level "DEBUG" -Message "Auth info found. ClientId: $($authInfo.ClientId.Substring(0,8))..." -Context $Context

        # Connect to Microsoft Graph
        try {
            Write-GraphLog -Level "INFO" -Message "Connecting to Microsoft Graph..." -Context $Context
            $secureSecret = ConvertTo-SecureString $authInfo.ClientSecret -AsPlainText -Force
            Connect-MgGraph -ClientId $authInfo.ClientId `
                            -TenantId $authInfo.TenantId `
                            -ClientSecretCredential $secureSecret `
                            -NoWelcome -ErrorAction Stop
            Write-GraphLog -Level "SUCCESS" -Message "Connected to Microsoft Graph" -Context $Context
        } catch {
            $result.AddError("Failed to connect to Microsoft Graph: $($_.Exception.Message)", $_.Exception, $null)
            return $result
        }

        # 5. PERFORM DISCOVERY
        Write-GraphLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Discover Organization Details
        try {
            Write-GraphLog -Level "INFO" -Message "Discovering organization details..." -Context $Context
            $org = Get-MgOrganization -ErrorAction Stop
            if ($org) {
                $orgData = [PSCustomObject]@{
                    TenantId = $org.Id
                    DisplayName = $org.DisplayName
                    VerifiedDomains = ($org.VerifiedDomains | Where-Object { $_.IsVerified } | ForEach-Object { $_.Name }) -join ';'
                    DefaultDomain = ($org.VerifiedDomains | Where-Object { $_.IsDefault } | Select-Object -First 1).Name
                    TechnicalNotificationMails = ($org.TechnicalNotificationMails -join ';')
                    PreferredLanguage = $org.PreferredLanguage
                    _DataType = 'Organization'
                }
                $null = $allDiscoveredData.Add($orgData)
                Write-GraphLog -Level "SUCCESS" -Message "Discovered organization: $($org.DisplayName)" -Context $Context
            }
        } catch {
            $result.AddWarning("Failed to discover organization details: $($_.Exception.Message)", @{Section="Organization"})
        }

        # Discover Users with enhanced details
        try {
            Write-GraphLog -Level "INFO" -Message "Discovering users..." -Context $Context
            
            # Build select fields
            $userSelectFields = @(
                'id', 'userPrincipalName', 'displayName', 'mail', 'mailNickname',
                'givenName', 'surname', 'jobTitle', 'department', 'companyName',
                'officeLocation', 'businessPhones', 'mobilePhone', 'preferredLanguage',
                'employeeId', 'employeeType', 'createdDateTime', 'accountEnabled',
                'assignedLicenses', 'assignedPlans', 'provisionedPlans',
                'onPremisesSyncEnabled', 'onPremisesImmutableId', 'onPremisesSamAccountName',
                'onPremisesDistinguishedName', 'onPremisesSecurityIdentifier',
                'proxyAddresses', 'userType', 'usageLocation', 'city', 'state',
                'country', 'postalCode', 'streetAddress'
            )
            
            if ($includeSignInActivity) {
                $userSelectFields += 'signInActivity'
            }
            
            # Expand manager if requested
            $expandFields = @()
            if ($includeManager) {
                $expandFields += 'manager'
            }
            
            $uri = "https://graph.microsoft.com/v1.0/users?`$select=$($userSelectFields -join ',')&`$top=$pageSize"
            if ($expandFields.Count -gt 0) {
                $uri += "&`$expand=$($expandFields -join ',')"
            }
            
            # Add consistency header for advanced properties
            $headers = @{
                'ConsistencyLevel' = 'eventual'
                'Prefer' = 'outlook.body-content-type="text"'
            }
            
            $userCount = 0
            do {
                Write-GraphLog -Level "DEBUG" -Message "Fetching users from: $uri" -Context $Context
                $response = Invoke-MgGraphRequest -Uri $uri -Method GET -Headers $headers -ErrorAction Stop
                
                foreach ($user in $response.value) {
                    $userCount++
                    
                    # Process license information
                    $licenses = @()
                    $plans = @()
                    if ($user.assignedLicenses) {
                        $licenses = $user.assignedLicenses | ForEach-Object { $_.skuId }
                    }
                    if ($user.assignedPlans) {
                        $plans = $user.assignedPlans | Where-Object { $_.capabilityStatus -eq 'Enabled' } | ForEach-Object { $_.servicePlanId }
                    }
                    
                    $userObj = [PSCustomObject]@{
                        id = $user.id
                        userPrincipalName = $user.userPrincipalName
                        displayName = $user.displayName
                        mail = $user.mail
                        mailNickname = $user.mailNickname
                        givenName = $user.givenName
                        surname = $user.surname
                        jobTitle = $user.jobTitle
                        department = $user.department
                        companyName = $user.companyName
                        officeLocation = $user.officeLocation
                        businessPhones = ($user.businessPhones -join ';')
                        mobilePhone = $user.mobilePhone
                        preferredLanguage = $user.preferredLanguage
                        employeeId = $user.employeeId
                        employeeType = $user.employeeType
                        createdDateTime = $user.createdDateTime
                        accountEnabled = $user.accountEnabled
                        assignedLicenses = ($licenses -join ';')
                        assignedPlans = ($plans -join ';')
                        licenseCount = $licenses.Count
                        onPremisesSyncEnabled = $user.onPremisesSyncEnabled
                        onPremisesImmutableId = $user.onPremisesImmutableId
                        onPremisesSamAccountName = $user.onPremisesSamAccountName
                        onPremisesDistinguishedName = $user.onPremisesDistinguishedName
                        onPremisesSecurityIdentifier = $user.onPremisesSecurityIdentifier
                        proxyAddresses = (($user.proxyAddresses | Where-Object { $_ -like 'SMTP:*' -or $_ -like 'smtp:*' }) -join ';')
                        userType = $user.userType
                        usageLocation = $user.usageLocation
                        city = $user.city
                        state = $user.state
                        country = $user.country
                        postalCode = $user.postalCode
                        streetAddress = $user.streetAddress
                        managerUPN = if ($user.manager) { $user.manager.userPrincipalName } else { $null }
                        managerId = if ($user.manager) { $user.manager.id } else { $null }
                        lastSignInDateTime = if ($user.signInActivity) { $user.signInActivity.lastSignInDateTime } else { $null }
                        lastNonInteractiveSignInDateTime = if ($user.signInActivity) { $user.signInActivity.lastNonInteractiveSignInDateTime } else { $null }
                        _DataType = 'User'
                    }
                    
                    $null = $allDiscoveredData.Add($userObj)
                    
                    if ($userCount % 100 -eq 0) {
                        Write-GraphLog -Level "DEBUG" -Message "Processed $userCount users..." -Context $Context
                        Write-Progress -Activity "Discovering Graph Users" -Status "$userCount users" -PercentComplete (($userCount / 10000) * 100)
                    }
                }
                
                $uri = $response.'@odata.nextLink'
            } while ($uri)
            
            Write-Progress -Activity "Discovering Graph Users" -Completed
            Write-GraphLog -Level "SUCCESS" -Message "Discovered $userCount users" -Context $Context
            
        } catch {
            $result.AddWarning("Failed to discover users: $($_.Exception.Message)", @{Section="Users"})
        }
        
        # Discover Groups with enhanced details
        try {
            Write-GraphLog -Level "INFO" -Message "Discovering groups..." -Context $Context
            
            $groupSelectFields = @(
                'id', 'displayName', 'mailEnabled', 'mailNickname', 'mail',
                'securityEnabled', 'groupTypes', 'description', 'visibility',
                'createdDateTime', 'renewedDateTime', 'expirationDateTime',
                'membershipRule', 'membershipRuleProcessingState',
                'preferredLanguage', 'theme', 'proxyAddresses',
                'onPremisesSyncEnabled', 'onPremisesSamAccountName',
                'onPremisesSecurityIdentifier', 'classification'
            )
            
            $uri = "https://graph.microsoft.com/v1.0/groups?`$select=$($groupSelectFields -join ',')&`$top=$pageSize"
            
            $groupCount = 0
            $groupMembers = [System.Collections.ArrayList]::new()
            
            do {
                $response = Invoke-MgGraphRequest -Uri $uri -Method GET -Headers $headers -ErrorAction Stop
                
                foreach ($group in $response.value) {
                    $groupCount++
                    
                    # Determine group type
                    $groupType = 'SecurityGroup'
                    if ($group.groupTypes -contains 'Unified') {
                        $groupType = 'Microsoft365Group'
                    } elseif ($group.mailEnabled -and -not $group.securityEnabled) {
                        $groupType = 'DistributionList'
                    } elseif ($group.mailEnabled -and $group.securityEnabled) {
                        $groupType = 'MailEnabledSecurityGroup'
                    } elseif ($group.groupTypes -contains 'DynamicMembership') {
                        $groupType = 'DynamicGroup'
                    }
                    
                    $groupObj = [PSCustomObject]@{
                        id = $group.id
                        displayName = $group.displayName
                        mail = $group.mail
                        mailNickname = $group.mailNickname
                        mailEnabled = $group.mailEnabled
                        securityEnabled = $group.securityEnabled
                        groupType = $groupType
                        groupTypes = ($group.groupTypes -join ';')
                        description = $group.description
                        visibility = $group.visibility
                        createdDateTime = $group.createdDateTime
                        renewedDateTime = $group.renewedDateTime
                        expirationDateTime = $group.expirationDateTime
                        membershipRule = $group.membershipRule
                        membershipRuleProcessingState = $group.membershipRuleProcessingState
                        isDynamic = ($null -ne $group.membershipRule)
                        preferredLanguage = $group.preferredLanguage
                        theme = $group.theme
                        proxyAddresses = (($group.proxyAddresses | Where-Object { $_ -like 'SMTP:*' -or $_ -like 'smtp:*' }) -join ';')
                        onPremisesSyncEnabled = $group.onPremisesSyncEnabled
                        onPremisesSamAccountName = $group.onPremisesSamAccountName
                        onPremisesSecurityIdentifier = $group.onPremisesSecurityIdentifier
                        classification = $group.classification
                        _DataType = 'Group'
                    }
                    
                    $null = $allDiscoveredData.Add($groupObj)
                    
                    # Get member count
                    try {
                        $memberCountUri = "https://graph.microsoft.com/v1.0/groups/$($group.id)/members/`$count"
                        $memberCountResponse = Invoke-MgGraphRequest -Uri $memberCountUri -Method GET -Headers @{'ConsistencyLevel'='eventual'} -ErrorAction Stop
                        
                        # Add member count to the group object
                        $groupObj | Add-Member -MemberType NoteProperty -Name 'memberCount' -Value $memberCountResponse -Force
                        
                        # If group has members, get them (limit to groups with reasonable member count)
                        if ($memberCountResponse -gt 0 -and $memberCountResponse -le 1000) {
                            $membersUri = "https://graph.microsoft.com/v1.0/groups/$($group.id)/members?`$select=id,displayName,userPrincipalName,mail&`$top=999"
                            do {
                                $membersResponse = Invoke-MgGraphRequest -Uri $membersUri -Method GET -ErrorAction Stop
                                
                                foreach ($member in $membersResponse.value) {
                                    $memberObj = [PSCustomObject]@{
                                        GroupId = $group.id
                                        GroupDisplayName = $group.displayName
                                        MemberId = $member.id
                                        MemberDisplayName = $member.displayName
                                        MemberUPN = $member.userPrincipalName
                                        MemberMail = $member.mail
                                        MemberType = $member.'@odata.type' -replace '#microsoft.graph.', ''
                                        _DataType = 'GroupMember'
                                    }
                                    $null = $groupMembers.Add($memberObj)
                                }
                                
                                $membersUri = $membersResponse.'@odata.nextLink'
                            } while ($membersUri)
                        }
                    } catch {
                        Write-GraphLog -Level "DEBUG" -Message "Could not get members for group $($group.displayName): $_" -Context $Context
                    }
                    
                    if ($groupCount % 50 -eq 0) {
                        Write-GraphLog -Level "DEBUG" -Message "Processed $groupCount groups..." -Context $Context
                    }
                }
                
                $uri = $response.'@odata.nextLink'
            } while ($uri)
            
            # Add group members to discovered data
            if ($groupMembers.Count -gt 0) {
                $null = $allDiscoveredData.AddRange($groupMembers)
            }
            
            Write-GraphLog -Level "SUCCESS" -Message "Discovered $groupCount groups and $($groupMembers.Count) memberships" -Context $Context
            
        } catch {
            $result.AddWarning("Failed to discover groups: $($_.Exception.Message)", @{Section="Groups"})
        }
        
        # Discover Devices (if enabled)
        if ($includeDevices) {
            try {
                Write-GraphLog -Level "INFO" -Message "Discovering devices..." -Context $Context
                
                $deviceSelectFields = @(
                    'id', 'displayName', 'operatingSystem', 'operatingSystemVersion',
                    'isManaged', 'isCompliant', 'trustType', 'approximateLastSignInDateTime',
                    'deviceId', 'physicalIds', 'alternativeSecurityIds',
                    'accountEnabled', 'createdDateTime', 'onPremisesSyncEnabled',
                    'registrationDateTime', 'version', 'deviceCategory', 'deviceOwnership',
                    'enrollmentType', 'managementType', 'manufacturer', 'model'
                )
                
                $uri = "https://graph.microsoft.com/v1.0/devices?`$select=$($deviceSelectFields -join ',')&`$top=$pageSize"
                
                $deviceCount = 0
                do {
                    $response = Invoke-MgGraphRequest -Uri $uri -Method GET -Headers $headers -ErrorAction Stop
                    
                    foreach ($device in $response.value) {
                        $deviceCount++
                        
                        $deviceObj = [PSCustomObject]@{
                            id = $device.id
                            displayName = $device.displayName
                            operatingSystem = $device.operatingSystem
                            operatingSystemVersion = $device.operatingSystemVersion
                            isManaged = $device.isManaged
                            isCompliant = $device.isCompliant
                            trustType = $device.trustType
                            approximateLastSignInDateTime = $device.approximateLastSignInDateTime
                            deviceId = $device.deviceId
                            accountEnabled = $device.accountEnabled
                            createdDateTime = $device.createdDateTime
                            onPremisesSyncEnabled = $device.onPremisesSyncEnabled
                            registrationDateTime = $device.registrationDateTime
                            version = $device.version
                            deviceCategory = $device.deviceCategory
                            deviceOwnership = $device.deviceOwnership
                            enrollmentType = $device.enrollmentType
                            managementType = $device.managementType
                            manufacturer = $device.manufacturer
                            model = $device.model
                            _DataType = 'Device'
                        }
                        
                        $null = $allDiscoveredData.Add($deviceObj)
                    }
                    
                    $uri = $response.'@odata.nextLink'
                } while ($uri)
                
                Write-GraphLog -Level "SUCCESS" -Message "Discovered $deviceCount devices" -Context $Context
                
            } catch {
                $result.AddWarning("Failed to discover devices: $($_.Exception.Message)", @{Section="Devices"})
            }
        }
        
        # Discover Applications (if enabled)
        if ($includeApplications) {
            try {
                Write-GraphLog -Level "INFO" -Message "Discovering applications..." -Context $Context
                
                $appSelectFields = @(
                    'id', 'appId', 'displayName', 'publisherDomain', 'signInAudience',
                    'createdDateTime', 'description', 'notes', 'tags', 'appRoles',
                    'identifierUris', 'web', 'spa', 'publicClient'
                )
                
                $uri = "https://graph.microsoft.com/v1.0/applications?`$select=$($appSelectFields -join ',')&`$top=$pageSize"
                
                $appCount = 0
                do {
                    $response = Invoke-MgGraphRequest -Uri $uri -Method GET -ErrorAction Stop
                    
                    foreach ($app in $response.value) {
                        $appCount++
                        
                        $appObj = [PSCustomObject]@{
                            id = $app.id
                            appId = $app.appId
                            displayName = $app.displayName
                            publisherDomain = $app.publisherDomain
                            signInAudience = $app.signInAudience
                            createdDateTime = $app.createdDateTime
                            description = $app.description
                            notes = $app.notes
                            tags = ($app.tags -join ';')
                            appRoleCount = if ($app.appRoles) { $app.appRoles.Count } else { 0 }
                            identifierUris = ($app.identifierUris -join ';')
                            redirectUris = if ($app.web -and $app.web.redirectUris) { ($app.web.redirectUris -join ';') } else { $null }
                            homepageUrl = if ($app.web) { $app.web.homePageUrl } else { $null }
                            _DataType = 'Application'
                        }
                        
                        $null = $allDiscoveredData.Add($appObj)
                    }
                    
                    $uri = $response.'@odata.nextLink'
                } while ($uri)
                
                Write-GraphLog -Level "SUCCESS" -Message "Discovered $appCount applications" -Context $Context
                
            } catch {
                $result.AddWarning("Failed to discover applications: $($_.Exception.Message)", @{Section="Applications"})
            }
        }
        
        # Discover Service Principals (if enabled)
        if ($includeServicePrincipals) {
            try {
                Write-GraphLog -Level "INFO" -Message "Discovering service principals..." -Context $Context
                
                $spSelectFields = @(
                    'id', 'appId', 'displayName', 'accountEnabled', 'servicePrincipalType',
                    'createdDateTime', 'appOwnerOrganizationId', 'publisherName',
                    'signInAudience', 'tags', 'appRoles', 'oauth2PermissionScopes'
                )
                
                $uri = "https://graph.microsoft.com/v1.0/servicePrincipals?`$select=$($spSelectFields -join ',')&`$top=$pageSize"
                
                $spCount = 0
                do {
                    $response = Invoke-MgGraphRequest -Uri $uri -Method GET -ErrorAction Stop
                    
                    foreach ($sp in $response.value) {
                        $spCount++
                        
                        $spObj = [PSCustomObject]@{
                            id = $sp.id
                            appId = $sp.appId
                            displayName = $sp.displayName
                            accountEnabled = $sp.accountEnabled
                            servicePrincipalType = $sp.servicePrincipalType
                            createdDateTime = $sp.createdDateTime
                            appOwnerOrganizationId = $sp.appOwnerOrganizationId
                            publisherName = $sp.publisherName
                            signInAudience = $sp.signInAudience
                            tags = ($sp.tags -join ';')
                            appRoleCount = if ($sp.appRoles) { $sp.appRoles.Count } else { 0 }
                            permissionScopeCount = if ($sp.oauth2PermissionScopes) { $sp.oauth2PermissionScopes.Count } else { 0 }
                            isFirstParty = ($sp.appOwnerOrganizationId -eq 'f8cdef31-a31e-4b4a-93e4-5f571e91255a')
                            _DataType = 'ServicePrincipal'
                        }
                        
                        $null = $allDiscoveredData.Add($spObj)
                    }
                    
                    $uri = $response.'@odata.nextLink'
                } while ($uri)
                
                Write-GraphLog -Level "SUCCESS" -Message "Discovered $spCount service principals" -Context $Context
                
            } catch {
                $result.AddWarning("Failed to discover service principals: $($_.Exception.Message)", @{Section="ServicePrincipals"})
            }
        }
        
        # Discover Directory Roles and Members (if enabled)
        if ($includeDirectoryRoles) {
            try {
                Write-GraphLog -Level "INFO" -Message "Discovering directory roles..." -Context $Context
                
                $roleSelectFields = @('id', 'displayName', 'description', 'isBuiltIn', 'isEnabled', 'templateId')
                $uri = "https://graph.microsoft.com/v1.0/directoryRoles?`$select=$($roleSelectFields -join ',')&`$top=$pageSize"
                
                $roleCount = 0
                $roleMemberships = [System.Collections.ArrayList]::new()
                
                do {
                    $response = Invoke-MgGraphRequest -Uri $uri -Method GET -ErrorAction Stop
                    
                    foreach ($role in $response.value) {
                        $roleCount++
                        
                        $roleObj = [PSCustomObject]@{
                            id = $role.id
                            displayName = $role.displayName
                            description = $role.description
                            isBuiltIn = $role.isBuiltIn
                            isEnabled = $role.isEnabled
                            templateId = $role.templateId
                            _DataType = 'DirectoryRole'
                        }
                        
                        $null = $allDiscoveredData.Add($roleObj)
                        
                        # Get role members
                        try {
                            $membersUri = "https://graph.microsoft.com/v1.0/directoryRoles/$($role.id)/members?`$select=id,displayName,userPrincipalName&`$top=999"
                            do {
                                $membersResponse = Invoke-MgGraphRequest -Uri $membersUri -Method GET -ErrorAction Stop
                                
                                foreach ($member in $membersResponse.value) {
                                    $membershipObj = [PSCustomObject]@{
                                        RoleId = $role.id
                                        RoleDisplayName = $role.displayName
                                        MemberId = $member.id
                                        MemberDisplayName = $member.displayName
                                        MemberUPN = $member.userPrincipalName
                                        MemberType = $member.'@odata.type' -replace '#microsoft.graph.', ''
                                        _DataType = 'DirectoryRoleMembership'
                                    }
                                    $null = $roleMemberships.Add($membershipObj)
                                }
                                
                                $membersUri = $membersResponse.'@odata.nextLink'
                            } while ($membersUri)
                        } catch {
                            Write-GraphLog -Level "DEBUG" -Message "Could not get members for role $($role.displayName): $_" -Context $Context
                        }
                    }
                    
                    $uri = $response.'@odata.nextLink'
                } while ($uri)
                
                # Add role memberships to discovered data
                if ($roleMemberships.Count -gt 0) {
                    $null = $allDiscoveredData.AddRange($roleMemberships)
                }
                
                Write-GraphLog -Level "SUCCESS" -Message "Discovered $roleCount directory roles and $($roleMemberships.Count) memberships" -Context $Context
                
            } catch {
                $result.AddWarning("Failed to discover directory roles: $($_.Exception.Message)", @{Section="DirectoryRoles"})
            }
        }

        # 6. EXPORT DATA TO CSV
        if ($allDiscoveredData.Count -gt 0) {
            Write-GraphLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            
            # Group by data type and export
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $data = $group.Group
                
                # Add metadata
                $data | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Graph" -Force
                }
                
                # Determine filename
                $fileName = switch ($dataType) {
                    'User' { 'GraphUsers.csv' }
                    'Group' { 'GraphGroups.csv' }
                    'GroupMember' { 'GraphGroupMembers.csv' }
                    'Device' { 'GraphDevices.csv' }
                    'Application' { 'GraphApplications.csv' }
                    'ServicePrincipal' { 'GraphServicePrincipals.csv' }
                    'DirectoryRole' { 'GraphDirectoryRoles.csv' }
                    'DirectoryRoleMembership' { 'GraphDirectoryRoleMemberships.csv' }
                    'Organization' { 'GraphOrganization.csv' }
                    default { "Graph_$dataType.csv" }
                }
                
                $filePath = Join-Path $outputPath $fileName
                $data | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                
                Write-GraphLog -Level "SUCCESS" -Message "Exported $($data.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-GraphLog -Level "WARN" -Message "No data discovered to export" -Context $Context
        }

        # 7. FINALIZE METADATA
        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        
        # Add counts by type
        $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
        foreach ($group in $dataGroups) {
            $result.Metadata["$($group.Name)Count"] = $group.Count
        }

    } catch {
        # Top-level error handler
        Write-GraphLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        # 8. CLEANUP & COMPLETE
        Write-GraphLog -Level "INFO" -Message "Cleaning up..." -Context $Context
        
        # Disconnect from services
        Disconnect-MgGraph -ErrorAction SilentlyContinue
        
        $stopwatch.Stop()
        $result.Complete()
        Write-GraphLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

# --- Helper Functions ---
function Ensure-Path {
    param($Path)
    if (-not (Test-Path -Path $Path -PathType Container)) {
        try {
            New-Item -Path $Path -ItemType Directory -Force -ErrorAction Stop | Out-Null
        } catch {
            throw "Failed to create output directory: $Path. Error: $($_.Exception.Message)"
        }
    }
}

# --- Module Export ---
Export-ModuleMember -Function Invoke-GraphDiscovery