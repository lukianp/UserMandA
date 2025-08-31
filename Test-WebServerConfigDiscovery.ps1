# Test script to verify WebServerConfigDiscovery fixes
param(
    [string]$CompanyName = "TestCompany"
)

Write-Host "=== Testing WebServerConfigDiscovery Fixes ===" -ForegroundColor Cyan

try {
    # Import required modules
    $ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
    $ModulesPath = Join-Path $ScriptRoot "Modules"
    Import-Module (Join-Path $ModulesPath "Discovery\WebServerConfigDiscovery.psm1") -Force

    # Create test context
    $outputPath = Join-Path $ScriptRoot "TestWebServerOutput"
    if (-not (Test-Path $outputPath)) {
        New-Item -ItemType Directory -Path $outputPath -Force | Out-Null
    }

    $testContext = @{
        Paths = @{
            RawDataOutput = $outputPath
        }
        DiscoverySession = [guid]::NewGuid().ToString()
    }

    # Create test configuration
    $testConfig = @{
        CompanyName = $CompanyName
        webServers = @{
            apache = @{ paths = $null }
            nginx = @{ paths = $null }
        }
    }

    # Test the discovery function
    Write-Host "Testing Invoke-WebServerConfigDiscovery..." -ForegroundColor Yellow
    $result = Invoke-WebServerConfigDiscovery -Configuration $testConfig -Context $testContext -SessionId $testContext.DiscoverySession

    Write-Host "Discovery completed successfully!" -ForegroundColor Green
    Write-Host "Success: $($result.Success)" -ForegroundColor White
    Write-Host "RecordCount: $($result.RecordCount)" -ForegroundColor White
    Write-Host "Has EndTime: $([bool]$result.EndTime)" -ForegroundColor White

    if ($result.Errors.Count -gt 0) {
        Write-Host "Errors:" -ForegroundColor Red
        foreach ($err in $result.Errors) {
            Write-Host "  - $($err.Message)" -ForegroundColor Red
        }
    }

    if ($result.Warnings.Count -gt 0) {
        Write-Host "Warnings:" -ForegroundColor Yellow
        foreach ($warn in $result.Warnings) {
            Write-Host "  - $($warn.Message)" -ForegroundColor Yellow
        }
    }

} catch {
    Write-Host "Test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "StackTrace: $($_.ScriptStackTrace)" -ForegroundColor Red
} finally {
    Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
}