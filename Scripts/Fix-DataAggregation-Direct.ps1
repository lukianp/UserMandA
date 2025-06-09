# Direct fix for DataAggregation.psm1 critical syntax errors

$modulePath = "Modules/Processing/DataAggregation.psm1"

Write-Host "Fixing DataAggregation.psm1 directly..." -ForegroundColor Green

if (-not (Test-Path $modulePath)) {
    Write-Error "Module file not found: $modulePath"
    exit 1
}

# Create backup
$backupPath = "$modulePath.directfix.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
Copy-Item $modulePath $backupPath
Write-Host "Created backup: $backupPath" -ForegroundColor Yellow

# Read the file content
$content = Get-Content -Path $modulePath -Raw -Encoding UTF8

# Apply comprehensive fixes
$content = $content -replace 'function\s*\{\s*', 'function Get-ModuleContext {'
$content = $content -replace '\$global\s*=\s*:MandA', '$global:MandA'
$content = $content -replace 'else\s*\{\s*throw', '} else { throw'
$content = $content -replace 'return\s*=\s*\$script:ModuleContext\s*\}\s*catch\s*=\s*\{', 'return $script:ModuleContext } catch {'
$content = $content -replace '\[CmdletBinding\(\$null\)\]', '[CmdletBinding()]'
$content = $content -replace '\$result\.Duration\s*=\s*\$nul\s*=\s*l', '$result.Duration = $null'
$content = $content -replace '\$stopwatch\s*=\s*\[System\.Diagnostics\.Stopwatch\]::StartNew\(\$null\)', '$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()'
$content = $content -replace '\$result\.Success\s*=\s*\$tru\s*=\s*e', '$result.Success = $true'
$content = $content -replace 'if\s*=\s*\(', 'if ('
$content = $content -replace '\}\s*else\s*=\s*\{', '} else {'
$content = $content -replace '\}\s*catch\s*=\s*\{', '} catch {'
$content = $content -replace '\[System\s*=\s*\.Collections\.ArrayList\]::new\(\$null\)', '[System.Collections.ArrayList]::new()'
$content = $content -replace 'Errors\s*=\s*\[System\s*=\s*\.Collections\.ArrayList\]::new\(\$null\)', 'Errors = [System.Collections.ArrayList]::new()'
$content = $content -replace '\$LogInfo\s*=\s*\{\s*param\(\$MessageParam,\s*\$LevelParam="INFO\s*=\s*"\)', '$LogInfo = { param($MessageParam, $LevelParam="INFO")'
$content = $content -replace '\$LogError\s*=\s*\{\s*param\s*=\s*\(\$MessageParam\)', '$LogError = { param($MessageParam)'
$content = $content -replace '\$LogWarn\s*=\s*\{\s*param\s*=\s*\(\$MessageParam\)', '$LogWarn = { param($MessageParam)'
$content = $content -replace '\$LogDebug\s*=\s*\{\s*param\s*=\s*\(\$MessageParam\)', '$LogDebug = { param($MessageParam)'
$content = $content -replace '\$LogSuccess\s*=\s*\{\s*param\s*=\s*\(\$MessageParam\)', '$LogSuccess = { param($MessageParam)'
$content = $content -replace '\$null\s*=\s*\$script\s*=\s*:AggregationStats\.', '$null = $script:AggregationStats.'
$content = $content -replace '\$script\s*=\s*:AggregationStats\.', '$script:AggregationStats.'
$content = $content -replace 'return\s*=\s*\$', 'return $'
$content = $content -replace '\$percentComplete\s*=\s*\[math\s*=\s*\]::Round', '$percentComplete = [math]::Round'
$content = $content -replace 'Invoke\s*=\s*-SourceSpecificEnrichment', 'Invoke-SourceSpecificEnrichment'
$content = $content -replace '\.ToLower\(\$null\)', '.ToLower()'
$content = $content -replace '\.Trim\(\$null\)', '.Trim()'

# Fix the most critical syntax errors that cause parse failures
$content = $content -replace '(\$\w+)\s*=\s*(\$\w+)\s*=\s*', '$1 = $2'
$content = $content -replace '} catch = \{', '} catch {'
$content = $content -replace 'catch = \{', 'catch {'
$content = $content -replace 'else = \{', 'else {'
$content = $content -replace 'if = \(', 'if ('
$content = $content -replace 'return = ', 'return '
$content = $content -replace 'function = ', 'function '

# Write the fixed content back to the file
$content | Set-Content -Path $modulePath -Encoding UTF8 -NoNewline

Write-Host "Applied fixes to DataAggregation.psm1" -ForegroundColor Green

# Test the syntax
try {
    $tokens = $null
    $parseErrors = $null
    $ast = [System.Management.Automation.Language.Parser]::ParseFile($modulePath, [ref]$tokens, [ref]$parseErrors)
    
    if ($parseErrors.Count -eq 0) {
        Write-Host "SUCCESS: DataAggregation.psm1 syntax is now valid!" -ForegroundColor Green
    } else {
        Write-Host "REMAINING ISSUES: $($parseErrors.Count) parse errors still exist" -ForegroundColor Yellow
        foreach ($error in $parseErrors | Select-Object -First 5) {
            Write-Host "  Line $($error.Extent.StartLineNumber): $($error.Message)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "ERROR: Failed to parse file: $_" -ForegroundColor Red
}

Write-Host "DataAggregation direct fix completed!" -ForegroundColor Green