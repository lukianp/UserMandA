#Requires -Version 5.1
using namespace System.Collections.Generic

Set-StrictMode -Version 3.0

class UserProfileMigration {
    [string]$SourceDomain
    [string]$TargetDomain
    [object]$SourceCredential
    [object]$TargetCredential
    [hashtable]$SidMappings
    [hashtable]$GroupMappings
    [hashtable]$UserMappings
    [hashtable]$MigrationConfig
    [array]$MigrationQueue
    [hashtable]$MigrationStatus
    [string]$LogPath
    [string]$BackupLocation
    [object]$SidTranslationCache
    
    UserProfileMigration([string]$sourceDomain, [string]$targetDomain) {
        $this.SourceDomain = $sourceDomain
        $this.TargetDomain = $targetDomain
        $this.SidMappings = @{}
        $this.GroupMappings = @{}
        $this.UserMappings = @{}
        $this.SidTranslationCache = @{}
        $this.MigrationConfig = @{
            # Profile Migration Types
            MigrationType = 'DomainToNewDomain' # DomainToNewDomain, CrossForest, LocalToDomain, RoamingProfiles
            
            # Profile Components
            MigrateUserFolders = $true
            MigrateNTUserDat = $true
            MigrateApplicationData = $true
            MigrateGroupMemberships = $true
            MigrateCachedCredentials = $false  # Security consideration
            
            # Re-ACLing Configuration
            EnableReACLing = $true
            PerformSidTranslation = $true
            UpdateRegistryHives = $true
            UpdateFolderPermissions = $true
            UpdateFileAssociations = $true
            
            # Size and Optimization
            EnableSizeOptimization = $true
            ExcludeTempFiles = $true
            ExcludeInternetCache = $true
            CompressProfiles = $false
            MaxProfileSizeMB = 5120  # 5GB default limit
            
            # Conflict Resolution
            ConflictResolution = 'Merge'  # Merge, Replace, Skip, Prompt
            BackupExistingProfiles = $true
            CreateBackupBeforeMigration = $true
            
            # Wave-based Migration
            EnableWaveMigration = $true
            BatchSize = 10
            WaveDelay = 300  # 5 minutes between waves
            
            # Error Handling
            RetryAttempts = 3
            ContinueOnError = $true
            RollbackOnFailure = $false
            
            # Monitoring and Logging
            EnableRealTimeMonitoring = $true
            DetailedLogging = $true
            PerformanceMetrics = $true
            
            # Profile Paths
            SourceProfilePath = "\\$sourceDomain\c$\Users"
            TargetProfilePath = "\\$targetDomain\c$\Users"
            BackupPath = "\\$targetDomain\Backup\ProfileMigration"
            
            # Advanced Features
            EnableSelectiveMigration = $true
            UseVSS = $true  # Volume Shadow Copy Service
            EnableDedupe = $false
            ParallelProcessing = $true
            MaxConcurrentJobs = 5
        }
        $this.MigrationQueue = @()
        $this.MigrationStatus = @{}
        $this.BackupLocation = $this.MigrationConfig.BackupPath
        $this.LogPath = ".\Logs\UserProfileMigration_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
        $this.InitializeLogging()
    }
    
    hidden [void] InitializeLogging() {
        $logDir = Split-Path $this.LogPath -Parent
        if (!(Test-Path $logDir)) {
            New-Item -ItemType Directory -Path $logDir -Force | Out-Null
        }
        
        $this.WriteLog("UserProfileMigration module initialized", "INFO")
        $this.WriteLog("Source Domain: $($this.SourceDomain)", "INFO")
        $this.WriteLog("Target Domain: $($this.TargetDomain)", "INFO")
        $this.WriteLog("Migration Type: $($this.MigrationConfig.MigrationType)", "INFO")
    }
    
    hidden [void] WriteLog([string]$message, [string]$level = "INFO") {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $logEntry = "[$timestamp] [$level] $message"
        Add-Content -Path $this.LogPath -Value $logEntry
        
        switch ($level) {
            "ERROR" { Write-Host $logEntry -ForegroundColor Red }
            "WARNING" { Write-Host $logEntry -ForegroundColor Yellow }
            "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
            "PROGRESS" { Write-Host $logEntry -ForegroundColor Cyan }
            default { Write-Host $logEntry -ForegroundColor White }
        }
    }
    
    [void] SetCredentials([pscredential]$sourceCredential, [pscredential]$targetCredential) {
        $this.SourceCredential = $sourceCredential
        $this.TargetCredential = $targetCredential
        $this.WriteLog("Credentials configured for both domains", "INFO")
    }
    
    [hashtable] AnalyzeSourceProfiles([array]$userList = @()) {
        $this.WriteLog("Starting source profile analysis", "INFO")
        
        $analysisResult = @{
            UserProfiles = @()
            TotalProfiles = 0
            TotalSizeGB = 0
            LargeProfiles = @()
            CorruptedProfiles = @()
            OrphanedProfiles = @()
            SidMappings = @{}
            ProfileComponents = @{
                NTUserDat = 0
                AppData = 0
                Desktop = 0
                Documents = 0
                Downloads = 0
                Pictures = 0
                Videos = 0
                Music = 0
            }
            RiskAssessment = @{
                High = @()
                Medium = @()
                Low = @()
            }
            Recommendations = @()
            Dependencies = @()
        }
        
        try {
            # Get all user profiles from source
            $profiles = $this.GetSourceUserProfiles($userList)
            
            foreach ($profile in $profiles) {
                $profileInfo = @{
                    UserName = $profile.UserName
                    SID = $profile.SID
                    ProfilePath = $profile.LocalPath
                    LastUseTime = $profile.LastUseTime
                    SizeGB = $this.CalculateProfileSize($profile.LocalPath)
                    IsLoaded = $profile.Loaded
                    IsCorrupted = $false
                    IsOrphaned = $false
                    Components = $this.AnalyzeProfileComponents($profile.LocalPath)
                    RegistryHive = $this.CheckRegistryHive($profile.SID)
                    Permissions = $this.AnalyzeProfilePermissions($profile.LocalPath)
                    Dependencies = $this.FindProfileDependencies($profile)
                    MigrationReady = $true
                    Issues = @()
                    RiskLevel = "Low"
                }
                
                # Validate profile integrity
                $validationResult = $this.ValidateProfileIntegrity($profile)
                if (!$validationResult.IsValid) {
                    $profileInfo.IsCorrupted = $true
                    $profileInfo.MigrationReady = $false
                    $profileInfo.Issues += $validationResult.Issues
                    $profileInfo.RiskLevel = "High"
                    $analysisResult.CorruptedProfiles += $profileInfo
                }
                
                # Check for orphaned profiles
                if ($this.IsOrphanedProfile($profile)) {
                    $profileInfo.IsOrphaned = $true
                    $profileInfo.RiskLevel = "Medium"
                    $analysisResult.OrphanedProfiles += $profileInfo
                }
                
                # Assess migration risk
                $profileInfo.RiskLevel = $this.AssessProfileMigrationRisk($profileInfo)
                
                # Track large profiles
                if ($profileInfo.SizeGB -gt ($this.MigrationConfig.MaxProfileSizeMB / 1024)) {
                    $analysisResult.LargeProfiles += $profileInfo
                    $profileInfo.RiskLevel = "High"
                }
                
                $analysisResult.UserProfiles += $profileInfo
                $analysisResult.TotalSizeGB += $profileInfo.SizeGB
                $analysisResult.RiskAssessment[$profileInfo.RiskLevel] += $profileInfo.UserName
                
                # Update component statistics
                foreach ($component in $profileInfo.Components.Keys) {
                    if ($profileInfo.Components[$component]) {
                        $analysisResult.ProfileComponents[$component]++
                    }
                }
            }
            
            $analysisResult.TotalProfiles = $profiles.Count
            
            # Generate SID mappings
            $analysisResult.SidMappings = $this.CreateSidMappings($analysisResult.UserProfiles)
            
            # Generate recommendations
            $analysisResult.Recommendations = $this.GenerateProfileMigrationRecommendations($analysisResult)
            
            $this.WriteLog("Profile analysis completed. Total profiles: $($analysisResult.TotalProfiles), Total size: $([math]::Round($analysisResult.TotalSizeGB, 2)) GB", "SUCCESS")
            return $analysisResult
        }
        catch {
            $this.WriteLog("Failed to analyze source profiles: $($_.Exception.Message)", "ERROR")
            throw
        }
    }
    
    hidden [array] GetSourceUserProfiles([array]$userList) {
        $profiles = @()
        
        try {
            if ($userList.Count -gt 0) {
                foreach ($user in $userList) {
                    $userProfile = Get-WmiObject -Class Win32_UserProfile -ComputerName $this.SourceDomain | 
                                   Where-Object { $_.LocalPath -like "*\$user" }
                    if ($userProfile) {
                        $profiles += $userProfile
                    }
                }
            }
            else {
                $profiles = Get-WmiObject -Class Win32_UserProfile -ComputerName $this.SourceDomain | 
                           Where-Object { $_.Special -eq $false }
            }
            
            # Enrich profile data
            foreach ($profile in $profiles) {
                $profile | Add-Member -NotePropertyName "UserName" -NotePropertyValue (Split-Path $profile.LocalPath -Leaf)
                $profile | Add-Member -NotePropertyName "Domain" -NotePropertyValue $this.SourceDomain
            }
            
            return $profiles
        }
        catch {
            $this.WriteLog("Failed to get source user profiles: $($_.Exception.Message)", "ERROR")
            return @()
        }
    }
    
    hidden [double] CalculateProfileSize([string]$profilePath) {
        try {
            $size = (Get-ChildItem -Path $profilePath -Recurse -ErrorAction SilentlyContinue | 
                    Measure-Object -Property Length -Sum).Sum
            return [math]::Round($size / 1GB, 2)
        }
        catch {
            return 0
        }
    }
    
    hidden [hashtable] AnalyzeProfileComponents([string]$profilePath) {
        $components = @{
            NTUserDat = Test-Path (Join-Path $profilePath "NTUSER.DAT")
            AppDataRoaming = Test-Path (Join-Path $profilePath "AppData\Roaming")
            AppDataLocal = Test-Path (Join-Path $profilePath "AppData\Local")
            Desktop = Test-Path (Join-Path $profilePath "Desktop")
            Documents = Test-Path (Join-Path $profilePath "Documents")
            Downloads = Test-Path (Join-Path $profilePath "Downloads")
            Pictures = Test-Path (Join-Path $profilePath "Pictures")
            Videos = Test-Path (Join-Path $profilePath "Videos")
            Music = Test-Path (Join-Path $profilePath "Music")
            Favorites = Test-Path (Join-Path $profilePath "Favorites")
            Links = Test-Path (Join-Path $profilePath "Links")
            PrinterData = Test-Path (Join-Path $profilePath "AppData\Roaming\Microsoft\Windows\Printer Shortcuts")
            NetworkDrives = Test-Path (Join-Path $profilePath "AppData\Roaming\Microsoft\Windows\Network Shortcuts")
        }
        
        return $components
    }
    
    hidden [hashtable] CheckRegistryHive([string]$sid) {
        try {
            $hivePath = "HKEY_USERS\$sid"
            $hiveLoaded = Test-Path "Registry::$hivePath"
            
            return @{
                SID = $sid
                IsLoaded = $hiveLoaded
                HivePath = $hivePath
                HasSettings = $hiveLoaded
                Size = if ($hiveLoaded) { $this.GetRegistryHiveSize($sid) } else { 0 }
            }
        }
        catch {
            return @{
                SID = $sid
                IsLoaded = $false
                HivePath = ""
                HasSettings = $false
                Size = 0
            }
        }
    }
    
    hidden [long] GetRegistryHiveSize([string]$sid) {
        try {
            # Estimate hive size by counting keys and values
            $keyCount = (Get-ChildItem "Registry::HKEY_USERS\$sid" -Recurse -ErrorAction SilentlyContinue).Count
            return $keyCount * 512  # Rough estimate in bytes
        }
        catch {
            return 0
        }
    }
    
    hidden [hashtable] AnalyzeProfilePermissions([string]$profilePath) {
        try {
            $acl = Get-Acl -Path $profilePath
            
            $permissions = @{
                Owner = $acl.Owner
                AccessRules = @()
                HasInheritance = $acl.AreAccessRulesProtected -eq $false
                RequiresReACL = $false
            }
            
            foreach ($rule in $acl.Access) {
                $permissions.AccessRules += @{
                    IdentityReference = $rule.IdentityReference.Value
                    FileSystemRights = $rule.FileSystemRights
                    AccessControlType = $rule.AccessControlType
                    IsInherited = $rule.IsInherited
                }
                
                # Check if re-ACLing is required
                if ($rule.IdentityReference.Value -match $this.SourceDomain) {
                    $permissions.RequiresReACL = $true
                }
            }
            
            return $permissions
        }
        catch {
            $this.WriteLog("Failed to analyze permissions for $profilePath`: $($_.Exception.Message)", "WARNING")
            return @{
                Owner = "Unknown"
                AccessRules = @()
                HasInheritance = $false
                RequiresReACL = $true
            }
        }
    }
    
    hidden [array] FindProfileDependencies([object]$profile) {
        $dependencies = @()
        
        try {
            $profilePath = $profile.LocalPath
            
            # Check for mapped drives
            $networkShortcuts = Join-Path $profilePath "AppData\Roaming\Microsoft\Windows\Network Shortcuts"
            if (Test-Path $networkShortcuts) {
                $shortcuts = Get-ChildItem $networkShortcuts -Filter "*.lnk" -ErrorAction SilentlyContinue
                foreach ($shortcut in $shortcuts) {
                    $dependencies += @{
                        Type = "NetworkDrive"
                        Name = $shortcut.BaseName
                        Path = $shortcut.FullName
                        RequiresMapping = $true
                    }
                }
            }
            
            # Check for printer connections
            $printerShortcuts = Join-Path $profilePath "AppData\Roaming\Microsoft\Windows\Printer Shortcuts"
            if (Test-Path $printerShortcuts) {
                $shortcuts = Get-ChildItem $printerShortcuts -Filter "*.lnk" -ErrorAction SilentlyContinue
                foreach ($shortcut in $shortcuts) {
                    $dependencies += @{
                        Type = "Printer"
                        Name = $shortcut.BaseName
                        Path = $shortcut.FullName
                        RequiresMapping = $true
                    }
                }
            }
            
            # Check for certificates in user store
            $certStore = "Cert:\Users\$($profile.SID)"
            if (Test-Path $certStore -ErrorAction SilentlyContinue) {
                $dependencies += @{
                    Type = "Certificates"
                    Name = "User Certificate Store"
                    Path = $certStore
                    RequiresMapping = $true
                }
            }
            
            return $dependencies
        }
        catch {
            $this.WriteLog("Failed to find dependencies for profile $($profile.LocalPath): $($_.Exception.Message)", "WARNING")
            return @()
        }
    }
    
    hidden [hashtable] ValidateProfileIntegrity([object]$profile) {
        $validation = @{
            IsValid = $true
            Issues = @()
        }
        
        try {
            $profilePath = $profile.LocalPath
            
            # Check if profile path exists
            if (!(Test-Path $profilePath)) {
                $validation.IsValid = $false
                $validation.Issues += "Profile path does not exist"
                return $validation
            }
            
            # Check NTUSER.DAT
            $ntuserPath = Join-Path $profilePath "NTUSER.DAT"
            if (!(Test-Path $ntuserPath)) {
                $validation.Issues += "NTUSER.DAT file missing"
            }
            else {
                # Try to load the hive to test integrity
                try {
                    reg load "HKLM\TempHive" $ntuserPath | Out-Null
                    reg unload "HKLM\TempHive" | Out-Null
                }
                catch {
                    $validation.IsValid = $false
                    $validation.Issues += "NTUSER.DAT file is corrupted"
                }
            }
            
            # Check for essential folders
            $essentialFolders = @("Desktop", "Documents", "AppData")
            foreach ($folder in $essentialFolders) {
                $folderPath = Join-Path $profilePath $folder
                if (!(Test-Path $folderPath)) {
                    $validation.Issues += "Essential folder missing: $folder"
                }
            }
            
            # Check profile size
            $profileSize = $this.CalculateProfileSize($profilePath)
            if ($profileSize -eq 0) {
                $validation.Issues += "Profile appears to be empty"
            }
            
            # Check for profile locks
            if ($profile.Loaded) {
                $validation.Issues += "Profile is currently loaded - migration may fail"
            }
            
            return $validation
        }
        catch {
            $validation.IsValid = $false
            $validation.Issues += "Failed to validate profile: $($_.Exception.Message)"
            return $validation
        }
    }
    
    hidden [bool] IsOrphanedProfile([object]$profile) {
        try {
            $userName = Split-Path $profile.LocalPath -Leaf
            $user = Get-ADUser -Identity $userName -Credential $this.SourceCredential -Server $this.SourceDomain -ErrorAction Stop
            return $false
        }
        catch {
            return $true
        }
    }
    
    hidden [string] AssessProfileMigrationRisk([hashtable]$profileInfo) {
        $riskFactors = 0
        
        # Size risk
        if ($profileInfo.SizeGB -gt 10) { $riskFactors += 2 }
        elseif ($profileInfo.SizeGB -gt 5) { $riskFactors += 1 }
        
        # Corruption risk
        if ($profileInfo.IsCorrupted) { $riskFactors += 3 }
        
        # Orphaned profile risk
        if ($profileInfo.IsOrphaned) { $riskFactors += 2 }
        
        # Components risk
        if (!$profileInfo.Components.NTUserDat) { $riskFactors += 2 }
        
        # Dependencies risk
        if ($profileInfo.Dependencies.Count -gt 5) { $riskFactors += 1 }
        
        # Permissions risk
        if ($profileInfo.Permissions.RequiresReACL) { $riskFactors += 1 }
        
        # Age risk (if not used recently)
        if ($profileInfo.LastUseTime -and $profileInfo.LastUseTime -lt (Get-Date).AddDays(-90)) {
            $riskFactors += 1
        }
        
        if ($riskFactors -ge 4) { return "High" }
        elseif ($riskFactors -ge 2) { return "Medium" }
        else { return "Low" }
    }
    
    [hashtable] CreateSidMappings([array]$sourceProfiles) {
        $this.WriteLog("Creating SID mappings", "INFO")
        
        $mappings = @{
            UserMappings = @{}
            GroupMappings = @{}
            BuiltinMappings = @{}
            CustomMappings = @{}
            UnresolvedSids = @()
        }
        
        foreach ($profile in $sourceProfiles) {
            try {
                # Get source user info
                $sourceSid = $profile.SID
                $sourceUser = Get-ADUser -Identity $profile.UserName -Credential $this.SourceCredential -Server $this.SourceDomain
                
                # Find corresponding target user
                $targetUser = $null
                try {
                    $targetUser = Get-ADUser -Identity $profile.UserName -Credential $this.TargetCredential -Server $this.TargetDomain
                }
                catch {
                    $this.WriteLog("Target user not found for $($profile.UserName)", "WARNING")
                    $mappings.UnresolvedSids += $sourceSid
                    continue
                }
                
                # Create mapping
                $mappings.UserMappings[$sourceSid] = $targetUser.SID.Value
                $this.UserMappings[$profile.UserName] = @{
                    SourceSID = $sourceSid
                    TargetSID = $targetUser.SID.Value
                    SourceDN = $sourceUser.DistinguishedName
                    TargetDN = $targetUser.DistinguishedName
                }
                
                $this.WriteLog("Mapped user $($profile.UserName): $sourceSid -> $($targetUser.SID.Value)", "INFO")
            }
            catch {
                $this.WriteLog("Failed to create mapping for $($profile.UserName): $($_.Exception.Message)", "WARNING")
                $mappings.UnresolvedSids += $profile.SID
            }
        }
        
        # Create group mappings
        $mappings.GroupMappings = $this.CreateGroupSidMappings()
        
        # Add builtin mappings
        $mappings.BuiltinMappings = $this.GetBuiltinSidMappings()
        
        $this.SidMappings = $mappings
        $this.WriteLog("SID mapping completed. User mappings: $($mappings.UserMappings.Count), Group mappings: $($mappings.GroupMappings.Count)", "SUCCESS")
        
        return $mappings
    }
    
    hidden [hashtable] CreateGroupSidMappings() {
        $groupMappings = @{}
        
        try {
            # Get source groups
            $sourceGroups = Get-ADGroup -Filter * -Credential $this.SourceCredential -Server $this.SourceDomain
            
            foreach ($group in $sourceGroups) {
                try {
                    # Find matching group in target domain
                    $targetGroup = Get-ADGroup -Identity $group.SamAccountName -Credential $this.TargetCredential -Server $this.TargetDomain -ErrorAction Stop
                    $groupMappings[$group.SID.Value] = $targetGroup.SID.Value
                    $this.WriteLog("Mapped group $($group.Name): $($group.SID.Value) -> $($targetGroup.SID.Value)", "INFO")
                }
                catch {
                    $this.WriteLog("Target group not found for $($group.Name)", "WARNING")
                }
            }
        }
        catch {
            $this.WriteLog("Failed to create group SID mappings: $($_.Exception.Message)", "WARNING")
        }
        
        return $groupMappings
    }
    
    hidden [hashtable] GetBuiltinSidMappings() {
        # Well-known SIDs that map to the same values across domains
        return @{
            "S-1-1-0" = "S-1-1-0"  # Everyone
            "S-1-5-32-544" = "S-1-5-32-544"  # Administrators
            "S-1-5-32-545" = "S-1-5-32-545"  # Users
            "S-1-5-32-547" = "S-1-5-32-547"  # Power Users
            "S-1-5-11" = "S-1-5-11"  # Authenticated Users
            "S-1-5-18" = "S-1-5-18"  # SYSTEM
            "S-1-5-19" = "S-1-5-19"  # LOCAL SERVICE
            "S-1-5-20" = "S-1-5-20"  # NETWORK SERVICE
        }
    }
    
    [hashtable] CreateMigrationWaves([array]$profilesToMigrate, [hashtable]$waveOptions = @{}) {
        $this.WriteLog("Creating migration waves", "INFO")
        
        $waves = @{
            Waves = @()
            TotalProfiles = $profilesToMigrate.Count
            EstimatedDuration = 0
            Configuration = $waveOptions
        }
        
        # Sort profiles by risk level and size
        $sortedProfiles = $profilesToMigrate | Sort-Object {
            $risk = switch ($_.RiskLevel) {
                "Low" { 1 }
                "Medium" { 2 }
                "High" { 3 }
                default { 2 }
            }
            $risk * 1000 + $_.SizeGB
        }
        
        # Create waves based on batch size
        $batchSize = if ($waveOptions.ContainsKey('BatchSize')) { $waveOptions.BatchSize } else { $this.MigrationConfig.BatchSize }
        $waveNumber = 1
        
        for ($i = 0; $i -lt $sortedProfiles.Count; $i += $batchSize) {
            $waveProfiles = $sortedProfiles[$i..[Math]::Min($i + $batchSize - 1, $sortedProfiles.Count - 1)]
            
            $wave = @{
                WaveNumber = $waveNumber
                Profiles = $waveProfiles
                TotalProfiles = $waveProfiles.Count
                TotalSizeGB = ($waveProfiles | Measure-Object -Property SizeGB -Sum).Sum
                EstimatedDurationMinutes = $this.EstimateWaveDuration($waveProfiles)
                RiskLevel = $this.AssessWaveRisk($waveProfiles)
                Prerequisites = $this.GetWavePrerequisites($waveProfiles)
                Status = "Ready"
            }
            
            $waves.Waves += $wave
            $waves.EstimatedDuration += $wave.EstimatedDurationMinutes
            $waveNumber++
        }
        
        $this.WriteLog("Created $($waves.Waves.Count) migration waves", "SUCCESS")
        return $waves
    }
    
    hidden [int] EstimateWaveDuration([array]$profiles) {
        $baseTimePerGB = 10  # minutes per GB
        $setupTime = 15      # initial setup time per wave
        
        $totalSize = ($profiles | Measure-Object -Property SizeGB -Sum).Sum
        return $setupTime + ($totalSize * $baseTimePerGB)
    }
    
    hidden [string] AssessWaveRisk([array]$profiles) {
        $highRiskCount = ($profiles | Where-Object { $_.RiskLevel -eq "High" }).Count
        $mediumRiskCount = ($profiles | Where-Object { $_.RiskLevel -eq "Medium" }).Count
        
        if ($highRiskCount -gt ($profiles.Count * 0.3)) { return "High" }
        elseif ($highRiskCount -gt 0 -or $mediumRiskCount -gt ($profiles.Count * 0.5)) { return "Medium" }
        else { return "Low" }
    }
    
    hidden [array] GetWavePrerequisites([array]$profiles) {
        $prerequisites = @()
        
        # Check for dependencies
        $hasNetworkDrives = ($profiles | Where-Object { $_.Dependencies | Where-Object { $_.Type -eq "NetworkDrive" } }).Count -gt 0
        if ($hasNetworkDrives) {
            $prerequisites += "Map network drives in target environment"
        }
        
        $hasPrinters = ($profiles | Where-Object { $_.Dependencies | Where-Object { $_.Type -eq "Printer" } }).Count -gt 0
        if ($hasPrinters) {
            $prerequisites += "Configure printer connections in target environment"
        }
        
        $hasCertificates = ($profiles | Where-Object { $_.Dependencies | Where-Object { $_.Type -eq "Certificates" } }).Count -gt 0
        if ($hasCertificates) {
            $prerequisites += "Install required certificates in target environment"
        }
        
        return $prerequisites
    }
    
    [hashtable] ExecuteProfileMigration([array]$migrationWaves, [hashtable]$executionOptions = @{}) {
        $this.WriteLog("Starting user profile migration", "INFO")
        
        $migrationResult = @{
            Status = "Running"
            StartTime = Get-Date
            EndTime = $null
            TotalWaves = $migrationWaves.Waves.Count
            CompletedWaves = 0
            TotalProfiles = $migrationWaves.TotalProfiles
            SuccessfulMigrations = 0
            FailedMigrations = 0
            Errors = @()
            Warnings = @()
            MigratedProfiles = @()
            FailedProfiles = @()
            Performance = @{
                DataTransferredGB = 0
                AverageSpeedMBps = 0
                PeakSpeedMBps = 0
            }
        }
        
        try {
            # Pre-migration validation
            $this.WriteLog("Running pre-migration validation", "INFO")
            $validationResult = $this.RunPreMigrationValidation()
            
            if (!$validationResult.Success) {
                throw "Pre-migration validation failed: $($validationResult.Errors -join ', ')"
            }
            
            # Create backup location
            if ($this.MigrationConfig.CreateBackupBeforeMigration) {
                $this.CreateBackupLocation()
            }
            
            # Execute each wave
            foreach ($wave in $migrationWaves.Waves) {
                $this.WriteLog("Starting wave $($wave.WaveNumber) of $($migrationWaves.Waves.Count)", "PROGRESS")
                
                # Check prerequisites
                if ($wave.Prerequisites.Count -gt 0) {
                    $this.WriteLog("Wave $($wave.WaveNumber) has prerequisites: $($wave.Prerequisites -join ', ')", "WARNING")
                }
                
                $waveResult = $this.ExecuteWave($wave, $executionOptions)
                
                $migrationResult.SuccessfulMigrations += $waveResult.SuccessfulMigrations
                $migrationResult.FailedMigrations += $waveResult.FailedMigrations
                $migrationResult.Errors += $waveResult.Errors
                $migrationResult.Warnings += $waveResult.Warnings
                $migrationResult.MigratedProfiles += $waveResult.MigratedProfiles
                $migrationResult.FailedProfiles += $waveResult.FailedProfiles
                $migrationResult.Performance.DataTransferredGB += $waveResult.DataTransferredGB
                
                $migrationResult.CompletedWaves++
                
                $this.WriteLog("Completed wave $($wave.WaveNumber). Success: $($waveResult.SuccessfulMigrations), Failed: $($waveResult.FailedMigrations)", "SUCCESS")
                
                # Pause between waves if configured
                if ($wave.WaveNumber -lt $migrationWaves.Waves.Count -and $this.MigrationConfig.WaveDelay -gt 0) {
                    $this.WriteLog("Pausing for $($this.MigrationConfig.WaveDelay) seconds before next wave", "INFO")
                    Start-Sleep -Seconds $this.MigrationConfig.WaveDelay
                }
            }
            
            $migrationResult.Status = "Completed"
            $migrationResult.EndTime = Get-Date
            
            # Calculate performance metrics
            $duration = $migrationResult.EndTime - $migrationResult.StartTime
            if ($duration.TotalMinutes -gt 0) {
                $migrationResult.Performance.AverageSpeedMBps = ($migrationResult.Performance.DataTransferredGB * 1024) / $duration.TotalMinutes
            }
            
            $this.WriteLog("Profile migration completed. Success: $($migrationResult.SuccessfulMigrations), Failed: $($migrationResult.FailedMigrations)", "SUCCESS")
        }
        catch {
            $migrationResult.Status = "Failed"
            $migrationResult.EndTime = Get-Date
            $migrationResult.Errors += $_.Exception.Message
            $this.WriteLog("Profile migration failed: $($_.Exception.Message)", "ERROR")
        }
        
        return $migrationResult
    }
    
    hidden [hashtable] ExecuteWave([hashtable]$wave, [hashtable]$options) {
        $waveResult = @{
            WaveNumber = $wave.WaveNumber
            SuccessfulMigrations = 0
            FailedMigrations = 0
            DataTransferredGB = 0
            Errors = @()
            Warnings = @()
            MigratedProfiles = @()
            FailedProfiles = @()
        }
        
        foreach ($profile in $wave.Profiles) {
            try {
                $this.WriteLog("Migrating profile: $($profile.UserName)", "PROGRESS")
                
                # Create backup if configured
                if ($this.MigrationConfig.BackupExistingProfiles) {
                    $this.CreateProfileBackup($profile)
                }
                
                # Execute profile migration
                $profileResult = $this.MigrateUserProfile($profile)
                
                if ($profileResult.Success) {
                    $waveResult.SuccessfulMigrations++
                    $waveResult.DataTransferredGB += $profile.SizeGB
                    $waveResult.MigratedProfiles += @{
                        UserName = $profile.UserName
                        SourcePath = $profile.ProfilePath
                        TargetPath = $profileResult.TargetPath
                        SizeGB = $profile.SizeGB
                        MigrationTime = $profileResult.Duration
                    }
                    
                    $this.WriteLog("Successfully migrated profile: $($profile.UserName)", "SUCCESS")
                }
                else {
                    throw $profileResult.Error
                }
            }
            catch {
                $waveResult.FailedMigrations++
                $waveResult.FailedProfiles += $profile.UserName
                $waveResult.Errors += "Failed to migrate $($profile.UserName): $($_.Exception.Message)"
                $this.WriteLog("Failed to migrate profile $($profile.UserName): $($_.Exception.Message)", "ERROR")
                
                if (!$this.MigrationConfig.ContinueOnError) {
                    break
                }
            }
        }
        
        return $waveResult
    }
    
    hidden [hashtable] MigrateUserProfile([hashtable]$profile) {
        $result = @{
            Success = $false
            TargetPath = ""
            Duration = [TimeSpan]::Zero
            Error = ""
            ComponentResults = @{}
        }
        
        $startTime = Get-Date
        
        try {
            # Determine target profile path
            $targetProfilePath = $this.GetTargetProfilePath($profile.UserName)
            $result.TargetPath = $targetProfilePath
            
            # Create target profile directory
            if (!(Test-Path $targetProfilePath)) {
                New-Item -ItemType Directory -Path $targetProfilePath -Force | Out-Null
            }
            
            # Migrate profile components based on configuration
            if ($this.MigrationConfig.MigrateUserFolders) {
                $result.ComponentResults.UserFolders = $this.MigrateUserFolders($profile, $targetProfilePath)
            }
            
            if ($this.MigrationConfig.MigrateNTUserDat) {
                $result.ComponentResults.NTUserDat = $this.MigrateNTUserDat($profile, $targetProfilePath)
            }
            
            if ($this.MigrationConfig.MigrateApplicationData) {
                $result.ComponentResults.AppData = $this.MigrateApplicationData($profile, $targetProfilePath)
            }
            
            # Perform re-ACLing if enabled
            if ($this.MigrationConfig.EnableReACLing) {
                $result.ComponentResults.ReACL = $this.PerformReACLing($profile, $targetProfilePath)
            }
            
            # Update registry hives
            if ($this.MigrationConfig.UpdateRegistryHives) {
                $result.ComponentResults.RegistryUpdate = $this.UpdateRegistryHives($profile, $targetProfilePath)
            }
            
            # Migrate group memberships if enabled
            if ($this.MigrationConfig.MigrateGroupMemberships) {
                $result.ComponentResults.GroupMemberships = $this.MigrateGroupMemberships($profile)
            }
            
            # Set final permissions
            $this.SetTargetProfilePermissions($profile, $targetProfilePath)
            
            $result.Success = $true
        }
        catch {
            $result.Error = $_.Exception.Message
        }
        
        $result.Duration = (Get-Date) - $startTime
        return $result
    }
    
    hidden [string] GetTargetProfilePath([string]$userName) {
        return Join-Path $this.MigrationConfig.TargetProfilePath $userName
    }
    
    hidden [hashtable] MigrateUserFolders([hashtable]$profile, [string]$targetPath) {
        $result = @{ Success = $true; Errors = @() }
        
        try {
            $sourcePath = $profile.ProfilePath
            $userFolders = @("Desktop", "Documents", "Downloads", "Pictures", "Videos", "Music", "Favorites", "Links")
            
            foreach ($folder in $userFolders) {
                $sourceFolderPath = Join-Path $sourcePath $folder
                $targetFolderPath = Join-Path $targetPath $folder
                
                if (Test-Path $sourceFolderPath) {
                    try {
                        # Copy folder with robocopy for better performance
                        $robocopyArgs = @(
                            "`"$sourceFolderPath`"",
                            "`"$targetFolderPath`"",
                            "/MIR",  # Mirror directory tree
                            "/COPY:DATSOU",  # Copy data, attributes, timestamps, security, owner, auditing
                            "/R:3",  # Retry 3 times
                            "/W:5",  # Wait 5 seconds between retries
                            "/MT:8"  # Multi-threaded with 8 threads
                        )
                        
                        if ($this.MigrationConfig.ExcludeTempFiles) {
                            $robocopyArgs += "/XD", "Temp", "tmp"
                            $robocopyArgs += "/XF", "*.tmp", "*.temp", "thumbs.db", "desktop.ini"
                        }
                        
                        $robocopyProcess = Start-Process -FilePath "robocopy" -ArgumentList $robocopyArgs -Wait -NoNewWindow -PassThru
                        
                        # Robocopy exit codes 0-7 are success
                        if ($robocopyProcess.ExitCode -gt 7) {
                            $result.Errors += "Failed to copy folder $folder (robocopy exit code: $($robocopyProcess.ExitCode))"
                        }
                    }
                    catch {
                        $result.Errors += "Failed to copy folder $folder`: $($_.Exception.Message)"
                    }
                }
            }
            
            if ($result.Errors.Count -gt 0) {
                $result.Success = $false
            }
        }
        catch {
            $result.Success = $false
            $result.Errors += "User folder migration failed: $($_.Exception.Message)"
        }
        
        return $result
    }
    
    hidden [hashtable] MigrateNTUserDat([hashtable]$profile, [string]$targetPath) {
        $result = @{ Success = $true; Errors = @() }
        
        try {
            $sourceNTUser = Join-Path $profile.ProfilePath "NTUSER.DAT"
            $targetNTUser = Join-Path $targetPath "NTUSER.DAT"
            
            if (Test-Path $sourceNTUser) {
                # Copy NTUSER.DAT
                Copy-Item -Path $sourceNTUser -Destination $targetNTUser -Force
                
                # Copy related files
                $relatedFiles = @("NTUSER.DAT.LOG1", "NTUSER.DAT.LOG2", "ntuser.ini")
                foreach ($file in $relatedFiles) {
                    $sourceFile = Join-Path $profile.ProfilePath $file
                    if (Test-Path $sourceFile) {
                        $targetFile = Join-Path $targetPath $file
                        Copy-Item -Path $sourceFile -Destination $targetFile -Force -ErrorAction SilentlyContinue
                    }
                }
                
                # Update SIDs in registry hive if SID translation is enabled
                if ($this.MigrationConfig.PerformSidTranslation) {
                    $this.TranslateSidsInHive($targetNTUser, $profile.UserName)
                }
            }
            else {
                $result.Errors += "NTUSER.DAT not found in source profile"
            }
        }
        catch {
            $result.Success = $false
            $result.Errors += "NTUSER.DAT migration failed: $($_.Exception.Message)"
        }
        
        return $result
    }
    
    hidden [hashtable] MigrateApplicationData([hashtable]$profile, [string]$targetPath) {
        $result = @{ Success = $true; Errors = @() }
        
        try {
            $sourceAppData = Join-Path $profile.ProfilePath "AppData"
            $targetAppData = Join-Path $targetPath "AppData"
            
            if (Test-Path $sourceAppData) {
                # Copy AppData with selective exclusions
                $robocopyArgs = @(
                    "`"$sourceAppData`"",
                    "`"$targetAppData`"",
                    "/MIR",
                    "/COPY:DATSOU",
                    "/R:3",
                    "/W:5",
                    "/MT:4"
                )
                
                # Exclude problematic folders
                $excludeDirs = @("Temp", "LocalLow\Temp", "Local\Microsoft\Windows\INetCache", "Local\Microsoft\Windows\WebCache")
                if ($this.MigrationConfig.ExcludeInternetCache) {
                    $excludeDirs += "Local\Microsoft\Internet Explorer"
                    $excludeDirs += "Local\Google\Chrome\User Data\Default\Cache"
                    $excludeDirs += "Local\Mozilla\Firefox\Profiles\*\cache2"
                }
                
                if ($excludeDirs.Count -gt 0) {
                    $robocopyArgs += "/XD"
                    $robocopyArgs += $excludeDirs
                }
                
                $robocopyProcess = Start-Process -FilePath "robocopy" -ArgumentList $robocopyArgs -Wait -NoNewWindow -PassThru
                
                if ($robocopyProcess.ExitCode -gt 7) {
                    $result.Errors += "Failed to copy AppData (robocopy exit code: $($robocopyProcess.ExitCode))"
                }
            }
        }
        catch {
            $result.Success = $false
            $result.Errors += "AppData migration failed: $($_.Exception.Message)"
        }
        
        return $result
    }
    
    hidden [hashtable] PerformReACLing([hashtable]$profile, [string]$targetPath) {
        $result = @{ Success = $true; Errors = @() }
        
        try {
            if (!$this.UserMappings.ContainsKey($profile.UserName)) {
                $result.Errors += "No SID mapping found for user $($profile.UserName)"
                $result.Success = $false
                return $result
            }
            
            $userMapping = $this.UserMappings[$profile.UserName]
            $targetSid = $userMapping.TargetSID
            
            # Update permissions recursively
            $this.UpdateFolderPermissions($targetPath, $targetSid, $profile.UserName)
            
            # Update registry permissions if hive is loaded
            if ($this.MigrationConfig.UpdateRegistryHives) {
                $this.UpdateRegistryPermissions($targetSid, $profile.UserName)
            }
        }
        catch {
            $result.Success = $false
            $result.Errors += "Re-ACLing failed: $($_.Exception.Message)"
        }
        
        return $result
    }
    
    hidden [void] UpdateFolderPermissions([string]$path, [string]$targetSid, [string]$userName) {
        try {
            # Get current ACL
            $acl = Get-Acl -Path $path
            
            # Remove old domain references
            $newAccessRules = @()
            foreach ($rule in $acl.Access) {
                $identity = $rule.IdentityReference.Value
                
                # Translate SIDs if they're from source domain
                if ($identity.StartsWith($this.SourceDomain)) {
                    $newIdentity = $identity -replace $this.SourceDomain, $this.TargetDomain
                    $newRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
                        $newIdentity,
                        $rule.FileSystemRights,
                        $rule.InheritanceFlags,
                        $rule.PropagationFlags,
                        $rule.AccessControlType
                    )
                    $newAccessRules += $newRule
                }
                elseif ($this.SidMappings.UserMappings.ContainsKey($identity)) {
                    # Translate known SIDs
                    $newSid = $this.SidMappings.UserMappings[$identity]
                    $newRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
                        $newSid,
                        $rule.FileSystemRights,
                        $rule.InheritanceFlags,
                        $rule.PropagationFlags,
                        $rule.AccessControlType
                    )
                    $newAccessRules += $newRule
                }
                else {
                    # Keep existing rule if no translation needed
                    $newAccessRules += $rule
                }
            }
            
            # Apply new ACL
            $newAcl = New-Object System.Security.AccessControl.DirectorySecurity
            foreach ($rule in $newAccessRules) {
                $newAcl.SetAccessRule($rule)
            }
            
            # Set owner to target user
            $targetUser = New-Object System.Security.Principal.SecurityIdentifier($targetSid)
            $newAcl.SetOwner($targetUser)
            
            Set-Acl -Path $path -AclObject $newAcl
            
            # Recursively update subdirectories and files
            if ($this.MigrationConfig.EnableReACLing) {
                Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object {
                    try {
                        $this.UpdateFolderPermissions($_.FullName, $targetSid, $userName)
                    }
                    catch {
                        $this.WriteLog("Failed to update permissions for $($_.FullName): $($_.Exception.Message)", "WARNING")
                    }
                }
            }
        }
        catch {
            $this.WriteLog("Failed to update folder permissions for $path`: $($_.Exception.Message)", "WARNING")
        }
    }
    
    hidden [void] TranslateSidsInHive([string]$hivePath, [string]$userName) {
        try {
            $tempHiveName = "TempHive_$userName"
            
            # Load the hive
            $regLoadResult = reg load "HKLM\$tempHiveName" $hivePath 2>&1
            if ($LASTEXITCODE -ne 0) {
                throw "Failed to load registry hive: $regLoadResult"
            }
            
            try {
                # Translate SIDs in the loaded hive
                $this.TranslateRegistrySids("HKLM\$tempHiveName")
            }
            finally {
                # Always unload the hive
                reg unload "HKLM\$tempHiveName" | Out-Null
            }
        }
        catch {
            $this.WriteLog("Failed to translate SIDs in hive for $userName`: $($_.Exception.Message)", "WARNING")
        }
    }
    
    hidden [void] TranslateRegistrySids([string]$registryPath) {
        try {
            # Get all subkeys and values recursively
            $keys = Get-ChildItem -Path "Registry::$registryPath" -Recurse -ErrorAction SilentlyContinue
            
            foreach ($key in $keys) {
                try {
                    # Check values in this key for SIDs that need translation
                    $values = Get-ItemProperty -Path $key.PSPath -ErrorAction SilentlyContinue
                    
                    foreach ($property in $values.PSObject.Properties) {
                        if ($property.Value -is [string] -and $this.SidMappings.UserMappings.ContainsKey($property.Value)) {
                            # Replace the SID value
                            $newSid = $this.SidMappings.UserMappings[$property.Value]
                            Set-ItemProperty -Path $key.PSPath -Name $property.Name -Value $newSid -ErrorAction SilentlyContinue
                        }
                    }
                }
                catch {
                    # Continue processing other keys if one fails
                    continue
                }
            }
        }
        catch {
            $this.WriteLog("Failed to translate registry SIDs: $($_.Exception.Message)", "WARNING")
        }
    }
    
    hidden [hashtable] UpdateRegistryHives([hashtable]$profile, [string]$targetPath) {
        $result = @{ Success = $true; Errors = @() }
        
        try {
            # Update file associations and shell folder paths
            $this.UpdateShellFolderPaths($profile, $targetPath)
            
            # Update user preferences that might contain domain references
            $this.UpdateUserPreferences($profile, $targetPath)
        }
        catch {
            $result.Success = $false
            $result.Errors += "Registry hive update failed: $($_.Exception.Message)"
        }
        
        return $result
    }
    
    hidden [void] UpdateShellFolderPaths([hashtable]$profile, [string]$targetPath) {
        # This would update registry entries for shell folders like Desktop, Documents, etc.
        # Implementation would load the NTUSER.DAT and update path references
        $this.WriteLog("Updating shell folder paths for $($profile.UserName)", "INFO")
    }
    
    hidden [void] UpdateUserPreferences([hashtable]$profile, [string]$targetPath) {
        # This would update user-specific preferences that might contain domain or path references
        $this.WriteLog("Updating user preferences for $($profile.UserName)", "INFO")
    }
    
    hidden [hashtable] MigrateGroupMemberships([hashtable]$profile) {
        $result = @{ Success = $true; Errors = @() }
        
        try {
            if (!$this.UserMappings.ContainsKey($profile.UserName)) {
                $result.Errors += "No user mapping found for $($profile.UserName)"
                $result.Success = $false
                return $result
            }
            
            # Get source user groups
            $sourceUser = Get-ADUser -Identity $profile.UserName -Properties MemberOf -Credential $this.SourceCredential -Server $this.SourceDomain
            
            # Add user to corresponding groups in target domain
            foreach ($groupDN in $sourceUser.MemberOf) {
                try {
                    $sourceGroup = Get-ADGroup -Identity $groupDN -Credential $this.SourceCredential -Server $this.SourceDomain
                    
                    # Find matching group in target domain
                    $targetGroup = Get-ADGroup -Identity $sourceGroup.SamAccountName -Credential $this.TargetCredential -Server $this.TargetDomain -ErrorAction Stop
                    
                    # Add user to target group
                    Add-ADGroupMember -Identity $targetGroup -Members $profile.UserName -Credential $this.TargetCredential -Server $this.TargetDomain -ErrorAction Stop
                    
                    $this.WriteLog("Added $($profile.UserName) to group $($targetGroup.Name) in target domain", "INFO")
                }
                catch {
                    $result.Errors += "Failed to add user to group $($sourceGroup.Name): $($_.Exception.Message)"
                    $this.WriteLog("Failed to migrate group membership for $($sourceGroup.Name): $($_.Exception.Message)", "WARNING")
                }
            }
        }
        catch {
            $result.Success = $false
            $result.Errors += "Group membership migration failed: $($_.Exception.Message)"
        }
        
        return $result
    }
    
    hidden [void] SetTargetProfilePermissions([hashtable]$profile, [string]$targetPath) {
        try {
            if (!$this.UserMappings.ContainsKey($profile.UserName)) {
                $this.WriteLog("No user mapping found for setting permissions: $($profile.UserName)", "WARNING")
                return
            }
            
            $targetSid = $this.UserMappings[$profile.UserName].TargetSID
            $targetUser = New-Object System.Security.Principal.SecurityIdentifier($targetSid)
            
            # Set proper permissions on the profile folder
            $acl = Get-Acl -Path $targetPath
            
            # Remove existing permissions
            $acl.SetAccessRuleProtection($true, $false)
            
            # Add SYSTEM full control
            $systemSid = New-Object System.Security.Principal.SecurityIdentifier("S-1-5-18")
            $systemRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
                $systemSid,
                "FullControl",
                "ContainerInherit,ObjectInherit",
                "None",
                "Allow"
            )
            $acl.SetAccessRule($systemRule)
            
            # Add Administrators full control
            $adminsSid = New-Object System.Security.Principal.SecurityIdentifier("S-1-5-32-544")
            $adminsRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
                $adminsSid,
                "FullControl",
                "ContainerInherit,ObjectInherit",
                "None",
                "Allow"
            )
            $acl.SetAccessRule($adminsRule)
            
            # Add user full control
            $userRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
                $targetUser,
                "FullControl",
                "ContainerInherit,ObjectInherit",
                "None",
                "Allow"
            )
            $acl.SetAccessRule($userRule)
            
            # Set owner to the user
            $acl.SetOwner($targetUser)
            
            # Apply the ACL
            Set-Acl -Path $targetPath -AclObject $acl
            
            $this.WriteLog("Set target profile permissions for $($profile.UserName)", "INFO")
        }
        catch {
            $this.WriteLog("Failed to set target profile permissions for $($profile.UserName): $($_.Exception.Message)", "WARNING")
        }
    }
    
    hidden [void] CreateBackupLocation() {
        try {
            if (!(Test-Path $this.BackupLocation)) {
                New-Item -ItemType Directory -Path $this.BackupLocation -Force | Out-Null
                $this.WriteLog("Created backup location: $($this.BackupLocation)", "INFO")
            }
        }
        catch {
            $this.WriteLog("Failed to create backup location: $($_.Exception.Message)", "WARNING")
        }
    }
    
    hidden [void] CreateProfileBackup([hashtable]$profile) {
        try {
            $backupPath = Join-Path $this.BackupLocation "$($profile.UserName)_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
            
            if (!(Test-Path $backupPath)) {
                New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
            }
            
            # Create a compressed backup of the essential profile components
            $sourceItems = @(
                (Join-Path $profile.ProfilePath "NTUSER.DAT"),
                (Join-Path $profile.ProfilePath "Desktop"),
                (Join-Path $profile.ProfilePath "Documents"),
                (Join-Path $profile.ProfilePath "AppData\Roaming")
            )
            
            foreach ($item in $sourceItems) {
                if (Test-Path $item) {
                    $itemName = Split-Path $item -Leaf
                    $backupItem = Join-Path $backupPath $itemName
                    
                    if (Test-Path $item -PathType Container) {
                        # Copy directory
                        robocopy $item $backupItem /MIR /R:1 /W:1 | Out-Null
                    }
                    else {
                        # Copy file
                        Copy-Item -Path $item -Destination $backupItem -Force
                    }
                }
            }
            
            $this.WriteLog("Created backup for profile: $($profile.UserName) at $backupPath", "INFO")
        }
        catch {
            $this.WriteLog("Failed to create backup for profile $($profile.UserName): $($_.Exception.Message)", "WARNING")
        }
    }
    
    hidden [hashtable] RunPreMigrationValidation() {
        $validation = @{
            Success = $true
            Errors = @()
            Warnings = @()
        }
        
        # Test source domain connectivity
        try {
            Get-ADDomain -Identity $this.SourceDomain -Credential $this.SourceCredential | Out-Null
        }
        catch {
            $validation.Success = $false
            $validation.Errors += "Cannot connect to source domain: $($_.Exception.Message)"
        }
        
        # Test target domain connectivity
        try {
            Get-ADDomain -Identity $this.TargetDomain -Credential $this.TargetCredential | Out-Null
        }
        catch {
            $validation.Success = $false
            $validation.Errors += "Cannot connect to target domain: $($_.Exception.Message)"
        }
        
        # Test profile path accessibility
        try {
            if (!(Test-Path $this.MigrationConfig.SourceProfilePath)) {
                $validation.Errors += "Source profile path not accessible: $($this.MigrationConfig.SourceProfilePath)"
                $validation.Success = $false
            }
            
            if (!(Test-Path $this.MigrationConfig.TargetProfilePath)) {
                $validation.Warnings += "Target profile path does not exist, will be created: $($this.MigrationConfig.TargetProfilePath)"
            }
        }
        catch {
            $validation.Errors += "Failed to validate profile paths: $($_.Exception.Message)"
            $validation.Success = $false
        }
        
        # Test backup location
        if ($this.MigrationConfig.CreateBackupBeforeMigration) {
            try {
                $testFile = Join-Path $this.BackupLocation "test.txt"
                "test" | Out-File -FilePath $testFile -Force
                Remove-Item -Path $testFile -Force
            }
            catch {
                $validation.Warnings += "Backup location may not be writable: $($this.BackupLocation)"
            }
        }
        
        # Validate SID mappings
        if ($this.SidMappings.UserMappings.Count -eq 0) {
            $validation.Warnings += "No SID mappings configured - run CreateSidMappings first"
        }
        
        return $validation
    }
    
    hidden [array] GenerateProfileMigrationRecommendations([hashtable]$analysisResult) {
        $recommendations = @()
        
        if ($analysisResult.LargeProfiles.Count -gt 0) {
            $recommendations += "Consider optimizing large profiles before migration or increase batch delay"
        }
        
        if ($analysisResult.CorruptedProfiles.Count -gt 0) {
            $recommendations += "Fix corrupted profiles before migration or exclude them"
        }
        
        if ($analysisResult.OrphanedProfiles.Count -gt 0) {
            $recommendations += "Review orphaned profiles - consider cleanup before migration"
        }
        
        if ($analysisResult.TotalSizeGB -gt 1000) {
            $recommendations += "Large migration detected (>1TB) - consider multiple migration windows"
        }
        
        $highRiskProfiles = ($analysisResult.RiskAssessment.High).Count
        if ($highRiskProfiles -gt ($analysisResult.TotalProfiles * 0.2)) {
            $recommendations += "High percentage of risky profiles - review migration strategy"
        }
        
        if ($analysisResult.Dependencies.Count -gt 0) {
            $recommendations += "Profile dependencies detected - ensure target environment has necessary resources"
        }
        
        return $recommendations
    }
    
    [hashtable] GenerateMigrationReport([hashtable]$migrationResult) {
        $report = @{
            Summary = @{
                MigrationDate = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                MigrationType = $this.MigrationConfig.MigrationType
                SourceDomain = $this.SourceDomain
                TargetDomain = $this.TargetDomain
                TotalProfiles = $migrationResult.TotalProfiles
                SuccessfulMigrations = $migrationResult.SuccessfulMigrations
                FailedMigrations = $migrationResult.FailedMigrations
                SuccessRate = if ($migrationResult.TotalProfiles -gt 0) { 
                    [math]::Round(($migrationResult.SuccessfulMigrations / $migrationResult.TotalProfiles) * 100, 2) 
                } else { 0 }
                Duration = if ($migrationResult.EndTime) { 
                    $migrationResult.EndTime - $migrationResult.StartTime 
                } else { $null }
                DataTransferredGB = $migrationResult.Performance.DataTransferredGB
                AverageSpeedMBps = $migrationResult.Performance.AverageSpeedMBps
            }
            Details = @{
                MigratedProfiles = $migrationResult.MigratedProfiles
                FailedProfiles = $migrationResult.FailedProfiles
                Errors = $migrationResult.Errors
                Warnings = $migrationResult.Warnings
            }
            Configuration = $this.MigrationConfig
            SidMappings = $this.SidMappings
            LogPath = $this.LogPath
            BackupLocation = $this.BackupLocation
        }
        
        return $report
    }
    
    [void] ExportMigrationData([string]$filePath, [hashtable]$data) {
        try {
            $jsonData = $data | ConvertTo-Json -Depth 15
            Set-Content -Path $filePath -Value $jsonData -Encoding UTF8
            $this.WriteLog("Migration data exported to: $filePath", "SUCCESS")
        }
        catch {
            $this.WriteLog("Failed to export migration data: $($_.Exception.Message)", "ERROR")
            throw
        }
    }
    
    [hashtable] GetMigrationStatus() {
        return $this.MigrationStatus
    }
    
    [void] SetMigrationConfiguration([hashtable]$config) {
        foreach ($key in $config.Keys) {
            if ($this.MigrationConfig.ContainsKey($key)) {
                $this.MigrationConfig[$key] = $config[$key]
                $this.WriteLog("Updated configuration: $key = $($config[$key])", "INFO")
            }
        }
    }
}

function New-UserProfileMigration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$SourceDomain,
        
        [Parameter(Mandatory = $true)]
        [string]$TargetDomain
    )
    
    return [UserProfileMigration]::new($SourceDomain, $TargetDomain)
}

# Helper functions for GUI integration
function Start-ProfileMigrationWave {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [object]$ProfileMigration,
        
        [Parameter(Mandatory = $true)]
        [hashtable]$Wave,
        
        [Parameter()]
        [hashtable]$Options = @{}
    )
    
    return $ProfileMigration.ExecuteWave($Wave, $Options)
}

function Get-ProfileMigrationMetrics {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [object]$ProfileMigration
    )
    
    return $ProfileMigration.GetMigrationStatus()
}

function Test-ProfileMigrationReadiness {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [object]$ProfileMigration
    )
    
    return $ProfileMigration.RunPreMigrationValidation()
}

Export-ModuleMember -Function New-UserProfileMigration, Start-ProfileMigrationWave, Get-ProfileMigrationMetrics, Test-ProfileMigrationReadiness