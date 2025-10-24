import React from 'react';
import { UserPlus, Trash2, Edit2, Shield, Lock, Unlock } from 'lucide-react';

import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';
import { Badge } from '../../components/atoms/Badge';
import { useUserManagementLogic } from '../../hooks/useUserManagementLogic';

export const UserManagementView: React.FC = () => {
  const {
    users,
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
  } = useUserManagementLogic();

  const columns = [
    {
      field: 'username',
      headerName: 'Username',
      sortable: true,
      filter: 'agTextColumnFilter',
      flex: 1,
    },
    {
      field: 'displayName',
      headerName: 'Display Name',
      sortable: true,
      filter: 'agTextColumnFilter',
      flex: 1,
    },
    {
      field: 'email',
      headerName: 'Email',
      sortable: true,
      filter: 'agTextColumnFilter',
      flex: 1,
    },
    {
      field: 'role',
      headerName: 'Role',
      sortable: true,
      filter: 'agSetColumnFilter',
      cellRenderer: (params: any) => (
        <Badge variant={params.value === 'Administrator' ? 'danger' : params.value === 'PowerUser' ? 'warning' : 'info'}>
          {params.value}
        </Badge>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      sortable: true,
      filter: 'agSetColumnFilter',
      cellRenderer: (params: any) => (
        <Badge variant={params.value === 'Active' ? 'success' : 'default'}>
          {params.value}
        </Badge>
      ),
    },
    {
      field: 'lastLogin',
      headerName: 'Last Login',
      sortable: true,
      filter: 'agDateColumnFilter',
      valueFormatter: (params: any) =>
        params.value ? new Date(params.value).toLocaleString() : 'Never',
    },
    {
      field: 'createdDate',
      headerName: 'Created',
      sortable: true,
      filter: 'agDateColumnFilter',
      valueFormatter: (params: any) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={<Edit2 />}
            onClick={() => handleEditUser(params.data)}
            aria-label="Edit user"
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant={params.data.status === 'Active' ? 'secondary' : 'primary'}
            icon={params.data.status === 'Active' ? <Lock /> : <Unlock />}
            onClick={() => handleToggleUserStatus(params.data)}
            aria-label={params.data.status === 'Active' ? 'Disable user' : 'Enable user'}
          >
            {params.data.status === 'Active' ? 'Disable' : 'Enable'}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<Shield />}
            onClick={() => handleResetPassword(params.data)}
            aria-label="Reset password"
          >
            Reset
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage application users, roles, and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            icon={<UserPlus />}
            onClick={handleCreateUser}
          >
            Create User
          </Button>
          <Button
            variant="danger"
            icon={<Trash2 />}
            onClick={handleDeleteUsers}
            disabled={selectedUsers.length === 0}
          >
            Delete Selected ({selectedUsers.length})
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Input
            label="Search Users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username, email, or name..."
          />
        </div>
        <div className="w-48">
          <Select
            label="Role"
            value={roleFilter}
            onChange={(value) => setRoleFilter(value)}
            options={[
              { value: "", label: "All Roles" },
              { value: "Administrator", label: "Administrator" },
              { value: "PowerUser", label: "Power User" },
              { value: "User", label: "User" },
              { value: "ReadOnly", label: "Read Only" },
            ]}
          />
        </div>
        <div className="w-48">
          <Select
            label="Status"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { value: "", label: "All Statuses" },
              { value: "Active", label: "Active" },
              { value: "Disabled", label: "Disabled" },
              { value: "Locked", label: "Locked" },
            ]}
          />
        </div>
        <Button variant="secondary" onClick={handleExport}>
          Export
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-600 dark:text-blue-400">Total Users</div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{(users ?? []).length}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-sm text-green-600 dark:text-green-400">Active</div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {(users ?? []).filter(u => u.status === 'Active').length}
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="text-sm text-yellow-600 dark:text-yellow-400">Administrators</div>
          <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
            {(users ?? []).filter(u => u.role === 'Administrator').length}
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-sm text-red-600 dark:text-red-400">Disabled</div>
          <div className="text-2xl font-bold text-red-900 dark:text-red-100">
            {(users ?? []).filter(u => u.status === 'Disabled').length}
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="flex-1">
        <VirtualizedDataGrid
          data={users}
          columns={columns}
          loading={isLoading}
        />
      </div>
    </div>
  );
};


export default UserManagementView;
