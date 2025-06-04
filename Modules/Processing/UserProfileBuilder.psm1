#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - User Profile Builder Module
.DESCRIPTION
    This module is responsible for building comprehensive user profiles from aggregated data
    and for measuring migration complexity and readiness for each user.
.NOTES
    Version: 1.2.0 (Integrated original functionality with new data contracts)
    Author: Gemini
#>

[CmdletBinding()]
param()
$outputPath = $Context.Paths.RawDataOutput
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
        Write-MandALog "Error parsing mailbox size '$SizeString': $($_.Exception.Message)" -Level "DEBUG"
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
    # For percentile, it's common to take the Nth value. If N is not an integer, interpolation might be used.
    # Simplest is Ceiling(N)-1 for 0-based index. Or Round(N)-1
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
        [hashtable]$Configuration
    )

    Write-MandALog "Starting User Profile Building..." -Level "INFO"
    $userProfiles = [System.Collections.Generic.List[object]]::new()

    # Ensure AggregatedDataStore.Users exists and is a collection
    $allAggregatedUsers = @()
    if ($AggregatedDataStore.ContainsKey("Users") -and ($AggregatedDataStore.Users -is [System.Collections.IList])) {
        $allAggregatedUsers = $AggregatedDataStore.Users
    }
    
    if ($allAggregatedUsers.Count -eq 0) {
        Write-MandALog "No users found in AggregatedDataStore.Users. Cannot build profiles." -Level "WARN"
        return $userProfiles # Return empty list
    }

    Write-MandALog "Processing $($allAggregatedUsers.Count) user entries from aggregated data." -Level "INFO"
    
    $processedCount = 0
    foreach ($rawUser in $allAggregatedUsers) {
        $processedCount++
        Update-Progress -Activity "Building User Profiles" -Status "User $processedCount of $($allAggregatedUsers.Count)" -PercentComplete (($processedCount / $allAggregatedUsers.Count) * 100)

        # Create the base profile by mapping properties from the rawUser object
        # (which comes from $AggregatedDataStore.Users, assumed to be consolidated)
        $userProfile = [PSCustomObject]@{
            # Identity
            UserPrincipalName = $rawUser.UserPrincipalName
            SamAccountName    = $rawUser.SamAccountName
            DisplayName       = $rawUser.DisplayName
            GraphId           = $rawUser.GraphId # Or $rawUser.Id if that's the Graph Object ID
            
            # Personal Information
            GivenName         = $rawUser.GivenName
            Surname           = $rawUser.Surname
            Mail              = $rawUser.Mail
            
            # Organizational Information
            Department        = $rawUser.Department
            Title             = $rawUser.Title # Or JobTitle
            Company           = $rawUser.Company # Or CompanyName
            Office            = $rawUser.Office # Or PhysicalDeliveryOfficeName
            Manager           = $rawUser.Manager # This might be a DN or UPN; needs resolving if a full manager profile is needed
            
            # Account Status
            Enabled           = $rawUser.Enabled # Or AccountEnabled
            AccountCreated    = $rawUser.AccountCreated # Or CreatedDateTime
            LastLogon         = $rawUser.LastLogon # Or LastSignInDateTime
            PasswordLastSet   = $rawUser.PasswordLastSet
            
            # Service Presence (These flags should be set during data aggregation if not directly on rawUser)
            HasADAccount      = if($rawUser.PSObject.Properties["HasADAccount"]){$rawUser.HasADAccount}else{$false}
            HasGraphAccount   = if($rawUser.PSObject.Properties["HasGraphAccount"]){$rawUser.HasGraphAccount}else{$false}
            HasExchangeMailbox= if($rawUser.PSObject.Properties["HasExchangeMailbox"]){$rawUser.HasExchangeMailbox}else{$false}
            
            # Licensing
            AssignedLicenses  = $rawUser.AssignedLicenses # Assuming this is a string or array from aggregation
            LicenseCount      = if ($rawUser.PSObject.Properties["AssignedLicenses"] -and $rawUser.AssignedLicenses) { 
                                    if ($rawUser.AssignedLicenses -is [array]) { $rawUser.AssignedLicenses.Count }
                                    elseif ($rawUser.AssignedLicenses -is [string]) { ($rawUser.AssignedLicenses -split ';').Where({-not [string]::IsNullOrWhiteSpace($_)}).Count } # Count non-empty licenses
                                    else { 0 }
                                } else { 0 }
            
            # Mailbox Information
            MailboxType       = $rawUser.MailboxType
            MailboxSize       = $rawUser.MailboxSize # Raw size string
            MailboxSizeMB     = Convert-MailboxSizeToMB -SizeString $rawUser.MailboxSize
            
            # Fields to be populated by Measure-MigrationComplexity
            ComplexityFactors = @()
            ComplexityScore   = 0
            MigrationCategory = "Not Assessed" # Will be set by Measure-MigrationComplexity
            
            MigrationWave     = $null
            MigrationPriority = "Medium" # Default, will be adjusted
            EstimatedMigrationTime = 0 # Default, will be adjusted
            
            RiskFactors       = @() # Will be populated by Measure-MigrationComplexity (from original Test-MigrationReadiness)
            RiskLevel         = "Low"   # Default, will be adjusted
            
            ReadinessScore    = 0
            ReadinessStatus   = "Not Assessed"
            BlockingIssues    = @()
            
            # Dependencies - These require lookups in AggregatedDataStore and RelationshipGraph
            DirectReportsCount = 0
            GroupMembershipCount = 0
            ApplicationAccessCount = 0
            OwnedObjectsCount = 0
            Notes             = ""
            # For storing names/details from relationships
            GroupMembershipsText = "" # Changed from GroupMemberships to avoid conflict if rawUser has it
            ApplicationAssignmentsText = ""
            OwnedApplicationsText = ""
            OwnedServicePrincipalsText = ""
            OwnedGroupsText = ""
            RegisteredDevicesText = ""
        }
        
        # --- Enrichment using RelationshipGraph and AggregatedDataStore ---
        $currentUserIdForGraph = $userProfile.GraphId # Prefer GraphId for lookups in RelationshipGraph
        if ([string]::IsNullOrWhiteSpace($currentUserIdForGraph)) { $currentUserIdForGraph = $userProfile.UserPrincipalName }

        if (($null -ne $RelationshipGraph) -and (-not [string]::IsNullOrWhiteSpace($currentUserIdForGraph))) {
            # Group Memberships
            if ($RelationshipGraph.UserToGroupMembership.ContainsKey($currentUserIdForGraph)) {
                $userProfile.GroupMembershipsText = $RelationshipGraph.UserToGroupMembership[$currentUserIdForGraph] -join "; "
                $userProfile.GroupMembershipCount = $RelationshipGraph.UserToGroupMembership[$currentUserIdForGraph].Count
            }

            # Application Role Assignments
            if ($RelationshipGraph.UserToAppRoleAssignment.ContainsKey($currentUserIdForGraph)) {
                $appAssignmentsDetails = $RelationshipGraph.UserToAppRoleAssignment[$currentUserIdForGraph] | ForEach-Object { "$($_.ResourceDisplayName) ($($_.AppRoleDisplayName))" }
                $userProfile.ApplicationAssignmentsText = $appAssignmentsDetails -join "; "
                $userProfile.ApplicationAccessCount = $RelationshipGraph.UserToAppRoleAssignment[$currentUserIdForGraph].Count
            }

            # Owned Objects
            if ($RelationshipGraph.UserToOwnedObject.ContainsKey($currentUserIdForGraph)) {
                $ownedObjects = $RelationshipGraph.UserToOwnedObject[$currentUserIdForGraph]
                $userProfile.OwnedObjectsCount = $ownedObjects.Count
                $userProfile.OwnedApplicationsText = $ownedObjects | Where-Object {$_.ObjectType -eq "Application"} | ForEach-Object {$_.DisplayName} | Join-String -Separator "; "
                $userProfile.OwnedServicePrincipalsText = $ownedObjects | Where-Object {$_.ObjectType -eq "ServicePrincipal"} | ForEach-Object {$_.DisplayName} | Join-String -Separator "; "
                $userProfile.OwnedGroupsText = $ownedObjects | Where-Object {$_.ObjectType -eq "Group"} | ForEach-Object {$_.DisplayName} | Join-String -Separator "; "
            }
            
            # Registered Devices
            if ($RelationshipGraph.UserToDeviceLink.ContainsKey($currentUserIdForGraph)) {
                $userProfile.RegisteredDevicesText = $RelationshipGraph.UserToDeviceLink[$currentUserIdForGraph] -join "; "
                # Count could be added if needed
            }

            # Direct Reports (Manager's perspective is in ManagerToDirectReport)
            # To find who reports to this $userProfile, we'd iterate $RelationshipGraph.ManagerToDirectReport
            # This is typically not stored directly on the user's profile but derived.
            # For DirectReportsCount on this user (as a manager):
            if ($RelationshipGraph.ManagerToDirectReport.ContainsKey($userProfile.UserPrincipalName)) { # Assuming ManagerToDirectReport uses UPN as key
                $userProfile.DirectReportsCount = $RelationshipGraph.ManagerToDirectReport[$userProfile.UserPrincipalName].Count
            }
        }
        
        $userProfiles.Add($userProfile)
    }
    Write-Progress -Activity "Building User Profiles" -Completed

    Write-MandALog "User Profile Building completed. $($userProfiles.Count) profiles created." -Level "SUCCESS"
    return $userProfiles
}

# Function to measure migration complexity and readiness for user profiles
function Measure-MigrationComplexity {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [System.Collections.IList]$Profiles, # Expects an array/list of user profile objects from New-UserProfiles

        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration
    )

    Write-MandALog "Starting Migration Complexity & Readiness Analysis for $($Profiles.Count) profiles..." -Level "INFO"
    $complexityAnalysisSummary = [System.Collections.Generic.List[object]]::new() # For the summary report

    $thresholds = $Configuration.processing.complexityThresholds
    if ($null -eq $thresholds) {
        Write-MandALog "Complexity thresholds not found in configuration. Using default values: Low=3, Medium=7, High=10." -Level "WARN"
        $thresholds = @{ low = 3; medium = 7; high = 10 } # Default fallback
    }

    $processedCount = 0
    foreach ($profile in $Profiles) {
        $processedCount++
        Update-Progress -Activity "Analyzing Complexity/Readiness" -Status "Profile $processedCount of $($Profiles.Count)" -PercentComplete (($processedCount / $Profiles.Count) * 100)

        # --- Start: Logic from original Test-UserComplexity ---
        $currentComplexityScore = 0
        $currentComplexityFactors = [System.Collections.Generic.List[string]]::new()
        
        if (-not $profile.Enabled) { $currentComplexityFactors.Add("Disabled Account"); $currentComplexityScore += 1 }
        if ($profile.HasADAccount -and -not $profile.HasGraphAccount) { $currentComplexityFactors.Add("AD Only Account"); $currentComplexityScore += 2 }
        if (-not $profile.HasExchangeMailbox -and $profile.HasGraphAccount) { $currentComplexityFactors.Add("No Exchange Mailbox"); $currentComplexityScore += 1 }
        
        if ($profile.PSObject.Properties['LicenseCount'] -and $profile.LicenseCount -eq 0) { $currentComplexityFactors.Add("No Licenses Assigned"); $currentComplexityScore += 2 }
        elseif ($profile.PSObject.Properties['LicenseCount'] -and $profile.LicenseCount -gt 3) { $currentComplexityFactors.Add("Multiple Licenses"); $currentComplexityScore += 1 }
        
        if ($profile.PSObject.Properties['MailboxSizeMB'] -and $profile.MailboxSizeMB -gt 10240) { $currentComplexityFactors.Add("Large Mailbox (>10GB)"); $currentComplexityScore += 3 }
        elseif ($profile.PSObject.Properties['MailboxSizeMB'] -and $profile.MailboxSizeMB -gt 5120) { $currentComplexityFactors.Add("Medium Mailbox (>5GB)"); $currentComplexityScore += 2 }
        
        if ($profile.AccountCreated) {
            try {
                $accountAge = (Get-Date) - [DateTime]$profile.AccountCreated
                if ($accountAge.Days -gt 1825) { $currentComplexityFactors.Add("Legacy Account (>5 years)"); $currentComplexityScore += 2 }
            } catch { Write-MandALog "Could not parse AccountCreated date '$($profile.AccountCreated)' for $($profile.UserPrincipalName)" -Level "DEBUG" }
        }
        if ($profile.LastLogon) {
            try {
                $daysSinceLogon = (Get-Date) - [DateTime]$profile.LastLogon
                if ($daysSinceLogon.Days -gt 90) { $currentComplexityFactors.Add("Inactive User (>90 days)"); $currentComplexityScore += 1 }
            } catch { Write-MandALog "Could not parse LastLogon date '$($profile.LastLogon)' for $($profile.UserPrincipalName)" -Level "DEBUG" }
        }
        if ([string]::IsNullOrWhiteSpace($profile.Mail)) { $currentComplexityFactors.Add("Missing Email Address"); $currentComplexityScore += 1 }
        if ([string]::IsNullOrWhiteSpace($profile.Department)) { $currentComplexityFactors.Add("Missing Department"); $currentComplexityScore += 1 }
        
        $profile.ComplexityFactors = $currentComplexityFactors.ToArray()
        $profile.ComplexityScore = $currentComplexityScore
        
        if ($currentComplexityScore -le $thresholds.low) { $profile.MigrationCategory = "Simple" }
        elseif ($currentComplexityScore -le $thresholds.medium) { $profile.MigrationCategory = "Standard" }
        elseif ($currentComplexityScore -le $thresholds.high) { $profile.MigrationCategory = "Complex" }
        else { $profile.MigrationCategory = "High Risk" }
        # --- End: Logic from original Test-UserComplexity ---

        # --- Start: Logic from original Test-MigrationReadiness ---
        $currentReadinessScore = 100
        $currentBlockingIssues = [System.Collections.Generic.List[string]]::new()
        $currentRiskFactors = [System.Collections.Generic.List[string]]::new() 
        
        if (-not $profile.Enabled) { $currentBlockingIssues.Add("Account is disabled"); $currentReadinessScore -= 50 }
        if (-not $profile.HasGraphAccount) { $currentBlockingIssues.Add("No Azure AD account (or not flagged as such)"); $currentReadinessScore -= 30 }
        if ($profile.PSObject.Properties['LicenseCount'] -and $profile.LicenseCount -eq 0) { $currentRiskFactors.Add("No licenses assigned (Readiness)"); $currentReadinessScore -= 20 }
        if ($profile.PSObject.Properties['MailboxSizeMB'] -and $profile.MailboxSizeMB -gt 10240) { $currentRiskFactors.Add("Large mailbox may require extended migration time (Readiness)"); $currentReadinessScore -= 10 }
        
        if ($profile.LastLogon) {
            try {
                $daysSinceLogon = (Get-Date) - [DateTime]$profile.LastLogon
                if ($daysSinceLogon.Days -gt 180) { $currentRiskFactors.Add("User has not logged in recently (180+ days)"); $currentReadinessScore -= 5 }
            } catch { Write-MandALog "Could not parse LastLogon date for readiness check on $($profile.UserPrincipalName)" -Level "DEBUG" }
        }
        if ([string]::IsNullOrWhiteSpace($profile.Mail)) { $currentRiskFactors.Add("Missing email address (Readiness)"); $currentReadinessScore -= 10 }
        if ([string]::IsNullOrWhiteSpace($profile.Department)) { $currentRiskFactors.Add("Missing department information (Readiness)"); $currentReadinessScore -= 5 }
        
        $profile.ReadinessScore = [Math]::Max(0, $currentReadinessScore)
        $profile.ReadinessStatus = switch ($profile.ReadinessScore) {
            { $_ -ge 90 } { "Ready" }
            { $_ -ge 70 } { "Minor Issues" }
            { $_ -ge 50 } { "Needs Attention" }
            default { "Not Ready" }
        }
        $profile.BlockingIssues = $currentBlockingIssues.ToArray()
        # Merge risk factors from complexity and readiness, ensuring uniqueness
        $profile.RiskFactors = ($profile.ComplexityFactors + $currentRiskFactors.ToArray()) | Select-Object -Unique 
        $profile.RiskLevel = if ($profile.RiskFactors.Count -eq 0) { "Low" } 
                             elseif ($profile.RiskFactors.Count -le 2) { "Medium" } 
                             else { "High" }
        # --- End: Logic from original Test-MigrationReadiness ---
    }
    Write-Progress -Activity "Analyzing Complexity/Readiness" -Completed

    # --- Start: Logic from original Measure-ComplexityScores (Statistical part & Time Estimation) ---
    Write-MandALog "Calculating overall complexity scores and migration priorities..." -Level "INFO"
    $allComplexityScores = $Profiles | ForEach-Object { $_.ComplexityScore } 
    
    if ($allComplexityScores.Count -gt 0) {
        $p25Complexity = Get-Percentile -Values $allComplexityScores -Percentile 25
        $p75Complexity = Get-Percentile -Values $allComplexityScores -Percentile 75
        
        foreach ($userProfileToPrioritize in $Profiles) {
            if ($userProfileToPrioritize.ComplexityScore -le $p25Complexity -and $userProfileToPrioritize.ReadinessScore -ge 90) {
                $userProfileToPrioritize.MigrationPriority = "High"
            } elseif ($userProfileToPrioritize.ComplexityScore -ge $p75Complexity -or $userProfileToPrioritize.ReadinessScore -lt 50) {
                $userProfileToPrioritize.MigrationPriority = "Low"
            } else {
                $userProfileToPrioritize.MigrationPriority = "Medium" # Default
            }
            
            $baseTime = $Configuration.processing.baseMigrationTimeMinutes | Get-OrElse 30 # Example: Get from config or default
            $complexityMultiplier = 1 + ($userProfileToPrioritize.ComplexityScore * ($Configuration.processing.complexityTimeFactor | Get-OrElse 0.1) )
            $sizeMultiplier = 1 + (($userProfileToPrioritize.MailboxSizeMB / 1024) * ($Configuration.processing.mailboxSizeTimeFactorGB | Get-OrElse 0.1) ) # 10% per GB
            $userProfileToPrioritize.EstimatedMigrationTime = [Math]::Round($baseTime * $complexityMultiplier * $sizeMultiplier, 0)
        }
    }
    # --- End: Logic from original Measure-ComplexityScores ---

    # Build the summary analysis for returning (as expected by orchestrator)
    $totalUsers = $Profiles.Count
    $complexityAnalysisSummary.Add([PSCustomObject]@{ Category = "Overall Statistics"; Metric = "Total Users"; Value = $totalUsers; Percentage = 100 })
    @("Simple", "Standard", "Complex", "High Risk") | ForEach-Object {
        $categoryName = $_
        $count = ($Profiles | Where-Object { $_.MigrationCategory -eq $categoryName }).Count
        $complexityAnalysisSummary.Add([PSCustomObject]@{
            Category   = "Migration Complexity"
            Metric     = "$categoryName Migrations"
            Value      = $count
            Percentage = if ($totalUsers -gt 0) { [math]::Round(($count / $totalUsers) * 100, 1) } else { 0 }
        })
    }
    @("Ready", "Minor Issues", "Needs Attention", "Not Ready") | ForEach-Object {
        $statusName = $_
        $count = ($Profiles | Where-Object { $_.ReadinessStatus -eq $statusName }).Count
        $complexityAnalysisSummary.Add([PSCustomObject]@{
            Category   = "Migration Readiness"
            Metric     = $statusName
            Value      = $count
            Percentage = if ($totalUsers -gt 0) { [math]::Round(($count / $totalUsers) * 100, 1) } else { 0 }
        })
    }
    $totalEstimatedTime = ($Profiles | Measure-Object -Property EstimatedMigrationTime -Sum).Sum
    $totalEstimatedTimeHours = if ($totalEstimatedTime) {[math]::Round($totalEstimatedTime / 60, 1)} else {0}
    $averageTimePerUser = if ($totalUsers -gt 0 -and $totalEstimatedTime) { [math]::Round($totalEstimatedTime / $totalUsers, 0) } else { 0 }

    $complexityAnalysisSummary.Add([PSCustomObject]@{ Category = "Time Estimates"; Metric = "Total Estimated Time (hours)"; Value = $totalEstimatedTimeHours; Percentage = $null })
    $complexityAnalysisSummary.Add([PSCustomObject]@{ Category = "Time Estimates"; Metric = "Average Time per User (minutes)"; Value = $averageTimePerUser; Percentage = $null })

    Write-MandALog "Migration Complexity & Readiness Analysis completed." -Level "SUCCESS"
    return $complexityAnalysisSummary
}

# Helper for Get-OrElse logic if not available as a standard cmdlet/filter
filter Get-OrElse ($DefaultValue) {
    if ($null -ne $_) { $_ } else { $DefaultValue }
}

Export-ModuleMember -Function New-UserProfiles, Measure-MigrationComplexity, Convert-MailboxSizeToMB, Get-Percentile
