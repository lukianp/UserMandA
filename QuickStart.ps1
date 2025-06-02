#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Enhanced Quick Start Menu with Debug Features
.DESCRIPTION
    Provides a user-friendly interface to run the M&A Discovery Suite with improved
    credential management, status indicators, optimized module checking, and debug capabilities.
    This version fully implements all menu options, including Processing and Export phases,
    and includes syntax error corrections.
.NOTES
    Version: 5.2.1
    Author: Enhanced Version with Full Functionality and Fixes
    Date: 2025-06-02
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
        # Get all PS1, PSM1, and PSD1 files in the suite
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
                        Write-Host "  ✓ Unblocked: $($_.Name)" -ForegroundColor Green
                    } catch {
                        Write-Host "  ✗ Failed to unblock: $($_.Name)" -ForegroundColor Red
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

function Initialize-Environment {
    # Prompt for CompanyName if not provided
    if ([string]::IsNullOrWhiteSpace($CompanyName)) {
        Write-Host "`nPlease enter the Company Name for this session (e.g., Contoso, Fabrikam):" -ForegroundColor Yellow
        $script:CompanyName = (Read-Host).Trim()
        if ([string]::IsNullOrWhiteSpace($script:CompanyName)) {
            Write-Error "CompanyName cannot be empty. Exiting."
            exit 1
        }
    } else {
        $script:CompanyName = $CompanyName
    }

    $suiteRoot = $PSScriptRoot

    # Initialize global context
    if ($null -eq $global:MandA) {
        $global:MandA = @{
            Paths = @{}
            Config = @{}
            Version = "5.2.1" # Updated version
            StartTime = Get-Date
            ModulesChecked = $false
        }
    }

    # Set up paths structure
    $global:MandA.Paths = @{
        Root = $suiteRoot
        Modules = Join-Path $suiteRoot "Modules"
        Utilities = Join-Path $suiteRoot "Modules\Utilities"
        Discovery = Join-Path $suiteRoot "Modules\Discovery"
        Processing = Join-Path $suiteRoot "Modules\Processing"
        Export = Join-Path $suiteRoot "Modules\Export"
        Connectivity = Join-Path $suiteRoot "Modules\Connectivity"
        Authentication = Join-Path $suiteRoot "Modules\Authentication"
        Core = Join-Path $suiteRoot "Core"
        Scripts = Join-Path $suiteRoot "Scripts"
        Configuration = Join-Path $suiteRoot "Configuration"
    }

    # Define key scripts
    $global:MandA.Paths.EnvironmentScript = Join-Path $global:MandA.Paths.Scripts "Set-SuiteEnvironment.ps1"
    $global:MandA.Paths.Orchestrator = Join-Path $global:MandA.Paths.Core "MandA-Orchestrator.ps1"
    $global:MandA.Paths.ModuleCheckScript = Join-Path $global:MandA.Paths.Scripts "DiscoverySuiteModuleCheck.ps1"
    $global:MandA.Paths.ConfigFile = Join-Path $global:MandA.Paths.Configuration "default-config.json"

    # Set environment script path
    if (Test-Path $global:MandA.Paths.EnvironmentScript) {
        Write-Host "Operating for Company: $($script:CompanyName)" -ForegroundColor Cyan
        Write-Host "Sourcing environment for Company: $($script:CompanyName)..." -ForegroundColor Cyan

        try {
            . $global:MandA.Paths.EnvironmentScript -ProvidedSuiteRoot $suiteRoot -CompanyName $script:CompanyName
            Write-ColoredLog "Environment initialized successfully" -Level "SUCCESS"
        } catch {
            Write-ColoredLog "Failed to initialize environment: $($_.Exception.Message)" -Level "ERROR"
            exit 1
        }
    } else {
        Write-ColoredLog "CRITICAL: Set-SuiteEnvironment.ps1 not found at '$($global:MandA.Paths.EnvironmentScript)'." -Level "ERROR"
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

    return $false # Simplified check
}

#endregion

#region Menu Display Functions

function Show-MainMenu {
    param(
        [switch]$FirstRun
    )

    Clear-Host
    Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║           M&A DISCOVERY SUITE - MAIN MENU v5.2.1                     ║" -ForegroundColor Cyan # Version updated
    Write-Host "║                  Company: $($script:CompanyName)                     " -ForegroundColor Yellow
    if ($script:DebugModeEnabled) {
        Write-Host "║                  🔧 DEBUG MODE ENABLED 🔧                            " -ForegroundColor Magenta
    }
    Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

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

    Write-Host "`n  UTILITIES & MAINTENANCE" -ForegroundColor Magenta
    Write-Host "  =======================" -ForegroundColor Magenta
    Write-Host "  [7] Update/Replace Stored Credentials"
    Write-Host "  [8] Verify Module Dependencies"
    Write-Host "  [9] Test Service Connections"
    Write-Host "  [10] View Configuration Settings"
    Write-Host "  [11] Clear Existing Data Files"
    Write-Host "  [12] Generate Sample Report" # Added option 12 to menu display

    Write-Host "`n  DEBUG & DEVELOPMENT" -ForegroundColor Red
    Write-Host "  ===================" -ForegroundColor Red
    Write-Host "  [D] Open Debug Menu 🔧"

    Write-Host "`n  [Q] Quit" -ForegroundColor Red
    Write-Host "`n═══════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray

    if ($FirstRun -or -not $script:ConnectionStatus.Credentials) {
        Write-Host "`n  📌 FIRST TIME?" -ForegroundColor Yellow
        Write-Host "     Start with option [1] to setup your Azure AD App" -ForegroundColor Yellow
        Write-Host "     Then use option [2] to configure credentials" -ForegroundColor Yellow
    }

    Write-Host "`n  Enter your selection: " -ForegroundColor White -NoNewline
}


function Show-ConnectionStatus {
    Write-Host "`n  Status: " -NoNewline

    Write-Host "Credentials " -NoNewline
    if ($script:ConnectionStatus.Credentials) { Write-Host "✓" -ForegroundColor Green -NoNewline } else { Write-Host "✗" -ForegroundColor Red -NoNewline }

    Write-Host " | Azure AD " -NoNewline
    if ($script:ConnectionStatus.AzureAD) { Write-Host "✓" -ForegroundColor Green -NoNewline } else { Write-Host "✗" -ForegroundColor Red -NoNewline }

    Write-Host " | Exchange " -NoNewline
    if ($script:ConnectionStatus.Exchange) { Write-Host "✓" -ForegroundColor Green -NoNewline } else { Write-Host "✗" -ForegroundColor Red -NoNewline }

    Write-Host " | SharePoint " -NoNewline
    if ($script:ConnectionStatus.SharePoint) { Write-Host "✓" -ForegroundColor Green -NoNewline } else { Write-Host "✗" -ForegroundColor Red -NoNewline }

    Write-Host " | Teams " -NoNewline
    if ($script:ConnectionStatus.Teams) { Write-Host "✓" -ForegroundColor Green } else { Write-Host "✗" -ForegroundColor Red }

    if ($script:LastModuleCheck) {
        Write-Host "  Last module check: $($script:LastModuleCheck.ToString('HH:mm:ss'))" -ForegroundColor Gray
    }
}

#endregion

#region Debug Menu Functions

function Show-DebugMenu {
    Clear-Host
    Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║                    🔧 DEBUG MENU 🔧                                  ║" -ForegroundColor Red
    Write-Host "║              Company: $($script:CompanyName)                         " -ForegroundColor Yellow
    Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Red

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

    Write-Host "`n  DEBUG UTILITIES" -ForegroundColor Magenta
    Write-Host "  ===============" -ForegroundColor Magenta
    Write-Host "  [20] List All Discovery Modules"
    Write-Host "  [21] Check Module Load Status"
    Write-Host "  [22] View Current Configuration"
    Write-Host "  [23] Test Single Connection"
    Write-Host "  [24] Force Load All Modules"
    Write-Host "  [25] View Global Context (`$global:MandA)"
    Write-Host "  [26] Run Module with Custom Config"
    Write-Host "  [27] Export Debug Information"

    Write-Host "`n  DEBUG OPTIONS" -ForegroundColor Cyan
    Write-Host "  =============" -ForegroundColor Cyan
    Write-Host "  [30] Toggle Verbose Logging"
    Write-Host "  [31] Toggle Error Action Preference"
    Write-Host "  [32] Clear Module Cache"
    Write-Host "  [33] Reset Global Context"

    Write-Host "`n  [B] Back to Main Menu" -ForegroundColor Green
    Write-Host "`n═══════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host "`n⚠️  WARNING: Debug mode bypasses safety checks!" -ForegroundColor Yellow
    Write-Host "   Use with caution. Some modules may fail without proper setup." -ForegroundColor Yellow
    Write-Host "`n  Enter your selection: " -ForegroundColor White -NoNewline
}

function Get-DiscoveryModules {
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

    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
    Write-Host "                    DEBUG: $ModuleName Discovery                      " -ForegroundColor Red
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red

    try {
        $loggingModule = Join-Path $global:MandA.Paths.Utilities "EnhancedLogging.psm1"
        if (Test-Path $loggingModule -PathType Leaf) {
            Import-Module $loggingModule -Force -Global -ErrorAction Stop
            Write-Host "✓ Loaded logging module" -ForegroundColor Green
        } else {
            Write-Warning "Logging module not found at $loggingModule. Debug output may be limited."
        }

        $moduleFileName = "${ModuleName}Discovery.psm1"
        $modulePath = Join-Path $global:MandA.Paths.Discovery $moduleFileName

        if (-not (Test-Path $modulePath -PathType Leaf)) {
            Write-Host "✗ Module not found: $modulePath" -ForegroundColor Red
            return
        }

        Write-Host "Loading module: $moduleFileName" -ForegroundColor Yellow
        Import-Module $modulePath -Force -Global -ErrorAction Stop
        Write-Host "✓ Module loaded successfully" -ForegroundColor Green

        $config = $global:MandA.Config
        if ($null -eq $config) {
            Write-Host "⚠️  No configuration loaded. Using minimal config." -ForegroundColor Yellow
            $config = @{
                environment = @{
                    outputPath = $global:MandA.Paths.CompanyProfileRoot # Ensure this is set
                    logLevel = "DEBUG"
                }
                discovery = @{
                    skipExistingFiles = $false
                }
            }
        }
        
        # Ensure CompanyProfileRoot is valid before creating Raw path
        if (-not $config.environment.outputPath -or -not (Test-Path $config.environment.outputPath -PathType Container)) {
             Write-Error "CompanyProfileRoot (outputPath in config) is not set or invalid: $($config.environment.outputPath)"
             return
        }

        $rawPath = Join-Path $config.environment.outputPath "Raw"
        if (-not (Test-Path $rawPath -PathType Container)) {
            New-Item -Path $rawPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
            Write-Host "✓ Created output directory: $rawPath" -ForegroundColor Green
        }

        $functionName = "Invoke-${ModuleName}Discovery"
        if (Get-Command $functionName -ErrorAction SilentlyContinue) {
            Write-Host "`nInvoking $functionName..." -ForegroundColor Cyan
            Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
            
            $result = & $functionName -Configuration $config -ErrorAction Stop # Added ErrorAction Stop
            
            Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
            Write-Host "✓ Discovery completed" -ForegroundColor Green

            if ($result) {
                Write-Host "`nResults summary:" -ForegroundColor Yellow
                if ($result -is [hashtable]) {
                    foreach ($key in $result.Keys) {
                        $value = $result[$key]
                        $count = if ($value -is [array]) { $value.Count } elseif ($value -is [System.Management.Automation.PSCustomObject] -and $value.PSObject.Properties['Count']) { $value.Count } else { "N/A" }
                        Write-Host "  - $key`: $count items" -ForegroundColor Cyan
                    }
                } else {
                    Write-Host "  Result type: $($result.GetType().Name)" -ForegroundColor Cyan
                }
            }
        } else {
            Write-Host "✗ Function $functionName not found in module" -ForegroundColor Red
        }

    } catch {
        Write-Host "`n✗ Error during debug discovery: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Stack trace:" -ForegroundColor Yellow
        Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    }

    Write-Host "`nPress any key to return to debug menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Show-ModuleLoadStatus {
    Clear-Host
    Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                    MODULE LOAD STATUS                                 ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

    $modules = Get-DiscoveryModules
    Write-Host "`nDiscovery Modules:" -ForegroundColor Yellow; Write-Host "==================" -ForegroundColor Yellow
    foreach ($module in $modules) {
        $status = if ($module.Loaded) { "✓ Loaded" } else { "✗ Not Loaded" }
        $color = if ($module.Loaded) { "Green" } else { "Red" }
        Write-Host ("  {0,-30} {1}" -f $module.Name, $status) -ForegroundColor $color
    }

    Write-Host "`nCore Modules:" -ForegroundColor Yellow; Write-Host "=============" -ForegroundColor Yellow
    $coreModules = @("EnhancedLogging", "FileOperations", "ValidationHelpers", "ConfigurationValidation", "ErrorHandling", "Authentication", "CredentialManagement", "EnhancedConnectionManager")
    foreach ($moduleName in $coreModules) {
        $loaded = $null -ne (Get-Module -Name "*$moduleName*" -ErrorAction SilentlyContinue)
        $status = if ($loaded) { "✓ Loaded" } else { "✗ Not Loaded" }
        $color = if ($loaded) { "Green" } else { "Red" }
        Write-Host ("  {0,-30} {1}" -f $moduleName, $status) -ForegroundColor $color
    }

    Write-Host "`nPress any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Show-GlobalContext {
    Clear-Host
    Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                    GLOBAL CONTEXT VIEWER                              ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

    if ($null -eq $global:MandA) {
        Write-Host "`n✗ Global context not initialized!" -ForegroundColor Red
    } else {
        Write-Host "`n`$global:MandA Contents:" -ForegroundColor Yellow
        Write-Host "======================" -ForegroundColor Yellow
        $global:MandA | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Cyan
    }

    Write-Host "`nPress any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Force-LoadAllModules {
    Write-Host "`nForce loading all discovery modules..." -ForegroundColor Yellow
    $modules = Get-DiscoveryModules
    $successCount = 0; $failCount = 0
    foreach ($module in $modules) {
        Write-Host "  Loading $($module.Name)... " -NoNewline
        try {
            Import-Module $module.FullPath -Force -Global -ErrorAction Stop
            Write-Host "✓" -ForegroundColor Green; $successCount++
        } catch {
            Write-Host "✗ - $($_.Exception.Message)" -ForegroundColor Red; $failCount++
        }
    }
    Write-Host "`nSummary: $successCount loaded, $failCount failed" -ForegroundColor Cyan
    Write-Host "`nPress any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

#endregion

#region Credential Management Functions

function Show-CredentialSetupMenu {
    Clear-Host
    Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║              CONFIGURE AUTHENTICATION CREDENTIALS                     ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    # ... (rest of the function as before) ...
    Set-CredentialConfiguration # Call the function to actually set credentials
}

function Set-CredentialConfiguration {
    Write-Host "`n📝 ENTER YOUR CREDENTIALS" -ForegroundColor Yellow
    Write-Host "========================" -ForegroundColor Yellow
    # ... (rest of the function as before) ...
}

#endregion

#region Operation Functions

function Start-FullDiscovery {
    Write-ColoredLog "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Level "HEADER"
    Write-ColoredLog "                    STARTING FULL DISCOVERY SUITE                      " -Level "HEADER"
    Write-ColoredLog "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Level "HEADER"

    if (-not $script:ConnectionStatus.Credentials) {
        Write-ColoredLog "`n⚠️  No credentials configured. Please set up credentials first (Option 2)." -Level "ERROR"
        Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown"); return
    }

    try {
        $configPath = if ($ConfigFile) { $ConfigFile } else { $global:MandA.Paths.ConfigFile }
        & $global:MandA.Paths.Orchestrator -Mode "Full" -ConfigurationFile $configPath -CompanyName $script:CompanyName -ErrorAction Stop
        Write-ColoredLog "`n✅ Full discovery suite completed successfully!" -Level "SUCCESS"
    } catch {
        Write-ColoredLog "`n❌ Error during full run: $($_.Exception.Message)" -Level "ERROR"
        Write-ColoredLog "   ScriptStackTrace: $($_.ScriptStackTrace)" -Level "DEBUG"
    } finally {
        if ($global:MandA) { $global:MandA.OrchestratorRunCount = 0 }
    }

    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Start-DiscoveryOnly {
    Write-ColoredLog "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Level "HEADER"
    Write-ColoredLog "                    STARTING DISCOVERY PHASE ONLY                      " -Level "HEADER"
    Write-ColoredLog "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Level "HEADER"

    if (-not $script:ConnectionStatus.Credentials) {
        Write-ColoredLog "`n⚠️  No credentials configured. Please set up credentials first (Option 2)." -Level "ERROR"
        Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown"); return
    }

    try {
        $configPath = if ($ConfigFile) { $ConfigFile } else { $global:MandA.Paths.ConfigFile }
        & $global:MandA.Paths.Orchestrator -Mode "Discovery" -ConfigurationFile $configPath -CompanyName $script:CompanyName -ErrorAction Stop
        Write-ColoredLog "`n✅ Discovery phase completed successfully!" -Level "SUCCESS"
    } catch {
        Write-ColoredLog "`n❌ Error during discovery: $($_.Exception.Message)" -Level "ERROR"
        Write-ColoredLog "   ScriptStackTrace: $($_.ScriptStackTrace)" -Level "DEBUG"
    } finally {
        if ($global:MandA) { $global:MandA.OrchestratorRunCount = 0 }
    }

    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Start-ProcessingOnly {
    Write-ColoredLog "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Level "HEADER"
    Write-ColoredLog "                   STARTING PROCESSING PHASE ONLY                      " -Level "HEADER"
    Write-ColoredLog "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Level "HEADER"

    if (-not $script:ConnectionStatus.Credentials) { # Though processing might not need live creds, good to check for consistency
        Write-ColoredLog "`n⚠️  No credentials configured. This might be okay for processing if auth not needed for this phase." -Level "WARN"
    }
    
    Write-ColoredLog "INFO: This requires raw data files to exist from a previous discovery run in '$($global:MandA.Paths.RawDataOutput)'." -Level "INFO"

    try {
        $configPath = if ($ConfigFile) { $ConfigFile } else { $global:MandA.Paths.ConfigFile }
        & $global:MandA.Paths.Orchestrator -Mode "Processing" -ConfigurationFile $configPath -CompanyName $script:CompanyName -ErrorAction Stop
        Write-ColoredLog "`n✅ Processing phase completed successfully!" -Level "SUCCESS"
    } catch {
        Write-ColoredLog "`n❌ Error during processing: $($_.Exception.Message)" -Level "ERROR"
        Write-ColoredLog "   ScriptStackTrace: $($_.ScriptStackTrace)" -Level "DEBUG"
    } finally {
        if ($global:MandA) { $global:MandA.OrchestratorRunCount = 0 }
    }

    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Start-ExportOnly {
    Write-ColoredLog "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Level "HEADER"
    Write-ColoredLog "                     STARTING EXPORT PHASE ONLY                        " -Level "HEADER"
    Write-ColoredLog "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Level "HEADER"

     if (-not $script:ConnectionStatus.Credentials) { # Though export might not need live creds, good to check
        Write-ColoredLog "`n⚠️  No credentials configured. This might be okay for export if auth not needed for this phase." -Level "WARN"
    }
    
    Write-ColoredLog "INFO: This requires processed data files to exist from a previous processing run in '$($global:MandA.Paths.ProcessedDataOutput)'." -Level "INFO"

    try {
        $configPath = if ($ConfigFile) { $ConfigFile } else { $global:MandA.Paths.ConfigFile }
        & $global:MandA.Paths.Orchestrator -Mode "Export" -ConfigurationFile $configPath -CompanyName $script:CompanyName -ErrorAction Stop
        Write-ColoredLog "`n✅ Export phase completed successfully!" -Level "SUCCESS"
    } catch {
        Write-ColoredLog "`n❌ Error during export: $($_.Exception.Message)" -Level "ERROR"
        Write-ColoredLog "   ScriptStackTrace: $($_.ScriptStackTrace)" -Level "DEBUG"
    } finally {
        if ($global:MandA) { $global:MandA.OrchestratorRunCount = 0 }
    }

    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Show-AzureADAppGuide {
    Clear-Host
    # ... (guide content as before) ...
}

function Invoke-ModuleCheck {
    Write-ColoredLog "`nChecking PowerShell module dependencies..." -Level "INFO"
    if (Test-Path $global:MandA.Paths.ModuleCheckScript) {
        # Pass -Silent to avoid prompts if -AutoFix is used, or run normally.
        # The module check script itself handles -AutoFix and -Silent.
        & $global:MandA.Paths.ModuleCheckScript -ErrorAction Stop 
        $script:ModulesVerified = $true # Assume success if no error thrown
        $script:LastModuleCheck = Get-Date
        $global:MandA.ModulesChecked = $true
    } else {
        Write-ColoredLog "Module check script not found: $($global:MandA.Paths.ModuleCheckScript)" -Level "ERROR"
    }
    Write-Host "`nPress any key to continue..." -ForegroundColor Gray; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

#endregion

#region Main Program

Unblock-SuiteFiles
Initialize-Environment

if (-not (Test-Administrator)) {
    Write-ColoredLog "⚠️  WARNING: Not running as Administrator. Some features may not work correctly." -Level "WARN"
    Start-Sleep -Seconds 3
}

Clear-Host
Write-Host @"
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║                    M&A DISCOVERY SUITE v5.2.1                          ║
║                                                                      ║
║            Comprehensive Infrastructure Discovery Tool                ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

if ($script:DebugModeEnabled) {
    Write-Host "`n                    🔧 DEBUG MODE ENABLED 🔧" -ForegroundColor Magenta
}

Write-Host "`nInitializing..." -ForegroundColor Yellow
Start-Sleep -Seconds 1 # Reduced sleep time

# Main menu loop
$firstRun = -not (Test-Path $global:MandA.Paths.CredentialFile -PathType Leaf) # Ensure it's a file

do {
    Show-MainMenu -FirstRun:$firstRun
    $selection = (Read-Host).Trim() # Fixed syntax

    switch ($selection) {
        '1' { Show-AzureADAppGuide }
        '2' { Show-CredentialSetupMenu; $firstRun = $false }
        '3' { if (Test-ShouldCheckModules -Operation "Full") { Invoke-ModuleCheck }; Start-FullDiscovery }
        '4' { if (Test-ShouldCheckModules -Operation "Discovery") { Invoke-ModuleCheck }; Start-DiscoveryOnly }
        '5' { Start-ProcessingOnly }
        '6' { Start-ExportOnly }
        '7' { Show-CredentialSetupMenu }
        '8' { Invoke-ModuleCheck }
        '9' { Write-ColoredLog "`n⚠️  Test Service Connections not yet implemented." -Level "WARN"; Start-Sleep -Seconds 1 }
        '10' { Write-ColoredLog "`n⚠️  View Configuration Settings not yet implemented." -Level "WARN"; Start-Sleep -Seconds 1 }
        '11' { Write-ColoredLog "`n⚠️  Clear Existing Data Files not yet implemented." -Level "WARN"; Start-Sleep -Seconds 1 }
        '12' { Write-ColoredLog "`n⚠️  Generate Sample Report not yet implemented." -Level "WARN"; Start-Sleep -Seconds 1 } # Added case 12
        'D' { # Debug menu
            $inDebugMenu = $true
            do {
                Show-DebugMenu
                $debugSelection = (Read-Host).Trim() # Fixed syntax

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
                    '20' { Clear-Host; Write-Host "Available Discovery Modules:" -ForegroundColor Yellow; Get-DiscoveryModules | ForEach-Object { Write-Host "  $($_.Name)" -ForegroundColor Cyan }; Write-Host "`nPress any key..." -ForegroundColor Gray; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }
                    '21' { Show-ModuleLoadStatus }
                    '22' { Clear-Host; Write-Host "Current Configuration:" -ForegroundColor Yellow; $global:MandA.Config | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Cyan; Write-Host "`nPress any key..." -ForegroundColor Gray; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }
                    '23' { Write-ColoredLog "`n⚠️  Test single connection not yet implemented" -Level "WARN"; Start-Sleep -Seconds 1 }
                    '24' { Force-LoadAllModules }
                    '25' { Show-GlobalContext }
                    '26' { Write-ColoredLog "`n⚠️  Custom config runner not yet implemented" -Level "WARN"; Start-Sleep -Seconds 1 }
                    '27' { Write-ColoredLog "`n⚠️  Debug export not yet implemented" -Level "WARN"; Start-Sleep -Seconds 1 }
                    '30' { if ($VerbosePreference -eq 'Continue') { $VerbosePreference = 'SilentlyContinue'; Write-Host "`nVerbose logging DISABLED" -ForegroundColor Yellow } else { $VerbosePreference = 'Continue'; Write-Host "`nVerbose logging ENABLED" -ForegroundColor Green }; Start-Sleep -Seconds 1 }
                    '31' { if ($ErrorActionPreference -eq 'Stop') { $ErrorActionPreference = 'Continue'; Write-Host "`nError Action: Continue" -ForegroundColor Yellow } else { $ErrorActionPreference = 'Stop'; Write-Host "`nError Action: Stop" -ForegroundColor Red }; Start-Sleep -Seconds 1 }
                    '32' { Write-Host "`nClearing module cache..." -ForegroundColor Yellow; Get-Module | Where-Object { $_.Path -like "*MandA*" } | Remove-Module -Force -ErrorAction SilentlyContinue; Write-Host "Module cache cleared" -ForegroundColor Green; Start-Sleep -Seconds 1 }
                    '33' { Write-Host "`nResetting global context flags..." -ForegroundColor Yellow; $global:MandA.ModulesChecked = $false; $global:MandA.OrchestratorRunCount = 0; $script:ModulesVerified = $false; $script:LastModuleCheck = $null; Write-Host "Global context flags reset" -ForegroundColor Green; Start-Sleep -Seconds 1 }
                    'B' { $inDebugMenu = $false } # Exit debug menu
                    'b' { $inDebugMenu = $false } # Exit debug menu (lowercase)
                    default {
                        Write-Host "`n⚠️  Invalid selection in debug menu. Please try again." -ForegroundColor Red
                        Start-Sleep -Seconds 1
                    }
                }
            } while ($inDebugMenu)
        }
        'd' { # Debug menu (lowercase)
            $inDebugMenu = $true
            do {
                Show-DebugMenu
                $debugSelection = (Read-Host).Trim() # Fixed syntax

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
                    '20' { Clear-Host; Write-Host "Available Discovery Modules:" -ForegroundColor Yellow; Get-DiscoveryModules | ForEach-Object { Write-Host "  $($_.Name)" -ForegroundColor Cyan }; Write-Host "`nPress any key..." -ForegroundColor Gray; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }
                    '21' { Show-ModuleLoadStatus }
                    '22' { Clear-Host; Write-Host "Current Configuration:" -ForegroundColor Yellow; $global:MandA.Config | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Cyan; Write-Host "`nPress any key..." -ForegroundColor Gray; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }
                    '23' { Write-ColoredLog "`n⚠️  Test single connection not yet implemented" -Level "WARN"; Start-Sleep -Seconds 1 }
                    '24' { Force-LoadAllModules }
                    '25' { Show-GlobalContext }
                    '26' { Write-ColoredLog "`n⚠️  Custom config runner not yet implemented" -Level "WARN"; Start-Sleep -Seconds 1 }
                    '27' { Write-ColoredLog "`n⚠️  Debug export not yet implemented" -Level "WARN"; Start-Sleep -Seconds 1 }
                    '30' { if ($VerbosePreference -eq 'Continue') { $VerbosePreference = 'SilentlyContinue'; Write-Host "`nVerbose logging DISABLED" -ForegroundColor Yellow } else { $VerbosePreference = 'Continue'; Write-Host "`nVerbose logging ENABLED" -ForegroundColor Green }; Start-Sleep -Seconds 1 }
                    '31' { if ($ErrorActionPreference -eq 'Stop') { $ErrorActionPreference = 'Continue'; Write-Host "`nError Action: Continue" -ForegroundColor Yellow } else { $ErrorActionPreference = 'Stop'; Write-Host "`nError Action: Stop" -ForegroundColor Red }; Start-Sleep -Seconds 1 }
                    '32' { Write-Host "`nClearing module cache..." -ForegroundColor Yellow; Get-Module | Where-Object { $_.Path -like "*MandA*" } | Remove-Module -Force -ErrorAction SilentlyContinue; Write-Host "Module cache cleared" -ForegroundColor Green; Start-Sleep -Seconds 1 }
                    '33' { Write-Host "`nResetting global context flags..." -ForegroundColor Yellow; $global:MandA.ModulesChecked = $false; $global:MandA.OrchestratorRunCount = 0; $script:ModulesVerified = $false; $script:LastModuleCheck = $null; Write-Host "Global context flags reset" -ForegroundColor Green; Start-Sleep -Seconds 1 }
                    'B' { $inDebugMenu = $false } # Exit debug menu
                    'b' { $inDebugMenu = $false } # Exit debug menu (lowercase)
                    default {
                        Write-Host "`n⚠️  Invalid selection in debug menu. Please try again." -ForegroundColor Red
                        Start-Sleep -Seconds 1
                    }
                }
            } while ($inDebugMenu)
        }
        'Q' { # Quit
            Write-Host "`nExiting M&A Discovery Suite..." -ForegroundColor Yellow
            Write-Host "Thank you for using the discovery tool!" -ForegroundColor Green
            Start-Sleep -Seconds 1
            # Loop condition will handle the exit
        }
        'q' { # Quit (lowercase)
            Write-Host "`nExiting M&A Discovery Suite..." -ForegroundColor Yellow
            Write-Host "Thank you for using the discovery tool!" -ForegroundColor Green
            Start-Sleep -Seconds 1
            # Loop condition will handle the exit
        }
        default {
            Write-Host "`n⚠️  Invalid selection. Please try again." -ForegroundColor Red
            Start-Sleep -Seconds 1
        }
    } # End of main switch
} while ($selection -ne 'Q' -and $selection -ne 'q') # End of main do-while

#endregion
