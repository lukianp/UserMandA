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
    SharePoint Online discovery for M&A Discovery Suite
.DESCRIPTION
    Discovers SharePoint sites, permissions, storage, external sharing, and content
#>

# Modules/Discovery/SharePointDiscovery.psm1

# SharePoint Discovery Prerequisites Function
function Test-SharePointDiscoveryPrerequisites {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [DiscoveryResult]$Result,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    Write-MandALog "Validating SharePoint Discovery prerequisites..." -Level "INFO" -Context $Context
    
    try {
        # Check if SharePoint Online PowerShell is available
        if (-not (Get-Module -Name Microsoft.Online.SharePoint.PowerShell -ListAvailable)) {
            $Result.AddError("SharePoint Online PowerShell module is not available", $null, @{
                Prerequisite = 'SharePoint Online PowerShell Module'
                Resolution = 'Install SharePoint Online PowerShell module using Install-Module Microsoft.Online.SharePoint.PowerShell'
            })
            return
        }
        
        # Import the module if not already loaded
        if (-not (Get-Module -Name Microsoft.Online.SharePoint.PowerShell)) {
            Import-Module Microsoft.Online.SharePoint.PowerShell -ErrorAction Stop
            Write-MandALog "SharePoint Online PowerShell module imported successfully" -Level "DEBUG" -Context $Context
        }
        
        # Validate tenant configuration
        if (-not $Configuration.sharepoint.tenantName) {
            $Result.AddError("SharePoint tenant name not configured", $null, @{
                Prerequisite = 'Tenant Configuration'
                Resolution = 'Configure sharepoint.tenantName in the configuration file'
            })
            return
        }
        
        # Test SharePoint Online connectivity
        try {
            $adminUrl = Get-SPOAdminUrl -TenantDomain $Configuration.sharepoint.tenantName
            Connect-SPOService -Url $adminUrl -ErrorAction Stop
            Write-MandALog "Successfully connected to SharePoint Online admin center: $adminUrl" -Level "SUCCESS" -Context $Context
            $Result.Metadata['AdminUrl'] = $adminUrl
            $Result.Metadata['TenantName'] = $Configuration.sharepoint.tenantName
        }
        catch {
            $Result.AddError("Failed to connect to SharePoint Online", $_.Exception, @{
                Prerequisite = 'SharePoint Online Connectivity'
                AdminUrl = $adminUrl
                Resolution = 'Verify SharePoint Online connection and admin permissions'
            })
            return
        }
        
        # Test basic SharePoint operations
        try {
            $testSite = Get-SPOSite -Limit 1 -ErrorAction Stop
            Write-MandALog "Successfully verified SharePoint Online access" -Level "SUCCESS" -Context $Context
        }
        catch {
            $Result.AddError("Failed to access SharePoint Online sites", $_.Exception, @{
                Prerequisite = 'SharePoint Online Access'
                Resolution = 'Verify SharePoint Online admin permissions'
            })
            return
        }
        
        Write-MandALog "All SharePoint Discovery prerequisites validated successfully" -Level "SUCCESS" -Context $Context
        
    }
    catch {
        $Result.AddError("Unexpected error during prerequisites validation", $_.Exception, @{
            Prerequisite = 'General Validation'
        })
    }
}

function Get-SharePointSitesWithErrorHandling {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    $sites = [System.Collections.ArrayList]::new()
    $retryCount = 0
    $maxRetries = 3
    
    while ($retryCount -lt $maxRetries) {
        try {
            Write-MandALog "Retrieving all SharePoint sites..." -Level "INFO" -Context $Context
            
            # Get all sites including OneDrive sites if configured
            $includeOneDrive = $Configuration.sharepoint.includeOneDriveSites
            $allSites = Get-SPOSite -Limit All -IncludePersonalSite:$includeOneDrive -ErrorAction Stop
            
            Write-MandALog "Found $($allSites.Count) site collections" -Level "SUCCESS" -Context $Context
            
            # Process sites with individual error handling
            $processedCount = 0
            foreach ($site in $allSites) {
                try {
                    $processedCount++
                    if ($processedCount % 20 -eq 0) {
                        Write-MandALog "Processed $processedCount/$($allSites.Count) sites" -Level "PROGRESS" -Context $Context
                    }
                    
                    # Get detailed site information
                    $siteDetails = Get-SPOSite -Identity $site.Url -Detailed -ErrorAction Stop
                    
                    $siteObj = ConvertTo-SharePointSiteObject -Site $site -SiteDetails $siteDetails -Context $Context
                    if ($siteObj) {
                        $null = $sites.Add($siteObj)
                    }
                }
                catch {
                    Write-MandALog "Error processing site $($site.Url): $_" -Level "WARN" -Context $Context
                    # Continue processing other sites
                }
            }
            
            # Success - exit retry loop
            break
        }
        catch {
            $retryCount++
            if ($retryCount -ge $maxRetries) {
                throw "Failed to retrieve SharePoint sites after $maxRetries attempts: $_"
            }
            
            $waitTime = [Math]::Pow(2, $retryCount) * 2  # Exponential backoff
            Write-MandALog "SharePoint site query failed (attempt $retryCount/$maxRetries). Waiting $waitTime seconds..." -Level "WARN" -Context $Context
            Start-Sleep -Seconds $waitTime
        }
    }
    
    return $sites.ToArray()
}

function ConvertTo-SharePointSiteObject {
    param($Site, $SiteDetails, $Context)
    
    try {
        # Determine site type
        $siteType = "TeamSite"
        if ($Site.Url -match "/personal/") {
            $siteType = "OneDrive"
        } elseif ($Site.Template -eq "SITEPAGEPUBLISHING#0") {
            $siteType = "CommunicationSite"
        } elseif ($Site.Template -eq "GROUP#0") {
            $siteType = "Microsoft365Group"
        } elseif ($Site.Template -eq "TEAMCHANNEL#0" -or $Site.Template -eq "TEAMCHANNEL#1") {
            $siteType = "TeamChannelSite"
        }
        
        return [PSCustomObject]@{
            Url = $Site.Url
            Title = $Site.Title
            Template = $Site.Template
            SiteType = $siteType
            Owner = $Site.Owner
            StorageQuota = $Site.StorageQuota
            StorageUsed = $Site.StorageUsageCurrent
            StoragePercentUsed = if ($Site.StorageQuota -gt 0) {
                [math]::Round(($Site.StorageUsageCurrent / $Site.StorageQuota) * 100, 2)
            } else { 0 }
            ResourceQuota = $Site.ResourceQuota
            ResourceUsed = $Site.ResourceUsageCurrent
            SharingCapability = $Site.SharingCapability
            ExternalSharingEnabled = $Site.SharingCapability -ne "Disabled"
            Status = $Site.Status
            LockState = $Site.LockState
            LastContentModifiedDate = $Site.LastContentModifiedDate
            WebsCount = $Site.WebsCount
            CompatibilityLevel = $Site.CompatibilityLevel
            ConditionalAccessPolicy = $Site.ConditionalAccessPolicy
            SensitivityLabel = $SiteDetails.SensitivityLabel
            GroupId = $Site.GroupId
            HubSiteId = $Site.HubSiteId
            IsHubSite = $Site.IsHubSite
            TeamsConnected = $null -ne $Site.GroupId -and $Site.GroupId -ne [System.Guid]::Empty
            CreatedDate = $SiteDetails.CreatedDate
            DenyAddAndCustomizePages = $Site.DenyAddAndCustomizePages
            DisableCompanyWideSharingLinks = $Site.DisableCompanyWideSharingLinks
            DisableFlows = $Site.DisableFlows
            RestrictedToGeo = $Site.RestrictedToGeo
            SharingDomainRestrictionMode = $Site.SharingDomainRestrictionMode
            ShowPeoplePickerSuggestionsForGuestUsers = $Site.ShowPeoplePickerSuggestionsForGuestUsers
        }
    }
    catch {
        Write-MandALog "Error converting SharePoint site object: $_" -Level "WARN" -Context $Context
        return $null
    }
}

function Invoke-SharePointDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    # Initialize result object
    $result = [DiscoveryResult]::new('SharePoint')
    
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
        
        Write-MandALog "--- Starting SharePoint Discovery Phase (v2.0.0) ---" -Level "HEADER" -Context $Context
        
        # Validate prerequisites
        Test-SharePointDiscoveryPrerequisites -Configuration $Configuration -Result $result -Context $Context
        
        if (-not $result.Success) {
            Write-MandALog "Prerequisites check failed, aborting SharePoint discovery" -Level "ERROR" -Context $Context
            return $result
        }
        
        # Main discovery logic with nested error handling
        $sharePointData = @{
            SiteCollections = @()
            HubSites = @()
            ExternalUsers = @()
            SharingLinks = @()
            SitePermissions = @()
            StorageMetrics = @()
            ContentTypes = @()
        }
        
        # Discover Site Collections with specific error handling
        try {
            Write-MandALog "Discovering SharePoint site collections..." -Level "INFO" -Context $Context
            $sharePointData.SiteCollections = Get-SharePointSitesWithErrorHandling -Configuration $Configuration -Context $Context
            $result.Metadata['SiteCollectionCount'] = $sharePointData.SiteCollections.Count
            Write-MandALog "Successfully discovered $($sharePointData.SiteCollections.Count) SharePoint site collections" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover SharePoint site collections",
                $_.Exception,
                @{
                    Operation = 'Get-SPOSite'
                    TenantName = $Configuration.sharepoint.tenantName
                }
            )
            Write-MandALog "Error discovering SharePoint site collections: $($_.Exception.Message)" -Level "ERROR" -Context $Context
            # Continue with other discoveries even if sites fail
        }
        
        # Discover Hub Sites with specific error handling
        try {
            Write-MandALog "Discovering SharePoint hub sites..." -Level "INFO" -Context $Context
            $sharePointData.HubSites = Get-SharePointHubSitesData -OutputPath (Get-ModuleContext).Paths.RawDataOutput -Configuration $Configuration
            $result.Metadata['HubSiteCount'] = $sharePointData.HubSites.Count
            Write-MandALog "Successfully discovered $($sharePointData.HubSites.Count) SharePoint hub sites" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover SharePoint hub sites",
                $_.Exception,
                @{
                    Operation = 'Get-SPOHubSite'
                }
            )
            Write-MandALog "Error discovering SharePoint hub sites: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Discover External Users with specific error handling
        try {
            Write-MandALog "Discovering SharePoint external users..." -Level "INFO" -Context $Context
            $sharePointData.ExternalUsers = Get-SharePointExternalUsersData -OutputPath (Get-ModuleContext).Paths.RawDataOutput -Configuration $Configuration
            $result.Metadata['ExternalUserCount'] = $sharePointData.ExternalUsers.Count
            Write-MandALog "Successfully discovered $($sharePointData.ExternalUsers.Count) SharePoint external users" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover SharePoint external users",
                $_.Exception,
                @{
                    Operation = 'Get-SPOExternalUser'
                }
            )
            Write-MandALog "Error discovering SharePoint external users: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Discover Sharing Links with specific error handling
        try {
            Write-MandALog "Discovering SharePoint sharing links..." -Level "INFO" -Context $Context
            $sharePointData.SharingLinks = Get-SharePointSharingLinksData -OutputPath (Get-ModuleContext).Paths.RawDataOutput -Configuration $Configuration -Sites $sharePointData.SiteCollections
            $result.Metadata['SharingLinkCount'] = $sharePointData.SharingLinks.Count
            Write-MandALog "Successfully discovered $($sharePointData.SharingLinks.Count) SharePoint sharing links" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover SharePoint sharing links",
                $_.Exception,
                @{
                    Operation = 'Get-SharePointSharingLinks'
                    SiteCount = $sharePointData.SiteCollections.Count
                }
            )
            Write-MandALog "Error discovering SharePoint sharing links: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Discover Site Permissions with specific error handling
        try {
            Write-MandALog "Discovering SharePoint site permissions..." -Level "INFO" -Context $Context
            $sharePointData.SitePermissions = Get-SharePointSitePermissionsData -OutputPath (Get-ModuleContext).Paths.RawDataOutput -Configuration $Configuration -Sites $sharePointData.SiteCollections
            $result.Metadata['SitePermissionCount'] = $sharePointData.SitePermissions.Count
            Write-MandALog "Successfully discovered $($sharePointData.SitePermissions.Count) SharePoint site permissions" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover SharePoint site permissions",
                $_.Exception,
                @{
                    Operation = 'Get-SPOUser'
                    SiteCount = $sharePointData.SiteCollections.Count
                }
            )
            Write-MandALog "Error discovering SharePoint site permissions: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Discover Storage Metrics with specific error handling
        try {
            Write-MandALog "Analyzing SharePoint storage usage..." -Level "INFO" -Context $Context
            $sharePointData.StorageMetrics = Get-SharePointStorageMetricsData -OutputPath (Get-ModuleContext).Paths.RawDataOutput -Configuration $Configuration
            $result.Metadata['StorageMetricCount'] = $sharePointData.StorageMetrics.Count
            Write-MandALog "Successfully analyzed SharePoint storage usage" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to analyze SharePoint storage usage",
                $_.Exception,
                @{
                    Operation = 'Get-SPOTenant'
                }
            )
            Write-MandALog "Error analyzing SharePoint storage usage: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Discover Content Types with specific error handling
        try {
            Write-MandALog "Discovering SharePoint content types..." -Level "INFO" -Context $Context
            $sharePointData.ContentTypes = Get-SharePointContentTypesData -OutputPath (Get-ModuleContext).Paths.RawDataOutput -Configuration $Configuration -Sites $sharePointData.SiteCollections
            $result.Metadata['ContentTypeCount'] = $sharePointData.ContentTypes.Count
            Write-MandALog "Successfully discovered SharePoint content types" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover SharePoint content types",
                $_.Exception,
                @{
                    Operation = 'Get-SharePointContentTypes'
                    SiteCount = $sharePointData.SiteCollections.Count
                }
            )
            Write-MandALog "Error discovering SharePoint content types: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Set the data even if partially successful
        $result.Data = $sharePointData
        
        # Determine overall success based on critical data
        if ($sharePointData.SiteCollections.Count -eq 0) {
            $result.Success = $false
            $result.AddError("No SharePoint site collections retrieved")
            Write-MandALog "SharePoint Discovery failed - no site collections retrieved" -Level "ERROR" -Context $Context
        } else {
            Write-MandALog "--- SharePoint Discovery Phase Completed Successfully ---" -Level "SUCCESS" -Context $Context
        }
        
    }
    catch {
        # Catch-all for unexpected errors
        $result.AddError(
            "Unexpected error in SharePoint discovery",
            $_.Exception,
            @{
                ErrorPoint = 'Main Discovery Block'
                LastOperation = $MyInvocation.MyCommand.Name
            }
        )
        Write-MandALog "Unexpected error in SharePoint Discovery: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    finally {
        # Always execute cleanup
        $ErrorActionPreference = $originalErrorActionPreference
        $result.Complete()
        
        # Log summary
        Write-MandALog "SharePoint Discovery completed. Success: $($result.Success), Errors: $($result.Errors.Count), Warnings: $($result.Warnings.Count)" -Level "INFO" -Context $Context
        
        # Clean up connections if needed
        try {
            # Disconnect from SharePoint Online if needed
            if (Get-Command Disconnect-SPOService -ErrorAction SilentlyContinue) {
                Disconnect-SPOService -ErrorAction SilentlyContinue
            }
        }
        catch {
            Write-MandALog "Cleanup warning: $_" -Level "WARN" -Context $Context
        }
    }
    
    return $result
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

