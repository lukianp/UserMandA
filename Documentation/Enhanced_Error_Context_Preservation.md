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
# Enhanced Error Context Preservation Implementation

## Overview

The M&A Discovery Suite now includes comprehensive error context preservation functionality that captures detailed debugging information whenever errors occur. This enhancement significantly improves troubleshooting capabilities by providing rich contextual information about errors, including environment details, script execution context, and custom operation-specific data.

## Key Features

### 1. Enhanced Error Context Capture
- **Comprehensive Error Information**: Captures exception details, stack traces, and inner exceptions
- **Environment Context**: Records system information, PowerShell version, user context, and execution environment
- **Script Context**: Includes file names, line numbers, command details, and module information
- **Call Stack Analysis**: Provides complete PowerShell call stack for deep debugging
- **Custom Context**: Allows addition of operation-specific context data

### 2. Structured Error Storage
- **DiscoveryResult Integration**: Enhanced error handling in the existing DiscoveryResult class
- **Global Error Store**: Centralized storage for enhanced error contexts
- **JSON Export**: Capability to export error contexts for detailed analysis

### 3. Retry Mechanism Enhancement
- **Context-Aware Retries**: Retry operations now capture enhanced context for each attempt
- **Failure Analysis**: Detailed information about why operations failed and retry decisions

## Implementation Details

### Core Functions

#### `Add-ErrorContext`
Captures comprehensive error context for debugging purposes.

```powershell
$enhancedError = Add-ErrorContext -ErrorRecord $_ -Context @{
    Operation = "UserDiscovery"
    TenantId = $tenantId
    UserId = $userId
} -LoggingContext $context
```

**Parameters:**
- `ErrorRecord`: The PowerShell ErrorRecord to enhance
- `Context`: Additional context information (hashtable)
- `IncludeEnvironment`: Whether to include environment information (default: true)
- `IncludeScriptInfo`: Whether to include script information (default: true)
- `LoggingContext`: Context for logging operations

**Returns:** Enhanced error object with comprehensive context information

#### `New-EnhancedErrorRecord`
Creates a new ErrorRecord with enhanced context information.

```powershell
$enhancedError = New-EnhancedErrorRecord -Exception $_.Exception -ErrorId "GraphAPI_UserQuery" -ErrorCategory "InvalidOperation" -Context @{ UserId = $userId }
```

**Parameters:**
- `Exception`: The exception to wrap
- `ErrorId`: Unique identifier for the error
- `ErrorCategory`: PowerShell error category
- `TargetObject`: Object being processed when error occurred
- `Context`: Additional context information
- `LoggingContext`: Context for logging operations

#### `Export-ErrorContext`
Exports error context information to JSON files for analysis.

```powershell
$exportPath = Export-ErrorContext -EnhancedError $enhancedError -OutputPath "C:\Logs\Errors"
```

**Parameters:**
- `EnhancedError`: The enhanced error object to export
- `OutputPath`: Directory to save the error context file
- `IncludeTimestamp`: Whether to include timestamp in filename (default: true)
- `LoggingContext`: Context for logging operations

### Enhanced DiscoveryResult Class

#### `AddErrorWithContext` Method
New method that integrates enhanced error context capture with the existing DiscoveryResult class.

```powershell
$discoveryResult = [DiscoveryResult]::new("ModuleName")
$discoveryResult.AddErrorWithContext(
    "Operation failed",
    $errorRecord,
    @{ OperationContext = "Additional details" }
)
```

## Error Context Structure

The enhanced error context includes the following information:

```json
{
    "Timestamp": "2025-06-06 01:30:00.123",
    "ExecutionId": "12345678-1234-1234-1234-123456789012",
    "Error": {
        "Message": "Error message",
        "Type": "System.Exception.Type",
        "StackTrace": "Stack trace information",
        "TargetObject": "Object being processed",
        "CategoryInfo": "Error category",
        "FullyQualifiedErrorId": "Unique error identifier",
        "InnerException": {
            "Message": "Inner exception message",
            "Type": "Inner exception type",
            "StackTrace": "Inner exception stack trace"
        }
    },
    "Context": {
        "Operation": "Custom operation context",
        "TenantId": "Tenant identifier",
        "UserId": "User identifier"
    },
    "Environment": {
        "Computer": "Computer name",
        "User": "Current user",
        "Domain": "User domain",
        "PowerShellVersion": "PowerShell version",
        "PSEdition": "PowerShell edition",
        "OSVersion": "Operating system version",
        "ProcessId": "Process ID",
        "SessionId": "Session identifier",
        "WorkingDirectory": "Current directory",
        "ExecutionPolicy": "PowerShell execution policy",
        "Culture": "System culture",
        "UICulture": "UI culture"
    },
    "ScriptInfo": {
        "ScriptName": "Script file name",
        "LineNumber": "Line number where error occurred",
        "OffsetInLine": "Character offset in line",
        "Command": "Command that caused the error",
        "CommandName": "Command name",
        "CommandType": "Command type",
        "ModuleName": "Module name",
        "PositionMessage": "Position message"
    },
    "CallStack": [
        {
            "Command": "Function name",
            "Location": "File location",
            "FunctionName": "Function name",
            "ScriptName": "Script name",
            "ScriptLineNumber": "Line number",
            "Arguments": "Function arguments"
        }
    ],
    "LoadedModules": [
        {
            "Name": "Module name",
            "Version": "Module version",
            "ModuleType": "Module type",
            "Path": "Module path"
        }
    ]
}
```

## Integration with Existing Functions

### Retry Operations
The `Invoke-WithRetry` function now captures enhanced error context for each failed attempt:

```powershell
$result = Invoke-WithRetry -ScriptBlock {
    # Operation that might fail
} -OperationName "GraphAPIQuery" -Context $context
```

Each retry attempt now includes:
- Operation name and attempt number
- Maximum retries and delay configuration
- Retryable error types
- Enhanced error context for debugging

### Timeout Operations
Timeout-protected operations maintain enhanced context:

```powershell
$result = Invoke-WithTimeout -ScriptBlock {
    # Long-running operation
} -TimeoutSeconds 60 -OperationName "DataProcessing" -Context $context
```

## Usage Examples

### Basic Error Context Capture
```powershell
try {
    # Some operation that might fail
    Get-Content "C:\NonExistent\File.txt"
} catch {
    $enhancedError = Add-ErrorContext -ErrorRecord $_ -Context @{
        Operation = "FileDiscovery"
        TargetPath = "C:\NonExistent\File.txt"
        DiscoveryModule = "FileServerDiscovery"
    }
    
    # Export for analysis
    Export-ErrorContext -EnhancedError $enhancedError -OutputPath ".\ErrorLogs"
}
```

### DiscoveryResult Integration
```powershell
$discoveryResult = [DiscoveryResult]::new("GraphDiscovery")

try {
    # Graph API operation
    $users = Get-MgUser -All
} catch {
    $discoveryResult.AddErrorWithContext(
        "Failed to retrieve users from Microsoft Graph",
        $_,
        @{
            GraphEndpoint = "https://graph.microsoft.com/v1.0/users"
            RequestedPermissions = @("User.Read.All")
            TenantId = $tenantId
        }
    )
}
```

### Retry with Enhanced Context
```powershell
$result = Invoke-WithRetry -ScriptBlock {
    # Network operation that might be retryable
    Invoke-RestMethod -Uri $apiEndpoint -Headers $headers
} -MaxRetries 3 -DelaySeconds 5 -OperationName "APICall" -Context $context -RetryableErrorTypes @(
    "System.Net.WebException",
    "System.Net.Http.HttpRequestException"
)
```

## Testing

Use the provided test script to verify the enhanced error context preservation functionality:

```powershell
.\Scripts\Test-ErrorContextPreservation.ps1 -OutputPath ".\ErrorLogs" -ExportErrors
```

This test script demonstrates:
- Basic error context capture
- DiscoveryResult enhanced error handling
- Retry mechanism with enhanced context
- Enhanced ErrorRecord creation
- Timeout operations with enhanced context

## Benefits

1. **Improved Debugging**: Comprehensive context information makes it easier to diagnose and fix issues
2. **Better Error Tracking**: Unique execution IDs and structured data enable better error correlation
3. **Enhanced Monitoring**: Rich error context supports better monitoring and alerting
4. **Troubleshooting Support**: Detailed environment and execution context aids in support scenarios
5. **Audit Trail**: Complete error history with context for compliance and analysis

## Best Practices

1. **Use Appropriate Context**: Include relevant operation-specific context in the Context parameter
2. **Export Critical Errors**: Use Export-ErrorContext for errors that require detailed analysis
3. **Leverage DiscoveryResult**: Use AddErrorWithContext method for module-level error handling
4. **Monitor Error Patterns**: Analyze exported error contexts to identify common failure patterns
5. **Clean Up Error Logs**: Implement log rotation for exported error context files

## File Locations

- **Enhanced ErrorHandling Module**: `Modules/Utilities/ErrorHandling.psm1`
- **Test Script**: `Scripts/Test-ErrorContextPreservation.ps1`
- **Documentation**: `Documentation/Enhanced_Error_Context_Preservation.md`

## Version History

- **v1.0.0** (2025-06-06): Initial implementation of enhanced error context preservation
  - Added Add-ErrorContext function
  - Added New-EnhancedErrorRecord function
  - Added Export-ErrorContext function
  - Enhanced DiscoveryResult class with AddErrorWithContext method
  - Integrated enhanced context capture with retry mechanisms
  - Created comprehensive test suite