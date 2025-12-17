# Fix timestamp errors in discovery hooks
$files = @(
    'useEntraIDAppDiscoveryLogic.ts',
    'useActiveDirectoryDiscoveryLogic.ts',
    'useAWSCloudInfrastructureDiscoveryLogic.ts',
    'useConditionalAccessDiscoveryLogic.ts',
    'useDataLossPreventionDiscoveryLogic.ts',
    'useExternalIdentityDiscoveryLogic.ts',
    'useGraphDiscoveryLogic.ts',
    'useIntuneDiscoveryLogic.ts',
    'useLicensingDiscoveryLogic.ts',
    'useMultiDomainForestDiscoveryLogic.ts',
    'usePowerBIDiscoveryLogic.ts',
    'usePowerPlatformDiscoveryLogic.ts',
    'useTeamsDiscoveryLogic.ts'
)

$hookPath = 'C:\enterprisediscovery\guiv2\src\renderer\hooks'

foreach ($file in $files) {
    $filePath = Join-Path $hookPath $file

    if (Test-Path $filePath) {
        Write-Host "Fixing $file..."

        $content = Get-Content -Path $filePath -Raw

        $content = $content -replace 'timestamp: new Date\(\)\.toISOString\(\)\.toLocaleTimeString\(\)', 'timestamp: new Date().toISOString()'

        Set-Content -Path $filePath -Value $content -NoNewline

        Write-Host "  Fixed $file" -ForegroundColor Green
    } else {
        Write-Host "  File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "All timestamp errors fixed!" -ForegroundColor Green
