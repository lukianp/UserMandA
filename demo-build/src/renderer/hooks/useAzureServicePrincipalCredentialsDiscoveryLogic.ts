/**
 * Azure Service Principal Credentials Discovery Hook
 *
 * Event-driven hook for Azure Service Principal Credentials discovery operations.
 * Part of AzureHound-inspired enhancements for comprehensive Azure enumeration.
 *
 * Discovers:
 * - App registration secrets with expiry dates
 * - App registration certificates with expiry dates
 * - Expired and expiring-soon credentials
 * - Long-lived credentials (over 1 year old)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

export interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

export interface AzureServicePrincipalCredentialsDiscoveryConfig {
  timeout?: number;
}

export interface AzureServicePrincipalCredentialsDiscoveryProgress {
  percentage: number;
  message: string;
}

export const useAzureServicePrincipalCredentialsDiscoveryLogic = () => {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [progress, setProgress] = useState<AzureServicePrincipalCredentialsDiscoveryProgress>({ percentage: 0, message: '' });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);

  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const addResult = useDiscoveryStore((state) => state.addResult);

  const currentTokenRef = useRef<string | null>(null);

  const [config] = useState<AzureServicePrincipalCredentialsDiscoveryConfig>({
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
        const credentials = resultData?.ServicePrincipalCredentials || resultData?.servicePrincipalCredentials || [];
        const count = Array.isArray(credentials) ? credentials.length : 0;

        setResult({
          success: true,
          credentials: credentials,
          totalCount: count,
        });

        addResult({
          id: `azure-sp-credentials-${Date.now()}`,
          name: 'Azure Service Principal Credentials Discovery',
          moduleName: 'AzureServicePrincipalCredentials',
          displayName: 'SP Credentials',
          itemCount: count,
          discoveryTime: new Date(),
          duration: data.duration || 0,
          status: 'completed',
          filePath: '',
          createdAt: new Date(),
          success: true,
          summary: `Discovered ${count} Service Principal credentials`,
          errorMessage: '',
          additionalData: { credentials: credentials },
        });

        setLogs((prev) => [...prev, { timestamp: new Date().toISOString(), message: `Discovery completed! Found ${count} Service Principal credentials.`, level: 'success' }]);
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

    const token = `azure-sp-credentials-discovery-${Date.now()}`;
    currentTokenRef.current = token;

    setIsDiscovering(true);
    setIsCancelling(false);
    setError(null);
    setLogs([{ timestamp: new Date().toISOString(), message: 'Starting Service Principal Credentials discovery...', level: 'info' }]);
    setShowExecutionDialog(true);
    setProgress({ percentage: 0, message: 'Initializing...' });

    try {
      await window.electron?.executeDiscovery?.({
        moduleName: 'AzureSecurity',
        parameters: {
          DiscoveryType: 'ServicePrincipalCredentials',
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


