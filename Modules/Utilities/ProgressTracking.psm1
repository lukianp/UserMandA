<#
.SYNOPSIS
    Progress tracking for M&A Discovery Suite
.DESCRIPTION
    Provides real-time progress monitoring and ETA calculation
.NOTES
    Author: Lukian Poleschtschuk
    Version: 1.0.0
    Created: 2025-06-03
    Last Modified: 2025-06-03
    Change Log: Initial version - any future changes require version increment
#>

# Global progress tracking state
$script:ProgressState = @{
    CurrentPhase = $null
    TotalSteps = 0
    CurrentStep = 0
    StartTime = $null
    LastUpdateTime = $null
    Operations = @{}
    Metrics = @{}
}

function Initialize-ProgressTracker {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Phase,
        
        [Parameter(Mandatory=$true)]
        [int]$TotalSteps
    )
    
    $script:ProgressState.CurrentPhase = $Phase
    $script:ProgressState.TotalSteps = $TotalSteps
    $script:ProgressState.CurrentStep = 0
    $script:ProgressState.StartTime = Get-Date
    $script:ProgressState.LastUpdateTime = Get-Date
    
    Write-MandALog "Progress tracker initialized for phase: $Phase ($TotalSteps steps)" -Level "INFO"
    
    # Initialize Windows progress bar
    Write-Progress -Activity "M&A Discovery Suite - $Phase" -Status "Initializing..." -PercentComplete 0
}

function Update-Progress {
    param(
        [Parameter(Mandatory=$true)]
        [int]$Step,
        
        [Parameter(Mandatory=$true)]
        [string]$Status,
        
        [Parameter(Mandatory=$false)]
        [int]$ItemsProcessed = 0,
        
        [Parameter(Mandatory=$false)]
        [int]$TotalItems = 0
    )
    
    $script:ProgressState.CurrentStep = $Step
    $script:ProgressState.LastUpdateTime = Get-Date
    
    # Calculate percentage
    $percentComplete = if ($script:ProgressState.TotalSteps -gt 0) {
        [math]::Round(($Step / $script:ProgressState.TotalSteps) * 100, 1)
    } else {
        0
    }
    
    # Calculate ETA
    $elapsed = (Get-Date) - $script:ProgressState.StartTime
    $eta = if ($percentComplete -gt 0) {
        $totalEstimated = $elapsed.TotalSeconds * (100 / $percentComplete)
        $remaining = $totalEstimated - $elapsed.TotalSeconds
        [TimeSpan]::FromSeconds($remaining)
    } else {
        [TimeSpan]::Zero
    }
    
    # Format status message
    $statusMessage = $Status
    if ($TotalItems -gt 0) {
        $statusMessage += " ($ItemsProcessed of $TotalItems items)"
    }
    
    if ($eta.TotalSeconds -gt 0) {
        $etaString = if ($eta.TotalHours -ge 1) {
            $eta.ToString("hh\:mm\:ss")
        } else {
            $eta.ToString("mm\:ss")
        }
        $statusMessage += " - ETA: $etaString"
    }
    
    # Update Windows progress bar
    Write-Progress -Activity "M&A Discovery Suite - $($script:ProgressState.CurrentPhase)" -Status $statusMessage -PercentComplete $percentComplete
    
    # Log progress
    Write-MandALog "Progress: Step $Step of $($script:ProgressState.TotalSteps) ($percentComplete%) - $Status" -Level "INFO"
    
    # Store metrics
    $script:ProgressState.Metrics[$Step] = @{
        Status = $Status
        Timestamp = Get-Date
        ItemsProcessed = $ItemsProcessed
        TotalItems = $TotalItems
        PercentComplete = $percentComplete
        ETA = $eta
    }
}

function Complete-Progress {
    param(
        [Parameter(Mandatory=$false)]
        [string]$FinalStatus = "Completed"
    )
    
    $script:ProgressState.CurrentStep = $script:ProgressState.TotalSteps
    $elapsed = (Get-Date) - $script:ProgressState.StartTime
    
    Write-Progress -Activity "M&A Discovery Suite - $($script:ProgressState.CurrentPhase)" -Status $FinalStatus -PercentComplete 100 -Completed
    
    Write-MandALog "Phase '$($script:ProgressState.CurrentPhase)' completed in $($elapsed.ToString('hh\:mm\:ss'))" -Level "SUCCESS"
    
    # Store final metrics
    $script:ProgressState.Metrics["Final"] = @{
        Status = $FinalStatus
        Timestamp = Get-Date
        TotalDuration = $elapsed
        AverageStepTime = if ($script:ProgressState.TotalSteps -gt 0) { $elapsed.TotalSeconds / $script:ProgressState.TotalSteps } else { 0 }
    }
}

function Start-OperationTimer {
    param(
        [Parameter(Mandatory=$true)]
        [string]$OperationName
    )
    
    $script:ProgressState.Operations[$OperationName] = @{
        StartTime = Get-Date
        EndTime = $null
        Duration = $null
        Status = "Running"
    }
    
    Write-MandALog "Started operation: $OperationName" -Level "DEBUG"
}

function Stop-OperationTimer {
    param(
        [Parameter(Mandatory=$true)]
        [string]$OperationName,
        
        [Parameter(Mandatory=$false)]
        [string]$Status = "Completed"
    )
    
    if ($script:ProgressState.Operations.ContainsKey($OperationName)) {
        $operation = $script:ProgressState.Operations[$OperationName]
        $operation.EndTime = Get-Date
        $operation.Duration = $operation.EndTime - $operation.StartTime
        $operation.Status = $Status
        
        Write-MandALog "Completed operation: $OperationName in $($operation.Duration.ToString('hh\:mm\:ss'))" -Level "DEBUG"
    }
}

function Get-ProgressMetrics {
    return @{
        CurrentPhase = $script:ProgressState.CurrentPhase
        TotalSteps = $script:ProgressState.TotalSteps
        CurrentStep = $script:ProgressState.CurrentStep
        StartTime = $script:ProgressState.StartTime
        LastUpdateTime = $script:ProgressState.LastUpdateTime
        Operations = $script:ProgressState.Operations.Clone()
        Metrics = $script:ProgressState.Metrics.Clone()
    }
}

function Export-ProgressMetrics {
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    
    try {
        $outputPath = $Configuration.environment.outputPath
        $metricsFile = Join-Path $outputPath "Logs\ProgressMetrics_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
        
        $metrics = Get-ProgressMetrics
        $metrics | ConvertTo-Json -Depth 10 | Set-Content -Path $metricsFile -Encoding UTF8
        
        Write-MandALog "Progress metrics exported: $metricsFile" -Level "SUCCESS"
        return $metricsFile
        
    } catch {
        Write-MandALog "Failed to export progress metrics: $($_.Exception.Message)" -Level "ERROR"
        return $null
    }
}

function Show-ProgressSummary {
    $metrics = Get-ProgressMetrics
    
    Write-MandALog "Progress Summary" -Level "HEADER"
    Write-MandALog "Current Phase: $($metrics.CurrentPhase)" -Level "INFO"
    Write-MandALog "Progress: $($metrics.CurrentStep) of $($metrics.TotalSteps) steps" -Level "INFO"
    
    if ($metrics.StartTime) {
        $elapsed = (Get-Date) - $metrics.StartTime
        Write-MandALog "Elapsed Time: $($elapsed.ToString('hh\:mm\:ss'))" -Level "INFO"
    }
    
    if ($metrics.Operations.Count -gt 0) {
        Write-MandALog "Operations:" -Level "INFO"
        foreach ($op in $metrics.Operations.GetEnumerator()) {
            $duration = if ($op.Value.Duration) { $op.Value.Duration.ToString('hh\:mm\:ss') } else { "Running" }
            Write-MandALog "  $($op.Key): $($op.Value.Status) ($duration)" -Level "INFO"
        }
    }
}

function Reset-ProgressTracker {
    $script:ProgressState = @{
        CurrentPhase = $null
        TotalSteps = 0
        CurrentStep = 0
        StartTime = $null
        LastUpdateTime = $null
        Operations = @{}
        Metrics = @{}
    }
    
    Write-MandALog "Progress tracker reset" -Level "DEBUG"
}

function Clear-TempFiles {
    param([hashtable]$Configuration)
    
    try {
        $tempPath = $Configuration.environment.tempPath
        
        if (Test-Path $tempPath) {
            $tempFiles = Get-ChildItem -Path $tempPath -Recurse -File | Where-Object { $_.LastWriteTime -lt (Get-Date).AddHours(-24) }
            
            foreach ($file in $tempFiles) {
                try {
                    Remove-Item $file.FullName -Force
                    Write-MandALog "Cleaned up temp file: $($file.Name)" -Level "DEBUG"
                } catch {
                    Write-MandALog "Failed to clean up temp file $($file.Name): $($_.Exception.Message)" -Level "WARN"
                }
            }
            
            if ($tempFiles.Count -gt 0) {
                Write-MandALog "Cleaned up $($tempFiles.Count) temporary files" -Level "SUCCESS"
            }
        }
        
    } catch {
        Write-MandALog "Temp file cleanup failed: $($_.Exception.Message)" -Level "WARN"
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Initialize-ProgressTracker',
    'Update-Progress',
    'Complete-Progress',
    'Start-OperationTimer',
    'Stop-OperationTimer',
    'Get-ProgressMetrics',
    'Export-ProgressMetrics',
    'Show-ProgressSummary',
    'Reset-ProgressTracker',
    'Clear-TempFiles'
)