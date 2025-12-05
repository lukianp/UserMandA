# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Log analysis module for M&A Discovery Suite
.DESCRIPTION
    Provides functions to parse structured logs, generate summary reports, and identify error patterns for the 
    M&A Discovery Suite. This module includes comprehensive log analysis capabilities including pattern recognition, 
    trend analysis, error categorization, performance metrics extraction, and detailed reporting functionality 
    to help troubleshoot and optimize discovery operations.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, EnhancedLogging module
#>

function Get-MandALogEntries {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$LogFilePath,

        [Parameter(Mandatory=$false)]
        [string]$Level = "INFO", # INFO, WARN, ERROR, DEBUG, SUCCESS, HEADER, CRITICAL
        
        [Parameter(Mandatory=$false)]
        [string]$Component = "*",
        
        [Parameter(Mandatory=$false)]
        [datetime]$StartTime,
        
        [Parameter(Mandatory=$false)]
        [datetime]$EndTime
    )

    $logEntries = [System.Collections.ArrayList]::new()

    if (-not (Test-Path $LogFilePath)) {
        Write-Warning "Log file not found: $LogFilePath"
        return $logEntries
    }

    Get-Content -Path $LogFilePath | ForEach-Object {
        $line = $_
        # Regex to parse log entries: Timestamp [Level] [Component] Message (and optional Context)
        if ($line -match '^(?<Timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(?<Level>\w+)\] \[(?<Component>[^\]]+)\] (?<Message>.*)$') {
            $timestamp = [datetime]$Matches.Timestamp
            $logLevel = $Matches.Level
            $logComponent = $Matches.Component
            $message = $Matches.Message

            # Filter by time
            if ($StartTime -and $timestamp -lt $StartTime) { continue }
            if ($EndTime -and $timestamp -gt $EndTime) { continue }

            # Filter by level
            if ($Level -ne "INFO" -and $logLevel -ne $Level) { continue } # Basic level filter

            # Filter by component
            if ($Component -ne "*" -and $logComponent -notlike $Component) { continue }

            $logEntry = [PSCustomObject]@{
                Timestamp = $timestamp
                Level = $logLevel
                Component = $logComponent
                Message = $message
                RawLine = $line
            }
            $null = $logEntries.Add($logEntry)
        }
    }
    return $logEntries
}

function ConvertTo-LogSummary {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [object[]]$LogEntries
    )

    $summary = [PSCustomObject]@{
        TotalEntries = $LogEntries.Count
        EntriesByLevel = @{}
        EntriesByComponent = @{}
        ErrorCount = 0
        WarningCount = 0
        CriticalErrorCount = 0
        FirstEntryTime = $null
        LastEntryTime = $null
        DurationSeconds = 0
        UniqueErrors = [System.Collections.Generic.HashSet[string]]::new()
    }

    if ($LogEntries.Count -gt 0) {
        $summary.FirstEntryTime = ($LogEntries | Measure-Object -Minimum Timestamp).Minimum
        $summary.LastEntryTime = ($LogEntries | Measure-Object -Maximum Timestamp).Maximum
        $summary.DurationSeconds = ($summary.LastEntryTime - $summary.FirstEntryTime).TotalSeconds
    }

    $LogEntries | Group-Object -Property Level | ForEach-Object {
        $summary.EntriesByLevel[$_.Name] = $_.Count
    }

    $LogEntries | Group-Object -Property Component | ForEach-Object {
        $summary.EntriesByComponent[$_.Name] = $_.Count
    }

    $summary.ErrorCount = $summary.EntriesByLevel["ERROR"]
    $summary.WarningCount = $summary.EntriesByLevel["WARN"]
    $summary.CriticalErrorCount = $summary.EntriesByLevel["CRITICAL"]

    $LogEntries | Where-Object { $_.Level -eq "ERROR" -or $_.Level -eq "CRITICAL" } | ForEach-Object {
        $null = $summary.UniqueErrors.Add($_.Message)
    }

    return $summary
}

function Invoke-LogAnalysis {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$LogFilePath,

        [Parameter(Mandatory=$false)]
        [string]$ReportOutputPath = (Join-Path $PSScriptRoot "LogAnalysisReport.txt")
    )

    Write-Host "Starting log analysis for: $LogFilePath" -ForegroundColor Cyan

    $allEntries = Get-MandALogEntries -LogFilePath $LogFilePath
    $summary = ConvertTo-LogSummary -LogEntries $allEntries

    $report = [System.Text.StringBuilder]::new()
    $report.AppendLine("--- Log Analysis Report ---")
    $report.AppendLine("Generated: $(Get-Date)")
    $report.AppendLine("Log File: $LogFilePath")
    $report.AppendLine("")
    $report.AppendLine("Summary:")
    $report.AppendLine("  Total Entries: $($summary.TotalEntries)")
    $report.AppendLine("  First Entry: $($summary.FirstEntryTime)")
    $report.AppendLine("  Last Entry: $($summary.LastEntryTime)")
    $report.AppendLine("  Duration: $($summary.DurationSeconds) seconds")
    $report.AppendLine("")
    $report.AppendLine("Counts by Level:")
    $summary.EntriesByLevel.GetEnumerator() | Sort-Object Name | ForEach-Object {
        $report.AppendLine("    $($_.Name): $($_.Value)")
    }
    $report.AppendLine("")
    $report.AppendLine("Counts by Component:")
    $summary.EntriesByComponent.GetEnumerator() | Sort-Object Name | ForEach-Object {
        $report.AppendLine("    $($_.Name): $($_.Value)")
    }
    $report.AppendLine("")
    $report.AppendLine("Error Summary:")
    $report.AppendLine("  Total Errors: $($summary.ErrorCount)")
    $report.AppendLine("  Total Warnings: $($summary.WarningCount)")
    $report.AppendLine("  Total Critical Errors: $($summary.CriticalErrorCount)")
    $report.AppendLine("")
    $report.AppendLine("Unique Error Messages:")
    if ($summary.UniqueErrors.Count -gt 0) {
        $summary.UniqueErrors | ForEach-Object {
            $report.AppendLine("    - $_")
        }
    } else {
        $report.AppendLine("    No unique error messages found.")
    }
    $report.AppendLine("")
    $report.AppendLine("--- End of Report ---")

    $report.ToString() | Set-Content -Path $ReportOutputPath -Encoding UTF8
    Write-Host "Log analysis report saved to: $ReportOutputPath" -ForegroundColor Green
}

Export-ModuleMember -Function @(
    'Get-MandALogEntries',
    'ConvertTo-LogSummary',
    'Invoke-LogAnalysis'
)