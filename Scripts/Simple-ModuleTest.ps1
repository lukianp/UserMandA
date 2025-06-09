# Simple Module Loading Test for PowerShell 5.1 Compatibility

Write-Host "Testing module loading in PowerShell $($PSVersionTable.PSVersion)..." -ForegroundColor Green

$modules = @(
    "Modules/Processing/DataAggregation.psm1",
    "Modules/Processing/DataValidation.psm1", 
    "Modules/Processing/UserProfileBuilder.psm1",
    "Modules/Processing/WaveGeneration.psm1"
)

$results = @()

foreach ($modulePath in $modules) {
    $moduleName = Split-Path $modulePath -Leaf
    Write-Host "`nTesting: $moduleName" -ForegroundColor Yellow
    
    try {
        # Test syntax parsing
        $content = Get-Content -Path $modulePath -Raw
        $tokens = $null
        $errors = $null
        [System.Management.Automation.PSParser]::Tokenize($content, [ref]$errors)
        
        if ($errors.Count -gt 0) {
            Write-Host "  Syntax errors found:" -ForegroundColor Red
            foreach ($error in $errors) {
                Write-Host "    $($error.Message)" -ForegroundColor Red
            }
            $results += "$moduleName - SYNTAX ERROR"
        } else {
            Write-Host "  Syntax OK" -ForegroundColor Green
            
            # Test module import
            Import-Module -Name $modulePath -Force -DisableNameChecking -ErrorAction Stop
            Write-Host "  Import OK" -ForegroundColor Green
            $results += "$moduleName - PASS"
            
            # Clean up
            $moduleBaseName = [System.IO.Path]::GetFileNameWithoutExtension($modulePath)
            Remove-Module -Name $moduleBaseName -Force -ErrorAction SilentlyContinue
        }
        
    } catch {
        Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
        $results += "$moduleName - FAIL - $($_.Exception.Message)"
    }
}

Write-Host "`n" + ("="*50) -ForegroundColor Cyan
Write-Host "RESULTS:" -ForegroundColor Cyan
Write-Host ("="*50) -ForegroundColor Cyan

foreach ($result in $results) {
    if ($result -like "*PASS*") {
        Write-Host $result -ForegroundColor Green
    } else {
        Write-Host $result -ForegroundColor Red
    }
}

$passCount = ($results | Where-Object { $_ -like "*PASS*" }).Count
$totalCount = $results.Count

Write-Host "`nSummary: $passCount/$totalCount modules passed" -ForegroundColor $(if ($passCount -eq $totalCount) { "Green" } else { "Yellow" })