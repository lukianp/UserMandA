<#
.SYNOPSIS
    Sets up the environment for the M&A Discovery Suite v4.2
.DESCRIPTION
    Establishes a single global context object ($global:MandA) containing
    all required paths and the loaded, validated configuration.
    Uses 'throw' for critical errors to halt calling scripts.
.NOTES
    Version: 3.0.1
    Author: Gemini
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
            $currentScriptPath = $null
            if ($MyInvocation.MyCommand.CommandType -eq 'ExternalScript') {
                $currentScriptPath = $MyInvocation.MyCommand.Path
            } elseif ($PSScriptRoot) { # Fallback for when sourced or in ISE
                $currentScriptPath = Join-Path $PSScriptRoot $MyInvocation.MyCommand.Name
            } else {
                 throw "CRITICAL: Cannot determine PSScriptRoot or MyInvocation.MyCommand.Path to auto-detect SuiteRoot."
            }
            $autoDetectedPath = Split-Path (Split-Path $currentScriptPath -Parent) -Parent # Assumes Set-SuiteEnvironment.ps1 is in Scripts directory
            
            if (Test-MandASuiteStructureInternal -PathToTest $autoDetectedPath) {
                $SuiteRoot = Resolve-Path $autoDetectedPath | Select-Object -ExpandProperty Path
                $determinedBy = "auto-detection relative to script location ('$autoDetectedPath')"
            } else {
                throw "CRITICAL: Could not determine a valid M&A Discovery Suite root path. Tried default '$defaultPath' and auto-detection based on '$currentScriptPath'."
            }
        }
    }
} catch {
    Write-Error "Failed to establish SuiteRoot: $($_.Exception.Message)"
    $ErrorActionPreference = $OriginalErrorActionPreference
    throw # Re-throw to halt the calling script (QuickStart.ps1)
}


# --- Set Single Global Context Object ---
$configFilePath = Join-Path $SuiteRoot "Configuration/default-config.json"
$configSchemaPath = Join-Path $SuiteRoot "Configuration/config.schema.json"

if (-not (Test-Path $configFilePath -PathType Leaf)) {
    $errorMessage = "CRITICAL: Configuration file 'default-config.json' not found at expected location: '$configFilePath'"
    Write-Error $errorMessage
    $ErrorActionPreference = $OriginalErrorActionPreference
    throw $errorMessage # Halt execution
}
# Schema path check is less critical; validation can be skipped if schema is missing.
if (-not (Test-Path $configSchemaPath -PathType Leaf)) {
    Write-Warning "Configuration schema 'config.schema.json' not found at '$configSchemaPath'. Runtime configuration validation will be skipped."
}

$loadedConfig = $null
try {
    $loadedConfig = Get-Content $configFilePath -Raw | ConvertFrom-Json -ErrorAction Stop
} catch {
    $errorMessage = "CRITICAL: Failed to parse 'default-config.json': $($_.Exception.Message)"
    Write-Error $errorMessage
    $ErrorActionPreference = $OriginalErrorActionPreference
    throw $errorMessage # Halt execution
}

function ConvertTo-HashtableRecursiveInternal { # Renamed for clarity
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

# Define paths
$credentialStorePathFromConfig = $configHashtable.authentication.credentialStorePath
$resolvedCredentialPath = if (-not [string]::IsNullOrWhiteSpace($credentialStorePathFromConfig) -and [System.IO.Path]::IsPathRooted($credentialStorePathFromConfig)) { 
                                $credentialStorePathFromConfig 
                          } elseif (-not [string]::IsNullOrWhiteSpace($credentialStorePathFromConfig)) { 
                                Join-Path $SuiteRoot $credentialStorePathFromConfig 
                          } else {
                                Write-Warning "authentication.credentialStorePath is missing or empty in config. Defaulting to a path under SuiteRoot/Output."
                                Join-Path $SuiteRoot "Output/credentials.config" # Fallback if not specified
                          }

$global:MandA = @{
    DeterminedBy = $determinedBy
    Config       = $configHashtable 
    Paths        = @{
        SuiteRoot       = $SuiteRoot
        Core            = Join-Path $SuiteRoot "Core"
        Configuration   = Join-Path $SuiteRoot "Configuration"
        Scripts         = Join-Path $SuiteRoot "Scripts"
        Modules         = Join-Path $SuiteRoot "Modules"
        Utilities       = Join-Path $SuiteRoot "Modules/Utilities" 
        Documentation   = Join-Path $SuiteRoot "Documentation"
        
        ConfigFile      = $configFilePath
        ConfigSchema    = $configSchemaPath
        CsvSchemas      = Join-Path $SuiteRoot "Configuration/csv.schemas.json"

        Orchestrator    = Join-Path $SuiteRoot "Core/MandA-Orchestrator.ps1"
        QuickStart      = Join-Path $SuiteRoot "Scripts/QuickStart.ps1"
        ValidationScript= Join-Path $SuiteRoot "Scripts/Validate-Installation.ps1" 
        AppRegScript    = Join-Path $SuiteRoot "Scripts/Setup-AppRegistration.ps1"  
        ModuleCheckScript= Join-Path $SuiteRoot "Scripts/DiscoverySuiteModuleCheck.ps1" 
        
        RawDataOutput   = Join-Path $configHashtable.environment.outputPath "Raw"
        ProcessedDataOutput = Join-Path $configHashtable.environment.outputPath "Processed"
        LogOutput       = Join-Path $configHashtable.environment.outputPath "Logs"
        CredentialFile  = $resolvedCredentialPath
    }
}

# Attempt to load and use the ConfigurationValidation module
$configValidationModulePath = Join-Path $global:MandA.Paths.Utilities "ConfigurationValidation.psm1"
if (Test-Path $configValidationModulePath -PathType Leaf) {
    try {
        Import-Module $configValidationModulePath -Force -Global
        if (Get-Command Test-SuiteConfigurationAgainstSchema -ErrorAction SilentlyContinue) {
            # Use Write-Host for direct feedback during this setup phase, as Write-MandALog might not be fully available yet
            Write-Host "INFO: Validating configuration against schema..." -ForegroundColor Gray
            $validationResult = Test-SuiteConfigurationAgainstSchema -ConfigurationObject $global:MandA.Config -SchemaPath $global:MandA.Paths.ConfigSchema
            if (-not $validationResult.IsValid) {
                Write-Warning "Configuration validation against schema failed. See previous errors. The suite might behave unexpectedly."
                # Consider if this should be a 'throw' for critical environments
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

Write-Host "M&A Discovery Suite Environment Initialized (v4.2)" -ForegroundColor Cyan
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
