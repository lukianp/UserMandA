/**
 * Scheduled Task Discovery View
 * Full-featured discovery interface for Windows Scheduled Tasks
 */

import React, { useEffect } from 'react';
import { Calendar, Download, Play, X, ChevronDown, ChevronRight, Clock } from 'lucide-react';
import { useScheduledTaskDiscoveryLogic, type TabType } from '../../hooks/useScheduledTaskDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';

const ScheduledTaskDiscoveryView: React.FC = () => {
  console.log('[ScheduledTaskDiscoveryView] Component rendering');

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
  } = useScheduledTaskDiscoveryLogic();

  const [configPanelExpanded, setConfigPanelExpanded] = React.useState(false);

  useEffect(() => {
    console.log('[ScheduledTaskDiscoveryView] Component mounted');
  }, []);

  // Tab counts
  const tabCounts = {
    overview: 0,
    tasks: result?.tasks?.length || 0,
    triggers: result?.taskTriggers?.length || 0,
    actions: result?.taskActions?.length || 0,
  };

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="scheduled-task-discovery-view">
      {/* Loading Overlay */}
      {isDiscovering && (
        <LoadingOverlay
          message={progress.message || 'Discovering scheduled tasks...'}
          progress={progress.percentage}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Scheduled Task Discovery
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Discover and analyze Windows scheduled tasks, triggers, and actions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Export Buttons */}
          {result && filteredData.length > 0 && (
            <>
              <button
                onClick={() => exportToCSV(filteredData, `scheduled-tasks-${activeTab}-${Date.now()}.csv`)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                data-cy="export-csv-button"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={() => exportToExcel(filteredData, `scheduled-tasks-${activeTab}-${Date.now()}.xlsx`)}
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
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
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
                  checked={config.includeTasks}
                  onChange={(e) => updateConfig({ includeTasks: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Include Tasks</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.includeTaskTriggers}
                  onChange={(e) => updateConfig({ includeTaskTriggers: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Include Triggers</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.includeTaskActions}
                  onChange={(e) => updateConfig({ includeTaskActions: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Include Actions</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.includeDisabledTasks}
                  onChange={(e) => updateConfig({ includeDisabledTasks: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Include Disabled Tasks</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.includeTaskHistory}
                  onChange={(e) => updateConfig({ includeTaskHistory: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Include Task History</span>
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
        <div className="grid grid-cols-5 gap-4 p-6">
          {/* Total Tasks */}
          <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow text-white">
            <Calendar className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.totalTasks.toLocaleString()}</div>
            <div className="text-sm opacity-90">Total Tasks</div>
          </div>

          {/* Enabled Tasks */}
          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <Play className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.enabledTasks.toLocaleString()}</div>
            <div className="text-sm opacity-90">Enabled</div>
          </div>

          {/* Disabled Tasks */}
          <div className="p-4 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg shadow text-white">
            <X className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.disabledTasks.toLocaleString()}</div>
            <div className="text-sm opacity-90">Disabled</div>
          </div>

          {/* Running Tasks */}
          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <Clock className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.runningTasks.toLocaleString()}</div>
            <div className="text-sm opacity-90">Running</div>
          </div>

          {/* Ready Tasks */}
          <div className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow text-white">
            <Calendar className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.readyTasks.toLocaleString()}</div>
            <div className="text-sm opacity-90">Ready</div>
          </div>

          {/* Microsoft Tasks */}
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <Calendar className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.microsoftTasks.toLocaleString()}</div>
            <div className="text-sm opacity-90">Microsoft</div>
          </div>

          {/* Custom Tasks */}
          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <Calendar className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.customTasks.toLocaleString()}</div>
            <div className="text-sm opacity-90">Custom</div>
          </div>

          {/* System Tasks */}
          <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow text-white">
            <Calendar className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.systemTasks.toLocaleString()}</div>
            <div className="text-sm opacity-90">System</div>
          </div>

          {/* Hidden Tasks */}
          <div className="p-4 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg shadow text-white">
            <Calendar className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.hiddenTasks.toLocaleString()}</div>
            <div className="text-sm opacity-90">Hidden</div>
          </div>

          {/* Failed Tasks */}
          <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow text-white">
            <X className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.failedTasks.toLocaleString()}</div>
            <div className="text-sm opacity-90">Failed</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      {result && (
        <div className="px-6">
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'overview' as TabType, label: 'Overview', count: tabCounts.overview },
              { id: 'tasks' as TabType, label: 'Tasks', count: tabCounts.tasks },
              { id: 'triggers' as TabType, label: 'Triggers', count: tabCounts.triggers },
              { id: 'actions' as TabType, label: 'Actions', count: tabCounts.actions },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400'
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
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Discovery Results
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Click "Start Discovery" to discover scheduled tasks
              </p>
            </div>
          </div>
        ) : activeTab === 'overview' ? (
          // Overview Tab
          <div className="mt-6 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Task State Distribution</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats?.runningTasks}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Running</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{stats?.readyTasks}</div>
                  <div className="text-sm text-cyan-600 dark:text-cyan-400">Ready</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats?.disabledTasks}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Disabled</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Task Categories</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{stats?.microsoftTasks}</div>
                  <div className="text-sm text-indigo-600 dark:text-indigo-400">Microsoft Tasks</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats?.customTasks}</div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">Custom Tasks</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats?.systemTasks}</div>
                  <div className="text-sm text-amber-600 dark:text-amber-400">System Tasks</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Task Health</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats?.enabledTasks}</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Enabled Tasks</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats?.failedTasks}</div>
                  <div className="text-sm text-red-600 dark:text-red-400">Failed Tasks</div>
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
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                data-cy="search-input"
              />
              {activeTab === 'tasks' && (
                <>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filter.showEnabledOnly}
                      onChange={(e) => updateFilter({ showEnabledOnly: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Enabled Only</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filter.showFailedOnly}
                      onChange={(e) => updateFilter({ showFailedOnly: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Failed Only</span>
                  </label>
                </>
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
        scriptName="Scheduled Task Discovery"
        logs={logs.map(log => ({ ...log, level: log.level === 'warn' ? 'warning' : log.level as 'info' | 'success' | 'warning' | 'error' }))}
        isRunning={isDiscovering}
        isCancelling={isCancelling}
        progress={progress ? { percentage: progress.percentage, message: progress.message || 'Processing...' } : undefined}
        onStop={cancelDiscovery}
        onClear={clearLogs}
      />
    </div>
  );
};

export default ScheduledTaskDiscoveryView;


