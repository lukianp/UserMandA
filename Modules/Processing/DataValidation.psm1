# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-04
# Last Modified: 2025-06-06
# Change Log: Updated version control header

<#
.SYNOPSIS

# Module-scope context variable
$script:ModuleContext = $null

# Lazy initialization function
function Get-ModuleContext {
    if ($null -eq $script:ModuleContext) {
        if ($null -ne $global:MandA) {
            $script:ModuleContext = $global:MandA
        } else {
            throw "Module context not available"
        }
    }
    return $script:ModuleContext
}


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
        Success = $false
        Data = $null
        Error = $null
        Duration = $null
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
        
    } catch {
        $result.Error = @{
            Message = $_.Exception.Message
            Type = $_.Exception.GetType().FullName
            StackTrace = $_.ScriptStackTrace
            InnerException = if ($_.Exception.InnerException) { $_.Exception.InnerException.Message } else { $null }
        }
        
        # Log to both file and console
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "[$ModuleName] Error: $($_.Exception.Message)" -Level "ERROR" -Component $ModuleName -Context $Context
        } else {
            Write-Host "[$ModuleName] Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Don't rethrow - let caller handle based on result
    } finally {
        $stopwatch.Stop()
        $result.Duration = $stopwatch.Elapsed
    }
    
    return $result
}


    M&A Discovery Suite - Data Validation Module
.DESCRIPTION
    This module is responsible for validating the quality and completeness of
    processed data (e.g., user profiles) and generating quality reports.
.NOTES
    Version: 1.2.1 (Corrected context access at module scope)
    Author: Gemini
#>

[CmdletBinding()]
param()

# NOTE: Context access has been moved to function scope to avoid module loading issues.
# The global context ($global:MandA) will be accessed by functions when they are called,
# rather than at module import time.

# Main function to test data quality
function Test-DataQuality {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [System.Collections.IList]$Profiles, # Expects an array/list of user profile objects from UserProfileBuilder

        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration
    )
    # Use Write-MandALog if available, otherwise Write-Host
    $LogFn = if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { Get-Command Write-MandALog } else { Get-Command Write-Host }

    $LogFn.Invoke("Starting Data Quality Validation for $($Profiles.Count) profiles..." , "INFO")
    $issuesFound = [System.Collections.Generic.List[object]]::new()
    $validRecords = 0
    $invalidRecords = 0 # Tracks profiles with at least one issue

    if ($null -eq $Profiles -or $Profiles.Count -eq 0) {
        $LogFn.Invoke("No user profiles provided. Skipping data quality validation.", "WARN")
        return @{ TotalRecords = 0; ValidRecords = 0; InvalidRecords = 0; TotalIssues = 0; QualityScore = 100; Issues = $issuesFound }
    }
    
    $processedCount = 0
    foreach ($userProfile in $Profiles) {
        $processedCount++
        if (Get-Command Update-Progress -ErrorAction SilentlyContinue) {
            Update-Progress -Activity "Validating Data Quality" -Status "Profile $processedCount of $($Profiles.Count)" -PercentComplete (($processedCount / $Profiles.Count) * 100)
        }
        $currentProfileIssueCount = 0
        
        # Rule 1: Check for missing UserPrincipalName (Critical)
        if ([string]::IsNullOrWhiteSpace($userProfile.UserPrincipalName)) {
            $issuesFound.Add([PSCustomObject]@{
                Identifier  = $userProfile.DisplayName # Fallback identifier
                IssueType   = "Missing Critical Data"
                Field       = "UserPrincipalName"
                Description = "UserPrincipalName is missing or empty. This is a critical identifier."
                Severity    = "High"
                Recommendation = "Investigate source data for this user; UPN is essential for matching and migration."
            })
            $currentProfileIssueCount++
        }

        # Rule 2: Check for missing DisplayName
        if ([string]::IsNullOrWhiteSpace($userProfile.DisplayName)) {
            $issuesFound.Add([PSCustomObject]@{
                Identifier  = $userProfile.UserPrincipalName # Use UPN if DisplayName is missing
                IssueType   = "Missing Identifying Data"
                Field       = "DisplayName"
                Description = "DisplayName is missing or empty."
                Severity    = "Medium"
                Recommendation = "Populate DisplayName for better reporting and user identification."
            })
            $currentProfileIssueCount++
        }
        
        # Rule 3: Check if MigrationCategory was assessed
        if ($userProfile.PSObject.Properties["MigrationCategory"] -and $userProfile.MigrationCategory -eq "Not Assessed") {
            $issuesFound.Add([PSCustomObject]@{
                Identifier  = $userProfile.UserPrincipalName
                IssueType   = "Processing Incomplete"
                Field       = "MigrationCategory"
                Description = "Migration category is 'Not Assessed'. Complexity scoring might not have run fully or user fits no defined category."
                Severity    = "Medium"
                Recommendation = "Verify complexity calculation step for this user and ensure scoring thresholds in configuration are appropriate."
            })
            $currentProfileIssueCount++
        }

        # Rule 4: Check if Department is populated if generating waves by department
        if ($Configuration.processing.ContainsKey('generateWavesByDepartment') -and $Configuration.processing.generateWavesByDepartment -and [string]::IsNullOrWhiteSpace($userProfile.Department)) {
            $issuesFound.Add([PSCustomObject]@{
                Identifier  = $userProfile.UserPrincipalName
                IssueType   = "Missing Configuration Data for Waves"
                Field       = "Department"
                Description = "Department is missing, but wave generation is configured by department. This user may be excluded or miscategorized."
                Severity    = "High" 
                Recommendation = "Populate department information for all users or adjust wave generation strategy in configuration."
            })
            $currentProfileIssueCount++
        }

        # Rule 5: Check for potentially invalid email format in Mail property (simple check)
        if (-not [string]::IsNullOrWhiteSpace($userProfile.Mail) -and $userProfile.Mail -notmatch "^\S+@\S+\.\S+$") {
             $issuesFound.Add([PSCustomObject]@{
                Identifier  = $userProfile.UserPrincipalName
                IssueType   = "Invalid Data Format"
                Field       = "Mail"
                Description = "Mail property '$($userProfile.Mail)' does not appear to be a valid email format."
                Severity    = "Low"
                Recommendation = "Verify the email address format for this user."
            })
            $currentProfileIssueCount++
        }
        
        # Rule 6: Check if LastLogon date is very old, indicating potential stale account
        if ($userProfile.PSObject.Properties["LastLogon"] -and $userProfile.LastLogon) {
            try {
                $lastLogonDate = [datetime]$userProfile.LastLogon
                if ($lastLogonDate -lt (Get-Date).AddYears(-2)) { # Example: older than 2 years
                     $issuesFound.Add([PSCustomObject]@{
                        Identifier  = $userProfile.UserPrincipalName
                        IssueType   = "Stale Data Indication"
                        Field       = "LastLogon"
                        Description = "Last logon date ($($lastLogonDate.ToString('yyyy-MM-dd'))) is older than 2 years."
                        Severity    = "Medium"
                        Recommendation = "Confirm if this account is still active or should be considered for decommissioning/archival rather than migration."
                    })
                    $currentProfileIssueCount++
                }
            } catch {
                 $LogFn.Invoke("Could not parse LastLogon date '$($userProfile.LastLogon)' for data validation on $($userProfile.UserPrincipalName).", "DEBUG")
            }
        }

        if ($currentProfileIssueCount -gt 0) {
            $invalidRecords++ # This profile has one or more issues
        } else {
            $validRecords++
        }
    }
    if (Get-Command Write-Progress -ErrorAction SilentlyContinue) { Write-Progress -Activity "Validating Data Quality" -Completed }

    $totalRecords = $Profiles.Count
    $qualityScore = 100.0 # Default to 100 if no records
    if ($totalRecords -gt 0) {
        $qualityScore = [math]::Round(($validRecords / $totalRecords) * 100, 2)
    }

    $LogFn.Invoke("Data Quality Validation completed.", "SUCCESS")
    $LogFn.Invoke("Total Profiles: $totalRecords, Profiles with Issues: $invalidRecords, Valid Profiles: $validRecords, Quality Score: $qualityScore %", "INFO")

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
    $LogFn = if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { Get-Command Write-MandALog } else { Get-Command Write-Host }
    $LogFn.Invoke("Generating Data Quality Report...", "INFO")
    
    $reportFilePath = Join-Path $OutputPath $ReportFileName

    $outputDirToEnsure = Split-Path $reportFilePath -Resolve # Renamed $outputDir
    if (-not (Test-Path $outputDirToEnsure)) {
        try {
            New-Item -Path $outputDirToEnsure -ItemType Directory -Force | Out-Null
            $LogFn.Invoke("Created directory for quality report: $outputDirToEnsure", "DEBUG")
        } catch {
             $LogFn.Invoke("Failed to create directory for quality report '$outputDirToEnsure': $($_.Exception.Message)", "ERROR")
             return 
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
        $groupedIssues = $ValidationResults.Issues | Group-Object IssueType | Sort-Object Name
        foreach ($group in $groupedIssues) {
            $reportContent += "`nIssue Type: $($group.Name) ($($group.Count) occurrences)`n"
            $reportContent += ("-" * ($group.Name.Length + 23)) + "`n" 
            $group.Group | Sort-Object Severity, Identifier | ForEach-Object { 
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
        $LogFn.Invoke("Data Quality Report generated: $reportFilePath", "SUCCESS")
    } catch {
        $LogFn.Invoke("Failed to generate Data Quality Report: $($_.Exception.Message)", "ERROR")
    }
}

Export-ModuleMember -Function Test-DataQuality, New-QualityReport

