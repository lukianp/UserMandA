# Comprehensive Module Syntax Validation Script
Write-Host "=== Comprehensive Module Syntax Validation ===" -ForegroundColor Cyan
Write-Host ""

$moduleDirectories = @(
    @{Name="Authentication"; Path="Modules/Authentication"},
    @{Name="Connectivity"; Path="Modules/Connectivity"},
    @{Name="Discovery"; Path="Modules/Discovery"},
    @{Name="Export"; Path="Modules/Export"},
    @{Name="Processing"; Path="Modules/Processing"},
    @{Name="Utilities"; Path="Modules/Utilities"}
)

$totalPassed = 0
$totalFailed = 0
$allFailedModules = @()

foreach ($directory in $moduleDirectories) {
    Write-Host "=== $($directory.Name) Modules ===" -ForegroundColor Yellow
    
    if (-not (Test-Path $directory.Path)) {
        Write-Host "Directory not found: $($directory.Path)" -ForegroundColor Red
        continue
    }
    
    $modules = Get-ChildItem "$($directory.Path)/*.psm1"
    $passed = 0
    $failed = 0
    $failedModules = @()
    
    if ($modules.Count -eq 0) {
        Write-Host "No .psm1 files found in $($directory.Path)" -ForegroundColor Yellow
        Write-Host ""
        continue
    }
    
    foreach ($module in $modules) {
        Write-Host "Testing $($module.Name)..." -NoNewline
        try {
            $content = Get-Content $module.FullName -Raw
            $null = [System.Management.Automation.PSParser]::Tokenize($content, [ref]$null)
            Write-Host " PASS" -ForegroundColor Green
            $passed++
        } catch {
            Write-Host " FAIL" -ForegroundColor Red
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
            $failed++
            $failedModules += "$($directory.Name)/$($module.Name)"
        }
    }
    
    Write-Host "Summary: $passed passed, $failed failed" -ForegroundColor Cyan
    Write-Host ""
    
    $totalPassed += $passed
    $totalFailed += $failed
    $allFailedModules += $failedModules
}

Write-Host "=== OVERALL SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total Passed: $totalPassed" -ForegroundColor Green
Write-Host "Total Failed: $totalFailed" -ForegroundColor $(if ($totalFailed -gt 0) { "Red" } else { "Green" })

if ($allFailedModules.Count -gt 0) {
    Write-Host ""
    Write-Host "Failed modules:" -ForegroundColor Red
    $allFailedModules | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}

Write-Host ""
Write-Host "Comprehensive validation complete." -ForegroundColor Cyan