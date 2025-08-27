#Requires -Version 7.0
<#
.SYNOPSIS
    Comprehensive test launcher for M&A Discovery Suite validation
.DESCRIPTION
    Orchestrates data generation and validation testing in sequence
.NOTES
    Author: Automated Test & Data Validation Agent
    Version: 1.0.0
#>

param(
    [ValidateSet("Full", "ValidationOnly", "DataGenOnly")]
    [string]$Mode = "Full",
    [int]$DataGenDurationMinutes = 3,
    [int]$ValidationDurationMinutes = 5,
    [switch]$IncludeDummyData,
    [switch]$IncludeErrors,
    [switch]$OpenReportAutomatically = $true,
    [string]$ReportPath = ".\ValidationReport_$(Get-Date -Format 'yyyyMMdd_HHmmss').html"
)

# Color functions
function Write-Banner {
    param([string]$Text, [string]$Color = "Cyan")
    
    $border = "═" * ($Text.Length + 4)
    Write-Host "╔$border╗" -ForegroundColor $Color
    Write-Host "║  $Text  ║" -ForegroundColor $Color
    Write-Host "╚$border╝" -ForegroundColor $Color
    Write-Host ""
}

function Write-Step {
    param([string]$Text, [int]$Step)
    Write-Host "📋 Step $Step`: $Text" -ForegroundColor Yellow
}

function Write-Status {
    param([string]$Text, [string]$Status = "Info")
    $color = switch ($Status) {
        "Success" { "Green" }
        "Warning" { "Yellow" }
        "Error" { "Red" }
        default { "White" }
    }
    Write-Host "   $Text" -ForegroundColor $color
}

# Main execution
try {
    Write-Banner "M&A Discovery Suite - Full Validation Test Suite"
    
    Write-Host "🎯 Configuration:" -ForegroundColor Cyan
    Write-Host "   Mode: $Mode" -ForegroundColor White
    Write-Host "   Data Generation: $DataGenDurationMinutes minutes" -ForegroundColor White
    Write-Host "   Validation Test: $ValidationDurationMinutes minutes" -ForegroundColor White
    Write-Host "   Include Dummy Data: $IncludeDummyData" -ForegroundColor White
    Write-Host "   Include Errors: $IncludeErrors" -ForegroundColor White
    Write-Host "   Report Path: $ReportPath" -ForegroundColor White
    Write-Host ""
    
    if ($Mode -eq "Full" -or $Mode -eq "DataGenOnly") {
        Write-Step "Starting Data Generation Simulation" 1
        
        # Check if data generator exists
        $dataGenScript = Join-Path $PSScriptRoot "Test-DataGenerator.ps1"
        if (-not (Test-Path $dataGenScript)) {
            Write-Status "Data generator script not found: $dataGenScript" "Error"
            throw "Required script missing"
        }
        
        # Build parameters for data generator
        $dataGenParams = @{
            DurationMinutes = $DataGenDurationMinutes
            Verbose = $true
        }
        if ($IncludeDummyData) { $dataGenParams.IncludeDummyData = $true }
        if ($IncludeErrors) { $dataGenParams.IncludeErrors = $true }
        
        # Start data generation in background
        Write-Status "Launching data generation process..." "Info"
        $dataGenJob = Start-Job -ScriptBlock {
            param($ScriptPath, $Params)
            & $ScriptPath @Params
        } -ArgumentList $dataGenScript, $dataGenParams
        
        Write-Status "Data generation started (Job ID: $($dataGenJob.Id))" "Success"
        
        if ($Mode -eq "DataGenOnly") {
            Write-Status "Waiting for data generation to complete..." "Info"
            Wait-Job $dataGenJob | Out-Null
            $dataGenResults = Receive-Job $dataGenJob
            Remove-Job $dataGenJob
            
            Write-Host "`n📊 Data Generation Results:" -ForegroundColor Green
            $dataGenResults | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
            
            Write-Status "Data generation completed successfully!" "Success"
            return
        }
    }
    
    if ($Mode -eq "Full" -or $Mode -eq "ValidationOnly") {
        if ($Mode -eq "Full") {
            Write-Step "Waiting for Initial Data Generation" 2
            Write-Status "Allowing time for data files to be created..." "Info"
            Start-Sleep -Seconds 10
        }
        
        Write-Step "Starting Real-Time Data Validation" $(if ($Mode -eq "Full") { 3 } else { 1 })
        
        # Check if validation script exists
        $validationScript = Join-Path $PSScriptRoot "Test-RealTimeDataValidation.ps1"
        if (-not (Test-Path $validationScript)) {
            Write-Status "Validation script not found: $validationScript" "Error"
            throw "Required script missing"
        }
        
        # Build parameters for validation
        $validationParams = @{
            TestDurationMinutes = $ValidationDurationMinutes
            ReportPath = $ReportPath
            Verbose = $true
        }
        
        Write-Status "Launching validation suite..." "Info"
        
        # Run validation script
        try {
            & $validationScript @validationParams
            Write-Status "Validation completed successfully!" "Success"
        } catch {
            Write-Status "Validation encountered errors: $_" "Error"
            throw $_
        }
        
        if ($Mode -eq "Full") {
            Write-Step "Cleaning Up Background Processes" 4
            
            # Stop data generation if still running
            if ($dataGenJob -and $dataGenJob.State -eq "Running") {
                Write-Status "Stopping data generation job..." "Info"
                Stop-Job $dataGenJob
                Remove-Job $dataGenJob -Force
                Write-Status "Data generation stopped" "Success"
            }
        }
    }
    
    # Final summary
    Write-Host "`n" -NoNewline
    Write-Banner "VALIDATION SUITE COMPLETED" "Green"
    
    Write-Host "✅ Results Summary:" -ForegroundColor Green
    if ($Mode -eq "Full" -or $Mode -eq "DataGenOnly") {
        Write-Status "Data generation: Completed" "Success"
    }
    if ($Mode -eq "Full" -or $Mode -eq "ValidationOnly") {
        Write-Status "Real-time validation: Completed" "Success"
        Write-Status "Detailed report: $ReportPath" "Info"
        
        if ($OpenReportAutomatically -and (Test-Path $ReportPath)) {
            Write-Status "Opening validation report..." "Info"
            Start-Process $ReportPath
        }
    }
    
    Write-Host "`n🎉 All tests completed successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ Test suite failed: $_" -ForegroundColor Red
    
    # Clean up any running jobs
    if ($dataGenJob) {
        Stop-Job $dataGenJob -ErrorAction SilentlyContinue
        Remove-Job $dataGenJob -Force -ErrorAction SilentlyContinue
    }
    
    exit 1
}

# Usage examples
Write-Host "`n💡 Usage Examples:" -ForegroundColor Cyan
Write-Host "   Full suite:           .\Start-FullValidationSuite.ps1" -ForegroundColor White
Write-Host "   Validation only:      .\Start-FullValidationSuite.ps1 -Mode ValidationOnly" -ForegroundColor White
Write-Host "   With errors:          .\Start-FullValidationSuite.ps1 -IncludeErrors" -ForegroundColor White
Write-Host "   Extended testing:     .\Start-FullValidationSuite.ps1 -ValidationDurationMinutes 10" -ForegroundColor White