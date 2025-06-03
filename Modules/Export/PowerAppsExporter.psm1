#Requires -Version 5.1
#Requires -Modules EnhancedLogging, FileOperations # Assuming these are globally available via Orchestrator

<#
.SYNOPSIS
    Exports processed M&A discovery data into JSON formats optimized for PowerApps consumption.
.DESCRIPTION
    Blended and enhanced version that exports comprehensive data structures to support the full PowerApp design
    including companies, users, waves, departments, applications, groups, devices, relationships, and summaries.
    Combines strengths of the original user script and the PowerApp design document requirements.
.NOTES
    Version: 2.1.1 - Syntax Corrected
    Author: Gemini (incorporating User Logic)
    Date: 2025-06-02
#>

#region INTERNAL HELPER FUNCTIONS

#===============================================================================
# Get-ProcessedDataFileFromInput
# Helper function to load a specific CSV file from the $ProcessedData hashtable.
#===============================================================================
function Get-ProcessedDataFileFromInput {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$KeyName, # e.g., "UserProfiles", "MigrationWaves"
        [Parameter(Mandatory=$true)]
        [hashtable]$ProcessedData
    )

    if ($ProcessedData.ContainsKey($KeyName) -and $null -ne $ProcessedData[$KeyName]) {
        $data = $ProcessedData[$KeyName]
        Write-MandALog "Retrieved '$KeyName' from processed data with $($data.Count) records." -Level DEBUG
        return $data
    }
    else {
        Write-MandALog "Processed data key not found or is null: '$KeyName'." -Level WARN
        return @() # Return empty array to prevent downstream errors
    }
}

#===============================================================================
# Export-DataObjectToJson
# Helper function to export a PowerShell object to a JSON file.
#===============================================================================
function Export-DataObjectToJson {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,
        [Parameter(Mandatory = $true)]
        [object]$Data,
        [Parameter(Mandatory = $true)]
        [int]$Depth
    )
    try {
        $Data | ConvertTo-Json -Depth $Depth -Compress:$false | Set-Content -Path $FilePath -Encoding UTF8 -ErrorAction Stop
        Write-MandALog "Exported: $(Split-Path $FilePath -Leaf)" -Level SUCCESS
        return $true
    } catch {
        Write-MandALog "Failed to export $(Split-Path $FilePath -Leaf): $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

#endregion

#===============================================================================
#                           EXPORT-FORPOWERAPPS
# Main exported function for the module.
#===============================================================================
function Export-ForPowerApps {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$ProcessedData, # Expects keys like UserProfiles, MigrationWaves, Devices, Groups, Applications etc.

        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration
    )

    try { # Main try block for the entire function
        Write-MandALog "Starting Enhanced PowerApps Export Process (v2.1.1)" -Level "HEADER"

        $baseOutputPath = $Configuration.environment.outputPath
        if (-not [System.IO.Path]::IsPathRooted($baseOutputPath)) {
            if ($global:MandA.Paths.CompanyProfileRoot) {
                $baseOutputPath = $global:MandA.Paths.CompanyProfileRoot
                Write-MandALog "Using CompanyProfileRoot for base output: $baseOutputPath" -Level INFO
            } else {
                Write-MandALog "CompanyProfileRoot not set in global context, using configured outputPath: $baseOutputPath" -Level WARN
            }
        }
        
        $powerAppsOutputPath = Join-Path -Path $baseOutputPath -ChildPath "Processed\PowerApps"
        $jsonDepth = if ($Configuration.export.powerAppsJsonDepth) { [int]$Configuration.export.powerAppsJsonDepth } else { 7 }

        if (-not (Test-Path -Path $powerAppsOutputPath -PathType Container)) {
            New-Item -Path $powerAppsOutputPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
            Write-MandALog "Created PowerApps export directory: $powerAppsOutputPath" -Level SUCCESS
        }

        $exportTimestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
        $metadata = @{
            ExportTimestamp = $exportTimestamp
            SuiteVersion    = $Configuration.metadata.version
            ProjectName     = $Configuration.metadata.projectName
            CompanyName     = $Configuration.metadata.companyName
            DataCounts      = @{}
        }

        Write-MandALog "Loading primary processed data..." -Level INFO
        $UserProfiles           = Get-ProcessedDataFileFromInput -KeyName "UserProfiles" -ProcessedData $ProcessedData
        $MigrationWaves         = Get-ProcessedDataFileFromInput -KeyName "MigrationWaves" -ProcessedData $ProcessedData
        $Applications           = Get-ProcessedDataFileFromInput -KeyName "Applications" -ProcessedData $ProcessedData
        $Groups                 = Get-ProcessedDataFileFromInput -KeyName "Groups" -ProcessedData $ProcessedData
        $Devices                = Get-ProcessedDataFileFromInput -KeyName "Devices" -ProcessedData $ProcessedData

        # --- 1. Export Companies Data (powerapps_companies.json) ---
        Write-MandALog "Processing Companies data..." -Level "INFO"
        $companiesData = @()
        $profilesBasePath = $Configuration.environment.profilesBasePath
        
        if ([string]::IsNullOrWhiteSpace($profilesBasePath) -and $global:MandA.Paths.CompanyProfileRoot) {
             $profilesBasePath = Split-Path $global:MandA.Paths.CompanyProfileRoot -Parent
             Write-MandALog "Inferred ProfilesBasePath: $profilesBasePath" -Level DEBUG
        }

        if (Test-Path $profilesBasePath -PathType Container) {
            Get-ChildItem -Path $profilesBasePath -Directory | ForEach-Object {
                $dir = $_
                $companyNameFromDir = $dir.Name
                $currentCompanyStats = @{
                    CompanyName         = $companyNameFromDir
                    CompanyId           = $companyNameFromDir.ToLower() -replace '[^a-z0-9]', ''
                    ProfilePath         = $dir.FullName
                    TotalUsers          = 0
                    TotalWaves          = 0
                    TotalDepartments    = 0
                    AverageComplexity   = 0.0
                    ReadinessPercentage = 0.0
                    LastUpdated         = $dir.LastWriteTime.ToString("yyyy-MM-ddTHH:mm:ssZ")
                }
                
                if ($companyNameFromDir -eq $Configuration.metadata.companyName -and $UserProfiles.Count -gt 0) {
                    $currentCompanyStats.TotalUsers = $UserProfiles.Count
                    $currentCompanyStats.TotalWaves = $MigrationWaves.Count
                    $currentCompanyStats.TotalDepartments = ($UserProfiles | Where-Object { $_.PSObject.Properties['Department'] -and $_.Department } | Select-Object -ExpandProperty Department -Unique).Count
                    $currentCompanyStats.AverageComplexity = [math]::Round(($UserProfiles | Measure-Object -Property ComplexityScore -Average).Average, 2)
                    $readyUsersCount = ($UserProfiles | Where-Object { $_.PSObject.Properties['ReadinessStatus'] -and $_.ReadinessStatus -eq "Ready" }).Count
                    $currentCompanyStats.ReadinessPercentage = if ($currentCompanyStats.TotalUsers -gt 0) { 
                        [math]::Round(($readyUsersCount / $currentCompanyStats.TotalUsers) * 100, 1) 
                    } else { 0.0 }
                }
                $companiesData += $currentCompanyStats
            }
        } else {
             Write-MandALog "ProfilesBasePath '$profilesBasePath' not found. Using current company data only." -Level WARN
             $currentCompanyStats = @{
                CompanyName         = $Configuration.metadata.companyName
                CompanyId           = $Configuration.metadata.companyName.ToLower() -replace '[^a-z0-9]', ''
                TotalUsers          = $UserProfiles.Count
                TotalWaves          = $MigrationWaves.Count
                TotalDepartments    = ($UserProfiles | Where-Object { $_.PSObject.Properties['Department'] -and $_.Department } | Select-Object -ExpandProperty Department -Unique).Count
                AverageComplexity   = if ($UserProfiles.Count -gt 0) { [math]::Round(($UserProfiles | Measure-Object -Property ComplexityScore -Average).Average, 2)} else {0.0}
                ReadinessPercentage = if ($UserProfiles.Count -gt 0) { 
                                        $readyUsersCount = ($UserProfiles | Where-Object { $_.PSObject.Properties['ReadinessStatus'] -and $_.ReadinessStatus -eq "Ready" }).Count
                                        [math]::Round(($readyUsersCount / $UserProfiles.Count) * 100, 1) 
                                      } else { 0.0 }
                LastUpdated         = $exportTimestamp
             }
             $companiesData += $currentCompanyStats
        }
        Export-DataObjectToJson -FilePath (Join-Path $powerAppsOutputPath "powerapps_companies.json") -Data $companiesData -Depth $jsonDepth
        $metadata.DataCounts.Companies = $companiesData.Count

        # --- 2. Export Enhanced User Profiles (powerapps_users.json) ---
        Write-MandALog "Processing User Profiles for PowerApps..." -Level "INFO"
        $powerAppsUsers = @()
        if ($UserProfiles.Count -gt 0) {
            $powerAppsUsers = foreach ($userProfile in $UserProfiles) {
                [PSCustomObject]@{
                    Id                          = $(if ($userProfile.PSObject.Properties['GraphId'] -and $userProfile.GraphId) { $userProfile.GraphId } else { $userProfile.UserPrincipalName })
                    UPN                         = $userProfile.UserPrincipalName
                    DisplayName                 = $userProfile.DisplayName
                    FirstName                   = $(if ($userProfile.PSObject.Properties['GivenName']) {$userProfile.GivenName} else {$null})
                    LastName                    = $(if ($userProfile.PSObject.Properties['Surname']) {$userProfile.Surname} else {$null})
                    Email                       = $(if ($userProfile.PSObject.Properties['Mail']) {$userProfile.Mail} else {$null})
                    SamAccountName              = $(if ($userProfile.PSObject.Properties['SamAccountName']) {$userProfile.SamAccountName} else {$null})
                    Department                  = $(if ($userProfile.PSObject.Properties['Department']) {$userProfile.Department} else {$null})
                    JobTitle                    = $(if ($userProfile.PSObject.Properties['Title']) {$userProfile.Title} elseif($userProfile.PSObject.Properties['JobTitle']){$userProfile.JobTitle} else {$null})
                    Company                     = $(if ($userProfile.PSObject.Properties['Company']) {$userProfile.Company} elseif($userProfile.PSObject.Properties['CompanyName']){$userProfile.CompanyName} else {$null})
                    Office                      = $(if ($userProfile.PSObject.Properties['Office']) {$userProfile.Office} elseif($userProfile.PSObject.Properties['OfficeLocation']){$userProfile.OfficeLocation} else {$null})
                    ManagerUPN                  = $(if ($userProfile.PSObject.Properties['Manager']) {$userProfile.Manager} else {$null})
                    DirectReportsCount          = $(if ($userProfile.PSObject.Properties['DirectReportsCount'] -and $userProfile.DirectReportsCount) {[int]$userProfile.DirectReportsCount} else{0})

                    AccountEnabled              = $([System.Convert]::ToBoolean($userProfile.Enabled))
                    LastLogonDate               = $(try { if($userProfile.PSObject.Properties['LastLogon'] -and $userProfile.LastLogon){(Get-Date $userProfile.LastLogon).ToString("yyyy-MM-ddTHH:mm:ssZ")}else{$null}} catch {$null})
                    AccountCreatedDate          = $(try { if($userProfile.PSObject.Properties['AccountCreated'] -and $userProfile.AccountCreated){(Get-Date $userProfile.AccountCreated).ToString("yyyy-MM-ddTHH:mm:ssZ")}else{$null}} catch {$null})
                    DaysSinceLastLogon          = $(try { if($userProfile.PSObject.Properties['LastLogon'] -and $userProfile.LastLogon){(New-TimeSpan -Start ([datetime]$userProfile.LastLogon) -End (Get-Date)).Days}else{$null}} catch {$null})

                    HasADAccount                = $([System.Convert]::ToBoolean($userProfile.HasADAccount))
                    HasAzureADAccount           = $([System.Convert]::ToBoolean($userProfile.HasGraphAccount))
                    HasExchangeMailbox          = $([System.Convert]::ToBoolean($userProfile.HasExchangeMailbox))
                    MailboxType                 = $(if ($userProfile.PSObject.Properties['MailboxType']) {$userProfile.MailboxType} else {$null})
                    
                    Licenses                    = $(if ($userProfile.PSObject.Properties['AssignedLicenses'] -and $userProfile.AssignedLicenses -is [string]) { $userProfile.AssignedLicenses -split ';' | Where-Object {$_} } elseif($userProfile.PSObject.Properties['AssignedLicenses']) { @($userProfile.AssignedLicenses) } else { @() })
                    LicenseCount                = $(if ($userProfile.PSObject.Properties['LicenseCount'] -and $userProfile.LicenseCount) {[int]$userProfile.LicenseCount} else{0})

                    MailboxSizeMB               = $(if ($userProfile.PSObject.Properties['MailboxSizeMB'] -and $userProfile.MailboxSizeMB) {[double]$userProfile.MailboxSizeMB} else{0.0})
                    MailboxSizeGB               = $(if ($userProfile.PSObject.Properties['MailboxSizeMB'] -and $userProfile.MailboxSizeMB) { [math]::Round(([double]$userProfile.MailboxSizeMB / 1024), 2) } else { 0.0 })
                    MailboxSizeCategory         = $(switch ([double]($userProfile.PSObject.Properties['MailboxSizeMB']|ForEach-Object{if($_){$_}else{0}})) {
                                                      { $_ -eq 0 } { "No Mailbox" } ; { $_ -lt 1024 } { "Small (<1GB)" } ; { $_ -lt 5120 } { "Medium (1-5GB)" }
                                                      { $_ -lt 10240 } { "Large (5-10GB)" } ; { $_ -lt 20480 } { "Very Large (10-20GB)" }
                                                      default { "Huge (>20GB)" }
                                                  })
                    ArchiveStatus               = $(if ($userProfile.PSObject.Properties['ArchiveStatus']) {$userProfile.ArchiveStatus} else {$null}) # Assuming from Exchange
                    EmailAliases                = $(if($userProfile.PSObject.Properties['proxyAddresses'] -and $userProfile.proxyAddresses -is [string]){ ($userProfile.proxyAddresses -split ';') | Where-Object { $_ -clike "smtp:*" } | ForEach-Object { $_ -replace "(?i)smtp:", "" } } else { @() })
                    
                    MobileDevicesConnectedText  = $(if ($userProfile.PSObject.Properties['MobileDevicesText']) {$userProfile.MobileDevicesText} else {$null})
                    TeamsSitesText              = $(if ($userProfile.PSObject.Properties['TeamsSitesText']) {$userProfile.TeamsSitesText} else {$null})
                    SharePointSitesText         = $(if ($userProfile.PSObject.Properties['SharePointSitesText']) {$userProfile.SharePointSitesText} else {$null})

                    ComplexityScore             = $(if ($userProfile.PSObject.Properties['ComplexityScore'] -and $userProfile.ComplexityScore) {[int]$userProfile.ComplexityScore} else{0})
                    ComplexityFactors           = $(if ($userProfile.PSObject.Properties['ComplexityFactors'] -and $userProfile.ComplexityFactors -is [string]) { $userProfile.ComplexityFactors -split ';' | Where-Object {$_} } elseif($userProfile.PSObject.Properties['ComplexityFactors']) { @($userProfile.ComplexityFactors) } else { @() })
                    MigrationCategory           = $(if ($userProfile.PSObject.Properties['MigrationCategory']) {$userProfile.MigrationCategory} else {$null})
                    MigrationWave               = $(if ($userProfile.PSObject.Properties['MigrationWave']) {$userProfile.MigrationWave} else {$null})
                    MigrationPriority           = $(if ($userProfile.PSObject.Properties['MigrationPriority'] -and $userProfile.MigrationPriority) {[int]$userProfile.MigrationPriority} else{0})
                    EstimatedMigrationTimeMinutes = $(if ($userProfile.PSObject.Properties['EstimatedMigrationTime'] -and $userProfile.EstimatedMigrationTime) {[int]$userProfile.EstimatedMigrationTime} else{0})

                    ReadinessScore              = $(if ($userProfile.PSObject.Properties['ReadinessScore'] -and $userProfile.ReadinessScore) {[int]$userProfile.ReadinessScore} else{0})
                    ReadinessStatus             = $(if ($userProfile.PSObject.Properties['ReadinessStatus']) {$userProfile.ReadinessStatus} else {$null})
                    ReadinessCategory           = $(switch ([int]($userProfile.PSObject.Properties['ReadinessScore']|ForEach-Object{if($_){$_}else{0}})) {
                                                    { $_ -ge 90 } { "Ready" } ; { $_ -ge 70 } { "Nearly Ready" }
                                                    { $_ -ge 50 } { "Needs Work" } ; default { "Not Ready" }
                                                  })
                    BlockingIssues              = $(if ($userProfile.PSObject.Properties['BlockingIssues'] -and $userProfile.BlockingIssues -is [string]) { $userProfile.BlockingIssues -split ';' | Where-Object {$_} } elseif($userProfile.PSObject.Properties['BlockingIssues']) { @($userProfile.BlockingIssues) } else { @() })
                    RiskFactors                 = $(if ($userProfile.PSObject.Properties['RiskFactors'] -and $userProfile.RiskFactors -is [string]) { $userProfile.RiskFactors -split ';' | Where-Object {$_} } elseif($userProfile.PSObject.Properties['RiskFactors']) { @($userProfile.RiskFactors) } else { @() })
                    RiskLevel                   = $(if ($userProfile.PSObject.Properties['RiskLevel']) {$userProfile.RiskLevel} else {$null})

                    GroupMembershipCount        = $(if ($userProfile.PSObject.Properties['GroupMembershipCount'] -and $userProfile.GroupMembershipCount) {[int]$userProfile.GroupMembershipCount} else{0})
                    GroupMemberships            = $(if ($userProfile.PSObject.Properties['GroupMembershipsText'] -and $userProfile.GroupMembershipsText -is [string]) { $userProfile.GroupMembershipsText -split ';' | Where-Object {$_} | ForEach-Object {$_.Trim()} } elseif($userProfile.PSObject.Properties['GroupMembershipsText']) { @($userProfile.GroupMembershipsText) } else { @() })
                    
                    ApplicationAccessCount      = $(if ($userProfile.PSObject.Properties['ApplicationAccessCount'] -and $userProfile.ApplicationAccessCount) {[int]$userProfile.ApplicationAccessCount} else{0})
                    ApplicationAccess           = $(if ($userProfile.PSObject.Properties['ApplicationAssignmentsText'] -and $userProfile.ApplicationAssignmentsText -is [string]) { $userProfile.ApplicationAssignmentsText -split ';' | Where-Object {$_} | ForEach-Object {$_.Trim()} } elseif($userProfile.PSObject.Properties['ApplicationAssignmentsText']) { @($userProfile.ApplicationAssignmentsText) } else { @() })
                    
                    OwnedObjectsCount           = $(if ($userProfile.PSObject.Properties['OwnedObjectsCount'] -and $userProfile.OwnedObjectsCount) {[int]$userProfile.OwnedObjectsCount} else{0})
                    OwnedApplications           = $(if ($userProfile.PSObject.Properties['OwnedApplicationsText'] -and $userProfile.OwnedApplicationsText -is [string]) { $userProfile.OwnedApplicationsText -split ';' | Where-Object {$_} | ForEach-Object {$_.Trim()} } elseif($userProfile.PSObject.Properties['OwnedApplicationsText']) { @($userProfile.OwnedApplicationsText) } else { @() })
                    OwnedGroups                 = $(if ($userProfile.PSObject.Properties['OwnedGroupsText'] -and $userProfile.OwnedGroupsText -is [string]) { $userProfile.OwnedGroupsText -split ';' | Where-Object {$_} | ForEach-Object {$_.Trim()} } elseif($userProfile.PSObject.Properties['OwnedGroupsText']) { @($userProfile.OwnedGroupsText) } else { @() })
                    
                    RegisteredDevices           = $(if ($userProfile.PSObject.Properties['RegisteredDevicesText'] -and $userProfile.RegisteredDevicesText -is [string]) { $userProfile.RegisteredDevicesText -split ';' | Where-Object {$_} | ForEach-Object {$_.Trim()} } elseif($userProfile.PSObject.Properties['RegisteredDevicesText']) { @($userProfile.RegisteredDevicesText) } else { @() })
                    DeviceCount                 = $(if ($userProfile.PSObject.Properties['RegisteredDevicesText'] -and $userProfile.RegisteredDevicesText -is [string]) { ($userProfile.RegisteredDevicesText -split ';' | Where-Object {$_}).Count } else {0})
                    
                    SearchTags                  = $(@($userProfile.UserPrincipalName, $userProfile.DisplayName, ($userProfile.PSObject.Properties['Department']|Select -First 1), ($userProfile.PSObject.Properties['Title']|Select -First 1), ($userProfile.PSObject.Properties['MigrationCategory']|Select -First 1), ($userProfile.PSObject.Properties['ReadinessStatus']|Select -First 1)) | Where-Object { $_ } | ForEach-Object { $_.ToLower().Trim() })
                    
                    Notes                       = $(if ($userProfile.PSObject.Properties['Notes']) {$userProfile.Notes} else {$null})
                    LastUpdated                 = $exportTimestamp
                }
            }
        }
        Export-DataObjectToJson -FilePath (Join-Path $powerAppsOutputPath "powerapps_users.json") -Data $powerAppsUsers -Depth $jsonDepth
        $metadata.DataCounts.Users = $powerAppsUsers.Count

        # --- 3. Export Enhanced Migration Waves (powerapps_waves.json) ---
        Write-MandALog "Processing Migration Waves for PowerApps..." -Level "INFO"
        $powerAppsWaves = @()
        if ($MigrationWaves.Count -gt 0) {
            $waveOrder = 1
            $powerAppsWaves = foreach ($wave in $MigrationWaves) {
                $waveUserUPNs = if ($wave.PSObject.Properties['UserPrincipalNames'] -and $wave.UserPrincipalNames -is [string]) { $wave.UserPrincipalNames -split ';' | Where-Object {$_} | ForEach-Object {$_.Trim()} } elseif($wave.PSObject.Properties['UserPrincipalNames']) { @($wave.UserPrincipalNames) } else { @() }
                $currentWaveUsers = $powerAppsUsers | Where-Object { $_.UPN -in $waveUserUPNs }

                [PSCustomObject]@{
                    WaveId                      = $(if($wave.PSObject.Properties['WaveID']){$wave.WaveID}else{$null})
                    WaveName                    = $(if($wave.PSObject.Properties['WaveName']){$wave.WaveName}else{$null})
                    WaveOrder                   = $waveOrder++
                    WaveType                    = $(if ($wave.PSObject.Properties['Criteria'] -and $wave.Criteria -match "Department") { "Department-Based" } elseif ($wave.PSObject.Properties['Criteria'] -and $wave.Criteria) {$wave.Criteria} else { "Complexity-Based" })
                    TotalUsers                  = $(if($wave.PSObject.Properties['TotalUsers'] -and $wave.TotalUsers){[int]$wave.TotalUsers}else{0})
                    UserUPNs                    = $waveUserUPNs
                    UserIds                     = $currentWaveUsers | Select-Object -ExpandProperty Id
                    AverageComplexity           = $([math]::Round(($wave.PSObject.Properties['AverageComplexity']|ForEach-Object{if($_){[double]$_}else{0.0}}), 2))
                    ComplexityDistribution      = $(if($currentWaveUsers.Count -gt 0){$currentWaveUsers | Group-Object -Property MigrationCategory | ForEach-Object { @{ Category = $_.Name; Count = $_.Count; Percentage = [math]::Round(($_.Count / $currentWaveUsers.Count) * 100, 1) } }} else {@{}})
                    ReadinessDistribution       = $(if($currentWaveUsers.Count -gt 0){$currentWaveUsers | Group-Object -Property ReadinessStatus | ForEach-Object { @{ Status = $_.Name; Count = $_.Count; Percentage = [math]::Round(($_.Count / $currentWaveUsers.Count) * 100, 1) } }} else {@{}})
                    AverageReadinessScore       = $(if ($currentWaveUsers.Count -gt 0) { [math]::Round(($currentWaveUsers | Measure-Object -Property ReadinessScore -Average).Average, 1) } else { 0.0 })
                    Departments                 = ($currentWaveUsers | Where-Object { $_.Department } | Select-Object -ExpandProperty Department -Unique) -join ', '
                    DepartmentCount             = ($currentWaveUsers | Where-Object { $_.Department } | Select-Object -ExpandProperty Department -Unique).Count
                    EstimatedTimeHours          = $(if ($currentWaveUsers.Count -gt 0) { [math]::Round(($currentWaveUsers | Measure-Object -Property EstimatedMigrationTimeMinutes -Sum).Sum / 60, 1) } else { 0.0 })
                    HighRiskUserCount           = ($currentWaveUsers | Where-Object { $_.RiskLevel -eq "High" }).Count
                    BlockedUserCount            = ($currentWaveUsers | Where-Object { $_.BlockingIssues.Count -gt 0 }).Count
                    Criteria                    = $(if($wave.PSObject.Properties['Criteria']){$wave.Criteria}else{$null})
                    Status                      = "Planned" 
                    PlannedStartDate            = $null 
                    PlannedEndDate              = $null
                    Notes                       = $(if($wave.PSObject.Properties['Notes']){$wave.Notes}else{$null})
                    LastUpdated                 = $exportTimestamp
                }
            }
        }
        Export-DataObjectToJson -FilePath (Join-Path $powerAppsOutputPath "powerapps_waves.json") -Data $powerAppsWaves -Depth $jsonDepth
        $metadata.DataCounts.Waves = $powerAppsWaves.Count

        # --- 4. Export Enhanced Department Data (powerapps_departments.json) ---
        Write-MandALog "Processing Departments for PowerApps..." -Level "INFO"
        $powerAppsDepartments = @()
        if ($powerAppsUsers.Count -gt 0) {
            $powerAppsDepartments = $powerAppsUsers | Where-Object { -not [string]::IsNullOrWhiteSpace($_.Department) } | Group-Object Department | ForEach-Object {
                $deptGroup = $_
                $deptUsersInGroup = $deptGroup.Group
                [PSCustomObject]@{
                    DepartmentId                = $deptGroup.Name.ToLower() -replace '[^a-z0-9]', ''
                    DepartmentName              = $deptGroup.Name
                    TotalUsers                  = $deptUsersInGroup.Count
                    EnabledUsers                = ($deptUsersInGroup | Where-Object { $_.AccountEnabled }).Count
                    UserUPNs                    = $deptUsersInGroup.UPN
                    AverageComplexity           = $([math]::Round(($deptUsersInGroup | Measure-Object -Property ComplexityScore -Average).Average, 2))
                    ComplexityDistribution      = $($deptUsersInGroup | Group-Object -Property MigrationCategory | ForEach-Object { @{ Category = $_.Name; Count = $_.Count; Percentage = [math]::Round(($_.Count / $deptUsersInGroup.Count) * 100, 1) } })
                    AverageReadiness            = $([math]::Round(($deptUsersInGroup | Measure-Object -Property ReadinessScore -Average).Average, 1))
                    ReadinessDistribution       = $($deptUsersInGroup | Group-Object -Property ReadinessStatus | ForEach-Object { @{ Status = $_.Name; Count = $_.Count; Percentage = [math]::Round(($_.Count / $deptUsersInGroup.Count) * 100, 1) } })
                    WaveDistribution            = $($deptUsersInGroup | Where-Object { $_.MigrationWave } | Group-Object -Property MigrationWave | ForEach-Object { @{ Wave = $_.Name; Count = $_.Count } })
                    TopApplications             = $($deptUsersInGroup | ForEach-Object { $_.ApplicationAccess } | Where-Object {$_} | Group-Object | Sort-Object Count -Descending | Select-Object -First 5 | ForEach-Object { @{ AppName = $_.Name; UserCount = $_.Count } })
                    ManagerCount                = ($deptUsersInGroup | Where-Object { $_.DirectReportsCount -gt 0 }).Count
                    LastUpdated                 = $exportTimestamp
                }
            }
        }
        Export-DataObjectToJson -FilePath (Join-Path $powerAppsOutputPath "powerapps_departments.json") -Data $powerAppsDepartments -Depth $jsonDepth
        $metadata.DataCounts.Departments = $powerAppsDepartments.Count

        # --- 5. Export Applications Data (powerapps_applications.json) ---
        Write-MandALog "Processing Applications for PowerApps..." -Level "INFO"
        $powerAppsApplications = @()
        if ($Applications.Count -gt 0) {
            $powerAppsApplications = foreach ($app in $Applications) {
                [PSCustomObject]@{
                    ApplicationId           = $(if($app.PSObject.Properties['appId']){$app.appId}else{$null})
                    ObjectId                = $(if($app.PSObject.Properties['id']){$app.id}else{$null})
                    DisplayName             = $(if($app.PSObject.Properties['displayName']){$app.displayName}else{$null})
                    PublisherDomain         = $(if($app.PSObject.Properties['publisherDomain']){$app.publisherDomain}else{$null})
                    SignInAudience          = $(if($app.PSObject.Properties['signInAudience']){$app.signInAudience}else{$null})
                    UserCount               = ($powerAppsUsers | Where-Object { ($_.ApplicationAccess -contains $app.displayName) -or ($_.ApplicationAccess -contains $app.appId) }).Count
                    AppRoles                = $(if ($app.PSObject.Properties['appRoles'] -and $app.appRoles) { $app.appRoles | ForEach-Object { $_.displayName } } else { @() })
                    Owners                  = $(if ($app.PSObject.Properties['owners'] -and $app.owners) { $app.owners | ForEach-Object { if ($_.userPrincipalName) { $_.userPrincipalName } else { $_.displayName } } } else { @() })
                    CreatedDateTime         = $(try {if($app.PSObject.Properties['createdDateTime'] -and $app.createdDateTime){(Get-Date $app.createdDateTime).ToString("yyyy-MM-ddTHH:mm:ssZ")}else{$null}} catch {$null})
                    Tags                    = $(if ($app.PSObject.Properties['tags'] -and $app.tags) { $app.tags } else { @() })
                    LastUpdated             = $exportTimestamp
                }
            }
        }
        Export-DataObjectToJson -FilePath (Join-Path $powerAppsOutputPath "powerapps_applications.json") -Data $powerAppsApplications -Depth $jsonDepth
        $metadata.DataCounts.Applications = $powerAppsApplications.Count

        # --- 6. Export Groups Data (powerapps_groups.json) ---
        Write-MandALog "Processing Groups for PowerApps..." -Level "INFO"
        $powerAppsGroups = @()
        if ($Groups.Count -gt 0) {
            $powerAppsGroups = foreach ($group in $Groups) {
                 [PSCustomObject]@{
                    GroupId                     = $(if($group.PSObject.Properties['id']){$group.id}elseif($group.PSObject.Properties['ObjectGUID']){$group.ObjectGUID}else{$null})
                    DisplayName                 = $(if($group.PSObject.Properties['displayName']){$group.displayName}else{$null})
                    Mail                        = $(if($group.PSObject.Properties['mail']){$group.mail}else{$null})
                    MailNickname                = $(if($group.PSObject.Properties['mailNickname']){$group.mailNickname}else{$null})
                    Description                 = $(if($group.PSObject.Properties['description']){$group.description}else{$null})
                    GroupTypes                  = $(if ($group.PSObject.Properties['groupTypes'] -and $group.groupTypes -is [string]) { $group.groupTypes -split ';' | Where-Object {$_}} elseif($group.PSObject.Properties['groupTypes']){@($group.groupTypes)} else { @()})
                    SecurityEnabled             = $([System.Convert]::ToBoolean($group.securityEnabled))
                    MailEnabled                 = $([System.Convert]::ToBoolean($group.mailEnabled))
                    GroupCategory               = $(switch -Regex ($group.PSObject.Properties['displayName']|Select -First 1) {
                                                    "^SG_" { "Security Group" } ; "^DL_" { "Distribution List" } ; "^O365_" { "Microsoft 365 Group" } ; "^Team_" { "Teams Group" }
                                                    default { $groupTypesLocal = if ($group.PSObject.Properties['groupTypes'] -and $group.groupTypes -is [string]) { $group.groupTypes -split ';' } elseif($group.PSObject.Properties['groupTypes']){@($group.groupTypes)} else { @() }; if ("Unified" -in $groupTypesLocal) { "Microsoft 365 Group" } elseif ($group.securityEnabled -and $group.mailEnabled) { "Mail-Enabled Security Group" } elseif ($group.securityEnabled) { "Security Group" } elseif ($group.mailEnabled) { "Distribution List" } else { "Other" }}
                                                  })
                    MemberCount                 = ($powerAppsUsers | Where-Object {$_.GroupMemberships -contains $group.displayName -or $_.GroupMemberships -contains ($group.PSObject.Properties['mail']|Select -First 1) -or $_.GroupMemberships -contains ($group.PSObject.Properties['id']|Select -First 1)}).Count
                    Owners                      = $(if ($group.PSObject.Properties['owners'] -and $group.owners) { $group.owners | ForEach-Object { if ($_.userPrincipalName) { $_.userPrincipalName } else { $_.displayName } } } else { @() })
                    ManagedBy                   = $(if($group.PSObject.Properties['managedBy']){$group.managedBy}else{$null})
                    Visibility                  = $(if($group.PSObject.Properties['visibility']){$group.visibility}else{$null})
                    IsAssignableToRole          = $([System.Convert]::ToBoolean($group.isAssignableToRole))
                    SourceSystem                = $(if (($group.PSObject.Properties['Id']|Select -First 1) -like "*-*-*-*-*") { "AzureAD" } elseif ($group.PSObject.Properties['ObjectGUID']) { "ActiveDirectory" } else { "Unknown" })
                    CreatedDateTime             = $(try {if($group.PSObject.Properties['createdDateTime'] -and $group.createdDateTime){(Get-Date $group.createdDateTime).ToString("yyyy-MM-ddTHH:mm:ssZ")}else{$null}} catch {$null})
                    LastUpdated                 = $exportTimestamp
                }
            }
        }
        Export-DataObjectToJson -FilePath (Join-Path $powerAppsOutputPath "powerapps_groups.json") -Data $powerAppsGroups -Depth $jsonDepth
        $metadata.DataCounts.Groups = $powerAppsGroups.Count

        # --- 7. Export Devices Data (powerapps_devices.json) ---
        Write-MandALog "Processing Devices for PowerApps..." -Level "INFO"
        $powerAppsDevices = @()
        if ($Devices.Count -gt 0) {
            $powerAppsDevices = foreach ($device in $Devices) {
                $ownerUPN = ($powerAppsUsers | Where-Object {$_.RegisteredDevices -contains ($device.PSObject.Properties['DeviceId']|Select -First 1) -or $_.RegisteredDevices -contains ($device.PSObject.Properties['DisplayName']|Select -First 1)} | Select-Object -First 1).UPN
                [PSCustomObject]@{
                    DeviceId                    = $(if($device.PSObject.Properties['DeviceId']){$device.DeviceId}else{$null})
                    DeviceName                  = $(if($device.PSObject.Properties['DisplayName']){$device.DisplayName}else{$null})
                    Manufacturer                = $(if($device.PSObject.Properties['Manufacturer']){$device.Manufacturer}else{$null})
                    Model                       = $(if($device.PSObject.Properties['Model']){$device.Model}else{$null})
                    SerialNumber                = $(if($device.PSObject.Properties['SerialNumber']){$device.SerialNumber}else{$null})
                    OperatingSystem             = $(if($device.PSObject.Properties['OperatingSystem']){$device.OperatingSystem}else{$null})
                    OSVersion                   = $(if($device.PSObject.Properties['OSVersion']){$device.OSVersion}else{$null})
                    DeviceType                  = $(if($device.PSObject.Properties['DeviceType']){$device.DeviceType}else{$null})
                    UserUPN                     = $ownerUPN
                    IsManaged                   = $([System.Convert]::ToBoolean($device.IsManaged))
                    IsCompliant                 = $([System.Convert]::ToBoolean($device.IsCompliant))
                    ManagementAgent             = $(if($device.PSObject.Properties['ManagementAgent']){$device.ManagementAgent}else{$null})
                    EnrollmentType              = $(if($device.PSObject.Properties['EnrollmentType']){$device.EnrollmentType}else{$null})
                    ComplianceState             = $(if($device.PSObject.Properties['ComplianceState']){$device.ComplianceState}else{$null})
                    TrustType                   = $(if($device.PSObject.Properties['TrustType']){$device.TrustType}else{$null})
                    LastSyncDateTime            = $(try {if($device.PSObject.Properties['LastSyncDateTime'] -and $device.LastSyncDateTime){(Get-Date $device.LastSyncDateTime).ToString("yyyy-MM-ddTHH:mm:ssZ")}else{$null}} catch {$null})
                    EnrollmentDateTime          = $(try {if($device.PSObject.Properties['EnrollmentDateTime'] -and $device.EnrollmentDateTime){(Get-Date $device.EnrollmentDateTime).ToString("yyyy-MM-ddTHH:mm:ssZ")}else{$null}} catch {$null})
                    LastUpdated                 = $exportTimestamp
                }
            }
        }
        Export-DataObjectToJson -FilePath (Join-Path $powerAppsOutputPath "powerapps_devices.json") -Data $powerAppsDevices -Depth $jsonDepth
        $metadata.DataCounts.Devices = $powerAppsDevices.Count

        # --- 8. Export Relationships Data (powerapps_relationships.json) ---
        Write-MandALog "Processing Relationships for PowerApps..." -Level "INFO"
        $powerAppsRelationships = @{
            UserGroupMemberships = [System.Collections.Generic.List[object]]::new()
            UserDeviceAssociations = [System.Collections.Generic.List[object]]::new()
            UserApplicationAccess  = [System.Collections.Generic.List[object]]::new()
            ManagerDirectReports   = [System.Collections.Generic.List[object]]::new()
        }

        if ($powerAppsUsers.Count -gt 0) {
            foreach ($user in $powerAppsUsers) {
                if ($user.GroupMemberships -is [System.Array] -and $user.GroupMemberships.Count -gt 0) {
                    $user.GroupMemberships | ForEach-Object {
                        $groupNameOrId = $_
                        $matchedGroup = $powerAppsGroups | Where-Object {$_.DisplayName -eq $groupNameOrId -or $_.Mail -eq $groupNameOrId -or $_.GroupId -eq $groupNameOrId} | Select-Object -First 1
                        if ($matchedGroup) {
                            $powerAppsRelationships.UserGroupMemberships.Add(@{ UserId = $user.Id; UserUPN = $user.UPN; GroupId = $matchedGroup.GroupId; GroupName = $matchedGroup.DisplayName })
                        }
                    }
                }
                if ($user.RegisteredDevices -is [System.Array] -and $user.RegisteredDevices.Count -gt 0) {
                    $user.RegisteredDevices | ForEach-Object {
                        $deviceNameOrId = $_
                        $matchedDevice = $powerAppsDevices | Where-Object {$_.DeviceName -eq $deviceNameOrId -or $_.DeviceId -eq $deviceNameOrId} | Select-Object -First 1
                        if ($matchedDevice) {
                            $powerAppsRelationships.UserDeviceAssociations.Add(@{ UserId = $user.Id; UserUPN = $user.UPN; DeviceId = $matchedDevice.DeviceId; DeviceName = $matchedDevice.DeviceName })
                        }
                    }
                }
                if ($user.ApplicationAccess -is [System.Array] -and $user.ApplicationAccess.Count -gt 0) {
                     $user.ApplicationAccess | ForEach-Object {
                        $appNameOrId = $_
                        $matchedApp = $powerAppsApplications | Where-Object {$_.DisplayName -eq $appNameOrId -or $_.ApplicationId -eq $appNameOrId} | Select-Object -First 1
                        if($matchedApp){
                            $powerAppsRelationships.UserApplicationAccess.Add(@{ UserId = $user.Id; UserUPN = $user.UPN; ApplicationId = $matchedApp.ApplicationId; ApplicationName = $matchedApp.DisplayName })
                        }
                     }
                }
                if ($user.ManagerUPN) {
                    $managerUser = $powerAppsUsers | Where-Object {$_.UPN -eq $user.ManagerUPN} | Select-Object -First 1
                    if($managerUser){
                        $powerAppsRelationships.ManagerDirectReports.Add(@{ ManagerId = $managerUser.Id; ManagerUPN = $managerUser.UPN; DirectReportId = $user.Id; DirectReportUPN = $user.UPN })
                    }
                }
            }
        }
        Export-DataObjectToJson -FilePath (Join-Path $powerAppsOutputPath "powerapps_relationships.json") -Data $powerAppsRelationships -Depth $jsonDepth
        $metadata.DataCounts.Relationships = @{ UserGroup = $powerAppsRelationships.UserGroupMemberships.Count; UserDevice = $powerAppsRelationships.UserDeviceAssociations.Count; UserApp = $powerAppsRelationships.UserApplicationAccess.Count; ManagerReport = $powerAppsRelationships.ManagerDirectReports.Count }
        
        # --- 9. Export Summary Statistics (powerapps_summary.json) ---
        Write-MandALog "Generating Summary Statistics for PowerApps..." -Level "INFO"
        $summaryStats = @{
            Overview                = @{ TotalUsers=$powerAppsUsers.Count; TotalWaves=$powerAppsWaves.Count; TotalDepartments=$powerAppsDepartments.Count; TotalApplications=$powerAppsApplications.Count; TotalGroups=$powerAppsGroups.Count; TotalDevices=$powerAppsDevices.Count }
            UserStatistics          = @{ EnabledUsers=($powerAppsUsers|Where-Object {$_.AccountEnabled}).Count; UsersWithMailbox=($powerAppsUsers|Where-Object {$_.HasExchangeMailbox}).Count; AvgComplexity=if($powerAppsUsers.Count -gt 0){[math]::Round(($powerAppsUsers | Measure-Object -Property ComplexityScore -Average).Average, 2)}else{0.0}; AvgReadiness=if($powerAppsUsers.Count -gt 0){[math]::Round(($powerAppsUsers | Measure-Object -Property ReadinessScore -Average).Average, 1)}else{0.0} }
            ComplexityDistribution  = $( $dist = @{}; ($powerAppsUsers | Group-Object MigrationCategory | ForEach-Object { $dist[$_.Name] = $_.Count }); $dist )
            ReadinessDistribution   = $( $dist = @{}; ($powerAppsUsers | Group-Object ReadinessStatus | ForEach-Object { $dist[$_.Name] = $_.Count }); $dist )
            MailboxStatistics       = @{ TotalMailboxSizeGB=[math]::Round(($powerAppsUsers|Measure-Object -Property MailboxSizeGB -Sum).Sum,2); AvgMailboxSizeGB=if($powerAppsUsers.Count -gt 0){[math]::Round(($powerAppsUsers|Measure-Object -Property MailboxSizeGB -Average).Average,2)}else{0.0}; UsersOver10GB=($powerAppsUsers|Where-Object {$_.MailboxSizeGB -gt 10}).Count}
            WaveStatistics          = @{ TotalWaves=$powerAppsWaves.Count; AvgUsersPerWave=if($powerAppsWaves.Count -gt 0){[math]::Round(($powerAppsWaves|Measure-Object -Property TotalUsers -Average).Average,1)}else{0.0}; TotalEstHours=[math]::Round(($powerAppsWaves|Measure-Object -Property EstimatedTimeHours -Sum).Sum,1)}
            DeviceStatistics        = @{ TotalDevices=$powerAppsDevices.Count; ManagedDevices=($powerAppsDevices|Where-Object {$_.IsManaged}).Count; CompliantDevices=($powerAppsDevices|Where-Object {$_.IsCompliant}).Count; WindowsDevices=($powerAppsDevices|Where-Object {$_.OperatingSystem -like "*Windows*"}).Count }
        }
        Export-DataObjectToJson -FilePath (Join-Path $powerAppsOutputPath "powerapps_summary.json") -Data $summaryStats -Depth $jsonDepth
        
        # --- 10. Export Metadata (powerapps_metadata.json) ---
        Export-DataObjectToJson -FilePath (Join-Path $powerAppsOutputPath "powerapps_metadata.json") -Data $metadata -Depth $jsonDepth

        # --- 11. Create Index File (powerapps_index.json) ---
        Write-MandALog "Creating PowerApp index file..." -Level "INFO"
        $indexData = @{
            AppName         = "M&A Migration Dashboard"
            Version         = $Configuration.metadata.version
            DataVersion     = $exportTimestamp
            CompanyName     = $Configuration.metadata.companyName
            Files           = @(
                @{ Name = "Companies"; File = "powerapps_companies.json"; RecordCount = $metadata.DataCounts.Companies }
                @{ Name = "Users"; File = "powerapps_users.json"; RecordCount = $metadata.DataCounts.Users }
                @{ Name = "Waves"; File = "powerapps_waves.json"; RecordCount = $metadata.DataCounts.Waves }
                @{ Name = "Departments"; File = "powerapps_departments.json"; RecordCount = $metadata.DataCounts.Departments }
                @{ Name = "Applications"; File = "powerapps_applications.json"; RecordCount = $metadata.DataCounts.Applications }
                @{ Name = "Groups"; File = "powerapps_groups.json"; RecordCount = $metadata.DataCounts.Groups }
                @{ Name = "Devices"; File = "powerapps_devices.json"; RecordCount = $metadata.DataCounts.Devices }
                @{ Name = "Relationships"; File = "powerapps_relationships.json"; RecordCount = "Multiple Tables" }
                @{ Name = "Summary"; File = "powerapps_summary.json"; RecordCount = "Aggregated Statistics" }
                @{ Name = "Metadata"; File = "powerapps_metadata.json"; RecordCount = "Single Record" }
            )
            Instructions = @"
To use this data in PowerApps:
1. Upload all JSON files from the '$($powerAppsOutputPath -replace '\\', '/')' directory to a data source accessible by PowerApps (e.g., SharePoint Document Library, Azure Blob Storage).
2. In your PowerApp's OnStart property, use a Timer or concurrent functions to load each JSON file's content.
3. Parse the JSON content using the ParseJSON() function. Note: For complex nested arrays, you might need to iterate and create collections for each sub-table.
4. Store the parsed data into PowerApps collections for app-wide access and performance.
5. Use the 'powerapps_index.json' file to verify that all expected data files are available and to understand their record counts.
"@
        }
        Export-DataObjectToJson -FilePath (Join-Path $powerAppsOutputPath "powerapps_index.json") -Data $indexData -Depth $jsonDepth
        
        Write-MandALog "PowerApps Export Process Completed Successfully. Output directory: $powerAppsOutputPath" -Level "SUCCESS"
        return $true
        
    } catch { # Catch for the main try block
        Write-MandALog "CRITICAL Error during PowerApps Export: $($_.Exception.Message)" -Level "CRITICAL"
        Write-MandALog "Stack Trace: $($_.ScriptStackTrace)" -Level "DEBUG"
        return $false
    }
}

Export-ModuleMember -Function Export-ForPowerApps

Write-MandALog "Enhanced PowerAppsExporter.psm1 (v2.1.1) module loaded." -Level "DEBUG"