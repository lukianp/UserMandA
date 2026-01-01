/**
 * Policy Management View
 */

import React from 'react';
import { FileText, RefreshCw, Download, Filter, X, Edit, Eye } from 'lucide-react';

import { usePolicyManagementLogic } from '../../hooks/usePolicyManagementLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';

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
    editPolicy,
    viewAuditTrail,
    stats,
    selectedProfile,
  } = usePolicyManagementLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="policy-management-view" data-testid="policy-management-view">
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
            <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{stats?.total ?? 0}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">Enforced</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats?.enforced ?? 0}</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Compliant</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats?.compliant ?? 0} <span className="text-sm">({stats?.complianceRate ?? 0}%)</span></div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="text-sm text-red-600 dark:text-red-400 font-medium">Violations</div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">{stats?.violations ?? 0}</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
          {(filters.category || filters.status || filters.compliance || filters.searchText) && (
            <Button variant="ghost" size="sm" icon={<X className="w-4 h-4" />} onClick={clearFilters} data-cy="clear-filters-btn" data-testid="clear-filters-btn">Clear All</Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input placeholder="Search policies..." value={filters.searchText} onChange={(e) => updateFilter('searchText', e.target.value)} data-cy="search-input" data-testid="search-input" />
          <Select
            value={filters.category}
            onChange={(value) => updateFilter('category', value)}
            options={[
              { value: '', label: 'All Categories' },
              ...(filterOptions?.categories ?? []).map((cat) => ({ value: cat, label: cat }))
            ]}
            data-cy="category-select" data-testid="category-select"
          />
          <Select
            value={filters.status}
            onChange={(value) => updateFilter('status', value)}
            options={[
              { value: '', label: 'All Statuses' },
              ...(filterOptions?.statuses ?? []).map((st) => ({ value: st, label: st }))
            ]}
            data-cy="status-select" data-testid="status-select"
          />
          <Select
            value={filters.compliance}
            onChange={(value) => updateFilter('compliance', value)}
            options={[
              { value: '', label: 'All Compliance' },
              ...(filterOptions?.compliance ?? []).map((comp) => ({ value: comp, label: comp }))
            ]}
            data-cy="compliance-select" data-testid="compliance-select"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="primary" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} loading={isLoading} data-cy="refresh-btn" data-testid="refresh-btn">Refresh</Button>
            {selectedPolicies.length > 0 && (
              <>
                <Button variant="secondary" icon={<Edit className="w-4 h-4" />} onClick={() => selectedPolicies[0] && editPolicy(selectedPolicies[0])} data-cy="edit-btn" data-testid="edit-btn">Edit Policy</Button>
                <Button variant="secondary" icon={<Eye className="w-4 h-4" />} onClick={() => selectedPolicies[0] && viewAuditTrail(selectedPolicies[0])} data-cy="audit-trail-btn">View Audit Trail</Button>
              </>
            )}
          </div>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />} disabled={(data?.length ?? 0) === 0} data-cy="export-btn" data-testid="export-btn">Export Policies</Button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="flex-1 overflow-hidden p-6">
        <VirtualizedDataGrid data={data} columns={columns} loading={isLoading} enableSelection={true} selectionMode="multiple" onSelectionChange={setSelectedPolicies} enableExport={true} enableFiltering={true} height="calc(100vh - 450px)" data-cy="policy-grid" data-testid="policy-grid" />
      </div>
    </div>
  );
};

export default PolicyManagementView;


