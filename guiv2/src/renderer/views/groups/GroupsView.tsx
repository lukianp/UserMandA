/**
 * Groups View
 *
 * Main view for managing Active Directory and Azure AD groups.
 * Features: search, filter, export, delete, view members.
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrag } from 'react-dnd';
import { clsx } from 'clsx';
import { Download, Trash2, RefreshCw, Users, Plus, Eye, GripVertical } from 'lucide-react';
import { useGroupsViewLogic } from '../../hooks/useGroupsViewLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { SearchBar } from '../../components/molecules/SearchBar';
import { FilterPanel, FilterConfig } from '../../components/molecules/FilterPanel';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { GroupType, GroupScope } from '../../types/models/group';
import type { GroupData } from '../../types/models/group';

/**
 * Draggable cell component for drag handle
 */
const DragHandleCell: React.FC<{ data: GroupData }> = ({ data }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'GROUP',
    item: () => ({
      id: data.id || data.objectId || '',
      type: 'GROUP',
      data: data,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={clsx(
        'flex items-center justify-center cursor-move h-full',
        isDragging && 'opacity-50'
      )}
      title="Drag to add to migration wave"
      data-cy="group-drag-handle"
    >
      <GripVertical size={16} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
    </div>
  );
};

/**
 * GroupsView Component
 * Updated for Epic 1 Task 1.4 - Added View Details navigation
 */
export const GroupsView: React.FC = () => {
  const navigate = useNavigate();

  const {
    groups,
    isLoading,
    error,
    searchText,
    setSearchText,
    selectedGroups,
    setSelectedGroups,
    groupTypeFilter,
    setGroupTypeFilter,
    scopeFilter,
    setScopeFilter,
    sourceFilter,
    setSourceFilter,
    columnDefs,
    handleExport,
    handleDelete,
    handleRefresh,
    totalGroups,
    filteredCount,
  } = useGroupsViewLogic();

  // Handler for viewing group details
  const handleViewDetails = (group: GroupData) => {
    navigate(`/groups/${group.id}`);
  };

  // Extended column definitions with drag handle and View Details action
  const extendedColumnDefs = useMemo(
    () => [
      {
        headerName: '',
        width: 50,
        pinned: 'left' as const,
        suppressMenu: true,
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: (params: any) => <DragHandleCell data={params.data} />,
      },
      ...columnDefs,
      {
        headerName: 'Actions',
        width: 150,
        pinned: 'right' as const,
        cellRenderer: (params: any) => (
          <Button
            onClick={() => handleViewDetails(params.data)}
            variant="secondary"
            size="sm"
            data-cy="view-group-details"
          >
            <Eye className="mr-1 h-3 w-3" />
            View Details
          </Button>
        ),
      },
    ],
    [columnDefs]
  );

  // Filter configuration
  const filters: FilterConfig[] = [
    {
      id: 'groupType',
      label: 'Group Type',
      type: 'select',
      value: groupTypeFilter,
      options: [
        { value: 'all', label: 'All Types' },
        { value: GroupType.Security, label: 'Security' },
        { value: GroupType.Distribution, label: 'Distribution' },
        { value: GroupType.MailEnabled, label: 'Mail-Enabled' },
        { value: GroupType.Office365, label: 'Office 365' },
        { value: GroupType.Dynamic, label: 'Dynamic' },
      ],
    },
    {
      id: 'scope',
      label: 'Scope',
      type: 'select',
      value: scopeFilter,
      options: [
        { value: 'all', label: 'All Scopes' },
        { value: GroupScope.Universal, label: 'Universal' },
        { value: GroupScope.Global, label: 'Global' },
        { value: GroupScope.DomainLocal, label: 'Domain Local' },
      ],
    },
    {
      id: 'source',
      label: 'Source',
      type: 'select',
      value: sourceFilter,
      options: [
        { value: 'all', label: 'All Sources' },
        { value: 'ActiveDirectory', label: 'Active Directory' },
        { value: 'AzureAD', label: 'Azure AD' },
        { value: 'Hybrid', label: 'Hybrid' },
      ],
    },
  ];

  const handleFilterChange = (filterId: string, value: any) => {
    switch (filterId) {
      case 'groupType':
        setGroupTypeFilter(value as any);
        break;
      case 'scope':
        setScopeFilter(value as any);
        break;
      case 'source':
        setSourceFilter(value as any);
        break;
    }
  };

  const handleResetFilters = () => {
    setGroupTypeFilter('all');
    setScopeFilter('all');
    setSourceFilter('all');
    setSearchText('');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50" data-cy="groups-view">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage Active Directory and Azure AD groups
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Badge variant="info" size="lg">
              {filteredCount} of {totalGroups} groups
            </Badge>

            <Button
              onClick={handleRefresh}
              variant="secondary"
              size="md"
              icon={<RefreshCw className={clsx('h-4 w-4', { 'animate-spin': isLoading })} />}
              disabled={isLoading}
              data-cy="refresh-btn"
            >
              Refresh
            </Button>

            <Button
              onClick={handleExport}
              variant="secondary"
              size="md"
              icon={<Download className="h-4 w-4" />}
              disabled={isLoading}
              data-cy="export-btn"
            >
              Export
            </Button>

            <Button
              onClick={handleDelete}
              variant="danger"
              size="md"
              icon={<Trash2 className="h-4 w-4" />}
              disabled={selectedGroups.length === 0 || isLoading}
              data-cy="delete-btn"
            >
              Delete ({selectedGroups.length})
            </Button>

            <Button
              onClick={() => alert('Create Group - Coming Soon')}
              variant="primary"
              size="md"
              icon={<Plus className="h-4 w-4" />}
              disabled={isLoading}
              data-cy="create-btn"
            >
              Create Group
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchText}
              onChange={setSearchText}
              placeholder="Search groups by name, email, or description..."
              disabled={isLoading}
              data-cy="group-search"
            />
          </div>
        </div>

        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          title="Advanced Filters"
          defaultCollapsed={true}
          data-cy="group-filters"
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Data Grid */}
      <div className="flex-1 px-6 py-4 overflow-hidden">
        <div className="h-full bg-white rounded-lg border border-gray-200 shadow-sm">
          <VirtualizedDataGrid
            data={groups}
            columns={extendedColumnDefs}
            loading={isLoading}
            onSelectionChange={setSelectedGroups}
            enableExport={true}
            enableGrouping={true}
            enableFiltering={true}
            data-cy="groups-grid"
          />
        </div>
      </div>
    </div>
  );
};

export default GroupsView;
