/**
 * Active Directory Discovery Logic Hook
 * Provides state management and business logic for Active Directory discovery operations
 * ✅ FIXED: Now uses event-driven architecture with streaming support
 */

import { useState, useCallback, useEffect, useRef } from 'react';

import {
  BaseDiscoveryHookResult,
  LogEntry,
  ProgressInfo,
  Profile
} from './common/discoveryHookTypes';
import type { PowerShellLog } from '../components/molecules/PowerShellExecutionDialog';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

/**
 * Active Directory Discovery Hook Return Type
 */
export type ActiveDirectoryDiscoveryHookResult = BaseDiscoveryHookResult

/**
 * Custom hook for Active Directory discovery logic
 */
export const useActiveDirectoryDiscoveryLogic = (): ActiveDirectoryDiscoveryHookResult => {
  // Get selected company profile from store
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult } = useDiscoveryStore();

  const [isRunning, setIsRunning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);

  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const currentTokenRef = useRef<string | null>(null); // ✅ ADDED: Ref for event matching

  // Additional state for view compatibility
  const [config, setConfig] = useState<any>({
    includeUsers: true,
    includeGroups: true,
    includeComputers: true,
    includeOUs: true
  });
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('users');
  const [searchText, setSearchText] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);

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
    console.log('[ADDiscoveryHook] Setting up event listeners');

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

        // Debug logging - log the full structure
        console.log('[ADDiscoveryHook] Complete event data:', data);
        console.log('[ADDiscoveryHook] data.result:', data.result);
        console.log('[ADDiscoveryHook] data.result keys:', Object.keys(data.result || {}));
        console.log('[ADDiscoveryHook] data.result.data:', data.result?.data);
        console.log('[ADDiscoveryHook] data.result.data keys:', Object.keys(data.result?.data || {}));

        // Extract the actual data from PowerShell result
        // The PowerShell JSON result has structure: { success, data: { ...actual data... }, duration, ... }
        const psResult = data.result || {};
        const actualData = psResult.data || psResult; // Try data property first, fallback to psResult
        const metadata = actualData.Metadata || {};
        const recordCount = actualData.RecordCount || metadata.TotalRecords || 0;

        console.log('[ADDiscoveryHook] actualData:', actualData);
        console.log('[ADDiscoveryHook] Extracted metadata:', metadata);
        console.log('[ADDiscoveryHook] recordCount:', recordCount);

        // Extract counts from metadata
        const userCount = metadata.UserCount || 0;
        const groupCount = metadata.GroupCount || 0;
        const computerCount = metadata.ComputerCount || 0;
        const ouCount = metadata.OUCount || 0;
        const gpoCount = 0; // GPOs not currently discovered

        // Calculate objects per second
        const elapsedSeconds = metadata.ElapsedTimeSeconds || (data.duration / 1000) || 1;
        const objectsPerSecond = recordCount / elapsedSeconds;

        // Create the result object that the view expects
        const adResult = {
          id: psResult?.ExecutionId || `ad-discovery-${Date.now()}`,
          configId: `ad-discovery-${Date.now()}`,
          startTime: psResult?.StartTime || new Date().toISOString(),
          endTime: psResult?.EndTime || new Date().toISOString(),
          status: 'completed',
          duration: data.duration || 0,

          // Data is in CSV files - arrays will be empty but we have counts
          users: [], // CSV: ADUsers.csv
          groups: [], // CSV: ADGroups.csv
          computers: [], // CSV: ADComputers.csv
          ous: [], // CSV: ADOrganizationalUnits.csv
          gpos: [], // CSV: Not currently discovered

          // Extract stats from metadata
          stats: {
            totalUsers: userCount,
            totalGroups: groupCount,
            totalComputers: computerCount,
            totalOUs: ouCount,
            totalGPOs: gpoCount,
            enabledUsers: userCount, // Could be refined with CSV data
            securityGroups: groupCount, // Could be refined with CSV data
            enabledComputers: computerCount, // Could be refined with CSV data
            objectsPerSecond: Math.round(objectsPerSecond * 100) / 100
          },

          // Forest/domain information from metadata
          forest: metadata.DomainDNSRoot ? {
            name: metadata.DomainDNSRoot,
            netbiosName: metadata.DomainNetBIOSName,
            domainControllers: [],
            sites: [],
            trusts: []
          } : null,

          // Metadata from PowerShell result
          metadata: metadata,

          // Configuration
          config: config,
          configName: 'Default AD Discovery'
        };

        setResults(adResult);

        // Create discovery store result
        const discoveryResult = {
          id: adResult.id,
          name: 'Active Directory Discovery',
          moduleName: 'ActiveDirectory',
          displayName: 'Active Directory Discovery',
          itemCount: recordCount,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${userCount} users, ${groupCount} groups, ${computerCount} computers, ${ouCount} OUs (${recordCount} total records)`,
          errorMessage: '',
          additionalData: adResult,
          createdAt: new Date().toISOString(),
        };

        addResult(discoveryResult); // ✅ ADDED: Store in discovery store
        addLog('info', `Discovery completed! Found ${recordCount} items.`);
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
   * Start the Active Directory discovery process
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

    setShowExecutionDialog(true);
    setIsRunning(true);
    setIsCancelling(false);
    setProgress(null);
    setResults(null);
    setError(null);
    setLogs([]);

    const token = `ad-discovery-${Date.now()}`;
    setCurrentToken(token);
    currentTokenRef.current = token; // ✅ CRITICAL: Update ref for event matching

    addLog('info', `Starting Active Directory discovery for ${selectedSourceProfile.companyName}...`);

    try {
      // ✅ FIXED: Use new event-driven API instead of deprecated executeDiscoveryModule
      const result = await window.electron.executeDiscovery({
        moduleName: 'ActiveDirectory',
        parameters: {
          IncludeUsers: config.includeUsers,
          IncludeGroups: config.includeGroups,
          IncludeComputers: config.includeComputers,
          IncludeOUs: config.includeOUs,
        },
        executionOptions: {  // ✅ ADDED: Missing execution options
          timeout: 300000,   // 5 minutes for Active Directory discovery
          showWindow: false, // Use integrated dialog
        },
        executionId: token, // ✅ CRITICAL: Pass token for event matching
      });

      console.log('[ADDiscoveryHook] Discovery execution initiated:', result);
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

      const exportFileDefaultName = `ad-discovery-results-${new Date().toISOString().split('T')[0]}.json`;

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
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Update configuration
   */
  const updateConfig = useCallback((updates: any) => {
    setConfig((prev: any) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Update filter state
   */
  const updateFilter = useCallback((updates: any) => {
    setSearchText(updates.searchText || '');
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
   * Export to CSV
   */
  const exportToCSV = useCallback((data?: any[], filename?: string) => {
    const dataToExport = data || results;
    if (!dataToExport) return;

    const csvFilename = filename || `ad-discovery-${new Date().toISOString().split('T')[0]}.csv`;
    addLog('info', `Exporting to CSV: ${csvFilename}`);
    // Mock implementation - actual CSV export would be implemented here
  }, [results, addLog]);

  /**
   * Export to Excel
   */
  const exportToExcel = useCallback(async (data?: any[], filename?: string) => {
    const dataToExport = data || results;
    if (!dataToExport) return;

    const excelFilename = filename || `ad-discovery-${new Date().toISOString().split('T')[0]}.xlsx`;
    addLog('info', `Exporting to Excel: ${excelFilename}`);
    // Mock implementation - actual Excel export would be implemented here
  }, [results, addLog]);

  return {
    // Core state
    isRunning,
    isCancelling,
    progress,
    results,
    result: results, // Alias for results
    error,
    logs,
    selectedProfile,

    // PowerShell execution dialog state
    showExecutionDialog,
    setShowExecutionDialog,

    // Core actions
    startDiscovery,
    cancelDiscovery,
    exportResults,
    clearLogs,
    clearError,

    // View compatibility properties
    config,
    templates,
    currentResult: results,
    isDiscovering: isRunning,
    selectedTab,
    activeTab: selectedTab, // Alias for selectedTab
    searchText,
    filter: { searchText }, // FilterState
    filteredData: results ? Object.values(results).flat() : [],
    columnDefs: [],
    columns: [], // Alias for columnDefs
    stats: results?.stats || null,
    errors,

    // View compatibility actions
    updateConfig,
    loadTemplate,
    saveAsTemplate,
    setSelectedTab,
    setActiveTab: setSelectedTab, // Alias for setSelectedTab
    setSearchText,
    updateFilter,
    exportData,
    exportToCSV,
    exportToExcel,
  };
};


