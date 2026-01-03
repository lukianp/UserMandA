# Apply Intune-style layout pattern to all enriched discovered views
# Pattern: Header → Error → Tabs (IMMEDIATELY) → Search (data tabs only) → Content

$viewsToUpdate = @(
    'EntraIDM365DiscoveredView.tsx',
    'EntraidappDiscoveredView.tsx',
    'TeamsDiscoveredView.tsx',
    'CertificatesDiscoveredView.tsx',
    'AzureACRDiscoveredView.tsx',
    'AzureAutomationDiscoveredView.tsx',
    'AzureKeyVaultDiscoveredView.tsx',
    'AzureLogicAppsDiscoveredView.tsx',
    'AzureresourceDiscoveredView.tsx',
    'AzureVMSSDiscoveredView.tsx',
    'ApplicationsDiscoveredView.tsx',
    'DnsdhcpDiscoveredView.tsx',
    'ExchangeDiscoveredView.tsx',
    'EnvironmentdetectionDiscoveredView.tsx',
    'SharepointDiscoveredView.tsx',
    'OnedriveDiscoveredView.tsx'
)

$basePath = "D:\Scripts\UserMandA-1\guiv2\src\renderer\views\discovered"
$updated = 0
$skipped = 0

foreach ($viewFile in $viewsToUpdate) {
    $filePath = Join-Path $basePath $viewFile

    if (-not (Test-Path $filePath)) {
        Write-Host "SKIP: $viewFile (file not found)" -ForegroundColor Yellow
        $skipped++
        continue
    }

    Write-Host "`nProcessing: $viewFile" -ForegroundColor Cyan

    # Read file to check current state
    $content = Get-Content $filePath -Raw

    # Check if already using Intune pattern (tabs immediately after header/error)
    if ($content -match '(?s){/\*\s*Header\s*\*/}.*?{/\*\s*Error.*?\*/}.*?{/\*\s*Tabs?\s*\*/}') {
        # Check line distance - tabs should be within ~50 lines of header
        $headerIndex = $content.IndexOf('{/* Header */')
        $tabsIndex = $content.IndexOf('{/* Tabs */')

        if ($tabsIndex -gt 0 -and ($tabsIndex - $headerIndex) -lt 3000) {
            Write-Host "  ✓ Already using Intune pattern" -ForegroundColor Green
            $skipped++
            continue
        }
    }

    Write-Host "  → Needs update: Moving tabs to top" -ForegroundColor Yellow
    Write-Host "  → Manual review required for: $viewFile" -ForegroundColor Magenta
    $updated++
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Updated/Flagged: $updated" -ForegroundColor Yellow
Write-Host "  Skipped: $skipped" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "These views need manual update to Intune pattern:" -ForegroundColor Yellow
Write-Host "1. Move tabs IMMEDIATELY after Header/Error" -ForegroundColor White
Write-Host "2. Move statistics cards INTO Overview tab" -ForegroundColor White
Write-Host "3. Add search bar ONLY for data tabs (not overview)" -ForegroundColor White
Write-Host "4. Ensure VirtualizedDataGrid has h-[calc(100vh-320px)]" -ForegroundColor White
