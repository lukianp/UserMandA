/**
 * Conditional Access Policies Discovery Logic Hook
 * Production-ready business logic for CA policy discovery and analysis
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { ColDef } from 'ag-grid-community';

import {
  CADiscoveryConfig,
  CADiscoveryResult,
  CAFilterState,
  ConditionalAccessPolicy,
  NamedLocation,
  CAStats,
  PolicyState
} from '../types/models/conditionalaccess';

type TabType = 'overview' | 'policies' | 'locations' | 'assignments';

interface DiscoveryProgress {
  current: number;
  total: number;
  message: string;
  percentage: number;
}

interface CADiscoveryState {
  config: Partial<CADiscoveryConfig>;
  result: CADiscoveryResult | null;
  isDiscovering: boolean;
  progress: DiscoveryProgress;
  activeTab: TabType;
  filter: CAFilterState;
  cancellationToken: string | null;
  error: string | null;
}

export const useConditionalAccessDiscoveryLogic = () => {
  // Combined state for better performance
  const [state, setState] = useState<CADiscoveryState>({
    config: {
      includeAssignments: true,
      includeConditions: true,
      includeControls: true,
      timeout: 300000
    },
    result: null,
    isDiscovering: false,
    progress: { current: 0, total: 100, message: '', percentage: 0 },
    activeTab: 'overview',
    filter: { searchText: '', selectedStates: [] },
    cancellationToken: null,
    error: null
  });

  // Progress tracking via IPC events
  useEffect(() => {
    const unsubscribe = window.electronAPI?.onProgress?.((data: any) => {
      if (data.type === 'ca-discovery' && data.token === state.cancellationToken) {
        setState(prev => ({
          ...prev,
          progress: {
            current: data.current || 0,
            total: data.total || 100,
            message: data.message || '',
            percentage: data.percentage || 0
          }
        }));
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [state.cancellationToken]);

  // Start discovery
  const startDiscovery = useCallback(async () => {
    const token = `ca-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setState(prev => ({
      ...prev,
      isDiscovering: true,
      cancellationToken: token,
      error: null,
      progress: { current: 0, total: 100, message: 'Initializing...', percentage: 0 }
    }));

    try {
      const discoveryResult = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/ConditionalAccessDiscovery.psm1',
        functionName: 'Invoke-CADiscovery',
        parameters: {
          ...state.config,
          cancellationToken: token
        },
      });

      setState(prev => ({
        ...prev,
        result: discoveryResult.data,
        isDiscovering: false,
        cancellationToken: null,
        progress: { current: 100, total: 100, message: 'Completed', percentage: 100 }
      }));
    } catch (error: any) {
      console.error('CA Discovery failed:', error);
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        cancellationToken: null,
        error: error.message || 'Discovery failed'
      }));
    }
  }, [state.config]);

  // Cancel discovery
  const cancelDiscovery = useCallback(async () => {
    if (state.cancellationToken) {
      try {
        await window.electronAPI.cancelExecution(state.cancellationToken);
      } catch (error) {
        console.error('Failed to cancel discovery:', error);
      }
    }
    setState(prev => ({
      ...prev,
      isDiscovering: false,
      cancellationToken: null,
      progress: { current: 0, total: 100, message: 'Cancelled', percentage: 0 }
    }));
  }, [state.cancellationToken]);

  // Export to CSV
  const exportToCSV = useCallback(async () => {
    if (!state.result) return;

    try {
      const csvData = convertToCSV(state.activeTab === 'policies' ? state.result.policies : state.result.namedLocations);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ca-${state.activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [state.result, state.activeTab]);

  // Export to Excel (via IPC to PowerShell)
  const exportToExcel = useCallback(async () => {
    if (!state.result) return;

    try {
      await window.electronAPI.executeModule({
        modulePath: 'Modules/Export/ExportToExcel.psm1',
        functionName: 'Export-CAData',
        parameters: {
          data: state.result,
          tab: state.activeTab,
          filename: `ca-${state.activeTab}-${new Date().toISOString().split('T')[0]}.xlsx`
        }
      });
    } catch (error) {
      console.error('Excel export failed:', error);
    }
  }, [state.result, state.activeTab]);

  // Policies columns
  const policiesColumns = useMemo<ColDef[]>(() => [
    { field: 'displayName', headerName: 'Policy Name', sortable: true, filter: true, width: 300 },
    { field: 'state', headerName: 'State', sortable: true, filter: true, width: 150 },
    { field: 'createdDateTime', headerName: 'Created', sortable: true, filter: true, width: 180,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString() },
    { field: 'modifiedDateTime', headerName: 'Modified', sortable: true, filter: true, width: 180,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString() },
    { field: 'conditions.users', headerName: 'User Conditions', sortable: false, filter: false, width: 200,
      valueFormatter: (params) => `${params.value?.includeUsers?.length || 0} users, ${params.value?.includeGroups?.length || 0} groups` },
    { field: 'grantControls.builtInControls', headerName: 'Controls', sortable: false, filter: false, width: 250,
      valueFormatter: (params) => params.value?.join(', ') || 'None' }
  ], []);

  // Locations columns
  const locationsColumns = useMemo<ColDef[]>(() => [
    { field: 'displayName', headerName: 'Location Name', sortable: true, filter: true, width: 300 },
    { field: 'isTrusted', headerName: 'Trusted', sortable: true, filter: true, width: 120,
      valueFormatter: (params) => params.value ? 'Yes' : 'No' },
    { field: 'ipRanges', headerName: 'IP Ranges', sortable: false, filter: false, width: 300,
      valueFormatter: (params) => params.value?.map((r: any) => r.cidrAddress).join(', ') || 'None' },
    { field: 'countriesAndRegions', headerName: 'Countries', sortable: false, filter: false, width: 200,
      valueFormatter: (params) => params.value?.join(', ') || 'None' },
    { field: 'createdDateTime', headerName: 'Created', sortable: true, filter: true, width: 180,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString() }
  ], []);

  // Dynamic columns based on active tab
  const columns = useMemo(() => {
    switch (state.activeTab) {
      case 'policies':
        return policiesColumns;
      case 'locations':
        return locationsColumns;
      case 'assignments':
        return policiesColumns; // Reuse with different data
      default:
        return [];
    }
  }, [state.activeTab, policiesColumns, locationsColumns]);

  // Filtered data with debouncing
  const filteredData = useMemo(() => {
    let data: any[] = [];

    switch (state.activeTab) {
      case 'policies':
      case 'assignments':
        data = state.result?.policies || [];
        break;
      case 'locations':
        data = state.result?.namedLocations || [];
        break;
      default:
        return [];
    }

    // Apply search filter
    if (state.filter.searchText) {
      const searchLower = state.filter.searchText.toLowerCase();
      data = data.filter(item =>
        JSON.stringify(item).toLowerCase().includes(searchLower)
      );
    }

    // Apply state filter for policies
    if (state.activeTab === 'policies' && state.filter.selectedStates.length > 0) {
      data = data.filter((policy: ConditionalAccessPolicy) =>
        state.filter.selectedStates.includes(policy.state)
      );
    }

    return data;
  }, [state.result, state.activeTab, state.filter]);

  // Statistics calculation
  const stats = useMemo<CAStats | null>(() => {
    if (!state.result?.policies) return null;

    const policies = state.result.policies ?? [];
    const enabledCount = policies.filter(p => p.state === 'enabled').length;
    const reportOnlyCount = policies.filter(p => p.state === 'enabledForReportingButNotEnforced').length;

    const policiesByCondition: Record<string, number> = {
      'With MFA': policies.filter(p => p.grantControls?.builtInControls?.includes('mfa')).length,
      'With Approved App': policies.filter(p => p.grantControls?.builtInControls?.includes('approvedApplication')).length,
      'With Compliant Device': policies.filter(p => p.grantControls?.builtInControls?.includes('compliantDevice')).length,
      'Block Access': policies.filter(p => p.grantControls?.builtInControls?.includes('block')).length
    };

    return {
      totalPolicies: policies.length,
      enabledPolicies: enabledCount,
      reportOnlyPolicies: reportOnlyCount,
      policiesByCondition
    };
  }, [state.result]);

  // Update config
  const updateConfig = useCallback((updates: Partial<CADiscoveryConfig>) => {
    setState(prev => ({ ...prev, config: { ...prev.config, ...updates } }));
  }, []);

  // Update filter
  const updateFilter = useCallback((updates: Partial<CAFilterState>) => {
    setState(prev => ({ ...prev, filter: { ...prev.filter, ...updates } }));
  }, []);

  // Set active tab
  const setActiveTab = useCallback((tab: TabType) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  return {
    // State
    config: state.config,
    result: state.result,
    isDiscovering: state.isDiscovering,
    progress: state.progress,
    activeTab: state.activeTab,
    filter: state.filter,
    error: state.error,

    // Data
    columns,
    filteredData,
    stats,

    // Actions
    updateConfig,
    updateFilter,
    setActiveTab,
    startDiscovery,
    cancelDiscovery,
    exportToCSV,
    exportToExcel
  };
};

// Helper function to convert data to CSV
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map(item =>
    headers.map(header => {
      const value = item[header];
      if (typeof value === 'object') return JSON.stringify(value);
      return value;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}
