#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Main Orchestrator (Enhanced Version)

.DESCRIPTION
    Unified orchestrator for discovery, processing, and export with comprehensive error handling.

.NOTES
    Version: 4.3.0
    Author: Enhanced Version
    Date: 2025-06-02
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)] # Make CompanyName mandatory for the orchestrator
    [string]$CompanyName,

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

Write-Host "--- Orchestrator: Importing Core Utility Modules ---" -ForegroundColor DarkCyan

$utilityModulesToImport = @(
    "EnhancedLogging.psm1",
    "FileOperations.psm1",
    "ValidationHelpers.psm1",
    "ConfigurationValidation.psm1", 
    "ErrorHandling.psm1" 
)

foreach ($moduleName_util in $utilityModulesToImport) {
    $modulePath_util = Join-Path $global:MandA.Paths.Utilities $moduleName_util
    
    if (Test-Path $modulePath_util -PathType Leaf) {
        try {
            Write-Host "Importing utility module: $modulePath_util" -ForegroundColor Gray
            Import-Module $modulePath_util -Force -Global -ErrorAction Stop
            Write-Host "✅ Successfully imported $moduleName_util" -ForegroundColor DarkGreen
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

$criticalFunctions = @(
    'Write-MandALog',
    'Initialize-OutputDirectories',
    'Test-Prerequisites'
)

foreach ($funcName in $criticalFunctions) {
    if (-not (Get-Command $funcName -ErrorAction SilentlyContinue)) {
        Write-Error "CRITICAL: Required function '$funcName' not found after importing modules. Orchestrator cannot continue."
        $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
        exit 1
    }
}

#===============================================================================
#                    AUTHENTICATION MODULES IMPORT
#===============================================================================

Write-Host "--- Orchestrator: Importing Authentication Modules ---" -ForegroundColor DarkCyan

$authModulesToImport = @(
    "Authentication/Authentication.psm1",
    "Authentication/CredentialManagement.psm1" 
)

foreach ($authModuleRelPath_item in $authModulesToImport) {
    $authModulePath_item = Join-Path $global:MandA.Paths.Modules $authModuleRelPath_item
    
    if (Test-Path $authModulePath_item -PathType Leaf) {
        try {
            Write-Host "Importing auth module: $authModulePath_item" -ForegroundColor Gray
            Import-Module $authModulePath_item -Force -Global -ErrorAction Stop
            Write-Host "✅ Successfully imported $(Split-Path $authModulePath_item -Leaf)" -ForegroundColor DarkGreen
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
    $connManagerPath_local = Join-Path $global:MandA.Paths.Modules "Connectivity/EnhancedConnectionManager.psm1"
    
    if (Test-Path $connManagerPath_local -PathType Leaf) { 
        Write-Host "Importing EnhancedConnectionManager..." -ForegroundColor Gray
        Import-Module $connManagerPath_local -Force -Global -ErrorAction Stop
        Write-Host "✅ Successfully imported EnhancedConnectionManager.psm1" -ForegroundColor DarkGreen
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
# Verify critical auth and connection functions
#-------------------------------------------------------------------------------

$criticalAuthFunctions = @(
    'Initialize-MandAAuthentication',
    'Get-SecureCredentials',
    'Initialize-AllConnections'
)

foreach ($funcName in $criticalAuthFunctions) {
    if (-not (Get-Command $funcName -ErrorAction SilentlyContinue)) {
        Write-Error "CRITICAL: Required function '$funcName' not found after module imports."
        $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
        exit 1 
    }
}

Write-Host "--- Orchestrator: All Core Modules Imported Successfully ---" -ForegroundColor DarkCyan

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
    
    try {
        Write-MandALog "===============================================" -Level "HEADER"
        Write-MandALog "INITIALIZING ENVIRONMENT FOR MODE: $CurrentMode" -Level "HEADER"
        Write-MandALog "===============================================" -Level "HEADER"

        # Initialize logging
        Initialize-Logging -Configuration $Configuration 
        
        # Initialize output directories
        if (-not (Initialize-OutputDirectories -Configuration $Configuration)) { 
            throw "Failed to initialize output directories. Check permissions and paths in config."
        }

        # Check PowerShell module dependencies
        Write-MandALog "Checking PowerShell module dependencies..." -Level "INFO"
        $moduleCheckScriptPath_local = $global:MandA.Paths.ModuleCheckScript
        
        if (Test-Path $moduleCheckScriptPath_local -PathType Leaf) { 
            try {
                & $moduleCheckScriptPath_local -AutoFix -Silent -ErrorAction Stop 
                Write-MandALog "✅ PowerShell module dependency check completed" -Level "SUCCESS"
            } catch {
                Write-MandALog "ERROR: PowerShell module dependency check failed: $($_.Exception.Message)" -Level "ERROR"
                throw "Module dependencies not met: $($_.Exception.Message)"
            }
        } else {
            Write-MandALog "WARN: DiscoverySuiteModuleCheck.ps1 not found at '$moduleCheckScriptPath_local'" -Level "WARN"
        }
        
        # Test prerequisites
        if (-not (Test-Prerequisites -Configuration $Configuration -ValidateOnly:$IsValidateOnlyMode)) { 
            throw "System prerequisites validation failed"
        }

        # Load discovery modules if needed
        if ($CurrentMode -in "Discovery", "Full") {
            $discoveryModulePathBase = Join-Path $global:MandA.Paths.Modules "Discovery"
            $enabledSources = @($Configuration.discovery.enabledSources)
            
            Write-MandALog "Loading discovery modules for $($enabledSources.Count) enabled sources..." -Level "INFO"
            $loadedCount = 0
            
            foreach ($sourceName_item in $enabledSources) {
                $moduleFileName = "$($sourceName_item)Discovery.psm1" 
                $fullModulePath = Join-Path $discoveryModulePathBase $moduleFileName
                
                if (Test-Path $fullModulePath -PathType Leaf) {
                    try {
                        Import-Module $fullModulePath -Force -Global -ErrorAction Stop
                        Write-MandALog "✅ Loaded module: $moduleFileName" -Level "SUCCESS"
                        $loadedCount++
                    } catch {
                        Write-MandALog "ERROR: Failed to load discovery module '$moduleFileName': $($_.Exception.Message)" -Level "ERROR"
                    }
                } else {
                    Write-MandALog "WARN: Module file not found for enabled source '$sourceName_item': $fullModulePath" -Level "WARN"
                }
            }
            
            Write-MandALog "Loaded $loadedCount of $($enabledSources.Count) discovery modules" -Level "INFO"
        }
        
        Write-MandALog "✅ Environment initialization completed" -Level "SUCCESS"
        return $true
        
    } catch {
        Write-MandALog "ERROR: Environment initialization failed: $($_.Exception.Message)" -Level "ERROR"
        Write-MandALog "Stack trace: $($_.ScriptStackTrace)" -Level "DEBUG"
        throw
    }
}

function Invoke-DiscoveryPhaseInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "===============================================" -Level "HEADER"
        Write-MandALog "STARTING DISCOVERY PHASE" -Level "HEADER"
        Write-MandALog "===============================================" -Level "HEADER"
        
        $discoveryResults = @{}
        $enabledSources_disc = @($Configuration.discovery.enabledSources)

        foreach ($sourceName_disc in $enabledSources_disc) {
            $invokeFunctionName = "Invoke-$($sourceName_disc)Discovery"
            
            if (Get-Command $invokeFunctionName -ErrorAction SilentlyContinue) {
                Write-MandALog "Invoking $invokeFunctionName for source '$sourceName_disc'..." -Level "INFO"
                try {
                    $sourceResult = & $invokeFunctionName -Configuration $Configuration -ErrorAction Stop
                    $discoveryResults[$sourceName_disc] = $sourceResult
                    Write-MandALog "✅ Finished discovery for source '$sourceName_disc'" -Level "SUCCESS"
                } catch {
                    Write-MandALog "ERROR: Discovery failed for source '$sourceName_disc': $($_.Exception.Message)" -Level "ERROR"
                    $discoveryResults[$sourceName_disc] = @{ 
                        Error = $_.Exception.Message
                        Success = $false
                        Timestamp = Get-Date
                    }
                }
            } else {
                Write-MandALog "WARN: Discovery function '$invokeFunctionName' not found for enabled source '$sourceName_disc'" -Level "WARN"
            }
        }
        
        Write-MandALog "✅ Discovery Phase Completed" -Level "SUCCESS"
        return $discoveryResults
        
    } catch {
        Write-MandALog "ERROR: Discovery phase failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Invoke-ProcessingPhaseInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)] 
        [string]$RawDataPath 
    )
    
    try {
        Write-MandALog "===============================================" -Level "HEADER"
        Write-MandALog "STARTING PROCESSING PHASE" -Level "HEADER"
        Write-MandALog "===============================================" -Level "HEADER"
        
        Write-MandALog "Processing data from: $RawDataPath" -Level "INFO"
        
        # Placeholder for actual processing logic
        $processedData = @{ 
            UserProfiles = @()
            MigrationWaves = @()
            Status = "Processing Phase Placeholder"
            Timestamp = Get-Date
        }
        
        Write-MandALog "✅ Processing Phase Completed" -Level "SUCCESS"
        return $processedData
        
    } catch {
        Write-MandALog "ERROR: Processing phase failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Invoke-ExportPhaseInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)] 
        [hashtable]$ProcessedData 
    )
    
    try {
        Write-MandALog "===============================================" -Level "HEADER"
        Write-MandALog "STARTING EXPORT PHASE" -Level "HEADER"
        Write-MandALog "===============================================" -Level "HEADER"
        
        if ($null -ne $ProcessedData) {
            Write-MandALog "Exporting data: $($ProcessedData.Keys -join ', ')" -Level "INFO"
        } else {
            Write-MandALog "WARN: No processed data provided to export phase" -Level "WARN"
        }
        
        Write-MandALog "✅ Export Phase Completed" -Level "SUCCESS"
        return $true
        
    } catch {
        Write-MandALog "ERROR: Export phase failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Complete-MandADiscoveryInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    
    Write-MandALog "===============================================" -Level "HEADER"
    Write-MandALog "FINALIZING M&A DISCOVERY SUITE EXECUTION" -Level "HEADER"
    Write-MandALog "===============================================" -Level "HEADER"
    
    Write-MandALog "✅ Execution completed successfully" -Level "SUCCESS"
    Write-MandALog "  - Logs: $($global:MandA.Paths.LogOutput)" -Level "INFO"
    Write-MandALog "  - Output: $($Configuration.environment.outputPath)" -Level "INFO"
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
        Write-MandALog "Force mode enabled: skipExistingFiles = false" -Level "INFO"
        $script:CurrentConfig.discovery.skipExistingFiles = $false 
    }
    
    #---------------------------------------------------------------------------
    # Suite Header
    #---------------------------------------------------------------------------
    Write-MandALog "===============================================" -Level "HEADER"
    Write-MandALog "M&A DISCOVERY SUITE v$($script:CurrentConfig.metadata.version)" -Level "HEADER"
    Write-MandALog "Orchestrator v4.3.0 (Enhanced)" -Level "HEADER"
    Write-MandALog "===============================================" -Level "HEADER"
    Write-MandALog "Mode: $Mode | Config: $($global:MandA.Paths.ConfigFile)" -Level "INFO"

    #---------------------------------------------------------------------------
    # Environment Initialization
    #---------------------------------------------------------------------------
    Initialize-MandAEnvironmentInternal -Configuration $script:CurrentConfig -CurrentMode $Mode -IsValidateOnlyMode:$ValidateOnly
    
    if ($ValidateOnly.IsPresent) {
        Write-MandALog "✅ Validation Only Mode: Environment checks complete" -Level "SUCCESS"
        $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
        exit 0
    }
    
    #---------------------------------------------------------------------------
    # Authentication & Connection Setup
    #---------------------------------------------------------------------------
    Write-MandALog "===============================================" -Level "HEADER"
    Write-MandALog "AUTHENTICATION & CONNECTION SETUP" -Level "HEADER"
    Write-MandALog "===============================================" -Level "HEADER"
    
    # Initialize authentication
    $authContext = $null
    $authResult = Initialize-MandAAuthentication -Configuration $script:CurrentConfig
    
    # Debug auth result
    Write-MandALog "DEBUG: Authentication result received:" -Level "DEBUG"
    Write-MandALog "  - Type: $(if($authResult){$authResult.GetType().Name}else{'NULL'})" -Level "DEBUG"
    Write-MandALog "  - Keys: $(if($authResult -and $authResult -is [hashtable]){$authResult.Keys -join ', '}else{'N/A'})" -Level "DEBUG"
    
    # Validate authentication result
    if ($null -eq $authResult) {
        Write-MandALog "CRITICAL: Authentication returned null" -Level "ERROR"
        throw "Authentication failed - null result returned"
    }
    
    if ($authResult -is [hashtable]) {
        if (-not $authResult.ContainsKey('Authenticated')) {
            Write-MandALog "CRITICAL: Authentication result missing 'Authenticated' property" -Level "ERROR"
            throw "Authentication failed - invalid result structure"
        }
        
        if ($authResult.Authenticated -ne $true) {
            $errorMsg = if ($authResult.Error) { $authResult.Error } else { "Unknown authentication error" }
            Write-MandALog "CRITICAL: Authentication failed: $errorMsg" -Level "ERROR"
            throw "Authentication failed: $errorMsg"
        }
        
        # Extract auth context
        if ($authResult.Context) {
            $authContext = $authResult.Context
            Write-MandALog "DEBUG: Using nested Context from auth result" -Level "DEBUG"
        } else {
            $authContext = $authResult
            Write-MandALog "DEBUG: Using entire auth result as context" -Level "DEBUG"
        }
    } else {
        Write-MandALog "CRITICAL: Unexpected authentication result type: $($authResult.GetType().Name)" -Level "ERROR"
        throw "Authentication failed - unexpected result type"
    }
    
    Write-MandALog "✅ Authentication successful" -Level "SUCCESS"
    Write-MandALog "  - Client ID: $(if($authContext.ClientId){$authContext.ClientId}else{'Not available'})" -Level "INFO"
    Write-MandALog "  - Tenant ID: $(if($authContext.TenantId){$authContext.TenantId}else{'Not available'})" -Level "INFO"
    
    # Initialize connections
    Write-MandALog "Initializing service connections..." -Level "INFO"
    $connectionStatus = Initialize-AllConnections -Configuration $script:CurrentConfig -AuthContext $authContext
    
    # Debug connection status
    Write-MandALog "DEBUG: Connection status received:" -Level "DEBUG"
    Write-MandALog "  - Type: $(if($connectionStatus){$connectionStatus.GetType().Name}else{'NULL'})" -Level "DEBUG"
    Write-MandALog "  - Keys: $(if($connectionStatus -and $connectionStatus -is [hashtable]){$connectionStatus.Keys -join ', '}else{'N/A'})" -Level "DEBUG"
    
    if ($null -eq $connectionStatus -or $connectionStatus.Count -eq 0) {
        Write-MandALog "CRITICAL: Connection initialization returned no results" -Level "ERROR"
        throw "Connection initialization failed - no results returned"
    }
    
    #---------------------------------------------------------------------------
    # Critical Connection Validation
    #---------------------------------------------------------------------------
    $criticalFailure = $false
    $haltSources = @($script:CurrentConfig.environment.connectivity.haltOnConnectionError)
    
    Write-MandALog "Checking critical connections: $($haltSources -join ', ')" -Level "INFO"
    
    foreach($service_item in $haltSources) {
        if ($connectionStatus.ContainsKey($service_item)) {
            $serviceStatus = $connectionStatus.$service_item
            
            # Handle both formats: boolean or object with Connected property
            $isConnected = $false
            if ($serviceStatus -is [bool]) {
                $isConnected = $serviceStatus
            } elseif ($serviceStatus -is [hashtable] -and $serviceStatus.ContainsKey('Connected')) {
                $isConnected = $serviceStatus.Connected
            }
            
            if (-not $isConnected) {
                Write-MandALog "CRITICAL: Required service '$service_item' failed to connect" -Level "ERROR"
                $criticalFailure = $true
            } else {
                Write-MandALog "✅ Critical service '$service_item' connected successfully" -Level "SUCCESS"
            }
        } else {
            Write-MandALog "WARN: Critical service '$service_item' not found in connection results" -Level "WARN"
        }
    }
    
    if ($criticalFailure) { 
        throw "Critical service connection failures detected. Cannot proceed." 
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
            Write-MandALog "Processing mode: Using existing data from '$rawPathForProcessing'" -Level "INFO"
        }
        
        $processingOutput = Invoke-ProcessingPhaseInternal -Configuration $script:CurrentConfig -RawDataPath $rawPathForProcessing
    }
    
    #---------------------------------------------------------------------------
    # Export Phase
    #---------------------------------------------------------------------------
    if ($Mode -in "Export", "Full") {
        if (($Mode -eq "Export") -and ($null -eq $processingOutput)) {
            Write-MandALog "Export mode: Using existing data from '$($global:MandA.Paths.ProcessedDataOutput)'" -Level "INFO"
        }
        
        Invoke-ExportPhaseInternal -Configuration $script:CurrentConfig -ProcessedData $processingOutput 
    }

    #---------------------------------------------------------------------------
    # Completion
    #---------------------------------------------------------------------------
    Complete-MandADiscoveryInternal -Configuration $script:CurrentConfig

} 
catch {
    Write-MandALog "===============================================" -Level "ERROR"
    Write-MandALog "ORCHESTRATOR CRITICAL ERROR" -Level "ERROR"
    Write-MandALog "===============================================" -Level "ERROR"
    Write-MandALog "Error: $($_.Exception.Message)" -Level "ERROR"
    Write-MandALog "Type: $($_.Exception.GetType().Name)" -Level "ERROR"
    
    if ($_.ScriptStackTrace) { 
        Write-MandALog "Stack Trace:" -Level "DEBUG"
        Write-MandALog $_.ScriptStackTrace -Level "DEBUG" 
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
    Write-MandALog "Performing cleanup..." -Level "INFO"
    
    if (Get-Command 'Disconnect-AllServices' -ErrorAction SilentlyContinue) {
        try {
            Disconnect-AllServices
        } catch {
            Write-MandALog "WARN: Error during service disconnection: $($_.Exception.Message)" -Level "WARN"
        }
    }
    
    Write-MandALog "Orchestrator execution completed at $(Get-Date)" -Level "INFO"
    $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
}