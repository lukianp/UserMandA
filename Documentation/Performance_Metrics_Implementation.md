# Performance Metrics Implementation

## Overview

The M&A Discovery Suite now includes comprehensive performance metrics logging capabilities that provide detailed timing information, system resource usage tracking, and performance analytics for all discovery operations.

## Implementation Summary

### New Components Added

1. **PerformanceMetrics.psm1** - Core performance tracking module
2. **Enhanced Write-MandALog** - Updated to support structured data logging
3. **Orchestrator Integration** - Automatic performance tracking for all discovery modules
4. **Test-PerformanceMetrics.ps1** - Comprehensive testing script

### Key Features

- **Operation Timing**: Precise measurement of operation duration with millisecond accuracy
- **System Metrics**: Optional collection of CPU, memory, and process metrics
- **Error Tracking**: Performance data collection even when operations fail
- **Session Management**: Group related operations into performance sessions
- **Structured Logging**: Integration with existing logging infrastructure
- **Report Generation**: Comprehensive performance reports and analytics
- **Automatic Integration**: Seamless integration with existing discovery modules

## Core Functions

### Measure-Operation

The primary function for wrapping operations with performance measurement:

```powershell
$result = Measure-Operation -Operation {
    # Your operation code here
    Get-ADUser -Filter * -Properties *
} -OperationName "ActiveDirectoryUserDiscovery" -Context $context -Data @{
    TenantId = $tenantId
    FilterCriteria = "*"
}
```

**Parameters:**
- `Operation` - Script block to execute and measure
- `OperationName` - Descriptive name for the operation
- `Context` - Context object for logging and configuration
- `Data` - Additional structured data to include with metrics
- `Category` - Operation category (e.g., "Discovery", "Processing", "Export")
- `CollectSystemMetrics` - Whether to collect system performance data

### Performance Sessions

Group related operations for comprehensive analysis:

```powershell
# Start a performance session
$sessionId = Start-PerformanceSession -SessionName "FullDiscovery" -Context $context

# Run operations (automatically tracked if using Measure-Operation)
# ... discovery operations ...

# Stop session and get summary
$sessionSummary = Stop-PerformanceSession -SessionName "FullDiscovery" -Context $context
```

### Performance Reports

Generate detailed performance analytics:

```powershell
# Get performance report
$report = Get-PerformanceReport -OperationFilter "*Discovery*" -TimeRange 24

# Export detailed report
$reportPath = Export-PerformanceReport -ReportType "Detailed" -Context $context
```

## Integration with Existing Components

### Orchestrator Integration

The orchestrator automatically wraps all discovery module calls with `Measure-Operation`:

```powershell
# In Invoke-DiscoveryModule function
if (Get-Command Measure-Operation -ErrorAction SilentlyContinue) {
    return Measure-Operation -Operation {
        # Discovery module execution
        $result = Invoke-WithTimeout -ScriptBlock {
            & $moduleFunction -Configuration $Configuration
        } -TimeoutSeconds 300
        return $result
    } -OperationName "${ModuleName}Discovery" -Category "Discovery" -Context $global:MandA
}
```

### Enhanced Logging Integration

The `Write-MandALog` function now supports structured data:

```powershell
Write-MandALog -Message "Operation completed" -Level "SUCCESS" -Component "Discovery" -Data @{
    DurationMs = 1500
    RecordCount = 250
    Success = $true
} -Context $context
```

### Configuration Support

Performance tracking can be configured via the suite configuration:

```json
{
  "environment": {
    "performance": {
      "enabled": true,
      "detailedLogging": false,
      "collectSystemMetrics": true,
      "maxHistoryEntries": 1000,
      "autoExportThreshold": 500
    }
  }
}
```

## Performance Data Structure

Each performance metric includes:

```powershell
@{
    ExecutionId = "guid"
    OperationName = "string"
    Category = "string"
    StartTime = "datetime"
    EndTime = "datetime"
    DurationMs = "int"
    DurationSeconds = "double"
    Success = "bool"
    Context = @{} # Additional operation data
    SystemMetrics = @{
        Initial = @{} # System state at start
        Final = @{}   # System state at end
        Delta = @{}   # Calculated differences
    }
    Error = @{} # Error information if operation failed
}
```

## System Metrics Collection

When enabled, the system collects:

- **Process Metrics**: Working set, virtual memory, CPU time, thread count
- **System Memory**: Total/available physical memory, utilization percentage
- **Performance Deltas**: Changes in resource usage during operation

## Report Types

### Summary Report
- Operation counts and success rates
- Duration statistics (min, max, average)
- Top slowest/fastest operations
- Error summary

### Detailed Report
- All summary data plus system metrics
- Configuration information
- Active session data
- Complete operation history

### Raw Report
- Complete raw performance data
- All collected metrics
- Full system information

## Testing

Use the provided test script to verify functionality:

```powershell
# Basic testing
.\Scripts\Test-PerformanceMetrics.ps1

# Detailed output with report export
.\Scripts\Test-PerformanceMetrics.ps1 -Detailed -ExportReport
```

## Usage Examples

### Discovery Module Integration

```powershell
function Invoke-CustomDiscovery {
    param([hashtable]$Configuration)
    
    $result = Measure-Operation -Operation {
        # Your discovery logic here
        $users = Get-ADUser -Filter * -Properties *
        return $users
    } -OperationName "CustomDiscovery" -Context $Configuration -Data @{
        FilterType = "All Users"
        PropertiesRequested = "*"
    }
    
    return $result
}
```

### Manual Performance Tracking

```powershell
# Start session
$sessionId = Start-PerformanceSession -SessionName "DataProcessing" -Context $context

# Measure individual operations
$processedData = Measure-Operation -Operation {
    Process-UserData -InputData $rawData
} -OperationName "UserDataProcessing" -Category "Processing"

$validatedData = Measure-Operation -Operation {
    Validate-ProcessedData -Data $processedData
} -OperationName "DataValidation" -Category "Processing"

# Stop session and get report
$sessionSummary = Stop-PerformanceSession -SessionName "DataProcessing" -Context $context
Export-PerformanceReport -ReportType "Summary" -Context $context
```

## Benefits

1. **Performance Visibility**: Clear insights into operation performance
2. **Bottleneck Identification**: Easily identify slow operations
3. **Resource Monitoring**: Track system resource usage
4. **Trend Analysis**: Historical performance data for trend analysis
5. **Error Correlation**: Link performance issues with errors
6. **Automatic Integration**: No changes required to existing discovery modules
7. **Structured Logging**: Rich, searchable log data
8. **Report Generation**: Automated performance reporting

## Best Practices

1. **Use Descriptive Names**: Choose clear, descriptive operation names
2. **Include Context Data**: Add relevant metadata to performance records
3. **Monitor System Metrics**: Enable system metrics for resource-intensive operations
4. **Regular Reporting**: Export performance reports regularly for analysis
5. **Session Grouping**: Use sessions to group related operations
6. **Error Analysis**: Review failed operations for performance patterns
7. **Threshold Monitoring**: Set up alerts for performance degradation

## Future Enhancements

- Performance alerting and thresholds
- Real-time performance dashboards
- Performance trend analysis
- Automated performance optimization recommendations
- Integration with external monitoring systems
- Performance baseline establishment
- Comparative performance analysis

## Files Modified/Created

### New Files
- `Modules/Utilities/PerformanceMetrics.psm1`
- `Scripts/Test-PerformanceMetrics.ps1`
- `Documentation/Performance_Metrics_Implementation.md`

### Modified Files
- `Modules/Utilities/EnhancedLogging.psm1` - Added Data parameter support
- `Core/MandA-Orchestrator.ps1` - Added PerformanceMetrics module loading and Measure-Operation integration

## Conclusion

The performance metrics implementation provides comprehensive performance visibility for the M&A Discovery Suite without requiring changes to existing discovery modules. The automatic integration ensures all operations are measured, while the flexible reporting system provides insights for optimization and troubleshooting.