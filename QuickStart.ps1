#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Enhanced Quick Start Menu with Debug Features
.DESCRIPTION
    Provides a user-friendly interface to run the M&A Discovery Suite with improved
    credential management, status indicators, optimized module checking, and debug capabilities.
.NOTES
    Version: 5.1.0
    Author: Enhanced Version with Debug
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
        $script:CompanyName = Read-Host
        if ([string]::IsNullOrWhiteSpace($script:CompanyName)) {
            Write-Error "CompanyName cannot be empty. Exiting."
            exit 1
        }
    } else {
        $script:CompanyName = $CompanyName
    }

    # FIXED: QuickStart.ps1 is in the suite root, not in a subdirectory
    $suiteRoot = $PSScriptRoot
    
    # Initialize global context
    if ($null -eq $global:MandA) {
        $global:MandA = @{
            Paths = @{}
            Config = @{}
            Version = "5.1.0"
            StartTime = Get-Date
            ModulesChecked = $false  # Add flag to track module check status
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
        
        # Pass the CompanyName to Set-SuiteEnvironment.ps1
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
    
    # After environment is set, update paths with company-specific locations
    if ($null -ne $global:MandA.Paths.RawDataOutput) {
        # Company-specific paths should have been set by Set-SuiteEnvironment.ps1
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
    
    # Skip if explicitly requested or in debug mode
    if ($SkipModuleCheck -or $script:DebugModeEnabled) { return $false }
    
    # Always check for first run
    if (-not $script:ModulesVerified) { return $true }
    
    # Check if it's been more than 1 hour since last check
    if ($script:LastModuleCheck) {
        $timeSinceCheck = (Get-Date) - $script:LastModuleCheck
        if ($timeSinceCheck.TotalHours -gt 1) { return $true }
    }
    
    # For different operations, decide if check is needed
    switch ($Operation) {
        "Full" { return $false }
        "Discovery" { return $false }
        "Processing" { return $false }
        "Export" { return $false }
        "Utilities" { return $true }
        default { return $false }
    }
}

#endregion

#region Menu Display Functions

function Show-MainMenu {
    param(
        [switch]$FirstRun
    )
    
    Clear-Host
    Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║           M&A DISCOVERY SUITE - MAIN MENU v5.1                       ║" -ForegroundColor Cyan
    Write-Host "║                  Company: $($script:CompanyName)                     " -ForegroundColor Yellow
    if ($script:DebugModeEnabled) {
        Write-Host "║                  🔧 DEBUG MODE ENABLED 🔧                            " -ForegroundColor Magenta
    }
    Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    
    # Update and show connection status
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
    Write-Host "  [12] Generate Sample Report"
    
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
    
    # Credentials
    Write-Host "Credentials " -NoNewline
    if ($script:ConnectionStatus.Credentials) {
        Write-Host "✓" -ForegroundColor Green -NoNewline
    } else {
        Write-Host "✗" -ForegroundColor Red -NoNewline
    }
    
    # Azure AD
    Write-Host " | Azure AD " -NoNewline
    if ($script:ConnectionStatus.AzureAD) {
        Write-Host "✓" -ForegroundColor Green -NoNewline
    } else {
        Write-Host "✗" -ForegroundColor Red -NoNewline
    }
    
    # Exchange
    Write-Host " | Exchange " -NoNewline
    if ($script:ConnectionStatus.Exchange) {
        Write-Host "✓" -ForegroundColor Green -NoNewline
    } else {
        Write-Host "✗" -ForegroundColor Red -NoNewline
    }
    
    # SharePoint
    Write-Host " | SharePoint " -NoNewline
    if ($script:ConnectionStatus.SharePoint) {
        Write-Host "✓" -ForegroundColor Green -NoNewline
    } else {
        Write-Host "✗" -ForegroundColor Red -NoNewline
    }
    
    # Teams
    Write-Host " | Teams " -NoNewline
    if ($script:ConnectionStatus.Teams) {
        Write-Host "✓" -ForegroundColor Green
    } else {
        Write-Host "✗" -ForegroundColor Red
    }
    
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
    Write-Host "`n═══════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
    
    Write-Host "`n⚠️  WARNING: Debug mode bypasses safety checks!" -ForegroundColor Yellow
    Write-Host "   Use with caution. Some modules may fail without proper setup." -ForegroundColor Yellow
    
    Write-Host "`n  Enter your selection: " -ForegroundColor White -NoNewline
}

function Get-DiscoveryModules {
    $discoveryPath = $global:MandA.Paths.Discovery
    $modules = @()
    
    if (Test-Path $discoveryPath) {
        $moduleFiles = Get-ChildItem -Path $discoveryPath -Filter "*Discovery.psm1" -File
        
        foreach ($file in $moduleFiles) {
            $moduleName = $file.BaseName -replace 'Discovery$', ''
            $modules += [PSCustomObject]@{
                Name = $moduleName
                FileName = $file.Name
                FullPath = $file.FullName
                Loaded = $null -ne (Get-Module -Name $file.BaseName)
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
        # Load minimal required modules for logging
        $loggingModule = Join-Path $global:MandA.Paths.Utilities "EnhancedLogging.psm1"
        if (Test-Path $loggingModule) {
            Import-Module $loggingModule -Force -Global
            Write-Host "✓ Loaded logging module" -ForegroundColor Green
        }
        
        # Load the specific discovery module
        $moduleFileName = "${ModuleName}Discovery.psm1"
        $modulePath = Join-Path $global:MandA.Paths.Discovery $moduleFileName
        
        if (-not (Test-Path $modulePath)) {
            Write-Host "✗ Module not found: $modulePath" -ForegroundColor Red
            return
        }
        
        Write-Host "Loading module: $moduleFileName" -ForegroundColor Yellow
        Import-Module $modulePath -Force -Global
        Write-Host "✓ Module loaded successfully" -ForegroundColor Green
        
        # Create minimal configuration if needed
        $config = $global:MandA.Config
        if ($null -eq $config) {
            Write-Host "⚠️  No configuration loaded. Using minimal config." -ForegroundColor Yellow
            $config = @{
                environment = @{
                    outputPath = $global:MandA.Paths.CompanyProfileRoot
                    logLevel = "DEBUG"
                }
                discovery = @{
                    skipExistingFiles = $false
                }
            }
        }
        
        # Ensure output path exists
        if ($config.environment.outputPath) {
            $rawPath = Join-Path $config.environment.outputPath "Raw"
            if (-not (Test-Path $rawPath)) {
                New-Item -Path $rawPath -ItemType Directory -Force | Out-Null
                Write-Host "✓ Created output directory: $rawPath" -ForegroundColor Green
            }
        }
        
        # Call the discovery function
        $functionName = "Invoke-${ModuleName}Discovery"
        
        if (Get-Command $functionName -ErrorAction SilentlyContinue) {
            Write-Host "`nInvoking $functionName..." -ForegroundColor Cyan
            Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
            
            $result = & $functionName -Configuration $config
            
            Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
            Write-Host "✓ Discovery completed" -ForegroundColor Green
            
            # Show summary of results
            if ($result) {
                Write-Host "`nResults summary:" -ForegroundColor Yellow
                if ($result -is [hashtable]) {
                    foreach ($key in $result.Keys) {
                        $value = $result[$key]
                        $count = if ($value -is [array]) { $value.Count } elseif ($value.Count) { $value.Count } else { "N/A" }
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
    
    Write-Host "`nDiscovery Modules:" -ForegroundColor Yellow
    Write-Host "==================" -ForegroundColor Yellow
    
    foreach ($module in $modules) {
        $status = if ($module.Loaded) { "✓ Loaded" } else { "✗ Not Loaded" }
        $color = if ($module.Loaded) { "Green" } else { "Red" }
        
        Write-Host ("  {0,-30} {1}" -f $module.Name, $status) -ForegroundColor $color
    }
    
    Write-Host "`nCore Modules:" -ForegroundColor Yellow
    Write-Host "=============" -ForegroundColor Yellow
    
    $coreModules = @(
        "EnhancedLogging",
        "FileOperations",
        "ValidationHelpers",
        "ConfigurationValidation",
        "ErrorHandling",
        "Authentication",
        "CredentialManagement",
        "EnhancedConnectionManager"
    )
    
    foreach ($moduleName in $coreModules) {
        $loaded = $null -ne (Get-Module -Name "*$moduleName*")
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
        
        # Convert to JSON for nice display
        $global:MandA | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Cyan
    }
    
    Write-Host "`nPress any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Force-LoadAllModules {
    Write-Host "`nForce loading all discovery modules..." -ForegroundColor Yellow
    
    $modules = Get-DiscoveryModules
    $successCount = 0
    $failCount = 0
    
    foreach ($module in $modules) {
        Write-Host "  Loading $($module.Name)... " -NoNewline
        try {
            Import-Module $module.FullPath -Force -Global -ErrorAction Stop
            Write-Host "✓" -ForegroundColor Green
            $successCount++
        } catch {
            Write-Host "✗ - $($_.Exception.Message)" -ForegroundColor Red
            $failCount++
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
    
    Write-Host "`n📋 WHAT YOU'LL NEED:" -ForegroundColor Yellow
    Write-Host "===================" -ForegroundColor Yellow
    
    Write-Host "`n1️⃣  Application (Client) ID" -ForegroundColor Green
    Write-Host "   • Found in: Azure Portal > App Registrations > Your App > Overview" -ForegroundColor Gray
    Write-Host "   • Format: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX (GUID)" -ForegroundColor Gray
    Write-Host "   • Example: 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d" -ForegroundColor DarkGray
    
    Write-Host "`n2️⃣  Tenant ID" -ForegroundColor Green
    Write-Host "   • Found in: Azure Portal > Azure Active Directory > Overview" -ForegroundColor Gray
    Write-Host "   • Format: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX (GUID)" -ForegroundColor Gray
    Write-Host "   • Example: 9z8y7x6w-5v4u-3t2s-1r0q-9p8o7n6m5l4k" -ForegroundColor DarkGray
    
    Write-Host "`n3️⃣  Client Secret" -ForegroundColor Green
    Write-Host "   • Found in: Azure Portal > App Registrations > Your App > Certificates & Secrets" -ForegroundColor Gray
    Write-Host "   • ⚠️  Only visible when first created - copy immediately!" -ForegroundColor Yellow
    Write-Host "   • Format: Random string of characters" -ForegroundColor Gray
    Write-Host "   • Example: xWw8Q~1AbCdEfGhIjKlMnOpQrStUvWxYz" -ForegroundColor DarkGray
    
    Write-Host "`n═══════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host "`n🔒 Your credentials will be encrypted and stored locally at:" -ForegroundColor Cyan
    Write-Host "   $($global:MandA.Paths.CredentialFile)" -ForegroundColor White
    
    Write-Host "`n⚡ Ready to continue? (Y/N): " -ForegroundColor Green -NoNewline
    $continue = Read-Host
    
    if ($continue -eq 'Y' -or $continue -eq 'y') {
        Set-CredentialConfiguration
    } else {
        Write-Host "`nReturning to main menu..." -ForegroundColor Yellow
        Start-Sleep -Seconds 1
    }
}

function Set-CredentialConfiguration {
    Write-Host "`n📝 ENTER YOUR CREDENTIALS" -ForegroundColor Yellow
    Write-Host "========================" -ForegroundColor Yellow
    
    # Application ID
    do {
        Write-Host "`n1. Application (Client) ID: " -ForegroundColor Cyan -NoNewline
        $appId = Read-Host
        
        if ($appId -match '^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$') {
            Write-Host "   ✓ Valid GUID format" -ForegroundColor Green
            $validAppId = $true
        } else {
            Write-Host "   ✗ Invalid format. Please enter a valid GUID." -ForegroundColor Red
            Write-Host "   Example: 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d" -ForegroundColor Yellow
            $validAppId = $false
        }
    } while (-not $validAppId)
    
    # Tenant ID
    do {
        Write-Host "`n2. Tenant ID: " -ForegroundColor Cyan -NoNewline
        $tenantId = Read-Host
        
        if ($tenantId -match '^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$') {
            Write-Host "   ✓ Valid GUID format" -ForegroundColor Green
            $validTenantId = $true
        } else {
            Write-Host "   ✗ Invalid format. Please enter a valid GUID." -ForegroundColor Red
            Write-Host "   Example: 9z8y7x6w-5v4u-3t2s-1r0q-9p8o7n6m5l4k" -ForegroundColor Yellow
            $validTenantId = $false
        }
    } while (-not $validTenantId)
    
    # Client Secret
    Write-Host "`n3. Client Secret: " -ForegroundColor Cyan -NoNewline
    $clientSecret = Read-Host -AsSecureString
    Write-Host "   ✓ Secret captured (hidden for security)" -ForegroundColor Green
    
    # Show summary
    Write-Host "`n📊 SUMMARY" -ForegroundColor Yellow
    Write-Host "==========" -ForegroundColor Yellow
    Write-Host "App ID:    $appId" -ForegroundColor White
    Write-Host "Tenant ID: $tenantId" -ForegroundColor White
    Write-Host "Secret:    ********** (hidden)" -ForegroundColor White
    
    Write-Host "`n💾 Save these credentials? (Y/N): " -ForegroundColor Green -NoNewline
    $save = Read-Host
    
    if ($save -eq 'Y' -or $save -eq 'y') {
        try {
            # Import credential management module
            $credModulePath = Join-Path $global:MandA.Paths.Authentication "CredentialManagement.psm1"
            if (Test-Path $credModulePath) {
                Import-Module $credModulePath -Force -Global
            }
            
            # Convert secure string back to plain text
            $ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($clientSecret)
            $plainSecret = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr)
            [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
            
            # Use the module's function to save credentials
            $result = Set-SecureCredentials -ClientId $appId -ClientSecret $plainSecret -TenantId $tenantId -Configuration $global:MandA.Config
            
            if ($result) {
                Write-Host "`n✅ Credentials saved successfully!" -ForegroundColor Green
                Write-Host "📁 Location: $($global:MandA.Paths.CredentialFile)" -ForegroundColor Gray
            } else {
                Write-Host "`n❌ Failed to save credentials" -ForegroundColor Red
            }
            
        } catch {
            Write-Host "`n❌ Error saving credentials: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "`n❌ Credential setup cancelled." -ForegroundColor Yellow
    }
    
    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

#endregion

#region Operation Functions

function Start-FullDiscovery {
    Write-ColoredLog "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Level "HEADER"
    Write-ColoredLog "                    STARTING FULL DISCOVERY SUITE                      " -Level "HEADER"
    Write-ColoredLog "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Level "HEADER"
    
    # Check credentials
    if (-not $script:ConnectionStatus.Credentials) {
        Write-ColoredLog "`n⚠️  No credentials configured. Please set up credentials first (Option 2)." -Level "ERROR"
        Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        return
    }
    
    # Run orchestrator
    try {
        # Use the configuration file path
        $configPath = if ($ConfigFile) { $ConfigFile } else { $global:MandA.Paths.ConfigFile }
        
        # Run orchestrator with CompanyName
        & $global:MandA.Paths.Orchestrator -Mode "Full" -ConfigurationFile $configPath -CompanyName $script:CompanyName
        
        Write-ColoredLog "`n✅ Full discovery suite completed successfully!" -Level "SUCCESS"
    } catch {
        Write-ColoredLog "`n❌ Error during discovery: $($_.Exception.Message)" -Level "ERROR"
    } finally {
        # Reset orchestrator run count for next operation
        if ($global:MandA) {
            $global:MandA.OrchestratorRunCount = 0
        }
    }
    
    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Start-DiscoveryOnly {
    Write-ColoredLog "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Level "HEADER"
    Write-ColoredLog "                    STARTING DISCOVERY PHASE ONLY                      " -Level "HEADER"
    Write-ColoredLog "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Level "HEADER"
    
    if (-not $script:ConnectionStatus.Credentials) {
        Write-ColoredLog "`n⚠️  No credentials configured. Please set up credentials first (Option 2)." -Level "ERROR"
        Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        return
    }
    
    try {
        $configPath = if ($ConfigFile) { $ConfigFile } else { $global:MandA.Paths.ConfigFile }
        
        # Run orchestrator with CompanyName
        & $global:MandA.Paths.Orchestrator -Mode "Discovery" -ConfigurationFile $configPath -CompanyName $script:CompanyName
        
        Write-ColoredLog "`n✅ Discovery phase completed successfully!" -Level "SUCCESS"
    } catch {
        Write-ColoredLog "`n❌ Error during discovery: $($_.Exception.Message)" -Level "ERROR"
    } finally {
        # Reset orchestrator run count for next operation
        if ($global:MandA) {
            $global:MandA.OrchestratorRunCount = 0
        }
    }
    
    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Show-AzureADAppGuide {
    Clear-Host
    Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║          AZURE AD APP REGISTRATION SETUP GUIDE                       ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    
    Write-Host "`n📋 STEP-BY-STEP GUIDE:" -ForegroundColor Yellow
    Write-Host "=====================" -ForegroundColor Yellow
    
    Write-Host "`n1️⃣  Navigate to Azure Portal" -ForegroundColor Green
    Write-Host "   • Go to: https://portal.azure.com" -ForegroundColor Gray
    Write-Host "   • Sign in with your admin account" -ForegroundColor Gray
    
    Write-Host "`n2️⃣  Create App Registration" -ForegroundColor Green
    Write-Host "   • Navigate to: Azure Active Directory > App registrations" -ForegroundColor Gray
    Write-Host "   • Click: '+ New registration'" -ForegroundColor Gray
    Write-Host "   • Name: 'M&A Discovery Suite' (or your preferred name)" -ForegroundColor Gray
    Write-Host "   • Account types: 'Single tenant' (recommended)" -ForegroundColor Gray
    Write-Host "   • Redirect URI: Leave blank" -ForegroundColor Gray
    Write-Host "   • Click: 'Register'" -ForegroundColor Gray
    
    Write-Host "`n3️⃣  Create Client Secret" -ForegroundColor Green
    Write-Host "   • In your app, go to: 'Certificates & secrets'" -ForegroundColor Gray
    Write-Host "   • Click: '+ New client secret'" -ForegroundColor Gray
    Write-Host "   • Description: 'M&A Discovery Secret'" -ForegroundColor Gray
    Write-Host "   • Expires: Choose appropriate duration" -ForegroundColor Gray
    Write-Host "   • Click: 'Add'" -ForegroundColor Gray
    Write-Host "   • ⚠️  IMPORTANT: Copy the secret value immediately!" -ForegroundColor Yellow
    
    Write-Host "`n4️⃣  Grant API Permissions" -ForegroundColor Green
    Write-Host "   • Go to: 'API permissions'" -ForegroundColor Gray
    Write-Host "   • Click: '+ Add a permission'" -ForegroundColor Gray
    Write-Host "   • Select: 'Microsoft Graph'" -ForegroundColor Gray
    Write-Host "   • Select: 'Application permissions'" -ForegroundColor Gray
    Write-Host "`n   Add these permissions:" -ForegroundColor White
    Write-Host "   • Directory.Read.All" -ForegroundColor DarkGray
    Write-Host "   • User.Read.All" -ForegroundColor DarkGray
    Write-Host "   • Group.Read.All" -ForegroundColor DarkGray
    Write-Host "   • Application.Read.All" -ForegroundColor DarkGray
    Write-Host "   • Policy.Read.All" -ForegroundColor DarkGray
    Write-Host "   • DeviceManagementManagedDevices.Read.All" -ForegroundColor DarkGray
    Write-Host "   • DeviceManagementConfiguration.Read.All" -ForegroundColor DarkGray
    Write-Host "   • Reports.Read.All" -ForegroundColor DarkGray
    
    Write-Host "`n5️⃣  Grant Admin Consent" -ForegroundColor Green
    Write-Host "   • After adding permissions, click: 'Grant admin consent for [Your Tenant]'" -ForegroundColor Gray
    Write-Host "   • Confirm the consent dialog" -ForegroundColor Gray
    Write-Host "   • All permissions should show '✓ Granted' status" -ForegroundColor Gray
    
    Write-Host "`n6️⃣  Note Your Values" -ForegroundColor Green
    Write-Host "   • Application (client) ID: Found in 'Overview' page" -ForegroundColor Gray
    Write-Host "   • Directory (tenant) ID: Found in 'Overview' page" -ForegroundColor Gray
    Write-Host "   • Client secret: The value you copied in step 3" -ForegroundColor Gray
    
    Write-Host "`n═══════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host "`n📌 NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "   Return to main menu and select option [2] to configure credentials" -ForegroundColor White
    
    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Invoke-ModuleCheck {
    Write-ColoredLog "`nChecking PowerShell module dependencies..." -Level "INFO"
    
    if (Test-Path $global:MandA.Paths.ModuleCheckScript) {
        if ($VerbosePreference -eq 'Continue') {
            & $global:MandA.Paths.ModuleCheckScript -Verbose
        } else {
            & $global:MandA.Paths.ModuleCheckScript
        }
        $script:ModulesVerified = $true
        $script:LastModuleCheck = Get-Date
        $global:MandA.ModulesChecked = $true  # Also set the global flag
    } else {
        Write-ColoredLog "Module check script not found: $($global:MandA.Paths.ModuleCheckScript)" -Level "ERROR"
    }
    
    Write-Host "`nPress any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

#endregion

#region Main Program

# Unblock all suite files first
Unblock-SuiteFiles

# Initialize environment
Initialize-Environment

# Check if running as administrator
if (-not (Test-Administrator)) {
    Write-ColoredLog "⚠️  WARNING: Not running as Administrator. Some features may not work correctly." -Level "WARN"
    Write-ColoredLog "   Recommended: Run PowerShell as Administrator" -Level "WARN"
    Start-Sleep -Seconds 3
}

# Show welcome message
Clear-Host
Write-Host @"
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║                    M&A DISCOVERY SUITE v5.1                          ║
║                                                                      ║
║            Comprehensive Infrastructure Discovery Tool                ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

if ($script:DebugModeEnabled) {
    Write-Host "`n                    🔧 DEBUG MODE ENABLED 🔧" -ForegroundColor Magenta
}

Write-Host "`nInitializing..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Main menu loop
$firstRun = -not (Test-Path $global:MandA.Paths.CredentialFile)

do {
    Show-MainMenu -FirstRun:$firstRun
    $selection = Read-Host
    
    switch ($selection) {
        '1' {
            # Setup Azure AD App Registration
            Show-AzureADAppGuide
        }
        '2' {
            # Configure Credentials
            Show-CredentialSetupMenu
            $firstRun = $false
        }
        '3' {
            # Full Discovery
            if (Test-ShouldCheckModules -Operation "Full") {
                Write-Host "`nChecking module dependencies..." -ForegroundColor Yellow
                Invoke-ModuleCheck
            }
            Start-FullDiscovery
        }
        '4' {
            # Discovery Only
            if (Test-ShouldCheckModules -Operation "Discovery") {
                Write-Host "`nChecking module dependencies..." -ForegroundColor Yellow
                Invoke-ModuleCheck
            }
            Start-DiscoveryOnly
        }
        '5' {
            # Processing Only
            Write-ColoredLog "`n⚠️  Processing phase not yet implemented" -Level "WARN"
            Start-Sleep -Seconds 2
        }
        '6' {
            # Export Only
            Write-ColoredLog "`n⚠️  Export phase not yet implemented" -Level "WARN"
            Start-Sleep -Seconds 2
        }
        '7' {
            # Update Credentials
            Show-CredentialSetupMenu
        }
        '8' {
            # Verify Modules
            Invoke-ModuleCheck
        }
        '9' {
            # Test Connections
            Write-ColoredLog "`n⚠️  Test connections not yet implemented" -Level "WARN"
            Start-Sleep -Seconds 2
        }
        '10' {
            # View Configuration
            Write-ColoredLog "`n⚠️  View configuration not yet implemented" -Level "WARN"
            Start-Sleep -Seconds 2
        }
        '11' {
            # Clear Data Files
            Write-ColoredLog "`n⚠️  Clear data files not yet implemented" -Level "WARN"
            Start-Sleep -Seconds 2
        }
        '12' {
            # Generate Sample Report
            Write-ColoredLog "`n⚠️  Report generation not yet implemented" -Level "WARN"
            Start-Sleep -Seconds 2
        }
        'D' {
            # Enter Debug Menu
            $inDebugMenu = $true
            do {
                Show-DebugMenu
                $debugSelection = Read-Host
                
                switch ($debugSelection) {
                    # Individual Module Discovery
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
                    
                    # Debug Utilities
                    '20' {
                        # List All Discovery Modules
                        Clear-Host
                        Write-Host "Available Discovery Modules:" -ForegroundColor Yellow
                        Write-Host "===========================" -ForegroundColor Yellow
                        $modules = Get-DiscoveryModules
                        foreach ($module in $modules) {
                            Write-Host "  $($module.Name)" -ForegroundColor Cyan
                        }
                        Write-Host "`nPress any key to continue..." -ForegroundColor Gray
                        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
                    }
                    '21' { Show-ModuleLoadStatus }
                    '22' {
                        # View Current Configuration
                        Clear-Host
                        Write-Host "Current Configuration:" -ForegroundColor Yellow
                        Write-Host "=====================" -ForegroundColor Yellow
                        $global:MandA.Config | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Cyan
                        Write-Host "`nPress any key to continue..." -ForegroundColor Gray
                        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
                    }
                    '23' {
                        # Test Single Connection
                        Write-ColoredLog "`n⚠️  Test single connection not yet implemented" -Level "WARN"
                        Start-Sleep -Seconds 2
                    }
                    '24' { Force-LoadAllModules }
                    '25' { Show-GlobalContext }
                    '26' {
                        # Run Module with Custom Config
                        Write-ColoredLog "`n⚠️  Custom config runner not yet implemented" -Level "WARN"
                        Start-Sleep -Seconds 2
                    }
                    '27' {
                        # Export Debug Information
                        Write-ColoredLog "`n⚠️  Debug export not yet implemented" -Level "WARN"
                        Start-Sleep -Seconds 2
                    }
                    
                    # Debug Options
                    '30' {
                        # Toggle Verbose Logging
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
                        # Toggle Error Action Preference
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
                        # Clear Module Cache
                        Write-Host "`nClearing module cache..." -ForegroundColor Yellow
                        Get-Module | Where-Object { $_.Path -like "*MandA*" } | Remove-Module -Force
                        Write-Host "Module cache cleared" -ForegroundColor Green
                        Start-Sleep -Seconds 1
                    }
                    '33' {
                        # Reset Global Context
                        Write-Host "`nResetting global context..." -ForegroundColor Yellow
                        $global:MandA.ModulesChecked = $false
                        $global:MandA.OrchestratorRunCount = 0
                        $script:ModulesVerified = $false
                        $script:LastModuleCheck = $null
                        Write-Host "Global context reset" -ForegroundColor Green
                        Start-Sleep -Seconds 1
                    }
                    
                    'B' { $inDebugMenu = $false }
                    'b' { $inDebugMenu = $false }
                    default {
                        Write-Host "`n⚠️  Invalid selection. Please try again." -ForegroundColor Red
                        Start-Sleep -Seconds 1
                    }
                }
            } while ($inDebugMenu)
        }
        'd' {
            $selection = 'D'
        }
        'Q' {
            Write-Host "`nExiting M&A Discovery Suite..." -ForegroundColor Yellow
            Write-Host "Thank you for using the discovery tool!" -ForegroundColor Green
            Start-Sleep -Seconds 1
        }
        'q' {
            $selection = 'Q'
        }
        default {
            Write-Host "`n⚠️  Invalid selection. Please try again." -ForegroundColor Red
            Start-Sleep -Seconds 1
        }
    }
    
} while ($selection -ne 'Q')

#endregion
