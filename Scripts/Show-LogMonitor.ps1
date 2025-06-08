param(
    [string]$CompanyName,
    [string]$LogPath
)

# Set window title
$Host.UI.RawUI.WindowTitle = "M&A Discovery Suite - Log Monitor ($CompanyName)"

# Function to get log files
function Get-LogFiles {
    param([string]$Path)
    
    if (-not (Test-Path $Path)) {
        return @()
    }
    
    return Get-ChildItem "$Path\*.log" -ErrorAction SilentlyContinue | 
           Sort-Object LastWriteTime -Descending
}

# Function to tail log file
function Show-LogTail {
    param(
        [string]$FilePath,
        [int]$Lines = 100
    )
    
    if (-not (Test-Path $FilePath)) {
        return @()
    }
    
    try {
        $content = Get-Content $FilePath -Tail $Lines -ErrorAction SilentlyContinue
        return $content
    } catch {
        return @("Error reading log file: $_")
    }
}

# Function to colorize log lines
function Write-ColorizedLog {
    param([string]$Line)
    
    if ($Line -match '\[ERROR\]|\[CRITICAL\]|\[XX\]') {
        Write-Host $Line -ForegroundColor Red
    }
    elseif ($Line -match '\[WARN\]|\[WARNING\]') {
        Write-Host $Line -ForegroundColor Yellow
    }
    elseif ($Line -match '\[SUCCESS\]|\[OK\]') {
        Write-Host $Line -ForegroundColor Green
    }
    elseif ($Line -match '\[DEBUG\]') {
        Write-Host $Line -ForegroundColor Gray
    }
    elseif ($Line -match '\[HEADER\]') {
        Write-Host $Line -ForegroundColor Cyan
    }
    elseif ($Line -match '\[INFO\]') {
        Write-Host $Line -ForegroundColor White
    }
    else {
        Write-Host $Line -ForegroundColor DarkGray
    }
}

$lastLogFile = $null
$lastLogSize = 0
$refreshCount = 0

while ($true) {
    $refreshCount++
    Clear-Host
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "    M&A DISCOVERY SUITE - LOG MONITOR   " -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Company: $CompanyName" -ForegroundColor White
    Write-Host "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
    Write-Host "Log Path: $LogPath" -ForegroundColor DarkGray
    Write-Host "Refresh Count: $refreshCount" -ForegroundColor DarkGray
    Write-Host ""
    
    # Get current log files
    $logFiles = Get-LogFiles -Path $LogPath
    
    if ($logFiles.Count -eq 0) {
        Write-Host "No log files found. Waiting for discovery to start..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Expected log location: $LogPath" -ForegroundColor DarkGray
        Write-Host ""
        Write-Host "Troubleshooting:" -ForegroundColor Yellow
        Write-Host "  1. Ensure the M&A Discovery Suite is running" -ForegroundColor Gray
        Write-Host "  2. Check if the log directory exists: $(Test-Path $LogPath)" -ForegroundColor Gray
        Write-Host "  3. Verify logging is initialized in the orchestrator" -ForegroundColor Gray
    }
    else {
        # Get the most recent log file
        $currentLogFile = $logFiles[0]
        $currentAge = (Get-Date) - $currentLogFile.LastWriteTime
        
        # Check if we have a new log file
        if ($lastLogFile -ne $currentLogFile.FullName) {
            $lastLogFile = $currentLogFile.FullName
            $lastLogSize = $currentLogFile.Length
            Write-Host ">>> NEW LOG FILE DETECTED: $($currentLogFile.Name) <<<" -ForegroundColor Green
        }
        # Check if current log file has grown
        elseif ($currentLogFile.Length -gt $lastLogSize) {
            $lastLogSize = $currentLogFile.Length
            Write-Host ">>> LOG FILE UPDATED (New data detected) <<<" -ForegroundColor Green
        }
        
        Write-Host "Active Log Files:" -ForegroundColor Yellow
        foreach ($file in $logFiles | Select-Object -First 5) {
            $age = (Get-Date) - $file.LastWriteTime
            $status = if ($age.TotalMinutes -lt 2) { "[ACTIVE]" }
                     elseif ($age.TotalMinutes -lt 10) { "[RECENT]" }
                     else { "[IDLE]" }
            $color = if ($age.TotalMinutes -lt 2) { "Green" }
                    elseif ($age.TotalMinutes -lt 10) { "Yellow" }
                    else { "Gray" }
            
            $ageText = if ($age.TotalMinutes -lt 1) {
                "$([math]::Round($age.TotalSeconds))s ago"
            } else {
                "$([math]::Round($age.TotalMinutes))m ago"
            }
            
            Write-Host ("  {0,-35} {1,8} {2,10} {3}" -f $file.Name,
                       $([math]::Round($file.Length/1KB, 1).ToString() + " KB"),
                       $status,
                       $ageText) -ForegroundColor $color
        }
        
        Write-Host ""
        if ($currentAge.TotalMinutes -gt 5) {
            Write-Host "WARNING: Most recent log file is $([math]::Round($currentAge.TotalMinutes)) minutes old!" -ForegroundColor Red
            Write-Host "The discovery process may not be running or logging may be disabled." -ForegroundColor Yellow
            Write-Host ""
        }
        
        Write-Host "Recent Log Entries (Last 100 lines from $($currentLogFile.Name)):" -ForegroundColor Cyan
        Write-Host ("-" * 80) -ForegroundColor DarkGray
        
        # Show tail of most recent log
        $logLines = Show-LogTail -FilePath $currentLogFile.FullName -Lines 100
        
        if ($logLines.Count -eq 0) {
            Write-Host "  (Log file is empty or unreadable)" -ForegroundColor DarkGray
        }
        else {
            foreach ($line in $logLines) {
                if (-not [string]::IsNullOrWhiteSpace($line)) {
                    Write-ColorizedLog -Line $line
                }
            }
        }
    }
    
    Write-Host ""
    Write-Host ("-" * 80) -ForegroundColor DarkGray
    Write-Host "Press Ctrl+C to exit | Auto-refresh every 3 seconds" -ForegroundColor DarkGray
    
    Start-Sleep -Seconds 3
}