/**
 * Physical Server Discovery Logic Hook
 * Contains all business logic for physical server discovery
 */

import { useState, useEffect, useCallback, useRef } from 'react';
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

interface PhysicalServerDiscoveryConfig {
  includeHardwareInfo: boolean;
  includeCPU: boolean;
  includeMemory: boolean;
  includeStorage: boolean;
  includeNetworkAdapters: boolean;
  includePowerSupplies: boolean;
  maxResults: number;
  timeout: number;
  showWindow: boolean;
}

interface PhysicalServerDiscoveryResult {
  totalServers?: number;
  totalItems?: number;
  outputPath?: string;
  servers?: any[];
  hardwareInfo?: any[];
  cpuInfo?: any[];
  memoryInfo?: any[];
  storageInfo?: any[];
  networkAdapters?: any[];
  powerSupplies?: any[];
  statistics?: {
    totalCPUCores?: number;
    totalMemoryGB?: number;
    totalStorageTB?: number;
    averageServerAge?: number;
  };
}

interface PhysicalServerDiscoveryState {
  config: PhysicalServerDiscoveryConfig;
  result: PhysicalServerDiscoveryResult | null;
  isDiscovering: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
  isCancelling: boolean;
  logs: LogEntry[];
  showExecutionDialog: boolean;
}

export const usePhysicalServerDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  const [state, setState] = useState<PhysicalServerDiscoveryState>({
    config: {
      includeHardwareInfo: true,
      includeCPU: true,
      includeMemory: true,
      includeStorage: true,
      includeNetworkAdapters: true,
      includePowerSupplies: true,
      maxResults: 1000,
      timeout: 600,
      showWindow: false,
    },
    result: null,
    isDiscovering: false,
    progress: {
      current: 0,
      total: 100,
      message: '',
      percentage: 0,
    },
    error: null,
    isCancelling: false,
    logs: [],
    showExecutionDialog: false,
  });

  // Load previous results on mount
  useEffect(() => {
    console.log('[PhysicalServerDiscoveryHook] Loading previous results');
    const previousResults = getResultsByModuleName('PhysicalServerDiscovery');
    if (previousResults && previousResults.length > 0) {
      const latestResult = previousResults[previousResults.length - 1];
      console.log('[PhysicalServerDiscoveryHook] Found previous result:', latestResult);
      setState((prev) => ({
        ...prev,
        result: latestResult.additionalData as PhysicalServerDiscoveryResult,
      }));
    }
  }, [getResultsByModuleName]);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[PhysicalServerDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[PhysicalServerDiscoveryHook] Discovery output:', data.message);
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
        setState((prev) => ({
          ...prev,
          progress: {
            ...prev.progress,
            message: data.message || '',
          },
          logs: [...prev.logs, entry],
        }));
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[PhysicalServerDiscoveryHook] Discovery completed:', data);

        const discoveryResult = {
          id: `physicalserver-discovery-${Date.now()}`,
          name: 'Physical Server Discovery',
          moduleName: 'PhysicalServerDiscovery',
          displayName: 'Physical Server Discovery',
          itemCount: data?.result?.totalItems || data?.result?.totalServers || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalServers || 0} physical servers`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        const successLog: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          level: 'success',
          message: `Discovery completed! Found ${discoveryResult.itemCount} physical servers.`,
        };

        setState((prev) => ({
          ...prev,
          result: data.result as PhysicalServerDiscoveryResult,
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
        console.log(`[PhysicalServerDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[PhysicalServerDiscoveryHook] Discovery error:', data.error);
        const errorLog: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          level: 'error',
          message: `Discovery failed: ${data.error}`,
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
        console.warn('[PhysicalServerDiscoveryHook] Discovery cancelled');
        const cancelLog: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          level: 'warning',
          message: 'Discovery cancelled by user',
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
      console.error('[PhysicalServerDiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    const token = `physicalserver-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const initialLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      message: `Starting Physical Server discovery for ${selectedSourceProfile.companyName}...`,
    };

    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        message: 'Starting Physical Server discovery...',
        percentage: 0,
      },
      logs: [initialLog],
      showExecutionDialog: true,
    }));

    currentTokenRef.current = token;

    console.log(`[PhysicalServerDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log('[PhysicalServerDiscoveryHook] Parameters:', {
      IncludeHardwareInfo: state.config.includeHardwareInfo,
      IncludeCPU: state.config.includeCPU,
      IncludeMemory: state.config.includeMemory,
      IncludeStorage: state.config.includeStorage,
      IncludeNetworkAdapters: state.config.includeNetworkAdapters,
      IncludePowerSupplies: state.config.includePowerSupplies,
      MaxResults: state.config.maxResults,
      Timeout: state.config.timeout,
      ShowWindow: state.config.showWindow,
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'PhysicalServer',
        parameters: {
          IncludeHardwareInfo: state.config.includeHardwareInfo,
          IncludeCPU: state.config.includeCPU,
          IncludeMemory: state.config.includeMemory,
          IncludeStorage: state.config.includeStorage,
          IncludeNetworkAdapters: state.config.includeNetworkAdapters,
          IncludePowerSupplies: state.config.includePowerSupplies,
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

      console.log('[PhysicalServerDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[PhysicalServerDiscoveryHook] Discovery failed:', errorMessage);
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

    console.warn('[PhysicalServerDiscoveryHook] Cancelling discovery...');

    const cancelLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level: 'warning',
      message: 'Cancelling discovery...',
    };

    setState((prev) => ({
      ...prev,
      isCancelling: true,
      logs: [...prev.logs, cancelLog],
    }));

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[PhysicalServerDiscoveryHook] Discovery cancellation requested successfully');

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
      console.error('[PhysicalServerDiscoveryHook]', errorMessage);
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

  const updateConfig = useCallback((updates: Partial<PhysicalServerDiscoveryConfig>) => {
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const clearLogs = useCallback(() => {
    setState((prev) => ({ ...prev, logs: [] }));
  }, []);

  const setShowExecutionDialog = useCallback((show: boolean) => {
    setState((prev) => ({ ...prev, showExecutionDialog: show }));
  }, []);

  return {
    config: state.config,
    result: state.result,
    isDiscovering: state.isDiscovering,
    progress: state.progress,
    error: state.error,
    isCancelling: state.isCancelling,
    logs: state.logs,
    showExecutionDialog: state.showExecutionDialog,
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    clearError,
    clearLogs,
    setShowExecutionDialog,
  };
};
