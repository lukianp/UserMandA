<#
.SYNOPSIS
    Sets up the environment for the M&A Discovery Suite v5.0.
    Provides centralized path management and configuration loading.
.DESCRIPTION
    Establishes a single global context object ($global:MandA) containing
    all required paths and the loaded, validated configuration.
    Uses 'throw' for critical errors to halt calling scripts.
.PARAMETER ProvidedSuiteRoot
    Optional. Override the automatic suite root detection.
.PARAMETER CompanyName
    Mandatory. The company name for profile-specific paths.
.NOTES
    Version: 5.0.0
    CRITICAL: This must be sourced by ALL suite scripts before any operations
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$ProvidedSuiteRoot,

    [Parameter(Mandatory=$true)]
    [string]$CompanyName
)

# Ensure clean execution
$ErrorActionPreference = "Stop"

Write-Host "=== Initializing M&A Discovery Suite Environment v5.0 ===" -ForegroundColor Cyan

# Function to validate suite structure
function Test-MandASuiteStructureInternal {
    param([string]$PathToTest)
    
    $requiredSubDirs = @("Core", "Modules", "Scripts", "Configuration")
    if (-not (Test-Path $PathToTest -PathType Container)) { 
        return $false 
    }
    
    foreach ($subDir in $requiredSubDirs) {
        if (-not (Test-Path (Join-Path $PathToTest $subDir) -PathType Container)) { 
            return $false 
        }
    }
    return $true
}

# Determine Suite Root
$SuiteRoot = $null
$determinedBy = ""

try {
    # Priority 1: Provided parameter
    if (-not [string]::IsNullOrWhiteSpace($ProvidedSuiteRoot)) {
        if (Test-MandASuiteStructureInternal -PathToTest $ProvidedSuiteRoot) {
            $SuiteRoot = Resolve-Path $ProvidedSuiteRoot | Select-Object -ExpandProperty Path
            $determinedBy = "parameter"
        } else {
            throw "Provided SuiteRoot '$ProvidedSuiteRoot' is invalid"
        }
    }
    # Priority 2: Check if already set
    elseif ($null -ne $global:MandA -and $null -ne $global:MandA.Paths.SuiteRoot) {
        if (Test-MandASuiteStructureInternal -PathToTest $global:MandA.Paths.SuiteRoot) {
            $SuiteRoot = $global:MandA.Paths.SuiteRoot
            $determinedBy = "existing global"
            Write-Host "Using existing SuiteRoot from global context" -ForegroundColor Green
        }
    }
    # Priority 3: Default location
    else {
        $defaultPath = "C:\MandADiscovery"
        if (Test-MandASuiteStructureInternal -PathToTest $defaultPath) {
            $SuiteRoot = $defaultPath
            $determinedBy = "default"
        }
        # Priority 4: Auto-detect from script location
        else {
            $scriptPath = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path $MyInvocation.MyCommand.Path -Parent }
            $autoDetectedPath = Split-Path $scriptPath -Parent
            
            if (Test-MandASuiteStructureInternal -PathToTest $autoDetectedPath) {
                $SuiteRoot = Resolve-Path $autoDetectedPath | Select-Object -ExpandProperty Path
                $determinedBy = "auto-detection"
            } else {
                throw "Cannot determine valid SuiteRoot. No valid structure found."
            }
        }
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    throw
}

Write-Host "SuiteRoot established: $SuiteRoot (via $determinedBy)" -ForegroundColor Green

# Load and validate configuration
$configFilePath = Join-Path $SuiteRoot "Configuration\default-config.json"
if (-not (Test-Path $configFilePath -PathType Leaf)) {
    throw "Configuration file not found: $configFilePath"
}

try {
    $configContent = Get-Content $configFilePath -Raw | ConvertFrom-Json -ErrorAction Stop
    Write-Host "Configuration loaded successfully" -ForegroundColor Green
} catch {
    throw "Failed to parse configuration: $($_.Exception.Message)"
}

# Convert configuration to hashtable recursively
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

$configHashtable = ConvertTo-HashtableRecursiveInternal $configContent

# Validate company name
if ([string]::IsNullOrWhiteSpace($CompanyName)) {
    throw "CompanyName parameter is required"
}

# Sanitize company name for filesystem
$CompanyName = $CompanyName -replace '[<>:"/\\|?*]', '_'

# Build paths - use fixed base path for consistency
$profilesBasePath = "C:\MandADiscovery\Profiles"
$companyProfileRoot = Join-Path $profilesBasePath $CompanyName

# Initialize global context - SINGLE SOURCE OF TRUTH
$global:MandA = @{
    Version = "5.0.0"
    DeterminedBy = $determinedBy
    CompanyName = $CompanyName
    Config = $configHashtable
    Paths = @{
        # Core paths
        SuiteRoot = $SuiteRoot
        ProfilesBasePath = $profilesBasePath
        CompanyProfileRoot = $companyProfileRoot
        
        # Suite structure paths
        Core = Join-Path $SuiteRoot "Core"
        Modules = Join-Path $SuiteRoot "Modules"
        Scripts = Join-Path $SuiteRoot "Scripts"
        Configuration = Join-Path $SuiteRoot "Configuration"
        Documentation = Join-Path $SuiteRoot "Documentation"
        
        # Module category paths
        Utilities = Join-Path $SuiteRoot "Modules\Utilities"
        Discovery = Join-Path $SuiteRoot "Modules\Discovery"
        Processing = Join-Path $SuiteRoot "Modules\Processing"
        Export = Join-Path $SuiteRoot "Modules\Export"
        Authentication = Join-Path $SuiteRoot "Modules\Authentication"
        Connectivity = Join-Path $SuiteRoot "Modules\Connectivity"
        
        # Company-specific paths
        LogOutput = Join-Path $companyProfileRoot "Logs"
        RawDataOutput = Join-Path $companyProfileRoot "Raw"
        ProcessedDataOutput = Join-Path $companyProfileRoot "Processed"
        ExportOutput = Join-Path $companyProfileRoot "Exports"
        TempPath = Join-Path $companyProfileRoot "Temp"
        CredentialFile = Join-Path $companyProfileRoot "credentials.config"
        
        # Key script paths
        Orchestrator = Join-Path $SuiteRoot "Core\MandA-Orchestrator.ps1"
        QuickStart = Join-Path $SuiteRoot "QuickStart.ps1"
        EnvironmentScript = Join-Path $SuiteRoot "Scripts\Set-SuiteEnvironment.ps1"
        ModuleCheckScript = Join-Path $SuiteRoot "Scripts\DiscoverySuiteModuleCheck.ps1"
        ValidationScript = Join-Path $SuiteRoot "Scripts\Validate-Installation.ps1"
        AppRegScript = Join-Path $SuiteRoot "Scripts\Setup-AppRegistration.ps1"
        
        # Config paths
        ConfigFile = $configFilePath
        ConfigSchema = Join-Path $SuiteRoot "Configuration\config.schema.json"
    }
    
    # State tracking
    ModulesChecked = $false
    LoggingInitialized = $false
    ConnectionStatus = @{
        Credentials = $false
        AzureAD = $false
        Exchange = $false
        SharePoint = $false
        Teams = $false
    }
}

# Create company-specific directories
Write-Host "Creating company profile directories..." -ForegroundColor Yellow
$dirsToCreate = @(
    $global:MandA.Paths.CompanyProfileRoot,
    $global:MandA.Paths.LogOutput,
    $global:MandA.Paths.RawDataOutput,
    $global:MandA.Paths.ProcessedDataOutput,
    $global:MandA.Paths.ExportOutput,
    $global:MandA.Paths.TempPath
)

foreach ($dir in $dirsToCreate) {
    if (-not (Test-Path $dir -PathType Container)) {
        try {
            New-Item -Path $dir -ItemType Directory -Force | Out-Null
            Write-Host "  Created: $dir" -ForegroundColor Green
        } catch {
            Write-Warning "Could not create directory: $dir - $_"
        }
    }
}

# Update configuration with resolved paths
$global:MandA.Config.environment.outputPath = $global:MandA.Paths.CompanyProfileRoot
$global:MandA.Config.environment.tempPath = $global:MandA.Paths.TempPath

# Load core utility modules if available
$coreModules = @(
    "EnhancedLogging.psm1",
    "ErrorHandling.psm1"
)

Write-Host "DEBUG: Set-SuiteEnvironment.ps1 - Path to Utilities directory: $($global:MandA.Paths.Utilities)" -ForegroundColor Magenta

foreach ($moduleFile in $coreModules) { # Renamed variable for clarity
    $modulePath = Join-Path $global:MandA.Paths.Utilities $moduleFile
    
    Write-Host "DEBUG: Set-SuiteEnvironment.ps1 - Attempting to load '$moduleFile' from: $modulePath" -ForegroundColor Magenta
    $moduleExists = Test-Path $modulePath -PathType Leaf
    Write-Host "DEBUG: Set-SuiteEnvironment.ps1 - Module '$moduleFile' exists at path: $moduleExists" -ForegroundColor Magenta

    if ($moduleExists) {
        try {
            Import-Module $modulePath -Force -Global -ErrorAction Stop
            Write-Host "Successfully loaded core module: $moduleFile" -ForegroundColor Green
            
            # Specifically test if Write-MandALog is available after importing EnhancedLogging.psm1
            if ($moduleFile -eq "EnhancedLogging.psm1") {
                $isWriteMandALogAvailable = Get-Command Write-MandALog -ErrorAction SilentlyContinue
                Write-Host "DEBUG: Set-SuiteEnvironment.ps1 - Write-MandALog available after import: $(!!$isWriteMandALogAvailable)" -ForegroundColor Magenta
                if (-not $isWriteMandALogAvailable) {
                    throw "CRITICAL: Write-MandALog function NOT available after importing $moduleFile."
                }
            }
        } catch {
            if ($moduleFile -in @("EnhancedLogging.psm1", "ErrorHandling.psm1")) {
                throw "CRITICAL: Failed to load essential utility module '$moduleFile' from '$modulePath'. Suite cannot continue. Error: $($_.Exception.Message)"
            } else {
                Write-Warning "Failed to load non-critical utility module '$moduleFile': $($_.Exception.Message)"
            }
        }
    } Else {
         if ($moduleFile -in @("EnhancedLogging.psm1", "ErrorHandling.psm1")) {
            throw "CRITICAL: Essential utility module file '$moduleFile' not found at '$modulePath'. Suite cannot continue."
         } else {
            Write-Warning "Non-critical utility module file '$moduleFile' not found at '$modulePath'."
         }
    }
}

# Initialize logging if module is available
# Test for Initialize-Logging command availability
$isInitializeLoggingAvailable = Get-Command Initialize-Logging -ErrorAction SilentlyContinue
Write-Host "DEBUG: Set-SuiteEnvironment.ps1 - Initialize-Logging available: $(!!$isInitializeLoggingAvailable)" -ForegroundColor Magenta

if ($isInitializeLoggingAvailable) {
    try {
        # Ensure log configuration uses company profile path
        $global:MandA.Config.environment.logPath = $global:MandA.Paths.LogOutput
        Initialize-Logging -Configuration $global:MandA.Config
        $global:MandA.LoggingInitialized = $true
        Write-Host "Logging initialized to: $($global:MandA.Paths.LogOutput)" -ForegroundColor Green
    } catch {
        Write-Warning "Failed to initialize logging: $_"
    }
}

# Display initialization summary
Write-Host "`n=== M&A Discovery Suite Environment Ready ===" -ForegroundColor Cyan
Write-Host "Company: $CompanyName" -ForegroundColor Yellow
Write-Host "Profile Root: $($global:MandA.Paths.CompanyProfileRoot)" -ForegroundColor White
Write-Host "Suite Root: $($global:MandA.Paths.SuiteRoot)" -ForegroundColor White
Write-Host "Logging: $(if($global:MandA.LoggingInitialized){'Initialized'}else{'Not initialized'})" -ForegroundColor White
Write-Host "Global context available as `$global:MandA" -ForegroundColor Green
Write-Host ""

# Export helper functions
function Get-MandAPath {
    param(
        [Parameter(Mandatory=$true)]
        [string]$PathName
    )
    
    if ($global:MandA.Paths.ContainsKey($PathName)) {
        return $global:MandA.Paths[$PathName]
    } else {
        Write-Warning "Unknown path name: $PathName"
        return $null
    }
}

function Test-MandAEnvironment {
    return ($null -ne $global:MandA -and $null -ne $global:MandA.Paths)
}

# Make helper functions available (Commented out or removed Export-ModuleMember)
# Export-ModuleMember -Function Get-MandAPath, Test-MandAEnvironment -ErrorAction SilentlyContinue
