# Test script to verify discovery fixes
Write-Host "=== Testing Discovery Fixes ===" -ForegroundColor Cyan

# Test 1: Check if Invoke-WithTimeout function is available
Write-Host "`n1. Testing Invoke-WithTimeout function availability..." -ForegroundColor Yellow

$errorHandlingPath = ".\Modules\Utilities\ErrorHandling.psm1"
if (Test-Path $errorHandlingPath) {
    Import-Module $errorHandlingPath -Force -Global -ErrorAction SilentlyContinue
    Write-Host "   ✓ ErrorHandling module loaded" -ForegroundColor Green
    
    if (Get-Command "Invoke-WithTimeout" -ErrorAction SilentlyContinue) {
        Write-Host "   ✓ Invoke-WithTimeout function is available" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Invoke-WithTimeout function NOT found" -ForegroundColor Red
    }
} else {
    Write-Host "   ✗ ErrorHandling module not found" -ForegroundColor Red
}

# Test 2: Check if SQLServer discovery module exists and loads
Write-Host "`n2. Testing SQLServer discovery module..." -ForegroundColor Yellow

$sqlServerPath = ".\Modules\Discovery\SQLServerDiscovery.psm1"
if (Test-Path $sqlServerPath) {
    Import-Module $sqlServerPath -Force -Global -ErrorAction SilentlyContinue
    Write-Host "   ✓ SQLServerDiscovery module found" -ForegroundColor Green
    
    if (Get-Command "Invoke-SQLServerDiscovery" -ErrorAction SilentlyContinue) {
        Write-Host "   ✓ Invoke-SQLServerDiscovery function is available" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Invoke-SQLServerDiscovery function NOT found" -ForegroundColor Red
    }
} else {
    Write-Host "   ✗ SQLServerDiscovery module not found" -ForegroundColor Red
}

# Test 3: Check if FileServer discovery module exists and loads
Write-Host "`n3. Testing FileServer discovery module..." -ForegroundColor Yellow

$fileServerPath = ".\Modules\Discovery\FileServerDiscovery.psm1"
if (Test-Path $fileServerPath) {
    Import-Module $fileServerPath -Force -Global -ErrorAction SilentlyContinue
    Write-Host "   ✓ FileServerDiscovery module found" -ForegroundColor Green
    
    if (Get-Command "Invoke-FileServerDiscovery" -ErrorAction SilentlyContinue) {
        Write-Host "   ✓ Invoke-FileServerDiscovery function is available" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Invoke-FileServerDiscovery function NOT found" -ForegroundColor Red
    }
} else {
    Write-Host "   ✗ FileServerDiscovery module not found" -ForegroundColor Red
}

Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
Write-Host "Key modules tested. You can now try running QuickStart.ps1 again." -ForegroundColor White