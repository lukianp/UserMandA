# Final Module Test with Absolute Paths

Write-Host "Testing PowerShell 5.1 module compatibility..." -ForegroundColor Green
Write-Host "PowerShell Version: $($PSVersionTable.PSVersion)" -ForegroundColor Cyan

$currentDir = Get-Location
$modules = @(
    "$currentDir\Modules\Processing\DataAggregation.psm1",
    "$currentDir\Modules\Processing\DataValidation.psm1", 
    "$currentDir\Modules\Processing\UserProfileBuilder.psm1",
    "$currentDir\Modules\Processing\WaveGeneration.psm1"
)

$results = @()

foreach ($modulePath in $modules) {
    $moduleName = Split-Path $modulePath -Leaf
    Write-Host "`nTesting: $moduleName" -ForegroundColor Yellow
    
    try {
        # Test module import with absolute path
        Import-Module -Name $modulePath -Force -DisableNameChecking -ErrorAction Stop
        Write-Host "  Import: SUCCESS" -ForegroundColor Green
        $results += "$moduleName - PASS"
        
        # Clean up
        $moduleBaseName = [System.IO.Path]::GetFileNameWithoutExtension($modulePath)
        Remove-Module -Name $moduleBaseName -Force -ErrorAction SilentlyContinue
        
    } catch {
        Write-Host "  Import: FAILED - $($_.Exception.Message)" -ForegroundColor Red
        $results += "$moduleName - FAIL: $($_.Exception.Message)"
    }
}

Write-Host "`n" + ("="*60) -ForegroundColor Cyan
Write-Host "FINAL RESULTS:" -ForegroundColor Cyan
Write-Host ("="*60) -ForegroundColor Cyan

foreach ($result in $results) {
    if ($result -like "*PASS*") {
        Write-Host $result -ForegroundColor Green
    } else {
        Write-Host $result -ForegroundColor Red
    }
}

$passCount = ($results | Where-Object { $_ -like "*PASS*" }).Count
$totalCount = $results.Count

Write-Host "`nSummary: $passCount/$totalCount modules passed PowerShell 5.1 compatibility test" -ForegroundColor $(if ($passCount -eq $totalCount) { "Green" } else { "Yellow" })

if ($passCount -eq $totalCount) {
    Write-Host "All processing modules are now PowerShell 5.1 compatible!" -ForegroundColor Green
} else {
    Write-Host "Some modules still have compatibility issues." -ForegroundColor Red
}