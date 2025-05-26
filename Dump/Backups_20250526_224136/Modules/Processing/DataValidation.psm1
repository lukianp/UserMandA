<#
.SYNOPSIS
    Data quality validation for M&A Discovery Suite
.DESCRIPTION
    Validates data quality and generates quality reports
#>

function Test-DataQuality {
    param(
        [array]$Profiles,
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "Starting data quality validation" -Level "HEADER"
        
        if (-not $Profiles -or $Profiles.Count -eq 0) {
            Write-MandALog "No profiles available for data quality validation" -Level "WARN"
            return @{
                IsValid = $true
                TotalRecords = 0
                ValidRecords = 0
                InvalidRecords = 0
                QualityScore = 100
                Issues = @()
            }
        }
        
        $requiredFields = @("UserPrincipalName", "DisplayName")
        $validationResult = Test-DataQuality -Data $Profiles -RequiredFields $requiredFields -DataType "User Profiles"
        
        # Additional profile-specific validations
        $profileIssues = @()
        
        foreach ($profile in $Profiles) {
            $issues = @()
            
            # Check for missing critical information
            if ([string]::IsNullOrWhiteSpace($profile.Mail)) {
                $issues += "Missing email address"
            }
            
            if ([string]::IsNullOrWhiteSpace($profile.Department)) {
                $issues += "Missing department information"
            }
            
            # Check for data consistency
            if ($profile.HasGraphAccount -and [string]::IsNullOrWhiteSpace($profile.GraphId)) {
                $issues += "Marked as having Graph account but missing Graph ID"
            }
            
            if ($profile.HasExchangeMailbox -and [string]::IsNullOrWhiteSpace($profile.MailboxType)) {
                $issues += "Marked as having mailbox but missing mailbox type"
            }
            
            # Check for logical inconsistencies
            if (-not $profile.Enabled -and $profile.ReadinessStatus -eq "Ready") {
                $issues += "Disabled account marked as ready for migration"
            }
            
            if ($profile.ComplexityScore -lt 0 -or $profile.ComplexityScore -gt 20) {
                $issues += "Complexity score out of expected range"
            }
            
            if ($profile.ReadinessScore -lt 0 -or $profile.ReadinessScore -gt 100) {
                $issues += "Readiness score out of valid range"
            }
            
            if ($issues.Count -gt 0) {
                $profileIssues += @{
                    Record = $profile
                    Issues = $issues
                }
            }
        }
        
        # Combine validation results
        $combinedResult = @{
            IsValid = ($validationResult.IsValid -and $profileIssues.Count -eq 0)
            TotalRecords = $Profiles.Count
            ValidRecords = $Profiles.Count - $profileIssues.Count
            InvalidRecords = $profileIssues.Count
            QualityScore = if ($Profiles.Count -gt 0) { [math]::Round((($Profiles.Count - $profileIssues.Count) / $Profiles.Count) * 100, 2) } else { 100 }
            Issues = $validationResult.Issues + $profileIssues
        }
        
        Write-MandALog "Data quality validation completed" -Level "SUCCESS"
        Write-MandALog "Quality Score: $($combinedResult.QualityScore)%" -Level "INFO"
        Write-MandALog "Valid Records: $($combinedResult.ValidRecords) of $($combinedResult.TotalRecords)" -Level "INFO"
        
        if ($combinedResult.InvalidRecords -gt 0) {
            Write-MandALog "Found $($combinedResult.InvalidRecords) records with data quality issues" -Level "WARN"
        }
        
        return $combinedResult
        
    } catch {
        Write-MandALog "Data quality validation failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function New-QualityReport {
    param(
        [hashtable]$ValidationResults,
        [string]$OutputPath
    )
    
    try {
        Write-MandALog "Generating data quality report" -Level "INFO"
        
        $reportFile = Join-Path $OutputPath "DataQualityReport.csv"
        $reportData = [System.Collections.Generic.List[PSCustomObject]]::new()
        
        # Summary statistics
        $reportData.Add([PSCustomObject]@{
            Category = "Summary"
            Issue = "Total Records"
            Count = $ValidationResults.TotalRecords
            Percentage = 100
            Severity = "Info"
            Recommendation = "Total number of records processed"
        })
        
        $reportData.Add([PSCustomObject]@{
            Category = "Summary"
            Issue = "Valid Records"
            Count = $ValidationResults.ValidRecords
            Percentage = [math]::Round(($ValidationResults.ValidRecords / $ValidationResults.TotalRecords) * 100, 1)
            Severity = "Success"
            Recommendation = "Records that passed all validation checks"
        })
        
        $reportData.Add([PSCustomObject]@{
            Category = "Summary"
            Issue = "Invalid Records"
            Count = $ValidationResults.InvalidRecords
            Percentage = [math]::Round(($ValidationResults.InvalidRecords / $ValidationResults.TotalRecords) * 100, 1)
            Severity = if ($ValidationResults.InvalidRecords -eq 0) { "Success" } else { "Warning" }
            Recommendation = if ($ValidationResults.InvalidRecords -gt 0) { "Review and correct data quality issues" } else { "No issues found" }
        })
        
        $reportData.Add([PSCustomObject]@{
            Category = "Summary"
            Issue = "Overall Quality Score"
            Count = $ValidationResults.QualityScore
            Percentage = $ValidationResults.QualityScore
            Severity = if ($ValidationResults.QualityScore -ge 95) { "Success" } elseif ($ValidationResults.QualityScore -ge 85) { "Warning" } else { "Error" }
            Recommendation = if ($ValidationResults.QualityScore -lt 95) { "Improve data quality before migration" } else { "Data quality is acceptable" }
        })
        
        # Group issues by type
        $issueGroups = @{}
        foreach ($issue in $ValidationResults.Issues) {
            foreach ($issueDetail in $issue.Issues) {
                if (-not $issueGroups.ContainsKey($issueDetail)) {
                    $issueGroups[$issueDetail] = 0
                }
                $issueGroups[$issueDetail]++
            }
        }
        
        # Add issue details
        foreach ($issueType in $issueGroups.GetEnumerator()) {
            $severity = Get-IssueSeverity -IssueType $issueType.Key
            $recommendation = Get-IssueRecommendation -IssueType $issueType.Key
            
            $reportData.Add([PSCustomObject]@{
                Category = "Data Issues"
                Issue = $issueType.Key
                Count = $issueType.Value
                Percentage = [math]::Round(($issueType.Value / $ValidationResults.TotalRecords) * 100, 1)
                Severity = $severity
                Recommendation = $recommendation
            })
        }
        
        # Export report
        Export-DataToCSV -Data $reportData -FilePath $reportFile
        Write-MandALog "Data quality report generated: $reportFile" -Level "SUCCESS"
        
        return $reportFile
        
    } catch {
        Write-MandALog "Failed to generate quality report: $($_.Exception.Message)" -Level "ERROR"
        return $null
    }
}

function Get-IssueSeverity {
    param([string]$IssueType)
    
    switch -Wildcard ($IssueType) {
        "*Missing email*" { return "High" }
        "*Disabled account*" { return "Medium" }
        "*Missing department*" { return "Low" }
        "*out of range*" { return "High" }
        "*inconsistency*" { return "Medium" }
        default { return "Medium" }
    }
}

function Get-IssueRecommendation {
    param([string]$IssueType)
    
    switch -Wildcard ($IssueType) {
        "*Missing email*" { return "Update user records with valid email addresses" }
        "*Disabled account*" { return "Review disabled accounts and determine migration necessity" }
        "*Missing department*" { return "Update organizational information for better wave planning" }
        "*out of range*" { return "Review calculation logic and data sources" }
        "*inconsistency*" { return "Investigate and resolve data inconsistencies" }
        default { return "Review and correct data quality issue" }
    }
}

function Export-IssueDetails {
    param(
        [hashtable]$ValidationResults,
        [string]$OutputPath
    )
    
    try {
        $issueDetailsFile = Join-Path $OutputPath "DataQualityIssues.csv"
        $issueData = [System.Collections.Generic.List[PSCustomObject]]::new()
        
        foreach ($issue in $ValidationResults.Issues) {
            $userIdentifier = if ($issue.Record.UserPrincipalName) { 
                $issue.Record.UserPrincipalName 
            } elseif ($issue.Record.DisplayName) { 
                $issue.Record.DisplayName 
            } else { 
                "Unknown User" 
            }
            
            foreach ($issueDetail in $issue.Issues) {
                $issueData.Add([PSCustomObject]@{
                    UserIdentifier = $userIdentifier
                    Department = $issue.Record.Department
                    Issue = $issueDetail
                    Severity = Get-IssueSeverity -IssueType $issueDetail
                    Recommendation = Get-IssueRecommendation -IssueType $issueDetail
                    RecordData = ($issue.Record | ConvertTo-Json -Compress)
                })
            }
        }
        
        if ($issueData.Count -gt 0) {
            Export-DataToCSV -Data $issueData -FilePath $issueDetailsFile
            Write-MandALog "Issue details exported: $issueDetailsFile" -Level "SUCCESS"
        }
        
        return $issueDetailsFile
        
    } catch {
        Write-MandALog "Failed to export issue details: $($_.Exception.Message)" -Level "ERROR"
        return $null
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Test-DataQuality',
    'New-QualityReport',
    'Export-IssueDetails'
)