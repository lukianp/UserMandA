#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Main Orchestrator (Enhanced Version 5.5.9)
.DESCRIPTION
    Unified orchestrator for discovery, processing, and export with improved
    state management, error handling, and parallel processing support.
    This version expects Get-OrElse to be globally defined by Set-SuiteEnvironment.ps1
    and includes an improved Import-ModuleWithManifest strategy.
.NOTES
    Author: Enhanced Version
    Version: 5.5.9
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

# CRITICAL EXPECTATION: 
# Set-SuiteEnvironment.ps1 MUST define the following function in the global scope 
# BEFORE this orchestrator runs:
#   function global:Get-OrElse { param($Value, $Default) if ($null -ne $Value) { return $Value } else { return $Default } }
# This is essential for any part of the suite (including modules loaded herein) that might use Get-OrElse.

#===============================================================================
#                       CLASSES AND TYPES
#===============================================================================

class MandAContext {
    [hashtable]$Paths
    [hashtable]$Config
    [string]$Version
    [datetime]$StartTime
    [bool]$ModulesChecked
    [DiscoveryErrorCollector]$ErrorCollector
    [OrchestratorState]$OrchestratorState
    
    MandAContext([hashtable]$initialConfig, [string]$currentCompanyName) {
        $this.Config = ConvertTo-HashtableRecursive -InputObject $initialConfig
        $this.Version = "5.5.9" 
        $this.StartTime = Get-Date
        $this.ModulesChecked = $false
        $this.ErrorCollector = [DiscoveryErrorCollector]::new()
        $this.OrchestratorState = [OrchestratorState]::new()
        
        if ($null -ne $global:MandA -and $null -ne $global:MandA.Paths -and $global:MandA.CompanyName -eq $currentCompanyName) {
            Write-Verbose "MandAContext: Using paths from established global environment for company '$currentCompanyName'."
            $this.Paths = $global:MandA.Paths.Clone() 
        } else {
            Write-Verbose "MandAContext: Global environment not found or for different company. Initializing paths for '$currentCompanyName'."
            $this.InitializePaths($currentCompanyName) 
        }
    }
    
    [void]InitializePaths([string]$currentCompanyName) {
        $suiteRoot = $null
        if ($PSScriptRoot) { 
            $suiteRoot = Split-Path $PSScriptRoot -Parent
        } elseif ($global:MandA -and $global:MandA.Paths -and $global:MandA.Paths.SuiteRoot) {
            $suiteRoot = $global:MandA.Paths.SuiteRoot
        } else {
            try { $suiteRoot = Split-Path (Get-Location).Path -Parent } catch { $suiteRoot = ".\" }
            Write-Warning "MandAContext.InitializePaths: Could not reliably determine SuiteRoot. Using '$suiteRoot'."
        }

        $profilesBasePath = "C:\MandADiscovery\Profiles" 
        if ($this.Config -and $this.Config.environment -and -not [string]::IsNullOrWhiteSpace($this.Config.environment.profilesBasePath)) {
            $profilesBasePath = $this.Config.environment.profilesBasePath
        } elseif ($global:MandA -and $global:MandA.Config -and $global:MandA.Config.environment -and -not [string]::IsNullOrWhiteSpace($global:MandA.Config.environment.profilesBasePath)) {
            $profilesBasePath = $global:MandA.Config.environment.profilesBasePath
        }
        
        $this.Paths = @{
            SuiteRoot = $suiteRoot
            ProfilesBasePath = $profilesBasePath
            CompanyProfileRoot = Join-Path $profilesBasePath $currentCompanyName
            Modules = Join-Path $suiteRoot "Modules"
            Utilities = Join-Path $suiteRoot "Modules\Utilities"
            Core = Join-Path $suiteRoot "Core"
            Scripts = Join-Path $suiteRoot "Scripts"
            Configuration = Join-Path $suiteRoot "Configuration"
        }
        
        $this.Paths.RawDataOutput = Join-Path $this.Paths.CompanyProfileRoot "Raw"
        $this.Paths.ProcessedDataOutput = Join-Path $this.Paths.CompanyProfileRoot "Processed"
        $this.Paths.LogOutput = Join-Path $this.Paths.CompanyProfileRoot "Logs"
        $this.Paths.ExportOutput = Join-Path $this.Paths.CompanyProfileRoot "Exports"
        $this.Paths.TempPath = Join-Path $this.Paths.CompanyProfileRoot "Temp"
        
        if ($null -ne $this.Config -and $null -ne $this.Config.environment) {
            $this.Config.environment.outputPath = $this.Paths.CompanyProfileRoot
        } else {
             Write-Warning "MandAContext.InitializePaths: $this.Config or $this.Config.environment is null. Cannot set outputPath in config."
        }
    }
    
    [bool]ValidateContext() {
        $required = @('SuiteRoot', 'CompanyProfileRoot', 'Modules', 'Utilities') 
        foreach ($pathKey in $required) {
            if (-not $this.Paths.ContainsKey($pathKey) -or [string]::IsNullOrWhiteSpace($this.Paths[$pathKey])) {
                Write-Warning "MandAContext.ValidateContext: Failed validation for path key '$pathKey'. Value: '$($this.Paths[$pathKey])'"
                return $false
            }
            if (-not (Test-Path $this.Paths[$pathKey] -ErrorAction SilentlyContinue)) {
                if ($pathKey -in @('SuiteRoot', 'Modules', 'Utilities', 'Configuration', 'Core', 'Scripts')) {
                    Write-Warning "MandAContext.ValidateContext: Critical path '$($this.Paths[$pathKey])' for '$pathKey' does not exist."
                }
            }
        }
        return $true
    }
}

class OrchestratorState {
    [int]$MaxExecutions = 5; [System.Collections.Generic.Stack[string]]$ExecutionStack; [System.Collections.Generic.Dictionary[string,int]]$PhaseExecutions
    OrchestratorState() { $this.ExecutionStack = [System.Collections.Generic.Stack[string]]::new(); $this.PhaseExecutions = [System.Collections.Generic.Dictionary[string,int]]::new() }
    [bool]CanExecute([string]$phase) { if ($this.ExecutionStack.Contains($phase)) { return $false }; if (-not $this.PhaseExecutions.ContainsKey($phase)) { $this.PhaseExecutions[$phase] = 0 }; return $this.PhaseExecutions[$phase] -lt $this.MaxExecutions }
    [void]PushExecution([string]$phase) { $this.ExecutionStack.Push($phase); if (-not $this.PhaseExecutions.ContainsKey($phase)) { $this.PhaseExecutions[$phase] = 0 }; $this.PhaseExecutions[$phase]++ }
    [void]PopExecution() { if ($this.ExecutionStack.Count -gt 0) { $null = $this.ExecutionStack.Pop() } }
    [string]GetExecutionPath() { return ($this.ExecutionStack.ToArray() | ForEach-Object { $_ }) -join ' -> ' }
}

class DiscoveryErrorCollector {
    [System.Collections.Generic.List[PSObject]]$Errors; [System.Collections.Generic.List[PSObject]]$Warnings; [System.Collections.Generic.Dictionary[string,int]]$ErrorCounts
    DiscoveryErrorCollector() { $this.Errors = [System.Collections.Generic.List[PSObject]]::new(); $this.Warnings = [System.Collections.Generic.List[PSObject]]::new(); $this.ErrorCounts = [System.Collections.Generic.Dictionary[string,int]]::new() }
    [void]AddError([string]$Source, [string]$Message, [Exception]$Exception) { $errorEntry = [PSCustomObject]@{Timestamp = Get-Date; Source = $Source; Message = $Message; ExceptionType = if ($Exception) { $Exception.GetType().FullName } else { "Unknown" }; ExceptionMessage = if ($Exception) { $Exception.Message } else { $null }; StackTrace = if ($Exception) { $Exception.ScriptStackTrace } else { $null }}; $this.Errors.Add($errorEntry); if (-not $this.ErrorCounts.ContainsKey($Source)) { $this.ErrorCounts[$Source] = 0 }; $this.ErrorCounts[$Source]++ }
    [void]AddWarning([string]$Source, [string]$Message) { $this.Warnings.Add([PSCustomObject]@{ Timestamp = Get-Date; Source = $Source; Message = $Message }) }
    [bool]HasErrors() { return $this.Errors.Count -gt 0 }
    [bool]HasCriticalErrors() { return ($this.Errors | Where-Object { $_.Source -match "Critical|Core|ModuleLoader|Environment|Authentication" }).Count -gt 0 }
    [string]GetSummary() { $summary = "Errors: $($this.Errors.Count), Warnings: $($this.Warnings.Count)"; if ($this.ErrorCounts.Count -gt 0) { $summary += "`nError breakdown by source:"; foreach ($sourceKey in $this.ErrorCounts.Keys | Sort-Object) { $summary += "`n  - $sourceKey - $($this.ErrorCounts[$sourceKey])" }}; return $summary }
    [void]ExportToFile([string]$FilePath) { $cleanedErrors = $this.Errors | ForEach-Object { @{ Timestamp = $_.Timestamp; Source = $_.Source; Message = $_.Message; ExceptionMessage = $_.ExceptionMessage; ExceptionType = $_.ExceptionType; StackTrace = $_.StackTrace } }; $report = @{ Summary = $this.GetSummary(); GeneratedAt = Get-Date; Errors = $cleanedErrors; Warnings = $this.Warnings; ErrorCounts = $this.ErrorCounts }; try { $report | ConvertTo-Json -Depth 10 -Compress | Set-Content -Path $FilePath -Encoding UTF8 } catch { $textReport = "Error Report Generated: $(Get-Date)`nSummary: $($this.GetSummary())`n`nErrors:`n$($cleanedErrors | ForEach-Object { "[$($_.Timestamp)] $($_.Source): $($_.Message)" } | Out-String)`n`nWarnings:`n$($this.Warnings | ForEach-Object { "[$($_.Timestamp)] $($_.Source): $($_.Message)" } | Out-String)"; $textReport | Set-Content -Path ($FilePath -replace '\.json$', '.txt') -Encoding UTF8 } }
}

#===============================================================================
#                       INITIALIZATION
#===============================================================================
$ErrorActionPreference = "Stop"; $ProgressPreference = "Continue"; $script:Context = $null
$script:AzureOnlySources = @("Azure","Graph","Intune","Licensing","ExternalIdentity","SharePoint","Teams","Exchange")

#===============================================================================
#                    UTILITY FUNCTIONS
#===============================================================================
function Get-CompanySelection { [CmdletBinding()] param(); $profilesBasePath = "C:\MandADiscovery\Profiles"; if (-not (Test-Path $profilesBasePath)) { New-Item -Path $profilesBasePath -ItemType Directory -Force | Out-Null }; $existingProfiles = Get-ChildItem -Path $profilesBasePath -Directory -EA SilentlyContinue | Select-Object -ExpandProperty Name | Sort-Object; if ($existingProfiles.Count -gt 0) { Write-Host "`n=== Company Profile Selection ===" -ForegroundColor Cyan; Write-Host "Existing company profiles found:" -ForegroundColor Yellow; for ($i = 0; $i -lt $existingProfiles.Count; $i++) { Write-Host "  $($i + 1). $($existingProfiles[$i])" -ForegroundColor White }; Write-Host "  N. Create new company profile" -ForegroundColor Green; Write-Host ""; do { $selection = Read-Host "Select a profile (1-$($existingProfiles.Count)) or 'N' for new"; if ($selection -eq 'N' -or $selection -eq 'n') { $companyNameInput = Read-Host "Enter new company name"; if ([string]::IsNullOrWhiteSpace($companyNameInput)) { Write-Host "Company name cannot be empty" -ForegroundColor Red; continue }; return $companyNameInput -replace '[<>:"/\\|?*]', '_' } elseif ($selection -match '^\d+$') { $index = [int]$selection - 1; if ($index -ge 0 -and $index -lt $existingProfiles.Count) { return $existingProfiles[$index] } }; Write-Host "Invalid selection. Please try again." -ForegroundColor Red } while ($true) } else { Write-Host "`nNo existing company profiles found." -ForegroundColor Yellow; $companyNameInput = Read-Host "Enter company name for new profile"; if ([string]::IsNullOrWhiteSpace($companyNameInput)) { throw "Company name cannot be empty" }; return $companyNameInput -replace '[<>:"/\\|?*]', '_' } }
function ConvertTo-HashtableRecursive { param([Parameter(ValueFromPipeline)] $InputObject); process { if ($null -eq $InputObject) { return $null }; if ($InputObject -is [System.Collections.IEnumerable] -and $InputObject -isnot [string] -and $InputObject -isnot [hashtable]) { return ,@($InputObject | ForEach-Object { ConvertTo-HashtableRecursive $_ }) }; if ($InputObject -is [PSCustomObject]) { $hash = @{}; $InputObject.PSObject.Properties | ForEach-Object { $hash[$_.Name] = ConvertTo-HashtableRecursive $_.Value }; return $hash }; return $InputObject } }
function Test-ModuleConfiguration { param([hashtable]$Configuration, [string]$ModuleName); $requiredSettings = @{ 'ActiveDirectory' = @('environment.domainController'); 'Azure' = @(); 'Exchange' = @('authentication.authenticationMethod'); 'Graph' = @(); 'EnvironmentDetection' = @('environment.outputPath') }; if (-not $requiredSettings.ContainsKey($ModuleName)) { return $true }; $missing = @(); foreach ($setting in $requiredSettings[$ModuleName]) { $value = $Configuration; $valid = $true; foreach ($part in $setting.Split('.')) { if ($null -eq $value -or -not $value.ContainsKey($part)) { $valid = $false; break }; $value = $value[$part] }; if (-not $valid -or $null -eq $value -or ($value -is [string] -and [string]::IsNullOrWhiteSpace($value))) { $missing += $setting } }; if ($missing.Count -gt 0) { throw "Missing required configuration for $ModuleName module: $($missing -join ', ')" }; return $true }

function Import-ModuleWithManifest {
    param( 
        [string]$ModulePathToImport, 
        [MandAContext]$CurrentContext 
    )
    if ([string]::IsNullOrWhiteSpace($ModulePathToImport)) {
        Write-MandALog "Import-ModuleWithManifest: ModulePathToImport is null or empty." -Level "ERROR" -Context $CurrentContext; return $false
    }
    Write-Host "[DEBUG IMM] Attempting to import: '$ModulePathToImport'" -ForegroundColor Gray
    if (-not (Test-Path $ModulePathToImport)) {
        Write-MandALog "Import-ModuleWithManifest: Module file not found: $ModulePathToImport" -Level "ERROR" -Context $CurrentContext; return $false
    }
    $moduleNameToLoad = [System.IO.Path]::GetFileNameWithoutExtension($ModulePathToImport)
    
    # Check if module is already loaded
    if (Get-Module -Name $moduleNameToLoad -ErrorAction SilentlyContinue) {
        Write-MandALog "Module '$moduleNameToLoad' is already loaded." -Level "DEBUG" -Context $CurrentContext
        return $true # Successfully "imported" as it's already available
    }

    $moduleDirectory = Split-Path $ModulePathToImport -Parent
    if ([string]::IsNullOrWhiteSpace($moduleDirectory)) {
        Write-MandALog "Import-ModuleWithManifest: Could not determine module directory for: $ModulePathToImport" -Level "ERROR" -Context $CurrentContext; return $false
    }
    $manifestFullPath = Join-Path $moduleDirectory "$moduleNameToLoad.psd1"
    
    $originalErrorAction = $ErrorActionPreference 
    try {
        $loadingContextPaths = if ($CurrentContext -and $CurrentContext.Paths) { $CurrentContext.Paths } else { @{} }
        $loadingContextConfig = if ($CurrentContext -and $CurrentContext.Config) { $CurrentContext.Config } else { @{} }
        $loadingContextCompanyName = "UnknownCompany"
        if ($CurrentContext -and $CurrentContext.Config -and $CurrentContext.Config.metadata -and $CurrentContext.Config.metadata.ContainsKey('companyName')) {
            $loadingContextCompanyName = $CurrentContext.Config.metadata.companyName
        } elseif ($CurrentContext -and $CurrentContext.CompanyName) { 
             $loadingContextCompanyName = $CurrentContext.CompanyName
        }

        $loadingContextForModule = @{ 
            Paths = $loadingContextPaths; Config = $loadingContextConfig; CompanyName = $loadingContextCompanyName 
        }
        
        $debugContextString = "[DEBUG IMM] Context for '$moduleNameToLoad': Paths.Keys.Count: $($loadingContextForModule.Paths.Keys.Count); Config.Keys.Count: $($loadingContextForModule.Config.Keys.Count); CompanyName: '$($loadingContextForModule.CompanyName)'"
        Write-Host $debugContextString -ForegroundColor DarkCyan
        
        $global:_MandALoadingContext = $loadingContextForModule
        
        # $ErrorActionPreference = "Continue" # Removed, rely on outer "Stop" and catch here.
        # For Import-Module, errors during parsing are often terminating if $ErrorActionPreference is Stop globally.

        if (Test-Path $manifestFullPath) {
            Write-Host "[DEBUG IMM] Importing manifest '$manifestFullPath' for module '$moduleNameToLoad'." -ForegroundColor DarkGray
            Import-Module $manifestFullPath -Force -Global -ErrorAction Stop 
            Write-MandALog "Loaded module from manifest: $moduleNameToLoad" -Level "SUCCESS" -Context $CurrentContext
        } else {
            Write-Host "[DEBUG IMM] Importing PSM1 '$ModulePathToImport' for module '$moduleNameToLoad'." -ForegroundColor DarkGray
            Import-Module $ModulePathToImport -Force -Global -ErrorAction Stop 
            Write-MandALog "Loaded module directly: $moduleNameToLoad" -Level "SUCCESS" -Context $CurrentContext
        }
        return $true
    } catch {
        # This catch block will now handle errors from Import-Module if they occur
        $errorMessage = "Failed to load module '$moduleNameToLoad' from '$ModulePathToImport'. Error: $($_.Exception.Message)"
        Write-Host "[DEBUG IMM ERROR] Full Error Record for '$moduleNameToLoad': $($_.Exception | Format-List * -Force | Out-String)" -ForegroundColor Red
        if ($_.InvocationInfo) { $errorMessage += " At $($_.InvocationInfo.ScriptName):$($_.InvocationInfo.ScriptLineNumber)" }
        
        $CurrentContext.ErrorCollector.AddError("ModuleLoader", $errorMessage, $_.Exception)
        Write-MandALog $errorMessage -Level "ERROR" -Context $CurrentContext
        return $false
    } finally {
        # $ErrorActionPreference = $originalErrorAction # Not needed if we don't change it locally anymore
        Remove-Variable -Name "_MandALoadingContext" -Scope Global -ErrorAction SilentlyContinue
    }
}

#===============================================================================
#                    CORE ORCHESTRATION FUNCTIONS
#===============================================================================
function Initialize-MandAEnvironment {
    [CmdletBinding()] param( [Parameter(Mandatory=$true)][MandAContext]$Context, [Parameter(Mandatory=$true)][string]$CurrentMode, [Parameter(Mandatory=$false)][switch]$IsValidateOnlyMode )
    try {
        $loggingModulePath = Join-Path $Context.Paths.Utilities "EnhancedLogging.psm1"
        if (Test-Path $loggingModulePath) {
            # Try to import EnhancedLogging first. If it fails, subsequent Write-MandALog calls might not work as expected.
            try { Import-Module $loggingModulePath -Force -Global -EA Stop } catch { Write-Warning "Failed to import EnhancedLogging.psm1 initially: $($_.Exception.Message)"}
            
            if (Get-Command Initialize-Logging -EA SilentlyContinue) { Initialize-Logging -Configuration $Context.Config }
            else { Write-Warning "Initialize-Logging function not found after importing EnhancedLogging.psm1" }
        } else { Write-Warning "EnhancedLogging.psm1 not found at $loggingModulePath." }

        Write-MandALog "INITIALIZING ENVIRONMENT FOR MODE: $CurrentMode" -Level "HEADER" -Context $Context
        if ($null -eq $global:MandA) { $global:MandA = @{ Paths = $Context.Paths; Config = $Context.Config; CompanyName = $Context.Config.metadata.companyName; Version = $Context.Version } }
        
        $directories = @($Context.Paths.CompanyProfileRoot, $Context.Paths.RawDataOutput, $Context.Paths.ProcessedDataOutput, $Context.Paths.LogOutput, $Context.Paths.ExportOutput, $Context.Paths.TempPath)
        foreach ($dir in $directories) { if (-not (Test-Path $dir)) { New-Item -Path $dir -ItemType Directory -Force | Out-Null; Write-MandALog "Created directory: $dir" -Level "INFO" -Context $Context } }
        
        $utilityModules = @("FileOperations.psm1", "ValidationHelpers.psm1", "ConfigurationValidation.psm1", "ErrorHandling.psm1", "ProgressDisplay.psm1")
        foreach ($moduleFile in $utilityModules) { 
            $moduleFullPath = Join-Path $Context.Paths.Utilities $moduleFile 
            if (-not (Import-ModuleWithManifest -ModulePath $moduleFullPath -Context $Context)) {
                 if ($moduleFile -in @("ErrorHandling.psm1", "EnhancedLogging.psm1", "FileOperations.psm1")) { 
                    throw "Critical utility module '$moduleFile' failed to load." 
                 } 
            }
        }
        
        $authModules = @("Authentication\Authentication.psm1", "Authentication\CredentialManagement.psm1", "Connectivity\EnhancedConnectionManager.psm1")
        foreach ($moduleRelPath in $authModules) { $moduleFullPath = Join-Path $Context.Paths.Modules $moduleRelPath; Import-ModuleWithManifest -ModulePath $moduleFullPath -Context $Context }
        
        if (-not $IsValidateOnlyMode) {
            if(Get-Command Test-Prerequisites -EA SilentlyContinue){
                if (-not (Test-Prerequisites -Configuration $Context.Config -Context $Context)) { throw "System prerequisites validation failed." }
            } else { Write-MandALog "Test-Prerequisites function not found. Ensure ValidationHelpers.psm1 is loaded. Skipping." -Level "WARN" -Context $Context }
        }
        
        switch ($CurrentMode) {
            { $_ -in "Discovery", "Full", "AzureOnly" } { Import-DiscoveryModules -Context $Context }
            { $_ -in "Processing", "Full", "AzureOnly" } { Import-ProcessingModules -Context $Context }
            { $_ -in "Export", "Full", "AzureOnly" } { Import-ExportModules -Context $Context }
        }
        Write-MandALog "Environment initialization completed." -Level "SUCCESS" -Context $Context; return $true
    } catch {
        $errorMessageText = "Initialization failed: $($_.Exception.Message)" 
        if ($Context -and $Context.ErrorCollector) { $Context.ErrorCollector.AddError("Environment", $errorMessageText, $_.Exception) }
        if (Get-Command Write-MandALog -EA SilentlyContinue) { Write-MandALog $errorMessageText -Level "ERROR" -Context $Context } else { Write-Error $errorMessageText }
        throw
    }
}

function Import-DiscoveryModules {
    param([MandAContext]$Context)
    $baseDiscoveryPath = Join-Path $Context.Paths.Modules "Discovery" 
    $enabledSources = @($Context.Config.discovery.enabledSources)
    Write-MandALog "Loading discovery modules for $($enabledSources.Count) sources from '$baseDiscoveryPath'" -Level "INFO" -Context $Context
    $loadedCount = 0; $failedCount = 0
    foreach ($sourceName in $enabledSources) { 
        try {
            Test-ModuleConfiguration -Configuration $Context.Config -ModuleName $sourceName
            $moduleFileName = "${sourceName}Discovery.psm1" 
            $moduleFullPath = Join-Path $baseDiscoveryPath $moduleFileName 
            if (Test-Path $moduleFullPath) {
                if (Import-ModuleWithManifest -ModulePath $moduleFullPath -Context $Context) { $loadedCount++ } else { $failedCount++ }
            } else {
                $failedCount++; $Context.ErrorCollector.AddWarning($sourceName, "Discovery module not found: $moduleFileName")
                Write-MandALog "WARNING: Discovery module '$moduleFileName' not found at '$moduleFullPath'" -Level "WARN" -Context $Context
            }
        } catch {
            $failedCount++; $Context.ErrorCollector.AddError($sourceName, "Failed to load discovery module '$($sourceName)Discovery.psm1': $($_.Exception.Message)", $_.Exception)
        }
    }
    Write-MandALog "Discovery module loading complete: $loadedCount loaded, $failedCount failed" -Level "INFO" -Context $Context
}

function Import-ProcessingModules {
    param([MandAContext]$Context)
    if ($null -eq $Context -or $null -eq $Context.Paths -or [string]::IsNullOrWhiteSpace($Context.Paths.Modules)) {
        Write-Host "[DEBUG IPMod CRITICAL] Context.Paths.Modules is NULL or empty at start of Import-ProcessingModules." -ForegroundColor Red
        $baseProcessingPath = ".\" 
        if ($PSScriptRoot) { $baseProcessingPath = Join-Path (Split-Path $PSScriptRoot -Parent) "Modules\Processing" }
        else { $baseProcessingPath = Join-Path $Context.Paths.SuiteRoot "Modules\Processing" } 
        Write-Host "[DEBUG IPMod CRITICAL] Fallback baseProcessingPath: '$baseProcessingPath'" -ForegroundColor Red
        if ($null -eq $Context) { Write-Error "Import-ProcessingModules: MandAContext is null."; return }
         $Context.ErrorCollector.AddError("ModuleLoader", "Context.Paths.Modules is null or empty in Import-ProcessingModules.", $null)
    } else {
        $baseProcessingPath = Join-Path $Context.Paths.Modules "Processing"
    }
    Write-Host "[DEBUG IPMod] Base path for processing modules: '$baseProcessingPath'" -ForegroundColor DarkMagenta
    if (-not (Test-Path $baseProcessingPath)) { Write-MandALog "Processing modules directory not found: $baseProcessingPath" -Level "ERROR" -Context $Context; return }
    $processingModuleFiles = @("DataAggregation.psm1", "UserProfileBuilder.psm1", "WaveGeneration.psm1", "DataValidation.psm1") 
    Write-MandALog "Loading processing modules from: $baseProcessingPath" -Level "INFO" -Context $Context
    foreach ($moduleFileItem in $processingModuleFiles) { 
        Write-Host "[DEBUG IPMod] Iteration for module file: '$moduleFileItem'. Base path: '$baseProcessingPath'" -ForegroundColor DarkCyan
        if ([string]::IsNullOrWhiteSpace($moduleFileItem)) { Write-MandALog "Skipping empty module name in processing array." -Level "WARN" -Context $Context; continue }
        if ([string]::IsNullOrWhiteSpace($baseProcessingPath)) {
            Write-MandALog "Base processing path is null for module '$moduleFileItem'. Cannot construct full path. Skipping." -Level "ERROR" -Context $Context
            $Context.ErrorCollector.AddError("ModuleLoader", "Base processing path is null for module '$moduleFileItem'.", $null); continue
        }
        $moduleFullPath = Join-Path $baseProcessingPath $moduleFileItem 
        Write-Host "[DEBUG IPMod] Constructed full path for '$moduleFileItem': '$moduleFullPath'" -ForegroundColor DarkCyan
        if ([string]::IsNullOrWhiteSpace($moduleFullPath)) { 
            Write-MandALog "Module full path is null for '$moduleFileItem' (base: '$baseProcessingPath'). Skipping." -Level "ERROR" -Context $Context
            $Context.ErrorCollector.AddError("ModuleLoader", "Constructed path for $moduleFileItem is null or empty.", $null); continue 
        }
        Import-ModuleWithManifest -ModulePath $moduleFullPath -Context $Context
    }
}

function Import-ExportModules {
    param([MandAContext]$Context)
    if ($null -eq $Context -or $null -eq $Context.Paths -or [string]::IsNullOrWhiteSpace($Context.Paths.Modules)) {
        Write-Host "[DEBUG IEMod CRITICAL] Context.Paths.Modules is NULL or empty at start of Import-ExportModules." -ForegroundColor Red
        $baseExportPath = ".\" 
        if ($PSScriptRoot) { $baseExportPath = Join-Path (Split-Path $PSScriptRoot -Parent) "Modules\Export" }
        else { $baseExportPath = Join-Path $Context.Paths.SuiteRoot "Modules\Export" }
        Write-Host "[DEBUG IEMod CRITICAL] Fallback baseExportPath: '$baseExportPath'" -ForegroundColor Red
        if ($null -eq $Context) { Write-Error "Import-ExportModules: MandAContext is null."; return }
        $Context.ErrorCollector.AddError("ModuleLoader", "Context.Paths.Modules is null or empty in Import-ExportModules.", $null)
    } else {
        $baseExportPath = Join-Path $Context.Paths.Modules "Export"
    }
    Write-Host "[DEBUG IEMod] Base path for export modules: '$baseExportPath'" -ForegroundColor DarkMagenta
    if (-not (Test-Path $baseExportPath)) { Write-MandALog "Export modules directory not found: $baseExportPath" -Level "ERROR" -Context $Context; return }
    $enabledFormats = @($Context.Config.export.formats)
    Write-MandALog "Loading export modules for formats: $($enabledFormats -join ', ')" -Level "INFO" -Context $Context
    $formatMapping = @{ "CSV"="CSVExport.psm1"; "JSON"="JSONExport.psm1"; "Excel"="ExcelExport.psm1"; "CompanyControlSheet"="CompanyControlSheetExporter.psm1"; "PowerApps"="PowerAppsExporter.psm1" }
    foreach ($formatItem in $enabledFormats) {
        Write-Host "[DEBUG IEMod] Iteration for format: '$formatItem'. Base path: '$baseExportPath'" -ForegroundColor DarkCyan
        if ($formatMapping.ContainsKey($formatItem)) {
            $moduleFileItem = $formatMapping[$formatItem]
            if ([string]::IsNullOrWhiteSpace($moduleFileItem)) { Write-MandALog "Module filename empty for format: $formatItem." -Level "WARN" -Context $Context; continue }
            if ([string]::IsNullOrWhiteSpace($baseExportPath)) {
                 Write-MandALog "Base export path is null for format '$formatItem'. Cannot construct full path. Skipping." -Level "ERROR" -Context $Context
                 $Context.ErrorCollector.AddError("ModuleLoader", "Base export path is null for format '$formatItem'.", $null); continue
            }
            $moduleFullPath = Join-Path $baseExportPath $moduleFileItem
            Write-Host "[DEBUG IEMod] Constructed full path for '$moduleFileItem': '$moduleFullPath'" -ForegroundColor DarkCyan
            if ([string]::IsNullOrWhiteSpace($moduleFullPath)) {
                Write-MandALog "Module full path null for '$moduleFileItem' (format '$formatItem', base: '$baseExportPath')." -Level "ERROR" -Context $Context
                $Context.ErrorCollector.AddError("ModuleLoader", "Constructed path for $moduleFileItem (format $formatItem) is null.", $null); continue
            }
            Import-ModuleWithManifest -ModulePath $moduleFullPath -Context $Context
        } else { $Context.ErrorCollector.AddWarning("Export", "Unknown export format: $formatItem") }
    }
}

function Invoke-DiscoveryPhase {
    [CmdletBinding()] param([MandAContext]$Context)
    if (-not $Context.OrchestratorState.CanExecute("Discovery")) { throw "Discovery phase execution limit: $($Context.OrchestratorState.GetExecutionPath())" }
    $Context.OrchestratorState.PushExecution("Discovery")
    try {
        Write-MandALog "STARTING DISCOVERY PHASE" -Level "HEADER" -Context $Context
        if (Get-Command Test-DiscoveryPrerequisites -ErrorAction SilentlyContinue) {
            if (-not (Test-DiscoveryPrerequisites -Context $Context)) {
                throw "Discovery prerequisites not met. Review logs for details."
            }
            Write-MandALog "Discovery prerequisites validated successfully." -Level "INFO" -Context $Context
        } else {
            Write-MandALog "Test-DiscoveryPrerequisites function not found. Ensure ValidationHelpers.psm1 is loaded and exports it. Skipping this validation." -Level "WARN" -Context $Context
        }
        $enabledSources = @($Context.Config.discovery.enabledSources)
        if ($enabledSources.Count -eq 0) { Write-MandALog "No discovery sources enabled." -Level "WARN" -Context $Context; return @{} }
        $discoveryResults = Invoke-ParallelDiscoveryWithProgress -EnabledSources $enabledSources -Context $Context
        Write-MandALog "Discovery Phase Completed. Results for $($discoveryResults.Keys.Count) sources." -Level "SUCCESS" -Context $Context
        return $discoveryResults
    } catch { $Context.ErrorCollector.AddError("Discovery", "Phase failed: $($_.Exception.Message)", $_.Exception); throw }
    finally { $Context.OrchestratorState.PopExecution() }
}

function Invoke-ParallelDiscoveryWithProgress {
    param( [string[]]$EnabledSources, [MandAContext]$Context )
    $throttleLimit = $Context.Config.discovery.maxConcurrentJobs | Get-OrElse 5
    Write-MandALog "Starting parallel discovery for $($EnabledSources.Count) sources (Throttle: $throttleLimit)" -Level "INFO" -Context $Context
    $runspacePool = [runspacefactory]::CreateRunspacePool(1, $throttleLimit); $runspacePool.Open()
    $runspaces = [System.Collections.Generic.List[object]]::new(); $allResults = @{}
    $scriptBlockToRun = { 
        param( $DiscoverySource, $PassedConfig, $PassedPaths, $PassedCompanyName, $PassedVersion, $PassedModulesPath, $PassedGlobalMandA )
        try {
            $ErrorActionPreference = "Stop"; $global:MandA = $PassedGlobalMandA
            $utilityPath = Join-Path $PassedModulesPath "Utilities"; $loggingModulePath = Join-Path $utilityPath "EnhancedLogging.psm1"
            if (Test-Path $loggingModulePath) { Import-Module $loggingModulePath -Force -Global }
            $runspaceLocalContext = [PSCustomObject]@{ Paths = $PassedPaths; Config = $PassedConfig; CompanyName = $PassedCompanyName; Version = $PassedVersion } 
            $moduleFileName = "${DiscoverySource}Discovery.psm1"; $moduleFullPath = Join-Path $PassedModulesPath "Discovery\$moduleFileName" 
            if (-not (Test-Path $moduleFullPath)) { throw "Module not found: $moduleFullPath" }
            Import-Module $moduleFullPath -Force -Global
            $invokeFunctionName = "Invoke-${DiscoverySource}Discovery" 
            if (-not (Get-Command $invokeFunctionName -EA SilentlyContinue)) { throw "Function $invokeFunctionName not found in module $DiscoverySource" }
            $logFunction = if (Get-Command Write-MandALog -EA SilentlyContinue) { ${function:Write-MandALog} } else { ${function:Write-Host} } 
            $logFunction.Invoke("[$DiscoverySource] Starting task in runspace..." , "INFO", $runspaceLocalContext)
            $discoveryDataResult = & $invokeFunctionName -Configuration $PassedConfig -Context $runspaceLocalContext 
            $logFunction.Invoke("[$DiscoverySource] Task completed in runspace." , "SUCCESS", $runspaceLocalContext)
            return [PSCustomObject]@{ Source = $DiscoverySource; Success = $true; Data = $discoveryDataResult; Error = $null }
        } catch {
            $errorMessageText = "Error in $DiscoverySource discovery runspace: $($_.Exception.Message)" 
            if (Get-Command Write-MandALog -EA SilentlyContinue) { Write-MandALog $errorMessageText -Level "ERROR" } else { Write-Warning $errorMessageText }
            return [PSCustomObject]@{ Source = $DiscoverySource; Success = $false; Data = $null; Error = $_.Exception.Message; StackTrace = $_.ScriptStackTrace; FullException = $_ }
        }
    }
    foreach ($sourceNameItem in $EnabledSources) { 
        $powershellInstance = [powershell]::Create().AddScript($scriptBlockToRun) 
        [void]$powershellInstance.AddArgument($sourceNameItem)
        [void]$powershellInstance.AddArgument($Context.Config); [void]$powershellInstance.AddArgument($Context.Paths)
        [void]$powershellInstance.AddArgument($Context.Config.metadata.companyName); [void]$powershellInstance.AddArgument($Context.Version)
        [void]$powershellInstance.AddArgument($Context.Paths.Modules); [void]$powershellInstance.AddArgument($global:MandA)
        $powershellInstance.RunspacePool = $runspacePool
        $runspaces.Add([PSCustomObject]@{ Instance = $powershellInstance; Handle = $powershellInstance.BeginInvoke(); Source = $sourceNameItem; StartTime = Get-Date })
    }
    $totalTasks = $runspaces.Count; $completedTasksCount = 0 
    while ($runspaces.Count -gt 0) {
        $doneTasks = $runspaces | Where-Object { $_.Handle.IsCompleted } 
        foreach ($taskItem in $doneTasks) { 
            $completedTasksCount++
            try {
                $jobOutputResult = $taskItem.Instance.EndInvoke($taskItem.Handle) 
                if ($jobOutputResult.Success) {
                    $allResults[$jobOutputResult.Source] = $jobOutputResult.Data
                    Write-MandALog "Discovery completed for $($jobOutputResult.Source)" -Level "SUCCESS" -Context $Context
                } else {
                    $Context.ErrorCollector.AddError($jobOutputResult.Source, $jobOutputResult.Error, $jobOutputResult.FullException)
                }
            } catch { $Context.ErrorCollector.AddError($taskItem.Source, "Runspace result error: $($_.Exception.Message)", $_.Exception) }
            finally { $taskItem.Instance.Dispose(); $runspaces.Remove($taskItem) }
            if (Get-Command Write-DiscoveryProgress -EA SilentlyContinue) { Write-DiscoveryProgress -Total $totalTasks -Completed $completedTasksCount -CurrentSource $taskItem.Source }
            else { Write-Host "Progress: $completedTasksCount / $totalTasks." -NoNewline; Start-Sleep -ms 10; Write-Host "`r" -NoNewline }
        }
        if ($runspaces.Count -gt 0) { Start-Sleep -Milliseconds 200 }
    }
    if (Get-Command Write-DiscoveryProgress -EA SilentlyContinue) { Write-DiscoveryProgress -Total $totalTasks -Completed $completedTasksCount -CompletedAll $true }
    $runspacePool.Close(); $runspacePool.Dispose()
    Write-MandALog "Parallel discovery finished. Successful: $($allResults.Keys.Count), Failed: $($totalTasks - $allResults.Keys.Count)" -Level "INFO" -Context $Context
    return $allResults
}

function Invoke-ProcessingPhase {
    [CmdletBinding()] param([MandAContext]$Context) 
    if (-not $Context.OrchestratorState.CanExecute("Processing")) { throw "Processing phase limit: $($Context.OrchestratorState.GetExecutionPath())" }
    $Context.OrchestratorState.PushExecution("Processing")
    try {
        Write-MandALog "STARTING PROCESSING PHASE" -Level "HEADER" -Context $Context
        $rawDataPath = $Context.Paths.RawDataOutput
        if (-not (Test-Path $rawDataPath)) { throw "Raw data dir not found ($rawDataPath)." }
        if ((Get-ChildItem -Path $rawDataPath -Filter "*.csv" -File).Count -eq 0) { throw "No raw data files in $rawDataPath." }
        $dataAggModuleInfo = Get-Module -Name "DataAggregation" -EA SilentlyContinue 
        if (-not $dataAggModuleInfo) {
            $dataAggModulePath = Join-Path $Context.Paths.Modules "Processing\DataAggregation.psm1" 
            if (Test-Path $dataAggModulePath) { Import-ModuleWithManifest -ModulePath $dataAggModulePath -Context $Context }
            else { throw "DataAggregation module file not found at $dataAggModulePath" }
        }
        if (Get-Command "Start-DataAggregation" -EA SilentlyContinue) {
            if (-not (Start-DataAggregation -Configuration $Context.Config -Context $Context)) { throw "Data aggregation failed" } # Ensure $Context is passed if module expects it
            Write-MandALog "Processing Phase Completed Successfully" -Level "SUCCESS" -Context $Context; return $true
        } else { throw "Start-DataAggregation function not found." }
    } catch { $Context.ErrorCollector.AddError("Processing", "Phase failed: $($_.Exception.Message)", $_.Exception); throw }
    finally { $Context.OrchestratorState.PopExecution() }
}

function Invoke-ExportPhase {
    [CmdletBinding()] param([MandAContext]$Context)
    if (-not $Context.OrchestratorState.CanExecute("Export")) { throw "Export phase limit: $($Context.OrchestratorState.GetExecutionPath())" }
    $Context.OrchestratorState.PushExecution("Export")
    try {
        Write-MandALog "STARTING EXPORT PHASE" -Level "HEADER" -Context $Context
        $processedDataPath = $Context.Paths.ProcessedDataOutput
        if (-not (Test-Path $processedDataPath)) { throw "Processed data dir not found ($processedDataPath)." }
        $dataToExport = @{}; $processedFiles = Get-ChildItem -Path $processedDataPath -Filter "*.csv" -File
        if ($processedFiles.Count -eq 0) { throw "No processed data files in $processedDataPath." }
        foreach ($fileItem in $processedFiles) { 
            $dataKeyName = $fileItem.BaseName 
            try { $dataToExport[$dataKeyName] = Import-Csv -Path $fileItem.FullName; Write-MandALog "Loaded $($dataToExport[$dataKeyName].Count) from $($fileItem.Name)" -Level "INFO" -Context $Context }
            catch { $Context.ErrorCollector.AddError("Export", "Load failed: $($fileItem.Name)", $_.Exception) }
        }
        $enabledFormats = @($Context.Config.export.formats); $exportOverallSuccess = $true 
        foreach ($formatName in $enabledFormats) { 
            $invokeFunctionName = Get-ExportFunctionName -Format $formatName 
            if (Get-Command $invokeFunctionName -EA SilentlyContinue) {
                try {
                    & $invokeFunctionName -ProcessedData $dataToExport -Configuration $Context.Config -Context $Context # Pass Context
                    Write-MandALog "Export for '$formatName' completed." -Level "SUCCESS" -Context $Context
                } catch { $Context.ErrorCollector.AddError("Export_$formatName", "Export for $formatName failed: $($_.Exception.Message)", $_.Exception); $exportOverallSuccess = $false }
            } else { $Context.ErrorCollector.AddWarning("Export", "Function not found for format '$formatName': $invokeFunctionName") }
        }
        $exportPhaseStatusText = if ($exportOverallSuccess) { 'Successfully' } else { 'with Errors' }
        $exportPhaseStatusLevel = if ($exportOverallSuccess) { "SUCCESS" } else { "WARN" }
        Write-MandALog "Export Phase Completed $exportPhaseStatusText" -Level $exportPhaseStatusLevel -Context $Context
        return $exportOverallSuccess
    } 
    catch { $Context.ErrorCollector.AddError("Export", "Phase failed: $($_.Exception.Message)", $_.Exception); throw }
    finally { $Context.OrchestratorState.PopExecution() }
}

function Get-ExportFunctionName {
    param([string]$Format)
    $mapping = @{ "PowerApps"="Export-ForPowerApps"; "CompanyControlSheet"="Export-ToCompanyControlSheet"; "CSV"="Export-ToCSV"; "JSON"="Export-ToJSON"; "Excel"="Export-ToExcel" }
    if ($mapping.ContainsKey($Format)) { return $mapping[$Format] }
    return "Export-To$Format"
}

function Complete-MandADiscovery {
    [CmdletBinding()] param([MandAContext]$Context)
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
}

#===============================================================================
#                        MAIN EXECUTION BLOCK
#===============================================================================

try {
    if ($null -eq $global:MandA -or ([string]::IsNullOrWhiteSpace($CompanyName) -and ([string]::IsNullOrWhiteSpace($global:MandA.CompanyName))) -or (-not [string]::IsNullOrWhiteSpace($CompanyName) -and $global:MandA.CompanyName -ne $CompanyName) ) {
        Write-Host "Orchestrator: Global environment context ($($global:MandA.CompanyName)) is not set or differs from target ($CompanyName). Attempting to initialize/re-initialize via Set-SuiteEnvironment.ps1..." -ForegroundColor Yellow
        $envScriptPath = Join-Path (Split-Path $PSScriptRoot -Parent) "Scripts\Set-SuiteEnvironment.ps1"
        if (-not (Test-Path $envScriptPath)) { throw "Set-SuiteEnvironment.ps1 not found at '$envScriptPath'. Cannot proceed." }
        $companyNameToUse = if (-not [string]::IsNullOrWhiteSpace($CompanyName)) { $CompanyName } elseif ($null -ne $global:MandA -and -not [string]::IsNullOrWhiteSpace($global:MandA.CompanyName)) { $global:MandA.CompanyName } else { Get-CompanySelection }
        . $envScriptPath -CompanyName $companyNameToUse -ProvidedSuiteRoot (Split-Path $PSScriptRoot -Parent)
        if ($null -eq $global:MandA) { throw "Failed to initialize global environment via Set-SuiteEnvironment.ps1 for company '$companyNameToUse'." }
        Write-Host "Orchestrator: Global environment context established for company '$($global:MandA.CompanyName)'." -ForegroundColor Green
    }
    if ([string]::IsNullOrWhiteSpace($CompanyName)) { $CompanyName = $global:MandA.CompanyName }
    $SanitizedCompanyName = $CompanyName -replace '[<>:"/\\|?*]', '_'

    $loadedConfiguration = $null 
    if ($null -ne $global:MandA -and $null -ne $global:MandA.Config) {
        $loadedConfiguration = $global:MandA.Config
    } else {
        $effectiveConfigPath = $ConfigurationFile 
        if ([string]::IsNullOrWhiteSpace($effectiveConfigPath)) { $effectiveConfigPath = Join-Path ($global:MandA.Paths.SuiteRoot | Get-OrElse (Split-Path $PSScriptRoot -Parent)) "Configuration\default-config.json" }
        elseif (-not ([System.IO.Path]::IsPathRooted($effectiveConfigPath))) { $effectiveConfigPath = Join-Path ($global:MandA.Paths.SuiteRoot | Get-OrElse (Split-Path $PSScriptRoot -Parent)) $effectiveConfigPath }
        if (-not (Test-Path $effectiveConfigPath)) { throw "Configuration file not found: $effectiveConfigPath" }
        $configJsonContent = Get-Content -Path $effectiveConfigPath -Raw | ConvertFrom-Json -ErrorAction Stop 
        $loadedConfiguration = ConvertTo-HashtableRecursive -InputObject $configJsonContent
    }
    if ($null -eq $loadedConfiguration) { throw "Configuration could not be loaded or is null." }
    $loadedConfiguration.metadata.companyName = $SanitizedCompanyName

    if ($Force.IsPresent) { $loadedConfiguration.discovery.skipExistingFiles = $false }
    $effectiveMode = $Mode 
    if ($effectiveMode -eq "AzureOnly") {
        Write-Host "`nAzure-Only mode selected. Limiting discovery to cloud sources." -ForegroundColor Cyan
        $currentConfigSources = @($loadedConfiguration.discovery.enabledSources) 
        $loadedConfiguration.discovery.enabledSources = $currentConfigSources | Where-Object { $_ -in $script:AzureOnlySources }
        Write-Host "Enabled sources for Azure-Only: $($loadedConfiguration.discovery.enabledSources -join ', ')" -ForegroundColor Yellow
        $effectiveMode = "Full" 
    }
    
    $script:Context = [MandAContext]::new($loadedConfiguration, $SanitizedCompanyName)
    Write-Host "[DEBUG ORCH] Context created. Config present: $($null -ne $script:Context.Config). Paths.Modules: '$($script:Context.Paths.Modules)'" -ForegroundColor Magenta
    
    Initialize-MandAEnvironment -Context $script:Context -CurrentMode $effectiveMode -IsValidateOnlyMode:$ValidateOnly
    Write-Host "[DEBUG ORCH] Environment Initialized. Config present: $($null -ne $script:Context.Config). Paths.Modules: '$($script:Context.Paths.Modules)'" -ForegroundColor Magenta
    
    if ($ValidateOnly.IsPresent) { Write-MandALog "Validation completed successfully" -Level "SUCCESS" -Context $script:Context; exit 0 }
    
    if ($effectiveMode -in "Discovery", "Full") { 
        Write-MandALog "AUTHENTICATION & CONNECTION SETUP" -Level "HEADER" -Context $script:Context
        Write-Host "[DEBUG ORCH] Attempting Authentication. Context.Config is null: $($null -eq $script:Context.Config)" -ForegroundColor Cyan
        if (Get-Command "Initialize-MandAAuthentication" -EA SilentlyContinue) {
            try {
                Write-MandALog "Calling Initialize-MandAAuthentication..." -Level "DEBUG" -Context $script:Context
                $authResult = Initialize-MandAAuthentication -Configuration $script:Context.Config -Context $script:Context # Pass Context here as well
                Write-MandALog "Initialize-MandAAuthentication returned. Result is null: $($null -eq $authResult). Authenticated: $($authResult.Authenticated)" -Level "DEBUG" -Context $script:Context

                if ($authResult -and $authResult.Authenticated) {
                    Write-MandALog "Authentication successful" -Level "SUCCESS" -Context $script:Context
                    if (Get-Command "Initialize-AllConnections" -EA SilentlyContinue) {
                        $connectionStatus = Initialize-AllConnections -Configuration $script:Context.Config -AuthContext $authResult.Context -Context $script:Context # Pass Context
                        foreach ($serviceItem in $connectionStatus.Keys) { 
                            $statusValue = $connectionStatus[$serviceItem]; $isConnectedStatus = if ($statusValue -is [bool]) { $statusValue } else { $statusValue.Connected } 
                            Write-MandALog ("Connected to $serviceItem $isConnectedStatus") -Level (if($isConnectedStatus){"SUCCESS"}else{"WARN"}) -Context $script:Context
                        }
                    }
                } else {
                    $errorMessageText = if ($authResult -and $authResult.Error) { $authResult.Error } else { "Authentication failed - no details" }
                    $script:Context.ErrorCollector.AddError("Authentication", $errorMessageText, $null)
                    Write-MandALog "Authentication failed: $errorMessageText" -Level "ERROR" -Context $script:Context
                    if (($script:Context.Config.environment.connectivity.haltOnConnectionError | Get-OrElse @()) -contains "Authentication") {
                        throw "Critical Authentication failed: $errorMessageText"
                    }
                }
            } catch {
                $errorMessageText = $_.Exception.Message
                $script:Context.ErrorCollector.AddError("Authentication", "Init failed: $errorMessageText", $_.Exception)
                Write-MandALog "Authentication Init failed: $errorMessageText. Stack: $($_.ScriptStackTrace)" -Level "ERROR" -Context $script:Context
                if (($script:Context.Config.environment.connectivity.haltOnConnectionError | Get-OrElse @()) -contains "Authentication") {
                    throw "Critical Authentication Init failed: $errorMessageText"
                }
            }
        } else { Write-MandALog "Initialize-MandAAuthentication function not found." -Level "ERROR" -Context $script:Context; throw "Initialize-MandAAuthentication function not found." }
    }
    
    Write-Host "[DEBUG ORCH] Before Switch. Mode: $effectiveMode. Context Null: $($null -eq $script:Context). Context.OrchestratorState Null: $($null -eq $script:Context.OrchestratorState)" -ForegroundColor Yellow
    switch ($effectiveMode) {
        "Discovery"  { Invoke-DiscoveryPhase  -Context $script:Context }
        "Processing" { Invoke-ProcessingPhase -Context $script:Context }
        "Export"     { Invoke-ExportPhase     -Context $script:Context }
        "Full"       { 
            Invoke-DiscoveryPhase  -Context $script:Context
            Write-Host "[DEBUG ORCH] After DiscoveryPhase. Context Null: $($null -eq $script:Context)" -ForegroundColor Yellow
            Invoke-ProcessingPhase -Context $script:Context
            Write-Host "[DEBUG ORCH] After ProcessingPhase. Context Null: $($null -eq $script:Context)" -ForegroundColor Yellow
            Invoke-ExportPhase     -Context $script:Context 
        }
    }
    Complete-MandADiscovery -Context $script:Context
    if ($script:Context.ErrorCollector.HasCriticalErrors()) { exit 2 } elseif ($script:Context.ErrorCollector.HasErrors()) { exit 1 } else { exit 0 }
}
catch {
    Write-Host "ORCHESTRATOR CRITICAL ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack Trace: $($_.ScriptStackTrace)" -ForegroundColor Yellow
    if ($script:Context -and $script:Context.ErrorCollector) {
        $script:Context.ErrorCollector.AddError("OrchestratorCore", "Fatal error: $($_.Exception.Message)", $_.Exception)
        if(Get-Command Complete-MandADiscovery -EA SilentlyContinue) { Complete-MandADiscovery -Context $script:Context }
    }
    exit 3
}
finally {
    if ($script:Context -and (Get-Command "Disconnect-AllServices" -EA SilentlyContinue)) {
        try { Disconnect-AllServices } catch { Write-Warning "Error during service disconnection: $($_.Exception.Message)" }
    }
}
