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

        // Extract the actual data from PowerShell result
        const psData = data.result?.Data || data.result || {};

        // Create the result object that the view expects
        const adResult = {
          id: psData?.id || `ad-discovery-${Date.now()}`,
          configId: psData?.id || `ad-discovery-${Date.now()}`,
          startTime: psData?.startTime || new Date().toISOString(),
          endTime: psData?.endTime || new Date().toISOString(),
          status: 'completed',
          duration: data.duration || 0,

          // Extract arrays with fallbacks to empty arrays
          users: Array.isArray(psData?.users) ? psData.users : [],
          groups: Array.isArray(psData?.groups) ? psData.groups : [],
          computers: Array.isArray(psData?.computers) ? psData.computers : [],
          ous: Array.isArray(psData?.ous) ? psData.ous : [],
          gpos: Array.isArray(psData?.gpos) ? psData.gpos : [],

          // Extract stats with fallbacks
          stats: psData?.statistics || {
            totalUsers: 0,
            totalGroups: 0,
            totalComputers: 0,
            totalOUs: 0,
            totalGPOs: 0,
            enabledUsers: 0,
            securityGroups: 0,
            enabledComputers: 0,
            objectsPerSecond: 0
          },

          // Forest information if available
          forest: psData?.forest || null,

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
          itemCount: adResult.users.length + adResult.groups.length + adResult.computers.length + adResult.ous.length + adResult.gpos.length,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${adResult.users.length} users, ${adResult.groups.length} groups, ${adResult.computers.length} computers, ${adResult.ous.length} OUs, ${adResult.gpos.length} GPOs`,
          errorMessage: '',
          additionalData: adResult,
          createdAt: new Date().toISOString(),
        };

        addResult(discoveryResult); // ✅ ADDED: Store in discovery store
        addLog('info', `Discovery completed! Found ${discoveryResult.itemCount} items.`);
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

  return {
    isRunning,
    isCancelling,
    progress,
    results,
    error,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
    startDiscovery,
    cancelDiscovery,
    exportResults,
    clearLogs,
    selectedProfile,

    // Additional properties
    config,
    templates,
    currentResult: results,
    isDiscovering: isRunning,
    selectedTab,
    searchText,
    filteredData: results ? Object.values(results).flat() : [],
    columnDefs: [],
    errors,
    updateConfig,
    loadTemplate,
    saveAsTemplate,
    setSelectedTab,
    setSearchText,
    exportData,
  };
};
