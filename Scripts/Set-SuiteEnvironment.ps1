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
    [string]$ProvidedSuiteRoot
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

# Validate presence of critical configuration values needed for path construction
if ($null -eq $configHashtable.environment -or [string]::IsNullOrWhiteSpace($configHashtable.environment.outputPath)) {
    $errorMessage = "CRITICAL: 'environment.outputPath' is missing or empty in '$configFilePath'. This is required to define output paths."
    Write-Host "ERROR: $errorMessage" -ForegroundColor Red
    $ErrorActionPreference = $OriginalErrorActionPreference
    throw $errorMessage
}
if ($null -eq $configHashtable.authentication -or [string]::IsNullOrWhiteSpace($configHashtable.authentication.credentialStorePath)) {
    Write-Host "WARNING: Configuration key 'authentication.credentialStorePath' is missing or empty in '$configFilePath'. A default path will be used." -ForegroundColor Yellow
}

# Define paths, ensuring base paths are valid before joining
$envOutputPath = $configHashtable.environment.outputPath 
if (-not ([System.IO.Path]::IsPathRooted($envOutputPath))) {
    $envOutputPath = Join-Path $SuiteRoot $envOutputPath
}
Write-Host "Resolved environment output path: $envOutputPath" -ForegroundColor DarkGray

try {
    if (-not (Test-Path $envOutputPath -PathType Container) -and -not (Test-Path (Split-Path $envOutputPath -Parent) -PathType Container)) {
        Write-Host "WARNING: The configured environment.outputPath (resolved to '$envOutputPath') or its parent does not exist. Directory creation will be attempted by consuming functions." -ForegroundColor Yellow
    }
} catch {
     Write-Host "WARNING: Could not validate environment.outputPath '$envOutputPath': $($_.Exception.Message)" -ForegroundColor Yellow
}


$credentialStorePathFromConfig = $configHashtable.authentication.credentialStorePath 
$resolvedCredentialPath = if (-not [string]::IsNullOrWhiteSpace($credentialStorePathFromConfig) -and [System.IO.Path]::IsPathRooted($credentialStorePathFromConfig)) { 
                                $credentialStorePathFromConfig 
                          } elseif (-not [string]::IsNullOrWhiteSpace($credentialStorePathFromConfig)) { 
                                Join-Path $SuiteRoot $credentialStorePathFromConfig 
                          } else {
                                Write-Warning "authentication.credentialStorePath was missing or empty. Defaulting to SuiteRoot/Output/credentials.config"
                                Join-Path $SuiteRoot "Output/credentials.config" 
                          }
Write-Host "Resolved credential file path: $resolvedCredentialPath" -ForegroundColor DarkGray

Write-Host "Setting up `$global:MandA context object..." -ForegroundColor Yellow
$global:MandA = @{
    DeterminedBy = $determinedBy
    Config       = $configHashtable 
    Paths        = @{
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
        QuickStart          = Join-Path $SuiteRoot "Scripts/QuickStart.ps1" # Path to QuickStart itself
        ValidationScript    = Join-Path $SuiteRoot "Scripts/Validate-Installation.ps1" 
        AppRegScript        = Join-Path $SuiteRoot "Scripts/Setup-AppRegistration.ps1"  
        ModuleCheckScript   = Join-Path $SuiteRoot "Scripts/DiscoverySuiteModuleCheck.ps1" 
        
        RawDataOutput       = Join-Path $envOutputPath "Raw"
        ProcessedDataOutput = Join-Path $envOutputPath "Processed"
        LogOutput           = Join-Path $envOutputPath "Logs"
        CredentialFile      = $resolvedCredentialPath
    }
}

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
Write-Host "Determined By   : $($global:MandA.DeterminedBy)" -ForegroundColor DarkGray
Write-Host "Config File     : $($global:MandA.Paths.ConfigFile)" -ForegroundColor White
Write-Host "Log Output Path : $($global:MandA.Paths.LogOutput)" -ForegroundColor White
Write-Host "Raw Data Path   : $($global:MandA.Paths.RawDataOutput)" -ForegroundColor White
Write-Host "Credential File : $($global:MandA.Paths.CredentialFile)" -ForegroundColor White
Write-Host "Global context object `$global:MandA has been set." -ForegroundColor White
Write-Host ("-" * 65) -ForegroundColor Cyan

$ErrorActionPreference = $OriginalErrorActionPreference
