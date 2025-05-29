<#
.SYNOPSIS
    External identities discovery for M&A Discovery Suite
.DESCRIPTION
    Discovers B2B guest users, collaboration settings, external identity providers, and partner organizations
#>

# Modules/Discovery/ExternalIdentityDiscovery.psm1

function Invoke-ExternalIdentityDiscovery {
    param([hashtable]$Configuration)

    try {
        Write-MandALog "Starting External Identity discovery" -Level "HEADER"

        $outputPath = $Configuration.environment.outputPath
        $rawPath = Join-Path $outputPath "Raw"

        $discoveryResults = @{}

        # Verify Graph connection
        $context = Get-MgContext -ErrorAction SilentlyContinue
        if (-not $context) {
            Write-MandALog "Microsoft Graph not connected. Skipping external identity discovery." -Level "WARN"
            return @{}
        }

        # B2B Guest Users
        Write-MandALog "Discovering B2B guest users..." -Level "INFO"
        $discoveryResults.B2BGuests = Get-B2BGuestUsersData -OutputPath $rawPath -Configuration $Configuration

        # External Collaboration Settings
        Write-MandALog "Discovering external collaboration settings..." -Level "INFO"
        $discoveryResults.CollaborationSettings = Get-ExternalCollaborationSettingsData -OutputPath $rawPath -Configuration $Configuration

        # Guest User Activity
        Write-MandALog "Analyzing guest user activity..." -Level "INFO"
        $discoveryResults.GuestActivity = Get-GuestUserActivityData -OutputPath $rawPath -Configuration $Configuration -GuestUsers $discoveryResults.B2BGuests

        # Partner Organizations
        Write-MandALog "Discovering partner organizations..." -Level "INFO"
        $discoveryResults.PartnerOrganizations = Get-PartnerOrganizationsData -OutputPath $rawPath -Configuration $Configuration -GuestUsers $discoveryResults.B2BGuests

        # External Identity Providers
        Write-MandALog "Discovering external identity providers..." -Level "INFO"
        $discoveryResults.IdentityProviders = Get-ExternalIdentityProvidersData -OutputPath $rawPath -Configuration $Configuration

        # Guest Invitations
        Write-MandALog "Analyzing guest invitations..." -Level "INFO"
        $discoveryResults.GuestInvitations = Get-GuestInvitationsData -OutputPath $rawPath -Configuration $Configuration

        # Cross-Tenant Access
        Write-MandALog "Discovering cross-tenant access settings..." -Level "INFO"
        $discoveryResults.CrossTenantAccess = Get-CrossTenantAccessData -OutputPath $rawPath -Configuration $Configuration

        Write-MandALog "External Identity discovery completed successfully" -Level "SUCCESS"
        return $discoveryResults

    } catch {
        Write-MandALog "External Identity discovery failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Get-B2BGuestUsersData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )

    $outputFile = Join-Path $OutputPath "B2BGuestUsers.csv"
    $guestData = [System.Collections.Generic.List[PSCustomObject]]::new()

    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "B2B guest users CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }

    try {
        Write-MandALog "Retrieving B2B guest users..." -Level "INFO"

        # Get all guest users with extended properties
        $guestUsers = Get-MgUser -All -Filter "userType eq 'Guest'" -Property * -ExpandProperty "memberOf"

        Write-MandALog "Found $($guestUsers.Count) guest users" -Level "SUCCESS"

        $processedCount = 0
        foreach ($guest in $guestUsers) {
            $processedCount++
            if ($processedCount % 50 -eq 0) {
                Write-Progress -Activity "Processing Guest Users" -Status "Guest $processedCount of $($guestUsers.Count)" -PercentComplete (($processedCount / $guestUsers.Count) * 100)
            }

            # Get invitation details if available
            $invitationStatus = "Unknown"
            $invitedBy = "Unknown"
            $invitationDate = $null

            if ($guest.ExternalUserState) {
                $invitationStatus = $guest.ExternalUserState
                $invitationDate = $guest.ExternalUserStateChangeDateTime
            }

            # Get group memberships
            $groupMemberships = @()
            if ($guest.MemberOf) {
                $groupMemberships = $guest.MemberOf | Where-Object { $_.'@odata.type' -eq '#microsoft.graph.group' } |
                    ForEach-Object { $_.AdditionalProperties.displayName }
            }

            # Get app role assignments
            $appRoleAssignments = Get-MgUserAppRoleAssignment -UserId $guest.Id -ErrorAction SilentlyContinue

            # Determine guest domain
            $guestDomain = if ($guest.Mail) {
                $guest.Mail.Split('@')[1]
            } elseif ($guest.UserPrincipalName -match '#EXT#@') {
                $guest.UserPrincipalName.Split('@')[0].Split('_')[-1]
            } else {
                "Unknown"
            }

            $guestData.Add([PSCustomObject]@{
                GuestId = $guest.Id
                UserPrincipalName = $guest.UserPrincipalName
                DisplayName = $guest.DisplayName
                Mail = $guest.Mail
                GuestDomain = $guestDomain
                CreationType = $guest.CreationType
                UserType = $guest.UserType
                AccountEnabled = $guest.AccountEnabled
                ExternalUserState = $guest.ExternalUserState
                ExternalUserStateChangeDateTime = $guest.ExternalUserStateChangeDateTime
                CreatedDateTime = $guest.CreatedDateTime
                CompanyName = $guest.CompanyName
                Department = $guest.Department
                JobTitle = $guest.JobTitle
                UsageLocation = $guest.UsageLocation
                PreferredLanguage = $guest.PreferredLanguage
                GroupMembershipCount = $groupMemberships.Count
                GroupMemberships = ($groupMemberships -join ";")
                AppRoleAssignmentCount = ($appRoleAssignments | Measure-Object).Count
                LastSignInDateTime = if ($guest.SignInActivity) { $guest.SignInActivity.LastSignInDateTime } else { $null }
                LastNonInteractiveSignInDateTime = if ($guest.SignInActivity) { $guest.SignInActivity.LastNonInteractiveSignInDateTime } else { $null }
                RiskLevel = if ($guest.AdditionalProperties.riskLevel) { $guest.AdditionalProperties.riskLevel } else { "Unknown" }
                RiskState = if ($guest.AdditionalProperties.riskState) { $guest.AdditionalProperties.riskState } else { "Unknown" }
                RefreshTokensValidFromDateTime = $guest.RefreshTokensValidFromDateTime
            })
        }

        Write-Progress -Activity "Processing Guest Users" -Completed

        # Export to CSV
        Export-DataToCSV -Data $guestData -FilePath $outputFile

        return $guestData

    } catch {
        Write-MandALog "Error retrieving B2B guest users: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-ExternalCollaborationSettingsData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )

    $outputFile = Join-Path $OutputPath "ExternalCollaborationSettings.csv"
    $settingsData = [System.Collections.Generic.List[PSCustomObject]]::new()

    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "External collaboration settings CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }

    try {
        Write-MandALog "Retrieving external collaboration settings..." -Level "INFO"

        # Get authorization policy (B2B settings)
        $authPolicy = Get-MgPolicyAuthorizationPolicy

        # Get B2B management policy
        $b2bPolicy = Get-MgPolicyB2BManagementPolicy -ErrorAction SilentlyContinue

        # Get guest invite settings
        $guestInviteSettings = $authPolicy.DefaultUserRolePermissions

        $settingsData.Add([PSCustomObject]@{
            SettingCategory = "Guest User Permissions"
            SettingName = "AllowInviteGuests"
            SettingValue = $guestInviteSettings.AllowedToCreateApps
            Description = "Controls whether users can invite guest users"
            Impact = "Determines who can add external users to the tenant"
            Recommendation = if ($guestInviteSettings.AllowedToCreateApps) {
                "Review and restrict if needed"
            } else {
                "Current setting is restrictive"
            }
        })

        $settingsData.Add([PSCustomObject]@{
            SettingCategory = "Guest User Permissions"
            SettingName = "GuestUserRoleId"
            SettingValue = $authPolicy.GuestUserRoleId
            Description = "Default role assigned to guest users"
            Impact = "Determines default permissions for guest users"
            Recommendation = "Ensure guest users have minimal required permissions"
        })

        $settingsData.Add([PSCustomObject]@{
            SettingCategory = "Guest Access"
            SettingName = "AllowedToReadOtherUsers"
            SettingValue = $guestInviteSettings.AllowedToReadOtherUsers
            Description = "Controls whether guests can read other users"
            Impact = "Affects guest visibility of directory information"
            Recommendation = if ($guestInviteSettings.AllowedToReadOtherUsers) {
                "Consider restricting for enhanced privacy"
            } else {
                "Good security practice"
            }
        })

        # Get SharePoint external sharing settings if available
        try {
            $tenant = Get-SPOTenant -ErrorAction SilentlyContinue
            if ($tenant) {
                $settingsData.Add([PSCustomObject]@{
                    SettingCategory = "SharePoint External Sharing"
                    SettingName = "SharingCapability"
                    SettingValue = $tenant.SharingCapability
                    Description = "SharePoint and OneDrive external sharing level"
                    Impact = "Controls external sharing for all sites"
                    Recommendation = switch ($tenant.SharingCapability) {
                        "ExternalUserAndGuestSharing" { "Very permissive - review security requirements" }
                        "ExternalUserSharingOnly" { "Moderate - ensure proper governance" }
                        "ExistingExternalUserSharingOnly" { "Restrictive - good security practice" }
                        "Disabled" { "Most restrictive - may impact collaboration" }
                        default { "Review current setting" }
                    }
                })

                $settingsData.Add([PSCustomObject]@{
                    SettingCategory = "SharePoint External Sharing"
                    SettingName = "RequireAcceptingUserToMatchInvitedUserAccount"
                    SettingValue = $tenant.RequireAcceptingUserToMatchInvitedUserAccount
                    Description = "Requires invitation recipient to match invited email"
                    Impact = "Prevents sharing invitation hijacking"
                    Recommendation = if ($tenant.RequireAcceptingUserToMatchInvitedUserAccount) {
                        "Good security practice"
                    } else {
                        "Enable for better security"
                    }
                })
            }
        } catch {
            Write-MandALog "Could not retrieve SharePoint settings: $($_.Exception.Message)" -Level "WARN"
        }

        # Get Teams external access settings if available
        try {
            $teamsConfig = Get-CsTenantFederationConfiguration -ErrorAction SilentlyContinue
            if ($teamsConfig) {
                $settingsData.Add([PSCustomObject]@{
                    SettingCategory = "Teams External Access"
                    SettingName = "AllowFederatedUsers"
                    SettingValue = $teamsConfig.AllowFederatedUsers
                    Description = "Allows external Teams users to communicate"
                    Impact = "Controls Teams federation with other organizations"
                    Recommendation = if ($teamsConfig.AllowFederatedUsers) {
                        "Review allowed/blocked domains"
                    } else {
                        "Restrictive - may limit collaboration"
                    }
                })

                $settingsData.Add([PSCustomObject]@{
                    SettingCategory = "Teams External Access"
                    SettingName = "AllowPublicUsers"
                    SettingValue = $teamsConfig.AllowPublicUsers
                    Description = "Allows Skype consumer users to communicate"
                    Impact = "Controls communication with consumer Skype users"
                    Recommendation = if ($teamsConfig.AllowPublicUsers) {
                        "Consider disabling unless required"
                    } else {
                        "Good security practice"
                    }
                })
            }
        } catch {
            Write-MandALog "Could not retrieve Teams settings: $($_.Exception.Message)" -Level "WARN"
        }

        Write-MandALog "Retrieved external collaboration settings" -Level "SUCCESS"

        # Export to CSV
        Export-DataToCSV -Data $settingsData -FilePath $outputFile

        return $settingsData

    } catch {
        Write-MandALog "Error retrieving external collaboration settings: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-GuestUserActivityData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration,
        [array]$GuestUsers
    )

    $outputFile = Join-Path $OutputPath "GuestUserActivity.csv"
    $activityData = [System.Collections.Generic.List[PSCustomObject]]::new()

    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Guest user activity CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }

    try {
        Write-MandALog "Analyzing guest user activity..." -Level "INFO"

        # Analyze guest users by activity status
        $activeGuests = $GuestUsers | Where-Object {
            $_.AccountEnabled -and $_.LastSignInDateTime -and
            ([DateTime]$_.LastSignInDateTime -gt (Get-Date).AddDays(-90))
        }

        $inactiveGuests = $GuestUsers | Where-Object {
            $_.AccountEnabled -and (
                -not $_.LastSignInDateTime -or
                [DateTime]$_.LastSignInDateTime -lt (Get-Date).AddDays(-90)
            )
        }

        $disabledGuests = $GuestUsers | Where-Object { -not $_.AccountEnabled }

        $neverSignedInGuests = $GuestUsers | Where-Object {
            $_.AccountEnabled -and -not $_.LastSignInDateTime
        }

        # Summary statistics
        $activityData.Add([PSCustomObject]@{
            Category = "Summary"
            Metric = "Total Guest Users"
            Count = $GuestUsers.Count
            Percentage = 100
            AverageAge = "N/A"
            Details = "All external guest users in the tenant"
        })

        $activityData.Add([PSCustomObject]@{
            Category = "Summary"
            Metric = "Active Guests (90 days)"
            Count = $activeGuests.Count
            Percentage = if ($GuestUsers.Count -gt 0) {
                [math]::Round(($activeGuests.Count / $GuestUsers.Count) * 100, 2)
            } else { 0 }
            AverageAge = "N/A"
            Details = "Guests who signed in within last 90 days"
        })

        $activityData.Add([PSCustomObject]@{
            Category = "Summary"
            Metric = "Inactive Guests (90+ days)"
            Count = $inactiveGuests.Count
            Percentage = if ($GuestUsers.Count -gt 0) {
                [math]::Round(($inactiveGuests.Count / $GuestUsers.Count) * 100, 2)
            } else { 0 }
            AverageAge = "N/A"
            Details = "Guests who haven't signed in for 90+ days"
        })

        $activityData.Add([PSCustomObject]@{
            Category = "Summary"
            Metric = "Never Signed In"
            Count = $neverSignedInGuests.Count
            Percentage = if ($GuestUsers.Count -gt 0) {
                [math]::Round(($neverSignedInGuests.Count / $GuestUsers.Count) * 100, 2)
            } else { 0 }
            AverageAge = "N/A"
            Details = "Guests who have never signed in"
        })

        $activityData.Add([PSCustomObject]@{
            Category = "Summary"
            Metric = "Disabled Guests"
            Count = $disabledGuests.Count
            Percentage = if ($GuestUsers.Count -gt 0) {
                [math]::Round(($disabledGuests.Count / $GuestUsers.Count) * 100, 2)
            } else { 0 }
            AverageAge = "N/A"
            Details = "Guest accounts that are disabled"
        })

        # Analyze by guest domain
        $guestDomains = $GuestUsers | Group-Object -Property GuestDomain | Sort-Object Count -Descending

        foreach ($domain in $guestDomains | Select-Object -First 10) {
            $domainActiveCount = ($domain.Group | Where-Object {
                $_.AccountEnabled -and $_.LastSignInDateTime -and
                ([DateTime]$_.LastSignInDateTime -gt (Get-Date).AddDays(-90))
            }).Count

            $activityData.Add([PSCustomObject]@{
                Category = "By Domain"
                Metric = $domain.Name
                Count = $domain.Count
                Percentage = if ($GuestUsers.Count -gt 0) {
                    [math]::Round(($domain.Count / $GuestUsers.Count) * 100, 2)
                } else { 0 }
                AverageAge = "N/A"
                Details = "Active: $domainActiveCount of $($domain.Count)"
            })
        }

        # Analyze by invitation age
        $guestsByAge = @{
            "Last30Days" = 0
            "Last90Days" = 0
            "Last180Days" = 0
            "LastYear" = 0
            "OverYear" = 0
        }

        foreach ($guest in $GuestUsers) {
            if ($guest.CreatedDateTime) {
                $age = (Get-Date) - [DateTime]$guest.CreatedDateTime

                if ($age.Days -le 30) { $guestsByAge["Last30Days"]++ }
                elseif ($age.Days -le 90) { $guestsByAge["Last90Days"]++ }
                elseif ($age.Days -le 180) { $guestsByAge["Last180Days"]++ }
                elseif ($age.Days -le 365) { $guestsByAge["LastYear"]++ }
                else { $guestsByAge["OverYear"]++ }
            }
        }

        foreach ($ageGroup in $guestsByAge.GetEnumerator()) {
            $activityData.Add([PSCustomObject]@{
                Category = "By Invitation Age"
                Metric = $ageGroup.Key
                Count = $ageGroup.Value
                Percentage = if ($GuestUsers.Count -gt 0) {
                    [math]::Round(($ageGroup.Value / $GuestUsers.Count) * 100, 2)
                } else { 0 }
                AverageAge = "N/A"
                Details = "Guests invited in this time period"
            })
        }

        Write-MandALog "Completed guest user activity analysis" -Level "SUCCESS"

        # Export to CSV
        Export-DataToCSV -Data $activityData -FilePath $outputFile

        return $activityData

    } catch {
        Write-MandALog "Error analyzing guest user activity: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-PartnerOrganizationsData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration,
        [array]$GuestUsers
    )

    $outputFile = Join-Path $OutputPath "PartnerOrganizations.csv"
    $partnerData = [System.Collections.Generic.List[PSCustomObject]]::new()

    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Partner organizations CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }

    try {
        Write-MandALog "Analyzing partner organizations..." -Level "INFO"

        # Group guests by domain
        $partnerDomains = $GuestUsers | Group-Object -Property GuestDomain |
            Where-Object { $_.Name -ne "Unknown" } |
            Sort-Object Count -Descending

        foreach ($partner in $partnerDomains) {
            $partnerGuests = $partner.Group

            # Calculate statistics
            $activeCount = ($partnerGuests | Where-Object {
                $_.AccountEnabled -and $_.LastSignInDateTime -and
                ([DateTime]$_.LastSignInDateTime -gt (Get-Date).AddDays(-90))
            }).Count

            $inactiveCount = ($partnerGuests | Where-Object {
                $_.AccountEnabled -and (
                    -not $_.LastSignInDateTime -or
                    [DateTime]$_.LastSignInDateTime -lt (Get-Date).AddDays(-90)
                )
            }).Count

            $disabledCount = ($partnerGuests | Where-Object { -not $_.AccountEnabled }).Count

            # Get unique departments and job titles
            $departments = $partnerGuests | Where-Object { $_.Department } |
                Select-Object -ExpandProperty Department -Unique

            $jobTitles = $partnerGuests | Where-Object { $_.JobTitle } |
                Select-Object -ExpandProperty JobTitle -Unique

            # Get group memberships
            $allGroups = @()
            foreach ($guest in $partnerGuests) {
                if ($guest.GroupMemberships) {
                    $allGroups += $guest.GroupMemberships -split ';'
                }
            }
            $uniqueGroups = $allGroups | Select-Object -Unique

            # Determine partner type based on domain
            $partnerType = "External Partner"
            if ($partner.Name -match '\.(edu|ac\.|university\.)') {
                $partnerType = "Educational Institution"
            } elseif ($partner.Name -match '\.(gov|mil)$') {
                $partnerType = "Government"
            } elseif ($partner.Name -match '(gmail|yahoo|hotmail|outlook|live)\.com$') {
                $partnerType = "Consumer Email"
            }

            # Risk assessment
            $riskLevel = "Low"
            $riskFactors = @()

            if ($partnerType -eq "Consumer Email") {
                $riskLevel = "Medium"
                $riskFactors += "Consumer email domain"
            }

            if ($inactiveCount -gt ($partnerGuests.Count * 0.5)) {
                $riskLevel = "Medium"
                $riskFactors += "High percentage of inactive users"
            }

            if ($partnerGuests.Count -eq 1 -and $partnerType -ne "Consumer Email") {
                $riskFactors += "Single user from organization"
            }

            $partnerData.Add([PSCustomObject]@{
                PartnerDomain = $partner.Name
                PartnerType = $partnerType
                TotalGuests = $partnerGuests.Count
                ActiveGuests = $activeCount
                InactiveGuests = $inactiveCount
                DisabledGuests = $disabledCount
                ActivityRate = if ($partnerGuests.Count -gt 0) {
                    [math]::Round(($activeCount / $partnerGuests.Count) * 100, 2)
                } else { 0 }
                UniqueDepartments = $departments.Count
                Departments = ($departments -join ";")
                UniqueJobTitles = $jobTitles.Count
                TopJobTitles = (($jobTitles | Select-Object -First 5) -join ";")
                UniqueGroupMemberships = $uniqueGroups.Count
                TopGroups = (($uniqueGroups | Select-Object -First 5) -join ";")
                OldestGuestDate = ($partnerGuests.CreatedDateTime | Measure-Object -Minimum).Minimum
                NewestGuestDate = ($partnerGuests.CreatedDateTime | Measure-Object -Maximum).Maximum
                RiskLevel = $riskLevel
                RiskFactors = ($riskFactors -join ";")
            })
        }

        Write-MandALog "Analyzed $($partnerData.Count) partner organizations" -Level "SUCCESS"

        # Export to CSV
        Export-DataToCSV -Data $partnerData -FilePath $outputFile

        return $partnerData

    } catch {
        Write-MandALog "Error analyzing partner organizations: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-ExternalIdentityProvidersData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )

    $outputFile = Join-Path $OutputPath "ExternalIdentityProviders.csv"
    $providerData = [System.Collections.Generic.List[PSCustomObject]]::new()

    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "External identity providers CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }

    try {
        Write-MandALog "Retrieving external identity providers..." -Level "INFO"

        # Get identity providers
        $identityProviders = Get-MgIdentityProvider -ErrorAction SilentlyContinue

        if ($identityProviders) {
            foreach ($provider in $identityProviders) {
                $providerData.Add([PSCustomObject]@{
                    ProviderId = $provider.Id
                    ProviderType = $provider.Type
                    DisplayName = $provider.DisplayName
                    ClientId = if ($provider.ClientId) { "Configured" } else { "Not Configured" }
                    ClientSecretConfigured = if ($provider.ClientSecret) { "Yes" } else { "No" }
                    Enabled = $true
                    CreatedDateTime = $provider.AdditionalProperties.createdDateTime
                    ModifiedDateTime = $provider.AdditionalProperties.modifiedDateTime
                    Status = "Active"
                    Notes = "External identity provider configuration"
                })
            }
        }

        # Check for Azure AD B2B direct federation
        try {
            $b2bPolicy = Get-MgPolicyB2BManagementPolicy -ErrorAction SilentlyContinue
            if ($b2bPolicy) {
                $providerData.Add([PSCustomObject]@{
                    ProviderId = "B2B-DirectFederation"
                    ProviderType = "AzureADB2B"
                    DisplayName = "Azure AD B2B Direct Federation"
                    ClientId = "N/A"
                    ClientSecretConfigured = "N/A"
                    Enabled = $true
                    CreatedDateTime = $null
                    ModifiedDateTime = $null
                    Status = "Active"
                    Notes = "Built-in Azure AD B2B federation"
                })
            }
        } catch {
            Write-MandALog "Could not retrieve B2B policy: $($_.Exception.Message)" -Level "WARN"
        }

        # Add default Azure AD provider
        $providerData.Add([PSCustomObject]@{
            ProviderId = "AzureAD-Default"
            ProviderType = "AzureActiveDirectory"
            DisplayName = "Azure Active Directory"
            ClientId = "N/A"
            ClientSecretConfigured = "N/A"
            Enabled = $true
            CreatedDateTime = $null
            ModifiedDateTime = $null
            Status = "Active"
            Notes = "Default identity provider for the tenant"
        })

        # Check for social identity providers if B2C is configured
        # This would require additional permissions and B2C configuration

        Write-MandALog "Retrieved $($providerData.Count) identity providers" -Level "SUCCESS"

        # Export to CSV
        Export-DataToCSV -Data $providerData -FilePath $outputFile

        return $providerData

    } catch {
        Write-MandALog "Error retrieving external identity providers: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-GuestInvitationsData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )

    $outputFile = Join-Path $OutputPath "GuestInvitations.csv"
    $invitationData = [System.Collections.Generic.List[PSCustomObject]]::new()

    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Guest invitations CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }

    try {
        Write-MandALog "Analyzing guest invitations..." -Level "INFO"

        # Get recent invitations from audit logs if available
        # Note: This requires AuditLog.Read.All permission
        try {
            $startDate = (Get-Date).AddDays(-90).ToString("yyyy-MM-dd")
            $auditLogs = Get-MgAuditLogDirectoryAudit -Filter "activityDateTime ge $startDate and activityDisplayName eq 'Invite external user'" -Top 100 -ErrorAction SilentlyContinue

            foreach ($log in $auditLogs) {
                $invitedUser = $log.TargetResources | Where-Object { $_.'@odata.type' -eq '#microsoft.graph.user' } | Select-Object -First 1
                $invitedBy = $log.InitiatedBy.User

                if ($invitedUser -and $invitedBy) {
                    $invitationData.Add([PSCustomObject]@{
                        InvitationDate = $log.ActivityDateTime
                        InvitedUserEmail = $invitedUser.UserPrincipalName
                        InvitedUserDisplayName = $invitedUser.DisplayName
                        InvitedById = $invitedBy.Id
                        InvitedByUPN = $invitedBy.UserPrincipalName
                        InvitedByDisplayName = $invitedBy.DisplayName
                        InvitationResult = $log.Result
                        ActivityId = $log.Id
                        CorrelationId = $log.CorrelationId
                        InvitationMethod = "AuditLog"
                    })
                }
            }

            Write-MandALog "Retrieved $($invitationData.Count) recent invitations from audit logs" -Level "INFO"

        } catch {
            Write-MandALog "Could not retrieve invitation audit logs: $($_.Exception.Message)" -Level "WARN"
        }

        # If no audit log data, create summary from existing guest users
        if ($invitationData.Count -eq 0) {
            Write-MandALog "Creating invitation summary from existing guest data" -Level "INFO"

            # Get all guest users
            $guestUsers = Get-MgUser -Filter "userType eq 'Guest'" -Top 20 -OrderBy "createdDateTime desc"

            foreach ($guest in $guestUsers) {
                $invitationData.Add([PSCustomObject]@{
                    InvitationDate = $guest.CreatedDateTime
                    InvitedUserEmail = $guest.Mail
                    InvitedUserDisplayName = $guest.DisplayName
                    InvitedById = "Unknown"
                    InvitedByUPN = "Unknown"
                    InvitedByDisplayName = "Unknown"
                    InvitationResult = if ($guest.ExternalUserState -eq "Accepted") { "Success" } else { $guest.ExternalUserState }
                    ActivityId = $guest.Id
                    CorrelationId = "N/A"
                    InvitationMethod = "UserData"
                })
            }
        }

        Write-MandALog "Processed guest invitation data" -Level "SUCCESS"

        # Export to CSV
        Export-DataToCSV -Data $invitationData -FilePath $outputFile

        return $invitationData

    } catch {
        Write-MandALog "Error analyzing guest invitations: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-CrossTenantAccessData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )

    $outputFile = Join-Path $OutputPath "CrossTenantAccess.csv"
    $accessData = [System.Collections.Generic.List[PSCustomObject]]::new()

    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Cross-tenant access CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }

    try {
        Write-MandALog "Retrieving cross-tenant access settings..." -Level "INFO"

        # Get cross-tenant access policy
        try {
            $crossTenantPolicy = Invoke-MgGraphRequest -Uri "https://graph.microsoft.com/beta/policies/crossTenantAccessPolicy" -Method GET -ErrorAction SilentlyContinue

            if ($crossTenantPolicy) {
                # Default settings
                $defaultSettings = $crossTenantPolicy.default

                $accessData.Add([PSCustomObject]@{
                    PolicyType = "Default"
                    TenantId = "All Tenants"
                    TenantName = "Default Configuration"
                    B2BCollaborationInbound = $defaultSettings.b2bCollaborationInbound.usersAndGroups.accessType
                    B2BCollaborationOutbound = $defaultSettings.b2bCollaborationOutbound.usersAndGroups.accessType
                    B2BDirectConnectInbound = $defaultSettings.b2bDirectConnectInbound.usersAndGroups.accessType
                    B2BDirectConnectOutbound = $defaultSettings.b2bDirectConnectOutbound.usersAndGroups.accessType
                    InboundTrust_MfaEnabled = $defaultSettings.b2bCollaborationInbound.mfa.accepted
                    InboundTrust_CompliantDeviceEnabled = $defaultSettings.b2bCollaborationInbound.compliantDevice.accepted
                    InboundTrust_HybridJoinedEnabled = $defaultSettings.b2bCollaborationInbound.hybridAzureADJoinedDevice.accepted
                })

                # Partner-specific settings
                $partners = $crossTenantPolicy.partners
                if ($partners) {
                    foreach ($partner in $partners) {
                         $accessData.Add([PSCustomObject]@{
                            PolicyType = "Partner"
                            TenantId = $partner.tenantId
                            TenantName = "Partner Configuration"
                            B2BCollaborationInbound = $partner.b2bCollaborationInbound.usersAndGroups.accessType
                            B2BCollaborationOutbound = $partner.b2bCollaborationOutbound.usersAndGroups.accessType
                            B2BDirectConnectInbound = $partner.b2bDirectConnectInbound.usersAndGroups.accessType
                            B2BDirectConnectOutbound = $partner.b2bDirectConnectOutbound.usersAndGroups.accessType
                            InboundTrust_MfaEnabled = $partner.b2bCollaborationInbound.mfa.accepted
                            InboundTrust_CompliantDeviceEnabled = $partner.b2bCollaborationInbound.compliantDevice.accepted
                            InboundTrust_HybridJoinedEnabled = $partner.b2bCollaborationInbound.hybridAzureADJoinedDevice.accepted
                        })
                    }
                }
            }
        } catch {
            Write-MandALog "Could not retrieve cross-tenant access policy: $($_.Exception.Message)" -Level "WARN"
        }

        Write-MandALog "Retrieved cross-tenant access settings" -Level "SUCCESS"

        # Export to CSV
        Export-DataToCSV -Data $accessData -FilePath $outputFile

        return $accessData

    } catch {
        Write-MandALog "Error retrieving cross-tenant access settings: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}
