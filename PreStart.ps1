# Fix-Discovery.ps1 - Simple workaround for the Zedra Profile
param(
    [string]$CompanyName = "Zedra"
)

# Ensure global context is set
if (-not $global:MandA) {
    Write-Host "Setting up global environment..." -ForegroundColor Yellow
    . ".\Scripts\Set-SuiteEnvironment.ps1" -CompanyName $CompanyName
}

# Now run your discovery
Write-Host "`nGlobal environment ready. You can now run discovery." -ForegroundColor Green
Write-Host "Run: .\QuickStart.ps1" -ForegroundColor Cyan
