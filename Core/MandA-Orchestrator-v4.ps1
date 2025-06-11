# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    M&A Discovery Suite - Session-Based Core Orchestration Engine v4.0.0
.DESCRIPTION
    New session-based orchestrator that eliminates runspaces entirely.
    Runs all discovery modules directly in the main PowerShell session.
.NOTES
    Version: 4.0.0
    Created: 2025-06-11
    Architecture: Direct session execution with session-based authentication
    
    Key Improvements:
    - NO RUNSPACES - All modules run in main session
    - Session-based authentication with simple SessionId passing
    - Direct function calls to discovery modules
    - Simplified error handling and logging
    - Automatic connection management and cleanup
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
    [switch]$DebugMode
)

#===============================================================================
#                       CRITICAL CLASS DEFINITIONS
#===============================================================================

# Define DiscoveryResult class in global scope immediately
if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
    Add-Type -TypeDefinition @'
public class DiscoveryResult {
    public bool Success { get; set; }
    public string ModuleName { get; set; }
    public object Data { get; set; }
    public System.Collections.ArrayList Errors { get; set; }
    public System.Collections.ArrayList Warnings { get; set; }
    public System.Collections.Hashtable Metadata { get; set; }
    public System.DateTime StartTime { get; set; }
    public System.DateTime EndTime { get; set; }
    public string ExecutionId { get; set; }
    public int RecordCount { get; set; }
    
    public DiscoveryResult(string moduleName) {
        this.ModuleName = moduleName;
        this.Errors = new System.Collections.ArrayList();
        this.Warnings = new System.Collections.ArrayList();
        this.Metadata = new System.Collections.Hashtable();
        this.StartTime = System.DateTime.Now;
        this.ExecutionId = System.Guid.NewGuid().ToString();
        this.Success = true;
        this.RecordCount = 0;
    }
    
    public void AddError(string message, System.Exception exception) {
        AddError(message, exception, new System.Collections.Hashtable());
    }
    
    public void AddError(string message, System.Exception exception, System.Collections.Hashtable context) {
        var errorEntry = new System.Collections.Hashtable();
        errorEntry["Timestamp"] = System.DateTime.Now;
        errorEntry["Message"] = message;
        
        if (exception != null) {
            errorEntry["Exception"] = exception.ToString();
            errorEntry["ExceptionType"] = exception.GetType().FullName;
            errorEntry["StackTrace"] = exception.StackTrace;
        } else {
            errorEntry["Exception"] = null;
            errorEntry["ExceptionType"] = null;
            errorEntry["StackTrace"] = System.Environment.StackTrace;
        }
        
        errorEntry["Context"] = context ?? new System.Collections.Hashtable();
        this.Errors.Add(errorEntry);
        this.Success = false;
    }
    
    public void AddWarning(string message) {
        AddWarning(message, new System.Collections.Hashtable());
    }
    
    public void AddWarning(string message, System.Collections.Hashtable context) {
        var warningEntry = new System.Collections.Hashtable();
        warningEntry["Timestamp"] = System.DateTime.Now;
        warningEntry["Message"] = message;
        warningEntry["Context"] = context;
        this.Warnings.Add(warningEntry);
    }
    
    public void Complete() {
        this.EndTime = System.DateTime.Now;
        if (this.StartTime != null && this.EndTime != null) {
            var duration = this.EndTime - this.StartTime;
            this.Metadata["Duration"] = duration;
            this.Metadata["DurationSeconds"] = duration.TotalSeconds;
        }
    }
}
'@ -Language CSharp
    Write-Host "[ORCHESTRATOR] DiscoveryResult class defined globally" -ForegroundColor Green
}

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

        # STEP 3: Execute each module directly in the main session (NO RUNSPACES!)
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
            Write-OrchestratorLog -Message "  $moduleName: $moduleStatus ($recordCount records)" -Level $(if ($moduleResult.Success) { "SUCCESS" } else { "ERROR" })
        }
    }
    
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