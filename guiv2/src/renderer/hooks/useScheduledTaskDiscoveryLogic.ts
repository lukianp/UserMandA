/**
 * Scheduled Task Discovery Logic Hook
 * Contains all business logic for scheduled task discovery
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

// ============================================================================
// Types
// ============================================================================

export type TabType = 'overview' | 'tasks' | 'triggers' | 'actions';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface ScheduledTaskStats {
  totalTasks: number;
  enabledTasks: number;
  disabledTasks: number;
  hiddenTasks: number;
  runningTasks: number;
  readyTasks: number;
  microsoftTasks: number;
  customTasks: number;
  systemTasks: number;
  failedTasks: number;
}

interface ScheduledTaskDiscoveryConfig {
  includeTasks: boolean;
  includeTaskHistory: boolean;
  includeTaskTriggers: boolean;
  includeTaskActions: boolean;
  includeDisabledTasks: boolean;
  maxResults: number;
  timeout: number;
  showWindow: boolean;
}

interface ScheduledTaskDiscoveryResult {
  totalTasks?: number;
  totalEnabledTasks?: number;
  totalItems?: number;
  outputPath?: string;
  tasks?: any[];
  taskHistory?: any[];
  taskTriggers?: any[];
  taskActions?: any[];
  statistics?: {
    activeTasks?: number;
    disabledTasks?: number;
    failedTasks?: number;
    averageTasksPerDay?: number;
  };
}

interface ScheduledTaskDiscoveryState {
  config: ScheduledTaskDiscoveryConfig;
  result: ScheduledTaskDiscoveryResult | null;
  isDiscovering: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
}

export const useScheduledTaskDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  const [state, setState] = useState<ScheduledTaskDiscoveryState>({
    config: {
      includeTasks: true,
      includeTaskHistory: true,
      includeTaskTriggers: true,
      includeTaskActions: true,
      includeDisabledTasks: false,
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
  });

  // Additional state for PowerShellExecutionDialog
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Filter state
  const [filter, setFilter] = useState({
    searchText: '',
    selectedStates: [] as string[],
    selectedAuthors: [] as string[],
    showEnabledOnly: false,
    showFailedOnly: false,
  });

  // Load previous results on mount
  useEffect(() => {
    console.log('[ScheduledTaskDiscoveryHook] Loading previous results');
    const previousResults = getResultsByModuleName('ScheduledTaskDiscovery');
    if (previousResults && previousResults.length > 0) {
      const latestResult = previousResults[previousResults.length - 1];
      console.log('[ScheduledTaskDiscoveryHook] Found previous result:', latestResult);
      setState((prev) => ({
        ...prev,
        result: latestResult.additionalData as ScheduledTaskDiscoveryResult,
      }));
    }
  }, [getResultsByModuleName]);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[ScheduledTaskDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[ScheduledTaskDiscoveryHook] Discovery output:', data.message);
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
        console.log('[ScheduledTaskDiscoveryHook] Discovery completed:', data);

        const discoveryResult = {
          id: `scheduledtask-discovery-${Date.now()}`,
          name: 'Scheduled Task Discovery',
          moduleName: 'ScheduledTaskDiscovery',
          displayName: 'Scheduled Task Discovery',
          itemCount: data?.result?.totalItems || data?.result?.totalTasks || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalTasks || 0} scheduled tasks (${data?.result?.totalEnabledTasks || 0} enabled)`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          result: data.result as ScheduledTaskDiscoveryResult,
          isDiscovering: false,
          progress: {
            current: 100,
            total: 100,
            message: 'Completed',
            percentage: 100,
          },
        }));

        addResult(discoveryResult);
        console.log(`[ScheduledTaskDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[ScheduledTaskDiscoveryHook] Discovery error:', data.error);
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
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.warn('[ScheduledTaskDiscoveryHook] Discovery cancelled');
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
      }
    });

    return () => {
      unsubscribeOutput?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeCancelled?.();
    };
  }, []); // ✅ CRITICAL: Empty dependency array for event listeners

  const startDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      const errorMessage = 'No company profile selected. Please select a profile first.';
      setState((prev) => ({ ...prev, error: errorMessage }));
      console.error('[ScheduledTaskDiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    const token = `scheduledtask-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        message: 'Starting Scheduled Task discovery...',
        percentage: 0,
      },
    }));

    currentTokenRef.current = token;

    console.log(`[ScheduledTaskDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log('[ScheduledTaskDiscoveryHook] Parameters:', {
      IncludeTasks: state.config.includeTasks,
      IncludeTaskHistory: state.config.includeTaskHistory,
      IncludeTaskTriggers: state.config.includeTaskTriggers,
      IncludeTaskActions: state.config.includeTaskActions,
      IncludeDisabledTasks: state.config.includeDisabledTasks,
      MaxResults: state.config.maxResults,
      Timeout: state.config.timeout,
      ShowWindow: state.config.showWindow,
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'ScheduledTask',
        parameters: {
          IncludeTasks: state.config.includeTasks,
          IncludeTaskHistory: state.config.includeTaskHistory,
          IncludeTaskTriggers: state.config.includeTaskTriggers,
          IncludeTaskActions: state.config.includeTaskActions,
          IncludeDisabledTasks: state.config.includeDisabledTasks,
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

      console.log('[ScheduledTaskDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[ScheduledTaskDiscoveryHook] Discovery failed:', errorMessage);
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
  }, [selectedSourceProfile, state.config, state.isDiscovering]);

  const cancelDiscovery = useCallback(async () => {
    if (!state.isDiscovering || !currentTokenRef.current) return;

    console.warn('[ScheduledTaskDiscoveryHook] Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[ScheduledTaskDiscoveryHook] Discovery cancellation requested successfully');

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
        currentTokenRef.current = null;
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'Error cancelling discovery';
      console.error('[ScheduledTaskDiscoveryHook]', errorMessage);
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
      currentTokenRef.current = null;
    }
  }, [state.isDiscovering]);

  const updateConfig = useCallback((updates: Partial<ScheduledTaskDiscoveryConfig>) => {
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // ============================================================================
  // Log Management
  // ============================================================================

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'info') => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      message,
    };
    setLogs((prev) => [...prev, newLog]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // ============================================================================
  // Filter Management
  // ============================================================================

  const updateFilter = useCallback((updates: Partial<typeof filter>) => {
    setFilter((prev) => ({ ...prev, ...updates }));
  }, []);

  // ============================================================================
  // Column Definitions
  // ============================================================================

  const taskColumns = useMemo<ColDef[]>(
    () => [
      { field: 'TaskName', headerName: 'Task Name', sortable: true, filter: true, width: 250, pinned: 'left' },
      { field: 'TaskPath', headerName: 'Path', sortable: true, filter: true, width: 200 },
      { field: 'State', headerName: 'State', sortable: true, filter: true, width: 120 },
      {
        field: 'SettingsEnabled',
        headerName: 'Enabled',
        sortable: true,
        filter: true,
        width: 100,
        valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
      },
      { field: 'Author', headerName: 'Author', sortable: true, filter: true, width: 200 },
      { field: 'Description', headerName: 'Description', sortable: true, filter: true, width: 300 },
      {
        field: 'LastRunTime',
        headerName: 'Last Run',
        sortable: true,
        filter: true,
        width: 180,
        valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleString() : 'Never'),
      },
      {
        field: 'NextRunTime',
        headerName: 'Next Run',
        sortable: true,
        filter: true,
        width: 180,
        valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleString() : 'N/A'),
      },
      {
        field: 'LastTaskResult',
        headerName: 'Last Result',
        sortable: true,
        filter: true,
        width: 120,
        valueFormatter: (params) => (params.value === 0 ? 'Success' : params.value === null ? 'N/A' : `Error: ${params.value}`),
      },
      { field: 'Principal', headerName: 'Run As', sortable: true, filter: true, width: 180 },
      { field: 'PrincipalLogonType', headerName: 'Logon Type', sortable: true, filter: true, width: 150 },
      { field: 'TriggerCount', headerName: 'Triggers', sortable: true, filter: true, width: 100 },
      { field: 'ActionCount', headerName: 'Actions', sortable: true, filter: true, width: 100 },
    ],
    []
  );

  const triggerColumns = useMemo<ColDef[]>(
    () => [
      { field: 'TaskName', headerName: 'Task Name', sortable: true, filter: true, width: 250, pinned: 'left' },
      { field: 'TriggerType', headerName: 'Trigger Type', sortable: true, filter: true, width: 150 },
      { field: 'TriggerEnabled', headerName: 'Enabled', sortable: true, filter: true, width: 100, valueFormatter: (params) => (params.value ? 'Yes' : 'No') },
      { field: 'TriggerStartBoundary', headerName: 'Start Boundary', sortable: true, filter: true, width: 180, valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleString() : 'N/A') },
      { field: 'TriggerEndBoundary', headerName: 'End Boundary', sortable: true, filter: true, width: 180, valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleString() : 'N/A') },
      { field: 'TriggerRepetitionInterval', headerName: 'Repetition Interval', sortable: true, filter: true, width: 180 },
      { field: 'TriggerRepetitionDuration', headerName: 'Repetition Duration', sortable: true, filter: true, width: 180 },
      { field: 'TriggerDelay', headerName: 'Delay', sortable: true, filter: true, width: 120 },
    ],
    []
  );

  const actionColumns = useMemo<ColDef[]>(
    () => [
      { field: 'TaskName', headerName: 'Task Name', sortable: true, filter: true, width: 250, pinned: 'left' },
      { field: 'ActionType', headerName: 'Action Type', sortable: true, filter: true, width: 150 },
      { field: 'ActionExecute', headerName: 'Execute', sortable: true, filter: true, width: 300 },
      { field: 'ActionArguments', headerName: 'Arguments', sortable: true, filter: true, width: 300 },
      { field: 'ActionWorkingDirectory', headerName: 'Working Directory', sortable: true, filter: true, width: 250 },
    ],
    []
  );

  // ============================================================================
  // Get Columns Based on Active Tab
  // ============================================================================

  const columns = useMemo<ColDef[]>(() => {
    switch (activeTab) {
      case 'tasks':
        return taskColumns;
      case 'triggers':
        return triggerColumns;
      case 'actions':
        return actionColumns;
      default:
        return [];
    }
  }, [activeTab, taskColumns, triggerColumns, actionColumns]);

  // ============================================================================
  // Filtered Data
  // ============================================================================

  const filteredData = useMemo(() => {
    if (!state.result) return [];

    let data: any[] = [];

    switch (activeTab) {
      case 'tasks':
        data = state.result.tasks || [];
        break;
      case 'triggers':
        data = state.result.taskTriggers || [];
        break;
      case 'actions':
        data = state.result.taskActions || [];
        break;
      default:
        return [];
    }

    // Apply filters
    return data.filter((item) => {
      // Search text filter
      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        const searchableFields = activeTab === 'tasks'
          ? ['TaskName', 'TaskPath', 'Author', 'Description']
          : ['TaskName'];

        const matchesSearch = searchableFields.some((field) =>
          item[field]?.toString().toLowerCase().includes(searchLower)
        );

        if (!matchesSearch) return false;
      }

      // State filter (tasks only)
      if (activeTab === 'tasks' && filter.selectedStates.length > 0) {
        if (!filter.selectedStates.includes(item.State)) return false;
      }

      // Author filter (tasks only)
      if (activeTab === 'tasks' && filter.selectedAuthors.length > 0) {
        if (!filter.selectedAuthors.includes(item.Author)) return false;
      }

      // Enabled only filter (tasks only)
      if (activeTab === 'tasks' && filter.showEnabledOnly) {
        if (!item.SettingsEnabled) return false;
      }

      // Failed only filter (tasks only)
      if (activeTab === 'tasks' && filter.showFailedOnly) {
        if (!item.LastTaskResult || item.LastTaskResult === 0) return false;
      }

      return true;
    });
  }, [state.result, activeTab, filter]);

  // ============================================================================
  // Statistics
  // ============================================================================

  const stats = useMemo<ScheduledTaskStats | null>(() => {
    if (!state.result) return null;

    const tasks = state.result.tasks || [];
    const metadata = state.result.statistics;

    return {
      totalTasks: tasks.length,
      enabledTasks: tasks.filter((t) => t.SettingsEnabled === true).length,
      disabledTasks: tasks.filter((t) => t.SettingsEnabled === false).length,
      hiddenTasks: tasks.filter((t) => t.SettingsHidden === true).length,
      runningTasks: tasks.filter((t) => t.State === 'Running').length,
      readyTasks: tasks.filter((t) => t.State === 'Ready').length,
      microsoftTasks: tasks.filter((t) => t.Author?.includes('Microsoft')).length,
      customTasks: tasks.filter((t) => t.Author && !t.Author.includes('Microsoft')).length,
      systemTasks: tasks.filter((t) => t.TaskPath?.startsWith('\\Microsoft\\')).length,
      failedTasks: tasks.filter((t) => t.LastTaskResult && t.LastTaskResult !== 0).length,
    };
  }, [state.result]);

  // ============================================================================
  // Export Functions
  // ============================================================================

  const exportToCSV = useCallback(
    (data: any[], filename: string) => {
      if (!data || data.length === 0) {
        console.warn('[ScheduledTaskDiscoveryHook] No data to export');
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

      console.log(`[ScheduledTaskDiscoveryHook] Exported ${data.length} rows to ${filename}`);
    },
    []
  );

  const exportToExcel = useCallback(
    async (data: any[], filename: string) => {
      console.log('[ScheduledTaskDiscoveryHook] Excel export not yet implemented, falling back to CSV');
      exportToCSV(data, filename.replace('.xlsx', '.csv'));
    },
    [exportToCSV]
  );

  return {
    // Configuration
    config: state.config,
    updateConfig,

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
