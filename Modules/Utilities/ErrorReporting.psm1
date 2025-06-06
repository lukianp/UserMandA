# -*- coding: utf-8-bom -*-
#Requires -Version 5.1
<#
.SYNOPSIS
    Provides comprehensive error reporting and export capabilities for the M&A Discovery Suite.
.DESCRIPTION
    This module includes functions to generate detailed error reports, export them in multiple formats,
    and provide comprehensive analysis of errors across discovery phases. It integrates with the
    existing ErrorHandling and EnhancedLogging modules.
.NOTES
    Version: 1.0.0
    Author: M&A Discovery Suite Team
    Date: 2025-06-06

    Key Design Points:
    - Integrates with existing DiscoveryResult class and error handling infrastructure
    - Uses Write-MandALog for consistent logging
    - Supports multiple export formats (JSON, CSV, HTML)
    - Provides both detailed and summary reporting
    - Categorizes errors by severity and impact
#>

Export-ModuleMember -Function Export-ErrorReport, Export-PhaseErrorReport, New-ErrorSummaryReport, Export-ErrorAnalysis, Get-ErrorStatistics, Export-ErrorContext

# Import required modules if not already loaded
if (-not (Get-Module -Name "ErrorHandling")) {
    Import-Module "$PSScriptRoot\ErrorHandling.psm1" -Force
}
if (-not (Get-Module -Name "EnhancedLogging")) {
    Import-Module "$PSScriptRoot\EnhancedLogging.psm1" -Force
}

function Export-ErrorReport {
    <#
    .SYNOPSIS
        Creates comprehensive error reports from phase results.
    .DESCRIPTION
        Generates detailed error reports including critical errors, recoverable errors,
        warnings, and module-specific details. Exports in multiple formats.
    .PARAMETER PhaseResult
        The hashtable containing phase execution results.
    .PARAMETER OutputPath
        The directory where reports will be saved. Defaults to LogOutput path.
    .PARAMETER ReportName
        Base name for the report files. Defaults to "ErrorReport".
    .PARAMETER IncludeTimestamp
        Whether to include timestamp in filenames (default: true).
    .PARAMETER ExportFormats
        Array of export formats: JSON, CSV, HTML (default: all).
    .PARAMETER Context
        Logging context for consistent logging.
    .EXAMPLE
        $phaseResult = @{
            Success = $false
            ModuleResults = @{
                "ActiveDirectory" = [DiscoveryResult]::new("ActiveDirectory")
                "Graph" = [DiscoveryResult]::new("Graph")
            }
            CriticalErrors = @()
            RecoverableErrors = @()
            Warnings = @()
        }
        Export-ErrorReport -PhaseResult $phaseResult -Context $global:MandA
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$PhaseResult,
        
        [Parameter(Mandatory=$false)]
        [string]$OutputPath,
        
        [Parameter(Mandatory=$false)]
        [string]$ReportName = "ErrorReport",
        
        [Parameter(Mandatory=$false)]
        [bool]$IncludeTimestamp = $true,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet("JSON", "CSV", "HTML")]
        [string[]]$ExportFormats = @("JSON", "CSV", "HTML"),
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    Write-MandALog -Message "Starting comprehensive error report generation" -Level "INFO" -Component "ErrorReporting" -Context $Context
    
    try {
        # Determine output path
        if ([string]::IsNullOrWhiteSpace($OutputPath)) {
            if ($Context -and $Context.PSObject.Properties['Paths'] -and $Context.Paths.PSObject.Properties['LogOutput']) {
                $OutputPath = $Context.Paths.LogOutput
            } elseif ($global:MandA -and $global:MandA.ContainsKey('Paths') -and $global:MandA.Paths.ContainsKey('LogOutput')) {
                $OutputPath = $global:MandA.Paths.LogOutput
            } else {
                $OutputPath = ".\ErrorReports"
            }
        }
        
        # Ensure output directory exists
        if (-not (Test-Path $OutputPath)) {
            New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
            Write-MandALog -Message "Created error report directory: $OutputPath" -Level "INFO" -Component "ErrorReporting" -Context $Context
        }
        
        # Generate timestamp for filenames
        $timestamp = if ($IncludeTimestamp) { Get-Date -Format 'yyyyMMdd_HHmmss' } else { "" }
        $baseFileName = if ($timestamp) { "${ReportName}_${timestamp}" } else { $ReportName }
        
        # Build comprehensive error report
        $errorReport = Build-ComprehensiveErrorReport -PhaseResult $PhaseResult -Context $Context
        
        $exportedFiles = @()
        
        # Export in requested formats
        foreach ($format in $ExportFormats) {
            switch ($format) {
                "JSON" {
                    $jsonPath = Join-Path $OutputPath "$baseFileName.json"
                    $errorReport | ConvertTo-Json -Depth 10 | Set-Content -Path $jsonPath -Encoding UTF8
                    $exportedFiles += $jsonPath
                    Write-MandALog -Message "JSON error report saved to: $jsonPath" -Level "SUCCESS" -Component "ErrorReporting" -Context $Context
                }
                "CSV" {
                    $csvPath = Join-Path $OutputPath "$baseFileName.csv"
                    Export-ErrorReportToCsv -ErrorReport $errorReport -OutputPath $csvPath -Context $Context
                    $exportedFiles += $csvPath
                    Write-MandALog -Message "CSV error report saved to: $csvPath" -Level "SUCCESS" -Component "ErrorReporting" -Context $Context
                }
                "HTML" {
                    $htmlPath = Join-Path $OutputPath "$baseFileName.html"
                    Export-ErrorReportToHtml -ErrorReport $errorReport -OutputPath $htmlPath -Context $Context
                    $exportedFiles += $htmlPath
                    Write-MandALog -Message "HTML error report saved to: $htmlPath" -Level "SUCCESS" -Component "ErrorReporting" -Context $Context
                }
            }
        }
        
        # Generate human-readable summary
        $summaryPath = Join-Path $OutputPath "${baseFileName}_Summary.txt"
        Export-ErrorSummaryText -ErrorReport $errorReport -OutputPath $summaryPath -Context $Context
        $exportedFiles += $summaryPath
        
        Write-MandALog -Message "Error report generation completed. Files exported: $($exportedFiles.Count)" -Level "SUCCESS" -Component "ErrorReporting" -Context $Context
        
        return @{
            Success = $true
            ExportedFiles = $exportedFiles
            Summary = $errorReport.Summary
            ReportPath = $OutputPath
        }
        
    } catch {
        $enhancedError = Add-ErrorContext -ErrorRecord $_ -Context @{
            Operation = "Export-ErrorReport"
            PhaseResultKeys = $PhaseResult.Keys -join ", "
            OutputPath = $OutputPath
            ReportName = $ReportName
        } -LoggingContext $Context
        
        Write-MandALog -Message "Failed to generate error report: $($_.Exception.Message)" -Level "ERROR" -Component "ErrorReporting" -Context $Context
        throw
    }
}

function Export-PhaseErrorReport {
    <#
    .SYNOPSIS
        Exports error reports for specific discovery phases.
    .DESCRIPTION
        Creates phase-specific error reports with detailed module analysis and recommendations.
    .PARAMETER PhaseName
        Name of the discovery phase (e.g., "Discovery", "Processing", "Export").
    .PARAMETER PhaseResult
        The phase execution results.
    .PARAMETER Context
        Logging context.
    .EXAMPLE
        Export-PhaseErrorReport -PhaseName "Discovery" -PhaseResult $discoveryResults -Context $global:MandA
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$PhaseName,
        
        [Parameter(Mandatory=$true)]
        [hashtable]$PhaseResult,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    Write-MandALog -Message "Generating phase-specific error report for: $PhaseName" -Level "INFO" -Component "ErrorReporting" -Context $Context
    
    # Create phase-specific report name
    $reportName = "ErrorReport_${PhaseName}"
    
    # Add phase information to the result
    $enhancedPhaseResult = $PhaseResult.Clone()
    $enhancedPhaseResult.Phase = $PhaseName
    $enhancedPhaseResult.PhaseTimestamp = Get-Date
    
    # Export with phase-specific naming
    return Export-ErrorReport -PhaseResult $enhancedPhaseResult -ReportName $reportName -Context $Context
}

function Build-ComprehensiveErrorReport {
    <#
    .SYNOPSIS
        Builds a comprehensive error report structure from phase results.
    .DESCRIPTION
        Internal function that creates a detailed error report with categorization,
        statistics, and analysis.
    .PARAMETER PhaseResult
        The phase execution results.
    .PARAMETER Context
        Logging context.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$PhaseResult,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    Write-MandALog -Message "Building comprehensive error report structure" -Level "DEBUG" -Component "ErrorReporting" -Context $Context
    
    # Initialize collections if they don't exist
    if (-not $PhaseResult.ContainsKey('CriticalErrors')) { $PhaseResult.CriticalErrors = @() }
    if (-not $PhaseResult.ContainsKey('RecoverableErrors')) { $PhaseResult.RecoverableErrors = @() }
    if (-not $PhaseResult.ContainsKey('Warnings')) { $PhaseResult.Warnings = @() }
    if (-not $PhaseResult.ContainsKey('ModuleResults')) { $PhaseResult.ModuleResults = @{} }
    
    # Calculate summary statistics
    $totalModules = $PhaseResult.ModuleResults.Count
    $successfulModules = ($PhaseResult.ModuleResults.Values | Where-Object { 
        if ($_ -is [DiscoveryResult]) { $_.Success } 
        elseif ($_ -is [hashtable] -and $_.ContainsKey('Success')) { $_.Success }
        else { $false }
    }).Count
    $failedModules = $totalModules - $successfulModules
    
    # Categorize errors by severity
    $criticalErrorCount = $PhaseResult.CriticalErrors.Count
    $recoverableErrorCount = $PhaseResult.RecoverableErrors.Count
    $warningCount = $PhaseResult.Warnings.Count
    
    # Calculate total error count from modules
    $moduleErrorCount = 0
    $moduleWarningCount = 0
    foreach ($moduleResult in $PhaseResult.ModuleResults.Values) {
        if ($moduleResult -is [DiscoveryResult]) {
            $moduleErrorCount += $moduleResult.Errors.Count
            $moduleWarningCount += $moduleResult.Warnings.Count
        } elseif ($moduleResult -is [hashtable]) {
            if ($moduleResult.ContainsKey('Errors') -and $moduleResult.Errors) {
                $moduleErrorCount += $moduleResult.Errors.Count
            }
            if ($moduleResult.ContainsKey('Warnings') -and $moduleResult.Warnings) {
                $moduleWarningCount += $moduleResult.Warnings.Count
            }
        }
    }
    
    # Build the comprehensive report
    $errorReport = @{
        Timestamp = Get-Date
        Phase = $PhaseResult.Phase | Get-OrElse "Unknown"
        Success = $PhaseResult.Success | Get-OrElse $false
        Summary = @{
            TotalModules = $totalModules
            SuccessfulModules = $successfulModules
            FailedModules = $failedModules
            SuccessRate = if ($totalModules -gt 0) { [math]::Round(($successfulModules / $totalModules) * 100, 2) } else { 0 }
            CriticalErrorCount = $criticalErrorCount
            RecoverableErrorCount = $recoverableErrorCount
            WarningCount = $warningCount
            ModuleErrorCount = $moduleErrorCount
            ModuleWarningCount = $moduleWarningCount
            TotalIssues = $criticalErrorCount + $recoverableErrorCount + $warningCount + $moduleErrorCount
        }
        CriticalErrors = $PhaseResult.CriticalErrors
        RecoverableErrors = $PhaseResult.RecoverableErrors
        Warnings = $PhaseResult.Warnings
        ModuleDetails = @{}
        ErrorAnalysis = @{}
        Recommendations = @()
    }
    
    # Process module details
    foreach ($moduleName in $PhaseResult.ModuleResults.Keys) {
        $moduleResult = $PhaseResult.ModuleResults[$moduleName]
        
        if ($moduleResult -is [DiscoveryResult]) {
            $errorReport.ModuleDetails[$moduleName] = @{
                Success = $moduleResult.Success
                ModuleName = $moduleResult.ModuleName
                StartTime = $moduleResult.StartTime
                EndTime = $moduleResult.EndTime
                Duration = if ($moduleResult.EndTime) { 
                    ($moduleResult.EndTime - $moduleResult.StartTime).TotalSeconds 
                } else { $null }
                ExecutionId = $moduleResult.ExecutionId
                ErrorCount = $moduleResult.Errors.Count
                WarningCount = $moduleResult.Warnings.Count
                Errors = $moduleResult.Errors
                Warnings = $moduleResult.Warnings
                Metadata = $moduleResult.Metadata
            }
        } elseif ($moduleResult -is [hashtable]) {
            $errorReport.ModuleDetails[$moduleName] = $moduleResult
        } else {
            $errorReport.ModuleDetails[$moduleName] = @{
                Success = $false
                ModuleName = $moduleName
                ErrorCount = 0
                WarningCount = 0
                Errors = @()
                Warnings = @()
                Note = "Unexpected module result type: $($moduleResult.GetType().Name)"
            }
        }
    }
    
    # Generate error analysis
    $errorReport.ErrorAnalysis = Get-ErrorAnalysis -ErrorReport $errorReport -Context $Context
    
    # Generate recommendations
    $errorReport.Recommendations = Get-ErrorRecommendations -ErrorReport $errorReport -Context $Context
    
    Write-MandALog -Message "Comprehensive error report structure built successfully" -Level "DEBUG" -Component "ErrorReporting" -Context $Context
    
    return $errorReport
}

function Get-ErrorAnalysis {
    <#
    .SYNOPSIS
        Analyzes errors to identify patterns and root causes.
    .DESCRIPTION
        Internal function that performs error analysis to identify common patterns,
        frequent error types, and potential root causes.
    .PARAMETER ErrorReport
        The error report structure.
    .PARAMETER Context
        Logging context.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$ErrorReport,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    $analysis = @{
        ErrorPatterns = @{}
        FrequentErrorTypes = @{}
        ModuleFailurePatterns = @{}
        TimeBasedAnalysis = @{}
        SeverityDistribution = @{}
    }
    
    # Analyze error patterns across all errors
    $allErrors = @()
    $allErrors += $ErrorReport.CriticalErrors
    $allErrors += $ErrorReport.RecoverableErrors
    
    # Add module errors
    foreach ($moduleDetail in $ErrorReport.ModuleDetails.Values) {
        if ($moduleDetail.Errors) {
            $allErrors += $moduleDetail.Errors
        }
    }
    
    # Pattern analysis
    $errorMessages = $allErrors | ForEach-Object { 
        if ($_ -is [hashtable] -and $_.ContainsKey('Message')) { $_.Message }
        elseif ($_ -is [hashtable] -and $_.ContainsKey('Errors')) { 
            $_.Errors | ForEach-Object { if ($_.Message) { $_.Message } }
        }
        else { $_.ToString() }
    }
    
    # Group by common patterns
    $patterns = @{}
    foreach ($message in $errorMessages) {
        if (-not [string]::IsNullOrWhiteSpace($message)) {
            # Extract common patterns
            if ($message -match "authentication|auth|token|credential") {
                $patterns["Authentication"] = ($patterns["Authentication"] | Get-OrElse 0) + 1
            }
            if ($message -match "network|connection|timeout|unreachable") {
                $patterns["Network/Connectivity"] = ($patterns["Network/Connectivity"] | Get-OrElse 0) + 1
            }
            if ($message -match "permission|access|denied|unauthorized") {
                $patterns["Permissions"] = ($patterns["Permissions"] | Get-OrElse 0) + 1
            }
            if ($message -match "not found|missing|does not exist") {
                $patterns["Resource Not Found"] = ($patterns["Resource Not Found"] | Get-OrElse 0) + 1
            }
            if ($message -match "configuration|config|setting") {
                $patterns["Configuration"] = ($patterns["Configuration"] | Get-OrElse 0) + 1
            }
        }
    }
    
    $analysis.ErrorPatterns = $patterns
    
    # Module failure analysis
    $failedModules = $ErrorReport.ModuleDetails.Keys | Where-Object { 
        -not $ErrorReport.ModuleDetails[$_].Success 
    }
    
    $analysis.ModuleFailurePatterns = @{
        FailedModules = $failedModules
        FailureRate = if ($ErrorReport.Summary.TotalModules -gt 0) {
            [math]::Round(($failedModules.Count / $ErrorReport.Summary.TotalModules) * 100, 2)
        } else { 0 }
        CommonFailureReasons = $patterns
    }
    
    # Severity distribution
    $analysis.SeverityDistribution = @{
        Critical = $ErrorReport.Summary.CriticalErrorCount
        Recoverable = $ErrorReport.Summary.RecoverableErrorCount
        Warnings = $ErrorReport.Summary.WarningCount
        ModuleErrors = $ErrorReport.Summary.ModuleErrorCount
    }
    
    return $analysis
}

function Get-ErrorRecommendations {
    <#
    .SYNOPSIS
        Generates recommendations based on error analysis.
    .DESCRIPTION
        Internal function that provides actionable recommendations based on
        the error patterns and analysis.
    .PARAMETER ErrorReport
        The error report structure.
    .PARAMETER Context
        Logging context.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$ErrorReport,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    $recommendations = @()
    
    # Analyze error patterns and provide recommendations
    if ($ErrorReport.ErrorAnalysis.ErrorPatterns.ContainsKey("Authentication") -and 
        $ErrorReport.ErrorAnalysis.ErrorPatterns["Authentication"] -gt 0) {
        $recommendations += @{
            Category = "Authentication"
            Priority = "High"
            Issue = "Multiple authentication-related errors detected"
            Recommendation = "Review credential configuration, check App Registration permissions, and verify token validity"
            ActionItems = @(
                "Run Test-Credentials.ps1 to validate authentication setup",
                "Check App Registration permissions in Azure Portal",
                "Verify credential file format and content",
                "Review authentication method configuration"
            )
        }
    }
    
    if ($ErrorReport.ErrorAnalysis.ErrorPatterns.ContainsKey("Network/Connectivity") -and 
        $ErrorReport.ErrorAnalysis.ErrorPatterns["Network/Connectivity"] -gt 0) {
        $recommendations += @{
            Category = "Network/Connectivity"
            Priority = "High"
            Issue = "Network connectivity issues detected"
            Recommendation = "Check network connectivity, proxy settings, and firewall configuration"
            ActionItems = @(
                "Test network connectivity to required endpoints",
                "Review proxy configuration if applicable",
                "Check firewall rules for required ports",
                "Verify DNS resolution for service endpoints"
            )
        }
    }
    
    if ($ErrorReport.ErrorAnalysis.ErrorPatterns.ContainsKey("Permissions") -and 
        $ErrorReport.ErrorAnalysis.ErrorPatterns["Permissions"] -gt 0) {
        $recommendations += @{
            Category = "Permissions"
            Priority = "Medium"
            Issue = "Permission-related errors detected"
            Recommendation = "Review and update required permissions for discovery operations"
            ActionItems = @(
                "Check App Registration API permissions",
                "Verify admin consent has been granted",
                "Review on-premises AD permissions",
                "Validate service account permissions"
            )
        }
    }
    
    if ($ErrorReport.Summary.FailureRate -gt 50) {
        $recommendations += @{
            Category = "System Health"
            Priority = "Critical"
            Issue = "High module failure rate detected ($($ErrorReport.Summary.FailureRate)%)"
            Recommendation = "Investigate system-wide issues affecting multiple modules"
            ActionItems = @(
                "Run Validate-SuiteIntegrity.ps1 to check system health",
                "Review system resources (memory, disk space)",
                "Check for missing PowerShell modules",
                "Verify configuration file integrity"
            )
        }
    }
    
    if ($ErrorReport.ErrorAnalysis.ErrorPatterns.ContainsKey("Configuration") -and 
        $ErrorReport.ErrorAnalysis.ErrorPatterns["Configuration"] -gt 0) {
        $recommendations += @{
            Category = "Configuration"
            Priority = "Medium"
            Issue = "Configuration-related errors detected"
            Recommendation = "Review and validate configuration settings"
            ActionItems = @(
                "Validate configuration file syntax",
                "Check required configuration parameters",
                "Review module-specific settings",
                "Verify path configurations"
            )
        }
    }
    
    # Add general recommendations based on error count
    if ($ErrorReport.Summary.TotalIssues -gt 10) {
        $recommendations += @{
            Category = "General"
            Priority = "Low"
            Issue = "High number of total issues detected"
            Recommendation = "Consider running discovery in smaller batches or with reduced scope"
            ActionItems = @(
                "Review discovery scope configuration",
                "Consider enabling simulation mode for testing",
                "Implement progressive discovery approach",
                "Monitor system resources during execution"
            )
        }
    }
    
    return $recommendations
}

function Export-ErrorReportToCsv {
    <#
    .SYNOPSIS
        Exports error report to CSV format.
    .DESCRIPTION
        Internal function that converts the error report to CSV format for easy analysis.
    .PARAMETER ErrorReport
        The error report structure.
    .PARAMETER OutputPath
        Path for the CSV file.
    .PARAMETER Context
        Logging context.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$ErrorReport,
        
        [Parameter(Mandatory=$true)]
        [string]$OutputPath,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    # Create CSV data structure
    $csvData = @()
    
    # Add summary row
    $csvData += [PSCustomObject]@{
        Type = "Summary"
        Module = "Overall"
        Category = "Statistics"
        Severity = "Info"
        Message = "Total Modules: $($ErrorReport.Summary.TotalModules), Success Rate: $($ErrorReport.Summary.SuccessRate)%"
        Timestamp = $ErrorReport.Timestamp
        Details = "Critical: $($ErrorReport.Summary.CriticalErrorCount), Recoverable: $($ErrorReport.Summary.RecoverableErrorCount), Warnings: $($ErrorReport.Summary.WarningCount)"
    }
    
    # Add critical errors
    foreach ($errorItem in $ErrorReport.CriticalErrors) {
        $csvData += [PSCustomObject]@{
            Type = "Critical Error"
            Module = $errorItem.Source | Get-OrElse "Unknown"
            Category = "Critical"
            Severity = "Critical"
            Message = $errorItem.Message | Get-OrElse $errorItem.ToString()
            Timestamp = $errorItem.Timestamp | Get-OrElse $ErrorReport.Timestamp
            Details = $errorItem.Impact | Get-OrElse ""
        }
    }
    
    # Add recoverable errors
    foreach ($errorItem in $ErrorReport.RecoverableErrors) {
        $csvData += [PSCustomObject]@{
            Type = "Recoverable Error"
            Module = $errorItem.Source | Get-OrElse "Unknown"
            Category = "Error"
            Severity = "Error"
            Message = $errorItem.Message | Get-OrElse $errorItem.ToString()
            Timestamp = $errorItem.Timestamp | Get-OrElse $ErrorReport.Timestamp
            Details = $errorItem.Details | Get-OrElse ""
        }
    }
    
    # Add warnings
    foreach ($warning in $ErrorReport.Warnings) {
        $csvData += [PSCustomObject]@{
            Type = "Warning"
            Module = $warning.Source | Get-OrElse "Unknown"
            Category = "Warning"
            Severity = "Warning"
            Message = $warning.Message | Get-OrElse $warning.ToString()
            Timestamp = $warning.Timestamp | Get-OrElse $ErrorReport.Timestamp
            Details = $warning.Details | Get-OrElse ""
        }
    }
    
    # Add module-specific errors
    foreach ($moduleName in $ErrorReport.ModuleDetails.Keys) {
        $moduleDetail = $ErrorReport.ModuleDetails[$moduleName]
        
        if ($moduleDetail.Errors) {
            foreach ($errorItem in $moduleDetail.Errors) {
                $csvData += [PSCustomObject]@{
                    Type = "Module Error"
                    Module = $moduleName
                    Category = "Module Error"
                    Severity = "Error"
                    Message = $errorItem.Message | Get-OrElse $errorItem.ToString()
                    Timestamp = $errorItem.Timestamp | Get-OrElse $moduleDetail.StartTime | Get-OrElse $ErrorReport.Timestamp
                    Details = $errorItem.Context | ConvertTo-Json -Compress | Get-OrElse ""
                }
            }
        }
        
        if ($moduleDetail.Warnings) {
            foreach ($warning in $moduleDetail.Warnings) {
                $csvData += [PSCustomObject]@{
                    Type = "Module Warning"
                    Module = $moduleName
                    Category = "Module Warning"
                    Severity = "Warning"
                    Message = $warning.Message | Get-OrElse $warning.ToString()
                    Timestamp = $warning.Timestamp | Get-OrElse $moduleDetail.StartTime | Get-OrElse $ErrorReport.Timestamp
                    Details = $warning.Context | ConvertTo-Json -Compress | Get-OrElse ""
                }
            }
        }
    }
    
    # Export to CSV
    $csvData | Export-Csv -Path $OutputPath -NoTypeInformation -Encoding UTF8
    
    Write-MandALog -Message "CSV error report exported with $($csvData.Count) entries" -Level "DEBUG" -Component "ErrorReporting" -Context $Context
}

function Export-ErrorReportToHtml {
    <#
    .SYNOPSIS
        Exports error report to HTML format.
    .DESCRIPTION
        Internal function that creates a formatted HTML report with styling and navigation.
    .PARAMETER ErrorReport
        The error report structure.
    .PARAMETER OutputPath
        Path for the HTML file.
    .PARAMETER Context
        Logging context.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$ErrorReport,
        
        [Parameter(Mandatory=$true)]
        [string]$OutputPath,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    $html = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>M&A Discovery Suite - Error Report</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        h3 { color: #7f8c8d; }
        .summary { background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .summary-item { background-color: white; padding: 10px; border-radius: 5px; text-align: center; }
        .summary-item .value { font-size: 24px; font-weight: bold; color: #2c3e50; }
        .summary-item .label { font-size: 12px; color: #7f8c8d; text-transform: uppercase; }
        .error-critical { background-color: #e74c3c; color: white; }
        .error-recoverable { background-color: #f39c12; color: white; }
        .warning { background-color: #f1c40f; color: #2c3e50; }
        .success { background-color: #27ae60; color: white; }
        .error-list { margin: 10px 0; }
        .error-item { background-color: #fff; border-left: 4px solid #e74c3c; padding: 10px; margin: 5px 0; border-radius: 0 5px 5px 0; }
        .warning-item { background-color: #fff; border-left: 4px solid #f39c12; padding: 10px; margin: 5px 0; border-radius: 0 5px 5px 0; }
        .module-section { margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
        .module-success { border-left: 4px solid #27ae60; }
        .module-failed { border-left: 4px solid #e74c3c; }
        .recommendations { background-color: #d5f4e6; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .recommendation-item { margin: 10px 0; padding: 10px; background-color: white; border-radius: 5px; }
        .timestamp { color: #7f8c8d; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
        .collapsible { cursor: pointer; padding: 10px; background-color: #f1f1f1; border: none; width: 100%; text-align: left; }
        .content { display: none; padding: 10px; background-color: #f9f9f9; }
    </style>
    <script>
        function toggleContent(element) {
            var content = element.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        }
    </script>
</head>
<body>
    <div class="container">
        <h1>M&A Discovery Suite - Error Report</h1>
        <p class="timestamp">Generated: $($ErrorReport.Timestamp)</p>
        
        <div class="summary">
            <h2>Executive Summary</h2>
            <div class="summary-grid">
                <div class="summary-item $(if ($ErrorReport.Summary.SuccessRate -gt 80) { 'success' } elseif ($ErrorReport.Summary.SuccessRate -gt 50) { 'warning' } else { 'error-critical' })">
                    <div class="value">$($ErrorReport.Summary.SuccessRate)%</div>
                    <div class="label">Success Rate</div>
                </div>
                <div class="summary-item">
                    <div class="value">$($ErrorReport.Summary.TotalModules)</div>
                    <div class="label">Total Modules</div>
                </div>
                <div class="summary-item $(if ($ErrorReport.Summary.CriticalErrorCount -gt 0) { 'error-critical' } else { 'success' })">
                    <div class="value">$($ErrorReport.Summary.CriticalErrorCount)</div>
                    <div class="label">Critical Errors</div>
                </div>
                <div class="summary-item $(if ($ErrorReport.Summary.RecoverableErrorCount -gt 0) { 'error-recoverable' } else { 'success' })">
                    <div class="value">$($ErrorReport.Summary.RecoverableErrorCount)</div>
                    <div class="label">Recoverable Errors</div>
                </div>
                <div class="summary-item $(if ($ErrorReport.Summary.WarningCount -gt 0) { 'warning' } else { 'success' })">
                    <div class="value">$($ErrorReport.Summary.WarningCount)</div>
                    <div class="label">Warnings</div>
                </div>
                <div class="summary-item">
                    <div class="value">$($ErrorReport.Summary.TotalIssues)</div>
                    <div class="label">Total Issues</div>
                </div>
            </div>
        </div>
"@

    # Add Critical Errors section
    if ($ErrorReport.CriticalErrors.Count -gt 0) {
        $html += @"
        <h2>Critical Errors</h2>
        <div class="error-list">
"@
        foreach ($errorItem in $ErrorReport.CriticalErrors) {
            $html += @"
            <div class="error-item">
                <strong>$($errorItem.Source | Get-OrElse 'Unknown Source')</strong><br>
                $($errorItem.Message | Get-OrElse $errorItem.ToString())<br>
                <small class="timestamp">Impact: $($errorItem.Impact | Get-OrElse 'Not specified')</small>
            </div>
"@
        }
        $html += "</div>"
    }

    # Add Recoverable Errors section
    if ($ErrorReport.RecoverableErrors.Count -gt 0) {
        $html += @"
        <h2>Recoverable Errors</h2>
        <div class="error-list">
"@
        foreach ($errorItem in $ErrorReport.RecoverableErrors) {
            $html += @"
            <div class="error-item">
                <strong>$($errorItem.Source | Get-OrElse 'Unknown Source')</strong><br>
                $($errorItem.Message | Get-OrElse $errorItem.ToString())<br>
                <small class="timestamp">$($errorItem.Timestamp | Get-OrElse $ErrorReport.Timestamp)</small>
            </div>
"@
        }
        $html += "</div>"
    }

    # Add Module Details section
    if ($ErrorReport.ModuleDetails.Count -gt 0) {
        $html += @"
        <h2>Module Details</h2>
"@
        foreach ($moduleName in $ErrorReport.ModuleDetails.Keys) {
            $moduleDetail = $ErrorReport.ModuleDetails[$moduleName]
            $moduleClass = if ($moduleDetail.Success) { "module-success" } else { "module-failed" }
            
            $html += @"
            <div class="module-section $moduleClass">
                <h3>$moduleName</h3>
                <p><strong>Status:</strong> $(if ($moduleDetail.Success) { 'Success' } else { 'Failed' })</p>
                <p><strong>Errors:</strong> $($moduleDetail.ErrorCount | Get-OrElse 0) | <strong>Warnings:</strong> $($moduleDetail.WarningCount | Get-OrElse 0)</p>
"@
            
            if ($moduleDetail.Duration) {
                $html += "<p><strong>Duration:</strong> $([math]::Round($moduleDetail.Duration, 2)) seconds</p>"
            }
            
            if ($moduleDetail.Errors -and $moduleDetail.Errors.Count -gt 0) {
                $html += @"
                <button class="collapsible" onclick="toggleContent(this)">Show Errors ($($moduleDetail.Errors.Count))</button>
                <div class="content">
"@
                foreach ($errorItem in $moduleDetail.Errors) {
                    $html += @"
                    <div class="error-item">
                        $($errorItem.Message | Get-OrElse $errorItem.ToString())<br>
                        <small class="timestamp">$($errorItem.Timestamp | Get-OrElse 'No timestamp')</small>
                    </div>
"@
                }
                $html += "</div>"
            }
            
            $html += "</div>"
        }
    }

    # Add Recommendations section
    if ($ErrorReport.Recommendations.Count -gt 0) {
        $html += @"
        <div class="recommendations">
            <h2>Recommendations</h2>
"@
        foreach ($recommendation in $ErrorReport.Recommendations) {
            $html += @"
            <div class="recommendation-item">
                <h4>$($recommendation.Category) - Priority: $($recommendation.Priority)</h4>
                <p><strong>Issue:</strong> $($recommendation.Issue)</p>
                <p><strong>Recommendation:</strong> $($recommendation.Recommendation)</p>
"@
            if ($recommendation.ActionItems) {
                $html += "<p><strong>Action Items:</strong></p><ul>"
                foreach ($actionItem in $recommendation.ActionItems) {
                    $html += "<li>$actionItem</li>"
                }
                $html += "</ul>"
            }
            $html += "</div>"
        }
        $html += "</div>"
    }

    # Close HTML
    $html += @"
    </div>
</body>
</html>
"@

    # Save HTML file
    $html | Set-Content -Path $OutputPath -Encoding UTF8
    
    Write-MandALog -Message "HTML error report exported successfully" -Level "DEBUG" -Component "ErrorReporting" -Context $Context
}

function Export-ErrorSummaryText {
    <#
    .SYNOPSIS
        Exports a human-readable text summary of the error report.
    .DESCRIPTION
        Internal function that creates a concise text summary for quick review.
    .PARAMETER ErrorReport
        The error report structure.
    .PARAMETER OutputPath
        Path for the text file.
    .PARAMETER Context
        Logging context.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$ErrorReport,
        
        [Parameter(Mandatory=$true)]
        [string]$OutputPath,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    $summary = @"
M&A Discovery Suite - Error Report Summary
Generated: $($ErrorReport.Timestamp)
Phase: $($ErrorReport.Phase | Get-OrElse 'Unknown')
=====================================

EXECUTIVE SUMMARY
-----------------
Overall Success: $(if ($ErrorReport.Success) { 'YES' } else { 'NO' })
Success Rate: $($ErrorReport.Summary.SuccessRate)%
Total Modules: $($ErrorReport.Summary.TotalModules)
Successful Modules: $($ErrorReport.Summary.SuccessfulModules)
Failed Modules: $($ErrorReport.Summary.FailedModules)

ERROR BREAKDOWN
---------------
Critical Errors: $($ErrorReport.Summary.CriticalErrorCount)
Recoverable Errors: $($ErrorReport.Summary.RecoverableErrorCount)
Warnings: $($ErrorReport.Summary.WarningCount)
Module Errors: $($ErrorReport.Summary.ModuleErrorCount)
Total Issues: $($ErrorReport.Summary.TotalIssues)

"@

    # Add Critical Errors details
    if ($ErrorReport.CriticalErrors.Count -gt 0) {
        $summary += @"
CRITICAL ERRORS ($($ErrorReport.CriticalErrors.Count))
===============
"@
        foreach ($errorItem in $ErrorReport.CriticalErrors) {
            $summary += @"

Source: $($errorItem.Source | Get-OrElse 'Unknown')
Impact: $($errorItem.Impact | Get-OrElse 'Not specified')
Message: $($errorItem.Message | Get-OrElse $errorItem.ToString())
"@
        }
    }

    # Add Module Failure Summary
    $failedModules = $ErrorReport.ModuleDetails.Keys | Where-Object {
        -not $ErrorReport.ModuleDetails[$_].Success
    }
    
    if ($failedModules.Count -gt 0) {
        $summary += @"

FAILED MODULES ($($failedModules.Count))
==============
"@
        foreach ($moduleName in $failedModules) {
            $moduleDetail = $ErrorReport.ModuleDetails[$moduleName]
            $summary += @"

Module: $moduleName
Errors: $($moduleDetail.ErrorCount | Get-OrElse 0)
Warnings: $($moduleDetail.WarningCount | Get-OrElse 0)
Duration: $($moduleDetail.Duration | Get-OrElse 'Unknown') seconds
"@
            if ($moduleDetail.Errors -and $moduleDetail.Errors.Count -gt 0) {
                $summary += "Top Error: $($moduleDetail.Errors[0].Message | Get-OrElse $moduleDetail.Errors[0].ToString())"
            }
        }
    }

    # Add Error Pattern Analysis
    if ($ErrorReport.ErrorAnalysis.ErrorPatterns.Count -gt 0) {
        $summary += @"

ERROR PATTERN ANALYSIS
======================
"@
        foreach ($pattern in $ErrorReport.ErrorAnalysis.ErrorPatterns.Keys) {
            $count = $ErrorReport.ErrorAnalysis.ErrorPatterns[$pattern]
            $summary += @"
$pattern`: $count occurrence(s)
"@
        }
    }

    # Add Top Recommendations
    if ($ErrorReport.Recommendations.Count -gt 0) {
        $summary += @"

TOP RECOMMENDATIONS
===================
"@
        $topRecommendations = $ErrorReport.Recommendations | Sort-Object {
            switch ($_.Priority) {
                "Critical" { 1 }
                "High" { 2 }
                "Medium" { 3 }
                "Low" { 4 }
                default { 5 }
            }
        } | Select-Object -First 5
        
        foreach ($recommendation in $topRecommendations) {
            $summary += @"

[$($recommendation.Priority)] $($recommendation.Category)
Issue: $($recommendation.Issue)
Action: $($recommendation.Recommendation)
"@
        }
    }

    $summary += @"

=====================================
End of Error Report Summary
"@

    # Save summary file
    $summary | Set-Content -Path $OutputPath -Encoding UTF8
    
    Write-MandALog -Message "Text error summary exported successfully" -Level "DEBUG" -Component "ErrorReporting" -Context $Context
}

function New-ErrorSummaryReport {
    <#
    .SYNOPSIS
        Creates a quick error summary report for immediate review.
    .DESCRIPTION
        Generates a concise error summary without full details for quick assessment.
    .PARAMETER PhaseResult
        The phase execution results.
    .PARAMETER Context
        Logging context.
    .EXAMPLE
        $summary = New-ErrorSummaryReport -PhaseResult $discoveryResults -Context $global:MandA
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$PhaseResult,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    Write-MandALog -Message "Creating quick error summary report" -Level "INFO" -Component "ErrorReporting" -Context $Context
    
    $errorReport = Build-ComprehensiveErrorReport -PhaseResult $PhaseResult -Context $Context
    
    return @{
        Timestamp = $errorReport.Timestamp
        Phase = $errorReport.Phase
        Success = $errorReport.Success
        Summary = $errorReport.Summary
        TopErrors = ($errorReport.CriticalErrors + $errorReport.RecoverableErrors) | Select-Object -First 5
        FailedModules = $errorReport.ModuleDetails.Keys | Where-Object {
            -not $errorReport.ModuleDetails[$_].Success
        }
        ErrorPatterns = $errorReport.ErrorAnalysis.ErrorPatterns
        TopRecommendations = $errorReport.Recommendations | Select-Object -First 3
    }
}

function Export-ErrorAnalysis {
    <#
    .SYNOPSIS
        Exports detailed error analysis and trends.
    .DESCRIPTION
        Creates specialized reports focusing on error analysis, patterns, and trends.
    .PARAMETER PhaseResult
        The phase execution results.
    .PARAMETER OutputPath
        Directory for analysis reports.
    .PARAMETER Context
        Logging context.
    .EXAMPLE
        Export-ErrorAnalysis -PhaseResult $discoveryResults -OutputPath "C:\Reports\Analysis" -Context $global:MandA
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$PhaseResult,
        
        [Parameter(Mandatory=$false)]
        [string]$OutputPath,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    Write-MandALog -Message "Starting detailed error analysis export" -Level "INFO" -Component "ErrorReporting" -Context $Context
    
    $errorReport = Build-ComprehensiveErrorReport -PhaseResult $PhaseResult -Context $Context
    $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    
    # Determine output path
    if ([string]::IsNullOrWhiteSpace($OutputPath)) {
        if ($Context -and $Context.PSObject.Properties['Paths'] -and $Context.Paths.PSObject.Properties['LogOutput']) {
            $OutputPath = $Context.Paths.LogOutput
        } else {
            $OutputPath = ".\ErrorAnalysis"
        }
    }
    
    # Ensure output directory exists
    if (-not (Test-Path $OutputPath)) {
        New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
    }
    
    # Export error patterns analysis
    $patternsPath = Join-Path $OutputPath "ErrorPatterns_$timestamp.json"
    $errorReport.ErrorAnalysis | ConvertTo-Json -Depth 5 | Set-Content -Path $patternsPath -Encoding UTF8
    
    # Export recommendations
    $recommendationsPath = Join-Path $OutputPath "Recommendations_$timestamp.json"
    $errorReport.Recommendations | ConvertTo-Json -Depth 3 | Set-Content -Path $recommendationsPath -Encoding UTF8
    
    Write-MandALog -Message "Error analysis exported to: $OutputPath" -Level "SUCCESS" -Component "ErrorReporting" -Context $Context
    
    return @{
        Success = $true
        AnalysisPath = $patternsPath
        RecommendationsPath = $recommendationsPath
        ErrorPatterns = $errorReport.ErrorAnalysis.ErrorPatterns
        Recommendations = $errorReport.Recommendations
    }
}

function Get-ErrorStatistics {
    <#
    .SYNOPSIS
        Calculates comprehensive error statistics from phase results.
    .DESCRIPTION
        Provides detailed statistical analysis of errors across modules and phases.
    .PARAMETER PhaseResult
        The phase execution results.
    .PARAMETER Context
        Logging context.
    .EXAMPLE
        $stats = Get-ErrorStatistics -PhaseResult $discoveryResults -Context $global:MandA
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$PhaseResult,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    Write-MandALog -Message "Calculating comprehensive error statistics" -Level "DEBUG" -Component "ErrorReporting" -Context $Context
    
    $errorReport = Build-ComprehensiveErrorReport -PhaseResult $PhaseResult -Context $Context
    
    return @{
        Summary = $errorReport.Summary
        ErrorAnalysis = $errorReport.ErrorAnalysis
        ModuleStatistics = @{
            TotalModules = $errorReport.Summary.TotalModules
            SuccessfulModules = $errorReport.Summary.SuccessfulModules
            FailedModules = $errorReport.Summary.FailedModules
            SuccessRate = $errorReport.Summary.SuccessRate
            AverageErrorsPerModule = if ($errorReport.Summary.TotalModules -gt 0) {
                [math]::Round($errorReport.Summary.ModuleErrorCount / $errorReport.Summary.TotalModules, 2)
            } else { 0 }
            AverageWarningsPerModule = if ($errorReport.Summary.TotalModules -gt 0) {
                [math]::Round($errorReport.Summary.ModuleWarningCount / $errorReport.Summary.TotalModules, 2)
            } else { 0 }
        }
        ErrorDistribution = $errorReport.ErrorAnalysis.SeverityDistribution
        Timestamp = $errorReport.Timestamp
    }
}

Write-Host "[ErrorReporting.psm1] Module loaded." -ForegroundColor DarkGray