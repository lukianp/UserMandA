# -*- coding: utf-8-bom -*-
#Requires -Version 5.1


# Fallback logging function if Write-MandALog is not available
if (-not (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
    function Write-MandALog {
        param(
            [string]$Message,
            [string]$Level = "INFO",
            [string]$Component = "Discovery",
            [hashtable]$Context = @{}
        )
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        Write-Host "[$timestamp] [$Level] [$Component] $Message" -ForegroundColor $(
            switch ($Level) {
                'ERROR' { 'Red' }
                'WARN' { 'Yellow' }
                'SUCCESS' { 'Green' }
                'HEADER' { 'Cyan' }
                'DEBUG' { 'Gray' }
                default { 'White' }
            }
        )
    }
}

function Write-TeamsLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    Write-MandALog -Message "[Teams] $Message" -Level $Level -Component "TeamsDiscovery" -Context $Context
}

# --- Main Discovery Function ---

function Invoke-TeamsDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$false)]
        [string]$SessionId
    )

    Write-TeamsLog -Level "HEADER" -Message "Starting Discovery" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # 1. INITIALIZE RESULT OBJECT
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('Teams')
    } else {
        # Fallback to hashtable
        $result = @{
            Success      = $true; ModuleName = 'Teams'; RecordCount = 0;
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
        Write-TeamsLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-TeamsLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
        Ensure-Path -Path $outputPath

        # 3. VALIDATE MODULE-SPECIFIC CONFIGURATION
        $includeChannelMessages = $false
        $includeApps = $true
        $includeSettings = $true
        $includeTabs = $true
        $includeFiles = $false
        
        if ($Configuration.discovery -and $Configuration.discovery.teams) {
            $teamsConfig = $Configuration.discovery.teams
            if ($null -ne $teamsConfig.includeChannelMessages) { $includeChannelMessages = $teamsConfig.includeChannelMessages }
            if ($null -ne $teamsConfig.includeApps) { $includeApps = $teamsConfig.includeApps }
            if ($null -ne $teamsConfig.includeSettings) { $includeSettings = $teamsConfig.includeSettings }
            if ($null -ne $teamsConfig.includeTabs) { $includeTabs = $teamsConfig.includeTabs }
            if ($null -ne $teamsConfig.includeFiles) { $includeFiles = $teamsConfig.includeFiles }
        }

        # 4. AUTHENTICATE & CONNECT
        Write-TeamsLog -Level "INFO" -Message "Getting authentication for Graph service..." -Context $Context
        try {
            $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId
            Write-TeamsLog -Level "SUCCESS" -Message "Connected to Microsoft Graph via session authentication" -Context $Context
        } catch {
            $result.AddError("Failed to authenticate with Graph service: $($_.Exception.Message)", $_.Exception, $null)
            return $result
        }

        # 5. PERFORM DISCOVERY
        Write-TeamsLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Discover Teams
        $teams = @()
        try {
            Write-TeamsLog -Level "INFO" -Message "Discovering Microsoft Teams..." -Context $Context
            
            # Get all groups that are Teams-enabled
            $uri = "https://graph.microsoft.com/v1.0/groups?`$filter=resourceProvisioningOptions/Any(x:x eq 'Team')&`$select=id,displayName,description,visibility,createdDateTime,mailNickname,mail,isArchived&`$top=999"
            
            do {
                $response = Invoke-MgGraphRequest -Uri $uri -Method GET -Headers @{'ConsistencyLevel'='eventual'} -ErrorAction Stop
                
                foreach ($team in $response.value) {
                    # Get Teams-specific settings
                    $teamSettings = $null
                    try {
                        $teamUri = "https://graph.microsoft.com/v1.0/teams/$($team.id)"
                        $teamSettings = Invoke-MgGraphRequest -Uri $teamUri -Method GET -ErrorAction Stop
                    } catch {
                        Write-TeamsLog -Level "DEBUG" -Message "Could not get settings for team $($team.displayName): $_" -Context $Context
                    }
                    
                    $teamObj = [PSCustomObject]@{
                        TeamId = $team.id
                        DisplayName = $team.displayName
                        Description = $team.description
                        Visibility = $team.visibility
                        Mail = $team.mail
                        MailNickname = $team.mailNickname
                        CreatedDateTime = $team.createdDateTime
                        IsArchived = if ($teamSettings) { $teamSettings.isArchived } else { $null }
                        # Team settings
                        MemberSettings_AllowCreateUpdateChannels = if ($teamSettings) { $teamSettings.memberSettings.allowCreateUpdateChannels } else { $null }
                        MemberSettings_AllowDeleteChannels = if ($teamSettings) { $teamSettings.memberSettings.allowDeleteChannels } else { $null }
                        MemberSettings_AllowAddRemoveApps = if ($teamSettings) { $teamSettings.memberSettings.allowAddRemoveApps } else { $null }
                        MemberSettings_AllowCreateUpdateRemoveTabs = if ($teamSettings) { $teamSettings.memberSettings.allowCreateUpdateRemoveTabs } else { $null }
                        MemberSettings_AllowCreateUpdateRemoveConnectors = if ($teamSettings) { $teamSettings.memberSettings.allowCreateUpdateRemoveConnectors } else { $null }
                        GuestSettings_AllowCreateUpdateChannels = if ($teamSettings) { $teamSettings.guestSettings.allowCreateUpdateChannels } else { $null }
                        GuestSettings_AllowDeleteChannels = if ($teamSettings) { $teamSettings.guestSettings.allowDeleteChannels } else { $null }
                        MessagingSettings_AllowUserEditMessages = if ($teamSettings) { $teamSettings.messagingSettings.allowUserEditMessages } else { $null }
                        MessagingSettings_AllowUserDeleteMessages = if ($teamSettings) { $teamSettings.messagingSettings.allowUserDeleteMessages } else { $null }
                        MessagingSettings_AllowOwnerDeleteMessages = if ($teamSettings) { $teamSettings.messagingSettings.allowOwnerDeleteMessages } else { $null }
                        MessagingSettings_AllowTeamMentions = if ($teamSettings) { $teamSettings.messagingSettings.allowTeamMentions } else { $null }
                        MessagingSettings_AllowChannelMentions = if ($teamSettings) { $teamSettings.messagingSettings.allowChannelMentions } else { $null }
                        FunSettings_AllowGiphy = if ($teamSettings) { $teamSettings.funSettings.allowGiphy } else { $null }
                        FunSettings_GiphyContentRating = if ($teamSettings) { $teamSettings.funSettings.giphyContentRating } else { $null }
                        FunSettings_AllowStickersAndMemes = if ($teamSettings) { $teamSettings.funSettings.allowStickersAndMemes } else { $null }
                        FunSettings_AllowCustomMemes = if ($teamSettings) { $teamSettings.funSettings.allowCustomMemes } else { $null }
                        _DataType = 'Team'
                    }
                    
                    $teams += $teamObj
                    $null = $allDiscoveredData.Add($teamObj)
                    
                    Write-TeamsLog -Level "DEBUG" -Message "Discovered team: $($team.displayName)" -Context $Context
                }
                
                $uri = $response.'@odata.nextLink'
            } while ($uri)
            
            Write-TeamsLog -Level "SUCCESS" -Message "Discovered $($teams.Count) Teams" -Context $Context
            
        } catch {
            $result.AddWarning("Failed to discover Teams: $($_.Exception.Message)", @{Section="Teams"})
        }
        
        # Discover Channels
        $channels = @()
        $channelCount = 0
        foreach ($team in $teams) {
            try {
                Write-TeamsLog -Level "DEBUG" -Message "Getting channels for team: $($team.DisplayName)" -Context $Context
                
                $channelUri = "https://graph.microsoft.com/v1.0/teams/$($team.TeamId)/channels"
                $channelResponse = Invoke-MgGraphRequest -Uri $channelUri -Method GET -ErrorAction Stop
                
                foreach ($channel in $channelResponse.value) {
                    $channelCount++
                    
                    $channelObj = [PSCustomObject]@{
                        TeamId = $team.TeamId
                        TeamDisplayName = $team.DisplayName
                        ChannelId = $channel.id
                        DisplayName = $channel.displayName
                        Description = $channel.description
                        Email = $channel.email
                        WebUrl = $channel.webUrl
                        MembershipType = $channel.membershipType
                        CreatedDateTime = $channel.createdDateTime
                        _DataType = 'Channel'
                    }
                    
                    $channels += $channelObj
                    $null = $allDiscoveredData.Add($channelObj)
                    
                    # Get tabs if enabled
                    if ($includeTabs) {
                        try {
                            $tabUri = "https://graph.microsoft.com/v1.0/teams/$($team.TeamId)/channels/$($channel.id)/tabs"
                            $tabResponse = Invoke-MgGraphRequest -Uri $tabUri -Method GET -ErrorAction Stop
                            
                            foreach ($tab in $tabResponse.value) {
                                $tabObj = [PSCustomObject]@{
                                    TeamId = $team.TeamId
                                    TeamDisplayName = $team.DisplayName
                                    ChannelId = $channel.id
                                    ChannelDisplayName = $channel.displayName
                                    TabId = $tab.id
                                    DisplayName = $tab.displayName
                                    WebUrl = $tab.webUrl
                                    TeamsAppId = $tab.teamsApp.id
                                    TeamsAppDisplayName = $tab.teamsApp.displayName
                                    TeamsAppDistributionMethod = $tab.teamsApp.distributionMethod
                                    _DataType = 'ChannelTab'
                                }
                                
                                $null = $allDiscoveredData.Add($tabObj)
                            }
                        } catch {
                            Write-TeamsLog -Level "DEBUG" -Message "Could not get tabs for channel $($channel.displayName): $_" -Context $Context
                        }
                    }
                }
                
                # Small delay to avoid throttling
                if ($channelCount % 20 -eq 0) {
                    Start-Sleep -Milliseconds 500
                }
                
            } catch {
                Write-TeamsLog -Level "DEBUG" -Message "Could not get channels for team $($team.DisplayName): $_" -Context $Context
            }
        }
        
        Write-TeamsLog -Level "SUCCESS" -Message "Discovered $channelCount channels across $($teams.Count) teams" -Context $Context
        
        # Discover Team Members
        $teamMembers = @()
        foreach ($team in $teams) {
            try {
                Write-TeamsLog -Level "DEBUG" -Message "Getting members for team: $($team.DisplayName)" -Context $Context
                
                # Get owners
                $ownersUri = "https://graph.microsoft.com/v1.0/groups/$($team.TeamId)/owners?`$select=id,displayName,userPrincipalName,mail"
                $ownersResponse = Invoke-MgGraphRequest -Uri $ownersUri -Method GET -ErrorAction Stop
                
                foreach ($owner in $ownersResponse.value) {
                    $memberObj = [PSCustomObject]@{
                        TeamId = $team.TeamId
                        TeamDisplayName = $team.DisplayName
                        UserId = $owner.id
                        UserDisplayName = $owner.displayName
                        UserPrincipalName = $owner.userPrincipalName
                        UserMail = $owner.mail
                        MembershipType = 'Owner'
                        _DataType = 'TeamMember'
                    }
                    
                    $teamMembers += $memberObj
                    $null = $allDiscoveredData.Add($memberObj)
                }
                
                # Get members
                $membersUri = "https://graph.microsoft.com/v1.0/groups/$($team.TeamId)/members?`$select=id,displayName,userPrincipalName,mail"
                do {
                    $membersResponse = Invoke-MgGraphRequest -Uri $membersUri -Method GET -ErrorAction Stop
                    
                    foreach ($member in $membersResponse.value) {
                        # Check if already added as owner
                        if ($teamMembers | Where-Object { $_.TeamId -eq $team.TeamId -and $_.UserId -eq $member.id }) {
                            continue
                        }
                        
                        $memberObj = [PSCustomObject]@{
                            TeamId = $team.TeamId
                            TeamDisplayName = $team.DisplayName
                            UserId = $member.id
                            UserDisplayName = $member.displayName
                            UserPrincipalName = $member.userPrincipalName
                            UserMail = $member.mail
                            MembershipType = 'Member'
                            _DataType = 'TeamMember'
                        }
                        
                        $teamMembers += $memberObj
                        $null = $allDiscoveredData.Add($memberObj)
                    }
                    
                    $membersUri = $membersResponse.'@odata.nextLink'
                } while ($membersUri)
                
            } catch {
                Write-TeamsLog -Level "DEBUG" -Message "Could not get members for team $($team.DisplayName): $_" -Context $Context
            }
        }
        
        Write-TeamsLog -Level "SUCCESS" -Message "Discovered $($teamMembers.Count) team memberships" -Context $Context
        
        # Discover Teams Apps (if enabled)
        if ($includeApps) {
            try {
                Write-TeamsLog -Level "INFO" -Message "Discovering Teams apps..." -Context $Context
                
                # Get installed apps for each team
                $installedApps = @()
                foreach ($team in $teams) {
                    try {
                        $appsUri = "https://graph.microsoft.com/v1.0/teams/$($team.TeamId)/installedApps?`$expand=teamsApp"
                        $appsResponse = Invoke-MgGraphRequest -Uri $appsUri -Method GET -ErrorAction Stop
                        
                        foreach ($app in $appsResponse.value) {
                            $appObj = [PSCustomObject]@{
                                TeamId = $team.TeamId
                                TeamDisplayName = $team.DisplayName
                                AppId = $app.id
                                TeamsAppId = $app.teamsApp.id
                                DisplayName = $app.teamsApp.displayName
                                DistributionMethod = $app.teamsApp.distributionMethod
                                _DataType = 'TeamApp'
                            }
                            
                            $installedApps += $appObj
                            $null = $allDiscoveredData.Add($appObj)
                        }
                    } catch {
                        Write-TeamsLog -Level "DEBUG" -Message "Could not get apps for team $($team.DisplayName): $_" -Context $Context
                    }
                }
                
                Write-TeamsLog -Level "SUCCESS" -Message "Discovered $($installedApps.Count) installed apps" -Context $Context
                
                # Get org-wide Teams apps
                try {
                    $orgAppsUri = "https://graph.microsoft.com/v1.0/appCatalogs/teamsApps?`$filter=distributionMethod eq 'organization'"
                    $orgAppsResponse = Invoke-MgGraphRequest -Uri $orgAppsUri -Method GET -ErrorAction Stop
                    
                    foreach ($app in $orgAppsResponse.value) {
                        $orgAppObj = [PSCustomObject]@{
                            TeamsAppId = $app.id
                            DisplayName = $app.displayName
                            DistributionMethod = $app.distributionMethod
                            ExternalId = $app.externalId
                            _DataType = 'OrgWideTeamsApp'
                        }
                        
                        $null = $allDiscoveredData.Add($orgAppObj)
                    }
                    
                    Write-TeamsLog -Level "SUCCESS" -Message "Discovered $($orgAppsResponse.value.Count) org-wide apps" -Context $Context
                    
                } catch {
                    Write-TeamsLog -Level "DEBUG" -Message "Could not get org-wide apps: $_" -Context $Context
                }
                
            } catch {
                $result.AddWarning("Failed to discover Teams apps: $($_.Exception.Message)", @{Section="TeamsApps"})
            }
        }

        # 6. EXPORT DATA TO CSV
        if ($allDiscoveredData.Count -gt 0) {
            Write-TeamsLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            
            # Group by data type and export
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $data = $group.Group
                
                # Add metadata
                $data | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Teams" -Force
                }
                
                # Determine filename - MUST match orchestrator expectations
                $fileName = switch ($dataType) {
                    'Team' { 'TeamsTeams.csv' }
                    'Channel' { 'TeamsChannels.csv' }
                    'ChannelTab' { 'TeamsChannelTabs.csv' }
                    'TeamMember' { 'TeamsMembers.csv' }
                    'TeamApp' { 'TeamsInstalledApps.csv' }
                    'OrgWideTeamsApp' { 'TeamsOrgWideApps.csv' }
                    default { "Teams_$dataType.csv" }
                }
                
                $filePath = Join-Path $outputPath $fileName
                $data | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                
                Write-TeamsLog -Level "SUCCESS" -Message "Exported $($data.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-TeamsLog -Level "WARN" -Message "No data discovered to export" -Context $Context
        }

        # 7. FINALIZE METADATA
        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        $result.Metadata["TeamCount"] = $teams.Count
        $result.Metadata["ChannelCount"] = $channels.Count
        $result.Metadata["MembershipCount"] = $teamMembers.Count

    }
    catch [System.UnauthorizedAccessException] {
        $result.AddError("Access denied: $($_.Exception.Message)", $_.Exception, @{ErrorType="Authorization"})
        Write-TeamsLog -Level "ERROR" -Message "Authorization error: $($_.Exception.Message)" -Context $Context
    }
    catch [System.Net.WebException] {
        $result.AddError("Network error: $($_.Exception.Message)", $_.Exception, @{ErrorType="Network"})
        Write-TeamsLog -Level "ERROR" -Message "Network error: $($_.Exception.Message)" -Context $Context
    }
    catch {
        $result.AddError("Unexpected error: $($_.Exception.Message)", $_.Exception, @{ErrorType="General"})
        Write-TeamsLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
    }
    finally {
        # 8. CLEANUP & COMPLETE
        Write-TeamsLog -Level "INFO" -Message "Cleaning up..." -Context $Context
        
        # Disconnect from services
        Disconnect-MgGraph -ErrorAction SilentlyContinue
        
        $stopwatch.Stop()
        $result.Complete()
        
        # Ensure RecordCount is properly set
        if ($result -is [hashtable]) {
            $result['RecordCount'] = $allDiscoveredData.Count
        }
        
        Write-TeamsLog -Level $(if($result.Success){"SUCCESS"}else{"ERROR"}) -Message "Discovery completed with $($result.RecordCount) records" -Context $Context
        Write-TeamsLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
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
Export-ModuleMember -Function Invoke-TeamsDiscovery
