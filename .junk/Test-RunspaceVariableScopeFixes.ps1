# Fix-MandASuite.ps1

# 1. Add UTF-8 BOM to all files
Write-Host "Adding UTF-8 BOM to all PowerShell files..." -ForegroundColor Yellow
Get-ChildItem -Path . -Include *.ps1,*.psm1 -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $utf8BOM = [System.Text.UTF8Encoding]::new($true)
    [System.IO.File]::WriteAllText($_.FullName, $content, $utf8BOM)
}

# 2. Update default-config.json with SharePoint config
$configPath = ".\Configuration\default-config.json"
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    if (-not $config.discovery.sharepoint) {
        $config.discovery | Add-Member -MemberType NoteProperty -Name sharepoint -Value @{
            tenantName = "zedra"  # Update with your tenant name
        }
        $config | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8
        Write-Host "Added SharePoint configuration" -ForegroundColor Green
    }
}

# 3. Install missing modules
Write-Host "Checking for required modules..." -ForegroundColor Yellow
$requiredModules = @(
    'ExchangeOnlineManagement',
    'Microsoft.Graph.Users',
    'Microsoft.Graph.Identity.DirectoryManagement'
)

foreach ($module in $requiredModules) {
    if (-not (Get-Module -ListAvailable -Name $module)) {
        Write-Host "Installing $module..." -ForegroundColor Yellow
        Install-Module -Name $module -Force -AllowClobber -Scope CurrentUser
    }
}

Write-Host "Fixes applied. Please re-run the discovery." -ForegroundColor Green