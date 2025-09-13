# Simple M&A Discovery Suite Monitor
Write-Host "=== M&A DISCOVERY SUITE MONITORING ACTIVE ===" -ForegroundColor Green
Write-Host "Monitoring logs for defects..." -ForegroundColor Yellow
Write-Host "Navigate through the application now!" -ForegroundColor Cyan
Write-Host ""

$LogDir = "C:\discoverydata\ljpops\Logs"
$DefectCount = 2  # Starting with 2 defects already found

while ($true) {
    Start-Sleep -Seconds 3

    # Monitor main log for new exceptions
    $MainLog = Get-ChildItem "$LogDir\MandADiscovery_*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($MainLog) {
        $RecentLines = Get-Content $MainLog.FullName -Tail 5 -ErrorAction SilentlyContinue
        foreach ($Line in $RecentLines) {
            if ($Line -match "Exception|Error|Failed") {
                $DefectCount++
                Write-Host "🔴 DEFECT #$DefectCount`: $Line" -ForegroundColor Red
                Add-Content "$LogDir\defects-discovered.log" -Value "`n=== DEFECT #$DefectCount ===`nTimestamp: $(Get-Date)`nDescription: $Line`nStatus: NEW`n---"
            }
        }
    }

    # Monitor GUI clicks for errors
    $ClicksLog = "$LogDir\gui-clicks.log"
    if (Test-Path $ClicksLog) {
        $RecentClicks = Get-Content $ClicksLog -Tail 3 -ErrorAction SilentlyContinue
        foreach ($Click in $RecentClicks) {
            Write-Host "💡 GUI Activity: $Click" -ForegroundColor Cyan
        }
    }

    # Status update every 30 seconds
    if ((Get-Date).Second % 30 -eq 0) {
        Write-Host "📊 Status: $DefectCount defects detected | $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Yellow
    }
}