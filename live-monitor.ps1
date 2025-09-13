# Live M&A Discovery Suite Monitoring Script
# Monitors logs in real-time and collects defects

param(
    [string]$LogDir = "C:\discoverydata\ljpops\Logs",
    [string]$MonitorDuration = "300", # 5 minutes
    [switch]$ContinuousMode = $true
)

$ErrorActionPreference = "Continue"
$StartTime = Get-Date
$DefectFile = "$LogDir\defects-discovered.log"
$MonitoringLog = "$LogDir\live-monitoring-session.log"

# Initialize monitoring
Write-Host "=== M&A DISCOVERY SUITE LIVE MONITORING ACTIVE ===" -ForegroundColor Green
Write-Host "Start Time: $StartTime" -ForegroundColor Cyan
Write-Host "Log Directory: $LogDir" -ForegroundColor Yellow
Write-Host "Defect Log: $DefectFile" -ForegroundColor Yellow
Write-Host ""

# Initialize defect tracking
$DefectCounter = 0
$ErrorPatterns = @{
    "CRITICAL_EXCEPTION" = "Exception|Error|Fatal"
    "BINDING_ERROR" = "BindingExpression|Cannot find governing FrameworkElement|path error"
    "XAML_ERROR" = "XamlParseException|StaticResourceExtension|Cannot find resource"
    "MODULE_LOADING" = "ModuleLoader.*Error|DiscoveryModule.*failed|CSV.*not found"
    "NAVIGATION_ERROR" = "Navigation.*failed|ViewRegistry.*error|Route.*not found"
    "PERFORMANCE_WARNING" = "timeout|memory|slow|performance"
    "DATA_ERROR" = "CSV.*error|Data.*corrupt|Schema.*mismatch"
}

function Write-MonitoringEntry {
    param($Message, $Level = "INFO")
    $Timestamp = Get-Date -Format "HH:mm:ss"
    $Entry = "[$Timestamp] [$Level] $Message"
    Write-Host $Entry -ForegroundColor $(
        switch($Level) {
            "ERROR" { "Red" }
            "WARNING" { "Yellow" }
            "DEFECT" { "Magenta" }
            default { "White" }
        }
    )
    Add-Content -Path $MonitoringLog -Value $Entry -ErrorAction SilentlyContinue
}

function Record-Defect {
    param($Type, $Description, $Source, $Details = "")
    $script:DefectCounter++
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

    $Priority = switch -Regex ($Type) {
        "CRITICAL|EXCEPTION" { "HIGH" }
        "WARNING|BINDING" { "MEDIUM" }
        default { "LOW" }
    }

    $DefectEntry = @"
=== DEFECT #$DefectCounter ===
Timestamp: $Timestamp
Type: $Type
Priority: $Priority
Description: $Description
Source: $Source
Details: $Details
Status: NEW
---

"@

    Add-Content -Path $DefectFile -Value $DefectEntry -ErrorAction SilentlyContinue
    Write-MonitoringEntry "DEFECT #$DefectCounter: $Type - $Description" "DEFECT"
}

# Get latest log files
$LogFiles = @{
    "MainLog" = Get-ChildItem "$LogDir\MandADiscovery_*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    "StructuredLog" = Get-ChildItem "$LogDir\structured_log_*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    "AppLog" = Get-ChildItem "$LogDir\Application\app_log_*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    "ClicksLog" = Get-Item "$LogDir\gui-clicks.log" -ErrorAction SilentlyContinue
}

Write-MonitoringEntry "Monitoring targets identified:"
foreach ($LogType in $LogFiles.Keys) {
    if ($LogFiles[$LogType]) {
        Write-MonitoringEntry "  $LogType`: $($LogFiles[$LogType].FullName)"
    }
}

Write-Host ""
Write-Host "🔍 MONITORING ACTIVE - Navigate the application now!" -ForegroundColor Green
Write-Host "🚨 Real-time defect detection in progress..." -ForegroundColor Yellow
Write-Host ""

# Monitor for the specified duration or continuously
$EndTime = $StartTime.AddSeconds([int]$MonitorDuration)

try {
    while ($ContinuousMode -or (Get-Date) -lt $EndTime) {
        Start-Sleep -Seconds 2

        # Check each log file for new content
        foreach ($LogType in $LogFiles.Keys) {
            $LogFile = $LogFiles[$LogType]
            if (-not $LogFile -or -not (Test-Path $LogFile.FullName)) { continue }

            try {
                # Get recent content (last 10 lines)
                $RecentContent = Get-Content $LogFile.FullName -Tail 10 -ErrorAction SilentlyContinue

                if ($RecentContent) {
                    foreach ($Line in $RecentContent) {
                        # Check for error patterns
                        foreach ($PatternType in $ErrorPatterns.Keys) {
                            if ($Line -match $ErrorPatterns[$PatternType]) {
                                Record-Defect $PatternType $Line $LogFile.FullName $Line
                            }
                        }

                        # Special handling for GUI clicks
                        if ($LogType -eq "ClicksLog" -and $Line -match "ERROR|Exception|Failed") {
                            Record-Defect "GUI_INTERACTION_ERROR" $Line $LogFile.FullName $Line
                        }
                    }
                }
            }
            catch {
                Write-MonitoringEntry "Error reading $LogType`: $_" "WARNING"
            }
        }

        # Display current status
        if ((Get-Date).Second % 30 -eq 0) {  # Every 30 seconds
            Write-Host "📊 Monitoring Status: $DefectCounter defects detected | $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
        }
    }
}
catch {
    Write-MonitoringEntry "Monitoring error: $_" "ERROR"
}
finally {
    Write-Host ""
    Write-Host "=== MONITORING SESSION COMPLETE ===" -ForegroundColor Green
    Write-Host "Total Defects Detected: $DefectCounter" -ForegroundColor Yellow
    Write-Host "Defect Log: $DefectFile" -ForegroundColor Yellow
    Write-Host "Monitoring Log: $MonitoringLog" -ForegroundColor Yellow
    Write-Host ""
}