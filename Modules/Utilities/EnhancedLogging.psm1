<#
.SYNOPSIS
    Enhanced logging with improved visual output for M&A Discovery Suite
.DESCRIPTION
    Provides structured logging with enhanced visual indicators and better formatting
.NOTES
    Author: Lukian Poleschtschuk
    Version: 1.1.0
    Created: 2025-06-03
    Last Modified: 2025-01-15
    Change Log: 
        - 1.1.0: Fixed to use global paths and added Context parameter support
        - Removed Unicode characters for PowerShell 5.1 compatibility
#>
$outputPath = $Context.Paths.RawDataOutput
# Global logging configuration
$script:LoggingConfig = @{
    LogLevel = "INFO"
    LogFile = $null
    ConsoleOutput = $true
    FileOutput = $true
    MaxLogSizeMB = 50
    LogRetentionDays = 30
    UseEmojis = $true
    UseColors = $true
    ShowTimestamp = $true
    ShowComponent = $true
}

function Initialize-Logging {
    param([hashtable]$Configuration)
    
    try {
        $script:LoggingConfig.LogLevel = $Configuration.environment.logLevel
        
        # Set up log file - use the global path if available
        $logPath = if ($global:MandA -and $global:MandA.Paths -and $global:MandA.Paths.LogOutput) {
            $global:MandA.Paths.LogOutput
        } elseif ($Configuration.environment.outputPath) {
            Join-Path $Configuration.environment.outputPath "Logs"
        } else {
            throw "No valid log output path found in configuration or global context"
        }
        
        if (-not (Test-Path $logPath)) {
            New-Item -Path $logPath -ItemType Directory -Force | Out-Null
        }
        
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $logFileName = "MandA_Discovery_$timestamp.log"
        $script:LoggingConfig.LogFile = Join-Path $logPath $logFileName
        
        # Update logging preferences from config
        if ($Configuration.environment.logging) {
            $script:LoggingConfig.UseEmojis = $Configuration.environment.logging.useEmojis
            $script:LoggingConfig.UseColors = $Configuration.environment.logging.useColors
            $script:LoggingConfig.ShowTimestamp = $Configuration.environment.logging.showTimestamp
            $script:LoggingConfig.ShowComponent = $Configuration.environment.logging.showComponent
            $script:LoggingConfig.MaxLogSizeMB = $Configuration.environment.logging.maxLogSizeMB
            $script:LoggingConfig.LogRetentionDays = $Configuration.environment.logging.logRetentionDays
        }
        
        # Clean up old log files
        Clear-OldLogFiles -LogPath $logPath
        
        # Write initial log entry with enhanced formatting
        Write-MandALog "M&A Discovery Suite logging initialized" -Level "SUCCESS"
        Write-MandALog "Log file: $($script:LoggingConfig.LogFile)" -Level "INFO"
        Write-MandALog "Log level: $($script:LoggingConfig.LogLevel)" -Level "INFO"
        
        return $true
        
    } catch {
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
        $Context = $null
    )
    
    # Check if message should be logged based on level
    if (-not (Test-LogMessage -Level $Level)) {
        return
    }
    
    # Try to get component from context if not specified
    if ($Component -eq "Main" -and $Context) {
        if ($Context.PSObject.Properties['CurrentPhase']) {
            $Component = $Context.CurrentPhase
        } elseif ($Context.PSObject.Properties['ModuleName']) {
            $Component = $Context.ModuleName
        }
    }
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] [$Component] $Message"
    
    # Console output with enhanced formatting
    if ($script:LoggingConfig.ConsoleOutput) {
        $color = Get-LogColor -Level $Level
        $emoji = Get-LogEmoji -Level $Level
        
        # Format message based on level
        switch ($Level) {
            "HEADER" {
                Write-Host ""
                Write-Host ("=" * 100) -ForegroundColor $color
                Write-Host "$emoji $Message" -ForegroundColor $color
                Write-Host ("=" * 100) -ForegroundColor $color
                Write-Host ""
            }
            "PROGRESS" {
                $progressMessage = if ($script:LoggingConfig.UseEmojis) { "$emoji $Message" } else { $Message }
                Write-Host $progressMessage -ForegroundColor $color
            }
            "IMPORTANT" {
                $importantMessage = if ($script:LoggingConfig.UseEmojis) { "$emoji $Message" } else { "[!] $Message" }
                Write-Host $importantMessage -ForegroundColor $color
            }
            default {
                $displayMessage = if ($script:LoggingConfig.UseEmojis) { "$emoji $Message" } else { $Message }
                if ($script:LoggingConfig.ShowTimestamp -and $Level -ne "PROGRESS") {
                    $displayMessage = "[$timestamp] $displayMessage"
                }
                Write-Host $displayMessage -ForegroundColor $color
            }
        }
    }
    
    # File output (always include full details)
    if ($script:LoggingConfig.FileOutput -and $script:LoggingConfig.LogFile) {
        try {
            # Clean message for file output (remove any special characters)
            $fileMessage = $Message
            $fileLogEntry = "[$timestamp] [$Level] [$Component] $fileMessage"
            
            Add-Content -Path $script:LoggingConfig.LogFile -Value $fileLogEntry -Encoding UTF8
            
            # Check log file size and rotate if necessary
            $logFile = Get-Item $script:LoggingConfig.LogFile -ErrorAction SilentlyContinue
            if ($logFile -and ($logFile.Length / 1MB) -gt $script:LoggingConfig.MaxLogSizeMB) {
                Move-LogFile
            }
        } catch {
            Write-Warning "Failed to write to log file: $($_.Exception.Message)"
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
        "SUCCESS" = 1
        "HEADER" = 1
        "PROGRESS" = 1
        "IMPORTANT" = 2
    }
    
    $currentLevel = $levelHierarchy[$script:LoggingConfig.LogLevel]
    $messageLevel = $levelHierarchy[$Level]
    
    return $messageLevel -ge $currentLevel
}

function Get-LogColor {
    param([string]$Level)
    
    if (-not $script:LoggingConfig.UseColors) {
        return "White"
    }
    
    switch ($Level) {
        "DEBUG" { return "Gray" }
        "INFO" { return "White" }
        "WARN" { return "Yellow" }
        "ERROR" { return "Red" }
        "SUCCESS" { return "Green" }
        "HEADER" { return "Cyan" }
        "PROGRESS" { return "Magenta" }
        "IMPORTANT" { return "Yellow" }
        default { return "White" }
    }
}

function Get-LogEmoji {
    param([string]$Level)
    
    if (-not $script:LoggingConfig.UseEmojis) {
        return ""
    }
    
    # Using ASCII equivalents instead of Unicode for PowerShell 5.1 compatibility
    switch ($Level) {
        "DEBUG" { return "[.]" }
        "INFO" { return "[i]" }
        "WARN" { return "[!]" }
        "ERROR" { return "[X]" }
        "SUCCESS" { return "[OK]" }
        "HEADER" { return "[=]" }
        "PROGRESS" { return "[~]" }
        "IMPORTANT" { return "[*]" }
        default { return "" }
    }
}

function Write-ProgressBar {
    param(
        [int]$Current,
        [int]$Total,
        [string]$Activity,
        [string]$Status = "",
        [int]$Width = 50
    )
    
    if ($Total -eq 0) { return }
    
    $percentComplete = [math]::Round(($Current / $Total) * 100, 1)
    $completed = [math]::Floor(($Current / $Total) * $Width)
    $remaining = $Width - $completed
    
    $progressBar = ("#" * $completed) + ("-" * $remaining)
    $progressText = "$Activity [$progressBar] $percentComplete% $Status"
    
    Write-Host "`r$progressText" -NoNewline -ForegroundColor Cyan
    
    if ($Current -eq $Total) {
        Write-Host ""  # New line when complete
    }
}

function Write-StatusTable {
    param(
        [hashtable]$StatusData,
        [string]$Title = "Status Summary"
    )
    
    Write-MandALog $Title -Level "HEADER"
    
    $maxKeyLength = ($StatusData.Keys | Measure-Object -Property Length -Maximum).Maximum
    $tableWidth = [math]::Max($maxKeyLength + 20, 60)
    
    Write-Host ("+" + ("-" * ($tableWidth - 2)) + "+") -ForegroundColor Gray
    
    foreach ($item in $StatusData.GetEnumerator()) {
        $key = $item.Key.PadRight($maxKeyLength)
        $value = $item.Value
        
        # Determine status color
        $statusColor = "White"
        if ($value -match "Success|Connected|PASS|OK") { $statusColor = "Green" }
        elseif ($value -match "Failed|Error|FAIL|ERROR") { $statusColor = "Red" }
        elseif ($value -match "Warning|WARN") { $statusColor = "Yellow" }
        
        Write-Host "| " -NoNewline -ForegroundColor Gray
        Write-Host $key -NoNewline -ForegroundColor White
        Write-Host " : " -NoNewline -ForegroundColor Gray
        Write-Host $value -NoNewline -ForegroundColor $statusColor
        $padding = $tableWidth - $key.Length - $value.ToString().Length - 7
        Write-Host (" " * $padding) -NoNewline
        Write-Host " |" -ForegroundColor Gray
    }
    
    Write-Host ("+" + ("-" * ($tableWidth - 2)) + "+") -ForegroundColor Gray
    Write-Host ""
}

function Write-SectionHeader {
    param(
        [string]$Title,
        [string]$Subtitle = "",
        [string]$Icon = "[SECTION]"
    )
    
    $headerText = if ($Subtitle) { "$Icon $Title - $Subtitle" } else { "$Icon $Title" }
    Write-MandALog $headerText -Level "HEADER"
}

function Write-CompletionSummary {
    param(
        [hashtable]$Summary,
        [string]$Title = "Operation Complete"
    )
    
    Write-Host ""
    Write-Host "=================================================================" -ForegroundColor Green
    Write-Host "                    $Title                    " -ForegroundColor Green
    Write-Host "=================================================================" -ForegroundColor Green
    Write-Host ""
    
    if ($Summary) {
        Write-StatusTable -StatusData $Summary -Title "Summary"
    }
}

function Move-LogFile {
    try {
        if (-not $script:LoggingConfig.LogFile -or -not (Test-Path $script:LoggingConfig.LogFile)) {
            return
        }
        
        $logDir = Split-Path $script:LoggingConfig.LogFile -Parent
        $logName = Split-Path $script:LoggingConfig.LogFile -LeafBase
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        
        $rotatedLogFile = Join-Path $logDir "${logName}_${timestamp}.log"
        Move-Item $script:LoggingConfig.LogFile $rotatedLogFile -Force
        
        Write-MandALog "Log file rotated to: $rotatedLogFile" -Level "INFO"
        
    } catch {
        Write-Warning "Failed to rotate log file: $($_.Exception.Message)"
    }
}

function Clear-OldLogFiles {
    param([string]$LogPath)
    
    try {
        $cutoffDate = (Get-Date).AddDays(-$script:LoggingConfig.LogRetentionDays)
        $oldLogFiles = Get-ChildItem -Path $LogPath -Filter "*.log" | Where-Object { $_.LastWriteTime -lt $cutoffDate }
        
        foreach ($oldLog in $oldLogFiles) {
            Remove-Item $oldLog.FullName -Force
            Write-MandALog "Removed old log file: $($oldLog.Name)" -Level "DEBUG"
        }
        
        if ($oldLogFiles.Count -gt 0) {
            Write-MandALog "Cleaned up $($oldLogFiles.Count) old log files" -Level "INFO"
        }
        
    } catch {
        Write-Warning "Failed to cleanup old log files: $($_.Exception.Message)"
    }
}

function Get-LoggingConfiguration {
    return $script:LoggingConfig.Clone()
}

function Set-LogLevel {
    param(
        [ValidateSet("DEBUG", "INFO", "WARN", "ERROR")]
        [string]$Level
    )
    
    $script:LoggingConfig.LogLevel = $Level
    Write-MandALog "Log level changed to: $Level" -Level "INFO"
}

function Set-LoggingOptions {
    param(
        [bool]$UseEmojis = $true,
        [bool]$UseColors = $true,
        [bool]$ShowTimestamp = $true,
        [bool]$ShowComponent = $true
    )
    
    $script:LoggingConfig.UseEmojis = $UseEmojis
    $script:LoggingConfig.UseColors = $UseColors
    $script:LoggingConfig.ShowTimestamp = $ShowTimestamp
    $script:LoggingConfig.ShowComponent = $ShowComponent
    
    Write-MandALog "Logging options updated" -Level "INFO"
}

# Export functions
Export-ModuleMember -Function @(
    'Initialize-Logging',
    'Write-MandALog',
    'Write-ProgressBar',
    'Write-StatusTable',
    'Write-SectionHeader',
    'Write-CompletionSummary',
    'Get-LoggingConfiguration',
    'Set-LogLevel',
    'Set-LoggingOptions'
)