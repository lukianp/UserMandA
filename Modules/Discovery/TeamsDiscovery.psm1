# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Microsoft Teams Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers Microsoft Teams, channels, members, and configurations using Microsoft Graph API. This module provides 
    comprehensive Teams discovery including team structures, channel configurations, member permissions, and 
    collaboration settings essential for M&A Teams environment assessment and migration planning.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, Microsoft.Graph modules, DiscoveryBase module
#>


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

# --- Multi-Strategy Authentication Function ---

function Connect-MgGraphWithMultipleStrategies {
    <#
    .SYNOPSIS
        Connects to Microsoft Graph using multiple authentication strategies with automatic fallback
    .DESCRIPTION
        Attempts to authenticate to Microsoft Graph using 4 different strategies in order:
        1. Client Secret Credential (preferred for automation)
        2. Certificate-Based Authentication (secure, headless)
        3. Device Code Flow (headless-friendly interactive)
        4. Interactive Browser (GUI required - last resort)
    .PARAMETER Configuration
        Configuration hashtable containing TenantId, ClientId, ClientSecret, and/or CertificateThumbprint
    .PARAMETER Context
        Context hashtable for logging
    .OUTPUTS
        Microsoft.Graph.PowerShell.Authentication.Models.GraphContext or $null if all strategies fail
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )

    Write-TeamsLog -Level "INFO" -Message "Attempting Microsoft Graph authentication with multiple strategies..." -Context $Context

    # Define Teams-specific scopes
    $teamsScopes = @(
        "Team.ReadBasic.All",
        "TeamSettings.Read.All",
        "TeamMember.Read.All",
        "Channel.ReadBasic.All",
        "ChannelSettings.Read.All",
        "Group.Read.All",
        "Directory.Read.All",
        "User.Read.All"
    )

    # Strategy 1: Client Secret Credential (preferred for automation)
    if ($Configuration.TenantId -and $Configuration.ClientId -and $Configuration.ClientSecret) {
        try {
            Write-TeamsLog -Level "INFO" -Message "Strategy 1: Attempting Client Secret authentication..." -Context $Context

            # Get access token using OAuth2 client credentials flow
            Write-TeamsLog -Level "DEBUG" -Message "Requesting access token from Microsoft Identity Platform..." -Context $Context
            $tokenBody = @{
                grant_type    = "client_credentials"
                client_id     = $Configuration.ClientId
                client_secret = $Configuration.ClientSecret
                scope         = "https://graph.microsoft.com/.default"
            }

            $tokenUri = "https://login.microsoftonline.com/$($Configuration.TenantId)/oauth2/v2.0/token"
            $tokenResponse = Invoke-RestMethod -Uri $tokenUri -Method POST -Body $tokenBody -ContentType "application/x-www-form-urlencoded" -ErrorAction Stop

            if ($tokenResponse.access_token) {
                Write-TeamsLog -Level "DEBUG" -Message "Access token acquired successfully" -Context $Context

                # Return a custom context object with the access token
                # This bypasses Connect-MgGraph entirely due to version compatibility issues
                $customContext = [PSCustomObject]@{
                    AccessToken = $tokenResponse.access_token
                    TenantId    = $Configuration.TenantId
                    ClientId    = $Configuration.ClientId
                    TokenType   = "Bearer"
                    ExpiresOn   = (Get-Date).AddSeconds($tokenResponse.expires_in)
                    Scopes      = @("https://graph.microsoft.com/.default")
                    IsCustom    = $true  # Flag to indicate this is our custom context
                }

                Write-TeamsLog -Level "SUCCESS" -Message "Strategy 1: Client Secret authentication successful (using direct token)" -Context $Context
                Write-TeamsLog -Level "DEBUG" -Message "Access token valid until: $($customContext.ExpiresOn)" -Context $Context
                return $customContext
            } else {
                Write-TeamsLog -Level "WARN" -Message "Strategy 1: No access token in response" -Context $Context
            }
        } catch {
            Write-TeamsLog -Level "WARN" -Message "Strategy 1: Client Secret auth failed: $($_.Exception.Message)" -Context $Context
            if ($_.Exception.Response) {
                try {
                    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                    $responseBody = $reader.ReadToEnd()
                    Write-TeamsLog -Level "DEBUG" -Message "Token endpoint error response: $responseBody" -Context $Context
                } catch {
                    # Ignore errors reading response
                }
            }
        }
    }

    # Strategy 2: Certificate-Based Authentication (secure, headless)
    if ($Configuration.TenantId -and $Configuration.ClientId -and $Configuration.CertificateThumbprint) {
        try {
            Write-TeamsLog -Level "INFO" -Message "Strategy 2: Attempting Certificate authentication..." -Context $Context

            Connect-MgGraph -ClientId $Configuration.ClientId -TenantId $Configuration.TenantId -CertificateThumbprint $Configuration.CertificateThumbprint -NoWelcome -ErrorAction Stop

            # Verify connection
            $context = Get-MgContext
            if ($context -and $context.TenantId) {
                Write-TeamsLog -Level "SUCCESS" -Message "Strategy 2: Certificate authentication successful" -Context $Context
                Write-TeamsLog -Level "DEBUG" -Message "Connected to tenant: $($context.TenantId)" -Context $Context
                return $context
            }
        } catch {
            Write-TeamsLog -Level "WARN" -Message "Strategy 2: Certificate auth failed: $($_.Exception.Message)" -Context $Context
        }
    }

    # Strategy 3: Device Code Flow (headless-friendly interactive)
    if ($Configuration.TenantId) {
        try {
            Write-TeamsLog -Level "INFO" -Message "Strategy 3: Attempting Device Code authentication..." -Context $Context

            Connect-MgGraph -TenantId $Configuration.TenantId -Scopes $teamsScopes -UseDeviceCode -NoWelcome -ErrorAction Stop

            # Verify connection
            $context = Get-MgContext
            if ($context -and $context.TenantId) {
                Write-TeamsLog -Level "SUCCESS" -Message "Strategy 3: Device Code authentication successful" -Context $Context
                Write-TeamsLog -Level "DEBUG" -Message "Connected to tenant: $($context.TenantId)" -Context $Context
                return $context
            }
        } catch {
            Write-TeamsLog -Level "WARN" -Message "Strategy 3: Device Code auth failed: $($_.Exception.Message)" -Context $Context
        }
    }

    # Strategy 4: Interactive Browser Authentication (GUI required - last resort)
    try {
        Write-TeamsLog -Level "INFO" -Message "Strategy 4: Attempting Interactive authentication..." -Context $Context

        if ($Configuration.TenantId) {
            Connect-MgGraph -TenantId $Configuration.TenantId -Scopes $teamsScopes -NoWelcome -ErrorAction Stop
        } else {
            Connect-MgGraph -Scopes $teamsScopes -NoWelcome -ErrorAction Stop
        }

        # Verify connection
        $context = Get-MgContext
        if ($context -and $context.TenantId) {
            Write-TeamsLog -Level "SUCCESS" -Message "Strategy 4: Interactive authentication successful" -Context $Context
            Write-TeamsLog -Level "DEBUG" -Message "Connected to tenant: $($context.TenantId)" -Context $Context
            return $context
        }
    } catch {
        Write-TeamsLog -Level "ERROR" -Message "Strategy 4: Interactive auth failed: $($_.Exception.Message)" -Context $Context
    }

    Write-TeamsLog -Level "ERROR" -Message "All Microsoft Graph authentication strategies exhausted" -Context $Context
    return $null
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
    # Ensure ClassDefinitions module is loaded
    try {
        if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
            Import-Module -Name "$PSScriptRoot\..\Core\ClassDefinitions.psm1" -Force -ErrorAction Stop
        }
        $result = [DiscoveryResult]::new('Teams')
    } catch {
        Write-TeamsLog -Level "ERROR" -Message "Failed to load DiscoveryResult class: $($_.Exception.Message)" -Context $Context
        throw "Critical error: Cannot load required DiscoveryResult class. Discovery cannot proceed."
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

        # 4. EXTRACT & VALIDATE CREDENTIALS
        Write-TeamsLog -Level "INFO" -Message "Extracting credentials from Configuration..." -Context $Context

        # Extract credentials from Configuration parameter
        $tenantId = $null
        $clientId = $null
        $clientSecret = $null

        if ($Configuration.TenantId) {
            $tenantId = $Configuration.TenantId
            Write-TeamsLog -Level "SUCCESS" -Message "TenantId found in Configuration: $tenantId" -Context $Context
        } else {
            Write-TeamsLog -Level "WARN" -Message "TenantId NOT found in Configuration" -Context $Context
        }

        if ($Configuration.ClientId) {
            $clientId = $Configuration.ClientId
            Write-TeamsLog -Level "SUCCESS" -Message "ClientId found in Configuration: $clientId" -Context $Context
        } else {
            Write-TeamsLog -Level "WARN" -Message "ClientId NOT found in Configuration" -Context $Context
        }

        if ($Configuration.ClientSecret) {
            $clientSecret = $Configuration.ClientSecret
            $maskedSecret = if ($clientSecret.Length -gt 8) {
                $clientSecret.Substring(0, 4) + "..." + $clientSecret.Substring($clientSecret.Length - 4)
            } else {
                "***"
            }
            Write-TeamsLog -Level "SUCCESS" -Message "ClientSecret found in Configuration: $maskedSecret" -Context $Context
        } else {
            Write-TeamsLog -Level "WARN" -Message "ClientSecret NOT found in Configuration" -Context $Context
        }

        # Validate all credentials are present
        if (-not $tenantId -or -not $clientId -or -not $clientSecret) {
            $missingCreds = @()
            if (-not $tenantId) { $missingCreds += "TenantId" }
            if (-not $clientId) { $missingCreds += "ClientId" }
            if (-not $clientSecret) { $missingCreds += "ClientSecret" }

            $errorMsg = "Missing required credentials in Configuration: $($missingCreds -join ', ')"
            Write-TeamsLog -Level "ERROR" -Message $errorMsg -Context $Context
            $result.AddError($errorMsg, $null, @{MissingCredentials=$missingCreds})
            return $result
        }

        Write-TeamsLog -Level "SUCCESS" -Message "All required credentials validated successfully" -Context $Context

        # Store credentials in metadata for reference
        $result.Metadata["TenantId"] = $tenantId
        $result.Metadata["ClientId"] = $clientId
        $result.Metadata["AuthenticationMethod"] = "ServicePrincipal"

        # 5. AUTHENTICATE & CONNECT
        Write-TeamsLog -Level "INFO" -Message "Authenticating to Microsoft Graph..." -Context $Context
        Write-TeamsLog -Level "DEBUG" -Message "Authentication details - TenantId: $tenantId, ClientId: $clientId" -Context $Context

        try {
            # Use multi-strategy authentication
            Write-TeamsLog -Level "INFO" -Message "Attempting multi-strategy authentication..." -Context $Context
            $graphContext = Connect-MgGraphWithMultipleStrategies -Configuration $Configuration -Context $Context

            if (-not $graphContext) {
                $errorMsg = "All Microsoft Graph authentication strategies failed"
                Write-TeamsLog -Level "ERROR" -Message $errorMsg -Context $Context
                $result.AddError($errorMsg, $null, @{AuthenticationStage="GraphConnection"})
                return $result
            }

            # Verify connection and log details
            Write-TeamsLog -Level "SUCCESS" -Message "Successfully authenticated to Microsoft Graph" -Context $Context
            if ($graphContext) {
                $tenantIdToLog = if ($graphContext.TenantId) { $graphContext.TenantId } else { "N/A" }
                $scopesToLog = if ($graphContext.Scopes) { $graphContext.Scopes -join ', ' } else { "N/A" }
                $authMethod = if ($graphContext.IsCustom) { "Direct Access Token" } else { "Connect-MgGraph" }

                Write-TeamsLog -Level "SUCCESS" -Message "Graph connection verified - TenantId: $tenantIdToLog, Scopes: $scopesToLog, Method: $authMethod" -Context $Context
                $result.Metadata["GraphTenantId"] = $tenantIdToLog
                $result.Metadata["GraphScopes"] = $scopesToLog
                $result.Metadata["AuthMethod"] = $authMethod
            } else {
                Write-TeamsLog -Level "WARN" -Message "Graph connection established but context is null" -Context $Context
            }

        } catch {
            $errorMsg = "Failed to authenticate with Microsoft Graph: $($_.Exception.Message)"
            Write-TeamsLog -Level "ERROR" -Message $errorMsg -Context $Context
            Write-TeamsLog -Level "ERROR" -Message "Authentication error details: $($_.Exception.GetType().FullName)" -Context $Context
            if ($_.Exception.InnerException) {
                Write-TeamsLog -Level "ERROR" -Message "Inner exception: $($_.Exception.InnerException.Message)" -Context $Context
            }
            $result.AddError($errorMsg, $_.Exception, @{AuthenticationStage="GraphConnection"})
            return $result
        }

        # 6. PERFORM DISCOVERY
        Write-TeamsLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Discover Teams
        $teams = @()
        try {
            Write-TeamsLog -Level "INFO" -Message "Discovering Microsoft Teams..." -Context $Context

            # Get all groups that are Teams-enabled
            $uri = "https://graph.microsoft.com/v1.0/groups?`$filter=resourceProvisioningOptions/Any(x:x eq 'Team')&`$select=id,displayName,description,visibility,createdDateTime,mailNickname,mail,isArchived&`$top=999"

            do {
                $response = Invoke-CustomMgGraphRequest -Uri $uri -Method GET -Headers @{'ConsistencyLevel'='eventual'} -GraphContext $graphContext -ErrorAction Stop
                
                foreach ($team in $response.value) {
                    # Get Teams-specific settings
                    $teamSettings = $null
                    try {
                        $teamUri = "https://graph.microsoft.com/v1.0/teams/$($team.id)"
                        $teamSettings = Invoke-CustomMgGraphRequest -Uri $teamUri -Method GET -GraphContext $graphContext -ErrorAction Stop
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
                $channelResponse = Invoke-CustomMgGraphRequest -Uri $channelUri -Method GET -GraphContext $graphContext -ErrorAction Stop
                
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
                            $tabResponse = Invoke-CustomMgGraphRequest -Uri $tabUri -Method GET -GraphContext $graphContext -ErrorAction Stop
                            
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
                $ownersResponse = Invoke-CustomMgGraphRequest -Uri $ownersUri -Method GET -GraphContext $graphContext -ErrorAction Stop
                
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
                    $membersResponse = Invoke-CustomMgGraphRequest -Uri $membersUri -Method GET -GraphContext $graphContext -ErrorAction Stop
                    
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
                        $appsResponse = Invoke-CustomMgGraphRequest -Uri $appsUri -Method GET -GraphContext $graphContext -ErrorAction Stop
                        
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
                    $orgAppsResponse = Invoke-CustomMgGraphRequest -Uri $orgAppsUri -Method GET -GraphContext $graphContext -ErrorAction Stop
                    
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

        # 7. PREPARE DATA GROUPS FOR ORCHESTRATOR EXPORT
        if ($allDiscoveredData.Count -gt 0) {
            Write-TeamsLog -Level "INFO" -Message "Preparing $($allDiscoveredData.Count) records for export" -Context $Context
            
            # Group by data type
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            $resultGroups = @()
            
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $data = $group.Group
                
                # Determine group name (launcher appends .csv)
                $name = switch ($dataType) {
                    'Team' { 'TeamsTeams' }
                    'Channel' { 'TeamsChannels' }
                    'ChannelTab' { 'TeamsChannelTabs' }
                    'TeamMember' { 'TeamsMembers' }
                    'TeamApp' { 'TeamsInstalledApps' }
                    'OrgWideTeamsApp' { 'TeamsOrgWideApps' }
                    default { "Teams_$dataType" }
                }
                
                if ($data -and $data.Count -gt 0) {
                    $resultGroups += [PSCustomObject]@{
                        Name = $name
                        Group = $data
                    }
                    Write-TeamsLog -Level "SUCCESS" -Message "Prepared $($data.Count) $dataType records as group '$name'" -Context $Context
                }
            }
            
            if ($resultGroups.Count -gt 0) {
                $result.Data = $resultGroups
            } else {
                Write-TeamsLog -Level "WARN" -Message "No non-empty data groups to export" -Context $Context
            }
        } else {
            Write-TeamsLog -Level "WARN" -Message "No data discovered to prepare for export" -Context $Context
        }

        # 8. FINALIZE METADATA
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
        # 9. CLEANUP & COMPLETE
        Write-TeamsLog -Level "INFO" -Message "Cleaning up..." -Context $Context

        # Disconnect from services (only if using Connect-MgGraph, not custom token)
        if (-not $graphContext.IsCustom) {
            Disconnect-MgGraph -ErrorAction SilentlyContinue
        }
        
        $stopwatch.Stop()
        $result.EndTime = Get-Date
        
        # Ensure RecordCount is properly set
        $result.RecordCount = $allDiscoveredData.Count
        
        Write-TeamsLog -Level $(if($result.Success){"SUCCESS"}else{"ERROR"}) -Message "Discovery completed with $($result.RecordCount) records" -Context $Context
        Write-TeamsLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

# --- Helper Functions ---

function Invoke-CustomMgGraphRequest {
    <#
    .SYNOPSIS
        Custom Graph API request function that works with both Connect-MgGraph and direct access tokens
    .DESCRIPTION
        This function checks if we're using a custom context (direct token) or standard MgGraph context,
        and makes the appropriate REST API call. This bypasses Connect-MgGraph version compatibility issues.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Uri,

        [Parameter(Mandatory=$false)]
        [string]$Method = "GET",

        [Parameter(Mandatory=$false)]
        [hashtable]$Headers = @{},

        [Parameter(Mandatory=$true)]
        $GraphContext
    )

    # Check if we're using a custom context (direct token) or standard MgGraph
    if ($GraphContext.IsCustom -eq $true -and $GraphContext.AccessToken) {
        # Use direct REST API call with access token
        $authHeaders = @{
            "Authorization" = "Bearer $($GraphContext.AccessToken)"
            "Content-Type"  = "application/json"
        }

        # Merge any additional headers
        foreach ($key in $Headers.Keys) {
            $authHeaders[$key] = $Headers[$key]
        }

        $response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $authHeaders -ErrorAction Stop
        return $response
    } else {
        # Use standard Invoke-MgGraphRequest (if Connect-MgGraph worked)
        return Invoke-MgGraphRequest -Uri $Uri -Method $Method -Headers $Headers -ErrorAction Stop
    }
}

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

