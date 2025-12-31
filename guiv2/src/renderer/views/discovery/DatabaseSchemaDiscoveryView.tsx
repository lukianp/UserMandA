/**
 * Database Schema Discovery View
 * UI for discovering database schemas, tables, and stored procedures
 */

import { useState } from 'react';
import {
  Database,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Table,
  FileText,
  HardDrive,
  Box,
  Layers,
  Activity
} from 'lucide-react';

import { useDatabaseSchemaDiscoveryLogic } from '../../hooks/useDatabaseSchemaDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

const DatabaseSchemaDiscoveryView: React.FC = () => {
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
  } = useDatabaseSchemaDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);

  // Normalize filter
  const normalizedFilter = {
    searchText: filter?.searchText ?? '',
    selectedDatabases: Array.isArray(filter?.selectedDatabases) ? filter.selectedDatabases : [],
    selectedSchemas: Array.isArray(filter?.selectedSchemas) ? filter.selectedSchemas : [],
  };

  // Normalize export payload
  const exportPayload = Array.isArray((result as any)?.data) ? (result as any).data : Array.isArray(result) ? result : [];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="database-schema-discovery-view" data-testid="database-schema-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={typeof progress?.percentage === 'number' ? progress.percentage : 0}
          onCancel={cancelDiscovery || undefined}
          message={progress?.message || 'Discovering database schemas...'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Database Schema Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover database schemas, tables, and stored procedures to understand data architecture and migration complexity
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {exportPayload.length > 0 && (
            <>
              <Button
                onClick={() => exportToCSV(exportPayload, `database-schema-discovery-${new Date().toISOString().split('T')[0]}.csv`)}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                aria-label="Export as CSV"
                data-cy="export-csv-btn" data-testid="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={() => exportToExcel(exportPayload, `database-schema-discovery-${new Date().toISOString().split('T')[0]}.xlsx`)}
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
                label="Include Tables"
                checked={config.includeTables}
                onChange={(checked) => updateConfig({ includeTables: checked })}
                data-cy="include-tables-checkbox" data-testid="include-tables-checkbox"
              />
              <Checkbox
                label="Include Views"
                checked={config.includeViews}
                onChange={(checked) => updateConfig({ includeViews: checked })}
                data-cy="include-views-checkbox" data-testid="include-views-checkbox"
              />
              <Checkbox
                label="Include Stored Procedures"
                checked={config.includeStoredProcedures}
                onChange={(checked) => updateConfig({ includeStoredProcedures: checked })}
                data-cy="include-stored-procedures-checkbox" data-testid="include-stored-procedures-checkbox"
              />
              <Checkbox
                label="Include Functions"
                checked={config.includeFunctions}
                onChange={(checked) => updateConfig({ includeFunctions: checked })}
                data-cy="include-functions-checkbox" data-testid="include-functions-checkbox"
              />
              <Checkbox
                label="Include Triggers"
                checked={config.includeTriggers}
                onChange={(checked) => updateConfig({ includeTriggers: checked })}
                data-cy="include-triggers-checkbox" data-testid="include-triggers-checkbox"
              />
              <Checkbox
                label="Include Indexes"
                checked={config.includeIndexes}
                onChange={(checked) => updateConfig({ includeIndexes: checked })}
                data-cy="include-indexes-checkbox" data-testid="include-indexes-checkbox"
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
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Database className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalDatabases ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Databases</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Table className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalTables ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Tables</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <FileText className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalStoredProcedures ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Stored Procedures</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <HardDrive className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalSizeGB ?? 0).toFixed(1)}</div>
                <div className="text-sm opacity-90">Total Size (GB)</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Box className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalViews ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Views</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Layers className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalIndexes ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Indexes</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Activity className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalFunctions ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Functions</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Database className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats?.largestDatabase ?? 'N/A'}</div>
                <div className="text-sm opacity-90">Largest Database</div>
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
            <Database className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('databases')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'databases'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-databases" data-testid="tab-databases"
          >
            <Database className="w-4 h-4" />
            Databases
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalDatabases ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'tables'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-tables" data-testid="tab-tables"
          >
            <Table className="w-4 h-4" />
            Tables
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalTables ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('stored-procedures')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'stored-procedures'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-stored-procedures" data-testid="tab-stored-procedures"
          >
            <FileText className="w-4 h-4" />
            Stored Procedures
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalStoredProcedures ?? 0}</span>}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && (!stats || (stats?.totalDatabases ?? 0) === 0) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Database Schema Data Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to view database schema statistics and insights.</p>
              <Button onClick={startDiscovery} disabled={isDiscovering} variant="primary">
                {isDiscovering ? 'Discovering...' : 'Start Discovery'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && stats && (stats?.totalDatabases ?? 0) > 0 && (
          <div className="space-y-6 overflow-auto">
            {/* Schema Complexity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schema Complexity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Objects</span>
                  <span className="text-lg font-bold text-blue-600">
                    {((stats?.totalTables ?? 0) + (stats?.totalViews ?? 0) + (stats?.totalStoredProcedures ?? 0) + (stats?.totalFunctions ?? 0)).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg Objects per DB</span>
                  <span className="text-lg font-bold text-green-600">
                    {stats?.totalDatabases ? Math.round(((stats?.totalTables ?? 0) + (stats?.totalViews ?? 0)) / stats.totalDatabases) : 0}
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
        scriptName="Database Schema Discovery"
        scriptDescription="Discovering database schemas, tables, and stored procedures"
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

export default DatabaseSchemaDiscoveryView;


