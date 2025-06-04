#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - User Profile Builder Module
.DESCRIPTION
    This module is responsible for building comprehensive user profiles from aggregated data
    and for measuring migration complexity and readiness for each user.
.NOTES
    Version: 1.2.1 (Corrected context access at module scope)
    Author: Gemini
#>

[CmdletBinding()]
param()

# Access context information provided by the orchestrator during module import
# $global:_MandALoadingContext is set by the orchestrator's Import-ModuleWithManifest function.

if ($null -eq $global:_MandALoadingContext -or $null -eq $global:_MandALoadingContext.Paths -or $null -eq $global:_MandALoadingContext.Config) {
    throw "UserProfileBuilder: Critical loading context (_MandALoadingContext, its Paths, or its Config) is not available. Module cannot initialize."
}

# Use the loading context to get necessary paths and configuration
# Note: It's generally better practice for module-scope code to only define functions 
# and constants, and for functions to receive necessary context via parameters.
# However, to fix the immediate issue, we'll use the global loading context here.

$ModuleScope_ContextPaths = $global:_MandALoadingContext.Paths
$ModuleScope_Configuration = $global:_MandALoadingContext.Config

if ($null -eq $ModuleScope_ContextPaths -or -not $ModuleScope_ContextPaths.ContainsKey('RawDataOutput')) {
    throw "UserProfileBuilder: RawDataOutput path is missing in the loading context."
}
$ModuleScope_RawDataOutputPath = $ModuleScope_ContextPaths.RawDataOutput

# This variable can be used by functions within this module if they don't take paths as parameters
# For example, if Write-MandALog is called from within this module scope (not advisable)
# $outputPath = $ModuleScope_RawDataOutputPath 

# Example of safely creating a directory if needed, though this kind of logic
# is often better handled by the orchestrator or a dedicated setup script.
if (-not (Test-Path $ModuleScope_RawDataOutputPath)) {
    try {
        New-Item -Path $ModuleScope_RawDataOutputPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
        # Using Write-Host here as Write-MandALog might not be fully initialized itself 
        # if EnhancedLogging.psm1 relies on other context parts not yet set.
        Write-Host "[UserProfileBuilder INFO] Created directory: $ModuleScope_RawDataOutputPath" 
    } catch {
        Write-Warning "UserProfileBuilder: Failed to create directory $ModuleScope_RawDataOutputPath. Error: $($_.Exception.Message)"
    }
}


function Convert-MailboxSizeToMB {
    param([string]$SizeString)
    
    if ([string]::IsNullOrWhiteSpace($SizeString)) {
        return 0
    }
    
    try {
        # Parse Exchange mailbox size format (e.g., "1.5 GB (1,610,612,736 bytes)")
        if ($SizeString -match '(\d+\.?\d*)\s*(KB|MB|GB|TB)') {
            $size = [double]$matches[1]
            $unit = $matches[2].ToUpper()
            
            switch ($unit) {
                "KB" { return $size / 1024 }
                "MB" { return $size }
                "GB" { return $size * 1024 }
                "TB" { return $size * 1024 * 1024 }
                default { return 0 }
            }
        }
        
        # Try to extract bytes value if available
        if ($SizeString -match '\(([0-9,]+)\s*bytes\)') {
            $bytesString = $matches[1] -replace ',', ''
            $bytes = [long]$bytesString
            return [math]::Round($bytes / 1MB, 2) # Convert to MB and round
        }
        
        return 0
        
    } catch {
        # If Write-MandALog is available and configured, use it. Otherwise, Write-Warning.
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog "Error parsing mailbox size '$SizeString': $($_.Exception.Message)" -Level "DEBUG"
        } else {
            Write-Warning "Error parsing mailbox size '$SizeString': $($_.Exception.Message)"
        }
        return 0
    }
}

function Get-Percentile {
    param(
        [array]$Values,
        [int]$Percentile
    )
    
    if ($null -eq $Values -or $Values.Count -eq 0) { return 0 }
    
    $SortedValues = $Values | Sort-Object
    # Ensure index is within bounds
    $rawIndex = ($Percentile / 100.0) * $SortedValues.Count 
    $index = [Math]::Min([Math]::Max([Math]::Ceiling($rawIndex) - 1, 0), $SortedValues.Count - 1)
    
    return $SortedValues[$index]
}

# Main function to build user profiles
function New-UserProfiles {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$AggregatedDataStore, # Contains .Users, .Groups, .Devices etc. from DataAggregation

        [Parameter(Mandatory = $true)]
        [hashtable]$RelationshipGraph,   # Contains linked entity information

        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration # This should be the $script:Context.Config passed from Orchestrator
    )

    # Use Write-MandALog if available, otherwise Write-Host
    $LogFn = if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { Get-Command Write-MandALog } else { Get-Command Write-Host }
    
    $LogFn.Invoke("Starting User Profile Building..." , "INFO") # Adjusted for dynamic logger
    $userProfiles = [System.Collections.Generic.List[object]]::new()

    $allAggregatedUsers = @()
    if ($AggregatedDataStore.ContainsKey("Users") -and ($AggregatedDataStore.Users -is [System.Collections.IList])) {
        $allAggregatedUsers = $AggregatedDataStore.Users
    }
    
    if ($allAggregatedUsers.Count -eq 0) {
        $LogFn.Invoke("No users found in AggregatedDataStore.Users. Cannot build profiles.", "WARN")
        return $userProfiles 
    }

    $LogFn.Invoke("Processing $($allAggregatedUsers.Count) user entries from aggregated data.", "INFO")
    
    $processedCount = 0
    foreach ($rawUser in $allAggregatedUsers) {
        $processedCount++
        if (Get-Command Update-Progress -ErrorAction SilentlyContinue) {
            Update-Progress -Activity "Building User Profiles" -Status "User $processedCount of $($allAggregatedUsers.Count)" -PercentComplete (($processedCount / $allAggregatedUsers.Count) * 100)
        }

        $userProfile = [PSCustomObject]@{
            UserPrincipalName = $rawUser.UserPrincipalName
            SamAccountName    = $rawUser.SamAccountName
            DisplayName       = $rawUser.DisplayName
            GraphId           = $rawUser.GraphId 
            GivenName         = $rawUser.GivenName
            Surname           = $rawUser.Surname
            Mail              = $rawUser.Mail
            Department        = $rawUser.Department
            Title             = $rawUser.Title 
            Company           = $rawUser.Company 
            Office            = $rawUser.Office 
            Manager           = $rawUser.Manager 
            Enabled           = $rawUser.Enabled 
            AccountCreated    = $rawUser.AccountCreated 
            LastLogon         = $rawUser.LastLogon 
            PasswordLastSet   = $rawUser.PasswordLastSet
            HasADAccount      = if($rawUser.PSObject.Properties["HasADAccount"]){$rawUser.HasADAccount}else{$false}
            HasGraphAccount   = if($rawUser.PSObject.Properties["HasGraphAccount"]){$rawUser.HasGraphAccount}else{$false}
            HasExchangeMailbox= if($rawUser.PSObject.Properties["HasExchangeMailbox"]){$rawUser.HasExchangeMailbox}else{$false}
            AssignedLicenses  = $rawUser.AssignedLicenses 
            LicenseCount      = if ($rawUser.PSObject.Properties["AssignedLicenses"] -and $rawUser.AssignedLicenses) { 
                                    if ($rawUser.AssignedLicenses -is [array]) { $rawUser.AssignedLicenses.Count }
                                    elseif ($rawUser.AssignedLicenses -is [string]) { ($rawUser.AssignedLicenses -split ';').Where({-not [string]::IsNullOrWhiteSpace($_)}).Count } 
                                    else { 0 }
                                } else { 0 }
            MailboxType       = $rawUser.MailboxType
            MailboxSize       = $rawUser.MailboxSize 
            MailboxSizeMB     = Convert-MailboxSizeToMB -SizeString $rawUser.MailboxSize
            ComplexityFactors = @()
            ComplexityScore   = 0
            MigrationCategory = "Not Assessed"
            MigrationWave     = $null
            MigrationPriority = "Medium" 
            EstimatedMigrationTime = 0
            RiskFactors       = @() 
            RiskLevel         = "Low"   
            ReadinessScore    = 0
            ReadinessStatus   = "Not Assessed"
            BlockingIssues    = @()
            DirectReportsCount = 0
            GroupMembershipCount = 0
            ApplicationAccessCount = 0
            OwnedObjectsCount = 0
            Notes             = ""
            GroupMembershipsText = "" 
            ApplicationAssignmentsText = ""
            OwnedApplicationsText = ""
            OwnedServicePrincipalsText = ""
            OwnedGroupsText = ""
            RegisteredDevicesText = ""
        }
        
        $currentUserIdForGraph = $userProfile.GraphId 
        if ([string]::IsNullOrWhiteSpace($currentUserIdForGraph)) { $currentUserIdForGraph = $userProfile.UserPrincipalName }

        if (($null -ne $RelationshipGraph) -and (-not [string]::IsNullOrWhiteSpace($currentUserIdForGraph))) {
            if ($RelationshipGraph.UserToGroupMembership.ContainsKey($currentUserIdForGraph)) {
                $userProfile.GroupMembershipsText = $RelationshipGraph.UserToGroupMembership[$currentUserIdForGraph] -join "; "
                $userProfile.GroupMembershipCount = $RelationshipGraph.UserToGroupMembership[$currentUserIdForGraph].Count
            }
            if ($RelationshipGraph.UserToAppRoleAssignment.ContainsKey($currentUserIdForGraph)) {
                $appAssignmentsDetails = $RelationshipGraph.UserToAppRoleAssignment[$currentUserIdForGraph] | ForEach-Object { "$($_.ResourceDisplayName) ($($_.AppRoleDisplayName))" }
                $userProfile.ApplicationAssignmentsText = $appAssignmentsDetails -join "; "
                $userProfile.ApplicationAccessCount = $RelationshipGraph.UserToAppRoleAssignment[$currentUserIdForGraph].Count
            }
            if ($RelationshipGraph.UserToOwnedObject.ContainsKey($currentUserIdForGraph)) {
                $ownedObjects = $RelationshipGraph.UserToOwnedObject[$currentUserIdForGraph]
                $userProfile.OwnedObjectsCount = $ownedObjects.Count
                $userProfile.OwnedApplicationsText = $ownedObjects | Where-Object {$_.ObjectType -eq "Application"} | ForEach-Object {$_.DisplayName} | Join-String -Separator "; "
                $userProfile.OwnedServicePrincipalsText = $ownedObjects | Where-Object {$_.ObjectType -eq "ServicePrincipal"} | ForEach-Object {$_.DisplayName} | Join-String -Separator "; "
                $userProfile.OwnedGroupsText = $ownedObjects | Where-Object {$_.ObjectType -eq "Group"} | ForEach-Object {$_.DisplayName} | Join-String -Separator "; "
            }
            if ($RelationshipGraph.UserToDeviceLink.ContainsKey($currentUserIdForGraph)) {
                $userProfile.RegisteredDevicesText = $RelationshipGraph.UserToDeviceLink[$currentUserIdForGraph] -join "; "
            }
            if ($RelationshipGraph.ManagerToDirectReport.ContainsKey($userProfile.UserPrincipalName)) { 
                $userProfile.DirectReportsCount = $RelationshipGraph.ManagerToDirectReport[$userProfile.UserPrincipalName].Count
            }
        }
        
        $userProfiles.Add($userProfile)
    }
    if (Get-Command Write-Progress -ErrorAction SilentlyContinue) { Write-Progress -Activity "Building User Profiles" -Completed }

    $LogFn.Invoke("User Profile Building completed. $($userProfiles.Count) profiles created.", "SUCCESS")
    return $userProfiles
}

function Measure-MigrationComplexity {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [System.Collections.IList]$Profiles, 
        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration
    )
    $LogFn = if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { Get-Command Write-MandALog } else { Get-Command Write-Host }
    $LogFn.Invoke("Starting Migration Complexity & Readiness Analysis for $($Profiles.Count) profiles...", "INFO")
    $complexityAnalysisSummary = [System.Collections.Generic.List[object]]::new()

    $thresholds = $Configuration.processing.complexityThresholds
    if ($null -eq $thresholds) {
        $LogFn.Invoke("Complexity thresholds not found in configuration. Using default values: Low=3, Medium=7, High=10.", "WARN")
        $thresholds = @{ low = 3; medium = 7; high = 10 } 
    }

    $processedCount = 0
    foreach ($profile in $Profiles) {
        $processedCount++
        if (Get-Command Update-Progress -ErrorAction SilentlyContinue) {
            Update-Progress -Activity "Analyzing Complexity/Readiness" -Status "Profile $processedCount of $($Profiles.Count)" -PercentComplete (($processedCount / $Profiles.Count) * 100)
        }
        $currentComplexityScore = 0
        $currentComplexityFactors = [System.Collections.Generic.List[string]]::new()
        
        if (-not $profile.Enabled) { $currentComplexityFactors.Add("Disabled Account"); $currentComplexityScore += 1 }
        if ($profile.HasADAccount -and -not $profile.HasGraphAccount) { $currentComplexityFactors.Add("AD Only Account"); $currentComplexityScore += 2 }
        if (-not $profile.HasExchangeMailbox -and $profile.HasGraphAccount) { $currentComplexityFactors.Add("No Exchange Mailbox"); $currentComplexityScore += 1 }
        if ($profile.PSObject.Properties['LicenseCount'] -and $profile.LicenseCount -eq 0) { $currentComplexityFactors.Add("No Licenses Assigned"); $currentComplexityScore += 2 }
        elseif ($profile.PSObject.Properties['LicenseCount'] -and $profile.LicenseCount -gt 3) { $currentComplexityFactors.Add("Multiple Licenses"); $currentComplexityScore += 1 }
        if ($profile.PSObject.Properties['MailboxSizeMB'] -and $profile.MailboxSizeMB -gt 10240) { $currentComplexityFactors.Add("Large Mailbox (>10GB)"); $currentComplexityScore += 3 }
        elseif ($profile.PSObject.Properties['MailboxSizeMB'] -and $profile.MailboxSizeMB -gt 5120) { $currentComplexityFactors.Add("Medium Mailbox (>5GB)"); $currentComplexityScore += 2 }
        if ($profile.AccountCreated) { try { $accountAge = (Get-Date) - [DateTime]$profile.AccountCreated; if ($accountAge.Days -gt 1825) { $currentComplexityFactors.Add("Legacy Account (>5 years)"); $currentComplexityScore += 2 } } catch { $LogFn.Invoke("Could not parse AccountCreated date '$($profile.AccountCreated)' for $($profile.UserPrincipalName)", "DEBUG") } }
        if ($profile.LastLogon) { try { $daysSinceLogon = (Get-Date) - [DateTime]$profile.LastLogon; if ($daysSinceLogon.Days -gt 90) { $currentComplexityFactors.Add("Inactive User (>90 days)"); $currentComplexityScore += 1 } } catch { $LogFn.Invoke("Could not parse LastLogon date '$($profile.LastLogon)' for $($profile.UserPrincipalName)", "DEBUG") } }
        if ([string]::IsNullOrWhiteSpace($profile.Mail)) { $currentComplexityFactors.Add("Missing Email Address"); $currentComplexityScore += 1 }
        if ([string]::IsNullOrWhiteSpace($profile.Department)) { $currentComplexityFactors.Add("Missing Department"); $currentComplexityScore += 1 }
        $profile.ComplexityFactors = $currentComplexityFactors.ToArray()
        $profile.ComplexityScore = $currentComplexityScore
        if ($currentComplexityScore -le $thresholds.low) { $profile.MigrationCategory = "Simple" }
        elseif ($currentComplexityScore -le $thresholds.medium) { $profile.MigrationCategory = "Standard" }
        elseif ($currentComplexityScore -le $thresholds.high) { $profile.MigrationCategory = "Complex" }
        else { $profile.MigrationCategory = "High Risk" }

        $currentReadinessScore = 100
        $currentBlockingIssues = [System.Collections.Generic.List[string]]::new()
        $currentRiskFactors = [System.Collections.Generic.List[string]]::new() 
        if (-not $profile.Enabled) { $currentBlockingIssues.Add("Account is disabled"); $currentReadinessScore -= 50 }
        if (-not $profile.HasGraphAccount) { $currentBlockingIssues.Add("No Azure AD account (or not flagged as such)"); $currentReadinessScore -= 30 }
        if ($profile.PSObject.Properties['LicenseCount'] -and $profile.LicenseCount -eq 0) { $currentRiskFactors.Add("No licenses assigned (Readiness)"); $currentReadinessScore -= 20 }
        if ($profile.PSObject.Properties['MailboxSizeMB'] -and $profile.MailboxSizeMB -gt 10240) { $currentRiskFactors.Add("Large mailbox may require extended migration time (Readiness)"); $currentReadinessScore -= 10 }
        if ($profile.LastLogon) { try { $daysSinceLogon = (Get-Date) - [DateTime]$profile.LastLogon; if ($daysSinceLogon.Days -gt 180) { $currentRiskFactors.Add("User has not logged in recently (180+ days)"); $currentReadinessScore -= 5 } } catch { $LogFn.Invoke("Could not parse LastLogon date for readiness check on $($profile.UserPrincipalName)", "DEBUG") } }
        if ([string]::IsNullOrWhiteSpace($profile.Mail)) { $currentRiskFactors.Add("Missing email address (Readiness)"); $currentReadinessScore -= 10 }
        if ([string]::IsNullOrWhiteSpace($profile.Department)) { $currentRiskFactors.Add("Missing department information (Readiness)"); $currentReadinessScore -= 5 }
        $profile.ReadinessScore = [Math]::Max(0, $currentReadinessScore)
        $profile.ReadinessStatus = switch ($profile.ReadinessScore) { { $_ -ge 90 } { "Ready" }; { $_ -ge 70 } { "Minor Issues" }; { $_ -ge 50 } { "Needs Attention" }; default { "Not Ready" } }
        $profile.BlockingIssues = $currentBlockingIssues.ToArray()
        $profile.RiskFactors = ($profile.ComplexityFactors + $currentRiskFactors.ToArray()) | Select-Object -Unique 
        $profile.RiskLevel = if ($profile.RiskFactors.Count -eq 0) { "Low" } elseif ($profile.RiskFactors.Count -le 2) { "Medium" } else { "High" }
    }
    if (Get-Command Write-Progress -ErrorAction SilentlyContinue) { Write-Progress -Activity "Analyzing Complexity/Readiness" -Completed }

    $LogFn.Invoke("Calculating overall complexity scores and migration priorities...", "INFO")
    $allComplexityScores = $Profiles | ForEach-Object { $_.ComplexityScore } 
    if ($allComplexityScores.Count -gt 0) {
        $p25Complexity = Get-Percentile -Values $allComplexityScores -Percentile 25
        $p75Complexity = Get-Percentile -Values $allComplexityScores -Percentile 75
        foreach ($userProfileToPrioritize in $Profiles) {
            if ($userProfileToPrioritize.ComplexityScore -le $p25Complexity -and $userProfileToPrioritize.ReadinessScore -ge 90) { $userProfileToPrioritize.MigrationPriority = "High" }
            elseif ($userProfileToPrioritize.ComplexityScore -ge $p75Complexity -or $userProfileToPrioritize.ReadinessScore -lt 50) { $userProfileToPrioritize.MigrationPriority = "Low" }
            else { $userProfileToPrioritize.MigrationPriority = "Medium" }
            $baseTime = $Configuration.processing.baseMigrationTimeMinutes | Get-OrElse 30 
            $complexityMultiplier = 1 + ($userProfileToPrioritize.ComplexityScore * ($Configuration.processing.complexityTimeFactor | Get-OrElse 0.1) )
            $sizeMultiplier = 1 + (($userProfileToPrioritize.MailboxSizeMB / 1024) * ($Configuration.processing.mailboxSizeTimeFactorGB | Get-OrElse 0.1) ) 
            $userProfileToPrioritize.EstimatedMigrationTime = [Math]::Round($baseTime * $complexityMultiplier * $sizeMultiplier, 0)
        }
    }
    $totalUsers = $Profiles.Count
    $complexityAnalysisSummary.Add([PSCustomObject]@{ Category = "Overall Statistics"; Metric = "Total Users"; Value = $totalUsers; Percentage = 100 })
    @("Simple", "Standard", "Complex", "High Risk") | ForEach-Object { $categoryName = $_; $count = ($Profiles | Where-Object { $_.MigrationCategory -eq $categoryName }).Count; $complexityAnalysisSummary.Add([PSCustomObject]@{ Category = "Migration Complexity"; Metric = "$categoryName Migrations"; Value = $count; Percentage = if ($totalUsers -gt 0) { [math]::Round(($count / $totalUsers) * 100, 1) } else { 0 }}) }
    @("Ready", "Minor Issues", "Needs Attention", "Not Ready") | ForEach-Object { $statusName = $_; $count = ($Profiles | Where-Object { $_.ReadinessStatus -eq $statusName }).Count; $complexityAnalysisSummary.Add([PSCustomObject]@{ Category = "Migration Readiness"; Metric = $statusName; Value = $count; Percentage = if ($totalUsers -gt 0) { [math]::Round(($count / $totalUsers) * 100, 1) } else { 0 }}) }
    $totalEstimatedTime = ($Profiles | Measure-Object -Property EstimatedMigrationTime -Sum).Sum
    $totalEstimatedTimeHours = if ($totalEstimatedTime) {[math]::Round($totalEstimatedTime / 60, 1)} else {0}
    $averageTimePerUser = if ($totalUsers -gt 0 -and $totalEstimatedTime) { [math]::Round($totalEstimatedTime / $totalUsers, 0) } else { 0 }
    $complexityAnalysisSummary.Add([PSCustomObject]@{ Category = "Time Estimates"; Metric = "Total Estimated Time (hours)"; Value = $totalEstimatedTimeHours; Percentage = $null })
    $complexityAnalysisSummary.Add([PSCustomObject]@{ Category = "Time Estimates"; Metric = "Average Time per User (minutes)"; Value = $averageTimePerUser; Percentage = $null })
    $LogFn.Invoke("Migration Complexity & Readiness Analysis completed.", "SUCCESS")
    return $complexityAnalysisSummary
}

# Helper for Get-OrElse logic if not available as a standard cmdlet/filter
# This should ideally be defined once globally or in a utility module.
# If it's only used here, this placement is fine.
if (-not (Get-Command Get-OrElse -ErrorAction SilentlyContinue)) {
    filter Get-OrElse ($DefaultValue) {
        if ($null -ne $_) { $_ } else { $DefaultValue }
    }
}

Export-ModuleMember -Function New-UserProfiles, Measure-MigrationComplexity, Convert-MailboxSizeToMB, Get-Percentile
