#Requires -Version 5.1
<#
.SYNOPSIS
    Provides enhanced logging capabilities for the M&A Discovery Suite.
.DESCRIPTION
    This module offers functions for initializing the logging system, writing formatted
    log messages to both console and file, with support for log levels,
    timestamps, component names, colors, and emojis. It's designed to work with the
    $global:MandA context for configuration.
.NOTES
    Version: 1.0.0
    Author: M&A Discovery Suite Team
    Date: 2025-06-05

    Key Design Points:
    - Relies on $global:MandA for default configuration if -Context is not passed to Write-MandALog.
    - Uses global:Get-OrElse for safe configuration access.
    - Supports PowerShell 5.1.
    - Addresses FAULT 16 by standardizing on a -Context parameter for Write-MandALog.
#>

# Export functions to be available when the module is imported.
Export-ModuleMember -Function Initialize-Logging, Write-MandALog, Write-SectionHeader, Write-StatusTable, Write-ProgressBar, Write-CompletionSummary

# --- Script-level Logging Configuration (Defaults) ---
# This $script:LoggingConfig will be populated by Initialize-Logging
$script:LoggingConfig = @{
    LogFile             = $null
    LogLevel            = "INFO" # Default log level
    LogRetentionDays    = 30
    MaxLogSizeMB        = 50
    UseEmojis           = $true
    UseColors           = $true
    ShowTimestamp       = $true
    ShowComponent       = $true
    LogPath             = "C:\MandADiscovery\Logs" # Fallback if not in config
    Initialized         = $false
    LogFileHandle       = $null # For potential optimization, not used in this version
    DefaultContext      = $null # To store $global:MandA for internal use
}

# --- Private Helper Functions ---

function Get-LogColor {
    param([string]$Level)
    # Get-OrElse should be globally defined by Set-SuiteEnvironment.ps1
    $useColors = $script:LoggingConfig.UseColors | global:Get-OrElse $true
    if (-not $useColors) { return "Gray" } # Default to Gray if colors are off

    switch ($Level.ToUpper()) {
        "DEBUG"    { return "DarkGray" }
        "INFO"     { return "Cyan" }
        "SUCCESS"  { return "Green" }
        "WARN"     { return "Yellow" }
        "ERROR"    { return "Red" }
        "CRITICAL" { return "DarkRed" } # Differentiate critical
        "HEADER"   { return "White" } # Background will be set by Write-Host
        "PROGRESS" { return "Magenta" }
        "IMPORTANT"{ return "Yellow" } # Often highlighted
        default    { return "White" }
    }
}

function Get-LogEmoji {
    param([string]$Level)
    # Get-OrElse should be globally defined by Set-SuiteEnvironment.ps1
    $useEmojis = $script:LoggingConfig.UseEmojis | global:Get-OrElse $true
    if (-not $useEmojis) { return "" }

    switch ($Level.ToUpper()) {
        "DEBUG"    { return "⚙️" }
        "INFO"     { return "ℹ️" }
        "SUCCESS"  { return "✅" }
        "WARN"     { return "⚠️" }
        "ERROR"   { return "❌" }
        "CRITICAL" { return "🚨" }
        "HEADER"   { return "📋" }
        "PROGRESS" { return "🔄" }
        "IMPORTANT"{ return "📌" }
        default    { return "➡️" }
    }
}

# --- Public Functions ---

function Initialize-Logging {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [hashtable]$Configuration # Expects the full $global:MandA.Config or similar structure
    )

    Write-Host "[EnhancedLogging] Initializing logging system..." -ForegroundColor DarkCyan
    $script:LoggingConfig.DefaultContext = $global:MandA # Store for later if -Context isn't passed to Write-MandALog

    # Use provided configuration or fallback to $global:MandA.Config or defaults
    $effectiveConfig = $null
    if ($null -ne $Configuration) {
        $effectiveConfig = $Configuration
    } elseif ($null -ne $global:MandA -and ($global:MandA -is [hashtable]) -and $global:MandA.ContainsKey('Config')) {
        $effectiveConfig = $global:MandA.Config
    }

    if ($null -ne $effectiveConfig) {
        $script:LoggingConfig.LogLevel = $effectiveConfig.environment.logLevel | global:Get-OrElse "INFO"
        
        # Logging sub-section
        $loggingSettings = $effectiveConfig.environment.logging | global:Get-OrElse @{}
        $script:LoggingConfig.UseEmojis = $loggingSettings.useEmojis | global:Get-OrElse $true
        $script:LoggingConfig.UseColors = $loggingSettings.useColors | global:Get-OrElse $true
        $script:LoggingConfig.ShowTimestamp = $loggingSettings.showTimestamp | global:Get-OrElse $true
        $script:LoggingConfig.ShowComponent = $loggingSettings.showComponent | global:Get-OrElse $true
        $script:LoggingConfig.MaxLogSizeMB = $loggingSettings.maxLogSizeMB | global:Get-OrElse 50
        $script:LoggingConfig.LogRetentionDays = $loggingSettings.logRetentionDays | global:Get-OrElse 30
        
        # Determine LogPath:
        # 1. From $global:MandA.Paths.LogOutput (most reliable if Set-SuiteEnvironment ran)
        # 2. From $effectiveConfig.environment.logPath (if explicitly set there)
        # 3. Fallback to script default C:\MandADiscovery\Logs
        if ($null -ne $global:MandA -and ($global:MandA -is [hashtable]) -and $global:MandA.ContainsKey('Paths') -and ($global:MandA.Paths -is [hashtable]) -and $global:MandA.Paths.ContainsKey('LogOutput') -and -not [string]::IsNullOrWhiteSpace($global:MandA.Paths.LogOutput)) {
            $script:LoggingConfig.LogPath = $global:MandA.Paths.LogOutput
        } elseif ($loggingSettings.ContainsKey('logPath') -and -not [string]::IsNullOrWhiteSpace($loggingSettings.logPath)) {
            $script:LoggingConfig.LogPath = $loggingSettings.logPath
             # If relative, resolve against suite root
            if (-not ([System.IO.Path]::IsPathRooted($script:LoggingConfig.LogPath)) -and $global:MandA -and $global:MandA.Paths.SuiteRoot) {
                $script:LoggingConfig.LogPath = Join-Path $global:MandA.Paths.SuiteRoot $script:LoggingConfig.LogPath | Resolve-Path -ErrorAction SilentlyContinue
            }
        } elseif ($effectiveConfig.environment.HashtableContains('outputPath') -and -not [string]::IsNullOrWhiteSpace($effectiveConfig.environment.outputPath)) {
            # Fallback to outputPath + \Logs if logPath is not explicitly set
            $script:LoggingConfig.LogPath = Join-Path $effectiveConfig.environment.outputPath "Logs"
        } else {
            # Absolute last fallback if no paths are available from config or global context
             Write-Warning "[EnhancedLogging] LogPath not found in configuration or global context. Using default: $($script:LoggingConfig.LogPath)"
        }
    } else {
        Write-Warning "[EnhancedLogging] No configuration provided to Initialize-Logging and $global:MandA.Config not found. Using script defaults."
    }

    # Ensure Log Path exists
    if (-not (Test-Path $script:LoggingConfig.LogPath -PathType Container)) {
        try {
            New-Item -Path $script:LoggingConfig.LogPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
            Write-Host "[EnhancedLogging] Created log directory: $($script:LoggingConfig.LogPath)" -ForegroundColor Green
        } catch {
            Write-Error "[EnhancedLogging] CRITICAL: Failed to create log directory: $($script:LoggingConfig.LogPath). Error: $($_.Exception.Message). Logging to file will fail."
            # Proceed with console logging but file logging will be disabled essentially
            $script:LoggingConfig.LogFile = $null # Indicate file logging is not possible
            $script:LoggingConfig.Initialized = $true # Mark as initialized for console logging
            return
        }
    }
    
    # Create Log File Name (Company specific if CompanyName is available)
    $logFileBaseName = "MandA_Discovery"
    $currentCompanyNameForLog = "General"

    if ($null -ne $Configuration -and $Configuration.ContainsKey('metadata') -and $Configuration.metadata.ContainsKey('companyName')) {
        $currentCompanyNameForLog = $Configuration.metadata.companyName -replace '[<>:"/\\|?*]', '_'
    } elseif ($null -ne $global:MandA -and $global:MandA.ContainsKey('CompanyName') -and -not [string]::IsNullOrWhiteSpace($global:MandA.CompanyName)) {
        $currentCompanyNameForLog = $global:MandA.CompanyName -replace '[<>:"/\\|?*]', '_'
    }
    
    $logFileBaseName = "${logFileBaseName}_${currentCompanyNameForLog}"
    $timestampForFile = Get-Date -Format "yyyyMMdd_HHmmss"
    $script:LoggingConfig.LogFile = Join-Path $script:LoggingConfig.LogPath "$($logFileBaseName)_$timestampForFile.log"

    $script:LoggingConfig.Initialized = $true
    Write-MandALog -Message "Logging system initialized. LogLevel: $($script:LoggingConfig.LogLevel). LogFile: $($script:LoggingConfig.LogFile)" -Level "INFO" -Component "Logger" -Context ([PSCustomObject]@{Config=$effectiveConfig}) # Pass a minimal context for this initial log.
    
    # Perform log rotation/cleanup if configured
    Clear-OldLogFiles -Context ([PSCustomObject]@{Config=$effectiveConfig; Paths=@{LogOutput=$script:LoggingConfig.LogPath}}) # Pass necessary context parts
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
        
        # FAULT 16 FIX: Standardize on -Context for passing configuration and path details.
        # This context should ideally mirror $global:MandA or relevant parts of it.
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context 
    )

    # Use logging settings from passed Context if available, otherwise from $script:LoggingConfig (initialized)
    # or fallback to $script:LoggingConfig.DefaultContext ($global:MandA at init time)
    $currentLoggingConfig = $script:LoggingConfig
    $effectiveRunContext = $Context # The context of the current operation
    
    if ($null -eq $effectiveRunContext -and $null -ne $script:LoggingConfig.DefaultContext) {
        $effectiveRunContext = $script:LoggingConfig.DefaultContext # Fallback to context at init time
    }

    # Override script defaults with context-specific config if present
    if ($null -ne $effectiveRunContext -and ($effectiveRunContext.PSObject.Properties['Config'] | Get-OrElse $false)) {
        $runConfig = $effectiveRunContext.Config
        if ($runConfig.environment -and $runConfig.environment.logging) {
            $currentLoggingConfig = [PSCustomObject]@{ # Create a temporary merged config for this log call
                LogFile             = $script:LoggingConfig.LogFile # File path is session-global
                LogLevel            = $runConfig.environment.logLevel | global:Get-OrElse $script:LoggingConfig.LogLevel
                LogRetentionDays    = $runConfig.environment.logging.logRetentionDays | global:Get-OrElse $script:LoggingConfig.LogRetentionDays
                MaxLogSizeMB        = $runConfig.environment.logging.maxLogSizeMB | global:Get-OrElse $script:LoggingConfig.MaxLogSizeMB
                UseEmojis           = $runConfig.environment.logging.useEmojis | global:Get-OrElse $script:LoggingConfig.UseEmojis
                UseColors           = $runConfig.environment.logging.useColors | global:Get-OrElse $script:LoggingConfig.UseColors
                ShowTimestamp       = $runConfig.environment.logging.showTimestamp | global:Get-OrElse $script:LoggingConfig.ShowTimestamp
                ShowComponent       = $runConfig.environment.logging.showComponent | global:Get-OrElse $script:LoggingConfig.ShowComponent
                Initialized         = $script:LoggingConfig.Initialized
            }
        }
    } elseif (-not $script:LoggingConfig.Initialized) {
        # If logging is not initialized and no context, use very basic Write-Host
        Write-Host "[$Level] [$Component] $Message" # Fallback if logging not initialized
        return
    }
    
    # Log Level Check
    $levelHierarchy = @{ "DEBUG"=0; "INFO"=1; "PROGRESS"=1; "SUCCESS"=1; "WARN"=2; "IMPORTANT"=2; "ERROR"=3; "CRITICAL"=4; "HEADER"=5 }
    $configLogLevelNum = $levelHierarchy[$currentLoggingConfig.LogLevel.ToUpper()] | global:Get-OrElse 1 # Default to INFO if not set
    $messageLogLevelNum = $levelHierarchy[$Level.ToUpper()] | global:Get-OrElse 1

    if ($messageLogLevelNum -lt $configLogLevelNum) { return } # Skip if message level is below configured log level

    # Prepare Console Output
    $consoleMessage = $Message
    $logColor = Get-LogColor -Level $Level
    
    if ($currentLoggingConfig.UseEmojis) {
        $emoji = Get-LogEmoji -Level $Level
        $consoleMessage = "$emoji $consoleMessage"
    }

    if ($currentLoggingConfig.ShowTimestamp) {
        $timestampStr = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $consoleMessage = "[$timestampStr] $consoleMessage"
    }
    if ($currentLoggingConfig.ShowComponent -and -not [string]::IsNullOrWhiteSpace($Component)) {
        $consoleMessage = "[$Component] $consoleMessage"
    }
    
    # Write to Console
    if ($Level.ToUpper() -eq "HEADER") {
        $separator = "=" * ($consoleMessage.Length + 4)
        Write-Host $separator -ForegroundColor $logColor
        Write-Host "  $consoleMessage  " -ForegroundColor White -BackgroundColor $logColor
        Write-Host $separator -ForegroundColor $logColor
    } elseif ($Level.ToUpper() -eq "CRITICAL") {
        Write-Host $consoleMessage -ForegroundColor $logColor -BackgroundColor White
    }
    else {
        Write-Host $consoleMessage -ForegroundColor $logColor
    }

    # Prepare File Output (if LogFile is set)
    if (-not [string]::IsNullOrWhiteSpace($currentLoggingConfig.LogFile)) {
        # Sanitize message for file (remove emojis if they cause issues, though UTF-8 should handle them)
        # For PS 5.1, extensive emoji removal might be complex. Basic approach:
        $fileMessage = $Message #-replace '[\u1F600-\u1F64F]' # Example: remove emoticons block
        
        $fileLogEntry = ""
        if ($currentLoggingConfig.ShowTimestamp) { $fileLogEntry += "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] " }
        $fileLogEntry += "[$($Level.ToUpper())] "
        if ($currentLoggingConfig.ShowComponent -and -not [string]::IsNullOrWhiteSpace($Component)) { $fileLogEntry += "[$Component] " }
        $fileLogEntry += $fileMessage

        try {
            # Ensure log file directory still exists (could be deleted mid-run)
            $logDirForFile = Split-Path $currentLoggingConfig.LogFile -Parent
            if (-not (Test-Path $logDirForFile -PathType Container)) {
                New-Item -Path $logDirForFile -ItemType Directory -Force -ErrorAction SilentlyContinue | Out-Null
            }

            Add-Content -Path $currentLoggingConfig.LogFile -Value $fileLogEntry -Encoding UTF8 -ErrorAction Stop
            
            # Check log size and rotate if necessary (simple rotation based on size)
            $logFileItem = Get-Item -Path $currentLoggingConfig.LogFile -ErrorAction SilentlyContinue
            if ($null -ne $logFileItem -and ($logFileItem.Length / 1MB) -gt $currentLoggingConfig.MaxLogSizeMB) {
                Move-LogFile -Context $effectiveRunContext # Pass context which has config
            }
        } catch {
            Write-Warning "[EnhancedLogging] Failed to write to log file '$($currentLoggingConfig.LogFile)'. Error: $($_.Exception.Message)"
            # Disable file logging for this session if it fails persistently? Or just warn.
        }
    }
}

function Move-LogFile {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory=$true)]
        [PSCustomObject]$Context # Expects Context with Config and Paths
    )
    # Renames the current log file by appending a timestamp, allowing a new log file to be started.
    if (-not $script:LoggingConfig.Initialized -or [string]::IsNullOrWhiteSpace($script:LoggingConfig.LogFile)) {
        Write-Warning "[EnhancedLogging.Move-LogFile] Logging not initialized or LogFile path is not set. Cannot move log."
        return
    }
    
    $currentLogFile = $script:LoggingConfig.LogFile
    if (-not (Test-Path $currentLogFile -PathType Leaf)) {
        Write-MandALog -Message "Current log file '$currentLogFile' not found. Cannot move." -Level "WARN" -Component "Logger" -Context $Context
        return
    }

    $logDir = Split-Path $currentLogFile -Parent
    $logNameBase = [System.IO.Path]::GetFileNameWithoutExtension($currentLogFile)
    $logExtension = [System.IO.Path]::GetExtension($currentLogFile) # Should be .log

    # Remove existing date-time stamp if present from base name (e.g., from initial creation)
    $logNameClean = $logNameBase -replace '_\d{8}_\d{6}$','' 

    $rotationTimestamp = Get-Date -Format "yyyyMMddHHmmssfff" # Add milliseconds for uniqueness
    $rotatedLogFileName = "$($logNameClean)_ROTATED_$rotationTimestamp$logExtension"
    $rotatedLogFilePath = Join-Path $logDir $rotatedLogFileName

    try {
        Rename-Item -Path $currentLogFile -NewName $rotatedLogFileName -ErrorAction Stop
        Write-MandALog -Message "Log file rotated to: $rotatedLogFileName" -Level "INFO" -Component "Logger" -Context $Context
        
        # After renaming, the next Write-MandALog will create a new file with the original name format
        # (because Add-Content will create it if it doesn't exist).
        # We need to re-establish the $script:LoggingConfig.LogFile with a *new* timestamped name
        # to avoid appending to the just-rotated file if it happened to be created by another process.
        $newLogBaseName = "MandA_Discovery"
        $companyNameForNewLog = $Context.CompanyName | global:Get-OrElse "General"
        $newLogBaseName = "${newLogBaseName}_${companyNameForNewLog}"
        $newTimestampForFile = Get-Date -Format "yyyyMMdd_HHmmss"
        $script:LoggingConfig.LogFile = Join-Path $logDir "$($newLogBaseName)_$newTimestampForFile.log"
        Write-MandALog -Message "New log file started: $($script:LoggingConfig.LogFile)" -Level "INFO" -Component "Logger" -Context $Context

    } catch {
        Write-MandALog -Message "Failed to move/rotate log file '$currentLogFile'. Error: $($_.Exception.Message)" -Level "ERROR" -Component "Logger" -Context $Context
    }
}

function Clear-OldLogFiles {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory=$true)]
        [PSCustomObject]$Context # Expects Context with Config and Paths (LogOutput)
    )
    # Deletes log files older than the configured retention period.
    if (-not $script:LoggingConfig.Initialized) {
        Write-Warning "[EnhancedLogging.Clear-OldLogFiles] Logging not initialized. Cannot clear old logs."
        return
    }

    $logPathForClear = $Context.Paths.LogOutput | global:Get-OrElse $script:LoggingConfig.LogPath
    $retentionDays = $Context.Config.environment.logging.logRetentionDays | global:Get-OrElse $script:LoggingConfig.LogRetentionDays

    if ($retentionDays -le 0) {
        Write-MandALog -Message "Log retention days set to $retentionDays. Skipping cleanup of old logs." -Level "INFO" -Component "Logger" -Context $Context
        return
    }
    if ([string]::IsNullOrWhiteSpace($logPathForClear) -or -not (Test-Path $logPathForClear -PathType Container)) {
        Write-MandALog -Message "Invalid log path for cleanup: '$logPathForClear'. Skipping cleanup." -Level "WARN" -Component "Logger" -Context $Context
        return
    }

    Write-MandALog -Message "Checking for log files older than $retentionDays days in '$logPathForClear'..." -Level "DEBUG" -Component "Logger" -Context $Context
    $cutoffDate = (Get-Date).AddDays(-$retentionDays)
    
    try {
        $oldLogFiles = Get-ChildItem -Path $logPathForClear -Filter "*.log" -File -ErrorAction Stop | Where-Object { $_.LastWriteTime -lt $cutoffDate }
        if ($oldLogFiles.Count -gt 0) {
            Write-MandALog -Message "Found $($oldLogFiles.Count) old log files to remove." -Level "INFO" -Component "Logger" -Context $Context
            foreach ($file in $oldLogFiles) {
                try {
                    Remove-Item -Path $file.FullName -Force -ErrorAction Stop
                    Write-MandALog -Message "Removed old log file: $($file.Name)" -Level "DEBUG" -Component "Logger" -Context $Context
                } catch {
                    Write-MandALog -Message "Failed to remove old log file '$($file.FullName)'. Error: $($_.Exception.Message)" -Level "ERROR" -Component "Logger" -Context $Context
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

function Write-SectionHeader {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Title,
        [string]$Subtitle = "",
        [string]$Icon = "📋", # Default icon
        [PSCustomObject]$Context # For consistency, though not strictly used here for config
    )
    # Get-OrElse should be globally defined
    $useEmojis = $true
    if ($Context -and $Context.Config -and $Context.Config.environment -and $Context.Config.environment.logging) {
        $useEmojis = $Context.Config.environment.logging.useEmojis | global:Get-OrElse $true
    } elseif ($script:LoggingConfig.DefaultContext -and $script:LoggingConfig.DefaultContext.Config -and $script:LoggingConfig.DefaultContext.Config.environment -and $script:LoggingConfig.DefaultContext.Config.environment.logging){
         $useEmojis = $script:LoggingConfig.DefaultContext.Config.environment.logging.useEmojis | global:Get-OrElse $true
    }


    $displayIcon = if ($useEmojis) { "$Icon " } else { "" }
    $headerText = "$displayIcon$Title"
    if (-not [string]::IsNullOrWhiteSpace($Subtitle)) {
        $headerText += " - $Subtitle"
    }
    # Write-MandALog will handle its own formatting for HEADER level
    Write-MandALog -Message $headerText -Level "HEADER" -Component "UI" -Context $Context
}

function Write-StatusTable {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$StatusData, # Hashtable of Key-Value pairs
        [string]$TableTitle = "Status Overview",
        [PSCustomObject]$Context
    )
    Write-MandALog -Message $TableTitle -Level "HEADER" -Component "UI" -Context $Context
    if ($null -eq $StatusData -or $StatusData.Count -eq 0) {
        Write-MandALog -Message "No data to display in status table." -Level "INFO" -Component "UI" -Context $Context
        return
    }

    # Determine max key length for formatting
    $maxKeyLength = 0
    if ($StatusData.Keys.Count -gt 0) {
         $maxKeyLength = ($StatusData.Keys | ForEach-Object { $_.Length } | Measure-Object -Maximum).Maximum
    }
    $maxKeyLength = [Math]::Max($maxKeyLength, 15) # Minimum key column width

    foreach ($key in $StatusData.Keys | Sort-Object) {
        $value = $StatusData[$key]
        $displayValue = if ($value -is [bool]) { if($value){"Enabled"}else{"Disabled"} } elseif ($null -eq $value) {"Not Set"} else { $value.ToString() }
        
        $formattedKey = $key.PadRight($maxKeyLength)
        Write-MandALog -Message "$formattedKey : $displayValue" -Level "INFO" -Component "UI-Table" -Context $Context
    }
    Write-MandALog -Message ("-" * ($maxKeyLength + $displayValue.Length + 5 )) -Level "INFO" -Component "UI-Table" -Context $Context # Footer line
}

function Write-ProgressBar {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [int]$Current,
        [Parameter(Mandatory=$true)]
        [int]$Total,
        [string]$Activity = "Processing",
        [string]$StatusMessage = "",
        [int]$BarWidth = 40,
        [PSCustomObject]$Context
    )
    if ($Total -eq 0) { return } # Avoid division by zero

    $percentComplete = [math]::Round(($Current / $Total) * 100, 0)
    $completedChars = [math]::Floor(($Current / $Total) * $BarWidth)
    $remainingChars = $BarWidth - $completedChars

    $progressBar = ("=" * $completedChars) + ("-" * $remainingChars)
    
    $progressText = "$Activity [$progressBar] $percentComplete% ($Current/$Total)"
    if (-not [string]::IsNullOrWhiteSpace($StatusMessage)) {
        $progressText += " - $StatusMessage"
    }

    # Use Write-Host for dynamic progress bar as Write-MandALog adds timestamps/etc.
    # Or, Write-MandALog could have a special "RAW_PROGRESS" level if needed.
    # For PS 5.1, `Write-Progress` is the native cmdlet.
    Write-Progress -Activity $Activity -Status "$percentComplete% Complete ($Current of $Total) $StatusMessage" -PercentComplete $percentComplete -CurrentOperation "Step $Current of $Total"
    
    # If you want to also log distinct progress points (e.g., every 10%):
    # This check ensures we don't flood logs.
    if (($Current % [Math]::Max(1, [Math]::Floor($Total/10))) -eq 0 -or $Current -eq $Total) {
         Write-MandALog -Message $progressText -Level "PROGRESS" -Component "ProgressBar" -Context $Context
    }
}

function Write-CompletionSummary {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$OperationName,
        [Parameter(Mandatory=$true)]
        [bool]$Success,
        [Parameter(Mandatory=$false)]
        [TimeSpan]$Duration,
        [Parameter(Mandatory=$false)]
        [hashtable]$Metrics, # Key-value pairs for summary
        [PSCustomObject]$Context
    )
    $statusText = if ($Success) { "COMPLETED SUCCESSFULLY" } else { "FAILED" }
    $level = if ($Success) { "SUCCESS" } else { "ERROR" }
    
    Write-MandALog -Message "$OperationName $statusText" -Level $level -Component "Summary" -Context $Context
    
    if ($Duration) {
        Write-MandALog -Message "Duration: $($Duration.ToString('hh\:mm\:ss\.fff'))" -Level "INFO" -Component "Summary" -Context $Context
    }
    if ($Metrics) {
        Write-MandALog -Message "Key Metrics:" -Level "INFO" -Component "Summary" -Context $Context
        foreach ($key in $Metrics.Keys | Sort-Object) {
            Write-MandALog -Message "  $key : $($Metrics[$key])" -Level "INFO" -Component "Summary" -Context $Context
        }
    }
}

# Example of how other utility modules might be structured (not fully implemented here):
# Set-LogLevel, Set-LoggingOptions would be here if they modify $script:LoggingConfig directly
# and need to be exported.
# Test-LogMessage would be an internal helper or part of Write-MandALog's logic.

Write-Host "[EnhancedLogging.psm1] Module loaded. Functions exported: Initialize-Logging, Write-MandALog, etc." -ForegroundColor DarkGray

