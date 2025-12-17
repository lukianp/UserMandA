/**
 * Scheduled Task Discovery Logic Hook
 * Contains all business logic for scheduled task discovery
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

interface ScheduledTaskDiscoveryConfig {
  includeTasks: boolean;
  includeTaskHistory: boolean;
  includeTaskTriggers: boolean;
  includeTaskActions: boolean;
  includeDisabledTasks: boolean;
  maxResults: number;
  timeout: number;
  showWindow: boolean;
}

interface ScheduledTaskDiscoveryResult {
  totalTasks?: number;
  totalEnabledTasks?: number;
  totalItems?: number;
  outputPath?: string;
  tasks?: any[];
  taskHistory?: any[];
  taskTriggers?: any[];
  taskActions?: any[];
  statistics?: {
    activeTasks?: number;
    disabledTasks?: number;
    failedTasks?: number;
    averageTasksPerDay?: number;
  };
}

interface ScheduledTaskDiscoveryState {
  config: ScheduledTaskDiscoveryConfig;
  result: ScheduledTaskDiscoveryResult | null;
  isDiscovering: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
}

export const useScheduledTaskDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  const [state, setState] = useState<ScheduledTaskDiscoveryState>({
    config: {
      includeTasks: true,
      includeTaskHistory: true,
      includeTaskTriggers: true,
      includeTaskActions: true,
      includeDisabledTasks: false,
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
  });

  // Load previous results on mount
  useEffect(() => {
    console.log('[ScheduledTaskDiscoveryHook] Loading previous results');
    const previousResults = getResultsByModuleName('ScheduledTaskDiscovery');
    if (previousResults && previousResults.length > 0) {
      const latestResult = previousResults[previousResults.length - 1];
      console.log('[ScheduledTaskDiscoveryHook] Found previous result:', latestResult);
      setState((prev) => ({
        ...prev,
        result: latestResult.additionalData as ScheduledTaskDiscoveryResult,
      }));
    }
  }, [getResultsByModuleName]);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[ScheduledTaskDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[ScheduledTaskDiscoveryHook] Discovery output:', data.message);
        setState((prev) => ({
          ...prev,
          progress: {
            ...prev.progress,
            message: data.message || '',
          },
        }));
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[ScheduledTaskDiscoveryHook] Discovery completed:', data);

        const discoveryResult = {
          id: `scheduledtask-discovery-${Date.now()}`,
          name: 'Scheduled Task Discovery',
          moduleName: 'ScheduledTaskDiscovery',
          displayName: 'Scheduled Task Discovery',
          itemCount: data?.result?.totalItems || data?.result?.totalTasks || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalTasks || 0} scheduled tasks (${data?.result?.totalEnabledTasks || 0} enabled)`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          result: data.result as ScheduledTaskDiscoveryResult,
          isDiscovering: false,
          progress: {
            current: 100,
            total: 100,
            message: 'Completed',
            percentage: 100,
          },
        }));

        addResult(discoveryResult);
        console.log(`[ScheduledTaskDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[ScheduledTaskDiscoveryHook] Discovery error:', data.error);
        setState((prev) => ({
          ...prev,
          isDiscovering: false,
          error: data.error,
          progress: {
            current: 0,
            total: 100,
            message: '',
            percentage: 0,
          },
        }));
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.warn('[ScheduledTaskDiscoveryHook] Discovery cancelled');
        setState((prev) => ({
          ...prev,
          isDiscovering: false,
          progress: {
            current: 0,
            total: 100,
            message: 'Discovery cancelled',
            percentage: 0,
          },
        }));
      }
    });

    return () => {
      unsubscribeOutput?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeCancelled?.();
    };
  }, [addResult]);

  const startDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      const errorMessage = 'No company profile selected. Please select a profile first.';
      setState((prev) => ({ ...prev, error: errorMessage }));
      console.error('[ScheduledTaskDiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    const token = `scheduledtask-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        message: 'Starting Scheduled Task discovery...',
        percentage: 0,
      },
    }));

    currentTokenRef.current = token;

    console.log(`[ScheduledTaskDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log('[ScheduledTaskDiscoveryHook] Parameters:', {
      IncludeTasks: state.config.includeTasks,
      IncludeTaskHistory: state.config.includeTaskHistory,
      IncludeTaskTriggers: state.config.includeTaskTriggers,
      IncludeTaskActions: state.config.includeTaskActions,
      IncludeDisabledTasks: state.config.includeDisabledTasks,
      MaxResults: state.config.maxResults,
      Timeout: state.config.timeout,
      ShowWindow: state.config.showWindow,
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'ScheduledTask',
        parameters: {
          IncludeTasks: state.config.includeTasks,
          IncludeTaskHistory: state.config.includeTaskHistory,
          IncludeTaskTriggers: state.config.includeTaskTriggers,
          IncludeTaskActions: state.config.includeTaskActions,
          IncludeDisabledTasks: state.config.includeDisabledTasks,
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

      console.log('[ScheduledTaskDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[ScheduledTaskDiscoveryHook] Discovery failed:', errorMessage);
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

    console.warn('[ScheduledTaskDiscoveryHook] Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[ScheduledTaskDiscoveryHook] Discovery cancellation requested successfully');

      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isDiscovering: false,
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
      console.error('[ScheduledTaskDiscoveryHook]', errorMessage);
      setState((prev) => ({
        ...prev,
        isDiscovering: false,
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

  const updateConfig = useCallback((updates: Partial<ScheduledTaskDiscoveryConfig>) => {
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    config: state.config,
    result: state.result,
    isDiscovering: state.isDiscovering,
    progress: state.progress,
    error: state.error,
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    clearError,
  };
};
