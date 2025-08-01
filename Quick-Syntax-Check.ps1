#Requires -Version 5.1

Write-Host "PowerShell 5.1 Syntax Validation" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$modules = @(
    @{Name = "CompanyProfileManager"; Path = "Modules\Core\CompanyProfileManager.psm1"},
    @{Name = "PaloAltoDiscovery"; Path = "Modules\Discovery\PaloAltoDiscovery.psm1"},
    @{Name = "PanoramaInterrogation"; Path = "Modules\Discovery\PanoramaInterrogation.psm1"},
    @{Name = "EntraIDAppDiscovery"; Path = "Modules\Discovery\EntraIDAppDiscovery.psm1"},
    @{Name = "WaveGeneration"; Path = "Modules\Processing\WaveGeneration.psm1"}
)

$passed = 0
$failed = 0

foreach ($module in $modules) {
    Write-Host "Testing $($module.Name)..." -ForegroundColor Yellow
    
    if (-not (Test-Path $module.Path)) {
        Write-Host "  File not found" -ForegroundColor Red
        $failed++
        continue
    }
    
    try {
        # Test 1: Basic file read
        $content = Get-Content $module.Path -Raw -ErrorAction Stop
        Write-Host "  ✓ File readable" -ForegroundColor Green
        
        # Test 2: AST parsing
        $errors = $null
        $null = [System.Management.Automation.Language.Parser]::ParseInput($content, [ref]$null, [ref]$errors)
        
        if ($errors -and $errors.Count -gt 0) {
            Write-Host "  ✗ $($errors.Count) parse errors:" -ForegroundColor Red
            foreach ($error in ($errors | Select-Object -First 3)) {
                Write-Host "    Line $($error.Extent.StartLineNumber): $($error.Message)" -ForegroundColor Red
            }
            $failed++
        } else {
            Write-Host "  ✓ AST parsing successful" -ForegroundColor Green
            
            # Test 3: ScriptBlock creation  
            try {
                $null = [scriptblock]::Create($content)
                Write-Host "  ✓ ScriptBlock creation successful" -ForegroundColor Green
                $passed++
            } catch {
                Write-Host "  ✗ ScriptBlock creation failed: $($_.Exception.Message.Split([Environment]::NewLine)[0])" -ForegroundColor Red
                $failed++
            }
        }
    }
    catch {
        Write-Host "  ✗ Exception: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
    
    Write-Host ""
}

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Results: $passed passed, $failed failed" -ForegroundColor $(if ($failed -eq 0) { 'Green' } else { 'Yellow' })

if ($failed -eq 0) {
    Write-Host "All core modules have valid PowerShell 5.1 syntax!" -ForegroundColor Green
} else {
    Write-Host "Some modules need syntax fixes." -ForegroundColor Yellow
}