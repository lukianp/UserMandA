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

# Get the script root directory for location-independent paths
$script:SuiteRoot = Split-Path $PSScriptRoot -Parent

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

# Import required modules using absolute paths relative to suite root
$ModulePaths = @(
    (Join-Path $script:SuiteRoot "Modules\Utilities\EnhancedLogging.psm1"),        # Use Enhanced
    (Join-Path $script:SuiteRoot "Modules\Utilities\ErrorHandling.psm1"),
    (Join-Path $script:SuiteRoot "Modules\Utilities\ValidationHelpers.psm1"),
    (Join-Path $script:SuiteRoot "Modules\Authentication\Authentication.psm1"),
    (Join-Path $script:SuiteRoot "Modules\Connectivity\EnhancedConnectionManager.psm1")
)

foreach ($ModulePath in $ModulePaths) {
    if (Test-Path $ModulePath) {
        Import-Module $ModulePath -Force -Global
    } else {
        Write-Error "Required module not found: $ModulePath"
        exit 1
    }
}

function ConvertTo-HashtableFromPSObject {
    param (
        [Parameter(Mandatory=$true)]
        [PSObject]$InputObject
    )
    
    if ($null -eq $InputObject) { 
        return $null 
    }
    
    if ($InputObject -is [System.Collections.IEnumerable] -and $InputObject -isnot [string]) {
        $collection = @(
            foreach ($object in $InputObject) { 
                ConvertTo-HashtableFromPSObject -InputObject $object 
            }
        )
        return ,$collection
    } elseif ($InputObject -is [psobject]) {
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
    param($Configuration, [switch]$ValidateOnly)
    
    try {
        Write-MandALog "Initializing M&A Discovery Environment" -Level "HEADER"
        
        # Initialize logging
        Initialize-Logging -Configuration $Configuration
        
        # Validate system prerequisites (skip module checks in validate-only mode)
        if (-not (Test-Prerequisites -Configuration $Configuration -ValidateOnly:$ValidateOnly)) {
            throw "System prerequisites validation failed"
        }
        
        # Initialize output directories
        Initialize-OutputDirectories -Configuration $Configuration
        
        # Load additional modules based on configuration
        $ModulesToLoad = Get-RequiredModules -Configuration $Configuration
        foreach ($Module in $ModulesToLoad) {
            Import-Module $Module -Force -Global
            Write-MandALog "Loaded module: $Module" -Level "SUCCESS"
        }
        
        Write-MandALog "Environment initialization completed successfully" -Level "SUCCESS"
        return $true
        
    } catch {
        Write-MandALog "Environment initialization failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Get-RequiredModules {
    param($Configuration)
    
    $modules = @()
    
    # Always required
    $modules += Join-Path $script:SuiteRoot "Modules\Utilities\ProgressTracking.psm1"
    $modules += Join-Path $script:SuiteRoot "Modules\Utilities\FileOperations.psm1"
    
    # Mode-specific modules
    switch ($Mode) {
        "Discovery" {
            $discoveryPath = Join-Path $script:SuiteRoot "Modules\Discovery"
            $modules += Get-ChildItem "$discoveryPath\*.psm1" | ForEach-Object { $_.FullName }
        }
        "Processing" {
            $processingPath = Join-Path $script:SuiteRoot "Modules\Processing"
            $modules += Get-ChildItem "$processingPath\*.psm1" | ForEach-Object { $_.FullName }
        }
        "Export" {
            $exportPath = Join-Path $script:SuiteRoot "Modules\Export"
            $modules += Get-ChildItem "$exportPath\*.psm1" | ForEach-Object { $_.FullName }
        }
        "Full" {
            $discoveryPath = Join-Path $script:SuiteRoot "Modules\Discovery"
            $processingPath = Join-Path $script:SuiteRoot "Modules\Processing"
            $exportPath = Join-Path $script:SuiteRoot "Modules\Export"
            $modules += Get-ChildItem "$discoveryPath\*.psm1" | ForEach-Object { $_.FullName }
            $modules += Get-ChildItem "$processingPath\*.psm1" | ForEach-Object { $_.FullName }
            $modules += Get-ChildItem "$exportPath\*.psm1" | ForEach-Object { $_.FullName }
        }
    }
    
    # Authentication modules
    $authPath = Join-Path $script:SuiteRoot "Modules\Authentication"
    $modules += Get-ChildItem "$authPath\*.psm1" | ForEach-Object { $_.FullName }
    
    # Connectivity modules based on enabled sources
    $connectivityPath = Join-Path $script:SuiteRoot "Modules\Connectivity"
    if ($Configuration.discovery.enabledSources -contains "Graph") {
        $modules += Join-Path $connectivityPath "GraphConnection.psm1"
    }
    if ($Configuration.discovery.enabledSources -contains "Azure") {
        $modules += Join-Path $connectivityPath "AzureConnection.psm1"
    }
    if ($Configuration.discovery.enabledSources -contains "Exchange") {
        $modules += Join-Path $connectivityPath "ExchangeConnection.psm1"
    }
    
    return $modules | Where-Object { Test-Path $_ }
}

function Invoke-DiscoveryPhase {
    param($Configuration)
    
    try {
        Write-MandALog "Starting Discovery Phase" -Level "HEADER"
        $script:ExecutionMetrics.Phase = "Discovery"
        
        Initialize-ProgressTracker -Phase "Discovery" -TotalSteps 10
        
        # Execute discovery operations based on enabled sources
        $discoveryResults = @{}
        
        if ($Configuration.discovery.enabledSources -contains "ActiveDirectory") {
            Update-Progress -Step 1 -Status "Active Directory Discovery"
            $discoveryResults.AD = Invoke-ActiveDirectoryDiscovery -Configuration $Configuration
        }
        
        if ($Configuration.discovery.enabledSources -contains "Exchange") {
            Update-Progress -Step 2 -Status "Exchange Online Discovery"
            $discoveryResults.Exchange = Invoke-ExchangeDiscovery -Configuration $Configuration
        }
        
        if ($Configuration.discovery.enabledSources -contains "Graph") {
            Update-Progress -Step 3 -Status "Microsoft Graph Discovery"
            $discoveryResults.Graph = Invoke-GraphDiscovery -Configuration $Configuration
        }
        
        if ($Configuration.discovery.enabledSources -contains "Azure") {
            Update-Progress -Step 4 -Status "Azure Infrastructure Discovery"
            $discoveryResults.Azure = Invoke-AzureDiscovery -Configuration $Configuration
        }
        
        if ($Configuration.discovery.enabledSources -contains "Intune") {
            Update-Progress -Step 5 -Status "Intune Discovery"
            $discoveryResults.Intune = Invoke-IntuneDiscovery -Configuration $Configuration
        }
        
        Update-Progress -Step 10 -Status "Discovery Phase Complete"
        
        Write-MandALog "Discovery phase completed successfully" -Level "SUCCESS"
        return $discoveryResults
        
    } catch {
        Write-MandALog "Discovery phase failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Invoke-ProcessingPhase {
    param($Configuration)
    
    try {
        Write-MandALog "Starting Processing Phase" -Level "HEADER"
        $script:ExecutionMetrics.Phase = "Processing"
        
        Initialize-ProgressTracker -Phase "Processing" -TotalSteps 5
        
        # Step 1: Data Aggregation - Build comprehensive relationship graph
        Update-Progress -Step 1 -Status "Building Relationship Graph"
        
        # First, we need to prepare the aggregated data structure
        $aggregatedData = @{
            Users = @()
            Groups = @()
            Applications = @()
            ServicePrincipals = @()
            DirectoryRoles = @()
            OAuth2Grants = @()
            AdministrativeUnits = @()
            ConditionalAccess = @()
        }
        
        # Load raw discovery data from files
        $rawDataPath = Join-Path $Configuration.environment.outputPath "Raw"
        
        if (Test-Path (Join-Path $rawDataPath "ADUsers.csv")) {
            $aggregatedData.Users += Import-DataFromCSV -FilePath (Join-Path $rawDataPath "ADUsers.csv")
        }
        if (Test-Path (Join-Path $rawDataPath "GraphUsers.csv")) {
            $aggregatedData.Users += Import-DataFromCSV -FilePath (Join-Path $rawDataPath "GraphUsers.csv")
        }
        if (Test-Path (Join-Path $rawDataPath "GraphGroups.csv")) {
            $aggregatedData.Groups = Import-DataFromCSV -FilePath (Join-Path $rawDataPath "GraphGroups.csv")
        }
        if (Test-Path (Join-Path $rawDataPath "GraphApplications.csv")) {
            $aggregatedData.Applications = Import-DataFromCSV -FilePath (Join-Path $rawDataPath "GraphApplications.csv")
        }
        if (Test-Path (Join-Path $rawDataPath "GraphServicePrincipals.csv")) {
            $aggregatedData.ServicePrincipals = Import-DataFromCSV -FilePath (Join-Path $rawDataPath "GraphServicePrincipals.csv")
        }
        if (Test-Path (Join-Path $rawDataPath "GraphDirectoryRoles.csv")) {
            $aggregatedData.DirectoryRoles = Import-DataFromCSV -FilePath (Join-Path $rawDataPath "GraphDirectoryRoles.csv")
        }
        
        # Build comprehensive relationship graph (from DataAggregation module)
        $relationshipGraph = New-ComprehensiveRelationshipGraph -AggregatedData $aggregatedData -Configuration $Configuration
        
        # Merge relationship data with aggregated data for profile building
        $aggregatedData.Relationships = $relationshipGraph
        
        # Step 2: Build User Profiles
        Update-Progress -Step 2 -Status "Building User Profiles"
        $userProfiles = New-UserProfiles -Data $aggregatedData -Configuration $Configuration
        
        # Step 3: Calculate Migration Complexity
        Update-Progress -Step 3 -Status "Analyzing Migration Complexity"
        $complexityAnalysis = Measure-MigrationComplexity -Profiles $userProfiles -Configuration $Configuration
        
        # Step 4: Generate Migration Waves
        Update-Progress -Step 4 -Status "Generating Migration Waves"
        $migrationWaves = New-MigrationWaves -Profiles $userProfiles -Configuration $Configuration
        
        # Step 5: Validate Data Quality
        Update-Progress -Step 5 -Status "Validating Data Quality"
        $validationResults = Test-DataQuality -Profiles $userProfiles -Configuration $Configuration
        
        # Generate quality report if there are issues
        if ($validationResults.InvalidRecords -gt 0) {
            $qualityReportPath = Join-Path $Configuration.environment.outputPath "Processed"
            New-QualityReport -ValidationResults $validationResults -OutputPath $qualityReportPath
        }
        
        # Package results
        $processingResults = @{
            UserProfiles = $userProfiles
            ComplexityAnalysis = $complexityAnalysis
            MigrationWaves = $migrationWaves
            ValidationResults = $validationResults
            RelationshipGraph = $relationshipGraph
            AggregatedData = $aggregatedData
        }
        
        # Update execution metrics
        $script:ExecutionMetrics.Modules["Processing"] = @{
            UserProfilesBuilt = $userProfiles.Count
            WavesGenerated = $migrationWaves.Count
            DataQualityScore = $validationResults.QualityScore
            ProcessingComplete = $true
        }
        
        Write-MandALog "Processing phase completed successfully" -Level "SUCCESS"
        Write-MandALog "Built $($userProfiles.Count) user profiles" -Level "INFO"
        Write-MandALog "Generated $($migrationWaves.Count) migration waves" -Level "INFO"
        Write-MandALog "Data quality score: $($validationResults.QualityScore)%" -Level "INFO"
        
        return $processingResults
        
    } catch {
        Write-MandALog "Processing phase failed: $($_.Exception.Message)" -Level "ERROR"
        Write-MandALog "Stack trace: $($_.ScriptStackTrace)" -Level "DEBUG"
        
        # Update metrics to reflect failure
        $script:ExecutionMetrics.FailedOperations++
        $script:ExecutionMetrics.Modules["Processing"] = @{
            ProcessingComplete = $false
            Error = $_.Exception.Message
        }
        
        throw
    }
}

function Invoke-ExportPhase {
    param($Configuration, $ProcessedData)
    
    try {
        Write-MandALog "Starting Export Phase" -Level "HEADER"
        $script:ExecutionMetrics.Phase = "Export"
        
        Initialize-ProgressTracker -Phase "Export" -TotalSteps 4
        
        $exportResults = @{}
        
        if ($Configuration.export.formats -contains "CSV") {
            Update-Progress -Step 1 -Status "CSV Export"
            $exportResults.CSV = Export-ToCSV -Data $ProcessedData -Configuration $Configuration
        }
        
        if ($Configuration.export.formats -contains "Excel") {
            Update-Progress -Step 2 -Status "Excel Export"
            $exportResults.Excel = Export-ToExcel -Data $ProcessedData -Configuration $Configuration
        }
        
        if ($Configuration.export.formats -contains "JSON") {
            Update-Progress -Step 3 -Status "JSON Export"
            $exportResults.JSON = Export-ToJSON -Data $ProcessedData -Configuration $Configuration
        }
        
        if ($Configuration.export.powerAppsOptimized) {
            Update-Progress -Step 4 -Status "PowerApps Export"
            $exportResults.PowerApps = Export-ForPowerApps -Data $ProcessedData -Configuration $Configuration
        }
        
        Write-MandALog "Export phase completed successfully" -Level "SUCCESS"
        return $exportResults
        
    } catch {
        Write-MandALog "Export phase failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Complete-MandADiscovery {
    param($Configuration)
    
    try {
        $script:ExecutionMetrics.EndTime = Get-Date
        $script:ExecutionMetrics.Duration = $script:ExecutionMetrics.EndTime - $script:ExecutionMetrics.StartTime
        
        # Generate final summary
        Write-MandALog "M&A Discovery Suite Execution Summary" -Level "HEADER"
        Write-MandALog "Total Duration: $($script:ExecutionMetrics.Duration.ToString('hh\:mm\:ss'))" -Level "SUCCESS"
        Write-MandALog "Total Operations: $($script:ExecutionMetrics.TotalOperations)" -Level "SUCCESS"
        Write-MandALog "Successful Operations: $($script:ExecutionMetrics.SuccessfulOperations)" -Level "SUCCESS"
        Write-MandALog "Failed Operations: $($script:ExecutionMetrics.FailedOperations)" -Level "SUCCESS"
        
        if ($script:ExecutionMetrics.TotalOperations -gt 0) {
            $successRate = [math]::Round(($script:ExecutionMetrics.SuccessfulOperations / $script:ExecutionMetrics.TotalOperations) * 100, 2)
            Write-MandALog "Success Rate: $successRate%" -Level "SUCCESS"
        }
        
        # Export execution metrics
        Export-ProgressMetrics -Configuration $Configuration
        
        # Cleanup temporary files
        Cleanup-TempFiles -Configuration $Configuration
        
        Write-MandALog "M&A Discovery Suite completed successfully" -Level "SUCCESS"
        
    } catch {
        Write-MandALog "Completion phase failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

# Main execution
try {
    # Resolve configuration file path relative to suite root if not absolute
    $resolvedConfigFile = if ([System.IO.Path]::IsPathRooted($ConfigurationFile)) {
        $ConfigurationFile
    } else {
        Join-Path $script:SuiteRoot $ConfigurationFile
    }
    
    # Load configuration and convert to hashtable for proper parameter binding
    $configContent = Get-Content $resolvedConfigFile | ConvertFrom-Json
    $script:Config = ConvertTo-HashtableFromPSObject -InputObject $configContent
    
    # Override configuration with parameters
    if ($OutputPath) { $script:Config.environment.outputPath = $OutputPath }
    if ($Force) { $script:Config.discovery.skipExistingFiles = $false }
    
    Write-Host "M&A Discovery Suite v4.0 - Modular Architecture" -ForegroundColor Cyan
    Write-Host "Mode: $Mode | Configuration: $ConfigurationFile" -ForegroundColor Yellow
    
    # Initialize environment
    if (-not (Initialize-MandAEnvironment -Configuration $script:Config -ValidateOnly:$ValidateOnly)) {
        throw "Environment initialization failed"
    }
    
    # Validate only mode
    if ($ValidateOnly) {
        Write-MandALog "Validation completed successfully" -Level "SUCCESS"
        exit 0
    }
    
    # Authenticate
    if (-not (Initialize-MandAAuthentication -Configuration $script:Config)) {
        throw "Authentication failed"
    }
    
    # Establish connections
    if (-not (Initialize-AllConnections -Configuration $script:Config)) {
        Write-MandALog "Some service connections failed. Proceeding with limited functionality." -Level "WARN"
    }
    
    # Execute based on mode
    $discoveryResults = $null
    $processingResults = $null
    $exportResults = $null
    
    switch ($Mode) {
        "Discovery" {
            $discoveryResults = Invoke-DiscoveryPhase -Configuration $script:Config
        }
        "Processing" {
            $processingResults = Invoke-ProcessingPhase -Configuration $script:Config
        }
        "Export" {
            $exportResults = Invoke-ExportPhase -Configuration $script:Config -ProcessedData $processingResults
        }
        "Full" {
            $discoveryResults = Invoke-DiscoveryPhase -Configuration $script:Config
            $processingResults = Invoke-ProcessingPhase -Configuration $script:Config
            $exportResults = Invoke-ExportPhase -Configuration $script:Config -ProcessedData $processingResults
        }
    }
    
    # Complete execution
    Complete-MandADiscovery -Configuration $script:Config
    
} catch {
    Write-MandALog "CRITICAL ERROR: $($_.Exception.Message)" -Level "ERROR"
    if ($_.Exception.InnerException) {
        Write-MandALog "Inner Exception: $($_.Exception.InnerException.Message)" -Level "ERROR"
    }
    exit 1
    
} finally {
    # Cleanup connections
    try {
        Disconnect-AllServices
    } catch {
        Write-MandALog "Error during cleanup: $($_.Exception.Message)" -Level "WARN"
    }
}