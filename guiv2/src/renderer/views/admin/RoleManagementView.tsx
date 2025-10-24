import React from 'react';
import { Shield, Plus, Trash2, Edit2, Users } from 'lucide-react';

import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Badge } from '../../components/atoms/Badge';
import { useRoleManagementLogic } from '../../hooks/useRoleManagementLogic';

export const RoleManagementView: React.FC = () => {
  const {
    roles,
    isLoading,
    searchQuery,
    selectedRoles,
    setSearchQuery,
    handleCreateRole,
    handleEditRole,
    handleDeleteRoles,
    handleDuplicateRole,
    handleExport,
  } = useRoleManagementLogic();

  const columns = [
    {
      field: 'name',
      headerName: 'Role Name',
      sortable: true,
      filter: 'agTextColumnFilter',
      flex: 1,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-500" />
          <span className="font-medium">{params.value}</span>
        </div>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      sortable: true,
      filter: 'agTextColumnFilter',
      flex: 2,
    },
    {
      field: 'userCount',
      headerName: 'Users',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 120,
      cellRenderer: (params: any) => (
        <Badge variant="info">
          <Users className="w-3 h-3 mr-1" />
          {params.value}
        </Badge>
      ),
    },
    {
      field: 'permissionCount',
      headerName: 'Permissions',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 140,
    },
    {
      field: 'isBuiltIn',
      headerName: 'Type',
      sortable: true,
      filter: 'agSetColumnFilter',
      width: 120,
      cellRenderer: (params: any) => (
        <Badge variant={params.value ? 'default' : 'info'}>
          {params.value ? 'Built-in' : 'Custom'}
        </Badge>
      ),
    },
    {
      field: 'modifiedDate',
      headerName: 'Last Modified',
      sortable: true,
      filter: 'agDateColumnFilter',
      valueFormatter: (params: any) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filter: false,
      width: 200,
      cellRenderer: (params: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={<Edit2 />}
            onClick={() => handleEditRole(params.data)}
            disabled={params.data.isBuiltIn}
            aria-label="Edit role"
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleDuplicateRole(params.data)}
            aria-label="Duplicate role"
          >
            Duplicate
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Role Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Define and manage security roles and their permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" icon={<Plus />} onClick={handleCreateRole}>
            Create Role
          </Button>
          <Button
            variant="danger"
            icon={<Trash2 />}
            onClick={handleDeleteRoles}
            disabled={selectedRoles.length === 0 || selectedRoles.some(r => r.isBuiltIn)}
          >
            Delete Selected ({selectedRoles.length})
          </Button>
        </div>
      </div>

      {/* Search and Export */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            label="Search Roles"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or description..."
          />
        </div>
        <Button variant="secondary" onClick={handleExport} className="self-end">
          Export
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-600 dark:text-blue-400">Total Roles</div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{(roles ?? []).length}</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="text-sm text-purple-600 dark:text-purple-400">Built-in Roles</div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {(roles ?? []).filter(r => r.isBuiltIn).length}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-sm text-green-600 dark:text-green-400">Custom Roles</div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {(roles ?? []).filter(r => !r.isBuiltIn).length}
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="text-sm text-yellow-600 dark:text-yellow-400">Total Users Assigned</div>
          <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
            {roles.reduce((sum, r) => sum + r.userCount, 0)}
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="flex-1">
        <VirtualizedDataGrid
          data={roles}
          columns={columns}
          loading={isLoading}
        />
      </div>
    </div>
  );
};


export default RoleManagementView;
