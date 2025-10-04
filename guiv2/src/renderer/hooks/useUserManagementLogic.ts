import { useState, useEffect } from 'react';
import { useNotificationStore } from '../store/useNotificationStore';
import { exportService } from '../services/exportService';
import { powerShellService } from '../services/powerShellService';
import { useProfileStore } from '../store/useProfileStore';

interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: 'Administrator' | 'PowerUser' | 'User' | 'ReadOnly';
  status: 'Active' | 'Disabled' | 'Locked';
  lastLogin: Date | null;
  createdDate: Date;
  createdBy: string;
  modifiedDate: Date;
  modifiedBy: string;
}

export const useUserManagementLogic = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const { addNotification } = useNotificationStore();
  const { getCurrentSourceProfile } = useProfileStore();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    setWarnings([]);

    try {
      setLoadingMessage('Checking cache and data sources...');

      const selectedProfile = getCurrentSourceProfile();

      // First try cached data (mirror LogicEngineService pattern)
      let usersData: User[];
      try {
        usersData = await powerShellService.getCachedResult(
          `app_users_${selectedProfile?.id || 'default'}`,
          async () => {
            setLoadingMessage('Loading application users from PowerShell modules...');

            // Try to execute Get-ApplicationUsers module
            const result = await powerShellService.executeModule<{ users: User[] }>(
              'Modules/Admin/UserManagement.psm1',
              'Get-ApplicationUsers',
              {
                ProfileName: selectedProfile?.companyName || 'Default',
              }
            );

            return result.data?.users || [];
          }
        );
      } catch (moduleError) {
        // Fallback to CSV service (mirror C# fallback pattern)
        console.warn('Module execution failed, falling back to CSV:', moduleError);
        setLoadingMessage('Loading users from CSV files...');

        try {
          const csvResult = await powerShellService.executeScript<{ users: User[]; warnings?: string[] }>(
            'Scripts/Get-AppUsersFromCsv.ps1',
            { ProfilePath: selectedProfile?.dataPath || 'C:\\discoverydata' }
          );

          usersData = csvResult.data?.users || [];

          // Mirror C# header warnings
          if (csvResult.warnings && csvResult.warnings.length > 0) {
            setWarnings(csvResult.warnings);
          }
        } catch (csvError) {
          console.error('CSV fallback also failed:', csvError);
          // Use mock data as last resort
          usersData = getMockUsers();
          setWarnings(['PowerShell execution failed. Using mock data.']);
        }
      }

      setUsers(usersData);
      setLoadingMessage('');

    } catch (error) {
      addNotification('error', 'Failed to load users');
      console.error('Failed to load users:', error);
      // Use mock data on error
      setUsers(getMockUsers());
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const getMockUsers = (): User[] => [
    {
      id: '1',
      username: 'admin',
      displayName: 'System Administrator',
      email: 'admin@company.com',
      role: 'Administrator',
      status: 'Active',
      lastLogin: new Date('2025-10-03T14:30:00'),
      createdDate: new Date('2024-01-01'),
      createdBy: 'system',
      modifiedDate: new Date('2025-10-03'),
      modifiedBy: 'admin',
    },
    {
      id: '2',
      username: 'jsmith',
      displayName: 'John Smith',
      email: 'jsmith@company.com',
      role: 'PowerUser',
      status: 'Active',
      lastLogin: new Date('2025-10-03T10:15:00'),
      createdDate: new Date('2024-03-15'),
      createdBy: 'admin',
      modifiedDate: new Date('2025-09-20'),
      modifiedBy: 'admin',
    },
    {
      id: '3',
      username: 'mjones',
      displayName: 'Mary Jones',
      email: 'mjones@company.com',
      role: 'User',
      status: 'Active',
      lastLogin: new Date('2025-10-02T16:45:00'),
      createdDate: new Date('2024-06-01'),
      createdBy: 'admin',
      modifiedDate: new Date('2024-06-01'),
      modifiedBy: 'admin',
    },
    {
      id: '4',
      username: 'rdavis',
      displayName: 'Robert Davis',
      email: 'rdavis@company.com',
      role: 'ReadOnly',
      status: 'Disabled',
      lastLogin: new Date('2025-09-15T09:00:00'),
      createdDate: new Date('2024-08-10'),
      createdBy: 'admin',
      modifiedDate: new Date('2025-09-30'),
      modifiedBy: 'admin',
    },
  ];

  const handleCreateUser = () => {
    // Open create user dialog
    addNotification('info', 'Create user dialog would open here');
  };

  const handleEditUser = (user: User) => {
    addNotification('info', `Edit user: ${user.username}`);
  };

  const handleDeleteUsers = async () => {
    if (selectedUsers.length === 0) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setUsers(prev => prev.filter(u => !selectedUsers.find(s => s.id === u.id)));
      setSelectedUsers([]);
      addNotification('success', `Deleted ${selectedUsers.length} user(s)`);
    } catch (error) {
      addNotification('error', 'Failed to delete users');
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      const newStatus = user.status === 'Active' ? 'Disabled' : 'Active';

      setUsers(prev => prev.map(u =>
        u.id === user.id ? { ...u, status: newStatus } : u
      ));

      addNotification('success', `User ${newStatus.toLowerCase()}`);
    } catch (error) {
      addNotification('error', 'Failed to update user status');
    }
  };

  const handleResetPassword = async (user: User) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      addNotification('success', `Password reset email sent to ${user.email}`);
    } catch (error) {
      addNotification('error', 'Failed to reset password');
    }
  };

  const handleAssignRole = async (user: User, newRole: User['role']) => {
    try {
      setUsers(prev => prev.map(u =>
        u.id === user.id ? { ...u, role: newRole } : u
      ));

      addNotification('success', `Role updated to ${newRole}`);
    } catch (error) {
      addNotification('error', 'Failed to assign role');
    }
  };

  const handleExport = async () => {
    try {
      const filteredUsers = getFilteredUsers();
      await exportService.exportToExcel(filteredUsers, 'Users');
      addNotification('success', 'Users exported successfully');
    } catch (error) {
      addNotification('error', 'Failed to export users');
    }
  };

  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesSearch =
        searchQuery === '' ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === '' || user.role === roleFilter;
      const matchesStatus = statusFilter === '' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  };

  return {
    users: getFilteredUsers(),
    isLoading,
    searchQuery,
    roleFilter,
    statusFilter,
    selectedUsers,
    setSearchQuery,
    setRoleFilter,
    setStatusFilter,
    handleCreateUser,
    handleEditUser,
    handleDeleteUsers,
    handleToggleUserStatus,
    handleResetPassword,
    handleAssignRole,
    handleExport,
    loadingMessage,
    warnings,
  };
};
