/**
 * Compliance Report Logic Hook
 * Handles compliance framework reporting and assessment
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';

import { useProfileStore } from '../store/useProfileStore';
import { ComplianceItem } from '../types/models/compliance';

export interface ComplianceFilters {
  framework: string;
  status: string;
  riskLevel: string;
  owner: string;
  searchText: string;
}

export const useComplianceReportLogic = () => {
  const { selectedSourceProfile } = useProfileStore();

  const [data, setData] = useState<ComplianceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ComplianceFilters>({
    framework: '',
    status: '',
    riskLevel: '',
    owner: '',
    searchText: '',
  });
  const [selectedItems, setSelectedItems] = useState<ComplianceItem[]>([]);

  const columns = useMemo<ColDef<ComplianceItem>[]>(
    () => [
      {
        headerName: 'Control ID',
        field: 'controlId',
        pinned: 'left',
        width: 140,
        filter: 'agTextColumnFilter',
        checkboxSelection: true,
        headerCheckboxSelection: true,
      },
      {
        headerName: 'Framework',
        field: 'framework',
        width: 120,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Title',
        field: 'title',
        width: 250,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 140,
        cellRenderer: (params: any) => {
          const colorMap: Record<string, string> = {
            Compliant: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            NonCompliant: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            PartiallyCompliant: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            NotAssessed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
          };
          const color = colorMap[params.value] || '';
          return `<span class="px-2 py-1 rounded text-xs font-semibold ${color}">${params.value}</span>`;
        },
      },
      {
        headerName: 'Risk Level',
        field: 'riskLevel',
        width: 120,
        cellRenderer: (params: any) => {
          const colorMap: Record<string, string> = {
            Critical: 'text-red-600',
            High: 'text-orange-600',
            Medium: 'text-yellow-600',
            Low: 'text-green-600',
          };
          const color = colorMap[params.value] || 'text-gray-600';
          return `<span class="${color} font-semibold">${params.value}</span>`;
        },
      },
      {
        headerName: 'Score',
        field: 'score',
        width: 100,
        type: 'numericColumn',
        cellRenderer: (params: any) => {
          const value = params.value;
          const color = value >= 80 ? 'text-green-600' : value >= 60 ? 'text-yellow-600' : 'text-red-600';
          return `<span class="${color} font-semibold">${value}%</span>`;
        },
      },
      {
        headerName: 'Category',
        field: 'category',
        width: 150,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Owner',
        field: 'owner',
        width: 150,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Due Date',
        field: 'dueDate',
        width: 140,
        valueFormatter: (params) => {
          if (!params.value) return '';
          return new Date(params.value).toLocaleDateString();
        },
      },
      {
        headerName: 'Description',
        field: 'description',
        width: 300,
        wrapText: true,
      },
      {
        headerName: 'Evidence',
        field: 'evidence',
        width: 200,
      },
      {
        headerName: 'Remediation',
        field: 'remediation',
        width: 250,
      },
    ],
    []
  );

  const filteredData = useMemo(() => {
    let result = [...data];
    if (filters.framework) result = result.filter((item) => item.framework === filters.framework);
    if (filters.status) result = result.filter((item) => item.status === filters.status);
    if (filters.riskLevel) result = result.filter((item) => item.riskLevel === filters.riskLevel);
    if (filters.owner) result = result.filter((item) => item.owner?.toLowerCase().includes(filters.owner.toLowerCase()));
    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(search) ||
          item.controlId?.toLowerCase().includes(search) ||
          item.description?.toLowerCase().includes(search)
      );
    }
    return result;
  }, [data, filters]);

  const filterOptions = useMemo(() => {
    const frameworks = [...new Set((data ?? []).map((d) => d.framework).filter(Boolean))].sort();
    const statuses = [...new Set((data ?? []).map((d) => d.status).filter(Boolean))].sort();
    const riskLevels = ['Critical', 'High', 'Medium', 'Low'];
    const owners = [...new Set((data ?? []).map((d) => d.owner).filter(Boolean))].sort();
    return { frameworks, statuses, riskLevels, owners };
  }, [data]);

  const loadData = useCallback(async () => {
    if (!selectedSourceProfile) {
      setError('No source profile selected');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Compliance/ComplianceReport.psm1',
        functionName: 'Get-ComplianceControls',
        parameters: {
          Domain: selectedSourceProfile.domain,
          Credential: selectedSourceProfile.credential,
        },
        options: { timeout: 300000 },
      });
      if (result.success && result.data) {
        setData(result.data.controls || []);
      } else {
        throw new Error(result.error || 'Failed to load compliance data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  const updateFilter = useCallback(<K extends keyof ComplianceFilters>(key: K, value: ComplianceFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ framework: '', status: '', riskLevel: '', owner: '', searchText: '' });
  }, []);

  const exportData = useCallback(async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return { filename: `compliance-report-${timestamp}.csv`, data: filteredData };
  }, [filteredData]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const compliant = filteredData.filter((d) => d.status === 'Compliant').length;
    const nonCompliant = filteredData.filter((d) => d.status === 'NonCompliant').length;
    const avgScore = total > 0 ? filteredData.reduce((sum, d) => sum + d.score, 0) / total : 0;
    return {
      total,
      compliant,
      nonCompliant,
      complianceRate: total > 0 ? ((compliant / total) * 100).toFixed(1) : '0',
      avgScore: avgScore.toFixed(1),
    };
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
    selectedItems,
    setSelectedItems,
    loadData,
    exportData,
    stats,
    selectedProfile: selectedSourceProfile,
  };
};
