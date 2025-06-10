# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

#================================================================================
# M&A Discovery Module: Teams
# Description: Discovers Microsoft Teams, channels, members, apps, and policies using Microsoft Graph API.
#================================================================================

function Get-AuthInfoFromConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    # Debug: Log what we received
    Write-TeamsLog -Message "AuthCheck: Received config keys: $($Configuration.Keys -join ', ')" -Level "DEBUG" -Context $null

    # Check all possible locations for auth info
    if ($Configuration._AuthContext) { 
        Write-TeamsLog -Message "Found auth in _AuthContext" -Level "DEBUG" -Context $null
        return $Configuration._AuthContext 
    }
    if ($Configuration._Credentials) { 
        Write-TeamsLog -Message "Found auth in _Credentials" -Level "DEBUG" -Context $null
        return $Configuration._Credentials 
    }
    if ($Configuration.authentication) {
        if ($Configuration.authentication._Credentials) { 
            Write-TeamsLog -Message "Found auth in authentication._Credentials" -Level "DEBUG" -Context $null
            return $Configuration.authentication._Credentials 
        }
        if ($Configuration.authentication.ClientId -and 
            $Configuration.authentication.ClientSecret -and 
            $Configuration.authentication.TenantId) {
            Write-TeamsLog -Message "Found auth in authentication section" -Level "DEBUG" -Context $null
            return @{
                ClientId     = $Configuration.authentication.ClientId
                ClientSecret = $Configuration.authentication.ClientSecret
                TenantId     = $Configuration.authentication.TenantId
            }
        }
    }
    if ($Configuration.ClientId -and $Configuration.ClientSecret -and $Configuration.TenantId) {
        Write-TeamsLog -Message "Found auth at root level" -Level "DEBUG" -Context $null
        return @{
            ClientId     = $Configuration.ClientId
            ClientSecret = $Configuration.ClientSecret
            TenantId     = $Configuration.TenantId
        }
    }
    
    Write-TeamsLog -Message "No auth found in any location" -Level "ERROR" -Context $null
    return $null
}

function Write-TeamsLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message "[Teams] $Message" -Level $Level -Component "TeamsDiscovery" -Context $Context
    } else {
        $color = switch ($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "SUCCESS" { "Green" }
            "DEBUG" { "Gray" }
            "HEADER" { "Cyan" }
            default { "White" }
        }
        Write-Host "$(Get-Date -Format 'HH:mm:ss') [Teams] [$Level] $Message" -ForegroundColor $color
    }
}

# --- Main Discovery Function ---

function Invoke-TeamsDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )

    Write-TeamsLog -Level "HEADER" -Message "Starting Teams Discovery (Graph API)" -Context $Context
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

        # 3. AUTHENTICATE & CONNECT TO GRAPH
        Write-TeamsLog -Level "INFO" -Message "Extracting authentication information..." -Context $Context
        Write-TeamsLog -Level "DEBUG" -Message "Configuration keys: $($Configuration.Keys -join ', ')" -Context $Context
        
        $authInfo = Get-AuthInfoFromConfiguration -Configuration $Configuration
        
        if (-not $authInfo) {
            Write-TeamsLog -Level "ERROR" -Message "FATAL: No authentication found. Keys checked: _AuthContext, _Credentials, authentication.*, root level" -Context $Context
            $result.AddError("Authentication information could not be found in the provided configuration.", $null, $null)
            return $result
        }
        
        Write-TeamsLog -Level "DEBUG" -Message "Auth info found. ClientId: $($authInfo.ClientId.Substring(0,8))..." -Context $Context

        # Connect to Microsoft Graph
        try {
            Write-TeamsLog -Level "INFO" -Message "Connecting to Microsoft Graph..." -Context $Context
            $secureSecret = ConvertTo-SecureString $authInfo.ClientSecret -AsPlainText -Force
            Connect-MgGraph -ClientId $authInfo.ClientId `
                            -TenantId $authInfo.TenantId `
                            -ClientSecretCredential $secureSecret `
                            -NoWelcome -ErrorAction Stop
            
            # Test connection
            $context = Get-MgContext
            Write-TeamsLog -Level "SUCCESS" -Message "Connected to Microsoft Graph (Tenant: $($context.TenantId))" -Context $Context
        } catch {
            $result.AddError("Failed to connect to Microsoft Graph: $($_.Exception.Message)", $_.Exception, @{
                Operation = "Connect-MgGraph"
                ClientId = $authInfo.ClientId.Substring(0,8) + "..."
            })
            return $result
        }

        # 4. DISCOVER TEAMS
        Write-TeamsLog -Level "HEADER" -Message "Discovering Teams data" -Context $Context
        
        $allTeams = [System.Collections.ArrayList]::new()
        $allChannels = [System.Collections.ArrayList]::new()
        $allMembers = [System.Collections.ArrayList]::new()
        $allApps = [System.Collections.ArrayList]::new()
        $allGuestUsers = [System.Collections.ArrayList]::new()
        
        # Discover Teams
        try {
            Write-TeamsLog -Level "INFO" -Message "Querying Teams via Graph API..." -Context $Context
            
            # Get all groups with Teams provisioned
            $teamsGroups = Get-MgGroup -Filter "resourceProvisioningOptions/Any(x:x eq 'Team')" -All -Property Id,DisplayName,Description,Visibility,CreatedDateTime,Mail,MailNickname,Classification -ErrorAction Stop
            
            Write-TeamsLog -Level "SUCCESS" -Message "Found $($teamsGroups.Count) Teams" -Context $Context
            
            $processedCount = 0
            foreach ($teamGroup in $teamsGroups) {
                $processedCount++
                
                if ($processedCount % 10 -eq 0) {
                    Write-Progress -Activity "Processing Teams" -Status "$processedCount of $($teamsGroups.Count)" -PercentComplete (($processedCount / $teamsGroups.Count) * 100)
                    Write-TeamsLog -Level "DEBUG" -Message "Processed $processedCount/$($teamsGroups.Count) teams" -Context $Context
                }
                
                try {
                    # Get team-specific details
                    $teamDetails = $null
                    try {
                        $teamDetails = Get-MgTeam -TeamId $teamGroup.Id -ErrorAction Stop
                    } catch {
                        Write-TeamsLog -Level "DEBUG" -Message "Could not get team details for $($teamGroup.DisplayName): $_" -Context $Context
                    }
                    
                    # Get member counts
                    $owners = @(Get-MgGroupOwner -GroupId $teamGroup.Id -All -ErrorAction SilentlyContinue)
                    $members = @(Get-MgGroupMember -GroupId $teamGroup.Id -All -ErrorAction SilentlyContinue)
                    $guestCount = @($members | Where-Object { $_.AdditionalProperties.userPrincipalName -like "*#EXT#*" }).Count
                    
                    $teamObj = [PSCustomObject]@{
                        TeamId = $teamGroup.Id
                        DisplayName = $teamGroup.DisplayName
                        Description = $teamGroup.Description
                        Visibility = $teamGroup.Visibility
                        Mail = $teamGroup.Mail
                        MailNickname = $teamGroup.MailNickname
                        Classification = $teamGroup.Classification
                        CreatedDateTime = $teamGroup.CreatedDateTime
                        IsArchived = if ($teamDetails) { $teamDetails.IsArchived } else { $false }
                        OwnerCount = $owners.Count
                        MemberCount = $members.Count - $owners.Count
                        GuestCount = $guestCount
                        TotalMemberCount = $members.Count
                        WebUrl = if ($teamDetails) { $teamDetails.WebUrl } else { $null }
                        InternalId = if ($teamDetails) { $teamDetails.InternalId } else { $null }
                        # Team settings from teamDetails
                        AllowGuestCreateChannels = if ($teamDetails -and $teamDetails.GuestSettings) { $teamDetails.GuestSettings.AllowCreateUpdateChannels } else { $null }
                        AllowGuestDeleteChannels = if ($teamDetails -and $teamDetails.GuestSettings) { $teamDetails.GuestSettings.AllowDeleteChannels } else { $null }
                        AllowMemberCreateChannels = if ($teamDetails -and $teamDetails.MemberSettings) { $teamDetails.MemberSettings.AllowCreateUpdateChannels } else { $null }
                        AllowMemberDeleteChannels = if ($teamDetails -and $teamDetails.MemberSettings) { $teamDetails.MemberSettings.AllowDeleteChannels } else { $null }
                        AllowUserEditMessages = if ($teamDetails -and $teamDetails.MessagingSettings) { $teamDetails.MessagingSettings.AllowUserEditMessages } else { $null }
                        AllowUserDeleteMessages = if ($teamDetails -and $teamDetails.MessagingSettings) { $teamDetails.MessagingSettings.AllowUserDeleteMessages } else { $null }
                    }
                    
                    $null = $allTeams.Add($teamObj)
                    
                    # Get channels for this team
                    try {
                        $channels = Get-MgTeamChannel -TeamId $teamGroup.Id -All -ErrorAction Stop
                        foreach ($channel in $channels) {
                            $channelObj = [PSCustomObject]@{
                                TeamId = $teamGroup.Id
                                TeamDisplayName = $teamGroup.DisplayName
                                ChannelId = $channel.Id
                                ChannelDisplayName = $channel.DisplayName
                                Description = $channel.Description
                                Email = $channel.Email
                                WebUrl = $channel.WebUrl
                                CreatedDateTime = $channel.CreatedDateTime
                                MembershipType = $channel.MembershipType
                                IsFavoriteByDefault = $channel.IsFavoriteByDefault
                            }
                            $null = $allChannels.Add($channelObj)
                        }
                    } catch {
                        Write-TeamsLog -Level "DEBUG" -Message "Could not get channels for team $($teamGroup.DisplayName): $_" -Context $Context
                    }
                    
                    # Get members for this team
                    foreach ($member in $members) {
                        $isOwner = $member.Id -in $owners.Id
                        $memberDetails = $null
                        try {
                            $memberDetails = Get-MgUser -UserId $member.Id -Property DisplayName,UserPrincipalName,Mail,UserType -ErrorAction SilentlyContinue
                        } catch {}
                        
                        $memberObj = [PSCustomObject]@{
                            TeamId = $teamGroup.Id
                            TeamDisplayName = $teamGroup.DisplayName
                            UserId = $member.Id
                            UserDisplayName = if ($memberDetails) { $memberDetails.DisplayName } else { "Unknown" }
                            UserEmail = if ($memberDetails) { $memberDetails.Mail } else { $null }
                            UserPrincipalName = if ($memberDetails) { $memberDetails.UserPrincipalName } else { $null }
                            Role = if ($isOwner) { "Owner" } else { "Member" }
                            UserType = if ($memberDetails) { $memberDetails.UserType } else { "Unknown" }
                            IsGuest = if ($memberDetails) { $memberDetails.UserType -eq "Guest" } else { $false }
                        }
                        $null = $allMembers.Add($memberObj)
                    }
                    
                    # Get installed apps (if possible)
                    try {
                        $installedApps = Get-MgTeamInstalledApp -TeamId $teamGroup.Id -All -ExpandProperty TeamsAppDefinition -ErrorAction SilentlyContinue
                        foreach ($app in $installedApps) {
                            $appObj = [PSCustomObject]@{
                                TeamId = $teamGroup.Id
                                TeamDisplayName = $teamGroup.DisplayName
                                AppId = $app.Id
                                TeamsAppId = $app.TeamsApp.Id
                                AppDisplayName = if ($app.TeamsAppDefinition) { $app.TeamsAppDefinition.DisplayName } else { "Unknown" }
                                AppVersion = if ($app.TeamsAppDefinition) { $app.TeamsAppDefinition.Version } else { $null }
                                DistributionMethod = if ($app.TeamsApp) { $app.TeamsApp.DistributionMethod } else { $null }
                            }
                            $null = $allApps.Add($appObj)
                        }
                    } catch {
                        # Apps might require additional permissions
                        Write-TeamsLog -Level "DEBUG" -Message "Could not get apps for team $($teamGroup.DisplayName): $_" -Context $Context
                    }
                    
                } catch {
                    Write-TeamsLog -Level "WARN" -Message "Error processing team $($teamGroup.DisplayName): $_" -Context $Context
                    $result.AddWarning("Failed to fully process team: $($teamGroup.DisplayName)", @{TeamId = $teamGroup.Id; Error = $_.Exception.Message})
                }
            }
            
            Write-Progress -Activity "Processing Teams" -Completed
            
        } catch {
            $result.AddError("Failed to discover Teams: $($_.Exception.Message)", $_.Exception, @{Operation = "Get-MgGroup"})
        }
        
        # Discover Guest Users
        try {
            Write-TeamsLog -Level "INFO" -Message "Discovering guest users..." -Context $Context
            $guestUsers = Get-MgUser -Filter "userType eq 'Guest'" -All -Property Id,DisplayName,Mail,UserPrincipalName,CreatedDateTime,ExternalUserState,CompanyName -ErrorAction Stop
            
            foreach ($guest in $guestUsers) {
                # Find which teams they're in
                $guestTeams = @()
                try {
                    $guestGroups = Get-MgUserMemberOf -UserId $guest.Id -All -ErrorAction SilentlyContinue
                    $guestTeams = $allTeams | Where-Object { $_.TeamId -in $guestGroups.Id }
                } catch {}
                
                $guestObj = [PSCustomObject]@{
                    GuestUserId = $guest.Id
                    DisplayName = $guest.DisplayName
                    Mail = $guest.Mail
                    UserPrincipalName = $guest.UserPrincipalName
                    CreatedDateTime = $guest.CreatedDateTime
                    ExternalUserState = $guest.ExternalUserState
                    CompanyName = $guest.CompanyName
                    TeamCount = $guestTeams.Count
                    TeamNames = ($guestTeams.DisplayName -join ";")
                }
                $null = $allGuestUsers.Add($guestObj)
            }
            
            Write-TeamsLog -Level "SUCCESS" -Message "Found $($allGuestUsers.Count) guest users" -Context $Context
        } catch {
            Write-TeamsLog -Level "WARN" -Message "Could not discover guest users: $_" -Context $Context
            $result.AddWarning("Failed to discover guest users", @{Error = $_.Exception.Message})
        }

        # 5. EXPORT DATA TO CSV
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $exportedFiles = 0
        
        # Export Teams
        if ($allTeams.Count -gt 0) {
            Write-TeamsLog -Level "INFO" -Message "Exporting $($allTeams.Count) teams..." -Context $Context
            $allTeams | ForEach-Object {
                $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Teams" -Force
            }
            $teamsFile = Join-Path $outputPath "TeamsTeams.csv"
            $allTeams | Export-Csv -Path $teamsFile -NoTypeInformation -Encoding UTF8
            $exportedFiles++
            Write-TeamsLog -Level "SUCCESS" -Message "Exported teams to TeamsTeams.csv" -Context $Context
        }
        
        # Export Channels
        if ($allChannels.Count -gt 0) {
            Write-TeamsLog -Level "INFO" -Message "Exporting $($allChannels.Count) channels..." -Context $Context
            $allChannels | ForEach-Object {
                $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Teams" -Force
            }
            $channelsFile = Join-Path $outputPath "TeamsChannels.csv"
            $allChannels | Export-Csv -Path $channelsFile -NoTypeInformation -Encoding UTF8
            $exportedFiles++
            Write-TeamsLog -Level "SUCCESS" -Message "Exported channels to TeamsChannels.csv" -Context $Context
        }
        
        # Export Members (additional file not in orchestrator mapping but useful)
        if ($allMembers.Count -gt 0) {
            Write-TeamsLog -Level "INFO" -Message "Exporting $($allMembers.Count) team members..." -Context $Context
            $allMembers | ForEach-Object {
                $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Teams" -Force
            }
            $membersFile = Join-Path $outputPath "TeamsMembers.csv"
            $allMembers | Export-Csv -Path $membersFile -NoTypeInformation -Encoding UTF8
            Write-TeamsLog -Level "SUCCESS" -Message "Exported members to TeamsMembers.csv" -Context $Context
        }
        
        # Export Apps
        if ($allApps.Count -gt 0) {
            Write-TeamsLog -Level "INFO" -Message "Exporting $($allApps.Count) team apps..." -Context $Context
            $allApps | ForEach-Object {
                $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Teams" -Force
            }
            $appsFile = Join-Path $outputPath "TeamsApps.csv"
            $allApps | Export-Csv -Path $appsFile -NoTypeInformation -Encoding UTF8
            Write-TeamsLog -Level "SUCCESS" -Message "Exported apps to TeamsApps.csv" -Context $Context
        }
        
        # Export Guest Users
        if ($allGuestUsers.Count -gt 0) {
            Write-TeamsLog -Level "INFO" -Message "Exporting $($allGuestUsers.Count) guest users..." -Context $Context
            $allGuestUsers | ForEach-Object {
                $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Teams" -Force
            }
            $guestsFile = Join-Path $outputPath "TeamsGuestUsers.csv"
            $allGuestUsers | Export-Csv -Path $guestsFile -NoTypeInformation -Encoding UTF8
            Write-TeamsLog -Level "SUCCESS" -Message "Exported guest users to TeamsGuestUsers.csv" -Context $Context
        }

        # 6. FINALIZE METADATA
        # CRITICAL FIX: Ensure RecordCount property exists and is set correctly
        $totalRecords = $allTeams.Count + $allChannels.Count + $allMembers.Count + $allApps.Count + $allGuestUsers.Count
        if ($result -is [hashtable]) {
            # For hashtable, ensure RecordCount key exists and is set
            $result.RecordCount = $totalRecords
            $result['RecordCount'] = $totalRecords  # Ensure both access methods work
        } else {
            # For DiscoveryResult object, set the property directly
            $result.RecordCount = $totalRecords
        }
        
        $result.Metadata["TotalRecords"] = $totalRecords
        $result.Metadata["TeamsCount"] = $allTeams.Count
        $result.Metadata["ChannelsCount"] = $allChannels.Count
        $result.Metadata["MembersCount"] = $allMembers.Count
        $result.Metadata["AppsCount"] = $allApps.Count
        $result.Metadata["GuestUsersCount"] = $allGuestUsers.Count
        $result.Metadata["ExportedFiles"] = $exportedFiles
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds

        if ($allTeams.Count -eq 0) {
            $result.AddWarning("No Teams found in the tenant", @{})
        }

    } catch {
        # Top-level error handler
        Write-TeamsLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        Write-TeamsLog -Level "DEBUG" -Message "Stack trace: $($_.ScriptStackTrace)" -Context $Context
        $result.AddError("A critical error occurred during Teams discovery: $($_.Exception.Message)", $_.Exception, @{
            Line = $_.InvocationInfo.ScriptLineNumber
            Statement = $_.InvocationInfo.Line
        })
    } finally {
        # 7. CLEANUP & COMPLETE
        Write-TeamsLog -Level "INFO" -Message "Cleaning up..." -Context $Context
        
        # Disconnect from Graph
        try {
            Disconnect-MgGraph -ErrorAction SilentlyContinue
            Write-TeamsLog -Level "DEBUG" -Message "Disconnected from Microsoft Graph" -Context $Context
        } catch {}
        
        $stopwatch.Stop()
        $result.Complete()
        Write-TeamsLog -Level "HEADER" -Message "Teams Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
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