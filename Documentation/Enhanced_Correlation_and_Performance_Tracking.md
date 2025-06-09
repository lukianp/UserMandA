# Enhanced Correlation Tracking and Performance Metrics Implementation

## Overview

This document describes the implementation of enhanced correlation tracking and performance metrics logging in the M&A Discovery Suite's EnhancedLogging module.

## Features Implemented

### 1. Enhanced Correlation Tracking

#### New Functions
- **`New-CorrelationId`**: Generates unique correlation IDs for tracking related operations
- **Enhanced `Write-MandALog`**: Now automatically uses current correlation ID when none is specified

#### Key Enhancements
- **Automatic Correlation ID Management**: The module maintains a current correlation ID (`$script:CurrentCorrelationId`) that is automatically used when logging
- **Thread ID Tracking**: Each log entry now includes the managed thread ID for better debugging
- **Structured Data Enhancement**: Log entries include correlation ID and thread information in structured format

#### Usage Examples
```powershell
# Generate a new correlation ID
$correlationId = New-CorrelationId

# Log with explicit correlation ID
Write-MandALog -Message "Starting operation" -Level "INFO" -Component "MyComponent" -CorrelationId $correlationId

# Log with automatic correlation ID (uses current)
Write-MandALog -Message "Continuing operation" -Level "INFO" -Component "MyComponent"
```

### 2. Performance Metrics Logging

#### New Functions
- **`Start-PerformanceTimer`**: Begins performance tracking for named operations
- **`Stop-PerformanceTimer`**: Ends performance tracking and logs comprehensive metrics

#### Tracked Metrics
- **Duration**: Total execution time in seconds
- **Memory Usage**: Initial memory, final memory, and memory delta
- **Thread Information**: Managed thread ID for the operation
- **Correlation Tracking**: Associates performance data with correlation IDs

#### Usage Examples
```powershell
# Start performance tracking
Start-PerformanceTimer -OperationName "UserDiscovery" -CorrelationId $correlationId

# ... perform operations ...

# Stop tracking and log results
Stop-PerformanceTimer -OperationName "UserDiscovery" -CorrelationId $correlationId
```

### 3. Enhanced Log Entry Structure

#### Standard Log Entry Format
```json
{
  "Timestamp": "2025-06-09 17:24:15.123",
  "Level": "INFO",
  "Component": "UserDiscovery",
  "Message": "Processing user data",
  "CorrelationId": "a1b2c3d4",
  "StructuredData": {
    "UserCount": 150,
    "ProcessingMode": "Batch"
  },
  "ThreadId": 1
}
```

#### Performance Log Entry Format
```json
{
  "Timestamp": "2025-06-09 17:24:18.456",
  "Level": "INFO",
  "Component": "PerformanceTimer",
  "Message": "Performance: UserDiscovery completed in 3.333 seconds",
  "CorrelationId": "a1b2c3d4",
  "StructuredData": {
    "Start": "2025-06-09T17:24:15.123Z",
    "End": "2025-06-09T17:24:18.456Z",
    "Duration": 3.333,
    "Memory": 12345678,
    "MemoryDelta": 1234567,
    "EndMemory": 13580245,
    "CorrelationId": "a1b2c3d4",
    "ThreadId": 1
  },
  "ThreadId": 1
}
```

## Configuration Options

### New Configuration Settings
- **`EnablePerformanceTracking`**: Boolean flag to enable/disable performance metrics (default: true)

### Existing Settings Enhanced
- **`StructuredLogging`**: Now includes correlation ID and thread information in structured output

## Implementation Details

### Module-Level Variables
```powershell
# Current correlation ID for automatic tracking
$script:CurrentCorrelationId = $null

# Performance tracking storage
$script:PerformanceLog = @{}
```

### Error Handling
- Performance timers include comprehensive error handling
- Graceful degradation when performance tracking is disabled
- Automatic cleanup of completed performance measurements

### Memory Management
- Performance log entries are automatically removed after completion
- Memory usage tracking uses `[System.GC]::GetTotalMemory($false)` for accuracy
- No memory leaks from uncompleted timers

## Best Practices

### Correlation ID Usage
1. **Generate at Operation Start**: Create a new correlation ID at the beginning of major operations
2. **Pass Through Call Stack**: Include correlation ID in all related function calls
3. **Use Automatic Tracking**: Let the module automatically use the current correlation ID when possible

### Performance Tracking
1. **Meaningful Names**: Use descriptive operation names for performance timers
2. **Balanced Granularity**: Track significant operations but avoid over-instrumentation
3. **Always Stop Timers**: Ensure every `Start-PerformanceTimer` has a corresponding `Stop-PerformanceTimer`

### Structured Data
1. **Consistent Format**: Use consistent hashtable structures for similar operations
2. **Relevant Information**: Include data that aids in debugging and analysis
3. **Avoid Sensitive Data**: Don't include passwords or other sensitive information

## Testing

### Test Script
The implementation includes a comprehensive test script: `Scripts/Test-EnhancedLoggingFeatures.ps1`

### Test Scenarios Covered
1. **Basic Correlation Tracking**: Generation and usage of correlation IDs
2. **Performance Metrics**: Timer start/stop with duration and memory tracking
3. **Nested Operations**: Multiple correlation IDs and overlapping timers
4. **Structured Data**: Complex data structures in log entries
5. **Error Scenarios**: Error handling with correlation tracking
6. **Edge Cases**: Invalid operations and cleanup verification

## Integration Points

### Existing Modules
The enhanced logging features integrate seamlessly with existing modules:
- **Discovery Modules**: Can use correlation tracking for operation tracing
- **Authentication Modules**: Performance metrics for authentication operations
- **Export Modules**: Correlation tracking for export operations

### Future Enhancements
- **Dashboard Integration**: Performance metrics can be consumed by monitoring dashboards
- **Alerting**: Correlation IDs enable better error correlation and alerting
- **Analytics**: Structured data supports advanced log analytics

## Version Information
- **Module Version**: 1.1.0
- **Implementation Date**: 2025-06-09
- **Compatibility**: PowerShell 5.1+
- **Dependencies**: None (self-contained implementation)