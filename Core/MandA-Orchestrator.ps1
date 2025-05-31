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
    $script:SuiteRoot = Split-Path $PSScriptRoot -Parent
    Write-Warning "global:MandASuiteRoot was not set (e.g., by QuickStart.ps1 sourcing Set-SuiteEnvironment.ps1). Attempting to derive SuiteRoot as: $($script:SuiteRoot). This might be unreliable if the script structure is different."
    $global:MandASuiteRoot = $script:SuiteRoot 
}
if (-not (Test-Path $global:MandASuiteRoot -PathType Container)) {
    Write-Error "CRITICAL: MandASuiteRoot ('$($global:MandASuiteRoot)') is not a valid directory. Cannot proceed."
    exit 1
}


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
    (Join-Path $global:MandASuiteRoot "Modules\Authentication\CredentialManagement.psm1"), # <-- ADDED THIS LINE
    (Join-Path $global:MandASuiteRoot "Modules\Connectivity\EnhancedConnectionManager.psm1") 
)

foreach ($ModulePath in $InitialEssentialModulePaths) {
    if (Test-Path $ModulePath) { 
        Import-Module $ModulePath -Force -Global 
        Write-Verbose "Statically imported essential module: $(Split-Path $ModulePath -Leaf)" 
    }
    else { 
        Write-Error "CRITICAL: Essential module not found: $ModulePath. Orchestrator cannot continue."
        exit 1 
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
        $collection = @( foreach ($objectInCollection in $InputObject) { ConvertTo-HashtableFromPSObject -InputObject $objectInCollection })
        return $collection
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
        Initialize-Logging -Configuration $Configuration
        Initialize-OutputDirectories -Configuration $Configuration
        if (-not (Test-Prerequisites -Configuration $Configuration -ValidateOnly:$ValidateOnly.IsPresent)) { 
            throw "System prerequisites validation failed" 
        }
        $ModulesToLoadPaths = Get-RequiredModules -Configuration $Configuration -Mode $CurrentMode
        Write-MandALog "Dynamically loading $($ModulesToLoadPaths.Count) modules for mode '$CurrentMode'..." -Level "INFO"
        foreach ($ModuleFile in $ModulesToLoadPaths) {
            if (Test-Path $ModuleFile) { 
                Import-Module $ModuleFile -Force -Global 
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
        throw 
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
        if ($script:ExecutionMetrics -is [hashtable]) {
            $script:ExecutionMetrics.Phase = "Discovery" 
        } else {
             Write-MandALog "\$script:ExecutionMetrics is not a hashtable before Discovery. Re-initializing." -Level "WARN"
             $script:ExecutionMetrics = @{ Phase = "Discovery" } 
        }
        $enabledDiscoverySources = @($Configuration.discovery.enabledSources) 
        $enabledDiscoverySourcesCount = $enabledDiscoverySources.Count
        Initialize-ProgressTracker -Phase "Discovery" -TotalSteps $enabledDiscoverySourcesCount
        $discoveryResults = @{}; $currentStep = 0
        
        function Invoke-DiscoveryModuleSafely { 
            [CmdletBinding()]
            param(
                [string]$SourceName, 
                [string]$InvokeCommandName, 
                [hashtable]$Config, 
                [ref]$StepRef, 
                [ref]$ResultsRef 
            )
            if ($enabledDiscoverySources -contains $SourceName) {
                $StepRef.Value++ 
                if ($script:ExecutionMetrics -isnot [hashtable]) { $script:ExecutionMetrics = @{} }
                $script:ExecutionMetrics.CurrentStepSource = $SourceName 
                Update-Progress -Step $StepRef.Value -Status "$SourceName Discovery"
                if (Get-Command $InvokeCommandName -ErrorAction SilentlyContinue) {
                    Write-MandALog "Invoking $InvokeCommandName..." -Level "INFO"
                    try {
                        $ResultsRef.Value.$SourceName = & $InvokeCommandName -Configuration $Config -ErrorAction Stop
                    } catch {
                         Write-MandALog "Error executing $InvokeCommandName for $SourceName $($_.Exception.Message)" -Level "ERROR"
                         $ResultsRef.Value.$SourceName = $null 
                    }
                } else { 
                    Write-MandALog "$InvokeCommandName command not found (module not loaded or function not exported). Skipping $SourceName discovery." -Level "WARN"
                }
            } else {
                 Write-MandALog "$SourceName discovery is not enabled in configuration. Skipping." -Level "DEBUG"
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
        Write-MandALog "Discovery phase completed." -Level "SUCCESS" 
        return $discoveryResults
    } catch { 
        Write-MandALog "Discovery phase failed catastrophically: $($_.Exception.Message)" -Level "ERROR"
        if ($script:ExecutionMetrics -isnot [hashtable]) { $script:ExecutionMetrics = @{ Error = $_.Exception.Message } }
        else { $script:ExecutionMetrics.Error = $_.Exception.Message }
        throw 
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
        else { $script:ExecutionMetrics = @{ Phase = "Processing" } } 
        Initialize-ProgressTracker -Phase "Processing" -TotalSteps 5 
        Update-Progress -Step 1 -Status "Invoking Data Aggregation"
        $rawDataPath = Join-Path $Configuration.environment.outputPath "Raw"
        $aggregationOutput = $null
        if (Get-Command 'Invoke-DataAggregation' -ErrorAction SilentlyContinue) {
            $aggregationOutput = Invoke-DataAggregation -RawDataPath $rawDataPath -Configuration $Configuration
        } else { Write-MandALog "Invoke-DataAggregation command not found. Aborting." -Level "ERROR"; throw "Invoke-DataAggregation not found." }
        $aggregatedDataStore = $aggregationOutput.AggregatedDataStore
        $relationshipGraph = $aggregationOutput.RelationshipGraph
        if ($null -eq $aggregatedDataStore) { Write-MandALog "Data Aggregation returned no data. Aborting." -Level "ERROR"; throw "Data Aggregation failed." }
        Write-MandALog "Data Aggregation completed. $(if($aggregatedDataStore.Users){$aggregatedDataStore.Users.Count}else{0}) users aggregated." -Level "INFO"
        Update-Progress -Step 2 -Status "Building User Profiles"
        $userProfiles = if (Get-Command 'New-UserProfiles' -EA SilentlyContinue) { New-UserProfiles -AggregatedDataStore $aggregatedDataStore -RelationshipGraph $relationshipGraph -Configuration $Configuration } else { Write-MandALog "New-UserProfiles not found." -Level "WARN"; @() }
        Update-Progress -Step 3 -Status "Analyzing Migration Complexity"
        $complexityAnalysis = if (Get-Command 'Measure-MigrationComplexity' -EA SilentlyContinue) { Measure-MigrationComplexity -Profiles $userProfiles -Configuration $Configuration } else { Write-MandALog "Measure-MigrationComplexity not found." -Level "WARN"; $null }
        Update-Progress -Step 4 -Status "Generating Migration Waves"
        $migrationWaves = if (Get-Command 'New-MigrationWaves' -EA SilentlyContinue) { New-MigrationWaves -Profiles $userProfiles -Configuration $Configuration } else { Write-MandALog "New-MigrationWaves not found." -Level "WARN"; @() }
        Update-Progress -Step 5 -Status "Validating Data Quality"
        $validationResults = if (Get-Command 'Test-DataQuality' -EA SilentlyContinue) { Test-DataQuality -Profiles $userProfiles -Configuration $Configuration } else { Write-MandALog "Test-DataQuality not found." -Level "WARN"; $null }
        if ($validationResults -and $validationResults.PSObject.Properties['InvalidRecords'] -and $validationResults.InvalidRecords -gt 0) {
            if (Get-Command 'New-QualityReport' -EA SilentlyContinue) { New-QualityReport -ValidationResults $validationResults -OutputPath (Join-Path $Configuration.environment.outputPath "Processed") } else { Write-MandALog "New-QualityReport not found." -Level "WARN" }
        }
        $processingResults = @{ UserProfiles = $userProfiles; ComplexityAnalysis = $complexityAnalysis; MigrationWaves = $migrationWaves; ValidationResults = $validationResults; RelationshipGraph = $relationshipGraph; AggregatedDataStore = $aggregatedDataStore }
        if ($script:ExecutionMetrics -is [hashtable]) { $script:ExecutionMetrics.Modules["Processing"] = @{ UserProfilesBuilt = if($userProfiles){$userProfiles.Count}else{0}; WavesGenerated = if($migrationWaves){$migrationWaves.Count}else{0}; DataQualityScore = if($validationResults -and $validationResults.PSObject.Properties['QualityScore']){$validationResults.QualityScore}else{"N/A"}; ProcessingComplete = $true } }
        Write-MandALog "Processing phase completed successfully" -Level "SUCCESS"
        return $processingResults
    } catch { Write-MandALog "Processing phase failed: $($_.Exception.Message)" -Level "ERROR"; if ($script:ExecutionMetrics -is [hashtable]) { $script:ExecutionMetrics.FailedOperations++ }; throw }
}

# Orchestrates the data export phase
function Invoke-ExportPhase {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration, 
        [Parameter(Mandatory=$false)] 
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
        $powerAppsStep = if ($isPowerAppsOptimized -and ($exportFormats -contains "JSON")) { 1 } else { 0 }
        $exportTotalSteps = $exportFormats.Count + $powerAppsStep
        Initialize-ProgressTracker -Phase "Export" -TotalSteps $exportTotalSteps
        $exportResults = @{}; $currentStep = 0
        function Invoke-ExportModuleSafely { param([string]$FormatName, [string]$InvokeCommandName, [hashtable]$Config, [hashtable]$DataToExport, [ref]$StepRef, [ref]$ResultsRef)
            $StepRef.Value++; Update-Progress -Step $StepRef.Value -Status "$FormatName Export"
            if (Get-Command $InvokeCommandName -EA SilentlyContinue) { Write-MandALog "Invoking $InvokeCommandName..." -Level "INFO"; $ResultsRef.Value.$FormatName = & $InvokeCommandName -ProcessedData $DataToExport -Configuration $Config } 
            else { Write-MandALog "$InvokeCommandName command not found. Skipping $FormatName export." -Level "WARN" }
        }
        if ($exportFormats -contains "CSV") { Invoke-ExportModuleSafely -FormatName "CSV" -InvokeCommandName "Export-ToCSV" -Config $Configuration -DataToExport $ProcessedData -StepRef ([ref]$currentStep) -ResultsRef ([ref]$exportResults) }
        if ($exportFormats -contains "Excel") { Invoke-ExportModuleSafely -FormatName "Excel" -InvokeCommandName "Export-ToExcel" -Config $Configuration -DataToExport $ProcessedData -StepRef ([ref]$currentStep) -ResultsRef ([ref]$exportResults) }
        if ($exportFormats -contains "JSON") { Invoke-ExportModuleSafely -FormatName "JSON" -InvokeCommandName "Export-ToJSON" -Config $Configuration -DataToExport $ProcessedData -StepRef ([ref]$currentStep) -ResultsRef ([ref]$exportResults) }
        if ($isPowerAppsOptimized -and ($exportFormats -contains "JSON")) { Invoke-ExportModuleSafely -FormatName "PowerAppsJSON" -InvokeCommandName "Export-ForPowerApps" -Config $Configuration -DataToExport $ProcessedData -StepRef ([ref]$currentStep) -ResultsRef ([ref]$exportResults) }
        if ($Configuration.export.formats -contains "CompanyControlSheet" -or $Configuration.export.exportAllCustomSheets) {
            if(Get-Command 'Export-ToCompanyControlSheet' -EA SilentlyContinue){ Invoke-ExportModuleSafely -FormatName "CompanyControlSheet" -InvokeCommandName "Export-ToCompanyControlSheet" -Config $Configuration -DataToExport $ProcessedData -StepRef ([ref]$currentStep) -ResultsRef ([ref]$exportResults) } 
            else { Write-MandALog "Export-ToCompanyControlSheet command not found." -Level "WARN"}
        }
        Update-Progress -Step $currentStep -Status "Export Phase Potentially Complete" -ForceUpdate:$true
        Write-MandALog "Export phase completed successfully" -Level "SUCCESS"; return $exportResults
    } catch { Write-MandALog "Export phase failed: $($_.Exception.Message)" -Level "ERROR"; throw }
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
        } else { Write-MandALog "ExecutionMetrics not available for summary." -Level "WARN" }
        if(Get-Command 'Export-ProgressMetrics' -EA SilentlyContinue){ Export-ProgressMetrics -Configuration $Configuration }
        if(Get-Command 'Cleanup-TempFiles' -EA SilentlyContinue){ Cleanup-TempFiles -Configuration $Configuration }      
        Write-MandALog "M&A Discovery Suite completed successfully" -Level "SUCCESS"
    } catch { Write-MandALog "Completion phase failed: $($_.Exception.Message)" -Level "ERROR"; throw }
}

# --- Main Execution Block ---
try {
    $resolvedConfigFile = $ConfigurationFile
    if (-not ([System.IO.Path]::IsPathRooted($ConfigurationFile))) {
        $resolvedConfigFile = Join-Path $global:MandASuiteRoot $ConfigurationFile
    }
    if (-not (Test-Path $resolvedConfigFile -PathType Leaf)) { Write-Error "Config file not found: '$resolvedConfigFile'"; exit 1 }
    $configContent = Get-Content $resolvedConfigFile | ConvertFrom-Json -ErrorAction Stop
    $script:Config = ConvertTo-HashtableFromPSObject -InputObject $configContent
    if ($PSBoundParameters.ContainsKey('OutputPath')) { $script:Config.environment.outputPath = $OutputPath } 
    if ($Force.IsPresent) { $script:Config.discovery.skipExistingFiles = $false } 
    Write-Host "`nM&A Discovery Suite v$(if($script:Config.metadata.version){$script:Config.metadata.version}else{'Unknown'}) - Modular Orchestrator" -ForegroundColor Cyan
    Write-Host "Mode: $Mode | Config: $resolvedConfigFile" -ForegroundColor Yellow
    if (-not (Initialize-MandAEnvironment -Configuration $script:Config -CurrentMode $Mode -ValidateOnly:$ValidateOnly.IsPresent)) {
        throw "Core environment initialization failed."
    }
    if ($ValidateOnly.IsPresent) { Write-MandALog "Validation Only Mode: Complete." -Level "SUCCESS"; exit 0 }
    if (-not (Initialize-MandAAuthentication -Configuration $script:Config)) { throw "Authentication initialization failed." }
    if (-not (Initialize-AllConnections -Configuration $script:Config)) { Write-MandALog "One or more service connections failed. Proceeding with limited functionality." -Level "WARN" }
    
    $discoveryResults = $null; $processingResults = $null
    if ($Mode -in @("Discovery", "Full")) { $discoveryResults = Invoke-DiscoveryPhase -Configuration $script:Config }
    if ($Mode -in @("Processing", "Full")) { 
        if ($null -eq $discoveryResults -and $Mode -eq "Processing") { Write-MandALog "Processing mode: Aggregation will load from 'Raw' dir." -Level "INFO" }
        $processingResults = Invoke-ProcessingPhase -Configuration $script:Config 
    }
    if ($Mode -in @("Export", "Full")) { 
        if ($null -eq $processingResults -and $Mode -eq "Export") { Write-MandALog "Export mode: Modules will load from 'Processed' dir." -Level "INFO"; Invoke-ExportPhase -Configuration $script:Config -ProcessedData $null } 
        elseif ($null -ne $processingResults) { Invoke-ExportPhase -Configuration $script:Config -ProcessedData $processingResults } 
        else { Write-MandALog "Skipping Export: No processed data." -Level "WARN" }
    }
    Complete-MandADiscovery -Configuration $script:Config
} catch {
    if ($script:ExecutionMetrics -isnot [hashtable]) { $script:ExecutionMetrics = @{} } 
    Write-MandALog "ORCHESTRATOR CRITICAL ERROR: $($_.Exception.Message)" -Level "ERROR"
    if ($_.ScriptStackTrace) { Write-MandALog "Stack Trace: $($_.ScriptStackTrace)" -Level "DEBUG" }
    if ($_.Exception.InnerException) { Write-MandALog "Inner Exception: $($_.Exception.InnerException.Message)" -Level "DEBUG" }
    $host.SetShouldExit(1); exit 1
} finally {
    try { if (Get-Command 'Disconnect-AllServices' -EA SilentlyContinue) { Disconnect-AllServices } }
    catch { Write-MandALog "Error during final disconnect: $($_.Exception.Message)" -Level "WARN" }
    Write-MandALog "Orchestrator execution finished at $(Get-Date)." -Level "INFO"
    if ($script:Config.environment.logging.logFilePath) { Write-Host "Logs: $($script:Config.environment.logging.logFilePath)" -ForegroundColor Gray }
}
