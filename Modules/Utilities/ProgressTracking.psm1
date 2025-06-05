#Requires -Version 5.1
<#
.SYNOPSIS
    Provides functions for tracking the progress and performance metrics of operations
    within the M&A Discovery Suite.
.DESCRIPTION
    This module allows for initializing progress trackers, starting and stopping operation timers,
    updating step-based progress, and retrieving/exporting collected metrics.
    It's designed to be used by various components of the suite to monitor execution duration
    and status of different phases and operations. This version incorporates fixes and
    considerations based on the provided fault list.
.NOTES
    Version: 1.0.1
    Author: M&A Discovery Suite Team
    Date: 2025-06-05

    Key Design Points:
    - Manages a script-level state for progress and operation metrics ($script:ProgressState).
    - Functions integrate with Write-MandALog for logging significant events (addresses FAULT 16 via context).
    - Relies on $global:MandA or a passed -Context for configuration and logging context (addresses FAULT 2 for Get-OrElse, FAULT 10 principle).
    - PowerShell 5.1 compatible.
    - Interaction with ProgressDisplay.psm1 for UI updates (FAULT 19 handled by ProgressDisplay).
#>

Export-ModuleMember -Function Initialize-ProgressTracker, Start-OperationTimer, Stop-OperationTimer, Update-StepProgress, Complete-ProgressTracker, Get-ProgressMetrics, Export-ProgressMetricsReport, Show-ProgressSummaryReport, Reset-ProgressTrackerInternal

# --- Script-level State Variable ---
$script:ProgressState = $null # Initialized by Initialize-ProgressTracker

# --- Helper Functions ---
# Relies on global:Get-OrElse being defined by Set-SuiteEnvironment.ps1

# --- Public Functions ---

function Initialize-ProgressTracker {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$OverallPhaseName, 

        [Parameter(Mandatory=$false)]
        [int]$TotalExpectedSteps = 0, 

        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For logging
    )
    
    # FAULT 7 principle: Check for Write-MandALog
    $logCommandAvailable = Get-Command Write-MandALog -ErrorAction SilentlyContinue
    if ($logCommandAvailable) {
        Write-MandALog -Message "Initializing Progress Tracker for Phase: '$OverallPhaseName'." -Level "INFO" -Component "ProgressTracker" -Context $Context
    } else {
        Write-Host "[ProgressTracking.Initialize-ProgressTracker] Initializing for Phase: '$OverallPhaseName'."
        Write-Warning "[ProgressTracking.Initialize-ProgressTracker] Write-MandALog not found."
    }
    
    $script:ProgressState = @{
        OverallPhase    = $OverallPhaseName
        StartTime       = Get-Date
        EndTime         = $null
        TotalSteps      = $TotalExpectedSteps # If 0, step percentage won't be calculated, only counts
        CurrentStep     = 0
        LastStepMessage = ""
        Operations      = [System.Collections.Generic.Dictionary[string,hashtable]]::new([System.StringComparer]::OrdinalIgnoreCase) # Case-insensitive keys for OperationName
        MetricsLog      = [System.Collections.Generic.List[hashtable]]::new() 
        IsActive        = $true
    }
    $script:ProgressState.MetricsLog.Add(@{Timestamp = Get-Date; Event = "TrackerInitialized"; Phase = $OverallPhaseName })

    if ($logCommandAvailable) {
        Write-MandALog -Message "Progress Tracker initialized at $($script:ProgressState.StartTime)." -Level "DEBUG" -Component "ProgressTracker" -Context $Context
    }
}

function Start-OperationTimer {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$OperationName, 

        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context 
    )
    $logCommandAvailable = Get-Command Write-MandALog -ErrorAction SilentlyContinue

    if ($null -eq $script:ProgressState -or -not $script:ProgressState.IsActive) {
        $msg = "Progress Tracker not initialized or inactive. Cannot start timer for '$OperationName'."
        if ($logCommandAvailable) { Write-MandALog -Message $msg -Level "WARN" -Component "ProgressTracker" -Context $Context } else { Write-Warning $msg }
        return
    }

    if ($script:ProgressState.Operations.ContainsKey($OperationName) -and $null -ne $script:ProgressState.Operations[$OperationName].StartTime -and $null -eq $script:ProgressState.Operations[$OperationName].EndTime) {
        $msgRestart = "Operation '$OperationName' timer is already running. Restarting."
        if ($logCommandAvailable) { Write-MandALog -Message $msgRestart -Level "DEBUG" -Component "ProgressTracker" -Context $Context } else { Write-Host "[DEBUG] $msgRestart" }
    }

    $script:ProgressState.Operations[$OperationName] = @{
        StartTime = Get-Date
        EndTime   = $null
        Duration  = $null
        Status    = "Running" # Initial status
        DetailMessage = ""    # Initialize detail message
    }
    
    $msgStart = "Started timer for operation: '$OperationName'."
    if ($logCommandAvailable) { Write-MandALog -Message $msgStart -Level "INFO" -Component "ProgressTracker" -Context $Context } else { Write-Host "[INFO] $msgStart" }
    $script:ProgressState.MetricsLog.Add(@{Timestamp = Get-Date; Event = "OperationStart"; Operation = $OperationName })
}

function Stop-OperationTimer {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$OperationName,

        [Parameter(Mandatory=$true)]
        [ValidateSet("Success", "Failed", "Warning", "Skipped", "Completed")]
        [string]$OperationStatus,
        
        [Parameter(Mandatory=$false)]
        [string]$DetailMessage = "", 
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context 
    )
    $logCommandAvailable = Get-Command Write-MandALog -ErrorAction SilentlyContinue

    if ($null -eq $script:ProgressState -or -not $script:ProgressState.IsActive) {
        $msg = "Progress Tracker not initialized or inactive. Cannot stop timer for '$OperationName'."
        if ($logCommandAvailable) { Write-MandALog -Message $msg -Level "WARN" -Component "ProgressTracker" -Context $Context } else { Write-Warning $msg }
        return
    }
    if (-not $script:ProgressState.Operations.ContainsKey($OperationName)) {
        $msgNotFound = "Cannot stop timer: Operation '$OperationName' was not started or already processed."
        if ($logCommandAvailable) { Write-MandALog -Message $msgNotFound -Level "WARN" -Component "ProgressTracker" -Context $Context } else { Write-Warning $msgNotFound }
        return # Or potentially start it if that's desired behavior (less likely for a "stop")
    }

    $operationEntry = $script:ProgressState.Operations[$OperationName]
    if ($null -ne $operationEntry.EndTime) { # Check if already stopped
        $msgAlreadyStopped = "Operation '$OperationName' timer was already stopped at $($operationEntry.EndTime) with status $($operationEntry.Status). Re-stopping with new status $OperationStatus."
        if ($logCommandAvailable) { Write-MandALog -Message $msgAlreadyStopped -Level "DEBUG" -Component "ProgressTracker" -Context $Context } else { Write-Host "[DEBUG] $msgAlreadyStopped" }
    }
    
    $operationEntry.EndTime = Get-Date
    if ($null -ne $operationEntry.StartTime) { # Ensure StartTime was set
        $operationEntry.Duration = $operationEntry.EndTime - $operationEntry.StartTime
    } else {
        $operationEntry.Duration = New-TimeSpan # Or $null, depending on how you want to handle this edge case
        if ($logCommandAvailable) { Write-MandALog -Message "Warning: Operation '$OperationName' was stopped but StartTime was not recorded." -Level "WARN" -Component "ProgressTracker" -Context $Context } else { Write-Warning "Operation '$OperationName' stopped without StartTime."}
    }
    $operationEntry.Status = $OperationStatus
    $operationEntry.DetailMessage = $DetailMessage

    $logLevelForStatus = "INFO" # Default
    if ($OperationStatus -eq "Failed") { $logLevelForStatus = "ERROR" }
    elseif ($OperationStatus -eq "Warning") { $logLevelForStatus = "WARN" }
    
    $durationFormatted = if ($operationEntry.Duration) { $operationEntry.Duration.ToString('hh\:mm\:ss\.fff') } else { "N/A" }
    $logMsg = "Stopped timer for operation: '$OperationName'. Status: $OperationStatus. Duration: $durationFormatted."
    if (-not [string]::IsNullOrWhiteSpace($DetailMessage)) { $logMsg += " Details: $DetailMessage" }
    
    if ($logCommandAvailable) { Write-MandALog -Message $logMsg -Level $logLevelForStatus -Component "ProgressTracker" -Context $Context } else { Write-Host "[$logLevelForStatus] $logMsg"}
    
    $durationInSeconds = if($operationEntry.Duration){$operationEntry.Duration.TotalSeconds}else{0}
    $script:ProgressState.MetricsLog.Add(@{Timestamp = Get-Date; Event = "OperationStop"; Operation = $OperationName; Status = $OperationStatus; DurationSeconds = $durationInSeconds; Details = $DetailMessage})
}

function Update-StepProgress {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$StepMessage,

        [Parameter(Mandatory=$false)]
        [int]$IncrementStepCountBy = 1,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context 
    )
    $logCommandAvailable = Get-Command Write-MandALog -ErrorAction SilentlyContinue
    $progressDisplayAvailable = Get-Command Update-TaskProgress -ErrorAction SilentlyContinue

    if ($null -eq $script:ProgressState -or -not $script:ProgressState.IsActive) {
        $msg = "Progress Tracker not initialized or inactive. Cannot update step: '$StepMessage'."
        if ($logCommandAvailable) { Write-MandALog -Message $msg -Level "WARN" -Component "ProgressTracker" -Context $Context } else { Write-Warning $msg }
        return
    }

    $script:ProgressState.CurrentStep += $IncrementStepCountBy
    $script:ProgressState.LastStepMessage = $StepMessage
    
    $progressText = "Step $($script:ProgressState.CurrentStep)"
    if ($script:ProgressState.TotalSteps -gt 0) {
        $progressText += " of $($script:ProgressState.TotalSteps)"
    }
    $progressText += ": $StepMessage"

    if ($logCommandAvailable) { Write-MandALog -Message $progressText -Level "PROGRESS" -Component $script:ProgressState.OverallPhase -Context $Context } else { Write-Host "[PROGRESS] $progressText" }
    $script:ProgressState.MetricsLog.Add(@{Timestamp = Get-Date; Event = "StepUpdate"; Phase = $script:ProgressState.OverallPhase; Step = $script:ProgressState.CurrentStep; Message = $StepMessage})

    # FAULT 19 principle: If this module updates UI, it should use ProgressDisplay.psm1 functions
    if ($script:ProgressState.TotalSteps -gt 0 -and $progressDisplayAvailable) {
        Update-TaskProgress -Activity $script:ProgressState.OverallPhase `
                            -CurrentOperation $script:ProgressState.CurrentStep `
                            -TotalOperations $script:ProgressState.TotalSteps `
                            -StatusDescription $StepMessage `
                            -Context $Context # Pass context to Update-TaskProgress as well
    }
}

function Complete-ProgressTracker {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$FinalStatusMessage = "Overall process completed.",
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context 
    )
    $logCommandAvailable = Get-Command Write-MandALog -ErrorAction SilentlyContinue
    $progressDisplayAvailable = Get-Command Complete-TaskProgress -ErrorAction SilentlyContinue


    if ($null -eq $script:ProgressState -or -not $script:ProgressState.IsActive) {
        $msg = "Progress Tracker not initialized or already inactive. Cannot complete."
        if ($logCommandAvailable) { Write-MandALog -Message $msg -Level "WARN" -Component "ProgressTracker" -Context $Context } else { Write-Warning $msg }
        return
    }

    $script:ProgressState.EndTime = Get-Date
    $script:ProgressState.IsActive = $false # Mark as inactive
    $totalDuration = $script:ProgressState.EndTime - $script:ProgressState.StartTime
    
    $completionMsg = "Progress Tracking for '$($script:ProgressState.OverallPhase)' COMPLETED."
    $finalLogMsg = "$FinalStatusMessage Total Duration: $($totalDuration.ToString('hh\:mm\:ss\.fff'))"

    if ($logCommandAvailable) {
        Write-MandALog -Message $completionMsg -Level "SUCCESS" -Component "ProgressTracker" -Context $Context
        Write-MandALog -Message $finalLogMsg -Level "INFO" -Component "ProgressTracker" -Context $Context
    } else {
        Write-Host "[SUCCESS] $completionMsg"
        Write-Host "[INFO] $finalLogMsg"
    }
    
    $durationInSeconds = if($totalDuration){$totalDuration.TotalSeconds}else{0}
    $script:ProgressState.MetricsLog.Add(@{Timestamp = Get-Date; Event = "TrackerCompleted"; Phase = $script:ProgressState.OverallPhase; TotalDurationSeconds = $durationInSeconds; Message = $FinalStatusMessage})

    # FAULT 19 principle: Complete the UI progress bar if it was used
    if ($script:ProgressState.TotalSteps -gt 0 -and $progressDisplayAvailable) {
        Complete-TaskProgress -Activity $script:ProgressState.OverallPhase -Context $Context
    }
}

function Get-ProgressMetrics {
    [CmdletBinding()]
    param()
    if ($null -eq $script:ProgressState) {
        Write-Warning "[ProgressTracking.Get-ProgressMetrics] Progress Tracker was not initialized. No metrics available."
        return $null
    }
    # Return a clone to prevent unintentional external modification of the internal state
    return $script:ProgressState.Clone() 
}

function Export-ProgressMetricsReport {
    [CmdletBinding(SupportsShouldProcess=$true)]
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath, 

        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context 
    )
    $logCommandAvailable = Get-Command Write-MandALog -ErrorAction SilentlyContinue
    $fileOpsEnsureDirAvailable = Get-Command Ensure-DirectoryExists -ErrorAction SilentlyContinue # From FileOperations.psm1

    if ($null -eq $script:ProgressState) {
        $msgNoMetrics = "No progress metrics to export (tracker not initialized)."
        if ($logCommandAvailable) { Write-MandALog -Message $msgNoMetrics -Level "WARN" -Component "ProgressTracker" -Context $Context } else { Write-Warning $msgNoMetrics }
        return
    }

    $reportData = Get-ProgressMetrics # Gets a clone from our function
    if ($null -eq $reportData) { return } # Should not happen if ProgressState was not null

    # Add a summary section to the report data for better readability
    $reportData.ExecutionSummary = @{
        OverallPhase = $reportData.OverallPhase
        StartTime = $reportData.StartTime.ToString("o") # ISO 8601
        EndTime = if ($reportData.EndTime) { $reportData.EndTime.ToString("o") } else { "Still Active" }
        TotalDuration = if ($reportData.EndTime -and $reportData.StartTime) { ($reportData.EndTime - $reportData.StartTime).ToString('c') } else { "N/A" }
        TotalOperationsTracked = $reportData.Operations.Count
        TotalStepsLogged = $reportData.CurrentStep
    }
    
    $parentDir = Split-Path $FilePath -Parent
    if ($fileOpsEnsureDirAvailable) {
        if (-not (Ensure-DirectoryExists -DirectoryPath $parentDir -Context $Context)) { # Pass context to Ensure-DirectoryExists
             $msgDirFail = "Cannot export progress metrics. Parent directory '$parentDir' for '$FilePath' could not be ensured."
             if ($logCommandAvailable) { Write-MandALog -Message $msgDirFail -Level "ERROR" -Component "ProgressTracker" -Context $Context } else { Write-Error $msgDirFail }
             return
        }
    } else {
        # Fallback check if Ensure-DirectoryExists is not available
        if (-not (Test-Path $parentDir -PathType Container)) {
            $msgDirFailNoHelper = "Parent directory '$parentDir' for metrics report does not exist, and Ensure-DirectoryExists helper is not available."
            if ($logCommandAvailable) { Write-MandALog -Message $msgDirFailNoHelper -Level "ERROR" -Component "ProgressTracker" -Context $Context } else { Write-Error $msgDirFailNoHelper }
            return
        }
    }

    if ($PSCmdlet.ShouldProcess($FilePath, "Export Progress Metrics Report (JSON)")) {
        try {
            $reportData | ConvertTo-Json -Depth 10 -Compress | Set-Content -Path $FilePath -Encoding UTF8 -Force -ErrorAction Stop # Ensure UTF-8
            $msgExportSuccess = "Progress metrics report exported to: '$FilePath'"
            if ($logCommandAvailable) { Write-MandALog -Message $msgExportSuccess -Level "SUCCESS" -Component "ProgressTracker" -Context $Context } else { Write-Host "[SUCCESS] $msgExportSuccess" }
        } catch {
            $msgExportFail = "Failed to export progress metrics report to '$FilePath'. Error: $($_.Exception.Message)"
            if ($logCommandAvailable) { Write-MandALog -Message $msgExportFail -Level "ERROR" -Component "ProgressTracker" -Context $Context } else { Write-Error $msgExportFail }
            if ($Context -and $Context.PSObject.Properties['ErrorCollector']) {
                $Context.ErrorCollector.AddError("ProgressMetricsExport", "Failed to export metrics report to '$FilePath'", $_.Exception)
            }
        }
    }
}

function Show-ProgressSummaryReport {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context 
    )
    $logCommandAvailable = Get-Command Write-MandALog -ErrorAction SilentlyContinue
    $showSectionHeaderAvailable = Get-Command Show-SectionHeader -ErrorAction SilentlyContinue
    $showStatusTableAvailable = Get-Command Show-StatusTable -ErrorAction SilentlyContinue

    if ($null -eq $script:ProgressState) {
        $msgNoInit = "Progress Tracker not initialized. No summary to show."
        if ($logCommandAvailable) { Write-MandALog -Message $msgNoInit -Level "INFO" -Component "ProgressTracker" -Context $Context } else { Write-Host "[INFO] $msgNoInit" }
        return
    }

    $metrics = Get-ProgressMetrics # Gets a clone
    if ($null -eq $metrics) { return }

    if ($showSectionHeaderAvailable) {
        Show-SectionHeader -Title "Progress Summary: $($metrics.OverallPhase)" -Icon "[TIME]" -Context $Context
    } else { Write-Host "`n--- Progress Summary: $($metrics.OverallPhase) ---" }
    
    $summaryData = [ordered]@{ # Use ordered for predictable display
        "Start Time"    = $metrics.StartTime.ToString("yyyy-MM-dd HH:mm:ss")
        "End Time"      = if ($metrics.EndTime) { $metrics.EndTime.ToString("yyyy-MM-dd HH:mm:ss") } else { "In Progress" }
        "Total Duration"= if ($metrics.EndTime -and $metrics.StartTime) { ($metrics.EndTime - $metrics.StartTime).ToString('c') } else { "N/A" } # 'c' is constant (invariant) format
        "Steps Tracked" = "$($metrics.CurrentStep)$(if ($metrics.TotalSteps -gt 0) { ' of ' + $metrics.TotalSteps } else { '' })"
        "Operations Timed" = $metrics.Operations.Count
    }

    if ($showStatusTableAvailable) {
        Show-StatusTable -StatusData $summaryData -TableTitle "Overall Progress Statistics" -Context $Context
    } else {
        # Basic fallback for status table
        $summaryData.GetEnumerator() | ForEach-Object { Write-Host ("  {0,-25} : {1}" -f $_.Name, $_.Value) }
    }

    if ($metrics.Operations.Count -gt 0) {
        $opMsg = "Operation Durations and Status:"
        if ($logCommandAvailable) { Write-MandALog -Message $opMsg -Level "INFO" -Component "ProgressSummary" -Context $Context } else { Write-Host "`n$opMsg" }
        
        $opTableData = [System.Collections.Generic.List[PSCustomObject]]::new()
        foreach ($opName in $metrics.Operations.Keys | Sort-Object) {
            $opEntry = $metrics.Operations[$opName]
            $opTableData.Add([PSCustomObject]@{
                Operation = $opName
                Status    = $opEntry.Status
                Duration  = if ($opEntry.Duration) { $opEntry.Duration.ToString('hh\:mm\:ss\.fff') } else { if($opEntry.Status -eq "Running"){"Running"}else{"Not Stopped/No Duration"} }
                Details   = $opEntry.DetailMessage | Get-OrElseLocal "" # Use local Get-OrElse
            })
        }
        # Format-Table is good for console display of this kind of data
        $tableOutput = $opTableData | Format-Table -AutoSize | Out-String
        if ($logCommandAvailable) {
            # Split multi-line output from Format-Table for better logging
            $tableOutput.Split([System.Environment]::NewLine) | ForEach-Object {
                if (-not [string]::IsNullOrWhiteSpace($_)) {
                    Write-MandALog -Message $_ -Level "INFO" -Component "ProgressSummaryOpTable" -Context $Context
                }
            }
        } else {
            Write-Host $tableOutput
        }
    }
}

function Reset-ProgressTrackerInternal { 
    [CmdletBinding()]
    param(
         [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context 
    )
    $logCommandAvailable = Get-Command Write-MandALog -ErrorAction SilentlyContinue
    $msg = "Resetting Progress Tracker state."
    if ($logCommandAvailable) { Write-MandALog -Message $msg -Level "INFO" -Component "ProgressTracker" -Context $Context } else { Write-Host "[INFO] $msg" }
    
    $script:ProgressState = $null # Clears the state for a new tracking session
}

Write-Host "[ProgressTracking.psm1] Module loaded. (v1.0.1)" -ForegroundColor DarkGray
