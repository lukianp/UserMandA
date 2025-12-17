/**
 * Power BI Discovery View
 * UI for discovering Power BI workspaces, reports, and datasets
 */

import { useState } from 'react';
import {
  BarChart,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  PieChart,
  TrendingUp,
  Users,
  Layers,
  Zap,
  Share2
} from 'lucide-react';

import { usePowerBIDiscoveryLogic } from '../../hooks/usePowerBIDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

const PowerBIDiscoveryView: React.FC = () => {
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
    exportToExcel
  } = usePowerBIDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);

  // Normalize filter
  const normalizedFilter = {
    searchText: filter?.searchText ?? '',
    selectedWorkspaces: Array.isArray(filter?.selectedWorkspaces) ? filter.selectedWorkspaces : [],
    showSharedOnly: !!filter?.showSharedOnly,
  };

  // Normalize export payload
  const exportPayload = Array.isArray((result as any)?.data) ? (result as any).data : Array.isArray(result) ? result : [];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="power-bi-discovery-view" data-testid="power-bi-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={typeof progress?.percentage === 'number' ? progress.percentage : 0}
          onCancel={cancelDiscovery || undefined}
          message={progress?.message || 'Discovering Power BI resources...'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <BarChart className="w-8 h-8 text-orange-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Power BI Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover Power BI workspaces, reports, and datasets to assess analytics consolidation opportunities
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {exportPayload.length > 0 && (
            <>
              <Button
                onClick={() => exportToCSV(exportPayload, `powerbi-discovery-${new Date().toISOString().split('T')[0]}.csv`)}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                aria-label="Export as CSV"
                data-cy="export-csv-btn" data-testid="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={() => exportToExcel(exportPayload, `powerbi-discovery-${new Date().toISOString().split('T')[0]}.xlsx`)}
                variant="secondary"
                icon={<FileSpreadsheet className="w-4 h-4" />}
                aria-label="Export as Excel"
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
            aria-label="Start discovery"
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
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
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
            <div className="grid grid-cols-2 gap-4">
              <Checkbox
                label="Include Workspaces"
                checked={config.includeWorkspaces}
                onChange={(checked) => updateConfig({ includeWorkspaces: checked })}
                data-cy="include-workspaces-checkbox" data-testid="include-workspaces-checkbox"
              />
              <Checkbox
                label="Include Reports"
                checked={config.includeReports}
                onChange={(checked) => updateConfig({ includeReports: checked })}
                data-cy="include-reports-checkbox" data-testid="include-reports-checkbox"
              />
              <Checkbox
                label="Include Datasets"
                checked={config.includeDatasets}
                onChange={(checked) => updateConfig({ includeDatasets: checked })}
                data-cy="include-datasets-checkbox" data-testid="include-datasets-checkbox"
              />
              <Checkbox
                label="Include Dashboards"
                checked={config.includeDashboards}
                onChange={(checked) => updateConfig({ includeDashboards: checked })}
                data-cy="include-dashboards-checkbox" data-testid="include-dashboards-checkbox"
              />
              <Checkbox
                label="Include Dataflows"
                checked={config.includeDataflows}
                onChange={(checked) => updateConfig({ includeDataflows: checked })}
                data-cy="include-dataflows-checkbox" data-testid="include-dataflows-checkbox"
              />
              <Checkbox
                label="Include Usage Metrics"
                checked={config.includeUsageMetrics}
                onChange={(checked) => updateConfig({ includeUsageMetrics: checked })}
                data-cy="include-usage-metrics-checkbox" data-testid="include-usage-metrics-checkbox"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timeout (ms)
              </label>
              <Input
                type="number"
                value={config.timeout}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const next = Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : config.timeout;
                  const clamped = Math.max(60000, Math.min(1800000, next));
                  updateConfig({ timeout: clamped });
                }}
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
          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Layers className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalWorkspaces ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Workspaces</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <BarChart className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalReports ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Published Reports</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <PieChart className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalDatasets ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Active Datasets</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalUsers ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Licensed Users</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Zap className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.premiumCapacities ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Premium Capacity</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Share2 className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.sharedDashboards ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Shared Dashboards</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalDataflows ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Dataflows</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <BarChart className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.avgViewsPerReport ?? 0).toFixed(1)}</div>
                <div className="text-sm opacity-90">Avg Views/Report</div>
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
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-overview" data-testid="tab-overview"
          >
            <BarChart className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('workspaces')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'workspaces'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-workspaces" data-testid="tab-workspaces"
          >
            <Layers className="w-4 h-4" />
            Workspaces
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalWorkspaces ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'reports'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-reports" data-testid="tab-reports"
          >
            <BarChart className="w-4 h-4" />
            Reports
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalReports ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('datasets')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'datasets'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-datasets" data-testid="tab-datasets"
          >
            <PieChart className="w-4 h-4" />
            Datasets
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalDatasets ?? 0}</span>}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && (!stats || (stats?.totalWorkspaces ?? 0) === 0) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <BarChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Power BI Data Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to view Power BI workspace statistics and insights.</p>
              <Button onClick={startDiscovery} disabled={isDiscovering} variant="primary">
                {isDiscovering ? 'Discovering...' : 'Start Discovery'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && stats && (stats?.totalWorkspaces ?? 0) > 0 && (
          <div className="space-y-6 overflow-auto">
            {/* Usage Analytics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Usage Analytics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Views</span>
                  <span className="text-lg font-bold text-blue-600">{(stats?.totalViews ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Users</span>
                  <span className="text-lg font-bold text-green-600">{(stats?.activeUsers ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Shared Items</span>
                  <span className="text-lg font-bold text-purple-600">{(stats?.sharedItems ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'overview' && (
          <>
            {/* Filters */}
            <div className="mb-4 space-y-4">
              <Input
                value={normalizedFilter.searchText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  updateFilter({ searchText: e.target.value });
                }}
                placeholder="Search..."
                data-cy="search-input" data-testid="search-input"
              />

              {activeTab === 'reports' && (
                <Checkbox
                  label="Show Shared Reports Only"
                  checked={normalizedFilter.showSharedOnly}
                  onChange={(checked) => updateFilter({ showSharedOnly: checked })}
                  data-cy="show-shared-only-checkbox" data-testid="show-shared-only-checkbox"
                />
              )}
            </div>

            {/* Data Grid */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <VirtualizedDataGrid
                data={Array.isArray(filteredData) ? filteredData as any[] : []}
                columns={Array.isArray(columns) ? columns : []}
                loading={isDiscovering}
                enableColumnReorder
                enableColumnResize
                data-cy={isDiscovering ? "grid-loading" : undefined}
              />
            </div>
          </>
        )}
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="Power BI Discovery"
        scriptDescription="Discovering Power BI workspaces, reports, and datasets"
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

export default PowerBIDiscoveryView;
