#Requires -Version 5.1
using namespace System.Collections.Generic
using namespace System.Net

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Stop'

<#
.SYNOPSIS
    Application Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Comprehensive application discovery module that combines Intune, DNS, and internet-based discovery
    to build a complete application catalog for M&A migration planning.
.NOTES
    Version: 1.0.0
    Author: M&A Discovery Suite
    Created: 2025-08-01
    Requires: PowerShell 5.1+, Microsoft.Graph modules
#>

# Import required modules
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force
Import-Module (Join-Path $PSScriptRoot "DiscoveryModuleBase.psm1") -Force

# Global variables for caching
$script:ApplicationCache = @{}
$script:DNSCache = @{}
$script:MetadataCache = @{}
$script:LicenseCache = @{}
$script:SoftwareInventoryCache = @{}

#region Core Application Discovery Functions

<#
.SYNOPSIS
    Extracts Intune application data using Microsoft Graph API
.DESCRIPTION
    Retrieves comprehensive application data from Microsoft Intune including managed apps,
    deployment status, and usage statistics.
#>
function Get-IntuneApplications {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory = $false)]
        [string]$TenantId,
        
        [Parameter(Mandatory = $false)]
        [switch]$IncludeAssignments,
        
        [Parameter(Mandatory = $false)]
        [switch]$IncludeUsageStats
    )
    
    begin {
        Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Starting Intune application discovery..." -Level "INFO"
        $discoveredApps = @()
    }
    
    process {
        try {
            # Ensure Graph authentication
            $authResult = Test-GraphConnection -RequiredScopes @('DeviceManagementApps.Read.All', 'Application.Read.All')
            if (-not $authResult) {
                throw "Failed to authenticate with Microsoft Graph"
            }
            
            # Get managed applications
            $mobileAppsUri = "https://graph.microsoft.com/beta/deviceAppManagement/mobileApps?`$top=999"
            $mobileApps = Invoke-GraphAPIWithPaging -Uri $mobileAppsUri -ModuleName "ApplicationDiscovery"
            
            foreach ($app in $mobileApps) {
                $appData = [PSCustomObject]@{
                    AppId = $app.id
                    Name = $app.displayName
                    Publisher = $app.publisher
                    Version = $app.displayVersion
                    AppType = $app.'@odata.type' -replace '#microsoft.graph.', ''
                    Platform = Get-AppPlatform -ODataType $app.'@odata.type'
                    CreatedDateTime = $app.createdDateTime
                    LastModifiedDateTime = $app.lastModifiedDateTime
                    PublishingState = $app.publishingState
                    AppAvailability = $app.appAvailability
                    BundleId = $app.bundleId
                    PackageIdentityName = $app.packageIdentityName
                    MinimumSupportedOperatingSystem = $app.minimumSupportedOperatingSystem | ConvertTo-Json -Compress
                    InstallSummary = $null
                    Assignments = @()
                    UsageData = $null
                    DiscoverySource = "Intune"
                    DiscoveredAt = Get-Date
                }
                
                # Get installation summary
                try {
                    $installSummaryUri = "https://graph.microsoft.com/beta/deviceAppManagement/mobileApps/$($app.id)/installSummary"
                    $installSummary = Invoke-RestMethod -Uri $installSummaryUri -Headers $script:GraphHeaders -Method Get
                    $appData.InstallSummary = $installSummary
                } catch {
                    Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Could not get install summary for app $($app.displayName): $($_.Exception.Message)" -Level "WARN"
                }
                
                # Get assignments if requested
                if ($IncludeAssignments) {
                    try {
                        $assignmentsUri = "https://graph.microsoft.com/beta/deviceAppManagement/mobileApps/$($app.id)/assignments"
                        $assignments = Invoke-GraphAPIWithPaging -Uri $assignmentsUri -ModuleName "ApplicationDiscovery"
                        $appData.Assignments = $assignments
                    } catch {
                        Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Could not get assignments for app $($app.displayName): $($_.Exception.Message)" -Level "WARN"
                    }
                }
                
                # Get usage statistics if requested
                if ($IncludeUsageStats) {
                    try {
                        $usageUri = "https://graph.microsoft.com/beta/deviceAppManagement/mobileApps/$($app.id)/deviceStatuses"
                        $usageStats = Invoke-GraphAPIWithPaging -Uri $usageUri -ModuleName "ApplicationDiscovery"
                        $appData.UsageData = $usageStats
                    } catch {
                        Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Could not get usage stats for app $($app.displayName): $($_.Exception.Message)" -Level "WARN"
                    }
                }
                
                $discoveredApps += $appData
            }
            
            # Cache results
            $script:ApplicationCache["Intune"] = $discoveredApps
            
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Discovered $($discoveredApps.Count) Intune applications" -Level "SUCCESS"
            return $discoveredApps
            
        } catch {
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Failed to discover Intune applications: $($_.Exception.Message)" -Level "ERROR"
            throw
        }
    }
}

<#
.SYNOPSIS
    Discovers applications through DNS record analysis
.DESCRIPTION
    Analyzes DNS records to identify web applications and services in the environment.
#>
function Get-DNSApplications {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$DomainNames,
        
        [Parameter(Mandatory = $false)]
        [string[]]$DNSServers = @('8.8.8.8', '1.1.1.1'),
        
        [Parameter(Mandatory = $false)]
        [int]$TimeoutSeconds = 30
    )
    
    begin {
        Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Starting DNS-based application discovery..." -Level "INFO"
        $discoveredApps = @()
        $commonAppPatterns = @{
            'sharepoint' = @{ Name = 'Microsoft SharePoint'; Category = 'Collaboration'; Vendor = 'Microsoft' }
            'teams' = @{ Name = 'Microsoft Teams'; Category = 'Communication'; Vendor = 'Microsoft' }
            'exchange' = @{ Name = 'Microsoft Exchange'; Category = 'Email'; Vendor = 'Microsoft' }
            'outlook' = @{ Name = 'Microsoft Outlook Web App'; Category = 'Email'; Vendor = 'Microsoft' }
            'onedrive' = @{ Name = 'Microsoft OneDrive'; Category = 'Storage'; Vendor = 'Microsoft' }
            'power' = @{ Name = 'Microsoft Power Platform'; Category = 'Development'; Vendor = 'Microsoft' }
            'dynamics' = @{ Name = 'Microsoft Dynamics'; Category = 'CRM'; Vendor = 'Microsoft' }
            'salesforce' = @{ Name = 'Salesforce'; Category = 'CRM'; Vendor = 'Salesforce' }
            'workday' = @{ Name = 'Workday'; Category = 'HR'; Vendor = 'Workday' }
            'servicenow' = @{ Name = 'ServiceNow'; Category = 'ITSM'; Vendor = 'ServiceNow' }
            'jira' = @{ Name = 'Atlassian Jira'; Category = 'Project Management'; Vendor = 'Atlassian' }
            'confluence' = @{ Name = 'Atlassian Confluence'; Category = 'Documentation'; Vendor = 'Atlassian' }
            'tableau' = @{ Name = 'Tableau'; Category = 'Analytics'; Vendor = 'Tableau' }
            'powerbi' = @{ Name = 'Microsoft Power BI'; Category = 'Analytics'; Vendor = 'Microsoft' }
        }
    }
    
    process {
        foreach ($domain in $DomainNames) {
            try {
                Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Analyzing domain: $domain" -Level "INFO"
                
                # Check if already cached
                if ($script:DNSCache.ContainsKey($domain)) {
                    Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Using cached DNS data for $domain" -Level "INFO"
                    $discoveredApps += $script:DNSCache[$domain]
                    continue
                }
                
                $domainApps = @()
                
                # Get all DNS records for the domain
                $dnsRecords = @()
                $recordTypes = @('A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV')
                
                foreach ($recordType in $recordTypes) {
                    try {
                        $records = Resolve-DnsName -Name $domain -Type $recordType -Server $DNSServers[0] -ErrorAction SilentlyContinue
                        if ($records) {
                            $dnsRecords += $records
                        }
                    } catch {
                        # Continue with other record types
                    }
                }
                
                # Enumerate subdomains using common patterns
                $commonSubdomains = @(
                    'www', 'mail', 'webmail', 'exchange', 'owa', 'autodiscover', 'lyncdiscover',
                    'sharepoint', 'portal', 'intranet', 'extranet', 'teams', 'onedrive',
                    'powerbi', 'powerapps', 'flow', 'dynamics', 'crm', 'erp',
                    'api', 'sso', 'auth', 'login', 'adfs', 'sts',
                    'vpn', 'remote', 'citrix', 'rds', 'terminal',
                    'jira', 'confluence', 'wiki', 'help', 'support',
                    'tableau', 'analytics', 'reports', 'dashboard'
                )
                
                foreach ($subdomain in $commonSubdomains) {
                    $fullDomain = "$subdomain.$domain"
                    try {
                        $subdomainRecord = Resolve-DnsName -Name $fullDomain -Type A -Server $DNSServers[0] -ErrorAction SilentlyContinue
                        if ($subdomainRecord) {
                            $dnsRecords += $subdomainRecord
                            
                            # Try to identify application based on subdomain pattern
                            $matchedApp = Get-ApplicationFromPattern -Subdomain $subdomain -Domain $domain -Patterns $commonAppPatterns
                            if ($matchedApp) {
                                $appData = [PSCustomObject]@{
                                    Name = $matchedApp.Name
                                    URL = "https://$fullDomain"
                                    Domain = $fullDomain
                                    Category = $matchedApp.Category
                                    Vendor = $matchedApp.Vendor
                                    IPAddress = $subdomainRecord.IPAddress -join ', '
                                    DiscoveryMethod = "DNS Pattern Matching"
                                    DiscoverySource = "DNS"
                                    DiscoveredAt = Get-Date
                                    SSLCertificate = $null
                                    HTTPResponse = $null
                                    RiskLevel = "Unknown"
                                    CloudReadiness = "Unknown"
                                }
                                
                                # Try to get additional metadata
                                $appData = Get-WebApplicationMetadata -AppData $appData
                                $domainApps += $appData
                            }
                        }
                    } catch {
                        # Continue with next subdomain
                    }
                }
                
                # Cache results for this domain
                $script:DNSCache[$domain] = $domainApps
                $discoveredApps += $domainApps
                
                Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Discovered $($domainApps.Count) applications for domain $domain" -Level "SUCCESS"
                
            } catch {
                Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Failed to analyze domain $domain`: $($_.Exception.Message)" -Level "ERROR"
            }
        }
        
        Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "DNS discovery completed. Found $($discoveredApps.Count) applications" -Level "SUCCESS"
        return $discoveredApps
    }
}

<#
.SYNOPSIS
    Searches for application details from internet sources
.DESCRIPTION
    Enriches application data by searching public sources for additional metadata.
#>
function Search-ApplicationDetails {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, ValueFromPipeline = $true)]
        [PSCustomObject]$ApplicationData,
        
        [Parameter(Mandatory = $false)]
        [string[]]$SearchSources = @('Wikipedia', 'VendorSite', 'CVE'),
        
        [Parameter(Mandatory = $false)]
        [int]$TimeoutSeconds = 30
    )
    
    begin {
        Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Starting internet-based application enrichment..." -Level "INFO"
    }
    
    process {
        try {
            $enrichedApp = $ApplicationData.PSObject.Copy()
            $searchQuery = $ApplicationData.Name
            
            # Check cache first
            $cacheKey = "$($ApplicationData.Name)_$($ApplicationData.Vendor)"
            if ($script:MetadataCache.ContainsKey($cacheKey)) {
                Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Using cached metadata for $($ApplicationData.Name)" -Level "INFO"
                $cachedData = $script:MetadataCache[$cacheKey]
                foreach ($property in $cachedData.PSObject.Properties) {
                    $enrichedApp | Add-Member -MemberType NoteProperty -Name $property.Name -Value $property.Value -Force
                }
                return $enrichedApp
            }
            
            $enrichmentData = @{}
            
            # Search Wikipedia for basic information
            if ('Wikipedia' -in $SearchSources) {
                try {
                    $wikiData = Search-WikipediaApplication -ApplicationName $searchQuery
                    if ($wikiData) {
                        $enrichmentData.Description = $wikiData.Description
                        $enrichmentData.Developer = $wikiData.Developer
                        $enrichmentData.ReleaseDate = $wikiData.ReleaseDate
                        $enrichmentData.License = $wikiData.License
                        $enrichmentData.Platform = $wikiData.Platform
                    }
                } catch {
                    Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Wikipedia search failed for $($ApplicationData.Name): $($_.Exception.Message)" -Level "WARN"
                }
            }
            
            # Search for security vulnerabilities
            if ('CVE' -in $SearchSources) {
                try {
                    $cveData = Search-CVEDatabase -ApplicationName $searchQuery -Vendor $ApplicationData.Vendor
                    if ($cveData) {
                        $enrichmentData.SecurityRating = $cveData.SecurityRating
                        $enrichmentData.VulnerabilityCount = $cveData.VulnerabilityCount
                        $enrichmentData.HighSeverityVulns = $cveData.HighSeverityVulns
                        $enrichmentData.LastSecurityUpdate = $cveData.LastSecurityUpdate
                    }
                } catch {
                    Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "CVE search failed for $($ApplicationData.Name): $($_.Exception.Message)" -Level "WARN"
                }
            }
            
            # Determine cloud readiness based on known patterns
            $enrichmentData.CloudReadiness = Get-CloudReadinessScore -ApplicationData $ApplicationData -EnrichmentData $enrichmentData
            
            # Calculate risk level
            $enrichmentData.RiskLevel = Get-ApplicationRiskLevel -ApplicationData $ApplicationData -EnrichmentData $enrichmentData
            
            # Add migration complexity assessment
            $enrichmentData.MigrationComplexity = Get-MigrationComplexity -ApplicationData $ApplicationData -EnrichmentData $enrichmentData
            
            # Add all enrichment data to the application object
            foreach ($key in $enrichmentData.Keys) {
                $enrichedApp | Add-Member -MemberType NoteProperty -Name $key -Value $enrichmentData[$key] -Force
            }
            
            # Cache the enrichment data
            $script:MetadataCache[$cacheKey] = $enrichmentData
            
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Successfully enriched application: $($ApplicationData.Name)" -Level "SUCCESS"
            return $enrichedApp
            
        } catch {
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Failed to enrich application $($ApplicationData.Name): $($_.Exception.Message)" -Level "ERROR"
            return $ApplicationData
        }
    }
}

<#
.SYNOPSIS
    Creates a master application catalog from all discovery sources
.DESCRIPTION
    Combines and deduplicates applications from multiple sources to create a unified catalog.
#>
function New-ApplicationCatalog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $false)]
        [PSCustomObject[]]$IntuneApps,
        
        [Parameter(Mandatory = $false)]
        [PSCustomObject[]]$DNSApps,
        
        [Parameter(Mandatory = $false)]
        [PSCustomObject[]]$EnrichedApps,
        
        [Parameter(Mandatory = $false)]
        [switch]$RemoveDuplicates = $true,
        
        [Parameter(Mandatory = $false)]
        [string]$OutputPath
    )
    
    begin {
        Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Creating master application catalog..." -Level "INFO"
        $masterCatalog = @()
        $duplicateCount = 0
    }
    
    process {
        try {
            # Collect all applications
            $allApplications = @()
            
            if ($IntuneApps) {
                $allApplications += $IntuneApps | ForEach-Object { 
                    $_ | Add-Member -MemberType NoteProperty -Name "CatalogSource" -Value "Intune" -Force -PassThru
                }
            }
            
            if ($DNSApps) {
                $allApplications += $DNSApps | ForEach-Object { 
                    $_ | Add-Member -MemberType NoteProperty -Name "CatalogSource" -Value "DNS" -Force -PassThru
                }
            }
            
            if ($EnrichedApps) {
                $allApplications += $EnrichedApps | ForEach-Object { 
                    $_ | Add-Member -MemberType NoteProperty -Name "CatalogSource" -Value "Enriched" -Force -PassThru
                }
            }
            
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Processing $($allApplications.Count) total applications from all sources" -Level "INFO"
            
            if ($RemoveDuplicates) {
                # Create hashtable for duplicate detection
                $uniqueApps = @{}
                
                foreach ($app in $allApplications) {
                    $key = "$($app.Name)_$($app.Vendor)".ToLower() -replace '\s+', '_'
                    
                    if ($uniqueApps.ContainsKey($key)) {
                        # Merge data from duplicate, preferring more complete data
                        $existingApp = $uniqueApps[$key]
                        $mergedApp = Merge-ApplicationData -PrimaryApp $existingApp -SecondaryApp $app
                        $uniqueApps[$key] = $mergedApp
                        $duplicateCount++
                    } else {
                        $uniqueApps[$key] = $app
                    }
                }
                
                $masterCatalog = $uniqueApps.Values
            } else {
                $masterCatalog = $allApplications
            }
            
            # Add catalog metadata to each application
            foreach ($app in $masterCatalog) {
                $app | Add-Member -MemberType NoteProperty -Name "CatalogId" -Value ([System.Guid]::NewGuid().ToString()) -Force
                $app | Add-Member -MemberType NoteProperty -Name "CatalogCreatedAt" -Value (Get-Date) -Force
                $app | Add-Member -MemberType NoteProperty -Name "CatalogVersion" -Value "1.0" -Force
            }
            
            # Generate catalog statistics
            $catalogStats = @{
                TotalApplications = $masterCatalog.Count
                IntuneApplications = ($masterCatalog | Where-Object { $_.CatalogSource -eq "Intune" }).Count
                DNSApplications = ($masterCatalog | Where-Object { $_.CatalogSource -eq "DNS" }).Count
                EnrichedApplications = ($masterCatalog | Where-Object { $_.CatalogSource -eq "Enriched" }).Count
                DuplicatesRemoved = $duplicateCount
                CategoryBreakdown = $masterCatalog | Group-Object Category | Select-Object Name, Count
                VendorBreakdown = $masterCatalog | Group-Object Vendor | Select-Object Name, Count
                RiskLevelBreakdown = $masterCatalog | Group-Object RiskLevel | Select-Object Name, Count
                CloudReadinessBreakdown = $masterCatalog | Group-Object CloudReadiness | Select-Object Name, Count
                CreatedAt = Get-Date
            }
            
            # Export catalog if path specified
            if ($OutputPath) {
                Export-ApplicationCatalog -ApplicationCatalog $masterCatalog -Statistics $catalogStats -OutputPath $OutputPath
            }
            
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Master catalog created with $($masterCatalog.Count) unique applications (removed $duplicateCount duplicates)" -Level "SUCCESS"
            
            return @{
                Applications = $masterCatalog
                Statistics = $catalogStats
            }
            
        } catch {
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Failed to create application catalog: $($_.Exception.Message)" -Level "ERROR"
            throw
        }
    }
}

<#
.SYNOPSIS
    Maps application migration paths between source and target domains
.DESCRIPTION
    Creates migration mapping for applications between source and target environments.
#>
function Get-ApplicationMigrationPath {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [PSCustomObject[]]$Applications,
        
        [Parameter(Mandatory = $true)]
        [hashtable]$DomainMapping,
        
        [Parameter(Mandatory = $false)]
        [hashtable]$CustomMappings = @{}
    )
    
    begin {
        Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Creating application migration paths..." -Level "INFO"
        $migrationPaths = @()
    }
    
    process {
        try {
            foreach ($app in $Applications) {
                $migrationPath = [PSCustomObject]@{
                    ApplicationId = $app.CatalogId
                    ApplicationName = $app.Name
                    SourceEnvironment = @{
                        Domain = $null
                        URL = $null
                        Configuration = @{}
                    }
                    TargetEnvironment = @{
                        Domain = $null
                        URL = $null
                        Configuration = @{}
                    }
                    MigrationStrategy = "Unknown"
                    Dependencies = @()
                    Prerequisites = @()
                    EstimatedDuration = "Unknown"
                    Complexity = $app.MigrationComplexity
                    RiskFactors = @()
                    ValidationSteps = @()
                    RollbackPlan = @{}
                    CreatedAt = Get-Date
                }
                
                # Map source environment
                if ($app.URL) {
                    $sourceUri = [System.Uri]::new($app.URL)
                    $migrationPath.SourceEnvironment.Domain = $sourceUri.Host
                    $migrationPath.SourceEnvironment.URL = $app.URL
                }
                
                # Map target environment based on domain mapping
                foreach ($mapping in $DomainMapping.GetEnumerator()) {
                    if ($migrationPath.SourceEnvironment.Domain -like "*$($mapping.Key)*") {
                        $migrationPath.TargetEnvironment.Domain = $migrationPath.SourceEnvironment.Domain -replace $mapping.Key, $mapping.Value
                        $migrationPath.TargetEnvironment.URL = $app.URL -replace $mapping.Key, $mapping.Value
                        break
                    }
                }
                
                # Determine migration strategy based on application type
                $migrationPath.MigrationStrategy = Get-MigrationStrategy -Application $app
                
                # Add application-specific dependencies
                $migrationPath.Dependencies = Get-ApplicationDependencies -Application $app
                
                # Add prerequisites based on application type
                $migrationPath.Prerequisites = Get-MigrationPrerequisites -Application $app
                
                # Estimate migration duration
                $migrationPath.EstimatedDuration = Get-MigrationDuration -Application $app -Complexity $migrationPath.Complexity
                
                # Identify risk factors
                $migrationPath.RiskFactors = Get-MigrationRiskFactors -Application $app
                
                # Define validation steps
                $migrationPath.ValidationSteps = Get-MigrationValidationSteps -Application $app
                
                # Create rollback plan
                $migrationPath.RollbackPlan = Get-RollbackPlan -Application $app -MigrationPath $migrationPath
                
                $migrationPaths += $migrationPath
            }
            
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Created migration paths for $($migrationPaths.Count) applications" -Level "SUCCESS"
            return $migrationPaths
            
        } catch {
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Failed to create migration paths: $($_.Exception.Message)" -Level "ERROR"
            throw
        }
    }
}

#endregion

#region Helper Functions

function Get-AppPlatform {
    param([string]$ODataType)
    
    switch -Regex ($ODataType) {
        'win32LobApp|winGetApp|msiLobApp' { return 'Windows' }
        'iosLobApp|iosStoreApp|iosVppApp' { return 'iOS' }
        'androidLobApp|androidStoreApp|androidManagedStoreApp' { return 'Android' }
        'macOSLobApp|macOSMicrosoftEdgeApp|macOSMicrosoftDefenderApp' { return 'macOS' }
        'webApp' { return 'Web' }
        default { return 'Unknown' }
    }
}

function Get-ApplicationFromPattern {
    param(
        [string]$Subdomain,
        [string]$Domain,
        [hashtable]$Patterns
    )
    
    foreach ($pattern in $Patterns.GetEnumerator()) {
        if ($Subdomain -like "*$($pattern.Key)*") {
            return $pattern.Value
        }
    }
    return $null
}

function Get-WebApplicationMetadata {
    param([PSCustomObject]$AppData)
    
    try {
        # Try to get SSL certificate information
        $uri = [System.Uri]::new($AppData.URL)
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect($uri.Host, 443)
        $sslStream = New-Object System.Net.Security.SslStream($tcpClient.GetStream())
        $sslStream.AuthenticateAsClient($uri.Host)
        
        $cert = $sslStream.RemoteCertificate
        if ($cert) {
            $AppData.SSLCertificate = @{
                Subject = $cert.Subject
                Issuer = $cert.Issuer
                ValidFrom = $cert.GetEffectiveDateString()
                ValidTo = $cert.GetExpirationDateString()
            }
        }
        
        $sslStream.Close()
        $tcpClient.Close()
        
    } catch {
        # SSL certificate check failed, continue without it
    }
    
    return $AppData
}

function Get-CloudReadinessScore {
    param(
        [PSCustomObject]$ApplicationData,
        [hashtable]$EnrichmentData
    )
    
    $score = 0
    $factors = @()
    
    # Web-based applications are generally more cloud-ready
    if ($ApplicationData.Platform -eq 'Web' -or $ApplicationData.URL) {
        $score += 30
        $factors += "Web-based application"
    }
    
    # SaaS applications are cloud-native
    if ($ApplicationData.Vendor -in @('Microsoft', 'Google', 'Salesforce', 'ServiceNow', 'Workday')) {
        $score += 40
        $factors += "SaaS vendor"
    }
    
    # Modern applications (created recently) are more likely cloud-ready
    if ($ApplicationData.CreatedDateTime -and $ApplicationData.CreatedDateTime -gt (Get-Date).AddYears(-3)) {
        $score += 20
        $factors += "Recently developed"
    }
    
    # API availability indicates cloud readiness
    if ($EnrichmentData.ContainsKey('API') -and $EnrichmentData.API) {
        $score += 10
        $factors += "API available"
    }
    
    switch ($score) {
        { $_ -ge 70 } { return "Cloud Native" }
        { $_ -ge 40 } { return "Cloud Ready" }
        { $_ -ge 20 } { return "Cloud Friendly" }
        default { return "Legacy" }
    }
}

function Get-ApplicationRiskLevel {
    param(
        [PSCustomObject]$ApplicationData,
        [hashtable]$EnrichmentData
    )
    
    $riskScore = 0
    
    # High vulnerability count increases risk
    if ($EnrichmentData.VulnerabilityCount -gt 10) { $riskScore += 30 }
    elseif ($EnrichmentData.VulnerabilityCount -gt 5) { $riskScore += 20 }
    elseif ($EnrichmentData.VulnerabilityCount -gt 0) { $riskScore += 10 }
    
    # Old applications without recent updates are risky
    if ($ApplicationData.LastModifiedDateTime -and $ApplicationData.LastModifiedDateTime -lt (Get-Date).AddYears(-2)) {
        $riskScore += 20
    }
    
    # Applications without SSL certificates are risky
    if (-not $ApplicationData.SSLCertificate) {
        $riskScore += 15
    }
    
    # Legacy platforms are riskier
    if ($ApplicationData.Platform -in @('Windows XP', 'Windows Server 2008', 'Windows Server 2012')) {
        $riskScore += 25
    }
    
    switch ($riskScore) {
        { $_ -ge 50 } { return "High" }
        { $_ -ge 25 } { return "Medium" }
        default { return "Low" }
    }
}

function Get-MigrationComplexity {
    param(
        [PSCustomObject]$ApplicationData,
        [hashtable]$EnrichmentData
    )
    
    $complexityScore = 0
    
    # Web applications are generally easier to migrate
    if ($ApplicationData.Platform -eq 'Web') { $complexityScore -= 10 }
    
    # Applications with many dependencies are complex
    if ($ApplicationData.Dependencies -and $ApplicationData.Dependencies.Count -gt 5) {
        $complexityScore += 20
    }
    
    # Database applications are more complex
    if ($ApplicationData.Category -eq 'Database' -or $ApplicationData.Name -like '*SQL*') {
        $complexityScore += 15
    }
    
    # Custom applications are more complex than commercial ones
    if ($ApplicationData.AppType -like '*lob*') {
        $complexityScore += 10
    }
    
    switch ($complexityScore) {
        { $_ -ge 30 } { return "Very High" }
        { $_ -ge 20 } { return "High" }
        { $_ -ge 10 } { return "Medium" }
        default { return "Low" }
    }
}

<#
.SYNOPSIS
    Updates application metadata with enriched information
.DESCRIPTION
    Updates existing application data with new metadata from various sources.
#>
function Update-ApplicationMetadata {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, ValueFromPipeline = $true)]
        [PSCustomObject]$Application,
        
        [Parameter(Mandatory = $true)]
        [hashtable]$MetadataUpdates,
        
        [Parameter(Mandatory = $false)]
        [switch]$PreserveOriginal
    )
    
    process {
        try {
            if ($PreserveOriginal) {
                $updatedApp = $Application.PSObject.Copy()
            } else {
                $updatedApp = $Application
            }
            
            foreach ($update in $MetadataUpdates.GetEnumerator()) {
                $updatedApp | Add-Member -MemberType NoteProperty -Name $update.Key -Value $update.Value -Force
            }
            
            $updatedApp | Add-Member -MemberType NoteProperty -Name "LastMetadataUpdate" -Value (Get-Date) -Force
            
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Updated metadata for application: $($Application.Name)" -Level "SUCCESS"
            return $updatedApp
            
        } catch {
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Failed to update metadata for $($Application.Name): $($_.Exception.Message)" -Level "ERROR"
            return $Application
        }
    }
}

<#
.SYNOPSIS
    Exports application catalog to various formats
.DESCRIPTION
    Exports the application catalog to CSV, JSON, or Excel formats with statistics.
#>
function Export-ApplicationCatalog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [PSCustomObject[]]$ApplicationCatalog,
        
        [Parameter(Mandatory = $false)]
        [hashtable]$Statistics,
        
        [Parameter(Mandatory = $true)]
        [string]$OutputPath,
        
        [Parameter(Mandatory = $false)]
        [ValidateSet('CSV', 'JSON', 'Excel', 'All')]
        [string]$Format = 'All'
    )
    
    try {
        if (-not (Test-Path $OutputPath)) {
            New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
        }
        
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $exportResults = @()
        
        # Export to CSV
        if ($Format -in @('CSV', 'All')) {
            $csvPath = Join-Path $OutputPath "ApplicationCatalog_$timestamp.csv"
            $ApplicationCatalog | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
            $exportResults += "CSV: $csvPath"
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Exported catalog to CSV: $csvPath" -Level "SUCCESS"
        }
        
        # Export to JSON
        if ($Format -in @('JSON', 'All')) {
            $jsonPath = Join-Path $OutputPath "ApplicationCatalog_$timestamp.json"
            $catalogData = @{
                Applications = $ApplicationCatalog
                Statistics = $Statistics
                ExportedAt = Get-Date
                Version = "1.0"
            }
            $catalogData | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8
            $exportResults += "JSON: $jsonPath"
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Exported catalog to JSON: $jsonPath" -Level "SUCCESS"
        }
        
        # Export statistics summary
        if ($Statistics) {
            $statsPath = Join-Path $OutputPath "CatalogStatistics_$timestamp.json"
            $Statistics | ConvertTo-Json -Depth 5 | Out-File -FilePath $statsPath -Encoding UTF8
            $exportResults += "Statistics: $statsPath"
        }
        
        # Create summary report
        $summaryPath = Join-Path $OutputPath "CatalogSummary_$timestamp.txt"
        $summary = @"
Application Catalog Export Summary
Generated: $(Get-Date)
Total Applications: $($ApplicationCatalog.Count)

Export Files:
$($exportResults -join "`n")

Top 10 Vendors:
$($ApplicationCatalog | Group-Object Vendor | Sort-Object Count -Descending | Select-Object -First 10 | ForEach-Object { "  $($_.Name): $($_.Count)" } | Out-String)

Risk Level Distribution:
$($ApplicationCatalog | Group-Object RiskLevel | ForEach-Object { "  $($_.Name): $($_.Count)" } | Out-String)

Cloud Readiness Distribution:
$($ApplicationCatalog | Group-Object CloudReadiness | ForEach-Object { "  $($_.Name): $($_.Count)" } | Out-String)
"@
        
        $summary | Out-File -FilePath $summaryPath -Encoding UTF8
        $exportResults += "Summary: $summaryPath"
        
        Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Application catalog export completed. Files: $($exportResults.Count)" -Level "SUCCESS"
        return $exportResults
        
    } catch {
        Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Failed to export application catalog: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

<#
.SYNOPSIS
    Tests application connectivity and availability
.DESCRIPTION
    Validates that discovered applications are accessible and responding correctly.
#>
function Test-ApplicationConnectivity {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, ValueFromPipeline = $true)]
        [PSCustomObject]$Application,
        
        [Parameter(Mandatory = $false)]
        [int]$TimeoutSeconds = 30,
        
        [Parameter(Mandatory = $false)]
        [switch]$DetailedCheck
    )
    
    process {
        try {
            $connectivityResult = [PSCustomObject]@{
                ApplicationName = $Application.Name
                URL = $Application.URL
                IsAccessible = $false
                ResponseTime = $null
                HTTPStatusCode = $null
                SSLValid = $null
                LastChecked = Get-Date
                ErrorMessage = $null
                Details = @{}
            }
            
            if (-not $Application.URL) {
                $connectivityResult.ErrorMessage = "No URL specified for connectivity test"
                return $connectivityResult
            }
            
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            
            try {
                # Basic HTTP connectivity test
                $response = Invoke-WebRequest -Uri $Application.URL -Method Head -TimeoutSec $TimeoutSeconds -ErrorAction Stop
                $connectivityResult.IsAccessible = $true
                $connectivityResult.HTTPStatusCode = $response.StatusCode
                $connectivityResult.ResponseTime = $stopwatch.ElapsedMilliseconds
                
                # SSL certificate validation for HTTPS URLs
                if ($Application.URL -like "https://*") {
                    try {
                        $uri = [System.Uri]::new($Application.URL)
                        $tcpClient = New-Object System.Net.Sockets.TcpClient
                        $tcpClient.Connect($uri.Host, 443)
                        $sslStream = New-Object System.Net.Security.SslStream($tcpClient.GetStream())
                        $sslStream.AuthenticateAsClient($uri.Host)
                        $connectivityResult.SSLValid = $true
                        $connectivityResult.Details.SSLCertificate = @{
                            Subject = $sslStream.RemoteCertificate.Subject
                            Issuer = $sslStream.RemoteCertificate.Issuer
                            ValidTo = $sslStream.RemoteCertificate.GetExpirationDateString()
                        }
                        $sslStream.Close()
                        $tcpClient.Close()
                    } catch {
                        $connectivityResult.SSLValid = $false
                        $connectivityResult.Details.SSLError = $_.Exception.Message
                    }
                }
                
                # Detailed checks if requested
                if ($DetailedCheck) {
                    try {
                        $fullResponse = Invoke-WebRequest -Uri $Application.URL -TimeoutSec $TimeoutSeconds
                        $connectivityResult.Details.ContentLength = $fullResponse.Content.Length
                        $connectivityResult.Details.Headers = $fullResponse.Headers
                        $connectivityResult.Details.Server = $fullResponse.Headers.Server
                    } catch {
                        $connectivityResult.Details.DetailedCheckError = $_.Exception.Message
                    }
                }
                
            } catch {
                $connectivityResult.IsAccessible = $false
                $connectivityResult.ErrorMessage = $_.Exception.Message
                $connectivityResult.ResponseTime = $stopwatch.ElapsedMilliseconds
            }
            
            $stopwatch.Stop()
            
            $status = if ($connectivityResult.IsAccessible) { "SUCCESS" } else { "WARN" }
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Connectivity test for $($Application.Name): $($connectivityResult.IsAccessible)" -Level $status
            
            return $connectivityResult
            
        } catch {
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Failed connectivity test for $($Application.Name): $($_.Exception.Message)" -Level "ERROR"
            throw
        }
    }
}

# Additional helper functions for internet searches and metadata enrichment

function Search-WikipediaApplication {
    param([string]$ApplicationName)
    
    try {
        $searchUrl = "https://en.wikipedia.org/api/rest_v1/page/summary/$([System.Web.HttpUtility]::UrlEncode($ApplicationName))"
        $response = Invoke-RestMethod -Uri $searchUrl -TimeoutSec 10 -ErrorAction Stop
        
        return @{
            Description = $response.extract
            Developer = $null
            ReleaseDate = $null
            License = $null
            Platform = $null
        }
    } catch {
        return $null
    }
}

function Search-CVEDatabase {
    param(
        [string]$ApplicationName,
        [string]$Vendor
    )
    
    # This is a placeholder for CVE database integration
    # In a real implementation, you would integrate with CVE APIs
    return @{
        SecurityRating = "Unknown"
        VulnerabilityCount = 0
        HighSeverityVulns = 0
        LastSecurityUpdate = $null
    }
}

function Merge-ApplicationData {
    param(
        [PSCustomObject]$PrimaryApp,
        [PSCustomObject]$SecondaryApp
    )
    
    $merged = $PrimaryApp.PSObject.Copy()
    
    # Merge properties, preferring non-null values from secondary if primary is null
    foreach ($property in $SecondaryApp.PSObject.Properties) {
        if (-not $merged.PSObject.Properties[$property.Name] -or 
            $null -eq $merged.PSObject.Properties[$property.Name].Value -or
            $merged.PSObject.Properties[$property.Name].Value -eq "") {
            $merged | Add-Member -MemberType NoteProperty -Name $property.Name -Value $property.Value -Force
        }
    }
    
    # Merge source information
    $sources = @($PrimaryApp.CatalogSource)
    if ($SecondaryApp.CatalogSource -notin $sources) {
        $sources += $SecondaryApp.CatalogSource
    }
    $merged.CatalogSource = $sources -join ", "
    
    return $merged
}

function Get-MigrationStrategy {
    param([PSCustomObject]$Application)
    
    switch -Regex ($Application.Platform) {
        'Web' { return "Repoint DNS/URL" }
        'Windows' { return "Repackage and Deploy" }
        'SaaS|Cloud' { return "Tenant Migration" }
        default { return "Assess and Plan" }
    }
}

function Get-ApplicationDependencies {
    param([PSCustomObject]$Application)
    
    $dependencies = @()
    
    # Add common dependencies based on application type
    if ($Application.Category -eq "Database") {
        $dependencies += "SQL Server", "Active Directory Authentication"
    }
    
    if ($Application.Platform -eq "Web") {
        $dependencies += "Web Server", "SSL Certificate", "Load Balancer"
    }
    
    if ($Application.Vendor -eq "Microsoft") {
        $dependencies += "Active Directory", "Microsoft 365"
    }
    
    return $dependencies
}

function Get-MigrationPrerequisites {
    param([PSCustomObject]$Application)
    
    $prerequisites = @()
    
    $prerequisites += "Backup current configuration"
    $prerequisites += "Document current integrations"
    $prerequisites += "Identify user accounts and permissions"
    
    if ($Application.Platform -eq "Web") {
        $prerequisites += "SSL certificate procurement"
        $prerequisites += "DNS zone access"
    }
    
    return $prerequisites
}

function Get-MigrationDuration {
    param(
        [PSCustomObject]$Application,
        [string]$Complexity
    )
    
    switch ($Complexity) {
        "Low" { return "1-3 days" }
        "Medium" { return "1-2 weeks" }
        "High" { return "2-4 weeks" }
        "Very High" { return "1-3 months" }
        default { return "Unknown" }
    }
}

function Get-MigrationRiskFactors {
    param([PSCustomObject]$Application)
    
    $risks = @()
    
    if ($Application.RiskLevel -eq "High") {
        $risks += "High security risk application"
    }
    
    if ($Application.VulnerabilityCount -gt 0) {
        $risks += "Known security vulnerabilities"
    }
    
    if ($Application.CloudReadiness -eq "Legacy") {
        $risks += "Legacy application - may require significant changes"
    }
    
    return $risks
}

function Get-MigrationValidationSteps {
    param([PSCustomObject]$Application)
    
    return @(
        "Verify application accessibility",
        "Test user authentication",
        "Validate core functionality",
        "Check integrations",
        "Performance testing",
        "Security scan",
        "User acceptance testing"
    )
}

function Get-RollbackPlan {
    param(
        [PSCustomObject]$Application,
        [PSCustomObject]$MigrationPath
    )
    
    return @{
        Steps = @(
            "Redirect DNS back to source",
            "Restore original configuration",
            "Verify source system accessibility",
            "Notify users of rollback"
        )
        EstimatedTime = "30 minutes"
        Prerequisites = @("Source system still available", "DNS access", "Configuration backup")
        Triggers = @("Application not accessible", "Critical functionality broken", "Performance degradation >50%")
    }
}

#endregion

#region Software License Discovery Functions

<#
.SYNOPSIS
    Discovers installed software and license information from local systems.
.DESCRIPTION
    Scans for installed software using registry, WMI, and file system analysis
    to build comprehensive software inventory with license compliance data.
#>
function Get-SoftwareLicenseInventory {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string[]]$ComputerNames = @($env:COMPUTERNAME),
        
        [Parameter(Mandatory=$false)]
        [hashtable]$KnownLicenses = @{},
        
        [Parameter(Mandatory=$false)]
        [switch]$IncludeSystemComponents,
        
        [Parameter(Mandatory=$false)]
        [string]$SessionId
    )
    
    $softwareInventory = @()
    
    foreach ($computerName in $ComputerNames) {
        try {
            Write-Host "Scanning software on $computerName..." -ForegroundColor Cyan
            
            # Get installed software from registry (64-bit)
            $software64 = Get-InstalledSoftwareFromRegistry -ComputerName $computerName -RegistryPath "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"
            
            # Get installed software from registry (32-bit on 64-bit systems)
            $software32 = Get-InstalledSoftwareFromRegistry -ComputerName $computerName -RegistryPath "SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"
            
            # Get software from WMI
            $softwareWMI = Get-InstalledSoftwareFromWMI -ComputerName $computerName
            
            # Combine and deduplicate
            $allSoftware = @()
            $allSoftware += $software64
            $allSoftware += $software32
            $allSoftware += $softwareWMI
            
            # Deduplicate based on DisplayName and Version
            $uniqueSoftware = $allSoftware | Sort-Object DisplayName, Version | Group-Object DisplayName, Version | ForEach-Object { $_.Group | Select-Object -First 1 }
            
            foreach ($software in $uniqueSoftware) {
                if (-not $IncludeSystemComponents -and $software.Publisher -in @("Microsoft Corporation", "Intel Corporation", "NVIDIA Corporation") -and $software.DisplayName -like "*Runtime*") {
                    continue
                }
                
                $licenseInfo = Get-SoftwareLicenseInfo -Software $software -KnownLicenses $KnownLicenses
                
                $softwareInventory += [PSCustomObject]@{
                    ComputerName = $computerName
                    DisplayName = $software.DisplayName
                    Version = $software.Version
                    Publisher = $software.Publisher
                    InstallDate = $software.InstallDate
                    InstallLocation = $software.InstallLocation
                    UninstallString = $software.UninstallString
                    DisplayIcon = $software.DisplayIcon
                    EstimatedSize = $software.EstimatedSize
                    VersionMajor = $software.VersionMajor
                    VersionMinor = $software.VersionMinor
                    WindowsInstaller = $software.WindowsInstaller
                    Source = $software.Source
                    LicenseType = $licenseInfo.LicenseType
                    LicenseKey = $licenseInfo.LicenseKey
                    LicenseStatus = $licenseInfo.LicenseStatus
                    ComplianceStatus = $licenseInfo.ComplianceStatus
                    LicenseCost = $licenseInfo.LicenseCost
                    SupportExpiration = $licenseInfo.SupportExpiration
                    LastUsed = $licenseInfo.LastUsed
                    UsageFrequency = $licenseInfo.UsageFrequency
                    SecurityRating = $licenseInfo.SecurityRating
                    SessionId = $SessionId
                }
            }
            
        } catch {
            Write-Warning "Failed to scan software on $computerName`: $($_.Exception.Message)"
        }
    }
    
    return $softwareInventory
}

function Get-InstalledSoftwareFromRegistry {
    [CmdletBinding()]
    param(
        [string]$ComputerName,
        [string]$RegistryPath
    )
    
    $software = @()
    
    try {
        if ($ComputerName -eq $env:COMPUTERNAME) {
            $registry = [Microsoft.Win32.RegistryKey]::OpenRemoteBaseKey('LocalMachine', $ComputerName)
        } else {
            # For remote computers, would need additional setup
            return $software
        }
        
        $uninstallKey = $registry.OpenSubKey($RegistryPath)
        if ($uninstallKey) {
            foreach ($subKeyName in $uninstallKey.GetSubKeyNames()) {
                $subKey = $uninstallKey.OpenSubKey($subKeyName)
                if ($subKey) {
                    $displayName = $subKey.GetValue("DisplayName")
                    if ($displayName) {
                        $software += [PSCustomObject]@{
                            DisplayName = $displayName
                            Version = $subKey.GetValue("DisplayVersion")
                            Publisher = $subKey.GetValue("Publisher")
                            InstallDate = $subKey.GetValue("InstallDate")
                            InstallLocation = $subKey.GetValue("InstallLocation")
                            UninstallString = $subKey.GetValue("UninstallString")
                            DisplayIcon = $subKey.GetValue("DisplayIcon")
                            EstimatedSize = $subKey.GetValue("EstimatedSize")
                            VersionMajor = $subKey.GetValue("VersionMajor")
                            VersionMinor = $subKey.GetValue("VersionMinor")
                            WindowsInstaller = $subKey.GetValue("WindowsInstaller")
                            Source = "Registry-$RegistryPath"
                        }
                    }
                    $subKey.Close()
                }
            }
            $uninstallKey.Close()
        }
        $registry.Close()
        
    } catch {
        Write-Warning "Failed to read registry path $RegistryPath on $ComputerName`: $($_.Exception.Message)"
    }
    
    return $software
}

function Get-InstalledSoftwareFromWMI {
    [CmdletBinding()]
    param([string]$ComputerName)
    
    $software = @()
    
    try {
        $wmiSoftware = Get-CimInstance -ClassName Win32_Product -ComputerName $ComputerName -ErrorAction SilentlyContinue
        foreach ($item in $wmiSoftware) {
            $software += [PSCustomObject]@{
                DisplayName = $item.Name
                Version = $item.Version
                Publisher = $item.Vendor
                InstallDate = $item.InstallDate
                InstallLocation = $item.InstallLocation
                UninstallString = $null
                DisplayIcon = $null
                EstimatedSize = $null
                VersionMajor = $null
                VersionMinor = $null
                WindowsInstaller = $true
                Source = "WMI-Win32_Product"
            }
        }
    } catch {
        Write-Warning "Failed to query WMI on $ComputerName`: $($_.Exception.Message)"
    }
    
    return $software
}

function Get-SoftwareLicenseInfo {
    [CmdletBinding()]
    param(
        [PSCustomObject]$Software,
        [hashtable]$KnownLicenses = @{}
    )
    
    $licenseInfo = @{
        LicenseType = "Unknown"
        LicenseKey = $null
        LicenseStatus = "Unknown"
        ComplianceStatus = "Unknown"
        LicenseCost = $null
        SupportExpiration = $null
        LastUsed = $null
        UsageFrequency = "Unknown"
        SecurityRating = "Unknown"
    }
    
    # Check against known licenses database
    if ($KnownLicenses.ContainsKey($Software.DisplayName)) {
        $knownLicense = $KnownLicenses[$Software.DisplayName]
        $licenseInfo.LicenseType = $knownLicense.LicenseType
        $licenseInfo.LicenseCost = $knownLicense.Cost
        $licenseInfo.SupportExpiration = $knownLicense.SupportExpiration
    }
    
    # Detect license type based on software characteristics
    $licenseInfo.LicenseType = Get-DetectedLicenseType -Software $Software
    
    # Try to find license keys from common locations
    $licenseInfo.LicenseKey = Get-SoftwareLicenseKey -Software $Software
    
    # Determine compliance status
    $licenseInfo.ComplianceStatus = Get-LicenseComplianceStatus -Software $Software -LicenseInfo $licenseInfo
    
    # Get usage information
    $usageInfo = Get-SoftwareUsageInfo -Software $Software
    $licenseInfo.LastUsed = $usageInfo.LastUsed
    $licenseInfo.UsageFrequency = $usageInfo.Frequency
    
    # Get security rating
    $licenseInfo.SecurityRating = Get-SoftwareSecurityRating -Software $Software
    
    return $licenseInfo
}

function Get-DetectedLicenseType {
    [CmdletBinding()]
    param([PSCustomObject]$Software)
    
    $displayName = $Software.DisplayName.ToLower()
    $publisher = $Software.Publisher
    
    # Common license type detection patterns
    if ($displayName -match "trial|evaluation|demo") {
        return "Trial"
    } elseif ($displayName -match "free|freeware") {
        return "Freeware"
    } elseif ($displayName -match "open source|opensource") {
        return "Open Source"
    } elseif ($publisher -eq "Microsoft Corporation" -and $displayName -match "office|excel|word|powerpoint|outlook") {
        return "Microsoft Office License"
    } elseif ($publisher -eq "Microsoft Corporation" -and $displayName -match "windows|microsoft") {
        return "Microsoft Windows License"
    } elseif ($publisher -eq "Adobe Inc." -or $publisher -eq "Adobe Systems Incorporated") {
        return "Adobe Creative License"
    } elseif ($displayName -match "vmware") {
        return "VMware License"
    } elseif ($displayName -match "antivirus|security|endpoint") {
        return "Security Software License"
    } else {
        return "Commercial"
    }
}

function Get-SoftwareLicenseKey {
    [CmdletBinding()]
    param([PSCustomObject]$Software)
    
    # This is a placeholder - in reality, you would need to implement
    # specific logic for each software to find license keys
    # Note: License key extraction should only be done with proper authorization
    
    try {
        # Example: For some Microsoft products, keys might be in registry
        if ($Software.Publisher -eq "Microsoft Corporation") {
            # Placeholder for Microsoft license key extraction
            return "Not Implemented - License Key Extraction"
        }
        
        return $null
    } catch {
        return $null
    }
}

function Get-LicenseComplianceStatus {
    [CmdletBinding()]
    param(
        [PSCustomObject]$Software,
        [hashtable]$LicenseInfo
    )
    
    # Basic compliance checks
    if ($LicenseInfo.LicenseType -eq "Trial" -or $LicenseInfo.LicenseType -eq "Evaluation") {
        return "Review Required - Trial Software"
    } elseif ($LicenseInfo.LicenseType -eq "Freeware" -or $LicenseInfo.LicenseType -eq "Open Source") {
        return "Compliant - Free License"
    } elseif ($LicenseInfo.LicenseKey) {
        return "Licensed - Key Found"
    } else {
        return "Review Required - No License Key"
    }
}

function Get-SoftwareUsageInfo {
    [CmdletBinding()]
    param([PSCustomObject]$Software)
    
    $usageInfo = @{
        LastUsed = $null
        Frequency = "Unknown"
    }
    
    try {
        # Try to get last access time from executable
        if ($Software.InstallLocation -and (Test-Path $Software.InstallLocation)) {
            $exeFiles = Get-ChildItem -Path $Software.InstallLocation -Filter "*.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 5
            if ($exeFiles) {
                $latestAccess = ($exeFiles | Sort-Object LastAccessTime -Descending | Select-Object -First 1).LastAccessTime
                $usageInfo.LastUsed = $latestAccess
                
                # Determine frequency based on last access
                $daysSinceLastUse = (Get-Date) - $latestAccess
                if ($daysSinceLastUse.Days -le 7) {
                    $usageInfo.Frequency = "High"
                } elseif ($daysSinceLastUse.Days -le 30) {
                    $usageInfo.Frequency = "Medium"
                } elseif ($daysSinceLastUse.Days -le 90) {
                    $usageInfo.Frequency = "Low"
                } else {
                    $usageInfo.Frequency = "Unused"
                }
            }
        }
    } catch {
        # Ignore errors in usage detection
    }
    
    return $usageInfo
}

function Get-SoftwareSecurityRating {
    [CmdletBinding()]
    param([PSCustomObject]$Software)
    
    # Basic security rating based on publisher and software type
    $publisher = $Software.Publisher
    $displayName = $Software.DisplayName.ToLower()
    
    if ($publisher -in @("Microsoft Corporation", "Apple Inc.", "Google LLC", "Adobe Inc.")) {
        return "High"
    } elseif ($displayName -match "antivirus|security|firewall") {
        return "High"
    } elseif ($displayName -match "browser|chrome|firefox|edge") {
        return "Medium"
    } elseif ($Software.Version -and $Software.Version -match "^\d+\.\d+") {
        # Check if version is relatively recent (simplified check)
        try {
            $versionParts = $Software.Version.Split('.')
            $majorVersion = [int]$versionParts[0]
            if ($majorVersion -ge 10) {
                return "Medium"
            } else {
                return "Low"
            }
        } catch {
            return "Unknown"
        }
    } else {
        return "Unknown"
    }
}

function Export-SoftwareLicenseReport {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [array]$SoftwareInventory,
        
        [Parameter(Mandatory=$true)]
        [string]$OutputPath,
        
        [Parameter(Mandatory=$false)]
        [switch]$IncludeLicenseOptimization
    )
    
    try {
        # Export basic inventory
        $basicReport = $SoftwareInventory | Select-Object ComputerName, DisplayName, Version, Publisher, LicenseType, ComplianceStatus, LastUsed, UsageFrequency
        $basicReportPath = Join-Path $OutputPath "SoftwareLicenseInventory.csv"
        $basicReport | Export-Csv -Path $basicReportPath -NoTypeInformation -Encoding UTF8
        
        # Generate compliance summary
        $complianceSummary = $SoftwareInventory | Group-Object ComplianceStatus | Select-Object @{Name="ComplianceStatus";Expression={$_.Name}}, @{Name="Count";Expression={$_.Count}}
        $compliancePath = Join-Path $OutputPath "LicenseComplianceSummary.csv"
        $complianceSummary | Export-Csv -Path $compliancePath -NoTypeInformation -Encoding UTF8
        
        # Generate license optimization report if requested
        if ($IncludeLicenseOptimization) {
            $optimizationReport = $SoftwareInventory | Where-Object { $_.UsageFrequency -eq "Unused" -or $_.UsageFrequency -eq "Low" } |
                Select-Object ComputerName, DisplayName, Publisher, LicenseType, LastUsed, UsageFrequency, LicenseCost |
                Sort-Object LicenseCost -Descending
            
            $optimizationPath = Join-Path $OutputPath "LicenseOptimizationOpportunities.csv"
            $optimizationReport | Export-Csv -Path $optimizationPath -NoTypeInformation -Encoding UTF8
        }
        
        Write-Host "Software license reports exported to: $OutputPath" -ForegroundColor Green
        
    } catch {
        Write-Error "Failed to export software license report: $($_.Exception.Message)"
    }
}

#endregion

#region Main Discovery Function

<#
.SYNOPSIS
    Main application discovery function that orchestrates comprehensive application discovery
.DESCRIPTION
    Orchestrates application discovery from multiple sources including Intune, DNS, and internet-based discovery
    to build a complete application catalog for M&A migration planning.
.PARAMETER Configuration
    Hashtable containing discovery configuration settings
.PARAMETER Context
    Hashtable containing discovery context and session information
.PARAMETER SessionId
    Unique identifier for the discovery session
#>
function Invoke-ApplicationDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Starting Application discovery (v4.0)" -Level "HEADER"
    Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Using authentication session: $SessionId" -Level "INFO"

    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # 1. INITIALIZE RESULT OBJECT
    try {
        if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
            Import-Module -Name "$PSScriptRoot\..\Core\ClassDefinitions.psm1" -Force -ErrorAction Stop
        }
        $result = [DiscoveryResult]::new('Application')
    } catch {
        Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Failed to load DiscoveryResult class: $($_.Exception.Message)" -Level "ERROR"
        throw "Critical error: Cannot load required DiscoveryResult class. Discovery cannot proceed."
    }

    try {
        # 2. VALIDATE PREREQUISITES & CONTEXT
        Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Validating prerequisites..." -Level "INFO"

        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Output path: $outputPath" -Level "DEBUG"

        # Ensure output path exists
        if (-not (Test-Path -Path $outputPath -PathType Container)) {
            try {
                New-Item -Path $outputPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
            } catch {
                throw "Failed to create output directory: $outputPath. Error: $($_.Exception.Message)"
            }
        }

        # 3. AUTHENTICATE & CONNECT (Use client credentials from company configuration)
        Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Getting authentication for Graph service..." -Level "INFO"

        try {
            $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId

            # Validate Graph connection
            $testUri = "https://graph.microsoft.com/v1.0/organization"
            $testResponse = Invoke-MgGraphRequest -Uri $testUri -Method GET -ErrorAction Stop

            if (-not $testResponse) {
                throw "Graph connection test failed - no response"
            }

            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Graph connection validated" -Level "SUCCESS"
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Connected to Microsoft Graph via session authentication" -Level "SUCCESS"
        } catch {
            $result.AddError("Graph authentication validation failed: $($_.Exception.Message)", $_.Exception, $null)
            return $result
        }

        # 4. PERFORM DISCOVERY
        Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Starting data discovery" -Level "HEADER"

        $allDiscoveredData = [System.Collections.ArrayList]::new()

        # Get Intune applications if enabled
        if ($Configuration.ContainsKey('IncludeIntuneApps') -and $Configuration.IncludeIntuneApps) {
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Discovering Intune applications..." -Level "INFO"
            try {
                $intuneApps = Get-IntuneApplications -Configuration $Configuration -IncludeAssignments -IncludeUsageStats
                if ($intuneApps) {
                    $allDiscoveredData.AddRange($intuneApps)
                    Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Found $($intuneApps.Count) Intune applications" -Level "SUCCESS"
                } else {
                    Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "No Intune applications found" -Level "WARN"
                }
            } catch {
                Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Intune discovery failed: $($_.Exception.Message)" -Level "ERROR"
                $result.AddError("Intune discovery failed: $($_.Exception.Message)", $_.Exception, @{Section="Intune"})
            }
        }

        # Get DNS-based applications if enabled
        if ($Configuration.ContainsKey('IncludeDNSApps') -and $Configuration.IncludeDNSApps) {
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Discovering DNS-based applications..." -Level "INFO"
            try {
                # Get domains from configuration or use standard patterns
                $domainNames = @()
                if ($Configuration.ContainsKey('DiscoveryDomains')) {
                    $domainNames = $Configuration.DiscoveryDomains
                } else {
                    # Default domains based on common enterprise patterns
                    $domainNames = @('contoso.com', 'fabrikam.com', 'company.local', 'corporate.com')
                }

                $dnsApps = Get-DNSApplications -DomainNames $domainNames
                if ($dnsApps) {
                    $allDiscoveredData.AddRange($dnsApps)
                    Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Found $($dnsApps.Count) DNS applications" -Level "SUCCESS"
                } else {
                    Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "No DNS-based applications found" -Level "WARN"
                }
            } catch {
                Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "DNS discovery failed: $($_.Exception.Message)" -Level "ERROR"
                $result.AddError("DNS discovery failed: $($_.Exception.Message)", $_.Exception, @{Section="DNS"})
            }
        }

        # Add local software inventory if enabled
        if ($Configuration.ContainsKey('IncludeLocalSoftware') -and $Configuration.IncludeLocalSoftware) {
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Discovering local software inventory..." -Level "INFO"
            try {
                $localSoftware = Get-SoftwareLicenseInventory -SessionId $SessionId
                if ($localSoftware) {
                    # Convert software objects to application format
                    foreach ($software in $localSoftware) {
                        $appData = [PSCustomObject]@{
                            Name = $software.DisplayName
                            Vendor = $software.Publisher
                            Version = $software.Version
                            Platform = Get-AppPlatform -ODataType "" # Default to Windows for local software
                            Category = "Client Application"
                            DiscoverySource = "Local Software Inventory"
                            DiscoveredAt = Get-Date
                            LicenseType = $software.LicenseType
                            ComplianceStatus = $software.ComplianceStatus
                            _ObjectType = "LocalApplication"
                        }
                        $allDiscoveredData.Add($appData) | Out-Null
                    }
                    Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Found $($localSoftware.Count) local software applications" -Level "SUCCESS"
                }
            } catch {
                Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Local software discovery failed: $($_.Exception.Message)" -Level "ERROR"
                $result.AddError("Local software discovery failed: $($_.Exception.Message)", $_.Exception, @{Section="Local"})
            }
        }

        Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Total applications discovered: $($allDiscoveredData.Count)" -Level "SUCCESS"

        # Create application catalog
        if ($allDiscoveredData.Count -gt 0) {
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Creating application catalog..." -Level "INFO"

            $catalogResult = New-ApplicationCatalog -Applications $allDiscoveredData
            $applicationCatalog = $catalogResult.Applications
            $statistics = $catalogResult.Statistics

            # Test connectivity for select applications
            if ($Configuration.ContainsKey('TestConnectivity') -and $Configuration.TestConnectivity -and $applicationCatalog.Applications.Count -gt 0) {
                Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Testing application connectivity for top applications..." -Level "INFO"
                $topApplications = $applicationCatalog.Applications | Where-Object { $_.URL -and $_.URL -like "https://*" } | Select-Object -First 10
                foreach ($app in $topApplications) {
                    try {
                        $connectivity = Test-ApplicationConnectivity -Application $app
                        $app | Add-Member -MemberType NoteProperty -Name "ConnectivityTested" -Value $true -Force
                        $app | Add-Member -MemberType NoteProperty -Name "IsAccessible" -Value $connectivity.IsAccessible -Force
                        $app | Add-Member -MemberType NoteProperty -Name "ResponseTime" -Value $connectivity.ResponseTime -Force
                    } catch {
                        Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Connectivity test failed for $($app.Name): $($_.Exception.Message)" -Level "WARN"
                    }
                }
            }

            # Export results
            Export-ApplicationCatalog -ApplicationCatalog $applicationCatalog.Applications -Statistics $statistics -OutputPath $outputPath
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Application catalog exported to: $outputPath" -Level "SUCCESS"

            $result.Data = $applicationCatalog.Applications
            $result.RecordCount = $applicationCatalog.Applications.Count
        } else {
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "No applications discovered" -Level "WARN"
            $result.Data = @()
            $result.RecordCount = 0
        }

        # 5. FINALIZE METADATA
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        $result.Metadata["SessionId"] = $SessionId
        $result.Metadata["ConfigurationApplied"] = $Configuration

    } catch [System.UnauthorizedAccessException] {
        $result.AddError("Access denied: $($_.Exception.Message)", $_.Exception, @{ErrorType="Authorization"})
        Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Authorization error: $($_.Exception.Message)" -Level "ERROR"
    } catch [System.Net.WebException] {
        $result.AddError("Network error: $($_.Exception.Message)", $_.Exception, @{ErrorType="Network"})
        Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Network error: $($_.Exception.Message)" -Level "ERROR"
    } catch {
        $result.AddError("Unexpected error: $($_.Exception.Message)", $_.Exception, @{ErrorType="General"})
        Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Critical error: $($_.Exception.Message)" -Level "ERROR"
    } finally {
        # Ensure RecordCount is properly set before cleanup
        $result.RecordCount = if ($result.Data) { $result.Data.Count } else { 0 }

        Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Discovery completed with $($result.RecordCount) records" -Level $(if($result.Success){"SUCCESS"}else{"ERROR"})

        # Disconnect Graph API
        try {
            Disconnect-MgGraph -ErrorAction SilentlyContinue
        } catch {
            Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Error disconnecting Graph API: $($_.Exception.Message)" -Level "WARN"
        }

        $stopwatch.Stop()
        $result.EndTime = Get-Date

        Write-ModuleLog -ModuleName "ApplicationDiscovery" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Level "HEADER"
    }

    return $result
}

#endregion

# Export module functions
Export-ModuleMember -Function @(
    'Get-IntuneApplications',
    'Get-DNSApplications', 
    'Search-ApplicationDetails',
    'New-ApplicationCatalog',
    'Get-ApplicationMigrationPath',
    'Update-ApplicationMetadata',
    'Export-ApplicationCatalog',
    'Test-ApplicationConnectivity',
    'Get-SoftwareLicenseInventory',
    'Export-SoftwareLicenseReport',
    'Invoke-ApplicationDiscovery'
)
