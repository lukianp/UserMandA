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
        return @{ TotalRecords = 0; ValidRecords = 0; InvalidRecords = 0; TotalIssues = 0; QualityScore = 100; Issues = $issuesFound }
    }
    
    $processedCount = 0
    foreach ($profile in $Profiles) {
        $processedCount++
        Update-Progress -Activity "Validating Data Quality" -Status "Profile $processedCount of $($Profiles.Count)" -PercentComplete (($processedCount / $Profiles.Count) * 100)

        $currentProfileIssueCount = 0
        
        # --- Detailed Data Validation Rules ---

        # Rule 1: Check for missing UserPrincipalName (Critical)
        if ([string]::IsNullOrWhiteSpace($profile.UserPrincipalName)) {
            $issuesFound.Add([PSCustomObject]@{
                Identifier  = $profile.DisplayName # Fallback identifier
                IssueType   = "Missing Critical Data"
                Field       = "UserPrincipalName"
                Description = "UserPrincipalName is missing or empty. This is a critical identifier."
                Severity    = "High"
                Recommendation = "Investigate source data for this user; UPN is essential for matching and migration."
            })
            $currentProfileIssueCount++
        }

        # Rule 2: Check for missing DisplayName
        if ([string]::IsNullOrWhiteSpace($profile.DisplayName)) {
            $issuesFound.Add([PSCustomObject]@{
                Identifier  = $profile.UserPrincipalName # Use UPN if DisplayName is missing
                IssueType   = "Missing Identifying Data"
                Field       = "DisplayName"
                Description = "DisplayName is missing or empty."
                Severity    = "Medium"
                Recommendation = "Populate DisplayName for better reporting and user identification."
            })
            $currentProfileIssueCount++
        }
        
        # Rule 3: Check if MigrationCategory was assessed
        if ($profile.PSObject.Properties["MigrationCategory"] -and $profile.MigrationCategory -eq "Not Assessed") {
            $issuesFound.Add([PSCustomObject]@{
                Identifier  = $profile.UserPrincipalName
                IssueType   = "Processing Incomplete"
                Field       = "MigrationCategory"
                Description = "Migration category is 'Not Assessed'. Complexity scoring might not have run fully or user fits no defined category."
                Severity    = "Medium"
                Recommendation = "Verify complexity calculation step for this user and ensure scoring thresholds in configuration are appropriate."
            })
            $currentProfileIssueCount++
        }

        # Rule 4: Check if Department is populated if generating waves by department
        if ($Configuration.processing.ContainsKey('generateWavesByDepartment') -and $Configuration.processing.generateWavesByDepartment -and [string]::IsNullOrWhiteSpace($profile.Department)) {
            $issuesFound.Add([PSCustomObject]@{
                Identifier  = $profile.UserPrincipalName
                IssueType   = "Missing Configuration Data for Waves"
                Field       = "Department"
                Description = "Department is missing, but wave generation is configured by department. This user may be excluded or miscategorized."
                Severity    = "High" 
                Recommendation = "Populate department information for all users or adjust wave generation strategy in configuration."
            })
            $currentProfileIssueCount++
        }

        # Rule 5: Check for potentially invalid email format in Mail property (simple check)
        if (-not [string]::IsNullOrWhiteSpace($profile.Mail) -and $profile.Mail -notmatch "^\S+@\S+\.\S+$") {
             $issuesFound.Add([PSCustomObject]@{
                Identifier  = $profile.UserPrincipalName
                IssueType   = "Invalid Data Format"
                Field       = "Mail"
                Description = "Mail property '$($profile.Mail)' does not appear to be a valid email format."
                Severity    = "Low"
                Recommendation = "Verify the email address format for this user."
            })
            $currentProfileIssueCount++
        }
        
        # Rule 6: Check if LastLogon date is very old, indicating potential stale account
        if ($profile.PSObject.Properties["LastLogon"] -and $profile.LastLogon) {
            try {
                $lastLogonDate = [datetime]$profile.LastLogon
                if ($lastLogonDate -lt (Get-Date).AddYears(-2)) { # Example: older than 2 years
                     $issuesFound.Add([PSCustomObject]@{
                        Identifier  = $profile.UserPrincipalName
                        IssueType   = "Stale Data Indication"
                        Field       = "LastLogon"
                        Description = "Last logon date ($($lastLogonDate.ToString('yyyy-MM-dd'))) is older than 2 years."
                        Severity    = "Medium"
                        Recommendation = "Confirm if this account is still active or should be considered for decommissioning/archival rather than migration."
                    })
                    $currentProfileIssueCount++
                }
            } catch {
                 Write-MandALog "Could not parse LastLogon date '$($profile.LastLogon)' for data validation on $($profile.UserPrincipalName)." -Level "DEBUG"
            }
        }

        # Add more specific validation rules as per your suite's requirements.
        # For example:
        # - Check if HasADAccount and HasGraphAccount are consistent with expectations for synced users.
        # - Check if MailboxSizeMB is a non-negative number.
        # - Validate specific license assignments if you have a list of expected/problematic ones.

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
        InvalidRecords = $invalidRecords 
        TotalIssues    = $issuesFound.Count 
        QualityScore   = $qualityScore
        Issues         = $issuesFound 
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

    # Ensure directory exists
    $outputDir = Split-Path $reportFilePath -Resolve # Use -Resolve to get full path if $OutputPath is relative
    if (-not (Test-Path $outputDir)) {
        try {
            New-Item -Path $outputDir -ItemType Directory -Force | Out-Null
            Write-MandALog "Created directory for quality report: $outputDir" -Level "DEBUG"
        } catch {
             Write-MandALog "Failed to create directory for quality report '$outputDir': $($_.Exception.Message)" -Level "ERROR"
             return # Cannot proceed
        }
    }

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
        $groupedIssues = $ValidationResults.Issues | Group-Object IssueType | Sort-Object Name
        foreach ($group in $groupedIssues) {
            $reportContent += "`nIssue Type: $($group.Name) ($($group.Count) occurrences)`n"
            $reportContent += ("-" * ($group.Name.Length + 23)) + "`n" # Dynamic underline
            $group.Group | Sort-Object Severity, Identifier | ForEach-Object { # Sort issues within the group
                $reportContent += @"
    Identifier:     $($_.Identifier)
    Field:          $($_.Field)
    Severity:       $($_.Severity)
    Description:    $($_.Description)
    Recommendation: $($_.Recommendation)
    ----------
"@
            }
        }
    } else {
        $reportContent += "`nNo specific data quality issues found."
    }

    try {
        Set-Content -Path $reportFilePath -Value $reportContent -Encoding UTF8
        Write-MandALog "Data Quality Report generated: $reportFilePath" -Level "SUCCESS"
    } catch {
        Write-MandALog "Failed to generate Data Quality Report: $($_.Exception.Message)" -Level "ERROR"
    }
}

Export-ModuleMember -Function Test-DataQuality, New-QualityReport
