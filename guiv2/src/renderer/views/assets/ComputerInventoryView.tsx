/**
 * Computer Inventory View
 * Displays computer inventory with OS, hardware, and status information
 */

import React from 'react';
import { useComputerInventoryLogic } from '../../hooks/useComputerInventoryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Select from '../../components/atoms/Select';
import { Monitor, RefreshCw, Download, Eye, Filter, X } from 'lucide-react';

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
    selectedComputers,
    setSelectedComputers,
    loadData,
    exportData,
    viewDetails,
    stats,
    selectedProfile,
  } = useComputerInventoryLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="computer-inventory-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Computer Inventory</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View and manage computer assets across your environment
              </p>
            </div>
          </div>
          {selectedProfile && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Profile: <span className="font-semibold">{selectedProfile.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Computers</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">Online</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {stats.online}
              <span className="text-sm ml-2 text-green-600 dark:text-green-400">
                ({stats.onlinePercentage}%)
              </span>
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="text-sm text-red-600 dark:text-red-400 font-medium">Offline</div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.offline}</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">Needs Updates</div>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {stats.needsUpdates}
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Low Disk</div>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
              {stats.lowDiskSpace}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
          {(filters.osType || filters.domain || filters.ou || filters.status || filters.searchText) && (
            <Button
              variant="ghost"
              size="sm"
              icon={<X className="w-4 h-4" />}
              onClick={clearFilters}
              data-cy="clear-filters-btn"
            >
              Clear All
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input
            placeholder="Search name, IP, serial..."
            value={filters.searchText}
            onChange={(e) => updateFilter('searchText', e.target.value)}
            data-cy="search-input"
          />
          <Select
            value={filters.osType}
            onChange={(e) => updateFilter('osType', e.target.value)}
            data-cy="os-type-select"
          >
            <option value="">All OS Types</option>
            {filterOptions.osTypes.map((os) => (
              <option key={os} value={os}>
                {os}
              </option>
            ))}
          </Select>
          <Select
            value={filters.domain}
            onChange={(e) => updateFilter('domain', e.target.value)}
            data-cy="domain-select"
          >
            <option value="">All Domains</option>
            {filterOptions.domains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </Select>
          <Select
            value={filters.ou}
            onChange={(e) => updateFilter('ou', e.target.value)}
            data-cy="ou-select"
          >
            <option value="">All OUs</option>
            {filterOptions.ous.map((ou) => (
              <option key={ou} value={ou}>
                {ou}
              </option>
            ))}
          </Select>
          <Select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            data-cy="status-select"
          >
            <option value="">All Statuses</option>
            {filterOptions.statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={loadData}
              loading={isLoading}
              data-cy="refresh-btn"
            >
              Refresh
            </Button>
            {selectedComputers.length > 0 && (
              <Button
                variant="secondary"
                icon={<Eye className="w-4 h-4" />}
                onClick={() => selectedComputers[0] && viewDetails(selectedComputers[0])}
                data-cy="view-details-btn"
              >
                View Details ({selectedComputers.length})
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
              onClick={exportData}
              disabled={data.length === 0}
              data-cy="export-btn"
            >
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Data Grid */}
      <div className="flex-1 overflow-hidden p-6">
        <VirtualizedDataGrid
          data={data}
          columns={columns}
          loading={isLoading}
          enableSelection={true}
          selectionMode="multiple"
          onSelectionChange={setSelectedComputers}
          enableExport={true}
          enableFiltering={true}
          height="calc(100vh - 450px)"
          data-cy="computer-inventory-grid"
        />
      </div>
    </div>
  );
};

export default ComputerInventoryView;
