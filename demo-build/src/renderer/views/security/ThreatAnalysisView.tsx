/**
 * Threat Analysis View
 */

import React from 'react';
import { Skull, RefreshCw, Download, Filter, X, Scan } from 'lucide-react';

import { useThreatAnalysisLogic } from '../../hooks/useThreatAnalysisLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';

const ThreatAnalysisView: React.FC = () => {
  const {
    data,
    columns,
    isLoading,
    error,
    filters,
    filterOptions,
    updateFilter,
    clearFilters,
    selectedThreats,
    setSelectedThreats,
    loadData,
    runSecurityScan,
    stats,
    selectedProfile,
  } = useThreatAnalysisLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="threat-analysis-view" data-testid="threat-analysis-view">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skull className="w-8 h-8 text-red-600 dark:text-red-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Threat Analysis</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monitor active threats and indicators</p>
            </div>
          </div>
          {selectedProfile && <div className="text-sm text-gray-600 dark:text-gray-400">Profile: <span className="font-semibold">{selectedProfile.name}</span></div>}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="text-sm text-red-600 dark:text-red-400 font-medium">Total Threats</div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">{stats?.total ?? 0}</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Critical</div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats?.critical ?? 0}</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">High Severity</div>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats?.high ?? 0}</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Active</div>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats?.active ?? 0}</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
          {(filters.threatType || filters.severity || filters.status || filters.searchText) && (
            <Button variant="ghost" size="sm" icon={<X className="w-4 h-4" />} onClick={clearFilters} data-cy="clear-filters-btn" data-testid="clear-filters-btn">Clear All</Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input placeholder="Search threats..." value={filters.searchText} onChange={(e) => updateFilter('searchText', e.target.value)} data-cy="search-input" data-testid="search-input" />
          <Select
            value={filters.threatType || ''}
            onChange={(value) => updateFilter('threatType', value)}
            data-cy="threat-type-select"
            options={[
              { value: '', label: 'All Threat Types' },
              ...(filterOptions?.threatTypes ?? []).map((tt) => ({ value: tt || '', label: tt || 'Unknown' }))
            ]}
          />
          <Select
            value={filters.severity}
            onChange={(value) => updateFilter('severity', value)}
            data-cy="severity-select" data-testid="severity-select"
            options={[
              { value: '', label: 'All Severities' },
              ...(filterOptions?.severities ?? []).map((sev) => ({ value: sev || '', label: sev || 'Unknown' }))
            ]}
          />
          <Select
            value={filters.status || ''}
            onChange={(value) => updateFilter('status', value)}
            data-cy="status-select" data-testid="status-select"
            options={[
              { value: '', label: 'All Statuses' },
              ...(filterOptions?.statuses ?? []).map((st) => ({ value: st || '', label: st || 'Unknown' }))
            ]}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="primary" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} loading={isLoading} data-cy="refresh-btn" data-testid="refresh-btn">Refresh</Button>
            <Button variant="secondary" icon={<Scan className="w-4 h-4" />} onClick={runSecurityScan} data-cy="scan-btn">Run Security Scan</Button>
          </div>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />} disabled={(data?.length ?? 0) === 0} data-cy="export-btn" data-testid="export-btn">Export Threats</Button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="flex-1 overflow-hidden p-6">
        <VirtualizedDataGrid data={data} columns={columns} loading={isLoading} enableSelection={true} selectionMode="multiple" onSelectionChange={setSelectedThreats} height="calc(100vh - 450px)" />
      </div>
    </div>
  );
};

export default ThreatAnalysisView;


