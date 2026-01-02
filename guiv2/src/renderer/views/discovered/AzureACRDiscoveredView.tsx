/**
 * Azure Container Registry Discovered View
 * Rich presentation of discovered ACR data from CSV files
 */

import * as React from 'react';
import {
  Package,
  Lock,
  Globe,
  Shield,
  MapPin,
  Download,
  RefreshCw,
  Server,
  Layers,
} from 'lucide-react';

import { useAzureACRDiscoveredLogic } from '../../hooks/useAzureACRDiscoveredLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import { DiscoverySuccessCard } from '../../components/molecules/DiscoverySuccessCard';

const AzureACRDiscoveredView: React.FC = () => {
  const {
    isLoading,
    error,
    activeTab,
    searchText,
    stats,
    columns,
    filteredData,
    setActiveTab,
    setSearchText,
    reloadData,
    exportToCSV,
    clearError,
  } = useAzureACRDiscoveredLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-testid="azure-acr-discovered-view">
      {isLoading && <LoadingOverlay message="Loading Container Registry data..." />}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Container Registry Data</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View discovered Azure Container Registries with SKU, access, and security settings
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={reloadData} variant="secondary" icon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
          {filteredData.length > 0 && (
            <Button
              onClick={() => exportToCSV(filteredData, `azure-acr-${new Date().toISOString().split('T')[0]}.csv`)}
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
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
          <DiscoverySuccessCard
            percentage={stats.discoverySuccessPercentage ?? 0}
            received={stats.dataSourcesReceivedCount ?? 0}
            total={stats.dataSourcesTotal ?? 1}
            showAnimation={true}
          />
          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Package className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalRegistries}</div>
                <div className="text-sm opacity-90">Total Registries</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Layers className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.premiumCount}</div>
                <div className="text-sm opacity-90">Premium SKU</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Lock className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.adminEnabledCount}</div>
                <div className="text-sm opacity-90">Admin Enabled</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Globe className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.publicAccessCount}</div>
                <div className="text-sm opacity-90">Public Access</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Server className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.standardCount}</div>
                <div className="text-sm opacity-90">Standard SKU</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Package className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.basicCount}</div>
                <div className="text-sm opacity-90">Basic SKU</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.zoneRedundantCount}</div>
                <div className="text-sm opacity-90">Zone Redundant</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <MapPin className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.topLocations.length}</div>
                <div className="text-sm opacity-90">Locations</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', icon: Package, label: 'Overview' },
            { id: 'registries', icon: Package, label: 'Registries', count: stats?.totalRegistries },
          ].map(({ id, icon: Icon, label, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === id ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count !== undefined && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && stats && (
          <div className="space-y-6 overflow-auto">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">SKU Distribution</h3>
                <div className="space-y-3">
                  {stats.registriesBySku.map(({ sku, count }) => (
                    <div key={sku} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Layers className={`w-5 h-5 ${sku === 'Premium' ? 'text-purple-600' : sku === 'Standard' ? 'text-blue-600' : 'text-gray-600'}`} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{sku}</span>
                      </div>
                      <span className={`text-lg font-bold ${sku === 'Premium' ? 'text-purple-600' : sku === 'Standard' ? 'text-blue-600' : 'text-gray-600'}`}>{count}</span>
                    </div>
                  ))}
                  {stats.registriesBySku.length === 0 && (
                    <div className="text-center text-gray-500 py-4">No registries discovered</div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin Enabled</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-600">{stats.adminEnabledCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-cyan-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Public Access</span>
                    </div>
                    <span className="text-lg font-bold text-cyan-600">{stats.publicAccessCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-teal-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Zone Redundant</span>
                    </div>
                    <span className="text-lg font-bold text-teal-600">{stats.zoneRedundantCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {stats.topLocations.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Registries by Location</h3>
                <div className="space-y-3">
                  {stats.topLocations.map((loc) => (
                    <div key={loc.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{loc.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{loc.count} registries</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                          <div className="bg-purple-600 h-full" style={{ width: `${(loc.count / stats.totalRegistries) * 100}%` }} />
                        </div>
                        <div className="w-16 text-xs text-gray-600 dark:text-gray-400">
                          {((loc.count / stats.totalRegistries) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'registries' && (
          <>
            <div className="mb-4">
              <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search registries..." />
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <VirtualizedDataGrid data={filteredData as any[]} columns={columns} loading={isLoading} enableColumnReorder enableColumnResize />
            </div>
          </>
        )}

        {!isLoading && !stats && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Container Registry Data</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Run a Container Registry Discovery to populate this view.</p>
              <Button onClick={reloadData} variant="secondary" icon={<RefreshCw className="w-4 h-4" />}>Refresh Data</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AzureACRDiscoveredView;
