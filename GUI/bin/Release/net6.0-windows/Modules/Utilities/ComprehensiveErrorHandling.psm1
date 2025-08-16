# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-02
# Last Modified: 2025-08-02

<#
.SYNOPSIS
    Comprehensive error handling and logging system for M&A Discovery Suite
.DESCRIPTION
    Provides advanced error handling with contextual logging, automatic recovery mechanisms,
    performance monitoring, and structured error reporting for enterprise-grade reliability.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-02
    Requires: PowerShell 5.1+, Windows Management Framework
#>

# Global error handling configuration
$Script:ErrorHandlingConfig = @{
    EnableStructuredLogging = $true
    EnablePerformanceLogging = $true
    EnableAutoRecovery = $true
    MaxRetryAttempts = 3
    RetryDelaySeconds = 5
    LogLevel = 'INFO'
    LogRotationSizeMB = 100
    MaxLogFiles = 10
    EnableEmailAlerts = $false
    EnableEventLogIntegration = $true
}

class ErrorContext {
    [string]$Operation
    [string]$Module
    [string]$Function
    [hashtable]$Parameters
    [datetime]$Timestamp
    [string]$SessionId
    [int]$AttemptNumber
    [string]$UserContext
    [hashtable]$SystemContext
    
    ErrorContext([string]$Operation, [string]$Module, [string]$Function) {
        $this.Operation = $Operation
        $this.Module = $Module
        $this.Function = $Function
        $this.Timestamp = Get-Date
        $this.AttemptNumber = 1
        $this.Parameters = @{}
        $this.SystemContext = $this.GetSystemContext()
    }
    
    [hashtable]GetSystemContext() {
        return @{
            ComputerName = $env:COMPUTERNAME
            UserName = $env:USERNAME
            ProcessId = $PID
            PowerShellVersion = $PSVersionTable.PSVersion.ToString()
            MemoryUsage = [Math]::Round((Get-Process -Id $PID).WorkingSet64 / 1MB, 2)
            ExecutionPolicy = Get-ExecutionPolicy
        }
    }
}

class PerformanceMonitor {
    [System.Diagnostics.Stopwatch]$Stopwatch
    [string]$OperationName
    [hashtable]$Metrics
    [datetime]$StartTime
    
    PerformanceMonitor([string]$OperationName) {
        $this.OperationName = $OperationName
        $this.Stopwatch = [System.Diagnostics.Stopwatch]::new()
        $this.Metrics = @{}
        $this.StartTime = Get-Date
        $this.Stopwatch.Start()
    }
    
    [void]AddMetric([string]$Name, [object]$Value) {
        $this.Metrics[$Name] = $Value
    }
    
    [hashtable]Complete() {
        $this.Stopwatch.Stop()
        
        $result = @{
            OperationName = $this.OperationName
            StartTime = $this.StartTime
            EndTime = Get-Date
            ElapsedMilliseconds = $this.Stopwatch.ElapsedMilliseconds
            ElapsedSeconds = $this.Stopwatch.Elapsed.TotalSeconds
            Metrics = $this.Metrics
        }
        
        Write-PerformanceLog -PerformanceData $result
        return $result
    }
}

function Write-ComprehensiveLog {
    <#
    .SYNOPSIS
        Writes structured log entries with context information and error details.
    
    .DESCRIPTION
        Provides comprehensive logging with support for multiple log levels, contextual information,
        structured output, and integration with Windows Event Log. Includes automatic log rotation
        and performance monitoring capabilities.
    
    .PARAMETER Message
        The log message to write.
    
    .PARAMETER Level
        The log level (DEBUG, INFO, WARN, ERROR, FATAL, SUCCESS, PERFORMANCE). Defaults to INFO.
    
    .PARAMETER Component
        The component or module generating the log entry. Defaults to 'System'.
    
    .PARAMETER Context
        Additional context information as a hashtable.
    
    .PARAMETER ErrorRecord
        PowerShell error record for automatic error detail extraction.
    
    .PARAMETER SessionId
        Session identifier for tracking related operations.
    
    .EXAMPLE
        Write-ComprehensiveLog -Message "Discovery started" -Level "INFO" -Component "ActiveDirectory"
    
    .EXAMPLE
        Write-ComprehensiveLog -Message "Discovery failed" -Level "ERROR" -ErrorRecord $_ -SessionId $sessionId
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL', 'SUCCESS', 'PERFORMANCE')]
        [string]$Level = 'INFO',
        
        [Parameter(Mandatory=$false)]
        [string]$Component = 'System',
        
        [Parameter(Mandatory=$false)]
        [hashtable]$Context = @{},
        
        [Parameter(Mandatory=$false)]
        [System.Management.Automation.ErrorRecord]$ErrorRecord = $null,
        
        [Parameter(Mandatory=$false)]
        [string]$SessionId = $null
    )
    
    # Check if logging is enabled for this level
    if (-not (Test-LogLevel -Level $Level)) {
        return
    }
    
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss.fff'
    $threadId = [System.Threading.Thread]::CurrentThread.ManagedThreadId
    
    # Create structured log entry
    $logEntry = @{
        Timestamp = $timestamp
        Level = $Level
        Component = $Component
        Message = $Message
        ThreadId = $threadId
        ProcessId = $PID
        SessionId = $SessionId
        Context = $Context
        MachineName = $env:COMPUTERNAME
        UserName = $env:USERNAME
    }
    
    # Add error details if provided
    if ($ErrorRecord) {
        $logEntry.Error = @{
            Exception = $ErrorRecord.Exception.Message
            CategoryInfo = $ErrorRecord.CategoryInfo.ToString()
            FullyQualifiedErrorId = $ErrorRecord.FullyQualifiedErrorId
            ScriptStackTrace = $ErrorRecord.ScriptStackTrace
            InvocationInfo = @{
                ScriptName = $ErrorRecord.InvocationInfo.ScriptName
                ScriptLineNumber = $ErrorRecord.InvocationInfo.ScriptLineNumber
                OffsetInLine = $ErrorRecord.InvocationInfo.OffsetInLine
                Line = $ErrorRecord.InvocationInfo.Line
            }
        }
    }
    
    # Format for console output
    $consoleMessage = "[$timestamp] [$Level] [$Component] $Message"
    if ($Context.Count -gt 0) {
        $contextStr = ($Context.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ', '
        $consoleMessage += " | Context: $contextStr"
    }
    
    # Console output with colors
    $color = switch ($Level) {
        'DEBUG' { 'Gray' }
        'INFO' { 'White' }
        'WARN' { 'Yellow' }
        'ERROR' { 'Red' }
        'FATAL' { 'Magenta' }
        'SUCCESS' { 'Green' }
        'PERFORMANCE' { 'Cyan' }
        default { 'White' }
    }
    
    Write-Host $consoleMessage -ForegroundColor $color
    
    # Write to structured log file
    Write-StructuredLogFile -LogEntry $logEntry
    
    # Write to Windows Event Log for ERROR and FATAL levels
    if ($Script:ErrorHandlingConfig.EnableEventLogIntegration -and $Level -in @('ERROR', 'FATAL')) {
        Write-WindowsEventLog -LogEntry $logEntry
    }
    
    # Send email alerts for FATAL errors (if configured)
    if ($Script:ErrorHandlingConfig.EnableEmailAlerts -and $Level -eq 'FATAL') {
        Send-ErrorAlert -LogEntry $logEntry
    }
}

function Write-StructuredLogFile {
    [CmdletBinding()]
    param(
        [hashtable]$LogEntry
    )
    
    try {
        $logDir = Join-Path $env:ProgramData "MandADiscovery\Logs"
        if (-not (Test-Path $logDir)) {
            New-Item -Path $logDir -ItemType Directory -Force | Out-Null
        }
        
        $logFile = Join-Path $logDir "MandADiscovery-$(Get-Date -Format 'yyyy-MM-dd').log"
        
        # Convert to JSON for structured logging
        $jsonEntry = $LogEntry | ConvertTo-Json -Compress -Depth 10
        
        # Thread-safe file writing
        $mutex = New-Object System.Threading.Mutex($false, "MandADiscoveryLogFile")
        try {
            [void]$mutex.WaitOne()
            Add-Content -Path $logFile -Value $jsonEntry -Encoding UTF8
        } finally {
            $mutex.ReleaseMutex()
            $mutex.Dispose()
        }
        
        # Check for log rotation
        if ((Get-Item $logFile).Length / 1MB -gt $Script:ErrorHandlingConfig.LogRotationSizeMB) {
            Invoke-LogRotation -LogFile $logFile
        }
    } catch {
        Write-Warning "Failed to write to log file: $($_.Exception.Message)"
    }
}

function Write-PerformanceLog {
    [CmdletBinding()]
    param(
        [hashtable]$PerformanceData
    )
    
    if (-not $Script:ErrorHandlingConfig.EnablePerformanceLogging) {
        return
    }
    
    $message = "Operation '$($PerformanceData.OperationName)' completed in $($PerformanceData.ElapsedSeconds.ToString('F3'))s"
    $context = @{
        ElapsedMs = $PerformanceData.ElapsedMilliseconds
        StartTime = $PerformanceData.StartTime
        EndTime = $PerformanceData.EndTime
    }
    
    # Add custom metrics to context
    if ($PerformanceData.Metrics.Count -gt 0) {
        $context.Metrics = $PerformanceData.Metrics
    }
    
    Write-ComprehensiveLog -Message $message -Level 'PERFORMANCE' -Component 'PerformanceMonitor' -Context $context
}

function Test-LogLevel {
    [CmdletBinding()]
    param(
        [string]$Level
    )
    
    $levelHierarchy = @{
        'DEBUG' = 0
        'INFO' = 1
        'WARN' = 2
        'ERROR' = 3
        'FATAL' = 4
        'SUCCESS' = 1
        'PERFORMANCE' = 1
    }
    
    $currentLevel = $Script:ErrorHandlingConfig.LogLevel
    $currentLevelValue = $levelHierarchy[$currentLevel]
    $testLevelValue = $levelHierarchy[$Level]
    
    return $testLevelValue -ge $currentLevelValue
}

function Invoke-WithErrorHandling {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,
        
        [Parameter(Mandatory=$false)]
        [ErrorContext]$Context = $null,
        
        [Parameter(Mandatory=$false)]
        [scriptblock]$OnSuccess = $null,
        
        [Parameter(Mandatory=$false)]
        [scriptblock]$OnError = $null,
        
        [Parameter(Mandatory=$false)]
        [scriptblock]$OnRetry = $null,
        
        [Parameter(Mandatory=$false)]
        [int]$MaxRetries = $Script:ErrorHandlingConfig.MaxRetryAttempts,
        
        [Parameter(Mandatory=$false)]
        [int]$RetryDelay = $Script:ErrorHandlingConfig.RetryDelaySeconds
    )
    
    if (-not $Context) {
        $Context = [ErrorContext]::new('UnknownOperation', 'UnknownModule', 'UnknownFunction')
    }
    
    $monitor = [PerformanceMonitor]::new($Context.Operation)
    
    for ($attempt = 1; $attempt -le ($MaxRetries + 1); $attempt++) {
        $Context.AttemptNumber = $attempt
        
        try {
            Write-ComprehensiveLog -Message "Starting operation: $($Context.Operation) (Attempt $attempt)" -Level 'DEBUG' -Component $Context.Module -SessionId $Context.SessionId
            
            $result = & $ScriptBlock
            
            # Success
            Write-ComprehensiveLog -Message "Operation completed successfully: $($Context.Operation)" -Level 'SUCCESS' -Component $Context.Module -SessionId $Context.SessionId
            
            if ($OnSuccess) {
                & $OnSuccess $result
            }
            
            $monitor.AddMetric('Attempts', $attempt)
            $monitor.AddMetric('Success', $true)
            $monitor.Complete()
            
            return $result
            
        } catch {
            $errorRecord = $_
            $errorMessage = "Operation failed: $($Context.Operation) - $($errorRecord.Exception.Message)"
            
            Write-ComprehensiveLog -Message $errorMessage -Level 'ERROR' -Component $Context.Module -Context @{
                Attempt = $attempt
                MaxRetries = $MaxRetries
                Operation = $Context.Operation
            } -ErrorRecord $errorRecord -SessionId $Context.SessionId
            
            # Check if we should retry
            if ($attempt -le $MaxRetries -and $Script:ErrorHandlingConfig.EnableAutoRecovery) {
                Write-ComprehensiveLog -Message "Retrying operation in $RetryDelay seconds: $($Context.Operation)" -Level 'WARN' -Component $Context.Module -SessionId $Context.SessionId
                
                if ($OnRetry) {
                    & $OnRetry $errorRecord $attempt
                }
                
                Start-Sleep -Seconds $RetryDelay
                continue
            }
            
            # Final failure
            Write-ComprehensiveLog -Message "Operation failed permanently after $attempt attempts: $($Context.Operation)" -Level 'FATAL' -Component $Context.Module -ErrorRecord $errorRecord -SessionId $Context.SessionId
            
            if ($OnError) {
                & $OnError $errorRecord
            }
            
            $monitor.AddMetric('Attempts', $attempt)
            $monitor.AddMetric('Success', $false)
            $monitor.AddMetric('FinalError', $errorRecord.Exception.Message)
            $monitor.Complete()
            
            throw
        }
    }
}

function New-ErrorContext {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Operation,
        
        [Parameter(Mandatory=$true)]
        [string]$Module,
        
        [Parameter(Mandatory=$true)]
        [string]$Function,
        
        [Parameter(Mandatory=$false)]
        [hashtable]$Parameters = @{},
        
        [Parameter(Mandatory=$false)]
        [string]$SessionId = $null,
        
        [Parameter(Mandatory=$false)]
        [string]$UserContext = $null
    )
    
    $context = [ErrorContext]::new($Operation, $Module, $Function)
    $context.Parameters = $Parameters
    $context.SessionId = $SessionId
    $context.UserContext = $UserContext
    
    return $context
}

function Start-PerformanceMonitoring {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$OperationName
    )
    
    return [PerformanceMonitor]::new($OperationName)
}

function Write-WindowsEventLog {
    [CmdletBinding()]
    param(
        [hashtable]$LogEntry
    )
    
    try {
        $source = "MandADiscovery"
        $logName = "Application"
        
        # Create event source if it doesn't exist
        if (-not [System.Diagnostics.EventLog]::SourceExists($source)) {
            [System.Diagnostics.EventLog]::CreateEventSource($source, $logName)
        }
        
        $eventType = switch ($LogEntry.Level) {
            'ERROR' { 'Error' }
            'FATAL' { 'Error' }
            'WARN' { 'Warning' }
            default { 'Information' }
        }
        
        $eventMessage = "$($LogEntry.Message)`n`nComponent: $($LogEntry.Component)`nTimestamp: $($LogEntry.Timestamp)"
        if ($LogEntry.Error) {
            $eventMessage += "`n`nError Details: $($LogEntry.Error.Exception)"
        }
        
        Write-EventLog -LogName $logName -Source $source -EntryType $eventType -EventId 1001 -Message $eventMessage
    } catch {
        Write-Warning "Failed to write to Windows Event Log: $($_.Exception.Message)"
    }
}

function Send-ErrorAlert {
    [CmdletBinding()]
    param(
        [hashtable]$LogEntry
    )
    
    # Placeholder for email alert functionality
    # In a real implementation, this would send email notifications for critical errors
    Write-ComprehensiveLog -Message "FATAL error alert would be sent: $($LogEntry.Message)" -Level 'INFO' -Component 'AlertSystem'
}

function Invoke-LogRotation {
    [CmdletBinding()]
    param(
        [string]$LogFile
    )
    
    try {
        $logDir = Split-Path $LogFile -Parent
        $logName = [System.IO.Path]::GetFileNameWithoutExtension($LogFile)
        $logExt = [System.IO.Path]::GetExtension($LogFile)
        
        # Find existing rotated logs
        $existingLogs = Get-ChildItem -Path $logDir -Filter "$logName.*$logExt" | Sort-Object LastWriteTime -Descending
        
        # Remove oldest logs if we exceed the limit
        if ($existingLogs.Count -ge $Script:ErrorHandlingConfig.MaxLogFiles) {
            $logsToRemove = $existingLogs | Select-Object -Skip ($Script:ErrorHandlingConfig.MaxLogFiles - 1)
            foreach ($log in $logsToRemove) {
                Remove-Item $log.FullName -Force
            }
        }
        
        # Rotate current log
        $rotatedName = "$logName.$(Get-Date -Format 'yyyyMMdd-HHmmss')$logExt"
        $rotatedPath = Join-Path $logDir $rotatedName
        Move-Item $LogFile $rotatedPath -Force
        
        Write-ComprehensiveLog -Message "Log rotated: $rotatedName" -Level 'INFO' -Component 'LogRotation'
    } catch {
        Write-Warning "Failed to rotate log file: $($_.Exception.Message)"
    }
}

function Set-ErrorHandlingConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [bool]$EnableStructuredLogging,
        
        [Parameter(Mandatory=$false)]
        [bool]$EnablePerformanceLogging,
        
        [Parameter(Mandatory=$false)]
        [bool]$EnableAutoRecovery,
        
        [Parameter(Mandatory=$false)]
        [int]$MaxRetryAttempts,
        
        [Parameter(Mandatory=$false)]
        [int]$RetryDelaySeconds,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL')]
        [string]$LogLevel,
        
        [Parameter(Mandatory=$false)]
        [int]$LogRotationSizeMB,
        
        [Parameter(Mandatory=$false)]
        [int]$MaxLogFiles,
        
        [Parameter(Mandatory=$false)]
        [bool]$EnableEmailAlerts,
        
        [Parameter(Mandatory=$false)]
        [bool]$EnableEventLogIntegration
    )
    
    if ($PSBoundParameters.ContainsKey('EnableStructuredLogging')) {
        $Script:ErrorHandlingConfig.EnableStructuredLogging = $EnableStructuredLogging
    }
    if ($PSBoundParameters.ContainsKey('EnablePerformanceLogging')) {
        $Script:ErrorHandlingConfig.EnablePerformanceLogging = $EnablePerformanceLogging
    }
    if ($PSBoundParameters.ContainsKey('EnableAutoRecovery')) {
        $Script:ErrorHandlingConfig.EnableAutoRecovery = $EnableAutoRecovery
    }
    if ($PSBoundParameters.ContainsKey('MaxRetryAttempts')) {
        $Script:ErrorHandlingConfig.MaxRetryAttempts = $MaxRetryAttempts
    }
    if ($PSBoundParameters.ContainsKey('RetryDelaySeconds')) {
        $Script:ErrorHandlingConfig.RetryDelaySeconds = $RetryDelaySeconds
    }
    if ($PSBoundParameters.ContainsKey('LogLevel')) {
        $Script:ErrorHandlingConfig.LogLevel = $LogLevel
    }
    if ($PSBoundParameters.ContainsKey('LogRotationSizeMB')) {
        $Script:ErrorHandlingConfig.LogRotationSizeMB = $LogRotationSizeMB
    }
    if ($PSBoundParameters.ContainsKey('MaxLogFiles')) {
        $Script:ErrorHandlingConfig.MaxLogFiles = $MaxLogFiles
    }
    if ($PSBoundParameters.ContainsKey('EnableEmailAlerts')) {
        $Script:ErrorHandlingConfig.EnableEmailAlerts = $EnableEmailAlerts
    }
    if ($PSBoundParameters.ContainsKey('EnableEventLogIntegration')) {
        $Script:ErrorHandlingConfig.EnableEventLogIntegration = $EnableEventLogIntegration
    }
    
    Write-ComprehensiveLog -Message "Error handling configuration updated" -Level 'INFO' -Component 'Configuration'
}

function Get-ErrorHandlingConfiguration {
    [CmdletBinding()]
    param()
    
    return $Script:ErrorHandlingConfig.Clone()
}

# Export functions
Export-ModuleMember -Function @(
    'Write-ComprehensiveLog',
    'Invoke-WithErrorHandling',
    'New-ErrorContext',
    'Start-PerformanceMonitoring',
    'Set-ErrorHandlingConfiguration',
    'Get-ErrorHandlingConfiguration'
) -Variable @()