<#
.SYNOPSIS
    CSV export functionality for M&A Discovery Suite
.DESCRIPTION
    Handles CSV export of processed data
#>

function Export-ToCSV {
    param(
        [hashtable]$Data,
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "Starting CSV export" -Level "HEADER"
        
        $outputPath = $Configuration.environment.outputPath
        $csvPath = Join-Path $outputPath "Processed"
        
        if (-not (Test-Path $csvPath)) {
            New-Item -Path $csvPath -ItemType Directory -Force | Out-Null
        }
        
        $exportResults = @{}
        
        # Export user profiles
        if ($Data.UserProfiles) {
            $userProfilesFile = Join-Path $csvPath "UserProfiles.csv"
            Export-DataToCSV -Data $Data.UserProfiles -FilePath $userProfilesFile
            $exportResults.UserProfiles = $userProfilesFile
            Write-MandALog "Exported $($Data.UserProfiles.Count) user profiles to CSV" -Level "SUCCESS"
        }
        
        # Export migration waves
        if ($Data.MigrationWaves) {
            $migrationWavesFile = Join-Path $csvPath "MigrationWaves.csv"
            $waveData = Format-MigrationWavesForCSV -MigrationWaves $Data.MigrationWaves
            Export-DataToCSV -Data $waveData -FilePath $migrationWavesFile
            $exportResults.MigrationWaves = $migrationWavesFile
            Write-MandALog "Exported migration waves to CSV" -Level "SUCCESS"
        }
        
        # Export complexity analysis
        if ($Data.ComplexityAnalysis) {
            $complexityFile = Join-Path $csvPath "ComplexityAnalysis.csv"
            Export-DataToCSV -Data $Data.ComplexityAnalysis -FilePath $complexityFile
            $exportResults.ComplexityAnalysis = $complexityFile
            Write-MandALog "Exported complexity analysis to CSV" -Level "SUCCESS"
        }
        
        # Export validation results if available
        if ($Data.ValidationResults) {
            $validationFile = Join-Path $csvPath "ValidationResults.csv"
            $validationData = Format-ValidationResultsForCSV -ValidationResults $Data.ValidationResults
            Export-DataToCSV -Data $validationData -FilePath $validationFile
            $exportResults.ValidationResults = $validationFile
            Write-MandALog "Exported validation results to CSV" -Level "SUCCESS"
        }
        
        # Export summary statistics
        $summaryFile = Join-Path $csvPath "SummaryStatistics.csv"
        $summaryData = Generate-SummaryStatistics -Data $Data
        Export-DataToCSV -Data $summaryData -FilePath $summaryFile
        $exportResults.Summary = $summaryFile
        Write-MandALog "Exported summary statistics to CSV" -Level "SUCCESS"
        
        Write-MandALog "CSV export completed successfully" -Level "SUCCESS"
        return $exportResults
        
    } catch {
        Write-MandALog "CSV export failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Format-MigrationWavesForCSV {
    param([hashtable]$MigrationWaves)
    
    $waveData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    foreach ($waveNumber in ($MigrationWaves.Keys | Sort-Object)) {
        $wave = $MigrationWaves[$waveNumber]
        
        foreach ($user in $wave.Users) {
            $waveData.Add([PSCustomObject]@{
                WaveNumber = $waveNumber
                WaveName = $wave.Name
                UserPrincipalName = $user.UserPrincipalName
                DisplayName = $user.DisplayName
                Department = $user.Department
                Title = $user.Title
                ComplexityScore = $user.ComplexityScore
                MigrationCategory = $user.MigrationCategory
                EstimatedMigrationTime = $user.EstimatedMigrationTime
                ReadinessStatus = $user.ReadinessStatus
                MigrationPriority = $user.MigrationPriority
                MailboxSizeMB = $user.MailboxSizeMB
                LicenseCount = $user.LicenseCount
                RiskLevel = $user.RiskLevel
                HasADAccount = $user.HasADAccount
                HasGraphAccount = $user.HasGraphAccount
                HasExchangeMailbox = $user.HasExchangeMailbox
                AccountEnabled = $user.Enabled
                LastLogon = $user.LastLogon
                ComplexityFactors = ($user.ComplexityFactors -join '; ')
                RiskFactors = ($user.RiskFactors -join '; ')
                BlockingIssues = ($user.BlockingIssues -join '; ')
            })
        }
    }
    
    return $waveData
}

function Format-ValidationResultsForCSV {
    param([hashtable]$ValidationResults)
    
    $validationData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    # Overall validation summary
    $validationData.Add([PSCustomObject]@{
        Category = "Overall"
        Metric = "Total Records"
        Value = $ValidationResults.TotalRecords
        Status = "Info"
        Details = ""
    })
    
    $validationData.Add([PSCustomObject]@{
        Category = "Overall"
        Metric = "Valid Records"
        Value = $ValidationResults.ValidRecords
        Status = "Success"
        Details = ""
    })
    
    $validationData.Add([PSCustomObject]@{
        Category = "Overall"
        Metric = "Invalid Records"
        Value = $ValidationResults.InvalidRecords
        Status = if ($ValidationResults.InvalidRecords -eq 0) { "Success" } else { "Warning" }
        Details = ""
    })
    
    $validationData.Add([PSCustomObject]@{
        Category = "Overall"
        Metric = "Quality Score"
        Value = "$([math]::Round($ValidationResults.QualityScore, 2))%"
        Status = if ($ValidationResults.QualityScore -ge 95) { "Success" } elseif ($ValidationResults.QualityScore -ge 85) { "Warning" } else { "Error" }
        Details = ""
    })
    
    # Individual validation issues
    if ($ValidationResults.Issues) {
        foreach ($issue in $ValidationResults.Issues) {
            foreach ($issueDetail in $issue.Issues) {
                $validationData.Add([PSCustomObject]@{
                    Category = "Issue"
                    Metric = "Data Quality Issue"
                    Value = $issueDetail
                    Status = "Error"
                    Details = if ($issue.Record.UserPrincipalName) { $issue.Record.UserPrincipalName } elseif ($issue.Record.DisplayName) { $issue.Record.DisplayName } else { "Unknown Record" }
                })
            }
        }
    }
    
    return $validationData
}

function Generate-SummaryStatistics {
    param([hashtable]$Data)
    
    $summaryData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    try {
        # User profile statistics
        if ($Data.UserProfiles) {
            $users = $Data.UserProfiles
            
            $summaryData.Add([PSCustomObject]@{
                Category = "User Statistics"
                Metric = "Total Users"
                Value = $users.Count
                Percentage = 100
                Details = "All discovered users"
            })
            
            $enabledUsers = ($users | Where-Object { $_.Enabled }).Count
            $summaryData.Add([PSCustomObject]@{
                Category = "User Statistics"
                Metric = "Enabled Users"
                Value = $enabledUsers
                Percentage = if ($users.Count -gt 0) { [math]::Round(($enabledUsers / $users.Count) * 100, 1) } else { 0 }
                Details = "Users with enabled accounts"
            })
            
            $licensedUsers = ($users | Where-Object { $_.LicenseCount -gt 0 }).Count
            $summaryData.Add([PSCustomObject]@{
                Category = "User Statistics"
                Metric = "Licensed Users"
                Value = $licensedUsers
                Percentage = if ($users.Count -gt 0) { [math]::Round(($licensedUsers / $users.Count) * 100, 1) } else { 0 }
                Details = "Users with assigned licenses"
            })
            
            $mailboxUsers = ($users | Where-Object { $_.HasExchangeMailbox }).Count
            $summaryData.Add([PSCustomObject]@{
                Category = "User Statistics"
                Metric = "Users with Mailboxes"
                Value = $mailboxUsers
                Percentage = if ($users.Count -gt 0) { [math]::Round(($mailboxUsers / $users.Count) * 100, 1) } else { 0 }
                Details = "Users with Exchange mailboxes"
            })
            
            # Migration complexity breakdown
            $simpleUsers = ($users | Where-Object { $_.MigrationCategory -eq "Simple" }).Count
            $summaryData.Add([PSCustomObject]@{
                Category = "Migration Complexity"
                Metric = "Simple Migrations"
                Value = $simpleUsers
                Percentage = if ($users.Count -gt 0) { [math]::Round(($simpleUsers / $users.Count) * 100, 1) } else { 0 }
                Details = "Low complexity migrations"
            })
            
            $standardUsers = ($users | Where-Object { $_.MigrationCategory -eq "Standard" }).Count
            $summaryData.Add([PSCustomObject]@{
                Category = "Migration Complexity"
                Metric = "Standard Migrations"
                Value = $standardUsers
                Percentage = if ($users.Count -gt 0) { [math]::Round(($standardUsers / $users.Count) * 100, 1) } else { 0 }
                Details = "Standard complexity migrations"
            })
            
            $complexUsers = ($users | Where-Object { $_.MigrationCategory -eq "Complex" }).Count
            $summaryData.Add([PSCustomObject]@{
                Category = "Migration Complexity"
                Metric = "Complex Migrations"
                Value = $complexUsers
                Percentage = if ($users.Count -gt 0) { [math]::Round(($complexUsers / $users.Count) * 100, 1) } else { 0 }
                Details = "High complexity migrations"
            })
            
            $highRiskUsers = ($users | Where-Object { $_.MigrationCategory -eq "High Risk" }).Count
            $summaryData.Add([PSCustomObject]@{
                Category = "Migration Complexity"
                Metric = "High Risk Migrations"
                Value = $highRiskUsers
                Percentage = if ($users.Count -gt 0) { [math]::Round(($highRiskUsers / $users.Count) * 100, 1) } else { 0 }
                Details = "High risk migrations requiring special attention"
            })
            
            # Readiness statistics
            $readyUsers = ($users | Where-Object { $_.ReadinessStatus -eq "Ready" }).Count
            $summaryData.Add([PSCustomObject]@{
                Category = "Migration Readiness"
                Metric = "Ready for Migration"
                Value = $readyUsers
                Percentage = if ($users.Count -gt 0) { [math]::Round(($readyUsers / $users.Count) * 100, 1) } else { 0 }
                Details = "Users ready for immediate migration"
            })
            
            $minorIssuesUsers = ($users | Where-Object { $_.ReadinessStatus -eq "Minor Issues" }).Count
            $summaryData.Add([PSCustomObject]@{
                Category = "Migration Readiness"
                Metric = "Minor Issues"
                Value = $minorIssuesUsers
                Percentage = if ($users.Count -gt 0) { [math]::Round(($minorIssuesUsers / $users.Count) * 100, 1) } else { 0 }
                Details = "Users with minor issues that can be resolved quickly"
            })
            
            $needsAttentionUsers = ($users | Where-Object { $_.ReadinessStatus -eq "Needs Attention" }).Count
            $summaryData.Add([PSCustomObject]@{
                Category = "Migration Readiness"
                Metric = "Needs Attention"
                Value = $needsAttentionUsers
                Percentage = if ($users.Count -gt 0) { [math]::Round(($needsAttentionUsers / $users.Count) * 100, 1) } else { 0 }
                Details = "Users requiring attention before migration"
            })
            
            $notReadyUsers = ($users | Where-Object { $_.ReadinessStatus -eq "Not Ready" }).Count
            $summaryData.Add([PSCustomObject]@{
                Category = "Migration Readiness"
                Metric = "Not Ready"
                Value = $notReadyUsers
                Percentage = if ($users.Count -gt 0) { [math]::Round(($notReadyUsers / $users.Count) * 100, 1) } else { 0 }
                Details = "Users not ready for migration"
            })
        }
        
        # Migration wave statistics
        if ($Data.MigrationWaves) {
            $waves = $Data.MigrationWaves
            
            $summaryData.Add([PSCustomObject]@{
                Category = "Migration Waves"
                Metric = "Total Waves"
                Value = $waves.Count
                Percentage = $null
                Details = "Number of migration waves generated"
            })
            
            $totalWaveUsers = 0
            $totalEstimatedTime = 0
            foreach ($wave in $waves.Values) {
                $totalWaveUsers += $wave.TotalUsers
                $totalEstimatedTime += $wave.EstimatedTimeHours
            }
            
            $summaryData.Add([PSCustomObject]@{
                Category = "Migration Waves"
                Metric = "Users in Waves"
                Value = $totalWaveUsers
                Percentage = $null
                Details = "Total users assigned to migration waves"
            })
            
            $summaryData.Add([PSCustomObject]@{
                Category = "Migration Waves"
                Metric = "Total Estimated Time (hours)"
                Value = [math]::Round($totalEstimatedTime, 1)
                Percentage = $null
                Details = "Total estimated migration time for all waves"
            })
            
            $averageWaveSize = if ($waves.Count -gt 0) { [math]::Round($totalWaveUsers / $waves.Count, 1) } else { 0 }
            $summaryData.Add([PSCustomObject]@{
                Category = "Migration Waves"
                Metric = "Average Wave Size"
                Value = $averageWaveSize
                Percentage = $null
                Details = "Average number of users per wave"
            })
        }
        
        # Department statistics
        if ($Data.UserProfiles) {
            $departmentGroups = $Data.UserProfiles | Group-Object -Property Department
            
            $summaryData.Add([PSCustomObject]@{
                Category = "Department Statistics"
                Metric = "Total Departments"
                Value = $departmentGroups.Count
                Percentage = $null
                Details = "Number of unique departments discovered"
            })
            
            # Top 5 departments by user count
            $topDepartments = $departmentGroups | Sort-Object Count -Descending | Select-Object -First 5
            foreach ($dept in $topDepartments) {
                $deptName = if ([string]::IsNullOrWhiteSpace($dept.Name)) { "Unknown Department" } else { $dept.Name }
                $summaryData.Add([PSCustomObject]@{
                    Category = "Top Departments"
                    Metric = $deptName
                    Value = $dept.Count
                    Percentage = if ($Data.UserProfiles.Count -gt 0) { [math]::Round(($dept.Count / $Data.UserProfiles.Count) * 100, 1) } else { 0 }
                    Details = "Users in this department"
                })
            }
        }
        
        return $summaryData
        
    } catch {
        Write-MandALog "Error generating summary statistics: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Export-DetailedUserReport {
    param(
        [array]$UserProfiles,
        [string]$OutputPath
    )
    
    try {
        $detailedReportFile = Join-Path $OutputPath "DetailedUserReport.csv"
        
        $detailedData = [System.Collections.Generic.List[PSCustomObject]]::new()
        
        foreach ($user in $UserProfiles) {
            $detailedData.Add([PSCustomObject]@{
                # Identity
                UserPrincipalName = $user.UserPrincipalName
                SamAccountName = $user.SamAccountName
                DisplayName = $user.DisplayName
                GraphId = $user.GraphId
                
                # Personal Information
                GivenName = $user.GivenName
                Surname = $user.Surname
                Mail = $user.Mail
                
                # Organizational Information
                Department = $user.Department
                Title = $user.Title
                Company = $user.Company
                Office = $user.Office
                Manager = $user.Manager
                
                # Account Status
                Enabled = $user.Enabled
                AccountCreated = $user.AccountCreated
                LastLogon = $user.LastLogon
                PasswordLastSet = $user.PasswordLastSet
                
                # Service Presence
                HasADAccount = $user.HasADAccount
                HasGraphAccount = $user.HasGraphAccount
                HasExchangeMailbox = $user.HasExchangeMailbox
                
                # Licensing
                AssignedLicenses = $user.AssignedLicenses
                LicenseCount = $user.LicenseCount
                
                # Mailbox Information
                MailboxType = $user.MailboxType
                MailboxSize = $user.MailboxSize
                MailboxSizeMB = $user.MailboxSizeMB
                
                # Migration Analysis
                ComplexityScore = $user.ComplexityScore
                MigrationCategory = $user.MigrationCategory
                MigrationWave = $user.MigrationWave
                MigrationPriority = $user.MigrationPriority
                EstimatedMigrationTime = $user.EstimatedMigrationTime
                
                # Readiness Assessment
                ReadinessScore = $user.ReadinessScore
                ReadinessStatus = $user.ReadinessStatus
                RiskLevel = $user.RiskLevel
                
                # Issues and Factors
                ComplexityFactors = ($user.ComplexityFactors -join '; ')
                RiskFactors = ($user.RiskFactors -join '; ')
                BlockingIssues = ($user.BlockingIssues -join '; ')
            })
        }
        
        Export-DataToCSV -Data $detailedData -FilePath $detailedReportFile
        Write-MandALog "Exported detailed user report: $detailedReportFile" -Level "SUCCESS"
        
        return $detailedReportFile
        
    } catch {
        Write-MandALog "Error exporting detailed user report: $($_.Exception.Message)" -Level "ERROR"
        return $null
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Export-ToCSV',
    'Format-MigrationWavesForCSV',
    'Format-ValidationResultsForCSV',
    'Generate-SummaryStatistics',
    'Export-DetailedUserReport'
)