# Fix missing default exports in admin and advanced views

$views = @(
    "guiv2\src\renderer\views\admin\AboutView.tsx",
    "guiv2\src\renderer\views\admin\AuditLogView.tsx",
    "guiv2\src\renderer\views\admin\BackupRestoreView.tsx",
    "guiv2\src\renderer\views\admin\LicenseActivationView.tsx",
    "guiv2\src\renderer\views\admin\PermissionsView.tsx",
    "guiv2\src\renderer\views\admin\RoleManagementView.tsx",
    "guiv2\src\renderer\views\admin\SystemConfigurationView.tsx",
    "guiv2\src\renderer\views\admin\UserManagementView.tsx",
    "guiv2\src\renderer\views\analytics\BenchmarkingView.tsx",
    "guiv2\src\renderer\views\advanced\APIManagementView.tsx",
    "guiv2\src\renderer\views\advanced\AssetLifecycleView.tsx",
    "guiv2\src\renderer\views\advanced\BulkOperationsView.tsx",
    "guiv2\src\renderer\views\advanced\CapacityPlanningView.tsx",
    "guiv2\src\renderer\views\advanced\ChangeManagementView.tsx",
    "guiv2\src\renderer\views\advanced\CloudMigrationPlannerView.tsx",
    "guiv2\src\renderer\views\advanced\CostOptimizationView.tsx",
    "guiv2\src\renderer\views\advanced\CustomFieldsView.tsx",
    "guiv2\src\renderer\views\advanced\DataClassificationView.tsx",
    "guiv2\src\renderer\views\advanced\DataGovernanceView.tsx",
    "guiv2\src\renderer\views\advanced\DataImportExportView.tsx",
    "guiv2\src\renderer\views\advanced\DiagnosticsView.tsx",
    "guiv2\src\renderer\views\advanced\DisasterRecoveryView.tsx",
    "guiv2\src\renderer\views\advanced\eDiscoveryView.tsx",
    "guiv2\src\renderer\views\advanced\EndpointProtectionView.tsx",
    "guiv2\src\renderer\views\advanced\HardwareRefreshPlanningView.tsx",
    "guiv2\src\renderer\views\advanced\HealthMonitoringView.tsx",
    "guiv2\src\renderer\views\advanced\HybridIdentityView.tsx",
    "guiv2\src\renderer\views\advanced\IncidentResponseView.tsx",
    "guiv2\src\renderer\views\advanced\KnowledgeBaseView.tsx",
    "guiv2\src\renderer\views\advanced\LicenseOptimizationView.tsx",
    "guiv2\src\renderer\views\advanced\MFAManagementView.tsx",
    "guiv2\src\renderer\views\advanced\NotificationRulesView.tsx",
    "guiv2\src\renderer\views\advanced\PerformanceDashboardView.tsx",
    "guiv2\src\renderer\views\advanced\PrivilegedAccessView.tsx",
    "guiv2\src\renderer\views\advanced\ResourceOptimizationView.tsx",
    "guiv2\src\renderer\views\advanced\RetentionPolicyView.tsx",
    "guiv2\src\renderer\views\advanced\ScriptLibraryView.tsx",
    "guiv2\src\renderer\views\advanced\SecurityPostureView.tsx",
    "guiv2\src\renderer\views\advanced\ServiceCatalogView.tsx",
    "guiv2\src\renderer\views\advanced\SoftwareLicenseComplianceView.tsx",
    "guiv2\src\renderer\views\advanced\SSOConfigurationView.tsx",
    "guiv2\src\renderer\views\advanced\TagManagementView.tsx",
    "guiv2\src\renderer\views\advanced\TicketingSystemView.tsx",
    "guiv2\src\renderer\views\advanced\WebhooksView.tsx",
    "guiv2\src\renderer\views\advanced\WorkflowAutomationView.tsx"
)

$fixed = 0
$skipped = 0

foreach ($view in $views) {
    if (Test-Path $view) {
        $content = Get-Content $view -Raw

        # Check if it already has default export
        if ($content -match "export default") {
            Write-Host "✓ $view - already has default export" -ForegroundColor Green
            $skipped++
            continue
        }

        # Extract component name from filename
        $filename = Split-Path $view -Leaf
        $componentName = $filename -replace "\.tsx$", ""

        # Add export default at the end
        $content += "`n`nexport default $componentName;`n"

        # Write back
        Set-Content -Path $view -Value $content -NoNewline

        Write-Host "✅ Fixed: $view" -ForegroundColor Cyan
        $fixed++
    } else {
        Write-Host "⚠️  Not found: $view" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor White
Write-Host "Summary:" -ForegroundColor White
Write-Host "  Fixed: $fixed" -ForegroundColor Cyan
Write-Host "  Skipped (already fixed): $skipped" -ForegroundColor Green
Write-Host "  Total: $($views.Count)" -ForegroundColor White
Write-Host "========================================" -ForegroundColor White
Write-Host ""
