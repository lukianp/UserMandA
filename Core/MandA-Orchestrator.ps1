#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite v4.2.1 - Main Orchestrator
.DESCRIPTION
    Unified orchestrator for discovery, processing, and export.
    Now with more robust module loading and pre-flight dependency checks.
.NOTES
    Version: 4.2.1
    Author: Gemini & User
    Date: 2025-06-01
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$ConfigurationFile = "Configuration/default-config.json", # Relative to SuiteRoot
    [Parameter(Mandatory=$false)]
    [ValidateSet("Discovery", "Processing", "Export", "Full")]
    [string]$Mode = "Full",
    [Parameter(Mandatory=$false)]
    [switch]$Force, # Overrides skipExistingFiles in config for discovery
    [Parameter(Mandatory=$false)]
    [switch]$ValidateOnly # Validates config and prerequisites then exits
)

# This script expects $global:MandA to be set by Set-SuiteEnvironment.ps1
if ($null -eq $global:MandA -or $null -eq $global:MandA.Paths) {
    Write-Error "CRITICAL: The global context `$global:MandA (with Paths) is not set. Please run this script via QuickStart.ps1 or ensure Set-SuiteEnvironment.ps1 has been sourced correctly."
    exit 1
}

# --- Core Orchestration Functions ---

function Initialize-MandAEnvironmentInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [string]$CurrentMode,
        [Parameter(Mandatory=$false)]
        [switch]$IsValidateOnlyMode
    )
    Write-MandALog "Initializing M&A Discovery Environment for Mode: $CurrentMode" -Level "HEADER"

    # 1. Initialize Logging (should already be done if Write-MandALog is working, but good to confirm)
    if (-not (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
        $loggingModulePath = Join-Path $global:MandA.Paths.Utilities "EnhancedLogging.psm1"
        if (Test-Path $loggingModulePath) { Import-Module $loggingModulePath -Force -Global }
        else { Write-Warning "EnhancedLogging.psm1 not found. Logging will be basic."; function Write-MandALog { param([string]$Message) Write-Host $Message } }
    }
    Initialize-Logging -Configuration $Configuration # From EnhancedLogging.psm1

    # 2. Initialize Output Directories
    if (-not (Initialize-OutputDirectories -Configuration $Configuration)) { # From FileOperations.psm1
        throw "Failed to initialize output directories. Check permissions and paths in config."
    }

    # 3. CRITICAL: PowerShell Module Dependency Check
    Write-MandALog "Performing PowerShell module dependency check..." -Level "INFO"
    $moduleCheckScriptPath = $global:MandA.Paths.ModuleCheckScript
    if (Test-Path $moduleCheckScriptPath) {
        try {
            # Run with AutoFix and Silent for non-interactive fixing during orchestration.
            # If a critical module still can't be installed, this will throw, halting the orchestrator.
            & $moduleCheckScriptPath -AutoFix -Silent -ErrorAction Stop
            Write-MandALog "PowerShell module dependency check completed." -Level "SUCCESS"
        } catch {
            Write-MandALog "PowerShell module dependency check failed: $($_.Exception.Message). Orchestrator cannot continue if critical modules are missing." -Level "ERROR"
            throw "Module dependencies not met: $($_.Exception.Message)"
        }
    } else {
        Write-MandALog "DiscoverySuiteModuleCheck.ps1 not found at '$moduleCheckScriptPath'. Cannot verify module dependencies." -Level "ERROR"
        throw "Module check script is missing."
    }
    
    # 4. System Prerequisites (basic checks, module check is more comprehensive for PS modules)
    if (-not (Test-Prerequisites -Configuration $Configuration -ValidateOnly:$IsValidateOnlyMode.IsPresent)) { # From ValidationHelpers.psm1
        throw "System prerequisites validation failed."
    }

    # 5. Dynamically Load Discovery Modules based on Configured 'enabledSources' for Discovery Mode
    # Other modes (Processing, Export) will load their specific modules as needed or assume data exists.
    if ($CurrentMode -in "Discovery", "Full") {
        $discoveryModulePathBase = Join-Path $global:MandA.Paths.Modules "Discovery"
        $enabledSources = @($Configuration.discovery.enabledSources)
        
        Write-MandALog "Dynamically loading discovery modules for $($enabledSources.Count) enabled sources..." -Level "INFO"
        $loadedCount = 0
        foreach ($sourceName in $enabledSources) {
            $moduleFileName = "$($sourceName)Discovery.psm1" # Convention: FileServer -> FileServerDiscovery.psm1
            $fullModulePath = Join-Path $discoveryModulePathBase $moduleFileName
            
            if (Test-Path $fullModulePath -PathType Leaf) {
                try {
                    Import-Module $fullModulePath -Force -Global -ErrorAction Stop
                    Write-MandALog "Loaded module: $moduleFileName" -Level "SUCCESS"
                    $loadedCount++
                } catch {
                    Write-MandALog "Failed to load discovery module '$moduleFileName': $($_.Exception.Message). Discovery for '$sourceName' might be affected." -Level "ERROR"
                    # Depending on strictness, you might choose to throw here if a critical source module fails.
                }
            } else {
                Write-MandALog "Module file not found for enabled source '$sourceName': $fullModulePath. Skipping." -Level "WARN"
            }
        }
        Write-MandALog "Finished loading $loadedCount discovery modules." -Level "INFO"
    }
    # Other utility modules (Processing, Export) are typically imported directly by their consumer functions or phases.

    Write-MandALog "Environment initialization completed." -Level "SUCCESS"
    return $true
}

function Invoke-DiscoveryPhaseInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "--- Starting Discovery Phase ---" -Level "HEADER"
    $discoveryResults = @{}
    $enabledSources = @($Configuration.discovery.enabledSources)

    foreach ($sourceName in $enabledSources) {
        $invokeFunctionName = "Invoke-$($sourceName)Discovery" # Convention
        if (Get-Command $invokeFunctionName -ErrorAction SilentlyContinue) {
            Write-MandALog "Invoking $invokeFunctionName for source '$sourceName'..." -Level "INFO"
            try {
                $sourceResult = & $invokeFunctionName -Configuration $Configuration -ErrorAction Stop
                $discoveryResults[$sourceName] = $sourceResult
                Write-MandALog "Finished discovery for source '$sourceName'." -Level "SUCCESS"
            } catch {
                Write-MandALog "Error during discovery for source '$sourceName': $($_.Exception.Message)" -Level "ERROR"
                $discoveryResults[$sourceName] = @{ Error = $_.Exception.Message } # Log error for this source
            }
        } else {
            Write-MandALog "Discovery function '$invokeFunctionName' not found for enabled source '$sourceName'. Module might be missing or not loaded correctly." -Level "WARN"
        }
    }
    Write-MandALog "--- Discovery Phase Completed ---" -Level "SUCCESS"
    return $discoveryResults
}

function Invoke-ProcessingPhaseInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)] # Expects path to the "Raw" data directory
        [string]$RawDataPath 
    )
    Write-MandALog "--- Starting Processing Phase ---" -Level "HEADER"
    # Placeholder: Load Processing modules (e.g., DataAggregation.psm1)
    # $processingModule = Join-Path $global:MandA.Paths.Modules "Processing/DataAggregation.psm1"
    # if(Test-Path $processingModule){ Import-Module $processingModule -Force -Global } else { throw "DataAggregation module missing!"}
    # $processedData = Invoke-DataAggregation -RawDataPath $RawDataPath -Configuration $Configuration
    # ... and so on for UserProfileBuilder, WaveGeneration, DataValidation
    Write-MandALog "Processing phase logic to be fully implemented here." -Level "INFO"
    Write-MandALog "Assuming data is read from: $RawDataPath" -Level "DEBUG"
    # For now, return a placeholder
    $processedData = @{ UserProfiles = @(); MigrationWaves = @(); Status = "Processing Phase Placeholder" }
    Write-MandALog "--- Processing Phase (Placeholder) Completed ---" -Level "SUCCESS"
    return $processedData
}

function Invoke-ExportPhaseInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [hashtable]$ProcessedData # Expects output from Processing phase
    )
    Write-MandALog "--- Starting Export Phase ---" -Level "HEADER"
    # Placeholder: Load Export modules (e.g., CSVExport.psm1, JSONExport.psm1)
    # Invoke-CSVExport -ProcessedData $ProcessedData -Configuration $Configuration
    # Invoke-JSONExport -ProcessedData $ProcessedData -Configuration $Configuration
    Write-MandALog "Export phase logic to be fully implemented here." -Level "INFO"
    Write-MandALog "Data to export: $($ProcessedData.Keys -join ', ')" -Level "DEBUG"
    Write-MandALog "--- Export Phase (Placeholder) Completed ---" -Level "SUCCESS"
    return $true
}

function Complete-MandADiscoveryInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "--- Finalizing M&A Discovery Suite Execution ---" -Level "HEADER"
    # Generate final metrics, cleanup temp files, etc.
    Write-MandALog "Execution completed. Review logs and output files." -Level "SUCCESS"
}

# --- Main Execution Block ---
try {
    # Load essential utility modules needed by the orchestrator itself
    Import-Module (Join-Path $global:MandA.Paths.Utilities "EnhancedLogging.psm1") -Force -Global
    Import-Module (Join-Path $global:MandA.Paths.Utilities "FileOperations.psm1") -Force -Global
    Import-Module (Join-Path $global:MandA.Paths.Utilities "ValidationHelpers.psm1") -Force -Global
    Import-Module (Join-Path $global:MandA.Paths.Utilities "ConfigurationValidation.psm1") -Force -Global # For schema validation if used directly
    Import-Module (Join-Path $global:MandA.Paths.Modules "Authentication/Authentication.psm1") -Force -Global
    Import-Module (Join-Path $global:MandA.Paths.Modules "Connectivity/EnhancedConnectionManager.psm1") -Force -Global


    $script:CurrentConfig = $global:MandA.Config # Use the already loaded and validated config
    if ($Force.IsPresent) { 
        Write-MandALog "Force parameter specified: 'discovery.skipExistingFiles' will be treated as false for this run." -Level "INFO"
        $script:CurrentConfig.discovery.skipExistingFiles = $false 
    }
    
    Write-MandALog "M&A Discovery Suite v$($script:CurrentConfig.metadata.version) - Orchestrator (v4.2.1)" -Level "HEADER"
    Write-MandALog "Mode: $Mode | Config: $($global:MandA.Paths.ConfigFile)" -Level "INFO"

    # Initialize Environment (includes module loading for discovery mode)
    Initialize-MandAEnvironmentInternal -Configuration $script:CurrentConfig -CurrentMode $Mode -IsValidateOnlyMode:$ValidateOnly.IsPresent
    
    if ($ValidateOnly.IsPresent) {
        Write-MandALog "Validation Only Mode: Environment checks complete. Exiting." -Level "SUCCESS"
        exit 0
    }
    
    # Authentication and Connection (critical steps)
    $authContext = Initialize-MandAAuthentication -Configuration $script:CurrentConfig
    if ($null -eq $authContext -or -not $authContext.Authenticated) { throw "Authentication failed. Orchestrator cannot proceed." }

    $connectionStatus = Initialize-AllConnections -Configuration $script:CurrentConfig -AuthContext $authContext
    if ($null -eq $connectionStatus) { throw "Connection initialization failed critically."}
    
    $criticalFailure = $false
    $haltSources = @($script:CurrentConfig.environment.connectivity.haltOnConnectionError)
    foreach($service in $haltSources) {
        if ($connectionStatus.ContainsKey($service) -and (-not $connectionStatus.$service.Connected)) {
            Write-MandALog "CRITICAL FAILURE: Connection to required service '$service' failed. Halting execution as per configuration." -Level "ERROR"
            $criticalFailure = $true
        } elseif (-not $connectionStatus.ContainsKey($service) -and $haltSources -contains $service) {
            # This case handles if a service in haltOnConnectionError was never even attempted or its status object wasn't created.
             Write-MandALog "CRITICAL FAILURE: Status for required service '$service' (in haltOnConnectionError) not found. Assuming connection failed. Halting." -Level "ERROR"
            $criticalFailure = $true
        }
    }
    if ($criticalFailure) { throw "Halting due to critical connection failure(s)." }

    # --- Phase Execution ---
    $discoveryOutput = $null
    $processingOutput = $null

    if ($Mode -in "Discovery", "Full") {
        $discoveryOutput = Invoke-DiscoveryPhaseInternal -Configuration $script:CurrentConfig
    }
    
    if ($Mode -in "Processing", "Full") {
        $rawPathForProcessing = $global:MandA.Paths.RawDataOutput
        if (($Mode -eq "Processing") -and ($null -eq $discoveryOutput)) {
            Write-MandALog "Processing mode selected. Will attempt to use existing data from '$rawPathForProcessing'." -Level "INFO"
        } elseif ($Mode -eq "Full" -and ($null -eq $discoveryOutput)) {
             Write-MandALog "Full mode selected, but discovery output is null. Processing may fail or use existing raw data." -Level "WARN"
        }
        $processingOutput = Invoke-ProcessingPhaseInternal -Configuration $script:CurrentConfig -RawDataPath $rawPathForProcessing
    }
    
    if ($Mode -in "Export", "Full") {
        if (($Mode -eq "Export") -and ($null -eq $processingOutput)) {
            Write-MandALog "Export mode selected. Will attempt to use existing data from '$($global:MandA.Paths.ProcessedDataOutput)' or processing phase output if available." -Level "INFO"
            # If processingOutput is null here, Export phase needs to be robust enough to load from disk or handle it.
        } elseif ($Mode -eq "Full" -and ($null -eq $processingOutput)) {
             Write-MandALog "Full mode selected, but processing output is null. Export may fail or use existing processed data." -Level "WARN"
        }
        Invoke-ExportPhaseInternal -Configuration $script:CurrentConfig -ProcessedData $processingOutput # Pass null if processing didn't run or failed
    }

    Complete-MandADiscoveryInternal -Configuration $script:CurrentConfig

} catch {
    Write-MandALog "ORCHESTRATOR CRITICAL ERROR: $($_.Exception.Message)" -Level "ERROR"
    if ($_.ScriptStackTrace) { Write-MandALog "Stack Trace: $($_.ScriptStackTrace)" -Level "DEBUG" }
    # Ensure exit code is non-zero for failures
    if ($Host.Name -eq "ConsoleHost") { $Host.SetShouldExit(1); exit 1 } else { throw }
} finally {
    if (Get-Command 'Disconnect-AllServices' -ErrorAction SilentlyContinue) {
        Disconnect-AllServices # From EnhancedConnectionManager.psm1
    }
    Write-MandALog "Orchestrator execution finished at $(Get-Date)." -Level "INFO"
}
