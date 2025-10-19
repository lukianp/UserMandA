/**
 * Infrastructure View
 * Network infrastructure and server inventory
 */

import React, { useEffect } from 'react';
import { useInfrastructureLogic } from '../../hooks/useInfrastructureLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import SearchBar from '../../components/molecules/SearchBar';
import { Button } from '../../components/atoms/Button';
import { Select } from '../../components/atoms/Select';
import { Download, RefreshCw, Server } from 'lucide-react';
import { ColDef } from 'ag-grid-community';

const InfrastructureView: React.FC = () => {
  const {
    infrastructure,
    isLoading,
    searchText,
    setSearchText,
    selectedItems,
    setSelectedItems,
    filterType,
    setFilterType,
    loadInfrastructure,
    handleExport,
  } = useInfrastructureLogic();

  useEffect(() => {
    loadInfrastructure();
  }, [loadInfrastructure]);

  const columnDefs: ColDef[] = [
    { field: 'name', headerName: 'Name', sortable: true, filter: true, width: 200 },
    { field: 'type', headerName: 'Type', sortable: true, filter: true, width: 120 },
    { field: 'ipAddress', headerName: 'IP Address', sortable: true, filter: true, width: 150 },
    {
      field: 'status',
      headerName: 'Status',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: { value: string }) => {
        const statusColors: Record<string, string> = {
          online: 'text-green-600 bg-green-50',
          offline: 'text-red-600 bg-red-50',
          unknown: 'text-gray-600 bg-gray-50',
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[params.value] || statusColors.unknown}`}>
            {params.value}
          </span>
        );
      },
    },
    { field: 'os', headerName: 'Operating System', sortable: true, filter: true, width: 200 },
    { field: 'lastSeen', headerName: 'Last Seen', sortable: true, filter: true, width: 180 },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="infrastructure-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Infrastructure
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Network infrastructure and server inventory
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={loadInfrastructure}
              loading={isLoading}
              icon={<RefreshCw className="w-4 h-4" />}
              data-cy="refresh-btn"
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={handleExport}
              disabled={infrastructure.length === 0}
              icon={<Download className="w-4 h-4" />}
              data-cy="export-btn"
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchText}
              onChange={setSearchText}
              placeholder="Search by name or IP address..."
              data-cy="infrastructure-search"
            />
          </div>
          <div className="w-48">
            <Select
              value={filterType}
              onChange={(value) => setFilterType(value)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'server', label: 'Servers' },
                { value: 'network', label: 'Network Devices' },
                { value: 'storage', label: 'Storage' },
                { value: 'virtualization', label: 'Virtualization' },
              ]}
              data-cy="type-filter"
            />
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="flex-1 p-6">
        <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <VirtualizedDataGrid
            data={infrastructure}
            columns={columnDefs}
            loading={isLoading}
            onSelectionChange={setSelectedItems}
            enableExport
            data-cy="infrastructure-grid"
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Total items: {infrastructure.length}</span>
          <span>Selected: {(selectedItems?.length ?? 0)}</span>
        </div>
      </div>
    </div>
  );
};

export default InfrastructureView;
