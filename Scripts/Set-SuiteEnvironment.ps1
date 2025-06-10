#Requires -Version 5.1
# -*- coding: utf-8-bom -*-

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-05
# Last Modified: 2025-06-06
# Change Log: Updated version control header

<#
.SYNOPSIS
    Sets up the environment for the M&A Discovery Suite v5.2.2.
    Provides centralized path management, configuration loading, and global utilities.
.DESCRIPTION
    Establishes a single global context object ($global:MandA) containing
    all required paths, the loaded configuration, and essential global functions like Get-OrElse.
    This version fixes array handling in configuration parsing to prevent arrays from becoming hashtables.
.PARAMETER ProvidedSuiteRoot
    Optional. Override the automatic suite root detection.
.PARAMETER CompanyName
    Mandatory. The company name for profile-specific paths.
.NOTES
    Version: 5.2.2
    Change Log:
    - Fixed ConvertTo-HashtableRecursiveSSE to properly handle arrays
    - Added debug output for configuration parsing
    - Improved type detection and conversion
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$ProvidedSuiteRoot,

    [Parameter(Mandatory=$true)]
    [string]$CompanyName
)

# --- Script Initialization & Global Utilities ---
$ErrorActionPreference = "Stop"
Write-Host "=== [Set-SuiteEnvironment.ps1 v5.2.2] Initializing M&A Discovery Suite Environment ===" -ForegroundColor Cyan
Write-Host "[Set-SuiteEnvironment] Timestamp: $(Get-Date)" -ForegroundColor Gray

# Define Get-OrElse globally IF it doesn't exist
if (-not (Get-Command global:Get-OrElse -ErrorAction SilentlyContinue)) {
    function global:Get-OrElse {
        param($Value, $Default)
        if ($null -ne $Value) { return $Value } else { return $Default }
    }
    Write-Host "[Set-SuiteEnvironment] Function 'global:Get-OrElse' has been defined." -ForegroundColor DarkGreen
}

# Add HashtableContains to the type data for hashtables if not already present
$testHashtableInstance = @{}
if (-not ($testHashtableInstance.PSObject.Methods.Name -contains 'HashtableContains')) {
    try {
        Update-TypeData -TypeName System.Collections.Hashtable -MemberName HashtableContains -MemberType ScriptMethod -Value { 
            param([string]$KeyToTest) 
            return $this.ContainsKey($KeyToTest) 
        } -Force -ErrorAction Stop
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
    
    if ($null -eq $InputObject) {
        return $null
    }
    
    # Handle arrays and collections (but not strings or hashtables)
    if ($InputObject -is [System.Collections.IEnumerable] -and
        $InputObject -isnot [string] -and
        $InputObject -isnot [hashtable] -and
        $InputObject -isnot [System.Collections.IDictionary]) {
        
        # Convert to array and process each element
        $array = @()
        foreach ($item in $InputObject) {
            if ($item -is [PSCustomObject] -or $item -is [hashtable]) {
                $array += ConvertTo-HashtableRecursiveSSE $item
            } else {
                # Keep primitive values (strings, numbers, booleans) as-is
                $array += $item
            }
        }
        
        # Return as array (the comma operator ensures it stays an array)
        return ,$array
    }
    
    # Handle PSCustomObject - convert to hashtable
    if ($InputObject -is [PSCustomObject]) {
        $hash = @{}
        foreach ($property in $InputObject.PSObject.Properties) {
            $hash[$property.Name] = ConvertTo-HashtableRecursiveSSE $property.Value
        }
        return $hash
    }
    
    # Handle existing hashtables - process their values
    if ($InputObject -is [hashtable] -or $InputObject -is [System.Collections.IDictionary]) {
        $hash = @{}
        foreach ($key in $InputObject.Keys) {
            $hash[$key] = ConvertTo-HashtableRecursiveSSE $InputObject[$key]
        }
        return $hash
    }
    
    # Return all other types as-is (strings, numbers, booleans, etc.)
    return $InputObject
}

# Test function to verify array handling
function Test-ConfigArrayHandling {
    param($Config)
    
    Write-Host "[Set-SuiteEnvironment] Testing configuration array handling..." -ForegroundColor Yellow
    
    # Test enabledSources
    if ($Config.discovery -and $Config.discovery.enabledSources) {
        $enabledSources = $Config.discovery.enabledSources
        $sourceType = $enabledSources.GetType().Name
        Write-Host "  enabledSources type: $sourceType" -ForegroundColor Gray
        
        if ($enabledSources -is [array]) {
            Write-Host "  enabledSources is correctly an array with $($enabledSources.Count) items" -ForegroundColor Green
            if ($enabledSources.Count -gt 0) {
                Write-Host "  First item: $($enabledSources[0]) (Type: $($enabledSources[0].GetType().Name))" -ForegroundColor Gray
            }
        } else {
            Write-Host "  WARNING: enabledSources is NOT an array!" -ForegroundColor Red
        }
    }
    
    # Test export formats
    if ($Config.export -and $Config.export.formats) {
        $formats = $Config.export.formats
        $formatType = $formats.GetType().Name
        Write-Host "  export.formats type: $formatType" -ForegroundColor Gray
        
        if ($formats -is [array]) {
            Write-Host "  export.formats is correctly an array with $($formats.Count) items" -ForegroundColor Green
            if ($formats.Count -gt 0) {
                Write-Host "  First item: $($formats[0]) (Type: $($formats[0].GetType().Name))" -ForegroundColor Gray
            }
        } else {
            Write-Host "  WARNING: export.formats is NOT an array!" -ForegroundColor Red
        }
    }
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
        throw "Provided SuiteRoot '$ProvidedSuiteRoot' is invalid or does not have the required structure."
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
        $determinationMethod = "auto-detection relative to MyInvocation"
    } else {
        throw "CRITICAL: Cannot determine a valid SuiteRoot."
    }
}
Write-Host "[Set-SuiteEnvironment] SuiteRoot established: $determinedSuiteRoot (via $determinationMethod)" -ForegroundColor Green

# 2. Validate CompanyName
if ([string]::IsNullOrWhiteSpace($CompanyName)) {
    throw "CRITICAL: CompanyName parameter is mandatory and cannot be empty."
}
$SanitizedCompanyName = $CompanyName -replace '[<>:"/\\|?*]', '_'
Write-Host "[Set-SuiteEnvironment] Operating for Company: '$SanitizedCompanyName'" -ForegroundColor Cyan

# 3. Load Configuration from default-config.json
$configFilePath = Join-Path $determinedSuiteRoot "Configuration\default-config.json"
if (-not (Test-Path $configFilePath -PathType Leaf)) {
    throw "CRITICAL: Configuration file 'default-config.json' not found at '$configFilePath'."
}

Write-Host "[Set-SuiteEnvironment] Loading configuration from JSON..." -ForegroundColor Yellow
$configContent = $null
try {
    # Read raw JSON content
    $jsonContent = Get-Content $configFilePath -Raw -Encoding UTF8
    
    # Parse JSON - this creates PSCustomObject with arrays preserved
    $configContent = $jsonContent | ConvertFrom-Json -ErrorAction Stop
    
    Write-Host "[Set-SuiteEnvironment] JSON parsed successfully" -ForegroundColor Green
    
} catch {
    throw "CRITICAL: Failed to parse configuration file '$configFilePath'. Error: $($_.Exception.Message)"
}

if ($null -eq $configContent) {
    throw "CRITICAL: Parsed configuration content is null from '$configFilePath'."
}

# Convert to hashtable while preserving arrays
Write-Host "[Set-SuiteEnvironment] Converting configuration to hashtable format..." -ForegroundColor Yellow
$configurationHashtable = ConvertTo-HashtableRecursiveSSE -InputObject $configContent
Write-Host "[Set-SuiteEnvironment] Configuration loaded from '$configFilePath'" -ForegroundColor Green

# Define DiscoveryResult class globally for all modules
if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
    Add-Type -TypeDefinition @'
public class DiscoveryResult {
    public bool Success { get; set; }
    public string ModuleName { get; set; }
    public object Data { get; set; }
    public int RecordCount { get; set; }
    public System.Collections.ArrayList Errors { get; set; }
    public System.Collections.ArrayList Warnings { get; set; }
    public System.Collections.Hashtable Metadata { get; set; }
    public System.DateTime StartTime { get; set; }
    public System.DateTime EndTime { get; set; }
    public string ExecutionId { get; set; }
    
    public DiscoveryResult(string moduleName) {
        this.ModuleName = moduleName;
        this.RecordCount = 0;
        this.Errors = new System.Collections.ArrayList();
        this.Warnings = new System.Collections.ArrayList();
        this.Metadata = new System.Collections.Hashtable();
        this.StartTime = System.DateTime.Now;
        this.ExecutionId = System.Guid.NewGuid().ToString();
        this.Success = true;
    }
    
    public void AddError(string message, System.Exception exception) {
        AddError(message, exception, new System.Collections.Hashtable());
    }
    
    public void AddError(string message, System.Exception exception, System.Collections.Hashtable context) {
        var errorEntry = new System.Collections.Hashtable();
        errorEntry["Timestamp"] = System.DateTime.Now;
        errorEntry["Message"] = message;
        
        if (exception != null) {
            errorEntry["Exception"] = exception.ToString();
            errorEntry["ExceptionType"] = exception.GetType().FullName;
            errorEntry["StackTrace"] = exception.StackTrace;
        } else {
            errorEntry["Exception"] = null;
            errorEntry["ExceptionType"] = null;
            errorEntry["StackTrace"] = System.Environment.StackTrace;
        }
        
        errorEntry["Context"] = context ?? new System.Collections.Hashtable();
        this.Errors.Add(errorEntry);
        this.Success = false;
    }
    
    public void AddWarning(string message) {
        AddWarning(message, new System.Collections.Hashtable());
    }
    
    public void AddWarning(string message, System.Collections.Hashtable context) {
        var warningEntry = new System.Collections.Hashtable();
        warningEntry["Timestamp"] = System.DateTime.Now;
        warningEntry["Message"] = message;
        warningEntry["Context"] = context;
        this.Warnings.Add(warningEntry);
    }
    
    public void Complete() {
        this.EndTime = System.DateTime.Now;
        if (this.StartTime != null && this.EndTime != null) {
            var duration = this.EndTime - this.StartTime;
            this.Metadata["Duration"] = duration;
            this.Metadata["DurationSeconds"] = duration.TotalSeconds;
        }
    }
}
'@ -Language CSharp
    Write-Host "[Set-SuiteEnvironment] DiscoveryResult class defined globally" -ForegroundColor Green
} else {
    Write-Host "[Set-SuiteEnvironment] DiscoveryResult class already exists" -ForegroundColor Gray
}

# Test array handling if verbose
if ($VerbosePreference -eq 'Continue') {
    Test-ConfigArrayHandling -Config $configurationHashtable
}

# Validate required sections
$requiredRootSections = @("metadata", "environment", "authentication", "discovery", "processing", "export")
foreach ($sectionName in $requiredRootSections) {
    if (-not $configurationHashtable.HashtableContains($sectionName)) { 
        throw "CRITICAL: Configuration file missing essential section: '$sectionName'."
    }
    if (-not ($configurationHashtable[$sectionName] -is [hashtable])) {
        throw "CRITICAL: Configuration section '$sectionName' is not a valid object."
    }
}
Write-Host "[Set-SuiteEnvironment] Essential root sections in configuration validated." -ForegroundColor Green

# Handle company name
if (-not $configurationHashtable.metadata.HashtableContains('companyName') -or 
    [string]::IsNullOrWhiteSpace($configurationHashtable.metadata.companyName)) {
    Write-Warning "[Set-SuiteEnvironment] companyName not found in config. Setting from parameter: '$SanitizedCompanyName'."
    $configurationHashtable.metadata.companyName = $SanitizedCompanyName
} elseif ($configurationHashtable.metadata.companyName -ne $SanitizedCompanyName) {
    Write-Warning "[Set-SuiteEnvironment] companyName in config ('$($configurationHashtable.metadata.companyName)') differs from parameter ('$SanitizedCompanyName'). Using parameter value."
    $configurationHashtable.metadata.companyName = $SanitizedCompanyName
}

# 4. Define and Resolve Paths
$profilesBasePath = global:Get-OrElse $configurationHashtable.environment.profilesBasePath "C:\MandADiscovery\Profiles"
if (-not ([System.IO.Path]::IsPathRooted($profilesBasePath))) {
    $profilesBasePathResolved = Join-Path $determinedSuiteRoot $profilesBasePath | Resolve-Path -ErrorAction SilentlyContinue
    if (-not $profilesBasePathResolved) { 
        throw "Could not resolve relative profilesBasePath: '$($configurationHashtable.environment.profilesBasePath)'"
    }
    $profilesBasePath = $profilesBasePathResolved
}
$companyProfileRootPath = Join-Path $profilesBasePath $SanitizedCompanyName

$resolvedPaths = @{
    SuiteRoot           = $determinedSuiteRoot
    Core                = Join-Path $determinedSuiteRoot "Core"
    Modules             = Join-Path $determinedSuiteRoot "Modules"
    Scripts             = Join-Path $determinedSuiteRoot "Scripts"
    Configuration       = Join-Path $determinedSuiteRoot "Configuration"
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
    CredentialFile      = Join-Path $companyProfileRootPath (global:Get-OrElse $configurationHashtable.authentication.credentialFileName "credentials.config")
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

$global:MandA.Version             = global:Get-OrElse $configurationHashtable.metadata.version "5.2.2"
$global:MandA.SuiteRoot           = $determinedSuiteRoot 
$global:MandA.CompanyName         = $SanitizedCompanyName
$global:MandA.Config              = $configurationHashtable 
$global:MandA.Paths               = $resolvedPaths
$global:MandA.Initialized         = $true 
$global:MandA.ModulesChecked      = $false 
$global:MandA.LoggingInitialized  = $false 
$global:MandA.ConnectionStatus    = @{ 
    Credentials = $false
    AzureAD = $false
    Exchange = $false
    SharePoint = $false
    Teams = $false 
}
$global:MandA.OrchestratorRunCount = 0 

# Update config paths
$global:MandA.Config.environment.outputPath = $resolvedPaths.CompanyProfileRoot
$global:MandA.Config.environment.tempPath = $resolvedPaths.TempPath
$global:MandA.Config.authentication.credentialStorePath = $resolvedPaths.CredentialFile 

Write-Host "[Set-SuiteEnvironment] Populated `$global:MandA with suite context." -ForegroundColor Green

# Debug: Show array status in configuration
if ($VerbosePreference -eq 'Continue' -or $DebugPreference -eq 'Continue') {
    Write-Host "[Set-SuiteEnvironment] Configuration array validation:" -ForegroundColor Yellow
    
    $enabledSources = $global:MandA.Config.discovery.enabledSources
    if ($enabledSources -is [array]) {
        Write-Host "  [OK] enabledSources is array with $($enabledSources.Count) items" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] enabledSources is NOT array: $($enabledSources.GetType().Name)" -ForegroundColor Red
    }
    
    $exportFormats = $global:MandA.Config.export.formats
    if ($exportFormats -is [array]) {
        Write-Host "  [OK] export.formats is array with $($exportFormats.Count) items" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] export.formats is NOT array: $($exportFormats.GetType().Name)" -ForegroundColor Red
    }
}

# 6. Create Company-Specific Directories
Write-Host "[Set-SuiteEnvironment] Ensuring company profile directories exist for '$SanitizedCompanyName'..." -ForegroundColor Yellow
$dirsToCreate = @(
    $resolvedPaths.CompanyProfileRoot, 
    $resolvedPaths.LogOutput, 
    $resolvedPaths.RawDataOutput,
    $resolvedPaths.ProcessedDataOutput, 
    $resolvedPaths.ExportOutput, 
    $resolvedPaths.TempPath
)

foreach ($dirToCreate in $dirsToCreate) {
    if (-not (Test-Path $dirToCreate -PathType Container)) {
        try {
            New-Item -Path $dirToCreate -ItemType Directory -Force -ErrorAction Stop | Out-Null
            Write-Host "[Set-SuiteEnvironment]   Created: $dirToCreate" -ForegroundColor Green
        } catch { 
            Write-Warning "[Set-SuiteEnvironment] Could not create directory: $dirToCreate - $($_.Exception.Message)" 
        }
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
            Write-Warning "[Set-SuiteEnvironment]   Failed to load critical utility '$utilModuleFile': $($_.Exception.Message)"
        }
    } else {
        Write-Warning "[Set-SuiteEnvironment]   Critical utility module '$utilModuleFile' not found at '$utilModulePath'."
    }
}
# 8. Initialize Logging System

if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
    try {
        if (-not $global:MandA.Config.environment.HashtableContains('logPath') -or 
            $global:MandA.Config.environment.logPath -ne $resolvedPaths.LogOutput) {
            $global:MandA.Config.environment.logPath = $resolvedPaths.LogOutput
            Write-MandALog -Message "[Set-SuiteEnvironment] Corrected logPath in config to: $($resolvedPaths.LogOutput)" -Level DEBUG -Context $global:MandA 
        }
        
        Initialize-Logging -Context $global:MandA
        $global:MandA.LoggingInitialized = $true
        Write-MandALog -Message "[Set-SuiteEnvironment] Logging initialized." -Level INFO -Context $global:MandA
    } catch {
        Write-Warning "[Set-SuiteEnvironment] Failed to initialize logging: $($_.Exception.Message)"
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "[Set-SuiteEnvironment] Failed to initialize logging: $($_.Exception.Message)" -Level "ERROR" -Context $global:MandA
        }
    }
} else {
    Write-Warning "[Set-SuiteEnvironment] Initialize-Logging command not found. Enhanced logging unavailable."
}

# Final success messages
$finalSuccessMessage = "[Set-SuiteEnvironment] M&A Discovery Suite Environment Initialized for Company: '$SanitizedCompanyName'"
$finalInfoMessage = "[Set-SuiteEnvironment]   Global context `$global:MandA is now populated."

if (Get-Command Write-MandALog -ErrorAction SilentlyContinue -and $global:MandA.LoggingInitialized) {
    Write-MandALog -Message $finalSuccessMessage -Level "SUCCESS" -Context $global:MandA
    Write-MandALog -Message $finalInfoMessage -Level "INFO" -Context $global:MandA
} else {
    Write-Host $finalSuccessMessage -ForegroundColor Green
    Write-Host $finalInfoMessage -ForegroundColor Cyan
}

Write-Host "[Set-SuiteEnvironment] Environment setup complete for '$SanitizedCompanyName'." -ForegroundColor Cyan
Write-Host ""

# End of Set-SuiteEnvironment.ps1