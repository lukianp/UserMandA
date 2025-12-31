/**
 * Virtualization Discovery Logic Hook
 * Contains all business logic for virtualization infrastructure discovery
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

/**
 * Log Entry Interface for PowerShellExecutionDialog
 */
export interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

interface VirtualizationDiscoveryConfig {
  includeHosts: boolean;
  includeVMs: boolean;
  includeDatastores: boolean;
  includeNetworks: boolean;
  includeResourcePools: boolean;
  includeClusters: boolean;
  maxResults: number;
  timeout: number;
  showWindow: boolean;
}

interface VirtualizationDiscoveryResult {
  totalHosts?: number;
  totalVMs?: number;
  totalDatastores?: number;
  totalNetworks?: number;
  totalResourcePools?: number;
  totalClusters?: number;
  totalItems?: number;
  outputPath?: string;
  hosts?: any[];
  virtualMachines?: any[];
  datastores?: any[];
  networks?: any[];
  resourcePools?: any[];
  clusters?: any[];
  statistics?: {
    totalCPUCores?: number;
    totalMemoryGB?: number;
    totalStorageTB?: number;
    runningVMs?: number;
    stoppedVMs?: number;
    averageVMsPerHost?: number;
  };
}

interface VirtualizationDiscoveryState {
  config: VirtualizationDiscoveryConfig;
  result: VirtualizationDiscoveryResult | null;
  isDiscovering: boolean;
  isCancelling: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
  logs: LogEntry[];
  showExecutionDialog: boolean;
}

export const useVirtualizationDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  const [state, setState] = useState<VirtualizationDiscoveryState>({
    config: {
      includeHosts: true,
      includeVMs: true,
      includeDatastores: true,
      includeNetworks: true,
      includeResourcePools: true,
      includeClusters: true,
      maxResults: 10000,
      timeout: 1200,
      showWindow: false,
    },
    result: null,
    isDiscovering: false,
    isCancelling: false,
    progress: {
      current: 0,
      total: 100,
      message: '',
      percentage: 0,
    },
    error: null,
    logs: [],
    showExecutionDialog: false,
  });

  // Load previous results on mount
  useEffect(() => {
    console.log('[VirtualizationDiscoveryHook] Loading previous results');
    const previousResults = getResultsByModuleName('VirtualizationDiscovery');
    if (previousResults && previousResults.length > 0) {
      const latestResult = previousResults[previousResults.length - 1];
      console.log('[VirtualizationDiscoveryHook] Found previous result:', latestResult);
      setState((prev) => ({
        ...prev,
        result: latestResult.additionalData as VirtualizationDiscoveryResult,
      }));
    }
  }, [getResultsByModuleName]);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[VirtualizationDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[VirtualizationDiscoveryHook] Discovery output:', data.message);
        const logLevel: LogEntry['level'] = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warning' : 'info';
        const logEntry: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          message: data.message || '',
          level: logLevel,
        };
        setState((prev) => ({
          ...prev,
          logs: [...prev.logs, logEntry],
          progress: {
            ...prev.progress,
            message: data.message || '',
          },
        }));
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[VirtualizationDiscoveryHook] Discovery completed:', data);

        const discoveryResult = {
          id: `virtualization-discovery-${Date.now()}`,
          name: 'Virtualization Discovery',
          moduleName: 'VirtualizationDiscovery',
          displayName: 'Virtualization Discovery',
          itemCount: data?.result?.totalItems || data?.result?.totalVMs || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalHosts || 0} hosts, ${data?.result?.totalVMs || 0} VMs, and ${data?.result?.totalDatastores || 0} datastores`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        const successLog: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          message: `Discovery completed! Found ${discoveryResult.itemCount} items.`,
          level: 'success',
        };
        setState((prev) => ({
          ...prev,
          result: data.result as VirtualizationDiscoveryResult,
          isDiscovering: false,
          isCancelling: false,
          progress: {
            current: 100,
            total: 100,
            message: 'Completed',
            percentage: 100,
          },
          logs: [...prev.logs, successLog],
        }));

        addResult(discoveryResult);
        console.log(`[VirtualizationDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[VirtualizationDiscoveryHook] Discovery error:', data.error);
        const errorLog: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          message: `Discovery failed: ${data.error}`,
          level: 'error',
        };
        setState((prev) => ({
          ...prev,
          isDiscovering: false,
          isCancelling: false,
          error: data.error,
          progress: {
            current: 0,
            total: 100,
            message: '',
            percentage: 0,
          },
          logs: [...prev.logs, errorLog],
        }));
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.warn('[VirtualizationDiscoveryHook] Discovery cancelled');
        const cancelLog: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          message: 'Discovery cancelled by user',
          level: 'warning',
        };
        setState((prev) => ({
          ...prev,
          isDiscovering: false,
          isCancelling: false,
          progress: {
            current: 0,
            total: 100,
            message: 'Discovery cancelled',
            percentage: 0,
          },
          logs: [...prev.logs, cancelLog],
        }));
      }
    });

    return () => {
      unsubscribeOutput?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeCancelled?.();
    };
  }, []); // ✅ CRITICAL: Empty dependency array for event listeners

  const startDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      const errorMessage = 'No company profile selected. Please select a profile first.';
      setState((prev) => ({ ...prev, error: errorMessage }));
      console.error('[VirtualizationDiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    const token = `virtualization-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    currentTokenRef.current = token;

    const initialLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      message: `Starting Virtualization discovery for ${selectedSourceProfile.companyName}...`,
      level: 'info',
    };
    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        message: 'Starting Virtualization discovery...',
        percentage: 0,
      },
      logs: [initialLog],
      showExecutionDialog: true,
    }));

    console.log(`[VirtualizationDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log('[VirtualizationDiscoveryHook] Parameters:', {
      IncludeHosts: state.config.includeHosts,
      IncludeVMs: state.config.includeVMs,
      IncludeDatastores: state.config.includeDatastores,
      IncludeNetworks: state.config.includeNetworks,
      IncludeResourcePools: state.config.includeResourcePools,
      IncludeClusters: state.config.includeClusters,
      MaxResults: state.config.maxResults,
      Timeout: state.config.timeout,
      ShowWindow: state.config.showWindow,
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'Virtualization',
        parameters: {
          IncludeHosts: state.config.includeHosts,
          IncludeVMs: state.config.includeVMs,
          IncludeDatastores: state.config.includeDatastores,
          IncludeNetworks: state.config.includeNetworks,
          IncludeResourcePools: state.config.includeResourcePools,
          IncludeClusters: state.config.includeClusters,
          MaxResults: state.config.maxResults,
          Timeout: state.config.timeout,
          ShowWindow: state.config.showWindow,
        },
        executionOptions: {
          timeout: state.config.timeout * 1000, // Convert seconds to milliseconds
          showWindow: state.config.showWindow,
        },
        executionId: token,
      });

      console.log('[VirtualizationDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[VirtualizationDiscoveryHook] Discovery failed:', errorMessage);
      setState((prev) => ({
        ...prev,
        isDiscovering: false,
        error: errorMessage,
        progress: {
          current: 0,
          total: 100,
          message: '',
          percentage: 0,
        },
      }));
      currentTokenRef.current = null;
    }
  }, [selectedSourceProfile, state.config, state.isDiscovering]);

  const cancelDiscovery = useCallback(async () => {
    if (!state.isDiscovering || !currentTokenRef.current) return;

    const cancelLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      message: 'Cancelling discovery...',
      level: 'warning',
    };
    setState((prev) => ({
      ...prev,
      isCancelling: true,
      logs: [...prev.logs, cancelLog],
    }));

    console.warn('[VirtualizationDiscoveryHook] Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[VirtualizationDiscoveryHook] Discovery cancellation requested successfully');

      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isDiscovering: false,
          isCancelling: false,
          progress: {
            current: 0,
            total: 100,
            message: 'Discovery cancelled',
            percentage: 0,
          },
        }));
        currentTokenRef.current = null;
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'Error cancelling discovery';
      console.error('[VirtualizationDiscoveryHook]', errorMessage);
      setState((prev) => ({
        ...prev,
        isDiscovering: false,
        isCancelling: false,
        progress: {
          current: 0,
          total: 100,
          message: '',
          percentage: 0,
        },
      }));
      currentTokenRef.current = null;
    }
  }, [state.isDiscovering]);

  const updateConfig = useCallback((updates: Partial<VirtualizationDiscoveryConfig>) => {
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Clear all logs
   */
  const clearLogs = useCallback(() => {
    setState((prev) => ({ ...prev, logs: [] }));
  }, []);

  /**
   * Set show execution dialog
   */
  const setShowExecutionDialog = useCallback((show: boolean) => {
    setState((prev) => ({ ...prev, showExecutionDialog: show }));
  }, []);

  return {
    config: state.config,
    result: state.result,
    isDiscovering: state.isDiscovering,
    isCancelling: state.isCancelling,
    progress: state.progress,
    error: state.error,
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    clearError,
    // PowerShellExecutionDialog state
    logs: state.logs,
    showExecutionDialog: state.showExecutionDialog,
    setShowExecutionDialog,
    clearLogs,
  };
};


