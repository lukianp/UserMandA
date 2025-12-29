/**
 * Microsoft Graph Discovery Logic Hook
 * Provides state management and business logic for Microsoft Graph API object discovery operations
 * ✅ FIXED: Uses event-driven architecture with streaming support
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

import {
  BaseDiscoveryHookResult,
  LogEntry,
  ProgressInfo,
  Profile,
  ColumnDef,
  DiscoveryStats
} from './common/discoveryHookTypes';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

/**
 * Graph Discovery Hook Return Type
 */
export interface GraphDiscoveryHookResult extends BaseDiscoveryHookResult {
  resourcesByType: Record<string, number>;
}

/**
 * Custom hook for Microsoft Graph API object discovery logic
 */
export const useGraphDiscoveryLogic = (): GraphDiscoveryHookResult => {
  // Get selected company profile from store
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();

  const [isRunning, setIsRunning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const currentTokenRef = useRef<string | null>(null); // ✅ ADDED: Ref for event matching

  // Additional state for view compatibility
  const [config, setConfig] = useState<any>({
    includeUsers: true,
    includeGroups: true,
    includeApplications: true,
    includeDevices: true,
    includeDirectoryRoles: false,
    includeServicePrincipals: false,
  });
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('users');
  const [searchText, setSearchText] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);

  /**
   * Load previous results from discovery store on mount
   */
  useEffect(() => {
    console.log('[GraphDiscoveryHook] Loading previous results from discovery store');
    const previousResults = getResultsByModuleName('GraphDiscovery');

    if (previousResults && previousResults.length > 0) {
      const mostRecent = previousResults[previousResults.length - 1];
      console.log('[GraphDiscoveryHook] Found previous result:', mostRecent);
      setResults(mostRecent);
    }
  }, [getResultsByModuleName]);

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

  // ✅ ADDED: Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[GraphDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const logLevel = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warning' : 'info';
        addLog(logLevel, data.message);
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setIsRunning(false);
        setIsCancelling(false);
        setCurrentToken(null);

        const result = {
          id: `graph-discovery-${Date.now()}`,
          name: 'Microsoft Graph Discovery',
          moduleName: 'GraphDiscovery',
          displayName: 'Microsoft Graph Discovery',
          itemCount: data?.result?.totalItems || data?.result?.RecordCount || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalItems || 0} Microsoft Graph objects`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setResults(result);
        addResult(result); // ✅ ADDED: Store in discovery store
        addLog('info', `Discovery completed! Found ${result.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setIsRunning(false);
        setError(data.error);
        addLog('error', `Discovery failed: ${data.error}`);
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setIsRunning(false);
        setIsCancelling(false);
        setCurrentToken(null);
        addLog('warning', 'Discovery cancelled by user');
      }
    });

    return () => {
      unsubscribeOutput?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeCancelled?.();
    };
  }, []); // ✅ FIXED: Empty dependency array - critical for proper event handling

  /**
   * Start the Microsoft Graph discovery process
   * ✅ FIXED: Now uses event-driven executeDiscovery API
   */
  const startDiscovery = useCallback(async () => {
    if (isRunning) return;

    // Check if a profile is selected
    if (!selectedSourceProfile) {
      const errorMessage = 'No company profile selected. Please select a profile first.';
      setError(errorMessage);
      addLog('error', errorMessage);
      return;
    }

    setIsRunning(true);
    setIsCancelling(false);
    setProgress(null);
    setResults(null);
    setError(null);
    setLogs([]);

    const token = `graph-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setCurrentToken(token);
    currentTokenRef.current = token; // ✅ CRITICAL: Update ref for event matching

    addLog('info', `Starting Microsoft Graph discovery for ${selectedSourceProfile.companyName}...`);

    try {
      // ✅ FIXED: Use new event-driven API instead of deprecated executeDiscoveryModule
      const result = await window.electron.executeDiscovery({
        moduleName: 'Graph',
        parameters: {
          IncludeUsers: config.includeUsers,
          IncludeGroups: config.includeGroups,
          IncludeApplications: config.includeApplications,
          IncludeDevices: config.includeDevices,
          IncludeDirectoryRoles: config.includeDirectoryRoles,
          IncludeServicePrincipals: config.includeServicePrincipals,
        },
        executionOptions: {  // ✅ ADDED: Missing execution options
          timeout: 300000,   // 5 minutes for Graph discovery
          showWindow: false, // Use integrated dialog
        },
        executionId: token, // ✅ CRITICAL: Pass token for event matching
      });

      console.log('[GraphDiscoveryHook] Discovery execution initiated:', result);
      addLog('info', 'Discovery execution started - monitoring progress...');

      // Note: Completion will be handled by the discovery:complete event listener
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred during discovery';
      setError(errorMessage);
      addLog('error', errorMessage);
      setIsRunning(false);
      setCurrentToken(null);
      setProgress(null);
    }
  }, [isRunning, config, addLog, selectedSourceProfile]);

  /**
   * Cancel the ongoing discovery process
   * ✅ FIXED: Now properly cancels PowerShell process
   */
  const cancelDiscovery = useCallback(async () => {
    if (!isRunning || !currentToken) return;

    setIsCancelling(true);
    addLog('warning', 'Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentToken);
      addLog('info', 'Discovery cancellation requested successfully');

      // Set timeout as fallback in case cancelled event doesn't fire
      setTimeout(() => {
        setIsRunning(false);
        setIsCancelling(false);
        setCurrentToken(null);
        addLog('warning', 'Discovery cancelled');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.message || 'Error cancelling discovery';
      addLog('error', errorMessage);
      // Reset state even on error
      setIsRunning(false);
      setIsCancelling(false);
      setCurrentToken(null);
    }
  }, [isRunning, currentToken, addLog]);

  /**
   * Export discovery results
   */
  const exportResults = useCallback(async () => {
    if (!results) return;

    try {
      addLog('info', 'Exporting discovery results...');

      // Mock export functionality
      const dataStr = JSON.stringify(results, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

      const exportFileDefaultName = `graph-discovery-results-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      addLog('info', 'Results exported successfully.');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to export results';
      setError(errorMessage);
      addLog('error', errorMessage);
    }
  }, [results, addLog]);

  /**
   * Clear all logs
   */
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  /**
   * Update configuration
   */
  const updateConfig = useCallback((updates: any) => {
    setConfig((prev: any) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Load a template
   */
  const loadTemplate = useCallback((template: any) => {
    setConfig(template.config || {});
    addLog('info', `Loaded template: ${template.name}`);
  }, [addLog]);

  /**
   * Save current config as template
   */
  const saveAsTemplate = useCallback((name: string) => {
    const template = { name, config };
    setTemplates(prev => [...prev, template]);
    addLog('info', `Saved template: ${name}`);
  }, [config, addLog]);

  /**
   * Export data in specified format
   */
  const exportData = useCallback(async (format: string) => {
    addLog('info', `Exporting data as ${format}...`);
    await exportResults();
  }, [exportResults, addLog]);

  // Filter state for view
  const [filter, setFilter] = useState({
    searchText: '',
    selectedResourceTypes: [] as string[],
    selectedPermissions: [] as string[],
    showHighUsageOnly: false
  });
  const [activeTab, setActiveTab] = useState<string>('resources'); // ✅ FIXED: Default to 'resources' tab to show grid

  // Update filter helper
  const updateFilter = useCallback((updates: Partial<typeof filter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  }, []);

  // ✅ FIXED: Proper column definitions for AG Grid
  const columns = useMemo<ColumnDef[]>(() => {
    return [
      { field: 'displayName', headerName: 'Display Name', flex: 1, minWidth: 150, sortable: true, filter: true },
      { field: 'userPrincipalName', headerName: 'UPN / Email', flex: 1, minWidth: 200, sortable: true, filter: true },
      { field: '_DataType', headerName: 'Type', width: 100, sortable: true, filter: true },
      { field: 'mail', headerName: 'Email', flex: 1, minWidth: 200, sortable: true, filter: true },
      { field: 'jobTitle', headerName: 'Job Title', flex: 1, minWidth: 150, sortable: true, filter: true },
      { field: 'department', headerName: 'Department', width: 150, sortable: true, filter: true },
      { field: 'accountEnabled', headerName: 'Enabled', width: 100, sortable: true, filter: true,
        cellRenderer: (params: any) => params.value === true ? '✓' : params.value === false ? '✗' : '-' },
      { field: 'createdDateTime', headerName: 'Created', width: 180, sortable: true, filter: true },
      { field: 'id', headerName: 'Object ID', width: 280, sortable: true, filter: true },
    ];
  }, []);

  // ✅ FIXED: Extract actual data from results.additionalData.Data
  const filteredData = useMemo(() => {
    if (!results) return [];

    // The actual data is in additionalData.Data from PowerShell output
    const rawData = results?.additionalData?.Data || results?.additionalData?.data || [];

    // If rawData is an array, use it directly
    if (Array.isArray(rawData)) {
      // Apply search filter
      if (filter.searchText) {
        const search = filter.searchText.toLowerCase();
        return rawData.filter((item: any) => {
          return (
            item.displayName?.toLowerCase()?.includes(search) ||
            item.userPrincipalName?.toLowerCase()?.includes(search) ||
            item.mail?.toLowerCase()?.includes(search) ||
            item._DataType?.toLowerCase()?.includes(search)
          );
        });
      }
      return rawData;
    }

    // If it's an object with arrays (users, groups, etc), flatten them
    if (typeof rawData === 'object') {
      const allItems = Object.values(rawData).flat();
      if (filter.searchText) {
        const search = filter.searchText.toLowerCase();
        return allItems.filter((item: any) => {
          return (
            item?.displayName?.toLowerCase()?.includes(search) ||
            item?.userPrincipalName?.toLowerCase()?.includes(search) ||
            item?.mail?.toLowerCase()?.includes(search)
          );
        });
      }
      return allItems;
    }

    return [];
  }, [results, filter.searchText]);

  // ✅ FIXED: Compute stats from results - matches view expectations
  const stats = useMemo<DiscoveryStats | null>(() => {
    if (!results) return null;

    const data = results?.additionalData?.Data || results?.additionalData?.data || [];
    const items = Array.isArray(data) ? data : Object.values(data).flat();

    let userCount = 0;
    let groupCount = 0;

    items.forEach((item: any) => {
      const type = item._DataType || 'Unknown';
      if (type === 'User') userCount++;
      if (type === 'Group') groupCount++;
    });

    return {
      // ✅ View expects these property names - flat structure for DiscoveryStats
      totalResources: items.length,
      totalItems: items.length,
      // Graph-specific stats
      users: userCount,
      groups: groupCount,
      objectTypes: userCount > 0 && groupCount > 0 ? 2 : (userCount > 0 || groupCount > 0 ? 1 : 0),
      // Empty placeholders for view compatibility
      apiCalls: 0,
      totalPermissions: 0,
      applications: 0,
      mailboxes: 0,
      driveItems: 0,
      throttledRequests: 0,
      healthScore: 100,
    };
  }, [results]);

  // Separate resourcesByType for view (not part of DiscoveryStats)
  const resourcesByType = useMemo<Record<string, number>>(() => {
    if (!results) return {};

    const data = results?.additionalData?.Data || results?.additionalData?.data || [];
    const items = Array.isArray(data) ? data : Object.values(data).flat();

    const byType: Record<string, number> = {};
    items.forEach((item: any) => {
      const type = item._DataType || 'Unknown';
      byType[type] = (byType[type] || 0) + 1;
    });

    return byType;
  }, [results]);

  // Export helpers
  const exportToCSV = useCallback((data?: any[], filename?: string) => {
    const exportData = data || filteredData;
    const exportFilename = filename || `graph-discovery-${new Date().toISOString().split('T')[0]}.csv`;
    if (!exportData || !exportData.length) return;
    const headers = Object.keys(exportData[0]).join(',');
    const rows = exportData.map(row => Object.values(row).map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFilename;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredData]);

  const exportToExcel = useCallback(async (data?: any[], filename?: string) => {
    // For now, export as CSV with .xlsx extension (basic implementation)
    const exportFilename = filename || `graph-discovery-${new Date().toISOString().split('T')[0]}.xlsx`;
    exportToCSV(data, exportFilename.replace('.xlsx', '.csv'));
  }, [exportToCSV]);

  return {
    isRunning,
    isCancelling,
    progress,
    results,
    error,
    logs,
    startDiscovery,
    cancelDiscovery,
    exportResults,
    clearLogs,
    selectedProfile,

    // Additional properties for view compatibility
    config,
    templates,
    result: results,
    currentResult: results,
    isDiscovering: isRunning,
    selectedTab,
    activeTab,
    searchText,
    filter,
    filteredData,
    columns,
    columnDefs: columns,
    stats,
    resourcesByType,  // ✅ ADDED: For view compatibility
    errors,
    showExecutionDialog: false,
    setShowExecutionDialog: () => {},
    updateConfig,
    loadTemplate,
    saveAsTemplate,
    setSelectedTab,
    setActiveTab,
    setSearchText,
    updateFilter,
    clearError: () => setError(null),
    exportData,
    exportToCSV,
    exportToExcel,
  };
};
