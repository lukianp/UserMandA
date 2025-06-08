param([string]$CompanyName)

# Set window title
$Host.UI.RawUI.WindowTitle = "M&A Discovery Suite - Status Dashboard ($CompanyName)"

# Try to determine output path from global context or fallback to standard path
if ($global:MandA -and $global:MandA.Paths -and $global:MandA.Paths.RawDataOutput) {
    $outputPath = $global:MandA.Paths.RawDataOutput
} else {
    # Check multiple possible locations for raw data files
    $possiblePaths = @(
        "C:\MandADiscovery\Profiles\$CompanyName\Output\Raw",
        "C:\MandADiscovery\Olddata\Output",
        "C:\MandADiscovery\Profiles\$CompanyName\RawData"
    )
    
    $outputPath = $null
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $csvFiles = Get-ChildItem "$path\*.csv" -ErrorAction SilentlyContinue
            if ($csvFiles.Count -gt 0) {
                $outputPath = $path
                break
            }
        }
    }
    
    # If no path with CSV files found, use the first possible path as default
    if (-not $outputPath) {
        $outputPath = $possiblePaths[0]
    }
}

while ($true) {
    Clear-Host
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   M&A DISCOVERY SUITE - STATUS DASHBOARD   " -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Company: $CompanyName" -ForegroundColor White
    Write-Host "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
    Write-Host "Output Path: $outputPath" -ForegroundColor DarkGray
    Write-Host ""
    
    # Check for CSV files
    $csvFiles = Get-ChildItem "$outputPath\*.csv" -ErrorAction SilentlyContinue
    
    if ($csvFiles) {
        Write-Host "Discovered Data Files:" -ForegroundColor Yellow
        Write-Host ("-" * 70) -ForegroundColor DarkGray
        
        $totalRecords = 0
        $activeFiles = 0
        
        foreach ($file in $csvFiles | Sort-Object LastWriteTime -Descending) {
            try {
                $rowCount = (Import-Csv $file.FullName -ErrorAction SilentlyContinue | Measure-Object).Count
                $totalRecords += $rowCount
                $age = (Get-Date) - $file.LastWriteTime
                $isActive = $age.TotalMinutes -lt 5
                
                if ($isActive) { $activeFiles++ }
                
                $status = if ($isActive) { "[ACTIVE]" } else { "[DONE]" }
                $color = if ($isActive) { "Green" } else { "Gray" }
                $sizeKB = [math]::Round($file.Length / 1KB, 1)
                
                Write-Host ("  {0,-25} {1,8} records {2,8} KB {3}" -f
                           $file.Name, $rowCount, $sizeKB, $status) -ForegroundColor $color
            } catch {
                Write-Host ("  {0,-25} {1,8} {2,8} KB {3}" -f
                           $file.Name, "ERROR", [math]::Round($file.Length / 1KB, 1), "[ERROR]") -ForegroundColor Red
            }
        }
        
        Write-Host ("-" * 70) -ForegroundColor DarkGray
        Write-Host ("Total: {0} files, {1} records, {2} active" -f
                   $csvFiles.Count, $totalRecords, $activeFiles) -ForegroundColor Cyan
        
        # Show discovery progress indicators
        $discoveryModules = @("ActiveDirectory", "Graph", "Azure", "Exchange", "SharePoint", "Teams", "Intune", "FileServer")
        Write-Host ""
        Write-Host "Discovery Module Status:" -ForegroundColor Yellow
        foreach ($module in $discoveryModules) {
            $moduleFile = $csvFiles | Where-Object { $_.Name -like "*$module*" }
            if ($moduleFile) {
                $age = (Get-Date) - $moduleFile.LastWriteTime
                $status = if ($age.TotalMinutes -lt 5) { "[RUNNING]" } else { "[COMPLETE]" }
                $color = if ($age.TotalMinutes -lt 5) { "Green" } else { "White" }
                Write-Host ("  {0,-15} {1}" -f $module, $status) -ForegroundColor $color
            } else {
                Write-Host ("  {0,-15} {1}" -f $module, "[PENDING]") -ForegroundColor DarkGray
            }
        }
        
    } else {
        Write-Host "No discovery files found yet..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Waiting for discovery to start..." -ForegroundColor DarkGray
        Write-Host "Expected location: $outputPath" -ForegroundColor DarkGray
    }
    
    Write-Host ""
    Write-Host ("-" * 70) -ForegroundColor DarkGray
    Write-Host "Press Ctrl+C to exit | Auto-refresh every 5 seconds" -ForegroundColor DarkGray
    Start-Sleep -Seconds 5
}