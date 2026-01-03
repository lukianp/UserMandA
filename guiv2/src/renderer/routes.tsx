/**
 * Application Routes Configuration
 *
 * Implements lazy loading for all major views to optimize bundle size.
 * Each route is code-split and loaded on demand.
 */

import React, { Suspense, lazy } from 'react';
import { RouteObject } from 'react-router-dom';

import { Spinner } from './components/atoms/Spinner';
import { discoveredRoutes } from './views/discovered/_routes.generated';

/**
 * Loading fallback component
 */
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-full min-h-screen">
    <Spinner size="lg" />
  </div>
);

/**
 * Helper to wrap lazy components with Suspense
 */
const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

/**
 * Lazy loaded views
 */

// Core views
const OverviewView = lazy(() => import('./views/overview/OverviewView'));
const UsersView = lazy(() => import('./views/users/UsersView'));
const GroupsView = lazy(() => import('./views/groups/GroupsView'));
const ReportsView = lazy(() => import('./views/reports/ReportsView'));
const SettingsView = lazy(() => import('./views/settings/SettingsView'));

// Setup views
const SetupCompanyView = lazy(() => import('./views/setup/SetupCompanyView'));
const SetupInstallersView = lazy(() => import('./views/setup/SetupInstallersView'));

// Discovery views
const InfrastructureDiscoveryHubView = lazy(() => import('./views/discovery/InfrastructureDiscoveryHubView'));
const ActiveDirectoryDiscoveryView = lazy(() => import('./views/discovery/ActiveDirectoryDiscoveryView'));

// Organisation Map
const OrganisationMapView = lazy(() => import('./views/organisation/OrganisationMapView'));
const EntraIDM365DiscoveryView = lazy(() => import('./views/discovery/EntraIDM365DiscoveryView'));
const AWSCloudInfrastructureDiscoveryView = lazy(() => import('./views/discovery/AWSCloudInfrastructureDiscoveryView'));
const ExchangeDiscoveryView = lazy(() => import('./views/discovery/ExchangeDiscoveryView'));
const SharePointDiscoveryView = lazy(() => import('./views/discovery/SharePointDiscoveryView'));
const TeamsDiscoveryView = lazy(() => import('./views/discovery/TeamsDiscoveryView'));
const OneDriveDiscoveryView = lazy(() => import('./views/discovery/OneDriveDiscoveryView'));
const IntuneDiscoveryView = lazy(() => import('./views/discovery/IntuneDiscoveryView'));
const FileSystemDiscoveryView = lazy(() => import('./views/discovery/FileSystemDiscoveryView'));
const DomainDiscoveryView = lazy(() => import('./views/discovery/DomainDiscoveryView'));
const NetworkDiscoveryView = lazy(() => import('./views/discovery/NetworkDiscoveryView'));
const ApplicationDiscoveryView = lazy(() => import('./views/discovery/ApplicationDiscoveryView'));
const EnvironmentDetectionView = lazy(() => import('./views/discovery/EnvironmentDetectionView'));
const GoogleWorkspaceDiscoveryView = lazy(() => import('./views/discovery/GoogleWorkspaceDiscoveryView'));
const HyperVDiscoveryView = lazy(() => import('./views/discovery/HyperVDiscoveryView'));
const Office365DiscoveryView = lazy(() => import('./views/discovery/Office365DiscoveryView'));
const SecurityInfrastructureDiscoveryView = lazy(() => import('./views/discovery/SecurityInfrastructureDiscoveryView'));
const SQLServerDiscoveryView = lazy(() => import('./views/discovery/SQLServerDiscoveryView'));
const VMwareDiscoveryView = lazy(() => import('./views/discovery/VMwareDiscoveryView'));

// Migration views
const MigrationPlanningView = lazy(() => import('./views/migration/MigrationPlanningView'));
const MigrationMappingView = lazy(() => import('./views/migration/MigrationMappingView'));
const MigrationValidationView = lazy(() => import('./views/migration/MigrationValidationView'));
const MigrationExecutionView = lazy(() => import('./views/migration/MigrationExecutionView'));

// Analytics views
const ExecutiveDashboardView = lazy(() => import('./views/analytics/ExecutiveDashboardView'));
const MigrationReportView = lazy(() => import('./views/analytics/MigrationReportView'));
const UserAnalyticsView = lazy(() => import('./views/analytics/UserAnalyticsView'));
const CostAnalysisView = lazy(() => import('./views/analytics/CostAnalysisView'));
const TrendAnalysisView = lazy(() => import('./views/analytics/TrendAnalysisView'));

// Admin views
const UserManagementView = lazy(() => import('./views/admin/UserManagementView'));
const RoleManagementView = lazy(() => import('./views/admin/RoleManagementView'));
const PermissionsView = lazy(() => import('./views/admin/PermissionsView'));
const AuditLogView = lazy(() => import('./views/admin/AuditLogView'));
const SystemConfigurationView = lazy(() => import('./views/admin/SystemConfigurationView'));
const BackupRestoreView = lazy(() => import('./views/admin/BackupRestoreView'));
const LicenseActivationView = lazy(() => import('./views/admin/LicenseActivationView'));
const AboutView = lazy(() => import('./views/admin/AboutView'));

// Asset views
const AssetInventoryView = lazy(() => import('./views/assets/AssetInventoryView'));
const ServerInventoryView = lazy(() => import('./views/assets/ServerInventoryView'));
const NetworkDeviceInventoryView = lazy(() => import('./views/assets/NetworkDeviceInventoryView'));
const ComputerInventoryView = lazy(() => import('./views/assets/ComputerInventoryView'));

// Security & Compliance views
const SecurityAuditView = lazy(() => import('./views/security/SecurityAuditView'));
const ComplianceDashboardView = lazy(() => import('./views/compliance/ComplianceDashboardView'));
const ComplianceReportView = lazy(() => import('./views/compliance/ComplianceReportView'));
const RiskAssessmentView = lazy(() => import('./views/security/RiskAssessmentView'));
const PolicyManagementView = lazy(() => import('./views/security/PolicyManagementView'));

// Licensing views
const LicensingHubView = lazy(() => import('./features/licensingHub/views/LicensingHubView'));

// Additional discovery views
const InfrastructureDiscoveryView = lazy(() => import('./views/discovery/InfrastructureDiscoveryView'));
const ConditionalAccessDiscoveryView = lazy(() => import('./views/discovery/ConditionalAccessDiscoveryView'));
const DLPDiscoveryView = lazy(() => import('./views/discovery/DLPDiscoveryView'));
const CertificateDiscoveryView = lazy(() => import('./views/discovery/CertificateDiscoveryView'));
const CertificateAuthorityDiscoveryView = lazy(() => import('./views/discovery/CertificateAuthorityDiscoveryView'));
const DNSDHCPDiscoveryView = lazy(() => import('./views/discovery/DNSDHCPDiscoveryView'));
const PrinterDiscoveryView = lazy(() => import('./views/discovery/PrinterDiscoveryView'));
const VirtualizationDiscoveryView = lazy(() => import('./views/discovery/VirtualizationDiscoveryView'));
const PhysicalServerDiscoveryView = lazy(() => import('./views/discovery/PhysicalServerDiscoveryView'));
const StorageArrayDiscoveryView = lazy(() => import('./views/discovery/StorageArrayDiscoveryView'));
const DatabaseSchemaDiscoveryView = lazy(() => import('./views/discovery/DatabaseSchemaDiscoveryView'));
const WebServerConfigDiscoveryView = lazy(() => import('./views/discovery/WebServerConfigDiscoveryView'));
const PowerPlatformDiscoveryView = lazy(() => import('./views/discovery/PowerPlatformDiscoveryView'));
const PowerBIDiscoveryView = lazy(() => import('./views/discovery/PowerBIDiscoveryView'));
const EntraIDAppDiscoveryView = lazy(() => import('./views/discovery/EntraIDAppDiscoveryView'));
const ExternalIdentityDiscoveryView = lazy(() => import('./views/discovery/ExternalIdentityDiscoveryView'));
const GPODiscoveryView = lazy(() => import('./views/discovery/GPODiscoveryView'));
const MultiDomainForestDiscoveryView = lazy(() => import('./views/discovery/MultiDomainForestDiscoveryView'));
const DataClassificationDiscoveryView = lazy(() => import('./views/discovery/DataClassificationDiscoveryView'));
const LicensingDiscoveryView = lazy(() => import('./views/discovery/LicensingDiscoveryView'));
const ScheduledTaskDiscoveryView = lazy(() => import('./views/discovery/ScheduledTaskDiscoveryView'));
const BackupRecoveryDiscoveryView = lazy(() => import('./views/discovery/BackupRecoveryDiscoveryView'));
const PaloAltoDiscoveryView = lazy(() => import('./views/discovery/PaloAltoDiscoveryView'));
const PanoramaInterrogationDiscoveryView = lazy(() => import('./views/discovery/PanoramaInterrogationDiscoveryView'));
const GraphDiscoveryView = lazy(() => import('./views/discovery/GraphDiscoveryView'));
const FileServerDiscoveryView = lazy(() => import('./views/discovery/FileServerDiscoveryView'));
const AzureResourceDiscoveryView = lazy(() => import('./views/discovery/AzureResourceDiscoveryView'));
const AzureVMSSDiscoveryView = lazy(() => import('./views/discovery/AzureVMSSDiscoveryView'));
const AzureFunctionsDiscoveryView = lazy(() => import('./views/discovery/AzureFunctionsDiscoveryView'));
const AzureACRDiscoveryView = lazy(() => import('./views/discovery/AzureACRDiscoveryView'));
const AzureAutomationDiscoveryView = lazy(() => import('./views/discovery/AzureAutomationDiscoveryView'));
const AzureLogicAppsDiscoveryView = lazy(() => import('./views/discovery/AzureLogicAppsDiscoveryView'));
const AzureManagementGroupsDiscoveryView = lazy(() => import('./views/discovery/AzureManagementGroupsDiscoveryView'));
const AzurePIMDiscoveryView = lazy(() => import('./views/discovery/AzurePIMDiscoveryView'));
const AzureSubscriptionOwnersDiscoveryView = lazy(() => import('./views/discovery/AzureSubscriptionOwnersDiscoveryView'));
const AzureKeyVaultAccessDiscoveryView = lazy(() => import('./views/discovery/AzureKeyVaultAccessDiscoveryView'));
const AzureManagedIdentitiesDiscoveryView = lazy(() => import('./views/discovery/AzureManagedIdentitiesDiscoveryView'));
const AzureServicePrincipalCredentialsDiscoveryView = lazy(() => import('./views/discovery/AzureServicePrincipalCredentialsDiscoveryView'));
const AzureStorageAccountAccessDiscoveryView = lazy(() => import('./views/discovery/AzureStorageAccountAccessDiscoveryView'));

// Additional migration views
const MigrationDashboardView = lazy(() => import('./views/migration/MigrationDashboardView'));
const GoNoGoCheckpointView = lazy(() => import('./views/migration/GoNoGoCheckpointView'));
const GanttChartView = lazy(() => import('./views/migration/GanttChartView'));
const MigrationMonitorView = lazy(() => import('./views/migration/MigrationMonitorView'));
const UserMigrationView = lazy(() => import('./views/migration/UserMigrationView'));
const MailboxMigrationView = lazy(() => import('./views/migration/MailboxMigrationView'));
const SharePointMigrationView = lazy(() => import('./views/migration/SharePointMigrationView'));
const OneDriveMigrationView = lazy(() => import('./views/migration/OneDriveMigrationView'));
const TeamsMigrationView = lazy(() => import('./views/migration/TeamsMigrationView'));
const DeviceMigrationView = lazy(() => import('./views/migration/DeviceMigrationView'));
const DomainMappingView = lazy(() => import('./views/migration/DomainMappingView'));
const AzureResourceMigrationView = lazy(() => import('./views/migration/AzureResourceMigrationView'));
const MigrationEngineeringView = lazy(() => import('./views/migration/MigrationEngineeringView'));

// Infrastructure & Inventory
const InfrastructureView = lazy(() => import('./views/infrastructure/InfrastructureView'));
const ConsolidatedUsersView = lazy(() => import('./views/inventory/ConsolidatedUsersView'));
const ConsolidatedGroupsView = lazy(() => import('./views/inventory/ConsolidatedGroupsView'));
const ConsolidatedApplicationsView = lazy(() => import('./views/inventory/ConsolidatedApplicationsView'));
const ConsolidatedInfrastructureView = lazy(() => import('./views/inventory/ConsolidatedInfrastructureView'));
const ApplicationInventoryView = lazy(() => import('./views/inventory/ApplicationInventoryView'));

/**
 * Application routes
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <OverviewView />
      </Suspense>
    ),
  },
  {
    path: '/overview',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <OverviewView />
      </Suspense>
    ),
  },

  // Setup routes
  {
    path: '/setup',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <SetupCompanyView />
      </Suspense>
    ),
  },
  {
    path: '/setup/company',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <SetupCompanyView />
      </Suspense>
    ),
  },
  {
    path: '/setup/installers',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <SetupInstallersView />
      </Suspense>
    ),
  },

  // Discovery routes
  {
    path: '/discovery',
    element: (<Suspense fallback={<LoadingFallback />}><InfrastructureDiscoveryHubView /></Suspense>),
  },

  // Organisation Map
  {
    path: '/organisation-map',
    element: (<Suspense fallback={<LoadingFallback />}><OrganisationMapView /></Suspense>),
  },

  // ========================================================================
  // DISCOVERED ROUTES - Auto-generated CSV data display views
  // These routes are handled by ...discoveredRoutes below (from _routes.generated.tsx)
  // DO NOT add manual /discovered/* routes here - they will override the generated ones
  // ========================================================================

  {
    path: '/discovery/dashboard',
    element: (<Suspense fallback={<LoadingFallback />}><InfrastructureDiscoveryHubView /></Suspense>),
  },
  {
    path: '/discovery/active-directory',
    element: (<Suspense fallback={<LoadingFallback />}><ActiveDirectoryDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/azure',
    element: (<Suspense fallback={<LoadingFallback />}><EntraIDM365DiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/aws',
    element: (<Suspense fallback={<LoadingFallback />}><AWSCloudInfrastructureDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/exchange',
    element: (<Suspense fallback={<LoadingFallback />}><ExchangeDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/sharepoint',
    element: (<Suspense fallback={<LoadingFallback />}><SharePointDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/teams',
    element: (<Suspense fallback={<LoadingFallback />}><TeamsDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/onedrive',
    element: (<Suspense fallback={<LoadingFallback />}><OneDriveDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/file-system',
    element: (<Suspense fallback={<LoadingFallback />}><FileSystemDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/domain',
    element: (<Suspense fallback={<LoadingFallback />}><DomainDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/network',
    element: (<Suspense fallback={<LoadingFallback />}><NetworkDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/applications',
    element: (<Suspense fallback={<LoadingFallback />}><ApplicationDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/environment',
    element: (<Suspense fallback={<LoadingFallback />}><EnvironmentDetectionView /></Suspense>),
  },
  {
    path: '/discovery/google-workspace',
    element: (<Suspense fallback={<LoadingFallback />}><GoogleWorkspaceDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/hyper-v',
    element: (<Suspense fallback={<LoadingFallback />}><HyperVDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/infrastructure',
    element: (<Suspense fallback={<LoadingFallback />}><InfrastructureDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/office365',
    element: (<Suspense fallback={<LoadingFallback />}><Office365DiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/security',
    element: (<Suspense fallback={<LoadingFallback />}><SecurityInfrastructureDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/sql-server',
    element: (<Suspense fallback={<LoadingFallback />}><SQLServerDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/vmware',
    element: (<Suspense fallback={<LoadingFallback />}><VMwareDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/intune',
    element: (<Suspense fallback={<LoadingFallback />}><IntuneDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/conditional-access',
    element: (<Suspense fallback={<LoadingFallback />}><ConditionalAccessDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/dlp',
    element: (<Suspense fallback={<LoadingFallback />}><DLPDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/certificate',
    element: (<Suspense fallback={<LoadingFallback />}><CertificateDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/certificate-authority',
    element: (<Suspense fallback={<LoadingFallback />}><CertificateAuthorityDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/dns-dhcp',
    element: (<Suspense fallback={<LoadingFallback />}><DNSDHCPDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/printer',
    element: (<Suspense fallback={<LoadingFallback />}><PrinterDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/virtualization',
    element: (<Suspense fallback={<LoadingFallback />}><VirtualizationDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/physical-server',
    element: (<Suspense fallback={<LoadingFallback />}><PhysicalServerDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/storage-array',
    element: (<Suspense fallback={<LoadingFallback />}><StorageArrayDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/database-schema',
    element: (<Suspense fallback={<LoadingFallback />}><DatabaseSchemaDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/web-server',
    element: (<Suspense fallback={<LoadingFallback />}><WebServerConfigDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/power-platform',
    element: (<Suspense fallback={<LoadingFallback />}><PowerPlatformDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/powerbi',
    element: (<Suspense fallback={<LoadingFallback />}><PowerBIDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/entra-id-app',
    element: (<Suspense fallback={<LoadingFallback />}><EntraIDAppDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/external-identity',
    element: (<Suspense fallback={<LoadingFallback />}><ExternalIdentityDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/gpo',
    element: (<Suspense fallback={<LoadingFallback />}><GPODiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/multi-domain-forest',
    element: (<Suspense fallback={<LoadingFallback />}><MultiDomainForestDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/data-classification',
    element: (<Suspense fallback={<LoadingFallback />}><DataClassificationDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/licensing',
    element: (<Suspense fallback={<LoadingFallback />}><LicensingDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/scheduled-task',
    element: (<Suspense fallback={<LoadingFallback />}><ScheduledTaskDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/backup-recovery',
    element: (<Suspense fallback={<LoadingFallback />}><BackupRecoveryDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/palo-alto',
    element: (<Suspense fallback={<LoadingFallback />}><PaloAltoDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/panorama-interrogation',
    element: (<Suspense fallback={<LoadingFallback />}><PanoramaInterrogationDiscoveryView /></Suspense>),
  },
  // Temporarily disabled - hook not implemented yet
  // {
  //   path: '/discovery/gcp',
  //   element: withSuspense(() => import('./views/discovery/GCPDiscoveryView')),
  // },
  {
    path: '/discovery/graph',
    element: (<Suspense fallback={<LoadingFallback />}><GraphDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/file-server',
    element: (<Suspense fallback={<LoadingFallback />}><FileServerDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/azure-resource',
    element: (<Suspense fallback={<LoadingFallback />}><AzureResourceDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/azure-vmss',
    element: (<Suspense fallback={<LoadingFallback />}><AzureVMSSDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/azure-functions',
    element: (<Suspense fallback={<LoadingFallback />}><AzureFunctionsDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/azure-acr',
    element: (<Suspense fallback={<LoadingFallback />}><AzureACRDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/azure-automation',
    element: (<Suspense fallback={<LoadingFallback />}><AzureAutomationDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/azure-logicapps',
    element: (<Suspense fallback={<LoadingFallback />}><AzureLogicAppsDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/azure-mgmt-groups',
    element: (<Suspense fallback={<LoadingFallback />}><AzureManagementGroupsDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/azure-pim',
    element: (<Suspense fallback={<LoadingFallback />}><AzurePIMDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/azure-sub-owners',
    element: (<Suspense fallback={<LoadingFallback />}><AzureSubscriptionOwnersDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/azure-keyvault-access',
    element: (<Suspense fallback={<LoadingFallback />}><AzureKeyVaultAccessDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/azure-managed-identities',
    element: (<Suspense fallback={<LoadingFallback />}><AzureManagedIdentitiesDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/azure-sp-credentials',
    element: (<Suspense fallback={<LoadingFallback />}><AzureServicePrincipalCredentialsDiscoveryView /></Suspense>),
  },
  {
    path: '/discovery/azure-storage-access',
    element: (<Suspense fallback={<LoadingFallback />}><AzureStorageAccountAccessDiscoveryView /></Suspense>),
  },

  // Auto-generated discovered data routes (CSV display views)
  ...discoveredRoutes,

  // Migration Control Plane routes
  {
    path: '/migration',
    element: (<Suspense fallback={<LoadingFallback />}><MigrationDashboardView /></Suspense>),
  },
  {
    path: '/migration/dashboard',
    element: (<Suspense fallback={<LoadingFallback />}><MigrationDashboardView /></Suspense>),
  },
  {
    path: '/migration/planning',
    element: (<Suspense fallback={<LoadingFallback />}><MigrationPlanningView /></Suspense>),
  },
  {
    path: '/migration/mapping',
    element: (<Suspense fallback={<LoadingFallback />}><MigrationMappingView /></Suspense>),
  },
  {
    path: '/migration/validation',
    element: (<Suspense fallback={<LoadingFallback />}><MigrationValidationView /></Suspense>),
  },
  {
    path: '/migration/go-no-go',
    element: (<Suspense fallback={<LoadingFallback />}><GoNoGoCheckpointView /></Suspense>),
  },
  {
    path: '/migration/execution',
    element: (<Suspense fallback={<LoadingFallback />}><MigrationExecutionView /></Suspense>),
  },
  {
    path: '/migration/gantt',
    element: (<Suspense fallback={<LoadingFallback />}><GanttChartView /></Suspense>),
  },
  {
    path: '/migration/monitor',
    element: (<Suspense fallback={<LoadingFallback />}><MigrationMonitorView /></Suspense>),
  },
  // Migration Workload routes
  {
    path: '/migration/workloads',
    element: (<Suspense fallback={<LoadingFallback />}><UserMigrationView /></Suspense>),
  },
  {
    path: '/migration/workloads/users',
    element: (<Suspense fallback={<LoadingFallback />}><UserMigrationView /></Suspense>),
  },
  {
    path: '/migration/workloads/mailboxes',
    element: (<Suspense fallback={<LoadingFallback />}><MailboxMigrationView /></Suspense>),
  },
  {
    path: '/migration/workloads/sharepoint',
    element: (<Suspense fallback={<LoadingFallback />}><SharePointMigrationView /></Suspense>),
  },
  {
    path: '/migration/workloads/onedrive',
    element: (<Suspense fallback={<LoadingFallback />}><OneDriveMigrationView /></Suspense>),
  },
  {
    path: '/migration/workloads/teams',
    element: (<Suspense fallback={<LoadingFallback />}><TeamsMigrationView /></Suspense>),
  },
  {
    path: '/migration/workloads/devices',
    element: (<Suspense fallback={<LoadingFallback />}><DeviceMigrationView /></Suspense>),
  },

  // Enhanced Migration Control Plane routes
  {
    path: '/migration/domain-mapping',
    element: (<Suspense fallback={<LoadingFallback />}><DomainMappingView /></Suspense>),
  },
  {
    path: '/migration/azure-resources',
    element: (<Suspense fallback={<LoadingFallback />}><AzureResourceMigrationView /></Suspense>),
  },
  {
    path: '/migration/engineering',
    element: (<Suspense fallback={<LoadingFallback />}><MigrationEngineeringView /></Suspense>),
  },

  // Consolidated Inventory
  {
    path: '/inventory/users',
    element: (<Suspense fallback={<LoadingFallback />}><ConsolidatedUsersView /></Suspense>),
  },
  {
    path: '/inventory/groups',
    element: (<Suspense fallback={<LoadingFallback />}><ConsolidatedGroupsView /></Suspense>),
  },
  {
    path: '/inventory/applications',
    element: (<Suspense fallback={<LoadingFallback />}><ConsolidatedApplicationsView /></Suspense>),
  },
  {
    path: '/inventory/infrastructure',
    element: (<Suspense fallback={<LoadingFallback />}><ConsolidatedInfrastructureView /></Suspense>),
  },
  {
    path: '/inventory/factsheets',
    element: (<Suspense fallback={<LoadingFallback />}><ApplicationInventoryView /></Suspense>),
  },

  // Users & Groups
  {
    path: '/users',
    element: (<Suspense fallback={<LoadingFallback />}><UsersView /></Suspense>),
  },
  {
    path: '/groups',
    element: (<Suspense fallback={<LoadingFallback />}><GroupsView /></Suspense>),
  },

  // Analytics
  {
    path: '/analytics/executive',
    element: (<Suspense fallback={<LoadingFallback />}><ExecutiveDashboardView /></Suspense>),
  },
  {
    path: '/analytics/migration',
    element: (<Suspense fallback={<LoadingFallback />}><MigrationReportView /></Suspense>),
  },
  {
    path: '/analytics/users',
    element: (<Suspense fallback={<LoadingFallback />}><UserAnalyticsView /></Suspense>),
  },
  {
    path: '/analytics/cost',
    element: (<Suspense fallback={<LoadingFallback />}><CostAnalysisView /></Suspense>),
  },
  {
    path: '/analytics/trends',
    element: (<Suspense fallback={<LoadingFallback />}><TrendAnalysisView /></Suspense>),
  },

  // Admin
  {
    path: '/admin/users',
    element: (<Suspense fallback={<LoadingFallback />}><UserManagementView /></Suspense>),
  },
  {
    path: '/admin/roles',
    element: (<Suspense fallback={<LoadingFallback />}><RoleManagementView /></Suspense>),
  },
  {
    path: '/admin/permissions',
    element: (<Suspense fallback={<LoadingFallback />}><PermissionsView /></Suspense>),
  },
  {
    path: '/admin/audit',
    element: (<Suspense fallback={<LoadingFallback />}><AuditLogView /></Suspense>),
  },
  {
    path: '/admin/system',
    element: (<Suspense fallback={<LoadingFallback />}><SystemConfigurationView /></Suspense>),
  },
  {
    path: '/admin/backup',
    element: (<Suspense fallback={<LoadingFallback />}><BackupRestoreView /></Suspense>),
  },
  {
    path: '/admin/license',
    element: (<Suspense fallback={<LoadingFallback />}><LicenseActivationView /></Suspense>),
  },
  {
    path: '/admin/about',
    element: (<Suspense fallback={<LoadingFallback />}><AboutView /></Suspense>),
  },

  // Infrastructure
  {
    path: '/infrastructure',
    element: (<Suspense fallback={<LoadingFallback />}><InfrastructureView /></Suspense>),
  },

  // Assets
  {
    path: '/assets/inventory',
    element: (<Suspense fallback={<LoadingFallback />}><AssetInventoryView /></Suspense>),
  },
  {
    path: '/assets/servers',
    element: (<Suspense fallback={<LoadingFallback />}><ServerInventoryView /></Suspense>),
  },
  {
    path: '/assets/network-devices',
    element: (<Suspense fallback={<LoadingFallback />}><NetworkDeviceInventoryView /></Suspense>),
  },
  {
    path: '/assets/computers',
    element: (<Suspense fallback={<LoadingFallback />}><ComputerInventoryView /></Suspense>),
  },

  // Security & Compliance
  {
    path: '/security/audit',
    element: (<Suspense fallback={<LoadingFallback />}><SecurityAuditView /></Suspense>),
  },
  {
    path: '/compliance/dashboard',
    element: (<Suspense fallback={<LoadingFallback />}><ComplianceDashboardView /></Suspense>),
  },
  {
    path: '/compliance/report',
    element: (<Suspense fallback={<LoadingFallback />}><ComplianceReportView /></Suspense>),
  },
  {
    path: '/security/risk',
    element: (<Suspense fallback={<LoadingFallback />}><RiskAssessmentView /></Suspense>),
  },
  {
    path: '/security/policy',
    element: (<Suspense fallback={<LoadingFallback />}><PolicyManagementView /></Suspense>),
  },

  // Licensing Hub
  {
    path: '/licensing',
    element: (<Suspense fallback={<LoadingFallback />}><LicensingHubView /></Suspense>),
  },

  // Reports & Settings
  {
    path: '/reports',
    element: (<Suspense fallback={<LoadingFallback />}><ReportsView /></Suspense>),
  },
  {
    path: '/settings',
    element: (<Suspense fallback={<LoadingFallback />}><SettingsView /></Suspense>),
  },

  // 404 Not Found
  {
    path: '*',
    element: (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404 - Not Found</h1>
          <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
          <a href="/" className="text-blue-600 hover:underline">Go to Dashboard</a>
        </div>
      </div>
    ),
  },
];

export default routes;


