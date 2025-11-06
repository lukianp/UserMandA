/**
 * Application Routes Configuration
 *
 * Implements lazy loading for all major views to optimize bundle size.
 * Each route is code-split and loaded on demand.
 */

import React, { Suspense, lazy } from 'react';
import { RouteObject } from 'react-router-dom';

import { Spinner } from './components/atoms/Spinner';

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

// Discovery views
const InfrastructureDiscoveryHubView = lazy(() => import('./views/discovery/InfrastructureDiscoveryHubView'));
const ActiveDirectoryDiscoveryView = lazy(() => import('./views/discovery/ActiveDirectoryDiscoveryView'));
const AzureDiscoveryView = lazy(() => import('./views/discovery/AzureDiscoveryView'));
const AWSCloudInfrastructureDiscoveryView = lazy(() => import('./views/discovery/AWSCloudInfrastructureDiscoveryView'));
const ExchangeDiscoveryView = lazy(() => import('./views/discovery/ExchangeDiscoveryView'));
const SharePointDiscoveryView = lazy(() => import('./views/discovery/SharePointDiscoveryView'));
const TeamsDiscoveryView = lazy(() => import('./views/discovery/TeamsDiscoveryView'));
const OneDriveDiscoveryView = lazy(() => import('./views/discovery/OneDriveDiscoveryView'));
const FileSystemDiscoveryView = lazy(() => import('./views/discovery/FileSystemDiscoveryView'));
const DomainDiscoveryView = lazy(() => import('./views/discovery/DomainDiscoveryView'));
const NetworkDiscoveryView = lazy(() => import('./views/discovery/NetworkDiscoveryView'));
const ApplicationDiscoveryView = lazy(() => import('./views/discovery/ApplicationDiscoveryView'));
const EnvironmentDetectionView = lazy(() => import('./views/discovery/EnvironmentDetectionView'));

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

  // Discovery routes
  {
    path: '/discovery',
    element: lazyLoad(() => import('./views/discovery/InfrastructureDiscoveryHubView')),
  },
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
    path: '/discovery/filesystem',
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
    path: '/discovery/application',
    element: lazyLoad(() => import('./views/discovery/ApplicationDiscoveryView')),
  },
  {
    path: '/discovery/environment',
    element: lazyLoad(() => import('./views/discovery/EnvironmentDetectionView')),
  },

  // Migration routes
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
    path: '/migration/execution',
    element: lazyLoad(() => import('./views/migration/MigrationExecutionView')),
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
