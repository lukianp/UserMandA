# Module: ExternalIdentityDiscovery.psm1
# Description: Discovers B2B guest users, collaboration settings, external identity providers, and partner organizations.
# Version: 1.3.1 (Removed strict #Requires for Beta module to allow loading, syntax correction in Get-CrossTenantAccessDataInternal)
# Date: 2025-05-31

# Base Requirements for core functionality (v1.0 SDK)
#Requires -Modules Microsoft.Graph.Authentication, Microsoft.Graph.Users, Microsoft.Graph.Identity.SignIns 
#Requires -Modules Microsoft.Graph.Identity.DirectoryManagement, Microsoft.Graph.Policies

# The following Beta module was causing loading issues if not installed.
# If specific Beta cmdlets are used within, they should be checked for and handled gracefully.
# #Requires -Modules Microsoft.Graph.Beta.Identity.SignIns 
# #Requires -Modules Microsoft.Graph.Beta.Policies 

# Optional module dependencies, checked for within relevant functions:
# Microsoft.Online.SharePoint.PowerShell 
# MicrosoftTeams 

# --- Helper Functions (Assumed to be available globally from Utility Modules) ---
# Export-DataToCSV -InputObject $Data -FileName "Filename.csv" -OutputPath $Path
# Import-DataFromCSV -FilePath $Path
# Write-MandALog -Message "Log message" -Level "INFO"

# --- Main Exported Function ---

function Invoke-ExternalIdentityDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    try {
        Write-MandALog "--- Starting External Identity Discovery Phase ---" -Level "HEADER"

        $outputPath = $Configuration.environment.outputPath
        $rawPath = Join-Path $outputPath "Raw" 
        if (-not (Test-Path $rawPath -PathType Container)) {
            try { New-Item -Path $rawPath -ItemType Directory -Force -ErrorAction Stop | Out-Null }
            catch { Write-MandALog "Failed to create Raw output directory: $rawPath. Error: $($_.Exception.Message)" -Level "ERROR"; throw }
        }

        $discoveryResults = @{}

        $context = Get-MgContext -ErrorAction SilentlyContinue
        if (-not $context) {
            Write-MandALog "Microsoft Graph not connected. Skipping external identity discovery." -Level "WARN"
            return @{} 
        }
        Write-MandALog "Graph context active for External Identity discovery." -Level "INFO"
            
        if ($script:ExecutionMetrics -is [hashtable]) {
            $script:ExecutionMetrics.Phase = "External Identity Discovery"
        }

        Write-MandALog "Discovering B2B guest users..." -Level "INFO"
        $b2bGuests = Get-B2BGuestUsersDataInternal -OutputPath $rawPath -Configuration $Configuration
        $discoveryResults.B2BGuests = $b2bGuests 

        Write-MandALog "Discovering external collaboration settings..." -Level "INFO"
        $discoveryResults.CollaborationSettings = Get-ExternalCollaborationSettingsDataInternal -OutputPath $rawPath -Configuration $Configuration

        Write-MandALog "Analyzing guest user activity..." -Level "INFO"
        $discoveryResults.GuestActivity = Get-GuestUserActivityDataInternal -OutputPath $rawPath -Configuration $Configuration -GuestUsers $b2bGuests

        Write-MandALog "Discovering partner organizations..." -Level "INFO"
        $discoveryResults.PartnerOrganizations = Get-PartnerOrganizationsDataInternal -OutputPath $rawPath -Configuration $Configuration -GuestUsers $b2bGuests

        Write-MandALog "Discovering external identity providers..." -Level "INFO"
        $discoveryResults.IdentityProviders = Get-ExternalIdentityProvidersDataInternal -OutputPath $rawPath -Configuration $Configuration

        Write-MandALog "Analyzing guest invitations..." -Level "INFO"
        $discoveryResults.GuestInvitations = Get-GuestInvitationsDataInternal -OutputPath $rawPath -Configuration $Configuration

        Write-MandALog "Discovering cross-tenant access settings..." -Level "INFO"
        $discoveryResults.CrossTenantAccess = Get-CrossTenantAccessDataInternal -OutputPath $rawPath -Configuration $Configuration

        Write-MandALog "--- External Identity Discovery Phase Completed Successfully ---" -Level "SUCCESS"
        return $discoveryResults

    } catch {
        Write-MandALog "External Identity discovery phase failed catastrophically: $($_.Exception.Message) ScriptStackTrace: $($_.ScriptStackTrace)" -Level "ERROR"
        throw 
    }
}

# --- Internal Data Collection Functions ---

function Get-B2BGuestUsersDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$OutputPath,
        [Parameter(Mandatory=$true)][hashtable]$Configuration
    )
    $outputFile = Join-Path $OutputPath "B2BGuestUsers.csv"
    $guestDataList = [System.Collections.Generic.List[PSObject]]::new()

    if (($Configuration.discovery.skipExistingFiles -as [bool]) -and (Test-Path $outputFile)) {
        Write-MandALog "B2B guest users CSV '$outputFile' already exists. Skipping." -Level "INFO"
        try { return Import-DataFromCSV -FilePath $outputFile } catch { Write-MandALog "Failed to import existing B2BGuestUsers.csv: $($_.Exception.Message)" -Level "WARN"; return @() }
    }

    try {
        Write-MandALog "Retrieving B2B guest users..." -Level "INFO"
        $propertiesToSelect = @(
            "id", "userPrincipalName", "displayName", "mail", "userType", "externalUserState", 
            "externalUserStateChangeDateTime", "createdDateTime", "creationType", "accountEnabled", 
            "companyName", "department", "jobTitle", "usageLocation", "preferredLanguage", 
            "signInActivity", "refreshTokensValidFromDateTime"
        )
        
        $guestUsers = Get-MgUser -All -Filter "userType eq 'Guest'" -Property $propertiesToSelect -ExpandProperty "signInActivity" -ErrorAction SilentlyContinue

        if (-not $guestUsers) { Write-MandALog "No guest users returned by Get-MgUser." -Level "WARN"; return @() }
        Write-MandALog "Found $($guestUsers.Count) guest user objects to process." -Level "INFO"

        $processedCount = 0
        foreach ($guest in $guestUsers) {
            $processedCount++
            if ($processedCount % 200 -eq 0) { 
                Write-Progress -Activity "Processing Guest Users" -Status "Guest $processedCount of $($guestUsers.Count)" -PercentComplete (($processedCount / $guestUsers.Count) * 100) -Id 2 
            }
            $guestDomain = "Unknown"
            if ($guest.Mail) { $guestDomain = $guest.Mail.Split('@')[1] } 
            elseif ($guest.UserPrincipalName -match '#EXT#@') { $guestDomain = $guest.UserPrincipalName.Split('#EXT#@')[1] }
            
            $appRoleAssignmentsCount = 0
            $getAppRolesFlag = $false
            if($Configuration.discovery.externalIdentity -and $Configuration.discovery.externalIdentity.ContainsKey('getGuestAppRoleAssignments')){
                $getAppRolesFlag = $Configuration.discovery.externalIdentity.getGuestAppRoleAssignments -as [bool]
            }
            if ($getAppRolesFlag) {
                try {
                    $appRoleAssignments = Get-MgUserAppRoleAssignment -UserId $guest.Id -All -ErrorAction SilentlyContinue
                    if ($appRoleAssignments) { $appRoleAssignmentsCount = ($appRoleAssignments | Measure-Object).Count }
                } catch { Write-MandALog "Could not get app role assignments for guest $($guest.Id): $($_.Exception.Message)" -Level "DEBUG"}
            }
            $guestDataList.Add([PSCustomObject]@{
                GuestId                         = $guest.Id; UserPrincipalName = $guest.UserPrincipalName; DisplayName = $guest.DisplayName
                Mail                            = $guest.Mail; GuestDomain = $guestDomain; CreationType = $guest.CreationType
                UserType                        = $guest.UserType; AccountEnabled = $guest.AccountEnabled
                ExternalUserState               = if($guest.ExternalUserState){$guest.ExternalUserState.ToString()}else{$null}
                ExternalUserStateChangeDateTime = $guest.ExternalUserStateChangeDateTime; CreatedDateTime = $guest.CreatedDateTime
                CompanyName                     = $guest.CompanyName; Department = $guest.Department; JobTitle = $guest.JobTitle
                UsageLocation                   = $guest.UsageLocation; PreferredLanguage = $guest.PreferredLanguage
                AppRoleAssignmentCount          = $appRoleAssignmentsCount
                LastSignInDateTime              = if ($guest.SignInActivity) { $guest.SignInActivity.LastSignInDateTime } else { $null }
                LastNonInteractiveSignInDateTime = if ($guest.SignInActivity) { $guest.SignInActivity.LastNonInteractiveSignInDateTime } else { $null }
                RefreshTokensValidFromDateTime  = $guest.RefreshTokensValidFromDateTime
            })}
        if ($guestUsers.Count -gt 0) { Write-Progress -Activity "Processing Guest Users" -Completed -Id 2 }
        if ($guestDataList.Count -gt 0) {
            Export-DataToCSV -InputObject $guestDataList -FileName "B2BGuestUsers.csv" -OutputPath $OutputPath
            Write-MandALog "Exported $($guestDataList.Count) B2B guest users." -Level "SUCCESS"
        } else { Write-MandALog "No B2B guest user data to export." -Level "INFO" }
        return $guestDataList
    } catch { Write-MandALog "Error retrieving B2B guest users: $($_.Exception.Message)" -Level "ERROR"; return @() }
}

function Get-ExternalCollaborationSettingsDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$OutputPath,
        [Parameter(Mandatory=$true)][hashtable]$Configuration
    )
    $outputFile = Join-Path $OutputPath "ExternalCollaborationSettings.csv"
    $settingsData = [System.Collections.Generic.List[PSCustomObject]]::new()

    if (($Configuration.discovery.skipExistingFiles -as [bool]) -and (Test-Path $outputFile)) {
        Write-MandALog "External collab settings CSV '$outputFile' exists. Skipping." -Level "INFO"
        try { return Import-DataFromCSV -FilePath $outputFile } catch { Write-MandALog "Failed to import existing ExternalCollaborationSettings.csv: $($_.Exception.Message)" -Level "WARN"; return @() }
    }
    try {
        Write-MandALog "Retrieving external collaboration settings (Authorization Policy)..." -Level "INFO"
        $authPolicy = Get-MgPolicyAuthorizationPolicy -ErrorAction SilentlyContinue
        if ($authPolicy) {
            $settingsData.Add([PSCustomObject]@{ SettingCategory = "Guest Permissions (AuthPolicy)"; SettingName = "GuestUserRoleId"; SettingValue = $authPolicy.GuestUserRoleId; Desc = "Default role for new guests."})
            if ($authPolicy.DefaultUserRolePermissions) {
                $settingsData.Add([PSCustomObject]@{ SettingCategory = "Guest Permissions (AuthPolicy)"; SettingName = "AllowedToInvite"; SettingValue = $authPolicy.DefaultUserRolePermissions.AllowedToInvite; Desc = "Default users can invite."})
                $settingsData.Add([PSCustomObject]@{ SettingCategory = "Guest Permissions (AuthPolicy)"; SettingName = "AllowedToReadOtherUsers"; SettingValue = $authPolicy.DefaultUserRolePermissions.AllowedToReadOtherUsers; Desc = "Default users can read others info."})
            } else { Write-MandALog "DefaultUserRolePermissions not on Auth Policy." -Level "WARN"}
        } else { Write-MandALog "Could not retrieve Authorization Policy." -Level "WARN" }

        $collectSPOSettings = $false
        if($Configuration.discovery.externalIdentity -and $Configuration.discovery.externalIdentity.ContainsKey('collectSharePointSettings')){
            $collectSPOSettings = $Configuration.discovery.externalIdentity.collectSharePointSettings -as [bool]
        }
        if ($collectSPOSettings -and (Get-Command Get-SPOTenant -ErrorAction SilentlyContinue)) {
            Write-MandALog "Attempting SPO external sharing settings (ensure SPO connection)..." -Level "INFO"
            try {
                # $spoAdminUrl = "https://$(($Configuration.environment.tenantName).Replace('.onmicrosoft.com',''))-admin.sharepoint.com" # Assuming tenantName is in config
                # Connect-SPOService -Url $spoAdminUrl # Requires credential handling
                $spoTenant = Get-SPOTenant -ErrorAction SilentlyContinue
                if ($spoTenant) {
                    $settingsData.Add([PSCustomObject]@{ SettingCategory = "SharePoint Sharing"; SettingName = "SharingCapability"; SettingValue = $spoTenant.SharingCapability.ToString() })
                    $settingsData.Add([PSCustomObject]@{ SettingCategory = "SharePoint Sharing"; SettingName = "RequireAcceptingUserToMatchInvitedUser"; SettingValue = $spoTenant.RequireAcceptingUserToMatchInvitedUser })
                } else { Write-MandALog "Get-SPOTenant returned no data." -Level "WARN"}
            } catch { Write-MandALog "Could not get SPO settings: $($_.Exception.Message)" -Level "WARN" }
        } elseif($collectSPOSettings) { Write-MandALog "Get-SPOTenant not found or collection disabled. Skipping SPO." -Level "INFO" }

        $collectTeamsSettings = $false
        if($Configuration.discovery.externalIdentity -and $Configuration.discovery.externalIdentity.ContainsKey('collectTeamsSettings')){
            $collectTeamsSettings = $Configuration.discovery.externalIdentity.collectTeamsSettings -as [bool]
        }
        if ($collectTeamsSettings -and (Get-Command Get-CsTenantFederationConfiguration -ErrorAction SilentlyContinue)) {
            Write-MandALog "Attempting Teams external access settings (ensure Teams connection)..." -Level "INFO"
            try {
                # Connect-MicrosoftTeams # Requires credential handling
                $teamsConfig = Get-CsTenantFederationConfiguration -ErrorAction SilentlyContinue
                if ($teamsConfig) {
                    $settingsData.Add([PSCustomObject]@{ SettingCategory = "Teams External Access"; SettingName = "AllowFederatedUsers"; SettingValue = $teamsConfig.AllowFederatedUsers })
                    $settingsData.Add([PSCustomObject]@{ SettingCategory = "Teams External Access"; SettingName = "AllowPublicUsers"; SettingValue = $teamsConfig.AllowPublicUsers })
                } else { Write-MandALog "Get-CsTenantFederationConfiguration returned no data." -Level "WARN" }
            } catch { Write-MandALog "Could not get Teams settings: $($_.Exception.Message)" -Level "WARN" }
        } elseif($collectTeamsSettings) { Write-MandALog "Get-CsTenantFederationConfiguration not found or collection disabled. Skipping Teams." -Level "INFO" }

        if ($settingsData.Count -gt 0) {
            Export-DataToCSV -InputObject $settingsData -FileName "ExternalCollaborationSettings.csv" -OutputPath $OutputPath
            Write-MandALog "Exported $($settingsData.Count) external collaboration settings." -Level "SUCCESS"
        } else { Write-MandALog "No external collaboration settings data to export." -Level "INFO" }
        return $settingsData
    } catch { Write-MandALog "Error retrieving external collaboration settings: $($_.Exception.Message)" -Level "ERROR"; return @() }
}

function Get-GuestUserActivityDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$OutputPath,
        [Parameter(Mandatory=$true)][hashtable]$Configuration,
        [Parameter(Mandatory=$false)][array]$GuestUsers 
    )
    $outputFile = Join-Path $OutputPath "GuestUserActivity.csv"
    $activityDataList = [System.Collections.Generic.List[PSCustomObject]]::new()

    if (($Configuration.discovery.skipExistingFiles -as [bool]) -and (Test-Path $outputFile)) {
        Write-MandALog "Guest user activity CSV '$outputFile' exists. Skipping." -Level "INFO"
        try { return Import-DataFromCSV -FilePath $outputFile } catch { Write-MandALog "Failed to import GuestUserActivity.csv: $($_.Exception.Message)" -Level "WARN"; return @() }
    }
    if (-not $GuestUsers -or $GuestUsers.Count -eq 0) { Write-MandALog "No guest users for activity analysis. Skipping." -Level "INFO"; return @() }
    try {
        Write-MandALog "Analyzing guest user activity for $($GuestUsers.Count) users..." -Level "INFO"
        $activeGuests = $GuestUsers | Where-Object { $_.AccountEnabled -and $_.LastSignInDateTime -and ([DateTime]$_.LastSignInDateTime -gt (Get-Date).AddDays(-90)) }
        $inactiveGuests = $GuestUsers | Where-Object { $_.AccountEnabled -and (-not $_.LastSignInDateTime -or [DateTime]$_.LastSignInDateTime -le (Get-Date).AddDays(-90)) }
        $disabledGuests = $GuestUsers | Where-Object { -not $_.AccountEnabled }
        $neverSignedInGuests = $GuestUsers | Where-Object { $_.AccountEnabled -and -not $_.LastSignInDateTime }

        $activityDataList.Add([PSCustomObject]@{ Category = "Summary"; Metric = "Total Guest Users"; Count = $GuestUsers.Count })
        $activityDataList.Add([PSCustomObject]@{ Category = "Summary"; Metric = "Active Guests (90 days)"; Count = $activeGuests.Count })
        $activityDataList.Add([PSCustomObject]@{ Category = "Summary"; Metric = "Inactive Guests (90+ days or never)"; Count = $inactiveGuests.Count })
        $activityDataList.Add([PSCustomObject]@{ Category = "Summary"; Metric = "Never Signed In (but enabled)"; Count = $neverSignedInGuests.Count })
        $activityDataList.Add([PSCustomObject]@{ Category = "Summary"; Metric = "Disabled Guests"; Count = $disabledGuests.Count })

        $topPartnerDomainsCount = 10 # Default
        if ($Configuration.discovery.externalIdentity -and $Configuration.discovery.externalIdentity.topPartnerDomainsToAnalyze) {
            try { $topPartnerDomainsCount = [int]$Configuration.discovery.externalIdentity.topPartnerDomainsToAnalyze } catch {}
        }
        $guestDomains = $GuestUsers | Where-Object GuestDomain -ne "Unknown" | Group-Object -Property GuestDomain | Sort-Object Count -Descending
        foreach ($domain in $guestDomains | Select-Object -First $topPartnerDomainsCount) {
            $domainActiveCount = ($domain.Group | Where-Object { $_.AccountEnabled -and $_.LastSignInDateTime -and ([DateTime]$_.LastSignInDateTime -gt (Get-Date).AddDays(-90)) }).Count
            $activityDataList.Add([PSCustomObject]@{ Category = "By Domain"; Metric = $domain.Name; Count = $domain.Count; Details = "Active: $domainActiveCount of $($domain.Count)"})
        }
        
        # Logic for $guestsByAge from your original script
        $guestsByAge = @{ "Last30Days" = 0; "Last90Days" = 0; "Last180Days" = 0; "LastYear" = 0; "OverYear" = 0 }
        foreach ($guest in $GuestUsers) {
            if ($guest.CreatedDateTime) {
                $ageDays = ((Get-Date) - [DateTime]$guest.CreatedDateTime).TotalDays
                if ($ageDays -le 30) { $guestsByAge["Last30Days"]++ }
                elseif ($ageDays -le 90) { $guestsByAge["Last90Days"]++ }
                elseif ($ageDays -le 180) { $guestsByAge["Last180Days"]++ }
                elseif ($ageDays -le 365) { $guestsByAge["LastYear"]++ }
                else { $guestsByAge["OverYear"]++ }
            }
        }
        foreach ($ageGroup in $guestsByAge.GetEnumerator()) {
            $activityDataList.Add([PSCustomObject]@{ 
                Category = "By Invitation Age"; Metric = $ageGroup.Key; Count = $ageGroup.Value 
                Percentage = if ($GuestUsers.Count -gt 0) { [math]::Round(($ageGroup.Value / $GuestUsers.Count) * 100, 2) } else { 0 }
                Details = "Guests invited in this time period"
            })
        }

        if ($activityDataList.Count -gt 0) {
            Export-DataToCSV -InputObject $activityDataList -FileName "GuestUserActivity.csv" -OutputPath $OutputPath
            Write-MandALog "Exported $($activityDataList.Count) guest user activity metrics." -Level "SUCCESS"
        } else { Write-MandALog "No guest user activity data to export." -Level "INFO" }
        return $activityDataList
    } catch { Write-MandALog "Error analyzing guest user activity: $($_.Exception.Message)" -Level "ERROR"; return @() }
}

function Get-PartnerOrganizationsDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$OutputPath,
        [Parameter(Mandatory=$true)][hashtable]$Configuration,
        [Parameter(Mandatory=$false)][array]$GuestUsers
    )
    $outputFile = Join-Path $OutputPath "PartnerOrganizations.csv"
    $partnerDataList = [System.Collections.Generic.List[PSCustomObject]]::new()

    if (($Configuration.discovery.skipExistingFiles -as [bool]) -and (Test-Path $outputFile)) {
        Write-MandALog "Partner orgs CSV '$outputFile' exists. Skipping." -Level "INFO"
        try { return Import-DataFromCSV -FilePath $outputFile } catch { Write-MandALog "Failed to import PartnerOrganizations.csv: $($_.Exception.Message)" -Level "WARN"; return @() }
    }
    if (-not $GuestUsers -or $GuestUsers.Count -eq 0) { Write-MandALog "No guest users for partner org analysis. Skipping." -Level "INFO"; return @() }
    try {
        Write-MandALog "Analyzing partner organizations from $($GuestUsers.Count) guest users..." -Level "INFO"
        $partnerDomains = $GuestUsers | Where-Object GuestDomain -ne "Unknown" | Group-Object -Property GuestDomain | Sort-Object Count -Descending
        
        foreach ($partner in $partnerDomains) {
            $partnerGuests = $partner.Group
            $activeCount = ($partnerGuests | Where-Object { $_.AccountEnabled -and $_.LastSignInDateTime -and ([DateTime]$_.LastSignInDateTime -gt (Get-Date).AddDays(-90)) }).Count
            $inactiveCount = ($partnerGuests | Where-Object { $_.AccountEnabled -and (-not $_.LastSignInDateTime -or [DateTime]$_.LastSignInDateTime -le (Get-Date).AddDays(-90)) }).Count
            $disabledCount = ($partnerGuests | Where-Object { -not $_.AccountEnabled }).Count
            
            $departments = $partnerGuests | Where-Object { $_.Department } | Select-Object -ExpandProperty Department -Unique
            $jobTitles = $partnerGuests | Where-Object { $_.JobTitle } | Select-Object -ExpandProperty JobTitle -Unique
            
            # Group memberships (simplified from your original - your original was more detailed per guest)
            # This part would need careful re-integration if you need the exact same group membership analysis per partner org.
            # For now, just getting a count of unique groups associated with guests from this partner domain.
            $allPartnerGroups = @()
            # foreach($guest in $partnerGuests){ if($guest.GroupMemberships){ $allPartnerGroups += ($guest.GroupMemberships -split ';') } } # Assuming GroupMemberships was a string
            # This requires GroupMemberships to be populated on the $guest objects passed in. Get-B2BGuestUsersDataInternal does not populate this by default.

            $partnerType = "External Partner"
            if ($partner.Name -match '\.(edu|ac\.|university\.)') { $partnerType = "Educational Institution" } 
            elseif ($partner.Name -match '\.(gov|mil)$') { $partnerType = "Government" } 
            elseif ($partner.Name -match '(gmail|yahoo|hotmail|outlook|live)\.com$') { $partnerType = "Consumer Email" }

            $riskLevel = "Low"; $riskFactors = @()
            if ($partnerType -eq "Consumer Email") { $riskLevel = "Medium"; $riskFactors += "Consumer email domain" }
            if ($inactiveCount -gt ($partnerGuests.Count * 0.5)) { $riskLevel = "Medium"; $riskFactors += "High percentage of inactive users" }
            if ($partnerGuests.Count -eq 1 -and $partnerType -ne "Consumer Email") { $riskFactors += "Single user from organization" }

            $partnerDataList.Add([PSCustomObject]@{
                PartnerDomain = $partner.Name; PartnerType = $partnerType; TotalGuests = $partnerGuests.Count
                ActiveGuests = $activeCount; InactiveGuests = $inactiveCount; DisabledGuests = $disabledCount
                ActivityRate = if ($partnerGuests.Count -gt 0) { [math]::Round(($activeCount / $partnerGuests.Count) * 100, 2) } else { 0 }
                UniqueDepartmentsCount = $departments.Count; Departments = ($departments -join ";")
                UniqueJobTitlesCount = $jobTitles.Count; TopJobTitles = (($jobTitles | Select-Object -First 5) -join ";")
                # UniqueGroupMemberships = ($allPartnerGroups | Select-Object -Unique).Count
                # TopGroups = (($allPartnerGroups | Group-Object | Sort-Object Count -Descending | Select-Object -First 5 -ExpandProperty Name) -join ";")
                OldestGuestDate = ($partnerGuests.CreatedDateTime | Where-Object {$_} | Measure-Object -Minimum -ErrorAction SilentlyContinue).Minimum
                NewestGuestDate = ($partnerGuests.CreatedDateTime | Where-Object {$_} | Measure-Object -Maximum -ErrorAction SilentlyContinue).Maximum
                RiskLevel = $riskLevel; RiskFactors = ($riskFactors -join ";")
            })
        }
        if ($partnerDataList.Count -gt 0) {
            Export-DataToCSV -InputObject $partnerDataList -FileName "PartnerOrganizations.csv" -OutputPath $OutputPath
            Write-MandALog "Exported analysis for $($partnerDataList.Count) partner organizations." -Level "SUCCESS"
        } else { Write-MandALog "No partner organization data to export." -Level "INFO" }
        return $partnerDataList
    } catch { Write-MandALog "Error analyzing partner organizations: $($_.Exception.Message)" -Level "ERROR"; return @() }
}

function Get-ExternalIdentityProvidersDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$OutputPath,
        [Parameter(Mandatory=$true)][hashtable]$Configuration
    )
    $outputFile = Join-Path $OutputPath "ExternalIdentityProviders.csv"
    $providerDataList = [System.Collections.Generic.List[PSCustomObject]]::new()

    if (($Configuration.discovery.skipExistingFiles -as [bool]) -and (Test-Path $outputFile)) {
        Write-MandALog "External IdPs CSV '$outputFile' exists. Skipping." -Level "INFO"
        try { return Import-DataFromCSV -FilePath $outputFile } catch { Write-MandALog "Failed to import ExternalIdentityProviders.csv: $($_.Exception.Message)" -Level "WARN"; return @() }
    }
    try {
        Write-MandALog "Retrieving external identity providers..." -Level "INFO"
        $identityProviders = Get-MgIdentityProvider -All -ErrorAction SilentlyContinue
        if ($identityProviders) {
            foreach ($provider in $identityProviders) {
                $providerType = "Unknown"
                if ($provider.AdditionalProperties -and $provider.AdditionalProperties.ContainsKey("@odata.type")) {
                    $providerType = $provider.AdditionalProperties["@odata.type"].Replace("#microsoft.graph.","")
                }
                $providerDataList.Add([PSCustomObject]@{ 
                    ProviderId   = $provider.Id
                    ProviderType = $providerType 
                    DisplayName  = $provider.DisplayName
                    ClientId     = $provider.ClientId # May be null depending on provider type
                    # Add other relevant properties based on provider type, e.g., $provider.IssuerUri for SAML/WSFed
                })
            }
        }
        # Add default Azure AD provider as in your original script
        $providerDataList.Add([PSCustomObject]@{ ProviderId = "AzureAD-B2B-Default"; ProviderType = "AzureActiveDirectory"; DisplayName = "Azure AD B2B (Default)" })

        if ($providerDataList.Count -gt 0) {
            Export-DataToCSV -InputObject $providerDataList -FileName "ExternalIdentityProviders.csv" -OutputPath $OutputPath
            Write-MandALog "Exported $($providerDataList.Count) external identity providers." -Level "SUCCESS"
        } else { Write-MandALog "No external identity provider data to export." -Level "INFO" }
        return $providerDataList
    } catch { Write-MandALog "Error retrieving external IdPs: $($_.Exception.Message)" -Level "ERROR"; return @() }
}

function Get-GuestInvitationsDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$OutputPath,
        [Parameter(Mandatory=$true)][hashtable]$Configuration
    )
    $outputFile = Join-Path $OutputPath "GuestInvitationsSummary.csv"
    $invitationSummaryList = [System.Collections.Generic.List[PSCustomObject]]::new()

    if (($Configuration.discovery.skipExistingFiles -as [bool]) -and (Test-Path $outputFile)) {
        Write-MandALog "Guest invitations CSV '$outputFile' exists. Skipping." -Level "INFO"
        try { return Import-DataFromCSV -FilePath $outputFile } catch { Write-MandALog "Failed to import GuestInvitationsSummary.csv: $($_.Exception.Message)" -Level "WARN"; return @() }
    }
    try {
        Write-MandALog "Analyzing guest invitations..." -Level "INFO"
        # Attempt to get actual invitations
        $invitations = Get-MgInvitation -All -ErrorAction SilentlyContinue # -All can be slow
        if ($invitations) {
            foreach ($inv in $invitations) {
                $invitationSummaryList.Add([PSCustomObject]@{
                    InvitationId        = $inv.Id
                    InvitedUserEmail    = $inv.InvitedUserEmailAddress
                    InvitedUserDisplayName= $inv.InvitedUserDisplayName
                    InvitedUserType     = $inv.InvitedUserType
                    InviteRedeemUrl     = $inv.InviteRedeemUrl
                    InviteRedirectUrl   = $inv.InviteRedirectUrl
                    Status              = $inv.Status
                    SendInvitationMessage = $inv.SendInvitationMessage
                    InvitedByUserUPN    = if($inv.InvitedByUser){$inv.InvitedByUser.UserPrincipalName} else {$null} # Check if InvitedByUser exists
                })
            }
        } else {
            Write-MandALog "No direct invitation objects found via Get-MgInvitation. Fallback to recent guest users for summary." -Level "INFO"
            $recentGuestCount = 50 # Default
            if ($Configuration.discovery.externalIdentity -and $Configuration.discovery.externalIdentity.recentGuestCountForInvitationFallback) {
                try { $recentGuestCount = [int]$Configuration.discovery.externalIdentity.recentGuestCountForInvitationFallback } catch {}
            }
            # Corrected Get-MgUser call: Removed -OrderBy
            $recentGuestUsers = Get-MgUser -Filter "userType eq 'Guest'" -Top $recentGuestCount -Select "id,displayName,userPrincipalName,createdDateTime,externalUserState,creationType" -ErrorAction SilentlyContinue
            if ($recentGuestUsers) {
                foreach ($guest in $recentGuestUsers) {
                    $invitationSummaryList.Add([PSCustomObject]@{ 
                        InvitationId        = "N/A (from user object)"
                        InvitedUserEmail    = $guest.userPrincipalName # Or $guest.Mail
                        InvitedUserDisplayName= $guest.displayName
                        InvitedUserType     = $guest.userType
                        Status              = $guest.externalUserState
                        InvitedByUserUPN    = "Unknown (from user data)"
                        CreatedDateTime_User = $guest.createdDateTime
                    })
                }
            }
        }
        if ($invitationSummaryList.Count -gt 0) {
            Export-DataToCSV -InputObject $invitationSummaryList -FileName "GuestInvitationsSummary.csv" -OutputPath $OutputPath
            Write-MandALog "Exported summary for $($invitationSummaryList.Count) guest invitations/users." -Level "SUCCESS"
        } else { Write-MandALog "No guest invitation summary data to export." -Level "INFO" }
        return $invitationSummaryList
    } catch { Write-MandALog "Error analyzing guest invitations: $($_.Exception.Message)" -Level "ERROR"; return @() }
}

function Get-CrossTenantAccessDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$OutputPath,
        [Parameter(Mandatory=$true)][hashtable]$Configuration
    )
    $outputFile = Join-Path $OutputPath "CrossTenantAccessPolicy.csv"
    $accessDataList = [System.Collections.Generic.List[PSObject]]::new()

    if (($Configuration.discovery.skipExistingFiles -as [bool]) -and (Test-Path $outputFile)) {
        Write-MandALog "Cross-tenant access policy CSV '$outputFile' exists. Skipping." -Level "INFO"
        try { return Import-DataFromCSV -FilePath $outputFile } catch { Write-MandALog "Failed to import CrossTenantAccessPolicy.csv: $($_.Exception.Message)" -Level "WARN"; return @() }
    }
    try {
        Write-MandALog "Retrieving cross-tenant access policy (v1.0 SDK)..." -Level "INFO"
        $policy = Get-MgPolicyCrossTenantAccessPolicy -ErrorAction SilentlyContinue
        if ($policy) {
            if ($policy.Default) {
                $accessDataList.Add([PSCustomObject]@{ 
                    PolicyType = "Default"; TenantId = "All Tenants"; TenantDisplayName = "Default Configuration"
                    B2BCollabInboundAccessType = $policy.Default.B2BCollaborationInbound.UsersAndGroups.AccessType.ToString()
                    B2BCollabOutboundAccessType = $policy.Default.B2BCollaborationOutbound.UsersAndGroups.AccessType.ToString()
                    B2BDirectConnectInboundAccessType = $policy.Default.B2BDirectConnectInbound.UsersAndGroups.AccessType.ToString()
                    B2BDirectConnectOutboundAccessType = $policy.Default.B2BDirectConnectOutbound.UsersAndGroups.AccessType.ToString()
                    InboundTrustMfaAccepted = $policy.Default.InboundTrust.IsMfaAccepted
                    InboundTrustCompliantDeviceAccepted = $policy.Default.InboundTrust.IsCompliantDeviceAccepted
                    InboundTrustHybridAadjAccepted = $policy.Default.InboundTrust.IsHybridAzureADJoinedDeviceAccepted
                })
            }
            # Get-MgPolicyCrossTenantAccessPolicyPartner requires Microsoft.Graph.Identity.SignIns or similar for the /partners endpoint.
            # Ensure the #Requires statement includes the necessary module for this cmdlet.
            $partners = Get-MgPolicyCrossTenantAccessPolicyPartner -All -ErrorAction SilentlyContinue
            if ($partners) {
                foreach ($partner in $partners) {
                    $accessDataList.Add([PSCustomObject]@{ 
                        PolicyType = "Partner"; TenantId = $partner.TenantId; TenantDisplayName = "Partner: $($partner.TenantId)" 
                        B2BCollabInboundAccessType = $partner.B2BCollaborationInbound.UsersAndGroups.AccessType.ToString()
                        B2BCollabOutboundAccessType = $partner.B2BCollaborationOutbound.UsersAndGroups.AccessType.ToString()
                        B2BDirectConnectInboundAccessType = $partner.B2BDirectConnectInbound.UsersAndGroups.AccessType.ToString()
                        B2BDirectConnectOutboundAccessType = $partner.B2BDirectConnectOutbound.UsersAndGroups.AccessType.ToString()
                        InboundTrustMfaAccepted = $partner.InboundTrust.IsMfaAccepted
                        InboundTrustCompliantDeviceAccepted = $partner.InboundTrust.IsCompliantDeviceAccepted
                        InboundTrustHybridAadjAccepted = $partner.InboundTrust.IsHybridAzureADJoinedDeviceAccepted
                        AutomaticUserConsentOutbound = if($partner.AutomaticUserConsentSettings -and $partner.AutomaticUserConsentSettings.PSObject.Properties['IsOutboundAllowed']){$partner.AutomaticUserConsentSettings.IsOutboundAllowed}else{$null} # Corrected property
                    })
                }
            }
        }
        if ($accessDataList.Count -gt 0) {
            Export-DataToCSV -InputObject $accessDataList -FileName "CrossTenantAccessPolicy.csv" -OutputPath $OutputPath
            Write-MandALog "Exported $($accessDataList.Count) cross-tenant access policy settings." -Level "SUCCESS"
        } else { Write-MandALog "No cross-tenant access policy data to export." -Level "INFO" }
        return $accessDataList
    } catch { Write-MandALog "Error retrieving cross-tenant access policy: $($_.Exception.Message)" -Level "ERROR"; return @() }
}

Export-ModuleMember -Function Invoke-ExternalIdentityDiscovery
