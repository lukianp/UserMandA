# Test discovery authentication
$ModulesPath = "C:\enterprisediscovery\net6.0-windows\Modules"
$CompanyName = "ljpops"

Write-Host "=== Testing Discovery Authentication ===" -ForegroundColor Cyan

# Import required modules
Write-Host "Loading modules..." -ForegroundColor Yellow
Import-Module (Join-Path $ModulesPath "Core\ClassDefinitions.psm1") -Force
Import-Module (Join-Path $ModulesPath "Core\CompanyProfileManager.psm1") -Force
Import-Module (Join-Path $ModulesPath "Core\CredentialLoader.psm1") -Force
Import-Module (Join-Path $ModulesPath "Authentication\SessionManager.psm1") -Force
Import-Module (Join-Path $ModulesPath "Authentication\AuthenticationService.psm1") -Force

Write-Host "Modules loaded successfully" -ForegroundColor Green

# Load credentials
Write-Host "Loading credentials..." -ForegroundColor Yellow
try {
    $credentials = Get-CompanyCredentials -CompanyName $CompanyName
    Write-Host "Credentials loaded successfully" -ForegroundColor Green
    Write-Host "TenantId: $($credentials.TenantId)" -ForegroundColor Gray
    Write-Host "ClientId: $($credentials.ClientId)" -ForegroundColor Gray
    Write-Host "HasSecret: $(-not [string]::IsNullOrEmpty($credentials.ClientSecret))" -ForegroundColor Gray
    
    # Test credential expiry
    $expiryCheck = Test-CredentialExpiry -Credentials $credentials
    Write-Host "Expiry Valid: $($expiryCheck.Valid)" -ForegroundColor Gray
    Write-Host "Expiry Message: $($expiryCheck.Message)" -ForegroundColor Gray
    
    if (-not $expiryCheck.Valid) {
        throw "Credential validation failed: $($expiryCheck.Message)"
    }
    if ($expiryCheck.Warning) {
        Write-Warning $expiryCheck.Message
    }
}
catch {
    Write-Host "Failed to load credentials: $($_.Exception.Message)" -ForegroundColor Red
    throw
}

# Create configuration
$configuration = @{
    TenantId = $credentials.TenantId
    ClientId = $credentials.ClientId
    ClientSecret = $credentials.ClientSecret
    CompanyName = $CompanyName
}

Write-Host "Configuration created successfully" -ForegroundColor Green

# Initialize authentication service
Write-Host "Initializing authentication service..." -ForegroundColor Yellow
try {
    $authResult = Initialize-AuthenticationService -Configuration $configuration
    if ($authResult.Success) {
        Write-Host "Authentication service initialized successfully" -ForegroundColor Green
        Write-Host "SessionId: $($authResult.SessionId)" -ForegroundColor Gray
    } else {
        throw "Authentication initialization failed: $($authResult.Error)"
    }
} catch {
    Write-Host "Failed to initialize authentication: $($_.Exception.Message)" -ForegroundColor Red
    throw
}

# Test Graph connection
Write-Host "Testing Graph connection..." -ForegroundColor Yellow
try {
    $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $authResult.SessionId
    Write-Host "Graph connection successful" -ForegroundColor Green
} catch {
    Write-Host "Graph connection failed: $($_.Exception.Message)" -ForegroundColor Red
    throw
}

Write-Host "=== All Tests Passed ===" -ForegroundColor Green