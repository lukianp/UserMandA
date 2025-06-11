# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    M&A Discovery Suite - Simplified Core Orchestration Engine v3.0.0
.DESCRIPTION
    Simplified orchestrator using new thread-safe session-based authentication.
    Eliminates complex authentication context passing and runspace setup.
.NOTES
    Version: 3.0.0
    Created: 2025-06-11
    Architecture: New thread-safe session-based authentication
    
    Key Improvements:
    - Session-based authentication eliminates context passing complexity
    - Thread-safe by design with concurrent collections
    - Simplified runspace setup (no authentication injection needed)
    - Clean separation of authentication and business logic
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
    [int]$ParallelThrottle = 5,
    
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
    
    public DiscoveryResult(string moduleName) {
        this.ModuleName = moduleName;
        this.Errors = new System.Collections.ArrayList();
        this.Warnings = new System.Collections.ArrayList();
        this.Metadata = new System.Collections.Hashtable();
        this.StartTime = System.DateTime.Now;
        this.ExecutionId = System.Guid.NewGuid().ToString();
        this.Success = true;
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

Write-Host "[ORCHESTRATOR] Starting simplified orchestrator v3.0.0..." -ForegroundColor Cyan
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

# Performance tracking
$script:PerformanceMetrics = @{
    PhaseTimings = @{}
    ModuleTimings = @{}
    MemorySnapshots = [System.Collections.ArrayList]::new()
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

function Get-MemorySnapshot {
    $process = Get-Process -Id $PID
    return @{
        Timestamp = Get-Date
        WorkingSetMB = [Math]::Round($process.WorkingSet64 / 1MB, 2)
        PrivateMemoryMB = [Math]::Round($process.PrivateMemorySize64 / 1MB, 2)
        VirtualMemoryMB = [Math]::Round($process.VirtualMemorySize64 / 1MB, 2)
        HandleCount = $process.HandleCount
        ThreadCount = $process.Threads.Count
    }
}

function Initialize-SimplifiedModules {
    param([string]$Phase)
    
    Write-OrchestratorLog -Message "Loading simplified modules for phase: $Phase" -Level "INFO"
    
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
#                       SIMPLIFIED DISCOVERY PHASE
#===============================================================================

function Invoke-SimplifiedDiscoveryPhase {
    [CmdletBinding()]
    param()

    Write-OrchestratorLog -Message "STARTING SIMPLIFIED DISCOVERY PHASE (v3.0)" -Level "HEADER"
    $phaseStartTime = Get-Date
    
    # Take initial memory snapshot
    $null = $script:PerformanceMetrics.MemorySnapshots.Add((Get-MemorySnapshot))
    
    $phaseResult = @{
        Success = $true
        ModuleResults = @{}
        CriticalErrors = [System.Collections.ArrayList]::new()
        RecoverableErrors = [System.Collections.ArrayList]::new()
        Warnings = [System.Collections.ArrayList]::new()
    }
    
    try {
        # STEP 1: Initialize Authentication Service (MUCH SIMPLER!)
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

        # STEP 3: Setup SIMPLIFIED runspace pool (no complex authentication injection!)
        $maxConcurrentJobs = [Math]::Min($global:MandA.Config.discovery.maxConcurrentJobs, 4)
        Write-OrchestratorLog -Message "Creating simplified runspace pool ($maxConcurrentJobs concurrent)" -Level "INFO"
        
        # Create session state - MUCH SIMPLER!
        $sessionState = [System.Management.Automation.Runspaces.InitialSessionState]::CreateDefault()
        
        # Add DiscoveryResult type
        $sessionState.Types.Add([System.Management.Automation.Runspaces.SessionStateTypeEntry]::new([DiscoveryResult]))
        
        # Pre-load authentication modules into runspaces
        $authModulesToLoad = @(
            (Join-Path $global:MandA.Paths.Authentication "AuthSession.psm1"),
            (Join-Path $global:MandA.Paths.Authentication "SessionManager.psm1"),
            (Join-Path $global:MandA.Paths.Authentication "AuthenticationService.psm1")
        )
        
        foreach ($moduleFile in $authModulesToLoad) {
            if (Test-Path $moduleFile) {
                $sessionState.ImportPSModule($moduleFile)
                Write-OrchestratorLog -Message "Added auth module to runspace session state" -Level "DEBUG"
            }
        }
        
        # Add global context to session state
        $contextVariable = New-Object System.Management.Automation.Runspaces.SessionStateVariableEntry(
            'MandAContext', $global:MandA, 'Global M&A Context'
        )
        $sessionState.Variables.Add($contextVariable)
        
        # Create thread-safe collections
        $ResultsCollection = [System.Collections.Concurrent.ConcurrentBag[DiscoveryResult]]::new()
        $ErrorCollection = [System.Collections.Concurrent.ConcurrentBag[PSObject]]::new()
        
        $ResultsVariable = New-Object System.Management.Automation.Runspaces.SessionStateVariableEntry(
            'ResultsCollection', $ResultsCollection, 'Thread-safe results'
        )
        $ErrorVariable = New-Object System.Management.Automation.Runspaces.SessionStateVariableEntry(
            'ErrorCollection', $ErrorCollection, 'Thread-safe errors'
        )
        $sessionState.Variables.Add($ResultsVariable)
        $sessionState.Variables.Add($ErrorVariable)
        
        # Create runspace pool
        $pool = [runspacefactory]::CreateRunspacePool(1, $maxConcurrentJobs, $sessionState, $Host)
        $pool.ApartmentState = 'MTA'
        $pool.ThreadOptions = 'ReuseThread'
        $pool.Open()
        
        Write-OrchestratorLog -Message "Simplified runspace pool created successfully" -Level "SUCCESS"

        # STEP 4: Create jobs with SIMPLIFIED script block (no authentication complexity!)
        $jobs = [System.Collections.ArrayList]::new()
        
        foreach ($moduleName in $sourcesToRun) {
            Write-OrchestratorLog -Message "Creating simplified job for module: $moduleName" -Level "DEBUG"
            $powershell = [powershell]::Create()
            $powershell.RunspacePool = $pool
            
            # SIMPLIFIED SCRIPT BLOCK - No authentication context reconstruction!
            $scriptBlock = {
                param($modName, $businessConfig, $globalContext, $sessionId, $resultsCollection, $errorCollection)
                
                $jobStartTime = Get-Date
                $discoveryResult = [DiscoveryResult]::new($modName)
                
                try {
                    # Set up context for this thread
                    $global:MandA = $globalContext
                    
                    # Load the discovery module
                    $discoveryModulePath = Join-Path $global:MandA.Paths.Discovery "${modName}Discovery.psm1"
                    
                    if (-not (Test-Path $discoveryModulePath)) {
                        throw "Discovery module file not found: $discoveryModulePath"
                    }
                    
                    Import-Module -Name $discoveryModulePath -Force -Global
                    
                    # Check for the discovery function
                    $functionName = "Invoke-${modName}Discovery"
                    if (-not (Get-Command $functionName -ErrorAction SilentlyContinue)) {
                        throw "Discovery function '$functionName' not found after importing module."
                    }
                    
                    # Execute discovery with SIMPLIFIED parameters (session ID instead of complex auth context!)
                    $discoveryStopwatch = [System.Diagnostics.Stopwatch]::StartNew()
                    
                    $params = @{
                        Configuration = $businessConfig
                        Context = $globalContext
                        SessionId = $sessionId  # SIMPLE! Just pass the session ID!
                    }

                    $moduleOutput = & $functionName @params
                    
                    $discoveryStopwatch.Stop()
                    
                    # Handle result
                    if ($moduleOutput -is [DiscoveryResult]) {
                        $discoveryResult = $moduleOutput
                    } else {
                        $discoveryResult.AddWarning("Module did not return a compliant DiscoveryResult object.")
                        $discoveryResult.Data = $moduleOutput
                        $discoveryResult.Success = $true
                    }
                    
                    # Add performance tracking
                    $discoveryResult.Metadata["PerformanceMs"] = $discoveryStopwatch.ElapsedMilliseconds
                    $discoveryResult.Metadata["PerformanceSeconds"] = [Math]::Round($discoveryStopwatch.Elapsed.TotalSeconds, 2)

                } catch {
                    $discoveryResult.Success = $false
                    $discoveryResult.AddError("Runspace execution failed: $($_.Exception.Message)", $_.Exception, @{ Module = $modName })
                    
                    $errorCollection.Add([PSCustomObject]@{
                        Module = $modName
                        Error = $_.Exception.Message
                        Type = $_.Exception.GetType().FullName
                        Timestamp = Get-Date
                        Duration = (Get-Date) - $jobStartTime
                    })
                } finally {
                    $discoveryResult.Complete()
                    $resultsCollection.Add($discoveryResult)
                }
                
                # Return job status
                return @{
                    Success = $discoveryResult.Success
                    ModuleName = $modName
                    Duration = (Get-Date) - $jobStartTime
                    RecordCount = if ($discoveryResult.Metadata -and $discoveryResult.Metadata['RecordCount']) {
                        $discoveryResult.Metadata['RecordCount']
                    } else { 0 }
                    Error = if (-not $discoveryResult.Success -and $discoveryResult.Errors.Count -gt 0) {
                        $discoveryResult.Errors[0].Message
                    } else { $null }
                }
            }
            
            $null = $powershell.AddScript($scriptBlock)
            $null = $powershell.AddArgument($moduleName)
            $null = $powershell.AddArgument($global:MandA.Config)  # Clean business config (no auth pollution!)
            $null = $powershell.AddArgument($global:MandA)
            $null = $powershell.AddArgument($script:AuthenticationSessionId)  # SIMPLE! Just the session ID!
            $null = $powershell.AddArgument($ResultsCollection)
            $null = $powershell.AddArgument($ErrorCollection)
            
            $job = @{
                ModuleName = $moduleName
                PowerShell = $powershell
                Handle = $powershell.BeginInvoke()
                StartTime = Get-Date
                Completed = $false
            }
            
            $null = $jobs.Add($job)
        }

        # STEP 5: Monitor jobs (same as before but simpler logging)
        Write-OrchestratorLog -Message "Monitoring $($jobs.Count) simplified discovery jobs..." -Level "INFO"
        
        while ($jobs | Where-Object { -not $_.Completed }) {
            foreach ($job in ($jobs | Where-Object { -not $_.Completed })) {
                if ($job.Handle.IsCompleted) {
                    try {
                        $jobResult = $job.PowerShell.EndInvoke($job.Handle)
                        $job.Completed = $true
                        
                        # Record timing
                        $script:PerformanceMetrics.ModuleTimings[$job.ModuleName] = @{
                            StartTime = $job.StartTime
                            EndTime = Get-Date
                            Duration = (Get-Date) - $job.StartTime
                            Success = $jobResult.Success
                        }
                        
                        if ($jobResult -and $jobResult.Success) {
                            Write-OrchestratorLog -Message "Module $($job.ModuleName) completed in $([Math]::Round($jobResult.Duration.TotalSeconds, 1))s" -Level "SUCCESS"
                        } else {
                            $errorMessage = if ($jobResult -and $jobResult.Error) { $jobResult.Error } else { "Unknown error" }
                            Write-OrchestratorLog -Message "Module $($job.ModuleName) failed: $errorMessage" -Level "ERROR"
                            
                            $null = $phaseResult.RecoverableErrors.Add([PSCustomObject]@{
                                Module = $job.ModuleName
                                Error = $errorMessage
                                Timestamp = Get-Date
                            })
                        }
                        
                    } catch {
                        $job.Completed = $true
                        Write-OrchestratorLog -Message "Error collecting results from $($job.ModuleName): $_" -Level "ERROR"
                    } finally {
                        # Clean up
                        try {
                            $job.PowerShell.Streams.ClearStreams()
                            $job.PowerShell.Dispose()
                            $job.PowerShell = $null
                            $job.Handle = $null
                        } catch {}
                    }
                }
            }
            
            Start-Sleep -Milliseconds 500
        }

        # STEP 6: Cleanup
        Write-OrchestratorLog -Message "All jobs completed. Cleaning up..." -Level "INFO"
        
        foreach ($job in $jobs) {
            if ($job.PowerShell) {
                try {
                    if (-not $job.Handle.IsCompleted) {
                        $job.PowerShell.Stop()
                    }
                    $job.PowerShell.Dispose()
                } catch {}
            }
        }
        
        try {
            $pool.Close()
            $pool.Dispose()
            Write-OrchestratorLog -Message "Runspace pool disposed" -Level "SUCCESS"
        } catch {
            Write-OrchestratorLog -Message "Error disposing pool: $_" -Level "WARN"
        }
        
        # Process results
        $allResults = $ResultsCollection.ToArray()
        foreach ($result in $allResults) {
            $phaseResult.ModuleResults[$result.ModuleName] = $result
        }
        
        # Process errors
        $allErrors = $ErrorCollection.ToArray()
        foreach ($errObj in $allErrors) {
            $null = $phaseResult.RecoverableErrors.Add($errObj)
        }
        
        # Phase timing
        $script:PerformanceMetrics.PhaseTimings['Discovery'] = @{
            StartTime = $phaseStartTime
            EndTime = Get-Date
            Duration = (Get-Date) - $phaseStartTime
        }
        
        # Summary
        $totalModules = $allResults.Count
        $successfulModules = ($allResults | Where-Object { $_.Success }).Count
        
        Write-OrchestratorLog -Message "Simplified discovery complete: $successfulModules/$totalModules successful" -Level "INFO"
        
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
    Write-OrchestratorLog -Message "M&A Discovery Suite Orchestrator v3.0.0" -Level "HEADER"
    Write-OrchestratorLog -Message "========================================" -Level "HEADER"
    Write-OrchestratorLog -Message "Company: $CompanyName | Mode: $Mode" -Level "INFO"
    Write-OrchestratorLog -Message "Correlation ID: $script:CorrelationId" -Level "INFO"
    
    # Initialize simplified modules
    Initialize-SimplifiedModules -Phase $Mode
    
    # Handle configuration
    if ($Force) {
        Write-OrchestratorLog -Message "Force mode enabled" -Level "INFO"
        $global:MandA.Config.discovery.forceMode = $true
    }
    
    # Validation mode
    if ($ValidateOnly) {
        Write-OrchestratorLog -Message "VALIDATION-ONLY MODE" -Level "INFO"
        
        # Test authentication service
        $authTest = Test-AuthenticationService
        if ($authTest.Success) {
            Write-OrchestratorLog -Message "Authentication service validation passed" -Level "SUCCESS"
            exit 0
        } else {
            Write-OrchestratorLog -Message "Authentication service validation failed: $($authTest.Error)" -Level "ERROR"
            exit 1
        }
    }
    
    # Execute phases
    $phaseResults = @{}
    
    switch ($Mode) {
        "Discovery" { 
            $phaseResults.Discovery = Invoke-SimplifiedDiscoveryPhase 
        }
        "Full" {
            $phaseResults.Discovery = Invoke-SimplifiedDiscoveryPhase
            # Processing and Export phases would be added here
        }
        default {
            $phaseResults.Discovery = Invoke-SimplifiedDiscoveryPhase
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
    }
    
    # Determine exit code
    $criticalCount = ($phaseResults.Values | ForEach-Object { $_.CriticalErrors.Count } | Measure-Object -Sum).Sum
    $errorCount = ($phaseResults.Values | ForEach-Object { $_.RecoverableErrors.Count } | Measure-Object -Sum).Sum
    
    $exitCode = if ($criticalCount -gt 0) { 2 }
                elseif ($errorCount -gt 0) { 1 }
                else { 0 }
    
    Write-OrchestratorLog -Message "Simplified orchestrator completed. Exit code: $exitCode" -Level "INFO"
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
    
    Write-OrchestratorLog -Message "Simplified orchestrator cleanup complete" -Level "INFO"
}