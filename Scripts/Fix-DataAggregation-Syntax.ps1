# Fix Critical Syntax Errors in DataAggregation.psm1
# This script addresses the specific syntax issues found in the DataAggregation module

param(
    [string]$ModulePath = "Modules/Processing/DataAggregation.psm1"
)

Write-Host "Fixing critical syntax errors in DataAggregation.psm1..." -ForegroundColor Green

if (-not (Test-Path $ModulePath)) {
    Write-Error "Module file not found: $ModulePath"
    exit 1
}

# Create backup
$backupPath = "$ModulePath.syntaxfix.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
Copy-Item $ModulePath $backupPath
Write-Host "Created backup: $backupPath" -ForegroundColor Yellow

# Read the file content
$content = Get-Content -Path $ModulePath -Raw -Encoding UTF8

# Fix critical syntax errors
Write-Host "Applying syntax fixes..." -ForegroundColor Cyan

# Fix 1: Remove malformed function declarations and fix basic structure
$content = $content -replace 'function\s*\{\s*', 'function Get-ModuleContext {'
$content = $content -replace '\$global\s*=\s*:MandA', '$global:MandA'
$content = $content -replace 'else\s*\{\s*throw', '} else { throw'
$content = $content -replace 'return\s*=\s*\$script:ModuleContext\s*\}\s*catch\s*=\s*\{', 'return $script:ModuleContext } catch {'

# Fix 2: Fix CmdletBinding syntax
$content = $content -replace '\[CmdletBinding\(\$null\)\]', '[CmdletBinding()]'

# Fix 3: Fix variable assignments with equals signs
$content = $content -replace '\$result\.Duration\s*=\s*\$nul\s*=\s*l', '$result.Duration = $null'
$content = $content -replace '\$stopwatch\s*=\s*\[System\.Diagnostics\.Stopwatch\]::StartNew\(\$null\)', '$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()'
$content = $content -replace '\$result\.Success\s*=\s*\$tru\s*=\s*e', '$result.Success = $true'

# Fix 4: Fix malformed if statements and catch blocks
$content = $content -replace 'if\s*=\s*\(', 'if ('
$content = $content -replace '\}\s*else\s*=\s*\{', '} else {'
$content = $content -replace '\}\s*catch\s*=\s*\{', '} catch {'
$content = $content -replace 'if\s*=\s*\(\$_.Exception\.InnerException\)', 'if ($_.Exception.InnerException)'

# Fix 5: Fix ArrayList initialization
$content = $content -replace '\[System\s*=\s*\.Collections\.ArrayList\]::new\(\$null\)', '[System.Collections.ArrayList]::new()'
$content = $content -replace 'Errors\s*=\s*\[System\s*=\s*\.Collections\.ArrayList\]::new\(\$null\)', 'Errors = [System.Collections.ArrayList]::new()'

# Fix 6: Fix logging function definitions
$content = $content -replace '\$LogInfo\s*=\s*\{\s*param\(\$MessageParam,\s*\$LevelParam="INFO\s*=\s*"\)', '$LogInfo = { param($MessageParam, $LevelParam="INFO")'
$content = $content -replace '\$LogError\s*=\s*\{\s*param\s*=\s*\(\$MessageParam\)', '$LogError = { param($MessageParam)'
$content = $content -replace '\$LogWarn\s*=\s*\{\s*param\s*=\s*\(\$MessageParam\)', '$LogWarn = { param($MessageParam)'
$content = $content -replace '\$LogDebug\s*=\s*\{\s*param\s*=\s*\(\$MessageParam\)', '$LogDebug = { param($MessageParam)'
$content = $content -replace '\$LogSuccess\s*=\s*\{\s*param\s*=\s*\(\$MessageParam\)', '$LogSuccess = { param($MessageParam)'

# Fix 7: Fix script scope variable references
$content = $content -replace '\$null\s*=\s*\$script\s*=\s*:AggregationStats\.', '$null = $script:AggregationStats.'
$content = $content -replace '\$script\s*=\s*:AggregationStats\.', '$script:AggregationStats.'

# Fix 8: Fix return statements and variable assignments
$content = $content -replace 'return\s*=\s*\$', 'return $'
$content = $content -replace '\$\w+\s*=\s*\$\w+\s*=\s*', '$1 = $2'

# Fix 9: Fix math operations
$content = $content -replace '\$percentComplete\s*=\s*\[math\s*=\s*\]::Round', '$percentComplete = [math]::Round'

# Fix 10: Fix string concatenations and assignments
$content = $content -replace '\$content\s*=\s*&\s*\$LogSuccess', '& $LogSuccess'
$content = $content -replace 'Also mapped to.*\}\s*\}', 'Also mapped to $mappedName for compatibility." } }'

# Fix 11: Fix function calls and method invocations
$content = $content -replace 'Invoke\s*=\s*-SourceSpecificEnrichment', 'Invoke-SourceSpecificEnrichment'
$content = $content -replace '\$loadStats\.TotalRecords\s*=\s*\$loadStats\s*=\s*\.TotalRecords', '$script:AggregationStats.TotalRecordsProcessed = $loadStats.TotalRecords'

# Fix 12: Fix incomplete function definitions
$content = $content -replace 'function\s+Invoke-DataSourceAnalysis\s*\{[^}]*param\(', 'function Invoke-DataSourceAnalysis { param('

# Fix 13: Fix malformed logging calls
$content = $content -replace '\$LogSuccess\s*=\s*\{\s*param\(\$MessageParam\)\s*Write-MandALog[^}]*\$LogError\s*=\s*\{\s*param\s*=\s*\(\$MessageParam\)', '$LogSuccess = { param($MessageParam) Write-MandALog -Message $MessageParam -Level "SUCCESS" -Component "DataAggregation" -Context $Context } $LogError = { param($MessageParam)'

# Fix 14: Fix complex assignment patterns
$content = $content -replace '(\$\w+)\s*=\s*(\$\w+)\s*=\s*', '$1 = $2'

# Fix 15: Fix method calls with malformed syntax
$content = $content -replace '\.ToLower\(\$null\)', '.ToLower()'
$content = $content -replace '\.Trim\(\$null\)', '.Trim()'

# Write the fixed content back to the file
$content | Set-Content -Path $ModulePath -Encoding UTF8 -NoNewline

Write-Host "Applied syntax fixes to DataAggregation.psm1" -ForegroundColor Green

# Test the syntax
try {
    $tokens = $null
    $parseErrors = $null
    $ast = [System.Management.Automation.Language.Parser]::ParseFile($ModulePath, [ref]$tokens, [ref]$parseErrors)
    
    if ($parseErrors.Count -eq 0) {
        Write-Host "SUCCESS: DataAggregation.psm1 syntax is now valid!" -ForegroundColor Green
    } else {
        Write-Host "REMAINING ISSUES: $($parseErrors.Count) parse errors still exist:" -ForegroundColor Yellow
        foreach ($error in $parseErrors | Select-Object -First 5) {
            Write-Host "  Line $($error.Extent.StartLineNumber): $($error.Message)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "ERROR: Failed to parse file: $_" -ForegroundColor Red
}

Write-Host "DataAggregation syntax fix completed!" -ForegroundColor Green