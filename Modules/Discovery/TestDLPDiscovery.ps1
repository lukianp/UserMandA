# Test script for DLPDiscovery connection improvements

Write-Host "=== Testing DLPDiscovery Connection Logic ===`n" -ForegroundColor Cyan

# Create test configuration
$testConfig = @{
    TenantId = "test-tenant-id"
    ClientId = "test-client-id"
    ClientSecret = "test-client-secret"
}

# Create test context
$testContext = @{
    Paths = @{
        RawDataOutput = "c:\temp\DLPTestOutput"
    }
    Company = @{
        Name = "Test Company"
    }
}

# Create output directory if it doesn't exist
if (-not (Test-Path "c:\temp\DLPTestOutput")) {
    New-Item -Path "c:\temp\DLPTestOutput" -ItemType Directory -Force | Out-Null
}

# Generate test session ID
$testSessionId = [guid]::NewGuid().ToString()

Write-Host "Test Configuration:" -ForegroundColor Yellow
Write-Host "  Tenant ID: test-tenant-id"
Write-Host "  Client ID: test-client-id"
Write-Host "  Output Path: c:\temp\DLPTestOutput"
Write-Host "  Session ID: $testSessionId`n"

# Import the discovery module
Write-Host "Importing DLPDiscovery module..." -ForegroundColor Green

try {
    Import-Module "$PSScriptRoot\DLPDiscovery.psm1" -Force
    Write-Host "Module imported successfully`n" -ForegroundColor Green
} catch {
    Write-Host "Failed to import module: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test the connection validation logic
Write-Host "Testing connection logic (without actual credentials)..." -ForegroundColor Green
Write-Host "This should show improved error messages and graceful handling of missing connections."
Write-Host ""

try {
    $result = Invoke-DLPDiscovery -Configuration $testConfig -Context $testContext -SessionId $testSessionId

    Write-Host "=== Discovery Result ===" -ForegroundColor Cyan
    Write-Host "Success: $($result.Success)"
    Write-Host "Message: $($result.Message)"

    if ($result.Errors.Count -gt 0) {
        Write-Host "Errors:" -ForegroundColor Red
        foreach ($err in $result.Errors) {
            Write-Host "  - $($err.Message)" -ForegroundColor Red
        }
    }

    if ($result.Warnings.Count -gt 0) {
        Write-Host "Warnings:" -ForegroundColor Yellow
        foreach ($warning in $result.Warnings) {
            Write-Host "  - $($warning.Message)" -ForegroundColor Yellow
        }
    }

} catch {
    Write-Host "Discovery failed with exception:" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "=== Test Complete ===" -ForegroundColor Cyan