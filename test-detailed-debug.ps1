# Test script to debug the detailed path construction
param(
    [string]$CompanyName = "Zedra"
)

$ErrorActionPreference = "Stop"

# Define Get-OrElse function
function global:Get-OrElse {
    param($Value, $Default)
    Write-Host "Get-OrElse called with Value: '$Value', Default: '$Default'" -ForegroundColor Magenta
    if ($null -ne $Value) { 
        Write-Host "Returning Value: '$Value'" -ForegroundColor Green
        return $Value 
    } else { 
        Write-Host "Returning Default: '$Default'" -ForegroundColor Yellow
        return $Default 
    }
}

# Determine Suite Root
$SuiteRoot = $PSScriptRoot
Write-Host "SuiteRoot: $SuiteRoot" -ForegroundColor Green

# Load configuration
$configFilePath = Join-Path $SuiteRoot "Configuration\default-config.json"
$jsonContent = Get-Content $configFilePath -Raw -Encoding UTF8
$configContent = $jsonContent | ConvertFrom-Json

# Convert to hashtable (simplified version)
function ConvertTo-HashtableRecursiveSSE {
    param($InputObject)
    
    if ($null -eq $InputObject) {
        return $null
    }
    
    # Handle PSCustomObject - convert to hashtable
    if ($InputObject -is [PSCustomObject]) {
        $hash = @{}
        foreach ($property in $InputObject.PSObject.Properties) {
            $hash[$property.Name] = ConvertTo-HashtableRecursiveSSE $property.Value
        }
        return $hash
    }
    
    # Return all other types as-is
    return $InputObject
}

$configurationHashtable = ConvertTo-HashtableRecursiveSSE -InputObject $configContent

# Test path construction step by step
Write-Host "`n=== Testing Path Construction ===" -ForegroundColor Cyan

# Test profilesBasePath
Write-Host "`nTesting profilesBasePath:" -ForegroundColor Yellow
$profilesBasePath = global:Get-OrElse $configurationHashtable.environment.profilesBasePath "C:\MandADiscovery\Profiles"
Write-Host "Final profilesBasePath: '$profilesBasePath'" -ForegroundColor Green

# Test companyProfileRootPath
$companyProfileRootPath = Join-Path $profilesBasePath $CompanyName
Write-Host "companyProfileRootPath: '$companyProfileRootPath'" -ForegroundColor Green

# Test credentialFileName
Write-Host "`nTesting credentialFileName:" -ForegroundColor Yellow
$credentialFileName = global:Get-OrElse $configurationHashtable.authentication.credentialFileName "credentials.config"
Write-Host "Final credentialFileName: '$credentialFileName'" -ForegroundColor Green

# Test CredentialFile path
$credentialFile = Join-Path $companyProfileRootPath $credentialFileName
Write-Host "Final CredentialFile: '$credentialFile'" -ForegroundColor Green

# Test OrchestratorScript path
$orchestratorScript = Join-Path $SuiteRoot "Core\MandA-Orchestrator.ps1"
Write-Host "OrchestratorScript: '$orchestratorScript'" -ForegroundColor Green

# Test if orchestrator exists
if (Test-Path $orchestratorScript) {
    Write-Host "OrchestratorScript file EXISTS" -ForegroundColor Green
} else {
    Write-Host "OrchestratorScript file does NOT exist" -ForegroundColor Red
}

# Create the resolvedPaths hashtable manually
$resolvedPaths = @{
    SuiteRoot           = $SuiteRoot
    Core                = Join-Path $SuiteRoot "Core"
    Modules             = Join-Path $SuiteRoot "Modules"
    Scripts             = Join-Path $SuiteRoot "Scripts"
    Configuration       = Join-Path $SuiteRoot "Configuration"
    Documentation       = Join-Path $SuiteRoot "Documentation"
    Utilities           = Join-Path $SuiteRoot "Modules\Utilities"
    Discovery           = Join-Path $SuiteRoot "Modules\Discovery"
    Processing          = Join-Path $SuiteRoot "Modules\Processing"
    Export              = Join-Path $SuiteRoot "Modules\Export"
    Authentication      = Join-Path $SuiteRoot "Modules\Authentication"
    Connectivity        = Join-Path $SuiteRoot "Modules\Connectivity"
    ProfilesBasePath    = $profilesBasePath
    CompanyProfileRoot  = $companyProfileRootPath
    LogOutput           = Join-Path $companyProfileRootPath "Logs"
    RawDataOutput       = Join-Path $companyProfileRootPath "Raw"
    ProcessedDataOutput = Join-Path $companyProfileRootPath "Processed"
    ExportOutput        = Join-Path $companyProfileRootPath "Exports"
    TempPath            = Join-Path $companyProfileRootPath "Temp"
    CredentialFile      = $credentialFile
    ConfigFile          = $configFilePath
    ConfigSchema        = Join-Path $SuiteRoot "Configuration\config.schema.json"
    QuickStartScript    = Join-Path $SuiteRoot "QuickStart.ps1" 
    OrchestratorScript  = $orchestratorScript
    ModuleCheckScript   = Join-Path $SuiteRoot "Scripts\DiscoverySuiteModuleCheck.ps1"
    AppRegScript        = Join-Path $SuiteRoot "Scripts\Setup-AppRegistration.ps1" 
    ValidationScript    = Join-Path $SuiteRoot "Scripts\Validate-Installation.ps1"
}

Write-Host "`n=== Resolved Paths ===" -ForegroundColor Cyan
Write-Host "CredentialFile: '$($resolvedPaths.CredentialFile)'" -ForegroundColor Yellow
Write-Host "OrchestratorScript: '$($resolvedPaths.OrchestratorScript)'" -ForegroundColor Yellow
Write-Host "ConfigFile: '$($resolvedPaths.ConfigFile)'" -ForegroundColor Yellow

# Test global MandA assignment
$global:MandA = @{}
$global:MandA.Paths = $resolvedPaths

Write-Host "`n=== After Assignment ===" -ForegroundColor Cyan
Write-Host "global:MandA.Paths.CredentialFile: '$($global:MandA.Paths.CredentialFile)'" -ForegroundColor Yellow
Write-Host "global:MandA.Paths.OrchestratorScript: '$($global:MandA.Paths.OrchestratorScript)'" -ForegroundColor Yellow
Write-Host "global:MandA.Paths.ConfigFile: '$($global:MandA.Paths.ConfigFile)'" -ForegroundColor Yellow