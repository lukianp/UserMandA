/**
 * Threat Analysis Logic Hook
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import type { ColDef } from 'ag-grid-community';
import { ThreatIndicator } from '../types/models/threatIndicator';

export interface ThreatFilters {
  threatType: string;
  severity: string;
  status: string;
  searchText: string;
}

export const useThreatAnalysisLogic = () => {
  const { selectedSourceProfile } = useProfileStore();
  const [data, setData] = useState<ThreatIndicator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ThreatFilters>({ threatType: '', severity: '', status: '', searchText: '' });
  const [selectedThreats, setSelectedThreats] = useState<ThreatIndicator[]>([]);

  const columns = useMemo<ColDef<ThreatIndicator>[]>(() => [
    { headerName: 'Threat Type', field: 'threatType', pinned: 'left', width: 180, filter: 'agTextColumnFilter', checkboxSelection: true, headerCheckboxSelection: true },
    {
      headerName: 'Severity',
      field: 'severity',
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
    { headerName: 'Source', field: 'source', width: 180 },
    { headerName: 'Target', field: 'target', width: 180 },
    { headerName: 'Status', field: 'status', width: 120 },
    { headerName: 'Description', field: 'description', width: 300 },
    { headerName: 'IOC', field: 'ioc', width: 200 },
    { headerName: 'MITRE ID', field: 'mitre_id', width: 120 },
    { headerName: 'Response', field: 'response', width: 200 },
    { headerName: 'Detected', field: 'detectedDate', width: 180, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : '' },
    { headerName: 'Last Activity', field: 'lastActivity', width: 180, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : '' },
  ], []);

  const filteredData = useMemo(() => {
    let result = [...data];
    if (filters.threatType) result = result.filter((item) => item.threatType?.toLowerCase().includes(filters.threatType.toLowerCase()));
    if (filters.severity) result = result.filter((item) => item.severity === filters.severity);
    if (filters.status) result = result.filter((item) => item.status === filters.status);
    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      result = result.filter((item) =>
        item.threatType?.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search) ||
        item.ioc?.toLowerCase().includes(search)
      );
    }
    return result;
  }, [data, filters]);

  const filterOptions = useMemo(() => ({
    threatTypes: [...new Set(data.map((d) => d.threatType).filter(Boolean))].sort(),
    severities: ['Critical', 'High', 'Medium', 'Low'],
    statuses: [...new Set(data.map((d) => d.status).filter(Boolean))].sort(),
  }), [data]);

  const loadData = useCallback(async () => {
    if (!selectedSourceProfile) {
      setError('No source profile selected');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.executeModule<{ threats: ThreatIndicator[] }>({
        modulePath: 'Modules/Security/ThreatAnalysis.psm1',
        functionName: 'Get-ThreatIndicators',
        parameters: { Domain: selectedSourceProfile.domain, Credential: selectedSourceProfile.credential },
        options: { timeout: 300000 },
      });
      if (result.success && result.data) {
        setData(result.data.threats || []);
      } else {
        throw new Error(result.error || 'Failed to load threat data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  const runSecurityScan = useCallback(async () => {
    console.log('Running security scan...');
  }, []);

  const updateFilter = useCallback(<K extends keyof ThreatFilters>(key: K, value: ThreatFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ threatType: '', severity: '', status: '', searchText: '' });
  }, []);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const critical = filteredData.filter((d) => d.severity === 'Critical').length;
    const high = filteredData.filter((d) => d.severity === 'High').length;
    const active = filteredData.filter((d) => d.isActive).length;
    return { total, critical, high, active };
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
    selectedThreats,
    setSelectedThreats,
    loadData,
    runSecurityScan,
    stats,
    selectedProfile: selectedSourceProfile,
  };
};
