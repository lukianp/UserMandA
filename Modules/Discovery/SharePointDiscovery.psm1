# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

#================================================================================
# M&A Discovery Module: SharePoint
# Description: Discovers SharePoint sites, lists, libraries, permissions, and content using Graph API.
#================================================================================

function Get-AuthInfoFromConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    # Add this for debugging:
    Write-MandALog -Message "AuthCheck: Received config keys: $($Configuration.Keys -join ', ')" -Level "DEBUG" -Component "SharePointDiscovery"

    # Check all possible locations for auth info
    if ($Configuration._AuthContext) { return $Configuration._AuthContext }
    if ($Configuration._Credentials) { return $Configuration._Credentials }
    if ($Configuration.authentication) {
        if ($Configuration.authentication._Credentials) { 
            return $Configuration.authentication._Credentials 
        }
        if ($Configuration.authentication.ClientId -and 
            $Configuration.authentication.ClientSecret -and 
            $Configuration.authentication.TenantId) {
            return @{
                ClientId     = $Configuration.authentication.ClientId
                ClientSecret = $Configuration.authentication.ClientSecret
                TenantId     = $Configuration.authentication.TenantId
            }
        }
    }
    if ($Configuration.ClientId -and $Configuration.ClientSecret -and $Configuration.TenantId) {
        return @{
            ClientId     = $Configuration.ClientId
            ClientSecret = $Configuration.ClientSecret
            TenantId     = $Configuration.TenantId
        }
    }
    return $null
}

function Write-SharePointLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    Write-MandALog -Message "[SharePoint] $Message" -Level $Level -Component "SharePointDiscovery" -Context $Context
}

# --- Main Discovery Function ---

function Invoke-SharePointDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )

    Write-SharePointLog -Level "HEADER" -Message "Starting Discovery" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # 1. INITIALIZE RESULT OBJECT
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('SharePoint')
    } else {
        # Fallback to hashtable
        $result = @{
            Success      = $true; ModuleName = 'SharePoint'; RecordCount = 0;
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
        Write-SharePointLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-SharePointLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
        Ensure-Path -Path $outputPath

        # 3. VALIDATE MODULE-SPECIFIC CONFIGURATION
        # SharePoint MUST have tenant name
        if (-not $Configuration.discovery -or 
            -not $Configuration.discovery.sharepoint -or 
            -not $Configuration.discovery.sharepoint.tenantName) {
            $result.AddError("SharePoint tenant name not configured in discovery.sharepoint.tenantName", $null, $null)
            return $result
        }
        $tenantName = $Configuration.discovery.sharepoint.tenantName
        
        # Configuration options
        $includeLists = $true
        $includeLibraries = $true
        $includePermissions = $true
        $includeHubSites = $true
        $includeSiteCollectionAdmins = $true
        $maxListsPerSite = 100
        
        if ($Configuration.discovery.sharepoint) {
            $spConfig = $Configuration.discovery.sharepoint
            if ($null -ne $spConfig.includeLists) { $includeLists = $spConfig.includeLists }
            if ($null -ne $spConfig.includeLibraries) { $includeLibraries = $spConfig.includeLibraries }
            if ($null -ne $spConfig.includePermissions) { $includePermissions = $spConfig.includePermissions }
            if ($null -ne $spConfig.includeHubSites) { $includeHubSites = $spConfig.includeHubSites }
            if ($null -ne $spConfig.includeSiteCollectionAdmins) { $includeSiteCollectionAdmins = $spConfig.includeSiteCollectionAdmins }
            if ($null -ne $spConfig.maxListsPerSite) { $maxListsPerSite = $spConfig.maxListsPerSite }
        }

        # 4. AUTHENTICATE & CONNECT
        Write-SharePointLog -Level "INFO" -Message "Extracting authentication information..." -Context $Context
        $authInfo = Get-AuthInfoFromConfiguration -Configuration $Configuration
        
        if (-not $authInfo) {
            Write-SharePointLog -Level "ERROR" -Message "No authentication found in configuration" -Context $Context
            $result.AddError("Authentication information could not be found in the provided configuration.", $null, $null)
            return $result
        }
        
        Write-SharePointLog -Level "DEBUG" -Message "Auth info found. ClientId: $($authInfo.ClientId.Substring(0,8))..." -Context $Context

        # Connect to Microsoft Graph
        try {
            Write-SharePointLog -Level "INFO" -Message "Connecting to Microsoft Graph..." -Context $Context
            $secureSecret = ConvertTo-SecureString $authInfo.ClientSecret -AsPlainText -Force
            Connect-MgGraph -ClientId $authInfo.ClientId `
                            -TenantId $authInfo.TenantId `
                            -ClientSecretCredential $secureSecret `
                            -NoWelcome -ErrorAction Stop
            Write-SharePointLog -Level "SUCCESS" -Message "Connected to Microsoft Graph" -Context $Context
        } catch {
            $result.AddError("Failed to connect to Microsoft Graph: $($_.Exception.Message)", $_.Exception, $null)
            return $result
        }

        # 5. PERFORM DISCOVERY
        Write-SharePointLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Get root site URL
        $rootSiteUrl = "https://$tenantName.sharepoint.com"
        Write-SharePointLog -Level "INFO" -Message "SharePoint root URL: $rootSiteUrl" -Context $Context
        
        # Discover all sites
        $sites = @()
        try {
            Write-SharePointLog -Level "INFO" -Message "Discovering SharePoint sites..." -Context $Context
            
            # Get all sites
            $sitesUri = "https://graph.microsoft.com/v1.0/sites?`$top=100"
            
            do {
                $response = Invoke-MgGraphRequest -Uri $sitesUri -Method GET -ErrorAction Stop
                
                foreach ($site in $response.value) {
                    # Get additional site details
                    $siteDetails = $null
                    try {
                        $siteDetailsUri = "https://graph.microsoft.com/v1.0/sites/$($site.id)?`$expand=drive"
                        $siteDetails = Invoke-MgGraphRequest -Uri $siteDetailsUri -Method GET -ErrorAction Stop
                    } catch {
                        Write-SharePointLog -Level "DEBUG" -Message "Could not get details for site $($site.displayName): $_" -Context $Context
                    }
                    
                    $siteObj = [PSCustomObject]@{
                        SiteId = $site.id
                        DisplayName = $site.displayName
                        Name = $site.name
                        WebUrl = $site.webUrl
                        Description = $site.description
                        CreatedDateTime = $site.createdDateTime
                        LastModifiedDateTime = $site.lastModifiedDateTime
                        # Site collection info
                        IsPersonalSite = ($site.webUrl -like "*/personal/*")
                        SiteCollectionHostname = if ($site.siteCollection) { $site.siteCollection.hostname } else { $null }
                        Root = if ($site.root) { $true } else { $false }
                        # Storage info from drive
                        StorageUsedGB = if ($siteDetails -and $siteDetails.drive -and $siteDetails.drive.quota) { 
                            [Math]::Round($siteDetails.drive.quota.used / 1GB, 2) 
                        } else { $null }
                        StorageQuotaGB = if ($siteDetails -and $siteDetails.drive -and $siteDetails.drive.quota) { 
                            [Math]::Round($siteDetails.drive.quota.total / 1GB, 2) 
                        } else { $null }
                        StoragePercentUsed = if ($siteDetails -and $siteDetails.drive -and $siteDetails.drive.quota -and $siteDetails.drive.quota.total -gt 0) { 
                            [Math]::Round(($siteDetails.drive.quota.used / $siteDetails.drive.quota.total) * 100, 2) 
                        } else { $null }
                        DriveId = if ($siteDetails -and $siteDetails.drive) { $siteDetails.drive.id } else { $null }
                        _DataType = 'Site'
                    }
                    
                    $sites += $siteObj
                    $null = $allDiscoveredData.Add($siteObj)
                    
                    Write-SharePointLog -Level "DEBUG" -Message "Discovered site: $($site.displayName)" -Context $Context
                }
                
                $sitesUri = $response.'@odata.nextLink'
            } while ($sitesUri)
            
            Write-SharePointLog -Level "SUCCESS" -Message "Discovered $($sites.Count) SharePoint sites" -Context $Context
            
        } catch {
            $result.AddWarning("Failed to discover sites: $($_.Exception.Message)", @{Section="Sites"})
        }
        
        # Discover Lists and Libraries for each site
        if ($includeLists -or $includeLibraries) {
            $totalLists = 0
            $processedSites = 0
            
            foreach ($site in $sites) {
                $processedSites++
                
                # Skip personal sites for performance
                if ($site.IsPersonalSite) {
                    Write-SharePointLog -Level "DEBUG" -Message "Skipping personal site: $($site.DisplayName)" -Context $Context
                    continue
                }
                
                try {
                    Write-SharePointLog -Level "DEBUG" -Message "Getting lists for site: $($site.DisplayName)" -Context $Context
                    
                    $listsUri = "https://graph.microsoft.com/v1.0/sites/$($site.SiteId)/lists?`$top=$maxListsPerSite"
                    $listsResponse = Invoke-MgGraphRequest -Uri $listsUri -Method GET -ErrorAction Stop
                    
                    foreach ($list in $listsResponse.value) {
                        # Determine if it's a list or library
                        $listType = 'List'
                        if ($list.list -and $list.list.template -eq 'documentLibrary') {
                            $listType = 'DocumentLibrary'
                        }
                        
                        # Skip if not including this type
                        if (($listType -eq 'List' -and -not $includeLists) -or
                            ($listType -eq 'DocumentLibrary' -and -not $includeLibraries)) {
                            continue
                        }
                        
                        $listObj = [PSCustomObject]@{
                            SiteId = $site.SiteId
                            SiteDisplayName = $site.DisplayName
                            SiteWebUrl = $site.WebUrl
                            ListId = $list.id
                            DisplayName = $list.displayName
                            Description = $list.description
                            ListType = $listType
                            WebUrl = $list.webUrl
                            CreatedDateTime = $list.createdDateTime
                            LastModifiedDateTime = $list.lastModifiedDateTime
                            CreatedBy = if ($list.createdBy -and $list.createdBy.user) { 
                                $list.createdBy.user.displayName 
                            } else { $null }
                            Template = if ($list.list) { $list.list.template } else { $null }
                            Hidden = if ($list.list) { $list.list.hidden } else { $null }
                            ItemCount = if ($list.list -and $list.list.itemCount) { $list.list.itemCount } else { 0 }
                            _DataType = 'List'
                        }
                        
                        $totalLists++
                        $null = $allDiscoveredData.Add($listObj)
                    }
                    
                    # Report progress
                    if ($processedSites % 10 -eq 0) {
                        Write-SharePointLog -Level "DEBUG" -Message "Processed $processedSites/$($sites.Count) sites for lists..." -Context $Context
                    }
                    
                    # Small delay to avoid throttling
                    if ($processedSites % 5 -eq 0) {
                        Start-Sleep -Milliseconds 500
                    }
                    
                } catch {
                    Write-SharePointLog -Level "DEBUG" -Message "Could not get lists for site $($site.DisplayName): $_" -Context $Context
                }
            }
            
            Write-SharePointLog -Level "SUCCESS" -Message "Discovered $totalLists lists/libraries across $processedSites sites" -Context $Context
        }
        
        # Discover Site Permissions (if enabled)
        if ($includePermissions) {
            $totalPermissions = 0
            
            foreach ($site in $sites | Select-Object -First 50) { # Limit to first 50 sites for performance
                try {
                    Write-SharePointLog -Level "DEBUG" -Message "Getting permissions for site: $($site.DisplayName)" -Context $Context
                    
                    $permUri = "https://graph.microsoft.com/v1.0/sites/$($site.SiteId)/permissions"
                    $permResponse = Invoke-MgGraphRequest -Uri $permUri -Method GET -ErrorAction Stop
                    
                    foreach ($perm in $permResponse.value) {
                        $permObj = [PSCustomObject]@{
                            SiteId = $site.SiteId
                            SiteDisplayName = $site.DisplayName
                            PermissionId = $perm.id
                            Roles = ($perm.roles -join ';')
                            GrantedToType = if ($perm.grantedTo) { 'User' } elseif ($perm.grantedToIdentities) { 'Multiple' } else { 'Unknown' }
                            GrantedTo = if ($perm.grantedTo -and $perm.grantedTo.user) { 
                                $perm.grantedTo.user.displayName 
                            } else { $null }
                            GrantedToEmail = if ($perm.grantedTo -and $perm.grantedTo.user) { 
                                $perm.grantedTo.user.email 
                            } else { $null }
                            HasPassword = $perm.hasPassword
                            ShareId = $perm.shareId
                            _DataType = 'SitePermission'
                        }
                        
                        $totalPermissions++
                        $null = $allDiscoveredData.Add($permObj)
                    }
                    
                } catch {
                    Write-SharePointLog -Level "DEBUG" -Message "Could not get permissions for site $($site.DisplayName): $_" -Context $Context
                }
            }
            
            if ($totalPermissions -gt 0) {
                Write-SharePointLog -Level "SUCCESS" -Message "Discovered $totalPermissions site permissions" -Context $Context
            }
        }
        
        # Discover Hub Sites (if enabled)
        if ($includeHubSites) {
            try {
                Write-SharePointLog -Level "INFO" -Message "Discovering hub sites..." -Context $Context
                
                # Hub sites require admin endpoint - try to get them
                $adminSiteId = "https://$tenantName-admin.sharepoint.com,,$((New-Guid).ToString())"
                $hubsUri = "https://graph.microsoft.com/v1.0/sites/$adminSiteId/lists('HubSites')/items"
                
                try {
                    $hubsResponse = Invoke-MgGraphRequest -Uri $hubsUri -Method GET -ErrorAction Stop
                    
                    foreach ($hub in $hubsResponse.value) {
                        $hubObj = [PSCustomObject]@{
                            HubSiteId = $hub.id
                            Title = if ($hub.fields) { $hub.fields.Title } else { $null }
                            SiteUrl = if ($hub.fields) { $hub.fields.SiteUrl } else { $null }
                            _DataType = 'HubSite'
                        }
                        
                        $null = $allDiscoveredData.Add($hubObj)
                    }
                    
                    Write-SharePointLog -Level "SUCCESS" -Message "Discovered $($hubsResponse.value.Count) hub sites" -Context $Context
                    
                } catch {
                    Write-SharePointLog -Level "DEBUG" -Message "Could not access hub sites (requires admin): $_" -Context $Context
                }
                
            } catch {
                $result.AddWarning("Failed to discover hub sites: $($_.Exception.Message)", @{Section="HubSites"})
            }
        }
        
        # Discover Site Collection Administrators (if enabled)
        if ($includeSiteCollectionAdmins) {
            $totalAdmins = 0
            
            foreach ($site in $sites | Where-Object { -not $_.IsPersonalSite } | Select-Object -First 20) {
                try {
                    # Get site owners (approximation of admins via Graph API)
                    $ownersUri = "https://graph.microsoft.com/v1.0/sites/$($site.SiteId)/drive/root/permissions"
                    $ownersResponse = Invoke-MgGraphRequest -Uri $ownersUri -Method GET -ErrorAction Stop
                    
                    foreach ($owner in $ownersResponse.value | Where-Object { $_.roles -contains 'owner' }) {
                        if ($owner.grantedTo -and $owner.grantedTo.user) {
                            $adminObj = [PSCustomObject]@{
                                SiteId = $site.SiteId
                                SiteDisplayName = $site.DisplayName
                                SiteWebUrl = $site.WebUrl
                                UserId = $owner.grantedTo.user.id
                                UserDisplayName = $owner.grantedTo.user.displayName
                                UserEmail = $owner.grantedTo.user.email
                                Role = 'SiteOwner'
                                _DataType = 'SiteAdmin'
                            }
                            
                            $totalAdmins++
                            $null = $allDiscoveredData.Add($adminObj)
                        }
                    }
                    
                } catch {
                    Write-SharePointLog -Level "DEBUG" -Message "Could not get admins for site $($site.DisplayName): $_" -Context $Context
                }
            }
            
            if ($totalAdmins -gt 0) {
                Write-SharePointLog -Level "SUCCESS" -Message "Discovered $totalAdmins site administrators" -Context $Context
            }
        }

        # 6. EXPORT DATA TO CSV
        if ($allDiscoveredData.Count -gt 0) {
            Write-SharePointLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            
            # Group by data type and export
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $data = $group.Group
                
                # Add metadata
                $data | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "SharePoint" -Force
                }
                
                # Determine filename - MUST match orchestrator expectations
                $fileName = switch ($dataType) {
                    'Site' { 'SharePointSites.csv' }
                    'List' { 'SharePointLists.csv' }
                    'SitePermission' { 'SharePointSitePermissions.csv' }
                    'HubSite' { 'SharePointHubSites.csv' }
                    'SiteAdmin' { 'SharePointSiteAdmins.csv' }
                    default { "SharePoint_$dataType.csv" }
                }
                
                $filePath = Join-Path $outputPath $fileName
                $data | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                
                Write-SharePointLog -Level "SUCCESS" -Message "Exported $($data.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-SharePointLog -Level "WARN" -Message "No data discovered to export" -Context $Context
        }

        # 7. FINALIZE METADATA
        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        $result.Metadata["SiteCount"] = $sites.Count
        $result.Metadata["ListCount"] = ($allDiscoveredData | Where-Object { $_._DataType -eq 'List' }).Count
        $result.Metadata["TenantName"] = $tenantName

    } catch {
        # Top-level error handler
        Write-SharePointLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        # 8. CLEANUP & COMPLETE
        Write-SharePointLog -Level "INFO" -Message "Cleaning up..." -Context $Context
        
        # Disconnect from services
        Disconnect-MgGraph -ErrorAction SilentlyContinue
        
        $stopwatch.Stop()
        $result.Complete()
        Write-SharePointLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
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
Export-ModuleMember -Function Invoke-SharePointDiscovery