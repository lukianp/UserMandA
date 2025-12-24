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
 * Lazy load wrapper with Suspense
 */
const lazyLoad = (factory: () => Promise<{ default: React.ComponentType<any> }>) => {
  const LazyComponent = lazy(factory);
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent />
    </Suspense>
  );
};

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
const SetupAzurePrerequisitesView = lazy(() => import('./views/setup/SetupAzurePrerequisitesView'));
const SetupInstallersView = lazy(() => import('./views/setup/SetupInstallersView'));

// Discovery views
const InfrastructureDiscoveryHubView = lazy(() => import('./views/discovery/InfrastructureDiscoveryHubView'));
const ActiveDirectoryDiscoveryView = lazy(() => import('./views/discovery/ActiveDirectoryDiscoveryView'));

// Organisation Map
const OrganisationMapView = lazy(() => import('./views/organisation/OrganisationMapView'));
const AzureDiscoveryView = lazy(() => import('./views/discovery/AzureDiscoveryView'));
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
const LicenseManagementView = lazy(() => import('./views/licensing/LicenseManagementView'));

/**
 * Application routes
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: lazyLoad(() => import('./views/overview/OverviewView')),
  },
  {
    path: '/overview',
    element: lazyLoad(() => import('./views/overview/OverviewView')),
  },

  // Setup routes
  {
    path: '/setup',
    element: lazyLoad(() => import('./views/setup/SetupCompanyView')),
  },
  {
    path: '/setup/company',
    element: lazyLoad(() => import('./views/setup/SetupCompanyView')),
  },
  {
    path: '/setup/azure-prerequisites',
    element: lazyLoad(() => import('./views/setup/SetupAzurePrerequisitesView')),
  },
  {
    path: '/setup/installers',
    element: lazyLoad(() => import('./views/setup/SetupInstallersView')),
  },

  // Discovery routes
  {
    path: '/discovery',
    element: lazyLoad(() => import('./views/discovery/InfrastructureDiscoveryHubView')),
  },

  // Organisation Map
  {
    path: '/organisation-map',
    element: lazyLoad(() => import('./views/organisation/OrganisationMapView')),
  },

  // ========================================================================
  // DISCOVERED ROUTES - Auto-generated CSV data display views
  // These routes are handled by ...discoveredRoutes below (from _routes.generated.tsx)
  // DO NOT add manual /discovered/* routes here - they will override the generated ones
  // ========================================================================

  {
    path: '/discovery/dashboard',
    element: lazyLoad(() => import('./views/discovery/InfrastructureDiscoveryHubView')),
  },
  {
    path: '/discovery/active-directory',
    element: lazyLoad(() => import('./views/discovery/ActiveDirectoryDiscoveryView')),
  },
  {
    path: '/discovery/azure',
    element: lazyLoad(() => import('./views/discovery/AzureDiscoveryView')),
  },
  {
    path: '/discovery/aws',
    element: lazyLoad(() => import('./views/discovery/AWSCloudInfrastructureDiscoveryView')),
  },
  {
    path: '/discovery/exchange',
    element: lazyLoad(() => import('./views/discovery/ExchangeDiscoveryView')),
  },
  {
    path: '/discovery/sharepoint',
    element: lazyLoad(() => import('./views/discovery/SharePointDiscoveryView')),
  },
  {
    path: '/discovery/teams',
    element: lazyLoad(() => import('./views/discovery/TeamsDiscoveryView')),
  },
  {
    path: '/discovery/onedrive',
    element: lazyLoad(() => import('./views/discovery/OneDriveDiscoveryView')),
  },
  {
    path: '/discovery/file-system',
    element: lazyLoad(() => import('./views/discovery/FileSystemDiscoveryView')),
  },
  {
    path: '/discovery/domain',
    element: lazyLoad(() => import('./views/discovery/DomainDiscoveryView')),
  },
  {
    path: '/discovery/network',
    element: lazyLoad(() => import('./views/discovery/NetworkDiscoveryView')),
  },
  {
    path: '/discovery/applications',
    element: lazyLoad(() => import('./views/discovery/ApplicationDiscoveryView')),
  },
  {
    path: '/discovery/environment',
    element: lazyLoad(() => import('./views/discovery/EnvironmentDetectionView')),
  },
  {
    path: '/discovery/google-workspace',
    element: lazyLoad(() => import('./views/discovery/GoogleWorkspaceDiscoveryView')),
  },
  {
    path: '/discovery/hyper-v',
    element: lazyLoad(() => import('./views/discovery/HyperVDiscoveryView')),
  },
  {
    path: '/discovery/office365',
    element: lazyLoad(() => import('./views/discovery/Office365DiscoveryView')),
  },
  {
    path: '/discovery/security',
    element: lazyLoad(() => import('./views/discovery/SecurityInfrastructureDiscoveryView')),
  },
  {
    path: '/discovery/sql-server',
    element: lazyLoad(() => import('./views/discovery/SQLServerDiscoveryView')),
  },
  {
    path: '/discovery/vmware',
    element: lazyLoad(() => import('./views/discovery/VMwareDiscoveryView')),
  },
  {
    path: '/discovery/intune',
    element: lazyLoad(() => import('./views/discovery/IntuneDiscoveryView')),
  },
  {
    path: '/discovery/conditional-access',
    element: lazyLoad(() => import('./views/discovery/ConditionalAccessDiscoveryView')),
  },
  {
    path: '/discovery/dlp',
    element: lazyLoad(() => import('./views/discovery/DLPDiscoveryView')),
  },
  {
    path: '/discovery/certificate',
    element: lazyLoad(() => import('./views/discovery/CertificateDiscoveryView')),
  },
  {
    path: '/discovery/certificate-authority',
    element: lazyLoad(() => import('./views/discovery/CertificateAuthorityDiscoveryView')),
  },
  {
    path: '/discovery/dns-dhcp',
    element: lazyLoad(() => import('./views/discovery/DNSDHCPDiscoveryView')),
  },
  {
    path: '/discovery/printer',
    element: lazyLoad(() => import('./views/discovery/PrinterDiscoveryView')),
  },
  {
    path: '/discovery/virtualization',
    element: lazyLoad(() => import('./views/discovery/VirtualizationDiscoveryView')),
  },
  {
    path: '/discovery/physical-server',
    element: lazyLoad(() => import('./views/discovery/PhysicalServerDiscoveryView')),
  },
  {
    path: '/discovery/storage-array',
    element: lazyLoad(() => import('./views/discovery/StorageArrayDiscoveryView')),
  },
  {
    path: '/discovery/database-schema',
    element: lazyLoad(() => import('./views/discovery/DatabaseSchemaDiscoveryView')),
  },
  {
    path: '/discovery/web-server',
    element: lazyLoad(() => import('./views/discovery/WebServerConfigDiscoveryView')),
  },
  {
    path: '/discovery/power-platform',
    element: lazyLoad(() => import('./views/discovery/PowerPlatformDiscoveryView')),
  },
  {
    path: '/discovery/powerbi',
    element: lazyLoad(() => import('./views/discovery/PowerBIDiscoveryView')),
  },
  {
    path: '/discovery/entra-id-app',
    element: lazyLoad(() => import('./views/discovery/EntraIDAppDiscoveryView')),
  },
  {
    path: '/discovery/external-identity',
    element: lazyLoad(() => import('./views/discovery/ExternalIdentityDiscoveryView')),
  },
  {
    path: '/discovery/gpo',
    element: lazyLoad(() => import('./views/discovery/GPODiscoveryView')),
  },
  {
    path: '/discovery/multi-domain-forest',
    element: lazyLoad(() => import('./views/discovery/MultiDomainForestDiscoveryView')),
  },
  {
    path: '/discovery/data-classification',
    element: lazyLoad(() => import('./views/discovery/DataClassificationDiscoveryView')),
  },
  {
    path: '/discovery/licensing',
    element: lazyLoad(() => import('./views/discovery/LicensingDiscoveryView')),
  },
  {
    path: '/discovery/scheduled-task',
    element: lazyLoad(() => import('./views/discovery/ScheduledTaskDiscoveryView')),
  },
  {
    path: '/discovery/backup-recovery',
    element: lazyLoad(() => import('./views/discovery/BackupRecoveryDiscoveryView')),
  },
  {
    path: '/discovery/palo-alto',
    element: lazyLoad(() => import('./views/discovery/PaloAltoDiscoveryView')),
  },
  {
    path: '/discovery/panorama-interrogation',
    element: lazyLoad(() => import('./views/discovery/PanoramaInterrogationDiscoveryView')),
  },
  // Temporarily disabled - hook not implemented yet
  // {
  //   path: '/discovery/gcp',
  //   element: lazyLoad(() => import('./views/discovery/GCPDiscoveryView')),
  // },
  {
    path: '/discovery/graph',
    element: lazyLoad(() => import('./views/discovery/GraphDiscoveryView')),
  },
  {
    path: '/discovery/file-server',
    element: lazyLoad(() => import('./views/discovery/FileServerDiscoveryView')),
  },
  {
    path: '/discovery/azure-resource',
    element: lazyLoad(() => import('./views/discovery/AzureResourceDiscoveryView')),
  },

  // Auto-generated discovered data routes (CSV display views)
  ...discoveredRoutes,

  // Migration Control Plane routes
  {
    path: '/migration',
    element: lazyLoad(() => import('./views/migration/MigrationDashboardView')),
  },
  {
    path: '/migration/dashboard',
    element: lazyLoad(() => import('./views/migration/MigrationDashboardView')),
  },
  {
    path: '/migration/planning',
    element: lazyLoad(() => import('./views/migration/MigrationPlanningView')),
  },
  {
    path: '/migration/mapping',
    element: lazyLoad(() => import('./views/migration/MigrationMappingView')),
  },
  {
    path: '/migration/validation',
    element: lazyLoad(() => import('./views/migration/MigrationValidationView')),
  },
  {
    path: '/migration/go-no-go',
    element: lazyLoad(() => import('./views/migration/GoNoGoCheckpointView')),
  },
  {
    path: '/migration/execution',
    element: lazyLoad(() => import('./views/migration/MigrationExecutionView')),
  },
  {
    path: '/migration/gantt',
    element: lazyLoad(() => import('./views/migration/GanttChartView')),
  },
  {
    path: '/migration/monitor',
    element: lazyLoad(() => import('./views/migration/MigrationMonitorView')),
  },
  // Migration Workload routes
  {
    path: '/migration/workloads',
    element: lazyLoad(() => import('./views/migration/UserMigrationView')),
  },
  {
    path: '/migration/workloads/users',
    element: lazyLoad(() => import('./views/migration/UserMigrationView')),
  },
  {
    path: '/migration/workloads/mailboxes',
    element: lazyLoad(() => import('./views/migration/MailboxMigrationView')),
  },
  {
    path: '/migration/workloads/sharepoint',
    element: lazyLoad(() => import('./views/migration/SharePointMigrationView')),
  },
  {
    path: '/migration/workloads/onedrive',
    element: lazyLoad(() => import('./views/migration/OneDriveMigrationView')),
  },
  {
    path: '/migration/workloads/teams',
    element: lazyLoad(() => import('./views/migration/TeamsMigrationView')),
  },
  {
    path: '/migration/workloads/devices',
    element: lazyLoad(() => import('./views/migration/DeviceMigrationView')),
  },

  // Enhanced Migration Control Plane routes
  {
    path: '/migration/domain-mapping',
    element: lazyLoad(() => import('./views/migration/DomainMappingView')),
  },
  {
    path: '/migration/azure-resources',
    element: lazyLoad(() => import('./views/migration/AzureResourceMigrationView')),
  },
  {
    path: '/migration/engineering',
    element: lazyLoad(() => import('./views/migration/MigrationEngineeringView')),
  },

  // Consolidated Inventory
  {
    path: '/inventory/users',
    element: lazyLoad(() => import('./views/inventory/ConsolidatedUsersView')),
  },
  {
    path: '/inventory/groups',
    element: lazyLoad(() => import('./views/inventory/ConsolidatedGroupsView')),
  },
  {
    path: '/inventory/applications',
    element: lazyLoad(() => import('./views/inventory/ConsolidatedApplicationsView')),
  },
  {
    path: '/inventory/infrastructure',
    element: lazyLoad(() => import('./views/inventory/ConsolidatedInfrastructureView')),
  },

  // Users & Groups
  {
    path: '/users',
    element: lazyLoad(() => import('./views/users/UsersView')),
  },
  {
    path: '/groups',
    element: lazyLoad(() => import('./views/groups/GroupsView')),
  },

  // Analytics
  {
    path: '/analytics/executive',
    element: lazyLoad(() => import('./views/analytics/ExecutiveDashboardView')),
  },
  {
    path: '/analytics/migration',
    element: lazyLoad(() => import('./views/analytics/MigrationReportView')),
  },
  {
    path: '/analytics/users',
    element: lazyLoad(() => import('./views/analytics/UserAnalyticsView')),
  },
  {
    path: '/analytics/cost',
    element: lazyLoad(() => import('./views/analytics/CostAnalysisView')),
  },
  {
    path: '/analytics/trends',
    element: lazyLoad(() => import('./views/analytics/TrendAnalysisView')),
  },

  // Admin
  {
    path: '/admin/users',
    element: lazyLoad(() => import('./views/admin/UserManagementView')),
  },
  {
    path: '/admin/roles',
    element: lazyLoad(() => import('./views/admin/RoleManagementView')),
  },
  {
    path: '/admin/permissions',
    element: lazyLoad(() => import('./views/admin/PermissionsView')),
  },
  {
    path: '/admin/audit',
    element: lazyLoad(() => import('./views/admin/AuditLogView')),
  },
  {
    path: '/admin/system',
    element: lazyLoad(() => import('./views/admin/SystemConfigurationView')),
  },
  {
    path: '/admin/backup',
    element: lazyLoad(() => import('./views/admin/BackupRestoreView')),
  },
  {
    path: '/admin/license',
    element: lazyLoad(() => import('./views/admin/LicenseActivationView')),
  },
  {
    path: '/admin/about',
    element: lazyLoad(() => import('./views/admin/AboutView')),
  },

  // Infrastructure
  {
    path: '/infrastructure',
    element: lazyLoad(() => import('./views/infrastructure/InfrastructureView')),
  },

  // Assets
  {
    path: '/assets/inventory',
    element: lazyLoad(() => import('./views/assets/AssetInventoryView')),
  },
  {
    path: '/assets/servers',
    element: lazyLoad(() => import('./views/assets/ServerInventoryView')),
  },
  {
    path: '/assets/network-devices',
    element: lazyLoad(() => import('./views/assets/NetworkDeviceInventoryView')),
  },
  {
    path: '/assets/computers',
    element: lazyLoad(() => import('./views/assets/ComputerInventoryView')),
  },

  // Security & Compliance
  {
    path: '/security/audit',
    element: lazyLoad(() => import('./views/security/SecurityAuditView')),
  },
  {
    path: '/compliance/dashboard',
    element: lazyLoad(() => import('./views/compliance/ComplianceDashboardView')),
  },
  {
    path: '/compliance/report',
    element: lazyLoad(() => import('./views/compliance/ComplianceReportView')),
  },
  {
    path: '/security/risk',
    element: lazyLoad(() => import('./views/security/RiskAssessmentView')),
  },
  {
    path: '/security/policy',
    element: lazyLoad(() => import('./views/security/PolicyManagementView')),
  },

  // Licensing
  {
    path: '/licensing',
    element: lazyLoad(() => import('./views/licensing/LicenseManagementView')),
  },

  // Reports & Settings
  {
    path: '/reports',
    element: lazyLoad(() => import('./views/reports/ReportsView')),
  },
  {
    path: '/settings',
    element: lazyLoad(() => import('./views/settings/SettingsView')),
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
