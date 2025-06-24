# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-05
# Last Modified: 2025-06-06
# Change Log: Updated version control header

<#
.SYNOPSIS
    Provides enhanced logging capabilities for the M&A Discovery Suite.
.DESCRIPTION
    This module offers functions for initializing the logging system, writing formatted
    log messages to both console and file, with support for log levels,
    timestamps, component names, colors, and emojis. It's designed to work with the
    $global:MandA context for configuration or a passed context object.
    This version incorporates fixes based on the provided fault list, particularly
    FAULT 7 (Write-MandALog before init) and FAULT 16 (Context Parameter),
    and replaces direct emoji characters with text equivalents for compatibility.
.NOTES
    Version: 1.0.2
    Author: M&A Discovery Suite Team (with fixes by Gemini)
    Date: 2025-06-05

    Key Design Points:
    - Addresses FAULT 7: Write-MandALog now checks if logging is initialized and has a basic fallback.
      Initialize-Logging is the primary function to set up the logging system.
    - Addresses FAULT 16: Write-MandALog standardizes on a -Context parameter.
    - Relies on Get-OrElse for safe configuration access.
    - Supports PowerShell 5.1.
    - Ensures UTF-8 encoding for log files.
    - Replaced direct emoji characters in Get-LogEmojiInternal with text equivalents.
#>

# Export functions to be available when the module is imported.
Export-ModuleMember -Function Initialize-Logging, Write-MandALog, Move-LogFile, Clear-OldLogFiles, Start-PerformanceTimer, Stop-PerformanceTimer, New-CorrelationId

# Module-scope context variable
$script:ModuleContext = $null

# Module-scope correlation tracking
$script:CurrentCorrelationId = $null

# Module-scope performance tracking
$script:PerformanceLog = @{}

# Lazy initialization function
function Get-ModuleContext {
    try {
        if ($null -eq $script:ModuleContext) {
            if ($null -ne $global:MandA) {
                # Create a shallow copy to avoid reference issues
                $script:ModuleContext = $global:MandA.Clone()
            } else {
                throw "Module context not available"
            }
        }
        return $script:ModuleContext
    } catch {
        Write-MandALog "Error in function 'Get-ModuleContext': $($_.Exception.Message)" "ERROR"
        throw
    }
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



# --- Script-level Logging Configuration (Defaults) ---
$script:LoggingConfig = @{
    LogFile             = $null
    LogLevel            = "INFO"
    LogRetentionDays    = 30
    MaxLogSizeMB        = 50
    UseEmojis            = $true # Controls if text-based emojis are used
    UseColors           = $true
    ShowTimestamp       = $true
    ShowComponent       = $true
    LogPath             = "C:\MandADiscovery\Logs"
    Initialized         = $false
    DefaultContext      = $null
    InitializedWarningShown = $false # Track if the "not initialized" warning was shown
    StructuredLogging   = $true # Enable structured logging
    EnablePerformanceTracking = $true # Enable performance metrics logging
}

# --- Private Helper Functions ---

function Get-EffectiveLoggingSetting {
    param(
        [string]$SettingName,
        [object]$Context,
        [object]$DefaultValue
    )
    
    # Local Get-OrElse implementation to avoid dependency
    function Get-OrElse {
        param($Value, $Default)
        if ($null -ne $Value) { return $Value }
        else { return $Default }
    }
    
    try {
        # Check context configuration first
        if ($Context -and $Context.PSObject.Properties['Config'] -and `
            $Context.Config.PSObject.Properties['environment'] -and `
            $Context.Config.environment.PSObject.Properties['logging'] -and `
            $Context.Config.environment.logging.PSObject.Properties[$SettingName]) {
            return Get-OrElse $Context.Config.environment.logging.$SettingName $DefaultValue
        }
        
        # Check script configuration
        if ($script:LoggingConfig.ContainsKey($SettingName)) {
            return Get-OrElse $script:LoggingConfig[$SettingName] $DefaultValue
        }
        
        return $DefaultValue
    } catch {
        Write-MandALog "Error in function 'Get-EffectiveLoggingSetting': $($_.Exception.Message)" "ERROR"
        throw
    }
}



function Get-LogColorInternal {
    param([string]$Level, [PSCustomObject]$ForContext)
    
    try {
        $useColors = Get-EffectiveLoggingSetting -SettingName 'UseColors' -Context $ForContext -DefaultValue $true
        if (-not $useColors) { return "Gray" }

        switch ($Level.ToUpper()) {
            "DEBUG"    { return "DarkGray" }
            "INFO"     { return "Cyan" }
            "SUCCESS"  { return "Green" }
            "WARN"     { return "Yellow" }
            "ERROR"    { return "Red" }
            "CRITICAL" { return "DarkRed" }
            "HEADER"   { return "White" }
            "PROGRESS" { return "Magenta" }
            "IMPORTANT"{ return "Yellow" }
            default    { return "White" }
        }
    } catch {
        Write-MandALog "Error in function 'Get-LogColorInternal': $($_.Exception.Message)" "ERROR"
        throw
    }
}


function Get-LogEmojiInternal {
    param([string]$Level, [PSCustomObject]$ForContext)
    
    try {
        $useEmojisSetting = Get-EffectiveLoggingSetting -SettingName 'UseEmojis' -Context $ForContext -DefaultValue $true
        if (-not $useEmojisSetting) { return "" }
        # Return empty string if emojis are off

        # Using text-based equivalents for emojis to ensure compatibility
        switch ($Level.ToUpper()) {
            "DEBUG"    { return "[>>]" }
            "INFO"     { return "[i]" }
            "SUCCESS"  { return "[OK]" }
            "WARN"     { return "[!]" }
            "ERROR"    { return "[X]" }
            "CRITICAL" { return "[!!]" }
            "HEADER"   { return "[==]" }
            "PROGRESS" { return "[..]" }
            "IMPORTANT"{ return "[*]" }
            default    { return "[--]" }
        }
    } catch {
        Write-MandALog "Error in function 'Get-LogEmojiInternal': $($_.Exception.Message)" "ERROR"
        throw
    }
}

function Get-StatusIndicator {
    <#
    .SYNOPSIS
        Returns a status indicator string based on the provided status.
    .DESCRIPTION
        Provides standardized status indicators for different status types.
        This function is useful for consistent status display across the M&A Discovery Suite.
    .PARAMETER Status
        The status to get an indicator for. Valid values: Success, Warning, Error, Info
    .EXAMPLE
        Get-StatusIndicator -Status "Success"
        Returns: [OK]
    .EXAMPLE
        Get-StatusIndicator -Status "Error"
        Returns: [ERROR]
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Status
    )
    
    try {
        switch ($Status) {
            'Success' { return '[OK]' }
            'Warning' { return '[WARNING]' }
            'Error'   { return '[ERROR]' }
            'Info'    { return '[INFO]' }
            default   { return '[--]' }
        }
    } catch {
        Write-MandALog "Error in function 'Get-StatusIndicator': $($_.Exception.Message)" "ERROR"
        throw
    }
}

# --- Public Functions ---

function Initialize-Logging {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )

    Write-Host "[EnhancedLogging.Initialize-Logging] Initializing logging system..." -ForegroundColor DarkCyan
    
    # Simple initialization without complex context processing to avoid corruption
    $script:LoggingConfig.Initialized = $true
    
    # Use context log path if available, otherwise use default
    if ($Context -and $Context.Paths -and $Context.Paths.LogOutput) {
        $script:LoggingConfig.LogPath = $Context.Paths.LogOutput
        Write-Host "[EnhancedLogging.Initialize-Logging] Using context log path: $($script:LoggingConfig.LogPath)" -ForegroundColor Green
    } elseif ([string]::IsNullOrWhiteSpace($script:LoggingConfig.LogPath)) {
        $script:LoggingConfig.LogPath = "C:\MandADiscovery\Logs"
        Write-Host "[EnhancedLogging.Initialize-Logging] Using default log path: $($script:LoggingConfig.LogPath)" -ForegroundColor Yellow
    }
    
    # Create log directory if it doesn't exist
    if (-not (Test-Path $script:LoggingConfig.LogPath -PathType Container)) {
        try {
            New-Item -Path $script:LoggingConfig.LogPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
            Write-Host "[EnhancedLogging.Initialize-Logging] Created log directory: $($script:LoggingConfig.LogPath)" -ForegroundColor Green
        } catch {
            Write-Warning "[EnhancedLogging.Initialize-Logging] Failed to create log directory: $($script:LoggingConfig.LogPath). Error: $($_.Exception.Message). File logging will be disabled."
            $script:LoggingConfig.LogFile = $null
            return
        }
    }
    
    # Set up log file
    $logFileBaseName = "MandA_Discovery"
    $timestampForFile = Get-Date -Format "yyyyMMdd_HHmmss"
    $script:LoggingConfig.LogFile = Join-Path $script:LoggingConfig.LogPath "$($logFileBaseName)_$timestampForFile.log"
    
    Write-Host "[EnhancedLogging.Initialize-Logging] Logging initialized. LogFile: $($script:LoggingConfig.LogFile)" -ForegroundColor Green
}

function Write-MandALog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,

        [Parameter(Mandatory=$false)]
        [ValidateSet("DEBUG", "INFO", "SUCCESS", "WARN", "ERROR", "CRITICAL", "HEADER", "PROGRESS", "IMPORTANT")]
        [string]$Level = "INFO",

        [Parameter(Mandatory=$false)]
        [string]$Component = "Generic",
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context,
        
        [Parameter(Mandatory=$false)]
        [string]$CorrelationId = $script:CurrentCorrelationId,
        
        [Parameter(Mandatory=$false)]
        [hashtable]$StructuredData = @{}
    )

    if (-not $script:LoggingConfig.Initialized) {
        $fallbackTimestamp = if ($script:LoggingConfig.ShowTimestamp -or $true) { "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] " } else { "" }
        $fallbackComponent = if ($script:LoggingConfig.ShowComponent -or $true) { "[$Component] " } else { "" }
        Write-Host "$fallbackTimestamp[$($Level.ToUpper())] $fallbackComponent$Message"
        if (-not $script:LoggingConfig.InitializedWarningShown) {
            Write-Warning "[Write-MandALog] Warning: Logging system not initialized. Using basic Write-Host. Call Initialize-Logging first."
            $script:LoggingConfig.InitializedWarningShown = $true
        }
        return
    }
    
    # Local Get-OrElse implementation
    function Get-OrElse {
        param($Value, $Default)
        if ($null -ne $Value) { return $Value } else { return $Default }
    }
    
    $effectiveContext = Get-OrElse $Context $script:LoggingConfig.DefaultContext
    
    $currentLogLevel = Get-EffectiveLoggingSetting -SettingName 'LogLevel' -Context $effectiveContext -DefaultValue "INFO"
    $showTimestampSetting = Get-EffectiveLoggingSetting -SettingName 'ShowTimestamp' -Context $effectiveContext -DefaultValue $true
    $showComponentSetting = Get-EffectiveLoggingSetting -SettingName 'ShowComponent' -Context $effectiveContext -DefaultValue $true
    
    $levelHierarchy = @{ "DEBUG"=0; "INFO"=1; "PROGRESS"=1; "SUCCESS"=1; "WARN"=2; "IMPORTANT"=2; "ERROR"=3; "CRITICAL"=4; "HEADER"=5 }
    $configLogLevelNum = Get-OrElse $levelHierarchy[$currentLogLevel.ToUpper()] 1
    $messageLogLevelNum = Get-OrElse $levelHierarchy[$Level.ToUpper()] 1

    if ($messageLogLevelNum -lt $configLogLevelNum) { return }

    $consoleMessage = $Message
    $logColor = Get-LogColorInternal -Level $Level -ForContext $effectiveContext 
    
    if (Get-EffectiveLoggingSetting -SettingName 'UseEmojis' -Context $effectiveContext -DefaultValue $true) {
        $emoji = Get-LogEmojiInternal -Level $Level -ForContext $effectiveContext
        $consoleMessage = "$emoji $consoleMessage"
    }

    $prefix = ""
    if ($showTimestampSetting) {
        $prefix += "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] "
    }
    if ($showComponentSetting -and -not [string]::IsNullOrWhiteSpace($Component)) {
        $prefix += "[$Component] "
    }
    $consoleMessage = "$prefix$consoleMessage"
    
    if ($Level.ToUpper() -eq "HEADER") {
        $separatorLength = $consoleMessage.Length + 4
        if ($separatorLength -lt 60) { $separatorLength = 60 }
        $separator = "=" * $separatorLength
        Write-Host "`n$separator" -ForegroundColor (Get-LogColorInternal -Level "DEBUG" -ForContext $effectiveContext)
        Write-Host "  $consoleMessage  " -ForegroundColor $logColor -BackgroundColor (Get-LogColorInternal -Level "DEBUG" -ForContext $effectiveContext)
        Write-Host "$separator`n" -ForegroundColor (Get-LogColorInternal -Level "DEBUG" -ForContext $effectiveContext)
    } elseif ($Level.ToUpper() -eq "CRITICAL") {
        Write-Host $consoleMessage -ForegroundColor $logColor -BackgroundColor White
    } else {
        Write-Host $consoleMessage -ForegroundColor $logColor
    }

    if (-not [string]::IsNullOrWhiteSpace($script:LoggingConfig.LogFile)) {
        try {
            # Add machine-readable format option
            if ($script:LoggingConfig.StructuredLogging) {
                $logEntry = @{
                    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
                    Level = $Level
                    Component = $Component
                    Message = $Message
                    CorrelationId = if ([string]::IsNullOrWhiteSpace($CorrelationId)) { $script:CurrentCorrelationId } else { $CorrelationId }
                    StructuredData = $StructuredData
                    ThreadId = [System.Threading.Thread]::CurrentThread.ManagedThreadId
                } | ConvertTo-Json -Compress
                
                # Write to structured log file
                $structuredLogPath = $script:LoggingConfig.LogFile -replace '\.log$', '.json'
                $logDirForFileCheck = Split-Path $structuredLogPath -Parent
                if (-not (Test-Path $logDirForFileCheck -PathType Container)) {
                    New-Item -Path $logDirForFileCheck -ItemType Directory -Force -ErrorAction SilentlyContinue | Out-Null
                }
                Add-Content -Path $structuredLogPath -Value $logEntry -Encoding UTF8 -ErrorAction Stop
            }
            
            # Continue with existing console/file logging...
            $fileMessage = $Message
            $fileLogEntry = ""
            if ($showTimestampSetting) { $fileLogEntry += "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] " }
            $fileLogEntry += "[$($Level.ToUpper())] "
            if ($showComponentSetting -and -not [string]::IsNullOrWhiteSpace($Component)) { $fileLogEntry += "[$Component] " }
            if (-not [string]::IsNullOrWhiteSpace($CorrelationId)) { $fileLogEntry += "[CID:$CorrelationId] " }
            $fileLogEntry += $fileMessage
            
            # Add structured data if provided
            if ($StructuredData -and $StructuredData.Count -gt 0) {
                try {
                    $dataJson = $StructuredData | ConvertTo-Json -Compress -Depth 3
                    $fileLogEntry += " | Data: $dataJson"
                } catch {
                    $fileLogEntry += " | Data: [Failed to serialize data]"
                }
            }

            $logDirForFileCheck = Split-Path $script:LoggingConfig.LogFile -Parent
            if (-not (Test-Path $logDirForFileCheck -PathType Container)) {
                New-Item -Path $logDirForFileCheck -ItemType Directory -Force -ErrorAction SilentlyContinue | Out-Null
            }
            Add-Content -Path $script:LoggingConfig.LogFile -Value $fileLogEntry -Encoding UTF8 -ErrorAction Stop
            
            $logFileItem = Get-Item -Path $script:LoggingConfig.LogFile -ErrorAction SilentlyContinue
            $maxLogSizeConfig = Get-EffectiveLoggingSetting -SettingName 'MaxLogSizeMB' -Context $effectiveContext -DefaultValue 50
            if ($null -ne $logFileItem -and ($logFileItem.Length / 1MB) -gt $maxLogSizeConfig) {
                Move-LogFile -Context $effectiveContext
            }
        } catch {
            Write-Warning "[EnhancedLogging.Write-MandALog] Failed to write to log file '$($script:LoggingConfig.LogFile)'. Error: $($_.Exception.Message). Console logging will continue."
        }
    }
}

function Move-LogFile {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory=$true)]
        [PSCustomObject]$Context 
    )
    
    if (-not $script:LoggingConfig.Initialized -or [string]::IsNullOrWhiteSpace($script:LoggingConfig.LogFile)) {
        Write-Warning "[EnhancedLogging.Move-LogFile] Logging not initialized or LogFile path not set. Cannot move log."
        return
    }
    
    $currentLogFile = $script:LoggingConfig.LogFile
    if (-not (Test-Path $currentLogFile -PathType Leaf)) {
        Write-Host "[INFO] [Logger] Current log file '$currentLogFile' not found for rotation. Nothing to move."
        return
    }

    try {
        $logDir = Split-Path $currentLogFile -Parent
        $logNameBaseOriginal = [System.IO.Path]::GetFileNameWithoutExtension($currentLogFile)
        $logExtension = [System.IO.Path]::GetExtension($currentLogFile)

        $logNameClean = $logNameBaseOriginal -replace '_\d{8}_\d{6}_ROTATED_\d{17}$',''
        $logNameClean = $logNameClean -replace '_\d{8}_\d{6}$',''

        $rotationTimestamp = Get-Date -Format "yyyyMMddHHmmssfff"
        $rotatedLogFileName = "$($logNameClean)_ROTATED_$rotationTimestamp$logExtension"
        $rotatedLogFilePath = Join-Path $logDir $rotatedLogFileName

        Rename-Item -Path $currentLogFile -NewName $rotatedLogFileName -ErrorAction Stop
        Write-Host "[INFO] [Logger] Log file rotated to: $rotatedLogFileName"
        
        $companyNameForNewLog = "General"
        if ($Context -and $Context.PSObject.Properties['CompanyName']) {
            $companyNameForNewLog = $Context.CompanyName -replace '[<>:"/\\|?*]', '_'
        } elseif ($Context -and $Context.PSObject.Properties['Config'] -and $Context.Config.metadata) {
            $companyNameForNewLog = if ($Context.Config.metadata.companyName) { $Context.Config.metadata.companyName -replace '[<>:"/\\|?*]', '_' } else { "General" }
        }

        $newLogFileBase = "MandA_Discovery"
        $newTimestampForFile = Get-Date -Format "yyyyMMdd_HHmmss"
        $script:LoggingConfig.LogFile = Join-Path $logDir "$($newLogFileBase)_$newTimestampForFile.log"
        Write-Host "[INFO] [Logger] New log file started: $($script:LoggingConfig.LogFile)"
    } catch {
        Write-Warning "[EnhancedLogging.Move-LogFile] Failed to move/rotate log file '$currentLogFile' to '$rotatedLogFileName'. Error: $($_.Exception.Message)"
    }
}

function Clear-OldLogFiles {
    [CmdletBinding(SupportsShouldProcess=$true)]
    param (
        [Parameter(Mandatory=$true)]
        [PSCustomObject]$Context 
    )
    
    if (-not $script:LoggingConfig.Initialized) {
        Write-Warning "[EnhancedLogging.Clear-OldLogFiles] Logging not initialized. Cannot clear old logs."
        return
    }

    $logPathForClear = if ((Get-ModuleContext).Paths.LogOutput) { (Get-ModuleContext).Paths.LogOutput } else { $script:LoggingConfig.LogPath }
    $retentionDays = Get-EffectiveLoggingSetting -SettingName 'LogRetentionDays' -Context $Context -DefaultValue 30

    if ($retentionDays -le 0) {
        Write-MandALog -Message "Log retention days set to $retentionDays. Skipping cleanup of old logs." -Level "INFO" -Component "Logger" -Context $Context
        return
    }
    
    if ([string]::IsNullOrWhiteSpace($logPathForClear) -or -not (Test-Path $logPathForClear -PathType Container)) {
        Write-MandALog -Message "Invalid log path for cleanup: '$logPathForClear'. Skipping cleanup." -Level "WARN" -Component "Logger" -Context $Context
        return
    }

    try {
        Write-MandALog -Message "Checking for log files older than $retentionDays days in '$logPathForClear'..." -Level "DEBUG" -Component "Logger" -Context $Context
        $cutoffDate = (Get-Date).AddDays(-$retentionDays)
        
        $oldLogFiles = Get-ChildItem -Path $logPathForClear -Filter "*.log" -File -ErrorAction Stop | Where-Object { $_.LastWriteTime -lt $cutoffDate }
        
        if ($null -ne $oldLogFiles -and $oldLogFiles.Count -gt 0) {
            Write-MandALog -Message "Found $($oldLogFiles.Count) old log files to remove." -Level "INFO" -Component "Logger" -Context $Context
            foreach ($file in $oldLogFiles) {
                if ($PSCmdlet.ShouldProcess($file.FullName, "Remove old log file (LastWriteTime: $($file.LastWriteTime))")) {
                    try {
                        Remove-Item -Path $file.FullName -Force -ErrorAction Stop
                        Write-MandALog -Message "Removed old log file: $($file.Name)" -Level "DEBUG" -Component "Logger" -Context $Context
                    } catch {
                        Write-MandALog -Message "Failed to remove old log file '$($file.FullName)'. Error: $($_.Exception.Message)" -Level "ERROR" -Component "Logger" -Context $Context
                    }
                }
            }
            Write-MandALog -Message "Old log file cleanup complete." -Level "INFO" -Component "Logger" -Context $Context
        } else {
            Write-MandALog -Message "No log files found older than $retentionDays days." -Level "INFO" -Component "Logger" -Context $Context
        }
    } catch {
        Write-MandALog -Message "Error during old log file cleanup: $($_.Exception.Message)" -Level "ERROR" -Component "Logger" -Context $Context
    }
}

# --- Performance Metrics Functions ---

function New-CorrelationId {
    <#
    .SYNOPSIS
        Generates a new correlation ID for tracking related operations.
    .DESCRIPTION
        Creates a unique correlation ID that can be used to track related log entries
        across multiple operations and components.
    .EXAMPLE
        $correlationId = New-CorrelationId
        Write-MandALog -Message "Starting operation" -CorrelationId $correlationId
    #>
    [CmdletBinding()]
    param()
    
    $correlationId = [System.Guid]::NewGuid().ToString("N").Substring(0, 8)
    $script:CurrentCorrelationId = $correlationId
    return $correlationId
}

function Start-PerformanceTimer {
    <#
    .SYNOPSIS
        Starts a performance timer for the specified operation.
    .DESCRIPTION
        Begins tracking performance metrics for a named operation, including
        start time and memory usage.
    .PARAMETER OperationName
        The name of the operation to track.
    .PARAMETER CorrelationId
        Optional correlation ID to associate with this performance measurement.
    .EXAMPLE
        Start-PerformanceTimer -OperationName "UserDiscovery"
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$OperationName,
        
        [Parameter(Mandatory=$false)]
        [string]$CorrelationId = $script:CurrentCorrelationId
    )
    
    try {
        $performanceEnabled = Get-EffectiveLoggingSetting -SettingName 'EnablePerformanceTracking' -Context $null -DefaultValue $true
        if (-not $performanceEnabled) {
            Write-MandALog -Message "Performance tracking is disabled" -Level "DEBUG" -Component "PerformanceTimer"
            return
        }
        
        $script:PerformanceLog[$OperationName] = @{
            Start = Get-Date
            Memory = [System.GC]::GetTotalMemory($false)
            CorrelationId = $CorrelationId
            ThreadId = [System.Threading.Thread]::CurrentThread.ManagedThreadId
        }
        
        Write-MandALog -Message "Performance timer started for operation: $OperationName" -Level "DEBUG" -Component "PerformanceTimer" -CorrelationId $CorrelationId -StructuredData @{
            OperationName = $OperationName
            StartTime = $script:PerformanceLog[$OperationName].Start
            InitialMemory = $script:PerformanceLog[$OperationName].Memory
        }
    } catch {
        Write-MandALog -Message "Error starting performance timer for '$OperationName': $($_.Exception.Message)" -Level "ERROR" -Component "PerformanceTimer"
    }
}

function Stop-PerformanceTimer {
    <#
    .SYNOPSIS
        Stops a performance timer and logs the results.
    .DESCRIPTION
        Ends performance tracking for a named operation and logs the duration,
        memory usage delta, and other performance metrics.
    .PARAMETER OperationName
        The name of the operation to stop tracking.
    .PARAMETER CorrelationId
        Optional correlation ID to associate with this performance measurement.
    .EXAMPLE
        Stop-PerformanceTimer -OperationName "UserDiscovery"
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$OperationName,
        
        [Parameter(Mandatory=$false)]
        [string]$CorrelationId = $script:CurrentCorrelationId
    )
    
    try {
        $performanceEnabled = Get-EffectiveLoggingSetting -SettingName 'EnablePerformanceTracking' -Context $null -DefaultValue $true
        if (-not $performanceEnabled) {
            Write-MandALog -Message "Performance tracking is disabled" -Level "DEBUG" -Component "PerformanceTimer"
            return
        }
        
        if ($script:PerformanceLog.ContainsKey($OperationName)) {
            $perf = $script:PerformanceLog[$OperationName]
            $perf.End = Get-Date
            $perf.Duration = ($perf.End - $perf.Start).TotalSeconds
            $perf.MemoryDelta = [System.GC]::GetTotalMemory($false) - $perf.Memory
            $perf.EndMemory = [System.GC]::GetTotalMemory($false)
            
            # Use the correlation ID from the timer start if not provided
            $effectiveCorrelationId = if ([string]::IsNullOrWhiteSpace($CorrelationId)) { $perf.CorrelationId } else { $CorrelationId }
            
            Write-MandALog -Message "Performance: $OperationName completed in $([math]::Round($perf.Duration, 3)) seconds" -Level "INFO" -Component "PerformanceTimer" -CorrelationId $effectiveCorrelationId -StructuredData $perf
            
            # Clean up the performance log entry
            $script:PerformanceLog.Remove($OperationName)
        } else {
            Write-MandALog -Message "Performance timer for operation '$OperationName' was not found. Timer may not have been started." -Level "WARN" -Component "PerformanceTimer" -CorrelationId $CorrelationId
        }
    } catch {
        Write-MandALog -Message "Error stopping performance timer for '$OperationName': $($_.Exception.Message)" -Level "ERROR" -Component "PerformanceTimer"
    }
}

Write-Host "[EnhancedLogging.psm1] Module loaded. (v1.1.0 - Enhanced Correlation & Performance Tracking)" -ForegroundColor DarkGray


# Export all public functions
Export-ModuleMember -Function @(
    'Initialize-Logging',
    'Write-MandALog',
    'Move-LogFile',
    'Clear-OldLogFiles',
    'Get-EffectiveLoggingSetting',
    'Get-LogColorInternal',
    'Get-LogEmojiInternal',
    'Get-StatusIndicator',
    'New-CorrelationId',
    'Start-PerformanceTimer',
    'Stop-PerformanceTimer'
)
