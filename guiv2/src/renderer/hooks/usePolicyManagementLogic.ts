/**
 * Policy Management Logic Hook
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';

import { useProfileStore } from '../store/useProfileStore';

export interface SecurityPolicy {
  id: string;
  name: string;
  category: 'Password' | 'MFA' | 'Session' | 'DataRetention' | 'AccessControl' | 'Network';
  status: 'Enforced' | 'Warning' | 'Disabled';
  enabled: boolean;
  description: string;
  parameters: Record<string, any>;
  compliance: 'Compliant' | 'NonCompliant' | 'PartiallyCompliant';
  violationCount: number;
  lastModified: Date | string;
  modifiedBy: string;
  auditTrail: string;
}

export interface PolicyFilters {
  category: string;
  status: string;
  compliance: string;
  searchText: string;
}

export const usePolicyManagementLogic = () => {
  const { selectedSourceProfile } = useProfileStore();
  const [data, setData] = useState<SecurityPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PolicyFilters>({ category: '', status: '', compliance: '', searchText: '' });
  const [selectedPolicies, setSelectedPolicies] = useState<SecurityPolicy[]>([]);

  const columns = useMemo<ColDef<SecurityPolicy>[]>(() => [
    { headerName: 'Policy Name', field: 'name', pinned: 'left', width: 220, filter: 'agTextColumnFilter', checkboxSelection: true, headerCheckboxSelection: true },
    { headerName: 'Category', field: 'category', width: 150, filter: 'agTextColumnFilter' },
    {
      headerName: 'Status',
      field: 'status',
      width: 120,
      cellRenderer: (params: any) => {
        const colorMap: Record<string, string> = {
          Enforced: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          Warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
          Disabled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
        };
        const color = colorMap[params.value] || '';
        return `<span class="px-2 py-1 rounded text-xs font-semibold ${color}">${params.value}</span>`;
      },
    },
    {
      headerName: 'Compliance',
      field: 'compliance',
      width: 160,
      cellRenderer: (params: any) => {
        const colorMap: Record<string, string> = {
          Compliant: 'text-green-600',
          NonCompliant: 'text-red-600',
          PartiallyCompliant: 'text-yellow-600',
        };
        const color = colorMap[params.value] || 'text-gray-600';
        return `<span class="${color} font-semibold">${params.value}</span>`;
      },
    },
    { headerName: 'Violations', field: 'violationCount', width: 120, type: 'numericColumn' },
    { headerName: 'Description', field: 'description', width: 300 },
    { headerName: 'Last Modified', field: 'lastModified', width: 180, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : '' },
    { headerName: 'Modified By', field: 'modifiedBy', width: 150 },
  ], []);

  const filteredData = useMemo(() => {
    let result = [...data];
    if (filters.category) result = result.filter((item) => item.category === filters.category);
    if (filters.status) result = result.filter((item) => item.status === filters.status);
    if (filters.compliance) result = result.filter((item) => item.compliance === filters.compliance);
    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      result = result.filter((item) =>
        (item.name ?? '').toLowerCase().includes(search) ||
        (item.description ?? '').toLowerCase().includes(search)
      );
    }
    return result;
  }, [data, filters]);

  const filterOptions = useMemo(() => ({
    categories: ['Password', 'MFA', 'Session', 'DataRetention', 'AccessControl', 'Network'],
    statuses: ['Enforced', 'Warning', 'Disabled'],
    compliance: ['Compliant', 'NonCompliant', 'PartiallyCompliant'],
  }), []);

  const loadData = useCallback(async () => {
    if (!selectedSourceProfile) {
      setError('No source profile selected');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Security/PolicyManagement.psm1',
        functionName: 'Get-SecurityPolicies',
        parameters: { Domain: selectedSourceProfile.domain, Credential: selectedSourceProfile.credential },
        options: { timeout: 300000 },
      });
      if (result.success && result.data) {
        setData(result.data.policies || []);
      } else {
        throw new Error(result.error || 'Failed to load policies');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  const togglePolicy = useCallback(async (policy: SecurityPolicy) => {
    console.log('Toggle policy:', policy);
  }, []);

  const editPolicy = useCallback((policy: SecurityPolicy) => {
    console.log('Edit policy:', policy);
  }, []);

  const viewAuditTrail = useCallback((policy: SecurityPolicy) => {
    console.log('View audit trail:', policy);
  }, []);

  const updateFilter = useCallback(<K extends keyof PolicyFilters>(key: K, value: PolicyFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ category: '', status: '', compliance: '', searchText: '' });
  }, []);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const enforced = filteredData.filter((d) => d.status === 'Enforced').length;
    const compliant = filteredData.filter((d) => d.compliance === 'Compliant').length;
    const violations = filteredData.reduce((sum, d) => sum + d.violationCount, 0);
    return { total, enforced, compliant, violations, complianceRate: total > 0 ? ((compliant / total) * 100).toFixed(1) : '0' };
  }, [filteredData]);

  useEffect(() => {
    if (selectedSourceProfile) loadData();
  }, [selectedSourceProfile, loadData]);

  return {
    data: filteredData,
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
    selectedProfile: selectedSourceProfile,
  };
};
