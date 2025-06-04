#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Enhanced Quick Start Menu with Debug Features
.DESCRIPTION
    Provides a user-friendly interface to run the M&A Discovery Suite with improved
    credential management, status indicators, optimized module checking, and debug capabilities.
    This version fully implements all menu options, including Processing and Export phases.
.NOTES
    Version: 5.5.0
    Author: Enhanced Version with Complete Functionality
    Date: 2025-01-15
#>



[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$CompanyName,

    [Parameter(Mandatory=$false)]
    [string]$ConfigFile,

    [Parameter(Mandatory=$false)]
    [switch]$SkipModuleCheck,

    [Parameter(Mandatory=$false)]
    [switch]$DebugMode
)


if (-not $global:MandA) {
    Write-Host "Initializing global environment first..." -ForegroundColor Yellow
    . ".\Scripts\Set-SuiteEnvironment.ps1" -CompanyName $CompanyName
}


# Script-level variables
$script:LastModuleCheck = $null
$script:ModulesVerified = $false
$script:DebugModeEnabled = $DebugMode.IsPresent
$script:ConnectionStatus = @{
    Credentials = $false
    AzureAD = $false
    Exchange = $false
    SharePoint = $false
    Teams = $false
}

#region Unblock Suite Files

# Unblock all downloaded files to prevent execution policy issues
function Unblock-SuiteFiles {
    Write-Host "Checking file execution policies..." -ForegroundColor Yellow

    try {
        # Get suite root from PSScriptRoot
        $suiteRoot = $PSScriptRoot
        $scriptFiles = Get-ChildItem -Path $suiteRoot -Recurse -Include "*.ps1", "*.psm1", "*.psd1" -ErrorAction SilentlyContinue

        if ($scriptFiles) {
            $blockedFiles = $scriptFiles | Where-Object {
                try {
                    $stream = Get-Content -Path $_.FullName -Stream Zone.Identifier -ErrorAction SilentlyContinue
                    return $null -ne $stream
                } catch {
                    return $false
                }
            }

            if ($blockedFiles) {
                Write-Host "Found $($blockedFiles.Count) blocked files. Unblocking..." -ForegroundColor Yellow
                $blockedFiles | ForEach-Object {
                    try {
                        Unblock-File -Path $_.FullName -ErrorAction Stop
                        Write-Host "  [OK] Unblocked: $($_.Name)" -ForegroundColor Green
                    } catch {
                        Write-Host "  [!!] Failed to unblock: $($_.Name)" -ForegroundColor Red
                    }
                }
                Write-Host "File unblocking complete." -ForegroundColor Green
            } else {
                Write-Host "All files are already unblocked." -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "Warning: Could not check/unblock files: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "You may need to manually unblock files if you encounter execution errors." -ForegroundColor Yellow
    }

    Write-Host "" # Add blank line for spacing
}

#endregion

#region Helper Functions

function Write-ColoredLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [switch]$NoNewLine
    )

    $color = switch ($Level) {
        "SUCCESS" { "Green" }
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "INFO" { "White" }
        "DEBUG" { "Gray" }
        "HEADER" { "Cyan" }
        default { "White" }
    }

    $params = @{
        Object = $Message
        ForegroundColor = $color
        NoNewline = $NoNewLine
    }

    Write-Host @params
}

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Get-ExistingCompanies {
    $companies = @()
    
    # Use global path if available, otherwise use default
    $profilesBasePath = if ($global:MandA -and $global:MandA.Paths.ProfilesBasePath) {
        $global:MandA.Paths.ProfilesBasePath
    } else {
        "C:\MandADiscovery\Profiles"
    }
    
    if (Test-Path $profilesBasePath -PathType Container) {
        $companyDirs = Get-ChildItem -Path $profilesBasePath -Directory -ErrorAction SilentlyContinue
        foreach ($dir in $companyDirs) {
            $companies += $dir.Name
        }
    }
    
    return $companies | Sort-Object
}

function Initialize-Environment {
    # Check for existing companies
    $existingCompanies = Get-ExistingCompanies
    
    # Prompt for CompanyName if not provided
    if ([string]::IsNullOrWhiteSpace($CompanyName)) {
        Write-Host "`n=================================================================" -ForegroundColor Cyan
        
        if ($existingCompanies.Count -gt 0) {
            Write-Host "`n[i] EXISTING COMPANIES FOUND:" -ForegroundColor Yellow
            Write-Host "===========================" -ForegroundColor Yellow
            foreach ($company in $existingCompanies) {
                Write-Host "  * $company" -ForegroundColor Cyan
            }
            Write-Host "`nYou can enter one of the above or create a new company profile." -ForegroundColor Gray
        }
        
        Write-Host "`nPlease enter the Company Name for this session:" -ForegroundColor Yellow
        $script:CompanyName = (Read-Host).Trim()
        if ([string]::IsNullOrWhiteSpace($script:CompanyName)) {
            Write-Error "CompanyName cannot be empty. Exiting."
            exit 1
        }
        
        if ($existingCompanies -contains $script:CompanyName) {
            Write-Host "[OK] Using existing company profile: $($script:CompanyName)" -ForegroundColor Green
        } else {
            Write-Host "[OK] Creating new company profile: $($script:CompanyName)" -ForegroundColor Green
        }
        
        Write-Host "=================================================================" -ForegroundColor Cyan
    } else {
        $script:CompanyName = $CompanyName
    }

    $suiteRoot = $PSScriptRoot

    # Set up Set-SuiteEnvironment script path
    $envScriptPath = Join-Path $suiteRoot "Scripts\Set-SuiteEnvironment.ps1"
    
    if (Test-Path $envScriptPath -PathType Leaf) {
        Write-Host "Operating for Company: $($script:CompanyName)" -ForegroundColor Cyan
        Write-Host "Initializing suite environment..." -ForegroundColor Cyan

        try {
            . $envScriptPath -ProvidedSuiteRoot $suiteRoot -CompanyName $script:CompanyName
            Write-ColoredLog "Environment initialized successfully" -Level "SUCCESS"
            
            # Verify global context was created
            if ($null -eq $global:MandA) {
                throw "Global context was not created by Set-SuiteEnvironment.ps1"
            }
            
            # Update connection status for credentials
            if ($global:MandA.Paths.CredentialFile) {
                $script:ConnectionStatus.Credentials = Test-Path $global:MandA.Paths.CredentialFile
            }
            
        } catch {
            Write-ColoredLog "Failed to initialize environment: $($_.Exception.Message)" -Level "ERROR"
            exit 1
        }
    } else {
        Write-ColoredLog "CRITICAL: Set-SuiteEnvironment.ps1 not found at '$envScriptPath'." -Level "ERROR"
        exit 1
    }

    if ($null -ne $global:MandA.Paths.CompanyProfileRoot) {
        Write-ColoredLog "Company profile initialized at: $($global:MandA.Paths.CompanyProfileRoot)" -Level "INFO"
    }
}

function Update-ConnectionStatus {
    # Check credentials file
    if ($global:MandA.Paths.CredentialFile) {
        $script:ConnectionStatus.Credentials = Test-Path $global:MandA.Paths.CredentialFile
    }

    # Check Azure AD / Graph
    $script:ConnectionStatus.AzureAD = $null -ne (Get-MgContext -ErrorAction SilentlyContinue)

    # Check Exchange
    $script:ConnectionStatus.Exchange = $null -ne (Get-PSSession | Where-Object {
        $_.ConfigurationName -eq "Microsoft.Exchange" -and $_.State -eq "Opened"
    })

    # Check SharePoint
    $script:ConnectionStatus.SharePoint = $null -ne (Get-Command Get-SPOSite -ErrorAction SilentlyContinue)

    # Check Teams
    $script:ConnectionStatus.Teams = $null -ne (Get-Command Get-Team -ErrorAction SilentlyContinue)
}

function Test-ShouldCheckModules {
    param([string]$Operation)

    if ($SkipModuleCheck -or $script:DebugModeEnabled) { return $false }
    if (-not $script:ModulesVerified) { return $true }

    if ($script:LastModuleCheck) {
        if (((Get-Date) - $script:LastModuleCheck).TotalHours -gt 1) { return $true }
    }

    return $false
}

#endregion

#region Menu Display Functions

function Show-MainMenu {
    param(
        [switch]$FirstRun
    )

    Clear-Host
    Write-Host "========================================================================" -ForegroundColor Cyan
    Write-Host "           M&A DISCOVERY SUITE - MAIN MENU v5.5.0                      " -ForegroundColor Cyan
    Write-Host "                  Company: $($script:CompanyName)                      " -ForegroundColor Yellow
    if ($script:DebugModeEnabled) {
        Write-Host "                  [DEBUG MODE ENABLED]                                 " -ForegroundColor Magenta
    }
    Write-Host "========================================================================" -ForegroundColor Cyan

    Update-ConnectionStatus
    Show-ConnectionStatus

    Write-Host "`n  INITIAL SETUP (Run Once)" -ForegroundColor Yellow
    Write-Host "  ========================" -ForegroundColor Yellow
    Write-Host "  [1] Setup Azure AD App Registration (once only)"
    Write-Host "  [2] Configure Credentials for Authentication"

    Write-Host "`n  DISCOVERY OPERATIONS" -ForegroundColor Green
    Write-Host "  ====================" -ForegroundColor Green
    Write-Host "  [3] Run FULL Discovery Suite (Discovery + Processing + Export)"
    Write-Host "  [4] Run Discovery Phase Only"
    Write-Host "  [5] Run Processing Phase Only (requires existing discovery data)"
    Write-Host "  [6] Run Export Phase Only (requires processed data)"
    Write-Host "  [7] Run AZURE-ONLY Discovery (Cloud resources only)" -ForegroundColor Cyan

    Write-Host "`n  SPECIALIZED EXPORTS" -ForegroundColor Blue
    Write-Host "  ===================" -ForegroundColor Blue
    Write-Host "  [8] Generate Company Control Sheet (CSV/Excel format)"
    Write-Host "  [9] Generate PowerApps Export (JSON format)"

    Write-Host "`n  UTILITIES & MAINTENANCE" -ForegroundColor Magenta
    Write-Host "  =======================" -ForegroundColor Magenta
    Write-Host "  [10] Update/Replace Stored Credentials"
    Write-Host "  [11] Verify Module Dependencies"
    Write-Host "  [12] Test Service Connections"
    Write-Host "  [13] View Configuration Settings"
    Write-Host "  [14] Clear Existing Data Files"
    Write-Host "  [15] Generate Sample Report"

    Write-Host "`n  DEBUG & DEVELOPMENT" -ForegroundColor Red
    Write-Host "  ===================" -ForegroundColor Red
    Write-Host "  [D] Open Debug Menu [DEBUG]"

    Write-Host "`n  [Q] Quit" -ForegroundColor Red
    Write-Host "`n========================================================================" -ForegroundColor DarkGray

    if ($FirstRun -or -not $script:ConnectionStatus.Credentials) {
        Write-Host "`n  [*] FIRST TIME?" -ForegroundColor Yellow
        Write-Host "     Start with option [1] to setup your Azure AD App" -ForegroundColor Yellow
        Write-Host "     Then use option [2] to configure credentials" -ForegroundColor Yellow
    }

    Write-Host "`n  Enter your selection: " -ForegroundColor White -NoNewline
}

function Show-ConnectionStatus {
    Write-Host "`n  Status: " -NoNewline

    Write-Host "Credentials " -NoNewline
    if ($script:ConnectionStatus.Credentials) { 
        Write-Host "[OK]" -ForegroundColor Green -NoNewline 
    } else { 
        Write-Host "[X]" -ForegroundColor Red -NoNewline 
    }

    Write-Host " | Azure AD " -NoNewline
    if ($script:ConnectionStatus.AzureAD) { 
        Write-Host "[OK]" -ForegroundColor Green -NoNewline 
    } else { 
        Write-Host "[X]" -ForegroundColor Red -NoNewline 
    }

    Write-Host " | Exchange " -NoNewline
    if ($script:ConnectionStatus.Exchange) { 
        Write-Host "[OK]" -ForegroundColor Green -NoNewline 
    } else { 
        Write-Host "[X]" -ForegroundColor Red -NoNewline 
    }

    Write-Host " | SharePoint " -NoNewline
    if ($script:ConnectionStatus.SharePoint) { 
        Write-Host "[OK]" -ForegroundColor Green -NoNewline 
    } else { 
        Write-Host "[X]" -ForegroundColor Red -NoNewline 
    }

    Write-Host " | Teams " -NoNewline
    if ($script:ConnectionStatus.Teams) { 
        Write-Host "[OK]" -ForegroundColor Green 
    } else { 
        Write-Host "[X]" -ForegroundColor Red 
    }

    if ($script:LastModuleCheck) {
        Write-Host "  Last module check: $($script:LastModuleCheck.ToString('HH:mm:ss'))" -ForegroundColor Gray
    }
}

#endregion

#region Debug Menu Functions

function Show-DebugMenu {
    Clear-Host
    Write-Host "========================================================================" -ForegroundColor Red
    Write-Host "                    [DEBUG MENU]                                       " -ForegroundColor Red
    Write-Host "              Company: $($script:CompanyName)                          " -ForegroundColor Yellow
    Write-Host "========================================================================" -ForegroundColor Red

    Write-Host "`n  INDIVIDUAL MODULE DISCOVERY" -ForegroundColor Yellow
    Write-Host "  ===========================" -ForegroundColor Yellow
    Write-Host "  [1] Active Directory Discovery"
    Write-Host "  [2] Azure Discovery"
    Write-Host "  [3] Environment Detection Discovery"
    Write-Host "  [4] Exchange Online Discovery"
    Write-Host "  [5] External Identity Discovery"
    Write-Host "  [6] File Server Discovery"
    Write-Host "  [7] GPO Discovery"
    Write-Host "  [8] Graph Discovery"
    Write-Host "  [9] Intune Discovery"
    Write-Host "  [10] Licensing Discovery"
    Write-Host "  [11] SharePoint Discovery"
    Write-Host "  [12] Teams Discovery"
    Write-Host "  [13] Network Infrastructure Discovery (if available)"
    Write-Host "  [14] SQL Server Discovery (if available)"

    Write-Host "`n  SPECIALIZED EXPORTS (DEBUG)" -ForegroundColor Blue
    Write-Host "  ===========================" -ForegroundColor Blue
    Write-Host "  [15] Generate Company Control Sheet (Direct Module Call)"
    Write-Host "  [16] Generate PowerApps Export (Direct Module Call)"

    Write-Host "`n  DEBUG UTILITIES" -ForegroundColor Magenta
    Write-Host "  ===============" -ForegroundColor Magenta
    Write-Host "  [20] List All Discovery Modules"
    Write-Host "  [21] Check Module Load Status"
    Write-Host "  [22] View Current Configuration"
    Write-Host "  [23] Test Single Connection"
    Write-Host "  [24] Force Load All Modules"
    Write-Host "  [25] View Global Context ($global:MandA)"
    Write-Host "  [26] Run Module with Custom Config"
    Write-Host "  [27] Export Debug Information"

    Write-Host "`n  DEBUG OPTIONS" -ForegroundColor Cyan
    Write-Host "  =============" -ForegroundColor Cyan
    Write-Host "  [30] Toggle Verbose Logging"
    Write-Host "  [31] Toggle Error Action Preference"
    Write-Host "  [32] Clear Module Cache"
    Write-Host "  [33] Reset Global Context"

    Write-Host "`n  [B] Back to Main Menu" -ForegroundColor Green
    Write-Host "`n========================================================================" -ForegroundColor DarkGray
    Write-Host "`n[!] WARNING: Debug mode bypasses safety checks!" -ForegroundColor Yellow
    Write-Host "   Use with caution. Some modules may fail without proper setup." -ForegroundColor Yellow
    Write-Host "`n  Enter your selection: " -ForegroundColor White -NoNewline
}

function Get-DiscoveryModules {
    if ($null -eq $global:MandA -or $null -eq $global:MandA.Paths.Discovery) {
        Write-Warning "Global environment not initialized"
        return @()
    }
    
    $discoveryPath = $global:MandA.Paths.Discovery
    $modules = @()

    if (Test-Path $discoveryPath) {
        Get-ChildItem -Path $discoveryPath -Filter "*Discovery.psm1" -File | ForEach-Object {
            $modules += [PSCustomObject]@{
                Name = $_.BaseName -replace 'Discovery$'
                FileName = $_.Name
                FullPath = $_.FullName
                Loaded = $null -ne (Get-Module -Name $_.BaseName -ErrorAction SilentlyContinue)
            }
        }
    }
    return $modules | Sort-Object Name
}

function Invoke-DebugDiscoveryModule {
    param(
        [string]$ModuleName,
        [switch]$BypassChecks
    )

    Write-Host "`n=================================================================" -ForegroundColor Red
    Write-Host "                    DEBUG: $ModuleName Discovery                  " -ForegroundColor Red
    Write-Host "=================================================================" -ForegroundColor Red

    # Ensure environment is initialized
    if ($null -eq $global:MandA -or $null -eq $global:MandA.Paths) {
        Write-Host "[ERROR] Global environment not initialized!" -ForegroundColor Red
        Write-Host "Press any key to return..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        return
    }

    try {
        # Load logging module using global path
        $loggingModule = Join-Path $global:MandA.Paths.Utilities "EnhancedLogging.psm1"
        if (Test-Path $loggingModule -PathType Leaf) {
            Import-Module $loggingModule -Force -Global -ErrorAction Stop
            Write-Host "[OK] Loaded logging module" -ForegroundColor Green
            
            # Initialize logging if not already done
            if (-not $global:MandA.LoggingInitialized) {
                Initialize-Logging -Configuration $global:MandA.Config
                $global:MandA.LoggingInitialized = $true
            }
        }

        # Build module path using global paths
        $moduleFileName = "${ModuleName}Discovery.psm1"
        $modulePath = Join-Path $global:MandA.Paths.Discovery $moduleFileName

        if (-not (Test-Path $modulePath -PathType Leaf)) {
            Write-Host "[ERROR] Module not found: $modulePath" -ForegroundColor Red
            return
        }

        Write-Host "Loading module: $moduleFileName" -ForegroundColor Yellow
        Import-Module $modulePath -Force -Global -ErrorAction Stop
        Write-Host "[OK] Module loaded successfully" -ForegroundColor Green

        # Use the global config
        $config = $global:MandA.Config
        if ($null -eq $config) {
            Write-Host "[ERROR] No configuration loaded!" -ForegroundColor Red
            return
        }
        
        # Ensure output path is set to company profile
        $config.environment.outputPath = $global:MandA.Paths.CompanyProfileRoot
        
        # Ensure raw data directory exists
        $rawPath = $global:MandA.Paths.RawDataOutput
        if (-not (Test-Path $rawPath -PathType Container)) {
            New-Item -Path $rawPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
            Write-Host "[OK] Created output directory: $rawPath" -ForegroundColor Green
        }

        $functionName = "Invoke-${ModuleName}Discovery"
        if (Get-Command $functionName -ErrorAction SilentlyContinue) {
            Write-Host "`nInvoking $functionName..." -ForegroundColor Cyan
            Write-Host "=================================================================" -ForegroundColor DarkGray
            
            # Create minimal context for the discovery module
            $context = [PSCustomObject]@{
                Paths = $global:MandA.Paths
                Config = $config
                CompanyName = $global:MandA.CompanyName
                ErrorCollector = [PSCustomObject]@{
                    AddError = { param($s,$m,$e) Write-Host "[ERROR] $s : $m" -ForegroundColor Red }
                    AddWarning = { param($s,$m) Write-Host "[WARN] $s : $m" -ForegroundColor Yellow }
                }
            }
            
            $result = & $functionName -Configuration $config -Context $context -ErrorAction Stop
            
            Write-Host "=================================================================" -ForegroundColor DarkGray
            Write-Host "[OK] Discovery completed" -ForegroundColor Green

            if ($result) {
                Write-Host "`nResults summary:" -ForegroundColor Yellow
                if ($result -is [hashtable]) {
                    foreach ($key in $result.Keys) {
                        $value = $result[$key]
                        $count = if ($value -is [array]) { $value.Count } else { "N/A" }
                        Write-Host "  - $key : $count items" -ForegroundColor Cyan
                    }
                } else {
                    Write-Host "  Result type: $($result.GetType().Name)" -ForegroundColor Cyan
                }
            }
        } else {
            Write-Host "[ERROR] Function $functionName not found in module" -ForegroundColor Red
        }

    } catch {
        Write-Host "`n[ERROR] Error during debug discovery: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Stack trace:" -ForegroundColor Yellow
        Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    }

    Write-Host "`nPress any key to return to debug menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Show-ModuleLoadStatus {
    Clear-Host
    Write-Host "========================================================================" -ForegroundColor Cyan
    Write-Host "                    MODULE LOAD STATUS                                  " -ForegroundColor Cyan
    Write-Host "========================================================================" -ForegroundColor Cyan

    if ($null -eq $global:MandA) {
        Write-Host "`n[ERROR] Global environment not initialized!" -ForegroundColor Red
        Write-Host "`nPress any key to continue..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        return
    }

    $modules = Get-DiscoveryModules
    Write-Host "`nDiscovery Modules:" -ForegroundColor Yellow
    Write-Host "==================" -ForegroundColor Yellow
    foreach ($module in $modules) {
        $status = if ($module.Loaded) { "[OK] Loaded" } else { "[X] Not Loaded" }
        $color = if ($module.Loaded) { "Green" } else { "Red" }
        Write-Host ("  {0,-30} {1}" -f $module.Name, $status) -ForegroundColor $color
    }

    Write-Host "`nCore Modules:" -ForegroundColor Yellow
    Write-Host "=============" -ForegroundColor Yellow
    $coreModules = @("EnhancedLogging", "FileOperations", "ValidationHelpers", "ConfigurationValidation", "ErrorHandling", "Authentication", "CredentialManagement", "EnhancedConnectionManager")
    foreach ($moduleName in $coreModules) {
        $loaded = $null -ne (Get-Module -Name "*$moduleName*" -ErrorAction SilentlyContinue)
        $status = if ($loaded) { "[OK] Loaded" } else { "[X] Not Loaded" }
        $color = if ($loaded) { "Green" } else { "Red" }
        Write-Host ("  {0,-30} {1}" -f $moduleName, $status) -ForegroundColor $color
    }

    Write-Host "`nEnvironment Status:" -ForegroundColor Yellow
    Write-Host "==================" -ForegroundColor Yellow
    Write-Host "  Suite Root: $($global:MandA.Paths.SuiteRoot)" -ForegroundColor Gray
    Write-Host "  Company: $($global:MandA.CompanyName)" -ForegroundColor Gray
    Write-Host "  Profile Root: $($global:MandA.Paths.CompanyProfileRoot)" -ForegroundColor Gray
    Write-Host "  Logging: $(if($global:MandA.LoggingInitialized){'[OK] Initialized'}else{'[X] Not Initialized'})" -ForegroundColor $(if($global:MandA.LoggingInitialized){'Green'}else{'Red'})

    Write-Host "`nPress any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Show-GlobalContext {
    Clear-Host
    Write-Host "========================================================================" -ForegroundColor Cyan
    Write-Host "                    GLOBAL CONTEXT VIEWER                               " -ForegroundColor Cyan
    Write-Host "========================================================================" -ForegroundColor Cyan

    if ($null -eq $global:MandA) {
        Write-Host "`n[X] Global context not initialized!" -ForegroundColor Red
    } else {
        Write-Host "`n`$global:MandA Contents:" -ForegroundColor Yellow
        Write-Host "======================" -ForegroundColor Yellow
        
        # Show key information in readable format
        Write-Host "`nVersion: $($global:MandA.Version)" -ForegroundColor Cyan
        Write-Host "Company: $($global:MandA.CompanyName)" -ForegroundColor Cyan
        Write-Host "Determined By: $($global:MandA.DeterminedBy)" -ForegroundColor Cyan
        Write-Host "Logging Initialized: $($global:MandA.LoggingInitialized)" -ForegroundColor Cyan
        
        Write-Host "`nKey Paths:" -ForegroundColor Yellow
        $importantPaths = @(
            "SuiteRoot",
            "CompanyProfileRoot",
            "LogOutput",
            "RawDataOutput",
            "ProcessedDataOutput",
            "CredentialFile"
        )
        foreach ($pathKey in $importantPaths) {
            if ($global:MandA.Paths.ContainsKey($pathKey)) {
                Write-Host "  $pathKey : $($global:MandA.Paths[$pathKey])" -ForegroundColor Gray
            }
        }
        
        Write-Host "`nFull JSON representation:" -ForegroundColor Yellow
        $global:MandA | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Cyan
    }

    Write-Host "`nPress any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Start-LoadAllModules {
    Write-Host "`nForce loading all discovery modules..." -ForegroundColor Yellow
    $modules = Get-DiscoveryModules
    $successCount = 0
    $failCount = 0
    
    foreach ($module in $modules) {
        Write-Host "  Loading $($module.Name)... " -NoNewline
        try {
            Import-Module $module.FullPath -Force -Global -ErrorAction Stop
            Write-Host "[OK]" -ForegroundColor Green
            $successCount++
        } catch {
            Write-Host "[ERROR] - $($_.Exception.Message)" -ForegroundColor Red
            $failCount++
        }
    }
    
    Write-Host "`nSummary: $successCount loaded, $failCount failed" -ForegroundColor Cyan
    Write-Host "`nPress any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Start-ModuleWithCustomConfig {
    Clear-Host
    Write-Host "========================================================================" -ForegroundColor Cyan
    Write-Host "                RUN MODULE WITH CUSTOM CONFIG                           " -ForegroundColor Cyan
    Write-Host "========================================================================" -ForegroundColor Cyan

    # List available modules
    $modules = Get-DiscoveryModules
    Write-Host "`nAvailable Discovery Modules:" -ForegroundColor Yellow
    $i = 1
    foreach ($module in $modules) {
        Write-Host "  [$i] $($module.Name)" -ForegroundColor Cyan
        $i++
    }
    
    Write-Host "`nSelect module number: " -ForegroundColor White -NoNewline
    $moduleSelection = Read-Host
    
    try {
        $selectedIndex = [int]$moduleSelection - 1
        if ($selectedIndex -lt 0 -or $selectedIndex -ge $modules.Count) {
            Write-Host "Invalid selection" -ForegroundColor Red
            Start-Sleep -Seconds 2
            return
        }
        
        $selectedModule = $modules[$selectedIndex]
        
        # Ask for config file path
        Write-Host "`nEnter path to custom config JSON file (or press Enter for default): " -ForegroundColor Yellow -NoNewline
        $customConfigPath = Read-Host
        
        if ([string]::IsNullOrWhiteSpace($customConfigPath)) {
            $config = $global:MandA.Config
            Write-Host "Using current configuration" -ForegroundColor Gray
        } else {
            if (-not (Test-Path $customConfigPath -PathType Leaf)) {
                Write-Host "Config file not found: $customConfigPath" -ForegroundColor Red
                Start-Sleep -Seconds 2
                return
            }
            
            Write-Host "Loading custom configuration..." -ForegroundColor Yellow
            $configContent = Get-Content $customConfigPath -Raw | ConvertFrom-Json
            
            # Convert to hashtable
            $config = @{}
            foreach ($prop in $configContent.PSObject.Properties) {
                $config[$prop.Name] = $prop.Value
            }
        }
        
        # Load and run the module
        Import-Module $selectedModule.FullPath -Force -Global -ErrorAction Stop
        
        $functionName = "Invoke-$($selectedModule.Name)Discovery"
        if (Get-Command $functionName -ErrorAction SilentlyContinue) {
            Write-Host "`nRunning $functionName with custom config..." -ForegroundColor Cyan
            $result = & $functionName -Configuration $config -ErrorAction Stop
            
            Write-Host "`n[OK] Module completed successfully" -ForegroundColor Green
            
            if ($result) {
                Write-Host "`nResults:" -ForegroundColor Yellow
                $result | ConvertTo-Json -Depth 2 | Write-Host -ForegroundColor Cyan
            }
        }
        
    } catch {
        Write-Host "`n[ERROR]: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "`nPress any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Export-DebugInformation {
    Clear-Host
    Write-Host "========================================================================" -ForegroundColor Cyan
    Write-Host "                    EXPORT DEBUG INFORMATION                            " -ForegroundColor Cyan
    Write-Host "========================================================================" -ForegroundColor Cyan

    Write-Host "`n[i] Collecting debug information..." -ForegroundColor Yellow
    
    $debugPath = Join-Path $global:MandA.Paths.CompanyProfileRoot "Debug"
    if (-not (Test-Path $debugPath)) {
        New-Item -Path $debugPath -ItemType Directory -Force | Out-Null
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $debugFile = Join-Path $debugPath "DebugInfo_$timestamp.json"
    
    $debugInfo = @{
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Company = $script:CompanyName
        Environment = @{
            PSVersion = $PSVersionTable.PSVersion.ToString()
            OSVersion = [System.Environment]::OSVersion.ToString()
            Username = $env:USERNAME
            ComputerName = $env:COMPUTERNAME
            IsAdmin = Test-Administrator
        }
        GlobalContext = $global:MandA
        LoadedModules = @(Get-Module | Where-Object { $_.Path -like "*MandA*" } | Select-Object Name, Version, Path)
        ConnectionStatus = $script:ConnectionStatus
        Configuration = if ($global:MandA.Config) { $global:MandA.Config } else { @{} }
        Paths = @{
            CompanyProfileRoot = $global:MandA.Paths.CompanyProfileRoot
            RawData = $global:MandA.Paths.RawDataOutput
            ProcessedData = $global:MandA.Paths.ProcessedDataOutput
            Logs = $global:MandA.Paths.LogOutput
        }
        DataFiles = @{
            Raw = if (Test-Path $global:MandA.Paths.RawDataOutput) { 
                @(Get-ChildItem -Path $global:MandA.Paths.RawDataOutput -Filter "*.csv" | Select-Object Name, Length, LastWriteTime)
            } else { @() }
            Processed = if (Test-Path $global:MandA.Paths.ProcessedDataOutput) { 
                @(Get-ChildItem -Path $global:MandA.Paths.ProcessedDataOutput -Filter "*.csv" | Select-Object Name, Length, LastWriteTime)
            } else { @() }
        }
        ErrorLog = @($Error | Select-Object -First 10 | ForEach-Object { 
            @{
                Message = $_.Exception.Message
                Category = $_.CategoryInfo.Category
                Script = $_.InvocationInfo.ScriptName
                Line = $_.InvocationInfo.ScriptLineNumber
            }
        })
    }
    
    try {
        $debugInfo | ConvertTo-Json -Depth 10 | Set-Content -Path $debugFile -Encoding UTF8
        Write-Host "`n[OK] Debug information exported successfully!" -ForegroundColor Green
        Write-Host "   Location: $debugFile" -ForegroundColor Gray
        
        # Also create a simplified text report
        $textFile = Join-Path $debugPath "DebugInfo_$timestamp.txt"
        $textContent = @"
M&A Discovery Suite - Debug Information
=======================================
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Company: $($script:CompanyName)

ENVIRONMENT:
- PowerShell Version: $($PSVersionTable.PSVersion.ToString())
- OS: $([System.Environment]::OSVersion.ToString())
- User: $env:USERNAME@$env:COMPUTERNAME
- Running as Admin: $(Test-Administrator)

PATHS:
- Company Profile: $($global:MandA.Paths.CompanyProfileRoot)
- Raw Data: $($global:MandA.Paths.RawDataOutput)
- Processed Data: $($global:MandA.Paths.ProcessedDataOutput)
- Logs: $($global:MandA.Paths.LogOutput)

DATA FILES:
- Raw CSV Files: $(if (Test-Path $global:MandA.Paths.RawDataOutput) { @(Get-ChildItem -Path $global:MandA.Paths.RawDataOutput -Filter "*.csv").Count } else { 0 })
- Processed CSV Files: $(if (Test-Path $global:MandA.Paths.ProcessedDataOutput) { @(Get-ChildItem -Path $global:MandA.Paths.ProcessedDataOutput -Filter "*.csv").Count } else { 0 })

CONNECTION STATUS:
- Credentials: $($script:ConnectionStatus.Credentials)
- Azure AD: $($script:ConnectionStatus.AzureAD)
- Exchange: $($script:ConnectionStatus.Exchange)
- SharePoint: $($script:ConnectionStatus.SharePoint)
- Teams: $($script:ConnectionStatus.Teams)

RECENT ERRORS: $(if ($Error.Count -gt 0) { "`n" + ($Error | Select-Object -First 5 | ForEach-Object { "- $($_.Exception.Message)" }) -join "`n" } else { "None" })
"@
        
        $textContent | Set-Content -Path $textFile -Encoding UTF8
        Write-Host "   Text report: $textFile" -ForegroundColor Gray
        
    } catch {
        Write-Host "`n[ERROR] Failed to export debug information: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "`nPress any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Invoke-DebugCompanyControlSheet {
    Write-Host "`n=================================================================" -ForegroundColor Blue
    Write-Host "         DEBUG: Direct Company Control Sheet Generation           " -ForegroundColor Blue
    Write-Host "=================================================================" -ForegroundColor Blue

    try {
        # Load required modules
        $exportModule = Join-Path $global:MandA.Paths.Export "CompanyControlSheetExporter.psm1"
        if (-not (Test-Path $exportModule)) {
            Write-Host "[ERROR] CompanyControlSheetExporter.psm1 not found!" -ForegroundColor Red
            Start-Sleep -Seconds 2
            return
        }
        
        Import-Module $exportModule -Force -Global -ErrorAction Stop
        Write-Host "[OK] Loaded CompanyControlSheetExporter module" -ForegroundColor Green
        
        # Check for processed data
        $processedDataPath = $global:MandA.Paths.ProcessedDataOutput
        if (-not (Test-Path $processedDataPath)) {
            Write-Host "[ERROR] No processed data directory found!" -ForegroundColor Red
            Start-Sleep -Seconds 2
            return
        }
        
        # Load processed data
        Write-Host "`nLoading processed data..." -ForegroundColor Yellow
        $processedData = @{}
        
        $csvFiles = Get-ChildItem -Path $processedDataPath -Filter "*.csv" -File
        foreach ($file in $csvFiles) {
            $dataKey = $file.BaseName
            Write-Host "  Loading $($file.Name)..." -ForegroundColor Gray
            $processedData[$dataKey] = Import-Csv -Path $file.FullName
        }
        
        if ($processedData.Count -eq 0) {
            Write-Host "[ERROR] No processed data found to export!" -ForegroundColor Red
            Start-Sleep -Seconds 2
            return
        }
        
        Write-Host "`nLoaded $($processedData.Count) data sets" -ForegroundColor Green
        
        # Call the export function
        Write-Host "`nGenerating Company Control Sheet..." -ForegroundColor Cyan
        Export-ToCompanyControlSheet -ProcessedData $processedData -Configuration $global:MandA.Config
        
        Write-Host "`n[OK] Company Control Sheet generation completed!" -ForegroundColor Green
        Write-Host "   Check: $(Join-Path $global:MandA.Paths.CompanyProfileRoot 'CompanyControlSheetCSVs')" -ForegroundColor Gray
        
    } catch {
        Write-Host "`n[ERROR]: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Stack trace:" -ForegroundColor Yellow
        Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    }
    
    Write-Host "`nPress any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Invoke-DebugPowerAppsExport {
    Write-Host "`n=================================================================" -ForegroundColor Blue
    Write-Host "           DEBUG: Direct PowerApps Export Generation              " -ForegroundColor Blue
    Write-Host "=================================================================" -ForegroundColor Blue

    try {
        # Load required modules
        $exportModule = Join-Path $global:MandA.Paths.Export "PowerAppsExporter.psm1"
        if (-not (Test-Path $exportModule)) {
            Write-Host "[ERROR] PowerAppsExporter.psm1 not found!" -ForegroundColor Red
            Start-Sleep -Seconds 2
            return
        }
        
        Import-Module $exportModule -Force -Global -ErrorAction Stop
        Write-Host "[OK] Loaded PowerAppsExporter module" -ForegroundColor Green
        
        # Check for processed data
        $processedDataPath = $global:MandA.Paths.ProcessedDataOutput
        if (-not (Test-Path $processedDataPath)) {
            Write-Host "[ERROR] No processed data directory found!" -ForegroundColor Red
            Start-Sleep -Seconds 2
            return
        }
        
        # Load processed data
        Write-Host "`nLoading processed data..." -ForegroundColor Yellow
        $processedData = @{}
        
        $csvFiles = Get-ChildItem -Path $processedDataPath -Filter "*.csv" -File
        foreach ($file in $csvFiles) {
            $dataKey = $file.BaseName
            Write-Host "  Loading $($file.Name)..." -ForegroundColor Gray
            $processedData[$dataKey] = Import-Csv -Path $file.FullName
        }
        
        if ($processedData.Count -eq 0) {
            Write-Host "[ERROR] No processed data found to export!" -ForegroundColor Red
            Start-Sleep -Seconds 2
            return
        }
        
        Write-Host "`nLoaded $($processedData.Count) data sets" -ForegroundColor Green
        
        # Call the export function
        Write-Host "`nGenerating PowerApps Export..." -ForegroundColor Cyan
        Export-ForPowerApps -ProcessedData $processedData -Configuration $global:MandA.Config
        
        Write-Host "`n[OK] PowerApps export generation completed!" -ForegroundColor Green
        Write-Host "   Check: $(Join-Path $global:MandA.Paths.CompanyProfileRoot 'Processed\PowerApps')" -ForegroundColor Gray
        
    } catch {
        Write-Host "`n[ERROR]: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Stack trace:" -ForegroundColor Yellow
        Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    }
    
    Write-Host "`nPress any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

#endregion

#region Credential Management Functions

function Show-CredentialSetupMenu {
    Clear-Host
    Write-Host "========================================================================" -ForegroundColor Cyan
    Write-Host "              CONFIGURE AUTHENTICATION CREDENTIALS                      " -ForegroundColor Cyan
    Write-Host "========================================================================" -ForegroundColor Cyan
    
    Write-Host "`n[i] PREREQUISITES" -ForegroundColor Yellow
    Write-Host "================" -ForegroundColor Yellow
    Write-Host "You need the following from your Azure AD App Registration:"
    Write-Host "  * Tenant ID (Directory ID)"
    Write-Host "  * Client ID (Application ID)"
    Write-Host "  * Client Secret (from Certificates & secrets)"
    
    Write-Host "`n[!] IMPORTANT: If you haven't created an Azure AD App yet, please" -ForegroundColor Red
    Write-Host "   go back to the main menu and select option [1] first." -ForegroundColor Red
    
    Write-Host "`nDo you want to continue? (Y/N): " -ForegroundColor Yellow -NoNewline
    $continue = Read-Host
    
    if ($continue -ne 'Y' -and $continue -ne 'y') {
        return
    }
    
    Set-CredentialConfiguration
}

function Set-CredentialConfiguration {
    Write-Host "`n[i] ENTER YOUR CREDENTIALS" -ForegroundColor Yellow
    Write-Host "========================" -ForegroundColor Yellow
    
    # Get Tenant ID
    Write-Host "`nTenant ID: " -ForegroundColor Cyan -NoNewline
    $tenantId = Read-Host
    while ([string]::IsNullOrWhiteSpace($tenantId) -or $tenantId.Length -ne 36) {
        Write-Host "  [!] Tenant ID should be 36 characters (GUID format)" -ForegroundColor Red
        Write-Host "Tenant ID: " -ForegroundColor Cyan -NoNewline
        $tenantId = Read-Host
    }
    
    # Get Client ID
    Write-Host "Client ID: " -ForegroundColor Cyan -NoNewline
    $clientId = Read-Host
    while ([string]::IsNullOrWhiteSpace($clientId) -or $clientId.Length -ne 36) {
        Write-Host "  [!] Client ID should be 36 characters (GUID format)" -ForegroundColor Red
        Write-Host "Client ID: " -ForegroundColor Cyan -NoNewline
        $clientId = Read-Host
    }
    
    # Get Client Secret
    Write-Host "Client Secret: " -ForegroundColor Cyan -NoNewline
    $clientSecretPlain = Read-Host
    while ([string]::IsNullOrWhiteSpace($clientSecretPlain)) {
        Write-Host "  [!] Client Secret cannot be empty" -ForegroundColor Red
        Write-Host "Client Secret: " -ForegroundColor Cyan -NoNewline
        $clientSecretPlain = Read-Host
    }
    
    # Create credential object
    $credentialData = @{
        ClientId = $clientId
        ClientSecret = $clientSecretPlain
        TenantId = $tenantId
        CreatedDate = (Get-Date).ToString()
        CreatedBy = $env:USERNAME
    }
    
    Write-Host "`n[i] SAVING CREDENTIALS..." -ForegroundColor Yellow
    
    try {
        # Load the credential format handler
        $credFormatModule = Join-Path $global:MandA.Paths.Utilities "CredentialFormatHandler.psm1"
        if (Test-Path $credFormatModule) {
            Import-Module $credFormatModule -Force -ErrorAction Stop
            
            # Save credentials
            Save-CredentialFile -Path $global:MandA.Paths.CredentialFile -CredentialData $credentialData
            
            Write-Host "[OK] Credentials saved successfully!" -ForegroundColor Green
            Write-Host "   Location: $($global:MandA.Paths.CredentialFile)" -ForegroundColor Gray
            
            # Update status
            $script:ConnectionStatus.Credentials = $true
            
            # Test the credentials
            Write-Host "`n[i] Testing credentials..." -ForegroundColor Yellow
            Test-SavedCredentials
        } else {
            throw "Credential format handler module not found"
        }
    } catch {
        Write-Host "[ERROR] Failed to save credentials: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Test-SavedCredentials {
    try {
        # Try to read back the credentials
        $credFormatModule = Join-Path $global:MandA.Paths.Utilities "CredentialFormatHandler.psm1"
        Import-Module $credFormatModule -Force -ErrorAction Stop
        
        $savedCreds = Read-CredentialFile -Path $global:MandA.Paths.CredentialFile
        
        if ($savedCreds) {
            Write-Host "[OK] Credentials verified - can be read successfully" -ForegroundColor Green
            Write-Host "   Tenant ID: $($savedCreds.TenantId)" -ForegroundColor Gray
            Write-Host "   Client ID: $($savedCreds.ClientId)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "[!] Warning: Could not verify credentials: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

#endregion

#region Operation Functions

function Start-FullDiscovery {
    Write-ColoredLog "`n=================================================================" -Level "HEADER"
    Write-ColoredLog "                    STARTING FULL DISCOVERY SUITE                 " -Level "HEADER"
    Write-ColoredLog "=================================================================" -Level "HEADER"

    if (-not $script:ConnectionStatus.Credentials) {
        Write-ColoredLog "`n[!] No credentials configured. Please set up credentials first (Option 2)." -Level "ERROR"
        Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        return
    }

    try {
        $configPath = if ($ConfigFile) { $ConfigFile } else { $global:MandA.Paths.ConfigFile }
        & $global:MandA.Paths.Orchestrator -Mode "Full" -ConfigurationFile $configPath -CompanyName $script:CompanyName -ErrorAction Stop
        Write-ColoredLog "`n[OK] Full discovery suite completed successfully!" -Level "SUCCESS"
    } catch {
        Write-ColoredLog "`n[ERROR] Error during full run: $($_.Exception.Message)" -Level "ERROR"
        Write-ColoredLog "   ScriptStackTrace: $($_.ScriptStackTrace)" -Level "DEBUG"
    }

    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Start-DiscoveryOnly {
    Write-ColoredLog "`n=================================================================" -Level "HEADER"
    Write-ColoredLog "                    STARTING DISCOVERY PHASE ONLY                 " -Level "HEADER"
    Write-ColoredLog "=================================================================" -Level "HEADER"

    if (-not $script:ConnectionStatus.Credentials) {
        Write-ColoredLog "`n[!] No credentials configured. Please set up credentials first (Option 2)." -Level "ERROR"
        Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        return
    }

    try {
        $configPath = if ($ConfigFile) { $ConfigFile } else { $global:MandA.Paths.ConfigFile }
        & $global:MandA.Paths.Orchestrator -Mode "Discovery" -ConfigurationFile $configPath -CompanyName $script:CompanyName -ErrorAction Stop
        Write-ColoredLog "`n[OK] Discovery phase completed successfully!" -Level "SUCCESS"
    } catch {
        Write-ColoredLog "`n[ERROR] Error during discovery: $($_.Exception.Message)" -Level "ERROR"
        Write-ColoredLog "   ScriptStackTrace: $($_.ScriptStackTrace)" -Level "DEBUG"
    }

    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Start-ProcessingOnly {
    Write-ColoredLog "`n=================================================================" -Level "HEADER"
    Write-ColoredLog "                   STARTING PROCESSING PHASE ONLY                 " -Level "HEADER"
    Write-ColoredLog "=================================================================" -Level "HEADER"

    # Pre-condition Check
    $rawDataPath = $global:MandA.Paths.RawDataOutput
    if (-not (Test-Path $rawDataPath -PathType Container)) {
        Write-ColoredLog "`n[ERROR] Raw data directory not found: $rawDataPath" -Level "ERROR"
        Write-ColoredLog "   Please run Discovery phase first (e.g., Option 4)" -Level "ERROR"
        Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        return
    }

    $csvFiles = Get-ChildItem -Path $rawDataPath -Filter "*.csv" -File -ErrorAction SilentlyContinue
    if ($null -eq $csvFiles -or $csvFiles.Count -eq 0) {
        Write-ColoredLog "`n[ERROR] No CSV files found in raw data directory: $rawDataPath" -Level "ERROR"
        Write-ColoredLog "   Please run Discovery phase first (e.g., Option 4)" -Level "ERROR"
        Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        return
    }

    Write-ColoredLog "`n[OK] Found $($csvFiles.Count) raw data files. Proceeding with Processing phase." -Level "SUCCESS"
    
    try {
        $configPath = if ($ConfigFile) { $ConfigFile } else { $global:MandA.Paths.ConfigFile }
        & $global:MandA.Paths.Orchestrator -Mode "Processing" -ConfigurationFile $configPath -CompanyName $script:CompanyName -ErrorAction Stop
        Write-ColoredLog "`n[OK] Processing phase completed successfully!" -Level "SUCCESS"
    } catch {
        Write-ColoredLog "`n[ERROR] Error during processing: $($_.Exception.Message)" -Level "ERROR"
        Write-ColoredLog "   ScriptStackTrace: $($_.ScriptStackTrace)" -Level "DEBUG"
    }

    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Start-ExportOnly {
    Write-ColoredLog "`n=================================================================" -Level "HEADER"
    Write-ColoredLog "                     STARTING EXPORT PHASE ONLY                   " -Level "HEADER"
    Write-ColoredLog "=================================================================" -Level "HEADER"

    # Pre-condition Check
    $processedDataPath = $global:MandA.Paths.ProcessedDataOutput
    if (-not (Test-Path $processedDataPath -PathType Container)) {
        Write-ColoredLog "`n[ERROR] Processed data directory not found: $processedDataPath" -Level "ERROR"
        Write-ColoredLog "   Please run Processing phase first (e.g., Option 5)" -Level "ERROR"
        Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        return
    }

    $csvFiles = Get-ChildItem -Path $processedDataPath -Filter "*.csv" -File -ErrorAction SilentlyContinue
    if ($null -eq $csvFiles -or $csvFiles.Count -eq 0) {
        Write-ColoredLog "`n[ERROR] No CSV files found in processed data directory: $processedDataPath" -Level "ERROR"
        Write-ColoredLog "   Please run Processing phase first (e.g., Option 5)" -Level "ERROR"
        Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        return
    }

    Write-ColoredLog "`n[OK] Found $($csvFiles.Count) processed data files. Proceeding with Export phase." -Level "SUCCESS"
    
    try {
        $configPath = if ($ConfigFile) { $ConfigFile } else { $global:MandA.Paths.ConfigFile }
        & $global:MandA.Paths.Orchestrator -Mode "Export" -ConfigurationFile $configPath -CompanyName $script:CompanyName -ErrorAction Stop
        Write-ColoredLog "`n[OK] Export phase completed successfully!" -Level "SUCCESS"
    } catch {
        Write-ColoredLog "`n[ERROR] Error during export: $($_.Exception.Message)" -Level "ERROR"
        Write-ColoredLog "   ScriptStackTrace: $($_.ScriptStackTrace)" -Level "DEBUG"
    }

    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Start-AzureOnlyDiscovery {
    Write-ColoredLog "`n=================================================================" -Level "HEADER"
    Write-ColoredLog "                    STARTING AZURE-ONLY DISCOVERY                 " -Level "HEADER"
    Write-ColoredLog "=================================================================" -Level "HEADER"

    if (-not $script:ConnectionStatus.Credentials) {
        Write-ColoredLog "`n[!] No credentials configured. Please set up credentials first (Option 2)." -Level "ERROR"
        Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        return
    }

    Write-ColoredLog "Azure-Only mode will discover:" -Level "INFO"
    Write-ColoredLog "  [OK] Azure Resources" -Level "SUCCESS"
    Write-ColoredLog "  [OK] Microsoft Graph (Users, Groups, Apps)" -Level "SUCCESS"
    Write-ColoredLog "  [OK] Intune Devices and Policies" -Level "SUCCESS"
    Write-ColoredLog "  [OK] Exchange Online" -Level "SUCCESS"
    Write-ColoredLog "  [OK] SharePoint Online" -Level "SUCCESS"
    Write-ColoredLog "  [OK] Teams" -Level "SUCCESS"
    Write-ColoredLog "  [OK] Licensing" -Level "SUCCESS"
    Write-ColoredLog "  [X] On-premises Active Directory" -Level "WARN"
    Write-ColoredLog "  [X] File Servers" -Level "WARN"
    Write-ColoredLog "  [X] Group Policy (GPO)" -Level "WARN"

    try {
        # Check modules first if needed
        if (Test-ShouldCheckModules -Operation "AzureOnly") { 
            Invoke-ModuleCheck 
        }
        
        # Use the global paths
        $configPath = if ($ConfigFile) { $ConfigFile } else { $global:MandA.Paths.ConfigFile }
        
        # Call orchestrator with AzureOnly mode
        & $global:MandA.Paths.Orchestrator -Mode "AzureOnly" -ConfigurationFile $configPath -CompanyName $script:CompanyName -ErrorAction Stop
        
        Write-ColoredLog "`n[OK] Azure-Only discovery completed successfully!" -Level "SUCCESS"
    } catch {
        Write-ColoredLog "`n[ERROR] Error during Azure-Only discovery: $($_.Exception.Message)" -Level "ERROR"
        Write-ColoredLog "   ScriptStackTrace: $($_.ScriptStackTrace)" -Level "DEBUG"
    }

    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Start-CompanyControlSheetGeneration {
    Write-ColoredLog "`n=================================================================" -Level "HEADER"
    Write-ColoredLog "             GENERATING COMPANY CONTROL SHEET (CSV/EXCEL)         " -Level "HEADER"
    Write-ColoredLog "=================================================================" -Level "HEADER"

    # Check if processed data exists
    $processedDataPath = $global:MandA.Paths.ProcessedDataOutput
    if (-not (Test-Path $processedDataPath -PathType Container)) {
        Write-ColoredLog "`n[ERROR] No processed data directory found: $processedDataPath" -Level "ERROR"
        Write-ColoredLog "   Please run Discovery and Processing phases first." -Level "ERROR"
        Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        return
    }

    $csvFiles = Get-ChildItem -Path $processedDataPath -Filter "*.csv" -File -ErrorAction SilentlyContinue
    if ($null -eq $csvFiles -or $csvFiles.Count -eq 0) {
        Write-ColoredLog "`n[ERROR] No processed data files found." -Level "ERROR"
        Write-ColoredLog "   Please run Discovery and Processing phases first." -Level "ERROR"
        Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        return
    }

    Write-ColoredLog "`n[OK] Found $($csvFiles.Count) processed data files." -Level "SUCCESS"

    try {
        # Load the Company Control Sheet exporter module
        $exportModule = Join-Path $global:MandA.Paths.Export "CompanyControlSheetExporter.psm1"
        if (-not (Test-Path $exportModule)) {
            throw "CompanyControlSheetExporter.psm1 not found at: $exportModule"
        }
        
        Import-Module $exportModule -Force -Global -ErrorAction Stop
        Write-ColoredLog "[OK] Loaded Company Control Sheet Exporter module" -Level "SUCCESS"
        
        # Load processed data
        Write-ColoredLog "`nLoading processed data..." -Level "INFO"
        $processedData = @{}
        
        foreach ($file in $csvFiles) {
            $dataKey = $file.BaseName
            Write-Host "  Loading $($file.Name)..." -ForegroundColor Gray
            try {
                $processedData[$dataKey] = Import-Csv -Path $file.FullName -ErrorAction Stop
                Write-Host "    [OK] Loaded $($processedData[$dataKey].Count) records" -ForegroundColor Green
            } catch {
                Write-Host "    [ERROR] Failed to load: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        if ($processedData.Count -eq 0) {
            throw "Failed to load any processed data"
        }
        
        Write-ColoredLog "`n[i] Generating Company Control Sheet..." -Level "INFO"
        
        # Call the export function
        Export-ToCompanyControlSheet -ProcessedData $processedData -Configuration $global:MandA.Config
        
        $outputPath = Join-Path $global:MandA.Paths.CompanyProfileRoot "CompanyControlSheetCSVs"
        Write-ColoredLog "`n[OK] Company Control Sheet generated successfully!" -Level "SUCCESS"
        Write-ColoredLog "   Output location: $outputPath" -Level "INFO"
        
        # List the generated files
        if (Test-Path $outputPath) {
            $generatedFiles = Get-ChildItem -Path $outputPath -Filter "*.csv" -File
            if ($generatedFiles) {
                Write-Host "`nGenerated files:" -ForegroundColor Yellow
                foreach ($file in $generatedFiles) {
                    Write-Host "  * $($file.Name) ($('{0:N0}' -f $file.Length) bytes)" -ForegroundColor Cyan
                }
            }
        }
        
        # Offer to open the directory
        Write-Host "`nWould you like to open the output directory? (Y/N): " -ForegroundColor Yellow -NoNewline
        $openDir = Read-Host
        if ($openDir -eq 'Y' -or $openDir -eq 'y') {
            Start-Process explorer.exe -ArgumentList $outputPath
        }
        
    } catch {
        Write-ColoredLog "`n[ERROR] Error generating Company Control Sheet: $($_.Exception.Message)" -Level "ERROR"
        Write-ColoredLog "   Stack trace: $($_.ScriptStackTrace)" -Level "DEBUG"
    }
    
    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Start-PowerAppsExportGeneration {
    Write-ColoredLog "`n=================================================================" -Level "HEADER"
    Write-ColoredLog "                GENERATING POWERAPPS EXPORT (JSON)                " -Level "HEADER"
    Write-ColoredLog "=================================================================" -Level "HEADER"

    # Check if processed data exists
    $processedDataPath = $global:MandA.Paths.ProcessedDataOutput
    if (-not (Test-Path $processedDataPath -PathType Container)) {
        Write-ColoredLog "`n[ERROR] No processed data directory found: $processedDataPath" -Level "ERROR"
        Write-ColoredLog "   Please run Discovery and Processing phases first." -Level "ERROR"
        Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        return
    }

    $csvFiles = Get-ChildItem -Path $processedDataPath -Filter "*.csv" -File -ErrorAction SilentlyContinue
    if ($null -eq $csvFiles -or $csvFiles.Count -eq 0) {
        Write-ColoredLog "`n[ERROR] No processed data files found." -Level "ERROR"
        Write-ColoredLog "   Please run Discovery and Processing phases first." -Level "ERROR"
        Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        return
    }

    Write-ColoredLog "`n[OK] Found $($csvFiles.Count) processed data files." -Level "SUCCESS"

    try {
        # Load the PowerApps exporter module
        $exportModule = Join-Path $global:MandA.Paths.Export "PowerAppsExporter.psm1"
        if (-not (Test-Path $exportModule)) {
            throw "PowerAppsExporter.psm1 not found at: $exportModule"
        }
        
        Import-Module $exportModule -Force -Global -ErrorAction Stop
        Write-ColoredLog "[OK] Loaded PowerApps Exporter module" -Level "SUCCESS"
        
        # Load processed data
        Write-ColoredLog "`nLoading processed data..." -Level "INFO"
        $processedData = @{}
        
        foreach ($file in $csvFiles) {
            $dataKey = $file.BaseName
            Write-Host "  Loading $($file.Name)..." -ForegroundColor Gray
            try {
                $processedData[$dataKey] = Import-Csv -Path $file.FullName -ErrorAction Stop
                Write-Host "    [OK] Loaded $($processedData[$dataKey].Count) records" -ForegroundColor Green
            } catch {
                Write-Host "    [ERROR] Failed to load: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        if ($processedData.Count -eq 0) {
            throw "Failed to load any processed data"
        }
        
        Write-ColoredLog "`n[i] Generating PowerApps Export..." -Level "INFO"
        
        # Call the export function
        $result = Export-ForPowerApps -ProcessedData $processedData -Configuration $global:MandA.Config
        
        $outputPath = Join-Path $global:MandA.Paths.CompanyProfileRoot "Processed\PowerApps"
        
        if ($result) {
            Write-ColoredLog "`n[OK] PowerApps export generated successfully!" -Level "SUCCESS"
            Write-ColoredLog "   Output location: $outputPath" -Level "INFO"
            
            # List the generated files
            if (Test-Path $outputPath) {
                $generatedFiles = Get-ChildItem -Path $outputPath -Filter "*.json" -File
                if ($generatedFiles) {
                    Write-Host "`nGenerated JSON files:" -ForegroundColor Yellow
                    foreach ($file in $generatedFiles) {
                        Write-Host "  * $($file.Name) ($('{0:N0}' -f $file.Length) bytes)" -ForegroundColor Cyan
                    }
                }
            }
            
            # Show instructions
            Write-Host "`n[i] POWERAPPS INTEGRATION INSTRUCTIONS:" -ForegroundColor Yellow
            Write-Host "=====================================" -ForegroundColor Yellow
            Write-Host "1. Upload all JSON files to a data source accessible by PowerApps"
            Write-Host "   (e.g., SharePoint Document Library, Azure Blob Storage)"
            Write-Host "2. In PowerApps, use the ParseJSON() function to load the data"
            Write-Host "3. Start with 'powerapps_index.json' to verify all files are available"
            Write-Host "4. Load each JSON file into collections for app-wide access"
            Write-Host ""
            
            # Offer to open the directory
            Write-Host "Would you like to open the output directory? (Y/N): " -ForegroundColor Yellow -NoNewline
            $openDir = Read-Host
            if ($openDir -eq 'Y' -or $openDir -eq 'y') {
                Start-Process explorer.exe -ArgumentList $outputPath
            }
        } else {
            Write-ColoredLog "`n[ERROR] PowerApps export failed!" -Level "ERROR"
        }
        
    } catch {
        Write-ColoredLog "`n[ERROR] Error generating PowerApps export: $($_.Exception.Message)" -Level "ERROR"
        Write-ColoredLog "   Stack trace: $($_.ScriptStackTrace)" -Level "DEBUG"
    }
    
    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Show-AzureADAppGuide {
    Clear-Host
    Write-Host "========================================================================" -ForegroundColor Cyan
    Write-Host "              AZURE AD APP REGISTRATION SETUP GUIDE                     " -ForegroundColor Cyan
    Write-Host "========================================================================" -ForegroundColor Cyan
    
    Write-Host "`n[i] STEP-BY-STEP INSTRUCTIONS" -ForegroundColor Yellow
    Write-Host "============================" -ForegroundColor Yellow
    
    Write-Host "`n1. NAVIGATE TO AZURE PORTAL" -ForegroundColor Green
    Write-Host "   * Go to: https://portal.azure.com"
    Write-Host "   * Sign in with Global Administrator account"
    
    Write-Host "`n2. CREATE NEW APP REGISTRATION" -ForegroundColor Green
    Write-Host "   * Navigate to: Azure Active Directory -> App registrations"
    Write-Host "   * Click: '+ New registration'"
    Write-Host "   * Name: 'M&A Discovery Suite' (or similar)"
    Write-Host "   * Supported account types: 'Single tenant'"
    Write-Host "   * Redirect URI: Leave blank (not needed)"
    Write-Host "   * Click: 'Register'"
    
    Write-Host "`n3. CONFIGURE API PERMISSIONS" -ForegroundColor Green
    Write-Host "   * Go to: API permissions"
    Write-Host "   * Click: '+ Add a permission'"
    Write-Host "   * Select: 'Microsoft Graph'"
    Write-Host "   * Choose: 'Application permissions'"
    Write-Host "   * Add these permissions:" -ForegroundColor Yellow
    
    $permissions = @(
        "Directory.Read.All",
        "User.Read.All",
        "Group.Read.All",
        "GroupMember.Read.All",
        "Application.Read.All",
        "Device.Read.All",
        "Mail.Read",
        "AuditLog.Read.All",
        "Policy.Read.All",
        "RoleManagement.Read.All"
    )
    
    foreach ($perm in $permissions) {
        Write-Host "     [OK] $perm" -ForegroundColor Cyan
    }
    
    Write-Host "`n   * For Exchange Online, add:" -ForegroundColor Yellow
    Write-Host "     [OK] Exchange.ManageAsApp" -ForegroundColor Cyan
    
    Write-Host "`n   * Click: 'Add permissions'"
    Write-Host "   * Click: 'Grant admin consent for [tenant]'" -ForegroundColor Red
    Write-Host "   * Confirm the consent"
    
    Write-Host "`n4. CREATE CLIENT SECRET" -ForegroundColor Green
    Write-Host "   * Go to: Certificates & secrets"
    Write-Host "   * Click: '+ New client secret'"
    Write-Host "   * Description: 'M&A Discovery Suite Secret'"
    Write-Host "   * Expires: Choose appropriate duration"
    Write-Host "   * Click: 'Add'"
    Write-Host "   * COPY THE SECRET VALUE IMMEDIATELY!" -ForegroundColor Red
    Write-Host "     (You won't be able to see it again)"
    
    Write-Host "`n5. COLLECT REQUIRED INFORMATION" -ForegroundColor Green
    Write-Host "   From the Overview page, copy:"
    Write-Host "   * Application (client) ID"
    Write-Host "   * Directory (tenant) ID"
    Write-Host "   * Your client secret (from step 4)"
    
    Write-Host "`n[OK] READY!" -ForegroundColor Green
    Write-Host "   You now have everything needed for option [2]"
    
    Write-Host "`n[i] USEFUL LINKS" -ForegroundColor Yellow
    Write-Host "   Azure Portal: https://portal.azure.com"
    Write-Host "   Documentation: https://docs.microsoft.com/azure/active-directory/develop/"
    
    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Invoke-ModuleCheck {
    Write-ColoredLog "`nChecking PowerShell module dependencies..." -Level "INFO"
    
    if (Test-Path $global:MandA.Paths.ModuleCheckScript) {
        & $global:MandA.Paths.ModuleCheckScript -ErrorAction Stop
        $script:ModulesVerified = $true
        $script:LastModuleCheck = Get-Date
        $global:MandA.ModulesChecked = $true
    } else {
        Write-ColoredLog "Module check script not found: $($global:MandA.Paths.ModuleCheckScript)" -Level "ERROR"
    }
    
    Write-Host "`nPress any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Test-ServiceConnections {
    Clear-Host
    Write-Host "========================================================================" -ForegroundColor Cyan
    Write-Host "                    TEST SERVICE CONNECTIONS                            " -ForegroundColor Cyan
    Write-Host "========================================================================" -ForegroundColor Cyan
    
    Write-Host "`n[i] Testing connectivity to Microsoft services..." -ForegroundColor Yellow
    
    # Load connection manager
    try {
        $connMgrModule = Join-Path $global:MandA.Paths.Connectivity "EnhancedConnectionManager.psm1"
        Import-Module $connMgrModule -Force -ErrorAction Stop
        
        # Test each service
        $services = @(
            @{Name="Microsoft Graph"; Endpoint="graph.microsoft.com"; Port=443},
            @{Name="Azure AD"; Endpoint="login.microsoftonline.com"; Port=443},
            @{Name="Exchange Online"; Endpoint="outlook.office365.com"; Port=443},
            @{Name="SharePoint Online"; Endpoint="*.sharepoint.com"; Port=443},
            @{Name="Teams"; Endpoint="teams.microsoft.com"; Port=443}
        )
        
        foreach ($service in $services) {
            Write-Host "`nTesting $($service.Name)..." -NoNewline
            
            # For wildcard domains, test the base domain
            $testEndpoint = $service.Endpoint -replace '\*\.', ''
            
            try {
                $result = Test-NetConnection -ComputerName $testEndpoint -Port $service.Port -InformationLevel Quiet -WarningAction SilentlyContinue
                if ($result) {
                    Write-Host " [OK] Connected" -ForegroundColor Green
                } else {
                    Write-Host " [ERROR] Failed" -ForegroundColor Red
                }
            } catch {
                Write-Host " [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        # Test authentication if credentials exist
        if ($script:ConnectionStatus.Credentials) {
            Write-Host "`n[i] Testing authentication..." -ForegroundColor Yellow
            
            try {
                $authModule = Join-Path $global:MandA.Paths.Authentication "Authentication.psm1"
                Import-Module $authModule -Force -ErrorAction Stop
                
                $authResult = Initialize-MandAAuthentication -Configuration $global:MandA.Config
                if ($authResult -and $authResult.Authenticated) {
                    Write-Host "[OK] Authentication successful" -ForegroundColor Green
                } else {
                    Write-Host "[ERROR] Authentication failed" -ForegroundColor Red
                }
            } catch {
                Write-Host "[ERROR] Authentication error: $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "`n[!] No credentials configured. Skipping authentication test." -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "`n[ERROR] Error loading connection manager: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Show-ConfigurationSettings {
    Clear-Host
    Write-Host "========================================================================" -ForegroundColor Cyan
    Write-Host "                    CONFIGURATION SETTINGS                              " -ForegroundColor Cyan
    Write-Host "========================================================================" -ForegroundColor Cyan
    
    if ($null -eq $global:MandA.Config) {
        Write-Host "`n[ERROR] Configuration not loaded!" -ForegroundColor Red
    } else {
        Write-Host "`n[i] Current Configuration:" -ForegroundColor Yellow
        Write-Host "========================" -ForegroundColor Yellow
        
        # Metadata
        Write-Host "`nMETADATA:" -ForegroundColor Green
        Write-Host "  Version: $($global:MandA.Config.metadata.version)"
        Write-Host "  Company: $($global:MandA.Config.metadata.companyName)"
        Write-Host "  Project: $($global:MandA.Config.metadata.projectName)"
        
        # Environment
        Write-Host "`nENVIRONMENT:" -ForegroundColor Green
        Write-Host "  Output Path: $($global:MandA.Config.environment.outputPath)"
        Write-Host "  Log Level: $($global:MandA.Config.environment.logLevel)"
        Write-Host "  Max Retries: $($global:MandA.Config.environment.maxRetries)"
        
        # Discovery
        Write-Host "`nDISCOVERY:" -ForegroundColor Green
        Write-Host "  Enabled Sources: $($global:MandA.Config.discovery.enabledSources -join ', ')"
        Write-Host "  Skip Existing: $($global:MandA.Config.discovery.skipExistingFiles)"
        Write-Host "  Parallel Processing: $($global:MandA.Config.discovery.parallelProcessing)"
        Write-Host "  Max Concurrent Jobs: $($global:MandA.Config.discovery.maxConcurrentJobs)"
        
        # Export
        Write-Host "`nEXPORT:" -ForegroundColor Green
        Write-Host "  Formats: $($global:MandA.Config.export.formats -join ', ')"
        Write-Host "  Excel Enabled: $($global:MandA.Config.export.excelEnabled)"
        Write-Host "  PowerApps Optimized: $($global:MandA.Config.export.powerAppsOptimized)"
        
        # Paths
        Write-Host "`nPATHS:" -ForegroundColor Green
        Write-Host "  Company Profile Root: $($global:MandA.Paths.CompanyProfileRoot)"
        Write-Host "  Raw Data: $($global:MandA.Paths.RawDataOutput)"
        Write-Host "  Processed Data: $($global:MandA.Paths.ProcessedDataOutput)"
        Write-Host "  Logs: $($global:MandA.Paths.LogOutput)"
        
        Write-Host "`n[i] To modify settings, edit:" -ForegroundColor Yellow
        Write-Host "   $($global:MandA.Paths.ConfigFile)" -ForegroundColor Gray
    }
    
    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Clear-ExistingDataFiles {
    Clear-Host
    Write-Host "========================================================================" -ForegroundColor Cyan
    Write-Host "                    CLEAR EXISTING DATA FILES                           " -ForegroundColor Cyan
    Write-Host "========================================================================" -ForegroundColor Cyan
    
    Write-Host "`n[!] WARNING: This will delete all discovery data!" -ForegroundColor Red
    Write-Host "   Company: $($script:CompanyName)" -ForegroundColor Yellow
    
    # Show current data statistics
    $rawFiles = @()
    $processedFiles = @()
    $logFiles = @()
    
    if (Test-Path $global:MandA.Paths.RawDataOutput) {
        $rawFiles = Get-ChildItem -Path $global:MandA.Paths.RawDataOutput -Filter "*.csv" -File -ErrorAction SilentlyContinue
    }
    if (Test-Path $global:MandA.Paths.ProcessedDataOutput) {
        $processedFiles = Get-ChildItem -Path $global:MandA.Paths.ProcessedDataOutput -Filter "*.csv" -File -ErrorAction SilentlyContinue
    }
    if (Test-Path $global:MandA.Paths.LogOutput) {
        $logFiles = Get-ChildItem -Path $global:MandA.Paths.LogOutput -Filter "*.log" -File -ErrorAction SilentlyContinue
    }
    
    Write-Host "`n[i] Current Data:" -ForegroundColor Cyan
    Write-Host "  Raw Data Files: $($rawFiles.Count)"
    Write-Host "  Processed Data Files: $($processedFiles.Count)"
    Write-Host "  Log Files: $($logFiles.Count)"
    
    Write-Host "`nWhat would you like to clear?" -ForegroundColor Yellow
    Write-Host "  [1] Raw Data Only"
    Write-Host "  [2] Processed Data Only"
    Write-Host "  [3] Both Raw and Processed Data"
    Write-Host "  [4] Everything (Including Logs)"
    Write-Host "  [C] Cancel"
    
    Write-Host "`nSelection: " -ForegroundColor White -NoNewline
    $selection = Read-Host
    
    switch ($selection) {
        '1' {
            if ($rawFiles.Count -gt 0) {
                Write-Host "`nDeleting $($rawFiles.Count) raw data files..." -ForegroundColor Yellow
                $rawFiles | Remove-Item -Force
                Write-Host "[OK] Raw data cleared" -ForegroundColor Green
            } else {
                Write-Host "No raw data files to delete" -ForegroundColor Gray
            }
        }
        '2' {
            if ($processedFiles.Count -gt 0) {
                Write-Host "`nDeleting $($processedFiles.Count) processed data files..." -ForegroundColor Yellow
                $processedFiles | Remove-Item -Force
                Write-Host "[OK] Processed data cleared" -ForegroundColor Green
            } else {
                Write-Host "No processed data files to delete" -ForegroundColor Gray
            }
        }
        '3' {
            $totalFiles = $rawFiles.Count + $processedFiles.Count
            if ($totalFiles -gt 0) {
                Write-Host "`nDeleting $totalFiles data files..." -ForegroundColor Yellow
                $rawFiles | Remove-Item -Force -ErrorAction SilentlyContinue
                $processedFiles | Remove-Item -Force -ErrorAction SilentlyContinue
                Write-Host "[OK] All data cleared" -ForegroundColor Green
            } else {
                Write-Host "No data files to delete" -ForegroundColor Gray
            }
        }
        '4' {
            Write-Host "`n[!] Are you SURE? This will delete ALL data and logs! (Y/N): " -ForegroundColor Red -NoNewline
            $confirm = Read-Host
            if ($confirm -eq 'Y' -or $confirm -eq 'y') {
                $totalFiles = $rawFiles.Count + $processedFiles.Count + $logFiles.Count
                Write-Host "`nDeleting $totalFiles files..." -ForegroundColor Yellow
                $rawFiles | Remove-Item -Force -ErrorAction SilentlyContinue
                $processedFiles | Remove-Item -Force -ErrorAction SilentlyContinue
                $logFiles | Remove-Item -Force -ErrorAction SilentlyContinue
                Write-Host "[OK] All data and logs cleared" -ForegroundColor Green
            } else {
                Write-Host "Operation cancelled" -ForegroundColor Yellow
            }
        }
        {$_ -eq 'C' -or $_ -eq 'c'} {
            Write-Host "Operation cancelled" -ForegroundColor Yellow
        }
        default {
            Write-Host "Invalid selection" -ForegroundColor Red
        }
    }
    
    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function New-SampleReport {
    Clear-Host
    Write-Host "========================================================================" -ForegroundColor Cyan
    Write-Host "                    GENERATE SAMPLE REPORT                              " -ForegroundColor Cyan
    Write-Host "========================================================================" -ForegroundColor Cyan
    
    Write-Host "`n[i] Generating sample discovery report..." -ForegroundColor Yellow
    
    try {
        # Check if we have processed data
        $processedDataPath = $global:MandA.Paths.ProcessedDataOutput
        if (-not (Test-Path $processedDataPath)) {
            Write-Host "`n[ERROR] No processed data found. Please run Discovery and Processing first." -ForegroundColor Red
            Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            return
        }
        
        # Create report directory
        $reportPath = Join-Path $global:MandA.Paths.CompanyProfileRoot "Reports"
        if (-not (Test-Path $reportPath)) {
            New-Item -Path $reportPath -ItemType Directory -Force | Out-Null
        }
        
        # Generate HTML report
        $reportFile = Join-Path $reportPath "Discovery_Summary_$(Get-Date -Format 'yyyyMMdd_HHmmss').html"
        
        $html = @"
<!DOCTYPE html>
<html>
<head>
    <title>M&A Discovery Report - $($script:CompanyName)</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .header { background-color: #2c3e50; color: white; padding: 20px; border-radius: 5px; }
        .section { background-color: white; margin: 20px 0; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .metric-value { font-size: 24px; font-weight: bold; color: #3498db; }
        .metric-label { color: #7f8c8d; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #3498db; color: white; }
        .status-good { color: #27ae60; }
        .status-warning { color: #f39c12; }
        .status-error { color: #e74c3c; }
    </style>
</head>
<body>
    <div class="header">
        <h1>M&A Discovery Report</h1>
        <p>Company: $($script:CompanyName) | Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>
    </div>
"@
        
        # Load processed data
        $userData = @()
        $deviceData = @()
        
        $userFile = Join-Path $processedDataPath "Users.csv"
        $deviceFile = Join-Path $processedDataPath "Devices.csv"
        
        if (Test-Path $userFile) {
            $userData = Import-Csv $userFile
        }
        if (Test-Path $deviceFile) {
            $deviceData = Import-Csv $deviceFile
        }
        
        # Summary section
        $html += @"
    <div class="section">
        <h2>Executive Summary</h2>
        <div class="metric">
            <div class="metric-value">$($userData.Count)</div>
            <div class="metric-label">Total Users</div>
        </div>
        <div class="metric">
            <div class="metric-value">$($deviceData.Count)</div>
            <div class="metric-label">Total Devices</div>
        </div>
        <div class="metric">
            <div class="metric-value">$((Get-ChildItem -Path $processedDataPath -Filter "*.csv").Count)</div>
            <div class="metric-label">Data Sources</div>
        </div>
    </div>
"@
        
        # User statistics
        if ($userData.Count -gt 0) {
            $enabledUsers = @($userData | Where-Object { $_.Enabled -eq 'True' }).Count
            $disabledUsers = $userData.Count - $enabledUsers
            
            $html += @"
    <div class="section">
        <h2>User Statistics</h2>
        <table>
            <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Status</th>
            </tr>
            <tr>
                <td>Enabled Users</td>
                <td>$enabledUsers</td>
                <td class="status-good">[OK]</td>
            </tr>
            <tr>
                <td>Disabled Users</td>
                <td>$disabledUsers</td>
                <td class="status-warning">[!]</td>
            </tr>
            <tr>
                <td>Users with Mailboxes</td>
                <td>$(@($userData | Where-Object { $_.HasExchangeMailbox -eq 'True' }).Count)</td>
                <td class="status-good">[OK]</td>
            </tr>
        </table>
    </div>
"@
        }
        
        # Migration readiness
        $html += @"
    <div class="section">
        <h2>Migration Readiness</h2>
        <p>Based on the processed data, here's a high-level readiness assessment:</p>
        <ul>
            <li>[OK] Discovery completed successfully</li>
            <li>[OK] Data processing completed</li>
            <li>[!] Review user complexity scores before migration</li>
            <li>[!] Validate all service dependencies</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>Next Steps</h2>
        <ol>
            <li>Review detailed user and device reports</li>
            <li>Analyze migration complexity scores</li>
            <li>Plan migration waves based on dependencies</li>
            <li>Execute pilot migration for test users</li>
        </ol>
    </div>
</body>
</html>
"@
        
        # Save report
        $html | Out-File -FilePath $reportFile -Encoding UTF8
        
        Write-Host "`n[OK] Sample report generated successfully!" -ForegroundColor Green
        Write-Host "   Location: $reportFile" -ForegroundColor Gray
        
        # Offer to open the report
        Write-Host "`nWould you like to open the report now? (Y/N): " -ForegroundColor Yellow -NoNewline
        $openReport = Read-Host
        if ($openReport -eq 'Y' -or $openReport -eq 'y') {
            Start-Process $reportFile
        }
        
    } catch {
        Write-Host "`n[ERROR] Error generating report: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

#endregion

#region Main Program

# Unblock files first
Unblock-SuiteFiles

# Initialize environment
Initialize-Environment

# Check if running as administrator
if (-not (Test-Administrator)) {
    Write-ColoredLog "[!] WARNING: Not running as Administrator. Some features may not work correctly." -Level "WARN"
    Start-Sleep -Seconds 3
}

# Display welcome screen
Clear-Host
Write-Host @"
========================================================================
                                                                        
                    M&A DISCOVERY SUITE v5.5.0                          
                                                                        
            Comprehensive Infrastructure Discovery Tool                  
                                                                        
========================================================================
"@ -ForegroundColor Cyan

if ($script:DebugModeEnabled) {
    Write-Host "`n                    [DEBUG MODE ENABLED]" -ForegroundColor Magenta
}

Write-Host "`nInitializing..." -ForegroundColor Yellow
Start-Sleep -Seconds 1

# Main menu loop
$firstRun = -not (Test-Path $global:MandA.Paths.CredentialFile -PathType Leaf)

do {
    Show-MainMenu -FirstRun:$firstRun
    $selection = (Read-Host).Trim()

    switch ($selection) {
        '1' { Show-AzureADAppGuide }
        '2' { Show-CredentialSetupMenu; $firstRun = $false }
        '3' { 
            if (Test-ShouldCheckModules -Operation "Full") { Invoke-ModuleCheck }
            Start-FullDiscovery 
        }
        '4' { 
            if (Test-ShouldCheckModules -Operation "Discovery") { Invoke-ModuleCheck }
            Start-DiscoveryOnly 
        }
        '5' { Start-ProcessingOnly }
        '6' { Start-ExportOnly }
        '7' { Start-AzureOnlyDiscovery }
        '8' { Start-CompanyControlSheetGeneration }
        '9' { Start-PowerAppsExportGeneration }
        '10' { Show-CredentialSetupMenu }
        '11' { Invoke-ModuleCheck }
        '12' { Test-ServiceConnections }
        '13' { Show-ConfigurationSettings }
        '14' { Clear-ExistingDataFiles }
        '15' { New-SampleReport }
        {$_ -eq 'D' -or $_ -eq 'd'} {
            # Debug menu
            $inDebugMenu = $true
            do {
                Show-DebugMenu
                $debugSelection = (Read-Host).Trim()

                switch ($debugSelection) {
                    '1' { Invoke-DebugDiscoveryModule -ModuleName "ActiveDirectory" }
                    '2' { Invoke-DebugDiscoveryModule -ModuleName "Azure" }
                    '3' { Invoke-DebugDiscoveryModule -ModuleName "EnvironmentDetection" }
                    '4' { Invoke-DebugDiscoveryModule -ModuleName "Exchange" }
                    '5' { Invoke-DebugDiscoveryModule -ModuleName "ExternalIdentity" }
                    '6' { Invoke-DebugDiscoveryModule -ModuleName "FileServer" }
                    '7' { Invoke-DebugDiscoveryModule -ModuleName "GPO" }
                    '8' { Invoke-DebugDiscoveryModule -ModuleName "Graph" }
                    '9' { Invoke-DebugDiscoveryModule -ModuleName "Intune" }
                    '10' { Invoke-DebugDiscoveryModule -ModuleName "Licensing" }
                    '11' { Invoke-DebugDiscoveryModule -ModuleName "SharePoint" }
                    '12' { Invoke-DebugDiscoveryModule -ModuleName "Teams" }
                    '13' { Invoke-DebugDiscoveryModule -ModuleName "NetworkInfrastructure" }
                    '14' { Invoke-DebugDiscoveryModule -ModuleName "SQLServer" }
                    '15' { Invoke-DebugCompanyControlSheet }
                    '16' { Invoke-DebugPowerAppsExport }
                    '20' { 
                        Clear-Host
                        Write-Host "Available Discovery Modules:" -ForegroundColor Yellow
                        Get-DiscoveryModules | ForEach-Object { 
                            Write-Host "  $($_.Name)" -ForegroundColor Cyan 
                        }
                        Write-Host "`nPress any key..." -ForegroundColor Gray
                        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
                    }
                    '21' { Show-ModuleLoadStatus }
                    '22' { 
                        Clear-Host
                        Write-Host "Current Configuration:" -ForegroundColor Yellow
                        $global:MandA.Config | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Cyan
                        Write-Host "`nPress any key..." -ForegroundColor Gray
                        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
                    }
                    '23' { Test-ServiceConnections }
                    '24' { Start-LoadAllModules }
                    '25' { Show-GlobalContext }
                    '26' { Start-ModuleWithCustomConfig }
                    '27' { Export-DebugInformation }
                    '30' { 
                        if ($VerbosePreference -eq 'Continue') { 
                            $VerbosePreference = 'SilentlyContinue'
                            Write-Host "`nVerbose logging DISABLED" -ForegroundColor Yellow 
                        } else { 
                            $VerbosePreference = 'Continue'
                            Write-Host "`nVerbose logging ENABLED" -ForegroundColor Green 
                        }
                        Start-Sleep -Seconds 1 
                    }
                    '31' { 
                        if ($ErrorActionPreference -eq 'Stop') { 
                            $ErrorActionPreference = 'Continue'
                            Write-Host "`nError Action: Continue" -ForegroundColor Yellow 
                        } else { 
                            $ErrorActionPreference = 'Stop'
                            Write-Host "`nError Action: Stop" -ForegroundColor Red 
                        }
                        Start-Sleep -Seconds 1 
                    }
                    '32' { 
                        Write-Host "`nClearing module cache..." -ForegroundColor Yellow
                        Get-Module | Where-Object { $_.Path -like "*MandA*" } | Remove-Module -Force -ErrorAction SilentlyContinue
                        Write-Host "Module cache cleared" -ForegroundColor Green
                        Start-Sleep -Seconds 1 
                    }
                    '33' { 
                        Write-Host "`nResetting global context flags..." -ForegroundColor Yellow
                        $global:MandA.ModulesChecked = $false
                        $global:MandA.OrchestratorRunCount = 0
                        $script:ModulesVerified = $false
                        $script:LastModuleCheck = $null
                        Write-Host "Global context flags reset" -ForegroundColor Green
                        Start-Sleep -Seconds 1 
                    }
                    {$_ -eq 'B' -or $_ -eq 'b'} { $inDebugMenu = $false }
                    default {
                        Write-Host "`n[!] Invalid selection in debug menu. Please try again." -ForegroundColor Red
                        Start-Sleep -Seconds 1
                    }
                }
            } while ($inDebugMenu)
        }
        {$_ -eq 'Q' -or $_ -eq 'q'} {
            Write-Host "`nExiting M&A Discovery Suite..." -ForegroundColor Yellow
            Write-Host "Thank you for using the discovery tool!" -ForegroundColor Green
            Start-Sleep -Seconds 1
        }
        default {
            Write-Host "`n[!] Invalid selection. Please try again." -ForegroundColor Red
            Start-Sleep -Seconds 1
        }
    }
} while ($selection -ne 'Q' -and $selection -ne 'q')

#endregion
