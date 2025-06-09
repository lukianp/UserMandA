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


# DiscoveryResult class definition
# DiscoveryResult class is defined globally by the Orchestrator using Add-Type
# No local definition needed - the global C# class will be used

<#
.SYNOPSIS

# Module-scope context variable
$script:ModuleContext = $null

# Lazy initialization function
function Get-ModuleContext {
    if ($null -eq $script:ModuleContext) {
        if ($null -ne $global:MandA) {
            $script:ModuleContext = $global:MandA
        } else {
            throw "Module context not available"
        }
    }
    return $script:ModuleContext
}


function Invoke-SafeModuleExecution {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,
        
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    $result = @{
        Success = $false
        Data = $null
        Error = $null
        Duration = $null
    }
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        # Validate global context
        if (-not $global:MandA -or -not $global:MandA.Initialized) {
            throw "Global M&A context not initialized"
        }
        
        # Execute the module function
        $result.Data = & $ScriptBlock
        $result.Success = $true
        
    } catch {
        $result.Error = @{
            Message = $_.Exception.Message
            Type = $_.Exception.GetType().FullName
            StackTrace = $_.ScriptStackTrace
            InnerException = if ($_.Exception.InnerException) { $_.Exception.InnerException.Message } else { $null }
        }
        
        # Log to both file and console
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "[$ModuleName] Error: $($_.Exception.Message)" -Level "ERROR" -Component $ModuleName -Context $Context
        } else {
            Write-Host "[$ModuleName] Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Don't rethrow - let caller handle based on result
    } finally {
        $stopwatch.Stop()
        $result.Duration = $stopwatch.Elapsed
    }
    
    return $result
}


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
        # Check if Microsoft Graph PowerShell modules are available
        $requiredModules = @('Microsoft.Graph.Authentication', 'Microsoft.Graph.Teams')
        foreach ($module in $requiredModules) {
            if (-not (Get-Module -Name $module -ListAvailable)) {
                $Result.AddError("$module PowerShell module is not available", $null, @{
                    Prerequisite = "$module Module"
                    Resolution = "Install $module PowerShell module using 'Install-Module $module'"
                })
                return
            }
        }
        
        # Import modules if not already loaded
        foreach ($module in $requiredModules) {
            if (-not (Get-Module -Name $module)) {
                Import-Module $module -ErrorAction Stop
                Write-MandALog "$module module imported successfully" -Level "DEBUG" -Context $Context
            }
        }
        
        # Test Microsoft Graph connectivity
        try {
            $mgContext = Get-MgContext -ErrorAction SilentlyContinue
            if (-not $mgContext) {
                $Result.AddError("Not connected to Microsoft Graph", $null, @{
                    Prerequisite = 'Microsoft Graph Authentication'
                    Resolution = 'Connect to Microsoft Graph using Connect-MgGraph'
                })
                return
            }
            
            Write-MandALog "Successfully connected to Microsoft Graph. Context:" -Level "SUCCESS" -Context $Context
            if ($mgContext.Account) {
                $Result.Metadata['GraphContext'] = $mgContext.Account
                Write-MandALog "  Account: $($mgContext.Account)" -Level "INFO" -Context $Context
            }
            if ($mgContext.TenantId) {
                $Result.Metadata['TenantId'] = $mgContext.TenantId
                Write-MandALog "  Tenant: $($mgContext.TenantId)" -Level "INFO" -Context $Context
            }
        }
        catch {
            $Result.AddError("Failed to verify Microsoft Graph connection", $_.Exception, @{
                Prerequisite = 'Microsoft Graph Connectivity'
                Resolution = 'Verify Microsoft Graph connection and permissions'
            })
            return
        }
        
        # Test Teams access via Graph API
        try {
            $testTeams = Get-MgTeam -Top 1 -ErrorAction Stop
            Write-MandALog "Successfully verified Teams access via Graph API" -Level "SUCCESS" -Context $Context
        }
        catch {
            $Result.AddError("Failed to access Teams via Graph API", $_.Exception, @{
                Prerequisite = 'Teams Access'
                Resolution = 'Verify Microsoft Graph permissions (Team.ReadBasic.All, Group.Read.All)'
            })
            return
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
    
    # Validate parameters
    if (-not $Configuration) {
        throw "Configuration parameter is missing"
    }
    
    if (-not $Context) {
        throw "Context parameter is missing"
    }
    
    $teams = [System.Collections.ArrayList]::new()
    $retryCount = 0
    $maxRetries = 3
    
    # Check if we have cached teams data
    if ($global:TeamsCache.Teams -and $global:TeamsCache.LastUpdated -and
        ((Get-Date) - $global:TeamsCache.LastUpdated).TotalMinutes -lt 30) {
        Write-MandALog "Using cached Teams data (updated $($global:TeamsCache.LastUpdated))" -Level "INFO" -Context $Context
        return $global:TeamsCache.Teams
    }
    
    while ($retryCount -lt $maxRetries) {
        try {
            Write-MandALog "Retrieving all Teams via Graph API (attempt $($retryCount + 1)/$maxRetries)..." -Level "INFO" -Context $Context
            
            # Validate Graph API permissions first
            try {
                $mgContext = Get-MgContext -ErrorAction Stop
                if (-not $mgContext) {
                    throw "Not connected to Microsoft Graph"
                }
                
                # Check required permissions
                $requiredScopes = @('Team.ReadBasic.All', 'Group.Read.All', 'TeamMember.Read.All')
                $currentScopes = $mgContext.Scopes
                $missingScopes = @()
                
                foreach ($scope in $requiredScopes) {
                    if ($scope -notin $currentScopes) {
                        $missingScopes += $scope
                    }
                }
                
                if ($missingScopes.Count -gt 0) {
                    Write-MandALog "Missing required Graph API scopes: $($missingScopes -join ', ')" -Level "WARN" -Context $Context
                    Write-MandALog "Current scopes: $($currentScopes -join ', ')" -Level "DEBUG" -Context $Context
                }
                
            } catch {
                throw "Graph API validation failed: $($_.Exception.Message)"
            }
            
            # Use Graph API instead of legacy Teams cmdlets
            $allTeams = Get-MgTeam -All -ErrorAction Stop
            
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
            
            # Cache the results for efficiency
            $global:TeamsCache.Teams = $teams.ToArray()
            $global:TeamsCache.LastUpdated = Get-Date
            
            Write-MandALog "Teams data cached for future use" -Level "DEBUG" -Context $Context
            
            # Success - exit retry loop
            break
        }
        catch {
            $retryCount++
            if ($retryCount -ge $maxRetries) {
                $errorMsg = "Failed to retrieve Teams after $maxRetries attempts: $($_.Exception.Message)"
                Write-MandALog $errorMsg -Level "ERROR" -Context $Context
                
                # Check if this is a permissions issue
                if ($_.Exception.Message -like "*Forbidden*" -or $_.Exception.Message -like "*Unauthorized*") {
                    Write-MandALog "This appears to be a permissions issue. Ensure the following Graph API permissions are granted:" -Level "ERROR" -Context $Context
                    Write-MandALog "  - Team.ReadBasic.All" -Level "ERROR" -Context $Context
                    Write-MandALog "  - Group.Read.All" -Level "ERROR" -Context $Context
                    Write-MandALog "  - TeamMember.Read.All" -Level "ERROR" -Context $Context
                }
                
                throw $errorMsg
            }
            
            $waitTime = [Math]::Pow(2, $retryCount) * 2  # Exponential backoff
            Write-MandALog "Teams query failed (attempt $retryCount/$maxRetries): $($_.Exception.Message)" -Level "WARN" -Context $Context
            Write-MandALog "Waiting $waitTime seconds before retry..." -Level "INFO" -Context $Context
            Start-Sleep -Seconds $waitTime
        }
    }
    
    return $teams.ToArray()
}

function ConvertTo-TeamsObject {
    param($Team, $Context)
    
    try {
        # Get team details via Graph API
        $teamDetails = $null
        try {
            $teamDetails = Get-MgTeam -TeamId $Team.Id -ErrorAction SilentlyContinue
        } catch {
            Write-MandALog "Could not get detailed team info for $($Team.DisplayName)" -Level "DEBUG" -Context $Context
        }
        
        # Get group members via Graph API
        $owners = @()
        $members = @()
        $guests = @()
        
        try {
            $groupMembers = Get-MgGroupMember -GroupId $Team.Id -All -ErrorAction SilentlyContinue
            $groupOwners = Get-MgGroupOwner -GroupId $Team.Id -All -ErrorAction SilentlyContinue
            
            $owners = @($groupOwners)
            $allMembers = @($groupMembers)
            
            # Filter members vs guests (simplified approach)
            foreach ($member in $allMembers) {
                if ($member.Id -notin $owners.Id) {
                    # Try to determine if guest based on user principal name pattern
                    if ($member.AdditionalProperties.userPrincipalName -like "*#EXT#*") {
                        $guests += $member
                    } else {
                        $members += $member
                    }
                }
            }
        } catch {
            Write-MandALog "Could not get members for team $($Team.DisplayName)" -Level "DEBUG" -Context $Context
        }
        
        return [PSCustomObject]@{
            GroupId = $Team.Id
            DisplayName = $Team.DisplayName
            Description = $Team.Description
            Visibility = if ($Team.Visibility) { $Team.Visibility } else { "Unknown" }
            Archived = if ($teamDetails -and $teamDetails.IsArchived) { $teamDetails.IsArchived } else { $false }
            MailNickName = if ($Team.AdditionalProperties.mailNickname) { $Team.AdditionalProperties.mailNickname } else { $null }
            Classification = if ($Team.AdditionalProperties.classification) { $Team.AdditionalProperties.classification } else { $null }
            CreatedDateTime = if ($Team.CreatedDateTime) { $Team.CreatedDateTime } else { $null }
            OwnerCount = $owners.Count
            MemberCount = $members.Count
            GuestCount = $guests.Count
            TotalMemberCount = $owners.Count + $members.Count + $guests.Count
            # Team settings - use defaults if not available via Graph
            AllowCreateUpdateChannels = if ($teamDetails -and $teamDetails.MemberSettings) { $teamDetails.MemberSettings.AllowCreateUpdateChannels } else { $null }
            AllowDeleteChannels = if ($teamDetails -and $teamDetails.MemberSettings) { $teamDetails.MemberSettings.AllowDeleteChannels } else { $null }
            AllowAddRemoveApps = if ($teamDetails -and $teamDetails.MemberSettings) { $teamDetails.MemberSettings.AllowAddRemoveApps } else { $null }
            AllowCreateUpdateRemoveTabs = if ($teamDetails -and $teamDetails.MemberSettings) { $teamDetails.MemberSettings.AllowCreateUpdateRemoveTabs } else { $null }
            AllowCreateUpdateRemoveConnectors = if ($teamDetails -and $teamDetails.MemberSettings) { $teamDetails.MemberSettings.AllowCreateUpdateRemoveConnectors } else { $null }
            AllowUserEditMessages = if ($teamDetails -and $teamDetails.MessagingSettings) { $teamDetails.MessagingSettings.AllowUserEditMessages } else { $null }
            AllowUserDeleteMessages = if ($teamDetails -and $teamDetails.MessagingSettings) { $teamDetails.MessagingSettings.AllowUserDeleteMessages } else { $null }
            AllowOwnerDeleteMessages = if ($teamDetails -and $teamDetails.MessagingSettings) { $teamDetails.MessagingSettings.AllowOwnerDeleteMessages } else { $null }
            AllowTeamMentions = if ($teamDetails -and $teamDetails.MessagingSettings) { $teamDetails.MessagingSettings.AllowTeamMentions } else { $null }
            AllowChannelMentions = if ($teamDetails -and $teamDetails.MessagingSettings) { $teamDetails.MessagingSettings.AllowChannelMentions } else { $null }
            AllowGuestCreateUpdateChannels = if ($teamDetails -and $teamDetails.GuestSettings) { $teamDetails.GuestSettings.AllowCreateUpdateChannels } else { $null }
            AllowGuestDeleteChannels = if ($teamDetails -and $teamDetails.GuestSettings) { $teamDetails.GuestSettings.AllowDeleteChannels } else { $null }
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
    
    # Enhanced parameter validation
    if (-not $Configuration) {
        throw "Configuration parameter is null or missing"
    }
    
    if (-not $Context) {
        throw "Context parameter is null or missing"
    }
    
    # Validate critical Context.Paths properties
    if (-not $Context.Paths) {
        throw "Context.Paths is null or missing"
    }
    
    if (-not $Context.Paths.RawDataOutput) {
        throw "Context.Paths.RawDataOutput is null or missing"
    }
    
    # Initialize result object
    $result = [DiscoveryResult]::new('Teams')
    
    # Set up error handling preferences
    $originalErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Stop'
    
    # Cache Teams connection globally for efficiency
    if (-not $global:TeamsCache) {
        $global:TeamsCache = @{}
    }
    
    try {
        # Log parameter validation success
        Write-MandALog "Parameter validation successful for Teams discovery" -Level "INFO" -Context $Context
        Write-MandALog "Configuration type: $($Configuration.GetType().Name)" -Level "DEBUG" -Context $Context
        Write-MandALog "Context type: $($Context.GetType().Name)" -Level "DEBUG" -Context $Context
        Write-MandALog "RawDataOutput: $($Context.Paths.RawDataOutput)" -Level "DEBUG" -Context $Context
        
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
                $teamsData.TeamChannels = Get-TeamChannelsData -OutputPath (Get-ModuleContext).Paths.RawDataOutput -Configuration $Configuration -Teams $teamsData.Teams
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
                $teamsData.TeamMembers = Get-TeamMembersData -OutputPath (Get-ModuleContext).Paths.RawDataOutput -Configuration $Configuration -Teams $teamsData.Teams
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
                $teamsData.TeamApps = Get-TeamAppsData -OutputPath (Get-ModuleContext).Paths.RawDataOutput -Configuration $Configuration -Teams $teamsData.Teams
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
            $teamsData.GuestUsers = Get-TeamsGuestUsersData -OutputPath (Get-ModuleContext).Paths.RawDataOutput -Configuration $Configuration
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
            $teamsData.TeamsPolicies = Get-TeamsPoliciesData -OutputPath (Get-ModuleContext).Paths.RawDataOutput -Configuration $Configuration
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
            $teamsData.TeamsPhone = Get-TeamsPhoneData -OutputPath (Get-ModuleContext).Paths.RawDataOutput -Configuration $Configuration
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
            # Graph API connections are managed globally, no specific Teams disconnect needed
            Write-MandALog "Teams discovery cleanup completed" -Level "DEBUG" -Context $Context
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




