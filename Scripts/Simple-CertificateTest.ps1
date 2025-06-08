# Simple Certificate Elimination Test
# Tests that configuration has no certificate dependencies

param(
    [string]$ConfigPath = ".\Configuration\default-config.json"
)

Write-Host "🔄 Testing Certificate Elimination..." -ForegroundColor Cyan

# Test 1: Check configuration file exists
if (-not (Test-Path $ConfigPath)) {
    Write-Host "❌ Configuration file not found: $ConfigPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Configuration file found" -ForegroundColor Green

# Test 2: Load and validate configuration
try {
    $config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
    Write-Host "✅ Configuration loaded successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to load configuration: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Check authentication method
if ($config.authentication.authenticationMethod -eq "ClientSecret") {
    Write-Host "✅ Authentication method is ClientSecret" -ForegroundColor Green
} else {
    Write-Host "❌ Authentication method is not ClientSecret: $($config.authentication.authenticationMethod)" -ForegroundColor Red
    exit 1
}

# Test 4: Check for certificate thumbprint (should not exist)
$hasCertThumbprint = $false
if ($config.authentication.PSObject.Properties.Name -contains "certificateThumbprint") {
    $hasCertThumbprint = $true
}

if (-not $hasCertThumbprint) {
    Write-Host "✅ No certificate thumbprint found in configuration" -ForegroundColor Green
} else {
    Write-Host "❌ Certificate thumbprint still present in configuration" -ForegroundColor Red
    exit 1
}

# Test 5: Check required modules exist
$modules = @(
    ".\Modules\Connectivity\UnifiedConnectionManager.psm1",
    ".\Modules\Authentication\Authentication.psm1",
    ".\Modules\Authentication\CredentialManagement.psm1"
)

$allModulesExist = $true
foreach ($module in $modules) {
    if (Test-Path $module) {
        Write-Host "✅ Module found: $module" -ForegroundColor Green
    } else {
        Write-Host "❌ Module missing: $module" -ForegroundColor Red
        $allModulesExist = $false
    }
}

if (-not $allModulesExist) {
    exit 1
}

# Test 6: Check app registration script
$appRegScript = ".\DiscoveryCreateAppRegistration.ps1"
if (Test-Path $appRegScript) {
    Write-Host "✅ App registration script found" -ForegroundColor Green
} else {
    Write-Host "❌ App registration script missing" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Certificate Elimination Validation Complete!" -ForegroundColor Green
Write-Host "✅ All tests passed - No certificate dependencies found" -ForegroundColor Green
Write-Host "✅ Configuration is ready for client secret authentication" -ForegroundColor Green

exit 0