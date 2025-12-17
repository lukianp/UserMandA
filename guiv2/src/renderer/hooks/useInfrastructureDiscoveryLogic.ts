/**
 * Infrastructure Discovery Logic Hook
 * Contains all business logic for general infrastructure discovery
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

interface InfrastructureDiscoveryConfig {
  includeServers: boolean;
  includeNetworkDevices: boolean;
  includeStorageDevices: boolean;
  includeSecurityDevices: boolean;
  includeVirtualization: boolean;
  maxResults: number;
  timeout: number;
  showWindow: boolean;
}

interface InfrastructureDiscoveryResult {
  totalServers?: number;
  totalNetworkDevices?: number;
  totalStorageDevices?: number;
  totalSecurityDevices?: number;
  totalVirtualization?: number;
  totalItems?: number;
  outputPath?: string;
  servers?: any[];
  networkDevices?: any[];
  storageDevices?: any[];
  securityDevices?: any[];
  virtualization?: any[];
  statistics?: {
    physicalServers?: number;
    virtualServers?: number;
    totalStorage?: number;
    networkSegments?: number;
  };
}

interface InfrastructureDiscoveryState {
  config: InfrastructureDiscoveryConfig;
  result: InfrastructureDiscoveryResult | null;
  isDiscovering: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
}

export const useInfrastructureDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  const [state, setState] = useState<InfrastructureDiscoveryState>({
    config: {
      includeServers: true,
      includeNetworkDevices: true,
      includeStorageDevices: true,
      includeSecurityDevices: true,
      includeVirtualization: true,
      maxResults: 1000,
      timeout: 1200,
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
    console.log('[InfrastructureDiscoveryHook] Loading previous results');
    const previousResults = getResultsByModuleName('InfrastructureDiscovery');
    if (previousResults && previousResults.length > 0) {
      const latestResult = previousResults[previousResults.length - 1];
      console.log('[InfrastructureDiscoveryHook] Found previous result:', latestResult);
      setState((prev) => ({
        ...prev,
        result: latestResult.additionalData as InfrastructureDiscoveryResult,
      }));
    }
  }, [getResultsByModuleName]);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[InfrastructureDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[InfrastructureDiscoveryHook] Discovery output:', data.message);
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
        console.log('[InfrastructureDiscoveryHook] Discovery completed:', data);

        const discoveryResult = {
          id: `infrastructure-discovery-${Date.now()}`,
          name: 'Infrastructure Discovery',
          moduleName: 'InfrastructureDiscovery',
          displayName: 'Infrastructure Discovery',
          itemCount: data?.result?.totalItems || data?.result?.totalServers || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalServers || 0} servers, ${data?.result?.totalNetworkDevices || 0} network devices, ${data?.result?.totalStorageDevices || 0} storage devices`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          result: data.result as InfrastructureDiscoveryResult,
          isDiscovering: false,
          progress: {
            current: 100,
            total: 100,
            message: 'Completed',
            percentage: 100,
          },
        }));

        addResult(discoveryResult);
        console.log(`[InfrastructureDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[InfrastructureDiscoveryHook] Discovery error:', data.error);
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
        console.warn('[InfrastructureDiscoveryHook] Discovery cancelled');
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
      console.error('[InfrastructureDiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    const token = `infrastructure-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        message: 'Starting Infrastructure discovery...',
        percentage: 0,
      },
    }));

    currentTokenRef.current = token;

    console.log(`[InfrastructureDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log('[InfrastructureDiscoveryHook] Parameters:', {
      IncludeServers: state.config.includeServers,
      IncludeNetworkDevices: state.config.includeNetworkDevices,
      IncludeStorageDevices: state.config.includeStorageDevices,
      IncludeSecurityDevices: state.config.includeSecurityDevices,
      IncludeVirtualization: state.config.includeVirtualization,
      MaxResults: state.config.maxResults,
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'Infrastructure',
        parameters: {
          IncludeServers: state.config.includeServers,
          IncludeNetworkDevices: state.config.includeNetworkDevices,
          IncludeStorageDevices: state.config.includeStorageDevices,
          IncludeSecurityDevices: state.config.includeSecurityDevices,
          IncludeVirtualization: state.config.includeVirtualization,
          MaxResults: state.config.maxResults,
        },
        executionOptions: {
          timeout: state.config.timeout * 1000,
          showWindow: state.config.showWindow,
        },
        executionId: token,
      });

      console.log('[InfrastructureDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[InfrastructureDiscoveryHook] Discovery failed:', errorMessage);
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

    console.warn('[InfrastructureDiscoveryHook] Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[InfrastructureDiscoveryHook] Discovery cancellation requested successfully');

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
      console.error('[InfrastructureDiscoveryHook]', errorMessage);
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

  const updateConfig = useCallback((updates: Partial<InfrastructureDiscoveryConfig>) => {
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
