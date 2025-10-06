/**
 * Main Application Component
 *
 * Root component with routing and lazy loading
 */

import React, { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Spinner } from './components/atoms/Spinner';
import { ErrorBoundary } from './components/organisms/ErrorBoundary';
import { MainLayout } from './components/layouts/MainLayout';
import { ToastContainer } from './components/organisms/ToastContainer';
import { ModalContainer } from './components/organisms/ModalContainer';
import { useThemeStore } from './store/useThemeStore';
import { useProfileStore } from './store/useProfileStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { applyTheme, getTheme } from './styles/themes';

// Import CSS
import './index.css';

// Lazy load AG Grid CSS only when needed
// This reduces initial bundle size significantly
if (typeof window !== 'undefined') {
  // We'll load AG Grid styles dynamically when first grid component mounts
  // See DataGridWrapper component for implementation
}

// Lazy load all views for code splitting
const OverviewView = lazy(() => import('./views/overview/OverviewView'));
const UsersView = lazy(() => import('./views/users/UsersView'));
const UserDetailViewWrapper = lazy(() => import('./views/users/UserDetailViewWrapper'));
const GroupsView = lazy(() => import('./views/groups/GroupsView'));
const GroupDetailViewWrapper = lazy(() => import('./views/groups/GroupDetailViewWrapper'));
const ComputersView = lazy(() => import('./views/computers/ComputersView'));
const ComputerDetailViewWrapper = lazy(() => import('./views/computers/ComputerDetailViewWrapper'));
const DomainDiscoveryView = lazy(() => import('./views/discovery/DomainDiscoveryView'));
const AzureDiscoveryView = lazy(() => import('./views/discovery/AzureDiscoveryView'));
const ActiveDirectoryDiscoveryView = lazy(() => import('./views/discovery/ActiveDirectoryDiscoveryView'));
const InfrastructureDiscoveryHubView = lazy(() => import('./views/discovery/InfrastructureDiscoveryHubView'));
const ApplicationDiscoveryView = lazy(() => import('./views/discovery/ApplicationDiscoveryView'));
const Office365DiscoveryView = lazy(() => import('./views/discovery/Office365DiscoveryView'));
const ExchangeDiscoveryView = lazy(() => import('./views/discovery/ExchangeDiscoveryView'));
const SharePointDiscoveryView = lazy(() => import('./views/discovery/SharePointDiscoveryView'));
const TeamsDiscoveryView = lazy(() => import('./views/discovery/TeamsDiscoveryView'));
const OneDriveDiscoveryView = lazy(() => import('./views/discovery/OneDriveDiscoveryView'));
const SecurityInfrastructureDiscoveryView = lazy(() => import('./views/discovery/SecurityInfrastructureDiscoveryView'));
const FileSystemDiscoveryView = lazy(() => import('./views/discovery/FileSystemDiscoveryView'));
const NetworkDiscoveryView = lazy(() => import('./views/discovery/NetworkDiscoveryView'));
const SQLServerDiscoveryView = lazy(() => import('./views/discovery/SQLServerDiscoveryView'));
const VMwareDiscoveryView = lazy(() => import('./views/discovery/VMwareDiscoveryView'));
const AWSCloudInfrastructureDiscoveryView = lazy(() => import('./views/discovery/AWSCloudInfrastructureDiscoveryView'));
const GoogleWorkspaceDiscoveryView = lazy(() => import('./views/discovery/GoogleWorkspaceDiscoveryView'));
const IntuneDiscoveryView = lazy(() => import('./views/discovery/IntuneDiscoveryView'));
const LicensingDiscoveryView = lazy(() => import('./views/discovery/LicensingDiscoveryView'));
const ConditionalAccessPoliciesDiscoveryView = lazy(() => import('./views/discovery/ConditionalAccessPoliciesDiscoveryView'));
const DataLossPreventionDiscoveryView = lazy(() => import('./views/discovery/DataLossPreventionDiscoveryView'));
const IdentityGovernanceDiscoveryView = lazy(() => import('./views/discovery/IdentityGovernanceDiscoveryView'));
const PowerPlatformDiscoveryView = lazy(() => import('./views/discovery/PowerPlatformDiscoveryView'));
const WebServerConfigurationDiscoveryView = lazy(() => import('./views/discovery/WebServerConfigurationDiscoveryView'));
const HyperVDiscoveryView = lazy(() => import('./views/discovery/HyperVDiscoveryView'));
const EnvironmentDetectionView = lazy(() => import('./views/discovery/EnvironmentDetectionView'));
const InfrastructureView = lazy(() => import('./views/infrastructure/InfrastructureView'));
// TASK 4: Infrastructure views (13 new views)
const NetworkTopologyView = lazy(() => import('./views/infrastructure/NetworkTopologyView'));
const StorageAnalysisView = lazy(() => import('./views/infrastructure/StorageAnalysisView'));
const VirtualizationView = lazy(() => import('./views/infrastructure/VirtualizationView'));
const CloudResourcesView = lazy(() => import('./views/infrastructure/CloudResourcesView'));
const DatabaseInventoryView = lazy(() => import('./views/infrastructure/DatabaseInventoryView'));
const ApplicationServersView = lazy(() => import('./views/infrastructure/ApplicationServersView'));
const WebServersView = lazy(() => import('./views/infrastructure/WebServersView'));
const SecurityAppliancesView = lazy(() => import('./views/infrastructure/SecurityAppliancesView'));
const BackupSystemsView = lazy(() => import('./views/infrastructure/BackupSystemsView'));
const MonitoringSystemsView = lazy(() => import('./views/infrastructure/MonitoringSystemsView'));
const NetworkDevicesView = lazy(() => import('./views/infrastructure/NetworkDevicesView'));
const EndpointDevicesView = lazy(() => import('./views/infrastructure/EndpointDevicesView'));
const MigrationPlanningView = lazy(() => import('./views/migration/MigrationPlanningView'));
const MigrationMappingView = lazy(() => import('./views/migration/MigrationMappingView'));
const MigrationValidationView = lazy(() => import('./views/migration/MigrationValidationView'));
const MigrationExecutionView = lazy(() => import('./views/migration/MigrationExecutionView'));
const ReportsView = lazy(() => import('./views/reports/ReportsView'));
const SettingsView = lazy(() => import('./views/settings/SettingsView'));

// Analytics views - These use Recharts (large library), lazy loaded for better performance
const ExecutiveDashboardView = lazy(() => import('./views/analytics/ExecutiveDashboardView'));
const MigrationReportView = lazy(() => import('./views/analytics/MigrationReportView'));
const UserAnalyticsView = lazy(() => import('./views/analytics/UserAnalyticsView'));

// Project Management views - TASK 2
const ProjectConfigurationView = lazy(() => import('./views/project/ProjectConfigurationView'));

// Security/Compliance views - TASK 3
const AccessReviewView = lazy(() => import('./views/security/AccessReviewView'));
const CertificationView = lazy(() => import('./views/security/CertificationView'));
const ComplianceDashboardView = lazy(() => import('./views/security/ComplianceDashboardView'));
const DataClassificationView = lazy(() => import('./views/security/DataClassificationView'));
const IdentityGovernanceView = lazy(() => import('./views/security/IdentityGovernanceView'));
const IncidentResponseView = lazy(() => import('./views/security/IncidentResponseView'));
const PolicyManagementView = lazy(() => import('./views/security/PolicyManagementView'));
const PrivilegedAccessView = lazy(() => import('./views/security/PrivilegedAccessView'));
const RiskAssessmentView = lazy(() => import('./views/security/RiskAssessmentView'));
const SecurityAuditView = lazy(() => import('./views/security/SecurityAuditView'));
const SecurityDashboardView = lazy(() => import('./views/security/SecurityDashboardView'));
const ThreatAnalysisView = lazy(() => import('./views/security/ThreatAnalysisView'));
const VulnerabilityManagementView = lazy(() => import('./views/security/VulnerabilityManagementView'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <Spinner size="xl" label="Loading view..." />
  </div>
);

/**
 * Main Application Component
 */
export const App: React.FC = () => {
  const { actualMode } = useThemeStore();
  const { loadSourceProfiles } = useProfileStore();

  // Enable global keyboard shortcuts
  useKeyboardShortcuts();

  // Initialize application
  useEffect(() => {
    // Load profiles
    loadSourceProfiles().catch(console.error);

    // Apply theme to DOM based on current mode
    const theme = getTheme(actualMode === 'dark' ? 'dark' : 'light');
    applyTheme(theme);
  }, [actualMode, loadSourceProfiles]);

  return (
    <ErrorBoundary>
      <DndProvider backend={HTML5Backend}>
        <HashRouter>
          <MainLayout>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Home/Overview */}
                <Route path="/" element={<OverviewView />} />

              {/* Discovery Routes */}
              <Route path="/discovery">
                <Route index element={<InfrastructureDiscoveryHubView />} />
                <Route path="domain" element={<DomainDiscoveryView />} />
                <Route path="azure" element={<AzureDiscoveryView />} />
                <Route path="active-directory" element={<ActiveDirectoryDiscoveryView />} />
                <Route path="application" element={<ApplicationDiscoveryView />} />
                <Route path="office365" element={<Office365DiscoveryView />} />
                <Route path="exchange" element={<ExchangeDiscoveryView />} />
                <Route path="sharepoint" element={<SharePointDiscoveryView />} />
                <Route path="teams" element={<TeamsDiscoveryView />} />
                <Route path="onedrive" element={<OneDriveDiscoveryView />} />
                <Route path="security" element={<SecurityInfrastructureDiscoveryView />} />
                <Route path="filesystem" element={<FileSystemDiscoveryView />} />
                <Route path="network" element={<NetworkDiscoveryView />} />
                <Route path="sqlserver" element={<SQLServerDiscoveryView />} />
                <Route path="vmware" element={<VMwareDiscoveryView />} />
                <Route path="aws" element={<AWSCloudInfrastructureDiscoveryView />} />
                <Route path="google-workspace" element={<GoogleWorkspaceDiscoveryView />} />
                <Route path="intune" element={<IntuneDiscoveryView />} />
                <Route path="licensing" element={<LicensingDiscoveryView />} />
                <Route path="conditional-access" element={<ConditionalAccessPoliciesDiscoveryView />} />
                <Route path="dlp" element={<DataLossPreventionDiscoveryView />} />
                <Route path="identity-governance" element={<IdentityGovernanceDiscoveryView />} />
                <Route path="power-platform" element={<PowerPlatformDiscoveryView />} />
                <Route path="web-servers" element={<WebServerConfigurationDiscoveryView />} />
                <Route path="hyperv" element={<HyperVDiscoveryView />} />
                <Route path="environment-detection" element={<EnvironmentDetectionView />} />
              </Route>

              {/* User Management */}
              <Route path="/users" element={<UsersView />} />
              <Route path="/users/:userId" element={<UserDetailViewWrapper />} />

              {/* Group Management - Epic 1 Task 1.4 */}
              <Route path="/groups" element={<GroupsView />} />
              <Route path="/groups/:groupId" element={<GroupDetailViewWrapper />} />

              {/* Computer Management - Epic 1 Task 1.3 */}
              <Route path="/computers" element={<ComputersView />} />
              <Route path="/computers/:computerId" element={<ComputerDetailViewWrapper />} />

              {/* Infrastructure Routes - TASK 4 */}
              <Route path="/infrastructure">
                <Route index element={<InfrastructureView />} />
                <Route path="network-topology" element={<NetworkTopologyView />} />
                <Route path="storage" element={<StorageAnalysisView />} />
                <Route path="virtualization" element={<VirtualizationView />} />
                <Route path="cloud" element={<CloudResourcesView />} />
                <Route path="databases" element={<DatabaseInventoryView />} />
                <Route path="app-servers" element={<ApplicationServersView />} />
                <Route path="web-servers" element={<WebServersView />} />
                <Route path="security-appliances" element={<SecurityAppliancesView />} />
                <Route path="backup" element={<BackupSystemsView />} />
                <Route path="monitoring" element={<MonitoringSystemsView />} />
                <Route path="network-devices" element={<NetworkDevicesView />} />
                <Route path="endpoints" element={<EndpointDevicesView />} />
              </Route>

              {/* Migration Routes */}
              <Route path="/migration">
                <Route index element={<Navigate to="/migration/planning" replace />} />
                <Route path="planning" element={<MigrationPlanningView />} />
                <Route path="mapping" element={<MigrationMappingView />} />
                <Route path="validation" element={<MigrationValidationView />} />
                <Route path="execution" element={<MigrationExecutionView />} />
              </Route>

              {/* Reports */}
              <Route path="/reports" element={<ReportsView />} />

              {/* Analytics Routes */}
              <Route path="/analytics">
                <Route index element={<Navigate to="/analytics/dashboard" replace />} />
                <Route path="dashboard" element={<ExecutiveDashboardView />} />
                <Route path="migration" element={<MigrationReportView />} />
                <Route path="users" element={<UserAnalyticsView />} />
              </Route>

              {/* Project Management Routes - TASK 2 */}
              <Route path="/project" element={<ProjectConfigurationView />} />
              <Route path="/project/configuration" element={<ProjectConfigurationView />} />

              {/* Security/Compliance Routes - TASK 3 */}
              <Route path="/security">
                <Route index element={<Navigate to="/security/dashboard" replace />} />
                <Route path="dashboard" element={<SecurityDashboardView />} />
                <Route path="compliance" element={<ComplianceDashboardView />} />
                <Route path="access-review" element={<AccessReviewView />} />
                <Route path="certification" element={<CertificationView />} />
                <Route path="data-classification" element={<DataClassificationView />} />
                <Route path="identity-governance" element={<IdentityGovernanceView />} />
                <Route path="incident-response" element={<IncidentResponseView />} />
                <Route path="policy-management" element={<PolicyManagementView />} />
                <Route path="privileged-access" element={<PrivilegedAccessView />} />
                <Route path="risk-assessment" element={<RiskAssessmentView />} />
                <Route path="audit" element={<SecurityAuditView />} />
                <Route path="threat-analysis" element={<ThreatAnalysisView />} />
                <Route path="vulnerability-management" element={<VulnerabilityManagementView />} />
              </Route>

              {/* Settings */}
              <Route path="/settings" element={<SettingsView />} />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </MainLayout>
      </HashRouter>

        {/* Global Toast Notifications */}
        <ToastContainer position="top-right" />

        {/* Global Modal Container */}
        <ModalContainer />
      </DndProvider>
    </ErrorBoundary>
  );
};

export default App;