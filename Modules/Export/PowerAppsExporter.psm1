#Requires -Version 5.1
#Requires -Modules EnhancedLogging, FileOperations

<#
.SYNOPSIS
    Exports processed M&A discovery data into JSON formats optimized for PowerApps consumption.
.DESCRIPTION
    Enhanced version that exports comprehensive data structures to support the full PowerApp design
    including companies, users, waves, departments, applications, groups, devices, and relationships.
.NOTES
    Version: 2.0.0 - Enhanced for comprehensive PowerApp support
    Author: M&A Discovery Suite
    Date: 2025-06-02
#>

function Export-ForPowerApps {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$ProcessedData,

        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration
    )

    try {
        Write-MandALog "Starting Enhanced PowerApps Export Process" -Level "HEADER"

        # Determine paths
        $baseOutputPath = $Configuration.environment.outputPath
        if (-not [System.IO.Path]::IsPathRooted($baseOutputPath)) {
            # Use company-specific path from global context
            if ($global:MandA.Paths.CompanyProfileRoot) {
                $baseOutputPath = $global:MandA.Paths.CompanyProfileRoot
            }
        }
        
        $powerAppsOutputPath = Join-Path -Path $baseOutputPath -ChildPath "Processed\PowerApps"
        $jsonDepth = if ($Configuration.export.powerAppsJsonDepth) { $Configuration.export.powerAppsJsonDepth } else { 3 }

        # Ensure output directory exists
        if (-not (Test-Path -Path $powerAppsOutputPath -PathType Container)) {
            New-Item -Path $powerAppsOutputPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
            Write-MandALog "Created PowerApps export directory: $powerAppsOutputPath" -Level "SUCCESS"
        }

        # Initialize metadata
        $exportTimestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
        $metadata = @{
            ExportTimestamp = $exportTimestamp
            SuiteVersion = $Configuration.metadata.version
            ProjectName = $Configuration.metadata.projectName
            CompanyName = $Configuration.metadata.companyName
            DataCounts = @{}
        }

        # Helper function to safely export JSON
        function Export-JsonFile {
            param(
                [string]$FilePath,
                [object]$Data,
                [int]$Depth = 3
            )
            try {
                $Data | ConvertTo-Json -Depth $Depth -Compress:$false | Set-Content -Path $FilePath -Encoding UTF8
                Write-MandALog "Exported: $(Split-Path $FilePath -Leaf)" -Level "SUCCESS"
                return $true
            } catch {
                Write-MandALog "Failed to export $(Split-Path $FilePath -Leaf): $($_.Exception.Message)" -Level "ERROR"
                return $false
            }
        }

        # 1. Export Companies Data
        Write-MandALog "Processing Companies data..." -Level "INFO"
        $companiesData = @()
        
        # Get company info from configuration and file system
        $profilesBasePath = if ($global:MandA.Paths.ProfilesBasePath) { 
            $global:MandA.Paths.ProfilesBasePath 
        } else { 
            Join-Path (Split-Path $baseOutputPath -Parent) "Profiles" 
        }
        
        if (Test-Path $profilesBasePath) {
            $companyDirs = Get-ChildItem -Path $profilesBasePath -Directory
            foreach ($dir in $companyDirs) {
                # Try to get stats from existing data
                $companyStats = @{
                    CompanyName = $dir.Name
                    CompanyId = $dir.Name.ToLower() -replace '[^a-z0-9]', ''
                    ProfilePath = $dir.FullName
                    TotalUsers = 0
                    TotalWaves = 0
                    TotalDepartments = 0
                    AverageComplexity = 0
                    ReadinessPercentage = 0
                    LastUpdated = $dir.LastWriteTime.ToString("yyyy-MM-ddTHH:mm:ssZ")
                }
                
                # If this is the current company, use live data
                if ($dir.Name -eq $Configuration.metadata.companyName -and $ProcessedData.UserProfiles) {
                    $companyStats.TotalUsers = $ProcessedData.UserProfiles.Count
                    $companyStats.TotalWaves = if ($ProcessedData.MigrationWaves) { $ProcessedData.MigrationWaves.Count } else { 0 }
                    $companyStats.TotalDepartments = ($ProcessedData.UserProfiles | Where-Object { $_.Department } | Select-Object -ExpandProperty Department -Unique).Count
                    $companyStats.AverageComplexity = [math]::Round(($ProcessedData.UserProfiles | Measure-Object -Property ComplexityScore -Average).Average, 2)
                    $readyUsers = ($ProcessedData.UserProfiles | Where-Object { $_.ReadinessStatus -eq "Ready" }).Count
                    $companyStats.ReadinessPercentage = if ($companyStats.TotalUsers -gt 0) { 
                        [math]::Round(($readyUsers / $companyStats.TotalUsers) * 100, 1) 
                    } else { 0 }
                }
                
                $companiesData += $companyStats
            }
        } else {
            # Fallback to current company only
            $companiesData += @{
                CompanyName = $Configuration.metadata.companyName
                CompanyId = $Configuration.metadata.companyName.ToLower() -replace '[^a-z0-9]', ''
                TotalUsers = if ($ProcessedData.UserProfiles) { $ProcessedData.UserProfiles.Count } else { 0 }
                TotalWaves = if ($ProcessedData.MigrationWaves) { $ProcessedData.MigrationWaves.Count } else { 0 }
                TotalDepartments = 0
                AverageComplexity = 0
                ReadinessPercentage = 0
                LastUpdated = $exportTimestamp
            }
        }
        
        $companiesPath = Join-Path $powerAppsOutputPath "powerapps_companies.json"
        Export-JsonFile -FilePath $companiesPath -Data $companiesData -Depth $jsonDepth
        $metadata.DataCounts.Companies = $companiesData.Count

        # 2. Export Enhanced User Profiles
        Write-MandALog "Processing User Profiles..." -Level "INFO"
        $powerAppsUsers = @()
        
        if ($ProcessedData.UserProfiles -and $ProcessedData.UserProfiles.Count -gt 0) {
            foreach ($userProfile in $ProcessedData.UserProfiles) {
                # Create comprehensive user object for PowerApp
                $paUser = [PSCustomObject]@{
                    # Core Identity
                    Id = if ($userProfile.GraphId) { $userProfile.GraphId } else { $userProfile.UserPrincipalName }
                    UPN = $userProfile.UserPrincipalName
                    DisplayName = $userProfile.DisplayName
                    FirstName = $userProfile.GivenName
                    LastName = $userProfile.Surname
                    Email = $userProfile.Mail
                    SamAccountName = $userProfile.SamAccountName
                    
                    # Organization
                    Department = $userProfile.Department
                    JobTitle = $userProfile.Title
                    Company = $userProfile.Company
                    Office = $userProfile.Office
                    Manager = $userProfile.Manager
                    DirectReportsCount = $userProfile.DirectReportsCount
                    
                    # Account Status
                    AccountEnabled = $userProfile.Enabled
                    LastLogonDate = if ($userProfile.LastLogon) { 
                        try { Get-Date $userProfile.LastLogon -Format "yyyy-MM-ddTHH:mm:ssZ" } catch { $null }
                    } else { $null }
                    AccountCreatedDate = if ($userProfile.AccountCreated) {
                        try { Get-Date $userProfile.AccountCreated -Format "yyyy-MM-ddTHH:mm:ssZ" } catch { $null }
                    } else { $null }
                    DaysSinceLastLogon = if ($userProfile.LastLogon) {
                        try { (New-TimeSpan -Start ([datetime]$userProfile.LastLogon) -End (Get-Date)).Days } catch { $null }
                    } else { $null }
                    
                    # Service Presence
                    HasADAccount = $userProfile.HasADAccount
                    HasAzureADAccount = $userProfile.HasGraphAccount
                    HasExchangeMailbox = $userProfile.HasExchangeMailbox
                    MailboxType = $userProfile.MailboxType
                    
                    # Licensing
                    Licenses = if ($userProfile.AssignedLicenses -is [array]) { 
                        $userProfile.AssignedLicenses 
                    } elseif ($userProfile.AssignedLicenses -is [string]) { 
                        $userProfile.AssignedLicenses -split ';' | Where-Object { $_ }
                    } else { @() }
                    LicenseCount = $userProfile.LicenseCount
                    
                    # Email & Storage
                    MailboxSizeMB = $userProfile.MailboxSizeMB
                    MailboxSizeGB = if ($userProfile.MailboxSizeMB) { 
                        [math]::Round($userProfile.MailboxSizeMB / 1024, 2) 
                    } else { 0 }
                    MailboxSizeCategory = switch ($userProfile.MailboxSizeMB) {
                        { $_ -eq 0 } { "No Mailbox" }
                        { $_ -lt 1024 } { "Small (<1GB)" }
                        { $_ -lt 5120 } { "Medium (1-5GB)" }
                        { $_ -lt 10240 } { "Large (5-10GB)" }
                        { $_ -lt 20480 } { "Very Large (10-20GB)" }
                        default { "Huge (>20GB)" }
                    }
                    
                    # Migration Planning
                    ComplexityScore = $userProfile.ComplexityScore
                    ComplexityFactors = $userProfile.ComplexityFactors
                    MigrationCategory = $userProfile.MigrationCategory
                    MigrationWave = $userProfile.MigrationWave
                    MigrationPriority = $userProfile.MigrationPriority
                    EstimatedMigrationTimeMinutes = $userProfile.EstimatedMigrationTime
                    
                    # Readiness Assessment
                    ReadinessScore = $userProfile.ReadinessScore
                    ReadinessStatus = $userProfile.ReadinessStatus
                    ReadinessCategory = switch ($userProfile.ReadinessScore) {
                        { $_ -ge 90 } { "Ready" }
                        { $_ -ge 70 } { "Nearly Ready" }
                        { $_ -ge 50 } { "Needs Work" }
                        default { "Not Ready" }
                    }
                    BlockingIssues = $userProfile.BlockingIssues
                    RiskFactors = $userProfile.RiskFactors
                    RiskLevel = $userProfile.RiskLevel
                    
                    # Dependencies & Relationships
                    GroupMembershipCount = $userProfile.GroupMembershipCount
                    GroupMemberships = if ($userProfile.GroupMembershipsText) { 
                        $userProfile.GroupMembershipsText -split ';' | Where-Object { $_ } | ForEach-Object { $_.Trim() }
                    } else { @() }
                    
                    ApplicationAccessCount = $userProfile.ApplicationAccessCount
                    ApplicationAccess = if ($userProfile.ApplicationAssignmentsText) {
                        $userProfile.ApplicationAssignmentsText -split ';' | Where-Object { $_ } | ForEach-Object { $_.Trim() }
                    } else { @() }
                    
                    OwnedObjectsCount = $userProfile.OwnedObjectsCount
                    OwnedApplications = if ($userProfile.OwnedApplicationsText) {
                        $userProfile.OwnedApplicationsText -split ';' | Where-Object { $_ } | ForEach-Object { $_.Trim() }
                    } else { @() }
                    OwnedGroups = if ($userProfile.OwnedGroupsText) {
                        $userProfile.OwnedGroupsText -split ';' | Where-Object { $_ } | ForEach-Object { $_.Trim() }
                    } else { @() }
                    
                    RegisteredDevices = if ($userProfile.RegisteredDevicesText) {
                        $userProfile.RegisteredDevicesText -split ';' | Where-Object { $_ } | ForEach-Object { $_.Trim() }
                    } else { @() }
                    DeviceCount = if ($userProfile.RegisteredDevicesText) {
                        ($userProfile.RegisteredDevicesText -split ';' | Where-Object { $_ }).Count
                    } else { 0 }
                    
                    # Search Tags (for PowerApp filtering)
                    SearchTags = @(
                        $userProfile.UserPrincipalName,
                        $userProfile.DisplayName,
                        $userProfile.Department,
                        $userProfile.Title,
                        $userProfile.MigrationCategory,
                        $userProfile.ReadinessStatus
                    ) | Where-Object { $_ } | ForEach-Object { $_.ToLower() }
                    
                    # Metadata
                    Notes = $userProfile.Notes
                    LastUpdated = $exportTimestamp
                }
                
                $powerAppsUsers += $paUser
            }
        }
        
        $usersPath = Join-Path $powerAppsOutputPath "powerapps_users.json"
        Export-JsonFile -FilePath $usersPath -Data $powerAppsUsers -Depth $jsonDepth
        $metadata.DataCounts.Users = $powerAppsUsers.Count

        # 3. Export Enhanced Migration Waves
        Write-MandALog "Processing Migration Waves..." -Level "INFO"
        $powerAppsWaves = @()
        
        if ($ProcessedData.MigrationWaves -and $ProcessedData.MigrationWaves.Count -gt 0) {
            $waveOrder = 1
            foreach ($wave in $ProcessedData.MigrationWaves) {
                # Get users in this wave
                $waveUserUPNs = @()
                if ($wave.UserPrincipalNames) {
                    $waveUserUPNs = $wave.UserPrincipalNames -split ';' | Where-Object { $_ } | ForEach-Object { $_.Trim() }
                } elseif ($wave.UserProfilesInWave) {
                    $waveUserUPNs = $wave.UserProfilesInWave | ForEach-Object { $_.UserPrincipalName }
                }
                
                # Get wave statistics
                $waveUsers = $powerAppsUsers | Where-Object { $_.UPN -in $waveUserUPNs }
                $complexityDistribution = $waveUsers | Group-Object -Property MigrationCategory | ForEach-Object {
                    @{ Category = $_.Name; Count = $_.Count }
                }
                
                $readinessDistribution = $waveUsers | Group-Object -Property ReadinessStatus | ForEach-Object {
                    @{ Status = $_.Name; Count = $_.Count }
                }
                
                $departmentList = ($waveUsers | Where-Object { $_.Department } | Select-Object -ExpandProperty Department -Unique) -join ', '
                
                $paWave = [PSCustomObject]@{
                    WaveId = $wave.WaveID
                    WaveName = $wave.WaveName
                    WaveOrder = $waveOrder++
                    WaveType = if ($wave.Criteria -match "Department") { "Department-Based" } else { "Complexity-Based" }
                    
                    # User Information
                    TotalUsers = $wave.TotalUsers
                    UserUPNs = $waveUserUPNs
                    UserIds = $waveUsers | ForEach-Object { $_.Id }
                    
                    # Statistics
                    AverageComplexity = [math]::Round($wave.AverageComplexity, 2)
                    ComplexityDistribution = $complexityDistribution
                    ReadinessDistribution = $readinessDistribution
                    AverageReadinessScore = if ($waveUsers.Count -gt 0) {
                        [math]::Round(($waveUsers | Measure-Object -Property ReadinessScore -Average).Average, 1)
                    } else { 0 }
                    
                    # Organization
                    Departments = $departmentList
                    DepartmentCount = ($departmentList -split ',' | Where-Object { $_ }).Count
                    
                    # Planning
                    EstimatedTimeHours = if ($waveUsers.Count -gt 0) {
                        [math]::Round(($waveUsers | Measure-Object -Property EstimatedMigrationTimeMinutes -Sum).Sum / 60, 1)
                    } else { 0 }
                    
                    # Risk Assessment
                    HighRiskUserCount = ($waveUsers | Where-Object { $_.RiskLevel -eq "High" }).Count
                    BlockedUserCount = ($waveUsers | Where-Object { $_.BlockingIssues.Count -gt 0 }).Count
                    
                    # Metadata
                    Criteria = $wave.Criteria
                    Status = "Planned" # Default status
                    PlannedStartDate = $null
                    PlannedEndDate = $null
                    ActualStartDate = $null
                    ActualEndDate = $null
                    CompletionPercentage = 0
                    Notes = ""
                    LastUpdated = $exportTimestamp
                }
                
                $powerAppsWaves += $paWave
            }
        }
        
        $wavesPath = Join-Path $powerAppsOutputPath "powerapps_waves.json"
        Export-JsonFile -FilePath $wavesPath -Data $powerAppsWaves -Depth $jsonDepth
        $metadata.DataCounts.Waves = $powerAppsWaves.Count

        # 4. Export Enhanced Department Data
        Write-MandALog "Processing Departments..." -Level "INFO"
        $powerAppsDepartments = @()
        
        if ($powerAppsUsers.Count -gt 0) {
            $departments = $powerAppsUsers | Where-Object { -not [string]::IsNullOrWhiteSpace($_.Department) } | Group-Object Department
            
            foreach ($deptGroup in $departments) {
                $deptUsers = $deptGroup.Group
                
                # Calculate department statistics
                $complexityDist = $deptUsers | Group-Object -Property MigrationCategory | ForEach-Object {
                    @{ Category = $_.Name; Count = $_.Count; Percentage = [math]::Round(($_.Count / $deptUsers.Count) * 100, 1) }
                }
                
                $readinessDist = $deptUsers | Group-Object -Property ReadinessStatus | ForEach-Object {
                    @{ Status = $_.Name; Count = $_.Count; Percentage = [math]::Round(($_.Count / $deptUsers.Count) * 100, 1) }
                }
                
                # Get top applications for department
                $allApps = $deptUsers | ForEach-Object { $_.ApplicationAccess } | Where-Object { $_ }
                $topApps = $allApps | Group-Object | Sort-Object Count -Descending | Select-Object -First 5 | ForEach-Object {
                    @{ AppName = $_.Name; UserCount = $_.Count }
                }
                
                # Get wave distribution
                $waveDist = $deptUsers | Where-Object { $_.MigrationWave } | Group-Object -Property MigrationWave | ForEach-Object {
                    @{ Wave = $_.Name; Count = $_.Count }
                }
                
                $paDepartment = [PSCustomObject]@{
                    DepartmentId = $deptGroup.Name.ToLower() -replace '[^a-z0-9]', ''
                    DepartmentName = $deptGroup.Name
                    
                    # User Counts
                    TotalUsers = $deptUsers.Count
                    EnabledUsers = ($deptUsers | Where-Object { $_.AccountEnabled }).Count
                    DisabledUsers = ($deptUsers | Where-Object { -not $_.AccountEnabled }).Count
                    
                    # User Lists
                    UserUPNs = $deptUsers.UPN
                    UserIds = $deptUsers.Id
                    
                    # Complexity Analysis
                    AverageComplexity = [math]::Round(($deptUsers | Measure-Object -Property ComplexityScore -Average).Average, 2)
                    ComplexityDistribution = $complexityDist
                    
                    # Readiness Analysis
                    AverageReadiness = [math]::Round(($deptUsers | Measure-Object -Property ReadinessScore -Average).Average, 1)
                    ReadinessDistribution = $readinessDist
                    ReadyUserCount = ($deptUsers | Where-Object { $_.ReadinessStatus -eq "Ready" }).Count
                    
                    # Wave Assignment
                    WaveDistribution = $waveDist
                    UnassignedUserCount = ($deptUsers | Where-Object { -not $_.MigrationWave }).Count
                    
                    # Infrastructure
                    TotalMailboxSizeGB = [math]::Round(($deptUsers | Measure-Object -Property MailboxSizeGB -Sum).Sum, 2)
                    AverageMailboxSizeGB = [math]::Round(($deptUsers | Measure-Object -Property MailboxSizeGB -Average).Average, 2)
                    TopApplications = $topApps
                    
                    # Managers in Department
                    ManagerCount = ($deptUsers | Where-Object { $_.DirectReportsCount -gt 0 }).Count
                    
                    # Risk Assessment
                    HighRiskUsers = ($deptUsers | Where-Object { $_.RiskLevel -eq "High" }).Count
                    UsersWithBlockingIssues = ($deptUsers | Where-Object { $_.BlockingIssues.Count -gt 0 }).Count
                    
                    # Metadata
                    LastUpdated = $exportTimestamp
                }
                
                $powerAppsDepartments += $paDepartment
            }
        }
        
        $departmentsPath = Join-Path $powerAppsOutputPath "powerapps_departments.json"
        Export-JsonFile -FilePath $departmentsPath -Data $powerAppsDepartments -Depth $jsonDepth
        $metadata.DataCounts.Departments = $powerAppsDepartments.Count

        # 5. Export Applications Data
        Write-MandALog "Processing Applications..." -Level "INFO"
        $powerAppsApplications = @()
        
        # Get applications from AggregatedDataStore
        $applicationsSource = $null
        if ($ProcessedData.AggregatedDataStore) {
            if ($ProcessedData.AggregatedDataStore.Applications) {
                $applicationsSource = $ProcessedData.AggregatedDataStore.Applications
            } elseif ($ProcessedData.AggregatedDataStore.Graph -and $ProcessedData.AggregatedDataStore.Graph.Applications) {
                $applicationsSource = $ProcessedData.AggregatedDataStore.Graph.Applications
            }
        }
        
        if ($applicationsSource -and $applicationsSource.Count -gt 0) {
            foreach ($app in $applicationsSource) {
                # Count users with access to this app
                $usersWithAccess = $powerAppsUsers | Where-Object { 
                    $_.ApplicationAccess -contains $app.displayName -or 
                    $_.ApplicationAccess -match $app.displayName
                }
                
                $paApp = [PSCustomObject]@{
                    ApplicationId = $app.appId
                    ObjectId = $app.id
                    DisplayName = $app.displayName
                    PublisherDomain = $app.publisherDomain
                    SignInAudience = $app.signInAudience
                    
                    # Usage Statistics
                    UserCount = $usersWithAccess.Count
                    UserUPNs = $usersWithAccess.UPN
                    
                    # App Details (if available)
                    AppRoles = if ($app.appRoles) { 
                        $app.appRoles | ForEach-Object { $_.displayName } 
                    } else { @() }
                    RequiredResourceAccess = if ($app.requiredResourceAccess) {
                        $app.requiredResourceAccess | ForEach-Object {
                            @{ ResourceAppId = $_.resourceAppId; Permissions = $_.resourceAccess.Count }
                        }
                    } else { @() }
                    
                    # Ownership
                    Owners = if ($app.owners) { 
                        $app.owners | ForEach-Object { 
                            if ($_.userPrincipalName) { $_.userPrincipalName } else { $_.displayName }
                        }
                    } else { @() }
                    
                    # Metadata
                    CreatedDateTime = if ($app.createdDateTime) {
                        try { Get-Date $app.createdDateTime -Format "yyyy-MM-ddTHH:mm:ssZ" } catch { $null }
                    } else { $null }
                    Tags = if ($app.tags) { $app.tags } else { @() }
                    LastUpdated = $exportTimestamp
                }
                
                $powerAppsApplications += $paApp
            }
        }
        
        $applicationsPath = Join-Path $powerAppsOutputPath "powerapps_applications.json"
        Export-JsonFile -FilePath $applicationsPath -Data $powerAppsApplications -Depth $jsonDepth
        $metadata.DataCounts.Applications = $powerAppsApplications.Count

        # 6. Export Groups Data
        Write-MandALog "Processing Groups..." -Level "INFO"
        $powerAppsGroups = @()
        
        $groupsSource = $null
        if ($ProcessedData.AggregatedDataStore -and $ProcessedData.AggregatedDataStore.Groups) {
            $groupsSource = $ProcessedData.AggregatedDataStore.Groups
        }
        
        if ($groupsSource -and $groupsSource.Count -gt 0) {
            foreach ($group in $groupsSource) {
                # Count members of this group
                $membersInGroup = $powerAppsUsers | Where-Object {
                    $_.GroupMemberships -contains $group.DisplayName -or
                    $_.GroupMemberships -contains $group.Mail
                }
                
                $paGroup = [PSCustomObject]@{
                    GroupId = if ($group.Id) { $group.Id } else { $group.ObjectGUID }
                    DisplayName = $group.DisplayName
                    Mail = $group.Mail
                    MailNickname = $group.MailNickname
                    Description = $group.Description
                    
                    # Group Type Information
                    GroupTypes = if ($group.GroupTypes) { $group.GroupTypes } else { @() }
                    SecurityEnabled = $group.SecurityEnabled
                    MailEnabled = $group.MailEnabled
                    GroupCategory = switch -Regex ($group.DisplayName) {
                        "^SG_" { "Security Group" }
                        "^DL_" { "Distribution List" }
                        "^O365_" { "Microsoft 365 Group" }
                        "^Team_" { "Teams Group" }
                        default { 
                            if ($group.GroupTypes -contains "Unified") { "Microsoft 365 Group" }
                            elseif ($group.SecurityEnabled -and $group.MailEnabled) { "Mail-Enabled Security Group" }
                            elseif ($group.SecurityEnabled) { "Security Group" }
                            elseif ($group.MailEnabled) { "Distribution List" }
                            else { "Other" }
                        }
                    }
                    
                    # Membership
                    MemberCount = if ($group.Members) { $group.Members.Count } 
                                 elseif ($group.MemberCount) { $group.MemberCount } 
                                 else { $membersInGroup.Count }
                    MemberUPNs = $membersInGroup.UPN
                    
                    # Ownership
                    Owners = if ($group.Owners) {
                        $group.Owners | ForEach-Object {
                            if ($_.UserPrincipalName) { $_.UserPrincipalName } else { $_.DisplayName }
                        }
                    } else { @() }
                    ManagedBy = $group.ManagedBy
                    
                    # Additional Properties
                    Visibility = $group.Visibility
                    ResourceProvisioningOptions = if ($group.ResourceProvisioningOptions) { $group.ResourceProvisioningOptions } else { @() }
                    IsAssignableToRole = $group.IsAssignableToRole
                    
                    # Source System
                    SourceSystem = if ($group.Id -like "*-*-*-*-*") { "AzureAD" } 
                                  elseif ($group.ObjectGUID) { "ActiveDirectory" } 
                                  else { "Unknown" }
                    
                    # Metadata
                    CreatedDateTime = if ($group.CreatedDateTime) {
                        try { Get-Date $group.CreatedDateTime -Format "yyyy-MM-ddTHH:mm:ssZ" } catch { $null }
                    } else { $null }
                    LastUpdated = $exportTimestamp
                }
                
                $powerAppsGroups += $paGroup
            }
        }
        
        $groupsPath = Join-Path $powerAppsOutputPath "powerapps_groups.json"
        Export-JsonFile -FilePath $groupsPath -Data $powerAppsGroups -Depth $jsonDepth
        $metadata.DataCounts.Groups = $powerAppsGroups.Count

        # 7. Export Devices Data
        Write-MandALog "Processing Devices..." -Level "INFO"
        $powerAppsDevices = @()
        
        $devicesSource = $null
        if ($ProcessedData.AggregatedDataStore -and $ProcessedData.AggregatedDataStore.Devices) {
            $devicesSource = $ProcessedData.AggregatedDataStore.Devices
        }
        
        if ($devicesSource -and $devicesSource.Count -gt 0) {
            foreach ($device in $devicesSource) {
                # Find the user who owns this device
                $deviceOwner = $powerAppsUsers | Where-Object {
                    $_.RegisteredDevices -contains $device.DisplayName -or
                    $_.RegisteredDevices -contains $device.DeviceName
                } | Select-Object -First 1
                
                $paDevice = [PSCustomObject]@{
                    DeviceId = if ($device.DeviceId) { $device.DeviceId } else { $device.Id }
                    DeviceName = if ($device.DisplayName) { $device.DisplayName } else { $device.DeviceName }
                    
                    # Device Details
                    Manufacturer = $device.Manufacturer
                    Model = $device.Model
                    SerialNumber = $device.SerialNumber
                    OperatingSystem = $device.OperatingSystem
                    OSVersion = $device.OSVersion
                    DeviceType = $device.DeviceType
                    
                    # Ownership
                    UserUPN = if ($deviceOwner) { $deviceOwner.UPN } 
                             elseif ($device.UserPrincipalName) { $device.UserPrincipalName }
                             else { $device.RegisteredUserUPN }
                    UserId = if ($deviceOwner) { $deviceOwner.Id }
                            elseif ($device.UserId) { $device.UserId }
                            else { $null }
                    UserDisplayName = if ($deviceOwner) { $deviceOwner.DisplayName }
                                     elseif ($device.UserDisplayName) { $device.UserDisplayName }
                                     else { $null }
                    
                    # Management Status
                    IsManaged = $device.IsManaged
                    IsCompliant = $device.IsCompliant
                    ManagementAgent = $device.ManagementAgent
                    EnrollmentType = $device.EnrollmentType
                    ComplianceState = $device.ComplianceState
                    
                    # Device State
                    TrustType = $device.TrustType
                    IsRooted = $device.IsRooted
                    
                    # Activity
                    LastSyncDateTime = if ($device.LastSyncDateTime) {
                        try { Get-Date $device.LastSyncDateTime -Format "yyyy-MM-ddTHH:mm:ssZ" } catch { $null }
                    } elseif ($device.ApproximateLastSignInDateTime) {
                        try { Get-Date $device.ApproximateLastSignInDateTime -Format "yyyy-MM-ddTHH:mm:ssZ" } catch { $null }
                    } else { $null }
                    
                    # Physical Properties
                    TotalStorageGB = if ($device.TotalStorageBytes) { 
                        [math]::Round($device.TotalStorageBytes / 1GB, 2) 
                    } elseif ($device.TotalStorageGB) { 
                        $device.TotalStorageGB 
                    } else { $null }
                    FreeStorageGB = if ($device.FreeStorageBytes) { 
                        [math]::Round($device.FreeStorageBytes / 1GB, 2) 
                    } elseif ($device.FreeStorageGB) { 
                        $device.FreeStorageGB 
                    } else { $null }
                    
                    # Network
                    IPAddress = $device.IPAddress
                    WiFiMacAddress = $device.WiFiMacAddress
                    EthernetMacAddress = $device.EthernetMacAddress
                    
                    # Metadata
                    EnrollmentDateTime = if ($device.EnrollmentDateTime) {
                        try { Get-Date $device.EnrollmentDateTime -Format "yyyy-MM-ddTHH:mm:ssZ" } catch { $null }
                    } else { $null }
                    LastUpdated = $exportTimestamp
                }
                
                $powerAppsDevices += $paDevice
            }
        }
        
        $devicesPath = Join-Path $powerAppsOutputPath "powerapps_devices.json"
        Export-JsonFile -FilePath $devicesPath -Data $powerAppsDevices -Depth $jsonDepth
        $metadata.DataCounts.Devices = $powerAppsDevices.Count

        # 8. Export Relationships Data (Simplified for PowerApps)
        Write-MandALog "Processing Relationships..." -Level "INFO"
        $powerAppsRelationships = @{
            UserGroupMemberships = @()
            UserDeviceOwnership = @()
            UserApplicationAccess = @()
            UserObjectOwnership = @()
            ManagerDirectReports = @()
        }
        
        if ($ProcessedData.RelationshipGraph) {
            $rg = $ProcessedData.RelationshipGraph
            
            # User-Group Memberships
            if ($rg.UserToGroupMembership) {
                foreach ($userId in $rg.UserToGroupMembership.Keys) {
                    $user = $powerAppsUsers | Where-Object { $_.Id -eq $userId -or $_.UPN -eq $userId } | Select-Object -First 1
                    if ($user) {
                        foreach ($groupName in $rg.UserToGroupMembership[$userId]) {
                            $powerAppsRelationships.UserGroupMemberships += @{
                                UserId = $user.Id
                                UserUPN = $user.UPN
                                GroupName = $groupName
                            }
                        }
                    }
                }
            }
            
            # User-Device Ownership
            if ($rg.UserToDeviceLink) {
                foreach ($userId in $rg.UserToDeviceLink.Keys) {
                    $user = $powerAppsUsers | Where-Object { $_.Id -eq $userId -or $_.UPN -eq $userId } | Select-Object -First 1
                    if ($user) {
                        foreach ($deviceName in $rg.UserToDeviceLink[$userId]) {
                            $powerAppsRelationships.UserDeviceOwnership += @{
                                UserId = $user.Id
                                UserUPN = $user.UPN
                                DeviceName = $deviceName
                            }
                        }
                    }
                }
            }
            
            # Manager-Direct Reports
            if ($rg.ManagerToDirectReport) {
                foreach ($managerUPN in $rg.ManagerToDirectReport.Keys) {
                    $manager = $powerAppsUsers | Where-Object { $_.UPN -eq $managerUPN } | Select-Object -First 1
                    if ($manager) {
                        foreach ($reportUPN in $rg.ManagerToDirectReport[$managerUPN]) {
                            $report = $powerAppsUsers | Where-Object { $_.UPN -eq $reportUPN } | Select-Object -First 1
                            if ($report) {
                                $powerAppsRelationships.ManagerDirectReports += @{
                                    ManagerId = $manager.Id
                                    ManagerUPN = $manager.UPN
                                    ManagerName = $manager.DisplayName
                                    DirectReportId = $report.Id
                                    DirectReportUPN = $report.UPN
                                    DirectReportName = $report.DisplayName
                                }
                            }
                        }
                    }
                }
            }
        }
        
        $relationshipsPath = Join-Path $powerAppsOutputPath "powerapps_relationships.json"
        Export-JsonFile -FilePath $relationshipsPath -Data $powerAppsRelationships -Depth $jsonDepth
        $metadata.DataCounts.Relationships = @{
            UserGroupMemberships = $powerAppsRelationships.UserGroupMemberships.Count
            UserDeviceOwnership = $powerAppsRelationships.UserDeviceOwnership.Count
            ManagerDirectReports = $powerAppsRelationships.ManagerDirectReports.Count
        }

        # 9. Export Summary Statistics
        Write-MandALog "Generating Summary Statistics..." -Level "INFO"
        $summaryStats = @{
            Overview = @{
                TotalUsers = $powerAppsUsers.Count
                TotalWaves = $powerAppsWaves.Count
                TotalDepartments = $powerAppsDepartments.Count
                TotalApplications = $powerAppsApplications.Count
                TotalGroups = $powerAppsGroups.Count
                TotalDevices = $powerAppsDevices.Count
            }
            
            UserStatistics = @{
                EnabledUsers = ($powerAppsUsers | Where-Object { $_.AccountEnabled }).Count
                DisabledUsers = ($powerAppsUsers | Where-Object { -not $_.AccountEnabled }).Count
                UsersWithMailbox = ($powerAppsUsers | Where-Object { $_.HasExchangeMailbox }).Count
                UsersWithoutMailbox = ($powerAppsUsers | Where-Object { -not $_.HasExchangeMailbox }).Count
                AverageComplexityScore = if ($powerAppsUsers.Count -gt 0) {
                    [math]::Round(($powerAppsUsers | Measure-Object -Property ComplexityScore -Average).Average, 2)
                } else { 0 }
                AverageReadinessScore = if ($powerAppsUsers.Count -gt 0) {
                    [math]::Round(($powerAppsUsers | Measure-Object -Property ReadinessScore -Average).Average, 1)
                } else { 0 }
            }
            
            ComplexityDistribution = @{
                Simple = ($powerAppsUsers | Where-Object { $_.MigrationCategory -eq "Simple" }).Count
                Standard = ($powerAppsUsers | Where-Object { $_.MigrationCategory -eq "Standard" }).Count
                Complex = ($powerAppsUsers | Where-Object { $_.MigrationCategory -eq "Complex" }).Count
                HighRisk = ($powerAppsUsers | Where-Object { $_.MigrationCategory -eq "High Risk" }).Count
            }
            
            ReadinessDistribution = @{
                Ready = ($powerAppsUsers | Where-Object { $_.ReadinessStatus -eq "Ready" }).Count
                MinorIssues = ($powerAppsUsers | Where-Object { $_.ReadinessStatus -eq "Minor Issues" }).Count
                NeedsAttention = ($powerAppsUsers | Where-Object { $_.ReadinessStatus -eq "Needs Attention" }).Count
                NotReady = ($powerAppsUsers | Where-Object { $_.ReadinessStatus -eq "Not Ready" }).Count
            }
            
            MailboxStatistics = @{
                TotalMailboxSizeGB = [math]::Round(($powerAppsUsers | Measure-Object -Property MailboxSizeGB -Sum).Sum, 2)
                AverageMailboxSizeGB = if ($powerAppsUsers.Count -gt 0) {
                    [math]::Round(($powerAppsUsers | Measure-Object -Property MailboxSizeGB -Average).Average, 2)
                } else { 0 }
                LargestMailboxGB = ($powerAppsUsers | Measure-Object -Property MailboxSizeGB -Maximum).Maximum
                UsersOver10GB = ($powerAppsUsers | Where-Object { $_.MailboxSizeGB -gt 10 }).Count
            }
            
            WaveStatistics = @{
                TotalWaves = $powerAppsWaves.Count
                AverageUsersPerWave = if ($powerAppsWaves.Count -gt 0) {
                    [math]::Round(($powerAppsWaves | Measure-Object -Property TotalUsers -Average).Average, 1)
                } else { 0 }
                TotalEstimatedHours = [math]::Round(($powerAppsWaves | Measure-Object -Property EstimatedTimeHours -Sum).Sum, 1)
            }
            
            DeviceStatistics = @{
                TotalDevices = $powerAppsDevices.Count
                ManagedDevices = ($powerAppsDevices | Where-Object { $_.IsManaged }).Count
                CompliantDevices = ($powerAppsDevices | Where-Object { $_.IsCompliant }).Count
                WindowsDevices = ($powerAppsDevices | Where-Object { $_.OperatingSystem -like "*Windows*" }).Count
                iOSDevices = ($powerAppsDevices | Where-Object { $_.OperatingSystem -like "*iOS*" }).Count
                AndroidDevices = ($powerAppsDevices | Where-Object { $_.OperatingSystem -like "*Android*" }).Count
            }
        }
        
        $summaryPath = Join-Path $powerAppsOutputPath "powerapps_summary.json"
        Export-JsonFile -FilePath $summaryPath -Data $summaryStats -Depth 3

        # 10. Save Metadata
        $metadata.DataCounts.Summary = "Included in powerapps_summary.json"
        $metadataPath = Join-Path $powerAppsOutputPath "powerapps_metadata.json"
        Export-JsonFile -FilePath $metadataPath -Data $metadata -Depth 2

        # Create index file for PowerApp
        Write-MandALog "Creating PowerApp index file..." -Level "INFO"
        $indexData = @{
            AppName = "M&A Migration Dashboard"
            Version = "2.0.0"
            DataVersion = $exportTimestamp
            CompanyName = $Configuration.metadata.companyName
            Files = @(
                @{ Name = "Companies"; File = "powerapps_companies.json"; RecordCount = $metadata.DataCounts.Companies }
                @{ Name = "Users"; File = "powerapps_users.json"; RecordCount = $metadata.DataCounts.Users }
                @{ Name = "Waves"; File = "powerapps_waves.json"; RecordCount = $metadata.DataCounts.Waves }
                @{ Name = "Departments"; File = "powerapps_departments.json"; RecordCount = $metadata.DataCounts.Departments }
                @{ Name = "Applications"; File = "powerapps_applications.json"; RecordCount = $metadata.DataCounts.Applications }
                @{ Name = "Groups"; File = "powerapps_groups.json"; RecordCount = $metadata.DataCounts.Groups }
                @{ Name = "Devices"; File = "powerapps_devices.json"; RecordCount = $metadata.DataCounts.Devices }
                @{ Name = "Relationships"; File = "powerapps_relationships.json"; RecordCount = "Multiple" }
                @{ Name = "Summary"; File = "powerapps_summary.json"; RecordCount = "Statistics" }
                @{ Name = "Metadata"; File = "powerapps_metadata.json"; RecordCount = "Metadata" }
            )
            Instructions = @"
To use this data in PowerApps:
1. Upload all JSON files to a data source (SharePoint, OneDrive, etc.)
2. In PowerApps, use the OnStart property to load each JSON file
3. Parse JSON using ParseJSON() function
4. Store in collections for app-wide access
5. Use the index to verify all files are loaded correctly
"@
        }
        
        $indexPath = Join-Path $powerAppsOutputPath "powerapps_index.json"
        Export-JsonFile -FilePath $indexPath -Data $indexData -Depth 2

        Write-MandALog "PowerApps Export Process Completed Successfully" -Level "SUCCESS"
        Write-MandALog "Output directory: $powerAppsOutputPath" -Level "INFO"
        Write-MandALog "Total files created: 11" -Level "INFO"
        
        return $true
        
    } catch {
        Write-MandALog "Error during PowerApps Export: $($_.Exception.Message)" -Level "ERROR"
        Write-MandALog "Stack Trace: $($_.ScriptStackTrace)" -Level "DEBUG"
        return $false
    }
}

# Export the function
Export-ModuleMember -Function Export-ForPowerApps

Write-MandALog "Enhanced PowerAppsExporter.psm1 module loaded." -Level "DEBUG"
