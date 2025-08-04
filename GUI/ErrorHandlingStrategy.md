# Error Handling Strategy for M&A Discovery Suite

## Overview

This document outlines the consistent error handling strategy implemented across the M&A Discovery Suite application. The strategy is centered around the `ErrorHandlingService` which provides standardized error logging, user notification, and status message generation.

## Core Principles

1. **Centralized Error Management**: All error handling goes through `ErrorHandlingService.Instance`
2. **Consistent User Experience**: Standard error message formats and user notifications
3. **Comprehensive Logging**: All errors are logged with context and timestamp
4. **Graceful Degradation**: Operations continue where possible, with appropriate fallbacks
5. **Developer Friendly**: Clear context and stack traces for debugging

## ErrorHandlingService Usage

### Basic Exception Handling

```csharp
try
{
    // Risky operation
    await SomeAsyncOperation();
}
catch (Exception ex)
{
    StatusMessage = ErrorHandlingService.Instance.HandleException(ex, "Operation context");
}
```

### Exception Handling with User Dialog

```csharp
try
{
    // Risky operation
    await SomeAsyncOperation();
}
catch (Exception ex)
{
    ErrorHandlingService.Instance.HandleException(ex, "Operation context", showToUser: true);
}
```

### Async Operations with Automatic Error Handling

```csharp
var result = await ErrorHandlingService.Instance.ExecuteWithErrorHandling(
    async () => await SomeAsyncOperation(),
    "Operation description",
    onSuccess: () => StatusMessage = "Success!",
    onError: (message) => StatusMessage = message
);

if (result.IsSuccess)
{
    // Handle success
}
```

### Operations with Return Values

```csharp
var result = await ErrorHandlingService.Instance.ExecuteWithErrorHandling(
    async () => await GetDataAsync(),
    "Loading data",
    onSuccess: (data) => ProcessData(data),
    onError: (message) => StatusMessage = message
);

if (result.IsSuccess)
{
    var data = result.Data;
    // Use the data
}
```

### Validation Errors

```csharp
var validationErrors = ValidateInput(input);
if (validationErrors.Any())
{
    StatusMessage = ErrorHandlingService.Instance.HandleValidationErrors(validationErrors, "Input validation");
    return;
}
```

### Operation Cancellation

```csharp
try
{
    await LongRunningOperation(cancellationToken);
}
catch (OperationCanceledException)
{
    StatusMessage = ErrorHandlingService.Instance.HandleCancellation("Long running operation");
}
```

## Error Message Standards

### Status Message Format

- **Success**: "{Operation} completed successfully"
- **General Error**: "{Operation} failed: {Error message}"
- **Specific Errors**: 
  - Access denied: "{Operation} failed: Access denied"
  - File not found: "{Operation} failed: Required file not found"
  - Invalid input: "{Operation} failed: Invalid input provided"
  - Timeout: "{Operation} failed: Operation timed out"

### Logging Format

```
[ERROR] 2023-08-04 14:30:25 - Operation context: Error message (ExceptionType)
[WARNING] 2023-08-04 14:30:25 - Warning context: Warning message
[INFO] 2023-08-04 14:30:25 - Info context: Info message
```

## Context Guidelines

Provide meaningful context strings that describe:
1. **What operation was being performed**
2. **Which component/service was involved**
3. **Any relevant parameters or state**

### Good Context Examples

- "Loading company profiles"
- "Exporting discovery results to CSV"
- "Azure AD user discovery"
- "Profile import from file"
- "Database connection initialization"

### Poor Context Examples

- "Error"
- "Failed"
- "Exception occurred"
- "Something went wrong"

## Integration with ViewModels

### MainViewModel Pattern

```csharp
private void ExecuteAsync(Func<Task> taskFactory, string operationName = "Operation")
{
    var errorHandler = ErrorHandlingService.Instance;
    
    errorHandler.ExecuteWithErrorHandling(
        taskFactory,
        operationName,
        onSuccess: () => Application.Current.Dispatcher.Invoke(() => 
            StatusMessage = $"{operationName} completed successfully"),
        onError: (message) => Application.Current.Dispatcher.Invoke(() => 
            StatusMessage = message)
    );
}
```

### Service Layer Pattern

```csharp
public async Task<List<CompanyProfile>> GetProfilesAsync()
{
    try
    {
        // Service logic
        return profiles;
    }
    catch (Exception ex)
    {
        ErrorHandlingService.Instance.HandleException(ex, "Loading company profiles");
        return new List<CompanyProfile>(); // Graceful fallback
    }
}
```

## Log File Management

- **Location**: `%APPDATA%\MandADiscoverySuite\Logs\`
- **Format**: `error_log_YYYYMMDD.txt`
- **Rotation**: Daily log files
- **Retention**: Manual cleanup (consider implementing automatic cleanup)

## Testing Error Handling

### Unit Tests

```csharp
[Test]
public void HandleException_ShouldGenerateConsistentMessage()
{
    var service = ErrorHandlingService.Instance;
    var exception = new ArgumentNullException("param");
    
    var message = service.HandleException(exception, "Test operation");
    
    Assert.That(message, Is.EqualTo("Test operation failed: Missing required data"));
}
```

### Integration Tests

Test error scenarios in ViewModels and Services to ensure consistent behavior.

## Future Enhancements

1. **Structured Logging**: Consider implementing structured logging with correlation IDs
2. **Error Reporting**: Integrate with error reporting services (e.g., Application Insights)
3. **User Feedback**: Allow users to report errors directly from error dialogs
4. **Performance Monitoring**: Track error rates and response times
5. **Retry Logic**: Implement automatic retry for transient errors

## Migration Guide

To migrate existing error handling to the new strategy:

1. Replace direct `StatusMessage = $"Error: {ex.Message}"` with `ErrorHandlingService.Instance.HandleException(ex, "Context")`
2. Replace `MessageBox.Show` error dialogs with `HandleException(..., showToUser: true)`
3. Wrap async operations with `ExecuteWithErrorHandling` where appropriate
4. Update validation error handling to use `HandleValidationErrors`
5. Ensure all exception catches provide meaningful context strings

## Troubleshooting

### Common Issues

1. **Missing Context**: Ensure all error handling calls include descriptive context
2. **Thread Safety**: UI updates must be dispatched to the UI thread
3. **Log File Access**: Ensure log directory permissions are correct
4. **Performance**: Avoid excessive logging in tight loops

### Best Practices

1. Always provide context when handling exceptions
2. Use appropriate overloads (showToUser, custom messages)
3. Don't suppress exceptions unless you have a good reason
4. Log at appropriate levels (Error, Warning, Info)
5. Test error scenarios during development