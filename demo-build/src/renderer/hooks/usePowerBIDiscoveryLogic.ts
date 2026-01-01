import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';
import type { LogEntry } from './common/discoveryHookTypes';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

// ============================================================================
// Types
// ============================================================================

export type TabType = 'overview' | 'workspaces' | 'reports' | 'datasets' | 'dashboards' | 'dataflows';

export interface PowerBIStats {
  totalWorkspaces: number;
  personalWorkspaces: number;
  groupWorkspaces: number;
  totalReports: number;
  totalDatasets: number;
  totalDashboards: number;
  totalDataflows: number;
  totalUsers: number;
}

export const usePowerBIDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

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

  const [state, setState] = useState<{
    config: { timeout: number };
    result: any;
    isDiscovering: boolean;
    progress: { current: number; total: number; message: string; percentage: number };
    error: string | null;
  }>({
    config: { timeout: 300000 },
    result: null,
    isDiscovering: false,
    progress: { current: 0, total: 100, message: '', percentage: 0 },
    error: null,
  });

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Filter state
  const [filter, setFilter] = useState({
    searchText: '',
    selectedTypes: [] as string[],
  });

  // Load previous results
  useEffect(() => {
    const previousResults = getResultsByModuleName('PowerBIDiscovery');
    if (previousResults && previousResults.length > 0) {
      setState(prev => ({ ...prev, result: previousResults[previousResults.length - 1].additionalData }));
    }
  }, [getResultsByModuleName]);

  // Event listeners
  useEffect(() => {
    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const logLevel = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warning' : 'info';
        addLog(logLevel, data.message);
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
        const discoveryResult = {
          id: `powerbi-discovery-${Date.now()}`,
          name: 'Power BI Discovery',
          moduleName: 'PowerBIDiscovery',
          displayName: 'Power BI Discovery',
          itemCount: data?.result?.totalItems || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalItems || 0} items`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };
        setState(prev => ({ ...prev, result: data.result, isDiscovering: false }));
        addResult(discoveryResult);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setState(prev => ({ ...prev, isDiscovering: false, error: data.error }));
      }
    });

    const unsubscribeProgress = window.electron?.onDiscoveryProgress?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setState(prev => ({
          ...prev,
          progress: {
            current: data.itemsProcessed || 0,
            total: data.totalItems || 100,
            message: data.currentPhase || '',
            percentage: data.percentage || 0,
          },
        }));
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setState(prev => ({
          ...prev,
          isDiscovering: false,
          progress: { current: 0, total: 100, message: 'Discovery cancelled', percentage: 0 }
        }));
      }
    });

    return () => {
      unsubscribeOutput?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeProgress?.();
      unsubscribeCancelled?.();
    };
  }, [addResult, addLog]);

  const startDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      setState(prev => ({ ...prev, error: 'No profile selected' }));
      return;
    }

    const token = `powerbi-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    currentTokenRef.current = token;
    setShowExecutionDialog(true);
    setState(prev => ({ ...prev, isDiscovering: true, error: null, result: null }));

    try {
      await window.electron.executeDiscovery({
        moduleName: 'PowerBI',
        parameters: {},
        executionOptions: { timeout: 300000, showWindow: false },
        executionId: token,
      });
    } catch (error: any) {
      setState(prev => ({ ...prev, isDiscovering: false, error: error.message }));
    }
  }, [selectedSourceProfile]);

  const cancelDiscovery = useCallback(async () => {
    if (currentTokenRef.current) {
      setIsCancelling(true);
      await window.electron.cancelDiscovery?.(currentTokenRef.current);
      setTimeout(() => {
        setState(prev => ({ ...prev, isDiscovering: false }));
        currentTokenRef.current = null;
        setIsCancelling(false);
      }, 2000);
    }
  }, []);

  // ============================================================================
  // Filter Management
  // ============================================================================

  const updateFilter = useCallback((updates: Partial<typeof filter>) => {
    setFilter((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // ============================================================================
  // Column Definitions
  // ============================================================================

  const workspaceColumns = useMemo<ColDef[]>(
    () => [
      { field: 'Name', headerName: 'Workspace Name', sortable: true, filter: true, width: 300, pinned: 'left' },
      { field: 'Id', headerName: 'Workspace ID', sortable: true, filter: true, width: 250 },
      { field: 'Type', headerName: 'Type', sortable: true, filter: true, width: 150 },
      { field: 'State', headerName: 'State', sortable: true, filter: true, width: 120 },
      { field: 'IsReadOnly', headerName: 'Read Only', sortable: true, filter: true, width: 120, valueFormatter: (params) => (params.value ? 'Yes' : 'No') },
      { field: 'IsOnDedicatedCapacity', headerName: 'Dedicated Capacity', sortable: true, filter: true, width: 150, valueFormatter: (params) => (params.value ? 'Yes' : 'No') },
      { field: 'CapacityId', headerName: 'Capacity ID', sortable: true, filter: true, width: 250 },
      { field: 'Description', headerName: 'Description', sortable: true, filter: true, width: 300 },
    ],
    []
  );

  const reportColumns = useMemo<ColDef[]>(
    () => [
      { field: 'Name', headerName: 'Report Name', sortable: true, filter: true, width: 300, pinned: 'left' },
      { field: 'Id', headerName: 'Report ID', sortable: true, filter: true, width: 250 },
      { field: 'WebUrl', headerName: 'Web URL', sortable: true, filter: true, width: 400 },
      { field: 'EmbedUrl', headerName: 'Embed URL', sortable: true, filter: true, width: 400 },
      { field: 'DatasetId', headerName: 'Dataset ID', sortable: true, filter: true, width: 250 },
      { field: 'CreatedDateTime', headerName: 'Created', sortable: true, filter: true, width: 180, valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleString() : 'N/A') },
      { field: 'ModifiedDateTime', headerName: 'Modified', sortable: true, filter: true, width: 180, valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleString() : 'N/A') },
      { field: 'WorkspaceId', headerName: 'Workspace ID', sortable: true, filter: true, width: 250 },
    ],
    []
  );

  const datasetColumns = useMemo<ColDef[]>(
    () => [
      { field: 'Name', headerName: 'Dataset Name', sortable: true, filter: true, width: 300, pinned: 'left' },
      { field: 'Id', headerName: 'Dataset ID', sortable: true, filter: true, width: 250 },
      { field: 'ConfiguredBy', headerName: 'Configured By', sortable: true, filter: true, width: 200 },
      { field: 'IsRefreshable', headerName: 'Refreshable', sortable: true, filter: true, width: 120, valueFormatter: (params) => (params.value ? 'Yes' : 'No') },
      { field: 'IsEffectiveIdentityRequired', headerName: 'RLS Required', sortable: true, filter: true, width: 120, valueFormatter: (params) => (params.value ? 'Yes' : 'No') },
      { field: 'IsEffectiveIdentityRolesRequired', headerName: 'RLS Roles', sortable: true, filter: true, width: 120, valueFormatter: (params) => (params.value ? 'Yes' : 'No') },
      { field: 'CreatedDate', headerName: 'Created', sortable: true, filter: true, width: 180, valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleString() : 'N/A') },
      { field: 'WorkspaceId', headerName: 'Workspace ID', sortable: true, filter: true, width: 250 },
    ],
    []
  );

  const dashboardColumns = useMemo<ColDef[]>(
    () => [
      { field: 'DisplayName', headerName: 'Dashboard Name', sortable: true, filter: true, width: 300, pinned: 'left' },
      { field: 'Id', headerName: 'Dashboard ID', sortable: true, filter: true, width: 250 },
      { field: 'IsReadOnly', headerName: 'Read Only', sortable: true, filter: true, width: 120, valueFormatter: (params) => (params.value ? 'Yes' : 'No') },
      { field: 'WebUrl', headerName: 'Web URL', sortable: true, filter: true, width: 400 },
      { field: 'EmbedUrl', headerName: 'Embed URL', sortable: true, filter: true, width: 400 },
      { field: 'WorkspaceId', headerName: 'Workspace ID', sortable: true, filter: true, width: 250 },
    ],
    []
  );

  const dataflowColumns = useMemo<ColDef[]>(
    () => [
      { field: 'Name', headerName: 'Dataflow Name', sortable: true, filter: true, width: 300, pinned: 'left' },
      { field: 'ObjectId', headerName: 'Object ID', sortable: true, filter: true, width: 250 },
      { field: 'Description', headerName: 'Description', sortable: true, filter: true, width: 300 },
      { field: 'ConfiguredBy', headerName: 'Configured By', sortable: true, filter: true, width: 200 },
      { field: 'WorkspaceId', headerName: 'Workspace ID', sortable: true, filter: true, width: 250 },
    ],
    []
  );

  // ============================================================================
  // Get Columns Based on Active Tab
  // ============================================================================

  const columns = useMemo<ColDef[]>(() => {
    switch (activeTab) {
      case 'workspaces':
        return workspaceColumns;
      case 'reports':
        return reportColumns;
      case 'datasets':
        return datasetColumns;
      case 'dashboards':
        return dashboardColumns;
      case 'dataflows':
        return dataflowColumns;
      default:
        return [];
    }
  }, [activeTab, workspaceColumns, reportColumns, datasetColumns, dashboardColumns, dataflowColumns]);

  // ============================================================================
  // Filtered Data
  // ============================================================================

  const filteredData = useMemo(() => {
    if (!state.result) return [];

    let data: any[] = [];

    switch (activeTab) {
      case 'workspaces':
        data = state.result.Workspaces || [];
        break;
      case 'reports':
        data = state.result.Reports || [];
        break;
      case 'datasets':
        data = state.result.Datasets || [];
        break;
      case 'dashboards':
        data = state.result.Dashboards || [];
        break;
      case 'dataflows':
        data = state.result.Dataflows || [];
        break;
      default:
        return [];
    }

    // Apply filters
    return data.filter((item) => {
      // Search text filter
      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        const searchableFields = activeTab === 'workspaces'
          ? ['Name', 'Type', 'Description']
          : activeTab === 'reports'
          ? ['Name', 'WebUrl']
          : activeTab === 'datasets'
          ? ['Name', 'ConfiguredBy']
          : activeTab === 'dashboards'
          ? ['DisplayName', 'WebUrl']
          : ['Name', 'Description'];

        const matchesSearch = searchableFields.some((field) =>
          item[field]?.toString().toLowerCase().includes(searchLower)
        );

        if (!matchesSearch) return false;
      }

      // Type filter (workspaces only)
      if (activeTab === 'workspaces' && filter.selectedTypes.length > 0) {
        if (!filter.selectedTypes.includes(item.Type)) return false;
      }

      return true;
    });
  }, [state.result, activeTab, filter]);

  // ============================================================================
  // Statistics
  // ============================================================================

  const stats = useMemo<PowerBIStats | null>(() => {
    if (!state.result || !state.result.Statistics) return null;

    return {
      totalWorkspaces: state.result.Statistics.TotalWorkspaces || 0,
      personalWorkspaces: state.result.Statistics.PersonalWorkspaces || 0,
      groupWorkspaces: state.result.Statistics.GroupWorkspaces || 0,
      totalReports: state.result.Statistics.TotalReports || 0,
      totalDatasets: state.result.Statistics.TotalDatasets || 0,
      totalDashboards: state.result.Statistics.TotalDashboards || 0,
      totalDataflows: state.result.Statistics.TotalDataflows || 0,
      totalUsers: state.result.Statistics.TotalUsers || 0,
    };
  }, [state.result]);

  // ============================================================================
  // Export Functions
  // ============================================================================

  const exportToCSV = useCallback(
    (data: any[], filename: string) => {
      if (!data || data.length === 0) {
        console.warn('[PowerBIDiscoveryHook] No data to export');
        return;
      }

      // Flatten objects for CSV export
      const flattenedData = data.map((item) => {
        const flattened: any = {};
        Object.keys(item).forEach((key) => {
          if (typeof item[key] === 'object' && item[key] !== null) {
            flattened[key] = JSON.stringify(item[key]);
          } else {
            flattened[key] = item[key];
          }
        });
        return flattened;
      });

      const headers = Object.keys(flattenedData[0]);
      const csvContent = [
        headers.join(','),
        ...flattenedData.map((row) =>
          headers.map((header) => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            const stringValue = value.toString().replace(/"/g, '""');
            return `"${stringValue}"`;
          }).join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`[PowerBIDiscoveryHook] Exported ${data.length} rows to ${filename}`);
    },
    []
  );

  const exportToExcel = useCallback(
    async (data: any[], filename: string) => {
      console.log('[PowerBIDiscoveryHook] Excel export not yet implemented, falling back to CSV');
      exportToCSV(data, filename.replace('.xlsx', '.csv'));
    },
    [exportToCSV]
  );

  return {
    // Configuration
    config: state.config,

    // Discovery results
    result: state.result,

    // Discovery state
    isDiscovering: state.isDiscovering,
    isCancelling,
    progress: state.progress,
    error: state.error,

    // Actions
    startDiscovery,
    cancelDiscovery,
    clearError,

    // Logs
    logs,
    addLog,
    clearLogs,
    showExecutionDialog,
    setShowExecutionDialog,

    // Tabs
    activeTab,
    setActiveTab,

    // Filtering
    filter,
    updateFilter,

    // Data
    columns,
    filteredData,
    stats,

    // Export
    exportToCSV,
    exportToExcel,
  };
};
