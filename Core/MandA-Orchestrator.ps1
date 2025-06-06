# -*- coding: utf-8-bom -*-
#Requires -Version 5.1
# -*- coding: utf-8-bom -*-

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-05
# Last Modified: 2025-06-06
# Change Log: Updated version control header

<#
.SYNOPSIS
    M&A Discovery Suite - Core Orchestration Engine (Enhanced Debug Version)
.DESCRIPTION
    Core orchestrator that manages discovery, processing, and export phases.
    This version includes extensive debugging output and fixes for common issues.
.NOTES
    Version: 6.1.0-DEBUG
    Created: 2025-01-03
    Enhanced with verbose debugging and robustness fixes
    
    Key improvements:
    - Enhanced debug logging throughout
    - Cleaned up redundant enabledSources defensive code
    - Fixed authentication context type issues
    - Removed all non-ASCII characters
    - Added comprehensive error context
    - Improved type validation
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
    [int]$ParallelThrottle = 5,
    
    [Parameter(Mandatory=$false)]
    [switch]$DebugMode
)

#===============================================================================
#                       INITIALIZATION
#===============================================================================

# Module-scope context variable
$script:ModuleContext = $null

# Lazy initialization function
function Get-ModuleContext {
    if ($null -eq $script:ModuleContext) {
        if ($null -ne $global:MandA) {
            $script:ModuleContext = $global:MandA
        } else {
            throw "Module context not available"
        }
    }
    return $script:ModuleContext
}

# Verify global context exists
Write-Host "[ORCHESTRATOR DEBUG] Starting initialization..." -ForegroundColor Cyan
Write-Host "[ORCHESTRATOR DEBUG] PowerShell Version: $($PSVersionTable.PSVersion)" -ForegroundColor Gray
Write-Host "[ORCHESTRATOR DEBUG] Script Location: $PSCommandPath" -ForegroundColor Gray
Write-Host "[ORCHESTRATOR DEBUG] Parameters: CompanyName='$CompanyName', Mode='$Mode', Force=$Force, ValidateOnly=$ValidateOnly" -ForegroundColor Gray

if (-not $global:MandA -or -not $global:MandA.Initialized) {
    Write-Host "[ORCHESTRATOR ERROR] Global MandA context not initialized!" -ForegroundColor Red
    Write-Host "[ORCHESTRATOR DEBUG] Global:MandA exists: $($null -ne $global:MandA)" -ForegroundColor Yellow
    if ($global:MandA) {
        Write-Host "[ORCHESTRATOR DEBUG] Global:MandA.Initialized: $($global:MandA.Initialized)" -ForegroundColor Yellow
    }
    throw "Global M&A context not initialized. Run through QuickStart.ps1 or ensure Set-SuiteEnvironment.ps1 has been sourced."
}

Write-Host "[ORCHESTRATOR DEBUG] Global context validated successfully" -ForegroundColor Green

# Set error handling
$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"

# Script variables
$script:StartTime = Get-Date
$script:DebugMode = $DebugMode -or $VerbosePreference -eq 'Continue'
$script:ErrorCollector = @{
    Errors = [System.Collections.ArrayList]::new()
    Warnings = [System.Collections.ArrayList]::new()
    Critical = [System.Collections.ArrayList]::new()
}
$script:AzureOnlySources = @(
    "Azure", "Graph", "Intune", "Licensing", 
    "ExternalIdentity", "SharePoint", "Teams", "Exchange"
)

Write-Host "[ORCHESTRATOR DEBUG] Debug mode: $($script:DebugMode)" -ForegroundColor Gray
Write-Host "[ORCHESTRATOR DEBUG] Error action preference: $ErrorActionPreference" -ForegroundColor Gray

#===============================================================================
#                       HELPER FUNCTIONS
#===============================================================================

function Write-OrchestratorLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Component = "Orchestrator",
        [switch]$DebugOnly
    )
    
    # Skip debug-only messages if not in debug mode
    if ($DebugOnly -and -not $script:DebugMode) { return }
    
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
            "CRITICAL" { "Magenta" }
            default { "White" }
        }
        
        # Add visual indicators
        $indicator = switch ($Level) {
            "ERROR" { "[!!]" }
            "WARN" { "[??]" }
            "SUCCESS" { "[OK]" }
            "DEBUG" { "[>>]" }
            "HEADER" { "[==]" }
            "CRITICAL" { "[XX]" }
            default { "[--]" }
        }
        
        Write-Host "$timestamp $indicator [$Level] [$Component] $Message" -ForegroundColor $color
    }
}

function Add-OrchestratorError {
    param(
        [string]$Source,
        [string]$Message,
        [System.Exception]$Exception,
        [string]$Severity = "Error",
        [hashtable]$Context
    )
    
    $errorEntry = @{
        Timestamp = Get-Date
        Source = $Source
        Message = $Message
        Exception = if ($Exception) { $Exception.ToString() } else { $null }
        ExceptionType = if ($Exception) { $Exception.GetType().FullName } else { $null }
        Severity = $Severity
        Context = $Context
        StackTrace = if ($Exception) { $Exception.StackTrace } else { $null }
    }
    
    switch ($Severity) {
        "Critical" { $null = $script:ErrorCollector.Critical.Add($errorEntry) }
        "Warning" { $null = $script:ErrorCollector.Warnings.Add($errorEntry) }
        default { $null = $script:ErrorCollector.Errors.Add($errorEntry) }
    }
    
    Write-OrchestratorLog -Message "[$Source] $Message" -Level $Severity.ToUpper()
    
    if ($script:DebugMode -and $Exception) {
        Write-OrchestratorLog -Message "Exception Type: $($Exception.GetType().FullName)" -Level "DEBUG"
        Write-OrchestratorLog -Message "Stack Trace: $($Exception.StackTrace)" -Level "DEBUG"
    }
}

function Test-OrchestratorPrerequisites {
    Write-OrchestratorLog -Message "Validating orchestrator prerequisites..." -Level "INFO"
    Write-OrchestratorLog -Message "Checking PowerShell version..." -Level "DEBUG" -DebugOnly
    
    $prereqMet = $true
    
    # Check PowerShell version
    if ($PSVersionTable.PSVersion.Major -lt 5 -or 
        ($PSVersionTable.PSVersion.Major -eq 5 -and $PSVersionTable.PSVersion.Minor -lt 1)) {
        Add-OrchestratorError -Source "Prerequisites" `
            -Message "PowerShell 5.1 or higher required. Current: $($PSVersionTable.PSVersion)" `
            -Severity "Critical"
        $prereqMet = $false
    } else {
        Write-OrchestratorLog -Message "PowerShell version OK: $($PSVersionTable.PSVersion)" -Level "DEBUG" -DebugOnly
    }
    
    # Check critical paths
    Write-OrchestratorLog -Message "Checking critical paths..." -Level "DEBUG" -DebugOnly
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
        } else {
            Write-OrchestratorLog -Message "Path OK: $pathKey = $($global:MandA.Paths[$pathKey])" -Level "DEBUG" -DebugOnly
        }
    }
    
    # Debug output for configuration
    if ($script:DebugMode) {
        Write-OrchestratorLog -Message "Configuration metadata:" -Level "DEBUG"
        Write-OrchestratorLog -Message "  Version: $($global:MandA.Config.metadata.version)" -Level "DEBUG"
        Write-OrchestratorLog -Message "  Company: $($global:MandA.Config.metadata.companyName)" -Level "DEBUG"
        Write-OrchestratorLog -Message "  Environment LogLevel: $($global:MandA.Config.environment.logLevel)" -Level "DEBUG"
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
    
    Write-OrchestratorLog -Message "Loading utility modules..." -Level "DEBUG" -DebugOnly
    foreach ($module in $utilityModules) {
        $modulePath = Join-Path (Get-ModuleContext).Paths.Utilities "$module.psm1"
        Write-OrchestratorLog -Message "Checking utility module: $modulePath" -Level "DEBUG" -DebugOnly
        
        if (Test-Path $modulePath) {
            try {
                Import-Module $modulePath -Force -Global
                Write-OrchestratorLog -Message "Loaded utility module: $module" -Level "DEBUG"
            } catch {
                Add-OrchestratorError -Source "ModuleLoader" `
                    -Message "Failed to load utility module $module" `
                    -Exception $_.Exception
            }
        } else {
            Write-OrchestratorLog -Message "Utility module not found: $module" -Level "WARN"
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
    Write-OrchestratorLog -Message "Loading discovery modules..." -Level "INFO"
    
    Write-OrchestratorLog -Message "Raw enabledSources type: $($global:MandA.Config.discovery.enabledSources.GetType().FullName)" -Level "DEBUG" -DebugOnly
    Write-OrchestratorLog -Message "Raw enabledSources content: $($global:MandA.Config.discovery.enabledSources | ConvertTo-Json -Compress)" -Level "DEBUG" -DebugOnly
    
    # Validate and convert enabledSources to array
    $enabledSources = (Get-ModuleContext).Config.discovery.enabledSources
    if ($null -eq $enabledSources) {
        Write-OrchestratorLog -Message "enabledSources is null, using empty array" -Level "WARN"
        $enabledSources = @()
    } elseif ($enabledSources -is [System.Collections.Hashtable]) {
        Write-OrchestratorLog -Message "Converting enabledSources from Hashtable to array of keys" -Level "WARN"
        $enabledSources = @($enabledSources.Keys)
    } elseif ($enabledSources -is [PSCustomObject]) {
        Write-OrchestratorLog -Message "Converting enabledSources from PSCustomObject to array of property names" -Level "WARN"
        $enabledSources = @($enabledSources.PSObject.Properties.Name)
    } elseif ($enabledSources -isnot [array]) {
        Write-OrchestratorLog -Message "Converting single enabledSource to array" -Level "DEBUG"
        $enabledSources = @($enabledSources)
    }
    
    Write-OrchestratorLog -Message "Loading discovery modules for $($enabledSources.Count) sources" -Level "INFO"
    Write-OrchestratorLog -Message "Enabled sources: $($enabledSources -join ', ')" -Level "DEBUG"
    
    $loadedCount = 0
    $failedModules = @()
    
    foreach ($source in $enabledSources) {
        # Skip if source is not a string
        if ($source -isnot [string]) {
            Write-OrchestratorLog -Message "Skipping invalid source type: $($source.GetType().Name) with value: $source" -Level "WARN"
            continue
        }
        
        $modulePath = Join-Path (Get-ModuleContext).Paths.Discovery "${source}Discovery.psm1"
        Write-OrchestratorLog -Message "Attempting to load: $modulePath" -Level "DEBUG" -DebugOnly
        
        if (Test-Path $modulePath) {
            try {
                Import-Module $modulePath -Force -Global -ErrorAction Stop
                $loadedCount++
                Write-OrchestratorLog -Message "Successfully loaded discovery module: $source" -Level "DEBUG"
                
                # Verify module was loaded
                $moduleLoaded = Get-Module -Name "${source}Discovery" -ErrorAction SilentlyContinue
                if ($moduleLoaded) {
                    Write-OrchestratorLog -Message "Module verified: $source (Version: $($moduleLoaded.Version))" -Level "DEBUG" -DebugOnly
                }
            } catch {
                $failedModules += $source
                Add-OrchestratorError -Source "ModuleLoader" `
                    -Message "Failed to load discovery module $source" `
                    -Exception $_.Exception `
                    -Severity "Warning"
            }
        } else {
            $failedModules += $source
            Add-OrchestratorError -Source "ModuleLoader" `
                -Message "Discovery module not found: $modulePath" `
                -Severity "Warning"
        }
    }
    
    Write-OrchestratorLog -Message "Discovery module loading complete: $loadedCount/$($enabledSources.Count) loaded successfully" -Level "INFO"
    if ($failedModules.Count -gt 0) {
        Write-OrchestratorLog -Message "Failed modules: $($failedModules -join ', ')" -Level "WARN"
    }
}

function Load-ProcessingModules {
    Write-OrchestratorLog -Message "Loading processing modules..." -Level "INFO"
    
    $processingModules = @(
        "DataAggregation",
        "UserProfileBuilder",
        "WaveGeneration",
        "DataValidation"
    )
    
    $loadedCount = 0
    foreach ($module in $processingModules) {
        $modulePath = Join-Path (Get-ModuleContext).Paths.Processing "$module.psm1"
        Write-OrchestratorLog -Message "Checking processing module: $modulePath" -Level "DEBUG" -DebugOnly
        
        if (Test-Path $modulePath) {
            try {
                Import-Module $modulePath -Force -Global
                $loadedCount++
                Write-OrchestratorLog -Message "Loaded processing module: $module" -Level "DEBUG"
            } catch {
                Add-OrchestratorError -Source "ModuleLoader" `
                    -Message "Failed to load processing module $module" `
                    -Exception $_.Exception
            }
        } else {
            Write-OrchestratorLog -Message "Processing module not found: $module" -Level "WARN"
        }
    }
    
    Write-OrchestratorLog -Message "Processing module loading complete: $loadedCount/$($processingModules.Count) loaded" -Level "INFO"
}

function Load-ExportModules {
    Write-OrchestratorLog -Message "Loading export modules..." -Level "INFO"
    
    $enabledFormats = (Get-ModuleContext).Config.export.formats
    if ($enabledFormats -isnot [array]) {
        $enabledFormats = @($enabledFormats)
    }
    
    Write-OrchestratorLog -Message "Export formats enabled: $($enabledFormats -join ', ')" -Level "DEBUG"
    
    $formatMapping = @{
        "CSV" = "CSVExport"
        "JSON" = "JSONExport"
        "Excel" = "ExcelExport"
        "CompanyControlSheet" = "CompanyControlSheetExporter"
        "PowerApps" = "PowerAppsExporter"
    }
    
    $loadedCount = 0
    foreach ($format in $enabledFormats) {
        if ($formatMapping.ContainsKey($format)) {
            $moduleName = $formatMapping[$format]
            $modulePath = Join-Path (Get-ModuleContext).Paths.Export "$moduleName.psm1"
            
            Write-OrchestratorLog -Message "Loading export module for $format`: $modulePath" -Level "DEBUG" -DebugOnly
            
            if (Test-Path $modulePath) {
                try {
                    Import-Module $modulePath -Force -Global
                    $loadedCount++
                    Write-OrchestratorLog -Message "Loaded export module: $moduleName" -Level "DEBUG"
                } catch {
                    Add-OrchestratorError -Source "ModuleLoader" `
                        -Message "Failed to load export module $moduleName" `
                        -Exception $_.Exception
                }
            } else {
                Write-OrchestratorLog -Message "Export module not found: $moduleName" -Level "WARN"
            }
        } else {
            Write-OrchestratorLog -Message "No module mapping for export format: $format" -Level "WARN"
        }
    }
    
    Write-OrchestratorLog -Message "Export module loading complete: $loadedCount/$($enabledFormats.Count) loaded" -Level "INFO"
}

#===============================================================================
#                       PHASE EXECUTION FUNCTIONS
#===============================================================================

function Invoke-DiscoveryPhase {
    Write-OrchestratorLog -Message "STARTING DISCOVERY PHASE" -Level "HEADER"
    
    $phaseResult = @{
        Success = $true
        ModuleResults = @{}
        CriticalErrors = [System.Collections.ArrayList]::new()
        RecoverableErrors = [System.Collections.ArrayList]::new()
        Warnings = [System.Collections.ArrayList]::new()
    }
    
    try {
        # Initialize authentication if needed
        if (Get-Command Initialize-MandAAuthentication -ErrorAction SilentlyContinue) {
            Write-OrchestratorLog -Message "Initializing authentication..." -Level "INFO"
            
            # FIX: Create proper context object for authentication
            $authContext = @{
                Config = $global:MandA.Config
                Paths = $global:MandA.Paths
                CompanyName = $global:MandA.CompanyName
            }
            
            Write-OrchestratorLog -Message "Auth context type: $($authContext.GetType().FullName)" -Level "DEBUG" -DebugOnly
            
            try {
                # Try with Configuration parameter first
                $authResult = Initialize-MandAAuthentication -Configuration $global:MandA.Config
            } catch {
                Write-OrchestratorLog -Message "Failed with Configuration parameter, trying Context parameter" -Level "DEBUG"
                # Try with Context parameter
                $authResult = Initialize-MandAAuthentication -Context $authContext
            }
            
            if (-not $authResult -or -not $authResult.Authenticated) {
                $errorMsg = if ($authResult.Error) { $authResult.Error } else { "Unknown authentication error" }
                throw "Authentication failed: $errorMsg"
            }
            
            Write-OrchestratorLog -Message "Authentication successful" -Level "SUCCESS"
            
            # Initialize connections
            if (Get-Command Initialize-AllConnections -ErrorAction SilentlyContinue) {
                Write-OrchestratorLog -Message "Initializing service connections..." -Level "INFO"
                
                $connectionAuth = if ($authResult.Context) { $authResult.Context } else { $authResult }
                $connections = Initialize-AllConnections -Configuration $global:MandA.Config `
                    -AuthContext $connectionAuth
                
                foreach ($service in $connections.Keys) {
                    $status = $connections[$service]
                    $connected = if ($status -is [bool]) { $status }
                                else { $status.Connected }
                    
                    Write-OrchestratorLog -Message "Connection to $service`: $connected" `
                        -Level $(if ($connected) { "SUCCESS" } else { "WARN" })
                }
            }
        } else {
            Write-OrchestratorLog -Message "Authentication module not found, skipping authentication" -Level "WARN"
        }
        
        $enabledSources = (Get-ModuleContext).Config.discovery.enabledSources
        $criticalSources = @('ActiveDirectory', 'Graph')  # Sources that must succeed
        
        # Validate enabledSources is not null
        if ($null -eq $enabledSources) {
            Write-OrchestratorLog -Message "enabledSources is null, using empty array" -Level "WARN"
            $enabledSources = @()
        }
        
        # Filter to string sources only
        $validSources = @($enabledSources | Where-Object { $_ -is [string] })
        Write-OrchestratorLog -Message "Valid discovery sources: $($validSources.Count) of $($enabledSources.Count)" -Level "INFO"
        
        foreach ($source in $validSources) {
            Write-OrchestratorLog -Message "Executing $source discovery..." -Level "INFO"
            
            try {
                $moduleResult = Invoke-DiscoveryModule -ModuleName $source -Configuration $global:MandA.Config
                $phaseResult.ModuleResults[$source] = $moduleResult
                
                # Categorize errors
                if (-not $moduleResult.Success) {
                    if ($source -in $criticalSources) {
                        $null = $phaseResult.CriticalErrors.Add(@{
                            Source = $source
                            Errors = $moduleResult.Errors
                            Impact = "Critical - Suite cannot continue without $source data"
                        })
                        $phaseResult.Success = $false
                    }
                    else {
                        $null = $phaseResult.RecoverableErrors.Add(@{
                            Source = $source
                            Errors = $moduleResult.Errors
                            Impact = "Non-critical - Suite can continue but data will be incomplete"
                        })
                    }
                }
                
                # Collect warnings
                if ($moduleResult.Warnings.Count -gt 0) {
                    $null = $phaseResult.Warnings.Add(@{
                        Source = $source
                        Warnings = $moduleResult.Warnings
                    })
                }
            }
            catch {
                # Handle complete module failure
                Write-OrchestratorLog -Message "Catastrophic failure in $source module: $_" -Level "CRITICAL"
                
                $null = $phaseResult.CriticalErrors.Add(@{
                    Source = $source
                    Errors = @(@{
                        Message = "Module execution failed completely"
                        Exception = $_.Exception.ToString()
                        StackTrace = $_.ScriptStackTrace
                    })
                    Impact = "Module could not be executed"
                })
                
                if ($source -in $criticalSources) {
                    $phaseResult.Success = $false
                }
            }
        }
        
        # Generate error report
        Export-ErrorReport -PhaseResult $phaseResult
        
        # Summary
        $successCount = ($phaseResult.ModuleResults.Values | Where-Object { $_.Success }).Count
        $failCount = $validSources.Count - $successCount
        
        Write-OrchestratorLog -Message "Discovery completed: $successCount successful, $failCount failed" `
            -Level $(if ($failCount -eq 0) { "SUCCESS" } else { "WARN" })
        Write-OrchestratorLog -Message "Critical errors: $($phaseResult.CriticalErrors.Count), Recoverable errors: $($phaseResult.RecoverableErrors.Count), Warnings: $($phaseResult.Warnings.Count)" -Level "INFO"
        
    } catch {
        $phaseResult.Success = $false
        Add-OrchestratorError -Source "DiscoveryPhase" `
            -Message "Discovery phase failed: $_" `
            -Exception $_.Exception `
            -Severity "Critical"
    }
    
    return $phaseResult
}

function Invoke-DiscoveryModule {
    param(
        [string]$ModuleName,
        [hashtable]$Configuration
    )
    
    $moduleFunction = "Invoke-${ModuleName}Discovery"
    
    # Validate module is loaded
    if (-not (Get-Command $moduleFunction -ErrorAction SilentlyContinue)) {
        throw "Discovery function '$moduleFunction' not found. Ensure module is loaded."
    }
    
    # Set up isolated error handling
    $errorCapture = [System.Collections.ArrayList]::new()
    $originalErrorVariable = $Error.Clone()
    
    try {
        # Clear error variable to capture only this module's errors
        $Error.Clear()
        
        # Invoke with timeout protection
        $result = Invoke-WithTimeout -ScriptBlock {
            & $moduleFunction -Configuration $Configuration
        } -TimeoutSeconds 300 -TimeoutMessage "Discovery module $ModuleName timed out after 5 minutes"
        
        # Capture any non-terminating errors
        foreach ($err in $Error) {
            if ($err -notin $originalErrorVariable) {
                $null = $errorCapture.Add($err)
            }
        }
        
        # Add captured errors to result if it doesn't have them
        if ($errorCapture.Count -gt 0 -and $result.Errors.Count -eq 0) {
            foreach ($err in $errorCapture) {
                $result.AddError($err.Exception.Message, $err.Exception)
            }
        }
        
        return $result
    }
    catch {
        # Create a failed result if module didn't return one
        $failedResult = [DiscoveryResult]::new($ModuleName)
        $failedResult.AddError("Module execution failed", $_.Exception)
        $failedResult.Complete()
        return $failedResult
    }
}

function Export-ErrorReport {
    param(
        [hashtable]$PhaseResult
    )
    
    if ($PhaseResult.CriticalErrors.Count -eq 0 -and $PhaseResult.RecoverableErrors.Count -eq 0 -and $PhaseResult.Warnings.Count -eq 0) {
        Write-OrchestratorLog -Message "No errors or warnings to report" -Level "SUCCESS"
        return
    }
    
    $errorReport = @{
        Timestamp = Get-Date
        ExecutionId = [guid]::NewGuid().ToString()
        Summary = @{
            CriticalErrors = $PhaseResult.CriticalErrors.Count
            RecoverableErrors = $PhaseResult.RecoverableErrors.Count
            Warnings = $PhaseResult.Warnings.Count
            TotalModules = $PhaseResult.ModuleResults.Count
            SuccessfulModules = ($PhaseResult.ModuleResults.Values | Where-Object { $_.Success }).Count
        }
        CriticalErrors = $PhaseResult.CriticalErrors
        RecoverableErrors = $PhaseResult.RecoverableErrors
        Warnings = $PhaseResult.Warnings
        ModuleResults = @{}
    }
    
    # Add detailed module results
    foreach ($moduleName in $PhaseResult.ModuleResults.Keys) {
        $moduleResult = $PhaseResult.ModuleResults[$moduleName]
        $errorReport.ModuleResults[$moduleName] = @{
            Success = $moduleResult.Success
            ModuleName = $moduleResult.ModuleName
            StartTime = $moduleResult.StartTime
            EndTime = $moduleResult.EndTime
            Duration = $moduleResult.Metadata.Duration
            ErrorCount = $moduleResult.Errors.Count
            WarningCount = $moduleResult.Warnings.Count
            ExecutionId = $moduleResult.ExecutionId
        }
    }
    
    # Export to file
    $errorReportPath = Join-Path $global:MandA.Paths.LogOutput "DiscoveryErrorReport_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    $errorReport | ConvertTo-Json -Depth 10 | Set-Content -Path $errorReportPath -Encoding UTF8
    
    Write-OrchestratorLog -Message "Error report exported: $errorReportPath" -Level "INFO"
    
    # Log summary to console
    Write-OrchestratorLog -Message "--- ERROR SUMMARY ---" -Level "HEADER"
    Write-OrchestratorLog -Message "Critical Errors: $($errorReport.Summary.CriticalErrors)" -Level $(if ($errorReport.Summary.CriticalErrors -gt 0) { "ERROR" } else { "SUCCESS" })
    Write-OrchestratorLog -Message "Recoverable Errors: $($errorReport.Summary.RecoverableErrors)" -Level $(if ($errorReport.Summary.RecoverableErrors -gt 0) { "WARN" } else { "SUCCESS" })
    Write-OrchestratorLog -Message "Warnings: $($errorReport.Summary.Warnings)" -Level $(if ($errorReport.Summary.Warnings -gt 0) { "WARN" } else { "SUCCESS" })
    Write-OrchestratorLog -Message "Successful Modules: $($errorReport.Summary.SuccessfulModules)/$($errorReport.Summary.TotalModules)" -Level "INFO"
}

function Invoke-SequentialDiscovery {
    param([array]$Sources)
    
    Write-OrchestratorLog -Message "Starting sequential discovery for $($Sources.Count) sources" -Level "INFO"
    
    $results = @{}
    $currentNum = 0
    $total = $Sources.Count
    
    foreach ($source in $Sources) {
        $currentNum++
        Write-OrchestratorLog -Message "[$currentNum/$total] Starting $source discovery..." -Level "PROGRESS"
        
        $functionName = "Invoke-${source}Discovery"
        Write-OrchestratorLog -Message "Looking for function: $functionName" -Level "DEBUG" -DebugOnly
        
        if (Get-Command $functionName -ErrorAction SilentlyContinue) {
            try {
                $startTime = Get-Date
                
                Write-OrchestratorLog -Message "Executing $functionName with configuration" -Level "DEBUG" -DebugOnly
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
                $duration = (Get-Date) - $startTime
                $results[$source] = @{
                    Success = $false
                    Error = $_.Exception.Message
                    Duration = $duration
                    Exception = $_.Exception
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
            
            # List available discovery functions for debugging
            if ($script:DebugMode) {
                $availableFunctions = Get-Command -Name "*Discovery" -CommandType Function -ErrorAction SilentlyContinue
                Write-OrchestratorLog -Message "Available discovery functions: $($availableFunctions.Name -join ', ')" -Level "DEBUG"
            }
        }
    }
    
    return $results
}

function Invoke-ParallelDiscovery {
    param([array]$Sources)
    
    $throttle = $global:MandA.Config.discovery.maxConcurrentJobs
    Write-OrchestratorLog -Message "Starting parallel discovery (throttle: $throttle) for $($Sources.Count) sources" -Level "INFO"
    
    # Create runspace pool
    $runspacePool = [runspacefactory]::CreateRunspacePool(1, $throttle)
    $runspacePool.Open()
    
    Write-OrchestratorLog -Message "Runspace pool created with max threads: $throttle" -Level "DEBUG" -DebugOnly
    
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
                Exception = $_
            }
        }
    }
    
    # Start jobs
    foreach ($source in $Sources) {
        Write-OrchestratorLog -Message "Creating runspace job for: $source" -Level "DEBUG" -DebugOnly
        
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
    
    Write-OrchestratorLog -Message "All runspace jobs started, waiting for completion..." -Level "DEBUG" -DebugOnly
    
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
                
                if ($script:DebugMode -and -not $result.Success) {
                    Write-OrchestratorLog -Message "Error details for $($result.Source): $($result.Error)" -Level "DEBUG"
                }
                
            } catch {
                Add-OrchestratorError -Source $job.Source `
                    -Message "Failed to retrieve job result: $_" `
                    -Exception $_.Exception
                    
                $results[$job.Source] = @{
                    Source = $job.Source
                    Success = $false
                    Error = "Job retrieval failed: $_"
                }
            } finally {
                $job.PowerShell.Dispose()
                $job.Processed = $true
            }
        }
    }
    
    # Cleanup
    $runspacePool.Close()
    $runspacePool.Dispose()
    
    Write-OrchestratorLog -Message "Parallel discovery complete, runspace pool disposed" -Level "DEBUG" -DebugOnly
    
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
        Write-OrchestratorLog -Message "Checking raw data path: $rawDataPath" -Level "DEBUG" -DebugOnly
        
        if (-not (Test-Path $rawDataPath)) {
            throw "Raw data directory not found. Run Discovery phase first."
        }
        
        $csvFiles = Get-ChildItem -Path $rawDataPath -Filter "*.csv" -File
        if ($csvFiles.Count -eq 0) {
            throw "No raw data files found. Run Discovery phase first."
        }
        
        Write-OrchestratorLog -Message "Found $($csvFiles.Count) raw data files to process" -Level "INFO"
        
        if ($script:DebugMode) {
            Write-OrchestratorLog -Message "Raw data files:" -Level "DEBUG"
            foreach ($file in $csvFiles) {
                Write-OrchestratorLog -Message "  - $($file.Name) ($([math]::Round($file.Length/1KB, 2)) KB)" -Level "DEBUG"
            }
        }
        
        # Execute data aggregation
        if (Get-Command Start-DataAggregation -ErrorAction SilentlyContinue) {
            Write-OrchestratorLog -Message "Starting data aggregation..." -Level "INFO"
            
            $aggregationResult = Start-DataAggregation -Configuration $global:MandA.Config
            
            if (-not $aggregationResult) {
                throw "Data aggregation failed"
            }
            
            # Get processed files
            $processedPath = $global:MandA.Paths.ProcessedDataOutput
            $phaseResult.ProcessedFiles = Get-ChildItem -Path $processedPath -Filter "*.csv" -File
            
            Write-OrchestratorLog -Message "Processing completed: $($phaseResult.ProcessedFiles.Count) files generated" `
                -Level "SUCCESS"
            
            if ($script:DebugMode) {
                Write-OrchestratorLog -Message "Processed files:" -Level "DEBUG"
                foreach ($file in $phaseResult.ProcessedFiles) {
                    Write-OrchestratorLog -Message "  - $($file.Name) ($([math]::Round($file.Length/1KB, 2)) KB)" -Level "DEBUG"
                }
            }
            
        } else {
            throw "Start-DataAggregation function not found. Ensure DataAggregation module is loaded."
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
        Write-OrchestratorLog -Message "Loading processed data from: $processedPath" -Level "DEBUG" -DebugOnly
        
        if (-not (Test-Path $processedPath)) {
            throw "Processed data directory not found. Run Processing phase first."
        }
        
        $dataToExport = @{}
        $processedFiles = Get-ChildItem -Path $processedPath -Filter "*.csv" -File
        
        Write-OrchestratorLog -Message "Found $($processedFiles.Count) processed files to export" -Level "INFO"
        
        foreach ($file in $processedFiles) {
            try {
                Write-OrchestratorLog -Message "Loading file: $($file.Name)" -Level "DEBUG" -DebugOnly
                $dataToExport[$file.BaseName] = Import-Csv -Path $file.FullName -Encoding UTF8
                
                if ($script:DebugMode) {
                    $recordCount = $dataToExport[$file.BaseName].Count
                    Write-OrchestratorLog -Message "  Loaded $recordCount records from $($file.BaseName)" -Level "DEBUG"
                }
            } catch {
                Add-OrchestratorError -Source "ExportPhase" `
                    -Message "Failed to load $($file.Name): $_" `
                    -Exception $_.Exception `
                    -Severity "Warning"
            }
        }
        
        # Execute exports
        $enabledFormats = (Get-ModuleContext).Config.export.formats
        if ($enabledFormats -isnot [array]) {
            $enabledFormats = @($enabledFormats)
        }
        
        Write-OrchestratorLog -Message "Export formats to process: $($enabledFormats -join ', ')" -Level "INFO"
        
        foreach ($format in $enabledFormats) {
            $functionMapping = @{
                "CSV" = "Export-ToCSV"
                "JSON" = "Export-ToJSON"
                "Excel" = "Export-ToExcel"
                "PowerApps" = "Export-ForPowerApps"
                "CompanyControlSheet" = "Export-ToCompanyControlSheet"
            }
            
            $functionName = $functionMapping[$format]
            Write-OrchestratorLog -Message "Looking for export function: $functionName" -Level "DEBUG" -DebugOnly
            
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
        
        Write-OrchestratorLog -Message "Export phase completed: $($phaseResult.ExportedFormats -join ', ')" -Level "SUCCESS"
        
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
    Write-OrchestratorLog -Message "========================================" -Level "HEADER"
    Write-OrchestratorLog -Message "M&A Discovery Suite Orchestrator v6.1.0-DEBUG" -Level "HEADER"
    Write-OrchestratorLog -Message "========================================" -Level "HEADER"
    Write-OrchestratorLog -Message "Company: $CompanyName | Mode: $Mode" -Level "INFO"
    
    # Validate prerequisites
    if (-not (Test-OrchestratorPrerequisites)) {
        throw "Prerequisites validation failed"
    }
    
    # Load configuration
    $config = $global:MandA.Config
    if (-not [string]::IsNullOrWhiteSpace($ConfigurationFile)) {
        Write-OrchestratorLog -Message "Loading custom configuration file: $ConfigurationFile" -Level "INFO"
        
        $configPath = if ([System.IO.Path]::IsPathRooted($ConfigurationFile)) {
            $ConfigurationFile
        } else {
            Join-Path $global:MandA.Paths.Configuration $ConfigurationFile
        }
        
        if (Test-Path $configPath) {
            Write-OrchestratorLog -Message "Loading configuration: $configPath" -Level "INFO"
            try {
                $configContent = Get-Content $configPath -Raw | ConvertFrom-Json
                # TODO: Implement proper config merging logic
                Write-OrchestratorLog -Message "Custom configuration loaded (merge not implemented)" -Level "WARN"
            } catch {
                Add-OrchestratorError -Source "ConfigLoader" `
                    -Message "Failed to load custom configuration" `
                    -Exception $_.Exception
            }
        } else {
            Write-OrchestratorLog -Message "Configuration file not found: $configPath" -Level "WARN"
        }
    }
    
    # Apply command-line overrides
    if ($Force) {
        $global:MandA.Config.discovery.skipExistingFiles = $false
        Write-OrchestratorLog -Message "Force mode enabled - will overwrite existing files" -Level "INFO"
    }
    
    # Handle AzureOnly mode
    if ($Mode -eq "AzureOnly") {
        Write-OrchestratorLog -Message "Azure-only mode selected" -Level "INFO"
        
        $allSources = $global:MandA.Config.discovery.enabledSources
        
        # Fix: Ensure sources is an array
        if ($allSources -is [System.Collections.Hashtable]) {
            $allSources = @($allSources.Keys)
        } elseif ($allSources -is [PSCustomObject]) {
            $allSources = @($allSources.PSObject.Properties.Name)
        } elseif ($allSources -isnot [array]) {
            $allSources = @($allSources)
        }
        
        $filteredSources = $allSources | Where-Object { $_ -in $script:AzureOnlySources }
        $global:MandA.Config.discovery.enabledSources = $filteredSources
        
        Write-OrchestratorLog -Message "Filtered to Azure sources: $($filteredSources -join ', ')" -Level "INFO"
        $Mode = "Full" # Process as full mode with filtered sources
    }
    
    # Initialize modules
    Initialize-OrchestratorModules -Phase $Mode
    
    # Execute validation if requested
    if ($ValidateOnly) {
        Write-OrchestratorLog -Message "VALIDATION-ONLY MODE" -Level "INFO"
        
        # Run basic validation checks
        $validationPassed = $true
        
        # Check modules
        $requiredModules = Get-Module -Name "*Discovery", "*Processing", "*Export" -ListAvailable
        Write-OrchestratorLog -Message "Available modules: $($requiredModules.Count)" -Level "INFO"
        
        # Check paths
        $pathsToCheck = @("RawDataOutput", "ProcessedDataOutput", "ExportOutput", "LogOutput")
        foreach ($pathKey in $pathsToCheck) {
            $path = $global:MandA.Paths[$pathKey]
            if (Test-Path $path) {
                Write-OrchestratorLog -Message "Path exists: $pathKey = $path" -Level "SUCCESS"
            } else {
                Write-OrchestratorLog -Message "Path missing: $pathKey = $path" -Level "WARN"
                $validationPassed = $false
            }
        }
        
        $exitCode = if ($validationPassed) { 0 } else { 1 }
        Write-OrchestratorLog -Message "Validation complete. Exit code: $exitCode" -Level "INFO"
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
            } else {
                Write-OrchestratorLog -Message "Skipping Processing phase due to Discovery failure" -Level "WARN"
            }
            if ($phaseResults.Processing -and $phaseResults.Processing.Success) {
                $phaseResults.Export = Invoke-ExportPhase
            } else {
                Write-OrchestratorLog -Message "Skipping Export phase due to Processing failure" -Level "WARN"
            }
        }
    }
    
    # Generate summary
    Write-OrchestratorLog -Message "" -Level "INFO"
    Write-OrchestratorLog -Message "========================================" -Level "HEADER"
    Write-OrchestratorLog -Message "EXECUTION SUMMARY" -Level "HEADER"
    Write-OrchestratorLog -Message "========================================" -Level "HEADER"
    
    $duration = (Get-Date) - $script:StartTime
    Write-OrchestratorLog -Message "Total execution time: $($duration.ToString('hh\:mm\:ss'))" -Level "INFO"
    
    # Phase results summary
    foreach ($phase in $phaseResults.Keys) {
        $result = $phaseResults[$phase]
        $status = if ($result.Success) { "SUCCESS" } else { "FAILED" }
        Write-OrchestratorLog -Message "$phase Phase: $status" -Level $(if ($result.Success) { "SUCCESS" } else { "ERROR" })
    }
    
    # Error summary
    $criticalCount = $script:ErrorCollector.Critical.Count
    $errorCount = $script:ErrorCollector.Errors.Count
    $warningCount = $script:ErrorCollector.Warnings.Count
    
    Write-OrchestratorLog -Message "Errors - Critical: $criticalCount, Errors: $errorCount, Warnings: $warningCount" -Level "INFO"
    
    # Export error report if needed
    if ($criticalCount -gt 0 -or $errorCount -gt 0) {
        $errorReportPath = Join-Path $global:MandA.Paths.LogOutput "OrchestratorErrors_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
        
        # Add execution context to error report
        $errorReport = @{
            ExecutionTime = Get-Date
            Duration = $duration
            Parameters = @{
                CompanyName = $CompanyName
                Mode = $Mode
                Force = $Force.IsPresent
                ValidateOnly = $ValidateOnly.IsPresent
            }
            Environment = @{
                PowerShellVersion = $PSVersionTable.PSVersion.ToString()
                ComputerName = $env:COMPUTERNAME
                UserName = $env:USERNAME
            }
            Errors = $script:ErrorCollector
        }
        
        $errorReport | ConvertTo-Json -Depth 10 | 
            Set-Content -Path $errorReportPath -Encoding UTF8
        Write-OrchestratorLog -Message "Error report saved: $errorReportPath" -Level "INFO"
    }
    
    # Determine exit code
    $exitCode = if ($criticalCount -gt 0) { 2 }
                elseif ($errorCount -gt 0) { 1 }
                else { 0 }
    
    Write-OrchestratorLog -Message "Orchestrator completed with exit code: $exitCode" -Level "INFO"
    
    exit $exitCode
    
} catch {
    # Fatal error handling
    Write-OrchestratorLog -Message "FATAL ERROR: $_" -Level "CRITICAL"
    Write-OrchestratorLog -Message "Exception Type: $($_.Exception.GetType().FullName)" -Level "ERROR"
    Write-OrchestratorLog -Message "Stack Trace:" -Level "ERROR"
    Write-OrchestratorLog -Message $_.ScriptStackTrace -Level "ERROR"
    
    # Save crash report
    $crashReport = @{
        Timestamp = Get-Date
        Error = $_.Exception.Message
        ExceptionType = $_.Exception.GetType().FullName
        StackTrace = $_.ScriptStackTrace
        ScriptLineNumber = $_.InvocationInfo.ScriptLineNumber
        OffendingLine = $_.InvocationInfo.Line
        ErrorCollector = $script:ErrorCollector
        Parameters = @{
            CompanyName = $CompanyName
            Mode = $Mode
            ConfigurationFile = $ConfigurationFile
        }
    }
    
    $crashPath = Join-Path $global:MandA.Paths.LogOutput "OrchestratorCrash_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    $crashReport | ConvertTo-Json -Depth 10 | 
        Set-Content -Path $crashPath -Encoding UTF8
    
    Write-OrchestratorLog -Message "Crash report saved: $crashPath" -Level "ERROR"
    
    exit 99
} finally {
    # Cleanup
    Write-OrchestratorLog -Message "Performing cleanup..." -Level "INFO"
    
    if (Get-Command Disconnect-AllServices -ErrorAction SilentlyContinue) {
        try {
            Write-OrchestratorLog -Message "Disconnecting services..." -Level "INFO"
            Disconnect-AllServices
        } catch {
            Write-OrchestratorLog -Message "Error during disconnect: $_" -Level "WARN"
        }
    }
    
    Write-OrchestratorLog -Message "Orchestrator cleanup complete" -Level "INFO"
}

# End of enhanced debug orchestrator
#===============================================================================