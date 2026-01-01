/**
 * Azure M365 Discovery View Logic Hook
 * Handles M365 discovery operations (Exchange, SharePoint, Teams)
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import {
  DiscoveryResult,
  DiscoveryProgress,
} from '../types/models/discovery';
import type { PowerShellLog } from '../components/molecules/PowerShellExecutionDialog';

export interface AzureM365DiscoveryFormData {
  includeExchange: boolean;
  includeSharePoint: boolean;
  includeTeams: boolean;
  timeout: number;
  showWindow: boolean;
}

export const useAzureM365DiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, setProgress, getResultsByModuleName } = useDiscoveryStore();

  // Form state
  const [formData, setFormData] = useState<AzureM365DiscoveryFormData>({
    includeExchange: true,
    includeSharePoint: true,
    includeTeams: true,
    timeout: 900,
    showWindow: false,
  });

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const currentTokenRef = useRef<string | null>(null);
  const [progress, setLocalProgress] = useState<DiscoveryProgress | null>(null);
  const [results, setResults] = useState<DiscoveryResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<PowerShellLog[]>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);

  // Validation
  const isFormValid = useMemo(() => {
    if (!selectedSourceProfile) return false;
    return formData.includeExchange || formData.includeSharePoint || formData.includeTeams;
  }, [formData, selectedSourceProfile]);

  // Form handlers
  const updateFormField = useCallback(<K extends keyof AzureM365DiscoveryFormData>(
    field: K,
    value: AzureM365DiscoveryFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      includeExchange: true,
      includeSharePoint: true,
      includeTeams: true,
      timeout: 900,
      showWindow: false,
    });
    setError(null);
    setLogs([]);
  }, []);

  const addLog = useCallback((message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, level }]);
  }, []);

  // Load previous results
  useEffect(() => {
    const previousResults = getResultsByModuleName('AzureM365Discovery');
    if (previousResults && previousResults.length > 0) {
      setResults(previousResults);
      addLog(`Restored ${previousResults.length} previous discovery result(s)`, 'info');
    }
  }, [getResultsByModuleName, addLog]);

  // Event handlers
  useEffect(() => {
    const unsubscribeProgress = window.electron.onDiscoveryProgress((data) => {
      if (data.executionId === currentTokenRef.current) {
        const progressData: DiscoveryProgress = {
          percentage: data.percentage,
          message: `${data.currentPhase} (${data.itemsProcessed || 0}/${data.totalItems || 0})`,
          currentItem: data.currentPhase,
          itemsProcessed: data.itemsProcessed,
          totalItems: data.totalItems,
          moduleName: 'AzureM365Discovery',
          currentOperation: data.currentPhase || 'Processing',
          overallProgress: data.percentage,
          moduleProgress: data.percentage,
          status: 'Running',
          timestamp: new Date().toISOString(),
        };
        setLocalProgress(progressData);
        setProgress(progressData);
        addLog(progressData.message, 'info');
      }
    });

    const unsubscribeComplete = window.electron.onDiscoveryComplete((data) => {
      if (data.executionId === currentTokenRef.current) {
        const recordCount = data?.result?.totalItems || data?.result?.RecordCount || 0;
        const discoveryResult: DiscoveryResult = {
          id: `azure-m365-discovery-${Date.now()}`,
          name: 'Azure M365 Discovery',
          moduleName: 'AzureM365Discovery',
          displayName: 'Microsoft 365 Discovery',
          itemCount: recordCount,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${recordCount} M365 items`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };
        setResults([discoveryResult]);
        addResult(discoveryResult);
        addLog(`Discovery completed! Found ${recordCount} items.`, 'success');
        setIsRunning(false);
        setIsCancelling(false);
        currentTokenRef.current = null;
        setLocalProgress(null);
      }
    });

    const unsubscribeError = window.electron.onDiscoveryError((data) => {
      if (data.executionId === currentTokenRef.current) {
        setError(data.error);
        addLog(`${data.error}`, 'error');
        setIsRunning(false);
        setIsCancelling(false);
        currentTokenRef.current = null;
        setLocalProgress(null);
      }
    });

    const unsubscribeCancelled = window.electron.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        addLog('Discovery cancelled by user', 'warning');
        setIsRunning(false);
        setIsCancelling(false);
        currentTokenRef.current = null;
        setLocalProgress(null);
      }
    });

    return () => {
      unsubscribeProgress?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeCancelled?.();
    };
  }, []); // ✅ CRITICAL: Empty dependency array for event listeners

  // Start discovery
  const startDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      setError('No company profile selected');
      addLog('No company profile selected', 'error');
      return;
    }

    if (!isFormValid) {
      setError('Please select at least one M365 service to discover');
      addLog('Please select at least one M365 service', 'error');
      return;
    }

    setIsRunning(true);
    setIsCancelling(false);
    setError(null);
    setResults([]);
    setLogs([]);
    setShowExecutionDialog(true);

    const token = `azure-m365-discovery-${Date.now()}`;
    currentTokenRef.current = token;

    addLog(`Starting M365 discovery for ${selectedSourceProfile.companyName}...`, 'info');

    const services: string[] = [];
    if (formData.includeExchange) services.push('Exchange');
    if (formData.includeSharePoint) services.push('SharePoint');
    if (formData.includeTeams) services.push('Teams');
    addLog(`Discovering: ${services.join(', ')}`, 'info');

    try {
      await window.electron.executeDiscovery({
        moduleName: 'AzureM365Discovery',
        parameters: {
          IncludeExchange: formData.includeExchange,
          IncludeSharePoint: formData.includeSharePoint,
          IncludeTeams: formData.includeTeams,
          CompanyName: selectedSourceProfile.companyName,
          TenantId: selectedSourceProfile.tenantId,
          ClientId: selectedSourceProfile.clientId,
          ClientSecret: selectedSourceProfile.credential,
        },
        executionOptions: {
          timeout: formData.timeout * 1000,
          showWindow: formData.showWindow,
        },
        executionId: token,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addLog(`Failed to start discovery: ${errorMessage}`, 'error');
      setIsRunning(false);
    }
  }, [selectedSourceProfile, formData, isFormValid, addLog]);

  // Cancel discovery
  const cancelDiscovery = useCallback(async () => {
    if (!currentTokenRef.current) return;
    setIsCancelling(true);
    addLog('Cancelling discovery...', 'warning');
    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
    } catch (err) {
      addLog('Failed to cancel discovery', 'error');
    }
  }, [addLog]);

  return {
    // Form
    formData,
    updateFormField,
    resetForm,
    isFormValid,

    // Execution
    isRunning,
    isCancelling,
    progress,
    results,
    error,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,

    // Actions
    startDiscovery,
    cancelDiscovery,

    // Profile
    selectedSourceProfile,
  };
};

export default useAzureM365DiscoveryLogic;


