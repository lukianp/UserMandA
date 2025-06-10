# Fix-AuthenticationIssues.ps1
function Fix-DiscoveryModuleAuthentication {
    param($ModulePath)
    
    $content = Get-Content $ModulePath -Raw
    
    # Fix the authentication pattern
    $oldPattern = @'
\$secureSecret = ConvertTo-SecureString \$authInfo\.ClientSecret -AsPlainText -Force
\s*Connect-MgGraph -ClientId \$authInfo\.ClientId `
\s*-TenantId \$authInfo\.TenantId `
\s*-ClientSecretCredential \$secureSecret `
'@
    
    $newPattern = @'
$credential = New-Object System.Management.Automation.PSCredential(
    $authInfo.ClientId, 
    (ConvertTo-SecureString $authInfo.ClientSecret -AsPlainText -Force)
)
Connect-MgGraph -ClientId $authInfo.ClientId `
                -TenantId $authInfo.TenantId `
                -ClientSecretCredential $credential `
'@
    
    $content = $content -replace $oldPattern, $newPattern
    Set-Content $ModulePath $content -Encoding UTF8
}

# Apply fixes
$modules = @('GraphDiscovery.psm1', 'SharePointDiscovery.psm1', 'TeamsDiscovery.psm1')
foreach ($module in $modules) {
    $path = Join-Path ".\Modules\Discovery" $module
    if (Test-Path $path) {
        Fix-DiscoveryModuleAuthentication -ModulePath $path
    }
}