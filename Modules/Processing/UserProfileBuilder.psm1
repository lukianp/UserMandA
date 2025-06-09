# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    M&A Discovery Suite - User Profile Builder Module
.DESCRIPTION
    This module is responsible for building comprehensive user profiles from aggregated data
    and for measuring migration complexity and readiness for each user.
.NOTES
    Version: 1.2.2 (Syntax Corrected)
    Author: Gemini
#>

[CmdletBinding()]
param()

#-----------------------------------------------------------------------
#                Context and Safe Execution Functions
# These functions are included to ensure the module can operate robustly.
# Ideally, they would be inherited from a single base module.
#-----------------------------------------------------------------------

# Module-scope context variable
$script:ModuleContext = $null

# Lazy initialization function to get the global context
function Get-ModuleContext {
    if ($null -eq $script:ModuleContext) {
        if ($null -ne $global:MandA) {
            $script:ModuleContext = $global:MandA
        } else {
            throw "Module context not available. This module must be run from the M&A Discovery Suite orchestrator."
        }
    }
    return $script:ModuleContext
}

# Wrapper for safe execution of script blocks
function Invoke-SafeModuleExecution {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,

        [Parameter(Mandatory=$true)]
        [string]$ModuleName,

        [Parameter(Mandatory=$false)]
        $Context
    )

    $result = @{
        Success   = $false
        Data      = $null
        ErrorInfo = $null
        Duration  = $null
    }

    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    try {
        # Validate global context
        if (-not $global:MandA -or -not $global:MandA.Initialized) {
            throw "Global M&A context not initialized"
        }

        # Execute the module function
        $result.Data = & $ScriptBlock
        $result.Success = $true
    }
    catch {
        $result.ErrorInfo = @{
            Message        = $_.Exception.Message
            Type           = $_.Exception.GetType().FullName
            StackTrace     = $_.ScriptStackTrace
            InnerException = if ($_.Exception.InnerException) { $_.Exception.InnerException.Message } else { $null }
        }

        # Log to both file and console
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "[$ModuleName] Error: $($_.Exception.Message)" -Level "ERROR" -Component $ModuleName -Context $Context
        }
        else {
            Write-Host "[$ModuleName] Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    finally {
        $stopwatch.Stop()
        $result.Duration = $stopwatch.Elapsed
    }

    return $result
}

#-----------------------------------------------------------------------
#                          Helper Functions
#-----------------------------------------------------------------------

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
                "KB"    { return $size / 1024 }
                "MB"    { return $size }
                "GB"    { return $size * 1024 }
                "TB"    { return $size * 1024 * 1024 }
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
    }
    catch {
        # If Write-MandALog is available and configured, use it. Otherwise, Write-Warning.
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "Error parsing mailbox size '$SizeString': $($_.Exception.Message)" -Level "DEBUG"
        }
        else {
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

    try {
        $SortedValues = $Values | Sort-Object
        # Ensure index is within bounds
        $rawIndex = ($Percentile / 100.0) * $SortedValues.Count
        $index = [Math]::Min([Math]::Max([Math]::Ceiling($rawIndex) - 1, 0), $SortedValues.Count - 1)

        return $SortedValues[$index]
    }
    catch {
        Write-MandALog -Message "Error in function 'Get-Percentile': $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

# Helper for Get-OrElse logic if not available as a standard cmdlet/filter
if (-not (Get-Command Get-OrElse -ErrorAction SilentlyContinue)) {
    filter Get-OrElse ($DefaultValue) {
        if ($null -ne $_) { $_ } else { $DefaultValue }
    }
}

#-----------------------------------------------------------------------
#                          Main Module Functions
#-----------------------------------------------------------------------

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

    try {
        # Use Write-MandALog if available, otherwise Write-Host
        $LogFn = if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { ${function:Write-MandALog} } else { ${function:Write-Host} }
        & $LogFn -Message "Starting User Profile Building..." -Level "INFO"

        $userProfiles = [System.Collections.Generic.List[object]]::new()

        $allAggregatedUsers = @()
        if ($AggregatedDataStore.ContainsKey("Users") -and ($AggregatedDataStore.Users -is [System.Collections.IList])) {
            $allAggregatedUsers = $AggregatedDataStore.Users
        }

        if ($allAggregatedUsers.Count -eq 0) {
            & $LogFn -Message "No users found in AggregatedDataStore.Users. Cannot build profiles." -Level "WARN"
            return $userProfiles
        }

        & $LogFn -Message "Processing $($allAggregatedUsers.Count) user entries from aggregated data." -Level "INFO"

        $processedCount = 0
        foreach ($rawUser in $allAggregatedUsers) {
            $processedCount++
            if (Get-Command Update-Progress -ErrorAction SilentlyContinue) {
                Update-Progress -Activity "Building User Profiles" -Status "User $processedCount of $($allAggregatedUsers.Count)" -PercentComplete (($processedCount / $allAggregatedUsers.Count) * 100)
            }

            $userProfile = [PSCustomObject]@{
                UserPrincipalName          = $rawUser.UserPrincipalName
                SamAccountName             = $rawUser.SamAccountName
                DisplayName                = $rawUser.DisplayName
                GraphId                    = $rawUser.GraphId
                GivenName                  = $rawUser.GivenName
                Surname                    = $rawUser.Surname
                Mail                       = $rawUser.Mail
                Department                 = $rawUser.Department
                Title                      = $rawUser.Title
                Company                    = $rawUser.Company
                Office                     = $rawUser.Office
                Manager                    = $rawUser.Manager
                Enabled                    = $rawUser.Enabled
                AccountCreated             = $rawUser.AccountCreated
                LastLogon                  = $rawUser.LastLogon
                PasswordLastSet            = $rawUser.PasswordLastSet
                HasADAccount               = if ($rawUser.PSObject.Properties["HasADAccount"]){$rawUser.HasADAccount }else {$false }
                HasGraphAccount            = if ($rawUser.PSObject.Properties["HasGraphAccount"]){$rawUser.HasGraphAccount }else {$false }
                HasExchangeMailbox         = if ($rawUser.PSObject.Properties["HasExchangeMailbox"]){$rawUser.HasExchangeMailbox }else {$false }
                AssignedLicenses           = $rawUser.AssignedLicenses
                LicenseCount               = if ($rawUser.PSObject.Properties["AssignedLicenses"] -and $rawUser.AssignedLicenses) {
                                               if ($rawUser.AssignedLicenses -is [array]) { $rawUser.AssignedLicenses.Count }
                                               elseif ($rawUser.AssignedLicenses -is [string]) { ($rawUser.AssignedLicenses -split ';') | Where-Object {-not [string]::IsNullOrWhiteSpace($_) }.Count }
                                               else { 0 }
                                           } else { 0 }
                MailboxType                = $rawUser.MailboxType
                MailboxSize                = $rawUser.MailboxSize
                MailboxSizeMB              = Convert-MailboxSizeToMB -SizeString $rawUser.MailboxSize
                ComplexityFactors          = @()
                ComplexityScore            = 0
                MigrationCategory          = "Not Assessed"
                MigrationWave              = $null
                MigrationPriority          = "Medium"
                EstimatedMigrationTime     = 0
                RiskFactors                = @()
                RiskLevel                  = "Low"
                ReadinessScore             = 0
                ReadinessStatus            = "Not Assessed"
                BlockingIssues             = @()
                DirectReportsCount         = 0
                GroupMembershipCount       = 0
                ApplicationAccessCount     = 0
                OwnedObjectsCount          = 0
                Notes                      = ""
                GroupMembershipsText       = ""
                ApplicationAssignmentsText = ""
                OwnedApplicationsText      = ""
                OwnedServicePrincipalsText = ""
                OwnedGroupsText            = ""
                RegisteredDevicesText      = ""
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
                    $userProfile.OwnedApplicationsText = ($ownedObjects | Where-Object {$_.ObjectType -eq "Application" } | ForEach-Object {$_.DisplayName } ) -join "; "
                    $userProfile.OwnedServicePrincipalsText = ($ownedObjects | Where-Object {$_.ObjectType -eq "ServicePrincipal" } | ForEach-Object {$_.DisplayName } ) -join "; "
                    $userProfile.OwnedGroupsText = ($ownedObjects | Where-Object {$_.ObjectType -eq "Group" } | ForEach-Object {$_.DisplayName } ) -join "; "
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

        & $LogFn -Message "User Profile Building completed. $($userProfiles.Count) profiles created." -Level "SUCCESS"
        return $userProfiles
    }
    catch {
        Write-MandALog -Message "Error in function 'New-UserProfiles': $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}


function Measure-MigrationComplexity {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [System.Collections.IList]$Profiles,
        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration
    )
    
    $LogFn = if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { ${function:Write-MandALog} } else { ${function:Write-Host} }
    & $LogFn -Message "Starting Migration Complexity & Readiness Analysis for $($Profiles.Count) profiles..." -Level "INFO"

    $complexityAnalysisSummary = [System.Collections.Generic.List[object]]::new()

    $thresholds = $Configuration.processing.complexityThresholds
    if ($null -eq $thresholds) {
        & $LogFn -Message "Complexity thresholds not found in configuration. Using default values: Low=3, Medium=7, High=10." -Level "WARN"
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
        
        try {
            if ($profile.AccountCreated) {
                $accountAge = (Get-Date) - [DateTime]$profile.AccountCreated
                if ($accountAge.Days -gt 1825) { $currentComplexityFactors.Add("Legacy Account (>5 years)"); $currentComplexityScore += 2 }
            }
        } catch { & $LogFn -Message "Could not parse AccountCreated date '$($profile.AccountCreated)' for $($profile.UserPrincipalName)" -Level "DEBUG" }
        
        try {
            if ($profile.LastLogon) {
                $daysSinceLogon = (Get-Date) - [DateTime]$profile.LastLogon
                if ($daysSinceLogon.Days -gt 90) { $currentComplexityFactors.Add("Inactive User (>90 days)"); $currentComplexityScore += 1 }
            }
        } catch { & $LogFn -Message "Could not parse LastLogon date '$($profile.LastLogon)' for $($profile.UserPrincipalName)" -Level "DEBUG" }
        
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
        
        try {
            if ($profile.LastLogon) {
                $daysSinceLogon = (Get-Date) - [DateTime]$profile.LastLogon
                if ($daysSinceLogon.Days -gt 180) { $currentRiskFactors.Add("User has not logged in recently (180+ days)"); $currentReadinessScore -= 5 }
            }
        } catch { & $LogFn -Message "Could not parse LastLogon date for readiness check on $($profile.UserPrincipalName)" -Level "DEBUG" }
        
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
        $profile.RiskFactors = ($profile.ComplexityFactors + $currentRiskFactors.ToArray()) | Select-Object -Unique
        $profile.RiskLevel = if ($profile.RiskFactors.Count -eq 0) { "Low" } elseif ($profile.RiskFactors.Count -le 2) { "Medium" } else { "High" }
    }
    if (Get-Command Write-Progress -ErrorAction SilentlyContinue) { Write-Progress -Activity "Analyzing Complexity/Readiness" -Completed }

    & $LogFn -Message "Calculating overall complexity scores and migration priorities..." -Level "INFO"
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
    @("Simple", "Standard", "Complex", "High Risk") | ForEach-Object {
        $categoryName = $_
        $count = ($Profiles | Where-Object { $_.MigrationCategory -eq $categoryName }).Count
        $complexityAnalysisSummary.Add([PSCustomObject]@{ Category = "Migration Complexity"; Metric = "$categoryName Migrations"; Value = $count; Percentage = if ($totalUsers -gt 0) { [math]::Round(($count / $totalUsers) * 100, 1) } else { 0 }})
    }
    @("Ready", "Minor Issues", "Needs Attention", "Not Ready") | ForEach-Object {
        $statusName = $_
        $count = ($Profiles | Where-Object { $_.ReadinessStatus -eq $statusName }).Count
        $complexityAnalysisSummary.Add([PSCustomObject]@{ Category = "Migration Readiness"; Metric = $statusName; Value = $count; Percentage = if ($totalUsers -gt 0) { [math]::Round(($count / $totalUsers) * 100, 1) } else { 0 }})
    }

    $totalEstimatedTime = ($Profiles | Measure-Object -Property EstimatedMigrationTime -Sum).Sum
    $totalEstimatedTimeHours = if ($totalEstimatedTime) {[math]::Round($totalEstimatedTime / 60, 1) } else {0 }
    $averageTimePerUser = if ($totalUsers -gt 0 -and $totalEstimatedTime) { [math]::Round($totalEstimatedTime / $totalUsers, 0) } else { 0 }

    $complexityAnalysisSummary.Add([PSCustomObject]@{ Category = "Time Estimates"; Metric = "Total Estimated Time (hours)"; Value = $totalEstimatedTimeHours; Percentage = $null })
    $complexityAnalysisSummary.Add([PSCustomObject]@{ Category = "Time Estimates"; Metric = "Average Time per User (minutes)"; Value = $averageTimePerUser; Percentage = $null })

    & $LogFn -Message "Migration Complexity & Readiness Analysis completed." -Level "SUCCESS"

    return $complexityAnalysisSummary
}


# Export all public functions from this module
Export-ModuleMember -Function New-UserProfiles, Measure-MigrationComplexity