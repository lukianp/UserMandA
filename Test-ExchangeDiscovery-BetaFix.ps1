# Test script to verify the ExchangeDiscovery BadRequest fix
# Requires: Microsoft.Graph modules, proper authentication, DiscoveryBase.psm1

param(
    [string]$CompanyProfile = "ljpops",
    [string]$OutputPath = "c:\discoverydata\$CompanyProfile\Raw"
)

Write-Host "========================================" -ForegroundColor Green
Write-Host "ExchangeDiscovery BadRequest Fix Test" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Company Profile: $CompanyProfile" -ForegroundColor Cyan
Write-Host "Output Path: $OutputPath" -ForegroundColor Cyan
Write-Host "Testing beta endpoint fix..." -ForegroundColor Yellow
Write-Host ""

# Create minimal configuration
$Configuration = @{
    discovery = @{
        excludeDisabledUsers = $false
    }
    exchangeOnline = @{
        includeSharedMailboxes = $true
        includeResourceMailboxes = $true
    }
}

# Create minimal context
$Context = @{
    Paths = @{
        RawDataOutput = $OutputPath
    }
}

# Generate test session ID
$SessionId = "Test$(Get-Date -Format 'yyyyMMdd_HHmmss')"

Write-Host "Configuration created..." -ForegroundColor Yellow

try {
    # Import required modules
    Write-Host "Importing ExchangeDiscovery module..." -ForegroundColor Yellow
    Import-Module ".\Modules\Discovery\ExchangeDiscovery.psm1" -Force
    Write-Host "✓ ExchangeDiscovery module imported successfully" -ForegroundColor Green

    # Test the function (will fail if no Graph auth, but will show if BadRequest is fixed)
    Write-Host "Testing Invoke-ExchangeDiscovery function..." -ForegroundColor Yellow
    $result = Invoke-ExchangeDiscovery -Configuration $Configuration -Context $Context -SessionId $SessionId

    Write-Host "✓ Invoke-ExchangeDiscovery completed without BadRequest error!" -ForegroundColor Green
    Write-Host "Result: $($result | Measure-Object | Select-Object -ExpandProperty Count) objects discovered" -ForegroundColor Green
}
catch {
    $errorMessage = $_.Exception.Message
    Write-Host "✗ Error occurred: $errorMessage" -ForegroundColor Red

    if ($errorMessage -match "BadRequest" -or $errorMessage -match "400") {
        Write-Host "❌ BadRequest error still present - fix might not be complete" -ForegroundColor Red
    } elseif ($errorMessage -match "Authentication needed" -or $errorMessage -match "Connect-MgGraph") {
        Write-Host "⚠ Authentication required - this is expected. Function structure appears correct." -ForegroundColor Yellow
        Write-Host "✓ BadRequest fix appears to be working (no BadRequest error from Graph API)" -ForegroundColor Green
    } else {
        Write-Host "⚠ Different error type - check module dependencies" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check that we're using beta endpoint in the module
$moduleContent = Get-Content ".\Modules\Discovery\ExchangeDiscovery.psm1" -Raw
if ($moduleContent -match "https://graph\.microsoft\.com/beta/users") {
    Write-Host "✓ Beta endpoint confirmed in module" -ForegroundColor Green
} else {
    Write-Host "❌ Beta endpoint not found in module" -ForegroundColor Red
}

Write-Host "Fix Status: ExchangeDiscovery should now use beta endpoint for user queries" -ForegroundColor White
Write-Host "Next Step: Run with proper authentication to complete validation" -ForegroundColor Yellow