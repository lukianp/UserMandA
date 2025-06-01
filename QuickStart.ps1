<#
.SYNOPSIS
    Quick start script for M&A Discovery Suite v4.1.4
.DESCRIPTION
    A menu-driven launcher for all suite operations.
    Includes $ErrorActionPreference = "Stop" for robust error handling.
    NOW EMBEDS Set-SuiteEnvironment.ps1 logic to initialize $global:MandA.
    Includes upfront PowerShell module check.
.NOTES
    Version: 4.1.4
    Author: Gemini & User
    Date: 2025-06-01
#>
[CmdletBinding()]
param() # Defines that this script takes NO positional parameters

# Ensure script halts on terminating errors from sourced scripts or cmdlets
$OriginalErrorActionPreferenceForQuickStart = $ErrorActionPreference
$ErrorActionPreference = "Stop"

# --- BEGIN Embedded Set-SuiteEnvironment Logic (v3.0.4 equivalent) ---
Write-Host "--- QuickStart.ps1 (v4.1.4) Initializing Environment (Embedded Logic) ---" -ForegroundColor Magenta

function Test-MandASuiteStructureInternal_QS { # Renamed to avoid conflict if original is loaded elsewhere
    param([string]$PathToTest)
    $requiredSubDirs = @("Core", "Modules", "Scripts", "Configuration")
    if (-not (Test-Path $PathToTest -PathType Container)) { return $false }
    foreach ($subDir in $requiredSubDirs) {
        if (-not (Test-Path (Join-Path $PathToTest $subDir) -PathType Container)) { return $false }
    }
    return $true
}

$SuiteRoot_QS = $null # Use script-local variables
$determinedBy_QS = ""

try {
    Write-Host "Attempting to determine SuiteRoot..." -ForegroundColor Yellow
    
    $quickStartPathForEnv = $MyInvocation.MyCommand.Path
    if ([string]::IsNullOrWhiteSpace($quickStartPathForEnv) -and $PSScriptRoot) {
        $quickStartPathForEnv = Join-Path $PSScriptRoot $MyInvocation.MyCommand.Name
    }
    
    if ([string]::IsNullOrWhiteSpace($quickStartPathForEnv)) {
        throw "CRITICAL: Cannot determine the path of QuickStart.ps1 to establish SuiteRoot."
    }

    $SuiteRoot_QS = Split-Path $quickStartPathForEnv -Parent
    Write-Host "SuiteRoot determined by QuickStart.ps1 location: '$SuiteRoot_QS'" -ForegroundColor DarkCyan

    if (-not (Test-MandASuiteStructureInternal_QS -PathToTest $SuiteRoot_QS)) {
        Write-Host "Structure test failed for '$SuiteRoot_QS'. Checking default 'C:\UserMigration'..." -ForegroundColor Gray
        $defaultPath_QS = "C:\UserMigration"
        if (Test-MandASuiteStructureInternal_QS -PathToTest $defaultPath_QS) {
            $SuiteRoot_QS = Resolve-Path $defaultPath_QS | Select-Object -ExpandProperty Path
            $determinedBy_QS = "default path ('$defaultPath_QS') after initial auto-detect failed"
            Write-Host "SuiteRoot set by default path: $SuiteRoot_QS" -ForegroundColor Green
        } else {
            throw "CRITICAL: SuiteRoot '$SuiteRoot_QS' (from QuickStart location) is not a valid suite structure, and default path '$defaultPath_QS' also failed. Ensure QuickStart.ps1 is in the correct M&A Suite root directory."
        }
    } else {
        $determinedBy_QS = "QuickStart.ps1 location"
        Write-Host "SuiteRoot set by QuickStart.ps1 location: $SuiteRoot_QS" -ForegroundColor Green
    }
    
} catch {
    Write-Error "ERROR establishing SuiteRoot within QuickStart: $($_.Exception.Message)"
    $ErrorActionPreference = $OriginalErrorActionPreferenceForQuickStart
    exit 1 
}

Write-Host "SuiteRoot successfully established: $SuiteRoot_QS" -ForegroundColor Green

Write-Host "Loading and processing configuration file..." -ForegroundColor Yellow
$configFilePath_QS = Join-Path $SuiteRoot_QS "Configuration/default-config.json"
$configSchemaPath_QS = Join-Path $SuiteRoot_QS "Configuration/config.schema.json"

if (-not (Test-Path $configFilePath_QS -PathType Leaf)) {
    $errorMessage_QS = "CRITICAL: Configuration file 'default-config.json' not found at expected location: '$configFilePath_QS'"
    Write-Error $errorMessage_QS; $ErrorActionPreference = $OriginalErrorActionPreferenceForQuickStart; exit 1
}
Write-Host "Configuration file found: $configFilePath_QS" -ForegroundColor Green
if (-not (Test-Path $configSchemaPath_QS -PathType Leaf)) {
    Write-Host "WARNING: Configuration schema 'config.schema.json' not found at '$configSchemaPath_QS'. Runtime configuration validation will be skipped." -ForegroundColor Yellow
} else { Write-Host "Configuration schema file found: $configSchemaPath_QS" -ForegroundColor Green }

$loadedConfig_QS = $null
try {
    $loadedConfig_QS = Get-Content $configFilePath_QS -Raw | ConvertFrom-Json -ErrorAction Stop
    Write-Host "Configuration file parsed successfully." -ForegroundColor Green
} catch {
    $errorMessage_QS = "CRITICAL: Failed to parse 'default-config.json': $($_.Exception.Message)"
    Write-Error $errorMessage_QS; $ErrorActionPreference = $OriginalErrorActionPreferenceForQuickStart; exit 1 
}
function ConvertTo-HashtableRecursiveInternal_QS { 
    param($obj)
    if ($obj -is [System.Management.Automation.PSCustomObject]) {
        $hash = @{}; foreach ($prop in $obj.PSObject.Properties) { $hash[$prop.Name] = ConvertTo-HashtableRecursiveInternal_QS $prop.Value }; return $hash
    } elseif ($obj -is [array]) { return @($obj | ForEach-Object { ConvertTo-HashtableRecursiveInternal_QS $_ }) } else { return $obj }
}
$configHashtable_QS = ConvertTo-HashtableRecursiveInternal_QS $loadedConfig_QS
Write-Host "Configuration converted to Hashtable." -ForegroundColor DarkGray

if ($null -eq $configHashtable_QS.environment -or [string]::IsNullOrWhiteSpace($configHashtable_QS.environment.outputPath)) {
    $errorMessage_QS = "CRITICAL: 'environment.outputPath' is missing or empty in '$configFilePath_QS'."; Write-Error $errorMessage_QS; $ErrorActionPreference = $OriginalErrorActionPreferenceForQuickStart; exit 1
}
if ($null -eq $configHashtable_QS.authentication -or [string]::IsNullOrWhiteSpace($configHashtable_QS.authentication.credentialStorePath)) {
    Write-Host "WARNING: 'authentication.credentialStorePath' is missing/empty. Defaulting." -ForegroundColor Yellow
}
$envOutputPath_QS = $configHashtable_QS.environment.outputPath 
if (-not ([System.IO.Path]::IsPathRooted($envOutputPath_QS))) { $envOutputPath_QS = Join-Path $SuiteRoot_QS $envOutputPath_QS }
$credentialStorePathFromConfig_QS = $configHashtable_QS.authentication.credentialStorePath 
$resolvedCredentialPath_QS = if (-not [string]::IsNullOrWhiteSpace($credentialStorePathFromConfig_QS) -and [System.IO.Path]::IsPathRooted($credentialStorePathFromConfig_QS)) { 
    $credentialStorePathFromConfig_QS } elseif (-not [string]::IsNullOrWhiteSpace($credentialStorePathFromConfig_QS)) { Join-Path $SuiteRoot_QS $credentialStorePathFromConfig_QS } else { Join-Path $SuiteRoot_QS "Output/credentials.config" }

$global:MandA = @{
    DeterminedBy = $determinedBy_QS; Config = $configHashtable_QS 
    Paths = @{ SuiteRoot = $SuiteRoot_QS; Core = Join-Path $SuiteRoot_QS "Core"; Configuration = Join-Path $SuiteRoot_QS "Configuration"; Scripts = Join-Path $SuiteRoot_QS "Scripts"; Modules = Join-Path $SuiteRoot_QS "Modules"; Utilities = Join-Path $SuiteRoot_QS "Modules/Utilities"; Documentation = Join-Path $SuiteRoot_QS "Documentation"; ConfigFile = $configFilePath_QS; ConfigSchema = $configSchemaPath_QS; CsvSchemas = Join-Path $SuiteRoot_QS "Configuration/csv.schemas.json"; Orchestrator = Join-Path $SuiteRoot_QS "Core/MandA-Orchestrator.ps1"; QuickStart = Join-Path $SuiteRoot_QS "QuickStart.ps1"; ValidationScript = Join-Path $SuiteRoot_QS "Scripts/Validate-Installation.ps1"; AppRegScript = Join-Path $SuiteRoot_QS "Scripts/Setup-AppRegistration.ps1"; ModuleCheckScript = Join-Path $SuiteRoot_QS "Scripts/DiscoverySuiteModuleCheck.ps1"; RawDataOutput = Join-Path $envOutputPath_QS "Raw"; ProcessedDataOutput = Join-Path $envOutputPath_QS "Processed"; LogOutput = Join-Path $envOutputPath_QS "Logs"; CredentialFile = $resolvedCredentialPath_QS }
}

if ($null -eq $global:MandA -or $null -eq $global:MandA.Paths) { throw "CRITICAL: Failed to initialize `$global:MandA.Paths correctly within QuickStart.ps1." }

$configValidationModulePath_QS = Join-Path $global:MandA.Paths.Utilities "ConfigurationValidation.psm1"
if (Test-Path $configValidationModulePath_QS -PathType Leaf) {
    try { Import-Module $configValidationModulePath_QS -Force -Global; if (Get-Command Test-SuiteConfigurationAgainstSchema -EA SilentlyContinue) { 
        Write-Host "INFO: Validating configuration against schema '$($global:MandA.Paths.ConfigSchema)'..." -ForegroundColor Gray
        $validationResult_QS = Test-SuiteConfigurationAgainstSchema -ConfigurationObject $global:MandA.Config -SchemaPath $global:MandA.Paths.ConfigSchema # Corrected param names
        if (-not $validationResult_QS.IsValid) { Write-Warning "Config validation failed." } else { Write-Host "INFO: Config schema OK." -FG Green }
    } else { Write-Warning "Test-SuiteConfigurationAgainstSchema not found."} } catch { Write-Warning "Failed to run ConfigValidation: $($_.Exception.Message)"}
} else { Write-Warning "ConfigurationValidation.psm1 not found. Skipping schema validation."}

Write-Host "M&A Discovery Suite Environment Initialized by QuickStart (v4.1.4)" -ForegroundColor Cyan
Write-Host ("-" * 65) -ForegroundColor Cyan
# --- END Embedded Set-SuiteEnvironment Logic ---

# --- BEGIN Upfront PowerShell Module Check ---
Write-Host "--- QuickStart: Performing Initial PowerShell Module Check ---" -ForegroundColor Magenta
try {
    if (Test-Path $global:MandA.Paths.ModuleCheckScript) {
        # Run with AutoFix, but not Silent, so user is prompted by ShouldProcess for fixes.
        & $global:MandA.Paths.ModuleCheckScript -AutoFix
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "DiscoverySuiteModuleCheck.ps1 reported issues. Some functionalities might be affected."
            Write-Host "Press Enter to continue to menu, or Ctrl+C to exit and fix modules manually." -ForegroundColor Yellow
            Read-Host | Out-Null
        } else {
            Write-Host "Initial PowerShell module check completed successfully." -ForegroundColor Green
        }
    } else {
        Write-Warning "ModuleCheckScript not found at '$($global:MandA.Paths.ModuleCheckScript)'. Skipping upfront module check."
    }
} catch {
     Write-Warning "Error during upfront module check: $($_.Exception.Message). Continuing to menu..."
}
# --- END Upfront PowerShell Module Check ---


try {
    Import-Module (Join-Path $global:MandA.Paths.Utilities "EnhancedLogging.psm1") -Force -Global
} catch {
    Write-Warning "Failed to load EnhancedLogging.psm1. Menu logging will be basic. Error: $($_.Exception.Message)"
    function Write-MandALog { param([string]$Message, [string]$Level="INFO") Write-Host "[$Level] $Message" }
}

function Show-MenuInternal { 
    Clear-Host
    Write-Host "+==================================================================+" -ForegroundColor Cyan
    Write-Host "|              M&A Discovery Suite v4.1.4 - Main Menu            |" -ForegroundColor Cyan
    Write-Host "+==================================================================+" -ForegroundColor Cyan
    Write-Host "  Suite Root: $($global:MandA.Paths.SuiteRoot)" -ForegroundColor DarkYellow
    Write-Host "  Config File: $($global:MandA.Paths.ConfigFile)" -ForegroundColor DarkGray
    Write-Host
    Write-Host "  SETUP & CONFIGURATION" -ForegroundColor Yellow
    Write-Host "  [1] Setup/Verify Azure AD App Registration (Recommended First Step)"
    Write-Host
    Write-Host "  ORCHESTRATOR EXECUTION" -ForegroundColor Yellow
    Write-Host "  [F] Full Run: Discovery, Processing, and Export (Recommended)"
    Write-Host "  [D] Discovery Only"
    Write-Host "  [P] Processing Only (Uses existing Raw data)"
    Write-Host "  [E] Export Only (Uses existing Processed data)"
    Write-Host
    Write-Host "  UTILITIES & VALIDATION" -ForegroundColor Yellow
    Write-Host "  [V] Validate Full Installation & Configuration"
    Write-Host "  [M] Check PowerShell Modules (Interactive with AutoFix)"
    Write-Host "  [T] Test Configuration Only (Orchestrator Dry Run)"
    Write-Host
    Write-Host "  [Q] Quit" -ForegroundColor Yellow
    Write-Host
}

function Invoke-OrchestratorInternal { 
    param(
        [Parameter(Mandatory=$true)]
        [string]$Mode,
        [Parameter(Mandatory=$false)]
        [switch]$ValidateOnlyFlag 
    )
    if ($null -eq $global:MandA -or $null -eq $global:MandA.Paths -or $null -eq $global:MandA.Paths.Orchestrator -or $null -eq $global:MandA.Paths.ConfigFile) {
        Write-MandALog "Critical error: `$global:MandA or its essential paths are not properly set." -Level "ERROR"; Request-UserToContinueInternal; return
    }
    $orchestratorParams = @{ ConfigurationFile = $global:MandA.Paths.ConfigFile; Mode = $Mode }
    if ($ValidateOnlyFlag.IsPresent) { $orchestratorParams.ValidateOnly = $true }
    try {
        Write-MandALog "Preparing to launch Orchestrator (Mode: $Mode)..." -Level "HEADER"
        Write-MandALog "Executing: & `"$($global:MandA.Paths.Orchestrator)`" @orchestratorParams" -Level "DEBUG"
        & $global:MandA.Paths.Orchestrator @orchestratorParams
        if ($LASTEXITCODE -eq 0) { Write-MandALog "Orchestrator (Mode: $Mode) completed successfully." -Level "SUCCESS" }
        else { Write-MandALog "Orchestrator (Mode: $Mode) completed with Exit Code: $LASTEXITCODE. Check logs at '$($global:MandA.Paths.LogOutput)' for details." -Level "WARN" }
    } catch { Write-MandALog "Orchestrator invocation (Mode: $Mode) failed: $($_.Exception.Message)" -Level "ERROR"; if ($_.ScriptStackTrace) { Write-MandALog "Stack Trace: $($_.ScriptStackTrace)" -Level "DEBUG" } }
    Request-UserToContinueInternal
}

function Request-UserToContinueInternal { Write-Host "`nPress Enter to return to the menu..." -ForegroundColor Gray; Read-Host | Out-Null }

try {
    do {
        Show-MenuInternal
        $choice = Read-Host "Enter your choice"
        switch ($choice.ToUpper()) {
            '1' { try { & $global:MandA.Paths.AppRegScript } catch { Write-MandALog "Error AppReg: $($_.Exception.Message)" -Level "ERROR"}; Request-UserToContinueInternal }
            'F' { Invoke-OrchestratorInternal -Mode "Full" }
            'D' { Invoke-OrchestratorInternal -Mode "Discovery" }
            'P' { Invoke-OrchestratorInternal -Mode "Processing" }
            'E' { Invoke-OrchestratorInternal -Mode "Export" }
            'V' { try { & $global:MandA.Paths.ValidationScript } catch { Write-MandALog "Error Validation: $($_.Exception.Message)" -Level "ERROR"}; Request-UserToContinueInternal }
            'M' { try { Write-MandALog "Running Module Check with -AutoFix (Interactive)..." -Level "INFO"; & $global:MandA.Paths.ModuleCheckScript -AutoFix } catch { Write-MandALog "Error ModuleCheck: $($_.Exception.Message)" -Level "ERROR"}; Request-UserToContinueInternal }
            'T' { Invoke-OrchestratorInternal -Mode "Full" -ValidateOnlyFlag:$true } 
            'Q' { Write-MandALog "Exiting M&A Discovery Suite QuickStart." -Level "INFO" }
            default { Write-MandALog "Invalid choice." -Level "WARN"; Start-Sleep -Seconds 1 }
        }
    } while ($choice.ToUpper() -ne 'Q')
} catch { Write-Error "Unexpected error in QuickStart.ps1: $($_.Exception.Message)"; Write-Error "$($_.ScriptStackTrace)" }
finally { $ErrorActionPreference = $OriginalErrorActionPreferenceForQuickStart; Write-Host "QuickStart finished." -ForegroundColor DarkGray }
