#Requires -Version 5.1
using namespace System.Collections.Generic

Set-StrictMode -Version 3.0

class UserMigration {
    [string]$SourceDomain
    [string]$TargetDomain
    [object]$SourceCredential
    [object]$TargetCredential
    [hashtable]$SecurityGroupMappings
    [hashtable]$MigrationConfig
    [array]$MigrationQueue
    [hashtable]$MigrationStatus
    [string]$LogPath
    
    UserMigration([string]$sourceDomain, [string]$targetDomain) {
        $this.SourceDomain = $sourceDomain
        $this.TargetDomain = $targetDomain
        $this.SecurityGroupMappings = @{}
        $this.MigrationConfig = @{
            CreateOUStructure = $true
            MigratePasswords = $false
            EnableUsers = $true
            PreserveUserPrincipalName = $false
            CreateSecurityGroups = $true
            MapBuiltinGroups = $true
            ValidatePermissions = $true
            RollbackOnError = $true
            BatchSize = 50
            RetryAttempts = 3
        }
        $this.MigrationQueue = @()
        $this.MigrationStatus = @{}
        $this.LogPath = ".\Logs\UserMigration_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
        $this.InitializeLogging()
    }
    
    hidden [void] InitializeLogging() {
        $logDir = Split-Path $this.LogPath -Parent
        if (!(Test-Path $logDir)) {
            New-Item -ItemType Directory -Path $logDir -Force | Out-Null
        }
        
        $this.WriteLog("UserMigration module initialized", "INFO")
        $this.WriteLog("Source Domain: $($this.SourceDomain)", "INFO")
        $this.WriteLog("Target Domain: $($this.TargetDomain)", "INFO")
    }
    
    hidden [void] WriteLog([string]$message, [string]$level = "INFO") {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $logEntry = "[$timestamp] [$level] $message"
        Add-Content -Path $this.LogPath -Value $logEntry
        
        switch ($level) {
            "ERROR" { Write-Host $logEntry -ForegroundColor Red }
            "WARNING" { Write-Host $logEntry -ForegroundColor Yellow }
            "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
            default { Write-Host $logEntry -ForegroundColor White }
        }
    }
    
    [void] SetCredentials([pscredential]$sourceCredential, [pscredential]$targetCredential) {
        $this.SourceCredential = $sourceCredential
        $this.TargetCredential = $targetCredential
        $this.WriteLog("Credentials configured for both domains", "INFO")
    }
    
    [hashtable] AnalyzeSourceUsers([array]$organizationalUnits = @()) {
        $this.WriteLog("Starting source user analysis", "INFO")
        
        $analysisResult = @{
            Users = @()
            SecurityGroups = @()
            OrganizationalUnits = @()
            TotalUsers = 0
            EnabledUsers = 0
            DisabledUsers = 0
            ServiceAccounts = 0
            AdminAccounts = 0
            GroupMemberships = @{}
            Recommendations = @()
        }
        
        try {
            # Connect to source domain
            $this.WriteLog("Connecting to source domain: $($this.SourceDomain)", "INFO")
            
            # Get all users
            $searchBase = if ($organizationalUnits.Count -gt 0) { $organizationalUnits } else { $null }
            $users = $this.GetSourceUsers($searchBase)
            
            foreach ($user in $users) {
                $userInfo = @{
                    SamAccountName = $user.SamAccountName
                    UserPrincipalName = $user.UserPrincipalName
                    DisplayName = $user.DisplayName
                    GivenName = $user.GivenName
                    Surname = $user.Surname
                    EmailAddress = $user.EmailAddress
                    DistinguishedName = $user.DistinguishedName
                    Enabled = $user.Enabled
                    PasswordLastSet = $user.PasswordLastSet
                    LastLogonDate = $user.LastLogonDate
                    MemberOf = $user.MemberOf
                    Department = $user.Department
                    Title = $user.Title
                    Manager = $user.Manager
                    Description = $user.Description
                    EmployeeID = $user.EmployeeID
                    UserType = $this.ClassifyUser($user)
                    MigrationReady = $true
                    MigrationIssues = @()
                }
                
                # Validate user for migration
                $issues = $this.ValidateUserForMigration($user)
                if ($issues.Count -gt 0) {
                    $userInfo.MigrationReady = $false
                    $userInfo.MigrationIssues = $issues
                }
                
                $analysisResult.Users += $userInfo
                
                # Track group memberships
                foreach ($group in $user.MemberOf) {
                    $groupName = ($group -split ',')[0] -replace 'CN=', ''
                    if (!$analysisResult.GroupMemberships.ContainsKey($groupName)) {
                        $analysisResult.GroupMemberships[$groupName] = @()
                    }
                    $analysisResult.GroupMemberships[$groupName] += $user.SamAccountName
                }
            }
            
            $analysisResult.TotalUsers = $users.Count
            $analysisResult.EnabledUsers = ($users | Where-Object { $_.Enabled }).Count
            $analysisResult.DisabledUsers = ($users | Where-Object { !$_.Enabled }).Count
            $analysisResult.ServiceAccounts = ($analysisResult.Users | Where-Object { $_.UserType -eq 'Service' }).Count
            $analysisResult.AdminAccounts = ($analysisResult.Users | Where-Object { $_.UserType -eq 'Admin' }).Count
            
            # Get security groups
            $analysisResult.SecurityGroups = $this.GetSourceSecurityGroups()
            
            # Get organizational units
            $analysisResult.OrganizationalUnits = $this.GetSourceOUs()
            
            # Generate recommendations
            $analysisResult.Recommendations = $this.GenerateMigrationRecommendations($analysisResult)
            
            $this.WriteLog("Source analysis completed. Total users: $($analysisResult.TotalUsers)", "SUCCESS")
            return $analysisResult
        }
        catch {
            $this.WriteLog("Failed to analyze source users: $($_.Exception.Message)", "ERROR")
            throw
        }
    }
    
    hidden [array] GetSourceUsers([array]$searchBases) {
        $allUsers = @()
        
        if ($searchBases -and $searchBases.Count -gt 0) {
            foreach ($searchBase in $searchBases) {
                $users = Get-ADUser -Filter * -SearchBase $searchBase -Properties * -Credential $this.SourceCredential -Server $this.SourceDomain
                $allUsers += $users
            }
        }
        else {
            $allUsers = Get-ADUser -Filter * -Properties * -Credential $this.SourceCredential -Server $this.SourceDomain
        }
        
        return $allUsers
    }
    
    hidden [array] GetSourceSecurityGroups() {
        try {
            $groups = Get-ADGroup -Filter {GroupCategory -eq "Security"} -Properties * -Credential $this.SourceCredential -Server $this.SourceDomain
            
            $groupInfo = @()
            foreach ($group in $groups) {
                $groupInfo += @{
                    Name = $group.Name
                    SamAccountName = $group.SamAccountName
                    DistinguishedName = $group.DistinguishedName
                    GroupScope = $group.GroupScope
                    Description = $group.Description
                    MemberCount = (Get-ADGroupMember -Identity $group -Credential $this.SourceCredential -Server $this.SourceDomain).Count
                    Members = (Get-ADGroupMember -Identity $group -Credential $this.SourceCredential -Server $this.SourceDomain).SamAccountName
                    IsBuiltIn = $group.DistinguishedName -like "*,CN=Builtin,*" -or $group.DistinguishedName -like "*,CN=Users,*"
                }
            }
            
            return $groupInfo
        }
        catch {
            $this.WriteLog("Failed to get source security groups: $($_.Exception.Message)", "WARNING")
            return @()
        }
    }
    
    hidden [array] GetSourceOUs() {
        try {
            $ous = Get-ADOrganizationalUnit -Filter * -Properties * -Credential $this.SourceCredential -Server $this.SourceDomain
            
            $ouInfo = @()
            foreach ($ou in $ous) {
                $ouInfo += @{
                    Name = $ou.Name
                    DistinguishedName = $ou.DistinguishedName
                    Description = $ou.Description
                    UserCount = (Get-ADUser -Filter * -SearchBase $ou.DistinguishedName -Credential $this.SourceCredential -Server $this.SourceDomain).Count
                    ComputerCount = (Get-ADComputer -Filter * -SearchBase $ou.DistinguishedName -Credential $this.SourceCredential -Server $this.SourceDomain).Count
                }
            }
            
            return $ouInfo
        }
        catch {
            $this.WriteLog("Failed to get source OUs: $($_.Exception.Message)", "WARNING")
            return @()
        }
    }
    
    hidden [string] ClassifyUser([object]$user) {
        # Service account detection
        if ($user.SamAccountName -match '^(svc|service|srv)' -or 
            $user.Description -match 'service|application|system' -or
            $user.UserPrincipalName -match 'service|svc|app') {
            return 'Service'
        }
        
        # Admin account detection
        if ($user.SamAccountName -match 'admin|adm' -or 
            $user.MemberOf -match 'Admin|Domain Admins|Enterprise Admins|Schema Admins') {
            return 'Admin'
        }
        
        # Disabled account
        if (!$user.Enabled) {
            return 'Disabled'
        }
        
        # Test account
        if ($user.SamAccountName -match '^(test|tmp|temp)' -or 
            $user.Description -match 'test|temporary|temp') {
            return 'Test'
        }
        
        return 'Standard'
    }
    
    hidden [array] ValidateUserForMigration([object]$user) {
        $issues = @()
        
        # Check for duplicate SamAccountName in target
        if ($this.CheckUserExistsInTarget($user.SamAccountName)) {
            $issues += "User already exists in target domain"
        }
        
        # Check for valid email address
        if ($user.EmailAddress -and $user.EmailAddress -notmatch '^[^@]+@[^@]+\.[^@]+$') {
            $issues += "Invalid email address format"
        }
        
        # Check for special characters in username
        if ($user.SamAccountName -match '[^a-zA-Z0-9\-_\.]') {
            $issues += "Username contains special characters that may cause issues"
        }
        
        # Check password age
        if ($user.PasswordLastSet -and $user.PasswordLastSet -lt (Get-Date).AddDays(-365)) {
            $issues += "Password is over 1 year old"
        }
        
        # Check for long inactivity
        if ($user.LastLogonDate -and $user.LastLogonDate -lt (Get-Date).AddDays(-180)) {
            $issues += "User has not logged in for over 180 days"
        }
        
        return $issues
    }
    
    hidden [bool] CheckUserExistsInTarget([string]$samAccountName) {
        try {
            $user = Get-ADUser -Identity $samAccountName -Credential $this.TargetCredential -Server $this.TargetDomain -ErrorAction Stop
            return $true
        }
        catch {
            return $false
        }
    }
    
    [hashtable] CreateSecurityGroupMappings([array]$sourceGroups, [array]$targetGroups) {
        $this.WriteLog("Creating security group mappings", "INFO")
        
        $mappings = @{
            AutoMapped = @{}
            RequiresDecision = @{}
            NewGroups = @{}
            Conflicts = @{}
        }
        
        foreach ($sourceGroup in $sourceGroups) {
            $targetMatch = $targetGroups | Where-Object { $_.Name -eq $sourceGroup.Name -or $_.SamAccountName -eq $sourceGroup.SamAccountName }
            
            if ($targetMatch) {
                if ($targetMatch.Count -eq 1) {
                    $mappings.AutoMapped[$sourceGroup.Name] = $targetMatch[0].Name
                    $this.WriteLog("Auto-mapped group: $($sourceGroup.Name) -> $($targetMatch[0].Name)", "INFO")
                }
                else {
                    $mappings.Conflicts[$sourceGroup.Name] = $targetMatch.Name
                    $this.WriteLog("Conflict detected for group: $($sourceGroup.Name) - multiple matches", "WARNING")
                }
            }
            else {
                # Check for similar names
                $similarGroups = $targetGroups | Where-Object { 
                    $_.Name -like "*$($sourceGroup.Name)*" -or 
                    $sourceGroup.Name -like "*$($_.Name)*" -or
                    $this.CalculateStringSimilarity($_.Name, $sourceGroup.Name) -gt 0.8
                }
                
                if ($similarGroups.Count -gt 0) {
                    $mappings.RequiresDecision[$sourceGroup.Name] = $similarGroups.Name
                    $this.WriteLog("Similar groups found for: $($sourceGroup.Name)", "INFO")
                }
                else {
                    $mappings.NewGroups[$sourceGroup.Name] = @{
                        OriginalGroup = $sourceGroup
                        SuggestedName = $this.GenerateTargetGroupName($sourceGroup.Name)
                        CreateInTarget = $this.MigrationConfig.CreateSecurityGroups
                    }
                    $this.WriteLog("New group required: $($sourceGroup.Name)", "INFO")
                }
            }
        }
        
        $this.SecurityGroupMappings = $mappings
        $this.WriteLog("Group mapping analysis completed", "SUCCESS")
        return $mappings
    }
    
    hidden [double] CalculateStringSimilarity([string]$string1, [string]$string2) {
        if ($string1 -eq $string2) { return 1.0 }
        if ([string]::IsNullOrEmpty($string1) -or [string]::IsNullOrEmpty($string2)) { return 0.0 }
        
        $longer = if ($string1.Length -gt $string2.Length) { $string1 } else { $string2 }
        $shorter = if ($string1.Length -gt $string2.Length) { $string2 } else { $string1 }
        
        if ($longer.Length -eq 0) { return 1.0 }
        
        $editDistance = $this.CalculateLevenshteinDistance($longer, $shorter)
        return ($longer.Length - $editDistance) / $longer.Length
    }
    
    hidden [int] CalculateLevenshteinDistance([string]$string1, [string]$string2) {
        $matrix = New-Object 'int[,]' ($string1.Length + 1), ($string2.Length + 1)
        
        for ($i = 0; $i -le $string1.Length; $i++) {
            $matrix[$i, 0] = $i
        }
        
        for ($j = 0; $j -le $string2.Length; $j++) {
            $matrix[0, $j] = $j
        }
        
        for ($i = 1; $i -le $string1.Length; $i++) {
            for ($j = 1; $j -le $string2.Length; $j++) {
                $cost = if ($string1[$i - 1] -eq $string2[$j - 1]) { 0 } else { 1 }
                $deletion = $matrix[($i - 1), $j] + 1
                $insertion = $matrix[$i, ($j - 1)] + 1
                $substitution = $matrix[($i - 1), ($j - 1)] + $cost
                $matrix[$i, $j] = [Math]::Min([Math]::Min($deletion, $insertion), $substitution)
            }
        }
        
        return $matrix[$string1.Length, $string2.Length]
    }
    
    hidden [string] GenerateTargetGroupName([string]$sourceName) {
        # Apply naming convention transformations
        $targetName = $sourceName
        
        # Remove source domain references
        $targetName = $targetName -replace $this.SourceDomain.Split('.')[0], $this.TargetDomain.Split('.')[0]
        
        # Apply corporate naming standards if configured
        if ($this.MigrationConfig.ContainsKey('GroupNamingPrefix')) {
            $targetName = "$($this.MigrationConfig.GroupNamingPrefix)$targetName"
        }
        
        return $targetName
    }
    
    [void] SetSecurityGroupMapping([string]$sourceGroup, [string]$targetGroup) {
        if (!$this.SecurityGroupMappings.ContainsKey('Manual')) {
            $this.SecurityGroupMappings['Manual'] = @{}
        }
        
        $this.SecurityGroupMappings.Manual[$sourceGroup] = $targetGroup
        $this.WriteLog("Manual group mapping set: $sourceGroup -> $targetGroup", "INFO")
    }
    
    [hashtable] CreateMigrationPlan([array]$usersToMigrate, [hashtable]$migrationOptions = @{}) {
        $this.WriteLog("Creating migration plan", "INFO")
        
        # Merge migration options with defaults
        $options = $this.MigrationConfig.Clone()
        foreach ($key in $migrationOptions.Keys) {
            $options[$key] = $migrationOptions[$key]
        }
        
        $migrationPlan = @{
            TotalUsers = $usersToMigrate.Count
            Batches = @()
            Prerequisites = @()
            EstimatedDuration = 0
            RiskAssessment = @{
                High = @()
                Medium = @()
                Low = @()
            }
            Validations = @()
        }
        
        # Create prerequisites
        if ($options.CreateOUStructure) {
            $migrationPlan.Prerequisites += "Create target OU structure"
        }
        
        if ($options.CreateSecurityGroups) {
            $migrationPlan.Prerequisites += "Create missing security groups in target domain"
        }
        
        # Create batches
        $batchSize = $options.BatchSize
        $batches = @()
        
        for ($i = 0; $i -lt $usersToMigrate.Count; $i += $batchSize) {
            $batchUsers = $usersToMigrate[$i..[Math]::Min($i + $batchSize - 1, $usersToMigrate.Count - 1)]
            
            $batch = @{
                BatchNumber = [Math]::Floor($i / $batchSize) + 1
                Users = $batchUsers
                EstimatedTime = $batchUsers.Count * 2 # 2 minutes per user estimate
                Dependencies = @()
                RiskLevel = $this.AssessBatchRisk($batchUsers)
            }
            
            $batches += $batch
        }
        
        $migrationPlan.Batches = $batches
        $migrationPlan.EstimatedDuration = ($batches | Measure-Object -Property EstimatedTime -Sum).Sum
        
        # Risk assessment
        foreach ($user in $usersToMigrate) {
            $riskLevel = $this.AssessUserMigrationRisk($user)
            $migrationPlan.RiskAssessment[$riskLevel] += $user.SamAccountName
        }
        
        # Pre-migration validations
        $migrationPlan.Validations = @(
            "Verify source domain connectivity",
            "Verify target domain connectivity", 
            "Validate security group mappings",
            "Check target domain capacity",
            "Verify replication health",
            "Backup current state"
        )
        
        $this.WriteLog("Migration plan created with $($migrationPlan.Batches.Count) batches", "SUCCESS")
        return $migrationPlan
    }
    
    hidden [string] AssessBatchRisk([array]$users) {
        $adminUsers = ($users | Where-Object { $_.UserType -eq 'Admin' }).Count
        $serviceUsers = ($users | Where-Object { $_.UserType -eq 'Service' }).Count
        $issueUsers = ($users | Where-Object { !$_.MigrationReady }).Count
        
        if ($adminUsers -gt 0 -or $serviceUsers -gt ($users.Count * 0.1) -or $issueUsers -gt ($users.Count * 0.2)) {
            return "High"
        }
        elseif ($serviceUsers -gt 0 -or $issueUsers -gt 0) {
            return "Medium"
        }
        else {
            return "Low"
        }
    }
    
    hidden [string] AssessUserMigrationRisk([object]$user) {
        if ($user.UserType -eq 'Admin' -or $user.UserType -eq 'Service') {
            return "High"
        }
        
        if (!$user.MigrationReady -or $user.MigrationIssues.Count -gt 2) {
            return "Medium"
        }
        
        return "Low"
    }
    
    [hashtable] ExecuteMigration([array]$usersToMigrate, [hashtable]$options = @{}) {
        $this.WriteLog("Starting user migration", "INFO")
        
        $migrationResult = @{
            Status = "Running"
            StartTime = Get-Date
            EndTime = $null
            TotalUsers = $usersToMigrate.Count
            SuccessfulMigrations = 0
            FailedMigrations = 0
            Errors = @()
            MigratedUsers = @()
            FailedUsers = @()
        }
        
        try {
            # Pre-migration validation
            $this.WriteLog("Running pre-migration validation", "INFO")
            $validationResult = $this.RunPreMigrationValidation()
            
            if (!$validationResult.Success) {
                throw "Pre-migration validation failed: $($validationResult.Errors -join ', ')"
            }
            
            # Create migration batches
            $migrationPlan = $this.CreateMigrationPlan($usersToMigrate, $options)
            
            foreach ($batch in $migrationPlan.Batches) {
                $this.WriteLog("Processing batch $($batch.BatchNumber) of $($migrationPlan.Batches.Count)", "INFO")
                
                foreach ($user in $batch.Users) {
                    try {
                        $this.WriteLog("Migrating user: $($user.SamAccountName)", "INFO")
                        
                        # Create user in target domain
                        $targetUser = $this.CreateTargetUser($user)
                        
                        # Migrate group memberships
                        $this.MigrateUserGroupMemberships($user, $targetUser)
                        
                        # Set additional properties
                        $this.SetTargetUserProperties($user, $targetUser)
                        
                        $migrationResult.SuccessfulMigrations++
                        $migrationResult.MigratedUsers += @{
                            SourceUser = $user.SamAccountName
                            TargetUser = $targetUser.SamAccountName
                            MigrationTime = Get-Date
                        }
                        
                        $this.WriteLog("Successfully migrated user: $($user.SamAccountName)", "SUCCESS")
                    }
                    catch {
                        $migrationResult.FailedMigrations++
                        $migrationResult.FailedUsers += $user.SamAccountName
                        $migrationResult.Errors += "Failed to migrate $($user.SamAccountName): $($_.Exception.Message)"
                        $this.WriteLog("Failed to migrate user $($user.SamAccountName): $($_.Exception.Message)", "ERROR")
                        
                        if ($options.RollbackOnError) {
                            $this.WriteLog("Rolling back migration due to error", "WARNING")
                            # Implement rollback logic here
                            break
                        }
                    }
                }
                
                # Pause between batches if configured
                if ($options.ContainsKey('BatchDelay') -and $options.BatchDelay -gt 0) {
                    Start-Sleep -Seconds $options.BatchDelay
                }
            }
            
            $migrationResult.Status = "Completed"
            $migrationResult.EndTime = Get-Date
            
            $this.WriteLog("Migration completed. Success: $($migrationResult.SuccessfulMigrations), Failed: $($migrationResult.FailedMigrations)", "SUCCESS")
        }
        catch {
            $migrationResult.Status = "Failed"
            $migrationResult.EndTime = Get-Date
            $migrationResult.Errors += $_.Exception.Message
            $this.WriteLog("Migration failed: $($_.Exception.Message)", "ERROR")
        }
        
        return $migrationResult
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
        
        # Validate security group mappings
        if ($this.SecurityGroupMappings.Conflicts.Count -gt 0) {
            $validation.Warnings += "Unresolved security group conflicts: $($this.SecurityGroupMappings.Conflicts.Keys -join ', ')"
        }
        
        return $validation
    }
    
    hidden [object] CreateTargetUser([object]$sourceUser) {
        $userParams = @{
            Name = $sourceUser.DisplayName
            SamAccountName = $sourceUser.SamAccountName
            UserPrincipalName = if ($this.MigrationConfig.PreserveUserPrincipalName) { 
                $sourceUser.UserPrincipalName 
            } else { 
                "$($sourceUser.SamAccountName)@$($this.TargetDomain)" 
            }
            DisplayName = $sourceUser.DisplayName
            GivenName = $sourceUser.GivenName
            Surname = $sourceUser.Surname
            EmailAddress = $sourceUser.EmailAddress
            Description = $sourceUser.Description
            Department = $sourceUser.Department
            Title = $sourceUser.Title
            Enabled = $this.MigrationConfig.EnableUsers
            ChangePasswordAtLogon = $true
            Server = $this.TargetDomain
            Credential = $this.TargetCredential
        }
        
        # Set path if OU structure is preserved
        if ($this.MigrationConfig.CreateOUStructure) {
            $targetPath = $this.ConvertSourcePathToTarget($sourceUser.DistinguishedName)
            $userParams.Path = $targetPath
        }
        
        return New-ADUser @userParams -PassThru
    }
    
    hidden [void] MigrateUserGroupMemberships([object]$sourceUser, [object]$targetUser) {
        foreach ($groupDN in $sourceUser.MemberOf) {
            $sourceGroupName = ($groupDN -split ',')[0] -replace 'CN=', ''
            
            # Find mapped target group
            $targetGroupName = $null
            
            # Check all mapping categories
            foreach ($mappingCategory in @('AutoMapped', 'Manual')) {
                if ($this.SecurityGroupMappings.ContainsKey($mappingCategory) -and 
                    $this.SecurityGroupMappings[$mappingCategory].ContainsKey($sourceGroupName)) {
                    $targetGroupName = $this.SecurityGroupMappings[$mappingCategory][$sourceGroupName]
                    break
                }
            }
            
            if ($targetGroupName) {
                try {
                    Add-ADGroupMember -Identity $targetGroupName -Members $targetUser.SamAccountName -Credential $this.TargetCredential -Server $this.TargetDomain
                    $this.WriteLog("Added user $($targetUser.SamAccountName) to group $targetGroupName", "INFO")
                }
                catch {
                    $this.WriteLog("Failed to add user to group $targetGroupName`: $($_.Exception.Message)", "WARNING")
                }
            }
            else {
                $this.WriteLog("No mapping found for group: $sourceGroupName", "WARNING")
            }
        }
    }
    
    hidden [void] SetTargetUserProperties([object]$sourceUser, [object]$targetUser) {
        $propertiesToUpdate = @{}
        
        # Set manager if exists and mapped
        if ($sourceUser.Manager) {
            $managerSam = $this.GetSamAccountNameFromDN($sourceUser.Manager)
            if ($this.CheckUserExistsInTarget($managerSam)) {
                $propertiesToUpdate.Manager = $managerSam
            }
        }
        
        # Set employee ID if exists
        if ($sourceUser.EmployeeID) {
            $propertiesToUpdate.EmployeeID = $sourceUser.EmployeeID
        }
        
        if ($propertiesToUpdate.Count -gt 0) {
            try {
                Set-ADUser -Identity $targetUser.SamAccountName @propertiesToUpdate -Credential $this.TargetCredential -Server $this.TargetDomain
            }
            catch {
                $this.WriteLog("Failed to set additional properties for user $($targetUser.SamAccountName): $($_.Exception.Message)", "WARNING")
            }
        }
    }
    
    hidden [string] GetSamAccountNameFromDN([string]$distinguishedName) {
        if ($distinguishedName -match 'CN=([^,]+)') {
            return $matches[1]
        }
        return ""
    }
    
    hidden [string] ConvertSourcePathToTarget([string]$sourceDN) {
        # Convert source DN to target domain equivalent
        $sourceDomainDN = (Get-ADDomain -Identity $this.SourceDomain -Credential $this.SourceCredential).DistinguishedName
        $targetDomainDN = (Get-ADDomain -Identity $this.TargetDomain -Credential $this.TargetCredential).DistinguishedName
        
        return $sourceDN -replace [regex]::Escape($sourceDomainDN), $targetDomainDN
    }
    
    hidden [array] GenerateMigrationRecommendations([hashtable]$analysisResult) {
        $recommendations = @()
        
        if ($analysisResult.ServiceAccounts -gt 0) {
            $recommendations += "Review service accounts before migration - consider creating managed service accounts in target domain"
        }
        
        if ($analysisResult.AdminAccounts -gt 0) {
            $recommendations += "Migrate administrative accounts separately and verify permissions after migration"
        }
        
        if ($analysisResult.DisabledUsers -gt ($analysisResult.TotalUsers * 0.1)) {
            $recommendations += "Consider excluding disabled users from migration or clean them up first"
        }
        
        $inactiveUsers = ($analysisResult.Users | Where-Object { 
            $_.LastLogonDate -and $_.LastLogonDate -lt (Get-Date).AddDays(-180) 
        }).Count
        
        if ($inactiveUsers -gt 0) {
            $recommendations += "Review $inactiveUsers inactive users (>180 days) - consider excluding from migration"
        }
        
        if ($analysisResult.GroupMemberships.Count -gt 100) {
            $recommendations += "Large number of security groups detected - ensure proper group mapping strategy"
        }
        
        return $recommendations
    }
    
    [hashtable] GenerateMigrationReport([hashtable]$migrationResult) {
        $report = @{
            Summary = @{
                MigrationDate = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                SourceDomain = $this.SourceDomain
                TargetDomain = $this.TargetDomain
                TotalUsers = $migrationResult.TotalUsers
                SuccessfulMigrations = $migrationResult.SuccessfulMigrations
                FailedMigrations = $migrationResult.FailedMigrations
                SuccessRate = if ($migrationResult.TotalUsers -gt 0) { 
                    [math]::Round(($migrationResult.SuccessfulMigrations / $migrationResult.TotalUsers) * 100, 2) 
                } else { 0 }
                Duration = if ($migrationResult.EndTime) { 
                    $migrationResult.EndTime - $migrationResult.StartTime 
                } else { $null }
            }
            Details = @{
                MigratedUsers = $migrationResult.MigratedUsers
                FailedUsers = $migrationResult.FailedUsers
                Errors = $migrationResult.Errors
            }
            SecurityGroupMappings = $this.SecurityGroupMappings
            LogPath = $this.LogPath
        }
        
        return $report
    }
    
    [void] ExportMigrationData([string]$filePath, [hashtable]$data) {
        try {
            $jsonData = $data | ConvertTo-Json -Depth 10
            Set-Content -Path $filePath -Value $jsonData -Encoding UTF8
            $this.WriteLog("Migration data exported to: $filePath", "SUCCESS")
        }
        catch {
            $this.WriteLog("Failed to export migration data: $($_.Exception.Message)", "ERROR")
            throw
        }
    }
}

function New-UserMigration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$SourceDomain,
        
        [Parameter(Mandatory = $true)]
        [string]$TargetDomain
    )
    
    return [UserMigration]::new($SourceDomain, $TargetDomain)
}

Export-ModuleMember -Function New-UserMigration