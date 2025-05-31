# Module: ExternalIdentityDiscovery.psm1
# Description: Discovers B2B guest users, collaboration settings, external identity providers, and partner organizations.
# Version: 1.3.0 (Merged comprehensive functionality with fixes)
# Date: 2025-05-31

#Requires -Modules Microsoft.Graph.Authentication, Microsoft.Graph.Users, Microsoft.Graph.Identity.SignIns 
#Requires -Modules Microsoft.Graph.Identity.DirectoryManagement, Microsoft.Graph.Beta.Identity.SignIns # For some policy/audit features
#Requires -Modules Microsoft.Graph.Policies # For Get-MgPolicyAuthorizationPolicy, Get-MgPolicyB2BManagementPolicy, Get-MgPolicyCrossTenantAccessPolicy
#Requires -Modules Microsoft.Graph.Beta.Policies # If using beta endpoint for CrossTenantAccessPolicy via Invoke-MgGraphRequest
#Requires -Modules Microsoft.Online.SharePoint.PowerShell # For Get-SPOTenant (if used and enabled)
#Requires -Modules MicrosoftTeams # For Get-CsTenantFederationConfiguration (if used and enabled)

# --- Helper Functions (Assumed to be available globally from Utility Modules) ---
# Export-DataToCSV -InputObject $Data -FileName "Filename.csv" -OutputPath $Path
# Import-DataFromCSV -FilePath $Path
# Write-MandALog -Message "Log message" -Level "INFO"
# Invoke-MgGraphRequest (If you have a custom wrapper for direct Graph calls, otherwise use SDK cmdlets)

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
        $rawPath = Join-Path $outputPath "Raw" # Ensure this path exists or is created by FileOperations module
        if (-not (Test-Path $rawPath -PathType Container)) {
            try { New-Item -Path $rawPath -ItemType Directory -Force -ErrorAction Stop | Out-Null }
            catch { Write-MandALog "Failed to create Raw output directory: $rawPath. Error: $($_.Exception.Message)" -Level "ERROR"; throw }
        }

        $discoveryResults = @{}

        # Verify Graph connection
        $context = Get-MgContext -ErrorAction SilentlyContinue
        if (-not $context) {
            Write-MandALog "Microsoft Graph not connected. Skipping external identity discovery." -Level "WARN"
            return @{} # Return empty hashtable
        }
        Write-MandALog "Graph context active for External Identity discovery." -Level "INFO"
            
        if ($script:ExecutionMetrics -is [hashtable]) {
            $script:ExecutionMetrics.Phase = "External Identity Discovery"
        }

        # B2B Guest Users
        Write-MandALog "Discovering B2B guest users..." -Level "INFO"
        $b2bGuests = Get-B2BGuestUsersDataInternal -OutputPath $rawPath -Configuration $Configuration
        $discoveryResults.B2BGuests = $b2bGuests 

        # External Collaboration Settings
        Write-MandALog "Discovering external collaboration settings..." -Level "INFO"
        $discoveryResults.CollaborationSettings = Get-ExternalCollaborationSettingsDataInternal -OutputPath $rawPath -Configuration $Configuration

        # Guest User Activity (Passes the already discovered guests)
        Write-MandALog "Analyzing guest user activity..." -Level "INFO"
        $discoveryResults.GuestActivity = Get-GuestUserActivityDataInternal -OutputPath $rawPath -Configuration $Configuration -GuestUsers $b2bGuests

        # Partner Organizations (Passes the already discovered guests)
        Write-MandALog "Discovering partner organizations..." -Level "INFO"
        $discoveryResults.PartnerOrganizations = Get-PartnerOrganizationsDataInternal -OutputPath $rawPath -Configuration $Configuration -GuestUsers $b2bGuests

        # External Identity Providers
        Write-MandALog "Discovering external identity providers..." -Level "INFO"
        $discoveryResults.IdentityProviders = Get-ExternalIdentityProvidersDataInternal -OutputPath $rawPath -Configuration $Configuration

        # Guest Invitations
        Write-MandALog "Analyzing guest invitations..." -Level "INFO"
        $discoveryResults.GuestInvitations = Get-GuestInvitationsDataInternal -OutputPath $rawPath -Configuration $Configuration

        # Cross-Tenant Access
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
            # 'memberOf' can be very slow with -All and -ExpandProperty. Fetch separately if needed.
            # 'riskLevel', 'riskState' require specific Identity Protection P2 licenses and permissions.
        )
        
        # Using -All for pagination. This can be slow for very large tenants.
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
                GuestId                         = $guest.Id
                UserPrincipalName               = $guest.UserPrincipalName
                DisplayName                     = $guest.DisplayName
                Mail                            = $guest.Mail
                GuestDomain                     = $guestDomain
                CreationType                    = $guest.CreationType
                UserType                        = $guest.UserType
                AccountEnabled                  = $guest.AccountEnabled
                ExternalUserState               = if($guest.ExternalUserState){$guest.ExternalUserState.ToString()}else{$null}
                ExternalUserStateChangeDateTime = $guest.ExternalUserStateChangeDateTime
                CreatedDateTime                 = $guest.CreatedDateTime
                CompanyName                     = $guest.CompanyName
                Department                      = $guest.Department
                JobTitle                        = $guest.JobTitle
                UsageLocation                   = $guest.UsageLocation
                PreferredLanguage               = $guest.PreferredLanguage
                AppRoleAssignmentCount          = $appRoleAssignmentsCount
                LastSignInDateTime              = if ($guest.SignInActivity) { $guest.SignInActivity.LastSignInDateTime } else { $null }
                LastNonInteractiveSignInDateTime = if ($guest.SignInActivity) { $guest.SignInActivity.LastNonInteractiveSignInDateTime } else { $null }
                RefreshTokensValidFromDateTime  = $guest.RefreshTokensValidFromDateTime
            })
        }
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
        Write-MandALog "External collaboration settings CSV '$outputFile' already exists. Skipping." -Level "INFO"
        try { return Import-DataFromCSV -FilePath $outputFile } catch { Write-MandALog "Failed to import existing ExternalCollaborationSettings.csv: $($_.Exception.Message)" -Level "WARN"; return @() }
    }
    try {
        Write-MandALog "Retrieving external collaboration settings (Authorization Policy)..." -Level "INFO"
        $authPolicy = Get-MgPolicyAuthorizationPolicy -ErrorAction SilentlyContinue
        if ($authPolicy) {
            $settingsData.Add([PSCustomObject]@{ SettingCategory = "Guest User Permissions (AuthorizationPolicy)"; SettingName = "GuestUserRoleId"; SettingValue = $authPolicy.GuestUserRoleId; Description = "Default role for new guests."})
            if ($authPolicy.DefaultUserRolePermissions) {
                $settingsData.Add([PSCustomObject]@{ SettingCategory = "Guest User Permissions (AuthorizationPolicy)"; SettingName = "AllowedToInvite"; SettingValue = $authPolicy.DefaultUserRolePermissions.AllowedToInvite; Description = "Default users can invite."})
                $settingsData.Add([PSCustomObject]@{ SettingCategory = "Guest User Permissions (AuthorizationPolicy)"; SettingName = "AllowedToReadOtherUsers"; SettingValue = $authPolicy.DefaultUserRolePermissions.AllowedToReadOtherUsers; Description = "Default users can read others."})
            } else { Write-MandALog "DefaultUserRolePermissions not found on Authorization Policy." -Level "WARN"}
        } else { Write-MandALog "Could not retrieve Authorization Policy." -Level "WARN" }

        $collectSPOSettings = $false
        if($Configuration.discovery.externalIdentity -and $Configuration.discovery.externalIdentity.ContainsKey('collectSharePointSettings')){
            $collectSPOSettings = $Configuration.discovery.externalIdentity.collectSharePointSettings -as [bool]
        }
        if ($collectSPOSettings -and (Get-Command Get-SPOTenant -ErrorAction SilentlyContinue)) {
            # This section requires separate authentication to SharePoint Online Admin Center
            # Ensure Connect-SPOService is called with appropriate credentials before this.
            # This is a simplified example and may need robust error handling and credential management.
            Write-MandALog "Attempting to retrieve SharePoint Online external sharing settings (ensure SPO connection)..." -Level "INFO"
            try {
                # Example: $spoAdminUrl = "https://$(($Configuration.environment.tenantName).Replace('.onmicrosoft.com',''))-admin.sharepoint.com"
                # Connect-SPOService -Url $spoAdminUrl -Credential $global:SPOAdminCredential # Needs $global:SPOAdminCredential
                $spoTenant = Get-SPOTenant -ErrorAction SilentlyContinue
                if ($spoTenant) {
                    $settingsData.Add([PSCustomObject]@{ SettingCategory = "SharePoint Sharing"; SettingName = "SharingCapability"; SettingValue = $spoTenant.SharingCapability.ToString() })
                    $settingsData.Add([PSCustomObject]@{ SettingCategory = "SharePoint Sharing"; SettingName = "RequireAcceptingUserToMatchInvitedUser"; SettingValue = $spoTenant.RequireAcceptingUserToMatchInvitedUser })
                } else { Write-MandALog "Get-SPOTenant did not return data. Ensure connection to SPO Admin Center." -Level "WARN"}
            } catch { Write-MandALog "Could not retrieve SharePoint settings: $($_.Exception.Message)" -Level "WARN" }
        } elseif($collectSPOSettings) { Write-MandALog "SharePoint module/cmdlet Get-SPOTenant not found or collection disabled. Skipping SPO settings." -Level "INFO" }

        $collectTeamsSettings = $false
        if($Configuration.discovery.externalIdentity -and $Configuration.discovery.externalIdentity.ContainsKey('collectTeamsSettings')){
            $collectTeamsSettings = $Configuration.discovery.externalIdentity.collectTeamsSettings -as [bool]
        }
        if ($collectTeamsSettings -and (Get-Command Get-CsTenantFederationConfiguration -ErrorAction SilentlyContinue)) {
            # Requires separate connection to Microsoft Teams PowerShell
            Write-MandALog "Attempting to retrieve Teams external access settings (ensure Teams connection)..." -Level "INFO"
            try {
                # Example: Connect-MicrosoftTeams -Credential $global:TeamsAdminCredential # Needs $global:TeamsAdminCredential
                $teamsConfig = Get-CsTenantFederationConfiguration -ErrorAction SilentlyContinue
                if ($teamsConfig) {
                    $settingsData.Add([PSCustomObject]@{ SettingCategory = "Teams External Access"; SettingName = "AllowFederatedUsers"; SettingValue = $teamsConfig.AllowFederatedUsers })
                    $settingsData.Add([PSCustomObject]@{ SettingCategory = "Teams External Access"; SettingName = "AllowPublicUsers"; SettingValue = $teamsConfig.AllowPublicUsers })
                } else { Write-MandALog "Get-CsTenantFederationConfiguration did not return data. Ensure connection to Teams." -Level "WARN" }
            } catch { Write-MandALog "Could not retrieve Teams settings: $($_.Exception.Message)" -Level "WARN" }
        } elseif($collectTeamsSettings) { Write-MandALog "MicrosoftTeams module/cmdlet Get-CsTenantFederationConfiguration not found or collection disabled. Skipping Teams settings." -Level "INFO" }

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
        Write-MandALog "Guest user activity CSV '$outputFile' already exists. Skipping." -Level "INFO"
        try { return Import-DataFromCSV -FilePath $outputFile } catch { Write-MandALog "Failed to import existing GuestUserActivity.csv: $($_.Exception.Message)" -Level "WARN"; return @() }
    }
    if (-not $GuestUsers -or $GuestUsers.Count -eq 0) {
        Write-MandALog "No guest users provided for activity analysis. Skipping." -Level "INFO"
        return @()
    }
    try {
        Write-MandALog "Analyzing guest user activity for $($GuestUsers.Count) users..." -Level "INFO"
        
        $activeGuests = $GuestUsers | Where-Object { $_.AccountEnabled -and $_.LastSignInDateTime -and ([DateTime]$_.LastSignInDateTime -gt (Get-Date).AddDays(-90)) }
        $inactiveGuests = $GuestUsers | Where-Object { $_.AccountEnabled -and (-not $_.LastSignInDateTime -or [DateTime]$_.LastSignInDateTime -le (Get-Date).AddDays(-90)) } # Corrected logic for inactive
        $disabledGuests = $GuestUsers | Where-Object { -not $_.AccountEnabled }
        $neverSignedInGuests = $GuestUsers | Where-Object { $_.AccountEnabled -and -not $_.LastSignInDateTime }

        $activityDataList.Add([PSCustomObject]@{ Category = "Summary"; Metric = "Total Guest Users"; Count = $GuestUsers.Count })
        $activityDataList.Add([PSCustomObject]@{ Category = "Summary"; Metric = "Active Guests (90 days)"; Count = $activeGuests.Count })
        $activityDataList.Add([PSCustomObject]@{ Category = "Summary"; Metric = "Inactive Guests (90+ days or never)"; Count = $inactiveGuests.Count }) # Clarified metric
        $activityDataList.Add([PSCustomObject]@{ Category = "Summary"; Metric = "Never Signed In (but enabled)"; Count = $neverSignedInGuests.Count })
        $activityDataList.Add([PSCustomObject]@{ Category = "Summary"; Metric = "Disabled Guests"; Count = $disabledGuests.Count })

        $guestDomains = $GuestUsers | Where-Object GuestDomain -ne "Unknown" | Group-Object -Property GuestDomain | Sort-Object Count -Descending
        foreach ($domain in $guestDomains | Select-Object -First ($Configuration.discovery.externalIdentity.topPartnerDomainsToAnalyze | Get-Default 10)) {
            $domainActiveCount = ($domain.Group | Where-Object { $_.AccountEnabled -and $_.LastSignInDateTime -and ([DateTime]$_.LastSignInDateTime -gt (Get-Date).AddDays(-90)) }).Count
            $activityDataList.Add([PSCustomObject]@{ Category = "By Domain"; Metric = $domain.Name; Count = $domain.Count; Details = "Active: $domainActiveCount of $($domain.Count)"})
        }

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
            $activityDataList.Add([PSCustomObject]@{ Category = "By Invitation Age"; Metric = $ageGroup.Key; Count = $ageGroup.Value })
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
        Write-MandALog "Partner organizations CSV '$outputFile' already exists. Skipping." -Level "INFO"
        try { return Import-DataFromCSV -FilePath $outputFile } catch { Write-MandALog "Failed to import existing PartnerOrganizations.csv: $($_.Exception.Message)" -Level "WARN"; return @() }
    }
    if (-not $GuestUsers -or $GuestUsers.Count -eq 0) {
        Write-MandALog "No guest users provided for partner organization analysis. Skipping." -Level "INFO"
        return @()
    }
    try {
        Write-MandALog "Analyzing partner organizations from $($GuestUsers.Count) guest users..." -Level "INFO"
        $partnerDomains = $GuestUsers | Where-Object GuestDomain -ne "Unknown" | Group-Object -Property GuestDomain | Sort-Object Count -Descending

        foreach ($partner in $partnerDomains) {
            $partnerGuests = $partner.Group
            $activeCount = ($partnerGuests | Where-Object { $_.AccountEnabled -and $_.LastSignInDateTime -and ([DateTime]$_.LastSignInDateTime -gt (Get-Date).AddDays(-90)) }).Count
            $inactiveCount = ($partnerGuests | Where-Object { $_.AccountEnabled -and (-not $_.LastSignInDateTime -or [DateTime]$_.LastSignInDateTime -le (Get-Date).AddDays(-90)) }).Count
            $disabledCount = ($partnerGuests | Where-Object { -not $_.AccountEnabled }).Count
            
            # Simplified risk for example
            $riskLevel = "Low"; if ($partnerGuests.Count -gt 100 -and $inactiveCount -gt ($partnerGuests.Count * 0.75)) { $riskLevel = "Medium" }

            $partnerDataList.Add([PSCustomObject]@{
                PartnerDomain = $partner.Name; TotalGuests = $partnerGuests.Count; ActiveGuests = $activeCount
                InactiveGuests = $inactiveCount; DisabledGuests = $disabledCount
                ActivityRate = if ($partnerGuests.Count -gt 0) { [math]::Round(($activeCount / $partnerGuests.Count) * 100, 2) } else { 0 }
                RiskLevel = $riskLevel
                # Add more detailed analysis from your original script here (departments, job titles, groups, etc.)
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
        Write-MandALog "External IdPs CSV '$outputFile' already exists. Skipping." -Level "INFO"
        try { return Import-DataFromCSV -FilePath $outputFile } catch { Write-MandALog "Failed to import existing ExternalIdentityProviders.csv: $($_.Exception.Message)" -Level "WARN"; return @() }
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
                    ProviderId   = $provider.Id; ProviderType = $providerType 
                    DisplayName  = $provider.DisplayName; ClientId = $provider.ClientId 
                    # Add other relevant properties based on provider type, e.g., $provider.IssuerUri for SAML
                })
            }
        }
        $providerDataList.Add([PSCustomObject]@{ ProviderId = "AzureAD-B2B-Default"; ProviderType = "AzureActiveDirectory"; DisplayName = "Azure AD B2B (Default)" })

        if ($providerDataList.Count -gt 0) {
            Export-DataToCSV -InputObject $providerDataList -FileName "ExternalIdentityProviders.csv" -OutputPath $OutputPath
            Write-MandALog "Exported $($providerDataList.Count) external identity providers." -Level "SUCCESS"
        } else { Write-MandALog "No external identity provider data to export." -Level "INFO" }
        return $providerDataList
    } catch { Write-MandALog "Error retrieving external identity providers: $($_.Exception.Message)" -Level "ERROR"; return @() }
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
        Write-MandALog "Guest invitations CSV '$outputFile' already exists. Skipping." -Level "INFO"
        try { return Import-DataFromCSV -FilePath $outputFile } catch { Write-MandALog "Failed to import GuestInvitationsSummary.csv: $($_.Exception.Message)" -Level "WARN"; return @() }
    }
    try {
        Write-MandALog "Analyzing guest invitations..." -Level "INFO"
        $invitations = Get-MgInvitation -All -ErrorAction SilentlyContinue # -All can be slow, consider -Top
        if ($invitations) {
            foreach ($inv in $invitations) {
                $invitationSummaryList.Add([PSCustomObject]@{
                    InvitationId        = $inv.Id; InvitedUserEmail = $inv.InvitedUserEmailAddress
                    InvitedUserDisplayName= $inv.InvitedUserDisplayName; InvitedUserType = $inv.InvitedUserType
                    InviteRedeemUrl     = $inv.InviteRedeemUrl; InviteRedirectUrl = $inv.InviteRedirectUrl
                    Status              = $inv.Status; SendInvitationMessage = $inv.SendInvitationMessage
                    InvitedByUserUPN    = if($inv.InvitedByUser){$inv.InvitedByUser.UserPrincipalName} else {$null}
                })
            }
        } else {
            Write-MandALog "No direct invitation objects found via Get-MgInvitation. Fallback to recent guest users." -Level "INFO"
            $recentGuestCount = if ($Configuration.discovery.externalIdentity.recentGuestCountForInvitationFallback) { [int]$Configuration.discovery.externalIdentity.recentGuestCountForInvitationFallback } else { 50 }
            # FIX: Removed -OrderBy from Get-MgUser call
            $recentGuestUsers = Get-MgUser -Filter "userType eq 'Guest'" -Top $recentGuestCount -Select "id,displayName,userPrincipalName,createdDateTime,externalUserState,creationType" -ErrorAction SilentlyContinue
            if ($recentGuestUsers) {
                foreach ($guest in $recentGuestUsers) {
                    $invitationSummaryList.Add([PSCustomObject]@{
                        InvitationId = "N/A (from user object)"; InvitedUserEmail = $guest.userPrincipalName
                        InvitedUserDisplayName= $guest.displayName; InvitedUserType = $guest.userType; Status = $guest.externalUserState
                        InvitedByUserUPN = "Unknown (from user data)"; CreatedDateTime_User = $guest.createdDateTime
                    })}}}
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
    $accessDataList = [System.Collections.Generic.List[PSCustomObject]]::new()

    if (($Configuration.discovery.skipExistingFiles -as [bool]) -and (Test-Path $outputFile)) {
        Write-MandALog "Cross-tenant access policy CSV '$outputFile' already exists. Skipping." -Level "INFO"
        try { return Import-DataFromCSV -FilePath $outputFile } catch { Write-MandALog "Failed to import CrossTenantAccessPolicy.csv: $($_.Exception.Message)" -Level "WARN"; return @() }
    }
    try {
        Write-MandALog "Retrieving cross-tenant access policy (v1.0 SDK)..." -Level "INFO"
        $policy = Get-MgPolicyCrossTenantAccessPolicy -ErrorAction SilentlyContinue
        if ($policy) {
            if ($policy.Default) {
                $accessDataList.Add([PSCustomObject]@{ PolicyType = "Default"; TenantId = "All Tenants"; TenantDisplayName = "Default Configuration"
                    B2BCollabInboundAccessType = $policy.Default.B2BCollaborationInbound.UsersAndGroups.AccessType.ToString()
                    B2BCollabOutboundAccessType = $policy.Default.B2BCollaborationOutbound.UsersAndGroups.AccessType.ToString()
                    B2BDirectInboundAccessType = $policy.Default.B2BDirectConnectInbound.UsersAndGroups.AccessType.ToString()
                    B2BDirectOutboundAccessType = $policy.Default.B2BDirectConnectOutbound.UsersAndGroups.AccessType.ToString()
                    InboundTrustMfaAccepted = $policy.Default.InboundTrust.IsMfaAccepted
                    InboundTrustCompliantDeviceAccepted = $policy.Default.InboundTrust.IsCompliantDeviceAccepted
                    InboundTrustHybridAadjAccepted = $policy.Default.InboundTrust.IsHybridAzureADJoinedDeviceAccepted
                })}
            $partners = Get-MgPolicyCrossTenantAccessPolicyPartner -All -ErrorAction SilentlyContinue
            if ($partners) {
                foreach ($partner in $partners) {
                    $accessDataList.Add([PSCustomObject]@{ PolicyType = "Partner"; TenantId = $partner.TenantId; TenantDisplayName = "Partner: $($partner.TenantId)"
                        B2BCollabInboundAccessType = $partner.B2BCollaborationInbound.UsersAndGroups.AccessType.ToString()
                        B2BCollabOutboundAccessType = $partner.B2BCollaborationOutbound.UsersAndGroups.AccessType.ToString()
                        B2BDirectInboundAccessType = $partner.B2BDirectConnectInbound.UsersAndGroups.AccessType.ToString()
                        B2BDirectOutboundAccessType = $partner.B2BDirectConnectOutbound.UsersAndGroups.AccessType.ToString()
                        InboundTrustMfaAccepted = $partner.InboundTrust.IsMfaAccepted
                        InboundTrustCompliantDeviceAccepted = $partner.InboundTrust.IsCompliantDeviceAccepted
                        InboundTrustHybridAadjAccepted = $partner.InboundTrust.IsHybridAzureADJoinedDeviceAccepted
                        AutomaticUserConsentOutbound = if($partner.AutomaticUserConsentSettings){$partner.AutomaticUserConsentSettings.IsInboundAllowed}else{$null}
                    })}}}
        if ($accessDataList.Count -gt 0) {
            Export-DataToCSV -InputObject $accessDataList -FileName "CrossTenantAccessPolicy.csv" -OutputPath $outputPath
            Write-MandALog "Exported $($accessDataList.Count) cross-tenant access policy settings." -Level "SUCCESS"
        } else { Write-MandALog "No cross-tenant access policy data to export." -Level "INFO" }
        return $accessDataList
    } catch { Write-MandALog "Error retrieving cross-tenant access policy: $($_.Exception.Message)" -Level "ERROR"; return @() }
}

Export-ModuleMember -Function Invoke-ExternalIdentityDiscovery
