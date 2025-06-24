# -*- coding: utf-8-bom -*-
# Monitor-Runspaces.ps1
# Real-time runspace log monitoring script
# Author: M&A Team
# Version: 1.0.0
# Created: 2025-06-10

<#
.SYNOPSIS
    Real-time monitoring script for runspace logs
.DESCRIPTION
    Monitors runspace log files in real-time, displaying recent entries with color coding
    for different log levels. Automatically refreshes every 2 seconds.
.PARAMETER LogPath
    Path to the directory containing runspace log files
.PARAMETER RefreshInterval
    Refresh interval in seconds (default: 2)
.PARAMETER TailLines
    Number of lines to display from each log file (default: 5)
.EXAMPLE
    .\Monitor-Runspaces.ps1 -LogPath "C:\MandADiscovery\Profiles\BlackStones\Logs"
.EXAMPLE
    .\Monitor-Runspaces.ps1 -LogPath "C:\MandADiscovery\Profiles\BlackStones\Logs" -RefreshInterval 1 -TailLines 10
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$LogPath = "C:\MandADiscovery\Profiles\BlackStones\Logs",
    
    [Parameter(Mandatory=$false)]
    [int]$RefreshInterval = 2,
    
    [Parameter(Mandatory=$false)]
    [int]$TailLines = 5,
    
    [Parameter(Mandatory=$false)]
    [int]$MaxAge = 10
)

# Function to get color based on log level
function Get-LogColor {
    param([string]$LogLine)
    
    if ($LogLine -match "\[ERROR\]") { return "Red" }
    elseif ($LogLine -match "\[WARN\]") { return "Yellow" }
    elseif ($LogLine -match "\[SUCCESS\]") { return "Green" }
    elseif ($LogLine -match "\[DEBUG\]") { return "Gray" }
    elseif ($LogLine -match "\[INFO\]") { return "Cyan" }
    else { return "White" }
}

# Function to format timestamp for display
function Format-TimeStamp {
    param([datetime]$DateTime)
    return $DateTime.ToString("HH:mm:ss.fff")
}

# Function to get active runspace logs
function Get-ActiveRunspaceLogs {
    param(
        [string]$Path,
        [int]$MaxAgeMinutes
    )
    
    if (-not (Test-Path $Path)) {
        Write-Warning "Log path does not exist: $Path"
        return @()
    }
    
    $cutoffTime = (Get-Date).AddMinutes(-$MaxAgeMinutes)
    
    try {
        $logs = Get-ChildItem -Path $Path -Filter "Runspace_*.log" -ErrorAction SilentlyContinue |
            Where-Object { $_.LastWriteTime -gt $cutoffTime } |
            Sort-Object LastWriteTime -Descending
        
        return $logs
    } catch {
        Write-Warning "Error accessing log files: $($_.Exception.Message)"
        return @()
    }
}

# Function to display log summary
function Show-LogSummary {
    param($Logs)
    
    $totalLogs = $Logs.Count
    $activeLogs = ($Logs | Where-Object { $_.LastWriteTime -gt (Get-Date).AddMinutes(-2) }).Count
    $recentLogs = ($Logs | Where-Object { $_.LastWriteTime -gt (Get-Date).AddMinutes(-5) }).Count
    
    Write-Host "=== RUNSPACE LOG SUMMARY ===" -ForegroundColor Cyan
    Write-Host "Total Active Logs: $totalLogs" -ForegroundColor White
    Write-Host "Recently Updated (2min): $activeLogs" -ForegroundColor $(if ($activeLogs -gt 0) { "Green" } else { "Yellow" })
    Write-Host "Recent Activity (5min): $recentLogs" -ForegroundColor $(if ($recentLogs -gt 0) { "Green" } else { "Gray" })
    Write-Host "Monitoring Path: $LogPath" -ForegroundColor Gray
    Write-Host "Refresh Interval: ${RefreshInterval}s | Tail Lines: $TailLines | Max Age: ${MaxAge}min" -ForegroundColor Gray
    Write-Host ""
}

# Function to display log content
function Show-LogContent {
    param(
        $LogFile,
        [int]$Lines
    )
    
    try {
        $content = Get-Content $LogFile.FullName -Tail $Lines -ErrorAction SilentlyContinue
        
        if ($content) {
            $moduleMatch = $LogFile.Name -match "Runspace_(.+?)_\d+"
            $moduleName = if ($moduleMatch) { $Matches[1] } else { "Unknown" }
            
            $lastWrite = Format-TimeStamp $LogFile.LastWriteTime
            $fileSize = [Math]::Round($LogFile.Length / 1KB, 1)
            
            Write-Host "--- $moduleName [$lastWrite] (${fileSize}KB) ---" -ForegroundColor Yellow
            
            foreach ($line in $content) {
                if ($line.Trim()) {
                    $color = Get-LogColor $line
                    Write-Host $line -ForegroundColor $color
                }
            }
            Write-Host ""
        }
    } catch {
        Write-Warning "Error reading log file $($LogFile.Name): $($_.Exception.Message)"
    }
}

# Function to show statistics
function Show-Statistics {
    param($Logs)
    
    $stats = @{
        ErrorCount = 0
        WarnCount = 0
        InfoCount = 0
        DebugCount = 0
        TotalLines = 0
    }
    
    foreach ($log in $Logs) {
        try {
            $content = Get-Content $log.FullName -ErrorAction SilentlyContinue
            if ($content) {
                $stats.TotalLines += $content.Count
                $stats.ErrorCount += ($content | Where-Object { $_ -match "\[ERROR\]" }).Count
                $stats.WarnCount += ($content | Where-Object { $_ -match "\[WARN\]" }).Count
                $stats.InfoCount += ($content | Where-Object { $_ -match "\[INFO\]" }).Count
                $stats.DebugCount += ($content | Where-Object { $_ -match "\[DEBUG\]" }).Count
            }
        } catch {
            # Silently continue if file is locked
        }
    }
    
    Write-Host "=== LOG STATISTICS ===" -ForegroundColor Cyan
    Write-Host "Total Lines: $($stats.TotalLines)" -ForegroundColor White
    Write-Host "Errors: $($stats.ErrorCount)" -ForegroundColor $(if ($stats.ErrorCount -gt 0) { "Red" } else { "Green" })
    Write-Host "Warnings: $($stats.WarnCount)" -ForegroundColor $(if ($stats.WarnCount -gt 0) { "Yellow" } else { "Green" })
    Write-Host "Info: $($stats.InfoCount)" -ForegroundColor Cyan
    Write-Host "Debug: $($stats.DebugCount)" -ForegroundColor Gray
    Write-Host ""
}

# Main monitoring loop
Write-Host "Starting Runspace Log Monitor..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Yellow
Write-Host ""

# Validate log path
if (-not (Test-Path $LogPath)) {
    Write-Error "Log path does not exist: $LogPath"
    Write-Host "Please ensure the path is correct and try again." -ForegroundColor Yellow
    exit 1
}

$iteration = 0

try {
    while ($true) {
        $iteration++
        
        # Clear screen for clean display
        Clear-Host
        
        # Header
        Write-Host "=== RUNSPACE MONITOR === $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
        Write-Host "Iteration: $iteration | Path: $LogPath" -ForegroundColor Gray
        Write-Host ""
        
        # Get active logs
        $runspaceLogs = Get-ActiveRunspaceLogs -Path $LogPath -MaxAgeMinutes $MaxAge
        
        if ($runspaceLogs.Count -eq 0) {
            Write-Host "No active runspace logs found in the last $MaxAge minutes." -ForegroundColor Yellow
            Write-Host "Waiting for runspace activity..." -ForegroundColor Gray
        } else {
            # Show summary
            Show-LogSummary -Logs $runspaceLogs
            
            # Show statistics every 5 iterations
            if ($iteration % 5 -eq 0) {
                Show-Statistics -Logs $runspaceLogs
            }
            
            # Display log content
            foreach ($log in $runspaceLogs) {
                Show-LogContent -LogFile $log -Lines $TailLines
            }
        }
        
        # Footer
        Write-Host "=== Press Ctrl+C to stop monitoring ===" -ForegroundColor DarkGray
        
        # Wait for next refresh
        Start-Sleep -Seconds $RefreshInterval
    }
} catch [System.Management.Automation.PipelineStoppedException] {
    # Handle Ctrl+C gracefully
    Write-Host ""
    Write-Host "Monitoring stopped by user." -ForegroundColor Yellow
} catch {
    Write-Error "Monitoring error: $($_.Exception.Message)"
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
} finally {
    Write-Host "Runspace monitor terminated." -ForegroundColor Green
}