# Test and Fix PowerShell Module Scoping Issues
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PowerShell Module Scoping Diagnosis" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "Step 1: Testing individual module imports..." -ForegroundColor Yellow

# Test 1: Import SessionManager alone
Write-Host "Importing SessionManager alone..." -ForegroundColor Gray
Remove-Module SessionManager -Force -ErrorAction SilentlyContinue
Import-Module ".\Modules\Authentication\SessionManager.psm1" -Force -Global

$cmd1 = Get-Command New-AuthenticationSession -ErrorAction SilentlyContinue
Write-Host "New-AuthenticationSession available: $($cmd1 -ne $null)" -ForegroundColor $(if ($cmd1) { "Green" } else { "Red" })

# Test 2: Import AuthenticationService after SessionManager
Write-Host "Importing AuthenticationService after SessionManager..." -ForegroundColor Gray
Import-Module ".\Modules\Authentication\AuthenticationService.psm1" -Force -Global

$cmd2 = Get-Command New-AuthenticationSession -ErrorAction SilentlyContinue
Write-Host "New-AuthenticationSession still available: $($cmd2 -ne $null)" -ForegroundColor $(if ($cmd2) { "Green" } else { "Red" })

# Test 3: Check what modules are loaded
Write-Host "Loaded modules:" -ForegroundColor Gray
Get-Module | Where-Object { $_.Name -like "*Session*" -or $_.Name -like "*Auth*" } | ForEach-Object {
    Write-Host "  - $($_.Name): $($_.ExportedFunctions.Keys -join ', ')" -ForegroundColor Gray
}

# Test 4: Try explicit function import
Write-Host "Step 2: Testing explicit function import..." -ForegroundColor Yellow
try {
    # Remove all auth modules
    Get-Module | Where-Object { $_.Name -like "*Session*" -or $_.Name -like "*Auth*" } | Remove-Module -Force
    
    # Import with explicit function import
    Import-Module ".\Modules\Authentication\SessionManager.psm1" -Force -Global -Function @(
        'New-AuthenticationSession',
        'Get-AuthenticationSession', 
        'Remove-AuthenticationSession',
        'Get-AuthenticationSessionCount',
        'Clear-AllAuthenticationSessions'
    )
    
    $cmd3 = Get-Command New-AuthenticationSession -ErrorAction SilentlyContinue
    Write-Host "Explicit import result: $($cmd3 -ne $null)" -ForegroundColor $(if ($cmd3) { "Green" } else { "Red" })
    
    if ($cmd3) {
        Write-Host "Testing function call..." -ForegroundColor Gray
        $testSecret = ConvertTo-SecureString "TestSecret123!" -AsPlainText -Force
        $sessionId = New-AuthenticationSession -TenantId "test-tenant" -ClientId "test-client" -ClientSecret $testSecret
        Write-Host "Function call successful: $($sessionId.Substring(0,8))..." -ForegroundColor Green
        Remove-AuthenticationSession -SessionId $sessionId
    }
    
} catch {
    Write-Host "Explicit import failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Step 3: Testing dot-sourcing approach..." -ForegroundColor Yellow
try {
    # Remove all modules
    Get-Module | Where-Object { $_.Name -like "*Session*" -or $_.Name -like "*Auth*" } | Remove-Module -Force
    
    # Try dot-sourcing the module file
    . ".\Modules\Authentication\SessionManager.psm1"
    
    $cmd4 = Get-Command New-AuthenticationSession -ErrorAction SilentlyContinue
    Write-Host "Dot-sourcing result: $($cmd4 -ne $null)" -ForegroundColor $(if ($cmd4) { "Green" } else { "Red" })
    
} catch {
    Write-Host "Dot-sourcing failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nModule Scoping Diagnosis Complete!" -ForegroundColor Cyan