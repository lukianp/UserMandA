#Requires -Modules Microsoft.Graph.Authentication, Microsoft.Graph.Users, Microsoft.Graph.Identity.SignIns, Microsoft.Graph.Identity.DirectoryManagement, Microsoft.Graph.Applications
<#
.SYNOPSIS
    Discovers B2B guest users, collaboration settings, external identity providers, and partner organizations.
.DESCRIPTION
    This module provides comprehensive External Identity discovery for the M&A Discovery Suite.
    It collects detailed information using Microsoft Graph and exports it to CSV files.
    Fixed version with corrected Export-DataToCSV calls and optional Policies module.
.NOTES
    Version: 2.0.0 (Fixed)
    Date: 2025-06-02
#>

# --- Helper Functions ---
function Export-DataToCSV {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [object[]]$Data,
        [Parameter(Mandatory=$true)]
        [string]$FileName,
        [Parameter(Mandatory=$true)]
        [string]$OutputPath
    )
    
    if (-not (Test-Path $OutputPath -PathType Container)) {
        try {
            New-Item -Path $OutputPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
            Write-MandALog "Created directory: $OutputPath" -Level "INFO"
        } catch {
            Write-MandALog "Failed to create directory $OutputPath. Error: $($_.Exception.Message)" -Level "ERROR"
            return
        }
    }
    $fullPath = Join-Path $OutputPath $FileName

    if ($null -eq $Data -or $Data.Count -eq 0) {
        Write-MandALog "No data provided to export for $FileName." -Level "WARN"
        return
    }

    try {
        Write-MandALog "Exporting $($Data.Count) records to $fullPath..." -Level "INFO"
        $Data | Export-Csv -Path $fullPath -NoTypeInformation -Force -Encoding UTF8
        Write-MandALog "Successfully exported $FileName to $fullPath" -Level "SUCCESS"
    } catch {
        Write-MandALog "Failed to export data to $fullPath. Error: $($_.Exception.Message)" -Level "ERROR"
    }
}

function Import-DataFromCSV {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath
    )
    if (-not (Test-Path $FilePath -PathType Leaf)) {
        Write-MandALog "ImportFromCSV: File not found at $FilePath" -Level "WARN"
        return @()
    }
    try {
        $data = Import-Csv -Path $FilePath -Encoding UTF8 -ErrorAction Stop
        Write-MandALog "Successfully imported $($data.Count) records from $FilePath" -Level "SUCCESS"
        return $data
    } catch {
        Write-MandALog "Failed to import CSV data from $FilePath. Error: $($_.Exception.Message)" -Level "ERROR"
        return @()
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
        Write-MandALog "B2B guest users CSV '$outputFile' already exists. Importing." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }

    try {
        Write-MandALog "Retrieving B2B guest users..." -Level "INFO"
        $propertiesToSelect = @(
            "id", "userPrincipalName", "displayName", "mail", "userType", "externalUserState", 
            "externalUserStateChangeDateTime", "createdDateTime", "creationType", "accountEnabled", 
            "companyName", "department", "jobTitle", "usageLocation", "preferredLanguage", 
            "signInActivity", "refreshTokensValidFromDateTime"
        )
        
        $guestUsers = Get-MgUser -All -Filter "userType eq 'Guest'" -Property $propertiesToSelect -ExpandProperty "signInActivity" -ErrorAction Stop

        if ($null -eq $guestUsers) { 
            Write-MandALog "No guest users returned by Get-MgUser." -Level "WARN"
            return @() 
        }
        Write-MandALog "Found $($guestUsers.Count) guest user objects to process." -Level "INFO"

        $processedCount = 0
        foreach ($guest in $guestUsers) {
            $processedCount++
            if ($processedCount % 200 -eq 0) { 
                Write-Progress -Activity "Processing Guest Users" -Status "Guest $processedCount of $($guestUsers.Count)" -PercentComplete (($processedCount / $guestUsers.Count) * 100) -Id 2 
            }
            
            $guestDomain = "Unknown"
            if ($null -ne $guest.Mail) { 
                $guestDomain = $guest.Mail.Split('@')[1] 
            } elseif ($null -ne $guest.UserPrincipalName -and $guest.UserPrincipalName -match '#EXT#@') { 
                $guestDomain = $guest.UserPrincipalName.Split('#EXT#@')[1] 
            }
            
            $appRoleAssignmentsCount = 0
            $getAppRolesFlag = $false
            if($Configuration.discovery.externalIdentity -and $Configuration.discovery.externalIdentity.ContainsKey('getGuestAppRoleAssignments')){
                $getAppRolesFlag = $Configuration.discovery.externalIdentity.getGuestAppRoleAssignments -as [bool]
            }
            
            if ($getAppRolesFlag) {
                try {
                    $appRoleAssignments = Get-MgUserAppRoleAssignment -UserId $guest.Id -All -ErrorAction SilentlyContinue
                    if ($null -ne $appRoleAssignments) { 
                        $appRoleAssignmentsCount = ($appRoleAssignments | Measure-Object).Count 
                    }
                } catch { 
                    Write-MandALog "Could not get app role assignments for guest $($guest.Id): $($_.Exception.Message)" -Level "DEBUG"
                }
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
                ExternalUserState               = if($null -ne $guest.ExternalUserState){$guest.ExternalUserState.ToString()}else{$null}
                ExternalUserStateChangeDateTime = $guest.ExternalUserStateChangeDateTime
                CreatedDateTime                 = $guest.CreatedDateTime
                CompanyName                     = $guest.CompanyName
                Department                      = $guest.Department
                JobTitle                        = $guest.JobTitle
                UsageLocation                   = $guest.UsageLocation
                PreferredLanguage               = $guest.PreferredLanguage
                AppRoleAssignmentCount          = $appRoleAssignmentsCount
                LastSignInDateTime              = if ($null -ne $guest.SignInActivity) { $guest.SignInActivity.LastSignInDateTime } else { $null }
                LastNonInteractiveSignInDateTime = if ($null -ne $guest.SignInActivity) { $guest.SignInActivity.LastNonInteractiveSignInDateTime } else { $null }
                RefreshTokensValidFromDateTime  = $guest.RefreshTokensValidFromDateTime
            })
        }
        
        if ($guestUsers.Count -gt 0) { 
            Write-Progress -Activity "Processing Guest Users" -Completed -Id 2 
        }
        
        if ($guestDataList.Count -gt 0) {
            Export-DataToCSV -Data $guestDataList -FileName "B2BGuestUsers.csv" -OutputPath $OutputPath
        } else { 
            Write-MandALog "No B2B guest user data to export." -Level "INFO" 
        }
        
        return $guestDataList
    } catch { 
        Write-MandALog "Error retrieving B2B guest users: $($_.Exception.Message)" -Level "ERROR"
        return @() 
    }
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
        Write-MandALog "External collab settings CSV '$outputFile' exists. Importing." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving external collaboration settings..." -Level "INFO"
        
        # Check if Microsoft.Graph.Policies module is available
        $policiesModuleAvailable = $null -ne (Get-Module -ListAvailable -Name Microsoft.Graph.Policies)
        
        if ($policiesModuleAvailable) {
            try {
                Import-Module Microsoft.Graph.Policies -ErrorAction Stop
                $authPolicy = Get-MgPolicyAuthorizationPolicy -ErrorAction Stop
                
                if ($null -ne $authPolicy) {
                    $settingsData.Add([PSCustomObject]@{ 
                        SettingCategory = "Guest Permissions (AuthPolicy)"
                        SettingName = "GuestUserRoleId"
                        SettingValue = $authPolicy.GuestUserRoleId
                        Desc = "Default role for new guests."
                    })
                    
                    if ($null -ne $authPolicy.DefaultUserRolePermissions) {
                        $settingsData.Add([PSCustomObject]@{ 
                            SettingCategory = "Guest Permissions (AuthPolicy)"
                            SettingName = "AllowedToInvite"
                            SettingValue = $authPolicy.DefaultUserRolePermissions.AllowedToInvite
                            Desc = "Default users can invite."
                        })
                        $settingsData.Add([PSCustomObject]@{ 
                            SettingCategory = "Guest Permissions (AuthPolicy)"
                            SettingName = "AllowedToReadOtherUsers"
                            SettingValue = $authPolicy.DefaultUserRolePermissions.AllowedToReadOtherUsers
                            Desc = "Default users can read others info."
                        })
                    }
                }
            } catch { 
                Write-MandALog "Could not retrieve Authorization Policy: $($_.Exception.Message)" -Level "WARN"
            }
        } else {
            Write-MandALog "Microsoft.Graph.Policies module not available. Skipping authorization policy settings." -Level "WARN"
            $settingsData.Add([PSCustomObject]@{ 
                SettingCategory = "Module Status"
                SettingName = "Microsoft.Graph.Policies"
                SettingValue = "Not Available"
                Desc = "Install Microsoft.Graph.Policies module for complete settings discovery"
            })
        }

        $collectSPOSettings = $false
        if($Configuration.discovery.externalIdentity -and $Configuration.discovery.externalIdentity.ContainsKey('collectSharePointSettings')){
            $collectSPOSettings = $Configuration.discovery.externalIdentity.collectSharePointSettings -as [bool]
        }
        
        if ($collectSPOSettings -and (Get-Command Get-SPOTenant -ErrorAction SilentlyContinue)) {
            Write-MandALog "Attempting SPO external sharing settings..." -Level "INFO"
            try {
                $spoTenant = Get-SPOTenant -ErrorAction Stop
                if ($null -ne $spoTenant) {
                    $settingsData.Add([PSCustomObject]@{ 
                        SettingCategory = "SharePoint Sharing"
                        SettingName = "SharingCapability"
                        SettingValue = $spoTenant.SharingCapability.ToString()
                        Desc = "External sharing capability level"
                    })
                    $settingsData.Add([PSCustomObject]@{ 
                        SettingCategory = "SharePoint Sharing"
                        SettingName = "RequireAcceptingUserToMatchInvitedUser"
                        SettingValue = $spoTenant.RequireAcceptingUserToMatchInvitedUser
                        Desc = "Require accepting user to match invited user"
                    })
                }
            } catch { 
                Write-MandALog "Could not get SPO settings: $($_.Exception.Message)" -Level "WARN" 
            }
        }

        $collectTeamsSettings = $false
        if($Configuration.discovery.externalIdentity -and $Configuration.discovery.externalIdentity.ContainsKey('collectTeamsSettings')){
            $collectTeamsSettings = $Configuration.discovery.externalIdentity.collectTeamsSettings -as [bool]
        }
        
        if ($collectTeamsSettings -and (Get-Command Get-CsTenantFederationConfiguration -ErrorAction SilentlyContinue)) {
            Write-MandALog "Attempting Teams external access settings..." -Level "INFO"
            try {
                $teamsConfig = Get-CsTenantFederationConfiguration -ErrorAction Stop
                if ($null -ne $teamsConfig) {
                    $settingsData.Add([PSCustomObject]@{ 
                        SettingCategory = "Teams External Access"
                        SettingName = "AllowFederatedUsers"
                        SettingValue = $teamsConfig.AllowFederatedUsers
                        Desc = "Allow federated users"
                    })
                    $settingsData.Add([PSCustomObject]@{ 
                        SettingCategory = "Teams External Access"
                        SettingName = "AllowPublicUsers"
                        SettingValue = $teamsConfig.AllowPublicUsers
                        Desc = "Allow public users"
                    })
                }
            } catch { 
                Write-MandALog "Could not get Teams settings: $($_.Exception.Message)" -Level "WARN" 
            }
        }

        if ($settingsData.Count -gt 0) {
            Export-DataToCSV -Data $settingsData -FileName "ExternalCollaborationSettings.csv" -OutputPath $OutputPath
        } else { 
            Write-MandALog "No external collaboration settings data to export." -Level "INFO" 
        }
        
        return $settingsData
    } catch { 
        Write-MandALog "Error retrieving external collaboration settings: $($_.Exception.Message)" -Level "ERROR"
        return @() 
    }
}

function Get-GuestUserActivityDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$OutputPath,
        [Parameter(Mandatory=$true)][hashtable]$Configuration,
        [Parameter(Mandatory=$false)][array]$GuestUsers 
    )
    $outputFile = Join-Path $OutputPath "GuestUserActivityAnalysis.csv"
    $activityDataList = [System.Collections.Generic.List[PSObject]]::new()

    if (($Configuration.discovery.skipExistingFiles -as [bool]) -and (Test-Path $outputFile)) {
        Write-MandALog "Guest user activity CSV '$outputFile' exists. Importing." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    if ($null -eq $GuestUsers -or $GuestUsers.Count -eq 0) { 
        Write-MandALog "No guest users provided for activity analysis. Skipping." -Level "INFO"
        return @() 
    }
    
    try {
        Write-MandALog "Analyzing guest user activity for $($GuestUsers.Count) users..." -Level "INFO"
        
        $activeGuests = $GuestUsers | Where-Object { 
            $_.AccountEnabled -and ($null -ne $_.LastSignInDateTime) -and ([DateTime]$_.LastSignInDateTime -gt (Get-Date).AddDays(-90)) 
        }
        $inactiveGuests = $GuestUsers | Where-Object { 
            $_.AccountEnabled -and (($null -eq $_.LastSignInDateTime) -or ([DateTime]$_.LastSignInDateTime -le (Get-Date).AddDays(-90))) 
        }
        $disabledGuests = $GuestUsers | Where-Object { -not $_.AccountEnabled }
        $neverSignedInGuests = $GuestUsers | Where-Object { $_.AccountEnabled -and ($null -eq $_.LastSignInDateTime) }

        $activityDataList.Add([PSCustomObject]@{ 
            Category = "Summary"
            Metric = "Total Guest Users"
            Count = $GuestUsers.Count 
        })
        $activityDataList.Add([PSCustomObject]@{ 
            Category = "Summary"
            Metric = "Active Guests (signed in last 90 days)"
            Count = $activeGuests.Count 
        })
        $activityDataList.Add([PSCustomObject]@{ 
            Category = "Summary"
            Metric = "Inactive Guests (enabled, no sign-in >90 days or never)"
            Count = $inactiveGuests.Count 
        })
        $activityDataList.Add([PSCustomObject]@{ 
            Category = "Summary"
            Metric = "Never Signed In (but enabled)"
            Count = $neverSignedInGuests.Count 
        })
        $activityDataList.Add([PSCustomObject]@{ 
            Category = "Summary"
            Metric = "Disabled Guests"
            Count = $disabledGuests.Count 
        })

        $topPartnerDomainsCount = 10 
        if ($Configuration.discovery.externalIdentity -and $Configuration.discovery.externalIdentity.topPartnerDomainsToAnalyze) {
            try { 
                $topPartnerDomainsCount = [int]$Configuration.discovery.externalIdentity.topPartnerDomainsToAnalyze 
            } catch {}
        }
        
        $guestDomains = $GuestUsers | Where-Object { $_.GuestDomain -ne "Unknown" } | 
            Group-Object -Property GuestDomain | Sort-Object Count -Descending
            
        foreach ($domain in $guestDomains | Select-Object -First $topPartnerDomainsCount) {
            $domainActiveCount = ($domain.Group | Where-Object { 
                $_.AccountEnabled -and ($null -ne $_.LastSignInDateTime) -and ([DateTime]$_.LastSignInDateTime -gt (Get-Date).AddDays(-90)) 
            }).Count
            $activityDataList.Add([PSCustomObject]@{ 
                Category = "By Domain"
                Metric = $domain.Name
                Count = $domain.Count
                Details = "Active (90d): $domainActiveCount of $($domain.Count)"
            })
        }
        
        $guestsByAge = @{ 
            "InvitedLast30Days" = 0
            "InvitedLast90Days" = 0
            "InvitedLast180Days" = 0
            "InvitedLastYear" = 0
            "InvitedOverYear" = 0 
        }
        
        foreach ($guest in $GuestUsers) {
            if ($null -ne $guest.CreatedDateTime) {
                $ageDays = ((Get-Date) - [DateTime]$guest.CreatedDateTime).TotalDays
                if ($ageDays -le 30) { $guestsByAge["InvitedLast30Days"]++ }
                elseif ($ageDays -le 90) { $guestsByAge["InvitedLast90Days"]++ }
                elseif ($ageDays -le 180) { $guestsByAge["InvitedLast180Days"]++ }
                elseif ($ageDays -le 365) { $guestsByAge["InvitedLastYear"]++ }
                else { $guestsByAge["InvitedOverYear"]++ }
            }
        }
        
        foreach ($ageGroup in $guestsByAge.GetEnumerator()) {
            $activityDataList.Add([PSCustomObject]@{ 
                Category = "By Invitation Age"
                Metric = $ageGroup.Key
                Count = $ageGroup.Value 
                Percentage = if ($GuestUsers.Count -gt 0) { 
                    [math]::Round(($ageGroup.Value / $GuestUsers.Count) * 100, 2) 
                } else { 0 }
                Details = "Guests created in this time period"
            })
        }

        if ($activityDataList.Count -gt 0) {
            Export-DataToCSV -Data $activityDataList -FileName "GuestUserActivityAnalysis.csv" -OutputPath $OutputPath
        } else { 
            Write-MandALog "No guest user activity data to export." -Level "INFO" 
        }
        
        return $activityDataList
    } catch { 
        Write-MandALog "Error analyzing guest user activity: $($_.Exception.Message)" -Level "ERROR"
        return @() 
    }
}

function Get-PartnerOrganizationsDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$OutputPath,
        [Parameter(Mandatory=$true)][hashtable]$Configuration,
        [Parameter(Mandatory=$false)][array]$GuestUsers
    )
    $outputFile = Join-Path $OutputPath "PartnerOrganizationsAnalysis.csv"
    $partnerDataList = [System.Collections.Generic.List[PSObject]]::new()

    if (($Configuration.discovery.skipExistingFiles -as [bool]) -and (Test-Path $outputFile)) {
        Write-MandALog "Partner orgs CSV '$outputFile' exists. Importing." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    if ($null -eq $GuestUsers -or $GuestUsers.Count -eq 0) { 
        Write-MandALog "No guest users provided for partner org analysis. Skipping." -Level "INFO"
        return @() 
    }
    
    try {
        Write-MandALog "Analyzing partner organizations from $($GuestUsers.Count) guest users..." -Level "INFO"
        
        $partnerDomains = $GuestUsers | Where-Object { $null -ne $_.GuestDomain -and $_.GuestDomain -ne "Unknown" } | 
            Group-Object -Property GuestDomain | Sort-Object Count -Descending
        
        foreach ($partner in $partnerDomains) {
            $partnerGuests = $partner.Group
            $activeCount = ($partnerGuests | Where-Object { 
                $_.AccountEnabled -and ($null -ne $_.LastSignInDateTime) -and ([DateTime]$_.LastSignInDateTime -gt (Get-Date).AddDays(-90)) 
            }).Count
            $inactiveCount = ($partnerGuests | Where-Object { 
                $_.AccountEnabled -and (($null -eq $_.LastSignInDateTime) -or ([DateTime]$_.LastSignInDateTime -le (Get-Date).AddDays(-90))) 
            }).Count
            $disabledCount = ($partnerGuests | Where-Object { -not $_.AccountEnabled }).Count
            
            $departments = $partnerGuests | Where-Object { $null -ne $_.Department -and $_.Department -ne ""} | 
                Select-Object -ExpandProperty Department -Unique
            $jobTitles = $partnerGuests | Where-Object { $null -ne $_.JobTitle -and $_.JobTitle -ne ""} | 
                Select-Object -ExpandProperty JobTitle -Unique
            
            $partnerType = "External Partner"
            if ($partner.Name -match '\.(edu|ac\.|university\.)') { $partnerType = "Educational Institution" } 
            elseif ($partner.Name -match '\.(gov|mil)$') { $partnerType = "Government" } 
            elseif ($partner.Name -match '(gmail|yahoo|hotmail|outlook|live|aol|icloud|protonmail)\.(com|net|org|me|ch|de|fr|uk|ca)$') { 
                $partnerType = "Consumer Email Provider" 
            }

            $riskLevel = "Low"
            $riskFactors = @()
            if ($partnerType -eq "Consumer Email Provider") { 
                $riskLevel = "Medium"
                $riskFactors += "Consumer email domain" 
            }
            if ($partnerGuests.Count -gt 0 -and $inactiveCount -gt ($partnerGuests.Count * 0.75)) { 
                $riskLevel = "Medium"
                $riskFactors += "High percentage of inactive users (>75%)" 
            }
            if ($partnerGuests.Count -eq 1 -and $partnerType -ne "Consumer Email Provider") { 
                $riskFactors += "Single user from this partner organization" 
            }

            $partnerDataList.Add([PSCustomObject]@{
                PartnerDomain           = $partner.Name
                PartnerType             = $partnerType
                TotalGuests             = $partnerGuests.Count
                ActiveGuests_90d        = $activeCount
                InactiveGuests_90d      = $inactiveCount
                DisabledGuests          = $disabledCount
                ActivityRate_Percent    = if ($partnerGuests.Count -gt 0) { 
                    [math]::Round(($activeCount / $partnerGuests.Count) * 100, 2) 
                } else { 0 }
                UniqueDepartmentsCount  = $departments.Count
                DepartmentsPreview      = ($departments | Select-Object -First 5) -join ";"
                UniqueJobTitlesCount    = $jobTitles.Count
                TopJobTitlesPreview     = ($jobTitles | Select-Object -First 5) -join ";"
                OldestGuestCreatedDate  = ($partnerGuests.CreatedDateTime | Where-Object {$_} | 
                    Measure-Object -Minimum -ErrorAction SilentlyContinue).Minimum
                NewestGuestCreatedDate  = ($partnerGuests.CreatedDateTime | Where-Object {$_} | 
                    Measure-Object -Maximum -ErrorAction SilentlyContinue).Maximum
                RiskLevel               = $riskLevel
                RiskFactors             = ($riskFactors -join "; ")
            })
        }
        
        if ($partnerDataList.Count -gt 0) {
            Export-DataToCSV -Data $partnerDataList -FileName "PartnerOrganizationsAnalysis.csv" -OutputPath $OutputPath
        } else { 
            Write-MandALog "No partner organization data to export." -Level "INFO" 
        }
        
        return $partnerDataList
    } catch { 
        Write-MandALog "Error analyzing partner organizations: $($_.Exception.Message)" -Level "ERROR"
        return @() 
    }
}

function Get-ExternalIdentityProvidersDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$OutputPath,
        [Parameter(Mandatory=$true)][hashtable]$Configuration
    )
    $outputFile = Join-Path $OutputPath "ExternalIdentityProviders.csv"
    $providerDataList = [System.Collections.Generic.List[PSObject]]::new()

    if (($Configuration.discovery.skipExistingFiles -as [bool]) -and (Test-Path $outputFile)) {
        Write-MandALog "External IdPs CSV '$outputFile' exists. Importing." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving external identity providers..." -Level "INFO"
        $identityProviders = $null
        
        try { 
            $identityProviders = Get-MgIdentityProvider -All -ErrorAction Stop 
        } catch {
            Write-MandALog "Get-MgIdentityProvider failed: $($_.Exception.Message)" -Level "WARN" 
        }
        
        if ($null -ne $identityProviders) {
            foreach ($provider in $identityProviders) {
                $providerType = "Unknown"
                if ($null -ne $provider.AdditionalProperties -and $provider.AdditionalProperties.ContainsKey("@odata.type")) {
                    $providerType = $provider.AdditionalProperties["@odata.type"].Replace("#microsoft.graph.","")
                }
                $providerDataList.Add([PSCustomObject]@{ 
                    ProviderId   = $provider.Id
                    ProviderType = $providerType 
                    DisplayName  = $provider.DisplayName
                    ClientId     = $provider.ClientId
                })
            }
        }
        
        # Add default Azure AD provider
        $providerDataList.Add([PSCustomObject]@{ 
            ProviderId = "AzureAD-B2B-Default"
            ProviderType = "AzureActiveDirectory"
            DisplayName = "Azure AD B2B (Default Invitations)"
            ClientId = $null
        })

        if ($providerDataList.Count -gt 0) {
            Export-DataToCSV -Data $providerDataList -FileName "ExternalIdentityProviders.csv" -OutputPath $OutputPath
        } else { 
            Write-MandALog "No external identity provider data to export." -Level "INFO" 
        }
        
        return $providerDataList
    } catch { 
        Write-MandALog "Error retrieving external IdPs: $($_.Exception.Message)" -Level "ERROR"
        return @() 
    }
}

function Get-GuestInvitationsDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$OutputPath,
        [Parameter(Mandatory=$true)][hashtable]$Configuration
    )
    $outputFile = Join-Path $OutputPath "GuestInvitationsSummary.csv"
    $invitationSummaryList = [System.Collections.Generic.List[PSObject]]::new()

    if (($Configuration.discovery.skipExistingFiles -as [bool]) -and (Test-Path $outputFile)) {
        Write-MandALog "Guest invitations CSV '$outputFile' exists. Importing." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Analyzing guest invitations..." -Level "INFO"
        $invitations = $null
        
        try { 
            $invitations = Get-MgInvitation -All -ErrorAction SilentlyContinue 
        } catch {
            Write-MandALog "Get-MgInvitation failed: $($_.Exception.Message)" -Level "WARN" 
        }
        
        if ($null -ne $invitations -and $invitations.Count -gt 0) {
            Write-MandALog "Found $($invitations.Count) direct invitation objects via Get-MgInvitation." -Level "INFO"
            foreach ($inv in $invitations) {
                $invitationSummaryList.Add([PSCustomObject]@{
                    InvitationId            = $inv.Id
                    InvitedUserEmail        = $inv.InvitedUserEmailAddress
                    InvitedUserDisplayName  = $inv.InvitedUserDisplayName
                    InvitedUserType         = $inv.InvitedUserType
                    InviteRedeemUrl         = $inv.InviteRedeemUrl
                    InviteRedirectUrl       = $inv.InviteRedirectUrl
                    Status                  = $inv.Status
                    SendInvitationMessage   = $inv.SendInvitationMessage
                    InvitedByUserUPN        = if($null -ne $inv.InvitedByUser){
                        $inv.InvitedByUser.UserPrincipalName
                    } else {$null}
                })
            }
        } else {
            Write-MandALog "No direct invitation objects found. Fallback to recent guest users." -Level "INFO"
            $recentGuestCount = 100
            
            if ($Configuration.discovery.externalIdentity -and 
                $Configuration.discovery.externalIdentity.recentGuestCountForInvitationFallback) {
                try { 
                    $recentGuestCount = [int]$Configuration.discovery.externalIdentity.recentGuestCountForInvitationFallback 
                } catch {}
            }
            
            if ($recentGuestCount -gt 0) {
                Write-MandALog "Fetching top $recentGuestCount guest users for invitation fallback analysis." -Level "INFO"
                $recentGuestUsers = Get-MgUser -Filter "userType eq 'Guest'" -Top $recentGuestCount `
                    -Property "id,displayName,userPrincipalName,createdDateTime,externalUserState,userType" `
                    -ErrorAction SilentlyContinue
                    
                if ($null -ne $recentGuestUsers) {
                    foreach ($guest in $recentGuestUsers) {
                        $invitationSummaryList.Add([PSCustomObject]@{ 
                            InvitationId            = "N/A (from user object)"
                            InvitedUserEmail        = $guest.userPrincipalName 
                            InvitedUserDisplayName  = $guest.displayName
                            InvitedUserType         = $guest.userType
                            Status                  = $guest.externalUserState
                            InvitedByUserUPN        = "Unknown (from user data)"
                            CreatedDateTime_User    = $guest.createdDateTime
                            Comment                 = "Fallback analysis from guest user object"
                        })
                    }
                }
            }
        }
        
        if ($invitationSummaryList.Count -gt 0) {
            Export-DataToCSV -Data $invitationSummaryList -FileName "GuestInvitationsSummary.csv" -OutputPath $OutputPath
        } else { 
            Write-MandALog "No guest invitation summary data to export." -Level "INFO" 
        }
        
        return $invitationSummaryList
    } catch { 
        Write-MandALog "Error analyzing guest invitations: $($_.Exception.Message)" -Level "ERROR"
        return @() 
    }
}

function Get-CrossTenantAccessDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$OutputPath,
        [Parameter(Mandatory=$true)][hashtable]$Configuration
    )
    $outputFileDefault = Join-Path $OutputPath "CrossTenantAccessPolicy_Defaults.csv"
    $outputFilePartners = Join-Path $OutputPath "CrossTenantAccessPolicy_Partners.csv"
    $defaultAccessDataList = [System.Collections.Generic.List[PSObject]]::new()
    $partnerAccessDataList = [System.Collections.Generic.List[PSObject]]::new()

    if (($Configuration.discovery.skipExistingFiles -as [bool]) -and 
        (Test-Path $outputFileDefault) -and (Test-Path $outputFilePartners)) {
        Write-MandALog "Cross-tenant access policy CSVs exist. Importing." -Level "INFO"
        $defaults = Import-DataFromCSV -FilePath $outputFileDefault
        $partners = Import-DataFromCSV -FilePath $outputFilePartners
        return @{ Defaults = $defaults; Partners = $partners}
    }
    
    try {
        Write-MandALog "Retrieving cross-tenant access policy..." -Level "INFO"
        
        # Check if Microsoft.Graph.Policies module is available
        $policiesModuleAvailable = $null -ne (Get-Module -ListAvailable -Name Microsoft.Graph.Policies)
        
        if (-not $policiesModuleAvailable) {
            Write-MandALog "Microsoft.Graph.Policies module not available. Cannot retrieve cross-tenant access policy." -Level "WARN"
            $defaultAccessDataList.Add([PSCustomObject]@{
                PolicyId = "N/A"
                PolicyType = "ModuleNotAvailable"
                TargetTenantId = "N/A"
                Notes = "Install Microsoft.Graph.Policies module to retrieve cross-tenant access policy"
            })
            
            Export-DataToCSV -Data $defaultAccessDataList -FileName "CrossTenantAccessPolicy_Defaults.csv" -OutputPath $OutputPath
            Export-DataToCSV -Data @() -FileName "CrossTenantAccessPolicy_Partners.csv" -OutputPath $OutputPath
            
            return @{ Defaults = $defaultAccessDataList; Partners = @() }
        }
        
        # Import module if available
        Import-Module Microsoft.Graph.Policies -ErrorAction Stop
        
        $policy = $null
        try {
            $policy = Get-MgPolicyCrossTenantAccessPolicy -ErrorAction Stop
        } catch {
            Write-MandALog "Get-MgPolicyCrossTenantAccessPolicy failed: $($_.Exception.Message)" -Level "WARN"
        }
        
        if ($null -ne $policy) {
            if ($null -ne $policy.Default) {
                $defaultAccessDataList.Add([PSCustomObject]@{ 
                    PolicyId                            = $policy.Id
                    PolicyType                          = "Default"
                    TargetTenantId                      = "All Tenants"
                    B2BCollabInbound_AccessType         = $policy.Default.B2BCollaborationInbound.UsersAndGroups.AccessType.ToString()
                    B2BCollabInbound_AppAccessType      = $policy.Default.B2BCollaborationInbound.Applications.AccessType.ToString()
                    B2BCollabOutbound_AccessType        = $policy.Default.B2BCollaborationOutbound.UsersAndGroups.AccessType.ToString()
                    B2BCollabOutbound_AppAccessType     = $policy.Default.B2BCollaborationOutbound.Applications.AccessType.ToString()
                    B2BDirectConnectInbound_AccessType  = $policy.Default.B2BDirectConnectInbound.UsersAndGroups.AccessType.ToString()
                    B2BDirectConnectOutbound_AccessType = $policy.Default.B2BDirectConnectOutbound.UsersAndGroups.AccessType.ToString()
                    InboundTrust_IsMfaAccepted          = $policy.Default.InboundTrust.IsMfaAccepted
                    InboundTrust_IsCompliantDeviceAccepted = $policy.Default.InboundTrust.IsCompliantDeviceAccepted
                    InboundTrust_IsHybridAadjAccepted   = $policy.Default.InboundTrust.IsHybridAzureADJoinedDeviceAccepted
                })
            }
            
            $partners = $null
            try {
                $partners = Get-MgPolicyCrossTenantAccessPolicyPartner -CrossTenantAccessPolicyId $policy.Id -All -ErrorAction Stop
            } catch {
                Write-MandALog "Get-MgPolicyCrossTenantAccessPolicyPartner failed: $($_.Exception.Message)" -Level "WARN"
            }

            if ($null -ne $partners) {
                foreach ($partner in $partners) {
                    $partnerAccessDataList.Add([PSCustomObject]@{ 
                        PolicyId                        = $policy.Id
                        PolicyType                      = "Partner"
                        TargetTenantId                  = $partner.TenantId
                        IsInboundCollaborationRestricted = $partner.IsInboundCollaborationRestricted
                        IsOutboundCollaborationRestricted= $partner.IsOutboundCollaborationRestricted
                        B2BCollabInbound_AccessType     = if($null -ne $partner.B2BCollaborationInbound){
                            $partner.B2BCollaborationInbound.UsersAndGroups.AccessType.ToString()
                        }else{$null}
                        B2BCollabOutbound_AccessType    = if($null -ne $partner.B2BCollaborationOutbound){
                            $partner.B2BCollaborationOutbound.UsersAndGroups.AccessType.ToString()
                        }else{$null}
                        B2BDirectConnectInbound_AccessType = if($null -ne $partner.B2BDirectConnectInbound){
                            $partner.B2BDirectConnectInbound.UsersAndGroups.AccessType.ToString()
                        }else{$null}
                        B2BDirectConnectOutbound_AccessType = if($null -ne $partner.B2BDirectConnectOutbound){
                            $partner.B2BDirectConnectOutbound.UsersAndGroups.AccessType.ToString()
                        }else{$null}
                        InboundTrust_IsMfaAccepted      = if($null -ne $partner.InboundTrust){
                            $partner.InboundTrust.IsMfaAccepted
                        }else{$null}
                        AutomaticUserConsent_InboundAllowed = if($null -ne $partner.AutomaticUserConsentSettings){
                            $partner.AutomaticUserConsentSettings.IsInboundAllowed
                        }else{$null}
                        AutomaticUserConsent_OutboundAllowed= if($null -ne $partner.AutomaticUserConsentSettings){
                            $partner.AutomaticUserConsentSettings.IsOutboundAllowed
                        }else{$null}
                    })
                }
            }
        }

        if ($defaultAccessDataList.Count -gt 0) {
            Export-DataToCSV -Data $defaultAccessDataList -FileName "CrossTenantAccessPolicy_Defaults.csv" -OutputPath $OutputPath
        } else { 
            Write-MandALog "No default cross-tenant access policy data to export." -Level "INFO" 
        }
        
        if ($partnerAccessDataList.Count -gt 0) {
            Export-DataToCSV -Data $partnerAccessDataList -FileName "CrossTenantAccessPolicy_Partners.csv" -OutputPath $OutputPath
        } else { 
            Write-MandALog "No partner-specific cross-tenant access policy data to export." -Level "INFO" 
        }
        
        return @{ Defaults = $defaultAccessDataList; Partners = $partnerAccessDataList }
    } catch { 
        Write-MandALog "Error retrieving cross-tenant access policy: $($_.Exception.Message)" -Level "ERROR"
        return @{ Defaults = @(); Partners = @()} 
    }
}

# --- Main Exported Function ---
function Invoke-ExternalIdentityDiscovery {
    [CmdletBinding()]
    [OutputType([hashtable])]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    try {
        Write-MandALog "--- Starting External Identity Discovery Phase (v2.0.0 - Fixed) ---" -Level "HEADER"
        $rawPath = Join-Path $Configuration.environment.outputPath "Raw" 
        
        if (-not (Test-Path $rawPath -PathType Container)) {
            try { 
                New-Item -Path $rawPath -ItemType Directory -Force -ErrorAction Stop | Out-Null 
            } catch { 
                Write-MandALog "Failed to create Raw output directory: $rawPath. Error: $($_.Exception.Message)" -Level "ERROR"
                throw 
            }
        }

        $discoveryResults = @{}
        $context = Get-MgContext -ErrorAction SilentlyContinue
        if ($null -eq $context) {
            Write-MandALog "Microsoft Graph not connected. Skipping external identity discovery." -Level "WARN"
            return $discoveryResults 
        }
        Write-MandALog "Graph context active for External Identity discovery." -Level "INFO"
            
        if ($script:ExecutionMetrics -is [hashtable]) {
            $script:ExecutionMetrics.Phase = "External Identity Discovery"
        }

        $b2bGuests = Get-B2BGuestUsersDataInternal -OutputPath $rawPath -Configuration $Configuration
        $discoveryResults.B2BGuests = $b2bGuests

        $discoveryResults.CollaborationSettings = Get-ExternalCollaborationSettingsDataInternal `
            -OutputPath $rawPath -Configuration $Configuration
            
        $discoveryResults.GuestActivity = Get-GuestUserActivityDataInternal `
            -OutputPath $rawPath -Configuration $Configuration -GuestUsers $b2bGuests
            
        $discoveryResults.PartnerOrganizations = Get-PartnerOrganizationsDataInternal `
            -OutputPath $rawPath -Configuration $Configuration -GuestUsers $b2bGuests
            
        $discoveryResults.IdentityProviders = Get-ExternalIdentityProvidersDataInternal `
            -OutputPath $rawPath -Configuration $Configuration
            
        $discoveryResults.GuestInvitations = Get-GuestInvitationsDataInternal `
            -OutputPath $rawPath -Configuration $Configuration
            
        $discoveryResults.CrossTenantAccess = Get-CrossTenantAccessDataInternal `
            -OutputPath $rawPath -Configuration $Configuration

        Write-MandALog "--- External Identity Discovery Phase Completed Successfully ---" -Level "SUCCESS"
        return $discoveryResults

    } catch {
        Write-MandALog "External Identity discovery phase failed: $($_.Exception.Message)" -Level "ERROR"
        Write-MandALog "Stack trace: $($_.ScriptStackTrace)" -Level "DEBUG"
        throw 
    }
}

Export-ModuleMember -Function Invoke-ExternalIdentityDiscovery
