/**
 * UsersView Component
 *
 * User management view with data grid and actions
 */

import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrag } from 'react-dnd';
import { Download, Trash, UserPlus, RefreshCw, Eye, GripVertical } from 'lucide-react';
import { ColDef } from 'ag-grid-community';
import { clsx } from 'clsx';

import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { UserData } from '../../types/models/user';
import { useUsersViewLogic } from '../../hooks/useUsersViewLogic';

/**
 * Draggable cell component for drag handle
 */
const DragHandleCell: React.FC<{ data: UserData }> = ({ data }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'USER',
    item: () => ({
      id: data.userPrincipalName || data.id || data.email || '',
      type: 'USER',
      data: data,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag as any}
      className={clsx(
        'flex items-center justify-center cursor-move h-full',
        isDragging && 'opacity-50'
      )}
      title="Drag to add to migration wave"
      data-cy="user-drag-handle" data-testid="user-drag-handle"
    >
      <GripVertical size={16} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
    </div>
  );
};

/**
 * Users management view
 */
const UsersView: React.FC = () => {
  const navigate = useNavigate();

  // Use the users view logic hook (loads data from Logic Engine CSV)
  const {
    users,
    isLoading,
    searchText,
    setSearchText,
    selectedUsers,
    setSelectedUsers,
    loadUsers,
    handleExport,
    handleDelete,
    handleAddUser,
    error,
    columnDefs,
  } = useUsersViewLogic();

  // Handle view details
  const handleViewDetails = useCallback((user: UserData) => {
    const userId = user.userPrincipalName || user.id || user.email || '';
    // Navigate to user detail view
    navigate(`/users/${encodeURIComponent(userId)}`);
  }, [navigate]);

  return (
    <div className="min-h-full flex flex-col p-6" data-cy="users-view" data-testid="users-view">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage user accounts across Active Directory and Azure AD
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search users..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
            data-cy="user-search" data-testid="user-search"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {(users ?? []).length} users
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => loadUsers()}
            variant="secondary"
            icon={<RefreshCw size={18} />}
            loading={isLoading}
            data-cy="refresh-users" data-testid="refresh-users"
          >
            Refresh
          </Button>
          <Button
            onClick={handleAddUser}
            variant="primary"
            icon={<UserPlus size={18} />}
            data-cy="add-user" data-testid="add-user"
          >
            Add User
          </Button>
          <Button
            onClick={handleExport}
            variant="secondary"
            icon={<Download size={18} />}
            data-cy="export-users" data-testid="export-users"
          >
            Export
          </Button>
          <Button
            onClick={handleDelete}
            variant="danger"
            icon={<Trash size={18} />}
            disabled={selectedUsers.length === 0}
            data-cy="delete-users" data-testid="delete-users"
          >
            Delete ({selectedUsers.length})
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400" role="alert">
          {error}
        </div>
      )}

      {/* Data Grid */}
      <div className="flex-1">
        <VirtualizedDataGrid
          data={users}
          columns={columnDefs}
          loading={isLoading}
          onSelectionChange={setSelectedUsers}
          enablePrint
          height="calc(100vh - 320px)"
        />
      </div>
    </div>
  );
};

export default UsersView;

