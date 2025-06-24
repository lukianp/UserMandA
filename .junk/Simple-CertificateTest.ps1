# Simple Certificate Elimination Test
# Tests that configuration has no certificate dependencies

param(
    [string]$ConfigPath = ".\Configuration\default-config.json"
)

Write-Host "?? Testing Certificate Elimination..." -ForegroundColor Cyan

# Test 1: Check configuration file exists
if (-not (Test-Path $ConfigPath)) {
    Write-Host "[X] Configuration file not found: $ConfigPath" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Configuration file found" -ForegroundColor Green

# Test 2: Load and validate configuration
try {
    $config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
    Write-Host "[OK] Configuration loaded successfully" -ForegroundColor Green
} catch {
    Write-Host "[X] Failed to load configuration: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Check authentication method
if ($config.authentication.authenticationMethod -eq "ClientSecret") {
    Write-Host "[OK] Authentication method is ClientSecret" -ForegroundColor Green
} else {
    Write-Host "[X] Authentication method is not ClientSecret: $($config.authentication.authenticationMethod)" -ForegroundColor Red
    exit 1
}

# Test 4: Check for certificate thumbprint (should not exist)
$hasCertThumbprint = $false
if ($config.authentication.PSObject.Properties.Name -contains "certificateThumbprint") {
    $hasCertThumbprint = $true
}

if (-not $hasCertThumbprint) {
    Write-Host "[OK] No certificate thumbprint found in configuration" -ForegroundColor Green
} else {
    Write-Host "[X] Certificate thumbprint still present in configuration" -ForegroundColor Red
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
        Write-Host "[OK] Module found: $module" -ForegroundColor Green
    } else {
        Write-Host "[X] Module missing: $module" -ForegroundColor Red
        $allModulesExist = $false
    }
}

if (-not $allModulesExist) {
    exit 1
}

# Test 6: Check app registration script
$appRegScript = ".\DiscoveryCreateAppRegistration.ps1"
if (Test-Path $appRegScript) {
    Write-Host "[OK] App registration script found" -ForegroundColor Green
} else {
    Write-Host "[X] App registration script missing" -ForegroundColor Red
    exit 1
}

Write-Host "`n?? Certificate Elimination Validation Complete!" -ForegroundColor Green
Write-Host "[OK] All tests passed - No certificate dependencies found" -ForegroundColor Green
Write-Host "[OK] Configuration is ready for client secret authentication" -ForegroundColor Green

exit 0