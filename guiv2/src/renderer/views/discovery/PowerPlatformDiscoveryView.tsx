import { useState } from 'react';
import {
  Zap,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Globe,
  Smartphone,
  Workflow,
  Plug,
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';

import { usePowerPlatformDiscoveryLogic } from '../../hooks/usePowerPlatformDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

const PowerPlatformDiscoveryView: React.FC = () => {
  const {
    config,
    result,
    isDiscovering,
    progress,
    activeTab,
    filter,
    error,
    showExecutionDialog,
    setShowExecutionDialog,
    logs,
    clearLogs,
    isCancelling,
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
  } = usePowerPlatformDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);

  const appTypes = ['canvas', 'model-driven'];
  const flowStates = ['started', 'stopped', 'suspended'];

  const toggleAppType = (type: string) => {
    const current = filter.selectedAppTypes;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    updateFilter({ selectedAppTypes: updated });
  };

  const toggleFlowState = (state: string) => {
    const current = filter.selectedFlowStates;
    const updated = current.includes(state)
      ? current.filter(s => s !== state)
      : [...current, state];
    updateFilter({ selectedFlowStates: updated });
  };

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="power-platform-discovery-view" data-testid="power-platform-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={progress.percentage}
          onCancel={cancelDiscovery}
          message={progress.message || 'Discovering Power Platform resources...'}
         data-testid="loading-overlay"/>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-violet-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Power Platform Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover automation and business application development to assess shadow IT risks and integration dependencies
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {result && (
            <>
              <Button
                onClick={() => exportToCSV((result as any).data || result, `powerplatform-discovery-${new Date().toISOString().split('T')[0]}.csv`)}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                data-cy="export-csv-btn" data-testid="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={() => exportToExcel((result as any).data || result, `powerplatform-discovery-${new Date().toISOString().split('T')[0]}.xlsx`)}
                variant="secondary"
                icon={<FileSpreadsheet className="w-4 h-4" />}
                data-cy="export-excel-btn" data-testid="export-excel-btn"
              >
                Export Excel
              </Button>
            </>
          )}
          <Button
            onClick={startDiscovery}
            disabled={isDiscovering}
            variant="primary"
            data-cy="start-discovery-btn" data-testid="start-discovery-btn"
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
          data-cy="config-toggle" data-testid="config-toggle"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tenant ID
              </label>
              <Input
                type="text"
                value={config.tenantId || ''}
                onChange={(e) => updateConfig({ tenantId: e.target.value })}
                placeholder="Enter Tenant ID"
                data-cy="tenant-id-input" data-testid="tenant-id-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Checkbox
                label="Include Apps"
                checked={config.includeApps ?? true}
                onChange={(checked) => updateConfig({ includeApps: checked })}
                data-cy="include-apps-checkbox" data-testid="include-apps-checkbox"
              />
              <Checkbox
                label="Include Flows"
                checked={config.includeFlows ?? true}
                onChange={(checked) => updateConfig({ includeFlows: checked })}
                data-cy="include-flows-checkbox" data-testid="include-flows-checkbox"
              />
              <Checkbox
                label="Include Connectors"
                checked={config.includeConnectors ?? true}
                onChange={(checked) => updateConfig({ includeConnectors: checked })}
                data-cy="include-connectors-checkbox" data-testid="include-connectors-checkbox"
              />
              <Checkbox
                label="Include Environments"
                checked={config.includeEnvironments ?? true}
                onChange={(checked) => updateConfig({ includeEnvironments: checked })}
                data-cy="include-environments-checkbox" data-testid="include-environments-checkbox"
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
                data-cy="timeout-input" data-testid="timeout-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 p-6">
          <div className="p-4 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Globe className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.totalEnvironments ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Environments</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Smartphone className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.totalApps ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Power Apps</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Workflow className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.totalFlows ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Power Automate</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Plug className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.totalConnectors ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Connectors</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.flowRunStats?.successCount ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Successful Runs</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <XCircle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.flowRunStats?.failedCount ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Failed Runs</div>
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
                ? 'border-b-2 border-violet-600 text-violet-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-overview" data-testid="tab-overview"
          >
            <Zap className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('environments')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'environments'
                ? 'border-b-2 border-violet-600 text-violet-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-environments" data-testid="tab-environments"
          >
            <Globe className="w-4 h-4" />
            Environments
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalEnvironments ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'apps'
                ? 'border-b-2 border-violet-600 text-violet-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-apps" data-testid="tab-apps"
          >
            <Smartphone className="w-4 h-4" />
            Apps
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalApps ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('flows')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'flows'
                ? 'border-b-2 border-violet-600 text-violet-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-flows" data-testid="tab-flows"
          >
            <Workflow className="w-4 h-4" />
            Flows
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalFlows ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('connectors')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'connectors'
                ? 'border-b-2 border-violet-600 text-violet-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-connectors" data-testid="tab-connectors"
          >
            <Plug className="w-4 h-4" />
            Connectors
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalConnectors ?? 0}</span>}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && stats && (
          <div className="space-y-6 overflow-auto">
            {/* Environment Types */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Environments by Type</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries((stats?.environmentsByType ?? 0)).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{type}</span>
                    <span className="text-lg font-bold text-violet-600">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Apps by Type */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Apps by Type</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries((stats?.appsByType ?? 0)).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {type === 'canvas' ? 'Canvas Apps' : type === 'model-driven' ? 'Model-Driven Apps' : type}
                    </span>
                    <span className="text-lg font-bold text-blue-600">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Flow States */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Flow States</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries((stats?.flowsByState ?? 0)).map(([state, count]) => (
                  <div key={state} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{state}</span>
                    <span className={`text-lg font-bold ${
                      state === 'started' ? 'text-green-600' :
                      state === 'stopped' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top App Owners */}
            {(stats?.topAppOwners?.length ?? 0) > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top App Owners</h3>
                <div className="space-y-2">
                  {(Array.isArray(stats?.topAppOwners) ? stats.topAppOwners : []).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{index + 1}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.owner}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{item.count} apps</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Flow Owners */}
            {(stats?.topFlowOwners?.length ?? 0) > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Flow Owners</h3>
                <div className="space-y-2">
                  {(Array.isArray(stats?.topFlowOwners) ? stats.topFlowOwners : []).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{index + 1}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.owner}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{item.count} flows</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {(activeTab === 'environments' || activeTab === 'apps' || activeTab === 'flows' || activeTab === 'connectors') && (
          <>
            {/* Filters */}
            <div className="mb-4 space-y-4">
              <Input
                value={filter.searchText}
                onChange={(e) => updateFilter({ searchText: e.target.value })}
                placeholder="Search..."
                data-cy="search-input" data-testid="search-input"
              />

              {activeTab === 'apps' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Type</label>
                  <div className="flex flex-wrap gap-2">
                    {appTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => toggleAppType(type)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors capitalize ${
                          filter.selectedAppTypes.includes(type)
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                        data-cy={`filter-apptype-${type}`}
                      >
                        {type === 'canvas' ? 'Canvas' : 'Model-Driven'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'flows' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by State</label>
                  <div className="flex flex-wrap gap-2">
                    {flowStates.map(state => (
                      <button
                        key={state}
                        onClick={() => toggleFlowState(state)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors capitalize ${
                          filter.selectedFlowStates.includes(state)
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                        data-cy={`filter-flowstate-${state}`}
                      >
                        {state}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Data Grid */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <VirtualizedDataGrid
                data={filteredData}
                columns={columns}
                loading={isDiscovering}
                enableColumnReorder
                enableColumnResize
               
              />
            </div>
          </>
        )}
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="Power Platform Discovery"
        scriptDescription="Discovering Power Platform environments, apps, flows, and connectors"
        logs={logs}
        isRunning={isDiscovering}
        isCancelling={isCancelling}
        progress={progress ? {
          percentage: progress.percentage || 0,
          message: progress.message || 'Processing...'
        } : undefined}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
    </div>
  );
};

export default PowerPlatformDiscoveryView;
