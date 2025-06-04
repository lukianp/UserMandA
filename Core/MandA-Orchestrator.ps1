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
        $profilesBasePath = "C:\MandADiscovery\Profiles"
        
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
        
        # Update config with resolved path
        $this.Config.environment.outputPath = $this.Paths.CompanyProfileRoot
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
        $report = @{
            Summary = $this.GetSummary()
            GeneratedAt = Get-Date
            Errors = $this.Errors
            Warnings = $this.Warnings
            ErrorCounts = $this.ErrorCounts
        }
        $report | ConvertTo-Json -Depth 10 | Set-Content -Path $FilePath -Encoding UTF8
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
                $companyName = Read-Host "Enter new company name"
                if ([string]::IsNullOrWhiteSpace($companyName)) {
                    Write-Host "Company name cannot be empty" -ForegroundColor Red
                    continue
                }
                # Sanitize company name for filesystem
                $companyName = $companyName -replace '[<>:"/\\|?*]', '_'
                return $companyName
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
        $companyName = Read-Host "Enter company name for new profile"
        if ([string]::IsNullOrWhiteSpace($companyName)) {
            throw "Company name cannot be empty"
        }
        # Sanitize company name for filesystem
        $companyName = $companyName -replace '[<>:"/\\|?*]', '_'
        return $companyName
    }
}

function ConvertTo-HashtableRecursive {
    param(
        [Parameter(ValueFromPipeline)]
        $InputObject
    )
    
    process {
        if ($null -eq $InputObject) { return $null }
        
        if ($InputObject -is [System.Collections.IEnumerable] -and $InputObject -isnot [string]) {
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
        'Azure' = @('authentication.tenantId', 'authentication.clientId')
        'Exchange' = @('authentication.authenticationMethod')
        'Graph' = @('authentication.tenantId')
        'EnvironmentDetection' = @('environment.outputPath')
    }
    
    if (-not $requiredSettings.ContainsKey($ModuleName)) {
        return $true  # No specific requirements
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
        
        if (-not $valid -or $null -eq $value -or $value -eq '') {
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
    
    $moduleName = [System.IO.Path]::GetFileNameWithoutExtension($ModulePath)
    $moduleDir = Split-Path $ModulePath -Parent
    $manifestPath = Join-Path $moduleDir "$moduleName.psd1"
    
    try {
        # Check for manifest
        if (Test-Path $manifestPath) {
            Import-Module $manifestPath -Force -Global -ErrorAction Stop
            Write-MandALog "Loaded module from manifest: $moduleName" -Level "SUCCESS" -Context $Context
        } else {
            Import-Module $ModulePath -Force -Global -ErrorAction Stop
            Write-MandALog "Loaded module directly: $moduleName" -Level "SUCCESS" -Context $Context
        }
        return $true
    }
    catch {
        $Context.ErrorCollector.AddError("ModuleLoader", "Failed to load module: $moduleName", $_.Exception)
        Write-MandALog "Failed to load module: $moduleName - $($_.Exception.Message)" -Level "ERROR" -Context $Context
        return $false
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
        Write-MandALog "INITIALIZING ENVIRONMENT FOR MODE: $CurrentMode" -Level "HEADER" -Context $Context
        
        # Validate context
        if (-not $Context.ValidateContext()) {
            throw "Context validation failed. Required paths are missing."
        }
        
        # Initialize output directories
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
        
        # Load core utilities
        $utilityModules = @(
            "EnhancedLogging.psm1",
            "FileOperations.psm1",
            "ValidationHelpers.psm1",
            "ConfigurationValidation.psm1",
            "ErrorHandling.psm1",
            "DataExport.psm1"
        )
        
        foreach ($module in $utilityModules) {
            $modulePath = Join-Path $Context.Paths.Utilities $module
            if (-not (Import-ModuleWithManifest -ModulePath $modulePath -Context $Context)) {
                if ($module -in @("EnhancedLogging.psm1", "ErrorHandling.psm1")) {
                    throw "Critical utility module failed to load: $module"
                }
            }
        }
        
        # Initialize logging
        if (Get-Command Initialize-Logging -ErrorAction SilentlyContinue) {
            Initialize-Logging -Configuration $Context.Config
        }
        
        # Load authentication modules
        $authModules = @(
            "Authentication\Authentication.psm1",
            "Authentication\CredentialManagement.psm1",
            "Connectivity\EnhancedConnectionManager.psm1"
        )
        
        foreach ($moduleRelPath in $authModules) {
            $modulePath = Join-Path $Context.Paths.Modules $moduleRelPath
            Import-ModuleWithManifest -ModulePath $modulePath -Context $Context
        }
        
        # Validate prerequisites
        if (-not $IsValidateOnlyMode) {
            $prereqResult = Test-Prerequisites -Configuration $Context.Config -Context $Context
            if (-not $prereqResult) {
                throw "System prerequisites validation failed."
            }
        }
        
        # Load mode-specific modules
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
        $Context.ErrorCollector.AddError("Environment", "Initialization failed", $_.Exception)
        Write-MandALog "Environment initialization failed: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Import-DiscoveryModules {
    param([MandAContext]$Context)
    
    $discoveryPath = Join-Path $Context.Paths.Modules "Discovery"
    $enabledSources = @($Context.Config.discovery.enabledSources)
    
    Write-MandALog "Loading discovery modules for $($enabledSources.Count) sources" -Level "INFO" -Context $Context
    
    foreach ($source in $enabledSources) {
        try {
            # Validate module configuration first
            Test-ModuleConfiguration -Configuration $Context.Config -ModuleName $source
            
            $moduleFile = "${source}Discovery.psm1"
            $modulePath = Join-Path $discoveryPath $moduleFile
            
            if (Test-Path $modulePath) {
                Import-ModuleWithManifest -ModulePath $modulePath -Context $Context
            } else {
                $Context.ErrorCollector.AddWarning($source, "Discovery module not found: $moduleFile")
            }
        }
        catch {
            $Context.ErrorCollector.AddError($source, "Failed to load discovery module", $_.Exception)
        }
    }
}

function Import-ProcessingModules {
    param([MandAContext]$Context)
    
    $processingPath = Join-Path $Context.Paths.Modules "Processing"
    $processingModules = @(
        "DataAggregation.psm1",
        "UserProfileBuilder.psm1",
        "WaveGeneration.psm1",
        "DataValidation.psm1"
    )
    
    Write-MandALog "Loading processing modules" -Level "INFO" -Context $Context
    
    foreach ($module in $processingModules) {
        $modulePath = Join-Path $processingPath $module
        Import-ModuleWithManifest -ModulePath $modulePath -Context $Context
    }
}

function Import-ExportModules {
    param([MandAContext]$Context)
    
    $exportPath = Join-Path $Context.Paths.Modules "Export"
    $enabledFormats = @($Context.Config.export.formats)
    
    Write-MandALog "Loading export modules for formats: $($enabledFormats -join ', ')" -Level "INFO" -Context $Context
    
    $formatMapping = @{
        "CSV" = "CSVExport.psm1"
        "JSON" = "JSONExport.psm1"
        "Excel" = "ExcelExport.psm1"
        "CompanyControlSheet" = "CompanyControlSheetExporter.psm1"
        "PowerApps" = "PowerAppsExporter.psm1"
    }
    
    foreach ($format in $enabledFormats) {
        if ($formatMapping.ContainsKey($format)) {
            $moduleFile = $formatMapping[$format]
            $modulePath = Join-Path $exportPath $moduleFile
            Import-ModuleWithManifest -ModulePath $modulePath -Context $Context
        } else {
            $Context.ErrorCollector.AddWarning("Export", "Unknown export format: $format")
        }
    }
}

function Invoke-ParallelDiscovery {
    param(
        [string[]]$EnabledSources,
        [MandAContext]$Context,
        [int]$ThrottleLimit = 5
    )
    
    Write-MandALog "Starting parallel discovery for $($EnabledSources.Count) sources (Throttle: $ThrottleLimit)" -Level "INFO" -Context $Context
    
    # For PowerShell 5.1 compatibility, we'll use jobs
    $discoveryJobs = @()
    
    foreach ($source in $EnabledSources) {
        $job = Start-Job -Name "Discovery_$source" -ScriptBlock {
            param($source, $contextData, $modulesPath)
            
            try {
                # Reconstruct minimal context in job
                $moduleFile = "${source}Discovery.psm1"
                $modulePath = Join-Path $modulesPath "Discovery\$moduleFile"
                
                if (Test-Path $modulePath) {
                    Import-Module $modulePath -Force
                    $result = & "Invoke-${source}Discovery" -Configuration $contextData.Config -Context $contextData
                    
                    return [PSCustomObject]@{
                        Source = $source
                        Success = $true
                        Data = $result
                        Error = $null
                    }
                } else {
                    throw "Module not found: $modulePath"
                }
            }
            catch {
                return [PSCustomObject]@{
                    Source = $source
                    Success = $false
                    Data = $null
                    Error = $_.Exception.Message
                    StackTrace = $_.ScriptStackTrace
                }
            }
        } -ArgumentList $source, @{Config = $Context.Config; Paths = $Context.Paths}, $Context.Paths.Modules
        
        $discoveryJobs += $job
        
        # Throttle job creation
        while ((Get-Job -State Running).Count -ge $ThrottleLimit) {
            Start-Sleep -Milliseconds 500
        }
    }
    
    # Wait for all jobs and collect results
    $results = @{}
    $completedJobs = $discoveryJobs | Wait-Job | Receive-Job
    
    foreach ($jobResult in $completedJobs) {
        if ($jobResult.Success) {
            $results[$jobResult.Source] = $jobResult.Data
            Write-MandALog "Discovery completed for $($jobResult.Source)" -Level "SUCCESS" -Context $Context
        } else {
            $Context.ErrorCollector.AddError($jobResult.Source, $jobResult.Error, $null)
            Write-MandALog "Discovery failed for $($jobResult.Source): $($jobResult.Error)" -Level "ERROR" -Context $Context
        }
    }
    
    # Clean up jobs
    $discoveryJobs | Remove-Job -Force
    
    return $results
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
        $useParallel = $Context.Config.discovery.parallelProcessing -and $enabledSources.Count -gt 1
        
        if ($useParallel) {
            $throttle = if ($Context.Config.discovery.maxConcurrentJobs) { 
                $Context.Config.discovery.maxConcurrentJobs 
            } else { 5 }
            
            $discoveryResults = Invoke-ParallelDiscovery -EnabledSources $enabledSources -Context $Context -ThrottleLimit $throttle
        } else {
            # Sequential discovery
            $discoveryResults = @{}
            foreach ($source in $enabledSources) {
                $functionName = "Invoke-${source}Discovery"
                if (Get-Command $functionName -ErrorAction SilentlyContinue) {
                    try {
                        Write-MandALog "Invoking $functionName" -Level "INFO" -Context $Context
                        $result = & $functionName -Configuration $Context.Config -Context $Context
                        $discoveryResults[$source] = $result
                        Write-MandALog "Completed discovery for $source" -Level "SUCCESS" -Context $Context
                    }
                    catch {
                        $Context.ErrorCollector.AddError($source, "Discovery failed", $_.Exception)
                        Write-MandALog "Discovery failed for $source - $($_.Exception.Message)" -Level "ERROR" -Context $Context
                    }
                } else {
                    $Context.ErrorCollector.AddWarning($source, "Discovery function not found: $functionName")
                }
            }
        }
        
        Write-MandALog "Discovery Phase Completed. Summary: $($Context.ErrorCollector.GetSummary())" -Level "SUCCESS" -Context $Context
        return $discoveryResults
    }
    finally {
        $Context.OrchestratorState.PopExecution()
    }
}

function Invoke-ProcessingPhase {
    [CmdletBinding()]
    param([MandAContext]$Context)
    
    if (-not $Context.OrchestratorState.CanExecute("Processing")) {
        throw "Processing phase execution limit exceeded or circular dependency detected. Path: $($Context.OrchestratorState.GetExecutionPath())"
    }
    
    $Context.OrchestratorState.PushExecution("Processing")
    
    try {
        Write-MandALog "STARTING PROCESSING PHASE" -Level "HEADER" -Context $Context
        
        # Verify raw data exists
        $rawDataPath = $Context.Paths.RawDataOutput
        if (-not (Test-Path $rawDataPath)) {
            throw "Raw data directory not found. Please run Discovery phase first."
        }
        
        $csvFiles = Get-ChildItem -Path $rawDataPath -Filter "*.csv" -File
        if ($csvFiles.Count -eq 0) {
            throw "No raw data files found. Please run Discovery phase first."
        }
        
        Write-MandALog "Found $($csvFiles.Count) raw data files to process" -Level "INFO" -Context $Context
        
        # Run data aggregation
        if (Get-Command "Start-DataAggregation" -ErrorAction SilentlyContinue) {
            $processingResult = Start-DataAggregation -Configuration $Context.Config -Context $Context
            
            if (-not $processingResult) {
                throw "Data aggregation failed"
            }
            
            Write-MandALog "Processing Phase Completed Successfully" -Level "SUCCESS" -Context $Context
            return $true
        } else {
            throw "Processing function 'Start-DataAggregation' not found"
        }
    }
    catch {
        $Context.ErrorCollector.AddError("Processing", "Processing phase failed", $_.Exception)
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
        
        # Verify processed data exists
        $processedDataPath = $Context.Paths.ProcessedDataOutput
        if (-not (Test-Path $processedDataPath)) {
            throw "Processed data directory not found. Please run Processing phase first."
        }
        
        # Load processed data
        $dataToExport = @{}
        $processedFiles = Get-ChildItem -Path $processedDataPath -Filter "*.csv" -File
        
        if ($processedFiles.Count -eq 0) {
            throw "No processed data files found. Please run Processing phase first."
        }
        
        foreach ($file in $processedFiles) {
            $dataKey = $file.BaseName
            try {
                $dataToExport[$dataKey] = Import-Csv -Path $file.FullName
                Write-MandALog "Loaded $($dataToExport[$dataKey].Count) records from $($file.Name)" -Level "INFO" -Context $Context
            }
            catch {
                $Context.ErrorCollector.AddError("Export", "Failed to load file: $($file.Name)", $_.Exception)
            }
        }
        
        # Execute enabled export formats
        $enabledFormats = @($Context.Config.export.formats)
        $exportSuccess = $true
        
        foreach ($format in $enabledFormats) {
            $functionName = Get-ExportFunctionName -Format $format
            
            if (Get-Command $functionName -ErrorAction SilentlyContinue) {
                try {
                    Write-MandALog "Executing $functionName for format '$format'" -Level "INFO" -Context $Context
                    & $functionName -ProcessedData $dataToExport -Configuration $Context.Config -Context $Context
                    Write-MandALog "Export completed for format '$format'" -Level "SUCCESS" -Context $Context
                }
                catch {
                    $Context.ErrorCollector.AddError("Export_$format", "Export failed", $_.Exception)
                    $exportSuccess = $false
                }
            } else {
                $Context.ErrorCollector.AddWarning("Export", "Export function not found for format '$format': $functionName")
            }
        }
        
        if ($exportSuccess) {
            Write-MandALog "Export Phase Completed Successfully" -Level "SUCCESS" -Context $Context
        } else {
            Write-MandALog "Export Phase Completed with Errors" -Level "WARN" -Context $Context
        }
        
        return $exportSuccess
    }
    catch {
        $Context.ErrorCollector.AddError("Export", "Export phase failed", $_.Exception)
        Write-MandALog "Export phase failed: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
    finally {
        $Context.OrchestratorState.PopExecution()
    }
}

function Get-ExportFunctionName {
    param([string]$Format)
    
    $mapping = @{
        "PowerApps" = "Export-ForPowerApps"
        "CompanyControlSheet" = "Export-ToCompanyControlSheet"
        "CSV" = "Export-ToCSV"
        "JSON" = "Export-ToJSON"
        "Excel" = "Export-ToExcel"
    }
    
    if ($mapping.ContainsKey($Format)) {
        return $mapping[$Format]
    }
    
    # Default pattern
    return "Export-To$Format"
}

function Complete-MandADiscovery {
    [CmdletBinding()]
    param([MandAContext]$Context)
    
    Write-MandALog "FINALIZING M&A DISCOVERY SUITE EXECUTION" -Level "HEADER" -Context $Context
    
    # Export error report if there were any errors
    if ($Context.ErrorCollector.HasErrors()) {
        $errorReportPath = Join-Path $Context.Paths.LogOutput "ErrorReport_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
        $Context.ErrorCollector.ExportToFile($errorReportPath)
        Write-MandALog "Error report exported to: $errorReportPath" -Level "WARN" -Context $Context
    }
    
    # Summary
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
    # Check if global environment is available
    if ($null -eq $global:MandA) {
        Write-Host "Global environment not initialized. Loading Set-SuiteEnvironment.ps1..." -ForegroundColor Yellow
        
        $envScript = Join-Path (Split-Path $PSScriptRoot -Parent) "Scripts\Set-SuiteEnvironment.ps1"
        if (Test-Path $envScript) {
            . $envScript -CompanyName $CompanyName
        } else {
            Write-Warning "Set-SuiteEnvironment.ps1 not found. Using fallback initialization."
        }
    }
    
    # Get company name if not provided
    if ([string]::IsNullOrWhiteSpace($CompanyName)) {
        if ($null -ne $global:MandA -and $null -ne $global:MandA.CompanyName) {
            $CompanyName = $global:MandA.CompanyName
            Write-Host "Using company name from global context: $CompanyName" -ForegroundColor Green
        } else {
            $CompanyName = Get-CompanySelection
        }
    }
    
    # Sanitize company name for filesystem
    $CompanyName = $CompanyName -replace '[<>:"/\\|?*]', '_'
    
    # Load configuration
    if ($null -ne $global:MandA -and $null -ne $global:MandA.Config) {
        Write-Host "Using configuration from global context" -ForegroundColor Green
        $configuration = $global:MandA.Config
    } else {
        # Load from file
        $configPath = if ($ConfigurationFile) {
            if ([System.IO.Path]::IsPathRooted($ConfigurationFile)) {
                $ConfigurationFile
            } else {
                Join-Path (Split-Path $PSScriptRoot -Parent) $ConfigurationFile
            }
        } else {
            Join-Path (Split-Path $PSScriptRoot -Parent) "Configuration\default-config.json"
        }
        
        if (-not (Test-Path $configPath)) {
            throw "Configuration file not found: $configPath"
        }
        
        # Load and convert configuration
        $configContent = Get-Content -Path $configPath -Raw | ConvertFrom-Json
        $configuration = ConvertTo-HashtableRecursive -InputObject $configContent
    }
    
    # Update company name in config
    $configuration.metadata.companyName = $CompanyName
    
    # Handle Force flag
    if ($Force.IsPresent) {
        $configuration.discovery.skipExistingFiles = $false
    }
    
    # Handle Azure-only mode
    if ($Mode -eq "AzureOnly") {
        Write-Host "`nAzure-Only mode selected. Limiting discovery to cloud sources." -ForegroundColor Cyan
        
        # Filter enabled sources to only Azure-related
        $currentSources = $configuration.discovery.enabledSources
        $configuration.discovery.enabledSources = $currentSources | Where-Object { $_ -in $script:AzureOnlySources }
        
        Write-Host "Enabled sources for Azure-Only: $($configuration.discovery.enabledSources -join ', ')" -ForegroundColor Yellow
        
        # Set mode to Full to run all phases but with limited sources
        $Mode = "Full"
    }
    
    # Create context
    $script:Context = [MandAContext]::new($configuration, $CompanyName)
    
    # Initialize environment
    Initialize-MandAEnvironment -Context $script:Context -CurrentMode $Mode -IsValidateOnlyMode:$ValidateOnly
    
    if ($ValidateOnly.IsPresent) {
        Write-MandALog "Validation completed successfully" -Level "SUCCESS" -Context $script:Context
        exit 0
    }
    
    # Initialize authentication for Discovery mode
    if ($Mode -in "Discovery", "Full") {
        Write-MandALog "AUTHENTICATION & CONNECTION SETUP" -Level "HEADER" -Context $script:Context
        
        if (Get-Command "Initialize-MandAAuthentication" -ErrorAction SilentlyContinue) {
            $authResult = Initialize-MandAAuthentication -Configuration $configuration -Context $script:Context
            
            if ($authResult -and $authResult.Authenticated) {
                Write-MandALog "Authentication successful" -Level "SUCCESS" -Context $script:Context
                
                # Initialize connections
                if (Get-Command "Initialize-AllConnections" -ErrorAction SilentlyContinue) {
                    $connectionStatus = Initialize-AllConnections -Configuration $configuration -AuthContext $authResult.Context -Context $script:Context
                    
                    # Log connection status
                    foreach ($service in $connectionStatus.Keys) {
                        $status = $connectionStatus[$service]
                        $isConnected = if ($status -is [bool]) { $status } else { $status.Connected }
                        
                        if ($isConnected) {
                            Write-MandALog "Connected to $service" -Level "SUCCESS" -Context $script:Context
                        } else {
                            Write-MandALog "Failed to connect to $service" -Level "WARN" -Context $script:Context
                        }
                    }
                }
            } else {
                $script:Context.ErrorCollector.AddError("Authentication", "Authentication failed", $null)
                
                if ($configuration.environment.connectivity.haltOnConnectionError -contains "Authentication") {
                    throw "Authentication failed and is configured as critical"
                }
            }
        }
    }
    
    # Execute phases based on mode
    switch ($Mode) {
        "Discovery" {
            Invoke-DiscoveryPhase -Context $script:Context
        }
        "Processing" {
            Invoke-ProcessingPhase -Context $script:Context
        }
        "Export" {
            Invoke-ExportPhase -Context $script:Context
        }
        "Full" {
            Invoke-DiscoveryPhase -Context $script:Context
            Invoke-ProcessingPhase -Context $script:Context
            Invoke-ExportPhase -Context $script:Context
        }
    }
    
    # Complete execution
    Complete-MandADiscovery -Context $script:Context
    
    # Exit with appropriate code
    if ($script:Context.ErrorCollector.HasCriticalErrors()) {
        exit 2
    } elseif ($script:Context.ErrorCollector.HasErrors()) {
        exit 1
    } else {
        exit 0
    }
}
catch {
    Write-Host "ORCHESTRATOR ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack Trace: $($_.ScriptStackTrace)" -ForegroundColor Yellow
    
    if ($script:Context) {
        $script:Context.ErrorCollector.AddError("Orchestrator", "Fatal error", $_.Exception)
        Complete-MandADiscovery -Context $script:Context
    }
    
    exit 3
}
finally {
    # Cleanup
    if ($script:Context -and (Get-Command "Disconnect-AllServices" -ErrorAction SilentlyContinue)) {
        try {
            Disconnect-AllServices
        }
        catch {
            Write-Host "Warning: Error during service disconnection: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}
