# M&A Discovery Suite Continuous Monitoring Script
# This script provides real-time monitoring of the application runtime and system performance

param(
    [int]$MonitorIntervalSeconds = 30,
    [string]$LogPath = "C:\discoverydata\ljpops\Logs\",
    [string]$ReportPath = "D:\Scripts\UserMandA\monitoring_report.log"
)

# Initialize monitoring session
$StartTime = Get-Date
$MonitoringSession = [PSCustomObject]@{
    StartTime = $StartTime
    SessionId = (Get-Date).ToString("yyyyMMdd_HHmmss")
    Alerts = @()
    PerformanceBaseline = @{}
}

# Performance thresholds
$Thresholds = @{
    MemoryMB = 1500      # Alert if memory exceeds 1.5GB
    CPUPercent = 85      # Alert if CPU exceeds 85%
    LogErrorCount = 5    # Alert if more than 5 errors in monitoring interval
    ResponseTimeMs = 5000 # Alert if operations take longer than 5 seconds
}

function Write-MonitorLog {
    param($Message, $Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] [$Level] $Message"
    Write-Host $LogEntry
    $LogEntry | Add-Content -Path $ReportPath -Force
}

function Get-ApplicationProcesses {
    # Check for M&A Discovery Suite processes
    $Processes = Get-Process -ErrorAction SilentlyContinue | Where-Object {
        $_.ProcessName -like "*MandADiscovery*" -or 
        $_.ProcessName -like "*Discovery*" -or
        $_.MainWindowTitle -like "*M&A Discovery*" -or
        $_.Path -like "*MandADiscoverySuite*"
    }
    return $Processes
}

function Get-SystemPerformanceMetrics {
    try {
        # Get CPU usage
        $CpuUsage = Get-WmiObject -Class Win32_Processor | Measure-Object -Property LoadPercentage -Average | Select-Object -ExpandProperty Average
        
        # Get memory usage
        $TotalMemory = (Get-WmiObject -Class Win32_ComputerSystem).TotalPhysicalMemory / 1MB
        $AvailableMemory = (Get-WmiObject -Class Win32_OperatingSystem).FreePhysicalMemory / 1KB
        $UsedMemory = $TotalMemory - $AvailableMemory
        
        # Get disk usage for key directories
        $AppDisk = Get-WmiObject -Class Win32_LogicalDisk | Where-Object { $_.DeviceID -eq "C:" }
        $DataDisk = Get-WmiObject -Class Win32_LogicalDisk | Where-Object { $_.DeviceID -eq "D:" }
        
        return [PSCustomObject]@{
            Timestamp = Get-Date
            CPU_Percent = [math]::Round($CpuUsage, 2)
            Memory_Used_MB = [math]::Round($UsedMemory, 2)
            Memory_Available_MB = [math]::Round($AvailableMemory, 2)
            Memory_Total_MB = [math]::Round($TotalMemory, 2)
            Disk_C_Free_GB = [math]::Round($AppDisk.FreeSpace / 1GB, 2)
            Disk_D_Free_GB = [math]::Round($DataDisk.FreeSpace / 1GB, 2)
        }
    }
    catch {
        Write-MonitorLog "ERROR getting system performance metrics: $($_.Exception.Message)" "ERROR"
        return $null
    }
}

function Analyze-ApplicationLogs {
    param($LogDirectory, $SinceTime)
    
    $LogAnalysis = [PSCustomObject]@{
        ErrorCount = 0
        WarningCount = 0
        CriticalIssues = @()
        PerformanceIssues = @()
        NewLogEntries = 0
    }
    
    try {
        # Check structured logs
        $StructuredLogFile = Join-Path $LogDirectory "structured_log_$(Get-Date -Format 'yyyyMMdd').log"
        if (Test-Path $StructuredLogFile) {
            $RecentLogs = Get-Content $StructuredLogFile -Tail 100 | Where-Object { 
                $_ -match '\[ERROR\]|\[CRITICAL\]|\[WARNING\]' 
            }
            
            foreach ($LogLine in $RecentLogs) {
                $LogAnalysis.NewLogEntries++
                
                if ($LogLine -match '\[ERROR\]') {
                    $LogAnalysis.ErrorCount++
                    if ($LogLine -match 'CollectionView.*thread different from the Dispatcher thread|NotSupportedException') {
                        $LogAnalysis.CriticalIssues += "Thread Safety Issue: $LogLine"
                    }
                }
                elseif ($LogLine -match '\[WARNING\]') {
                    $LogAnalysis.WarningCount++
                }
                
                # Check for performance issues
                if ($LogLine -match 'elapsed_ms=(\d+)' -and [int]$Matches[1] -gt $Thresholds.ResponseTimeMs) {
                    $LogAnalysis.PerformanceIssues += "Slow Operation: $LogLine"
                }
            }
        }
        
        # Check application logs
        $AppLogFiles = Get-ChildItem -Path $LogDirectory -Name "MandADiscovery_*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 3
        foreach ($LogFile in $AppLogFiles) {
            $FullPath = Join-Path $LogDirectory $LogFile
            $Content = Get-Content $FullPath -Tail 50 | Where-Object { 
                $_ -match 'ERROR|EXCEPTION|CRITICAL|Failed' 
            }
            $LogAnalysis.ErrorCount += $Content.Count
        }
    }
    catch {
        Write-MonitorLog "ERROR analyzing logs: $($_.Exception.Message)" "ERROR"
    }
    
    return $LogAnalysis
}

function Check-CSVDataIntegrity {
    $DataPath = "C:\discoverydata\ljpops\Raw"
    $Issues = @()
    
    if (Test-Path $DataPath) {
        $CsvFiles = Get-ChildItem -Path $DataPath -Filter "*.csv" -ErrorAction SilentlyContinue
        
        foreach ($CsvFile in $CsvFiles) {
            try {
                $LastWrite = $CsvFile.LastWriteTime
                $Age = (Get-Date) - $LastWrite
                
                if ($Age.TotalHours -gt 24) {
                    $Issues += "CSV file $($CsvFile.Name) is stale (last updated: $LastWrite)"
                }
                
                # Check file size - if 0 bytes or suspiciously small
                if ($CsvFile.Length -lt 100) {
                    $Issues += "CSV file $($CsvFile.Name) appears empty or corrupted (size: $($CsvFile.Length) bytes)"
                }
            }
            catch {
                $Issues += "Cannot access CSV file $($CsvFile.Name): $($_.Exception.Message)"
            }
        }
    }
    else {
        $Issues += "CSV data directory not found: $DataPath"
    }
    
    return $Issues
}

function Generate-AlertReport {
    param($Processes, $Performance, $LogAnalysis, $CSVIssues)
    
    $AlertLevel = "NORMAL"
    $Alerts = @()
    
    # Process monitoring
    if ($Processes.Count -eq 0) {
        $AlertLevel = "CRITICAL"
        $Alerts += "APPLICATION NOT RUNNING - No M&A Discovery Suite processes detected"
    }
    else {
        foreach ($Process in $Processes) {
            $MemoryMB = $Process.WorkingSet / 1MB
            if ($MemoryMB -gt $Thresholds.MemoryMB) {
                $AlertLevel = "WARNING"
                $Alerts += "HIGH MEMORY USAGE - Process $($Process.ProcessName) using $([math]::Round($MemoryMB, 2)) MB"
            }
        }
    }
    
    # System performance monitoring
    if ($Performance) {
        if ($Performance.CPU_Percent -gt $Thresholds.CPUPercent) {
            $AlertLevel = "WARNING"
            $Alerts += "HIGH CPU USAGE - System CPU at $($Performance.CPU_Percent)%"
        }
        
        if ($Performance.Memory_Used_MB -gt ($Performance.Memory_Total_MB * 0.85)) {
            $AlertLevel = "WARNING"
            $Alerts += "HIGH SYSTEM MEMORY - $([math]::Round($Performance.Memory_Used_MB, 2)) MB of $([math]::Round($Performance.Memory_Total_MB, 2)) MB used"
        }
        
        if ($Performance.Disk_C_Free_GB -lt 5) {
            $AlertLevel = "CRITICAL"
            $Alerts += "LOW DISK SPACE - C: drive has only $($Performance.Disk_C_Free_GB) GB free"
        }
    }
    
    # Log analysis alerts
    if ($LogAnalysis.ErrorCount -gt $Thresholds.LogErrorCount) {
        $AlertLevel = "WARNING"
        $Alerts += "HIGH ERROR RATE - $($LogAnalysis.ErrorCount) errors detected in recent logs"
    }
    
    if ($LogAnalysis.CriticalIssues.Count -gt 0) {
        $AlertLevel = "CRITICAL"
        $Alerts += $LogAnalysis.CriticalIssues
    }
    
    # CSV data issues
    if ($CSVIssues.Count -gt 0) {
        if ($AlertLevel -eq "NORMAL") { $AlertLevel = "WARNING" }
        $Alerts += $CSVIssues
    }
    
    return [PSCustomObject]@{
        Timestamp = Get-Date
        AlertLevel = $AlertLevel
        Alerts = $Alerts
        ProcessCount = $Processes.Count
        SystemMetrics = $Performance
        LogMetrics = $LogAnalysis
    }
}

# Main monitoring loop
Write-MonitorLog "=== M&A DISCOVERY SUITE MONITORING STARTED ===" "INFO"
Write-MonitorLog "Session ID: $($MonitoringSession.SessionId)" "INFO"
Write-MonitorLog "Monitor Interval: $MonitorIntervalSeconds seconds" "INFO"
Write-MonitorLog "Log Path: $LogPath" "INFO"

$IterationCount = 0

try {
    while ($true) {
        $IterationCount++
        Write-MonitorLog "--- Monitoring Iteration $IterationCount ---" "INFO"
        
        # Get current system state
        $ApplicationProcesses = Get-ApplicationProcesses
        $SystemPerformance = Get-SystemPerformanceMetrics
        $LogAnalysis = Analyze-ApplicationLogs -LogDirectory $LogPath -SinceTime (Get-Date).AddSeconds(-$MonitorIntervalSeconds)
        $CSVIssues = Check-CSVDataIntegrity
        
        # Generate alert report
        $AlertReport = Generate-AlertReport -Processes $ApplicationProcesses -Performance $SystemPerformance -LogAnalysis $LogAnalysis -CSVIssues $CSVIssues
        
        # Log current status
        if ($ApplicationProcesses.Count -gt 0) {
            Write-MonitorLog "APPLICATION STATUS: RUNNING ($($ApplicationProcesses.Count) processes)" "INFO"
            foreach ($Process in $ApplicationProcesses) {
                $MemoryMB = [math]::Round($Process.WorkingSet / 1MB, 2)
                Write-MonitorLog "  Process: $($Process.ProcessName) (PID: $($Process.Id)) - Memory: $MemoryMB MB" "INFO"
            }
        }
        else {
            Write-MonitorLog "APPLICATION STATUS: NOT RUNNING" "WARNING"
        }
        
        if ($SystemPerformance) {
            Write-MonitorLog "SYSTEM PERFORMANCE: CPU: $($SystemPerformance.CPU_Percent)% | Memory: $($SystemPerformance.Memory_Used_MB)/$($SystemPerformance.Memory_Total_MB) MB | Disk C: $($SystemPerformance.Disk_C_Free_GB) GB free" "INFO"
        }
        
        Write-MonitorLog "LOG ANALYSIS: $($LogAnalysis.ErrorCount) errors, $($LogAnalysis.WarningCount) warnings, $($LogAnalysis.NewLogEntries) new entries" "INFO"
        
        # Handle alerts
        if ($AlertReport.AlertLevel -ne "NORMAL") {
            Write-MonitorLog "ALERT LEVEL: $($AlertReport.AlertLevel)" $AlertReport.AlertLevel
            foreach ($Alert in $AlertReport.Alerts) {
                Write-MonitorLog "ALERT: $Alert" $AlertReport.AlertLevel
            }
        }
        else {
            Write-MonitorLog "SYSTEM STATUS: HEALTHY" "INFO"
        }
        
        # Performance issue alerts
        foreach ($Issue in $LogAnalysis.PerformanceIssues) {
            Write-MonitorLog "PERFORMANCE ISSUE: $Issue" "WARNING"
        }
        
        # Critical issue alerts
        foreach ($Issue in $LogAnalysis.CriticalIssues) {
            Write-MonitorLog "CRITICAL ISSUE: $Issue" "ERROR"
        }
        
        Write-MonitorLog "--- End Iteration $IterationCount ---" "INFO"
        Write-MonitorLog "" "INFO"
        
        # Wait for next iteration
        Start-Sleep -Seconds $MonitorIntervalSeconds
    }
}
catch {
    Write-MonitorLog "MONITORING ERROR: $($_.Exception.Message)" "ERROR"
}
finally {
    $EndTime = Get-Date
    $Duration = $EndTime - $StartTime
    Write-MonitorLog "=== MONITORING SESSION ENDED ===" "INFO"
    Write-MonitorLog "Duration: $($Duration.ToString())" "INFO"
    Write-MonitorLog "Total Iterations: $IterationCount" "INFO"
}