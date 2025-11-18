import * as React from 'react';
import { FolderOpen, Play, XCircle, Download, Clock, HardDrive, Shield, AlertTriangle, Settings, Plus, Trash2 } from 'lucide-react';

import { useFileSystemDiscoveryLogic } from '../../hooks/useFileSystemDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import SearchBar from '../../components/molecules/SearchBar';
import ProgressBar from '../../components/molecules/ProgressBar';

const FileSystemDiscoveryView: React.FC = () => {
  const [showConfigModal, setShowConfigModal] = React.useState(false);
  const [serverInput, setServerInput] = React.useState('');

  const {
    result,
    isRunning,
    progress,
    error,
    config,
    setConfig,
    startDiscovery,
    cancelDiscovery,
    exportResults,
    activeTab,
    setActiveTab,
    filteredShares,
    shareColumnDefs,
    selectedShares,
    setSelectedShares,
    filteredPermissions,
    permissionColumnDefs,
    selectedPermissions,
    setSelectedPermissions,
    filteredLargeFiles,
    largeFileColumnDefs,
    selectedLargeFiles,
    setSelectedLargeFiles,
    searchText,
    setSearchText,
  } = useFileSystemDiscoveryLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="filesystem-discovery-view" data-testid="filesystem-discovery-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <FolderOpen className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">File System Discovery</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Discover file shares, permissions, and storage</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={<Settings className="w-4 h-4" />}
              onClick={() => setShowConfigModal(true)}
              data-cy="config-btn" data-testid="config-btn"
            >
              Configure
            </Button>
            {result && (
              <>
                <Button
                  variant="secondary"
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => exportResults('CSV')}
                  data-cy="export-csv-btn" data-testid="export-csv-btn"
                >
                  Export CSV
                </Button>
                <Button
                  variant="secondary"
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => exportResults('Excel')}
                  data-cy="export-excel-btn" data-testid="export-excel-btn"
                >
                  Export Excel
                </Button>
              </>
            )}
            {isRunning ? (
              <Button
                variant="danger"
                icon={<XCircle className="w-4 h-4" />}
                onClick={cancelDiscovery}
                data-cy="cancel-btn" data-testid="cancel-btn"
              >
                Cancel Discovery
              </Button>
            ) : (
              <Button
                variant="primary"
                icon={<Play className="w-4 h-4" />}
                onClick={startDiscovery}
                disabled={(config.servers?.length ?? 0) === 0}
                data-cy="start-discovery-btn" data-testid="start-discovery-btn"
              >
                Start Discovery
              </Button>
            )}
          </div>
        </div>

        {/* Configuration badges */}
        <div className="flex items-center gap-2 mt-4">
          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-sm font-medium">
            {config.servers?.length ?? 0} Servers
          </span>
          {config.scanPermissions && (
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
              Permissions
            </span>
          )}
          {config.scanLargeFiles && (
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium">
              Large Files (&gt;{config.largeFileThresholdMB}MB)
            </span>
          )}
          {config.detectSecurityRisks && (
            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-sm font-medium">
              Security Scan
            </span>
          )}
        </div>
      </div>

      {/* Progress */}
      {isRunning && progress && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">{progress.message}</span>
            <span className="text-sm text-blue-700 dark:text-blue-300">{(typeof progress?.percentComplete === 'number' ? progress.percentComplete : 0).toFixed(0)}%</span>
          </div>
          <ProgressBar value={progress.percentComplete} max={100} className="mb-2" />
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-blue-700 dark:text-blue-300">
              Servers: {progress.serversCompleted}/{progress.totalServers}
            </div>
            <div className="text-blue-700 dark:text-blue-300">
              Shares: {progress.sharesCompleted}/{progress.totalShares}
            </div>
            {progress.estimatedTimeRemaining && (
              <div className="text-blue-700 dark:text-blue-300">
                ETA: {Math.ceil(progress.estimatedTimeRemaining / 60)} min
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-900 dark:text-red-100">{error}</span>
          </div>
        </div>
      )}

      {/* Statistics */}
      {result && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="grid grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <FolderOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(result?.statistics?.totalShares ?? 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Shares</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(result?.statistics?.usedStorage as any)?.formatted ?? '0'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Storage Used</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(result?.metadata?.totalPermissionsAnalyzed ?? 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Unique Permissions</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {result.securityRisks?.length ?? 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Security Risks</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1 px-6">
          {(['overview', 'shares', 'permissions', 'large-files'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              data-cy={`tab-${tab}`}
            >
              {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder={`Search ${activeTab}...`}
          data-cy="filesystem-search" data-testid="filesystem-search"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'overview' && result && (
          <div className="h-full p-6 overflow-auto">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Storage Statistics</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Total Storage:</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{(result?.statistics?.totalStorage as any)?.formatted ?? '0'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Used Storage:</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{(result?.statistics?.usedStorage as any)?.formatted ?? '0'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Free Storage:</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{(result?.statistics?.freeStorage as any)?.formatted ?? '0'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Total Files:</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{(result?.statistics?.totalFiles ?? 0).toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Total Folders:</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{(result?.statistics?.totalFolders ?? 0).toLocaleString()}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Risks</h3>
                <div className="space-y-2">
                  {(Array.isArray(result?.securityRisks) ? result.securityRisks.slice(0, 5) : []).map((risk) => (
                    <div
                      key={risk.id}
                      className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <AlertTriangle
                        className={`w-5 h-5 flex-shrink-0 ${
                          risk.severity === 'Critical' ? 'text-red-600' :
                          risk.severity === 'High' ? 'text-orange-600' :
                          risk.severity === 'Medium' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white text-sm">{risk.title}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{risk.affectedShare}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        risk.severity === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        risk.severity === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                        risk.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {risk.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shares' && (
          <div className="h-full p-6">
            <VirtualizedDataGrid
              data={filteredShares}
              columns={shareColumnDefs}
              loading={isRunning}
              onSelectionChange={setSelectedShares}
              enableExport
              enableGrouping
              data-cy="shares-grid" data-testid="shares-grid"
            />
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="h-full p-6">
            <VirtualizedDataGrid
              data={filteredPermissions}
              columns={permissionColumnDefs}
              loading={isRunning}
              onSelectionChange={setSelectedPermissions}
              enableExport
              data-cy="permissions-grid" data-testid="permissions-grid"
            />
          </div>
        )}

        {activeTab === 'large-files' && (
          <div className="h-full p-6">
            <VirtualizedDataGrid
              data={filteredLargeFiles}
              columns={largeFileColumnDefs}
              loading={isRunning}
              onSelectionChange={setSelectedLargeFiles}
              enableExport
              data-cy="large-files-grid" data-testid="large-files-grid"
            />
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowConfigModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">File System Discovery Configuration</h2>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Servers */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  File Servers to Scan
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={serverInput}
                    onChange={(e) => setServerInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && serverInput.trim()) {
                        setConfig({
                          ...config,
                          servers: [...config.servers, serverInput.trim()]
                        });
                        setServerInput('');
                      }
                    }}
                    placeholder="Enter server name or IP (press Enter to add)"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <Button
                    variant="primary"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => {
                      if (serverInput.trim()) {
                        setConfig({
                          ...config,
                          servers: [...config.servers, serverInput.trim()]
                        });
                        setServerInput('');
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {config.servers.map((server, index) => (
                    <div key={index} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <span className="text-gray-900 dark:text-white">{server}</span>
                      <button
                        onClick={() => {
                          setConfig({
                            ...config,
                            servers: config.servers.filter((_, i) => i !== index)
                          });
                        }}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {config.servers.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">No servers configured. Add at least one server to start discovery.</p>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.includeHiddenShares}
                    onChange={(e) => setConfig({ ...config, includeHiddenShares: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Include Hidden Shares</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.includeAdministrativeShares}
                    onChange={(e) => setConfig({ ...config, includeAdministrativeShares: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Include Administrative Shares</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.scanPermissions}
                    onChange={(e) => setConfig({ ...config, scanPermissions: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Scan Permissions</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.scanLargeFiles}
                    onChange={(e) => setConfig({ ...config, scanLargeFiles: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Scan Large Files</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.analyzeStorage}
                    onChange={(e) => setConfig({ ...config, analyzeStorage: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Analyze Storage</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.detectSecurityRisks}
                    onChange={(e) => setConfig({ ...config, detectSecurityRisks: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Detect Security Risks</span>
                </label>
              </div>

              {/* Advanced Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Large File Threshold (MB)
                  </label>
                  <input
                    type="number"
                    value={config.largeFileThresholdMB}
                    onChange={(e) => setConfig({ ...config, largeFileThresholdMB: parseInt(e.target.value) || 1024 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Depth
                  </label>
                  <input
                    type="number"
                    value={config.maxDepth}
                    onChange={(e) => setConfig({ ...config, maxDepth: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    value={config.timeout}
                    onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) || 300 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Parallel Scans
                  </label>
                  <input
                    type="number"
                    value={config.parallelScans}
                    onChange={(e) => setConfig({ ...config, parallelScans: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="secondary"
                onClick={() => setShowConfigModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowConfigModal(false)}
              >
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileSystemDiscoveryView;
