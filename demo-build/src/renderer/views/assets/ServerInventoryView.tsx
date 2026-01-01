/**
 * Server Inventory View
 * Displays server inventory with role, resource usage, and health information
 */

import React from 'react';
import { Server, RefreshCw, Download, Eye, Filter, X, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { useServerInventoryLogic } from '../../hooks/useServerInventoryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';

const ServerInventoryView: React.FC = () => {
  const {
    data,
    columns,
    isLoading,
    error,
    filters,
    filterOptions,
    updateFilter,
    clearFilters,
    selectedServers,
    setSelectedServers,
    loadData,
    exportData,
    viewServices,
    healthCheck,
    stats,
    roleDistribution,
    selectedProfile,
  } = useServerInventoryLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="server-inventory-view" data-testid="server-inventory-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Server Inventory</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitor server resources, roles, and health status
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
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Servers</div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats?.total ?? 0}</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="text-sm text-red-600 dark:text-red-400 font-medium">Critical</div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">{stats?.critical ?? 0}</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">High Resource</div>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {stats?.highResource ?? 0}
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Clustered</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats?.clustered ?? 0}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">Physical</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats?.physical ?? 0}</div>
          </div>
          <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4">
            <div className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">Virtual</div>
            <div className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">{stats?.virtual ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Chart - Server Distribution by Role */}
      {roleDistribution.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Server Distribution by Role
          </h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={roleDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
              <XAxis
                dataKey="role"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
          {(filters.role || filters.osType || filters.criticality || filters.clusterMembership || filters.searchText) && (
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
            placeholder="Search name, IP, role..."
            value={filters.searchText}
            onChange={(e) => updateFilter('searchText', e.target.value)}
            data-cy="search-input" data-testid="search-input"
          />
          <Select
            value={filters.role}
            onChange={(value) => updateFilter('role', value)}
            data-cy="role-select"
            options={[
              { value: '', label: 'All Roles' },
              ...(filterOptions?.roles ?? []).map((role) => ({ value: role, label: role }))
            ]}
          />
          <Select
            value={filters.osType}
            onChange={(value) => updateFilter('osType', value)}
            data-cy="os-type-select" data-testid="os-type-select"
            options={[
              { value: '', label: 'All OS Types' },
              ...(filterOptions?.osTypes ?? []).map((os) => ({ value: os, label: os }))
            ]}
          />
          <Select
            value={filters.criticality}
            onChange={(value) => updateFilter('criticality', value)}
            data-cy="criticality-select" data-testid="criticality-select"
            options={[
              { value: '', label: 'All Criticality Levels' },
              ...(filterOptions?.criticalities ?? []).map((crit) => ({ value: crit, label: crit }))
            ]}
          />
          <Select
            value={filters.clusterMembership}
            onChange={(value) => updateFilter('clusterMembership', value)}
            data-cy="cluster-select" data-testid="cluster-select"
            options={[
              { value: '', label: 'All Clusters' },
              ...(filterOptions?.clusters ?? []).map((cluster) => ({ value: cluster, label: cluster }))
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
            {selectedServers.length > 0 && (
              <>
                <Button
                  variant="secondary"
                  icon={<Eye className="w-4 h-4" />}
                  onClick={() => selectedServers[0] && viewServices(selectedServers[0])}
                  data-cy="view-services-btn" data-testid="view-services-btn"
                >
                  View Services ({selectedServers.length})
                </Button>
                <Button
                  variant="secondary"
                  icon={<Activity className="w-4 h-4" />}
                  onClick={() => selectedServers[0] && healthCheck(selectedServers[0])}
                  data-cy="health-check-btn" data-testid="health-check-btn"
                >
                  Health Check
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
          onSelectionChange={setSelectedServers}
          height="calc(100vh - 600px)"
         
        />
      </div>
    </div>
  );
};

export default ServerInventoryView;


