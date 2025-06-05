#Requires -Version 5.1
<#
.SYNOPSIS
    Sets up the environment for the M&A Discovery Suite v5.2.0.
    Provides centralized path management, configuration loading, and global utilities.
.DESCRIPTION
    Establishes a single global context object ($global:MandA) containing
    all required paths, the loaded configuration, and essential global functions like Get-OrElse.
    This script is CRITICAL and MUST be sourced by QuickStart.ps1 before any other 
    suite operation, including invoking MandA-Orchestrator.ps1.
    It ensures that critical helper functions and type data modifications are available globally.
    This version fixes the path key for the Configuration directory to be 'Configuration' instead of 'ConfigurationDir'.
.PARAMETER ProvidedSuiteRoot
    Optional. Override the automatic suite root detection. Useful if running Set-SuiteEnvironment.ps1
    directly from a location different from its standard 'Scripts' directory.
.PARAMETER CompanyName
    Mandatory. The company name for profile-specific paths.
.NOTES
    Version: 5.2.1
    Change Log:
    - FAULT 1 FIX: Correctly clear $global:MandA if it exists and is a Hashtable, or re-initialize.
    - Ensured Get-OrElse and HashtableContains are defined early and globally.
    - Standardized ConvertTo-HashtableRecursiveSSE to produce standard hashtables.
    - Added more robust error handling for critical path and configuration loading.
    - Enhanced logging for initialization steps.
    - Ensured script outputs confirm its successful execution if verbose.
    - Improved validation of default-config.json structure for essential root sections.
    - Corrected Configuration directory path key from 'ConfigurationDir' to 'Configuration'.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$ProvidedSuiteRoot,

    [Parameter(Mandatory=$true)]
    [string]$CompanyName
)

# --- Script Initialization & Global Utilities ---
$ErrorActionPreference = "Stop" # Ensures script halts on unexpected errors
Write-Host "=== [Set-SuiteEnvironment.ps1 v5.2.1] Initializing M&A Discovery Suite Environment ===" -ForegroundColor Cyan
Write-Host "[Set-SuiteEnvironment] Timestamp: $(Get-Date)" -ForegroundColor Gray

# Define Get-OrElse globally IF it doesn't exist. Critical for many modules and scripts.
if (-not (Get-Command global:Get-OrElse -ErrorAction SilentlyContinue)) {
    function global:Get-OrElse {
        param($Value, $Default)
        if ($null -ne $Value) { return $Value } else { return $Default }
    }
    Write-Host "[Set-SuiteEnvironment] Function 'global:Get-OrElse' has been defined." -ForegroundColor DarkGreen
}

# Add HashtableContains to the type data for hashtables if not already present.
$testHashtableInstance = @{}
if (-not ($testHashtableInstance.PSObject.Methods.Name -contains 'HashtableContains')) {
    try {
        Update-TypeData -TypeName System.Collections.Hashtable -MemberName HashtableContains -MemberType ScriptMethod -Value { param([string]$KeyToTest) return $this.ContainsKey($KeyToTest) } -Force -ErrorAction Stop
        Write-Host "[Set-SuiteEnvironment] Successfully added 'HashtableContains' method to System.Collections.Hashtable." -ForegroundColor DarkGreen
    } catch {
        Write-Warning "[Set-SuiteEnvironment] Error adding 'HashtableContains' method to Hashtable: $($_.Exception.Message)"
    }
} else {
    Write-Host "[Set-SuiteEnvironment] 'HashtableContains' method already exists on System.Collections.Hashtable." -ForegroundColor Gray
}


# --- Internal Helper Functions ---
function Test-MandASuiteStructureInternal {
    param([string]$PathToTest)
    if ([string]::IsNullOrWhiteSpace($PathToTest)) { return $false }
    $requiredSubDirs = @("Core", "Modules", "Scripts", "Configuration")
    if (-not (Test-Path $PathToTest -PathType Container)) { return $false }
    foreach ($subDir in $requiredSubDirs) {
        if (-not (Test-Path (Join-Path $PathToTest $subDir) -PathType Container)) { return $false }
    }
    return $true
}

function ConvertTo-HashtableRecursiveSSE { 
    param($InputObject)
    if ($null -eq $InputObject) { return $null }
    if ($InputObject -is [System.Collections.IEnumerable] -and $InputObject -isnot [string] -and $InputObject -isnot [hashtable]) {
        return ,@($InputObject | ForEach-Object { ConvertTo-HashtableRecursiveSSE $_ })
    }
    if ($InputObject -is [PSCustomObject]) {
        $hash = @{} 
        $InputObject.PSObject.Properties | ForEach-Object { $hash[$_.Name] = ConvertTo-HashtableRecursiveSSE $_.Value }
        return $hash
    }
    return $InputObject
}

# --- Main Logic ---

# 1. Determine Suite Root
Write-Host "[Set-SuiteEnvironment] Determining Suite Root..." -ForegroundColor Yellow
$determinedSuiteRoot = $null
$determinationMethod = ""

if (-not [string]::IsNullOrWhiteSpace($ProvidedSuiteRoot)) {
    if (Test-MandASuiteStructureInternal -PathToTest $ProvidedSuiteRoot) {
        $determinedSuiteRoot = Resolve-Path $ProvidedSuiteRoot | Select-Object -ExpandProperty Path
        $determinationMethod = "parameter '$ProvidedSuiteRoot'"
    } else {
        throw "Provided SuiteRoot '$ProvidedSuiteRoot' is invalid or does not have the required structure (Core, Modules, Scripts, Configuration subdirectories)."
    }
} elseif ($PSScriptRoot) {
    $parentOfScriptsDir = Split-Path $PSScriptRoot -Parent
    if (Test-MandASuiteStructureInternal -PathToTest $parentOfScriptsDir) {
        $determinedSuiteRoot = Resolve-Path $parentOfScriptsDir | Select-Object -ExpandProperty Path
        $determinationMethod = "auto-detection relative to PSScriptRoot '$PSScriptRoot'"
    }
}

if (-not $determinedSuiteRoot) {
    $scriptFileDir = Split-Path $MyInvocation.MyCommand.Path -Parent
    $potentialPathFromMyInvocation = Split-Path $scriptFileDir -Parent
    if (Test-MandASuiteStructureInternal -PathToTest $potentialPathFromMyInvocation) {
        $determinedSuiteRoot = Resolve-Path $potentialPathFromMyInvocation | Select-Object -ExpandProperty Path
        $determinationMethod = "auto-detection relative to MyInvocation '$($MyInvocation.MyCommand.Path)'"
    } else {
        $currentLocationParent = Split-Path (Get-Location).Path -Parent
        if (Test-MandASuiteStructureInternal -PathToTest $currentLocationParent) {
            $determinedSuiteRoot = Resolve-Path $currentLocationParent | Select-Object -ExpandProperty Path
            $determinationMethod = "auto-detection relative to current location's parent '$determinedSuiteRoot'"
        } else {
            throw "CRITICAL: Cannot determine a valid SuiteRoot. Structure check failed for all attempts. Ensure 'Core', 'Modules', 'Scripts', 'Configuration' subdirectories exist under the suite's root."
        }
    }
}
Write-Host "[Set-SuiteEnvironment] SuiteRoot established: $determinedSuiteRoot (via $determinationMethod)" -ForegroundColor Green

# 2. Validate CompanyName
if ([string]::IsNullOrWhiteSpace($CompanyName)) {
    throw "CRITICAL: CompanyName parameter is mandatory and cannot be empty for Set-SuiteEnvironment.ps1."
}
$SanitizedCompanyName = $CompanyName -replace '[<>:"/\\|?*]', '_'
Write-Host "[Set-SuiteEnvironment] Operating for Company: '$SanitizedCompanyName'" -ForegroundColor Cyan

# 3. Load Configuration from default-config.json
$configFilePath = Join-Path $determinedSuiteRoot "Configuration\default-config.json"
if (-not (Test-Path $configFilePath -PathType Leaf)) {
    throw "CRITICAL: Configuration file 'default-config.json' not found at '$configFilePath'."
}

$configContent = $null
try {
    $configContent = Get-Content $configFilePath -Raw | ConvertFrom-Json -ErrorAction Stop
} catch {
    throw "CRITICAL: Failed to parse configuration file '$configFilePath'. Content might be invalid JSON. Error: $($_.Exception.Message)"
}

if ($null -eq $configContent) {
    throw "CRITICAL: Parsed configuration content is null from '$configFilePath'."
}
$configurationHashtable = ConvertTo-HashtableRecursiveSSE -InputObject $configContent
Write-Host "[Set-SuiteEnvironment] Configuration loaded from '$configFilePath'" -ForegroundColor Green

$requiredRootSections = @("metadata", "environment", "authentication", "discovery", "processing", "export")
foreach ($sectionName in $requiredRootSections) {
    if (-not $configurationHashtable.HashtableContains($sectionName)) { 
        throw "CRITICAL: Configuration file '$configFilePath' is missing the essential root section: '$sectionName'."
    }
    if (-not ($configurationHashtable[$sectionName] -is [hashtable])) {
        throw "CRITICAL: Configuration file '$configFilePath' section '$sectionName' is not a valid object (should be a hashtable)."
    }
}
Write-Host "[Set-SuiteEnvironment] Essential root sections in configuration validated." -ForegroundColor Green

if (-not $configurationHashtable.metadata.HashtableContains('companyName') -or [string]::IsNullOrWhiteSpace($configurationHashtable.metadata.companyName)) {
    Write-Warning "[Set-SuiteEnvironment] companyName not found or empty in config metadata. Setting from parameter: '$SanitizedCompanyName'."
    $configurationHashtable.metadata.companyName = $SanitizedCompanyName
} elseif ($configurationHashtable.metadata.companyName -ne $SanitizedCompanyName) {
     Write-Warning "[Set-SuiteEnvironment] companyName in config ('$($configurationHashtable.metadata.companyName)') differs from provided parameter ('$SanitizedCompanyName'). Using parameter value '$SanitizedCompanyName'."
     $configurationHashtable.metadata.companyName = $SanitizedCompanyName
}

# 4. Define and Resolve Paths
$profilesBasePath = $configurationHashtable.environment.profilesBasePath | global:Get-OrElse "C:\MandADiscovery\Profiles"
if (-not ([System.IO.Path]::IsPathRooted($profilesBasePath))) {
    $profilesBasePathResolved = Join-Path $determinedSuiteRoot $profilesBasePath | Resolve-Path -ErrorAction SilentlyContinue
    if (-not $profilesBasePathResolved) { throw "Could not resolve relative profilesBasePath from config: '$($configurationHashtable.environment.profilesBasePath)' relative to '$determinedSuiteRoot'" }
    $profilesBasePath = $profilesBasePathResolved
}
$companyProfileRootPath = Join-Path $profilesBasePath $SanitizedCompanyName

$resolvedPaths = @{
    SuiteRoot           = $determinedSuiteRoot
    Core                = Join-Path $determinedSuiteRoot "Core"
    Modules             = Join-Path $determinedSuiteRoot "Modules"
    Scripts             = Join-Path $determinedSuiteRoot "Scripts"
    Configuration       = Join-Path $determinedSuiteRoot "Configuration" # MODIFIED KEY HERE
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
    CredentialFile      = Join-Path $companyProfileRootPath ($configurationHashtable.authentication.credentialFileName | global:Get-OrElse "credentials.config")
    ConfigFile          = $configFilePath
    ConfigSchema        = Join-Path $determinedSuiteRoot "Configuration\config.schema.json"
    QuickStartScript    = Join-Path $determinedSuiteRoot "QuickStart.ps1" 
    OrchestratorScript  = Join-Path $determinedSuiteRoot "Core\MandA-Orchestrator.ps1"
    ModuleCheckScript   = Join-Path $determinedSuiteRoot "Scripts\DiscoverySuiteModuleCheck.ps1"
    AppRegScript        = Join-Path $determinedSuiteRoot "Scripts\Setup-AppRegistration.ps1" 
    ValidationScript    = Join-Path $determinedSuiteRoot "Scripts\Validate-Installation.ps1"
}

# 5. Initialize or Update $global:MandA
if ($null -eq $global:MandA) { 
    $global:MandA = @{} 
    Write-Host "[Set-SuiteEnvironment] Initialized `$global:MandA as new Hashtable." -ForegroundColor DarkGray
} elseif ($global:MandA -is [hashtable]) {
    $global:MandA.Clear()
    Write-Host "[Set-SuiteEnvironment] Cleared existing `$global:MandA Hashtable." -ForegroundColor DarkGray
} else {
    Write-Warning "[Set-SuiteEnvironment] `$global:MandA exists but is not a Hashtable. Re-initializing."
    $global:MandA = @{}
}

$global:MandA.Version             = $configurationHashtable.metadata.version | global:Get-OrElse "5.2.1" 
$global:MandA.SuiteRoot           = $determinedSuiteRoot 
$global:MandA.CompanyName         = $SanitizedCompanyName
$global:MandA.Config              = $configurationHashtable 
$global:MandA.Paths               = $resolvedPaths # This now contains 'Configuration' not 'ConfigurationDir'
$global:MandA.Initialized         = $true 
$global:MandA.ModulesChecked      = $false 
$global:MandA.LoggingInitialized  = $false 
$global:MandA.ConnectionStatus    = @{ Credentials = $false; AzureAD = $false; Exchange = $false; SharePoint = $false; Teams = $false }
$global:MandA.OrchestratorRunCount = 0 

$global:MandA.Config.environment.outputPath = $resolvedPaths.CompanyProfileRoot
$global:MandA.Config.environment.tempPath = $resolvedPaths.TempPath
$global:MandA.Config.authentication.credentialStorePath = $resolvedPaths.CredentialFile 

Write-Host "[Set-SuiteEnvironment] Populated `$global:MandA with suite context. Configuration path key is now 'Configuration'." -ForegroundColor Green

# 6. Create Company-Specific Directories
Write-Host "[Set-SuiteEnvironment] Ensuring company profile directories exist for '$SanitizedCompanyName'..." -ForegroundColor Yellow
$dirsToCreate = @(
    $resolvedPaths.CompanyProfileRoot, $resolvedPaths.LogOutput, $resolvedPaths.RawDataOutput,
    $resolvedPaths.ProcessedDataOutput, $resolvedPaths.ExportOutput, $resolvedPaths.TempPath
)
foreach ($dirToCreate in $dirsToCreate) {
    if (-not (Test-Path $dirToCreate -PathType Container)) {
        try {
            New-Item -Path $dirToCreate -ItemType Directory -Force -ErrorAction Stop | Out-Null
            Write-Host "[Set-SuiteEnvironment]   Created: $dirToCreate" -ForegroundColor Green
        } catch { Write-Warning "[Set-SuiteEnvironment] Could not create directory: $dirToCreate - $($_.Exception.Message)" }
    }
}

# 7. Early Load Critical Utilities
Write-Host "[Set-SuiteEnvironment] Attempting to load critical utility modules..." -ForegroundColor DarkCyan
$criticalUtilModulesForEarlyLoad = @("EnhancedLogging.psm1", "ErrorHandling.psm1") 
foreach ($utilModuleFile in $criticalUtilModulesForEarlyLoad) {
    $utilModulePath = Join-Path $resolvedPaths.Utilities $utilModuleFile
    if (Test-Path $utilModulePath -PathType Leaf) {
        try {
            Import-Module $utilModulePath -Force -Global -ErrorAction Stop
            Write-Host "[Set-SuiteEnvironment]   Successfully loaded critical utility: $utilModuleFile" -ForegroundColor DarkGreen
        } catch {
            Write-Warning "[Set-SuiteEnvironment]   Failed to load critical utility '$utilModuleFile' from '$utilModulePath': $($_.Exception.Message). Some logging might be basic."
        }
    } else {
        Write-Warning "[Set-SuiteEnvironment]   Critical utility module '$utilModuleFile' not found at '$utilModulePath'. This may impact logging and error handling."
    }
}

# 8. Initialize Logging System using Write-MandALog if available
if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
    try {
        if (-not $global:MandA.Config.environment.HashtableContains('logPath') -or $global:MandA.Config.environment.logPath -ne $resolvedPaths.LogOutput) {
            $global:MandA.Config.environment.logPath = $resolvedPaths.LogOutput
             Write-MandALog -Message "[Set-SuiteEnvironment] Corrected logPath in working config to: $($resolvedPaths.LogOutput)" -Level DEBUG -Context $global:MandA 
        }
        Initialize-Logging -Configuration $global:MandA.Config 
        $global:MandA.LoggingInitialized = $true
        Write-MandALog -Message "[Set-SuiteEnvironment] Logging initialized. Log file target directory: $($resolvedPaths.LogOutput)" -Level INFO -Context $global:MandA
    } catch {
        Write-Warning "[Set-SuiteEnvironment] Failed to initialize logging via Initialize-Logging: $($_.Exception.Message). Check EnhancedLogging.psm1 and config."
        if(Get-Command Write-MandALog -ErrorAction SilentlyContinue){
            Write-MandALog -Message "[Set-SuiteEnvironment] Failed to initialize logging system. Error: $($_.Exception.Message)" -Level "ERROR" -Context $global:MandA
        }
    }
} else {
    Write-Warning "[Set-SuiteEnvironment] Initialize-Logging command (from EnhancedLogging.psm1) not found. Enhanced logging will not be available from Set-SuiteEnvironment.ps1. Ensure EnhancedLogging.psm1 is in the Utilities folder and loaded correctly."
}

$finalSuccessMessage = "[Set-SuiteEnvironment] M&A Discovery Suite Environment Initialized for Company: '$SanitizedCompanyName'"
$finalInfoMessage = "[Set-SuiteEnvironment]   Global context `$global:MandA` is now populated."

if (Get-Command Write-MandALog -ErrorAction SilentlyContinue -and $global:MandA.LoggingInitialized) {
    Write-MandALog -Message $finalSuccessMessage -Level "SUCCESS" -Context $global:MandA
    Write-MandALog -Message $finalInfoMessage -Level "INFO" -Context $global:MandA
} else {
    Write-Host $finalSuccessMessage -ForegroundColor Green
    Write-Host $finalInfoMessage -ForegroundColor Cyan
}

Write-Host "[Set-SuiteEnvironment] Environment setup complete for '$SanitizedCompanyName'." -ForegroundColor Cyan
Write-Host ""
