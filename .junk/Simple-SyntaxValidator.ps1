# Simple Syntax Validation Script
# Validates PowerShell files for basic syntax and compatibility issues

param(
    [string[]]$FilesToCheck = @(
        "Core/MandA-Orchestrator.ps1",
        "Modules/Processing/DataAggregation.psm1",
        "Modules/Processing/DataValidation.psm1", 
        "Modules/Processing/UserProfileBuilder.psm1",
        "Modules/Processing/WaveGeneration.psm1"
    )
)

Write-Host "=== SYNTAX VALIDATION REPORT ===" -ForegroundColor Cyan
Write-Host "PowerShell Version: $($PSVersionTable.PSVersion)" -ForegroundColor Gray
Write-Host ""

$totalFiles = 0
$passedFiles = 0
$failedFiles = 0

foreach ($filePath in $FilesToCheck) {
    $totalFiles++
    Write-Host "Checking: $filePath" -ForegroundColor Yellow
    
    if (-not (Test-Path $filePath)) {
        Write-Host "  ERROR: File not found" -ForegroundColor Red
        $failedFiles++
        continue
    }

    try {
        # Read file content
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
        
        if ([string]::IsNullOrWhiteSpace($content)) {
            Write-Host "  ERROR: File is empty" -ForegroundColor Red
            $failedFiles++
            continue
        }

        # Test PowerShell syntax parsing
        $tokens = $null
        $parseErrors = $null
        
        try {
            $ast = [System.Management.Automation.Language.Parser]::ParseInput($content, [ref]$tokens, [ref]$parseErrors)
            
            if ($parseErrors.Count -gt 0) {
                Write-Host "  SYNTAX ERRORS:" -ForegroundColor Red
                foreach ($error in $parseErrors) {
                    Write-Host "    Line $($error.Extent.StartLineNumber): $($error.Message)" -ForegroundColor Red
                }
                $failedFiles++
                continue
            }
        } catch {
            Write-Host "  PARSE ERROR: $($_.Exception.Message)" -ForegroundColor Red
            $failedFiles++
            continue
        }

        # Check for PowerShell 5.1 compatibility issues
        $compatibilityIssues = @()
        
        # Check for .Where() method calls
        if ($content -match '\.Where\s*\(') {
            $compatibilityIssues += ".Where() method calls found (PowerShell 6+ syntax)"
        }
        
        # Check for Join-String cmdlet
        if ($content -match 'Join-String') {
            $compatibilityIssues += "Join-String cmdlet found (not available in PowerShell 5.1)"
        }
        
        # Check for Error variable conflicts
        if ($content -match '\bError\s*=\s*\$null') {
            $compatibilityIssues += "Error variable assignment conflicts with built-in variable"
        }

        if ($compatibilityIssues.Count -gt 0) {
            Write-Host "  COMPATIBILITY ISSUES:" -ForegroundColor Yellow
            foreach ($issue in $compatibilityIssues) {
                Write-Host "    - $issue" -ForegroundColor Yellow
            }
        }

        # Check bracket matching
        $openBrackets = ($content.ToCharArray() | Where-Object { $_ -eq '{' }).Count
        $closeBrackets = ($content.ToCharArray() | Where-Object { $_ -eq '}' }).Count
        
        if ($openBrackets -ne $closeBrackets) {
            Write-Host "  ERROR: Mismatched brackets - $openBrackets open, $closeBrackets close" -ForegroundColor Red
            $failedFiles++
            continue
        }

        Write-Host "  PASSED" -ForegroundColor Green
        $passedFiles++

    } catch {
        Write-Host "  VALIDATION ERROR: $($_.Exception.Message)" -ForegroundColor Red
        $failedFiles++
    }
    
    Write-Host ""
}

# Summary
Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total Files: $totalFiles" -ForegroundColor White
Write-Host "Passed: $passedFiles" -ForegroundColor Green
Write-Host "Failed: $failedFiles" -ForegroundColor Red

if ($failedFiles -eq 0) {
    Write-Host "All files passed syntax validation!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "$failedFiles files failed validation" -ForegroundColor Red
    exit 1
}