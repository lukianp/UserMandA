import { useState } from 'react';
import {
  Network,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Activity,
  Shield,
  Lock,
  Users,
  Mail,
  FileText,
  TrendingUp,
  BarChart3
} from 'lucide-react';

import { useGraphDiscoveryLogic } from '../../hooks/useGraphDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

const GraphDiscoveryView: React.FC = () => {
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
  } = useGraphDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);

  const normalizedFilter = {
    selectedResourceTypes: Array.isArray(filter?.selectedResourceTypes) ? filter.selectedResourceTypes : [],
    selectedPermissions: Array.isArray(filter?.selectedPermissions) ? filter.selectedPermissions : [],
    searchText: filter?.searchText ?? '',
    showHighUsageOnly: !!filter?.showHighUsageOnly,
  };

  const resourcesByType = stats?.resourcesByType && typeof stats.resourcesByType === 'object' ? stats.resourcesByType : {};
  const apiUsageByEndpoint = stats?.apiUsageByEndpoint && typeof stats.apiUsageByEndpoint === 'object' ? stats.apiUsageByEndpoint : {};
  const topPermissions = Array.isArray(stats?.topPermissions) ? stats.topPermissions : [];

  const exportPayload = Array.isArray((result as any)?.data) ? (result as any).data : Array.isArray(result) ? result : [];

  const resourceTypes = ['Users', 'Groups', 'Applications', 'Devices', 'Mail', 'Calendar', 'Teams', 'OneDrive'];
  const permissions = ['User.Read', 'Mail.Read', 'Files.ReadWrite', 'Group.ReadWrite.All', 'Directory.ReadWrite.All'];

  const toggleResourceType = (type: string) => {
    const current = normalizedFilter.selectedResourceTypes;
    const updated = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
    updateFilter({ selectedResourceTypes: updated });
  };

  const togglePermission = (permission: string) => {
    const current = normalizedFilter.selectedPermissions;
    const updated = current.includes(permission) ? current.filter(p => p !== permission) : [...current, permission];
    updateFilter({ selectedPermissions: updated });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="graph-discovery-view" data-testid="graph-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={typeof progress?.percentage === 'number' ? progress.percentage : 0}
          onCancel={cancelDiscovery || undefined}
          message={progress?.message || 'Discovering Microsoft Graph resources...'}
        />
      )}

      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Network className="w-8 h-8 text-teal-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Microsoft Graph Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover Microsoft Graph API usage, permissions, and resources to optimize API consumption and security
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {exportPayload.length > 0 && (
            <>
              <Button
                onClick={() => exportToCSV(exportPayload, `graph-discovery-${new Date().toISOString().split('T')[0]}.csv`)}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                data-cy="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={() => exportToExcel(exportPayload, `graph-discovery-${new Date().toISOString().split('T')[0]}.xlsx`)}
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
                label="Include API Usage Statistics"
                checked={config.includeUsageStats}
                onChange={(checked) => updateConfig({ includeUsageStats: checked })}
                data-cy="include-usage-checkbox"
              />
              <Checkbox
                label="Include Permissions"
                checked={config.includePermissions}
                onChange={(checked) => updateConfig({ includePermissions: checked })}
                data-cy="include-permissions-checkbox"
              />
              <Checkbox
                label="Include Resource Consumption"
                checked={config.includeResourceConsumption}
                onChange={(checked) => updateConfig({ includeResourceConsumption: checked })}
                data-cy="include-consumption-checkbox"
              />
              <Checkbox
                label="Analyze Rate Limiting"
                checked={config.analyzeRateLimiting}
                onChange={(checked) => updateConfig({ analyzeRateLimiting: checked })}
                data-cy="analyze-rate-checkbox"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timeout (ms)</label>
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
                data-cy="timeout-input"
              />
            </div>
          </div>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-4 p-6">
          <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Network className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalResources ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Resources</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Activity className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.apiCalls ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">API Calls/Day</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Lock className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalPermissions ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Permissions</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.applications ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Applications</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Mail className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.mailboxes ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Mailboxes</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <FileText className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.driveItems ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Drive Items</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.throttledRequests ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Throttled Requests</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <BarChart3 className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(typeof stats?.healthScore === 'number' ? stats.healthScore : 0).toFixed(0)}%</div>
                <div className="text-sm opacity-90">Health Score</div>
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
              activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-overview"
          >
            <Network className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'resources' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-resources"
          >
            <FileText className="w-4 h-4" />
            Resources
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalResources ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('api-usage')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'api-usage' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-api-usage"
          >
            <Activity className="w-4 h-4" />
            API Usage
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'permissions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-permissions"
          >
            <Lock className="w-4 h-4" />
            Permissions
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalPermissions ?? 0}</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && (!stats || (stats?.totalResources ?? 0) === 0) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Network className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Graph Data Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to view Microsoft Graph usage and insights.</p>
              <Button onClick={startDiscovery} disabled={isDiscovering} variant="primary">
                {isDiscovering ? 'Discovering...' : 'Start Discovery'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && stats && (stats?.totalResources ?? 0) > 0 && (
          <div className="space-y-6 overflow-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resources by Type</h3>
              <div className="space-y-3">
                {Object.entries(resourcesByType).map(([type, count]) => {
                  const countNum = typeof count === 'number' ? count : 0;
                  return (
                  <div key={type} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">{type}</div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-teal-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium"
                        style={{ width: `${typeof stats?.totalResources === 'number' && stats.totalResources > 0 ? (countNum / stats.totalResources) * 100 : 0}%` }}
                      >
                        {countNum > 0 && `${countNum}`}
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-600 dark:text-gray-400 text-right">
                      {typeof stats?.totalResources === 'number' && stats.totalResources > 0 ? ((countNum / stats.totalResources) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                )})}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">API Usage by Endpoint</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(apiUsageByEndpoint).map(([endpoint, calls]) => {
                  const callsNum = typeof calls === 'number' ? calls : 0;
                  return (
                  <div key={endpoint} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{endpoint}</span>
                    <span className="text-lg font-bold text-teal-600">{callsNum.toLocaleString()}</span>
                  </div>
                )})}
              </div>
            </div>

            {topPermissions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most Used Permissions</h3>
                <div className="space-y-2">
                  {topPermissions.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{index + 1}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.permission}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{item.count} apps</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab !== 'overview' && (
          <>
            <div className="mb-4 space-y-4">
              <Input
                value={normalizedFilter.searchText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  setTimeout(() => updateFilter({ searchText: value }), 150);
                }}
                placeholder="Search..."
                data-cy="search-input"
              />
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Resource Type</label>
                  <div className="flex flex-wrap gap-2">
                    {resourceTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => toggleResourceType(type)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          normalizedFilter.selectedResourceTypes.includes(type) ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                        data-cy={`filter-type-${type.toLowerCase()}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <Checkbox
                  label="Show High Usage Resources Only"
                  checked={normalizedFilter.showHighUsageOnly}
                  onChange={(checked) => updateFilter({ showHighUsageOnly: checked })}
                  data-cy="show-high-usage-checkbox"
                />
              </div>
            </div>

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

      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="Microsoft Graph Discovery"
        scriptDescription="Discovering Graph API usage, permissions, and resource consumption"
        logs={logs}
        isRunning={isDiscovering}
        isCancelling={isCancelling}
        progress={progress ? { percentage: progress.percentage || 0, message: progress.message || 'Processing...' } : undefined}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
    </div>
  );
};

export default GraphDiscoveryView;
