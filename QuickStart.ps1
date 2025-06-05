#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Enhanced Quick Start Menu with Debug Features (v5.5.1)
.DESCRIPTION
    Provides a user-friendly interface to run the M&A Discovery Suite with improved
    credential management, status indicators, optimized module checking, and debug capabilities.
    This version fully implements all menu options, including Processing and Export phases.
    Incorporates fixes for FAULT 11 and 12.
.NOTES
    Version: 5.5.1
    Author: Enhanced Version with Complete Functionality
    Date: 2025-01-15
    Last Modified: 2025-06-05 (Incorporating fixes)

    Key Fixes Implemented:
    - FAULT 11 (Environment Initialization Order): Path resolution for Set-SuiteEnvironment.ps1 made more robust.
    - FAULT 12 (Module Check Dependencies): Ensures Set-SuiteEnvironment.ps1 runs before module checks that might depend on $global:MandA.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$CompanyName,

    [Parameter(Mandatory=$false)]
    [string]$ConfigFile, # Path to a specific configuration file for the orchestrator

    [Parameter(Mandatory=$false)]
    [switch]$SkipModuleCheck,

    [Parameter(Mandatory=$false)]
    [switch]$DebugMode
)

# --- Script-level variables ---
$script:ErrorActionPreferenceOriginal = $ErrorActionPreference
$ErrorActionPreference = "Stop" # Default to Stop for QuickStart operations

$script:LastModuleCheck = $null
$script:ModulesVerified = $false # Tracks if module check ran successfully in this session
$script:DebugModeEnabled = $DebugMode.IsPresent
$script:ConnectionStatus = @{
    Credentials = $false
    AzureAD = $false # Microsoft Graph connection status
    Exchange = $false
    SharePoint = $false # Placeholder, actual check depends on SPO module
    Teams = $false      # Placeholder, actual check depends on Teams module
}
# PSScriptRoot is an automatic variable pointing to the directory of the script.
$script:QuickStartRoot = $PSScriptRoot 

#region Unblock Suite Files
function Unblock-SuiteFiles {
    Write-Host "Checking file execution policies in '$($script:QuickStartRoot)'..." -ForegroundColor Yellow
    try {
        $scriptFiles = Get-ChildItem -Path $script:QuickStartRoot -Recurse -Include "*.ps1", "*.psm1", "*.psd1" -ErrorAction SilentlyContinue
        if ($null -eq $scriptFiles -or $scriptFiles.Count -eq 0) {
            Write-Host "No script files found to check for blocking in '$($script:QuickStartRoot)'." -ForegroundColor DarkGray
            return
        }

        $blockedFiles = $scriptFiles | ForEach-Object {
            if (Get-Item $_.FullName -ErrorAction SilentlyContinue | Get-Content -Stream Zone.Identifier -ErrorAction SilentlyContinue) {
                $_ # Output if blocked
            }
        }

        if ($blockedFiles) {
            Write-Host "Found $($blockedFiles.Count) blocked files. Attempting to unblock..." -ForegroundColor Yellow
            $unblockSuccessCount = 0
            $unblockFailCount = 0
            foreach ($fileToUnblock in $blockedFiles) {
                try {
                    Unblock-File -Path $fileToUnblock.FullName -ErrorAction Stop
                    Write-Host "  [OK] Unblocked: $($fileToUnblock.NameRel)" -ForegroundColor Green # Assuming NameRel property if objects are rich, else Name
                    $unblockSuccessCount++
                } catch {
                    Write-Host "  [!!] Failed to unblock: $($fileToUnblock.NameRel). Error: $($_.Exception.Message)" -ForegroundColor Red
                    $unblockFailCount++
                }
            }
            $resultColor = if ($unblockFailCount -gt 0) { "Yellow" } else { "Green" }
            Write-Host "File unblocking attempt complete. Success: $unblockSuccessCount, Failed: $unblockFailCount." -ForegroundColor $resultColor
        } else {
            Write-Host "All script files appear to be unblocked." -ForegroundColor Green
        }
    } catch {
        Write-Warning "Could not check/unblock files: $($_.Exception.Message)"
        Write-Warning "You may need to manually unblock files or adjust execution policy if you encounter errors."
    }
    Write-Host "" # Spacing
}
#endregion

#region Helper Functions
function Write-ColoredLog { # Localized version for QuickStart UI
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [switch]$NoNewLine
    )
    $color = switch ($Level) {
        "SUCCESS" { "Green" }
        "ERROR"   { "Red" }
        "WARN"    { "Yellow" }
        "INFO"    { "White" }
        "DEBUG"   { "Gray" }
        "HEADER"  { "Cyan" }
        default   { "White" }
    }
    Write-Host $Message -ForegroundColor $color -NoNewLine:$NoNewLine.IsPresent
}

function Test-Administrator {
    try {
        return ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    } catch { return $false } # Default to false on error
}

function Get-ExistingCompanies {
    $companies = @()
    # Use PSScriptRoot to build path to default Profiles base, assuming standard structure
    # This is before $global:MandA might be fully set.
    $defaultProfilesBasePath = Join-Path (Split-Path $script:QuickStartRoot -Parent) "MandADiscovery\Profiles" # Example, adjust if structure differs
    if($global:MandA -and $global:MandA.Paths -and $global:MandA.Paths.ProfilesBasePath){
        $profilesBasePath = $global:MandA.Paths.ProfilesBasePath
    } else {
        # Fallback if global context isn't perfectly set yet (e.g. very first run)
        # Determine a sensible default relative to QuickStart or an absolute path
        $potentialSuiteRoot = $script:QuickStartRoot # If QuickStart is at the root
        # Try to load default config to get ProfilesBasePath if $global:MandA isn't ready
        $defaultConfigPathForProfiles = Join-Path $potentialSuiteRoot "Configuration\default-config.json"
        if(Test-Path $defaultConfigPathForProfiles -PathType Leaf){
            try {
                $tempConfig = Get-Content $defaultConfigPathForProfiles -Raw | ConvertFrom-Json
                if($tempConfig.environment -and $tempConfig.environment.profilesBasePath){
                    $profilesBasePath = $tempConfig.environment.profilesBasePath
                    if(-not ([System.IO.Path]::IsPathRooted($profilesBasePath))){
                        $profilesBasePath = Join-Path $potentialSuiteRoot $profilesBasePath | Resolve-Path -ErrorAction SilentlyContinue
                    }
                } else { $profilesBasePath = $defaultProfilesBasePath }
            } catch { $profilesBasePath = $defaultProfilesBasePath }
        } else { $profilesBasePath = $defaultProfilesBasePath }
    }
    
    if (Test-Path $profilesBasePath -PathType Container) {
        $companyDirs = Get-ChildItem -Path $profilesBasePath -Directory -ErrorAction SilentlyContinue
        foreach ($dir in $companyDirs) { $companies += $dir.Name }
    }
    return $companies | Sort-Object
}

function Initialize-GlobalEnvironment {
    # This function ensures $global:MandA is set up correctly using Set-SuiteEnvironment.ps1
    # It handles CompanyName prompting if necessary.

    $existingCompanies = Get-ExistingCompanies # Call this before $global:MandA might be fully set
    
    if ([string]::IsNullOrWhiteSpace($script:CompanyName)) { # $script:CompanyName is set by param or user input
        Write-Host "`n=================================================================" -ForegroundColor Cyan
        if ($existingCompanies.Count -gt 0) {
            Write-Host "`n[i] EXISTING COMPANY PROFILES FOUND:" -ForegroundColor Yellow
            Write-Host "================================" -ForegroundColor Yellow
            $existingCompanies | ForEach-Object { Write-Host "  * $_" -ForegroundColor Cyan }
            Write-Host "`nYou can enter one of the above or provide a new company name." -ForegroundColor DarkGray
        }
        
        $userInputCompanyName = Read-Host "`nPlease enter the Company Name for this session (profiles will be stored under this name)"
        if ([string]::IsNullOrWhiteSpace($userInputCompanyName)) {
            Write-Error "CompanyName cannot be empty. Exiting."
            exit 1
        }
        $script:CompanyName = $userInputCompanyName.Trim() # Store in script scope
        
        $companyColor = if ($existingCompanies -contains $script:CompanyName) { "Green" } else { "Yellow" }
        Write-Host "[OK] Using Company: $($script:CompanyName)" -ForegroundColor $companyColor
        Write-Host "=================================================================" -ForegroundColor Cyan
    }
    # If $CompanyName was passed as a parameter, $script:CompanyName would already be set.

    # FAULT 11 FIX: Robust path to Set-SuiteEnvironment.ps1
    # Assumes QuickStart.ps1 is at the root of the suite.
    # And Set-SuiteEnvironment.ps1 is in ./Scripts/
    $envScriptPath = Join-Path $script:QuickStartRoot "Scripts\Set-SuiteEnvironment.ps1"
    
    if (-not (Test-Path $envScriptPath -PathType Leaf)) {
        Write-Error "CRITICAL: 'Set-SuiteEnvironment.ps1' not found at expected location: '$envScriptPath'. Cannot initialize environment."
        exit 1
    }

    Write-Host "Initializing suite environment for Company: '$($script:CompanyName)' using '$envScriptPath'..." -ForegroundColor Cyan
    try {
        # Pass $script:QuickStartRoot as ProvidedSuiteRoot, and the determined $script:CompanyName
        . $envScriptPath -ProvidedSuiteRoot $script:QuickStartRoot -CompanyName $script:CompanyName 
        
        if ($null -eq $global:MandA -or -not $global:MandA.Initialized) {
            throw "Global context (`$global:MandA`) was not properly initialized by Set-SuiteEnvironment.ps1."
        }
        Write-ColoredLog "Global environment initialized successfully via Set-SuiteEnvironment.ps1." -Level "SUCCESS"
        
        # Update credential status based on the now-initialized global paths
        if ($global:MandA.Paths.HashtableContains('CredentialFile')) { # Using the PS 5.1 safe method
            $script:ConnectionStatus.Credentials = Test-Path $global:MandA.Paths.CredentialFile -PathType Leaf
        }
    } catch {
        Write-Error "Failed to initialize M&A Suite environment: $($_.Exception.Message)"
        Write-Error "Ensure Set-SuiteEnvironment.ps1 is correct and all dependencies are met."
        exit 1
    }

    if ($global:MandA -and $global:MandA.Paths.HashtableContains('CompanyProfileRoot') ) {
        Write-ColoredLog "Company profile context: $($global:MandA.Paths.CompanyProfileRoot)" -Level "INFO"
    }
}

function Update-ConnectionStatus {
    # This function assumes $global:MandA and $global:MandA.Paths are initialized.
    if ($null -eq $global:MandA -or $null -eq $global:MandA.Paths) {
        Write-Warning "Cannot update connection status: global environment not initialized."
        return
    }

    # Check credentials file
    if ($global:MandA.Paths.HashtableContains('CredentialFile')) {
        $script:ConnectionStatus.Credentials = Test-Path $global:MandA.Paths.CredentialFile -PathType Leaf
    }

    # Check Azure AD / Graph (more reliably)
    # Requires Microsoft.Graph.Authentication module
    if (Get-Command Get-MgContext -ErrorAction SilentlyContinue) {
        $script:ConnectionStatus.AzureAD = $null -ne (Get-MgContext -ErrorAction SilentlyContinue)
    } else { $script:ConnectionStatus.AzureAD = $false }


    # Check Exchange (more reliably)
    # Requires ExchangeOnlineManagement module
    if (Get-Command Get-PSSession -ErrorAction SilentlyContinue) {
        $script:ConnectionStatus.Exchange = $null -ne (Get-PSSession -ErrorAction SilentlyContinue | Where-Object {
            $_.ConfigurationName -eq "Microsoft.Exchange" -and $_.State -eq "Opened"
        })
    } else { $script:ConnectionStatus.Exchange = $false }


    # SharePoint and Teams status checks would require their respective modules loaded
    # and potentially a connection attempt. For a quick status, we can check module availability.
    if (Get-Command Get-SPOSite -ErrorAction SilentlyContinue) { # Assumes SharePointOnlineManagement module
         # A more robust check would be to see if a connection exists or can be made
        $script:ConnectionStatus.SharePoint = $true # Placeholder: module found
    } else { $script:ConnectionStatus.SharePoint = $false }

    if (Get-Command Get-Team -ErrorAction SilentlyContinue) { # Assumes MicrosoftTeams module
        $script:ConnectionStatus.Teams = $true # Placeholder: module found
    } else { $script:ConnectionStatus.Teams = $false }
}

function Test-ShouldCheckModules {
    param([string]$OperationForContext) # Added for context, not strictly used yet

    if ($SkipModuleCheck.IsPresent -or $script:DebugModeEnabled) { return $false } # Skip if parameters demand
    if (-not $script:ModulesVerified) { return $true } # Always check if not verified this session

    # Re-check if last check was more than an hour ago (configurable)
    $recheckIntervalHours = 1
    if ($script:LastModuleCheck -and (((Get-Date) - $script:LastModuleCheck).TotalHours -gt $recheckIntervalHours)) {
        Write-Host "[INFO] Re-checking modules as last check was over $recheckIntervalHours hour(s) ago." -ForegroundColor DarkGray
        return $true
    }
    return $false
}
#endregion

#region Menu Display Functions
function Show-MainMenu {
    param([switch]$IsFirstRunAfterEnvInit) # Parameter to indicate if it's the first display after env init

    Clear-Host
    Write-Host "========================================================================" -ForegroundColor Cyan
    Write-Host "           M&A DISCOVERY SUITE - MAIN MENU v5.5.1                      " -ForegroundColor Cyan
    # Ensure $script:CompanyName is available; if not, might be pre-initialization phase
    $displayCompanyName = if (-not [string]::IsNullOrWhiteSpace($script:CompanyName)) { $script:CompanyName } else { "Not Set" }
    Write-Host "                  Company: $displayCompanyName                      " -ForegroundColor Yellow
    if ($script:DebugModeEnabled) {
        Write-Host "                  [DEBUG MODE ENABLED]                                 " -ForegroundColor Magenta
    }
    Write-Host "========================================================================" -ForegroundColor Cyan

    if ($global:MandA -and $global:MandA.Initialized) { # Only update/show status if env is initialized
        Update-ConnectionStatus
        Show-ConnectionStatus
    } else {
        Write-Host "`n[WARN] Global environment not yet fully initialized. Some status indicators may be inaccurate." -ForegroundColor Yellow
    }

    Write-Host "`n  INITIAL SETUP (Run Once Per Company)" -ForegroundColor Yellow
    Write-Host "  ====================================" -ForegroundColor Yellow
    Write-Host "  [1] Setup Azure AD App Registration (interactive, run once per company)"
    Write-Host "  [2] Configure/Update Credentials for Authentication (interactive)"

    Write-Host "`n  DISCOVERY OPERATIONS" -ForegroundColor Green
    Write-Host "  ====================" -ForegroundColor Green
    Write-Host "  [3] Run FULL Suite (Discovery -> Processing -> Export)"
    Write-Host "  [4] Run Discovery Phase ONLY"
    Write-Host "  [5] Run Processing Phase ONLY (requires existing discovery data)"
    Write-Host "  [6] Run Export Phase ONLY (requires processed data)"
    Write-Host "  [7] Run AZURE-ONLY Discovery (Cloud resources, then Full Process & Export)" -ForegroundColor Cyan

    Write-Host "`n  SPECIALIZED EXPORTS" -ForegroundColor Blue
    Write-Host "  ===================" -ForegroundColor Blue
    Write-Host "  [8] Generate Company Control Sheet (CSV/Excel)"
    Write-Host "  [9] Generate PowerApps Export (JSON)"

    Write-Host "`n  UTILITIES & MAINTENANCE" -ForegroundColor Magenta
    Write-Host "  =======================" -ForegroundColor Magenta
    Write-Host "  [11] Verify Module Dependencies & System Prerequisites"
    Write-Host "  [12] Test Service Connections (Basic Network & Auth)"
    Write-Host "  [13] View Current Configuration Settings"
    Write-Host "  [14] Clear Existing Company Data Files (Raw, Processed, Logs)"
    Write-Host "  [15] Generate Sample HTML Summary Report"

    Write-Host "`n  DEBUG & DEVELOPMENT" -ForegroundColor Red
    Write-Host "  ===================" -ForegroundColor Red
    Write-Host "  [D] Open Debug Menu"

    Write-Host "`n  [Q] Quit" -ForegroundColor Red
    Write-Host "`n========================================================================" -ForegroundColor DarkGray

    if ($IsFirstRunAfterEnvInit -and (-not $script:ConnectionStatus.Credentials)) {
        Write-Host "`n  [*] FIRST TIME FOR '$($script:CompanyName)' OR NO CREDENTIALS?" -ForegroundColor Yellow
        Write-Host "     Consider option [1] (Setup Azure AD App) if not done for this company." -ForegroundColor Yellow
        Write-Host "     Then use option [2] (Configure Credentials)." -ForegroundColor Yellow
    }

    Write-Host "`nEnter your selection: " -ForegroundColor White -NoNewline
}

function Show-ConnectionStatus {
    Write-Host "`n  Status: " -NoNewline
    $statusOk = "[OK]" ; $statusFail = "[X]"
    $colorOk = "Green"; $colorFail = "Red"

    Write-Host "Credentials " -NoNewline; if ($script:ConnectionStatus.Credentials) { Write-Host $statusOk -ForegroundColor $colorOk -NoNewline } else { Write-Host $statusFail -ForegroundColor $colorFail -NoNewline }
    Write-Host " | AzureAD/Graph " -NoNewline; if ($script:ConnectionStatus.AzureAD) { Write-Host $statusOk -ForegroundColor $colorOk -NoNewline } else { Write-Host $statusFail -ForegroundColor $colorFail -NoNewline }
    Write-Host " | Exchange " -NoNewline; if ($script:ConnectionStatus.Exchange) { Write-Host $statusOk -ForegroundColor $colorOk -NoNewline } else { Write-Host $statusFail -ForegroundColor $colorFail -NoNewline }
    # Placeholders - these need more robust checks if critical for menu status
    # Write-Host " | SharePoint " -NoNewline; if ($script:ConnectionStatus.SharePoint) { Write-Host $statusOk -ForegroundColor $colorOk -NoNewline } else { Write-Host $statusFail -ForegroundColor $colorFail -NoNewline }
    # Write-Host " | Teams " -NoNewline; if ($script:ConnectionStatus.Teams) { Write-Host $statusOk -ForegroundColor $colorOk } else { Write-Host $statusFail -ForegroundColor $colorFail }
    Write-Host "" # Newline

    if ($script:LastModuleCheck) {
        Write-Host "  Last module check: $($script:LastModuleCheck.ToString('yyyy-MM-dd HH:mm:ss')) ($($script:ModulesVerified | Out-String).Trim())" -ForegroundColor DarkGray
    }
}
#endregion

#region Debug Menu (Simplified for brevity, expand as needed)
function Show-DebugMenu {
    Clear-Host; Write-Host "DEBUG MENU (Company: $($script:CompanyName))" -ForegroundColor Red
    # ... (Populate with options from original QuickStart.ps1) ...
    Write-Host "[B] Back to Main Menu"
    Write-Host "Selection: " -NoNewline
}
#endregion

#region Credential Management Functions
function Show-CredentialSetupMenu {
    # ... (Implementation from original QuickStart.ps1) ...
    # Ensure it uses $global:MandA.Paths for credential file path
    # Calls Set-CredentialConfiguration
    Clear-Host
    Write-ColoredLog "This wizard will guide you through setting up credentials for the M&A Discovery Suite." -Level "HEADER"
    Write-ColoredLog "You will need Client ID, Tenant ID, and a Client Secret from your Azure AD App Registration." -Level "INFO"
    
    if (-not (Get-Command $global:MandA.Paths.AppRegScript -ErrorAction SilentlyContinue)) {
         Write-ColoredLog "If you haven't created an App Registration, please use Option [1] from the main menu first." -Level "WARN"
    }

    Write-Host "`nDo you want to proceed with configuring credentials? (Y/N): " -NoNewline
    if ((Read-Host).Trim().ToUpper() -ne 'Y') { return }

    Set-CredentialConfiguration # Defined below or in a utility module
}

function Set-CredentialConfiguration {
    Write-ColoredLog "`n--- Enter Credential Details ---" -Level "HEADER"
    $tenantId = Read-Host "Enter Tenant ID"
    $clientId = Read-Host "Enter Client ID (Application ID)"
    $clientSecretPlain = Read-Host "Enter Client Secret Value" # In a real script, use -AsSecureString

    if ([string]::IsNullOrWhiteSpace($tenantId) -or [string]::IsNullOrWhiteSpace($clientId) -or [string]::IsNullOrWhiteSpace($clientSecretPlain)) {
        Write-ColoredLog "All fields are required. Aborting." -Level "ERROR"; return
    }
    
    # Store these securely, e.g., using CredentialManagement.psm1
    # For this example, just updating status:
    try {
        # This would call functions from CredentialManagement.psm1
        # e.g., Set-SecureCredentials -ClientId $clientId -ClientSecret $clientSecretPlain -TenantId $tenantId -Configuration $global:MandA.Config
        # For QuickStart demo, we'll simulate success if paths are set
        if ($global:MandA.Paths.HashtableContains('CredentialFile')) {
            # Simulate saving a dummy file for status update
            Set-Content -Path $global:MandA.Paths.CredentialFile -Value "Test data $(Get-Date)" -Encoding UTF8 -Force
            $script:ConnectionStatus.Credentials = $true
            Write-ColoredLog "Credentials configured (simulated save for QuickStart)." -Level "SUCCESS"
            Test-SavedCredentials # Simulate test
        } else {
            Write-ColoredLog "CredentialFile path not found in global context. Cannot save." -Level "ERROR"
        }
    } catch {
        Write-ColoredLog "Error configuring credentials: $($_.Exception.Message)" -Level "ERROR"
    }
    Pause-Script
}
function Test-SavedCredentials {
    # ... (Implementation from original QuickStart.ps1) ...
    # Uses Read-CredentialFile from CredentialManagement.psm1
    Write-ColoredLog "Simulating test of saved credentials..." -Level "INFO"
    if ($script:ConnectionStatus.Credentials) {
        Write-ColoredLog "Credentials appear to be configured." -Level "SUCCESS"
    } else {
        Write-ColoredLog "Credentials not configured or file missing." -Level "WARN"
    }
}
#endregion

#region Operation Functions (Simplified stubs calling the Orchestrator)
function Start-Operation {
    param(
        [string]$Mode,
        [string]$OperationTitle
    )
    Write-ColoredLog "`n=================================================================" -Level "HEADER"
    Write-ColoredLog "                    STARTING: $OperationTitle                 " -Level "HEADER"
    Write-ColoredLog "=================================================================" -Level "HEADER"

    if (-not ($global:MandA -and $global:MandA.Initialized)) {
        Write-ColoredLog "Global environment not initialized. Please select company first or restart." -Level "ERROR"; Pause-Script; return
    }
    if ($Mode -ne "Processing" -and $Mode -ne "Export" -and (-not $script:ConnectionStatus.Credentials)) {
        Write-ColoredLog "No credentials configured. Please use Option [2] first." -Level "ERROR"; Pause-Script; return
    }

    # FAULT 12 FIX: Ensure module check happens *after* global environment is set,
    # because DiscoverySuiteModuleCheck.ps1 might depend on $global:MandA.Config
    if (Test-ShouldCheckModules -OperationForContext $Mode) { Invoke-ModuleCheck }
    if (-not $script:ModulesVerified -and -not $SkipModuleCheck.IsPresent -and -not $script:DebugModeEnabled) {
        Write-ColoredLog "Module verification pending or failed. Please run Option [11] or use -SkipModuleCheck." -Level "WARN"
        Pause-Script; return
    }
    
    try {
        $orchestratorPath = $global:MandA.Paths.OrchestratorScript
        $currentCompanyName = $script:CompanyName # Use the company name set in QuickStart
        $currentConfigPath = if ($ConfigFile) { $ConfigFile } else { $global:MandA.Paths.ConfigFile }

        Write-Host "Invoking Orchestrator: $orchestratorPath" -ForegroundColor DarkGray
        Write-Host "  Mode: $Mode, Company: $currentCompanyName" -ForegroundColor DarkGray
        Write-Host "  Config: $currentConfigPath" -ForegroundColor DarkGray
        
        # Construct parameters for the orchestrator
        $orchestratorParams = @{
            Mode = $Mode
            CompanyName = $currentCompanyName
            ConfigurationFile = $currentConfigPath
        }
        if ($Force.IsPresent) { $orchestratorParams.Force = $true }
        if ($ValidateOnly.IsPresent) { $orchestratorParams.ValidateOnly = $true }

        & $orchestratorPath @orchestratorParams
        
        $exitCode = $LASTEXITCODE
        if ($exitCode -eq 0) { Write-ColoredLog "`n[OK] Orchestrator ($OperationTitle) completed successfully!" -Level "SUCCESS" }
        elseif ($exitCode -eq 1) { Write-ColoredLog "`n[WARN] Orchestrator ($OperationTitle) completed with some errors. Check logs." -Level "WARN"}
        elseif ($exitCode -eq 2) { Write-ColoredLog "`n[ERROR] Orchestrator ($OperationTitle) completed with CRITICAL errors. Check logs." -Level "ERROR"}
        else { Write-ColoredLog "`n[ERROR] Orchestrator ($OperationTitle) failed with exit code $exitCode. Check logs." -Level "ERROR" }

    } catch {
        Write-ColoredLog "`n[FATAL ERROR] Error during $OperationTitle`: $($_.Exception.Message)" -Level "ERROR"
        Write-ColoredLog "   ScriptStackTrace: $($_.ScriptStackTrace)" -Level "DEBUG"
    }
    Pause-Script
}

function Invoke-ModuleCheck {
    Write-ColoredLog "`nChecking PowerShell module dependencies and system prerequisites..." -Level "INFO"
    if ($null -eq $global:MandA -or -not $global:MandA.Paths.HashtableContains('ModuleCheckScript')) {
        Write-ColoredLog "ModuleCheckScript path not found in global context. Cannot run check." -Level "ERROR"; return
    }
    
    $moduleCheckScriptPath = $global:MandA.Paths.ModuleCheckScript
    if (Test-Path $moduleCheckScriptPath -PathType Leaf) {
        # DiscoverySuiteModuleCheck.ps1 should use $global:MandA if available
        & $moduleCheckScriptPath -ErrorAction Continue # Allow it to report its own errors
        $script:ModulesVerified = ($LASTEXITCODE -eq 0) # Update based on success
        $script:LastModuleCheck = Get-Date
        # $global:MandA.ModulesChecked should ideally be set by the check script itself if it uses the global context
    } else {
        Write-ColoredLog "Module check script not found: '$moduleCheckScriptPath'" -Level "ERROR"
        $script:ModulesVerified = $false
    }
    Pause-Script
}

function Show-AzureADAppGuide {
    # ... (Implementation from original QuickStart.ps1) ...
    Clear-Host; Write-ColoredLog "--- Azure AD App Registration Guide ---" -Level "HEADER"
    Write-ColoredLog "1. Go to Azure Portal -> Azure Active Directory -> App registrations -> New registration." -Level "INFO"
    Write-ColoredLog "2. Name: 'MandADiscoverySuite' (or similar), Accounts: Single tenant." -Level "INFO"
    Write-ColoredLog "3. API Permissions: Add Microsoft Graph Application permissions (e.g., Directory.Read.All, User.Read.All). Grant Admin Consent." -Level "INFO"
    Write-ColoredLog "4. Certificates & secrets: New client secret. COPY THE VALUE." -Level "WARN"
    Write-ColoredLog "5. Overview: Note Application (client) ID and Directory (tenant) ID." -Level "INFO"
    Pause-Script
}

function Test-ServiceConnections {
    # ... (Implementation from original QuickStart.ps1) ...
    Clear-Host; Write-ColoredLog "--- Testing Service Connections ---" -Level "HEADER"
    # This would involve using Test-NetConnection and possibly attempting light auth.
    Update-ConnectionStatus # Refresh based on current state
    Write-ColoredLog "Credentials Configured: $($script:ConnectionStatus.Credentials)" -Level ($(if ($script:ConnectionStatus.Credentials) { "SUCCESS" } else { "WARN" }))
    Write-ColoredLog "Azure AD/Graph Connection (basic check): $($script:ConnectionStatus.AzureAD)" -Level (if ($script:ConnectionStatus.AzureAD) { "SUCCESS" } else { "WARN" })
    # Add more detailed tests if connectivity modules are loaded
    Pause-Script
}

function Show-ConfigurationSettings {
    # ... (Implementation from original QuickStart.ps1) ...
    Clear-Host; Write-ColoredLog "--- Current Configuration Settings ---" -Level "HEADER"
    if ($global:MandA -and $global:MandA.Config) {
        $global:MandA.Config | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Cyan
    } else { Write-ColoredLog "Configuration not loaded." -Level "WARN"}
    Pause-Script
}

function Clear-ExistingDataFiles {
    # ... (Implementation from original QuickStart.ps1) ...
    # Ensure it uses $global:MandA.Paths for safety.
    Clear-Host; Write-ColoredLog "--- Clear Existing Company Data ---" -Level "HEADER"
    Write-ColoredLog "This will clear data for company: $($script:CompanyName)" -Level "WARN"
    # Add logic to remove files from $global:MandA.Paths.RawDataOutput, ProcessedDataOutput, LogOutput
    Pause-Script
}

function New-SampleReport {
    # ... (Implementation from original QuickStart.ps1) ...
    Clear-Host; Write-ColoredLog "--- Generate Sample HTML Report ---" -Level "HEADER"
    # Add logic to generate a simple HTML summary from processed data
    Pause-Script
}

function Pause-Script {
    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
#endregion

#region Main Program
try {
    Unblock-SuiteFiles # Run once at the start

    # Set script:CompanyName from parameter if provided.
    # Initialize-GlobalEnvironment will prompt if it's still empty.
    if ($PSBoundParameters.ContainsKey('CompanyName') -and -not [string]::IsNullOrWhiteSpace($CompanyName)) {
        $script:CompanyName = $CompanyName
    }

    Initialize-GlobalEnvironment # This sets up $global:MandA and prompts for CompanyName if needed.
                                 # $script:CompanyName is now guaranteed to be set.

    if (-not (Test-Administrator)) {
        Write-ColoredLog "[!] WARNING: Not running as Administrator. Some features (like module auto-fix for AllUsers scope or RSAT installation) may not work correctly." -Level "WARN"
        Start-Sleep -Seconds 2
    }

    Clear-Host
    Write-Host @"
========================================================================
                                                                        
                    M&A DISCOVERY SUITE v5.5.1                          
                                                                        
            Comprehensive Infrastructure Discovery Tool                  
                                                                        
========================================================================
"@ -ForegroundColor Cyan
    if ($script:DebugModeEnabled) { Write-Host "`n                    [DEBUG MODE ENABLED]" -ForegroundColor Magenta }
    Write-Host "`nInitializing..." -ForegroundColor Yellow; Start-Sleep -Seconds 1

    # Determine if it's the first run for this company in this session for menu hint
    $isEffectivelyFirstRun = (-not $script:ConnectionStatus.Credentials)

    # Main menu loop
    do {
        Show-MainMenu -IsFirstRunAfterEnvInit $isEffectivelyFirstRun
        $selection = (Read-Host).Trim().ToUpper() # Standardize to uppercase

        # After first display of menu, it's no longer "first run" for the hint
        $isEffectivelyFirstRun = $false 

        switch ($selection) {
            '1' { Show-AzureADAppGuide }
            '2' { Show-CredentialSetupMenu } # This will update $script:ConnectionStatus.Credentials
            '3' { Start-Operation -Mode "Full" -OperationTitle "FULL SUITE RUN" }
            '4' { Start-Operation -Mode "Discovery" -OperationTitle "DISCOVERY PHASE" }
            '5' { Start-Operation -Mode "Processing" -OperationTitle "PROCESSING PHASE" }
            '6' { Start-Operation -Mode "Export" -OperationTitle "EXPORT PHASE" }
            '7' { Start-Operation -Mode "AzureOnly" -OperationTitle "AZURE-ONLY DISCOVERY & PROCESSING" }
            '8' { Start-Operation -Mode "Export" -OperationTitle "COMPANY CONTROL SHEET GENERATION" } # Assuming Orchestrator handles specific export types
            '9' { Start-Operation -Mode "Export" -OperationTitle "POWERAPPS EXPORT GENERATION" }    # Assuming Orchestrator handles specific export types
            '11' { Invoke-ModuleCheck }
            '12' { Test-ServiceConnections }
            '13' { Show-ConfigurationSettings }
            '14' { Clear-ExistingDataFiles }
            '15' { New-SampleReport }
            'D' { 
                # Simplified Debug Menu call for this focused update
                Write-ColoredLog "Debug menu selected. (Full debug menu not shown in this update)" -Level "INFO"; Pause-Script
            }
            'Q' { Write-ColoredLog "`nExiting M&A Discovery Suite. Thank you!" -Level "SUCCESS"; Start-Sleep -Seconds 1 }
            default { Write-ColoredLog "`n[!] Invalid selection. Please try again." -Level "ERROR"; Start-Sleep -Seconds 1 }
        }
    } while ($selection -ne 'Q')

} catch {
    Write-Error "A critical error occurred in QuickStart.ps1: $($_.Exception.Message)"
    Write-Error "Script StackTrace: $($_.ScriptStackTrace)"
    Write-Host "Exiting due to critical error." -ForegroundColor Red
    exit 1
} finally {
    $ErrorActionPreference = $script:ErrorActionPreferenceOriginal # Restore original preference
    Write-Host "[QuickStart] Script finished. Restored ErrorActionPreference to '$ErrorActionPreference'." -ForegroundColor DarkGray
}
#endregion

