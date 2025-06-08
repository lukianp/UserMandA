param([string]$CompanyName)

# Set window title
$Host.UI.RawUI.WindowTitle = "M&A Discovery Suite - Status Dashboard ($CompanyName)"

# Try to determine output path from global context or fallback to standard path
if ($global:MandA -and $global:MandA.Paths -and $global:MandA.Paths.RawDataOutput) {
    $outputPath = $global:MandA.Paths.RawDataOutput
} else {
    # Check multiple possible locations for raw data files
    $possiblePaths = @(
        "C:\MandADiscovery\Profiles\$CompanyName\Raw",
        "C:\MandADiscovery\Profiles\$CompanyName\Output\Raw",
        "C:\MandADiscovery\Profiles\$CompanyName\RawData",
        "C:\MandADiscovery\Olddata\Output"
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
        
        # Show discovery progress indicators - Updated to include all 14 configured modules
        $discoveryModules = @("ActiveDirectory", "Graph", "Azure", "Exchange", "SharePoint", "Teams", "Intune", "FileServer", "GPO", "EnvironmentDetection", "ExternalIdentity", "Licensing", "NetworkInfrastructure", "SQLServer")
        Write-Host ""
        Write-Host "Discovery Module Status:" -ForegroundColor Yellow
        foreach ($module in $discoveryModules) {
            # Handle different naming patterns for modules
            $searchPattern = switch ($module) {
                "ActiveDirectory" { "AD*" }
                "Graph" { "Graph*" }
                "Azure" { "Azure*" }
                "Exchange" { "Exchange*" }
                "SharePoint" { "SharePoint*" }
                "Teams" { "Teams*" }
                "Intune" { "Intune*" }
                "FileServer" { "FileServer*" }
                default { "*$module*" }
            }
            
            $moduleFiles = $csvFiles | Where-Object { $_.Name -like $searchPattern }
            
            if ($moduleFiles) {
                try {
                    # Get the most recent file for this module
                    $latestFile = $moduleFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1
                    $age = (Get-Date) - $latestFile.LastWriteTime
                    $isRecent = $age.TotalMinutes -lt 5
                    
                    # Check if files are substantial (not just header-only files)
                    $totalRecords = 0
                    $totalSize = 0
                    $hasSubstantialData = $false
                    
                    foreach ($file in $moduleFiles) {
                        try {
                            $records = (Import-Csv $file.FullName -ErrorAction SilentlyContinue | Measure-Object).Count
                            $totalRecords += $records
                            $totalSize += $file.Length
                            
                            # Consider substantial if any file has more than 1 record (not just headers)
                            if ($records -gt 1) { $hasSubstantialData = $true }
                        } catch {
                            # If we can't read the file, assume it's being written to
                        }
                    }
                    
                    # Determine status based on multiple factors
                    if ($isRecent) {
                        $status = "[RUNNING]"
                        $color = "Green"
                    } elseif ($hasSubstantialData -and $totalRecords -gt 10) {
                        # Module has completed with substantial data
                        $status = "[COMPLETE]"
                        $color = "White"
                    } elseif ($totalRecords -le 1 -and $totalSize -lt 1KB) {
                        # Files exist but are too small - likely incomplete or failed
                        $status = "[INCOMPLETE]"
                        $color = "Yellow"
                    } elseif ($totalRecords -gt 1 -and $totalRecords -le 10) {
                        # Some data but might be incomplete
                        $status = "[PARTIAL]"
                        $color = "Cyan"
                    } else {
                        $status = "[COMPLETE]"
                        $color = "White"
                    }
                    
                    # Add record count for context
                    $statusWithCount = "$status ($totalRecords records)"
                    Write-Host ("  {0,-15} {1}" -f $module, $statusWithCount) -ForegroundColor $color
                    
                } catch {
                    Write-Host ("  {0,-15} {1}" -f $module, "[ERROR]") -ForegroundColor Red
                }
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