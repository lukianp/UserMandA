/**
 * UserDetailView Component
 *
 * Comprehensive user detail view with 9-tab structure.
 * Replicates /GUI/Views/UserDetailView.xaml functionality (lines 1-539).
 *
 * Features:
 * - User summary card with 3-column layout
 * - 9 data correlation tabs (Overview, Devices, Apps, Groups, GPOs, File Access, Mailbox, Azure Roles, SQL & Risks)
 * - Action buttons (Refresh, Add to Wave, Export, Close)
 * - Loading overlay with progress messages
 * - Status bar with real-time messages
 * - Full keyboard navigation and accessibility
 *
 * Epic 1 Task 1.2: UserDetailView Component
 *
 * @param userId - User identifier (SID or UPN) passed via tab data
 */

import React, { useEffect, useMemo } from 'react';
import { RefreshCw, UserPlus, Download, X } from 'lucide-react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';

import { useUserDetailLogic } from '../../hooks/useUserDetailLogic';
import { Button } from '../../components/atoms/Button';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { ModernCard } from '../../components/atoms/ModernCard';
import DecisionWhyPanel from '../../components/molecules/DecisionWhyPanel';
import { useProfileStore } from '../../store/useProfileStore';
import type {
  UserDetailProjection,
  DeviceData,
  FileAccessEntry,
  GpoData,
  MailboxData,
  AzureRoleAssignment,
  SqlDatabaseData,
  RiskItem,
  TeamMembership,
  SharePointSiteAccess,
} from '../../types/models/userDetail';
import type { GroupData } from '../../types/models/group';
import type { ApplicationData } from '../../types/models/application';

export interface UserDetailViewProps {
  userId: string;
}

export const UserDetailView: React.FC<UserDetailViewProps> = ({ userId }) => {
  const {
    userDetail,
    isLoading,
    error,
    loadingMessage,
    selectedTab,
    setSelectedTab,
    refreshData,
    addToMigrationWave,
    exportSnapshot,
    closeView,
  } = useUserDetailLogic(userId);

  // Get current profile ID for Decision Trace queries
  const selectedProfile = useProfileStore((state) => state.selectedSourceProfile);
  const profileId = selectedProfile?.id || '';

  // Keyboard shortcuts (Ctrl+R, Ctrl+E, Ctrl+W, Ctrl+1-9)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case 'r':
            e.preventDefault();
            refreshData();
            break;
          case 'e':
            e.preventDefault();
            exportSnapshot('json');
            break;
          case 'w':
            e.preventDefault();
            closeView();
            break;
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
            e.preventDefault();
            setSelectedTab(parseInt(e.key) - 1);
            break;
          case '0':
            e.preventDefault();
            setSelectedTab(10); // 11th tab (Why? - Decision Timeline)
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [refreshData, exportSnapshot, closeView, setSelectedTab]);

  // Render error state
  if (error && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <ModernCard className="p-8 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Error Loading User Details
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={refreshData} variant="primary">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </ModernCard>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col p-6" data-cy="user-detail-view" data-testid="user-detail-view">
      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay message={loadingMessage} showCancel={false} />}

      {/* Header Section */}
      <header className="flex items-start justify-between mb-6" role="banner" aria-label="User detail header">
        <div>
          <h1 id="user-detail-title" className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
            {userDetail?.user.displayName || 'User Details'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive user information and related assets
          </p>
        </div>

        <div className="flex gap-3" role="toolbar" aria-label="User actions">
          <Button
            onClick={refreshData}
            variant="secondary"
            disabled={isLoading}
            title="Refresh user data (Ctrl+R)"
            aria-label="Refresh user data"
            data-cy="refresh-user-detail" data-testid="refresh-user-detail"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Button
            onClick={addToMigrationWave}
            variant="secondary"
            disabled={isLoading || !userDetail}
            title="Add user to migration wave"
            aria-label="Add user to migration wave"
            data-cy="add-to-wave" data-testid="add-to-wave"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add to Wave
          </Button>

          <Button
            onClick={() => exportSnapshot('json')}
            variant="secondary"
            disabled={isLoading || !userDetail}
            title="Export user details (Ctrl+E)"
            aria-label="Export user snapshot"
            data-cy="export-user-detail" data-testid="export-user-detail"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button
            onClick={closeView}
            variant="danger"
            title="Close user details (Ctrl+W)"
            aria-label="Close user detail view"
            data-cy="close-user-detail" data-testid="close-user-detail"
          >
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </div>
      </header>

      {/* User Summary Card - Only show when data is loaded */}
      {userDetail && (
        <ModernCard className="mb-6 p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Column 1: User Information */}
            <div>
              <h3 className="text-base font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
                <span className="mr-2">👤</span>
                User Information
              </h3>
              <div className="space-y-3">
                <LabelValuePair label="Display Name" value={userDetail.user.displayName} />
                <LabelValuePair label="UPN" value={userDetail.user.userPrincipalName} />
                <LabelValuePair label="Email" value={userDetail.user.mail} />
              </div>
            </div>

            {/* Column 2: Organization */}
            <div>
              <h3 className="text-base font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
                <span className="mr-2">🏢</span>
                Organization
              </h3>
              <div className="space-y-3">
                <LabelValuePair label="Department" value={userDetail.user.department || 'N/A'} />
                <LabelValuePair label="Job Title" value={userDetail.user.jobTitle || 'N/A'} />
                <LabelValuePair label="Manager" value={userDetail.managerUpn || 'N/A'} />
              </div>
            </div>

            {/* Column 3: Account Status */}
            <div>
              <h3 className="text-base font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
                <span className="mr-2">📅</span>
                Account Status
              </h3>
              <div className="space-y-3">
                <LabelValuePair
                  label="Status"
                  value={userDetail.user.accountEnabled ? 'Enabled' : 'Disabled'}
                />
                <LabelValuePair label="Created" value={formatDate(userDetail.user.createdDateTime)} />
                <LabelValuePair
                  label="Last Sign-In"
                  value={formatDateTime(userDetail.user.lastSignInDateTime)}
                />
              </div>
            </div>
          </div>
        </ModernCard>
      )}

      {/* 9-Tab Control */}
      {userDetail && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4" role="tablist" aria-label="User detail sections">
            {TAB_CONFIG.map((tab, index) => (
              <button
                key={index}
                role="tab"
                aria-selected={selectedTab === index}
                aria-controls={`tab-panel-${index}`}
                id={`tab-${index}`}
                onClick={() => setSelectedTab(index)}
                className={`
                  px-4 py-3 font-medium text-sm transition-colors
                  ${
                    selectedTab === index
                      ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }
                `}
                data-cy={`user-detail-tab-${tab.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div
            className="flex-1 overflow-auto"
            role="tabpanel"
            id={`tab-panel-${selectedTab}`}
            aria-labelledby={`tab-${selectedTab}`}
          >
            {renderTabContent(selectedTab, userDetail, userId, profileId)}
          </div>
        </div>
      )}

      {/* Status Bar */}
      <footer className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isLoading ? loadingMessage : 'Ready'}
        </p>
      </footer>
    </div>
  );
};

/**
 * Tab configuration
 */
const TAB_CONFIG = [
  { label: 'Overview', icon: '📊' },
  { label: 'Devices', icon: '🖥️' },
  { label: 'Apps', icon: '📱' },
  { label: 'Groups', icon: '👥' },
  { label: 'GPOs', icon: '🛡️' },
  { label: 'File Access', icon: '📁' },
  { label: 'Mailbox', icon: '📧' },
  { label: 'Azure Roles', icon: '☁️' },
  { label: 'SQL & Risks', icon: '⚠️' },
  { label: 'Collaboration', icon: '🤝' },
  { label: 'Why?', icon: '🔍' },
];

/**
 * Render tab content based on selected tab index
 */
function renderTabContent(tabIndex: number, userDetail: UserDetailProjection, userId: string, profileId: string): React.ReactNode {
  switch (tabIndex) {
    case 0:
      return <OverviewTab userDetail={userDetail} />;
    case 1:
      return <DevicesTab devices={userDetail.devices} />;
    case 2:
      return <AppsTab apps={userDetail.apps} />;
    case 3:
      return <GroupsTab groups={userDetail.groups} />;
    case 4:
      return <GposTab gpoLinks={userDetail.gpoLinks} gpoFilters={userDetail.gpoFilters} />;
    case 5:
      return <FileAccessTab fileAccess={userDetail.fileAccess} />;
    case 6:
      return <MailboxTab mailbox={userDetail.mailbox} />;
    case 7:
      return <AzureRolesTab azureRoles={userDetail.azureRoles} />;
    case 8:
      return <SqlRisksTab sqlDatabases={userDetail.sqlDatabases} risks={userDetail.risks} />;
    case 9:
      return <CollaborationTab teams={userDetail.teams || []} sites={userDetail.sharepointSites || []} />;
    case 10:
      return <DecisionTraceTab userId={userId} profileId={profileId} />;
    default:
      return null;
  }
}

// ========================================
// Tab Components
// ========================================

/**
 * Tab 1: Overview
 * Shows resource/services summary counts
 */
const OverviewTab: React.FC<{ userDetail: UserDetailProjection }> = React.memo(({ userDetail }) => (
  <ModernCard className="p-6">
    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
      User Overview Summary
    </h3>
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Resource Summary</h4>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>Groups: {(userDetail.groups ?? []).length}</li>
          <li>Devices: {(userDetail.devices ?? []).length}</li>
          <li>Applications: {userDetail.apps.length}</li>
          <li>File Access Entries: {userDetail.fileAccess.length}</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Services Summary</h4>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>Mapped Drives: {userDetail.drives.length}</li>
          <li>Azure Roles: {userDetail.azureRoles.length}</li>
          <li>SQL Databases: {userDetail.sqlDatabases.length}</li>
          <li>
            Risk Items:{' '}
            <span
              className={
                userDetail.risks.length > 0
                  ? 'text-red-600 dark:text-red-400 font-semibold'
                  : 'text-green-600 dark:text-green-400'
              }
            >
              {userDetail.risks.length}
            </span>
          </li>
        </ul>
      </div>
    </div>

    {/* Migration Hints */}
    {userDetail.migrationHints.length > 0 && (
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Migration Hints</h4>
        <ul className="space-y-2 text-sm">
          {userDetail.migrationHints.slice(0, 3).map((hint, i) => (
            <li key={i} className="text-gray-700 dark:text-gray-300">
              <span
                className={
                  hint.priority === 'High'
                    ? 'text-red-600 dark:text-red-400 font-semibold'
                    : hint.priority === 'Medium'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-blue-600 dark:text-blue-400'
                }
              >
                [{hint.priority}]
              </span>{' '}
              {hint.message}
            </li>
          ))}
        </ul>
      </div>
    )}
  </ModernCard>
));

OverviewTab.displayName = 'OverviewTab';

/**
 * Tab 2: Devices
 */
const DevicesTab: React.FC<{ devices: DeviceData[] }> = React.memo(({ devices }) => {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'name', headerName: 'Device Name', width: 200, sortable: true, filter: true },
      { field: 'dns', headerName: 'DNS Name', width: 200, sortable: true, filter: true },
      { field: 'os', headerName: 'OS', width: 180, sortable: true, filter: true },
      { field: 'ou', headerName: 'OU', width: 200, sortable: true, filter: true },
      {
        field: 'lastSeen',
        headerName: 'Last Seen',
        width: 150,
        sortable: true,
        valueFormatter: (params) => (params.value ? formatDate(params.value) : 'N/A'),
      },
      { field: 'source', headerName: 'Source', width: 100, sortable: true, filter: true },
    ],
    []
  );

  if ((devices ?? []).length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 dark:text-gray-400">This user has no associated devices.</p>
      </div>
    );
  }

  return (
    <VirtualizedDataGrid
      data={devices}
      columns={columnDefs}
      loading={false}
      height="100%"
      data-cy="devices-grid" data-testid="devices-grid"
    />
  );
});

DevicesTab.displayName = 'DevicesTab';

/**
 * Tab 3: Apps
 */
const AppsTab: React.FC<{ apps: ApplicationData[] }> = React.memo(({ apps }) => {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'name', headerName: 'Application Name', width: 250, sortable: true, filter: true },
      { field: 'version', headerName: 'Version', width: 120, sortable: true, filter: true },
      { field: 'publisher', headerName: 'Publisher', width: 200, sortable: true, filter: true },
      { field: 'category', headerName: 'Category', width: 150, sortable: true, filter: true },
      {
        field: 'assignmentType',
        headerName: 'Type',
        width: 140,
        sortable: true,
        filter: true,
        valueFormatter: (params) => {
          switch (params.value) {
            case 'InstalledSoftware': return 'Installed';
            case 'EnterpriseApp': return 'Enterprise App';
            case 'LicenseService': return 'License';
            default: return params.value || 'N/A';
          }
        },
      },
      { field: 'source', headerName: 'Source', width: 100, sortable: true, filter: true },
    ],
    []
  );

  if (apps.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 dark:text-gray-400">No applications discovered for this user.</p>
      </div>
    );
  }

  return (
    <VirtualizedDataGrid data={apps} columns={columnDefs} loading={false} height="100%" data-cy="apps-grid" data-testid="apps-grid" />
  );
});

AppsTab.displayName = 'AppsTab';

/**
 * Tab 4: Groups
 */
const GroupsTab: React.FC<{ groups: GroupData[] }> = React.memo(({ groups }) => {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'name', headerName: 'Group Name', width: 250, sortable: true, filter: true },
      { field: 'groupType', headerName: 'Type', width: 150, sortable: true, filter: true },
      { field: 'scope', headerName: 'Scope', width: 120, sortable: true, filter: true },
      {
        field: 'memberCount',
        headerName: 'Member Count',
        width: 120,
        sortable: true,
        type: 'numericColumn',
      },
      { field: 'source', headerName: 'Source', width: 110, sortable: true, filter: true },
    ],
    []
  );

  if ((groups ?? []).length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 dark:text-gray-400">This user is not a member of any groups.</p>
      </div>
    );
  }

  return (
    <VirtualizedDataGrid
      data={groups}
      columns={columnDefs}
      loading={false}
      height="100%"
      data-cy="groups-grid" data-testid="groups-grid"
    />
  );
});

GroupsTab.displayName = 'GroupsTab';

/**
 * Tab 5: GPOs
 * Split into two sections: GPO Links and GPO Security Filters
 */
const GposTab: React.FC<{ gpoLinks: GpoData[]; gpoFilters: GpoData[] }> = React.memo(
  ({ gpoLinks, gpoFilters }) => {
    const linkColumnDefs = useMemo<ColDef[]>(
      () => [
        { field: 'name', headerName: 'GPO Name', width: 250, sortable: true, filter: true },
        { field: 'guid', headerName: 'GUID', width: 280, sortable: true },
        {
          field: 'enabled',
          headerName: 'Enabled',
          width: 100,
          cellRenderer: (params: ICellRendererParams) => (params.value ? '✓' : '✗'),
        },
      ],
      []
    );

    const filterColumnDefs = useMemo<ColDef[]>(
      () => [
        { field: 'name', headerName: 'GPO Name', width: 250, sortable: true, filter: true },
        { field: 'guid', headerName: 'GUID', width: 280, sortable: true },
        { field: 'wmiFilter', headerName: 'WMI Filter', width: 200, sortable: true },
      ],
      []
    );

    return (
      <div className="h-full flex flex-col gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">GPO Links</h3>
          {gpoLinks.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-600 dark:text-gray-400">No GPO links found.</p>
            </div>
          ) : (
            <VirtualizedDataGrid
              data={gpoLinks}
              columns={linkColumnDefs}
              loading={false}
              height="100%"
              data-cy="gpo-links-grid" data-testid="gpo-links-grid"
            />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
            GPO Security Filters
          </h3>
          {gpoFilters.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-600 dark:text-gray-400">No GPO security filters found.</p>
            </div>
          ) : (
            <VirtualizedDataGrid
              data={gpoFilters}
              columns={filterColumnDefs}
              loading={false}
              height="100%"
              data-cy="gpo-filters-grid" data-testid="gpo-filters-grid"
            />
          )}
        </div>
      </div>
    );
  }
);

GposTab.displayName = 'GposTab';

/**
 * Tab 6: File Access
 */
const FileAccessTab: React.FC<{ fileAccess: FileAccessEntry[] }> = React.memo(({ fileAccess }) => {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'path', headerName: 'Path', width: 350, sortable: true, filter: true },
      { field: 'rights', headerName: 'Rights', width: 150, sortable: true, filter: true },
      {
        field: 'inherited',
        headerName: 'Inherited',
        width: 100,
        cellRenderer: (params: ICellRendererParams) => (params.value ? 'Yes' : 'No'),
      },
      {
        field: 'isShare',
        headerName: 'Share',
        width: 80,
        cellRenderer: (params: ICellRendererParams) => (params.value ? '✓' : '✗'),
      },
      {
        field: 'isNtfs',
        headerName: 'NTFS',
        width: 80,
        cellRenderer: (params: ICellRendererParams) => (params.value ? '✓' : '✗'),
      },
    ],
    []
  );

  if (fileAccess.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 dark:text-gray-400">No file access permissions found.</p>
      </div>
    );
  }

  return (
    <VirtualizedDataGrid
      data={fileAccess}
      columns={columnDefs}
      loading={false}
      height="100%"
      data-cy="file-access-grid" data-testid="file-access-grid"
    />
  );
});

FileAccessTab.displayName = 'FileAccessTab';

/**
 * Tab 7: Mailbox
 */
const MailboxTab: React.FC<{ mailbox: MailboxData | null }> = React.memo(({ mailbox }) => {
  if (!mailbox) {
    return (
      <ModernCard className="p-6">
        <p className="text-gray-600 dark:text-gray-400">No mailbox data available for this user.</p>
      </ModernCard>
    );
  }

  return (
    <ModernCard className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Mailbox Information</h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <LabelValuePair label="Mailbox GUID" value={mailbox.mailboxGuid} />
          <LabelValuePair label="Size (MB)" value={mailbox.sizeMb?.toFixed(2)} />
          <LabelValuePair label="Type" value={mailbox.type} />
        </div>
        <div className="space-y-3">
          <LabelValuePair label="Item Count" value={mailbox.itemCount?.toString()} />
          <LabelValuePair label="Database" value={mailbox.database} />
          <LabelValuePair
            label="Last Logon"
            value={mailbox.lastLogonTime ? formatDateTime(mailbox.lastLogonTime) : 'N/A'}
          />
        </div>
      </div>
    </ModernCard>
  );
});

MailboxTab.displayName = 'MailboxTab';

/**
 * Tab 8: Azure Roles
 */
const AzureRolesTab: React.FC<{ azureRoles: AzureRoleAssignment[] }> = React.memo(({ azureRoles }) => {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'roleName', headerName: 'Role Name', width: 250, sortable: true, filter: true },
      { field: 'scope', headerName: 'Scope', width: 300, sortable: true, filter: true },
      { field: 'principalType', headerName: 'Principal Type', width: 150, sortable: true },
    ],
    []
  );

  if (azureRoles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 dark:text-gray-400">No Azure role assignments found.</p>
      </div>
    );
  }

  return (
    <VirtualizedDataGrid
      data={azureRoles}
      columns={columnDefs}
      loading={false}
      height="100%"
      data-cy="azure-roles-grid" data-testid="azure-roles-grid"
    />
  );
});

AzureRolesTab.displayName = 'AzureRolesTab';

/**
 * Tab 9: SQL & Risks
 * Split into two sections: SQL Databases and Risk Assessment
 */
const SqlRisksTab: React.FC<{ sqlDatabases: SqlDatabaseData[]; risks: RiskItem[] }> = React.memo(
  ({ sqlDatabases, risks }) => {
    const sqlColumnDefs = useMemo<ColDef[]>(
      () => [
        { field: 'server', headerName: 'Server', width: 150, sortable: true, filter: true },
        { field: 'instance', headerName: 'Instance', width: 120, sortable: true },
        { field: 'database', headerName: 'Database', width: 150, sortable: true, filter: true },
        { field: 'role', headerName: 'Role', width: 150, sortable: true },
      ],
      []
    );

    const riskColumnDefs = useMemo<ColDef[]>(
      () => [
        { field: 'type', headerName: 'Risk Type', width: 180, sortable: true, filter: true },
        {
          field: 'severity',
          headerName: 'Severity',
          width: 120,
          sortable: true,
          cellRenderer: (params: ICellRendererParams) => {
            const colors = {
              Critical: 'text-red-700 dark:text-red-400 font-bold',
              High: 'text-red-600 dark:text-red-400',
              Medium: 'text-yellow-600 dark:text-yellow-400',
              Low: 'text-green-600 dark:text-green-400',
            };
            return (
              <span className={colors[params.value as keyof typeof colors] || ''}>
                {params.value}
              </span>
            );
          },
        },
        { field: 'description', headerName: 'Description', width: 350, sortable: true, filter: true },
        { field: 'recommendation', headerName: 'Recommendation', width: 300, sortable: true },
      ],
      []
    );

    return (
      <div className="h-full flex flex-col gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">SQL Databases</h3>
          {sqlDatabases.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-600 dark:text-gray-400">No SQL database access found.</p>
            </div>
          ) : (
            <VirtualizedDataGrid
              data={sqlDatabases}
              columns={sqlColumnDefs}
              loading={false}
              height="100%"
              data-cy="sql-databases-grid" data-testid="sql-databases-grid"
            />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Risk Assessment
          </h3>
          {risks.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-green-600 dark:text-green-400">✓ No risks detected for this user.</p>
            </div>
          ) : (
            <VirtualizedDataGrid
              data={risks}
              columns={riskColumnDefs}
              loading={false}
              height="100%"
              data-cy="risks-grid" data-testid="risks-grid"
            />
          )}
        </div>
      </div>
    );
  }
);

SqlRisksTab.displayName = 'SqlRisksTab';

/**
 * Tab 10: Collaboration (Teams & SharePoint)
 */
const CollaborationTab: React.FC<{ teams: TeamMembership[]; sites: SharePointSiteAccess[] }> = React.memo(
  ({ teams, sites }) => {
    const teamsColumnDefs = useMemo<ColDef[]>(
      () => [
        { field: 'teamName', headerName: 'Team Name', flex: 1, sortable: true, filter: true },
        { field: 'userRole', headerName: 'Role', width: 100, sortable: true, filter: true },
        {
          field: 'channelCount',
          headerName: 'Channels',
          width: 100,
          sortable: true,
          type: 'numericColumn',
        },
      ],
      []
    );

    const sitesColumnDefs = useMemo<ColDef[]>(
      () => [
        { field: 'siteName', headerName: 'Site Name', flex: 1, sortable: true, filter: true },
        { field: 'accessLevel', headerName: 'Access Level', width: 120, sortable: true, filter: true },
        {
          field: 'isOneDrive',
          headerName: 'OneDrive',
          width: 100,
          cellRenderer: (params: ICellRendererParams) => (params.value ? 'Yes' : ''),
        },
        { field: 'source', headerName: 'Source', width: 130, sortable: true, filter: true },
      ],
      []
    );

    return (
      <div className="h-full overflow-auto flex flex-col gap-6 p-4">
        {/* Teams Section */}
        <div>
          <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Microsoft Teams Memberships
          </h3>
          {teams.length === 0 ? (
            <div className="flex items-center justify-center h-24">
              <p className="text-gray-600 dark:text-gray-400">No Microsoft Teams membership found.</p>
            </div>
          ) : (
            <VirtualizedDataGrid
              data={teams}
              columns={teamsColumnDefs}
              loading={false}
              height="300px"
              data-cy="teams-grid"
              data-testid="teams-grid"
            />
          )}
        </div>

        {/* SharePoint Section */}
        <div>
          <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
            SharePoint Sites & OneDrive
          </h3>
          {sites.length === 0 ? (
            <div className="flex items-center justify-center h-24">
              <p className="text-gray-600 dark:text-gray-400">No SharePoint site access found.</p>
            </div>
          ) : (
            <VirtualizedDataGrid
              data={sites}
              columns={sitesColumnDefs}
              loading={false}
              height="300px"
              data-cy="sharepoint-grid"
              data-testid="sharepoint-grid"
            />
          )}
        </div>
      </div>
    );
  }
);

CollaborationTab.displayName = 'CollaborationTab';

/**
 * Tab 11: Decision Timeline (Why?)
 * Shows decision traces for this user entity
 */
const DecisionTraceTab: React.FC<{ userId: string; profileId: string }> = React.memo(({ userId, profileId }) => {
  if (!profileId) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <ModernCard className="p-8 max-w-md text-center">
          <div className="text-4xl mb-4">ℹ️</div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
            No Profile Selected
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Decision traces are only available when a source profile is selected. Please select a profile from the
            sidebar to view decision history for this user.
          </p>
        </ModernCard>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <DecisionWhyPanel entityId={userId} profileId={profileId} />
    </div>
  );
});

DecisionTraceTab.displayName = 'DecisionTraceTab';

// ========================================
// Helper Components & Functions
// ========================================

/**
 * Label-Value pair component for summary card
 */
const LabelValuePair: React.FC<{ label: string; value: string | null | undefined }> = ({ label, value }) => (
  <div className="flex">
    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-32">{label}:</span>
    <span className="text-sm text-gray-900 dark:text-gray-100">{value || 'N/A'}</span>
  </div>
);

/**
 * Date formatting utilities
 */
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default UserDetailView;
