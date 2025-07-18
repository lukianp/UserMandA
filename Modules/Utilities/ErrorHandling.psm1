# -*- coding: utf-8-bom -*-
#Requires -Version 5.1
# Used by orchestrator!

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Standardized error handling and retry mechanisms for the M&A Discovery Suite
.DESCRIPTION
    This module provides functions to invoke script blocks with retry logic, get user-friendly error messages, 
    and manage error summaries. It integrates with the EnhancedLogging module for output and includes 
    comprehensive error handling capabilities with exponential backoff, error categorization, detailed 
    error context preservation, and standardized error reporting across the entire discovery suite.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, EnhancedLogging module
    Date: 2025-06-05

    Key Design Points:
    - Uses Write-SafeLog for logging (assumes EnhancedLogging.psm1 is loaded).
    - Relies on $global:MandA or a passed -Context for logging context.
    - Retry logic is configurable via $global:MandA.Config.environment.
#>

# Module-scope context variable
$script:ModuleContext = $null

# Lazy initialization function
function Get-ModuleContext {
    try {
        if ($null -eq $script:ModuleContext) {
            if ($null -ne $global:MandA) {
                $script:ModuleContext = $global:MandA
            } else {
                throw "Module context not available"
            }
        }
        return $script:ModuleContext
    } catch {
        Write-Host "Error in function 'Get-ModuleContext': $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
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

# Fallback logging function if Write-SafeLog is not available
function Write-FallbackLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Component = "ErrorHandling",
        [PSCustomObject]$Context = $null
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        "DEBUG" { "Gray" }
        "CRITICAL" { "Magenta" }
        default { "White" }
    }
    
    try {
        Write-Host "$timestamp [$Level] [$Component] $Message" -ForegroundColor $color
    } catch {
        Write-Host "Error in function 'Write-FallbackLog': $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

# Safe logging wrapper
function Write-SafeLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Component = "ErrorHandling",
        [PSCustomObject]$Context = $null
    )
    
    try {
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message $Message -Level $Level -Component $Component -Context $Context
        } else {
            Write-FallbackLog -Message $Message -Level $Level -Component $Component -Context $Context
        }
    } catch {
        Write-Host "Error in function 'Write-SafeLog': $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

# Enhanced error context capture function
function Add-ErrorContext {
    <#
    .SYNOPSIS
        Captures comprehensive error context for debugging purposes.
    .DESCRIPTION
        Creates a rich error object with detailed context information including
        timestamp, error details, environment information, and script context.
    .PARAMETER ErrorRecord
        The PowerShell ErrorRecord to enhance with context.
    .PARAMETER Context
        Additional context information to include with the error.
    .PARAMETER IncludeEnvironment
        Whether to include environment information (default: true).
    .PARAMETER IncludeScriptInfo
        Whether to include script information (default: true).
    .EXAMPLE
        try {
            # Some operation that might fail
        } catch {
            $enhancedError = Add-ErrorContext -ErrorRecord $_ -Context @{
                Operation = "UserDiscovery"
                TenantId = $tenantId
                UserId = $userId
            }
            Write-SafeLog -Message "Enhanced error captured" -Level "ERROR" -Context $enhancedError
        }
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [System.Management.Automation.ErrorRecord]$ErrorRecord,
        
        [Parameter(Mandatory=$false)]
        [hashtable]$Context = @{},
        
        [Parameter(Mandatory=$false)]
        [bool]$IncludeEnvironment = $true,
        
        [Parameter(Mandatory=$false)]
        [bool]$IncludeScriptInfo = $true,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$LoggingContext # For logging context
    )
    
    Write-SafeLog -Message "Capturing enhanced error context for: $($ErrorRecord.Exception.Message)" -Level "DEBUG" -Component "ErrorContextCapture" -Context $LoggingContext
    
    # Create rich error object
    $enhancedError = @{
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
        ExecutionId = [guid]::NewGuid().ToString()
        Error = @{
            Message = $ErrorRecord.Exception.Message
            Type = $ErrorRecord.Exception.GetType().FullName
            StackTrace = $ErrorRecord.ScriptStackTrace
            TargetObject = if ($ErrorRecord.TargetObject) { $ErrorRecord.TargetObject.ToString() } else { $null }
            CategoryInfo = $ErrorRecord.CategoryInfo.ToString()
            FullyQualifiedErrorId = $ErrorRecord.FullyQualifiedErrorId
            InnerException = if ($ErrorRecord.Exception.InnerException) {
                @{
                    Message = $ErrorRecord.Exception.InnerException.Message
                    Type = $ErrorRecord.Exception.InnerException.GetType().FullName
                    StackTrace = $ErrorRecord.Exception.InnerException.StackTrace
                }
            } else { $null }
        }
        Context = $Context
    }
    
    # Add environment information if requested
    if ($IncludeEnvironment) {
        $enhancedError.Environment = @{
            Computer = $env:COMPUTERNAME
            User = $env:USERNAME
            Domain = $env:USERDOMAIN
            PowerShellVersion = $PSVersionTable.PSVersion.ToString()
            PSEdition = $PSVersionTable.PSEdition
            OSVersion = [System.Environment]::OSVersion.VersionString
            ProcessId = $PID
            SessionId = if ($Host.InstanceId) { $Host.InstanceId.ToString() } else { "Unknown" }
            WorkingDirectory = Get-Location | Select-Object -ExpandProperty Path
            ExecutionPolicy = Get-ExecutionPolicy
            Culture = [System.Globalization.CultureInfo]::CurrentCulture.Name
            UICulture = [System.Globalization.CultureInfo]::CurrentUICulture.Name
        }
    }
    
    # Add script information if requested
    if ($IncludeScriptInfo -and $ErrorRecord.InvocationInfo) {
        $enhancedError.ScriptInfo = @{
            ScriptName = $ErrorRecord.InvocationInfo.ScriptName
            LineNumber = $ErrorRecord.InvocationInfo.ScriptLineNumber
            OffsetInLine = $ErrorRecord.InvocationInfo.OffsetInLine
            Command = $ErrorRecord.InvocationInfo.Line
            CommandName = $ErrorRecord.InvocationInfo.MyCommand.Name
            CommandType = if ($ErrorRecord.InvocationInfo.MyCommand) { $ErrorRecord.InvocationInfo.MyCommand.CommandType.ToString() } else { $null }
            ModuleName = if ($ErrorRecord.InvocationInfo.MyCommand.Module) { $ErrorRecord.InvocationInfo.MyCommand.Module.Name } else { $null }
            PositionMessage = $ErrorRecord.InvocationInfo.PositionMessage
        }
    }
    
    # Add PowerShell call stack for deeper context
    $enhancedError.CallStack = Get-PSCallStack | ForEach-Object {
        @{
            Command = $_.Command
            Location = $_.Location
            FunctionName = $_.FunctionName
            ScriptName = $_.ScriptName
            ScriptLineNumber = $_.ScriptLineNumber
            Arguments = if ($_.Arguments) { $_.Arguments.ToString() } else { $null }
        }
    }
    
    # Add loaded modules information
    $enhancedError.LoadedModules = Get-Module | Select-Object Name, Version, ModuleType, Path | ForEach-Object {
        @{
            Name = $_.Name
            Version = $_.Version.ToString()
            ModuleType = $_.ModuleType.ToString()
            Path = $_.Path
        }
    }
    
    Write-SafeLog -Message "Enhanced error context captured successfully (ID: $($enhancedError.ExecutionId))" -Level "DEBUG" -Component "ErrorContextCapture" -Context $LoggingContext
    
    return $enhancedError
}

function New-EnhancedErrorRecord {
    param(
        [Parameter(Mandatory=$true)]
        [System.Exception]$Exception,
        
        [Parameter(Mandatory=$true)]
        [string]$ErrorId,
        
        [Parameter(Mandatory=$false)]
        [System.Management.Automation.ErrorCategory]$ErrorCategory = [System.Management.Automation.ErrorCategory]::NotSpecified,
        
        [Parameter(Mandatory=$false)]
        [object]$TargetObject = $null,
        
        [Parameter(Mandatory=$false)]
        [hashtable]$Context = @{},
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$LoggingContext
    )
    
    try {
        # Create the base ErrorRecord
        $errorRecord = [System.Management.Automation.ErrorRecord]::new(
            $Exception,
            $ErrorId,
            $ErrorCategory,
            $TargetObject
        )
        
        # Add enhanced context
        $enhancedContext = Add-ErrorContext -ErrorRecord $errorRecord -Context $Context -LoggingContext $LoggingContext
        
        # Store the enhanced context in the ErrorRecord's ErrorDetails
        $errorRecord.ErrorDetails = [System.Management.Automation.ErrorDetails]::new("Enhanced Error Context Available")
        $errorRecord.ErrorDetails.RecommendedAction = "Use Get-ErrorContext to retrieve full context information"
        
        # Store the enhanced context in a way that can be retrieved later
        if (-not $global:MandAErrorContextStore) {
            $global:MandAErrorContextStore = @{}
        }
        $global:MandAErrorContextStore[$errorRecord.GetHashCode()] = $enhancedContext
        
        Write-SafeLog -Message "Enhanced ErrorRecord created with ID: $ErrorId" -Level "DEBUG" -Component "ErrorRecordCreation" -Context $LoggingContext
        
        return $errorRecord
    } catch {
        Write-Host "Error in function 'New-EnhancedErrorRecord': $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

function Export-ErrorContext {
    <#
    .SYNOPSIS
        Exports error context information to a file for analysis.
    .DESCRIPTION
        Saves enhanced error context to JSON format for detailed analysis
        and debugging purposes.
    .PARAMETER EnhancedError
        The enhanced error object from Add-ErrorContext.
    .PARAMETER OutputPath
        The path where to save the error context file.
    .PARAMETER IncludeTimestamp
        Whether to include timestamp in the filename (default: true).
    .EXAMPLE
        $enhancedError = Add-ErrorContext -ErrorRecord $_ -Context @{ Operation = "Discovery" }
        Export-ErrorContext -EnhancedError $enhancedError -OutputPath "C:\Logs\Errors"
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$EnhancedError,
        
        [Parameter(Mandatory=$false)]
        [string]$OutputPath = ".\ErrorLogs",
        
        [Parameter(Mandatory=$false)]
        [bool]$IncludeTimestamp = $true,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$LoggingContext
    )
    
    try {
        # Ensure output directory exists
        if (-not (Test-Path $OutputPath)) {
            New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
            Write-SafeLog -Message "Created error log directory: $OutputPath" -Level "INFO" -Component "ErrorExport" -Context $LoggingContext
        }
        
        # Generate filename
        $timestamp = if ($IncludeTimestamp) { Get-Date -Format "yyyyMMdd_HHmmss" } else { "" }
        $executionId = $EnhancedError.ExecutionId.Substring(0, 8)
        $filename = if ($timestamp) {
            "ErrorContext_${timestamp}_${executionId}.json"
        } else {
            "ErrorContext_${executionId}.json"
        }
        
        $fullPath = Join-Path $OutputPath $filename
        
        # Convert to JSON and save
        $jsonContent = $EnhancedError | ConvertTo-Json -Depth 10 -Compress:$false
        $jsonContent | Out-File -FilePath $fullPath -Encoding UTF8 -Force
        
        Write-SafeLog -Message "Error context exported to: $fullPath" -Level "INFO" -Component "ErrorExport" -Context $LoggingContext
        
        return $fullPath
    } catch {
        Write-SafeLog -Message "Failed to export error context: $($_.Exception.Message)" -Level "ERROR" -Component "ErrorExport" -Context $LoggingContext
        throw
    }
}

function Invoke-WithRetry {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,

        [Parameter(Mandatory=$false)]
        [int]$MaxRetries = 3,

        [Parameter(Mandatory=$false)]
        [int]$DelaySeconds = 5,

        [Parameter(Mandatory=$false)]
        [string]$OperationName = "Unnamed Operation",

        [Parameter(Mandatory=$false)]
        [string[]]$RetryableErrorTypes,

        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )

    Write-SafeLog -Message "Attempting operation: '$OperationName'. Max Retries: $MaxRetries, Delay: $DelaySeconds s." -Level "DEBUG" -Component "RetryWrapper" -Context $Context

    $attempt = 0
    $lastError = $null
    $operationSuccessful = $false
    $result = $null

    while ($attempt -lt $MaxRetries) {
        $attempt++
        try {
            Write-SafeLog -Message "Executing '$OperationName', Attempt: $attempt of $MaxRetries..." -Level "DEBUG" -Component "RetryWrapper" -Context $Context
            $result = & $ScriptBlock
            $operationSuccessful = $true
            Write-SafeLog -Message "Operation '$OperationName' succeeded on attempt $attempt." -Level "SUCCESS" -Component "RetryWrapper" -Context $Context
            break
        } catch {
            $lastError = $_
            $errorType = $_.Exception.GetType().FullName
            $errorMessage = $_.Exception.Message

            # Capture enhanced error context for debugging
            $enhancedErrorContext = Add-ErrorContext -ErrorRecord $lastError -Context @{
                OperationName = $OperationName
                AttemptNumber = $attempt
                MaxRetries = $MaxRetries
                DelaySeconds = $DelaySeconds
                RetryableErrorTypes = $RetryableErrorTypes
            } -LoggingContext $Context

            Write-SafeLog -Message "Attempt $attempt for '$OperationName' failed. Error: $errorMessage (Type: $errorType). Enhanced context ID: $($enhancedErrorContext.ExecutionId)" -Level "WARN" -Component "RetryWrapper" -Context $Context

            # Check if this error type is specifically retryable
            $isRetryableBySpecificType = $false
            if ($null -ne $RetryableErrorTypes -and $RetryableErrorTypes.Count -gt 0) {
                if ($RetryableErrorTypes -contains $errorType) {
                    $isRetryableBySpecificType = $true
                    Write-SafeLog -Message "Error type '$errorType' is in the list of retryable errors for '$OperationName'." -Level "DEBUG" -Component "RetryWrapper" -Context $Context
                }
            } else {
                # If no specific retryable types are given, assume most errors are retryable up to MaxRetries
                $isRetryableBySpecificType = $true
            }

            if ($attempt -ge $MaxRetries -or -not $isRetryableBySpecificType) {
                Write-SafeLog -Message "Operation '$OperationName' failed after $attempt attempt(s). Error: $errorMessage. No more retries or error not retryable." -Level "ERROR" -Component "RetryWrapper" -Context $Context
                # Re-throw the last error to be caught by the caller
                throw $lastError
            }

            $waitTime = $DelaySeconds * $attempt
            Write-SafeLog -Message "Waiting $waitTime seconds before retrying '$OperationName' (Attempt $($attempt + 1))..." -Level "INFO" -Component "RetryWrapper" -Context $Context
            Start-Sleep -Seconds $waitTime
        }
    }

    if ($operationSuccessful) {
        return $result
    } else {
        # Should have been re-thrown in the catch block if all retries failed
        Write-SafeLog -Message "Operation '$OperationName' ultimately failed after all retries." -Level "ERROR" -Component "RetryWrapper" -Context $Context
        throw "Operation '$OperationName' failed after $MaxRetries attempts. Last Error: $($lastError.Exception.Message)"
    }
}

function Get-FriendlyErrorMessage {
    param(
        [Parameter(Mandatory=$true)]
        [System.Management.Automation.ErrorRecord]$ErrorRecord,
        [PSCustomObject]$Context
    )
    
    if ($null -eq $ErrorRecord) { return "No error record provided." }

    $exception = $ErrorRecord.Exception
    $baseMessage = $exception.Message
    $exceptionType = $exception.GetType().FullName
    $targetObject = $ErrorRecord.TargetObject
    $categoryInfo = $ErrorRecord.CategoryInfo
    $invocationInfo = $ErrorRecord.InvocationInfo

    $friendlyMessage = "An error occurred: `"$baseMessage`" (Type: $exceptionType)."

    # Add more specific friendly messages based on common exception types or categories
    switch -Wildcard ($exceptionType) {
        "*System.Net.WebException*" {
            $statusCode = ""
            if ($exception.Response -is [System.Net.HttpWebResponse]) {
                $statusCode = " (Status: $($exception.Response.StatusCode.value__): $($exception.Response.StatusDescription))"
            }
            $friendlyMessage = "Network communication error: $baseMessage$statusCode. Check network connectivity, DNS, firewalls, and endpoint availability."
        }
        "*Microsoft.Graph.Models.ODataErrors.ODataError*" {
            $oDataError = $exception.Error
            $graphErrorCode = $oDataError.Code
            $graphErrorMessage = $oDataError.Message
            $friendlyMessage = "Microsoft Graph API error: '$graphErrorMessage' (Code: $graphErrorCode). Check permissions, request syntax, and service health."
            if ($graphErrorCode -in ("AuthenticationError", "InvalidAuthenticationToken", "TokenNotFound")) {
                $friendlyMessage += " This often indicates an issue with authentication credentials or token validity. Try re-authenticating or checking credential expiry."
            } elseif ($graphErrorCode -in ("Authorization_RequestDenied", "AccessDenied")) {
                $friendlyMessage += " This indicates insufficient permissions for the operation. Review the required API permissions for the App Registration."
            }
        }
        "*System.Management.Automation.CommandNotFoundException*" {
            $friendlyMessage = "Command not found: '$($exception.CommandName)'. Ensure the required PowerShell module is installed and imported correctly."
        }
        "*System.IO.FileNotFoundException*" {
            $friendlyMessage = "File not found: '$($exception.FileName)'. Verify the path and file existence."
        }
        "*System.UnauthorizedAccessException*" {
            $friendlyMessage = "Access denied: $baseMessage. Check permissions for the target resource or operation."
            if ($invocationInfo) {
                $friendlyMessage += " Operation: $($invocationInfo.MyCommand)"
            }
        }
        "*Newtonsoft.Json.JsonReaderException*" {
            $friendlyMessage = "JSON parsing error: $baseMessage. Ensure the JSON file or string is correctly formatted."
        }
    }

    if ($invocationInfo) {
        $friendlyMessage += " Occurred in script '$($invocationInfo.ScriptName)' at line $($invocationInfo.ScriptLineNumber), command: '$($invocationInfo.Line)'."
    }
    
    Write-SafeLog -Message "Generated friendly error: $friendlyMessage" -Level "DEBUG" -Component "ErrorHelper" -Context $Context
    return $friendlyMessage
}

function Invoke-WithTimeout {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [ScriptBlock]$ScriptBlock,
        
        [Parameter(Mandatory=$false)]
        [int]$TimeoutSeconds = 60,
        
        [Parameter(Mandatory=$false)]
        [string]$TimeoutMessage = "Operation timed out",
        
        [Parameter(Mandatory=$false)]
        [string]$OperationName = "Unnamed Operation",
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context,
        
        [Parameter(Mandatory=$false)]
        [hashtable]$ArgumentList = @{}
    )
    
    Write-SafeLog -Message "Starting timeout-protected operation: '$OperationName' (Timeout: $TimeoutSeconds seconds)" -Level "DEBUG" -Component "TimeoutWrapper" -Context $Context
    
    $job = $null
    $result = $null
    
    try {
        # Start the job with any provided arguments
        if ($ArgumentList.Count -gt 0) {
            $job = Start-Job -ScriptBlock $ScriptBlock -ArgumentList $ArgumentList.Values
        } else {
            $job = Start-Job -ScriptBlock $ScriptBlock
        }
        
        Write-SafeLog -Message "Job started for operation '$OperationName' (Job ID: $($job.Id))" -Level "DEBUG" -Component "TimeoutWrapper" -Context $Context
        
        # Wait for job completion with timeout
        $completed = Wait-Job -Job $job -Timeout $TimeoutSeconds
        
        if (-not $completed) {
            # Timeout occurred
            Write-SafeLog -Message "Operation '$OperationName' timed out after $TimeoutSeconds seconds" -Level "ERROR" -Component "TimeoutWrapper" -Context $Context
            
            # Force stop and clean up the job
            Stop-Job -Job $job -Force
            Remove-Job -Job $job -Force
            
            # Create a detailed timeout exception
            $timeoutException = [System.TimeoutException]::new("$TimeoutMessage. Operation '$OperationName' exceeded the timeout of $TimeoutSeconds seconds.")
            throw $timeoutException
        }
        
        # Job completed within timeout - get the result
        Write-SafeLog -Message "Operation '$OperationName' completed within timeout" -Level "DEBUG" -Component "TimeoutWrapper" -Context $Context
        
        # Check if the job had errors
        if ($job.State -eq "Failed") {
            $jobErrors = Receive-Job -Job $job -ErrorAction SilentlyContinue -ErrorVariable jobErrorVar
            Remove-Job -Job $job -Force
            
            if ($jobErrorVar) {
                Write-SafeLog -Message "Operation '$OperationName' failed with errors: $($jobErrorVar[0].Exception.Message)" -Level "ERROR" -Component "TimeoutWrapper" -Context $Context
                throw $jobErrorVar[0]
            } else {
                throw "Operation '$OperationName' failed for unknown reasons"
            }
        }
        
        # Get the successful result
        $result = Receive-Job -Job $job
        Remove-Job -Job $job -Force
        
        Write-SafeLog -Message "Operation '$OperationName' completed successfully" -Level "SUCCESS" -Component "TimeoutWrapper" -Context $Context
        return $result
    } catch [System.TimeoutException] {
        # Re-throw timeout exceptions as-is
        throw
    } catch {
        # Handle other exceptions
        Write-SafeLog -Message "Unexpected error in timeout wrapper for operation '$OperationName': $($_.Exception.Message)" -Level "ERROR" -Component "TimeoutWrapper" -Context $Context
        
        # Clean up job if it still exists
        if ($job -and $job.State -in @("Running", "NotStarted")) {
            try {
                Stop-Job -Job $job -Force -ErrorAction SilentlyContinue
                Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
            } catch {
                Write-SafeLog -Message "Failed to clean up job for operation '$OperationName': $($_.Exception.Message)" -Level "WARN" -Component "TimeoutWrapper" -Context $Context
            }
        }
        
        throw
    }
}

function Invoke-WithTimeoutAndRetry {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [ScriptBlock]$ScriptBlock,
        
        [Parameter(Mandatory=$false)]
        [int]$TimeoutSeconds = 60,
        
        [Parameter(Mandatory=$false)]
        [int]$MaxRetries = 3,
        
        [Parameter(Mandatory=$false)]
        [int]$DelaySeconds = 5,
        
        [Parameter(Mandatory=$false)]
        [string]$OperationName = "Unnamed Operation",
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context,
        
        [Parameter(Mandatory=$false)]
        [hashtable]$ArgumentList = @{}
    )
    
    Write-SafeLog -Message "Starting timeout-protected operation with retry: '$OperationName' (Timeout: $TimeoutSeconds s, Max Retries: $MaxRetries)" -Level "DEBUG" -Component "TimeoutRetryWrapper" -Context $Context
    
    $attempt = 0
    $lastError = $null
    
    while ($attempt -lt $MaxRetries) {
        $attempt++
        try {
            Write-SafeLog -Message "Attempting '$OperationName' with timeout protection, attempt $attempt of $MaxRetries" -Level "DEBUG" -Component "TimeoutRetryWrapper" -Context $Context
            
            $result = Invoke-WithTimeout -ScriptBlock $ScriptBlock -TimeoutSeconds $TimeoutSeconds -OperationName "$OperationName (Attempt $attempt)" -Context $Context -ArgumentList $ArgumentList
            
            Write-SafeLog -Message "Operation '$OperationName' succeeded on attempt $attempt" -Level "SUCCESS" -Component "TimeoutRetryWrapper" -Context $Context
            return $result
        } catch [System.TimeoutException] {
            $lastError = $_
            Write-SafeLog -Message "Attempt $attempt for '$OperationName' timed out after $TimeoutSeconds seconds" -Level "WARN" -Component "TimeoutRetryWrapper" -Context $Context
            
            if ($attempt -ge $MaxRetries) {
                Write-SafeLog -Message "Operation '$OperationName' failed after $attempt timeout attempts" -Level "ERROR" -Component "TimeoutRetryWrapper" -Context $Context
                throw $lastError
            }
            
            Write-SafeLog -Message "Waiting $DelaySeconds seconds before retry attempt $($attempt + 1) for '$OperationName'" -Level "INFO" -Component "TimeoutRetryWrapper" -Context $Context
            Start-Sleep -Seconds $DelaySeconds
        } catch {
            $lastError = $_
            Write-SafeLog -Message "Attempt $attempt for '$OperationName' failed with non-timeout error: $($_.Exception.Message)" -Level "ERROR" -Component "TimeoutRetryWrapper" -Context $Context
            throw $lastError
        }
    }
    
    # Should not reach here, but just in case
    throw $lastError
}

function Test-OperationTimeout {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [ScriptBlock]$TestScriptBlock,
        
        [Parameter(Mandatory=$false)]
        [int]$ExpectedTimeoutSeconds = 30,
        
        [Parameter(Mandatory=$false)]
        [string]$TestName = "Timeout Test",
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    Write-SafeLog -Message "Testing timeout behavior for '$TestName' (Expected timeout: $ExpectedTimeoutSeconds s)" -Level "DEBUG" -Component "TimeoutTester" -Context $Context
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $timedOut = $false
    
    try {
        Invoke-WithTimeout -ScriptBlock $TestScriptBlock -TimeoutSeconds $ExpectedTimeoutSeconds -OperationName $TestName -Context $Context
        Write-SafeLog -Message "Test '$TestName' completed without timeout in $($stopwatch.ElapsedMilliseconds) ms" -Level "INFO" -Component "TimeoutTester" -Context $Context
    } catch [System.TimeoutException] {
        $timedOut = $true
        Write-SafeLog -Message "Test '$TestName' timed out as expected after $($stopwatch.ElapsedMilliseconds) ms" -Level "SUCCESS" -Component "TimeoutTester" -Context $Context
    } catch {
        Write-SafeLog -Message "Test '$TestName' failed with unexpected error: $($_.Exception.Message)" -Level "ERROR" -Component "TimeoutTester" -Context $Context
        throw
    } finally {
        $stopwatch.Stop()
    }
    
    return @{
        TimedOut = $timedOut
        ElapsedMilliseconds = $stopwatch.ElapsedMilliseconds
        ElapsedSeconds = [math]::Round($stopwatch.ElapsedMilliseconds / 1000, 2)
    }
}

function Write-ErrorSummary {
    param(
        [Parameter(Mandatory=$true)]
        [object]$ErrorCollector,
        [PSCustomObject]$Context
    )
    
    Write-SafeLog -Message "--- Error Summary ---" -Level "HEADER" -Component "ErrorSummary" -Context $Context
    if (-not $ErrorCollector.HasErrors()) {
        Write-SafeLog -Message "No errors recorded during this execution." -Level "SUCCESS" -Component "ErrorSummary" -Context $Context
        return
    }

    Write-SafeLog -Message "Total Errors: $($ErrorCollector.Errors.Count)" -Level "ERROR" -Component "ErrorSummary" -Context $Context
    Write-SafeLog -Message "Total Warnings: $($ErrorCollector.Warnings.Count)" -Level "WARN" -Component "ErrorSummary" -Context $Context

    $errorGroups = $ErrorCollector.Errors | Group-Object Source | Sort-Object Count -Descending
    
    Write-SafeLog -Message "Errors by Source:" -Level "INFO" -Component "ErrorSummary" -Context $Context
    foreach ($group in $errorGroups) {
        Write-SafeLog -Message ("  {0,-30}: {1} error(s)" -f $group.Name, $group.Count) -Level "INFO" -Component "ErrorSummary" -Context $Context
    }

    if ($ErrorCollector.Warnings.Count -gt 0) {
        Write-SafeLog -Message "Warnings by Source (first 5):" -Level "INFO" -Component "ErrorSummary" -Context $Context
        $ErrorCollector.Warnings | Group-Object Source | Sort-Object Count -Descending | Select-Object -First 5 | ForEach-Object {
            Write-SafeLog -Message ("  {0,-30}: {1} warning(s)" -f $_.Name, $_.Count) -Level "INFO" -Component "ErrorSummary" -Context $Context
        }
    }
}

function Test-CriticalError {
    param(
        [Parameter(Mandatory=$true)]
        [System.Management.Automation.ErrorRecord]$ErrorRecord,
        [PSCustomObject]$Context
    )
    
    if ($null -eq $ErrorRecord) { return $false }

    # Define patterns or types that are considered critical and non-retryable
    $criticalErrorPatterns = @(
        "System.OutOfMemoryException",
        "System.StackOverflowException",
        "CRITICAL:",
        "*Failed to load critical utility module*",
        "*`$global:MandA is not set*",
        "*Configuration file not found*",
        "*Failed to parse configuration file*",
        "*Core processing function .* not found*"
    )
    
    $exceptionType = $ErrorRecord.Exception.GetType().FullName
    $errorMessage = $ErrorRecord.Exception.Message

    if ($criticalErrorPatterns | Where-Object { $exceptionType -like $_ -or $errorMessage -like "*$_*" }) {
        Write-SafeLog -Message "Critical error detected: $errorMessage (Type: $exceptionType)" -Level "CRITICAL" -Component "ErrorCheck" -Context $Context
        return $true
    }
    
    # Specific check for authentication errors if haltOnConnectionError for Authentication is true
    if ($Context -and $Context.Config -and $Context.Config.environment -and $Context.Config.environment.connectivity) {
        $haltOn = $Context.Config.environment.connectivity.haltOnConnectionError
        if ($haltOn -contains "Authentication" -and $ErrorRecord.CategoryInfo.Category -eq "AuthenticationError") {
            Write-SafeLog -Message "Critical authentication error configured to halt execution: $errorMessage" -Level "CRITICAL" -Component "ErrorCheck" -Context $Context
            return $true
        }
    }

    return $false
}

# DiscoveryResult Class - Consistent error result structure for ALL modules
class DiscoveryResult {
    [bool]$Success
    [string]$ModuleName
    [object]$Data
    [System.Collections.ArrayList]$Errors
    [System.Collections.ArrayList]$Warnings
    [hashtable]$Metadata
    [datetime]$StartTime
    [datetime]$EndTime
    [string]$ExecutionId
    
    DiscoveryResult([string]$moduleName) {
        try {
            $this.ModuleName = $moduleName
            $this.StartTime = Get-Date
            $this.ExecutionId = [guid]::NewGuid().ToString()
            $this.Errors = [System.Collections.ArrayList]::new()
            $this.Warnings = [System.Collections.ArrayList]::new()
            $this.Metadata = @{}
            $this.Success = $true
        } catch {
            Write-Host "Error in function 'DiscoveryResult': $($_.Exception.Message)" -ForegroundColor Red
            throw
        }
    }
    
    [void]AddError([string]$message, [Exception]$exception, [hashtable]$context) {
        try {
            $this.Success = $false
            $errorEntry = @{
                Timestamp = Get-Date
                Message = $message
                Exception = if ($exception) { $exception.ToString() } else { $null }
                ExceptionType = if ($exception) { $exception.GetType().FullName } else { $null }
                StackTrace = if ($exception) { $exception.StackTrace } else { $null }
                Context = $context
            }
            $null = $this.Errors.Add($errorEntry)
        } catch {
            Write-Host "Error in function 'AddError': $($_.Exception.Message)" -ForegroundColor Red
            throw
        }
    }
    
    [void]AddErrorWithContext([string]$message, [System.Management.Automation.ErrorRecord]$errorRecord, [hashtable]$additionalContext) {
        try {
            $this.Success = $false
            
            if ($errorRecord) {
                $enhancedContext = Add-ErrorContext -ErrorRecord $errorRecord -Context $additionalContext
                $errorEntry = @{
                    Timestamp = Get-Date
                    Message = $message
                    EnhancedContext = $enhancedContext
                    ErrorId = $enhancedContext.ExecutionId
                }
            } else {
                $errorEntry = @{
                    Timestamp = Get-Date
                    Message = $message
                    Context = $additionalContext
                    ErrorId = [guid]::NewGuid().ToString()
                }
            }
            
            $null = $this.Errors.Add($errorEntry)
        } catch {
            Write-Host "Error in function 'AddErrorWithContext': $($_.Exception.Message)" -ForegroundColor Red
            throw
        }
    }
    
    [void]AddWarning([string]$message, [hashtable]$context) {
        try {
            $warningEntry = @{
                Timestamp = Get-Date
                Message = $message
                Context = $context
            }
            $null = $this.Warnings.Add($warningEntry)
        } catch {
            Write-Host "Error in function 'AddWarning': $($_.Exception.Message)" -ForegroundColor Red
            throw
        }
    }
    
    [void]Complete() {
        try {
            $this.EndTime = Get-Date
            $this.Metadata['Duration'] = ($this.EndTime - $this.StartTime).TotalSeconds
            $this.Metadata['ErrorCount'] = $this.Errors.Count
            $this.Metadata['WarningCount'] = $this.Warnings.Count
        } catch {
            Write-Host "Error in function 'Complete': $($_.Exception.Message)" -ForegroundColor Red
            throw
        }
    }
    
    [hashtable]ToHashtable() {
        try {
            return @{
                Success = $this.Success
                ModuleName = $this.ModuleName
                Data = $this.Data
                Errors = $this.Errors
                Warnings = $this.Warnings
                Metadata = $this.Metadata
                StartTime = $this.StartTime
                EndTime = $this.EndTime
                ExecutionId = $this.ExecutionId
            }
        } catch {
            Write-Host "Error in function 'ToHashtable': $($_.Exception.Message)" -ForegroundColor Red
            throw
        }
    }
}

# Discovery-specific retry function with standardized error handling
function Invoke-DiscoveryWithRetry {
    <#
    .SYNOPSIS
        Executes discovery operations with retry logic and standardized error handling
    .DESCRIPTION
        Provides specialized retry logic for discovery modules with exponential backoff,
        correlation ID support, and standardized DiscoveryResult output.
    .PARAMETER ScriptBlock
        The discovery script block to execute
    .PARAMETER ModuleName
        Name of the discovery module
    .PARAMETER MaxRetries
        Maximum number of retry attempts (default: 3)
    .PARAMETER DelaySeconds
        Initial delay between retries in seconds (default: 2)
    .PARAMETER ExponentialBackoff
        Whether to use exponential backoff (default: true)
    .PARAMETER Context
        Logging context with correlation ID
    .EXAMPLE
        $result = Invoke-DiscoveryWithRetry -ScriptBlock { Get-MgUser -All } -ModuleName "GraphDiscovery" -Context $context
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,
        
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$false)]
        [int]$MaxRetries = 3,
        
        [Parameter(Mandatory=$false)]
        [int]$DelaySeconds = 2,
        
        [Parameter(Mandatory=$false)]
        [switch]$ExponentialBackoff,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    $discoveryResult = New-DiscoveryResult -ModuleName $ModuleName
    $attempt = 0
    $lastError = $null
    
    Write-SafeLog -Message "[$ModuleName] Starting discovery operation with retry logic (Max: $MaxRetries)" -Level "INFO" -Component $ModuleName -Context $Context
    
    while ($attempt -lt $MaxRetries) {
        $attempt++
        
        try {
            Write-SafeLog -Message "[$ModuleName] Discovery attempt $attempt of $MaxRetries" -Level "DEBUG" -Component $ModuleName -Context $Context
            
            # Execute the discovery operation
            $result = & $ScriptBlock
            $discoveryResult.Data = $result
            $discoveryResult.Complete()
            
            Write-SafeLog -Message "[$ModuleName] Discovery completed successfully on attempt $attempt" -Level "SUCCESS" -Component $ModuleName -Context $Context
            return $discoveryResult
            
        } catch {
            $lastError = $_
            $errorType = $_.Exception.GetType().Name
            
            # Add error to discovery result
            $discoveryResult.AddErrorWithContext(
                "Discovery attempt $attempt failed: $($_.Exception.Message)",
                $_,
                @{
                    AttemptNumber = $attempt
                    MaxRetries = $MaxRetries
                    ModuleName = $ModuleName
                    CorrelationId = if ($Context -and $Context.CorrelationId) { $Context.CorrelationId } else { $null }
                }
            )
            
            Write-SafeLog -Message "[$ModuleName] Attempt $attempt failed: $($_.Exception.Message)" -Level "WARN" -Component $ModuleName -Context $Context
            
            # Check if this is a retryable error
            $retryableErrors = @('TimeoutException', 'HttpRequestException', 'SocketException', 'WebException')
            $isRetryable = $retryableErrors -contains $errorType -or
                          $_.Exception.Message -match 'timeout|throttle|rate limit|service unavailable|temporary'
            
            # Check for critical errors that should not be retried
            if (Test-CriticalError -ErrorRecord $_ -Context $Context) {
                Write-SafeLog -Message "[$ModuleName] Critical error detected, stopping retries" -Level "ERROR" -Component $ModuleName -Context $Context
                break
            }
            
            if ($attempt -ge $MaxRetries -or -not $isRetryable) {
                Write-SafeLog -Message "[$ModuleName] No more retries or error not retryable" -Level "ERROR" -Component $ModuleName -Context $Context
                break
            }
            
            # Calculate delay with exponential backoff
            $delay = if ($ExponentialBackoff) {
                $DelaySeconds * [Math]::Pow(2, $attempt - 1)
            } else {
                $DelaySeconds
            }
            
            Write-SafeLog -Message "[$ModuleName] Retrying in $delay seconds..." -Level "INFO" -Component $ModuleName -Context $Context
            Start-Sleep -Seconds $delay
        }
    }
    
    # All retries failed
    $discoveryResult.Complete()
    Write-SafeLog -Message "[$ModuleName] Discovery failed after $attempt attempts" -Level "ERROR" -Component $ModuleName -Context $Context
    
    return $discoveryResult
}

# Output path validation function
function Test-OutputPathValidation {
    <#
    .SYNOPSIS
        Validates and ensures output paths exist for discovery modules
    .DESCRIPTION
        Standardized output path validation that creates directories if needed
        and validates write permissions.
    .PARAMETER OutputPath
        The output path to validate
    .PARAMETER ModuleName
        Name of the module requesting validation
    .PARAMETER Context
        Logging context
    .EXAMPLE
        $isValid = Test-OutputPathValidation -OutputPath "C:\Discovery\Output" -ModuleName "GraphDiscovery" -Context $context
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$OutputPath,
        
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    try {
        Write-SafeLog -Message "[$ModuleName] Validating output path: $OutputPath" -Level "DEBUG" -Component $ModuleName -Context $Context
        
        # Check if path exists
        if (-not (Test-Path $OutputPath)) {
            Write-SafeLog -Message "[$ModuleName] Output path does not exist, creating: $OutputPath" -Level "INFO" -Component $ModuleName -Context $Context
            
            try {
                New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
                Write-SafeLog -Message "[$ModuleName] Successfully created output directory: $OutputPath" -Level "SUCCESS" -Component $ModuleName -Context $Context
            } catch {
                Write-SafeLog -Message "[$ModuleName] Failed to create output directory: $($_.Exception.Message)" -Level "ERROR" -Component $ModuleName -Context $Context
                return $false
            }
        }
        
        # Test write permissions by creating a temporary file
        $testFile = Join-Path $OutputPath "test_write_permissions_$([guid]::NewGuid().ToString().Substring(0,8)).tmp"
        
        try {
            "test" | Out-File -FilePath $testFile -Force
            Remove-Item -Path $testFile -Force -ErrorAction SilentlyContinue
            Write-SafeLog -Message "[$ModuleName] Output path validation successful: $OutputPath" -Level "DEBUG" -Component $ModuleName -Context $Context
            return $true
        } catch {
            Write-SafeLog -Message "[$ModuleName] No write permissions for output path: $OutputPath - $($_.Exception.Message)" -Level "ERROR" -Component $ModuleName -Context $Context
            return $false
        }
        
    } catch {
        Write-SafeLog -Message "[$ModuleName] Output path validation failed: $($_.Exception.Message)" -Level "ERROR" -Component $ModuleName -Context $Context
        return $false
    }
}

# Export the class constructor as a function
function New-DiscoveryResult {
    param([string]$ModuleName)
    return [DiscoveryResult]::new($ModuleName)
}

# Export all functions
Export-ModuleMember -Function @(
    'Invoke-WithRetry',
    'Get-FriendlyErrorMessage',
    'Write-ErrorSummary',
    'Test-CriticalError',
    'Invoke-WithTimeout',
    'Invoke-WithTimeoutAndRetry',
    'Test-OperationTimeout',
    'Add-ErrorContext',
    'New-EnhancedErrorRecord',
    'Export-ErrorContext',
    'New-DiscoveryResult',
    'Get-ModuleContext',
    'Write-SafeLog',
    'Invoke-SafeModuleExecution',
    'Invoke-DiscoveryWithRetry',
    'Test-OutputPathValidation'
)

Write-Host "[ErrorHandling.psm1] Module loaded successfully." -ForegroundColor Green
