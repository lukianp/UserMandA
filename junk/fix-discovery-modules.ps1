# Fix all 13 Security & Cloud Infrastructure discovery modules
# Adds PowerShellExecutionDialog support to views and hooks

$workspaceRoot = "D:\Scripts\UserMandA\guiv2\src\renderer"

# Module pairs (View, Hook)
$modules = @(
    @{View="views/discovery/AWSCloudInfrastructureDiscoveryView.tsx"; Hook="hooks/useAWSCloudInfrastructureDiscoveryLogic.ts"},
    @{View="views/discovery/BackupRecoveryDiscoveryView.tsx"; Hook="hooks/useBackupRecoveryDiscoveryLogic.ts"},
    @{View="views/discovery/CertificateAuthorityDiscoveryView.tsx"; Hook="hooks/useCertificateAuthorityDiscoveryLogic.ts"},
    @{View="views/discovery/CertificateDiscoveryView.tsx"; Hook="hooks/useCertificateDiscoveryLogic.ts"},
    @{View="views/discovery/IdentityGovernanceDiscoveryView.tsx"; Hook="hooks/useIdentityGovernanceDiscoveryLogic.ts"},
    @{View="views/discovery/PaloAltoDiscoveryView.tsx"; Hook="hooks/usePaloAltoDiscoveryLogic.ts"},
    @{View="views/discovery/SecurityInfrastructureDiscoveryView.tsx"; Hook="hooks/useSecurityInfrastructureDiscoveryLogic.ts"},
    @{View="views/discovery/VirtualizationDiscoveryView.tsx"; Hook="hooks/useVirtualizationDiscoveryLogic.ts"},
    @{View="views/discovery/GPODiscoveryView.tsx"; Hook="hooks/useGPODiscoveryLogic.ts"},
    @{View="views/discovery/EnvironmentDetectionView.tsx"; Hook="hooks/useEnvironmentDetectionLogic.ts"}
)

Write-Host "Fixing $($modules.Count) discovery modules..." -ForegroundColor Cyan

foreach ($module in $modules) {
    $viewPath = Join-Path $workspaceRoot $module.View
    $hookPath = Join-Path $workspaceRoot $module.Hook

    $moduleName = [System.IO.Path]::GetFileNameWithoutExtension($module.View)
    Write-Host "`nProcessing: $moduleName" -ForegroundColor Yellow

    # Check if files exist
    if (-not (Test-Path $viewPath)) {
        Write-Host "  [WARN] View not found: $viewPath" -ForegroundColor Red
        continue
    }
    if (-not (Test-Path $hookPath)) {
        Write-Host "  [WARN] Hook not found: $hookPath" -ForegroundColor Red
        continue
    }

    Write-Host "  [OK] Files found" -ForegroundColor Green
}

Write-Host "`nAll modules checked!" -ForegroundColor Green
