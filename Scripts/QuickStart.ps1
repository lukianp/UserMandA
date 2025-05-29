#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Main Orchestrator
.DESCRIPTION
    Unified orchestrator for M&A environment discovery, processing, and export operations.
    Replaces the previous three-script approach with a modular, maintainable architecture.
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
    [string]$ConfigurationFile = ".\Configuration\default-config.json", # Relative to SuiteRoot by default
    
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

# Get the script root directory for location-independent paths
# $script:SuiteRoot is set by Set-SuiteEnvironment.ps1, which should be sourced by the caller (e.g. QuickStart.ps1)
# If running orchestrator directly, ensure $global:MandASuiteRoot is set or resolve SuiteRoot here.
# For consistency with QuickStart, assuming Set-SuiteEnvironment.ps1 has run and set global paths.
# If $global:MandASuiteRoot is not set, this script might have issues finding modules.
# It's safer for the orchestrator to also be able to determine its SuiteRoot if run standalone.
if (-not $global:MandASuiteRoot) {
    $script:SuiteRoot = Split-Path $PSScriptRoot -Parent
    Write-Warning "global:MandASuiteRoot not set. Assuming SuiteRoot is: $($script:SuiteRoot)"
    # And then ensure global paths are set if Set-SuiteEnvironment wasn't sourced.
    # For now, we rely on the QuickStart.ps1 to source Set-SuiteEnvironment.ps1
}


# Global script variables
$script:Config = $null
$script:StartTime = Get-Date
$script:ExecutionMetrics = @{
    StartTime = $script:StartTime
    EndTime = $null
    Duration = $null
    Phase = "Initialization"
    TotalOperations = 0
    SuccessfulOperations = 0
    FailedOperations = 0
    Modules = @{}
}

# Import ESSENTIAL modules using absolute paths relative to suite root
# These are core utilities needed for the orchestrator to function.
# Other modules will be loaded dynamically by Initialize-MandAEnvironment.
$InitialEssentialModulePaths = @(
    (Join-Path $global:MandASuiteRoot "Modules\Utilities\EnhancedLogging.psm1"),
    (Join-Path $global:MandASuiteRoot "Modules\Utilities\ErrorHandling.psm1"),
    (Join-Path $global:MandASuiteRoot "Modules\Utilities\ValidationHelpers.psm1"), # Contains Get-RequiredModules, Test-Prerequisites
    (Join-Path $global:MandASuiteRoot "Modules\Utilities\FileOperations.psm1"),   # For Initialize-OutputDirectories etc.
    (Join-Path $global:MandASuiteRoot "Modules\Utilities\ProgressTracking.psm1"), # For progress bar functions
    (Join-Path $global:MandASuiteRoot "Modules\Authentication\Authentication.psm1"),
    (Join-Path $global:MandASuiteRoot "Modules\Connectivity\EnhancedConnectionManager.psm1") 
    # CredentialManagement.psm1 is usually imported by Authentication.psm1
)

foreach ($ModulePath in $InitialEssentialModulePaths) {
    if (Test-Path $ModulePath) {
        Import-Module $ModulePath -Force -Global
        Write-Verbose "Statically imported essential module: $(Split-Path $ModulePath -Leaf)"
    } else {
        Write-Error "CRITICAL: Essential module not found: $ModulePath. Orchestrator cannot continue."
        exit 1
    }
}

# Helper function to convert PSObjects from JSON (nested) to Hashtables for easier use
function ConvertTo-HashtableFromPSObject {
    param (
        [Parameter(Mandatory=$true)]
        [AllowNull()]$InputObject
    )
    
    if ($null -eq $InputObject) { 
        return $null 
    }
    
    if ($InputObject -is [System.Collections.IEnumerable] -and $InputObject -isnot [string]) {
        $collection = @(
            foreach ($objectInCollection in $InputObject) { 
                ConvertTo-HashtableFromPSObject -InputObject $objectInCollection 
            }
        )
        return $collection # Return as array, not ,$collection for single item arrays from JSON
    } elseif ($InputObject.PSObject.BaseObject -is [System.Management.Automation.PSCustomObject] -or $InputObject.GetType().Name -eq 'PSCustomObject') {
        $hashtable = @{}
        foreach ($property in $InputObject.PSObject.Properties) {
            $hashtable[$property.Name] = ConvertTo-HashtableFromPSObject -InputObject $property.Value
        }
        return $hashtable
    } else {
        return $InputObject
    }
}

function Initialize-MandAEnvironment {
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration, 
        [Parameter(Mandatory=$true)]
        [string]$CurrentMode, # Pass the current orchestrator mode
        [switch]$ValidateOnly
    )
    
    try {
        Write-MandALog "Initializing M&A Discovery Environment for Mode: $CurrentMode" -Level "HEADER"
        
        # Initialize logging (already loaded from EnhancedLogging.psm1)
        Initialize-Logging -Configuration $Configuration
        
        # Initialize output directories (already loaded from FileOperations.psm1)
        Initialize-OutputDirectories -Configuration $Configuration
        
        # Validate system prerequisites (already loaded from ValidationHelpers.psm1)
        if (-not (Test-Prerequisites -Configuration $Configuration -ValidateOnly:$ValidateOnly)) {
            throw "System prerequisites validation failed"
        }
        
        # Load dynamic modules based on Mode and Configuration
        # Get-RequiredModules is in ValidationHelpers.psm1 (already loaded)
        $ModulesToLoadPaths = Get-RequiredModules -Configuration $Configuration -Mode $CurrentMode
        
        Write-MandALog "Dynamically loading $($ModulesToLoadPaths.Count) modules for mode '$CurrentMode'..." -Level "INFO"
        foreach ($ModuleFile in $ModulesToLoadPaths) {
            if (Test-Path $ModuleFile) {
                Import-Module $ModuleFile -Force -Global
                Write-MandALog "Loaded module: $(Split-Path $ModuleFile -Leaf)" -Level "SUCCESS"
            } else {
                # This warning is important. If a configured source/format has no module, it won't run.
                Write-MandALog "Module file not found: $ModuleFile. Functionality depending on this module will be skipped." -Level "WARN"
            }
        }
        
        # The old Test-RequiredModules (file existence check) is removed as Get-RequiredModules and import loop handle it.
        # If specific checks for *function export* from these modules are needed, that could be an addition here.

        Write-MandALog "Environment initialization completed successfully" -Level "SUCCESS"
        return $true
        
    } catch {
        Write-MandALog "Environment initialization failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}


function Invoke-DiscoveryPhase {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Starting Discovery Phase" -Level "HEADER"
        $script:ExecutionMetrics.Phase = "Discovery"
        
        # Adjust total steps based on how many sources might actually run
        $enabledDiscoverySourcesCount = @($Configuration.discovery.enabledSources).Count
        Initialize-ProgressTracker -Phase "Discovery" -TotalSteps $enabledDiscoverySourcesCount # Or a fixed larger number if steps per source vary
        
        $discoveryResults = @{}
        $currentStep = 0

        # Helper function to safely invoke discovery modules
        function Invoke-DiscoveryModuleSafely { # Renamed from Safe-InvokeDiscoveryModule
            param(
                [string]$SourceName,
                [string]$InvokeCommandName,
                [hashtable]$Config,
                [ref]$StepRef,
                [ref]$ResultsRef
            )
            if ($Config.discovery.enabledSources -contains $SourceName) {
                $StepRef.Value++
                Update-Progress -Step $StepRef.Value -Status "$SourceName Discovery"
                if (Get-Command $InvokeCommandName -ErrorAction SilentlyContinue) {
                    Write-MandALog "Invoking $InvokeCommandName..." -Level "INFO"
                    $ResultsRef.Value.$SourceName = & $InvokeCommandName -Configuration $Config
                } else {
                    Write-MandALog "$InvokeCommandName command not found. Skipping $SourceName discovery." -Level "WARN"
                }
            }
        }

        Invoke-DiscoveryModuleSafely -SourceName "ActiveDirectory" -InvokeCommandName "Invoke-ActiveDirectoryDiscovery" -Config $Configuration -StepRef ([ref]$currentStep) -ResultsRef ([ref]$discoveryResults)
        Invoke-DiscoveryModuleSafely -SourceName "Exchange" -InvokeCommandName "Invoke-ExchangeDiscovery" -Config $Configuration -StepRef ([ref]$currentStep) -ResultsRef ([ref]$discoveryResults)
        Invoke-DiscoveryModuleSafely -SourceName "Graph" -InvokeCommandName "Invoke-GraphDiscovery" -Config $Configuration -StepRef ([ref]$currentStep) -ResultsRef ([ref]$discoveryResults)
        Invoke-DiscoveryModuleSafely -SourceName "Azure" -InvokeCommandName "Invoke-AzureDiscovery" -Config $Configuration -StepRef ([ref]$currentStep) -ResultsRef ([ref]$discoveryResults)
        Invoke-DiscoveryModuleSafely -SourceName "Intune" -InvokeCommandName "Invoke-IntuneDiscovery" -Config $Configuration -StepRef ([ref]$currentStep) -ResultsRef ([ref]$discoveryResults)
        Invoke-DiscoveryModuleSafely -SourceName "GPO" -InvokeCommandName "Invoke-GPODiscovery" -Config $Configuration -StepRef ([ref]$currentStep) -ResultsRef ([ref]$discoveryResults) # Assuming Invoke-GPODiscovery
        Invoke-DiscoveryModuleSafely -SourceName "ExternalIdentity" -InvokeCommandName "Invoke-ExternalIdentityDiscovery" -Config $Configuration -StepRef ([ref]$currentStep) -ResultsRef ([ref]$discoveryResults)
        
        # Ensure progress completes if not all sources were enabled/run
        Update-Progress -Step $enabledDiscoverySourcesCount -Status "Discovery Phase Potentially Complete" -ForceUpdate:$true
        
        Write-MandALog "Discovery phase completed successfully" -Level "SUCCESS"
        return $discoveryResults
        
    } catch {
        Write-MandALog "Discovery phase failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Invoke-ProcessingPhase {
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)] # Discovery results might be passed if not reading from file
        [hashtable]$DiscoveryData # Optional: if discovery ran in the same session
    )
    
    try {
        Write-MandALog "Starting Processing Phase" -Level "HEADER"
        $script:ExecutionMetrics.Phase = "Processing"
        
        Initialize-ProgressTracker -Phase "Processing" -TotalSteps 5 # Example steps
        
        # Step 1: Data Aggregation - Load raw data and build comprehensive relationship graph
        Update-Progress -Step 1 -Status "Aggregating Data & Building Relationship Graph"
        
        $aggregatedData = @{ Users = @(); Groups = @(); Applications = @(); ServicePrincipals = @(); DirectoryRoles = @(); OAuth2Grants = @(); AdministrativeUnits = @(); ConditionalAccess = @() }
        $rawDataPath = Join-Path $Configuration.environment.outputPath "Raw"

        # Example: Load key data files needed for aggregation. This should be more comprehensive.
        # This part needs to be robust, loading all necessary CSVs produced by the discovery phase.
        # The DataAggregation.psm1 module should ideally handle the logic of finding and loading its input files.
        Write-MandALog "Loading raw data for aggregation from $rawDataPath..." -Level "INFO"
        # Example of loading a few key files. DataAggregation.psm1 should handle this more robustly.
        if (Test-Path (Join-Path $rawDataPath "ADUsers.csv")) { $aggregatedData.Users += Import-DataFromCSV -FilePath (Join-Path $rawDataPath "ADUsers.csv") }
        if (Test-Path (Join-Path $rawDataPath "GraphUsers.csv")) { $aggregatedData.Users += Import-DataFromCSV -FilePath (Join-Path $rawDataPath "GraphUsers.csv") }
        # ... load other necessary raw data files ...

        # Call the main aggregation function (ensure New-ComprehensiveRelationshipGraph is exported by DataAggregation.psm1)
        # This function should internally load all necessary raw data files based on config and file availability.
        # The $aggregatedData passed here might be a starting point or this function could do all loading.
        # For now, assuming it takes the pre-loaded (partial) data and configuration.
        $relationshipGraph = if (Get-Command 'New-ComprehensiveRelationshipGraph' -ErrorAction SilentlyContinue) {
            New-ComprehensiveRelationshipGraph -AggregatedData $aggregatedData -Configuration $Configuration
        } else {
            Write-MandALog "New-ComprehensiveRelationshipGraph command not found. Skipping relationship graph building." -Level "WARN"; $null
        }
        $aggregatedData.Relationships = $relationshipGraph # Or merge as appropriate

        # Step 2: Build User Profiles
        Update-Progress -Step 2 -Status "Building User Profiles"
        $userProfiles = if (Get-Command 'New-UserProfiles' -ErrorAction SilentlyContinue) {
            New-UserProfiles -Data $aggregatedData -Configuration $Configuration # Pass the fully aggregated data
        } else {
            Write-MandALog "New-UserProfiles command not found. Skipping profile building." -Level "WARN"; @()
        }
        
        # Step 3: Calculate Migration Complexity
        Update-Progress -Step 3 -Status "Analyzing Migration Complexity"
        # Ensure Measure-MigrationComplexity or equivalent is exported by UserProfileBuilder.psm1 or ComplexityCalculator.psm1
        $complexityAnalysis = if (Get-Command 'Measure-MigrationComplexity' -ErrorAction SilentlyContinue) {
            Measure-MigrationComplexity -Profiles $userProfiles -Configuration $Configuration
        } else {
            Write-MandALog "Measure-MigrationComplexity command not found. Skipping complexity analysis." -Level "WARN"; $null
        }
        
        # Step 4: Generate Migration Waves
        Update-Progress -Step 4 -Status "Generating Migration Waves"
        $migrationWaves = if (Get-Command 'New-MigrationWaves' -ErrorAction SilentlyContinue) {
            New-MigrationWaves -Profiles $userProfiles -Configuration $Configuration
        } else {
            Write-MandALog "New-MigrationWaves command not found. Skipping wave generation." -Level "WARN"; @()
        }
        
        # Step 5: Validate Data Quality
        Update-Progress -Step 5 -Status "Validating Data Quality"
        $validationResults = if (Get-Command 'Test-DataQuality' -ErrorAction SilentlyContinue) {
            Test-DataQuality -Profiles $userProfiles -Configuration $Configuration # Or pass $aggregatedData
        } else {
            Write-MandALog "Test-DataQuality command not found. Skipping data validation." -Level "WARN"; $null
        }
        
        if ($validationResults -and $validationResults.InvalidRecords -gt 0) {
            if (Get-Command 'New-QualityReport' -ErrorAction SilentlyContinue) {
                $qualityReportPath = Join-Path $Configuration.environment.outputPath "Processed"
                New-QualityReport -ValidationResults $validationResults -OutputPath $qualityReportPath
            } else {
                Write-MandALog "New-QualityReport command not found. Cannot generate quality report." -Level "WARN"
            }
        }
        
        $processingResults = @{
            UserProfiles = $userProfiles
            ComplexityAnalysis = $complexityAnalysis
            MigrationWaves = $migrationWaves
            ValidationResults = $validationResults
            RelationshipGraph = $relationshipGraph # If built
            AggregatedData = $aggregatedData       # The full aggregated dataset
        }
        
        $script:ExecutionMetrics.Modules["Processing"] = @{
            UserProfilesBuilt = $userProfiles.Count
            WavesGenerated = $migrationWaves.Count
            DataQualityScore = if($validationResults) { $validationResults.QualityScore } else { "N/A" }
            ProcessingComplete = $true
        }
        
        Write-MandALog "Processing phase completed successfully" -Level "SUCCESS"
        return $processingResults
        
    } catch {
        Write-MandALog "Processing phase failed: $($_.Exception.Message)" -Level "ERROR"
        Write-MandALog "Stack trace: $($_.ScriptStackTrace)" -Level "DEBUG"
        $script:ExecutionMetrics.FailedOperations++
        $script:ExecutionMetrics.Modules["Processing"] = @{ ProcessingComplete = $false; Error = $_.Exception.Message }
        throw
    }
}

function Invoke-ExportPhase {
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration, 
        [Parameter(Mandatory=$true)] # ProcessedData must be passed from Processing phase
        [hashtable]$ProcessedData
    )
    
    try {
        Write-MandALog "Starting Export Phase" -Level "HEADER"
        $script:ExecutionMetrics.Phase = "Export"
        
        # Corrected Ternary Operator for TotalSteps
        $exportTotalSteps = @($Configuration.export.formats).Count
        $isPowerAppsOptimized = $false
        if ($Configuration.export.powerAppsOptimized) {
            if ($Configuration.export.powerAppsOptimized -is [boolean]) {
                $isPowerAppsOptimized = $Configuration.export.powerAppsOptimized
            } elseif ($Configuration.export.powerAppsOptimized -is [string] -and $Configuration.export.powerAppsOptimized.ToLower() -eq 'true') {
                $isPowerAppsOptimized = $true
            }
        }
        if ($isPowerAppsOptimized) {
             $exportTotalSteps++
        }
        Initialize-ProgressTracker -Phase "Export" -TotalSteps $exportTotalSteps
        
        $exportResults = @{}
        $currentStep = 0

        function Invoke-ExportModuleSafely { # Renamed from Safe-InvokeExportModule
            param(
                [string]$FormatName,
                [string]$InvokeCommandName,
                [hashtable]$Config,
                [hashtable]$Data,
                [ref]$StepRef,
                [ref]$ResultsRef
            )
            $StepRef.Value++
            Update-Progress -Step $StepRef.Value -Status "$FormatName Export"
            if (Get-Command $InvokeCommandName -ErrorAction SilentlyContinue) {
                Write-MandALog "Invoking $InvokeCommandName..." -Level "INFO"
                $ResultsRef.Value.$FormatName = & $InvokeCommandName -Data $Data -Configuration $Config
            } else {
                Write-MandALog "$InvokeCommandName command not found. Skipping $FormatName export." -Level "WARN"
            }
        }

        if ($Configuration.export.formats -contains "CSV") {
            Invoke-ExportModuleSafely -FormatName "CSV" -InvokeCommandName "Export-ToCSV" -Config $Configuration -Data $ProcessedData -StepRef ([ref]$currentStep) -ResultsRef ([ref]$exportResults)
        }
        if ($Configuration.export.formats -contains "Excel") {
            Invoke-ExportModuleSafely -FormatName "Excel" -InvokeCommandName "Export-ToExcel" -Config $Configuration -Data $ProcessedData -StepRef ([ref]$currentStep) -ResultsRef ([ref]$exportResults)
        }
        if ($Configuration.export.formats -contains "JSON") {
            Invoke-ExportModuleSafely -FormatName "JSON" -InvokeCommandName "Export-ToJSON" -Config $Configuration -Data $ProcessedData -StepRef ([ref]$currentStep) -ResultsRef ([ref]$exportResults)
        }
        if ($isPowerAppsOptimized) { # Use the boolean flag determined earlier
            # Assuming Export-ForPowerApps is the command for this
            Invoke-ExportModuleSafely -FormatName "PowerApps" -InvokeCommandName "Export-ForPowerApps" -Config $Configuration -Data $ProcessedData -StepRef ([ref]$currentStep) -ResultsRef ([ref]$exportResults)
        }
        
        Update-Progress -Step $currentStep -Status "Export Phase Potentially Complete" -ForceUpdate:$true

        Write-MandALog "Export phase completed successfully" -Level "SUCCESS"
        return $exportResults
        
    } catch {
        Write-MandALog "Export phase failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Complete-MandADiscovery {
    param([hashtable]$Configuration)
    
    try {
        $script:ExecutionMetrics.EndTime = Get-Date
        $script:ExecutionMetrics.Duration = $script:ExecutionMetrics.EndTime - $script:ExecutionMetrics.StartTime
        
        Write-MandALog "M&A Discovery Suite Execution Summary" -Level "HEADER"
        Write-MandALog "Total Duration: $($script:ExecutionMetrics.Duration.ToString('hh\:mm\:ss'))" -Level "SUCCESS"
        # Add more summary details if needed

        Export-ProgressMetrics -Configuration $Configuration # From ProgressTracking.psm1
        Cleanup-TempFiles -Configuration $Configuration      # From FileOperations.psm1
        
        Write-MandALog "M&A Discovery Suite completed successfully" -Level "SUCCESS"
        
    } catch {
        Write-MandALog "Completion phase failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

# --- Main execution ---
try {
    # Resolve configuration file path relative to suite root if not absolute
    $resolvedConfigFile = if ([System.IO.Path]::IsPathRooted($ConfigurationFile)) {
        $ConfigurationFile
    } else {
        Join-Path $global:MandASuiteRoot $ConfigurationFile # Assumes $global:MandASuiteRoot is set
    }
    
    if (-not (Test-Path $resolvedConfigFile -PathType Leaf)) {
        Write-Error "Configuration file not found at '$resolvedConfigFile'. Please ensure the path is correct."
        exit 1
    }
    
    $configContent = Get-Content $resolvedConfigFile | ConvertFrom-Json -ErrorAction Stop
    $script:Config = ConvertTo-HashtableFromPSObject -InputObject $configContent
    
    if ($OutputPath) { $script:Config.environment.outputPath = $OutputPath }
    if ($Force.IsPresent) { $script:Config.discovery.skipExistingFiles = $false } # skipExistingFiles = $false means force
    
    Write-Host "`nM&A Discovery Suite v4.0 - Modular Orchestrator" -ForegroundColor Cyan
    Write-Host "Mode: $Mode | Config: $resolvedConfigFile" -ForegroundColor Yellow
    
    # Initialize environment - pass the current $Mode to it
    if (-not (Initialize-MandAEnvironment -Configuration $script:Config -CurrentMode $Mode -ValidateOnly:$ValidateOnly)) {
        throw "Environment initialization failed"
    }
    
    if ($ValidateOnly) {
        Write-MandALog "Validation Only Mode: Orchestrator configuration and prerequisites appear valid." -Level "SUCCESS"
        Write-MandALog "No discovery, processing, or export operations were performed." -Level "INFO"
        exit 0
    }
    
    # Authenticate (Authentication.psm1)
    if (-not (Initialize-MandAAuthentication -Configuration $script:Config)) {
        throw "Authentication failed"
    }
    
    # Establish connections (EnhancedConnectionManager.psm1)
    if (-not (Initialize-AllConnections -Configuration $script:Config)) {
        # This function should internally log detailed errors/warnings
        Write-MandALog "One or more service connections failed. Suite will attempt to proceed with limited functionality." -Level "WARN"
    }
    
    $discoveryResults = $null
    $processingResults = $null
    # $exportResults = $null # Not used directly in this flow

    if ($Mode -in @("Discovery", "Full")) {
        $discoveryResults = Invoke-DiscoveryPhase -Configuration $script:Config
    }
    
    if ($Mode -in @("Processing", "Full")) {
        # Processing phase might need to load data if not passed directly from discovery
        # For a "Processing" only mode, $discoveryResults would be $null.
        # The Invoke-ProcessingPhase should handle loading raw data from files.
        $processingResults = Invoke-ProcessingPhase -Configuration $script:Config # -DiscoveryData $discoveryResults (optional)
    }
    
    if ($Mode -in @("Export", "Full")) {
        if ($null -eq $processingResults -and $Mode -ne "Processing") { # If mode is "Export" but processing didn't run in this session
             Write-MandALog "Export mode selected, but no processed data available from this session. Ensure processing has been run previously and data exists in Processed folder." -Level "WARN"
             # Invoke-ExportPhase should load data from files if $ProcessedData is not supplied or is empty.
             # For now, it requires $ProcessedData. This needs careful design for standalone export.
             # A simple approach: if $processingResults is null, try to load key processed files.
             # For now, we assume if "Export" or "Full" is chosen, processing data is available or generated.
        }
         if ($null -ne $processingResults -or ($Mode -eq "Export")) { # For "Export" only mode, $processingResults will be $null initially
            # If $processingResults is $null in "Export" only mode, Invoke-ExportPhase must load data itself.
            # This is a placeholder; Invoke-ExportPhase needs to be robust enough to load its own input.
            Invoke-ExportPhase -Configuration $script:Config -ProcessedData $processingResults
        } else {
            Write-MandALog "Skipping Export Phase as no processed data is available (e.g. Processing phase did not run or failed)." -Level "WARN"
        }
    }
    
    Complete-MandADiscovery -Configuration $script:Config
    
} catch {
    Write-MandALog "ORCHESTRATOR CRITICAL ERROR: $($_.Exception.Message)" -Level "CRITICAL_ERROR"
    if ($_.ScriptStackTrace) {
        Write-MandALog "Stack Trace: $($_.ScriptStackTrace)" -Level "DEBUG"
    }
    if ($_.Exception.InnerException) {
        Write-MandALog "Inner Exception: $($_.Exception.InnerException.Message)" -Level "DEBUG"
    }
    # Consider more detailed error logging to a dedicated error file here
    exit 1
    
} finally {
    try {
        if (Get-Command 'Disconnect-AllServices' -ErrorAction SilentlyContinue) {
            Disconnect-AllServices # From EnhancedConnectionManager.psm1
        }
    } catch {
        Write-MandALog "Error during final service disconnection: $($_.Exception.Message)" -Level "WARN"
    }
    Write-MandALog "Orchestrator execution finished at $(Get-Date)." -Level "INFO"
}
