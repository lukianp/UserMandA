#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Core Orchestration Engine
.DESCRIPTION
    Core orchestrator that manages discovery, processing, and export phases.
    Assumes environment is already initialized by Set-SuiteEnvironment.ps1.
.NOTES
    Version: 6.0.0
    Created: 2025-01-03
    Last Modified: 2025-01-03
    
    Key improvements:
    - Removed duplicate environment initialization
    - Cleaner separation of concerns
    - Better error handling and state management
    - UTF-8 with BOM encoding throughout
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$CompanyName,

    [Parameter(Mandatory=$false)]
    [string]$ConfigurationFile,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("Discovery", "Processing", "Export", "Full", "AzureOnly")]
    [string]$Mode = "Full",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force,
    
    [Parameter(Mandatory=$false)]
    [switch]$ValidateOnly,
    
    [Parameter(Mandatory=$false)]
    [int]$ParallelThrottle = 5
)

#===============================================================================
#                       INITIALIZATION
#===============================================================================

# Verify global context exists
if (-not $global:MandA -or -not $global:MandA.Initialized) {
    throw "Global M&A context not initialized. Run through QuickStart.ps1 or ensure Set-SuiteEnvironment.ps1 has been sourced."
}

# Set error handling
$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"

# Script variables
$script:StartTime = Get-Date
$script:ErrorCollector = @{
    Errors = [System.Collections.ArrayList]::new()
    Warnings = [System.Collections.ArrayList]::new()
    Critical = [System.Collections.ArrayList]::new()
}
$script:AzureOnlySources = @(
    "Azure", "Graph", "Intune", "Licensing", 
    "ExternalIdentity", "SharePoint", "Teams", "Exchange"
)

#===============================================================================
#                       HELPER FUNCTIONS
#===============================================================================

function Write-OrchestratorLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Component = "Orchestrator"
    )
    
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message $Message -Level $Level -Component $Component
    } else {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $color = switch ($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "SUCCESS" { "Green" }
            "DEBUG" { "Gray" }
            "HEADER" { "Cyan" }
            default { "White" }
        }
        Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
    }
}

function Add-OrchestratorError {
    param(
        [string]$Source,
        [string]$Message,
        [System.Exception]$Exception,
        [string]$Severity = "Error"
    )
    
    $errorEntry = @{
        Timestamp = Get-Date
        Source = $Source
        Message = $Message
        Exception = if ($Exception) { $Exception.ToString() } else { $null }
        Severity = $Severity
    }
    
    switch ($Severity) {
        "Critical" { $null = $script:ErrorCollector.Critical.Add($errorEntry) }
        "Warning" { $null = $script:ErrorCollector.Warnings.Add($errorEntry) }
        default { $null = $script:ErrorCollector.Errors.Add($errorEntry) }
    }
    
    Write-OrchestratorLog -Message "[$Source] $Message" -Level $Severity
}

function Test-OrchestratorPrerequisites {
    Write-OrchestratorLog -Message "Validating orchestrator prerequisites..." -Level "INFO"
    
    $prereqMet = $true
    
    # Check PowerShell version
    if ($PSVersionTable.PSVersion.Major -lt 5 -or 
        ($PSVersionTable.PSVersion.Major -eq 5 -and $PSVersionTable.PSVersion.Minor -lt 1)) {
        Add-OrchestratorError -Source "Prerequisites" `
            -Message "PowerShell 5.1 or higher required. Current: $($PSVersionTable.PSVersion)" `
            -Severity "Critical"
        $prereqMet = $false
    }
    
    # Check critical paths
    $criticalPaths = @("SuiteRoot", "Modules", "Core", "Configuration")
    foreach ($pathKey in $criticalPaths) {
        if (-not $global:MandA.Paths.ContainsKey($pathKey)) {
            Add-OrchestratorError -Source "Prerequisites" `
                -Message "Critical path '$pathKey' not defined in global context" `
                -Severity "Critical"
            $prereqMet = $false
        } elseif (-not (Test-Path $global:MandA.Paths[$pathKey])) {
            Add-OrchestratorError -Source "Prerequisites" `
                -Message "Critical path does not exist: $($global:MandA.Paths[$pathKey])" `
                -Severity "Critical"
            $prereqMet = $false
        }
    }
    
    return $prereqMet
}

function Initialize-OrchestratorModules {
    param([string]$Phase)
    
    Write-OrchestratorLog -Message "Loading modules for phase: $Phase" -Level "INFO"
    
    # Load utility modules first
    $utilityModules = @(
        "EnhancedLogging",
        "ErrorHandling",
        "FileOperations",
        "ValidationHelpers",
        "ProgressDisplay"
    )
    
    foreach ($module in $utilityModules) {
        $modulePath = Join-Path $global:MandA.Paths.Utilities "$module.psm1"
        if (Test-Path $modulePath) {
            try {
                Import-Module $modulePath -Force -Global
                Write-OrchestratorLog -Message "Loaded utility module: $module" -Level "DEBUG"
            } catch {
                Add-OrchestratorError -Source "ModuleLoader" `
                    -Message "Failed to load utility module $module`: $_" `
                    -Exception $_.Exception
            }
        }
    }
    
    # Load phase-specific modules
    switch ($Phase) {
        { $_ -in "Discovery", "Full", "AzureOnly" } {
            Load-DiscoveryModules
        }
        { $_ -in "Processing", "Full", "AzureOnly" } {
            Load-ProcessingModules
        }
        { $_ -in "Export", "Full", "AzureOnly" } {
            Load-ExportModules
        }
    }
}

function Load-DiscoveryModules {
    $enabledSources = $global:MandA.Config.discovery.enabledSources
    Write-OrchestratorLog -Message "Loading discovery modules for $($enabledSources.Count) sources" -Level "INFO"
    
    foreach ($source in $enabledSources) {
        $modulePath = Join-Path $global:MandA.Paths.Discovery "${source}Discovery.psm1"
        if (Test-Path $modulePath) {
            try {
                Import-Module $modulePath -Force -Global
                Write-OrchestratorLog -Message "Loaded discovery module: $source" -Level "DEBUG"
            } catch {
                Add-OrchestratorError -Source "ModuleLoader" `
                    -Message "Failed to load discovery module $source`: $_" `
                    -Exception $_.Exception `
                    -Severity "Warning"
            }
        } else {
            Add-OrchestratorError -Source "ModuleLoader" `
                -Message "Discovery module not found: $modulePath" `
                -Severity "Warning"
        }
    }
}

function Load-ProcessingModules {
    $processingModules = @(
        "DataAggregation",
        "UserProfileBuilder",
        "WaveGeneration",
        "DataValidation"
    )
    
    foreach ($module in $processingModules) {
        $modulePath = Join-Path $global:MandA.Paths.Processing "$module.psm1"
        if (Test-Path $modulePath) {
            try {
                Import-Module $modulePath -Force -Global
                Write-OrchestratorLog -Message "Loaded processing module: $module" -Level "DEBUG"
            } catch {
                Add-OrchestratorError -Source "ModuleLoader" `
                    -Message "Failed to load processing module $module`: $_" `
                    -Exception $_.Exception
            }
        }
    }
}

function Load-ExportModules {
    $enabledFormats = $global:MandA.Config.export.formats
    $formatMapping = @{
        "CSV" = "CSVExport"
        "JSON" = "JSONExport"
        "Excel" = "ExcelExport"
        "CompanyControlSheet" = "CompanyControlSheetExporter"
        "PowerApps" = "PowerAppsExporter"
    }
    
    foreach ($format in $enabledFormats) {
        if ($formatMapping.ContainsKey($format)) {
            $moduleName = $formatMapping[$format]
            $modulePath = Join-Path $global:MandA.Paths.Export "$moduleName.psm1"
            if (Test-Path $modulePath) {
                try {
                    Import-Module $modulePath -Force -Global
                    Write-OrchestratorLog -Message "Loaded export module: $moduleName" -Level "DEBUG"
                } catch {
                    Add-OrchestratorError -Source "ModuleLoader" `
                        -Message "Failed to load export module $moduleName`: $_" `
                        -Exception $_.Exception
                }
            }
        }
    }
}

#===============================================================================
#                       PHASE EXECUTION FUNCTIONS
#===============================================================================

function Invoke-DiscoveryPhase {
    Write-OrchestratorLog -Message "STARTING DISCOVERY PHASE" -Level "HEADER"
    
    $phaseResult = @{
        Success = $true
        Data = @{}
        Errors = @()
    }
    
    try {
        # Initialize authentication if needed
        if (Get-Command Initialize-MandAAuthentication -ErrorAction SilentlyContinue) {
            Write-OrchestratorLog -Message "Initializing authentication..." -Level "INFO"
            $authResult = Initialize-MandAAuthentication
            
            if (-not $authResult -or -not $authResult.Authenticated) {
                throw "Authentication failed: $($authResult.Error)"
            }
            
            # Initialize connections
            if (Get-Command Initialize-AllConnections -ErrorAction SilentlyContinue) {
                $connections = Initialize-AllConnections -Configuration $global:MandA.Config `
                    -AuthContext $authResult.Context
                
                foreach ($service in $connections.Keys) {
                    $status = $connections[$service]
                    $connected = if ($status -is [bool]) { $status } 
                                else { $status.Connected }
                    
                    Write-OrchestratorLog -Message "Connection to $service`: $connected" `
                        -Level $(if ($connected) { "SUCCESS" } else { "WARN" })
                }
            }
        }
        
        # Execute discovery
        $enabledSources = $global:MandA.Config.discovery.enabledSources
        $parallelEnabled = $global:MandA.Config.discovery.parallelProcessing -and $enabledSources.Count -gt 1
        
        if ($parallelEnabled) {
            $phaseResult.Data = Invoke-ParallelDiscovery -Sources $enabledSources
        } else {
            $phaseResult.Data = Invoke-SequentialDiscovery -Sources $enabledSources
        }
        
        # Summary
        $successCount = ($phaseResult.Data.Values | Where-Object { $_.Success }).Count
        $failCount = $enabledSources.Count - $successCount
        
        Write-OrchestratorLog -Message "Discovery completed: $successCount successful, $failCount failed" `
            -Level $(if ($failCount -eq 0) { "SUCCESS" } else { "WARN" })
        
    } catch {
        $phaseResult.Success = $false
        Add-OrchestratorError -Source "DiscoveryPhase" `
            -Message "Discovery phase failed: $_" `
            -Exception $_.Exception `
            -Severity "Critical"
    }
    
    return $phaseResult
}

function Invoke-SequentialDiscovery {
    param([array]$Sources)
    
    $results = @{}
    $currentNum = 0
    $total = $Sources.Count
    
    foreach ($source in $Sources) {
        $currentNum++
        Write-OrchestratorLog -Message "[$currentNum/$total] Starting $source discovery..." -Level "PROGRESS"
        
        $functionName = "Invoke-${source}Discovery"
        if (Get-Command $functionName -ErrorAction SilentlyContinue) {
            try {
                $startTime = Get-Date
                $data = & $functionName -Configuration $global:MandA.Config
                $duration = (Get-Date) - $startTime
                
                $results[$source] = @{
                    Success = $true
                    Data = $data
                    Duration = $duration
                    RecordCount = if ($data -is [array]) { $data.Count } else { 1 }
                }
                
                Write-OrchestratorLog -Message "$source completed: $($results[$source].RecordCount) records in $($duration.TotalSeconds)s" `
                    -Level "SUCCESS"
                
            } catch {
                $results[$source] = @{
                    Success = $false
                    Error = $_.Exception.Message
                    Duration = (Get-Date) - $startTime
                }
                
                Add-OrchestratorError -Source $source `
                    -Message "Discovery failed: $_" `
                    -Exception $_.Exception
            }
        } else {
            $results[$source] = @{
                Success = $false
                Error = "Discovery function not found: $functionName"
            }
            
            Add-OrchestratorError -Source $source `
                -Message "Discovery function not found: $functionName" `
                -Severity "Warning"
        }
    }
    
    return $results
}

function Invoke-ParallelDiscovery {
    param([array]$Sources)
    
    $throttle = $global:MandA.Config.discovery.maxConcurrentJobs
    Write-OrchestratorLog -Message "Starting parallel discovery (throttle: $throttle)" -Level "INFO"
    
    # Create runspace pool
    $runspacePool = [runspacefactory]::CreateRunspacePool(1, $throttle)
    $runspacePool.Open()
    
    $jobs = @()
    $results = @{}
    
    # Discovery script block
    $scriptBlock = {
        param($Source, $Config, $ModulePath)
        
        try {
            # Import required module
            $moduleFile = Join-Path $ModulePath "${Source}Discovery.psm1"
            Import-Module $moduleFile -Force
            
            # Execute discovery
            $functionName = "Invoke-${Source}Discovery"
            $startTime = Get-Date
            $data = & $functionName -Configuration $Config
            
            return @{
                Source = $Source
                Success = $true
                Data = $data
                Duration = (Get-Date) - $startTime
                RecordCount = if ($data -is [array]) { $data.Count } else { 1 }
            }
        } catch {
            return @{
                Source = $Source
                Success = $false
                Error = $_.Exception.Message
                Duration = (Get-Date) - $startTime
            }
        }
    }
    
    # Start jobs
    foreach ($source in $Sources) {
        $powershell = [powershell]::Create()
        $powershell.RunspacePool = $runspacePool
        
        [void]$powershell.AddScript($scriptBlock)
        [void]$powershell.AddArgument($source)
        [void]$powershell.AddArgument($global:MandA.Config)
        [void]$powershell.AddArgument($global:MandA.Paths.Discovery)
        
        $jobs += @{
            PowerShell = $powershell
            Handle = $powershell.BeginInvoke()
            Source = $source
        }
    }
    
    # Wait for completion
    $completed = 0
    while ($jobs | Where-Object { -not $_.Handle.IsCompleted }) {
        Start-Sleep -Milliseconds 250
        
        # Check for completed jobs
        $justCompleted = $jobs | Where-Object { 
            $_.Handle.IsCompleted -and -not $_.Processed 
        }
        
        foreach ($job in $justCompleted) {
            $completed++
            try {
                $result = $job.PowerShell.EndInvoke($job.Handle)
                $results[$result.Source] = $result
                
                Write-OrchestratorLog -Message "[$completed/$($Sources.Count)] $($result.Source) completed" `
                    -Level $(if ($result.Success) { "SUCCESS" } else { "ERROR" })
                
            } catch {
                Add-OrchestratorError -Source $job.Source `
                    -Message "Failed to retrieve job result: $_" `
                    -Exception $_.Exception
            } finally {
                $job.PowerShell.Dispose()
                $job.Processed = $true
            }
        }
    }
    
    # Cleanup
    $runspacePool.Close()
    $runspacePool.Dispose()
    
    return $results
}

function Invoke-ProcessingPhase {
    Write-OrchestratorLog -Message "STARTING PROCESSING PHASE" -Level "HEADER"
    
    $phaseResult = @{
        Success = $true
        ProcessedFiles = @()
    }
    
    try {
        # Verify raw data exists
        $rawDataPath = $global:MandA.Paths.RawDataOutput
        if (-not (Test-Path $rawDataPath)) {
            throw "Raw data directory not found. Run Discovery phase first."
        }
        
        $csvFiles = Get-ChildItem -Path $rawDataPath -Filter "*.csv" -File
        if ($csvFiles.Count -eq 0) {
            throw "No raw data files found. Run Discovery phase first."
        }
        
        Write-OrchestratorLog -Message "Found $($csvFiles.Count) raw data files to process" -Level "INFO"
        
        # Execute data aggregation
        if (Get-Command Start-DataAggregation -ErrorAction SilentlyContinue) {
            $aggregationResult = Start-DataAggregation -Configuration $global:MandA.Config
            
            if (-not $aggregationResult) {
                throw "Data aggregation failed"
            }
            
            # Get processed files
            $processedPath = $global:MandA.Paths.ProcessedDataOutput
            $phaseResult.ProcessedFiles = Get-ChildItem -Path $processedPath -Filter "*.csv" -File
            
            Write-OrchestratorLog -Message "Processing completed: $($phaseResult.ProcessedFiles.Count) files generated" `
                -Level "SUCCESS"
            
        } else {
            throw "Start-DataAggregation function not found"
        }
        
    } catch {
        $phaseResult.Success = $false
        Add-OrchestratorError -Source "ProcessingPhase" `
            -Message "Processing phase failed: $_" `
            -Exception $_.Exception `
            -Severity "Critical"
    }
    
    return $phaseResult
}

function Invoke-ExportPhase {
    Write-OrchestratorLog -Message "STARTING EXPORT PHASE" -Level "HEADER"
    
    $phaseResult = @{
        Success = $true
        ExportedFormats = @()
    }
    
    try {
        # Load processed data
        $processedPath = $global:MandA.Paths.ProcessedDataOutput
        if (-not (Test-Path $processedPath)) {
            throw "Processed data directory not found. Run Processing phase first."
        }
        
        $dataToExport = @{}
        $processedFiles = Get-ChildItem -Path $processedPath -Filter "*.csv" -File
        
        foreach ($file in $processedFiles) {
            try {
                $dataToExport[$file.BaseName] = Import-Csv -Path $file.FullName -Encoding UTF8
            } catch {
                Add-OrchestratorError -Source "ExportPhase" `
                    -Message "Failed to load $($file.Name): $_" `
                    -Exception $_.Exception `
                    -Severity "Warning"
            }
        }
        
        # Execute exports
        $enabledFormats = $global:MandA.Config.export.formats
        foreach ($format in $enabledFormats) {
            $functionMapping = @{
                "CSV" = "Export-ToCSV"
                "JSON" = "Export-ToJSON"
                "Excel" = "Export-ToExcel"
                "PowerApps" = "Export-ForPowerApps"
                "CompanyControlSheet" = "Export-ToCompanyControlSheet"
            }
            
            $functionName = $functionMapping[$format]
            if (Get-Command $functionName -ErrorAction SilentlyContinue) {
                try {
                    Write-OrchestratorLog -Message "Exporting to format: $format" -Level "INFO"
                    & $functionName -ProcessedData $dataToExport -Configuration $global:MandA.Config
                    $phaseResult.ExportedFormats += $format
                    Write-OrchestratorLog -Message "Export completed: $format" -Level "SUCCESS"
                    
                } catch {
                    Add-OrchestratorError -Source "Export_$format" `
                        -Message "Export failed: $_" `
                        -Exception $_.Exception
                }
            } else {
                Add-OrchestratorError -Source "Export_$format" `
                    -Message "Export function not found: $functionName" `
                    -Severity "Warning"
            }
        }
        
        if ($phaseResult.ExportedFormats.Count -eq 0) {
            throw "No formats were successfully exported"
        }
        
    } catch {
        $phaseResult.Success = $false
        Add-OrchestratorError -Source "ExportPhase" `
            -Message "Export phase failed: $_" `
            -Exception $_.Exception `
            -Severity "Critical"
    }
    
    return $phaseResult
}

#===============================================================================
#                       MAIN EXECUTION
#===============================================================================

try {
    Write-OrchestratorLog -Message "M&A Discovery Suite Orchestrator v6.0.0" -Level "HEADER"
    Write-OrchestratorLog -Message "Company: $CompanyName | Mode: $Mode" -Level "INFO"
    
    # Validate prerequisites
    if (-not (Test-OrchestratorPrerequisites)) {
        throw "Prerequisites validation failed"
    }
    
    # Load configuration
    $config = $global:MandA.Config
    if (-not [string]::IsNullOrWhiteSpace($ConfigurationFile)) {
        $configPath = if ([System.IO.Path]::IsPathRooted($ConfigurationFile)) {
            $ConfigurationFile
        } else {
            Join-Path $global:MandA.Paths.Configuration $ConfigurationFile
        }
        
        if (Test-Path $configPath) {
            Write-OrchestratorLog -Message "Loading configuration: $configPath" -Level "INFO"
            $configContent = Get-Content $configPath -Raw | ConvertFrom-Json
            # Merge with existing config
            # Note: Implement proper config merging logic as needed
        }
    }
    
    # Apply command-line overrides
    if ($Force) {
        $global:MandA.Config.discovery.skipExistingFiles = $false
        Write-OrchestratorLog -Message "Force mode enabled" -Level "INFO"
    }
    
    # Handle AzureOnly mode
    if ($Mode -eq "AzureOnly") {
        $allSources = $global:MandA.Config.discovery.enabledSources
        $global:MandA.Config.discovery.enabledSources = $allSources | 
            Where-Object { $_ -in $script:AzureOnlySources }
        Write-OrchestratorLog -Message "Azure-only mode: Limited to cloud sources" -Level "INFO"
        $Mode = "Full" # Process as full mode with filtered sources
    }
    
    # Initialize modules
    Initialize-OrchestratorModules -Phase $Mode
    
    # Execute validation if requested
    if ($ValidateOnly) {
        Write-OrchestratorLog -Message "Validation-only mode" -Level "INFO"
        # Implement validation logic
        $exitCode = if ($script:ErrorCollector.Critical.Count -gt 0) { 2 } 
                   elseif ($script:ErrorCollector.Errors.Count -gt 0) { 1 } 
                   else { 0 }
        exit $exitCode
    }
    
    # Execute phases
    $phaseResults = @{}
    
    switch ($Mode) {
        "Discovery" {
            $phaseResults.Discovery = Invoke-DiscoveryPhase
        }
        "Processing" {
            $phaseResults.Processing = Invoke-ProcessingPhase
        }
        "Export" {
            $phaseResults.Export = Invoke-ExportPhase
        }
        "Full" {
            $phaseResults.Discovery = Invoke-DiscoveryPhase
            if ($phaseResults.Discovery.Success) {
                $phaseResults.Processing = Invoke-ProcessingPhase
            }
            if ($phaseResults.Processing.Success) {
                $phaseResults.Export = Invoke-ExportPhase
            }
        }
    }
    
    # Generate summary
    Write-OrchestratorLog -Message "EXECUTION SUMMARY" -Level "HEADER"
    
    $duration = (Get-Date) - $script:StartTime
    Write-OrchestratorLog -Message "Total execution time: $($duration.ToString('hh\:mm\:ss'))" -Level "INFO"
    
    # Error summary
    $criticalCount = $script:ErrorCollector.Critical.Count
    $errorCount = $script:ErrorCollector.Errors.Count
    $warningCount = $script:ErrorCollector.Warnings.Count
    
    Write-OrchestratorLog -Message "Errors - Critical: $criticalCount, Errors: $errorCount, Warnings: $warningCount" -Level "INFO"
    
    # Export error report if needed
    if ($criticalCount -gt 0 -or $errorCount -gt 0) {
        $errorReportPath = Join-Path $global:MandA.Paths.LogOutput "OrchestratorErrors_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
        $script:ErrorCollector | ConvertTo-Json -Depth 10 | 
            Set-Content -Path $errorReportPath -Encoding UTF8
        Write-OrchestratorLog -Message "Error report saved: $errorReportPath" -Level "INFO"
    }
    
    # Determine exit code
    $exitCode = if ($criticalCount -gt 0) { 2 }
                elseif ($errorCount -gt 0) { 1 }
                else { 0 }
    
    exit $exitCode
    
} catch {
    # Fatal error handling
    Write-OrchestratorLog -Message "FATAL ERROR: $_" -Level "ERROR"
    Write-OrchestratorLog -Message "Stack: $($_.ScriptStackTrace)" -Level "DEBUG"
    
    # Save crash report
    $crashReport = @{
        Timestamp = Get-Date
        Error = $_.Exception.Message
        StackTrace = $_.ScriptStackTrace
        ErrorCollector = $script:ErrorCollector
    }
    
    $crashPath = Join-Path $global:MandA.Paths.LogOutput "OrchestratorCrash_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    $crashReport | ConvertTo-Json -Depth 10 | 
        Set-Content -Path $crashPath -Encoding UTF8
    
    exit 99
} finally {
    # Cleanup
    if (Get-Command Disconnect-AllServices -ErrorAction SilentlyContinue) {
        try {
            Write-OrchestratorLog -Message "Disconnecting services..." -Level "INFO"
            Disconnect-AllServices
        } catch {
            Write-OrchestratorLog -Message "Error during disconnect: $_" -Level "WARN"
        }
    }
}