/**
 * Azure Key Vault Discovered View
 * Rich presentation of discovered Key Vault data from CSV files
 */

import * as React from 'react';
import {
  Key,
  Lock,
  Shield,
  ShieldCheck,
  FileKey,
  Award,
  MapPin,
  Download,
  RefreshCw,
  Layers,
  Users,
} from 'lucide-react';

import { useAzureKeyVaultDiscoveredLogic } from '../../hooks/useAzureKeyVaultDiscoveredLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';

const AzureKeyVaultDiscoveredView: React.FC = () => {
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
  } = useAzureKeyVaultDiscoveredLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-testid="azure-keyvault-discovered-view">
      {isLoading && <LoadingOverlay message="Loading Key Vault data..." />}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 text-white shadow-lg">
            <Key className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Key Vault Data</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View discovered Azure Key Vaults with secrets, keys, certificates, and access policies
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={reloadData} variant="secondary" icon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
          {filteredData.length > 0 && (
            <Button
              onClick={() => exportToCSV(filteredData, `azure-keyvaults-${new Date().toISOString().split('T')[0]}.csv`)}
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
          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Key className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalVaults}</div>
                <div className="text-sm opacity-90">Total Vaults</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Lock className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalSecrets}</div>
                <div className="text-sm opacity-90">Total Secrets</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <FileKey className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalKeys}</div>
                <div className="text-sm opacity-90">Total Keys</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Award className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalCertificates}</div>
                <div className="text-sm opacity-90">Total Certificates</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalAccessPolicies}</div>
                <div className="text-sm opacity-90">Access Policies</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.softDeleteEnabled}</div>
                <div className="text-sm opacity-90">Soft Delete</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <ShieldCheck className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.purgeProtectionEnabled}</div>
                <div className="text-sm opacity-90">Purge Protection</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Layers className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.rbacEnabled}</div>
                <div className="text-sm opacity-90">RBAC Enabled</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', icon: Key, label: 'Overview' },
            { id: 'vaults', icon: Key, label: 'Key Vaults', count: stats?.totalVaults },
          ].map(({ id, icon: Icon, label, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === id ? 'border-b-2 border-yellow-600 text-yellow-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Configuration</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-cyan-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Soft Delete Enabled</span>
                    </div>
                    <span className="text-lg font-bold text-cyan-600">{stats.softDeleteEnabled} / {stats.totalVaults}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-teal-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Purge Protection</span>
                    </div>
                    <span className="text-lg font-bold text-teal-600">{stats.purgeProtectionEnabled} / {stats.totalVaults}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">RBAC Authorization</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600">{stats.rbacEnabled} / {stats.totalVaults}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Deployment Enabled</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{stats.deploymentEnabled} / {stats.totalVaults}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vault Contents</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Secrets</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">{stats.totalSecrets}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileKey className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Keys</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{stats.totalKeys}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Certificates</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{stats.totalCertificates}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Access Policies</span>
                    </div>
                    <span className="text-lg font-bold text-indigo-600">{stats.totalAccessPolicies}</span>
                  </div>
                </div>
              </div>
            </div>

            {stats.topLocations.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vaults by Location</h3>
                <div className="space-y-3">
                  {stats.topLocations.map((loc) => (
                    <div key={loc.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{loc.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{loc.count} vaults</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                          <div className="bg-yellow-600 h-full" style={{ width: `${(loc.count / stats.totalVaults) * 100}%` }} />
                        </div>
                        <div className="w-16 text-xs text-gray-600 dark:text-gray-400">
                          {((loc.count / stats.totalVaults) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'vaults' && (
          <>
            <div className="mb-4">
              <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search key vaults..." />
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <VirtualizedDataGrid data={filteredData as any[]} columns={columns} loading={isLoading} enableColumnReorder enableColumnResize />
            </div>
          </>
        )}

        {!isLoading && !stats && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Key className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Key Vault Data</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Run a Key Vault Discovery to populate this view.</p>
              <Button onClick={reloadData} variant="secondary" icon={<RefreshCw className="w-4 h-4" />}>Refresh Data</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AzureKeyVaultDiscoveredView;
