# Add Error Handling to Functions
# Adds try-catch blocks to functions that lack error handling

param(
    [string]$ModulesPath = "Modules",
    [switch]$CreateBackups = $true,
    [string[]]$TargetModuleTypes = @("Discovery", "Processing", "Export", "Utilities", "Authentication", "Connectivity")
)

function Write-FixLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "Gray" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Add-ErrorHandlingToFunction {
    param(
        [string]$FunctionContent,
        [string]$FunctionName
    )
    
    # Check if function already has try-catch
    if ($FunctionContent -match '\btry\s*\{') {
        return $FunctionContent
    }
    
    # Skip very simple functions (less than 3 lines of actual code)
    $codeLines = ($FunctionContent -split "`n" | Where-Object { $_ -match '\S' -and $_ -notmatch '^\s*#' }).Count
    if ($codeLines -lt 5) {
        return $FunctionContent
    }
    
    # Find the function body (everything after the param block or opening brace)
    if ($FunctionContent -match '(?s)(\s*param\s*\([^}]*\}\s*)(.*?)(\s*}?\s*)$') {
        $paramBlock = $matches[1]
        $functionBody = $matches[2].Trim()
        $closingBrace = $matches[3]
        
        # Wrap the function body in try-catch
        $wrappedBody = @"
    try {
        $functionBody
    } catch {
        Write-MandALog "Error in function '$FunctionName': `$(`$_.Exception.Message)" "ERROR"
        throw
    }
"@
        
        return $paramBlock + "`n" + $wrappedBody + $closingBrace
        
    } elseif ($FunctionContent -match '(?s)(\{)(.*?)(\}?\s*)$') {
        $openBrace = $matches[1]
        $functionBody = $matches[2].Trim()
        $closingBrace = $matches[3]
        
        # Wrap the function body in try-catch
        $wrappedBody = @"
    try {
        $functionBody
    } catch {
        Write-MandALog "Error in function '$FunctionName': `$(`$_.Exception.Message)" "ERROR"
        throw
    }
"@
        
        return $openBrace + "`n" + $wrappedBody + "`n" + $closingBrace
    }
    
    return $FunctionContent
}

function Add-ErrorHandlingToModule {
    param(
        [string]$ModulePath,
        [string]$ModuleName
    )
    
    Write-FixLog "Adding error handling to functions in $ModuleName" "INFO"
    
    try {
        # Read current content
        $content = Get-Content $ModulePath -Raw
        
        # Parse the content to find functions
        $tokens = $null
        $parseErrors = $null
        $ast = [System.Management.Automation.Language.Parser]::ParseInput($content, [ref]$tokens, [ref]$parseErrors)
        
        if ($parseErrors.Count -gt 0) {
            Write-FixLog "Parse errors in $ModuleName, skipping error handling additions" "WARN"
            return $false
        }
        
        # Find all function definitions
        $functionDefs = $ast.FindAll({$args[0] -is [System.Management.Automation.Language.FunctionDefinitionAst]}, $true)
        
        if ($functionDefs.Count -eq 0) {
            Write-FixLog "No functions found in $ModuleName" "INFO"
            return $true
        }
        
        $modifiedContent = $content
        $functionsModified = 0
        
        # Process functions in reverse order to maintain positions
        $sortedFunctions = $functionDefs | Sort-Object { $_.Extent.StartOffset } -Descending
        
        foreach ($func in $sortedFunctions) {
            # Skip functions that already have try-catch
            $funcContent = $func.ToString()
            if ($funcContent -match '\btry\s*\{') {
                continue
            }
            
            # Skip very simple functions
            $bodyContent = $func.Body.ToString()
            $codeLines = ($bodyContent -split "`n" | Where-Object { $_ -match '\S' -and $_ -notmatch '^\s*#' }).Count
            if ($codeLines -lt 3) {
                continue
            }
            
            # Skip getter/setter functions and simple return functions
            if ($func.Name -match '^(Get-|Set-)' -and $bodyContent.Length -lt 200) {
                continue
            }
            
            # Add error handling to this function
            $originalFuncText = $func.ToString()
            $modifiedFuncText = Add-ErrorHandlingToFunction -FunctionContent $originalFuncText -FunctionName $func.Name
            
            if ($modifiedFuncText -ne $originalFuncText) {
                $startPos = $func.Extent.StartOffset
                $endPos = $func.Extent.EndOffset
                $modifiedContent = $modifiedContent.Substring(0, $startPos) + $modifiedFuncText + $modifiedContent.Substring($endPos)
                $functionsModified++
            }
        }
        
        if ($functionsModified -gt 0) {
            # Write the updated content
            Set-Content $ModulePath $modifiedContent -Encoding UTF8
            Write-FixLog "Added error handling to $functionsModified functions in $ModuleName" "SUCCESS"
        } else {
            Write-FixLog "No functions needed error handling in $ModuleName" "INFO"
        }
        
        return $true
        
    } catch {
        Write-FixLog "Error processing $ModuleName`: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Main execution
Write-FixLog "Starting Error Handling Addition Process" "INFO"

$totalModules = 0
$successCount = 0
$errorCount = 0

foreach ($moduleType in $TargetModuleTypes) {
    $moduleDir = Join-Path $ModulesPath $moduleType
    
    if (-not (Test-Path $moduleDir)) {
        Write-FixLog "Module directory not found: $moduleDir" "WARN"
        continue
    }
    
    $modules = Get-ChildItem -Path $moduleDir -Filter "*.psm1"
    Write-FixLog "Found $($modules.Count) modules in $moduleType" "INFO"
    
    foreach ($module in $modules) {
        $totalModules++
        
        try {
            # Create backup if requested
            if ($CreateBackups) {
                $backupPath = "$($module.FullName).errorhandling.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
                Copy-Item $module.FullName $backupPath
            }
            
            # Extract module name from filename
            $moduleName = [System.IO.Path]::GetFileNameWithoutExtension($module.Name)
            
            # Add error handling
            if (Add-ErrorHandlingToModule -ModulePath $module.FullName -ModuleName $moduleName) {
                $successCount++
            } else {
                $errorCount++
            }
            
        } catch {
            Write-FixLog "Error processing $($module.Name): $($_.Exception.Message)" "ERROR"
            $errorCount++
        }
    }
}

Write-FixLog "Error Handling Addition Complete" "SUCCESS"
Write-FixLog "Total modules processed: $totalModules" "INFO"
Write-FixLog "Successfully processed: $successCount modules" "SUCCESS"
Write-FixLog "Errors encountered: $errorCount modules" $(if ($errorCount -eq 0) { "SUCCESS" } else { "WARN" })

# Test the fixes
Write-FixLog "Testing the fixes..." "INFO"
try {
    $testResult = & powershell -ExecutionPolicy Bypass -File "Scripts\Simple-ModuleValidator.ps1" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-FixLog "Validation test passed!" "SUCCESS"
    } else {
        Write-FixLog "Validation test completed - check for remaining issues" "INFO"
    }
} catch {
    Write-FixLog "Error running validation test: $($_.Exception.Message)" "ERROR"
}

Write-FixLog "Error handling addition process completed" "SUCCESS"