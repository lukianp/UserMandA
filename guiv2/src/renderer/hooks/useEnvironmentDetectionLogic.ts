/**
 * Environment Detection Logic Hook
 * Contains all business logic for environment detection
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

interface EnvironmentDetectionConfig {
  includeOnPremise: boolean;
  includeCloud: boolean;
  includeHybrid: boolean;
  includeServers: boolean;
  includeWorkstations: boolean;
  includeMobileDevices: boolean;
  maxResults: number;
}

interface EnvironmentDetectionResult {
  totalEnvironments?: number;
  totalOnPremise?: number;
  totalCloud?: number;
  totalHybrid?: number;
  totalItems?: number;
  outputPath?: string;
  environments?: any[];
  onPremiseResources?: any[];
  cloudResources?: any[];
  hybridResources?: any[];
  servers?: any[];
  workstations?: any[];
  mobileDevices?: any[];
  statistics?: {
    onPremisePercentage?: number;
    cloudPercentage?: number;
    hybridPercentage?: number;
    totalServerCount?: number;
    totalWorkstationCount?: number;
    totalMobileDeviceCount?: number;
  };
}

interface EnvironmentDetectionState {
  config: EnvironmentDetectionConfig;
  result: EnvironmentDetectionResult | null;
  isDiscovering: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
}

export const useEnvironmentDetectionDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  const [state, setState] = useState<EnvironmentDetectionState>({
    config: {
      includeOnPremise: true,
      includeCloud: true,
      includeHybrid: true,
      includeServers: true,
      includeWorkstations: true,
      includeMobileDevices: true,
      maxResults: 10000,
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
    console.log('[EnvironmentDetectionHook] Loading previous results');
    const previousResults = getResultsByModuleName('EnvironmentDetection');
    if (previousResults && previousResults.length > 0) {
      const latestResult = previousResults[previousResults.length - 1];
      console.log('[EnvironmentDetectionHook] Found previous result:', latestResult);
      setState((prev) => ({
        ...prev,
        result: latestResult.additionalData as EnvironmentDetectionResult,
      }));
    }
  }, [getResultsByModuleName]);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[EnvironmentDetectionHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[EnvironmentDetectionHook] Discovery output:', data.message);
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
        console.log('[EnvironmentDetectionHook] Discovery completed:', data);

        const discoveryResult = {
          id: `environmentdetection-${Date.now()}`,
          name: 'Environment Detection',
          moduleName: 'EnvironmentDetection',
          displayName: 'Environment Detection',
          itemCount: data?.result?.totalItems || data?.result?.totalEnvironments || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Detected ${data?.result?.totalEnvironments || 0} environments (${data?.result?.totalOnPremise || 0} on-premise, ${data?.result?.totalCloud || 0} cloud, ${data?.result?.totalHybrid || 0} hybrid)`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          result: data.result as EnvironmentDetectionResult,
          isDiscovering: false,
          progress: {
            current: 100,
            total: 100,
            message: 'Completed',
            percentage: 100,
          },
        }));

        addResult(discoveryResult);
        console.log(`[EnvironmentDetectionHook] Discovery completed! Found ${discoveryResult.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[EnvironmentDetectionHook] Discovery error:', data.error);
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
        console.warn('[EnvironmentDetectionHook] Discovery cancelled');
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
      console.error('[EnvironmentDetectionHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    const token = `environmentdetection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        message: 'Starting Environment Detection...',
        percentage: 0,
      },
    }));

    currentTokenRef.current = token;

    console.log(`[EnvironmentDetectionHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log('[EnvironmentDetectionHook] Parameters:', {
      IncludeOnPremise: state.config.includeOnPremise,
      IncludeCloud: state.config.includeCloud,
      IncludeHybrid: state.config.includeHybrid,
      IncludeServers: state.config.includeServers,
      IncludeWorkstations: state.config.includeWorkstations,
      IncludeMobileDevices: state.config.includeMobileDevices,
      MaxResults: state.config.maxResults,
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'EnvironmentDetection',
        parameters: {
          IncludeOnPremise: state.config.includeOnPremise,
          IncludeCloud: state.config.includeCloud,
          IncludeHybrid: state.config.includeHybrid,
          IncludeServers: state.config.includeServers,
          IncludeWorkstations: state.config.includeWorkstations,
          IncludeMobileDevices: state.config.includeMobileDevices,
          MaxResults: state.config.maxResults,
        },
        executionOptions: {
          timeout: 900000, // 15 minutes
          showWindow: false,
        },
        executionId: token,
      });

      console.log('[EnvironmentDetectionHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[EnvironmentDetectionHook] Discovery failed:', errorMessage);
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

    console.warn('[EnvironmentDetectionHook] Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[EnvironmentDetectionHook] Discovery cancellation requested successfully');

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
      console.error('[EnvironmentDetectionHook]', errorMessage);
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

  const updateConfig = useCallback((updates: Partial<EnvironmentDetectionConfig>) => {
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
