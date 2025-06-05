# -*- coding: utf-8-bom -*-
<#
.SYNOPSIS
    Microsoft Teams discovery for M&A Discovery Suite
.DESCRIPTION
    Discovers Teams, channels, members, apps, policies, and phone configurations
#>

# Modules/Discovery/TeamsDiscovery.psm1
#Cannot use $outputpath as its used internally here


function Invoke-TeamsDiscovery {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Starting Microsoft Teams discovery" -Level "HEADER"
        
   

        
        $rawPath = Join-Path $outputPath "Raw"
        
        $discoveryResults = @{}
        
        # Verify Teams connection by actually testing a Teams cmdlet
        $isConnected = $false
        try {
            # Try to get teams to verify connection
            $testTeams = Get-Team -ErrorAction Stop | Select-Object -First 1
            $isConnected = $true
            Write-MandALog "Microsoft Teams connection verified" -Level "SUCCESS"
        } catch {
            if ($_.Exception.Message -like "*You must call the Connect-MicrosoftTeams*") {
                Write-MandALog "Microsoft Teams not connected. Attempting connection..." -Level "WARN"
                
                # Try to connect using existing credentials
                try {
                    # First check if we have a stored credential or service principal
                    if ($Configuration.authentication.useServicePrincipal) {
                        # Get credentials from credential store
                        $credPath = $Configuration.authentication.credentialStorePath
                        if (Test-Path $credPath) {
                            $credData = Get-Content $credPath | ConvertFrom-Json
                            if ($credData.AppId -and $credData.TenantId) {
                                # Convert secure string back to plain text for connection
                                $securePassword = ConvertTo-SecureString $credData.ClientSecret -AsPlainText -Force
                                $credential = New-Object System.Management.Automation.PSCredential($credData.AppId, $securePassword)
                                
                                # Connect using service principal
                                Connect-MicrosoftTeams -Credential $credential -TenantId $credData.TenantId -ErrorAction Stop
                                $isConnected = $true
                                Write-MandALog "Successfully connected to Microsoft Teams using service principal" -Level "SUCCESS"
                            }
                        }
                    }
                    
                    if (-not $isConnected) {
                        # Try interactive connection as fallback
                        Connect-MicrosoftTeams -ErrorAction Stop
                        $isConnected = $true
                        Write-MandALog "Successfully connected to Microsoft Teams interactively" -Level "SUCCESS"
                    }
                    
                    # Verify connection worked
                    $testTeams = Get-Team -ErrorAction Stop | Select-Object -First 1
                    
                } catch {
                    Write-MandALog "Failed to connect to Microsoft Teams: $($_.Exception.Message)" -Level "ERROR"
                    Write-MandALog "Teams discovery will be skipped." -Level "WARN"
                    return @{}
                }
            } else {
                # Some other error occurred
                Write-MandALog "Error verifying Teams connection: $($_.Exception.Message)" -Level "ERROR"
                return @{}
            }
        }
        
        if (-not $isConnected) {
            Write-MandALog "Unable to establish Teams connection. Skipping Teams discovery." -Level "WARN"
            return @{}
        }
        
        # Teams
        Write-MandALog "Discovering Teams..." -Level "INFO"
        $discoveryResults.Teams = Get-TeamsData -OutputPath $rawPath -Configuration $Configuration
        
        # If no teams were found, skip remaining discovery
        if ($null -eq $discoveryResults.Teams -or $discoveryResults.Teams.Count -eq 0) {
            Write-MandALog "No teams found or error retrieving teams. Skipping detailed Teams discovery." -Level "WARN"
            return $discoveryResults
        }
        
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
        return @{}
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
        
        $teams = @()
        try {
            $teams = Get-Team -ErrorAction Stop
        } catch {
            if ($_.Exception.Message -like "*You must call the Connect-MicrosoftTeams*") {
                Write-MandALog "Teams connection lost. Unable to retrieve teams." -Level "ERROR"
                return @()
            } else {
                throw
            }
        }
        
        if ($null -eq $teams -or $teams.Count -eq 0) {
            Write-MandALog "No teams found in the tenant" -Level "WARN"
            return @()
        }
        
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
                $owners = @()
                $members = @()
                $guests = @()
                
                try {
                    $owners = @(Get-TeamUser -GroupId $team.GroupId -Role Owner -ErrorAction SilentlyContinue)
                } catch {
                    Write-MandALog "Could not get owners for team $($team.DisplayName)" -Level "DEBUG"
                }
                
                try {
                    $members = @(Get-TeamUser -GroupId $team.GroupId -Role Member -ErrorAction SilentlyContinue)
                } catch {
                    Write-MandALog "Could not get members for team $($team.DisplayName)" -Level "DEBUG"
                }
                
                try {
                    $guests = @(Get-TeamUser -GroupId $team.GroupId -Role Guest -ErrorAction SilentlyContinue)
                } catch {
                    Write-MandALog "Could not get guests for team $($team.DisplayName)" -Level "DEBUG"
                }
                
                $teamsData.Add([PSCustomObject]@{
                    GroupId = $team.GroupId
                    DisplayName = $team.DisplayName
                    Description = $team.Description
                    Visibility = $team.Visibility
                    Archived = $team.Archived
                    MailNickName = $team.MailNickName
                    Classification = $team.Classification
                    CreatedDateTime = if ($teamDetails.CreatedDateTime) { $teamDetails.CreatedDateTime } else { $null }
                    OwnerCount = $owners.Count
                    MemberCount = $members.Count
                    GuestCount = $guests.Count
                    TotalMemberCount = $owners.Count + $members.Count + $guests.Count
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
                    HasGuests = $guests.Count -gt 0
                })
                
            } catch {
                Write-MandALog "Error processing team $($team.DisplayName): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-Progress -Activity "Processing Teams" -Completed
        
        # Export to CSV
        if ($teamsData.Count -gt 0) {
            Export-DataToCSV -Data $teamsData -FilePath $outputFile
        }
        
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
                    $channelDetails = $null
                    try {
                        $channelDetails = Get-TeamChannel -GroupId $team.GroupId -DisplayName $channel.DisplayName -ErrorAction SilentlyContinue
                    } catch {
                        Write-MandALog "Could not get details for channel $($channel.DisplayName)" -Level "DEBUG"
                    }
                    
                    $channelsData.Add([PSCustomObject]@{
                        TeamId = $team.GroupId
                        TeamDisplayName = $team.DisplayName
                        ChannelId = $channel.Id
                        ChannelDisplayName = $channel.DisplayName
                        Description = $channel.Description
                        Email = if ($channelDetails) { $channelDetails.Email } else { $null }
                        IsFavoriteByDefault = $channel.IsFavoriteByDefault
                        MembershipType = $channel.MembershipType
                        CreatedDateTime = if ($channelDetails) { $channelDetails.CreatedDateTime } else { $null }
                        Type = if ($channel.DisplayName -eq "General") { "Default" } else { "Standard" }
                        ModerationSettings = if ($channelDetails -and $channelDetails.ModerationSettings) { 
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
        if ($channelsData.Count -gt 0) {
            Export-DataToCSV -Data $channelsData -FilePath $outputFile
        }
        
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
        if ($membersData.Count -gt 0) {
            Export-DataToCSV -Data $membersData -FilePath $outputFile
        }
        
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
                        ConsentedPermissionSet = if ($app.ConsentedPermissionSet) { $app.ConsentedPermissionSet -join ";" } else { "" }
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
        if ($appsData.Count -gt 0) {
            Export-DataToCSV -Data $appsData -FilePath $outputFile
        }
        
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
        
        # Check if we have Graph connection
        $graphContext = Get-MgContext -ErrorAction SilentlyContinue
        if (-not $graphContext) {
            Write-MandALog "Microsoft Graph not connected. Cannot retrieve guest users." -Level "WARN"
            return @()
        }
        
        # Get all unique guest users from Graph
        $guestUsers = @()
        try {
            $guestUsers = Get-MgUser -Filter "userType eq 'Guest'" -All -ErrorAction Stop
        } catch {
            Write-MandALog "Error retrieving guest users from Graph: $($_.Exception.Message)" -Level "ERROR"
            return @()
        }
        
        Write-MandALog "Found $($guestUsers.Count) guest users in tenant" -Level "INFO"
        
        $processedCount = 0
        foreach ($guest in $guestUsers) {
            $processedCount++
            if ($processedCount % 50 -eq 0) {
                Write-Progress -Activity "Processing Guest Users" -Status "User $processedCount of $($guestUsers.Count)" -PercentComplete (($processedCount / $guestUsers.Count) * 100)
            }
            
            # Get group memberships for guest
            $teamMemberships = @()
            
            try {
                $groupMemberships = Get-MgUserMemberOf -UserId $guest.Id -ErrorAction SilentlyContinue
                
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
            } catch {
                Write-MandALog "Could not get memberships for guest $($guest.UserPrincipalName)" -Level "DEBUG"
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
        
        Write-Progress -Activity "Processing Guest Users" -Completed
        Write-MandALog "Processed $($guestData.Count) guest users" -Level "SUCCESS"
        
        # Export to CSV
        if ($guestData.Count -gt 0) {
            Export-DataToCSV -Data $guestData -FilePath $outputFile
        }
        
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
                # Check if command exists
                if (-not (Get-Command $policyType.Command -ErrorAction SilentlyContinue)) {
                    Write-MandALog "Command $($policyType.Command) not available. Skipping $($policyType.Type)" -Level "DEBUG"
                    continue
                }
                
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
        if ($policiesData.Count -gt 0) {
            Export-DataToCSV -Data $policiesData -FilePath $outputFile
        }
        
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
            if (Get-Command Get-CsPhoneNumberAssignment -ErrorAction SilentlyContinue) {
                $phoneNumbers = Get-CsPhoneNumberAssignment -ErrorAction Stop
                
                foreach ($number in $phoneNumbers) {
                    $phoneData.Add([PSCustomObject]@{
                        ConfigurationType = "PhoneNumber"
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
            } else {
                Write-MandALog "Get-CsPhoneNumberAssignment cmdlet not available" -Level "DEBUG"
            }
            
        } catch {
            Write-MandALog "Error retrieving phone numbers: $($_.Exception.Message)" -Level "WARN"
        }
        
        # Get voice routes
        try {
            if (Get-Command Get-CsOnlineVoiceRoute -ErrorAction SilentlyContinue) {
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
                        TelephoneNumber = $null
                        NumberType = $null
                        ActivationState = $null
                        AssignedPstnTargetId = $null
                        Capability = $null
                        City = $null
                        Country = $null
                        IsOperatorConnect = $null
                        PortInOrderStatus = $null
                        AssignmentStatus = $null
                        AssignedUser = $null
                        PstnAssignmentStatus = $null
                    })
                }
                
                Write-MandALog "Retrieved $($voiceRoutes.Count) voice routes" -Level "INFO"
            } else {
                Write-MandALog "Get-CsOnlineVoiceRoute cmdlet not available" -Level "DEBUG"
            }
            
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

# Helper functions
function Export-DataToCSV {
    param(
        [Parameter(Mandatory=$true)]
        [object[]]$Data,
        
        [Parameter(Mandatory=$true)]
        [string]$FilePath
    )
    
    if ($null -eq $Data -or $Data.Count -eq 0) {
        Write-MandALog "No data to export to $FilePath" -Level "WARN"
        return
    }
    
    try {
        $Data | Export-Csv -Path $FilePath -NoTypeInformation -Encoding UTF8
        Write-MandALog "Exported $($Data.Count) records to $FilePath" -Level "SUCCESS"
    } catch {
        Write-MandALog "Failed to export data to $FilePath`: $($_.Exception.Message)" -Level "ERROR"
    }
}

function Import-DataFromCSV {
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-MandALog "CSV file not found: $FilePath" -Level "WARN"
        return @()
    }
    
    try {
        $data = Import-Csv -Path $FilePath -Encoding UTF8
        Write-MandALog "Imported $($data.Count) records from $FilePath" -Level "INFO"
        return $data
    } catch {
        Write-MandALog "Failed to import CSV from $FilePath`: $($_.Exception.Message)" -Level "ERROR"
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
