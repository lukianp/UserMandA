<!--
Author: Lukian Poleschtschuk
Version: 1.0.0
Created: 2025-06-06
Last Modified: 2025-06-06
Change Log: Updated version control header
-->
<!--
Author: Lukian Poleschtschuk
Version: 1.0.0
Created: 2025-06-06
Last Modified: 2025-06-06
Change Log: Initial version - any future changes require version increment
-->
# Timeout Handling Implementation

## Overview

The M&A Discovery Suite now includes comprehensive timeout handling to prevent hung operations and improve system reliability. This implementation provides multiple layers of timeout protection with integrated logging and error handling.

## Features Added

### 1. Core Timeout Function: `Invoke-WithTimeout`

**Purpose**: Executes script blocks with configurable timeout protection using PowerShell jobs.

**Key Features**:
- Configurable timeout duration (default: 60 seconds)
- Integrated logging with the existing MandA logging framework
- Proper job cleanup to prevent resource leaks
- Support for passing arguments to script blocks
- Detailed error reporting with operation context

**Parameters**:
- `ScriptBlock` (Mandatory): The code to execute with timeout protection
- `TimeoutSeconds` (Optional): Timeout duration in seconds (default: 60)
- `TimeoutMessage` (Optional): Custom timeout error message
- `OperationName` (Optional): Name for logging and error reporting
- `Context` (Optional): Logging context object
- `ArgumentList` (Optional): Arguments to pass to the script block

**Example Usage**:
```powershell
$result = Invoke-WithTimeout -ScriptBlock {
    # Long-running operation
    Get-ADUser -Filter * -Properties *
} -TimeoutSeconds 120 -OperationName "AD User Discovery" -Context $discoveryContext
```

### 2. Combined Timeout and Retry: `Invoke-WithTimeoutAndRetry`

**Purpose**: Combines timeout protection with retry logic for operations that may fail due to temporary issues.

**Key Features**:
- Multiple retry attempts with timeout protection on each attempt
- Configurable retry count and delay between attempts
- Distinguishes between timeout errors and other failures
- Integrated with existing retry mechanisms

**Parameters**:
- All parameters from `Invoke-WithTimeout`
- `MaxRetries` (Optional): Maximum number of retry attempts (default: 3)
- `DelaySeconds` (Optional): Delay between retry attempts (default: 5)

**Example Usage**:
```powershell
$result = Invoke-WithTimeoutAndRetry -ScriptBlock {
    Connect-MgGraph -Scopes "User.Read.All"
    Get-MgUser -All
} -TimeoutSeconds 60 -MaxRetries 3 -DelaySeconds 10 -OperationName "Graph User Retrieval"
```

### 3. Timeout Testing: `Test-OperationTimeout`

**Purpose**: Validates timeout behavior for testing and debugging purposes.

**Key Features**:
- Tests whether operations timeout as expected
- Measures actual execution time
- Returns detailed timing information
- Useful for performance testing and validation

**Parameters**:
- `TestScriptBlock` (Mandatory): Script block to test for timeout behavior
- `ExpectedTimeoutSeconds` (Optional): Expected timeout duration (default: 30)
- `TestName` (Optional): Name for the test operation
- `Context` (Optional): Logging context

**Example Usage**:
```powershell
$testResult = Test-OperationTimeout -TestScriptBlock {
    Start-Sleep -Seconds 45  # Should timeout at 30 seconds
} -ExpectedTimeoutSeconds 30 -TestName "Sleep Timeout Test"

if ($testResult.TimedOut) {
    Write-Host "Test passed: Operation timed out after $($testResult.ElapsedSeconds) seconds"
}
```

## Integration with Existing Framework

### Logging Integration

All timeout functions integrate with the existing `Write-MandALog` function:
- DEBUG level: Operation start, job creation, completion
- INFO level: Retry attempts, wait periods
- WARN level: Timeout occurrences, retry failures
- ERROR level: Final failures, cleanup issues
- SUCCESS level: Successful completions

### Error Handling Integration

- Timeout exceptions are properly typed as `[System.TimeoutException]`
- Integration with existing `Get-FriendlyErrorMessage` function
- Proper error context preservation
- Clean job resource management

### Configuration Integration

Timeout functions respect existing configuration patterns:
- Default values can be overridden via context configuration
- Integrates with retry configuration settings
- Supports environment-specific timeout values

## Implementation Details

### Job-Based Execution

The timeout implementation uses PowerShell background jobs:
- Isolates long-running operations from the main thread
- Enables true timeout enforcement
- Provides clean cancellation capabilities
- Prevents hung operations from blocking the entire suite

### Resource Management

Proper cleanup ensures no resource leaks:
- Jobs are always cleaned up, even on exceptions
- Force-stop capabilities for hung jobs
- Error handling for cleanup failures
- Logging of cleanup operations

### Error Handling Flow

1. **Normal Completion**: Job completes within timeout, result returned
2. **Timeout**: Job exceeds timeout, force-stopped, TimeoutException thrown
3. **Job Failure**: Job fails internally, original exception preserved and re-thrown
4. **Cleanup Failure**: Best-effort cleanup with warning logging

## Usage Patterns

### Discovery Module Integration

```powershell
function Get-AzureUsers {
    param($Context)
    
    try {
        $users = Invoke-WithTimeoutAndRetry -ScriptBlock {
            Connect-MgGraph -Identity
            Get-MgUser -All -Property DisplayName,UserPrincipalName,Department
        } -TimeoutSeconds 300 -MaxRetries 2 -OperationName "Azure User Discovery" -Context $Context
        
        return $users
    } catch [System.TimeoutException] {
        Write-MandALog -Message "Azure user discovery timed out" -Level "ERROR" -Context $Context
        throw
    }
}
```

### File Operations

```powershell
function Export-LargeDataset {
    param($Data, $FilePath, $Context)
    
    $result = Invoke-WithTimeout -ScriptBlock {
        $Data | Export-Csv -Path $FilePath -NoTypeInformation
    } -TimeoutSeconds 180 -OperationName "Large Dataset Export" -Context $Context
    
    return $result
}
```

### Network Operations

```powershell
function Test-RemoteConnectivity {
    param($ComputerName, $Context)
    
    $result = Invoke-WithTimeoutAndRetry -ScriptBlock {
        Test-NetConnection -ComputerName $ComputerName -Port 443
    } -TimeoutSeconds 30 -MaxRetries 3 -DelaySeconds 5 -OperationName "Connectivity Test" -Context $Context
    
    return $result
}
```

## Testing

A comprehensive test script is provided at `Scripts/Test-TimeoutHandling.ps1`:

```powershell
# Run all timeout tests
.\Scripts\Test-TimeoutHandling.ps1

# Run specific test types
.\Scripts\Test-TimeoutHandling.ps1 -TestType Basic -TimeoutSeconds 10
.\Scripts\Test-TimeoutHandling.ps1 -TestType Retry -TimeoutSeconds 5
.\Scripts\Test-TimeoutHandling.ps1 -TestType Testing -TimeoutSeconds 15
```

## Best Practices

### Timeout Duration Selection

- **Quick Operations** (< 30 seconds): 60-120 second timeout
- **Medium Operations** (30 seconds - 5 minutes): 300-600 second timeout  
- **Long Operations** (> 5 minutes): 900-1800 second timeout
- **Critical Operations**: Consider using retry with shorter individual timeouts

### Error Handling

```powershell
try {
    $result = Invoke-WithTimeout -ScriptBlock $operation -TimeoutSeconds 120
} catch [System.TimeoutException] {
    # Handle timeout specifically
    Write-MandALog -Message "Operation timed out, may need manual intervention" -Level "ERROR"
    # Possibly queue for later retry or manual review
} catch {
    # Handle other errors
    Write-MandALog -Message "Operation failed: $($_.Exception.Message)" -Level "ERROR"
}
```

### Performance Considerations

- Job creation has overhead (~100-500ms), avoid for very quick operations
- Use appropriate timeout values to balance responsiveness vs. completion
- Consider using `Invoke-WithTimeoutAndRetry` for network-dependent operations
- Monitor job cleanup to ensure no resource leaks

## Configuration Examples

### Module-Level Configuration

```json
{
  "environment": {
    "timeouts": {
      "default": 60,
      "discovery": 300,
      "export": 600,
      "authentication": 120
    },
    "retries": {
      "maxAttempts": 3,
      "delaySeconds": 5
    }
  }
}
```

### Context-Aware Usage

```powershell
$timeoutSeconds = $Context.Config.environment.timeouts.discovery ?? 300
$result = Invoke-WithTimeout -ScriptBlock $discoveryOperation -TimeoutSeconds $timeoutSeconds -Context $Context
```

## Troubleshooting

### Common Issues

1. **Jobs Not Cleaning Up**: Check for exceptions in cleanup code, review logs
2. **Timeouts Too Short**: Monitor actual operation durations, adjust accordingly
3. **Memory Usage**: Long-running jobs may consume memory, ensure proper cleanup
4. **Permission Issues**: Jobs run in separate context, may need explicit credential passing

### Debugging

Enable verbose logging to track timeout behavior:
```powershell
$VerbosePreference = "Continue"
Invoke-WithTimeout -ScriptBlock $operation -Verbose
```

## Future Enhancements

Potential improvements for future versions:
- Configurable exponential backoff for retries
- Timeout escalation (warning before timeout)
- Async/await pattern support
- Integration with PowerShell 7+ features
- Timeout statistics and reporting
- Automatic timeout adjustment based on historical performance