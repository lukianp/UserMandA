/**
 * Certificate Discovery Logic Hook
 * Contains all business logic for certificate discovery across systems
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

interface CertificateDiscoveryConfig {
  includeExpired: boolean;
  includeSelfSigned: boolean;
  includeUserCertificates: boolean;
  includeComputerCertificates: boolean;
  scanNetworkDevices: boolean;
  maxDaysUntilExpiration: number;
}

interface CertificateDiscoveryResult {
  totalCertificates?: number;
  expiredCertificates?: number;
  expiringSoonCertificates?: number;
  selfSignedCertificates?: number;
  totalItems?: number;
  outputPath?: string;
  certificates?: any[];
  certificatesByLocation?: Record<string, number>;
  certificatesByIssuer?: Record<string, number>;
  statistics?: {
    averageDaysUntilExpiration?: number;
    validCertificates?: number;
    revokedCertificates?: number;
    untrustedCertificates?: number;
  };
}

interface CertificateDiscoveryState {
  config: CertificateDiscoveryConfig;
  result: CertificateDiscoveryResult | null;
  isDiscovering: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
}

export const useCertificateDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  const [state, setState] = useState<CertificateDiscoveryState>({
    config: {
      includeExpired: true,
      includeSelfSigned: true,
      includeUserCertificates: true,
      includeComputerCertificates: true,
      scanNetworkDevices: false,
      maxDaysUntilExpiration: 90,
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
    console.log('[CertificateDiscoveryHook] Loading previous results');
    const previousResults = getResultsByModuleName('CertificateDiscovery');
    if (previousResults && previousResults.length > 0) {
      const latestResult = previousResults[previousResults.length - 1];
      console.log('[CertificateDiscoveryHook] Found previous result:', latestResult);
      setState((prev) => ({
        ...prev,
        result: latestResult.additionalData as CertificateDiscoveryResult,
      }));
    }
  }, [getResultsByModuleName]);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[CertificateDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[CertificateDiscoveryHook] Discovery output:', data.message);
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
        console.log('[CertificateDiscoveryHook] Discovery completed:', data);

        const discoveryResult = {
          id: `certificate-discovery-${Date.now()}`,
          name: 'Certificate Discovery',
          moduleName: 'CertificateDiscovery',
          displayName: 'Certificate Discovery',
          itemCount: data?.result?.totalItems || data?.result?.totalCertificates || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalCertificates || 0} certificates (${data?.result?.expiredCertificates || 0} expired, ${data?.result?.expiringSoonCertificates || 0} expiring soon)`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          result: data.result as CertificateDiscoveryResult,
          isDiscovering: false,
          progress: {
            current: 100,
            total: 100,
            message: 'Completed',
            percentage: 100,
          },
        }));

        addResult(discoveryResult);
        console.log(`[CertificateDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[CertificateDiscoveryHook] Discovery error:', data.error);
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
        console.warn('[CertificateDiscoveryHook] Discovery cancelled');
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
      console.error('[CertificateDiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    const token = `certificate-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        message: 'Starting Certificate discovery...',
        percentage: 0,
      },
    }));

    currentTokenRef.current = token;

    console.log(`[CertificateDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log('[CertificateDiscoveryHook] Parameters:', {
      IncludeExpired: state.config.includeExpired,
      IncludeSelfSigned: state.config.includeSelfSigned,
      IncludeUserCertificates: state.config.includeUserCertificates,
      IncludeComputerCertificates: state.config.includeComputerCertificates,
      ScanNetworkDevices: state.config.scanNetworkDevices,
      MaxDaysUntilExpiration: state.config.maxDaysUntilExpiration,
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'Certificate',
        parameters: {
          IncludeExpired: state.config.includeExpired,
          IncludeSelfSigned: state.config.includeSelfSigned,
          IncludeUserCertificates: state.config.includeUserCertificates,
          IncludeComputerCertificates: state.config.includeComputerCertificates,
          ScanNetworkDevices: state.config.scanNetworkDevices,
          MaxDaysUntilExpiration: state.config.maxDaysUntilExpiration,
        },
        executionOptions: {
          timeout: 300000, // 5 minutes
          showWindow: false,
        },
        executionId: token,
      });

      console.log('[CertificateDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[CertificateDiscoveryHook] Discovery failed:', errorMessage);
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

    console.warn('[CertificateDiscoveryHook] Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[CertificateDiscoveryHook] Discovery cancellation requested successfully');

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
      console.error('[CertificateDiscoveryHook]', errorMessage);
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

  const updateConfig = useCallback((updates: Partial<CertificateDiscoveryConfig>) => {
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
