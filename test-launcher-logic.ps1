# Test the exact logic from the launcher
$ModulesPath = "C:\enterprisediscovery\net6.0-windows\Modules"
$CompanyName = "ljpops"

# Import modules like the launcher does
Import-Module (Join-Path $ModulesPath "Core\ClassDefinitions.psm1") -Force
Import-Module (Join-Path $ModulesPath "Core\CompanyProfileManager.psm1") -Force
Import-Module (Join-Path $ModulesPath "Core\CredentialLoader.psm1") -Force

# Load credentials from company profile - EXACT SAME LOGIC AS LAUNCHER
Write-Host "Loading credentials..." -ForegroundColor Yellow
try {
    $credentials = Get-CompanyCredentials -CompanyName $CompanyName
    Write-Host "Credentials loaded successfully" -ForegroundColor Green
    
    # Test credential expiry
    $expiryCheck = Test-CredentialExpiry -Credentials $credentials
    Write-Host "Expiry check result:"
    Write-Host "  Valid: $($expiryCheck.Valid)"
    Write-Host "  Message: $($expiryCheck.Message)"
    Write-Host "  Warning: $($expiryCheck.Warning)"
    
    if (-not $expiryCheck.Valid) {
        throw "Credential validation failed: $($expiryCheck.Message)"
    }
    if ($expiryCheck.Warning) {
        Write-Warning $expiryCheck.Message
    }
    
    Write-Host "SUCCESS: Credentials validated" -ForegroundColor Green
}
catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $credentials = @{
        TenantId = "FALLBACK_EMPTY"
        ClientId = "FALLBACK_EMPTY"
        ClientSecret = "FALLBACK_EMPTY"
    }
}

# Create configuration
$configuration = @{
    TenantId = $credentials.TenantId
    ClientId = $credentials.ClientId
    ClientSecret = $credentials.ClientSecret
    CompanyName = $CompanyName
}

Write-Host "Final configuration:"
Write-Host "  TenantId: $($configuration.TenantId)"
Write-Host "  ClientId: $($configuration.ClientId)"
Write-Host "  HasSecret: $(-not [string]::IsNullOrEmpty($configuration.ClientSecret))"