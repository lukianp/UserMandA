Write-Host "Detailed PowerShell Syntax Check" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

$modulePath = "Modules\Core\CompanyProfileManager.psm1"

if (Test-Path $modulePath) {
    Write-Host "Checking $modulePath..." -ForegroundColor Yellow
    
    $content = Get-Content $modulePath -Raw
    $tokens = $null
    $errors = $null
    
    $ast = [System.Management.Automation.Language.Parser]::ParseInput($content, [ref]$tokens, [ref]$errors)
    
    if ($errors -and $errors.Count -gt 0) {
        Write-Host "Found $($errors.Count) parse errors:" -ForegroundColor Red
        foreach ($parseError in $errors) {
            Write-Host "  Line $($parseError.Extent.StartLineNumber): $($parseError.Message)" -ForegroundColor Red
            Write-Host "    Error Type: $($parseError.ErrorId)" -ForegroundColor DarkRed
        }
    } else {
        Write-Host "No parse errors found!" -ForegroundColor Green
    }
} else {
    Write-Host "File not found: $modulePath" -ForegroundColor Red
}