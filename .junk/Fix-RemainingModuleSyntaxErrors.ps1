# Fix Remaining Module Syntax Errors
# Targets the 21 modules that still have syntax issues after comprehensive fix

param(
    [string]$ModulesPath = "Modules",
    [switch]$CreateBackups = $true
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

function Get-SyntaxErrors {
    param([string]$FilePath)
    
    try {
        $content = Get-Content $FilePath -Raw -ErrorAction Stop
        $tokens = $null
        $parseErrors = $null
        $ast = [System.Management.Automation.Language.Parser]::ParseInput($content, [ref]$tokens, [ref]$parseErrors)
        
        return @{
            Content = $content
            Errors = $parseErrors
            IsValid = ($parseErrors.Count -eq 0)
        }
    } catch {
        return @{
            Content = $null
            Errors = @(@{ Message = $_.Exception.Message; Extent = @{ StartLineNumber = 0 } })
            IsValid = $false
        }
    }
}

function Fix-CommonSyntaxIssues {
    param([string]$Content, [string]$ModuleName)
    
    Write-FixLog "Applying targeted syntax fixes for $ModuleName" "INFO"
    
    $originalContent = $Content
    
    # Fix 1: Remove orphaned try blocks without catch
    $Content = $Content -replace '(?s)try\s*\{\s*([^}]*)\s*\}\s*(?!\s*catch)', '$1'
    
    # Fix 2: Fix incomplete catch blocks
    $Content = $Content -replace '(?s)catch\s*\{\s*\}\s*(?!\s*finally)', 'catch { throw }'
    
    # Fix 3: Fix missing closing braces for functions
    $Content = $Content -replace '(?s)(function\s+[\w-]+\s*\{[^}]*?)(\s*Export-ModuleMember)', '$1}$2'
    
    # Fix 4: Fix incomplete hash tables
    $Content = $Content -replace '@\{\s*([^}]*?)\s*$', '@{ $1 }'
    
    # Fix 5: Fix incomplete parameter blocks
    $Content = $Content -replace '(?s)param\s*\(\s*([^)]*?)\s*$', 'param($1)'
    
    # Fix 6: Fix missing statement blocks in switch statements
    $Content = $Content -replace '(?s)(\w+)\s*\{\s*([^}]*?)\s*\}(?=\s*\w+\s*\{)', '$1 { $2 }'
    
    # Fix 7: Fix incomplete if statements
    $Content = $Content -replace '(?s)if\s*\([^)]*\)\s*$', 'if ($&) { }'
    
    # Fix 8: Fix assignment expressions in wrong context
    $Content = $Content -replace '(\$\w+)\s*=\s*=', '$1 ='
    
    # Fix 9: Fix missing operators in hash literals
    $Content = $Content -replace '(\w+)\s*([^=\s][^=]*?)\s*}', '$1 = $2 }'
    
    # Fix 10: Fix incomplete expressions after parentheses
    $Content = $Content -replace '\(\s*\)', '($null)'
    
    if ($Content -ne $originalContent) {
        Write-FixLog "Applied syntax fixes to $ModuleName" "SUCCESS"
        return $Content
    } else {
        Write-FixLog "No automatic fixes applied to $ModuleName" "INFO"
        return $Content
    }
}

function Fix-SpecificModuleIssues {
    param([string]$Content, [string]$ModuleName)
    
    switch ($ModuleName) {
        "DataAggregation" {
            # Fix specific issues in DataAggregation
            $Content = $Content -replace 'catch\s*\{\s*Write-MandALog[^}]*\}\s*catch', 'catch { Write-MandALog "Error in DataAggregation: $($_.Exception.Message)" "ERROR"; throw }'
        }
        
        "UserProfileBuilder" {
            # Fix specific issues in UserProfileBuilder
            $Content = $Content -replace 'catch\s*\{\s*Write-MandALog[^}]*\}\s*catch', 'catch { Write-MandALog "Error in UserProfileBuilder: $($_.Exception.Message)" "ERROR"; throw }'
        }
        
        "WaveGeneration" {
            # Fix specific issues in WaveGeneration
            $Content = $Content -replace 'catch\s*\{\s*Write-MandALog[^}]*\}\s*catch', 'catch { Write-MandALog "Error in WaveGeneration: $($_.Exception.Message)" "ERROR"; throw }'
        }
        
        "PowerAppsExporter" {
            # Fix specific issues in PowerAppsExporter
            $Content = $Content -replace 'catch\s*\{\s*Write-MandALog[^}]*\}\s*catch', 'catch { Write-MandALog "Error in PowerAppsExporter: $($_.Exception.Message)" "ERROR"; throw }'
        }
        
        "ErrorHandling" {
            # Fix recursive error handling issues
            $Content = $Content -replace 'Write-MandALog.*catch.*Write-MandALog', 'Write-Host "Error in ErrorHandling module" -ForegroundColor Red'
        }
        
        "ErrorReporting" {
            # Fix error reporting circular references
            $Content = $Content -replace 'Write-MandALog.*catch.*Write-MandALog', 'Write-Host "Error in ErrorReporting module" -ForegroundColor Red'
        }
        
        "ProgressDisplay" {
            # Fix switch statement issues
            $Content = $Content -replace 'switch\s*\([^)]*\)\s*\{([^}]*)\}', {
                param($match)
                $switchContent = $match.Groups[1].Value
                $fixedContent = $switchContent -replace '(\w+)\s*\{([^}]*)\}', '$1 { $2 }'
                "switch ($($match.Groups[0].Value.Split('(')[1].Split(')')[0])) { $fixedContent }"
            }
        }
        
        "EnhancedConnectionManager" {
            # Fix connection manager switch issues
            $Content = $Content -replace 'switch\s*\([^)]*\)\s*\{([^}]*)\}', {
                param($match)
                $switchContent = $match.Groups[1].Value
                $fixedContent = $switchContent -replace '(\w+)\s*\{([^}]*)\}', '$1 { $2 }'
                "switch ($($match.Groups[0].Value.Split('(')[1].Split(')')[0])) { $fixedContent }"
            }
        }
    }
    
    return $Content
}

function Fix-ModuleSyntax {
    param([string]$ModulePath, [string]$ModuleName)
    
    Write-FixLog "Fixing syntax errors in $ModuleName" "INFO"
    
    # Get current syntax errors
    $syntaxResult = Get-SyntaxErrors -FilePath $ModulePath
    
    if ($syntaxResult.IsValid) {
        Write-FixLog "$ModuleName already has valid syntax" "SUCCESS"
        return $true
    }
    
    Write-FixLog "Found $($syntaxResult.Errors.Count) syntax errors in $ModuleName" "WARN"
    
    # Apply fixes
    $fixedContent = Fix-CommonSyntaxIssues -Content $syntaxResult.Content -ModuleName $ModuleName
    $fixedContent = Fix-SpecificModuleIssues -Content $fixedContent -ModuleName $ModuleName
    
    # Write the fixed content
    Set-Content $ModulePath $fixedContent -Encoding UTF8
    
    # Verify the fix
    $verifyResult = Get-SyntaxErrors -FilePath $ModulePath
    
    if ($verifyResult.IsValid) {
        Write-FixLog "Successfully fixed syntax errors in $ModuleName" "SUCCESS"
        return $true
    } else {
        Write-FixLog "Still has $($verifyResult.Errors.Count) syntax errors in $ModuleName" "WARN"
        foreach ($error in $verifyResult.Errors) {
            Write-FixLog "  Line $($error.Extent.StartLineNumber): $($error.Message)" "WARN"
        }
        return $false
    }
}

# Define the modules that need fixing based on the comprehensive report
$modulesToFix = @{
    "Processing" = @("DataAggregation", "UserProfileBuilder", "WaveGeneration")
    "Export" = @("PowerAppsExporter")
    "Utilities" = @(
        "AuthenticationMonitoring", "ConfigurationValidation", "EnhancedLogging",
        "ErrorHandling", "ErrorReporting", "ErrorReportingIntegration",
        "FileValidation", "ModuleHelpers", "ModulesHelper", "PerformanceMetrics",
        "PreFlightValidation", "ProgressDisplay", "ProgressTracking", "ValidationHelpers"
    )
    "Authentication" = @("CredentialManagement", "DiscoveryModuleBase")
    "Connectivity" = @("EnhancedConnectionManager")
}

Write-FixLog "Starting targeted syntax error fixes for remaining 21 modules" "INFO"

$totalFixed = 0
$totalErrors = 0

foreach ($category in $modulesToFix.Keys) {
    $categoryPath = Join-Path $ModulesPath $category
    
    if (-not (Test-Path $categoryPath)) {
        Write-FixLog "Category path not found: $categoryPath" "WARN"
        continue
    }
    
    Write-FixLog "Processing $category modules" "INFO"
    
    foreach ($moduleName in $modulesToFix[$category]) {
        $modulePath = Join-Path $categoryPath "$moduleName.psm1"
        
        if (-not (Test-Path $modulePath)) {
            Write-FixLog "Module not found: $modulePath" "WARN"
            continue
        }
        
        try {
            # Create backup if requested
            if ($CreateBackups) {
                $backupPath = "$modulePath.syntaxfix.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
                Copy-Item $modulePath $backupPath
            }
            
            if (Fix-ModuleSyntax -ModulePath $modulePath -ModuleName $moduleName) {
                $totalFixed++
            } else {
                $totalErrors++
            }
            
        } catch {
            Write-FixLog "Error processing $moduleName`: $($_.Exception.Message)" "ERROR"
            $totalErrors++
        }
    }
}

Write-FixLog "Syntax fix process completed" "SUCCESS"
Write-FixLog "Modules successfully fixed: $totalFixed" "SUCCESS"
Write-FixLog "Modules still with errors: $totalErrors" $(if ($totalErrors -eq 0) { "SUCCESS" } else { "WARN" })

# Run final validation
Write-FixLog "Running final validation..." "INFO"
try {
    $testResult = & powershell -ExecutionPolicy Bypass -File "Scripts\Simple-ModuleValidator.ps1" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-FixLog "Final validation PASSED! All modules are now valid." "SUCCESS"
    } else {
        Write-FixLog "Final validation completed - check results for remaining issues" "INFO"
    }
} catch {
    Write-FixLog "Error running final validation: $($_.Exception.Message)" "ERROR"
}

Write-FixLog "Targeted syntax fix process completed" "SUCCESS"