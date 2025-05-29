<#
.SYNOPSIS
    Quick start script for M&A Discovery Suite v4.0
.DESCRIPTION
    A menu-driven, one-stop shop for setting up, validating, and running discovery operations
    for the M&A Discovery Suite.
.EXAMPLE
    .\QuickStart.ps1
    (Located in the Scripts directory)
#>

[CmdletBinding()]
param()

# --- Script Setup ---
# Determine the root directory of the M&A Discovery Suite.
# This assumes QuickStart.ps1 is in the 'Scripts' subdirectory of the suite root.
$script:QuickStartScriptPath = $MyInvocation.MyCommand.Path
$script:ScriptsPath = Split-Path $script:QuickStartScriptPath -Parent
$script:SuiteRoot = Split-Path $script:ScriptsPath -Parent

# Source the environment setup script to make all paths globally available
# This script sets $global:MandADefaultConfigPath, $global:MandAOrchestratorPath, etc.
$envSetupScript = Join-Path $script:ScriptsPath "Set-SuiteEnvironment.ps1"
if (Test-Path $envSetupScript) {
    . $envSetupScript -SuiteRoot $script:SuiteRoot
} else {
    Write-Error "CRITICAL: Set-SuiteEnvironment.ps1 not found at '$envSetupScript'. Cannot proceed."
    exit 1
}

# --- Helper Functions ---

# Function to display the main menu
function Show-Menu {
    Clear-Host
    Write-Host ""
    Write-Host "+==================================================================+" -ForegroundColor Cyan
    Write-Host "|              M&A Discovery Suite v4.0 - Main Menu              |" -ForegroundColor Cyan
    Write-Host "+==================================================================+" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  SETUP & CONFIGURATION" -ForegroundColor Yellow
    Write-Host "  ---------------------" -ForegroundColor Yellow
    Write-Host "  [0] Check App Registration Readiness (Local Credentials)"
    Write-Host "  [1] Configure App Registration (Azure AD Setup)"
    Write-Host ""
    Write-Host "  ORCHESTRATOR EXECUTION" -ForegroundColor Yellow
    Write-Host "  ----------------------" -ForegroundColor Yellow
    Write-Host "  [2] Run Discovery Phase Only"
    Write-Host "  [3] Run Discovery & Processing Phases"
    Write-Host "  [4] Run Processing & Export Phases"
    Write-Host "  [5] Validate Orchestrator Configuration Only"
    Write-Host ""
    Write-Host "  [Q] Quit" -ForegroundColor Yellow
    Write-Host ""
}

# Function to check the status of local app registration artifacts
function Check-AppRegistrationReadiness {
    Write-Host "`n--- Checking App Registration Readiness ---" -ForegroundColor Cyan
    
    $configFilePath = $global:MandADefaultConfigPath
    if (-not (Test-Path $configFilePath)) {
        Write-Host "[ERROR] Default configuration file not found at: $configFilePath" -ForegroundColor Red
        Write-Host "Please ensure the suite is correctly installed." -ForegroundColor Yellow
        Pause-And-Continue
        return
    }

    try {
        $config = Get-Content $configFilePath | ConvertFrom-Json
        $credPath = $config.authentication.credentialStorePath
        
        # Resolve credPath relative to SuiteRoot if it's not absolute
        if (-not ([System.IO.Path]::IsPathRooted($credPath))) {
            $credPath = Join-Path $script:SuiteRoot $credPath
        }

        Write-Host "Checking for default configuration: $configFilePath ... FOUND" -ForegroundColor Green
        Write-Host "Checking for credentials file: $credPath ..." -NoNewline

        if (Test-Path $credPath) {
            Write-Host " FOUND" -ForegroundColor Green
            Write-Host "[INFO] App Registration appears to have been configured locally." -ForegroundColor White
        } else {
            Write-Host " NOT FOUND" -ForegroundColor Red
            Write-Host "[WARNING] Local credentials file is missing." -ForegroundColor Yellow
            Write-Host "          Please run Option [1] to configure App Registration." -ForegroundColor White
        }
    } catch {
        Write-Host "`n[ERROR] Could not read or parse configuration file '$configFilePath':" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
    Pause-And-Continue
}

# Function to run the App Registration setup script
function Run-AppRegistrationSetup {
    Write-Host "`n--- Configuring App Registration ---" -ForegroundColor Cyan
    
    $appRegScriptPath = Join-Path $global:MandAScriptsPath "Setup-AppRegistration.ps1"
    if (Test-Path $appRegScriptPath) {
        Write-Host "`nLaunching Azure App Registration setup script..." -ForegroundColor Yellow
        Write-Host "          Path: $appRegScriptPath" -ForegroundColor Gray
        Write-Host "          Please follow the prompts in the script to complete authentication setup." -ForegroundColor White
        Write-Host "          This may require Global Administrator or Application Administrator privileges." -ForegroundColor Yellow
        try {
            # It's a good idea to run this in a new window if it's highly interactive,
            # but for simplicity here, we'll run it in the current session.
            # Consider: Start-Process PowerShell -ArgumentList "-NoExit -File `"$appRegScriptPath`""
            & $appRegScriptPath
            Write-Host "[INFO] App Registration script execution finished." -ForegroundColor White
            Write-Host "       Please verify its output for success or errors." -ForegroundColor White
        } catch {
            Write-Host "[ERROR] Failed to execute Setup-AppRegistration.ps1: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "[ERROR] Setup-AppRegistration.ps1 not found at '$appRegScriptPath'!" -ForegroundColor Red
    }
    Pause-And-Continue
}

# Function to run the M&A Orchestrator with specified parameters
function Run-OrchestratorPhase {
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
    
    Write-Host "`n--- Launching Orchestrator ($PhaseTitle) ---" -ForegroundColor Cyan
    
    $orchestratorPath = $global:MandAOrchestratorPath
    $configFilePath = $global:MandADefaultConfigPath

    if (-not (Test-Path $orchestratorPath)) {
        Write-Host "[ERROR] Orchestrator script not found at: $orchestratorPath" -ForegroundColor Red
        Pause-And-Continue
        return
    }
    if (-not (Test-Path $configFilePath)) {
        Write-Host "[ERROR] Default configuration file not found at: $configFilePath" -ForegroundColor Red
        Pause-And-Continue
        return
    }

    $arguments = @{
        ConfigurationFile = $configFilePath
    }

    if ($ValidateOnlyFlag.IsPresent) {
        $arguments.ValidateOnly = $true
    } elseif ($Mode) {
        $arguments.Mode = $Mode
    }

    # Add any extra arguments passed
    foreach ($key in $ExtraArgs.Keys) {
        $arguments[$key] = $ExtraArgs[$key]
    }
    
    $commandString = "& `"$orchestratorPath`""
    foreach ($key in $arguments.Keys) {
        if ($arguments[$key] -is [switch] -and $arguments[$key].IsPresent) {
            $commandString += " -$key"
        } elseif ($arguments[$key] -is [bool] -and $arguments[$key]) {
             $commandString += " -$key"
        } elseif ($arguments[$key] -ne $null) {
            $commandString += " -$key `"$($arguments[$key])`""
        }
    }

    Write-Host "Executing: $commandString" -ForegroundColor DarkGray
    Write-Host "Please wait, this may take some time..." -ForegroundColor Yellow
    
    try {
        & $orchestratorPath @arguments
        $exitCode = $LASTEXITCODE
        if ($exitCode -eq 0) {
            Write-Host "[SUCCESS] Orchestrator phase '$PhaseTitle' completed successfully." -ForegroundColor Green
        } else {
            Write-Host "[WARNING] Orchestrator phase '$PhaseTitle' completed with exit code: $exitCode." -ForegroundColor Yellow
            Write-Host "          Please check the orchestrator logs for details." -ForegroundColor White
        }
    } catch {
        Write-Host "[ERROR] Failed to launch M&A Discovery Suite Orchestrator for phase '$PhaseTitle':" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
    Pause-And-Continue
}

# Function to pause and wait for user input
function Pause-And-Continue {
    Write-Host "`nPress Enter to return to the menu..." -ForegroundColor Gray
    Read-Host | Out-Null
}

# --- Main Script Body ---

# Automatically unblock files once when QuickStart is launched
Write-Host "`n--- M&A Discovery Suite QuickStart Initializing ---" -ForegroundColor Cyan
$unblockScriptPath = Join-Path $script:SuiteRoot "Unblock-AllFiles.ps1" # Unblock-AllFiles.ps1 is in the root
if (Test-Path $unblockScriptPath) {
    Write-Host "Attempting to unblock all script files in '$($script:SuiteRoot)'..." -ForegroundColor Yellow
    Write-Host "This ensures scripts downloaded from the internet can run without security warnings." -ForegroundColor Gray
    try {
        & $unblockScriptPath -Path $script:SuiteRoot
        Write-Host "[SUCCESS] File unblocking process completed." -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Failed to unblock files: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "         You may encounter issues running other scripts." -ForegroundColor Yellow
        Pause-And-Continue
    }
} else {
    Write-Host "[WARNING] Unblock-AllFiles.ps1 not found at '$unblockScriptPath'." -ForegroundColor Yellow
    Write-Host "           If you downloaded this suite as a ZIP, files might be blocked." -ForegroundColor White
    Write-Host "           Consider running Unblock-AllFiles.ps1 manually if you encounter issues." -ForegroundColor White
    Pause-And-Continue
}
Write-Host "Initialization complete. Launching main menu..." -ForegroundColor White
Start-Sleep -Seconds 2


# Main loop to display menu and process choices
do {
    Show-Menu
    $choice = Read-Host "Enter your choice"

    switch ($choice) {
        '0' { Check-AppRegistrationReadiness }
        '1' { Run-AppRegistrationSetup } # Changed from Run-InitialSetup as unblocking is now automatic
        '2' { Run-OrchestratorPhase -PhaseTitle "Discovery Only" -Mode "Discovery" }
        '3' { 
              Run-OrchestratorPhase -PhaseTitle "Discovery Phase" -Mode "Discovery"
              # Assuming Discovery must complete before Processing can use its output
              Write-Host "`n--- Discovery Phase completed. Proceeding to Processing Phase. ---" -ForegroundColor Cyan
              Run-OrchestratorPhase -PhaseTitle "Processing Phase" -Mode "Processing"
            }
        '4' { 
              Run-OrchestratorPhase -PhaseTitle "Processing Phase" -Mode "Processing"
              # Assuming Processing must complete before Export can use its output
              Write-Host "`n--- Processing Phase completed. Proceeding to Export Phase. ---" -ForegroundColor Cyan
              Run-OrchestratorPhase -PhaseTitle "Export Phase" -Mode "Export"
            }
        '5' { Run-OrchestratorPhase -PhaseTitle "Validate Configuration Only" -ValidateOnlyFlag }
        'q' {
            Write-Host "`nExiting M&A Discovery Suite QuickStart Launcher." -ForegroundColor Cyan
            Write-Host "Have a great day!"
        }
        default {
            Write-Host "`n[ERROR] Invalid choice '$choice'. Please select a valid option from the menu." -ForegroundColor Red
            Pause-And-Continue
        }
    }
} while ($choice -ne 'q')
