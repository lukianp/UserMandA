<#
.SYNOPSIS
    Quick start script for M&A Discovery Suite v4.0
.DESCRIPTION
    A menu-driven, one-stop shop for setting up, validating, and running discovery operations
    for the M&A Discovery Suite. Performs initial environment checks before displaying the menu.
    It ensures Set-SuiteEnvironment.ps1 is sourced first to establish correct paths.
.EXAMPLE
    .\QuickStart.ps1
    (Located in the Scripts directory, e.g., C:\UserMigration\Scripts\)
#>

[CmdletBinding()]
param()

# --- Script Setup: Determine Paths and Source Set-SuiteEnvironment.ps1 ---
# This section runs first to establish the suite's environment context.

# $MyInvocation.MyCommand.Path provides the full path to this QuickStart.ps1 script.
$script:QuickStartScriptPath = $MyInvocation.MyCommand.Path
# $script:ScriptsPath will be the directory containing this QuickStart.ps1 script (e.g., C:\UserMigration\Scripts).
$script:ScriptsPath = Split-Path $script:QuickStartScriptPath -Parent
# $script:SuiteRoot is assumed to be the parent of the 'Scripts' directory (e.g., C:\UserMigration).
$script:SuiteRoot = Split-Path $script:ScriptsPath -Parent

# Path to the Set-SuiteEnvironment.ps1 script.
$envSetupScript = Join-Path $script:ScriptsPath "Set-SuiteEnvironment.ps1"

if (Test-Path $envSetupScript) {
    Write-Verbose "Sourcing Set-SuiteEnvironment.ps1 from: $envSetupScript"
    # Dot-source Set-SuiteEnvironment.ps1, passing the SuiteRoot determined by QuickStart.
    # Set-SuiteEnvironment.ps1 (from Canvas set_suite_environment_v2) will then validate this path
    # or use its internal logic to determine the correct SuiteRoot and set global variables.
    . $envSetupScript -ProvidedSuiteRoot $script:SuiteRoot
} else {
    Write-Error "CRITICAL: Set-SuiteEnvironment.ps1 not found at '$envSetupScript'. This script is essential for defining suite paths. Cannot proceed."
    exit 1
}

# At this point, global variables like $global:MandASuiteRoot, $global:MandAScriptsPath, etc.,
# should be set by the sourced Set-SuiteEnvironment.ps1 script.

# --- Helper Functions ---

function Show-Menu {
    Clear-Host
    Write-Host ""
    Write-Host "+==================================================================+" -ForegroundColor Cyan
    Write-Host "|              M&A Discovery Suite v4.0 - Main Menu              |" -ForegroundColor Cyan
    Write-Host "+==================================================================+" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Suite Root Detected As: $($global:MandASuiteRoot)" -ForegroundColor DarkYellow # Display detected SuiteRoot
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
    Write-Host "  UTILITIES & VALIDATION" -ForegroundColor Yellow
    Write-Host "  ------------------------" -ForegroundColor Yellow
    Write-Host "  [V] Validate Full Installation (Validate-Installation.ps1)"
    Write-Host "  [M] Check PowerShell Modules (DiscoverySuiteModuleCheck.ps1)"
    Write-Host ""
    Write-Host "  [Q] Quit" -ForegroundColor Yellow
    Write-Host ""
}

# Function to check PowerShell module dependencies.
# Returns $true if critical modules seem okay or script is missing, $false if critical issues found.
function Test-RequiredPowerShellModules {
    Write-Host "`n--- Checking Required PowerShell Modules ---" -ForegroundColor DarkCyan
    # $global:MandAScriptsPath is set by Set-SuiteEnvironment.ps1
    $moduleCheckScriptPath = Join-Path $global:MandAScriptsPath "DiscoverySuiteModuleCheck.ps1"

    if (-not (Test-Path $moduleCheckScriptPath)) {
        Write-Host "[WARNING] DiscoverySuiteModuleCheck.ps1 not found at '$moduleCheckScriptPath'." -ForegroundColor Yellow
        Write-Host "          Cannot automatically verify PowerShell module dependencies. Please ensure they are installed." -ForegroundColor White
        return $true # Allow to proceed but with a warning
    }

    Write-Host "Running PowerShell module dependency check: $moduleCheckScriptPath" -ForegroundColor White
    Write-Host "This may take a moment and might attempt to install/update modules..." -ForegroundColor Gray
    
    $outputFromScript = ""
    $exitCode = 0
    try {
        # Execute in the context of the Scripts directory
        Push-Location $global:MandAScriptsPath
        $outputFromScript = & $moduleCheckScriptPath -AutoFix -ErrorAction SilentlyContinue # Added -AutoFix for convenience
        $exitCode = $LASTEXITCODE
        Pop-Location
    } catch {
        Pop-Location # Ensure Pop-Location runs even if there's an error
        Write-Host "[ERROR] DiscoverySuiteModuleCheck.ps1 failed to execute: $($_.Exception.Message)" -ForegroundColor Red
        return $true # Allow to proceed but with a significant warning, as the check itself failed.
    }
    
    if ($exitCode -ne 0) {
        Write-Host "[ERROR] DiscoverySuiteModuleCheck.ps1 indicated an issue (Exit Code: $exitCode)." -ForegroundColor Red
        Write-Host "        Please run DiscoverySuiteModuleCheck.ps1 manually from the '$($global:MandAScriptsPath)' directory for details." -ForegroundColor Yellow
        return $false # Treat non-zero exit as a failure for critical modules
    }
    
    # Fallback check based on output string matching (less ideal but a secondary check)
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
    
    # $global:MandADefaultConfigPath is set by Set-SuiteEnvironment.ps1
    $configFilePath = $global:MandADefaultConfigPath 
    if (-not (Test-Path $configFilePath)) {
        Write-Host "[ERROR] Default configuration file not found at: $configFilePath" -ForegroundColor Red
        return $false
    }

    try {
        $configJson = Get-Content $configFilePath | ConvertFrom-Json
        # Ensure paths from config are resolved correctly relative to SuiteRoot if they are relative
        # The orchestrator and Setup-AppRegistration.ps1 handle path resolution internally.
        # Here, we just need the configured path for the credential store.

        $credStorePathRelative = $configJson.authentication.credentialStorePath
        $outputPathRelative = $configJson.environment.outputPath

        # Resolve outputPath first (relative to SuiteRoot)
        $resolvedOutputPath = ""
        if ([System.IO.Path]::IsPathRooted($outputPathRelative)) {
            $resolvedOutputPath = $outputPathRelative
        } else {
            $resolvedOutputPath = Join-Path $global:MandASuiteRoot $outputPathRelative
        }

        # Resolve credStorePath (can be absolute or relative to resolvedOutputPath)
        $fullCredPath = ""
        if ([System.IO.Path]::IsPathRooted($credStorePathRelative)) {
            $fullCredPath = $credStorePathRelative
        } else {
            # If credStorePath is relative, it's often relative to the outputPath in the config structure.
            # Or, Setup-AppRegistration.ps1 uses its own default which is absolute.
            # For this check, let's assume it might be relative to outputPath or an absolute path.
            # The Setup-AppRegistration.ps1 script itself defaults to "C:\MandADiscovery\Output\credentials.config"
            # Let's use the configured path and see if it exists.
            $fullCredPath = $credStorePathRelative # Use the path as configured
            if (-not ([System.IO.Path]::IsPathRooted($fullCredPath))) {
                 # If it's still relative, assume it's relative to the suite root or output path.
                 # The most reliable is the default output of Setup-AppRegistration.ps1 if not overridden.
                 # For this check, we'll rely on the configured path.
                 # $fullCredPath = Join-Path $resolvedOutputPath $credStorePathRelative # This was one interpretation
                 # Let's stick to the direct config value, as Setup-AppRegistration.ps1's default is absolute.
                 # If the config has a relative path, it should be relative to SuiteRoot or a known base.
                 # The Setup-AppRegistration.ps1 script uses $EncryptedOutputPath which defaults to "C:\MandADiscovery\Output\credentials.config"
                 # So, we should ideally check that specific default if the config path is not found.
                 # For now, we check the path exactly as configured.
                 $fullCredPath = $configJson.authentication.credentialStorePath
                 if (-not ([System.IO.Path]::IsPathRooted($fullCredPath))) {
                    $fullCredPath = Join-Path $global:MandASuiteRoot $fullCredPath
                 }
            }
        }
        
        # Normalize path for robust checking
        if (Test-Path $fullCredPath -ErrorAction SilentlyContinue) {
            $fullCredPath = (Resolve-Path -Path $fullCredPath).Path
        }

        Write-Host "Verifying local credentials file at (from config): $fullCredPath ..." -NoNewline
        if (Test-Path $fullCredPath -PathType Leaf) {
            Write-Host " FOUND." -ForegroundColor Green
            Write-Host "[INFO] App Registration appears to be configured locally (credentials file exists)." -ForegroundColor White
            return $true
        } else {
            Write-Host " NOT FOUND." -ForegroundColor Red
            Write-Host "[WARNING] Local credentials file ('$fullCredPath') is missing or path is incorrect in config." -ForegroundColor Yellow
            Write-Host "           App Registration setup (Option [0]) might be required." -ForegroundColor Yellow
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
    # $script:ScriptsPath is defined at the top of QuickStart.ps1 and is reliable.
    # $global:MandAAppRegScriptPath is also available if Set-SuiteEnvironment.ps1 was successful.
    $appRegScriptPath = Join-Path $script:ScriptsPath "Setup-AppRegistration.ps1" 
    
    if (Test-Path $appRegScriptPath) {
        Write-Host "Launching Azure App Registration setup script: $appRegScriptPath" -ForegroundColor Yellow
        Write-Host "Please follow the prompts. This may require elevated privileges." -ForegroundColor White
        Write-Host "The script will use its default output for credentials (typically C:\MandADiscovery\Output\credentials.config) unless overridden." -ForegroundColor DarkGray
        try {
            # Execute Setup-AppRegistration.ps1 from its own directory context
            Push-Location (Split-Path $appRegScriptPath -Parent)
            & $appRegScriptPath # This will use its internal defaults for log path and encrypted output path
            Pop-Location
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
    # This check is only critical if not in ValidateOnly mode for the orchestrator itself.
    if (-not $ValidateOnlyFlag.IsPresent) {
        if (-not (Test-AppRegistrationPrerequisites)) {
            $confirmSetup = Read-Host "App Registration (local credentials file) appears to be missing or misconfigured. Run App Registration setup (Option [0]) now? (Y/N)"
            if ($confirmSetup -clike 'y') {
                Invoke-AppRegistrationSetupInternal
                if (-not (Test-AppRegistrationPrerequisites)) {
                    Write-Host "[ERROR] App Registration setup was run, but local credentials are still not found/configured correctly." -ForegroundColor Red
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
    } else {
         Write-Host "[INFO] Skipping App Registration credential check for Orchestrator's ValidateOnly mode." -ForegroundColor DarkGray
    }


    # Proceed with Orchestrator call
    # $global:MandAOrchestratorPath and $global:MandADefaultConfigPath are set by Set-SuiteEnvironment.ps1
    $orchestratorPath = $global:MandAOrchestratorPath
    $configFilePath = $global:MandADefaultConfigPath # Orchestrator will resolve this path relative to SuiteRoot if needed

    if (-not (Test-Path $orchestratorPath -PathType Leaf)) { Write-Host "[ERROR] Orchestrator script not found: $orchestratorPath" -ForegroundColor Red; Request-UserToContinue; return }
    # Config file existence is checked by the orchestrator itself using Resolve-MandAConfigPath or similar logic.

    $arguments = @{ ConfigurationFile = $configFilePath } # Pass the path as configured or default
    if ($ValidateOnlyFlag.IsPresent) { $arguments.ValidateOnly = $true } 
    elseif ($Mode) { $arguments.Mode = $Mode }
    foreach ($key in $ExtraArgs.Keys) { $arguments[$key] = $ExtraArgs[$key] }
    
    $commandString = "& `"$orchestratorPath`""
    foreach ($key in $arguments.Keys) {
        if ($arguments[$key] -is [switch] -and $arguments[$key].IsPresent) { $commandString += " -$key" }
        elseif ($arguments[$key] -is [bool] -and $arguments[$key]) { $commandString += " -$key" } # For explicit $true/$false switches
        elseif ($null -ne $arguments[$key] -and -not ($arguments[$key] -is [switch])) { # Ensure non-switch params are not null
             $commandString += " -$key `"$($arguments[$key])`"" 
        }
    }
    Write-Host "Executing Orchestrator: $commandString" -ForegroundColor DarkGray
    Write-Host "Please wait..." -ForegroundColor Yellow
    
    try {
        # Execute orchestrator from the Core directory context
        Push-Location $global:MandACorePath
        & $orchestratorPath @arguments
        $exitCode = $LASTEXITCODE
        Pop-Location
        if ($exitCode -eq 0) { Write-Host "[SUCCESS] Orchestrator phase '$PhaseTitle' completed successfully." -ForegroundColor Green }
        else { Write-Host "[WARNING] Orchestrator phase '$PhaseTitle' completed with exit code: $exitCode. Check logs." -ForegroundColor Yellow }
    } catch { 
        Pop-Location # Ensure Pop-Location on error
        Write-Host "[ERROR] Failed to launch Orchestrator for '$PhaseTitle': $($_.Exception.Message)" -ForegroundColor Red 
    }
    Request-UserToContinue
}

function Invoke-FullInstallationValidation {
    Write-Host "`n--- Invoking Full Installation Validation ---" -ForegroundColor Cyan
    # $global:MandAValidationScriptPath is set by Set-SuiteEnvironment.ps1
    $validationScriptPath = $global:MandAValidationScriptPath
    if (Test-Path $validationScriptPath) {
        Write-Host "Running full installation validation: $validationScriptPath" -ForegroundColor Yellow
        try {
            Push-Location (Split-Path $validationScriptPath -Parent)
            & $validationScriptPath
            Pop-Location
            Write-Host "[INFO] Full installation validation finished." -ForegroundColor White
        } catch {
            Write-Host "[ERROR] Failed to execute Validate-Installation.ps1: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "[ERROR] Validate-Installation.ps1 not found at '$validationScriptPath'!" -ForegroundColor Red
    }
    Request-UserToContinue
}


function Request-UserToContinue {
    Write-Host "`nPress Enter to return to the menu..." -ForegroundColor Gray
    Read-Host | Out-Null
}

# --- Main Script Body ---
# Initial Checks (Run once at the start of QuickStart)
Write-Host "`n--- M&A Discovery Suite QuickStart Initializing ---" -ForegroundColor Cyan
Write-Host "Suite Root initially determined by QuickStart as: $($script:SuiteRoot)" -ForegroundColor DarkGray
Write-Host "Sourcing Set-SuiteEnvironment.ps1 to finalize environment variables..." -ForegroundColor DarkGray
# Set-SuiteEnvironment.ps1 was sourced at the very top. Its output will confirm the final SuiteRoot.

# 1. Unblock Files (Run from SuiteRoot context)
$unblockScriptPath = Join-Path $global:MandASuiteRoot "Unblock-AllFiles.ps1" # Use global path
if (Test-Path $unblockScriptPath) {
    Write-Host "Attempting to unblock all script files in '$($global:MandASuiteRoot)'..." -ForegroundColor Yellow
    try { 
        Push-Location $global:MandASuiteRoot
        & $unblockScriptPath -Path $global:MandASuiteRoot # Pass path explicitly
        Pop-Location
        Write-Host "[SUCCESS] File unblocking completed." -ForegroundColor Green 
    }
    catch { 
        Pop-Location # Ensure Pop-Location on error
        Write-Host "[ERROR] Unblocking files failed: $($_.Exception.Message)" -ForegroundColor Red; Request-UserToContinue 
    }
} else { Write-Host "[WARNING] Unblock-AllFiles.ps1 not found at '$unblockScriptPath'. Files might be blocked." -ForegroundColor Yellow; Request-UserToContinue }

# 2. PowerShell Module Check (initial check, can also be run from menu)
if (-not (Test-RequiredPowerShellModules)) {
    Write-Host "[CRITICAL FAILURE] Essential PowerShell modules are missing or DiscoverySuiteModuleCheck.ps1 reported critical errors." -ForegroundColor Red
    Write-Host "                   Please resolve these module issues before proceeding." -ForegroundColor Red
    Write-Host "                   QuickStart will pause. Press Enter to see the menu, but some options may not function correctly." -ForegroundColor Yellow
    Request-UserToContinue
} else {
    Write-Host "[SUCCESS] Initial PowerShell module check passed or allows proceeding." -ForegroundColor Green
}

Write-Host "Initialization complete. Launching main menu..." -ForegroundColor White; Start-Sleep -Seconds 1

# Main Menu Loop
do {
    Show-Menu
    $choice = Read-Host "Enter your choice"
    switch ($choice) {
        '0' { Invoke-AppRegistrationSetupInternal; Request-UserToContinue }
        '1' { Invoke-OrchestratorPhaseWithAppRegCheck -PhaseTitle "Discovery Only" -Mode "Discovery" }
        '2' { 
              Invoke-OrchestratorPhaseWithAppRegCheck -PhaseTitle "Discovery Phase (Part 1 of 2)" -Mode "Discovery"
              Write-Host "`n--- Next: Processing Phase (Part 2 of 2) ---" -ForegroundColor Cyan
              Invoke-OrchestratorPhaseWithAppRegCheck -PhaseTitle "Processing Phase (Part 2 of 2)" -Mode "Processing"
            }
        '3' { Invoke-OrchestratorPhaseWithAppRegCheck -PhaseTitle "Processing Only" -Mode "Processing" }
        '4' { 
              Invoke-OrchestratorPhaseWithAppRegCheck -PhaseTitle "Processing Phase (Part 1 of 2)" -Mode "Processing"
              Write-Host "`n--- Next: Export Phase (Part 2 of 2) ---" -ForegroundColor Cyan
              Invoke-OrchestratorPhaseWithAppRegCheck -PhaseTitle "Export Phase (Part 2 of 2)" -Mode "Export"
            }
        '5' { Invoke-OrchestratorPhaseWithAppRegCheck -PhaseTitle "Validate Configuration Only" -ValidateOnlyFlag:$true }
        'V' { Invoke-FullInstallationValidation } # New Menu Option
        'M' { Test-RequiredPowerShellModules; Request-UserToContinue } # New Menu Option
        'q' { Write-Host "`nExiting M&A Discovery Suite QuickStart Launcher." -ForegroundColor Cyan }
        default { Write-Host "`n[ERROR] Invalid choice. Please try again." -ForegroundColor Red; Request-UserToContinue }
    }
} while ($choice -cne 'q') # Case-insensitive comparison for quit

Write-Host "Thank you for using the M&A Discovery Suite!" -ForegroundColor Green
