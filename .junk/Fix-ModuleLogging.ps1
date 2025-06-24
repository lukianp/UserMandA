# Fix Module Logging Script
# This script fixes the logging issue in discovery modules by adding fallback logging

Write-Host "Fixing logging issues in discovery modules..." -ForegroundColor Green

$modules = @(
    "GraphDiscovery", "IntuneDiscovery", "SharePointDiscovery", "TeamsDiscovery",
    "LicensingDiscovery", "ExternalIdentityDiscovery", "GPODiscovery", 
    "EnvironmentDetectionDiscovery", "FileServerDiscovery", 
    "NetworkInfrastructureDiscovery", "SQLServerDiscovery"
)

foreach ($module in $modules) {
    $filePath = "Modules/Discovery/$module.psm1"
    
    if (Test-Path $filePath) {
        Write-Host "  [FIX] $module.psm1" -ForegroundColor Cyan
        
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Add fallback logging function at the top of each module
        $fallbackLogging = @'
# Fallback logging function if Write-MandALog is not available
if (-not (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
    function Write-MandALog {
        param(
            [string]$Message,
            [string]$Level = "INFO",
            [string]$Component = "Discovery",
            [hashtable]$Context = @{}
        )
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        Write-Host "[$timestamp] [$Level] [$Component] $Message" -ForegroundColor $(
            switch ($Level) {
                'ERROR' { 'Red' }
                'WARN' { 'Yellow' }
                'SUCCESS' { 'Green' }
                'HEADER' { 'Cyan' }
                'DEBUG' { 'Gray' }
                default { 'White' }
            }
        )
    }
}

'@
        
        # Insert fallback logging after the header but before the first function
        $headerPattern = '(?s)(#================================================================================.*?#================================================================================\s*)'
        if ($content -match $headerPattern) {
            $content = $content -replace $headerPattern, "$1`n$fallbackLogging`n"
        } else {
            # If no header found, add at the beginning
            $content = $fallbackLogging + "`n" + $content
        }
        
        # Write the updated content back
        $content | Set-Content $filePath -Encoding UTF8 -NoNewline
        
        Write-Host "    Added fallback logging function" -ForegroundColor Green
    } else {
        Write-Host "  [SKIP] $module.psm1 - File not found" -ForegroundColor Yellow
    }
}

Write-Host "`nAll discovery modules have been fixed with fallback logging!" -ForegroundColor Green
Write-Host "Modules will now work even if Write-MandALog is not available in runspace." -ForegroundColor Cyan