/**
 * Application Discovery Logic Hook
 * Provides state management and business logic for application discovery operations
 */

import { useState, useCallback } from 'react';

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
}

/**
 * Custom hook for application discovery logic
 */
export const useApplicationDiscoveryLogic = (): ApplicationDiscoveryHookResult => {
  const [isRunning, setIsRunning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

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
   * Start the application discovery process
   */
  const startDiscovery = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    setIsCancelling(false);
    setProgress(null);
    setResults(null);
    setError(null);
    setLogs([]);

    addLog('info', 'Starting application discovery...');

    try {
      // Simulate discovery process
      setProgress({ current: 0, total: 100, percentage: 0, message: 'Initializing...' });

      // Mock progress updates
      const progressSteps = [
        { current: 20, message: 'Scanning registry for installed applications...' },
        { current: 40, message: 'Checking Program Files directories...' },
        { current: 60, message: 'Enumerating running processes...' },
        { current: 80, message: 'Analyzing service dependencies...' },
        { current: 100, message: 'Discovery completed' },
      ];

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        if (isCancelling) break;
        setProgress({ ...step, total: 100, percentage: step.current });
        addLog('info', step.message);
      }

      if (!isCancelling) {
        // Mock results
        const mockResults = {
          applications: [
            { name: 'Microsoft Office', version: '365', vendor: 'Microsoft', installDate: '2023-01-15' },
            { name: 'Google Chrome', version: '120.0', vendor: 'Google', installDate: '2023-06-10' },
            { name: 'Adobe Acrobat', version: '23.0', vendor: 'Adobe', installDate: '2023-03-20' },
          ],
          processes: [
            { name: 'chrome.exe', pid: 1234, user: 'user1', cpuUsage: 5.2, memoryUsage: 150000000 },
            { name: 'explorer.exe', pid: 5678, user: 'user1', cpuUsage: 2.1, memoryUsage: 80000000 },
          ],
          services: [
            { name: 'wuauserv', displayName: 'Windows Update', status: 'Running', startType: 'Automatic' },
            { name: 'Spooler', displayName: 'Print Spooler', status: 'Running', startType: 'Automatic' },
          ],
        };

        setResults(mockResults);
        addLog('info', `Discovery completed. Found ${mockResults.applications.length} applications, ${mockResults.processes.length} processes, ${mockResults.services.length} services.`);
      } else {
        addLog('warn', 'Discovery was cancelled by user.');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred during discovery';
      setError(errorMessage);
      addLog('error', errorMessage);
    } finally {
      setIsRunning(false);
      setIsCancelling(false);
      setProgress(null);
    }
  }, [isRunning, isCancelling, addLog]);

  /**
   * Cancel the ongoing discovery process
   */
  const cancelDiscovery = useCallback(async () => {
    if (!isRunning) return;

    setIsCancelling(true);
    addLog('info', 'Cancelling discovery...');
  }, [isRunning, addLog]);

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
  };
};
