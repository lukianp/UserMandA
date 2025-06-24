# Simple test for SessionManager module
Write-Host "Testing SessionManager module import..." -ForegroundColor Yellow

try {
    # Import with verbose output
    Import-Module ".\Modules\Authentication\SessionManager.psm1" -Force -Verbose
    
    Write-Host "Checking available commands..." -ForegroundColor Yellow
    $commands = Get-Command -Module SessionManager
    Write-Host "Commands found: $($commands.Count)" -ForegroundColor Green
    $commands | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Gray }
    
    Write-Host "Checking specific function..." -ForegroundColor Yellow
    $newAuthCmd = Get-Command New-AuthenticationSession -ErrorAction SilentlyContinue
    if ($newAuthCmd) {
        Write-Host "New-AuthenticationSession found: $($newAuthCmd.Source)" -ForegroundColor Green
    } else {
        Write-Host "New-AuthenticationSession NOT found" -ForegroundColor Red
    }
    
    Write-Host "Testing function call..." -ForegroundColor Yellow
    $testSecret = ConvertTo-SecureString "TestSecret123!" -AsPlainText -Force
    $sessionId = New-AuthenticationSession -TenantId "test-tenant" -ClientId "test-client" -ClientSecret $testSecret
    Write-Host "Session created: $sessionId" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack: $($_.ScriptStackTrace)" -ForegroundColor Red
}