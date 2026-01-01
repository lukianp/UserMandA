/**
 * Infrastructure Discovery Logic Hook
 * Contains all business logic for general infrastructure discovery
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { NetworkDiagnosticResults, InfrastructureDiscoveryResult } from '../types/models/discovery';

interface InfrastructureDiscoveryConfig {
  includeServers: boolean;
  includeNetworkDevices: boolean;
  includeStorageDevices: boolean;
  includeSecurityDevices: boolean;
  includeVirtualization: boolean;
  maxResults: number;
  timeout: number;
  showWindow: boolean;
  enableDiagnostics: boolean;
  manualSubnets: string[];
}

export interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

interface InfrastructureDiscoveryState {
  config: InfrastructureDiscoveryConfig;
  result: InfrastructureDiscoveryResult | null;
  isDiscovering: boolean;
  isCancelling: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
    currentSubnet?: string;
    totalSubnets?: number;
    completedSubnets?: number;
    currentPhase?: string;
  };
  error: string | null;
  logs: LogEntry[];
  showExecutionDialog: boolean;
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
      enableDiagnostics: true,
      manualSubnets: [],
    },
    result: null,
    isDiscovering: false,
    isCancelling: false,
    progress: {
      current: 0,
      total: 100,
      message: '',
      percentage: 0,
      currentSubnet: undefined,
      totalSubnets: undefined,
      completedSubnets: 0,
      currentPhase: 'Ready',
    },
    error: null,
    logs: [],
    showExecutionDialog: false,
  });

  // Helper to add log entry
  const addLog = useCallback((message: string, level: LogEntry['level'] = 'info') => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      message,
      level,
    };
    setState((prev) => ({
      ...prev,
      logs: [...prev.logs, entry],
    }));
  }, []);

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
        const message = data.message || '';
        // Determine log level based on message content
        let level: LogEntry['level'] = 'info';
        if (message.toLowerCase().includes('error') || message.toLowerCase().includes('failed')) {
          level = 'error';
        } else if (message.toLowerCase().includes('warning') || message.toLowerCase().includes('warn')) {
          level = 'warning';
        } else if (message.toLowerCase().includes('success') || message.toLowerCase().includes('complete') || message.toLowerCase().includes('found')) {
          level = 'success';
        }

        // Parse progress information from PowerShell output
        let progressUpdate: Partial<InfrastructureDiscoveryState['progress']> = {};

        // Extract subnet scanning progress
        if (message.includes('Adaptive scan:')) {
          const subnetMatch = message.match(/Adaptive scan:\s*([0-9.\/]+)/);
          if (subnetMatch) {
            progressUpdate.currentSubnet = subnetMatch[1];
            progressUpdate.currentPhase = 'Scanning subnet';
          }
        }

        // Extract total subnet count
        if (message.includes('Scanning ') && message.includes(' classified network segments')) {
          const countMatch = message.match(/Scanning\s+(\d+)\s+classified network segments/);
          if (countMatch) {
            progressUpdate.totalSubnets = parseInt(countMatch[1]);
            progressUpdate.completedSubnets = 0;
            progressUpdate.currentPhase = 'Initializing scan';
          }
        }

        // Track subnet completion
        if (message.includes('No live hosts found') || message.includes('Found ') && message.includes(' live hosts')) {
          progressUpdate.completedSubnets = (progressUpdate.completedSubnets || 0) + 1;
          if (progressUpdate.totalSubnets && progressUpdate.completedSubnets) {
            progressUpdate.percentage = Math.round((progressUpdate.completedSubnets / progressUpdate.totalSubnets) * 100);
          }
        }

        // Extract phase information
        if (message.includes('Starting Infrastructure discovery')) {
          progressUpdate.currentPhase = 'Starting discovery';
          progressUpdate.percentage = 5;
        } else if (message.includes('Preparing infrastructure discovery tools')) {
          progressUpdate.currentPhase = 'Preparing tools';
          progressUpdate.percentage = 10;
        } else if (message.includes('Intelligent nmap Management System')) {
          progressUpdate.currentPhase = 'Setting up nmap';
          progressUpdate.percentage = 15;
        } else if (message.includes('Searching for system nmap')) {
          progressUpdate.currentPhase = 'Checking nmap installation';
          progressUpdate.percentage = 20;
        } else if (message.includes('Discovering network topology')) {
          progressUpdate.currentPhase = 'Discovering network topology';
          progressUpdate.percentage = 30;
        } else if (message.includes('Applying intelligent subnet classification')) {
          progressUpdate.currentPhase = 'Classifying subnets';
          progressUpdate.percentage = 50;
        } else if (message.includes('Intelligent Adaptive Scanning Engine')) {
          progressUpdate.currentPhase = 'Starting adaptive scanning';
          progressUpdate.percentage = 60;
        }

        // Add log entry
        setState((prev) => ({
          ...prev,
          logs: [...prev.logs, { timestamp: new Date().toISOString(), message, level }],
          progress: {
            ...prev.progress,
            message,
            ...progressUpdate,
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
          moduleName: 'Infrastructure',
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
          isCancelling: false,
          logs: [...prev.logs, { timestamp: new Date().toISOString(), message: `Discovery completed! Found ${discoveryResult.itemCount} items.`, level: 'success' as const }],
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
          isCancelling: false,
          error: data.error,
          logs: [...prev.logs, { timestamp: new Date().toISOString(), message: `Error: ${data.error}`, level: 'error' as const }],
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
          isCancelling: false,
          logs: [...prev.logs, { timestamp: new Date().toISOString(), message: 'Discovery cancelled by user', level: 'warning' as const }],
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
      console.error('[InfrastructureDiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    const token = `infrastructure-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      isCancelling: false,
      error: null,
      logs: [{ timestamp: new Date().toISOString(), message: 'Starting Infrastructure discovery...', level: 'info' as const }],
      showExecutionDialog: true,
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
          EnableDiagnostics: state.config.enableDiagnostics,
          ManualSubnets: state.config.manualSubnets,
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
    setState((prev) => ({
      ...prev,
      isCancelling: true,
      logs: [...prev.logs, { timestamp: new Date().toISOString(), message: 'Cancelling discovery...', level: 'warning' as const }],
    }));

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[InfrastructureDiscoveryHook] Discovery cancellation requested successfully');

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
      console.error('[InfrastructureDiscoveryHook]', errorMessage);
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

  const updateConfig = useCallback((updates: Partial<InfrastructureDiscoveryConfig>) => {
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  }, []);

  const addManualSubnet = useCallback((subnet: string) => {
    if (subnet && !state.config.manualSubnets.includes(subnet)) {
      setState((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          manualSubnets: [...prev.config.manualSubnets, subnet],
        },
      }));
    }
  }, [state.config.manualSubnets]);

  const removeManualSubnet = useCallback((subnet: string) => {
    setState((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        manualSubnets: prev.config.manualSubnets.filter(s => s !== subnet),
      },
    }));
  }, []);

  const clearManualSubnets = useCallback(() => {
    setState((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        manualSubnets: [],
      },
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
    isCancelling: state.isCancelling,
    progress: state.progress,
    error: state.error,
    logs: state.logs,
    showExecutionDialog: state.showExecutionDialog,
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    clearError,
    clearLogs,
    setShowExecutionDialog,
    addManualSubnet,
    removeManualSubnet,
    clearManualSubnets,
  };
};


