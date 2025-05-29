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
    # If running standalone, Set-SuiteEnvironment.ps1 should ideally be sourced
    # For now, we rely on QuickStart.ps1 to source Set-SuiteEnvironment.ps1 which sets $global:MandASuiteRoot
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
        
        # Get-RequiredModules is expected to be in ValidationHelpers.psm1 (loaded in $InitialEssentialModulePaths)
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
        Update-Progress -Step $enabledDiscoverySourcesCount -Status "Discovery Phase Potentially Complete" -ForceUpdate:$true # Ensure progress bar completes
        Write-MandALog "Discovery phase completed successfully" -Level "SUCCESS"; return $discoveryResults
    } catch { Write-MandALog "Discovery phase failed: $($_.Exception.Message)" -Level "ERROR"; throw }
}

function Invoke-ProcessingPhase {
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "Starting Processing Phase" -Level "HEADER"
        $script:ExecutionMetrics.Phase = "Processing"
        
        Initialize-ProgressTracker -Phase "Processing" -TotalSteps 5 
        
        # Step 1: Data Aggregation (from DataAggregation.psm1)
        Update-Progress -Step 1 -Status "Invoking Data Aggregation"
        $rawDataPath = Join-Path $Configuration.environment.outputPath "Raw"
        $aggregationOutput = $null # This will hold {AggregatedDataStore, RelationshipGraph}

        if (Get-Command 'Invoke-DataAggregation' -ErrorAction SilentlyContinue) {
            $aggregationOutput = Invoke-DataAggregation -RawDataPath $rawDataPath -Configuration $Configuration
        } else {
            Write-MandALog "Invoke-DataAggregation command not found. Critical for processing. Aborting Processing Phase." -Level "ERROR"
            throw "Invoke-DataAggregation module/command not found."
        }

        # Extract data from the aggregation output
        $aggregatedDataStore = $aggregationOutput.AggregatedDataStore
        $relationshipGraph = $aggregationOutput.RelationshipGraph
        
        if ($null -eq $aggregatedDataStore) {
            Write-MandALog "Data Aggregation did not return aggregated data. Aborting Processing Phase." -Level "ERROR"
            throw "Data Aggregation failed to produce data."
        }
        Write-MandALog "Data Aggregation completed. $($aggregatedDataStore.Users.Count) users (example key) in aggregated store." -Level "INFO"

        # Step 2: Build User Profiles (from UserProfileBuilder.psm1)
        # New-UserProfiles should expect $AggregatedDataStore and $RelationshipGraph
        Update-Progress -Step 2 -Status "Building User Profiles"
        $userProfiles = if (Get-Command 'New-UserProfiles' -ErrorAction SilentlyContinue) {
            New-UserProfiles -AggregatedDataStore $aggregatedDataStore -RelationshipGraph $relationshipGraph -Configuration $Configuration 
        } else {
            Write-MandALog "New-UserProfiles command not found. Skipping profile building." -Level "WARN"; @()
        }
        
        # Step 3: Calculate Migration Complexity (from UserProfileBuilder.psm1 or ComplexityCalculator.psm1)
        # Ensure Measure-MigrationComplexity (or your chosen name) is exported and handles $userProfiles
        Update-Progress -Step 3 -Status "Analyzing Migration Complexity"
        $complexityAnalysis = if (Get-Command 'Measure-MigrationComplexity' -ErrorAction SilentlyContinue) {
            Measure-MigrationComplexity -Profiles $userProfiles -Configuration $Configuration
        } else {
            Write-MandALog "Measure-MigrationComplexity command not found. Skipping complexity analysis." -Level "WARN"; $null
        }
        
        # Step 4: Generate Migration Waves (from WaveGeneration.psm1)
        # New-MigrationWaves should expect $userProfiles
        Update-Progress -Step 4 -Status "Generating Migration Waves"
        $migrationWaves = if (Get-Command 'New-MigrationWaves' -ErrorAction SilentlyContinue) {
            New-MigrationWaves -Profiles $userProfiles -Configuration $Configuration
        } else {
            Write-MandALog "New-MigrationWaves command not found. Skipping wave generation." -Level "WARN"; @()
        }
        
        # Step 5: Validate Data Quality (from DataValidation.psm1)
        # Test-DataQuality should expect $userProfiles or perhaps $aggregatedDataStore
        Update-Progress -Step 5 -Status "Validating Data Quality"
        $validationResults = if (Get-Command 'Test-DataQuality' -ErrorAction SilentlyContinue) {
            Test-DataQuality -Profiles $userProfiles -Configuration $Configuration 
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
        
        # This is the $ProcessedData object that will be passed to the Export phase
        $processingResults = @{
            UserProfiles = $userProfiles
            ComplexityAnalysis = $complexityAnalysis
            MigrationWaves = $migrationWaves
            ValidationResults = $validationResults
            RelationshipGraph = $relationshipGraph # Included for potential direct export or detailed analysis
            AggregatedDataStore = $aggregatedDataStore # Included for potential direct export or detailed analysis
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
        [Parameter(Mandatory=$true)] # $ProcessedData comes from Invoke-ProcessingPhase
        [hashtable]$ProcessedData 
    )
    try {
        Write-MandALog "Starting Export Phase" -Level "HEADER"
        $script:ExecutionMetrics.Phase = "Export"
        
        $exportFormatsCount = @($Configuration.export.formats).Count
        $isPowerAppsOptimized = $false
        if ($Configuration.export.powerAppsOptimized) {
            if ($Configuration.export.powerAppsOptimized -is [boolean]) { $isPowerAppsOptimized = $Configuration.export.powerAppsOptimized }
            elseif ($Configuration.export.powerAppsOptimized -is [string] -and $Configuration.export.powerAppsOptimized.ToLower() -eq 'true') { $isPowerAppsOptimized = $true }
        }
        $powerAppsStep = if ($isPowerAppsOptimized) { 1 } else { 0 }
        $exportTotalSteps = $exportFormatsCount + $powerAppsStep
        
        Initialize-ProgressTracker -Phase "Export" -TotalSteps $exportTotalSteps

        $exportResults = @{}; $currentStep = 0
        
        function Invoke-ExportModuleSafely { 
            param([string]$FormatName, [string]$InvokeCommandName, [hashtable]$Config, [hashtable]$DataToExport, [ref]$StepRef, [ref]$ResultsRef) # Renamed $Data to $DataToExport
            $StepRef.Value++; Update-Progress -Step $StepRef.Value -Status "$FormatName Export"
            if (Get-Command $InvokeCommandName -ErrorAction SilentlyContinue) {
                Write-MandALog "Invoking $InvokeCommandName..." -Level "INFO"
                # Each export module receives the entire $ProcessedData hashtable
                $ResultsRef.Value.$FormatName = & $InvokeCommandName -ProcessedData $DataToExport -Configuration $Config 
            } else { Write-MandALog "$InvokeCommandName command not found. Skipping $FormatName export." -Level "WARN" }
        }

        # Pass the entire $ProcessedData to each export module
        if ($Configuration.export.formats -contains "CSV") { Invoke-ExportModuleSafely -FormatName "CSV" -InvokeCommandName "Export-ToCSV" -Config $Configuration -DataToExport $ProcessedData -StepRef ([ref]$currentStep) -ResultsRef ([ref]$exportResults) }
        if ($Configuration.export.formats -contains "Excel") { Invoke-ExportModuleSafely -FormatName "Excel" -InvokeCommandName "Export-ToExcel" -Config $Configuration -DataToExport $ProcessedData -StepRef ([ref]$currentStep) -ResultsRef ([ref]$exportResults) }
        if ($Configuration.export.formats -contains "JSON") { Invoke-ExportModuleSafely -FormatName "JSON" -InvokeCommandName "Export-ToJSON" -Config $Configuration -DataToExport $ProcessedData -StepRef ([ref]$currentStep) -ResultsRef ([ref]$exportResults) }
        if ($isPowerAppsOptimized) { Invoke-ExportModuleSafely -FormatName "PowerApps" -InvokeCommandName "Export-ForPowerApps" -Config $Configuration -DataToExport $ProcessedData -StepRef ([ref]$currentStep) -ResultsRef ([ref]$exportResults) }
        
        Update-Progress -Step $currentStep -Status "Export Phase Potentially Complete" -ForceUpdate:$true # Ensure progress bar completes
        Write-MandALog "Export phase completed successfully" -Level "SUCCESS"; return $exportResults
    } catch { Write-MandALog "Export phase failed: $($_.Exception.Message)" -Level "ERROR"; throw }


if ($Configuration.export.formats -contains "CompanyControlSheet" -or $Configuration.export.exportAllCustomSheets) { # Example config check
    Write-MandALog "Invoking Company Control Sheet Exporter..." -Level "INFO"
    Export-ToCompanyControlSheet -ProcessedData $ProcessedData -Configuration $Configuration
}


}

function Complete-MandADiscovery {
    param([hashtable]$Configuration)
    try {
        $script:ExecutionMetrics.EndTime = Get-Date
        $script:ExecutionMetrics.Duration = $script:ExecutionMetrics.EndTime - $script:ExecutionMetrics.StartTime
        Write-MandALog "M&A Discovery Suite Execution Summary" -Level "HEADER"
        Write-MandALog "Total Duration: $($script:ExecutionMetrics.Duration.ToString('hh\:mm\:ss'))" -Level "SUCCESS"
        # Add more summary details if needed from $script:ExecutionMetrics

        Export-ProgressMetrics -Configuration $Configuration 
        Cleanup-TempFiles -Configuration $Configuration      
        Write-MandALog "M&A Discovery Suite completed successfully" -Level "SUCCESS"
    } catch { Write-MandALog "Completion phase failed: $($_.Exception.Message)" -Level "ERROR"; throw }
}

# --- Main execution ---
try {
    $resolvedConfigFile = if ([System.IO.Path]::IsPathRooted($ConfigurationFile)) { $ConfigurationFile }
    else { Join-Path $global:MandASuiteRoot $ConfigurationFile } # Assumes $global:MandASuiteRoot is set by Set-SuiteEnvironment
    
    if (-not (Test-Path $resolvedConfigFile -PathType Leaf)) { Write-Error "Configuration file not found at '$resolvedConfigFile'. Please ensure the path is correct."; exit 1 }
    
    $configContent = Get-Content $resolvedConfigFile | ConvertFrom-Json -ErrorAction Stop
    $script:Config = ConvertTo-HashtableFromPSObject -InputObject $configContent
    
    if ($OutputPath) { $script:Config.environment.outputPath = $OutputPath }
    if ($Force.IsPresent) { $script:Config.discovery.skipExistingFiles = $false }
    
    Write-Host "`nM&A Discovery Suite v4.0 - Modular Orchestrator" -ForegroundColor Cyan
    Write-Host "Mode: $Mode | Config: $resolvedConfigFile" -ForegroundColor Yellow
    
    if (-not (Initialize-MandAEnvironment -Configuration $script:Config -CurrentMode $Mode -ValidateOnly:$ValidateOnly)) { throw "Environment initialization failed" }
    
    if ($ValidateOnly) { Write-MandALog "Validation Only Mode: Orchestrator configuration and prerequisites appear valid." -Level "SUCCESS"; Write-MandALog "No discovery, processing, or export operations were performed." -Level "INFO"; exit 0 }
    
    if (-not (Initialize-MandAAuthentication -Configuration $script:Config)) { throw "Authentication failed" }
    if (-not (Initialize-AllConnections -Configuration $script:Config)) { Write-MandALog "One or more service connections failed. Suite will attempt to proceed with limited functionality." -Level "WARN" }
    
    $discoveryResults = $null
    $processingResults = $null # This will hold the output from Invoke-ProcessingPhase

    if ($Mode -in @("Discovery", "Full")) {
        $discoveryResults = Invoke-DiscoveryPhase -Configuration $script:Config
    }
    
    if ($Mode -in @("Processing", "Full")) {
        $processingResults = Invoke-ProcessingPhase -Configuration $script:Config
    }
    
    if ($Mode -in @("Export", "Full")) {
        if ($null -eq $processingResults -and $Mode -eq "Export") { 
            # If running Export only mode, $processingResults will be $null.
            # We need to indicate to Invoke-ExportPhase that it might need to load data.
            # For now, we pass $null; the export modules would need to be smart enough
            # or we add logic here to load previously processed data.
            # A simpler contract for now: Export phase always expects $processingResults from the same session or a previous "Processing" / "Full" run's files.
            Write-MandALog "Export mode selected. Attempting to use previously processed data. Ensure Processing phase has run successfully." -Level "INFO"
            # The Invoke-ExportPhase will receive $processingResults as $null in this specific "Export Only" case
            # if processing didn't run in the same orchestrator session.
            # The export modules themselves will need to load data from "Processed" folder if $ProcessedData.UserProfiles (etc.) is $null or empty.
        }

        if ($null -ne $processingResults) {
            Invoke-ExportPhase -Configuration $script:Config -ProcessedData $processingResults 
        } elseif ($Mode -eq "Export") {
             # Allow Export mode to run even if $processingResults is null from this session.
             # The export modules must be capable of loading their own input from files.
            Write-MandALog "Running Export phase. Modules will attempt to load data from the 'Processed' directory." -Level "INFO"
            Invoke-ExportPhase -Configuration $script:Config -ProcessedData $null # Explicitly pass $null
        } else { 
            Write-MandALog "Skipping Export Phase as no processed data is available from the current session (e.g., Discovery-only mode or Processing phase failed)." -Level "WARN"
        }
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
