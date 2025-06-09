# Test PowerShell 5.1 Compatibility for Processing Modules
# This script tests that all processing modules can be loaded without syntax errors

param(
    [string]$ModulePath = "Modules/Processing"
)

Write-Host "Testing PowerShell 5.1 compatibility for processing modules..." -ForegroundColor Green
Write-Host "PowerShell Version: $($PSVersionTable.PSVersion)" -ForegroundColor Cyan

$testResults = @()
$modulesToTest = Get-ChildItem -Path $ModulePath -Filter "*.psm1" -Recurse

foreach ($module in $modulesToTest) {
    Write-Host "`nTesting module: $($module.Name)" -ForegroundColor Yellow
    
    $testResult = [PSCustomObject]@{
        ModuleName = $module.Name
        ModulePath = $module.FullName
        SyntaxValid = $false
        LoadsSuccessfully = $false
        Error = $null
    }
    
    try {
        # Test syntax by parsing the file
        $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content -Path $module.FullName -Raw), [ref]$null)
        $testResult.SyntaxValid = $true
        Write-Host "  ✓ Syntax validation passed" -ForegroundColor Green
        
        # Test module loading (import test)
        $tempModuleName = "Test_$($module.BaseName)_$(Get-Random)"
        Import-Module -Name $module.FullName -Force -Global -DisableNameChecking -ErrorAction Stop
        $testResult.LoadsSuccessfully = $true
        Write-Host "  ✓ Module loads successfully" -ForegroundColor Green
        
        # Clean up
        Remove-Module -Name $module.BaseName -Force -ErrorAction SilentlyContinue
        
    } catch {
        $testResult.Error = $_.Exception.Message
        Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    $testResults += $testResult
}

Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "COMPATIBILITY TEST RESULTS" -ForegroundColor Cyan
Write-Host "="*60 -ForegroundColor Cyan

$passedCount = 0
$totalCount = $testResults.Count

foreach ($result in $testResults) {
    $status = if ($result.SyntaxValid -and $result.LoadsSuccessfully) {
        $passedCount++
        "PASS"
    } else {
        "FAIL"
    }
    
    $statusColor = if ($status -eq "PASS") { "Green" } else { "Red" }
    Write-Host "$($result.ModuleName): $status" -ForegroundColor $statusColor
    
    if ($result.Error) {
        Write-Host "  Error: $($result.Error)" -ForegroundColor Red
    }
}

Write-Host "`nSummary: $passedCount/$totalCount modules passed compatibility tests" -ForegroundColor $(if ($passedCount -eq $totalCount) { "Green" } else { "Yellow" })

if ($passedCount -eq $totalCount) {
    Write-Host "All processing modules are PowerShell 5.1 compatible!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some modules failed compatibility tests. Please review the errors above." -ForegroundColor Red
    exit 1
}