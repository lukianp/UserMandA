/**
 * Licensing Discovered View
 * Rich presentation of discovered licensing data with statistics and filtering
 */

import * as React from 'react';
import { useState } from 'react';
import {
  Key,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  DollarSign,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  Calendar,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

import { useLicensingDiscoveredLogic } from '../../hooks/useLicensingDiscoveredLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';

const LicensingDiscoveredView: React.FC = () => {
  const {
    isLoading,
    error,
    activeTab,
    filter,
    stats,
    columns,
    filteredData,
    setActiveTab,
    updateFilter,
    clearError,
    exportToCSV,
    exportToExcel,
    reloadData,
  } = useLicensingDiscoveredLogic();

  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const statuses = ['active', 'expired', 'trial', 'suspended'];

  const toggleStatus = (status: string) => {
    const current = filter.selectedStatuses;
    const updated = current.includes(status as any)
      ? current.filter(s => s !== status)
      : [...current, status as any];
    updateFilter({ selectedStatuses: updated });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-testid="licensing-discovered-view">
      {isLoading && (
        <LoadingOverlay
          message="Loading licensing data..."
          data-testid="loading-overlay"
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Key className="w-8 h-8 text-yellow-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Licensing Data</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View discovered software licenses and subscription assignments
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={reloadData}
            variant="secondary"
            icon={<RefreshCw className="w-4 h-4" />}
            data-testid="reload-btn"
          >
            Refresh
          </Button>
          {filteredData.length > 0 && (
            <>
              <Button
                onClick={() => exportToCSV(filteredData, `licensing-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`)}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                data-testid="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={() => exportToExcel(filteredData, `licensing-${activeTab}-${new Date().toISOString().split('T')[0]}.xlsx`)}
                variant="secondary"
                icon={<FileSpreadsheet className="w-4 h-4" />}
                data-testid="export-excel-btn"
              >
                Export Excel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
          <span className="text-red-800 dark:text-red-200">{error}</span>
          <Button onClick={clearError} variant="ghost" size="sm">Dismiss</Button>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 p-6">
          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Key className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats.totalLicenses ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Licenses</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats.totalAssigned ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Assigned</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Package className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats.totalAvailable ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Available</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{typeof stats.utilizationRate === 'number' ? stats.utilizationRate.toFixed(1) : '0'}%</div>
                <div className="text-sm opacity-90">Utilization</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <DollarSign className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">${typeof stats.costPerMonth === 'number' ? stats.costPerMonth.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}</div>
                <div className="text-sm opacity-90">Monthly Cost</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Calendar className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.expiringCount ?? 0}</div>
                <div className="text-sm opacity-90">Expiring Soon</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.underlicensedCount ?? 0}</div>
                <div className="text-sm opacity-90">Underlicensed</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.overlicensedCount ?? 0}</div>
                <div className="text-sm opacity-90">Overlicensed</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-b-2 border-yellow-600 text-yellow-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-testid="tab-overview"
          >
            <Package className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('licenses')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'licenses'
                ? 'border-b-2 border-yellow-600 text-yellow-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-testid="tab-licenses"
          >
            <Key className="w-4 h-4" />
            Licenses
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats.totalLicenses ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'assignments'
                ? 'border-b-2 border-yellow-600 text-yellow-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-testid="tab-assignments"
          >
            <Users className="w-4 h-4" />
            Assignments
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats.totalAssigned ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'subscriptions'
                ? 'border-b-2 border-yellow-600 text-yellow-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-testid="tab-subscriptions"
          >
            <Package className="w-4 h-4" />
            Subscriptions
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && stats && (
          <div className="space-y-6 overflow-auto">
            {/* Top Products by License Count */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Products by License Count</h3>
              <div className="space-y-3">
                {(Array.isArray(stats.topCostProducts) ? stats.topCostProducts : []).map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{index + 1}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.product}</span>
                      </div>
                      <div className="text-right">
                        {item.cost > 0 && (
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            ${item.cost.toLocaleString(undefined, { maximumFractionDigits: 2 })}/mo
                          </div>
                        )}
                        <div className="text-xs text-gray-500">{item.count} licenses</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-yellow-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium"
                          style={{ width: `${Math.min(item.utilization, 100)}%` }}
                        >
                          {item.utilization > 10 && `${item.utilization.toFixed(0)}%`}
                        </div>
                      </div>
                      <div className="w-16 text-xs text-gray-600 dark:text-gray-400">
                        {item.utilization.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
                {(!stats.topCostProducts || stats.topCostProducts.length === 0) && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No license data available</p>
                )}
              </div>
            </div>

            {/* License Status Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">License Status Breakdown</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(stats.licensesByStatus ?? {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{status}</span>
                    <span className={`text-lg font-bold ${
                      status === 'active' ? 'text-green-600' :
                      status === 'expired' ? 'text-red-600' :
                      status === 'trial' ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignment Sources */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assignment Sources</h3>
              <div className="space-y-3">
                {Object.entries(stats.assignmentsBySource ?? {}).map(([source, count]) => (
                  <div key={source} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{source}</div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-yellow-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium"
                        style={{ width: `${stats.totalAssigned > 0 ? (count / stats.totalAssigned) * 100 : 0}%` }}
                      >
                        {count > 0 && `${count}`}
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-600 dark:text-gray-400 text-right">
                      {stats.totalAssigned > 0 ? ((count / stats.totalAssigned) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'licenses' || activeTab === 'assignments' || activeTab === 'subscriptions') && (
          <>
            {/* Filters */}
            <div className="mb-4 space-y-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <Input
                    value={filter.searchText}
                    onChange={(e) => updateFilter({ searchText: e.target.value })}
                    placeholder="Search..."
                    data-testid="search-input"
                  />
                </div>
                <button
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Filters
                  {filtersExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {filtersExpanded && activeTab === 'licenses' && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Status</label>
                    <div className="flex flex-wrap gap-2">
                      {statuses.map(status => (
                        <button
                          key={status}
                          onClick={() => toggleStatus(status)}
                          className={`px-3 py-1 text-sm rounded-full transition-colors capitalize ${
                            filter.selectedStatuses.includes(status as any)
                              ? 'bg-yellow-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Checkbox
                      label="Show Only Expiring Soon (30 days)"
                      checked={filter.showOnlyExpiring}
                      onChange={(checked) => updateFilter({ showOnlyExpiring: checked })}
                      data-testid="show-expiring-checkbox"
                    />
                    <Checkbox
                      label="Show Only Unassigned Licenses"
                      checked={filter.showOnlyUnassigned}
                      onChange={(checked) => updateFilter({ showOnlyUnassigned: checked })}
                      data-testid="show-unassigned-checkbox"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Data Grid */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <VirtualizedDataGrid
                data={filteredData as any[]}
                columns={columns}
                loading={isLoading}
                enableColumnReorder
                enableColumnResize
              />
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !stats && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Key className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Licensing Data</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Run a Licensing Discovery to populate this view with license data.
              </p>
              <Button
                onClick={reloadData}
                variant="secondary"
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Refresh Data
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LicensingDiscoveredView;
