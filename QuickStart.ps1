<#
.SYNOPSIS
    Quick start script for M&A Discovery Suite v4.0
.DESCRIPTION
    A menu-driven, one-stop shop for setting up, validating, and running discovery operations
    for the M&A Discovery Suite. Performs initial environment checks before displaying the menu.
    It ensures Set-SuiteEnvironment.ps1 is sourced first to establish correct paths.
    Includes interactive credential input if the credential file is missing.
.EXAMPLE
    .\QuickStart.ps1
    (Located in the Scripts directory, e.g., C:\UserMigration\Scripts\)
.NOTES
    Author: Lukian Poleschtschuk
    Version: 4.0.0
    Created: 2025-05-31
    Last Modified: 2025-05-31
#>

[CmdletBinding()]
param()

# --- Script Setup: Determine Paths and Source Set-SuiteEnvironment.ps1 ---
$script:QuickStartScriptPath = $MyInvocation.MyCommand.Path
$script:ScriptsPath = Split-Path $script:QuickStartScriptPath -Parent
$envSetupScript = Join-Path $script:ScriptsPath "Set-SuiteEnvironment.ps1"

if (Test-Path $envSetupScript) {
    Write-Verbose "Sourcing Set-SuiteEnvironment.ps1 from: $envSetupScript"
    . $envSetupScript
} else {
    Write-Error "CRITICAL: Set-SuiteEnvironment.ps1 not found at '$envSetupScript'. This script is essential for defining suite paths. Cannot proceed."
    exit 1
}

if (-not $global:MandASuiteRoot) {
    Write-Error "CRITICAL: `$global:MandASuiteRoot was not set by Set-SuiteEnvironment.ps1. Cannot determine suite location. Aborting."
    exit 1
}
if (-not (Test-Path $global:MandASuiteRoot -PathType Container)) {
     Write-Error "CRITICAL: The Suite Root path ' $($global:MandASuiteRoot)' set by Set-SuiteEnvironment.ps1 is invalid or not a directory. Aborting."
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
    Write-Host "  Suite Root Established As: $($global:MandASuiteRoot)" -ForegroundColor DarkYellow
    Write-Host ""
    Write-Host "  SETUP & CONFIGURATION" -ForegroundColor Yellow
    Write-Host "  ---------------------" -ForegroundColor Yellow
    Write-Host "  [0] Invoke App Registration Setup (Full Azure AD Setup)"
    Write-Host "  [S] Store/Update Credentials Interactively (If App ID/Secret known)"
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

function Test-RequiredPowerShellModules {
    Write-Host "`n--- Checking Required PowerShell Modules ---" -ForegroundColor DarkCyan
    $moduleCheckScriptPath = Join-Path $global:MandAScriptsPath "DiscoverySuiteModuleCheck.ps1"

    if (-not (Test-Path $moduleCheckScriptPath -PathType Leaf)) {
        Write-Host "[WARNING] DiscoverySuiteModuleCheck.ps1 not found at '$moduleCheckScriptPath'." -ForegroundColor Yellow
        Write-Host "          Cannot automatically verify PowerShell module dependencies. Please ensure they are installed." -ForegroundColor White
        return $true
    }

    Write-Host "Running PowerShell module dependency check: $moduleCheckScriptPath" -ForegroundColor White
    Write-Host "This may take a moment and might attempt to install/update modules..." -ForegroundColor Gray
    
    $exitCode = 0
    try {
        Push-Location $global:MandAScriptsPath
        & $moduleCheckScriptPath -AutoFix -ErrorAction SilentlyContinue
        $exitCode = $LASTEXITCODE
        Pop-Location
    } catch {
        if ($PSScriptRoot -eq (Get-Location).Path) { Pop-Location }
        Write-Host "[ERROR] DiscoverySuiteModuleCheck.ps1 failed to execute: $($_.Exception.Message)" -ForegroundColor Red
        return $true 
    }
    
    if ($exitCode -ne 0) {
        Write-Host "[ERROR] DiscoverySuiteModuleCheck.ps1 indicated an issue (Exit Code: $exitCode)." -ForegroundColor Red
        Write-Host "        Please run DiscoverySuiteModuleCheck.ps1 manually from the '$($global:MandAScriptsPath)' directory for details." -ForegroundColor Yellow
        return $false
    }
    
    Write-Host "[INFO] PowerShell module dependency check completed (Exit Code: $exitCode)." -ForegroundColor Green
    return $true
}

function Test-AppRegistrationPrerequisites {
    Write-Host "`n--- Checking App Registration Prerequisites (Local Credentials) ---" -ForegroundColor DarkCyan
    $configFilePath = $global:MandADefaultConfigPath 
    if (-not (Test-Path $configFilePath -PathType Leaf)) {
        Write-Host "[ERROR] Default configuration file not found at: $configFilePath" -ForegroundColor Red
        return $false
    }

    $configJson = $null
    try {
        $configJson = Get-Content $configFilePath -ErrorAction Stop | ConvertFrom-Json -ErrorAction Stop
    } catch {
        Write-Host "`n[ERROR] Could not read or parse configuration file '$configFilePath': $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
        
    if (-not ($configJson.authentication -and $configJson.authentication.credentialStorePath)) {
        Write-Host "[ERROR] 'authentication.credentialStorePath' not found in configuration file: $configFilePath" -ForegroundColor Red
        return $false
    }
    
    $credStorePathFromConfig = $configJson.authentication.credentialStorePath
    $fullCredPath = ""

    if ([System.IO.Path]::IsPathRooted($credStorePathFromConfig)) {
        $fullCredPath = $credStorePathFromConfig
    } else {
        $fullCredPath = Join-Path $global:MandASuiteRoot $credStorePathFromConfig
    }
    
    # Attempt to get the canonical path for display, but don't fail if the file itself doesn't exist.
    # The primary check is Test-Path on the constructed $fullCredPath.
    $displayPath = $fullCredPath
    try {
        if (Test-Path $fullCredPath -ErrorAction SilentlyContinue) { # If file exists, get its resolved path
            $displayPath = (Resolve-Path -Path $fullCredPath -ErrorAction Stop).Path
        } elseif (Test-Path (Split-Path $fullCredPath) -ErrorAction SilentlyContinue) { # If only parent exists
             $displayPath = Join-Path (Resolve-Path (Split-Path $fullCredPath) -ErrorAction Stop).Path (Split-Path $fullCredPath -Leaf)
        }
    } catch {
        Write-Host "[INFO] Could not fully resolve display path for '$fullCredPath'. Using constructed path." -ForegroundColor DarkGray
    }

    Write-Host "Verifying local credentials file (from config '$($configJson.authentication.credentialStorePath)' resolved to: $displayPath) ..." -NoNewline
    if (Test-Path $fullCredPath -PathType Leaf) {
        Write-Host " FOUND." -ForegroundColor Green
        Write-Host "[INFO] App Registration appears to be configured locally (credentials file exists)." -ForegroundColor White
        return $true
    } else {
        Write-Host " NOT FOUND." -ForegroundColor Red
        Write-Host "[WARNING] Local credentials file ('$displayPath') is missing or path is incorrect in config." -ForegroundColor Yellow
        Write-Host "           The Setup-AppRegistration.ps1 script typically saves credentials to '$($configJson.authentication.credentialStorePath)' (resolved to '$displayPath')." -ForegroundColor DarkGray
        Write-Host "           App Registration setup (Option [0] or [S]) might be required." -ForegroundColor Yellow
        return $false
    }
}

function Invoke-AppRegistrationSetupInternal {
    Write-Host "`n--- Invoking App Registration Setup (Full Mode) ---" -ForegroundColor Cyan
    $appRegScriptPath = $global:MandAAppRegScriptPath 
    
    if (Test-Path $appRegScriptPath -PathType Leaf) {
        Write-Host "Launching Azure App Registration setup script: $appRegScriptPath" -ForegroundColor Yellow
        Write-Host "Please follow the prompts. This may require elevated privileges." -ForegroundColor White
        try {
            Push-Location (Split-Path $appRegScriptPath -Parent)
            & $appRegScriptPath
            Pop-Location
            Write-Host "[INFO] App Registration script execution finished." -ForegroundColor White
        } catch {
            if ($PSScriptRoot -eq (Get-Location).Path) { Pop-Location }
            Write-Host "[ERROR] Failed to execute Setup-AppRegistration.ps1: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "[ERROR] Setup-AppRegistration.ps1 not found at '$appRegScriptPath'!" -ForegroundColor Red
    }
}

function Invoke-InteractiveCredentialInput {
    Write-Host "`n--- Storing Credentials Interactively ---" -ForegroundColor Cyan
    
    # Ensure EnhancedLogging.psm1 is loaded first for Write-MandALog
    $enhancedLoggingModulePath = Join-Path $global:MandAModulesPath "Utilities\EnhancedLogging.psm1"
    if (-not (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
        if (Test-Path $enhancedLoggingModulePath -PathType Leaf) {
            try {
                Import-Module $enhancedLoggingModulePath -Force -Global
                Write-Host "[INFO] Loaded EnhancedLogging.psm1 module." -ForegroundColor DarkGray
            } catch {
                Write-Host "[ERROR] Failed to load EnhancedLogging.psm1: $($_.Exception.Message)" -ForegroundColor Red
                Write-Host "[ERROR] Cannot proceed with saving credentials as logging is unavailable." -ForegroundColor Red
                return
            }
        } else {
            Write-Host "[ERROR] EnhancedLogging.psm1 not found at '$enhancedLoggingModulePath'." -ForegroundColor Red
            Write-Host "[ERROR] Cannot proceed with saving credentials as logging is unavailable." -ForegroundColor Red
            return
        }
    }
     if (-not (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
        Write-Host "[ERROR] Write-MandALog command is still not available after attempting to load module." -ForegroundColor Red
        Write-Host "[ERROR] Cannot proceed with saving credentials." -ForegroundColor Red
        return
    }


    # 1. Ensure CredentialManagement.psm1 is loaded for Set-SecureCredentials
    $credMgmtModulePath = Join-Path $global:MandAModulesPath "Authentication\CredentialManagement.psm1"
    if (-not (Get-Command Set-SecureCredentials -ErrorAction SilentlyContinue)) {
        if (Test-Path $credMgmtModulePath -PathType Leaf) {
            try {
                Import-Module $credMgmtModulePath -Force -Global
                Write-MandALog "Loaded CredentialManagement.psm1 module." -Level "INFO" # Use Write-MandALog now
            } catch {
                Write-MandALog "Failed to load CredentialManagement.psm1: $($_.Exception.Message)" -Level "ERROR"
                Write-MandALog "Cannot proceed with saving credentials." -Level "ERROR"
                return
            }
        } else {
            Write-MandALog "CredentialManagement.psm1 not found at '$credMgmtModulePath'." -Level "ERROR"
            Write-MandALog "Cannot proceed with saving credentials." -Level "ERROR"
            return
        }
    }
    if (-not (Get-Command Set-SecureCredentials -ErrorAction SilentlyContinue)) {
        Write-MandALog "Set-SecureCredentials command is still not available after attempting to load module." -Level "ERROR"
        Write-MandALog "Cannot proceed with saving credentials." -Level "ERROR"
        return
    }

    # 2. Get Credential Store Path from default-config.json
    $configFilePath = $global:MandADefaultConfigPath
    $configuredCredentialStorePath = $null # The path string from config
    $resolvedCredentialStorePath = $null # The full path to be used

    if (Test-Path $configFilePath -PathType Leaf) {
        try {
            $configJson = Get-Content $configFilePath -ErrorAction Stop | ConvertFrom-Json -ErrorAction Stop
            if ($configJson.authentication -and $configJson.authentication.credentialStorePath) {
                $configuredCredentialStorePath = $configJson.authentication.credentialStorePath
                if ([System.IO.Path]::IsPathRooted($configuredCredentialStorePath)) {
                    $resolvedCredentialStorePath = $configuredCredentialStorePath
                } else {
                    # Ensure $global:MandASuiteRoot is a valid directory before joining
                    if (-not (Test-Path $global:MandASuiteRoot -PathType Container)) {
                        Write-MandALog "Suite Root Path '$($global:MandASuiteRoot)' is invalid or not a directory. Cannot resolve relative credential path." -Level "ERROR"
                        return
                    }
                    $resolvedCredentialStorePath = Join-Path $global:MandASuiteRoot $configuredCredentialStorePath
                }

                # Ensure the parent directory for the credential file exists
                $parentDir = Split-Path -Path $resolvedCredentialStorePath
                $fileName = Split-Path -Path $resolvedCredentialStorePath -Leaf

                if (-not (Test-Path $parentDir -PathType Container)) {
                    Write-MandALog "Parent directory '$parentDir' for credential file does not exist. Attempting to create it." -Level "INFO"
                    try {
                        New-Item -Path $parentDir -ItemType Directory -Force -ErrorAction Stop | Out-Null
                        Write-MandALog "Created directory: $parentDir" -Level "INFO"
                    } catch {
                        Write-MandALog "Failed to create parent directory '$parentDir': $($_.Exception.Message)" -Level "ERROR"
                        return
                    }
                }
                # Reconstruct the full path with a potentially created and resolved parent directory.
                $resolvedCredentialStorePath = Join-Path (Resolve-Path $parentDir -ErrorAction Stop).Path $fileName
                if (-not $resolvedCredentialStorePath) { # Check if Resolve-Path failed for parentDir
                     Write-MandALog "Could not resolve the parent directory path '$parentDir' after attempting to create it." -Level "ERROR"
                     return
                }


            } else {
                Write-MandALog "'authentication.credentialStorePath' not found in configuration file: $configFilePath" -Level "ERROR"
                return
            }
        } catch {
            Write-MandALog "Could not read, parse configuration file '$configFilePath', or process path: $($_.Exception.Message)" -Level "ERROR"
            return
        }
    } else {
        Write-MandALog "Default configuration file not found at: $configFilePath" -Level "ERROR"
        return
    }
    
    Write-MandALog "Credentials will be saved to: '$resolvedCredentialStorePath'" -Level "INFO"

    # 3. Prompt User
    Write-Host "`nPlease provide the App Registration details:" -ForegroundColor Yellow # Keep Write-Host for direct user interaction
    $inputAppId = Read-Host "Enter Application (Client) ID"
    $inputTenantId = Read-Host "Enter Directory (Tenant) ID"
    $inputClientSecretSecure = Read-Host "Enter Client Secret" -AsSecureString
    
    if ([string]::IsNullOrWhiteSpace($inputAppId) -or [string]::IsNullOrWhiteSpace($inputTenantId) -or $inputClientSecretSecure.Length -eq 0) {
        Write-MandALog "Application ID, Tenant ID, and Client Secret are all required." -Level "ERROR"
        return
    }
    $plainClientSecret = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($inputClientSecretSecure))

    # 4. Call Set-SecureCredentials
    try {
        # Set-SecureCredentials needs a configuration object for the path
        # Ensure this structure matches what Set-SecureCredentials expects for its -Configuration parameter
        $saveConfig = @{
            authentication = @{
                credentialStorePath = $resolvedCredentialStorePath 
                # certificateThumbprint = $null # Assuming not used for this simple save
            }
        }
        # Set a default expiry date, as we don't know the actual secret's expiry from this input
        $defaultExpiryDate = (Get-Date).AddYears(1) 

        Write-MandALog "Attempting to save credentials..." -Level "INFO"
        # Assuming Set-SecureCredentials is in CredentialManagement.psm1 and handles the actual file writing and encryption
        $saveResult = Set-SecureCredentials -ClientId $inputAppId -ClientSecret $plainClientSecret -TenantId $inputTenantId -Configuration $saveConfig -ExpiryDate $defaultExpiryDate -ErrorAction Stop
        
        if ($saveResult) { # Assuming Set-SecureCredentials returns $true on success
            Write-MandALog "Credentials successfully saved to '$resolvedCredentialStorePath'." -Level "SUCCESS"
            Test-AppRegistrationPrerequisites | Out-Null # Re-check to update status display
        } else {
            # If Set-SecureCredentials throws an error, this 'else' won't be hit.
            # If it returns $false or $null on failure without throwing, this will be hit.
            Write-MandALog "Set-SecureCredentials completed but did not explicitly report success. Verify file at '$resolvedCredentialStorePath'." -Level "WARN"
        }
    } catch {
        Write-MandALog "Failed to save credentials: $($_.Exception.Message)" -Level "ERROR"
    } finally {
        # Securely clear the plain text secret from memory
        if ($PSBoundParameters.ContainsKey('plainClientSecret')) { # Check if variable exists before removing
             if ($plainClientSecret) { Remove-Variable plainClientSecret -ErrorAction SilentlyContinue }
        }
    }
}

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
    
    if (-not $ValidateOnlyFlag.IsPresent) {
        if (-not (Test-AppRegistrationPrerequisites)) {
            $confirmInputCreds = Read-Host "App Registration (local credentials file) appears to be missing or misconfigured. Provide credentials now to create the file (Option [S])? (Y/N)"
            if ($confirmInputCreds -clike 'y') {
                Invoke-InteractiveCredentialInput 
                
                if (-not (Test-AppRegistrationPrerequisites)) {
                    Write-Host "[ERROR] Interactive credential input was attempted, but local credentials file is still not found/configured correctly." -ForegroundColor Red
                    Write-Host "        Cannot proceed with orchestrator phase '$PhaseTitle'." -ForegroundColor Yellow
                    Request-UserToContinue
                    return
                }
                Write-Host "[SUCCESS] App Registration prerequisites (credentials file) met after interactive input." -ForegroundColor Green
            } else {
                Write-Host "[INFO] Orchestrator phase '$PhaseTitle' cancelled by user due to missing App Registration. Consider using menu option [0] or [S]." -ForegroundColor Yellow
                Request-UserToContinue
                return
            }
        }
    } else {
         Write-Host "[INFO] Skipping App Registration credential check for Orchestrator's ValidateOnly mode." -ForegroundColor DarkGray
    }

    $orchestratorPath = $global:MandAOrchestratorPath
    $configFilePath = $global:MandADefaultConfigPath 

    if (-not (Test-Path $orchestratorPath -PathType Leaf)) { Write-Host "[ERROR] Orchestrator script not found: $orchestratorPath" -ForegroundColor Red; Request-UserToContinue; return }
    if (-not (Test-Path $configFilePath -PathType Leaf)) { Write-Host "[ERROR] Default configuration file not found: $configFilePath" -ForegroundColor Red; Request-UserToContinue; return }
    
    $arguments = @{ ConfigurationFile = $configFilePath } 
    if ($ValidateOnlyFlag.IsPresent) { $arguments.ValidateOnly = $true } 
    elseif ($Mode) { $arguments.Mode = $Mode }
    foreach ($key in $ExtraArgs.Keys) { $arguments[$key] = $ExtraArgs[$key] }
    
    $commandString = "& `"$orchestratorPath`""
    foreach ($key in $arguments.Keys) {
        if ($arguments[$key] -is [switch] -and $arguments[$key].IsPresent) { $commandString += " -$key" }
        elseif ($arguments[$key] -is [bool] -and $arguments[$key]) { $commandString += " -$key" } 
        elseif ($null -ne $arguments[$key] -and -not ($arguments[$key] -is [switch])) { 
             $commandString += " -$key `"$($arguments[$key])`"" 
        }
    }
    Write-Host "Executing Orchestrator: $commandString" -ForegroundColor DarkGray
    Write-Host "Please wait..." -ForegroundColor Yellow
    
    try {
        Push-Location $global:MandACorePath 
        & $orchestratorPath @arguments
        $exitCode = $LASTEXITCODE
        Pop-Location
        if ($exitCode -eq 0) { Write-Host "[SUCCESS] Orchestrator phase '$PhaseTitle' completed successfully." -ForegroundColor Green }
        else { Write-Host "[WARNING] Orchestrator phase '$PhaseTitle' completed with exit code: $exitCode. Check logs at $($global:MandAConfigPath)\..\Output\Logs or similar." -ForegroundColor Yellow }
    } catch { 
        if ($global:MandACorePath -eq (Get-Location).Path) { Pop-Location } 
        Write-Host "[ERROR] Failed to launch Orchestrator for '$PhaseTitle': $($_.Exception.Message)" -ForegroundColor Red 
    }
    Request-UserToContinue
}

function Invoke-FullInstallationValidation {
    Write-Host "`n--- Invoking Full Installation Validation ---" -ForegroundColor Cyan
    $validationScriptPath = $global:MandAValidationScriptPath
    if (Test-Path $validationScriptPath -PathType Leaf) {
        Write-Host "Running full installation validation: $validationScriptPath" -ForegroundColor Yellow
        try {
            Push-Location (Split-Path $validationScriptPath -Parent)
            & $validationScriptPath
            Pop-Location
            Write-Host "[INFO] Full installation validation finished." -ForegroundColor White
        } catch {
            if ($PSScriptRoot -eq (Get-Location).Path) { Pop-Location }
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
Write-Host "`n--- M&A Discovery Suite QuickStart Initializing ---" -ForegroundColor Cyan
Write-Host "Sourcing Set-SuiteEnvironment.ps1 to finalize environment variables (already done)..." -ForegroundColor DarkGray

$unblockScriptPath = Join-Path $global:MandASuiteRoot "Unblock-AllFiles.ps1" 
if (Test-Path $unblockScriptPath -PathType Leaf) {
    Write-Host "Attempting to unblock all script files in '$($global:MandASuiteRoot)'..." -ForegroundColor Yellow
    try { 
        Push-Location $global:MandASuiteRoot 
        & $unblockScriptPath -Path $global:MandASuiteRoot 
        Pop-Location
        Write-Host "[SUCCESS] File unblocking completed." -ForegroundColor Green 
    }
    catch { 
        if ($global:MandASuiteRoot -eq (Get-Location).Path) { Pop-Location } 
        Write-Host "[ERROR] Unblocking files failed: $($_.Exception.Message)" -ForegroundColor Red; Request-UserToContinue 
    }
} else { Write-Host "[WARNING] Unblock-AllFiles.ps1 not found at '$unblockScriptPath'. Files might be blocked by execution policy." -ForegroundColor Yellow; Request-UserToContinue }

if (-not (Test-RequiredPowerShellModules)) {
    Write-Host "[CRITICAL FAILURE] Essential PowerShell modules are missing or DiscoverySuiteModuleCheck.ps1 reported critical errors." -ForegroundColor Red
    Write-Host "                   Please resolve these module issues before proceeding." -ForegroundColor Red
    Write-Host "                   QuickStart will pause. Press Enter to see the menu, but some options may not function correctly." -ForegroundColor Yellow
    Request-UserToContinue
} else {
    Write-Host "[SUCCESS] Initial PowerShell module check passed or allows proceeding." -ForegroundColor Green
}

Write-Host "Initialization complete. Launching main menu..." -ForegroundColor White; Start-Sleep -Seconds 1

do {
    Show-Menu
    $choice = Read-Host "Enter your choice"
    switch ($choice) {
        '0' { Invoke-AppRegistrationSetupInternal; Request-UserToContinue }
        'S' { Invoke-InteractiveCredentialInput; Request-UserToContinue } 
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
        'V' { Invoke-FullInstallationValidation } 
        'M' { Test-RequiredPowerShellModules; Request-UserToContinue } 
        'q' { Write-Host "`nExiting M&A Discovery Suite QuickStart Launcher." -ForegroundColor Cyan }
        default { Write-Host "`n[ERROR] Invalid choice. Please try again." -ForegroundColor Red; Request-UserToContinue }
    }
} while ($choice -cne 'q') 

Write-Host "Thank you for using the M&A Discovery Suite!" -ForegroundColor Green
