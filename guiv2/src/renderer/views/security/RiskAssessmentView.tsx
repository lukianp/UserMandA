/**
 * Risk Assessment View
 */

import React from 'react';
import { useRiskAssessmentLogic } from '../../hooks/useRiskAssessmentLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Select from '../../components/atoms/Select';
import { AlertTriangle, RefreshCw, Download, Filter, X } from 'lucide-react';

const RiskAssessmentView: React.FC = () => {
  const {
    data,
    columns,
    isLoading,
    error,
    filters,
    filterOptions,
    updateFilter,
    clearFilters,
    selectedRisks,
    setSelectedRisks,
    loadData,
    stats,
    selectedProfile,
  } = useRiskAssessmentLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="risk-assessment-view">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Risk Assessment</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Identify and track security risks</p>
            </div>
          </div>
          {selectedProfile && <div className="text-sm text-gray-600 dark:text-gray-400">Profile: <span className="font-semibold">{selectedProfile.name}</span></div>}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Risks</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="text-sm text-red-600 dark:text-red-400 font-medium">Critical</div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.critical}</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">High</div>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.high}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">Resolved</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.resolved}</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Overdue</div>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.overdue}</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
          {(filters.riskLevel || filters.category || filters.status || filters.owner || filters.searchText) && (
            <Button variant="ghost" size="sm" icon={<X className="w-4 h-4" />} onClick={clearFilters} data-cy="clear-filters-btn">Clear All</Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input placeholder="Search risks..." value={filters.searchText} onChange={(e) => updateFilter('searchText', e.target.value)} data-cy="search-input" />
          <Select value={filters.riskLevel} onChange={(e) => updateFilter('riskLevel', e.target.value)} data-cy="risk-level-select">
            <option value="">All Risk Levels</option>
            {filterOptions.riskLevels.map((rl) => (<option key={rl} value={rl}>{rl}</option>))}
          </Select>
          <Select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)} data-cy="category-select">
            <option value="">All Categories</option>
            {filterOptions.categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
          </Select>
          <Select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)} data-cy="status-select">
            <option value="">All Statuses</option>
            {filterOptions.statuses.map((st) => (<option key={st} value={st}>{st}</option>))}
          </Select>
          <Select value={filters.owner} onChange={(e) => updateFilter('owner', e.target.value)} data-cy="owner-select">
            <option value="">All Owners</option>
            {filterOptions.owners.map((own) => (<option key={own} value={own}>{own}</option>))}
          </Select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <Button variant="primary" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} loading={isLoading} data-cy="refresh-btn">Refresh</Button>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />} disabled={data.length === 0} data-cy="export-btn">Export Risk Report</Button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="flex-1 overflow-hidden p-6">
        <VirtualizedDataGrid data={data} columns={columns} loading={isLoading} enableSelection={true} selectionMode="multiple" onSelectionChange={setSelectedRisks} enableExport={true} enableFiltering={true} height="calc(100vh - 500px)" data-cy="risk-assessment-grid" />
      </div>
    </div>
  );
};

export default RiskAssessmentView;
