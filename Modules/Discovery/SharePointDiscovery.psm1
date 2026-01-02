# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Import required modules
Import-Module (Join-Path $PSScriptRoot "..\Authentication\AuthenticationService.psm1") -Force

# Author: Lukian Poleschtschuk
# Version: 2.0.0
# Created: 2025-01-18
# Last Modified: 2026-01-02

<#
.SYNOPSIS
    SharePoint Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers SharePoint sites, libraries, lists, and permissions using Microsoft Graph API. This module provides 
    comprehensive SharePoint Online discovery including site collections, document libraries, list configurations, 
    permission structures, and content analysis essential for M&A SharePoint environment assessment and migration planning.
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
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-SharePointLog -Level "HEADER" -Message "Starting Discovery (v4.0 - Clean Session Auth)" -Context $Context
    Write-SharePointLog -Level "INFO" -Message "Using authentication session: $SessionId" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # 1. INITIALIZE RESULT OBJECT
    # Ensure ClassDefinitions module is loaded
    try {
        if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
            Import-Module -Name "$PSScriptRoot\..\Core\ClassDefinitions.psm1" -Force -ErrorAction Stop
        }
        $result = [DiscoveryResult]::new('SharePoint')
    } catch {
        Write-SharePointLog -Level "ERROR" -Message "Failed to load DiscoveryResult class: $($_.Exception.Message)" -Context $Context
        throw "Critical error: Cannot load required DiscoveryResult class. Discovery cannot proceed."
    }

    try {
        # 2. VALIDATE CREDENTIALS FROM CONFIGURATION
        Write-SharePointLog -Level "INFO" -Message "Validating credentials from Configuration..." -Context $Context

        # Check if Configuration contains the required credential properties
        $hasCredentials = $false
        $credentialSource = "None"

        if ($Configuration.TenantId -and $Configuration.ClientId -and $Configuration.ClientSecret) {
            $hasCredentials = $true
            $credentialSource = "Configuration (Root Level)"
            Write-SharePointLog -Level "SUCCESS" -Message "Found credentials at root level of Configuration" -Context $Context
            Write-SharePointLog -Level "DEBUG" -Message "TenantId: $($Configuration.TenantId)" -Context $Context
            Write-SharePointLog -Level "DEBUG" -Message "ClientId: $($Configuration.ClientId)" -Context $Context
            Write-SharePointLog -Level "DEBUG" -Message "ClientSecret: [REDACTED - Length: $($Configuration.ClientSecret.Length)]" -Context $Context
        }
        elseif ($Configuration.Credentials -and
                $Configuration.Credentials.TenantId -and
                $Configuration.Credentials.ClientId -and
                $Configuration.Credentials.ClientSecret) {
            $hasCredentials = $true
            $credentialSource = "Configuration.Credentials"
            Write-SharePointLog -Level "SUCCESS" -Message "Found credentials in Configuration.Credentials" -Context $Context
            Write-SharePointLog -Level "DEBUG" -Message "TenantId: $($Configuration.Credentials.TenantId)" -Context $Context
            Write-SharePointLog -Level "DEBUG" -Message "ClientId: $($Configuration.Credentials.ClientId)" -Context $Context
            Write-SharePointLog -Level "DEBUG" -Message "ClientSecret: [REDACTED - Length: $($Configuration.Credentials.ClientSecret.Length)]" -Context $Context
        }
        else {
            Write-SharePointLog -Level "WARN" -Message "No credentials found in Configuration object" -Context $Context
            Write-SharePointLog -Level "DEBUG" -Message "Configuration.TenantId present: $($null -ne $Configuration.TenantId)" -Context $Context
            Write-SharePointLog -Level "DEBUG" -Message "Configuration.ClientId present: $($null -ne $Configuration.ClientId)" -Context $Context
            Write-SharePointLog -Level "DEBUG" -Message "Configuration.ClientSecret present: $($null -ne $Configuration.ClientSecret)" -Context $Context
            Write-SharePointLog -Level "DEBUG" -Message "Configuration.Credentials present: $($null -ne $Configuration.Credentials)" -Context $Context

            if ($Configuration.Credentials) {
                Write-SharePointLog -Level "DEBUG" -Message "Configuration.Credentials.TenantId present: $($null -ne $Configuration.Credentials.TenantId)" -Context $Context
                Write-SharePointLog -Level "DEBUG" -Message "Configuration.Credentials.ClientId present: $($null -ne $Configuration.Credentials.ClientId)" -Context $Context
                Write-SharePointLog -Level "DEBUG" -Message "Configuration.Credentials.ClientSecret present: $($null -ne $Configuration.Credentials.ClientSecret)" -Context $Context
            }
        }

        Write-SharePointLog -Level "INFO" -Message "Credential Status: Available=$hasCredentials, Source=$credentialSource" -Context $Context

        # 3. VALIDATE PREREQUISITES & CONTEXT
        Write-SharePointLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context

        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-SharePointLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context

        Ensure-Path -Path $outputPath

        # 4. AUTHENTICATE & CONNECT (DIRECT ACCESS TOKEN)
        Write-SharePointLog -Level "HEADER" -Message "=== AUTHENTICATION PHASE ===" -Context $Context
        Write-SharePointLog -Level "INFO" -Message "Using Direct Access Token Authentication" -Context $Context

        $graphContext = $null
        try {
            # Get access token using OAuth2 client credentials flow
            Write-SharePointLog -Level "DEBUG" -Message "Requesting access token from Microsoft Identity Platform..." -Context $Context
            $tokenBody = @{
                grant_type    = "client_credentials"
                client_id     = $Configuration.ClientId
                client_secret = $Configuration.ClientSecret
                scope         = "https://graph.microsoft.com/.default"
            }

            $tokenUri = "https://login.microsoftonline.com/$($Configuration.TenantId)/oauth2/v2.0/token"
            $tokenResponse = Invoke-RestMethod -Uri $tokenUri -Method POST -Body $tokenBody -ContentType "application/x-www-form-urlencoded" -ErrorAction Stop

            if ($tokenResponse.access_token) {
                Write-SharePointLog -Level "SUCCESS" -Message "Access token acquired successfully" -Context $Context

                # Create custom context object with the access token
                # This bypasses Connect-MgGraph entirely due to version compatibility issues
                $graphContext = [PSCustomObject]@{
                    AccessToken = $tokenResponse.access_token
                    TenantId    = $Configuration.TenantId
                    ClientId    = $Configuration.ClientId
                    TokenType   = "Bearer"
                    ExpiresOn   = (Get-Date).AddSeconds($tokenResponse.expires_in)
                    Scopes      = @("https://graph.microsoft.com/.default")
                    IsCustom    = $true  # Flag to indicate this is our custom context
                }

                # Validate the connection using direct REST API call
                Write-SharePointLog -Level "INFO" -Message "Validating Graph connection..." -Context $Context
                $testUri = "https://graph.microsoft.com/v1.0/organization"
                $authHeaders = @{
                    "Authorization" = "Bearer $($graphContext.AccessToken)"
                    "Content-Type"  = "application/json"
                }
                $testResponse = Invoke-RestMethod -Uri $testUri -Method GET -Headers $authHeaders -ErrorAction Stop

                if (-not $testResponse) {
                    throw "Graph connection test failed - no response"
                }

                Write-SharePointLog -Level "SUCCESS" -Message "Graph connection validated successfully" -Context $Context
                Write-SharePointLog -Level "SUCCESS" -Message "Connected to Microsoft Graph via direct access token" -Context $Context

                # Log organization details for confirmation
                if ($testResponse.value -and $testResponse.value.Count -gt 0) {
                    $org = $testResponse.value[0]
                    Write-SharePointLog -Level "INFO" -Message "Connected to tenant: $($org.displayName)" -Context $Context
                    Write-SharePointLog -Level "DEBUG" -Message "Tenant ID from API: $($org.id)" -Context $Context
                }

                Write-SharePointLog -Level "HEADER" -Message "=== AUTHENTICATION SUCCESSFUL ===" -Context $Context
            } else {
                throw "No access token in response"
            }

        } catch {
            Write-SharePointLog -Level "ERROR" -Message "Graph authentication validation failed" -Context $Context
            Write-SharePointLog -Level "ERROR" -Message "Error: $($_.Exception.Message)" -Context $Context
            Write-SharePointLog -Level "DEBUG" -Message "Error details: $($_.Exception | Format-List * | Out-String)" -Context $Context
            $result.AddError("Graph authentication validation failed: $($_.Exception.Message)", $_.Exception, $null)
            return $result
        }

        # 5. VALIDATE MODULE-SPECIFIC CONFIGURATION & TENANT DETECTION
        # SharePoint MUST have tenant name
        if (-not $Configuration.discovery -or
            -not $Configuration.discovery.sharepoint -or
            -not $Configuration.discovery.sharepoint.tenantName) {

            # Enhanced tenant auto-detection using multiple methods (inspired by AzureHound approach)
            try {
                Write-SharePointLog -Level "INFO" -Message "Tenant name not configured, attempting enhanced auto-detection..." -Context $Context

                $tenantDetected = $false
                $detectionMethods = @()

                # Method 1: Get organization information
                try {
                    Write-SharePointLog -Level "DEBUG" -Message "Attempting detection via organization data..." -Context $Context
                    $org = Get-MgOrganization -ErrorAction Stop
                    if ($org -and $org.VerifiedDomains) {
                        $defaultDomain = ($org.VerifiedDomains | Where-Object { $_.IsDefault }).Name
                        $tenantName = $defaultDomain -replace '\.onmicrosoft\.com$', ''
                        $detectionMethods += "Organization Default Domain"
                        $tenantDetected = $true
                        Write-SharePointLog -Level "SUCCESS" -Message "Detected tenant via organization: $tenantName" -Context $Context
                    }
                } catch {
                    Write-SharePointLog -Level "DEBUG" -Message "Organization method failed: $($_.Exception.Message)" -Context $Context
                }

                # Method 2: Try to get domains list (fallback)
                if (-not $tenantDetected) {
                    try {
                        Write-SharePointLog -Level "DEBUG" -Message "Attempting detection via domains list..." -Context $Context
                        $domains = Invoke-CustomGraphRequest -Uri "https://graph.microsoft.com/v1.0/domains" -Method GET -GraphContext $graphContext -ErrorAction Stop
                        if ($domains -and $domains.value) {
                            $onMicrosoftDomain = $domains.value | Where-Object { $_.id -like "*.onmicrosoft.com" -and $_.isDefault } | Select-Object -First 1
                            if ($onMicrosoftDomain) {
                                $tenantName = $onMicrosoftDomain.id -replace '\.onmicrosoft\.com$', ''
                                $detectionMethods += "Domains API"
                                $tenantDetected = $true
                                Write-SharePointLog -Level "SUCCESS" -Message "Detected tenant via domains API: $tenantName" -Context $Context
                            }
                        }
                    } catch {
                        Write-SharePointLog -Level "DEBUG" -Message "Domains API method failed: $($_.Exception.Message)" -Context $Context
                    }
                }

                # Method 3: Try SharePoint root site discovery (advanced method)
                if (-not $tenantDetected) {
                    try {
                        Write-SharePointLog -Level "DEBUG" -Message "Attempting detection via SharePoint sites..." -Context $Context
                        $sites = Invoke-CustomGraphRequest -Uri "https://graph.microsoft.com/v1.0/sites?`$top=1" -Method GET -GraphContext $graphContext -ErrorAction Stop
                        if ($sites -and $sites.value -and $sites.value.Count -gt 0) {
                            $siteUrl = $sites.value[0].webUrl
                            if ($siteUrl -match "https://([^\.]+)\.sharepoint\.com") {
                                $tenantName = $matches[1]
                                $detectionMethods += "SharePoint Sites Discovery"
                                $tenantDetected = $true
                                Write-SharePointLog -Level "SUCCESS" -Message "Detected tenant via SharePoint sites: $tenantName" -Context $Context
                            }
                        }
                    } catch {
                        Write-SharePointLog -Level "DEBUG" -Message "SharePoint sites method failed: $($_.Exception.Message)" -Context $Context
                    }
                }

                # Method 4: Try via user profile (last resort)
                if (-not $tenantDetected) {
                    try {
                        Write-SharePointLog -Level "DEBUG" -Message "Attempting detection via user profile..." -Context $Context
                        $me = Get-MgUser -UserId (Get-MgContext).Account -ErrorAction Stop
                        if ($me.UserPrincipalName -match "@([^\.]+)\.onmicrosoft\.com") {
                            $tenantName = $matches[1]
                            $detectionMethods += "User Profile"
                            $tenantDetected = $true
                            Write-SharePointLog -Level "SUCCESS" -Message "Detected tenant via user profile: $tenantName" -Context $Context
                        }
                    } catch {
                        Write-SharePointLog -Level "DEBUG" -Message "User profile method failed: $($_.Exception.Message)" -Context $Context
                    }
                }

                if (-not $tenantDetected) {
                    $result.AddError("SharePoint tenant name not configured and enhanced auto-detection failed using all methods", $null, $null)
                    return $result
                } else {
                    Write-SharePointLog -Level "SUCCESS" -Message "Successfully auto-detected tenant '$tenantName' using methods: $($detectionMethods -join ', ')" -Context $Context
                }

            } catch {
                $result.AddError("SharePoint tenant auto-detection failed with error: $($_.Exception.Message)", $null, $null)
                return $result
            }
        } else {
            $tenantName = $Configuration.discovery.sharepoint.tenantName
        }

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

        # 6. PERFORM DISCOVERY
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
                $response = Invoke-CustomGraphRequest -Uri $sitesUri -Method GET -GraphContext $graphContext -ErrorAction Stop
                
                foreach ($site in $response.value) {
                    # Get additional site details
                    $siteDetails = $null
                    try {
                        $siteDetailsUri = "https://graph.microsoft.com/v1.0/sites/$($site.id)?`$expand=drive"
                        $siteDetails = Invoke-CustomGraphRequest -Uri $siteDetailsUri -Method GET -GraphContext $graphContext -ErrorAction Stop
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
                    $listsResponse = Invoke-CustomGraphRequest -Uri $listsUri -Method GET -GraphContext $graphContext -ErrorAction Stop
                    
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

        # =====================================================================
        # PHASE 2: MIGRATION-CRITICAL DATA DISCOVERY (v2.0.0)
        # =====================================================================

        # --- Discover Site Permissions ---
        if ($includePermissions) {
            Write-SharePointLog -Level "HEADER" -Message "=== PERMISSIONS DISCOVERY ===" -Context $Context
            $totalPermissions = 0
            $processedSitesForPerms = 0

            foreach ($site in $sites) {
                $processedSitesForPerms++

                # Skip personal sites for performance
                if ($site.IsPersonalSite) { continue }

                try {
                    Write-SharePointLog -Level "DEBUG" -Message "Getting permissions for site: $($site.DisplayName)" -Context $Context

                    # Get site permissions via Graph API
                    $permsUri = "https://graph.microsoft.com/v1.0/sites/$($site.SiteId)/permissions"
                    $permsResponse = Invoke-CustomGraphRequest -Uri $permsUri -Method GET -GraphContext $graphContext -ErrorAction SilentlyContinue

                    if ($permsResponse -and $permsResponse.value) {
                        foreach ($perm in $permsResponse.value) {
                            $permObj = [PSCustomObject]@{
                                SiteId = $site.SiteId
                                SiteDisplayName = $site.DisplayName
                                SiteWebUrl = $site.WebUrl
                                PermissionId = $perm.id
                                Roles = ($perm.roles -join ', ')
                                GrantedToType = if ($perm.grantedToV2.user) { 'User' }
                                               elseif ($perm.grantedToV2.group) { 'Group' }
                                               elseif ($perm.grantedToV2.application) { 'Application' }
                                               else { 'Unknown' }
                                GrantedToId = if ($perm.grantedToV2.user) { $perm.grantedToV2.user.id }
                                             elseif ($perm.grantedToV2.group) { $perm.grantedToV2.group.id }
                                             elseif ($perm.grantedToV2.application) { $perm.grantedToV2.application.id }
                                             else { $null }
                                GrantedToDisplayName = if ($perm.grantedToV2.user) { $perm.grantedToV2.user.displayName }
                                                      elseif ($perm.grantedToV2.group) { $perm.grantedToV2.group.displayName }
                                                      elseif ($perm.grantedToV2.application) { $perm.grantedToV2.application.displayName }
                                                      else { $null }
                                GrantedToEmail = if ($perm.grantedToV2.user) { $perm.grantedToV2.user.email } else { $null }
                                IsInherited = $perm.inheritedFrom -ne $null
                                InheritedFrom = if ($perm.inheritedFrom) { $perm.inheritedFrom.id } else { $null }
                                _DataType = 'SitePermission'
                            }

                            $totalPermissions++
                            $null = $allDiscoveredData.Add($permObj)
                        }
                    }

                    # Small delay to avoid throttling
                    if ($processedSitesForPerms % 5 -eq 0) {
                        Start-Sleep -Milliseconds 300
                    }

                } catch {
                    Write-SharePointLog -Level "DEBUG" -Message "Could not get permissions for site $($site.DisplayName): $_" -Context $Context
                }
            }

            Write-SharePointLog -Level "SUCCESS" -Message "Discovered $totalPermissions permission entries across $processedSitesForPerms sites" -Context $Context
        }

        # --- Discover External Sharing Links ---
        Write-SharePointLog -Level "HEADER" -Message "=== EXTERNAL SHARING DISCOVERY ===" -Context $Context
        $totalSharingLinks = 0
        $sitesWithExternalSharing = 0

        foreach ($site in $sites) {
            # Skip personal sites
            if ($site.IsPersonalSite) { continue }
            if (-not $site.DriveId) { continue }

            try {
                # Get sharing links from the default document library
                $sharingUri = "https://graph.microsoft.com/v1.0/drives/$($site.DriveId)/sharedWithMe"
                $sharingResponse = Invoke-CustomGraphRequest -Uri $sharingUri -Method GET -GraphContext $graphContext -ErrorAction SilentlyContinue

                # Also try to get sharing permissions on the root
                $rootPermsUri = "https://graph.microsoft.com/v1.0/sites/$($site.SiteId)/drive/root/permissions"
                $rootPermsResponse = Invoke-CustomGraphRequest -Uri $rootPermsUri -Method GET -GraphContext $graphContext -ErrorAction SilentlyContinue

                if ($rootPermsResponse -and $rootPermsResponse.value) {
                    $hasExternal = $false
                    foreach ($perm in $rootPermsResponse.value) {
                        # Check for link-based sharing (anonymous or anyone links)
                        if ($perm.link) {
                            $linkObj = [PSCustomObject]@{
                                SiteId = $site.SiteId
                                SiteDisplayName = $site.DisplayName
                                SiteWebUrl = $site.WebUrl
                                PermissionId = $perm.id
                                LinkType = $perm.link.type  # view, edit, embed
                                LinkScope = $perm.link.scope  # anonymous, organization, users
                                LinkWebUrl = $perm.link.webUrl
                                ExpirationDateTime = $perm.expirationDateTime
                                HasPassword = $perm.link.password -ne $null
                                IsAnonymous = $perm.link.scope -eq 'anonymous'
                                IsOrganization = $perm.link.scope -eq 'organization'
                                CreatedDateTime = $perm.createdDateTime
                                _DataType = 'SharingLink'
                            }

                            $totalSharingLinks++
                            $null = $allDiscoveredData.Add($linkObj)

                            if ($perm.link.scope -eq 'anonymous') {
                                $hasExternal = $true
                            }
                        }

                        # Check for external user access
                        if ($perm.grantedToV2 -and $perm.grantedToV2.user -and
                            $perm.grantedToV2.user.email -and
                            $perm.grantedToV2.user.email -notlike "*@$tenantName*") {
                            $hasExternal = $true
                        }
                    }

                    if ($hasExternal) {
                        $sitesWithExternalSharing++
                    }
                }

            } catch {
                Write-SharePointLog -Level "DEBUG" -Message "Could not get sharing info for site $($site.DisplayName): $_" -Context $Context
            }
        }

        Write-SharePointLog -Level "SUCCESS" -Message "Discovered $totalSharingLinks sharing links, $sitesWithExternalSharing sites with external sharing" -Context $Context

        # --- Discover Content Types ---
        Write-SharePointLog -Level "HEADER" -Message "=== CONTENT TYPES DISCOVERY ===" -Context $Context
        $totalContentTypes = 0
        $customContentTypes = 0

        foreach ($site in $sites) {
            # Skip personal sites
            if ($site.IsPersonalSite) { continue }

            try {
                Write-SharePointLog -Level "DEBUG" -Message "Getting content types for site: $($site.DisplayName)" -Context $Context

                $ctUri = "https://graph.microsoft.com/v1.0/sites/$($site.SiteId)/contentTypes"
                $ctResponse = Invoke-CustomGraphRequest -Uri $ctUri -Method GET -GraphContext $graphContext -ErrorAction SilentlyContinue

                if ($ctResponse -and $ctResponse.value) {
                    foreach ($ct in $ctResponse.value) {
                        # Check if it's a custom content type (not built-in)
                        $isCustom = -not ($ct.isBuiltIn -eq $true)

                        $ctObj = [PSCustomObject]@{
                            SiteId = $site.SiteId
                            SiteDisplayName = $site.DisplayName
                            SiteWebUrl = $site.WebUrl
                            ContentTypeId = $ct.id
                            Name = $ct.name
                            Description = $ct.description
                            Group = $ct.group
                            IsBuiltIn = $ct.isBuiltIn
                            IsCustom = $isCustom
                            Hidden = $ct.hidden
                            ReadOnly = $ct.readOnly
                            Sealed = $ct.sealed
                            ParentId = if ($ct.parentId) { $ct.parentId } else { $null }
                            _DataType = 'ContentType'
                        }

                        $totalContentTypes++
                        if ($isCustom) { $customContentTypes++ }
                        $null = $allDiscoveredData.Add($ctObj)
                    }
                }

            } catch {
                Write-SharePointLog -Level "DEBUG" -Message "Could not get content types for site $($site.DisplayName): $_" -Context $Context
            }
        }

        Write-SharePointLog -Level "SUCCESS" -Message "Discovered $totalContentTypes content types ($customContentTypes custom)" -Context $Context

        # --- Discover Hub Sites ---
        if ($includeHubSites) {
            Write-SharePointLog -Level "HEADER" -Message "=== HUB SITES DISCOVERY ===" -Context $Context
            $hubSiteCount = 0

            try {
                # Get hub sites - requires SharePoint Admin access
                # Using the sites search with hub filter
                $hubUri = "https://graph.microsoft.com/v1.0/sites?`$filter=isHubSite eq true&`$top=100"
                $hubResponse = Invoke-CustomGraphRequest -Uri $hubUri -Method GET -GraphContext $graphContext -ErrorAction SilentlyContinue

                if ($hubResponse -and $hubResponse.value) {
                    foreach ($hub in $hubResponse.value) {
                        $hubObj = [PSCustomObject]@{
                            SiteId = $hub.id
                            DisplayName = $hub.displayName
                            WebUrl = $hub.webUrl
                            Description = $hub.description
                            IsHubSite = $true
                            HubSiteId = $hub.id  # Hub sites are their own hub
                            CreatedDateTime = $hub.createdDateTime
                            _DataType = 'HubSite'
                        }

                        $hubSiteCount++
                        $null = $allDiscoveredData.Add($hubObj)
                    }
                }

                Write-SharePointLog -Level "SUCCESS" -Message "Discovered $hubSiteCount hub sites" -Context $Context

            } catch {
                Write-SharePointLog -Level "DEBUG" -Message "Hub sites discovery not available: $_" -Context $Context
            }
        }

        # --- Discover Site Collection Admins ---
        if ($includeSiteCollectionAdmins) {
            Write-SharePointLog -Level "HEADER" -Message "=== SITE ADMINS DISCOVERY ===" -Context $Context
            $totalAdmins = 0

            foreach ($site in $sites) {
                # Skip personal sites
                if ($site.IsPersonalSite) { continue }

                try {
                    # Get site owners (closest to site collection admins via Graph)
                    $ownersUri = "https://graph.microsoft.com/v1.0/sites/$($site.SiteId)/permissions?`$filter=roles/any(r:r eq 'owner')"
                    $ownersResponse = Invoke-CustomGraphRequest -Uri $ownersUri -Method GET -GraphContext $graphContext -ErrorAction SilentlyContinue

                    if ($ownersResponse -and $ownersResponse.value) {
                        foreach ($owner in $ownersResponse.value) {
                            $adminObj = [PSCustomObject]@{
                                SiteId = $site.SiteId
                                SiteDisplayName = $site.DisplayName
                                SiteWebUrl = $site.WebUrl
                                AdminType = 'SiteOwner'
                                UserId = if ($owner.grantedToV2.user) { $owner.grantedToV2.user.id } else { $null }
                                DisplayName = if ($owner.grantedToV2.user) { $owner.grantedToV2.user.displayName }
                                             elseif ($owner.grantedToV2.group) { $owner.grantedToV2.group.displayName }
                                             else { 'Unknown' }
                                Email = if ($owner.grantedToV2.user) { $owner.grantedToV2.user.email } else { $null }
                                PrincipalType = if ($owner.grantedToV2.user) { 'User' }
                                               elseif ($owner.grantedToV2.group) { 'Group' }
                                               else { 'Unknown' }
                                Roles = ($owner.roles -join ', ')
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

            Write-SharePointLog -Level "SUCCESS" -Message "Discovered $totalAdmins site administrators/owners" -Context $Context
        }

        # 7. PREPARE DATA GROUPS FOR ORCHESTRATOR & EXPORT
        if ($allDiscoveredData.Count -gt 0) {
            Write-SharePointLog -Level "INFO" -Message "Preparing $($allDiscoveredData.Count) records for export..." -Context $Context

            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

            # Group by data type
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            $resultGroups = @()

            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $data = $group.Group

                # Determine group name (orchestrator appends .csv)
                $name = switch ($dataType) {
                    'Site' { 'SharePointSites' }
                    'List' { 'SharePointLists' }
                    'SitePermission' { 'SharePointSitePermissions' }
                    'SharingLink' { 'SharePointSharingLinks' }
                    'ContentType' { 'SharePointContentTypes' }
                    'HubSite' { 'SharePointHubSites' }
                    'SiteAdmin' { 'SharePointSiteAdmins' }
                    default { "SharePoint_$dataType" }
                }

                if ($data -and $data.Count -gt 0) {
                    $resultGroups += [PSCustomObject]@{
                        Name = $name
                        Group = $data
                    }
                    Write-SharePointLog -Level "SUCCESS" -Message "Prepared $($data.Count) $dataType records as group '$name'" -Context $Context
                }
            }

            if ($resultGroups.Count -gt 0) {
                $result.Data = $resultGroups
            } else {
                Write-SharePointLog -Level "WARN" -Message "No non-empty data groups to export" -Context $Context
            }
        } else {
            Write-SharePointLog -Level "WARN" -Message "No data discovered to prepare for export" -Context $Context
        }

        # 8. FINALIZE METADATA
        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        $result.Metadata["SiteCount"] = $sites.Count
        $result.Metadata["ListCount"] = ($allDiscoveredData | Where-Object { $_._DataType -eq 'List' }).Count
        $result.Metadata["PermissionCount"] = ($allDiscoveredData | Where-Object { $_._DataType -eq 'SitePermission' }).Count
        $result.Metadata["SharingLinkCount"] = ($allDiscoveredData | Where-Object { $_._DataType -eq 'SharingLink' }).Count
        $result.Metadata["ContentTypeCount"] = ($allDiscoveredData | Where-Object { $_._DataType -eq 'ContentType' }).Count
        $result.Metadata["CustomContentTypeCount"] = ($allDiscoveredData | Where-Object { $_._DataType -eq 'ContentType' -and $_.IsCustom -eq $true }).Count
        $result.Metadata["HubSiteCount"] = ($allDiscoveredData | Where-Object { $_._DataType -eq 'HubSite' }).Count
        $result.Metadata["SiteAdminCount"] = ($allDiscoveredData | Where-Object { $_._DataType -eq 'SiteAdmin' }).Count
        $result.Metadata["TenantName"] = $tenantName
        $result.Metadata["SessionId"] = $SessionId
        $result.Metadata["CredentialSource"] = $credentialSource
        $result.Metadata["AuthenticationMethod"] = "Direct Access Token (Microsoft Graph)"
        $result.Metadata["ModuleVersion"] = "2.0.0"

        # Log authentication summary
        Write-SharePointLog -Level "HEADER" -Message "=== AUTHENTICATION SUMMARY ===" -Context $Context
        Write-SharePointLog -Level "INFO" -Message "Credentials Available: $hasCredentials" -Context $Context
        Write-SharePointLog -Level "INFO" -Message "Credential Source: $credentialSource" -Context $Context
        Write-SharePointLog -Level "INFO" -Message "Authentication Method: Direct Access Token (Microsoft Graph)" -Context $Context
        Write-SharePointLog -Level "INFO" -Message "Session ID: $SessionId" -Context $Context
        Write-SharePointLog -Level "HEADER" -Message "================================" -Context $Context

    }
    catch [System.UnauthorizedAccessException] {
        $result.AddError("Access denied: $($_.Exception.Message)", $_.Exception, @{ErrorType="Authorization"})
        Write-SharePointLog -Level "ERROR" -Message "Authorization error: $($_.Exception.Message)" -Context $Context
    }
    catch [System.Net.WebException] {
        $result.AddError("Network error: $($_.Exception.Message)", $_.Exception, @{ErrorType="Network"})
        Write-SharePointLog -Level "ERROR" -Message "Network error: $($_.Exception.Message)" -Context $Context
    }
    catch {
        $result.AddError("Unexpected error: $($_.Exception.Message)", $_.Exception, @{ErrorType="General"})
        Write-SharePointLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
    }
    finally {
        # 8. CLEANUP & COMPLETE
        Write-SharePointLog -Level "INFO" -Message "Cleaning up..." -Context $Context

        # Disconnect from services (only if using Connect-MgGraph, not custom token)
        if (-not $graphContext.IsCustom) {
            Disconnect-MgGraph -ErrorAction SilentlyContinue
        }
        
        $stopwatch.Stop()
        $result.EndTime = Get-Date
        
        # Ensure RecordCount is properly set
        $result.RecordCount = $allDiscoveredData.Count
        
        Write-SharePointLog -Level $(if($result.Success){"SUCCESS"}else{"ERROR"}) -Message "Discovery completed with $($result.RecordCount) records" -Context $Context
        Write-SharePointLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

# --- Helper Functions ---

function Invoke-CustomGraphRequest {
    <#
    .SYNOPSIS
        Custom Graph API request function that uses direct access token
    .DESCRIPTION
        Makes REST API calls to Microsoft Graph using access token directly,
        bypassing Connect-MgGraph version compatibility issues.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Uri,

        [Parameter(Mandatory=$false)]
        [string]$Method = "GET",

        [Parameter(Mandatory=$true)]
        $GraphContext
    )

    if ($GraphContext.IsCustom -eq $true -and $GraphContext.AccessToken) {
        # Use direct REST API call with access token
        $authHeaders = @{
            "Authorization" = "Bearer $($GraphContext.AccessToken)"
            "Content-Type"  = "application/json"
        }

        $response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $authHeaders -ErrorAction Stop
        return $response
    } else {
        # Fallback to standard Invoke-MgGraphRequest (if using standard auth)
        return Invoke-MgGraphRequest -Uri $Uri -Method $Method -ErrorAction Stop
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
Export-ModuleMember -Function Invoke-SharePointDiscovery


