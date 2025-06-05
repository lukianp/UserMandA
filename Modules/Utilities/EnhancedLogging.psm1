#Requires -Version 5.1
<#
.SYNOPSIS
    Provides enhanced logging capabilities for the M&A Discovery Suite.
.DESCRIPTION
    This module offers functions for initializing the logging system, writing formatted
    log messages to both console and file, with support for log levels,
    timestamps, component names, colors, and emojis. It's designed to work with the
    $global:MandA context for configuration or a passed context object.
    This version incorporates fixes based on the provided fault list, particularly
    FAULT 7 (Write-MandALog before init) and FAULT 16 (Context Parameter).
.NOTES
    Version: 1.0.1
    Author: M&A Discovery Suite Team
    Date: 2025-06-05

    Key Design Points:
    - Addresses FAULT 7: Write-MandALog now checks if logging is initialized and has a basic fallback.
      Initialize-Logging is the primary function to set up the logging system.
    - Addresses FAULT 16: Write-MandALog standardizes on a -Context parameter.
    - Relies on global:Get-OrElse for safe configuration access.
    - Supports PowerShell 5.1.
    - Ensures UTF-8 encoding for log files.
#>

# Export functions to be available when the module is imported.
Export-ModuleMember -Function Initialize-Logging, Write-MandALog, Move-LogFile, Clear-OldLogFiles
# Note: Other display functions like Write-SectionHeader, Write-StatusTable are moved to ProgressDisplay.psm1
# to keep this module focused on core logging mechanisms.

# --- Script-level Logging Configuration (Defaults) ---
# This $script:LoggingConfig will be populated by Initialize-Logging
$script:LoggingConfig = @{
    LogFile             = $null
    LogLevel            = "INFO" 
    LogRetentionDays    = 30
    MaxLogSizeMB        = 50
    UseEmojis           = $true
    UseColors           = $true
    ShowTimestamp       = $true
    ShowComponent       = $true
    LogPath             = "C:\MandADiscovery\Logs" # Absolute fallback if no config/context provides it
    Initialized         = $false
    DefaultContext      = $null # To store $global:MandA or passed context from Initialize-Logging
}

# --- Private Helper Functions ---

function Get-EffectiveLoggingSetting {
    param(
        [string]$SettingName, # e.g., 'UseEmojis', 'LogLevel'
        [object]$Context,     # The -Context object passed to Write-MandALog
        [object]$DefaultValue # The ultimate fallback if not in context or script:LoggingConfig
    )
    # Priority:
    # 1. From $Context.Config.environment.logging.$SettingName
    # 2. From $script:LoggingConfig.$SettingName (which was set by Initialize-Logging)
    # 3. $DefaultValue

    # Get-OrElse should be globally available
    if ($Context -and $Context.PSObject.Properties['Config'] -and `
        $Context.Config.PSObject.Properties['environment'] -and `
        $Context.Config.environment.PSObject.Properties['logging'] -and `
        $Context.Config.environment.logging.PSObject.Properties[$SettingName]) {
        return $Context.Config.environment.logging.$SettingName | global:Get-OrElse $DefaultValue
    }
    
    # Fallback to initialized $script:LoggingConfig settings
    if ($script:LoggingConfig.ContainsKey($SettingName)) {
        return $script:LoggingConfig[$SettingName] | global:Get-OrElse $DefaultValue
    }
    
    return $DefaultValue
}


function Get-LogColorInternal { # Renamed to avoid conflict if user defines Get-LogColor
    param([string]$Level, [PSCustomObject]$ForContext) # ForContext to pass to Get-EffectiveLoggingSetting
    
    $useColors = Get-EffectiveLoggingSetting -SettingName 'UseColors' -Context $ForContext -DefaultValue $true
    if (-not $useColors) { return "Gray" } 

    switch ($Level.ToUpper()) {
        "DEBUG"    { return "DarkGray" }
        "INFO"     { return "Cyan" }
        "SUCCESS"  { return "Green" }
        "WARN"     { return "Yellow" }
        "ERROR"   { return "Red" }
        "CRITICAL" { return "DarkRed"; } # Background for CRITICAL handled in Write-MandALog
        "HEADER"   { return "White"; }   # Background for HEADER handled in Write-MandALog
        "PROGRESS" { return "Magenta" }
        "IMPORTANT"{ return "Yellow" } 
        default    { return "White" }
    }
}

function Get-LogEmojiInternal { # Renamed
    param([string]$Level, [PSCustomObject]$ForContext)
    
    $useEmojis = Get-EffectiveLoggingSetting -SettingName 'UseEmojis' -Context $ForContext -DefaultValue $true
    if (-not $useEmojis) { return "" }

    switch ($Level.ToUpper()) {
        "DEBUG"    { return "⚙️" }
        "INFO"     { return "ℹ️" }
        "SUCCESS"  { return "✅" }
        "WARN"     { return "⚠️" }
        "ERROR"   { return "❌" }
        "CRITICAL" { return "🚨" }
        "HEADER"   { return " M&A " } # Using text for header to be more descriptive
        "PROGRESS" { return "🔄" }
        "IMPORTANT"{ return "📌" }
        default    { return "➡️" }
    }
}

# --- Public Functions ---

function Initialize-Logging {
    [CmdletBinding()]
    param(
        # FAULT 16: Configuration is now part of the Context object
        [Parameter(Mandatory=$false)] # Making it non-mandatory to allow fallback to $global:MandA
        [PSCustomObject]$Context # Expects Context with .Config and .Paths
    )

    Write-Host "[EnhancedLogging.Initialize-Logging] Initializing logging system..." -ForegroundColor DarkCyan
    
    $effectiveConfig = $null
    $effectivePaths = $null
    $currentCompanyNameForLog = "General"

    if ($null -ne $Context) {
        if ($Context.PSObject.Properties['Config']) { $effectiveConfig = $Context.Config }
        if ($Context.PSObject.Properties['Paths']) { $effectivePaths = $Context.Paths }
        if ($Context.PSObject.Properties['CompanyName'] -and -not [string]::IsNullOrWhiteSpace($Context.CompanyName)) {
            $currentCompanyNameForLog = $Context.CompanyName -replace '[<>:"/\\|?*]', '_'
        } elseif ($effectiveConfig -and $effectiveConfig.PSObject.Properties['metadata'] -and $effectiveConfig.metadata.PSObject.Properties['companyName']) {
            $currentCompanyNameForLog = $effectiveConfig.metadata.companyName -replace '[<>:"/\\|?*]', '_'
        }
        $script:LoggingConfig.DefaultContext = $Context # Store the passed context for Write-MandALog fallbacks
    } elseif ($null -ne $global:MandA -and ($global:MandA -is [hashtable])) {
        # Fallback to global:MandA if no specific context is passed
        Write-Host "[EnhancedLogging.Initialize-Logging] No -Context provided, attempting to use `\$global:MandA." -ForegroundColor DarkYellow
        if ($global:MandA.ContainsKey('Config')) { $effectiveConfig = $global:MandA.Config }
        if ($global:MandA.ContainsKey('Paths')) { $effectivePaths = $global:MandA.Paths }
        if ($global:MandA.ContainsKey('CompanyName') -and -not [string]::IsNullOrWhiteSpace($global:MandA.CompanyName)) {
            $currentCompanyNameForLog = $global:MandA.CompanyName -replace '[<>:"/\\|?*]', '_'
        }
        $script:LoggingConfig.DefaultContext = $global:MandA
    }

    # Populate $script:LoggingConfig based on $effectiveConfig
    if ($null -ne $effectiveConfig -and ($effectiveConfig -is [hashtable])) {
        $envSettings = $effectiveConfig.environment | global:Get-OrElse @{}
        $loggingSettings = $envSettings.logging | global:Get-OrElse @{}

        $script:LoggingConfig.LogLevel = $envSettings.logLevel | global:Get-OrElse "INFO"
        $script:LoggingConfig.UseEmojis = $loggingSettings.useEmojis | global:Get-OrElse $true
        $script:LoggingConfig.UseColors = $loggingSettings.useColors | global:Get-OrElse $true
        $script:LoggingConfig.ShowTimestamp = $loggingSettings.showTimestamp | global:Get-OrElse $true
        $script:LoggingConfig.ShowComponent = $loggingSettings.showComponent | global:Get-OrElse $true
        $script:LoggingConfig.MaxLogSizeMB = $loggingSettings.maxLogSizeMB | global:Get-OrElse 50
        $script:LoggingConfig.LogRetentionDays = $loggingSettings.logRetentionDays | global:Get-OrElse 30
        
        # Determine LogPath
        if ($null -ne $effectivePaths -and $effectivePaths.HashtableContains('LogOutput') -and -not [string]::IsNullOrWhiteSpace($effectivePaths.LogOutput)) {
            $script:LoggingConfig.LogPath = $effectivePaths.LogOutput
        } elseif ($loggingSettings.HashtableContains('logPath') -and -not [string]::IsNullOrWhiteSpace($loggingSettings.logPath)) {
            $configuredLogPath = $loggingSettings.logPath
            if ((-not ([System.IO.Path]::IsPathRooted($configuredLogPath))) -and $effectivePaths -and $effectivePaths.HashtableContains('SuiteRoot')) {
                $script:LoggingConfig.LogPath = Join-Path $effectivePaths.SuiteRoot $configuredLogPath | Resolve-Path -ErrorAction SilentlyContinue
            } else {
                $script:LoggingConfig.LogPath = $configuredLogPath
            }
        } elseif ($envSettings.HashtableContains('outputPath') -and -not [string]::IsNullOrWhiteSpace($envSettings.outputPath)) {
            $script:LoggingConfig.LogPath = Join-Path $envSettings.outputPath "Logs"
        } # else, keeps script default $script:LoggingConfig.LogPath
        
    } else {
        Write-Warning "[EnhancedLogging.Initialize-Logging] No valid configuration source found (Context or `\$global:MandA.Config). Using script default logging settings."
    }

    # Ensure Log Path exists
    if (-not (Test-Path $script:LoggingConfig.LogPath -PathType Container)) {
        try {
            New-Item -Path $script:LoggingConfig.LogPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
            Write-Host "[EnhancedLogging.Initialize-Logging] Created log directory: $($script:LoggingConfig.LogPath)" -ForegroundColor Green
        } catch {
            Write-Error "[EnhancedLogging.Initialize-Logging] CRITICAL: Failed to create log directory: $($script:LoggingConfig.LogPath). Error: $($_.Exception.Message). File logging will fail."
            $script:LoggingConfig.LogFile = $null 
            $script:LoggingConfig.Initialized = $true # Mark as initialized for console logging only
            return
        }
    }
    
    $logFileBaseName = "MandADiscoverySuite" # More generic base name
    $logFileBaseName = "${logFileBaseName}_${currentCompanyNameForLog}"
    $timestampForFile = Get-Date -Format "yyyyMMdd_HHmmss"
    $script:LoggingConfig.LogFile = Join-Path $script:LoggingConfig.LogPath "$($logFileBaseName)_$timestampForFile.log"

    $script:LoggingConfig.Initialized = $true # Mark as initialized
    
    # Use Write-MandALog for the first proper log message.
    # Need to pass a temporary context for this very first call as $script:LoggingConfig.DefaultContext might not be fully set if Initialize-Logging was called without params itself.
    $initialLogContext = if ($null -ne $Context) {$Context} elseif ($null -ne $global:MandA) {$global:MandA} else {[PSCustomObject]@{Config = $effectiveConfig}}
    Write-MandALog -Message "Logging system initialized. LogLevel: $($script:LoggingConfig.LogLevel). LogFile: $($script:LoggingConfig.LogFile)" -Level "INFO" -Component "LoggerInit" -Context $initialLogContext
    
    # Perform log rotation/cleanup if configured
    # Construct a minimal context for Clear-OldLogFiles if $Context wasn't passed
    $cleanupContext = $initialLogContext
    if (-not ($cleanupContext.PSObject.Properties['Paths'] -and $cleanupContext.Paths.PSObject.Properties['LogOutput'])) {
        # If paths aren't on the context, create a temporary one with LogOutput
        $tempPathsForCleanup = @{ LogOutput = $script:LoggingConfig.LogPath }
        if ($cleanupContext.PSObject.Properties['Paths']) { # if Paths exists but missing LogOutput
            $cleanupContext.Paths.LogOutput = $script:LoggingConfig.LogPath
        } else {
             $cleanupContext = Add-Member -InputObject $cleanupContext -MemberType NoteProperty -Name Paths -Value $tempPathsForCleanup -PassThru
        }
    }
    Clear-OldLogFiles -Context $cleanupContext
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
        
        # FAULT 16 FIX: Standardized on -Context.
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context 
    )

    # FAULT 7 FIX: Check if logging is initialized. If not, use basic Write-Host.
    if (-not $script:LoggingConfig.Initialized) {
        $fallbackTimestamp = if ($script:LoggingConfig.ShowTimestamp -or $true) { "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] " } else { "" } # Default to show timestamp if not init
        $fallbackComponent = if ($script:LoggingConfig.ShowComponent -or $true) { "[$Component] " } else { "" }
        Write-Host "$fallbackTimestamp[$($Level.ToUpper())] $fallbackComponent$Message"
        if (-not $script:LoggingConfig.InitializedWarningShown) { # Show warning once
            Write-Warning "[Write-MandALog] Warning: Logging system not initialized. Using basic Write-Host. Call Initialize-Logging first."
            $script:LoggingConfig.InitializedWarningShown = $true
        }
        return
    }
    
    # Determine effective settings for this specific log call
    $effectiveContext = $Context | global:Get-OrElse $script:LoggingConfig.DefaultContext # Use passed context or fallback
    
    $currentLogLevel = Get-EffectiveLoggingSetting -SettingName 'LogLevel' -Context $effectiveContext -DefaultValue "INFO"
    $showTimestampSetting = Get-EffectiveLoggingSetting -SettingName 'ShowTimestamp' -Context $effectiveContext -DefaultValue $true
    $showComponentSetting = Get-EffectiveLoggingSetting -SettingName 'ShowComponent' -Context $effectiveContext -DefaultValue $true
    
    # Log Level Check
    $levelHierarchy = @{ "DEBUG"=0; "INFO"=1; "PROGRESS"=1; "SUCCESS"=1; "WARN"=2; "IMPORTANT"=2; "ERROR"=3; "CRITICAL"=4; "HEADER"=5 } # HEADER is high to always show
    $configLogLevelNum = $levelHierarchy[$currentLogLevel.ToUpper()] | global:Get-OrElse 1
    $messageLogLevelNum = $levelHierarchy[$Level.ToUpper()] | global:Get-OrElse 1

    if ($messageLogLevelNum -lt $configLogLevelNum) { return }

    # Prepare Console Output
    $consoleMessage = $Message
    $logColor = Get-LogColorInternal -Level $Level -ForContext $effectiveContext # Pass context
    
    if (Get-EffectiveLoggingSetting -SettingName 'UseEmojis' -Context $effectiveContext -DefaultValue $true) {
        $emoji = Get-LogEmojiInternal -Level $Level -ForContext $effectiveContext # Pass context
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
    
    # Write to Console
    if ($Level.ToUpper() -eq "HEADER") {
        $separatorLength = $consoleMessage.Length + 4
        if ($separatorLength -lt 60) {$separatorLength = 60} # Minimum length for separator
        $separator = "=" * $separatorLength
        Write-Host "`n$separator" -ForegroundColor (Get-LogColorInternal -Level "DEBUG" -ForContext $effectiveContext) # Subtle separator color
        Write-Host "  $consoleMessage  " -ForegroundColor $logColor -BackgroundColor (Get-LogColorInternal -Level "DEBUG" -ForContext $effectiveContext) # Use a background color for Header
        Write-Host "$separator`n" -ForegroundColor (Get-LogColorInternal -Level "DEBUG" -ForContext $effectiveContext)
    } elseif ($Level.ToUpper() -eq "CRITICAL") {
        Write-Host $consoleMessage -ForegroundColor $logColor -BackgroundColor White # CRITICAL stands out
    }
    else {
        Write-Host $consoleMessage -ForegroundColor $logColor
    }

    # Prepare File Output (if LogFile is set)
    if (-not [string]::IsNullOrWhiteSpace($script:LoggingConfig.LogFile)) {
        $fileMessage = $Message # Assume UTF-8 file handles emojis; specific stripping might be complex for PS 5.1
        
        $fileLogEntry = ""
        if ($showTimestampSetting) { $fileLogEntry += "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] " }
        $fileLogEntry += "[$($Level.ToUpper())] "
        if ($showComponentSetting -and -not [string]::IsNullOrWhiteSpace($Component)) { $fileLogEntry += "[$Component] " }
        $fileLogEntry += $fileMessage

        try {
            $logDirForFileCheck = Split-Path $script:LoggingConfig.LogFile -Parent
            if (-not (Test-Path $logDirForFileCheck -PathType Container)) {
                # This is an issue if the log dir got deleted after init. Try to recreate.
                New-Item -Path $logDirForFileCheck -ItemType Directory -Force -ErrorAction SilentlyContinue | Out-Null
            }
            # Use UTF-8 encoding for the log file
            Add-Content -Path $script:LoggingConfig.LogFile -Value $fileLogEntry -Encoding UTF8 -ErrorAction Stop
            
            $logFileItem = Get-Item -Path $script:LoggingConfig.LogFile -ErrorAction SilentlyContinue
            $maxLogSizeConfig = Get-EffectiveLoggingSetting -SettingName 'MaxLogSizeMB' -Context $effectiveContext -DefaultValue 50
            if ($null -ne $logFileItem -and ($logFileItem.Length / 1MB) -gt $maxLogSizeConfig) {
                Move-LogFile -Context $effectiveContext 
            }
        } catch {
            Write-Warning "[EnhancedLogging.Write-MandALog] Failed to write to log file '$($script:LoggingConfig.LogFile)'. Error: $($_.Exception.Message). Console logging will continue."
            # Consider a flag to stop trying to write to file after N failures for performance.
        }
    }
}

function Move-LogFile {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory=$true)]
        [PSCustomObject]$Context # Expects Context with Config, Paths, and CompanyName (or fallbacks)
    )
    if (-not $script:LoggingConfig.Initialized -or [string]::IsNullOrWhiteSpace($script:LoggingConfig.LogFile)) {
        # Cannot use Write-MandALog here as it might call Move-LogFile again.
        Write-Warning "[EnhancedLogging.Move-LogFile] Logging not initialized or LogFile path not set. Cannot move log."
        return
    }
    
    $currentLogFile = $script:LoggingConfig.LogFile
    if (-not (Test-Path $currentLogFile -PathType Leaf)) {
        Write-Host "[INFO] [Logger] Current log file '$currentLogFile' not found for rotation. Nothing to move."
        return
    }

    $logDir = Split-Path $currentLogFile -Parent
    $logNameBaseOriginal = [System.IO.Path]::GetFileNameWithoutExtension($currentLogFile)
    $logExtension = [System.IO.Path]::GetExtension($currentLogFile) 

    # More robustly get the clean base name (e.g., MandADiscoverySuite_CompanyName)
    $logNameClean = $logNameBaseOriginal -replace '_\d{8}_\d{6}_ROTATED_\d{17}$','' # Remove old rotation stamp if any
    $logNameClean = $logNameClean -replace '_\d{8}_\d{6}$','' # Remove initial creation stamp

    $rotationTimestamp = Get-Date -Format "yyyyMMddHHmmssfff"
    $rotatedLogFileName = "$($logNameClean)_ROTATED_$rotationTimestamp$logExtension"
    $rotatedLogFilePath = Join-Path $logDir $rotatedLogFileName

    try {
        Rename-Item -Path $currentLogFile -NewName $rotatedLogFileName -ErrorAction Stop
        Write-Host "[INFO] [Logger] Log file rotated to: $rotatedLogFileName" # Use Write-Host to avoid recursion
        
        # Re-establish the $script:LoggingConfig.LogFile with a new timestamped name
        $companyNameForNewLog = "General"
        if ($Context -and $Context.PSObject.Properties['CompanyName']) {
            $companyNameForNewLog = $Context.CompanyName -replace '[<>:"/\\|?*]', '_'
        } elseif ($Context -and $Context.PSObject.Properties['Config'] -and $Context.Config.metadata) {
             $companyNameForNewLog = $Context.Config.metadata.companyName -replace '[<>:"/\\|?*]', '_' | global:Get-OrElse "General"
        }

        $newLogFileBase = "MandADiscoverySuite_${companyNameForNewLog}"
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
        [PSCustomObject]$Context # Expects Context with Config (for retentionDays) and Paths (for LogOutput)
    )
    if (-not $script:LoggingConfig.Initialized) {
        Write-Warning "[EnhancedLogging.Clear-OldLogFiles] Logging not initialized. Cannot clear old logs."
        return
    }

    $logPathForClear = $Context.Paths.LogOutput | global:Get-OrElse $script:LoggingConfig.LogPath
    $retentionDays = Get-EffectiveLoggingSetting -SettingName 'LogRetentionDays' -Context $Context -DefaultValue 30


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

Write-Host "[EnhancedLogging.psm1] Module loaded. (v1.0.1)" -ForegroundColor DarkGray
