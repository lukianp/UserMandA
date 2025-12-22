/**
 * Network Infrastructure Discovery Logic Hook
 * Contains all business logic for network infrastructure discovery
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

interface NetworkInfrastructureDiscoveryConfig {
  includeRouters: boolean;
  includeSwitches: boolean;
  includeFirewalls: boolean;
  includeLoadBalancers: boolean;
  includeWirelessControllers: boolean;
  includeVLANs: boolean;
  maxResults: number;
  timeout: number;
  showWindow: boolean;
}

interface NetworkInfrastructureDiscoveryResult {
  totalRouters?: number;
  totalSwitches?: number;
  totalFirewalls?: number;
  totalLoadBalancers?: number;
  totalWirelessControllers?: number;
  totalVLANs?: number;
  totalItems?: number;
  outputPath?: string;
  routers?: any[];
  switches?: any[];
  firewalls?: any[];
  loadBalancers?: any[];
  wirelessControllers?: any[];
  vlans?: any[];
  statistics?: {
    totalPorts?: number;
    totalInterfaces?: number;
    networkSegments?: number;
    redundancyLevel?: number;
  };
}

interface NetworkInfrastructureDiscoveryState {
  config: NetworkInfrastructureDiscoveryConfig;
  result: NetworkInfrastructureDiscoveryResult | null;
  isDiscovering: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
}

export const useNetworkInfrastructureDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  const [state, setState] = useState<NetworkInfrastructureDiscoveryState>({
    config: {
      includeRouters: true,
      includeSwitches: true,
      includeFirewalls: true,
      includeLoadBalancers: true,
      includeWirelessControllers: true,
      includeVLANs: true,
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
    console.log('[NetworkInfrastructureDiscoveryHook] Loading previous results');
    const previousResults = getResultsByModuleName('NetworkInfrastructureDiscovery');
    if (previousResults && previousResults.length > 0) {
      const latestResult = previousResults[previousResults.length - 1];
      console.log('[NetworkInfrastructureDiscoveryHook] Found previous result:', latestResult);
      setState((prev) => ({
        ...prev,
        result: latestResult.additionalData as NetworkInfrastructureDiscoveryResult,
      }));
    }
  }, [getResultsByModuleName]);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[NetworkInfrastructureDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[NetworkInfrastructureDiscoveryHook] Discovery output:', data.message);
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
        console.log('[NetworkInfrastructureDiscoveryHook] Discovery completed:', data);

        const discoveryResult = {
          id: `networkinfrastructure-discovery-${Date.now()}`,
          name: 'Network Infrastructure Discovery',
          moduleName: 'NetworkInfrastructureDiscovery',
          displayName: 'Network Infrastructure Discovery',
          itemCount: data?.result?.totalItems || data?.result?.totalRouters || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalRouters || 0} routers, ${data?.result?.totalSwitches || 0} switches, ${data?.result?.totalFirewalls || 0} firewalls, ${data?.result?.totalVLANs || 0} VLANs`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          result: data.result as NetworkInfrastructureDiscoveryResult,
          isDiscovering: false,
          progress: {
            current: 100,
            total: 100,
            message: 'Completed',
            percentage: 100,
          },
        }));

        addResult(discoveryResult);
        console.log(`[NetworkInfrastructureDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[NetworkInfrastructureDiscoveryHook] Discovery error:', data.error);
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
        console.warn('[NetworkInfrastructureDiscoveryHook] Discovery cancelled');
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
  }, []); // ✅ CRITICAL: Empty dependency array for event listeners

  const startDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      const errorMessage = 'No company profile selected. Please select a profile first.';
      setState((prev) => ({ ...prev, error: errorMessage }));
      console.error('[NetworkInfrastructureDiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    const token = `networkinfrastructure-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        message: 'Starting Network Infrastructure discovery...',
        percentage: 0,
      },
    }));

    currentTokenRef.current = token;

    console.log(`[NetworkInfrastructureDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log('[NetworkInfrastructureDiscoveryHook] Parameters:', {
      IncludeRouters: state.config.includeRouters,
      IncludeSwitches: state.config.includeSwitches,
      IncludeFirewalls: state.config.includeFirewalls,
      IncludeLoadBalancers: state.config.includeLoadBalancers,
      IncludeWirelessControllers: state.config.includeWirelessControllers,
      IncludeVLANs: state.config.includeVLANs,
      MaxResults: state.config.maxResults,
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'NetworkInfrastructure',
        parameters: {
          IncludeRouters: state.config.includeRouters,
          IncludeSwitches: state.config.includeSwitches,
          IncludeFirewalls: state.config.includeFirewalls,
          IncludeLoadBalancers: state.config.includeLoadBalancers,
          IncludeWirelessControllers: state.config.includeWirelessControllers,
          IncludeVLANs: state.config.includeVLANs,
          MaxResults: state.config.maxResults,
        },
        executionOptions: {
          timeout: state.config.timeout * 1000,
          showWindow: state.config.showWindow,
        },
        executionId: token,
      });

      console.log('[NetworkInfrastructureDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[NetworkInfrastructureDiscoveryHook] Discovery failed:', errorMessage);
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

    console.warn('[NetworkInfrastructureDiscoveryHook] Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[NetworkInfrastructureDiscoveryHook] Discovery cancellation requested successfully');

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
      console.error('[NetworkInfrastructureDiscoveryHook]', errorMessage);
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

  const updateConfig = useCallback((updates: Partial<NetworkInfrastructureDiscoveryConfig>) => {
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
