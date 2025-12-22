/**
 * Panorama Interrogation Discovery Logic Hook
 * Contains all business logic for Palo Alto Panorama firewall interrogation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import type { PowerShellLog } from '../components/molecules/PowerShellExecutionDialog';

interface PanoramaInterrogationDiscoveryConfig {
  panoramaHost: string;
  apiPort: number;
  includeSecurityPolicies: boolean;
  includeNATRules: boolean;
  includeObjects: boolean;
  includeDeviceGroups: boolean;
  includeTemplates: boolean;
  includeZones: boolean;
}

interface PanoramaInterrogationDiscoveryResult {
  totalSecurityPolicies?: number;
  totalNATRules?: number;
  totalAddressObjects?: number;
  totalDeviceGroups?: number;
  totalItems?: number;
  outputPath?: string;
  securityPolicies?: any[];
  natRules?: any[];
  addressObjects?: any[];
  serviceObjects?: any[];
  deviceGroups?: any[];
  templates?: any[];
  zones?: any[];
  statistics?: {
    totalRules?: number;
    totalObjects?: number;
    highRiskPolicies?: number;
    unusedObjects?: number;
  };
}

interface PanoramaInterrogationDiscoveryState {
  config: PanoramaInterrogationDiscoveryConfig;
  result: PanoramaInterrogationDiscoveryResult | null;
  isDiscovering: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
}

export const usePanoramaInterrogationDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);
  const [logs, setLogs] = useState<PowerShellLog[]>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [state, setState] = useState<PanoramaInterrogationDiscoveryState>({
    config: {
      panoramaHost: '',
      apiPort: 443,
      includeSecurityPolicies: true,
      includeNATRules: true,
      includeObjects: true,
      includeDeviceGroups: true,
      includeTemplates: true,
      includeZones: true,
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
    console.log('[PanoramaInterrogationDiscoveryHook] Loading previous results');
    const previousResults = getResultsByModuleName('PanoramaInterrogationDiscovery');
    if (previousResults && previousResults.length > 0) {
      const latestResult = previousResults[previousResults.length - 1];
      console.log('[PanoramaInterrogationDiscoveryHook] Found previous result:', latestResult);
      setState((prev) => ({
        ...prev,
        result: latestResult.additionalData as PanoramaInterrogationDiscoveryResult,
      }));
    }
  }, [getResultsByModuleName]);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[PanoramaInterrogationDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[PanoramaInterrogationDiscoveryHook] Discovery output:', data.message);
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
        console.log('[PanoramaInterrogationDiscoveryHook] Discovery completed:', data);

        const discoveryResult = {
          id: `panoramainterrogation-discovery-${Date.now()}`,
          name: 'Panorama Interrogation Discovery',
          moduleName: 'PanoramaInterrogationDiscovery',
          displayName: 'Panorama Interrogation Discovery',
          itemCount: data?.result?.totalItems || data?.result?.totalSecurityPolicies || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Interrogated Panorama: ${data?.result?.totalSecurityPolicies || 0} security policies, ${data?.result?.totalNATRules || 0} NAT rules, ${data?.result?.totalAddressObjects || 0} address objects across ${data?.result?.totalDeviceGroups || 0} device groups`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          result: data.result as PanoramaInterrogationDiscoveryResult,
          isDiscovering: false,
          progress: {
            current: 100,
            total: 100,
            message: 'Completed',
            percentage: 100,
          },
        }));

        addResult(discoveryResult);
        console.log(`[PanoramaInterrogationDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[PanoramaInterrogationDiscoveryHook] Discovery error:', data.error);
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
        console.warn('[PanoramaInterrogationDiscoveryHook] Discovery cancelled');
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

  const addLog = useCallback((level: PowerShellLog['level'], message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, level, message }]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const startDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      const errorMessage = 'No company profile selected. Please select a profile first.';
      setState((prev) => ({ ...prev, error: errorMessage }));
      console.error('[PanoramaInterrogationDiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    setShowExecutionDialog(true);
    const token = `panoramainterrogation-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        message: 'Starting Panorama Interrogation discovery...',
        percentage: 0,
      },
    }));

    currentTokenRef.current = token;

    console.log(`[PanoramaInterrogationDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log('[PanoramaInterrogationDiscoveryHook] Parameters:', {
      PanoramaHost: state.config.panoramaHost,
      APIPort: state.config.apiPort,
      IncludeSecurityPolicies: state.config.includeSecurityPolicies,
      IncludeNATRules: state.config.includeNATRules,
      IncludeObjects: state.config.includeObjects,
      IncludeDeviceGroups: state.config.includeDeviceGroups,
      IncludeTemplates: state.config.includeTemplates,
      IncludeZones: state.config.includeZones,
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'PanoramaInterrogation',
        parameters: {
          PanoramaHost: state.config.panoramaHost,
          APIPort: state.config.apiPort,
          IncludeSecurityPolicies: state.config.includeSecurityPolicies,
          IncludeNATRules: state.config.includeNATRules,
          IncludeObjects: state.config.includeObjects,
          IncludeDeviceGroups: state.config.includeDeviceGroups,
          IncludeTemplates: state.config.includeTemplates,
          IncludeZones: state.config.includeZones,
        },
        executionOptions: {
          timeout: 300000, // 5 minutes
          showWindow: false,
        },
        executionId: token,
      });

      console.log('[PanoramaInterrogationDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[PanoramaInterrogationDiscoveryHook] Discovery failed:', errorMessage);
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

    setIsCancelling(true);
    console.warn('[PanoramaInterrogationDiscoveryHook] Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[PanoramaInterrogationDiscoveryHook] Discovery cancellation requested successfully');

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
        setIsCancelling(false);
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'Error cancelling discovery';
      console.error('[PanoramaInterrogationDiscoveryHook]', errorMessage);
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
      setIsCancelling(false);
    }
  }, [state.isDiscovering]);

  const updateConfig = useCallback((updates: Partial<PanoramaInterrogationDiscoveryConfig>) => {
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
    showExecutionDialog,
    setShowExecutionDialog,
    logs,
    clearLogs,
    isCancelling,
  };
};
