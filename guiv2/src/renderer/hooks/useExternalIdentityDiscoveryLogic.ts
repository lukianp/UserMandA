/**
 * External Identity Discovery Logic Hook
 * Provides state management and business logic for external/guest identity discovery operations
 * ✅ FIXED: Uses event-driven architecture with streaming support
 */

import { useState, useCallback, useEffect, useRef } from 'react';

import {
  BaseDiscoveryHookResult,
  LogEntry,
  ProgressInfo,
  Profile
} from './common/discoveryHookTypes';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

/**
 * External Identity Discovery Hook Return Type
 */
export type ExternalIdentityDiscoveryHookResult = BaseDiscoveryHookResult;

/**
 * Custom hook for External Identity (Guest Users, B2B, B2C) discovery logic
 */
export const useExternalIdentityDiscoveryLogic = (): ExternalIdentityDiscoveryHookResult => {
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

  // PowerShell execution dialog state
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);

  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const currentTokenRef = useRef<string | null>(null); // ✅ ADDED: Ref for event matching

  // Additional state for view compatibility
  const [config, setConfig] = useState<any>({
    includeGuests: true,
    includeB2B: true,
    includeB2C: true,
    includeInvitationDetails: true,
  });
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('guests');
  const [searchText, setSearchText] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);

  /**
   * Load previous results from discovery store on mount
   */
  useEffect(() => {
    console.log('[ExternalIdentityDiscoveryHook] Loading previous results from discovery store');
    const previousResults = getResultsByModuleName('ExternalIdentityDiscovery');

    if (previousResults && previousResults.length > 0) {
      const mostRecent = previousResults[previousResults.length - 1];
      console.log('[ExternalIdentityDiscoveryHook] Found previous result:', mostRecent);
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
    console.log('[ExternalIdentityDiscoveryHook] Setting up event listeners');

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
          id: `external-identity-discovery-${Date.now()}`,
          name: 'External Identity Discovery',
          moduleName: 'ExternalIdentityDiscovery',
          displayName: 'External Identity Discovery',
          itemCount: data?.result?.totalItems || data?.result?.RecordCount || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalItems || 0} external identities (guests, B2B, B2C)`,
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
   * Start the External Identity discovery process
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

    const token = `external-identity-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setCurrentToken(token);
    currentTokenRef.current = token; // ✅ CRITICAL: Update ref for event matching

    addLog('info', `Starting External Identity discovery for ${selectedSourceProfile.companyName}...`);

    try {
      // ✅ FIXED: Use new event-driven API instead of deprecated executeDiscoveryModule
      const result = await window.electron.executeDiscovery({
        moduleName: 'ExternalIdentity',
        parameters: {
          IncludeGuests: config.includeGuests,
          IncludeB2B: config.includeB2B,
          IncludeB2C: config.includeB2C,
          IncludeInvitationDetails: config.includeInvitationDetails,
        },
        executionOptions: {  // ✅ ADDED: Missing execution options
          timeout: 300000,   // 5 minutes for external identity discovery
          showWindow: false, // Use integrated dialog
        },
        executionId: token, // ✅ CRITICAL: Pass token for event matching
      });

      console.log('[ExternalIdentityDiscoveryHook] Discovery execution initiated:', result);
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

      const exportFileDefaultName = `external-identity-discovery-results-${new Date().toISOString().split('T')[0]}.json`;

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
   * Set active tab (alias for setSelectedTab)
   */
  const setActiveTab = useCallback((tab: string) => {
    setSelectedTab(tab);
  }, []);

  /**
   * Update filter state
   */
  const updateFilter = useCallback((updates: Partial<FilterState>) => {
    if (updates.searchText !== undefined) {
      setSearchText(updates.searchText);
    }
  }, []);

  /**
   * Export to CSV
   */
  const exportToCSV = useCallback((data?: any[], filename?: string) => {
    addLog('info', 'Exporting to CSV...');
    // Mock CSV export - could be implemented with a library like papaparse
    console.log('CSV export requested', { data, filename });
  }, [addLog]);

  /**
   * Export to Excel
   */
  const exportToExcel = useCallback(async (data?: any[], filename?: string) => {
    addLog('info', 'Exporting to Excel...');
    // Mock Excel export - could be implemented with a library like xlsx
    console.log('Excel export requested', { data, filename });
  }, [addLog]);

  return {
    isRunning,
    isCancelling,
    progress,
    results,
    result: results, // Alias for results
    error,
    logs,
    showExecutionDialog,
    setShowExecutionDialog: (show: boolean) => setShowExecutionDialog(show),
    startDiscovery,
    cancelDiscovery,
    exportResults,
    clearLogs,
    clearError: () => setError(null), // Clear error function
    selectedProfile,

    // Additional properties
    config,
    templates,
    currentResult: results,
    isDiscovering: isRunning,
    selectedTab,
    activeTab: selectedTab, // Alias for selectedTab
    searchText,
    filter: { searchText }, // Filter object with required searchText property
    filteredData: results ? Object.values(results).flat() : [],
    columnDefs: [],
    columns: [], // Alias for columnDefs
    stats: null, // Stats not implemented yet
    errors,
    updateConfig,
    loadTemplate,
    saveAsTemplate,
    setSelectedTab,
    setActiveTab,
    setSearchText,
    updateFilter,
    exportData,
    exportToCSV,
    exportToExcel,
  };
};


