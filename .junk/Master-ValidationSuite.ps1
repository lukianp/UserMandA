# Master Validation Suite for M&A Discovery System
# Comprehensive validation combining syntax, structure, contracts, and runtime analysis

param(
    [string]$ModulesPath = "Modules",
    [string]$CorePath = "Core", 
    [string]$ConfigPath = "Configuration",
    [switch]$ExportResults,
    [switch]$FixIssues,
    [string]$OutputPath = "ValidationResults"
)

# Master validation context
$script:MasterValidation = @{
    StartTime = Get-Date
    SyntaxResults = @{}
    ContractResults = @{}
    RuntimeResults = @{}
    OverallStatus = "Unknown"
    TotalIssues = 0
    CriticalIssues = 0
    Recommendations = @()
}

function Write-MasterLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Component = "Master"
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        "HEADER" { "Cyan" }
        default { "Gray" }
    }
    
    Write-Host "[$timestamp] [$Component] $Message" -ForegroundColor $color
}

function Show-ValidationHeader {
    Write-Host ""
    Write-Host ("="*100) -ForegroundColor Cyan
    Write-Host "M&A DISCOVERY SUITE - COMPREHENSIVE VALIDATION SYSTEM" -ForegroundColor Cyan
    Write-Host ("="*100) -ForegroundColor Cyan
    Write-Host "PowerShell Version: $($PSVersionTable.PSVersion)" -ForegroundColor Gray
    Write-Host "Validation Time: $(Get-Date)" -ForegroundColor Gray
    Write-Host "Working Directory: $(Get-Location)" -ForegroundColor Gray
    Write-Host ""
}

function Invoke-BasicSyntaxValidation {
    Write-MasterLog "Phase 1: Basic Syntax Validation" "HEADER"
    
    try {
        $syntaxScript = "Scripts/Simple-SyntaxValidator.ps1"
        if (Test-Path $syntaxScript) {
            $result = & powershell -ExecutionPolicy Bypass -File $syntaxScript 2>&1
            $exitCode = $LASTEXITCODE
            
            $script:MasterValidation.SyntaxResults = @{
                ExitCode = $exitCode
                Output = $result
                Status = if ($exitCode -eq 0) { "PASS" } else { "FAIL" }
            }
            
            Write-MasterLog "Basic syntax validation completed with exit code: $exitCode" "INFO"
        } else {
            Write-MasterLog "Syntax validator not found at $syntaxScript" "WARN"
        }
    } catch {
        Write-MasterLog "Failed to run syntax validation: $($_.Exception.Message)" "ERROR"
        $script:MasterValidation.SyntaxResults.Status = "ERROR"
    }
}

function Invoke-ContractValidation {
    Write-MasterLog "Phase 2: Contract Validation" "HEADER"
    
    try {
        $contractScript = "Scripts/Orchestrator-ModuleContractValidator.ps1"
        if (Test-Path $contractScript) {
            $result = & powershell -ExecutionPolicy Bypass -File $contractScript 2>&1
            $exitCode = $LASTEXITCODE
            
            $script:MasterValidation.ContractResults = @{
                ExitCode = $exitCode
                Output = $result
                Status = if ($exitCode -eq 0) { "PASS" } else { "FAIL" }
            }
            
            Write-MasterLog "Contract validation completed with exit code: $exitCode" "INFO"
        } else {
            Write-MasterLog "Contract validator not found at $contractScript" "WARN"
        }
    } catch {
        Write-MasterLog "Failed to run contract validation: $($_.Exception.Message)" "ERROR"
        $script:MasterValidation.ContractResults.Status = "ERROR"
    }
}

function Invoke-RuntimeValidation {
    Write-MasterLog "Phase 3: Runtime Module Testing" "HEADER"
    
    try {
        $runtimeScript = "Scripts/Final-ModuleTest.ps1"
        if (Test-Path $runtimeScript) {
            $result = & powershell -ExecutionPolicy Bypass -File $runtimeScript 2>&1
            $exitCode = $LASTEXITCODE
            
            $script:MasterValidation.RuntimeResults = @{
                ExitCode = $exitCode
                Output = $result
                Status = if ($exitCode -eq 0) { "PASS" } else { "FAIL" }
            }
            
            Write-MasterLog "Runtime validation completed with exit code: $exitCode" "INFO"
        } else {
            Write-MasterLog "Runtime validator not found at $runtimeScript" "WARN"
        }
    } catch {
        Write-MasterLog "Failed to run runtime validation: $($_.Exception.Message)" "ERROR"
        $script:MasterValidation.RuntimeResults.Status = "ERROR"
    }
}

function Invoke-AutomaticFixes {
    if (-not $FixIssues) { return }
    
    Write-MasterLog "Phase 4: Automatic Issue Resolution" "HEADER"
    
    # Apply PowerShell 5.1 syntax fixes
    $ps51Script = "Scripts/Fix-PowerShell51Syntax.ps1"
    if (Test-Path $ps51Script) {
        Write-MasterLog "Applying PowerShell 5.1 syntax fixes..." "INFO"
        try {
            & powershell -ExecutionPolicy Bypass -File $ps51Script
            Write-MasterLog "PowerShell 5.1 syntax fixes applied" "SUCCESS"
        } catch {
            Write-MasterLog "Failed to apply PowerShell 5.1 fixes: $($_.Exception.Message)" "ERROR"
        }
    }
    
    # Apply Error variable conflict fixes
    $errorScript = "Scripts/Fix-ErrorVariableConflicts.ps1"
    if (Test-Path $errorScript) {
        Write-MasterLog "Applying Error variable conflict fixes..." "INFO"
        try {
            & powershell -ExecutionPolicy Bypass -File $errorScript
            Write-MasterLog "Error variable conflict fixes applied" "SUCCESS"
        } catch {
            Write-MasterLog "Failed to apply Error variable fixes: $($_.Exception.Message)" "ERROR"
        }
    }
}

function Analyze-ValidationResults {
    Write-MasterLog "Phase 5: Results Analysis" "HEADER"
    
    $passCount = 0
    $totalPhases = 3
    
    # Analyze syntax results
    if ($script:MasterValidation.SyntaxResults.Status -eq "PASS") {
        $passCount++
        Write-MasterLog "✓ Syntax validation: PASSED" "SUCCESS"
    } else {
        Write-MasterLog "✗ Syntax validation: FAILED" "ERROR"
        $script:MasterValidation.CriticalIssues++
    }
    
    # Analyze contract results
    if ($script:MasterValidation.ContractResults.Status -eq "PASS") {
        $passCount++
        Write-MasterLog "✓ Contract validation: PASSED" "SUCCESS"
    } else {
        Write-MasterLog "✗ Contract validation: FAILED" "ERROR"
        $script:MasterValidation.CriticalIssues++
    }
    
    # Analyze runtime results
    if ($script:MasterValidation.RuntimeResults.Status -eq "PASS") {
        $passCount++
        Write-MasterLog "✓ Runtime validation: PASSED" "SUCCESS"
    } else {
        Write-MasterLog "✗ Runtime validation: FAILED" "ERROR"
        $script:MasterValidation.CriticalIssues++
    }
    
    # Determine overall status
    if ($passCount -eq $totalPhases) {
        $script:MasterValidation.OverallStatus = "PASS"
    } elseif ($passCount -gt 0) {
        $script:MasterValidation.OverallStatus = "PARTIAL"
    } else {
        $script:MasterValidation.OverallStatus = "FAIL"
    }
    
    Write-MasterLog "Validation phases passed: $passCount/$totalPhases" "INFO"
}

function Generate-Recommendations {
    Write-MasterLog "Generating recommendations..." "INFO"
    
    $recommendations = @()
    
    # Syntax recommendations
    if ($script:MasterValidation.SyntaxResults.Status -ne "PASS") {
        $recommendations += "Run 'Scripts/Fix-PowerShell51Syntax.ps1' to resolve PowerShell 5.1 compatibility issues"
        $recommendations += "Run 'Scripts/Fix-ErrorVariableConflicts.ps1' to resolve variable naming conflicts"
    }
    
    # Contract recommendations
    if ($script:MasterValidation.ContractResults.Status -ne "PASS") {
        $recommendations += "Review orchestrator function calls to ensure proper parameter usage"
        $recommendations += "Implement missing error handling in discovery module invocations"
        $recommendations += "Ensure return values from discovery modules are properly captured and processed"
    }
    
    # Runtime recommendations
    if ($script:MasterValidation.RuntimeResults.Status -ne "PASS") {
        $recommendations += "Check module dependencies and ensure all required modules are available"
        $recommendations += "Verify module export statements and function definitions"
        $recommendations += "Test module loading in clean PowerShell 5.1 environment"
    }
    
    # General recommendations
    $recommendations += "Run validation suite regularly during development"
    $recommendations += "Implement automated validation in CI/CD pipeline"
    $recommendations += "Document any validation exceptions or known issues"
    
    $script:MasterValidation.Recommendations = $recommendations
}

function Show-ComprehensiveSummary {
    $duration = (Get-Date) - $script:MasterValidation.StartTime
    
    Write-Host ""
    Write-Host ("="*100) -ForegroundColor Cyan
    Write-Host "COMPREHENSIVE VALIDATION SUMMARY" -ForegroundColor Cyan
    Write-Host ("="*100) -ForegroundColor Cyan
    
    Write-Host "Validation Duration: $duration" -ForegroundColor Gray
    Write-Host "Overall Status: $($script:MasterValidation.OverallStatus)" -ForegroundColor $(
        switch ($script:MasterValidation.OverallStatus) {
            "PASS" { "Green" }
            "PARTIAL" { "Yellow" }
            "FAIL" { "Red" }
            default { "Gray" }
        }
    )
    Write-Host ""
    
    # Phase results
    Write-Host "VALIDATION PHASES:" -ForegroundColor White
    Write-Host "  Syntax Validation: $($script:MasterValidation.SyntaxResults.Status)" -ForegroundColor $(
        if ($script:MasterValidation.SyntaxResults.Status -eq "PASS") { "Green" } else { "Red" }
    )
    Write-Host "  Contract Validation: $($script:MasterValidation.ContractResults.Status)" -ForegroundColor $(
        if ($script:MasterValidation.ContractResults.Status -eq "PASS") { "Green" } else { "Red" }
    )
    Write-Host "  Runtime Validation: $($script:MasterValidation.RuntimeResults.Status)" -ForegroundColor $(
        if ($script:MasterValidation.RuntimeResults.Status -eq "PASS") { "Green" } else { "Red" }
    )
    Write-Host ""
    
    # Critical issues
    if ($script:MasterValidation.CriticalIssues -gt 0) {
        Write-Host "CRITICAL ISSUES: $($script:MasterValidation.CriticalIssues)" -ForegroundColor Red
        Write-Host "These issues must be resolved before deployment" -ForegroundColor Red
        Write-Host ""
    }
    
    # Recommendations
    if ($script:MasterValidation.Recommendations.Count -gt 0) {
        Write-Host "RECOMMENDATIONS:" -ForegroundColor Yellow
        foreach ($recommendation in $script:MasterValidation.Recommendations) {
            Write-Host "  • $recommendation" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    # Deployment readiness
    switch ($script:MasterValidation.OverallStatus) {
        "PASS" {
            Write-Host "🎯 DEPLOYMENT READY" -ForegroundColor Green
            Write-Host "All validation phases passed successfully" -ForegroundColor Green
        }
        "PARTIAL" {
            Write-Host "⚠️  DEPLOYMENT WITH CAUTION" -ForegroundColor Yellow
            Write-Host "Some validation phases failed - review issues before deployment" -ForegroundColor Yellow
        }
        "FAIL" {
            Write-Host "❌ NOT READY FOR DEPLOYMENT" -ForegroundColor Red
            Write-Host "Critical validation failures must be resolved" -ForegroundColor Red
        }
    }
    
    Write-Host ("="*100) -ForegroundColor Cyan
}

function Export-ValidationReport {
    if (-not $ExportResults) { return }
    
    Write-MasterLog "Exporting comprehensive validation report..." "INFO"
    
    if (-not (Test-Path $OutputPath)) {
        New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    
    # Export master summary
    $summaryPath = Join-Path $OutputPath "MasterValidationSummary_$timestamp.json"
    $masterSummary = @{
        Timestamp = Get-Date
        Duration = (Get-Date) - $script:MasterValidation.StartTime
        OverallStatus = $script:MasterValidation.OverallStatus
        CriticalIssues = $script:MasterValidation.CriticalIssues
        PhaseResults = @{
            Syntax = $script:MasterValidation.SyntaxResults.Status
            Contract = $script:MasterValidation.ContractResults.Status
            Runtime = $script:MasterValidation.RuntimeResults.Status
        }
        Recommendations = $script:MasterValidation.Recommendations
        PowerShellVersion = $PSVersionTable.PSVersion.ToString()
        WorkingDirectory = (Get-Location).Path
    }
    $masterSummary | ConvertTo-Json -Depth 3 | Set-Content $summaryPath
    
    # Export detailed results
    $detailsPath = Join-Path $OutputPath "DetailedValidationResults_$timestamp.json"
    $script:MasterValidation | ConvertTo-Json -Depth 5 | Set-Content $detailsPath
    
    Write-MasterLog "Validation report exported to $OutputPath" "SUCCESS"
}

function Start-MasterValidation {
    Show-ValidationHeader
    
    Write-MasterLog "Starting comprehensive validation suite..." "HEADER"
    
    # Phase 1: Basic syntax validation
    Invoke-BasicSyntaxValidation
    
    # Phase 2: Contract validation
    Invoke-ContractValidation
    
    # Phase 3: Runtime validation
    Invoke-RuntimeValidation
    
    # Phase 4: Automatic fixes (if requested)
    Invoke-AutomaticFixes
    
    # Phase 5: Analysis and recommendations
    Analyze-ValidationResults
    Generate-Recommendations
    
    # Show comprehensive summary
    Show-ComprehensiveSummary
    
    # Export results
    Export-ValidationReport
    
    # Return appropriate exit code
    switch ($script:MasterValidation.OverallStatus) {
        "PASS" { exit 0 }
        "PARTIAL" { exit 1 }
        "FAIL" { exit 2 }
        default { exit 3 }
    }
}

# Execute master validation
Start-MasterValidation