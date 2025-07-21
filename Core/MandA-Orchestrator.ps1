# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    M&A Discovery Suite - Core Orchestration Engine
.DESCRIPTION
    Session-based orchestrator that runs all discovery modules directly in the main PowerShell session for optimal 
    performance and reliability. This engine manages the complete discovery workflow including authentication, 
    module execution, data processing, and result aggregation with comprehensive error handling and logging 
    capabilities for large-scale M&A discovery operations.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, M&A Discovery Suite modules, Microsoft Graph modules, Azure modules
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
    [switch]$DebugMode,

    [Parameter(Mandatory=$false)]
    [switch]$Diagnostic # New parameter for diagnostic mode
)

#===============================================================================
#                       CRITICAL CLASS DEFINITIONS
#===============================================================================

#===============================================================================
#                       INITIALIZATION
#===============================================================================

Write-Host "[ORCHESTRATOR] Starting session-based orchestrator v4.0.0..." -ForegroundColor Cyan
Write-Host "[ORCHESTRATOR] PowerShell Version: $($PSVersionTable.PSVersion)" -ForegroundColor Gray
Write-Host "[ORCHESTRATOR] Parameters: CompanyName='$CompanyName', Mode='$Mode', Force=$Force" -ForegroundColor Gray

if (-not $global:MandA -or -not $global:MandA.Initialized) {
    Write-Host "[ORCHESTRATOR ERROR] Global MandA context not initialized!" -ForegroundColor Red
    throw "Global M&A context not initialized. Run through QuickStart.ps1"
}

Write-Host "[ORCHESTRATOR] Global context validated successfully" -ForegroundColor Green

# Set error handling
$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"

# Script variables
$script:StartTime = Get-Date
$script:DebugMode = $DebugMode -or $VerbosePreference -eq 'Continue'
$script:CorrelationId = [guid]::NewGuid().ToString()
$script:AuthenticationSessionId = $null

# Progress tracking
$script:ProgressData = @{
    TotalModules = 0
    CompletedModules = 0
    CurrentModule = ""
    PhaseStartTime = $script:StartTime
    EstimatedEndTime = $null
    OverallProgress = 0 # Percentage
}

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

function Update-OrchestratorProgress {
    param(
        [string]$CurrentModule = "",
        [int]$CompletedModules = 0,
        [int]$TotalModules = 0
    )
    
    $script:ProgressData.CurrentModule = $CurrentModule
    $script:ProgressData.CompletedModules = $CompletedModules
    $script:ProgressData.TotalModules = $TotalModules
    
    if ($TotalModules -gt 0) {
        $script:ProgressData.OverallProgress = [Math]::Round(($CompletedModules / $TotalModules) * 100, 0)
        
        $elapsed = (Get-Date) - $script:ProgressData.PhaseStartTime
        if ($CompletedModules -gt 0) {
            $timePerModule = $elapsed.TotalSeconds / $CompletedModules
            $remainingModules = $TotalModules - $CompletedModules
            $estimatedRemainingSeconds = $remainingModules * $timePerModule
            $script:ProgressData.EstimatedEndTime = (Get-Date).AddSeconds($estimatedRemainingSeconds)
        }
    }
    
    Write-Progress -Activity "M&A Discovery Orchestrator" `
                   -Status "Phase: Discovery | Module: $($script:ProgressData.CurrentModule)" `
                   -PercentComplete $script:ProgressData.OverallProgress `
                   -CurrentOperation "Completed $($script:ProgressData.CompletedModules) of $($script:ProgressData.TotalModules) modules"
    
    Write-OrchestratorLog -Message "Progress: $($script:ProgressData.OverallProgress)% - $($script:ProgressData.CurrentModule)" -Level "PROGRESS" -DebugOnly
}

function Write-ProgressSummaryFile {
    param(
        [string]$OutputPath,
        [hashtable]$PhaseResults
    )
    
    $summaryFilePath = Join-Path $OutputPath "OrchestratorProgressSummary.json"
    
    $summaryContent = @{
        OverallStatus = "Completed"
        StartTime = $script:StartTime
        EndTime = Get-Date
        TotalDurationSeconds = ((Get-Date) - $script:StartTime).TotalSeconds
        Phases = @{}
    }
    
    foreach ($phaseName in $PhaseResults.Keys) {
        $phaseResult = $PhaseResults[$phaseName]
        $summaryContent.Phases[$phaseName] = @{
            Success = $phaseResult.Success
            TotalModules = $phaseResult.ModuleResults.Count
            SuccessfulModules = ($phaseResult.ModuleResults.Values | Where-Object { $_.Success }).Count
            ModuleDetails = $phaseResult.ModuleResults
            CriticalErrors = $phaseResult.CriticalErrors
            RecoverableErrors = $phaseResult.RecoverableErrors
            Warnings = $phaseResult.Warnings
        }
    }
    
    $summaryContent | ConvertTo-Json -Depth 10 | Set-Content -Path $summaryFilePath -Encoding UTF8
    Write-OrchestratorLog -Message "Progress summary written to: $summaryFilePath" -Level "INFO"
}

function Invoke-DiagnosticMode {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$OutputPath
    )

    Write-OrchestratorLog -Message "========================================" -Level "HEADER"
    Write-OrchestratorLog -Message "STARTING DIAGNOSTIC MODE" -Level "HEADER"
    Write-OrchestratorLog -Message "========================================" -Level "HEADER"

    $diagnosticReport = [System.Text.StringBuilder]::new()
    $diagnosticReport.AppendLine("M&A Discovery Suite Diagnostic Report")
    $diagnosticReport.AppendLine("Generated: $(Get-Date)")
    $diagnosticReport.AppendLine("----------------------------------------")
    $diagnosticReport.AppendLine("")

    # 1. PowerShell Environment Check
    $diagnosticReport.AppendLine("1. PowerShell Environment:")
    $diagnosticReport.AppendLine("   PowerShell Version: $($PSVersionTable.PSVersion)")
    $diagnosticReport.AppendLine("   PS Edition: $($PSVersionTable.PSEdition)")
    $diagnosticReport.AppendLine("   OS: $([System.Environment]::OSVersion.VersionString)")
    $diagnosticReport.AppendLine("   Current User: $([System.Security.Principal.WindowsIdentity]::GetCurrent().Name)")
    $diagnosticReport.AppendLine("")

    # 2. Suite Structure Check
    $diagnosticReport.AppendLine("2. Suite Structure Check:")
    $requiredDirs = @("Core", "Modules", "Scripts", "Configuration", "Documentation")
    foreach ($dir in $requiredDirs) {
        $path = Join-Path $Context.Paths.SuiteRoot $dir
        $status = if (Test-Path $path -PathType Container) { "Found" } else { "Missing" }
        $diagnosticReport.AppendLine("   - ${dir}: $status ($path)")
    }
    $diagnosticReport.AppendLine("")

    # 3. Configuration File Check
    $diagnosticReport.AppendLine("3. Configuration File Check:")
    $configFilePath = $Context.Paths.ConfigFile
    $status = if (Test-Path $configFilePath -PathType Leaf) { "Found" } else { "Missing" }
    $diagnosticReport.AppendLine("   - default-config.json: $status ($configFilePath)")
    if ($status -eq "Found") {
        try {
            $configContent = Get-Content $configFilePath -Raw | ConvertFrom-Json -ErrorAction Stop
            $diagnosticReport.AppendLine("     - Parsed Successfully: True")
            $diagnosticReport.AppendLine("     - Company Name: $($configContent.metadata.companyName)")
            $diagnosticReport.AppendLine("     - Discovery Sources: $($configContent.discovery.enabledSources -join ', ')")
        } catch {
            $diagnosticReport.AppendLine("     - Parsed Successfully: False (Error: $($_.Exception.Message))")
        }
    }
    $diagnosticReport.AppendLine("")

    # 4. Module Loading Check
    $diagnosticReport.AppendLine("4. Core Module Loading Check:")
    $coreModules = @(
        "Modules\Core\ClassDefinitions.psm1",
        "Modules\Authentication\AuthSession.psm1",
        "Modules\Authentication\SessionManager.psm1",
        "Modules\Authentication\CredentialManagement.psm1",
        "Modules\Authentication\AuthenticationService.psm1",
        "Modules\Discovery\DiscoveryBase.psm1",
        "Modules\Utilities\EnhancedLogging.psm1",
        "Modules\Utilities\ErrorHandling.psm1"
    )
    foreach ($moduleRelativePath in $coreModules) {
        $modulePath = Join-Path $Context.Paths.SuiteRoot $moduleRelativePath
        $status = if (Test-Path $modulePath -PathType Leaf) { "Found" } else { "Missing" }
        $diagnosticReport.AppendLine("   - ${moduleRelativePath}: $status")
        if ($status -eq "Found") {
            try {
                Import-Module $modulePath -Force -ErrorAction Stop
                $diagnosticReport.AppendLine("     - Importable: True")
            } catch {
                $diagnosticReport.AppendLine("     - Importable: False (Error: $($_.Exception.Message))")
            }
        }
    }
    $diagnosticReport.AppendLine("")

    # 5. Authentication Service Test (Basic)
    $diagnosticReport.AppendLine("5. Authentication Service Test:")
    if (Get-Command Test-AuthenticationService -ErrorAction SilentlyContinue) {
        try {
            $authTestResult = Test-AuthenticationService
            $diagnosticReport.AppendLine("   - Service Test Success: $($authTestResult.Success)")
            if (-not $authTestResult.Success) {
                $diagnosticReport.AppendLine("     - Error: $($authTestResult.Error)")
            }
            $diagnosticReport.AppendLine("   - Session Valid: $($authTestResult.SessionValid)")
            $authTestResult.Services.GetEnumerator() | ForEach-Object {
                $diagnosticReport.AppendLine("   - $($_.Name) Connection: $($_.Value.Connected)")
                if (-not $_.Value.Connected) {
                    $diagnosticReport.AppendLine("     - Error: $($_.Value.Error)")
                }
            }
        } catch {
            $diagnosticReport.AppendLine("   - Test-AuthenticationService Failed: $($_.Exception.Message)")
        }
    } else {
        $diagnosticReport.AppendLine("   - Test-AuthenticationService not found. Cannot perform authentication test.")
    }
    $diagnosticReport.AppendLine("")

    # 6. Output Paths Check
    $diagnosticReport.AppendLine("6. Output Paths Check:")
    $outputPaths = @(
        $Context.Paths.CompanyProfileRoot,
        $Context.Paths.LogOutput,
        $Context.Paths.RawDataOutput,
        $Context.Paths.ProcessedDataOutput,
        $Context.Paths.ExportOutput,
        $Context.Paths.TempPath
    )
    foreach ($path in $outputPaths) {
        $status = if (Test-Path $path -PathType Container) { "Exists" } else { "Missing" }
        $diagnosticReport.AppendLine("   - ${path}: $status")
        if ($status -eq "Missing") {
            try {
                New-Item -Path $path -ItemType Directory -Force -ErrorAction Stop | Out-Null
                $diagnosticReport.AppendLine("     - Attempted Creation: Success")
            } catch {
                $diagnosticReport.AppendLine("     - Attempted Creation: Failed (Error: $($_.Exception.Message))")
            }
        }
    }
    $diagnosticReport.AppendLine("")

    $reportFilePath = Join-Path $OutputPath "MandADiscovery_DiagnosticReport_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
    $diagnosticReport.ToString() | Set-Content -Path $reportFilePath -Encoding UTF8

    Write-OrchestratorLog -Message "Diagnostic report generated at: $reportFilePath" -Level "SUCCESS"
    Write-OrchestratorLog -Message "========================================" -Level "HEADER"
}

function Initialize-SessionBasedModules {
    param([string]$Phase)
    
    Write-OrchestratorLog -Message "Loading session-based modules for phase: $Phase" -Level "INFO"
    
    # Load new authentication system
    $authModules = @(
        "AuthSession.psm1",
        "SessionManager.psm1", 
        "CredentialManagement.psm1",
        "AuthenticationService.psm1"
    )
    
    $loadedCount = 0
    foreach ($module in $authModules) {
        $modulePath = Join-Path $global:MandA.Paths.Authentication $module
        
        if (Test-Path $modulePath) {
            try {
                Import-Module $modulePath -Force -Global -ErrorAction Stop
                $loadedCount++
                Write-OrchestratorLog -Message "Loaded auth module: $module" -Level "SUCCESS"
            } catch {
                Write-OrchestratorLog -Message "Failed to load auth module $module : $($_.Exception.Message)" -Level "ERROR"
                throw
            }
        } else {
            Write-OrchestratorLog -Message "Auth module not found: $modulePath" -Level "ERROR"
            throw "Critical authentication module missing: $module"
        }
    }
    
    # Load utility modules
    $utilityModules = @(
        "EnhancedLogging.psm1",
        "ErrorHandling.psm1",
        "ProgressDisplay.psm1"
    )
    
    foreach ($module in $utilityModules) {
        $modulePath = Join-Path $global:MandA.Paths.Utilities $module
        
        if (Test-Path $modulePath) {
            try {
                Import-Module $modulePath -Force -Global -ErrorAction Stop
                $loadedCount++
                Write-OrchestratorLog -Message "Loaded utility module: $module" -Level "SUCCESS"
            } catch {
                Write-OrchestratorLog -Message "Failed to load utility module $module : $($_.Exception.Message)" -Level "WARN"
            }
        }
    }
    
    Write-OrchestratorLog -Message "Authentication system loaded: $loadedCount/$($authModules.Count) modules" -Level "INFO"
}

#===============================================================================
#                       SESSION-BASED DISCOVERY PHASE (NO RUNSPACES!)
#===============================================================================

function Invoke-SessionBasedDiscoveryPhase {
    [CmdletBinding()]
    param()

    Write-OrchestratorLog -Message "STARTING SESSION-BASED DISCOVERY PHASE (v4.0 - NO RUNSPACES)" -Level "HEADER"
    $phaseStartTime = Get-Date
    $script:ProgressData.PhaseStartTime = $phaseStartTime # Reset phase start time for accurate ETA

    $phaseResult = @{
        Success = $true
        ModuleResults = @{}
        CriticalErrors = [System.Collections.ArrayList]::new()
        RecoverableErrors = [System.Collections.ArrayList]::new()
        Warnings = [System.Collections.ArrayList]::new()
    }
    
    try {
        # STEP 1: Initialize Authentication Service
        Write-OrchestratorLog -Message "Initializing authentication service..." -Level "INFO"
        
        $authResult = Initialize-AuthenticationService -Configuration $global:MandA.Config
        if (-not $authResult.Success) {
            throw "Authentication service initialization failed: $($authResult.Error)"
        }
        
        $script:AuthenticationSessionId = $authResult.SessionId
        Write-OrchestratorLog -Message "Authentication session created: $($script:AuthenticationSessionId)" -Level "SUCCESS"
        
        # STEP 2: Determine modules to run
        $enabledSources = $global:MandA.Config.discovery.enabledSources
        $sourcesToRun = @($enabledSources | Where-Object {
            if ($Force) { return $true }
            
            # Simple completion check (can be enhanced later)
            Write-OrchestratorLog -Message "Queuing module [$_] for execution" -Level "INFO"
            return $true
        })
        
        if ($sourcesToRun.Count -eq 0) {
            Write-OrchestratorLog -Message "No modules to run" -Level "SUCCESS"
            return $phaseResult
        }

        Write-OrchestratorLog -Message "Running $($sourcesToRun.Count) discovery modules directly in main session" -Level "INFO"
        Update-OrchestratorProgress -TotalModules $sourcesToRun.Count -CompletedModules 0

        # STEP 3: Execute each module directly in the main session (NO RUNSPACES!)
        $completedModulesCount = 0
        foreach ($moduleName in $sourcesToRun) {
            Write-OrchestratorLog -Message "Executing module: $moduleName" -Level "INFO"
            $moduleStartTime = Get-Date
            
            try {
                # Load the discovery module
                $discoveryModulePath = Join-Path $global:MandA.Paths.Discovery "${moduleName}Discovery.psm1"
                
                if (-not (Test-Path $discoveryModulePath)) {
                    throw "Discovery module file not found: $discoveryModulePath"
                }
                
                # Import module into main session
                Import-Module -Name $discoveryModulePath -Force -Global
                Write-OrchestratorLog -Message "Loaded module: $discoveryModulePath" -Level "DEBUG"
                
                # Check for the discovery function
                $functionName = "Invoke-${moduleName}Discovery"
                if (-not (Get-Command $functionName -ErrorAction SilentlyContinue)) {
                    throw "Discovery function '$functionName' not found after importing module."
                }
                
                # Execute discovery with session-based parameters
                $discoveryStopwatch = [System.Diagnostics.Stopwatch]::StartNew()
                
                $params = @{
                    Configuration = $global:MandA.Config
                    Context = $global:MandA
                    SessionId = $script:AuthenticationSessionId  # SIMPLE! Just pass the session ID!
                }

                Write-OrchestratorLog -Message "Calling $functionName with SessionId: $($script:AuthenticationSessionId)" -Level "DEBUG"
                $moduleOutput = & $functionName @params
                
                $discoveryStopwatch.Stop()
                
                # Handle result
                if ($moduleOutput -is [DiscoveryResult]) {
                    $discoveryResult = $moduleOutput
                } else {
                    $discoveryResult = [DiscoveryResult]::new($moduleName)
                    $discoveryResult.AddWarning("Module did not return a compliant DiscoveryResult object.")
                    $discoveryResult.Data = $moduleOutput
                    $discoveryResult.Success = $true
                }
                
                # Add performance tracking
                $discoveryResult.Metadata["PerformanceMs"] = $discoveryStopwatch.ElapsedMilliseconds
                $discoveryResult.Metadata["PerformanceSeconds"] = [Math]::Round($discoveryStopwatch.Elapsed.TotalSeconds, 2)
                $discoveryResult.Complete()
                
                # Store result
                $phaseResult.ModuleResults[$moduleName] = $discoveryResult
                
                $duration = (Get-Date) - $moduleStartTime
                if ($discoveryResult.Success) {
                    Write-OrchestratorLog -Message "Module $moduleName completed successfully in $([Math]::Round($duration.TotalSeconds, 1))s. Records: $($discoveryResult.RecordCount)" -Level "SUCCESS"
                } else {
                    Write-OrchestratorLog -Message "Module $moduleName completed with errors in $([Math]::Round($duration.TotalSeconds, 1))s" -Level "WARN"
                }

            } catch {
                Write-OrchestratorLog -Message "Module $moduleName failed: $($_.Exception.Message)" -Level "ERROR"
                
                # Create error result
                $errorResult = [DiscoveryResult]::new($moduleName)
                $errorResult.AddError("Module execution failed: $($_.Exception.Message)", $_.Exception, @{ Module = $moduleName })
                $errorResult.Complete()
                
                $phaseResult.ModuleResults[$moduleName] = $errorResult
                
                $null = $phaseResult.RecoverableErrors.Add([PSCustomObject]@{
                    Module = $moduleName
                    Error = $_.Exception.Message
                    Type = $_.Exception.GetType().FullName
                    Timestamp = Get-Date
                    Duration = (Get-Date) - $moduleStartTime
                })
            }
            $completedModulesCount++
            Update-OrchestratorProgress -CurrentModule $moduleName -CompletedModules $completedModulesCount -TotalModules $sourcesToRun.Count
        }
        
        # Summary
        $totalModules = $phaseResult.ModuleResults.Count
        $successfulModules = ($phaseResult.ModuleResults.Values | Where-Object { $_.Success }).Count
        
        Write-OrchestratorLog -Message "Session-based discovery complete: $successfulModules/$totalModules successful" -Level "INFO"
        
    } catch {
        Write-OrchestratorLog -Message "CRITICAL ERROR in discovery phase: $($_.Exception.Message)" -Level "CRITICAL"
        $null = $phaseResult.CriticalErrors.Add($_)
        $phaseResult.Success = $false
    }
    
    return $phaseResult
}

#===============================================================================
#                       MAIN EXECUTION
#===============================================================================

try {
    Write-OrchestratorLog -Message "========================================" -Level "HEADER"
    Write-OrchestratorLog -Message "M&A Discovery Suite Orchestrator v4.0.0" -Level "HEADER"
    Write-OrchestratorLog -Message "SESSION-BASED (NO RUNSPACES)" -Level "HEADER"
    Write-OrchestratorLog -Message "========================================" -Level "HEADER"
    Write-OrchestratorLog -Message "Company: $CompanyName | Mode: $Mode" -Level "INFO"
    Write-OrchestratorLog -Message "Correlation ID: $script:CorrelationId" -Level "INFO"
    
    # Initialize session-based modules
    Initialize-SessionBasedModules -Phase $Mode
    
    # Handle diagnostic mode
    if ($Diagnostic) {
        Invoke-DiagnosticMode -Context $global:MandA -OutputPath $global:MandA.Paths.LogOutput
        exit 0 # Exit after diagnostic report
    }

    # Handle configuration
    if ($Force) {
        Write-OrchestratorLog -Message "Force mode enabled" -Level "INFO"
        $global:MandA.Config.discovery.forceMode = $true
    }
    
    # Validation mode
    if ($ValidateOnly) {
        Write-OrchestratorLog -Message "VALIDATION-ONLY MODE" -Level "INFO"
        
        # Test authentication service
        if (Get-Command Test-AuthenticationService -ErrorAction SilentlyContinue) {
            $authTest = Test-AuthenticationService
            if ($authTest.Success) {
                Write-OrchestratorLog -Message "Authentication service validation passed" -Level "SUCCESS"
                exit 0
            } else {
                Write-OrchestratorLog -Message "Authentication service validation failed: $($authTest.Error)" -Level "ERROR"
                exit 1
            }
        } else {
            Write-OrchestratorLog -Message "Test-AuthenticationService function not available" -Level "WARN"
            exit 0
        }
    }
    
    # Execute phases
    $phaseResults = @{}
    
    switch ($Mode) {
        "Discovery" { 
            $phaseResults.Discovery = Invoke-SessionBasedDiscoveryPhase 
        }
        "Full" {
            $phaseResults.Discovery = Invoke-SessionBasedDiscoveryPhase
            # Processing and Export phases would be added here
        }
        default {
            $phaseResults.Discovery = Invoke-SessionBasedDiscoveryPhase
        }
    }
    
    # Final summary
    Write-OrchestratorLog -Message "========================================" -Level "HEADER"
    Write-OrchestratorLog -Message "EXECUTION SUMMARY" -Level "HEADER"
    Write-OrchestratorLog -Message "========================================" -Level "HEADER"
    
    $duration = (Get-Date) - $script:StartTime
    Write-OrchestratorLog -Message "Total execution time: $($duration.ToString('hh\:mm\:ss'))" -Level "INFO"
    
    foreach ($phase in $phaseResults.Keys) {
        $result = $phaseResults[$phase]
        $status = if ($result.Success) { "SUCCESS" } else { "FAILED" }
        Write-OrchestratorLog -Message "$phase Phase: $status" -Level $(if ($result.Success) { "SUCCESS" } else { "ERROR" })
        
        # Show module results
        foreach ($moduleName in $result.ModuleResults.Keys) {
            $moduleResult = $result.ModuleResults[$moduleName]
            $moduleStatus = if ($moduleResult.Success) { "SUCCESS" } else { "FAILED" }
            $recordCount = if ($moduleResult.RecordCount) { $moduleResult.RecordCount } else { 0 }
            Write-OrchestratorLog -Message "  ${moduleName}: $moduleStatus ($recordCount records)" -Level $(if ($moduleResult.Success) { "SUCCESS" } else { "ERROR" })
        }
    }
    
    # Write progress summary file
    Write-ProgressSummaryFile -OutputPath $global:MandA.Paths.LogOutput -PhaseResults $phaseResults

    # Determine exit code
    $criticalCount = ($phaseResults.Values | ForEach-Object { $_.CriticalErrors.Count } | Measure-Object -Sum).Sum
    $errorCount = ($phaseResults.Values | ForEach-Object { $_.RecoverableErrors.Count } | Measure-Object -Sum).Sum
    
    $exitCode = if ($criticalCount -gt 0) { 2 }
                elseif ($errorCount -gt 0) { 1 }
                else { 0 }
    
    Write-OrchestratorLog -Message "Session-based orchestrator completed. Exit code: $exitCode" -Level "INFO"
    exit $exitCode
    
} catch {
    Write-OrchestratorLog -Message "FATAL ERROR: $_" -Level "CRITICAL"
    Write-OrchestratorLog -Message "Stack Trace: $($_.ScriptStackTrace)" -Level "ERROR"
    exit 99
    
} finally {
    Write-OrchestratorLog -Message "Performing cleanup..." -Level "INFO"
    
    # Stop authentication service (handles all disconnections automatically!)
    if (Get-Command Stop-AuthenticationService -ErrorAction SilentlyContinue) {
        try {
            Stop-AuthenticationService
            Write-OrchestratorLog -Message "Authentication service stopped successfully" -Level "SUCCESS"
        } catch {
            Write-OrchestratorLog -Message "Error stopping authentication service: $_" -Level "WARN"
        }
    }
    
    Write-OrchestratorLog -Message "Session-based orchestrator cleanup complete" -Level "INFO"
}