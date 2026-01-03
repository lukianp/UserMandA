import { useState } from 'react';
import {
  Printer,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Server,
  AlertTriangle,
  Check,
  Share2,
  Globe,
  HardDrive,
  Layers,
} from 'lucide-react';

import { usePrinterDiscoveryLogic } from '../../hooks/usePrinterDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

const PrinterDiscoveryView: React.FC = () => {
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
  } = usePrinterDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);

  // Normalize filter to ensure safe access
  const normalizedFilter = {
    searchText: filter?.searchText ?? '',
    selectedTypes: Array.isArray(filter?.selectedTypes) ? filter.selectedTypes : [],
    selectedStatuses: Array.isArray(filter?.selectedStatuses) ? filter.selectedStatuses : [],
    showOfflineOnly: !!filter?.showOfflineOnly,
  };

  // Export payload
  const exportPayload = Array.isArray(result?.data) ? result.data : [];

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="printer-discovery-view" data-testid="printer-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={typeof progress?.percentage === 'number' ? progress.percentage : 0}
          onCancel={cancelDiscovery || undefined}
          message={progress?.message || 'Discovering printers...'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Printer className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Printer Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover local printers, network printers, print servers, and drivers to assess print infrastructure
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {exportPayload.length > 0 && (
            <>
              <Button
                onClick={() => exportToCSV(exportPayload, `printer-discovery-${new Date().toISOString().split('T')[0]}.csv`)}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                aria-label="Export as CSV"
                data-cy="export-csv-btn"
                data-testid="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={() => exportToExcel(exportPayload, `printer-discovery-${new Date().toISOString().split('T')[0]}.xlsx`)}
                variant="secondary"
                icon={<FileSpreadsheet className="w-4 h-4" />}
                aria-label="Export as Excel"
                data-cy="export-excel-btn"
                data-testid="export-excel-btn"
              >
                Export Excel
              </Button>
            </>
          )}
          <Button
            onClick={startDiscovery}
            disabled={isDiscovering}
            variant="primary"
            aria-label="Start discovery"
            data-cy="start-discovery-btn"
            data-testid="start-discovery-btn"
          >
            {isDiscovering ? 'Discovering...' : 'Start Discovery'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
          <span className="text-red-800 dark:text-red-200">{error}</span>
          <Button onClick={clearError} variant="ghost" size="sm">
            Dismiss
          </Button>
        </div>
      )}

      {/* Configuration Panel */}
      <div className="mx-6 mt-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setConfigExpanded(!configExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          data-cy="config-toggle"
          data-testid="config-toggle"
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
                label="Include Printers"
                checked={config.includePrinters}
                onChange={(checked) => updateConfig({ includePrinters: checked })}
                data-cy="include-printers-checkbox"
                data-testid="include-printers-checkbox"
              />
              <Checkbox
                label="Include Print Queues"
                checked={config.includePrintQueues}
                onChange={(checked) => updateConfig({ includePrintQueues: checked })}
                data-cy="include-queues-checkbox"
                data-testid="include-queues-checkbox"
              />
              <Checkbox
                label="Include Print Jobs"
                checked={config.includePrintJobs}
                onChange={(checked) => updateConfig({ includePrintJobs: checked })}
                data-cy="include-jobs-checkbox"
                data-testid="include-jobs-checkbox"
              />
              <Checkbox
                label="Include Print Drivers"
                checked={config.includePrintDrivers}
                onChange={(checked) => updateConfig({ includePrintDrivers: checked })}
                data-cy="include-drivers-checkbox"
                data-testid="include-drivers-checkbox"
              />
              <Checkbox
                label="Include Print Servers"
                checked={config.includePrintServers}
                onChange={(checked) => updateConfig({ includePrintServers: checked })}
                data-cy="include-servers-checkbox"
                data-testid="include-servers-checkbox"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timeout (seconds)
              </label>
              <Input
                type="number"
                value={config.timeout}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const next = Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : config.timeout;
                  const clamped = Math.max(60, Math.min(1800, next));
                  updateConfig({ timeout: clamped });
                }}
                min={60}
                max={1800}
                step={60}
                data-cy="timeout-input"
                data-testid="timeout-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 p-6">
          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Printer className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalPrinters ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Printers</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <HardDrive className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.localPrinters ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Local Printers</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Globe className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.networkPrinters ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Network Printers</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Server className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.printServers ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Print Servers</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Check className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.activePrinters ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Active Printers</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.offlinePrinters ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Offline Printers</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Share2 className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.sharedPrinters ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Shared Printers</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Layers className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.printerDrivers ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Printer Drivers</div>
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
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-overview"
            data-testid="tab-overview"
          >
            <Printer className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('local-printers')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'local-printers'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-local-printers"
            data-testid="tab-local-printers"
          >
            <HardDrive className="w-4 h-4" />
            Local Printers
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.localPrinters ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('network-printers')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'network-printers'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-network-printers"
            data-testid="tab-network-printers"
          >
            <Globe className="w-4 h-4" />
            Network Printers
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.networkPrinters ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('print-servers')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'print-servers'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-print-servers"
            data-testid="tab-print-servers"
          >
            <Server className="w-4 h-4" />
            Print Servers
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.printServers ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'drivers'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-drivers"
            data-testid="tab-drivers"
          >
            <Layers className="w-4 h-4" />
            Drivers
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.printerDrivers ?? 0}</span>}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && (!stats || (stats?.totalPrinters ?? 0) === 0) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Printer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Printer Data Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to view printer statistics and insights.</p>
              <Button onClick={startDiscovery} disabled={isDiscovering} variant="primary">
                {isDiscovering ? 'Discovering...' : 'Start Discovery'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && stats && (stats?.totalPrinters ?? 0) > 0 && (
          <div className="space-y-6 overflow-auto">
            {/* Printer Type Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Printer Type Breakdown</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-8 h-8 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Local Printers</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{stats?.localPrinters ?? 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                  <div className="flex items-center gap-3">
                    <Globe className="w-8 h-8 text-cyan-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Network Printers</span>
                  </div>
                  <span className="text-2xl font-bold text-cyan-600">{stats?.networkPrinters ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Printer Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <Check className="w-8 h-8 text-green-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{stats?.activePrinters ?? 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Offline</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{stats?.offlinePrinters ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Sharing Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sharing Configuration</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-40 text-sm font-medium text-gray-700 dark:text-gray-300">Shared Printers</div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-yellow-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium"
                      style={{ width: `${stats?.totalPrinters > 0 ? ((stats?.sharedPrinters ?? 0) / stats.totalPrinters) * 100 : 0}%` }}
                    >
                      {(stats?.sharedPrinters ?? 0) > 0 && `${stats?.sharedPrinters ?? 0}`}
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-600 dark:text-gray-400 text-right">
                    {stats?.totalPrinters > 0 ? (((stats?.sharedPrinters ?? 0) / stats.totalPrinters) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-40 text-sm font-medium text-gray-700 dark:text-gray-300">AD Published</div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-pink-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium"
                      style={{ width: `${stats?.totalPrinters > 0 ? ((stats?.publishedPrinters ?? 0) / stats.totalPrinters) * 100 : 0}%` }}
                    >
                      {(stats?.publishedPrinters ?? 0) > 0 && `${stats?.publishedPrinters ?? 0}`}
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-600 dark:text-gray-400 text-right">
                    {stats?.totalPrinters > 0 ? (((stats?.publishedPrinters ?? 0) / stats.totalPrinters) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'overview' && (
          <>
            {/* Filters */}
            <div className="mb-4">
              <Input
                value={normalizedFilter.searchText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  updateFilter({ searchText: e.target.value });
                }}
                placeholder="Search printers..."
                data-cy="search-input"
                data-testid="search-input"
              />
            </div>

            {/* Data Grid */}
            {filteredData.length > 0 ? (
              <div className="flex-1 overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                <VirtualizedDataGrid
                  data={filteredData}
                  columns={columns}
                  className="ag-theme-alpine"
                  data-cy="printer-grid"
                  data-testid="printer-grid"
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="text-center">
                  <Printer className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No printers found matching your filters.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="Printer Discovery"
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

export default PrinterDiscoveryView;
