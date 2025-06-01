#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Main Orchestrator

.DESCRIPTION
    Unified orchestrator for discovery, processing, and export.
    Ensures both Authentication and CredentialManagement modules are loaded.
    Includes enhanced diagnostics for authentication failures.

.NOTES
    Version: 4.2.5
    Author: Gemini & User
    Date: 2025-06-01
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$ConfigurationFile = "Configuration/default-config.json", 
    
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

# Ensure script halts on terminating errors for critical operations
$OriginalErrorActionPreferenceOrchestrator = $ErrorActionPreference
$ErrorActionPreference = "Stop"

# This script expects $global:MandA to be set by Set-SuiteEnvironment.ps1 (or embedded in QuickStart)
if ($null -eq $global:MandA -or $null -eq $global:MandA.Paths) {
    Write-Error "CRITICAL: The global context `$global:MandA (with Paths) is not set. Please run this script via QuickStart.ps1 or ensure Set-SuiteEnvironment.ps1 has been sourced correctly."
    $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
    exit 1
}

#===============================================================================
#                   CORE UTILITY MODULES IMPORT
#===============================================================================
# These are imported first as the orchestrator relies on them directly.

Write-Host "--- Orchestrator: Importing Core Utility Modules ---" -ForegroundColor DarkCyan

$utilityModulesToImport = @(
    "EnhancedLogging.psm1",
    "FileOperations.psm1",
    "ValidationHelpers.psm1",
    "ConfigurationValidation.psm1", 
    "ErrorHandling.psm1" 
)

foreach ($moduleName_util in $utilityModulesToImport) { # Renamed $moduleName
    $modulePath_util = Join-Path $global:MandA.Paths.Utilities $moduleName_util # Renamed $modulePath
    
    if (Test-Path $modulePath_util -PathType Leaf) {
        try {
            Write-Host "Importing utility module: $modulePath_util" -ForegroundColor Gray
            Import-Module $modulePath_util -Force -Global -ErrorAction Stop
            Write-Host "Successfully imported $moduleName_util" -ForegroundColor DarkGreen
        } 
        catch {
            Write-Error "CRITICAL: Failed to import essential utility module '$moduleName_util' from '$modulePath_util'. Error: $($_.Exception.Message). Orchestrator cannot continue."
            $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
            exit 1
        }
    } 
    else {
        Write-Error "CRITICAL: Essential utility module '$moduleName_util' not found at '$modulePath_util'. Orchestrator cannot continue."
        $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
        exit 1
    }
}

#-------------------------------------------------------------------------------
# Verify critical functions after import
#-------------------------------------------------------------------------------

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

#===============================================================================
#                    AUTHENTICATION MODULES IMPORT
#===============================================================================
# Import Authentication.psm1 AND CredentialManagement.psm1

Write-Host "Importing Authentication modules..." -ForegroundColor DarkCyan

$authModulesToImport = @(
    "Authentication/Authentication.psm1",
    "Authentication/CredentialManagement.psm1" 
)

foreach ($authModuleRelPath_item in $authModulesToImport) { # Renamed $authModuleRelPath
    $authModulePath_item = Join-Path $global:MandA.Paths.Modules $authModuleRelPath_item # Renamed $authModulePath
    
    if (Test-Path $authModulePath_item -PathType Leaf) {
        try {
            Write-Host "Importing auth module: $authModulePath_item" -ForegroundColor Gray
            Import-Module $authModulePath_item -Force -Global -ErrorAction Stop
            Write-Host "Successfully imported $(Split-Path $authModulePath_item -Leaf)" -ForegroundColor DarkGreen
        } 
        catch {
            Write-Error "CRITICAL: Failed to import auth module '$authModuleRelPath_item'. Error: $($_.Exception.Message). Orchestrator cannot continue."
            $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
            exit 1
        }
    } 
    else {
        Write-Error "CRITICAL: Auth module '$authModuleRelPath_item' not found at '$authModulePath_item'. Orchestrator cannot continue."
        $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
        exit 1
    }
}

#===============================================================================
#                    CONNECTIVITY MANAGER IMPORT
#===============================================================================

try {
    $connManagerPath_local = Join-Path $global:MandA.Paths.Modules "Connectivity/EnhancedConnectionManager.psm1" # Renamed $connManagerPath
    
    if (Test-Path $connManagerPath_local -PathType Leaf) { 
        Write-Host "Importing EnhancedConnectionManager..." -ForegroundColor Gray
        Import-Module $connManagerPath_local -Force -Global -ErrorAction Stop
        Write-Host "Successfully imported EnhancedConnectionManager.psm1" -ForegroundColor DarkGreen
    } 
    else { 
        throw "EnhancedConnectionManager.psm1 not found at '$connManagerPath_local'"
    }
} 
catch {
    Write-Error "CRITICAL: Failed to import EnhancedConnectionManager. Error: $($_.Exception.Message). Orchestrator cannot continue."
    $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
    exit 1
}

#-------------------------------------------------------------------------------
# Verify critical auth functions
#-------------------------------------------------------------------------------

if (-not (Get-Command Initialize-MandAAuthentication -ErrorAction SilentlyContinue)) {
    Write-Error "CRITICAL: Initialize-MandAAuthentication function not found after module imports."
    $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
    exit 1
}

if (-not (Get-Command Get-SecureCredentials -ErrorAction SilentlyContinue)) {
    Write-Error "CRITICAL: Get-SecureCredentials function not found after module imports. This is essential for authentication."
    $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
    exit 1 
}

if (-not (Get-Command Initialize-AllConnections -ErrorAction SilentlyContinue)) {
    Write-Error "CRITICAL: Initialize-AllConnections function not found after module imports."
    $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
    exit 1
}

Write-Host "--- Orchestrator: Core Utility & Auth Modules Imported Successfully ---" -ForegroundColor DarkCyan

#===============================================================================
#                    CORE ORCHESTRATION FUNCTIONS
#===============================================================================

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
    $moduleCheckScriptPath_local = $global:MandA.Paths.ModuleCheckScript # Renamed
    if (Test-Path $moduleCheckScriptPath_local -PathType Leaf) { 
        try {
            & $moduleCheckScriptPath_local -AutoFix -Silent -ErrorAction Stop 
            Write-MandALog "PowerShell module dependency check completed." -Level "SUCCESS"
        } catch {
            Write-MandALog "PowerShell module dependency check failed: $($_.Exception.Message). Orchestrator cannot continue if critical modules are missing." -Level "ERROR"
            throw "Module dependencies not met: $($_.Exception.Message)"
        }
    } else {
        Write-MandALog "DiscoverySuiteModuleCheck.ps1 not found at '$moduleCheckScriptPath_local'. Cannot verify module dependencies." -Level "ERROR"
        throw "Module check script is missing."
    }
    
    if (-not (Test-Prerequisites -Configuration $Configuration -ValidateOnly:$IsValidateOnlyMode)) { 
        throw "System prerequisites validation failed."
    }

    if ($CurrentMode -in "Discovery", "Full") {
        $discoveryModulePathBase = Join-Path $global:MandA.Paths.Modules "Discovery"
        $enabledSources = @($Configuration.discovery.enabledSources)
        
        Write-MandALog "Dynamically loading discovery modules for $($enabledSources.Count) enabled sources..." -Level "INFO"
        $loadedCount = 0
        foreach ($sourceName_item in $enabledSources) { # Renamed $sourceName
            $moduleFileName = "$($sourceName_item)Discovery.psm1" 
            $fullModulePath = Join-Path $discoveryModulePathBase $moduleFileName
            
            if (Test-Path $fullModulePath -PathType Leaf) {
                try {
                    Import-Module $fullModulePath -Force -Global -ErrorAction Stop
                    Write-MandALog "Loaded module: $moduleFileName" -Level "SUCCESS"
                    $loadedCount++
                } catch {
                    Write-MandALog "Failed to load discovery module '$moduleFileName': $($_.Exception.Message). Discovery for '$sourceName_item' might be affected." -Level "ERROR"
                }
            } else {
                Write-MandALog "Module file not found for enabled source '$sourceName_item': $fullModulePath. Skipping." -Level "WARN"
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
    $enabledSources_disc = @($Configuration.discovery.enabledSources) # Renamed

    foreach ($sourceName_disc in $enabledSources_disc) { # Renamed
        $invokeFunctionName = "Invoke-$($sourceName_disc)Discovery" 
        if (Get-Command $invokeFunctionName -ErrorAction SilentlyContinue) {
            Write-MandALog "Invoking $invokeFunctionName for source '$sourceName_disc'..." -Level "INFO"
            try {
                $sourceResult = & $invokeFunctionName -Configuration $Configuration -ErrorAction Stop
                $discoveryResults[$sourceName_disc] = $sourceResult
                Write-MandALog "Finished discovery for source '$sourceName_disc'." -Level "SUCCESS"
            } catch {
                Write-MandALog "Error during discovery for source '$sourceName_disc': $($_.Exception.Message)" -Level "ERROR"
                $discoveryResults[$sourceName_disc] = @{ Error = $_.Exception.Message } 
            }
        } else {
            Write-MandALog "Discovery function '$invokeFunctionName' not found for enabled source '$sourceName_disc'. Module might be missing, not loaded correctly, or not in enabledSources." -Level "WARN"
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
    Write-MandALog "Processing phase logic (placeholder)." -Level "INFO"
    Write-MandALog "Data from: $RawDataPath" -Level "DEBUG"
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
    Write-MandALog "Export phase logic (placeholder)." -Level "INFO"
    if ($null -ne $ProcessedData) {
        Write-MandALog "Data to export: $($ProcessedData.Keys -join ', ')" -Level "DEBUG"
    } else {
        Write-MandALog "No processed data provided to export phase." -Level "WARN"
    }
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

#===============================================================================
#                        MAIN EXECUTION BLOCK
#===============================================================================

try {
    #---------------------------------------------------------------------------
    # Configuration Setup
    #---------------------------------------------------------------------------
    $script:CurrentConfig = $global:MandA.Config 
    
    if ($Force.IsPresent) { 
        Write-MandALog "Force parameter specified: 'discovery.skipExistingFiles' will be treated as false for this run." -Level "INFO"
        $script:CurrentConfig.discovery.skipExistingFiles = $false 
    }
    
    #---------------------------------------------------------------------------
    # Suite Header
    #---------------------------------------------------------------------------
    Write-MandALog "M&A Discovery Suite v$($script:CurrentConfig.metadata.version) - Orchestrator (v4.2.5)" -Level "HEADER"
    Write-MandALog "Mode: $Mode | Config: $($global:MandA.Paths.ConfigFile)" -Level "INFO"

    #---------------------------------------------------------------------------
    # Environment Initialization
    #---------------------------------------------------------------------------
    Initialize-MandAEnvironmentInternal -Configuration $script:CurrentConfig -CurrentMode $Mode -IsValidateOnlyMode:$ValidateOnly
    
    if ($ValidateOnly.IsPresent) {
        Write-MandALog "Validation Only Mode: Environment checks complete. Exiting." -Level "SUCCESS"
        $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
        exit 0
    }
    
    #---------------------------------------------------------------------------
    # Authentication & Connection Setup
    #---------------------------------------------------------------------------
    $authContext = $null # Ensure $authContext is initialized
    $authContext = Initialize-MandAAuthentication -Configuration $script:CurrentConfig
    
    if ($null -eq $authContext -or -not $authContext.PSObject.Properties['Authenticated'] -or $authContext.Authenticated -eq $false) { 
        Write-MandALog "Orchestrator Check: Authentication context indicates failure." -Level "ERROR"
        if ($null -eq $authContext) {
            Write-MandALog "Diagnostic: authContext object is null." -Level "DEBUG"
        } else {
            Write-MandALog "Diagnostic: authContext.Authenticated property is missing or false." -Level "DEBUG"
            Write-MandALog "Diagnostic: Full authContext object: $($authContext | ConvertTo-Json -Depth 3 -Compress)" -Level "DEBUG"
        }
        throw "Authentication failed. Orchestrator cannot proceed." 
    }

    $connectionStatus = Initialize-AllConnections -Configuration $script:CurrentConfig -AuthContext $authContext
    if ($null -eq $connectionStatus) { 
        throw "Connection initialization failed critically."
    }
    
    #---------------------------------------------------------------------------
    # Critical Connection Validation
    #---------------------------------------------------------------------------
    $criticalFailure = $false
    $haltSources = @($script:CurrentConfig.environment.connectivity.haltOnConnectionError)
    
    foreach($service_item in $haltSources) { # Renamed $service
        if ($connectionStatus.ContainsKey($service_item)) {
            if (-not $connectionStatus.$service_item.Connected) {
                Write-MandALog "CRITICAL FAILURE: Connection to required service '$service_item' failed. Halting execution as per configuration." -Level "ERROR"
                $criticalFailure = $true
            }
        } 
        else { # Only applies if $service_item was in $haltSources
            Write-MandALog "CONFIGURATION WARNING: Service '$service_item' is listed in 'haltOnConnectionError' but its connection status was not found. This could be a typo in the configuration file. Execution will continue for now, but this service might be critical." -Level "WARN"
        }
    }
    
    if ($criticalFailure) { 
        throw "Halting due to critical connection failure(s)." 
    }

    #---------------------------------------------------------------------------
    # Phase Execution Variables
    #---------------------------------------------------------------------------
    $discoveryOutput = $null
    $processingOutput = $null

    #---------------------------------------------------------------------------
    # Discovery Phase
    #---------------------------------------------------------------------------
    if ($Mode -in "Discovery", "Full") {
        $discoveryOutput = Invoke-DiscoveryPhaseInternal -Configuration $script:CurrentConfig
    }
    
    #---------------------------------------------------------------------------
    # Processing Phase
    #---------------------------------------------------------------------------
    if ($Mode -in "Processing", "Full") {
        $rawPathForProcessing = $global:MandA.Paths.RawDataOutput
        
        if (($Mode -eq "Processing") -and ($null -eq $discoveryOutput)) {
            Write-MandALog "Processing mode selected. Will attempt to use existing data from '$rawPathForProcessing'." -Level "INFO"
        } 
        elseif ($Mode -eq "Full" -and ($null -eq $discoveryOutput)) {
            Write-MandALog "Full mode selected, but discovery output is null. Processing may fail or use existing raw data from '$rawPathForProcessing'." -Level "WARN"
        }
        
        $processingOutput = Invoke-ProcessingPhaseInternal -Configuration $script:CurrentConfig -RawDataPath $rawPathForProcessing
    }
    
    #---------------------------------------------------------------------------
    # Export Phase
    #---------------------------------------------------------------------------
    if ($Mode -in "Export", "Full") {
        if (($Mode -eq "Export") -and ($null -eq $processingOutput)) {
            Write-MandALog "Export mode selected. Will attempt to use existing data from '$($global:MandA.Paths.ProcessedDataOutput)' or processing phase output if available." -Level "INFO"
        } 
        elseif ($Mode -eq "Full" -and ($null -eq $processingOutput)) {
            Write-MandALog "Full mode selected, but processing output is null. Export may fail or use existing processed data from '$($global:MandA.Paths.ProcessedDataOutput)'." -Level "WARN"
        }
        
        Invoke-ExportPhaseInternal -Configuration $script:CurrentConfig -ProcessedData $processingOutput 
    }

    #---------------------------------------------------------------------------
    # Completion
    #---------------------------------------------------------------------------
    Complete-MandADiscoveryInternal -Configuration $script:CurrentConfig

} 
catch {
    Write-MandALog "ORCHESTRATOR CRITICAL ERROR: $($_.Exception.Message)" -Level "ERROR"
    
    if ($_.ScriptStackTrace) { 
        Write-MandALog "Stack Trace: $($_.ScriptStackTrace)" -Level "DEBUG" 
    }
    
    if ($Host.Name -eq "ConsoleHost") { 
        $Host.SetShouldExit(1)
        exit 1 
    } 
    else { 
        throw 
    }
} 
finally {
    #---------------------------------------------------------------------------
    # Cleanup
    #---------------------------------------------------------------------------
    if (Get-Command 'Disconnect-AllServices' -ErrorAction SilentlyContinue) {
        Disconnect-AllServices 
    }
    
    Write-MandALog "Orchestrator execution finished at $(Get-Date)." -Level "INFO"
    $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
}