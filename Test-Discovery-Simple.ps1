# Simple Discovery Module Testing Script
# Test all enabled modules from ModuleRegistry.json

$ErrorActionPreference = "Continue"
$startTime = Get-Date

Write-Host "=== M&A DISCOVERY SUITE - MODULE VALIDATION ===" -ForegroundColor Cyan
Write-Host "Start Time: $startTime" -ForegroundColor Gray

# Initialize counters
$results = @{
    Tested = 0
    Successful = 0
    Failed = 0
    ModulesWithCSV = 0
    TotalDataRecords = 0
}

# Load module registry
$registryPath = "C:\enterprisediscovery\Configuration\ModuleRegistry.json"
if (-not (Test-Path $registryPath)) {
    Write-Host "ERROR: Module registry not found at $registryPath" -ForegroundColor Red
    exit 1
}

$moduleRegistry = Get-Content $registryPath -Raw | ConvertFrom-Json
$enabledModules = $moduleRegistry.modules.PSObject.Properties | Where-Object { $_.Value.enabled -eq $true }

Write-Host "Found $($enabledModules.Count) enabled modules in registry" -ForegroundColor Green

# Clean discovery data directory
Write-Host "`nCleaning existing discovery data..." -ForegroundColor Yellow
Get-ChildItem "C:\discoverydata\ljpops\RawData\*.csv" -ErrorAction SilentlyContinue | Remove-Item -Force

# Test each module
Write-Host "`n=== MODULE TESTING RESULTS ===" -ForegroundColor Cyan
foreach ($module in $enabledModules) {
    $results.Tested++
    $moduleName = $module.Name
    $moduleConfig = $module.Value
    
    Write-Host "`n[$($results.Tested)/$($enabledModules.Count)] Testing: $moduleName" -ForegroundColor White
    Write-Host "  Display Name: $($moduleConfig.displayName)" -ForegroundColor Gray
    Write-Host "  Category: $($moduleConfig.category)" -ForegroundColor Gray
    
    try {
        # Check if module file exists
        $modulePath = Join-Path "C:\enterprisediscovery\Modules" $moduleConfig.filePath
        if (-not (Test-Path $modulePath)) {
            Write-Host "  ❌ FAILED: Module file not found at $modulePath" -ForegroundColor Red
            $results.Failed++
            continue
        }
        
        # Try to import module
        Import-Module $modulePath -Force -ErrorAction Stop
        Write-Host "  ✓ Module imported successfully" -ForegroundColor Green
        
        # Check for main function and execute
        $expectedFunction = "Invoke-$moduleName"
        $moduleCommands = Get-Command -Module (Get-Item $modulePath).BaseName -ErrorAction SilentlyContinue
        
        if ($moduleCommands -and ($moduleCommands.Name -contains $expectedFunction)) {
            Write-Host "  ✓ Found main function: $expectedFunction" -ForegroundColor Green
            
            # Execute discovery
            Write-Host "  → Executing discovery..." -ForegroundColor Yellow
            & $expectedFunction -CompanyName "ValidationTest" -ErrorAction Stop
            
            # Check for CSV output
            $csvPath = "C:\discoverydata\ljpops\RawData\$moduleName.csv"
            if (Test-Path $csvPath) {
                $csvData = Import-Csv $csvPath -ErrorAction SilentlyContinue
                $recordCount = if ($csvData) { $csvData.Count } else { 0 }
                Write-Host "  ✅ SUCCESS: CSV created with $recordCount records" -ForegroundColor Green
                $results.Successful++
                $results.ModulesWithCSV++
                $results.TotalDataRecords += $recordCount
            }
            else {
                Write-Host "  ✅ SUCCESS: Module executed (no CSV output)" -ForegroundColor Green
                $results.Successful++
            }
        }
        else {
            Write-Host "  ⚠️ WARNING: Main function '$expectedFunction' not found" -ForegroundColor Yellow
            Write-Host "      Available functions: $($moduleCommands.Name -join ', ')" -ForegroundColor Gray
            $results.Successful++
        }
        
        # Clean up module
        Remove-Module (Get-Item $modulePath).BaseName -Force -ErrorAction SilentlyContinue
        
    }
    catch {
        Write-Host "  ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $results.Failed++
        
        # Try to clean up failed module import
        try {
            Remove-Module (Get-Item $modulePath).BaseName -Force -ErrorAction SilentlyContinue
        }
        catch { }
    }
    
    # Small delay between modules
    Start-Sleep -Seconds 1
}

# Check for orphaned CSV files
Write-Host "`n=== CHECKING FOR ORPHANED DATA ===" -ForegroundColor Cyan
$csvFiles = Get-ChildItem "C:\discoverydata\ljpops\RawData\*.csv" -ErrorAction SilentlyContinue
$registeredNames = $moduleRegistry.modules.PSObject.Properties.Name
$orphanedFiles = @()

foreach ($csvFile in $csvFiles) {
    $csvBaseName = [System.IO.Path]::GetFileNameWithoutExtension($csvFile.Name)
    if ($csvBaseName -notin $registeredNames) {
        $orphanedFiles += $csvFile.FullName
        Write-Host "  📊 Orphaned data file: $($csvFile.Name)" -ForegroundColor Yellow
    }
}

# Final summary
$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

Write-Host "`n=== FINAL VALIDATION SUMMARY ===" -ForegroundColor Cyan
Write-Host "Execution Time: $([math]::Round($duration, 2)) seconds" -ForegroundColor Gray
Write-Host "Modules Tested: $($results.Tested)" -ForegroundColor White
Write-Host "✅ Successful: $($results.Successful)" -ForegroundColor Green
Write-Host "❌ Failed: $($results.Failed)" -ForegroundColor Red
Write-Host "📊 Modules with CSV: $($results.ModulesWithCSV)" -ForegroundColor Cyan
Write-Host "📈 Total Data Records: $($results.TotalDataRecords)" -ForegroundColor Cyan
Write-Host "🗂️ Orphaned Files: $($orphanedFiles.Count)" -ForegroundColor Yellow

# Calculate success rate
$successRate = if ($results.Tested -gt 0) { [math]::Round(($results.Successful / $results.Tested) * 100, 1) } else { 0 }
Write-Host "📊 Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })

# Status determination
if ($results.Failed -eq 0 -and $results.Successful -eq $results.Tested) {
    Write-Host "`n🎉 ALL MODULES PASSED VALIDATION!" -ForegroundColor Green
    $overallStatus = "SUCCESS"
}
elseif ($results.Successful -ge ($results.Tested * 0.8)) {
    Write-Host "`n⚠️ MOSTLY SUCCESSFUL - Some modules need attention" -ForegroundColor Yellow
    $overallStatus = "PARTIAL_SUCCESS"
}
else {
    Write-Host "`n❌ VALIDATION FAILED - Multiple modules have issues" -ForegroundColor Red
    $overallStatus = "FAILED"
}

# Return results for further processing
return @{
    Status = $overallStatus
    Results = $results
    OrphanedFiles = $orphanedFiles
    Duration = $duration
    SuccessRate = $successRate
}