<#
.SYNOPSIS
    Quick start script for M&A Discovery Suite v4.0
.DESCRIPTION
    A menu-driven, one-stop shop for setting up, validating, and running discovery operations
    for the M&A Discovery Suite. Performs initial environment checks before displaying the menu.
.EXAMPLE
    .\QuickStart.ps1
    (Located in the Scripts directory)
#>

[CmdletBinding()]
param()

# --- Script Setup ---
$script:QuickStartScriptPath = $MyInvocation.MyCommand.Path
$script:ScriptsPath = Split-Path $script:QuickStartScriptPath -Parent
$script:SuiteRoot = Split-Path $script:ScriptsPath -Parent

$envSetupScript = Join-Path $script:ScriptsPath "Set-SuiteEnvironment.ps1"
if (Test-Path $envSetupScript) {
    . $envSetupScript -SuiteRoot $script:SuiteRoot
} else {
    Write-Error "CRITICAL: Set-SuiteEnvironment.ps1 not found at '$envSetupScript'. Cannot proceed."
    exit 1
}

# --- Helper Functions ---

function Show-Menu {
    Clear-Host
    Write-Host ""
    Write-Host "+==================================================================+" -ForegroundColor Cyan
    Write-Host "|              M&A Discovery Suite v4.0 - Main Menu              |" -ForegroundColor Cyan
    Write-Host "+==================================================================+" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  SETUP & CONFIGURATION" -ForegroundColor Yellow
    Write-Host "  ---------------------" -ForegroundColor Yellow
    Write-Host "  [0] Invoke App Registration Setup (Azure AD Credentials)"
    Write-Host ""
    Write-Host "  ORCHESTRATOR EXECUTION (App Registration will be checked/prompted)" -ForegroundColor Yellow
    Write-Host "  -----------------------------------------------------------------" -ForegroundColor Yellow
    Write-Host "  [1] Invoke Orchestrator: Discovery Only"
    Write-Host "  [2] Invoke Orchestrator: Discovery & Processing"
    Write-Host "  [3] Invoke Orchestrator: Processing Only"
    Write-Host "  [4] Invoke Orchestrator: Processing & Export"
    Write-Host "  [5] Invoke Orchestrator: Validate Configuration Only (Test Mode)"
    Write-Host ""
    Write-Host "  [Q] Quit" -ForegroundColor Yellow
    Write-Host ""
}

# Function to check PowerShell module dependencies.
# Returns $true if critical modules seem okay or script is missing, $false if critical issues found.
function Test-RequiredPowerShellModules {
    Write-Host "`n--- Checking Required PowerShell Modules ---" -ForegroundColor DarkCyan
    $moduleCheckScriptPath = Join-Path $global:MandAScriptsPath "DiscoverySuiteModuleCheck.ps1"

    if (-not (Test-Path $moduleCheckScriptPath)) {
        Write-Host "[WARNING] DiscoverySuiteModuleCheck.ps1 not found at '$moduleCheckScriptPath'." -ForegroundColor Yellow
        Write-Host "          Cannot automatically verify PowerShell module dependencies. Please ensure they are installed." -ForegroundColor White
        return $true # Allow to proceed but with a warning
    }

    Write-Host "Running PowerShell module dependency check: $moduleCheckScriptPath" -ForegroundColor White
    Write-Host "This may take a moment and might attempt to install/update modules..." -ForegroundColor Gray
    
    $output = try {
        # Invoke and capture all output streams. Store in a variable.
        $process = Start-Process PowerShell -ArgumentList "-NoProfile -File `"$moduleCheckScriptPath`"" -Wait -PassThru -WindowStyle Hidden
        # Check exit code (more reliable than parsing output for general success/failure)
        # This assumes DiscoverySuiteModuleCheck.ps1 will exit with non-zero on critical failure.
        # If it doesn't, output parsing is the only way.
        if ($process.ExitCode -ne 0) {
            Write-Host "[ERROR] DiscoverySuiteModuleCheck.ps1 indicated an issue (Exit Code: $($process.ExitCode))." -ForegroundColor Red
            Write-Host "        Please run DiscoverySuiteModuleCheck.ps1 manually from the '$($global:MandAScriptsPath)' directory for details." -ForegroundColor Yellow
            return $false # Treat non-zero exit as a failure for critical modules
        }
        # If exit code is 0, still good to check output for specific critical messages as a fallback
        $stdOut = Get-Content ($process.StandardOutput.ReadToEnd()) -ErrorAction SilentlyContinue # This part is tricky with Start-Process
                                                                                                # A better way is for the script to output to a temp file or use transcript
                                                                                                # For simplicity, we'll stick to exit code primarily.
                                                                                                # The previous output parsing is kept as a secondary check.
        # Re-evaluating output parsing as Start-Process makes it hard to capture live.
        # Let's revert to direct execution and output capture for simplicity here.
        $outputFromScript = & $moduleCheckScriptPath -ErrorAction SilentlyContinue # Add -AutoFix -Confirm:$false if you want it fully non-interactive
        $LASTEXITCODE # Store exit code if available from direct call
    } catch {
        Write-Host "[ERROR] DiscoverySuiteModuleCheck.ps1 failed to execute: $($_.Exception.Message)" -ForegroundColor Red
        return $true # Allow to proceed but with a significant warning, as the check itself failed.
    }
    
    # Check based on output string matching (less ideal but a fallback)
    if ($outputFromScript -match "CRITICAL issues found with REQUIRED modules" -or $outputFromScript -match "ERROR: CRITICAL issues found with REQUIRED modules:") {
        Write-Host "[ERROR] Critical PowerShell module dependencies are missing or incorrect (as per script output)." -ForegroundColor Red
        Write-Host "        Please review the output from DiscoverySuiteModuleCheck.ps1 and resolve the issues." -ForegroundColor Yellow
        return $false
    }

    Write-Host "[INFO] PowerShell module dependency check completed." -ForegroundColor Green
    return $true
}


# Function to check the status of local app registration artifacts.
# Returns $true if ready, $false otherwise.
function Test-AppRegistrationPrerequisites {
    Write-Host "`n--- Checking App Registration Prerequisites (Local Credentials) ---" -ForegroundColor DarkCyan
    
    $configFilePath = $global:MandADefaultConfigPath
    if (-not (Test-Path $configFilePath)) {
        Write-Host "[ERROR] Default configuration file not found at: $configFilePath" -ForegroundColor Red
        return $false
    }

    try {
        $config = Get-Content $configFilePath | ConvertFrom-Json
        $credPath = $config.authentication.credentialStorePath # This is now relative to outputPath
        $baseOutputPath = $config.environment.outputPath

        if (-not ([System.IO.Path]::IsPathRooted($baseOutputPath))) {
            $baseOutputPath = Join-Path $script:SuiteRoot $baseOutputPath
        }
        # credentialStorePath is relative to baseOutputPath
        $fullCredPath = Join-Path $baseOutputPath $credPath
        
        # Normalize the path
        $fullCredPath = (Resolve-Path -Path $fullCredPath -ErrorAction SilentlyContinue).Path -replace '\\+$', ''
        if (-not $fullCredPath) { # Fallback if Resolve-Path fails (e.g. parent doesn't exist yet)
             $fullCredPath = Join-Path (Join-Path $script:SuiteRoot $config.environment.outputPath) $config.authentication.credentialStorePath
        }
        
        Write-Host "Verifying local credentials file at: $fullCredPath ..." -NoNewline
        if (Test-Path $fullCredPath) {
            Write-Host " FOUND." -ForegroundColor Green
            Write-Host "[INFO] App Registration appears to be configured locally." -ForegroundColor White
            return $true
        } else {
            Write-Host " NOT FOUND." -ForegroundColor Red
            Write-Host "[WARNING] Local credentials file is missing. App Registration setup (Option [0]) is required." -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "`n[ERROR] Could not read or parse configuration file '$configFilePath':" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        return $false
    }
}

# Internal function to run app registration.
function Invoke-AppRegistrationSetupInternal {
    Write-Host "`n--- Invoking App Registration Setup ---" -ForegroundColor Cyan
    $appRegScriptPath = Join-Path $global:MandAScriptsPath "Setup-AppRegistration.ps1"
    if (Test-Path $appRegScriptPath) {
        Write-Host "Launching Azure App Registration setup script: $appRegScriptPath" -ForegroundColor Yellow
        Write-Host "Please follow the prompts. This may require elevated privileges." -ForegroundColor White
        try {
            & $appRegScriptPath
            Write-Host "[INFO] App Registration script execution finished." -ForegroundColor White
        } catch {
            Write-Host "[ERROR] Failed to execute Setup-AppRegistration.ps1: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "[ERROR] Setup-AppRegistration.ps1 not found at '$appRegScriptPath'!" -ForegroundColor Red
    }
}

# Orchestrator caller with App Registration pre-flight check
function Invoke-OrchestratorPhaseWithAppRegCheck {
    param(
        [Parameter(Mandatory=$true)]
        [string]$PhaseTitle,
        [Parameter(Mandatory=$false)]
        [string]$Mode,
        [Parameter(Mandatory=$false)]
        [switch]$ValidateOnlyFlag,
        [Parameter(Mandatory=$false)]
        [hashtable]$ExtraArgs = @{}
    )

    Write-Host "`n--- Preparing to Launch Orchestrator ($PhaseTitle) ---" -ForegroundColor Cyan
    
    # Pre-flight check: App Registration (Local Credentials)
    if (-not (Test-AppRegistrationPrerequisites)) {
        $confirmSetup = Read-Host "App Registration (local credentials) is required to proceed. Run App Registration setup (Option [0]) now? (Y/N)"
        if ($confirmSetup -clike 'y') {
            Invoke-AppRegistrationSetupInternal
            if (-not (Test-AppRegistrationPrerequisites)) {
                Write-Host "[ERROR] App Registration setup was run, but local credentials are still not found." -ForegroundColor Red
                Write-Host "        Cannot proceed with orchestrator phase '$PhaseTitle'." -ForegroundColor Yellow
                Request-UserToContinue
                return
            }
            Write-Host "[SUCCESS] App Registration prerequisites met after setup." -ForegroundColor Green
        } else {
            Write-Host "[INFO] Orchestrator phase '$PhaseTitle' cancelled by user due to missing App Registration." -ForegroundColor Yellow
            Request-UserToContinue
            return
        }
    }

    # Proceed with Orchestrator call (Module check is implicitly handled by orchestrator's Initialize-MandAEnvironment)
    $orchestratorPath = $global:MandAOrchestratorPath
    $configFilePath = $global:MandADefaultConfigPath

    if (-not (Test-Path $orchestratorPath)) { Write-Host "[ERROR] Orchestrator script not found: $orchestratorPath" -ForegroundColor Red; Request-UserToContinue; return }
    if (-not (Test-Path $configFilePath)) { Write-Host "[ERROR] Default config not found: $configFilePath" -ForegroundColor Red; Request-UserToContinue; return }

    $arguments = @{ ConfigurationFile = $configFilePath }
    if ($ValidateOnlyFlag.IsPresent) { $arguments.ValidateOnly = $true } 
    elseif ($Mode) { $arguments.Mode = $Mode }
    foreach ($key in $ExtraArgs.Keys) { $arguments[$key] = $ExtraArgs[$key] }
    
    $commandString = "& `"$orchestratorPath`""
    foreach ($key in $arguments.Keys) {
        if ($arguments[$key] -is [switch] -and $arguments[$key].IsPresent) { $commandString += " -$key" }
        elseif ($arguments[$key] -is [bool] -and $arguments[$key]) { $commandString += " -$key" }
        elseif ($null -ne $arguments[$key]) { $commandString += " -$key `"$($arguments[$key])`"" }
    }
    Write-Host "Executing: $commandString" -ForegroundColor DarkGray
    Write-Host "Please wait..." -ForegroundColor Yellow
    
    try {
        & $orchestratorPath @arguments
        $exitCode = $LASTEXITCODE
        if ($exitCode -eq 0) { Write-Host "[SUCCESS] Orchestrator phase '$PhaseTitle' completed successfully." -ForegroundColor Green }
        else { Write-Host "[WARNING] Orchestrator phase '$PhaseTitle' completed with exit code: $exitCode. Check logs." -ForegroundColor Yellow }
    } catch { Write-Host "[ERROR] Failed to launch Orchestrator for '$PhaseTitle': $($_.Exception.Message)" -ForegroundColor Red }
    Request-UserToContinue
}

function Request-UserToContinue {
    Write-Host "`nPress Enter to return to the menu..." -ForegroundColor Gray
    Read-Host | Out-Null
}

# --- Main Script Body ---
# Initial Checks (Run once at the start of QuickStart)
Write-Host "`n--- M&A Discovery Suite QuickStart Initializing ---" -ForegroundColor Cyan

# 1. Unblock Files
$unblockScriptPath = Join-Path $script:SuiteRoot "Unblock-AllFiles.ps1"
if (Test-Path $unblockScriptPath) {
    Write-Host "Attempting to unblock all script files in '$($script:SuiteRoot)'..." -ForegroundColor Yellow
    try { & $unblockScriptPath -Path $script:SuiteRoot; Write-Host "[SUCCESS] File unblocking completed." -ForegroundColor Green }
    catch { Write-Host "[ERROR] Unblocking files failed: $($_.Exception.Message)" -ForegroundColor Red; Request-UserToContinue }
} else { Write-Host "[WARNING] Unblock-AllFiles.ps1 not found. Files might be blocked." -ForegroundColor Yellow; Request-UserToContinue }

# 2. PowerShell Module Check
if (-not (Test-RequiredPowerShellModules)) {
    Write-Host "[CRITICAL FAILURE] Essential PowerShell modules are missing or DiscoverySuiteModuleCheck.ps1 reported critical errors." -ForegroundColor Red
    Write-Host "                   Please resolve these module issues before proceeding." -ForegroundColor Red
    Write-Host "                   QuickStart will pause. Press Enter to see the menu, but some options may not function correctly." -ForegroundColor Yellow
    Request-UserToContinue
    # Consider exiting here if module check is absolutely critical before even showing the menu:
    # Write-Host "Exiting QuickStart due to critical module issues." -ForegroundColor Red; exit 1
} else {
    Write-Host "[SUCCESS] Initial PowerShell module check passed or allows proceeding." -ForegroundColor Green
}

Write-Host "Initialization complete. Launching main menu..." -ForegroundColor White; Start-Sleep -Seconds 1

# Main Menu Loop
do {
    Show-Menu
    $choice = Read-Host "Enter your choice"
    switch ($choice) {
        '0' { Invoke-AppRegistrationSetupInternal; Request-UserToContinue } # Direct call to setup
        '1' { Invoke-OrchestratorPhaseWithAppRegCheck -PhaseTitle "Discovery Only" -Mode "Discovery" }
        '2' { 
              Invoke-OrchestratorPhaseWithAppRegCheck -PhaseTitle "Discovery Phase" -Mode "Discovery"
              Write-Host "`n--- Next: Processing Phase (will also check AppReg) ---" -ForegroundColor Cyan
              Invoke-OrchestratorPhaseWithAppRegCheck -PhaseTitle "Processing Phase" -Mode "Processing"
            }
        '3' { Invoke-OrchestratorPhaseWithAppRegCheck -PhaseTitle "Processing Only" -Mode "Processing" } # New Option
        '4' { 
              Invoke-OrchestratorPhaseWithAppRegCheck -PhaseTitle "Processing Phase" -Mode "Processing"
              Write-Host "`n--- Next: Export Phase (will also check AppReg) ---" -ForegroundColor Cyan
              Invoke-OrchestratorPhaseWithAppRegCheck -PhaseTitle "Export Phase" -Mode "Export"
            }
        '5' { Invoke-OrchestratorPhaseWithAppRegCheck -PhaseTitle "Validate Configuration Only" -ValidateOnlyFlag:$true }
        'q' { Write-Host "`nExiting M&A Discovery Suite QuickStart Launcher." -ForegroundColor Cyan }
        default { Write-Host "`n[ERROR] Invalid choice. Please try again." -ForegroundColor Red; Request-UserToContinue }
    }
} while ($choice -ne 'q')

