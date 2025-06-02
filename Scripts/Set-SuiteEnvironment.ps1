<#
.SYNOPSIS
    Sets up the environment for the M&A Discovery Suite v4.2.
    Provides verbose on-screen feedback during execution.
.DESCRIPTION
    Establishes a single global context object ($global:MandA) containing
    all required paths and the loaded, validated configuration.
    Uses 'throw' for critical errors to halt calling scripts.
    Includes detailed Write-Host statements for tracing execution.
.NOTES
    Version: 3.0.4
    Author: Gemini & User
    Date: 2025-06-01
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$ProvidedSuiteRoot,

    [Parameter(Mandatory=$true)] # Make CompanyName mandatory for this script
    [string]$CompanyName
)

# Temporarily set ErrorActionPreference for this script's core logic
$OriginalErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = "Stop"

Write-Host "--- Initializing Set-SuiteEnvironment.ps1 (v3.0.4) ---" -ForegroundColor Cyan

function Test-MandASuiteStructureInternal {
    param([string]$PathToTest)
    $requiredSubDirs = @("Core", "Modules", "Scripts", "Configuration")
    if (-not (Test-Path $PathToTest -PathType Container)) { return $false }
    foreach ($subDir in $requiredSubDirs) {
        if (-not (Test-Path (Join-Path $PathToTest $subDir) -PathType Container)) { return $false }
    }
    return $true
}

$SuiteRoot = $null
$determinedBy = ""

try {
    Write-Host "Attempting to determine SuiteRoot..." -ForegroundColor Yellow
    if (-not [string]::IsNullOrWhiteSpace($ProvidedSuiteRoot)) {
        Write-Host "Parameter -ProvidedSuiteRoot ('$ProvidedSuiteRoot') is present. Validating..." -ForegroundColor Gray
        if (Test-MandASuiteStructureInternal -PathToTest $ProvidedSuiteRoot) {
            $SuiteRoot = Resolve-Path $ProvidedSuiteRoot | Select-Object -ExpandProperty Path
            $determinedBy = "parameter input ('$ProvidedSuiteRoot')"
            Write-Host "SuiteRoot set by parameter: $SuiteRoot" -ForegroundColor Green
        } else {
            throw "Provided SuiteRoot '$ProvidedSuiteRoot' is not a valid suite structure (missing Core, Modules, Scripts, or Configuration)."
        }
    } else {
        Write-Host "No -ProvidedSuiteRoot. Checking default path 'C:\UserMigration'..." -ForegroundColor Gray
        $defaultPath = "C:\UserMigration"
        if (Test-MandASuiteStructureInternal -PathToTest $defaultPath) {
            $SuiteRoot = Resolve-Path $defaultPath | Select-Object -ExpandProperty Path
            $determinedBy = "default path ('$defaultPath')"
            Write-Host "SuiteRoot set by default path: $SuiteRoot" -ForegroundColor Green
        } else {
            Write-Host "Default path '$defaultPath' is not a valid suite structure. Attempting auto-detection..." -ForegroundColor Gray
            $scriptBeingProcessedPath = $MyInvocation.MyCommand.Path
            if ([string]::IsNullOrWhiteSpace($scriptBeingProcessedPath)) {
                if ($PSScriptRoot) {
                    $scriptBeingProcessedPath = Join-Path $PSScriptRoot $MyInvocation.MyCommand.Name 
                    Write-Host "Auto-detecting based on PSScriptRoot of caller: '$PSScriptRoot' and script name '$($MyInvocation.MyCommand.Name)'" -ForegroundColor Gray
                } else {
                    throw "CRITICAL: Cannot determine the path of Set-SuiteEnvironment.ps1 for auto-detection of SuiteRoot. MyInvocation.MyCommand.Path and PSScriptRoot are problematic."
                }
            }
            Write-Host "Script being processed: $scriptBeingProcessedPath" -ForegroundColor DarkGray
            
            $scriptsDirCandidate = Split-Path $scriptBeingProcessedPath -Parent
            $autoDetectedPath = Split-Path $scriptsDirCandidate -Parent 
            Write-Host "Candidate Scripts Directory: $scriptsDirCandidate" -ForegroundColor DarkGray
            Write-Host "Candidate Auto-Detected SuiteRoot: $autoDetectedPath" -ForegroundColor DarkGray
            
            if ((Split-Path $scriptsDirCandidate -Leaf) -ne "Scripts") {
                 Write-Warning "Auto-detection warning: '$scriptBeingProcessedPath' does not appear to be in a 'Scripts' subdirectory. SuiteRoot detection might be incorrect if the structure is non-standard."
            }

            if (Test-MandASuiteStructureInternal -PathToTest $autoDetectedPath) {
                $SuiteRoot = Resolve-Path $autoDetectedPath | Select-Object -ExpandProperty Path
                $determinedBy = "auto-detection relative to script location ('$autoDetectedPath' from '$scriptBeingProcessedPath')"
                Write-Host "SuiteRoot set by auto-detection: $SuiteRoot" -ForegroundColor Green
            } else {
                throw "CRITICAL: Could not determine a valid M&A Discovery Suite root path. Tried default '$defaultPath' and auto-detection based on script path '$scriptBeingProcessedPath' (expected parent of 'Scripts' dir to be SuiteRoot: '$autoDetectedPath'). Ensure this script is in the 'Scripts' subdirectory of your suite."
            }
        }
    }
} catch {
    Write-Host "ERROR establishing SuiteRoot: $($_.Exception.Message)" -ForegroundColor Red
    $ErrorActionPreference = $OriginalErrorActionPreference
    throw # Re-throw to halt the calling script (QuickStart.ps1)
}

Write-Host "SuiteRoot successfully established: $SuiteRoot" -ForegroundColor Green

# --- Set Single Global Context Object ---
Write-Host "Loading and processing configuration file..." -ForegroundColor Yellow
$configFilePath = Join-Path $SuiteRoot "Configuration/default-config.json"
$configSchemaPath = Join-Path $SuiteRoot "Configuration/config.schema.json"

if (-not (Test-Path $configFilePath -PathType Leaf)) {
    $errorMessage = "CRITICAL: Configuration file 'default-config.json' not found at expected location: '$configFilePath'"
    Write-Host "ERROR: $errorMessage" -ForegroundColor Red
    $ErrorActionPreference = $OriginalErrorActionPreference
    throw $errorMessage 
}
Write-Host "Configuration file found: $configFilePath" -ForegroundColor Green

if (-not (Test-Path $configSchemaPath -PathType Leaf)) {
    Write-Host "WARNING: Configuration schema 'config.schema.json' not found at '$configSchemaPath'. Runtime configuration validation will be skipped." -ForegroundColor Yellow
} else {
    Write-Host "Configuration schema file found: $configSchemaPath" -ForegroundColor Green
}

$loadedConfig = $null
try {
    $loadedConfig = Get-Content $configFilePath -Raw | ConvertFrom-Json -ErrorAction Stop
    Write-Host "Configuration file parsed successfully." -ForegroundColor Green
} catch {
    $errorMessage = "CRITICAL: Failed to parse 'default-config.json': $($_.Exception.Message)"
    Write-Host "ERROR: $errorMessage" -ForegroundColor Red
    $ErrorActionPreference = $OriginalErrorActionPreference
    throw $errorMessage 
}

function ConvertTo-HashtableRecursiveInternal { 
    param($obj)
    if ($obj -is [System.Management.Automation.PSCustomObject]) {
        $hash = @{}
        foreach ($prop in $obj.PSObject.Properties) {
            $hash[$prop.Name] = ConvertTo-HashtableRecursiveInternal $prop.Value
        }
        return $hash
    } elseif ($obj -is [array]) {
        return @($obj | ForEach-Object { ConvertTo-HashtableRecursiveInternal $_ })
    } else {
        return $obj
    }
}
$configHashtable = ConvertTo-HashtableRecursiveInternal $loadedConfig
Write-Host "Configuration converted to Hashtable." -ForegroundColor DarkGray

# --- Start of new code block for dynamic paths ---
Write-Host "Constructing dynamic paths for Company: $CompanyName" -ForegroundColor Yellow

if ([string]::IsNullOrWhiteSpace($CompanyName)) {
    throw "CRITICAL: CompanyName parameter is missing or empty. Cannot construct company-specific paths."
}

$profilesBasePath = $configHashtable.environment.profilesBasePath
if ([string]::IsNullOrWhiteSpace($profilesBasePath)) {
    throw "CRITICAL: 'environment.profilesBasePath' is not defined in the configuration file '$configFilePath'."
}

$credentialFileName = $configHashtable.authentication.credentialFileName
if ([string]::IsNullOrWhiteSpace($credentialFileName)) {
    throw "CRITICAL: 'authentication.credentialFileName' is not defined in the configuration file '$configFilePath'."
}

$companyProfileRootPath = Join-Path $profilesBasePath $CompanyName
Write-Host "Company Profile Root Path: $companyProfileRootPath" -ForegroundColor DarkGray

# Define the new dynamic paths
$dynamicPaths = @{
    CompanyProfileRoot  = $companyProfileRootPath
    LogOutput           = Join-Path $companyProfileRootPath "Logs"
    RawDataOutput       = Join-Path $companyProfileRootPath "Raw"
    ProcessedDataOutput = Join-Path $companyProfileRootPath "Processed"
    CredentialFile      = Join-Path $companyProfileRootPath $credentialFileName
    # Add other company-specific paths here if needed in the future (e.g., Temp, Reports)
}

# Ensure company-specific directories exist
Write-Host "Ensuring company-specific directories exist..." -ForegroundColor Gray
if (-not (Test-Path $dynamicPaths.CompanyProfileRoot -PathType Container)) {
    New-Item -Path $dynamicPaths.CompanyProfileRoot -ItemType Directory -Force | Out-Null
    Write-Host "Created Company Profile Root: $($dynamicPaths.CompanyProfileRoot)" -ForegroundColor Green
}
if (-not (Test-Path $dynamicPaths.LogOutput -PathType Container)) {
    New-Item -Path $dynamicPaths.LogOutput -ItemType Directory -Force | Out-Null
    Write-Host "Created LogOutput: $($dynamicPaths.LogOutput)" -ForegroundColor Green
}
if (-not (Test-Path $dynamicPaths.RawDataOutput -PathType Container)) {
    New-Item -Path $dynamicPaths.RawDataOutput -ItemType Directory -Force | Out-Null
    Write-Host "Created RawDataOutput: $($dynamicPaths.RawDataOutput)" -ForegroundColor Green
}
if (-not (Test-Path $dynamicPaths.ProcessedDataOutput -PathType Container)) {
    New-Item -Path $dynamicPaths.ProcessedDataOutput -ItemType Directory -Force | Out-Null
    Write-Host "Created ProcessedDataOutput: $($dynamicPaths.ProcessedDataOutput)" -ForegroundColor Green
}
# --- End of new code block for dynamic paths ---

Write-Host "Setting up `$global:MandA context object..." -ForegroundColor Yellow

$staticPaths = @{
    SuiteRoot           = $SuiteRoot
    Core                = Join-Path $SuiteRoot "Core"
    Configuration       = Join-Path $SuiteRoot "Configuration"
    Scripts             = Join-Path $SuiteRoot "Scripts"
    Modules             = Join-Path $SuiteRoot "Modules"
    Utilities           = Join-Path $SuiteRoot "Modules/Utilities"
    Documentation       = Join-Path $SuiteRoot "Documentation"

    ConfigFile          = $configFilePath
    ConfigSchema        = $configSchemaPath
    CsvSchemas          = Join-Path $SuiteRoot "Configuration/csv.schemas.json"

    Orchestrator        = Join-Path $SuiteRoot "Core/MandA-Orchestrator.ps1"
    QuickStart          = Join-Path $SuiteRoot "Scripts/QuickStart.ps1"
    ValidationScript    = Join-Path $SuiteRoot "Scripts/Validate-Installation.ps1"
    AppRegScript        = Join-Path $SuiteRoot "Scripts/Setup-AppRegistration.ps1"
    ModuleCheckScript   = Join-Path $SuiteRoot "Scripts/DiscoverySuiteModuleCheck.ps1"
}

$global:MandA = @{
    DeterminedBy = $determinedBy
    Config       = $configHashtable
    Paths        = $staticPaths.Clone() # Start with static paths
}

# Add dynamic paths to the global context
$dynamicPaths.GetEnumerator() | ForEach-Object { $global:MandA.Paths[$_.Name] = $_.Value }

if ($null -ne $global:MandA -and $null -ne $global:MandA.Paths) {
    Write-Host "`$global:MandA.Paths initialized successfully." -ForegroundColor Green
} else {
    # This should ideally not be reached if earlier checks throw for critical missing pieces
    Write-Host "ERROR: Failed to initialize `$global:MandA.Paths correctly after all definitions." -ForegroundColor Red
    throw "Post-definition check: `$global:MandA or `$global:MandA.Paths is null."
}


# Attempt to load and use the ConfigurationValidation module
$configValidationModulePath = Join-Path $global:MandA.Paths.Utilities "ConfigurationValidation.psm1"
if (Test-Path $configValidationModulePath -PathType Leaf) {
    try {
        Import-Module $configValidationModulePath -Force -Global
        if (Get-Command Test-SuiteConfigurationAgainstSchema -ErrorAction SilentlyContinue) {
            Write-Host "INFO: Validating configuration against schema '$($global:MandA.Paths.ConfigSchema)'..." -ForegroundColor Gray
            $validationResult = Test-SuiteConfigurationAgainstSchema -ConfigurationObject $global:MandA.Config -SchemaPath $global:MandA.Paths.ConfigSchema
            if (-not $validationResult.IsValid) {
                Write-Warning "Configuration validation against schema failed. See previous errors. The suite might behave unexpectedly."
            } else {
                 Write-Host "INFO: Configuration successfully validated against schema." -ForegroundColor Green
            }
        } else {
            Write-Warning "Test-SuiteConfigurationAgainstSchema function not found after importing ConfigurationValidation.psm1."
        }
    } catch {
        Write-Warning "Failed to import or run ConfigurationValidation.psm1: $($_.Exception.Message)"
    }
} else {
    Write-Warning "ConfigurationValidation.psm1 not found at '$configValidationModulePath'. Runtime config schema validation skipped."
}

Write-Host "M&A Discovery Suite Environment Initialized (v3.0.4)" -ForegroundColor Cyan
Write-Host ("=" * 65) -ForegroundColor Cyan
Write-Host "Suite Root Path : $($global:MandA.Paths.SuiteRoot)" -ForegroundColor Green
Write-Host "Company Name    : $CompanyName" -ForegroundColor Yellow
Write-Host "Determined By   : $($global:MandA.DeterminedBy)" -ForegroundColor DarkGray
Write-Host "Config File     : $($global:MandA.Paths.ConfigFile)" -ForegroundColor White
Write-Host "Company Profile : $($global:MandA.Paths.CompanyProfileRoot)" -ForegroundColor White
Write-Host "Log Output Path : $($global:MandA.Paths.LogOutput)" -ForegroundColor White
Write-Host "Raw Data Path   : $($global:MandA.Paths.RawDataOutput)" -ForegroundColor White
Write-Host "Processed Data  : $($global:MandA.Paths.ProcessedDataOutput)" -ForegroundColor White
Write-Host "Credential File : $($global:MandA.Paths.CredentialFile)" -ForegroundColor White
Write-Host "Global context object `$global:MandA has been set." -ForegroundColor White
Write-Host ("-" * 65) -ForegroundColor Cyan

$ErrorActionPreference = $OriginalErrorActionPreference
