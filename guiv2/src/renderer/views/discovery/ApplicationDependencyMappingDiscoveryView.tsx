/**
 * Application Dependency Mapping Discovery View
 * UI for discovering application dependencies and relationships
 */

import { useState } from 'react';
import {
  Network,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  GitBranch,
  Link,
  AlertTriangle,
  Package,
  Layers,
  Activity
} from 'lucide-react';

import { useApplicationDependencyMappingDiscoveryLogic } from '../../hooks/useApplicationDependencyMappingDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

const ApplicationDependencyMappingDiscoveryView: React.FC = () => {
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
  } = useApplicationDependencyMappingDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);

  // Normalize filter
  const normalizedFilter = {
    searchText: filter?.searchText ?? '',
    showCriticalOnly: !!filter?.showCriticalOnly,
    selectedApplications: Array.isArray(filter?.selectedApplications) ? filter.selectedApplications : [],
  };

  // Normalize export payload
  const exportPayload = Array.isArray((result as any)?.data) ? (result as any).data : Array.isArray(result) ? result : [];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="application-dependency-mapping-discovery-view" data-testid="application-dependency-mapping-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={typeof progress?.percentage === 'number' ? progress.percentage : 0}
          onCancel={cancelDiscovery || undefined}
          message={progress?.message || 'Mapping application dependencies...'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Network className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Application Dependency Mapping</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Map application dependencies and relationships to identify integration points and migration risks
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {exportPayload.length > 0 && (
            <>
              <Button
                onClick={() => exportToCSV(exportPayload, `app-dependency-mapping-${new Date().toISOString().split('T')[0]}.csv`)}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                aria-label="Export as CSV"
                data-cy="export-csv-btn" data-testid="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={() => exportToExcel(exportPayload, `app-dependency-mapping-${new Date().toISOString().split('T')[0]}.xlsx`)}
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
                label="Include Network Dependencies"
                checked={config.includeNetworkDependencies}
                onChange={(checked) => updateConfig({ includeNetworkDependencies: checked })}
                data-cy="include-network-deps-checkbox" data-testid="include-network-deps-checkbox"
              />
              <Checkbox
                label="Include Database Dependencies"
                checked={config.includeDatabaseDependencies}
                onChange={(checked) => updateConfig({ includeDatabaseDependencies: checked })}
                data-cy="include-db-deps-checkbox" data-testid="include-db-deps-checkbox"
              />
              <Checkbox
                label="Include API Endpoints"
                checked={config.includeAPIEndpoints}
                onChange={(checked) => updateConfig({ includeAPIEndpoints: checked })}
                data-cy="include-api-endpoints-checkbox" data-testid="include-api-endpoints-checkbox"
              />
              <Checkbox
                label="Include Service Dependencies"
                checked={config.includeServiceDependencies}
                onChange={(checked) => updateConfig({ includeServiceDependencies: checked })}
                data-cy="include-service-deps-checkbox" data-testid="include-service-deps-checkbox"
              />
              <Checkbox
                label="Include File Dependencies"
                checked={config.includeFileDependencies}
                onChange={(checked) => updateConfig({ includeFileDependencies: checked })}
                data-cy="include-file-deps-checkbox" data-testid="include-file-deps-checkbox"
              />
              <Checkbox
                label="Analyze Circular Dependencies"
                checked={config.analyzeCircularDependencies}
                onChange={(checked) => updateConfig({ analyzeCircularDependencies: checked })}
                data-cy="analyze-circular-deps-checkbox" data-testid="analyze-circular-deps-checkbox"
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
          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Package className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalApplications ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Applications Mapped</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <GitBranch className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalDependencies ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Dependencies</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.criticalDependencies ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Critical Dependencies</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Network className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.orphanedApplications ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Orphaned Apps</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Layers className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.maxDependencyDepth ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Dependency Depth</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Activity className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.circularDependencies ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Circular Dependencies</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Link className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalIntegrationPoints ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Integration Points</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Package className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.avgDependenciesPerApp ?? 0).toFixed(1)}</div>
                <div className="text-sm opacity-90">Avg Dependencies/App</div>
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
            <Network className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'applications'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-applications" data-testid="tab-applications"
          >
            <Package className="w-4 h-4" />
            Applications
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalApplications ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('dependencies')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'dependencies'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-dependencies" data-testid="tab-dependencies"
          >
            <GitBranch className="w-4 h-4" />
            Dependencies
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalDependencies ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('critical-paths')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'critical-paths'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-critical-paths" data-testid="tab-critical-paths"
          >
            <AlertTriangle className="w-4 h-4" />
            Critical Paths
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.criticalDependencies ?? 0}</span>}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && (!stats || (stats?.totalApplications ?? 0) === 0) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Network className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Dependency Mapping Data Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to view application dependency maps and insights.</p>
              <Button onClick={startDiscovery} disabled={isDiscovering} variant="primary">
                {isDiscovering ? 'Discovering...' : 'Start Discovery'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && stats && (stats?.totalApplications ?? 0) > 0 && (
          <div className="space-y-6 overflow-auto">
            {/* Dependency Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dependency Analysis</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Relationships</span>
                  <span className="text-lg font-bold text-blue-600">{(stats?.totalDependencies ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Risk Score</span>
                  <span className={`text-lg font-bold ${(stats?.riskScore ?? 0) > 70 ? 'text-red-600' : (stats?.riskScore ?? 0) > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {(stats?.riskScore ?? 0).toFixed(1)}%
                  </span>
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

              {activeTab === 'dependencies' && (
                <Checkbox
                  label="Show Critical Dependencies Only"
                  checked={normalizedFilter.showCriticalOnly}
                  onChange={(checked) => updateFilter({ showCriticalOnly: checked })}
                  data-cy="show-critical-only-checkbox" data-testid="show-critical-only-checkbox"
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
        scriptName="Application Dependency Mapping"
        scriptDescription="Mapping application dependencies and relationships"
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

export default ApplicationDependencyMappingDiscoveryView;
