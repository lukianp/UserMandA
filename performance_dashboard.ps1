# Performance Dashboard for M&A Discovery Suite
# Provides real-time performance metrics and trending

param(
    [int]$RefreshSeconds = 15,
    [string]$LogPath = "D:\Scripts\UserMandA\performance_dashboard.log"
)

# Performance data collection
$PerformanceHistory = @()

function Clear-Screen {
    Clear-Host
}

function Get-ApplicationMetrics {
    $Processes = Get-Process -Name "*MandADiscovery*" -ErrorAction SilentlyContinue
    $Metrics = @{
        Timestamp = Get-Date
        ProcessCount = $Processes.Count
        TotalMemoryMB = 0
        MaxMemoryMB = 0
        ProcessDetails = @()
    }
    
    foreach ($Process in $Processes) {
        $MemoryMB = [math]::Round($Process.WorkingSet / 1MB, 2)
        $Metrics.TotalMemoryMB += $MemoryMB
        if ($MemoryMB -gt $Metrics.MaxMemoryMB) {
            $Metrics.MaxMemoryMB = $MemoryMB
        }
        
        $ProcessDetail = [PSCustomObject]@{
            Name = $Process.ProcessName
            PID = $Process.Id
            MemoryMB = $MemoryMB
            CPU_Percent = try { $Process.CPU } catch { 0 }
            StartTime = try { $Process.StartTime } catch { "Unknown" }
        }
        $Metrics.ProcessDetails += $ProcessDetail
    }
    
    return $Metrics
}

function Get-SystemMetrics {
    try {
        $CPU = Get-WmiObject -Class Win32_Processor | Measure-Object -Property LoadPercentage -Average | Select-Object -ExpandProperty Average
        $Memory = Get-WmiObject -Class Win32_OperatingSystem
        $TotalMemory = [math]::Round($Memory.TotalVisibleMemorySize / 1024, 2)
        $FreeMemory = [math]::Round($Memory.FreePhysicalMemory / 1024, 2)
        $UsedMemory = $TotalMemory - $FreeMemory
        
        $Disk = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'"
        $DiskFreeGB = [math]::Round($Disk.FreeSpace / 1GB, 2)
        
        return @{
            CPU_Percent = [math]::Round($CPU, 1)
            Memory_Used_MB = [math]::Round($UsedMemory, 0)
            Memory_Total_MB = [math]::Round($TotalMemory, 0)
            Memory_Usage_Percent = [math]::Round(($UsedMemory / $TotalMemory) * 100, 1)
            Disk_Free_GB = $DiskFreeGB
        }
    }
    catch {
        return @{
            CPU_Percent = 0
            Memory_Used_MB = 0
            Memory_Total_MB = 0
            Memory_Usage_Percent = 0
            Disk_Free_GB = 0
        }
    }
}

function Get-LogMetrics {
    $LogMetrics = @{
        RecentErrors = 0
        RecentWarnings = 0
        ThreadSafetyViolations = 0
        PerformanceIssues = 0
        LastLogActivity = "Unknown"
    }
    
    try {
        $StructuredLog = "C:\discoverydata\ljpops\Logs\structured_log_$(Get-Date -Format 'yyyyMMdd').log"
        if (Test-Path $StructuredLog) {
            $RecentLogs = Get-Content $StructuredLog -Tail 50 | Where-Object { $_ -ne "" }
            
            foreach ($Line in $RecentLogs) {
                if ($Line -match '\[ERROR\]') { $LogMetrics.RecentErrors++ }
                if ($Line -match '\[WARNING\]') { $LogMetrics.RecentWarnings++ }
                if ($Line -match 'thread different from the Dispatcher thread') { $LogMetrics.ThreadSafetyViolations++ }
                if ($Line -match 'elapsed_ms=([5-9]\d{3}|\d{5,})') { $LogMetrics.PerformanceIssues++ }
            }
            
            $LogMetrics.LastLogActivity = (Get-Item $StructuredLog).LastWriteTime.ToString("HH:mm:ss")
        }
    }
    catch {
        # Log access failed
    }
    
    return $LogMetrics
}

function Show-Dashboard {
    param($AppMetrics, $SystemMetrics, $LogMetrics, $History)
    
    Clear-Screen
    
    $CurrentTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    Write-Host "╔══════════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                        M&A DISCOVERY SUITE - PERFORMANCE DASHBOARD               ║" -ForegroundColor Cyan
    Write-Host "║                                $CurrentTime                               ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    # Application Status
    Write-Host "┌─ APPLICATION STATUS ──────────────────────────────────────────────────────────────┐" -ForegroundColor Yellow
    if ($AppMetrics.ProcessCount -gt 0) {
        Write-Host "│ STATUS: " -NoNewline -ForegroundColor White
        Write-Host "RUNNING ✓" -ForegroundColor Green
        Write-Host "│ PROCESSES: $($AppMetrics.ProcessCount)" -ForegroundColor White
        Write-Host "│ TOTAL MEMORY: $($AppMetrics.TotalMemoryMB) MB" -ForegroundColor White
        
        foreach ($Process in $AppMetrics.ProcessDetails) {
            $Color = if ($Process.MemoryMB -gt 500) { "Red" } elseif ($Process.MemoryMB -gt 300) { "Yellow" } else { "Green" }
            Write-Host "│   └─ $($Process.Name) (PID: $($Process.PID)) - $($Process.MemoryMB) MB" -ForegroundColor $Color
        }
    }
    else {
        Write-Host "│ STATUS: " -NoNewline -ForegroundColor White
        Write-Host "NOT RUNNING ✗" -ForegroundColor Red
        Write-Host "│ No M&A Discovery Suite processes detected" -ForegroundColor Red
    }
    Write-Host "└────────────────────────────────────────────────────────────────────────────────────┘" -ForegroundColor Yellow
    Write-Host ""
    
    # System Resources
    Write-Host "┌─ SYSTEM RESOURCES ────────────────────────────────────────────────────────────────┐" -ForegroundColor Blue
    
    $CPUColor = if ($SystemMetrics.CPU_Percent -gt 80) { "Red" } elseif ($SystemMetrics.CPU_Percent -gt 60) { "Yellow" } else { "Green" }
    Write-Host "│ CPU USAGE: " -NoNewline -ForegroundColor White
    Write-Host "$($SystemMetrics.CPU_Percent)%" -ForegroundColor $CPUColor
    
    $MemColor = if ($SystemMetrics.Memory_Usage_Percent -gt 85) { "Red" } elseif ($SystemMetrics.Memory_Usage_Percent -gt 70) { "Yellow" } else { "Green" }
    Write-Host "│ MEMORY: " -NoNewline -ForegroundColor White
    Write-Host "$($SystemMetrics.Memory_Used_MB)/$($SystemMetrics.Memory_Total_MB) MB ($($SystemMetrics.Memory_Usage_Percent)%)" -ForegroundColor $MemColor
    
    $DiskColor = if ($SystemMetrics.Disk_Free_GB -lt 10) { "Red" } elseif ($SystemMetrics.Disk_Free_GB -lt 50) { "Yellow" } else { "Green" }
    Write-Host "│ DISK C: FREE: " -NoNewline -ForegroundColor White
    Write-Host "$($SystemMetrics.Disk_Free_GB) GB" -ForegroundColor $DiskColor
    
    Write-Host "└────────────────────────────────────────────────────────────────────────────────────┘" -ForegroundColor Blue
    Write-Host ""
    
    # Log Analysis
    Write-Host "┌─ LOG ANALYSIS ────────────────────────────────────────────────────────────────────┐" -ForegroundColor Magenta
    
    $ErrorColor = if ($LogMetrics.RecentErrors -gt 10) { "Red" } elseif ($LogMetrics.RecentErrors -gt 5) { "Yellow" } else { "Green" }
    Write-Host "│ RECENT ERRORS: " -NoNewline -ForegroundColor White
    Write-Host "$($LogMetrics.RecentErrors)" -ForegroundColor $ErrorColor
    
    $WarnColor = if ($LogMetrics.RecentWarnings -gt 20) { "Red" } elseif ($LogMetrics.RecentWarnings -gt 10) { "Yellow" } else { "Green" }
    Write-Host "│ RECENT WARNINGS: " -NoNewline -ForegroundColor White
    Write-Host "$($LogMetrics.RecentWarnings)" -ForegroundColor $WarnColor
    
    $ThreadColor = if ($LogMetrics.ThreadSafetyViolations -gt 0) { "Red" } else { "Green" }
    Write-Host "│ THREAD SAFETY VIOLATIONS: " -NoNewline -ForegroundColor White
    Write-Host "$($LogMetrics.ThreadSafetyViolations)" -ForegroundColor $ThreadColor
    
    $PerfColor = if ($LogMetrics.PerformanceIssues -gt 0) { "Yellow" } else { "Green" }
    Write-Host "│ PERFORMANCE ISSUES: " -NoNewline -ForegroundColor White
    Write-Host "$($LogMetrics.PerformanceIssues)" -ForegroundColor $PerfColor
    
    Write-Host "│ LAST LOG ACTIVITY: $($LogMetrics.LastLogActivity)" -ForegroundColor White
    Write-Host "└────────────────────────────────────────────────────────────────────────────────────┘" -ForegroundColor Magenta
    Write-Host ""
    
    # Performance Trend
    if ($History.Count -gt 1) {
        Write-Host "┌─ PERFORMANCE TREND (LAST 5 MEASUREMENTS) ────────────────────────────────────────┐" -ForegroundColor Cyan
        
        $RecentHistory = $History | Select-Object -Last 5
        foreach ($Record in $RecentHistory) {
            $Time = $Record.Timestamp.ToString("HH:mm:ss")
            $StatusIcon = if ($Record.AppRunning) { "✓" } else { "✗" }
            $StatusColor = if ($Record.AppRunning) { "Green" } else { "Red" }
            
            Write-Host "│ $Time " -NoNewline -ForegroundColor White
            Write-Host "$StatusIcon " -NoNewline -ForegroundColor $StatusColor
            Write-Host "CPU: $($Record.CPU)% " -NoNewline -ForegroundColor White
            Write-Host "MEM: $($Record.AppMemoryMB)MB " -NoNewline -ForegroundColor White
            Write-Host "ERRORS: $($Record.LogErrors)" -ForegroundColor White
        }
        
        Write-Host "└────────────────────────────────────────────────────────────────────────────────────┘" -ForegroundColor Cyan
        Write-Host ""
    }
    
    # Status Summary
    $OverallStatus = if ($AppMetrics.ProcessCount -gt 0 -and $LogMetrics.ThreadSafetyViolations -eq 0 -and $SystemMetrics.CPU_Percent -lt 80) {
        "HEALTHY"
    } elseif ($AppMetrics.ProcessCount -gt 0) {
        "RUNNING WITH ISSUES"
    } else {
        "CRITICAL"
    }
    
    $StatusColor = switch ($OverallStatus) {
        "HEALTHY" { "Green" }
        "RUNNING WITH ISSUES" { "Yellow" }
        "CRITICAL" { "Red" }
    }
    
    Write-Host "OVERALL STATUS: " -NoNewline -ForegroundColor White
    Write-Host $OverallStatus -ForegroundColor $StatusColor
    Write-Host "Next refresh in $RefreshSeconds seconds... (Ctrl+C to stop)" -ForegroundColor Gray
}

# Main dashboard loop
Write-Host "Starting M&A Discovery Suite Performance Dashboard..." -ForegroundColor Green
Write-Host "Refresh Rate: $RefreshSeconds seconds" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Yellow
Write-Host ""

try {
    while ($true) {
        $AppMetrics = Get-ApplicationMetrics
        $SystemMetrics = Get-SystemMetrics
        $LogMetrics = Get-LogMetrics
        
        # Add to history
        $HistoryRecord = [PSCustomObject]@{
            Timestamp = Get-Date
            AppRunning = $AppMetrics.ProcessCount -gt 0
            AppMemoryMB = $AppMetrics.TotalMemoryMB
            CPU = $SystemMetrics.CPU_Percent
            SystemMemoryPercent = $SystemMetrics.Memory_Usage_Percent
            LogErrors = $LogMetrics.RecentErrors
            ThreadViolations = $LogMetrics.ThreadSafetyViolations
        }
        
        $PerformanceHistory += $HistoryRecord
        
        # Keep only last 20 records
        if ($PerformanceHistory.Count -gt 20) {
            $PerformanceHistory = $PerformanceHistory | Select-Object -Last 20
        }
        
        Show-Dashboard $AppMetrics $SystemMetrics $LogMetrics $PerformanceHistory
        
        # Log performance data
        $LogEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | App: $($AppMetrics.ProcessCount) processes | Memory: $($AppMetrics.TotalMemoryMB)MB | CPU: $($SystemMetrics.CPU_Percent)% | Errors: $($LogMetrics.RecentErrors) | Thread Issues: $($LogMetrics.ThreadSafetyViolations)"
        $LogEntry | Add-Content -Path $LogPath -Force
        
        Start-Sleep -Seconds $RefreshSeconds
    }
}
catch {
    Write-Host "`nDashboard stopped: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    Write-Host "`nPerformance Dashboard ended at $(Get-Date)" -ForegroundColor Green
}