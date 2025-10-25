/**
 * Computer Inventory View Component
 * Displays comprehensive computer asset inventory with detailed metrics
 */

import React, { useEffect } from 'react';
import { Download, RefreshCw, Monitor, AlertCircle } from 'lucide-react';

import { useComputerInventoryLogic } from '../../hooks/useComputerInventoryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Select } from '../../components/atoms/Select';

const ComputerInventoryView: React.FC = () => {
  const {
    data,
    columns,
    isLoading,
    error,
    filters,
    filterOptions,
    updateFilter,
    clearFilters,
    loadData,
    exportData,
    stats,
    selectedProfile,
  } = useComputerInventoryLogic();

  useEffect(() => {
    if (selectedProfile) {
      loadData();
    }
  }, [selectedProfile, loadData]);

  const handleExport = async () => {
    const exportResult = await exportData();
    const csvContent = convertToCSV(exportResult.data);
    downloadCSV(csvContent, exportResult.filename);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Computer Inventory
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Comprehensive computer asset tracking and inventory management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={loadData}
              loading={isLoading}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={handleExport}
              disabled={(data?.length ?? 0) === 0}
              icon={<Download className="w-4 h-4" />}
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats?.total ?? 0}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">Online</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {stats?.online ?? 0} <span className="text-sm">({stats?.onlinePercentage ?? 0}%)</span>
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="text-sm text-red-600 dark:text-red-400 font-medium">Offline</div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">{stats?.offline ?? 0}</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
              Updates Needed
            </div>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {stats?.needsUpdates ?? 0}
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
              Low Disk Space
            </div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {stats?.lowDiskSpace ?? 0}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Filtered</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {(data?.length ?? 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search computers..."
            value={filters.searchText}
            onChange={(e) => updateFilter('searchText', e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <Select
            value={filters.osType}
            onChange={(value) => updateFilter('osType', value)}
            options={[
              { value: '', label: 'All OS Types' },
              ...(filterOptions?.osTypes ?? []).map((os) => ({ value: os, label: os }))
            ]}
            className="min-w-[150px]"
          />
          <Select
            value={filters.domain}
            onChange={(value) => updateFilter('domain', value)}
            options={[
              { value: '', label: 'All Domains' },
              ...(filterOptions?.domains ?? []).map((domain) => ({ value: domain, label: domain }))
            ]}
            className="min-w-[150px]"
          />
          <Select
            value={filters.status}
            onChange={(value) => updateFilter('status', value)}
            options={[
              { value: '', label: 'All Statuses' },
              ...(filterOptions?.statuses ?? []).map((status) => ({ value: status, label: status }))
            ]}
            className="min-w-[120px]"
          />
          <Button variant="secondary" onClick={clearFilters} size="sm">
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">Error Loading Data</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Data Grid */}
      <div className="flex-1 px-6 py-4">
        <VirtualizedDataGrid
          data={data}
          columns={columns}
          loading={isLoading}
          onSelectionChange={(selectedRows: any[]) => {
            // Handle selection if needed
          }}
        />
      </div>
    </div>
  );
};

// Helper functions
function convertToCSV(data: any[]): string {
  if ((data?.length ?? 0) === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...(data ?? []).map((row) =>
      headers.map((header) => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    ),
  ];

  return csvRows.join('\n');
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default ComputerInventoryView;
