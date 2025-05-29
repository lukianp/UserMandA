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
if (-not $global:MandASuiteRoot) {
    $script:SuiteRoot = Split-Path $PSScriptRoot -Parent
    Write-Warning "global:MandASuiteRoot not set. Assuming SuiteRoot is: $($script:SuiteRoot)"
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
        Import-Module $ModulePath -Force -Global
        Write-Verbose "Statically imported essential module: $(Split-Path $ModulePath -Leaf)"
    } else {
        Write-Error "CRITICAL: Essential module not found: $ModulePath. Orchestrator cannot continue."
        exit 1
    }
}

function ConvertTo-HashtableFromPSObject {
    param (
        [Parameter(Mandatory=$true)]
        [AllowNull()]$InputObject
    )
    if ($null -eq $InputObject) { return $null }
    if ($InputObject -is [System.Collections.IEnumerable] -and $InputObject -isnot [string]) {
        $collection = @( foreach ($objectInCollection in $InputObject) { ConvertTo-HashtableFromPSObject -InputObject $objectInCollection })
        return $collection
    } elseif ($InputObject.PSObject.BaseObject -is [System.Management.Automation.PSCustomObject] -or $InputObject.GetType().Name -eq 'PSCustomObject') {
        $hashtable = @{}
        foreach ($property in $InputObject.PSObject.Properties) { $hashtable[$property.Name] = ConvertTo-HashtableFromPSObject -InputObject $property.Value }
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
        [string]$CurrentMode, 
        [switch]$ValidateOnly
    )
    try {
        Write-MandALog "Initializing M&A Discovery Environment for Mode: $CurrentMode" -Level "HEADER"
        Initialize-Logging -Configuration $Configuration
        Initialize-OutputDirectories -Configuration $Configuration
        if (-not (Test-Prerequisites -Configuration $Configuration -ValidateOnly:$ValidateOnly)) { throw "System prerequisites validation failed" }
        $ModulesToLoadPaths = Get-RequiredModules -Configuration $Configuration -Mode $CurrentMode
        Write-MandALog "Dynamically loading $($ModulesToLoadPaths.Count) modules for mode '$CurrentMode'..." -Level "INFO"
        foreach ($ModuleFile in $ModulesToLoadPaths) {
            if (Test-Path $ModuleFile) { Import-Module $ModuleFile -Force -Global; Write-MandALog "Loaded module: $(Split-Path $ModuleFile -Leaf)" -Level "SUCCESS" }
            else { Write-MandALog "Module file not found: $ModuleFile. Functionality depending on this module will be skipped." -Level "WARN" }
        }
        Write-MandALog "Environment initialization completed successfully" -Level "SUCCESS"
        return $true
    } catch { Write-MandALog "Environment initialization failed: $($_.Exception.Message)" -Level "ERROR"; throw }
}

function Invoke-DiscoveryPhase {
    param([hashtable]$Configuration)
    try {
        Write-MandALog "Starting Discovery Phase" -Level "HEADER"
        $script:ExecutionMetrics.Phase = "Discovery"
        $enabledDiscoverySourcesCount = @($Configuration.discovery.enabledSources).Count
        Initialize-ProgressTracker -Phase "Discovery" -TotalSteps $enabledDiscoverySourcesCount
        $discoveryResults = @{}; $currentStep = 0
        function Invoke-DiscoveryModuleSafely { 
            param([string]$SourceName, [string]$InvokeCommandName, [hashtable]$Config, [ref]$StepRef, [ref]$ResultsRef)
            if ($Config.discovery.enabledSources -contains $SourceName) {
                $StepRef.Value++; Update-Progress -Step $StepRef.Value -Status "$SourceName Discovery"
                if (Get-Command $InvokeCommandName -ErrorAction SilentlyContinue) {
                    Write-MandALog "Invoking $InvokeCommandName..." -Level "INFO"; $ResultsRef.Value.$SourceName = & $InvokeCommandName -Configuration $Config
                } else { Write-MandALog "$InvokeCommandName command not found. Skipping $SourceName discovery." -Level "WARN" }
            }
        }
        Invoke-DiscoveryModuleSafely -SourceName "ActiveDirectory" -InvokeCommandName "Invoke-ActiveDirectoryDiscovery" -Config $Configuration -StepRef ([ref]$currentStep) -ResultsRef ([ref]$discoveryResults)
        Invoke-DiscoveryModuleSafely -SourceName "Exchange" -InvokeCommandName "Invoke-ExchangeDiscovery" -Config $Configuration -StepRef ([ref]$currentStep) -ResultsRef ([ref]$discoveryResults)
        Invoke-DiscoveryModuleSafely -SourceName "Graph" -InvokeCommandName "Invoke-GraphDiscovery" -Config $Configuration -StepRef ([ref]$currentStep) -ResultsRef ([ref]$discoveryResults)
        Invoke-DiscoveryModuleSafely -SourceName "Azure" -InvokeCommandName "Invoke-AzureDiscovery" -Config $Configuration -StepRef ([ref]$currentStep) -ResultsRef ([ref]$discoveryResults)
        Invoke-DiscoveryModuleSafely -SourceName "Intune" -InvokeCommandName "Invoke-IntuneDiscovery" -Config $Configuration -StepRef ([ref]$currentStep) -ResultsRef ([ref]$discoveryResults)
        Invoke-DiscoveryModuleSafely -SourceName "GPO" -InvokeCommandName "Invoke-GPODiscovery" -Config $Configuration -StepRef ([ref]$currentStep) -ResultsRef ([ref]$discoveryResults) 
        Invoke-DiscoveryModuleSafely -SourceName "ExternalIdentity" -InvokeCommandName "Invoke-ExternalIdentityDiscovery" -Config $Configuration -StepRef ([ref]$currentStep) -ResultsRef ([ref]$discoveryResults)
        Update-Progress -Step $enabledDiscoverySourcesCount -Status "Discovery Phase Potentially Complete" -ForceUpdate:$true
        Write-MandALog "Discovery phase completed successfully" -Level "SUCCESS"; return $discoveryResults
    } catch { Write-MandALog "Discovery phase failed: $($_.Exception.Message)" -Level "ERROR"; throw }
}

function Invoke-ProcessingPhase {
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
        # Removed $DiscoveryData parameter as DataAggregation will handle loading its inputs
    )
    
    try {
        Write-MandALog "Starting Processing Phase" -Level "HEADER"
        $script:ExecutionMetrics.Phase = "Processing"
        
        Initialize-ProgressTracker -Phase "Processing" -TotalSteps 5 # Step 1: Aggregation, Step 2: Profiling, Step 3: Complexity, Step 4: Waves, Step 5: Validation
        
        # Step 1: Data Aggregation (now self-contained in DataAggregation.psm1)
        Update-Progress -Step 1 -Status "Invoking Data Aggregation"
        $rawDataPath = Join-Path $Configuration.environment.outputPath "Raw"
        $aggregationOutput = $null
        if (Get-Command 'Invoke-DataAggregation' -ErrorAction SilentlyContinue) {
            # Invoke-DataAggregation should return a hashtable with keys like 'AggregatedDataStore' and 'RelationshipGraph'
            $aggregationOutput = Invoke-DataAggregation -RawDataPath $rawDataPath -Configuration $Configuration
        } else {
            Write-MandALog "Invoke-DataAggregation command not found. Critical for processing. Aborting Processing Phase." -Level "ERROR"
            throw "Invoke-DataAggregation module/command not found."
        }

        # Extract the actual aggregated data and relationship graph from the output
        $aggregatedDataStore = $aggregationOutput.AggregatedDataStore
        $relationshipGraph = $aggregationOutput.RelationshipGraph
        
        if ($null -eq $aggregatedDataStore) {
            Write-MandALog "Data Aggregation did not return aggregated data. Aborting Processing Phase." -Level "ERROR"
            throw "Data Aggregation failed to produce data."
        }
        Write-MandALog "Data Aggregation completed. $($aggregatedDataStore.Users.Count) users (example count) in aggregated store." -Level "INFO"

        # Step 2: Build User Profiles
        Update-Progress -Step 2 -Status "Building User Profiles"
        $userProfiles = if (Get-Command 'New-UserProfiles' -ErrorAction SilentlyContinue) {
            New-UserProfiles -AggregatedDataStore $aggregatedDataStore -RelationshipGraph $relationshipGraph -Configuration $Configuration 
        } else {
            Write-MandALog "New-UserProfiles command not found. Skipping profile building." -Level "WARN"; @()
        }
        
        # Step 3: Calculate Migration Complexity
        Update-Progress -Step 3 -Status "Analyzing Migration Complexity"
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
            Test-DataQuality -Profiles $userProfiles -Configuration $Configuration # Or pass $aggregatedDataStore
        } else {
            Write-MandALog "Test-DataQuality command not found. Skipping data validation." -Level "WARN"; $null
        }
        
        if ($validationResults -and $validationResults.GetType().GetProperty('InvalidRecords') -and $validationResults.InvalidRecords -gt 0) {
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
            RelationshipGraph = $relationshipGraph 
            AggregatedDataStore = $aggregatedDataStore       
        }
        
        $script:ExecutionMetrics.Modules["Processing"] = @{
            UserProfilesBuilt = if($userProfiles) {$userProfiles.Count} else {0}
            WavesGenerated = if($migrationWaves) {$migrationWaves.Count} else {0}
            DataQualityScore = if($validationResults -and $validationResults.GetType().GetProperty('QualityScore')) { $validationResults.QualityScore } else { "N/A" }
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
        [Parameter(Mandatory=$true)] 
        [hashtable]$ProcessedData
    )
    try {
        Write-MandALog "Starting Export Phase" -Level "HEADER"
        $script:ExecutionMetrics.Phase = "Export"
        $exportTotalSteps = @($Configuration.export.formats).Count
        $isPowerAppsOptimized = $false
        if ($Configuration.export.powerAppsOptimized) {
            if ($Configuration.export.powerAppsOptimized -is [boolean]) { $isPowerAppsOptimized = $Configuration.export.powerAppsOptimized }
            elseif ($Configuration.export.powerAppsOptimized -is [string] -and $Configuration.export.powerAppsOptimized.ToLower() -eq 'true') { $isPowerAppsOptimized = $true }
        }
        if ($isPowerAppsOptimized) { $exportTotalSteps++ }
        Initialize-ProgressTracker -Phase "Export" -TotalSteps $exportTotalSteps
        $exportResults = @{}; $currentStep = 0
        function Invoke-ExportModuleSafely { 
            param([string]$FormatName, [string]$InvokeCommandName, [hashtable]$Config, [hashtable]$Data, [ref]$StepRef, [ref]$ResultsRef)
            $StepRef.Value++; Update-Progress -Step $StepRef.Value -Status "$FormatName Export"
            if (Get-Command $InvokeCommandName -ErrorAction SilentlyContinue) {
                Write-MandALog "Invoking $InvokeCommandName..." -Level "INFO"; $ResultsRef.Value.$FormatName = & $InvokeCommandName -Data $Data -Configuration $Config
            } else { Write-MandALog "$InvokeCommandName command not found. Skipping $FormatName export." -Level "WARN" }
        }
        if ($Configuration.export.formats -contains "CSV") { Invoke-ExportModuleSafely -FormatName "CSV" -InvokeCommandName "Export-ToCSV" -Config $Configuration -Data $ProcessedData -StepRef ([ref]$currentStep) -ResultsRef ([ref]$exportResults) }
        if ($Configuration.export.formats -contains "Excel") { Invoke-ExportModuleSafely -FormatName "Excel" -InvokeCommandName "Export-ToExcel" -Config $Configuration -Data $ProcessedData -StepRef ([ref]$currentStep) -ResultsRef ([ref]$exportResults) }
        if ($Configuration.export.formats -contains "JSON") { Invoke-ExportModuleSafely -FormatName "JSON" -InvokeCommandName "Export-ToJSON" -Config $Configuration -Data $ProcessedData -StepRef ([ref]$currentStep) -ResultsRef ([ref]$exportResults) }
        if ($isPowerAppsOptimized) { Invoke-ExportModuleSafely -FormatName "PowerApps" -InvokeCommandName "Export-ForPowerApps" -Config $Configuration -Data $ProcessedData -StepRef ([ref]$currentStep) -ResultsRef ([ref]$exportResults) }
        Update-Progress -Step $currentStep -Status "Export Phase Potentially Complete" -ForceUpdate:$true
        Write-MandALog "Export phase completed successfully" -Level "SUCCESS"; return $exportResults
    } catch { Write-MandALog "Export phase failed: $($_.Exception.Message)" -Level "ERROR"; throw }
}

function Complete-MandADiscovery {
    param([hashtable]$Configuration)
    try {
        $script:ExecutionMetrics.EndTime = Get-Date
        $script:ExecutionMetrics.Duration = $script:ExecutionMetrics.EndTime - $script:ExecutionMetrics.StartTime
        Write-MandALog "M&A Discovery Suite Execution Summary" -Level "HEADER"
        Write-MandALog "Total Duration: $($script:ExecutionMetrics.Duration.ToString('hh\:mm\:ss'))" -Level "SUCCESS"
        Export-ProgressMetrics -Configuration $Configuration 
        Cleanup-TempFiles -Configuration $Configuration      
        Write-MandALog "M&A Discovery Suite completed successfully" -Level "SUCCESS"
    } catch { Write-MandALog "Completion phase failed: $($_.Exception.Message)" -Level "ERROR"; throw }
}

# --- Main execution ---
try {
    $resolvedConfigFile = if ([System.IO.Path]::IsPathRooted($ConfigurationFile)) { $ConfigurationFile }
    else { Join-Path $global:MandASuiteRoot $ConfigurationFile }
    if (-not (Test-Path $resolvedConfigFile -PathType Leaf)) { Write-Error "Configuration file not found at '$resolvedConfigFile'."; exit 1 }
    $configContent = Get-Content $resolvedConfigFile | ConvertFrom-Json -ErrorAction Stop
    $script:Config = ConvertTo-HashtableFromPSObject -InputObject $configContent
    if ($OutputPath) { $script:Config.environment.outputPath = $OutputPath }
    if ($Force.IsPresent) { $script:Config.discovery.skipExistingFiles = $false }
    Write-Host "`nM&A Discovery Suite v4.0 - Modular Orchestrator" -ForegroundColor Cyan
    Write-Host "Mode: $Mode | Config: $resolvedConfigFile" -ForegroundColor Yellow
    if (-not (Initialize-MandAEnvironment -Configuration $script:Config -CurrentMode $Mode -ValidateOnly:$ValidateOnly)) { throw "Environment initialization failed" }
    if ($ValidateOnly) { Write-MandALog "Validation Only Mode: Completed." -Level "SUCCESS"; exit 0 }
    if (-not (Initialize-MandAAuthentication -Configuration $script:Config)) { throw "Authentication failed" }
    if (-not (Initialize-AllConnections -Configuration $script:Config)) { Write-MandALog "One or more service connections failed." -Level "WARN" }
    $discoveryResults = $null; $processingResults = $null
    if ($Mode -in @("Discovery", "Full")) { $discoveryResults = Invoke-DiscoveryPhase -Configuration $script:Config }
    if ($Mode -in @("Processing", "Full")) { $processingResults = Invoke-ProcessingPhase -Configuration $script:Config }
    if ($Mode -in @("Export", "Full")) {
        if ($null -eq $processingResults -and $Mode -ne "Processing") { 
            Write-MandALog "Export mode requires processed data. Attempting to use existing." -Level "WARN"
            # If $processingResults is $null here, it means processing didn't run in this session.
            # Invoke-ExportPhase will need to handle loading data from files if $ProcessedData is $null.
            # For now, we'll pass $null, and the export modules should be designed to load if data isn't passed.
        }
        if ($null -ne $processingResults -or ($Mode -eq "Export")) { 
            Invoke-ExportPhase -Configuration $script:Config -ProcessedData $processingResults 
        } else { Write-MandALog "Skipping Export Phase as no processed data is available." -Level "WARN" }
    }
    Complete-MandADiscovery -Configuration $script:Config
} catch {
    Write-MandALog "ORCHESTRATOR CRITICAL ERROR: $($_.Exception.Message)" -Level "CRITICAL_ERROR"
    if ($_.ScriptStackTrace) { Write-MandALog "Stack Trace: $($_.ScriptStackTrace)" -Level "DEBUG" }
    if ($_.Exception.InnerException) { Write-MandALog "Inner Exception: $($_.Exception.InnerException.Message)" -Level "DEBUG" }
    exit 1
} finally {
    try { if (Get-Command 'Disconnect-AllServices' -ErrorAction SilentlyContinue) { Disconnect-AllServices } }
    catch { Write-MandALog "Error during final service disconnection: $($_.Exception.Message)" -Level "WARN" }
    Write-MandALog "Orchestrator execution finished at $(Get-Date)." -Level "INFO"
}
