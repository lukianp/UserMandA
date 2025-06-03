#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Main Orchestrator (Fixed Version 4.6.1)

.DESCRIPTION
    Unified orchestrator for discovery, processing, and export.
    This version fixes all log level issues and ensures proper global config setup.

.NOTES
    Version: 4.6.1 (Comprehensive Fix with Processing/Export fixes)
    Author: Fixed Implementation
    Date: 2025-06-02
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
        if ($global:MandA.Paths.CompanyProfileRoot) {
            $Configuration.environment['outputPath'] = $global:MandA.Paths.CompanyProfileRoot
            Write-MandALog "Using company-specific output path: $($Configuration.environment.outputPath)" -Level "INFO"
        } else {
            throw "CompanyProfileRoot not found in `$global:MandA.Paths. Ensure Set-SuiteEnvironment.ps1 ran successfully for Company '$($Configuration.metadata.companyName)'."
        }

        # Initialize output directories
        if (-not (Initialize-OutputDirectories -Configuration $Configuration)) { 
            throw "Failed to initialize output directories." 
        }

        # Module dependency check
        if (-not $global:MandA.ModulesChecked) {
            Write-MandALog "Checking PowerShell module dependencies..." -Level INFO
            $moduleCheckScriptPath = $global:MandA.Paths.ModuleCheckScript
            if (Test-Path $moduleCheckScriptPath -PathType Leaf) {
                try { 
                    & $moduleCheckScriptPath  -ErrorAction Stop
                    $global:MandA.ModulesChecked = $true 
                }
                catch { 
                    Write-MandALog "ERROR: Module dependency check failed: $($_.Exception.Message)" -Level ERROR
                    $global:MandA.ModulesChecked = $true
                    Write-MandALog "WARN: Continuing despite module check failure." -Level WARN 
                }
            } else { 
                Write-MandALog "WARN: DiscoverySuiteModuleCheck.ps1 not found at '$moduleCheckScriptPath'" -Level WARN
                $global:MandA.ModulesChecked = $true 
            }
        } else { 
            Write-MandALog "Module dependencies already checked in this session." -Level INFO 
        }
        
        if (-not (Test-Prerequisites -Configuration $Configuration -ValidateOnly:$IsValidateOnlyMode)) { 
            throw "System prerequisites validation failed." 
        }

        # Load Discovery modules if needed
        if ($CurrentMode -in "Discovery", "Full") {
            $discoveryModulePathBase = Join-Path $global:MandA.Paths.Modules "Discovery"
            $enabledSources = @($Configuration.discovery.enabledSources)
            Write-MandALog "Loading discovery modules for $($enabledSources.Count) sources: $($enabledSources -join ', ')" -Level INFO
            $loadedCount = 0
            foreach ($sourceName in $enabledSources) {
                $moduleFileName = "$($sourceName)Discovery.psm1"
                $fullModulePath = Join-Path $discoveryModulePathBase $moduleFileName
                if (Test-Path $fullModulePath -PathType Leaf) {
                    try { 
                        Import-Module $fullModulePath -Force -Global -ErrorAction Stop
                        Write-MandALog "Loaded module: $moduleFileName" -Level SUCCESS
                        $loadedCount++ 
                    }
                    catch { 
                        Write-MandALog "ERROR: Failed to load discovery module '$moduleFileName': $($_.Exception.Message)" -Level ERROR 
                    }
                } else { 
                    Write-MandALog "WARN: Module file not found for source '$sourceName': $fullModulePath" -Level WARN 
                }
            }
            Write-MandALog "Loaded $loadedCount discovery modules." -Level INFO
        }

        # Load Processing modules if needed
        if ($CurrentMode -in "Processing", "Full") { 
            Write-MandALog "Loading processing modules..." -Level INFO
            $processingModulePathBase = Join-Path $global:MandA.Paths.Modules "Processing"
            
            # Fix the DataAggregation module to replace CRITICAL log levels
            $dataAggPath = Join-Path $processingModulePathBase "DataAggregation.psm1"
            if (Test-Path $dataAggPath) {
                # Read and fix the module content before loading
                $content = Get-Content $dataAggPath -Raw
                # Fix all variations of CRITICAL log level
                $content = $content -replace '-Level\s+"CRITICAL"', '-Level "ERROR"'
                $content = $content -replace "-Level\s+'CRITICAL'", "-Level 'ERROR'"
                $content = $content -replace '-Level\s+CRITICAL', '-Level "ERROR"'
                
                # Create a temporary fixed version
                $tempPath = [System.IO.Path]::GetTempFileName() + ".psm1"
                Set-Content -Path $tempPath -Value $content -Force
                try {
                    Import-Module $tempPath -Force -Global -ErrorAction Stop
                    Write-MandALog "Loaded processing module: DataAggregation.psm1 (with fixes)" -Level SUCCESS
                } catch {
                    Write-MandALog "ERROR: Failed to load DataAggregation.psm1: $($_.Exception.Message)" -Level ERROR
                } finally {
                    Remove-Item $tempPath -Force -ErrorAction SilentlyContinue
                }
            }
            
            # Load other processing modules normally
            $otherProcessingModules = @("UserProfileBuilder.psm1", "WaveGeneration.psm1", "DataValidation.psm1")
            foreach ($moduleFile in $otherProcessingModules) {
                $fullModulePath = Join-Path $processingModulePathBase $moduleFile
                if (Test-Path $fullModulePath -PathType Leaf) {
                    try { 
                        Import-Module $fullModulePath -Force -Global -ErrorAction Stop
                        Write-MandALog "Loaded processing module: $moduleFile" -Level SUCCESS 
                    }
                    catch { 
                        Write-MandALog "ERROR: Failed to load processing module '$moduleFile': $($_.Exception.Message)" -Level ERROR 
                    }
                } else { 
                    Write-MandALog "WARN: Processing module not found: $fullModulePath" -Level WARN 
                }
            }
        }

        # Load Export modules if needed
        if ($CurrentMode -in "Export", "Full") {
            Write-MandALog "Loading export modules..." -Level INFO
            $exportModulePathBase = Join-Path $global:MandA.Paths.Modules "Export"
            $enabledFormats = @($Configuration.export.formats)
            Write-MandALog "Loading export modules for enabled formats: $($enabledFormats -join ', ')" -Level INFO
            $loadedCount = 0
            
            foreach ($formatName in $enabledFormats) {
                $moduleFileName = ""
                # Map format names to module file names
                switch ($formatName) {
                    "CSV" { $moduleFileName = "CSVExport.psm1" }
                    "JSON" { $moduleFileName = "JSONExport.psm1" }
                    "Excel" { $moduleFileName = "ExcelExport.psm1" }
                    "CompanyControlSheet" { $moduleFileName = "CompanyControlSheetExporter.psm1" }
                    "PowerApps" { $moduleFileName = "PowerAppsExporter.psm1" }
                    default { 
                        Write-MandALog "WARN: No module mapping found for format '$formatName'" -Level WARN
                        continue
                    }
                }
                
                if ($moduleFileName) {
                    $fullModulePath = Join-Path $exportModulePathBase $moduleFileName
                    if (Test-Path $fullModulePath -PathType Leaf) {
                        try { 
                            Import-Module $fullModulePath -Force -Global -ErrorAction Stop
                            Write-MandALog "Loaded export module: $moduleFileName" -Level SUCCESS
                            $loadedCount++ 
                        }
                        catch { 
                            Write-MandALog "ERROR: Failed to load export module '$moduleFileName': $($_.Exception.Message)" -Level ERROR 
                        }
                    } else { 
                        Write-MandALog "WARN: Export module file not found: $fullModulePath" -Level WARN 
                    }
                }
            }
            Write-MandALog "Loaded $loadedCount export modules." -Level INFO
        }

        Write-MandALog "Environment initialization completed." -Level SUCCESS
        return $true
    } catch { 
        Write-MandALog "ERROR: Environment initialization failed: $($_.Exception.Message)" -Level ERROR
        throw 
    }
}

function Invoke-DiscoveryPhaseInternal {
    [CmdletBinding()] 
    param([Parameter(Mandatory=$true)][hashtable]$Configuration)
    try {
        Write-MandALog "STARTING DISCOVERY PHASE" -Level "HEADER"
        $discoveryResults = @{}
        $enabledSources = @($Configuration.discovery.enabledSources)
        foreach ($sourceName in $enabledSources) {
            $invokeFunctionName = "Invoke-$($sourceName)Discovery"
            if (Get-Command $invokeFunctionName -ErrorAction SilentlyContinue) {
                Write-MandALog "Invoking $invokeFunctionName for '$sourceName'..." -Level INFO
                try { 
                    $discoveryResults[$sourceName] = (& $invokeFunctionName -Configuration $Configuration -ErrorAction Stop)
                    Write-MandALog "Finished discovery for '$sourceName'." -Level SUCCESS 
                }
                catch { 
                    Write-MandALog "ERROR: Discovery failed for '$sourceName': $($_.Exception.Message)" -Level ERROR
                    $discoveryResults[$sourceName] = @{ Error = $_.Exception.Message; Success=$false } 
                }
            } else { 
                Write-MandALog "WARN: Discovery function '$invokeFunctionName' not found for '$sourceName'." -Level WARN 
            }
        }
        Write-MandALog "Discovery Phase Completed." -Level SUCCESS
        return $discoveryResults 
    } catch { 
        Write-MandALog "ERROR: Discovery phase failed: $($_.Exception.Message)" -Level ERROR
        throw 
    }
}

function Invoke-ProcessingPhaseInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    try {
        Write-MandALog "STARTING PROCESSING PHASE (Invoke-ProcessingPhaseInternal)" -Level "HEADER"

        # The primary function from the processing modules is 'Start-DataAggregation'
        $processingFunction = "Start-DataAggregation"

        if (Get-Command $processingFunction -ErrorAction SilentlyContinue) {
            Write-MandALog "Invoking '$processingFunction'..." -Level "INFO"
            
            # The actual module DOES accept -Configuration parameter
            $processingSuccess = & $processingFunction -Configuration $Configuration -ErrorAction Stop
            
            if (-not $processingSuccess) {
                throw "The '$processingFunction' function reported failure."
            }
            
            Write-MandALog "'$processingFunction' completed successfully." -Level "SUCCESS"
        } else {
            throw "Processing function '$processingFunction' not found. Ensure 'DataAggregation.psm1' and other Processing modules are correctly loaded."
        }

        Write-MandALog "Processing Phase Completed Successfully." -Level "SUCCESS"
        return $true
    } catch {
        Write-MandALog "ERROR: Processing phase (Invoke-ProcessingPhaseInternal) failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Invoke-ExportPhaseInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    try {
        Write-MandALog "STARTING EXPORT PHASE (Invoke-ExportPhaseInternal)" -Level "HEADER"
        
        $processedDataPath = $global:MandA.Paths.ProcessedDataOutput
        Write-MandALog "Loading processed data for export from: $processedDataPath" -Level "INFO"
        
        # Load all processed .csv files into a hashtable to pass to export functions
        $dataToExport = @{}
        $processedFiles = Get-ChildItem -Path $processedDataPath -Filter "*.csv" -File -ErrorAction SilentlyContinue
        
        if ($null -eq $processedFiles -or $processedFiles.Count -eq 0) {
            throw "No processed CSV files found in '$processedDataPath'. Ensure Processing phase ran."
        }
        
        Write-MandALog "Found $($processedFiles.Count) processed files to load." -Level "DEBUG"
        
        foreach ($file in $processedFiles) {
            $dataKey = $file.BaseName
            Write-MandALog "Loading $($file.Name) for export..." -Level "DEBUG"
            try {
                $dataToExport[$dataKey] = Import-Csv -Path $file.FullName -ErrorAction Stop
                Write-MandALog "Loaded $($dataToExport[$dataKey].Count) records from $($file.Name) into key '$($dataKey)'." -Level "INFO"
            } catch {
                throw "Failed to load processed file '$($file.Name)': $($_.Exception.Message)"
            }
        }
        
        if ($dataToExport.Keys.Count -eq 0) {
            throw "Failed to load any data into dataToExport hashtable."
        }

        $enabledFormats = @($Configuration.export.formats)
        Write-MandALog "Will execute $($enabledFormats.Count) export formats: $($enabledFormats -join ', ')" -Level "INFO"
        
        $overallExportSuccess = $true
        
        foreach ($formatName in $enabledFormats) {
            $exportFunctionName = ""
            
            # Map format names to actual function names based on the export modules
            switch ($formatName) {
                "PowerApps" { 
                    $exportFunctionName = "Export-ForPowerApps" 
                }
                "CompanyControlSheet" { 
                    $exportFunctionName = "Export-ToCompanyControlSheet" 
                }
                "CSV" { 
                    $exportFunctionName = "Export-ToCSV"
                }
                "JSON" { 
                    $exportFunctionName = "Export-ToJSON"
                }
                "Excel" {
                    if ($Configuration.export.excelEnabled) {
                        $exportFunctionName = "Export-ToExcel"
                    } else {
                        Write-MandALog "WARN: Excel format requested but excelEnabled is false. Skipping." -Level "WARN"
                        continue
                    }
                }
                default { 
                    Write-MandALog "WARN: Export format '$formatName' is not specifically mapped. Skipping." -Level "WARN"
                    continue
                }
            }

            if (Get-Command $exportFunctionName -ErrorAction SilentlyContinue) {
                Write-MandALog "Invoking '$exportFunctionName' for format '$formatName'..." -Level "INFO"
                try {
                    # Call the export function with correct parameters
                    & $exportFunctionName -ProcessedData $dataToExport -Configuration $Configuration -ErrorAction Stop
                    Write-MandALog "Export for '$formatName' completed." -Level "SUCCESS"
                } catch {
                    Write-MandALog "ERROR: Export for '$formatName' failed: $($_.Exception.Message)" -Level "ERROR"
                    $overallExportSuccess = $false
                }
            } else {
                Write-MandALog "WARN: Export function '$exportFunctionName' for format '$formatName' not found. Skipping." -Level "WARN"
                $overallExportSuccess = $false
            }
        }
        
        if (-not $overallExportSuccess) {
            throw "One or more export formats failed."
        }

        Write-MandALog "Export Phase Completed Successfully." -Level "SUCCESS"
        return $true
    } catch {
        Write-MandALog "ERROR: Export phase (Invoke-ExportPhaseInternal) failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Complete-MandADiscoveryInternal {
    [CmdletBinding()] 
    param([Parameter(Mandatory=$true)][hashtable]$Configuration)
    Write-MandALog "FINALIZING M&A DISCOVERY SUITE EXECUTION (Orchestrator v4.6.1)" -Level "HEADER"
    Write-MandALog "Execution completed successfully." -Level SUCCESS
    Write-MandALog "  - Logs: $($global:MandA.Paths.LogOutput)" -Level INFO
    Write-MandALog "  - Output: $($Configuration.environment.outputPath)" -Level INFO
}

# Helper function to convert PSCustomObject to Hashtable recursively

# Helper function to convert PSCustomObject to Hashtable recursively
function ConvertTo-HashtableFromPSCustomObject {
    param (
        [Parameter(ValueFromPipeline = $true)]
        $InputObject,
        
        [Parameter()]
        [string]$Path = "ROOT"  # For debugging
    )

    process {
        # Handle null explicitly
        if ($null -eq $InputObject) { 
            Write-Host "DEBUG: Null value at path: $Path" -ForegroundColor Gray
            return $null 
        }

        # Handle arrays and collections
        if ($InputObject -is [System.Collections.IEnumerable] -and $InputObject -isnot [string]) {
            $collection = @()
            $index = 0
            foreach ($item in $InputObject) { 
                $itemPath = "$Path[$index]"
                try {
                    $converted = ConvertTo-HashtableFromPSCustomObject -InputObject $item -Path $itemPath
                    $collection += $converted
                } catch {
                    Write-Host "DEBUG: Error converting array item at $itemPath : $($_.Exception.Message)" -ForegroundColor Red
                    $collection += $item  # Add original if conversion fails
                }
                $index++
            }
            return ,$collection  # Comma operator to prevent array unwrapping
        } 
        # Handle PSCustomObject
        elseif ($InputObject -is [PSCustomObject]) {
            $hash = @{}
            foreach ($property in $InputObject.PSObject.Properties) {
                $propPath = "$Path.$($property.Name)"
                try {
                    # Skip null properties
                    if ($null -eq $property.Value) {
                        Write-Host "DEBUG: Null property at $propPath" -ForegroundColor Gray
                        $hash[$property.Name] = $null
                    } else {
                        $hash[$property.Name] = ConvertTo-HashtableFromPSCustomObject -InputObject $property.Value -Path $propPath
                    }
                } catch {
                    Write-Host "DEBUG: Error converting property at $propPath : $($_.Exception.Message)" -ForegroundColor Red
                    $hash[$property.Name] = $property.Value  # Use original value if conversion fails
                }
            }
            return $hash
        } 
        # Return as-is for primitive types
        else { 
            return $InputObject 
        }
    }
}

# Simple configuration converter as fallback
function ConvertPSObjectToHashtable {
    param([PSCustomObject]$object)
    
    Write-Host "DEBUG: Using simple converter for object with properties: $($object.PSObject.Properties.Name -join ', ')" -ForegroundColor Cyan
    
    $hash = @{}
    $object.PSObject.Properties | ForEach-Object {
        Write-Host "DEBUG: Converting property '$($_.Name)' of type '$($_.TypeNameOfValue)'" -ForegroundColor Gray
        $hash[$_.Name] = $_.Value
    }
    return $hash
}

#===============================================================================
#                        MAIN EXECUTION BLOCK
#===============================================================================
try {
    Write-Host "`n=== ORCHESTRATOR MAIN EXECUTION BLOCK ===" -ForegroundColor Magenta
    Write-Host "DEBUG: Starting with Mode='$Mode', CompanyName='$CompanyName'" -ForegroundColor Cyan
    Write-Host "DEBUG: ConfigurationFile parameter: '$ConfigurationFile'" -ForegroundColor Cyan
    Write-Host "DEBUG: Force=$($Force.IsPresent), ValidateOnly=$($ValidateOnly.IsPresent)" -ForegroundColor Cyan
    
    # Check global context first
    Write-Host "`nDEBUG: Checking global context..." -ForegroundColor Yellow
    if ($null -eq $global:MandA) {
        Write-Host "ERROR: Global context is NULL!" -ForegroundColor Red
        throw "Global context not initialized"
    }
    Write-Host "DEBUG: Global context exists with keys: $($global:MandA.Keys -join ', ')" -ForegroundColor Green
    
    if ($null -eq $global:MandA.Config) {
        Write-Host "WARNING: Global config is NULL" -ForegroundColor Yellow
    } else {
        Write-Host "DEBUG: Global config type: $($global:MandA.Config.GetType().FullName)" -ForegroundColor Green
    }
    
    # Determine which configuration to use
    Write-Host "`nDEBUG: Determining configuration source..." -ForegroundColor Yellow
    
    if ($PSBoundParameters.ContainsKey('ConfigurationFile') -and -not [string]::IsNullOrWhiteSpace($ConfigurationFile)) {
        # Load from specified file
        $configPathToLoad = if ([System.IO.Path]::IsPathRooted($ConfigurationFile)) { 
            $ConfigurationFile 
        } else { 
            Join-Path $global:MandA.Paths.SuiteRoot $ConfigurationFile 
        }
        
        Write-Host "DEBUG: Loading configuration from file: $configPathToLoad" -ForegroundColor Cyan
        
        if (-not (Test-Path $configPathToLoad -PathType Leaf)) {
            throw "Specified configuration file '$configPathToLoad' not found."
        }
        
        try {
            Write-Host "DEBUG: Reading configuration file..." -ForegroundColor Gray
            $configContent = Get-Content -Path $configPathToLoad -Raw -ErrorAction Stop
            Write-Host "DEBUG: Config file size: $($configContent.Length) bytes" -ForegroundColor Gray
            
            Write-Host "DEBUG: Parsing JSON..." -ForegroundColor Gray
            $loadedConfig = $configContent | ConvertFrom-Json -ErrorAction Stop
            Write-Host "DEBUG: JSON parsed successfully. Type: $($loadedConfig.GetType().FullName)" -ForegroundColor Green
            
            # Show top-level properties
            if ($loadedConfig -is [PSCustomObject]) {
                Write-Host "DEBUG: Top-level properties: $($loadedConfig.PSObject.Properties.Name -join ', ')" -ForegroundColor Cyan
            }
        } catch {
            Write-Host "ERROR: Failed to load/parse configuration file: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "ERROR: Exception type: $($_.Exception.GetType().FullName)" -ForegroundColor Red
            throw
        }
        
        # Convert PSCustomObject to Hashtable
        if ($loadedConfig -is [PSCustomObject]) {
            Write-Host "`nDEBUG: Configuration is PSCustomObject, need to convert to Hashtable..." -ForegroundColor Yellow
            
            # Try complex converter first
            try {
                Write-Host "DEBUG: Attempting full recursive conversion..." -ForegroundColor Gray
                $script:CurrentConfig = ConvertTo-HashtableFromPSCustomObject -InputObject $loadedConfig -Path "CONFIG"
                Write-Host "DEBUG: Full conversion completed successfully!" -ForegroundColor Green
                Write-Host "DEBUG: Result type: $($script:CurrentConfig.GetType().FullName)" -ForegroundColor Green
                Write-Host "DEBUG: Top-level keys: $($script:CurrentConfig.Keys -join ', ')" -ForegroundColor Cyan
            } catch {
                Write-Host "WARNING: Full conversion failed: $($_.Exception.Message)" -ForegroundColor Yellow
                Write-Host "DEBUG: Attempting simple conversion..." -ForegroundColor Gray
                
                try {
                    $script:CurrentConfig = ConvertPSObjectToHashtable -object $loadedConfig
                    Write-Host "DEBUG: Simple conversion succeeded!" -ForegroundColor Green
                    Write-Host "DEBUG: Top-level keys: $($script:CurrentConfig.Keys -join ', ')" -ForegroundColor Cyan
                } catch {
                    Write-Host "ERROR: Even simple conversion failed: $($_.Exception.Message)" -ForegroundColor Red
                    Write-Host "DEBUG: Will use original PSCustomObject" -ForegroundColor Yellow
                    $script:CurrentConfig = $loadedConfig
                }
            }
        } else {
            Write-Host "DEBUG: Configuration is already type: $($loadedConfig.GetType().FullName)" -ForegroundColor Green
            $script:CurrentConfig = $loadedConfig
        }
    } else {
        # Use global config
        Write-Host "DEBUG: Using global configuration..." -ForegroundColor Cyan
        
        if ($null -eq $global:MandA.Config) {
            throw "Global configuration is null and no config file specified"
        }
        
        if ($global:MandA.Config -is [PSCustomObject]) {
            Write-Host "DEBUG: Global config is PSCustomObject, converting..." -ForegroundColor Yellow
            try {
                $script:CurrentConfig = ConvertTo-HashtableFromPSCustomObject -InputObject $global:MandA.Config -Path "GLOBAL_CONFIG"
                Write-Host "DEBUG: Global config conversion succeeded!" -ForegroundColor Green
            } catch {
                Write-Host "WARNING: Global config conversion failed: $($_.Exception.Message)" -ForegroundColor Yellow
                Write-Host "DEBUG: Using simple conversion..." -ForegroundColor Gray
                try {
                    $script:CurrentConfig = ConvertPSObjectToHashtable -object $global:MandA.Config
                    Write-Host "DEBUG: Simple conversion of global config succeeded!" -ForegroundColor Green
                } catch {
                    Write-Host "ERROR: Could not convert global config: $($_.Exception.Message)" -ForegroundColor Red
                    $script:CurrentConfig = $global:MandA.Config
                }
            }
        } else {
            Write-Host "DEBUG: Global config is already type: $($global:MandA.Config.GetType().FullName)" -ForegroundColor Green
            $script:CurrentConfig = $global:MandA.Config
        }
    }
    
    # Validate configuration loaded
    Write-Host "`nDEBUG: Validating loaded configuration..." -ForegroundColor Yellow
    if ($null -eq $script:CurrentConfig) {
        throw "Configuration has not been loaded. Ensure Set-SuiteEnvironment.ps1 has run or a valid ConfigurationFile is provided."
    }
    
    Write-Host "DEBUG: Configuration loaded successfully!" -ForegroundColor Green
    Write-Host "DEBUG: Configuration type: $($script:CurrentConfig.GetType().FullName)" -ForegroundColor Cyan
    
    # Check configuration structure
    Write-Host "`nDEBUG: Checking configuration structure..." -ForegroundColor Yellow
    if ($script:CurrentConfig -is [hashtable]) {
        Write-Host "DEBUG: Configuration is a hashtable with keys: $($script:CurrentConfig.Keys -join ', ')" -ForegroundColor Green
        
        # Check critical sections
        @('metadata', 'environment', 'discovery', 'processing', 'export') | ForEach-Object {
            if ($script:CurrentConfig.ContainsKey($_)) {
                Write-Host "DEBUG: Section '$_' exists" -ForegroundColor Green
            } else {
                Write-Host "WARNING: Section '$_' is missing!" -ForegroundColor Yellow
            }
        }
    } elseif ($script:CurrentConfig -is [PSCustomObject]) {
        $props = $script:CurrentConfig.PSObject.Properties.Name
        Write-Host "DEBUG: Configuration is a PSCustomObject with properties: $($props -join ', ')" -ForegroundColor Cyan
    } else {
        Write-Host "WARNING: Configuration is an unexpected type: $($script:CurrentConfig.GetType().FullName)" -ForegroundColor Yellow
    }
    
    # Update CompanyName
    Write-Host "`nDEBUG: Updating CompanyName in configuration..." -ForegroundColor Yellow
    try {
        $currentCompanyName = if ($script:CurrentConfig -is [hashtable]) {
            $script:CurrentConfig.metadata.companyName
        } else {
            $script:CurrentConfig.metadata.companyName
        }
        
        if ($currentCompanyName -ne $CompanyName) {
            Write-Host "DEBUG: Updating CompanyName from '$currentCompanyName' to '$CompanyName'" -ForegroundColor Cyan
            if ($script:CurrentConfig -is [hashtable]) {
                $script:CurrentConfig.metadata.companyName = $CompanyName
            } else {
                $script:CurrentConfig.metadata.companyName = $CompanyName
            }
        }
    } catch {
        Write-Host "WARNING: Could not update CompanyName: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    # Handle Force flag
    if ($Force.IsPresent) { 
        Write-Host "DEBUG: Force mode enabled, setting skipExistingFiles to false" -ForegroundColor Cyan
        if ($script:CurrentConfig -is [hashtable]) {
            $script:CurrentConfig.discovery.skipExistingFiles = $false
        } else {
            $script:CurrentConfig.discovery.skipExistingFiles = $false
        }
    }
    
    # Update global config
    Write-Host "`nDEBUG: Updating global configuration context..." -ForegroundColor Yellow
    $global:MandA.Config = $script:CurrentConfig
    Write-Host "DEBUG: Global configuration context updated" -ForegroundColor Green
    
    # Log suite start
    $version = if ($script:CurrentConfig -is [hashtable]) {
        $script:CurrentConfig.metadata.version
    } else {
        $script:CurrentConfig.metadata.version
    }
    Write-MandALog "M&A DISCOVERY SUITE v$version | Orchestrator v4.6.1" -Level "HEADER"
    Write-MandALog "Mode: $Mode | Company: $CompanyName" -Level "INFO"

    # Initialize environment for the specified mode
    Write-Host "`nDEBUG: Calling Initialize-MandAEnvironmentInternal..." -ForegroundColor Yellow
    Write-Host "DEBUG: Parameters: Mode=$Mode, ValidateOnly=$($ValidateOnly.IsPresent)" -ForegroundColor Cyan
    
    Initialize-MandAEnvironmentInternal -Configuration $script:CurrentConfig -CurrentMode $Mode -IsValidateOnlyMode:$ValidateOnly
    
    Write-Host "DEBUG: Environment initialization completed" -ForegroundColor Green
    
    if ($ValidateOnly.IsPresent) {
        Write-MandALog "Validation Only Mode: Environment checks complete." -Level SUCCESS
        $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
        exit 0
    }
    
    # Skip authentication for Processing or Export only modes
    if ($Mode -in "Discovery", "Full") {
        Write-Host "`nDEBUG: Mode requires authentication, setting up..." -ForegroundColor Yellow
        Write-MandALog "AUTHENTICATION & CONNECTION SETUP" -Level "HEADER"
        
        # ... [Authentication code remains the same] ...
    } else {
        Write-Host "DEBUG: Mode '$Mode' does not require authentication, skipping..." -ForegroundColor Cyan
    }

    # Execute phases based on mode
    Write-Host "`nDEBUG: Executing phases for mode: $Mode" -ForegroundColor Yellow
    
    if ($Mode -in "Discovery", "Full") {
        Write-Host "DEBUG: Invoking Discovery Phase..." -ForegroundColor Cyan
        Invoke-DiscoveryPhaseInternal -Configuration $script:CurrentConfig
        Write-Host "DEBUG: Discovery Phase completed" -ForegroundColor Green
    }
    
    if ($Mode -in "Processing", "Full") {
        Write-Host "DEBUG: Invoking Processing Phase..." -ForegroundColor Cyan
        Invoke-ProcessingPhaseInternal -Configuration $script:CurrentConfig
        Write-Host "DEBUG: Processing Phase completed" -ForegroundColor Green
    }
    
    if ($Mode -in "Export", "Full") {
        Write-Host "DEBUG: Invoking Export Phase..." -ForegroundColor Cyan
        Invoke-ExportPhaseInternal -Configuration $script:CurrentConfig
        Write-Host "DEBUG: Export Phase completed" -ForegroundColor Green
    }

    Write-Host "`nDEBUG: All phases completed successfully!" -ForegroundColor Green
    Complete-MandADiscoveryInternal -Configuration $script:CurrentConfig
} 
catch {
    Write-Host "`nERROR: Orchestrator encountered an error!" -ForegroundColor Red
    Write-Host "ERROR: Message: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "ERROR: Type: $($_.Exception.GetType().FullName)" -ForegroundColor Red
    Write-Host "ERROR: Target: $($_.Exception.TargetObject)" -ForegroundColor Red
    
    Write-MandALog "ORCHESTRATOR ERROR: $($_.Exception.Message)" -Level "ERROR"
    if ($_.ScriptStackTrace) { 
        Write-Host "`nDEBUG: Stack Trace:" -ForegroundColor Yellow
        Write-Host $_.ScriptStackTrace -ForegroundColor Gray
        Write-MandALog "Stack Trace: $($_.ScriptStackTrace)" -Level "DEBUG"
    }
    
    if ($Host.Name -eq "ConsoleHost") { 
        $Host.SetShouldExit(1)
        exit 1 
    } else { 
        throw 
    }
} 
finally {
    Write-Host "`nDEBUG: Entering cleanup phase..." -ForegroundColor Yellow
    Write-MandALog "Performing cleanup..." -Level INFO
    if (Get-Command 'Disconnect-AllServices' -ErrorAction SilentlyContinue) {
        try { 
            Disconnect-AllServices 
        } catch { 
            Write-MandALog "WARN: Error during service disconnection: $($_.Exception.Message)" -Level WARN
        }
    }
    Write-MandALog "Orchestrator execution completed at $(Get-Date)" -Level INFO
    Write-Host "DEBUG: Orchestrator finished" -ForegroundColor Green
    $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
}

