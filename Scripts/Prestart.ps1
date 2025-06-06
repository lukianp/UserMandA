# -*- coding: utf-8-bom -*-

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-05
# Last Modified: 2025-06-06
# Change Log: Updated version control header


# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-05
# Last Modified: 2025-06-06
# Change Log: Initial version - any future changes require version increment

# Fix-Discovery.ps1 - Simple workaround
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