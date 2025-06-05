# -*- coding: utf-8-bom -*-
#Requires -Version 5.1
<#
.SYNOPSIS
    Provides standardized error handling and retry mechanisms for the M&A Discovery Suite.
.DESCRIPTION
    This module includes functions to invoke script blocks with retry logic,
    get user-friendly error messages, and manage error summaries. It integrates
    with the EnhancedLogging module for output.
.NOTES
    Version: 1.0.0
    Author: M&A Discovery Suite Team
    Date: 2025-06-05

    Key Design Points:
    - Uses Write-MandALog for logging (assumes EnhancedLogging.psm1 is loaded).
    - Relies on $global:MandA or a passed -Context for logging context.
    - Retry logic is configurable via $global:MandA.Config.environment.
#>

Export-ModuleMember -Function Invoke-WithRetry, Get-FriendlyErrorMessage, Write-ErrorSummary, Test-CriticalError

function Invoke-WithRetry {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,

        [Parameter(Mandatory=$false)]
        [int]$MaxRetries = -1, # Default to value from config or 3

        [Parameter(Mandatory=$false)]
        [int]$DelaySeconds = -1, # Default to value from config or 5

        [Parameter(Mandatory=$false)]
        [string]$OperationName = "Unnamed Operation",

        [Parameter(Mandatory=$false)]
        [string[]]$RetryableErrorTypes, # Specific exception types that should trigger a retry

        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For logging and configuration access
    )

    # Determine effective MaxRetries and DelaySeconds from context/config or defaults
    $effectiveMaxRetries = $MaxRetries
    $effectiveDelaySeconds = $DelaySeconds
    $effectiveConfig = $Context.Config | Global:Get-OrElse $script:LoggingConfig.DefaultContext.Config | Global:Get-OrElse $global:MandA.Config

    if ($effectiveMaxRetries -lt 0) {
        $effectiveMaxRetries = $effectiveConfig.environment.maxRetries | global:Get-OrElse 3
    }
    if ($effectiveDelaySeconds -lt 0) {
        # Assuming a retryDelaySeconds might be in connectivity or a general environment setting
        $effectiveDelaySeconds = $effectiveConfig.environment.connectivity.retryDelaySeconds | global:Get-OrElse $effectiveConfig.environment.retryDelaySeconds | global:Get-OrElse 5
    }

    Write-MandALog -Message "Attempting operation: '$OperationName'. Max Retries: $effectiveMaxRetries, Delay: $effectiveDelaySeconds s." -Level "DEBUG" -Component "RetryWrapper" -Context $Context

    $attempt = 0
    $lastError = $null
    $operationSuccessful = $false
    $result = $null

    while ($attempt -lt $effectiveMaxRetries) {
        $attempt++
        try {
            Write-MandALog -Message "Executing '$OperationName', Attempt: $attempt of $effectiveMaxRetries..." -Level "DEBUG" -Component "RetryWrapper" -Context $Context
            $result = & $ScriptBlock
            $operationSuccessful = $true
            Write-MandALog -Message "Operation '$OperationName' succeeded on attempt $attempt." -Level "SUCCESS" -Component "RetryWrapper" -Context $Context
            break 
        } catch {
            $lastError = $_ # Capture the terminating error
            $errorType = $_.Exception.GetType().FullName
            $errorMessage = $_.Exception.Message

            Write-MandALog -Message "Attempt $attempt for '$OperationName' failed. Error: $errorMessage (Type: $errorType)" -Level "WARN" -Component "RetryWrapper" -Context $Context

            # Check if this error type is specifically retryable
            $isRetryableBySpecificType = $false
            if ($null -ne $RetryableErrorTypes -and $RetryableErrorTypes.Count -gt 0) {
                if ($RetryableErrorTypes -contains $errorType) {
                    $isRetryableBySpecificType = $true
                    Write-MandALog -Message "Error type '$errorType' is in the list of retryable errors for '$OperationName'." -Level "DEBUG" -Component "RetryWrapper" -Context $Context
                }
            } else {
                # If no specific retryable types are given, assume most errors are retryable up to MaxRetries
                # unless it's a known non-retryable critical error (handled by Test-CriticalError if needed by caller)
                $isRetryableBySpecificType = $true # Default to retry if no specific list
            }

            if ($attempt -ge $effectiveMaxRetries -or -not $isRetryableBySpecificType) {
                Write-MandALog -Message "Operation '$OperationName' failed after $attempt attempt(s). Error: $errorMessage. No more retries or error not retryable." -Level "ERROR" -Component "RetryWrapper" -Context $Context
                # Re-throw the last error to be caught by the caller
                throw $lastError 
            }

            $waitTime = $effectiveDelaySeconds * $attempt # Exponential backoff can be added here if desired (e.g., $effectiveDelaySeconds * (2 ** ($attempt -1)))
            Write-MandALog -Message "Waiting $waitTime seconds before retrying '$OperationName' (Attempt $($attempt + 1))..." -Level "INFO" -Component "RetryWrapper" -Context $Context
            Start-Sleep -Seconds $waitTime
        }
    } # End while

    if ($operationSuccessful) {
        return $result
    } else {
        # Should have been re-thrown in the catch block if all retries failed
        # This is a fallback, but the 'throw $lastError' in catch should handle it.
        Write-MandALog -Message "Operation '$OperationName' ultimately failed after all retries." -Level "ERROR" -Component "RetryWrapper" -Context $Context
        throw "Operation '$OperationName' failed after $effectiveMaxRetries attempts. Last Error: $($lastError.Exception.Message)"
    }
}

function Get-FriendlyErrorMessage {
    [CmdletBinding()]
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
            $oDataError = $exception.Error # Assuming this structure from Graph SDK
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
    
    Write-MandALog -Message "Generated friendly error: $friendlyMessage" -Level "DEBUG" -Component "ErrorHelper" -Context $Context
    return $friendlyMessage
}

function Write-ErrorSummary {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [DiscoveryErrorCollector]$ErrorCollector, # Expects the Orchestrator's ErrorCollector
        [PSCustomObject]$Context
    )
    
    Write-MandALog -Message "--- Error Summary ---" -Level "HEADER" -Component "ErrorSummary" -Context $Context
    if (-not $ErrorCollector.HasErrors()) {
        Write-MandALog -Message "No errors recorded during this execution." -Level "SUCCESS" -Component "ErrorSummary" -Context $Context
        return
    }

    Write-MandALog -Message "Total Errors: $($ErrorCollector.Errors.Count)" -Level "ERROR" -Component "ErrorSummary" -Context $Context
    Write-MandALog -Message "Total Warnings: $($ErrorCollector.Warnings.Count)" -Level "WARN" -Component "ErrorSummary" -Context $Context

    $errorGroups = $ErrorCollector.Errors | Group-Object Source | Sort-Object Count -Descending
    
    Write-MandALog -Message "Errors by Source:" -Level "INFO" -Component "ErrorSummary" -Context $Context
    foreach ($group in $errorGroups) {
        Write-MandALog -Message ("  {0,-30} : {1} error(s)" -f $group.Name, $group.Count) -Level "INFO" -Component "ErrorSummary" -Context $Context
        # Optionally list a few example messages for each source
        # $group.Group | Select-Object -First 2 | ForEach-Object { Write-MandALog -Message ("    - $($_.Message -replace "`r|`n"," ")" ) -Level "DEBUG" -Component "ErrorSummary" -Context $Context }
    }

    if ($ErrorCollector.Warnings.Count -gt 0) {
        Write-MandALog -Message "Warnings by Source (first 5):" -Level "INFO" -Component "ErrorSummary" -Context $Context
        $ErrorCollector.Warnings | Group-Object Source | Sort-Object Count -Descending | Select-Object -First 5 | ForEach-Object {
            Write-MandALog -Message ("  {0,-30} : {1} warning(s)" -f $_.Name, $_.Count) -Level "INFO" -Component "ErrorSummary" -Context $Context
        }
    }
    # The Orchestrator's Complete-MandADiscovery function handles exporting the full error report.
}

function Test-CriticalError {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [System.Management.Automation.ErrorRecord]$ErrorRecord,
        [PSCustomObject]$Context # For logging context if needed
    )
    if ($null -eq $ErrorRecord) { return $false }

    # Define patterns or types that are considered critical and non-retryable
    $criticalErrorPatterns = @(
        "System.OutOfMemoryException",
        "System.StackOverflowException",
        "CRITICAL:", # If our own messages mark themselves as critical
        "*Failed to load critical utility module*", # Example from Initialize-MandAEnvironment
        "*`\$global:MandA is not set*",
        "*Configuration file not found*",
        "*Failed to parse configuration file*",
        "*Core processing function .* not found*" 
    )
    
    $exceptionType = $ErrorRecord.Exception.GetType().FullName
    $errorMessage = $ErrorRecord.Exception.Message

    if ($criticalErrorPatterns | Where-Object { $exceptionType -like $_ -or $errorMessage -like "*$_*" }) {
        Write-MandALog -Message "Critical error detected: $errorMessage (Type: $exceptionType)" -Level "CRITICAL" -Component "ErrorCheck" -Context $Context
        return $true
    }
    
    # Specific check for authentication errors if haltOnConnectionError for Authentication is true
    if ($Context -and $Context.Config -and $Context.Config.environment -and $Context.Config.environment.connectivity) {
        $haltOn = $Context.Config.environment.connectivity.haltOnConnectionError | global:Get-OrElse @()
        if ($haltOn -contains "Authentication" -and $ErrorRecord.CategoryInfo.Category -eq "AuthenticationError") {
             Write-MandALog -Message "Critical authentication error configured to halt execution: $errorMessage" -Level "CRITICAL" -Component "ErrorCheck" -Context $Context
            return $true
        }
    }

    return $false
}

Write-Host "[ErrorHandling.psm1] Module loaded." -ForegroundColor DarkGray

