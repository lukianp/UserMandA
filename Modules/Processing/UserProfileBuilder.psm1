<#
.SYNOPSIS
    User profile building for M&A Discovery Suite
.DESCRIPTION
    Builds comprehensive user profiles for migration planning
#>

function Build-UserProfiles {
    param(
        [hashtable]$Data,
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "Building user profiles" -Level "HEADER"
        
        $userProfiles = [System.Collections.Generic.List[PSCustomObject]]::new()
        $users = $Data.Users
        
        if (-not $users -or $users.Count -eq 0) {
            Write-MandALog "No user data available for profile building" -Level "WARN"
            return @()
        }
        
        $processedCount = 0
        foreach ($user in $users) {
            $processedCount++
            if ($processedCount % 50 -eq 0) {
                Write-Progress -Activity "Building User Profiles" -Status "User $processedCount of $($users.Count)" -PercentComplete (($processedCount / $users.Count) * 100)
            }
            
            $profile = Build-IndividualUserProfile -User $user -Configuration $Configuration
            $userProfiles.Add($profile)
        }
        
        Write-Progress -Activity "Building User Profiles" -Completed
        
        # Calculate complexity scores
        Write-MandALog "Calculating complexity scores..." -Level "INFO"
        Calculate-ComplexityScores -UserProfiles $userProfiles -Configuration $Configuration
        
        Write-MandALog "Built profiles for $($userProfiles.Count) users" -Level "SUCCESS"
        return $userProfiles
        
    } catch {
        Write-MandALog "User profile building failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Build-IndividualUserProfile {
    param(
        [PSCustomObject]$User,
        [hashtable]$Configuration
    )
    
    $profile = [PSCustomObject]@{
        # Identity
        UserPrincipalName = $User.UserPrincipalName
        SamAccountName = $User.SamAccountName
        DisplayName = $User.DisplayName
        GraphId = $User.GraphId
        
        # Personal Information
        GivenName = $User.GivenName
        Surname = $User.Surname
        Mail = $User.Mail
        
        # Organizational Information
        Department = $User.Department
        Title = $User.Title
        Company = $User.Company
        Office = $User.Office
        Manager = $User.Manager
        
        # Account Status
        Enabled = $User.Enabled
        AccountCreated = $User.AccountCreated
        LastLogon = $User.LastLogon
        PasswordLastSet = $User.PasswordLastSet
        
        # Service Presence
        HasADAccount = $User.HasADAccount
        HasGraphAccount = $User.HasGraphAccount
        HasExchangeMailbox = $User.HasExchangeMailbox
        
        # Licensing
        AssignedLicenses = $User.AssignedLicenses
        LicenseCount = if ($User.AssignedLicenses) { ($User.AssignedLicenses -split ';').Count } else { 0 }
        
        # Mailbox Information
        MailboxType = $User.MailboxType
        MailboxSize = $User.MailboxSize
        MailboxSizeMB = Convert-MailboxSizeToMB -SizeString $User.MailboxSize
        
        # Migration Complexity Factors
        ComplexityFactors = @()
        ComplexityScore = 0
        MigrationCategory = "Standard"
        
        # Migration Planning
        MigrationWave = $null
        MigrationPriority = "Medium"
        EstimatedMigrationTime = $null
        
        # Risk Assessment
        RiskFactors = @()
        RiskLevel = "Low"
        
        # Dependencies
        DirectReports = @()
        GroupMemberships = @()
        ApplicationAccess = @()
        
        # Migration Readiness
        ReadinessScore = 0
        ReadinessStatus = "Not Assessed"
        BlockingIssues = @()
    }
    
    # Analyze complexity factors
    Analyze-UserComplexity -Profile $profile -Configuration $Configuration
    
    # Assess migration readiness
    Assess-MigrationReadiness -Profile $profile -Configuration $Configuration
    
    return $profile
}

function Analyze-UserComplexity {
    param(
        [PSCustomObject]$Profile,
        [hashtable]$Configuration
    )
    
    $complexityFactors = @()
    $complexityScore = 0
    
    # Account status complexity
    if (-not $Profile.Enabled) {
        $complexityFactors += "Disabled Account"
        $complexityScore += 1
    }
    
    # Service presence complexity
    if ($Profile.HasADAccount -and -not $Profile.HasGraphAccount) {
        $complexityFactors += "AD Only Account"
        $complexityScore += 2
    }
    
    if (-not $Profile.HasExchangeMailbox -and $Profile.HasGraphAccount) {
        $complexityFactors += "No Exchange Mailbox"
        $complexityScore += 1
    }
    
    # Licensing complexity
    if ($Profile.LicenseCount -eq 0) {
        $complexityFactors += "No Licenses Assigned"
        $complexityScore += 2
    } elseif ($Profile.LicenseCount -gt 3) {
        $complexityFactors += "Multiple Licenses"
        $complexityScore += 1
    }
    
    # Mailbox size complexity
    if ($Profile.MailboxSizeMB -gt 10240) { # > 10GB
        $complexityFactors += "Large Mailbox (>10GB)"
        $complexityScore += 3
    } elseif ($Profile.MailboxSizeMB -gt 5120) { # > 5GB
        $complexityFactors += "Medium Mailbox (>5GB)"
        $complexityScore += 2
    }
    
    # Account age complexity
    if ($Profile.AccountCreated) {
        try {
            $accountAge = (Get-Date) - [DateTime]$Profile.AccountCreated
            if ($accountAge.Days -gt 1825) { # > 5 years
                $complexityFactors += "Legacy Account (>5 years)"
                $complexityScore += 2
            }
        } catch {
            # Ignore date parsing errors
        }
    }
    
    # Last logon complexity
    if ($Profile.LastLogon) {
        try {
            $daysSinceLogon = (Get-Date) - [DateTime]$Profile.LastLogon
            if ($daysSinceLogon.Days -gt 90) {
                $complexityFactors += "Inactive User (>90 days)"
                $complexityScore += 1
            }
        } catch {
            # Ignore date parsing errors
        }
    }
    
    # Missing critical information
    if ([string]::IsNullOrWhiteSpace($Profile.Mail)) {
        $complexityFactors += "Missing Email Address"
        $complexityScore += 1
    }
    
    if ([string]::IsNullOrWhiteSpace($Profile.Department)) {
        $complexityFactors += "Missing Department"
        $complexityScore += 1
    }
    
    # Determine migration category
    $thresholds = $Configuration.processing.complexityThresholds
    if ($complexityScore -le $thresholds.low) {
        $migrationCategory = "Simple"
    } elseif ($complexityScore -le $thresholds.medium) {
        $migrationCategory = "Standard"
    } elseif ($complexityScore -le $thresholds.high) {
        $migrationCategory = "Complex"
    } else {
        $migrationCategory = "High Risk"
    }
    
    $Profile.ComplexityFactors = $complexityFactors
    $Profile.ComplexityScore = $complexityScore
    $Profile.MigrationCategory = $migrationCategory
}

function Assess-MigrationReadiness {
    param(
        [PSCustomObject]$Profile,
        [hashtable]$Configuration
    )
    
    $readinessScore = 100
    $blockingIssues = @()
    $riskFactors = @()
    
    # Check for blocking issues
    if (-not $Profile.Enabled) {
        $blockingIssues += "Account is disabled"
        $readinessScore -= 50
    }
    
    if (-not $Profile.HasGraphAccount) {
        $blockingIssues += "No Azure AD account"
        $readinessScore -= 30
    }
    
    if ($Profile.LicenseCount -eq 0) {
        $riskFactors += "No licenses assigned"
        $readinessScore -= 20
    }
    
    # Check for risk factors
    if ($Profile.MailboxSizeMB -gt 10240) {
        $riskFactors += "Large mailbox may require extended migration time"
        $readinessScore -= 10
    }
    
    if ($Profile.LastLogon) {
        try {
            $daysSinceLogon = (Get-Date) - [DateTime]$Profile.LastLogon
            if ($daysSinceLogon.Days -gt 180) {
                $riskFactors += "User has not logged in recently"
                $readinessScore -= 5
            }
        } catch {
            # Ignore date parsing errors
        }
    }
    
    # Check for missing critical data
    if ([string]::IsNullOrWhiteSpace($Profile.Mail)) {
        $riskFactors += "Missing email address"
        $readinessScore -= 10
    }
    
    if ([string]::IsNullOrWhiteSpace($Profile.Department)) {
        $riskFactors += "Missing department information"
        $readinessScore -= 5
    }
    
    # Determine readiness status
    $readinessStatus = switch ($readinessScore) {
        { $_ -ge 90 } { "Ready" }
        { $_ -ge 70 } { "Minor Issues" }
        { $_ -ge 50 } { "Needs Attention" }
        default { "Not Ready" }
    }
    
    $Profile.ReadinessScore = [Math]::Max(0, $readinessScore)
    $Profile.ReadinessStatus = $readinessStatus
    $Profile.BlockingIssues = $blockingIssues
    $Profile.RiskFactors = $riskFactors
    $Profile.RiskLevel = if ($riskFactors.Count -eq 0) { "Low" } elseif ($riskFactors.Count -le 2) { "Medium" } else { "High" }
}

function Calculate-ComplexityScores {
    param(
        [System.Collections.Generic.List[PSCustomObject]]$UserProfiles,
        [hashtable]$Configuration
    )
    
    # Calculate percentiles for relative complexity
    $scores = $UserProfiles | ForEach-Object { $_.ComplexityScore } | Sort-Object
    $p25 = Get-Percentile -Values $scores -Percentile 25
    $p75 = Get-Percentile -Values $scores -Percentile 75
    
    foreach ($profile in $UserProfiles) {
        # Adjust migration priority based on complexity and readiness
        if ($profile.ComplexityScore -le $p25 -and $profile.ReadinessScore -ge 90) {
            $profile.MigrationPriority = "High"
        } elseif ($profile.ComplexityScore -ge $p75 -or $profile.ReadinessScore -lt 50) {
            $profile.MigrationPriority = "Low"
        } else {
            $profile.MigrationPriority = "Medium"
        }
        
        # Estimate migration time based on complexity and mailbox size
        $baseTime = 30 # minutes
        $complexityMultiplier = 1 + ($profile.ComplexityScore * 0.1)
        $sizeMultiplier = 1 + ($profile.MailboxSizeMB / 1024 * 0.1) # 10% per GB
        
        $profile.EstimatedMigrationTime = [Math]::Round($baseTime * $complexityMultiplier * $sizeMultiplier, 0)
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
            return $bytes / 1024 / 1024 # Convert to MB
        }
        
        return 0
        
    } catch {
        return 0
    }
}

function Get-Percentile {
    param(
        [array]$Values,
        [int]$Percentile
    )
    
    if ($Values.Count -eq 0) { return 0 }
    
    $index = [Math]::Ceiling(($Percentile / 100.0) * $Values.Count) - 1
    $index = [Math]::Max(0, [Math]::Min($index, $Values.Count - 1))
    
    return $Values[$index]
}

function Calculate-MigrationComplexity {
    param(
        [array]$Profiles,
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "Calculating migration complexity analysis" -Level "INFO"
        
        $complexityAnalysis = [System.Collections.Generic.List[PSCustomObject]]::new()
        
        # Overall statistics
        $totalUsers = $Profiles.Count
        $simpleUsers = ($Profiles | Where-Object { $_.MigrationCategory -eq "Simple" }).Count
        $standardUsers = ($Profiles | Where-Object { $_.MigrationCategory -eq "Standard" }).Count
        $complexUsers = ($Profiles | Where-Object { $_.MigrationCategory -eq "Complex" }).Count
        $highRiskUsers = ($Profiles | Where-Object { $_.MigrationCategory -eq "High Risk" }).Count
        
        $complexityAnalysis.Add([PSCustomObject]@{
            Category = "Overall Statistics"
            Metric = "Total Users"
            Value = $totalUsers
            Percentage = 100
        })
        
        $complexityAnalysis.Add([PSCustomObject]@{
            Category = "Migration Complexity"
            Metric = "Simple Migrations"
            Value = $simpleUsers
            Percentage = if ($totalUsers -gt 0) { [math]::Round(($simpleUsers / $totalUsers) * 100, 1) } else { 0 }
        })
        
        $complexityAnalysis.Add([PSCustomObject]@{
            Category = "Migration Complexity"
            Metric = "Standard Migrations"
            Value = $standardUsers
            Percentage = if ($totalUsers -gt 0) { [math]::Round(($standardUsers / $totalUsers) * 100, 1) } else { 0 }
        })
        
        $complexityAnalysis.Add([PSCustomObject]@{
            Category = "Migration Complexity"
            Metric = "Complex Migrations"
            Value = $complexUsers
            Percentage = if ($totalUsers -gt 0) { [math]::Round(($complexUsers / $totalUsers) * 100, 1) } else { 0 }
        })
        
        $complexityAnalysis.Add([PSCustomObject]@{
            Category = "Migration Complexity"
            Metric = "High Risk Migrations"
            Value = $highRiskUsers
            Percentage = if ($totalUsers -gt 0) { [math]::Round(($highRiskUsers / $totalUsers) * 100, 1) } else { 0 }
        })
        
        # Readiness statistics
        $readyUsers = ($Profiles | Where-Object { $_.ReadinessStatus -eq "Ready" }).Count
        $minorIssuesUsers = ($Profiles | Where-Object { $_.ReadinessStatus -eq "Minor Issues" }).Count
        $needsAttentionUsers = ($Profiles | Where-Object { $_.ReadinessStatus -eq "Needs Attention" }).Count
        $notReadyUsers = ($Profiles | Where-Object { $_.ReadinessStatus -eq "Not Ready" }).Count
        
        $complexityAnalysis.Add([PSCustomObject]@{
            Category = "Migration Readiness"
            Metric = "Ready for Migration"
            Value = $readyUsers
            Percentage = if ($totalUsers -gt 0) { [math]::Round(($readyUsers / $totalUsers) * 100, 1) } else { 0 }
        })
        
        $complexityAnalysis.Add([PSCustomObject]@{
            Category = "Migration Readiness"
            Metric = "Minor Issues"
            Value = $minorIssuesUsers
            Percentage = if ($totalUsers -gt 0) { [math]::Round(($minorIssuesUsers / $totalUsers) * 100, 1) } else { 0 }
        })
        
        $complexityAnalysis.Add([PSCustomObject]@{
            Category = "Migration Readiness"
            Metric = "Needs Attention"
            Value = $needsAttentionUsers
            Percentage = if ($totalUsers -gt 0) { [math]::Round(($needsAttentionUsers / $totalUsers) * 100, 1) } else { 0 }
        })
        
        $complexityAnalysis.Add([PSCustomObject]@{
            Category = "Migration Readiness"
            Metric = "Not Ready"
            Value = $notReadyUsers
            Percentage = if ($totalUsers -gt 0) { [math]::Round(($notReadyUsers / $totalUsers) * 100, 1) } else { 0 }
        })
        
        # Time estimates
        $totalEstimatedTime = ($Profiles | Measure-Object -Property EstimatedMigrationTime -Sum).Sum
        $averageTime = if ($totalUsers -gt 0) { [math]::Round($totalEstimatedTime / $totalUsers, 0) } else { 0 }
        
        $complexityAnalysis.Add([PSCustomObject]@{
            Category = "Time Estimates"
            Metric = "Total Estimated Time (hours)"
            Value = [math]::Round($totalEstimatedTime / 60, 1)
            Percentage = $null
        })
        
        $complexityAnalysis.Add([PSCustomObject]@{
            Category = "Time Estimates"
            Metric = "Average Time per User (minutes)"
            Value = $averageTime
            Percentage = $null
        })
        
        Write-MandALog "Migration complexity analysis completed" -Level "SUCCESS"
        return $complexityAnalysis
        
    } catch {
        Write-MandALog "Migration complexity analysis failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Build-UserProfiles',
    'Build-IndividualUserProfile',
    'Analyze-UserComplexity',
    'Assess-MigrationReadiness',
    'Calculate-ComplexityScores',
    'Calculate-MigrationComplexity',
    'Convert-MailboxSizeToMB'
)