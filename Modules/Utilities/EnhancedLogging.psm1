<#
.SYNOPSIS
    Enhanced logging with improved visual output for M&A Discovery Suite
.DESCRIPTION
    Provides structured logging with enhanced visual indicators and better formatting
.NOTES
    Author: Lukian Poleschtschuk
    Version: 1.2.0
    Created: 2025-06-03
    Last Modified: 2025-06-04
    Change Log:
        - 1.2.0: Integrated StructuredLogging, CorrelationID, ErrorBuffer, and PerformanceMetrics.
                 Ensured $script:LoggingConfig is initialized before being accessed by new features.
                 Corrected Initialize-Logging to safely access configuration.
        - 1.1.0: Fixed to use global paths and added Context parameter support
        - Removed Unicode characters for PowerShell 5.1 compatibility
#>

# Global logging configuration
# Define the main $script:LoggingConfig hashtable FIRST
$script:LoggingConfig = @{
    LogLevel = "INFO"
    LogFile = $null # Will be set by Initialize-Logging
    ConsoleOutput = $true # Assuming default, can be configured
    FileOutput = $true  # Assuming default, can be configured
    MaxLogSizeMB = 50
    LogRetentionDays = 30
    UseEmojis = $true
    UseColors = $true
    ShowTimestamp = $true
    ShowComponent = $true
    # Initialize new sections as sub-hashtables or default values
    StructuredLogging = @{ # Define the StructuredLogging key with its own defaults
        EnableJsonLogging = $false # Default to false, can be overridden by config
        EnableMetrics = $false    # Default to false, can be overridden by config
        MetricsInterval = 60      # seconds
    }
    CorrelationId = [Guid]::NewGuid().ToString() # Initialize CorrelationId
    ErrorBuffer = [System.Collections.ArrayList]::new()   # Initialize ErrorBuffer
}

# Now, if you had specific configurations for StructuredLogging from a config file,
# they would be applied in Initialize-Logging.
# The previous snippet:
# # Add to EnhancedLogging.psm1
# $script:LoggingConfig.StructuredLogging = @{
#     EnableJsonLogging = $true
#     EnableMetrics = $true
#     MetricsInterval = 60  # seconds
# }
# Was problematic because $script:LoggingConfig might not exist when .StructuredLogging was accessed.
# The above initialization of $script:LoggingConfig now includes a default StructuredLogging sub-hashtable.

function Write-StructuredLog {
    param(
        [string]$Message,
        [string]$Level,
        [hashtable]$Properties = @{},
        [string]$OperationId = [Guid]::NewGuid().ToString()
    )
    
    $logEntry = @{
        Timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
        Level = $Level
        Message = $Message
        OperationId = $OperationId
        MachineName = $env:COMPUTERNAME
        ProcessId = $PID
        ThreadId = [System.Threading.Thread]::CurrentThread.ManagedThreadId
        Properties = $Properties
    }
    
    # Check if LogFile is set and StructuredLogging is enabled
    if ($script:LoggingConfig.LogFile -and $script:LoggingConfig.StructuredLogging.EnableJsonLogging) {
        try {
            $jsonLog = $logEntry | ConvertTo-Json -Compress
            # Append to a distinct JSON log file
            $jsonLogFilePath = $script:LoggingConfig.LogFile -replace '\.log$', '.structured.json'
            Add-Content -Path $jsonLogFilePath -Value $jsonLog -Encoding UTF8
        } catch {
            Write-Warning "Failed to write structured log: $($_.Exception.Message)"
        }
    }
}

function Write-PerformanceMetric {
    param(
        [string]$MetricName,
        [double]$Value,
        [string]$Unit = "ms",
        [hashtable]$Tags = @{}
    )
    
    $metric = @{
        Timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
        Metric = $MetricName
        Value = $Value
        Unit = $Unit
        Tags = $Tags
    }
    
    # Check if LogFile is set and Metrics are enabled
    if ($script:LoggingConfig.LogFile -and $script:LoggingConfig.StructuredLogging.EnableMetrics) {
        try {
            $metricsFile = $script:LoggingConfig.LogFile -replace '\.log$', '.metrics.json'
            $metric | ConvertTo-Json -Compress | Add-Content -Path $metricsFile -Encoding UTF8
        } catch {
            Write-Warning "Failed to write performance metric: $($_.Exception.Message)"
        }
    }
}

function Initialize-Logging {
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    
    try {
        # Set LogLevel first as it's fundamental
        if ($Configuration.environment -and $Configuration.environment.ContainsKey('logLevel')) {
            $script:LoggingConfig.LogLevel = $Configuration.environment.logLevel
        }
        
        # Set up log file path
        $logPath = $null
        if ($global:MandA -and $global:MandA.Paths -and $global:MandA.Paths.LogOutput) {
            $logPath = $global:MandA.Paths.LogOutput
        } elseif ($Configuration.environment -and $Configuration.environment.ContainsKey('outputPath')) {
            $logPath = Join-Path $Configuration.environment.outputPath "Logs"
        } else {
            # Fallback to a script-relative path if no other path is defined
            # This is a last resort and indicates a configuration issue upstream.
            $logPath = Join-Path $PSScriptRoot "Logs" 
            Write-Warning "No primary log output path found in configuration or global context. Defaulting to script-relative path: $logPath"
        }
        
        if (-not (Test-Path $logPath -PathType Container)) {
            try {
                New-Item -Path $logPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
            } catch {
                throw "Failed to create log directory at '$logPath'. Error: $($_.Exception.Message)"
            }
        }
        
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $logFileName = "MandA_Discovery_$timestamp.log" # Main text log
        $script:LoggingConfig.LogFile = Join-Path $logPath $logFileName
        
        # Update other logging preferences from config, checking for existence
        if ($Configuration.environment -and $Configuration.environment.ContainsKey('logging')) {
            $loggingSettings = $Configuration.environment.logging
            
            if ($loggingSettings.ContainsKey('useEmojis')) { $script:LoggingConfig.UseEmojis = $loggingSettings.useEmojis }
            if ($loggingSettings.ContainsKey('useColors')) { $script:LoggingConfig.UseColors = $loggingSettings.useColors }
            if ($loggingSettings.ContainsKey('showTimestamp')) { $script:LoggingConfig.ShowTimestamp = $loggingSettings.showTimestamp }
            if ($loggingSettings.ContainsKey('showComponent')) { $script:LoggingConfig.ShowComponent = $loggingSettings.showComponent }
            if ($loggingSettings.ContainsKey('maxLogSizeMB')) { $script:LoggingConfig.MaxLogSizeMB = $loggingSettings.maxLogSizeMB }
            if ($loggingSettings.ContainsKey('logRetentionDays')) { $script:LoggingConfig.LogRetentionDays = $loggingSettings.logRetentionDays }

            # Initialize StructuredLogging settings from config if they exist
            if ($loggingSettings.ContainsKey('StructuredLogging')) {
                $structuredSettings = $loggingSettings.StructuredLogging
                if ($structuredSettings -is [hashtable]) {
                    if ($structuredSettings.ContainsKey('EnableJsonLogging')) {
                        $script:LoggingConfig.StructuredLogging.EnableJsonLogging = $structuredSettings.EnableJsonLogging
                    }
                    if ($structuredSettings.ContainsKey('EnableMetrics')) {
                        $script:LoggingConfig.StructuredLogging.EnableMetrics = $structuredSettings.EnableMetrics
                    }
                    if ($structuredSettings.ContainsKey('MetricsInterval')) {
                        $script:LoggingConfig.StructuredLogging.MetricsInterval = $structuredSettings.MetricsInterval
                    }
                }
            }
        }
        
        # Clean up old log files
        Clear-OldLogFiles -LogPath $logPath
        
        # Write initial log entry using the now configured Write-MandALog
        Write-MandALog "M&A Discovery Suite logging initialized" -Level "SUCCESS" -Component "Logging"
        Write-MandALog "Log file (text): $($script:LoggingConfig.LogFile)" -Level "INFO" -Component "Logging"
        if ($script:LoggingConfig.StructuredLogging.EnableJsonLogging) {
            Write-MandALog "Log file (JSON): $($script:LoggingConfig.LogFile -replace '\.log$', '.structured.json')" -Level "INFO" -Component "Logging"
        }
        if ($script:LoggingConfig.StructuredLogging.EnableMetrics) {
            Write-MandALog "Metrics file: $($script:LoggingConfig.LogFile -replace '\.log$', '.metrics.json')" -Level "INFO" -Component "Logging"
        }
        Write-MandALog "Log level: $($script:LoggingConfig.LogLevel)" -Level "INFO" -Component "Logging"
        
        return $true
        
    } catch {
        # Use Write-Host for fallback if Write-MandALog itself might be compromised
        Write-Host "ERROR: Failed to initialize logging: $($_.Exception.Message)" -ForegroundColor Red
        # Attempt to use Write-Error which is a standard cmdlet
        Write-Error "Failed to initialize logging: $($_.Exception.Message)"
        return $false
    }
}

function Write-MandALog {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet("DEBUG", "INFO", "WARN", "ERROR", "SUCCESS", "HEADER", "PROGRESS", "IMPORTANT")]
        [string]$Level = "INFO",
        
        [Parameter(Mandatory=$false)]
        [string]$Component = "Main",
        
        [Parameter(Mandatory=$false)]
        $Context = $null, # Context can be passed for richer logs, but not strictly required for basic logging
        
        [Parameter(Mandatory=$false)]
        [string]$CorrelationIdParam = $null # Allow overriding CorrelationId per message
    )
    
    # Use the parameter or the script-level CorrelationId
    $currentCorrelationId = if ([string]::IsNullOrEmpty($CorrelationIdParam)) { $script:LoggingConfig.CorrelationId } else { $CorrelationIdParam }

    if ($Level -eq "ERROR") {
        $errorEntry = @{
            Timestamp = Get-Date
            Component = $Component
            Message = $Message
            CorrelationId = $currentCorrelationId
        }
        if ($PSCmdlet.MyInvocation.BoundParameters.ContainsKey('Context') -and $Context -ne $null) {
            if ($Context.ErrorCollector -and $Context.ErrorCollector.PSObject.Methods.Name -contains 'AddError') {
                # Assuming AddError expects (Source, Message, Exception)
                # We don't have the raw exception here, so pass $null for it.
                # This part might need adjustment based on ErrorCollector's AddError signature.
                # $Context.ErrorCollector.AddError($Component, $Message, $null)
            }
        }
        $null = $script:LoggingConfig.ErrorBuffer.Add($errorEntry)
    }
    
    if (-not (Test-LogMessage -Level $Level)) {
        return
    }

    $logTimestamp = if ($script:LoggingConfig.ShowTimestamp) { "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss.fff')]" } else { "" }
    $logComponent = if ($script:LoggingConfig.ShowComponent -and -not [string]::IsNullOrEmpty($Component)) { "[$Component]" } else { "" }
    $logEmoji = Get-LogEmoji -Level $Level
    
    # Console Output
    if ($script:LoggingConfig.ConsoleOutput) {
        $consoleMessage = "$logTimestamp $logEmoji $logComponent $Message".Trim()
        Write-Host $consoleMessage -ForegroundColor (Get-LogColor -Level $Level)
    }
    
    # File Output (Text Log)
    if ($script:LoggingConfig.FileOutput -and $script:LoggingConfig.LogFile) {
        try {
            $fileMessage = "$logTimestamp [$Level] $logComponent $Message".Trim()
            # Remove emojis for file logging if they cause issues, though Get-LogEmoji now returns ASCII
            $fileMessageForFile = $fileMessage # -replace '[\p{So}]','' # Example emoji removal if needed
            Add-Content -Path $script:LoggingConfig.LogFile -Value $fileMessageForFile -Encoding UTF8
        } catch {
            Write-Warning "Failed to write to text log file '$($script:LoggingConfig.LogFile)': $($_.Exception.Message)"
        }
    }

    # Structured JSON Logging (if enabled and different from the simple Write-StructuredLog)
    # The Write-StructuredLog function is separate, this Write-MandALog focuses on console/text.
    # If you want Write-MandALog to ALSO call Write-StructuredLog, you can add:
    if ($script:LoggingConfig.StructuredLogging.EnableJsonLogging) {
         Write-StructuredLog -Message $Message -Level $Level -Properties @{Component = $Component} -OperationId $currentCorrelationId
    }
}

function Get-LogErrorSummary {
    [CmdletBinding()]
    param(
        [int]$LastMinutes = 60
    )
    
    if ($script:LoggingConfig.ErrorBuffer.Count -eq 0) {
        return @()
    }
    
    $cutoff = (Get-Date).AddMinutes(-$LastMinutes)
    $recentErrors = $script:LoggingConfig.ErrorBuffer | Where-Object { $_.Timestamp -gt $cutoff }
    
    return $recentErrors | Group-Object Component | ForEach-Object {
        [PSCustomObject]@{
            Component = $_.Name
            ErrorCount = $_.Count
            LastError = ($_.Group | Sort-Object Timestamp -Descending | Select-Object -First 1).Message
            LastCorrelationId = ($_.Group | Sort-Object Timestamp -Descending | Select-Object -First 1).CorrelationId
        }
    }
}

function Test-LogMessage {
    param([string]$Level)
    
    $levelHierarchy = @{
        "DEBUG" = 0
        "INFO" = 1
        "WARN" = 2
        "ERROR" = 3
        "SUCCESS" = 1 # SUCCESS messages have same importance as INFO for filtering
        "HEADER" = 1  # HEADER messages have same importance as INFO
        "PROGRESS" = 1# PROGRESS messages have same importance as INFO
        "IMPORTANT" = 2 # IMPORTANT messages have same importance as WARN
    }
    
    # Fallback for LogLevel if not perfectly initialized (should not happen with defaults)
    $scriptLogLevel = if ($script:LoggingConfig.LogLevel) { $script:LoggingConfig.LogLevel } else { "INFO" }

    $currentLevelValue = if ($levelHierarchy.ContainsKey($scriptLogLevel)) { $levelHierarchy[$scriptLogLevel] } else { 1 }
    $messageLevelValue = if ($levelHierarchy.ContainsKey($Level)) { $levelHierarchy[$Level] } else { 1 }
    
    return $messageLevelValue -ge $currentLevelValue
}

function Get-LogColor {
    param([string]$Level)
    
    if (-not $script:LoggingConfig.UseColors) {
        # Return default console color if colors are disabled
        return (Get-Host).UI.RawUI.ForegroundColor 
    }
    
    switch ($Level) {
        "DEBUG" { return "Gray" }
        "INFO" { return "White" } # Or use (Get-Host).UI.RawUI.ForegroundColor for default
        "WARN" { return "Yellow" }
        "ERROR" { return "Red" }
        "SUCCESS" { return "Green" }
        "HEADER" { return "Cyan" }
        "PROGRESS" { return "Magenta" }
        "IMPORTANT" { return "Yellow" } # Or a different standout color like DarkYellow if Yellow is common
        default { return "White" } # Or (Get-Host).UI.RawUI.ForegroundColor
    }
}

function Get-LogEmoji {
    param([string]$Level)
    
    if (-not $script:LoggingConfig.UseEmojis) {
        return ""
    }
    
    # Using ASCII equivalents for broad compatibility, especially PowerShell 5.1 console
    switch ($Level) {
        "DEBUG"     { return "[DBG]" }
        "INFO"      { return "[INF]" }
        "WARN"      { return "[WRN]" }
        "ERROR"     { return "[ERR]" }
        "SUCCESS"   { return "[OK!]" }
        "HEADER"    { return "[===]" }
        "PROGRESS"  { return "[...]" }
        "IMPORTANT" { return "[!!!]" }
        default     { return "[---]" }
    }
}

function Write-ProgressBar {
    param(
        [int]$Current,
        [int]$Total,
        [string]$Activity,
        [string]$Status = "",
        [int]$Width = 40 # Adjusted for typical console width with prefixes
    )
    
    if ($Total -eq 0) { Write-Host "$Activity : No items to process." -ForegroundColor Gray; return }
    if ($Current -gt $Total) { $Current = $Total }

    $percentComplete = [math]::Round(($Current / $Total) * 100, 0)
    $barCompletedLength = [math]::Floor(($Current / $Total) * $Width)
    $barRemainingLength = $Width - $barCompletedLength
    
    $progressBar = ("=" * $barCompletedLength) + (" " * $barRemainingLength) # Using '=' for completed part
    
    # Ensure status doesn't make line too long
    $availableSpaceForStatus = [math]::Max(0, 78 - ($Activity.Length + $progressBar.Length + 10)) # Approx available space
    $truncatedStatus = if ($Status.Length -gt $availableSpaceForStatus) { 
        $Status.Substring(0, [math]::Max(0, $availableSpaceForStatus -3)) + "..."
    } else {
        $Status
    }

    $progressText = "$Activity [$progressBar] $percentComplete% $truncatedStatus"
    
    # Ensure the line does not wrap by truncating if necessary
    # Get current console width
    $consoleWidth = try { $Host.UI.RawUI.WindowSize.Width -1 } catch { 80 } # Default to 80 if width can't be obtained
    if ($progressText.Length -ge $consoleWidth) {
        $progressText = $progressText.Substring(0, $consoleWidth - 4) + "..."
    }

    Write-Host "`r$progressText" -NoNewline -ForegroundColor Cyan
    
    if ($Current -eq $Total) {
        Write-Host "" # New line when complete
    }
}

function Write-StatusTable {
    param(
        [hashtable]$StatusData,
        [string]$Title = "Status Summary"
    )
    
    Write-MandALog $Title -Level "HEADER" -Component "Reporting"
    
    if ($null -eq $StatusData -or $StatusData.Count -eq 0) {
        Write-MandALog "No status data to display." -Level "INFO" -Component "Reporting"
        return
    }
    
    $maxKeyLength = 0
    $StatusData.Keys | ForEach-Object { if ($_.Length -gt $maxKeyLength) { $maxKeyLength = $_.Length } }
    $maxKeyLength = [math]::Max(20, $maxKeyLength) # Ensure a minimum key column width

    # Table formatting
    Write-MandALog ("-" * ($maxKeyLength + 30)) -Level "INFO" -Component "Reporting" # Adjust width
    foreach ($item in $StatusData.GetEnumerator() | Sort-Object Name) {
        $keyString = "{0,-$maxKeyLength}" -f $item.Key
        $valueString = ": $($item.Value)"
        
        $logColor = "White"
        if ($item.Value -is [string]) {
             if ($item.Value -match "Success|Connected|PASS|OK|Enabled|True") { $logColor = "Green" }
             elseif ($item.Value -match "Failed|Error|FAIL|ERROR|Disabled|False") { $logColor = "Red" }
             elseif ($item.Value -match "Warning|WARN|Partial") { $logColor = "Yellow" }
        } elseif ($item.Value -is [bool]) {
            $logColor = if ($item.Value) {"Green"} else {"Red"}
        }

        Write-MandALog "$keyString$valueString" -Level "INFO" -Component "Reporting" # Log to file

        # Console output needs manual color handling if Write-MandALog doesn't directly color this way
        Write-Host "$keyString" -NoNewline -ForegroundColor White
        Write-Host ": " -NoNewline -ForegroundColor Gray
        Write-Host "$($item.Value)" -ForegroundColor $logColor
    }
    Write-MandALog ("-" * ($maxKeyLength + 30)) -Level "INFO" -Component "Reporting"
    Write-Host "" # Newline for console
}

function Write-SectionHeader {
    param(
        [string]$Title,
        [string]$Subtitle = "",
        [string]$Icon = "" # Emoji removed, Icon now for ASCII/Text
    )
    
    $asciiIcon = if (-not [string]::IsNullOrEmpty($Icon)) { $Icon } else { Get-LogEmoji -Level "HEADER" }
    $headerText = "$asciiIcon $Title"
    if (-not [string]::IsNullOrEmpty($Subtitle)) {
        $headerText += " - $Subtitle"
    }
    
    # Console Output for Section Header
    $line = "=" * ([Math]::Min($headerText.Length + 4, 80)) # Limit line length
    Write-Host "`n$line" -ForegroundColor Cyan
    Write-Host $headerText -ForegroundColor Cyan
    Write-Host "$line`n" -ForegroundColor Cyan

    # Log to file using Write-MandALog, which handles its own formatting
    Write-MandALog $headerText -Level "HEADER" -Component "Section"
}

function Write-CompletionSummary {
    param(
        [hashtable]$Summary,
        [string]$Title = "Operation Complete"
    )
    
    Write-SectionHeader -Title $Title -Icon (Get-LogEmoji -Level "SUCCESS")

    if ($Summary) {
        Write-StatusTable -StatusData $Summary -Title "Final Summary"
    }
    Write-MandALog "$Title - All tasks finished." -Level "SUCCESS" -Component "Summary"
}

function Move-LogFile {
    # This function might be less critical if logs are timestamped and old ones cleared.
    # Retaining for completeness if manual rotation is ever desired.
    try {
        if (-not $script:LoggingConfig.LogFile -or -not (Test-Path $script:LoggingConfig.LogFile -PathType Leaf)) {
            Write-MandALog "No current log file to move/rotate." -Level "DEBUG" -Component "Logging"
            return
        }
        
        $logDir = Split-Path $script:LoggingConfig.LogFile -Parent
        $logNameBase = [System.IO.Path]::GetFileNameWithoutExtension($script:LoggingConfig.LogFile)
        $logExtension = [System.IO.Path]::GetExtension($script:LoggingConfig.LogFile) # Should be .log
        
        # Find a unique name for the rotated log
        $counter = 1
        $rotatedLogFile = ""
        do {
            $timestampSuffix = (Get-Date).AddSeconds(-$counter).ToString("yyyyMMdd_HHmmss") # Ensure unique timestamp
            $rotatedLogFile = Join-Path $logDir "${logNameBase}_rotated_${timestampSuffix}${logExtension}"
            $counter++
        } while (Test-Path $rotatedLogFile)
        
        Move-Item $script:LoggingConfig.LogFile $rotatedLogFile -Force
        Write-MandALog "Log file rotated to: $rotatedLogFile" -Level "INFO" -Component "Logging"
        
    } catch {
        # Use Write-Host if Write-MandALog might be part of the problem or uninitialized
        Write-Host "WARNING: Failed to rotate log file: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

function Clear-OldLogFiles {
    param(
        [Parameter(Mandatory=$true)]
        [string]$LogPath
    )
    
    try {
        if ($script:LoggingConfig.LogRetentionDays -le 0) {
            Write-MandALog "Log retention is disabled (days <= 0)." -Level "DEBUG" -Component "Logging"
            return
        }

        $cutoffDate = (Get-Date).AddDays(-$script:LoggingConfig.LogRetentionDays)
        # Consider all log file types this module might create
        $logPatterns = @("*.log", "*.structured.json", "*.metrics.json")
        $oldLogFilesTotal = 0

        foreach ($pattern in $logPatterns) {
            $oldLogFiles = Get-ChildItem -Path $LogPath -Filter $pattern -File -ErrorAction SilentlyContinue | 
                           Where-Object { $_.LastWriteTime -lt $cutoffDate }
            
            if ($oldLogFiles) {
                foreach ($oldLog in $oldLogFiles) {
                    try {
                        Remove-Item $oldLog.FullName -Force -ErrorAction Stop
                        # Avoid Write-MandALog for this internal cleanup action to prevent log noise/loops
                        # For debugging, Write-Host could be used if needed.
                        # Write-Host "DEBUG: Removed old log file: $($oldLog.Name)" -ForegroundColor Gray
                        $oldLogFilesTotal++
                    } catch {
                        Write-Warning "Could not remove old log file $($oldLog.FullName): $($_.Exception.Message)"
                    }
                }
            }
        }
        
        if ($oldLogFilesTotal -gt 0) {
            Write-MandALog "Cleaned up $oldLogFilesTotal old log file(s) from $LogPath" -Level "INFO" -Component "Logging"
        }
        
    } catch {
        Write-Warning "Failed to cleanup old log files from '$LogPath': $($_.Exception.Message)"
    }
}

function Get-LoggingConfiguration {
    # Return a clone to prevent external modification of the script's config object
    return $script:LoggingConfig.Clone()
}

function Set-LogLevel {
    param(
        [Parameter(Mandatory=$true)]
        [ValidateSet("DEBUG", "INFO", "WARN", "ERROR")]
        [string]$Level
    )
    
    $oldLevel = $script:LoggingConfig.LogLevel
    $script:LoggingConfig.LogLevel = $Level
    Write-MandALog "Log level changed from '$oldLevel' to '$Level'" -Level "INFO" -Component "Logging"
}

function Set-LoggingOptions {
    param(
        [Parameter(Mandatory=$false)]
        [AllowNull()] # Allow $null to not change the setting
        [bool]$UseEmojis,
        
        [Parameter(Mandatory=$false)]
        [AllowNull()]
        [bool]$UseColors,
        
        [Parameter(Mandatory=$false)]
        [AllowNull()]
        [bool]$ShowTimestamp,
        
        [Parameter(Mandatory=$false)]
        [AllowNull()]
        [bool]$ShowComponent,

        [Parameter(Mandatory=$false)]
        [AllowNull()]
        [bool]$EnableJsonLogging,

        [Parameter(Mandatory=$false)]
        [AllowNull()]
        [bool]$EnableMetrics
    )
    
    $changes = [System.Collections.Generic.List[string]]::new()

    if ($PSBoundParameters.ContainsKey('UseEmojis')) {
        $script:LoggingConfig.UseEmojis = $UseEmojis
        $changes.Add("UseEmojis=$UseEmojis")
    }
    if ($PSBoundParameters.ContainsKey('UseColors')) {
        $script:LoggingConfig.UseColors = $UseColors
        $changes.Add("UseColors=$UseColors")
    }
    if ($PSBoundParameters.ContainsKey('ShowTimestamp')) {
        $script:LoggingConfig.ShowTimestamp = $ShowTimestamp
        $changes.Add("ShowTimestamp=$ShowTimestamp")
    }
    if ($PSBoundParameters.ContainsKey('ShowComponent')) {
        $script:LoggingConfig.ShowComponent = $ShowComponent
        $changes.Add("ShowComponent=$ShowComponent")
    }
    if ($PSBoundParameters.ContainsKey('EnableJsonLogging')) {
        $script:LoggingConfig.StructuredLogging.EnableJsonLogging = $EnableJsonLogging
        $changes.Add("StructuredLogging.EnableJsonLogging=$EnableJsonLogging")
    }
    if ($PSBoundParameters.ContainsKey('EnableMetrics')) {
        $script:LoggingConfig.StructuredLogging.EnableMetrics = $EnableMetrics
        $changes.Add("StructuredLogging.EnableMetrics=$EnableMetrics")
    }
    
    if ($changes.Count -gt 0) {
        Write-MandALog "Logging options updated: $($changes -join ', ')" -Level "INFO" -Component "Logging"
    } else {
        Write-MandALog "No logging options changed." -Level "DEBUG" -Component "Logging"
    }
}

# Export functions to make them available when the module is imported
Export-ModuleMember -Function @(
    'Initialize-Logging',
    'Write-MandALog',
    'Write-StructuredLog',
    'Write-PerformanceMetric',
    'Get-LogErrorSummary',
    'Write-ProgressBar',
    'Write-StatusTable',
    'Write-SectionHeader',
    'Write-CompletionSummary',
    'Get-LoggingConfiguration',
    'Set-LogLevel',
    'Set-LoggingOptions',
    'Clear-OldLogFiles', # Added Clear-OldLogFiles as it's called by Initialize-Logging
    'Test-LogMessage',   # Helper, might be useful to export for testing
    'Get-LogColor',      # Helper, might be useful
    'Get-LogEmoji'       # Helper, might be useful
)

Write-MandALog "EnhancedLogging.psm1 module processed." -Level "DEBUG" -Component "Logging"
