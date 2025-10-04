/**
 * Policy Management View
 */

import React from 'react';
import { usePolicyManagementLogic } from '../../hooks/usePolicyManagementLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Select from '../../components/atoms/Select';
import { FileText, RefreshCw, Download, Filter, X, Edit, Eye } from 'lucide-react';

const PolicyManagementView: React.FC = () => {
  const {
    data,
    columns,
    isLoading,
    error,
    filters,
    filterOptions,
    updateFilter,
    clearFilters,
    selectedPolicies,
    setSelectedPolicies,
    loadData,
    togglePolicy,
    editPolicy,
    viewAuditTrail,
    stats,
    selectedProfile,
  } = usePolicyManagementLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="policy-management-view">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Policy Management</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Configure and monitor security policies</p>
            </div>
          </div>
          {selectedProfile && <div className="text-sm text-gray-600 dark:text-gray-400">Profile: <span className="font-semibold">{selectedProfile.name}</span></div>}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
            <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Total Policies</div>
            <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{stats.total}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">Enforced</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.enforced}</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Compliant</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.compliant} <span className="text-sm">({stats.complianceRate}%)</span></div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="text-sm text-red-600 dark:text-red-400 font-medium">Violations</div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.violations}</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
          {(filters.category || filters.status || filters.compliance || filters.searchText) && (
            <Button variant="ghost" size="sm" icon={<X className="w-4 h-4" />} onClick={clearFilters} data-cy="clear-filters-btn">Clear All</Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input placeholder="Search policies..." value={filters.searchText} onChange={(e) => updateFilter('searchText', e.target.value)} data-cy="search-input" />
          <Select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)} data-cy="category-select">
            <option value="">All Categories</option>
            {filterOptions.categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
          </Select>
          <Select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)} data-cy="status-select">
            <option value="">All Statuses</option>
            {filterOptions.statuses.map((st) => (<option key={st} value={st}>{st}</option>))}
          </Select>
          <Select value={filters.compliance} onChange={(e) => updateFilter('compliance', e.target.value)} data-cy="compliance-select">
            <option value="">All Compliance</option>
            {filterOptions.compliance.map((comp) => (<option key={comp} value={comp}>{comp}</option>))}
          </Select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="primary" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} loading={isLoading} data-cy="refresh-btn">Refresh</Button>
            {selectedPolicies.length > 0 && (
              <>
                <Button variant="secondary" icon={<Edit className="w-4 h-4" />} onClick={() => selectedPolicies[0] && editPolicy(selectedPolicies[0])} data-cy="edit-btn">Edit Policy</Button>
                <Button variant="secondary" icon={<Eye className="w-4 h-4" />} onClick={() => selectedPolicies[0] && viewAuditTrail(selectedPolicies[0])} data-cy="audit-trail-btn">View Audit Trail</Button>
              </>
            )}
          </div>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />} disabled={data.length === 0} data-cy="export-btn">Export Policies</Button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="flex-1 overflow-hidden p-6">
        <VirtualizedDataGrid data={data} columns={columns} loading={isLoading} enableSelection={true} selectionMode="multiple" onSelectionChange={setSelectedPolicies} enableExport={true} enableFiltering={true} height="calc(100vh - 450px)" data-cy="policy-grid" />
      </div>
    </div>
  );
};

export default PolicyManagementView;
