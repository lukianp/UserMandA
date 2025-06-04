<#
.SYNOPSIS
    SharePoint Online discovery for M&A Discovery Suite
.DESCRIPTION
    Discovers SharePoint sites, permissions, storage, external sharing, and content
#>

# Modules/Discovery/SharePointDiscovery.psm1

function Invoke-SharePointDiscovery {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Starting SharePoint Online discovery" -Level "HEADER"
        
        #Updated global logging thingy
        if ($null -eq $global:MandA) {
    throw "Global environment not initialized"
}
        $outputPath = $Context.Paths.RawDataOutput

        if (-not (Test-Path $Context.Paths.RawDataOutput)) {
    New-Item -Path $Context.Paths.RawDataOutput -ItemType Directory -Force
}


      
        
        $discoveryResults = @{}
        
        # Verify SharePoint connection
        try {
            $adminUrl = Get-SPOAdminUrl -TenantDomain $Configuration.sharepoint.tenantName
            Connect-SPOService -Url $adminUrl -ErrorAction Stop
            Write-MandALog "SharePoint Online connection verified" -Level "SUCCESS"
        } catch {
            Write-MandALog "SharePoint Online not connected. Skipping SharePoint discovery." -Level "WARN"
            return @{}
        }
        
        # Site Collections
        Write-MandALog "Discovering site collections..." -Level "INFO"
        $discoveryResults.SiteCollections = Get-SharePointSitesData -OutputPath $rawPath -Configuration $Configuration
        
        # Hub Sites
        Write-MandALog "Discovering hub sites..." -Level "INFO"
        $discoveryResults.HubSites = Get-SharePointHubSitesData -OutputPath $rawPath -Configuration $Configuration
        
        # External Users
        Write-MandALog "Discovering external users..." -Level "INFO"
        $discoveryResults.ExternalUsers = Get-SharePointExternalUsersData -OutputPath $rawPath -Configuration $Configuration
        
        # Sharing Links
        Write-MandALog "Discovering sharing links..." -Level "INFO"
        $discoveryResults.SharingLinks = Get-SharePointSharingLinksData -OutputPath $rawPath -Configuration $Configuration -Sites $discoveryResults.SiteCollections
        
        # Site Permissions
        Write-MandALog "Discovering site permissions..." -Level "INFO"
        $discoveryResults.SitePermissions = Get-SharePointSitePermissionsData -OutputPath $rawPath -Configuration $Configuration -Sites $discoveryResults.SiteCollections
        
        # Storage Metrics
        Write-MandALog "Analyzing storage usage..." -Level "INFO"
        $discoveryResults.StorageMetrics = Get-SharePointStorageMetricsData -OutputPath $rawPath -Configuration $Configuration
        
        # Content Types
        Write-MandALog "Discovering content types..." -Level "INFO"
        $discoveryResults.ContentTypes = Get-SharePointContentTypesData -OutputPath $rawPath -Configuration $Configuration -Sites $discoveryResults.SiteCollections
        
        Write-MandALog "SharePoint Online discovery completed successfully" -Level "SUCCESS"
        return $discoveryResults
        
    } catch {
        Write-MandALog "SharePoint Online discovery failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Get-SharePointSitesData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "SharePointSites.csv"
    $sitesData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "SharePoint sites CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving all SharePoint sites..." -Level "INFO"
        
        # Get all sites including OneDrive sites if configured
        $includeOneDrive = $Configuration.sharepoint.includeOneDriveSites
        $sites = Get-SPOSite -Limit All -IncludePersonalSite:$includeOneDrive -ErrorAction Stop
        
        Write-MandALog "Found $($sites.Count) site collections" -Level "SUCCESS"
        
        $processedCount = 0
        foreach ($site in $sites) {
            $processedCount++
            if ($processedCount % 20 -eq 0) {
                Write-Progress -Activity "Processing SharePoint Sites" -Status "Site $processedCount of $($sites.Count)" -PercentComplete (($processedCount / $sites.Count) * 100)
            }
            
            try {
                # Get detailed site information
                $siteDetails = Get-SPOSite -Identity $site.Url -Detailed -ErrorAction Stop
                
                # Determine site type
                $siteType = "TeamSite"
                if ($site.Url -match "/personal/") {
                    $siteType = "OneDrive"
                } elseif ($site.Template -eq "SITEPAGEPUBLISHING#0") {
                    $siteType = "CommunicationSite"
                } elseif ($site.Template -eq "GROUP#0") {
                    $siteType = "Microsoft365Group"
                } elseif ($site.Template -eq "TEAMCHANNEL#0" -or $site.Template -eq "TEAMCHANNEL#1") {
                    $siteType = "TeamChannelSite"
                }
                
                $sitesData.Add([PSCustomObject]@{
                    Url = $site.Url
                    Title = $site.Title
                    Template = $site.Template
                    SiteType = $siteType
                    Owner = $site.Owner
                    StorageQuota = $site.StorageQuota
                    StorageUsed = $site.StorageUsageCurrent
                    StoragePercentUsed = if ($site.StorageQuota -gt 0) { 
                        [math]::Round(($site.StorageUsageCurrent / $site.StorageQuota) * 100, 2) 
                    } else { 0 }
                    ResourceQuota = $site.ResourceQuota
                    ResourceUsed = $site.ResourceUsageCurrent
                    SharingCapability = $site.SharingCapability
                    ExternalSharingEnabled = $site.SharingCapability -ne "Disabled"
                    Status = $site.Status
                    LockState = $site.LockState
                    LastContentModifiedDate = $site.LastContentModifiedDate
                    WebsCount = $site.WebsCount
                    CompatibilityLevel = $site.CompatibilityLevel
                    ConditionalAccessPolicy = $site.ConditionalAccessPolicy
                    SensitivityLabel = $siteDetails.SensitivityLabel
                    GroupId = $site.GroupId
                    HubSiteId = $site.HubSiteId
                    IsHubSite = $site.IsHubSite
                    TeamsConnected = $null -ne $site.GroupId -and $site.GroupId -ne [System.Guid]::Empty
                    CreatedDate = $siteDetails.CreatedDate
                    DenyAddAndCustomizePages = $site.DenyAddAndCustomizePages
                    DisableCompanyWideSharingLinks = $site.DisableCompanyWideSharingLinks
                    DisableFlows = $site.DisableFlows
                    RestrictedToGeo = $site.RestrictedToGeo
                    SharingDomainRestrictionMode = $site.SharingDomainRestrictionMode
                    ShowPeoplePickerSuggestionsForGuestUsers = $site.ShowPeoplePickerSuggestionsForGuestUsers
                })
                
            } catch {
                Write-MandALog "Error processing site $($site.Url): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-Progress -Activity "Processing SharePoint Sites" -Completed
        
        # Export to CSV
        Export-DataToCSV -Data $sitesData -FilePath $outputFile
        
        return $sitesData
        
    } catch {
        Write-MandALog "Error retrieving SharePoint sites: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-SharePointHubSitesData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "SharePointHubSites.csv"
    $hubSitesData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "SharePoint hub sites CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving SharePoint hub sites..." -Level "INFO"
        
        $hubSites = Get-SPOHubSite -ErrorAction Stop
        
        foreach ($hub in $hubSites) {
            # Get associated sites
            $associatedSites = Get-SPOSite -Limit All | Where-Object { $_.HubSiteId -eq $hub.HubSiteId }
            
            $hubSitesData.Add([PSCustomObject]@{
                HubSiteId = $hub.HubSiteId
                Title = $hub.Title
                SiteUrl = $hub.SiteUrl
                LogoUrl = $hub.LogoUrl
                Description = $hub.Description
                SiteDesignId = $hub.SiteDesignId
                SiteId = $hub.SiteId
                EnablePermissionsSync = $hub.EnablePermissionsSync
                HideNameInNavigation = $hub.HideNameInNavigation
                RequiresJoinApproval = $hub.RequiresJoinApproval
                AssociatedSiteCount = ($associatedSites | Measure-Object).Count
                AssociatedSites = ($associatedSites.Url -join ";")
                CreatedBy = $hub.CreatedBy
                CreatedDate = $hub.CreatedDate
            })
        }
        
        Write-MandALog "Found $($hubSitesData.Count) hub sites" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $hubSitesData -FilePath $outputFile
        
        return $hubSitesData
        
    } catch {
        Write-MandALog "Error retrieving hub sites: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-SharePointExternalUsersData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "SharePointExternalUsers.csv"
    $externalUsersData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "SharePoint external users CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving SharePoint external users..." -Level "INFO"
        
        # Get external users
        $position = 0
        $pageSize = 50
        $hasMore = $true
        
        while ($hasMore) {
            $users = Get-SPOExternalUser -Position $position -PageSize $pageSize -ErrorAction Stop
            
            if ($users.Count -eq 0) {
                $hasMore = $false
            } else {
                foreach ($user in $users) {
                    $externalUsersData.Add([PSCustomObject]@{
                        Email = $user.Email
                        DisplayName = $user.DisplayName
                        UniqueId = $user.UniqueId
                        AcceptedAs = $user.AcceptedAs
                        WhenCreated = $user.WhenCreated
                        InvitedBy = $user.InvitedBy
                        LoginName = $user.LoginName
                        IsGuestUser = $true
                        SiteUrls = ($user.SiteUrls -join ";")
                        SiteCount = ($user.SiteUrls | Measure-Object).Count
                    })
                }
                
                $position += $pageSize
            }
        }
        
        Write-MandALog "Found $($externalUsersData.Count) external users" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $externalUsersData -FilePath $outputFile
        
        return $externalUsersData
        
    } catch {
        Write-MandALog "Error retrieving external users: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-SharePointSharingLinksData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration,
        [array]$Sites
    )
    
    $outputFile = Join-Path $OutputPath "SharePointSharingLinks.csv"
    $sharingLinksData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "SharePoint sharing links CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Note: Detailed sharing link enumeration requires additional permissions and may be limited" -Level "WARN"
        
        # This is a placeholder as full sharing link enumeration requires Graph API
        # with specific permissions and is resource-intensive
        
        # Sample implementation for sites with external sharing enabled
        $sitesWithExternalSharing = $Sites | Where-Object { $_.ExternalSharingEnabled }
        
        Write-MandALog "Found $($sitesWithExternalSharing.Count) sites with external sharing enabled" -Level "INFO"
        
        foreach ($site in $sitesWithExternalSharing) {
            $sharingLinksData.Add([PSCustomObject]@{
                SiteUrl = $site.Url
                SiteTitle = $site.Title
                SharingCapability = $site.SharingCapability
                ExternalSharingEnabled = $site.ExternalSharingEnabled
                DisableCompanyWideSharingLinks = $site.DisableCompanyWideSharingLinks
                DefaultSharingLinkType = "NotAvailable"
                DefaultLinkPermission = "NotAvailable"
                RequiresAnonymousLinksExpiration = "NotAvailable"
                SharingStatus = "EnabledForSite"
                Notes = "Detailed link enumeration requires Graph API with Sites.Read.All permission"
            })
        }
        
        # Export to CSV
        Export-DataToCSV -Data $sharingLinksData -FilePath $outputFile
        
        return $sharingLinksData
        
    } catch {
        Write-MandALog "Error retrieving sharing links: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-SharePointSitePermissionsData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration,
        [array]$Sites
    )
    
    $outputFile = Join-Path $OutputPath "SharePointSitePermissions.csv"
    $permissionsData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "SharePoint site permissions CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving site permissions for $($Sites.Count) sites..." -Level "INFO"
        
        # Limit to a sample of sites to avoid timeout
        $siteSample = $Sites | Select-Object -First 50
        
        $processedCount = 0
        foreach ($site in $siteSample) {
            $processedCount++
            if ($processedCount % 10 -eq 0) {
                Write-Progress -Activity "Processing Site Permissions" -Status "Site $processedCount of $($siteSample.Count)" -PercentComplete (($processedCount / $siteSample.Count) * 100)
            }
            
            try {
                # Get site admins
                $siteAdmins = Get-SPOUser -Site $site.Url -Limit All | Where-Object { $_.IsSiteAdmin }
                
                foreach ($admin in $siteAdmins) {
                    $permissionsData.Add([PSCustomObject]@{
                        SiteUrl = $site.Url
                        SiteTitle = $site.Title
                        UserEmail = $admin.LoginName
                        DisplayName = $admin.DisplayName
                        PermissionLevel = "Site Collection Administrator"
                        UserType = $admin.UserType
                        IsGroup = $admin.IsGroup
                        IsSiteAdmin = $true
                        Groups = ($admin.Groups -join ";")
                    })
                }
                
            } catch {
                Write-MandALog "Error getting permissions for site $($site.Url): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-Progress -Activity "Processing Site Permissions" -Completed
        Write-MandALog "Retrieved permissions for $processedCount sites (sample)" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $permissionsData -FilePath $outputFile
        
        return $permissionsData
        
    } catch {
        Write-MandALog "Error retrieving site permissions: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-SharePointStorageMetricsData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "SharePointStorageMetrics.csv"
    $storageData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "SharePoint storage metrics CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Analyzing SharePoint storage usage..." -Level "INFO"
        
        # Get tenant storage metrics
        $tenant = Get-SPOTenant
        $tenantStorage = @{
            Type = "TenantTotal"
            Name = "Tenant Storage"
            StorageQuotaGB = [math]::Round($tenant.StorageQuota / 1024, 2)
            StorageUsedGB = [math]::Round($tenant.CurrentAvailableStorageInMB / 1024, 2)
            PercentUsed = if ($tenant.StorageQuota -gt 0) {
                [math]::Round((($tenant.StorageQuota - $tenant.CurrentAvailableStorageInMB) / $tenant.StorageQuota) * 100, 2)
            } else { 0 }
            ResourceQuota = $tenant.ResourceQuota
            ResourceUsed = $tenant.ResourceQuotaAllocated
        }
        
        $storageData.Add([PSCustomObject]$tenantStorage)
        
        # Get top storage consuming sites
        $allSites = Get-SPOSite -Limit All | Sort-Object StorageUsageCurrent -Descending | Select-Object -First 100
        
        foreach ($site in $allSites) {
            $storageData.Add([PSCustomObject]@{
                Type = "Site"
                Name = $site.Title
                Url = $site.Url
                StorageQuotaGB = [math]::Round($site.StorageQuota / 1024, 2)
                StorageUsedGB = [math]::Round($site.StorageUsageCurrent / 1024, 2)
                PercentUsed = if ($site.StorageQuota -gt 0) {
                    [math]::Round(($site.StorageUsageCurrent / $site.StorageQuota) * 100, 2)
                } else { 0 }
                Template = $site.Template
                LastModified = $site.LastContentModifiedDate
                Owner = $site.Owner
            })
        }
        
        Write-MandALog "Analyzed storage for tenant and top 100 sites" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $storageData -FilePath $outputFile
        
        return $storageData
        
    } catch {
        Write-MandALog "Error analyzing storage metrics: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-SharePointContentTypesData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration,
        [array]$Sites
    )
    
    $outputFile = Join-Path $OutputPath "SharePointContentTypes.csv"
    $contentTypesData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "SharePoint content types CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Note: Content type discovery requires CSOM and is limited in this implementation" -Level "WARN"
        
        # This is a simplified implementation
        # Full content type discovery would require CSOM (Client Side Object Model)
        
        # Add tenant-level summary
        $contentTypesData.Add([PSCustomObject]@{
            Scope = "Tenant"
            Location = "Content Type Hub"
            ContentTypeName = "Various"
            ContentTypeId = "N/A"
            Group = "N/A"
            Description = "Content type discovery requires CSOM for detailed enumeration"
            Parent = "N/A"
            ReadOnly = "N/A"
            Hidden = "N/A"
            SiteCount = $Sites.Count
        })
        
        Write-MandALog "Content type placeholder data created" -Level "INFO"
        
        # Export to CSV
        Export-DataToCSV -Data $contentTypesData -FilePath $outputFile
        
        return $contentTypesData
        
    } catch {
        Write-MandALog "Error retrieving content types: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-SPOAdminUrl {
    param([string]$TenantDomain)
    
    if ($TenantDomain -match "\.onmicrosoft\.com$") {
        $tenantName = $TenantDomain -replace "\.onmicrosoft\.com$", ""
    } else {
        # Assume it's just the tenant name
        $tenantName = $TenantDomain
    }
    
    return "https://$tenantName-admin.sharepoint.com"
}

# Export functions
Export-ModuleMember -Function @(
    'Invoke-SharePointDiscovery',
    'Get-SharePointSitesData',
    'Get-SharePointHubSitesData',
    'Get-SharePointExternalUsersData',
    'Get-SharePointSharingLinksData',
    'Get-SharePointSitePermissionsData',
    'Get-SharePointStorageMetricsData',
    'Get-SharePointContentTypesData'
)
