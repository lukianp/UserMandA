# Fix-MandAIssues.ps1
param(
    [switch]$DisableProblematicModules
)

Write-Host "Fixing M&A Discovery Suite issues..." -ForegroundColor Cyan

# 1. Fix CredentialManagement recursion
$credPath = "C:\UserMigration\Modules\Authentication\CredentialManagement.psm1"
if (Test-Path $credPath) {
    $content = Get-Content $credPath -Raw
    
    # Check if there's a local Write-MandALog function
    if ($content -match 'function\s+Write-MandALog') {
        Write-Host "Found local Write-MandALog in CredentialManagement - fixing..." -ForegroundColor Yellow
        
        # Backup original
        Copy-Item $credPath "$credPath.backup" -Force
        
        # Fix the function name
        $content = $content -replace 'function\s+Write-MandALog', 'function Write-CredentialLog'
        $content = $content -replace 'Write-MandALog\s+-Message', 'Write-CredentialLog -Message'
        
        $content | Set-Content $credPath -Encoding UTF8
        Write-Host "Fixed CredentialManagement.psm1" -ForegroundColor Green
    }
}

# 2. Disable problematic modules if requested
if ($DisableProblematicModules) {
    $configPath = "C:\UserMigration\Configuration\default-config.json"
    $config = Get-Content $configPath | ConvertFrom-Json
    
    $problemModules = @("FileServer", "SQLServer")
    $config.discovery.enabledSources = $config.discovery.enabledSources | Where-Object { $_ -notin $problemModules }
    
    $config | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8
    Write-Host "Disabled problematic modules: $($problemModules -join ', ')" -ForegroundColor Green
}

Write-Host "`nFixes applied. Try running QuickStart.ps1 again." -ForegroundColor Green