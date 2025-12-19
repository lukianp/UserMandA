/**
 * Printer Discovery Logic Hook
 * Contains all business logic for printer discovery
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';
import type { LogEntry } from './common/discoveryHookTypes';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

type TabType = 'overview' | 'local-printers' | 'network-printers' | 'print-servers' | 'drivers';

interface PrinterDiscoveryConfig {
  includePrinters: boolean;
  includePrintQueues: boolean;
  includePrintJobs: boolean;
  includePrintDrivers: boolean;
  includePrintServers: boolean;
  maxResults: number;
  timeout: number;
  showWindow: boolean;
}

interface PrinterDiscoveryResult {
  totalPrinters?: number;
  totalPrintQueues?: number;
  totalItems?: number;
  outputPath?: string;
  data?: any[];
  printers?: any[];
  printQueues?: any[];
  printJobs?: any[];
  printDrivers?: any[];
  printServers?: any[];
  metadata?: {
    LocalPrinterCount?: number;
    NetworkPrinterCount?: number;
    PrintServerCount?: number;
    PrinterDriverCount?: number;
    ActivePrinters?: number;
    OfflinePrinters?: number;
    SharedPrinters?: number;
    PublishedPrinters?: number;
  };
  statistics?: {
    activePrinters?: number;
    totalPrintJobs?: number;
    failedJobs?: number;
    averageJobsPerDay?: number;
  };
}

interface PrinterDiscoveryState {
  config: PrinterDiscoveryConfig;
  result: PrinterDiscoveryResult | null;
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
    showOfflineOnly: boolean;
  };
}

interface PrinterStats {
  totalPrinters: number;
  localPrinters: number;
  networkPrinters: number;
  printServers: number;
  printerDrivers: number;
  sharedPrinters: number;
  publishedPrinters: number;
  activePrinters: number;
  offlinePrinters: number;
}

export const usePrinterDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  const [state, setState] = useState<PrinterDiscoveryState>({
    config: {
      includePrinters: true,
      includePrintQueues: true,
      includePrintJobs: true,
      includePrintDrivers: true,
      includePrintServers: true,
      maxResults: 1000,
      timeout: 600,
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
      showOfflineOnly: false,
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
    console.log('[PrinterDiscoveryHook] Loading previous results');
    const previousResults = getResultsByModuleName('PrinterDiscovery');
    if (previousResults && previousResults.length > 0) {
      const latestResult = previousResults[previousResults.length - 1];
      console.log('[PrinterDiscoveryHook] Found previous result:', latestResult);
      setState((prev) => ({
        ...prev,
        result: latestResult.additionalData as PrinterDiscoveryResult,
      }));
    }
  }, [getResultsByModuleName]);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[PrinterDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const logLevel = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warning' : 'info';
        addLog(logLevel, data.message);
        console.log('[PrinterDiscoveryHook] Discovery output:', data.message);
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
        console.log('[PrinterDiscoveryHook] Discovery completed:', data);

        const discoveryResult = {
          id: `printer-discovery-${Date.now()}`,
          name: 'Printer Discovery',
          moduleName: 'PrinterDiscovery',
          displayName: 'Printer Discovery',
          itemCount: data?.result?.totalItems || data?.result?.totalPrinters || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalPrinters || 0} printers and ${data?.result?.totalPrintQueues || 0} print queues`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          result: data.result as PrinterDiscoveryResult,
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
        console.log(`[PrinterDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[PrinterDiscoveryHook] Discovery error:', data.error);
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
        console.warn('[PrinterDiscoveryHook] Discovery cancelled');
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
      console.error('[PrinterDiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    const token = `printer-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        message: 'Starting Printer discovery...',
        percentage: 0,
      },
    }));

    currentTokenRef.current = token;
    setShowExecutionDialog(true);
    addLog('info', 'Starting Printer Discovery...');
    addLog('info', `Company: ${selectedSourceProfile.companyName}`);

    console.log(`[PrinterDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log('[PrinterDiscoveryHook] Parameters:', {
      IncludePrinters: state.config.includePrinters,
      IncludePrintQueues: state.config.includePrintQueues,
      IncludePrintJobs: state.config.includePrintJobs,
      IncludePrintDrivers: state.config.includePrintDrivers,
      IncludePrintServers: state.config.includePrintServers,
      MaxResults: state.config.maxResults,
      Timeout: state.config.timeout,
      ShowWindow: state.config.showWindow,
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'Printer',
        parameters: {
          IncludePrinters: state.config.includePrinters,
          IncludePrintQueues: state.config.includePrintQueues,
          IncludePrintJobs: state.config.includePrintJobs,
          IncludePrintDrivers: state.config.includePrintDrivers,
          IncludePrintServers: state.config.includePrintServers,
          MaxResults: state.config.maxResults,
          Timeout: state.config.timeout,
          ShowWindow: state.config.showWindow,
        },
        executionOptions: {
          timeout: state.config.timeout * 1000, // Convert seconds to milliseconds
          showWindow: state.config.showWindow,
        },
        executionId: token,
      });

      console.log('[PrinterDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[PrinterDiscoveryHook] Discovery failed:', errorMessage);
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

    console.warn('[PrinterDiscoveryHook] Cancelling discovery...');
    setIsCancelling(true);
    addLog('warning', 'Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[PrinterDiscoveryHook] Discovery cancellation requested successfully');

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
      console.error('[PrinterDiscoveryHook]', errorMessage);
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

  const updateConfig = useCallback((updates: Partial<PrinterDiscoveryConfig>) => {
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  }, []);

  const setActiveTab = useCallback((tab: TabType) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  const updateFilter = useCallback((updates: Partial<PrinterDiscoveryState['filter']>) => {
    setState((prev) => ({
      ...prev,
      filter: { ...prev.filter, ...updates },
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Column definitions for different tabs
  const localPrinterColumns = useMemo<ColDef[]>(() => [
    { field: 'Name', headerName: 'Printer Name', sortable: true, filter: true, width: 200 },
    { field: 'DriverName', headerName: 'Driver', sortable: true, filter: true, width: 180 },
    { field: 'PortName', headerName: 'Port', sortable: true, filter: true, width: 150 },
    { field: 'Location', headerName: 'Location', sortable: true, filter: true, width: 150 },
    { field: 'Status', headerName: 'Status', sortable: true, filter: true, width: 100 },
    {
      field: 'Shared',
      headerName: 'Shared',
      sortable: true,
      filter: true,
      width: 80,
      valueFormatter: (params) => params.value ? 'Yes' : 'No'
    },
    {
      field: 'Published',
      headerName: 'Published',
      sortable: true,
      filter: true,
      width: 90,
      valueFormatter: (params) => params.value ? 'Yes' : 'No'
    },
    {
      field: 'Default',
      headerName: 'Default',
      sortable: true,
      filter: true,
      width: 80,
      valueFormatter: (params) => params.value ? 'Yes' : 'No'
    },
  ], []);

  const networkPrinterColumns = useMemo<ColDef[]>(() => [
    { field: 'Name', headerName: 'Printer Name', sortable: true, filter: true, width: 200 },
    { field: 'ServerName', headerName: 'Server', sortable: true, filter: true, width: 150 },
    { field: 'ShareName', headerName: 'Share Name', sortable: true, filter: true, width: 150 },
    { field: 'Location', headerName: 'Location', sortable: true, filter: true, width: 150 },
    { field: 'DriverName', headerName: 'Driver', sortable: true, filter: true, width: 180 },
    { field: 'Status', headerName: 'Status', sortable: true, filter: true, width: 100 },
  ], []);

  const printServerColumns = useMemo<ColDef[]>(() => [
    { field: 'ServerName', headerName: 'Server Name', sortable: true, filter: true, width: 200 },
    { field: 'PrinterCount', headerName: 'Printer Count', sortable: true, filter: true, width: 150 },
    { field: 'SharedPrinters', headerName: 'Shared Printers', sortable: true, filter: true, width: 150 },
  ], []);

  const driverColumns = useMemo<ColDef[]>(() => [
    { field: 'Name', headerName: 'Driver Name', sortable: true, filter: true, width: 250 },
    { field: 'Version', headerName: 'Version', sortable: true, filter: true, width: 120 },
    { field: 'InfName', headerName: 'INF File', sortable: true, filter: true, width: 200 },
  ], []);

  // Dynamic columns based on active tab
  const columns = useMemo<ColDef[]>(() => {
    switch (state.activeTab) {
      case 'local-printers':
        return localPrinterColumns;
      case 'network-printers':
        return networkPrinterColumns;
      case 'print-servers':
        return printServerColumns;
      case 'drivers':
        return driverColumns;
      default:
        return localPrinterColumns;
    }
  }, [state.activeTab, localPrinterColumns, networkPrinterColumns, printServerColumns, driverColumns]);

  // Filtered data based on active tab and filters
  const filteredData = useMemo(() => {
    if (!state.result?.data) return [];

    let data = state.result.data;
    const searchLower = state.filter.searchText.toLowerCase();

    // Filter by tab
    switch (state.activeTab) {
      case 'local-printers':
        data = data.filter((item: any) => item._DataType === 'LocalPrinter' || item.PrinterType === 'Local');
        break;
      case 'network-printers':
        data = data.filter((item: any) => item._DataType === 'NetworkPrinter');
        break;
      case 'print-servers':
        data = data.filter((item: any) => item._DataType === 'PrintServer' || item.ServerType === 'PrintServer');
        break;
      case 'drivers':
        data = data.filter((item: any) => item._DataType === 'PrinterDriver' || item.DriverType === 'PrinterDriver');
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

    // Apply offline filter
    if (state.filter.showOfflineOnly) {
      data = data.filter((item: any) => item.Status === 'Offline' || item.Status === 'Error');
    }

    return data;
  }, [state.result, state.activeTab, state.filter]);

  // Statistics
  const stats = useMemo<PrinterStats | null>(() => {
    if (!state.result) return null;

    const data = state.result.data || [];

    const localPrinters = data.filter((item: any) => item._DataType === 'LocalPrinter' || item.PrinterType === 'Local').length;
    const networkPrinters = data.filter((item: any) => item._DataType === 'NetworkPrinter').length;
    const printServers = data.filter((item: any) => item._DataType === 'PrintServer' || item.ServerType === 'PrintServer').length;
    const printerDrivers = data.filter((item: any) => item._DataType === 'PrinterDriver' || item.DriverType === 'PrinterDriver').length;

    const sharedPrinters = data.filter((item: any) => item.Shared === true).length;
    const publishedPrinters = data.filter((item: any) => item.Published === true).length;
    const activePrinters = data.filter((item: any) => item.Status === 'OK' || item.Status === 'Idle').length;
    const offlinePrinters = data.filter((item: any) => item.Status === 'Offline' || item.Status === 'Error').length;

    return {
      totalPrinters: localPrinters + networkPrinters,
      localPrinters,
      networkPrinters,
      printServers,
      printerDrivers,
      sharedPrinters,
      publishedPrinters,
      activePrinters,
      offlinePrinters,
    };
  }, [state.result]);

  // CSV Export
  const exportToCSV = useCallback((data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    // Flatten nested objects and arrays for CSV
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

    // For now, export as CSV with .xlsx extension
    // In production, you would use a library like xlsx
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
