# Real-time Log Analysis Script for M&A Discovery Suite
# Monitors log files for critical issues and patterns

param(
    [string]$LogDirectory = "C:\discoverydata\ljpops\Logs\",
    [string]$AlertLogPath = "D:\Scripts\UserMandA\critical_alerts.log"
)

# Critical error patterns to monitor
$CriticalPatterns = @(
    @{ Pattern = "NotSupportedException"; Description = "Threading violations detected"; Severity = "CRITICAL" },
    @{ Pattern = "OutOfMemoryException"; Description = "Memory exhaustion detected"; Severity = "CRITICAL" },
    @{ Pattern = "thread different from the Dispatcher thread"; Description = "UI thread violation detected"; Severity = "CRITICAL" },
    @{ Pattern = "Failed to load.*view"; Description = "View loading failures"; Severity = "ERROR" },
    @{ Pattern = "Exception.*Migration"; Description = "Migration module failures"; Severity = "ERROR" },
    @{ Pattern = "PowerShell.*Error"; Description = "PowerShell execution errors"; Severity = "ERROR" },
    @{ Pattern = "CSV.*not found|CSV.*corrupted"; Description = "Data integrity issues"; Severity = "WARNING" },
    @{ Pattern = "elapsed_ms=([5-9]\d{3}|\d{5,})"; Description = "Performance degradation detected"; Severity = "WARNING" }
)

function Write-Alert {
    param($Message, $Severity = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
    $AlertEntry = "[$Timestamp] [$Severity] $Message"
    Write-Host $AlertEntry -ForegroundColor $(
        switch ($Severity) {
            "CRITICAL" { "Red" }
            "ERROR" { "Yellow" }
            "WARNING" { "DarkYellow" }
            default { "White" }
        }
    )
    $AlertEntry | Add-Content -Path $AlertLogPath -Force
}

function Analyze-LogEntry {
    param($LogLine, $SourceFile)
    
    foreach ($Pattern in $CriticalPatterns) {
        if ($LogLine -match $Pattern.Pattern) {
            $AlertMessage = "$($Pattern.Description) in $SourceFile"
            
            # Extract additional context
            if ($LogLine -match 'component=([^\s\]]+)') {
                $AlertMessage += " | Component: $($Matches[1])"
            }
            
            if ($LogLine -match 'exception_message=([^|]+)') {
                $AlertMessage += " | Exception: $($Matches[1].Trim())"
            }
            
            if ($LogLine -match 'elapsed_ms=(\d+)') {
                $AlertMessage += " | Duration: $($Matches[1])ms"
            }
            
            Write-Alert $AlertMessage $Pattern.Severity
            
            # For critical issues, provide immediate context
            if ($Pattern.Severity -eq "CRITICAL") {
                Write-Alert "LOG CONTEXT: $LogLine" "CRITICAL"
                Write-Alert "IMMEDIATE ACTION REQUIRED: Review application stability" "CRITICAL"
            }
        }
    }
}

function Monitor-StructuredLogs {
    $StructuredLogFile = Join-Path $LogDirectory "structured_log_$(Get-Date -Format 'yyyyMMdd').log"
    
    if (Test-Path $StructuredLogFile) {
        Write-Alert "Monitoring structured log: $StructuredLogFile" "INFO"
        
        # Get current file size to track new entries
        $LastSize = (Get-Item $StructuredLogFile).Length
        
        while ($true) {
            Start-Sleep -Seconds 5
            
            if (Test-Path $StructuredLogFile) {
                $CurrentSize = (Get-Item $StructuredLogFile).Length
                
                if ($CurrentSize -gt $LastSize) {
                    # New content detected
                    $NewContent = Get-Content $StructuredLogFile -Raw
                    $NewLines = $NewContent.Substring($LastSize) -split "`n" | Where-Object { $_.Trim() -ne "" }
                    
                    foreach ($Line in $NewLines) {
                        Analyze-LogEntry $Line "StructuredLog"
                    }
                    
                    $LastSize = $CurrentSize
                }
            }
        }
    }
    else {
        Write-Alert "Structured log file not found: $StructuredLogFile" "WARNING"
    }
}

function Monitor-ApplicationLogs {
    $LogFiles = Get-ChildItem -Path $LogDirectory -Name "MandADiscovery_*.log" -ErrorAction SilentlyContinue
    
    if ($LogFiles.Count -eq 0) {
        Write-Alert "No application log files found in $LogDirectory" "WARNING"
        return
    }
    
    # Monitor the most recent log file
    $LatestLog = $LogFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    $LogPath = Join-Path $LogDirectory $LatestLog
    
    Write-Alert "Monitoring application log: $LogPath" "INFO"
    
    $LastSize = (Get-Item $LogPath).Length
    
    while ($true) {
        Start-Sleep -Seconds 3
        
        if (Test-Path $LogPath) {
            $CurrentSize = (Get-Item $LogPath).Length
            
            if ($CurrentSize -gt $LastSize) {
                # New content detected
                $NewContent = Get-Content $LogPath -Raw
                $NewLines = $NewContent.Substring($LastSize) -split "`n" | Where-Object { $_.Trim() -ne "" }
                
                foreach ($Line in $NewLines) {
                    Analyze-LogEntry $Line "ApplicationLog"
                }
                
                $LastSize = $CurrentSize
            }
        }
    }
}

# Start real-time monitoring
Write-Alert "=== REAL-TIME LOG ANALYSIS STARTED ===" "INFO"
Write-Alert "Log Directory: $LogDirectory" "INFO"
Write-Alert "Alert Log: $AlertLogPath" "INFO"

try {
    # Start background job for structured logs
    $StructuredLogJob = Start-Job -ScriptBlock ${function:Monitor-StructuredLogs} -ArgumentList $LogDirectory, $AlertLogPath
    
    # Monitor application logs in main thread
    Monitor-ApplicationLogs
}
catch {
    Write-Alert "MONITORING ERROR: $($_.Exception.Message)" "CRITICAL"
}
finally {
    Write-Alert "=== LOG ANALYSIS ENDED ===" "INFO"
    if ($StructuredLogJob) {
        Stop-Job $StructuredLogJob -Force
        Remove-Job $StructuredLogJob
    }
}