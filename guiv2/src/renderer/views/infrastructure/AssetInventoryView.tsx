import React from 'react';
import { useAssetInventoryLogic } from '../../hooks/useAssetInventoryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { RefreshCw, Download, Filter, Search } from 'lucide-react';
import { Column } from '@tanstack/react-table';

/**
 * Asset Inventory View Component
 * Displays comprehensive asset inventory with categorization and lifecycle tracking
 */
const AssetInventoryView: React.FC = () => {
  const {
    assets,
    statistics,
    isLoading,
    error,
    searchText,
    setSearchText,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    refreshData,
    exportAssets,
  } = useAssetInventoryLogic();

  // Column definitions for the data grid
  const columnDefs = [
    {
      accessorKey: 'name',
      header: 'Asset Name',
      size: 200,
      cell: (info: any) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {info.getValue()}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      size: 120,
      cell: (info: any) => {
        const typeColors: Record<string, string> = {
          Workstation: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
          Server: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
          Mobile: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
          Network: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
          Printer: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        };
        const colorClass = typeColors[info.getValue()] || 'bg-gray-100 text-gray-800';
        return (
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${colorClass}`}>
            {info.getValue()}
          </span>
        );
      },
    },
    {
      accessorKey: 'manufacturer',
      header: 'Manufacturer',
      size: 140,
    },
    {
      accessorKey: 'model',
      header: 'Model',
      size: 160,
    },
    {
      accessorKey: 'serialNumber',
      header: 'Serial Number',
      size: 150,
    },
    {
      accessorKey: 'ipAddress',
      header: 'IP Address',
      size: 140,
      cell: (info: any) => (
        <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
          {info.getValue() || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'operatingSystem',
      header: 'Operating System',
      size: 180,
    },
    {
      accessorKey: 'location',
      header: 'Location',
      size: 130,
    },
    {
      accessorKey: 'department',
      header: 'Department',
      size: 130,
    },
    {
      accessorKey: 'assignedUser',
      header: 'Assigned To',
      size: 200,
      cell: (info: any) => (
        <span className="text-gray-700 dark:text-gray-300">
          {info.getValue() || 'Unassigned'}
        </span>
      ),
    },
    {
      accessorKey: 'age',
      header: 'Age (Years)',
      size: 120,
      cell: (info: any) => {
        const age = info.getValue() as number;
        const colorClass = age < 2 ? 'text-green-600 dark:text-green-400' :
                          age < 4 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400';
        return <span className={`font-medium ${colorClass}`}>{age}</span>;
      },
    },
    {
      accessorKey: 'lifecycleStatus',
      header: 'Lifecycle Status',
      size: 150,
      cell: (info: any) => {
        const statusColors: Record<string, string> = {
          'New': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
          'Current': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
          'Aging': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
          'End of Life': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
        const colorClass = statusColors[info.getValue()] || 'bg-gray-100 text-gray-800';
        return (
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${colorClass}`}>
            {info.getValue()}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 120,
      cell: (info: any) => {
        const statusColors: Record<string, string> = {
          Active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
          Inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
          'In Repair': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
          Decommissioned: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
        const colorClass = statusColors[info.getValue()] || 'bg-gray-100 text-gray-800';
        return (
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${colorClass}`}>
            {info.getValue()}
          </span>
        );
      },
    },
  ];

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Asset Inventory
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Complete asset inventory with lifecycle tracking and categorization
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {statistics.totalAssets}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Assets</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {statistics.workstations}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Workstations</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {statistics.servers}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Servers</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {statistics.mobileDevices}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Mobile Devices</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {statistics.activeAssets}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Assets</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {statistics.avgAge.toFixed(1)} yrs
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Age</div>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Types</option>
            <option value="Workstation">Workstation</option>
            <option value="Server">Server</option>
            <option value="Mobile">Mobile</option>
            <option value="Network">Network</option>
            <option value="Printer">Printer</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="In Repair">In Repair</option>
            <option value="Decommissioned">Decommissioned</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button onClick={refreshData} variant="secondary" icon={<RefreshCw size={18} />}>
            Refresh
          </Button>
          <Button onClick={exportAssets} variant="secondary" icon={<Download size={18} />}>
            Export
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Data Grid */}
      <div className="flex-1">
        <VirtualizedDataGrid
          data={assets}
          columns={columnDefs}
          loading={isLoading}
          height="calc(100vh - 480px)"
        />
      </div>
    </div>
  );
};

export default AssetInventoryView;
