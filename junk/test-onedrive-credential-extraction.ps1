# Test OneDriveDiscovery credential extraction
# This script tests the credential extraction logic without actually executing discovery

Write-Host "`n=== OneDrive Discovery Credential Extraction Test ===" -ForegroundColor Cyan

# Import the module
$modulePath = 'D:\Scripts\UserMandA\Modules\Discovery\OneDriveDiscovery.psm1'
Write-Host "`nImporting module: $modulePath" -ForegroundColor Yellow
Import-Module $modulePath -Force

# Test Case 1: Configuration with all credentials
Write-Host "`n--- TEST 1: Configuration with all credentials ---" -ForegroundColor Cyan
$testConfig1 = @{
    TenantId = '12345678-1234-1234-1234-123456789012'
    ClientId = '87654321-4321-4321-4321-210987654321'
    ClientSecret = 'test-secret-value-42-characters-long!!!'
    discovery = @{
        onedrive = @{
            tenantName = 'testcompany'
        }
    }
}

Write-Host "Configuration created with:" -ForegroundColor White
Write-Host "  TenantId: $($testConfig1.TenantId)" -ForegroundColor Gray
Write-Host "  ClientId: $($testConfig1.ClientId)" -ForegroundColor Gray
Write-Host "  ClientSecret: $($testConfig1.ClientSecret.Length) characters" -ForegroundColor Gray
Write-Host "  Tenant Name: $($testConfig1.discovery.onedrive.tenantName)" -ForegroundColor Gray

# Test Case 2: Configuration with missing TenantId
Write-Host "`n--- TEST 2: Configuration with missing TenantId ---" -ForegroundColor Cyan
$testConfig2 = @{
    ClientId = '87654321-4321-4321-4321-210987654321'
    ClientSecret = 'test-secret-value'
    discovery = @{
        onedrive = @{
            tenantName = 'testcompany'
        }
    }
}

Write-Host "Configuration created with:" -ForegroundColor White
Write-Host "  TenantId: <missing>" -ForegroundColor Red
Write-Host "  ClientId: $($testConfig2.ClientId)" -ForegroundColor Gray
Write-Host "  ClientSecret: $($testConfig2.ClientSecret.Length) characters" -ForegroundColor Gray

# Test Case 3: Configuration with missing ClientSecret
Write-Host "`n--- TEST 3: Configuration with missing ClientSecret ---" -ForegroundColor Cyan
$testConfig3 = @{
    TenantId = '12345678-1234-1234-1234-123456789012'
    ClientId = '87654321-4321-4321-4321-210987654321'
    discovery = @{
        onedrive = @{
            tenantName = 'testcompany'
        }
    }
}

Write-Host "Configuration created with:" -ForegroundColor White
Write-Host "  TenantId: $($testConfig3.TenantId)" -ForegroundColor Gray
Write-Host "  ClientId: $($testConfig3.ClientId)" -ForegroundColor Gray
Write-Host "  ClientSecret: <missing>" -ForegroundColor Red

# Test Case 4: Null Configuration
Write-Host "`n--- TEST 4: Null Configuration ---" -ForegroundColor Cyan
$testConfig4 = $null
Write-Host "Configuration: <null>" -ForegroundColor Red

# Test Case 5: Configuration with SecureString ClientSecret
Write-Host "`n--- TEST 5: Configuration with SecureString ClientSecret ---" -ForegroundColor Cyan
$secureSecret = ConvertTo-SecureString -String 'test-secret-value' -AsPlainText -Force
$testConfig5 = @{
    TenantId = '12345678-1234-1234-1234-123456789012'
    ClientId = '87654321-4321-4321-4321-210987654321'
    ClientSecret = $secureSecret
    discovery = @{
        onedrive = @{
            tenantName = 'testcompany'
        }
    }
}

Write-Host "Configuration created with:" -ForegroundColor White
Write-Host "  TenantId: $($testConfig5.TenantId)" -ForegroundColor Gray
Write-Host "  ClientId: $($testConfig5.ClientId)" -ForegroundColor Gray
Write-Host "  ClientSecret: SecureString" -ForegroundColor Gray

# Summary of test configurations
Write-Host "`n=== Test Configurations Summary ===" -ForegroundColor Cyan
Write-Host "Test 1: All credentials present (string secret)" -ForegroundColor White
Write-Host "Test 2: Missing TenantId" -ForegroundColor White
Write-Host "Test 3: Missing ClientSecret" -ForegroundColor White
Write-Host "Test 4: Null Configuration" -ForegroundColor White
Write-Host "Test 5: All credentials present (SecureString secret)" -ForegroundColor White

Write-Host "`n=== Expected Logging Behavior ===" -ForegroundColor Cyan
Write-Host "Test 1 should log:" -ForegroundColor White
Write-Host "  - SUCCESS for TenantId, ClientId, ClientSecret" -ForegroundColor Green
Write-Host "  - SUCCESS for 'All required credentials extracted'" -ForegroundColor Green
Write-Host "  - credentialsValid = True" -ForegroundColor Green

Write-Host "`nTest 2 should log:" -ForegroundColor White
Write-Host "  - WARN for TenantId" -ForegroundColor Yellow
Write-Host "  - SUCCESS for ClientId, ClientSecret" -ForegroundColor Green
Write-Host "  - WARN for 'Incomplete credentials'" -ForegroundColor Yellow
Write-Host "  - credentialsValid = False" -ForegroundColor Red

Write-Host "`nTest 3 should log:" -ForegroundColor White
Write-Host "  - SUCCESS for TenantId, ClientId" -ForegroundColor Green
Write-Host "  - WARN for ClientSecret" -ForegroundColor Yellow
Write-Host "  - WARN for 'Incomplete credentials'" -ForegroundColor Yellow
Write-Host "  - credentialsValid = False" -ForegroundColor Red

Write-Host "`nTest 4 should log:" -ForegroundColor White
Write-Host "  - WARN for 'Configuration parameter is null or empty'" -ForegroundColor Yellow
Write-Host "  - credentialsValid = False" -ForegroundColor Red

Write-Host "`nTest 5 should log:" -ForegroundColor White
Write-Host "  - SUCCESS for TenantId, ClientId" -ForegroundColor Green
Write-Host "  - SUCCESS for ClientSecret with 'SecureString' (not length)" -ForegroundColor Green
Write-Host "  - SUCCESS for 'All required credentials extracted'" -ForegroundColor Green
Write-Host "  - credentialsValid = True" -ForegroundColor Green

Write-Host "`n=== Note ===" -ForegroundColor Cyan
Write-Host "To test the actual credential extraction, you would need to:" -ForegroundColor White
Write-Host "1. Mock the Get-AuthenticationForService function" -ForegroundColor Gray
Write-Host "2. Mock the Get-MgContext function" -ForegroundColor Gray
Write-Host "3. Mock the Get-MgOrganization function" -ForegroundColor Gray
Write-Host "4. Call Invoke-OneDriveDiscovery with test configurations" -ForegroundColor Gray
Write-Host "5. Observe the log output for credential extraction messages" -ForegroundColor Gray

Write-Host "`nTest configurations are ready. Module is loaded." -ForegroundColor Green
Write-Host "You can now manually call Invoke-OneDriveDiscovery with these configurations." -ForegroundColor Green

# Cleanup
Remove-Module OneDriveDiscovery -ErrorAction SilentlyContinue
Write-Host "`nModule unloaded. Test complete." -ForegroundColor Cyan
