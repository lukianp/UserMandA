# M&A Discovery Suite - Live Log Monitoring Script
# Version: 1.0
# Date: 2025-09-13

# Configuration
$LogBasePath = "C:\discoverydata\ljpops\Logs\"
$OutputPath = "D:\Scripts\UserMandA\LogMonitoring\defect-tracking.json"
$ErrorTypes = @(
    "XAML Binding Error",
    "Module Loading Failure",
    "Navigation Exception",
    "Performance Warning",
    "Resource Loading Problem"
)

# Defect tracking class
class LogDefect {
    [datetime]$Timestamp
    [string]$LogFile
    [string]$ErrorType
    [string]$Module
    [string]$ErrorMessage
    [string]$StackTrace
    [string]$UserAction
}

# Find the most recent log files
$MandADiscoveryLog = Get-ChildItem $LogBasePath -Filter "MandADiscovery_*.log" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

$GuiClicksLog = Get-ChildItem $LogBasePath -Filter "gui-clicks.log" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

$StructuredLog = Get-ChildItem $LogBasePath -Filter "structured_log_*.log" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

# Initialize defect tracking
$defects = @()

# Log monitoring function
function Monitor-Logs {
    param(
        [string]$MandADiscoveryPath,
        [string]$GuiClicksPath,
        [string]$StructuredLogPath
    )

    # Stream reader for each log
    $mandaReader = New-Object System.IO.StreamReader(
        New-Object System.IO.FileStream($MandADiscoveryPath,
        [System.IO.FileMode]::Open,
        [System.IO.FileAccess]::Read,
        [System.IO.FileShare]::ReadWrite)
    )

    $guiReader = New-Object System.IO.StreamReader(
        New-Object System.IO.FileStream($GuiClicksPath,
        [System.IO.FileMode]::Open,
        [System.IO.FileAccess]::Read,
        [System.IO.FileShare]::ReadWrite)
    )

    $structuredReader = New-Object System.IO.StreamReader(
        New-Object System.IO.FileStream($StructuredLogPath,
        [System.IO.FileMode]::Open,
        [System.IO.FileAccess]::Read,
        [System.IO.FileShare]::ReadWrite)
    )

    # Move to end of files
    $mandaReader.ReadToEnd() | Out-Null
    $guiReader.ReadToEnd() | Out-Null
    $structuredReader.ReadToEnd() | Out-Null

    # Continuous monitoring
    while ($true) {
        # Check MandA Discovery Log
        $mandaLine = $mandaReader.ReadLine()
        if ($mandaLine) {
            foreach ($errorType in $ErrorTypes) {
                if ($mandaLine -match $errorType) {
                    $defect = [LogDefect]@{
                        Timestamp = (Get-Date)
                        LogFile = $MandADiscoveryPath
                        ErrorType = $errorType
                        ErrorMessage = $mandaLine
                    }
                    $defects += $defect
                    $defect | ConvertTo-Json | Add-Content $OutputPath
                }
            }
        }

        # Check GUI Clicks Log
        $guiLine = $guiReader.ReadLine()
        if ($guiLine) {
            # Capture user actions
        }

        # Check Structured Log
        $structuredLine = $structuredReader.ReadLine()
        if ($structuredLine) {
            # Parse structured events
        }

        # Small sleep to prevent high CPU usage
        Start-Sleep -Milliseconds 100
    }
}

# Start monitoring
Monitor-Logs `
    -MandADiscoveryPath $MandADiscoveryLog.FullName `
    -GuiClicksPath $GuiClicksLog.FullName `
    -StructuredLogPath $StructuredLog.FullName