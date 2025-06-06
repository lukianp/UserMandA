# Script to remove DiscoveryResult class definitions from all discovery modules
# and replace them with a comment indicating they use the global class

$discoveryModules = @(
    "AzureDiscovery.psm1",
    "EnvironmentDetectionDiscovery.psm1", 
    "ExchangeDiscovery.psm1",
    "ExternalIdentityDiscovery.psm1",
    "FileServerDiscovery.psm1",
    "GPODiscovery.psm1",
    "GraphDiscovery.psm1",
    "IntuneDiscovery.psm1",
    "LicensingDiscovery.psm1",
    "NetworkInfrastructureDiscovery.psm1",
    "SharePointDiscovery.psm1",
    "TeamsDiscovery.psm1"
)

$basePath = "Modules\Discovery"
$replacementComment = @"
# DiscoveryResult class is defined globally by the Orchestrator using Add-Type
# No local definition needed - the global C# class will be used
"@

foreach ($module in $discoveryModules) {
    $filePath = Join-Path $basePath $module
    
    if (Test-Path $filePath) {
        Write-Host "Processing $module..." -ForegroundColor Yellow
        
        # Read the file content
        $content = Get-Content $filePath -Raw
        
        # Find and remove the DiscoveryResult class definition
        # Pattern matches from "if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {"
        # to the closing "}" of the class definition
        $pattern = '(?s)if \(-not \(\[System\.Management\.Automation\.PSTypeName\]''DiscoveryResult''\)\.Type\) \{.*?\n\}'
        
        if ($content -match $pattern) {
            $newContent = $content -replace $pattern, $replacementComment
            
            # Write the updated content back to the file
            Set-Content -Path $filePath -Value $newContent -Encoding UTF8
            Write-Host "  Updated $module" -ForegroundColor Green
        } else {
            Write-Host "  No DiscoveryResult class found in $module" -ForegroundColor Gray
        }
    } else {
        Write-Host "  File not found: $filePath" -ForegroundColor Red
    }
}

Write-Host "`nCompleted processing all discovery modules." -ForegroundColor Cyan