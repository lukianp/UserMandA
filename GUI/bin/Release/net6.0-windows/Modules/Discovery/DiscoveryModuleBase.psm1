# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Discovery Module Base for M&A Discovery Suite
.DESCRIPTION
    Provides base functionality and common patterns for discovery modules. This module serves as a foundation for all 
    discovery operations including standardized initialization, error handling, logging, and result formatting 
    to ensure consistent behavior across all discovery modules in the suite.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, ClassDefinitions module
#>

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-04
# Last Modified: 2025-06-06
# Change Log: Updated version control header

<#
.SYNOPSIS
    Base module providing common functionality for all discovery modules
.DESCRIPTION
    Provides standardized interfaces, error handling, retry logic, and performance tracking
.NOTES
    Author: Lukian Poleschtschuk
    Version: 1.0.0
#>

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

function Invoke-SafeModuleExecution {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        [Parameter(Mandatory=$false)]
        $Context
    )
    $result = @{
        Success = $false
        Data = $null
        Error = $null
        Duration = $null
    }
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        # Validate global context
        if (-not $global:MandA -or -not $global:MandA.Initialized) {
            throw "Global M&A context not initialized"
        }
        # Execute the module function
        $result.Data = & $ScriptBlock
        $result.Success = $true
    } catch {
        $result.Error = @{
            Message = $_.Exception.Message
            Type = $_.Exception.GetType().FullName
            StackTrace = $_.ScriptStackTrace
            InnerException = if ($_.Exception.InnerException) { $_.Exception.InnerException.Message } else { $null }
        }
        # Log to both file and console
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "[$ModuleName] Error: $($_.Exception.Message)" -Level "ERROR" -Component $ModuleName -Context $Context
        } else {
            Write-Host "[$ModuleName] Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        # Don't rethrow - let caller handle based on result
    } finally {
        $stopwatch.Stop()
        $result.Duration = $stopwatch.Elapsed
    }
    return $result
}

# DiscoveryResult class is defined globally by the Orchestrator using Add-Type

# Performance tracker for discovery operations
class DiscoveryPerformanceTracker {
    [hashtable]$Operations = @{}
    [System.Diagnostics.Stopwatch]$TotalTimer

    DiscoveryPerformanceTracker() {
        $this.TotalTimer = [System.Diagnostics.Stopwatch]::StartNew()
    }

    [void]StartOperation([string]$OperationName) {
        $this.Operations[$OperationName] = @{
            StartTime = Get-Date
            Stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            MemoryBefore = [System.Diagnostics.Process]::GetCurrentProcess().WorkingSet64
        }
    }

    [void]EndOperation([string]$OperationName, [int]$ItemsProcessed = 0) {
        if ($this.Operations.ContainsKey($OperationName)) {
            $op = $this.Operations[$OperationName]
            $op.Stopwatch.Stop()
            $op.Duration = $op.Stopwatch.Elapsed
            $op.ItemsProcessed = $ItemsProcessed
            $op.MemoryAfter = [System.Diagnostics.Process]::GetCurrentProcess().WorkingSet64
            $op.MemoryDelta = $op.MemoryAfter - $op.MemoryBefore
            if ($ItemsProcessed -gt 0 -and $op.Duration.TotalSeconds -gt 0) {
                $op.ItemsPerSecond = [math]::Round($ItemsProcessed / $op.Duration.TotalSeconds, 2)
            }
        }
    }

    [PSObject]GetReport() {
        return [PSCustomObject]@{
            TotalDuration = $this.TotalTimer.Elapsed
            Operations = $this.Operations
        }
    }
}

# Circuit breaker for external service calls
class CircuitBreaker {
    [string]$ServiceName
    [int]$FailureThreshold = 3
    [int]$FailureCount = 0
    [datetime]$LastFailureTime
    [timespan]$Timeout = [timespan]::FromMinutes(5)
    [bool]$IsOpen = $false
    [string]$State = "Closed" # Closed, Open, HalfOpen

    CircuitBreaker([string]$serviceName) {
        $this.ServiceName = $serviceName
    }

    [bool]CanAttempt() {
        switch ($this.State) {
            "Closed" { return $true }
            "Open" {
                if ((Get-Date) - $this.LastFailureTime -gt $this.Timeout) {
                    $this.State = "HalfOpen"
                    return $true
                }
                return $false
            }
            "HalfOpen" { return $true }
        }
        return $false
    }

    [void]RecordSuccess() {
        $this.FailureCount = 0
        $this.State = "Closed"
        $this.IsOpen = $false
    }

    [void]RecordFailure([Exception]$Exception) {
        $this.FailureCount++
        $this.LastFailureTime = Get-Date
        if ($this.State -eq "HalfOpen" -or $this.FailureCount -ge $this.FailureThreshold) {
            $this.State = "Open"
            $this.IsOpen = $true
        }
    }
}

function Invoke-DiscoveryWithRetry {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,
        [Parameter(Mandatory=$false)]
        [string]$OperationName = "Operation",
        [Parameter(Mandatory=$false)]
        [int]$MaxRetries = 3,
        [Parameter(Mandatory=$false)]
        [int]$InitialDelaySeconds = 2,
        [Parameter(Mandatory=$false)]
        [CircuitBreaker]$CircuitBreaker,
        [Parameter(Mandatory=$false)]
        $Context
    )
    if ($CircuitBreaker -and -not $CircuitBreaker.CanAttempt()) {
        throw "Circuit breaker is open for $($CircuitBreaker.ServiceName). Too many failures."
    }
    $attempt = 0
    $lastError = $null
    while ($attempt -lt $MaxRetries) {
        $attempt++
        try {
            if ($Context) {
                Write-MandALog "Executing $OperationName (attempt $attempt of $MaxRetries)" -Level "DEBUG" -Context $Context
            }
            $result = & $ScriptBlock
            if ($CircuitBreaker) {
                $CircuitBreaker.RecordSuccess()
            }
            return $result
        } catch {
            $lastError = $_
            $isRetryable = Test-RetryableError -Exception $_.Exception
            if ($CircuitBreaker) {
                $CircuitBreaker.RecordFailure($_.Exception)
            }
            if ($attempt -lt $MaxRetries -and $isRetryable) {
                $delay = Calculate-BackoffDelay -Attempt $attempt -InitialDelay $InitialDelaySeconds -Exception $_.Exception
                if ($Context) {
                    Write-MandALog "Retryable error in $OperationName. Waiting $delay seconds before retry..." -Level "WARN" -Context $Context
                }
                Start-Sleep -Seconds $delay
            } else {
                break
            }
        }
    }
    throw $lastError
}

function Test-RetryableError {
    param([Exception]$Exception)
    $retryableStatusCodes = @(408, 429, 500, 502, 503, 504)
    if ($Exception.Response -and $Exception.Response.StatusCode) {
        return $Exception.Response.StatusCode.value__ -in $retryableStatusCodes
    }
    $retryableTypes = @(
        'System.Net.WebException',
        'System.Net.Http.HttpRequestException',
        'System.TimeoutException',
        'System.IO.IOException'
    )
    $exceptionType = $Exception.GetType().FullName
    if ($exceptionType -in $retryableTypes) {
        return $true
    }
    $retryableMessages = @('timeout', 'temporary', 'transient', 'throttl', 'rate limit', 'busy', 'unavailable')
    $message = $Exception.Message.ToLower()
    foreach ($keyword in $retryableMessages) {
        if ($message -contains $keyword) {
            return $true
        }
    }
    return $false
}

function Calculate-BackoffDelay {
    param(
        [int]$Attempt,
        [int]$InitialDelay,
        [Exception]$Exception
    )
    if ($Exception.Response -and $Exception.Response.Headers -and $Exception.Response.Headers.RetryAfter) {
        $retryAfter = $Exception.Response.Headers.RetryAfter
        if ($retryAfter.Delta) {
            return [math]::Ceiling($retryAfter.Delta.TotalSeconds)
        }
    }
    $exponentialDelay = $InitialDelay * [math]::Pow(2, $Attempt - 1)
    $jitter = Get-Random -Minimum 0 -Maximum ($exponentialDelay * 0.1)
    return [math]::Min($exponentialDelay + $jitter, 300) # Cap at 5 minutes
}

function Invoke-BaseDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        [Parameter(Mandatory=$true)]
        [scriptblock]$DiscoveryScript,
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        $Context,
        [Parameter(Mandatory=$false)]
        [string[]]$RequiredPermissions = @(),
        [Parameter(Mandatory=$false)]
        [CircuitBreaker]$CircuitBreaker
    )
    $result = [DiscoveryResult]::new($ModuleName)
    $performanceTracker = [DiscoveryPerformanceTracker]::new()
    try {
        $discoveryData = & $DiscoveryScript
        $result.Data = $discoveryData
        $result.Success = $true
        $result.Complete()
        return $result
    } catch {
        $result.AddError("Error: $($_.Exception.Message)", $_.Exception)
        $result.Complete()
        return $result
    }
}

function Invoke-Discovery {
    <#
    .SYNOPSIS
    Main discovery function called by the M&A Orchestrator

    .PARAMETER Context
    The discovery context containing configuration and state information

    .PARAMETER Force
    Force discovery even if cached data exists
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Context,
        [Parameter(Mandatory = $false)]
        [switch]$Force
    )
    try {
        Write-MandALog "Starting DiscoveryModuleBase discovery" "INFO"
        $discoveryResult = @{
            ModuleName = "DiscoveryModuleBase"
            StartTime = Get-Date
            Status = "Completed"
            Data = @()
            Errors = @()
            Summary = @{ ItemsDiscovered = 0; ErrorCount = 0 }
        }
        # TODO: Implement actual discovery logic for DiscoveryModuleBase
        Write-MandALog "Completed DiscoveryModuleBase discovery" "SUCCESS"
        return $discoveryResult
    } catch {
        Write-MandALog "Error in DiscoveryModuleBase discovery: $($_.Exception.Message)" "ERROR"
        throw
    }
}

function Get-DiscoveryInfo {
    <#
    .SYNOPSIS
    Returns metadata about this discovery module
    #>
    [CmdletBinding()]
    param()
    return @{
        ModuleName = "DiscoveryModuleBase"
        ModuleVersion = "1.0.0"
        Description = "DiscoveryModuleBase discovery module for M&A Suite"
        RequiredPermissions = @("Read access to DiscoveryModuleBase resources")
        EstimatedDuration = "5-15 minutes"
        SupportedEnvironments = @("OnPremises", "Cloud", "Hybrid")
    }
}

Export-ModuleMember -Function Invoke-Discovery, Get-DiscoveryInfo