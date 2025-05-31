#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Main Orchestrator
.DESCRIPTION
    Unified orchestrator for M&A environment discovery, processing, and export operations.
.PARAMETER ConfigurationFile
    Path to the JSON configuration file
.PARAMETER Mode
    Execution mode: Discovery, Processing, Export, or Full
.PARAMETER OutputPath
    Override output path from configuration
.PARAMETER Force
    Force reprocessing of existing files
.PARAMETER ValidateOnly
    Only validate prerequisites without executing
.EXAMPLE
    .\MandA-Orchestrator.ps1 -Mode Full -ConfigurationFile ".\Configuration\production-config.json"
.EXAMPLE
    .\MandA-Orchestrator.ps1 -Mode Discovery -OutputPath "C:\CustomOutput" -Force
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateScript({Test-Path $_ -PathType Leaf})]
    [string]$ConfigurationFile = ".\Configuration\default-config.json",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("Discovery", "Processing", "Export", "Full")]
    [string]$Mode = "Full",
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force,
    
    [Parameter(Mandatory=$false)]
    [switch]$ValidateOnly
)

# Ensure MandASuiteRoot is available. It should be set by Set-SuiteEnvironment.ps1,
# which is sourced by QuickStart.ps1.
if (-not $global:MandASuiteRoot) {
    # Fallback: If running orchestrator directly (not via QuickStart), try to determine SuiteRoot.
    # This assumes Orchestrator.ps1 is in a 'Core' subdirectory of the SuiteRoot.
    $script:SuiteRoot = Split-Path $PSScriptRoot -Parent
    Write-Warning "global:MandASuiteRoot was not set (e.g., by QuickStart.ps1 sourcing Set-SuiteEnvironment.ps1). Attempting to derive SuiteRoot as: $($script:SuiteRoot). This might be unreliable if the script structure is different."
    $global:MandASuiteRoot = $script:SuiteRoot # Set it globally for consistency if derived here.
}
if (-not (Test-Path $global:MandASuiteRoot -PathType Container)) {
    Write-Error "CRITICAL: MandASuiteRoot ('$($global:MandASuiteRoot)') is not a valid directory. Cannot proceed."
    exit 1
}


$script:Config = $null
$script:StartTime = Get-Date
# Initialize ExecutionMetrics as a script-scoped variable for broader access within this script file
$script:ExecutionMetrics = @{
    StartTime = $script:StartTime
    EndTime = $null
    Duration = $null
    Phase = "Initialization" # Initial Phase
    TotalOperations = 0      # Placeholder for more granular tracking if needed
    SuccessfulOperations = 0 # Placeholder
    FailedOperations = 0     # Placeholder
    Modules = @{}            # To store module-specific outcomes or metrics
}

# Import ESSENTIAL modules using absolute paths relative to suite root
# These modules contain functions critical for the orchestrator's basic operation.
$InitialEssentialModulePaths = @(
    (Join-Path $global:MandASuiteRoot "Modules\Utilities\EnhancedLogging.psm1"),
    (Join-Path $global:MandASuiteRoot "Modules\Utilities\ErrorHandling.psm1"),
    (Join-Path $global:MandASuiteRoot "Modules\Utilities\ValidationHelpers.psm1"), 
    (Join-Path $global:MandASuiteRoot "Modules\Utilities\FileOperations.psm1"),   
    (Join-Path $global:MandASuiteRoot "Modules\Utilities\ProgressTracking.psm1"), 
    (Join-Path $global:MandASuiteRoot "Modules\Authentication\Authentication.psm1"),
    (Join-Path $global:MandASuiteRoot "Modules\Connectivity\EnhancedConnectionManager.psm1") 
)

foreach ($ModulePath in $InitialEssentialModulePaths) {
    if (Test-Path $ModulePath) { 
        Import-Module $ModulePath -Force -Global # Force import and make functions globally available
        Write-Verbose "Statically imported essential module: $(Split-Path $ModulePath -Leaf)" 
    }
    else { 
        Write-Error "CRITICAL: Essential module not found: $ModulePath. Orchestrator cannot continue."
        exit 1 # Critical failure if essential utilities are missing
    }
}

# Helper function to convert PSCustomObject (from JSON) to Hashtable recursively
function ConvertTo-HashtableFromPSObject {
    param (
        [Parameter(Mandatory=$true)]
        [AllowNull()]$InputObject
    )
    if ($null -eq $InputObject) { return $null }

    if ($InputObject -is [System.Collections.IEnumerable] -and $InputObject -isnot [string] -and $InputObject -isnot [hashtable]) {
        # Handle arrays: convert each element
        $collection = @( foreach ($objectInCollection in $InputObject) { ConvertTo-HashtableFromPSObject -InputObject $objectInCollection })
        return $collection
    } elseif ($InputObject.PSObject.BaseObject -is [System.Management.Automation.PSCustomObject] -or $InputObject.GetType().Name -eq 'PSCustomObject') {
        # Handle PSCustomObject: convert to hashtable
        $hashtable = @{}
        foreach ($property in $InputObject.PSObject.Properties) {
            $hashtable[$property.Name] = ConvertTo-HashtableFromPSObject -InputObject $property.Value
        }
        return $hashtable
    } else {
        # Primitive types, hashtables, or other objects are returned as is
        return $InputObject
    }
}

# Initializes the environment: logging, output dirs, prerequisites, dynamic module loading
function Initialize-MandAEnvironment {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration, 
        [Parameter(Mandatory=$true)]
        [string]$CurrentMode, 
        [Parameter(Mandatory=$false)]
        [switch]$ValidateOnly
    )
    try {
        Write-MandALog "Initializing M&A Discovery Environment for Mode: $CurrentMode" -Level "HEADER"
        
        # Initialize Logging (assumes Initialize-Logging is in EnhancedLogging.psm1)
        Initialize-Logging -Configuration $Configuration
        
        # Initialize Output Directories (assumes Initialize-OutputDirectories is in FileOperations.psm1)
        Initialize-OutputDirectories -Configuration $Configuration
        
        # Test Prerequisites (assumes Test-Prerequisites is in ValidationHelpers.psm1)
        if (-not (Test-Prerequisites -Configuration $Configuration -ValidateOnly:$ValidateOnly.IsPresent)) { # Pass ValidateOnly correctly
            throw "System prerequisites validation failed" 
        }
        
        # Get and Load Required Modules for the current mode
        # (assumes Get-RequiredModules is in ValidationHelpers.psm1)
        $ModulesToLoadPaths = Get-RequiredModules -Configuration $Configuration -Mode $CurrentMode
        
        Write-MandALog "Dynamically loading $($ModulesToLoadPaths.Count) modules for mode '$CurrentMode'..." -Level "INFO"
        foreach ($ModuleFile in $ModulesToLoadPaths) {
            if (Test-Path $ModuleFile) { 
                Import-Module $ModuleFile -Force -Global # Ensure functions are globally available
                Write-MandALog "Loaded module: $(Split-Path $ModuleFile -Leaf)" -Level "SUCCESS" 
            }
            else { 
                Write-MandALog "Module file not found: $ModuleFile. Functionality depending on this module will be skipped." -Level "WARN" 
            }
        }
        Write-MandALog "Environment initialization completed successfully" -Level "SUCCESS"
        return $true
    } catch { 
        Write-MandALog "Environment initialization failed: $($_.Exception.Message)" -Level "ERROR"
        throw # Re-throw to be caught by the main orchestrator's catch block
    }
}

# Orchestrates the discovery phase
function Invoke-DiscoveryPhase {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    try {
        Write-MandALog "Starting Discovery Phase" -Level "HEADER"
        
        # Ensure Phase is explicitly set for this operation
        if ($script:ExecutionMetrics -is [hashtable]) {
            $script:ExecutionMetrics.Phase = "Discovery" 
        } else {
             Write-MandALog "\$script:ExecutionMetrics is not a hashtable before Discovery. Re-initializing." -Level "WARN"
             $script:ExecutionMetrics = @{ Phase = "Discovery" } # Simplified re-init
        }

        # Determine enabled sources and initialize progress
        $enabledDiscoverySources = @($Configuration.discovery.enabledSources) # Ensure it's an array
        $enabledDiscoverySourcesCount = $enabledDiscoverySources.Count
        
        # Initialize Progress Tracker (assumes Initialize-ProgressTracker is in ProgressTracking.psm1)
        Initialize-ProgressTracker -Phase "Discovery" -TotalSteps $enabledDiscoverySourcesCount
        
        $discoveryResults = @{}; $currentStep = 0
        
        # Helper function to safely invoke individual discovery modules
        function Invoke-DiscoveryModuleSafely { 
            [CmdletBinding()]
            param(
                [string]$SourceName, 
                [string]$InvokeCommandName, 
                [hashtable]$Config, 
                [ref]$StepRef, # Pass by reference to update step count
                [ref]$ResultsRef # Pass by reference to store results
            )
            
            if ($enabledDiscoverySources -contains $SourceName) {
                $StepRef.Value++ # Increment step count
                
                # Ensure $script:ExecutionMetrics is a hashtable before Update-Progress
                if ($script:ExecutionMetrics -isnot [hashtable]) { $script:ExecutionMetrics = @{} }
                $script:ExecutionMetrics.CurrentStepSource = $SourceName # For detailed tracking if needed
                
                # Update Progress (assumes Update-Progress is in ProgressTracking.psm1)
                Update-Progress -Step $StepRef.Value -Status "$SourceName Discovery"

                if (Get-Command $InvokeCommandName -ErrorAction SilentlyContinue) {
                    Write-MandALog "Invoking $InvokeCommandName..." -Level "INFO"
                    try {
                        # Execute the discovery command and store its results
                        $ResultsRef.Value.$SourceName = & $InvokeCommandName -Configuration $Config -ErrorAction Stop
                   } catch {
                        Write-MandALog "Error executing $InvokeCommandName for ${SourceName}: $($_.Exception.Message)" -Level "ERROR"
                        $ResultsRef.Value.$SourceName = $null # Indicate failure for this source
                    }
                } else { 
                    Write-MandALog "$InvokeCommandName command not found (module not loaded or function not exported). Skipping $SourceName discovery." -Level "WARN"
                }
            } else {
                 Write-MandALog "$SourceName discovery is not enabled in configuration. Skipping." -Level "DEBUG"
            }
        }

        # Call each enabled discovery module
        Invoke-DiscoveryModuleSafely -SourceName "ActiveDirectory" -InvokeCommandName "Invoke-ActiveDirectoryDiscovery" -Config $Configuration -StepRef ([ref]$currentStep) -ResultsRef ([ref]$discoveryResults)
        Invoke-DiscoveryModuleSafely -SourceName "Exchange" -InvokeCommandName "Invoke-ExchangeDiscovery" -Config $Configuration -StepRef ([ref]$currentStep) -ResultsRef ([ref]$discoveryResults)
        Invoke-DiscoveryModuleSafely -SourceName "Graph" -InvokeCommandName "Invoke-GraphDiscovery" -Config $Configuration -StepRef ([ref]$currentStep) -ResultsRef ([ref]$discoveryResults)
        Invoke-DiscoveryModuleSafely -SourceName "Azure" -InvokeCommandName "Invoke-AzureDiscovery" -Config $Configuration -StepRef ([ref]$currentStep) -ResultsRef ([ref]$discoveryResults)
        Invoke-DiscoveryModuleSafely -SourceName "Intune" -InvokeCommandName "Invoke-IntuneDiscovery" -Config $Configuration -StepRef ([ref]$currentStep) -ResultsRef ([ref]$discoveryResults)
        Invoke-DiscoveryModuleSafely -SourceName "GPO" -InvokeCommandName "Invoke-GPODiscovery" -Config $Configuration -StepRef ([ref]$currentStep) -ResultsRef ([ref]$discoveryResults) 
        Invoke-DiscoveryModuleSafely -SourceName "ExternalIdentity" -InvokeCommandName "Invoke-ExternalIdentityDiscovery" -Config $Configuration -StepRef ([ref]$currentStep) -ResultsRef ([ref]$discoveryResults)
        
        # Ensure progress bar completes if all steps were processed
        Update-Progress -Step $enabledDiscoverySourcesCount -Status "Discovery Phase Potentially Complete" -ForceUpdate:$true
        Write-MandALog "Discovery phase completed." -Level "SUCCESS" # Indicates the phase logic itself ran
        return $discoveryResults
    } catch { 
        Write-MandALog "Discovery phase failed catastrophically: $($_.Exception.Message)" -Level "ERROR"
        # Ensure $script:ExecutionMetrics is valid before assigning error
        if ($script:ExecutionMetrics -isnot [hashtable]) { $script:ExecutionMetrics = @{ Error = $_.Exception.Message } }
        else { $script:ExecutionMetrics.Error = $_.Exception.Message }
        throw # Re-throw to be caught by main orchestrator's catch block
    }
}

# Orchestrates the data processing phase
function Invoke-ProcessingPhase {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "Starting Processing Phase" -Level "HEADER"
        if ($script:ExecutionMetrics -is [hashtable]) { $script:ExecutionMetrics.Phase = "Processing" }
        else { $script:ExecutionMetrics = @{ Phase = "Processing" } } # Defensive re-init

        Initialize-ProgressTracker -Phase "Processing" -TotalSteps 5 # Example total steps
        
        Update-Progress -Step 1 -Status "Invoking Data Aggregation"
        $rawDataPath = Join-Path $Configuration.environment.outputPath "Raw"
        $aggregationOutput = $null

        if (Get-Command 'Invoke-DataAggregation' -ErrorAction SilentlyContinue) {
            $aggregationOutput = Invoke-DataAggregation -RawDataPath $rawDataPath -Configuration $Configuration
        } else {
            Write-MandALog "Invoke-DataAggregation command not found. Critical for processing. Aborting Processing Phase." -Level "ERROR"
            throw "Invoke-DataAggregation module/command not found."
        }

        $aggregatedDataStore = $aggregationOutput.AggregatedDataStore
        $relationshipGraph = $aggregationOutput.RelationshipGraph
        
        if ($null -eq $aggregatedDataStore) {
            Write-MandALog "Data Aggregation did not return aggregated data. Aborting Processing Phase." -Level "ERROR"
            throw "Data Aggregation failed to produce data."
        }
        Write-MandALog "Data Aggregation completed. $(if($aggregatedDataStore.Users){$aggregatedDataStore.Users.Count}else{0}) users in aggregated store." -Level "INFO"

        Update-Progress -Step 2 -Status "Building User Profiles"
        $userProfiles = if (Get-Command 'New-UserProfiles' -ErrorAction SilentlyContinue) {
            New-UserProfiles -AggregatedDataStore $aggregatedDataStore -RelationshipGraph $relationshipGraph -Configuration $Configuration 
        } else { Write-MandALog "New-UserProfiles command not found. Skipping." -Level "WARN"; @() }
        
        Update-Progress -Step 3 -Status "Analyzing Migration Complexity"
        $complexityAnalysis = if (Get-Command 'Measure-MigrationComplexity' -ErrorAction SilentlyContinue) {
            Measure-MigrationComplexity -Profiles $userProfiles -Configuration $Configuration
        } else { Write-MandALog "Measure-MigrationComplexity command not found. Skipping." -Level "WARN"; $null }
        
        Update-Progress -Step 4 -Status "Generating Migration Waves"
        $migrationWaves = if (Get-Command 'New-MigrationWaves' -ErrorAction SilentlyContinue) {
            New-MigrationWaves -Profiles $userProfiles -Configuration $Configuration
        } else { Write-MandALog "New-MigrationWaves command not found. Skipping." -Level "WARN"; @() }
        
        Update-Progress -Step 5 -Status "Validating Data Quality"
        $validationResults = if (Get-Command 'Test-DataQuality' -ErrorAction SilentlyContinue) {
            Test-DataQuality -Profiles $userProfiles -Configuration $Configuration # Or pass $aggregatedDataStore
        } else { Write-MandALog "Test-DataQuality command not found. Skipping." -Level "WARN"; $null }
        
        if ($validationResults -and $validationResults.PSObject.Properties['InvalidRecords'] -and $validationResults.InvalidRecords -gt 0) {
            if (Get-Command 'New-QualityReport' -ErrorAction SilentlyContinue) {
                New-QualityReport -ValidationResults $validationResults -OutputPath (Join-Path $Configuration.environment.outputPath "Processed")
            } else { Write-MandALog "New-QualityReport command not found." -Level "WARN" }
        }
        
        $processingResults = @{
            UserProfiles = $userProfiles; ComplexityAnalysis = $complexityAnalysis; MigrationWaves = $migrationWaves
            ValidationResults = $validationResults; RelationshipGraph = $relationshipGraph; AggregatedDataStore = $aggregatedDataStore
        }
        
        if ($script:ExecutionMetrics -is [hashtable]) {
            $script:ExecutionMetrics.Modules["Processing"] = @{
                UserProfilesBuilt = if($userProfiles) {$userProfiles.Count} else {0}
                WavesGenerated = if($migrationWaves) {$migrationWaves.Count} else {0}
                DataQualityScore = if($validationResults -and $validationResults.PSObject.Properties['QualityScore']) { $validationResults.QualityScore } else { "N/A" }
                ProcessingComplete = $true
            }
        }
        Write-MandALog "Processing phase completed successfully" -Level "SUCCESS"
        return $processingResults
    } catch {
        Write-MandALog "Processing phase failed: $($_.Exception.Message)" -Level "ERROR"
        if ($script:ExecutionMetrics -is [hashtable]) { $script:ExecutionMetrics.FailedOperations++ }
        throw
    }
}

# Orchestrates the data export phase
function Invoke-ExportPhase {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration, 
        [Parameter(Mandatory=$false)] # Allow $null if loading data from files
        [hashtable]$ProcessedData 
    )
    try {
        Write-MandALog "Starting Export Phase" -Level "HEADER"
        if ($script:ExecutionMetrics -is [hashtable]) { $script:ExecutionMetrics.Phase = "Export" }
        else { $script:ExecutionMetrics = @{ Phase = "Export" } }

        $exportFormats = @($Configuration.export.formats)
        $isPowerAppsOptimized = $false
        if ($Configuration.export.powerAppsOptimized) {
            if ($Configuration.export.powerAppsOptimized -is [boolean]) { $isPowerAppsOptimized = $Configuration.export.powerAppsOptimized }
            elseif ($Configuration.export.powerAppsOptimized -is [string] -and $Configuration.export.powerAppsOptimized.ToLower() -eq 'true') { $isPowerAppsOptimized = $true }
        }
        $powerAppsStep = if ($isPowerAppsOptimized -and ($exportFormats -contains "JSON")) { 1 } else { 0 } # Only count if JSON is also an export format
        $exportTotalSteps = $exportFormats.Count + $powerAppsStep
        
        Initialize-ProgressTracker -Phase "Export" -TotalSteps $exportTotalSteps
        $exportResults = @{}; $currentStep = 0
        
        function Invoke-ExportModuleSafely { 
            param([string]$FormatName, [string]$InvokeCommandName, [hashtable]$Config, [hashtable]$DataToExport, [ref]$StepRef, [ref]$ResultsRef)
            $StepRef.Value++; Update-Progress -Step $StepRef.Value -Status "$FormatName Export"
            if (Get-Command $InvokeCommandName -ErrorAction SilentlyContinue) {
                Write-MandALog "Invoking $InvokeCommandName..." -Level "INFO"
                $ResultsRef.Value.$FormatName = & $InvokeCommandName -ProcessedData $DataToExport -Configuration $Config 
            } else { Write-MandALog "$InvokeCommandName command not found. Skipping $FormatName export." -Level "WARN" }
        }

        if ($exportFormats -contains "CSV") { Invoke-ExportModuleSafely -FormatName "CSV" -InvokeCommandName "Export-ToCSV" -Config $Configuration -DataToExport $ProcessedData -StepRef ([ref]$currentStep) -ResultsRef ([ref]$exportResults) }
        if ($exportFormats -contains "Excel") { Invoke-ExportModuleSafely -FormatName "Excel" -InvokeCommandName "Export-ToExcel" -Config $Configuration -DataToExport $ProcessedData -StepRef ([ref]$currentStep) -ResultsRef ([ref]$exportResults) }
        if ($exportFormats -contains "JSON") { Invoke-ExportModuleSafely -FormatName "JSON" -InvokeCommandName "Export-ToJSON" -Config $Configuration -DataToExport $ProcessedData -StepRef ([ref]$currentStep) -ResultsRef ([ref]$exportResults) }
        
        # Specific call for PowerApps optimized JSON if enabled
        if ($isPowerAppsOptimized -and ($exportFormats -contains "JSON")) { # Ensure JSON is a target format for PowerApps export
             Invoke-ExportModuleSafely -FormatName "PowerAppsJSON" -InvokeCommandName "Export-ForPowerApps" -Config $Configuration -DataToExport $ProcessedData -StepRef ([ref]$currentStep) -ResultsRef ([ref]$exportResults)
        }
        
        # Example for CompanyControlSheet, assuming it's enabled via a specific flag or format name
        if ($Configuration.export.formats -contains "CompanyControlSheet" -or $Configuration.export.exportAllCustomSheets) {
            if(Get-Command 'Export-ToCompanyControlSheet' -ErrorAction SilentlyContinue){
                 Invoke-ExportModuleSafely -FormatName "CompanyControlSheet" -InvokeCommandName "Export-ToCompanyControlSheet" -Config $Configuration -DataToExport $ProcessedData -StepRef ([ref]$currentStep) -ResultsRef ([ref]$exportResults)
            } else { Write-MandALog "Export-ToCompanyControlSheet command not found. Skipping." -Level "WARN"}
        }
        
        Update-Progress -Step $currentStep -Status "Export Phase Potentially Complete" -ForceUpdate:$true
        Write-MandALog "Export phase completed successfully" -Level "SUCCESS"; return $exportResults
    } catch { 
        Write-MandALog "Export phase failed: $($_.Exception.Message)" -Level "ERROR"
        throw 
    }
}

# Finalizes the execution: logging summary, cleanup
function Complete-MandADiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    try {
        if ($script:ExecutionMetrics -is [hashtable]) {
            $script:ExecutionMetrics.EndTime = Get-Date
            $script:ExecutionMetrics.Duration = $script:ExecutionMetrics.EndTime - $script:ExecutionMetrics.StartTime
            Write-MandALog "M&A Discovery Suite Execution Summary" -Level "HEADER"
            Write-MandALog "Total Duration: $($script:ExecutionMetrics.Duration.ToString('hh\:mm\:ss'))" -Level "SUCCESS"
        } else {
            Write-MandALog "ExecutionMetrics not available for summary." -Level "WARN"
        }

        # Export Progress Metrics (assumes Export-ProgressMetrics is in ProgressTracking.psm1)
        if(Get-Command 'Export-ProgressMetrics' -ErrorAction SilentlyContinue){ Export-ProgressMetrics -Configuration $Configuration }
        
        # Cleanup Temp Files (assumes Cleanup-TempFiles is in FileOperations.psm1)
        if(Get-Command 'Cleanup-TempFiles' -ErrorAction SilentlyContinue){ Cleanup-TempFiles -Configuration $Configuration }
              
        Write-MandALog "M&A Discovery Suite completed successfully" -Level "SUCCESS"
    } catch { 
        Write-MandALog "Completion phase failed: $($_.Exception.Message)" -Level "ERROR"
        throw 
    }
}

# --- Main Execution Block ---
try {
    # Resolve Configuration File Path
    $resolvedConfigFile = $ConfigurationFile
    if (-not ([System.IO.Path]::IsPathRooted($ConfigurationFile))) {
        $resolvedConfigFile = Join-Path $global:MandASuiteRoot $ConfigurationFile
    }
    
    if (-not (Test-Path $resolvedConfigFile -PathType Leaf)) {
        Write-Error "Configuration file not found at '$resolvedConfigFile'. Please ensure the path is correct or it exists in the default location relative to SuiteRoot."
        exit 1 
    }
    
    # Load and Convert Configuration
    $configContent = Get-Content $resolvedConfigFile | ConvertFrom-Json -ErrorAction Stop
    $script:Config = ConvertTo-HashtableFromPSObject -InputObject $configContent # Ensure it's a hashtable for consistent access
    
    # Apply Overrides from Parameters
    if ($PSBoundParameters.ContainsKey('OutputPath')) { $script:Config.environment.outputPath = $OutputPath } # Check if parameter was actually passed
    if ($Force.IsPresent) { $script:Config.discovery.skipExistingFiles = $false } # Force implies not skipping
    
    Write-Host "`nM&A Discovery Suite v$(if($script:Config.metadata.version){$script:Config.metadata.version}else{'Unknown'}) - Modular Orchestrator" -ForegroundColor Cyan
    Write-Host "Mode: $Mode | Config: $resolvedConfigFile" -ForegroundColor Yellow
    
    # Initialize Environment (Logging, Dirs, Prerequisites, Modules)
    if (-not (Initialize-MandAEnvironment -Configuration $script:Config -CurrentMode $Mode -ValidateOnly:$ValidateOnly.IsPresent)) {
        throw "Core environment initialization failed. Cannot proceed."
    }
    
    # Handle ValidateOnly Mode
    if ($ValidateOnly.IsPresent) {
        Write-MandALog "Validation Only Mode: Orchestrator configuration and prerequisites appear valid." -Level "SUCCESS"
        Write-MandALog "No discovery, processing, or export operations were performed." -Level "INFO"
        exit 0 
    }
    
    # Initialize Authentication and Connections
    # (Assumes these functions are in Authentication.psm1 and EnhancedConnectionManager.psm1 respectively)
    if (-not (Initialize-MandAAuthentication -Configuration $script:Config)) {
        throw "Authentication initialization failed. Cannot proceed." 
    }
    if (-not (Initialize-AllConnections -Configuration $script:Config)) {
        # This function in EnhancedConnectionManager should log specific connection failures.
        # Orchestrator logs a general warning and proceeds; individual discovery modules should check their required connection status.
        Write-MandALog "One or more service connections failed during initialization. Suite will attempt to proceed with limited functionality." -Level "WARN" 
    }
    
    $discoveryResults = $null
    $processingResults = $null

    # Execute Phases based on Mode
    if ($Mode -in @("Discovery", "Full")) {
        $discoveryResults = Invoke-DiscoveryPhase -Configuration $script:Config
    }
    
    if ($Mode -in @("Processing", "Full")) {
        # Processing might depend on discovery results from the same run or load from files if $discoveryResults is null
        if ($null -eq $discoveryResults -and $Mode -eq "Processing") {
            Write-MandALog "Processing mode selected without prior discovery in this session. Data Aggregation will attempt to load from 'Raw' directory." -Level "INFO"
        }
        $processingResults = Invoke-ProcessingPhase -Configuration $script:Config # Pass $discoveryResults if needed by its internal logic
    }
    
    if ($Mode -in @("Export", "Full")) {
        if ($null -eq $processingResults -and $Mode -eq "Export") { 
            Write-MandALog "Export mode selected without prior processing in this session. Export modules will attempt to load data from 'Processed' directory." -Level "INFO"
            Invoke-ExportPhase -Configuration $script:Config -ProcessedData $null # Signal to load from files
        } elseif ($null -ne $processingResults) {
            Invoke-ExportPhase -Configuration $script:Config -ProcessedData $processingResults 
        } else { 
            Write-MandALog "Skipping Export Phase as no processed data is available from the current session (e.g., Discovery-only mode or Processing phase failed)." -Level "WARN"
        }
    }
    
    Complete-MandADiscovery -Configuration $script:Config
    
} catch {
    # Main orchestrator catch block
    if ($script:ExecutionMetrics -isnot [hashtable]) { $script:ExecutionMetrics = @{} } # Defensive
    Write-MandALog "ORCHESTRATOR CRITICAL ERROR: $($_.Exception.Message)" -Level "ERROR"
    if ($_.ScriptStackTrace) { Write-MandALog "Stack Trace: $($_.ScriptStackTrace)" -Level "DEBUG" }
    if ($_.Exception.InnerException) { Write-MandALog "Inner Exception: $($_.Exception.InnerException.Message)" -Level "DEBUG" }
    # Set exit code for QuickStart.ps1 or other callers
    $host.SetShouldExit(1) # Signal error to calling scripts
    exit 1 # Ensure script exits with an error code
    
} finally {
    # Final cleanup, always attempt to disconnect services
    try { 
        if (Get-Command 'Disconnect-AllServices' -ErrorAction SilentlyContinue) { Disconnect-AllServices } 
    }
    catch { Write-MandALog "Error during final service disconnection: $($_.Exception.Message)" -Level "WARN" }
    
    Write-MandALog "Orchestrator execution finished at $(Get-Date)." -Level "INFO"
    # Display final log path to user
    if ($script:Config.environment.logging.logFilePath) { # Assuming logFilePath is set by Initialize-Logging
         Write-Host "For detailed logs, please check: $($script:Config.environment.logging.logFilePath)" -ForegroundColor Gray
    }
}
