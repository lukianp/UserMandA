/**
 * Network Device Inventory View
 * Displays network device inventory with type, vendor, and connectivity information
 */

import React from 'react';
import { Network, RefreshCw, Download, Eye, Filter, X, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

import { useNetworkDeviceInventoryLogic } from '../../hooks/useNetworkDeviceInventoryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

const NetworkDeviceInventoryView: React.FC = () => {
  const {
    data,
    columns,
    isLoading,
    error,
    filters,
    filterOptions,
    updateFilter,
    clearFilters,
    selectedDevices,
    setSelectedDevices,
    loadData,
    exportData,
    pingTest,
    viewConfiguration,
    stats,
    typeDistribution,
    selectedProfile,
  } = useNetworkDeviceInventoryLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="network-device-inventory-view" data-testid="network-device-inventory-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Network className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Network Device Inventory</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage network infrastructure devices and connectivity
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

      {/* Statistics & Chart */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4">
              <div className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">Total Devices</div>
              <div className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">{stats?.total ?? 0}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">Online</div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {stats?.online ?? 0}
                <span className="text-sm ml-2 text-green-600 dark:text-green-400">
                  ({stats?.onlinePercentage ?? 0}%)
                </span>
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="text-sm text-red-600 dark:text-red-400 font-medium">Offline</div>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">{stats?.offline ?? 0}</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Warranty Expiring</div>
              <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {stats?.warrantyExpiring ?? 0}
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">Warranty Expired</div>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {stats?.warrantyExpired ?? 0}
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">High Utilization</div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {stats?.highUtilization ?? 0}
              </div>
            </div>
          </div>

          {/* Device Type Distribution Chart */}
          {typeDistribution?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Device Type Distribution
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.type}: ${entry.count}`}
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
          {(filters.deviceType || filters.vendor || filters.status || filters.location || filters.searchText) && (
            <Button
              variant="ghost"
              size="sm"
              icon={<X className="w-4 h-4" />}
              onClick={clearFilters}
              data-cy="clear-filters-btn" data-testid="clear-filters-btn"
            >
              Clear All
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input
            placeholder="Search name, IP, MAC..."
            value={filters.searchText}
            onChange={(e) => updateFilter('searchText', e.target.value)}
            data-cy="search-input" data-testid="search-input"
          />
          <Select
            value={filters.deviceType}
            onChange={(value) => updateFilter('deviceType', value)}
            data-cy="device-type-select"
            options={[
              { value: '', label: 'All Device Types' },
              ...(filterOptions?.deviceTypes ?? []).map((type) => ({ value: type, label: type }))
            ]}
          />
          <Select
            value={filters.vendor}
            onChange={(value) => updateFilter('vendor', value)}
            data-cy="vendor-select" data-testid="vendor-select"
            options={[
              { value: '', label: 'All Vendors' },
              ...(filterOptions?.vendors ?? []).map((vendor) => ({ value: vendor, label: vendor }))
            ]}
          />
          <Select
            value={filters.status}
            onChange={(value) => updateFilter('status', value)}
            data-cy="status-select" data-testid="status-select"
            options={[
              { value: '', label: 'All Statuses' },
              ...(filterOptions?.statuses ?? []).map((status) => ({ value: status, label: status }))
            ]}
          />
          <Select
            value={filters.location}
            onChange={(value) => updateFilter('location', value)}
            data-cy="location-select" data-testid="location-select"
            options={[
              { value: '', label: 'All Locations' },
              ...(filterOptions?.locations ?? []).map((location) => ({ value: location, label: location }))
            ]}
          />
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
              data-cy="refresh-btn" data-testid="refresh-btn"
            >
              Refresh
            </Button>
            {selectedDevices.length > 0 && (
              <>
                <Button
                  variant="secondary"
                  icon={<Activity className="w-4 h-4" />}
                  onClick={() => selectedDevices[0] && pingTest(selectedDevices[0])}
                  data-cy="ping-test-btn" data-testid="ping-test-btn"
                >
                  Ping Test ({selectedDevices.length})
                </Button>
                <Button
                  variant="secondary"
                  icon={<Eye className="w-4 h-4" />}
                  onClick={() => selectedDevices[0] && viewConfiguration(selectedDevices[0])}
                  data-cy="view-config-btn" data-testid="view-config-btn"
                >
                  View Configuration
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
              onClick={exportData}
              disabled={(data?.length ?? 0) === 0}
              data-cy="export-btn" data-testid="export-btn"
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
          onSelectionChange={setSelectedDevices}
          height="calc(100vh - 650px)"
         
        />
      </div>
    </div>
  );
};

export default NetworkDeviceInventoryView;
