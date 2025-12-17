/**
 * Azure Resource Discovery Hook
 *
 * Event-driven hook for Azure Resource discovery operations.
 * Follows the standard discovery pattern with token-based event matching.
 *
 * ✅ FIXED: Migrated to event-driven architecture
 * - Uses window.electron.executeDiscovery() instead of deprecated API
 * - Token-based event matching with currentTokenRef
 * - Event listeners with empty dependency array []
 * - Proper cleanup of event listeners
 * - Results stored via addResult()
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { PowerShellLog } from '../components/molecules/PowerShellExecutionDialog';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

export interface AzureResourceDiscoveryConfig {
  includeVirtualMachines?: boolean;
  includeStorageAccounts?: boolean;
  includeNetworkResources?: boolean;
  includeDatabases?: boolean;
  includeWebApps?: boolean;
  timeout?: number;
}

export interface AzureResourceDiscoveryResult {
  success: boolean;
  error?: string;
  data?: {
    virtualMachines?: any[];
    storageAccounts?: any[];
    networkResources?: any[];
    databases?: any[];
    webApps?: any[];
    summary?: {
      totalResources: number;
      resourceTypes: number;
      subscriptions: string[];
    };
  };
}

export interface AzureResourceDiscoveryProgress {
  percentage: number;
  currentPhase: string;
  message: string;
}

export const useAzureResourceDiscoveryLogic = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AzureResourceDiscoveryResult | null>(null);
  const [progress, setProgress] = useState<AzureResourceDiscoveryProgress | null>(null);
  const [logs, setLogs] = useState<Array<{ level: string; message: string; timestamp: string }>>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);

  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const addResult = useDiscoveryStore((state) => state.addResult);

  // ✅ CRITICAL: useRef for token to avoid stale closures
  const currentTokenRef = useRef<string | null>(null);

  const [config] = useState<AzureResourceDiscoveryConfig>({
    includeVirtualMachines: true,
    includeStorageAccounts: true,
    includeNetworkResources: true,
    includeDatabases: true,
    includeWebApps: true,
    timeout: 300000, // 5 minutes
  });

  const addLog = useCallback((level: string, message: string) => {
    setLogs((prev) => [...prev, { level, message, timestamp: new Date().toISOString() }]);
  }, []);

  // ✅ CRITICAL: Event listeners with empty dependency array []
  useEffect(() => {
    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const logLevel = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warning' : 'info';
        addLog(logLevel, data.message);
      }
    });

    const unsubscribeProgress = window.electron?.onDiscoveryProgress?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setProgress({
          percentage: data.percentage || 0,
          currentPhase: data.currentPhase || 'Processing',
          message: 'Processing...',
        });
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setIsRunning(false);

        const discoveryResult: AzureResourceDiscoveryResult = {
          success: true, // Assume success if complete event fired
          error: undefined,
          data: data.result,
        };

        setResults(discoveryResult);

        if (discoveryResult.success) {
          // ✅ CRITICAL: Store result in discovery store
          addResult({
            id: `azure-resource-${Date.now()}`,
            moduleName: 'AzureResource',
            success: true,
            data: discoveryResult.data ? [discoveryResult.data] : [],
          });

          addLog('success', 'Azure Resource discovery completed successfully');
          setError(null);
        } else {
          setError(discoveryResult.error || 'Discovery failed');
          addLog('error', discoveryResult.error || 'Discovery failed');
        }

        currentTokenRef.current = null;
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setIsRunning(false);
        setError(data.error || 'An unknown error occurred');
        addLog('error', data.error || 'An unknown error occurred');
        currentTokenRef.current = null;
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setIsRunning(false);
        setError('Discovery was cancelled');
        addLog('warning', 'Discovery was cancelled by user');
        currentTokenRef.current = null;
      }
    });

    // ✅ CRITICAL: Cleanup function
    return () => {
      unsubscribeOutput?.();
      unsubscribeProgress?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeCancelled?.();
    };
  }, []); // ✅ CRITICAL: Empty dependency array

  const startDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      setError('No profile selected');
      addLog('error', 'No profile selected');
      return;
    }

    if (isRunning) {
      addLog('warning', 'Discovery is already running');
      return;
    }

    setShowExecutionDialog(true);
    setIsRunning(true);
    setError(null);
    setResults(null);
    setProgress(null);
    setLogs([]);
    addLog('info', 'Starting Azure Resource discovery...');

    try {
      // ✅ CRITICAL: Generate token and set BEFORE API call
      const token = `azure-resource-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      currentTokenRef.current = token;

      // ✅ FIXED: Use window.electron.executeDiscovery with executionId
      const result = await window.electron.executeDiscovery({
        moduleName: 'AzureResource',
        parameters: {
          profileId: selectedSourceProfile.id,
          companyName: selectedSourceProfile.companyName,
          config: {
            includeVirtualMachines: config.includeVirtualMachines,
            includeStorageAccounts: config.includeStorageAccounts,
            includeNetworkResources: config.includeNetworkResources,
            includeDatabases: config.includeDatabases,
            includeWebApps: config.includeWebApps,
          },
        },
        executionOptions: {
          timeout: config.timeout || 300000,
          showWindow: false,
        },
        executionId: token, // ✅ CRITICAL: Token for event matching
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to start Azure Resource discovery');
      }

      addLog('info', 'Azure Resource discovery started successfully');
    } catch (err: any) {
      setIsRunning(false);
      const errorMessage = err?.message || 'Failed to start Azure Resource discovery';
      setError(errorMessage);
      addLog('error', errorMessage);
      currentTokenRef.current = null;
    }
  }, [isRunning, config, addLog, selectedSourceProfile, addResult]);

  const cancelDiscovery = useCallback(async () => {
    if (!currentTokenRef.current) {
      addLog('warning', 'No active discovery to cancel');
      return;
    }

    setIsCancelling(true);
    try {
      addLog('info', 'Cancelling Azure Resource discovery...');
      await window.electron.cancelDiscovery(currentTokenRef.current);

      // Wait for cancellation event (with 2-second timeout)
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          setIsRunning(false);
          setIsCancelling(false);
          currentTokenRef.current = null;
          resolve();
        }, 2000);

        const checkCancelled = setInterval(() => {
          if (!currentTokenRef.current) {
            clearTimeout(timeout);
            clearInterval(checkCancelled);
            resolve();
          }
        }, 100);
      });
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to cancel discovery';
      setError(errorMessage);
      addLog('error', errorMessage);
      setIsRunning(false);
      setIsCancelling(false);
      currentTokenRef.current = null;
    }
  }, [addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    isRunning,
    isCancelling,
    error,
    results,
    progress,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
    config,
    startDiscovery,
    cancelDiscovery,
    clearLogs,
  };
}
