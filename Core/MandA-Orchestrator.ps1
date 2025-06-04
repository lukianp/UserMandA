#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Main Orchestrator (Enhanced Version 5.5.0)
.DESCRIPTION
    Unified orchestrator for discovery, processing, and export with improved
    state management, error handling, and parallel processing support.
.NOTES
    Author: Enhanced Version
    Version: 5.5.0
    Created: 2025-01-03
    Last Modified: 2025-01-03
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$CompanyName,

    [Parameter(Mandatory=$false)]
    [string]$ConfigurationFile,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("Discovery", "Processing", "Export", "Full", "AzureOnly")]
    [string]$Mode = "Full",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force,
    
    [Parameter(Mandatory=$false)]
    [switch]$ValidateOnly,
    
    [Parameter(Mandatory=$false)]
    [int]$ParallelThrottle = 5
)

#===============================================================================
#                       CLASSES AND TYPES
#===============================================================================

# Define the context class for dependency injection
class MandAContext {
    [hashtable]$Paths
    [hashtable]$Config
    [string]$Version
    [datetime]$StartTime
    [bool]$ModulesChecked
    [DiscoveryErrorCollector]$ErrorCollector
    [OrchestratorState]$OrchestratorState
    
    MandAContext([hashtable]$config, [string]$companyName) {
        $this.Config = $config
        $this.Version = "5.5.0"
        $this.StartTime = Get-Date
        $this.ModulesChecked = $false
        $this.ErrorCollector = [DiscoveryErrorCollector]::new()
        $this.OrchestratorState = [OrchestratorState]::new()
        
        # Use global paths if available, otherwise initialize
        if ($null -ne $global:MandA -and $null -ne $global:MandA.Paths) {
            Write-Verbose "Using paths from global environment"
            $this.Paths = $global:MandA.Paths.Clone()
        } else {
            Write-Verbose "Global environment not found, initializing paths"
            $this.InitializePaths($companyName)
        }
    }
    
    [void]InitializePaths([string]$companyName) {
        # Only initialize if global paths aren't available
        if ($null -ne $global:MandA -and $null -ne $global:MandA.Paths) {
            $this.Paths = $global:MandA.Paths.Clone()
            return
        }
        
        # Fallback initialization
        $suiteRoot = Split-Path $PSScriptRoot -Parent
        $profilesBasePath = "C:\MandADiscovery\Profiles" # Default if not in global config
        if ($this.Config -and $this.Config.environment -and $this.Config.environment.profilesBasePath) {
            $profilesBasePath = $this.Config.environment.profilesBasePath
        }
        
        $this.Paths = @{
            SuiteRoot = $suiteRoot
            ProfilesBasePath = $profilesBasePath
            CompanyProfileRoot = Join-Path $profilesBasePath $companyName
            Modules = Join-Path $suiteRoot "Modules"
            Utilities = Join-Path $suiteRoot "Modules\Utilities"
            Core = Join-Path $suiteRoot "Core"
            Scripts = Join-Path $suiteRoot "Scripts"
            Configuration = Join-Path $suiteRoot "Configuration"
        }
        
        # Add dynamic paths
        $this.Paths.RawDataOutput = Join-Path $this.Paths.CompanyProfileRoot "Raw"
        $this.Paths.ProcessedDataOutput = Join-Path $this.Paths.CompanyProfileRoot "Processed"
        $this.Paths.LogOutput = Join-Path $this.Paths.CompanyProfileRoot "Logs"
        $this.Paths.ExportOutput = Join-Path $this.Paths.CompanyProfileRoot "Exports"
        $this.Paths.TempPath = Join-Path $this.Paths.CompanyProfileRoot "Temp"
        
        # Update config with resolved path if Config is not null
        if ($null -ne $this.Config -and $null -ne $this.Config.environment) {
            $this.Config.environment.outputPath = $this.Paths.CompanyProfileRoot
        } elseif ($null -eq $this.Config) {
            Write-Warning "Attempted to update paths in a null Config object during MandAContext.InitializePaths"
        }
    }
    
    [bool]ValidateContext() {
        $required = @('SuiteRoot', 'CompanyProfileRoot', 'Modules')
        foreach ($path in $required) {
            if (-not $this.Paths.ContainsKey($path) -or -not $this.Paths[$path]) {
                return $false
            }
        }
        return $true
    }
}

class OrchestratorState {
    [int]$MaxExecutions = 5
    [System.Collections.Generic.Stack[string]]$ExecutionStack
    [System.Collections.Generic.Dictionary[string,int]]$PhaseExecutions
    
    OrchestratorState() {
        $this.ExecutionStack = [System.Collections.Generic.Stack[string]]::new()
        $this.PhaseExecutions = [System.Collections.Generic.Dictionary[string,int]]::new()
    }
    
    [bool]CanExecute([string]$phase) {
        if ($this.ExecutionStack.Contains($phase)) {
            return $false  # Circular dependency detected
        }
        
        if (-not $this.PhaseExecutions.ContainsKey($phase)) {
            $this.PhaseExecutions[$phase] = 0
        }
        
        return $this.PhaseExecutions[$phase] -lt $this.MaxExecutions
    }
    
    [void]PushExecution([string]$phase) {
        $this.ExecutionStack.Push($phase)
        if (-not $this.PhaseExecutions.ContainsKey($phase)) {
            $this.PhaseExecutions[$phase] = 0
        }
        $this.PhaseExecutions[$phase]++
    }
    
    [void]PopExecution() {
        if ($this.ExecutionStack.Count -gt 0) {
            $null = $this.ExecutionStack.Pop()
        }
    }
    
    [string]GetExecutionPath() {
        return ($this.ExecutionStack.ToArray() | ForEach-Object { $_ }) -join ' -> '
    }
}

class DiscoveryErrorCollector {
    [System.Collections.Generic.List[PSObject]]$Errors
    [System.Collections.Generic.List[PSObject]]$Warnings
    [System.Collections.Generic.Dictionary[string,int]]$ErrorCounts
    
    DiscoveryErrorCollector() {
        $this.Errors = [System.Collections.Generic.List[PSObject]]::new()
        $this.Warnings = [System.Collections.Generic.List[PSObject]]::new()
        $this.ErrorCounts = [System.Collections.Generic.Dictionary[string,int]]::new()
    }
    
    [void]AddError([string]$Source, [string]$Message, [Exception]$Exception) {
        $this.Errors.Add([PSCustomObject]@{
            Timestamp = Get-Date
            Source = $Source
            Message = $Message
            Exception = $Exception
            StackTrace = if ($Exception) { $Exception.ScriptStackTrace } else { $null }
            Type = if ($Exception) { $Exception.GetType().FullName } else { "Unknown" }
        })
        
        if (-not $this.ErrorCounts.ContainsKey($Source)) {
            $this.ErrorCounts[$Source] = 0
        }
        $this.ErrorCounts[$Source]++
    }
    
    [void]AddWarning([string]$Source, [string]$Message) {
        $this.Warnings.Add([PSCustomObject]@{
            Timestamp = Get-Date
            Source = $Source
            Message = $Message
        })
    }
    
    [bool]HasErrors() {
        return $this.Errors.Count -gt 0
    }
    
    [bool]HasCriticalErrors() {
        return ($this.Errors | Where-Object { $_.Source -match "Critical|Core" }).Count -gt 0
    }
    
    [string]GetSummary() {
        $summary = "Errors: $($this.Errors.Count), Warnings: $($this.Warnings.Count)"
        if ($this.ErrorCounts.Count -gt 0) {
            $summary += "`nError breakdown by source:"
            foreach ($source in $this.ErrorCounts.Keys | Sort-Object) {
                $summary += "`n  - $source - $($this.ErrorCounts[$source])"
            }
        }
        return $summary
    }
    [void]ExportToFile([string]$FilePath) {
    # Create a cleaned version of errors for serialization
    $cleanedErrors = $this.Errors | ForEach-Object {
        @{
            Timestamp = $_.Timestamp
            Source = $_.Source
            Message = $_.Message
            ExceptionMessage = if ($_.Exception) { $_.Exception.Message } else { $null }
            ExceptionType = if ($_.Exception) { $_.Exception.GetType().FullName } else { "Unknown" }
            StackTrace = $_.StackTrace
        }
    }
    
    $report = @{
        Summary = $this.GetSummary()
        GeneratedAt = Get-Date
        Errors = $cleanedErrors
        Warnings = $this.Warnings
        ErrorCounts = $this.ErrorCounts
    }
    
    try {
        $report | ConvertTo-Json -Depth 10 -Compress | Set-Content -Path $FilePath -Encoding UTF8
    }
    catch {
        # Fallback to simple text format if JSON serialization fails
        $textReport = @"
Error Report Generated: $(Get-Date)
Summary: $($this.GetSummary())

Errors:
$($cleanedErrors | ForEach-Object { "[$($_.Timestamp)] $($_.Source): $($_.Message)" } | Out-String)

Warnings:
$($this.Warnings | ForEach-Object { "[$($_.Timestamp)] $($_.Source): $($_.Message)" } | Out-String)
"@
        $textReport | Set-Content -Path ($FilePath -replace '\.json$', '.txt') -Encoding UTF8
    }
}
    
}

#===============================================================================
#                       INITIALIZATION
#===============================================================================

$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"

# Initialize context
$script:Context = $null

# Define Azure-only sources
$script:AzureOnlySources = @(
    "Azure",
    "Graph", 
    "Intune",
    "Licensing",
    "ExternalIdentity",
    "SharePoint",
    "Teams",
    "Exchange"
)

#===============================================================================
#                    UTILITY FUNCTIONS
#===============================================================================

function Get-CompanySelection {
    [CmdletBinding()]
    param()
    
    $profilesBasePath = "C:\MandADiscovery\Profiles"
    
    # Create profiles directory if it doesn't exist
    if (-not (Test-Path $profilesBasePath)) {
        New-Item -Path $profilesBasePath -ItemType Directory -Force | Out-Null
    }
    
    # Get existing company profiles
    $existingProfiles = Get-ChildItem -Path $profilesBasePath -Directory -ErrorAction SilentlyContinue | 
        Select-Object -ExpandProperty Name | 
        Sort-Object
    
    if ($existingProfiles.Count -gt 0) {
        Write-Host "`n=== Company Profile Selection ===" -ForegroundColor Cyan
        Write-Host "Existing company profiles found:" -ForegroundColor Yellow
        
        for ($i = 0; $i -lt $existingProfiles.Count; $i++) {
            Write-Host "  $($i + 1). $($existingProfiles[$i])" -ForegroundColor White
        }
        
        Write-Host "  N. Create new company profile" -ForegroundColor Green
        Write-Host ""
        
        do {
            $selection = Read-Host "Select a profile (1-$($existingProfiles.Count)) or 'N' for new"
            
            if ($selection -eq 'N' -or $selection -eq 'n') {
                $companyNameInput = Read-Host "Enter new company name" # Renamed to avoid conflict with param $CompanyName
                if ([string]::IsNullOrWhiteSpace($companyNameInput)) {
                    Write-Host "Company name cannot be empty" -ForegroundColor Red
                    continue
                }
                # Sanitize company name for filesystem
                $companyNameInput = $companyNameInput -replace '[<>:"/\\|?*]', '_'
                return $companyNameInput
            }
            elseif ($selection -match '^\d+$') {
                $index = [int]$selection - 1
                if ($index -ge 0 -and $index -lt $existingProfiles.Count) {
                    return $existingProfiles[$index]
                }
            }
            
            Write-Host "Invalid selection. Please try again." -ForegroundColor Red
        } while ($true)
    }
    else {
        Write-Host "`nNo existing company profiles found." -ForegroundColor Yellow
        $companyNameInput = Read-Host "Enter company name for new profile" # Renamed
        if ([string]::IsNullOrWhiteSpace($companyNameInput)) {
            throw "Company name cannot be empty"
        }
        # Sanitize company name for filesystem
        $companyNameInput = $companyNameInput -replace '[<>:"/\\|?*]', '_'
        return $companyNameInput
    }
}

function ConvertTo-HashtableRecursive {
    param(
        [Parameter(ValueFromPipeline)]
        $InputObject
    )
    
    process {
        if ($null -eq $InputObject) { return $null }
        
        if ($InputObject -is [System.Collections.IEnumerable] -and $InputObject -isnot [string] -and $InputObject -isnot [hashtable]) {
            return ,@($InputObject | ForEach-Object { ConvertTo-HashtableRecursive $_ })
        }
        
        if ($InputObject -is [PSCustomObject]) {
            $hash = @{}
            $InputObject.PSObject.Properties | ForEach-Object {
                $hash[$_.Name] = ConvertTo-HashtableRecursive $_.Value
            }
            return $hash
        }
        
        return $InputObject
    }
}


function Test-ModuleConfiguration {
    param(
        [hashtable]$Configuration,
        [string]$ModuleName
    )
    
    $requiredSettings = @{
        'ActiveDirectory' = @('environment.domainController', 'environment.globalCatalog')
        'Azure' = @() 
        'Exchange' = @('authentication.authenticationMethod')
        'Graph' = @() 
        'EnvironmentDetection' = @('environment.outputPath')
    }
    
    if (-not $requiredSettings.ContainsKey($ModuleName)) {
        return $true 
    }
    
    $missing = @()
    foreach ($setting in $requiredSettings[$ModuleName]) {
        $value = $Configuration
        $valid = $true
        
        foreach ($part in $setting.Split('.')) {
            if ($null -eq $value -or -not $value.ContainsKey($part)) {
                $valid = $false
                break
            }
            $value = $value[$part]
        }
        
        if (-not $valid -or $null -eq $value -or ($value -is [string] -and [string]::IsNullOrWhiteSpace($value)) ) {
            $missing += $setting
        }
    }
    
    if ($missing.Count -gt 0) {
        throw "Missing required configuration for $ModuleName module: $($missing -join ', ')"
    }
    
    return $true
}

function Import-ModuleWithManifest {
    param(
        [string]$ModulePath,
        [MandAContext]$Context
    )
    
    if ([string]::IsNullOrWhiteSpace($ModulePath)) {
        Write-MandALog "Module path is null or empty" -Level "ERROR" -Context $Context
        return $false
    }
    
    if (-not (Test-Path $ModulePath)) {
        Write-MandALog "Module file not found: $ModulePath" -Level "ERROR" -Context $Context
        return $false
    }
    
    $moduleName = [System.IO.Path]::GetFileNameWithoutExtension($ModulePath)
    $moduleDir = Split-Path $ModulePath -Parent
    
    if ([string]::IsNullOrWhiteSpace($moduleDir)) {
        Write-MandALog "Could not determine module directory for: $ModulePath" -Level "ERROR" -Context $Context
        return $false
    }
    
    $manifestPath = Join-Path $moduleDir "$moduleName.psd1"
    
    try {
        $global:_MandALoadingContext = @{
            Paths = $Context.Paths
            Config = $Context.Config
            CompanyName = $Context.Config.metadata.companyName
        }
        
        if (Test-Path $manifestPath) {
            Write-MandALog "Loading module from manifest: $manifestPath" -Level "DEBUG" -Context $Context
            Import-Module $manifestPath -Force -Global -ErrorAction Stop
            Write-MandALog "Loaded module from manifest: $moduleName" -Level "SUCCESS" -Context $Context
        } else {
            if ([string]::IsNullOrWhiteSpace($ModulePath)) {
                throw "ModulePath became null before Import-Module call"
            }
            Write-MandALog "Loading module directly from: $ModulePath" -Level "DEBUG" -Context $Context
            Import-Module $ModulePath -Force -Global -ErrorAction Stop
            Write-MandALog "Loaded module directly: $moduleName" -Level "SUCCESS" -Context $Context
        }
        return $true
    }
    catch {
        $Context.ErrorCollector.AddError("ModuleLoader", "Failed to load module: $moduleName - $($_.Exception.Message)", $_.Exception)
        Write-MandALog "Failed to load module: $moduleName - $($_.Exception.Message)" -Level "ERROR" -Context $Context
        Write-MandALog "Stack trace: $($_.ScriptStackTrace)" -Level "DEBUG" -Context $Context
        return $false
    }
    finally {
        Remove-Variable -Name "_MandALoadingContext" -Scope Global -ErrorAction SilentlyContinue
    }
}

#===============================================================================
#                    CORE ORCHESTRATION FUNCTIONS
#===============================================================================

function Initialize-MandAEnvironment {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [MandAContext]$Context,
        [Parameter(Mandatory=$true)]
        [string]$CurrentMode,
        [Parameter(Mandatory=$false)]
        [switch]$IsValidateOnlyMode
    )
    
    try {
        # Ensure logging is available as early as possible
        $loggingModulePath = Join-Path $Context.Paths.Utilities "EnhancedLogging.psm1"
        if (Test-Path $loggingModulePath) {
            Import-Module $loggingModulePath -Force -Global -ErrorAction Stop # Allow potential re-import
            if (Get-Command Initialize-Logging -ErrorAction SilentlyContinue) {
                Initialize-Logging -Configuration $Context.Config # Initialize with current context's config
            } else {
                Write-Warning "Initialize-Logging function not found after importing EnhancedLogging.psm1"
            }
        } else {
            Write-Warning "EnhancedLogging.psm1 not found at $loggingModulePath. Basic logging will be used."
        }

        Write-MandALog "INITIALIZING ENVIRONMENT FOR MODE: $CurrentMode" -Level "HEADER" -Context $Context
        
        if ($null -eq $global:MandA) {
            $global:MandA = @{
                Paths = $Context.Paths
                Config = $Context.Config
                CompanyName = $Context.Config.metadata.companyName
                Version = $Context.Version
            }
        }
        
        $directories = @(
            $Context.Paths.CompanyProfileRoot,
            $Context.Paths.RawDataOutput,
            $Context.Paths.ProcessedDataOutput,
            $Context.Paths.LogOutput,
            $Context.Paths.ExportOutput,
            $Context.Paths.TempPath
        )
        
        foreach ($dir in $directories) {
            if (-not (Test-Path $dir)) {
                New-Item -Path $dir -ItemType Directory -Force | Out-Null
                Write-MandALog "Created directory: $dir" -Level "INFO" -Context $Context
            }
        }
        
        $utilityModules = @(
            "FileOperations.psm1",
            "ValidationHelpers.psm1",
            "ConfigurationValidation.psm1",
            "ErrorHandling.psm1",
            "ProgressDisplay.psm1" 
        )
        
        foreach ($module in $utilityModules) {
            $modulePath = Join-Path $Context.Paths.Utilities $module
            if (-not (Import-ModuleWithManifest -ModulePath $modulePath -Context $Context)) {
                 if ($module -eq "ErrorHandling.psm1") { # ErrorHandling is critical too
                    throw "Critical utility module failed to load: $module"
                }
            }
        }
        
        $authModules = @(
            "Authentication\Authentication.psm1",
            "Authentication\CredentialManagement.psm1",
            "Connectivity\EnhancedConnectionManager.psm1"
        )
        
        foreach ($moduleRelPath in $authModules) {
            $modulePath = Join-Path $Context.Paths.Modules $moduleRelPath
            Import-ModuleWithManifest -ModulePath $modulePath -Context $Context
        }
        
        if (-not $IsValidateOnlyMode) {
            if(Get-Command Test-Prerequisites -ErrorAction SilentlyContinue){
                $prereqResult = Test-Prerequisites -Configuration $Context.Config -Context $Context
                if (-not $prereqResult) {
                    throw "System prerequisites validation failed."
                }
            } else {
                Write-MandALog "Test-Prerequisites function not found. Skipping." -Level "WARN" -Context $Context
            }
        }
        
        switch ($CurrentMode) {
            { $_ -in "Discovery", "Full", "AzureOnly" } {
                Import-DiscoveryModules -Context $Context
            }
            { $_ -in "Processing", "Full", "AzureOnly" } {
                Import-ProcessingModules -Context $Context
            }
            { $_ -in "Export", "Full", "AzureOnly" } {
                Import-ExportModules -Context $Context
            }
        }
        
        Write-MandALog "Environment initialization completed." -Level "SUCCESS" -Context $Context
        return $true
    }
    catch {
        $errorMessage = "Initialization failed: $($_.Exception.Message)"
        if ($Context -and $Context.ErrorCollector) {
            $Context.ErrorCollector.AddError("Environment", $errorMessage, $_.Exception)
        }
        # Try to log with Write-MandALog if available, otherwise Write-Error
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog $errorMessage -Level "ERROR" -Context $Context
        } else {
            Write-Error $errorMessage
        }
        throw # Re-throw to be caught by the main orchestrator's catch block
    }
}

function Import-DiscoveryModules {
    param([MandAContext]$Context)
    
    $discoveryPath = Join-Path $Context.Paths.Modules "Discovery"
    $enabledSources = @($Context.Config.discovery.enabledSources)
    
    Write-MandALog "Loading discovery modules for $($enabledSources.Count) sources" -Level "INFO" -Context $Context
    Write-MandALog "DEBUG: Enabled sources: $($enabledSources -join ', ')" -Level "DEBUG" -Context $Context
    
    $loadedCount = 0
    $failedCount = 0
    
    foreach ($source in $enabledSources) {
        try {
            Write-MandALog "DEBUG: Attempting to load module for source: $source" -Level "DEBUG" -Context $Context
            Test-ModuleConfiguration -Configuration $Context.Config -ModuleName $source
            $moduleFile = "${source}Discovery.psm1"
            $modulePath = Join-Path $discoveryPath $moduleFile
            Write-MandALog "DEBUG: Looking for module at: $modulePath" -Level "DEBUG" -Context $Context
            
            if (Test-Path $modulePath) {
                Write-MandALog "DEBUG: Module file found, attempting import..." -Level "DEBUG" -Context $Context
                $result = Import-ModuleWithManifest -ModulePath $modulePath -Context $Context
                if ($result) { $loadedCount++ } else { $failedCount++ }
            } else {
                $failedCount++
                $Context.ErrorCollector.AddWarning($source, "Discovery module not found: $moduleFile")
                Write-MandALog "WARNING: Discovery module not found: $moduleFile at $modulePath" -Level "WARN" -Context $Context
                $possibleFiles = Get-ChildItem -Path $discoveryPath -Filter "*${source}*.psm1" -ErrorAction SilentlyContinue
                if ($possibleFiles) {
                    Write-MandALog "DEBUG: Found similar files: $($possibleFiles.Name -join ', ')" -Level "DEBUG" -Context $Context
                }
            }
        }
        catch {
            $failedCount++
            $Context.ErrorCollector.AddError($source, "Failed to load discovery module: $($_.Exception.Message)", $_.Exception)
            Write-MandALog "ERROR: Exception loading $source module: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
    }
    Write-MandALog "Discovery module loading complete: $loadedCount loaded, $failedCount failed" -Level "INFO" -Context $Context
}

function Import-ProcessingModules {
    param([MandAContext]$Context)
    if ($null -eq $Context -or $null -eq $Context.Paths -or $null -eq $Context.Paths.Modules) {
        Write-MandALog "Invalid context or missing Modules path for Processing" -Level "ERROR" -Context $Context; return
    }
    $processingPath = Join-Path $Context.Paths.Modules "Processing"
    if (-not (Test-Path $processingPath)) {
        Write-MandALog "Processing modules directory not found: $processingPath" -Level "ERROR" -Context $Context; return
    }
    $processingModules = @("DataAggregation.psm1", "UserProfileBuilder.psm1", "WaveGeneration.psm1", "DataValidation.psm1")
    Write-MandALog "Loading processing modules from: $processingPath" -Level "INFO" -Context $Context
    foreach ($module in $processingModules) {
        if ([string]::IsNullOrWhiteSpace($module)) { continue }
        $modulePath = Join-Path $processingPath $module
        Write-MandALog "Attempting to load processing module: $module from path: $modulePath" -Level "DEBUG" -Context $Context
        if ([string]::IsNullOrWhiteSpace($modulePath)) { Write-MandALog "Module path is null for module: $module" -Level "ERROR" -Context $Context; continue }
        Import-ModuleWithManifest -ModulePath $modulePath -Context $Context
    }
}

function Import-ExportModules {
    param([MandAContext]$Context)
    if ($null -eq $Context -or $null -eq $Context.Paths -or $null -eq $Context.Paths.Modules) {
        Write-MandALog "Invalid context or missing Modules path for Export" -Level "ERROR" -Context $Context; return
    }
    $exportPath = Join-Path $Context.Paths.Modules "Export"
    if (-not (Test-Path $exportPath)) {
        Write-MandALog "Export modules directory not found: $exportPath" -Level "ERROR" -Context $Context; return
    }
    $enabledFormats = @($Context.Config.export.formats)
    Write-MandALog "Loading export modules for formats: $($enabledFormats -join ', ')" -Level "INFO" -Context $Context
    $formatMapping = @{ "CSV"="CSVExport.psm1"; "JSON"="JSONExport.psm1"; "Excel"="ExcelExport.psm1"; "CompanyControlSheet"="CompanyControlSheetExporter.psm1"; "PowerApps"="PowerAppsExporter.psm1" }
    foreach ($format in $enabledFormats) {
        if ($formatMapping.ContainsKey($format)) {
            $moduleFile = $formatMapping[$format]
            if ([string]::IsNullOrWhiteSpace($moduleFile)) { continue }
            $modulePath = Join-Path $exportPath $moduleFile
            Write-MandALog "Attempting to load export module: $moduleFile from path: $modulePath" -Level "DEBUG" -Context $Context
            if ([string]::IsNullOrWhiteSpace($modulePath)) { Write-MandALog "Module path is null for format: $format" -Level "ERROR" -Context $Context; continue }
            Import-ModuleWithManifest -ModulePath $modulePath -Context $Context
        } else {
            $Context.ErrorCollector.AddWarning("Export", "Unknown export format: $format")
        }
    }
}

function Invoke-DiscoveryPhase {
    [CmdletBinding()]
    param([MandAContext]$Context)

    if (-not $Context.OrchestratorState.CanExecute("Discovery")) {
        throw "Discovery phase execution limit exceeded or circular dependency detected. Path: $($Context.OrchestratorState.GetExecutionPath())"
    }
    $Context.OrchestratorState.PushExecution("Discovery")
    
    try {
        Write-MandALog "STARTING DISCOVERY PHASE" -Level "HEADER" -Context $Context
        $enabledSources = @($Context.Config.discovery.enabledSources)
        
        if ($enabledSources.Count -eq 0) {
            Write-MandALog "No discovery sources enabled in configuration." -Level "WARN" -Context $Context
            return @{}
        }

        $discoveryResults = Invoke-ParallelDiscoveryWithProgress -EnabledSources $enabledSources -Context $Context
        
        Write-MandALog "Discovery Phase Completed. Results collected for $($discoveryResults.Keys.Count) sources." -Level "SUCCESS" -Context $Context
        return $discoveryResults
    }
    catch {
        $Context.ErrorCollector.AddError("Discovery", "Discovery phase failed", $_.Exception)
        Write-MandALog "Discovery phase failed: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
    finally {
        $Context.OrchestratorState.PopExecution()
    }
}

function Invoke-ParallelDiscoveryWithProgress { # Changed from Invoke-ParallelDiscovery
    param(
        [string[]]$EnabledSources,
        [MandAContext]$Context
    )
    
    $throttleLimit = $Context.Config.discovery.maxConcurrentJobs | Get-OrElse 5
    Write-MandALog "Starting parallel discovery for $($EnabledSources.Count) sources (Throttle: $throttleLimit)" -Level "INFO" -Context $Context
    
    $runspacePool = [runspacefactory]::CreateRunspacePool(1, $ThrottleLimit)
    $runspacePool.Open()
    
    $runspaces = [System.Collections.Generic.List[object]]::new()
    $allResults = @{}
    
    $scriptBlock = {
        param(
            [string]$DiscoverySource, # Renamed for clarity
            [hashtable]$PassedContextData,
            [string]$PassedModulesPath,
            [hashtable]$PassedGlobalMandA
        )
        
        try {
            $ErrorActionPreference = "Stop"
            $global:MandA = $PassedGlobalMandA # Re-establish global context for the runspace
            
            # Load necessary utilities, especially logging
            $utilityPath = Join-Path $PassedModulesPath "Utilities"
            $loggingModulePath = Join-Path $utilityPath "EnhancedLogging.psm1"
            if (Test-Path $loggingModulePath) { Import-Module $loggingModulePath -Force -Global }

            # Construct a minimal context for the discovery module
            # This context is local to the runspace and simpler than the full MandAContext class instance
            $runspaceContext = [PSCustomObject]@{
                Paths = $PassedContextData.Paths
                Config = $PassedContextData.Config
                CompanyName = $PassedContextData.CompanyName 
                Version = $PassedContextData.Version
                # ErrorCollector is not easily passed to runspaces; errors will be caught and returned
            }

            $moduleFile = "${DiscoverySource}Discovery.psm1"
            $modulePath = Join-Path $PassedModulesPath "Discovery\$moduleFile"
            
            if (-not (Test-Path $modulePath)) { throw "Module not found: $modulePath" }
            Import-Module $modulePath -Force -Global
            
            $functionName = "Invoke-${DiscoverySource}Discovery"
            if (-not (Get-Command $functionName -ErrorAction SilentlyContinue)) {
                throw "Function $functionName not found in module $DiscoverySource"
            }
            
            # Use Write-MandALog if available, otherwise Write-Host for progress within runspace
            $logFunc = if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { ${function:Write-MandALog} } else { ${function:Write-Host} }
            $logFunc.Invoke("[$DiscoverySource] Starting discovery task in runspace..." , "INFO", $runspaceContext)

            $discoveryData = & $functionName -Configuration $PassedContextData.Config -Context $runspaceContext
            
            $logFunc.Invoke("[$DiscoverySource] Discovery task completed in runspace." , "SUCCESS", $runspaceContext)
            return [PSCustomObject]@{ Source = $DiscoverySource; Success = $true; Data = $discoveryData; Error = $null }
        }
        catch {
            # Try to log error within runspace if possible
            $errMsg = "Error in $DiscoverySource discovery runspace: $($_.Exception.Message)"
            if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
                 Write-MandALog $errMsg -Level "ERROR" # Context might not be fully available here for logging
            } else {
                Write-Warning $errMsg
            }
            return [PSCustomObject]@{ Source = $DiscoverySource; Success = $false; Data = $null; Error = $_.Exception.Message; StackTrace = $_.ScriptStackTrace; FullException = $_ }
        }
    }
    
    foreach ($sourceName in $EnabledSources) {
        $powershell = [powershell]::Create().AddScript($scriptBlock)
        [void]$powershell.AddArgument($sourceName)
        [void]$powershell.AddArgument($Context) # Pass the whole MandAContext object
        [void]$powershell.AddArgument($Context.Paths.Modules)
        [void]$powershell.AddArgument($global:MandA) # Pass the main thread's $global:MandA
        
        $powershell.RunspacePool = $runspacePool
        $runspaces.Add([PSCustomObject]@{
            Instance = $powershell
            Handle = $powershell.BeginInvoke()
            Source = $sourceName
            StartTime = Get-Date
        })
        Write-MandALog "Queued $sourceName discovery" -Level "DEBUG" -Context $Context
    }
    
    $totalTasks = $runspaces.Count
    $completedTasks = 0
    
    while ($runspaces.Count -gt 0) {
        $done = $runspaces | Where-Object { $_.Handle.IsCompleted }
        
        foreach ($task in $done) {
            $completedTasks++
            try {
                $jobResult = $task.Instance.EndInvoke($task.Handle)
                if ($jobResult.Success) {
                    $allResults[$jobResult.Source] = $jobResult.Data
                    Write-MandALog "Discovery completed for $($jobResult.Source)" -Level "SUCCESS" -Context $Context
                } else {
                    $Context.ErrorCollector.AddError($jobResult.Source, $jobResult.Error, $jobResult.FullException)
                    Write-MandALog "Discovery failed for $($jobResult.Source): $($jobResult.Error)" -Level "ERROR" -Context $Context
                }
            }
            catch {
                $Context.ErrorCollector.AddError($task.Source, "Failed to retrieve results from runspace: $($_.Exception.Message)", $_.Exception)
                Write-MandALog "Failed to get results for $($task.Source): $($_.Exception.Message)" -Level "ERROR" -Context $Context
            }
            finally {
                $task.Instance.Dispose()
                $runspaces.Remove($task)
            }
            # Update progress display
            if (Get-Command Write-DiscoveryProgress -ErrorAction SilentlyContinue) {
                 Write-DiscoveryProgress -Total $totalTasks -Completed $completedTasks -CurrentSource $task.Source
            } else {
                Write-Host "Progress: $completedTasks / $totalTasks completed." -NoNewline; Start-Sleep -Milliseconds 10; Write-Host "`r" -NoNewline
            }
        }
        if ($runspaces.Count -gt 0) { Start-Sleep -Milliseconds 200 }
    }
    
    if (Get-Command Write-DiscoveryProgress -ErrorAction SilentlyContinue) { Write-DiscoveryProgress -Total $totalTasks -Completed $completedTasks -CompletedAll $true }
    
    $runspacePool.Close()
    $runspacePool.Dispose()
    
    Write-MandALog "Parallel discovery finished. Successful: $($allResults.Keys.Count), Failed: $($totalTasks - $allResults.Keys.Count)" -Level "INFO" -Context $Context
    return $allResults
}

function Invoke-ProcessingPhase {
    [CmdletBinding()]
    param([MandAContext]$Context) # This is line 960
    
    if (-not $Context.OrchestratorState.CanExecute("Processing")) { # This is line 962
        throw "Processing phase execution limit exceeded or circular dependency detected. Path: $($Context.OrchestratorState.GetExecutionPath())"
    }
    $Context.OrchestratorState.PushExecution("Processing")
    
    try {
        Write-MandALog "STARTING PROCESSING PHASE" -Level "HEADER" -Context $Context
        $rawDataPath = $Context.Paths.RawDataOutput
        if (-not (Test-Path $rawDataPath)) { throw "Raw data directory not found ($rawDataPath). Please run Discovery phase first." }
        $csvFiles = Get-ChildItem -Path $rawDataPath -Filter "*.csv" -File
        if ($csvFiles.Count -eq 0) { throw "No raw data files found in $rawDataPath. Please run Discovery phase first." }
        Write-MandALog "Found $($csvFiles.Count) raw data files to process" -Level "INFO" -Context $Context

        $dataAggModule = Get-Module -Name "DataAggregation" -ErrorAction SilentlyContinue
        if (-not $dataAggModule) {
            $dataAggPath = Join-Path $Context.Paths.Modules "Processing\DataAggregation.psm1"
            if (Test-Path $dataAggPath) { Import-ModuleWithManifest -ModulePath $dataAggPath -Context $Context }
            else { throw "DataAggregation module file not found at $dataAggPath" }
        }

        if (Get-Command "Start-DataAggregation" -ErrorAction SilentlyContinue) {
            Write-MandALog "Calling Start-DataAggregation..." -Level "INFO" -Context $Context
            $processingResult = Start-DataAggregation -Configuration $Context.Config -Context $Context
            if (-not $processingResult) { throw "Data aggregation failed" }
            Write-MandALog "Processing Phase Completed Successfully" -Level "SUCCESS" -Context $Context
            return $true
        } else {
            throw "Processing function 'Start-DataAggregation' not found after attempting to load module."
        }
    }
    catch {
        $Context.ErrorCollector.AddError("Processing", "Processing phase failed: $($_.Exception.Message)", $_.Exception)
        Write-MandALog "Processing phase failed: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
    finally {
        $Context.OrchestratorState.PopExecution()
    }
}

function Invoke-ExportPhase {
    [CmdletBinding()]
    param([MandAContext]$Context)
    
    if (-not $Context.OrchestratorState.CanExecute("Export")) {
        throw "Export phase execution limit exceeded or circular dependency detected. Path: $($Context.OrchestratorState.GetExecutionPath())"
    }
    $Context.OrchestratorState.PushExecution("Export")
    
    try {
        Write-MandALog "STARTING EXPORT PHASE" -Level "HEADER" -Context $Context
        $processedDataPath = $Context.Paths.ProcessedDataOutput
        if (-not (Test-Path $processedDataPath)) { throw "Processed data directory not found ($processedDataPath). Please run Processing phase first." }
        
        $dataToExport = @{}
        $processedFiles = Get-ChildItem -Path $processedDataPath -Filter "*.csv" -File
        if ($processedFiles.Count -eq 0) { throw "No processed data files found in $processedDataPath. Please run Processing phase first." }
        
        foreach ($file in $processedFiles) {
            $dataKey = $file.BaseName
            try {
                $dataToExport[$dataKey] = Import-Csv -Path $file.FullName
                Write-MandALog "Loaded $($dataToExport[$dataKey].Count) records from $($file.Name)" -Level "INFO" -Context $Context
            } catch { $Context.ErrorCollector.AddError("Export", "Failed to load file: $($file.Name)", $_.Exception) }
        }
        
        $enabledFormats = @($Context.Config.export.formats)
        $exportSuccess = $true
        
        foreach ($format in $enabledFormats) {
            $functionName = Get-ExportFunctionName -Format $format
            if (Get-Command $functionName -ErrorAction SilentlyContinue) {
                try {
                    Write-MandALog "Executing $functionName for format '$format'" -Level "INFO" -Context $Context
                    & $functionName -ProcessedData $dataToExport -Configuration $Context.Config -Context $Context
                    Write-MandALog "Export completed for format '$format'" -Level "SUCCESS" -Context $Context
                } catch {
                    $Context.ErrorCollector.AddError("Export_$format", "Export for $format failed: $($_.Exception.Message)", $_.Exception)
                    $exportSuccess = $false
                }
            } else { $Context.ErrorCollector.AddWarning("Export", "Export function not found for format '$format': $functionName") }
        }
        
        if ($exportSuccess) { Write-MandALog "Export Phase Completed Successfully" -Level "SUCCESS" -Context $Context }
        else { Write-MandALog "Export Phase Completed with Errors" -Level "WARN" -Context $Context }
        return $exportSuccess
    }
    catch {
        $Context.ErrorCollector.AddError("Export", "Export phase failed: $($_.Exception.Message)", $_.Exception)
        Write-MandALog "Export phase failed: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
    finally {
        $Context.OrchestratorState.PopExecution()
    }
}

function Get-ExportFunctionName {
    param([string]$Format)
    $mapping = @{ "PowerApps"="Export-ForPowerApps"; "CompanyControlSheet"="Export-ToCompanyControlSheet"; "CSV"="Export-ToCSV"; "JSON"="Export-ToJSON"; "Excel"="Export-ToExcel" }
    if ($mapping.ContainsKey($Format)) { return $mapping[$Format] }
    return "Export-To$Format"
}

function Complete-MandADiscovery {
    [CmdletBinding()]
    param([MandAContext]$Context)
    
    Write-MandALog "FINALIZING M&A DISCOVERY SUITE EXECUTION" -Level "HEADER" -Context $Context
    if ($Context.ErrorCollector.HasErrors()) {
        $errorReportPath = Join-Path $Context.Paths.LogOutput "ErrorReport_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
        $Context.ErrorCollector.ExportToFile($errorReportPath)
        Write-MandALog "Error report exported to: $errorReportPath" -Level "WARN" -Context $Context
    }
    $duration = (Get-Date) - $Context.StartTime
    Write-MandALog "Execution completed in: $($duration.ToString('hh\:mm\:ss'))" -Level "INFO" -Context $Context
    Write-MandALog "Error Summary: $($Context.ErrorCollector.GetSummary())" -Level "INFO" -Context $Context
    Write-MandALog "Output locations:" -Level "INFO" -Context $Context
    Write-MandALog "  - Logs: $($Context.Paths.LogOutput)" -Level "INFO" -Context $Context
    Write-MandALog "  - Raw Data: $($Context.Paths.RawDataOutput)" -Level "INFO" -Context $Context
    Write-MandALog "  - Processed: $($Context.Paths.ProcessedDataOutput)" -Level "INFO" -Context $Context
    Write-MandALog "  - Exports: $($Context.Paths.ExportOutput)" -Level "INFO" -Context $Context
}

#===============================================================================
#                        MAIN EXECUTION BLOCK
#===============================================================================

try {
    if ($null -eq $global:MandA) {
        Write-Host "Global environment not initialized by Set-SuiteEnvironment.ps1. Attempting to load it..." -ForegroundColor Yellow
        $envScriptPath = Join-Path (Split-Path $PSScriptRoot -Parent) "Scripts\Set-SuiteEnvironment.ps1"
        if (Test-Path $envScriptPath) {
            # Determine CompanyName if not provided to the orchestrator directly
            if ([string]::IsNullOrWhiteSpace($CompanyName)) {
                $CompanyNameForEnv = Get-CompanySelection # Prompt if orchestrator doesn't have it
            } else {
                $CompanyNameForEnv = $CompanyName
            }
            . $envScriptPath -CompanyName $CompanyNameForEnv -ProvidedSuiteRoot (Split-Path $PSScriptRoot -Parent)
            if ($null -eq $global:MandA) { throw "Failed to initialize global environment via Set-SuiteEnvironment.ps1" }
             Write-Host "Global environment loaded successfully via Set-SuiteEnvironment.ps1." -ForegroundColor Green
        } else {
            throw "Set-SuiteEnvironment.ps1 not found at $envScriptPath. Cannot proceed."
        }
    }
    
    # Ensure CompanyName is set, either from parameter or global context
    if ([string]::IsNullOrWhiteSpace($CompanyName)) {
        if ($null -ne $global:MandA -and -not [string]::IsNullOrWhiteSpace($global:MandA.CompanyName)) {
            $CompanyName = $global:MandA.CompanyName
            Write-Host "Using CompanyName from global context: $CompanyName" -ForegroundColor Cyan
        } else {
             # This case should ideally be handled by QuickStart or the above Set-SuiteEnvironment call
            throw "CompanyName is not defined. Please provide it or run via QuickStart.ps1."
        }
    } else {
         # If CompanyName was provided as a parameter, ensure global context matches or is updated
        if ($null -ne $global:MandA -and $global:MandA.CompanyName -ne $CompanyName) {
            Write-Warning "CompanyName parameter '$CompanyName' differs from global context '$($global:MandA.CompanyName)'. Re-initializing environment."
            $envScriptPathReinit = Join-Path (Split-Path $PSScriptRoot -Parent) "Scripts\Set-SuiteEnvironment.ps1"
            . $envScriptPathReinit -CompanyName $CompanyName -ProvidedSuiteRoot (Split-Path $PSScriptRoot -Parent)
        }
    }
    $CompanyName = $CompanyName -replace '[<>:"/\\|?*]', '_' # Sanitize

    # Configuration loading
    $configuration = $null
    if ($null -ne $global:MandA -and $null -ne $global:MandA.Config) {
        $configuration = $global:MandA.Config
        Write-Host "Using configuration from global context for company: $($configuration.metadata.companyName)" -ForegroundColor Green
    } else {
        $configPath = $ConfigurationFile
        if ([string]::IsNullOrWhiteSpace($configPath)) {
            $configPath = Join-Path (Split-Path $PSScriptRoot -Parent) "Configuration\default-config.json"
        } elseif (-not ([System.IO.Path]::IsPathRooted($configPath))) {
            $configPath = Join-Path (Split-Path $PSScriptRoot -Parent) $configPath
        }
        if (-not (Test-Path $configPath)) { throw "Configuration file not found: $configPath" }
        $configContent = Get-Content -Path $configPath -Raw | ConvertFrom-Json -ErrorAction Stop
        $configuration = ConvertTo-HashtableRecursive -InputObject $configContent
        Write-Host "Loaded configuration from: $configPath" -ForegroundColor Green
    }
    
    if ($null -eq $configuration) { throw "Configuration could not be loaded."}
    $configuration.metadata.companyName = $CompanyName # Ensure config reflects current company

    if ($Force.IsPresent) { $configuration.discovery.skipExistingFiles = $false }

    if ($Mode -eq "AzureOnly") {
        Write-Host "`nAzure-Only mode selected. Limiting discovery to cloud sources." -ForegroundColor Cyan
        $currentSources = @($configuration.discovery.enabledSources) # Ensure it's an array
        $configuration.discovery.enabledSources = $currentSources | Where-Object { $_ -in $script:AzureOnlySources }
        Write-Host "Enabled sources for Azure-Only: $($configuration.discovery.enabledSources -join ', ')" -ForegroundColor Yellow
        $Mode = "Full" 
    }
    
    $script:Context = [MandAContext]::new($configuration, $CompanyName)
    Write-Host "[DEBUG ORCH] Context object created. Config is present: $($null -ne $script:Context.Config)" -ForegroundColor Magenta
    
    Initialize-MandAEnvironment -Context $script:Context -CurrentMode $Mode -IsValidateOnlyMode:$ValidateOnly
    Write-Host "[DEBUG ORCH] Environment Initialized. Context.Config is present: $($null -ne $script:Context.Config)" -ForegroundColor Magenta
    
    if ($ValidateOnly.IsPresent) {
        Write-MandALog "Validation completed successfully" -Level "SUCCESS" -Context $script:Context
        exit 0
    }
    
    if ($Mode -in "Discovery", "Full") { # "AzureOnly" becomes "Full"
        Write-MandALog "AUTHENTICATION & CONNECTION SETUP" -Level "HEADER" -Context $script:Context
        if (Get-Command "Initialize-MandAAuthentication" -ErrorAction SilentlyContinue) {
            try {
                $authResult = Initialize-MandAAuthentication -Configuration $script:Context.Config -Context $script:Context # Use $script:Context.Config
                if ($authResult -and $authResult.Authenticated) {
                    Write-MandALog "Authentication successful" -Level "SUCCESS" -Context $script:Context
                    if (Get-Command "Initialize-AllConnections" -ErrorAction SilentlyContinue) {
                        $connectionStatus = Initialize-AllConnections -Configuration $script:Context.Config -AuthContext $authResult.Context -Context $script:Context
                        foreach ($service in $connectionStatus.Keys) {
                            $status = $connectionStatus[$service]; $isConnected = if ($status -is [bool]) { $status } else { $status.Connected }
                            Write-MandALog ("Connected to $service $isConnected") -Level (if($isConnected){"SUCCESS"}else{"WARN"}) -Context $script:Context
                        }
                    }
                } else {
                    $errorMsg = if ($authResult -and $authResult.Error) { $authResult.Error } else { "Authentication failed - no details" }
                    $script:Context.ErrorCollector.AddError("Authentication", $errorMsg, $null)
                    if (($script:Context.Config.environment.connectivity.haltOnConnectionError | Get-OrElse @()) -contains "Authentication") {
                        throw "Critical Authentication failed: $errorMsg"
                    }
                }
            } catch {
                $errorMsg = $_.Exception.Message
                $script:Context.ErrorCollector.AddError("Authentication", "Init failed: $errorMsg", $_.Exception)
                if (($script:Context.Config.environment.connectivity.haltOnConnectionError | Get-OrElse @()) -contains "Authentication") {
                    throw "Critical Authentication Init failed: $errorMsg"
                }
            }
        } else { throw "Initialize-MandAAuthentication function not found." }
    }
    
    Write-Host "[DEBUG ORCH] Before Switch. Mode: $Mode. Context is null: $($null -eq $script:Context)" -ForegroundColor Yellow
    if($null -ne $script:Context) {
         Write-Host "[DEBUG ORCH] Before Switch. Context.OrchestratorState is null: $($null -eq $script:Context.OrchestratorState)" -ForegroundColor Yellow
    }

    switch ($Mode) {
        "Discovery" { Invoke-DiscoveryPhase -Context $script:Context }
        "Processing" { Invoke-ProcessingPhase -Context $script:Context }
        "Export" { Invoke-ExportPhase -Context $script:Context }
        "Full" { 
            Invoke-DiscoveryPhase -Context $script:Context
            Write-Host "[DEBUG ORCH] After DiscoveryPhase. Context is null: $($null -eq $script:Context)" -ForegroundColor Yellow
             if($null -ne $script:Context) {
                Write-Host "[DEBUG ORCH] After DiscoveryPhase. Context.OrchestratorState is null: $($null -eq $script:Context.OrchestratorState)" -ForegroundColor Yellow
            }
            Invoke-ProcessingPhase -Context $script:Context
            Write-Host "[DEBUG ORCH] After ProcessingPhase. Context is null: $($null -eq $script:Context)" -ForegroundColor Yellow
            Invoke-ExportPhase -Context $script:Context 
        }
    }
    
    Complete-MandADiscovery -Context $script:Context
    
    if ($script:Context.ErrorCollector.HasCriticalErrors()) { exit 2 }
    elseif ($script:Context.ErrorCollector.HasErrors()) { exit 1 }
    else { exit 0 }
}
catch {
    Write-Host "ORCHESTRATOR CRITICAL ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack Trace: $($_.ScriptStackTrace)" -ForegroundColor Yellow
    if ($script:Context -and $script:Context.ErrorCollector) {
        $script:Context.ErrorCollector.AddError("OrchestratorCore", "Fatal error: $($_.Exception.Message)", $_.Exception)
        if(Get-Command Complete-MandADiscovery -ErrorAction SilentlyContinue) {
             Complete-MandADiscovery -Context $script:Context
        }
    }
    exit 3
}
finally {
    if ($script:Context -and (Get-Command "Disconnect-AllServices" -ErrorAction SilentlyContinue)) {
        try { Disconnect-AllServices } catch { Write-Warning "Error during service disconnection: $($_.Exception.Message)" }
    }
}

# Helper function Get-OrElse (if not available globally or via a module)
if (-not (Get-Command Get-OrElse -ErrorAction SilentlyContinue)) {
    function Get-OrElse {
        param($Value, $Default)
        if ($null -ne $Value) { return $Value } else { return $Default }
    }
}

