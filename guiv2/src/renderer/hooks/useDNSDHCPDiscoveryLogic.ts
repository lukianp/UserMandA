/**
 * DNS and DHCP Discovery Logic Hook
 * Contains all business logic for DNS and DHCP server discovery
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

interface DNSDHCPDiscoveryConfig {
  includeDNS: boolean;
  includeDHCP: boolean;
  includeZones: boolean;
  includeRecords: boolean;
  includeScopes: boolean;
  includeLeases: boolean;
  includeReservations: boolean;
  maxRecordsPerZone: number;
}

interface DNSDHCPDiscoveryResult {
  totalDNSServers?: number;
  totalDHCPServers?: number;
  totalZones?: number;
  totalRecords?: number;
  totalScopes?: number;
  totalLeases?: number;
  totalItems?: number;
  outputPath?: string;
  dnsServers?: any[];
  dhcpServers?: any[];
  dnsZones?: any[];
  dnsRecords?: any[];
  dhcpScopes?: any[];
  dhcpLeases?: any[];
  dhcpReservations?: any[];
  statistics?: {
    activeLeases?: number;
    expiredLeases?: number;
    scopeUtilization?: Record<string, number>;
    recordsByType?: Record<string, number>;
    zonesByType?: Record<string, number>;
  };
}

interface DNSDHCPDiscoveryState {
  config: DNSDHCPDiscoveryConfig;
  result: DNSDHCPDiscoveryResult | null;
  isDiscovering: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
}

export const useDNSDHCPDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  const [state, setState] = useState<DNSDHCPDiscoveryState>({
    config: {
      includeDNS: true,
      includeDHCP: true,
      includeZones: true,
      includeRecords: true,
      includeScopes: true,
      includeLeases: true,
      includeReservations: true,
      maxRecordsPerZone: 10000,
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
    console.log('[DNSDHCPDiscoveryHook] Loading previous results');
    const previousResults = getResultsByModuleName('DNSDHCPDiscovery');
    if (previousResults && previousResults.length > 0) {
      const latestResult = previousResults[previousResults.length - 1];
      console.log('[DNSDHCPDiscoveryHook] Found previous result:', latestResult);
      setState((prev) => ({
        ...prev,
        result: latestResult.additionalData as DNSDHCPDiscoveryResult,
      }));
    }
  }, [getResultsByModuleName]);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[DNSDHCPDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[DNSDHCPDiscoveryHook] Discovery output:', data.message);
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
        console.log('[DNSDHCPDiscoveryHook] Discovery completed:', data);

        const discoveryResult = {
          id: `dnsdhcp-discovery-${Date.now()}`,
          name: 'DNS & DHCP Discovery',
          moduleName: 'DNSDHCPDiscovery',
          displayName: 'DNS & DHCP Discovery',
          itemCount: data?.result?.totalItems || (data?.result?.totalDNSServers || 0) + (data?.result?.totalDHCPServers || 0),
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalDNSServers || 0} DNS servers with ${data?.result?.totalZones || 0} zones and ${data?.result?.totalDHCPServers || 0} DHCP servers with ${data?.result?.totalScopes || 0} scopes`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          result: data.result as DNSDHCPDiscoveryResult,
          isDiscovering: false,
          progress: {
            current: 100,
            total: 100,
            message: 'Completed',
            percentage: 100,
          },
        }));

        addResult(discoveryResult);
        console.log(`[DNSDHCPDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[DNSDHCPDiscoveryHook] Discovery error:', data.error);
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
        console.warn('[DNSDHCPDiscoveryHook] Discovery cancelled');
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
      console.error('[DNSDHCPDiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    const token = `dnsdhcp-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        message: 'Starting DNS & DHCP discovery...',
        percentage: 0,
      },
    }));

    currentTokenRef.current = token;

    console.log(`[DNSDHCPDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log('[DNSDHCPDiscoveryHook] Parameters:', {
      IncludeDNS: state.config.includeDNS,
      IncludeDHCP: state.config.includeDHCP,
      IncludeZones: state.config.includeZones,
      IncludeRecords: state.config.includeRecords,
      IncludeScopes: state.config.includeScopes,
      IncludeLeases: state.config.includeLeases,
      IncludeReservations: state.config.includeReservations,
      MaxRecordsPerZone: state.config.maxRecordsPerZone,
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'DNSDHCP',
        parameters: {
          IncludeDNS: state.config.includeDNS,
          IncludeDHCP: state.config.includeDHCP,
          IncludeZones: state.config.includeZones,
          IncludeRecords: state.config.includeRecords,
          IncludeScopes: state.config.includeScopes,
          IncludeLeases: state.config.includeLeases,
          IncludeReservations: state.config.includeReservations,
          MaxRecordsPerZone: state.config.maxRecordsPerZone,
        },
        executionOptions: {
          timeout: 300000, // 5 minutes
          showWindow: false,
        },
        executionId: token,
      });

      console.log('[DNSDHCPDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[DNSDHCPDiscoveryHook] Discovery failed:', errorMessage);
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

    console.warn('[DNSDHCPDiscoveryHook] Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[DNSDHCPDiscoveryHook] Discovery cancellation requested successfully');

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
      console.error('[DNSDHCPDiscoveryHook]', errorMessage);
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

  const updateConfig = useCallback((updates: Partial<DNSDHCPDiscoveryConfig>) => {
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
