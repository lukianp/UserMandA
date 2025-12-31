/**
 * Azure Logic Apps Discovered View
 * Rich presentation of discovered Logic Apps data from CSV files
 */

import * as React from 'react';
import {
  Workflow,
  Play,
  Pause,
  Zap,
  Activity,
  CheckCircle,
  XCircle,
  MapPin,
  Download,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';

import { useAzureLogicAppsDiscoveredLogic } from '../../hooks/useAzureLogicAppsDiscoveredLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';

const AzureLogicAppsDiscoveredView: React.FC = () => {
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
  } = useAzureLogicAppsDiscoveredLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-testid="azure-logicapps-discovered-view">
      {isLoading && <LoadingOverlay message="Loading Logic Apps data..." />}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
            <Workflow className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Logic Apps Data</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View discovered Azure Logic Apps with triggers, run history, and workflow configuration
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={reloadData} variant="secondary" icon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
          {filteredData.length > 0 && (
            <Button
              onClick={() => exportToCSV(filteredData, `azure-logicapps-${new Date().toISOString().split('T')[0]}.csv`)}
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
          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Workflow className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalLogicApps}</div>
                <div className="text-sm opacity-90">Total Logic Apps</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Play className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.enabledCount}</div>
                <div className="text-sm opacity-90">Enabled</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Pause className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.disabledCount}</div>
                <div className="text-sm opacity-90">Disabled</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Zap className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalTriggers}</div>
                <div className="text-sm opacity-90">Total Triggers</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Activity className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalRecentRuns}</div>
                <div className="text-sm opacity-90">Recent Runs</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.succeededRuns}</div>
                <div className="text-sm opacity-90">Succeeded</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <XCircle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.failedRuns}</div>
                <div className="text-sm opacity-90">Failed</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Layers className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{Object.keys(stats.logicAppsBySku).length}</div>
                <div className="text-sm opacity-90">SKU Types</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', icon: Workflow, label: 'Overview' },
            { id: 'logicapps', icon: Workflow, label: 'Logic Apps', count: stats?.totalLogicApps },
          ].map(({ id, icon: Icon, label, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Workflow Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Play className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enabled</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{stats.enabledCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Pause className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Disabled</span>
                    </div>
                    <span className="text-lg font-bold text-gray-600">{stats.disabledCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Triggers</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">{stats.totalTriggers}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Run Statistics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Runs</span>
                    </div>
                    <span className="text-lg font-bold text-indigo-600">{stats.totalRecentRuns}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Succeeded</span>
                    </div>
                    <span className="text-lg font-bold text-emerald-600">{stats.succeededRuns}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Failed</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">{stats.failedRuns}</span>
                  </div>
                </div>
              </div>
            </div>

            {stats.topLocations.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Logic Apps by Location</h3>
                <div className="space-y-3">
                  {stats.topLocations.map((loc) => (
                    <div key={loc.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{loc.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{loc.count} apps</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                          <div className="bg-blue-600 h-full" style={{ width: `${(loc.count / stats.totalLogicApps) * 100}%` }} />
                        </div>
                        <div className="w-16 text-xs text-gray-600 dark:text-gray-400">
                          {((loc.count / stats.totalLogicApps) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'logicapps' && (
          <>
            <div className="mb-4">
              <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search logic apps..." />
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <VirtualizedDataGrid data={filteredData as any[]} columns={columns} loading={isLoading} enableColumnReorder enableColumnResize />
            </div>
          </>
        )}

        {!isLoading && !stats && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Workflow className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Logic Apps Data</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Run a Logic Apps Discovery to populate this view.</p>
              <Button onClick={reloadData} variant="secondary" icon={<RefreshCw className="w-4 h-4" />}>Refresh Data</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AzureLogicAppsDiscoveredView;
