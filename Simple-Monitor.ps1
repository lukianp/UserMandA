# Simple Debug Monitor for M&A Discovery Suite
param([int]$RefreshMs = 1000)

Write-Host "=== M&A DISCOVERY SUITE - SIMPLE MONITOR ===" -ForegroundColor Cyan
Write-Host "Time Started: $(Get-Date)" -ForegroundColor Green
Write-Host ""

$logPath = "C:\DiscoveryData\ljpops\Logs\MandADiscovery_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$lastSize = 0

# Check if app is running
$process = Get-Process MandADiscoverySuite -ErrorAction SilentlyContinue
if ($process) {
    Write-Host "✓ Application Status: RUNNING (PID: $($process.Id))" -ForegroundColor Green
} else {
    Write-Host "✗ Application Status: NOT RUNNING" -ForegroundColor Red
}

Write-Host ""
Write-Host "Monitoring for user interactions..." -ForegroundColor White
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

while ($true) {
    $timestamp = Get-Date -Format "HH:mm:ss.fff"
    
    # Find most recent log file
    $logFiles = Get-ChildItem "C:\DiscoveryData\ljpops\Logs\MandADiscovery_*.log" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
    if ($logFiles) {
        $logFile = $logFiles[0].FullName
        if (Test-Path $logFile) {
            $currentSize = (Get-Item $logFile).Length
            if ($currentSize -gt $lastSize) {
                $newContent = Get-Content $logFile -Tail 10 -ErrorAction SilentlyContinue
                foreach ($line in $newContent) {
                    if ($line -and $line.Trim() -ne "") {
                        Write-Host "[$timestamp] $line" -ForegroundColor Yellow
                    }
                }
                $lastSize = $currentSize
            }
        }
    }
    
    # Check if app is still running
    $process = Get-Process MandADiscoverySuite -ErrorAction SilentlyContinue
    if (-not $process) {
        Write-Host "[$timestamp] APPLICATION STOPPED!" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds $RefreshMs
}