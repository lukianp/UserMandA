/**
 * Application Discovery Logic Hook
 * Provides state management and business logic for application discovery operations
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { getElectronAPI } from '../lib/electron-api-fallback';
import type { PowerShellLog } from '../components/molecules/PowerShellExecutionDialog';

/**
 * Log entry interface
 */
export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

/**
 * Progress information interface
 */
export interface ProgressInfo {
  current: number;
  total: number;
  percentage: number;
  message: string;
  currentOperation?: string;
  progress?: number;
  objectsProcessed?: number;
  estimatedTimeRemaining?: string;
}

/**
 * Profile interface
 */
export interface Profile {
  name: string;
  description?: string;
}

/**
 * Application Discovery Hook Return Type
 */
export interface ApplicationDiscoveryHookResult {
  // Existing properties
  isRunning: boolean;
  isCancelling: boolean;
  progress: ProgressInfo | null;
  results: any | null;
  error: string | null;
  logs: LogEntry[];
  startDiscovery: () => Promise<void>;
  cancelDiscovery: () => Promise<void>;
  exportResults: () => Promise<void>;
  clearLogs: () => void;
  selectedProfile: Profile | null;
  showExecutionDialog: boolean;
  setShowExecutionDialog: (show: boolean) => void;

  // Additional properties expected by the view
  config: any;
  templates: any[];
  currentResult: any | null;
  isDiscovering: boolean;
  selectedTab: string;
  searchText: string;
  filteredData: any[];
  columnDefs: any[];
  errors: string[];
  updateConfig: (updates: any) => void;
  loadTemplate: (template: any) => void;
  saveAsTemplate: (name: string) => void;
  setSelectedTab: (tab: string) => void;
  setSearchText: (text: string) => void;
  exportData: (format: string) => Promise<void>;
}

/**
 * Custom hook for application discovery logic
 */
export const useApplicationDiscoveryLogic = (): ApplicationDiscoveryHookResult => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult: addDiscoveryResult, getResultsByModuleName } = useDiscoveryStore();
  const [isRunning, setIsRunning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const currentTokenRef = useRef<string | null>(null);

  // Additional state for view compatibility - Application Discovery Configuration
  const [config, setConfig] = useState<any>({
    IncludeAzureADApps: true,        // Include Azure AD Enterprise Apps & App Registrations
    IncludeServicePrincipals: true,  // Include Service Principals (Enterprise Apps)
    IncludeAppRegistrations: true,   // Include App Registrations
    IncludeIntuneApps: true,         // Include Intune managed applications
    // Legacy properties for backwards compatibility
    includeSoftware: true,
    includeProcesses: true,
    includeServices: true,
    scanRegistry: false,
    scanFilesystem: false,
    scanPorts: false
  });
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('software');
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

  // Load previous discovery results from store on mount
  useEffect(() => {
    const previousResults = getResultsByModuleName('ApplicationDiscovery');
    if (previousResults && previousResults.length > 0) {
      console.log('[ApplicationDiscoveryHook] Restoring', previousResults.length, 'previous results from store');
      const latestResult = previousResults[previousResults.length - 1];
      setResults(latestResult);
      addLog('info', `Restored ${previousResults.length} previous discovery result(s)`);
    }
  }, [getResultsByModuleName, addLog]);

  // Event listeners for PowerShell streaming
  useEffect(() => {
    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const logLevel = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warn' : 'info';
        addLog(logLevel, data.message);
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setIsRunning(false);
        setIsCancelling(false);
        setCurrentToken(null);

        const result = {
          id: `application-discovery-${Date.now()}`,
          name: 'Application Discovery',
          moduleName: 'ApplicationDiscovery',
          displayName: 'Application Discovery',
          itemCount: data?.result?.totalItems || data?.result?.RecordCount || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalItems || data?.result?.RecordCount || 0} applications`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setResults(result);
        addDiscoveryResult(result);
        addLog('info', `Discovery completed! Found ${result.itemCount} applications.`);
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
        addLog('warn', 'Discovery cancelled by user');
      }
    });

    return () => {
      unsubscribeOutput?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeCancelled?.();
    };
  }, [addLog, addDiscoveryResult]);

  /**
   * Start the application discovery process
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
    setShowExecutionDialog(true);

    const token = `application-discovery-${Date.now()}`;
    setCurrentToken(token);
    currentTokenRef.current = token;

    addLog('info', `Starting application discovery for ${selectedSourceProfile.companyName}...`);

    try {
      // Call PowerShell module - Application Discovery uses Microsoft Graph for cloud applications
      // Pass configuration parameters to control what gets discovered
      const result = await window.electron.executeDiscovery({
        moduleName: 'Application',
        parameters: {
          IncludeAzureADApps: config.IncludeAzureADApps,
          IncludeServicePrincipals: config.IncludeServicePrincipals,
          IncludeAppRegistrations: config.IncludeAppRegistrations,
          IncludeIntuneApps: config.IncludeIntuneApps,
        },
        executionOptions: {
          showWindow: false, // Don't show PowerShell console window
        },
        executionId: token,
      });

      console.log('[ApplicationDiscoveryHook] Discovery execution completed:', result);
      addLog('info', 'Discovery execution call completed');

      // Note: Completion will be handled by the discovery:complete event listener
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred during discovery';
      setError(errorMessage);
      addLog('error', errorMessage);
      setIsRunning(false);
      setCurrentToken(null);
      setProgress(null);
    }
  }, [isRunning, config, selectedSourceProfile, addLog]);

  /**
   * Cancel the ongoing discovery process
   */
  const cancelDiscovery = useCallback(async () => {
    if (!isRunning || !currentToken) return;

    setIsCancelling(true);
    addLog('warn', 'Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentToken);
      addLog('info', 'Discovery cancellation requested successfully');

      // Set a timeout to reset state in case the cancelled event doesn't fire
      setTimeout(() => {
        setIsRunning(false);
        setIsCancelling(false);
        setCurrentToken(null);
        setProgress(null);
        addLog('warn', 'Discovery cancelled - reset to start state');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.message || 'Error cancelling discovery';
      addLog('error', errorMessage);
      // Reset state even on error
      setIsRunning(false);
      setIsCancelling(false);
      setCurrentToken(null);
      setProgress(null);
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

      const exportFileDefaultName = `application-discovery-results-${new Date().toISOString().split('T')[0]}.json`;

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
    result: results,
    error,
    logs,
    startDiscovery,
    cancelDiscovery,
    exportResults,
    clearLogs,
    selectedProfile,
    showExecutionDialog,
    setShowExecutionDialog,

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
