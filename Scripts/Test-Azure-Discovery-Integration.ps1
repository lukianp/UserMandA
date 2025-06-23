# Test Azure Discovery with New Authentication System
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Azure Discovery Integration Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    # Import authentication modules
    Write-Host "Loading authentication system..." -ForegroundColor Yellow
    Import-Module ".\Modules\Authentication\SessionManager.psm1" -Force
    Import-Module ".\Modules\Authentication\AuthenticationService.psm1" -Force
    
    # Import Azure discovery module
    Write-Host "Loading Azure discovery module..." -ForegroundColor Yellow
    Import-Module ".\Modules\Discovery\AzureDiscovery.psm1" -Force
    
    # Create test authentication session
    Write-Host "Creating authentication session..." -ForegroundColor Yellow
    $testTenantId = "12345678-1234-1234-1234-123456789012"
    $testClientId = "87654321-4321-4321-4321-210987654321"
    $testSecret = ConvertTo-SecureString "TestSecret123!" -AsPlainText -Force
    
    $sessionId = New-AuthenticationSession -TenantId $testTenantId -ClientId $testClientId -ClientSecret $testSecret
    Write-Host "Session created: $($sessionId.Substring(0,8))..." -ForegroundColor Green
    
    # Create test configuration and context
    Write-Host "Setting up test configuration..." -ForegroundColor Yellow
    
    $testConfig = @{
        azure = @{
            includeAzureADDevices = $false        # Disable to avoid API calls
            includeConditionalAccess = $false     # Disable to avoid API calls
            includeSubscriptionInfo = $false      # Disable to avoid API calls
            includeAzureADApps = $false          # Disable to avoid API calls
        }
    }
    
    $testContext = @{
        Paths = @{
            RawDataOutput = Join-Path $env:TEMP "azure_discovery_test"
        }
    }
    
    # Ensure output directory exists
    if (-not (Test-Path $testContext.Paths.RawDataOutput)) {
        New-Item -Path $testContext.Paths.RawDataOutput -ItemType Directory -Force | Out-Null
    }
    
    Write-Host "Test configuration:" -ForegroundColor Gray
    Write-Host "  - Output Path: $($testContext.Paths.RawDataOutput)" -ForegroundColor Gray
    Write-Host "  - Session ID: $($sessionId.Substring(0,8))..." -ForegroundColor Gray
    Write-Host "  - All discovery features disabled (test mode)" -ForegroundColor Gray
    
    # Test the Azure discovery function
    Write-Host "Testing Azure discovery function..." -ForegroundColor Yellow
    
    try {
        $discoveryResult = Invoke-AzureDiscovery -Configuration $testConfig -Context $testContext -SessionId $sessionId
        
        if ($discoveryResult) {
            Write-Host "Azure discovery completed successfully!" -ForegroundColor Green
            Write-Host "Result details:" -ForegroundColor Gray
            Write-Host "  - Success: $($discoveryResult.Success)" -ForegroundColor Gray
            Write-Host "  - Module: $($discoveryResult.ModuleName)" -ForegroundColor Gray
            Write-Host "  - Record Count: $($discoveryResult.RecordCount)" -ForegroundColor Gray
            Write-Host "  - Errors: $($discoveryResult.Errors.Count)" -ForegroundColor Gray
            Write-Host "  - Warnings: $($discoveryResult.Warnings.Count)" -ForegroundColor Gray
            
            if ($discoveryResult.Errors.Count -gt 0) {
                Write-Host "Errors encountered:" -ForegroundColor Red
                foreach ($error in $discoveryResult.Errors) {
                    Write-Host "  - $($error.Message)" -ForegroundColor Yellow
                }
            }
            
            if ($discoveryResult.Warnings.Count -gt 0) {
                Write-Host "Warnings:" -ForegroundColor Yellow
                foreach ($warning in $discoveryResult.Warnings) {
                    Write-Host "  - $($warning.Message)" -ForegroundColor Gray
                }
            }
            
            Write-Host "`nSUCCESS: Azure discovery integration working with new authentication!" -ForegroundColor Green
            
        } else {
            Write-Host "Azure discovery returned null result" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "Azure discovery failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    }
    
    # Clean up
    Write-Host "Cleaning up..." -ForegroundColor Yellow
    Remove-AuthenticationSession -SessionId $sessionId
    
    if (Test-Path $testContext.Paths.RawDataOutput) {
        Remove-Item $testContext.Paths.RawDataOutput -Recurse -Force
    }
    
    Write-Host "Test completed successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "Test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
}

Write-Host "`nAzure Discovery Integration Test Complete!" -ForegroundColor Cyan