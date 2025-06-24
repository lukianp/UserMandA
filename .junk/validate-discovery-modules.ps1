# Discovery Module Syntax Validation Script
Write-Host "=== Discovery Module Syntax Validation ===" -ForegroundColor Cyan

$discoveryPath = "Modules/Discovery"
$modules = Get-ChildItem "$discoveryPath/*.psm1"

$passed = 0
$failed = 0
$failedModules = @()

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
        $failedModules += $module.Name
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })

if ($failedModules.Count -gt 0) {
    Write-Host ""
    Write-Host "Failed modules:" -ForegroundColor Red
    $failedModules | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}

Write-Host ""
Write-Host "Validation complete." -ForegroundColor Cyan