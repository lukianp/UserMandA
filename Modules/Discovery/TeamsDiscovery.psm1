<#
.SYNOPSIS
    Microsoft Teams discovery for M&A Discovery Suite
.DESCRIPTION
    Discovers Teams, channels, members, apps, policies, and phone configurations
#>

# Modules/Discovery/TeamsDiscovery.psm1

function Invoke-TeamsDiscovery {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Starting Microsoft Teams discovery" -Level "HEADER"
        
        $outputPath = $Configuration.environment.outputPath
        $rawPath = Join-Path $outputPath "Raw"
        
        $discoveryResults = @{}
        
        # Verify Teams connection
        try {
            $testCmd = Get-Command Get-Team -ErrorAction Stop
            Write-MandALog "Microsoft Teams connection verified" -Level "SUCCESS"
        } catch {
            Write-MandALog "Microsoft Teams not connected. Attempting connection..." -Level "WARN"
            
            # Try to connect using existing credentials
            try {
                Connect-MicrosoftTeams -ErrorAction Stop
                Write-MandALog "Successfully connected to Microsoft Teams" -Level "SUCCESS"
            } catch {
                Write-MandALog "Failed to connect to Microsoft Teams. Skipping Teams discovery." -Level "ERROR"
                return @{}
            }
        }
        
        # Teams
        Write-MandALog "Discovering Teams..." -Level "INFO"
        $discoveryResults.Teams = Get-TeamsData -OutputPath $rawPath -Configuration $Configuration
        
        # Team Channels
        Write-MandALog "Discovering Team channels..." -Level "INFO"
        $discoveryResults.TeamChannels = Get-TeamChannelsData -OutputPath $rawPath -Configuration $Configuration -Teams $discoveryResults.Teams
        
        # Team Members
        Write-MandALog "Discovering Team members..." -Level "INFO"
        $discoveryResults.TeamMembers = Get-TeamMembersData -OutputPath $rawPath -Configuration $Configuration -Teams $discoveryResults.Teams
        
        # Team Apps
        Write-MandALog "Discovering Team apps..." -Level "INFO"
        $discoveryResults.TeamApps = Get-TeamAppsData -OutputPath $rawPath -Configuration $Configuration -Teams $discoveryResults.Teams
        
        # Guest Users
        Write-MandALog "Discovering guest users in Teams..." -Level "INFO"
        $discoveryResults.GuestUsers = Get-TeamsGuestUsersData -OutputPath $rawPath -Configuration $Configuration
        
        # Teams Policies
        Write-MandALog "Discovering Teams policies..." -Level "INFO"
        $discoveryResults.TeamsPolicies = Get-TeamsPoliciesData -OutputPath $rawPath -Configuration $Configuration
        
        # Teams Phone
        Write-MandALog "Discovering Teams phone configurations..." -Level "INFO"
        $discoveryResults.TeamsPhone = Get-TeamsPhoneData -OutputPath $rawPath -Configuration $Configuration
        
        Write-MandALog "Microsoft Teams discovery completed successfully" -Level "SUCCESS"
        return $discoveryResults
        
    } catch {
        Write-MandALog "Microsoft Teams discovery failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Get-TeamsData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "Teams.csv"
    $teamsData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Teams CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving all Teams..." -Level "INFO"
        
        $teams = Get-Team -ErrorAction Stop
        Write-MandALog "Found $($teams.Count) teams" -Level "SUCCESS"
        
        $processedCount = 0
        foreach ($team in $teams) {
            $processedCount++
            if ($processedCount % 10 -eq 0) {
                Write-Progress -Activity "Processing Teams" -Status "Team $processedCount of $($teams.Count)" -PercentComplete (($processedCount / $teams.Count) * 100)
            }
            
            # Get team details
            try {
                $teamDetails = Get-Team -GroupId $team.GroupId -ErrorAction Stop
                
                # Get team settings
                $teamSettings = @{
                    AllowCreateUpdateChannels = $teamDetails.AllowCreateUpdateChannels
                    AllowDeleteChannels = $teamDetails.AllowDeleteChannels
                    AllowAddRemoveApps = $teamDetails.AllowAddRemoveApps
                    AllowCreateUpdateRemoveTabs = $teamDetails.AllowCreateUpdateRemoveTabs
                    AllowCreateUpdateRemoveConnectors = $teamDetails.AllowCreateUpdateRemoveConnectors
                    AllowUserEditMessages = $teamDetails.AllowUserEditMessages
                    AllowUserDeleteMessages = $teamDetails.AllowUserDeleteMessages
                    AllowOwnerDeleteMessages = $teamDetails.AllowOwnerDeleteMessages
                    AllowTeamMentions = $teamDetails.AllowTeamMentions
                    AllowChannelMentions = $teamDetails.AllowChannelMentions
                    AllowGuestCreateUpdateChannels = $teamDetails.AllowGuestCreateUpdateChannels
                    AllowGuestDeleteChannels = $teamDetails.AllowGuestDeleteChannels
                }
                
                # Get owner and member counts
                $owners = Get-TeamUser -GroupId $team.GroupId -Role Owner -ErrorAction SilentlyContinue
                $members = Get-TeamUser -GroupId $team.GroupId -Role Member -ErrorAction SilentlyContinue
                $guests = Get-TeamUser -GroupId $team.GroupId -Role Guest -ErrorAction SilentlyContinue
                
                $teamsData.Add([PSCustomObject]@{
                    GroupId = $team.GroupId
                    DisplayName = $team.DisplayName
                    Description = $team.Description
                    Visibility = $team.Visibility
                    Archived = $team.Archived
                    MailNickName = $team.MailNickName
                    Classification = $team.Classification
                    CreatedDateTime = $teamDetails.CreatedDateTime
                    OwnerCount = ($owners | Measure-Object).Count
                    MemberCount = ($members | Measure-Object).Count
                    GuestCount = ($guests | Measure-Object).Count
                    TotalMemberCount = ($owners | Measure-Object).Count + ($members | Measure-Object).Count + ($guests | Measure-Object).Count
                    AllowCreateUpdateChannels = $teamSettings.AllowCreateUpdateChannels
                    AllowDeleteChannels = $teamSettings.AllowDeleteChannels
                    AllowAddRemoveApps = $teamSettings.AllowAddRemoveApps
                    AllowCreateUpdateRemoveTabs = $teamSettings.AllowCreateUpdateRemoveTabs
                    AllowCreateUpdateRemoveConnectors = $teamSettings.AllowCreateUpdateRemoveConnectors
                    AllowUserEditMessages = $teamSettings.AllowUserEditMessages
                    AllowUserDeleteMessages = $teamSettings.AllowUserDeleteMessages
                    AllowOwnerDeleteMessages = $teamSettings.AllowOwnerDeleteMessages
                    AllowTeamMentions = $teamSettings.AllowTeamMentions
                    AllowChannelMentions = $teamSettings.AllowChannelMentions
                    AllowGuestCreateUpdateChannels = $teamSettings.AllowGuestCreateUpdateChannels
                    AllowGuestDeleteChannels = $teamSettings.AllowGuestDeleteChannels
                    HasGuests = ($guests | Measure-Object).Count -gt 0
                })
                
            } catch {
                Write-MandALog "Error processing team $($team.DisplayName): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-Progress -Activity "Processing Teams" -Completed
        
        # Export to CSV
        Export-DataToCSV -Data $teamsData -FilePath $outputFile
        
        return $teamsData
        
    } catch {
        Write-MandALog "Error retrieving Teams: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-TeamChannelsData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration,
        [array]$Teams
    )
    
    $outputFile = Join-Path $OutputPath "TeamChannels.csv"
    $channelsData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Team channels CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving channels for $($Teams.Count) teams..." -Level "INFO"
        
        $processedCount = 0
        foreach ($team in $Teams) {
            $processedCount++
            if ($processedCount % 10 -eq 0) {
                Write-Progress -Activity "Processing Team Channels" -Status "Team $processedCount of $($Teams.Count)" -PercentComplete (($processedCount / $Teams.Count) * 100)
            }
            
            try {
                $channels = Get-TeamChannel -GroupId $team.GroupId -ErrorAction Stop
                
                foreach ($channel in $channels) {
                    # Get channel details
                    $channelDetails = Get-TeamChannel -GroupId $team.GroupId -DisplayName $channel.DisplayName -ErrorAction SilentlyContinue
                    
                    $channelsData.Add([PSCustomObject]@{
                        TeamId = $team.GroupId
                        TeamDisplayName = $team.DisplayName
                        ChannelId = $channel.Id
                        ChannelDisplayName = $channel.DisplayName
                        Description = $channel.Description
                        Email = $channelDetails.Email
                        IsFavoriteByDefault = $channel.IsFavoriteByDefault
                        MembershipType = $channel.MembershipType
                        CreatedDateTime = $channelDetails.CreatedDateTime
                        Type = if ($channel.DisplayName -eq "General") { "Default" } else { "Standard" }
                        ModerationSettings = if ($channelDetails.ModerationSettings) { 
                            "$($channelDetails.ModerationSettings.AllowNewMessageFromBots);$($channelDetails.ModerationSettings.AllowNewMessageFromConnectors)" 
                        } else { "" }
                    })
                }
                
            } catch {
                Write-MandALog "Error getting channels for team $($team.DisplayName): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-Progress -Activity "Processing Team Channels" -Completed
        Write-MandALog "Found $($channelsData.Count) channels across all teams" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $channelsData -FilePath $outputFile
        
        return $channelsData
        
    } catch {
        Write-MandALog "Error retrieving team channels: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-TeamMembersData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration,
        [array]$Teams
    )
    
    $outputFile = Join-Path $OutputPath "TeamMembers.csv"
    $membersData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Team members CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving members for $($Teams.Count) teams..." -Level "INFO"
        
        $processedCount = 0
        foreach ($team in $Teams) {
            $processedCount++
            if ($processedCount % 10 -eq 0) {
                Write-Progress -Activity "Processing Team Members" -Status "Team $processedCount of $($Teams.Count)" -PercentComplete (($processedCount / $Teams.Count) * 100)
            }
            
            try {
                $teamUsers = Get-TeamUser -GroupId $team.GroupId -ErrorAction Stop
                
                foreach ($user in $teamUsers) {
                    $membersData.Add([PSCustomObject]@{
                        TeamId = $team.GroupId
                        TeamDisplayName = $team.DisplayName
                        UserId = $user.UserId
                        UserDisplayName = $user.Name
                        UserEmail = $user.User
                        Role = $user.Role
                        TenantId = $user.TenantId
                        UserType = if ($user.Role -eq "Guest") { "Guest" } else { "Member" }
                    })
                }
                
            } catch {
                Write-MandALog "Error getting members for team $($team.DisplayName): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-Progress -Activity "Processing Team Members" -Completed
        Write-MandALog "Found $($membersData.Count) team memberships" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $membersData -FilePath $outputFile
        
        return $membersData
        
    } catch {
        Write-MandALog "Error retrieving team members: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-TeamAppsData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration,
        [array]$Teams
    )
    
    $outputFile = Join-Path $OutputPath "TeamApps.csv"
    $appsData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Team apps CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving apps for $($Teams.Count) teams..." -Level "INFO"
        
        $processedCount = 0
        foreach ($team in $Teams) {
            $processedCount++
            if ($processedCount % 10 -eq 0) {
                Write-Progress -Activity "Processing Team Apps" -Status "Team $processedCount of $($Teams.Count)" -PercentComplete (($processedCount / $Teams.Count) * 100)
            }
            
            try {
                $teamApps = Get-TeamsApp -TeamId $team.GroupId -ErrorAction Stop
                
                foreach ($app in $teamApps) {
                    $appsData.Add([PSCustomObject]@{
                        TeamId = $team.GroupId
                        TeamDisplayName = $team.DisplayName
                        AppId = $app.Id
                        AppDisplayName = $app.DisplayName
                        AppVersion = $app.Version
                        TeamsAppId = $app.TeamsAppId
                        ExternalId = $app.ExternalId
                        IsPinned = $app.IsPinned
                        InstalledDate = $app.InstalledDate
                        ConsentedPermissionSet = $app.ConsentedPermissionSet
                    })
                }
                
            } catch {
                # Many teams might not have apps, this is normal
                Write-MandALog "No apps found or error getting apps for team $($team.DisplayName)" -Level "DEBUG"
            }
        }
        
        Write-Progress -Activity "Processing Team Apps" -Completed
        Write-MandALog "Found $($appsData.Count) team app installations" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $appsData -FilePath $outputFile
        
        return $appsData
        
    } catch {
        Write-MandALog "Error retrieving team apps: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-TeamsGuestUsersData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "TeamsGuestUsers.csv"
    $guestData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Teams guest users CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving Teams guest users..." -Level "INFO"
        
        # Get all unique guest users from Graph
        $guestUsers = Get-MgUser -Filter "userType eq 'Guest'" -All -ErrorAction Stop
        
        Write-MandALog "Found $($guestUsers.Count) guest users in tenant" -Level "INFO"
        
        foreach ($guest in $guestUsers) {
            # Get group memberships for guest
            $groupMemberships = Get-MgUserMemberOf -UserId $guest.Id -ErrorAction SilentlyContinue
            $teamMemberships = @()
            
            foreach ($membership in $groupMemberships) {
                if ($membership.AdditionalProperties["@odata.type"] -eq "#microsoft.graph.group") {
                    # Check if this group is a Team
                    try {
                        $team = Get-Team -GroupId $membership.Id -ErrorAction Stop
                        if ($team) {
                            $teamMemberships += $team.DisplayName
                        }
                    } catch {
                        # Not a team, just a group
                    }
                }
            }
            
            $guestData.Add([PSCustomObject]@{
                GuestUserId = $guest.Id
                UserPrincipalName = $guest.UserPrincipalName
                DisplayName = $guest.DisplayName
                Mail = $guest.Mail
                GuestUserType = $guest.UserType
                CreationType = $guest.CreationType
                CreatedDateTime = $guest.CreatedDateTime
                ExternalUserState = $guest.ExternalUserState
                ExternalUserStateChangeDateTime = $guest.ExternalUserStateChangeDateTime
                CompanyName = $guest.CompanyName
                TeamMemberships = ($teamMemberships -join ";")
                TeamCount = $teamMemberships.Count
                InvitedBy = if ($guest.AdditionalProperties.invitedBy) { $guest.AdditionalProperties.invitedBy } else { "Unknown" }
                LastSignInDateTime = if ($guest.SignInActivity) { $guest.SignInActivity.LastSignInDateTime } else { $null }
            })
        }
        
        Write-MandALog "Processed $($guestData.Count) guest users" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $guestData -FilePath $outputFile
        
        return $guestData
        
    } catch {
        Write-MandALog "Error retrieving Teams guest users: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-TeamsPoliciesData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "TeamsPolicies.csv"
    $policiesData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Teams policies CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving Teams policies..." -Level "INFO"
        
        # Get different policy types
        $policyTypes = @(
            @{ Type = "MeetingPolicy"; Command = "Get-CsTeamsMeetingPolicy" },
            @{ Type = "MessagingPolicy"; Command = "Get-CsTeamsMessagingPolicy" },
            @{ Type = "CallingPolicy"; Command = "Get-CsTeamsCallingPolicy" },
            @{ Type = "AppPermissionPolicy"; Command = "Get-CsTeamsAppPermissionPolicy" },
            @{ Type = "AppSetupPolicy"; Command = "Get-CsTeamsAppSetupPolicy" },
            @{ Type = "ChannelsPolicy"; Command = "Get-CsTeamsChannelsPolicy" },
            @{ Type = "UpdateManagementPolicy"; Command = "Get-CsTeamsUpdateManagementPolicy" }
        )
        
        foreach ($policyType in $policyTypes) {
            try {
                $policies = & $policyType.Command -ErrorAction Stop
                
                foreach ($policy in $policies) {
                    $policyProperties = @{}
                    
                    # Convert policy object to hashtable for easier handling
                    $policy.PSObject.Properties | ForEach-Object {
                        if ($_.Name -notin @("RunspaceId", "PSComputerName", "PSShowComputerName")) {
                            $policyProperties[$_.Name] = $_.Value
                        }
                    }
                    
                    $policiesData.Add([PSCustomObject]@{
                        PolicyType = $policyType.Type
                        PolicyName = $policy.Identity
                        Description = if ($policy.Description) { $policy.Description } else { "" }
                        IsGlobal = $policy.Identity -eq "Global"
                        CreatedDate = if ($policy.CreatedDate) { $policy.CreatedDate } else { $null }
                        ModifiedDate = if ($policy.ModifiedDate) { $policy.ModifiedDate } else { $null }
                        PolicySettings = ($policyProperties | ConvertTo-Json -Compress)
                    })
                }
                
                Write-MandALog "Retrieved $($policies.Count) $($policyType.Type) policies" -Level "INFO"
                
            } catch {
                Write-MandALog "Error retrieving $($policyType.Type): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-MandALog "Retrieved total of $($policiesData.Count) Teams policies" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $policiesData -FilePath $outputFile
        
        return $policiesData
        
    } catch {
        Write-MandALog "Error retrieving Teams policies: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-TeamsPhoneData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "TeamsPhone.csv"
    $phoneData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Teams phone CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving Teams phone configurations..." -Level "INFO"
        
        # Get phone number assignments
        try {
            $phoneNumbers = Get-CsPhoneNumberAssignment -ErrorAction Stop
            
            foreach ($number in $phoneNumbers) {
                $phoneData.Add([PSCustomObject]@{
                    TelephoneNumber = $number.TelephoneNumber
                    NumberType = $number.NumberType
                    ActivationState = $number.ActivationState
                    AssignedPstnTargetId = $number.AssignedPstnTargetId
                    Capability = $number.Capability
                    City = $number.City
                    Country = $number.Country
                    IsOperatorConnect = $number.IsOperatorConnect
                    PortInOrderStatus = $number.PortInOrderStatus
                    AssignmentStatus = $number.AssignmentStatus
                    AssignedUser = $number.AssignedUser
                    PstnAssignmentStatus = $number.PstnAssignmentStatus
                })
            }
            
            Write-MandALog "Retrieved $($phoneNumbers.Count) phone number assignments" -Level "SUCCESS"
            
        } catch {
            Write-MandALog "Error retrieving phone numbers: $($_.Exception.Message)" -Level "WARN"
        }
        
        # Get voice routes
        try {
            $voiceRoutes = Get-CsOnlineVoiceRoute -ErrorAction Stop
            
            foreach ($route in $voiceRoutes) {
                $phoneData.Add([PSCustomObject]@{
                    ConfigurationType = "VoiceRoute"
                    Name = $route.Identity
                    Description = $route.Description
                    NumberPattern = $route.NumberPattern
                    OnlinePstnUsages = ($route.OnlinePstnUsages -join ";")
                    OnlinePstnGatewayList = ($route.OnlinePstnGatewayList -join ";")
                    Priority = $route.Priority
                })
            }
            
            Write-MandALog "Retrieved $($voiceRoutes.Count) voice routes" -Level "INFO"
            
        } catch {
            Write-MandALog "No voice routes found or error retrieving: $($_.Exception.Message)" -Level "DEBUG"
        }
        
        # Export to CSV
        if ($phoneData.Count -gt 0) {
            Export-DataToCSV -Data $phoneData -FilePath $outputFile
        }
        
        return $phoneData
        
    } catch {
        Write-MandALog "Error retrieving Teams phone data: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Invoke-TeamsDiscovery',
    'Get-TeamsData',
    'Get-TeamChannelsData',
    'Get-TeamMembersData',
    'Get-TeamAppsData',
    'Get-TeamsGuestUsersData',
    'Get-TeamsPoliciesData',
    'Get-TeamsPhoneData'
)
