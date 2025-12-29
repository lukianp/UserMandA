/**
 * Azure Infrastructure Discovery View
 *
 * Comprehensive view for Azure Resource discovery results.
 * Modeled after IntuneDiscoveryView for consistent UX.
 */

import { useState } from 'react';
import {
  Server,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Cloud,
  Database,
  HardDrive,
  Network,
  Globe,
  Key,
  Layers,
  FolderTree
} from 'lucide-react';

import { useProfileStore } from '../../store/useProfileStore';
import { useAzureResourceDiscoveryLogic } from '../../hooks/useAzureResourceDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

const AzureResourceDiscoveryView: React.FC = () => {
  const { selectedSourceProfile } = useProfileStore();
  const {
    config,
    results,
    isRunning,
    isCancelling,
    progress,
    activeTab,
    filter,
    error,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
    clearLogs,
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
  } = useAzureResourceDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);

  // Normalize filter
  const normalizedFilter = {
    selectedResourceTypes: Array.isArray(filter?.selectedResourceTypes) ? filter.selectedResourceTypes : [],
    searchText: filter?.searchText ?? '',
  };

  // Get resource breakdown from stats
  const resourcesByType = stats?.resourcesByType && typeof stats.resourcesByType === 'object'
    ? stats.resourcesByType as Record<string, number>
    : {};

  // Export payload
  const exportPayload = Array.isArray(filteredData) ? filteredData : [];

  // Resource type filters
  const resourceTypes = ['VirtualMachine', 'StorageAccount', 'KeyVault', 'Network', 'WebApp', 'Database'];

  const toggleResourceType = (type: string) => {
    const current = normalizedFilter.selectedResourceTypes;
    const updated = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
    updateFilter({ selectedResourceTypes: updated });
  };

  // Calculate stats from results data
  const totalResources = Number(stats?.totalResources) || 0;
  const vmCount = Number(stats?.virtualMachines) || 0;
  const storageCount = Number(stats?.storageAccounts) || 0;
  const keyVaultCount = Number(stats?.keyVaults) || 0;
  const networkCount = Number(stats?.networkResources) || 0;
  const webAppCount = Number(stats?.webApps) || 0;
  const subscriptionCount = Array.isArray(stats?.subscriptions) ? stats.subscriptions.length : 1;
  const resourceGroupCount = Number(stats?.resourceGroups) || 0;

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="azure-resource-discovery-view" data-testid="azure-resource-discovery-view">
      {isRunning && (
        <LoadingOverlay
          progress={typeof progress?.percentage === 'number' ? progress.percentage : 0}
          onCancel={cancelDiscovery || undefined}
          message={progress?.message || progress?.currentPhase || 'Discovering Azure resources...'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
            <Cloud size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Azure Resource Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover Azure subscriptions, VMs, storage accounts, networking, and Key Vaults for infrastructure planning
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {exportPayload.length > 0 && (
            <>
              <Button
                onClick={() => exportToCSV(exportPayload, `azure-resources-${new Date().toISOString().split('T')[0]}.csv`)}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                data-cy="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={() => exportToExcel(exportPayload, `azure-resources-${new Date().toISOString().split('T')[0]}.xlsx`)}
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
            disabled={isRunning || !selectedSourceProfile}
            variant="primary"
            data-cy="start-discovery-btn"
          >
            {isRunning ? 'Discovering...' : 'Start Discovery'}
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
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          data-cy="config-toggle"
        >
          <span className="font-semibold text-gray-900 dark:text-white">Discovery Configuration</span>
          {configExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </button>

        {configExpanded && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Checkbox
                label="Include Virtual Machines"
                checked={config?.includeVirtualMachines ?? true}
                onChange={(checked: boolean) => updateConfig({ includeVirtualMachines: checked })}
                data-cy="include-vms-checkbox"
              />
              <Checkbox
                label="Include Storage Accounts"
                checked={config?.includeStorageAccounts ?? true}
                onChange={(checked: boolean) => updateConfig({ includeStorageAccounts: checked })}
                data-cy="include-storage-checkbox"
              />
              <Checkbox
                label="Include Network Resources"
                checked={config?.includeNetworkResources ?? true}
                onChange={(checked: boolean) => updateConfig({ includeNetworkResources: checked })}
                data-cy="include-network-checkbox"
              />
              <Checkbox
                label="Include Databases"
                checked={config?.includeDatabases ?? true}
                onChange={(checked: boolean) => updateConfig({ includeDatabases: checked })}
                data-cy="include-databases-checkbox"
              />
              <Checkbox
                label="Include Web Apps"
                checked={config?.includeWebApps ?? true}
                onChange={(checked: boolean) => updateConfig({ includeWebApps: checked })}
                data-cy="include-webapps-checkbox"
              />
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 p-6">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Cloud className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{totalResources.toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Resources</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Layers className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{subscriptionCount}</div>
                <div className="text-sm opacity-90">Subscriptions</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <FolderTree className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{resourceGroupCount}</div>
                <div className="text-sm opacity-90">Resource Groups</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Server className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{vmCount}</div>
                <div className="text-sm opacity-90">Virtual Machines</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <HardDrive className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{storageCount}</div>
                <div className="text-sm opacity-90">Storage Accounts</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Key className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{keyVaultCount}</div>
                <div className="text-sm opacity-90">Key Vaults</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Network className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{networkCount}</div>
                <div className="text-sm opacity-90">Network Resources</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Globe className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{webAppCount}</div>
                <div className="text-sm opacity-90">Web Apps</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-all"
          >
            <Cloud className="w-4 h-4" />
            All Resources
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{totalResources}</span>}
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-overview"
          >
            <Layers className="w-4 h-4" />
            Summary
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {/* Empty state when no data */}
        {activeTab === 'overview' && (!stats || totalResources === 0) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Cloud className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Azure Resources Discovered</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to view Azure infrastructure and resources.</p>
              <Button onClick={startDiscovery} disabled={isRunning || !selectedSourceProfile} variant="primary">
                {isRunning ? 'Discovering...' : 'Start Discovery'}
              </Button>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && totalResources > 0 && (
          <div className="space-y-6 overflow-auto">
            {/* Resources by Type */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resources by Type</h3>
              <div className="space-y-3">
                {Object.entries(resourcesByType).map(([type, count]) => {
                  const countNum = typeof count === 'number' ? count : 0;
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <div className="w-40 text-sm font-medium text-gray-700 dark:text-gray-300">{type}</div>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium"
                          style={{ width: `${totalResources > 0 ? (countNum / totalResources) * 100 : 0}%` }}
                        >
                          {countNum > 0 && `${countNum}`}
                        </div>
                      </div>
                      <div className="w-16 text-sm text-gray-600 dark:text-gray-400 text-right">
                        {totalResources > 0 ? ((countNum / totalResources) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subscription Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Discovery Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Resources</span>
                  <span className="text-lg font-bold text-blue-600">{totalResources}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Subscriptions</span>
                  <span className="text-lg font-bold text-purple-600">{subscriptionCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Resource Groups</span>
                  <span className="text-lg font-bold text-indigo-600">{resourceGroupCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Resource Types</span>
                  <span className="text-lg font-bold text-green-600">{Object.keys(resourcesByType).length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Resources Tab - Data Grid */}
        {activeTab === 'all' && (
          <>
            {/* Search and Filters */}
            <div className="mb-4 space-y-4">
              <Input
                value={normalizedFilter.searchText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  setTimeout(() => updateFilter({ searchText: value }), 150);
                }}
                placeholder="Search by name, type, resource group, or location..."
                data-cy="search-input"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Resource Type</label>
                <div className="flex flex-wrap gap-2">
                  {resourceTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => toggleResourceType(type)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        normalizedFilter.selectedResourceTypes.includes(type)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                      data-cy={`filter-type-${type.toLowerCase()}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Data Grid */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <VirtualizedDataGrid
                data={Array.isArray(filteredData) ? filteredData as any[] : []}
                columns={Array.isArray(columns) ? columns : []}
                loading={isRunning}
                enableColumnReorder
                enableColumnResize
                data-cy={isRunning ? "grid-loading" : undefined}
              />
            </div>
          </>
        )}
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isRunning && setShowExecutionDialog(false)}
        scriptName="Azure Resource Discovery"
        scriptDescription="Discovering Azure cloud resources across subscriptions"
        logs={logs.map(log => ({
          timestamp: log.timestamp,
          message: log.message,
          level: log.level as 'info' | 'success' | 'warning' | 'error'
        }))}
        isRunning={isRunning}
        isCancelling={isCancelling}
        progress={progress ? {
          percentage: progress.percentage || 0,
          message: progress.message || progress.currentPhase || 'Processing...'
        } : undefined}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
    </div>
  );
};

export default AzureResourceDiscoveryView;
