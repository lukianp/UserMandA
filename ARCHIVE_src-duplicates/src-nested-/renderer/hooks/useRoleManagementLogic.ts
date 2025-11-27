import { useState, useEffect } from 'react';

import { useNotificationStore } from '../store/useNotificationStore';
import exportService from '../services/exportService';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  permissionCount: number;
  userCount: number;
  isBuiltIn: boolean;
  createdDate: Date;
  modifiedDate: Date;
  modifiedBy: string;
}

export const useRoleManagementLogic = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockRoles: Role[] = [
        {
          id: '1',
          name: 'Administrator',
          description: 'Full system access with all permissions',
          permissions: ['*'],
          permissionCount: 50,
          userCount: 3,
          isBuiltIn: true,
          createdDate: new Date('2024-01-01'),
          modifiedDate: new Date('2024-01-01'),
          modifiedBy: 'system',
        },
        {
          id: '2',
          name: 'Power User',
          description: 'Advanced user with most permissions except system administration',
          permissions: ['discovery.*', 'migration.*', 'reports.*'],
          permissionCount: 35,
          userCount: 12,
          isBuiltIn: true,
          createdDate: new Date('2024-01-01'),
          modifiedDate: new Date('2024-01-01'),
          modifiedBy: 'system',
        },
        {
          id: '3',
          name: 'User',
          description: 'Standard user with basic read/write permissions',
          permissions: ['discovery.read', 'reports.read', 'users.read'],
          permissionCount: 15,
          userCount: 45,
          isBuiltIn: true,
          createdDate: new Date('2024-01-01'),
          modifiedDate: new Date('2024-01-01'),
          modifiedBy: 'system',
        },
        {
          id: '4',
          name: 'Read Only',
          description: 'View-only access to all modules',
          permissions: ['*.read'],
          permissionCount: 10,
          userCount: 8,
          isBuiltIn: true,
          createdDate: new Date('2024-01-01'),
          modifiedDate: new Date('2024-01-01'),
          modifiedBy: 'system',
        },
        {
          id: '5',
          name: 'Migration Specialist',
          description: 'Custom role for migration project managers',
          permissions: ['migration.*', 'discovery.read', 'reports.migration'],
          permissionCount: 18,
          userCount: 5,
          isBuiltIn: false,
          createdDate: new Date('2024-06-15'),
          modifiedDate: new Date('2025-09-20'),
          modifiedBy: 'admin',
        },
      ];

      setRoles(mockRoles);
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to load roles', pinned: false, priority: 'normal' });
      console.error('Failed to load roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRole = () => {
    addNotification({ type: 'info', message: 'Create role dialog would open here', pinned: false, priority: 'normal' });
  };

  const handleEditRole = (role: Role) => {
    if (role.isBuiltIn) {
      addNotification({ type: 'warning', message: 'Built-in roles cannot be edited', pinned: false, priority: 'normal' });
      return;
    }
    addNotification({ type: 'info', message: `Edit role: ${role.name}`, pinned: false, priority: 'normal' });
  };

  const handleDeleteRoles = async () => {
    const deletableRoles = selectedRoles.filter(r => !r.isBuiltIn);

    if (deletableRoles.length === 0) {
      addNotification({ type: 'warning', message: 'Cannot delete built-in roles', pinned: false, priority: 'normal' });
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      setRoles(prev => prev.filter(r => !deletableRoles.find(d => d.id === r.id)));
      setSelectedRoles([]);
      addNotification({ type: 'success', message: `Deleted ${deletableRoles.length} role(s)`, pinned: false, priority: 'normal' });
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to delete roles', pinned: false, priority: 'normal' });
    }
  };

  const handleDuplicateRole = async (role: Role) => {
    try {
      const newRole: Role = {
        ...role,
        id: `${Date.now()}`,
        name: `${role.name} (Copy)`,
        userCount: 0,
        isBuiltIn: false,
        createdDate: new Date(),
        modifiedDate: new Date(),
        modifiedBy: 'current-user',
      };

      setRoles(prev => [...prev, newRole]);
      addNotification({ type: 'success', message: `Role duplicated: ${newRole.name}`, pinned: false, priority: 'normal' });
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to duplicate role', pinned: false, priority: 'normal' });
    }
  };

  const handleExport = async () => {
    try {
      const filteredRoles = getFilteredRoles();
      await exportService.exportToExcel(filteredRoles, 'Roles');
      addNotification({ type: 'success', message: 'Roles exported successfully', pinned: false, priority: 'normal' });
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to export roles', pinned: false, priority: 'normal' });
    }
  };

  const getFilteredRoles = () => {
    return roles.filter(role =>
      searchQuery === '' ||
      (role.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (role.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return {
    roles: getFilteredRoles(),
    isLoading,
    searchQuery,
    selectedRoles,
    setSearchQuery,
    handleCreateRole,
    handleEditRole,
    handleDeleteRoles,
    handleDuplicateRole,
    handleExport,
  };
};
