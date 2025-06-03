#Requires -Modules Microsoft.Graph.Authentication, Microsoft.Graph.Users, Microsoft.Graph.Identity.SignIns, Microsoft.Graph.Identity.DirectoryManagement, Microsoft.Graph.Applications
<#
.SYNOPSIS
    Enhanced External Identity Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers B2B guest users, collaboration settings, external identity providers, 
    and partner organizations with improved performance and error handling
.NOTES
    Author: M&A Discovery Suite
    Version: 2.0.0
    Last Modified: 2024-01-20
#>

# Import base module
$baseModule = Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\DiscoveryModuleBase.psm1"
if (Test-Path $baseModule) {
    Import-Module $baseModule -Force
}

# Module-specific circuit breakers
$script:GraphCircuitBreaker = [CircuitBreaker]::new("MicrosoftGraph")
$script:PerformanceTracker = $null

function Invoke-ExternalIdentityDiscovery {
    [CmdletBinding()]
    [OutputType([hashtable])]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$true)]
        [MandAContext]$Context
    )
    
    $discoveryScript = {
        # Initialize performance tracking
        $script:PerformanceTracker = [DiscoveryPerformanceTracker]::new()
        
        # Check Graph connection
        $graphContext = Get-MgContext -ErrorAction SilentlyContinue
        if ($null -eq $graphContext) {
            throw "Microsoft Graph not connected. Please authenticate first."
        }
        
        Write-MandALog "Graph context active. Tenant: $($graphContext.TenantId)" -Level "INFO" -Context $Context
        
        # Get configuration values
        $config = Get-ExternalIdentityConfig -Configuration $Configuration
        
        # Initialize results
        $results = @{}
        
        # 1. Discover B2B Guest Users
        $script:PerformanceTracker.StartOperation("B2BGuestUsers")
        $results.B2BGuests = Get-B2BGuestUsersEnhanced -Configuration $config -Context $Context
        $script:PerformanceTracker.EndOperation("B2BGuestUsers", $results.B2BGuests.Count)
        
        # 2. Get External Collaboration Settings
        $script:PerformanceTracker.StartOperation("CollaborationSettings")
        $results.CollaborationSettings = Get-ExternalCollaborationSettingsEnhanced -Configuration $config -Context $Context
        $script:PerformanceTracker.EndOperation("CollaborationSettings", $results.CollaborationSettings.Count)
        
        # 3. Analyze Guest Activity
        if ($results.B2BGuests.Count -gt 0) {
            $script:PerformanceTracker.StartOperation("GuestActivity")
            $results.GuestActivity = Get-GuestUserActivityEnhanced -GuestUsers $results.B2BGuests -Configuration $config -Context $Context
            $script:PerformanceTracker.EndOperation("GuestActivity", $results.GuestActivity.Count)
        }
        
        # 4. Analyze Partner Organizations
        if ($results.B2BGuests.Count -gt 0) {
            $script:PerformanceTracker.StartOperation("PartnerOrganizations")
            $results.PartnerOrganizations = Get-PartnerOrganizationsEnhanced -GuestUsers $results.B2BGuests -Configuration $config -Context $Context
            $script:PerformanceTracker.EndOperation("PartnerOrganizations", $results.PartnerOrganizations.Count)
        }
        
        # 5. Get External Identity Providers
        $script:PerformanceTracker.StartOperation("IdentityProviders")
        $results.IdentityProviders = Get-ExternalIdentityProvidersEnhanced -Configuration $config -Context $Context
        $script:PerformanceTracker.EndOperation("IdentityProviders", $results.IdentityProviders.Count)
        
        # 6. Analyze Guest Invitations
        $script:PerformanceTracker.StartOperation("GuestInvitations")
        $results.GuestInvitations = Get-GuestInvitationsEnhanced -Configuration $config -Context $Context -GuestUsers $results.B2BGuests
        $script:PerformanceTracker.EndOperation("GuestInvitations", $results.GuestInvitations.Count)
        
        # 7. Get Cross-Tenant Access Policy
        $script:PerformanceTracker.StartOperation("CrossTenantAccess")
        $results.CrossTenantAccess = Get-CrossTenantAccessEnhanced -Configuration $config -Context $Context
        $script:PerformanceTracker.EndOperation("CrossTenantAccess")
        
        # Return flattened data for base module to handle
        return Convert-ToFlattenedData -Results $results
    }
    
    # Use base discovery function
    return Invoke-BaseDiscovery -ModuleName "ExternalIdentity" `
                               -DiscoveryScript $discoveryScript `
                               -Configuration $Configuration `
                               -Context $Context `
                               -RequiredPermissions @('User.Read.All', 'Policy.Read.All', 'IdentityProvider.Read.All') `
                               -CircuitBreaker $script:GraphCircuitBreaker
}

function Get-ExternalIdentityConfig {
    param([hashtable]$Configuration)
    
    # Extract and validate configuration with defaults
    $config = @{
        GetGuestAppRoleAssignments = $true
        CollectSharePointSettings = $false
        CollectTeamsSettings = $false
        TopPartnerDomainsToAnalyze = 10
        RecentGuestCountForInvitationFallback = 50
        BatchSize = 999
        MaxDegreeOfParallelism = 5
        GuestActivityDays = 90
        IncludeDetailedPermissions = $true
    }
    
    # Override with actual config if present
    if ($Configuration.discovery.externalIdentity) {
        $extConfig = $Configuration.discovery.externalIdentity
        foreach ($key in $config.Keys) {
            if ($extConfig.ContainsKey($key)) {
                $config[$key] = $extConfig[$key]
            }
        }
    }
    
    # Override with Graph API settings
    if ($Configuration.graphAPI) {
        if ($Configuration.graphAPI.pageSize) {
            $config.BatchSize = [Math]::Min($Configuration.graphAPI.pageSize, 999)
        }
    }
    
    return $config
}

function Get-B2BGuestUsersEnhanced {
    param(
        [hashtable]$Configuration,
        [MandAContext]$Context
    )
    
    $guestDataList = [System.Collections.Generic.List[PSObject]]::new()
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        Write-MandALog "Retrieving B2B guest users with batch size $($Configuration.BatchSize)..." -Level "INFO" -Context $Context
        
        # Define properties to retrieve
        $propertiesToSelect = @(
            "id", "userPrincipalName", "displayName", "mail", "userType", "externalUserState",
            "externalUserStateChangeDateTime", "createdDateTime", "creationType", "accountEnabled",
            "companyName", "department", "jobTitle", "usageLocation", "preferredLanguage",
            "refreshTokensValidFromDateTime", "onPremisesSyncEnabled", "proxyAddresses"
        )
        
        # Use batch processing for large tenants
        $guests = Get-GraphDataInBatches -Entity "users" `
                                        -Filter "userType eq 'Guest'" `
                                        -Select $propertiesToSelect `
                                        -ExpandProperty "signInActivity" `
                                        -BatchSize $Configuration.BatchSize `
                                        -Context $Context
        
        if ($null -eq $guests -or $guests.Count -eq 0) {
            Write-MandALog "No guest users found in the tenant." -Level "INFO" -Context $Context
            return $guestDataList
        }
        
        Write-MandALog "Processing $($guests.Count) guest users..." -Level "INFO" -Context $Context
        
        # Process guests in parallel batches for app role assignments
        $guestBatches = Split-ArrayIntoBatches -Array $guests -BatchSize 50
        $batchCount = 0
        
        foreach ($batch in $guestBatches) {
            $batchCount++
            Write-Progress -Activity "Processing Guest Users" `
                          -Status "Batch $batchCount of $($guestBatches.Count)" `
                          -PercentComplete (($batchCount / $guestBatches.Count) * 100) `
                          -Id 1
            
            # Process batch in parallel
            $batchResults = $batch | ForEach-Object -Parallel {
                $guest = $_
                $config = $using:Configuration
                $context = $using:Context
                
                # Extract guest domain
                $guestDomain = Get-GuestDomain -Guest $guest
                
                # Get app role assignments if configured
                $appRoleAssignmentsCount = 0
                $appRoleDetails = @()
                
                if ($config.GetGuestAppRoleAssignments) {
                    try {
                        $appRoles = Invoke-MgGraphRequest -Method GET `
                                                         -Uri "v1.0/users/$($guest.Id)/appRoleAssignments" `
                                                         -ErrorAction SilentlyContinue
                        
                        if ($appRoles.value) {
                            $appRoleAssignmentsCount = $appRoles.value.Count
                            $appRoleDetails = $appRoles.value | Select-Object -First 5 | ForEach-Object {
                                $_.resourceDisplayName
                            }
                        }
                    } catch {
                        # Log at debug level to avoid noise
                    }
                }
                
                # Create enhanced guest object
                [PSCustomObject]@{
                    GuestId = $guest.Id
                    UserPrincipalName = $guest.UserPrincipalName
                    DisplayName = $guest.DisplayName
                    Mail = $guest.Mail
                    GuestDomain = $guestDomain
                    CreationType = $guest.CreationType
                    UserType = $guest.UserType
                    AccountEnabled = $guest.AccountEnabled
                    ExternalUserState = if ($null -ne $guest.ExternalUserState) { $guest.ExternalUserState } else { "Unknown" }
                    ExternalUserStateChangeDateTime = $guest.ExternalUserStateChangeDateTime
                    CreatedDateTime = $guest.CreatedDateTime
                    CompanyName = $guest.CompanyName
                    Department = $guest.Department
                    JobTitle = $guest.JobTitle
                    UsageLocation = $guest.UsageLocation
                    PreferredLanguage = $guest.PreferredLanguage
                    AppRoleAssignmentCount = $appRoleAssignmentsCount
                    TopAppAssignments = ($appRoleDetails -join '; ')
                    LastSignInDateTime = if ($null -ne $guest.SignInActivity) { $guest.SignInActivity.LastSignInDateTime } else { $null }
                    LastNonInteractiveSignInDateTime = if ($null -ne $guest.SignInActivity) { $guest.SignInActivity.LastNonInteractiveSignInDateTime } else { $null }
                    RefreshTokensValidFromDateTime = $guest.RefreshTokensValidFromDateTime
                    OnPremisesSyncEnabled = $guest.OnPremisesSyncEnabled
                    ProxyAddresses = ($guest.ProxyAddresses -join '; ')
                    DaysSinceLastSignIn = if ($null -ne $guest.SignInActivity -and $null -ne $guest.SignInActivity.LastSignInDateTime) {
                        [Math]::Round(((Get-Date) - [DateTime]$guest.SignInActivity.LastSignInDateTime).TotalDays, 0)
                    } else { $null }
                    IsActive90Days = if ($null -ne $guest.SignInActivity -and $null -ne $guest.SignInActivity.LastSignInDateTime) {
                        [DateTime]$guest.SignInActivity.LastSignInDateTime -gt (Get-Date).AddDays(-90)
                    } else { $false }
                    _DataType = 'B2BGuestUsers'
                }
            } -ThrottleLimit $Configuration.MaxDegreeOfParallelism
            
            $guestDataList.AddRange($batchResults)
        }
        
        Write-Progress -Activity "Processing Guest Users" -Completed -Id 1
        
        $stopwatch.Stop()
        Write-MandALog "Processed $($guestDataList.Count) guest users in $($stopwatch.Elapsed.TotalSeconds) seconds" -Level "SUCCESS" -Context $Context
        
        # Add performance metrics
        if ($guestDataList.Count -gt 0) {
            $avgProcessingTime = $stopwatch.Elapsed.TotalMilliseconds / $guestDataList.Count
            Write-MandALog "Average processing time per guest: $([Math]::Round($avgProcessingTime, 2))ms" -Level "DEBUG" -Context $Context
        }
        
        return $guestDataList
        
    } catch {
        Write-MandALog "Error retrieving B2B guest users: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-ExternalCollaborationSettingsEnhanced {
    param(
        [hashtable]$Configuration,
        [MandAContext]$Context
    )
    
    $settingsData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    try {
        Write-MandALog "Retrieving external collaboration settings..." -Level "INFO" -Context $Context
        
        # 1. Get Authorization Policy Settings
        if (Get-Command Get-MgPolicyAuthorizationPolicy -ErrorAction SilentlyContinue) {
            try {
                $authPolicy = Invoke-DiscoveryWithRetry -ScriptBlock {
                    Get-MgPolicyAuthorizationPolicy -ErrorAction Stop
                } -OperationName "GetAuthorizationPolicy" -Context $Context -CircuitBreaker $script:GraphCircuitBreaker
                
                if ($authPolicy) {
                    $settingsData.Add([PSCustomObject]@{
                        SettingCategory = "Guest Permissions"
                        SettingName = "GuestUserRoleId"
                        SettingValue = $authPolicy.GuestUserRoleId
                        Description = "Default role assigned to guest users"
                        Source = "AuthorizationPolicy"
                        RetrievedAt = Get-Date
                        _DataType = 'ExternalCollaborationSettings'
                    })
                    
                    if ($authPolicy.DefaultUserRolePermissions) {
                        $perms = $authPolicy.DefaultUserRolePermissions
                        
                        $settingsData.Add([PSCustomObject]@{
                            SettingCategory = "Guest Permissions"
                            SettingName = "GuestsCanInvite"
                            SettingValue = $perms.AllowedToCreateApps
                            Description = "Whether guests can invite other guests"
                            Source = "AuthorizationPolicy"
                            RetrievedAt = Get-Date
                            _DataType = 'ExternalCollaborationSettings'
                        })
                    }
                }
            } catch {
                Write-MandALog "Could not retrieve authorization policy: $($_.Exception.Message)" -Level "WARN" -Context $Context
            }
        }
        
        # 2. Get B2B Collaboration Settings
        try {
            $b2bPolicy = Invoke-MgGraphRequest -Method GET -Uri "v1.0/policies/b2bCollaborationPolicy" -ErrorAction SilentlyContinue
            if ($b2bPolicy) {
                $settingsData.Add([PSCustomObject]@{
                    SettingCategory = "B2B Collaboration"
                    SettingName = "AllowedDomains"
                    SettingValue = ($b2bPolicy.allowedDomains -join '; ')
                    Description = "Domains allowed for B2B collaboration"
                    Source = "B2BCollaborationPolicy"
                    RetrievedAt = Get-Date
                    _DataType = 'ExternalCollaborationSettings'
                })
            }
        } catch {
            Write-MandALog "Could not retrieve B2B collaboration policy: $($_.Exception.Message)" -Level "DEBUG" -Context $Context
        }
        
        # 3. Get Conditional Access Policies affecting guests
        try {
            $caPolicies = Invoke-MgGraphRequest -Method GET -Uri "v1.0/identity/conditionalAccess/policies" -ErrorAction SilentlyContinue
            $guestPolicies = $caPolicies.value | Where-Object {
                $_.conditions.users.includeGuestsOrExternalUsers -or
                $_.conditions.users.includeUsers -contains 'GuestsOrExternalUsers'
            }
            
            if ($guestPolicies) {
                $settingsData.Add([PSCustomObject]@{
                    SettingCategory = "Conditional Access"
                    SettingName = "PoliciesTargetingGuests"
                    SettingValue = $guestPolicies.Count
                    Description = "Number of conditional access policies targeting guest users"
                    Source = "ConditionalAccessPolicies"
                    RetrievedAt = Get-Date
                    _DataType = 'ExternalCollaborationSettings'
                })
            }
        } catch {
            Write-MandALog "Could not retrieve conditional access policies: $($_.Exception.Message)" -Level "DEBUG" -Context $Context
        }
        
        # 4. SharePoint External Sharing (if configured and available)
        if ($Configuration.CollectSharePointSettings -and (Get-Command Get-SPOTenant -ErrorAction SilentlyContinue)) {
            try {
                $spoTenant = Get-SPOTenant -ErrorAction Stop
                
                $spoSettings = @(
                    @{Name = "SharingCapability"; Value = $spoTenant.SharingCapability; Desc = "Overall external sharing level"},
                    @{Name = "RequireAcceptingUserToMatchInvitedUser"; Value = $spoTenant.RequireAcceptingUserToMatchInvitedUser; Desc = "Require email match for sharing"},
                    @{Name = "DefaultSharingLinkType"; Value = $spoTenant.DefaultSharingLinkType; Desc = "Default link type for sharing"},
                    @{Name = "PreventExternalUsersFromResharing"; Value = $spoTenant.PreventExternalUsersFromResharing; Desc = "Prevent guests from resharing"}
                )
                
                foreach ($setting in $spoSettings) {
                    $settingsData.Add([PSCustomObject]@{
                        SettingCategory = "SharePoint External Sharing"
                        SettingName = $setting.Name
                        SettingValue = $setting.Value
                        Description = $setting.Desc
                        Source = "SharePointOnline"
                        RetrievedAt = Get-Date
                        _DataType = 'ExternalCollaborationSettings'
                    })
                }
            } catch {
                Write-MandALog "Could not retrieve SharePoint settings: $($_.Exception.Message)" -Level "WARN" -Context $Context
            }
        }
        
        # 5. Teams External Access (if configured and available)
        if ($Configuration.CollectTeamsSettings -and (Get-Command Get-CsTenantFederationConfiguration -ErrorAction SilentlyContinue)) {
            try {
                $teamsConfig = Get-CsTenantFederationConfiguration -ErrorAction Stop
                
                $teamsSettings = @(
                    @{Name = "AllowFederatedUsers"; Value = $teamsConfig.AllowFederatedUsers; Desc = "Allow Teams federation"},
                    @{Name = "AllowPublicUsers"; Value = $teamsConfig.AllowPublicUsers; Desc = "Allow Skype consumer users"},
                    @{Name = "AllowTeamsConsumer"; Value = $teamsConfig.AllowTeamsConsumer; Desc = "Allow Teams consumer users"}
                )
                
                foreach ($setting in $teamsSettings) {
                    $settingsData.Add([PSCustomObject]@{
                        SettingCategory = "Teams External Access"
                        SettingName = $setting.Name
                        SettingValue = $setting.Value
                        Description = $setting.Desc
                        Source = "TeamsOnline"
                        RetrievedAt = Get-Date
                        _DataType = 'ExternalCollaborationSettings'
                    })
                }
            } catch {
                Write-MandALog "Could not retrieve Teams settings: $($_.Exception.Message)" -Level "WARN" -Context $Context
            }
        }
        
        Write-MandALog "Retrieved $($settingsData.Count) external collaboration settings" -Level "SUCCESS" -Context $Context
        return $settingsData
        
    } catch {
        Write-MandALog "Error retrieving external collaboration settings: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-GuestUserActivityEnhanced {
    param(
        [array]$GuestUsers,
        [hashtable]$Configuration,
        [MandAContext]$Context
    )
    
    $activityDataList = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        Write-MandALog "Analyzing activity for $($GuestUsers.Count) guest users..." -Level "INFO" -Context $Context
        
        $activityDays = $Configuration.GuestActivityDays
        $cutoffDate = (Get-Date).AddDays(-$activityDays)
        
        # Categorize guests
        $activeGuests = @($GuestUsers | Where-Object { 
            $_.AccountEnabled -and $_.LastSignInDateTime -and [DateTime]$_.LastSignInDateTime -gt $cutoffDate 
        })
        
        $inactiveGuests = @($GuestUsers | Where-Object { 
            $_.AccountEnabled -and ((-not $_.LastSignInDateTime) -or [DateTime]$_.LastSignInDateTime -le $cutoffDate)
        })
        
        $disabledGuests = @($GuestUsers | Where-Object { -not $_.AccountEnabled })
        $neverSignedInGuests = @($GuestUsers | Where-Object { $_.AccountEnabled -and -not $_.LastSignInDateTime })
        
        # Add summary metrics
        $summaryMetrics = @(
            @{Category = "Summary"; Metric = "Total Guest Users"; Count = $GuestUsers.Count; Percentage = 100},
            @{Category = "Summary"; Metric = "Active Guests ($($activityDays)d)"; Count = $activeGuests.Count; 
              Percentage = if ($GuestUsers.Count -gt 0) { [Math]::Round(($activeGuests.Count / $GuestUsers.Count) * 100, 2) } else { 0 }},
            @{Category = "Summary"; Metric = "Inactive Guests"; Count = $inactiveGuests.Count;
              Percentage = if ($GuestUsers.Count -gt 0) { [Math]::Round(($inactiveGuests.Count / $GuestUsers.Count) * 100, 2) } else { 0 }},
            @{Category = "Summary"; Metric = "Never Signed In"; Count = $neverSignedInGuests.Count;
              Percentage = if ($GuestUsers.Count -gt 0) { [Math]::Round(($neverSignedInGuests.Count / $GuestUsers.Count) * 100, 2) } else { 0 }},
            @{Category = "Summary"; Metric = "Disabled Guests"; Count = $disabledGuests.Count;
              Percentage = if ($GuestUsers.Count -gt 0) { [Math]::Round(($disabledGuests.Count / $GuestUsers.Count) * 100, 2) } else { 0 }}
        )
        
        foreach ($metric in $summaryMetrics) {
            $activityDataList.Add([PSCustomObject]@{
                Category = $metric.Category
                Metric = $metric.Metric
                Count = $metric.Count
                Percentage = $metric.Percentage
                Details = ""
                AnalysisDate = Get-Date
                _DataType = 'GuestUserActivityAnalysis'
            })
        }
        
        # Analyze by domain
        $topDomainCount = $Configuration.TopPartnerDomainsToAnalyze
        $guestDomains = $GuestUsers | Where-Object { $_.GuestDomain -ne "Unknown" } | 
                        Group-Object -Property GuestDomain | 
                        Sort-Object Count -Descending | 
                        Select-Object -First $topDomainCount
        
        foreach ($domain in $guestDomains) {
            $domainGuests = $domain.Group
            $domainActiveCount = @($domainGuests | Where-Object { 
                $_.AccountEnabled -and $_.LastSignInDateTime -and [DateTime]$_.LastSignInDateTime -gt $cutoffDate 
            }).Count
            
            $activityDataList.Add([PSCustomObject]@{
                Category = "By Domain"
                Metric = $domain.Name
                Count = $domain.Count
                Percentage = if ($GuestUsers.Count -gt 0) { [Math]::Round(($domain.Count / $GuestUsers.Count) * 100, 2) } else { 0 }
                Details = "Active: $domainActiveCount of $($domain.Count) ($([Math]::Round(($domainActiveCount / $domain.Count) * 100, 2))%)"
                AnalysisDate = Get-Date
                _DataType = 'GuestUserActivityAnalysis'
            })
        }
        
        # Analyze by invitation age
        $ageGroups = @{
            "Last30Days" = @{Min = 0; Max = 30; Count = 0}
            "Last90Days" = @{Min = 31; Max = 90; Count = 0}
            "Last180Days" = @{Min = 91; Max = 180; Count = 0}
            "LastYear" = @{Min = 181; Max = 365; Count = 0}
            "OverYear" = @{Min = 366; Max = [int]::MaxValue; Count = 0}
        }
        
        foreach ($guest in $GuestUsers) {
            if ($guest.CreatedDateTime) {
                $ageDays = ((Get-Date) - [DateTime]$guest.CreatedDateTime).TotalDays
                
                foreach ($groupName in $ageGroups.Keys) {
                    $group = $ageGroups[$groupName]
                    if ($ageDays -ge $group.Min -and $ageDays -le $group.Max) {
                        $group.Count++
                        break
                    }
                }
            }
        }
        
        foreach ($groupName in $ageGroups.Keys) {
            $group = $ageGroups[$groupName]
            $activityDataList.Add([PSCustomObject]@{
                Category = "By Invitation Age"
                Metric = "Invited$groupName"
                Count = $group.Count
                Percentage = if ($GuestUsers.Count -gt 0) { [Math]::Round(($group.Count / $GuestUsers.Count) * 100, 2) } else { 0 }
                Details = "Guests invited in this time period"
                AnalysisDate = Get-Date
                _DataType = 'GuestUserActivityAnalysis'
            })
        }
        
        Write-MandALog "Generated $($activityDataList.Count) activity analysis records" -Level "SUCCESS" -Context $Context
        return $activityDataList
        
    } catch {
        Write-MandALog "Error analyzing guest user activity: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-PartnerOrganizationsEnhanced {
    param(
        [array]$GuestUsers,
        [hashtable]$Configuration,
        [MandAContext]$Context
    )
    
    $partnerDataList = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        Write-MandALog "Analyzing partner organizations from $($GuestUsers.Count) guest users..." -Level "INFO" -Context $Context
        
        $activityDays = $Configuration.GuestActivityDays
        $cutoffDate = (Get-Date).AddDays(-$activityDays)
        
        # Group by domain
        $partnerDomains = $GuestUsers | 
                         Where-Object { $_.GuestDomain -and $_.GuestDomain -ne "Unknown" } | 
                         Group-Object -Property GuestDomain | 
                         Sort-Object Count -Descending
        
        foreach ($partner in $partnerDomains) {
            $partnerGuests = $partner.Group
            
            # Calculate metrics
            $activeCount = @($partnerGuests | Where-Object { 
                $_.AccountEnabled -and $_.LastSignInDateTime -and [DateTime]$_.LastSignInDateTime -gt $cutoffDate 
            }).Count
            
            $inactiveCount = @($partnerGuests | Where-Object { 
                $_.AccountEnabled -and ((-not $_.LastSignInDateTime) -or [DateTime]$_.LastSignInDateTime -le $cutoffDate)
            }).Count
            
            $disabledCount = @($partnerGuests | Where-Object { -not $_.AccountEnabled }).Count
            
            # Get unique departments and job titles
            $departments = @($partnerGuests | Where-Object { $_.Department } | Select-Object -ExpandProperty Department -Unique)
            $jobTitles = @($partnerGuests | Where-Object { $_.JobTitle } | Select-Object -ExpandProperty JobTitle -Unique)
            $companies = @($partnerGuests | Where-Object { $_.CompanyName } | Select-Object -ExpandProperty CompanyName -Unique)
            
            # Determine partner type
            $partnerType = Get-PartnerType -Domain $partner.Name
            
            # Calculate risk score
            $riskAssessment = Get-PartnerRiskAssessment -PartnerData @{
                Domain = $partner.Name
                Type = $partnerType
                TotalGuests = $partnerGuests.Count
                ActiveCount = $activeCount
                InactiveCount = $inactiveCount
                DisabledCount = $disabledCount
            }
            
            # Get date ranges
            $creationDates = $partnerGuests | Where-Object { $_.CreatedDateTime } | ForEach-Object { [DateTime]$_.CreatedDateTime }
            $oldestGuest = if ($creationDates) { ($creationDates | Measure-Object -Minimum).Minimum } else { $null }
            $newestGuest = if ($creationDates) { ($creationDates | Measure-Object -Maximum).Maximum } else { $null }
            
            # Calculate collaboration duration
            $collaborationDays = if ($oldestGuest) { ((Get-Date) - $oldestGuest).TotalDays } else { 0 }
            
            $partnerDataList.Add([PSCustomObject]@{
                PartnerDomain = $partner.Name
                PartnerType = $partnerType
                PrimaryCompany = if ($companies.Count -eq 1) { $companies[0] } else { "Multiple ($($companies.Count))" }
                TotalGuests = $partnerGuests.Count
                ActiveGuests = $activeCount
                InactiveGuests = $inactiveCount
                DisabledGuests = $disabledCount
                ActivityRate = if ($partnerGuests.Count -gt 0) { [Math]::Round(($activeCount / $partnerGuests.Count) * 100, 2) } else { 0 }
                UniqueDepartments = $departments.Count
                DepartmentsList = ($departments | Select-Object -First 10) -join "; "
                UniqueJobTitles = $jobTitles.Count
                TopJobTitles = ($jobTitles | Select-Object -First 10) -join "; "
                OldestGuestDate = $oldestGuest
                NewestGuestDate = $newestGuest
                CollaborationDurationDays = [Math]::Round($collaborationDays, 0)
                RiskLevel = $riskAssessment.Level
                RiskScore = $riskAssessment.Score
                RiskFactors = $riskAssessment.Factors -join "; "
                LastAssessment = Get-Date
                _DataType = 'PartnerOrganizationsAnalysis'
            })
        }
        
        Write-MandALog "Analyzed $($partnerDataList.Count) partner organizations" -Level "SUCCESS" -Context $Context
        return $partnerDataList
        
    } catch {
        Write-MandALog "Error analyzing partner organizations: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-ExternalIdentityProvidersEnhanced {
    param(
        [hashtable]$Configuration,
        [MandAContext]$Context
    )
    
    $providerDataList = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        Write-MandALog "Retrieving external identity providers..." -Level "INFO" -Context $Context
        
        # Get configured identity providers
        $identityProviders = Invoke-DiscoveryWithRetry -ScriptBlock {
            Get-MgIdentityProvider -All -ErrorAction Stop
        } -OperationName "GetIdentityProviders" -Context $Context -CircuitBreaker $script:GraphCircuitBreaker
        
        if ($identityProviders) {
            foreach ($provider in $identityProviders) {
                $providerType = "Unknown"
                $additionalInfo = @{}
                
                # Extract provider type and additional properties
                if ($provider.AdditionalProperties -and $provider.AdditionalProperties.'@odata.type') {
                    $providerType = $provider.AdditionalProperties.'@odata.type' -replace '#microsoft.graph.', ''
                    
                    # Extract provider-specific properties
                    switch -Wildcard ($providerType) {
                        "*Google*" {
                            $additionalInfo.Scope = $provider.AdditionalProperties.scope -join "; "
                        }
                        "*Facebook*" {
                            $additionalInfo.GraphApiVersion = $provider.AdditionalProperties.graphApiVersion
                        }
                        "*SAML*" {
                            $additionalInfo.MetadataUrl = $provider.AdditionalProperties.metadataUrl
                            $additionalInfo.IssuerUri = $provider.AdditionalProperties.issuerUri
                        }
                    }
                }
                
                $providerDataList.Add([PSCustomObject]@{
                    ProviderId = $provider.Id
                    ProviderType = $providerType
                    DisplayName = $provider.DisplayName
                    ClientId = $provider.ClientId
                    ClientSecret = if ($provider.ClientSecret) { "Configured" } else { "Not Configured" }
                    IsEnabled = $true  # If returned by API, it's enabled
                    ConfiguredDate = $null  # API doesn't provide this
                    AdditionalProperties = ($additionalInfo | ConvertTo-Json -Compress)
                    DiscoveredAt = Get-Date
                    _DataType = 'ExternalIdentityProviders'
                })
            }
        }
        
        # Always add default Azure AD B2B provider
        $providerDataList.Add([PSCustomObject]@{
            ProviderId = "AzureAD-B2B-Default"
            ProviderType = "AzureActiveDirectory"
            DisplayName = "Azure AD B2B (Default)"
            ClientId = "N/A"
            ClientSecret = "N/A"
            IsEnabled = $true
            ConfiguredDate = $null
            AdditionalProperties = "{}"
            DiscoveredAt = Get-Date
            _DataType = 'ExternalIdentityProviders'
        })
        
        Write-MandALog "Retrieved $($providerDataList.Count) identity providers" -Level "SUCCESS" -Context $Context
        return $providerDataList
        
    } catch {
        Write-MandALog "Error retrieving external identity providers: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-GuestInvitationsEnhanced {
    param(
        [hashtable]$Configuration,
        [MandAContext]$Context,
        [array]$GuestUsers
    )
    
    $invitationDataList = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        Write-MandALog "Analyzing guest invitations..." -Level "INFO" -Context $Context
        
        # Try to get direct invitation objects
        try {
            $invitations = Invoke-DiscoveryWithRetry -ScriptBlock {
                Get-MgInvitation -All -ErrorAction Stop
            } -OperationName "GetInvitations" -Context $Context -CircuitBreaker $script:GraphCircuitBreaker
            
            if ($invitations -and $invitations.Count -gt 0) {
                Write-MandALog "Found $($invitations.Count) direct invitation objects" -Level "INFO" -Context $Context
                
                foreach ($inv in $invitations) {
                    $invitationDataList.Add([PSCustomObject]@{
                        InvitationId = $inv.Id
                        InvitedUserEmail = $inv.InvitedUserEmailAddress
                        InvitedUserDisplayName = $inv.InvitedUserDisplayName
                        InvitedUserType = $inv.InvitedUserType
                        InviteRedeemUrl = if ($inv.InviteRedeemUrl) { "Present" } else { "Not Present" }
                        InviteRedirectUrl = $inv.InviteRedirectUrl
                        Status = $inv.Status
                        SendInvitationMessage = $inv.SendInvitationMessage
                        InvitedByUserId = if ($inv.InvitedByUser) { $inv.InvitedByUser.Id } else { $null }
                        InvitedByUserUPN = if ($inv.InvitedByUser) { $inv.InvitedByUser.UserPrincipalName } else { $null }
                        CreatedDateTime = $inv.CreatedDateTime
                        MessageLanguage = $inv.InvitationMessage.MessageLanguage
                        CustomizedMessage = if ($inv.InvitationMessage.CustomizedMessageBody) { "Yes" } else { "No" }
                        _DataType = 'GuestInvitationsSummary'
                    })
                }
            }
        } catch {
            Write-MandALog "Could not retrieve invitation objects: $($_.Exception.Message)" -Level "WARN" -Context $Context
        }
        
        # Fallback: Analyze recent guest users
        if ($invitationDataList.Count -eq 0 -and $GuestUsers -and $GuestUsers.Count -gt 0) {
            Write-MandALog "Using guest user data for invitation analysis" -Level "INFO" -Context $Context
            
            $recentGuestCount = $Configuration.RecentGuestCountForInvitationFallback
            $recentGuests = $GuestUsers | 
                           Where-Object { $_.CreatedDateTime } | 
                           Sort-Object CreatedDateTime -Descending | 
                           Select-Object -First $recentGuestCount
            
            foreach ($guest in $recentGuests) {
                $invitationDataList.Add([PSCustomObject]@{
                    InvitationId = "N/A"
                    InvitedUserEmail = $guest.Mail ?? $guest.UserPrincipalName
                    InvitedUserDisplayName = $guest.DisplayName
                    InvitedUserType = $guest.UserType
                    InviteRedeemUrl = "N/A"
                    InviteRedirectUrl = "N/A"
                    Status = $guest.ExternalUserState
                    SendInvitationMessage = "Unknown"
                    InvitedByUserId = "Unknown"
                    InvitedByUserUPN = "Unknown"
                    CreatedDateTime = $guest.CreatedDateTime
                    MessageLanguage = "Unknown"
                    CustomizedMessage = "Unknown"
                    DataSource = "GuestUserFallback"
                    _DataType = 'GuestInvitationsSummary'
                })
            }
        }
        
        Write-MandALog "Processed $($invitationDataList.Count) invitation records" -Level "SUCCESS" -Context $Context
        return $invitationDataList
        
    } catch {
        Write-MandALog "Error analyzing guest invitations: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-CrossTenantAccessEnhanced {
    param(
        [hashtable]$Configuration,
        [MandAContext]$Context
    )
    
    $results = @{
        Defaults = [System.Collections.Generic.List[PSObject]]::new()
        Partners = [System.Collections.Generic.List[PSObject]]::new()
    }
    
    try {
        Write-MandALog "Retrieving cross-tenant access policy..." -Level "INFO" -Context $Context
        
        # Check if policies module is available
        if (-not (Get-Command Get-MgPolicyCrossTenantAccessPolicy -ErrorAction SilentlyContinue)) {
            Write-MandALog "Cross-tenant access policy cmdlets not available. Module may not be loaded." -Level "WARN" -Context $Context
            
            $results.Defaults.Add([PSCustomObject]@{
                PolicyId = "N/A"
                PolicyType = "ModuleNotAvailable"
                TargetTenantId = "N/A"
                Notes = "Install Microsoft.Graph.Identity.SignIns module for cross-tenant access policy"
                _DataType = 'CrossTenantAccessPolicy_Defaults'
            })
            
            return $results
        }
        
        # Get the policy
        $policy = Invoke-DiscoveryWithRetry -ScriptBlock {
            Get-MgPolicyCrossTenantAccessPolicy -ErrorAction Stop
        } -OperationName "GetCrossTenantAccessPolicy" -Context $Context -CircuitBreaker $script:GraphCircuitBreaker
        
        if ($policy) {
            # Process default settings
            if ($policy.Default) {
                $default = $policy.Default
                
                $results.Defaults.Add([PSCustomObject]@{
                    PolicyId = $policy.Id
                    PolicyType = "Default"
                    TargetTenantId = "All Tenants"
                    B2BCollabInbound_UsersAndGroups = $default.B2BCollaborationInbound.UsersAndGroups.AccessType
                    B2BCollabInbound_Applications = $default.B2BCollaborationInbound.Applications.AccessType
                    B2BCollabOutbound_UsersAndGroups = $default.B2BCollaborationOutbound.UsersAndGroups.AccessType
                    B2BCollabOutbound_Applications = $default.B2BCollaborationOutbound.Applications.AccessType
                    B2BDirectConnectInbound_Enabled = if ($default.B2BDirectConnectInbound) { $default.B2BDirectConnectInbound.IsEnabled } else { $false }
                    B2BDirectConnectOutbound_Enabled = if ($default.B2BDirectConnectOutbound) { $default.B2BDirectConnectOutbound.IsEnabled } else { $false }
                    InboundTrust_MfaAccepted = $default.InboundTrust.IsMfaAccepted
                    InboundTrust_CompliantDeviceAccepted = $default.InboundTrust.IsCompliantDeviceAccepted
                    InboundTrust_HybridJoinedDeviceAccepted = $default.InboundTrust.IsHybridAzureADJoinedDeviceAccepted
                    AutomaticUserConsent_InboundAllowed = $default.AutomaticUserConsentSettings.InboundAllowed
                    AutomaticUserConsent_OutboundAllowed = $default.AutomaticUserConsentSettings.OutboundAllowed
                    LastModified = Get-Date
                    _DataType = 'CrossTenantAccessPolicy_Defaults'
                })
            }
            
            # Get partner configurations
            $partners = Invoke-DiscoveryWithRetry -ScriptBlock {
                Get-MgPolicyCrossTenantAccessPolicyPartner -CrossTenantAccessPolicyId $policy.Id -All -ErrorAction Stop
            } -OperationName "GetCrossTenantAccessPolicyPartners" -Context $Context -CircuitBreaker $script:GraphCircuitBreaker
            
            if ($partners) {
                foreach ($partner in $partners) {
                    $results.Partners.Add([PSCustomObject]@{
                        PolicyId = $policy.Id
                        PolicyType = "Partner"
                        PartnerTenantId = $partner.TenantId
                        PartnerName = $partner.TenantId  # Could be enhanced with tenant name lookup
                        IsServiceProvider = $partner.IsServiceProvider
                        B2BCollabInbound_Enabled = if ($partner.B2BCollaborationInbound) { $true } else { $false }
                        B2BCollabOutbound_Enabled = if ($partner.B2BCollaborationOutbound) { $true } else { $false }
                        B2BDirectConnectInbound_Enabled = if ($partner.B2BDirectConnectInbound) { $true } else { $false }
                        B2BDirectConnectOutbound_Enabled = if ($partner.B2BDirectConnectOutbound) { $true } else { $false }
                        InboundTrust_MfaAccepted = if ($partner.InboundTrust) { $partner.InboundTrust.IsMfaAccepted } else { $false }
                        InboundTrust_CompliantDeviceAccepted = if ($partner.InboundTrust) { $partner.InboundTrust.IsCompliantDeviceAccepted } else { $false }
                        AutomaticUserConsent_InboundAllowed = if ($partner.AutomaticUserConsentSettings) { $partner.AutomaticUserConsentSettings.InboundAllowed } else { $false }
                        AutomaticUserConsent_OutboundAllowed = if ($partner.AutomaticUserConsentSettings) { $partner.AutomaticUserConsentSettings.OutboundAllowed } else { $false }
                        ConfiguredApplications = if ($partner.B2BCollaborationInbound.Applications.Targets) { $partner.B2BCollaborationInbound.Applications.Targets.Count } else { 0 }
                        LastModified = Get-Date
                        _DataType = 'CrossTenantAccessPolicy_Partners'
                    })
                }
            }
        }
        
        Write-MandALog "Retrieved cross-tenant access policy: $($results.Defaults.Count) defaults, $($results.Partners.Count) partners" -Level "SUCCESS" -Context $Context
        return $results
        
    } catch {
        Write-MandALog "Error retrieving cross-tenant access policy: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

# Helper Functions

function Get-GraphDataInBatches {
    param(
        [string]$Entity,
        [string]$Filter,
        [string[]]$Select,
        [string]$ExpandProperty,
        [int]$BatchSize = 999,
        [MandAContext]$Context
    )
    
    $allData = [System.Collections.Generic.List[PSObject]]::new()
    $uri = "v1.0/$Entity"
    $queryParams = @{
        '$top' = $BatchSize
        '$count' = 'true'
    }
    
    if ($Filter) { $queryParams['$filter'] = $Filter }
    if ($Select) { $queryParams['$select'] = $Select -join ',' }
    if ($ExpandProperty) { $queryParams['$expand'] = $ExpandProperty }
    
    $headers = @{
        'ConsistencyLevel' = 'eventual'
    }
    
    do {
        try {
            $response = Invoke-DiscoveryWithRetry -ScriptBlock {
                Invoke-MgGraphRequest -Method GET -Uri $uri -Headers $headers -Body $queryParams -ErrorAction Stop
            } -OperationName "GraphBatch_$Entity" -Context $Context -CircuitBreaker $script:GraphCircuitBreaker
            
            if ($response.value) {
                $allData.AddRange($response.value)
                Write-Progress -Activity "Fetching $Entity" -Status "$($allData.Count) retrieved" -Id 2
            }
            
            # Check for next page
            $uri = $response.'@odata.nextLink'
            $queryParams = @{} # Next link includes all params
            
        } catch {
            Write-MandALog "Error in batch retrieval: $($_.Exception.Message)" -Level "ERROR" -Context $Context
            throw
        }
    } while ($uri)
    
    Write-Progress -Activity "Fetching $Entity" -Completed -Id 2
    return $allData
}

function Get-GuestDomain {
    param($Guest)
    
    if ($Guest.Mail) {
        return ($Guest.Mail -split '@')[1]
    } elseif ($Guest.UserPrincipalName -match '#EXT#@') {
        # Extract domain from external user format
        $parts = $Guest.UserPrincipalName -split '_'
        if ($parts.Count -ge 2) {
            $emailPart = $parts[-2]
            if ($emailPart -match '@') {
                return ($emailPart -split '@')[1]
            }
        }
    } elseif ($Guest.UserPrincipalName -match '@') {
        return ($Guest.UserPrincipalName -split '@')[1]
    }
    
    return "Unknown"
}

function Get-PartnerType {
    param([string]$Domain)
    
    switch -Regex ($Domain) {
        '\.(edu|ac\.|university\.)' { return "Educational Institution" }
        '\.(gov|mil)$' { return "Government" }
        '(gmail|yahoo|hotmail|outlook|live|aol|icloud|protonmail|yandex|mail|zoho)\.(com|net|org|me|ch|de|fr|uk|ca|ru|in)$' { 
            return "Consumer Email Provider" 
        }
        'onmicrosoft\.com$' { return "Microsoft Tenant" }
        '\.(io|app|cloud|saas)$' { return "Technology Company" }
        '\.(ngo|org)$' { return "Non-Profit Organization" }
        default { 
            # Try to identify by common business domains
            if ($Domain -match '\.(com|biz|corp|inc|llc|ltd)$') {
                return "Commercial Organization"
            }
            return "External Partner"
        }
    }
}

function Get-PartnerRiskAssessment {
    param([hashtable]$PartnerData)
    
    $riskScore = 0
    $riskFactors = [System.Collections.Generic.List[string]]::new()
    
    # Factor 1: Partner Type (0-30 points)
    switch ($PartnerData.Type) {
        "Consumer Email Provider" { 
            $riskScore += 30
            $riskFactors.Add("Consumer email domain")
        }
        "External Partner" {
            $riskScore += 10
            $riskFactors.Add("Unclassified external domain")
        }
        "Government" { $riskScore += 0 }
        "Educational Institution" { $riskScore += 5 }
        default { $riskScore += 5 }
    }
    
    # Factor 2: Activity Rate (0-25 points)
    $activityRate = if ($PartnerData.TotalGuests -gt 0) { 
        ($PartnerData.ActiveCount / $PartnerData.TotalGuests) * 100 
    } else { 0 }
    
    if ($activityRate -lt 10) {
        $riskScore += 25
        $riskFactors.Add("Very low activity rate (<10%)")
    } elseif ($activityRate -lt 25) {
        $riskScore += 15
        $riskFactors.Add("Low activity rate (<25%)")
    } elseif ($activityRate -lt 50) {
        $riskScore += 5
        $riskFactors.Add("Moderate activity rate (<50%)")
    }
    
    # Factor 3: Disabled Accounts (0-20 points)
    $disabledRate = if ($PartnerData.TotalGuests -gt 0) { 
        ($PartnerData.DisabledCount / $PartnerData.TotalGuests) * 100 
    } else { 0 }
    
    if ($disabledRate -gt 50) {
        $riskScore += 20
        $riskFactors.Add("High disabled account rate (>50%)")
    } elseif ($disabledRate -gt 25) {
        $riskScore += 10
        $riskFactors.Add("Elevated disabled account rate (>25%)")
    }
    
    # Factor 4: Single User Partner (0-15 points)
    if ($PartnerData.TotalGuests -eq 1 -and $PartnerData.Type -ne "Consumer Email Provider") {
        $riskScore += 15
        $riskFactors.Add("Single user from partner organization")
    }
    
    # Factor 5: Inactive Majority (0-10 points)
    if ($PartnerData.InactiveCount -gt ($PartnerData.TotalGuests * 0.75)) {
        $riskScore += 10
        $riskFactors.Add("Majority of users inactive (>75%)")
    }
    
    # Determine risk level
    $riskLevel = switch ($riskScore) {
        {$_ -ge 60} { "High" }
        {$_ -ge 30} { "Medium" }
        {$_ -ge 15} { "Low" }
        default { "Minimal" }
    }
    
    return @{
        Score = $riskScore
        Level = $riskLevel
        Factors = $riskFactors
    }
}

function Split-ArrayIntoBatches {
    param(
        [array]$Array,
        [int]$BatchSize
    )
    
    $batches = [System.Collections.Generic.List[array]]::new()
    
    for ($i = 0; $i -lt $Array.Count; $i += $BatchSize) {
        $batch = $Array[$i..[Math]::Min($i + $BatchSize - 1, $Array.Count - 1)]
        $batches.Add($batch)
    }
    
    return $batches
}

function Convert-ToFlattenedData {
    param([hashtable]$Results)
    
    $flatData = [System.Collections.Generic.List[PSObject]]::new()
    
    # Each result set is already tagged with _DataType
    foreach ($key in $Results.Keys) {
        if ($Results[$key] -is [array] -or $Results[$key] -is [System.Collections.Generic.List[PSObject]]) {
            $flatData.AddRange($Results[$key])
        } elseif ($Results[$key] -is [hashtable]) {
            # Handle nested results like CrossTenantAccess
            foreach ($subKey in $Results[$key].Keys) {
                if ($Results[$key][$subKey] -is [array] -or $Results[$key][$subKey] -is [System.Collections.Generic.List[PSObject]]) {
                    $flatData.AddRange($Results[$key][$subKey])
                }
            }
        }
    }
    
    return $flatData
}

# Export module members
Export-ModuleMember -Function 'Invoke-ExternalIdentityDiscovery'