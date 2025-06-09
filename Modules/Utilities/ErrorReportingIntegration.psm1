# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-06
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


    Provides integration functions for error reporting within the M&A Discovery Suite orchestrator.
.DESCRIPTION
    This module provides the Export-ErrorReport function as specified in the original task,
    along with helper functions for seamless integration with the main orchestrator and
    discovery phases.
.NOTES
    Version: 1.0.0
    Author: M&A Discovery Suite Team
    Date: 2025-06-06

    This module implements the exact function signature requested in the original task.
#>

Export-ModuleMember -Function Export-ErrorReport, Initialize-ErrorReporting, Complete-ErrorReporting

# Import required modules
if (-not (Get-Module -Name "ErrorReporting")) {
    Import-Module "$PSScriptRoot\ErrorReporting.psm1" -Force
}
if (-not (Get-Module -Name "ErrorHandling")) {
    Import-Module "$PSScriptRoot\ErrorHandling.psm1" -Force
}
if (-not (Get-Module -Name "EnhancedLogging")) {
    Import-Module "$PSScriptRoot\EnhancedLogging.psm1" -Force
}

function Export-ErrorReport {
    <#
    .SYNOPSIS
        Creates comprehensive error reports as specified in the original task.
    .DESCRIPTION
        This is the main function called by the orchestrator to generate comprehensive
        error reports. It matches the exact specification from the original task.
    .PARAMETER PhaseResult
        Hashtable containing phase execution results with the following structure:
        - Success: Boolean indicating overall phase success
        - ModuleResults: Hashtable of module results (DiscoveryResult objects)
        - CriticalErrors: Array of critical errors
        - RecoverableErrors: Array of recoverable errors  
        - Warnings: Array of warnings
    .EXAMPLE
        Export-ErrorReport -PhaseResult $PhaseResult
        
        This generates the comprehensive error report as specified in the original task:
        - JSON report with detailed error information
        - Human-readable summary text file
        - Error categorization and statistics
        - Module-specific error details
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$PhaseResult
    )
    
    # Get context from global MandA or create default
    $context = if ($global:MandA) { $global:MandA } else { 
        [PSCustomObject]@{
            Paths = @{ LogOutput = ".\ErrorReports" }
            Config = @{ environment = @{ logging = @{} } }
        }
    }
    
    Write-MandALog -Message "Starting comprehensive error report generation" -Level "INFO" -Component "ErrorReporting" -Context $context
    
    try {
        # Determine output path from global MandA configuration
        $outputPath = if ($global:MandA -and $global:MandA.Paths -and $global:MandA.Paths.LogOutput) {
            $global:MandA.Paths.LogOutput
        } else {
            Join-Path (Get-Location) "ErrorReports"
        }
        
        # Generate timestamp for the report
        $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
        $reportBaseName = "ErrorReport_$timestamp"
        
        # Ensure output directory exists
        if (-not (Test-Path $outputPath)) {
            New-Item -Path $outputPath -ItemType Directory -Force | Out-Null
            Write-MandALog -Message "Created error report directory: $outputPath" -Level "INFO" -Component "ErrorReporting" -Context $context
        }
        
        # Build comprehensive error report structure
        $errorReport = Build-ComprehensiveErrorReport -PhaseResult $PhaseResult -Context $context
        
        # Export JSON report (main detailed report)
        $jsonPath = Join-Path $outputPath "$reportBaseName.json"
        $errorReport | ConvertTo-Json -Depth 10 | Set-Content -Path $jsonPath -Encoding UTF8
        
        # Export human-readable summary as specified in the original task
        $summaryPath = Join-Path $outputPath "ErrorSummary_$timestamp.txt"
        Export-ErrorSummaryText -ErrorReport $errorReport -OutputPath $summaryPath -Context $context
        
        # Log the completion as specified in the original task
        Write-MandALog -Message "Error report saved to: $jsonPath" -Level "INFO" -Component "ErrorReporting" -Context $context
        
        # Return the paths for the orchestrator
        return @{
            Success = $true
            JsonReportPath = $jsonPath
            SummaryReportPath = $summaryPath
            ErrorReport = $errorReport
        }
        
    } catch {
        $enhancedError = Add-ErrorContext -ErrorRecord $_ -Context @{
            Operation = "Export-ErrorReport"
            PhaseResultKeys = $PhaseResult.Keys -join ", "
        } -LoggingContext $context
        
        Write-MandALog -Message "Failed to generate error report: $($_.Exception.Message)" -Level "ERROR" -Component "ErrorReporting" -Context $context
        throw
    }
}

function Initialize-ErrorReporting {
    <#
    .SYNOPSIS
        Initializes error reporting for a discovery phase.
    .DESCRIPTION
        Sets up error collection and reporting infrastructure for a discovery phase.
        This should be called at the beginning of each phase.
    .PARAMETER PhaseName
        Name of the discovery phase being initialized.
    .PARAMETER Context
        The MandA context object.
    .EXAMPLE
        Initialize-ErrorReporting -PhaseName "Discovery" -Context $global:MandA
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$PhaseName,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    $effectiveContext = $Context | Get-OrElse $global:MandA
    
    Write-MandALog -Message "Initializing error reporting for phase: $PhaseName" -Level "INFO" -Component "ErrorReporting" -Context $effectiveContext
    
    # Initialize phase-specific error collection
    if (-not $global:MandAPhaseErrors) {
        $global:MandAPhaseErrors = @{}
    }
    
    $global:MandAPhaseErrors[$PhaseName] = @{
        PhaseName = $PhaseName
        StartTime = Get-Date
        CriticalErrors = @()
        RecoverableErrors = @()
        Warnings = @()
        ModuleResults = @{}
        Initialized = $true
    }
    
    Write-MandALog -Message "Error reporting initialized for phase: $PhaseName" -Level "SUCCESS" -Component "ErrorReporting" -Context $effectiveContext
}

function Complete-ErrorReporting {
    <#
    .SYNOPSIS
        Completes error reporting for a discovery phase and generates final reports.
    .DESCRIPTION
        Finalizes error collection for a phase and automatically generates comprehensive
        error reports. This should be called at the end of each phase.
    .PARAMETER PhaseName
        Name of the discovery phase being completed.
    .PARAMETER Success
        Whether the phase completed successfully overall.
    .PARAMETER Context
        The MandA context object.
    .EXAMPLE
        Complete-ErrorReporting -PhaseName "Discovery" -Success $false -Context $global:MandA
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$PhaseName,
        
        [Parameter(Mandatory=$true)]
        [bool]$Success,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    $effectiveContext = $Context | Get-OrElse $global:MandA
    
    Write-MandALog -Message "Completing error reporting for phase: $PhaseName" -Level "INFO" -Component "ErrorReporting" -Context $effectiveContext
    
    try {
        # Get phase error collection
        if (-not $global:MandAPhaseErrors -or -not $global:MandAPhaseErrors.ContainsKey($PhaseName)) {
            Write-MandALog -Message "No error collection found for phase: $PhaseName. Initializing empty collection." -Level "WARN" -Component "ErrorReporting" -Context $effectiveContext
            Initialize-ErrorReporting -PhaseName $PhaseName -Context $effectiveContext
        }
        
        $phaseErrors = $global:MandAPhaseErrors[$PhaseName]
        $phaseErrors.EndTime = Get-Date
        $phaseErrors.Success = $Success
        
        # Build phase result structure
        $phaseResult = @{
            Success = $Success
            Phase = $PhaseName
            StartTime = $phaseErrors.StartTime
            EndTime = $phaseErrors.EndTime
            ModuleResults = $phaseErrors.ModuleResults
            CriticalErrors = $phaseErrors.CriticalErrors
            RecoverableErrors = $phaseErrors.RecoverableErrors
            Warnings = $phaseErrors.Warnings
        }
        
        # Generate comprehensive error report
        $reportResult = Export-ErrorReport -PhaseResult $phaseResult
        
        if ($reportResult.Success) {
            Write-MandALog -Message "Error reporting completed successfully for phase: $PhaseName" -Level "SUCCESS" -Component "ErrorReporting" -Context $effectiveContext
            Write-MandALog -Message "Reports generated: JSON ($($reportResult.JsonReportPath)), Summary ($($reportResult.SummaryReportPath))" -Level "INFO" -Component "ErrorReporting" -Context $effectiveContext
        } else {
            Write-MandALog -Message "Error report generation failed for phase: $PhaseName" -Level "ERROR" -Component "ErrorReporting" -Context $effectiveContext
        }
        
        return $reportResult
        
    } catch {
        Write-MandALog -Message "Failed to complete error reporting for phase $PhaseName`: $($_.Exception.Message)" -Level "ERROR" -Component "ErrorReporting" -Context $effectiveContext
        throw
    }
}

function Add-PhaseError {
    <#
    .SYNOPSIS
        Adds an error to the current phase error collection.
    .DESCRIPTION
        Helper function to add errors to the phase-specific error collection.
        This is used by modules during discovery to report errors.
    .PARAMETER PhaseName
        Name of the discovery phase.
    .PARAMETER ErrorType
        Type of error: Critical, Recoverable, or Warning.
    .PARAMETER Source
        Source module or component reporting the error.
    .PARAMETER Message
        Error message.
    .PARAMETER Details
        Additional error details.
    .PARAMETER Impact
        Impact description (for critical errors).
    .PARAMETER Context
        The MandA context object.
    .EXAMPLE
        Add-PhaseError -PhaseName "Discovery" -ErrorType "Critical" -Source "Authentication" -Message "Failed to authenticate" -Impact "Cannot access cloud resources"
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$PhaseName,
        
        [Parameter(Mandatory=$true)]
        [ValidateSet("Critical", "Recoverable", "Warning")]
        [string]$ErrorType,
        
        [Parameter(Mandatory=$true)]
        [string]$Source,
        
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [string]$Details,
        
        [Parameter(Mandatory=$false)]
        [string]$Impact,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    $effectiveContext = $Context | Get-OrElse $global:MandA
    
    # Ensure phase error collection exists
    if (-not $global:MandAPhaseErrors -or -not $global:MandAPhaseErrors.ContainsKey($PhaseName)) {
        Initialize-ErrorReporting -PhaseName $PhaseName -Context $effectiveContext
    }
    
    # Create error entry
    $errorEntry = @{
        Source = $Source
        Message = $Message
        Timestamp = Get-Date
        Details = $Details
        Impact = $Impact
    }
    
    # Add to appropriate collection
    switch ($ErrorType) {
        "Critical" {
            $global:MandAPhaseErrors[$PhaseName].CriticalErrors += $errorEntry
            Write-MandALog -Message "Critical error added to phase $PhaseName`: $Message" -Level "CRITICAL" -Component $Source -Context $effectiveContext
        }
        "Recoverable" {
            $global:MandAPhaseErrors[$PhaseName].RecoverableErrors += $errorEntry
            Write-MandALog -Message "Recoverable error added to phase $PhaseName`: $Message" -Level "ERROR" -Component $Source -Context $effectiveContext
        }
        "Warning" {
            $global:MandAPhaseErrors[$PhaseName].Warnings += $errorEntry
            Write-MandALog -Message "Warning added to phase $PhaseName`: $Message" -Level "WARN" -Component $Source -Context $effectiveContext
        }
    }
}

function Add-ModuleResult {
    <#
    .SYNOPSIS
        Adds a module result to the current phase error collection.
    .DESCRIPTION
        Helper function to add module results to the phase-specific collection.
        This is used by the orchestrator to track module execution results.
    .PARAMETER PhaseName
        Name of the discovery phase.
    .PARAMETER ModuleName
        Name of the module.
    .PARAMETER ModuleResult
        The DiscoveryResult object from the module.
    .PARAMETER Context
        The MandA context object.
    .EXAMPLE
        Add-ModuleResult -PhaseName "Discovery" -ModuleName "ActiveDirectory" -ModuleResult $adResult
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$PhaseName,
        
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$true)]
        [object]$ModuleResult,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    $effectiveContext = $Context | Get-OrElse $global:MandA
    
    # Ensure phase error collection exists
    if (-not $global:MandAPhaseErrors -or -not $global:MandAPhaseErrors.ContainsKey($PhaseName)) {
        Initialize-ErrorReporting -PhaseName $PhaseName -Context $effectiveContext
    }
    
    # Add module result
    $global:MandAPhaseErrors[$PhaseName].ModuleResults[$ModuleName] = $ModuleResult
    
    # Log module completion
    if ($ModuleResult -is [DiscoveryResult]) {
        $status = if ($ModuleResult.Success) { "SUCCESS" } else { "ERROR" }
        $level = if ($ModuleResult.Success) { "SUCCESS" } else { "ERROR" }
        Write-MandALog -Message "Module result added: $ModuleName - $status (Errors: $($ModuleResult.Errors.Count), Warnings: $($ModuleResult.Warnings.Count))" -Level $level -Component "ErrorReporting" -Context $effectiveContext
    } else {
        Write-MandALog -Message "Module result added: $ModuleName" -Level "INFO" -Component "ErrorReporting" -Context $effectiveContext
    }
}

# Helper function to build comprehensive error report (re-exported from ErrorReporting module)
function Build-ComprehensiveErrorReport {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$PhaseResult,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    # Delegate to the main ErrorReporting module
    return & (Get-Module ErrorReporting) { Build-ComprehensiveErrorReport -PhaseResult $args[0] -Context $args[1] } $PhaseResult $Context
}

# Helper function to export error summary text (re-exported from ErrorReporting module)
function Export-ErrorSummaryText {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$ErrorReport,
        
        [Parameter(Mandatory=$true)]
        [string]$OutputPath,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    # Delegate to the main ErrorReporting module
    & (Get-Module ErrorReporting) { Export-ErrorSummaryText -ErrorReport $args[0] -OutputPath $args[1] -Context $args[2] } $ErrorReport $OutputPath $Context
}

Write-Host "[ErrorReportingIntegration.psm1] Module loaded." -ForegroundColor DarkGray

