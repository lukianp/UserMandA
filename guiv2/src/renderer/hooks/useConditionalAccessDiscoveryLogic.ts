/**
 * Conditional Access Policies Discovery Logic Hook
 * Production-ready business logic for CA policy discovery and analysis
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { ColDef } from 'ag-grid-community';
import type { PowerShellLog } from '../components/molecules/PowerShellExecutionDialog';

import {
  CADiscoveryConfig,
  CADiscoveryResult,
  CAFilterState,
  ConditionalAccessPolicy,
  NamedLocation,
  CAStats,
  PolicyState
} from '../types/models/conditionalaccess';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { getElectronAPI } from '../lib/electron-api-fallback';

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
  // Get selected profile from store
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult } = useDiscoveryStore();

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

  const [logs, setLogs] = useState<Array<{ timestamp: string; level: 'info' | 'warning' | 'error'; message: string }>>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const currentTokenRef = useRef<string | null>(null); // ✅ ADDED: Ref for event matching

  const addLog = useCallback((level: 'info' | 'warning' | 'error', message: string) => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
    }]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // ✅ ADDED: Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[CADiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const logLevel = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warning' : 'info';
        console.log(`[CADiscoveryHook] ${logLevel}: ${data.message}`);

        // Update progress message
        setState(prev => ({
          ...prev,
          progress: {
            ...prev.progress,
            message: data.message
          }
        }));
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[CADiscoveryHook] Discovery completed:', data);

        const result = {
          id: `ca-discovery-${Date.now()}`,
          name: 'Conditional Access Discovery',
          moduleName: 'ConditionalAccess',
          displayName: 'Conditional Access Discovery',
          itemCount: data?.result?.totalItems || data?.result?.RecordCount || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.policies?.length || 0} Conditional Access policies`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setState(prev => ({
          ...prev,
          result: data.result || data,
          isDiscovering: false,
          cancellationToken: null,
          progress: { current: 100, total: 100, message: 'Completed', percentage: 100 }
        }));

        addResult(result); // ✅ ADDED: Store in discovery store
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[CADiscoveryHook] Discovery error:', data.error);
        setState(prev => ({
          ...prev,
          isDiscovering: false,
          cancellationToken: null,
          error: data.error
        }));
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[CADiscoveryHook] Discovery cancelled');
        setState(prev => ({
          ...prev,
          isDiscovering: false,
          cancellationToken: null,
          progress: { current: 0, total: 100, message: 'Cancelled', percentage: 0 }
        }));
      }
    });

    return () => {
      unsubscribeOutput?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeCancelled?.();
    };
  }, []); // ✅ FIXED: Empty dependency array - critical for proper event handling

  // Start discovery
  // ✅ FIXED: Now uses event-driven executeDiscovery API
  const startDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      const errorMessage = 'No company profile selected. Please select a profile first.';
      setState(prev => ({ ...prev, error: errorMessage }));
      addLog('error', errorMessage);
      return;
    }

    setShowExecutionDialog(true);
    const token = `ca-discovery-${Date.now()}`;
    setState(prev => ({
      ...prev,
      isDiscovering: true,
      cancellationToken: token,
      error: null,
      progress: { current: 0, total: 100, message: 'Initializing...', percentage: 0 }
    }));
    setLogs([]);

    currentTokenRef.current = token; // ✅ CRITICAL: Update ref for event matching

    addLog('info', `Starting discovery for company: ${selectedSourceProfile.companyName}`);
    addLog('info', `Parameters: Assignments=${state.config.includeAssignments}, Conditions=${state.config.includeConditions}, Controls=${state.config.includeControls}`);

    try {
      // ✅ FIXED: Use new event-driven API instead of deprecated executeDiscoveryModule
      const result = await window.electron.executeDiscovery({
        moduleName: 'ConditionalAccess',
        parameters: {
          IncludeAssignments: state.config.includeAssignments,
          IncludeConditions: state.config.includeConditions,
          IncludeControls: state.config.includeControls,
        },
        executionOptions: {  // ✅ ADDED: Missing execution options
          timeout: 300000,   // 5 minutes for Conditional Access discovery
          showWindow: false, // Use integrated dialog
        },
        executionId: token, // ✅ CRITICAL: Pass token for event matching
      });

      console.log('[ConditionalAccessDiscovery] Discovery execution initiated:', result);

      // Note: Completion will be handled by the discovery:complete event listener
    } catch (error: any) {
      console.error('[ConditionalAccessDiscovery] Discovery failed:', error);
      const errorMessage = error.message || 'Discovery failed';
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        cancellationToken: null,
        error: errorMessage
      }));
      currentTokenRef.current = null;
    }
  }, [selectedSourceProfile, state.config]);

  // Cancel discovery
  // ✅ FIXED: Now properly cancels PowerShell process
  const cancelDiscovery = useCallback(async () => {
    if (!state.isDiscovering || !state.cancellationToken) return;

    setIsCancelling(true);
    addLog('warning', 'Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(state.cancellationToken);
      addLog('info', 'Discovery cancellation requested successfully');

      // Set timeout as fallback in case cancelled event doesn't fire
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isDiscovering: false,
          cancellationToken: null,
          progress: { current: 0, total: 100, message: 'Cancelled', percentage: 0 }
        }));
        setIsCancelling(false);
        currentTokenRef.current = null;
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'Error cancelling discovery';
      addLog('error', errorMessage);
      // Reset state even on error
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        cancellationToken: null,
        progress: { current: 0, total: 100, message: 'Cancelled', percentage: 0 }
      }));
      setIsCancelling(false);
      currentTokenRef.current = null;
    }
  }, [state.isDiscovering, state.cancellationToken, addLog]);

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
      data = (data ?? []).filter(item =>
        JSON.stringify(item).toLowerCase().includes(searchLower)
      );
    }

    // Apply state filter for policies
    if (state.activeTab === 'policies' && state.filter.selectedStates.length > 0) {
      data = (data ?? []).filter((policy: ConditionalAccessPolicy) =>
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
    isCancelling,
    progress: state.progress,
    activeTab: state.activeTab,
    filter: state.filter,
    error: state.error,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,

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
    clearLogs,
    exportToCSV,
    exportToExcel
  };
};

// Helper function to convert data to CSV
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = (data ?? []).map(item =>
    headers.map(header => {
      const value = item[header];
      if (typeof value === 'object') return JSON.stringify(value);
      return value;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}
