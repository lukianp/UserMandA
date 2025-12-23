# Fix Date timestamp rendering errors in discovery hooks
$files = @(
    'usePowerPlatformDiscoveryLogic.ts',
    'usePowerBIDiscoveryLogic.ts',
    'useLicensingDiscoveryLogic.ts',
    'useDataLossPreventionDiscoveryLogic.ts',
    'useAzureResourceDiscoveryLogic.ts',
    'useIntuneDiscoveryLogic.ts',
    'useTeamsDiscoveryLogic.ts',
    'useActiveDirectoryDiscoveryLogic.ts',
    'useConditionalAccessDiscoveryLogic.ts',
    'useSQLServerDiscoveryLogic.ts',
    'useNetworkDiscoveryLogic.ts',
    'useFileSystemDiscoveryLogic.ts',
    'useAzureDiscoveryLogic.ts',
    'useAWSCloudInfrastructureDiscoveryLogic.ts',
    'useMultiDomainForestDiscoveryLogic.ts',
    'useGraphDiscoveryLogic.ts',
    'useExternalIdentityDiscoveryLogic.ts',
    'useEntraIDAppDiscoveryLogic.ts',
    'useSecurityInfrastructureDiscoveryLogic.ts',
    'useApplicationDiscoveryLogic.ts',
    'useOneDriveDiscoveryLogic.ts',
    'useExchangeDiscoveryLogic.ts'
)

$hookPath = 'D:\Scripts\UserMandA\guiv2\src\renderer\hooks'

foreach ($file in $files) {
    $filePath = Join-Path $hookPath $file

    if (Test-Path $filePath) {
        Write-Host "Fixing $file..."

        $content = Get-Content -Path $filePath -Raw

        $content = $content -replace 'timestamp:\s*new\s+Date\(\)', 'timestamp: new Date().toISOString()'

        Set-Content -Path $filePath -Value $content -NoNewline

        Write-Host "  Fixed timestamp in $file"
    } else {
        Write-Host "  File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "All files processed!" -ForegroundColor Green
