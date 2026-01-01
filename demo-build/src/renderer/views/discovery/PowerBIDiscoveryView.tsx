/**
 * Power BI Discovery View
 * Full-featured discovery interface for Power BI workspaces, reports, datasets, and dashboards
 */

import React, { useEffect } from 'react';
import { BarChart3, Download, Play, X, Database, FileText, LayoutDashboard, GitFork } from 'lucide-react';
import { usePowerBIDiscoveryLogic, type TabType } from '../../hooks/usePowerBIDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';

const PowerBIDiscoveryView: React.FC = () => {
  console.log('[PowerBIDiscoveryView] Component rendering');

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
    setActiveTab,
    updateFilter,
    clearError,
    exportToCSV,
    exportToExcel,
  } = usePowerBIDiscoveryLogic();

  useEffect(() => {
    console.log('[PowerBIDiscoveryView] Component mounted');
  }, []);

  // Tab counts
  const tabCounts = {
    overview: 0,
    workspaces: result?.Workspaces?.length || 0,
    reports: result?.Reports?.length || 0,
    datasets: result?.Datasets?.length || 0,
    dashboards: result?.Dashboards?.length || 0,
    dataflows: result?.Dataflows?.length || 0,
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="powerbi-discovery-view">
      {/* Loading Overlay */}
      {isDiscovering && (
        <LoadingOverlay
          message={progress.message || 'Discovering Power BI environment...'}
          progress={progress.percentage}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Power BI Discovery
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Discover and analyze Power BI workspaces, reports, datasets, and dashboards
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Export Buttons */}
          {result && filteredData.length > 0 && (
            <>
              <button
                onClick={() => exportToCSV(filteredData, `power-bi-${activeTab}-${Date.now()}.csv`)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                data-cy="export-csv-button"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={() => exportToExcel(filteredData, `power-bi-${activeTab}-${Date.now()}.xlsx`)}
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
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
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
        <div className="grid grid-cols-4 gap-4 p-6">
          {/* Total Workspaces */}
          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <LayoutDashboard className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.totalWorkspaces.toLocaleString()}</div>
            <div className="text-sm opacity-90">Total Workspaces</div>
          </div>

          {/* Personal Workspaces */}
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <LayoutDashboard className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.personalWorkspaces.toLocaleString()}</div>
            <div className="text-sm opacity-90">Personal</div>
          </div>

          {/* Group Workspaces */}
          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <LayoutDashboard className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.groupWorkspaces.toLocaleString()}</div>
            <div className="text-sm opacity-90">Group</div>
          </div>

          {/* Total Reports */}
          <div className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow text-white">
            <FileText className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.totalReports.toLocaleString()}</div>
            <div className="text-sm opacity-90">Reports</div>
          </div>

          {/* Total Datasets */}
          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <Database className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.totalDatasets.toLocaleString()}</div>
            <div className="text-sm opacity-90">Datasets</div>
          </div>

          {/* Total Dashboards */}
          <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow text-white">
            <BarChart3 className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.totalDashboards.toLocaleString()}</div>
            <div className="text-sm opacity-90">Dashboards</div>
          </div>

          {/* Total Dataflows */}
          <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow text-white">
            <GitFork className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.totalDataflows.toLocaleString()}</div>
            <div className="text-sm opacity-90">Dataflows</div>
          </div>

          {/* Total Users */}
          <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow text-white">
            <BarChart3 className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <div className="text-sm opacity-90">Users</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      {result && (
        <div className="px-6">
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'overview' as TabType, label: 'Overview', count: tabCounts.overview },
              { id: 'workspaces' as TabType, label: 'Workspaces', count: tabCounts.workspaces },
              { id: 'reports' as TabType, label: 'Reports', count: tabCounts.reports },
              { id: 'datasets' as TabType, label: 'Datasets', count: tabCounts.datasets },
              { id: 'dashboards' as TabType, label: 'Dashboards', count: tabCounts.dashboards },
              { id: 'dataflows' as TabType, label: 'Dataflows', count: tabCounts.dataflows },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
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
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Discovery Results
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Click "Start Discovery" to discover Power BI environment
              </p>
            </div>
          </div>
        ) : activeTab === 'overview' ? (
          // Overview Tab
          <div className="mt-6 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Workspace Distribution</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats?.totalWorkspaces}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Total Workspaces</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{stats?.personalWorkspaces}</div>
                  <div className="text-sm text-indigo-600 dark:text-indigo-400">Personal Workspaces</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats?.groupWorkspaces}</div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">Group Workspaces</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Content Inventory</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{stats?.totalReports}</div>
                  <div className="text-sm text-cyan-600 dark:text-cyan-400">Reports</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats?.totalDatasets}</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Datasets</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats?.totalDashboards}</div>
                  <div className="text-sm text-amber-600 dark:text-amber-400">Dashboards</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">{stats?.totalDataflows}</div>
                  <div className="text-sm text-teal-600 dark:text-teal-400">Dataflows</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">User Activity</h3>
              <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg">
                <div className="text-2xl font-bold text-pink-700 dark:text-pink-300">{stats?.totalUsers}</div>
                <div className="text-sm text-pink-600 dark:text-pink-400">Total Users</div>
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
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-cy="search-input"
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow" style={{ height: 'calc(100vh - 450px)' }}>
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
        scriptName="Power BI Discovery"
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

export default PowerBIDiscoveryView;


