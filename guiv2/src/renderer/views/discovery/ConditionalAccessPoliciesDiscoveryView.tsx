/**
 * Conditional Access Policies Discovery View
 * Production-ready UI for CA policy discovery, analysis, and reporting
 */

import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, Download, FileSpreadsheet, AlertCircle, Play, XCircle } from 'lucide-react';

import { useConditionalAccessDiscoveryLogic } from '../../hooks/useConditionalAccessDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';

const ConditionalAccessPoliciesDiscoveryView: React.FC = () => {
  const {
    config,
    result,
    isDiscovering,
    progress,
    activeTab,
    filter,
    error,
    columns,
    filteredData,
    stats,
    updateConfig,
    updateFilter,
    setActiveTab,
    startDiscovery,
    cancelDiscovery,
    exportToCSV,
    exportToExcel
  } = useConditionalAccessDiscoveryLogic();

  const [showConfig, setShowConfig] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Form validation
  const handleStartDiscovery = () => {
    const errors: string[] = [];

    if (!config.tenantId) {
      errors.push('Tenant ID is required');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    startDiscovery();
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="conditional-access-policies-discovery-view">
      {/* Loading Overlay */}
      {isDiscovering && (
        <LoadingOverlay
          progress={progress.percentage}
          message={progress.message || 'Discovering Conditional Access policies...'}
          onCancel={cancelDiscovery}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conditional Access Policies</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Discover and analyze Azure AD Conditional Access configurations</p>
          </div>
        </div>

        <div className="flex gap-3">
          {result && (
            <>
              <Button
                variant="secondary"
                onClick={exportToCSV}
                icon={<Download className="w-4 h-4" />}
                data-cy="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                variant="secondary"
                onClick={exportToExcel}
                icon={<FileSpreadsheet className="w-4 h-4" />}
                data-cy="export-excel-btn"
              >
                Export Excel
              </Button>
            </>
          )}
          <Button
            variant="primary"
            onClick={handleStartDiscovery}
            disabled={isDiscovering}
            icon={isDiscovering ? <XCircle className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            data-cy="start-discovery-btn"
          >
            {isDiscovering ? 'Discovering...' : 'Start Discovery'}
          </Button>
        </div>
      </div>

      {/* Configuration Panel - Collapsible */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          data-cy="toggle-config-btn"
        >
          <span className="font-medium text-gray-900 dark:text-white">Discovery Configuration</span>
          {showConfig ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showConfig && (
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
            <div className="grid grid-cols-2 gap-6">
              {/* Tenant ID */}
              <div className="col-span-2">
                <Input
                  label="Tenant ID"
                  value={config.tenantId || ''}
                  onChange={(e) => updateConfig({ tenantId: e.target.value })}
                  placeholder="e.g., contoso.onmicrosoft.com or tenant GUID"
                  error={validationErrors.includes('Tenant ID is required') ? 'Tenant ID is required' : undefined}
                  data-cy="tenant-id-input"
                />
              </div>

              {/* Discovery Options */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Discovery Options</h3>
                <Checkbox
                  label="Include policy assignments"
                  checked={config.includeAssignments || false}
                  onChange={(checked) => updateConfig({ includeAssignments: checked })}
                  data-cy="include-assignments-checkbox"
                />
                <Checkbox
                  label="Include policy conditions"
                  checked={config.includeConditions || false}
                  onChange={(checked) => updateConfig({ includeConditions: checked })}
                  data-cy="include-conditions-checkbox"
                />
                <Checkbox
                  label="Include policy controls"
                  checked={config.includeControls || false}
                  onChange={(checked) => updateConfig({ includeControls: checked })}
                  data-cy="include-controls-checkbox"
                />
              </div>

              {/* Advanced Settings */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Advanced Settings</h3>
                <Input
                  label="Timeout (seconds)"
                  type="number"
                  value={((config.timeout || 300000) / 1000).toString()}
                  onChange={(e) => updateConfig({ timeout: parseInt(e.target.value) * 1000 })}
                  data-cy="timeout-input"
                />
              </div>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-900 dark:text-red-200">Validation Errors</h4>
                    <ul className="mt-1 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                      {validationErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="m-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-900 dark:text-red-200">Discovery Error</h4>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Dashboard */}
      {stats && (
        <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Discovery Statistics</h3>
          <div className="grid grid-cols-6 gap-4">
            <StatCard
              value={stats?.totalPolicies ?? 0}
              label="Total Policies"
              color="indigo"
              data-cy="stat-total-policies"
            />
            <StatCard
              value={stats?.enabledPolicies ?? 0}
              label="Enabled"
              color="green"
              data-cy="stat-enabled-policies"
            />
            <StatCard
              value={stats?.reportOnlyPolicies ?? 0}
              label="Report Only"
              color="yellow"
              data-cy="stat-report-only"
            />
            <StatCard
              value={(stats?.policiesByCondition ?? 0)['With MFA'] || 0}
              label="With MFA"
              color="blue"
              data-cy="stat-with-mfa"
            />
            <StatCard
              value={(stats?.policiesByCondition ?? 0)['Block Access'] || 0}
              label="Block Access"
              color="red"
              data-cy="stat-block-access"
            />
            <StatCard
              value={result?.namedLocations?.length || 0}
              label="Named Locations"
              color="purple"
              data-cy="stat-named-locations"
            />
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 px-6 pt-4 bg-gray-50 dark:bg-gray-900">
        <TabButton
          label="Overview"
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
          count={result ? stats?.totalPolicies : undefined}
          data-cy="tab-overview"
        />
        <TabButton
          label="Policies"
          active={activeTab === 'policies'}
          onClick={() => setActiveTab('policies')}
          count={result?.policies?.length}
          data-cy="tab-policies"
        />
        <TabButton
          label="Named Locations"
          active={activeTab === 'locations'}
          onClick={() => setActiveTab('locations')}
          count={result?.namedLocations?.length}
          data-cy="tab-locations"
        />
        <TabButton
          label="Assignments"
          active={activeTab === 'assignments'}
          onClick={() => setActiveTab('assignments')}
          count={result?.policies?.length}
          data-cy="tab-assignments"
        />
      </div>

      {/* Search/Filter Bar */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
        <Input
          value={filter.searchText}
          onChange={(e) => updateFilter({ searchText: e.target.value })}
          placeholder={`Search ${activeTab}...`}
          data-cy="search-input"
        />
      </div>

      {/* Data Grid */}
      <div className="flex-1 px-6 pb-6 bg-gray-50 dark:bg-gray-900">
        {activeTab === 'overview' && result ? (
          <OverviewTab stats={stats} result={result} />
        ) : (
          <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <VirtualizedDataGrid
              data={filteredData}
              columns={columns}
              loading={isDiscovering}
              enableColumnReorder
              enableColumnResize
             
            />
          </div>
        )}
      </div>
    </div>
  );
};

// StatCard Component
interface StatCardProps {
  value: number;
  label: string;
  color: 'indigo' | 'green' | 'yellow' | 'blue' | 'red' | 'purple';
  'data-cy'?: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, color, 'data-cy': dataCy }) => {
  const colorClasses = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
  };

  return (
    <div className={`p-4 rounded-lg ${colorClasses[color]}`} data-cy={dataCy}>
      <div className="text-3xl font-bold">{(value ?? 0).toLocaleString()}</div>
      <div className="text-sm mt-1 opacity-80">{label}</div>
    </div>
  );
};

// TabButton Component
interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
  'data-cy'?: string;
}

const TabButton: React.FC<TabButtonProps> = ({ label, active, onClick, count, 'data-cy': dataCy }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      active
        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
    }`}
    data-cy={dataCy}
  >
    {label}
    {count !== undefined && (
      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
        active ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'bg-gray-200 dark:bg-gray-700'
      }`}>
        {count}
      </span>
    )}
  </button>
);

// Overview Tab Component
const OverviewTab: React.FC<{ stats: any; result: any }> = ({ stats, result }) => (
  <div className="h-full overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Policy Summary</h2>
    <div className="space-y-4">
      <SummaryRow label="Total Policies" value={stats?.totalPolicies || 0} />
      <SummaryRow label="Enabled Policies" value={stats?.enabledPolicies || 0} />
      <SummaryRow label="Report-Only Policies" value={stats?.reportOnlyPolicies || 0} />
      <SummaryRow label="Named Locations" value={result?.namedLocations?.length || 0} />

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Policies by Control Type</h3>
        {Object.entries(stats?.policiesByCondition || {}).map(([key, value]) => (
          <SummaryRow key={key} label={key} value={value as number} />
        ))}
      </div>
    </div>
  </div>
);

const SummaryRow: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
    <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    <span className="text-sm font-medium text-gray-900 dark:text-white">{(value ?? 0).toLocaleString()}</span>
  </div>
);

export default ConditionalAccessPoliciesDiscoveryView;
