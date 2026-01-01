/**
 * Environment Detection Logic Hook
 * Contains all business logic for environment detection
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

interface EnvironmentDetectionConfig {
  detectAzure: boolean;
  detectOnPremises: boolean;
  detectAWS: boolean;
  detectGCP: boolean;
  timeout: number;
}

interface EnvironmentDetectionResult {
  totalServicesDetected?: number;
  servicesByProvider?: Record<string, number>;
  environmentConfidence?: number;
  criticalRecommendations?: number;
  detectedServices?: any[];
  recommendations?: any[];
  totalItems?: number;
  outputPath?: string;
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

interface EnvironmentDetectionHookResult {
  config: EnvironmentDetectionConfig;
  result: EnvironmentDetectionResult | null;
  isDiscovering: boolean;
  isDetecting: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
  activeTab: string;
  filter: any;
  columns: any[];
  filteredData: any[];
  stats: any;
  startDiscovery: () => Promise<void>;
  startDetection: () => Promise<void>;
  cancelDiscovery: () => Promise<void>;
  cancelDetection: () => Promise<void>;
  updateConfig: (updates: Partial<EnvironmentDetectionConfig>) => void;
  updateFilter: (updates: any) => void;
  setActiveTab: (tab: string) => void;
  exportToCSV: (data: any[], filename: string) => Promise<void>;
  exportToExcel: (data: any[], filename: string) => Promise<void>;
  clearError: () => void;
}

export const useEnvironmentDetectionDiscoveryLogic = (): EnvironmentDetectionHookResult => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  // Additional state for view compatibility
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [filter, setFilter] = useState<any>({
    searchText: '',
    selectedProviders: [],
    showOnlyAvailable: false,
  });

  const [state, setState] = useState<EnvironmentDetectionState>({
    config: {
      detectAzure: true,
      detectOnPremises: true,
      detectAWS: true,
      detectGCP: true,
      timeout: 300000,
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
          itemCount: data?.result?.totalItems || data?.result?.totalServicesDetected || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Detected ${data?.result?.totalServicesDetected || 0} services across multiple providers`,
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
      DetectAzure: state.config.detectAzure,
      DetectOnPremises: state.config.detectOnPremises,
      DetectAWS: state.config.detectAWS,
      DetectGCP: state.config.detectGCP,
      Timeout: state.config.timeout,
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'EnvironmentDetection',
        parameters: {
          DetectAzure: state.config.detectAzure,
          DetectOnPremises: state.config.detectOnPremises,
          DetectAWS: state.config.detectAWS,
          DetectGCP: state.config.detectGCP,
          Timeout: state.config.timeout,
        },
        executionOptions: {
          timeout: state.config.timeout,
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

  // Additional functions for view compatibility
  const startDetection = useCallback(async () => {
    return startDiscovery();
  }, [startDiscovery]);

  const cancelDetection = useCallback(async () => {
    return cancelDiscovery();
  }, [cancelDiscovery]);

  const updateFilter = useCallback((updates: any) => {
    setFilter((prev: any) => ({ ...prev, ...updates }));
  }, []);

  const exportToCSV = useCallback(async (data: any[], filename: string) => {
    // Implementation for CSV export
    console.log('Exporting to CSV:', filename, data.length, 'items');
  }, []);

  const exportToExcel = useCallback(async (data: any[], filename: string) => {
    // Implementation for Excel export
    console.log('Exporting to Excel:', filename, data.length, 'items');
  }, []);

  // Computed properties
  const columns = [
    { key: 'name', header: 'Service Name', width: 200 },
    { key: 'provider', header: 'Provider', width: 120 },
    { key: 'detected', header: 'Detected', width: 100 },
    { key: 'capabilities', header: 'Capabilities', width: 150 },
  ];

  const filteredData = state.result?.detectedServices?.filter((service: any) => {
    if (filter.searchText && !service.name?.toLowerCase().includes(filter.searchText.toLowerCase())) {
      return false;
    }
    if (filter.selectedProviders.length > 0 && !filter.selectedProviders.includes(service.provider)) {
      return false;
    }
    if (filter.showOnlyAvailable && !service.detected) {
      return false;
    }
    return true;
  }) || [];

  const stats = state.result ? {
    totalServicesDetected: state.result.totalServicesDetected || 0,
    servicesByProvider: state.result.servicesByProvider || {},
    environmentConfidence: state.result.environmentConfidence || 0,
    criticalRecommendations: state.result.criticalRecommendations || 0,
  } : null;

  return {
    config: state.config,
    result: state.result,
    isDiscovering: state.isDiscovering,
    isDetecting: state.isDiscovering,
    progress: state.progress,
    error: state.error,
    activeTab,
    filter,
    columns,
    filteredData,
    stats,
    startDiscovery,
    startDetection,
    cancelDiscovery,
    cancelDetection,
    updateConfig,
    updateFilter,
    setActiveTab,
    exportToCSV,
    exportToExcel,
    clearError,
  };
};


