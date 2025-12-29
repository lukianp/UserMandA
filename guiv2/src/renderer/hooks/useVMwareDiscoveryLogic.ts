import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { ColDef } from 'ag-grid-community';

import type {
  VMwareDiscoveryConfig,
  VMwareDiscoveryResult,
  VMwareHost,
  VMwareVM,
  VMwareCluster,
  VMwareDiscoveryTemplate,
} from '../types/models/vmware';
import { VMWARE_TEMPLATES } from '../types/models/vmware';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { useProfileStore } from '../store/useProfileStore';

/**
 * Log Entry Interface for PowerShellExecutionDialog
 */
export interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

export interface VMwareDiscoveryLogicState {
  config: VMwareDiscoveryConfig;
  result: VMwareDiscoveryResult | null;
  isLoading: boolean;
  isCancelling: boolean;
  progress: number;
  error: string | null;
  searchText: string;
  activeTab: 'overview' | 'hosts' | 'vms' | 'clusters';
  templates: VMwareDiscoveryTemplate[];
  logs: LogEntry[];
  showExecutionDialog: boolean;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const useVMwareDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { getResultsByModuleName, addResult } = useDiscoveryStore();

  const [config, setConfig] = useState<VMwareDiscoveryConfig>({
    vCenters: [],
    includeHosts: true,
    includeVMs: true,
    includeClusters: true,
    includeDatastores: true,
    includeNetworking: false,
    includeResourcePools: false,
    includeSnapshots: false,
    includeTemplates: false,
    collectPerformanceMetrics: true,
    detectSecurityIssues: false,
    timeout: 300,
    parallelScans: 5,
  });

  const [result, setResult] = useState<VMwareDiscoveryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'hosts' | 'vms' | 'clusters'>('overview');
  const [cancellationToken, setCancellationToken] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);

  const currentTokenRef = useRef<string | null>(null);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[VMwareDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const message = data.message || '';
        console.log('[VMwareDiscoveryHook] Progress:', message);
        const logLevel: LogEntry['level'] = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warning' : 'info';
        const logEntry: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          message: message,
          level: logLevel,
        };
        setLogs(prev => [...prev, logEntry]);
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const discoveryResult = {
          id: `vmware-discovery-${Date.now()}`,
          name: 'VMware Discovery',
          moduleName: 'VMware',
          displayName: 'VMware Discovery',
          itemCount: data?.result?.vms?.length || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.vms?.length || 0} VMware VMs`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        const successLog: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          message: `Discovery completed! Found ${discoveryResult.itemCount} VMs.`,
          level: 'success',
        };
        setLogs(prev => [...prev, successLog]);
        setResult(data.result as VMwareDiscoveryResult);
        setIsLoading(false);
        setIsCancelling(false);
        setProgress(100);
        setCancellationToken(null);

        addResult(discoveryResult);
        console.log(`[VMwareDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} VMs.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const errorLog: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          message: `Discovery failed: ${data.error}`,
          level: 'error',
        };
        setLogs(prev => [...prev, errorLog]);
        setError(data.error);
        setIsLoading(false);
        setIsCancelling(false);
        setCancellationToken(null);
        console.error(`[VMwareDiscoveryHook] Discovery failed: ${data.error}`);
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const cancelLog: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          message: 'Discovery cancelled by user',
          level: 'warning',
        };
        setLogs(prev => [...prev, cancelLog]);
        setIsLoading(false);
        setIsCancelling(false);
        setProgress(0);
        setCancellationToken(null);
        console.warn('[VMwareDiscoveryHook] Discovery cancelled by user');
      }
    });

    return () => {
      unsubscribeOutput?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeCancelled?.();
    };
  }, []);

  const templates: VMwareDiscoveryTemplate[] = VMWARE_TEMPLATES.map(template => ({
    ...template,
    id: template.name.toLowerCase().replace(/\s+/g, '-'),
    createdDate: new Date().toISOString(),
    modifiedDate: new Date().toISOString(),
    createdBy: 'system',
  }));

  // Load previous discovery results from store on mount
  useEffect(() => {
    const previousResults = getResultsByModuleName('VMwareDiscovery');
    if (previousResults && previousResults.length > 0) {
      console.log('[VMwareDiscoveryHook] Restoring', previousResults.length, 'previous results from store');
      const latestResult = previousResults[previousResults.length - 1];
      setResult(latestResult.additionalData as VMwareDiscoveryResult);
    }
  }, [getResultsByModuleName]);

  const handleStartDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      const errorMessage = 'No company profile selected. Please select a profile first.';
      setError(errorMessage);
      console.error('[VMwareDiscoveryHook]', errorMessage);
      return;
    }

    if (isLoading) return;

    const token = `vmware-discovery-${Date.now()}`;
    currentTokenRef.current = token;

    const initialLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      message: `Starting VMware discovery for ${selectedSourceProfile.companyName}...`,
      level: 'info',
    };
    setLogs([initialLog]);
    setShowExecutionDialog(true);
    setIsLoading(true);
    setProgress(0);
    setError(null);
    setResult(null);
    setCancellationToken(token);

    console.log(`[VMwareDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log(`[VMwareDiscoveryHook] Parameters:`, {
      VCenters: config.vCenters,
      IncludeHosts: config.includeHosts,
      IncludeVMs: config.includeVMs
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'VMware',
        parameters: {
          VCenters: config.vCenters,
          IncludeHosts: config.includeHosts,
          IncludeVMs: config.includeVMs,
          IncludeClusters: config.includeClusters,
          IncludeDatastores: config.includeDatastores,
          IncludeSnapshots: config.includeSnapshots,
          IncludeNetworking: config.includeNetworking,
          Timeout: config.timeout,
        },
        executionOptions: {
          timeout: (config.timeout || 300) * 1000,
          showWindow: false,
        },
        executionId: token,
      });

      console.log('[VMwareDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[VMwareDiscoveryHook] Discovery failed:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);
      setCancellationToken(null);
      currentTokenRef.current = null;
    }
  }, [selectedSourceProfile, config, isLoading]);

  const cancelDiscovery = useCallback(async () => {
    if (!isLoading || !cancellationToken) return;

    const cancelLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      message: 'Cancelling discovery...',
      level: 'warning',
    };
    setLogs(prev => [...prev, cancelLog]);
    setIsCancelling(true);

    console.warn('[VMwareDiscoveryHook] Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(cancellationToken);
      console.log('[VMwareDiscoveryHook] Discovery cancellation requested successfully');

      setTimeout(() => {
        setIsLoading(false);
        setIsCancelling(false);
        setProgress(0);
        setCancellationToken(null);
        currentTokenRef.current = null;
        console.warn('[VMwareDiscoveryHook] Discovery cancelled');
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'Error cancelling discovery';
      console.error('[VMwareDiscoveryHook]', errorMessage);
      setIsLoading(false);
      setIsCancelling(false);
      setCancellationToken(null);
      currentTokenRef.current = null;
    }
  }, [isLoading, cancellationToken]);

  /**
   * Clear all logs
   */
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const handleApplyTemplate = (template: VMwareDiscoveryTemplate) => {
    setConfig((prev) => ({
      ...prev,
      name: template.name,
      parameters: { ...template.config },
    }));
  };

  const handleExport = async () => {
    if (!result) return;

    try {
      const csvContent = generateCSV(result);
      await window.electronAPI.writeFile(
        `VMwareDiscovery_${new Date().toISOString().split('T')[0]}.csv`,
        csvContent
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  const generateCSV = (data: VMwareDiscoveryResult): string => {
    const headers = ['Type', 'Name', 'Cluster', 'Status', 'CPU', 'Memory', 'Details'];
    const rows: string[][] = [];

    (data?.hosts ?? []).forEach((host) => {
      rows.push([
        'Host',
        host.name ?? 'Unknown',
        host.cluster ?? 'N/A',
        host.status ?? 'Unknown',
        `${host.cpuCores ?? 0} cores`,
        formatBytes((host.memoryGB ?? 0) * 1024 * 1024 * 1024),
        `VMs: ${host.vmCount ?? 0}`,
      ]);
    });

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  };

  // Filter data based on search text
  const filteredHosts = useMemo(() => {
    if (!result) return [];
    const hosts = result?.hosts ?? [];
    if (!searchText) return hosts;

    const search = searchText.toLowerCase();
    return hosts.filter(
      (host) =>
        (host.name ?? '').toLowerCase().includes(search) ||
        host.cluster?.toLowerCase().includes(search) ||
        (host.version ?? '').toLowerCase().includes(search)
    );
  }, [result, searchText]);

  const filteredVMs = useMemo(() => {
    if (!result) return [];
    const vms = result?.vms ?? [];
    if (!searchText) return vms;

    const search = searchText.toLowerCase();
    return vms.filter(
      (vm) =>
        (vm.name ?? '').toLowerCase().includes(search) ||
        (vm.guestOS ?? '').toLowerCase().includes(search) ||
        (vm.powerState ?? '').toLowerCase().includes(search)
    );
  }, [result, searchText]);

  const filteredClusters = useMemo(() => {
    if (!result) return [];
    const clusters = result?.clusters ?? [];
    if (!searchText) return clusters;

    const search = searchText.toLowerCase();
    return clusters.filter((cluster) => (cluster.name ?? '').toLowerCase().includes(search));
  }, [result, searchText]);

  // AG Grid column definitions
  const hostColumns: ColDef<VMwareHost>[] = [
    { field: 'name', headerName: 'Host Name', sortable: true, filter: true, flex: 1.5 },
    { field: 'version', headerName: 'Version', sortable: true, filter: true, flex: 1 },
    { field: 'cluster', headerName: 'Cluster', sortable: true, filter: true, flex: 1 },
    { field: 'vmCount', headerName: 'VMs', sortable: true, filter: true, flex: 0.7 },
    { field: 'cpuCores', headerName: 'CPU Cores', sortable: true, filter: true, flex: 0.8 },
    {
      field: 'memoryGB',
      headerName: 'Memory',
      sortable: true,
      filter: true,
      flex: 0.8,
      valueFormatter: (params) => `${params.value} GB`,
    },
    { field: 'uptime', headerName: 'Uptime (days)', sortable: true, filter: true, flex: 0.8 },
    { field: 'status', headerName: 'Status', sortable: true, filter: true, flex: 0.8 },
  ];

  const vmColumns: ColDef<VMwareVM>[] = [
    { field: 'name', headerName: 'VM Name', sortable: true, filter: true, flex: 1.5 },
    { field: 'powerState', headerName: 'Power State', sortable: true, filter: true, flex: 0.8 },
    { field: 'guestOS', headerName: 'Guest OS', sortable: true, filter: true, flex: 1.2 },
    { field: 'cpuCount', headerName: 'CPUs', sortable: true, filter: true, flex: 0.6 },
    {
      field: 'memoryGB',
      headerName: 'Memory',
      sortable: true,
      filter: true,
      flex: 0.7,
      valueFormatter: (params) => `${params.value} GB`,
    },
    {
      field: 'diskGB',
      headerName: 'Disk',
      sortable: true,
      filter: true,
      flex: 0.8,
      valueFormatter: (params) => `${params.value} GB`,
    },
    { field: 'toolsStatus', headerName: 'Tools', sortable: true, filter: true, flex: 0.8 },
    { field: 'snapshotCount', headerName: 'Snapshots', sortable: true, filter: true, flex: 0.8 },
  ];

  const clusterColumns: ColDef<VMwareCluster>[] = [
    { field: 'name', headerName: 'Cluster Name', sortable: true, filter: true, flex: 1.5 },
    { field: 'hostCount', headerName: 'Hosts', sortable: true, filter: true, flex: 0.7 },
    { field: 'vmCount', headerName: 'VMs', sortable: true, filter: true, flex: 0.7 },
    { field: 'drsEnabled', headerName: 'DRS', sortable: true, filter: true, flex: 0.6 },
    { field: 'haEnabled', headerName: 'HA', sortable: true, filter: true, flex: 0.6 },
    { field: 'totalCpuCores', headerName: 'Total CPU', sortable: true, filter: true, flex: 0.8 },
    {
      field: 'totalMemoryGB',
      headerName: 'Total Memory',
      sortable: true,
      filter: true,
      flex: 1,
      valueFormatter: (params) => `${params.value} GB`,
    },
  ];

  // Statistics
  const stats = useMemo(() => {
    if (!result) return null;

    const totalHosts = result?.hosts?.length ?? 0;
    const totalVMs = result?.vms?.length ?? 0;
    const poweredOnVMs = (result?.vms ?? []).filter((vm) => vm.powerState === 'PoweredOn').length;
    const totalClusters = result?.clusters?.length ?? 0;
    const totalStorageTB = (result?.datastores ?? []).reduce((sum, ds) => sum + ds.capacityGB, 0) / 1024 || 0;
    const usedStorageTB = (result?.datastores ?? []).reduce((sum, ds) => sum + (ds.capacityGB - (ds.freeGB || ds.freeSpaceGB)), 0) / 1024 || 0;

    return {
      totalHosts,
      totalVMs,
      poweredOnVMs,
      totalClusters,
      totalStorageTB,
      usedStorageTB,
    };
  }, [result]);

  return {
    config,
    setConfig,
    result,
    isLoading,
    isCancelling,
    progress,
    error,
    searchText,
    setSearchText,
    activeTab,
    setActiveTab,
    templates,
    handleStartDiscovery,
    cancelDiscovery,
    handleApplyTemplate,
    handleExport,
    filteredHosts,
    filteredVMs,
    filteredClusters,
    hostColumns,
    vmColumns,
    clusterColumns,
    stats,
    // PowerShellExecutionDialog state
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
    clearLogs,
  };
};
