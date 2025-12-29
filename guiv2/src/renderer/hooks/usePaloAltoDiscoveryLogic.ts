import { useState, useCallback, useEffect, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

/**
 * Log entry interface for PowerShell execution dialog
 */
export interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

export const usePaloAltoDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  const [state, setState] = useState<{
    config: { timeout: number };
    result: any;
    isDiscovering: boolean;
    progress: { current: number; total: number; message: string; percentage: number };
    error: string | null;
    isCancelling: boolean;
    logs: LogEntry[];
    showExecutionDialog: boolean;
  }>({
    config: { timeout: 300000 },
    result: null,
    isDiscovering: false,
    progress: { current: 0, total: 100, message: '', percentage: 0 },
    error: null,
    isCancelling: false,
    logs: [],
    showExecutionDialog: false,
  });

  // Load previous results
  useEffect(() => {
    const previousResults = getResultsByModuleName('PaloAltoDiscovery');
    if (previousResults && previousResults.length > 0) {
      setState(prev => ({ ...prev, result: previousResults[previousResults.length - 1].additionalData }));
    }
  }, [getResultsByModuleName]);

  // Helper function to add log entries
  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
    };
    setState(prev => ({ ...prev, logs: [...prev.logs, entry] }));
  }, []);

  // Event listeners
  useEffect(() => {
    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        // Detect log level from message content
        let level: LogEntry['level'] = 'info';
        const msgLower = (data.message || '').toLowerCase();
        if (msgLower.includes('error') || msgLower.includes('failed')) {
          level = 'error';
        } else if (msgLower.includes('warning') || msgLower.includes('warn')) {
          level = 'warning';
        } else if (msgLower.includes('success') || msgLower.includes('complete')) {
          level = 'success';
        }
        const entry: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          level,
          message: data.message || '',
        };
        setState(prev => ({ ...prev, logs: [...prev.logs, entry] }));
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const discoveryResult = {
          id: `paloalto-discovery-${Date.now()}`,
          name: 'Palo Alto Discovery',
          moduleName: 'PaloAltoDiscovery',
          displayName: 'Palo Alto Discovery',
          itemCount: data?.result?.totalItems || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalItems || 0} items`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };
        const successLog: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          level: 'success',
          message: `Discovery completed! Found ${data?.result?.totalItems || 0} items.`,
        };
        setState(prev => ({
          ...prev,
          result: data.result,
          isDiscovering: false,
          isCancelling: false,
          logs: [...prev.logs, successLog],
        }));
        addResult(discoveryResult);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const errorLog: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          level: 'error',
          message: `Discovery failed: ${data.error}`,
        };
        setState(prev => ({
          ...prev,
          isDiscovering: false,
          isCancelling: false,
          error: data.error,
          logs: [...prev.logs, errorLog],
        }));
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const cancelLog: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          level: 'warning',
          message: 'Discovery cancelled by user',
        };
        setState(prev => ({
          ...prev,
          isDiscovering: false,
          isCancelling: false,
          logs: [...prev.logs, cancelLog],
        }));
      }
    });

    const unsubscribeProgress = window.electron?.onDiscoveryProgress?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setState(prev => ({
          ...prev,
          progress: {
            current: data.itemsProcessed || 0,
            total: data.totalItems || 100,
            message: data.currentPhase || '',
            percentage: data.percentage || 0,
          },
        }));
      }
    });

    return () => {
      unsubscribeOutput?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeCancelled?.();
      unsubscribeProgress?.();
    };
  }, []); // ✅ CRITICAL: Empty dependency array for event listeners

  const startDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      setState(prev => ({ ...prev, error: 'No profile selected' }));
      return;
    }

    const token = `paloalto-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    currentTokenRef.current = token;

    const initialLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      message: `Starting Palo Alto discovery for ${selectedSourceProfile.companyName}...`,
    };

    setState(prev => ({
      ...prev,
      isDiscovering: true,
      error: null,
      result: null,
      logs: [initialLog],
      showExecutionDialog: true,
    }));

    try {
      await window.electron.executeDiscovery({
        moduleName: 'PaloAlto',
        parameters: {},
        executionOptions: { timeout: 300000, showWindow: false },
        executionId: token,
      });
    } catch (error: any) {
      setState(prev => ({ ...prev, isDiscovering: false, error: error.message }));
    }
  }, [selectedSourceProfile]);

  const cancelDiscovery = useCallback(async () => {
    if (currentTokenRef.current) {
      const cancelLog: LogEntry = {
        timestamp: new Date().toLocaleTimeString(),
        level: 'warning',
        message: 'Cancelling discovery...',
      };
      setState(prev => ({
        ...prev,
        isCancelling: true,
        logs: [...prev.logs, cancelLog],
      }));
      await window.electron.cancelDiscovery?.(currentTokenRef.current);
      currentTokenRef.current = null;
    }
  }, []);

  const clearLogs = useCallback(() => {
    setState(prev => ({ ...prev, logs: [] }));
  }, []);

  const setShowExecutionDialog = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showExecutionDialog: show }));
  }, []);

  return {
    ...state,
    startDiscovery,
    cancelDiscovery,
    clearLogs,
    setShowExecutionDialog,
  };
};
