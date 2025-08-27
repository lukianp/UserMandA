#Requires -Version 5.1
using namespace System.Collections.Generic

Set-StrictMode -Version 3.0

class SharePointMigration {
    [string]$SourceEnvironment
    [string]$TargetEnvironment
    [object]$SourceCredential
    [object]$TargetCredential
    [string]$SourceTenantId
    [string]$TargetTenantId
    [string]$MigrationType
    [hashtable]$MigrationConfig
    [array]$MigrationBatches
    [hashtable]$MigrationStatus
    [string]$LogPath
    [object]$SourceConnection
    [object]$TargetConnection
    [hashtable]$SiteMap
    [array]$ContentAnalysis
    
    SharePointMigration([string]$migrationType) {
        $this.MigrationType = $migrationType # OnPremToOnline, OnlineToOnline, OnPremToOnPrem, HybridMigration
        $this.MigrationConfig = @{
            BatchSize = 10
            MaxSiteCollectionSize = 100 # GB
            PreserveVersionHistory = $true
            PreservePermissions = $true
            PreserveMetadata = $true
            PreserveWorkflows = $false
            MigrateSubsites = $true
            MigrateDocumentLibraries = $true
            MigrateLists = $true
            MigratePages = $true
            MigrateWebParts = $true
            MigrateManagedMetadata = $true
            PreserveManagedMetadataIds = $true
            MaxFileSize = 15 # GB
            MaxRetryAttempts = 3
            RetryDelay = 300 # seconds
            UseIncrementalMigration = $true
            ValidateChecksums = $true
            CreateTargetStructure = $true
            MapUserAccounts = $true
            NotificationEmails = @()
            TempStorage = "$env:TEMP\SPMigration"
            LogLevel = 'Verbose'
            ConcurrentConnections = 5
            ThrottlingDelay = 1000 # milliseconds
            PreMigrationValidation = $true
            PostMigrationValidation = $true
            ContentTypeMapping = @{}
            FieldMapping = @{}
            PermissionMapping = @{}
            CustomSolutionHandling = 'Skip'
            WorkflowMigrationStrategy = 'PowerAutomate'
            LargeBinaryObjectHandling = 'Stream'
        }
        $this.MigrationBatches = @()
        $this.MigrationStatus = @{}
        $this.LogPath = ".\Logs\SharePointMigration_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
        $this.SiteMap = @{}
        $this.ContentAnalysis = @()
        $this.InitializeLogging()
    }
    
    hidden [void] InitializeLogging() {
        $logDir = Split-Path $this.LogPath -Parent
        if (!(Test-Path $logDir)) {
            New-Item -ItemType Directory -Path $logDir -Force | Out-Null
        }
        
        $this.WriteLog("SharePointMigration module initialized", "INFO")
        $this.WriteLog("Migration Type: $($this.MigrationType)", "INFO")
        $this.WriteLog("Configuration: $($this.MigrationConfig | ConvertTo-Json -Depth 2)", "DEBUG")
    }
    
    hidden [void] WriteLog([string]$message, [string]$level = "INFO") {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $logEntry = "[$timestamp] [$level] $message"
        Add-Content -Path $this.LogPath -Value $logEntry
        
        switch ($level) {
            "ERROR" { Write-Host $logEntry -ForegroundColor Red }
            "WARNING" { Write-Host $logEntry -ForegroundColor Yellow }
            "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
            "VERBOSE" { 
                if ($this.MigrationConfig.LogLevel -eq 'Verbose') {
                    Write-Host $logEntry -ForegroundColor Cyan 
                }
            }
            default { Write-Host $logEntry -ForegroundColor White }
        }
    }
    
    [void] SetSourceEnvironment([string]$environment, [pscredential]$credential, [string]$tenantId = $null) {
        $this.SourceEnvironment = $environment
        $this.SourceCredential = $credential
        $this.SourceTenantId = $tenantId
        $this.WriteLog("Source environment configured: $environment", "INFO")
    }
    
    [void] SetTargetEnvironment([string]$environment, [pscredential]$credential, [string]$tenantId = $null) {
        $this.TargetEnvironment = $environment
        $this.TargetCredential = $credential
        $this.TargetTenantId = $tenantId
        $this.WriteLog("Target environment configured: $environment", "INFO")
    }
    
    [void] ConnectToSharePoint() {
        $this.WriteLog("Connecting to SharePoint environments", "INFO")
        
        try {
            # Import required modules
            if (!(Get-Module -Name "PnP.PowerShell" -ListAvailable)) {
                throw "PnP.PowerShell module is required but not installed. Install with: Install-Module PnP.PowerShell -Force"
            }
            
            Import-Module PnP.PowerShell -Force
            
            # Connect to source SharePoint
            $this.ConnectToSourceSharePoint()
            
            # Connect to target SharePoint
            $this.ConnectToTargetSharePoint()
            
            $this.WriteLog("Successfully connected to both SharePoint environments", "SUCCESS")
        }
        catch {
            $this.WriteLog("Failed to connect to SharePoint: $($_.Exception.Message)", "ERROR")
            throw
        }
    }
    
    hidden [void] ConnectToSourceSharePoint() {
        $this.WriteLog("Connecting to source SharePoint environment", "VERBOSE")
        
        try {
            switch ($this.MigrationType) {
                { $_ -in @('OnPremToOnline', 'OnPremToOnPrem') } {
                    # On-premises SharePoint connection
                    if ($this.SourceCredential) {
                        $this.SourceConnection = Connect-PnPOnline -Url $this.SourceEnvironment -Credentials $this.SourceCredential -ReturnConnection
                    } else {
                        $this.SourceConnection = Connect-PnPOnline -Url $this.SourceEnvironment -UseWebLogin -ReturnConnection
                    }
                }
                
                { $_ -in @('OnlineToOnline', 'HybridMigration') } {
                    # SharePoint Online connection
                    if ($this.SourceTenantId) {
                        $this.SourceConnection = Connect-PnPOnline -Url $this.SourceEnvironment -Interactive -TenantId $this.SourceTenantId -ReturnConnection
                    } else {
                        $this.SourceConnection = Connect-PnPOnline -Url $this.SourceEnvironment -Interactive -ReturnConnection
                    }
                }
            }
            
            $this.WriteLog("Connected to source SharePoint: $($this.SourceEnvironment)", "SUCCESS")
        }
        catch {
            $this.WriteLog("Failed to connect to source SharePoint: $($_.Exception.Message)", "ERROR")
            throw
        }
    }
    
    hidden [void] ConnectToTargetSharePoint() {
        $this.WriteLog("Connecting to target SharePoint environment", "VERBOSE")
        
        try {
            switch ($this.MigrationType) {
                { $_ -in @('OnPremToOnPrem') } {
                    # On-premises SharePoint connection
                    if ($this.TargetCredential) {
                        $this.TargetConnection = Connect-PnPOnline -Url $this.TargetEnvironment -Credentials $this.TargetCredential -ReturnConnection
                    } else {
                        $this.TargetConnection = Connect-PnPOnline -Url $this.TargetEnvironment -UseWebLogin -ReturnConnection
                    }
                }
                
                { $_ -in @('OnPremToOnline', 'OnlineToOnline', 'HybridMigration') } {
                    # SharePoint Online connection
                    if ($this.TargetTenantId) {
                        $this.TargetConnection = Connect-PnPOnline -Url $this.TargetEnvironment -Interactive -TenantId $this.TargetTenantId -ReturnConnection
                    } else {
                        $this.TargetConnection = Connect-PnPOnline -Url $this.TargetEnvironment -Interactive -ReturnConnection
                    }
                }
            }
            
            $this.WriteLog("Connected to target SharePoint: $($this.TargetEnvironment)", "SUCCESS")
        }
        catch {
            $this.WriteLog("Failed to connect to target SharePoint: $($_.Exception.Message)", "ERROR")
            throw
        }
    }
    
    [hashtable] DiscoverSourceContent([array]$siteUrls = @(), [hashtable]$options = @{}) {
        $this.WriteLog("Starting SharePoint content discovery", "INFO")
        
        $discovery = @{
            SiteCollections = @()
            Subsites = @()
            DocumentLibraries = @()
            Lists = @()
            Pages = @()
            WebParts = @()
            ContentTypes = @()
            Fields = @()
            Permissions = @()
            ManagedMetadata = @()
            Workflows = @()
            CustomSolutions = @()
            Statistics = @{
                TotalSites = 0
                TotalLibraries = 0
                TotalLists = 0
                TotalFiles = 0
                TotalSizeGB = 0
                LargestSiteGB = 0
                AverageSizeGB = 0
                ComplexityScore = 0
            }
            Issues = @()
            Recommendations = @()
        }
        
        try {
            # Get site collections to analyze
            $sitesToAnalyze = if ($siteUrls.Count -gt 0) {
                $siteUrls
            } else {
                $this.GetAllSiteCollections()
            }
            
            foreach ($siteUrl in $sitesToAnalyze) {
                $this.WriteLog("Analyzing site: $siteUrl", "INFO")
                
                try {
                    # Connect to the site
                    Connect-PnPOnline -Url $siteUrl -Connection $this.SourceConnection
                    
                    # Get site collection information
                    $site = Get-PnPSite -Connection $this.SourceConnection -Includes *
                    $web = Get-PnPWeb -Connection $this.SourceConnection -Includes *
                    
                    $siteInfo = @{
                        Url = $site.Url
                        Title = $web.Title
                        Description = $web.Description
                        Template = $web.WebTemplate
                        Language = $web.Language
                        Created = $web.Created
                        LastModified = $web.LastItemModifiedDate
                        Owner = $site.Owner.LoginName
                        StorageUsed = [math]::Round($site.Usage.Storage / 1GB, 2)
                        StorageQuota = [math]::Round($site.Usage.StorageQuota / 1GB, 2)
                        Subsites = @()
                        Libraries = @()
                        Lists = @()
                        Features = @()
                        CustomSolutions = @()
                        Permissions = @()
                        Issues = @()
                        MigrationComplexity = "Low"
                    }
                    
                    # Analyze subsites
                    $subsites = Get-PnPSubWebs -Connection $this.SourceConnection -Recurse
                    foreach ($subsite in $subsites) {
                        $subsiteInfo = @{
                            Url = $subsite.Url
                            Title = $subsite.Title
                            Template = $subsite.WebTemplate
                            Created = $subsite.Created
                            LastModified = $subsite.LastItemModifiedDate
                        }
                        $siteInfo.Subsites += $subsiteInfo
                        $discovery.Subsites += $subsiteInfo
                    }
                    
                    # Analyze document libraries
                    $libraries = Get-PnPList -Connection $this.SourceConnection | Where-Object { $_.BaseTemplate -eq 101 }
                    foreach ($library in $libraries) {
                        $libraryStats = Get-PnPFolderStorageMetric -FolderSiteRelativeUrl $library.RootFolder.ServerRelativeUrl -Connection $this.SourceConnection
                        
                        $libraryInfo = @{
                            Title = $library.Title
                            Url = $library.DefaultViewUrl
                            ItemCount = $library.ItemCount
                            SizeGB = [math]::Round($libraryStats.TotalSize / 1GB, 2)
                            LastModified = $library.LastItemModifiedDate
                            VersioningEnabled = $library.EnableVersioning
                            RequireCheckOut = $library.ForceCheckout
                            ContentTypesEnabled = $library.ContentTypesEnabled
                            MajorVersionLimit = $library.MajorVersionLimit
                            MinorVersionLimit = $library.MinorVersionLimit
                            HasCustomViews = ($library.Views | Where-Object { !$_.Hidden }).Count -gt 1
                            HasWorkflows = @()
                            HasCustomPermissions = $library.HasUniqueRoleAssignments
                        }
                        
                        # Check for large files
                        $largeFiles = Get-PnPListItem -List $library -Connection $this.SourceConnection -PageSize 1000 | 
                            Where-Object { $_.FieldValues.File_x0020_Size -gt (15GB) }
                        
                        if ($largeFiles.Count -gt 0) {
                            $libraryInfo.Issues += "Contains files larger than 15GB (not supported in SharePoint Online)"
                            $siteInfo.MigrationComplexity = "High"
                        }
                        
                        $siteInfo.Libraries += $libraryInfo
                        $discovery.DocumentLibraries += $libraryInfo
                    }
                    
                    # Analyze custom lists
                    $customLists = Get-PnPList -Connection $this.SourceConnection | Where-Object { 
                        $_.BaseTemplate -notin @(101, 100, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 150, 200, 201, 202, 204, 207, 301, 302, 303, 402, 403, 404, 405, 420, 421, 499, 600, 700, 800, 801, 850, 851, 899, 900, 901, 902, 903, 904, 905, 906, 907, 908, 909, 910, 911, 912, 913, 914, 915, 916, 917, 918, 919, 920, 950, 960, 1100, 1200, 1220, 1221, 1230)
                    }
                    
                    foreach ($list in $customLists) {
                        $listInfo = @{
                            Title = $list.Title
                            Template = $list.BaseTemplate
                            ItemCount = $list.ItemCount
                            LastModified = $list.LastItemModifiedDate
                            HasCustomViews = ($list.Views | Where-Object { !$_.Hidden }).Count -gt 1
                            HasCustomPermissions = $list.HasUniqueRoleAssignments
                            ContentTypesEnabled = $list.ContentTypesEnabled
                        }
                        
                        $siteInfo.Lists += $listInfo
                        $discovery.Lists += $listInfo
                    }
                    
                    # Analyze features
                    $features = Get-PnPFeature -Scope Web -Connection $this.SourceConnection
                    foreach ($feature in $features) {
                        if ($feature.DefinitionId -notin $this.GetStandardFeatures()) {
                            $siteInfo.Features += @{
                                Id = $feature.DefinitionId
                                DisplayName = $feature.DisplayName
                                IsCustom = $true
                            }
                            $siteInfo.MigrationComplexity = "High"
                        }
                    }
                    
                    # Analyze content types
                    $contentTypes = Get-PnPContentType -Connection $this.SourceConnection
                    foreach ($ct in $contentTypes) {
                        $ctInfo = @{
                            Name = $ct.Name
                            Id = $ct.Id
                            Group = $ct.Group
                            Hidden = $ct.Hidden
                            ReadOnly = $ct.ReadOnly
                            Fields = $ct.Fields.Count
                            IsCustom = $ct.Group -notin @("Document Content Types", "List Content Types", "System", "Standard")
                        }
                        $discovery.ContentTypes += $ctInfo
                    }
                    
                    # Analyze permissions
                    $permissions = Get-PnPWebPermission -Connection $this.SourceConnection
                    foreach ($permission in $permissions) {
                        $permInfo = @{
                            SiteUrl = $siteUrl
                            Principal = $permission.Member
                            PrincipalType = $permission.PrincipalType
                            Roles = $permission.Roles -join ", "
                        }
                        $siteInfo.Permissions += $permInfo
                        $discovery.Permissions += $permInfo
                    }
                    
                    # Check for custom solutions (SharePoint On-Premises only)
                    if ($this.MigrationType -match "OnPrem") {
                        try {
                            $solutions = Get-PnPApp -Connection $this.SourceConnection
                            foreach ($solution in $solutions) {
                                $solutionInfo = @{
                                    Title = $solution.Title
                                    Id = $solution.Id
                                    Version = $solution.InstalledVersion
                                    Status = $solution.AppCatalogVersion
                                }
                                $siteInfo.CustomSolutions += $solutionInfo
                                $discovery.CustomSolutions += $solutionInfo
                                
                                if ($solution.Title -notin $this.GetSupportedApps()) {
                                    $siteInfo.Issues += "Custom solution '$($solution.Title)' may not be compatible with target environment"
                                    $siteInfo.MigrationComplexity = "High"
                                }
                            }
                        }
                        catch {
                            $this.WriteLog("Could not analyze custom solutions for site $siteUrl : $($_.Exception.Message)", "WARNING")
                        }
                    }
                    
                    # Calculate complexity score
                    $complexityFactors = 0
                    if ($siteInfo.Libraries.Count -gt 20) { $complexityFactors++ }
                    if ($siteInfo.Lists.Count -gt 50) { $complexityFactors++ }
                    if ($siteInfo.Subsites.Count -gt 10) { $complexityFactors++ }
                    if ($siteInfo.Features.Count -gt 0) { $complexityFactors += 2 }
                    if ($siteInfo.CustomSolutions.Count -gt 0) { $complexityFactors += 3 }
                    if ($siteInfo.StorageUsed -gt 100) { $complexityFactors += 2 }
                    
                    $siteInfo.ComplexityScore = $complexityFactors
                    if ($complexityFactors -gt 5) {
                        $siteInfo.MigrationComplexity = "High"
                    } elseif ($complexityFactors -gt 2) {
                        $siteInfo.MigrationComplexity = "Medium"
                    }
                    
                    $discovery.SiteCollections += $siteInfo
                    $this.SiteMap[$siteUrl] = $siteInfo
                    
                    $this.WriteLog("Site analysis completed: $siteUrl - Complexity: $($siteInfo.MigrationComplexity)", "SUCCESS")
                }
                catch {
                    $this.WriteLog("Failed to analyze site $siteUrl : $($_.Exception.Message)", "ERROR")
                    $discovery.Issues += "Failed to analyze site: $siteUrl - $($_.Exception.Message)"
                }
            }
            
            # Calculate overall statistics
            $discovery.Statistics.TotalSites = $discovery.SiteCollections.Count
            $discovery.Statistics.TotalLibraries = $discovery.DocumentLibraries.Count
            $discovery.Statistics.TotalLists = $discovery.Lists.Count
            $discovery.Statistics.TotalFiles = ($discovery.DocumentLibraries | Measure-Object -Property ItemCount -Sum).Sum
            $discovery.Statistics.TotalSizeGB = [math]::Round(($discovery.SiteCollections | Measure-Object -Property StorageUsed -Sum).Sum, 2)
            
            if ($discovery.SiteCollections.Count -gt 0) {
                $discovery.Statistics.LargestSiteGB = ($discovery.SiteCollections | Measure-Object -Property StorageUsed -Maximum).Maximum
                $discovery.Statistics.AverageSizeGB = [math]::Round(($discovery.SiteCollections | Measure-Object -Property StorageUsed -Average).Average, 2)
                $discovery.Statistics.ComplexityScore = [math]::Round(($discovery.SiteCollections | Measure-Object -Property ComplexityScore -Average).Average, 1)
            }
            
            # Generate recommendations
            $discovery.Recommendations += $this.GenerateMigrationRecommendations($discovery)
            
            $this.WriteLog("Content discovery completed. Found $($discovery.Statistics.TotalSites) sites, $($discovery.Statistics.TotalSizeGB) GB total", "SUCCESS")
            
            return $discovery
        }
        catch {
            $this.WriteLog("Content discovery failed: $($_.Exception.Message)", "ERROR")
            throw
        }
    }
    
    hidden [array] GetAllSiteCollections() {
        try {
            # This would typically connect to SharePoint Admin Center for SPO or Central Admin for On-Prem
            $sites = @()
            
            if ($this.MigrationType -match "Online") {
                # For SharePoint Online, use SharePoint Admin PowerShell
                $adminUrl = $this.SourceEnvironment -replace "\.sharepoint\.com.*", "-admin.sharepoint.com"
                $sites = Get-PnPTenantSite -Connection $this.SourceConnection
            } else {
                # For On-Premises, would need to query Central Administration or use specific cmdlets
                # For now, return the root site collection
                $sites = @($this.SourceEnvironment)
            }
            
            return $sites
        }
        catch {
            $this.WriteLog("Could not enumerate all site collections, using provided URLs only", "WARNING")
            return @($this.SourceEnvironment)
        }
    }
    
    hidden [array] GetStandardFeatures() {
        # Return array of standard SharePoint feature GUIDs that don't affect migration complexity
        return @(
            "00bfea71-de22-43b2-a848-c05709900100",  # Basic Web Parts
            "00bfea71-4ea5-48d4-a4ad-7ea5c011abe5",  # Team Collaboration Lists
            "00bfea71-d1ce-42de-9c63-a44004ce0104",  # Document Libraries
            # Add more standard feature GUIDs as needed
        )
    }
    
    hidden [array] GetSupportedApps() {
        # Return array of apps/solutions that are known to be compatible
        return @(
            "Microsoft 365 Apps",
            "Power BI",
            "Power Apps",
            "Microsoft Teams"
        )
    }
    
    hidden [array] GenerateMigrationRecommendations([hashtable]$discovery) {
        $recommendations = @()
        
        # Size-based recommendations
        if ($discovery.Statistics.TotalSizeGB -gt 1000) {
            $recommendations += "Consider chunked migration for large content volume (>1TB)"
        }
        
        # Complexity-based recommendations
        if ($discovery.Statistics.ComplexityScore -gt 7) {
            $recommendations += "High complexity migration detected - consider pilot migration first"
        }
        
        # Custom solution recommendations
        if ($discovery.CustomSolutions.Count -gt 0) {
            $recommendations += "Review and test custom solutions in target environment before migration"
        }
        
        # Workflow recommendations
        $workflowCount = ($discovery.SiteCollections | ForEach-Object { $_.Workflows }).Count
        if ($workflowCount -gt 0) {
            $recommendations += "Plan workflow migration strategy - consider Power Automate for SharePoint Online"
        }
        
        # Performance recommendations
        if ($discovery.Statistics.TotalFiles -gt 1000000) {
            $recommendations += "Large file count detected - consider incremental migration approach"
        }
        
        return $recommendations
    }
    
    [hashtable] CreateMigrationBatches([array]$sitesToMigrate, [hashtable]$options = @{}) {
        $this.WriteLog("Creating SharePoint migration batches", "INFO")
        
        $batchConfig = $this.MigrationConfig.Clone()
        foreach ($key in $options.Keys) {
            $batchConfig[$key] = $options[$key]
        }
        
        $batchResult = @{
            Batches = @()
            TotalSites = $sitesToMigrate.Count
            EstimatedDurationHours = 0
            RiskAssessment = @{
                High = @()
                Medium = @()
                Low = @()
            }
            PrerequisiteChecks = @()
        }
        
        # Sort sites by complexity and size (simple and small first)
        $sortedSites = $sitesToMigrate | Sort-Object ComplexityScore, StorageUsed
        
        $batchSize = $batchConfig.BatchSize
        $batchNumber = 1
        
        for ($i = 0; $i -lt $sortedSites.Count; $i += $batchSize) {
            $batchSites = $sortedSites[$i..[Math]::Min($i + $batchSize - 1, $sortedSites.Count - 1)]
            
            $batch = @{
                BatchNumber = $batchNumber
                BatchName = "SharePointMigrationBatch$batchNumber"
                Sites = $batchSites
                TotalSizeGB = ($batchSites | Measure-Object -Property StorageUsed -Sum).Sum
                EstimatedDurationHours = $this.CalculateMigrationDuration($batchSites)
                RiskLevel = $this.AssessBatchRisk($batchSites)
                Prerequisites = @()
                Dependencies = @()
                Status = "NotStarted"
                CreatedDate = Get-Date
                MigrationOrder = @()
            }
            
            # Add prerequisites based on site characteristics
            foreach ($site in $batchSites) {
                if ($site.CustomSolutions.Count -gt 0) {
                    $batch.Prerequisites += "Validate custom solutions for sites: $($site.Url)"
                }
                
                if ($site.MigrationComplexity -eq "High") {
                    $batch.Prerequisites += "Complex site requires pre-migration validation: $($site.Url)"
                }
                
                if ($site.StorageUsed -gt 50) {
                    $batch.Prerequisites += "Large site may require extended migration window: $($site.Url)"
                }
                
                # Determine migration order based on dependencies
                if ($site.Subsites.Count -gt 0) {
                    $batch.MigrationOrder += @{
                        Site = $site.Url
                        Order = 1  # Parent sites first
                        Type = "SiteCollection"
                    }
                    
                    foreach ($subsite in $site.Subsites) {
                        $batch.MigrationOrder += @{
                            Site = $subsite.Url
                            Order = 2  # Subsites after parent
                            Type = "Subsite"
                            Parent = $site.Url
                        }
                    }
                } else {
                    $batch.MigrationOrder += @{
                        Site = $site.Url
                        Order = 1
                        Type = "SiteCollection"
                    }
                }
            }
            
            # Sort migration order
            $batch.MigrationOrder = $batch.MigrationOrder | Sort-Object Order, Site
            
            $batchResult.Batches += $batch
            $batchNumber++
        }
        
        # Calculate total estimated duration
        $batchResult.EstimatedDurationHours = ($batchResult.Batches | Measure-Object -Property EstimatedDurationHours -Sum).Sum
        
        # Risk assessment
        foreach ($site in $sitesToMigrate) {
            $riskLevel = $this.AssessSiteMigrationRisk($site)
            $batchResult.RiskAssessment[$riskLevel] += $site.Url
        }
        
        # Generate prerequisite checks
        $batchResult.PrerequisiteChecks = @(
            "Verify SharePoint Online license allocation",
            "Confirm network bandwidth requirements",
            "Validate user account mappings",
            "Test permissions in target environment",
            "Backup source environment",
            "Create migration service accounts",
            "Configure SharePoint Online settings",
            "Prepare content type hub (if using managed metadata)"
        )
        
        $this.MigrationBatches = $batchResult.Batches
        $this.WriteLog("Created $($batchResult.Batches.Count) migration batches", "SUCCESS")
        
        return $batchResult
    }
    
    hidden [double] CalculateMigrationDuration([array]$sites) {
        $totalHours = 0
        
        foreach ($site in $sites) {
            # Base time calculation: 1 hour per GB + complexity factors
            $baseTime = [Math]::Max($site.StorageUsed * 1, 0.5)  # Minimum 30 minutes per site
            
            # Complexity multipliers
            $complexityMultiplier = switch ($site.MigrationComplexity) {
                "High" { 3.0 }
                "Medium" { 2.0 }
                default { 1.0 }
            }
            
            # Content multipliers
            $contentMultiplier = 1.0
            if ($site.Libraries.Count -gt 10) { $contentMultiplier += 0.5 }
            if ($site.Lists.Count -gt 20) { $contentMultiplier += 0.3 }
            if ($site.Subsites.Count -gt 5) { $contentMultiplier += 0.4 }
            
            $siteTime = $baseTime * $complexityMultiplier * $contentMultiplier
            $totalHours += $siteTime
        }
        
        return [Math]::Ceiling($totalHours)
    }
    
    hidden [string] AssessBatchRisk([array]$sites) {
        $highRiskCount = ($sites | Where-Object { $_.MigrationComplexity -eq "High" }).Count
        $mediumRiskCount = ($sites | Where-Object { $_.MigrationComplexity -eq "Medium" }).Count
        $totalSize = ($sites | Measure-Object -Property StorageUsed -Sum).Sum
        
        if ($highRiskCount -gt 0 -or $totalSize -gt 200) {
            return "High"
        }
        elseif ($mediumRiskCount -gt 0 -or $totalSize -gt 50) {
            return "Medium"
        }
        else {
            return "Low"
        }
    }
    
    hidden [string] AssessSiteMigrationRisk([hashtable]$site) {
        if ($site.MigrationComplexity -eq "High" -or $site.StorageUsed -gt 200) {
            return "High"
        }
        
        if ($site.MigrationComplexity -eq "Medium" -or $site.StorageUsed -gt 50 -or $site.CustomSolutions.Count -gt 0) {
            return "Medium"
        }
        
        return "Low"
    }
    
    [hashtable] ExecuteMigration([array]$batchesToMigrate, [hashtable]$options = @{}) {
        $this.WriteLog("Starting SharePoint migration execution", "INFO")
        
        $migrationResult = @{
            Status = "Running"
            StartTime = Get-Date
            EndTime = $null
            TotalBatches = $batchesToMigrate.Count
            CompletedBatches = 0
            FailedBatches = 0
            TotalSites = ($batchesToMigrate | ForEach-Object { $_.Sites.Count } | Measure-Object -Sum).Sum
            MigratedSites = 0
            FailedSites = 0
            Errors = @()
            BatchResults = @()
            OverallProgress = 0
        }
        
        try {
            foreach ($batch in $batchesToMigrate) {
                $this.WriteLog("Processing migration batch: $($batch.BatchName)", "INFO")
                
                # Pre-batch validation
                if ($this.MigrationConfig.PreMigrationValidation) {
                    $validationResult = $this.ValidateBatchPrerequisites($batch)
                    if (!$validationResult.IsValid) {
                        $migrationResult.Errors += "Batch validation failed: $($validationResult.Errors -join ', ')"
                        continue
                    }
                }
                
                $batchResult = $this.ExecuteBatchMigration($batch, $options)
                $migrationResult.BatchResults += $batchResult
                
                if ($batchResult.Status -eq "Completed") {
                    $migrationResult.CompletedBatches++
                    $migrationResult.MigratedSites += $batchResult.SuccessfulMigrations
                } else {
                    $migrationResult.FailedBatches++
                    $migrationResult.Errors += $batchResult.Errors
                }
                
                $migrationResult.FailedSites += $batchResult.FailedMigrations
                $migrationResult.OverallProgress = [math]::Round(($migrationResult.MigratedSites / $migrationResult.TotalSites) * 100, 2)
                
                # Update batch status
                $batch.Status = $batchResult.Status
                
                # Stop on critical error if configured
                if ($options.StopOnCriticalError -and $batchResult.Status -eq "Failed") {
                    $this.WriteLog("Stopping migration due to critical error", "ERROR")
                    break
                }
                
                # Pause between batches if configured
                if ($options.BatchDelay -and $options.BatchDelay -gt 0) {
                    $this.WriteLog("Pausing $($options.BatchDelay) seconds between batches", "INFO")
                    Start-Sleep -Seconds $options.BatchDelay
                }
            }
            
            $migrationResult.Status = if ($migrationResult.FailedBatches -eq 0) { "Completed" } else { "CompletedWithErrors" }
            $migrationResult.EndTime = Get-Date
            
            $this.WriteLog("Migration completed. Batches: $($migrationResult.CompletedBatches)/$($migrationResult.TotalBatches), Sites: $($migrationResult.MigratedSites)/$($migrationResult.TotalSites)", "SUCCESS")
        }
        catch {
            $migrationResult.Status = "Failed"
            $migrationResult.EndTime = Get-Date
            $migrationResult.Errors += $_.Exception.Message
            $this.WriteLog("Migration failed: $($_.Exception.Message)", "ERROR")
        }
        
        return $migrationResult
    }
    
    hidden [hashtable] ValidateBatchPrerequisites([hashtable]$batch) {
        $validation = @{
            IsValid = $true
            Errors = @()
            Warnings = @()
        }
        
        try {
            # Check target environment capacity
            $totalBatchSize = $batch.TotalSizeGB
            
            # Validate each site in the batch
            foreach ($site in $batch.Sites) {
                # Check if site exists in target
                try {
                    $targetSiteUrl = $this.MapSourceToTargetUrl($site.Url)
                    $existingSite = Get-PnPSite -Identity $targetSiteUrl -Connection $this.TargetConnection -ErrorAction SilentlyContinue
                    
                    if ($existingSite) {
                        $validation.Warnings += "Target site already exists: $targetSiteUrl"
                    }
                }
                catch {
                    # Site doesn't exist, which is expected for new migrations
                }
                
                # Validate site size limits
                if ($site.StorageUsed -gt $this.MigrationConfig.MaxSiteCollectionSize) {
                    $validation.Errors += "Site exceeds maximum size limit: $($site.Url) ($($site.StorageUsed)GB > $($this.MigrationConfig.MaxSiteCollectionSize)GB)"
                    $validation.IsValid = $false
                }
                
                # Check for custom solutions
                if ($site.CustomSolutions.Count -gt 0 -and $this.MigrationConfig.CustomSolutionHandling -eq 'Block') {
                    $validation.Errors += "Site contains custom solutions that are not allowed: $($site.Url)"
                    $validation.IsValid = $false
                }
            }
            
            return $validation
        }
        catch {
            $validation.IsValid = $false
            $validation.Errors += "Validation failed: $($_.Exception.Message)"
            return $validation
        }
    }
    
    hidden [string] MapSourceToTargetUrl([string]$sourceUrl) {
        # Map source site URL to target site URL based on migration type
        switch ($this.MigrationType) {
            "OnPremToOnline" {
                # Example: https://intranet.company.com/sites/finance -> https://company.sharepoint.com/sites/finance
                $path = ([uri]$sourceUrl).AbsolutePath
                return "$($this.TargetEnvironment.TrimEnd('/'))$path"
            }
            "OnlineToOnline" {
                # Cross-tenant migration - might need URL transformation
                $path = ([uri]$sourceUrl).AbsolutePath
                return "$($this.TargetEnvironment.TrimEnd('/'))$path"
            }
            default {
                return $sourceUrl.Replace($this.SourceEnvironment, $this.TargetEnvironment)
            }
        }
    }
    
    hidden [hashtable] ExecuteBatchMigration([hashtable]$batch, [hashtable]$options) {
        $this.WriteLog("Executing SharePoint batch migration: $($batch.BatchName)", "INFO")
        
        $batchResult = @{
            BatchName = $batch.BatchName
            Status = "Running"
            StartTime = Get-Date
            EndTime = $null
            TotalSites = $batch.Sites.Count
            SuccessfulMigrations = 0
            FailedMigrations = 0
            Errors = @()
            SiteResults = @()
            Progress = 0
        }
        
        try {
            # Process sites in the correct order
            $orderedSites = $batch.MigrationOrder | ForEach-Object {
                $siteUrl = $_.Site
                $batch.Sites | Where-Object { $_.Url -eq $siteUrl }
            }
            
            foreach ($site in $orderedSites) {
                if (-not $site) { continue }  # Skip if site not found
                
                $this.WriteLog("Migrating site: $($site.Url)", "INFO")
                
                try {
                    $siteResult = $this.MigrateSingleSite($site, $options)
                    $batchResult.SiteResults += $siteResult
                    
                    if ($siteResult.Status -eq "Success") {
                        $batchResult.SuccessfulMigrations++
                    } else {
                        $batchResult.FailedMigrations++
                        $batchResult.Errors += $siteResult.Errors
                    }
                    
                    # Update progress
                    $batchResult.Progress = [math]::Round((($batchResult.SuccessfulMigrations + $batchResult.FailedMigrations) / $batchResult.TotalSites) * 100, 1)
                    
                    $this.WriteLog("Site migration completed: $($site.Url) - Status: $($siteResult.Status)", "INFO")
                }
                catch {
                    $batchResult.FailedMigrations++
                    $batchResult.Errors += "Site migration failed: $($site.Url) - $($_.Exception.Message)"
                    $this.WriteLog("Site migration failed: $($site.Url) - $($_.Exception.Message)", "ERROR")
                }
            }
            
            $batchResult.Status = if ($batchResult.FailedMigrations -eq 0) { "Completed" } else { "CompletedWithErrors" }
            $this.WriteLog("Batch migration completed: $($batch.BatchName)", "SUCCESS")
        }
        catch {
            $batchResult.Status = "Failed"
            $batchResult.Errors += $_.Exception.Message
            $this.WriteLog("Batch migration failed: $($_.Exception.Message)", "ERROR")
        }
        
        $batchResult.EndTime = Get-Date
        return $batchResult
    }
    
    hidden [hashtable] MigrateSingleSite([hashtable]$site, [hashtable]$options) {
        $siteResult = @{
            SourceUrl = $site.Url
            TargetUrl = ""
            Status = "Running"
            StartTime = Get-Date
            EndTime = $null
            ItemsMigrated = 0
            TotalItems = 0
            Errors = @()
            Warnings = @()
            Progress = 0
        }
        
        try {
            # Map target URL
            $targetUrl = $this.MapSourceToTargetUrl($site.Url)
            $siteResult.TargetUrl = $targetUrl
            
            # Create target site collection if it doesn't exist
            if ($this.MigrationConfig.CreateTargetStructure) {
                $this.CreateTargetSite($site, $targetUrl)
            }
            
            # Connect to source site
            Connect-PnPOnline -Url $site.Url -Connection $this.SourceConnection
            
            # Connect to target site
            Connect-PnPOnline -Url $targetUrl -Connection $this.TargetConnection
            
            # Calculate total items for progress tracking
            $totalItems = 0
            foreach ($library in $site.Libraries) {
                $totalItems += $library.ItemCount
            }
            foreach ($list in $site.Lists) {
                $totalItems += $list.ItemCount
            }
            $siteResult.TotalItems = $totalItems
            
            $migratedItems = 0
            
            # Migrate content types first (if enabled)
            if ($this.MigrationConfig.PreserveMetadata) {
                $this.MigrateContentTypes($site, $siteResult)
            }
            
            # Migrate document libraries
            if ($this.MigrationConfig.MigrateDocumentLibraries) {
                foreach ($library in $site.Libraries) {
                    try {
                        $this.WriteLog("Migrating document library: $($library.Title)", "VERBOSE")
                        $libraryResult = $this.MigrateDocumentLibrary($library, $siteResult)
                        $migratedItems += $libraryResult.ItemsMigrated
                        
                        # Update progress
                        $siteResult.Progress = [math]::Round(($migratedItems / $totalItems) * 100, 1)
                    }
                    catch {
                        $siteResult.Warnings += "Failed to migrate library '$($library.Title)': $($_.Exception.Message)"
                        $this.WriteLog("Library migration failed: $($library.Title) - $($_.Exception.Message)", "WARNING")
                    }
                }
            }
            
            # Migrate custom lists
            if ($this.MigrationConfig.MigrateLists) {
                foreach ($list in $site.Lists) {
                    try {
                        $this.WriteLog("Migrating list: $($list.Title)", "VERBOSE")
                        $listResult = $this.MigrateList($list, $siteResult)
                        $migratedItems += $listResult.ItemsMigrated
                        
                        # Update progress
                        $siteResult.Progress = [math]::Round(($migratedItems / $totalItems) * 100, 1)
                    }
                    catch {
                        $siteResult.Warnings += "Failed to migrate list '$($list.Title)': $($_.Exception.Message)"
                        $this.WriteLog("List migration failed: $($list.Title) - $($_.Exception.Message)", "WARNING")
                    }
                }
            }
            
            # Migrate site pages (if enabled)
            if ($this.MigrationConfig.MigratePages) {
                $this.MigrateSitePages($site, $siteResult)
            }
            
            # Migrate permissions (if enabled)
            if ($this.MigrationConfig.PreservePermissions) {
                $this.MigratePermissions($site, $siteResult)
            }
            
            # Post-migration validation
            if ($this.MigrationConfig.PostMigrationValidation) {
                $validationResult = $this.ValidateSiteMigration($site, $targetUrl)
                if ($validationResult.Issues.Count -gt 0) {
                    $siteResult.Warnings += $validationResult.Issues
                }
            }
            
            $siteResult.ItemsMigrated = $migratedItems
            $siteResult.Status = if ($siteResult.Errors.Count -eq 0) { "Success" } else { "CompletedWithErrors" }
            $siteResult.Progress = 100
            
            $this.WriteLog("Site migration completed successfully: $($site.Url)", "SUCCESS")
        }
        catch {
            $siteResult.Status = "Failed"
            $siteResult.Errors += $_.Exception.Message
            $this.WriteLog("Site migration failed: $($_.Exception.Message)", "ERROR")
        }
        
        $siteResult.EndTime = Get-Date
        return $siteResult
    }
    
    hidden [void] CreateTargetSite([hashtable]$site, [string]$targetUrl) {
        try {
            $this.WriteLog("Creating target site: $targetUrl", "VERBOSE")
            
            # Extract site information
            $siteUri = [uri]$targetUrl
            $siteCollectionUrl = "$($siteUri.Scheme)://$($siteUri.Host)"
            $sitePath = $siteUri.AbsolutePath
            
            # Determine template based on source
            $template = switch ($site.Template) {
                "STS#0" { "STS#3" }  # Team Site -> Modern Team Site
                "STS#1" { "STS#3" }  # Blank Site -> Modern Team Site  
                "BLOG#0" { "BLOG#0" }  # Blog
                default { "STS#3" }   # Default to Modern Team Site
            }
            
            # Create site collection (this would need to be adapted based on target environment)
            if ($this.MigrationType -match "Online") {
                # For SharePoint Online
                New-PnPSite -Type TeamSite -Title $site.Title -Alias ($sitePath.Trim('/').Replace('/', '-')) -Connection $this.TargetConnection
            } else {
                # For On-Premises SharePoint
                New-PnPSite -Type TeamSite -Title $site.Title -Url $targetUrl -Template $template -Connection $this.TargetConnection
            }
            
            $this.WriteLog("Target site created successfully: $targetUrl", "SUCCESS")
        }
        catch {
            $this.WriteLog("Failed to create target site: $($_.Exception.Message)", "WARNING")
            # Continue with migration assuming site exists or will be created manually
        }
    }
    
    hidden [void] MigrateContentTypes([hashtable]$site, [hashtable]$siteResult) {
        try {
            $this.WriteLog("Migrating content types for site: $($site.Url)", "VERBOSE")
            
            # Get source content types
            $sourceContentTypes = Get-PnPContentType -Connection $this.SourceConnection
            
            foreach ($ct in $sourceContentTypes) {
                try {
                    if ($ct.Group -notin @("Document Content Types", "List Content Types", "System")) {
                        # Check if content type exists in target
                        $existingCT = Get-PnPContentType -Identity $ct.Name -Connection $this.TargetConnection -ErrorAction SilentlyContinue
                        
                        if (-not $existingCT) {
                            # Create content type in target
                            $newCT = Add-PnPContentType -Name $ct.Name -Group $ct.Group -Connection $this.TargetConnection
                            
                            # Add fields to content type
                            foreach ($field in $ct.Fields) {
                                if ($field.SchemaXml -and !$field.Hidden) {
                                    Add-PnPFieldToContentType -Field $field.InternalName -ContentType $newCT -Connection $this.TargetConnection -ErrorAction SilentlyContinue
                                }
                            }
                        }
                    }
                }
                catch {
                    $siteResult.Warnings += "Failed to migrate content type '$($ct.Name)': $($_.Exception.Message)"
                }
            }
        }
        catch {
            $siteResult.Warnings += "Content type migration failed: $($_.Exception.Message)"
        }
    }
    
    hidden [hashtable] MigrateDocumentLibrary([hashtable]$library, [hashtable]$siteResult) {
        $libraryResult = @{
            LibraryName = $library.Title
            ItemsMigrated = 0
            Errors = @()
        }
        
        try {
            # Check if library exists in target, create if not
            $targetLibrary = Get-PnPList -Identity $library.Title -Connection $this.TargetConnection -ErrorAction SilentlyContinue
            
            if (-not $targetLibrary) {
                $targetLibrary = New-PnPList -Title $library.Title -Template DocumentLibrary -Connection $this.TargetConnection
            }
            
            # Configure library settings
            if ($this.MigrationConfig.PreserveVersionHistory -and $library.VersioningEnabled) {
                Set-PnPList -Identity $library.Title -EnableVersioning $true -EnableMinorVersions $true -Connection $this.TargetConnection
                
                if ($library.MajorVersionLimit -gt 0) {
                    Set-PnPList -Identity $library.Title -MajorVersions $library.MajorVersionLimit -Connection $this.TargetConnection
                }
                
                if ($library.MinorVersionLimit -gt 0) {
                    Set-PnPList -Identity $library.Title -MinorVersions $library.MinorVersionLimit -Connection $this.TargetConnection
                }
            }
            
            # Migrate documents using PnP copy operations
            $sourceFiles = Get-PnPListItem -List $library.Title -Connection $this.SourceConnection -PageSize 100
            
            foreach ($file in $sourceFiles) {
                try {
                    if ($file.FileSystemObjectType -eq "File") {
                        $sourceFile = Get-PnPFile -Url $file.FieldValues.FileRef -Connection $this.SourceConnection -AsFile
                        
                        # Stream large files, direct copy for smaller files
                        if ($file.FieldValues.File_x0020_Size -gt 100MB) {
                            $this.MigrateLargeFile($file, $library.Title, $siteResult)
                        } else {
                            Add-PnPFile -Path $sourceFile.Name -Folder $library.Title -Connection $this.TargetConnection -Stream $sourceFile
                        }
                        
                        # Migrate metadata if preserved
                        if ($this.MigrationConfig.PreserveMetadata) {
                            $this.MigrateFileMetadata($file, $library.Title, $siteResult)
                        }
                        
                        $libraryResult.ItemsMigrated++
                    }
                }
                catch {
                    $libraryResult.Errors += "Failed to migrate file '$($file.FieldValues.FileLeafRef)': $($_.Exception.Message)"
                }
            }
        }
        catch {
            $libraryResult.Errors += "Library migration setup failed: $($_.Exception.Message)"
        }
        
        return $libraryResult
    }
    
    hidden [void] MigrateLargeFile([object]$file, [string]$libraryName, [hashtable]$siteResult) {
        try {
            # Use chunked upload for large files
            $fileUrl = $file.FieldValues.FileRef
            $fileName = $file.FieldValues.FileLeafRef
            
            # Download file in chunks and upload in chunks
            $tempPath = Join-Path $this.MigrationConfig.TempStorage $fileName
            
            # Ensure temp directory exists
            $tempDir = Split-Path $tempPath -Parent
            if (!(Test-Path $tempDir)) {
                New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
            }
            
            # Download file
            Get-PnPFile -Url $fileUrl -Path $tempDir -Filename $fileName -AsFile -Connection $this.SourceConnection
            
            # Upload to target with chunking
            Add-PnPFile -Path $tempPath -Folder $libraryName -Connection $this.TargetConnection -ChunkSize 10MB
            
            # Clean up temp file
            Remove-Item $tempPath -Force -ErrorAction SilentlyContinue
        }
        catch {
            $siteResult.Warnings += "Large file migration failed for '$($file.FieldValues.FileLeafRef)': $($_.Exception.Message)"
        }
    }
    
    hidden [void] MigrateFileMetadata([object]$file, [string]$libraryName, [hashtable]$siteResult) {
        try {
            # Update file metadata in target
            $fileUrl = $file.FieldValues.FileRef.Replace($this.SourceEnvironment, $this.TargetEnvironment)
            
            $metadataToUpdate = @{}
            
            # Copy standard metadata
            if ($file.FieldValues.Title) { $metadataToUpdate["Title"] = $file.FieldValues.Title }
            if ($file.FieldValues.Author) { $metadataToUpdate["Author"] = $file.FieldValues.Author }
            if ($file.FieldValues.Created) { $metadataToUpdate["Created"] = $file.FieldValues.Created }
            if ($file.FieldValues.Modified) { $metadataToUpdate["Modified"] = $file.FieldValues.Modified }
            
            # Update custom metadata based on field mappings
            foreach ($fieldName in $this.MigrationConfig.FieldMapping.Keys) {
                if ($file.FieldValues.ContainsKey($fieldName)) {
                    $targetFieldName = $this.MigrationConfig.FieldMapping[$fieldName]
                    $metadataToUpdate[$targetFieldName] = $file.FieldValues[$fieldName]
                }
            }
            
            if ($metadataToUpdate.Count -gt 0) {
                Set-PnPFileMetadata -ServerRelativeUrl $fileUrl -Values $metadataToUpdate -Connection $this.TargetConnection
            }
        }
        catch {
            $siteResult.Warnings += "Metadata migration failed for file: $($_.Exception.Message)"
        }
    }
    
    hidden [hashtable] MigrateList([hashtable]$list, [hashtable]$siteResult) {
        $listResult = @{
            ListName = $list.Title
            ItemsMigrated = 0
            Errors = @()
        }
        
        try {
            # Check if list exists in target, create if not
            $targetList = Get-PnPList -Identity $list.Title -Connection $this.TargetConnection -ErrorAction SilentlyContinue
            
            if (-not $targetList) {
                $targetList = New-PnPList -Title $list.Title -Template $list.Template -Connection $this.TargetConnection
            }
            
            # Migrate list items
            $sourceItems = Get-PnPListItem -List $list.Title -Connection $this.SourceConnection -PageSize 100
            
            foreach ($item in $sourceItems) {
                try {
                    $itemValues = @{}
                    
                    # Map field values
                    foreach ($fieldName in $item.FieldValues.Keys) {
                        if ($fieldName -notin @("ID", "GUID", "Created", "Modified", "Author", "Editor")) {
                            $itemValues[$fieldName] = $item.FieldValues[$fieldName]
                        }
                    }
                    
                    # Create item in target list
                    Add-PnPListItem -List $list.Title -Values $itemValues -Connection $this.TargetConnection
                    $listResult.ItemsMigrated++
                }
                catch {
                    $listResult.Errors += "Failed to migrate list item: $($_.Exception.Message)"
                }
            }
        }
        catch {
            $listResult.Errors += "List migration setup failed: $($_.Exception.Message)"
        }
        
        return $listResult
    }
    
    hidden [void] MigrateSitePages([hashtable]$site, [hashtable]$siteResult) {
        try {
            $this.WriteLog("Migrating site pages for: $($site.Url)", "VERBOSE")
            
            # Get pages from Site Pages library
            $pages = Get-PnPListItem -List "Site Pages" -Connection $this.SourceConnection -ErrorAction SilentlyContinue
            
            foreach ($page in $pages) {
                try {
                    if ($page.FieldValues.FileLeafRef -like "*.aspx") {
                        # For modern pages, extract and recreate content
                        $pageContent = Get-PnPFile -Url $page.FieldValues.FileRef -AsString -Connection $this.SourceConnection
                        
                        # Create page in target (simplified - actual implementation would need page parsing)
                        $newPage = Add-PnPPage -Name $page.FieldValues.FileLeafRef.Replace('.aspx', '') -Connection $this.TargetConnection
                        
                        # Migrate web parts (if enabled)
                        if ($this.MigrationConfig.MigrateWebParts) {
                            $this.MigratePageWebParts($page, $newPage, $siteResult)
                        }
                    }
                }
                catch {
                    $siteResult.Warnings += "Failed to migrate page '$($page.FieldValues.FileLeafRef)': $($_.Exception.Message)"
                }
            }
        }
        catch {
            $siteResult.Warnings += "Site pages migration failed: $($_.Exception.Message)"
        }
    }
    
    hidden [void] MigratePageWebParts([object]$sourcePage, [object]$targetPage, [hashtable]$siteResult) {
        try {
            # Get web parts from source page
            $webParts = Get-PnPPageComponent -Page $sourcePage.FieldValues.FileLeafRef -Connection $this.SourceConnection -ErrorAction SilentlyContinue
            
            foreach ($webPart in $webParts) {
                try {
                    # Map web part types and add to target page
                    switch ($webPart.Type) {
                        "Text" {
                            Add-PnPPageTextPart -Page $targetPage -Text $webPart.Text -Connection $this.TargetConnection
                        }
                        "DocumentLibrary" {
                            # Add document library web part
                            Add-PnPPageWebPart -Page $targetPage -DefaultWebPartType List -Connection $this.TargetConnection
                        }
                        default {
                            $siteResult.Warnings += "Unsupported web part type '$($webPart.Type)' on page '$($sourcePage.FieldValues.FileLeafRef)'"
                        }
                    }
                }
                catch {
                    $siteResult.Warnings += "Failed to migrate web part on page '$($sourcePage.FieldValues.FileLeafRef)': $($_.Exception.Message)"
                }
            }
        }
        catch {
            $siteResult.Warnings += "Web part migration failed: $($_.Exception.Message)"
        }
    }
    
    hidden [void] MigratePermissions([hashtable]$site, [hashtable]$siteResult) {
        try {
            $this.WriteLog("Migrating permissions for: $($site.Url)", "VERBOSE")
            
            foreach ($permission in $site.Permissions) {
                try {
                    # Map user accounts if configured
                    $targetPrincipal = $permission.Principal
                    if ($this.MigrationConfig.MapUserAccounts -and $this.MigrationConfig.PermissionMapping.ContainsKey($permission.Principal)) {
                        $targetPrincipal = $this.MigrationConfig.PermissionMapping[$permission.Principal]
                    }
                    
                    # Grant permissions in target site
                    Grant-PnPSiteDesignRights -Identity $targetPrincipal -Rights $permission.Roles -Connection $this.TargetConnection
                }
                catch {
                    $siteResult.Warnings += "Failed to migrate permission for '$($permission.Principal)': $($_.Exception.Message)"
                }
            }
        }
        catch {
            $siteResult.Warnings += "Permission migration failed: $($_.Exception.Message)"
        }
    }
    
    hidden [hashtable] ValidateSiteMigration([hashtable]$sourceSite, [string]$targetUrl) {
        $validation = @{
            IsValid = $true
            Issues = @()
            Metrics = @{}
        }
        
        try {
            # Connect to target site for validation
            Connect-PnPOnline -Url $targetUrl -Connection $this.TargetConnection
            
            # Validate document libraries
            foreach ($sourceLibrary in $sourceSite.Libraries) {
                $targetLibrary = Get-PnPList -Identity $sourceLibrary.Title -Connection $this.TargetConnection -ErrorAction SilentlyContinue
                
                if ($targetLibrary) {
                    $sourceCount = $sourceLibrary.ItemCount
                    $targetCount = $targetLibrary.ItemCount
                    
                    if ($sourceCount -ne $targetCount) {
                        $validation.Issues += "Item count mismatch in library '$($sourceLibrary.Title)': Source=$sourceCount, Target=$targetCount"
                    }
                } else {
                    $validation.Issues += "Library '$($sourceLibrary.Title)' not found in target"
                }
            }
            
            # Validate custom lists
            foreach ($sourceList in $sourceSite.Lists) {
                $targetList = Get-PnPList -Identity $sourceList.Title -Connection $this.TargetConnection -ErrorAction SilentlyContinue
                
                if ($targetList) {
                    $sourceCount = $sourceList.ItemCount
                    $targetCount = $targetList.ItemCount
                    
                    if ($sourceCount -ne $targetCount) {
                        $validation.Issues += "Item count mismatch in list '$($sourceList.Title)': Source=$sourceCount, Target=$targetCount"
                    }
                } else {
                    $validation.Issues += "List '$($sourceList.Title)' not found in target"
                }
            }
            
            $validation.IsValid = $validation.Issues.Count -eq 0
        }
        catch {
            $validation.Issues += "Validation failed: $($_.Exception.Message)"
            $validation.IsValid = $false
        }
        
        return $validation
    }
    
    [hashtable] GetMigrationStatus([string]$batchName = $null) {
        $this.WriteLog("Getting SharePoint migration status", "INFO")
        
        $status = @{
            Batches = @()
            OverallStatus = "Unknown"
            TotalSites = 0
            MigratedSites = 0
            FailedSites = 0
            InProgressSites = 0
            OverallProgress = 0
        }
        
        try {
            $batches = if ($batchName) {
                $this.MigrationBatches | Where-Object { $_.BatchName -eq $batchName }
            } else {
                $this.MigrationBatches
            }
            
            foreach ($batch in $batches) {
                $batchStatus = @{
                    BatchName = $batch.BatchName
                    Status = $batch.Status
                    TotalSites = $batch.Sites.Count
                    Progress = 0
                    EstimatedCompletion = $null
                    Sites = @()
                }
                
                # Calculate batch progress
                $completedSites = 0
                foreach ($site in $batch.Sites) {
                    $siteStatus = @{
                        Url = $site.Url
                        Status = $site.Status ?? "NotStarted"
                        Progress = $site.Progress ?? 0
                    }
                    
                    if ($siteStatus.Status -eq "Completed") {
                        $completedSites++
                    }
                    
                    $batchStatus.Sites += $siteStatus
                }
                
                $batchStatus.Progress = if ($batch.Sites.Count -gt 0) {
                    [math]::Round(($completedSites / $batch.Sites.Count) * 100, 2)
                } else { 0 }
                
                $status.Batches += $batchStatus
                $status.TotalSites += $batchStatus.TotalSites
            }
            
            # Calculate overall statistics
            $status.MigratedSites = ($status.Batches | ForEach-Object { $_.Sites | Where-Object { $_.Status -eq "Completed" } }).Count
            $status.FailedSites = ($status.Batches | ForEach-Object { $_.Sites | Where-Object { $_.Status -eq "Failed" } }).Count
            $status.InProgressSites = ($status.Batches | ForEach-Object { $_.Sites | Where-Object { $_.Status -eq "InProgress" } }).Count
            
            $status.OverallProgress = if ($status.TotalSites -gt 0) {
                [math]::Round(($status.MigratedSites / $status.TotalSites) * 100, 2)
            } else { 0 }
            
            # Determine overall status
            if ($status.InProgressSites -gt 0) {
                $status.OverallStatus = "InProgress"
            } elseif ($status.FailedSites -gt 0) {
                $status.OverallStatus = "CompletedWithErrors"
            } elseif ($status.MigratedSites -eq $status.TotalSites -and $status.TotalSites -gt 0) {
                $status.OverallStatus = "Completed"
            } else {
                $status.OverallStatus = "NotStarted"
            }
            
            return $status
        }
        catch {
            $this.WriteLog("Failed to get migration status: $($_.Exception.Message)", "ERROR")
            throw
        }
    }
    
    [hashtable] GenerateMigrationReport([hashtable]$migrationResult) {
        $report = @{
            Summary = @{
                MigrationDate = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                MigrationType = $this.MigrationType
                SourceEnvironment = $this.SourceEnvironment
                TargetEnvironment = $this.TargetEnvironment
                TotalBatches = $migrationResult.TotalBatches
                CompletedBatches = $migrationResult.CompletedBatches
                FailedBatches = $migrationResult.FailedBatches
                TotalSites = $migrationResult.TotalSites
                MigratedSites = $migrationResult.MigratedSites
                FailedSites = $migrationResult.FailedSites
                SuccessRate = if ($migrationResult.TotalSites -gt 0) { 
                    [math]::Round(($migrationResult.MigratedSites / $migrationResult.TotalSites) * 100, 2) 
                } else { 0 }
                Duration = if ($migrationResult.EndTime) { 
                    $migrationResult.EndTime - $migrationResult.StartTime 
                } else { $null }
            }
            BatchDetails = $migrationResult.BatchResults
            Errors = $migrationResult.Errors
            Configuration = $this.MigrationConfig
            LogPath = $this.LogPath
            Recommendations = @()
        }
        
        # Add post-migration recommendations
        if ($report.Summary.SuccessRate -lt 100) {
            $report.Recommendations += "Review failed sites and retry migration if needed"
        }
        
        if ($migrationResult.Errors.Count -gt 0) {
            $report.Recommendations += "Address error conditions before next migration wave"
        }
        
        $report.Recommendations += "Perform user acceptance testing on migrated sites"
        $report.Recommendations += "Update DNS and redirect rules if needed"
        $report.Recommendations += "Communicate migration completion to end users"
        
        return $report
    }
    
    [void] ExportMigrationReport([string]$filePath, [hashtable]$report) {
        try {
            $jsonData = $report | ConvertTo-Json -Depth 10
            Set-Content -Path $filePath -Value $jsonData -Encoding UTF8
            $this.WriteLog("Migration report exported to: $filePath", "SUCCESS")
        }
        catch {
            $this.WriteLog("Failed to export migration report: $($_.Exception.Message)", "ERROR")
            throw
        }
    }
    
    [hashtable] RollbackMigration([string]$batchName) {
        $this.WriteLog("Starting rollback for batch: $batchName", "INFO")
        
        $rollbackResult = @{
            Status = "Running"
            StartTime = Get-Date
            EndTime = $null
            BatchName = $batchName
            RolledBackSites = 0
            FailedRollbacks = 0
            Errors = @()
        }
        
        try {
            $batch = $this.MigrationBatches | Where-Object { $_.BatchName -eq $batchName }
            
            if (-not $batch) {
                throw "Batch '$batchName' not found"
            }
            
            foreach ($site in $batch.Sites) {
                try {
                    $targetUrl = $this.MapSourceToTargetUrl($site.Url)
                    
                    # Delete target site (if configured to do so)
                    if ($this.MigrationConfig.EnableRollback) {
                        Remove-PnPSite -Identity $targetUrl -Force -Connection $this.TargetConnection
                        $rollbackResult.RolledBackSites++
                        $this.WriteLog("Rolled back site: $targetUrl", "INFO")
                    }
                }
                catch {
                    $rollbackResult.FailedRollbacks++
                    $rollbackResult.Errors += "Failed to rollback site '$($site.Url)': $($_.Exception.Message)"
                    $this.WriteLog("Rollback failed for site '$($site.Url)': $($_.Exception.Message)", "ERROR")
                }
            }
            
            $rollbackResult.Status = if ($rollbackResult.FailedRollbacks -eq 0) { "Completed" } else { "CompletedWithErrors" }
            $this.WriteLog("Rollback completed for batch: $batchName", "SUCCESS")
        }
        catch {
            $rollbackResult.Status = "Failed"
            $rollbackResult.Errors += $_.Exception.Message
            $this.WriteLog("Rollback failed: $($_.Exception.Message)", "ERROR")
        }
        
        $rollbackResult.EndTime = Get-Date
        return $rollbackResult
    }
    
    [void] Cleanup() {
        try {
            # Disconnect from SharePoint connections
            if ($this.SourceConnection) {
                Disconnect-PnPOnline -Connection $this.SourceConnection
            }
            
            if ($this.TargetConnection) {
                Disconnect-PnPOnline -Connection $this.TargetConnection
            }
            
            # Clean up temporary files
            if (Test-Path $this.MigrationConfig.TempStorage) {
                Remove-Item $this.MigrationConfig.TempStorage -Recurse -Force -ErrorAction SilentlyContinue
            }
            
            $this.WriteLog("SharePoint migration cleanup completed", "INFO")
        }
        catch {
            $this.WriteLog("Cleanup failed: $($_.Exception.Message)", "WARNING")
        }
    }
}

function New-SharePointMigration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [ValidateSet('OnPremToOnline', 'OnlineToOnline', 'OnPremToOnPrem', 'HybridMigration')]
        [string]$MigrationType
    )
    
    return [SharePointMigration]::new($MigrationType)
}

# Export module functions
Export-ModuleMember -Function New-SharePointMigration