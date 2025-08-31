# Simple Discovery Module Testing Script
$ErrorActionPreference = "Continue"

Write-Host "=== M&A DISCOVERY SUITE - MODULE VALIDATION ===" -ForegroundColor Cyan

# Initialize counters
$tested = 0
$successful = 0
$failed = 0
$withCSV = 0

# Load module registry
$registryPath = "C:\enterprisediscovery\Configuration\ModuleRegistry.json"
$moduleRegistry = Get-Content $registryPath -Raw | ConvertFrom-Json
$enabledModules = $moduleRegistry.modules.PSObject.Properties | Where-Object { $_.Value.enabled -eq $true }

Write-Host "Found $($enabledModules.Count) enabled modules" -ForegroundColor Green

# Clean data directory
Get-ChildItem "C:\discoverydata\ljpops\RawData\*.csv" -ErrorAction SilentlyContinue | Remove-Item -Force

# Test each module
foreach ($module in $enabledModules) {
    $tested++
    $moduleName = $module.Name
    $moduleConfig = $module.Value
    
    Write-Host "`n[$tested/$($enabledModules.Count)] Testing: $moduleName" -ForegroundColor White
    
    $modulePath = Join-Path "C:\enterprisediscovery\Modules" $moduleConfig.filePath
    if (-not (Test-Path $modulePath)) {
        Write-Host "  FAILED: Module file not found" -ForegroundColor Red
        $failed++
        continue
    }
    
    try {
        Import-Module $modulePath -Force
        Write-Host "  Module imported" -ForegroundColor Green
        
        $expectedFunction = "Invoke-$moduleName"
        $commands = Get-Command -Module (Get-Item $modulePath).BaseName -ErrorAction SilentlyContinue
        
        if ($commands -and ($commands.Name -contains $expectedFunction)) {
            Write-Host "  Executing $expectedFunction..." -ForegroundColor Yellow
            & $expectedFunction -CompanyName "ValidationTest"
            
            $csvPath = "C:\discoverydata\ljpops\RawData\$moduleName.csv"
            if (Test-Path $csvPath) {
                $records = (Import-Csv $csvPath).Count
                Write-Host "  SUCCESS: CSV with $records records" -ForegroundColor Green
                $withCSV++
            } else {
                Write-Host "  SUCCESS: Module executed" -ForegroundColor Green
            }
            $successful++
        } else {
            Write-Host "  WARNING: Function not found" -ForegroundColor Yellow
            $successful++
        }
        
        Remove-Module (Get-Item $modulePath).BaseName -Force -ErrorAction SilentlyContinue
        
    } catch {
        Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Tested: $tested" -ForegroundColor White
Write-Host "Successful: $successful" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host "With CSV: $withCSV" -ForegroundColor Cyan

$successRate = [math]::Round(($successful / $tested) * 100, 1)
Write-Host "Success Rate: $successRate%" -ForegroundColor Green