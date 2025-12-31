/**
 * Compliance Report View
 */

import React from 'react';
import { CheckCircle, RefreshCw, Download, Filter, X } from 'lucide-react';

import { useComplianceReportLogic } from '../../hooks/useComplianceReportLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';

const ComplianceReportView: React.FC = () => {
  const {
    data,
    columns,
    isLoading,
    error,
    filters,
    filterOptions,
    updateFilter,
    clearFilters,
    selectedItems,
    setSelectedItems,
    loadData,
    exportData,
    stats,
    selectedProfile,
  } = useComplianceReportLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="compliance-report-view" data-testid="compliance-report-view">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Compliance Report</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monitor compliance across frameworks</p>
            </div>
          </div>
          {selectedProfile && <div className="text-sm text-gray-600 dark:text-gray-400">Profile: <span className="font-semibold">{selectedProfile.name}</span></div>}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Controls</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats?.total ?? 0}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">Compliant</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats?.compliant ?? 0} <span className="text-sm">({stats?.complianceRate ?? 0}%)</span></div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="text-sm text-red-600 dark:text-red-400 font-medium">Non-Compliant</div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">{stats?.nonCompliant ?? 0}</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Avg Score</div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats?.avgScore ?? 0}%</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
          {(filters.framework || filters.status || filters.riskLevel || filters.owner || filters.searchText) && (
            <Button variant="ghost" size="sm" icon={<X className="w-4 h-4" />} onClick={clearFilters} data-cy="clear-filters-btn" data-testid="clear-filters-btn">Clear All</Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input placeholder="Search controls..." value={filters.searchText} onChange={(e) => updateFilter('searchText', e.target.value)} data-cy="search-input" data-testid="search-input" />
          <select value={filters.framework || ''} onChange={(e) => updateFilter('framework', e.target.value)} data-cy="framework-select" className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm">
            <option value="">All Frameworks</option>
            {(filterOptions?.frameworks ?? []).map((fw) => (<option key={fw || 'unknown'} value={fw || ''}>{fw}</option>))}
          </select>
          <select value={filters.status || ''} onChange={(e) => updateFilter('status', e.target.value)} data-cy="status-select" data-testid="status-select" className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm">
            <option value="">All Statuses</option>
            {(filterOptions?.statuses ?? []).map((st) => (<option key={st || 'unknown'} value={st || ''}>{st}</option>))}
          </select>
          <select value={filters.riskLevel || ''} onChange={(e) => updateFilter('riskLevel', e.target.value)} data-cy="risk-level-select" data-testid="risk-level-select" className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm">
            <option value="">All Risk Levels</option>
            {(filterOptions?.riskLevels ?? []).map((rl) => (<option key={rl || 'unknown'} value={rl || ''}>{rl}</option>))}
          </select>
          <select value={filters.owner || ''} onChange={(e) => updateFilter('owner', e.target.value)} data-cy="owner-select" data-testid="owner-select" className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm">
            <option value="">All Owners</option>
            {(filterOptions?.owners ?? []).map((own) => (<option key={own || 'unknown'} value={own || ''}>{own}</option>))}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <Button variant="primary" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} loading={isLoading} data-cy="refresh-btn" data-testid="refresh-btn">Refresh</Button>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={exportData} disabled={(data?.length ?? 0) === 0} data-cy="export-btn">Export Report</Button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="flex-1 overflow-hidden p-6">
        <VirtualizedDataGrid data={data} columns={columns} loading={isLoading} enableSelection={true} selectionMode="multiple" onSelectionChange={setSelectedItems} height="calc(100vh - 500px)" />
      </div>
    </div>
  );
};

export default ComplianceReportView;


