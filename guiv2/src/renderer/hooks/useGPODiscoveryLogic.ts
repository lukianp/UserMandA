/**
 * GPO Discovery Logic Hook
 * Contains all business logic for Group Policy Object discovery
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

interface GPODiscoveryConfig {
  includeGPOs: boolean;
  includeGPOLinks: boolean;
  includeGPOSettings: boolean;
  includeGPOFilters: boolean;
  includeWMIFilters: boolean;
  maxResults: number;
  timeout: number;
  showWindow: boolean;
}

interface GPODiscoveryResult {
  totalGPOs?: number;
  totalGPOLinks?: number;
  totalWMIFilters?: number;
  totalItems?: number;
  outputPath?: string;
  gpos?: any[];
  gpoLinks?: any[];
  gpoSettings?: any[];
  gpoFilters?: any[];
  wmiFilters?: any[];
  statistics?: {
    totalPolicies?: number;
    enabledGPOs?: number;
    disabledGPOs?: number;
    linkedGPOs?: number;
  };
}

interface GPODiscoveryState {
  config: GPODiscoveryConfig;
  result: GPODiscoveryResult | null;
  isDiscovering: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
}

export const useGPODiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  const [state, setState] = useState<GPODiscoveryState>({
    config: {
      includeGPOs: true,
      includeGPOLinks: true,
      includeGPOSettings: true,
      includeGPOFilters: true,
      includeWMIFilters: true,
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
    console.log('[GPODiscoveryHook] Loading previous results');
    const previousResults = getResultsByModuleName('GPODiscovery');
    if (previousResults && previousResults.length > 0) {
      const latestResult = previousResults[previousResults.length - 1];
      console.log('[GPODiscoveryHook] Found previous result:', latestResult);
      setState((prev) => ({
        ...prev,
        result: latestResult.additionalData as GPODiscoveryResult,
      }));
    }
  }, [getResultsByModuleName]);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[GPODiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[GPODiscoveryHook] Discovery output:', data.message);
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
        console.log('[GPODiscoveryHook] Discovery completed:', data);

        const discoveryResult = {
          id: `gpo-discovery-${Date.now()}`,
          name: 'GPO Discovery',
          moduleName: 'GPODiscovery',
          displayName: 'Group Policy Discovery',
          itemCount: data?.result?.totalItems || data?.result?.totalGPOs || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalGPOs || 0} GPOs, ${data?.result?.totalGPOLinks || 0} links, ${data?.result?.totalWMIFilters || 0} WMI filters`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          result: data.result as GPODiscoveryResult,
          isDiscovering: false,
          progress: {
            current: 100,
            total: 100,
            message: 'Completed',
            percentage: 100,
          },
        }));

        addResult(discoveryResult);
        console.log(`[GPODiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[GPODiscoveryHook] Discovery error:', data.error);
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
        console.warn('[GPODiscoveryHook] Discovery cancelled');
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
      console.error('[GPODiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    const token = `gpo-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        message: 'Starting GPO discovery...',
        percentage: 0,
      },
    }));

    currentTokenRef.current = token;

    console.log(`[GPODiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log('[GPODiscoveryHook] Parameters:', {
      IncludeGPOs: state.config.includeGPOs,
      IncludeGPOLinks: state.config.includeGPOLinks,
      IncludeGPOSettings: state.config.includeGPOSettings,
      IncludeGPOFilters: state.config.includeGPOFilters,
      IncludeWMIFilters: state.config.includeWMIFilters,
      MaxResults: state.config.maxResults,
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'GPO',
        parameters: {
          IncludeGPOs: state.config.includeGPOs,
          IncludeGPOLinks: state.config.includeGPOLinks,
          IncludeGPOSettings: state.config.includeGPOSettings,
          IncludeGPOFilters: state.config.includeGPOFilters,
          IncludeWMIFilters: state.config.includeWMIFilters,
          MaxResults: state.config.maxResults,
        },
        executionOptions: {
          timeout: state.config.timeout * 1000,
          showWindow: state.config.showWindow,
        },
        executionId: token,
      });

      console.log('[GPODiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[GPODiscoveryHook] Discovery failed:', errorMessage);
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

    console.warn('[GPODiscoveryHook] Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[GPODiscoveryHook] Discovery cancellation requested successfully');

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
      console.error('[GPODiscoveryHook]', errorMessage);
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

  const updateConfig = useCallback((updates: Partial<GPODiscoveryConfig>) => {
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
