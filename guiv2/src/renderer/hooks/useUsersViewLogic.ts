/**
 * Users View Logic Hook
 * Manages state and logic for the Users view
 *
 * Replicates /gui/ UsersViewModel.cs pattern:
 * - Loads data from LogicEngine on mount
 * - Reloads when profile changes
 * - Auto-refreshes on file changes
 */

import { useState, useEffect, useMemo } from 'react';
import { ColDef } from 'ag-grid-community';
import { UserData } from '../types/models/user';
import { useProfileStore } from '../store/useProfileStore';

export const useUsersViewLogic = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to selected source profile changes
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  // Load users on mount and when profile changes
  useEffect(() => {
    loadUsers();
  }, [selectedSourceProfile]); // Reload when profile changes

  // Subscribe to file change events for auto-refresh
  useEffect(() => {
    const handleDataRefresh = (dataType: string) => {
      if ((dataType === 'Users' || dataType === 'All') && !isLoading) {
        console.log('[UsersView] Auto-refreshing due to file changes');
        loadUsers();
      }
    };

    // TODO: Subscribe to file watcher events when available
    // window.electronAPI.on('filewatcher:dataChanged', handleDataRefresh);

    return () => {
      // TODO: Cleanup subscription
      // window.electronAPI.off('filewatcher:dataChanged', handleDataRefresh);
    };
  }, [isLoading]);

  /**
   * Map UserDto from Logic Engine to UserData for the view
   */
  const mapUserDtoToUserData = (dto: any): UserData => {
    return {
      // Core UserData properties
      id: dto.UPN || dto.Sid,
      name: dto.DisplayName || dto.Sam || 'Unknown',
      displayName: dto.DisplayName || dto.Sam || null,
      userPrincipalName: dto.UPN || null,
      mail: dto.Mail || null,
      email: dto.Mail || null,
      accountEnabled: dto.Enabled !== undefined ? dto.Enabled : true,
      samAccountName: dto.Sam || null,
      department: dto.Dept || null,
      jobTitle: null, // Not available in UserDto
      officeLocation: null, // Not available in UserDto
      companyName: null,
      managerDisplayName: null,
      createdDateTime: dto.DiscoveryTimestamp || null,
      userSource: dto.AzureObjectId ? 'AzureAD' : 'ActiveDirectory',

      // Additional properties
      firstName: null,
      lastName: null,
      groups: dto.Groups?.join(', ') || null,
      manager: dto.Manager || null,
      status: dto.Enabled ? 'active' : 'disabled',

      // Required by TimestampMetadata interface
      createdAt: dto.DiscoveryTimestamp || new Date().toISOString(),
    };
  };

  /**
   * Load users from Logic Engine (CSV data)
   * Replicates /gui/ UsersViewModel.LoadAsync() pattern
   */
  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[UsersView] Loading users from LogicEngine...');

      // Get users from Logic Engine
      const result = await window.electronAPI.invoke('logicEngine:getAllUsers');

      if (!result.success) {
        throw new Error(result.error || 'Failed to load users from LogicEngine');
      }

      if (!Array.isArray(result.data)) {
        throw new Error('Invalid response format from LogicEngine');
      }

      // Map UserDto[] to UserData[]
      const mappedUsers = result.data.map(mapUserDtoToUserData);
      setUsers(mappedUsers);
      setError(null);

      console.log(`[UsersView] Loaded ${mappedUsers.length} users from LogicEngine`);

    } catch (err) {
      console.error('[UsersView] Failed to load users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users from Logic Engine.');
      setUsers([]); // Set empty array instead of mock data
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Filter users based on search text
   */
  const filteredUsers = useMemo(() => {
    if (!searchText) return users;
    const search = searchText.toLowerCase();
    return users.filter(
      (u) =>
        u.displayName?.toLowerCase().includes(search) ||
        u.email?.toLowerCase().includes(search) ||
        u.department?.toLowerCase().includes(search) ||
        u.jobTitle?.toLowerCase().includes(search) ||
        u.userPrincipalName?.toLowerCase().includes(search)
    );
  }, [users, searchText]);

  /**
   * Column definitions for AG Grid
   */
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: 'displayName',
        headerName: 'Display Name',
        sortable: true,
        filter: true,
        minWidth: 150,
        checkboxSelection: true,
        headerCheckboxSelection: true,
      },
      {
        field: 'mail',
        headerName: 'Email',
        sortable: true,
        filter: true,
        minWidth: 200,
      },
      {
        field: 'department',
        headerName: 'Department',
        sortable: true,
        filter: true,
        minWidth: 120,
      },
      {
        field: 'jobTitle',
        headerName: 'Job Title',
        sortable: true,
        filter: true,
        minWidth: 150,
      },
      {
        field: 'officeLocation',
        headerName: 'Location',
        sortable: true,
        filter: true,
        minWidth: 120,
      },
      {
        field: 'accountEnabled',
        headerName: 'Status',
        sortable: true,
        filter: true,
        minWidth: 100,
        cellRenderer: (params: any) => params.value ? 'Enabled' : 'Disabled',
        cellStyle: (params: any) => ({
          color: params.value ? 'green' : 'red',
          fontWeight: 'bold'
        }),
      },
      {
        field: 'userSource',
        headerName: 'Source',
        sortable: true,
        filter: true,
        minWidth: 120,
      },
      {
        field: 'status',
        headerName: 'Account Status',
        sortable: true,
        filter: true,
        minWidth: 100,
      },
    ],
    []
  );

  /**
   * Handle export users to CSV/Excel
   */
  const handleExport = async () => {
    try {
      // Request file save location
      const filePath = await window.electronAPI.showSaveDialog({
        title: 'Export Users',
        defaultPath: `users-export-${new Date().toISOString().split('T')[0]}.csv`,
        filters: [
          { name: 'CSV Files', extensions: ['csv'] },
          { name: 'Excel Files', extensions: ['xlsx'] },
        ],
      });

      if (!filePath) return;

      // Convert users to CSV
      const headers = ['Display Name', 'Email', 'Department', 'Job Title', 'Location', 'Status', 'Source', 'MFA'];
      const rows = filteredUsers.map((u) => [
        u.displayName,
        u.mail,
        u.department || '',
        u.jobTitle || '',
        u.officeLocation || '',
        u.accountEnabled ? 'Enabled' : 'Disabled',
        u.userSource || '',
        u.status || '',
      ]);

      const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

      // Write file
      await window.electronAPI.writeFile(filePath, csv);

      console.log(`Exported ${filteredUsers.length} users to ${filePath}`);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export users. Please try again.');
    }
  };

  /**
   * Handle delete selected users
   */
  const handleDelete = async () => {
    if (!selectedUsers.length) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedUsers.length} user(s)?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      // Execute PowerShell module to delete users
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Management/Remove-Users.psm1',
        functionName: 'Remove-Users',
        parameters: {
          UserIds: selectedUsers.map((u) => u.id),
        },
      });

      if (result.success) {
        // Reload users after deletion
        await loadUsers();
        setSelectedUsers([]);
        console.log(`Deleted ${selectedUsers.length} users successfully`);
      } else {
        throw new Error(result.error || 'Failed to delete users');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle add new user
   * Opens CreateUserDialog modal
   */
  const handleAddUser = () => {
    console.log('[UsersView] Opening add user dialog...');

    // Dynamically import and render CreateUserDialog
    import('../components/dialogs/CreateUserDialog').then(({ CreateUserDialog }) => {
      const { openModal, updateModal } = require('../store/useModalStore').useModalStore.getState();

      const modalId = openModal({
        type: 'custom',
        title: 'Create New User',
        component: CreateUserDialog,
        props: {
          modalId: '', // Will be updated below
          onUserCreated: (user: any) => {
            console.log('[UsersView] User created, reloading users...', user);
            loadUsers(); // Reload users after creation
          },
        },
        dismissable: true,
        size: 'lg',
      });

      // Update modal props with actual modalId
      updateModal(modalId, {
        props: {
          modalId,
          onUserCreated: (user: any) => {
            console.log('[UsersView] User created, reloading users...', user);
            loadUsers();
          },
        },
      });
    });
  };

  return {
    // State
    users: filteredUsers,
    allUsers: users,
    isLoading,
    searchText,
    selectedUsers,
    error,

    // Actions
    setSearchText,
    setSelectedUsers,
    loadUsers,
    handleExport,
    handleDelete,
    handleAddUser,

    // Grid config
    columnDefs,
  };
};
