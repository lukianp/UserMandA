param(
    [string]$LogPath = "C:\enterprisediscovery\Logs\LogicEngine.log",
    [int]$MonitorDuration = 300  # 5 minutes
)

# Ensure log directory exists
New-Item -Path (Split-Path $LogPath) -ItemType Directory -Force

# Start a transcript
Start-Transcript -Path "$LogPath.monitor" -Force

Write-Host "Starting LogicEngine Monitoring Script"
Write-Host "Monitoring Log: $LogPath"
Write-Host "Monitoring Duration: $MonitorDuration seconds"

$startTime = Get-Date

# Track metrics
$metrics = @{
    TotalErrors = 0
    TotalWarnings = 0
    FileLoadFailures = @{}
    LoadDuration = $null
    LoadCompletedSuccessfully = $false
    InferenceRuleCount = 0
}

# Watch the log in real-time
Get-Content $LogPath -Wait | Where-Object {
    $_ -and (Get-Date).Subtract($startTime).TotalSeconds -lt $MonitorDuration
} | ForEach-Object {
    $line = $_
    
    # Track errors
    if ($line -match "Failed to load") {
        $metrics.TotalErrors++
        $component = ($line -split "Failed to load")[-1].Trim()
        $metrics.FileLoadFailures[$component] = ($metrics.FileLoadFailures[$component] + 1)
    }
    
    # Track warnings
    if ($line -match "LogWarning") {
        $metrics.TotalWarnings++
    }
    
    # Check load duration
    if ($line -match "data load completed successfully in (\d+)ms") {
        $metrics.LoadDuration = [int]$Matches[1]
        $metrics.LoadCompletedSuccessfully = $true
    }
    
    # Track inference rules
    if ($line -match "Applied (\d+) inference rules") {
        $metrics.InferenceRuleCount = [int]$Matches[1]
    }
    
    Write-Host $line
}

# Generate report
Write-Host "`n--- LogicEngine Monitoring Report ---"
Write-Host "Total Errors: $($metrics.TotalErrors)"
Write-Host "Total Warnings: $($metrics.TotalWarnings)"
Write-Host "Load Duration: $($metrics.LoadDuration)ms"
Write-Host "Inference Rules Applied: $($metrics.InferenceRuleCount)"
Write-Host "`nFile Load Failures:"
$metrics.FileLoadFailures.GetEnumerator() | ForEach-Object {
    Write-Host "  $($_.Key): $($_.Value) failures"
}

Write-Host "`nLoad Completed Successfully: $($metrics.LoadCompletedSuccessfully)"

Stop-Transcript