#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Quick Start Entry Point
.DESCRIPTION
    Simplified entry point that initializes the environment and delegates to the orchestrator.
    This version eliminates duplicate code and focuses on being a clean launcher.
.NOTES
    Version: 6.0.0
    Created: 2025-01-03
    Last Modified: 2025-01-03
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$CompanyName,

    [Parameter(Mandatory=$false)]
    [string]$ConfigurationFile,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("Discovery", "Processing", "Export", "Full", "AzureOnly")]
    [string]$Mode = "Full",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force,
    
    [Parameter(Mandatory=$false)]
    [switch]$ValidateOnly,
    
    [Parameter(Mandatory=$false)]
    [int]$ParallelThrottle = 5
)

# Set strict error handling
$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"

# Script constants
$script:Version = "6.0.0"
$script:StartTime = Get-Date

# Display banner
Write-Host "`n" -NoNewline
Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           M&A Discovery Suite v$script:Version - Quick Start             ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

try {
    # Step 1: Initialize Suite Environment
    Write-Host "Initializing M&A Discovery Suite environment..." -ForegroundColor Yellow
    
    $suiteRoot = $PSScriptRoot
    if (-not $suiteRoot) {
        $suiteRoot = Split-Path $MyInvocation.MyCommand.Path -Parent
    }
    
    $envScriptPath = Join-Path $suiteRoot "Scripts\Set-SuiteEnvironment.ps1"
    if (-not (Test-Path $envScriptPath)) {
        throw "Critical: Set-SuiteEnvironment.ps1 not found at: $envScriptPath"
    }
    
    # Get or prompt for company name
    if ([string]::IsNullOrWhiteSpace($CompanyName)) {
        if ($global:MandA -and $global:MandA.CompanyName) {
            $CompanyName = $global:MandA.CompanyName
            Write-Host "Using existing company context: $CompanyName" -ForegroundColor Green
        } else {
            # Check for existing profiles
            $profilesPath = "C:\MandADiscovery\Profiles"
            if (Test-Path $profilesPath) {
                $existingProfiles = Get-ChildItem -Path $profilesPath -Directory | 
                    Select-Object -ExpandProperty Name | Sort-Object
                
                if ($existingProfiles.Count -gt 0) {
                    Write-Host "`nExisting company profiles found:" -ForegroundColor Cyan
                    for ($i = 0; $i -lt $existingProfiles.Count; $i++) {
                        Write-Host "  $($i + 1). $($existingProfiles[$i])" -ForegroundColor White
                    }
                    Write-Host "  N. Create new company profile" -ForegroundColor Green
                    
                    do {
                        $selection = Read-Host "`nSelect a profile or 'N' for new"
                        if ($selection -match '^[Nn]$') {
                            $CompanyName = Read-Host "Enter new company name"
                            break
                        } elseif ($selection -match '^\d+$') {
                            $index = [int]$selection - 1
                            if ($index -ge 0 -and $index -lt $existingProfiles.Count) {
                                $CompanyName = $existingProfiles[$index]
                                break
                            }
                        }
                        Write-Host "Invalid selection. Please try again." -ForegroundColor Red
                    } while ($true)
                } else {
                    $CompanyName = Read-Host "Enter company name"
                }
            } else {
                $CompanyName = Read-Host "Enter company name"
            }
        }
    }
    
    # Sanitize company name
    $CompanyName = $CompanyName -replace '[<>:"/\\|?*]', '_'
    
    # Initialize environment
    Write-Host "Setting up environment for company: $CompanyName" -ForegroundColor Cyan
    . $envScriptPath -CompanyName $CompanyName -ProvidedSuiteRoot $suiteRoot
    
    if (-not $global:MandA -or -not $global:MandA.Initialized) {
        throw "Failed to initialize global environment"
    }
    
    Write-Host "✓ Environment initialized successfully" -ForegroundColor Green
    
    # Step 2: Prepare orchestrator parameters
    $orchestratorPath = Join-Path $global:MandA.Paths.Core "MandA-Orchestrator.ps1"
    if (-not (Test-Path $orchestratorPath)) {
        throw "Critical: MandA-Orchestrator.ps1 not found at: $orchestratorPath"
    }
    
    # Build parameter hashtable for splatting
    $orchestratorParams = @{
        CompanyName = $CompanyName
        Mode = $Mode
    }
    
    if (-not [string]::IsNullOrWhiteSpace($ConfigurationFile)) {
        $orchestratorParams['ConfigurationFile'] = $ConfigurationFile
    }
    
    if ($Force) {
        $orchestratorParams['Force'] = $true
    }
    
    if ($ValidateOnly) {
        $orchestratorParams['ValidateOnly'] = $true
    }
    
    if ($ParallelThrottle -ne 5) {
        $orchestratorParams['ParallelThrottle'] = $ParallelThrottle
    }
    
    # Step 3: Display execution plan
    Write-Host "`nExecution Plan:" -ForegroundColor Cyan
    Write-Host "  Company: $CompanyName" -ForegroundColor White
    Write-Host "  Mode: $Mode" -ForegroundColor White
    Write-Host "  Configuration: $(if ($ConfigurationFile) { $ConfigurationFile } else { 'default-config.json' })" -ForegroundColor White
    Write-Host "  Force Mode: $($Force.IsPresent)" -ForegroundColor White
    Write-Host "  Validate Only: $($ValidateOnly.IsPresent)" -ForegroundColor White
    Write-Host "  Parallel Throttle: $ParallelThrottle" -ForegroundColor White
    Write-Host ""
    
    # Step 4: Launch orchestrator
    Write-Host "Launching M&A Discovery Suite Orchestrator..." -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
    
    # Execute orchestrator with splatting
    & $orchestratorPath @orchestratorParams
    
    # Capture exit code
    $exitCode = $LASTEXITCODE
    
    # Display completion status
    $duration = (Get-Date) - $script:StartTime
    Write-Host "`n═══════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
    
    switch ($exitCode) {
        0 { 
            Write-Host "✓ M&A Discovery Suite completed successfully!" -ForegroundColor Green
            Write-Host "  Total execution time: $($duration.ToString('hh\:mm\:ss'))" -ForegroundColor Gray
        }
        1 { 
            Write-Host "⚠ M&A Discovery Suite completed with warnings" -ForegroundColor Yellow
            Write-Host "  Check logs for details" -ForegroundColor Yellow
        }
        2 { 
            Write-Host "✗ M&A Discovery Suite encountered critical errors" -ForegroundColor Red
            Write-Host "  Review error report in logs directory" -ForegroundColor Red
        }
        default { 
            Write-Host "✗ M&A Discovery Suite failed with exit code: $exitCode" -ForegroundColor Red
        }
    }
    
    # Display output locations
    if ($global:MandA -and $global:MandA.Paths) {
        Write-Host "`nOutput Locations:" -ForegroundColor Cyan
        Write-Host "  Logs: $($global:MandA.Paths.LogOutput)" -ForegroundColor Gray
        Write-Host "  Raw Data: $($global:MandA.Paths.RawDataOutput)" -ForegroundColor Gray
        Write-Host "  Processed: $($global:MandA.Paths.ProcessedDataOutput)" -ForegroundColor Gray
        Write-Host "  Exports: $($global:MandA.Paths.ExportOutput)" -ForegroundColor Gray
    }
    
    exit $exitCode
    
} catch {
    # Handle fatal errors
    Write-Host "`n✗ FATAL ERROR in QuickStart" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ScriptStackTrace) {
        Write-Host "`nStack Trace:" -ForegroundColor DarkRed
        Write-Host $_.ScriptStackTrace -ForegroundColor DarkGray
    }
    
    # Suggest troubleshooting steps
    Write-Host "`nTroubleshooting Steps:" -ForegroundColor Yellow
    Write-Host "  1. Verify all required files exist in the suite directory" -ForegroundColor Gray
    Write-Host "  2. Ensure you have appropriate permissions" -ForegroundColor Gray
    Write-Host "  3. Check that PowerShell 5.1 or higher is installed" -ForegroundColor Gray
    Write-Host "  4. Review any existing log files for more details" -ForegroundColor Gray
    
    exit 99
}