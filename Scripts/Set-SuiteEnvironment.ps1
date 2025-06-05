#Requires -Version 5.1
<#
.SYNOPSIS
    Sets up the environment for the M&A Discovery Suite v5.1.
    Provides centralized path management, configuration loading, and global utilities.
.DESCRIPTION
    Establishes a single global context object ($global:MandA) containing
    all required paths, the loaded configuration, and essential global functions.
    This script is CRITICAL and MUST be sourced by QuickStart.ps1 before any other 
    suite operation, including invoking MandA-Orchestrator.ps1.
.PARAMETER ProvidedSuiteRoot
    Optional. Override the automatic suite root detection. Useful if running Set-SuiteEnvironment.ps1
    directly from a location different from its standard 'Scripts' directory.
.PARAMETER CompanyName
    Mandatory. The company name for profile-specific paths.
.NOTES
    Version: 5.1.0 (Added global Get-OrElse, robust pathing and config loading)
    CRITICAL: This must be sourced by ALL suite scripts before any operations.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$ProvidedSuiteRoot,

    [Parameter(Mandatory=$true)]
    [string]$CompanyName
)

# Script Initialization
$ErrorActionPreference = "Stop"
Write-Host "=== Initializing M&A Discovery Suite Environment v5.1.0 ===" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Gray

# --- Define Global Utility Functions ---
# Get-OrElse must be defined globally and early.
if (-not (Get-Command Get-OrElse -ErrorAction SilentlyContinue)) {
    function global:Get-OrElse {
        param($Value, $Default)
        if ($null -ne $Value) { return $Value } else { return $Default }
    }
    Write-Host "[Set-SuiteEnvironment] global:Get-OrElse defined." -ForegroundColor DarkGreen
}

# --- Internal Helper Functions ---
function Test-MandASuiteStructureInternal {
    param([string]$PathToTest)
    $requiredSubDirs = @("Core", "Modules", "Scripts", "Configuration")
    if (-not (Test-Path $PathToTest -PathType Container)) { return $false }
    foreach ($subDir in $requiredSubDirs) {
        if (-not (Test-Path (Join-Path $PathToTest $subDir) -PathType Container)) { return $false }
    }
    return $true
}

function ConvertTo-HashtableRecursiveInternal {
    param($InputObject)
    if ($null -eq $InputObject) { return $null }
    if ($InputObject -is [System.Collections.IEnumerable] -and $InputObject -isnot [string] -and $InputObject -isnot [hashtable]) {
        return ,@($InputObject | ForEach-Object { ConvertTo-HashtableRecursiveInternal $_ })
    }
    if ($InputObject -is [PSCustomObject]) {
        $hash = [ordered]@{} # Use ordered hashtable for better predictability
        $InputObject.PSObject.Properties | ForEach-Object { $hash[$_.Name] = ConvertTo-HashtableRecursiveInternal $_.Value }
        return $hash
    }
    return $InputObject
}

# --- Main Logic ---

# 1. Determine Suite Root
$determinedSuiteRoot = $null
$determinationMethod = ""

if (-not [string]::IsNullOrWhiteSpace($ProvidedSuiteRoot)) {
    if (Test-MandASuiteStructureInternal -PathToTest $ProvidedSuiteRoot) {
        $determinedSuiteRoot = Resolve-Path $ProvidedSuiteRoot | Select-Object -ExpandProperty Path
        $determinationMethod = "parameter '$ProvidedSuiteRoot'"
    } else {
        throw "Provided SuiteRoot '$ProvidedSuiteRoot' is invalid or does not have the required structure."
    }
} elseif ($PSScriptRoot) { # If script is sourced or run directly
    $parentOfScriptsDir = Split-Path $PSScriptRoot -Parent
    if (Test-MandASuiteStructureInternal -PathToTest $parentOfScriptsDir) {
        $determinedSuiteRoot = Resolve-Path $parentOfScriptsDir | Select-Object -ExpandProperty Path
        $determinationMethod = "auto-detection relative to PSScriptRoot '$PSScriptRoot'"
    }
}

# Fallback if PSScriptRoot isn't available (e.g., ISE non-script context) or structure check failed
if (-not $determinedSuiteRoot) {
    $potentialPathFromMyInvocation = Split-Path (Split-Path $MyInvocation.MyCommand.Path -Parent) -Parent
    if (Test-MandASuiteStructureInternal -PathToTest $potentialPathFromMyInvocation) {
        $determinedSuiteRoot = Resolve-Path $potentialPathFromMyInvocation | Select-Object -ExpandProperty Path
        $determinationMethod = "auto-detection relative to MyInvocation '$($MyInvocation.MyCommand.Path)'"
    } else {
        $defaultPath = "C:\UserMigration" # Last resort default, matching previous examples
        if (Test-MandASuiteStructureInternal -PathToTest $defaultPath) {
            $determinedSuiteRoot = $defaultPath
            $determinationMethod = "default path '$defaultPath'"
        } else {
            throw "CRITICAL: Cannot determine a valid SuiteRoot. Ensure the script is run from within the suite structure or a valid ProvidedSuiteRoot is given."
        }
    }
}
Write-Host "SuiteRoot established: $determinedSuiteRoot (via $determinationMethod)" -ForegroundColor Green

# 2. Validate CompanyName
if ([string]::IsNullOrWhiteSpace($CompanyName)) {
    throw "CRITICAL: CompanyName parameter is mandatory and cannot be empty."
}
$SanitizedCompanyName = $CompanyName -replace '[<>:"/\\|?*]', '_' # Sanitize for filesystem use

# 3. Load Configuration
$configFilePath = Join-Path $determinedSuiteRoot "Configuration\default-config.json"
if (-not (Test-Path $configFilePath -PathType Leaf)) {
    throw "CRITICAL: Configuration file 'default-config.json' not found at '$configFilePath'."
}
$loadedConfigContent = Get-Content $configFilePath -Raw | ConvertFrom-Json -ErrorAction Stop
if ($null -eq $loadedConfigContent) {
    throw "CRITICAL: Failed to parse configuration file '$configFilePath'."
}
$configurationHashtable = ConvertTo-HashtableRecursiveInternal -InputObject $loadedConfigContent
Write-Host "Configuration loaded successfully from '$configFilePath'" -ForegroundColor Green

# Ensure critical config sections exist
if (-not $configurationHashtable.environment -or -not $configurationHashtable.authentication -or -not $configurationHashtable.discovery -or -not $configurationHashtable.processing -or -not $configurationHashtable.export -or -not $configurationHashtable.metadata) {
    throw "CRITICAL: Configuration file is missing one or more root sections (metadata, environment, authentication, discovery, processing, export)."
}

# 4. Define Paths (Company-Specific and General)
$profilesBasePath = $configurationHashtable.environment.profilesBasePath | Get-OrElse "C:\MandADiscovery\Profiles"
if (-not ([System.IO.Path]::IsPathRooted($profilesBasePath))) {
    $profilesBasePath = Join-Path $determinedSuiteRoot $profilesBasePath | Resolve-Path -ErrorAction SilentlyContinue
    if (-not $profilesBasePath) { throw "Could not resolve relative profilesBasePath: $($configurationHashtable.environment.profilesBasePath)"}
}
$companyProfileRootPath = Join-Path $profilesBasePath $SanitizedCompanyName

$resolvedPaths = @{
    SuiteRoot           = $determinedSuiteRoot
    Core                = Join-Path $determinedSuiteRoot "Core"
    Modules             = Join-Path $determinedSuiteRoot "Modules"
    Scripts             = Join-Path $determinedSuiteRoot "Scripts"
    ConfigurationDir    = Join-Path $determinedSuiteRoot "Configuration" # Renamed from Configuration to avoid clash
    Documentation       = Join-Path $determinedSuiteRoot "Documentation"
    
    Utilities           = Join-Path $determinedSuiteRoot "Modules\Utilities"
    Discovery           = Join-Path $determinedSuiteRoot "Modules\Discovery"
    Processing          = Join-Path $determinedSuiteRoot "Modules\Processing"
    Export              = Join-Path $determinedSuiteRoot "Modules\Export"
    Authentication      = Join-Path $determinedSuiteRoot "Modules\Authentication"
    Connectivity        = Join-Path $determinedSuiteRoot "Modules\Connectivity"

    ProfilesBasePath    = $profilesBasePath
    CompanyProfileRoot  = $companyProfileRootPath
    LogOutput           = Join-Path $companyProfileRootPath "Logs"
    RawDataOutput       = Join-Path $companyProfileRootPath "Raw"
    ProcessedDataOutput = Join-Path $companyProfileRootPath "Processed"
    ExportOutput        = Join-Path $companyProfileRootPath "Exports"
    TempPath            = Join-Path $companyProfileRootPath "Temp"
    CredentialFile      = Join-Path $companyProfileRootPath ($configurationHashtable.authentication.credentialFileName | Get-OrElse "credentials.config")
    
    ConfigFile          = $configFilePath
    ConfigSchema        = Join-Path $determinedSuiteRoot "Configuration\config.schema.json"
    
    QuickStartScript    = Join-Path $determinedSuiteRoot "QuickStart.ps1" # Path to QuickStart.ps1 itself
    OrchestratorScript  = Join-Path $determinedSuiteRoot "Core\MandA-Orchestrator.ps1"
    ModuleCheckScript   = Join-Path $determinedSuiteRoot "Scripts\DiscoverySuiteModuleCheck.ps1"
    AppRegScript        = Join-Path $determinedSuiteRoot "Scripts\Setup-AppRegistration.ps1"
    ValidationScript    = Join-Path $determinedSuiteRoot "Scripts\Validate-Installation.ps1"
}

# 5. Initialize or Update $global:MandA
if ($null -eq $global:MandA) { $global:MandA = @{} }

$global:MandA.Version             = $configurationHashtable.metadata.version | Get-OrElse "5.1.0" # Use config version
$global:MandA.SuiteRoot           = $determinedSuiteRoot # For modules that might look here directly (legacy or simplicity)
$global:MandA.CompanyName         = $SanitizedCompanyName
$global:MandA.Config              = $configurationHashtable # Store the fully processed hashtable config
$global:MandA.Paths               = $resolvedPaths
$global:MandA.Initialized         = $true # Flag to indicate Set-SuiteEnvironment has run successfully
$global:MandA.ModulesChecked      = $false
$global:MandA.LoggingInitialized  = $false
$global:MandA.ConnectionStatus    = @{ Credentials = $false; AzureAD = $false; Exchange = $false; SharePoint = $false; Teams = $false }

# Update specific config values with resolved paths
$global:MandA.Config.environment.outputPath = $resolvedPaths.CompanyProfileRoot
$global:MandA.Config.environment.tempPath = $resolvedPaths.TempPath
# Ensure credentialStorePath in config is the fully resolved company-specific path
$global:MandA.Config.authentication.credentialStorePath = $resolvedPaths.CredentialFile

# 6. Create Company-Specific Directories
Write-Host "Creating company profile directories for '$SanitizedCompanyName' if they don't exist..." -ForegroundColor Yellow
$dirsToCreate = @(
    $resolvedPaths.CompanyProfileRoot, $resolvedPaths.LogOutput, $resolvedPaths.RawDataOutput,
    $resolvedPaths.ProcessedDataOutput, $resolvedPaths.ExportOutput, $resolvedPaths.TempPath
)
foreach ($dirToCreate in $dirsToCreate) {
    if (-not (Test-Path $dirToCreate -PathType Container)) {
        try {
            New-Item -Path $dirToCreate -ItemType Directory -Force -ErrorAction Stop | Out-Null
            Write-Host "  Created: $dirToCreate" -ForegroundColor Green
        } catch {
            Write-Warning "Could not create directory: $dirToCreate - $($_.Exception.Message)"
            # Decide if this is a critical failure
        }
    }
}

# 7. Early Load Critical Utilities (like Logging)
# This helps if subsequent functions in this script need Write-MandALog
$criticalUtilModules = @("EnhancedLogging.psm1", "ErrorHandling.psm1") 
# Note: FileOperations might be needed by EnhancedLogging if it archives logs etc.
# For now, keep it minimal for initial logging setup.

Write-Host "Attempting to load critical utility modules for Set-SuiteEnvironment..." -ForegroundColor DarkCyan
foreach ($utilModuleFile in $criticalUtilModules) {
    $utilModulePath = Join-Path $resolvedPaths.Utilities $utilModuleFile
    if (Test-Path $utilModulePath) {
        try {
            Import-Module $utilModulePath -Force -Global -ErrorAction Stop
            Write-Host "  Successfully loaded utility: $utilModuleFile" -ForegroundColor DarkGreen
        } catch {
            Write-Warning "  Failed to load critical utility '$utilModuleFile' from '$utilModulePath': $($_.Exception.Message). Some Set-SuiteEnvironment logging might be basic."
        }
    } else {
        Write-Warning "  Critical utility module '$utilModuleFile' not found at '$utilModulePath'. Basic logging will be used."
    }
}

# 8. Initialize Logging System
# Must happen after $global:MandA.Config and Paths are set.
if (Get-Command Initialize-Logging -ErrorAction SilentlyContinue) {
    try {
        $global:MandA.Config.environment.logPath = $resolvedPaths.LogOutput # Ensure logPath in config uses resolved path
        Initialize-Logging -Configuration $global:MandA.Config
        $global:MandA.LoggingInitialized = $true
        Write-MandALog "Logging initialized by Set-SuiteEnvironment. Log file: $($global:MandA.Config.environment.logPath)" -Level INFO
    } catch {
        Write-Warning "Failed to initialize logging via Initialize-Logging: $($_.Exception.Message). Check EnhancedLogging.psm1 and config."
    }
} else {
    Write-Warning "Initialize-Logging command not found. Enhanced logging will not be available from Set-SuiteEnvironment."
}

# Final Summary from Set-SuiteEnvironment
Write-MandALog "M&A Discovery Suite Environment Initialized by Set-SuiteEnvironment.ps1" -Level "SUCCESS"
Write-MandALog "  Company: $SanitizedCompanyName" -Level "INFO"
Write-MandALog "  Suite Root: $determinedSuiteRoot" -Level "INFO"
Write-MandALog "  Profile Root: $($resolvedPaths.CompanyProfileRoot)" -Level "INFO"
Write-MandALog "  Global context `$global:MandA` is now available." -Level "INFO"
Write-Host ""
