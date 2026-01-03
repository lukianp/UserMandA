import { useState } from 'react';
import {
  HardDrive,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Server,
  Database,
  Network,
  Layers,
  Box,
  Disc,
} from 'lucide-react';

import { useStorageArrayDiscoveryLogic } from '../../hooks/useStorageArrayDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

const StorageArrayDiscoveryView: React.FC = () => {
  const {
    config,
    result,
    isDiscovering,
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
    exportToExcel,
  } = useStorageArrayDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);

  const normalizedFilter = {
    searchText: filter?.searchText ?? '',
    selectedTypes: Array.isArray(filter?.selectedTypes) ? filter.selectedTypes : [],
    selectedStatuses: Array.isArray(filter?.selectedStatuses) ? filter.selectedStatuses : [],
    showErrorsOnly: !!filter?.showErrorsOnly,
  };

  const exportPayload = Array.isArray(result?.data) ? result.data : [];

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="storage-array-discovery-view" data-testid="storage-array-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={typeof progress?.percentage === 'number' ? progress.percentage : 0}
          onCancel={cancelDiscovery || undefined}
          message={progress?.message || 'Discovering storage systems...'}
        />
      )}

      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-orange-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Storage Array Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover physical disks, volumes, network storage, and storage spaces to assess storage infrastructure
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {exportPayload.length > 0 && (
            <>
              <Button
                onClick={() => exportToCSV(exportPayload, `storage-array-discovery-${new Date().toISOString().split('T')[0]}.csv`)}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                data-cy="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={() => exportToExcel(exportPayload, `storage-array-discovery-${new Date().toISOString().split('T')[0]}.xlsx`)}
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

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
          <span className="text-red-800 dark:text-red-200">{error}</span>
          <Button onClick={clearError} variant="ghost" size="sm">Dismiss</Button>
        </div>
      )}

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
            <div className="grid grid-cols-2 gap-4">
              <Checkbox
                label="Include Volumes"
                checked={config.includeVolumes}
                onChange={(checked) => updateConfig({ includeVolumes: checked })}
                data-cy="include-volumes-checkbox"
              />
              <Checkbox
                label="Include Disks"
                checked={config.includeDisks}
                onChange={(checked) => updateConfig({ includeDisks: checked })}
                data-cy="include-disks-checkbox"
              />
              <Checkbox
                label="Include Storage Pools"
                checked={config.includeStoragePools}
                onChange={(checked) => updateConfig({ includeStoragePools: checked })}
                data-cy="include-pools-checkbox"
              />
              <Checkbox
                label="Include Controllers"
                checked={config.includeControllers}
                onChange={(checked) => updateConfig({ includeControllers: checked })}
                data-cy="include-controllers-checkbox"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timeout (seconds)</label>
              <Input
                type="number"
                value={config.timeout}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const next = Number(e.target.value);
                  const clamped = Math.max(60, Math.min(1800, next));
                  updateConfig({ timeout: clamped });
                }}
                min={60}
                max={1800}
                data-cy="timeout-input"
              />
            </div>
          </div>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-4 p-6">
          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <HardDrive className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalCapacityGB ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Capacity (GB)</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Disc className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalFreeSpaceGB ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Free Space (GB)</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Box className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.physicalDiskCount ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Physical Disks</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <HardDrive className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.volumeCount ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Volumes</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Network className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.networkDriveCount ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Network Drives</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Server className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.smbShareCount ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">SMB Shares</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Layers className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.storagePoolCount ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Storage Pools</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Database className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.virtualDiskCount ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Virtual Disks</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'overview' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-overview"
          >
            <Database className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('physical-disks')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'physical-disks' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-physical-disks"
          >
            <Box className="w-4 h-4" />
            Physical Disks
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.physicalDiskCount ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('volumes')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'volumes' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-volumes"
          >
            <HardDrive className="w-4 h-4" />
            Volumes
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.volumeCount ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('network-storage')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'network-storage' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-network-storage"
          >
            <Network className="w-4 h-4" />
            Network Storage
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{(stats?.networkDriveCount ?? 0) + (stats?.smbShareCount ?? 0)}</span>}
          </button>
          <button
            onClick={() => setActiveTab('storage-spaces')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'storage-spaces' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-storage-spaces"
          >
            <Layers className="w-4 h-4" />
            Storage Spaces
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{(stats?.storagePoolCount ?? 0) + (stats?.virtualDiskCount ?? 0)}</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && (!stats || (stats?.physicalDiskCount ?? 0) === 0) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Storage Data Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to view storage statistics and insights.</p>
              <Button onClick={startDiscovery} disabled={isDiscovering} variant="primary">
                {isDiscovering ? 'Discovering...' : 'Start Discovery'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && stats && (stats?.physicalDiskCount ?? 0) > 0 && (
          <div className="space-y-6 overflow-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Storage Capacity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-40 text-sm font-medium text-gray-700 dark:text-gray-300">Total Capacity</div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                    <div className="bg-orange-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium" style={{ width: '100%' }}>
                      {(stats?.totalCapacityGB ?? 0).toLocaleString()} GB
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-40 text-sm font-medium text-gray-700 dark:text-gray-300">Free Space</div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-green-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium"
                      style={{ width: `${stats?.totalCapacityGB > 0 ? ((stats?.totalFreeSpaceGB ?? 0) / stats.totalCapacityGB) * 100 : 0}%` }}
                    >
                      {(stats?.totalFreeSpaceGB ?? 0).toLocaleString()} GB
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-600 dark:text-gray-400 text-right">
                    {stats?.totalCapacityGB > 0 ? (((stats?.totalFreeSpaceGB ?? 0) / stats.totalCapacityGB) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Storage Distribution</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <Box className="w-8 h-8 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Physical Disks</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{stats?.physicalDiskCount ?? 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-8 h-8 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Volumes</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">{stats?.volumeCount ?? 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                  <div className="flex items-center gap-3">
                    <Network className="w-8 h-8 text-cyan-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Network Drives</span>
                  </div>
                  <span className="text-2xl font-bold text-cyan-600">{stats?.networkDriveCount ?? 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                  <div className="flex items-center gap-3">
                    <Layers className="w-8 h-8 text-pink-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage Pools</span>
                  </div>
                  <span className="text-2xl font-bold text-pink-600">{stats?.storagePoolCount ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'overview' && (
          <>
            <div className="mb-4">
              <Input
                value={normalizedFilter.searchText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  updateFilter({ searchText: e.target.value });
                }}
                placeholder="Search storage..."
                data-cy="search-input"
              />
            </div>

            {filteredData.length > 0 ? (
              <div className="flex-1 overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                <VirtualizedDataGrid
                  data={filteredData}
                  columns={columns}
                  className="ag-theme-alpine"
                  data-cy="storage-grid"
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="text-center">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No storage found matching your filters.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="Storage Array Discovery"
        logs={logs}
        isRunning={isDiscovering}
        isCancelling={isCancelling}
        progress={progress}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
    </div>
  );
};

export default StorageArrayDiscoveryView;
