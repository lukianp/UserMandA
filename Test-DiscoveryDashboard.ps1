param(
    [string]$ModuleName = "ActiveDirectoryDiscovery"
)

Write-Host "Testing Discovery Dashboard Module Execution" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Test if the launcher script exists
$launcherPath = "D:\Scripts\UserMandA\Scripts\DiscoveryModuleLauncher.ps1"
if (Test-Path $launcherPath) {
    Write-Host "[OK] Launcher script found at: $launcherPath" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Launcher script not found at: $launcherPath" -ForegroundColor Red
    exit 1
}

# Test if the module exists
$modulePath = "D:\Scripts\UserMandA\Modules\Discovery\$ModuleName.psm1"
if (Test-Path $modulePath) {
    Write-Host "[OK] Module found at: $modulePath" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Module not found at: $modulePath" -ForegroundColor Red
    exit 1
}

# Test module execution
Write-Host "`nTesting module execution for: $ModuleName" -ForegroundColor Yellow
Write-Host "Command: powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$launcherPath`" -ModuleName `"$ModuleName`" -CompanyName `"ljpops`"" -ForegroundColor Gray

# Execute the module
try {
    $process = Start-Process -FilePath "powershell.exe" `
        -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "`"$launcherPath`"", "-ModuleName", "`"$ModuleName`"", "-CompanyName", "`"ljpops`"" `
        -WorkingDirectory "C:\enterprisediscovery" `
        -PassThru `
        -WindowStyle Normal
    
    Write-Host "[OK] Module process started with PID: $($process.Id)" -ForegroundColor Green
    
    # Wait for completion or timeout after 30 seconds
    $timeout = 30
    $waited = 0
    while (!$process.HasExited -and $waited -lt $timeout) {
        Start-Sleep -Seconds 1
        $waited++
        Write-Host "." -NoNewline
    }
    Write-Host ""
    
    if ($process.HasExited) {
        if ($process.ExitCode -eq 0) {
            Write-Host "[OK] Module completed successfully" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Module failed with exit code: $($process.ExitCode)" -ForegroundColor Red
        }
    } else {
        Write-Host "[TIMEOUT] Module is still running after $timeout seconds" -ForegroundColor Yellow
        Write-Host "Process ID $($process.Id) is still active" -ForegroundColor Yellow
    }
    
    # Check for output files
    $outputPath = "C:\discoverydata\ljpops\Raw"
    Write-Host "`nChecking for output files in: $outputPath" -ForegroundColor Cyan
    
    $recentFiles = Get-ChildItem -Path $outputPath -Filter "*.csv" -ErrorAction SilentlyContinue | 
        Where-Object { $_.LastWriteTime -gt (Get-Date).AddMinutes(-5) } |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 5
    
    if ($recentFiles) {
        Write-Host "[OK] Recent CSV files created:" -ForegroundColor Green
        foreach ($file in $recentFiles) {
            Write-Host "  - $($file.Name) ($('{0:N0}' -f ($file.Length / 1KB)) KB) - $($file.LastWriteTime)" -ForegroundColor Gray
        }
    } else {
        Write-Host "[INFO] No recent CSV files found (created in last 5 minutes)" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "[ERROR] Failed to execute module: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`nTest complete!" -ForegroundColor Green