/**
 * Certificate Authority Discovery Logic Hook
 * Contains all business logic for Certificate Authority discovery
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

interface CertificateAuthorityDiscoveryConfig {
  includeCAs: boolean;
  includeTemplates: boolean;
  includeIssuedCertificates: boolean;
  includeRevocationInfo: boolean;
  maxCertificatesToScan: number;
}

interface CertificateAuthorityDiscoveryResult {
  totalCAs?: number;
  totalTemplates?: number;
  totalCertificates?: number;
  totalItems?: number;
  outputPath?: string;
  certificateAuthorities?: any[];
  certificateTemplates?: any[];
  issuedCertificates?: any[];
  revocationLists?: any[];
  statistics?: {
    activeCAs?: number;
    expiredCertificates?: number;
    revokedCertificates?: number;
    averageCertificateValidity?: number;
  };
}

interface CertificateAuthorityDiscoveryState {
  config: CertificateAuthorityDiscoveryConfig;
  result: CertificateAuthorityDiscoveryResult | null;
  isDiscovering: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
}

export const useCertificateAuthorityDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  const [state, setState] = useState<CertificateAuthorityDiscoveryState>({
    config: {
      includeCAs: true,
      includeTemplates: true,
      includeIssuedCertificates: true,
      includeRevocationInfo: true,
      maxCertificatesToScan: 10000,
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
    console.log('[CertificateAuthorityDiscoveryHook] Loading previous results');
    const previousResults = getResultsByModuleName('CertificateAuthorityDiscovery');
    if (previousResults && previousResults.length > 0) {
      const latestResult = previousResults[previousResults.length - 1];
      console.log('[CertificateAuthorityDiscoveryHook] Found previous result:', latestResult);
      setState((prev) => ({
        ...prev,
        result: latestResult.additionalData as CertificateAuthorityDiscoveryResult,
      }));
    }
  }, [getResultsByModuleName]);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[CertificateAuthorityDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[CertificateAuthorityDiscoveryHook] Discovery output:', data.message);
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
        console.log('[CertificateAuthorityDiscoveryHook] Discovery completed:', data);

        const discoveryResult = {
          id: `certificateauthority-discovery-${Date.now()}`,
          name: 'Certificate Authority Discovery',
          moduleName: 'CertificateAuthorityDiscovery',
          displayName: 'Certificate Authority Discovery',
          itemCount: data?.result?.totalItems || data?.result?.totalCAs || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalCAs || 0} Certificate Authorities and ${data?.result?.totalTemplates || 0} templates`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          result: data.result as CertificateAuthorityDiscoveryResult,
          isDiscovering: false,
          progress: {
            current: 100,
            total: 100,
            message: 'Completed',
            percentage: 100,
          },
        }));

        addResult(discoveryResult);
        console.log(`[CertificateAuthorityDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[CertificateAuthorityDiscoveryHook] Discovery error:', data.error);
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
        console.warn('[CertificateAuthorityDiscoveryHook] Discovery cancelled');
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
      console.error('[CertificateAuthorityDiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    const token = `certificateauthority-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        message: 'Starting Certificate Authority discovery...',
        percentage: 0,
      },
    }));

    currentTokenRef.current = token;

    console.log(`[CertificateAuthorityDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log('[CertificateAuthorityDiscoveryHook] Parameters:', {
      IncludeCAs: state.config.includeCAs,
      IncludeTemplates: state.config.includeTemplates,
      IncludeIssuedCertificates: state.config.includeIssuedCertificates,
      IncludeRevocationInfo: state.config.includeRevocationInfo,
      MaxCertificatesToScan: state.config.maxCertificatesToScan,
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'CertificateAuthority',
        parameters: {
          IncludeCAs: state.config.includeCAs,
          IncludeTemplates: state.config.includeTemplates,
          IncludeIssuedCertificates: state.config.includeIssuedCertificates,
          IncludeRevocationInfo: state.config.includeRevocationInfo,
          MaxCertificatesToScan: state.config.maxCertificatesToScan,
        },
        executionOptions: {
          timeout: 300000, // 5 minutes
          showWindow: false,
        },
        executionId: token,
      });

      console.log('[CertificateAuthorityDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[CertificateAuthorityDiscoveryHook] Discovery failed:', errorMessage);
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

    console.warn('[CertificateAuthorityDiscoveryHook] Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[CertificateAuthorityDiscoveryHook] Discovery cancellation requested successfully');

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
      console.error('[CertificateAuthorityDiscoveryHook]', errorMessage);
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

  const updateConfig = useCallback((updates: Partial<CertificateAuthorityDiscoveryConfig>) => {
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
