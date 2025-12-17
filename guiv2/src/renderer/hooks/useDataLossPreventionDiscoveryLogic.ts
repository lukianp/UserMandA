/**
 * Data Loss Prevention Discovery Logic Hook
 * Production-ready business logic for DLP policy, rule, and incident discovery
 * ✅ FIXED: Now uses event-driven architecture with streaming support
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { ColDef } from 'ag-grid-community';

import {
  DLPDiscoveryConfig,
  DLPDiscoveryResult,
  DLPFilterState,
  DLPPolicy,
  DLPRule,
  DLPIncident,
  DLPStats,
  DLPMode
} from '../types/models/dlp';
import type { LogEntry } from './common/discoveryHookTypes';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

type TabType = 'overview' | 'policies' | 'rules' | 'incidents' | 'sensitive-types';

interface DiscoveryProgress {
  current: number;
  total: number;
  message: string;
  percentage: number;
}

interface DLPDiscoveryState {
  config: Partial<DLPDiscoveryConfig>;
  result: DLPDiscoveryResult | null;
  isDiscovering: boolean;
  progress: DiscoveryProgress;
  activeTab: TabType;
  filter: DLPFilterState;
  cancellationToken: string | null;
  error: string | null;
}

export const useDataLossPreventionDiscoveryLogic = () => {
  // Get selected profile from store
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult } = useDiscoveryStore();

  // Additional state for PowerShellExecutionDialog
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);

  /**
   * Add a log entry
   */
  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
    };
    setLogs(prev => [...prev, entry]);
  }, []);

  /**
   * Clear all logs
   */
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Combined state
  const [state, setState] = useState<DLPDiscoveryState>({
    config: {
      includePolicies: true,
      includeRules: true,
      includeIncidents: true,
      timeout: 300000
    },
    result: null,
    isDiscovering: false,
    progress: { current: 0, total: 100, message: '', percentage: 0 },
    activeTab: 'overview',
    filter: { searchText: '', selectedModes: [], selectedSeverities: [], showOnlyEnabled: false },
    cancellationToken: null,
    error: null
  });

  const currentTokenRef = useRef<string | null>(null); // ✅ ADDED: Ref for event matching

  // ✅ ADDED: Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[DLPDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const message = data.message || '';
        const logLevel = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warning' : 'info';
        addLog(logLevel, message);
        setState(prev => ({
          ...prev,
          progress: {
            ...prev.progress,
            message: message
          }
        }));
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const result = {
          id: `dlp-discovery-${Date.now()}`,
          name: 'DLP Discovery',
          moduleName: 'DLP',
          displayName: 'Data Loss Prevention Discovery',
          itemCount: data?.result?.totalItems || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalItems || 0} DLP items`,
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
        console.log(`[DLPDiscoveryHook] Discovery completed! Found ${result.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setState(prev => ({
          ...prev,
          isDiscovering: false,
          cancellationToken: null,
          error: data.error
        }));
        console.error(`[DLPDiscoveryHook] Discovery failed: ${data.error}`);
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setState(prev => ({
          ...prev,
          isDiscovering: false,
          cancellationToken: null,
          progress: { current: 0, total: 100, message: 'Discovery cancelled', percentage: 0 }
        }));
        console.warn('[DLPDiscoveryHook] Discovery cancelled by user');
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
      console.error('[DLPDiscovery]', errorMessage);
      return;
    }

    const token = `dlp-discovery-${Date.now()}`;
    setShowExecutionDialog(true);
    setState(prev => ({
      ...prev,
      isDiscovering: true,
      cancellationToken: token,
      error: null,
      progress: { current: 0, total: 100, message: 'Initializing DLP discovery...', percentage: 0 }
    }));

    currentTokenRef.current = token; // ✅ CRITICAL: Update ref for event matching

    console.log(`[DLPDiscovery] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log(`[DLPDiscovery] Parameters:`, {
      includePolicies: state.config.includePolicies,
      includeRules: state.config.includeRules,
      includeIncidents: state.config.includeIncidents
    });

    try {
      // ✅ FIXED: Use new event-driven API instead of deprecated executeDiscoveryModule
      const result = await window.electron.executeDiscovery({
        moduleName: 'DLP',
        parameters: {
          IncludePolicies: state.config.includePolicies,
          IncludeRules: state.config.includeRules,
          IncludeIncidents: state.config.includeIncidents
        },
        executionOptions: {  // ✅ ADDED: Missing execution options
          timeout: state.config.timeout || 300000,
          showWindow: false, // Use integrated dialog
        },
        executionId: token, // ✅ CRITICAL: Pass token for event matching
      });

      console.log('[DLPDiscovery] Discovery execution initiated:', result);

      // Note: Completion will be handled by the discovery:complete event listener
    } catch (error: any) {
      console.error('[DLPDiscovery] Discovery failed:', error);
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        cancellationToken: null,
        error: error.message || 'Discovery failed'
      }));
      currentTokenRef.current = null;
    }
  }, [selectedSourceProfile, state.config]);

  // Cancel discovery
  // ✅ FIXED: Now properly cancels PowerShell process
  const cancelDiscovery = useCallback(async () => {
    if (!state.cancellationToken) return;

    console.warn('[DLPDiscoveryHook] Cancelling discovery...');
    setIsCancelling(true);

    try {
      await window.electron.cancelDiscovery(state.cancellationToken);
      console.log('[DLPDiscoveryHook] Discovery cancellation requested successfully');

      // Set timeout as fallback in case cancelled event doesn't fire
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isDiscovering: false,
          cancellationToken: null,
          progress: { current: 0, total: 100, message: 'Discovery cancelled', percentage: 0 }
        }));
        currentTokenRef.current = null;
        setIsCancelling(false);
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'Error cancelling discovery';
      console.error('[DLPDiscoveryHook]', errorMessage);
      // Reset state even on error
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        cancellationToken: null,
        progress: { current: 0, total: 100, message: '', percentage: 0 }
      }));
      currentTokenRef.current = null;
      setIsCancelling(false);
    }
  }, [state.cancellationToken]);

  // Export to CSV
  const exportToCSV = useCallback(async () => {
    if (!state.result) return;

    try {
      let data: any[] = [];
      switch (state.activeTab) {
        case 'policies':
          data = state.result.policies;
          break;
        case 'rules':
          data = state.result.rules;
          break;
        case 'incidents':
          data = state.result.incidents;
          break;
        case 'sensitive-types':
          data = state.result.sensitiveInfoTypes;
          break;
      }

      const csvData = convertToCSV(data);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dlp-${state.activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [state.result, state.activeTab]);

  // Export to Excel
  const exportToExcel = useCallback(async () => {
    if (!state.result) return;

    try {
      await window.electronAPI.executeModule({
        modulePath: 'Modules/Export/ExportToExcel.psm1',
        functionName: 'Export-DLPData',
        parameters: {
          data: state.result,
          tab: state.activeTab,
          filename: `dlp-${state.activeTab}-${new Date().toISOString().split('T')[0]}.xlsx`
        }
      });
    } catch (error) {
      console.error('Excel export failed:', error);
    }
  }, [state.result, state.activeTab]);

  // Policies columns
  const policiesColumns = useMemo<ColDef[]>(() => [
    { field: 'name', headerName: 'Policy Name', sortable: true, filter: true, width: 300 },
    { field: 'mode', headerName: 'Mode', sortable: true, filter: true, width: 150 },
    { field: 'isEnabled', headerName: 'Enabled', sortable: true, filter: true, width: 100,
      valueFormatter: (params) => params.value ? 'Yes' : 'No' },
    { field: 'priority', headerName: 'Priority', sortable: true, filter: true, width: 100 },
    { field: 'locations', headerName: 'Locations', sortable: false, filter: false, width: 250,
      valueFormatter: (params) => params.value?.map((l: any) => l.type).join(', ') || 'None' },
    { field: 'lastModifiedDateTime', headerName: 'Modified', sortable: true, filter: true, width: 180,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString() }
  ], []);

  // Rules columns
  const rulesColumns = useMemo<ColDef[]>(() => [
    { field: 'name', headerName: 'Rule Name', sortable: true, filter: true, width: 300 },
    { field: 'policyId', headerName: 'Policy ID', sortable: true, filter: true, width: 250 },
    { field: 'mode', headerName: 'Mode', sortable: true, filter: true, width: 150 },
    { field: 'priority', headerName: 'Priority', sortable: true, filter: true, width: 100 },
    { field: 'isEnabled', headerName: 'Enabled', sortable: true, filter: true, width: 100,
      valueFormatter: (params) => params.value ? 'Yes' : 'No' },
    { field: 'conditions', headerName: 'Conditions', sortable: false, filter: false, width: 200,
      valueFormatter: (params) => `${params.value?.length || 0} condition(s)` },
    { field: 'actions', headerName: 'Actions', sortable: false, filter: false, width: 200,
      valueFormatter: (params) => `${params.value?.length || 0} action(s)` }
  ], []);

  // Incidents columns
  const incidentsColumns = useMemo<ColDef[]>(() => [
    { field: 'policyName', headerName: 'Policy', sortable: true, filter: true, width: 250 },
    { field: 'severity', headerName: 'Severity', sortable: true, filter: true, width: 120 },
    { field: 'status', headerName: 'Status', sortable: true, filter: true, width: 150 },
    { field: 'userPrincipalName', headerName: 'User', sortable: true, filter: true, width: 250 },
    { field: 'source', headerName: 'Source', sortable: true, filter: true, width: 150 },
    { field: 'location', headerName: 'Location', sortable: true, filter: true, width: 150 },
    { field: 'fileName', headerName: 'File', sortable: true, filter: true, width: 200 },
    { field: 'createdDateTime', headerName: 'Created', sortable: true, filter: true, width: 180,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString() }
  ], []);

  // Sensitive types columns
  const sensitiveTypesColumns = useMemo<ColDef[]>(() => [
    { field: 'name', headerName: 'Type Name', sortable: true, filter: true, width: 300 },
    { field: 'description', headerName: 'Description', sortable: true, filter: true, width: 400 },
    { field: 'publisherName', headerName: 'Publisher', sortable: true, filter: true, width: 200 },
    { field: 'state', headerName: 'State', sortable: true, filter: true, width: 120 }
  ], []);

  // Dynamic columns based on active tab
  const columns = useMemo(() => {
    switch (state.activeTab) {
      case 'policies':
        return policiesColumns;
      case 'rules':
        return rulesColumns;
      case 'incidents':
        return incidentsColumns;
      case 'sensitive-types':
        return sensitiveTypesColumns;
      default:
        return [];
    }
  }, [state.activeTab, policiesColumns, rulesColumns, incidentsColumns, sensitiveTypesColumns]);

  // Filtered data
  const filteredData = useMemo(() => {
    let data: any[] = [];

    switch (state.activeTab) {
      case 'policies':
        data = state.result?.policies || [];
        // Filter by mode
        if (state.filter.selectedModes.length > 0) {
          data = (data ?? []).filter((p: DLPPolicy) => state.filter.selectedModes.includes(p.mode));
        }
        // Filter by enabled status
        if (state.filter.showOnlyEnabled) {
          data = (data ?? []).filter((p: DLPPolicy) => p.isEnabled);
        }
        break;
      case 'rules':
        data = state.result?.rules || [];
        if (state.filter.selectedModes.length > 0) {
          data = (data ?? []).filter((r: DLPRule) => state.filter.selectedModes.includes(r.mode));
        }
        break;
      case 'incidents':
        data = state.result?.incidents || [];
        if (state.filter.selectedSeverities.length > 0) {
          data = (data ?? []).filter((i: DLPIncident) => state.filter.selectedSeverities.includes(i.severity));
        }
        break;
      case 'sensitive-types':
        data = state.result?.sensitiveInfoTypes || [];
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

    return data;
  }, [state.result, state.activeTab, state.filter]);

  // Statistics calculation
  const stats = useMemo<DLPStats | null>(() => {
    if (!state.result) return null;

    const policies = state.result.policies;
    const incidents = state.result.incidents ?? [];

    const incidentsBySeverity: Record<string, number> = {
      critical: incidents.filter(i => i.severity === 'critical').length,
      high: incidents.filter(i => i.severity === 'high').length,
      medium: incidents.filter(i => i.severity === 'medium').length,
      low: incidents.filter(i => i.severity === 'low').length
    };

    // Top 5 policies by incident count
    const policyIncidentCounts = incidents.reduce((acc, incident) => {
      acc[incident.policyName] = (acc[incident.policyName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPoliciesByIncidents = Object.entries(policyIncidentCounts)
      .map(([policyName, count]) => ({ policyName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalPolicies: (policies ?? []).length,
      enabledPolicies: (policies ?? []).filter(p => p.isEnabled).length,
      totalIncidents: incidents.length,
      incidentsBySeverity,
      topPoliciesByIncidents
    };
  }, [state.result]);

  // Update config
  const updateConfig = useCallback((updates: Partial<DLPDiscoveryConfig>) => {
    setState(prev => ({ ...prev, config: { ...prev.config, ...updates } }));
  }, []);

  // Update filter
  const updateFilter = useCallback((updates: Partial<DLPFilterState>) => {
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

    // PowerShellExecutionDialog integration
    showExecutionDialog,
    setShowExecutionDialog,
    logs,
    clearLogs,
    isCancelling,

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
  const rows = (data ?? []).map(item =>
    headers.map(header => {
      const value = item[header];
      if (typeof value === 'object') return JSON.stringify(value);
      return value;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}
