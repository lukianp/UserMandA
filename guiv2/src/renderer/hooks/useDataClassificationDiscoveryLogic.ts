/**
 * Data Classification Discovery Logic Hook
 * Contains all business logic for data classification discovery
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import type { PowerShellLog } from '../components/molecules/PowerShellExecutionDialog';

interface DataClassificationDiscoveryConfig {
  includeSensitiveData: boolean;
  includePII: boolean;
  includePHI: boolean;
  includePCI: boolean;
  includeConfidentialData: boolean;
  scanLocations: string[]; // 'SharePoint', 'OneDrive', 'Exchange', 'FileShares'
  maxFilesToScan: number;
  fileExtensions: string[];
}

interface DataClassificationDiscoveryResult {
  totalFilesScanned?: number;
  totalSensitiveFiles?: number;
  totalPIIMatches?: number;
  totalPHIMatches?: number;
  totalPCIMatches?: number;
  totalItems?: number;
  outputPath?: string;
  sensitiveFiles?: any[];
  classificationByType?: Record<string, number>;
  classificationByLocation?: Record<string, number>;
  highRiskFiles?: any[];
  statistics?: {
    averageConfidenceScore?: number;
    filesWithMultipleClassifications?: number;
    unclassifiedFiles?: number;
    topSensitiveLocations?: Array<{ location: string; count: number }>;
  };
}

interface DataClassificationDiscoveryState {
  config: DataClassificationDiscoveryConfig;
  result: DataClassificationDiscoveryResult | null;
  isDiscovering: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
}

export const useDataClassificationDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);
  const [logs, setLogs] = useState<PowerShellLog[]>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [state, setState] = useState<DataClassificationDiscoveryState>({
    config: {
      includeSensitiveData: true,
      includePII: true,
      includePHI: true,
      includePCI: true,
      includeConfidentialData: true,
      scanLocations: ['SharePoint', 'OneDrive', 'FileShares'],
      maxFilesToScan: 10000,
      fileExtensions: ['.docx', '.xlsx', '.pdf', '.txt', '.csv'],
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
    console.log('[DataClassificationDiscoveryHook] Loading previous results');
    const previousResults = getResultsByModuleName('DataClassificationDiscovery');
    if (previousResults && previousResults.length > 0) {
      const latestResult = previousResults[previousResults.length - 1];
      console.log('[DataClassificationDiscoveryHook] Found previous result:', latestResult);
      setState((prev) => ({
        ...prev,
        result: latestResult.additionalData as DataClassificationDiscoveryResult,
      }));
    }
  }, [getResultsByModuleName]);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[DataClassificationDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[DataClassificationDiscoveryHook] Discovery output:', data.message);
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
        console.log('[DataClassificationDiscoveryHook] Discovery completed:', data);

        const discoveryResult = {
          id: `dataclassification-discovery-${Date.now()}`,
          name: 'Data Classification Discovery',
          moduleName: 'DataClassificationDiscovery',
          displayName: 'Data Classification Discovery',
          itemCount: data?.result?.totalItems || data?.result?.totalFilesScanned || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Scanned ${data?.result?.totalFilesScanned || 0} files, found ${data?.result?.totalSensitiveFiles || 0} with sensitive data (${data?.result?.totalPIIMatches || 0} PII, ${data?.result?.totalPHIMatches || 0} PHI, ${data?.result?.totalPCIMatches || 0} PCI)`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          result: data.result as DataClassificationDiscoveryResult,
          isDiscovering: false,
          progress: {
            current: 100,
            total: 100,
            message: 'Completed',
            percentage: 100,
          },
        }));

        addResult(discoveryResult);
        console.log(`[DataClassificationDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[DataClassificationDiscoveryHook] Discovery error:', data.error);
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
        console.warn('[DataClassificationDiscoveryHook] Discovery cancelled');
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
      console.error('[DataClassificationDiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    setShowExecutionDialog(true);
    const token = `dataclassification-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        message: 'Starting Data Classification discovery...',
        percentage: 0,
      },
    }));

    currentTokenRef.current = token;

    console.log(`[DataClassificationDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log('[DataClassificationDiscoveryHook] Parameters:', {
      IncludeSensitiveData: state.config.includeSensitiveData,
      IncludePII: state.config.includePII,
      IncludePHI: state.config.includePHI,
      IncludePCI: state.config.includePCI,
      IncludeConfidentialData: state.config.includeConfidentialData,
      ScanLocations: state.config.scanLocations,
      MaxFilesToScan: state.config.maxFilesToScan,
      FileExtensions: state.config.fileExtensions,
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'DataClassification',
        parameters: {
          IncludeSensitiveData: state.config.includeSensitiveData,
          IncludePII: state.config.includePII,
          IncludePHI: state.config.includePHI,
          IncludePCI: state.config.includePCI,
          IncludeConfidentialData: state.config.includeConfidentialData,
          ScanLocations: state.config.scanLocations,
          MaxFilesToScan: state.config.maxFilesToScan,
          FileExtensions: state.config.fileExtensions,
        },
        executionOptions: {
          timeout: 600000, // 10 minutes - data classification can be slow
          showWindow: false,
        },
        executionId: token,
      });

      console.log('[DataClassificationDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[DataClassificationDiscoveryHook] Discovery failed:', errorMessage);
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
    console.warn('[DataClassificationDiscoveryHook] Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[DataClassificationDiscoveryHook] Discovery cancellation requested successfully');

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
      console.error('[DataClassificationDiscoveryHook]', errorMessage);
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

  const updateConfig = useCallback((updates: Partial<DataClassificationDiscoveryConfig>) => {
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
