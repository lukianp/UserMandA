# Module Usage Analysis Script
Write-Host "=== M&A Discovery Suite Module Usage Analysis ===" -ForegroundColor Cyan
Write-Host ""

# Get all available modules
$allModules = @()
$moduleDirectories = @("Authentication", "Connectivity", "Discovery", "Export", "Processing", "Utilities")

foreach ($dir in $moduleDirectories) {
    $path = "Modules/$dir"
    if (Test-Path $path) {
        $modules = Get-ChildItem "$path/*.psm1" | ForEach-Object {
            [PSCustomObject]@{
                Category = $dir
                Name = $_.BaseName
                FullName = $_.Name
                Path = $_.FullName
                Used = $false
                UsedBy = @()
            }
        }
        $allModules += $modules
    }
}

Write-Host "Total modules found: $($allModules.Count)" -ForegroundColor Yellow
Write-Host ""

# Analyze Orchestrator usage
Write-Host "=== Analyzing Orchestrator Module Usage ===" -ForegroundColor Yellow
$orchestratorContent = Get-Content "Core/MandA-Orchestrator.ps1" -Raw

# Modules explicitly loaded in orchestrator
$explicitlyLoaded = @(
    "EnhancedLogging",
    "ErrorHandling", 
    "ValidationHelpers",
    "CredentialManagement",
    "Authentication",
    "PerformanceMetrics",
    "FileOperations",
    "ProgressDisplay",
    "EnhancedConnectionManager"
)

# Processing modules
$processingModules = @("DataAggregation", "UserProfileBuilder", "WaveGeneration", "DataValidation")

# Export modules (dynamically loaded based on config)
$exportModules = @("CSVExport", "JSONExport", "ExcelExport", "CompanyControlSheetExporter", "PowerAppsExporter")

# Discovery modules (dynamically loaded based on enabled sources)
$discoveryModules = $allModules | Where-Object { $_.Category -eq "Discovery" -and $_.Name -ne "DiscoveryModuleBase" } | Select-Object -ExpandProperty Name

# Mark modules as used
foreach ($module in $allModules) {
    if ($module.Name -in $explicitlyLoaded) {
        $module.Used = $true
        $module.UsedBy += "Orchestrator-Explicit"
    }
    
    if ($module.Name -in $processingModules) {
        $module.Used = $true
        $module.UsedBy += "Orchestrator-Processing"
    }
    
    if ($module.Name -in $exportModules) {
        $module.Used = $true
        $module.UsedBy += "Orchestrator-Export"
    }
    
    if ($module.Name -in $discoveryModules) {
        $module.Used = $true
        $module.UsedBy += "Orchestrator-Discovery"
    }
    
    # Check for other references in orchestrator
    if ($orchestratorContent -match $module.Name) {
        $module.Used = $true
        if ("Orchestrator-Referenced" -notin $module.UsedBy) {
            $module.UsedBy += "Orchestrator-Referenced"
        }
    }
}

# Analyze QuickStart usage
Write-Host "=== Analyzing QuickStart Module Usage ===" -ForegroundColor Yellow
$quickStartContent = Get-Content "QuickStart.ps1" -Raw

foreach ($module in $allModules) {
    if ($quickStartContent -match $module.Name) {
        $module.Used = $true
        if ("QuickStart" -notin $module.UsedBy) {
            $module.UsedBy += "QuickStart"
        }
    }
}

# Display results by category
Write-Host ""
Write-Host "=== Module Usage Results ===" -ForegroundColor Cyan

foreach ($category in $moduleDirectories) {
    $categoryModules = $allModules | Where-Object { $_.Category -eq $category }
    if ($categoryModules.Count -eq 0) { continue }
    
    Write-Host ""
    Write-Host "=== $category Modules ===" -ForegroundColor Yellow
    
    $used = $categoryModules | Where-Object { $_.Used }
    $unused = $categoryModules | Where-Object { -not $_.Used }
    
    if ($used.Count -gt 0) {
        Write-Host "USED ($($used.Count)):" -ForegroundColor Green
        foreach ($module in $used | Sort-Object Name) {
            Write-Host "  + $($module.FullName)" -ForegroundColor Green
            Write-Host "    Used by: $($module.UsedBy -join ', ')" -ForegroundColor DarkGray
        }
    }
    
    if ($unused.Count -gt 0) {
        Write-Host "UNUSED ($($unused.Count)):" -ForegroundColor Red
        foreach ($module in $unused | Sort-Object Name) {
            Write-Host "  - $($module.FullName)" -ForegroundColor Red
        }
    }
}

# Summary
Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
$totalUsed = ($allModules | Where-Object { $_.Used }).Count
$totalUnused = ($allModules | Where-Object { -not $_.Used }).Count

Write-Host "Total modules: $($allModules.Count)" -ForegroundColor White
Write-Host "Used modules: $totalUsed" -ForegroundColor Green
Write-Host "Unused modules: $totalUnused" -ForegroundColor Red
Write-Host "Usage rate: $([Math]::Round(($totalUsed / $allModules.Count) * 100, 1))%" -ForegroundColor Yellow

if ($totalUnused -gt 0) {
    Write-Host ""
    Write-Host "Potentially unused modules:" -ForegroundColor Red
    $allModules | Where-Object { -not $_.Used } | Sort-Object Category, Name | ForEach-Object {
        Write-Host "  $($_.Category)/$($_.FullName)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Analysis complete." -ForegroundColor Cyan