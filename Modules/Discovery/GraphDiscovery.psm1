<#
.SYNOPSIS
    M&A Discovery Suite - Microsoft Graph Discovery Module (Enhanced)
.DESCRIPTION
    Collects data from Microsoft Graph API, focusing on users, groups, applications,
    service principals, devices, roles, and their relationships. This module emphasizes
    direct API calls for greater flexibility and control over data retrieval.
.NOTES
    Version: 2.0.1
    Author: M&A Discovery Suite Developer (Inspired by Gemini & AzureHound concepts)
    Date: 2025-05-28

    Prerequisites:
    - Authentication context/token provided by Authentication.psm1 or ConnectionManager.psm1.
    - Utility modules: Logging.psm1, ErrorHandling.psm1, ProgressTracking.psm1.
#>

#region Private Helper Functions

# Placeholder for token retrieval - This should be integrated with your suite's auth mechanism
# In a real scenario, this would call a function from your Authentication.psm1 or ConnectionManager.psm1
function Get-GraphApiToken {
    [CmdletBinding()]
    param(
        [hashtable]$Configuration
    )
    # Example: return $global:GraphAccessToken
    # For now, this is a placeholder. Ensure your suite provides a valid token.
    if ($global:GraphAccessToken) {
        return $global:GraphAccessToken
    } elseif ($Configuration.authentication.accessToken) { # Allow passing token via config for testing
        return $Configuration.authentication.accessToken
    }
    else {
        Write-MandALog "Graph API Token not available. Ensure Authentication module has run successfully." -Level "ERROR" -Configuration $Configuration # Added -Configuration
        throw "Graph API Token not available."
    }
}

function Invoke-GraphApiRequest {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Uri,
        [Parameter(Mandatory=$false)]
        [string]$Method = "GET",
        [Parameter(Mandatory=$false)]
        [hashtable]$Body,
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        [int]$MaxRetriesParam = 3,       # Renamed to avoid conflict, simple default
        [Parameter(Mandatory=$false)]
        [int]$InitialDelaySecondsParam = 5, # Renamed, simple default
        [Parameter(Mandatory=$false)]
        [switch]$AllowBeta = $false
    )

    # Resolve actual values to use, preferring configuration if valid
    $ActualMaxRetries = $MaxRetriesParam
    if ($Configuration.environment -and $Configuration.environment.ContainsKey('maxRetries')) {
        # Attempt to convert to int, catch if not possible
        try {
            $ActualMaxRetries = [int]$Configuration.environment.maxRetries
        } catch {
             Write-MandALog "Configuration.environment.maxRetries ('$($Configuration.environment.maxRetries)') is not a valid integer. Using default: $ActualMaxRetries." -Level "WARN" -Configuration $Configuration
        }
    }

    $ActualInitialDelaySeconds = $InitialDelaySecondsParam
    if ($Configuration.environment -and $Configuration.environment.ContainsKey('initialDelaySeconds')) { # Assuming you might add this to config schema
        try {
            $ActualInitialDelaySeconds = [int]$Configuration.environment.initialDelaySeconds
        } catch {
            Write-MandALog "Configuration.environment.initialDelaySeconds ('$($Configuration.environment.initialDelaySeconds)') is not a valid integer. Using default: $ActualInitialDelaySeconds." -Level "WARN" -Configuration $Configuration
        }
    }

    $token = Get-GraphApiToken -Configuration $Configuration
    if (-not $token) {
        throw "Failed to retrieve Graph API token."
    }

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type"  = "application/json"
        "ConsistencyLevel" = "eventual" # Required for certain advanced queries like $count
    }

    $currentAttempt = 0
    $allResults = [System.Collections.Generic.List[PSObject]]::new()

    $baseApiUrl = "https://graph.microsoft.com/"
    $apiVersionPath = if ($AllowBeta) { "beta/" } else { "v1.0/" }
    
    if ($Uri -notlike "$baseApiUrl*") {
        $Uri = "$baseApiUrl$apiVersionPath$($Uri.TrimStart('/'))"
    }
    
    Write-MandALog "Invoking Graph API: $Method $Uri" -Level "DEBUG" -Configuration $Configuration

    while ($currentAttempt -lt $ActualMaxRetries) { # Use $ActualMaxRetries
        $currentAttempt++
        try {
            $response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $headers -Body ($Body | ConvertTo-Json -Depth 10 -Compress) -ErrorAction SilentlyContinue -SkipHttpErrorCheck
            
            if ($null -eq $response -and $LASTEXITCODE -ne 0) {
                 Write-MandALog "Invoke-RestMethod failed with exit code $LASTEXITCODE for $Uri." -Level "WARN" -Configuration $Configuration
                 throw "Invoke-RestMethod failed for $Uri. Exit code: $LASTEXITCODE"
            }
            
            $statusCode = $null
            # Try to get status code. This part can be tricky across PowerShell versions.
            if ($PSVersionTable.PSVersion.Major -ge 7) {
                $statusCode = $response.StatusCode
            } else {
                 if ($Error[0] -and $Error[0].Exception.Response) {
                    $statusCode = [int]$Error[0].Exception.Response.StatusCode
                 } elseif ($response.GetType().Name -eq 'HttpResponseException') { 
                    $statusCode = [int]$response.Response.StatusCode
                 } elseif ($response.StatusCode) { # Sometimes it might be directly on response in PS5.1 for non-errors
                    $statusCode = [int]$response.StatusCode
                 }
                 # If still null after checks and no error was thrown by Invoke-RestMethod itself, assume 2xx
                 if ($null -eq $statusCode -and -not ($Error[0] -and $Error[0].Exception.Response)) {
                    $statusCode = 200 
                 }
            }
            # If Invoke-RestMethod populated $Error but didn't throw, and $statusCode is still null
            if ($null -eq $statusCode -and $Error[0] -and $Error[0].Exception.Response) {
                $statusCode = [int]$Error[0].Exception.Response.StatusCode
            }
            # Final fallback if $statusCode is still null but we have a $response object (likely success)
            if ($null -eq $statusCode -and $response) {
                $statusCode = 200
            }


            if ($statusCode -ge 400) {
                $errorResponseMessage = "N/A"
                if ($response -is [System.Net.Http.HttpResponseMessage]) { # PS7+
                    $errorResponseMessage = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
                } elseif ($Error[0] -and $Error[0].Exception.Response -and $Error[0].Exception.Response.GetResponseStream) { # PS5.1
                    $responseStream = $Error[0].Exception.Response.GetResponseStream()
                    $streamReader = New-Object System.IO.StreamReader($responseStream)
                    $errorResponseMessage = $streamReader.ReadToEnd()
                    $streamReader.Close()
                    $responseStream.Close()
                } elseif ($response.ErrorDetails) { # Another possible structure
                    $errorResponseMessage = $response.ErrorDetails | ConvertTo-Json -Depth 3 -Compress
                } else {
                    $errorResponseMessage = $response | ConvertTo-Json -Depth 3 -Compress
                }

                Write-MandALog "Graph API Error ($statusCode) for $Uri : $errorResponseMessage" -Level "ERROR" -Configuration $Configuration

                if ($statusCode -eq 401 -or $statusCode -eq 403) {
                    Write-MandALog "Authentication/Authorization error. Token might be expired or permissions missing." -Level "ERROR" -Configuration $Configuration
                    throw "Graph API Error ($statusCode): Authentication/Authorization failed. Details: $errorResponseMessage" 
                }

                if ($statusCode -eq 429 -or $statusCode -eq 503 -or $statusCode -eq 504) { 
                    $retryAfterHeader = $null
                    if ($PSVersionTable.PSVersion.Major -ge 7 -and $response.Headers) {
                        $retryAfterHeader = $response.Headers.'Retry-After'
                    } elseif ($Error[0] -and $Error[0].Exception.Response -and $Error[0].Exception.Response.Headers) { # PS5.1
                        $retryAfterHeader = $Error[0].Exception.Response.Headers.'Retry-After'
                    }

                    $delay = $ActualInitialDelaySeconds * ([math]::Pow(2, $currentAttempt -1)) # Use $ActualInitialDelaySeconds
                    if ($retryAfterHeader) {
                        if ($retryAfterHeader -match '^\d+$') { 
                            $delay = [int]$retryAfterHeader
                        } else { 
                            try {
                                $retryDate = [datetime]::ParseExact($retryAfterHeader, "r", $null) # RFC1123Pattern
                                $delay = ($retryDate.ToUniversalTime() - (Get-Date).ToUniversalTime()).TotalSeconds
                                if ($delay -lt 0) { $delay = $ActualInitialDelaySeconds } 
                            } catch {
                                Write-MandALog "Could not parse Retry-After HTTP date: $retryAfterHeader. Using default delay." -Level "WARN" -Configuration $Configuration
                            }
                        }
                    }
                    $delay = [math]::Min($delay, 300) 
                    Write-MandALog "Attempt $currentAttempt/$ActualMaxRetries failed for $Uri. Retrying in $delay seconds due to $statusCode..." -Level "WARN" -Configuration $Configuration
                    Start-Sleep -Seconds $delay
                    continue 
                }
                
                if ($currentAttempt -ge $ActualMaxRetries) {
                    throw "Graph API Error ($statusCode) after $ActualMaxRetries attempts for $Uri. Details: $errorResponseMessage"
                }
                
                if ($statusCode -ge 400 -and $statusCode -ne 401 -and $statusCode -ne 403 -and $statusCode -ne 429) {
                     throw "Graph API Client Error ($statusCode) for $Uri. Details: $errorResponseMessage" 
                }
            } else { 
                if ($response -is [hashtable] -and $response.ContainsKey('value')) {
                    $allResults.AddRange($response.value)
                    if ($response.'@odata.nextLink') {
                        $Uri = $response.'@odata.nextLink'
                        Write-MandALog "Fetching next page: $Uri" -Level "DEBUG" -Configuration $Configuration
                        $currentAttempt = 0 
                        continue 
                    }
                } elseif ($response) { 
                    $allResults.Add($response)
                }
                # Successfully retrieved data for the current URI (or page)
                return $allResults 
            }

        } catch {
            Write-MandALog "Exception during Graph API request to $Uri (Attempt $currentAttempt/$ActualMaxRetries): $($_.Exception.Message)" -Level "ERROR" -Configuration $Configuration
            if ($currentAttempt -ge $ActualMaxRetries) {
                throw 
            }
            $delay = $ActualInitialDelaySeconds * ([math]::Pow(2, $currentAttempt -1)) # Use $ActualInitialDelaySeconds
            $delay = [math]::Min($delay, 300) 
            Write-MandALog "Retrying in $delay seconds..." -Level "WARN" -Configuration $Configuration
            Start-Sleep -Seconds $delay
        }
    }
    # If loop finishes due to max retries without returning/throwing earlier
    throw "Failed to retrieve data from $Uri after $ActualMaxRetries attempts."
}

#endregion Private Helper Functions

#region Public Discovery Functions

function Get-GraphUsersData {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "Starting User Data Discovery from Graph" -Level "INFO" -Configuration $Configuration
    $results = [System.Collections.Generic.List[PSObject]]::new()
    $selectProperties = @(
        "id", "userPrincipalName", "displayName", "givenName", "surname", "mail",
        "jobTitle", "department", "officeLocation", "companyName",
        "accountEnabled", "createdDateTime", "lastPasswordChangeDateTime", "signInActivity",
        "assignedLicenses", "assignedPlans", "userType", "externalUserState", "manager"
    )
    $expandProperties = "manager(`$select=id,userPrincipalName,displayName)"

    $usersUri = "users?`$select=$($selectProperties -join ',')&`$expand=$expandProperties&`$top=999"
    
    try {
        $users = Invoke-GraphApiRequest -Uri $usersUri -Configuration $Configuration
        Write-MandALog "Retrieved $($users.Count) user objects." -Level "INFO" -Configuration $Configuration

        foreach ($user in $users) {
            $userProps = @{
                ObjectID = $user.id
                UserPrincipalName = $user.userPrincipalName
                DisplayName = $user.displayName
                GivenName = $user.givenName
                Surname = $user.surname
                Mail = $user.mail
                JobTitle = $user.jobTitle
                Department = $user.department
                OfficeLocation = $user.officeLocation
                CompanyName = $user.companyName
                AccountEnabled = $user.accountEnabled
                CreatedDateTime = $user.createdDateTime
                LastPasswordChangeDateTime = $user.lastPasswordChangeDateTime
                UserType = $user.userType
                ExternalUserState = $user.externalUserState
                ManagerID = $null # Initialize
                ManagerUPN = $null # Initialize
                ManagerDisplayName = $null # Initialize
                AssignedLicensesCount = ($user.assignedLicenses | Measure-Object).Count
                AssignedPlansCount = ($user.assignedPlans | Measure-Object).Count
                SignInActivity_LastSignInDateTime = $null # Initialize
                SignInActivity_LastNonInteractiveSignInDateTime = $null # Initialize
            }
            if ($user.manager) {
                $userProps.ManagerID = $user.manager.id
                $userProps.ManagerUPN = $user.manager.userPrincipalName
                $userProps.ManagerDisplayName = $user.manager.displayName
            }
            if ($user.signInActivity) {
                $userProps.SignInActivity_LastSignInDateTime = $user.signInActivity.lastSignInDateTime 
                $userProps.SignInActivity_LastNonInteractiveSignInDateTime = $user.signInActivity.lastNonInteractiveSignInDateTime
            }
            $results.Add([PSCustomObject]$userProps)
        }
    }
    catch {
        Write-MandALog "Error during Get-GraphUsersData: $($_.Exception.Message)" -Level "ERROR" -Configuration $Configuration
    }
    
    Write-MandALog "Finished User Data Discovery. Found $($results.Count) users." -Level "INFO" -Configuration $Configuration
    return $results
}

function Get-GraphGroupsData {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "Starting Group Data Discovery from Graph" -Level "INFO" -Configuration $Configuration
    $results = [System.Collections.Generic.List[PSObject]]::new()
    $selectProperties = @(
        "id", "displayName", "description", "mailEnabled", "mailNickname", "securityEnabled",
        "groupTypes", "visibility", "createdDateTime"
    )
    
    $groupsUri = "groups?`$select=$($selectProperties -join ',')&`$top=999"

    try {
        $groups = Invoke-GraphApiRequest -Uri $groupsUri -Configuration $Configuration
        Write-MandALog "Retrieved $($groups.Count) group objects (initial query)." -Level "INFO" -Configuration $Configuration

        $groupRelationships = [System.Collections.Generic.List[PSObject]]::new()

        foreach ($group in $groups) {
            $groupProps = @{
                ObjectID = $group.id
                DisplayName = $group.displayName
                Description = $group.description
                IsMailEnabled = $group.mailEnabled
                MailNickname = $group.mailNickname
                IsSecurityEnabled = $group.securityEnabled
                GroupTypes = ($group.groupTypes -join ';')
                Visibility = $group.visibility
                CreatedDateTime = $group.createdDateTime
                MemberCount = 0 
                OwnerCount = 0  
            }

            $ownersUri = "groups/$($group.id)/owners?`$select=id,userPrincipalName,displayName&`$top=999"
            $owners = Invoke-GraphApiRequest -Uri $ownersUri -Configuration $Configuration -ErrorAction SilentlyContinue # Continue if owners can't be fetched for a group
            if ($owners) {
                $groupProps.OwnerCount = $owners.Count
                foreach ($owner in $owners) {
                    $groupRelationships.Add([PSCustomObject]@{
                        SourceObjectID = $owner.id
                        SourceObjectType = "UserOrServicePrincipal" 
                        SourceObjectName = $owner.userPrincipalName -or $owner.displayName
                        TargetObjectID = $group.id
                        TargetObjectType = "Group"
                        TargetObjectName = $group.displayName
                        RelationshipType = "Owns"
                    })
                }
            } else { Write-MandALog "Could not retrieve owners for group '$($group.displayName)' (ID: $($group.id)) or no owners found." -Level "WARN" -Configuration $Configuration }


            $membersUri = "groups/$($group.id)/members?`$select=id,userPrincipalName,displayName,@odata.type&`$top=999" 
            $members = Invoke-GraphApiRequest -Uri $membersUri -Configuration $Configuration -ErrorAction SilentlyContinue # Continue if members can't be fetched
            if ($members) {
                $groupProps.MemberCount = $members.Count
                foreach ($member in $members) {
                    $memberType = "Unknown"
                    if ($member.'@odata.type') {
                        $memberType = $member.'@odata.type'.Replace("#microsoft.graph.", "")
                    }
                    $groupRelationships.Add([PSCustomObject]@{
                        SourceObjectID = $member.id
                        SourceObjectType = $memberType
                        SourceObjectName = $member.userPrincipalName -or $member.displayName
                        TargetObjectID = $group.id
                        TargetObjectType = "Group"
                        TargetObjectName = $group.displayName
                        RelationshipType = "MemberOf"
                    })
                }
            } else { Write-MandALog "Could not retrieve members for group '$($group.displayName)' (ID: $($group.id)) or no members found." -Level "WARN" -Configuration $Configuration }
            
            $results.Add([PSCustomObject]$groupProps)
        }
         Export-MandAData -Data $groupRelationships -FileName "GraphGroupRelationships" -Configuration $Configuration

    } catch {
        Write-MandALog "Error during Get-GraphGroupsData: $($_.Exception.Message)" -Level "ERROR" -Configuration $Configuration
    }

    Write-MandALog "Finished Group Data Discovery. Found $($results.Count) groups." -Level "INFO" -Configuration $Configuration
    return $results
}

function Get-GraphApplicationsData {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "Starting Application (App Registrations) Data Discovery from Graph" -Level "INFO" -Configuration $Configuration
    $results = [System.Collections.Generic.List[PSObject]]::new()
    $selectProperties = @(
        "id", "appId", "displayName", "createdDateTime", "publisherDomain", "signInAudience",
        "notes", "tags", "web", "spa", "publicClient" 
    )
    $appsUri = "applications?`$select=$($selectProperties -join ',')&`$top=999"
    
    try {
        $applications = Invoke-GraphApiRequest -Uri $appsUri -Configuration $Configuration
        Write-MandALog "Retrieved $($applications.Count) application registration objects." -Level "INFO" -Configuration $Configuration
        
        $appRelationships = [System.Collections.Generic.List[PSObject]]::new()

        foreach ($app in $applications) {
            $appProps = @{
                ObjectID = $app.id
                AppID = $app.appId
                DisplayName = $app.displayName
                CreatedDateTime = $app.createdDateTime
                PublisherDomain = $app.publisherDomain
                SignInAudience = $app.signInAudience
                Notes = $app.notes
                Tags = ($app.tags -join ';')
                WebRedirectUris = ($app.web.redirectUris -join ';')
                SpaRedirectUris = ($app.spa.redirectUris -join ';')
                PublicClientRedirectUris = ($app.publicClient.redirectUris -join ';')
            }
            $results.Add([PSCustomObject]$appProps)

            $ownersUri = "applications/$($app.id)/owners?`$select=id,userPrincipalName,displayName,@odata.type&`$top=999"
            $owners = Invoke-GraphApiRequest -Uri $ownersUri -Configuration $Configuration -ErrorAction SilentlyContinue
            if ($owners) {
                foreach ($owner in $owners) {
                    $ownerType = "Unknown"
                    if ($owner.'@odata.type') {
                        $ownerType = $owner.'@odata.type'.Replace("#microsoft.graph.", "")
                    }
                    $appRelationships.Add([PSCustomObject]@{
                        SourceObjectID = $owner.id
                        SourceObjectType = $ownerType 
                        SourceObjectName = $owner.userPrincipalName -or $owner.displayName
                        TargetObjectID = $app.id
                        TargetObjectType = "Application"
                        TargetObjectName = $app.displayName
                        RelationshipType = "Owns"
                    })
                }
            } else { Write-MandALog "Could not retrieve owners for application '$($app.displayName)' (ID: $($app.id)) or no owners found." -Level "WARN" -Configuration $Configuration }
        }
        Export-MandAData -Data $appRelationships -FileName "GraphApplicationRelationships" -Configuration $Configuration
    }
    catch {
        Write-MandALog "Error during Get-GraphApplicationsData: $($_.Exception.Message)" -Level "ERROR" -Configuration $Configuration
    }
    
    Write-MandALog "Finished Application Data Discovery. Found $($results.Count) applications." -Level "INFO" -Configuration $Configuration
    return $results
}

function Get-GraphServicePrincipalsData {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "Starting Service Principal Data Discovery from Graph" -Level "INFO" -Configuration $Configuration
    $results = [System.Collections.Generic.List[PSObject]]::new()
    $selectProperties = @(
        "id", "appId", "displayName", "servicePrincipalType", "accountEnabled", "appRoleAssignmentRequired",
        "homepage", "loginUrl", "logoutUrl", "notes", "tags", "publisherName", "preferredTokenSigningKeyThumbprint"
    )
    $spUri = "servicePrincipals?`$select=$($selectProperties -join ',')&`$top=999"
    
    try {
        $servicePrincipals = Invoke-GraphApiRequest -Uri $spUri -Configuration $Configuration
        Write-MandALog "Retrieved $($servicePrincipals.Count) service principal objects." -Level "INFO" -Configuration $Configuration
        
        $spRelationships = [System.Collections.Generic.List[PSObject]]::new()

        foreach ($sp in $servicePrincipals) {
            $spProps = @{
                ObjectID = $sp.id
                AppID = $sp.appId 
                DisplayName = $sp.displayName
                ServicePrincipalType = $sp.servicePrincipalType
                AccountEnabled = $sp.accountEnabled
                AppRoleAssignmentRequired = $sp.appRoleAssignmentRequired
                Homepage = $sp.homepage
                LoginUrl = $sp.loginUrl
                Notes = $sp.notes
                Tags = ($sp.tags -join ';')
                PublisherName = $sp.publisherName
            }
            $results.Add([PSCustomObject]$spProps)

            $ownersUri = "servicePrincipals/$($sp.id)/owners?`$select=id,userPrincipalName,displayName,@odata.type&`$top=999"
            $owners = Invoke-GraphApiRequest -Uri $ownersUri -Configuration $Configuration -ErrorAction SilentlyContinue
            if ($owners) {
                foreach ($owner in $owners) {
                    $ownerType = "Unknown"
                    if ($owner.'@odata.type') {
                        $ownerType = $owner.'@odata.type'.Replace("#microsoft.graph.","")
                    }
                     $spRelationships.Add([PSCustomObject]@{
                        SourceObjectID = $owner.id
                        SourceObjectType = $ownerType
                        SourceObjectName = $owner.userPrincipalName -or $owner.displayName
                        TargetObjectID = $sp.id
                        TargetObjectType = "ServicePrincipal"
                        TargetObjectName = $sp.displayName
                        RelationshipType = "Owns"
                    })
                }
            } else { Write-MandALog "Could not retrieve owners for SP '$($sp.displayName)' (ID: $($sp.id)) or no owners found." -Level "WARN" -Configuration $Configuration }

            $appRoleAssignmentsUri = "servicePrincipals/$($sp.id)/appRoleAssignedTo?`$select=principalId,principalDisplayName,principalType,appRoleId,resourceId,resourceDisplayName&`$top=999"
            $appRoleAssignments = Invoke-GraphApiRequest -Uri $appRoleAssignmentsUri -Configuration $Configuration -ErrorAction SilentlyContinue
            if ($appRoleAssignments) {
                foreach ($assignment in $appRoleAssignments) {
                    $spRelationships.Add([PSCustomObject]@{
                        SourceObjectID = $assignment.principalId 
                        SourceObjectType = $assignment.principalType
                        SourceObjectName = $assignment.principalDisplayName
                        TargetObjectID = $sp.id 
                        TargetObjectType = "ServicePrincipal"
                        TargetObjectName = $sp.displayName # SP is the resource here
                        RelationshipType = "AppRoleAssignedTo"
                        AppRoleID = $assignment.appRoleId
                        ResourceID_AssignmentContext = $assignment.resourceId # Should be this SP's ID
                        ResourceDisplayName_AssignmentContext = $assignment.resourceDisplayName
                    })
                }
            } else { Write-MandALog "Could not retrieve appRoleAssignments for SP '$($sp.displayName)' (ID: $($sp.id)) or none found." -Level "WARN" -Configuration $Configuration }

            $oauthGrantsUri = "servicePrincipals/$($sp.id)/oauth2PermissionGrants?`$select=clientId,consentType,principalId,resourceId,scope&`$top=999"
            $oauthGrants = Invoke-GraphApiRequest -Uri $oauthGrantsUri -Configuration $Configuration -ErrorAction SilentlyContinue
            if ($oauthGrants) {
                foreach ($grant in $oauthGrants) {
                    $spRelationships.Add([PSCustomObject]@{
                        SourceObjectID = $sp.id 
                        SourceObjectType = "ServicePrincipal"
                        SourceObjectName = $sp.displayName
                        TargetObjectID = $grant.resourceId 
                        TargetObjectType = "ServicePrincipalAPI" 
                        TargetObjectName = $null # Would need another lookup based on resourceId to get API name
                        RelationshipType = "OAuth2PermissionGrant"
                        ConsentType = $grant.consentType 
                        Scope = $grant.scope 
                        GrantingPrincipalId = $grant.principalId 
                        GrantingClientId = $grant.clientId # This is the SP's AppID (client ID)
                    })
                }
            } else { Write-MandALog "Could not retrieve oAuth2PermissionGrants for SP '$($sp.displayName)' (ID: $($sp.id)) or none found." -Level "WARN" -Configuration $Configuration }
        }
        Export-MandAData -Data $spRelationships -FileName "GraphServicePrincipalRelationships" -Configuration $Configuration
    }
    catch {
        Write-MandALog "Error during Get-GraphServicePrincipalsData: $($_.Exception.Message)" -Level "ERROR" -Configuration $Configuration
    }
    
    Write-MandALog "Finished Service Principal Data Discovery. Found $($results.Count) service principals." -Level "INFO" -Configuration $Configuration
    return $results
}


function Get-GraphDirectoryRolesData {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "Starting Directory Role Data Discovery from Graph" -Level "INFO" -Configuration $Configuration
    $results = [System.Collections.Generic.List[PSObject]]::new()
    $selectProperties = @(
        "id", "displayName", "description", "roleTemplateId"
    )
    $rolesUri = "directoryRoles?`$select=$($selectProperties -join ',')&`$top=999" 

    try {
        $roles = Invoke-GraphApiRequest -Uri $rolesUri -Configuration $Configuration
        Write-MandALog "Retrieved $($roles.Count) directory role objects." -Level "INFO" -Configuration $Configuration
        
        $roleRelationships = [System.Collections.Generic.List[PSObject]]::new()

        foreach ($role in $roles) {
            $roleProps = @{
                ObjectID = $role.id
                DisplayName = $role.displayName
                Description = $role.description
                RoleTemplateID = $role.roleTemplateId
                MemberCount = 0
            }

            $membersUri = "directoryRoles/$($role.id)/members?`$select=id,userPrincipalName,displayName,@odata.type&`$top=999"
            $members = Invoke-GraphApiRequest -Uri $membersUri -Configuration $Configuration -ErrorAction SilentlyContinue
            if ($members) {
                $roleProps.MemberCount = $members.Count
                foreach ($member in $members) {
                     $memberType = "Unknown"
                    if ($member.'@odata.type') {
                        $memberType = $member.'@odata.type'.Replace("#microsoft.graph.", "")
                    }
                    $roleRelationships.Add([PSCustomObject]@{
                        SourceObjectID = $member.id
                        SourceObjectType = $memberType 
                        SourceObjectName = $member.userPrincipalName -or $member.displayName
                        TargetObjectID = $role.id
                        TargetObjectType = "DirectoryRole"
                        TargetObjectName = $role.displayName
                        RelationshipType = "MemberOfRole"
                    })
                }
            } else { Write-MandALog "Could not retrieve members for role '$($role.displayName)' (ID: $($role.id)) or no members found." -Level "WARN" -Configuration $Configuration }
            
            $results.Add([PSCustomObject]$roleProps)
        }
        Export-MandAData -Data $roleRelationships -FileName "GraphDirectoryRoleRelationships" -Configuration $Configuration
    }
    catch {
        Write-MandALog "Error during Get-GraphDirectoryRolesData: $($_.Exception.Message)" -Level "ERROR" -Configuration $Configuration
    }
    
    Write-MandALog "Finished Directory Role Data Discovery. Found $($results.Count) roles." -Level "INFO" -Configuration $Configuration
    return $results
}

#endregion Public Discovery Functions

#region Main Orchestration Function

function Invoke-GraphDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    Write-MandALog "Starting Microsoft Graph Discovery Phase" -Level "HEADER" -Configuration $Configuration
    # Ensure $script:ExecutionMetrics is initialized if this module can be run standalone for testing
    if (-not $script:ExecutionMetrics) { $script:ExecutionMetrics = @{} }
    $script:ExecutionMetrics.Phase = "Graph Discovery" 
    
    # Ensure Initialize-ProgressTracker and other utility functions are available
    # These would typically be imported from your utility modules.
    # For standalone testing, you might need to mock them or ensure utilities are loaded.
    if (Get-Command Initialize-ProgressTracker -ErrorAction SilentlyContinue) {
        Initialize-ProgressTracker -Phase "Graph Discovery" -TotalSteps 5 -Configuration $Configuration 
    } else {
        Write-MandALog "Initialize-ProgressTracker not found. Progress tracking will be limited." -Level "WARN" -Configuration $Configuration
    }


    $allGraphData = @{}

    try {
        if (Get-Command Test-GraphConnection -ErrorAction SilentlyContinue) {
            if (-not (Test-GraphConnection -Configuration $Configuration)) { 
                Write-MandALog "Graph connection test failed. Skipping Graph discovery." -Level "ERROR" -Configuration $Configuration
                return $null
            }
        } else {
             Write-MandALog "Test-GraphConnection not found. Assuming connection is okay or handled by Get-GraphApiToken." -Level "WARN" -Configuration $Configuration
        }

        if (Get-Command Update-Progress -ErrorAction SilentlyContinue) { Update-Progress -Step 1 -Status "Discovering Users" -Configuration $Configuration }
        $allGraphData.Users = Get-GraphUsersData -Configuration $Configuration
        if (Get-Command Export-MandAData -ErrorAction SilentlyContinue) { Export-MandAData -Data $allGraphData.Users -FileName "GraphUsers" -Configuration $Configuration }

        if (Get-Command Update-Progress -ErrorAction SilentlyContinue) { Update-Progress -Step 2 -Status "Discovering Groups & Relationships" -Configuration $Configuration }
        $allGraphData.Groups = Get-GraphGroupsData -Configuration $Configuration 
        if (Get-Command Export-MandAData -ErrorAction SilentlyContinue) { Export-MandAData -Data $allGraphData.Groups -FileName "GraphGroups" -Configuration $Configuration }

        if (Get-Command Update-Progress -ErrorAction SilentlyContinue) { Update-Progress -Step 3 -Status "Discovering Applications & Relationships" -Configuration $Configuration }
        $allGraphData.Applications = Get-GraphApplicationsData -Configuration $Configuration 
        if (Get-Command Export-MandAData -ErrorAction SilentlyContinue) { Export-MandAData -Data $allGraphData.Applications -FileName "GraphApplications" -Configuration $Configuration }
        
        if (Get-Command Update-Progress -ErrorAction SilentlyContinue) { Update-Progress -Step 4 -Status "Discovering Service Principals & Relationships" -Configuration $Configuration }
        $allGraphData.ServicePrincipals = Get-GraphServicePrincipalsData -Configuration $Configuration 
        if (Get-Command Export-MandAData -ErrorAction SilentlyContinue) { Export-MandAData -Data $allGraphData.ServicePrincipals -FileName "GraphServicePrincipals" -Configuration $Configuration }

        if (Get-Command Update-Progress -ErrorAction SilentlyContinue) { Update-Progress -Step 5 -Status "Discovering Directory Roles & Relationships" -Configuration $Configuration }
        $allGraphData.DirectoryRoles = Get-GraphDirectoryRolesData -Configuration $Configuration 
        if (Get-Command Export-MandAData -ErrorAction SilentlyContinue) { Export-MandAData -Data $allGraphData.DirectoryRoles -FileName "GraphDirectoryRoles" -Configuration $Configuration }
        
        Write-MandALog "Microsoft Graph Discovery Phase completed successfully." -Level "SUCCESS" -Configuration $Configuration
    } catch {
        Write-MandALog "Microsoft Graph Discovery Phase failed: $($_.Exception.Message)" -Level "ERROR" -Configuration $Configuration
    } finally {
        if (Get-Command Complete-Progress -ErrorAction SilentlyContinue) {
            Complete-Progress -Configuration $Configuration 
        }
    }

    return $allGraphData
}

#endregion Main Orchestration Function

# Export public functions
Export-ModuleMember -Function @(
    'Invoke-GraphDiscovery',
    'Get-GraphUsersData',
    'Get-GraphGroupsData',
    'Get-GraphApplicationsData',
    'Get-GraphServicePrincipalsData',
    'Get-GraphDirectoryRolesData'
)

if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
    Write-MandALog "GraphDiscovery.psm1 module loaded." -Level "DEBUG" # Use config if available
} else {
    Write-Host "GraphDiscovery.psm1 module loaded (Write-MandALog not found)." # Fallback for standalone testing
}

