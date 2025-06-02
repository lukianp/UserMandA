#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Main Orchestrator (Blended & Enhanced Version)

.DESCRIPTION
    Unified orchestrator for discovery, processing, and export.
    This version incorporates robust company-specific path handling from user's v4.3.1,
    dynamic loading of all necessary modules (Discovery, Processing, Export),
    and functional calls to the respective phase modules.

.NOTES
    Version: 4.4.1
    Author: Gemini (Blended with User v4.3.1)
    Date: 2025-06-02
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$CompanyName,

    [Parameter(Mandatory=$false)]
    [string]$ConfigurationFile, # Allow overriding the default config
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("Discovery", "Processing", "Export", "Full")]
    [string]$Mode = "Full",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force,
    
    [Parameter(Mandatory=$false)]
    [switch]$ValidateOnly
)

#===============================================================================
#                       INITIALIZATION SECTION
#===============================================================================

$OriginalErrorActionPreferenceOrchestrator = $ErrorActionPreference
$ErrorActionPreference = "Stop"

if (-not $global:MandA.PSObject.Properties['OrchestratorRunCount']) {
    $global:MandA | Add-Member -MemberType NoteProperty -Name 'OrchestratorRunCount' -Value 0 -Force
}
$global:MandA.OrchestratorRunCount++

if ($global:MandA.OrchestratorRunCount -gt 3) {
    Write-Error "CRITICAL: Orchestrator has been called $($global:MandA.OrchestratorRunCount) times. Possible infinite loop detected. Exiting."
    $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
    exit 1
}

if ($null -eq $global:MandA -or $null -eq $global:MandA.Paths) {
    Write-Error "CRITICAL: The global context `$global:MandA (with Paths) is not set. Ensure Set-SuiteEnvironment.ps1 sourced correctly for Company '$CompanyName'."
    $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
    exit 1
}

#===============================================================================
#                   CORE UTILITY MODULES IMPORT
#===============================================================================
Write-Host "--- Orchestrator: Importing Core Utility Modules ---" -ForegroundColor DarkCyan
$utilityModulesToImport = @(
    "EnhancedLogging.psm1", "FileOperations.psm1", "ValidationHelpers.psm1",
    "ConfigurationValidation.psm1", "ErrorHandling.psm1" 
)
foreach ($moduleName_util in $utilityModulesToImport) {
    $modulePath_util = Join-Path $global:MandA.Paths.Utilities $moduleName_util
    if (Test-Path $modulePath_util -PathType Leaf) {
        try { Import-Module $modulePath_util -Force -Global -ErrorAction Stop; Write-Host "Successfully imported $moduleName_util" -ForegroundColor DarkGreen } 
        catch { Write-Error "CRITICAL: Failed to import utility module '$moduleName_util': $($_.Exception.Message)."; exit 1 }
    } else { Write-Error "CRITICAL: Utility module '$moduleName_util' not found at '$modulePath_util'."; exit 1 }
}

"Write-MandALog", "Initialize-OutputDirectories", "Test-Prerequisites" | ForEach-Object {
    if (-not (Get-Command $_ -ErrorAction SilentlyContinue)) { Write-Error "CRITICAL: Required function '$_' not found."; exit 1 }
}

#===============================================================================
#                    AUTHENTICATION & CONNECTIVITY MODULES IMPORT
#===============================================================================
Write-Host "--- Orchestrator: Importing Auth & Connectivity Modules ---" -ForegroundColor DarkCyan
$coreInfraModules = @(
    "Authentication/Authentication.psm1", "Authentication/CredentialManagement.psm1",
    "Connectivity/EnhancedConnectionManager.psm1"
)
foreach ($moduleRelPath_item in $coreInfraModules) {
    $modulePath_item = Join-Path $global:MandA.Paths.Modules $moduleRelPath_item
    if (Test-Path $modulePath_item -PathType Leaf) {
        try { Import-Module $modulePath_item -Force -Global -ErrorAction Stop; Write-Host "Successfully imported $(Split-Path $modulePath_item -Leaf)" -ForegroundColor DarkGreen }
        catch { Write-Error "CRITICAL: Failed to import core infra module '$moduleRelPath_item': $($_.Exception.Message)."; exit 1 }
    } else { Write-Error "CRITICAL: Core infra module '$moduleRelPath_item' not found at '$modulePath_item'."; exit 1 }
}

"Initialize-MandAAuthentication", "Get-SecureCredentials", "Initialize-AllConnections" | ForEach-Object {
    if (-not (Get-Command $_ -ErrorAction SilentlyContinue)) { Write-Error "CRITICAL: Required function '$_' not found."; exit 1 }
}
Write-Host "--- Orchestrator: All Core & Infra Modules Imported Successfully ---" -ForegroundColor DarkCyan

#===============================================================================
#                    CORE ORCHESTRATION FUNCTIONS
#===============================================================================

function Initialize-MandAEnvironmentInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)] [hashtable]$Configuration,
        [Parameter(Mandatory=$true)] [string]$CurrentMode,
        [Parameter(Mandatory=$false)] [switch]$IsValidateOnlyMode
    )
    try {
        Write-MandALog "INITIALIZING ENVIRONMENT FOR MODE: $CurrentMode (Company: $($Configuration.metadata.companyName))" -Level "HEADER"
        
        # Ensure company-specific output path is set in the working configuration object
        # (Incorporated from user's v4.3.1 for robustness)
        if ($global:MandA.Paths.CompanyProfileRoot) {
            $Configuration.environment['outputPath'] = $global:MandA.Paths.CompanyProfileRoot
            Write-MandALog "Using company-specific output path: $($Configuration.environment.outputPath)" -Level "INFO"
        } else {
            # This check is critical. Set-SuiteEnvironment.ps1 should always set this.
            throw "CompanyProfileRoot not found in `$global:MandA.Paths. Ensure Set-SuiteEnvironment.ps1 ran successfully for Company '$($Configuration.metadata.companyName)'."
        }

        Initialize-Logging -Configuration $Configuration
        if (-not (Initialize-OutputDirectories -Configuration $Configuration)) { throw "Failed to initialize output directories." }

        if (-not $global:MandA.ModulesChecked) { # Property to track if check was done in this session
            Write-MandALog "Checking PowerShell module dependencies..." -Level INFO
            $moduleCheckScriptPath = $global:MandA.Paths.ModuleCheckScript
            if (Test-Path $moduleCheckScriptPath -PathType Leaf) {
                try { & $moduleCheckScriptPath -Silent -ErrorAction Stop; $global:MandA.ModulesChecked = $true }
                catch { Write-MandALog "ERROR: Module dependency check failed: $($_.Exception.Message)" -Level ERROR; $global:MandA.ModulesChecked = $true; Write-MandALog "WARN: Continuing despite module check failure." -Level WARN }
            } else { Write-MandALog "WARN: DiscoverySuiteModuleCheck.ps1 not found at '$moduleCheckScriptPath'" -Level WARN; $global:MandA.ModulesChecked = $true }
        } else { Write-MandALog "Module dependencies already checked in this session." -Level INFO }
        
        if (-not (Test-Prerequisites -Configuration $Configuration -ValidateOnly:$IsValidateOnlyMode)) { throw "System prerequisites validation failed." }

        if ($CurrentMode -in "Discovery", "Full") {
            $discoveryModulePathBase = Join-Path $global:MandA.Paths.Modules "Discovery"
            $enabledSources = @($Configuration.discovery.enabledSources)
            Write-MandALog "Loading discovery modules for $($enabledSources.Count) sources: $($enabledSources -join ', ')" -Level INFO
            $loadedCount = 0
            foreach ($sourceName in $enabledSources) {
                $moduleFileName = "$($sourceName)Discovery.psm1"
                $fullModulePath = Join-Path $discoveryModulePathBase $moduleFileName
                if (Test-Path $fullModulePath -PathType Leaf) {
                    try { Import-Module $fullModulePath -Force -Global -ErrorAction Stop; Write-MandALog "Loaded module: $moduleFileName" -Level SUCCESS; $loadedCount++ }
                    catch { Write-MandALog "ERROR: Failed to load discovery module '$moduleFileName': $($_.Exception.Message)" -Level ERROR }
                } else { Write-MandALog "WARN: Module file not found for source '$sourceName': $fullModulePath" -Level WARN }
            }
            Write-MandALog "Loaded $loadedCount discovery modules." -Level INFO
        }

        if ($CurrentMode -in "Processing", "Full", "Export") { 
            $processingModulePathBase = Join-Path $global:MandA.Paths.Modules "Processing"
            $processingModulesToLoad = @("DataAggregation.psm1") # Primary processing module
            # Potentially add UserProfileBuilder.psm1, WaveGeneration.psm1 if they are separate and directly called by orchestrator in future
            Write-MandALog "Loading processing modules..." -Level INFO
            foreach ($moduleFile in $processingModulesToLoad) {
                $fullModulePath = Join-Path $processingModulePathBase $moduleFile
                if (Test-Path $fullModulePath -PathType Leaf) {
                    try { Import-Module $fullModulePath -Force -Global -ErrorAction Stop; Write-MandALog "Loaded processing module: $moduleFile" -Level SUCCESS }
                    catch { Write-MandALog "ERROR: Failed to load processing module '$moduleFile': $($_.Exception.Message)" -Level ERROR }
                } else { Write-MandALog "WARN: Processing module not found: $fullModulePath" -Level WARN }
            }
        }

        if ($CurrentMode -in "Export", "Full") {
            $exportModulePathBase = Join-Path $global:MandA.Paths.Modules "Export"
            $enabledFormats = @($Configuration.export.formats)
            Write-MandALog "Loading export modules for $($enabledFormats.Count) formats: $($enabledFormats -join ', ')" -Level INFO
            $loadedCount = 0
            foreach ($formatName in $enabledFormats) {
                $moduleFileName = "$($formatName)Exporter.psm1" 
                if ($formatName -eq "CompanyControlSheet") {$moduleFileName = "CompanyControlSheetExporter.psm1"}
                if ($formatName -eq "PowerApps") {$moduleFileName = "PowerAppsExporter.psm1"}
                # Add other specific mappings if needed: elseif ($formatName -eq "CSV") {$moduleFileName = "CSVExporter.psm1"} etc.

                $fullModulePath = Join-Path $exportModulePathBase $moduleFileName
                if (Test-Path $fullModulePath -PathType Leaf) {
                    try { Import-Module $fullModulePath -Force -Global -ErrorAction Stop; Write-MandALog "Loaded export module: $moduleFileName" -Level SUCCESS; $loadedCount++ }
                    catch { Write-MandALog "ERROR: Failed to load export module '$moduleFileName': $($_.Exception.Message)" -Level ERROR }
                } else { Write-MandALog "WARN: Module file not found for export format '$formatName' (expected '$moduleFileName' at '$fullModulePath')" -Level WARN }
            }
            Write-MandALog "Loaded $loadedCount export modules." -Level INFO
        }

        Write-MandALog "Environment initialization completed." -Level SUCCESS
        return $true
    } catch { Write-MandALog "ERROR: Environment initialization failed: $($_.Exception.Message)" -Level ERROR; throw }
}

function Invoke-DiscoveryPhaseInternal {
    [CmdletBinding()] param([Parameter(Mandatory=$true)][hashtable]$Configuration)
    try {
        Write-MandALog "STARTING DISCOVERY PHASE" -Level "HEADER"
        $discoveryResults = @{}
        $enabledSources = @($Configuration.discovery.enabledSources)
        foreach ($sourceName in $enabledSources) {
            $invokeFunctionName = "Invoke-$($sourceName)Discovery"
            if (Get-Command $invokeFunctionName -ErrorAction SilentlyContinue) {
                Write-MandALog "Invoking $invokeFunctionName for '$sourceName'..." -Level INFO
                try { $discoveryResults[$sourceName] = (& $invokeFunctionName -Configuration $Configuration -ErrorAction Stop); Write-MandALog "Finished discovery for '$sourceName'." -Level SUCCESS }
                catch { Write-MandALog "ERROR: Discovery failed for '$sourceName': $($_.Exception.Message)" -Level ERROR; $discoveryResults[$sourceName] = @{ Error = $_.Exception.Message; Success=$false } }
            } else { Write-MandALog "WARN: Discovery function '$invokeFunctionName' not found for '$sourceName'." -Level WARN }
        }
        Write-MandALog "Discovery Phase Completed." -Level SUCCESS
        # Discovery modules write their own files to "Raw" path. This function can return a summary.
        return $discoveryResults 
    } catch { Write-MandALog "ERROR: Discovery phase failed: $($_.Exception.Message)" -Level ERROR; throw }
}

function Invoke-ProcessingPhaseInternal {
    [CmdletBinding()] param([Parameter(Mandatory=$true)][hashtable]$Configuration)
    try {
        Write-MandALog "STARTING PROCESSING PHASE" -Level "HEADER"
        # The DataAggregation.psm1 module reads from "Raw" and writes to "Processed"
        if (Get-Command "Start-DataAggregation" -ErrorAction SilentlyContinue) {
            Write-MandALog "Invoking Start-DataAggregation..." -Level INFO
            $processingSuccess = Start-DataAggregation -Configuration $Configuration
            if (-not $processingSuccess) {
                throw "Data Aggregation (Start-DataAggregation) reported failure."
            }
            Write-MandALog "Data Aggregation completed successfully." -Level SUCCESS
        } else {
            throw "'Start-DataAggregation' function not found. Ensure Processing modules are loaded."
        }
        # Add calls to UserProfileBuilder, WaveGeneration here if they are separate orchestrator-level steps
        Write-MandALog "Processing Phase Completed." -Level SUCCESS
        return $true 
    } catch { Write-MandALog "ERROR: Processing phase failed: $($_.Exception.Message)" -Level ERROR; throw }
}

function Invoke-ExportPhaseInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    try {
        Write-MandALog "STARTING EXPORT PHASE" -Level "HEADER"
        
        $processedDataPath = $global:MandA.Paths.ProcessedDataOutput
        Write-MandALog "Loading data for export from: $processedDataPath" -Level INFO
        
        # Load all processed .csv files into a hashtable to pass to export functions
        $dataToExport = @{}
        $processedFiles = Get-ChildItem -Path $processedDataPath -Filter "*.csv" -File -ErrorAction SilentlyContinue
        
        if ($null -eq $processedFiles -or $processedFiles.Count -eq 0) {
            throw "No processed CSV files found in '$processedDataPath'. Cannot proceed with export."
        }
        
        foreach ($file in $processedFiles) {
            $dataKey = $file.BaseName # e.g., "Users", "Devices", "MigrationWaves"
            try {
                $dataToExport[$dataKey] = Import-Csv -Path $file.FullName -ErrorAction Stop
                Write-MandALog "Loaded $($dataToExport[$dataKey].Count) records from $($file.Name) for export." -Level DEBUG
            } catch {
                Write-MandALog "ERROR: Failed to load processed file '$($file.FullName)' for export: $($_.Exception.Message)" -Level ERROR
                # Optionally continue or throw, depending on desired strictness
            }
        }

        if ($dataToExport.Count -eq 0) {
            throw "Failed to load any processed data for export."
        }

        $enabledFormats = @($Configuration.export.formats)
        Write-MandALog "Executing $($enabledFormats.Count) configured export formats: $($enabledFormats -join ', ')" -Level INFO
        
        foreach ($formatName in $enabledFormats) {
            $exportFunctionName = ""
            # Convention: Format "XYZ" calls "Start-XYZExport" or "Export-ForXYZ"
            # Specific overrides for known modules:
            if ($formatName -eq "PowerApps") { $exportFunctionName = "Export-ForPowerApps" }
            elseif ($formatName -eq "CompanyControlSheet") { $exportFunctionName = "Start-CompanyControlSheetExport" }
            elseif ($formatName -eq "CSV") { $exportFunctionName = "Start-CsvExport" } # Assuming a generic CSV exporter
            elseif ($formatName -eq "JSON") { $exportFunctionName = "Start-JsonExport" } # Assuming a generic JSON exporter
            else { $exportFunctionName = "Start-$($formatName)Export" } # Default convention

            if (Get-Command $exportFunctionName -ErrorAction SilentlyContinue) {
                Write-MandALog "Invoking $exportFunctionName ..." -Level INFO
                try {
                    # Pass the hashtable of all processed data tables
                    & $exportFunctionName -ProcessedData $dataToExport -Configuration $Configuration -ErrorAction Stop
                    Write-MandALog "Successfully executed export for format '$formatName'." -Level SUCCESS
                } catch {
                    Write-MandALog "ERROR: Export failed for format '$formatName' using '$exportFunctionName': $($_.Exception.Message)" -Level ERROR
                }
            } else {
                Write-MandALog "WARN: Export function '$exportFunctionName' not found for format '$formatName'. Skipping." -Level WARN
            }
        }
        
        Write-MandALog "Export Phase Completed." -Level SUCCESS
        return $true
    } catch { Write-MandALog "ERROR: Export phase failed: $($_.Exception.Message)" -Level ERROR; throw }
}

function Complete-MandADiscoveryInternal {
    [CmdletBinding()] param([Parameter(Mandatory=$true)][hashtable]$Configuration)
    Write-MandALog "FINALIZING M&A DISCOVERY SUITE EXECUTION (Orchestrator v4.4.1)" -Level "HEADER"
    Write-MandALog "Execution completed successfully." -Level SUCCESS
    Write-MandALog "  - Logs: $($global:MandA.Paths.LogOutput)" -Level INFO
    Write-MandALog "  - Output: $($Configuration.environment.outputPath)" -Level INFO # This will now be the company-specific path
}

#===============================================================================
#                        MAIN EXECUTION BLOCK
#===============================================================================
try {
    # Determine which configuration to use
    if ($PSBoundParameters.ContainsKey('ConfigurationFile') -and -not [string]::IsNullOrWhiteSpace($ConfigurationFile)) {
        $configPathToLoad = if ([System.IO.Path]::IsPathRooted($ConfigurationFile)) { $ConfigurationFile } else { Join-Path $global:MandA.Paths.SuiteRoot $ConfigurationFile }
        if (-not (Test-Path $configPathToLoad -PathType Leaf)) {
            throw "Specified configuration file '$configPathToLoad' not found."
        }
        Write-Host "Loading specified configuration file: $configPathToLoad" -ForegroundColor Yellow
        $script:CurrentConfig = Get-Content -Path $configPathToLoad -Raw | ConvertFrom-Json
        # Merge with global base config if necessary or treat as complete override
        # For simplicity here, it overrides. If merging is needed, $global:MandA.Config should be updated.
    } else {
        $script:CurrentConfig = $global:MandA.Config # This is pre-loaded by Set-SuiteEnvironment.ps1
    }
    
    if ($null -eq $script:CurrentConfig) {
        throw "Configuration has not been loaded. Ensure Set-SuiteEnvironment.ps1 has run or a valid ConfigurationFile is provided."
    }

    # Ensure the CompanyName from parameter matches or updates the one in config metadata
    if ($script:CurrentConfig.metadata.companyName -ne $CompanyName) {
        Write-MandALog "Updating configuration metadata with provided CompanyName: '$CompanyName' (was '$($script:CurrentConfig.metadata.companyName)')" -Level INFO -Configuration $script:CurrentConfig # Pass config for logging to be initialized
        $script:CurrentConfig.metadata.companyName = $CompanyName
    }
    
    if ($Force.IsPresent) { 
        $script:CurrentConfig.discovery.skipExistingFiles = $false 
        Write-MandALog "Force mode enabled: discovery.skipExistingFiles set to false." -Level INFO -Configuration $script:CurrentConfig
    }
    
    Write-MandALog "M&A DISCOVERY SUITE v$($script:CurrentConfig.metadata.version) | Orchestrator v4.4.1" -Level "HEADER" -Configuration $script:CurrentConfig
    Write-MandALog "Mode: $Mode | Company: $CompanyName | Config being used: (details in logs if overridden, else default)" -Level "INFO" -Configuration $script:CurrentConfig

    Initialize-MandAEnvironmentInternal -Configuration $script:CurrentConfig -CurrentMode $Mode -IsValidateOnlyMode:$ValidateOnly
    
    if ($ValidateOnly.IsPresent) {
        Write-MandALog "Validation Only Mode: Environment checks complete." -Level SUCCESS
        $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
        exit 0
    }
    
    Write-MandALog "AUTHENTICATION & CONNECTION SETUP" -Level "HEADER"
    $authContext = $null
    # Ensure credential paths in $script:CurrentConfig are correct before calling auth
    if ($global:MandA.Paths.CredentialFile) {
        $script:CurrentConfig.authentication.credentialStorePath = Split-Path $global:MandA.Paths.CredentialFile -Parent
        $script:CurrentConfig.authentication.credentialFileName = Split-Path $global:MandA.Paths.CredentialFile -Leaf
    } else {
        throw "Global credential file path (`$global:MandA.Paths.CredentialFile`) is not set. Critical for authentication."
    }

    $authResult = Initialize-MandAAuthentication -Configuration $script:CurrentConfig
    if ($null -eq $authResult -or ($authResult -is [hashtable] -and $authResult.Authenticated -ne $true)) {
        $authError = if($authResult -is [hashtable] -and $authResult.Error){$authResult.Error}else{"Unknown auth error"}
        throw "Authentication failed: $authError"
    }
    $authContext = if ($authResult.Context) { $authResult.Context } else { $authResult }
    Write-MandALog "Authentication successful. ClientID: $($authContext.ClientId), TenantID: $($authContext.TenantId)" -Level SUCCESS
    
    $connectionStatus = Initialize-AllConnections -Configuration $script:CurrentConfig -AuthContext $authContext
    if ($null -eq $connectionStatus -or $connectionStatus.Count -eq 0) { throw "Connection initialization returned no results." }

    $criticalFailure = $false
    ($script:CurrentConfig.environment.connectivity.haltOnConnectionError) | ForEach-Object {
        $serviceName = $_
        $isConnected = $false
        if ($connectionStatus.ContainsKey($serviceName)) {
            $serviceStat = $connectionStatus.$serviceName
            $isConnected = if ($serviceStat -is [bool]) { $serviceStat } elseif ($serviceStat -is [hashtable] -and $serviceStat.ContainsKey('Connected')) { $serviceStat.Connected } else { $false }
        }
        if (-not $isConnected) { Write-MandALog "CRITICAL: Required service '$serviceName' failed to connect." -Level ERROR; $criticalFailure = $true }
        else { Write-MandALog "Critical service '$serviceName' connected." -Level SUCCESS }
    }
    if ($criticalFailure) { throw "Critical service connection failures detected." }

    if ($Mode -in "Discovery", "Full") {
        Invoke-DiscoveryPhaseInternal -Configuration $script:CurrentConfig
    }
    if ($Mode -in "Processing", "Full") {
        Invoke-ProcessingPhaseInternal -Configuration $script:CurrentConfig
    }
    if ($Mode -in "Export", "Full") {
        Invoke-ExportPhaseInternal -Configuration $script:CurrentConfig
    }

    Complete-MandADiscoveryInternal -Configuration $script:CurrentConfig
} 
catch {
    Write-MandALog "ORCHESTRATOR CRITICAL ERROR: $($_.Exception.Message)" -Level "CRITICAL" -Configuration $script:CurrentConfig # Ensure logging has a config
    if ($_.ScriptStackTrace) { Write-MandALog "Stack Trace: $($_.ScriptStackTrace)" -Level "DEBUG" -Configuration $script:CurrentConfig }
    if ($Host.Name -eq "ConsoleHost") { $Host.SetShouldExit(1); exit 1 } else { throw }
} 
finally {
    Write-MandALog "Performing cleanup..." -Level INFO -Configuration $script:CurrentConfig # Ensure logging has a config
    if (Get-Command 'Disconnect-AllServices' -ErrorAction SilentlyContinue) {
        try { Disconnect-AllServices } catch { Write-MandALog "WARN: Error during service disconnection: $($_.Exception.Message)" -Level WARN -Configuration $script:CurrentConfig }
    }
    Write-MandALog "Orchestrator execution completed at $(Get-Date)" -Level INFO -Configuration $script:CurrentConfig
    $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
}
