/**
 * Domain Discovery View Logic Hook
 * Handles AD domain discovery operations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import {
  DiscoveryResult,
  DiscoveryProgress,
  DiscoveryExecutionOptions,
  DiscoveryModuleStatus
} from '../types/models/discovery';

export interface DomainDiscoveryFormData {
  domainController: string;
  searchBase: string;
  includeUsers: boolean;
  includeGroups: boolean;
  includeComputers: boolean;
  includeOUs: boolean;
  maxResults: number;
  timeout: number; // seconds
  credentials?: {
    username: string;
    password: string;
  };
}

export const useDomainDiscoveryLogic = () => {
  const { selectedSourceProfile } = useProfileStore();
  const { addResult, setProgress } = useDiscoveryStore();

  // Form state
  const [formData, setFormData] = useState<DomainDiscoveryFormData>({
    domainController: '',
    searchBase: '',
    includeUsers: true,
    includeGroups: true,
    includeComputers: false,
    includeOUs: false,
    maxResults: 10000,
    timeout: 300, // 5 minutes
  });

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [progress, setLocalProgress] = useState<DiscoveryProgress | null>(null);
  const [results, setResults] = useState<DiscoveryResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Validation
  const isFormValid = useMemo(() => {
    if (!formData.domainController) return false;
    if (!formData.includeUsers && !formData.includeGroups && !formData.includeComputers && !formData.includeOUs) {
      return false;
    }
    return true;
  }, [formData]);

  // Form handlers
  const updateFormField = useCallback(<K extends keyof DomainDiscoveryFormData>(
    field: K,
    value: DomainDiscoveryFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      domainController: '',
      searchBase: '',
      includeUsers: true,
      includeGroups: true,
      includeComputers: false,
      includeOUs: false,
      maxResults: 10000,
      timeout: 300,
    });
    setError(null);
    setLogs([]);
  }, []);

  // Progress streaming handler
  useEffect(() => {
    if (!window.electronAPI.onProgress) return;

    const unsubscribe = window.electronAPI.onProgress((data) => {
      // Convert ProgressData to DiscoveryProgress
      const progressData: DiscoveryProgress = {
        percentage: data.percentage,
        message: data.message,
        currentItem: data.currentItem,
        itemsProcessed: data.itemsProcessed,
        totalItems: data.totalItems,
        moduleName: 'DomainDiscovery',
        currentOperation: data.currentItem || 'Processing',
        overallProgress: data.percentage,
        moduleProgress: data.percentage,
        status: 'Running',
        timestamp: new Date().toISOString(),
      };

      if (progressData.moduleName === 'DomainDiscovery') {
        setLocalProgress(progressData);
        setProgress(progressData);
        addLog(`[${new Date().toLocaleTimeString()}] ${progressData.message}`);
      }
    });

    return () => unsubscribe();
  }, [setProgress]);

  // Output streaming handler
  useEffect(() => {
    if (!window.electronAPI.onOutput) return;

    const unsubscribe = window.electronAPI.onOutput((data) => {
      // Convert OutputData to expected format
      if (data.type === 'error' && data.data) {
        addLog(`[ERROR] ${data.data}`);
      }
    });

    return () => unsubscribe();
  }, []);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev, message]);
  }, []);

  // Start discovery
  const startDiscovery = useCallback(async () => {
    if (!isFormValid) {
      setError('Please fill in all required fields');
      return;
    }

    setIsRunning(true);
    setIsCancelling(false);
    setError(null);
    setResults([]);
    setLogs([]);

    const token = `discovery-${Date.now()}`;
    setCurrentToken(token);

    addLog('Starting domain discovery...');
    addLog(`Target: ${formData.domainController}`);
    addLog(`Search Base: ${formData.searchBase || 'Root'}`);

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/ActiveDirectoryDiscovery.psm1',
        functionName: 'Invoke-DomainDiscovery',
        parameters: {
          DomainController: formData.domainController,
          SearchBase: formData.searchBase || null,
          IncludeUsers: formData.includeUsers,
          IncludeGroups: formData.includeGroups,
          IncludeComputers: formData.includeComputers,
          IncludeOUs: formData.includeOUs,
          MaxResults: formData.maxResults,
          Credentials: formData.credentials || null,
        },
        options: {
          timeout: formData.timeout * 1000,
          cancellationToken: token,
          streamOutput: true,
        }
      });

      if (result.success) {
        const discoveryResult: DiscoveryResult = {
          id: `discovery-${Date.now()}`,
          name: 'Domain Discovery',
          moduleName: 'DomainDiscovery',
          displayName: 'Active Directory Domain Discovery',
          itemCount: result.data.totalItems || 0,
          discoveryTime: new Date().toISOString(),
          duration: result.duration || 0,
          status: 'Completed',
          filePath: result.data.outputPath || '',
          success: true,
          summary: `Discovered ${result.data.totalItems || 0} items from ${formData.domainController}`,
          errorMessage: '',
          additionalData: result.data,
          createdAt: new Date().toISOString(),
        };

        setResults([discoveryResult]);
        addResult(discoveryResult);
        addLog(`Discovery completed successfully! Found ${result.data.totalItems} items.`);

        // Show breakdown
        if (result.data.users) addLog(`  - Users: ${result.data.users.length}`);
        if (result.data.groups) addLog(`  - Groups: ${result.data.groups.length}`);
        if (result.data.computers) addLog(`  - Computers: ${result.data.computers.length}`);
        if (result.data.organizationalUnits) addLog(`  - OUs: ${result.data.organizationalUnits.length}`);
      } else {
        throw new Error(result.error || 'Discovery failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      addLog(`ERROR: ${errorMessage}`);
    } finally {
      setIsRunning(false);
      setCurrentToken(null);
      setLocalProgress(null);
    }
  }, [formData, isFormValid, addResult, setProgress, addLog]);

  // Cancel discovery
  const cancelDiscovery = useCallback(async () => {
    if (!currentToken) return;

    setIsCancelling(true);
    addLog('Cancelling discovery...');

    try {
      const cancelled = await window.electronAPI.cancelExecution(currentToken);
      if (cancelled) {
        addLog('Discovery cancelled successfully');
        setIsRunning(false);
        setCurrentToken(null);
        setLocalProgress(null);
      } else {
        addLog('Failed to cancel discovery - may have already completed');
      }
    } catch (err) {
      addLog(`Error cancelling: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsCancelling(false);
    }
  }, [currentToken, addLog]);

  // Export results
  const exportResults = useCallback(() => {
    if (results.length === 0) return;

    // This will be handled by ExportDialog
    window.electronAPI.writeFile(
      `discovery-${Date.now()}.json`,
      JSON.stringify(results, null, 2)
    );
  }, [results]);

  // Clear logs
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    // Form state
    formData,
    updateFormField,
    resetForm,
    isFormValid,

    // Execution state
    isRunning,
    isCancelling,
    progress,
    results,
    error,
    logs,

    // Actions
    startDiscovery,
    cancelDiscovery,
    exportResults,
    clearLogs,

    // Profile info
    selectedProfile: selectedSourceProfile,
  };
};
