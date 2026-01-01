import { useState } from 'react';
import {
  Shield,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  ShieldCheck,
  ShieldAlert,
  Users,
  Lock
} from 'lucide-react';

import { useConditionalAccessDiscoveryLogic } from '../../hooks/useConditionalAccessDiscoveryLogic';
import type { PolicyState } from '../../types/models/conditionalaccess';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

const ConditionalAccessDiscoveryView: React.FC = () => {
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
    exportToCSV,
    exportToExcel
  } = useConditionalAccessDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);

  const policyStates = ['enabled', 'disabled', 'enabledForReportingButNotEnforced'];

  const togglePolicyState = (state: PolicyState) => {
    const current = filter.selectedStates || [];
    const updated = current.includes(state)
      ? current.filter(s => s !== state)
      : [...current, state];
    updateFilter({ selectedStates: updated });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="conditional-access-discovery-view" data-testid="conditional-access-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={typeof progress?.percentage === 'number' ? progress.percentage : 0}
          onCancel={cancelDiscovery || undefined}
          message={progress?.message || 'Discovering Conditional Access policies...'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conditional Access Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Analyze Conditional Access policies, assignments, and user impact assessment
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {result && (result.policies?.length || 0) > 0 && (
            <>
              <Button
                onClick={exportToCSV}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                aria-label="Export as CSV"
                data-cy="export-csv-btn" data-testid="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={exportToExcel}
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
          <Button onClick={() => updateFilter({ searchText: '' })} variant="ghost" size="sm">Dismiss</Button>
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
            <div className="grid grid-cols-3 gap-4">
              <Checkbox
                label="Include Assignments"
                checked={config.includeAssignments ?? true}
                onChange={(checked) => updateConfig({ includeAssignments: checked })}
                data-cy="include-assignments-checkbox" data-testid="include-assignments-checkbox"
              />
              <Checkbox
                label="Include Conditions"
                checked={config.includeConditions ?? true}
                onChange={(checked) => updateConfig({ includeConditions: checked })}
                data-cy="include-conditions-checkbox" data-testid="include-conditions-checkbox"
              />
              <Checkbox
                label="Include Controls"
                checked={config.includeControls ?? true}
                onChange={(checked) => updateConfig({ includeControls: checked })}
                data-cy="include-controls-checkbox" data-testid="include-controls-checkbox"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timeout (ms)
              </label>
              <Input
                type="number"
                value={config.timeout ?? 300000}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = Number(e.target.value);
                  if (value >= 60000) updateConfig({ timeout: value });
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
          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats.totalPolicies || 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Policies</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <ShieldCheck className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats.enabledPolicies || 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Enabled Policies</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <ShieldAlert className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats.reportOnlyPolicies || 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Report Only</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Lock className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats.policiesByCondition?.['With MFA'] || 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">MFA Required</div>
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
            Overview
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'policies'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-policies" data-testid="tab-policies"
          >
            <Shield className="w-4 h-4" />
            Policies
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats.totalPolicies || 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'locations'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-locations" data-testid="tab-locations"
          >
            Named Locations
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && (!stats || (stats.totalPolicies || 0) === 0) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Conditional Access Data Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to view policy analysis and user impact.</p>
              <Button onClick={startDiscovery} disabled={isDiscovering} variant="primary">
                {isDiscovering ? 'Discovering...' : 'Start Discovery'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && stats && (stats.totalPolicies || 0) > 0 && (
          <div className="space-y-6 overflow-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Policy Distribution</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(stats.policiesByCondition || {}).map(([condition, count]) => (
                  <div key={condition} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{condition}</span>
                    <span className="text-lg font-bold text-blue-600">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'overview' && (
          <>
            {/* Filters */}
            <div className="mb-4 space-y-4">
              <Input
                value={filter.searchText || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter({ searchText: e.target.value })}
                placeholder="Search..."
                data-cy="search-input" data-testid="search-input"
              />

              {activeTab === 'policies' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by State</label>
                  <div className="flex flex-wrap gap-2">
                    {policyStates.map(state => (
                      <button
                        key={state}
                        onClick={() => togglePolicyState(state as PolicyState)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors capitalize ${
                          (filter.selectedStates || []).includes(state as PolicyState)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                        data-cy={`filter-state-${state}`}
                      >
                        {state}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Data Grid */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <VirtualizedDataGrid
                data={filteredData}
                columns={columns}
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
        scriptName="Conditional Access Discovery"
        scriptDescription="Discovering Conditional Access policies and configurations"
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

export default ConditionalAccessDiscoveryView;
