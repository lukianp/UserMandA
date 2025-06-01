#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite v4.2.2 - Main Orchestrator
.DESCRIPTION
    Unified orchestrator for discovery, processing, and export.
    Enhanced module import checks and logging.
.NOTES
    Version: 4.2.2
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

# Ensure script halts on terminating errors for critical operations
$OriginalErrorActionPreferenceOrchestrator = $ErrorActionPreference
$ErrorActionPreference = "Stop"

# This script expects $global:MandA to be set by Set-SuiteEnvironment.ps1 (or embedded in QuickStart)
if ($null -eq $global:MandA -or $null -eq $global:MandA.Paths) {
    Write-Error "CRITICAL: The global context `$global:MandA (with Paths) is not set. Please run this script via QuickStart.ps1 or ensure Set-SuiteEnvironment.ps1 has been sourced correctly."
    $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
    exit 1
}

# --- Import Core Utility Modules (Essential for Orchestrator Operation) ---
# These are imported first as the orchestrator relies on them directly.
Write-Host "--- Orchestrator: Importing Core Utility Modules ---" -ForegroundColor DarkCyan
$utilityModulesToImport = @(
    "EnhancedLogging.psm1",
    "FileOperations.psm1",
    "ValidationHelpers.psm1",
    "ConfigurationValidation.psm1", # For schema validation if used directly by orchestrator logic
    "ErrorHandling.psm1" # If you have specific error handling utilities here
)
foreach ($moduleName in $utilityModulesToImport) {
    $modulePath = Join-Path $global:MandA.Paths.Utilities $moduleName
    if (Test-Path $modulePath -PathType Leaf) {
        try {
            Write-Host "Importing utility module: $modulePath" -ForegroundColor Gray
            Import-Module $modulePath -Force -Global -ErrorAction Stop
            Write-Host "Successfully imported $moduleName" -ForegroundColor DarkGreen
        } catch {
            Write-Error "CRITICAL: Failed to import essential utility module '$moduleName' from '$modulePath'. Error: $($_.Exception.Message). Orchestrator cannot continue."
            $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
            exit 1
        }
    } else {
        Write-Error "CRITICAL: Essential utility module '$moduleName' not found at '$modulePath'. Orchestrator cannot continue."
        $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
        exit 1
    }
}

# Specifically verify critical functions after import
if (-not (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
    Write-Error "CRITICAL: Write-MandALog function not found after importing EnhancedLogging.psm1. Logging will fail."
    $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
    exit 1
}
if (-not (Get-Command Initialize-OutputDirectories -ErrorAction SilentlyContinue)) {
    Write-Error "CRITICAL: Initialize-OutputDirectories function not found after importing FileOperations.psm1."
    $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
    exit 1
}
if (-not (Get-Command Test-Prerequisites -ErrorAction SilentlyContinue)) {
    Write-Error "CRITICAL: Test-Prerequisites function not found after importing ValidationHelpers.psm1."
    $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
    exit 1
}

# Import Authentication and Connectivity Managers - also essential for orchestrator setup
try {
    Write-Host "Importing Authentication module..." -ForegroundColor Gray
    Import-Module (Join-Path $global:MandA.Paths.Modules "Authentication/Authentication.psm1") -Force -Global -ErrorAction Stop
    Write-Host "Successfully imported Authentication.psm1" -ForegroundColor DarkGreen

    Write-Host "Importing EnhancedConnectionManager module..." -ForegroundColor Gray
    Import-Module (Join-Path $global:MandA.Paths.Modules "Connectivity/EnhancedConnectionManager.psm1") -Force -Global -ErrorAction Stop
    Write-Host "Successfully imported EnhancedConnectionManager.psm1" -ForegroundColor DarkGreen
} catch {
    Write-Error "CRITICAL: Failed to import Authentication or ConnectionManager modules. Error: $($_.Exception.Message). Orchestrator cannot continue."
    $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
    exit 1
}
if (-not (Get-Command Initialize-MandAAuthentication -ErrorAction SilentlyContinue) -or -not (Get-Command Initialize-AllConnections -ErrorAction SilentlyContinue)) {
    Write-Error "CRITICAL: Core Authentication/Connection functions not found after module imports."
    $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
    exit 1
}
Write-Host "--- Orchestrator: Core Utility Modules Imported Successfully ---" -ForegroundColor DarkCyan


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

    Initialize-Logging -Configuration $Configuration 
    if (-not (Initialize-OutputDirectories -Configuration $Configuration)) { 
        throw "Failed to initialize output directories. Check permissions and paths in config."
    }

    Write-MandALog "Performing PowerShell module dependency check via DiscoverySuiteModuleCheck.ps1..." -Level "INFO"
    $moduleCheckScriptPath = $global:MandA.Paths.ModuleCheckScript
    if (Test-Path $moduleCheckScriptPath) {
        try {
            & $moduleCheckScriptPath -AutoFix -Silent -ErrorAction Stop # Run silently during orchestration
            Write-MandALog "PowerShell module dependency check completed." -Level "SUCCESS"
        } catch {
            Write-MandALog "PowerShell module dependency check failed: $($_.Exception.Message). Orchestrator cannot continue if critical modules are missing." -Level "ERROR"
            throw "Module dependencies not met: $($_.Exception.Message)"
        }
    } else {
        Write-MandALog "DiscoverySuiteModuleCheck.ps1 not found at '$moduleCheckScriptPath'. Cannot verify module dependencies." -Level "ERROR"
        throw "Module check script is missing."
    }
    
    if (-not (Test-Prerequisites -Configuration $Configuration -ValidateOnly:$IsValidateOnlyMode.IsPresent)) { 
        throw "System prerequisites validation failed."
    }

    if ($CurrentMode -in "Discovery", "Full") {
        $discoveryModulePathBase = Join-Path $global:MandA.Paths.Modules "Discovery"
        $enabledSources = @($Configuration.discovery.enabledSources)
        
        Write-MandALog "Dynamically loading discovery modules for $($enabledSources.Count) enabled sources..." -Level "INFO"
        $loadedCount = 0
        foreach ($sourceName in $enabledSources) {
            $moduleFileName = "$($sourceName)Discovery.psm1" 
            $fullModulePath = Join-Path $discoveryModulePathBase $moduleFileName
            
            if (Test-Path $fullModulePath -PathType Leaf) {
                try {
                    Import-Module $fullModulePath -Force -Global -ErrorAction Stop
                    Write-MandALog "Loaded module: $moduleFileName" -Level "SUCCESS"
                    $loadedCount++
                } catch {
                    Write-MandALog "Failed to load discovery module '$moduleFileName': $($_.Exception.Message). Discovery for '$sourceName' might be affected." -Level "ERROR"
                }
            } else {
                Write-MandALog "Module file not found for enabled source '$sourceName': $fullModulePath. Skipping." -Level "WARN"
            }
        }
        Write-MandALog "Finished loading $loadedCount discovery modules." -Level "INFO"
    }
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
        $invokeFunctionName = "Invoke-$($sourceName)Discovery" 
        if (Get-Command $invokeFunctionName -ErrorAction SilentlyContinue) {
            Write-MandALog "Invoking $invokeFunctionName for source '$sourceName'..." -Level "INFO"
            try {
                $sourceResult = & $invokeFunctionName -Configuration $Configuration -ErrorAction Stop
                $discoveryResults[$sourceName] = $sourceResult
                Write-MandALog "Finished discovery for source '$sourceName'." -Level "SUCCESS"
            } catch {
                Write-MandALog "Error during discovery for source '$sourceName': $($_.Exception.Message)" -Level "ERROR"
                $discoveryResults[$sourceName] = @{ Error = $_.Exception.Message } 
            }
        } else {
            Write-MandALog "Discovery function '$invokeFunctionName' not found for enabled source '$sourceName'. Module might be missing, not loaded correctly, or not in enabledSources." -Level "WARN"
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
        [Parameter(Mandatory=$true)] 
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
        [hashtable]$ProcessedData 
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
    Write-MandALog "Execution completed. Review logs at '$($global:MandA.Paths.LogOutput)' and output files in '$($Configuration.environment.outputPath)'." -Level "SUCCESS"
}

# --- Main Execution Block ---
try {
    $script:CurrentConfig = $global:MandA.Config 
    if ($Force.IsPresent) { 
        Write-MandALog "Force parameter specified: 'discovery.skipExistingFiles' will be treated as false for this run." -Level "INFO"
        $script:CurrentConfig.discovery.skipExistingFiles = $false 
    }
    
    Write-MandALog "M&A Discovery Suite v$($script:CurrentConfig.metadata.version) - Orchestrator (v4.2.2)" -Level "HEADER"
    Write-MandALog "Mode: $Mode | Config: $($global:MandA.Paths.ConfigFile)" -Level "INFO"

    Initialize-MandAEnvironmentInternal -Configuration $script:CurrentConfig -CurrentMode $Mode -IsValidateOnlyMode:$ValidateOnly.IsPresent
    
    if ($ValidateOnly.IsPresent) {
        Write-MandALog "Validation Only Mode: Environment checks complete. Exiting." -Level "SUCCESS"
        $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
        exit 0
    }
    
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
             Write-MandALog "CRITICAL FAILURE: Status for required service '$service' (in haltOnConnectionError) not found. Assuming connection failed. Halting." -Level "ERROR"
            $criticalFailure = $true
        }
    }
    if ($criticalFailure) { throw "Halting due to critical connection failure(s)." }

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
        } elseif ($Mode -eq "Full" -and ($null -eq $processingOutput)) {
             Write-MandALog "Full mode selected, but processing output is null. Export may fail or use existing processed data." -Level "WARN"
        }
        Invoke-ExportPhaseInternal -Configuration $script:CurrentConfig -ProcessedData $processingOutput 
    }

    Complete-MandADiscoveryInternal -Configuration $script:CurrentConfig

} catch {
    Write-MandALog "ORCHESTRATOR CRITICAL ERROR: $($_.Exception.Message)" -Level "ERROR"
    if ($_.ScriptStackTrace) { Write-MandALog "Stack Trace: $($_.ScriptStackTrace)" -Level "DEBUG" }
    if ($Host.Name -eq "ConsoleHost") { $Host.SetShouldExit(1); exit 1 } else { throw }
} finally {
    if (Get-Command 'Disconnect-AllServices' -ErrorAction SilentlyContinue) {
        Disconnect-AllServices 
    }
    Write-MandALog "Orchestrator execution finished at $(Get-Date)." -Level "INFO"
    $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
}
