# Log Monitoring Script for M&A Discovery Suite
$ErrorActionPreference = 'Continue'
$logPath = 'C:\discoverydata\ljpops\Logs'
$mainLog = Join-Path $logPath 'MandADiscovery_20250913_153657.log'
$guiLog = Join-Path $logPath 'gui-clicks.log'
$structuredLog = Join-Path $logPath 'structured_log_20250913.log'
$defectLogPath = Join-Path $logPath 'defect_monitoring_20250913.csv'

# Ensure the defect log starts with headers
'Timestamp,SourceFile,Severity,Module,ErrorType,FullEntry' | Out-File $defectLogPath -Encoding UTF8

# Function to check and log defects
function Check-LogDefects {
    param($logFile, $sourceFileName)

    $content = Get-Content $logFile | Where-Object {
        $_ -match 'ERROR|EXCEPTION|WARNING|CRITICAL|XAML Binding|Color parsing|Resource loading'
    }

    foreach ($line in $content) {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $severity = 'INFO'
        $module = 'Unknown'
        $errorType = 'Standard Log'

        # Error type detection
        if ($line -match 'ERROR|EXCEPTION|CRITICAL') {
            $severity = 'ERROR'
            $errorType = 'System Error'
        }
        elseif ($line -match 'WARNING') {
            $severity = 'WARNING'
            $errorType = 'Potential Issue'
        }

        # Module extraction
        if ($line -match 'Module:(\w+)') {
            $module = $matches[1]
        }

        # Specific error type checks
        if ($line -match 'XAML Binding Error') {
            $errorType = 'XAML Binding Failure'
        }
        elseif ($line -match 'Color parsing') {
            $errorType = 'Color Parsing Exception'
        }
        elseif ($line -match 'Resource loading') {
            $errorType = 'Resource Loading Problem'
        }

        # Prepare CSV entry and log
        $csvEntry = "`"$timestamp`",`"$sourceFileName`",`"$severity`",`"$module`",`"$errorType`",`"$($line -replace '`"','``"')`""
        $csvEntry | Out-File $defectLogPath -Append -Encoding UTF8
        Write-Host ('[DEFECT] ' + $csvEntry)
    }
}

# Continuously monitor log files
while ($true) {
    Check-LogDefects -logFile $mainLog -sourceFileName 'MandADiscovery_20250913_153657.log'
    Check-LogDefects -logFile $guiLog -sourceFileName 'gui-clicks.log'
    Check-LogDefects -logFile $structuredLog -sourceFileName 'structured_log_20250913.log'

    # Wait for a short time before checking again
    Start-Sleep -Seconds 5
}