# Live M&A Discovery Suite Monitoring Session
# Real-time log monitoring and defect collection

$LogDir = "C:\discoverydata\ljpops\Logs"
$OutputFile = "C:\discoverydata\ljpops\Logs\live-monitoring-session.log"
$DefectFile = "C:\discoverydata\ljpops\Logs\defects-discovered.log"

# Initialize monitoring session
$StartTime = Get-Date
Write-Host "=== M&A Discovery Suite Live Monitoring Session Started ===" -ForegroundColor Green
Write-Host "Start Time: $StartTime" -ForegroundColor Cyan
Write-Host "Monitoring Directory: $LogDir" -ForegroundColor Yellow
Write-Host "Defect Collection: $DefectFile" -ForegroundColor Yellow
Write-Host ""

# Initialize defect counter
$DefectCounter = 0

function Write-MonitoringLog {
    param($Message, $Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] [$Level] $Message"
    Write-Host $LogEntry -ForegroundColor $(if($Level -eq "ERROR") {"Red"} elseif($Level -eq "WARNING") {"Yellow"} else {"White"})
    Add-Content -Path $OutputFile -Value $LogEntry
}

function Record-Defect {
    param($DefectType, $Description, $LogFile, $Details)
    $script:DefectCounter++
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

    $DefectEntry = @"
=== DEFECT #$DefectCounter ===
Timestamp: $Timestamp
Type: $DefectType
Description: $Description
Source Log: $LogFile
Details: $Details
Priority: $(if($DefectType -match "CRITICAL|EXCEPTION") {"HIGH"} elseif($DefectType -match "WARNING|BINDING") {"MEDIUM"} else {"LOW"})
Status: NEW
---
"@

    Add-Content -Path $DefectFile -Value $DefectEntry
    Write-Host "🔴 DEFECT #$DefectCounter RECORDED: $DefectType - $Description" -ForegroundColor Red
}

# Define error patterns to watch for
$ErrorPatterns = @{
    "CRITICAL_EXCEPTION" = @("System\..*Exception", "NullReferenceException", "ArgumentException", "InvalidOperationException")
    "BINDING_ERROR" = @("System\.Windows\.Data Error", "BindingExpression path error", "Cannot find governing FrameworkElement")
    "XAML_ERROR" = @("XamlParseException", "StaticResourceExtension", "Cannot find resource")
    "MODULE_LOADING" = @("ModuleLoader.*Error", "DiscoveryModule.*failed", "CSV.*not found")
    "NAVIGATION_ERROR" = @("Navigation.*failed", "ViewRegistry.*error", "Route.*not found")
    "PERFORMANCE_WARNING" = @("timeout", "memory", "slow", "performance")
    "DATA_ERROR" = @("CSV.*error", "Data.*corrupt", "Schema.*mismatch")
}

Write-MonitoringLog "Monitoring patterns configured: $($ErrorPatterns.Keys -join ', ')"

# Get most recent log files for each category
$RecentAppLog = Get-ChildItem "$LogDir\Application\app_log_*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$RecentMainLog = Get-ChildItem "$LogDir\MandADiscovery_*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$RecentStructuredLog = Get-ChildItem "$LogDir\structured_log_*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$ClicksLog = "$LogDir\gui-clicks.log"

Write-MonitoringLog "Primary monitoring targets:"
Write-MonitoringLog "  Application Log: $($RecentAppLog.FullName)"
Write-MonitoringLog "  Main Log: $($RecentMainLog.FullName)"
Write-MonitoringLog "  Structured Log: $($RecentStructuredLog.FullName)"
Write-MonitoringLog "  GUI Clicks Log: $ClicksLog"

Write-Host ""
Write-Host "🔍 LIVE MONITORING ACTIVE - Watching for defects..." -ForegroundColor Green
Write-Host "📊 Navigate through the M&A Discovery Suite UI now" -ForegroundColor Cyan
Write-Host "🚨 Defects will be automatically detected and recorded" -ForegroundColor Yellow
Write-Host ""

# Function to analyze log content for patterns
function Analyze-LogContent {
    param($Content, $LogFile, $IsJson = $false)

    if ($IsJson) {
        try {
            $JsonEntries = $Content -split "`n" | Where-Object { $_.Trim() -ne "" } | ForEach-Object { $_ | ConvertFrom-Json -ErrorAction SilentlyContinue }
            foreach ($entry in $JsonEntries) {
                if ($entry.Level -eq "Error" -or $entry.Level -eq "Fatal") {
                    Record-Defect "JSON_ERROR" $entry.Message $LogFile $entry
                }
                if ($entry.Message -match "Exception") {
                    Record-Defect "EXCEPTION_DETECTED" $entry.Message $LogFile $entry
                }
            }
        } catch {
            Write-MonitoringLog "Failed to parse JSON log content: $_" "WARNING"
        }
    } else {
        foreach ($PatternType in $ErrorPatterns.Keys) {
            foreach ($Pattern in $ErrorPatterns[$PatternType]) {
                if ($Content -match $Pattern) {
                    $Matches = [regex]::Matches($Content, $Pattern)
                    foreach ($Match in $Matches) {
                        Record-Defect $PatternType $Match.Value $LogFile $Match.Value
                    }
                }
            }
        }
    }
}

Write-MonitoringLog "Monitoring session initialized. Ready for user interaction." "INFO"