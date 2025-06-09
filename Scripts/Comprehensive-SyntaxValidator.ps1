# Comprehensive Syntax Validation and Error Checking Script
# This script performs thorough validation of all recently modified PowerShell files

param(
    [string[]]$FilesToCheck = @(
        "Core/MandA-Orchestrator.ps1",
        "Modules/Processing/DataAggregation.psm1",
        "Modules/Processing/DataValidation.psm1", 
        "Modules/Processing/UserProfileBuilder.psm1",
        "Modules/Processing/WaveGeneration.psm1",
        "Scripts/Fix-PowerShell51Syntax.ps1",
        "Scripts/Fix-ErrorVariableConflicts.ps1",
        "Scripts/Final-ModuleTest.ps1"
    )
)

Write-Host "=== COMPREHENSIVE SYNTAX VALIDATION ===" -ForegroundColor Cyan
Write-Host "PowerShell Version: $($PSVersionTable.PSVersion)" -ForegroundColor Gray
Write-Host "Validation Time: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

$validationResults = @()
$totalErrors = 0
$totalWarnings = 0

foreach ($filePath in $FilesToCheck) {
    if (-not (Test-Path $filePath)) {
        Write-Host "❌ FILE NOT FOUND: $filePath" -ForegroundColor Red
        $validationResults += [PSCustomObject]@{
            File = $filePath
            Status = "FILE_NOT_FOUND"
            Errors = @("File does not exist")
            Warnings = @()
            SyntaxValid = $false
        }
        continue
    }

    Write-Host "🔍 Validating: $filePath" -ForegroundColor Yellow
    
    $fileResult = [PSCustomObject]@{
        File = $filePath
        Status = "UNKNOWN"
        Errors = @()
        Warnings = @()
        SyntaxValid = $false
    }

    try {
        # Read file content
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
        
        if ([string]::IsNullOrWhiteSpace($content)) {
            $fileResult.Errors += "File is empty or contains only whitespace"
            $fileResult.Status = "EMPTY_FILE"
            Write-Host "  ❌ Empty file" -ForegroundColor Red
            continue
        }

        # 1. PowerShell Syntax Parsing
        Write-Host "  📝 Checking PowerShell syntax..." -ForegroundColor Gray
        $tokens = $null
        $parseErrors = $null
        
        try {
            $ast = [System.Management.Automation.Language.Parser]::ParseInput($content, [ref]$tokens, [ref]$parseErrors)
            
            if ($parseErrors.Count -gt 0) {
                foreach ($error in $parseErrors) {
                    $errorMsg = "Line $($error.Extent.StartLineNumber): $($error.Message)"
                    $fileResult.Errors += $errorMsg
                    Write-Host "    ❌ $errorMsg" -ForegroundColor Red
                }
            } else {
                Write-Host "    ✅ Syntax parsing successful" -ForegroundColor Green
                $fileResult.SyntaxValid = $true
            }
        } catch {
            $fileResult.Errors += "Failed to parse PowerShell syntax: $($_.Exception.Message)"
            Write-Host "    ❌ Parse error: $($_.Exception.Message)" -ForegroundColor Red
        }

        # 2. Check for common PowerShell 5.1 incompatibilities
        Write-Host "  🔧 Checking PowerShell 5.1 compatibility..." -ForegroundColor Gray
        
        # Check for .Where() method calls
        if ($content -match '\.Where\s*\(') {
            $fileResult.Errors += "Contains .Where() method calls - not compatible with PowerShell 5.1"
            Write-Host "    ❌ Found .Where() method calls" -ForegroundColor Red
        }
        
        # Check for Join-String cmdlet
        if ($content -match 'Join-String') {
            $fileResult.Errors += "Contains Join-String cmdlet - not available in PowerShell 5.1"
            Write-Host "    ❌ Found Join-String cmdlet usage" -ForegroundColor Red
        }

        # 3. Check for variable naming conflicts
        Write-Host "  🔍 Checking variable naming..." -ForegroundColor Gray
        
        # Check for Error variable conflicts
        if ($content -match '\$Error\s*=|\bError\s*=\s*\$null') {
            $fileResult.Errors += "Contains Error variable assignments that conflict with built-in `$Error variable"
            Write-Host "    ❌ Found Error variable conflicts" -ForegroundColor Red
        }

        # 4. Check for bracket/parentheses matching
        Write-Host "  🔗 Checking bracket matching..." -ForegroundColor Gray
        
        $openBrackets = ($content.ToCharArray() | Where-Object { $_ -eq '{' }).Count
        $closeBrackets = ($content.ToCharArray() | Where-Object { $_ -eq '}' }).Count
        $openParens = ($content.ToCharArray() | Where-Object { $_ -eq '(' }).Count
        $closeParens = ($content.ToCharArray() | Where-Object { $_ -eq ')' }).Count
        
        if ($openBrackets -ne $closeBrackets) {
            $fileResult.Errors += "Mismatched curly brackets: $openBrackets open, $closeBrackets close"
            Write-Host "    ❌ Mismatched curly brackets" -ForegroundColor Red
        }
        
        if ($openParens -ne $closeParens) {
            $fileResult.Errors += "Mismatched parentheses: $openParens open, $closeParens close"
            Write-Host "    ❌ Mismatched parentheses" -ForegroundColor Red
        }

        # 5. Check for undefined variables (basic check)
        Write-Host "  📊 Checking for potential undefined variables..." -ForegroundColor Gray
        
        # Look for common undefined variable patterns
        if ($content -match '\$[a-zA-Z_][a-zA-Z0-9_]*\s*\.\s*[a-zA-Z_][a-zA-Z0-9_]*' -and $content -notmatch '\$null') {
            # This is a basic check - more sophisticated analysis would require AST walking
            $fileResult.Warnings += "Potential undefined variable access detected - manual review recommended"
            Write-Host "    ⚠️  Potential undefined variable access" -ForegroundColor Yellow
        }

        # 6. Check for module-specific issues
        Write-Host "  🔧 Checking module-specific patterns..." -ForegroundColor Gray
        
        if ($filePath -like "*.psm1") {
            # Check for Export-ModuleMember
            if ($content -notmatch 'Export-ModuleMember') {
                $fileResult.Warnings += "Module file missing Export-ModuleMember statement"
                Write-Host "    ⚠️  Missing Export-ModuleMember" -ForegroundColor Yellow
            }
            
            # Check for #Requires statement
            if ($content -notmatch '#Requires\s+-Version') {
                $fileResult.Warnings += "Module file missing #Requires -Version statement"
                Write-Host "    ⚠️  Missing #Requires -Version" -ForegroundColor Yellow
            }
        }

        # 7. Check for encoding issues
        Write-Host "  📄 Checking file encoding..." -ForegroundColor Gray
        
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
            $fileResult.Warnings += "File has UTF-8 BOM - may cause issues in some environments"
            Write-Host "    ⚠️  UTF-8 BOM detected" -ForegroundColor Yellow
        }

        # Determine overall status
        if ($fileResult.Errors.Count -eq 0) {
            if ($fileResult.Warnings.Count -eq 0) {
                $fileResult.Status = "PASS"
                Write-Host "  ✅ VALIDATION PASSED" -ForegroundColor Green
            } else {
                $fileResult.Status = "PASS_WITH_WARNINGS"
                Write-Host "  ⚠️  PASSED WITH WARNINGS" -ForegroundColor Yellow
            }
        } else {
            $fileResult.Status = "FAIL"
            Write-Host "  ❌ VALIDATION FAILED" -ForegroundColor Red
        }

    } catch {
        $fileResult.Errors += "Validation exception: $($_.Exception.Message)"
        $fileResult.Status = "EXCEPTION"
        Write-Host "  ❌ Validation exception: $($_.Exception.Message)" -ForegroundColor Red
    }

    $validationResults += $fileResult
    $totalErrors += $fileResult.Errors.Count
    $totalWarnings += $fileResult.Warnings.Count
    
    Write-Host ""
}

# Summary Report
Write-Host "=== VALIDATION SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total Files Checked: $($validationResults.Count)" -ForegroundColor White
Write-Host "Total Errors: $totalErrors" -ForegroundColor $(if ($totalErrors -eq 0) { "Green" } else { "Red" })
Write-Host "Total Warnings: $totalWarnings" -ForegroundColor $(if ($totalWarnings -eq 0) { "Green" } else { "Yellow" })
Write-Host ""

$passCount = ($validationResults | Where-Object { $_.Status -eq "PASS" }).Count
$passWithWarningsCount = ($validationResults | Where-Object { $_.Status -eq "PASS_WITH_WARNINGS" }).Count
$failCount = ($validationResults | Where-Object { $_.Status -eq "FAIL" }).Count

Write-Host "Files Status:" -ForegroundColor White
Write-Host "  ✅ PASS: $passCount" -ForegroundColor Green
Write-Host "  ⚠️  PASS WITH WARNINGS: $passWithWarningsCount" -ForegroundColor Yellow
Write-Host "  ❌ FAIL: $failCount" -ForegroundColor Red
Write-Host ""

# Detailed Error Report
if ($totalErrors -gt 0) {
    Write-Host "=== DETAILED ERROR REPORT ===" -ForegroundColor Red
    foreach ($result in $validationResults | Where-Object { $_.Errors.Count -gt 0 }) {
        Write-Host "📁 $($result.File):" -ForegroundColor Yellow
        foreach ($error in $result.Errors) {
            Write-Host "  ❌ $error" -ForegroundColor Red
        }
        Write-Host ""
    }
}

# Return exit code based on results
if ($failCount -gt 0) {
    Write-Host "❌ VALIDATION FAILED - $failCount files have errors" -ForegroundColor Red
    exit 1
} elseif ($totalWarnings -gt 0) {
    Write-Host "⚠️  VALIDATION PASSED WITH WARNINGS - Review recommended" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "✅ ALL VALIDATIONS PASSED" -ForegroundColor Green
    exit 0
}