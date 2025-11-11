param(
    [int]$TestDurationMinutes = 5
)

Write-Host "Discovery Dashboard Live Testing" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host "Duration: $TestDurationMinutes minutes" -ForegroundColor White
Write-Host ""

# Check if GUI is running
$guiProcess = Get-Process MandADiscoverySuite -ErrorAction SilentlyContinue
if (-not $guiProcess) {
    Write-Host "[ERROR] MandADiscoverySuite is not running" -ForegroundColor Red
    Write-Host "Please start the GUI application first" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] GUI application is running (PID: $($guiProcess.Id))" -ForegroundColor Green

# Monitor log files for Discovery Dashboard activity
$logPaths = @(
    "C:\DiscoveryData\ljpops\Logs\gui-debug.log",
    "C:\DiscoveryData\ljpops\Logs\Application\app_log_20250815.json"
)

Write-Host "`nMonitoring Dashboard Activity..." -ForegroundColor Yellow
Write-Host "Looking for Discovery-related log entries..." -ForegroundColor Gray

$testStart = Get-Date
$discoveries = @()

# Create a function to parse JSON log entries
function Get-RecentLogEntries {
    param($LogPath, $Minutes = 5)
    
    if ($LogPath -like "*.json") {
        try {
            $content = Get-Content $LogPath -Raw -ErrorAction SilentlyContinue
            if ($content) {
                $entries = ($content | ConvertFrom-Json) | Where-Object { 
                    $_.timestamp -gt (Get-Date).AddMinutes(-$Minutes) -and
                    ($_.message -like "*Discovery*" -or $_.category -like "*Discovery*")
                }
                return $entries
            }
        } catch {
            # Skip JSON parsing errors
        }
    } else {
        try {
            $entries = Get-Content $LogPath -Tail 100 -ErrorAction SilentlyContinue | 
                Where-Object { $_ -like "*Discovery*" }
            return $entries
        } catch {
            # Skip file access errors
        }
    }
    return @()
}

# Monitor for test duration
$endTime = $testStart.AddMinutes($TestDurationMinutes)

while ((Get-Date) -lt $endTime) {
    # Check for recent Discovery activity
    foreach ($logPath in $logPaths) {
        $recentEntries = Get-RecentLogEntries -LogPath $logPath -Minutes 1
        
        foreach ($entry in $recentEntries) {
            if ($entry -is [string]) {
                Write-Host "[LOG] $entry" -ForegroundColor Gray
            } else {
                Write-Host "[LOG] $($entry.timestamp): $($entry.message)" -ForegroundColor Gray
            }
        }
    }
    
    # Check for Discovery module processes
    $discoveryProcesses = Get-Process powershell -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*DiscoveryModuleLauncher*" }
    
    if ($discoveryProcesses) {
        foreach ($proc in $discoveryProcesses) {
            Write-Host "[DISCOVERY] PowerShell process running (PID: $($proc.Id))" -ForegroundColor Yellow
        }
    }
    
    # Check for new CSV files
    $recentCsvFiles = Get-ChildItem "C:\discoverydata\ljpops\Raw" -Filter "*.csv" -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -gt $testStart }
    
    if ($recentCsvFiles) {
        foreach ($file in $recentCsvFiles) {
            $sizeKB = [math]::Round($file.Length / 1KB, 2)
            Write-Host "[DATA] New CSV: $($file.Name) ($sizeKB KB) at $($file.LastWriteTime)" -ForegroundColor Green
            $discoveries += @{
                File = $file.Name
                Size = $sizeKB
                Time = $file.LastWriteTime
            }
        }
    }
    
    Start-Sleep -Seconds 10
}

Write-Host "`nTest Summary:" -ForegroundColor Cyan
Write-Host "=============" -ForegroundColor Cyan

# Final checks
Write-Host "`nGUI Application Status:" -ForegroundColor White
$finalGuiProcess = Get-Process MandADiscoverySuite -ErrorAction SilentlyContinue
if ($finalGuiProcess) {
    $cpuTime = $finalGuiProcess.CPU
    $memoryMB = [math]::Round($finalGuiProcess.WorkingSet64 / 1MB, 2)
    Write-Host "  Status: Running" -ForegroundColor Green
    Write-Host "  CPU Time: $cpuTime seconds" -ForegroundColor Gray
    Write-Host "  Memory: $memoryMB MB" -ForegroundColor Gray
} else {
    Write-Host "  Status: Not Running (may have crashed)" -ForegroundColor Red
}

Write-Host "`nDiscovery Activity:" -ForegroundColor White
if ($discoveries.Count -gt 0) {
    Write-Host "  CSV Files Created: $($discoveries.Count)" -ForegroundColor Green
    foreach ($discovery in $discoveries) {
        Write-Host "    - $($discovery.File) ($($discovery.Size) KB)" -ForegroundColor Gray
    }
} else {
    Write-Host "  No new CSV files detected during test" -ForegroundColor Yellow
}

# Check current data counts
Write-Host "`nCurrent Data Files:" -ForegroundColor White
$dataPath = "C:\discoverydata\ljpops\Raw"
$csvFiles = Get-ChildItem $dataPath -Filter "*.csv" -ErrorAction SilentlyContinue
if ($csvFiles) {
    $totalSizeMB = [math]::Round(($csvFiles | Measure-Object Length -Sum).Sum / 1MB, 2)
    Write-Host "  Total CSV Files: $($csvFiles.Count)" -ForegroundColor Gray
    Write-Host "  Total Size: $totalSizeMB MB" -ForegroundColor Gray
    
    # Show most recent files
    $recentFiles = $csvFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 5
    Write-Host "  Most Recent Files:" -ForegroundColor Gray
    foreach ($file in $recentFiles) {
        $sizeKB = [math]::Round($file.Length / 1KB, 2)
        Write-Host "    $($file.Name) ($sizeKB KB) - $($file.LastWriteTime)" -ForegroundColor DarkGray
    }
} else {
    Write-Host "  No CSV files found in data directory" -ForegroundColor Yellow
}

Write-Host "`nTest completed at $(Get-Date)" -ForegroundColor Green