# Deploy Credential Fixes to C:\enterprisediscovery

Write-Host "=== DEPLOYING CREDENTIAL FIXES ===" -ForegroundColor Cyan
Write-Host ""

# Create deployment directories
New-Item -ItemType Directory -Path 'C:\enterprisediscovery\Modules\Core' -Force -ErrorAction SilentlyContinue | Out-Null
New-Item -ItemType Directory -Path 'C:\enterprisediscovery\Modules\Discovery' -Force -ErrorAction SilentlyContinue | Out-Null

# Copy Core module
Write-Host "Copying Core modules..." -ForegroundColor Yellow
Copy-Item -Path 'D:\Scripts\UserMandA\Modules\Core\CredentialLoader.psm1' -Destination 'C:\enterprisediscovery\Modules\Core\' -Force
Write-Host "  [OK] CredentialLoader.psm1" -ForegroundColor Green

# Copy Discovery modules
Write-Host ""
Write-Host "Copying Discovery modules..." -ForegroundColor Yellow

$modules = @(
    'AzureDiscovery.psm1',
    'ConditionalAccessDiscovery.psm1',
    'IntuneDiscovery.psm1',
    'ExchangeDiscovery.psm1',
    'TeamsDiscovery.psm1',
    'SharePointDiscovery.psm1',
    'OneDriveDiscovery.psm1',
    'LicensingDiscovery.psm1',
    'PowerPlatformDiscovery.psm1',
    'ActiveDirectoryDiscovery.psm1'
)

$successCount = 0
foreach ($module in $modules) {
    try {
        Copy-Item -Path "D:\Scripts\UserMandA\Modules\Discovery\$module" -Destination 'C:\enterprisediscovery\Modules\Discovery\' -Force -ErrorAction Stop
        Write-Host "  [OK] $module" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "  [X] Failed to copy $module`: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== DEPLOYMENT SUMMARY ===" -ForegroundColor Cyan
Write-Host "Successfully deployed: $($successCount + 1) / 11 modules" -ForegroundColor $(if ($successCount -eq 10) { 'Green' } else { 'Yellow' })
Write-Host ""

if ($successCount -eq 10) {
    Write-Host "All fixes successfully deployed to C:\enterprisediscovery\" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Verify credential files exist in c:\discoverydata\<CompanyName>\Credentials\" -ForegroundColor White
    Write-Host "  2. Run: .\DiscoveryModuleLauncher.ps1 -ModuleName 'AzureDiscovery' -CompanyName '<YourCompany>'" -ForegroundColor White
    Write-Host "  3. Check logs for 'Credentials validated successfully' message" -ForegroundColor White
} else {
    Write-Host "Some modules failed to deploy. Check errors above." -ForegroundColor Red
}
