#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Data Validation Module
.DESCRIPTION
    This module is responsible for validating the quality and completeness of
    processed data (e.g., user profiles) and generating quality reports.
.NOTES
    Version: 1.1.0 (Refactored for orchestrator data contracts)
    Author: Gemini
#>

[CmdletBinding()]
param()

# Main function to test data quality
function Test-DataQuality {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [System.Collections.IList]$Profiles, # Expects an array/list of user profile objects

        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration
    )

    Write-MandALog "Starting Data Quality Validation for $($Profiles.Count) profiles..." -Level "INFO"
    $issuesFound = [System.Collections.Generic.List[object]]::new()
    $validRecords = 0
    $invalidRecords = 0

    if ($Profiles.Count -eq 0) {
        Write-MandALog "No user profiles provided. Skipping data quality validation." -Level "WARN"
        return @{ TotalRecords = 0; ValidRecords = 0; InvalidRecords = 0; QualityScore = 100; Issues = $issuesFound }
    }
    
    $processedCount = 0
    foreach ($profile in $Profiles) {
        $processedCount++
        Update-Progress -Activity "Validating Data Quality" -Status "Profile $processedCount of $($Profiles.Count)" -PercentComplete (($processedCount / $Profiles.Count) * 100)

        $currentProfileIssues = 0
        # Placeholder: Detailed data validation logic
        if ([string]::IsNullOrWhiteSpace($profile.UserPrincipalName)) {
            $issuesFound.Add([PSCustomObject]@{
                Identifier  = $profile.DisplayName # Or another available identifier
                IssueType   = "Missing Data"
                Field       = "UserPrincipalName"
                Description = "UserPrincipalName is missing or empty."
                Severity    = "High"
            })
            $currentProfileIssues++
        }
        if ([string]::IsNullOrWhiteSpace($profile.DisplayName)) {
            $issuesFound.Add([PSCustomObject]@{
                Identifier  = $profile.UserPrincipalName
                IssueType   = "Missing Data"
                Field       = "DisplayName"
                Description = "DisplayName is missing or empty."
                Severity    = "Medium"
            })
            $currentProfileIssues++
        }
        # Add more validation rules:
        # - Email format for UPN/Mail
        # - Consistency checks (e.g., IsEnabled vs LastLogonDate)
        # - Expected value ranges for scores, etc.

        if ($currentProfileIssues -gt 0) {
            $invalidRecords++
        } else {
            $validRecords++
        }
    }
    Write-Progress -Activity "Validating Data Quality" -Completed

    $totalRecords = $Profiles.Count
    $qualityScore = 0
    if ($totalRecords -gt 0) {
        $qualityScore = [math]::Round(($validRecords / $totalRecords) * 100, 2)
    }

    Write-MandALog "Data Quality Validation completed." -Level "SUCCESS"
    Write-MandALog "Total Profiles: $totalRecords, Valid: $validRecords, Invalid: $invalidRecords, Quality Score: $qualityScore %" -Level "INFO"

    return @{
        TotalRecords   = $totalRecords
        ValidRecords   = $validRecords
        InvalidRecords = $invalidRecords
        QualityScore   = $qualityScore
        Issues         = $issuesFound # List of specific issues
    }
}

# Function to generate a quality report
function New-QualityReport {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$ValidationResults, # The output from Test-DataQuality

        [Parameter(Mandatory = $true)]
        [string]$OutputPath # Base path for Processed data, e.g., "C:\MandADiscovery\Output\Processed"
    )

    Write-MandALog "Generating Data Quality Report..." -Level "INFO"
    
    $reportFileName = "DataQualityReport_$(Get-Date -Format 'yyyyMMddHHmmss').txt"
    $reportFilePath = Join-Path $OutputPath $reportFileName

    $reportContent = @"
M&A Discovery Suite - Data Quality Report
=========================================
Date: $(Get-Date)

Summary:
--------
Total Records Processed: $($ValidationResults.TotalRecords)
Valid Records:           $($ValidationResults.ValidRecords)
Invalid Records:         $($ValidationResults.InvalidRecords)
Data Quality Score:      $($ValidationResults.QualityScore)%

Detailed Issues Found ($($ValidationResults.Issues.Count)):
----------------------
"@

    if ($ValidationResults.Issues.Count -gt 0) {
        $ValidationResults.Issues | ForEach-Object {
            $reportContent += @"
Identifier:  $($_.Identifier)
Issue Type:  $($_.IssueType)
Field:       $($_.Field)
Description: $($_.Description)
Severity:    $($_.Severity)
----------
"@
        }
    } else {
        $reportContent += "No specific issues found."
    }

    try {
        $reportContent | Set-Content -Path $reportFilePath -Encoding UTF8
        Write-MandALog "Data Quality Report generated: $reportFilePath" -Level "SUCCESS"
    } catch {
        Write-MandALog "Failed to generate Data Quality Report: $($_.Exception.Message)" -Level "ERROR"
    }
}

Export-ModuleMember -Function Test-DataQuality, New-QualityReport
