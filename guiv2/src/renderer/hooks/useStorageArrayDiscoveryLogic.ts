/**
 * Storage Array Discovery Logic Hook
 * Contains all business logic for storage array discovery
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

interface StorageArrayDiscoveryConfig {
  includeVolumes: boolean;
  includeLUNs: boolean;
  includeStoragePools: boolean;
  includeDisks: boolean;
  includeControllers: boolean;
  includeSnapshots: boolean;
  maxResults: number;
  timeout: number;
  showWindow: boolean;
}

interface StorageArrayDiscoveryResult {
  totalArrays?: number;
  totalVolumes?: number;
  totalItems?: number;
  outputPath?: string;
  storageArrays?: any[];
  volumes?: any[];
  luns?: any[];
  storagePools?: any[];
  disks?: any[];
  controllers?: any[];
  snapshots?: any[];
  statistics?: {
    totalCapacityTB?: number;
    usedCapacityTB?: number;
    freeCapacityTB?: number;
    utilizationPercentage?: number;
  };
}

interface StorageArrayDiscoveryState {
  config: StorageArrayDiscoveryConfig;
  result: StorageArrayDiscoveryResult | null;
  isDiscovering: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
}

export const useStorageArrayDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  const [state, setState] = useState<StorageArrayDiscoveryState>({
    config: {
      includeVolumes: true,
      includeLUNs: true,
      includeStoragePools: true,
      includeDisks: true,
      includeControllers: true,
      includeSnapshots: true,
      maxResults: 1000,
      timeout: 900,
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
    console.log('[StorageArrayDiscoveryHook] Loading previous results');
    const previousResults = getResultsByModuleName('StorageArrayDiscovery');
    if (previousResults && previousResults.length > 0) {
      const latestResult = previousResults[previousResults.length - 1];
      console.log('[StorageArrayDiscoveryHook] Found previous result:', latestResult);
      setState((prev) => ({
        ...prev,
        result: latestResult.additionalData as StorageArrayDiscoveryResult,
      }));
    }
  }, [getResultsByModuleName]);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[StorageArrayDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[StorageArrayDiscoveryHook] Discovery output:', data.message);
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
        console.log('[StorageArrayDiscoveryHook] Discovery completed:', data);

        const discoveryResult = {
          id: `storagearray-discovery-${Date.now()}`,
          name: 'Storage Array Discovery',
          moduleName: 'StorageArrayDiscovery',
          displayName: 'Storage Array Discovery',
          itemCount: data?.result?.totalItems || data?.result?.totalArrays || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalArrays || 0} storage arrays and ${data?.result?.totalVolumes || 0} volumes`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          result: data.result as StorageArrayDiscoveryResult,
          isDiscovering: false,
          progress: {
            current: 100,
            total: 100,
            message: 'Completed',
            percentage: 100,
          },
        }));

        addResult(discoveryResult);
        console.log(`[StorageArrayDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[StorageArrayDiscoveryHook] Discovery error:', data.error);
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
        console.warn('[StorageArrayDiscoveryHook] Discovery cancelled');
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
      console.error('[StorageArrayDiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    const token = `storagearray-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        message: 'Starting Storage Array discovery...',
        percentage: 0,
      },
    }));

    currentTokenRef.current = token;

    console.log(`[StorageArrayDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log('[StorageArrayDiscoveryHook] Parameters:', {
      IncludeVolumes: state.config.includeVolumes,
      IncludeLUNs: state.config.includeLUNs,
      IncludeStoragePools: state.config.includeStoragePools,
      IncludeDisks: state.config.includeDisks,
      IncludeControllers: state.config.includeControllers,
      IncludeSnapshots: state.config.includeSnapshots,
      MaxResults: state.config.maxResults,
      Timeout: state.config.timeout,
      ShowWindow: state.config.showWindow,
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'StorageArray',
        parameters: {
          IncludeVolumes: state.config.includeVolumes,
          IncludeLUNs: state.config.includeLUNs,
          IncludeStoragePools: state.config.includeStoragePools,
          IncludeDisks: state.config.includeDisks,
          IncludeControllers: state.config.includeControllers,
          IncludeSnapshots: state.config.includeSnapshots,
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

      console.log('[StorageArrayDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[StorageArrayDiscoveryHook] Discovery failed:', errorMessage);
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

    console.warn('[StorageArrayDiscoveryHook] Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[StorageArrayDiscoveryHook] Discovery cancellation requested successfully');

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
      console.error('[StorageArrayDiscoveryHook]', errorMessage);
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

  const updateConfig = useCallback((updates: Partial<StorageArrayDiscoveryConfig>) => {
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
