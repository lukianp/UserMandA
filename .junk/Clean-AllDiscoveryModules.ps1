# Clean All Discovery Modules Script
# This script completely rewrites all discovery modules to use ONLY the new session-based authentication

$modules = @(
    "GraphDiscovery",
    "IntuneDiscovery", 
    "SharePointDiscovery",
    "TeamsDiscovery",
    "LicensingDiscovery",
    "ExternalIdentityDiscovery",
    "GPODiscovery",
    "EnvironmentDetectionDiscovery",
    "FileServerDiscovery",
    "NetworkInfrastructureDiscovery",
    "SQLServerDiscovery"
)

Write-Host "Cleaning all discovery modules to use ONLY new session-based authentication..." -ForegroundColor Green

foreach ($module in $modules) {
    $filePath = "Modules/Discovery/$module.psm1"
    
    if (Test-Path $filePath) {
        Write-Host "  [CLEANING] $module.psm1" -ForegroundColor Cyan
        
        # Read the current file
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Remove ALL old authentication functions and code
        $content = $content -replace '(?s)function Get-AuthInfoFromConfiguration \{.*?^}', ''
        $content = $content -replace '(?s)# 4\. AUTHENTICATE & CONNECT.*?Write-.*Log.*"Connected to Microsoft Graph".*?Context \$Context.*?\n', ''
        $content = $content -replace '(?s)\$authInfo = Get-AuthInfoFromConfiguration.*?return \$result.*?\n.*?\n', ''
        $content = $content -replace '(?s)# Reconstruct auth from thread-safe config.*?return \$result.*?\n.*?\n', ''
        $content = $content -replace '(?s)if \(-not \$authInfo.*?return \$result.*?\n.*?\n', ''
        $content = $content -replace '(?s)# Connect to Microsoft Graph.*?return \$result.*?\n.*?\n', ''
        $content = $content -replace '(?s)Connect-MgGraph.*?-NoWelcome -ErrorAction Stop', ''
        $content = $content -replace '\$credential = New-Object System\.Management\.Automation\.PSCredential.*?\n', ''
        $content = $content -replace 'ConvertTo-SecureString \$authInfo\.ClientSecret -AsPlainText -Force.*?\n', ''
        
        # Clean up any remaining old auth references
        $content = $content -replace 'Write-.*Log.*"Extracting authentication information".*?\n', ''
        $content = $content -replace 'Write-.*Log.*"Auth info found\. ClientId".*?\n', ''
        $content = $content -replace 'Write-.*Log.*"Using injected auth context".*?\n', ''
        $content = $content -replace 'Write-.*Log.*"No authentication found in configuration".*?\n', ''
        $content = $content -replace 'Write-.*Log.*"Connecting to Microsoft Graph".*?\n', ''
        
        # Remove duplicate/corrupted content
        $content = $content -replace '(?s)# -\*- coding: utf-8-bom -\*-.*?#Requires -Version 5\.1.*?#================================================================================.*?# M&A Discovery Module:.*?#================================================================================', ''
        
        # Clean up extra whitespace and newlines
        $content = $content -replace '\n\s*\n\s*\n', "`n`n"
        $content = $content -replace '\n{3,}', "`n`n"
        
        # Write the cleaned content back
        $content | Set-Content $filePath -Encoding UTF8 -NoNewline
        
        Write-Host "    Cleaned old authentication code" -ForegroundColor Green
    } else {
        Write-Host "  [SKIP] $module.psm1 - File not found" -ForegroundColor Yellow
    }
}

Write-Host "`nAll discovery modules have been cleaned of old authentication code!" -ForegroundColor Green
Write-Host "Next: Each module will be individually rewritten with clean new authentication." -ForegroundColor Cyan