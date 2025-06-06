# Test script to verify module loading fixes
Write-Host "Testing module loading fixes..." -ForegroundColor Cyan

# Test 1: DataAggregation module loading
Write-Host ""
Write-Host "1. Testing DataAggregation module..." -ForegroundColor Yellow
try {
    Import-Module ".\Modules\Processing\DataAggregation.psm1" -Force -ErrorAction Stop
    Write-Host "   SUCCESS: DataAggregation module loaded successfully" -ForegroundColor Green
    
    # Test if the main function is available
    if (Get-Command Start-DataAggregation -ErrorAction SilentlyContinue) {
        Write-Host "   SUCCESS: Start-DataAggregation function is available" -ForegroundColor Green
    } else {
        Write-Host "   ERROR: Start-DataAggregation function not found" -ForegroundColor Red
    }
} catch {
    Write-Host "   ERROR: DataAggregation module failed to load: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: CSVExport module loading
Write-Host ""
Write-Host "2. Testing CSVExport module..." -ForegroundColor Yellow
try {
    Import-Module ".\Modules\Export\CSVExport.psm1" -Force -ErrorAction Stop
    Write-Host "   SUCCESS: CSVExport module loaded successfully" -ForegroundColor Green
    
    # Test if the main function is available
    if (Get-Command Export-ToCSV -ErrorAction SilentlyContinue) {
        Write-Host "   SUCCESS: Export-ToCSV function is available" -ForegroundColor Green
    } else {
        Write-Host "   ERROR: Export-ToCSV function not found" -ForegroundColor Red
    }
} catch {
    Write-Host "   ERROR: CSVExport module failed to load: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: EnhancedConnectionManager module loading
Write-Host ""
Write-Host "3. Testing EnhancedConnectionManager module..." -ForegroundColor Yellow
try {
    Import-Module ".\Modules\Connectivity\EnhancedConnectionManager.psm1" -Force -ErrorAction Stop
    Write-Host "   SUCCESS: EnhancedConnectionManager module loaded successfully" -ForegroundColor Green
    
    # Test if the main functions are available
    $expectedFunctions = @(
        'Initialize-AllConnections',
        'Connect-ToMicrosoftGraph',
        'Connect-ToExchangeOnline'
    )
    
    foreach ($func in $expectedFunctions) {
        if (Get-Command $func -ErrorAction SilentlyContinue) {
            Write-Host "   SUCCESS: $func function is available" -ForegroundColor Green
        } else {
            Write-Host "   ERROR: $func function not found" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "   ERROR: EnhancedConnectionManager module failed to load: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Module loading test completed!" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan