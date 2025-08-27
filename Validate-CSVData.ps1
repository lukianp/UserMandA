#Requires -Version 5.1

<#
.SYNOPSIS
    CSV Data Validation for M&A Discovery Suite
#>

param(
    [string]$DataPath = "C:\discoverydata\ljpops\Raw"
)

$startTime = Get-Date
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "M&A DISCOVERY SUITE - DATA VALIDATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Start Time: $($startTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Green
Write-Host "Data Path: $DataPath" -ForegroundColor Green
Write-Host ""

$results = @{
    TotalFiles = 0
    ValidFiles = 0
    Issues = @()
    TotalRecords = 0
}

$mandatoryColumns = @("_DiscoveryTimestamp", "_DiscoveryModule", "_SessionId")

Write-Host "🔍 Checking data directory..." -ForegroundColor Yellow

if (Test-Path $DataPath) {
    Write-Host "✅ Data directory found" -ForegroundColor Green
    
    $csvFiles = Get-ChildItem -Path $DataPath -Filter "*.csv" -ErrorAction SilentlyContinue
    $results.TotalFiles = $csvFiles.Count
    
    Write-Host "📁 Found $($csvFiles.Count) CSV files" -ForegroundColor Green
    Write-Host ""
    
    foreach ($file in $csvFiles) {
        Write-Host "Validating: $($file.Name)" -ForegroundColor Cyan
        
        $csvData = Import-Csv $file.FullName -ErrorAction SilentlyContinue
        
        if ($csvData) {
            $recordCount = $csvData.Count
            $results.TotalRecords += $recordCount
            Write-Host "  📊 Records: $recordCount" -ForegroundColor Gray
            
            if ($recordCount -gt 0) {
                $columnNames = $csvData[0].PSObject.Properties.Name
                $missingColumns = @()
                
                foreach ($col in $mandatoryColumns) {
                    if ($columnNames -notcontains $col) {
                        $missingColumns += $col
                    }
                }
                
                if ($missingColumns.Count -eq 0) {
                    Write-Host "  ✅ All mandatory columns present" -ForegroundColor Green
                    
                    $sample = $csvData[0]
                    
                    # Check timestamp format
                    if ($sample._DiscoveryTimestamp -match "^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$") {
                        Write-Host "  ✅ Timestamp format valid: $($sample._DiscoveryTimestamp)" -ForegroundColor Green
                    } else {
                        Write-Host "  ⚠️  Timestamp format: $($sample._DiscoveryTimestamp)" -ForegroundColor Yellow
                        $results.Issues += "$($file.Name): Timestamp format"
                    }
                    
                    # Check Session ID format
                    if ($sample._SessionId -match "^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$") {
                        Write-Host "  ✅ Session ID format valid" -ForegroundColor Green
                    } else {
                        Write-Host "  ⚠️  Session ID format: $($sample._SessionId)" -ForegroundColor Yellow
                        $results.Issues += "$($file.Name): Session ID format"
                    }
                    
                    # Check module name
                    if ($sample._DiscoveryModule) {
                        Write-Host "  ✅ Module: $($sample._DiscoveryModule)" -ForegroundColor Green
                    } else {
                        Write-Host "  ⚠️  Missing module name" -ForegroundColor Yellow
                        $results.Issues += "$($file.Name): Missing module"
                    }
                    
                    $results.ValidFiles++
                } else {
                    Write-Host "  ❌ Missing columns: $($missingColumns -join ', ')" -ForegroundColor Red
                    $results.Issues += "$($file.Name): Missing columns - $($missingColumns -join ', ')"
                }
            } else {
                Write-Host "  ⚠️  Empty file" -ForegroundColor Yellow
                $results.Issues += "$($file.Name): Empty file"
            }
        } else {
            Write-Host "  ❌ Could not read file" -ForegroundColor Red
            $results.Issues += "$($file.Name): Read error"
        }
        
        Write-Host ""
    }
} else {
    Write-Host "❌ Data directory not found: $DataPath" -ForegroundColor Red
    $results.Issues += "Data directory not found"
}

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "           VALIDATION RESULTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  Total Files: $($results.TotalFiles)" -ForegroundColor White
Write-Host "  Valid Files: $($results.ValidFiles)" -ForegroundColor Green
Write-Host "  Total Records: $($results.TotalRecords)" -ForegroundColor White
Write-Host "  Issues: $($results.Issues.Count)" -ForegroundColor $(if($results.Issues.Count -eq 0) {"Green"} else {"Red"})
Write-Host "  Duration: $([math]::Round($duration, 2)) seconds" -ForegroundColor White

if ($results.TotalFiles -gt 0) {
    $validationRate = [math]::Round(($results.ValidFiles / $results.TotalFiles) * 100, 2)
    Write-Host "  Success Rate: $validationRate%" -ForegroundColor $(if($validationRate -eq 100) {"Green"} else {"Yellow"})
}

Write-Host ""

if ($results.Issues.Count -gt 0) {
    Write-Host "Issues Found:" -ForegroundColor Red
    $results.Issues | ForEach-Object { Write-Host "  • $_" -ForegroundColor Red }
    Write-Host ""
}

$status = if ($results.Issues.Count -eq 0 -and $results.ValidFiles -eq $results.TotalFiles) {
    "PASSED"
} elseif ($results.Issues.Count -le 3) {
    "PASSED WITH WARNINGS"
} else {
    "FAILED"
}

$statusColor = switch ($status) {
    "PASSED" { "Green" }
    "PASSED WITH WARNINGS" { "Yellow" }
    "FAILED" { "Red" }
}

Write-Host "DATA VALIDATION STATUS: " -NoNewline -ForegroundColor White
Write-Host $status -ForegroundColor $statusColor -BackgroundColor Black
Write-Host ""

if ($status -eq "PASSED") {
    Write-Host "✅ DATA VALIDATION PASSED - PRODUCTION READY" -ForegroundColor Green -BackgroundColor DarkGreen
} elseif ($status -eq "PASSED WITH WARNINGS") {
    Write-Host "⚠️  DATA VALIDATION PASSED WITH WARNINGS" -ForegroundColor Black -BackgroundColor Yellow
} else {
    Write-Host "❌ DATA VALIDATION FAILED" -ForegroundColor White -BackgroundColor Red
}

Write-Host ""

return @{
    Status = $status
    TotalFiles = $results.TotalFiles
    ValidFiles = $results.ValidFiles
    TotalRecords = $results.TotalRecords
    Issues = $results.Issues
    Duration = $duration
}