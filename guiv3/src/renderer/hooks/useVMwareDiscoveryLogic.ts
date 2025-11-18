import { useState, useMemo, useEffect } from 'react';
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

export interface VMwareDiscoveryLogicState {
  config: VMwareDiscoveryConfig;
  result: VMwareDiscoveryResult | null;
  isLoading: boolean;
  progress: number;
  error: string | null;
  searchText: string;
  activeTab: 'overview' | 'hosts' | 'vms' | 'clusters';
  templates: VMwareDiscoveryTemplate[];
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const useVMwareDiscoveryLogic = () => {
  const { getResultsByModuleName } = useDiscoveryStore();

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
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'hosts' | 'vms' | 'clusters'>('overview');

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
      setResult(latestResult);
    }
  }, [getResultsByModuleName]);

  const handleStartDiscovery = async () => {
    setIsLoading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 15, 95));
      }, 500);

      const scriptResult = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/VMwareDiscovery.psm1',
        functionName: 'Invoke-VMwareDiscovery',
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
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (scriptResult.success) {
        setResult(scriptResult.data as VMwareDiscoveryResult);
      } else {
        setError(scriptResult.error || 'VMware discovery failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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
    progress,
    error,
    searchText,
    setSearchText,
    activeTab,
    setActiveTab,
    templates,
    handleStartDiscovery,
    handleApplyTemplate,
    handleExport,
    filteredHosts,
    filteredVMs,
    filteredClusters,
    hostColumns,
    vmColumns,
    clusterColumns,
    stats,
  };
};
