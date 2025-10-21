import React, { useState } from 'react';
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
  CheckCircle
} from 'lucide-react';
import { useLicensingDiscoveryLogic } from '../../hooks/useLicensingDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';

const LicensingDiscoveryView: React.FC = () => {
  const {
    config,
    result,
    isDiscovering,
    progress,
    activeTab,
    filter,
    error,
    columns,
    filteredData,
    stats,
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    setActiveTab,
    updateFilter,
    clearError,
    exportToCSV,
    exportToExcel
  } = useLicensingDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);

  const statuses = ['active', 'expired', 'trial', 'suspended'];

  const toggleStatus = (status: string) => {
    const current = filter.selectedStatuses;
    const updated = current.includes(status as any)
      ? current.filter(s => s !== status)
      : [...current, status as any];
    updateFilter({ selectedStatuses: updated });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="licensing-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={progress.percentage}
          onCancel={cancelDiscovery}
          message={progress.message || 'Discovering licenses...'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Key className="w-8 h-8 text-yellow-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Licensing Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover and analyze software licenses, costs, and compliance
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {result && (
            <>
              <Button
                onClick={() => exportToCSV((result as any).data || result, `licensing-discovery-${new Date().toISOString().split('T')[0]}.csv`)}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                data-cy="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={() => exportToExcel((result as any).data || result, `licensing-discovery-${new Date().toISOString().split('T')[0]}.xlsx`)}
                variant="secondary"
                icon={<FileSpreadsheet className="w-4 h-4" />}
                data-cy="export-excel-btn"
              >
                Export Excel
              </Button>
            </>
          )}
          <Button
            onClick={startDiscovery}
            disabled={isDiscovering}
            variant="primary"
            data-cy="start-discovery-btn"
          >
            {isDiscovering ? 'Discovering...' : 'Start Discovery'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
          <span className="text-red-800 dark:text-red-200">{error}</span>
          <Button onClick={clearError} variant="ghost" size="sm">Dismiss</Button>
        </div>
      )}

      {/* Configuration Panel */}
      <div className="mx-6 mt-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setConfigExpanded(!configExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg transition-colors"
          data-cy="config-toggle"
        >
          <span className="font-semibold text-gray-900 dark:text-white">Discovery Configuration</span>
          {configExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {configExpanded && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Checkbox
                label="Include Microsoft 365"
                checked={config.includeMicrosoft365 ?? true}
                onChange={(checked) => updateConfig({ includeMicrosoft365: checked })}
                data-cy="include-m365-checkbox"
              />
              <Checkbox
                label="Include Azure"
                checked={config.includeAzure ?? true}
                onChange={(checked) => updateConfig({ includeAzure: checked })}
                data-cy="include-azure-checkbox"
              />
              <Checkbox
                label="Include Office"
                checked={config.includeOffice ?? true}
                onChange={(checked) => updateConfig({ includeOffice: checked })}
                data-cy="include-office-checkbox"
              />
              <Checkbox
                label="Include Windows"
                checked={config.includeWindows ?? true}
                onChange={(checked) => updateConfig({ includeWindows: checked })}
                data-cy="include-windows-checkbox"
              />
              <Checkbox
                label="Include Third Party"
                checked={config.includeThirdParty ?? false}
                onChange={(checked) => updateConfig({ includeThirdParty: checked })}
                data-cy="include-thirdparty-checkbox"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tenant ID (optional)
              </label>
              <Input
                type="text"
                value={config.tenantId || ''}
                onChange={(e) => updateConfig({ tenantId: e.target.value })}
                placeholder="Enter Tenant ID"
                data-cy="tenant-id-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timeout (ms)
              </label>
              <Input
                type="number"
                value={config.timeout ?? 600000}
                onChange={(e) => updateConfig({ timeout: parseInt(e.target.value) || 600000 })}
                min={60000}
                max={1800000}
                step={60000}
                data-cy="timeout-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 p-6">
          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Key className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.totalLicenses ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Licenses</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.totalAssigned ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Assigned</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Package className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.totalAvailable ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Available</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.utilizationRate?.toFixed ?? 0)(1)}%</div>
                <div className="text-sm opacity-90">Utilization</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <DollarSign className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">${(stats?.costPerMonth?.toLocaleString ?? 0)(undefined, { maximumFractionDigits: 0 })}</div>
                <div className="text-sm opacity-90">Monthly Cost</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Calendar className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats?.expiringCount ?? 0}</div>
                <div className="text-sm opacity-90">Expiring Soon</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats?.underlicensedCount ?? 0}</div>
                <div className="text-sm opacity-90">Underlicensed</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats?.overlicensedCount ?? 0}</div>
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
            data-cy="tab-overview"
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
            data-cy="tab-licenses"
          >
            <Key className="w-4 h-4" />
            Licenses
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalLicenses ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'assignments'
                ? 'border-b-2 border-yellow-600 text-yellow-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-assignments"
          >
            <Users className="w-4 h-4" />
            Assignments
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalAssigned ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'subscriptions'
                ? 'border-b-2 border-yellow-600 text-yellow-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-subscriptions"
          >
            <Package className="w-4 h-4" />
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'compliance'
                ? 'border-b-2 border-yellow-600 text-yellow-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-compliance"
          >
            <CheckCircle className="w-4 h-4" />
            Compliance
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && stats && (
          <div className="space-y-6 overflow-auto">
            {/* Top Cost Products */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Cost Products</h3>
              <div className="space-y-3">
                {(stats?.topCostProducts?.map ?? 0)((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{index + 1}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.product}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${item.cost.toLocaleString(undefined, { maximumFractionDigits: 2 })}/mo
                        </div>
                        <div className="text-xs text-gray-500">{item.count} licenses</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-yellow-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium"
                          style={{ width: `${item.utilization}%` }}
                        >
                          {item.utilization > 10 && `${item.(typeof utilization === 'number' ? utilization : 0).toFixed(0)}%`}
                        </div>
                      </div>
                      <div className="w-16 text-xs text-gray-600 dark:text-gray-400">
                        {item.(typeof utilization === 'number' ? utilization : 0).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* License Status Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">License Status Breakdown</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries((stats?.licensesByStatus ?? 0)).map(([status, count]) => (
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
                {Object.entries((stats?.assignmentsBySource ?? 0)).map(([source, count]) => (
                  <div key={source} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{source}</div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-yellow-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium"
                        style={{ width: `${(stats?.totalAssigned ?? 0) > 0 ? (count / (stats?.totalAssigned ?? 0)) * 100 : 0}%` }}
                      >
                        {count > 0 && `${count}`}
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-600 dark:text-gray-400 text-right">
                      {(stats?.totalAssigned ?? 0) > 0 ? ((count / (stats?.totalAssigned ?? 0)) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && result?.complianceStatus && (
          <div className="space-y-6 overflow-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                {(result?.complianceStatus?.isCompliant ?? 0) ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {(result?.complianceStatus?.isCompliant ?? 0) ? 'Compliant' : 'Non-Compliant'}
                </h3>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Overall Utilization: {result.complianceStatus.(typeof utilizationRate === 'number' ? utilizationRate : 0).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Unassigned Licenses: {(result?.complianceStatus?.unassignedLicenses ?? 0).toLocaleString()}
              </div>
            </div>

            {(result?.complianceStatus?.underlicensedProducts ?? 0).length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-3">Underlicensed Products</h3>
                <ul className="space-y-2">
                  {(result?.complianceStatus?.underlicensedProducts ?? 0).map((product, index) => (
                    <li key={index} className="text-sm text-red-800 dark:text-red-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {product}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(result?.complianceStatus?.overlicensedProducts ?? 0).length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-3">Overlicensed Products</h3>
                <ul className="space-y-2">
                  {(result?.complianceStatus?.overlicensedProducts ?? 0).map((product, index) => (
                    <li key={index} className="text-sm text-yellow-800 dark:text-yellow-300">{product}</li>
                  ))}
                </ul>
              </div>
            )}

            {(result?.complianceStatus?.expiringSoon ?? 0).length > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-200 mb-3">Expiring Soon</h3>
                <div className="space-y-2">
                  {(result?.complianceStatus?.expiringSoon ?? 0).map((license, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                      <span className="text-sm text-gray-900 dark:text-white">{license.productName}</span>
                      <span className="text-sm text-orange-600">
                        {license.expirationDate ? new Date(license.expirationDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {(activeTab === 'licenses' || activeTab === 'assignments' || activeTab === 'subscriptions') && (
          <>
            {/* Filters */}
            <div className="mb-4 space-y-4">
              <Input
                value={filter.searchText}
                onChange={(e) => updateFilter({ searchText: e.target.value })}
                placeholder="Search..."
                data-cy="search-input"
              />

              {activeTab === 'licenses' && (
                <div className="space-y-3">
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
                          data-cy={`filter-status-${status}`}
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
                      data-cy="show-expiring-checkbox"
                    />
                    <Checkbox
                      label="Show Only Unassigned Licenses"
                      checked={filter.showOnlyUnassigned}
                      onChange={(checked) => updateFilter({ showOnlyUnassigned: checked })}
                      data-cy="show-unassigned-checkbox"
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
                loading={isDiscovering}
                enableColumnReorder
                enableColumnResize

              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LicensingDiscoveryView;
