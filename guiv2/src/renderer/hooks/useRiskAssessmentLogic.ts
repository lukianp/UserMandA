/**
 * Risk Assessment Logic Hook
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import type { ColDef } from 'ag-grid-community';
import { SecurityRiskData } from '../types/models/securityRisk';

export interface RiskFilters {
  riskLevel: string;
  category: string;
  status: string;
  owner: string;
  searchText: string;
}

export const useRiskAssessmentLogic = () => {
  const { selectedSourceProfile } = useProfileStore();
  const [data, setData] = useState<SecurityRiskData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RiskFilters>({
    riskLevel: '',
    category: '',
    status: '',
    owner: '',
    searchText: '',
  });
  const [selectedRisks, setSelectedRisks] = useState<SecurityRiskData[]>([]);

  const columns = useMemo<ColDef<SecurityRiskData>[]>(() => [
    { headerName: 'Resource', field: 'resourceName', pinned: 'left', width: 180, filter: 'agTextColumnFilter', checkboxSelection: true, headerCheckboxSelection: true },
    { headerName: 'Type', field: 'resourceType', width: 120 },
    { headerName: 'Risk Type', field: 'riskType', width: 150, filter: 'agTextColumnFilter' },
    {
      headerName: 'Risk Level',
      field: 'riskLevel',
      width: 120,
      cellRenderer: (params: any) => {
        const colorMap: Record<string, string> = {
          Critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
          High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
          Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
          Low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        };
        const color = colorMap[params.value] || '';
        return `<span class="px-2 py-1 rounded text-xs font-semibold ${color}">${params.value}</span>`;
      },
    },
    { headerName: 'Category', field: 'category', width: 140, filter: 'agTextColumnFilter' },
    { headerName: 'Status', field: 'status', width: 120 },
    { headerName: 'Owner', field: 'owner', width: 150, filter: 'agTextColumnFilter' },
    { headerName: 'Description', field: 'description', width: 300 },
    { headerName: 'Recommendation', field: 'recommendation', width: 250 },
    { headerName: 'Detected', field: 'detectedDate', width: 140, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : '' },
    { headerName: 'Due Date', field: 'dueDate', width: 140, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : '' },
  ], []);

  const filteredData = useMemo(() => {
    let result = [...data];
    if (filters.riskLevel) result = result.filter((item) => item.riskLevel === filters.riskLevel);
    if (filters.category) result = result.filter((item) => item.category.toLowerCase().includes(filters.category.toLowerCase()));
    if (filters.status) result = result.filter((item) => item.status === filters.status);
    if (filters.owner) result = result.filter((item) => item.owner.toLowerCase().includes(filters.owner.toLowerCase()));
    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      result = result.filter((item) =>
        item.resourceName.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search)
      );
    }
    return result;
  }, [data, filters]);

  const filterOptions = useMemo(() => ({
    riskLevels: ['Critical', 'High', 'Medium', 'Low'],
    categories: [...new Set(data.map((d) => d.category))].sort(),
    statuses: [...new Set(data.map((d) => d.status))].sort(),
    owners: [...new Set(data.map((d) => d.owner))].sort(),
  }), [data]);

  const loadData = useCallback(async () => {
    if (!selectedSourceProfile) {
      setError('No source profile selected');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Security/RiskAssessment.psm1',
        functionName: 'Get-SecurityRisks',
        parameters: { Domain: selectedSourceProfile.domain, Credential: selectedSourceProfile.credential },
        options: { timeout: 300000 },
      });
      if (result.success && result.data) {
        setData(result.data.risks || []);
      } else {
        throw new Error(result.error || 'Failed to load risk data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  const updateFilter = useCallback(<K extends keyof RiskFilters>(key: K, value: RiskFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ riskLevel: '', category: '', status: '', owner: '', searchText: '' });
  }, []);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const critical = filteredData.filter((d) => d.riskLevel === 'Critical').length;
    const high = filteredData.filter((d) => d.riskLevel === 'High').length;
    const resolved = filteredData.filter((d) => d.isResolved).length;
    const overdue = filteredData.filter((d) => d.isOverdue).length;
    return { total, critical, high, resolved, overdue };
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
    selectedRisks,
    setSelectedRisks,
    loadData,
    stats,
    selectedProfile: selectedSourceProfile,
  };
};
