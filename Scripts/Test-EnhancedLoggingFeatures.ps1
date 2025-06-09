# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Test script for enhanced correlation tracking and performance metrics logging.
.DESCRIPTION
    This script demonstrates the new correlation tracking and performance metrics
    features in the EnhancedLogging module.
.NOTES
    Version: 1.0.0
    Author: M&A Discovery Suite Team
    Date: 2025-06-09
#>

# Import the enhanced logging module
Import-Module "$PSScriptRoot\..\Modules\Utilities\EnhancedLogging.psm1" -Force

Write-Host "=== Testing Enhanced Correlation Tracking and Performance Metrics ===" -ForegroundColor Cyan

# Initialize logging system
Initialize-Logging

Write-Host "`n1. Testing Correlation ID Generation" -ForegroundColor Yellow

# Generate a new correlation ID
$correlationId = New-CorrelationId
Write-Host "Generated Correlation ID: $correlationId" -ForegroundColor Green

# Test logging with correlation ID
Write-MandALog -Message "Starting test operation with correlation tracking" -Level "INFO" -Component "TestScript" -CorrelationId $correlationId

# Test automatic correlation ID usage (should use the current one)
Write-MandALog -Message "This message should use the current correlation ID automatically" -Level "INFO" -Component "TestScript"

Write-Host "`n2. Testing Performance Metrics" -ForegroundColor Yellow

# Test performance timer for a simple operation
Start-PerformanceTimer -OperationName "SimpleOperation" -CorrelationId $correlationId

# Simulate some work
Start-Sleep -Milliseconds 500
$data = @()
for ($i = 1; $i -le 1000; $i++) {
    $data += "Item $i"
}

Stop-PerformanceTimer -OperationName "SimpleOperation" -CorrelationId $correlationId

Write-Host "`n3. Testing Nested Operations with Different Correlation IDs" -ForegroundColor Yellow

# Start a parent operation
$parentCorrelationId = New-CorrelationId
Write-MandALog -Message "Starting parent operation" -Level "INFO" -Component "ParentOperation" -CorrelationId $parentCorrelationId
Start-PerformanceTimer -OperationName "ParentOperation" -CorrelationId $parentCorrelationId

# Start a child operation with its own correlation ID
$childCorrelationId = New-CorrelationId
Write-MandALog -Message "Starting child operation" -Level "INFO" -Component "ChildOperation" -CorrelationId $childCorrelationId
Start-PerformanceTimer -OperationName "ChildOperation" -CorrelationId $childCorrelationId

# Simulate child work
Start-Sleep -Milliseconds 200
Write-MandALog -Message "Child operation processing data" -Level "DEBUG" -Component "ChildOperation" -CorrelationId $childCorrelationId

Stop-PerformanceTimer -OperationName "ChildOperation" -CorrelationId $childCorrelationId
Write-MandALog -Message "Child operation completed" -Level "SUCCESS" -Component "ChildOperation" -CorrelationId $childCorrelationId

# Continue parent operation
Start-Sleep -Milliseconds 300
Write-MandALog -Message "Parent operation continuing after child completion" -Level "INFO" -Component "ParentOperation" -CorrelationId $parentCorrelationId

Stop-PerformanceTimer -OperationName "ParentOperation" -CorrelationId $parentCorrelationId
Write-MandALog -Message "Parent operation completed" -Level "SUCCESS" -Component "ParentOperation" -CorrelationId $parentCorrelationId

Write-Host "`n4. Testing Structured Data with Correlation Tracking" -ForegroundColor Yellow

$operationCorrelationId = New-CorrelationId
$structuredData = @{
    UserCount = 150
    ProcessingMode = "Batch"
    Environment = "Production"
    StartTime = Get-Date
}

Write-MandALog -Message "Processing user data with structured information" -Level "INFO" -Component "DataProcessor" -CorrelationId $operationCorrelationId -StructuredData $structuredData

Start-PerformanceTimer -OperationName "DataProcessing" -CorrelationId $operationCorrelationId

# Simulate data processing
Start-Sleep -Milliseconds 750

$processingResults = @{
    ProcessedUsers = 150
    SuccessfulProcessing = 148
    Errors = 2
    ProcessingRate = "200 users/second"
}

Write-MandALog -Message "Data processing completed" -Level "SUCCESS" -Component "DataProcessor" -CorrelationId $operationCorrelationId -StructuredData $processingResults

Stop-PerformanceTimer -OperationName "DataProcessing" -CorrelationId $operationCorrelationId

Write-Host "`n5. Testing Error Scenarios with Correlation Tracking" -ForegroundColor Yellow

$errorCorrelationId = New-CorrelationId
Write-MandALog -Message "Starting operation that will encounter an error" -Level "INFO" -Component "ErrorTest" -CorrelationId $errorCorrelationId

Start-PerformanceTimer -OperationName "ErrorOperation" -CorrelationId $errorCorrelationId

try {
    # Simulate an error condition
    Start-Sleep -Milliseconds 100
    throw "Simulated error for testing correlation tracking"
} catch {
    $errorData = @{
        ErrorType = $_.Exception.GetType().Name
        ErrorMessage = $_.Exception.Message
        StackTrace = $_.ScriptStackTrace
    }
    
    Write-MandALog -Message "Operation failed with error: $($_.Exception.Message)" -Level "ERROR" -Component "ErrorTest" -CorrelationId $errorCorrelationId -StructuredData $errorData
}

Stop-PerformanceTimer -OperationName "ErrorOperation" -CorrelationId $errorCorrelationId

Write-Host "`n6. Testing Performance Timer Edge Cases" -ForegroundColor Yellow

# Test stopping a timer that wasn't started
Stop-PerformanceTimer -OperationName "NonExistentOperation"

# Test multiple timers running simultaneously
$multiCorrelationId = New-CorrelationId
Start-PerformanceTimer -OperationName "Operation1" -CorrelationId $multiCorrelationId
Start-PerformanceTimer -OperationName "Operation2" -CorrelationId $multiCorrelationId
Start-PerformanceTimer -OperationName "Operation3" -CorrelationId $multiCorrelationId

Start-Sleep -Milliseconds 200

Stop-PerformanceTimer -OperationName "Operation2" -CorrelationId $multiCorrelationId
Start-Sleep -Milliseconds 100
Stop-PerformanceTimer -OperationName "Operation1" -CorrelationId $multiCorrelationId
Start-Sleep -Milliseconds 50
Stop-PerformanceTimer -OperationName "Operation3" -CorrelationId $multiCorrelationId

Write-Host "`n=== Enhanced Logging Features Test Completed ===" -ForegroundColor Cyan
Write-Host "Check the log files for structured JSON output and correlation tracking." -ForegroundColor Green

# Display current performance log state (should be empty after all operations)
Write-Host "`nCurrent Performance Log State:" -ForegroundColor Yellow
if ($script:PerformanceLog.Count -eq 0) {
    Write-Host "All performance timers have been properly cleaned up." -ForegroundColor Green
} else {
    Write-Host "Warning: Some performance timers are still active:" -ForegroundColor Red
    $script:PerformanceLog.Keys | ForEach-Object {
        Write-Host "  - $_" -ForegroundColor Red
    }
}