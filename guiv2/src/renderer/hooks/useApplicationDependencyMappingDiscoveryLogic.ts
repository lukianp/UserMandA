/**
 * Application Dependency Mapping Discovery Logic Hook
 * Contains all business logic for application dependency mapping discovery
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import type { PowerShellLog } from '../components/molecules/PowerShellExecutionDialog';

interface ApplicationDependencyMappingDiscoveryConfig {
  includeNetworkDependencies: boolean;
  includeDatabaseDependencies: boolean;
  includeAPIEndpoints: boolean;
  includeServiceDependencies: boolean;
  includeFileDependencies: boolean;
  scanDepth: number;
}

interface ApplicationDependencyMappingDiscoveryResult {
  totalDependencies?: number;
  totalApplications?: number;
  criticalDependencies?: number;
  totalItems?: number;
  outputPath?: string;
  dependencies?: any[];
  applications?: any[];
  dependencyGraph?: any;
  statistics?: {
    networkDependencies?: number;
    databaseDependencies?: number;
    apiDependencies?: number;
    serviceDependencies?: number;
    fileDependencies?: number;
    circularDependencies?: number;
  };
}

interface ApplicationDependencyMappingDiscoveryState {
  config: ApplicationDependencyMappingDiscoveryConfig;
  result: ApplicationDependencyMappingDiscoveryResult | null;
  isDiscovering: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
}

export const useApplicationDependencyMappingDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);
  const [logs, setLogs] = useState<PowerShellLog[]>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [state, setState] = useState<ApplicationDependencyMappingDiscoveryState>({
    config: {
      includeNetworkDependencies: true,
      includeDatabaseDependencies: true,
      includeAPIEndpoints: true,
      includeServiceDependencies: true,
      includeFileDependencies: true,
      scanDepth: 3,
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
    console.log('[ApplicationDependencyMappingDiscoveryHook] Loading previous results');
    const previousResults = getResultsByModuleName('ApplicationDependencyMappingDiscovery');
    if (previousResults && previousResults.length > 0) {
      const latestResult = previousResults[previousResults.length - 1];
      console.log('[ApplicationDependencyMappingDiscoveryHook] Found previous result:', latestResult);
      setState((prev) => ({
        ...prev,
        result: latestResult.additionalData as ApplicationDependencyMappingDiscoveryResult,
      }));
    }
  }, [getResultsByModuleName]);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[ApplicationDependencyMappingDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[ApplicationDependencyMappingDiscoveryHook] Discovery output:', data.message);
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
        console.log('[ApplicationDependencyMappingDiscoveryHook] Discovery completed:', data);

        const discoveryResult = {
          id: `appdependencymapping-discovery-${Date.now()}`,
          name: 'Application Dependency Mapping Discovery',
          moduleName: 'ApplicationDependencyMappingDiscovery',
          displayName: 'Application Dependency Mapping Discovery',
          itemCount: data?.result?.totalItems || data?.result?.totalDependencies || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Mapped ${data?.result?.totalDependencies || 0} dependencies across ${data?.result?.totalApplications || 0} applications (${data?.result?.criticalDependencies || 0} critical)`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          result: data.result as ApplicationDependencyMappingDiscoveryResult,
          isDiscovering: false,
          progress: {
            current: 100,
            total: 100,
            message: 'Completed',
            percentage: 100,
          },
        }));

        addResult(discoveryResult);
        console.log(`[ApplicationDependencyMappingDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[ApplicationDependencyMappingDiscoveryHook] Discovery error:', data.error);
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
        console.warn('[ApplicationDependencyMappingDiscoveryHook] Discovery cancelled');
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
      console.error('[ApplicationDependencyMappingDiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    setShowExecutionDialog(true);
    const token = `appdependencymapping-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        message: 'Starting Application Dependency Mapping discovery...',
        percentage: 0,
      },
    }));

    currentTokenRef.current = token;

    console.log(`[ApplicationDependencyMappingDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log('[ApplicationDependencyMappingDiscoveryHook] Parameters:', {
      IncludeNetworkDependencies: state.config.includeNetworkDependencies,
      IncludeDatabaseDependencies: state.config.includeDatabaseDependencies,
      IncludeAPIEndpoints: state.config.includeAPIEndpoints,
      IncludeServiceDependencies: state.config.includeServiceDependencies,
      IncludeFileDependencies: state.config.includeFileDependencies,
      ScanDepth: state.config.scanDepth,
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'ApplicationDependencyMapping',
        parameters: {
          IncludeNetworkDependencies: state.config.includeNetworkDependencies,
          IncludeDatabaseDependencies: state.config.includeDatabaseDependencies,
          IncludeAPIEndpoints: state.config.includeAPIEndpoints,
          IncludeServiceDependencies: state.config.includeServiceDependencies,
          IncludeFileDependencies: state.config.includeFileDependencies,
          ScanDepth: state.config.scanDepth,
        },
        executionOptions: {
          timeout: 300000, // 5 minutes
          showWindow: false,
        },
        executionId: token,
      });

      console.log('[ApplicationDependencyMappingDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[ApplicationDependencyMappingDiscoveryHook] Discovery failed:', errorMessage);
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
    console.warn('[ApplicationDependencyMappingDiscoveryHook] Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[ApplicationDependencyMappingDiscoveryHook] Discovery cancellation requested successfully');

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
      console.error('[ApplicationDependencyMappingDiscoveryHook]', errorMessage);
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

  const updateConfig = useCallback((updates: Partial<ApplicationDependencyMappingDiscoveryConfig>) => {
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
