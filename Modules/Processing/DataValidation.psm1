#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Data Validation Module
.DESCRIPTION
    This module is responsible for validating the quality and completeness of
    processed data (e.g., user profiles) and generating quality reports.
.NOTES
    Version: 1.2.0 (Aligned with orchestrator data contracts)
    Author: Gemini
#>

[CmdletBinding()]
param()

# Main function to test data quality
function Test-DataQuality {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [System.Collections.IList]$Profiles, # Expects an array/list of user profile objects from UserProfileBuilder

        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration
    )

    Write-MandALog "Starting Data Quality Validation for $($Profiles.Count) profiles..." -Level "INFO"
    $issuesFound = [System.Collections.Generic.List[object]]::new()
    $validRecords = 0
    $invalidRecords = 0 # Tracks profiles with at least one issue

    if ($null -eq $Profiles -or $Profiles.Count -eq 0) {
        Write-MandALog "No user profiles provided. Skipping data quality validation." -Level "WARN"
        return @{ TotalRecords = 0; ValidRecords = 0; InvalidRecords = 0; QualityScore = 100; Issues = $issuesFound }
    }
    
    $processedCount = 0
    foreach ($profile in $Profiles) {
        $processedCount++
        Update-Progress -Activity "Validating Data Quality" -Status "Profile $processedCount of $($Profiles.Count)" -PercentComplete (($processedCount / $Profiles.Count) * 100)

        $currentProfileIssueCount = 0
        # --- Placeholder: Detailed data validation logic ---

        # Example: Check for missing UserPrincipalName
        if ([string]::IsNullOrWhiteSpace($profile.UserPrincipalName)) {
            $issuesFound.Add([PSCustomObject]@{
                Identifier  = $profile.DisplayName # Fallback identifier
                IssueType   = "Missing Critical Data"
                Field       = "UserPrincipalName"
                Description = "UserPrincipalName is missing or empty."
                Severity    = "High"
                Recommendation = "Investigate source data for this user; UPN is critical."
            })
            $currentProfileIssueCount++
        }

        # Example: Check for missing DisplayName
        if ([string]::IsNullOrWhiteSpace($profile.DisplayName)) {
            $issuesFound.Add([PSCustomObject]@{
                Identifier  = $profile.UserPrincipalName # Use UPN if DisplayName is missing
                IssueType   = "Missing Data"
                Field       = "DisplayName"
                Description = "DisplayName is missing or empty."
                Severity    = "Medium"
                Recommendation = "Populate DisplayName for better reporting and user experience."
            })
            $currentProfileIssueCount++
        }
        
        # Example: Check if ComplexityScore was calculated (assuming it shouldn't be 0 if assessed)
        # This depends on your actual scoring logic; 0 might be a valid score.
        # if ($profile.PSObject.Properties["ComplexityScore"] -and $profile.ComplexityScore -is [int] -and $profile.MigrationCategory -eq "Not Assessed") {
        #     $issuesFound.Add([PSCustomObject]@{
        #         Identifier  = $profile.UserPrincipalName
        #         IssueType   = "Processing Incomplete"
        #         Field       = "MigrationCategory"
        #         Description = "Migration category is 'Not Assessed', complexity scoring might not have run fully."
        #         Severity    = "Medium"
        #         Recommendation = "Verify complexity calculation step for this user."
        #     })
        #     $currentProfileIssueCount++
        # }

        # Add more validation rules:
        # - Email format for UPN/Mail
        # - Consistency checks (e.g., IsEnabled vs LastLogonDate)
        # - Expected value ranges for scores, etc.
        # - Check if Department is populated if generating waves by department
        if ($Configuration.processing.generateWavesByDepartment -and [string]::IsNullOrWhiteSpace($profile.Department)) {
            $issuesFound.Add([PSCustomObject]@{
                Identifier  = $profile.UserPrincipalName
                IssueType   = "Missing Configuration Data"
                Field       = "Department"
                Description = "Department is missing, but wave generation is by department."
                Severity    = "High"
                Recommendation = "Populate department information or change wave generation strategy."
            })
            $currentProfileIssueCount++
        }

        if ($currentProfileIssueCount -gt 0) {
            $invalidRecords++ # This profile has one or more issues
        } else {
            $validRecords++
        }
    }
    Write-Progress -Activity "Validating Data Quality" -Completed

    $totalRecords = $Profiles.Count
    $qualityScore = 100.0 # Default to 100 if no records
    if ($totalRecords -gt 0) {
        $qualityScore = [math]::Round(($validRecords / $totalRecords) * 100, 2)
    }

    Write-MandALog "Data Quality Validation completed." -Level "SUCCESS"
    Write-MandALog "Total Profiles: $totalRecords, Profiles with Issues: $invalidRecords, Valid Profiles: $validRecords, Quality Score: $qualityScore %" -Level "INFO"

    return @{
        TotalRecords   = $totalRecords
        ValidRecords   = $validRecords
        InvalidRecords = $invalidRecords # Number of profiles with at least one issue
        TotalIssues    = $issuesFound.Count # Total number of distinct issues found
        QualityScore   = $qualityScore
        Issues         = $issuesFound # List of specific issue objects
    }
}

# Function to generate a quality report
function New-QualityReport {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$ValidationResults, # The output from Test-DataQuality

        [Parameter(Mandatory = $true)]
        [string]$OutputPath, # Base path for Processed data, e.g., "C:\MandADiscovery\Output\Processed"

        [Parameter(Mandatory = $false)]
        [string]$ReportFileName = "DataQualityReport_$(Get-Date -Format 'yyyyMMddHHmmss').txt"
    )

    Write-MandALog "Generating Data Quality Report..." -Level "INFO"
    
    $reportFilePath = Join-Path $OutputPath $ReportFileName

    $reportContent = @"
M&A Discovery Suite - Data Quality Report
=========================================
Date: $(Get-Date)

Summary:
--------
Total Records Processed: $($ValidationResults.TotalRecords)
Profiles with Issues:    $($ValidationResults.InvalidRecords)
Valid Profiles:          $($ValidationResults.ValidRecords)
Total Issues Found:      $($ValidationResults.TotalIssues)
Data Quality Score:      $($ValidationResults.QualityScore)%

Detailed Issues Found ($($ValidationResults.Issues.Count)):
----------------------
"@

    if ($ValidationResults.Issues.Count -gt 0) {
        # Group issues by type for better readability in the report
        $groupedIssues = $ValidationResults.Issues | Group-Object IssueType
        foreach ($group in $groupedIssues) {
            $reportContent += "`nIssue Type: $($group.Name) ($($group.Count) occurrences)`n"
            $reportContent += ("-" * ($group.Name.Length + 23)) + "`n"
            $group.Group | ForEach-Object {
                $reportContent += @"
    Identifier:  $($_.Identifier)
    Field:       $($_.Field)
    Description: $($_.Description)
    Severity:    $($_.Severity)
    Recommendation: $($_.Recommendation)
    ----------
"@
            }
        }
    } else {
        $reportContent += "`nNo specific data quality issues found."
    }

    try {
        $reportContent | Set-Content -Path $reportFilePath -Encoding UTF8
        Write-MandALog "Data Quality Report generated: $reportFilePath" -Level "SUCCESS"
    } catch {
        Write-MandALog "Failed to generate Data Quality Report: $($_.Exception.Message)" -Level "ERROR"
    }
}

Export-ModuleMember -Function Test-DataQuality, New-QualityReport
