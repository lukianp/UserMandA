#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Main Orchestrator (Enhanced Version 5.5.0)
.DESCRIPTION
    Unified orchestrator for discovery, processing, and export with improved
    state management, error handling, and parallel processing support.
    This version addresses an initialization order issue with Write-MandALog.
.NOTES
    Author: Enhanced Version (with fixes by Gemini)
    Version: 5.5.1 
    Created: 2025-01-03
    Last Modified: 2025-06-05 
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
    [string]$CompanyName # Added for direct access

    MandAContext([hashtable]$initialConfig, [string]$currentCompanyNameParam) {
        if ($null -eq $initialConfig) { throw "MandAContext: initialConfig cannot be null." }
        if ([string]::IsNullOrWhiteSpace($currentCompanyNameParam)) { throw "MandAContext: currentCompanyNameParam cannot be null or empty." }

        $this.Config = ConvertTo-HashtableRecursive -InputObject $initialConfig
        $this.Version = "5.5.1" # Updated version
        $this.StartTime = Get-Date
        $this.ModulesChecked = $false
        $this.ErrorCollector = [DiscoveryErrorCollector]::new()
        $this.OrchestratorState = [OrchestratorState]::new()
        $this.CompanyName = $currentCompanyNameParam

        if (($null -ne $global:MandA) -and ($global:MandA -is [hashtable]) -and `
            ($global:MandA.ContainsKey('Paths')) -and ($null -ne $global:MandA.Paths) -and `
            ($global:MandA.ContainsKey('CompanyName')) -and ($global:MandA.CompanyName -eq $currentCompanyNameParam)) {
            
            if ($global:MandA.Paths -is [hashtable]) {
                $this.Paths = $global:MandA.Paths.Clone() 
                Write-Verbose "[MandAContext] Using paths from established global environment for company '$currentCompanyNameParam'."
            } else {
                Write-Warning "[MandAContext] global:MandA.Paths is not a hashtable. Initializing paths."
                $this.InitializePaths($currentCompanyNameParam)
            }
        } else {
            # Determine logging for this early stage
            $logOutputAction = { param($Message, $Color) Write-Host $Message -ForegroundColor $Color }
            if ($null -eq $global:MandA) {
                $logOutputAction.Invoke("[MandAContext] Global environment (\$global:MandA) not found. Initializing paths for '$currentCompanyNameParam'.", "Yellow")
            } elseif (-not ($global:MandA -is [hashtable])) {
                 $logOutputAction.Invoke("[MandAContext] \$global:MandA is not a hashtable. Re-initializing for '$currentCompanyNameParam'.", "Yellow")
            } elseif ($global:MandA.CompanyName -ne $currentCompanyNameParam) {
                $logOutputAction.Invoke("[MandAContext] Global environment company ('$($global:MandA.CompanyName)') differs from current ('$currentCompanyNameParam'). Re-initializing paths.", "Yellow")
            } else {
                $logOutputAction.Invoke("[MandAContext] Global environment incomplete or paths missing. Initializing paths for '$currentCompanyNameParam'.", "Yellow")
            }
            $this.InitializePaths($currentCompanyNameParam) 
        }
    }
    
    [void]InitializePaths([string]$currentCompanyNameParam) {
        $suiteRoot = $null
        if ($null -ne $global:MandA -and ($global:MandA -is [hashtable]) -and $global:MandA.ContainsKey('Paths') -and $null -ne $global:MandA.Paths -and $global:MandA.Paths.ContainsKey('SuiteRoot')) {
            $suiteRoot = $global:MandA.Paths.SuiteRoot
        } elseif ($PSScriptRoot) { 
            $suiteRoot = Split-Path $PSScriptRoot -Parent 
        } else {
            try { $suiteRoot = Split-Path (Get-Location).Path -Parent } catch { $suiteRoot = Resolve-Path ".\" }
            Write-Warning "[MandAContext.InitializePaths] Could not reliably determine SuiteRoot. Using '$suiteRoot'."
        }

        $profilesBasePath = if ($this.Config -and $this.Config.environment -and $this.Config.environment.profilesBasePath) {
            $this.Config.environment.profilesBasePath
        } else {
             "C:\MandADiscovery\Profiles" # Fallback default
        }
        
        $this.Paths = @{
            SuiteRoot           = $suiteRoot
            ProfilesBasePath    = $profilesBasePath
            CompanyProfileRoot  = Join-Path $profilesBasePath $currentCompanyNameParam
            Modules             = Join-Path $suiteRoot "Modules"
            Utilities           = Join-Path $suiteRoot "Modules\Utilities"
            Core                = Join-Path $suiteRoot "Core"
            Scripts             = Join-Path $suiteRoot "Scripts"
            Configuration       = Join-Path $suiteRoot "Configuration"
            Discovery           = Join-Path $suiteRoot "Modules\Discovery" 
            Processing          = Join-Path $suiteRoot "Modules\Processing" 
            Export              = Join-Path $suiteRoot "Modules\Export" 
        }
        
        $this.Paths.RawDataOutput       = Join-Path $this.Paths.CompanyProfileRoot "Raw"
        $this.Paths.ProcessedDataOutput = Join-Path $this.Paths.CompanyProfileRoot "Processed"
        $this.Paths.LogOutput           = Join-Path $this.Paths.CompanyProfileRoot "Logs"
        $this.Paths.ExportOutput        = Join-Path $this.Paths.CompanyProfileRoot "Exports"
        $this.Paths.TempPath            = Join-Path $this.Paths.CompanyProfileRoot "Temp"
        
        if ($null -ne $this.Config -and $this.Config.ContainsKey('environment') -and ($this.Config.environment -is [hashtable])) {
            $this.Config.environment.outputPath = $this.Paths.CompanyProfileRoot
            $this.Config.environment.tempPath = $this.Paths.TempPath
        }
    }
    
    [bool]ValidateContext() {
        $requiredPathKeys = @('SuiteRoot', 'CompanyProfileRoot', 'Modules', 'Utilities', 'Core', 'Configuration', 'LogOutput', 'RawDataOutput', 'ProcessedDataOutput', 'ExportOutput', 'TempPath') 
        foreach ($pathKey in $requiredPathKeys) {
            if (-not $this.Paths.ContainsKey($pathKey) -or [string]::IsNullOrWhiteSpace($this.Paths[$pathKey])) {
                Write-Warning "[MandAContext.ValidateContext] Critical path key '$pathKey' is missing or empty."
                return $false
            }
            if ($pathKey -in @('SuiteRoot', 'Modules', 'Utilities', 'Core', 'Configuration')) {
                if (-not (Test-Path $this.Paths[$pathKey] -PathType Container -ErrorAction SilentlyContinue)) {
                    Write-Warning "[MandAContext.ValidateContext] Critical suite structure path '$($this.Paths[$pathKey])' for '$pathKey' does not exist."
                    return $false
                }
            }
        }
        if ($null -eq $this.Config) { Write-Warning "[MandAContext.ValidateContext] Config is null."; return $false }
        if ($null -eq $this.ErrorCollector) { Write-Warning "[MandAContext.ValidateContext] ErrorCollector is null."; return $false }
        if ($null -eq $this.OrchestratorState) { Write-Warning "[MandAContext.ValidateContext] OrchestratorState is null."; return $false }
        
        Write-Verbose "[MandAContext.ValidateContext] Context validation successful."
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
            return $false 
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
    
    [void]AddError([string]$Source, [string]$Message, [Exception]$ExceptionObject) {
        $errorEntry = [PSCustomObject]@{
            Timestamp = Get-Date
            Source = $Source
            Message = $Message
            ExceptionType = if ($null -ne $ExceptionObject) { $ExceptionObject.GetType().FullName } else { "Unknown" }
            ExceptionMessage = if ($null -ne $ExceptionObject) { $ExceptionObject.Message } else { "No exception details" }
            StackTrace = if ($null -ne $ExceptionObject) { $ExceptionObject.ScriptStackTrace } else { $null }
        }
        $this.Errors.Add($errorEntry)
        if (-not $this.ErrorCounts.ContainsKey($Source)) { $this.ErrorCounts[$Source] = 0 }
        $this.ErrorCounts[$Source]++
    }
    
    [void]AddWarning([string]$Source, [string]$Message) {
        $this.Warnings.Add([PSCustomObject]@{ Timestamp = Get-Date; Source = $Source; Message = $Message })
    }
    
    [bool]HasErrors() { return $this.Errors.Count -gt 0 }
    
    [bool]HasCriticalErrors() {
        $criticalPattern = "Critical|Core|ModuleLoader|Environment|Authentication|Orchestrator"
        return ($this.Errors | Where-Object { $_.Source -match $criticalPattern }).Count -gt 0
    }
    
    [string]GetSummary() {
        $summary = "Errors: $($this.Errors.Count), Warnings: $($this.Warnings.Count)"
        if ($this.ErrorCounts.Count -gt 0) {
            $summary += "`nError breakdown by source:"
            foreach ($sourceKey in $this.ErrorCounts.Keys | Sort-Object) {
                $summary += "`n  - $sourceKey - $($this.ErrorCounts[$sourceKey])"
            }
        }
        return $summary
    }

    [void]ExportToFile([string]$FilePath) {
        $dir = Split-Path $FilePath -Parent
        if (-not (Test-Path $dir)) { New-Item -Path $dir -ItemType Directory -Force | Out-Null }

        $cleanedErrors = $this.Errors | ForEach-Object {
            @{
                Timestamp = $_.Timestamp
                Source = $_.Source
                Message = $_.Message
                ExceptionMessage = $_.ExceptionMessage 
                ExceptionType = $_.ExceptionType
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
            $report | ConvertTo-Json -Depth 10 -Compress | Set-Content -Path $FilePath -Encoding UTF8 -Force
        } catch {
            $textReport = "Error Report Generated: $(Get-Date)`nSummary: $($this.GetSummary())`n`nErrors:`n$($cleanedErrors | ForEach-Object { "[$($_.Timestamp)] $($_.Source): $($_.Message) `n  Exception: $($_.ExceptionMessage)" } | Out-String)`n`nWarnings:`n$($this.Warnings | ForEach-Object { "[$($_.Timestamp)] $($_.Source): $($_.Message)" } | Out-String)"
            $textReportFilePath = $FilePath -replace '\.json$', '.txt'
            $textReport | Set-Content -Path $textReportFilePath -Encoding UTF8 -Force
            Write-Warning "Failed to export error report as JSON. Saved as text: $textReportFilePath. Error: $($_.Exception.Message)"
        }
    }
}

#===============================================================================
#                       INITIALIZATION
#===============================================================================

# Preserve original ErrorActionPreference and set to Stop for the script's main execution.
$OriginalErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue" # Ensure progress bars are shown

# Initialize context variable that will hold the MandAContext object.
$script:Context = $null

# Define Azure-only sources
$script:AzureOnlySources = @(
    "Azure", "Graph", "Intune", "Licensing", 
    "ExternalIdentity", "SharePoint", "Teams", "Exchange"
)

#===============================================================================
#                    UTILITY FUNCTIONS
#===============================================================================

function Get-CompanySelection {
    [CmdletBinding()]
    param()
    
    $profilesBasePath = "C:\MandADiscovery\Profiles" # Standard path, consider making this configurable if needed.
    
    if (-not (Test-Path $profilesBasePath -PathType Container)) {
        try {
            New-Item -Path $profilesBasePath -ItemType Directory -Force -ErrorAction Stop | Out-Null
            Write-Host "Created profiles directory: $profilesBasePath" -ForegroundColor Green
        } catch {
            throw "Failed to create profiles directory at '$profilesBasePath'. Error: $($_.Exception.Message)"
        }
    }
    
    $existingProfiles = Get-ChildItem -Path $profilesBasePath -Directory -ErrorAction SilentlyContinue | 
        Select-Object -ExpandProperty Name | Sort-Object
    
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
                $newCompanyName = Read-Host "Enter new company name"
                if ([string]::IsNullOrWhiteSpace($newCompanyName)) {
                    Write-Host "Company name cannot be empty. Please try again." -ForegroundColor Red
                    continue
                }
                return $newCompanyName -replace '[<>:"/\\|?*]', '_' # Sanitize immediately
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
        Write-Host "`nNo existing company profiles found in '$profilesBasePath'." -ForegroundColor Yellow
        $newCompanyName = Read-Host "Enter company name for new profile"
        if ([string]::IsNullOrWhiteSpace($newCompanyName)) {
            throw "Company name cannot be empty when creating the first profile."
        }
        return $newCompanyName -replace '[<>:"/\\|?*]', '_' # Sanitize immediately
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
        [string]$ModuleName,
        [MandAContext]$ContextForLog # Pass context for logging
    )
    
    $requiredSettings = @{
        'ActiveDirectory' = @('environment.domainController')
        'Exchange' = @('authentication.authenticationMethod') 
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
                $valid = $false; break
            }
            $value = $value[$part]
        }
        if (-not $valid -or $null -eq $value -or ($value -is [string] -and [string]::IsNullOrWhiteSpace($value))) {
            $missing += $setting
        }
    }
    
    if ($missing.Count -gt 0) {
        $errorMessage = "Missing required configuration for $ModuleName module: $($missing -join ', ')"
        if ($ContextForLog -and (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
             Write-MandALog -Message $errorMessage -Level "WARN" -Context $ContextForLog
        } else {
            Write-Warning $errorMessage
        }
        return $false
    }
    return $true
}

function Import-ModuleWithManifest {
    param(
        [string]$ModulePathToImport, # Renamed from ModulePath to avoid conflict
        [MandAContext]$Context # Pass the main context for logging
    )
    
    # Logging function selection (fallback to Write-Host if Write-MandALog not ready)
    $doLog = { param($m, $l="INFO", $c=$Context) if (Get-Command Write-MandALog -ErrorAction SilentlyContinue -and $global:MandA.LoggingInitialized) { Write-MandALog -Message $m -Level $l -Context $c } else { Write-Host "[$l] $m" } }

    if ([string]::IsNullOrWhiteSpace($ModulePathToImport)) {
        $doLog.Invoke("Import-ModuleWithManifest: ModulePathToImport is null or empty.", "ERROR")
        return $false
    }
    if (-not (Test-Path $ModulePathToImport -PathType Leaf)) {
        $doLog.Invoke("Import-ModuleWithManifest: Module file not found or is not a file: '$ModulePathToImport'", "ERROR")
        return $false
    }

    $moduleNameOnly = [System.IO.Path]::GetFileNameWithoutExtension($ModulePathToImport)
    if (Get-Module -Name $moduleNameOnly -ErrorAction SilentlyContinue) {
        $doLog.Invoke("Module '$moduleNameOnly' is already loaded.", "DEBUG")
        return $true 
    }

    $moduleDirOnly = Split-Path $ModulePathToImport -Parent
    $manifestPathFile = Join-Path $moduleDirOnly "$moduleNameOnly.psd1"
    
    $global:_MandALoadingContext = $Context # Used by some modules during their import
        
    try {
        if (Test-Path $manifestPathFile -PathType Leaf) {
            $doLog.Invoke("Importing manifest '$manifestPathFile' for module '$moduleNameOnly'.", "DEBUG")
            Import-Module $manifestPathFile -Force -Global -ErrorAction Stop 
        } else {
            $doLog.Invoke("Manifest not found. Importing PSM1 '$ModulePathToImport' for module '$moduleNameOnly'.", "DEBUG")
            Import-Module $ModulePathToImport -Force -Global -ErrorAction Stop 
        }

        $loadedModuleCheck = Get-Module -Name $moduleNameOnly -ErrorAction SilentlyContinue
        if ($null -eq $loadedModuleCheck) {
            throw "Module '$moduleNameOnly' reported as imported, but Get-Module could not confirm."
        }
        
        $doLog.Invoke("Successfully loaded and verified module: '$moduleNameOnly'", "SUCCESS")
        return $true
    }
    catch {
        $errorMessageText = "Failed to load module '$moduleNameOnly' from '$ModulePathToImport'. Error: $($_.Exception.Message)"
        $Context.ErrorCollector.AddError("ModuleLoader", $errorMessageText, $_.Exception)
        $doLog.Invoke($errorMessageText, "ERROR")
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
    
    # Use Write-Host for initial messages before EnhancedLogging is confirmed.
    Write-Host "=== [QuickStart.Initialize-MandAEnvironment] INITIALIZING ENVIRONMENT FOR MODE: $CurrentMode ===" -ForegroundColor Cyan
    
    try {
        # Ensure global context is available
        if ($null -eq $global:MandA -or -not $global:MandA.Initialized) {
            # This situation implies Set-SuiteEnvironment.ps1 didn't run or failed critically.
            # The main block of QuickStart.ps1 already attempts to source Set-SuiteEnvironment.ps1.
            # If we reach here and it's still not set, it's a fatal setup error.
            throw "CRITICAL: Global M&A environment context (`$global:MandA`) is not initialized. Ensure Set-SuiteEnvironment.ps1 runs successfully first."
        }
         # Synchronize $global:MandA with the current context for this specific run if Orchestrator is called with different params.
        $global:MandA.Paths = $Context.Paths
        $global:MandA.Config = $Context.Config
        $global:MandA.CompanyName = $Context.CompanyName
        $global:MandA.Version = $Context.Version

        # Create output directories (idempotent)
        $directories = @(
            $Context.Paths.CompanyProfileRoot, $Context.Paths.RawDataOutput, 
            $Context.Paths.ProcessedDataOutput, $Context.Paths.LogOutput,
            $Context.Paths.ExportOutput, $Context.Paths.TempPath
        )
        foreach ($dir in $directories) {
            if (-not (Test-Path $dir -PathType Container)) {
                New-Item -Path $dir -ItemType Directory -Force -ErrorAction Stop | Out-Null
                Write-Host "Created directory: $dir" -ForegroundColor DarkGray
            }
        }
        
        # Load EnhancedLogging.psm1 FIRST
        $loggingModulePath = Join-Path $Context.Paths.Utilities "EnhancedLogging.psm1"
        $loggingLoaded = $false
        if (Test-Path $loggingModulePath -PathType Leaf) {
            if (Import-ModuleWithManifest -ModulePathToImport $loggingModulePath -Context $Context) {
                Write-Host "Successfully loaded EnhancedLogging.psm1." -ForegroundColor Green
                if (Get-Command Initialize-Logging -ErrorAction SilentlyContinue) {
                    Initialize-Logging -Configuration $Context.Config # Assumes Context.Config is ready
                    $global:MandA.LoggingInitialized = $true # Explicitly mark logging as ready
                    Write-MandALog "Logging system initialized." -Level "INFO" -Context $Context
                    $loggingLoaded = $true
                } else {
                    Write-Warning "Initialize-Logging function not found after loading EnhancedLogging.psm1."
                }
            } else {
                Write-Warning "Failed to load EnhancedLogging.psm1. Logging will be basic."
            }
        } else {
            Write-Warning "EnhancedLogging.psm1 not found at '$loggingModulePath'. Logging will be basic."
        }

        # Now use Write-MandALog if available, otherwise fallback.
        $logAction = if ($loggingLoaded) { $ judíos:Write-MandALog } else { $ { Write-Host } } # Simplified
        $logParam = if ($loggingLoaded) { @{Level = ($args[1] | Get-OrElse "INFO"); Context = $Context} } else { @{} }
        
        $logAction.Invoke("Starting environment initialization for mode: $CurrentMode", $logParam) # Use @logParam for splatting
        
        # Load other core utilities
        $utilityModules = @("FileOperations.psm1", "ValidationHelpers.psm1", "ConfigurationValidation.psm1", "ErrorHandling.psm1", "ProgressDisplay.psm1")
        $logAction.Invoke("Loading other utility modules...", $logParam)
        foreach ($moduleFile in $utilityModules) {
            $modulePath = Join-Path $Context.Paths.Utilities $moduleFile
            Import-ModuleWithManifest -ModulePathToImport $modulePath -Context $Context # Relies on its internal logging
        }
        
        # Load authentication and connectivity modules
        $authModules = @("Authentication\Authentication.psm1", "Authentication\CredentialManagement.psm1", "Connectivity\EnhancedConnectionManager.psm1")
        $logAction.Invoke("Loading authentication and connectivity modules...", $logParam)
        foreach ($moduleRelPath in $authModules) {
            $modulePath = Join-Path $Context.Paths.Modules $moduleRelPath
            Import-ModuleWithManifest -ModulePathToImport $modulePath -Context $Context
        }
        
        # Validate prerequisites (if function exists and not in ValidateOnly mode)
        if (-not $IsValidateOnlyMode) {
            if (Get-Command Test-Prerequisites -ErrorAction SilentlyContinue) {
                $logAction.Invoke("Performing system prerequisites validation...", $logParam)
                if (-not (Test-Prerequisites -Configuration $Context.Config -Context $Context)) {
                    throw "System prerequisites validation failed."
                }
                $logAction.Invoke("System prerequisites validated successfully.", @{Level="SUCCESS"; Context=$Context})
            } else {
                 $logAction.Invoke("Test-Prerequisites function not found. Skipping prerequisites check.", @{Level="WARN"; Context=$Context})
            }
        }
        
        # Load mode-specific modules
        switch ($CurrentMode) {
            { $_ -in "Discovery", "Full", "AzureOnly" } { Import-DiscoveryModules -Context $Context }
            { $_ -in "Processing", "Full", "AzureOnly" } { Import-ProcessingModules -Context $Context }
            { $_ -in "Export", "Full", "AzureOnly" } { Import-ExportModules -Context $Context }
        }
        
        $logAction.Invoke("Environment initialization completed.", @{Level="SUCCESS"; Context=$Context})
        return $true
    }
    catch {
        $errorMessageText = "QuickStart.Initialize-MandAEnvironment FAILED: $($_.Exception.Message)"
        # Fallback logging if Write-MandALog isn't set up or fails
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue -and $global:MandA.LoggingInitialized) {
            Write-MandALog -Message $errorMessageText -Level "ERROR" -Context $Context
            if ($Context.Config.advancedSettings.debugMode) {
                Write-MandALog -Message ("StackTrace: " + $_.ScriptStackTrace) -Level "DEBUG" -Context $Context
            }
        } else {
            Write-Host $errorMessageText -ForegroundColor Red
            Write-Host ("StackTrace: " + $_.ScriptStackTrace) -ForegroundColor Yellow
        }
        if ($Context -and $Context.ErrorCollector) {
             $Context.ErrorCollector.AddError("EnvironmentInit_QuickStart", "Initialization failed in QuickStart", $_.Exception)
        }
        throw # Re-throw to stop execution
    }
}

function Import-DiscoveryModules {
    param([MandAContext]$Context)
    
    $discoveryPath = $Context.Paths.Discovery # Corrected path
    $enabledSources = @($Context.Config.discovery.enabledSources)
    
    Write-MandALog "Loading discovery modules for $($enabledSources.Count) sources from '$discoveryPath'." -Level "INFO" -Context $Context
    
    $loadedCount = 0; $failedCount = 0
    foreach ($source in $enabledSources) {
        try {
            if (-not (Test-ModuleConfiguration -Configuration $Context.Config -ModuleName $source -ContextForLog $Context)) {
                 Write-MandALog "Skipping discovery module '$source' due to missing/invalid configuration." -Level "WARN" -Context $Context
                 $failedCount++; continue
            }
            $moduleFile = "${source}Discovery.psm1"
            $modulePath = Join-Path $discoveryPath $moduleFile
            
            if (Test-Path $modulePath -PathType Leaf) {
                if (Import-ModuleWithManifest -ModulePathToImport $modulePath -Context $Context) {
                    $loadedCount++
                } else { $failedCount++ }
            } else {
                $failedCount++
                $Context.ErrorCollector.AddWarning($source, "Discovery module file not found: $moduleFile at $modulePath")
                Write-MandALog "WARNING: Discovery module not found: $moduleFile at $modulePath" -Level "WARN" -Context $Context
            }
        } catch {
            $failedCount++
            $Context.ErrorCollector.AddError($source, "Failed to prepare/load discovery module: $($_.Exception.Message)", $_.Exception)
            Write-MandALog "ERROR: Exception preparing/loading $source module: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
    }
    Write-MandALog "Discovery module loading complete: $loadedCount loaded, $failedCount failed/skipped." -Level "INFO" -Context $Context
}

function Import-ProcessingModules {
    param([MandAContext]$Context)
    
    $processingPath = $Context.Paths.Processing # Corrected path
    $processingModules = @("DataAggregation.psm1", "UserProfileBuilder.psm1", "WaveGeneration.psm1", "DataValidation.psm1")
    
    Write-MandALog "Loading processing modules from '$processingPath'." -Level "INFO" -Context $Context
    foreach ($module in $processingModules) {
        $modulePath = Join-Path $processingPath $module
        Import-ModuleWithManifest -ModulePathToImport $modulePath -Context $Context
    }
}

function Import-ExportModules {
    param([MandAContext]$Context)
    
    $exportPath = $Context.Paths.Export # Corrected path
    $enabledFormats = @($Context.Config.export.formats)
    
    Write-MandALog "Loading export modules for formats: $($enabledFormats -join ', ') from '$exportPath'." -Level "INFO" -Context $Context
    
    $formatMapping = @{
        "CSV" = "CSVExport.psm1"; "JSON" = "JSONExport.psm1"; "Excel" = "ExcelExport.psm1";
        "CompanyControlSheet" = "CompanyControlSheetExporter.psm1"; "PowerApps" = "PowerAppsExporter.psm1"
    }
    
    foreach ($format in $enabledFormats) {
        if ($formatMapping.ContainsKey($format)) {
            $moduleFile = $formatMapping[$format]
            $modulePath = Join-Path $exportPath $moduleFile
            Import-ModuleWithManifest -ModulePathToImport $modulePath -Context $Context
        } else {
            $Context.ErrorCollector.AddWarning("Export", "Unknown export format: $format. No module defined.")
            Write-MandALog "Unknown export format: $format" -Level "WARN" -Context $Context
        }
    }
}

function Invoke-ParallelDiscoveryWithProgress {
    param(
        [Parameter(Mandatory=$true)][string[]]$EnabledSources,
        [Parameter(Mandatory=$true)][MandAContext]$Context
    )
    
    $throttleLimit = $Context.Config.discovery.maxConcurrentJobs | Get-OrElse 5 # Use Get-OrElse from $global
    Write-MandALog "Starting parallel discovery for $($EnabledSources.Count) sources (Throttle: $throttleLimit)" -Level "INFO" -Context $Context

    $runspacePool = [runspacefactory]::CreateRunspacePool(1, $throttleLimit)
    $runspacePool.Open()
    
    $runspaces = [System.Collections.Generic.List[object]]::new()
    $allResults = @{} 

    $scriptBlockToRun = { 
        param( 
            [string]$DiscoverySource, [hashtable]$PassedConfig, [hashtable]$PassedPaths,
            [string]$PassedCompanyName, [string]$PassedVersion,
            [string]$PassedModulesPath, [string]$PassedUtilitiesPath,
            [hashtable]$ParentGlobalMandA 
        )
        
        $ErrorActionPreference = "Stop"; $ProgressPreference = "Continue"
        $script:GlobalMandA = $ParentGlobalMandA 

        $runspaceLoggingInitialized = $false; $usingEnhancedLoggingForRunspace = $false
        try {
            $loggingModulePathForRunspace = Join-Path $PassedUtilitiesPath "EnhancedLogging.psm1"
            if (Test-Path $loggingModulePathForRunspace -PathType Leaf) {
                Import-Module $loggingModulePathForRunspace -Force -Global
                if (Get-Command Initialize-Logging -ErrorAction SilentlyContinue) {
                    Initialize-Logging -Configuration $PassedConfig 
                    $runspaceLoggingInitialized = $true; $usingEnhancedLoggingForRunspace = $true
                }
            }
        } catch { Write-Warning "Runspace: Failed to initialize enhanced logging for $DiscoverySource. Error: $($_.Exception.Message)" }

        function Write-RunspaceLog { param([string]$Msg, [string]$Lvl = "INFO")
            $logTimestamp = Get-Date -Format "HH:mm:ss"
            if ($usingEnhancedLoggingForRunspace -and (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
                $rsContext = [PSCustomObject]@{ Config = $PassedConfig; CompanyName = $PassedCompanyName; Paths = $PassedPaths; LoggingInitialized = $true }
                Write-MandALog -Message "[$logTimestamp] Runspace-$DiscoverySource $Msg" -Level $Lvl -Context $rsContext
            } else { Write-Host "[$logTimestamp] Runspace-$DiscoverySource [$Lvl]: $Msg" }
        }
        
        try {
            Write-RunspaceLog "Starting task for '$DiscoverySource' in runspace."
            $moduleFileName = "${DiscoverySource}Discovery.psm1"
            $moduleDiscoveryPath = Join-Path $PassedModulesPath "Discovery"
            $moduleFullPath = Join-Path $moduleDiscoveryPath $moduleFileName 
            
            if (-not (Test-Path $moduleFullPath -PathType Leaf)) { throw "Module file not found: '$moduleFullPath'" }
            Import-Module $moduleFullPath -Force -Global 
            
            $invokeFunctionName = "Invoke-${DiscoverySource}Discovery" 
            if (-not (Get-Command $invokeFunctionName -ErrorAction SilentlyContinue)) {
                throw "Discovery function '$invokeFunctionName' not found in module '$DiscoverySource'."
            }
            
            $runspaceModuleContext = [PSCustomObject]@{
                Paths = $PassedPaths; Config = $PassedConfig; CompanyName = $PassedCompanyName; Version = $PassedVersion
                ErrorCollector = $null # Errors collected via catch
            }
            
            Write-RunspaceLog "Invoking '$invokeFunctionName'..."
            $discoveryDataResult = & $invokeFunctionName -Configuration $PassedConfig -Context $runspaceModuleContext 
            
            Write-RunspaceLog "Task for '$DiscoverySource' completed successfully in runspace."
            return [PSCustomObject]@{ Source = $DiscoverySource; Success = $true; Data = $discoveryDataResult; Error = $null; FullException = $null }
        } catch {
            $errorMessageText = "Error in '$DiscoverySource' discovery runspace: $($_.Exception.Message)"
            Write-RunspaceLog $errorMessageText -Lvl "ERROR"
            if ($_.ScriptStackTrace) { Write-RunspaceLog "StackTrace: $($_.ScriptStackTrace)" -Lvl "DEBUG" }
            return [PSCustomObject]@{
                Source = $DiscoverySource; Success = $false; Data = $null
                Error = $_.Exception.Message; FullException = $_.Exception; ScriptStackTrace = $_.ScriptStackTrace
            }
        }
    }

    foreach ($sourceNameItem in $EnabledSources) { 
        $powershellInstance = [powershell]::Create().AddScript($scriptBlockToRun) 
        [void]$powershellInstance.AddArgument($sourceNameItem)
        [void]$powershellInstance.AddArgument($Context.Config)
        [void]$powershellInstance.AddArgument($Context.Paths)
        [void]$powershellInstance.AddArgument($Context.CompanyName)
        [void]$powershellInstance.AddArgument($Context.Version)
        [void]$powershellInstance.AddArgument($Context.Paths.Modules)
        [void]$powershellInstance.AddArgument($Context.Paths.Utilities)
        [void]$powershellInstance.AddArgument($global:MandA) # Pass the current orchestrator's global context

        $powershellInstance.RunspacePool = $runspacePool
        $runspaces.Add([PSCustomObject]@{
            Instance = $powershellInstance; Handle = $powershellInstance.BeginInvoke()
            Source = $sourceNameItem; StartTime = Get-Date
        })
    }

    $totalTasks = $runspaces.Count; $completedTasksCount = 0
    # Progress display logic omitted for brevity but should call a function from ProgressDisplay.psm1

    while ($runspaces.Count -gt 0) {
        $doneTasks = $runspaces | Where-Object { $_.Handle.IsCompleted } 
        foreach ($taskItem in $doneTasks) { 
            $completedTasksCount++
            $jobOutputResult = $null
            try {
                $jobOutputResult = $taskItem.Instance.EndInvoke($taskItem.Handle) 
                if ($null -eq $jobOutputResult) { throw "Runspace for $($taskItem.Source) returned null output." }

                if ($jobOutputResult.Success) {
                    $allResults[$jobOutputResult.Source] = $jobOutputResult.Data
                    Write-MandALog "Discovery completed successfully for: $($jobOutputResult.Source)" -Level "SUCCESS" -Context $Context
                } else {
                    $errMsg = if ($jobOutputResult.Error) { $jobOutputResult.Error } else { "Unknown error from runspace."}
                    $fullEx = if ($jobOutputResult.FullException) { $jobOutputResult.FullException } else { $null }
                    $Context.ErrorCollector.AddError($jobOutputResult.Source, $errMsg, $fullEx)
                    Write-MandALog "Discovery failed for $($jobOutputResult.Source): $errMsg" -Level "ERROR" -Context $Context
                }
            } catch { 
                $Context.ErrorCollector.AddError($taskItem.Source, "Orchestrator error processing runspace result for $($taskItem.Source): $($_.Exception.Message)", $_.Exception)
                Write-MandALog "Orchestrator error processing runspace result for $($taskItem.Source): $($_.Exception.Message)" -Level "ERROR" -Context $Context
            } finally {
                if ($taskItem.Instance) { $taskItem.Instance.Dispose() }
                $runspaces.Remove($taskItem) 
            }
             if (Get-Command Write-DiscoveryProgress -ErrorAction SilentlyContinue) { # Assuming Write-DiscoveryProgress from ProgressDisplay.psm1
                Write-DiscoveryProgress -Total $totalTasks -Completed $completedTasksCount -CurrentSource $taskItem.Source -Context $Context
            } else { Write-Host "`rProgress: $completedTasksCount / $totalTasks tasks completed. Last: $($taskItem.Source)" -NoNewline }
        }
        if ($runspaces.Count -gt 0) { Start-Sleep -Milliseconds 250 }
    }
    if (-not (Get-Command Write-DiscoveryProgress -ErrorAction SilentlyContinue)) { Write-Host "" } # Newline after basic progress

    if ($runspacePool) { $runspacePool.Close(); $runspacePool.Dispose() }
    $failedTasksCount = $totalTasks - $allResults.Keys.Count
    Write-MandALog "Parallel discovery finished. Successful sources: $($allResults.Keys.Count), Failed/Skipped sources: $failedTasksCount" -Level "INFO" -Context $Context
    return $allResults
}


function Invoke-DiscoveryPhase {
    [CmdletBinding()]
    param([MandAContext]$Context)
    
    if (-not $Context.OrchestratorState.CanExecute("Discovery")) {
        throw "Discovery phase execution limit exceeded or circular dependency detected. Path: $($Context.OrchestratorState.GetExecutionPath())"
    }
    $Context.OrchestratorState.PushExecution("Discovery")
    $phaseStartTime = Get-Date
    
    try {
        Write-MandALog "STARTING DISCOVERY PHASE" -Level "HEADER" -Context $Context
        
        if (Get-Command Test-DiscoveryPrerequisites -ErrorAction SilentlyContinue) {
             if (-not (Test-DiscoveryPrerequisites -Context $Context)) {
                throw "Discovery prerequisites not met."
            }
        } else { Write-MandALog "Test-DiscoveryPrerequisites not found, skipping." -Level "WARN" -Context $Context}


        $enabledSources = @($Context.Config.discovery.enabledSources)
        $totalSources = $enabledSources.Count
        $useParallel = $Context.Config.discovery.parallelProcessing -and $totalSources -gt 1
        
        Write-MandALog ("Discovery Configuration: Total Sources={0}, Parallel={1}, SkipExisting={2}, BatchSize={3}" -f $totalSources, $useParallel, $Context.Config.discovery.skipExistingFiles, $Context.Config.discovery.batchSize) -Level "INFO" -Context $Context
        
        $discoveryResults = @{}; $summaryStats = @{ TotalRecords = 0; SuccessfulModules = 0; FailedModules = 0; SkippedModules = 0 }

        if ($useParallel) {
            Write-MandALog "Starting parallel discovery (Throttle: $($Context.Config.discovery.maxConcurrentJobs))" -Level "INFO" -Context $Context
            $discoveryResults = Invoke-ParallelDiscoveryWithProgress -EnabledSources $enabledSources -Context $Context
            # Summary stats need to be aggregated from the results of parallel discovery if it doesn't return them
            foreach($sourceKey in $discoveryResults.Keys){
                if($discoveryResults[$sourceKey] -is [hashtable] -and $discoveryResults[$sourceKey].ContainsKey('Success') ) { # Assuming structure from Invoke-ParallelDiscoveryWithProgress
                    if($discoveryResults[$sourceKey].Success){
                        $summaryStats.SuccessfulModules++
                        # Add logic to count records if Invoke-ParallelDiscoveryWithProgress's result objects contain it
                        # $summaryStats.TotalRecords += Get-DiscoveryRecordCount -Result $discoveryResults[$sourceKey].Data
                    } else {
                        $summaryStats.FailedModules++
                    }
                } else { # If direct data is returned, assume success
                    $summaryStats.SuccessfulModules++
                    # $summaryStats.TotalRecords += Get-DiscoveryRecordCount -Result $discoveryResults[$sourceKey]
                }
            }

        } else {
            Write-MandALog "Starting sequential discovery" -Level "INFO" -Context $Context
            $currentSourceNum = 0
            foreach ($source in $enabledSources) {
                $currentSourceNum++
                $sourceStartTime = Get-Date
                $functionName = "Invoke-${source}Discovery"
                $progressPrefix = "[$(Get-Date -Format 'HH:mm:ss')] [$currentSourceNum/$totalSources]"
                
                if (Get-Command $functionName -ErrorAction SilentlyContinue) {
                    try {
                        Write-MandALog ("$progressPrefix Starting $source discovery..." ) -Level "PROGRESS" -Context $Context
                        $result = & $functionName -Configuration $Context.Config -Context $Context
                        $recordCount = Get-DiscoveryRecordCount -Result $result
                        $discoveryResults[$source] = @{ Success = $true; Data = $result; RecordCount = $recordCount; Duration = (Get-Date) - $sourceStartTime }
                        $summaryStats.TotalRecords += $recordCount; $summaryStats.SuccessfulModules++
                        Write-MandALog ("$progressPrefix $source completed. Records: $recordCount, Time: $($discoveryResults[$source].Duration.ToString('mm\:ss'))") -Level "SUCCESS" -Context $Context
                    } catch {
                        $errorMessage = $_.Exception.Message
                        $Context.ErrorCollector.AddError($source, "Discovery failed: $errorMessage", $_.Exception)
                        $discoveryResults[$source] = @{ Success = $false; Error = $errorMessage; RecordCount = 0; Duration = (Get-Date) - $sourceStartTime }
                        $summaryStats.FailedModules++
                        Write-MandALog ("$progressPrefix $source FAILED. Error: $errorMessage") -Level "ERROR" -Context $Context
                    }
                } else {
                    $Context.ErrorCollector.AddWarning($source, "Discovery function not found: $functionName")
                    $discoveryResults[$source] = @{ Success = $false; Error = "Module not available"; RecordCount = 0; Duration = [TimeSpan]::Zero }
                    $summaryStats.SkippedModules++
                    Write-MandALog ("$progressPrefix $source SKIPPED (Function $functionName not found).") -Level "WARN" -Context $Context
                }
            }
        }
        
        $phaseDuration = (Get-Date) - $phaseStartTime
        $summaryStats.TotalDuration = $phaseDuration
        
        # Log summary (similar to the original, adapt if needed)
        Write-MandALog "DISCOVERY PHASE SUMMARY" -Level "HEADER" -Context $Context
        $discoveryResults.GetEnumerator() | ForEach-Object {
            $sourceName = $_.Name
            $res = $_.Value
            $statusText = if ($res.Success) { "SUCCESS (Records: $($res.RecordCount), Time: $($res.Duration.ToString('mm\:ss')))" } else { "FAILED (Error: $($res.Error))" }
            Write-MandALog "  $sourceName : $statusText" -Level INFO -Context $Context
        }
        Write-MandALog ("Statistics: TotalRecords={0}, SuccessfulModules={1}, FailedModules={2}, SkippedModules={3}, TotalDuration={4}" -f $summaryStats.TotalRecords, $summaryStats.SuccessfulModules, $summaryStats.FailedModules, $summaryStats.SkippedModules, $summaryStats.TotalDuration.ToString('hh\:mm\:ss')) -Level "INFO" -Context $Context

        return $discoveryResults
    } catch {
        $errorMessage = $_.Exception.Message
        Write-MandALog "DISCOVERY PHASE FAILED: $errorMessage" -Level "ERROR" -Context $Context
        $Context.ErrorCollector.AddError("DiscoveryPhase", "Outer Discovery Phase error: $errorMessage", $_.Exception)
        throw
    } finally {
        $Context.OrchestratorState.PopExecution()
    }
}

# Helper function to count records (simplified from original)
function Get-DiscoveryRecordCount { param($Result) if ($null -eq $Result) { return 0 }; if ($Result -is [array]) { return $Result.Count }; return 1 }


function Invoke-ProcessingPhase {
    [CmdletBinding()]
    param([MandAContext]$Context)
    
    if (-not $Context.OrchestratorState.CanExecute("Processing")) {
        throw "Processing phase execution limit exceeded or circular dependency detected. Path: $($Context.OrchestratorState.GetExecutionPath())"
    }
    $Context.OrchestratorState.PushExecution("Processing")
    
    try {
        Write-MandALog "STARTING PROCESSING PHASE" -Level "HEADER" -Context $Context
        $rawDataPath = $Context.Paths.RawDataOutput
        if (-not (Test-Path $rawDataPath)) { throw "Raw data directory not found. Please run Discovery phase first." }
        
        $csvFiles = Get-ChildItem -Path $rawDataPath -Filter "*.csv" -File
        if ($csvFiles.Count -eq 0) { throw "No raw data files found. Please run Discovery phase first." }
        
        Write-MandALog "Found $($csvFiles.Count) raw data files to process" -Level "INFO" -Context $Context
        
        if (Get-Command "Start-DataAggregation" -ErrorAction SilentlyContinue) {
            $processingResult = Start-DataAggregation -Context $Context # Pass full context
            if (-not $processingResult) { throw "Data aggregation failed" }
            Write-MandALog "Processing Phase Completed Successfully" -Level "SUCCESS" -Context $Context
            return $true
        } else { throw "Processing function 'Start-DataAggregation' not found" }
    }
    catch {
        $Context.ErrorCollector.AddError("Processing", "Processing phase failed: $($_.Exception.Message)", $_.Exception)
        Write-MandALog "Processing phase failed: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
    finally { $Context.OrchestratorState.PopExecution() }
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
        if (-not (Test-Path $processedDataPath)) { throw "Processed data directory not found. Please run Processing phase first." }
        
        $dataToExport = @{}
        $processedFiles = Get-ChildItem -Path $processedDataPath -Filter "*.csv" -File
        if ($processedFiles.Count -eq 0) { Write-MandALog "No processed data files found. Export may be empty." -Level "WARN" -Context $Context }

        foreach ($file in $processedFiles) {
            $dataKey = $file.BaseName
            try { $dataToExport[$dataKey] = Import-Csv -Path $file.FullName -Encoding UTF8 } # Specify Encoding
            catch { $Context.ErrorCollector.AddError("Export_Load", "Failed to load file: $($file.Name)", $_.Exception) }
        }
        
        $enabledFormats = @($Context.Config.export.formats)
        $exportSuccess = $true
        
        foreach ($format in $enabledFormats) {
            $functionName = Get-ExportFunctionName -Format $format -Context $Context
            if ([string]::IsNullOrWhiteSpace($functionName) ){ $exportSuccess = $false; continue }

            if (Get-Command $functionName -ErrorAction SilentlyContinue) {
                try {
                    Write-MandALog "Executing $functionName for format '$format'" -Level "INFO" -Context $Context
                    & $functionName -ProcessedData $dataToExport -Context $Context # Pass full context
                    Write-MandALog "Export completed for format '$format'" -Level "SUCCESS" -Context $Context
                } catch {
                    $Context.ErrorCollector.AddError("Export_$format", "Export failed: $($_.Exception.Message)", $_.Exception)
                    $exportSuccess = $false
                }
            } else {
                $Context.ErrorCollector.AddWarning("Export", "Export function not found for format '$format': $functionName")
                 $exportSuccess = $false
            }
        }
        Write-MandALog ("Export Phase Completed " + (if($exportSuccess){"Successfully"}else{"with Errors"})) -Level (if($exportSuccess){"SUCCESS"}else{"WARN"}) -Context $Context
        return $exportSuccess
    }
    catch {
        $Context.ErrorCollector.AddError("Export", "Export phase failed: $($_.Exception.Message)", $_.Exception)
        Write-MandALog "Export phase failed: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
    finally { $Context.OrchestratorState.PopExecution() }
}

function Get-ExportFunctionName {
    param([string]$Format, [MandAContext]$Context) # Added Context for logging
    $mapping = @{
        "PowerApps" = "Export-ForPowerApps"; "CompanyControlSheet" = "Export-ToCompanyControlSheet";
        "CSV" = "Export-ToCSV"; "JSON" = "Export-ToJSON"; "Excel" = "Export-ToExcel"
    }
    $funcName = if ($mapping.ContainsKey($Format)) { $mapping[$Format] } else { "Export-To$Format" }

    if (Get-Command $funcName -ErrorAction SilentlyContinue) { return $funcName }
    else {
        $errMsg = "Export function '$funcName' for format '$Format' not found."
        if ($Context -and (Get-Command Write-MandALog -ErrorAction SilentlyContinue) -and $global:MandA.LoggingInitialized) { Write-MandALog $errMsg -Level "WARN" -Context $Context } 
        else { Write-Warning $errMsg }
        return $null
    }
}

function Complete-MandADiscovery {
    [CmdletBinding()]
    param([MandAContext]$Context)

    # Logging function selection
    $logOutput = if (Get-Command Write-MandALog -ErrorAction SilentlyContinue -and $Context -and $Context.PSObject.Properties['LoggingInitialized'] -and $Context.LoggingInitialized) { ${function:Write-MandALog} } else { ${function:Write-Host} }
    $logParams = if ($logOutput.Name -eq 'Write-MandALog') { @{Context=$Context} } else { @{} }

    $logOutput.Invoke("FINALIZING M&A DISCOVERY SUITE EXECUTION", @{Level="HEADER"} + $logParams)
    
    if ($Context.ErrorCollector.HasErrors()) {
        $errorReportPath = Join-Path $Context.Paths.LogOutput "ErrorReport_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
        $logOutput.Invoke("Error report will be exported to: $errorReportPath", @{Level="WARN"} + $logParams)
        $Context.ErrorCollector.ExportToFile($errorReportPath)
    }
    
    $duration = (Get-Date) - $Context.StartTime
    $logOutput.Invoke("Execution completed in: $($duration.ToString('hh\:mm\:ss'))", @{Level="INFO"} + $logParams)
    $logOutput.Invoke("Error Summary: $($Context.ErrorCollector.GetSummary())", @{Level="INFO"} + $logParams)
    $logOutput.Invoke("Output locations:", @{Level="INFO"} + $logParams)
    $logOutput.Invoke("  - Logs: $($Context.Paths.LogOutput)", @{Level="INFO"} + $logParams)
    # ... other paths ...
}

#===============================================================================
#                        MAIN EXECUTION BLOCK
#===============================================================================

try {
    # STEP 1: Ensure Global MandA Context is Initialized by Set-SuiteEnvironment.ps1
    if ($null -eq $global:MandA -or -not $global:MandA.Initialized) {
        Write-Host "Global environment (`$global:MandA`) not initialized. Attempting to source Set-SuiteEnvironment.ps1..." -ForegroundColor Yellow
        $envScriptPath = Join-Path (Split-Path $PSScriptRoot -Parent) "Scripts\Set-SuiteEnvironment.ps1" # Assumes QuickStart is in root.
        if (-not (Test-Path $envScriptPath -PathType Leaf)) {
            throw "CRITICAL: Set-SuiteEnvironment.ps1 not found at expected location '$envScriptPath'. Cannot proceed."
        }
        # CompanyName for Set-SuiteEnvironment.ps1
        $companyForEnvSetup = $CompanyName # Use parameter if provided
        if ([string]::IsNullOrWhiteSpace($companyForEnvSetup)) {
            # If not provided to QuickStart, Get-CompanySelection will be called later if needed.
            # For Set-SuiteEnvironment, we need a CompanyName. If $global:MandA.CompanyName exists from a previous partial run, use it.
            # Otherwise, this is a tricky spot if QuickStart is run without CompanyName and $global:MandA isn't set.
            # Set-SuiteEnvironment.ps1 makes CompanyName mandatory.
             if ($null -ne $global:MandA -and $global:MandA.ContainsKey('CompanyName') -and -not [string]::IsNullOrWhiteSpace($global:MandA.CompanyName)) {
                $companyForEnvSetup = $global:MandA.CompanyName
                Write-Host "Using CompanyName '$companyForEnvSetup' from potentially existing (but uninitialized) global context for Set-SuiteEnvironment." -ForegroundColor Yellow
            } else {
                # Prompt if truly no CompanyName is available yet.
                $companyForEnvSetup = Get-CompanySelection # This ensures Set-SuiteEnvironment gets a CompanyName
                Write-Host "CompanyName for Set-SuiteEnvironment obtained via prompt: '$companyForEnvSetup'" -ForegroundColor Yellow
            }
        }
        . $envScriptPath -CompanyName $companyForEnvSetup -ProvidedSuiteRoot (Split-Path $PSScriptRoot -Parent)
        if ($null -eq $global:MandA -or -not $global:MandA.Initialized) {
            throw "CRITICAL: Failed to initialize global M&A environment context via Set-SuiteEnvironment.ps1."
        }
        Write-Host "Global M&A environment context initialized by QuickStart.ps1." -ForegroundColor Green
    }
    
    # STEP 2: Determine Effective Company Name
    $effectiveCompanyName = $CompanyName # Parameter takes precedence
    if ([string]::IsNullOrWhiteSpace($effectiveCompanyName)) {
        if ($null -ne $global:MandA -and $global:MandA.ContainsKey('CompanyName') -and -not [string]::IsNullOrWhiteSpace($global:MandA.CompanyName)) {
            $effectiveCompanyName = $global:MandA.CompanyName
            Write-Host "Using company name from global context: $effectiveCompanyName" -ForegroundColor Green
        } else {
            $effectiveCompanyName = Get-CompanySelection
            Write-Host "Company name selected/entered: $effectiveCompanyName" -ForegroundColor Green
        }
    }
    $effectiveCompanyName = $effectiveCompanyName -replace '[<>:"/\\|?*]', '_' # Sanitize

    # STEP 3: Load Configuration
    $configuration = $null
    if (-not ([string]::IsNullOrWhiteSpace($ConfigurationFile))) {
        $configPath = if ([System.IO.Path]::IsPathRooted($ConfigurationFile)) { $ConfigurationFile } else { Join-Path $global:MandA.Paths.Configuration $ConfigurationFile }
        if (-not (Test-Path $configPath -PathType Leaf)) { throw "Specified configuration file '$configPath' not found." }
        $configuration = ConvertTo-HashtableRecursive (Get-Content -Path $configPath -Raw | ConvertFrom-Json -ErrorAction Stop)
        Write-Host "Loaded configuration from specified file: $configPath" -ForegroundColor Cyan
    } elseif ($null -ne $global:MandA -and $global:MandA.ContainsKey('Config') -and ($null -ne $global:MandA.Config)) {
        $configuration = $global:MandA.Config # This should be a hashtable from Set-SuiteEnvironment
        Write-Host "Using configuration from global context (`$global:MandA.Config)." -ForegroundColor Green
    } else {
        throw "CRITICAL: Configuration not found. Ensure Set-SuiteEnvironment.ps1 ran or provide -ConfigurationFile."
    }
    if ($null -eq $configuration) { throw "Failed to load configuration."}
    
    # Ensure the working configuration reflects the effective company name.
    if (($configuration.metadata.companyName | Get-OrElse "") -ne $effectiveCompanyName) {
        Write-Host "Updating company name in working configuration to '$effectiveCompanyName'." -ForegroundColor Yellow
        $configuration.metadata.companyName = $effectiveCompanyName
    }

    # STEP 4: Handle Force Mode
    if ($Force.IsPresent) {
        $configuration.discovery.skipExistingFiles = $false
        Write-Host "Force mode enabled: 'skipExistingFiles' set to false." -ForegroundColor Yellow
    }
    
    # STEP 5: Handle Azure-Only Mode
    $effectiveMode = $Mode
    if ($Mode -eq "AzureOnly") {
        Write-Host "`nAzure-Only mode selected. Limiting discovery to cloud sources." -ForegroundColor Cyan
        $currentSources = $configuration.discovery.enabledSources
        $configuration.discovery.enabledSources = $currentSources | Where-Object { $_ -in $script:AzureOnlySources }
        Write-Host "Enabled sources for Azure-Only: $($configuration.discovery.enabledSources -join ', ')" -ForegroundColor Yellow
        $effectiveMode = "Full" # Internally, it's a full run with filtered sources
    }
    
    # STEP 6: Create MandAContext for this run
    $script:Context = [MandAContext]::new($configuration, $effectiveCompanyName)
    if (-not $script:Context.ValidateContext()){
        throw "MandAContext validation failed. Cannot proceed."
    }
    
    # STEP 7: Initialize Environment (Loads modules, sets up logging via Write-MandALog)
    Initialize-MandAEnvironment -Context $script:Context -CurrentMode $effectiveMode -IsValidateOnlyMode:$ValidateOnly.IsPresent
    
    # STEP 8: Handle ValidateOnly Mode
    if ($ValidateOnly.IsPresent) {
        Write-MandALog "Validation-only mode completed successfully." -Level "SUCCESS" -Context $script:Context
        if ($script:Context.ErrorCollector.HasErrors()) {
             Write-MandALog "Validation mode found issues. Check error report." -Level "WARN" -Context $script:Context
             Complete-MandADiscovery -Context $script:Context
             exit 1
        }
        exit 0
    }
    
    # STEP 9: Authentication & Connection (Only if discovery is part of the mode)
    if ($effectiveMode -in "Discovery", "Full") {
        Write-MandALog "AUTHENTICATION & CONNECTION SETUP" -Level "HEADER" -Context $script:Context
        if (Get-Command "Initialize-MandAAuthentication" -ErrorAction SilentlyContinue) {
            try {
                $authResult = Initialize-MandAAuthentication -Context $script:Context # Pass full context
                if ($authResult -and $authResult.PSObject.Properties['Authenticated'].Value) {
                    Write-MandALog "Authentication successful" -Level "SUCCESS" -Context $script:Context
                    if (Get-Command "Initialize-AllConnections" -ErrorAction SilentlyContinue) {
                        # Pass authentication context from $authResult to connection manager
                        $authContextForConnections = if ($authResult.PSObject.Properties['Context']) { $authResult.Context } else { $authResult }
                        $connectionStatus = Initialize-AllConnections -AuthContext $authContextForConnections -Context $script:Context
                        foreach ($service in $connectionStatus.Keys) {
                            $status = $connectionStatus[$service]; $isConnected = if ($status -is [bool]) { $status } else { $status.Connected }
                            Write-MandALog ("Connected to $service : $isConnected") -Level (if($isConnected){"SUCCESS"}else{"WARN"}) -Context $script:Context
                        }
                    } else { Write-MandALog "Initialize-AllConnections function not found." -Level "WARN" -Context $script:Context}
                } else {
                    $errorMsg = if ($authResult -and $authResult.PSObject.Properties['Error']) { $authResult.Error } else { "Authentication failed - no error details." }
                    $script:Context.ErrorCollector.AddError("Authentication", $errorMsg, $null)
                    Write-MandALog "Authentication failed: $errorMsg" -Level "ERROR" -Context $script:Context
                    if (($script:Context.Config.environment.connectivity.haltOnConnectionError | Get-OrElse @()) -contains "Authentication") {
                        throw "CRITICAL: Authentication failed and is configured as critical: $errorMsg"
                    }
                }
            } catch {
                $errorMsg = $_.Exception.Message
                $script:Context.ErrorCollector.AddError("Authentication", "Authentication initialization failed: $errorMsg", $_.Exception)
                Write-MandALog "Authentication error: $errorMsg. Stack: $($_.ScriptStackTrace)" -Level "ERROR" -Context $script:Context
                if (($script:Context.Config.environment.connectivity.haltOnConnectionError | Get-OrElse @()) -contains "Authentication") {
                     throw "CRITICAL: Authentication initialization failed: $errorMsg"
                }
            }
        } else {
            $authInitMissingMsg = "Initialize-MandAAuthentication function not found. Authentication cannot proceed."
            Write-MandALog $authInitMissingMsg -Level "ERROR" -Context $script:Context
            $script:Context.ErrorCollector.AddError("Environment", $authInitMissingMsg, $null)
            if ($effectiveMode -in "Discovery", "Full") { throw $authInitMissingMsg }
        }
    }
    
    # STEP 10: Execute Phases Based on Mode
    switch ($effectiveMode) {
        "Discovery"  { Invoke-DiscoveryPhase  -Context $script:Context }
        "Processing" { Invoke-ProcessingPhase -Context $script:Context }
        "Export"     { Invoke-ExportPhase     -Context $script:Context }
        "Full"       { 
            Invoke-DiscoveryPhase  -Context $script:Context
            Invoke-ProcessingPhase -Context $script:Context
            Invoke-ExportPhase     -Context $script:Context 
        }
        default { throw "Invalid operation mode: '$effectiveMode'" }
    }
    
    # STEP 11: Finalize
    Complete-MandADiscovery -Context $script:Context
    
    # Exit with appropriate code
    if ($script:Context.ErrorCollector.HasCriticalErrors()) { exit 2 } 
    elseif ($script:Context.ErrorCollector.HasErrors()) { exit 1 } 
    else { exit 0 }
}
catch {
    $errorMessage = "QUICKSTART SCRIPT FAILED (MAIN TRY/CATCH): $($_.Exception.Message)"
    if ($script:Context -and $script:Context.ErrorCollector -and (Get-Command Write-MandALog -ErrorAction SilentlyContinue -and $global:MandA.LoggingInitialized)) {
        Write-MandALog -Message $errorMessage -Level CRITICAL -Context $script:Context
        Write-MandALog -Message ("Stack Trace: " + $_.ScriptStackTrace) -Level DEBUG -Context $script:Context
        Complete-MandADiscovery -Context $script:Context # Attempt to log errors
    } else {
        Write-Host $errorMessage -ForegroundColor Red
        Write-Host ("Stack Trace: " + $_.ScriptStackTrace) -ForegroundColor Yellow
    }
    exit 3 # General critical failure
}
finally {
    # Cleanup (e.g., disconnect services)
    if ($script:Context -and (Get-Command "Disconnect-AllServices" -ErrorAction SilentlyContinue)) {
        try {
            Write-MandALog "Attempting to disconnect all services..." -Level INFO -Context $script:Context
            Disconnect-AllServices -Context $script:Context
        } catch {
            $disconnectError = "Warning: Error during final service disconnection: $($_.Exception.Message)"
            if ($script:Context -and (Get-Command Write-MandALog -ErrorAction SilentlyContinue -and $global:MandA.LoggingInitialized)) { Write-MandALog $disconnectError -Level WARN -Context $script:Context}
            else { Write-Warning $disconnectError }
        }
    }
    # Restore original ErrorActionPreference
    $ErrorActionPreference = $OriginalErrorActionPreference
    Write-Host "[QuickStart.ps1] Execution finished. Restored ErrorActionPreference to '$ErrorActionPreference'." -ForegroundColor Gray
}

