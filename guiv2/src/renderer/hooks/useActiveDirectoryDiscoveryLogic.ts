/**
 * Active Directory Discovery Logic Hook
 * Provides state management and business logic for Active Directory discovery operations
 */

import { useState, useCallback, useEffect } from 'react';

import {
  BaseDiscoveryHookResult,
  LogEntry,
  ProgressInfo,
  Profile
} from './common/discoveryHookTypes';

/**
 * Active Directory Discovery Hook Return Type
 */
export type ActiveDirectoryDiscoveryHookResult = BaseDiscoveryHookResult

/**
 * Custom hook for Active Directory discovery logic
 */
export const useActiveDirectoryDiscoveryLogic = (): ActiveDirectoryDiscoveryHookResult => {
  const [isRunning, setIsRunning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

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

  /**
   * Start the Active Directory discovery process
   */
  const startDiscovery = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    setIsCancelling(false);
    setProgress(null);
    setResults(null);
    setError(null);
    setLogs([]);

    const token = `ad-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setCurrentToken(token);

    addLog('info', 'Starting Active Directory discovery...');

    try {
      await window.electron.executeDiscovery({
        moduleName: 'ActiveDirectoryDiscovery',
        parameters: {
          includeUsers: config.includeUsers,
          includeGroups: config.includeGroups,
          includeComputers: config.includeComputers,
          includeOUs: config.includeOUs,
        },
        executionId: token,
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred during discovery';
      setError(errorMessage);
      addLog('error', errorMessage);
      setIsRunning(false);
      setCurrentToken(null);
      setProgress(null);
    }
  }, [isRunning, config, addLog]);

  /**
   * Cancel the ongoing discovery process
   */
  const cancelDiscovery = useCallback(async () => {
    if (!currentToken) return;

    try {
      await window.electron.cancelDiscovery(currentToken);
      addLog('info', 'Discovery cancellation requested successfully');
    } catch (err) {
      addLog('error', `Error cancelling: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsCancelling(true);
    }
  }, [currentToken, addLog]);

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
