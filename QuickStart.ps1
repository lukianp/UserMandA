#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Quick Start Entry Point (Rewritten v6.0.0)
.DESCRIPTION
    User-friendly entry point to initialize the M&A Discovery Suite environment for a specific company
    and then launch the main orchestrator. This script ensures the environment is correctly
    set up before any operations begin.
.PARAMETER CompanyName
    The name of the company for which the discovery operations will be run.
    This determines the profile directory for outputs, logs, and credentials.
    If not provided, the script will attempt to list existing profiles or prompt for a name.
.PARAMETER ConfigurationFile
    Optional. Path to a specific JSON configuration file to use.
    If not provided, the 'default-config.json' within the suite's 'Configuration' directory will be used.
.PARAMETER Mode
    Specifies the operation mode for the orchestrator.
    Valid values: "Discovery", "Processing", "Export", "Full", "AzureOnly". Default is "Full".
.PARAMETER Force
    Optional. Switch to force certain operations, like overwriting existing discovery files.
.PARAMETER ValidateOnly
    Optional. Switch to perform validation checks only, without executing discovery, processing, or export.
.PARAMETER ParallelThrottle
    Optional. Overrides the 'maxConcurrentJobs' setting in the configuration for parallel discovery. Default is 5.
.NOTES
    Version: 6.0.0 (Rewritten)
    Author: M&A Discovery Team (Based on original by Lukian Poleschtschuk, enhanced by Gemini)
    Purpose: To provide a clean, robust, and user-friendly way to start the M&A Discovery Suite.
#>

[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [Parameter(Mandatory = $false)]
    [string]$CompanyName,

    [Parameter(Mandatory = $false)]
    [string]$ConfigurationFile,

    [Parameter(Mandatory = $false)]
    [ValidateSet("Discovery", "Processing", "Export", "Full", "AzureOnly")]
    [string]$Mode = "Full",

    [Parameter(Mandatory = $false)]
    [switch]$Force,

    [Parameter(Mandatory = $false)]
    [switch]$ValidateOnly,

    [Parameter(Mandatory = $false)]
    [int]$ParallelThrottle = 5 # Note: Orchestrator will primarily use config's maxConcurrentJobs
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"
$script:QuickStartTime = Get-Date
$script:QuickStartVersion = "6.0.0 (Rewritten)"

Write-Host "`n" -NoNewline
Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        M&A Discovery Suite v$($script:QuickStartVersion) - Quick Start        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

try {
    # --- Determine Suite Root ---
    $SuiteRoot = $PSScriptRoot
    if (-not $SuiteRoot -or $SuiteRoot -eq $null) { # Fallback if $PSScriptRoot is not available (e.g. ISE)
        $SuiteRoot = Split-Path $MyInvocation.MyCommand.Path -Parent
    }
    if (-not (Test-Path $SuiteRoot -PathType Container)) {
        throw "CRITICAL: Cannot determine the Suite Root directory. QuickStart.ps1 seems to be in an unexpected location."
    }
    Write-Host "[QuickStart] Suite Root detected: $SuiteRoot" -ForegroundColor DarkGray

    # --- Get or Prompt for CompanyName ---
    if ([string]::IsNullOrWhiteSpace($CompanyName)) {
        Write-Host "[QuickStart] CompanyName not provided. Checking existing profiles or prompting..." -ForegroundColor Yellow
        $ProfilesBasePath = Join-Path $SuiteRoot "Profiles" # Standard relative path for profiles
        if (-not (Test-Path $ProfilesBasePath)) { # Check relative to SuiteRoot first
            $ProfilesBasePath = "C:\MandADiscovery\Profiles" # Fallback to absolute if relative doesn't exist
        }

        if (-not (Test-Path $ProfilesBasePath)) {
            try {
                New-Item -Path $ProfilesBasePath -ItemType Directory -Force -ErrorAction Stop | Out-Null
                Write-Host "[QuickStart] Created default profiles directory: $ProfilesBasePath" -ForegroundColor Green
            } catch {
                # If cannot create default, prompt directly without listing.
            }
        }

        $ExistingProfiles = @()
        if (Test-Path $ProfilesBasePath -PathType Container) {
            $ExistingProfiles = Get-ChildItem -Path $ProfilesBasePath -Directory -ErrorAction SilentlyContinue |
                Select-Object -ExpandProperty Name | Sort-Object
        }

        if ($ExistingProfiles.Count -gt 0) {
            Write-Host "`n[QuickStart] Existing company profiles found in '$ProfilesBasePath':" -ForegroundColor Cyan
            for ($i = 0; $i -lt $ExistingProfiles.Count; $i++) {
                Write-Host "  $($i + 1). $($ExistingProfiles[$i])" -ForegroundColor White
            }
            Write-Host "  N. Create new company profile" -ForegroundColor Green

            do {
                $Selection = Read-Host "`n[QuickStart] Select a profile number or 'N' for new"
                if ($Selection -match '^[Nn]$') {
                    $CompanyName = Read-Host "[QuickStart] Enter new company name"
                    break
                }
                elseif ($Selection -match '^\d+$') {
                    $Index = [int]$Selection - 1
                    if ($Index -ge 0 -and $Index -lt $ExistingProfiles.Count) {
                        $CompanyName = $ExistingProfiles[$Index]
                        break
                    }
                }
                Write-Host "[QuickStart] Invalid selection. Please try again." -ForegroundColor Red
            } while ($true)
        }
        else {
            $CompanyName = Read-Host "[QuickStart] No existing profiles found. Enter company name for new profile"
        }
    }

    if ([string]::IsNullOrWhiteSpace($CompanyName)) {
        throw "CRITICAL: CompanyName is required to proceed."
    }
    $CompanyName = $CompanyName -replace '[<>:"/\\|?*]', '_' # Sanitize
    Write-Host "[QuickStart] Operating for Company: $CompanyName" -ForegroundColor Green

    # --- Initialize Suite Environment via Set-SuiteEnvironment.ps1 ---
    Write-Host "[QuickStart] Initializing M&A Discovery Suite environment via Set-SuiteEnvironment.ps1..." -ForegroundColor Yellow
    $EnvScriptPath = Join-Path $SuiteRoot "Scripts\Set-SuiteEnvironment.ps1"
    if (-not (Test-Path $EnvScriptPath -PathType Leaf)) {
        throw "CRITICAL: Set-SuiteEnvironment.ps1 not found at: $EnvScriptPath"
    }

    # Source the environment script. It will populate $global:MandA
    . $EnvScriptPath -CompanyName $CompanyName -ProvidedSuiteRoot $SuiteRoot

    if (-not $global:MandA -or -not $global:MandA.Initialized) {
        throw "CRITICAL: Failed to initialize global M&A environment context (`$global:MandA`) via Set-SuiteEnvironment.ps1."
    }
    Write-Host "[QuickStart] ✓ M&A Suite Environment initialized successfully for '$($global:MandA.CompanyName)'." -ForegroundColor Green
    Write-Host "[QuickStart]   Log output path: $($global:MandA.Paths.LogOutput)" -ForegroundColor DarkGray
    Write-Host "[QuickStart]   Credential file path: $($global:MandA.Paths.CredentialFile)" -ForegroundColor DarkGray

    # --- Prepare Orchestrator Parameters ---
    $OrchestratorPath = $global:MandA.Paths.OrchestratorScript # Get from global context
    if (-not (Test-Path $OrchestratorPath -PathType Leaf)) {
        throw "CRITICAL: MandA-Orchestrator.ps1 not found at expected path: $OrchestratorPath (from `$global:MandA.Paths.OrchestratorScript)"
    }

    $OrchestratorParams = @{
        CompanyName = $global:MandA.CompanyName # Use company name from global context
        Mode = $Mode
    }
    if ($PSBoundParameters.ContainsKey('ConfigurationFile')) {
        $OrchestratorParams['ConfigurationFile'] = $ConfigurationFile
    }
    if ($Force.IsPresent) {
        $OrchestratorParams['Force'] = $true
    }
    if ($ValidateOnly.IsPresent) {
        $OrchestratorParams['ValidateOnly'] = $true
    }
    # ParallelThrottle is passed for consistency, but Orchestrator will use config's maxConcurrentJobs primarily.
    # It can be an override if the orchestrator is designed to accept it.
    if ($PSBoundParameters.ContainsKey('ParallelThrottle')) {
        $OrchestratorParams['ParallelThrottle'] = $ParallelThrottle
    }

    # --- Display Execution Plan ---
    Write-Host "`n[QuickStart] Execution Plan:" -ForegroundColor Cyan
    Write-Host "  Company: $($OrchestratorParams.CompanyName)" -ForegroundColor White
    Write-Host "  Mode: $($OrchestratorParams.Mode)" -ForegroundColor White
    Write-Host "  Configuration: $(if ($OrchestratorParams.ConfigurationFile) { $OrchestratorParams.ConfigurationFile } else { $global:MandA.Paths.ConfigFile })" -ForegroundColor White
    Write-Host "  Force Mode: $($OrchestratorParams.Force | Out-String).Trim()" -ForegroundColor White
    Write-Host "  Validate Only: $($OrchestratorParams.ValidateOnly | Out-String).Trim()" -ForegroundColor White
    Write-Host "  Parallel Throttle (Parameter): $($OrchestratorParams.ParallelThrottle | Out-String).Trim()" -ForegroundColor White
    Write-Host ""

    # --- Launch Orchestrator ---
    Write-Host "[QuickStart] Launching M&A Discovery Suite Orchestrator..." -ForegroundColor Yellow
    Write-Host ("═" * 75) -ForegroundColor DarkGray

    & $OrchestratorPath @OrchestratorParams
    $ExitCode = $LASTEXITCODE

    # --- Display Completion Status ---
    $Duration = (Get-Date) - $script:QuickStartTime
    Write-Host "`n" + ("═" * 75) -ForegroundColor DarkGray

    #FIX: Replaced emojis with ASCII equivalents
    switch ($ExitCode) {
        0 { Write-Host "[QuickStart] [OK] M&A Discovery Suite completed successfully!" -ForegroundColor Green }
        1 { Write-Host "[QuickStart] [WARNING] M&A Discovery Suite completed with warnings. Check logs for details." -ForegroundColor Yellow }
        2 { Write-Host "[QuickStart] [ERROR] M&A Discovery Suite encountered critical errors. Review error report in logs directory." -ForegroundColor Red }
        default { Write-Host "[QuickStart] [FAILURE] M&A Discovery Suite failed with exit code: $ExitCode." -ForegroundColor Red }
    }
    #FIX: Ensured $Duration.ToString format string is valid and $Duration is correctly initialized. No change needed if $Duration is TimeSpan.
    Write-Host "[QuickStart]   Total execution time (QuickStart): $($Duration.ToString('hh\:mm\:ss'))" -ForegroundColor DarkGray

    if ($global:MandA -and $global:MandA.Paths) {
        Write-Host "`n[QuickStart] Output Locations for '$($global:MandA.CompanyName)':" -ForegroundColor Cyan
        Write-Host "  Profile Root:   $($global:MandA.Paths.CompanyProfileRoot)" -ForegroundColor DarkGray
        Write-Host "  Logs:           $($global:MandA.Paths.LogOutput)" -ForegroundColor DarkGray
        Write-Host "  Raw Data:       $($global:MandA.Paths.RawDataOutput)" -ForegroundColor DarkGray
        Write-Host "  Processed Data: $($global:MandA.Paths.ProcessedDataOutput)" -ForegroundColor DarkGray
        Write-Host "  Exports:        $($global:MandA.Paths.ExportOutput)" -ForegroundColor DarkGray
    }

    exit $ExitCode

catch { 
    Write-Host "`n[ERROR] FATAL ERROR in QuickStart.ps1" -ForegroundColor Red 
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ScriptStackTrace) {
        Write-Host "`nStack Trace:" -ForegroundColor DarkRed
        Write-Host $_.ScriptStackTrace -ForegroundColor DarkGray
    }
    Write-Host "`n[QuickStart] Troubleshooting Steps:" -ForegroundColor Yellow
    Write-Host "  1. Ensure Set-SuiteEnvironment.ps1 exists in the 'Scripts' directory and ran successfully." -ForegroundColor Gray
    Write-Host "  2. Verify the M&A Discovery Suite structure is intact (Core, Modules, Configuration directories)." -ForegroundColor Gray
    Write-Host "  3. Check permissions for the suite directory and output paths." -ForegroundColor Gray
    Write-Host "  4. If this is the first run, ensure the CompanyName '$CompanyName' is valid and profile directories can be created." -ForegroundColor Gray
    exit 99
} 

finally { # This is line 230 in the previous version
    Write-Host "[QuickStart] QuickStart.ps1 execution finished." -ForegroundColor DarkGray
}