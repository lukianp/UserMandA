<#
.SYNOPSIS
    JSON export functionality for M&A Discovery Suite
.DESCRIPTION
    Handles JSON export of processed data for integration with other systems
#>

function Export-ToJSON {
    param(
        [hashtable]$Data,
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "Starting JSON export" -Level "HEADER"
        
        $outputPath = $Configuration.environment.outputPath
        $jsonPath = Join-Path $outputPath "Processed"
        
        if (-not (Test-Path $jsonPath)) {
            New-Item -Path $jsonPath -ItemType Directory -Force | Out-Null
        }
        
        $exportResults = @{}
        
        # Export user profiles
        if ($Data.UserProfiles) {
            $userProfilesFile = Join-Path $jsonPath "UserProfiles.json"
            $Data.UserProfiles | ConvertTo-Json -Depth 10 | Set-Content -Path $userProfilesFile -Encoding UTF8
            $exportResults.UserProfiles = $userProfilesFile
            Write-MandALog "Exported $($Data.UserProfiles.Count) user profiles to JSON" -Level "SUCCESS"
        }
        
        # Export migration waves
        if ($Data.MigrationWaves) {
            $migrationWavesFile = Join-Path $jsonPath "MigrationWaves.json"
            $Data.MigrationWaves | ConvertTo-Json -Depth 10 | Set-Content -Path $migrationWavesFile -Encoding UTF8
            $exportResults.MigrationWaves = $migrationWavesFile
            Write-MandALog "Exported migration waves to JSON" -Level "SUCCESS"
        }
        
        # Export complexity analysis
        if ($Data.ComplexityAnalysis) {
            $complexityFile = Join-Path $jsonPath "ComplexityAnalysis.json"
            $Data.ComplexityAnalysis | ConvertTo-Json -Depth 10 | Set-Content -Path $complexityFile -Encoding UTF8
            $exportResults.ComplexityAnalysis = $complexityFile
            Write-MandALog "Exported complexity analysis to JSON" -Level "SUCCESS"
        }
        
        # Export comprehensive summary
        $summaryFile = Join-Path $jsonPath "ComprehensiveSummary.json"
        $summary = Create-ComprehensiveSummary -Data $Data -Configuration $Configuration
        $summary | ConvertTo-Json -Depth 10 | Set-Content -Path $summaryFile -Encoding UTF8
        $exportResults.Summary = $summaryFile
        Write-MandALog "Exported comprehensive summary to JSON" -Level "SUCCESS"
        
        Write-MandALog "JSON export completed successfully" -Level "SUCCESS"
        return $exportResults
        
    } catch {
        Write-MandALog "JSON export failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Export-ForPowerApps {
    param(
        [hashtable]$Data,
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "Starting PowerApps-optimized export" -Level "HEADER"
        
        $outputPath = $Configuration.environment.outputPath
        $powerAppsFile = Join-Path $outputPath "PowerApps_Export.json"
        
        # Create PowerApps-optimized data structure
        $powerAppsData = @{
            metadata = @{
                exportDate = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
                version = "4.0.0"
                totalUsers = if ($Data.UserProfiles) { $Data.UserProfiles.Count } else { 0 }
                totalWaves = if ($Data.MigrationWaves) { $Data.MigrationWaves.Count } else { 0 }
                companyName = $Configuration.metadata.companyName
            }
            users = @()
            waves = @()
            statistics = @{}
        }
        
        # Optimize user data for PowerApps
        if ($Data.UserProfiles) {
            foreach ($user in $Data.UserProfiles) {
                $powerAppsData.users += @{
                    id = if ($user.GraphId) { $user.GraphId } else { [System.Guid]::NewGuid().ToString() }
                    userPrincipalName = $user.UserPrincipalName
                    displayName = $user.DisplayName
                    mail = $user.Mail
                    department = $user.Department
                    title = $user.Title
                    enabled = $user.Enabled
                    migrationCategory = $user.MigrationCategory
                    migrationWave = $user.MigrationWave
                    migrationPriority = $user.MigrationPriority
                    complexityScore = $user.ComplexityScore
                    readinessScore = $user.ReadinessScore
                    readinessStatus = $user.ReadinessStatus
                    riskLevel = $user.RiskLevel
                    estimatedMigrationTime = $user.EstimatedMigrationTime
                    hasADAccount = $user.HasADAccount
                    hasGraphAccount = $user.HasGraphAccount
                    hasExchangeMailbox = $user.HasExchangeMailbox
                    licenseCount = $user.LicenseCount
                    mailboxSizeMB = $user.MailboxSizeMB
                    lastLogon = $user.LastLogon
                    complexityFactors = $user.ComplexityFactors
                    riskFactors = $user.RiskFactors
                    blockingIssues = $user.BlockingIssues
                }
            }
        }
        
        # Optimize wave data for PowerApps
        if ($Data.MigrationWaves) {
            foreach ($waveKey in $Data.MigrationWaves.Keys) {
                $wave = $Data.MigrationWaves[$waveKey]
                $powerAppsData.waves += @{
                    id = $waveKey
                    name = $wave.Name
                    totalUsers = $wave.TotalUsers
                    estimatedTimeHours = $wave.EstimatedTimeHours
                    averageComplexityScore = $wave.AverageComplexityScore
                    averageReadinessScore = $wave.AverageReadinessScore
                    riskLevel = $wave.RiskLevel
                    departments = $wave.Departments
                    statistics = $wave.Statistics
                }
            }
        }
        
        # Add summary statistics
        if ($Data.UserProfiles) {
            $users = $Data.UserProfiles
            $powerAppsData.statistics = @{
                totalUsers = $users.Count
                enabledUsers = ($users | Where-Object { $_.Enabled }).Count
                licensedUsers = ($users | Where-Object { $_.LicenseCount -gt 0 }).Count
                usersWithMailboxes = ($users | Where-Object { $_.HasExchangeMailbox }).Count
                migrationCategories = @{
                    simple = ($users | Where-Object { $_.MigrationCategory -eq "Simple" }).Count
                    standard = ($users | Where-Object { $_.MigrationCategory -eq "Standard" }).Count
                    complex = ($users | Where-Object { $_.MigrationCategory -eq "Complex" }).Count
                    highRisk = ($users | Where-Object { $_.MigrationCategory -eq "High Risk" }).Count
                }
                readinessStatus = @{
                    ready = ($users | Where-Object { $_.ReadinessStatus -eq "Ready" }).Count
                    minorIssues = ($users | Where-Object { $_.ReadinessStatus -eq "Minor Issues" }).Count
                    needsAttention = ($users | Where-Object { $_.ReadinessStatus -eq "Needs Attention" }).Count
                    notReady = ($users | Where-Object { $_.ReadinessStatus -eq "Not Ready" }).Count
                }
                averageComplexityScore = [math]::Round(($users | Measure-Object -Property ComplexityScore -Average).Average, 1)
                averageReadinessScore = [math]::Round(($users | Measure-Object -Property ReadinessScore -Average).Average, 1)
                totalEstimatedTimeHours = [math]::Round(($users | Measure-Object -Property EstimatedMigrationTime -Sum).Sum / 60, 1)
            }
        }
        
        # Export PowerApps data
        $powerAppsData | ConvertTo-Json -Depth 10 | Set-Content -Path $powerAppsFile -Encoding UTF8
        
        Write-MandALog "PowerApps-optimized export completed: $powerAppsFile" -Level "SUCCESS"
        return $powerAppsFile
        
    } catch {
        Write-MandALog "PowerApps export failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Create-ComprehensiveSummary {
    param(
        [hashtable]$Data,
        [hashtable]$Configuration
    )
    
    $summary = @{
        metadata = @{
            exportDate = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
            version = "4.0.0"
            companyName = $Configuration.metadata.companyName
            configurationUsed = $Configuration
        }
        discovery = @{
            totalUsers = if ($Data.UserProfiles) { $Data.UserProfiles.Count } else { 0 }
            dataSources = @()
            dataQuality = if ($Data.ValidationResults) { $Data.ValidationResults } else { @{} }
        }
        analysis = @{
            complexityBreakdown = @{}
            readinessAssessment = @{}
            riskAnalysis = @{}
        }
        migration = @{
            totalWaves = if ($Data.MigrationWaves) { $Data.MigrationWaves.Count } else { 0 }
            estimatedTotalTime = 0
            recommendations = @()
        }
        recommendations = @()
    }
    
    # Add user analysis
    if ($Data.UserProfiles) {
        $users = $Data.UserProfiles
        
        $summary.analysis.complexityBreakdown = @{
            simple = ($users | Where-Object { $_.MigrationCategory -eq "Simple" }).Count
            standard = ($users | Where-Object { $_.MigrationCategory -eq "Standard" }).Count
            complex = ($users | Where-Object { $_.MigrationCategory -eq "Complex" }).Count
            highRisk = ($users | Where-Object { $_.MigrationCategory -eq "High Risk" }).Count
        }
        
        $summary.analysis.readinessAssessment = @{
            ready = ($users | Where-Object { $_.ReadinessStatus -eq "Ready" }).Count
            minorIssues = ($users | Where-Object { $_.ReadinessStatus -eq "Minor Issues" }).Count
            needsAttention = ($users | Where-Object { $_.ReadinessStatus -eq "Needs Attention" }).Count
            notReady = ($users | Where-Object { $_.ReadinessStatus -eq "Not Ready" }).Count
        }
        
        $summary.analysis.riskAnalysis = @{
            low = ($users | Where-Object { $_.RiskLevel -eq "Low" }).Count
            medium = ($users | Where-Object { $_.RiskLevel -eq "Medium" }).Count
            high = ($users | Where-Object { $_.RiskLevel -eq "High" }).Count
        }
        
        $summary.migration.estimatedTotalTime = [math]::Round(($users | Measure-Object -Property EstimatedMigrationTime -Sum).Sum / 60, 1)
    }
    
    # Add recommendations
    $summary.recommendations = Generate-MigrationRecommendations -Data $Data
    
    return $summary
}

function Generate-MigrationRecommendations {
    param([hashtable]$Data)
    
    $recommendations = @()
    
    if ($Data.UserProfiles) {
        $users = $Data.UserProfiles
        $totalUsers = $users.Count
        
        # High-level recommendations
        $notReadyCount = ($users | Where-Object { $_.ReadinessStatus -eq "Not Ready" }).Count
        if ($notReadyCount -gt 0) {
            $recommendations += "Address $notReadyCount users not ready for migration before proceeding"
        }
        
        $highRiskCount = ($users | Where-Object { $_.MigrationCategory -eq "High Risk" }).Count
        if ($highRiskCount -gt 0) {
            $recommendations += "Plan special handling for $highRiskCount high-risk users"
        }
        
        $unlicensedCount = ($users | Where-Object { $_.LicenseCount -eq 0 }).Count
        if ($unlicensedCount -gt 0) {
            $recommendations += "Review licensing for $unlicensedCount users without assigned licenses"
        }
        
        $disabledCount = ($users | Where-Object { -not $_.Enabled }).Count
        if ($disabledCount -gt 0) {
            $recommendations += "Consider excluding $disabledCount disabled accounts from migration"
        }
        
        # Wave-specific recommendations
        if ($Data.MigrationWaves) {
            $waveCount = $Data.MigrationWaves.Count
            if ($waveCount -gt 10) {
                $recommendations += "Consider consolidating migration waves (currently $waveCount waves)"
            }
            
            $totalEstimatedTime = 0
            foreach ($wave in $Data.MigrationWaves.Values) {
                $totalEstimatedTime += $wave.EstimatedTimeHours
            }
            
            if ($totalEstimatedTime -gt 100) {
                $recommendations += "Migration estimated to take $([math]::Round($totalEstimatedTime, 1)) hours - consider parallel processing"
            }
        }
    }
    
    return $recommendations
}

# Export functions
Export-ModuleMember -Function @(
    'Export-ToJSON',
    'Export-ForPowerApps',
    'Create-ComprehensiveSummary'
)