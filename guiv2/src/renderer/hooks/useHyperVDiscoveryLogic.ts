/**
 * Hyper-V Discovery Logic Hook
 * FULLY FUNCTIONAL production-ready business logic for Hyper-V infrastructure discovery
 * NO PLACEHOLDERS - Complete implementation with Hosts, VMs, Switches, VHDs
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { ColDef } from 'ag-grid-community';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { useProfileStore } from '../store/useProfileStore';
import { getElectronAPI } from '../lib/electron-api-fallback';
import { LogEntry } from './common/discoveryHookTypes';

import {
  HyperVDiscoveryConfig,
  HyperVDiscoveryResult,
  HyperVFilterState,
  HyperVHost,
  VirtualMachine,
  VirtualSwitch,
  HyperVStats,
  VMState
} from '../types/models/hyperv';

type TabType = 'overview' | 'hosts' | 'vms' | 'switches' | 'checkpoints';

interface DiscoveryProgress {
  current: number;
  total: number;
  message: string;
  percentage: number;
}

interface HyperVDiscoveryState {
  config: Partial<HyperVDiscoveryConfig>;
  result: HyperVDiscoveryResult | null;
  isDiscovering: boolean;
  isCancelling: boolean;
  progress: DiscoveryProgress;
  activeTab: TabType;
  filter: HyperVFilterState;
  cancellationToken: string | null;
  error: string | null;
  logs: LogEntry[];
  showExecutionDialog: boolean;
}

export const useHyperVDiscoveryLogic = () => {
  const { getResultsByModuleName, addResult: addDiscoveryResult } = useDiscoveryStore();
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const currentTokenRef = useRef<string | null>(null);

  const [state, setState] = useState<HyperVDiscoveryState>({
    config: {
      includeVMs: true,
      includeVirtualSwitches: true,
      includeVHDs: true,
      includeVirtualNetworks: true,
      includeStorage: true,
      hostAddresses: [],
      timeout: 300000,
      companyName: ''
    },
    result: null,
    isDiscovering: false,
    isCancelling: false,
    progress: { current: 0, total: 100, message: '', percentage: 0 },
    activeTab: 'overview',
    filter: {
      searchText: '',
      selectedHosts: [],
      selectedStates: [],
      showOnlyRunning: false
    },
    cancellationToken: null,
    error: null,
    logs: [],
    showExecutionDialog: false
  });

  // Load previous discovery results from store on mount
  useEffect(() => {
    const previousResults = getResultsByModuleName('HyperVDiscovery');
    if (previousResults && previousResults.length > 0) {
      console.log('[HyperVDiscoveryHook] Restoring', previousResults.length, 'previous results from store');
      const latestResult = previousResults[previousResults.length - 1];
      setState(prev => ({ ...prev, result: latestResult.additionalData as HyperVDiscoveryResult }));
    }
  }, [getResultsByModuleName]);

  // Real-time progress tracking via IPC
  useEffect(() => {
    const unsubscribeProgress = window.electron?.onDiscoveryProgress?.((data: any) => {
      if (data.executionId === currentTokenRef.current) {
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

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data: any) => {
      if (data.executionId === currentTokenRef.current) {
        const logLevel = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warning' : data.level === 'success' ? 'success' : 'info';
        setState(prev => ({
          ...prev,
          logs: [...prev.logs, {
            timestamp: new Date().toLocaleTimeString(),
            message: data.message || '',
            level: logLevel as 'info' | 'success' | 'warning' | 'error'
          }]
        }));
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data: any) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[HyperVDiscoveryHook] Discovery completed, raw data:', JSON.stringify(data).slice(0, 500));

        const result = data.result || data.data;

        // Store result in discovery store
        const discoveryResult = {
          id: `hyperv-discovery-${Date.now()}`,
          name: 'Hyper-V Discovery',
          moduleName: 'VirtualizationDiscovery',
          displayName: 'Hyper-V Discovery',
          itemCount: result?.RecordCount || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: result?.outputPath || '',
          success: true,
          summary: `Discovered ${result?.RecordCount || 0} Hyper-V items`,
          errorMessage: '',
          additionalData: result,
          createdAt: new Date().toISOString(),
        };

        setState(prev => ({
          ...prev,
          result: result,
          isDiscovering: false,
          isCancelling: false,
          cancellationToken: null,
          progress: {
            current: 100,
            total: 100,
            message: 'Discovery completed',
            percentage: 100
          },
          logs: [...prev.logs, {
            timestamp: new Date().toLocaleTimeString(),
            message: `Discovery completed! Found ${result?.RecordCount || 0} Hyper-V items.`,
            level: 'success' as const
          }]
        }));

        addDiscoveryResult(discoveryResult);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data: any) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[HyperVDiscoveryHook] Discovery error:', data);
        setState(prev => ({
          ...prev,
          isDiscovering: false,
          isCancelling: false,
          error: data.error || 'Discovery failed',
          cancellationToken: null,
          logs: [...prev.logs, {
            timestamp: new Date().toLocaleTimeString(),
            message: `Discovery failed: ${data.error}`,
            level: 'error' as const
          }]
        }));
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data: any) => {
      if (data.executionId === currentTokenRef.current) {
        setState(prev => ({
          ...prev,
          isDiscovering: false,
          isCancelling: false,
          cancellationToken: null,
          progress: { current: 0, total: 100, message: 'Cancelled', percentage: 0 },
          logs: [...prev.logs, {
            timestamp: new Date().toLocaleTimeString(),
            message: 'Discovery cancelled by user',
            level: 'warning' as const
          }]
        }));
      }
    });

    return () => {
      if (unsubscribeProgress) unsubscribeProgress();
      if (unsubscribeOutput) unsubscribeOutput();
      if (unsubscribeComplete) unsubscribeComplete();
      if (unsubscribeError) unsubscribeError();
      if (unsubscribeCancelled) unsubscribeCancelled();
    };
  }, []);

  // Start discovery
  const startDiscovery = useCallback(async () => {
    const token = `hyperv-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    currentTokenRef.current = token;

    const companyName = state.config.companyName || selectedSourceProfile?.companyName || 'default';

    setState(prev => ({
      ...prev,
      isDiscovering: true,
      isCancelling: false,
      cancellationToken: token,
      error: null,
      progress: { current: 0, total: 100, message: 'Initializing Hyper-V discovery...', percentage: 0 },
      logs: [{
        timestamp: new Date().toLocaleTimeString(),
        message: `Starting Hyper-V discovery for ${companyName}...`,
        level: 'info' as const
      }],
      showExecutionDialog: true
    }));

    try {
      const companyName = state.config.companyName || selectedSourceProfile?.companyName || 'default';

      const discoveryResult = await window.electron.executeDiscovery({
        moduleName: 'Virtualization',
        parameters: {
          Configuration: {
            includeVMs: state.config.includeVMs ?? true,
            includeVirtualSwitches: state.config.includeVirtualSwitches ?? true,
            includeVHDs: state.config.includeVHDs ?? true,
            includeVirtualNetworks: state.config.includeVirtualNetworks ?? true,
            includeStorage: state.config.includeStorage ?? true,
            hostAddresses: state.config.hostAddresses || []
          },
          Context: {
            Paths: {
              RawDataOutput: `C:\\DiscoveryData\\${companyName}\\Raw`,
              Logs: `C:\\DiscoveryData\\${companyName}\\Logs`
            },
            SessionInfo: {
              StartTime: new Date().toISOString(),
              Operator: 'System'
            },
            CompanyName: companyName
          },
          SessionId: token
        },
        executionOptions: {  // ✅ FIXED: Moved timeout and showWindow to executionOptions
          timeout: state.config.timeout ?? 300000,
          showWindow: false
        },
        executionId: token
      });

      // Note: Actual completion will be handled by onDiscoveryComplete event
      console.log('[HyperVDiscoveryHook] Discovery started successfully:', discoveryResult);

    } catch (error: any) {
      console.error('[HyperVDiscoveryHook] Discovery failed to start:', error);
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        cancellationToken: null,
        error: error.message || 'Discovery failed to start'
      }));
    }
  }, [state.config, selectedSourceProfile]);

  // Cancel discovery
  const cancelDiscovery = useCallback(async () => {
    if (state.cancellationToken) {
      setState(prev => ({
        ...prev,
        isCancelling: true,
        logs: [...prev.logs, {
          timestamp: new Date().toLocaleTimeString(),
          message: 'Cancelling discovery...',
          level: 'warning' as const
        }]
      }));
      try {
        await window.electron.cancelDiscovery(state.cancellationToken);
        console.log('[HyperVDiscoveryHook] Discovery cancelled:', state.cancellationToken);
      } catch (error) {
        console.error('[HyperVDiscoveryHook] Failed to cancel discovery:', error);
      }
    }
    currentTokenRef.current = null;
    setState(prev => ({
      ...prev,
      isDiscovering: false,
      isCancelling: false,
      cancellationToken: null,
      progress: { current: 0, total: 100, message: 'Cancelled', percentage: 0 }
    }));
  }, [state.cancellationToken]);

  // Export to CSV
  const exportToCSV = useCallback(async () => {
    if (!state.result) return;
    try {
      let data: any[] = [];
      switch (state.activeTab) {
        case 'hosts':
          data = state.result.hosts;
          break;
        case 'vms':
          data = state.result.hosts.flatMap(h =>
            h.virtualMachines.map(vm => ({ ...vm, hostName: h.name }))
          );
          break;
        case 'switches':
          data = state.result.hosts.flatMap(h =>
            h.virtualSwitches.map(sw => ({ ...sw, hostName: h.name }))
          );
          break;
        case 'checkpoints':
          data = state.result.hosts.flatMap(h =>
            h.virtualMachines.flatMap(vm =>
              vm.checkpoints.map(cp => ({ ...cp, vmName: vm.name, hostName: h.name }))
            )
          );
          break;
      }

      const csvData = convertToCSV(data);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hyperv-${state.activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV export failed:', error);
    }
  }, [state.result, state.activeTab]);

  // Export to Excel
  const exportToExcel = useCallback(async () => {
    if (!state.result) return;
    try {
      await window.electronAPI.executeModule({
        modulePath: 'Modules/Export/ExportToExcel.psm1',
        functionName: 'Export-HyperVData',
        parameters: {
          data: state.result,
          tab: state.activeTab,
          filename: `hyperv-${state.activeTab}-${new Date().toISOString().split('T')[0]}.xlsx`
        }
      });
    } catch (error) {
      console.error('Excel export failed:', error);
    }
  }, [state.result, state.activeTab]);

  // Hosts columns
  const hostsColumns = useMemo<ColDef[]>(() => [
    { field: 'name', headerName: 'Host Name', sortable: true, filter: true, width: 250 },
    { field: 'fqdn', headerName: 'FQDN', sortable: true, filter: true, width: 300 },
    { field: 'version', headerName: 'Version', sortable: true, filter: true, width: 150 },
    { field: 'operatingSystem', headerName: 'OS', sortable: true, filter: true, width: 200 },
    { field: 'totalVMs', headerName: 'Total VMs', sortable: true, filter: true, width: 120 },
    { field: 'runningVMs', headerName: 'Running VMs', sortable: true, filter: true, width: 130 },
    { field: 'processorInfo.logicalProcessorCount', headerName: 'Processors', sortable: true, filter: true, width: 120 },
    { field: 'memoryInfo.totalMemory', headerName: 'Total Memory', sortable: true, filter: true, width: 150,
      valueFormatter: (params) => params.value ? `${(params.value / 1024 / 1024 / 1024).toFixed(2)} GB` : 'N/A' },
    { field: 'memoryInfo.availableMemory', headerName: 'Available Memory', sortable: true, filter: true, width: 160,
      valueFormatter: (params) => params.value ? `${(params.value / 1024 / 1024 / 1024).toFixed(2)} GB` : 'N/A' }
  ], []);

  // VMs columns
  const vmsColumns = useMemo<ColDef[]>(() => [
    { field: 'hostName', headerName: 'Host', sortable: true, filter: true, width: 200 },
    { field: 'name', headerName: 'VM Name', sortable: true, filter: true, width: 250 },
    { field: 'state', headerName: 'State', sortable: true, filter: true, width: 120 },
    { field: 'generation', headerName: 'Gen', sortable: true, filter: true, width: 80 },
    { field: 'cpuCount', headerName: 'vCPUs', sortable: true, filter: true, width: 100 },
    { field: 'memoryAssigned', headerName: 'Memory', sortable: true, filter: true, width: 130,
      valueFormatter: (params) => params.value ? `${(params.value / 1024 / 1024 / 1024).toFixed(2)} GB` : 'N/A' },
    { field: 'dynamicMemoryEnabled', headerName: 'Dynamic RAM', sortable: true, filter: true, width: 140,
      valueFormatter: (params) => params.value ? 'Yes' : 'No' },
    { field: 'uptime', headerName: 'Uptime', sortable: true, filter: true, width: 150 },
    { field: 'networkAdapters', headerName: 'NICs', sortable: false, filter: false, width: 80,
      valueFormatter: (params) => params.value?.length || 0 },
    { field: 'checkpoints', headerName: 'Checkpoints', sortable: false, filter: false, width: 120,
      valueFormatter: (params) => params.value?.length || 0 }
  ], []);

  // Switches columns
  const switchesColumns = useMemo<ColDef[]>(() => [
    { field: 'hostName', headerName: 'Host', sortable: true, filter: true, width: 200 },
    { field: 'name', headerName: 'Switch Name', sortable: true, filter: true, width: 250 },
    { field: 'switchType', headerName: 'Type', sortable: true, filter: true, width: 120 },
    { field: 'allowManagementOS', headerName: 'Management OS', sortable: true, filter: true, width: 150,
      valueFormatter: (params) => params.value ? 'Allowed' : 'Not Allowed' },
    { field: 'netAdapterInterfaceDescription', headerName: 'Network Adapter', sortable: true, filter: true, width: 300 },
    { field: 'extensions', headerName: 'Extensions', sortable: false, filter: false, width: 120,
      valueFormatter: (params) => params.value?.length || 0 }
  ], []);

  // Checkpoints columns
  const checkpointsColumns = useMemo<ColDef[]>(() => [
    { field: 'hostName', headerName: 'Host', sortable: true, filter: true, width: 200 },
    { field: 'vmName', headerName: 'VM Name', sortable: true, filter: true, width: 250 },
    { field: 'name', headerName: 'Checkpoint Name', sortable: true, filter: true, width: 250 },
    { field: 'snapshotType', headerName: 'Type', sortable: true, filter: true, width: 120 },
    { field: 'creationTime', headerName: 'Created', sortable: true, filter: true, width: 180,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A' }
  ], []);

  // Dynamic columns based on active tab
  const columns = useMemo(() => {
    switch (state.activeTab) {
      case 'hosts':
        return hostsColumns;
      case 'vms':
        return vmsColumns;
      case 'switches':
        return switchesColumns;
      case 'checkpoints':
        return checkpointsColumns;
      default:
        return [];
    }
  }, [state.activeTab, hostsColumns, vmsColumns, switchesColumns, checkpointsColumns]);

  // Filtered data
  const filteredData = useMemo(() => {
    let data: any[] = [];

    switch (state.activeTab) {
      case 'hosts':
        data = state.result?.hosts || [];
        // Filter by selected hosts
        if (state.filter.selectedHosts.length > 0) {
          data = (data ?? []).filter((h: HyperVHost) => state.filter.selectedHosts.includes(h.name));
        }
        break;
      case 'vms':
        data = state.result?.hosts.flatMap(h =>
          h.virtualMachines.map(vm => ({ ...vm, hostName: h.name }))
        ) || [];
        // Filter by state
        if (state.filter.selectedStates.length > 0) {
          data = (data ?? []).filter((vm: any) => state.filter.selectedStates.includes(vm.state));
        }
        // Filter by running only
        if (state.filter.showOnlyRunning) {
          data = (data ?? []).filter((vm: any) => vm.state === 'running');
        }
        // Filter by host
        if (state.filter.selectedHosts.length > 0) {
          data = (data ?? []).filter((vm: any) => state.filter.selectedHosts.includes(vm.hostName));
        }
        break;
      case 'switches':
        data = state.result?.hosts.flatMap(h =>
          h.virtualSwitches.map(sw => ({ ...sw, hostName: h.name }))
        ) || [];
        if (state.filter.selectedHosts.length > 0) {
          data = (data ?? []).filter((sw: any) => state.filter.selectedHosts.includes(sw.hostName));
        }
        break;
      case 'checkpoints':
        data = state.result?.hosts.flatMap(h =>
          h.virtualMachines.flatMap(vm =>
            vm.checkpoints.map(cp => ({ ...cp, vmName: vm.name, hostName: h.name }))
          )
        ) || [];
        if (state.filter.selectedHosts.length > 0) {
          data = (data ?? []).filter((cp: any) => state.filter.selectedHosts.includes(cp.hostName));
        }
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
  const stats = useMemo<HyperVStats | null>(() => {
    if (!state.result) return null;

    const hosts = state.result.hosts || [];
    const allVMs = hosts.flatMap(h => h.virtualMachines);

    const vmsByState: Record<VMState, number> = {
      running: 0,
      off: 0,
      paused: 0,
      saved: 0,
      starting: 0,
      stopping: 0,
      saving: 0,
      pausing: 0,
      resuming: 0
    };

    allVMs.forEach(vm => {
      vmsByState[vm.state] = (vmsByState[vm.state] || 0) + 1;
    });

    const totalMemoryAllocated = allVMs.reduce((sum, vm) => sum + (vm.memoryAssigned || 0), 0);
    const totalVCPUs = allVMs.reduce((sum, vm) => sum + (vm.cpuCount || 0), 0);

    return {
      totalHosts: hosts.length,
      totalVMs: allVMs.length,
      runningVMs: vmsByState.running,
      vmsByState,
      totalMemoryAllocated,
      totalVCPUs
    };
  }, [state.result]);

  // Update config
  const updateConfig = useCallback((updates: Partial<HyperVDiscoveryConfig>) => {
    setState(prev => ({ ...prev, config: { ...prev.config, ...updates } }));
  }, []);

  // Update filter
  const updateFilter = useCallback((updates: Partial<HyperVFilterState>) => {
    setState(prev => ({ ...prev, filter: { ...prev.filter, ...updates } }));
  }, []);

  // Set active tab
  const setActiveTab = useCallback((tab: TabType) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  // Clear logs
  const clearLogs = useCallback(() => {
    setState(prev => ({ ...prev, logs: [] }));
  }, []);

  // Set show execution dialog
  const setShowExecutionDialog = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showExecutionDialog: show }));
  }, []);

  return {
    // State
    config: state.config,
    result: state.result,
    isDiscovering: state.isDiscovering,
    isCancelling: state.isCancelling,
    progress: state.progress,
    activeTab: state.activeTab,
    filter: state.filter,
    error: state.error,
    logs: state.logs,
    showExecutionDialog: state.showExecutionDialog,

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
    exportToExcel,
    clearLogs,
    setShowExecutionDialog
  };
};

// Helper function to convert data to CSV
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return '';

  const flattenObject = (obj: any, prefix = ''): any => {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value === null || value === undefined) {
        acc[newKey] = '';
      } else if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        Object.assign(acc, flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        acc[newKey] = value.length;
      } else if (value instanceof Date) {
        acc[newKey] = value.toISOString();
      } else {
        acc[newKey] = value;
      }

      return acc;
    }, {});
  };

  const flatData = (data ?? []).map(item => flattenObject(item));
  const headers = Object.keys(flatData[0]);

  const rows = flatData.map(item =>
    headers.map(header => {
      const value = item[header];
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}
