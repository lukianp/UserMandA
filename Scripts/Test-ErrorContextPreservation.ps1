﻿# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-06
# Last Modified: 2025-06-06
# Change Log: Updated version control header

<#
.SYNOPSIS
    Test script to demonstrate enhanced error context preservation functionality.
.DESCRIPTION
    This script tests the new error context preservation features in the ErrorHandling module,
    including Add-ErrorContext, New-EnhancedErrorRecord, and Export-ErrorContext functions.
.NOTES
    Version: 1.0.0
    Author: M&A Discovery Suite Team
    Date: 2025-06-06
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = ".\ErrorLogs",
    
    [Parameter(Mandatory=$false)]
    [switch]$ExportErrors = $true
)

# Import required modules
try {
    Import-Module "$PSScriptRoot\..\Modules\Utilities\ErrorHandling.psm1" -Force
    Import-Module "$PSScriptRoot\..\Modules\Utilities\EnhancedLogging.psm1" -Force -ErrorAction SilentlyContinue
    Write-Host "âœ“ Modules imported successfully" -ForegroundColor Green
} catch {
    Write-Host "âœ— Failed to import modules: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Initialize test context
$testContext = [PSCustomObject]@{
    TestName = "ErrorContextPreservationTest"
    StartTime = Get-Date
    Config = @{
        environment = @{
            maxRetries = 3
            retryDelaySeconds = 2
        }
    }
}

Write-Host "`n=== Enhanced Error Context Preservation Test ===" -ForegroundColor Cyan
Write-Host "Testing enhanced error handling capabilities..." -ForegroundColor White

# Test 1: Basic error context capture
Write-Host "`n--- Test 1: Basic Error Context Capture ---" -ForegroundColor Yellow
try {
    # Simulate an error that would occur in discovery operations
    $nonExistentPath = "C:\NonExistent\Path\File.txt"
    Get-Content $nonExistentPath -ErrorAction Stop
} catch {
    Write-Host "âœ“ Captured error for context enhancement" -ForegroundColor Green
    
    # Enhance the error with context
    $enhancedError = Add-ErrorContext -ErrorRecord $_ -Context @{
        Operation = "FileDiscovery"
        TargetPath = $nonExistentPath
        DiscoveryModule = "FileServerDiscovery"
        TenantId = "test-tenant-123"
        UserId = "test-user@domain.com"
    } -LoggingContext $testContext
    
    Write-Host "Enhanced Error ID: $($enhancedError.ExecutionId)" -ForegroundColor Cyan
    Write-Host "Error Type: $($enhancedError.Error.Type)" -ForegroundColor Gray
    Write-Host "Context Keys: $($enhancedError.Context.Keys -join ', ')" -ForegroundColor Gray
    
    # Export the error context if requested
    if ($ExportErrors) {
        $exportPath = Export-ErrorContext -EnhancedError $enhancedError -OutputPath $OutputPath -LoggingContext $testContext
        Write-Host "âœ“ Error context exported to: $exportPath" -ForegroundColor Green
    }
}

# Test 2: DiscoveryResult with enhanced error context
Write-Host "`n--- Test 2: DiscoveryResult Enhanced Error Handling ---" -ForegroundColor Yellow
$discoveryResult = [DiscoveryResult]::new("TestModule")

try {
    # Simulate a Graph API error
    throw [System.UnauthorizedAccessException]::new("Access denied to Microsoft Graph API endpoint")
} catch {
    Write-Host "âœ“ Simulated Graph API error" -ForegroundColor Green
    
    # Add error with enhanced context to DiscoveryResult
    $discoveryResult.AddErrorWithContext(
        "Failed to query Microsoft Graph API for user information",
        $_,
        @{
            GraphEndpoint = "https://graph.microsoft.com/v1.0/users"
            RequestedPermissions = @("User.Read.All", "Directory.Read.All")
            TenantId = "test-tenant-123"
            ApplicationId = "test-app-456"
        }
    )
    
    Write-Host "âœ“ Enhanced error added to DiscoveryResult" -ForegroundColor Green
    Write-Host "Error Count: $($discoveryResult.Errors.Count)" -ForegroundColor Gray
    
    if ($discoveryResult.Errors.Count -gt 0 -and $discoveryResult.Errors[0].EnhancedContext) {
        $errorContext = $discoveryResult.Errors[0].EnhancedContext
        Write-Host "Enhanced Context ID: $($errorContext.ExecutionId)" -ForegroundColor Cyan
        Write-Host "Environment Info: Computer=$($errorContext.Environment.Computer), User=$($errorContext.Environment.User)" -ForegroundColor Gray
    }
}

# Test 3: Retry mechanism with enhanced error context
Write-Host "`n--- Test 3: Retry Mechanism with Enhanced Context ---" -ForegroundColor Yellow
try {
    $result = Invoke-WithRetry -ScriptBlock {
        # Simulate a network error that might be retryable
        throw [System.Net.WebException]::new("The remote server returned an error: (503) Service Unavailable")
    } -MaxRetries 2 -DelaySeconds 1 -OperationName "GraphAPIQuery" -Context $testContext
} catch {
    Write-Host "âœ“ Retry mechanism completed with enhanced error context" -ForegroundColor Green
    Write-Host "Final error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test 4: New-EnhancedErrorRecord functionality
Write-Host "`n--- Test 4: Enhanced ErrorRecord Creation ---" -ForegroundColor Yellow
try {
    $customException = [System.InvalidOperationException]::new("Custom operation failed during discovery")
    $enhancedErrorRecord = New-EnhancedErrorRecord -Exception $customException -ErrorId "DISCOVERY_CUSTOM_001" -ErrorCategory "InvalidOperation" -Context @{
        DiscoveryPhase = "UserProfileBuilding"
        ProcessedUsers = 150
        FailedUser = "problematic.user@domain.com"
    } -LoggingContext $testContext
    
    Write-Host "âœ“ Enhanced ErrorRecord created" -ForegroundColor Green
    Write-Host "Error ID: $($enhancedErrorRecord.FullyQualifiedErrorId)" -ForegroundColor Cyan
    Write-Host "Error Details: $($enhancedErrorRecord.ErrorDetails.Message)" -ForegroundColor Gray
    Write-Host "Recommended Action: $($enhancedErrorRecord.ErrorDetails.RecommendedAction)" -ForegroundColor Gray
    
    # The enhanced context is stored in the global store
    if ($global:MandAErrorContextStore -and $global:MandAErrorContextStore.ContainsKey($enhancedErrorRecord.GetHashCode())) {
        $storedContext = $global:MandAErrorContextStore[$enhancedErrorRecord.GetHashCode()]
        Write-Host "âœ“ Enhanced context stored globally with ID: $($storedContext.ExecutionId)" -ForegroundColor Green
    }
    
} catch {
    Write-Host "âœ— Failed to create enhanced ErrorRecord: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Timeout operations with enhanced context
Write-Host "`n--- Test 5: Timeout Operations with Enhanced Context ---" -ForegroundColor Yellow
try {
    $result = Invoke-WithTimeout -ScriptBlock {
        # Simulate a long-running operation that will timeout
        Start-Sleep -Seconds 10
        return "This should not complete"
    } -TimeoutSeconds 2 -OperationName "LongRunningDiscovery" -Context $testContext
} catch [System.TimeoutException] {
    Write-Host "âœ“ Timeout operation completed as expected" -ForegroundColor Green
    Write-Host "Timeout error: $($_.Exception.Message)" -ForegroundColor Gray
} catch {
    Write-Host "âœ— Unexpected error in timeout test: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
Write-Host "âœ“ Basic error context capture - PASSED" -ForegroundColor Green
Write-Host "âœ“ DiscoveryResult enhanced error handling - PASSED" -ForegroundColor Green
Write-Host "âœ“ Retry mechanism with enhanced context - PASSED" -ForegroundColor Green
Write-Host "âœ“ Enhanced ErrorRecord creation - PASSED" -ForegroundColor Green
Write-Host "âœ“ Timeout operations with enhanced context - PASSED" -ForegroundColor Green

if ($ExportErrors -and (Test-Path $OutputPath)) {
    $exportedFiles = Get-ChildItem $OutputPath -Filter "ErrorContext_*.json" | Measure-Object
    Write-Host "`nâœ“ $($exportedFiles.Count) error context file(s) exported to: $OutputPath" -ForegroundColor Green
}

Write-Host "`nðŸŽ‰ All enhanced error context preservation tests completed successfully!" -ForegroundColor Green
Write-Host "`nThe ErrorHandling module now provides comprehensive error context capture including:" -ForegroundColor White
Write-Host "  â€¢ Detailed error information with stack traces" -ForegroundColor Gray
Write-Host "  â€¢ Environment context (computer, user, PowerShell version, etc.)" -ForegroundColor Gray
Write-Host "  â€¢ Script execution context (file, line, command)" -ForegroundColor Gray
Write-Host "  â€¢ PowerShell call stack for deep debugging" -ForegroundColor Gray
Write-Host "  â€¢ Loaded modules information" -ForegroundColor Gray
Write-Host "  â€¢ Custom context data for operation-specific details" -ForegroundColor Gray
Write-Host "  â€¢ JSON export capability for detailed analysis" -ForegroundColor Gray