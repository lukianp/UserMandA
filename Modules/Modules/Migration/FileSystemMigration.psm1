#Requires -Version 5.1
using namespace System.Collections.Generic
using namespace System.IO
using namespace System.Security.AccessControl

Set-StrictMode -Version 3.0

class FileSystemMigration {
    [string]$SourceEnvironment
    [string]$TargetEnvironment
    [object]$SourceCredential
    [object]$TargetCredential
    [string]$MigrationType
    [hashtable]$MigrationConfig
    [array]$MigrationBatches
    [hashtable]$MigrationStatus
    [string]$LogPath
    [hashtable]$PermissionMappings
    [hashtable]$SidTranslationTable
    [array]$ContentAnalysis
    [hashtable]$FileFilters
    [hashtable]$Performance
    [hashtable]$ValidationRules
    
    FileSystemMigration([string]$migrationType) {
        $this.MigrationType = $migrationType # WindowsToWindows, WindowsToAzure, LocalToNetwork, CrossDomain, DFSMigration
        $this.MigrationConfig = @{
            # Core Settings
            BatchSize = 500
            MaxFileSize = 100GB
            MaxPathLength = 260
            ConcurrentThreads = 8
            BufferSize = 1MB
            RetryAttempts = 3
            RetryDelay = 30
            
            # Permission Settings
            PreserveNTFSPermissions = $true
            PreserveOwnership = $true
            PreserveInheritance = $true
            BackupACLs = $true
            MapCrossDomainSIDs = $true
            ValidatePermissions = $true
            
            # File Operation Settings
            UseRobocopy = $true
            RobocopyOptions = @('/E', '/COPY:DATSOU', '/PURGE', '/R:3', '/W:30', '/MT:8', '/TEE', '/NP')
            PreserveTimestamps = $true
            PreserveAttributes = $true
            PreserveAlternateDataStreams = $true
            HandleSymbolicLinks = $true
            HandleJunctions = $true
            HandleSparseFiles = $true
            HandleCompressedFiles = $true
            
            # Performance Settings
            UseBandwidthThrottling = $false
            BandwidthLimitMbps = 100
            ScheduledMigration = $false
            MigrationSchedule = @{
                StartTime = "22:00"
                EndTime = "06:00"
                DaysOfWeek = @("Monday", "Tuesday", "Wednesday", "Thursday", "Friday")
            }
            EnableDifferentialSync = $true
            UseChangeJournal = $true
            EnableDeltaSync = $true
            
            # Validation Settings
            ValidateChecksums = $true
            ValidateFileCounts = $true
            ValidateFileSize = $true
            PostMigrationValidation = $true
            GenerateManifest = $true
            
            # Error Handling
            PauseOnError = $false
            SkipLockedFiles = $true
            SkipSystemFiles = $true
            ContinueOnAccessDenied = $true
            LogDetailedErrors = $true
            CreateErrorReport = $true
            
            # Filter Settings
            ExcludeSystemFolders = $true
            ExcludeTemporaryFiles = $true
            ExcludeHiddenFiles = $false
            CustomExclusions = @()
            CustomInclusions = @()
            MaxFileAge = $null
            MinFileAge = $null
            
            # Advanced Settings
            EnableVSS = $true
            UseWindowsBackupAPI = $false
            CompressTransfer = $false
            EncryptTransfer = $true
            EnableResumeCapability = $true
            CreateBackup = $true
            BackupLocation = $null
            EnableRollback = $true
            
            # Reporting Settings
            GenerateReport = $true
            ReportLevel = 'Detailed'
            NotificationEmails = @()
            TempStorage = "$env:TEMP\FSMigration"
            LogLevel = 'Verbose'
        }
        
        $this.MigrationBatches = @()
        $this.MigrationStatus = @{}
        $this.LogPath = ".\Logs\FileSystemMigration_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
        $this.PermissionMappings = @{}
        $this.SidTranslationTable = @{}
        $this.ContentAnalysis = @()
        $this.FileFilters = @{}
        $this.Performance = @{
            StartTime = $null
            EndTime = $null
            TotalFiles = 0
            TotalBytes = 0
            TransferredFiles = 0
            TransferredBytes = 0
            FailedFiles = 0
            SkippedFiles = 0
            AverageSpeed = 0
            PeakSpeed = 0
            CurrentSpeed = 0
        }
        $this.ValidationRules = @{}
        $this.InitializeLogging()
        $this.InitializeFilters()
    }
    
    hidden [void] InitializeLogging() {
        $logDir = Split-Path $this.LogPath -Parent
        if (!(Test-Path $logDir)) {
            New-Item -ItemType Directory -Path $logDir -Force | Out-Null
        }
        
        # Create temp storage directory
        if (!(Test-Path $this.MigrationConfig.TempStorage)) {
            New-Item -ItemType Directory -Path $this.MigrationConfig.TempStorage -Force | Out-Null
        }
        
        $this.WriteLog("FileSystemMigration module initialized", "INFO")
        $this.WriteLog("Migration Type: $($this.MigrationType)", "INFO")
        $this.WriteLog("Configuration: $($this.MigrationConfig | ConvertTo-Json -Depth 2)", "DEBUG")
    }
    
    hidden [void] InitializeFilters() {
        # Initialize default file filters
        $this.FileFilters = @{
            SystemFolders = @(
                '$Recycle.Bin', 'System Volume Information', 'pagefile.sys', 'hiberfil.sys',
                'swapfile.sys', 'DumpStack.log', 'recovery', 'found.000'
            )
            TemporaryFiles = @(
                '*.tmp', '*.temp', '~*', '*.log', '*.bak', '*.old', '*.cache'
            )
            LargeFiles = @{
                MaxSize = $this.MigrationConfig.MaxFileSize
                Action = 'Skip'  # Skip, Split, or Migrate
            }
            LockedFiles = @{
                Action = 'Skip'  # Skip, Force, or Retry
                RetryAttempts = 3
            }
            FileTypes = @{
                Include = @()  # Empty means include all
                Exclude = @()  # Specific exclusions
            }
        }
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
    
    [void] SetSourceEnvironment([string]$environment, [pscredential]$credential = $null) {
        $this.SourceEnvironment = $environment
        $this.SourceCredential = $credential
        $this.WriteLog("Source environment configured: $environment", "INFO")
        
        # Validate source environment
        if (!(Test-Path $environment)) {
            throw "Source environment path does not exist: $environment"
        }
    }
    
    [void] SetTargetEnvironment([string]$environment, [pscredential]$credential = $null) {
        $this.TargetEnvironment = $environment
        $this.TargetCredential = $credential
        $this.WriteLog("Target environment configured: $environment", "INFO")
        
        # Create target environment if it doesn't exist
        if ($this.MigrationConfig.CreateTargetStructure -and !(Test-Path $environment)) {
            try {
                New-Item -ItemType Directory -Path $environment -Force | Out-Null
                $this.WriteLog("Created target directory: $environment", "SUCCESS")
            }
            catch {
                $this.WriteLog("Failed to create target directory: $($_.Exception.Message)", "WARNING")
            }
        }
    }
    
    [hashtable] AnalyzeSourceContent([array]$paths = @(), [hashtable]$options = @{}) {
        $this.WriteLog("Starting file system content analysis", "INFO")
        
        $analysis = @{
            SourcePaths = @()
            TotalSize = 0
            TotalFiles = 0
            TotalFolders = 0
            LargestFile = @{ Size = 0; Path = "" }
            DeepestPath = @{ Depth = 0; Path = "" }
            FileTypes = @{}
            PermissionInfo = @{
                UniqueOwners = @()
                UniqueGroups = @()
                AccessControlEntries = 0
                ComplexPermissions = @()
            }
            Issues = @()
            Recommendations = @()
            Statistics = @{
                AverageFileSize = 0
                MedianFileSize = 0
                FilesPerFolder = 0
                PathLengthDistribution = @{}
                PermissionComplexity = "Low"
                MigrationComplexity = "Low"
                EstimatedDuration = "Unknown"
                RequiredBandwidth = 0
            }
        }
        
        try {
            # Use source environment if no specific paths provided
            $pathsToAnalyze = if ($paths.Count -gt 0) { $paths } else { @($this.SourceEnvironment) }
            
            foreach ($sourcePath in $pathsToAnalyze) {
                $this.WriteLog("Analyzing path: $sourcePath", "INFO")
                
                if (!(Test-Path $sourcePath)) {
                    $analysis.Issues += "Path does not exist: $sourcePath"
                    continue
                }
                
                $pathAnalysis = $this.AnalyzeSinglePath($sourcePath, $options)
                $analysis.SourcePaths += $pathAnalysis
                
                # Aggregate statistics
                $analysis.TotalSize += $pathAnalysis.TotalSize
                $analysis.TotalFiles += $pathAnalysis.FileCount
                $analysis.TotalFolders += $pathAnalysis.FolderCount
                
                # Track largest file
                if ($pathAnalysis.LargestFile.Size -gt $analysis.LargestFile.Size) {
                    $analysis.LargestFile = $pathAnalysis.LargestFile
                }
                
                # Track deepest path
                if ($pathAnalysis.DeepestPath.Depth -gt $analysis.DeepestPath.Depth) {
                    $analysis.DeepestPath = $pathAnalysis.DeepestPath
                }
                
                # Merge file types
                foreach ($ext in $pathAnalysis.FileTypes.Keys) {
                    if ($analysis.FileTypes.ContainsKey($ext)) {
                        $analysis.FileTypes[$ext] += $pathAnalysis.FileTypes[$ext]
                    } else {
                        $analysis.FileTypes[$ext] = $pathAnalysis.FileTypes[$ext]
                    }
                }
                
                # Merge permission info
                $analysis.PermissionInfo.UniqueOwners += $pathAnalysis.PermissionInfo.UniqueOwners
                $analysis.PermissionInfo.UniqueGroups += $pathAnalysis.PermissionInfo.UniqueGroups
                $analysis.PermissionInfo.AccessControlEntries += $pathAnalysis.PermissionInfo.AccessControlEntries
                $analysis.PermissionInfo.ComplexPermissions += $pathAnalysis.PermissionInfo.ComplexPermissions
                
                # Collect issues
                $analysis.Issues += $pathAnalysis.Issues
            }
            
            # Remove duplicates and calculate final statistics
            $analysis.PermissionInfo.UniqueOwners = $analysis.PermissionInfo.UniqueOwners | Sort-Object -Unique
            $analysis.PermissionInfo.UniqueGroups = $analysis.PermissionInfo.UniqueGroups | Sort-Object -Unique
            
            # Calculate derived statistics
            if ($analysis.TotalFiles -gt 0) {
                $analysis.Statistics.AverageFileSize = [math]::Round($analysis.TotalSize / $analysis.TotalFiles, 2)
                $analysis.Statistics.FilesPerFolder = [math]::Round($analysis.TotalFiles / [math]::Max($analysis.TotalFolders, 1), 2)
            }
            
            # Assess complexity
            $analysis.Statistics.PermissionComplexity = $this.AssessPermissionComplexity($analysis.PermissionInfo)
            $analysis.Statistics.MigrationComplexity = $this.AssessMigrationComplexity($analysis)
            $analysis.Statistics.EstimatedDuration = $this.EstimateMigrationDuration($analysis)
            $analysis.Statistics.RequiredBandwidth = $this.CalculateRequiredBandwidth($analysis)
            
            # Generate recommendations
            $analysis.Recommendations = $this.GenerateAnalysisRecommendations($analysis)
            
            $this.ContentAnalysis = $analysis.SourcePaths
            $this.WriteLog("Content analysis completed. Found $($analysis.TotalFiles) files, $([math]::Round($analysis.TotalSize / 1GB, 2)) GB total", "SUCCESS")
            
            return $analysis
        }
        catch {
            $this.WriteLog("Content analysis failed: $($_.Exception.Message)", "ERROR")
            throw
        }
    }
    
    hidden [hashtable] AnalyzeSinglePath([string]$path, [hashtable]$options) {
        $pathAnalysis = @{
            Path = $path
            TotalSize = 0
            FileCount = 0
            FolderCount = 0
            LargestFile = @{ Size = 0; Path = "" }
            DeepestPath = @{ Depth = 0; Path = "" }
            FileTypes = @{}
            PermissionInfo = @{
                UniqueOwners = @()
                UniqueGroups = @()
                AccessControlEntries = 0
                ComplexPermissions = @()
            }
            Issues = @()
            VolumeInfo = @{}
            NetworkShare = $false
            DFSPath = $false
            SymbolicLinks = @()
            Junctions = @()
            CompressedFiles = @()
            SparseFiles = @()
            EncryptedFiles = @()
        }
        
        try {
            # Get volume information
            $pathAnalysis.VolumeInfo = $this.GetVolumeInfo($path)
            
            # Check if it's a network share
            if ($path.StartsWith("\\")) {
                $pathAnalysis.NetworkShare = $true
            }
            
            # Check if it's a DFS path
            if ($this.IsDFSPath($path)) {
                $pathAnalysis.DFSPath = $true
            }
            
            # Enumerate files and folders
            $items = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue |
                Where-Object { $this.ShouldIncludeItem($_.FullName) }
            
            foreach ($item in $items) {
                try {
                    if ($item.PSIsContainer) {
                        $pathAnalysis.FolderCount++
                        
                        # Check path depth
                        $depth = ($item.FullName.Split('\').Count - $path.Split('\').Count)
                        if ($depth -gt $pathAnalysis.DeepestPath.Depth) {
                            $pathAnalysis.DeepestPath = @{
                                Depth = $depth
                                Path = $item.FullName
                            }
                        }
                    } else {
                        $pathAnalysis.FileCount++
                        $pathAnalysis.TotalSize += $item.Length
                        
                        # Track largest file
                        if ($item.Length -gt $pathAnalysis.LargestFile.Size) {
                            $pathAnalysis.LargestFile = @{
                                Size = $item.Length
                                Path = $item.FullName
                            }
                        }
                        
                        # Track file types
                        $ext = $item.Extension.ToLower()
                        if ($ext -eq "") { $ext = "No Extension" }
                        
                        if ($pathAnalysis.FileTypes.ContainsKey($ext)) {
                            $pathAnalysis.FileTypes[$ext]++
                        } else {
                            $pathAnalysis.FileTypes[$ext] = 1
                        }
                        
                        # Check for special file types
                        if ($item.Attributes -band [FileAttributes]::Compressed) {
                            $pathAnalysis.CompressedFiles += $item.FullName
                        }
                        
                        if ($item.Attributes -band [FileAttributes]::SparseFile) {
                            $pathAnalysis.SparseFiles += $item.FullName
                        }
                        
                        if ($item.Attributes -band [FileAttributes]::Encrypted) {
                            $pathAnalysis.EncryptedFiles += $item.FullName
                        }
                        
                        # Check path length issues
                        if ($item.FullName.Length -gt $this.MigrationConfig.MaxPathLength) {
                            $pathAnalysis.Issues += "Path exceeds maximum length: $($item.FullName)"
                        }
                        
                        # Check file size issues
                        if ($item.Length -gt $this.MigrationConfig.MaxFileSize) {
                            $pathAnalysis.Issues += "File exceeds maximum size: $($item.FullName) ($([math]::Round($item.Length / 1GB, 2)) GB)"
                        }
                    }
                    
                    # Analyze permissions if enabled
                    if ($this.MigrationConfig.PreserveNTFSPermissions) {
                        try {
                            $acl = Get-Acl -Path $item.FullName -ErrorAction SilentlyContinue
                            if ($acl) {
                                $pathAnalysis.PermissionInfo.AccessControlEntries += $acl.Access.Count
                                
                                foreach ($ace in $acl.Access) {
                                    if ($ace.IdentityReference.Value -match "^S-1-") {
                                        # Orphaned SID
                                        $pathAnalysis.PermissionInfo.ComplexPermissions += $item.FullName
                                    }
                                    
                                    $pathAnalysis.PermissionInfo.UniqueOwners += $acl.Owner
                                    $pathAnalysis.PermissionInfo.UniqueGroups += $ace.IdentityReference.Value
                                }
                            }
                        }
                        catch {
                            $pathAnalysis.Issues += "Failed to read permissions: $($item.FullName)"
                        }
                    }
                    
                    # Check for symbolic links and junctions
                    if ($item.Attributes -band [FileAttributes]::ReparsePoint) {
                        $reparsePoint = $this.GetReparsePointTarget($item.FullName)
                        if ($reparsePoint.Type -eq "SymbolicLink") {
                            $pathAnalysis.SymbolicLinks += @{
                                Source = $item.FullName
                                Target = $reparsePoint.Target
                            }
                        } elseif ($reparsePoint.Type -eq "Junction") {
                            $pathAnalysis.Junctions += @{
                                Source = $item.FullName
                                Target = $reparsePoint.Target
                            }
                        }
                    }
                }
                catch {
                    $pathAnalysis.Issues += "Failed to analyze item: $($item.FullName) - $($_.Exception.Message)"
                }
            }
            
            return $pathAnalysis
        }
        catch {
            $pathAnalysis.Issues += "Failed to analyze path: $($_.Exception.Message)"
            return $pathAnalysis
        }
    }
    
    hidden [hashtable] GetVolumeInfo([string]$path) {
        try {
            $volume = Get-Volume -FilePath $path -ErrorAction SilentlyContinue
            if ($volume) {
                return @{
                    DriveLetter = $volume.DriveLetter
                    FileSystem = $volume.FileSystem
                    Size = $volume.Size
                    SizeRemaining = $volume.SizeRemaining
                    HealthStatus = $volume.HealthStatus
                }
            }
        }
        catch { }
        
        return @{}
    }
    
    hidden [bool] IsDFSPath([string]$path) {
        try {
            # Check if path is DFS by attempting to get DFS folder info
            $dfsInfo = Get-DfsnFolderTarget -Path $path -ErrorAction SilentlyContinue
            return $dfsInfo -ne $null
        }
        catch {
            return $false
        }
    }
    
    hidden [hashtable] GetReparsePointTarget([string]$path) {
        try {
            $item = Get-Item -Path $path -Force -ErrorAction SilentlyContinue
            if ($item.Attributes -band [FileAttributes]::ReparsePoint) {
                $target = $item.Target
                if ($target) {
                    return @{
                        Type = if ($item.LinkType) { $item.LinkType } else { "Unknown" }
                        Target = $target
                    }
                }
            }
        }
        catch { }
        
        return @{ Type = "Unknown"; Target = "" }
    }
    
    hidden [bool] ShouldIncludeItem([string]$itemPath) {
        $item = Get-Item -Path $itemPath -Force -ErrorAction SilentlyContinue
        if (-not $item) { return $false }
        
        # Check system folder exclusions
        if ($this.MigrationConfig.ExcludeSystemFolders) {
            foreach ($sysFolder in $this.FileFilters.SystemFolders) {
                if ($itemPath -like "*\$sysFolder*" -or $itemPath -like "*\$sysFolder") {
                    return $false
                }
            }
        }
        
        # Check temporary file exclusions
        if ($this.MigrationConfig.ExcludeTemporaryFiles -and -not $item.PSIsContainer) {
            foreach ($tempPattern in $this.FileFilters.TemporaryFiles) {
                if ($item.Name -like $tempPattern) {
                    return $false
                }
            }
        }
        
        # Check hidden file exclusions
        if ($this.MigrationConfig.ExcludeHiddenFiles -and ($item.Attributes -band [FileAttributes]::Hidden)) {
            return $false
        }
        
        # Check custom exclusions
        foreach ($exclusion in $this.MigrationConfig.CustomExclusions) {
            if ($itemPath -like $exclusion) {
                return $false
            }
        }
        
        # Check custom inclusions (if specified, only include matching items)
        if ($this.MigrationConfig.CustomInclusions.Count -gt 0) {
            $included = $false
            foreach ($inclusion in $this.MigrationConfig.CustomInclusions) {
                if ($itemPath -like $inclusion) {
                    $included = $true
                    break
                }
            }
            if (-not $included) { return $false }
        }
        
        # Check file age restrictions
        if (-not $item.PSIsContainer) {
            if ($this.MigrationConfig.MaxFileAge -and $item.CreationTime -lt (Get-Date).AddDays(-$this.MigrationConfig.MaxFileAge)) {
                return $false
            }
            
            if ($this.MigrationConfig.MinFileAge -and $item.CreationTime -gt (Get-Date).AddDays(-$this.MigrationConfig.MinFileAge)) {
                return $false
            }
        }
        
        return $true
    }
    
    hidden [string] AssessPermissionComplexity([hashtable]$permissionInfo) {
        $complexity = "Low"
        
        # Check number of unique security principals
        $totalPrincipals = $permissionInfo.UniqueOwners.Count + $permissionInfo.UniqueGroups.Count
        
        if ($totalPrincipals -gt 100) {
            $complexity = "High"
        } elseif ($totalPrincipals -gt 20) {
            $complexity = "Medium"
        }
        
        # Check for complex permissions (orphaned SIDs, etc.)
        if ($permissionInfo.ComplexPermissions.Count -gt 0) {
            $complexity = "High"
        }
        
        # Check ACE density
        if ($permissionInfo.AccessControlEntries -gt 10000) {
            $complexity = "High"
        } elseif ($permissionInfo.AccessControlEntries -gt 1000) {
            if ($complexity -eq "Low") { $complexity = "Medium" }
        }
        
        return $complexity
    }
    
    hidden [string] AssessMigrationComplexity([hashtable]$analysis) {
        $complexity = "Low"
        $factors = 0
        
        # Size factors
        if ($analysis.TotalSize -gt 10TB) { $factors += 3 }
        elseif ($analysis.TotalSize -gt 1TB) { $factors += 2 }
        elseif ($analysis.TotalSize -gt 100GB) { $factors += 1 }
        
        # File count factors
        if ($analysis.TotalFiles -gt 10000000) { $factors += 3 }
        elseif ($analysis.TotalFiles -gt 1000000) { $factors += 2 }
        elseif ($analysis.TotalFiles -gt 100000) { $factors += 1 }
        
        # Path depth factors
        if ($analysis.DeepestPath.Depth -gt 15) { $factors += 2 }
        elseif ($analysis.DeepestPath.Depth -gt 10) { $factors += 1 }
        
        # Special file factors
        $specialFileCount = 0
        foreach ($pathInfo in $analysis.SourcePaths) {
            $specialFileCount += $pathInfo.SymbolicLinks.Count + $pathInfo.Junctions.Count + 
                               $pathInfo.CompressedFiles.Count + $pathInfo.SparseFiles.Count + 
                               $pathInfo.EncryptedFiles.Count
        }
        
        if ($specialFileCount -gt 1000) { $factors += 2 }
        elseif ($specialFileCount -gt 100) { $factors += 1 }
        
        # Permission complexity factors
        switch ($analysis.Statistics.PermissionComplexity) {
            "High" { $factors += 3 }
            "Medium" { $factors += 1 }
        }
        
        # Migration type factors
        switch ($this.MigrationType) {
            "CrossDomain" { $factors += 2 }
            "WindowsToAzure" { $factors += 2 }
            "DFSMigration" { $factors += 1 }
        }
        
        # Determine overall complexity
        if ($factors -gt 8) {
            $complexity = "High"
        } elseif ($factors -gt 4) {
            $complexity = "Medium"
        }
        
        return $complexity
    }
    
    hidden [string] EstimateMigrationDuration([hashtable]$analysis) {
        try {
            # Base calculation: 100 MB/minute for local, 10 MB/minute for network
            $baseSpeedMBPerMin = if ($this.MigrationType -like "*Network*" -or $this.MigrationType -like "*Azure*") { 10 } else { 100 }
            
            # Adjust for complexity
            $complexityMultiplier = switch ($analysis.Statistics.MigrationComplexity) {
                "High" { 3.0 }
                "Medium" { 2.0 }
                default { 1.0 }
            }
            
            # Adjust for file count (many small files are slower)
            $avgFileSize = if ($analysis.TotalFiles -gt 0) { $analysis.TotalSize / $analysis.TotalFiles } else { 1MB }
            $fileCountMultiplier = if ($avgFileSize -lt 100KB) { 2.0 } else { 1.0 }
            
            # Calculate duration
            $totalMB = $analysis.TotalSize / 1MB
            $adjustedSpeed = $baseSpeedMBPerMin / ($complexityMultiplier * $fileCountMultiplier)
            $durationMinutes = $totalMB / $adjustedSpeed
            
            # Format duration
            if ($durationMinutes -lt 60) {
                return "$([math]::Ceiling($durationMinutes)) minutes"
            } elseif ($durationMinutes -lt 1440) {
                return "$([math]::Round($durationMinutes / 60, 1)) hours"
            } else {
                return "$([math]::Round($durationMinutes / 1440, 1)) days"
            }
        }
        catch {
            return "Unknown"
        }
    }
    
    hidden [double] CalculateRequiredBandwidth([hashtable]$analysis) {
        try {
            # Estimate required bandwidth in Mbps
            if ($this.MigrationType -notlike "*Network*" -and $this.MigrationType -notlike "*Azure*") {
                return 0  # Local migration
            }
            
            # Base requirement: 10 Mbps per TB of data
            $baseBandwidthMbps = ($analysis.TotalSize / 1TB) * 10
            
            # Minimum bandwidth
            $minBandwidthMbps = 1
            
            # Maximum practical bandwidth
            $maxBandwidthMbps = 1000
            
            return [math]::Min([math]::Max($baseBandwidthMbps, $minBandwidthMbps), $maxBandwidthMbps)
        }
        catch {
            return 10  # Default estimate
        }
    }
    
    hidden [array] GenerateAnalysisRecommendations([hashtable]$analysis) {
        $recommendations = @()
        
        # Size-based recommendations
        if ($analysis.TotalSize -gt 10TB) {
            $recommendations += "Consider splitting migration into multiple phases for very large dataset (>10TB)"
        }
        
        if ($analysis.TotalSize -gt 1TB -and $this.MigrationType -like "*Azure*") {
            $recommendations += "Consider using Azure Data Box for large data transfers to cloud"
        }
        
        # File count recommendations
        if ($analysis.TotalFiles -gt 1000000) {
            $recommendations += "Large file count detected - enable multi-threading and consider batch processing"
        }
        
        # Path length recommendations
        if ($analysis.DeepestPath.Depth -gt 10) {
            $recommendations += "Deep directory structure detected - validate target path length limits"
        }
        
        # Permission recommendations
        if ($analysis.Statistics.PermissionComplexity -eq "High") {
            $recommendations += "Complex permissions detected - plan SID translation for cross-domain scenarios"
            $recommendations += "Consider permission simplification before migration"
        }
        
        # Special file recommendations
        foreach ($pathInfo in $analysis.SourcePaths) {
            if ($pathInfo.SymbolicLinks.Count -gt 0) {
                $recommendations += "Symbolic links detected - verify target environment support"
            }
            
            if ($pathInfo.Junctions.Count -gt 0) {
                $recommendations += "Junction points detected - plan replication strategy"
            }
            
            if ($pathInfo.CompressedFiles.Count -gt 0) {
                $recommendations += "Compressed files detected - verify compression preservation settings"
            }
            
            if ($pathInfo.EncryptedFiles.Count -gt 0) {
                $recommendations += "Encrypted files detected - ensure encryption key availability"
            }
            
            if ($pathInfo.DFSPath) {
                $recommendations += "DFS namespace detected - plan namespace migration strategy"
            }
        }
        
        # Performance recommendations
        if ($analysis.Statistics.RequiredBandwidth -gt 100) {
            $recommendations += "High bandwidth requirement - consider scheduled migration during off-hours"
        }
        
        # Issues-based recommendations
        if ($analysis.Issues.Count -gt 0) {
            $recommendations += "Address identified issues before migration execution"
        }
        
        return $recommendations
    }
    
    [hashtable] CreateMigrationBatches([array]$pathsToMigrate, [hashtable]$options = @{}) {
        $this.WriteLog("Creating file system migration batches", "INFO")
        
        $batchConfig = $this.MigrationConfig.Clone()
        foreach ($key in $options.Keys) {
            $batchConfig[$key] = $options[$key]
        }
        
        $batchResult = @{
            Batches = @()
            TotalPaths = $pathsToMigrate.Count
            TotalSize = 0
            EstimatedDurationHours = 0
            RiskAssessment = @{
                High = @()
                Medium = @()
                Low = @()
            }
            PrerequisiteChecks = @()
        }
        
        try {
            # Group paths by size and complexity for optimal batching
            $sortedPaths = $pathsToMigrate | Sort-Object {
                $pathInfo = $this.ContentAnalysis | Where-Object { $_.Path -eq $_ }
                if ($pathInfo) {
                    return $pathInfo.TotalSize + ($pathInfo.FileCount * 1KB)  # Weight by size and file count
                }
                return 0
            }
            
            $batchSize = $batchConfig.BatchSize
            $batchNumber = 1
            
            for ($i = 0; $i -lt $sortedPaths.Count; $i += $batchSize) {
                $batchPaths = $sortedPaths[$i..[Math]::Min($i + $batchSize - 1, $sortedPaths.Count - 1)]
                
                $batch = @{
                    BatchNumber = $batchNumber
                    BatchName = "FileSystemMigrationBatch$batchNumber"
                    SourcePaths = $batchPaths
                    TotalSize = 0
                    TotalFiles = 0
                    EstimatedDurationHours = 0
                    RiskLevel = "Low"
                    Prerequisites = @()
                    Dependencies = @()
                    Status = "NotStarted"
                    CreatedDate = Get-Date
                    ValidationRules = @()
                    PermissionMappings = @{}
                }
                
                # Calculate batch statistics
                foreach ($path in $batchPaths) {
                    $pathInfo = $this.ContentAnalysis | Where-Object { $_.Path -eq $path }
                    if ($pathInfo) {
                        $batch.TotalSize += $pathInfo.TotalSize
                        $batch.TotalFiles += $pathInfo.FileCount
                        
                        # Add path-specific prerequisites
                        if ($pathInfo.PermissionInfo.ComplexPermissions.Count -gt 0) {
                            $batch.Prerequisites += "Validate permissions for path: $path"
                        }
                        
                        if ($pathInfo.SymbolicLinks.Count -gt 0 -or $pathInfo.Junctions.Count -gt 0) {
                            $batch.Prerequisites += "Handle reparse points for path: $path"
                        }
                        
                        if ($pathInfo.NetworkShare) {
                            $batch.Prerequisites += "Verify network connectivity for path: $path"
                        }
                        
                        if ($pathInfo.DFSPath) {
                            $batch.Prerequisites += "Plan DFS namespace migration for path: $path"
                        }
                        
                        # Add validation rules
                        $batch.ValidationRules += @{
                            Type = "FileCount"
                            ExpectedValue = $pathInfo.FileCount
                            Path = $path
                        }
                        
                        $batch.ValidationRules += @{
                            Type = "TotalSize"
                            ExpectedValue = $pathInfo.TotalSize
                            Path = $path
                        }
                    }
                }
                
                # Calculate duration and risk
                $batch.EstimatedDurationHours = $this.CalculateBatchDuration($batch)
                $batch.RiskLevel = $this.AssessBatchRisk($batch)
                
                $batchResult.Batches += $batch
                $batchResult.TotalSize += $batch.TotalSize
                $batchNumber++
            }
            
            # Calculate total estimated duration
            $batchResult.EstimatedDurationHours = ($batchResult.Batches | Measure-Object -Property EstimatedDurationHours -Sum).Sum
            
            # Risk assessment
            foreach ($batch in $batchResult.Batches) {
                $batchResult.RiskAssessment[$batch.RiskLevel] += $batch.SourcePaths
            }
            
            # Generate prerequisite checks
            $batchResult.PrerequisiteChecks = $this.GeneratePrerequisiteChecks()
            
            $this.MigrationBatches = $batchResult.Batches
            $this.WriteLog("Created $($batchResult.Batches.Count) migration batches", "SUCCESS")
            
            return $batchResult
        }
        catch {
            $this.WriteLog("Failed to create migration batches: $($_.Exception.Message)", "ERROR")
            throw
        }
    }
    
    hidden [double] CalculateBatchDuration([hashtable]$batch) {
        # Base calculation similar to analysis but more precise
        $baseSpeedMBPerHour = switch ($this.MigrationType) {
            "WindowsToAzure" { 600 }      # 600 MB/hour (10 MB/min)
            "CrossDomain" { 3600 }        # 3.6 GB/hour (60 MB/min) 
            "LocalToNetwork" { 1800 }     # 1.8 GB/hour (30 MB/min)
            default { 6000 }              # 6 GB/hour (100 MB/min) for local
        }
        
        # File count penalty (many small files are slower)
        $avgFileSize = if ($batch.TotalFiles -gt 0) { $batch.TotalSize / $batch.TotalFiles } else { 1MB }
        $fileCountMultiplier = if ($avgFileSize -lt 100KB) { 0.5 } else { 1.0 }
        
        # Permission complexity penalty
        $permissionMultiplier = if ($this.MigrationConfig.PreserveNTFSPermissions) { 0.8 } else { 1.0 }
        
        $adjustedSpeed = $baseSpeedMBPerHour * $fileCountMultiplier * $permissionMultiplier
        $durationHours = ($batch.TotalSize / 1MB) / $adjustedSpeed
        
        return [Math]::Max([Math]::Ceiling($durationHours), 0.5)  # Minimum 30 minutes
    }
    
    hidden [string] AssessBatchRisk([hashtable]$batch) {
        $riskFactors = 0
        
        # Size risk
        if ($batch.TotalSize -gt 1TB) { $riskFactors += 2 }
        elseif ($batch.TotalSize -gt 100GB) { $riskFactors += 1 }
        
        # File count risk
        if ($batch.TotalFiles -gt 1000000) { $riskFactors += 2 }
        elseif ($batch.TotalFiles -gt 100000) { $riskFactors += 1 }
        
        # Prerequisites risk
        if ($batch.Prerequisites.Count -gt 5) { $riskFactors += 1 }
        
        # Migration type risk
        switch ($this.MigrationType) {
            "WindowsToAzure" { $riskFactors += 1 }
            "CrossDomain" { $riskFactors += 2 }
            "DFSMigration" { $riskFactors += 1 }
        }
        
        if ($riskFactors -gt 4) {
            return "High"
        } elseif ($riskFactors -gt 2) {
            return "Medium"
        } else {
            return "Low"
        }
    }
    
    hidden [array] GeneratePrerequisiteChecks() {
        $checks = @(
            "Verify source and target environment connectivity",
            "Validate sufficient target storage space",
            "Confirm user account permissions and mappings",
            "Test backup and restore procedures",
            "Verify network bandwidth availability"
        )
        
        # Migration type specific checks
        switch ($this.MigrationType) {
            "WindowsToAzure" {
                $checks += "Configure Azure Storage account and access keys"
                $checks += "Install and configure Azure File Sync agent"
                $checks += "Validate Azure Active Directory synchronization"
            }
            "CrossDomain" {
                $checks += "Prepare SID translation mappings"
                $checks += "Establish cross-domain trust relationships"
                $checks += "Configure domain-specific service accounts"
            }
            "DFSMigration" {
                $checks += "Document current DFS namespace structure"
                $checks += "Plan DFS namespace migration strategy"
                $checks += "Configure target DFS environment"
            }
            "LocalToNetwork" {
                $checks += "Verify network share permissions and quotas"
                $checks += "Test network performance and reliability"
                $checks += "Configure offline files and caching settings"
            }
        }
        
        # Configuration specific checks
        if ($this.MigrationConfig.PreserveNTFSPermissions) {
            $checks += "Backup current NTFS permissions using icacls"
            $checks += "Prepare permission mapping documentation"
        }
        
        if ($this.MigrationConfig.EnableVSS) {
            $checks += "Verify Volume Shadow Copy Service availability"
            $checks += "Test VSS snapshot creation and access"
        }
        
        if ($this.MigrationConfig.ScheduledMigration) {
            $checks += "Configure migration scheduling and automation"
            $checks += "Set up monitoring and alerting systems"
        }
        
        return $checks
    }
    
    [hashtable] ExecuteMigration([array]$batchesToMigrate, [hashtable]$options = @{}) {
        $this.WriteLog("Starting file system migration execution", "INFO")
        $this.Performance.StartTime = Get-Date
        
        $migrationResult = @{
            Status = "Running"
            StartTime = Get-Date
            EndTime = $null
            TotalBatches = $batchesToMigrate.Count
            CompletedBatches = 0
            FailedBatches = 0
            TotalFiles = 0
            MigratedFiles = 0
            FailedFiles = 0
            TotalSize = 0
            MigratedSize = 0
            Errors = @()
            BatchResults = @()
            OverallProgress = 0
            PerformanceMetrics = @{}
        }
        
        try {
            # Calculate totals
            foreach ($batch in $batchesToMigrate) {
                $migrationResult.TotalFiles += $batch.TotalFiles
                $migrationResult.TotalSize += $batch.TotalSize
            }
            
            $this.Performance.TotalFiles = $migrationResult.TotalFiles
            $this.Performance.TotalBytes = $migrationResult.TotalSize
            
            # Execute batches
            foreach ($batch in $batchesToMigrate) {
                $this.WriteLog("Processing migration batch: $($batch.BatchName)", "INFO")
                
                # Pre-batch validation
                if ($this.MigrationConfig.ValidateBeforeMigration) {
                    $validationResult = $this.ValidateBatchPrerequisites($batch)
                    if (!$validationResult.IsValid) {
                        $migrationResult.Errors += "Batch validation failed: $($validationResult.Errors -join ', ')"
                        $migrationResult.FailedBatches++
                        continue
                    }
                }
                
                # Execute batch migration
                $batchResult = $this.ExecuteBatchMigration($batch, $options)
                $migrationResult.BatchResults += $batchResult
                
                # Update overall statistics
                if ($batchResult.Status -eq "Completed") {
                    $migrationResult.CompletedBatches++
                } else {
                    $migrationResult.FailedBatches++
                    $migrationResult.Errors += $batchResult.Errors
                }
                
                $migrationResult.MigratedFiles += $batchResult.MigratedFiles
                $migrationResult.FailedFiles += $batchResult.FailedFiles
                $migrationResult.MigratedSize += $batchResult.MigratedSize
                
                # Calculate progress
                $migrationResult.OverallProgress = if ($migrationResult.TotalFiles -gt 0) {
                    [math]::Round(($migrationResult.MigratedFiles / $migrationResult.TotalFiles) * 100, 2)
                } else { 0 }
                
                # Update batch status
                $batch.Status = $batchResult.Status
                
                # Stop on critical error if configured
                if ($options.StopOnCriticalError -and $batchResult.Status -eq "Failed") {
                    $this.WriteLog("Stopping migration due to critical error", "ERROR")
                    break
                }
                
                # Inter-batch delay
                if ($options.BatchDelay -and $options.BatchDelay -gt 0) {
                    $this.WriteLog("Pausing $($options.BatchDelay) seconds between batches", "INFO")
                    Start-Sleep -Seconds $options.BatchDelay
                }
            }
            
            # Finalize migration
            $this.Performance.EndTime = Get-Date
            $migrationResult.EndTime = Get-Date
            $migrationResult.Status = if ($migrationResult.FailedBatches -eq 0) { "Completed" } else { "CompletedWithErrors" }
            
            # Calculate performance metrics
            $migrationResult.PerformanceMetrics = $this.CalculatePerformanceMetrics()
            
            $this.WriteLog("Migration completed. Batches: $($migrationResult.CompletedBatches)/$($migrationResult.TotalBatches), Files: $($migrationResult.MigratedFiles)/$($migrationResult.TotalFiles)", "SUCCESS")
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
            foreach ($sourcePath in $batch.SourcePaths) {
                # Validate source path accessibility
                if (!(Test-Path $sourcePath)) {
                    $validation.Errors += "Source path not accessible: $sourcePath"
                    $validation.IsValid = $false
                    continue
                }
                
                # Validate target path
                $targetPath = $this.MapSourceToTargetPath($sourcePath)
                $targetParent = Split-Path $targetPath -Parent
                
                if (!(Test-Path $targetParent)) {
                    try {
                        New-Item -ItemType Directory -Path $targetParent -Force | Out-Null
                    }
                    catch {
                        $validation.Errors += "Cannot create target directory: $targetParent"
                        $validation.IsValid = $false
                    }
                }
                
                # Check target space
                if ($this.MigrationConfig.ValidateTargetSpace) {
                    $requiredSpace = $batch.TotalSize
                    $availableSpace = $this.GetAvailableSpace($targetPath)
                    
                    if ($availableSpace -lt $requiredSpace * 1.1) {  # 10% buffer
                        $validation.Errors += "Insufficient target space. Required: $([math]::Round($requiredSpace/1GB,2))GB, Available: $([math]::Round($availableSpace/1GB,2))GB"
                        $validation.IsValid = $false
                    }
                }
                
                # Validate permissions
                if ($this.MigrationConfig.PreserveNTFSPermissions) {
                    try {
                        $testFile = Join-Path $targetParent "migration_test_$(Get-Random).tmp"
                        New-Item -ItemType File -Path $testFile -Force | Out-Null
                        Remove-Item $testFile -Force
                    }
                    catch {
                        $validation.Errors += "Insufficient permissions on target: $targetParent"
                        $validation.IsValid = $false
                    }
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
    
    hidden [string] MapSourceToTargetPath([string]$sourcePath) {
        # Map source path to target path based on migration type
        switch ($this.MigrationType) {
            "WindowsToWindows" {
                return $sourcePath.Replace($this.SourceEnvironment, $this.TargetEnvironment)
            }
            "WindowsToAzure" {
                # Transform Windows path to Azure file share path
                $relativePath = $sourcePath.Replace($this.SourceEnvironment, "").TrimStart('\')
                return "$($this.TargetEnvironment.TrimEnd('/'))/$($relativePath.Replace('\', '/'))"
            }
            "LocalToNetwork" {
                $relativePath = $sourcePath.Replace($this.SourceEnvironment, "").TrimStart('\')
                return "$($this.TargetEnvironment.TrimEnd('\'))\$relativePath"
            }
            "CrossDomain" {
                return $sourcePath.Replace($this.SourceEnvironment, $this.TargetEnvironment)
            }
            "DFSMigration" {
                # Handle DFS namespace mapping
                return $this.MapDFSPath($sourcePath)
            }
            default {
                return $sourcePath.Replace($this.SourceEnvironment, $this.TargetEnvironment)
            }
        }
    }
    
    hidden [string] MapDFSPath([string]$sourcePath) {
        # Map DFS source path to target DFS path
        # This would need DFS-specific logic based on namespace configuration
        return $sourcePath.Replace($this.SourceEnvironment, $this.TargetEnvironment)
    }
    
    hidden [long] GetAvailableSpace([string]$path) {
        try {
            $drive = Split-Path $path -Qualifier
            if ($drive) {
                $driveInfo = Get-PSDrive -Name $drive.TrimEnd(':') -ErrorAction SilentlyContinue
                if ($driveInfo) {
                    return $driveInfo.Free
                }
            }
            
            # For UNC paths, try WMI
            if ($path.StartsWith("\\")) {
                # This would need more sophisticated UNC space checking
                return 1TB  # Default assumption for network paths
            }
            
            return 1TB  # Default assumption
        }
        catch {
            return 1TB  # Default assumption if we can't determine
        }
    }
    
    hidden [hashtable] ExecuteBatchMigration([hashtable]$batch, [hashtable]$options) {
        $this.WriteLog("Executing file system batch migration: $($batch.BatchName)", "INFO")
        
        $batchResult = @{
            BatchName = $batch.BatchName
            Status = "Running"
            StartTime = Get-Date
            EndTime = $null
            TotalFiles = $batch.TotalFiles
            MigratedFiles = 0
            FailedFiles = 0
            SkippedFiles = 0
            TotalSize = $batch.TotalSize
            MigratedSize = 0
            Errors = @()
            Warnings = @()
            PathResults = @()
            Progress = 0
            PerformanceMetrics = @{}
        }
        
        try {
            foreach ($sourcePath in $batch.SourcePaths) {
                $this.WriteLog("Migrating path: $sourcePath", "INFO")
                
                try {
                    $pathResult = $this.MigrateSinglePath($sourcePath, $options)
                    $batchResult.PathResults += $pathResult
                    
                    # Update batch statistics
                    $batchResult.MigratedFiles += $pathResult.MigratedFiles
                    $batchResult.FailedFiles += $pathResult.FailedFiles
                    $batchResult.SkippedFiles += $pathResult.SkippedFiles
                    $batchResult.MigratedSize += $pathResult.MigratedSize
                    $batchResult.Errors += $pathResult.Errors
                    $batchResult.Warnings += $pathResult.Warnings
                    
                    # Update progress
                    $batchResult.Progress = if ($batch.SourcePaths.Count -gt 0) {
                        [math]::Round((($batchResult.PathResults.Count) / $batch.SourcePaths.Count) * 100, 1)
                    } else { 100 }
                    
                    $this.WriteLog("Path migration completed: $sourcePath - Files: $($pathResult.MigratedFiles)/$($pathResult.TotalFiles)", "SUCCESS")
                }
                catch {
                    $batchResult.FailedFiles++
                    $batchResult.Errors += "Path migration failed: $sourcePath - $($_.Exception.Message)"
                    $this.WriteLog("Path migration failed: $sourcePath - $($_.Exception.Message)", "ERROR")
                }
            }
            
            # Determine batch status
            if ($batchResult.FailedFiles -eq 0) {
                $batchResult.Status = "Completed"
            } elseif ($batchResult.MigratedFiles -gt 0) {
                $batchResult.Status = "CompletedWithErrors"
            } else {
                $batchResult.Status = "Failed"
            }
            
            # Post-batch validation
            if ($this.MigrationConfig.PostMigrationValidation) {
                $validationResult = $this.ValidateBatchMigration($batch, $batchResult)
                if ($validationResult.Issues.Count -gt 0) {
                    $batchResult.Warnings += $validationResult.Issues
                }
            }
            
            $this.WriteLog("Batch migration completed: $($batch.BatchName) - Status: $($batchResult.Status)", "SUCCESS")
        }
        catch {
            $batchResult.Status = "Failed"
            $batchResult.Errors += $_.Exception.Message
            $this.WriteLog("Batch migration failed: $($_.Exception.Message)", "ERROR")
        }
        
        $batchResult.EndTime = Get-Date
        return $batchResult
    }
    
    hidden [hashtable] MigrateSinglePath([string]$sourcePath, [hashtable]$options) {
        $pathResult = @{
            SourcePath = $sourcePath
            TargetPath = ""
            Status = "Running"
            StartTime = Get-Date
            EndTime = $null
            TotalFiles = 0
            MigratedFiles = 0
            FailedFiles = 0
            SkippedFiles = 0
            TotalSize = 0
            MigratedSize = 0
            Errors = @()
            Warnings = @()
            Progress = 0
            Method = ""
        }
        
        try {
            # Map target path
            $targetPath = $this.MapSourceToTargetPath($sourcePath)
            $pathResult.TargetPath = $targetPath
            
            # Ensure target directory exists
            $targetParent = Split-Path $targetPath -Parent
            if ($targetParent -and !(Test-Path $targetParent)) {
                New-Item -ItemType Directory -Path $targetParent -Force | Out-Null
            }
            
            # Choose migration method
            if ($this.MigrationConfig.UseRobocopy) {
                $pathResult.Method = "Robocopy"
                $result = $this.MigrateUsingRobocopy($sourcePath, $targetPath, $pathResult)
            } else {
                $pathResult.Method = "PowerShell"
                $result = $this.MigrateUsingPowerShell($sourcePath, $targetPath, $pathResult)
            }
            
            # Merge results
            foreach ($key in $result.Keys) {
                if ($key -in @('MigratedFiles', 'FailedFiles', 'SkippedFiles', 'MigratedSize')) {
                    $pathResult[$key] += $result[$key]
                } elseif ($key -in @('Errors', 'Warnings')) {
                    $pathResult[$key] += $result[$key]
                }
            }
            
            # Migrate permissions separately if needed
            if ($this.MigrationConfig.PreserveNTFSPermissions -and $pathResult.Method -eq "PowerShell") {
                $this.MigratePermissions($sourcePath, $targetPath, $pathResult)
            }
            
            # Post-migration tasks
            if ($this.MigrationConfig.ValidateChecksums) {
                $this.ValidateFileIntegrity($sourcePath, $targetPath, $pathResult)
            }
            
            $pathResult.Status = if ($pathResult.FailedFiles -eq 0) { "Success" } else { "CompletedWithErrors" }
            $pathResult.Progress = 100
            
            $this.WriteLog("Path migration completed successfully: $sourcePath", "SUCCESS")
        }
        catch {
            $pathResult.Status = "Failed"
            $pathResult.Errors += $_.Exception.Message
            $this.WriteLog("Path migration failed: $($_.Exception.Message)", "ERROR")
        }
        
        $pathResult.EndTime = Get-Date
        return $pathResult
    }
    
    hidden [hashtable] MigrateUsingRobocopy([string]$sourcePath, [string]$targetPath, [hashtable]$pathResult) {
        $this.WriteLog("Using Robocopy for migration: $sourcePath -> $targetPath", "VERBOSE")
        
        $result = @{
            MigratedFiles = 0
            FailedFiles = 0
            SkippedFiles = 0
            MigratedSize = 0
            Errors = @()
            Warnings = @()
        }
        
        try {
            # Build Robocopy command
            $robocopyArgs = @($sourcePath, $targetPath) + $this.MigrationConfig.RobocopyOptions
            
            # Add exclusions
            if ($this.MigrationConfig.ExcludeSystemFolders) {
                foreach ($folder in $this.FileFilters.SystemFolders) {
                    $robocopyArgs += "/XD"
                    $robocopyArgs += $folder
                }
            }
            
            if ($this.MigrationConfig.ExcludeTemporaryFiles) {
                foreach ($pattern in $this.FileFilters.TemporaryFiles) {
                    $robocopyArgs += "/XF"
                    $robocopyArgs += $pattern
                }
            }
            
            # Add custom exclusions
            foreach ($exclusion in $this.MigrationConfig.CustomExclusions) {
                if ($exclusion.Contains('\')) {
                    $robocopyArgs += "/XD"
                } else {
                    $robocopyArgs += "/XF"
                }
                $robocopyArgs += $exclusion
            }
            
            # Add logging
            $logFile = Join-Path $this.MigrationConfig.TempStorage "robocopy_$((Get-Date).ToString('yyyyMMdd_HHmmss')).log"
            $robocopyArgs += "/LOG:$logFile"
            
            # Execute Robocopy
            $this.WriteLog("Executing: robocopy $($robocopyArgs -join ' ')", "DEBUG")
            
            $robocopyProcess = Start-Process -FilePath "robocopy.exe" -ArgumentList $robocopyArgs -Wait -PassThru -NoNewWindow
            
            # Parse Robocopy results
            if (Test-Path $logFile) {
                $logContent = Get-Content $logFile
                $result = $this.ParseRobocopyLog($logContent)
            }
            
            # Handle Robocopy exit codes
            switch ($robocopyProcess.ExitCode) {
                0 { $this.WriteLog("Robocopy completed successfully - No files copied", "INFO") }
                1 { $this.WriteLog("Robocopy completed successfully - Files copied", "SUCCESS") }
                2 { $this.WriteLog("Robocopy completed - Extra files/directories detected", "WARNING") }
                3 { $this.WriteLog("Robocopy completed - Files copied and extra files detected", "WARNING") }
                { $_ -ge 4 } { 
                    $result.Errors += "Robocopy failed with exit code: $($robocopyProcess.ExitCode)"
                    $this.WriteLog("Robocopy failed with exit code: $($robocopyProcess.ExitCode)", "ERROR")
                }
            }
            
            return $result
        }
        catch {
            $result.Errors += "Robocopy execution failed: $($_.Exception.Message)"
            return $result
        }
    }
    
    hidden [hashtable] ParseRobocopyLog([array]$logLines) {
        $result = @{
            MigratedFiles = 0
            FailedFiles = 0
            SkippedFiles = 0
            MigratedSize = 0
            Errors = @()
            Warnings = @()
        }
        
        try {
            foreach ($line in $logLines) {
                # Parse Robocopy statistics
                if ($line -match "Files\s*:\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)") {
                    $result.MigratedFiles = [int]$matches[2]  # Copied
                    $result.SkippedFiles = [int]$matches[3]   # Skipped
                    $result.FailedFiles = [int]$matches[6]    # Failed
                }
                
                if ($line -match "Bytes\s*:\s*([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)") {
                    $copiedBytes = $matches[2] -replace ',', ''
                    $result.MigratedSize = [long]$copiedBytes
                }
                
                # Parse errors and warnings
                if ($line -match "ERROR\s+\d+\s+(.+)") {
                    $result.Errors += $matches[1]
                }
                
                if ($line -match "WARNING\s+(.+)") {
                    $result.Warnings += $matches[1]
                }
            }
            
            return $result
        }
        catch {
            $result.Errors += "Failed to parse Robocopy log: $($_.Exception.Message)"
            return $result
        }
    }
    
    hidden [hashtable] MigrateUsingPowerShell([string]$sourcePath, [string]$targetPath, [hashtable]$pathResult) {
        $this.WriteLog("Using PowerShell for migration: $sourcePath -> $targetPath", "VERBOSE")
        
        $result = @{
            MigratedFiles = 0
            FailedFiles = 0
            SkippedFiles = 0
            MigratedSize = 0
            Errors = @()
            Warnings = @()
        }
        
        try {
            # Get all items to migrate
            $items = Get-ChildItem -Path $sourcePath -Recurse -Force -ErrorAction SilentlyContinue |
                Where-Object { $this.ShouldIncludeItem($_.FullName) }
            
            $totalItems = $items.Count
            $processedItems = 0
            
            foreach ($item in $items) {
                try {
                    $relativePath = $item.FullName.Replace($sourcePath, "").TrimStart('\')
                    $targetItemPath = Join-Path $targetPath $relativePath
                    
                    if ($item.PSIsContainer) {
                        # Create directory
                        if (!(Test-Path $targetItemPath)) {
                            New-Item -ItemType Directory -Path $targetItemPath -Force | Out-Null
                        }
                    } else {
                        # Copy file
                        $targetDir = Split-Path $targetItemPath -Parent
                        if (!(Test-Path $targetDir)) {
                            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
                        }
                        
                        # Handle large files with progress
                        if ($item.Length -gt 100MB) {
                            $this.CopyLargeFile($item.FullName, $targetItemPath, $result)
                        } else {
                            Copy-Item -Path $item.FullName -Destination $targetItemPath -Force
                            $result.MigratedSize += $item.Length
                        }
                        
                        $result.MigratedFiles++
                        
                        # Preserve timestamps
                        if ($this.MigrationConfig.PreserveTimestamps) {
                            $targetItem = Get-Item $targetItemPath
                            $targetItem.CreationTime = $item.CreationTime
                            $targetItem.LastWriteTime = $item.LastWriteTime
                            $targetItem.LastAccessTime = $item.LastAccessTime
                        }
                        
                        # Preserve attributes
                        if ($this.MigrationConfig.PreserveAttributes) {
                            Set-ItemProperty -Path $targetItemPath -Name Attributes -Value $item.Attributes
                        }
                    }
                    
                    $processedItems++
                    
                    # Update progress
                    if ($totalItems -gt 0) {
                        $pathResult.Progress = [math]::Round(($processedItems / $totalItems) * 100, 1)
                    }
                    
                    # Performance tracking
                    $this.Performance.TransferredFiles++
                    $this.Performance.TransferredBytes += $item.Length
                }
                catch {
                    $result.FailedFiles++
                    $result.Errors += "Failed to copy $($item.FullName): $($_.Exception.Message)"
                    $this.WriteLog("Failed to copy file: $($item.FullName) - $($_.Exception.Message)", "WARNING")
                }
            }
            
            return $result
        }
        catch {
            $result.Errors += "PowerShell migration failed: $($_.Exception.Message)"
            return $result
        }
    }
    
    hidden [void] CopyLargeFile([string]$sourcePath, [string]$targetPath, [hashtable]$result) {
        try {
            $this.WriteLog("Copying large file: $sourcePath", "VERBOSE")
            
            # Use .NET FileStream for better control over large files
            $bufferSize = $this.MigrationConfig.BufferSize
            $sourceStream = [System.IO.File]::OpenRead($sourcePath)
            $targetStream = [System.IO.File]::Create($targetPath)
            
            try {
                $buffer = New-Object byte[] $bufferSize
                $totalBytes = $sourceStream.Length
                $copiedBytes = 0
                
                while ($copiedBytes -lt $totalBytes) {
                    $bytesRead = $sourceStream.Read($buffer, 0, $bufferSize)
                    if ($bytesRead -eq 0) { break }
                    
                    $targetStream.Write($buffer, 0, $bytesRead)
                    $copiedBytes += $bytesRead
                    
                    # Update performance metrics
                    $this.Performance.TransferredBytes += $bytesRead
                }
                
                $result.MigratedSize += $totalBytes
            }
            finally {
                $sourceStream.Close()
                $targetStream.Close()
            }
        }
        catch {
            $result.Errors += "Large file copy failed: $sourcePath - $($_.Exception.Message)"
        }
    }
    
    hidden [void] MigratePermissions([string]$sourcePath, [string]$targetPath, [hashtable]$pathResult) {
        try {
            $this.WriteLog("Migrating permissions: $sourcePath -> $targetPath", "VERBOSE")
            
            # Get all items with unique permissions
            $items = Get-ChildItem -Path $sourcePath -Recurse -Force -ErrorAction SilentlyContinue |
                Where-Object { $_.FullName | Get-Acl -ErrorAction SilentlyContinue | Where-Object { $_.Access.Count -gt 0 } }
            
            foreach ($item in $items) {
                try {
                    $relativePath = $item.FullName.Replace($sourcePath, "").TrimStart('\')
                    $targetItemPath = Join-Path $targetPath $relativePath
                    
                    if (Test-Path $targetItemPath) {
                        $sourceAcl = Get-Acl -Path $item.FullName
                        $targetAcl = Get-Acl -Path $targetItemPath
                        
                        # Copy access rules
                        foreach ($accessRule in $sourceAcl.Access) {
                            try {
                                # Translate SIDs if cross-domain migration
                                $identity = $accessRule.IdentityReference
                                if ($this.MigrationConfig.MapCrossDomainSIDs -and $this.SidTranslationTable.ContainsKey($identity.Value)) {
                                    $identity = $this.SidTranslationTable[$identity.Value]
                                }
                                
                                $newAccessRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
                                    $identity,
                                    $accessRule.FileSystemRights,
                                    $accessRule.InheritanceFlags,
                                    $accessRule.PropagationFlags,
                                    $accessRule.AccessControlType
                                )
                                
                                $targetAcl.SetAccessRule($newAccessRule)
                            }
                            catch {
                                $pathResult.Warnings += "Failed to copy permission for $($accessRule.IdentityReference): $($_.Exception.Message)"
                            }
                        }
                        
                        # Set ownership
                        if ($this.MigrationConfig.PreserveOwnership) {
                            try {
                                $owner = $sourceAcl.Owner
                                if ($this.MigrationConfig.MapCrossDomainSIDs -and $this.SidTranslationTable.ContainsKey($owner)) {
                                    $owner = $this.SidTranslationTable[$owner]
                                }
                                $targetAcl.SetOwner($owner)
                            }
                            catch {
                                $pathResult.Warnings += "Failed to set owner for ${targetItemPath}: $($_.Exception.Message)"
                            }
                        }
                        
                        # Apply ACL
                        Set-Acl -Path $targetItemPath -AclObject $targetAcl
                    }
                }
                catch {
                    $pathResult.Warnings += "Failed to migrate permissions for $($item.FullName): $($_.Exception.Message)"
                }
            }
        }
        catch {
            $pathResult.Warnings += "Permission migration failed: $($_.Exception.Message)"
        }
    }
    
    hidden [void] ValidateFileIntegrity([string]$sourcePath, [string]$targetPath, [hashtable]$pathResult) {
        try {
            $this.WriteLog("Validating file integrity: $sourcePath -> $targetPath", "VERBOSE")
            
            # Compare file counts and sizes
            $sourceItems = Get-ChildItem -Path $sourcePath -Recurse -File -Force -ErrorAction SilentlyContinue
            $targetItems = Get-ChildItem -Path $targetPath -Recurse -File -Force -ErrorAction SilentlyContinue
            
            $sourceCount = $sourceItems.Count
            $targetCount = $targetItems.Count
            $sourceSize = ($sourceItems | Measure-Object -Property Length -Sum).Sum
            $targetSize = ($targetItems | Measure-Object -Property Length -Sum).Sum
            
            if ($sourceCount -ne $targetCount) {
                $pathResult.Warnings += "File count mismatch: Source=$sourceCount, Target=$targetCount"
            }
            
            if ($sourceSize -ne $targetSize) {
                $pathResult.Warnings += "Total size mismatch: Source=$sourceSize, Target=$targetSize"
            }
            
            # Sample checksum validation for critical files
            if ($this.MigrationConfig.ValidateChecksums) {
                $sampleFiles = $sourceItems | Get-Random -Count ([math]::Min(10, $sourceItems.Count))
                
                foreach ($sourceFile in $sampleFiles) {
                    try {
                        $relativePath = $sourceFile.FullName.Replace($sourcePath, "").TrimStart('\')
                        $targetFile = Join-Path $targetPath $relativePath
                        
                        if (Test-Path $targetFile) {
                            $sourceHash = Get-FileHash -Path $sourceFile.FullName -Algorithm SHA256
                            $targetHash = Get-FileHash -Path $targetFile -Algorithm SHA256
                            
                            if ($sourceHash.Hash -ne $targetHash.Hash) {
                                $pathResult.Warnings += "Checksum mismatch for file: $relativePath"
                            }
                        }
                    }
                    catch {
                        $pathResult.Warnings += "Checksum validation failed for: $($sourceFile.FullName)"
                    }
                }
            }
        }
        catch {
            $pathResult.Warnings += "Integrity validation failed: $($_.Exception.Message)"
        }
    }
    
    hidden [hashtable] ValidateBatchMigration([hashtable]$batch, [hashtable]$batchResult) {
        $validation = @{
            IsValid = $true
            Issues = @()
            Metrics = @{}
        }
        
        try {
            foreach ($sourcePath in $batch.SourcePaths) {
                $targetPath = $this.MapSourceToTargetPath($sourcePath)
                
                if (Test-Path $targetPath) {
                    # Validate against expected rules
                    foreach ($rule in $batch.ValidationRules) {
                        if ($rule.Path -eq $sourcePath) {
                            switch ($rule.Type) {
                                "FileCount" {
                                    $actualCount = (Get-ChildItem -Path $targetPath -Recurse -File -Force -ErrorAction SilentlyContinue).Count
                                    if ($actualCount -ne $rule.ExpectedValue) {
                                        $validation.Issues += "File count validation failed for $sourcePath : Expected=$($rule.ExpectedValue), Actual=$actualCount"
                                    }
                                }
                                "TotalSize" {
                                    $actualSize = (Get-ChildItem -Path $targetPath -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
                                    $sizeDiff = [math]::Abs($actualSize - $rule.ExpectedValue)
                                    if ($sizeDiff -gt ($rule.ExpectedValue * 0.01)) {  # 1% tolerance
                                        $validation.Issues += "Size validation failed for $sourcePath : Expected=$($rule.ExpectedValue), Actual=$actualSize"
                                    }
                                }
                            }
                        }
                    }
                } else {
                    $validation.Issues += "Target path not found: $targetPath"
                }
            }
            
            $validation.IsValid = $validation.Issues.Count -eq 0
            return $validation
        }
        catch {
            $validation.Issues += "Validation failed: $($_.Exception.Message)"
            $validation.IsValid = $false
            return $validation
        }
    }
    
    hidden [hashtable] CalculatePerformanceMetrics() {
        $metrics = @{
            Duration = if ($this.Performance.EndTime) { 
                $this.Performance.EndTime - $this.Performance.StartTime 
            } else { $null }
            TotalFiles = $this.Performance.TotalFiles
            TransferredFiles = $this.Performance.TransferredFiles
            FailedFiles = $this.Performance.FailedFiles
            TotalBytes = $this.Performance.TotalBytes
            TransferredBytes = $this.Performance.TransferredBytes
            AverageSpeedMBps = 0
            FilesPerSecond = 0
            SuccessRate = 0
        }
        
        if ($metrics.Duration) {
            $durationSeconds = $metrics.Duration.TotalSeconds
            
            if ($durationSeconds -gt 0) {
                $metrics.AverageSpeedMBps = [math]::Round(($metrics.TransferredBytes / 1MB) / $durationSeconds, 2)
                $metrics.FilesPerSecond = [math]::Round($metrics.TransferredFiles / $durationSeconds, 2)
            }
        }
        
        if ($metrics.TotalFiles -gt 0) {
            $metrics.SuccessRate = [math]::Round(($metrics.TransferredFiles / $metrics.TotalFiles) * 100, 2)
        }
        
        return $metrics
    }
    
    [hashtable] GetMigrationStatus([string]$batchName = $null) {
        $this.WriteLog("Getting file system migration status", "INFO")
        
        $status = @{
            Batches = @()
            OverallStatus = "Unknown"
            TotalFiles = 0
            MigratedFiles = 0
            FailedFiles = 0
            InProgressFiles = 0
            TotalSize = 0
            MigratedSize = 0
            OverallProgress = 0
            PerformanceMetrics = $this.CalculatePerformanceMetrics()
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
                    TotalFiles = $batch.TotalFiles
                    TotalSize = $batch.TotalSize
                    Progress = 0
                    EstimatedCompletion = $null
                    Paths = @()
                }
                
                # Calculate batch progress based on path completion
                $completedPaths = 0
                foreach ($path in $batch.SourcePaths) {
                    $pathStatus = @{
                        Path = $path
                        Status = "NotStarted"  # Would be updated during actual migration
                        Progress = 0
                    }
                    
                    $batchStatus.Paths += $pathStatus
                }
                
                $batchStatus.Progress = if ($batch.SourcePaths.Count -gt 0) {
                    [math]::Round(($completedPaths / $batch.SourcePaths.Count) * 100, 2)
                } else { 0 }
                
                $status.Batches += $batchStatus
                $status.TotalFiles += $batchStatus.TotalFiles
                $status.TotalSize += $batchStatus.TotalSize
            }
            
            # Calculate overall statistics from performance metrics
            $status.MigratedFiles = $this.Performance.TransferredFiles
            $status.FailedFiles = $this.Performance.FailedFiles
            $status.MigratedSize = $this.Performance.TransferredBytes
            
            $status.OverallProgress = if ($status.TotalFiles -gt 0) {
                [math]::Round(($status.MigratedFiles / $status.TotalFiles) * 100, 2)
            } else { 0 }
            
            # Determine overall status
            $runningBatches = ($status.Batches | Where-Object { $_.Status -eq "Running" }).Count
            $failedBatches = ($status.Batches | Where-Object { $_.Status -eq "Failed" }).Count
            $completedBatches = ($status.Batches | Where-Object { $_.Status -eq "Completed" }).Count
            
            if ($runningBatches -gt 0) {
                $status.OverallStatus = "InProgress"
            } elseif ($failedBatches -gt 0) {
                $status.OverallStatus = "CompletedWithErrors"
            } elseif ($completedBatches -eq $status.Batches.Count -and $status.Batches.Count -gt 0) {
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
                TotalFiles = $migrationResult.TotalFiles
                MigratedFiles = $migrationResult.MigratedFiles
                FailedFiles = $migrationResult.FailedFiles
                TotalSizeGB = [math]::Round($migrationResult.TotalSize / 1GB, 2)
                MigratedSizeGB = [math]::Round($migrationResult.MigratedSize / 1GB, 2)
                SuccessRate = if ($migrationResult.TotalFiles -gt 0) { 
                    [math]::Round(($migrationResult.MigratedFiles / $migrationResult.TotalFiles) * 100, 2) 
                } else { 0 }
                Duration = if ($migrationResult.EndTime) { 
                    $migrationResult.EndTime - $migrationResult.StartTime 
                } else { $null }
                AverageSpeedMBps = $migrationResult.PerformanceMetrics.AverageSpeedMBps
            }
            BatchDetails = $migrationResult.BatchResults
            PerformanceMetrics = $migrationResult.PerformanceMetrics
            Errors = $migrationResult.Errors
            Configuration = $this.MigrationConfig
            LogPath = $this.LogPath
            Recommendations = @()
            ValidationSummary = @{}
        }
        
        # Add post-migration recommendations
        if ($report.Summary.SuccessRate -lt 100) {
            $report.Recommendations += "Review failed files and retry migration if needed"
        }
        
        if ($migrationResult.Errors.Count -gt 0) {
            $report.Recommendations += "Address error conditions identified during migration"
        }
        
        if ($this.MigrationConfig.PreserveNTFSPermissions) {
            $report.Recommendations += "Validate migrated permissions and access rights"
        }
        
        if ($report.Summary.AverageSpeedMBps -lt 10) {
            $report.Recommendations += "Consider performance optimization for future migrations"
        }
        
        $report.Recommendations += "Perform user acceptance testing on migrated content"
        $report.Recommendations += "Update any applications or scripts that reference old paths"
        $report.Recommendations += "Consider cleanup of source data after validation period"
        
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
            RolledBackPaths = 0
            FailedRollbacks = 0
            Errors = @()
        }
        
        try {
            if (!$this.MigrationConfig.EnableRollback) {
                throw "Rollback is not enabled in configuration"
            }
            
            $batch = $this.MigrationBatches | Where-Object { $_.BatchName -eq $batchName }
            
            if (-not $batch) {
                throw "Batch '$batchName' not found"
            }
            
            foreach ($sourcePath in $batch.SourcePaths) {
                try {
                    $targetPath = $this.MapSourceToTargetPath($sourcePath)
                    
                    # Remove target content
                    if (Test-Path $targetPath) {
                        Remove-Item -Path $targetPath -Recurse -Force
                        $rollbackResult.RolledBackPaths++
                        $this.WriteLog("Rolled back path: $targetPath", "INFO")
                    }
                    
                    # Restore from backup if available
                    if ($this.MigrationConfig.CreateBackup -and $this.MigrationConfig.BackupLocation) {
                        $backupPath = Join-Path $this.MigrationConfig.BackupLocation (Split-Path $sourcePath -Leaf)
                        if (Test-Path $backupPath) {
                            Copy-Item -Path $backupPath -Destination $sourcePath -Recurse -Force
                            $this.WriteLog("Restored from backup: $backupPath -> $sourcePath", "INFO")
                        }
                    }
                }
                catch {
                    $rollbackResult.FailedRollbacks++
                    $rollbackResult.Errors += "Failed to rollback path '$sourcePath': $($_.Exception.Message)"
                    $this.WriteLog("Rollback failed for path '$sourcePath': $($_.Exception.Message)", "ERROR")
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
            # Clean up temporary files
            if (Test-Path $this.MigrationConfig.TempStorage) {
                Remove-Item $this.MigrationConfig.TempStorage -Recurse -Force -ErrorAction SilentlyContinue
            }
            
            # Close any open file handles
            [System.GC]::Collect()
            [System.GC]::WaitForPendingFinalizers()
            
            $this.WriteLog("File system migration cleanup completed", "INFO")
        }
        catch {
            $this.WriteLog("Cleanup failed: $($_.Exception.Message)", "WARNING")
        }
    }
}

function New-FileSystemMigration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [ValidateSet('WindowsToWindows', 'WindowsToAzure', 'LocalToNetwork', 'CrossDomain', 'DFSMigration')]
        [string]$MigrationType
    )
    
    return [FileSystemMigration]::new($MigrationType)
}

# Export module functions
Export-ModuleMember -Function New-FileSystemMigration