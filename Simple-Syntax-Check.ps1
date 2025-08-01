param()

Write-Host "PowerShell 5.1 Syntax Validation" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$modules = @(
    "Modules\Core\CompanyProfileManager.psm1",
    "Modules\Discovery\PaloAltoDiscovery.psm1", 
    "Modules\Discovery\PanoramaInterrogation.psm1",
    "Modules\Discovery\EntraIDAppDiscovery.psm1",
    "Modules\Processing\WaveGeneration.psm1"
)

$passed = 0
$failed = 0

foreach ($module in $modules) {
    Write-Host "Testing $module..." -ForegroundColor Yellow
    
    if (-not (Test-Path $module)) {
        Write-Host "  File not found" -ForegroundColor Red
        $failed++
        continue
    }
    
    try {
        $content = Get-Content $module -Raw -ErrorAction Stop
        Write-Host "  File readable" -ForegroundColor Green
        
        $errors = $null
        $null = [System.Management.Automation.Language.Parser]::ParseInput($content, [ref]$null, [ref]$errors)
        
        if ($errors -and $errors.Count -gt 0) {
            Write-Host "  $($errors.Count) parse errors found" -ForegroundColor Red
            foreach ($error in ($errors | Select-Object -First 3)) {
                Write-Host "    Line $($error.Extent.StartLineNumber): $($error.Message)" -ForegroundColor Red
            }
            $failed++
        } else {
            Write-Host "  AST parsing successful" -ForegroundColor Green
            
            try {
                $null = [scriptblock]::Create($content)
                Write-Host "  ScriptBlock creation successful" -ForegroundColor Green
                $passed++
            } catch {
                Write-Host "  ScriptBlock creation failed" -ForegroundColor Red
                $failed++
            }
        }
    }
    catch {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
    
    Write-Host ""
}

Write-Host "Results: $passed passed, $failed failed" -ForegroundColor White

if ($failed -eq 0) {
    Write-Host "All modules have valid syntax!" -ForegroundColor Green
} else {
    Write-Host "Some modules have issues." -ForegroundColor Yellow
}