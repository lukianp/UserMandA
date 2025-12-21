/**
 * Entra ID (Azure AD) App Registrations Discovery Logic Hook
 * Provides state management and business logic for Entra ID app registration discovery operations
 * ✅ FIXED: Uses event-driven architecture with streaming support
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

import {
  BaseDiscoveryHookResult,
  LogEntry,
  ProgressInfo,
  Profile
} from './common/discoveryHookTypes';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

/**
 * Entra ID App Discovery Hook Return Type
 */
export type EntraIDAppDiscoveryHookResult = BaseDiscoveryHookResult;

/**
 * Custom hook for Entra ID (Azure AD) App Registrations discovery logic
 */
export const useEntraIDAppDiscoveryLogic = (): EntraIDAppDiscoveryHookResult => {
  // Get selected company profile from store
  const selectedSourceProfile = useProfileStore((state: any) => state.selectedSourceProfile);
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
    includeAppRegistrations: true,
    includeServicePrincipals: true,
    includeAppRoles: true,
    includePermissions: true,
    includeSecrets: true,
    includeManagedIdentities: true,
    analyzeSecretExpiration: true,
    timeout: 300000,
  });
  const [templates, setTemplates] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchText, setSearchText] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [filter, setFilter] = useState<any>({
    selectedAppTypes: [],
    selectedPermissionTypes: [],
    searchText: '',
    showExpiringSecretsOnly: false,
    showHighRiskOnly: false,
  });

  /**
   * Load previous results from discovery store on mount
   */
  useEffect(() => {
    console.log('[EntraIDAppDiscoveryHook] Loading previous results from discovery store');
    const previousResults = getResultsByModuleName('EntraIDApp');

    if (previousResults && previousResults.length > 0) {
      const mostRecent = previousResults[previousResults.length - 1];
      console.log('[EntraIDAppDiscoveryHook] Found previous result:', mostRecent);
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
    console.log('[EntraIDAppDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const logLevel = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warning' : 'info';
        addLog(logLevel, data.message);
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      console.log('[EntraIDAppDiscoveryHook] onDiscoveryComplete callback fired');
      console.log('[EntraIDAppDiscoveryHook] Event executionId:', data.executionId);
      console.log('[EntraIDAppDiscoveryHook] currentTokenRef.current:', currentTokenRef.current);
      console.log('[EntraIDAppDiscoveryHook] data.result:', data.result);
      console.log('[EntraIDAppDiscoveryHook] data.result.data:', data.result?.data);
      console.log('[EntraIDAppDiscoveryHook] data.result.data.Data length:', data.result?.data?.Data?.length);

      if (data.executionId === currentTokenRef.current) {
        console.log('[EntraIDAppDiscoveryHook] ExecutionId MATCHED - processing result');
        setIsRunning(false);
        setIsCancelling(false);
        setCurrentToken(null);

        // Extract Data array from result - Main process wraps PowerShell result in 'data' property
        // PowerShell returns {Success, ModuleName, Data: [...]} which becomes data.result.data
        const dataArray = data.result?.data?.Data || [];
        console.log('[EntraIDAppDiscoveryHook] Extracted dataArray length:', dataArray.length);

        const result = {
          id: `entraid-app-discovery-${Date.now()}`,
          name: 'Entra ID App Registrations Discovery',
          moduleName: 'EntraIDApp',
          displayName: 'Entra ID App Registrations Discovery',
          itemCount: dataArray.length,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${dataArray.length} Entra ID app registrations and service principals`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        console.log('[EntraIDAppDiscoveryHook] Setting results with additionalData:', result.additionalData);
        console.log('[EntraIDAppDiscoveryHook] Result moduleName:', result.moduleName);
        console.log('[EntraIDAppDiscoveryHook] Store will persist under key:', result.moduleName);
        setResults(result);
        addResult(result);
        addLog('info', `Discovery completed! Found ${result.itemCount} items.`);
      } else {
        console.log('[EntraIDAppDiscoveryHook] ExecutionId MISMATCH - ignoring event');
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
   * Start the Entra ID App Registrations discovery process
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

    const token = `entraid-app-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setCurrentToken(token);
    currentTokenRef.current = token; // ✅ CRITICAL: Update ref for event matching

    addLog('info', `Starting Entra ID App Registrations discovery for ${selectedSourceProfile.companyName}...`);

    try {
      // ✅ FIXED: Use new event-driven API instead of deprecated executeDiscoveryModule
      const result = await window.electron.executeDiscovery({
        moduleName: 'EntraIDApp',
        parameters: {
          IncludeServicePrincipals: config.includeServicePrincipals,
          IncludeAppRoles: config.includeAppRoles,
          IncludePermissions: config.includePermissions,
          IncludeSecrets: config.includeSecrets,
        },
        executionOptions: {  // ✅ ADDED: Missing execution options
          timeout: 300000,   // 5 minutes for Entra ID app discovery
          showWindow: false, // Use integrated dialog
        },
        executionId: token, // ✅ CRITICAL: Pass token for event matching
      });

      console.log('[EntraIDAppDiscoveryHook] Discovery execution initiated:', result);
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

      const exportFileDefaultName = `entraid-app-discovery-results-${new Date().toISOString().split('T')[0]}.json`;

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

  /**
   * Update filter settings
   */
  const updateFilter = useCallback((updates: any) => {
    setFilter((prev: any) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Export to CSV
   */
  const exportToCSV = useCallback((data?: any[], filename?: string) => {
    try {
      if (!data || data.length === 0) {
        addLog('warning', 'No data to export');
        return;
      }
      const defaultFilename = filename || `export-${new Date().toISOString().split('T')[0]}.csv`;
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = defaultFilename;
      link.click();
      URL.revokeObjectURL(url);
      addLog('info', `Exported ${data.length} records to ${defaultFilename}`);
    } catch (err: any) {
      addLog('error', `Export failed: ${err.message}`);
    }
  }, [addLog]);

  /**
   * Export to Excel (simplified CSV for now)
   */
  const exportToExcel = useCallback(async (data?: any[], filename?: string): Promise<void> => {
    // Use CSV export as fallback - real Excel would need xlsx library
    const defaultFilename = filename || `export-${new Date().toISOString().split('T')[0]}.xlsx`;
    exportToCSV(data, defaultFilename.replace('.xlsx', '.csv'));
  }, [exportToCSV]);

  /**
   * Extract raw data array from results
   * PowerShell module returns: { Success, ModuleName, Data: [...] }
   */
  const rawData: any[] = results?.additionalData?.data?.Data || [];
  console.log('[EntraIDAppDiscoveryHook] rawData computed:', rawData.length, 'items');
  console.log('[EntraIDAppDiscoveryHook] results structure:', {
    hasResults: !!results,
    hasAdditionalData: !!results?.additionalData,
    additionalDataKeys: results?.additionalData ? Object.keys(results.additionalData) : [],
    dataLength: results?.additionalData?.data?.Data?.length || 0
  });

  /**
   * Compute statistics from results
   */
  const appRegistrations = rawData.filter((item: any) => item._ObjectType === 'AppRegistration');
  const servicePrincipals = rawData.filter((item: any) => item._ObjectType === 'ServicePrincipal');
  const enterpriseApps = rawData.filter((item: any) => item._ObjectType === 'EnterpriseApp');
  const secrets = rawData.filter((item: any) => item._ObjectType === 'Secret');

  const stats = rawData.length > 0 ? {
    totalApplications: appRegistrations.length + enterpriseApps.length,
    servicePrincipals: servicePrincipals.length,
    managedIdentities: servicePrincipals.filter((sp: any) => sp.ServicePrincipalType === 'ManagedIdentity').length,
    appsWithSecrets: secrets.length,
    expiringSecrets: secrets.filter((s: any) => {
      const expiry = new Date(s.EndDateTime);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiry > new Date() && expiry <= thirtyDaysFromNow;
    }).length,
    expiredSecrets: secrets.filter((s: any) => new Date(s.EndDateTime) < new Date()).length,
    delegatedPermissions: 0,
    applicationPermissions: 0,
    // Remove complex object properties that violate DiscoveryStats interface
    // These will be computed in the view component instead
  } : null;

  /**
   * Column definitions for the data grid
   */
  const columns = [
    { field: 'DisplayName', headerName: 'Display Name', width: 250, flex: 1 },
    { field: 'AppId', headerName: 'App ID', width: 300 },
    { field: '_ObjectType', headerName: 'Type', width: 150 },
    { field: 'SignInAudience', headerName: 'Sign-In Audience', width: 150 },
    { field: 'AccountEnabled', headerName: 'Enabled', width: 100 },
    { field: 'CreatedDateTime', headerName: 'Created', width: 180 },
  ];

  /**
   * Filtered data based on current tab and filter settings
   */
  const getFilteredData = (): any[] => {
    let data = rawData;

    // Filter by active tab
    switch (activeTab) {
      case 'applications':
        data = [...appRegistrations, ...enterpriseApps];
        break;
      case 'service-principals':
        data = servicePrincipals;
        break;
      case 'secrets':
        data = secrets;
        break;
      case 'permissions':
        data = rawData.filter((item: any) => item._ObjectType === 'Permission');
        break;
      default:
        // 'overview' shows all data
        break;
    }

    // Apply search filter
    if (filter.searchText) {
      data = data.filter((item: any) =>
        JSON.stringify(item).toLowerCase().includes(filter.searchText.toLowerCase())
      );
    }

    return data;
  };

  const filteredData = getFilteredData();
  console.log('[EntraIDAppDiscoveryHook] filteredData computed:', filteredData.length, 'items, activeTab:', activeTab);

  return {
    // Core discovery state
    isRunning,
    isCancelling,
    progress,
    results,
    result: results, // Alias for view compatibility
    error,
    logs,

    // Discovery actions
    startDiscovery,
    cancelDiscovery,
    exportResults,
    clearLogs,
    clearError,

    // Profile
    selectedProfile,

    // Configuration
    config,
    templates,
    updateConfig,
    loadTemplate,
    saveAsTemplate,

    // View state
    activeTab,
    setActiveTab,
    selectedTab: activeTab,  // Alias for BaseDiscoveryHookResult compatibility
    setSelectedTab: setActiveTab,  // Alias for BaseDiscoveryHookResult compatibility
    filter,
    updateFilter,
    showExecutionDialog,
    setShowExecutionDialog,

    // Data display
    currentResult: results,
    isDiscovering: isRunning,
    searchText,
    setSearchText,
    filteredData,
    columns,
    columnDefs: columns,
    stats,
    errors,

    // Export functions
    exportData,
    exportToCSV,
    exportToExcel,
  };
};
