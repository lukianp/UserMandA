/**
 * Web Server Configuration Discovery Logic Hook
 * Contains all business logic for web server configuration discovery
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

interface WebServerConfigDiscoveryConfig {
  includeIISSites: boolean;
  includeIISAppPools: boolean;
  includeIISBindings: boolean;
  includeApacheVHosts: boolean;
  includeNginxServers: boolean;
  includeSSLCertificates: boolean;
  maxResults: number;
  timeout: number;
  showWindow: boolean;
}

interface WebServerConfigDiscoveryResult {
  totalIISSites?: number;
  totalAppPools?: number;
  totalBindings?: number;
  totalApacheVHosts?: number;
  totalNginxServers?: number;
  totalSSLCertificates?: number;
  totalItems?: number;
  outputPath?: string;
  iisSites?: any[];
  iisAppPools?: any[];
  iisBindings?: any[];
  apacheVHosts?: any[];
  nginxServers?: any[];
  sslCertificates?: any[];
  statistics?: {
    totalWebServers?: number;
    runningWebServers?: number;
    stoppedWebServers?: number;
    httpsEnabledSites?: number;
    expiredCertificates?: number;
    averageAppPoolsPerSite?: number;
  };
}

interface WebServerConfigDiscoveryState {
  config: WebServerConfigDiscoveryConfig;
  result: WebServerConfigDiscoveryResult | null;
  isDiscovering: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
}

export const useWebServerConfigDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  const [state, setState] = useState<WebServerConfigDiscoveryState>({
    config: {
      includeIISSites: true,
      includeIISAppPools: true,
      includeIISBindings: true,
      includeApacheVHosts: false,
      includeNginxServers: false,
      includeSSLCertificates: true,
      maxResults: 5000,
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
    console.log('[WebServerConfigDiscoveryHook] Loading previous results');
    const previousResults = getResultsByModuleName('WebServerConfigDiscovery');
    if (previousResults && previousResults.length > 0) {
      const latestResult = previousResults[previousResults.length - 1];
      console.log('[WebServerConfigDiscoveryHook] Found previous result:', latestResult);
      setState((prev) => ({
        ...prev,
        result: latestResult.additionalData as WebServerConfigDiscoveryResult,
      }));
    }
  }, [getResultsByModuleName]);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[WebServerConfigDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[WebServerConfigDiscoveryHook] Discovery output:', data.message);
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
        console.log('[WebServerConfigDiscoveryHook] Discovery completed:', data);

        const discoveryResult = {
          id: `webserverconfig-discovery-${Date.now()}`,
          name: 'Web Server Configuration Discovery',
          moduleName: 'WebServerConfigDiscovery',
          displayName: 'Web Server Configuration Discovery',
          itemCount: data?.result?.totalItems || data?.result?.totalIISSites || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalIISSites || 0} IIS sites, ${data?.result?.totalAppPools || 0} application pools, and ${data?.result?.totalSSLCertificates || 0} SSL certificates`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          result: data.result as WebServerConfigDiscoveryResult,
          isDiscovering: false,
          progress: {
            current: 100,
            total: 100,
            message: 'Completed',
            percentage: 100,
          },
        }));

        addResult(discoveryResult);
        console.log(`[WebServerConfigDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[WebServerConfigDiscoveryHook] Discovery error:', data.error);
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
        console.warn('[WebServerConfigDiscoveryHook] Discovery cancelled');
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
      console.error('[WebServerConfigDiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    const token = `webserverconfig-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        message: 'Starting Web Server Configuration discovery...',
        percentage: 0,
      },
    }));

    currentTokenRef.current = token;

    console.log(`[WebServerConfigDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log('[WebServerConfigDiscoveryHook] Parameters:', {
      IncludeIISSites: state.config.includeIISSites,
      IncludeIISAppPools: state.config.includeIISAppPools,
      IncludeIISBindings: state.config.includeIISBindings,
      IncludeApacheVHosts: state.config.includeApacheVHosts,
      IncludeNginxServers: state.config.includeNginxServers,
      IncludeSSLCertificates: state.config.includeSSLCertificates,
      MaxResults: state.config.maxResults,
      Timeout: state.config.timeout,
      ShowWindow: state.config.showWindow,
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'WebServerConfig',
        parameters: {
          IncludeIISSites: state.config.includeIISSites,
          IncludeIISAppPools: state.config.includeIISAppPools,
          IncludeIISBindings: state.config.includeIISBindings,
          IncludeApacheVHosts: state.config.includeApacheVHosts,
          IncludeNginxServers: state.config.includeNginxServers,
          IncludeSSLCertificates: state.config.includeSSLCertificates,
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

      console.log('[WebServerConfigDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[WebServerConfigDiscoveryHook] Discovery failed:', errorMessage);
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

    console.warn('[WebServerConfigDiscoveryHook] Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[WebServerConfigDiscoveryHook] Discovery cancellation requested successfully');

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
      console.error('[WebServerConfigDiscoveryHook]', errorMessage);
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

  const updateConfig = useCallback((updates: Partial<WebServerConfigDiscoveryConfig>) => {
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
