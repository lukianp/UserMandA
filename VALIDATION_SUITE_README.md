# M&A Discovery Suite - Real-Time Data Validation Suite

## Overview

This comprehensive validation suite tests the real-time data loading functionality implemented in the M&A Discovery Suite. It ensures that all tabs are properly receiving and displaying live data updates, validates data consistency, and tests error handling scenarios.

## 🎯 Components

### 1. **Test-RealTimeDataValidation.ps1** - Main Validation Script
The core validation engine that:
- Starts the M&A Discovery Suite application programmatically
- Monitors data loading across all tabs (Dashboard, Discovery, Configuration, Planning, Execution, Validation)
- Tests data consistency and quality
- Validates error handling scenarios
- Collects performance metrics
- Generates a comprehensive HTML report

### 2. **Test-DataGenerator.ps1** - Data Generation Simulator
Creates realistic test data that mimics the real-time data loading patterns:
- Generates CSV files for each tab at their expected intervals
- Creates realistic sample data with proper schemas
- Can include dummy data and error scenarios for testing
- Supports configurable generation duration and patterns

### 3. **Test-LiveDataMonitor.ps1** - Real-Time Monitor
Provides live monitoring of data updates:
- Real-time display of file changes and updates
- Process health monitoring
- Update frequency analysis
- Live dashboard with refresh capabilities

### 4. **Start-FullValidationSuite.ps1** - Test Orchestrator
Master launcher that coordinates the entire test suite:
- Runs data generation and validation in sequence
- Supports different testing modes
- Handles cleanup and report generation
- Provides comprehensive test summaries

### 5. **DataSchemas.json** - Configuration File
Defines expected data structures and validation rules:
- Required columns for each tab
- Expected update intervals
- Performance thresholds
- Quality check parameters

## 🚀 Quick Start

### Basic Validation (Recommended)
```powershell
# Run the complete validation suite
.\Start-FullValidationSuite.ps1
```

### Advanced Options
```powershell
# Extended testing with error scenarios
.\Start-FullValidationSuite.ps1 -ValidationDurationMinutes 10 -IncludeErrors

# Data generation only
.\Start-FullValidationSuite.ps1 -Mode DataGenOnly -DataGenDurationMinutes 5

# Validation only (assumes data already exists)
.\Start-FullValidationSuite.ps1 -Mode ValidationOnly
```

### Individual Script Usage
```powershell
# Generate test data for 5 minutes
.\Test-DataGenerator.ps1 -DurationMinutes 5 -IncludeDummyData

# Run validation tests
.\Test-RealTimeDataValidation.ps1 -TestDurationMinutes 5

# Monitor live data updates
.\Test-LiveDataMonitor.ps1 -MonitorDurationMinutes 5
```

## 📊 What Gets Tested

### Tab-Specific Validations

| Tab | Expected Interval | Key Metrics |
|-----|------------------|-------------|
| **Dashboard** | 3 seconds | Total counts, progress percentages |
| **Discovery** | 10 seconds | Module status, record counts |
| **Configuration** | 30 seconds | Settings and their values |
| **Planning** | 15 seconds | Wave information, user counts |
| **Execution** | 2 seconds | Task progress, migration status |
| **Validation** | 15 seconds | Test results, validation outcomes |

### Data Quality Checks
- ✅ **Required columns presence**
- ✅ **Data type validation**
- ✅ **Timestamp consistency**
- ✅ **Progress value increases**
- ✅ **No dummy/test data patterns**
- ✅ **File generation intervals**

### Error Handling Tests
- ✅ **Invalid CSV file handling**
- ✅ **Missing column scenarios**
- ✅ **Access permission issues**
- ✅ **Application crash prevention**

### Performance Monitoring
- ✅ **Memory usage tracking**
- ✅ **CPU utilization**
- ✅ **Handle and thread counts**
- ✅ **File I/O performance**

## 📋 Test Results & Reports

### HTML Report Features
The validation generates a comprehensive HTML report including:

- **Executive Summary** - Pass/fail counts, success rates
- **Tab-by-Tab Results** - Detailed validation for each screen  
- **Data Consistency Analysis** - Cross-tab data validation
- **Error Handling Results** - Robustness testing outcomes
- **Performance Metrics** - Resource usage and efficiency
- **Issues & Recommendations** - Actionable improvement suggestions

### Sample Report Sections
```html
✅ Dashboard Tab: PASS (3.2s intervals, 15 files generated)
⚠️ Discovery Tab: WARNING (12.1s intervals, expected 10s)
❌ Configuration Tab: FAIL (Missing required columns)
```

## 🛡️ Error Scenarios Tested

### Data Corruption Tests
- Invalid CSV content
- Missing required columns  
- Malformed timestamps
- Duplicate session IDs

### File System Tests  
- Directory access denied
- Disk space limitations
- File lock scenarios
- Network path interruptions

### Application Stability
- Memory leak detection
- CPU spike handling
- Handle exhaustion
- Thread deadlock prevention

## 📈 Performance Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| Memory Usage | > 500 MB | Warning generated |
| CPU Time | > 60 seconds | Performance alert |
| Update Interval Variance | > 20% | Timing issue flagged |
| File Generation Failures | > 5% | Critical alert |

## 🔧 Configuration Options

### Environment Variables
```powershell
$env:VALIDATION_DATA_PATH = "C:\discoverydata\ljpops\Raw"
$env:VALIDATION_GUI_PATH = "C:\enterprisediscovery\GUI\bin\Debug\net6.0-windows\MandADiscoverySuite.exe"
$env:VALIDATION_DURATION = "5"  # minutes
```

### Custom Schema Modifications
Edit `DataSchemas.json` to:
- Add new required columns
- Modify expected intervals
- Adjust performance thresholds
- Include new tabs or data sources

## 🚨 Common Issues & Solutions

### Application Won't Start
```
Issue: Application executable not found
Solution: Verify GuiPath parameter points to correct executable
Command: .\Test-RealTimeDataValidation.ps1 -GuiPath "C:\path\to\MandADiscoverySuite.exe"
```

### No Data Files Generated
```  
Issue: Data directory not found or inaccessible
Solution: Ensure data path exists and has write permissions
Command: New-Item -ItemType Directory -Path "C:\discoverydata\ljpops\Raw" -Force
```

### Validation Timeouts
```
Issue: Tests taking too long to complete
Solution: Reduce test duration or increase timeout values
Command: .\Test-RealTimeDataValidation.ps1 -TestDurationMinutes 3
```

### Memory Warnings
```
Issue: High memory usage alerts
Solution: Check for memory leaks in application code
Action: Review application memory management patterns
```

## 📝 Extending the Test Suite

### Adding New Tab Validation
1. Update `DataSchemas.json` with new tab definition
2. Add validation logic in `Test-RealTimeDataValidation.ps1`
3. Include data generation in `Test-DataGenerator.ps1`
4. Update report templates

### Custom Validation Rules
```powershell
# Example: Add custom validation function
function Test-CustomDataRule {
    param($Data, $TabName)
    
    # Your custom validation logic here
    if ($Data.SomeField -match $SomePattern) {
        return @{
            Success = $true
            Message = "Custom validation passed"
        }
    }
    
    return @{
        Success = $false
        Message = "Custom validation failed"
        Details = "Specific reason for failure"
    }
}
```

## 🎯 Best Practices

### Regular Testing Schedule
- **Daily**: Quick validation (3-5 minutes)
- **Weekly**: Extended validation with error scenarios  
- **Release**: Full suite with performance profiling
- **Critical Changes**: Comprehensive validation before deployment

### Continuous Integration
```yaml
# Sample CI pipeline step
- name: M&A Discovery Suite Validation
  run: |
    pwsh -File "Start-FullValidationSuite.ps1" -Mode ValidationOnly
    if ($LASTEXITCODE -ne 0) { exit 1 }
```

### Report Analysis
1. **Success Rate**: Aim for >80% overall pass rate
2. **Performance**: Monitor memory and CPU trends
3. **Data Quality**: Zero tolerance for dummy data in production
4. **Error Handling**: All error scenarios should pass

## 📞 Support & Troubleshooting

### Debug Mode
```powershell
# Enable verbose logging
.\Test-RealTimeDataValidation.ps1 -Verbose

# Check validation log
Get-Content ".\validation.log" -Tail 50
```

### Process Monitoring
```powershell  
# Monitor application process
Get-Process -Name "MandADiscoverySuite" | Select-Object *

# Check file system activity
.\Test-LiveDataMonitor.ps1 -RefreshIntervalSeconds 1
```

### Report Issues
When reporting validation issues, include:
- Generated HTML report
- Validation log file (`validation.log`)
- Application version and environment details
- Steps to reproduce the issue

---

**Generated by**: M&A Discovery Suite - Automated Test & Data Validation Agent  
**Version**: 1.0.0  
**Last Updated**: August 2025