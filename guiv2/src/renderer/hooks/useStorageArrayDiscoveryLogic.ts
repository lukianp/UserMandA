/**
 * Storage Array Discovery Logic Hook
 * Contains all business logic for storage array discovery
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';
import type { LogEntry } from './common/discoveryHookTypes';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

type TabType = 'overview' | 'physical-disks' | 'volumes' | 'network-storage' | 'storage-spaces' | 'fc-iscsi';

interface StorageArrayDiscoveryConfig {
  includeVolumes: boolean;
  includeLUNs: boolean;
  includeStoragePools: boolean;
  includeDisks: boolean;
  includeControllers: boolean;
  includeSnapshots: boolean;
  maxResults: number;
  timeout: number;
  showWindow: boolean;
}

interface StorageArrayDiscoveryResult {
  totalArrays?: number;
  totalVolumes?: number;
  totalItems?: number;
  outputPath?: string;
  data?: any[];
  storageArrays?: any[];
  volumes?: any[];
  luns?: any[];
  storagePools?: any[];
  disks?: any[];
  controllers?: any[];
  snapshots?: any[];
  metadata?: {
    LocalStorageObjects?: number;
    NetworkStorageObjects?: number;
    StorageSpacesObjects?: number;
    FcIscsiObjects?: number;
    TotalPhysicalCapacityGB?: number;
    TotalFreeSpaceGB?: number;
    PhysicalDiskCount?: number;
    VolumeCount?: number;
    NetworkDriveCount?: number;
    SMBShareCount?: number;
    StoragePoolCount?: number;
    VirtualDiskCount?: number;
  };
  statistics?: {
    totalCapacityTB?: number;
    usedCapacityTB?: number;
    freeCapacityTB?: number;
    utilizationPercentage?: number;
  };
}

interface StorageArrayDiscoveryState {
  config: StorageArrayDiscoveryConfig;
  result: StorageArrayDiscoveryResult | null;
  isDiscovering: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
  activeTab: TabType;
  filter: {
    searchText: string;
    selectedTypes: string[];
    selectedStatuses: string[];
    showErrorsOnly: boolean;
  };
}

interface StorageStats {
  totalCapacityGB: number;
  totalFreeSpaceGB: number;
  physicalDiskCount: number;
  volumeCount: number;
  networkDriveCount: number;
  smbShareCount: number;
  storagePoolCount: number;
  virtualDiskCount: number;
  fcIscsiCount: number;
}

export const useStorageArrayDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  const [state, setState] = useState<StorageArrayDiscoveryState>({
    config: {
      includeVolumes: true,
      includeLUNs: true,
      includeStoragePools: true,
      includeDisks: true,
      includeControllers: true,
      includeSnapshots: true,
      maxResults: 1000,
      timeout: 900,
      showWindow: false,
    },
    result: null,
    isDiscovering: false,
    progress: {
      current: 0,
      total: 100,
      message: '',
      percentage: 0,
    },
    error: null,
    activeTab: 'overview',
    filter: {
      searchText: '',
      selectedTypes: [],
      selectedStatuses: [],
      showErrorsOnly: false,
    },
  });

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
    setLogs((prev) => [...prev, entry]);
  }, []);

  /**
   * Clear all logs
   */
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Load previous results on mount
  useEffect(() => {
    console.log('[StorageArrayDiscoveryHook] Loading previous results');
    const previousResults = getResultsByModuleName('StorageArrayDiscovery');
    if (previousResults && previousResults.length > 0) {
      const latestResult = previousResults[previousResults.length - 1];
      console.log('[StorageArrayDiscoveryHook] Found previous result:', latestResult);
      setState((prev) => ({
        ...prev,
        result: latestResult.additionalData as StorageArrayDiscoveryResult,
      }));
    }
  }, [getResultsByModuleName]);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[StorageArrayDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const logLevel = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warning' : 'info';
        addLog(logLevel, data.message);
        console.log('[StorageArrayDiscoveryHook] Discovery output:', data.message);
        setState((prev) => ({
          ...prev,
          progress: {
            ...prev.progress,
            message: data.message || '',
          },
        }));
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[StorageArrayDiscoveryHook] Discovery completed:', data);

        const discoveryResult = {
          id: `storage-array-discovery-${Date.now()}`,
          name: 'Storage Array Discovery',
          moduleName: 'StorageArrayDiscovery',
          displayName: 'Storage Array Discovery',
          itemCount: data?.result?.totalItems || data?.result?.totalArrays || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalArrays || 0} storage systems`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          result: data.result as StorageArrayDiscoveryResult,
          isDiscovering: false,
          progress: {
            current: 100,
            total: 100,
            message: 'Completed',
            percentage: 100,
          },
        }));

        addResult(discoveryResult);
        addLog('success', `Discovery completed! Found ${discoveryResult.itemCount} items.`);
        console.log(`[StorageArrayDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[StorageArrayDiscoveryHook] Discovery error:', data.error);
        addLog('error', data.error);
        setState((prev) => ({
          ...prev,
          isDiscovering: false,
          error: data.error,
          progress: {
            current: 0,
            total: 100,
            message: '',
            percentage: 0,
          },
        }));
        setIsCancelling(false);
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.warn('[StorageArrayDiscoveryHook] Discovery cancelled');
        addLog('warning', 'Discovery cancelled by user');
        setState((prev) => ({
          ...prev,
          isDiscovering: false,
          progress: {
            current: 0,
            total: 100,
            message: 'Discovery cancelled',
            percentage: 0,
          },
        }));
        setIsCancelling(false);
      }
    });

    return () => {
      unsubscribeOutput?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeCancelled?.();
    };
  }, [addResult, addLog]);

  const startDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      const errorMessage = 'No company profile selected. Please select a profile first.';
      setState((prev) => ({ ...prev, error: errorMessage }));
      console.error('[StorageArrayDiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    const token = `storage-array-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        message: 'Starting Storage Array discovery...',
        percentage: 0,
      },
    }));

    currentTokenRef.current = token;
    setShowExecutionDialog(true);
    addLog('info', 'Starting Storage Array Discovery...');
    addLog('info', `Company: ${selectedSourceProfile.companyName}`);

    console.log(`[StorageArrayDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'StorageArray',
        parameters: {
          IncludeVolumes: state.config.includeVolumes,
          IncludeLUNs: state.config.includeLUNs,
          IncludeStoragePools: state.config.includeStoragePools,
          IncludeDisks: state.config.includeDisks,
          IncludeControllers: state.config.includeControllers,
          IncludeSnapshots: state.config.includeSnapshots,
          MaxResults: state.config.maxResults,
          Timeout: state.config.timeout,
          ShowWindow: state.config.showWindow,
        },
        executionOptions: {
          timeout: state.config.timeout * 1000,
          showWindow: state.config.showWindow,
        },
        executionId: token,
      });

      console.log('[StorageArrayDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[StorageArrayDiscoveryHook] Discovery failed:', errorMessage);
      addLog('error', `Discovery failed: ${errorMessage}`);
      setState((prev) => ({
        ...prev,
        isDiscovering: false,
        error: errorMessage,
        progress: {
          current: 0,
          total: 100,
          message: '',
          percentage: 0,
        },
      }));
      currentTokenRef.current = null;
    }
  }, [selectedSourceProfile, state.config, state.isDiscovering, addLog]);

  const cancelDiscovery = useCallback(async () => {
    if (!state.isDiscovering || !currentTokenRef.current) return;

    console.warn('[StorageArrayDiscoveryHook] Cancelling discovery...');
    setIsCancelling(true);
    addLog('warning', 'Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[StorageArrayDiscoveryHook] Discovery cancellation requested successfully');

      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isDiscovering: false,
          progress: {
            current: 0,
            total: 100,
            message: 'Discovery cancelled',
            percentage: 0,
          },
        }));
        setIsCancelling(false);
        currentTokenRef.current = null;
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'Error cancelling discovery';
      console.error('[StorageArrayDiscoveryHook]', errorMessage);
      addLog('error', `Cancellation failed: ${errorMessage}`);
      setState((prev) => ({
        ...prev,
        isDiscovering: false,
        progress: {
          current: 0,
          total: 100,
          message: '',
          percentage: 0,
        },
      }));
      setIsCancelling(false);
      currentTokenRef.current = null;
    }
  }, [state.isDiscovering, addLog]);

  const updateConfig = useCallback((updates: Partial<StorageArrayDiscoveryConfig>) => {
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  }, []);

  const setActiveTab = useCallback((tab: TabType) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  const updateFilter = useCallback((updates: Partial<StorageArrayDiscoveryState['filter']>) => {
    setState((prev) => ({
      ...prev,
      filter: { ...prev.filter, ...updates },
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Column definitions for different tabs
  const physicalDiskColumns = useMemo<ColDef[]>(() => [
    { field: 'Model', headerName: 'Model', sortable: true, filter: true, width: 200 },
    { field: 'Manufacturer', headerName: 'Manufacturer', sortable: true, filter: true, width: 150 },
    { field: 'Size', headerName: 'Size (GB)', sortable: true, filter: true, width: 120, valueFormatter: (params) => params.value ? `${params.value} GB` : 'N/A' },
    { field: 'MediaType', headerName: 'Media Type', sortable: true, filter: true, width: 120 },
    { field: 'InterfaceType', headerName: 'Interface', sortable: true, filter: true, width: 100 },
    { field: 'Status', headerName: 'Status', sortable: true, filter: true, width: 100 },
    { field: 'DeviceID', headerName: 'Device ID', sortable: true, filter: true, width: 150 },
  ], []);

  const volumeColumns = useMemo<ColDef[]>(() => [
    { field: 'DriveLetter', headerName: 'Drive', sortable: true, filter: true, width: 80 },
    { field: 'Label', headerName: 'Label', sortable: true, filter: true, width: 150 },
    { field: 'FileSystem', headerName: 'File System', sortable: true, filter: true, width: 120 },
    { field: 'Size', headerName: 'Size (GB)', sortable: true, filter: true, width: 120, valueFormatter: (params) => params.value ? `${params.value} GB` : 'N/A' },
    { field: 'FreeSpace', headerName: 'Free Space (GB)', sortable: true, filter: true, width: 140, valueFormatter: (params) => params.value ? `${params.value} GB` : 'N/A' },
    { field: 'PercentFree', headerName: 'Free %', sortable: true, filter: true, width: 100, valueFormatter: (params) => params.value ? `${params.value}%` : 'N/A' },
  ], []);

  const networkStorageColumns = useMemo<ColDef[]>(() => [
    { field: 'DriveLetter', headerName: 'Drive', sortable: true, filter: true, width: 80 },
    { field: 'ProviderName', headerName: 'Network Path', sortable: true, filter: true, width: 300 },
    { field: 'Size', headerName: 'Size (GB)', sortable: true, filter: true, width: 120, valueFormatter: (params) => params.value ? `${params.value} GB` : 'N/A' },
    { field: 'FreeSpace', headerName: 'Free Space (GB)', sortable: true, filter: true, width: 140, valueFormatter: (params) => params.value ? `${params.value} GB` : 'N/A' },
  ], []);

  const storageSpacesColumns = useMemo<ColDef[]>(() => [
    { field: 'FriendlyName', headerName: 'Name', sortable: true, filter: true, width: 200 },
    { field: 'Size', headerName: 'Size (GB)', sortable: true, filter: true, width: 120, valueFormatter: (params) => params.value ? `${params.value} GB` : 'N/A' },
    { field: 'AllocatedSize', headerName: 'Allocated (GB)', sortable: true, filter: true, width: 140, valueFormatter: (params) => params.value ? `${params.value} GB` : 'N/A' },
    { field: 'HealthStatus', headerName: 'Health', sortable: true, filter: true, width: 120 },
  ], []);

  const fcIscsiColumns = useMemo<ColDef[]>(() => [
    { field: 'Name', headerName: 'Connection Name', sortable: true, filter: true, width: 200 },
    { field: 'TargetAddress', headerName: 'Target Address', sortable: true, filter: true, width: 200 },
    { field: 'InitiatorAddress', headerName: 'Initiator Address', sortable: true, filter: true, width: 200 },
    { field: 'ConnectionType', headerName: 'Type', sortable: true, filter: true, width: 100 },
    { field: 'Status', headerName: 'Status', sortable: true, filter: true, width: 100 },
  ], []);

  // Dynamic columns based on active tab
  const columns = useMemo<ColDef[]>(() => {
    switch (state.activeTab) {
      case 'physical-disks':
        return physicalDiskColumns;
      case 'volumes':
        return volumeColumns;
      case 'network-storage':
        return networkStorageColumns;
      case 'storage-spaces':
        return storageSpacesColumns;
      case 'fc-iscsi':
        return fcIscsiColumns;
      default:
        return physicalDiskColumns;
    }
  }, [state.activeTab, physicalDiskColumns, volumeColumns, networkStorageColumns, storageSpacesColumns, fcIscsiColumns]);

  // Filtered data based on active tab and filters
  const filteredData = useMemo(() => {
    if (!state.result?.data) return [];

    let data = state.result.data;
    const searchLower = state.filter.searchText.toLowerCase();

    // Filter by tab
    switch (state.activeTab) {
      case 'physical-disks':
        data = data.filter((item: any) => item.StorageType === 'PhysicalDisk');
        break;
      case 'volumes':
        data = data.filter((item: any) => item.StorageType === 'Volume');
        break;
      case 'network-storage':
        data = data.filter((item: any) => item.StorageType === 'NetworkDrive' || item.StorageType === 'SMBShare');
        break;
      case 'storage-spaces':
        data = data.filter((item: any) => item.StorageType === 'StoragePool' || item.StorageType === 'VirtualDisk');
        break;
      case 'fc-iscsi':
        data = data.filter((item: any) => item._DataType === 'FcIscsi');
        break;
      default:
        break;
    }

    // Apply search filter
    if (searchLower) {
      data = data.filter((item: any) =>
        Object.values(item).some((val) =>
          val && String(val).toLowerCase().includes(searchLower)
        )
      );
    }

    return data;
  }, [state.result, state.activeTab, state.filter]);

  // Statistics
  const stats = useMemo<StorageStats | null>(() => {
    if (!state.result) return null;

    const data = state.result.data || [];
    const metadata = state.result.metadata;

    return {
      totalCapacityGB: metadata?.TotalPhysicalCapacityGB || 0,
      totalFreeSpaceGB: metadata?.TotalFreeSpaceGB || 0,
      physicalDiskCount: metadata?.PhysicalDiskCount || data.filter((item: any) => item.StorageType === 'PhysicalDisk').length,
      volumeCount: metadata?.VolumeCount || data.filter((item: any) => item.StorageType === 'Volume').length,
      networkDriveCount: metadata?.NetworkDriveCount || data.filter((item: any) => item.StorageType === 'NetworkDrive').length,
      smbShareCount: metadata?.SMBShareCount || data.filter((item: any) => item.StorageType === 'SMBShare').length,
      storagePoolCount: metadata?.StoragePoolCount || data.filter((item: any) => item.StorageType === 'StoragePool').length,
      virtualDiskCount: metadata?.VirtualDiskCount || data.filter((item: any) => item.StorageType === 'VirtualDisk').length,
      fcIscsiCount: metadata?.FcIscsiObjects || data.filter((item: any) => item._DataType === 'FcIscsi').length,
    };
  }, [state.result]);

  // CSV Export
  const exportToCSV = useCallback((data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const flattenObject = (obj: any, prefix = ''): any => {
      const flattened: any = {};
      for (const key in obj) {
        if (obj[key] === null || obj[key] === undefined) {
          flattened[prefix + key] = '';
        } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
          Object.assign(flattened, flattenObject(obj[key], prefix + key + '_'));
        } else if (Array.isArray(obj[key])) {
          flattened[prefix + key] = obj[key].join('; ');
        } else {
          flattened[prefix + key] = obj[key];
        }
      }
      return flattened;
    };

    const flattenedData = data.map(item => flattenObject(item));
    const headers = Object.keys(flattenedData[0]);
    const csvRows = [
      headers.join(','),
      ...flattenedData.map((row: any) =>
        headers.map((header) => {
          const value = row[header];
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Excel Export (simplified)
  const exportToExcel = useCallback(async (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    exportToCSV(data, filename.replace('.xlsx', '.csv'));
  }, [exportToCSV]);

  return {
    config: state.config,
    result: state.result,
    isDiscovering: state.isDiscovering,
    isCancelling,
    progress: state.progress,
    error: state.error,
    activeTab: state.activeTab,
    filter: state.filter,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
    clearLogs,
    columns,
    filteredData,
    stats,
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    setActiveTab,
    updateFilter,
    clearError,
    exportToCSV,
    exportToExcel,
  };
};


