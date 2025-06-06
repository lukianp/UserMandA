# -*- coding: utf-8-bom -*-

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-04
# Last Modified: 2025-06-06
# Change Log: Updated version control header


# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-04
# Last Modified: 2025-06-06
# Change Log: Initial version - any future changes require version increment

<#
.SYNOPSIS
    Microsoft Teams discovery for M&A Discovery Suite
.DESCRIPTION
    Discovers Teams, channels, members, apps, policies, and phone configurations
#>

# Modules/Discovery/TeamsDiscovery.psm1

# Teams Discovery Prerequisites Function
function Test-TeamsDiscoveryPrerequisites {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [DiscoveryResult]$Result,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    Write-MandALog "Validating Teams Discovery prerequisites..." -Level "INFO" -Context $Context
    
    try {
        # Check if Microsoft Teams PowerShell is available
        if (-not (Get-Module -Name MicrosoftTeams -ListAvailable)) {
            $Result.AddError("MicrosoftTeams PowerShell module is not available", $null, @{
                Prerequisite = 'MicrosoftTeams Module'
                Resolution = 'Install MicrosoftTeams PowerShell module using Install-Module MicrosoftTeams'
            })
            return
        }
        
        # Import the module if not already loaded
        if (-not (Get-Module -Name MicrosoftTeams)) {
            Import-Module MicrosoftTeams -ErrorAction Stop
            Write-MandALog "MicrosoftTeams module imported successfully" -Level "DEBUG" -Context $Context
        }
        
        # Test Teams connectivity
        try {
            $testTeams = Get-Team -ErrorAction Stop | Select-Object -First 1
            Write-MandALog "Successfully connected to Microsoft Teams" -Level "SUCCESS" -Context $Context
            $Result.Metadata['TeamsConnected'] = $true
        }
        catch {
            if ($_.Exception.Message -like "*You must call the Connect-MicrosoftTeams*") {
                $Result.AddError("Not connected to Microsoft Teams", $_.Exception, @{
                    Prerequisite = 'Teams Authentication'
                    Resolution = 'Connect to Microsoft Teams using Connect-MicrosoftTeams'
                })
                return
            } else {
                $Result.AddError("Failed to access Microsoft Teams", $_.Exception, @{
                    Prerequisite = 'Teams Access'
                    Resolution = 'Verify Microsoft Teams connection and permissions'
                })
                return
            }
        }
        
        Write-MandALog "All Teams Discovery prerequisites validated successfully" -Level "SUCCESS" -Context $Context
        
    }
    catch {
        $Result.AddError("Unexpected error during prerequisites validation", $_.Exception, @{
            Prerequisite = 'General Validation'
        })
    }
}

function Get-TeamsWithErrorHandling {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    $teams = [System.Collections.ArrayList]::new()
    $retryCount = 0
    $maxRetries = 3
    
    while ($retryCount -lt $maxRetries) {
        try {
            Write-MandALog "Retrieving all Teams..." -Level "INFO" -Context $Context
            
            $allTeams = Get-Team -ErrorAction Stop
            
            if ($null -eq $allTeams -or $allTeams.Count -eq 0) {
                Write-MandALog "No teams found in the tenant" -Level "WARN" -Context $Context
                return @()
            }
            
            Write-MandALog "Found $($allTeams.Count) teams" -Level "SUCCESS" -Context $Context
            
            # Process teams with individual error handling
            $processedCount = 0
            foreach ($team in $allTeams) {
                try {
                    $processedCount++
                    if ($processedCount % 10 -eq 0) {
                        Write-MandALog "Processed $processedCount/$($allTeams.Count) teams" -Level "PROGRESS" -Context $Context
                    }
                    
                    $teamObj = ConvertTo-TeamsObject -Team $team -Context $Context
                    if ($teamObj) {
                        $null = $teams.Add($teamObj)
                    }
                }
                catch {
                    Write-MandALog "Error processing team $($team.DisplayName): $_" -Level "WARN" -Context $Context
                    # Continue processing other teams
                }
            }
            
            # Success - exit retry loop
            break
        }
        catch {
            $retryCount++
            if ($retryCount -ge $maxRetries) {
                throw "Failed to retrieve Teams after $maxRetries attempts: $_"
            }
            
            $waitTime = [Math]::Pow(2, $retryCount) * 2  # Exponential backoff
            Write-MandALog "Teams query failed (attempt $retryCount/$maxRetries). Waiting $waitTime seconds..." -Level "WARN" -Context $Context
            Start-Sleep -Seconds $waitTime
        }
    }
    
    return $teams.ToArray()
}

function ConvertTo-TeamsObject {
    param($Team, $Context)
    
    try {
        # Get team details
        $teamDetails = Get-Team -GroupId $Team.GroupId -ErrorAction Stop
        
        # Get owner and member counts
        $owners = @()
        $members = @()
        $guests = @()
        
        try {
            $owners = @(Get-TeamUser -GroupId $Team.GroupId -Role Owner -ErrorAction SilentlyContinue)
        } catch {
            Write-MandALog "Could not get owners for team $($Team.DisplayName)" -Level "DEBUG" -Context $Context
        }
        
        try {
            $members = @(Get-TeamUser -GroupId $Team.GroupId -Role Member -ErrorAction SilentlyContinue)
        } catch {
            Write-MandALog "Could not get members for team $($Team.DisplayName)" -Level "DEBUG" -Context $Context
        }
        
        try {
            $guests = @(Get-TeamUser -GroupId $Team.GroupId -Role Guest -ErrorAction SilentlyContinue)
        } catch {
            Write-MandALog "Could not get guests for team $($Team.DisplayName)" -Level "DEBUG" -Context $Context
        }
        
        return [PSCustomObject]@{
            GroupId = $Team.GroupId
            DisplayName = $Team.DisplayName
            Description = $Team.Description
            Visibility = $Team.Visibility
            Archived = $Team.Archived
            MailNickName = $Team.MailNickName
            Classification = $Team.Classification
            CreatedDateTime = if ($teamDetails.CreatedDateTime) { $teamDetails.CreatedDateTime } else { $null }
            OwnerCount = $owners.Count
            MemberCount = $members.Count
            GuestCount = $guests.Count
            TotalMemberCount = $owners.Count + $members.Count + $guests.Count
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
            HasGuests = $guests.Count -gt 0
        }
    }
    catch {
        Write-MandALog "Error converting Teams object: $_" -Level "WARN" -Context $Context
        return $null
    }
}

function Invoke-TeamsDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    # Initialize result object
    $result = [DiscoveryResult]::new('Teams')
    
    # Set up error handling preferences
    $originalErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Stop'
    
    try {
        # Create minimal context if not provided
        if (-not $Context) {
            $Context = @{
                ErrorCollector = [PSCustomObject]@{
                    AddError = { param($s,$m,$e) Write-Warning "Error in $s`: $m" }
                    AddWarning = { param($s,$m) Write-Warning "Warning in $s`: $m" }
                }
                Paths = @{
                    RawDataOutput = Join-Path $Configuration.environment.outputPath "Raw"
                }
            }
        }
        
        Write-MandALog "--- Starting Teams Discovery Phase (v2.0.0) ---" -Level "HEADER" -Context $Context
        
        # Validate prerequisites
        Test-TeamsDiscoveryPrerequisites -Configuration $Configuration -Result $result -Context $Context
        
        if (-not $result.Success) {
            Write-MandALog "Prerequisites check failed, aborting Teams discovery" -Level "ERROR" -Context $Context
            return $result
        }
        
        # Main discovery logic with nested error handling
        $teamsData = @{
            Teams = @()
            TeamChannels = @()
            TeamMembers = @()
            TeamApps = @()
            GuestUsers = @()
            TeamsPolicies = @()
            TeamsPhone = @()
        }
        
        # Discover Teams with specific error handling
        try {
            Write-MandALog "Discovering Microsoft Teams..." -Level "INFO" -Context $Context
            $teamsData.Teams = Get-TeamsWithErrorHandling -Configuration $Configuration -Context $Context
            $result.Metadata['TeamCount'] = $teamsData.Teams.Count
            Write-MandALog "Successfully discovered $($teamsData.Teams.Count) Microsoft Teams" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover Microsoft Teams",
                $_.Exception,
                @{
                    Operation = 'Get-Team'
                    TeamsModule = 'MicrosoftTeams'
                }
            )
            Write-MandALog "Error discovering Microsoft Teams: $($_.Exception.Message)" -Level "ERROR" -Context $Context
            # Continue with other discoveries even if teams fail
        }
        
        # Discover Team Channels with specific error handling
        if ($teamsData.Teams.Count -gt 0) {
            try {
                Write-MandALog "Discovering Team channels..." -Level "INFO" -Context $Context
                $teamsData.TeamChannels = Get-TeamChannelsData -OutputPath $Context.Paths.RawDataOutput -Configuration $Configuration -Teams $teamsData.Teams
                $result.Metadata['TeamChannelCount'] = $teamsData.TeamChannels.Count
                Write-MandALog "Successfully discovered $($teamsData.TeamChannels.Count) Team channels" -Level "SUCCESS" -Context $Context
            }
            catch {
                $result.AddError(
                    "Failed to discover Team channels",
                    $_.Exception,
                    @{
                        Operation = 'Get-TeamChannel'
                        TeamCount = $teamsData.Teams.Count
                    }
                )
                Write-MandALog "Error discovering Team channels: $($_.Exception.Message)" -Level "ERROR" -Context $Context
            }
            
            # Discover Team Members with specific error handling
            try {
                Write-MandALog "Discovering Team members..." -Level "INFO" -Context $Context
                $teamsData.TeamMembers = Get-TeamMembersData -OutputPath $Context.Paths.RawDataOutput -Configuration $Configuration -Teams $teamsData.Teams
                $result.Metadata['TeamMemberCount'] = $teamsData.TeamMembers.Count
                Write-MandALog "Successfully discovered $($teamsData.TeamMembers.Count) Team members" -Level "SUCCESS" -Context $Context
            }
            catch {
                $result.AddError(
                    "Failed to discover Team members",
                    $_.Exception,
                    @{
                        Operation = 'Get-TeamUser'
                        TeamCount = $teamsData.Teams.Count
                    }
                )
                Write-MandALog "Error discovering Team members: $($_.Exception.Message)" -Level "ERROR" -Context $Context
            }
            
            # Discover Team Apps with specific error handling
            try {
                Write-MandALog "Discovering Team apps..." -Level "INFO" -Context $Context
                $teamsData.TeamApps = Get-TeamAppsData -OutputPath $Context.Paths.RawDataOutput -Configuration $Configuration -Teams $teamsData.Teams
                $result.Metadata['TeamAppCount'] = $teamsData.TeamApps.Count
                Write-MandALog "Successfully discovered $($teamsData.TeamApps.Count) Team apps" -Level "SUCCESS" -Context $Context
            }
            catch {
                $result.AddError(
                    "Failed to discover Team apps",
                    $_.Exception,
                    @{
                        Operation = 'Get-TeamsApp'
                        TeamCount = $teamsData.Teams.Count
                    }
                )
                Write-MandALog "Error discovering Team apps: $($_.Exception.Message)" -Level "ERROR" -Context $Context
            }
        }
        
        # Discover Guest Users with specific error handling
        try {
            Write-MandALog "Discovering guest users in Teams..." -Level "INFO" -Context $Context
            $teamsData.GuestUsers = Get-TeamsGuestUsersData -OutputPath $Context.Paths.RawDataOutput -Configuration $Configuration
            $result.Metadata['GuestUserCount'] = $teamsData.GuestUsers.Count
            Write-MandALog "Successfully discovered $($teamsData.GuestUsers.Count) guest users" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover Teams guest users",
                $_.Exception,
                @{
                    Operation = 'Get-MgUser'
                    Filter = "userType eq 'Guest'"
                }
            )
            Write-MandALog "Error discovering Teams guest users: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Discover Teams Policies with specific error handling
        try {
            Write-MandALog "Discovering Teams policies..." -Level "INFO" -Context $Context
            $teamsData.TeamsPolicies = Get-TeamsPoliciesData -OutputPath $Context.Paths.RawDataOutput -Configuration $Configuration
            $result.Metadata['TeamsPolicyCount'] = $teamsData.TeamsPolicies.Count
            Write-MandALog "Successfully discovered $($teamsData.TeamsPolicies.Count) Teams policies" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover Teams policies",
                $_.Exception,
                @{
                    Operation = 'Get-CsTeamsPolicy'
                }
            )
            Write-MandALog "Error discovering Teams policies: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Discover Teams Phone with specific error handling
        try {
            Write-MandALog "Discovering Teams phone configurations..." -Level "INFO" -Context $Context
            $teamsData.TeamsPhone = Get-TeamsPhoneData -OutputPath $Context.Paths.RawDataOutput -Configuration $Configuration
            $result.Metadata['TeamsPhoneCount'] = $teamsData.TeamsPhone.Count
            Write-MandALog "Successfully discovered Teams phone configurations" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover Teams phone configurations",
                $_.Exception,
                @{
                    Operation = 'Get-CsPhoneNumberAssignment'
                }
            )
            Write-MandALog "Error discovering Teams phone configurations: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Set the data even if partially successful
        $result.Data = $teamsData
        
        # Determine overall success based on critical data
        if ($teamsData.Teams.Count -eq 0) {
            $result.Success = $false
            $result.AddError("No Microsoft Teams retrieved")
            Write-MandALog "Teams Discovery failed - no teams retrieved" -Level "ERROR" -Context $Context
        } else {
            Write-MandALog "--- Teams Discovery Phase Completed Successfully ---" -Level "SUCCESS" -Context $Context
        }
        
    }
    catch {
        # Catch-all for unexpected errors
        $result.AddError(
            "Unexpected error in Teams discovery",
            $_.Exception,
            @{
                ErrorPoint = 'Main Discovery Block'
                LastOperation = $MyInvocation.MyCommand.Name
            }
        )
        Write-MandALog "Unexpected error in Teams Discovery: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    finally {
        # Always execute cleanup
        $ErrorActionPreference = $originalErrorActionPreference
        $result.Complete()
        
        # Log summary
        Write-MandALog "Teams Discovery completed. Success: $($result.Success), Errors: $($result.Errors.Count), Warnings: $($result.Warnings.Count)" -Level "INFO" -Context $Context
        
        # Clean up connections if needed
        try {
            # Disconnect from Teams if needed
            if (Get-Command Disconnect-MicrosoftTeams -ErrorAction SilentlyContinue) {
                Disconnect-MicrosoftTeams -ErrorAction SilentlyContinue
            }
        }
        catch {
            Write-MandALog "Cleanup warning: $_" -Level "WARN" -Context $Context
        }
    }
    
    return $result
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
