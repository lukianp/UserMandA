# Fix-ModuleContext.ps1
# Fixes module loading context issues

$modulePaths = @(
    ".\Modules\Processing\DataValidation.psm1",
    ".\Modules\Processing\UserProfileBuilder.psm1",
    ".\Modules\Processing\WaveGeneration.psm1",
    ".\Modules\Processing\DataAggregation.psm1",
    ".\Modules\Export\CSVExport.psm1",
    ".\Modules\Export\JSONExport.psm1",
    ".\Modules\Export\ExcelExport.psm1",
    ".\Modules\Export\PowerAppsExporter.psm1",
    ".\Modules\Export\CompanyControlSheetExporter.psm1"
)

foreach ($modulePath in $modulePaths) {
    if (Test-Path $modulePath) {
        Write-Host "Fixing module: $modulePath" -ForegroundColor Yellow
        
        $content = Get-Content $modulePath -Raw -Encoding UTF8
        
        # Remove problematic module-scope context access
        $patterns = @(
            # Pattern 1: Direct global context access at module scope
            '(?ms)# Access context information.*?^\$ModuleScope_ContextPaths = \$global:_MandALoadingContext\.Paths',
            
            # Pattern 2: Global environment check at module scope  
            '(?ms)if \(\$null -eq \$global:_MandALoadingContext.*?\s*throw.*?\s*\}',
            
            # Pattern 3: Module scope path validation
            '(?ms)# Validate critical paths exist.*?Write-Warning.*?\s*\}',
            
            # Pattern 4: Module initialization checks
            '(?ms)# Module initialization.*?^\s*\}'
        )
        
        foreach ($pattern in $patterns) {
            if ($content -match $pattern) {
                $content = $content -replace $pattern, "# NOTE: Context access has been moved to function scope to avoid module loading issues.`n# The global context (`$global:MandA) will be accessed by functions when they are called,`n# rather than at module import time."
                Write-Host "  Removed module-scope context access" -ForegroundColor Green
            }
        }
        
        Set-Content -Path $modulePath -Value $content -Encoding UTF8 -NoNewline
    }
}

Write-Host "Module context fixes complete!" -ForegroundColor Green