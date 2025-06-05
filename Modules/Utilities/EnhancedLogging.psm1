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
    - Relies on global:Get-OrElse for safe configuration access.
    - Supports PowerShell 5.1.
    - Ensures UTF-8 encoding for log files.
    - Replaced direct emoji characters in Get-LogEmojiInternal with text equivalents.
#>

# Export functions to be available when the module is imported.
Export-ModuleMember -Function Initialize-Logging, Write-MandALog, Move-LogFile, Clear-OldLogFiles

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
}

# --- Private Helper Functions ---

function Get-EffectiveLoggingSetting {
    param(
        [string]$SettingName, 
        [object]$Context,       
        [object]$DefaultValue 
    )
    
    # Get-OrElse should be globally available from Set-SuiteEnvironment.ps1
    if ($Context -and $Context.PSObject.Properties['Config'] -and `
        $Context.Config.PSObject.Properties['environment'] -and `
        $Context.Config.environment.PSObject.Properties['logging'] -and `
        $Context.Config.environment.logging.PSObject.Properties[$SettingName]) {
        return $Context.Config.environment.logging.$SettingName | global:Get-OrElse $DefaultValue
    }
    
    if ($script:LoggingConfig.ContainsKey($SettingName)) {
        return $script:LoggingConfig[$SettingName] | global:Get-OrElse $DefaultValue
    }
    
    return $DefaultValue
}


function Get-LogColorInternal {
    param([string]$Level, [PSCustomObject]$ForContext) 
    
    $useColors = Get-EffectiveLoggingSetting -SettingName 'UseColors' -Context $ForContext -DefaultValue $true
    if (-not $useColors) { return "Gray" } 

    switch ($Level.ToUpper()) {
        "DEBUG"    { return "DarkGray" }
        "INFO"     { return "Cyan" }
        "SUCCESS"  { return "Green" }
        "WARN"     { return "Yellow" }
        "ERROR"    { return "Red" }
        "CRITICAL" { return "DarkRed"; } 
        "HEADER"   { return "White"; }   
        "PROGRESS" { return "Magenta" }
        "IMPORTANT"{ return "Yellow" } 
        default    { return "White" }
    }
}

function Get-LogEmojiInternal {
    param([string]$Level, [PSCustomObject]$ForContext)
    
    $useEmojisSetting = Get-EffectiveLoggingSetting -SettingName 'UseEmojis' -Context $ForContext -DefaultValue $true
    if (-not $useEmojisSetting) { return "" } # Return empty string if emojis are off

    # Using text-based equivalents for emojis to ensure compatibility
    switch ($Level.ToUpper()) {
        "DEBUG"    { return "[DBG]" }  # Was "[DEBUG]"
        "INFO"     { return "[INF]" }  # Was "[INFO]"
        "SUCCESS"  { return "[OK!]" }  # Was "[SUCCESS]"
        "WARN"     { return "[WRN]" }  # Was "[WARN]"
        "ERROR"    { return "[ERR]" }  # Was "[ERROR]"
        "CRITICAL" { return "[CRT]" }  # Was "[CRITICAL]"
        "HEADER"   { return "[HDR]" }  # Was " M&A " (keeping as text was fine, standardized)
        "PROGRESS" { return "[PRG]" }  # Was "[PROGRESS]"
        "IMPORTANT"{ return "[IMP]" }  # Was "[IMPORTANT]"
        default    { return "[>]"   }  # Was "->"
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
        $script:LoggingConfig.DefaultContext = $Context 
    } elseif ($null -ne $global:MandA -and ($global:MandA -is [hashtable])) {
        Write-Host "[EnhancedLogging.Initialize-Logging] No -Context provided, attempting to use `\$global:MandA." -ForegroundColor DarkYellow
        if ($global:MandA.ContainsKey('Config')) { $effectiveConfig = $global:MandA.Config }
        if ($global:MandA.ContainsKey('Paths')) { $effectivePaths = $global:MandA.Paths }
        if ($global:MandA.ContainsKey('CompanyName') -and -not [string]::IsNullOrWhiteSpace($global:MandA.CompanyName)) {
            $currentCompanyNameForLog = $global:MandA.CompanyName -replace '[<>:"/\\|?*]', '_'
        }
        $script:LoggingConfig.DefaultContext = $global:MandA
    }

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
        } 
        
    } else {
        Write-Warning "[EnhancedLogging.Initialize-Logging] No valid configuration source found. Using script default logging settings."
    }

    if (-not (Test-Path $script:LoggingConfig.LogPath -PathType Container)) {
        try {
            New-Item -Path $script:LoggingConfig.LogPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
            Write-Host "[EnhancedLogging.Initialize-Logging] Created log directory: $($script:LoggingConfig.LogPath)" -ForegroundColor Green
        } catch {
            Write-Error "[EnhancedLogging.Initialize-Logging] CRITICAL: Failed to create log directory: $($script:LoggingConfig.LogPath). Error: $($_.Exception.Message). File logging will fail."
            $script:LoggingConfig.LogFile = $null 
            $script:LoggingConfig.Initialized = $true 
            return
        }
    }
    
    $logFileBaseName = "MandADiscoverySuite_${currentCompanyNameForLog}"
    $timestampForFile = Get-Date -Format "yyyyMMdd_HHmmss"
    $script:LoggingConfig.LogFile = Join-Path $script:LoggingConfig.LogPath "$($logFileBaseName)_$timestampForFile.log"
    $script:LoggingConfig.Initialized = $true 
    
    $initialLogContext = if ($null -ne $Context) {$Context} elseif ($null -ne $global:MandA) {$global:MandA} else {[PSCustomObject]@{Config = $effectiveConfig}}
    Write-MandALog -Message "Logging system initialized. LogLevel: $($script:LoggingConfig.LogLevel). LogFile: $($script:LoggingConfig.LogFile)" -Level "INFO" -Component "LoggerInit" -Context $initialLogContext
    
    $cleanupContext = $initialLogContext
    if (-not ($cleanupContext.PSObject.Properties['Paths'] -and $cleanupContext.Paths.PSObject.Properties['LogOutput'])) {
        $tempPathsForCleanup = @{ LogOutput = $script:LoggingConfig.LogPath }
        if ($cleanupContext.PSObject.Properties['Paths']) { 
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
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context 
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
    
    $effectiveContext = $Context | global:Get-OrElse $script:LoggingConfig.DefaultContext 
    
    $currentLogLevel = Get-EffectiveLoggingSetting -SettingName 'LogLevel' -Context $effectiveContext -DefaultValue "INFO"
    $showTimestampSetting = Get-EffectiveLoggingSetting -SettingName 'ShowTimestamp' -Context $effectiveContext -DefaultValue $true
    $showComponentSetting = Get-EffectiveLoggingSetting -SettingName 'ShowComponent' -Context $effectiveContext -DefaultValue $true
    
    $levelHierarchy = @{ "DEBUG"=0; "INFO"=1; "PROGRESS"=1; "SUCCESS"=1; "WARN"=2; "IMPORTANT"=2; "ERROR"=3; "CRITICAL"=4; "HEADER"=5 } 
    $configLogLevelNum = $levelHierarchy[$currentLogLevel.ToUpper()] | global:Get-OrElse 1
    $messageLogLevelNum = $levelHierarchy[$Level.ToUpper()] | global:Get-OrElse 1

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
        if ($separatorLength -lt 60) {$separatorLength = 60} 
        $separator = "=" * $separatorLength
        Write-Host "`n$separator" -ForegroundColor (Get-LogColorInternal -Level "DEBUG" -ForContext $effectiveContext) 
        Write-Host "  $consoleMessage  " -ForegroundColor $logColor -BackgroundColor (Get-LogColorInternal -Level "DEBUG" -ForContext $effectiveContext) 
        Write-Host "$separator`n" -ForegroundColor (Get-LogColorInternal -Level "DEBUG" -ForContext $effectiveContext)
    } elseif ($Level.ToUpper() -eq "CRITICAL") {
        Write-Host $consoleMessage -ForegroundColor $logColor -BackgroundColor White 
    }
    else {
        Write-Host $consoleMessage -ForegroundColor $logColor
    }

    if (-not [string]::IsNullOrWhiteSpace($script:LoggingConfig.LogFile)) {
        $fileMessage = $Message 
        $fileLogEntry = ""
        if ($showTimestampSetting) { $fileLogEntry += "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] " }
        $fileLogEntry += "[$($Level.ToUpper())] "
        if ($showComponentSetting -and -not [string]::IsNullOrWhiteSpace($Component)) { $fileLogEntry += "[$Component] " }
        $fileLogEntry += $fileMessage

        try {
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

    $logDir = Split-Path $currentLogFile -Parent
    $logNameBaseOriginal = [System.IO.Path]::GetFileNameWithoutExtension($currentLogFile)
    $logExtension = [System.IO.Path]::GetExtension($currentLogFile) 

    $logNameClean = $logNameBaseOriginal -replace '_\d{8}_\d{6}_ROTATED_\d{17}$','' 
    $logNameClean = $logNameClean -replace '_\d{8}_\d{6}$','' 

    $rotationTimestamp = Get-Date -Format "yyyyMMddHHmmssfff"
    $rotatedLogFileName = "$($logNameClean)_ROTATED_$rotationTimestamp$logExtension"
    $rotatedLogFilePath = Join-Path $logDir $rotatedLogFileName

    try {
        Rename-Item -Path $currentLogFile -NewName $rotatedLogFileName -ErrorAction Stop
        Write-Host "[INFO] [Logger] Log file rotated to: $rotatedLogFileName" 
        
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
        [PSCustomObject]$Context 
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

Write-Host "[EnhancedLogging.psm1] Module loaded. (v1.0.2 - Text Emojis)" -ForegroundColor DarkGray


# Export all public functions
Export-ModuleMember -Function @(
    'Initialize-Logging',
    'Write-MandALog',
    'Move-LogFile',
    'Clear-OldLogFiles',
    'Get-EffectiveLoggingSetting',
    'Get-LogColorInternal',
    'Get-LogEmojiInternal'
)