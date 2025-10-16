/**
 * Generic Discovery Execution Hook
 *
 * Provides real-time PowerShell module execution with streaming logs,
 * progress tracking, and cancellation support.
 *
 * Features:
 * - Real-time log streaming (6 PowerShell stream types)
 * - Progress tracking with ETA calculation
 * - Execution cancellation
 * - Auto-retry on transient failures
 * - Comprehensive error handling
 *
 * Usage:
 * ```typescript
 * const {
 *   isExecuting,
 *   logLines,
 *   progress,
 *   result,
 *   execute,
 *   cancel
 * } = useDiscoveryExecution({
 *   moduleName: 'Modules/Discovery/Get-IntuneDevices.psm1',
 *   moduleDisplayName: 'Intune Device Discovery',
 *   parameters: { TenantId: selectedProfile.tenantId },
 *   onComplete: (data) => setDevices(data.devices || []),
 *   onError: (err) => showWarning('Discovery failed')
 * });
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ==================== Type Definitions ====================

export interface LogLine {
  timestamp: Date;
  level: 'output' | 'error' | 'warning' | 'verbose' | 'debug' | 'information';
  message: string;
  source: string;
}

export interface ProgressData {
  percentage: number;
  message: string;
  currentItem: string;
  itemsProcessed?: number;
  totalItems?: number;
  estimatedTimeRemaining?: number; // in milliseconds
}

export interface DiscoveryExecutionState {
  isExecuting: boolean;
  isCompleted: boolean;
  isCancelling: boolean;
  hasError: boolean;
  executionId: string | null;
  logLines: LogLine[];
  progress: ProgressData;
  result: any | null;
  error: string | null;
  startTime: Date | null;
  endTime: Date | null;
}

export interface UseDiscoveryExecutionOptions {
  moduleName: string;
  moduleDisplayName: string;
  parameters?: Record<string, any>;
  autoExecute?: boolean;
  onComplete?: (result: any) => void;
  onError?: (error: Error) => void;
  maxLogLines?: number; // Default: 5000
  enableAutoRetry?: boolean; // Default: true
  maxRetries?: number; // Default: 3
}

export interface UseDiscoveryExecutionReturn {
  // State
  isExecuting: boolean;
  isCompleted: boolean;
  isCancelling: boolean;
  hasError: boolean;
  logLines: LogLine[];
  progress: ProgressData;
  result: any | null;
  error: string | null;
  duration: number | null; // in milliseconds

  // Actions
  execute: (params?: Record<string, any>) => Promise<void>;
  cancel: () => void;
  retry: () => Promise<void>;
  clearLogs: () => void;
  reset: () => void;

  // Computed
  canExecute: boolean;
}

// ==================== Hook Implementation ====================

export const useDiscoveryExecution = (
  options: UseDiscoveryExecutionOptions
): UseDiscoveryExecutionReturn => {
  const {
    moduleName,
    moduleDisplayName,
    parameters = {},
    autoExecute = false,
    onComplete,
    onError,
    maxLogLines = 5000,
    enableAutoRetry = true,
    maxRetries = 3,
  } = options;

  // State
  const [state, setState] = useState<DiscoveryExecutionState>({
    isExecuting: false,
    isCompleted: false,
    isCancelling: false,
    hasError: false,
    executionId: null,
    logLines: [],
    progress: {
      percentage: 0,
      message: 'Waiting to start...',
      currentItem: '',
    },
    result: null,
    error: null,
    startTime: null,
    endTime: null,
  });

  // Refs for cleanup
  const cleanupFunctions = useRef<Array<() => void>>([]);
  const retryCount = useRef(0);
  const lastParameters = useRef<Record<string, any>>(parameters);

  // ==================== Event Handlers ====================

  /**
   * Handle streaming output from PowerShell
   */
  const handleOutput = useCallback((data: any) => {
    if (data.executionId !== state.executionId) return;

    const logLine: LogLine = {
      timestamp: new Date(data.timestamp),
      level: data.type || 'output',
      message: data.data,
      source: moduleDisplayName,
    };

    setState(prev => {
      let newLogLines = [...prev.logLines, logLine];

      // Enforce max log lines (keep most recent)
      if (newLogLines.length > maxLogLines) {
        newLogLines = newLogLines.slice(newLogLines.length - maxLogLines);
      }

      return {
        ...prev,
        logLines: newLogLines,
      };
    });
  }, [state.executionId, moduleDisplayName, maxLogLines]);

  /**
   * Handle progress updates from PowerShell
   */
  const handleProgress = useCallback((data: any) => {
    if (data.executionId !== state.executionId) return;

    setState(prev => ({
      ...prev,
      progress: {
        percentage: data.percentage || 0,
        message: data.message || '',
        currentItem: data.currentItem || '',
        itemsProcessed: data.itemsProcessed,
        totalItems: data.totalItems,
        estimatedTimeRemaining: data.estimatedTimeRemaining,
      },
    }));
  }, [state.executionId]);

  /**
   * Handle execution completion
   */
  const handleComplete = useCallback((data: any) => {
    if (data.executionId !== state.executionId) return;

    const endTime = new Date();

    setState(prev => ({
      ...prev,
      isExecuting: false,
      isCompleted: true,
      endTime,
      progress: {
        ...prev.progress,
        percentage: 100,
        message: data.result.success ? 'Completed successfully' : 'Failed',
      },
    }));

    if (data.result.success) {
      setState(prev => ({ ...prev, result: data.result.data }));
      if (onComplete) {
        onComplete(data.result.data);
      }
      retryCount.current = 0; // Reset retry count on success
    } else {
      const errorMessage = data.result.error || 'Unknown error';
      setState(prev => ({
        ...prev,
        hasError: true,
        error: errorMessage,
      }));

      // Check if we should retry
      if (enableAutoRetry && retryCount.current < maxRetries && isTransientError(errorMessage)) {
        console.warn(`Discovery failed with transient error. Retrying (${retryCount.current + 1}/${maxRetries})...`);
        retryCount.current++;
        setTimeout(() => {
          executeInternal(lastParameters.current, true);
        }, Math.pow(2, retryCount.current) * 1000); // Exponential backoff
      } else {
        if (onError) {
          onError(new Error(errorMessage));
        }
      }
    }
  }, [state.executionId, onComplete, onError, enableAutoRetry, maxRetries]);

  /**
   * Check if error is transient (should retry)
   */
  const isTransientError = (errorMessage: string): boolean => {
    const transientPatterns = [
      /timeout/i,
      /connection/i,
      /network/i,
      /temporarily unavailable/i,
      /too many requests/i,
      /service unavailable/i,
      /throttl/i,
    ];

    return transientPatterns.some(pattern => pattern.test(errorMessage));
  };

  // ==================== Setup Event Listeners ====================

  useEffect(() => {
    if (!state.executionId) return;

    // Listen for output streams (using real IPC)
    const cleanupOutput = window.electronAPI.onDiscoveryOutput((data: any) => {
      handleOutput(data);
    });
    cleanupFunctions.current.push(cleanupOutput);

    // Listen for progress updates
    const cleanupProgress = window.electronAPI.onDiscoveryProgress((data: any) => {
      handleProgress(data);
    });
    cleanupFunctions.current.push(cleanupProgress);

    // Listen for completion
    const cleanupComplete = window.electronAPI.onDiscoveryComplete((data: any) => {
      handleComplete(data);
    });
    cleanupFunctions.current.push(cleanupComplete);

    // Listen for errors
    const cleanupError = window.electronAPI.onDiscoveryError((data: any) => {
      if (data.executionId !== state.executionId) return;

      setState(prev => ({
        ...prev,
        isExecuting: false,
        hasError: true,
        error: data.error,
        endTime: new Date(),
      }));

      if (onError) {
        onError(new Error(data.error));
      }
    });
    cleanupFunctions.current.push(cleanupError);

    // Listen for cancellation
    const cleanupCancelled = window.electronAPI.onDiscoveryCancelled((data: any) => {
      if (data.executionId !== state.executionId) return;

      setState(prev => ({
        ...prev,
        isExecuting: false,
        isCancelling: false,
        executionId: null,
        endTime: new Date(),
        progress: {
          ...prev.progress,
          message: 'Cancelled by user',
        },
      }));

      const cancelLog: LogLine = {
        timestamp: new Date(),
        level: 'warning',
        message: 'Discovery execution cancelled',
        source: moduleDisplayName,
      };

      setState(prev => ({
        ...prev,
        logLines: [...prev.logLines, cancelLog],
      }));
    });
    cleanupFunctions.current.push(cleanupCancelled);

    // Cleanup on unmount or executionId change
    return () => {
      cleanupFunctions.current.forEach(cleanup => cleanup());
      cleanupFunctions.current = [];
    };
  }, [state.executionId, handleOutput, handleProgress, handleComplete, onError, moduleDisplayName]);

  // ==================== Actions ====================

  /**
   * Internal execute function (supports retry)
   */
  const executeInternal = useCallback(async (params: Record<string, any>, isRetry: boolean = false) => {
    try {
      // Don't start if already executing
      if (state.isExecuting && !isRetry) {
        console.warn('Discovery already executing. Ignoring duplicate request.');
        return;
      }

      // Generate execution ID on renderer side
      const executionId = crypto.randomUUID();
      const startTime = new Date();

      setState(prev => ({
        ...prev,
        isExecuting: true,
        isCompleted: false,
        isCancelling: false,
        hasError: false,
        executionId,
        logLines: isRetry ? prev.logLines : [], // Keep logs on retry
        progress: {
          percentage: 0,
          message: isRetry ? 'Retrying discovery...' : 'Initializing discovery...',
          currentItem: '',
        },
        result: null,
        error: null,
        startTime,
        endTime: null,
      }));

      lastParameters.current = params;

      // Add initial log
      const initialLog: LogLine = {
        timestamp: startTime,
        level: 'information',
        message: isRetry
          ? `Retrying ${moduleDisplayName} (attempt ${retryCount.current + 1}/${maxRetries})...`
          : `Starting ${moduleDisplayName}...`,
        source: moduleDisplayName,
      };

      setState(prev => ({
        ...prev,
        logLines: [...prev.logLines, initialLog],
      }));

      // Invoke IPC handler (using real electronAPI)
      const response = await window.electronAPI.executeDiscovery({
        moduleName,
        parameters: params,
        executionId,
      });

      if (!response?.success) {
        throw new Error(response?.error || 'Failed to start discovery execution');
      }

      // Execution started successfully
      // Results will come via 'discovery:complete' event
    } catch (err: any) {
      console.error('Failed to execute discovery:', err);

      setState(prev => ({
        ...prev,
        isExecuting: false,
        hasError: true,
        error: err.message,
        endTime: new Date(),
      }));

      if (onError) {
        onError(err);
      }
    }
  }, [moduleName, moduleDisplayName, state.isExecuting, onError, maxRetries]);

  /**
   * Execute discovery module
   */
  const execute = useCallback(async (params?: Record<string, any>) => {
    const finalParams = { ...parameters, ...params };
    retryCount.current = 0; // Reset retry count
    await executeInternal(finalParams, false);
  }, [parameters, executeInternal]);

  /**
   * Cancel execution
   */
  const cancel = useCallback(() => {
    if (!state.executionId) {
      console.warn('No active execution to cancel');
      return;
    }

    setState(prev => ({ ...prev, isCancelling: true }));

    // Use real IPC call
    window.electronAPI.cancelDiscovery(state.executionId).then((response: any) => {
      if (response?.success) {
        // Cancellation event will be handled by the listener
        console.log(`Cancellation request sent for execution: ${state.executionId}`);
      } else {
        console.error('Failed to cancel execution:', response?.error);
        setState(prev => ({ ...prev, isCancelling: false }));

        // Add error log
        const errorLog: LogLine = {
          timestamp: new Date(),
          level: 'error',
          message: `Failed to cancel: ${response?.error}`,
          source: moduleDisplayName,
        };

        setState(prev => ({
          ...prev,
          logLines: [...prev.logLines, errorLog],
        }));
      }
    }).catch((err: Error) => {
      console.error('Error cancelling discovery:', err);
      setState(prev => ({ ...prev, isCancelling: false }));
    });
  }, [state.executionId, moduleDisplayName]);

  /**
   * Retry last execution
   */
  const retry = useCallback(async () => {
    retryCount.current = 0; // Reset retry count
    await executeInternal(lastParameters.current, false);
  }, [executeInternal]);

  /**
   * Clear all logs
   */
  const clearLogs = useCallback(() => {
    setState(prev => ({
      ...prev,
      logLines: [],
    }));
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setState({
      isExecuting: false,
      isCompleted: false,
      isCancelling: false,
      hasError: false,
      executionId: null,
      logLines: [],
      progress: {
        percentage: 0,
        message: 'Waiting to start...',
        currentItem: '',
      },
      result: null,
      error: null,
      startTime: null,
      endTime: null,
    });
    retryCount.current = 0;
  }, []);

  // ==================== Auto-execute ====================

  useEffect(() => {
    if (autoExecute) {
      execute();
    }
  }, [autoExecute]); // eslint-disable-line react-hooks/exhaustive-deps

  // ==================== Computed Values ====================

  const duration = state.startTime && state.endTime
    ? state.endTime.getTime() - state.startTime.getTime()
    : state.startTime
    ? Date.now() - state.startTime.getTime()
    : null;

  const canExecute = !state.isExecuting && !state.isCancelling;

  // ==================== Return ====================

  return {
    // State
    isExecuting: state.isExecuting,
    isCompleted: state.isCompleted,
    isCancelling: state.isCancelling,
    hasError: state.hasError,
    logLines: state.logLines,
    progress: state.progress,
    result: state.result,
    error: state.error,
    duration,

    // Actions
    execute,
    cancel,
    retry,
    clearLogs,
    reset,

    // Computed
    canExecute,
  };
};

export default useDiscoveryExecution;
