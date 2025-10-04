/**
 * Data Loss Prevention Discovery View
 * Production-ready UI for DLP policy, rule, and incident discovery
 */

import React, { useState } from 'react';
import { Lock, ChevronDown, ChevronUp, Download, FileSpreadsheet, AlertCircle, Play, XCircle, Shield } from 'lucide-react';
import { useDataLossPreventionDiscoveryLogic } from '../../hooks/useDataLossPreventionDiscoveryLogic';
import VirtualizedDataGrid from '../../components/organisms/VirtualizedDataGrid';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';

const DataLossPreventionDiscoveryView: React.FC = () => {
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
  } = useDataLossPreventionDiscoveryLogic();

  const [showConfig, setShowConfig] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleStartDiscovery = () => {
    const errors: string[] = [];
    if (!config.tenantId) errors.push('Tenant ID is required');
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    startDiscovery();
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="data-loss-prevention-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={progress.percentage}
          message={progress.message || 'Discovering DLP policies and incidents...'}
          onCancel={cancelDiscovery}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
            <Shield className="w-8 h-8 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Loss Prevention</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Discover DLP policies, rules, and incidents</p>
          </div>
        </div>

        <div className="flex gap-3">
          {result && (
            <>
              <Button variant="secondary" onClick={exportToCSV} icon={<Download className="w-4 h-4" />}>Export CSV</Button>
              <Button variant="secondary" onClick={exportToExcel} icon={<FileSpreadsheet className="w-4 h-4" />}>Export Excel</Button>
            </>
          )}
          <Button
            variant="primary"
            onClick={handleStartDiscovery}
            disabled={isDiscovering}
            icon={isDiscovering ? <XCircle className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          >
            {isDiscovering ? 'Discovering...' : 'Start Discovery'}
          </Button>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <span className="font-medium">Discovery Configuration</span>
          {showConfig ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showConfig && (
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
            <div className="grid grid-cols-2 gap-6">
              <Input
                label="Tenant ID"
                value={config.tenantId || ''}
                onChange={(e) => updateConfig({ tenantId: e.target.value })}
                placeholder="contoso.onmicrosoft.com"
                error={validationErrors.includes('Tenant ID is required') ? 'Required' : undefined}
              />

              <div className="space-y-3">
                <h3 className="text-sm font-medium mb-2">Discovery Options</h3>
                <Checkbox label="Include policies" checked={config.includePolicies || false} onChange={(e) => updateConfig({ includePolicies: e.target.checked })} />
                <Checkbox label="Include rules" checked={config.includeRules || false} onChange={(e) => updateConfig({ includeRules: e.target.checked })} />
                <Checkbox label="Include incidents" checked={config.includeIncidents || false} onChange={(e) => updateConfig({ includeIncidents: e.target.checked })} />
              </div>
            </div>

            {validationErrors.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <h4 className="text-sm font-medium text-red-900 dark:text-red-200">Validation Errors</h4>
                    <ul className="mt-1 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                      {validationErrors.map((err, i) => (<li key={i}>{err}</li>))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="m-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h4 className="text-sm font-medium text-red-900 dark:text-red-200">Error</h4>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="p-6 bg-white dark:bg-gray-800 border-b">
          <h3 className="text-sm font-medium mb-4">Statistics</h3>
          <div className="grid grid-cols-6 gap-4">
            <StatCard value={stats.totalPolicies} label="Policies" color="rose" />
            <StatCard value={stats.enabledPolicies} label="Enabled" color="green" />
            <StatCard value={stats.totalIncidents} label="Incidents" color="orange" />
            <StatCard value={stats.incidentsBySeverity.critical} label="Critical" color="red" />
            <StatCard value={stats.incidentsBySeverity.high} label="High" color="yellow" />
            <StatCard value={stats.incidentsBySeverity.medium + stats.incidentsBySeverity.low} label="Med/Low" color="blue" />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-4 bg-gray-50 dark:bg-gray-900">
        <TabButton label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} count={stats?.totalPolicies} />
        <TabButton label="Policies" active={activeTab === 'policies'} onClick={() => setActiveTab('policies')} count={result?.policies?.length} />
        <TabButton label="Rules" active={activeTab === 'rules'} onClick={() => setActiveTab('rules')} count={result?.rules?.length} />
        <TabButton label="Incidents" active={activeTab === 'incidents'} onClick={() => setActiveTab('incidents')} count={result?.incidents?.length} />
        <TabButton label="Sensitive Types" active={activeTab === 'sensitive-types'} onClick={() => setActiveTab('sensitive-types')} count={result?.sensitiveInfoTypes?.length} />
      </div>

      {/* Search */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
        <Input
          value={filter.searchText}
          onChange={(e) => updateFilter({ searchText: e.target.value })}
          placeholder={`Search ${activeTab}...`}
        />
      </div>

      {/* Grid */}
      <div className="flex-1 px-6 pb-6 bg-gray-50 dark:bg-gray-900">
        {activeTab === 'overview' && result ? (
          <OverviewTab stats={stats} result={result} />
        ) : (
          <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
            <VirtualizedDataGrid
              data={filteredData}
              columns={columns}
              loading={isDiscovering}
              enableExport
              enableColumnReorder
              enableColumnResize
            />
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => {
  const colors: Record<string, string> = {
    rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
  };

  return (
    <div className={`p-4 rounded-lg ${colors[color]}`}>
      <div className="text-3xl font-bold">{value.toLocaleString()}</div>
      <div className="text-sm mt-1 opacity-80">{label}</div>
    </div>
  );
};

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void; count?: number }> = ({ label, active, onClick, count }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium border-b-2 ${
      active ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-600 hover:text-gray-900'
    }`}
  >
    {label}
    {count !== undefined && (
      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${active ? 'bg-rose-100 text-rose-700' : 'bg-gray-200'}`}>
        {count}
      </span>
    )}
  </button>
);

const OverviewTab: React.FC<{ stats: any; result: any }> = ({ stats, result }) => (
  <div className="h-full overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
    <h2 className="text-lg font-semibold mb-4">DLP Summary</h2>
    <div className="space-y-4">
      <SummaryRow label="Total Policies" value={stats?.totalPolicies || 0} />
      <SummaryRow label="Enabled Policies" value={stats?.enabledPolicies || 0} />
      <SummaryRow label="Total Incidents" value={stats?.totalIncidents || 0} />

      <div className="pt-4 border-t">
        <h3 className="text-sm font-medium mb-2">Incidents by Severity</h3>
        {Object.entries(stats?.incidentsBySeverity || {}).map(([key, value]) => (
          <SummaryRow key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={value as number} />
        ))}
      </div>

      {stats?.topPoliciesByIncidents && stats.topPoliciesByIncidents.length > 0 && (
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-2">Top Policies by Incidents</h3>
          {stats.topPoliciesByIncidents.map((item: any, i: number) => (
            <SummaryRow key={i} label={item.policyName} value={item.count} />
          ))}
        </div>
      )}
    </div>
  </div>
);

const SummaryRow: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
    <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    <span className="text-sm font-medium">{value.toLocaleString()}</span>
  </div>
);

export default DataLossPreventionDiscoveryView;
