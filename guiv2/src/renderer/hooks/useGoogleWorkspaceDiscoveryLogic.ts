import { useState, useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';
import { GoogleWorkspaceDiscoveryConfig, GoogleWorkspaceDiscoveryResult, GoogleWorkspaceFilterState } from '../types/models/googleworkspace';

export const useGoogleWorkspaceDiscoveryLogic = () => {
  const [config, setConfig] = useState<Partial<GoogleWorkspaceDiscoveryConfig>>({
    serviceTypes: ['users', 'groups', 'gmail', 'drive'],
    includeUserDetails: true,
    includeGroupMembership: true,
    includeMailboxSize: true,
    includeDriveUsage: true,
    timeout: 300000,
  });
  const [result, setResult] = useState<GoogleWorkspaceDiscoveryResult | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [filter, setFilter] = useState<GoogleWorkspaceFilterState>({
    searchText: '',
    selectedOrgUnits: [],
    selectedStatuses: [],
    selectedServiceTypes: [],
    showOnlyAdmins: false,
  });

  const startDiscovery = async () => {
    setIsDiscovering(true);
    setProgress(0);
    try {
      const discoveryResult = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/GoogleWorkspaceDiscovery.psm1',
        functionName: 'Invoke-GoogleWorkspaceDiscovery',
        parameters: {
          Domain: config.domain,
          AdminEmail: config.adminEmail,
          ServiceAccountKey: config.serviceAccountKeyPath,
          ServiceTypes: config.serviceTypes,
          IncludeMailboxSize: config.includeMailboxSize,
          IncludeDriveUsage: config.includeDriveUsage,
        },
      });
      setResult(discoveryResult.data);
    } catch (error: any) {
      console.error('Google Workspace discovery failed:', error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const cancelDiscovery = () => setIsDiscovering(false);

  const userColumns: ColDef[] = useMemo(() => [
    { field: 'primaryEmail', headerName: 'Email', sortable: true, filter: true, width: 250 },
    { field: 'name.fullName', headerName: 'Name', sortable: true, filter: true, width: 200 },
    { field: 'isAdmin', headerName: 'Admin', sortable: true, filter: true, width: 100 },
    { field: 'suspended', headerName: 'Suspended', sortable: true, filter: true, width: 100 },
    { field: 'orgUnitPath', headerName: 'Org Unit', sortable: true, filter: true, width: 200 },
    { field: 'mailboxSize', headerName: 'Mailbox Size', sortable: true, valueFormatter: (p) => p.value ? `${(p.value / 1024 / 1024).toFixed(2)} MB` : '-', width: 150 },
    { field: 'driveUsage', headerName: 'Drive Usage', sortable: true, valueFormatter: (p) => p.value ? `${(p.value / 1024 / 1024).toFixed(2)} MB` : '-', width: 150 },
  ], []);

  const groupColumns: ColDef[] = useMemo(() => [
    { field: 'email', headerName: 'Email', sortable: true, filter: true, width: 250 },
    { field: 'name', headerName: 'Name', sortable: true, filter: true, width: 200 },
    { field: 'directMembersCount', headerName: 'Members', sortable: true, width: 100 },
    { field: 'settings.allowExternalMembers', headerName: 'External Members', sortable: true, width: 150 },
  ], []);

  const filteredUsers = useMemo(() => {
    if (!result?.users) return [];
    return result.users.filter(u => {
      if (filter.searchText && !u.primaryEmail.toLowerCase().includes(filter.searchText.toLowerCase()) && !u.name.fullName.toLowerCase().includes(filter.searchText.toLowerCase())) return false;
      if (filter.selectedOrgUnits.length && !filter.selectedOrgUnits.includes(u.orgUnitPath)) return false;
      if (filter.showOnlyAdmins && !u.isAdmin) return false;
      return true;
    });
  }, [result, filter]);

  return {
    config,
    setConfig,
    result,
    isDiscovering,
    progress,
    filter,
    setFilter,
    startDiscovery,
    cancelDiscovery,
    userColumns,
    groupColumns,
    filteredUsers,
    stats: result ? {
      totalUsers: result.totalUsersFound,
      activeUsers: result.users.filter(u => !u.suspended).length,
      totalGroups: result.totalGroupsFound,
      totalStorage: result.totalStorageUsed,
      avgStoragePerUser: result.totalStorageUsed / result.totalUsersFound,
    } : null,
  };
};
