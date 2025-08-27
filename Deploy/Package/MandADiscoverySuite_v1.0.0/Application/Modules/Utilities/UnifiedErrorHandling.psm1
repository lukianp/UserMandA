# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Unified Error Handling Framework for M&A Discovery Suite
.DESCRIPTION
    Provides standardized error handling, retry logic, circuit breaker patterns, and comprehensive error reporting 
    across all modules. This framework replaces inconsistent error handling patterns with a unified approach that 
    includes sophisticated retry mechanisms, circuit breaker patterns, error categorization, context preservation, 
    and detailed error analytics to improve system resilience and debugging capabilities.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, ClassDefinitions module, EnhancedLogging module
#>

# Import required modules
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Core\ClassDefinitions.psm1") -Force

# Error severity levels
enum ErrorSeverity {
    Critical = 1
    High = 2
    Medium = 3
    Low = 4
    Info = 5
}

# Error categories
enum ErrorCategory {
    Authentication = 1
    Authorization = 2
    Network = 3
    Throttling = 4
    Timeout = 5
    Configuration = 6
    Validation = 7
    Resource = 8
    External = 9
    Unknown = 10
}

# Circuit breaker states
enum CircuitBreakerState {
    Closed = 1
    Open = 2
    HalfOpen = 3
}

class UnifiedError {
    [string]$Id
    [string]$Message
    [ErrorSeverity]$Severity
    [ErrorCategory]$Category
    [string]$Source
    [string]$ModuleName
    [string]$Function
    [hashtable]$Context
    [System.Exception]$Exception
    [datetime]$Timestamp
    [string]$StackTrace
    [string]$InnerException
    [int]$ErrorCode
    [hashtable]$Metadata
    [string]$Resolution
    [bool]$IsRecoverable
    [int]$RetryCount
    [string]$CorrelationId
    
    UnifiedError([string]$Message, [ErrorSeverity]$Severity, [ErrorCategory]$Category, [string]$Source) {
        $this.Id = [System.Guid]::NewGuid().ToString()
        $this.Message = $Message
        $this.Severity = $Severity
        $this.Category = $Category
        $this.Source = $Source
        $this.Timestamp = Get-Date
        $this.Context = @{}
        $this.Metadata = @{}
        $this.RetryCount = 0
        $this.IsRecoverable = $this.DetermineRecoverability()
        $this.CorrelationId = $this.GenerateCorrelationId()
    }
    
    UnifiedError([System.Exception]$Exception, [string]$Source) {
        $this.Id = [System.Guid]::NewGuid().ToString()
        $this.Exception = $Exception
        $this.Message = $Exception.Message
        $this.Source = $Source
        $this.Timestamp = Get-Date
        $this.StackTrace = $Exception.StackTrace
        $this.InnerException = if ($Exception.InnerException) { $Exception.InnerException.Message } else { $null }
        $this.Context = @{}
        $this.Metadata = @{}
        $this.RetryCount = 0
        $this.CorrelationId = $this.GenerateCorrelationId()
        
        # Auto-categorize based on exception type
        $this.Category = $this.CategorizeException($Exception)
        $this.Severity = $this.DetermineSeverity($Exception)
        $this.IsRecoverable = $this.DetermineRecoverability()
    }
    
    [ErrorCategory]CategorizeException([System.Exception]$Exception) {
        switch ($Exception.GetType().Name) {
            'UnauthorizedAccessException' { return [ErrorCategory]::Authorization }
            'AuthenticationException' { return [ErrorCategory]::Authentication }
            'HttpRequestException' { return [ErrorCategory]::Network }
            'TimeoutException' { return [ErrorCategory]::Timeout }
            'ArgumentException' { return [ErrorCategory]::Validation }
            'ArgumentNullException' { return [ErrorCategory]::Validation }
            'ConfigurationException' { return [ErrorCategory]::Configuration }
            'OutOfMemoryException' { return [ErrorCategory]::Resource }
            'InvalidOperationException' { return [ErrorCategory]::Configuration }
            default { return [ErrorCategory]::Unknown }
        }
    }
    
    [ErrorSeverity]DetermineSeverity([System.Exception]$Exception) {
        switch ($Exception.GetType().Name) {
            'OutOfMemoryException' { return [ErrorSeverity]::Critical }
            'UnauthorizedAccessException' { return [ErrorSeverity]::High }
            'AuthenticationException' { return [ErrorSeverity]::High }
            'TimeoutException' { return [ErrorSeverity]::Medium }
            'ArgumentException' { return [ErrorSeverity]::Medium }
            'HttpRequestException' { return [ErrorSeverity]::Medium }
            default { return [ErrorSeverity]::Low }
        }
    }
    
    [bool]DetermineRecoverability() {
        switch ($this.Category) {
            ([ErrorCategory]::Throttling) { return $true }
            ([ErrorCategory]::Timeout) { return $true }
            ([ErrorCategory]::Network) { return $true }
            ([ErrorCategory]::External) { return $true }
            ([ErrorCategory]::Authentication) { return $false }
            ([ErrorCategory]::Authorization) { return $false }
            ([ErrorCategory]::Configuration) { return $false }
            ([ErrorCategory]::Validation) { return $false }
            ([ErrorCategory]::Resource) { return $false }
            default { return $true }
        }
    }
    
    [string]GenerateCorrelationId() {
        return [System.Guid]::NewGuid().ToString("N")[0..7] -join ''
    }
    
    [hashtable]ToHashtable() {
        return @{
            Id = $this.Id
            Message = $this.Message
            Severity = $this.Severity.ToString()
            Category = $this.Category.ToString()
            Source = $this.Source
            ModuleName = $this.ModuleName
            Function = $this.Function
            Context = $this.Context
            Timestamp = $this.Timestamp
            StackTrace = $this.StackTrace
            InnerException = $this.InnerException
            ErrorCode = $this.ErrorCode
            Metadata = $this.Metadata
            Resolution = $this.Resolution
            IsRecoverable = $this.IsRecoverable
            RetryCount = $this.RetryCount
            CorrelationId = $this.CorrelationId
        }
    }
}

class CircuitBreaker {
    [string]$Name
    [CircuitBreakerState]$State
    [int]$FailureThreshold
    [int]$SuccessThreshold
    [timespan]$Timeout
    [int]$FailureCount
    [int]$SuccessCount
    [datetime]$LastFailureTime
    [datetime]$LastSuccessTime
    [hashtable]$Metadata
    
    CircuitBreaker([string]$Name, [int]$FailureThreshold, [int]$SuccessThreshold, [timespan]$Timeout) {
        $this.Name = $Name
        $this.FailureThreshold = $FailureThreshold
        $this.SuccessThreshold = $SuccessThreshold
        $this.Timeout = $Timeout
        $this.State = [CircuitBreakerState]::Closed
        $this.FailureCount = 0
        $this.SuccessCount = 0
        $this.Metadata = @{}
    }
    
    [bool]CanExecute() {
        switch ($this.State) {
            ([CircuitBreakerState]::Closed) { return $true }
            ([CircuitBreakerState]::Open) { 
                if ((Get-Date) - $this.LastFailureTime -gt $this.Timeout) {
                    $this.State = [CircuitBreakerState]::HalfOpen
                    return $true
                }
                return $false
            }
            ([CircuitBreakerState]::HalfOpen) { return $true }
            default { return $false }
        }
    }
    
    [void]RecordSuccess() {
        $this.SuccessCount++
        $this.LastSuccessTime = Get-Date
        
        if ($this.State -eq [CircuitBreakerState]::HalfOpen) {
            if ($this.SuccessCount -ge $this.SuccessThreshold) {
                $this.State = [CircuitBreakerState]::Closed
                $this.FailureCount = 0
                $this.SuccessCount = 0
            }
        }
    }
    
    [void]RecordFailure() {
        $this.FailureCount++
        $this.LastFailureTime = Get-Date
        
        if ($this.State -eq [CircuitBreakerState]::Closed) {
            if ($this.FailureCount -ge $this.FailureThreshold) {
                $this.State = [CircuitBreakerState]::Open
            }
        } elseif ($this.State -eq [CircuitBreakerState]::HalfOpen) {
            $this.State = [CircuitBreakerState]::Open
            $this.SuccessCount = 0
        }
    }
    
    [hashtable]GetStatus() {
        return @{
            Name = $this.Name
            State = $this.State.ToString()
            FailureCount = $this.FailureCount
            SuccessCount = $this.SuccessCount
            LastFailureTime = $this.LastFailureTime
            LastSuccessTime = $this.LastSuccessTime
            FailureThreshold = $this.FailureThreshold
            SuccessThreshold = $this.SuccessThreshold
            Timeout = $this.Timeout
        }
    }
}

class RetryPolicy {
    [int]$MaxRetries
    [timespan]$InitialDelay
    [double]$BackoffMultiplier
    [timespan]$MaxDelay
    [array]$RetryableErrors
    [array]$NonRetryableErrors
    [bool]$UseJitter
    [scriptblock]$ShouldRetry
    
    RetryPolicy([int]$MaxRetries, [timespan]$InitialDelay, [double]$BackoffMultiplier) {
        $this.MaxRetries = $MaxRetries
        $this.InitialDelay = $InitialDelay
        $this.BackoffMultiplier = $BackoffMultiplier
        $this.MaxDelay = [timespan]::FromMinutes(5)
        $this.RetryableErrors = @()
        $this.NonRetryableErrors = @()
        $this.UseJitter = $true
    }
    
    [timespan]CalculateDelay([int]$AttemptNumber) {
        $delay = $this.InitialDelay.TotalMilliseconds * [Math]::Pow($this.BackoffMultiplier, $AttemptNumber - 1)
        
        if ($this.UseJitter) {
            $jitter = (Get-Random -Minimum 0.8 -Maximum 1.2)
            $delay = $delay * $jitter
        }
        
        $delayTimespan = [timespan]::FromMilliseconds($delay)
        return if ($delayTimespan -gt $this.MaxDelay) { $this.MaxDelay } else { $delayTimespan }
    }
    
    [bool]ShouldRetryError([UnifiedError]$Error) {
        if ($Error.RetryCount -ge $this.MaxRetries) {
            return $false
        }
        
        if (-not $Error.IsRecoverable) {
            return $false
        }
        
        if ($this.NonRetryableErrors -contains $Error.Category) {
            return $false
        }
        
        if ($this.RetryableErrors.Count -gt 0 -and $this.RetryableErrors -notcontains $Error.Category) {
            return $false
        }
        
        if ($this.ShouldRetry) {
            return & $this.ShouldRetry $Error
        }
        
        return $true
    }
}

class UnifiedErrorHandler {
    [hashtable]$CircuitBreakers = @{}
    [hashtable]$RetryPolicies = @{}
    [System.Collections.Generic.List[UnifiedError]]$ErrorHistory
    [hashtable]$ErrorStats = @{}
    [hashtable]$Configuration
    [string]$SessionId
    
    UnifiedErrorHandler([hashtable]$Configuration, [string]$SessionId) {
        $this.Configuration = $Configuration
        $this.SessionId = $SessionId
        $this.ErrorHistory = [System.Collections.Generic.List[UnifiedError]]::new()
        $this.InitializeDefaults()
    }
    
    [void]InitializeDefaults() {
        # Default circuit breaker for Graph API
        $this.CircuitBreakers['GraphAPI'] = [CircuitBreaker]::new(
            'GraphAPI',
            5,  # Failure threshold
            3,  # Success threshold
            [timespan]::FromMinutes(2)  # Timeout
        )
        
        # Default retry policy for transient errors
        $this.RetryPolicies['Default'] = [RetryPolicy]::new(
            3,  # Max retries
            [timespan]::FromSeconds(1),  # Initial delay
            2.0  # Backoff multiplier
        )
        
        # Specific retry policy for throttling
        $this.RetryPolicies['Throttling'] = [RetryPolicy]::new(
            5,  # Max retries
            [timespan]::FromSeconds(2),  # Initial delay
            1.5  # Backoff multiplier
        )
        
        $this.RetryPolicies['Throttling'].RetryableErrors = @([ErrorCategory]::Throttling, [ErrorCategory]::Timeout, [ErrorCategory]::Network)
    }
    
    [object]ExecuteWithRetry([scriptblock]$Operation, [string]$OperationName, [hashtable]$Context, [string]$RetryPolicyName = 'Default') {
        $retryPolicy = $this.RetryPolicies[$RetryPolicyName]
        $circuitBreaker = $this.CircuitBreakers['GraphAPI']
        $attemptNumber = 1
        
        while ($attemptNumber -le $retryPolicy.MaxRetries + 1) {
            # Check circuit breaker
            if (-not $circuitBreaker.CanExecute()) {
                $error = [UnifiedError]::new(
                    "Circuit breaker is open for $OperationName",
                    [ErrorSeverity]::High,
                    [ErrorCategory]::External,
                    $OperationName
                )
                $error.Context = $Context
                $this.RecordError($error)
                throw $error.Exception
            }
            
            try {
                $result = & $Operation
                
                # Record success
                $circuitBreaker.RecordSuccess()
                
                if ($attemptNumber -gt 1) {
                    $this.LogRetrySuccess($OperationName, $attemptNumber - 1)
                }
                
                return $result
                
            } catch {
                $error = [UnifiedError]::new($_.Exception, $OperationName)
                $error.Context = $Context
                $error.RetryCount = $attemptNumber - 1
                $error.ModuleName = $this.GetCallerModuleName()
                $error.Function = $this.GetCallerFunctionName()
                
                $this.RecordError($error)
                $circuitBreaker.RecordFailure()
                
                if ($attemptNumber -le $retryPolicy.MaxRetries -and $retryPolicy.ShouldRetryError($error)) {
                    $delay = $retryPolicy.CalculateDelay($attemptNumber)
                    $this.LogRetryAttempt($OperationName, $attemptNumber, $delay, $error)
                    
                    Start-Sleep -Milliseconds $delay.TotalMilliseconds
                    $attemptNumber++
                } else {
                    $this.LogRetryFailure($OperationName, $attemptNumber - 1, $error)
                    throw
                }
            }
        }
    }
    
    [void]RecordError([UnifiedError]$Error) {
        $this.ErrorHistory.Add($Error)
        
        # Update statistics
        $categoryKey = $Error.Category.ToString()
        $severityKey = $Error.Severity.ToString()
        
        if (-not $this.ErrorStats.ContainsKey($categoryKey)) {
            $this.ErrorStats[$categoryKey] = 0
        }
        if (-not $this.ErrorStats.ContainsKey($severityKey)) {
            $this.ErrorStats[$severityKey] = 0
        }
        
        $this.ErrorStats[$categoryKey]++
        $this.ErrorStats[$severityKey]++
        
        # Log the error
        $this.LogError($Error)
        
        # Cleanup old errors (keep last 1000)
        if ($this.ErrorHistory.Count -gt 1000) {
            $this.ErrorHistory.RemoveRange(0, $this.ErrorHistory.Count - 1000)
        }
    }
    
    [void]LogError([UnifiedError]$Error) {
        $logLevel = switch ($Error.Severity) {
            ([ErrorSeverity]::Critical) { "ERROR" }
            ([ErrorSeverity]::High) { "ERROR" }
            ([ErrorSeverity]::Medium) { "WARN" }
            ([ErrorSeverity]::Low) { "INFO" }
            ([ErrorSeverity]::Info) { "INFO" }
        }
        
        $logMessage = "[$($Error.CorrelationId)] $($Error.Message)"
        
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message $logMessage -Level $logLevel -Component $Error.ModuleName -Context $Error.Context
        } else {
            $color = switch ($logLevel) {
                "ERROR" { "Red" }
                "WARN" { "Yellow" }
                "INFO" { "White" }
                default { "Gray" }
            }
            Write-Host $logMessage -ForegroundColor $color
        }
    }
    
    [void]LogRetryAttempt([string]$OperationName, [int]$AttemptNumber, [timespan]$Delay, [UnifiedError]$Error) {
        $message = "[$($Error.CorrelationId)] Retrying $OperationName (attempt $AttemptNumber) after $($Delay.TotalSeconds)s delay: $($Error.Message)"
        
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message $message -Level "WARN" -Component $Error.ModuleName
        } else {
            Write-Host $message -ForegroundColor Yellow
        }
    }
    
    [void]LogRetrySuccess([string]$OperationName, [int]$TotalAttempts) {
        $message = "$OperationName succeeded after $TotalAttempts retry attempts"
        
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message $message -Level "INFO" -Component "RetryHandler"
        } else {
            Write-Host $message -ForegroundColor Green
        }
    }
    
    [void]LogRetryFailure([string]$OperationName, [int]$TotalAttempts, [UnifiedError]$Error) {
        $message = "[$($Error.CorrelationId)] $OperationName failed after $TotalAttempts retry attempts: $($Error.Message)"
        
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message $message -Level "ERROR" -Component $Error.ModuleName
        } else {
            Write-Host $message -ForegroundColor Red
        }
    }
    
    [string]GetCallerModuleName() {
        $callStack = Get-PSCallStack
        if ($callStack.Count -gt 2) {
            return $callStack[2].Command
        }
        return "Unknown"
    }
    
    [string]GetCallerFunctionName() {
        $callStack = Get-PSCallStack
        if ($callStack.Count -gt 2) {
            return $callStack[2].FunctionName
        }
        return "Unknown"
    }
    
    [hashtable]GetErrorSummary() {
        $recentErrors = $this.ErrorHistory | Where-Object { $_.Timestamp -gt (Get-Date).AddHours(-1) }
        
        return @{
            TotalErrors = $this.ErrorHistory.Count
            RecentErrors = $recentErrors.Count
            ErrorsByCategory = $this.ErrorStats
            CircuitBreakerStatus = $this.CircuitBreakers.Values | ForEach-Object { $_.GetStatus() }
            MostCommonErrors = $this.ErrorHistory | Group-Object -Property Message | Sort-Object Count -Descending | Select-Object -First 5
            ErrorTrends = $this.CalculateErrorTrends()
        }
    }
    
    [hashtable]CalculateErrorTrends() {
        $now = Get-Date
        $hourlyErrors = @{}
        
        for ($i = 0; $i -lt 24; $i++) {
            $hour = $now.AddHours(-$i)
            $hourKey = $hour.ToString('yyyy-MM-dd HH:00:00')
            $hourlyErrors[$hourKey] = ($this.ErrorHistory | Where-Object { 
                $_.Timestamp -ge $hour.AddHours(-1) -and $_.Timestamp -lt $hour 
            }).Count
        }
        
        return $hourlyErrors
    }
}

# Module-level error handler instance
$script:GlobalErrorHandler = $null

function Initialize-UnifiedErrorHandler {
    <#
    .SYNOPSIS
        Initializes the global unified error handler
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )
    
    $script:GlobalErrorHandler = [UnifiedErrorHandler]::new($Configuration, $SessionId)
    Write-Host "Unified Error Handler initialized for session: $SessionId" -ForegroundColor Green
}

function Invoke-WithUnifiedErrorHandling {
    <#
    .SYNOPSIS
        Executes a script block with unified error handling and retry logic
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$Operation,
        
        [Parameter(Mandatory=$true)]
        [string]$OperationName,
        
        [Parameter(Mandatory=$false)]
        [hashtable]$Context = @{},
        
        [Parameter(Mandatory=$false)]
        [string]$RetryPolicyName = 'Default'
    )
    
    if (-not $script:GlobalErrorHandler) {
        throw "Unified Error Handler not initialized. Call Initialize-UnifiedErrorHandler first."
    }
    
    return $script:GlobalErrorHandler.ExecuteWithRetry($Operation, $OperationName, $Context, $RetryPolicyName)
}

function Get-ErrorHandlerSummary {
    <#
    .SYNOPSIS
        Returns error handling statistics and summary
    #>
    [CmdletBinding()]
    param()
    
    if (-not $script:GlobalErrorHandler) {
        throw "Unified Error Handler not initialized."
    }
    
    return $script:GlobalErrorHandler.GetErrorSummary()
}

function New-UnifiedError {
    <#
    .SYNOPSIS
        Creates a new unified error object
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [ErrorSeverity]$Severity = [ErrorSeverity]::Medium,
        
        [Parameter(Mandatory=$false)]
        [ErrorCategory]$Category = [ErrorCategory]::Unknown,
        
        [Parameter(Mandatory=$true)]
        [string]$Source,
        
        [Parameter(Mandatory=$false)]
        [hashtable]$Context = @{}
    )
    
    $error = [UnifiedError]::new($Message, $Severity, $Category, $Source)
    $error.Context = $Context
    
    return $error
}

function Test-CircuitBreaker {
    <#
    .SYNOPSIS
        Tests if a circuit breaker allows execution
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Name
    )
    
    if (-not $script:GlobalErrorHandler) {
        throw "Unified Error Handler not initialized."
    }
    
    if ($script:GlobalErrorHandler.CircuitBreakers.ContainsKey($Name)) {
        return $script:GlobalErrorHandler.CircuitBreakers[$Name].CanExecute()
    }
    
    return $true
}

# Export module members
Export-ModuleMember -Function @(
    'Initialize-UnifiedErrorHandler',
    'Invoke-WithUnifiedErrorHandling',
    'Get-ErrorHandlerSummary',
    'New-UnifiedError',
    'Test-CircuitBreaker'
)