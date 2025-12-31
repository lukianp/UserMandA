/**
 * Web Server Configuration Discovery View
 * Full-featured discovery interface for IIS, Apache, and Nginx web servers
 */

import React, { useEffect } from 'react';
import { Server, Download, Play, X, ChevronDown, ChevronRight, Globe, Shield, Layers } from 'lucide-react';
import { useWebServerConfigDiscoveryLogic, type TabType } from '../../hooks/useWebServerConfigDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';

const WebServerConfigDiscoveryView: React.FC = () => {
  console.log('[WebServerConfigDiscoveryView] Component rendering');

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
  } = useWebServerConfigDiscoveryLogic();

  const [configPanelExpanded, setConfigPanelExpanded] = React.useState(false);

  useEffect(() => {
    console.log('[WebServerConfigDiscoveryView] Component mounted');
  }, []);

  // Tab counts
  const tabCounts = {
    overview: 0,
    'iis-sites': result?.iisSites?.length || 0,
    'app-pools': result?.iisAppPools?.length || 0,
    bindings: result?.iisBindings?.length || 0,
    certificates: result?.sslCertificates?.length || 0,
    apache: result?.apacheVHosts?.length || 0,
    nginx: result?.nginxServers?.length || 0,
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="webserverconfig-discovery-view">
      {/* Loading Overlay */}
      {isDiscovering && (
        <LoadingOverlay
          message={progress.message || 'Discovering web server configurations...'}
          progress={progress.percentage}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
            <Server className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Web Server Configuration Discovery
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Discover and analyze IIS sites, app pools, bindings, and SSL certificates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Export Buttons */}
          {result && filteredData.length > 0 && (
            <>
              <button
                onClick={() => exportToCSV(filteredData, `webserver-${activeTab}-${Date.now()}.csv`)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                data-cy="export-csv-button"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={() => exportToExcel(filteredData, `webserver-${activeTab}-${Date.now()}.xlsx`)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                data-cy="export-excel-button"
              >
                <Download className="w-4 h-4" />
                Export Excel
              </button>
            </>
          )}

          {/* Start Discovery Button */}
          {!isDiscovering ? (
            <button
              onClick={() => {
                clearLogs();
                setShowExecutionDialog(true);
                startDiscovery();
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
              data-cy="start-discovery-button"
            >
              <Play className="w-5 h-5" />
              Start Discovery
            </button>
          ) : (
            <button
              onClick={cancelDiscovery}
              disabled={isCancelling}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              data-cy="cancel-discovery-button"
            >
              <X className="w-5 h-5" />
              {isCancelling ? 'Cancelling...' : 'Cancel'}
            </button>
          )}
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="mx-6 mt-4">
        <button
          onClick={() => setConfigPanelExpanded(!configPanelExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          {configPanelExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          Configuration Options
        </button>

        {configPanelExpanded && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="grid grid-cols-3 gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.includeIISSites}
                  onChange={(e) => updateConfig({ includeIISSites: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Include IIS Sites</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.includeIISAppPools}
                  onChange={(e) => updateConfig({ includeIISAppPools: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Include App Pools</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.includeIISBindings}
                  onChange={(e) => updateConfig({ includeIISBindings: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Include Bindings</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.includeSSLCertificates}
                  onChange={(e) => updateConfig({ includeSSLCertificates: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Include SSL Certificates</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.includeApacheVHosts}
                  onChange={(e) => updateConfig({ includeApacheVHosts: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Include Apache VHosts</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.includeNginxServers}
                  onChange={(e) => updateConfig({ includeNginxServers: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Include Nginx Servers</span>
              </label>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 dark:text-gray-300">Timeout (seconds):</span>
                <input
                  type="number"
                  value={config.timeout}
                  onChange={(e) => updateConfig({ timeout: parseInt(e.target.value) || 600 })}
                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  min="60"
                  max="3600"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <X className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
            <button onClick={clearError} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-6 gap-4 p-6">
          {/* Total IIS Sites */}
          <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow text-white">
            <Globe className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.totalIISSites.toLocaleString()}</div>
            <div className="text-sm opacity-90">IIS Sites</div>
          </div>

          {/* Running Sites */}
          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <Play className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.runningIISSites.toLocaleString()}</div>
            <div className="text-sm opacity-90">Running</div>
          </div>

          {/* Stopped Sites */}
          <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow text-white">
            <X className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.stoppedIISSites.toLocaleString()}</div>
            <div className="text-sm opacity-90">Stopped</div>
          </div>

          {/* Total App Pools */}
          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <Layers className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.totalAppPools.toLocaleString()}</div>
            <div className="text-sm opacity-90">App Pools</div>
          </div>

          {/* Total Bindings */}
          <div className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow text-white">
            <Server className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.totalBindings.toLocaleString()}</div>
            <div className="text-sm opacity-90">Bindings</div>
          </div>

          {/* HTTPS Bindings */}
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <Shield className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.httpsBindings.toLocaleString()}</div>
            <div className="text-sm opacity-90">HTTPS</div>
          </div>

          {/* SSL Certificates */}
          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <Shield className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.totalSSLCertificates.toLocaleString()}</div>
            <div className="text-sm opacity-90">SSL Certs</div>
          </div>

          {/* Expired Certificates */}
          <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow text-white">
            <X className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.expiredCertificates.toLocaleString()}</div>
            <div className="text-sm opacity-90">Expired Certs</div>
          </div>

          {/* Apache VHosts */}
          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <Server className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.apacheVHosts.toLocaleString()}</div>
            <div className="text-sm opacity-90">Apache</div>
          </div>

          {/* Nginx Servers */}
          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <Server className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.nginxServers.toLocaleString()}</div>
            <div className="text-sm opacity-90">Nginx</div>
          </div>

          {/* Running App Pools */}
          <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow text-white">
            <Play className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.runningAppPools.toLocaleString()}</div>
            <div className="text-sm opacity-90">Running Pools</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      {result && (
        <div className="px-6">
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'overview' as TabType, label: 'Overview', count: tabCounts.overview },
              { id: 'iis-sites' as TabType, label: 'IIS Sites', count: tabCounts['iis-sites'] },
              { id: 'app-pools' as TabType, label: 'App Pools', count: tabCounts['app-pools'] },
              { id: 'bindings' as TabType, label: 'Bindings', count: tabCounts.bindings },
              { id: 'certificates' as TabType, label: 'SSL Certificates', count: tabCounts.certificates },
              { id: 'apache' as TabType, label: 'Apache', count: tabCounts.apache },
              { id: 'nginx' as TabType, label: 'Nginx', count: tabCounts.nginx },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                data-cy={`tab-${tab.id}`}
              >
                {tab.label}
                {tab.id !== 'overview' && <span className="ml-2 text-xs opacity-75">({tab.count})</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        {!result ? (
          // Empty State
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Server className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Discovery Results
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Click "Start Discovery" to discover web server configurations
              </p>
            </div>
          </div>
        ) : activeTab === 'overview' ? (
          // Overview Tab
          <div className="mt-6 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">IIS Sites Distribution</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats?.totalIISSites}</div>
                  <div className="text-sm text-emerald-600 dark:text-emerald-400">Total Sites</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats?.runningIISSites}</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Running Sites</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats?.stoppedIISSites}</div>
                  <div className="text-sm text-red-600 dark:text-red-400">Stopped Sites</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">SSL Security</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{stats?.httpsBindings}</div>
                  <div className="text-sm text-indigo-600 dark:text-indigo-400">HTTPS Bindings</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats?.totalSSLCertificates}</div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">SSL Certificates</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats?.expiredCertificates}</div>
                  <div className="text-sm text-amber-600 dark:text-amber-400">Expired Certificates</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Application Pools & Servers</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats?.totalAppPools}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">App Pools</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">{stats?.runningAppPools}</div>
                  <div className="text-sm text-teal-600 dark:text-teal-400">Running Pools</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats?.apacheVHosts}</div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Apache VHosts</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats?.nginxServers}</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Nginx Servers</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Data Grid Tabs
          <div className="mt-6">
            <div className="mb-4 flex items-center gap-4">
              <input
                type="text"
                placeholder="Search..."
                value={filter.searchText}
                onChange={(e) => updateFilter({ searchText: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                data-cy="search-input"
              />
              {activeTab === 'bindings' && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filter.showHttpsOnly}
                    onChange={(e) => updateFilter({ showHttpsOnly: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">HTTPS Only</span>
                </label>
              )}
              {activeTab === 'certificates' && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filter.showExpiredCerts}
                    onChange={(e) => updateFilter({ showExpiredCerts: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Expired Only</span>
                </label>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow" style={{ height: 'calc(100vh - 500px)' }}>
              <VirtualizedDataGrid
                data={filteredData}
                columns={columns}
                loading={isDiscovering}
              />
            </div>
          </div>
        )}
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => setShowExecutionDialog(false)}
        scriptName="Web Server Configuration Discovery"
        logs={logs}
        isRunning={isDiscovering}
        isCancelling={isCancelling}
        progress={progress ? { percentage: progress.percentage, message: progress.message } : undefined}
        onStop={cancelDiscovery}
        onClear={clearLogs}
      />
    </div>
  );
};

export default WebServerConfigDiscoveryView;


