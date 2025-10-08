/**
 * GroupDetailView Component
 *
 * Comprehensive group detail view with 6-tab structure.
 * Replicates ComputerDetailView pattern for groups.
 *
 * Features:
 * - Group summary card with 3-column layout
 * - 6 data correlation tabs (Overview, Members, Owners, Permissions, Applications, Nested Groups)
 * - Action buttons (Refresh, Edit, Add Member, Export, Close)
 * - Loading overlay with progress messages
 * - Full keyboard navigation and accessibility
 *
 * Epic 1 Task 1.4: GroupDetailView Component
 *
 * @param groupId - Group identifier passed via route params
 */

import React, { useEffect, useMemo } from 'react';
import { useGroupDetailLogic } from '../../hooks/useGroupDetailLogic';
import { Button } from '../../components/atoms/Button';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { ModernCard } from '../../components/atoms/ModernCard';
import { RefreshCw, UserPlus, Download, X, Edit, Users } from 'lucide-react';
import { ColDef } from 'ag-grid-community';
import type {
  GroupDetailProjection,
  GroupMemberData,
  GroupOwnerData,
  GroupPermissionData,
  GroupApplicationAccess,
  NestedGroupData,
} from '../../types/models/groupDetail';

export interface GroupDetailViewProps {
  groupId: string;
}

export const GroupDetailView: React.FC<GroupDetailViewProps> = ({ groupId }) => {
  const {
    groupDetail,
    isLoading,
    error,
    loadingMessage,
    selectedTab,
    setSelectedTab,
    refreshData,
    addToMigrationWave,
    exportSnapshot,
    addMember,
    editGroup,
    closeView,
  } = useGroupDetailLogic(groupId);

  // Keyboard shortcuts (Ctrl+R, Ctrl+E, Ctrl+M, Ctrl+W, Ctrl+1-6)
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
            editGroup();
            break;
          case 'm':
            e.preventDefault();
            addMember();
            break;
          case 'x':
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
            e.preventDefault();
            setSelectedTab(parseInt(e.key) - 1);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [refreshData, editGroup, addMember, exportSnapshot, closeView, setSelectedTab]);

  // Render error state
  if (error && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <ModernCard className="p-8 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Error Loading Group Details
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
    <div className="relative h-full flex flex-col p-6" data-cy="group-detail-view">
      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay message={loadingMessage} />}

      {/* Header Section */}
      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <span>👥</span>
            {groupDetail?.group.name || 'Group Details'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive group information and member assignments
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={refreshData}
            variant="secondary"
            disabled={isLoading}
            title="Refresh group data (Ctrl+R)"
            data-cy="refresh-group-detail"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Button
            onClick={editGroup}
            variant="secondary"
            disabled={isLoading || !groupDetail}
            title="Edit group (Ctrl+E)"
            data-cy="edit-group"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>

          <Button
            onClick={addMember}
            variant="secondary"
            disabled={isLoading || !groupDetail}
            title="Add member (Ctrl+M)"
            data-cy="add-member"
          >
            <Users className="mr-2 h-4 w-4" />
            Add Member
          </Button>

          <Button
            onClick={addToMigrationWave}
            variant="secondary"
            disabled={isLoading || !groupDetail}
            title="Add group to migration wave"
            data-cy="add-to-wave"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add to Wave
          </Button>

          <Button
            onClick={() => exportSnapshot('json')}
            variant="secondary"
            disabled={isLoading || !groupDetail}
            title="Export group details (Ctrl+X)"
            data-cy="export-group-detail"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button
            onClick={closeView}
            variant="danger"
            title="Close group details (Ctrl+W)"
            data-cy="close-group-detail"
          >
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </div>
      </header>

      {/* Group Summary Card */}
      {groupDetail && (
        <ModernCard className="mb-6 p-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h3 className="text-base font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
                <span className="mr-2">🏷️</span>
                Group Information
              </h3>
              <div className="space-y-3">
                <LabelValuePair label="Group Name" value={groupDetail.group.name} />
                <LabelValuePair label="Display Name" value={groupDetail.group.displayName} />
                <LabelValuePair label="Email" value={groupDetail.group.email} />
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
                <span className="mr-2">📋</span>
                Group Properties
              </h3>
              <div className="space-y-3">
                <LabelValuePair label="Type" value={groupDetail.group.groupType} />
                <LabelValuePair label="Scope" value={groupDetail.group.scope} />
                <LabelValuePair label="Membership Type" value={groupDetail.group.membershipType} />
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
                <span className="mr-2">📊</span>
                Statistics
              </h3>
              <div className="space-y-3">
                <LabelValuePair label="Members" value={groupDetail.overview.memberCount.toString()} />
                <LabelValuePair label="Owners" value={groupDetail.overview.ownerCount.toString()} />
                <LabelValuePair label="Created" value={formatDate(groupDetail.overview.createdDate)} />
              </div>
            </div>
          </div>
        </ModernCard>
      )}

      {/* 6-Tab Control */}
      {groupDetail && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            {TAB_CONFIG.map((tab, index) => (
              <button
                key={index}
                onClick={() => setSelectedTab(index)}
                className={`
                  px-4 py-3 font-medium text-sm transition-colors
                  ${
                    selectedTab === index
                      ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }
                `}
                data-cy={`group-detail-tab-${tab.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto">{renderTabContent(selectedTab, groupDetail)}</div>
        </div>
      )}

      {/* Status Bar */}
      <footer className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">{isLoading ? loadingMessage : 'Ready'}</p>
      </footer>
    </div>
  );
};

const TAB_CONFIG = [
  { label: 'Overview', icon: '📊' },
  { label: 'Members', icon: '👤' },
  { label: 'Owners', icon: '👑' },
  { label: 'Permissions', icon: '🔐' },
  { label: 'Applications', icon: '📱' },
  { label: 'Nested Groups', icon: '🔗' },
];

function renderTabContent(tabIndex: number, groupDetail: GroupDetailProjection): React.ReactNode {
  switch (tabIndex) {
    case 0:
      return <OverviewTab groupDetail={groupDetail} />;
    case 1:
      return <MembersTab members={groupDetail.members} />;
    case 2:
      return <OwnersTab owners={groupDetail.owners} />;
    case 3:
      return <PermissionsTab permissions={groupDetail.permissions} />;
    case 4:
      return <ApplicationsTab applications={groupDetail.applications} />;
    case 5:
      return <NestedGroupsTab nestedGroups={groupDetail.nestedGroups} />;
    default:
      return null;
  }
}

// ===== Tab Components =====

const OverviewTab: React.FC<{ groupDetail: GroupDetailProjection }> = React.memo(({ groupDetail }) => (
  <ModernCard className="p-6">
    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Group Overview Summary</h3>
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Membership Summary</h4>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>Total Members: {groupDetail.overview.memberCount}</li>
          <li>Direct Members: {groupDetail.directMembers.length}</li>
          <li>All Members (incl. nested): {groupDetail.allMembers.length}</li>
          <li>Owners: {groupDetail.overview.ownerCount}</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Access & Configuration</h4>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>Permissions Assigned: {groupDetail.overview.permissionCount}</li>
          <li>Application Access: {groupDetail.overview.applicationCount}</li>
          <li>Nested Groups: {groupDetail.overview.nestedGroupCount}</li>
          <li>
            Sync Status:{' '}
            <span
              className={
                groupDetail.syncStatus?.isSynced
                  ? 'text-green-600 dark:text-green-400 font-semibold'
                  : 'text-red-600 dark:text-red-400 font-semibold'
              }
            >
              {groupDetail.syncStatus?.isSynced ? 'Synced' : 'Not Synced'}
            </span>
          </li>
        </ul>
      </div>
    </div>

    {/* Group Details */}
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Additional Information</h4>
      <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
        <LabelValuePair label="Description" value={groupDetail.overview.description} />
        <LabelValuePair label="Notes" value={groupDetail.overview.notes} />
        <LabelValuePair label="Hybrid Group" value={groupDetail.overview.isHybrid ? 'Yes' : 'No'} />
        <LabelValuePair label="Dynamic Group" value={groupDetail.overview.isDynamic ? 'Yes' : 'No'} />
        {groupDetail.overview.isDynamic && (
          <LabelValuePair label="Membership Rule" value={groupDetail.overview.dynamicMembershipRule} />
        )}
      </div>
    </div>

    {/* Migration Hints */}
    {groupDetail.migrationHints.length > 0 && (
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Migration Hints</h4>
        <ul className="space-y-2 text-sm">
          {groupDetail.migrationHints.slice(0, 3).map((hint, i) => (
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

const MembersTab: React.FC<{ members: GroupMemberData[] }> = React.memo(({ members }) => {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'displayName', headerName: 'Display Name', width: 200, sortable: true, filter: true },
      { field: 'userPrincipalName', headerName: 'UPN', width: 250, sortable: true, filter: true },
      { field: 'memberType', headerName: 'Type', width: 120, sortable: true, filter: true },
      { field: 'membershipSource', headerName: 'Source', width: 150, sortable: true },
      {
        field: 'isDirectMember',
        headerName: 'Direct',
        width: 100,
        cellRenderer: (params: any) => (params.value ? '✓' : ''),
      },
      {
        field: 'addedDate',
        headerName: 'Added',
        width: 150,
        sortable: true,
        valueFormatter: (params) => (params.value ? formatDate(params.value) : 'N/A'),
      },
    ],
    []
  );

  if (members.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 dark:text-gray-400">This group has no members.</p>
      </div>
    );
  }

  return <VirtualizedDataGrid data={members} columns={columnDefs} loading={false} height="100%" />;
});

const OwnersTab: React.FC<{ owners: GroupOwnerData[] }> = React.memo(({ owners }) => {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'displayName', headerName: 'Display Name', width: 200, sortable: true, filter: true },
      { field: 'userPrincipalName', headerName: 'UPN', width: 250, sortable: true, filter: true },
      { field: 'ownerType', headerName: 'Type', width: 120, sortable: true },
      {
        field: 'isPrimaryOwner',
        headerName: 'Primary',
        width: 100,
        cellRenderer: (params: any) => (params.value ? '✓' : ''),
      },
      {
        field: 'assignedDate',
        headerName: 'Assigned',
        width: 150,
        sortable: true,
        valueFormatter: (params) => (params.value ? formatDate(params.value) : 'N/A'),
      },
    ],
    []
  );

  if (owners.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 dark:text-gray-400">This group has no owners.</p>
      </div>
    );
  }

  return <VirtualizedDataGrid data={owners} columns={columnDefs} loading={false} height="100%" />;
});

const PermissionsTab: React.FC<{ permissions: GroupPermissionData[] }> = React.memo(({ permissions }) => {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'resourceName', headerName: 'Resource', width: 250, sortable: true, filter: true },
      { field: 'resourceType', headerName: 'Type', width: 150, sortable: true, filter: true },
      { field: 'accessLevel', headerName: 'Access Level', width: 150, sortable: true },
      { field: 'permissionType', headerName: 'Permission Type', width: 150, sortable: true },
      {
        field: 'isInherited',
        headerName: 'Inherited',
        width: 100,
        cellRenderer: (params: any) => (params.value ? 'Yes' : 'No'),
      },
      {
        field: 'grantedDate',
        headerName: 'Granted',
        width: 150,
        valueFormatter: (params) => (params.value ? formatDate(params.value) : 'N/A'),
      },
    ],
    []
  );

  if (permissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 dark:text-gray-400">No permissions assigned to this group.</p>
      </div>
    );
  }

  return (
    <VirtualizedDataGrid data={permissions} columns={columnDefs} loading={false} height="100%" />
  );
});

const ApplicationsTab: React.FC<{ applications: GroupApplicationAccess[] }> = React.memo(({ applications }) => {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'applicationName', headerName: 'Application', width: 250, sortable: true, filter: true },
      { field: 'applicationId', headerName: 'App ID', width: 200, sortable: true },
      { field: 'roleName', headerName: 'Role', width: 180, sortable: true, filter: true },
      { field: 'accessType', headerName: 'Access Type', width: 150, sortable: true },
      {
        field: 'isConditional',
        headerName: 'Conditional',
        width: 120,
        cellRenderer: (params: any) => (params.value ? 'Yes' : 'No'),
      },
      {
        field: 'grantedDate',
        headerName: 'Granted',
        width: 150,
        valueFormatter: (params) => (params.value ? formatDate(params.value) : 'N/A'),
      },
    ],
    []
  );

  if (applications.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 dark:text-gray-400">No application access configured for this group.</p>
      </div>
    );
  }

  return (
    <VirtualizedDataGrid data={applications} columns={columnDefs} loading={false} height="100%" />
  );
});

const NestedGroupsTab: React.FC<{ nestedGroups: NestedGroupData[] }> = React.memo(({ nestedGroups }) => {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'groupName', headerName: 'Group Name', width: 250, sortable: true, filter: true },
      { field: 'groupType', headerName: 'Type', width: 150, sortable: true, filter: true },
      { field: 'relationship', headerName: 'Relationship', width: 150, sortable: true, filter: true },
      { field: 'nestingLevel', headerName: 'Level', width: 100, sortable: true, type: 'numericColumn' },
      { field: 'memberCount', headerName: 'Members', width: 100, sortable: true, type: 'numericColumn' },
      {
        field: 'isCircular',
        headerName: 'Circular',
        width: 100,
        cellRenderer: (params: any) =>
          params.value ? <span className="text-red-600 dark:text-red-400 font-semibold">⚠️ Yes</span> : 'No',
      },
    ],
    []
  );

  if (nestedGroups.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 dark:text-gray-400">No nested group relationships found.</p>
      </div>
    );
  }

  return (
    <VirtualizedDataGrid data={nestedGroups} columns={columnDefs} loading={false} height="100%" />
  );
});

// ===== Helper Components =====

const LabelValuePair: React.FC<{ label: string; value: string | null | undefined | React.ReactNode }> = ({ label, value }) => (
  <div className="flex">
    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-40">{label}:</span>
    <span className="text-sm text-gray-900 dark:text-gray-100">{value || 'N/A'}</span>
  </div>
);

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export default GroupDetailView;
