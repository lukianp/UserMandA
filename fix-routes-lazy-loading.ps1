# Fix lazy loading in routes.tsx by using pre-defined components

$file = 'D:\Scripts\UserMandA-1\guiv2\src\renderer\routes.tsx'
$content = Get-Content $file -Raw

Write-Host "Original file size: $($content.Length) characters"

# Discovery views - most common
$replacements = @{
    "lazyLoad(() => import('./views/overview/OverviewView'))" = 'lazyLoad(OverviewView)'
    "lazyLoad(() => import('./views/users/UsersView'))" = 'lazyLoad(UsersView)'
    "lazyLoad(() => import('./views/groups/GroupsView'))" = 'lazyLoad(GroupsView)'
    "lazyLoad(() => import('./views/reports/ReportsView'))" = 'lazyLoad(ReportsView)'
    "lazyLoad(() => import('./views/settings/SettingsView'))" = 'lazyLoad(SettingsView)'
    "lazyLoad(() => import('./views/setup/SetupCompanyView'))" = 'lazyLoad(SetupCompanyView)'
    "lazyLoad(() => import('./views/setup/SetupInstallersView'))" = 'lazyLoad(SetupInstallersView)'
    "lazyLoad(() => import('./views/discovery/InfrastructureDiscoveryHubView'))" = 'lazyLoad(InfrastructureDiscoveryHubView)'
    "lazyLoad(() => import('./views/discovery/ActiveDirectoryDiscoveryView'))" = 'lazyLoad(ActiveDirectoryDiscoveryView)'
    "lazyLoad(() => import('./views/organisation/OrganisationMapView'))" = 'lazyLoad(OrganisationMapView)'
    "lazyLoad(() => import('./views/discovery/EntraIDM365DiscoveryView'))" = 'lazyLoad(EntraIDM365DiscoveryView)'
    "lazyLoad(() => import('./views/discovery/AWSCloudInfrastructureDiscoveryView'))" = 'lazyLoad(AWSCloudInfrastructureDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/ExchangeDiscoveryView'))" = 'lazyLoad(ExchangeDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/SharePointDiscoveryView'))" = 'lazyLoad(SharePointDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/TeamsDiscoveryView'))" = 'lazyLoad(TeamsDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/OneDriveDiscoveryView'))" = 'lazyLoad(OneDriveDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/IntuneDiscoveryView'))" = 'lazyLoad(IntuneDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/FileSystemDiscoveryView'))" = 'lazyLoad(FileSystemDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/DomainDiscoveryView'))" = 'lazyLoad(DomainDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/NetworkDiscoveryView'))" = 'lazyLoad(NetworkDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/ApplicationDiscoveryView'))" = 'lazyLoad(ApplicationDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/EnvironmentDetectionView'))" = 'lazyLoad(EnvironmentDetectionView)'
    "lazyLoad(() => import('./views/discovery/GoogleWorkspaceDiscoveryView'))" = 'lazyLoad(GoogleWorkspaceDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/HyperVDiscoveryView'))" = 'lazyLoad(HyperVDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/Office365DiscoveryView'))" = 'lazyLoad(Office365DiscoveryView)'
    "lazyLoad(() => import('./views/discovery/SecurityInfrastructureDiscoveryView'))" = 'lazyLoad(SecurityInfrastructureDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/SQLServerDiscoveryView'))" = 'lazyLoad(SQLServerDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/VMwareDiscoveryView'))" = 'lazyLoad(VMwareDiscoveryView)'

    # Migration views
    "lazyLoad(() => import('./views/migration/MigrationDashboardView'))" = 'lazyLoad(MigrationDashboardView)'
    "lazyLoad(() => import('./views/migration/MigrationPlanningView'))" = 'lazyLoad(MigrationPlanningView)'
    "lazyLoad(() => import('./views/migration/MigrationMappingView'))" = 'lazyLoad(MigrationMappingView)'
    "lazyLoad(() => import('./views/migration/MigrationValidationView'))" = 'lazyLoad(MigrationValidationView)'
    "lazyLoad(() => import('./views/migration/GoNoGoCheckpointView'))" = 'lazyLoad(GoNoGoCheckpointView)'
    "lazyLoad(() => import('./views/migration/MigrationExecutionView'))" = 'lazyLoad(MigrationExecutionView)'
    "lazyLoad(() => import('./views/migration/GanttChartView'))" = 'lazyLoad(GanttChartView)'
    "lazyLoad(() => import('./views/migration/MigrationMonitorView'))" = 'lazyLoad(MigrationMonitorView)'
    "lazyLoad(() => import('./views/migration/UserMigrationView'))" = 'lazyLoad(UserMigrationView)'
    "lazyLoad(() => import('./views/migration/MailboxMigrationView'))" = 'lazyLoad(MailboxMigrationView)'
    "lazyLoad(() => import('./views/migration/SharePointMigrationView'))" = 'lazyLoad(SharePointMigrationView)'
    "lazyLoad(() => import('./views/migration/OneDriveMigrationView'))" = 'lazyLoad(OneDriveMigrationView)'
    "lazyLoad(() => import('./views/migration/TeamsMigrationView'))" = 'lazyLoad(TeamsMigrationView)'
    "lazyLoad(() => import('./views/migration/DeviceMigrationView'))" = 'lazyLoad(DeviceMigrationView)'
    "lazyLoad(() => import('./views/migration/DomainMappingView'))" = 'lazyLoad(DomainMappingView)'
    "lazyLoad(() => import('./views/migration/AzureResourceMigrationView'))" = 'lazyLoad(AzureResourceMigrationView)'
    "lazyLoad(() => import('./views/migration/MigrationEngineeringView'))" = 'lazyLoad(MigrationEngineeringView)'

    # Analytics views
    "lazyLoad(() => import('./views/analytics/ExecutiveDashboardView'))" = 'lazyLoad(ExecutiveDashboardView)'
    "lazyLoad(() => import('./views/analytics/MigrationReportView'))" = 'lazyLoad(MigrationReportView)'
    "lazyLoad(() => import('./views/analytics/UserAnalyticsView'))" = 'lazyLoad(UserAnalyticsView)'
    "lazyLoad(() => import('./views/analytics/CostAnalysisView'))" = 'lazyLoad(CostAnalysisView)'
    "lazyLoad(() => import('./views/analytics/TrendAnalysisView'))" = 'lazyLoad(TrendAnalysisView)'

    # Admin views
    "lazyLoad(() => import('./views/admin/UserManagementView'))" = 'lazyLoad(UserManagementView)'
    "lazyLoad(() => import('./views/admin/RoleManagementView'))" = 'lazyLoad(RoleManagementView)'
    "lazyLoad(() => import('./views/admin/PermissionsView'))" = 'lazyLoad(PermissionsView)'
    "lazyLoad(() => import('./views/admin/AuditLogView'))" = 'lazyLoad(AuditLogView)'
    "lazyLoad(() => import('./views/admin/SystemConfigurationView'))" = 'lazyLoad(SystemConfigurationView)'
    "lazyLoad(() => import('./views/admin/BackupRestoreView'))" = 'lazyLoad(BackupRestoreView)'
    "lazyLoad(() => import('./views/admin/LicenseActivationView'))" = 'lazyLoad(LicenseActivationView)'
    "lazyLoad(() => import('./views/admin/AboutView'))" = 'lazyLoad(AboutView)'

    # Asset views
    "lazyLoad(() => import('./views/assets/AssetInventoryView'))" = 'lazyLoad(AssetInventoryView)'
    "lazyLoad(() => import('./views/assets/ServerInventoryView'))" = 'lazyLoad(ServerInventoryView)'
    "lazyLoad(() => import('./views/assets/NetworkDeviceInventoryView'))" = 'lazyLoad(NetworkDeviceInventoryView)'
    "lazyLoad(() => import('./views/assets/ComputerInventoryView'))" = 'lazyLoad(ComputerInventoryView)'

    # Security & Compliance
    "lazyLoad(() => import('./views/security/SecurityAuditView'))" = 'lazyLoad(SecurityAuditView)'
    "lazyLoad(() => import('./views/compliance/ComplianceDashboardView'))" = 'lazyLoad(ComplianceDashboardView)'
    "lazyLoad(() => import('./views/compliance/ComplianceReportView'))" = 'lazyLoad(ComplianceReportView)'
    "lazyLoad(() => import('./views/security/RiskAssessmentView'))" = 'lazyLoad(RiskAssessmentView)'
    "lazyLoad(() => import('./views/security/PolicyManagementView'))" = 'lazyLoad(PolicyManagementView)'

    # Infrastructure & Inventory
    "lazyLoad(() => import('./views/infrastructure/InfrastructureView'))" = 'lazyLoad(InfrastructureView)'
    "lazyLoad(() => import('./views/inventory/ConsolidatedUsersView'))" = 'lazyLoad(ConsolidatedUsersView)'
    "lazyLoad(() => import('./views/inventory/ConsolidatedGroupsView'))" = 'lazyLoad(ConsolidatedGroupsView)'
    "lazyLoad(() => import('./views/inventory/ConsolidatedApplicationsView'))" = 'lazyLoad(ConsolidatedApplicationsView)'
    "lazyLoad(() => import('./views/inventory/ConsolidatedInfrastructureView'))" = 'lazyLoad(ConsolidatedInfrastructureView)'
    "lazyLoad(() => import('./views/inventory/ApplicationInventoryView'))" = 'lazyLoad(ApplicationInventoryView)'

    # Licensing
    "lazyLoad(() => import('./features/licensingHub/views/LicensingHubView'))" = 'lazyLoad(LicensingHubView)'

    # Additional discovery views
    "lazyLoad(() => import('./views/discovery/InfrastructureDiscoveryView'))" = 'lazyLoad(InfrastructureDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/ConditionalAccessDiscoveryView'))" = 'lazyLoad(ConditionalAccessDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/DLPDiscoveryView'))" = 'lazyLoad(DLPDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/CertificateDiscoveryView'))" = 'lazyLoad(CertificateDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/CertificateAuthorityDiscoveryView'))" = 'lazyLoad(CertificateAuthorityDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/DNSDHCPDiscoveryView'))" = 'lazyLoad(DNSDHCPDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/PrinterDiscoveryView'))" = 'lazyLoad(PrinterDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/VirtualizationDiscoveryView'))" = 'lazyLoad(VirtualizationDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/PhysicalServerDiscoveryView'))" = 'lazyLoad(PhysicalServerDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/StorageArrayDiscoveryView'))" = 'lazyLoad(StorageArrayDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/DatabaseSchemaDiscoveryView'))" = 'lazyLoad(DatabaseSchemaDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/WebServerConfigDiscoveryView'))" = 'lazyLoad(WebServerConfigDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/PowerPlatformDiscoveryView'))" = 'lazyLoad(PowerPlatformDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/PowerBIDiscoveryView'))" = 'lazyLoad(PowerBIDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/EntraIDAppDiscoveryView'))" = 'lazyLoad(EntraIDAppDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/ExternalIdentityDiscoveryView'))" = 'lazyLoad(ExternalIdentityDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/GPODiscoveryView'))" = 'lazyLoad(GPODiscoveryView)'
    "lazyLoad(() => import('./views/discovery/MultiDomainForestDiscoveryView'))" = 'lazyLoad(MultiDomainForestDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/DataClassificationDiscoveryView'))" = 'lazyLoad(DataClassificationDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/LicensingDiscoveryView'))" = 'lazyLoad(LicensingDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/ScheduledTaskDiscoveryView'))" = 'lazyLoad(ScheduledTaskDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/BackupRecoveryDiscoveryView'))" = 'lazyLoad(BackupRecoveryDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/PaloAltoDiscoveryView'))" = 'lazyLoad(PaloAltoDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/PanoramaInterrogationDiscoveryView'))" = 'lazyLoad(PanoramaInterrogationDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/GraphDiscoveryView'))" = 'lazyLoad(GraphDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/FileServerDiscoveryView'))" = 'lazyLoad(FileServerDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/AzureResourceDiscoveryView'))" = 'lazyLoad(AzureResourceDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/AzureVMSSDiscoveryView'))" = 'lazyLoad(AzureVMSSDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/AzureFunctionsDiscoveryView'))" = 'lazyLoad(AzureFunctionsDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/AzureACRDiscoveryView'))" = 'lazyLoad(AzureACRDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/AzureAutomationDiscoveryView'))" = 'lazyLoad(AzureAutomationDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/AzureLogicAppsDiscoveryView'))" = 'lazyLoad(AzureLogicAppsDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/AzureManagementGroupsDiscoveryView'))" = 'lazyLoad(AzureManagementGroupsDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/AzurePIMDiscoveryView'))" = 'lazyLoad(AzurePIMDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/AzureSubscriptionOwnersDiscoveryView'))" = 'lazyLoad(AzureSubscriptionOwnersDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/AzureKeyVaultAccessDiscoveryView'))" = 'lazyLoad(AzureKeyVaultAccessDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/AzureManagedIdentitiesDiscoveryView'))" = 'lazyLoad(AzureManagedIdentitiesDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/AzureServicePrincipalCredentialsDiscoveryView'))" = 'lazyLoad(AzureServicePrincipalCredentialsDiscoveryView)'
    "lazyLoad(() => import('./views/discovery/AzureStorageAccountAccessDiscoveryView'))" = 'lazyLoad(AzureStorageAccountAccessDiscoveryView)'
}

$count = 0
foreach ($old in $replacements.Keys) {
    $new = $replacements[$old]
    if ($content -match [regex]::Escape($old)) {
        $content = $content -replace [regex]::Escape($old), $new
        $count++
    }
}

Write-Host "Made $count replacements"
Write-Host "New file size: $($content.Length) characters"

Set-Content -Path $file -Value $content -NoNewline
Write-Host "File updated successfully!"
