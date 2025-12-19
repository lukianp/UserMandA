# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-12-19
# Last Modified: 2025-12-19

<#
.SYNOPSIS
    Azure M365 Discovery Module - Exchange, SharePoint, Teams
.DESCRIPTION
    Extracts Microsoft 365 workload configurations for migration planning.
    Discovers:
    - Exchange Online Mailboxes with migration sizing
    - SharePoint Online Sites with storage metrics
    - Microsoft Teams with channel and membership analysis

    Part of the Azure Discovery refactoring initiative to break monolithic
    AzureDiscovery.psm1 into focused, maintainable modules.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-12-19
    Requires: PowerShell 5.1+, Microsoft.Graph modules
#>

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Invoke-AzureM365Discovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-ModuleLog -ModuleName "AzureM365Discovery" -Message "Starting M365 Discovery (Exchange, SharePoint, Teams)..." -Level "INFO"

    # Define discovery script
    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)

        $allDiscoveredData = [System.Collections.ArrayList]::new()

        #region Exchange Online Mailboxes Discovery
        Write-ModuleLog -ModuleName "AzureM365Discovery" -Message "Discovering Exchange Online Mailboxes..." -Level "INFO"

        try {
            $mailboxes = @()
            # Use Graph API to get mailbox information
            $mailboxUri = "https://graph.microsoft.com/v1.0/users?`$select=id,userPrincipalName,displayName,mail,proxyAddresses,assignedLicenses&`$filter=assignedLicenses/any()&`$top=999"

            do {
                $response = Invoke-MgGraphRequest -Uri $mailboxUri -Method GET
                $mailboxes += $response.value
                $mailboxUri = $response.'@odata.nextLink'
            } while ($mailboxUri)

            foreach ($user in $mailboxes) {
                # Check if user has Exchange Online license
                $hasExchangeLicense = $false
                $exchangeSkuIds = @(
                    'efb87545-963c-4e0d-99df-69c6916d9eb0', # Exchange Online Plan 2
                    '4b9405b0-7788-4568-add1-99614e613b69', # Exchange Online Plan 1
                    '80b2d799-d2ba-4d2a-8842-fb0d0f3a4b82', # Exchange Online Kiosk
                    'c5928f49-12ba-48f7-ada3-0d743a3601d5', # Microsoft 365 E5
                    '06ebc4ee-1bb5-47dd-8120-11324bc54e06', # Microsoft 365 E3
                    'f245ecc8-75af-4f8e-b61f-27d8114de5f3'  # Microsoft 365 Business Premium
                )
                foreach ($license in $user.assignedLicenses) {
                    if ($license.skuId -in $exchangeSkuIds) {
                        $hasExchangeLicense = $true
                        break
                    }
                }

                if (-not $hasExchangeLicense) { continue }

                # Get mailbox settings if available
                $mailboxSize = $null
                $itemCount = $null
                try {
                    $mailboxStatsUri = "https://graph.microsoft.com/v1.0/users/$($user.id)/mailFolders?`$select=totalItemCount,sizeInBytes"
                    $statsResponse = Invoke-MgGraphRequest -Uri $mailboxStatsUri -Method GET
                    $itemCount = ($statsResponse.value | Measure-Object -Property totalItemCount -Sum).Sum
                    $mailboxSize = ($statsResponse.value | Measure-Object -Property sizeInBytes -Sum).Sum
                } catch {
                    # Mailbox stats may not be accessible
                }

                # Get mailbox rules count
                $rulesCount = 0
                try {
                    $rulesUri = "https://graph.microsoft.com/v1.0/users/$($user.id)/mailFolders/inbox/messageRules"
                    $rulesResponse = Invoke-MgGraphRequest -Uri $rulesUri -Method GET
                    $rulesCount = @($rulesResponse.value).Count
                } catch {
                    # Rules may not be accessible
                }

                # Migration assessment
                $migrationNotes = @()
                $migrationComplexity = 'Low'

                if ($mailboxSize -and $mailboxSize -gt 50GB) {
                    $migrationNotes += "Large mailbox (>50GB) - plan for extended migration window"
                    $migrationComplexity = 'High'
                } elseif ($mailboxSize -and $mailboxSize -gt 10GB) {
                    $migrationNotes += "Medium mailbox (>10GB) - standard migration"
                    $migrationComplexity = 'Medium'
                }

                if ($rulesCount -gt 10) {
                    $migrationNotes += "$rulesCount inbox rules - verify rule migration"
                }

                $proxyAddresses = $user.proxyAddresses | Where-Object { $_ -like 'smtp:*' -or $_ -like 'SMTP:*' }
                if (@($proxyAddresses).Count -gt 3) {
                    $migrationNotes += "Multiple email aliases ($(@($proxyAddresses).Count)) - verify domain migration"
                }

                $mailboxData = [PSCustomObject]@{
                    ObjectType = "ExchangeMailbox"
                    Id = $user.id
                    UserPrincipalName = $user.userPrincipalName
                    DisplayName = $user.displayName
                    PrimarySmtpAddress = $user.mail

                    # Proxy Addresses
                    ProxyAddresses = ($proxyAddresses -join '; ')
                    ProxyAddressCount = @($proxyAddresses).Count

                    # Mailbox Metrics
                    MailboxSizeBytes = $mailboxSize
                    MailboxSizeGB = if ($mailboxSize) { [math]::Round($mailboxSize / 1GB, 2) } else { $null }
                    ItemCount = $itemCount
                    InboxRulesCount = $rulesCount

                    # Migration Assessment
                    MigrationComplexity = $migrationComplexity
                    MigrationNotes = ($migrationNotes -join '; ')

                    _DataType = 'ExchangeMailboxes'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($mailboxData)
            }

            $mailboxCount = @($allDiscoveredData | Where-Object { $_._DataType -eq 'ExchangeMailboxes' }).Count
            $Result.Metadata["ExchangeMailboxCount"] = $mailboxCount

            Write-ModuleLog -ModuleName "AzureM365Discovery" -Message "Exchange Discovery - Found $mailboxCount mailboxes" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover Exchange Mailboxes: $($_.Exception.Message)", $_.Exception, @{Section="Exchange"})
        }
        #endregion

        #region SharePoint Online Sites Discovery
        Write-ModuleLog -ModuleName "AzureM365Discovery" -Message "Discovering SharePoint Online Sites..." -Level "INFO"

        try {
            $sites = @()
            $sitesUri = "https://graph.microsoft.com/v1.0/sites?search=*&`$select=id,name,displayName,webUrl,createdDateTime,lastModifiedDateTime&`$top=999"

            do {
                $response = Invoke-MgGraphRequest -Uri $sitesUri -Method GET
                $sites += $response.value
                $sitesUri = $response.'@odata.nextLink'
            } while ($sitesUri)

            foreach ($site in $sites) {
                # Get site storage information
                $storageUsed = $null
                $storageAllocated = $null
                $itemCount = 0
                try {
                    $driveUri = "https://graph.microsoft.com/v1.0/sites/$($site.id)/drive?`$select=quota"
                    $driveResponse = Invoke-MgGraphRequest -Uri $driveUri -Method GET
                    if ($driveResponse.quota) {
                        $storageUsed = $driveResponse.quota.used
                        $storageAllocated = $driveResponse.quota.total
                    }
                } catch {
                    # Drive info may not be accessible
                }

                # Get list count
                $listCount = 0
                try {
                    $listsUri = "https://graph.microsoft.com/v1.0/sites/$($site.id)/lists?`$select=id"
                    $listsResponse = Invoke-MgGraphRequest -Uri $listsUri -Method GET
                    $listCount = @($listsResponse.value).Count
                } catch {
                    # Lists may not be accessible
                }

                # Determine site type
                $siteType = 'TeamSite'
                if ($site.webUrl -like '*-my.sharepoint.com*') {
                    $siteType = 'OneDrive'
                } elseif ($site.webUrl -like '*/sites/*') {
                    $siteType = 'TeamSite'
                } elseif ($site.name -eq 'root') {
                    $siteType = 'RootSite'
                }

                # Migration assessment
                $migrationNotes = @()
                $migrationComplexity = 'Low'

                if ($storageUsed -and $storageUsed -gt 100GB) {
                    $migrationNotes += "Large site (>100GB) - plan for extended migration window"
                    $migrationComplexity = 'High'
                } elseif ($storageUsed -and $storageUsed -gt 25GB) {
                    $migrationNotes += "Medium site (>25GB) - standard migration"
                    $migrationComplexity = 'Medium'
                }

                if ($listCount -gt 20) {
                    $migrationNotes += "$listCount lists - verify list migration and customizations"
                    $migrationComplexity = 'Medium'
                }

                $siteData = [PSCustomObject]@{
                    ObjectType = "SharePointSite"
                    Id = $site.id
                    Name = $site.name
                    DisplayName = $site.displayName
                    WebUrl = $site.webUrl
                    SiteType = $siteType

                    # Timestamps
                    CreatedDateTime = $site.createdDateTime
                    LastModifiedDateTime = $site.lastModifiedDateTime

                    # Storage Metrics
                    StorageUsedBytes = $storageUsed
                    StorageUsedGB = if ($storageUsed) { [math]::Round($storageUsed / 1GB, 2) } else { $null }
                    StorageAllocatedBytes = $storageAllocated
                    StorageAllocatedGB = if ($storageAllocated) { [math]::Round($storageAllocated / 1GB, 2) } else { $null }
                    StoragePercentUsed = if ($storageUsed -and $storageAllocated) { [math]::Round(($storageUsed / $storageAllocated) * 100, 1) } else { $null }

                    # Content Metrics
                    ListCount = $listCount

                    # Migration Assessment
                    MigrationComplexity = $migrationComplexity
                    MigrationNotes = ($migrationNotes -join '; ')

                    _DataType = 'SharePointSites'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($siteData)
            }

            $siteCount = @($allDiscoveredData | Where-Object { $_._DataType -eq 'SharePointSites' }).Count
            $Result.Metadata["SharePointSiteCount"] = $siteCount
            $totalStorageGB = @($allDiscoveredData | Where-Object { $_._DataType -eq 'SharePointSites' -and $_.StorageUsedGB } | ForEach-Object { $_.StorageUsedGB } | Measure-Object -Sum).Sum
            $Result.Metadata["SharePointTotalStorageGB"] = [math]::Round($totalStorageGB, 2)

            Write-ModuleLog -ModuleName "AzureM365Discovery" -Message "SharePoint Discovery - Found $siteCount sites ($([math]::Round($totalStorageGB, 2)) GB total)" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover SharePoint Sites: $($_.Exception.Message)", $_.Exception, @{Section="SharePoint"})
        }
        #endregion

        #region Microsoft Teams Discovery
        Write-ModuleLog -ModuleName "AzureM365Discovery" -Message "Discovering Microsoft Teams..." -Level "INFO"

        try {
            $teams = @()
            $teamsUri = "https://graph.microsoft.com/v1.0/groups?`$filter=resourceProvisioningOptions/Any(x:x eq 'Team')&`$select=id,displayName,description,mail,visibility,createdDateTime&`$top=999"

            do {
                $response = Invoke-MgGraphRequest -Uri $teamsUri -Method GET
                $teams += $response.value
                $teamsUri = $response.'@odata.nextLink'
            } while ($teamsUri)

            foreach ($team in $teams) {
                # Get team details
                $channelCount = 0
                $memberCount = 0
                $ownerCount = 0

                try {
                    # Get channels
                    $channelsUri = "https://graph.microsoft.com/v1.0/teams/$($team.id)/channels?`$select=id,displayName,membershipType"
                    $channelsResponse = Invoke-MgGraphRequest -Uri $channelsUri -Method GET
                    $channels = $channelsResponse.value
                    $channelCount = @($channels).Count
                    $privateChannelCount = @($channels | Where-Object { $_.membershipType -eq 'private' }).Count
                    $sharedChannelCount = @($channels | Where-Object { $_.membershipType -eq 'shared' }).Count
                } catch {
                    # Channels may not be accessible
                    $privateChannelCount = 0
                    $sharedChannelCount = 0
                }

                try {
                    # Get members
                    $membersUri = "https://graph.microsoft.com/v1.0/groups/$($team.id)/members?`$select=id"
                    $membersResponse = Invoke-MgGraphRequest -Uri $membersUri -Method GET
                    $memberCount = @($membersResponse.value).Count
                } catch {
                    # Members may not be accessible
                }

                try {
                    # Get owners
                    $ownersUri = "https://graph.microsoft.com/v1.0/groups/$($team.id)/owners?`$select=id"
                    $ownersResponse = Invoke-MgGraphRequest -Uri $ownersUri -Method GET
                    $ownerCount = @($ownersResponse.value).Count
                } catch {
                    # Owners may not be accessible
                }

                # Get installed apps count
                $installedAppsCount = 0
                try {
                    $appsUri = "https://graph.microsoft.com/v1.0/teams/$($team.id)/installedApps?`$select=id"
                    $appsResponse = Invoke-MgGraphRequest -Uri $appsUri -Method GET
                    $installedAppsCount = @($appsResponse.value).Count
                } catch {
                    # Apps may not be accessible
                }

                # Migration assessment
                $migrationNotes = @()
                $migrationComplexity = 'Low'

                if ($memberCount -gt 100) {
                    $migrationNotes += "Large team ($memberCount members) - plan bulk member migration"
                    $migrationComplexity = 'Medium'
                }
                if ($channelCount -gt 20) {
                    $migrationNotes += "$channelCount channels - extensive channel structure"
                    $migrationComplexity = 'Medium'
                }
                if ($privateChannelCount -gt 0) {
                    $migrationNotes += "$privateChannelCount private channels - require separate migration"
                    $migrationComplexity = 'High'
                }
                if ($sharedChannelCount -gt 0) {
                    $migrationNotes += "$sharedChannelCount shared channels - cross-tenant configuration needed"
                    $migrationComplexity = 'High'
                }
                if ($installedAppsCount -gt 5) {
                    $migrationNotes += "$installedAppsCount apps installed - verify app availability in target tenant"
                }

                $teamData = [PSCustomObject]@{
                    ObjectType = "MicrosoftTeam"
                    Id = $team.id
                    DisplayName = $team.displayName
                    Description = $team.description
                    Mail = $team.mail
                    Visibility = $team.visibility
                    CreatedDateTime = $team.createdDateTime

                    # Membership
                    MemberCount = $memberCount
                    OwnerCount = $ownerCount

                    # Channels
                    ChannelCount = $channelCount
                    PrivateChannelCount = $privateChannelCount
                    SharedChannelCount = $sharedChannelCount

                    # Apps
                    InstalledAppsCount = $installedAppsCount

                    # Migration Assessment
                    MigrationComplexity = $migrationComplexity
                    MigrationNotes = ($migrationNotes -join '; ')

                    _DataType = 'Teams'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($teamData)
            }

            $teamCount = @($allDiscoveredData | Where-Object { $_._DataType -eq 'Teams' }).Count
            $Result.Metadata["TeamsCount"] = $teamCount
            $totalMembers = @($allDiscoveredData | Where-Object { $_._DataType -eq 'Teams' } | ForEach-Object { $_.MemberCount } | Measure-Object -Sum).Sum
            $Result.Metadata["TeamsTotalMembers"] = $totalMembers

            Write-ModuleLog -ModuleName "AzureM365Discovery" -Message "Teams Discovery - Found $teamCount teams with $totalMembers total memberships" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover Microsoft Teams: $($_.Exception.Message)", $_.Exception, @{Section="Teams"})
        }
        #endregion

        $Result.RecordCount = $allDiscoveredData.Count
        Write-ModuleLog -ModuleName "AzureM365Discovery" -Message "M365 Discovery Complete - Total Records: $($allDiscoveredData.Count)" -Level "SUCCESS"

        # Group by data type for CSV export
        return $allDiscoveredData | Group-Object -Property _DataType
    }

    # Execute discovery using base module
    Start-DiscoveryModule `
        -ModuleName "AzureM365Discovery" `
        -DiscoveryScript $discoveryScript `
        -Configuration $Configuration `
        -Context $Context `
        -SessionId $SessionId `
        -RequiredServices @()
}

Export-ModuleMember -Function Invoke-AzureM365Discovery
