/**
 * Azure Management Groups Discovery Hook
 *
 * Event-driven hook for Azure Management Groups discovery operations.
 * Part of AzureHound-inspired enhancements for comprehensive Azure enumeration.
 *
 * Discovers:
 * - Management Group hierarchy and structure
 * - Parent-child relationships
 * - Subscription assignments to management groups
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

export interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

export interface AzureManagementGroupsDiscoveryConfig {
  timeout?: number;
}

export interface AzureManagementGroupsDiscoveryProgress {
  percentage: number;
  message: string;
}

export const useAzureManagementGroupsDiscoveryLogic = () => {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [progress, setProgress] = useState<AzureManagementGroupsDiscoveryProgress>({ percentage: 0, message: '' });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);

  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const addResult = useDiscoveryStore((state) => state.addResult);

  const currentTokenRef = useRef<string | null>(null);

  const [config] = useState<AzureManagementGroupsDiscoveryConfig>({
    timeout: 300000,
  });

  // Event listeners with empty dependency array
  useEffect(() => {
    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const message = data.message || '';
        let level: LogEntry['level'] = 'info';
        if (message.toLowerCase().includes('error') || message.toLowerCase().includes('failed')) {
          level = 'error';
        } else if (message.toLowerCase().includes('warning') || message.toLowerCase().includes('warn')) {
          level = 'warning';
        } else if (message.toLowerCase().includes('success') || message.toLowerCase().includes('complete') || message.toLowerCase().includes('found')) {
          level = 'success';
        }
        setLogs((prev) => [...prev, { timestamp: new Date().toISOString(), message, level }]);
        setProgress((prev) => ({ ...prev, message }));
      }
    });

    const unsubscribeProgress = window.electron?.onDiscoveryProgress?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setProgress({
          percentage: data.percentage || 0,
          message: data.currentPhase || 'Processing...',
        });
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setIsDiscovering(false);
        setIsCancelling(false);

        const resultData = data.result as any;
        const managementGroups = resultData?.ManagementGroups || resultData?.managementGroups || [];
        const count = Array.isArray(managementGroups) ? managementGroups.length : 0;

        setResult({
          success: true,
          managementGroups: managementGroups,
          totalCount: count,
        });

        addResult({
          id: `azure-mgmt-groups-${Date.now()}`,
          name: 'Azure Management Groups Discovery',
          moduleName: 'AzureManagementGroups',
          displayName: 'Management Groups',
          itemCount: count,
          discoveryTime: new Date(),
          duration: data.duration || 0,
          status: 'completed',
          filePath: '',
          createdAt: new Date(),
          success: true,
          summary: `Discovered ${count} Management Groups`,
          errorMessage: '',
          additionalData: { managementGroups: managementGroups },
        });

        setLogs((prev) => [...prev, { timestamp: new Date().toISOString(), message: `Discovery completed! Found ${count} Management Groups.`, level: 'success' }]);
        setProgress({ percentage: 100, message: 'Complete' });
        setError(null);
        currentTokenRef.current = null;
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setIsDiscovering(false);
        setIsCancelling(false);
        setError(data.error || 'Discovery failed');
        setLogs((prev) => [...prev, { timestamp: new Date().toISOString(), message: `Error: ${data.error}`, level: 'error' }]);
        setProgress({ percentage: 0, message: 'Failed' });
        currentTokenRef.current = null;
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setIsDiscovering(false);
        setIsCancelling(false);
        setLogs((prev) => [...prev, { timestamp: new Date().toISOString(), message: 'Discovery cancelled by user', level: 'warning' }]);
        setProgress({ percentage: 0, message: 'Cancelled' });
        currentTokenRef.current = null;
      }
    });

    return () => {
      unsubscribeOutput?.();
      unsubscribeProgress?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeCancelled?.();
    };
  }, [addResult]);

  const startDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      setError('No profile selected. Please select a profile first.');
      return;
    }

    const token = `azure-mgmt-groups-discovery-${Date.now()}`;
    currentTokenRef.current = token;

    setIsDiscovering(true);
    setIsCancelling(false);
    setError(null);
    setLogs([{ timestamp: new Date().toISOString(), message: 'Starting Management Groups discovery...', level: 'info' }]);
    setShowExecutionDialog(true);
    setProgress({ percentage: 0, message: 'Initializing...' });

    try {
      await window.electron?.executeDiscovery?.({
        moduleName: 'AzureSecurity',
        parameters: {
          DiscoveryType: 'ManagementGroups',
        },
        executionOptions: { timeout: config.timeout || 300000 },
        executionId: token,
      });
    } catch (err: any) {
      setIsDiscovering(false);
      setError(err.message || 'Failed to start discovery');
      setLogs((prev) => [...prev, { timestamp: new Date().toISOString(), message: `Failed to start: ${err.message}`, level: 'error' }]);
      currentTokenRef.current = null;
    }
  }, [selectedSourceProfile, config.timeout]);

  const cancelDiscovery = useCallback(async () => {
    if (!isDiscovering || !currentTokenRef.current) return;

    setIsCancelling(true);
    setLogs((prev) => [...prev, { timestamp: new Date().toISOString(), message: 'Cancelling discovery...', level: 'warning' }]);

    try {
      await window.electron?.cancelDiscovery?.(currentTokenRef.current);
    } catch (err: any) {
      setLogs((prev) => [...prev, { timestamp: new Date().toISOString(), message: `Cancel failed: ${err.message}`, level: 'error' }]);
    }
  }, [isDiscovering]);

  const clearError = useCallback(() => setError(null), []);
  const clearLogs = useCallback(() => setLogs([]), []);

  return {
    config,
    result,
    isDiscovering,
    isCancelling,
    progress,
    error,
    startDiscovery,
    cancelDiscovery,
    clearError,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
    clearLogs,
  };
};


