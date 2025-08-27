#Requires -Version 5.1

Write-Host "=== Quick PowerShell Integration Test ===" -ForegroundColor Cyan

# Test 1: Check UserMigration module
Write-Host "1. Testing UserMigration Module..." -ForegroundColor Yellow
$userMigrationPath = "D:\Scripts\UserMandA\Modules\Migration\UserMigration.psm1"
if (Test-Path $userMigrationPath) {
    Write-Host "   ✅ UserMigration.psm1 found" -ForegroundColor Green
    try {
        Import-Module $userMigrationPath -Force -ErrorAction Stop
        Write-Host "   ✅ UserMigration module loaded" -ForegroundColor Green
        
        # Test function availability
        $functions = Get-Command -Module UserMigration -ErrorAction SilentlyContinue
        if ($functions) {
            Write-Host "   📋 Functions: $($functions.Name -join ', ')" -ForegroundColor Cyan
        } else {
            Write-Host "   ⚠️  No functions found in module" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "   ❌ Failed to load: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ UserMigration.psm1 not found" -ForegroundColor Red
}

# Test 2: Check PowerShell execution environment
Write-Host ""
Write-Host "2. Testing PowerShell Environment..." -ForegroundColor Yellow
Write-Host "   📋 PowerShell Version: $($PSVersionTable.PSVersion)" -ForegroundColor Cyan
Write-Host "   📋 Execution Policy: $(Get-ExecutionPolicy)" -ForegroundColor Cyan

# Test 3: Check credential configuration
Write-Host ""
Write-Host "3. Testing Credential Configuration..." -ForegroundColor Yellow
$credPath = "c:\discoverydata\ljpops\Credentials\discoverycredentials.config"
if (Test-Path $credPath) {
    Write-Host "   ✅ Credential config exists" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Credential config not found" -ForegroundColor Yellow
}

# Test 4: Test simple migration object creation
Write-Host ""
Write-Host "4. Testing Migration Object Creation..." -ForegroundColor Yellow
try {
    if (Get-Command "New-UserMigration" -ErrorAction SilentlyContinue) {
        $testMigration = New-UserMigration -SourceDomain "test.local" -TargetDomain "target.com"
        Write-Host "   ✅ UserMigration object created successfully" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  New-UserMigration function not available" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Migration object creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Quick integration test completed" -ForegroundColor Green