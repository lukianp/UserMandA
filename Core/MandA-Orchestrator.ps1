#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Main Orchestrator
.DESCRIPTION
    Unified orchestrator for discovery, processing, and export.
    Handles configuration type conversion and ensures correct invocation of phase-specific logic.
.NOTES
    Version: 4.6.1 (Type Handling Fixed)
    Author: M&A Discovery Suite Team (Claude & Gemini Collaboration)
    Date: 2025-06-03
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$CompanyName,

    [Parameter(Mandatory=$false)]
    [string]$ConfigurationFile,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("Discovery", "Processing", "Export", "Full")]
    [string]$Mode = "Full",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force,
    
    [Parameter(Mandatory=$false)]
    [switch]$ValidateOnly
)

#===============================================================================
#                         INITIALIZATION SECTION
#===============================================================================

$OriginalErrorActionPreferenceOrchestrator = $ErrorActionPreference
$ErrorActionPreference = "Stop" # Terminate on non-terminating errors within this script's scope

# Orchestrator run count for loop detection
if (-not $global:MandA.PSObject.Properties['OrchestratorRunCount']) {
    $global:MandA | Add-Member -MemberType NoteProperty -Name 'OrchestratorRunCount' -Value 0 -Force
}
$global:MandA.OrchestratorRunCount++

if ($global:MandA.OrchestratorRunCount -gt 3) { # Increased sanity check limit
    Write-Error "CRITICAL: Orchestrator has been called $($global:MandA.OrchestratorRunCount) times. Possible infinite loop detected. Exiting."
    $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
    exit 1
}

# Ensure global context from Set-SuiteEnvironment.ps1 is present
if ($null -eq $global:MandA -or $null -eq $global:MandA.Paths) {
    Write-Error "CRITICAL: The global context `$global:MandA (with Paths) is not set. Ensure Set-SuiteEnvironment.ps1 was sourced correctly for Company '$CompanyName'."
    $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
    exit 1
}

#===============================================================================
#                    CORE UTILITY MODULES IMPORT
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

# Verify key utility functions are now available
"Write-MandALog", "Initialize-OutputDirectories", "Test-Prerequisites", "ConvertTo-HashtableRecursiveInternal" | ForEach-Object {
    if (-not (Get-Command $_ -ErrorAction SilentlyContinue)) { Write-Error "CRITICAL: Required utility function '$_' not found after module imports."; exit 1 }
}

#===============================================================================
#                     AUTHENTICATION & CONNECTIVITY MODULES IMPORT
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
    if (-not (Get-Command $_ -ErrorAction SilentlyContinue)) { Write-Error "CRITICAL: Required infra function '$_' not found."; exit 1 }
}
Write-Host "--- Orchestrator: All Core & Infra Modules Imported Successfully ---" -ForegroundColor DarkCyan

#===============================================================================
#                     CORE ORCHESTRATION FUNCTIONS
#===============================================================================

function Initialize-MandAEnvironmentInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)] [hashtable]$Configuration, # Expects a hashtable
        [Parameter(Mandatory=$true)] [string]$CurrentMode,
        [Parameter(Mandatory=$false)] [switch]$IsValidateOnlyMode
    )
    try {
        # All Write-MandALog calls in this function now correctly pass the $Configuration
        Write-MandALog "INITIALIZING ENVIRONMENT FOR MODE: $CurrentMode (Company: $($Configuration.metadata.companyName))" -Level "HEADER" -Configuration $Configuration
        
        if ($global:MandA.Paths.CompanyProfileRoot) {
            # This ensures the $Configuration object being worked with has the correct company path
            $Configuration.environment['outputPath'] = $global:MandA.Paths.CompanyProfileRoot 
            Write-MandALog "Using company-specific output path: $($Configuration.environment.outputPath)" -Level "INFO" -Configuration $Configuration
        } else {
            throw "CompanyProfileRoot not found in `$global:MandA.Paths."
        }

        if (-not (Initialize-OutputDirectories -Configuration $Configuration)) { 
            throw "Failed to initialize output directories." 
        }

        if (-not $global:MandA.ModulesChecked) {
            Write-MandALog "Checking PowerShell module dependencies..." -Level INFO -Configuration $Configuration
            $moduleCheckScriptPath = $global:MandA.Paths.ModuleCheckScript
            if (Test-Path $moduleCheckScriptPath -PathType Leaf) {
                try { & $moduleCheckScriptPath -Silent -ErrorAction Stop; $global:MandA.ModulesChecked = $true }
                catch { 
                    Write-MandALog "ERROR: Module dependency check failed: $($_.Exception.Message)" -Level ERROR -Configuration $Configuration
                    $global:MandA.ModulesChecked = $true # Mark as checked to avoid re-running in error loop
                    Write-MandALog "WARN: Continuing despite module check failure." -Level WARN -Configuration $Configuration
                }
            } else { 
                Write-MandALog "WARN: DiscoverySuiteModuleCheck.ps1 not found at '$moduleCheckScriptPath'" -Level WARN -Configuration $Configuration
                $global:MandA.ModulesChecked = $true 
            }
        } else { 
            Write-MandALog "Module dependencies already checked in this session." -Level INFO -Configuration $Configuration
        }
        
        if (-not (Test-Prerequisites -Configuration $Configuration -ValidateOnly:$IsValidateOnlyMode)) { 
            throw "System prerequisites validation failed." 
        }

        # Load Discovery modules if needed
        if ($CurrentMode -in "Discovery", "Full") {
            $discoveryModulePathBase = Join-Path $global:MandA.Paths.Modules "Discovery"
            $enabledSources = @($Configuration.discovery.enabledSources)
            Write-MandALog "Loading discovery modules for $($enabledSources.Count) sources: $($enabledSources -join ', ')" -Level INFO -Configuration $Configuration
            $loadedCount = 0
            foreach ($sourceName in $enabledSources) {
                $moduleFileName = "$($sourceName)Discovery.psm1"
                $fullModulePath = Join-Path $discoveryModulePathBase $moduleFileName
                if (Test-Path $fullModulePath -PathType Leaf) {
                    try { Import-Module $fullModulePath -Force -Global -ErrorAction Stop; Write-MandALog "Loaded module: $moduleFileName" -Level SUCCESS -Configuration $Configuration; $loadedCount++ }
                    catch { Write-MandALog "ERROR: Failed to load discovery module '$moduleFileName': $($_.Exception.Message)" -Level ERROR -Configuration $Configuration }
                } else { Write-MandALog "WARN: Module file not found for source '$sourceName': $fullModulePath" -Level WARN -Configuration $Configuration }
            }
            Write-MandALog "Loaded $loadedCount discovery modules." -Level INFO -Configuration $Configuration
        }

        # Load Processing modules if needed
        if ($CurrentMode -in "Processing", "Full") { 
            $processingModulePathBase = Join-Path $global:MandA.Paths.Modules "Processing"
            $processingModulesToLoad = @("DataAggregation.psm1", "UserProfileBuilder.psm1", "WaveGeneration.psm1", "DataValidation.psm1")
            Write-MandALog "Loading processing modules..." -Level INFO -Configuration $Configuration
            foreach ($moduleFile in $processingModulesToLoad) {
                $fullModulePath = Join-Path $processingModulePathBase $moduleFile
                if (Test-Path $fullModulePath -PathType Leaf) {
                    try { Import-Module $fullModulePath -Force -Global -ErrorAction Stop; Write-MandALog "Loaded processing module: $moduleFile" -Level SUCCESS -Configuration $Configuration }
                    catch { Write-MandALog "ERROR: Failed to load processing module '$moduleFile': $($_.Exception.Message)" -Level ERROR -Configuration $Configuration }
                } else { Write-MandALog "WARN: Processing module not found: $fullModulePath" -Level WARN -Configuration $Configuration }
            }
        }

        # Load Export modules if needed
        if ($CurrentMode -in "Export", "Full") {
            $exportModulePathBase = Join-Path $global:MandA.Paths.Modules "Export"
            $exportModulesToLoad = @{ # Mapping format name to module filename
                "CSV" = "CSVExport.psm1"; "JSON" = "JSONExport.psm1"; "Excel" = "ExcelExport.psm1";
                "CompanyControlSheet" = "CompanyControlSheetExporter.psm1"; "PowerApps" = "PowerAppsExporter.psm1"
            }
            $enabledFormats = @($Configuration.export.formats)
            Write-MandALog "Loading export modules for enabled formats: $($enabledFormats -join ', ')" -Level INFO -Configuration $Configuration
            $loadedCount = 0
            foreach ($formatName in $enabledFormats) {
                if ($exportModulesToLoad.ContainsKey($formatName)) {
                    $moduleFileName = $exportModulesToLoad[$formatName]
                    $fullModulePath = Join-Path $exportModulePathBase $moduleFileName
                    if (Test-Path $fullModulePath -PathType Leaf) {
                        try { Import-Module $fullModulePath -Force -Global -ErrorAction Stop; Write-MandALog "Loaded export module: $moduleFileName" -Level SUCCESS -Configuration $Configuration; $loadedCount++ }
                        catch { Write-MandALog "ERROR: Failed to load export module '$moduleFileName': $($_.Exception.Message)" -Level ERROR -Configuration $Configuration }
                    } else { Write-MandALog "WARN: Export module file not found: $fullModulePath" -Level WARN -Configuration $Configuration }
                } else { Write-MandALog "WARN: No module mapping found for export format '$formatName'" -Level WARN -Configuration $Configuration }
            }
            Write-MandALog "Loaded $loadedCount export modules." -Level INFO -Configuration $Configuration
        }

        Write-MandALog "Environment initialization completed." -Level SUCCESS -Configuration $Configuration
        return $true
    } catch { 
        # Log error using the $Configuration passed into this function
        Write-MandALog "ERROR: Environment initialization (Initialize-MandAEnvironmentInternal) failed: $($_.Exception.Message)" -Level ERROR -Configuration $Configuration
        throw 
    }
}

function Invoke-DiscoveryPhaseInternal {
    [CmdletBinding()] 
    param([Parameter(Mandatory=$true)][hashtable]$Configuration) # Expects Hashtable
    try {
        Write-MandALog "STARTING DISCOVERY PHASE" -Level "HEADER" -Configuration $Configuration
        $discoveryResults = @{}
        $enabledSources = @($Configuration.discovery.enabledSources)
        foreach ($sourceName in $enabledSources) {
            $invokeFunctionName = "Invoke-$($sourceName)Discovery"
            if (Get-Command $invokeFunctionName -ErrorAction SilentlyContinue) {
                Write-MandALog "Invoking $invokeFunctionName for '$sourceName'..." -Level INFO -Configuration $Configuration
                try { 
                    # Discovery modules are expected to take -Configuration if they need it,
                    # otherwise they use $global:MandA.Config (which is a hashtable now)
                    $discoveryResults[$sourceName] = (& $invokeFunctionName -Configuration $Configuration -ErrorAction Stop)
                    Write-MandALog "Finished discovery for '$sourceName'." -Level SUCCESS -Configuration $Configuration
                }
                catch { 
                    Write-MandALog "ERROR: Discovery for '$sourceName' failed: $($_.Exception.Message)" -Level ERROR -Configuration $Configuration
                    $discoveryResults[$sourceName] = @{ Error = $_.Exception.Message; Success=$false } 
                }
            } else { 
                Write-MandALog "WARN: Discovery function '$invokeFunctionName' not found for '$sourceName'." -Level WARN -Configuration $Configuration
            }
        }
        Write-MandALog "Discovery Phase Completed." -Level SUCCESS -Configuration $Configuration
        return $discoveryResults 
    } catch { 
        Write-MandALog "ERROR: Discovery phase failed: $($_.Exception.Message)" -Level ERROR -Configuration $Configuration
        throw 
    }
}

function Invoke-ProcessingPhaseInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration # Expects Hashtable
    )
    try {
        Write-MandALog "STARTING PROCESSING PHASE (Invoke-ProcessingPhaseInternal)" -Level "HEADER" -Configuration $Configuration

        $processingFunction = "Start-DataAggregation"

        if (Get-Command $processingFunction -ErrorAction SilentlyContinue) {
            Write-MandALog "Invoking '$processingFunction' (module will use `$global:MandA.Config for its settings)..." -Level "INFO" -Configuration $Configuration
            
            # CALLING BLACK BOX: Does not take -Configuration directly. Uses $global:MandA.Config.
            $processingSuccess = & $processingFunction -ErrorAction Stop 
            
            if (-not $processingSuccess) {
                throw "The '$processingFunction' function reported failure (returned false or non-true value)."
            }
            Write-MandALog "'$processingFunction' completed successfully." -Level "SUCCESS" -Configuration $Configuration
        } else {
            throw "CRITICAL: Processing function '$processingFunction' not found. Ensure 'DataAggregation.psm1' is loaded."
        }

        Write-MandALog "Processing Phase Completed Successfully." -Level "SUCCESS" -Configuration $Configuration
        return $true
    } catch {
        Write-MandALog "ERROR: Processing phase (Invoke-ProcessingPhaseInternal) failed: $($_.Exception.Message)" -Level "ERROR" -Configuration $Configuration
        throw
    }
}

function Invoke-ExportPhaseInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration # Expects Hashtable
    )
    try {
        Write-MandALog "STARTING EXPORT PHASE (Invoke-ExportPhaseInternal)" -Level "HEADER" -Configuration $Configuration
        
        $processedDataPath = $global:MandA.Paths.ProcessedDataOutput
        Write-MandALog "Loading processed data for export from: $processedDataPath" -Level "INFO" -Configuration $Configuration
        
        $dataToExport = @{}
        $processedFiles = Get-ChildItem -Path $processedDataPath -Filter "*.csv" -File -ErrorAction SilentlyContinue
        
        if ($null -eq $processedFiles -or $processedFiles.Count -eq 0) {
            throw "No processed CSV files found in '$processedDataPath'. Ensure Processing phase ran."
        }
        
        Write-MandALog "Found $($processedFiles.Count) processed files to load." -Level "DEBUG" -Configuration $Configuration
        
        foreach ($file in $processedFiles) {
            $dataKey = $file.BaseName
            Write-MandALog "Loading $($file.Name) for export..." -Level "DEBUG" -Configuration $Configuration
            try {
                $dataToExport[$dataKey] = Import-Csv -Path $file.FullName -ErrorAction Stop
                Write-MandALog "Loaded $($dataToExport[$dataKey].Count) records from $($file.Name) into key '$($dataKey)'." -Level "INFO" -Configuration $Configuration
            } catch {
                throw "Failed to load processed file '$($file.Name)': $($_.Exception.Message)"
            }
        }
        
        if ($dataToExport.Keys.Count -eq 0) {
            throw "Failed to load any data into dataToExport hashtable."
        }

        $enabledFormats = @($Configuration.export.formats)
        Write-MandALog "Will execute $($enabledFormats.Count) export formats: $($enabledFormats -join ', ')" -Level "INFO" -Configuration $Configuration
        
        $overallExportSuccess = $true
        
        foreach ($formatName in $enabledFormats) {
            $exportFunctionName = ""
            switch ($formatName) {
                "PowerApps" { $exportFunctionName = "Export-ForPowerApps" }
                "CompanyControlSheet" { $exportFunctionName = "Export-ToCompanyControlSheet" } # Ensure this matches actual function name
                "CSV" { $exportFunctionName = "Export-ToCSV" }
                "JSON" { $exportFunctionName = "Export-ToJSON" }
                "Excel" { if ($Configuration.export.excelEnabled) { $exportFunctionName = "Export-ToExcel" } }
                default { Write-MandALog "WARN: Export format '$formatName' is not mapped. Skipping." -Level "WARN" -Configuration $Configuration; continue }
            }

            if (-not $exportFunctionName) { # Handles Excel not enabled or unmapped
                Write-MandALog "WARN: No valid export function determined for format '$formatName'. Skipping." -Level WARN -Configuration $Configuration
                continue
            }

            if (Get-Command $exportFunctionName -ErrorAction SilentlyContinue) {
                Write-MandALog "Invoking '$exportFunctionName' for format '$formatName' (module will use `$global:MandA.Config for settings)..." -Level "INFO" -Configuration $Configuration
                try {
                    # CALLING BLACK BOX: Passes data, module uses $global:MandA.Config for settings.
                    & $exportFunctionName -ProcessedData $dataToExport -ErrorAction Stop 
                    Write-MandALog "Export for '$formatName' completed." -Level "SUCCESS" -Configuration $Configuration
                } catch {
                    Write-MandALog "ERROR: Export for '$formatName' ('$exportFunctionName') failed: $($_.Exception.Message)" -Level "ERROR" -Configuration $Configuration
                    $overallExportSuccess = $false
                }
            } else {
                Write-MandALog "WARN: Export function '$exportFunctionName' for format '$formatName' not found. Skipping." -Level "WARN" -Configuration $Configuration
                $overallExportSuccess = $false
            }
        }
        
        if (-not $overallExportSuccess) {
            throw "One or more export formats failed."
        }

        Write-MandALog "Export Phase Completed Successfully." -Level "SUCCESS" -Configuration $Configuration
        return $true
    } catch {
        Write-MandALog "ERROR: Export phase (Invoke-ExportPhaseInternal) failed: $($_.Exception.Message)" -Level "ERROR" -Configuration $Configuration
        throw
    }
}

function Complete-MandADiscoveryInternal {
    [CmdletBinding()] 
    param([Parameter(Mandatory=$true)][hashtable]$Configuration) # Expects Hashtable
    Write-MandALog "FINALIZING M&A DISCOVERY SUITE EXECUTION (Orchestrator v4.6.1)" -Level "HEADER" -Configuration $Configuration
    Write-MandALog "Execution completed." -Level SUCCESS -Configuration $Configuration # Changed from "successfully" to "completed" to be accurate even if errors occurred before this point but were handled.
    Write-MandALog "  - Logs: $($global:MandA.Paths.LogOutput)" -Level INFO -Configuration $Configuration
    Write-MandALog "  - Output: $($Configuration.environment.outputPath)" -Level INFO -Configuration $Configuration
}
#===============================================================================
#                         MAIN EXECUTION BLOCK
#===============================================================================
try {
    # Determine which configuration to use
    if ($PSBoundParameters.ContainsKey('ConfigurationFile') -and (-not [string]::IsNullOrWhiteSpace($ConfigurationFile))) {
        $configPathToLoad = if ([System.IO.Path]::IsPathRooted($ConfigurationFile)) { $ConfigurationFile } else { Join-Path $global:MandA.Paths.SuiteRoot $ConfigurationFile }
        if (-not (Test-Path $configPathToLoad -PathType Leaf)) {
            throw "Specified configuration file '$configPathToLoad' not found."
        }
        Write-Host "Orchestrator: Loading specified configuration file: $configPathToLoad" -ForegroundColor Yellow
        $script:CurrentConfig = Get-Content -Path $configPathToLoad -Raw | ConvertFrom-Json
    } else {
        Write-Host "Orchestrator: Using configuration from `$global:MandA.Config (set by Set-SuiteEnvironment.ps1)" -ForegroundColor Yellow
        $script:CurrentConfig = $global:MandA.Config 
    }
    
    if ($null -eq $script:CurrentConfig) {
        throw "CRITICAL: Configuration failed to load. `$script:CurrentConfig is null."
    }
    Write-Host "Orchestrator: Initial type of `$script:CurrentConfig is $($script:CurrentConfig.GetType().FullName)" -ForegroundColor Magenta

    # Convert $script:CurrentConfig to a Hashtable if it's a PSCustomObject
    if ($script:CurrentConfig -is [System.Management.Automation.PSCustomObject]) {
        Write-Host "Orchestrator: `$script:CurrentConfig is PSCustomObject. Attempting conversion..." -ForegroundColor Yellow
        if (-not (Get-Command ConvertTo-HashtableRecursiveInternal -ErrorAction SilentlyContinue)) {
            throw "CRITICAL: ConvertTo-HashtableRecursiveInternal function not found. Ensure ValidationHelpers.psm1 is imported and exports this function."
        }
        $tempHashtableConfig = $null
        try {
            $tempHashtableConfig = ConvertTo-HashtableRecursiveInternal -obj $script:CurrentConfig
        } catch {
            throw "CRITICAL: Error during ConvertTo-HashtableRecursiveInternal call: $($_.Exception.Message)"
        }
        if ($null -eq $tempHashtableConfig -or -not ($tempHashtableConfig -is [hashtable])) {
             throw "CRITICAL: ConvertTo-HashtableRecursiveInternal did not return a valid hashtable. Result was: $($tempHashtableConfig | Out-String)"
        }
        $script:CurrentConfig = $tempHashtableConfig
        Write-Host "Orchestrator: Type of `$script:CurrentConfig after conversion is $($script:CurrentConfig.GetType().FullName)" -ForegroundColor Green
    } elseif (-not ($script:CurrentConfig -is [hashtable])) {
        throw "CRITICAL: Initial `$script:CurrentConfig is neither PSCustomObject nor Hashtable. Type is $($script:CurrentConfig.GetType().FullName)."
    } else {
        Write-Host "Orchestrator: `$script:CurrentConfig is already a Hashtable. No conversion needed." -ForegroundColor Cyan
    }

    # Now $script:CurrentConfig is guaranteed to be a [hashtable].
    # All Write-MandALog calls from this point forward using $script:CurrentConfig as -Configuration parameter will be fine.
    # It's also safe to set $global:MandA.Config from this.

    if ($script:CurrentConfig.metadata.companyName -ne $CompanyName) {
        Write-MandALog "Updating configuration metadata with provided CompanyName: '$CompanyName' (was '$($script:CurrentConfig.metadata.companyName)')" -Level INFO -Configuration $script:CurrentConfig
        $script:CurrentConfig.metadata.companyName = $CompanyName
    }
    if ($Force.IsPresent) { 
        $script:CurrentConfig.discovery.skipExistingFiles = $false 
        Write-MandALog "Force mode enabled: discovery.skipExistingFiles set to false." -Level INFO -Configuration $script:CurrentConfig
    }
    
    # Update global config context (MUST be a hashtable for modules and consistent logging)
    Write-MandALog "Finalizing active configuration for global context..." -Level "DEBUG" -Configuration $script:CurrentConfig
    $global:MandA.Config = $script:CurrentConfig 
    Write-MandALog "Global configuration context updated (Type: $($global:MandA.Config.GetType().FullName))." -Level "INFO" -Configuration $global:MandA.Config
    
    Write-MandALog "M&A DISCOVERY SUITE v$($script:CurrentConfig.metadata.version) | Orchestrator v4.6.1" -Level "HEADER" -Configuration $script:CurrentConfig
    Write-MandALog "Mode: $Mode | Company: $CompanyName" -Level "INFO" -Configuration $script:CurrentConfig

    Initialize-MandAEnvironmentInternal -Configuration $script:CurrentConfig -CurrentMode $Mode -IsValidateOnlyMode:$ValidateOnly
    
    if ($ValidateOnly.IsPresent) {
        Write-MandALog "Validation Only Mode: Environment checks complete." -Level SUCCESS -Configuration $script:CurrentConfig
        $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
        exit 0
    }
    
    if ($Mode -in "Discovery", "Full") {
        Write-MandALog "AUTHENTICATION & CONNECTION SETUP for Discovery/Full mode" -Level "HEADER" -Configuration $script:CurrentConfig
        $authContext = $null
        if ($global:MandA.Paths.CredentialFile) {
            # Ensure the config hashtable reflects the correct credential file details if sourced from global:MandA.Paths
             if ($script:CurrentConfig.authentication -is [hashtable]) {
                $script:CurrentConfig.authentication.credentialStorePath = Split-Path $global:MandA.Paths.CredentialFile -Parent
                $script:CurrentConfig.authentication.credentialFileName = Split-Path $global:MandA.Paths.CredentialFile -Leaf
             } else {
                Write-MandALog "WARN: script:CurrentConfig.authentication is not a hashtable. Cannot set credential paths." -Level WARN -Configuration $script:CurrentConfig
             }
        } else {
            throw "Global credential file path (`$global:MandA.Paths.CredentialFile`) is not set. Critical for authentication."
        }

        $authResult = Initialize-MandAAuthentication -Configuration $script:CurrentConfig # $script:CurrentConfig is Hashtable
        if ($null -eq $authResult -or ($authResult -is [hashtable] -and $authResult.Authenticated -ne $true)) {
            $authError = if($authResult -is [hashtable] -and $authResult.Error){$authResult.Error}else{"Unknown auth error"}
            throw "Authentication failed: $authError"
        }
        $authContext = if ($authResult.Context) { $authResult.Context } else { $authResult } # Assuming context is primary part of $authResult
        Write-MandALog "Authentication successful. ClientID: $($authContext.ClientId), TenantID: $($authContext.TenantId)" -Level SUCCESS -Configuration $script:CurrentConfig
        
        $connectionStatus = Initialize-AllConnections -Configuration $script:CurrentConfig -AuthContext $authContext # $script:CurrentConfig is Hashtable
        if ($null -eq $connectionStatus -or $connectionStatus.Count -eq 0) { 
            throw "Connection initialization returned no results or failed." 
        }

        $criticalFailure = $false
        if ($script:CurrentConfig.environment.connectivity.haltOnConnectionError -is [array]) {
            ($script:CurrentConfig.environment.connectivity.haltOnConnectionError) | ForEach-Object {
                $serviceName = $_
                $isConnected = $false
                if ($connectionStatus.ContainsKey($serviceName)) {
                    $serviceStat = $connectionStatus.$serviceName
                    $isConnected = if ($serviceStat -is [bool]) { $serviceStat } elseif ($serviceStat -is [hashtable] -and $serviceStat.ContainsKey('Connected')) { $serviceStat.Connected } else { $false }
                }
                if (-not $isConnected) { 
                    Write-MandALog "Required service '$serviceName' failed to connect." -Level ERROR -Configuration $script:CurrentConfig
                    $criticalFailure = $true 
                } else { 
                    Write-MandALog "Critical service '$serviceName' connected." -Level SUCCESS -Configuration $script:CurrentConfig
                }
            }
        }
        if ($criticalFailure) { throw "Critical service connection failures detected." }
    } else {
         Write-MandALog "Skipping Authentication & Connection setup for Mode: $Mode" -Level INFO -Configuration $script:CurrentConfig
    }

    # Execute phases based on mode
    if ($Mode -in "Discovery", "Full") {
        Invoke-DiscoveryPhaseInternal -Configuration $script:CurrentConfig # Pass Hashtable
    }
    if ($Mode -in "Processing", "Full") {
        Invoke-ProcessingPhaseInternal -Configuration $script:CurrentConfig # Pass Hashtable (function uses $global:MandA.Config)
    }
    if ($Mode -in "Export", "Full") {
        Invoke-ExportPhaseInternal -Configuration $script:CurrentConfig # Pass Hashtable (function uses $global:MandA.Config)
    }

    Complete-MandADiscoveryInternal -Configuration $script:CurrentConfig # Pass Hashtable
} 
catch {
    # $script:CurrentConfig at this point might be the initial PSCustomObject if error occurred before conversion,
    # or the converted Hashtable if error occurred after.
    # To be safe for Write-MandALog, we should use $global:MandA.Config if $script:CurrentConfig isn't a Hashtable here
    $configForErrorLog = if ($script:CurrentConfig -is [hashtable]) { $script:CurrentConfig } elseif ($global:MandA.Config -is [hashtable]) { $global:MandA.Config } else { $null }
    
    if ($configForErrorLog) {
        Write-MandALog "ORCHESTRATOR ERROR: $($_.Exception.Message)" -Level "ERROR" -Configuration $configForErrorLog
        if ($_.ScriptStackTrace) { 
            Write-MandALog "Stack Trace: $($_.ScriptStackTrace)" -Level "DEBUG" -Configuration $configForErrorLog
        }
    } else {
        # Fallback if no valid config for logging
        Write-Error "ORCHESTRATOR CRITICAL ERROR (logging config unavailable): $($_.Exception.Message)"
        if ($_.ScriptStackTrace) { Write-Warning "Stack Trace: $($_.ScriptStackTrace)" }
    }

    if ($Host.Name -eq "ConsoleHost") { $Host.SetShouldExit(1); exit 1 } 
    else { throw }
} 
finally {
    # Use $global:MandA.Config for logging in finally, as it should be the most reliable state
    # or $script:CurrentConfig if it's confirmed to be a hashtable at the end of try.
    $finalConfigForLog = if ($script:CurrentConfig -is [hashtable]) { $script:CurrentConfig } elseif ($global:MandA.Config -is [hashtable]) { $global:MandA.Config } else { $null }

    if ($finalConfigForLog) {
        Write-MandALog "Performing cleanup..." -Level INFO -Configuration $finalConfigForLog
        if (Get-Command 'Disconnect-AllServices' -ErrorAction SilentlyContinue) {
            try { Disconnect-AllServices } 
            catch { Write-MandALog "WARN: Error during service disconnection: $($_.Exception.Message)" -Level WARN -Configuration $finalConfigForLog }
        }
        Write-MandALog "Orchestrator execution completed at $(Get-Date)" -Level INFO -Configuration $finalConfigForLog
    } else {
        Write-Host "Orchestrator: Performing cleanup (logging config unavailable in finally block)."
        if (Get-Command 'Disconnect-AllServices' -ErrorAction SilentlyContinue) { try { Disconnect-AllServices } catch {} }
        Write-Host "Orchestrator: Execution completed at $(Get-Date)."
    }
    $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
}