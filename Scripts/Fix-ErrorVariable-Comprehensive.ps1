# Comprehensive Fix for Error Variable Conflicts
# This script fixes all instances where modules try to overwrite the read-only $Error variable

param(
    [string]$ModulesPath = "Modules"
)

Write-Host "Fixing Error variable conflicts comprehensively..." -ForegroundColor Green

function Fix-ErrorVariableInFile {
    param([string]$FilePath)
    
    $fileName = Split-Path $FilePath -Leaf
    Write-Host "Processing: $fileName" -ForegroundColor Yellow
    
    # Read the file content
    $content = Get-Content -Path $FilePath -Raw -Encoding UTF8
    $originalContent = $content
    
    # Pattern 1: Direct assignment to $Error variable
    $content = $content -replace '\$Error\s*=', '$ModuleError ='
    
    # Pattern 2: References to $Error in catch blocks and error handling
    $content = $content -replace '} catch = \{', '} catch {'
    $content = $content -replace 'catch = \{', 'catch {'
    
    # Pattern 3: Fix malformed variable assignments that might be interpreted as $Error
    $content = $content -replace '(\$\w+)\s*=\s*(\$\w+)\s*=\s*', '$1 = $2'
    
    # Pattern 4: Fix specific Error variable usage patterns
    $content = $content -replace '\$script:AggregationStats\.Errors\.Add\("([^"]+)"\)\s*\|\s*Out-Null', '$null = $script:AggregationStats.Errors.Add("$1")'
    
    # Pattern 5: Fix malformed catch blocks that might create Error conflicts
    $content = $content -replace '} catch = \{([^}]*)\}', '} catch { $1 }'
    
    # Pattern 6: Fix incomplete statements that end with = {
    $content = $content -replace '(\w+)\s*=\s*\{', '$1 = {'
    
    # Pattern 7: Fix malformed function definitions
    $content = $content -replace 'function\s*=\s*(\w+)', 'function $1'
    
    # Pattern 8: Fix malformed return statements
    $content = $content -replace 'return\s*=\s*(\$\w+)', 'return $1'
    
    # Pattern 9: Fix malformed else statements
    $content = $content -replace 'else\s*=\s*\{', 'else {'
    
    # Pattern 10: Fix malformed if statements
    $content = $content -replace 'if\s*=\s*\(', 'if ('
    
    # Check if any changes were made
    if ($content -ne $originalContent) {
        Write-Host "  - Found and fixed Error variable conflicts and syntax issues" -ForegroundColor Cyan
        
        # Write the fixed content back to the file
        $content | Set-Content -Path $FilePath -Encoding UTF8 -NoNewline
        
        Write-Host "  - File updated successfully" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  - No Error variable conflicts found" -ForegroundColor Gray
        return $false
    }
}

# Get all PowerShell module files
$moduleFiles = Get-ChildItem -Path $ModulesPath -Filter "*.psm1" -Recurse

$totalFixed = 0
foreach ($file in $moduleFiles) {
    if (Fix-ErrorVariableInFile -FilePath $file.FullName) {
        $totalFixed++
    }
}

Write-Host "`nError variable conflict fix completed!" -ForegroundColor Green
Write-Host "Total files fixed: $totalFixed" -ForegroundColor Cyan

# Test the critical processing modules
$criticalModules = @(
    "Modules/Processing/DataAggregation.psm1",
    "Modules/Processing/UserProfileBuilder.psm1", 
    "Modules/Processing/WaveGeneration.psm1"
)

Write-Host "`nTesting critical processing modules..." -ForegroundColor Yellow
foreach ($modulePath in $criticalModules) {
    if (Test-Path $modulePath) {
        $moduleName = Split-Path $modulePath -Leaf
        try {
            $tokens = $null
            $parseErrors = $null
            $ast = [System.Management.Automation.Language.Parser]::ParseFile($modulePath, [ref]$tokens, [ref]$parseErrors)
            
            if ($parseErrors.Count -eq 0) {
                Write-Host "  ✓ $moduleName - SYNTAX VALID" -ForegroundColor Green
            } else {
                Write-Host "  ✗ $moduleName - $($parseErrors.Count) errors remaining" -ForegroundColor Red
                # Show first few errors
                foreach ($error in $parseErrors | Select-Object -First 3) {
                    Write-Host "    Line $($error.Extent.StartLineNumber): $($error.Message)" -ForegroundColor Red
                }
            }
        } catch {
            Write-Host "  ✗ $moduleName - PARSE FAILED: $_" -ForegroundColor Red
        }
    }
}