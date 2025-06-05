#Requires -Version 5.1
<#
.SYNOPSIS
<<<<<<< HEAD
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
=======
    M&A Discovery Suite - Main Orchestrator (Enhanced Version 5.6.0)
.DESCRIPTION
    Unified orchestrator for discovery, processing, and export with improved
    state management, error handling, parallel processing support, and context handling.
    This version incorporates fixes for issues identified in FAULTs 2-10, 13-15, 17-18, 20.
.NOTES
    Author: Enhanced Version
    Version: 5.6.0
    Created: 2025-01-03
    Last Modified: 2025-06-05 (Incorporating fixes)

    Key Fixes Implemented:
    - FAULT 2 & 3 (Get-OrElse & MandAContext): Relies on Set-SuiteEnvironment.ps1 for global Get-OrElse.
      MandAContext constructor improved with null checks for $global:MandA.
    - FAULT 4 (Import-ModuleWithManifest Context): Retained $global:_MandALoadingContext pattern,
      emphasizing Set-SuiteEnvironment.ps1 must run first. Added post-load module validation.
    - FAULT 5 (Parallel Runspace Context): Passes serialized data ($PassedConfig, $PassedPaths).
      Runspace recreates a basic context. Discovery modules need to be self-sufficient or load utils.
    - FAULT 6 (String Formatting Error): Corrected -f operator usage.
    - FAULT 7 (Write-MandALog Before Initialization): Uses Write-Host then switches to Write-MandALog.
    - FAULT 8 (Module Path Construction): Improved fallback logic for module paths.
    - FAULT 9 (ErrorCollector Not Initialized): Class definitions placed at the top of the script.
    - FAULT 13 (Module Manifest vs PSM1 Loading): Added post-import module validation.
    - FAULT 14 (Discovery Module Function Names): Added function existence check.
    - FAULT 15 (Runspace Error Collection): Added null check for exception object.
    - FAULT 17 (Mode Parameter Processing): Added logging for AzureOnly mode change.
    - FAULT 18 (Export Function Mapping): Added function existence check in Get-ExportFunctionName.
    - FAULT 20 (Authentication Bypass): Added stricter check for auth failure.
>>>>>>> 71ded999da9fc295a94738239c805fe0402b3aee
#>

[CmdletBinding()]
param(
<<<<<<< HEAD
    [Parameter(Mandatory=$true)]
=======
    [Parameter(Mandatory=$false)]
>>>>>>> 71ded999da9fc295a94738239c805fe0402b3aee
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
<<<<<<< HEAD
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
=======
    [int]$ParallelThrottle = 5 # Note: Actual throttle is primarily from config.
)

# CRITICAL EXPECTATION: 
# Set-SuiteEnvironment.ps1 MUST define 'global:Get-OrElse' BEFORE this orchestrator runs.

#===============================================================================
#                       CLASSES AND TYPES (FAULT 9 FIX: Define classes first)
#===============================================================================
class DiscoveryErrorCollector {
    [System.Collections.Generic.List[PSObject]]$Errors
    [System.Collections.Generic.List[PSObject]]$Warnings
    [System.Collections.Generic.Dictionary[string,int]]$ErrorCounts

    DiscoveryErrorCollector() {
        $this.Errors = [System.Collections.Generic.List[PSObject]]::new()
        $this.Warnings = [System.Collections.Generic.List[PSObject]]::new()
        $this.ErrorCounts = [System.Collections.Generic.Dictionary[string,int]]::new()
    }

    [void]AddError([string]$Source, [string]$Message, [System.Exception]$ExceptionObject) {
        $errorEntry = [PSCustomObject]@{
            Timestamp = Get-Date
            Source = $Source
            Message = $Message
            # FAULT 15 FIX: Handle potential null exception object more gracefully, though a catch block should always provide one.
            ExceptionType = if ($null -ne $ExceptionObject) { $ExceptionObject.GetType().FullName } else { "Unknown (Exception object was null)" }
            ExceptionMessage = if ($null -ne $ExceptionObject) { $ExceptionObject.Message } else { "No exception details provided" }
            StackTrace = if ($null -ne $ExceptionObject) { $ExceptionObject.ScriptStackTrace } else { $null }
        }
        $this.Errors.Add($errorEntry)
        if (-not $this.ErrorCounts.ContainsKey($Source)) { $this.ErrorCounts[$Source] = 0 }
        $this.ErrorCounts[$Source]++
    }

    [void]AddWarning([string]$Source, [string]$Message) {
        $this.Warnings.Add([PSCustomObject]@{ Timestamp = Get-Date; Source = $Source; Message = $Message })
    }

    [bool]HasErrors() { return $this.Errors.Count -gt 0 }

    [bool]HasCriticalErrors() {
        # Define what constitutes a critical error source
        $criticalErrorSourcesPattern = "Critical|Core|ModuleLoader|Environment|Authentication|OrchestratorCore"
        return ($this.Errors | Where-Object { $_.Source -match $criticalErrorSourcesPattern }).Count -gt 0
    }

    [string]GetSummary() {
        $summary = "Errors: $($this.Errors.Count), Warnings: $($this.Warnings.Count)"
        if ($this.ErrorCounts.Count -gt 0) {
            $summary += "`nError breakdown by source:"
            foreach ($sourceKey in $this.ErrorCounts.Keys | Sort-Object) {
                $summary += "`n  - $sourceKey - $($this.ErrorCounts[$sourceKey])"
            }
        }
        return $summary
    }

    [void]ExportToFile([string]$FilePath) {
        # Ensure directory exists
        $dir = Split-Path $FilePath -Parent
        if (-not (Test-Path $dir)) { New-Item -Path $dir -ItemType Directory -Force | Out-Null }

        $cleanedErrors = $this.Errors | ForEach-Object {
            @{
                Timestamp = $_.Timestamp
                Source = $_.Source
                Message = $_.Message
                ExceptionMessage = $_.ExceptionMessage
                ExceptionType = $_.ExceptionType
                StackTrace = $_.StackTrace # Keep stack trace for better debugging
            }
        }
        $report = @{
            Summary = $this.GetSummary()
            GeneratedAt = Get-Date
            Errors = $cleanedErrors
            Warnings = $this.Warnings
            ErrorCounts = $this.ErrorCounts
        }
        try {
            $report | ConvertTo-Json -Depth 10 -Compress | Set-Content -Path $FilePath -Encoding UTF8 -Force
        } catch {
            # Fallback to simple text if JSON export fails
            $textReport = "Error Report Generated: $(Get-Date)`nSummary: $($this.GetSummary())`n`nErrors:`n$($cleanedErrors | ForEach-Object { "[$($_.Timestamp)] $($_.Source): $($_.Message) `n  Exception: $($_.ExceptionMessage)" } | Out-String)`n`nWarnings:`n$($this.Warnings | ForEach-Object { "[$($_.Timestamp)] $($_.Source): $($_.Message)" } | Out-String)"
            $textReportFilePath = $FilePath -replace '\.json$', '.txt'
            $textReport | Set-Content -Path $textReportFilePath -Encoding UTF8 -Force
            Write-Warning "Failed to export error report as JSON. Saved as text: $textReportFilePath. Error: $($_.Exception.Message)"
        }
    }
}

class MandAContext {
    [hashtable]$Paths
    [hashtable]$Config
    [string]$Version
    [datetime]$StartTime
    [bool]$ModulesChecked
    [DiscoveryErrorCollector]$ErrorCollector
    [OrchestratorState]$OrchestratorState
    [string]$CompanyName # Added for clarity and direct access

    MandAContext([hashtable]$initialConfig, [string]$currentCompanyNameParam) {
        # FAULT 3 FIX: Add null checks and defensive programming
        if ($null -eq $initialConfig) { throw "MandAContext: initialConfig cannot be null." }
        if ([string]::IsNullOrWhiteSpace($currentCompanyNameParam)) { throw "MandAContext: currentCompanyNameParam cannot be null or empty." }

        $this.Config = ConvertTo-HashtableRecursive -InputObject $initialConfig # Assumes ConvertTo-HashtableRecursive is available
        $this.Version = "5.6.0" 
        $this.StartTime = Get-Date
        $this.ModulesChecked = $false
        $this.ErrorCollector = [DiscoveryErrorCollector]::new()
        $this.OrchestratorState = [OrchestratorState]::new()
        $this.CompanyName = $currentCompanyNameParam # Store the passed company name

        # FAULT 3 FIX: More robust check for $global:MandA and its properties.
        # Get-OrElse is defined globally by Set-SuiteEnvironment.ps1.
        if (($null -ne $global:MandA) -and `
            ($global:MandA -is [hashtable]) -and `
            ($global:MandA.ContainsKey('Paths')) -and ($null -ne $global:MandA.Paths) -and `
            ($global:MandA.ContainsKey('CompanyName')) -and ($global:MandA.CompanyName -eq $currentCompanyNameParam)) {
            
            if ($global:MandA.Paths -is [hashtable]) {
                $this.Paths = $global:MandA.Paths.Clone() 
                 Write-Verbose "[MandAContext] Using paths from established global environment for company '$currentCompanyNameParam'."
            } else {
                Write-Warning "[MandAContext] global:MandA.Paths is not a hashtable. Initializing paths."
                $this.InitializePaths($currentCompanyNameParam)
            }
        } else {
            if ($null -eq $global:MandA) {
                Write-Verbose "[MandAContext] Global environment (\$global:MandA) not found. Initializing paths for '$currentCompanyNameParam'."
            } elseif ($global:MandA.CompanyName -ne $currentCompanyNameParam) {
                Write-Verbose "[MandAContext] Global environment company ('$($global:MandA.CompanyName)') differs from current ('$currentCompanyNameParam'). Re-initializing paths."
            } else {
                 Write-Verbose "[MandAContext] Global environment incomplete or paths missing. Initializing paths for '$currentCompanyNameParam'."
            }
            $this.InitializePaths($currentCompanyNameParam) 
        }
    }
    
    [void]InitializePaths([string]$currentCompanyNameParam) {
        $suiteRoot = $null
        # Try to get SuiteRoot from $global:MandA first if it was set by Set-SuiteEnvironment.ps1
        if ($null -ne $global:MandA -and ($global:MandA -is [hashtable]) -and $global:MandA.ContainsKey('Paths') -and $null -ne $global:MandA.Paths -and $global:MandA.Paths.ContainsKey('SuiteRoot')) {
            $suiteRoot = $global:MandA.Paths.SuiteRoot
        } elseif ($PSScriptRoot) { 
            # Fallback to PSScriptRoot if this script (Orchestrator) is in Core, its parent is SuiteRoot
            $suiteRoot = Split-Path $PSScriptRoot -Parent 
        } else {
            # Last resort, less reliable
            try { $suiteRoot = Split-Path (Get-Location).Path -Parent } catch { $suiteRoot = Resolve-Path ".\" } # Use Resolve-Path for current dir
            Write-Warning "[MandAContext.InitializePaths] Could not reliably determine SuiteRoot from PSScriptRoot or global context. Using '$suiteRoot'."
        }

        # Get-OrElse should be available globally from Set-SuiteEnvironment.ps1
        $profilesBasePath = $this.Config.environment.profilesBasePath | global:Get-OrElse "C:\MandADiscovery\Profiles"
        
        $this.Paths = @{
            SuiteRoot = $suiteRoot
            ProfilesBasePath = $profilesBasePath
            CompanyProfileRoot = Join-Path $profilesBasePath $currentCompanyNameParam
            Modules = Join-Path $suiteRoot "Modules"
            Utilities = Join-Path $suiteRoot "Modules\Utilities"
            Core = Join-Path $suiteRoot "Core"
            Scripts = Join-Path $suiteRoot "Scripts"
            Configuration = Join-Path $suiteRoot "Configuration"
            Discovery = Join-Path $suiteRoot "Modules\Discovery" # Added for FAULT 8 fix
            Processing = Join-Path $suiteRoot "Modules\Processing" # Added for FAULT 8 fix
            Export = Join-Path $suiteRoot "Modules\Export" # Added for FAULT 8 fix
        }
        
        $this.Paths.RawDataOutput = Join-Path $this.Paths.CompanyProfileRoot "Raw"
        $this.Paths.ProcessedDataOutput = Join-Path $this.Paths.CompanyProfileRoot "Processed"
        $this.Paths.LogOutput = Join-Path $this.Paths.CompanyProfileRoot "Logs"
        $this.Paths.ExportOutput = Join-Path $this.Paths.CompanyProfileRoot "Exports"
        $this.Paths.TempPath = Join-Path $this.Paths.CompanyProfileRoot "Temp"
        
        # Update the config in this context to reflect the resolved company profile root as the outputPath
        if ($null -ne $this.Config -and $this.Config.ContainsKey('environment') -and ($this.Config.environment -is [hashtable])) {
            $this.Config.environment.outputPath = $this.Paths.CompanyProfileRoot
            $this.Config.environment.tempPath = $this.Paths.TempPath # Also update tempPath in context's config
        } else {
             Write-Warning "[MandAContext.InitializePaths] \$this.Config or \$this.Config.environment is null or not a hashtable. Cannot set outputPath in context config."
        }
    }
    
    [bool]ValidateContext() {
        # Validate critical paths necessary for the orchestrator's operation
        $requiredPathKeys = @('SuiteRoot', 'CompanyProfileRoot', 'Modules', 'Utilities', 'Core', 'Configuration', 'LogOutput', 'RawDataOutput', 'ProcessedDataOutput', 'ExportOutput', 'TempPath') 
        foreach ($pathKey in $requiredPathKeys) {
            if (-not $this.Paths.ContainsKey($pathKey) -or [string]::IsNullOrWhiteSpace($this.Paths[$pathKey])) {
                Write-Warning "[MandAContext.ValidateContext] Critical path key '$pathKey' is missing or empty in Paths hashtable."
                return $false
            }
            # For suite structure paths, they must exist. For output paths, they will be created.
            if ($pathKey -in @('SuiteRoot', 'Modules', 'Utilities', 'Core', 'Configuration')) {
                if (-not (Test-Path $this.Paths[$pathKey] -PathType Container -ErrorAction SilentlyContinue)) {
                    Write-Warning "[MandAContext.ValidateContext] Critical suite structure path '$($this.Paths[$pathKey])' for '$pathKey' does not exist or is not a directory."
                    return $false
                }
            }
        }
        if ($null -eq $this.Config) { Write-Warning "[MandAContext.ValidateContext] Config is null."; return $false }
        if ($null -eq $this.ErrorCollector) { Write-Warning "[MandAContext.ValidateContext] ErrorCollector is null."; return $false }
        if ($null -eq $this.OrchestratorState) { Write-Warning "[MandAContext.ValidateContext] OrchestratorState is null."; return $false }
        
        Write-Verbose "[MandAContext.ValidateContext] Context validation successful."
        return $true
    }
}

class OrchestratorState {
    [int]$MaxExecutions = 5
    [System.Collections.Generic.Stack[string]]$ExecutionStack
    [System.Collections.Generic.Dictionary[string,int]]$PhaseExecutions

    OrchestratorState() {
        $this.ExecutionStack = [System.Collections.Generic.Stack[string]]::new()
        $this.PhaseExecutions = [System.Collections.Generic.Dictionary[string,int]]::new()
    }

    [bool]CanExecute([string]$phase) {
        if ($this.ExecutionStack.Contains($phase)) { return $false } # Prevent re-entrancy
        if (-not $this.PhaseExecutions.ContainsKey($phase)) { $this.PhaseExecutions[$phase] = 0 }
        return $this.PhaseExecutions[$phase] -lt $this.MaxExecutions
    }

    [void]PushExecution([string]$phase) {
        $this.ExecutionStack.Push($phase)
        if (-not $this.PhaseExecutions.ContainsKey($phase)) { $this.PhaseExecutions[$phase] = 0 }
        $this.PhaseExecutions[$phase]++
    }

    [void]PopExecution() {
        if ($this.ExecutionStack.Count -gt 0) {
            $null = $this.ExecutionStack.Pop()
        }
    }
    [string]GetExecutionPath() { return ($this.ExecutionStack.ToArray() | ForEach-Object { $_ }) -join ' -> ' }
}


#===============================================================================
#                       INITIALIZATION
#===============================================================================
# $ErrorActionPreference should be set by the calling script (QuickStart.ps1) or defaults to Stop.
# Setting ProgressPreference to Continue is good.
$ProgressPreference = "Continue" 
$script:Context = $null # This will hold the MandAContext object for the current run.
$script:AzureOnlySources = @("Azure","Graph","Intune","Licensing","ExternalIdentity","SharePoint","Teams","Exchange") # Used if Mode is AzureOnly


#===============================================================================
#                    UTILITY FUNCTIONS
#===============================================================================
# Moved to Set-SuiteEnvironment.ps1: global:Get-OrElse
# Moved to Set-SuiteEnvironment.ps1: Update-TypeData for HashtableContains

function ConvertTo-HashtableRecursive {
    # This utility is also defined in Set-SuiteEnvironment.ps1.
    # It's redefined here for potential standalone execution or if Set-SuiteEnvironment changes.
    # Ensure this version is compatible if used.
    param([Parameter(ValueFromPipeline)] $InputObject)
    process {
        if ($null -eq $InputObject) { return $null }
        if ($InputObject -is [System.Collections.IEnumerable] -and $InputObject -isnot [string] -and $InputObject -isnot [hashtable]) {
            return ,@($InputObject | ForEach-Object { ConvertTo-HashtableRecursive $_ })
        }
        if ($InputObject -is [PSCustomObject]) {
            $hash = @{} # Use standard hashtable
            $InputObject.PSObject.Properties | ForEach-Object { $hash[$_.Name] = ConvertTo-HashtableRecursive $_.Value }
            return $hash
        }
        return $InputObject
    }
}

function Test-ModuleConfiguration {
    # Validates if essential configuration settings for a given module are present.
    param(
        [hashtable]$Configuration, # The main suite configuration
        [string]$ModuleName       # The name of the discovery source/module
    )
    # Define required settings per module. Key: ModuleName, Value: array of dot-notation paths to settings.
    $requiredSettings = @{
        'ActiveDirectory' = @('environment.domainController') # Example: AD needs a DC.
        'Azure'           = @() # Example: Azure might not need specific config beyond auth.
        'Exchange'        = @('authentication.authenticationMethod') # Example
        'Graph'           = @()
        'EnvironmentDetection' = @('environment.outputPath') # Example
        # Add other modules and their absolutely critical config keys here.
    }

    if (-not $requiredSettings.ContainsKey($ModuleName)) {
        Write-Verbose "[Test-ModuleConfiguration] No specific configuration requirements defined for module '$ModuleName'."
        return $true # No specific requirements defined for this module
    }

    $missing = @()
    foreach ($settingPath in $requiredSettings[$ModuleName]) {
        $currentValue = $Configuration
        $pathParts = $settingPath.Split('.')
        $isValidPath = $true
        foreach ($part in $pathParts) {
            if ($null -eq $currentValue -or -not ($currentValue -is [hashtable]) -or -not $currentValue.ContainsKey($part)) {
                $isValidPath = $false
                break
            }
            $currentValue = $currentValue[$part]
        }

        if (-not $isValidPath -or $null -eq $currentValue -or ($currentValue -is [string] -and [string]::IsNullOrWhiteSpace($currentValue))) {
            $missing += $settingPath
        }
    }

    if ($missing.Count -gt 0) {
        # Use Write-MandALog if available, otherwise Write-Warning
        $errorMessage = "Missing or invalid required configuration for '$ModuleName' module: $($missing -join ', '). Check default-config.json."
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message $errorMessage -Level "ERROR" -Context $script:Context
        } else {
            Write-Warning $errorMessage
        }
        # Depending on policy, you might throw here or let the caller decide.
        # For now, this function just reports. The calling discovery loader can decide to skip the module.
        return $false # Indicates missing configuration
    }
    return $true
}


function Import-ModuleWithManifest {
    param( 
        [string]$ModulePathToImport, 
        [MandAContext]$CurrentContext # The main orchestrator context
    )
    # FAULT 4 FIX: Using $global:_MandALoadingContext is kept as an existing pattern,
    # but it's acknowledged as not ideal. Modules should ideally use $global:MandA after loading.

    if ([string]::IsNullOrWhiteSpace($ModulePathToImport)) {
        Write-MandALog "Import-ModuleWithManifest: ModulePathToImport is null or empty." -Level "ERROR" -Context $CurrentContext
        return $false
    }

    # Use Write-MandALog for debug messages if logging is initialized
    $logFunc = if ($CurrentContext.Config.advancedSettings.debugMode) { 
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { ${function:Write-MandALog} } else { ${function:Write-Host} }
    } else { $null }

    if ($logFunc) { $logFunc.Invoke("Attempting to import: '$ModulePathToImport'", "DEBUG", $CurrentContext) }


    if (-not (Test-Path $ModulePathToImport -PathType Leaf)) { # Ensure it's a file
        Write-MandALog "Import-ModuleWithManifest: Module file not found or is not a file: '$ModulePathToImport'" -Level "ERROR" -Context $CurrentContext
        return $false
    }

    $moduleNameToLoad = [System.IO.Path]::GetFileNameWithoutExtension($ModulePathToImport)
    
    # Check if module is already loaded (by name)
    if (Get-Module -Name $moduleNameToLoad -ErrorAction SilentlyContinue) {
        if ($logFunc) { $logFunc.Invoke("Module '$moduleNameToLoad' is already loaded.", "DEBUG", $CurrentContext) }
        return $true 
    }

    $moduleDirectory = Split-Path $ModulePathToImport -Parent
    if ([string]::IsNullOrWhiteSpace($moduleDirectory)) {
        Write-MandALog "Import-ModuleWithManifest: Could not determine module directory for: '$ModulePathToImport'" -Level "ERROR" -Context $CurrentContext
        return $false
    }
    $manifestFullPath = Join-Path $moduleDirectory "$moduleNameToLoad.psd1"
    
    # Prepare the context to be available during module import (e.g., for code in the .psm1 root scope)
    # This is a common pattern, though it has limitations (not truly passing context into Import-Module).
    # The module's own functions should ideally take $Context as a parameter or access $global:MandA.
    $global:_MandALoadingContext = $CurrentContext # Make the full context available
        
    try {
        if (Test-Path $manifestFullPath -PathType Leaf) {
            if ($logFunc) { $logFunc.Invoke("Importing manifest '$manifestFullPath' for module '$moduleNameToLoad'.", "DEBUG", $CurrentContext) }
            Import-Module $manifestFullPath -Force -Global -ErrorAction Stop 
        } else {
            if ($logFunc) { $logFunc.Invoke("Manifest not found. Importing PSM1 '$ModulePathToImport' for module '$moduleNameToLoad'.", "DEBUG", $CurrentContext) }
            Import-Module $ModulePathToImport -Force -Global -ErrorAction Stop 
        }

        # FAULT 13 FIX: Add post-import validation
        $loadedModule = Get-Module -Name $moduleNameToLoad -ErrorAction SilentlyContinue
        if ($null -eq $loadedModule) {
            throw "Module '$moduleNameToLoad' reported as imported, but Get-Module could not find it."
        }
        
        Write-MandALog "Successfully loaded and verified module: '$moduleNameToLoad'" -Level "SUCCESS" -Context $CurrentContext
        return $true

    } catch {
        $errorMessage = "Failed to load module '$moduleNameToLoad' from '$ModulePathToImport'. Error: $($_.Exception.Message)"
        if ($_.InvocationInfo) { $errorMessage += " At $($_.InvocationInfo.ScriptName):$($_.InvocationInfo.ScriptLineNumber)" }
        
        $CurrentContext.ErrorCollector.AddError("ModuleLoader", $errorMessage, $_.Exception)
        Write-MandALog $errorMessage -Level "ERROR" -Context $CurrentContext
        if ($CurrentContext.Config.advancedSettings.debugMode) {
             Write-MandALog ("Full Error Record for '$moduleNameToLoad' import: " + ($_.Exception | Format-List * -Force | Out-String)) -Level "DEBUG" -Context $CurrentContext
        }
        return $false
    } finally {
        # Clean up the temporary global variable
        Remove-Variable -Name "_MandALoadingContext" -Scope Global -ErrorAction SilentlyContinue
    }
}


#===============================================================================
#                    CORE ORCHESTRATION FUNCTIONS
#===============================================================================
function Initialize-MandAEnvironment {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][MandAContext]$Context,
        [Parameter(Mandatory=$true)][string]$CurrentMode,
        [Parameter(Mandatory=$false)][switch]$IsValidateOnlyMode
    )
    
    # FAULT 7 FIX: Use Write-Host for initial messages, then switch to Write-MandALog
    Write-Host "=== [Orchestrator.Initialize-MandAEnvironment] INITIALIZING ENVIRONMENT FOR MODE: $CurrentMode ===" -ForegroundColor Cyan
    
    try {
        # Ensure EnhancedLogging module is loaded first to make Write-MandALog available
        $loggingModulePath = Join-Path $Context.Paths.Utilities "EnhancedLogging.psm1"
        if (Test-Path $loggingModulePath -PathType Leaf) {
            try {
                Import-Module $loggingModulePath -Force -Global -ErrorAction Stop
                Write-Host "[Orchestrator.Initialize-MandAEnvironment] EnhancedLogging.psm1 loaded." -ForegroundColor Green
                # Initialize logging system now that the module is loaded
                if (Get-Command Initialize-Logging -ErrorAction SilentlyContinue) {
                    Initialize-Logging -Configuration $Context.Config # Assumes Initialize-Logging handles $Context.Config correctly
                    $global:MandA.LoggingInitialized = $true # Mark logging as initialized
                    Write-MandALog "Logging system initialized by Orchestrator." -Level "INFO" -Context $Context
                } else {
                    Write-Warning "[Orchestrator.Initialize-MandAEnvironment] Initialize-Logging function not found after importing EnhancedLogging.psm1. Logging might be basic."
                    $Context.ErrorCollector.AddWarning("Environment", "Initialize-Logging function not found.")
                }
            } catch {
                Write-Warning "[Orchestrator.Initialize-MandAEnvironment] Failed to import EnhancedLogging.psm1 initially: $($_.Exception.Message)"
                $Context.ErrorCollector.AddError("Environment", "Failed to load EnhancedLogging.psm1", $_.Exception)
            }
        } else {
            Write-Warning "[Orchestrator.Initialize-MandAEnvironment] EnhancedLogging.psm1 not found at '$loggingModulePath'. Logging will be basic."
            $Context.ErrorCollector.AddWarning("Environment", "EnhancedLogging.psm1 not found at '$loggingModulePath'.")
        }

        Write-MandALog "Starting environment initialization for mode: $CurrentMode" -Level "HEADER" -Context $Context
        
        # Ensure global:MandA is set (should have been by Set-SuiteEnvironment via QuickStart)
        if ($null -eq $global:MandA) {
            # This is a critical failure, implies Set-SuiteEnvironment.ps1 didn't run or failed.
            $Context.ErrorCollector.AddError("Environment", "CRITICAL: `\$global:MandA is not set. Set-SuiteEnvironment.ps1 must run first.", $null)
            throw "CRITICAL: `\$global:MandA is not set. Set-SuiteEnvironment.ps1 must run successfully before orchestration."
        }
        # Overwrite/ensure values in $global:MandA from the current context if they differ or for completeness.
        # This ensures that if the Orchestrator is called directly with a specific CompanyName that differs from a pre-existing
        # global context, the current context's values are prioritized for this run.
        $global:MandA.Paths = $Context.Paths
        $global:MandA.Config = $Context.Config
        $global:MandA.CompanyName = $Context.CompanyName
        $global:MandA.Version = $Context.Version
        
        # Create necessary company profile directories
        $directoriesToEnsure = @(
            $Context.Paths.CompanyProfileRoot, $Context.Paths.RawDataOutput, $Context.Paths.ProcessedDataOutput,
            $Context.Paths.LogOutput, $Context.Paths.ExportOutput, $Context.Paths.TempPath
        )
        foreach ($dir in $directoriesToEnsure) {
            if (-not (Test-Path $dir -PathType Container)) {
                try {
                    New-Item -Path $dir -ItemType Directory -Force -ErrorAction Stop | Out-Null
                    Write-MandALog "Created directory: $dir" -Level "INFO" -Context $Context
                } catch {
                    $Context.ErrorCollector.AddError("Environment", "Failed to create directory '$dir': $($_.Exception.Message)", $_.Exception)
                    throw "Failed to create essential directory: $dir" 
                }
            }
        }
        
        # Load core utility modules
        $utilityModules = @("FileOperations.psm1", "ValidationHelpers.psm1", "ConfigurationValidation.psm1", "ErrorHandling.psm1", "ProgressDisplay.psm1")
        Write-MandALog "Loading utility modules..." -Level "INFO" -Context $Context
        foreach ($moduleFile in $utilityModules) { 
            $moduleFullPath = Join-Path $Context.Paths.Utilities $moduleFile 
            if (-not (Import-ModuleWithManifest -ModulePathToImport $moduleFullPath -CurrentContext $Context)) {
                 # For critical utilities, throw an error if loading fails
                 if ($moduleFile -in @("ErrorHandling.psm1", "FileOperations.psm1")) { 
                    throw "Critical utility module '$moduleFile' failed to load from '$moduleFullPath'. Cannot continue." 
                 } else {
                    Write-MandALog "Non-critical utility module '$moduleFile' failed to load. Some functionality might be affected." -Level "WARN" -Context $Context
                 }
            }
        }
        
        # Load Authentication and Connectivity modules
        $coreInfraModules = @("Authentication\Authentication.psm1", "Authentication\CredentialManagement.psm1", "Connectivity\EnhancedConnectionManager.psm1")
        Write-MandALog "Loading authentication and connectivity modules..." -Level "INFO" -Context $Context
        foreach ($moduleRelPath in $coreInfraModules) {
            $moduleFullPath = Join-Path $Context.Paths.Modules $moduleRelPath
            Import-ModuleWithManifest -ModulePathToImport $moduleFullPath -CurrentContext $Context # Error already logged by Import-ModuleWithManifest
        }
        
        # Perform prerequisite checks (if the function exists from ValidationHelpers.psm1)
        if (-not $IsValidateOnlyMode) {
            if (Get-Command Test-Prerequisites -ErrorAction SilentlyContinue) {
                Write-MandALog "Performing system prerequisites validation..." -Level "INFO" -Context $Context
                if (-not (Test-Prerequisites -Configuration $Context.Config -Context $Context)) { # Pass full context
                    $Context.ErrorCollector.AddError("Environment", "System prerequisites validation failed. Review logs for details.", $null)
                    throw "System prerequisites validation failed. Review logs for details."
                }
                 Write-MandALog "System prerequisites validated successfully." -Level "SUCCESS" -Context $Context
            } else {
                Write-MandALog "Test-Prerequisites function not found. Ensure ValidationHelpers.psm1 is loaded. Skipping prerequisites check." -Level "WARN" -Context $Context
            }
        }
        
        # Load phase-specific modules
        switch ($CurrentMode) {
            { $_ -in "Discovery", "Full", "AzureOnly" } { Import-DiscoveryModules -Context $Context }
            { $_ -in "Processing", "Full", "AzureOnly" } { Import-ProcessingModules -Context $Context }
            { $_ -in "Export", "Full", "AzureOnly" } { Import-ExportModules -Context $Context }
        }

        Write-MandALog "Environment initialization completed successfully." -Level "SUCCESS" -Context $Context
        return $true

    } catch {
        $errorMessageText = "Orchestrator environment initialization failed: $($_.Exception.Message)"
        # Use Write-Host if Write-MandALog might not be available or working
        Write-Host $errorMessageText -ForegroundColor Red
        if ($Context -and $Context.ErrorCollector) { 
            $Context.ErrorCollector.AddError("EnvironmentSetup", $errorMessageText, $_.Exception)
        }
        # Re-throw to halt execution as initialization is critical
        throw $errorMessageText 
    }
}

function Import-DiscoveryModules {
    param([MandAContext]$Context)

    # FAULT 8 FIX: Use $Context.Paths.Discovery which is now correctly resolved by MandAContext
    $baseDiscoveryPath = $Context.Paths.Discovery 
    if (-not (Test-Path $baseDiscoveryPath -PathType Container)) {
        $Context.ErrorCollector.AddError("ModuleLoader", "Discovery modules directory not found: '$baseDiscoveryPath'", $null)
        Write-MandALog "CRITICAL: Discovery modules directory not found: '$baseDiscoveryPath'. Cannot load discovery modules." -Level "ERROR" -Context $Context
        return # Cannot proceed if base path is missing
    }

    $enabledSources = @($Context.Config.discovery.enabledSources)
    Write-MandALog "Loading discovery modules for $($enabledSources.Count) sources from '$baseDiscoveryPath'" -Level "INFO" -Context $Context
    
    $loadedCount = 0; $failedCount = 0
    foreach ($sourceName in $enabledSources) { 
        try {
            # Validate module-specific configuration before attempting to load
            if (-not (Test-ModuleConfiguration -Configuration $Context.Config -ModuleName $sourceName)) {
                 Write-MandALog "Skipping discovery module '$sourceName' due to missing/invalid configuration." -Level "WARN" -Context $Context
                 $failedCount++
                 continue # Skip this module
            }

            $moduleFileName = "${sourceName}Discovery.psm1" 
            $moduleFullPath = Join-Path $baseDiscoveryPath $moduleFileName 

            if (Test-Path $moduleFullPath -PathType Leaf) {
                if (Import-ModuleWithManifest -ModulePathToImport $moduleFullPath -CurrentContext $Context) {
                    $loadedCount++
                } else {
                    # Error already logged by Import-ModuleWithManifest
                    $failedCount++
                }
            } else {
                $failedCount++
                $missingMsg = "Discovery module file '$moduleFileName' not found at '$moduleFullPath'."
                $Context.ErrorCollector.AddWarning("ModuleLoader_Discovery_$sourceName", $missingMsg)
                Write-MandALog "WARNING: $missingMsg" -Level "WARN" -Context $Context
            }
        } catch { # Catch errors from Test-ModuleConfiguration or other unexpected issues
            $failedCount++
            $loadErrorMsg = "Failed to prepare or load discovery module '$($sourceName)Discovery.psm1': $($_.Exception.Message)"
            $Context.ErrorCollector.AddError("ModuleLoader_Discovery_$sourceName", $loadErrorMsg, $_.Exception)
            Write-MandALog $loadErrorMsg -Level "ERROR" -Context $Context
        }
    }
    Write-MandALog "Discovery module loading complete: $loadedCount loaded, $failedCount failed/skipped." -Level "INFO" -Context $Context
}

function Import-ProcessingModules {
    param([MandAContext]$Context)

    # FAULT 8 FIX: Use $Context.Paths.Processing
    $baseProcessingPath = $Context.Paths.Processing
    if (-not (Test-Path $baseProcessingPath -PathType Container)) {
        $errMsg = "Processing modules directory not found: '$baseProcessingPath'. Cannot load processing modules."
        $Context.ErrorCollector.AddError("ModuleLoader", $errMsg, $null)
        Write-MandALog "CRITICAL: $errMsg" -Level "ERROR" -Context $Context
        return
    }
    if ($Context.Config.advancedSettings.debugMode) { Write-MandALog "[DEBUG IPMod] Base path for processing modules: '$baseProcessingPath'" -Level "DEBUG" -Context $Context }

    # Define processing modules to load
    $processingModuleFiles = @("DataAggregation.psm1", "UserProfileBuilder.psm1", "WaveGeneration.psm1", "DataValidation.psm1") 
    Write-MandALog "Loading processing modules from: $baseProcessingPath" -Level "INFO" -Context $Context
    
    foreach ($moduleFileItem in $processingModuleFiles) { 
        if ([string]::IsNullOrWhiteSpace($moduleFileItem)) {
            Write-MandALog "Skipping empty module name in processing modules array." -Level "WARN" -Context $Context
            continue
        }
        $moduleFullPath = Join-Path $baseProcessingPath $moduleFileItem
        if ($Context.Config.advancedSettings.debugMode) { Write-MandALog "[DEBUG IPMod] Attempting to load: '$moduleFullPath'" -Level "DEBUG" -Context $Context }
        
        # Import-ModuleWithManifest handles Test-Path and logging of success/failure
        Import-ModuleWithManifest -ModulePathToImport $moduleFullPath -CurrentContext $Context
    }
}

function Import-ExportModules {
    param([MandAContext]$Context)

    # FAULT 8 FIX: Use $Context.Paths.Export
    $baseExportPath = $Context.Paths.Export
    if (-not (Test-Path $baseExportPath -PathType Container)) {
        $errMsg = "Export modules directory not found: '$baseExportPath'. Cannot load export modules."
        $Context.ErrorCollector.AddError("ModuleLoader", $errMsg, $null)
        Write-MandALog "CRITICAL: $errMsg" -Level "ERROR" -Context $Context
        return
    }
    if ($Context.Config.advancedSettings.debugMode) { Write-MandALog "[DEBUG IEMod] Base path for export modules: '$baseExportPath'" -Level "DEBUG" -Context $Context }
    
    $enabledFormats = @($Context.Config.export.formats | Get-OrElse @("CSV", "JSON")) # Default to CSV, JSON if not specified
    Write-MandALog "Loading export modules for formats: $($enabledFormats -join ', ')" -Level "INFO" -Context $Context
    
    # Mapping of format names to module filenames
    $formatMapping = @{
        "CSV"                 = "CSVExport.psm1"
        "JSON"                = "JSONExport.psm1"
        "Excel"               = "ExcelExport.psm1"
        "CompanyControlSheet" = "CompanyControlSheetExporter.psm1"
        "PowerApps"           = "PowerAppsExporter.psm1" 
    }

    foreach ($formatNameItem in $enabledFormats) {
        if ($Context.Config.advancedSettings.debugMode) { Write-MandALog "[DEBUG IEMod] Processing format: '$formatNameItem'" -Level "DEBUG" -Context $Context }
        if ($formatMapping.ContainsKey($formatNameItem)) {
            $moduleFileItem = $formatMapping[$formatNameItem]
            if ([string]::IsNullOrWhiteSpace($moduleFileItem)) {
                Write-MandALog "Module filename is empty for export format '$formatNameItem'. Skipping." -Level "WARN" -Context $Context
                continue
            }
            $moduleFullPath = Join-Path $baseExportPath $moduleFileItem
            if ($Context.Config.advancedSettings.debugMode) { Write-MandALog "[DEBUG IEMod] Attempting to load: '$moduleFullPath'" -Level "DEBUG" -Context $Context }
            
            Import-ModuleWithManifest -ModulePathToImport $moduleFullPath -CurrentContext $Context
        } else {
            $Context.ErrorCollector.AddWarning("ModuleLoader_Export", "Unknown or unmapped export format: '$formatNameItem'. No specific module to load.")
            Write-MandALog "Warning: Unknown export format '$formatNameItem'. No specific module defined for it." -Level "WARN" -Context $Context
        }
    }
}

function Invoke-DiscoveryPhase {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][MandAContext]$Context
    )

    if (-not $Context.OrchestratorState.CanExecute("Discovery")) {
        $execPath = $Context.OrchestratorState.GetExecutionPath()
        $Context.ErrorCollector.AddError("DiscoveryPhase", "Discovery phase maximum execution limit reached or re-entrancy detected. Path: $execPath", $null)
        throw "Discovery phase execution limit reached or re-entrancy detected. Path: $execPath"
    }
    $Context.OrchestratorState.PushExecution("Discovery")
    
    try {
        Write-MandALog "STARTING DISCOVERY PHASE" -Level "HEADER" -Context $Context
        
        # Check if Test-DiscoveryPrerequisites function exists (from ValidationHelpers.psm1)
        if (Get-Command Test-DiscoveryPrerequisites -ErrorAction SilentlyContinue) {
            Write-MandALog "Validating discovery prerequisites..." -Level "INFO" -Context $Context
            if (-not (Test-DiscoveryPrerequisites -Context $Context)) { # Pass full context
                $Context.ErrorCollector.AddError("DiscoveryPhase", "Discovery prerequisites not met. Review logs for details.", $null)
                throw "Discovery prerequisites not met. Review logs for details."
            }
            Write-MandALog "Discovery prerequisites validated successfully." -Level "SUCCESS" -Context $Context
        } else {
            Write-MandALog "Test-DiscoveryPrerequisites function not found. Ensure ValidationHelpers.psm1 is loaded. Skipping this validation." -Level "WARN" -Context $Context
        }

        $enabledSources = @($Context.Config.discovery.enabledSources)
        if ($enabledSources.Count -eq 0) {
            Write-MandALog "No discovery sources enabled in configuration. Skipping discovery tasks." -Level "WARN" -Context $Context
            return @{} # Return empty results
        }

        # Invoke parallel discovery
        $discoveryResults = Invoke-ParallelDiscoveryWithProgress -EnabledSources $enabledSources -Context $Context
        
        Write-MandALog "Discovery Phase Completed. Results gathered for $($discoveryResults.Keys.Count) sources." -Level "SUCCESS" -Context $Context
        return $discoveryResults

    } catch {
        $Context.ErrorCollector.AddError("DiscoveryPhase", "Discovery Phase failed: $($_.Exception.Message)", $_.Exception)
        throw # Re-throw to halt if critical
    }
    finally {
        $Context.OrchestratorState.PopExecution()
    }
}

function Invoke-ParallelDiscoveryWithProgress {
    param(
        [Parameter(Mandatory=$true)][string[]]$EnabledSources,
        [Parameter(Mandatory=$true)][MandAContext]$Context
    )
    
    # Get-OrElse is globally available
    $throttleLimit = $Context.Config.discovery.maxConcurrentJobs | global:Get-OrElse 5
    Write-MandALog "Starting parallel discovery for $($EnabledSources.Count) sources (Throttle: $throttleLimit)" -Level "INFO" -Context $Context

    $runspacePool = [runspacefactory]::CreateRunspacePool(1, $throttleLimit)
    $runspacePool.Open()
    
    $runspaces = [System.Collections.Generic.List[object]]::new()
    $allResults = @{} # To store successful results

    # FAULT 5 FIX: Scriptblock for runspace.
    # Pass only necessary serialized data. Modules and functions needed inside the runspace
    # must be self-sufficient or loaded/defined within the scriptblock.
    # $global:MandA is used for modules to pick up config/paths if they are designed to.
    $scriptBlockToRun = { 
        param( 
            [string]$DiscoverySource,      # Name of the discovery source (e.g., "ActiveDirectory")
            [hashtable]$PassedConfig,       # Serialized configuration (subset or full)
            [hashtable]$PassedPaths,        # Serialized paths (subset or full)
            [string]$PassedCompanyName,
            [string]$PassedVersion,
            [string]$PassedModulesPath,      # Base path to "Modules" directory
            [string]$PassedUtilitiesPath,    # Base path to "Utilities" directory for logging
            [hashtable]$ParentGlobalMandA    # The $global:MandA from the parent scope
        )
        
        $ErrorActionPreference = "Stop" # Set for the runspace
        $ProgressPreference = "Continue"

        # Re-establish a minimal global context for this runspace.
        # Modules loaded here might expect $global:MandA to exist.
        $script:GlobalMandA = $ParentGlobalMandA # Make parent's global MandA available.
                                                # This is a direct copy, so it's effectively serialized.
                                                # Complex objects within might lose methods.
                                                # Modules should primarily use $PassedConfig and $PassedPaths if they need data.

        # Attempt to load EnhancedLogging within the runspace for consistent logging
        # It should use Write-Host if Write-MandALog fails.
        $runspaceLoggingInitialized = $false
        try {
            $loggingModulePathForRunspace = Join-Path $PassedUtilitiesPath "EnhancedLogging.psm1"
            if (Test-Path $loggingModulePathForRunspace -PathType Leaf) {
                Import-Module $loggingModulePathForRunspace -Force -Global
                if (Get-Command Initialize-Logging -ErrorAction SilentlyContinue) {
                    Initialize-Logging -Configuration $PassedConfig # Use passed config for logging setup
                    $runspaceLoggingInitialized = $true
                }
            }
        } catch {
            Write-Warning "Runspace: Failed to initialize enhanced logging for $DiscoverySource. Error: $($_.Exception.Message)"
        }

        # Define a local logging function for the runspace
        function Write-RunspaceLog {
            param([string]$Msg, [string]$Lvl = "INFO")
            $logTimestamp = Get-Date -Format "HH:mm:ss"
            if ($usingEnhancedLoggingForRunspace -and (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
                # Create a minimal context for logging within the runspace
                $rsContext = [PSCustomObject]@{ Config = $PassedConfig; CompanyName = $PassedCompanyName; Paths = $PassedPaths }
                Write-MandALog -Message "[$logTimestamp] Runspace-$DiscoverySource $Msg" -Level $Lvl -Context $rsContext
            } else {
                Write-Host "[$logTimestamp] Runspace-$DiscoverySource [$Lvl]: $Msg"
            }
        }
        
        # Signal that we're using the local runspace logger
        $usingEnhancedLoggingForRunspace = $runspaceLoggingInitialized

        try {
            Write-RunspaceLog "Starting task for '$DiscoverySource' in runspace."

            # Construct module path
            $moduleFileName = "${DiscoverySource}Discovery.psm1"
            $moduleDiscoveryPath = Join-Path $PassedModulesPath "Discovery" # Specific path to Discovery modules
            $moduleFullPath = Join-Path $moduleDiscoveryPath $moduleFileName 
            
            if (-not (Test-Path $moduleFullPath -PathType Leaf)) {
                throw "Module file not found: '$moduleFullPath'"
            }
            Import-Module $moduleFullPath -Force -Global # Load the specific discovery module
            
            # FAULT 14 FIX: Check if the discovery function exists
            $invokeFunctionName = "Invoke-${DiscoverySource}Discovery" 
            if (-not (Get-Command $invokeFunctionName -ErrorAction SilentlyContinue)) {
                throw "Discovery function '$invokeFunctionName' not found in module '$DiscoverySource'."
            }
            
            # Create a simplified context for the discovery module running in the runspace
            # The module's Invoke function should expect a context like this or just Config/Paths.
            $runspaceModuleContext = [PSCustomObject]@{
                Paths = $PassedPaths         # Simple hashtable of paths
                Config = $PassedConfig        # Simple hashtable of config
                CompanyName = $PassedCompanyName
                Version = $PassedVersion
                ErrorCollector = $null      # Error collection is handled by catching exception from scriptblock
                # Add other simple properties if modules expect them from context.
                # Avoid passing complex objects with methods directly.
            }
            
            Write-RunspaceLog "Invoking '$invokeFunctionName'..."
            $discoveryDataResult = & $invokeFunctionName -Configuration $PassedConfig -Context $runspaceModuleContext # Pass simple context
            
            Write-RunspaceLog "Task for '$DiscoverySource' completed successfully in runspace."
            return [PSCustomObject]@{ Source = $DiscoverySource; Success = $true; Data = $discoveryDataResult; Error = $null; FullException = $null }

        } catch {
            $errorMessageText = "Error in '$DiscoverySource' discovery runspace: $($_.Exception.Message)"
            Write-RunspaceLog $errorMessageText -Lvl "ERROR"
            if ($_.ScriptStackTrace) { Write-RunspaceLog "StackTrace: $($_.ScriptStackTrace)" -Lvl "DEBUG" }
            # Return a more detailed error object
            return [PSCustomObject]@{
                Source = $DiscoverySource
                Success = $false
                Data = $null
                Error = $_.Exception.Message       # Just the message for summary
                FullException = $_.Exception      # The full exception object for detailed collection
                ScriptStackTrace = $_.ScriptStackTrace
            }
        }
    } # End of $scriptBlockToRun

    foreach ($sourceNameItem in $EnabledSources) { 
        $powershellInstance = [powershell]::Create().AddScript($scriptBlockToRun) 
        
        # Pass parameters to the scriptblock
        [void]$powershellInstance.AddArgument($sourceNameItem)
        [void]$powershellInstance.AddArgument($Context.Config)          # Pass full config hashtable
        [void]$powershellInstance.AddArgument($Context.Paths)           # Pass full paths hashtable
        [void]$powershellInstance.AddArgument($Context.CompanyName)
        [void]$powershellInstance.AddArgument($Context.Version)
        [void]$powershellInstance.AddArgument($Context.Paths.Modules)   # Pass base Modules path
        [void]$powershellInstance.AddArgument($Context.Paths.Utilities) # Pass Utilities path
        [void]$powershellInstance.AddArgument($global:MandA)            # Pass the current $global:MandA

        $powershellInstance.RunspacePool = $runspacePool
        $runspaces.Add([PSCustomObject]@{
            Instance = $powershellInstance
            Handle = $powershellInstance.BeginInvoke()
            Source = $sourceNameItem
            StartTime = Get-Date
        })
    }

    $totalTasks = $runspaces.Count
    $completedTasksCount = 0
    $progressUpdateInterval = $Context.Config.performance.progressUpdateInterval | global:Get-OrElse 10 # How often to update main progress
    $progressCounter = 0

    # Progress tracking loop
    while ($runspaces.Count -gt 0) {
        $doneTasks = $runspaces | Where-Object { $_.Handle.IsCompleted } 
        
        foreach ($taskItem in $doneTasks) { 
            $completedTasksCount++
            $jobOutputResult = $null
            try {
                $jobOutputResult = $taskItem.Instance.EndInvoke($taskItem.Handle) 
                
                if ($null -eq $jobOutputResult) {
                    throw "Runspace for $($taskItem.Source) returned null output."
                }

                if ($jobOutputResult.Success) {
                    $allResults[$jobOutputResult.Source] = $jobOutputResult.Data
                    Write-MandALog "Discovery completed successfully for: $($jobOutputResult.Source)" -Level "SUCCESS" -Context $Context
                } else {
                    # Error from within the runspace scriptblock's catch
                    $errMsg = if ($jobOutputResult.Error) { $jobOutputResult.Error } else { "Unknown error from runspace."}
                    $fullEx = if ($jobOutputResult.FullException) { $jobOutputResult.FullException } else { $null }
                    $Context.ErrorCollector.AddError($jobOutputResult.Source, $errMsg, $fullEx)
                    Write-MandALog "Discovery failed for $($jobOutputResult.Source): $errMsg" -Level "ERROR" -Context $Context
                    if ($Context.Config.advancedSettings.debugMode -and $jobOutputResult.ScriptStackTrace) {
                        Write-MandALog "Runspace StackTrace for $($jobOutputResult.Source): $($jobOutputResult.ScriptStackTrace)" -Level "DEBUG" -Context $Context
                    }
                }
            } catch { # Error in EndInvoke or processing the result itself
                $Context.ErrorCollector.AddError($taskItem.Source, "Orchestrator error processing runspace result for $($taskItem.Source): $($_.Exception.Message)", $_.Exception)
                 Write-MandALog "Orchestrator error processing runspace result for $($taskItem.Source): $($_.Exception.Message)" -Level "ERROR" -Context $Context
            }
            finally {
                if ($taskItem.Instance) { $taskItem.Instance.Dispose() }
                $runspaces.Remove($taskItem) # Remove from the list of active runspaces
            }
            
            # Update main progress bar
            if (Get-Command Write-DiscoveryProgress -ErrorAction SilentlyContinue) {
                Write-DiscoveryProgress -Total $totalTasks -Completed $completedTasksCount -CurrentSource $taskItem.Source -Context $Context
            } else {
                # Basic progress if Write-DiscoveryProgress is not available
                 Write-Host "`rProgress: $completedTasksCount / $totalTasks tasks completed. Last: $($taskItem.Source)" -NoNewline
            }
        }
        
        if ($runspaces.Count -gt 0) {
            Start-Sleep -Milliseconds 250 # Wait before checking handles again
        }
    } # End while runspaces exist
    
    # Final progress update
    if (Get-Command Write-DiscoveryProgress -ErrorAction SilentlyContinue) {
        Write-DiscoveryProgress -Total $totalTasks -Completed $completedTasksCount -CompletedAll $true -Context $Context
    } else {
        Write-Host "" # Newline after basic progress
    }

    # Clean up runspace pool
    if ($runspacePool) { $runspacePool.Close(); $runspacePool.Dispose() }
    
    $failedTasksCount = $totalTasks - $allResults.Keys.Count
    Write-MandALog "Parallel discovery finished. Successful sources: $($allResults.Keys.Count), Failed/Skipped sources: $failedTasksCount" -Level "INFO" -Context $Context
    
    return $allResults
}

function Invoke-ProcessingPhase {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][MandAContext]$Context
    ) 
    if (-not $Context.OrchestratorState.CanExecute("Processing")) {
        $execPath = $Context.OrchestratorState.GetExecutionPath()
        $Context.ErrorCollector.AddError("ProcessingPhase", "Processing phase maximum execution limit reached or re-entrancy detected. Path: $execPath", $null)
        throw "Processing phase execution limit reached. Path: $execPath"
    }
    $Context.OrchestratorState.PushExecution("Processing")

    try {
        Write-MandALog "STARTING PROCESSING PHASE" -Level "HEADER" -Context $Context
        
        $rawDataPath = $Context.Paths.RawDataOutput
        if (-not (Test-Path $rawDataPath -PathType Container)) {
            $Context.ErrorCollector.AddError("ProcessingPhase", "Raw data directory not found: '$rawDataPath'. Cannot proceed.", $null)
            throw "Raw data directory not found: '$rawDataPath'. Processing cannot proceed."
        }
        
        $rawDataFiles = Get-ChildItem -Path $rawDataPath -Filter "*.csv" -File -ErrorAction SilentlyContinue
        if ($null -eq $rawDataFiles -or $rawDataFiles.Count -eq 0) {
            $Context.ErrorCollector.AddWarning("ProcessingPhase", "No raw data CSV files found in '$rawDataPath'. Processing phase may not produce meaningful results.")
            Write-MandALog "No raw data CSV files found in '$rawDataPath'. Processing phase will run but may not have input." -Level "WARN" -Context $Context
            # Allow to continue if processing modules can handle no input, or add specific checks in modules.
        }

        # Ensure DataAggregation module is loaded (primary for this phase)
        $dataAggModuleInfo = Get-Module -Name "DataAggregation" -ErrorAction SilentlyContinue 
        if (-not $dataAggModuleInfo) {
            $dataAggModulePath = Join-Path $Context.Paths.Processing "DataAggregation.psm1" # Using $Context.Paths.Processing
            if (Test-Path $dataAggModulePath -PathType Leaf) {
                if (-not (Import-ModuleWithManifest -ModulePathToImport $dataAggModulePath -CurrentContext $Context)) {
                    throw "Failed to load critical DataAggregation module from '$dataAggModulePath'."
                }
            } else {
                throw "DataAggregation module file not found at '$dataAggModulePath'. Processing cannot continue."
            }
        }
        
        # Check for the main processing function
        if (Get-Command "Start-DataAggregation" -ErrorAction SilentlyContinue) {
            Write-MandALog "Invoking Start-DataAggregation..." -Level "INFO" -Context $Context
            # Start-DataAggregation should ideally take $Context and handle its own data loading from $Context.Paths.RawDataOutput
            # and save to $Context.Paths.ProcessedDataOutput.
            if (-not (Start-DataAggregation -Context $Context)) { # Pass the full context
                $Context.ErrorCollector.AddError("ProcessingPhase", "Start-DataAggregation reported failure.", $null)
                throw "Data aggregation phase failed."
            }
            Write-MandALog "Processing Phase (Start-DataAggregation) completed successfully." -Level "SUCCESS" -Context $Context
            return $true
        } else {
            $Context.ErrorCollector.AddError("ProcessingPhase", "Core processing function 'Start-DataAggregation' not found.", $null)
            throw "Core processing function 'Start-DataAggregation' not found. Ensure DataAggregation.psm1 is correctly loaded and exports this function."
        }

    } catch {
        $Context.ErrorCollector.AddError("ProcessingPhase", "Processing Phase failed: $($_.Exception.Message)", $_.Exception)
        throw # Re-throw to halt if critical
    }
    finally {
        $Context.OrchestratorState.PopExecution()
    }
}

function Invoke-ExportPhase {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][MandAContext]$Context
    )

    if (-not $Context.OrchestratorState.CanExecute("Export")) {
        $execPath = $Context.OrchestratorState.GetExecutionPath()
        $Context.ErrorCollector.AddError("ExportPhase", "Export phase maximum execution limit reached or re-entrancy detected. Path: $execPath", $null)
        throw "Export phase execution limit reached. Path: $execPath"
    }
    $Context.OrchestratorState.PushExecution("Export")

    try {
        Write-MandALog "STARTING EXPORT PHASE" -Level "HEADER" -Context $Context
        
        $processedDataPath = $Context.Paths.ProcessedDataOutput
        if (-not (Test-Path $processedDataPath -PathType Container)) {
            $Context.ErrorCollector.AddError("ExportPhase", "Processed data directory not found: '$processedDataPath'. Cannot export.", $null)
            throw "Processed data directory not found: '$processedDataPath'. Export cannot proceed."
        }
        
        # Load processed data files into a hashtable for exporters
        $dataToExport = @{}
        $processedFiles = Get-ChildItem -Path $processedDataPath -Filter "*.csv" -File -ErrorAction SilentlyContinue
        
        if ($null -eq $processedFiles -or $processedFiles.Count -eq 0) {
            $Context.ErrorCollector.AddWarning("ExportPhase", "No processed data CSV files found in '$processedDataPath'. Export phase may not produce output.")
            Write-MandALog "No processed data CSV files found in '$processedDataPath'. Export phase will run but may not have input." -Level "WARN" -Context $Context
        } else {
            Write-MandALog "Loading $($processedFiles.Count) processed data files for export..." -Level "INFO" -Context $Context
            foreach ($fileItem in $processedFiles) { 
                $dataKeyName = $fileItem.BaseName 
                try {
                    # FAULT: Specify encoding for Import-Csv, assuming UTF8 based on previous fixes.
                    $dataToExport[$dataKeyName] = Import-Csv -Path $fileItem.FullName -Encoding UTF8 -ErrorAction Stop
                    Write-MandALog "Loaded $($dataToExport[$dataKeyName].Count) items from '$($fileItem.Name)' for export." -Level "DEBUG" -Context $Context
                } catch {
                    $errMsg = "Failed to load processed data file '$($fileItem.Name)' for export: $($_.Exception.Message)"
                    $Context.ErrorCollector.AddError("ExportPhase_DataLoad", $errMsg, $_.Exception)
                    Write-MandALog $errMsg -Level "ERROR" -Context $Context
                }
            }
        }
        
        $enabledFormats = @($Context.Config.export.formats | global:Get-OrElse @("CSV", "JSON")) # Default if not specified
        $exportOverallSuccess = $true 
        
        Write-MandALog "Starting export for formats: $($enabledFormats -join ', ')" -Level "INFO" -Context $Context
        foreach ($formatName in $enabledFormats) { 
            Write-MandALog "Processing export format: '$formatName'..." -Level "INFO" -Context $Context
            $invokeFunctionName = Get-ExportFunctionName -Format $formatName -Context $Context # Pass context for logging
            
            if ([string]::IsNullOrWhiteSpace($invokeFunctionName)) {
                # Error already logged by Get-ExportFunctionName if it couldn't find/validate
                $exportOverallSuccess = $false
                continue
            }

            try {
                # The export function should take $dataToExport (all processed data) and $Context (for config, paths)
                & $invokeFunctionName -ProcessedData $dataToExport -Context $Context 
                Write-MandALog "Export for format '$formatName' completed successfully." -Level "SUCCESS" -Context $Context
            } catch {
                $exportErrorMsg = "Export for format '$formatName' (function '$invokeFunctionName') failed: $($_.Exception.Message)"
                $Context.ErrorCollector.AddError("Export_$formatName", $exportErrorMsg, $_.Exception)
                Write-MandALog $exportErrorMsg -Level "ERROR" -Context $Context
                $exportOverallSuccess = $false
            }
        } # End foreach format

        $exportPhaseStatusText = if ($exportOverallSuccess) { 'successfully' } else { 'with errors' }
        $exportPhaseStatusLevel = if ($exportOverallSuccess) { "SUCCESS" } else { "WARN" }
        Write-MandALog "Export Phase completed $exportPhaseStatusText." -Level $exportPhaseStatusLevel -Context $Context
        
        return $exportOverallSuccess

    } catch { # Catch errors in Invoke-ExportPhase setup itself
        $Context.ErrorCollector.AddError("ExportPhase", "Main Export Phase failed: $($_.Exception.Message)", $_.Exception)
        throw # Re-throw to halt if critical
    }
    finally {
        $Context.OrchestratorState.PopExecution()
    }
}

function Get-ExportFunctionName {
    param(
        [string]$Format,
        [MandAContext]$Context # For logging
    )
    $mapping = @{
        "CSV"                 = "Export-ToCSV"
        "JSON"                = "Export-ToJSON"
        "Excel"               = "Export-ToExcel"
        "PowerApps"           = "Export-ForPowerApps"
        "CompanyControlSheet" = "Export-ToCompanyControlSheet"
    }
    $functionNameToTest = if ($mapping.ContainsKey($Format)) { $mapping[$Format] } else { "Export-To$Format" }

    # FAULT 18 FIX: Add function existence check
    if (Get-Command $functionNameToTest -ErrorAction SilentlyContinue) {
        return $functionNameToTest
    } else {
        $errMsg = "Export function '$functionNameToTest' for format '$Format' not found or module not loaded."
        if ($Context) {
            $Context.ErrorCollector.AddWarning("ExportConfig", $errMsg)
            Write-MandALog $errMsg -Level "WARN" -Context $Context
        } else {
            Write-Warning $errMsg
        }
        return $null # Indicate function not found
    }
}

function Complete-MandADiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][MandAContext]$Context
    )
    Write-MandALog "FINALIZING M&A DISCOVERY SUITE EXECUTION" -Level "HEADER" -Context $Context
    
    if ($Context.ErrorCollector.HasErrors()) {
        $errorReportFileName = "ErrorReport_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
        $errorReportPath = Join-Path $Context.Paths.LogOutput $errorReportFileName
        
        Write-MandALog "Errors occurred during execution. Exporting error report to: $errorReportPath" -Level "WARN" -Context $Context
        try {
            $Context.ErrorCollector.ExportToFile($errorReportPath) # This function now handles dir creation
            Write-MandALog "Error report successfully exported." -Level "INFO" -Context $Context
        } catch {
            Write-MandALog "Failed to export error report: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
    } else {
        Write-MandALog "Execution completed with no errors recorded by the orchestrator's error collector." -Level "SUCCESS" -Context $Context
    }

    $duration = (Get-Date) - $Context.StartTime
    Write-MandALog "Total execution time: $($duration.ToString('hh\:mm\:ss'))" -Level "INFO" -Context $Context
    Write-MandALog "Error Summary: $($Context.ErrorCollector.GetSummary())" -Level "INFO" -Context $Context # Always log summary
    
    Write-MandALog "Output locations:" -Level "INFO" -Context $Context
    Write-MandALog "  - Company Profile Root: $($Context.Paths.CompanyProfileRoot)" -Level "INFO" -Context $Context
    Write-MandALog "  - Logs: $($Context.Paths.LogOutput)" -Level "INFO" -Context $Context
    Write-MandALog "  - Raw Data: $($Context.Paths.RawDataOutput)" -Level "INFO" -Context $Context
    Write-MandALog "  - Processed Data: $($Context.Paths.ProcessedDataOutput)" -Level "INFO" -Context $Context
    Write-MandALog "  - Exports: $($Context.Paths.ExportOutput)" -Level "INFO" -Context $Context
    if (Test-Path (Join-Path $Context.Paths.ProcessedDataOutput "PowerApps")) {
        Write-MandALog "  - PowerApps JSON: $(Join-Path $Context.Paths.ProcessedDataOutput "PowerApps")" -Level "INFO" -Context $Context
    }
    if (Test-Path (Join-Path $Context.Paths.CompanyProfileRoot "CompanyControlSheetCSVs")) {
        Write-MandALog "  - Company Control Sheet CSVs: $(Join-Path $Context.Paths.CompanyProfileRoot "CompanyControlSheetCSVs")" -Level "INFO" -Context $Context
    }
}

#===============================================================================
#                        MAIN EXECUTION BLOCK
#===============================================================================
$orchestratorErrorActionPreference = $ErrorActionPreference # Preserve original
$ErrorActionPreference = "Stop" # Enforce Stop for orchestrator's main block

try {
    # Ensure $global:MandA is initialized by Set-SuiteEnvironment.ps1 (typically via QuickStart.ps1)
    if ($null -eq $global:MandA -or -not $global:MandA.Initialized) {
        Write-Host "Orchestrator: \$global:MandA not initialized. Attempting to run Set-SuiteEnvironment.ps1..." -ForegroundColor Yellow
        # Determine PSScriptRoot for this script (MandA-Orchestrator.ps1)
        $currentScriptPath = $MyInvocation.MyCommand.Path
        $coreDir = Split-Path $currentScriptPath -Parent
        $currentSuiteRoot = Split-Path $coreDir -Parent
        
        $envScriptPath = Join-Path $currentSuiteRoot "Scripts\Set-SuiteEnvironment.ps1"
        if (-not (Test-Path $envScriptPath -PathType Leaf)) {
            throw "CRITICAL: Set-SuiteEnvironment.ps1 not found at '$envScriptPath'. Cannot proceed with Orchestrator."
        }
        # Determine CompanyName: If provided as param, use it. Else, try to get from existing $global:MandA.Config (less likely here),
        # or prompt if truly running standalone (not recommended for Orchestrator).
        $companyNameToUseForEnv = $CompanyName # Parameter takes precedence
        if ([string]::IsNullOrWhiteSpace($companyNameToUseForEnv) -and $global:MandA -and $global:MandA.Config -and $global:MandA.Config.metadata.companyName) {
            $companyNameToUseForEnv = $global:MandA.Config.metadata.companyName
        }
        if ([string]::IsNullOrWhiteSpace($companyNameToUseForEnv)) {
            # This path is unlikely if Orchestrator is called correctly.
            Write-Warning "CompanyName not provided to Orchestrator and not found in existing global context. This is unusual."
            # Attempt to get from default-config.json directly as a last resort if $ConfigurationFile is set.
            if(-not [string]::IsNullOrWhiteSpace($ConfigurationFile) -and (Test-Path $ConfigurationFile)){
                $tempConf = Get-Content $ConfigurationFile -Raw | ConvertFrom-Json
                $companyNameToUseForEnv = $tempConf.metadata.companyName
            }
            if([string]::IsNullOrWhiteSpace($companyNameToUseForEnv)){
                 throw "CRITICAL: CompanyName could not be determined for Set-SuiteEnvironment.ps1. Provide -CompanyName to Orchestrator."
            }
        }
        Write-Host "Orchestrator: Sourcing '$envScriptPath' with CompanyName '$companyNameToUseForEnv' and SuiteRoot '$currentSuiteRoot'." -ForegroundColor Yellow
        . $envScriptPath -ProvidedSuiteRoot $currentSuiteRoot -CompanyName $companyNameToUseForEnv
        if ($null -eq $global:MandA -or -not $global:MandA.Initialized) {
            throw "CRITICAL: Failed to initialize global environment via Set-SuiteEnvironment.ps1 from Orchestrator."
        }
        Write-Host "Orchestrator: Global environment context established successfully via Set-SuiteEnvironment.ps1." -ForegroundColor Green
    }

    # Use CompanyName from parameter if provided, otherwise from global context.
    $effectiveCompanyName = if (-not [string]::IsNullOrWhiteSpace($CompanyName)) { $CompanyName } else { $global:MandA.CompanyName }
    if ([string]::IsNullOrWhiteSpace($effectiveCompanyName)) {
        throw "CRITICAL: Effective CompanyName could not be determined. Ensure it's provided or set in global context by Set-SuiteEnvironment.ps1."
    }
    $SanitizedCompanyName = $effectiveCompanyName -replace '[<>:"/\\|?*]', '_' # Sanitize just in case.

    # Load configuration: Prioritize $ConfigurationFile parameter, then $global:MandA.Config.
    $loadedConfiguration = $null
    if (-not [string]::IsNullOrWhiteSpace($ConfigurationFile)) {
        $effectiveConfigPath = if ([System.IO.Path]::IsPathRooted($ConfigurationFile)) { $ConfigurationFile } else { Join-Path $global:MandA.Paths.SuiteRoot $ConfigurationFile }
        if (-not (Test-Path $effectiveConfigPath -PathType Leaf)) { throw "Specified configuration file not found: '$effectiveConfigPath'" }
        $configJsonContent = Get-Content -Path $effectiveConfigPath -Raw | ConvertFrom-Json -ErrorAction Stop 
        $loadedConfiguration = ConvertTo-HashtableRecursive -InputObject $configJsonContent
        Write-Host "[Orchestrator] Loaded configuration from parameter: '$effectiveConfigPath'" -ForegroundColor Cyan
    } elseif ($null -ne $global:MandA -and $global:MandA.ContainsKey('Config') -and ($null -ne $global:MandA.Config)) {
        $loadedConfiguration = $global:MandA.Config
        Write-Host "[Orchestrator] Using configuration from existing global context (`$global:MandA.Config)." -ForegroundColor Cyan
    } else {
        throw "CRITICAL: Configuration could not be loaded. Neither -ConfigurationFile parameter provided nor found in `$global:MandA.Config."
    }
    if ($null -eq $loadedConfiguration) { throw "CRITICAL: Configuration resulted in null after loading attempts." }
    
    # Ensure the loaded configuration reflects the sanitized company name for this run.
    # This is important if Orchestrator is called with a CompanyName that might differ from the one in the loaded default-config.json
    if ($loadedConfiguration.metadata.companyName -ne $SanitizedCompanyName) {
        Write-Host "[Orchestrator] Updating CompanyName in working configuration from '$($loadedConfiguration.metadata.companyName)' to '$SanitizedCompanyName'." -ForegroundColor Yellow
        $loadedConfiguration.metadata.companyName = $SanitizedCompanyName
    }

    # Handle Force mode for discovery
    if ($Force.IsPresent) {
        if ($loadedConfiguration.discovery -is [hashtable]) {
            $loadedConfiguration.discovery.skipExistingFiles = $false
            Write-Host "[Orchestrator] Force mode enabled: 'skipExistingFiles' set to false." -ForegroundColor Yellow
        } else {
            Write-Warning "[Orchestrator] Cannot set 'skipExistingFiles': 'discovery' section not found or not a hashtable in configuration."
        }
    }

    # Handle AzureOnly mode
    $effectiveMode = $Mode 
    if ($effectiveMode -eq "AzureOnly") {
        Write-MandALog "Azure-Only mode selected. Limiting discovery to cloud-native sources." -Level "INFO" -Context ([PSCustomObject]@{Config=$loadedConfiguration; CompanyName=$SanitizedCompanyName}) # Temporary context for this log
        if ($loadedConfiguration.discovery -is [hashtable] -and $loadedConfiguration.discovery.enabledSources -is [array]) {
            $currentConfigSources = @($loadedConfiguration.discovery.enabledSources) 
            $filteredSources = $currentConfigSources | Where-Object { $_ -in $script:AzureOnlySources }
            $loadedConfiguration.discovery.enabledSources = $filteredSources
            Write-MandALog "Enabled sources for Azure-Only mode: $($filteredSources -join ', ')" -Level "INFO" -Context ([PSCustomObject]@{Config=$loadedConfiguration; CompanyName=$SanitizedCompanyName})
        } else {
             Write-Warning "[Orchestrator] Cannot filter sources for AzureOnly mode: 'discovery.enabledSources' not found or not an array."
        }
        $effectiveMode = "Full" # Internally, AzureOnly runs the "Full" lifecycle but with filtered sources.
        Write-MandALog "AzureOnly mode will now proceed as a 'Full' run with filtered sources." -Level "INFO" -Context ([PSCustomObject]@{Config=$loadedConfiguration; CompanyName=$SanitizedCompanyName}) # FAULT 17 FIX
    }
    
    # Create the main context object for this orchestrator run
    $script:Context = [MandAContext]::new($loadedConfiguration, $SanitizedCompanyName)
    if (-not $script:Context.ValidateContext()) {
        throw "MandAContext validation failed. Orchestrator cannot proceed."
    }
    if ($script:Context.Config.advancedSettings.debugMode) { Write-MandALog "[DEBUG ORCH] Context created. Paths.Modules: '$($script:Context.Paths.Modules)'" -Level "DEBUG" -Context $script:Context }
    
    # Initialize the environment (loads utility modules, auth modules, phase-specific modules etc.)
    Initialize-MandAEnvironment -Context $script:Context -CurrentMode $effectiveMode -IsValidateOnlyMode:$ValidateOnly.IsPresent
    if ($script:Context.Config.advancedSettings.debugMode) { Write-MandALog "[DEBUG ORCH] Environment Initialized." -Level "DEBUG" -Context $script:Context }
    
    # Exit if only validation was requested
    if ($ValidateOnly.IsPresent) {
        Write-MandALog "Validation-only mode completed successfully." -Level "SUCCESS" -Context $script:Context
        # Consider if error collector should be checked even in ValidateOnly mode
        if ($script:Context.ErrorCollector.HasErrors()) {
            Complete-MandADiscovery -Context $script:Context # To export error report
            exit 1 # Indicate validation found issues
        }
        exit 0
    }
    
    # Authentication and Connection Setup (only if not in Processing-Only or Export-Only mode)
    if ($effectiveMode -in "Discovery", "Full") { 
        Write-MandALog "AUTHENTICATION & CONNECTION SETUP" -Level "HEADER" -Context $script:Context
        if (Get-Command "Initialize-MandAAuthentication" -ErrorAction SilentlyContinue) {
            $authResult = $null
            try {
                Write-MandALog "Calling Initialize-MandAAuthentication..." -Level "DEBUG" -Context $script:Context
                # Pass the full context to authentication and connection functions
                $authResult = Initialize-MandAAuthentication -Context $script:Context
                
                if ($script:Context.Config.advancedSettings.debugMode) { Write-MandALog ("Initialize-MandAAuthentication returned. Result is null: $($null -eq $authResult). Authenticated: " + ($authResult.PSObject.Properties['Authenticated'].Value | Get-OrElse $false)) -Level "DEBUG" -Context $script:Context }

                if ($authResult -and $authResult.PSObject.Properties['Authenticated'].Value) {
                    Write-MandALog "Authentication successful." -Level "SUCCESS" -Context $script:Context
                    # Pass the authentication context from $authResult to Initialize-AllConnections
                    # It's assumed Initialize-MandAAuthentication returns an object with a 'Context' property holding the auth details
                    $authContextForConnections = if ($authResult.PSObject.Properties['Context']) { $authResult.Context } else { $authResult }

                    if (Get-Command "Initialize-AllConnections" -ErrorAction SilentlyContinue) {
                        $connectionStatus = Initialize-AllConnections -AuthContext $authContextForConnections -Context $script:Context
                        # FAULT 6 FIX: Ensure parentheses for -f operator
                        foreach ($serviceItem in $connectionStatus.Keys) { 
                            $statusValue = $connectionStatus[$serviceItem]
                            # Handle if statusValue is bool or hashtable
                            $isConnectedStatus = if ($statusValue -is [bool]) { $statusValue } `
                                                elseif ($statusValue -is [hashtable] -and $statusValue.ContainsKey('Connected')) { $statusValue.Connected } `
                                                else { $false } # Default to false if unknown structure
                            $logMessageString = ("Connected to {0}: {1}" -f $serviceItem, $isConnectedStatus)
                            $logLevelForConnection = if($isConnectedStatus){"SUCCESS"}else{"WARN"}
                            Write-MandALog -Message $logMessageString -Level $logLevelForConnection -Context $script:Context
                        }
                    } else { Write-MandALog "Initialize-AllConnections function not found. Skipping connection setup." -Level "WARN" -Context $script:Context }
                } else {
                    $errorMessageText = if ($authResult -and $authResult.PSObject.Properties['Error']) { $authResult.Error } else { "Authentication failed - no specific details provided by Initialize-MandAAuthentication." }
                    $script:Context.ErrorCollector.AddError("Authentication", $errorMessageText, $null)
                    Write-MandALog "Authentication failed: $errorMessageText" -Level "ERROR" -Context $script:Context
                    # FAULT 20 FIX: Halt if authentication is critical and failed
                    if (($script:Context.Config.environment.connectivity.haltOnConnectionError | global:Get-OrElse @()) -contains "Authentication") {
                        throw "CRITICAL: Authentication failed and is configured to halt on error: $errorMessageText"
                    }
                }
            } catch { # Catch errors from Initialize-MandAAuthentication or Initialize-AllConnections
                $errorMessageText = "Authentication/Connection setup failed: $($_.Exception.Message)"
                $script:Context.ErrorCollector.AddError("Authentication", $errorMessageText, $_.Exception)
                Write-MandALog "$errorMessageText. Stack: $($_.ScriptStackTrace)" -Level "ERROR" -Context $script:Context
                if (($script:Context.Config.environment.connectivity.haltOnConnectionError | global:Get-OrElse @()) -contains "Authentication") {
                    throw "CRITICAL: Authentication/Connection setup failed and is configured to halt on error: $errorMessageText"
                }
            }
        } else {
            $authInitMissingMsg = "Initialize-MandAAuthentication function not found. Authentication cannot proceed."
            Write-MandALog $authInitMissingMsg -Level "ERROR" -Context $script:Context
            $script:Context.ErrorCollector.AddError("Environment", $authInitMissingMsg, $null)
            throw $authInitMissingMsg # Critical if Discovery or Full mode
        }
    } # End if effectiveMode requires auth
    
    if ($script:Context.Config.advancedSettings.debugMode) {Write-MandALog "[DEBUG ORCH] Before Switch. Mode: $effectiveMode" -Level "DEBUG" -Context $script:Context}
    # Execute the requested phases
    switch ($effectiveMode) {
        "Discovery"  { Invoke-DiscoveryPhase  -Context $script:Context }
        "Processing" { Invoke-ProcessingPhase -Context $script:Context }
        "Export"     { Invoke-ExportPhase     -Context $script:Context }
        "Full"       { 
            Invoke-DiscoveryPhase  -Context $script:Context
            if ($script:Context.Config.advancedSettings.debugMode) { Write-MandALog "[DEBUG ORCH] After DiscoveryPhase." -Level "DEBUG" -Context $script:Context }
            Invoke-ProcessingPhase -Context $script:Context
            if ($script:Context.Config.advancedSettings.debugMode) { Write-MandALog "[DEBUG ORCH] After ProcessingPhase." -Level "DEBUG" -Context $script:Context }
            Invoke-ExportPhase     -Context $script:Context 
        }
        default {
            $invalidModeMsg = "Invalid operation mode specified: '$effectiveMode'."
            Write-MandALog $invalidModeMsg -Level "ERROR" -Context $script:Context
            $script:Context.ErrorCollector.AddError("OrchestratorCore", $invalidModeMsg, $null)
            throw $invalidModeMsg
        }
    }

    Complete-MandADiscovery -Context $script:Context
    
    # Determine exit code
    if ($script:Context.ErrorCollector.HasCriticalErrors()) { exit 2 } 
    elseif ($script:Context.ErrorCollector.HasErrors()) { exit 1 } 
    else { exit 0 }

} catch {
    $fatalErrorMsg = "ORCHESTRATOR CRITICAL ERROR: $($_.Exception.Message)"
    Write-Host $fatalErrorMsg -ForegroundColor Red
    Write-Host "Stack Trace: $($_.ScriptStackTrace)" -ForegroundColor Yellow
    
    # Try to log using MandA logger if context exists, otherwise just Write-Host
    if ($script:Context -and $script:Context.ErrorCollector -and (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
        $script:Context.ErrorCollector.AddError("OrchestratorCore", "Fatal error: $($_.Exception.Message)", $_.Exception)
        Write-MandALog $fatalErrorMsg -Level CRITICAL -Context $script:Context
        Write-MandALog "Stack Trace: $($_.ScriptStackTrace)" -Level DEBUG -Context $script:Context
        if (Get-Command Complete-MandADiscovery -ErrorAction SilentlyContinue) {
            Complete-MandADiscovery -Context $script:Context # Attempt to finalize and log errors
        }
    }
    exit 3 # General critical failure
}
finally {
    # Attempt to disconnect services if the function is available
    if ($script:Context -and (Get-Command "Disconnect-AllServices" -ErrorAction SilentlyContinue)) {
        try {
            Write-MandALog "Attempting to disconnect all services..." -Level INFO -Context $script:Context
            Disconnect-AllServices -Context $script:Context # Pass context if needed by Disconnect-AllServices
        } catch {
            $disconnectErrorMsg = "Error during final service disconnection: $($_.Exception.Message)"
            if ($script:Context -and (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
                 Write-MandALog $disconnectErrorMsg -Level WARN -Context $script:Context
            } else {
                Write-Warning $disconnectErrorMsg
            }
        }
    }
    $ErrorActionPreference = $orchestratorErrorActionPreference # Restore original preference
    Write-Host "[Orchestrator] Execution finished. Restored ErrorActionPreference to '$ErrorActionPreference'." -ForegroundColor Gray
}

>>>>>>> 71ded999da9fc295a94738239c805fe0402b3aee
