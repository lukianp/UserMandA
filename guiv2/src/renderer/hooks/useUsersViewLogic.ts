/**
 * Users View Logic Hook
 * Manages state and logic for the Users view
 */

import { useState, useEffect, useMemo } from 'react';
import { ColDef } from 'ag-grid-community';
import { UserData } from '../types/models/user';

export const useUsersViewLogic = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * Load users from PowerShell
   */
  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Execute PowerShell module to get users
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/Get-AllUsers.psm1',
        functionName: 'Get-AllUsers',
        parameters: {},
      });

      if (result.success) {
        setUsers(result.data.users || []);
      } else {
        throw new Error(result.error || 'Failed to load users');
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users. Please try again.');

      // Fallback to mock data in development
      if (process.env.NODE_ENV === 'development') {
        const mockUsers: UserData[] = Array.from({ length: 100 }, (_, i) => ({
          id: `user-${i}`,
          objectId: `obj-${i}`,
          displayName: `User ${i + 1}`,
          firstName: `First${i}`,
          lastName: `Last${i}`,
          email: `user${i}@company.com`,
          userPrincipalName: `user${i}@company.com`,
          department: ['IT', 'Sales', 'HR', 'Finance'][i % 4],
          jobTitle: ['Manager', 'Developer', 'Analyst', 'Director'][i % 4],
          officeLocation: ['New York', 'London', 'Tokyo', 'Sydney'][i % 4],
          isEnabled: i % 5 !== 0,
          createdDate: new Date(2020, 0, i + 1).toISOString(),
          lastSignIn: new Date(2024, 9, (i % 30) + 1).toISOString(),
          source: i % 3 === 0 ? 'AzureAD' : 'ActiveDirectory',
          syncStatus:
            i % 10 === 0
              ? { isSynced: false, lastSyncTime: '', syncErrors: ['Error'] }
              : { isSynced: true, lastSyncTime: new Date().toISOString() },
          licenses: i % 2 === 0 ? ['Office 365 E3'] : [],
          groups: [`Group${i % 5}`],
          manager: i > 10 ? `User ${i - 10}` : undefined,
          mfaStatus: i % 3 === 0 ? 'Enabled' : 'Disabled',
          riskLevel: i % 20 === 0 ? 'High' : i % 10 === 0 ? 'Medium' : 'Low',
        }));
        setUsers(mockUsers);
      }
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
        u.displayName.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.department?.toLowerCase().includes(search) ||
        u.jobTitle?.toLowerCase().includes(search) ||
        u.userPrincipalName.toLowerCase().includes(search)
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
        field: 'email',
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
        field: 'isEnabled',
        headerName: 'Status',
        sortable: true,
        filter: true,
        minWidth: 100,
        cellRenderer: (params: { value: boolean }) => {
          return params.value ? (
            <span className="text-green-600 font-medium">Enabled</span>
          ) : (
            <span className="text-red-600 font-medium">Disabled</span>
          );
        },
      },
      {
        field: 'source',
        headerName: 'Source',
        sortable: true,
        filter: true,
        minWidth: 120,
      },
      {
        field: 'mfaStatus',
        headerName: 'MFA',
        sortable: true,
        filter: true,
        minWidth: 100,
      },
      {
        field: 'riskLevel',
        headerName: 'Risk',
        sortable: true,
        filter: true,
        minWidth: 80,
        cellRenderer: (params: { value: string }) => {
          const colors: Record<string, string> = {
            High: 'text-red-600 font-semibold',
            Medium: 'text-yellow-600 font-medium',
            Low: 'text-green-600',
          };
          return <span className={colors[params.value] || ''}>{params.value}</span>;
        },
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
        u.email,
        u.department || '',
        u.jobTitle || '',
        u.officeLocation || '',
        u.isEnabled ? 'Enabled' : 'Disabled',
        u.source,
        u.mfaStatus || '',
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
   */
  const handleAddUser = () => {
    // This would open a modal dialog to create a new user
    console.log('Opening add user dialog...');
    // Implementation would use useModalStore to open CreateUserDialog
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
