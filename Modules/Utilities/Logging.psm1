<#
.SYNOPSIS
    Centralized logging for M&A Discovery Suite
.DESCRIPTION
    Provides structured logging with multiple output targets and log levels
#>

# Global logging configuration
$script:LoggingConfig = @{
    LogLevel = "INFO"
    LogFile = $null
    ConsoleOutput = $true
    FileOutput = $true
    MaxLogSizeMB = 50
    LogRetentionDays = 30
}

function Initialize-Logging {
    param([hashtable]$Configuration)
    
    try {
        $script:LoggingConfig.LogLevel = $Configuration.environment.logLevel
        
        # Set up log file
        $logPath = Join-Path $Configuration.environment.outputPath "Logs"
        if (-not (Test-Path $logPath)) {
            New-Item -Path $logPath -ItemType Directory -Force | Out-Null
        }
        
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $logFileName = "MandA_Discovery_$timestamp.log"
        $script:LoggingConfig.LogFile = Join-Path $logPath $logFileName
        
        # Clean up old log files
        Cleanup-OldLogFiles -LogPath $logPath
        
        # Write initial log entry
        Write-MandALog "M&A Discovery Suite logging initialized" -Level "INFO"
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
        [ValidateSet("DEBUG", "INFO", "WARN", "ERROR", "SUCCESS", "HEADER")]
        [string]$Level = "INFO",
        
        [Parameter(Mandatory=$false)]
        [string]$Component = "Main"
    )
    
    # Check if message should be logged based on level
    if (-not (Should-LogMessage -Level $Level)) {
        return
    }
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] [$Component] $Message"
    
    # Console output with colors
    if ($script:LoggingConfig.ConsoleOutput) {
        $color = Get-LogColor -Level $Level
        
        if ($Level -eq "HEADER") {
            Write-Host ""
            Write-Host "=" * 80 -ForegroundColor $color
            Write-Host $Message -ForegroundColor $color
            Write-Host "=" * 80 -ForegroundColor $color
            Write-Host ""
        } else {
            Write-Host $logEntry -ForegroundColor $color
        }
    }
    
    # File output
    if ($script:LoggingConfig.FileOutput -and $script:LoggingConfig.LogFile) {
        try {
            Add-Content -Path $script:LoggingConfig.LogFile -Value $logEntry -Encoding UTF8
            
            # Check log file size and rotate if necessary
            $logFile = Get-Item $script:LoggingConfig.LogFile -ErrorAction SilentlyContinue
            if ($logFile -and ($logFile.Length / 1MB) -gt $script:LoggingConfig.MaxLogSizeMB) {
                Rotate-LogFile
            }
        } catch {
            Write-Warning "Failed to write to log file: $($_.Exception.Message)"
        }
    }
}

function Should-LogMessage {
    param([string]$Level)
    
    $levelHierarchy = @{
        "DEBUG" = 0
        "INFO" = 1
        "WARN" = 2
        "ERROR" = 3
        "SUCCESS" = 1
        "HEADER" = 1
    }
    
    $currentLevel = $levelHierarchy[$script:LoggingConfig.LogLevel]
    $messageLevel = $levelHierarchy[$Level]
    
    return $messageLevel -ge $currentLevel
}

function Get-LogColor {
    param([string]$Level)
    
    switch ($Level) {
        "DEBUG" { return "Gray" }
        "INFO" { return "White" }
        "WARN" { return "Yellow" }
        "ERROR" { return "Red" }
        "SUCCESS" { return "Green" }
        "HEADER" { return "Cyan" }
        default { return "White" }
    }
}

function Rotate-LogFile {
    try {
        if (-not $script:LoggingConfig.LogFile -or -not (Test-Path $script:LoggingConfig.LogFile)) {
            return
        }
        
        $logDir = Split-Path $script:LoggingConfig.LogFile -Parent
        $logName = Split-Path $script:LoggingConfig.LogFile -LeafBase
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        
        $rotatedLogFile = Join-Path $logDir "$logName`_$timestamp.log"
        Move-Item $script:LoggingConfig.LogFile $rotatedLogFile -Force
        
        Write-MandALog "Log file rotated to: $rotatedLogFile" -Level "INFO"
        
    } catch {
        Write-Warning "Failed to rotate log file: $($_.Exception.Message)"
    }
}

function Cleanup-OldLogFiles {
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

# Export functions
Export-ModuleMember -Function @(
    'Initialize-Logging',
    'Write-MandALog',
    'Get-LoggingConfiguration',
    'Set-LogLevel'
)