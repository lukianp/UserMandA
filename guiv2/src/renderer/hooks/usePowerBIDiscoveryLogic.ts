import { useState, useCallback, useEffect, useRef } from 'react';
import type { LogEntry } from './common/discoveryHookTypes';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

export const usePowerBIDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  // Additional state for PowerShellExecutionDialog
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);

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
   * Clear all logs
   */
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const [state, setState] = useState<{
    config: { timeout: number };
    result: any;
    isDiscovering: boolean;
    progress: { current: number; total: number; message: string; percentage: number };
    error: string | null;
  }>({
    config: { timeout: 300000 },
    result: null,
    isDiscovering: false,
    progress: { current: 0, total: 100, message: '', percentage: 0 },
    error: null,
  });

  // Load previous results
  useEffect(() => {
    const previousResults = getResultsByModuleName('PowerBIDiscovery');
    if (previousResults && previousResults.length > 0) {
      setState(prev => ({ ...prev, result: previousResults[previousResults.length - 1].additionalData }));
    }
  }, [getResultsByModuleName]);

  // Event listeners
  useEffect(() => {
    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const logLevel = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warning' : 'info';
        addLog(logLevel, data.message);
        setState(prev => ({
          ...prev,
          progress: {
            ...prev.progress,
            message: data.message
          }
        }));
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const discoveryResult = {
          id: `powerbi-discovery-${Date.now()}`,
          name: 'Power BI Discovery',
          moduleName: 'PowerBIDiscovery',
          displayName: 'Power BI Discovery',
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
        setState(prev => ({ ...prev, result: data.result, isDiscovering: false }));
        addResult(discoveryResult);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setState(prev => ({ ...prev, isDiscovering: false, error: data.error }));
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

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setState(prev => ({
          ...prev,
          isDiscovering: false,
          progress: { current: 0, total: 100, message: 'Discovery cancelled', percentage: 0 }
        }));
      }
    });

    return () => {
      unsubscribeOutput?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeProgress?.();
      unsubscribeCancelled?.();
    };
  }, [addResult, addLog]);

  const startDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      setState(prev => ({ ...prev, error: 'No profile selected' }));
      return;
    }

    const token = `powerbi-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    currentTokenRef.current = token;
    setShowExecutionDialog(true);
    setState(prev => ({ ...prev, isDiscovering: true, error: null, result: null }));

    try {
      await window.electron.executeDiscovery({
        moduleName: 'PowerBI',
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
      setIsCancelling(true);
      await window.electron.cancelDiscovery?.(currentTokenRef.current);
      setTimeout(() => {
        setState(prev => ({ ...prev, isDiscovering: false }));
        currentTokenRef.current = null;
        setIsCancelling(false);
      }, 2000);
    }
  }, []);

  return {
    ...state,
    startDiscovery,
    cancelDiscovery,
    showExecutionDialog,
    setShowExecutionDialog,
    logs,
    clearLogs,
    isCancelling
  };
};
