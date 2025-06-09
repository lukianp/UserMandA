# Validate All Recently Created Scripts
# This script validates the syntax of all scripts created during the validation process

$scriptsToValidate = @(
    "Scripts/Fix-PowerShell51Syntax.ps1",
    "Scripts/Fix-ErrorVariableConflicts.ps1", 
    "Scripts/Final-ModuleTest.ps1",
    "Scripts/Simple-SyntaxValidator.ps1",
    "Scripts/Comprehensive-SyntaxValidator.ps1"
)

Write-Host "=== SCRIPT VALIDATION ===" -ForegroundColor Cyan
Write-Host "Validating recently created scripts..." -ForegroundColor Gray
Write-Host ""

$totalScripts = 0
$passedScripts = 0
$failedScripts = 0

foreach ($scriptPath in $scriptsToValidate) {
    $totalScripts++
    Write-Host "Validating: $scriptPath" -ForegroundColor Yellow
    
    if (-not (Test-Path $scriptPath)) {
        Write-Host "  ERROR: Script not found" -ForegroundColor Red
        $failedScripts++
        continue
    }

    try {
        # Test PowerShell syntax
        $content = Get-Content -Path $scriptPath -Raw -Encoding UTF8
        $tokens = $null
        $parseErrors = $null
        
        $ast = [System.Management.Automation.Language.Parser]::ParseInput($content, [ref]$tokens, [ref]$parseErrors)
        
        if ($parseErrors.Count -gt 0) {
            Write-Host "  SYNTAX ERRORS:" -ForegroundColor Red
            foreach ($error in $parseErrors) {
                Write-Host "    Line $($error.Extent.StartLineNumber): $($error.Message)" -ForegroundColor Red
            }
            $failedScripts++
        } else {
            Write-Host "  PASSED" -ForegroundColor Green
            $passedScripts++
        }

    } catch {
        Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
        $failedScripts++
    }
    
    Write-Host ""
}

Write-Host "=== SCRIPT VALIDATION SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total Scripts: $totalScripts" -ForegroundColor White
Write-Host "Passed: $passedScripts" -ForegroundColor Green
Write-Host "Failed: $failedScripts" -ForegroundColor Red

if ($failedScripts -eq 0) {
    Write-Host "All scripts passed validation!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "$failedScripts scripts failed validation" -ForegroundColor Red
    exit 1
}