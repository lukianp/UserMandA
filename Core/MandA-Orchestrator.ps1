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

# Import required modules
$ModulePaths = @(
    ".\Modules\Utilities\Logging.psm1",
    ".\Modules\Utilities\ErrorHandling.psm1",
    ".\Modules\Utilities\ValidationHelpers.psm1",
    ".\Modules\Authentication\Authentication.psm1",
    ".\Modules\Connectivity\ConnectionManager.psm1"
)

foreach ($ModulePath in $ModulePaths) {
    if (Test-Path $ModulePath) {
        Import-Module $ModulePath -Force -Global
    } else {
        Write-Error "Required module not found: $ModulePath"
        exit 1
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
    $modules += ".\Modules\Utilities\ProgressTracking.psm1"
    $modules += ".\Modules\Utilities\FileOperations.psm1"
    
    # Mode-specific modules
    switch ($Mode) {
        "Discovery" {
            $modules += Get-ChildItem ".\Modules\Discovery\*.psm1" | ForEach-Object { $_.FullName }
        }
        "Processing" {
            $modules += Get-ChildItem ".\Modules\Processing\*.psm1" | ForEach-Object { $_.FullName }
        }
        "Export" {
            $modules += Get-ChildItem ".\Modules\Export\*.psm1" | ForEach-Object { $_.FullName }
        }
        "Full" {
            $modules += Get-ChildItem ".\Modules\Discovery\*.psm1" | ForEach-Object { $_.FullName }
            $modules += Get-ChildItem ".\Modules\Processing\*.psm1" | ForEach-Object { $_.FullName }
            $modules += Get-ChildItem ".\Modules\Export\*.psm1" | ForEach-Object { $_.FullName }
        }
    }
    
    # Authentication modules
    $modules += Get-ChildItem ".\Modules\Authentication\*.psm1" | ForEach-Object { $_.FullName }
    
    # Connectivity modules based on enabled sources
    if ($Configuration.discovery.enabledSources -contains "Graph") {
        $modules += ".\Modules\Connectivity\GraphConnection.psm1"
    }
    if ($Configuration.discovery.enabledSources -contains "Azure") {
        $modules += ".\Modules\Connectivity\AzureConnection.psm1"
    }
    if ($Configuration.discovery.enabledSources -contains "Exchange") {
        $modules += ".\Modules\Connectivity\ExchangeConnection.psm1"
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
        
        Update-Progress -Step 1 -Status "Data Aggregation"
        $aggregatedData = Start-DataAggregation -Configuration $Configuration
        
        Update-Progress -Step 2 -Status "Profile Building"
        $userProfiles = Build-UserProfiles -Data $aggregatedData -Configuration $Configuration
        
        Update-Progress -Step 3 -Status "Complexity Analysis"
        $complexityAnalysis = Calculate-MigrationComplexity -Profiles $userProfiles -Configuration $Configuration
        
        Update-Progress -Step 4 -Status "Wave Generation"
        $migrationWaves = Generate-MigrationWaves -Profiles $userProfiles -Configuration $Configuration
        
        Update-Progress -Step 5 -Status "Data Validation"
        $validationResults = Test-DataQuality -Profiles $userProfiles -Configuration $Configuration
        
        $processingResults = @{
            UserProfiles = $userProfiles
            ComplexityAnalysis = $complexityAnalysis
            MigrationWaves = $migrationWaves
            ValidationResults = $validationResults
        }
        
        Write-MandALog "Processing phase completed successfully" -Level "SUCCESS"
        return $processingResults
        
    } catch {
        Write-MandALog "Processing phase failed: $($_.Exception.Message)" -Level "ERROR"
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
    # Load configuration
    $script:Config = Get-Content $ConfigurationFile | ConvertFrom-Json
    
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