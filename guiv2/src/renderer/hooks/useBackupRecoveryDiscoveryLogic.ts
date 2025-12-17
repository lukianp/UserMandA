/**
 * Backup and Recovery Discovery Logic Hook
 * Contains all business logic for backup and recovery systems discovery
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import type { PowerShellLog } from '../components/molecules/PowerShellExecutionDialog';

interface BackupRecoveryDiscoveryConfig {
  includeBackupJobs: boolean;
  includeRecoveryPoints: boolean;
  includeBackupHistory: boolean;
  includeStorageLocations: boolean;
  maxHistoryDays: number;
}

interface BackupRecoveryDiscoveryResult {
  totalBackupJobs?: number;
  totalRecoveryPoints?: number;
  totalItems?: number;
  outputPath?: string;
  backupJobs?: any[];
  recoveryPoints?: any[];
  backupHistory?: any[];
  storageLocations?: any[];
  statistics?: {
    totalBackupSize?: number;
    successfulBackups?: number;
    failedBackups?: number;
    averageBackupDuration?: number;
  };
}

interface BackupRecoveryDiscoveryState {
  config: BackupRecoveryDiscoveryConfig;
  result: BackupRecoveryDiscoveryResult | null;
  isDiscovering: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
}

export const useBackupRecoveryDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  // PowerShell Execution Dialog state
  const [logs, setLogs] = useState<PowerShellLog[]>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const addLog = useCallback((level: PowerShellLog['level'], message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, level, message }]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const [state, setState] = useState<BackupRecoveryDiscoveryState>({
    config: {
      includeBackupJobs: true,
      includeRecoveryPoints: true,
      includeBackupHistory: true,
      includeStorageLocations: true,
      maxHistoryDays: 30,
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
    console.log('[BackupRecoveryDiscoveryHook] Loading previous results');
    const previousResults = getResultsByModuleName('BackupRecoveryDiscovery');
    if (previousResults && previousResults.length > 0) {
      const latestResult = previousResults[previousResults.length - 1];
      console.log('[BackupRecoveryDiscoveryHook] Found previous result:', latestResult);
      setState((prev) => ({
        ...prev,
        result: latestResult.additionalData as BackupRecoveryDiscoveryResult,
      }));
    }
  }, [getResultsByModuleName]);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[BackupRecoveryDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[BackupRecoveryDiscoveryHook] Discovery output:', data.message);
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
        console.log('[BackupRecoveryDiscoveryHook] Discovery completed:', data);

        const discoveryResult = {
          id: `backuprecovery-discovery-${Date.now()}`,
          name: 'Backup & Recovery Discovery',
          moduleName: 'BackupRecoveryDiscovery',
          displayName: 'Backup & Recovery Discovery',
          itemCount: data?.result?.totalItems || data?.result?.totalBackupJobs || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalBackupJobs || 0} backup jobs and ${data?.result?.totalRecoveryPoints || 0} recovery points`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          result: data.result as BackupRecoveryDiscoveryResult,
          isDiscovering: false,
          progress: {
            current: 100,
            total: 100,
            message: 'Completed',
            percentage: 100,
          },
        }));

        addResult(discoveryResult);
        console.log(`[BackupRecoveryDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[BackupRecoveryDiscoveryHook] Discovery error:', data.error);
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
        console.warn('[BackupRecoveryDiscoveryHook] Discovery cancelled');
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
      console.error('[BackupRecoveryDiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    const token = `backuprecovery-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        message: 'Starting Backup & Recovery discovery...',
        percentage: 0,
      },
    }));

    currentTokenRef.current = token;

    // Open PowerShell execution dialog
    setShowExecutionDialog(true);
    addLog('info', 'Starting Backup Recovery discovery...');

    console.log(`[BackupRecoveryDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log('[BackupRecoveryDiscoveryHook] Parameters:', {
      IncludeBackupJobs: state.config.includeBackupJobs,
      IncludeRecoveryPoints: state.config.includeRecoveryPoints,
      IncludeBackupHistory: state.config.includeBackupHistory,
      IncludeStorageLocations: state.config.includeStorageLocations,
      MaxHistoryDays: state.config.maxHistoryDays,
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'BackupRecovery',
        parameters: {
          IncludeBackupJobs: state.config.includeBackupJobs,
          IncludeRecoveryPoints: state.config.includeRecoveryPoints,
          IncludeBackupHistory: state.config.includeBackupHistory,
          IncludeStorageLocations: state.config.includeStorageLocations,
          MaxHistoryDays: state.config.maxHistoryDays,
        },
        executionOptions: {
          timeout: 300000, // 5 minutes
          showWindow: false,
        },
        executionId: token,
      });

      console.log('[BackupRecoveryDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[BackupRecoveryDiscoveryHook] Discovery failed:', errorMessage);
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
    addLog('warning', 'Cancelling Backup Recovery discovery...');
    console.warn('[BackupRecoveryDiscoveryHook] Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[BackupRecoveryDiscoveryHook] Discovery cancellation requested successfully');
      addLog('info', 'Backup Recovery discovery cancelled');

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
      console.error('[BackupRecoveryDiscoveryHook]', errorMessage);
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
      addLog('error', 'Failed to cancel discovery');
    }
  }, [state.isDiscovering, addLog]);

  const updateConfig = useCallback((updates: Partial<BackupRecoveryDiscoveryConfig>) => {
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
    isCancelling,
    progress: state.progress,
    error: state.error,
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    clearError,
    logs,
    clearLogs,
    showExecutionDialog,
    setShowExecutionDialog,
  };
};
