<#
.SYNOPSIS
    Sets up the environment for the M&A Discovery Suite v4.2
.DESCRIPTION
    Establishes a single global context object ($global:MandA) containing
    all required paths and the loaded, validated configuration.
.NOTES
    Version: 3.0.0
    Author: Gemini
    Date: 2025-06-01
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$ProvidedSuiteRoot
)

# Temporarily set ErrorActionPreference for this script's core logic
$ErrorActionPreference = "Stop"

function Test-MandASuiteStructureInternal { # Renamed to avoid conflict if script is sourced multiple times
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
    if (-not [string]::IsNullOrWhiteSpace($ProvidedSuiteRoot)) {
        if (Test-MandASuiteStructureInternal -PathToTest $ProvidedSuiteRoot) {
            $SuiteRoot = Resolve-Path $ProvidedSuiteRoot | Select-Object -ExpandProperty Path
            $determinedBy = "parameter input ('$ProvidedSuiteRoot')"
        } else {
            throw "Provided SuiteRoot '$ProvidedSuiteRoot' is not a valid suite structure (missing Core, Modules, Scripts, or Configuration)."
        }
    } else {
        $defaultPath = "C:\UserMigration"
        if (Test-MandASuiteStructureInternal -PathToTest $defaultPath) {
            $SuiteRoot = Resolve-Path $defaultPath | Select-Object -ExpandProperty Path
            $determinedBy = "default path ('$defaultPath')"
        } else {
            # $PSScriptRoot is the directory of the script being run or sourced.
            # If this script (Set-SuiteEnvironment.ps1) is in 'Scripts', its parent is SuiteRoot.
            $autoDetectedPath = Split-Path $PSScriptRoot -Parent 
            if (Test-MandASuiteStructureInternal -PathToTest $autoDetectedPath) {
                $SuiteRoot = Resolve-Path $autoDetectedPath | Select-Object -ExpandProperty Path
                $determinedBy = "auto-detection relative to script location ('$autoDetectedPath')"
            } else {
                throw "CRITICAL: Could not determine a valid M&A Discovery Suite root path. Tried default '$defaultPath' and auto-detection from '$PSScriptRoot'."
            }
        }
    }
} catch {
    Write-Error "Failed to establish SuiteRoot: $($_.Exception.Message)"
    # Attempt to restore original ErrorActionPreference before exiting if this script is sourced
    $ErrorActionPreference = $global:DefaultErrorActionPreference # Or whatever it was
    return # or exit 1 if run directly
}


# --- Set Single Global Context Object ---
$configFilePath = Join-Path $SuiteRoot "Configuration/default-config.json"
$configSchemaPath = Join-Path $SuiteRoot "Configuration/config.schema.json" # Path to your new schema

if (-not (Test-Path $configFilePath -PathType Leaf)) {
    Write-Error "CRITICAL: Configuration file 'default-config.json' not found at expected location: '$configFilePath'"
    $ErrorActionPreference = $global:DefaultErrorActionPreference; return
}
if (-not (Test-Path $configSchemaPath -PathType Leaf)) {
    Write-Warning "Configuration schema 'config.schema.json' not found at '$configSchemaPath'. Runtime configuration validation will be skipped."
    # Allow to continue without schema for now, but log it.
}

$loadedConfig = $null
try {
    $loadedConfig = Get-Content $configFilePath -Raw | ConvertFrom-Json -ErrorAction Stop
} catch {
    Write-Error "CRITICAL: Failed to parse 'default-config.json': $($_.Exception.Message)"
    $ErrorActionPreference = $global:DefaultErrorActionPreference; return
}

# Convert PSCustomObject from ConvertFrom-Json to a nested Hashtable for easier manipulation if needed by other scripts
function ConvertTo-HashtableRecursive {
    param($obj)
    if ($obj -is [System.Management.Automation.PSCustomObject]) {
        $hash = @{}
        foreach ($prop in $obj.PSObject.Properties) {
            $hash[$prop.Name] = ConvertTo-HashtableRecursive $prop.Value
        }
        return $hash
    } elseif ($obj -is [array]) {
        return @($obj | ForEach-Object { ConvertTo-HashtableRecursive $_ })
    } else {
        return $obj
    }
}
$configHashtable = ConvertTo-HashtableRecursive $loadedConfig

# Define paths (many will be used by other scripts via $global:MandA.Paths)
$global:MandA = @{
    DeterminedBy = $determinedBy
    Config       = $configHashtable # Store the hashtable version
    Paths        = @{
        SuiteRoot       = $SuiteRoot
        Core            = Join-Path $SuiteRoot "Core"
        Configuration   = Join-Path $SuiteRoot "Configuration"
        Scripts         = Join-Path $SuiteRoot "Scripts"
        Modules         = Join-Path $SuiteRoot "Modules"
        Utilities       = Join-Path $SuiteRoot "Modules/Utilities" # Added for direct access
        Documentation   = Join-Path $SuiteRoot "Documentation"
        
        ConfigFile      = $configFilePath
        ConfigSchema    = $configSchemaPath
        CsvSchemas      = Join-Path $SuiteRoot "Configuration/csv.schemas.json"

        Orchestrator    = Join-Path $SuiteRoot "Core/MandA-Orchestrator.ps1"
        QuickStart      = Join-Path $SuiteRoot "Scripts/QuickStart.ps1"
        ValidationScript= Join-Path $SuiteRoot "Scripts/Validate-Installation.ps1" # Renamed for clarity
        AppRegScript    = Join-Path $SuiteRoot "Scripts/Setup-AppRegistration.ps1"  # Renamed for clarity
        ModuleCheckScript= Join-Path $SuiteRoot "Scripts/DiscoverySuiteModuleCheck.ps1" # Renamed for clarity
        
        RawDataOutput   = Join-Path $configHashtable.environment.outputPath "Raw"
        ProcessedDataOutput = Join-Path $configHashtable.environment.outputPath "Processed"
        LogOutput       = Join-Path $configHashtable.environment.outputPath "Logs"
        CredentialFile  = if ([System.IO.Path]::IsPathRooted($configHashtable.authentication.credentialStorePath)) { 
                                $configHashtable.authentication.credentialStorePath 
                          } else { 
                                Join-Path $SuiteRoot $configHashtable.authentication.credentialStorePath 
                          }
    }
}

# Attempt to load and use the ConfigurationValidation module
$configValidationModulePath = Join-Path $global:MandA.Paths.Utilities "ConfigurationValidation.psm1"
if (Test-Path $configValidationModulePath -PathType Leaf) {
    try {
        Import-Module $configValidationModulePath -Force -Global
        if (Get-Command Test-SuiteConfigurationAgainstSchema -ErrorAction SilentlyContinue) {
            $validationResult = Test-SuiteConfigurationAgainstSchema -ConfigurationObject $global:MandA.Config -SchemaPath $global:MandA.Paths.ConfigSchema
            if (-not $validationResult.IsValid) {
                Write-Warning "Configuration validation against schema failed. See previous errors. The suite might behave unexpectedly."
                # Decide if this should be a critical error:
                # throw "Configuration is invalid according to schema."
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


Write-Host "M&A Discovery Suite Environment Initialized (v4.2)" -ForegroundColor Cyan
Write-Host ("=" * 65) -ForegroundColor Cyan
Write-Host "Suite Root Path : $($global:MandA.Paths.SuiteRoot)" -ForegroundColor Green
Write-Host "Determined By   : $($global:MandA.DeterminedBy)" -ForegroundColor DarkGray
Write-Host "Config File     : $($global:MandA.Paths.ConfigFile)" -ForegroundColor White
Write-Host "Log Output Path : $($global:MandA.Paths.LogOutput)" -ForegroundColor White
Write-Host "Raw Data Path   : $($global:MandA.Paths.RawDataOutput)" -ForegroundColor White
Write-Host "Global context object `$global:MandA has been set." -ForegroundColor White
Write-Host ("-" * 65) -ForegroundColor Cyan

# Restore original ErrorActionPreference
$ErrorActionPreference = $global:DefaultErrorActionPreference
