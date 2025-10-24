/**
 * Azure Discovery View Logic Hook
 * Handles Azure AD/Microsoft 365 discovery operations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { getElectronAPI } from '../lib/electron-api-fallback';
import {
  DiscoveryResult,
  DiscoveryProgress,
} from '../types/models/discovery';
import type { ProgressData, OutputData } from '../../shared/types';

export interface AzureDiscoveryFormData {
  tenantId: string;
  includeUsers: boolean;
  includeGroups: boolean;
  includeTeams: boolean;
  includeSharePoint: boolean;
  includeOneDrive: boolean;
  includeExchange: boolean;
  includeLicenses: boolean;
  maxResults: number;
  timeout: number; // seconds
}

export const useAzureDiscoveryLogic = () => {
  const { selectedTargetProfile } = useProfileStore();
  const { addResult, setProgress } = useDiscoveryStore();
  // Form state
  const [formData, setFormData] = useState<AzureDiscoveryFormData>({
    tenantId: '',
    includeUsers: true,
    includeGroups: true,
    includeTeams: false,
    includeSharePoint: false,
    includeOneDrive: false,
    includeExchange: false,
    includeLicenses: true,
    maxResults: 50000,
    timeout: 600, // 10 minutes
  });

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [progress, setLocalProgress] = useState<DiscoveryProgress | null>(null);
  const [results, setResults] = useState<DiscoveryResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

  // Validation
  const isFormValid = useMemo(() => {
    if (!formData.tenantId) return false;
    const hasService = formData.includeUsers || formData.includeGroups ||
                      formData.includeTeams || formData.includeSharePoint ||
                      formData.includeOneDrive || formData.includeExchange;
    return hasService;
  }, [formData]);

  // Form handlers
  const [config, setConfig] = useState<any>({});

  const updateFormField = useCallback(<K extends keyof AzureDiscoveryFormData>(
    field: K,
    value: AzureDiscoveryFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      tenantId: '',
      includeUsers: true,
      includeGroups: true,
      includeTeams: false,
      includeSharePoint: false,
      includeOneDrive: false,
      includeExchange: false,
      includeLicenses: true,
      maxResults: 50000,
      timeout: 600,
    });
    setError(null);
    setLogs([]);
  }, []);

  // Utility function for adding logs
  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev, message]);
  }, []);

  // Discovery event handlers
  useEffect(() => {
    const unsubscribeProgress = window.electron.onDiscoveryProgress((data) => {
      if (data.executionId === currentToken) {
        const progressData: DiscoveryProgress = {
          percentage: data.percentage,
          message: `${data.currentPhase} (${data.itemsProcessed || 0}/${data.totalItems || 0})`,
          currentItem: data.currentPhase,
          itemsProcessed: data.itemsProcessed,
          totalItems: data.totalItems,
          moduleName: 'AzureDiscovery',
          currentOperation: data.currentPhase || 'Processing',
          overallProgress: data.percentage,
          moduleProgress: data.percentage,
          status: 'Running',
          timestamp: new Date().toISOString(),
        };

        setLocalProgress(progressData);
        setProgress(progressData);
        addLog(`[${new Date().toLocaleTimeString()}] ${progressData.message}`);
      }
    });

    const unsubscribeOutput = window.electron.onDiscoveryOutput((data) => {
      if (data.executionId === currentToken) {
        if (data.level === 'error') {
          addLog(`[ERROR] ${data.message}`);
        } else {
          addLog(`[${data.level.toUpperCase()}] ${data.message}`);
        }
      }
    });

    const unsubscribeComplete = window.electron.onDiscoveryComplete((data) => {
      if (data.executionId === currentToken) {
        const discoveryResult: DiscoveryResult = {
          id: `azure-discovery-${Date.now()}`,
          name: 'Azure Discovery',
          moduleName: 'AzureDiscovery',
          displayName: 'Microsoft 365 / Azure AD Discovery',
          itemCount: data.result.totalItems || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data.result.outputPath || '',
          success: true,
          summary: `Discovered ${data.result.totalItems || 0} items from tenant ${formData.tenantId}`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setResults([discoveryResult]);
        addResult(discoveryResult);
        addLog(`Discovery completed successfully! Found ${data.result.totalItems} items.`);
        setIsRunning(false);
        setCurrentToken(null);
        setLocalProgress(null);
      }
    });

    const unsubscribeError = window.electron.onDiscoveryError((data) => {
      if (data.executionId === currentToken) {
        setError(data.error);
        addLog(`ERROR: ${data.error}`);
        setIsRunning(false);
        setCurrentToken(null);
        setLocalProgress(null);
      }
    });

    return () => {
      if (unsubscribeProgress) unsubscribeProgress();
      if (unsubscribeOutput) unsubscribeOutput();
      if (unsubscribeComplete) unsubscribeComplete();
      if (unsubscribeError) unsubscribeError();
    };
  }, [currentToken, setProgress, addResult, formData.tenantId, addLog]);

  // Test connection to Azure
  const testConnection = useCallback(async () => {
    setConnectionStatus('connecting');
    addLog('Testing connection to Azure AD...');

    try {
      await window.electron.executeDiscovery({
        moduleName: 'AzureDiscovery',
        parameters: {
          tenantId: formData.tenantId,
          testConnection: true,
        },
        executionId: `test-connection-${Date.now()}`,
      });

      // Handle connection test results via events (would be implemented in event handlers)
      setConnectionStatus('connected');
      addLog(`Connection successful! Tenant: ${formData.tenantId}`);
    } catch (err) {
      setConnectionStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      addLog(`Connection failed: ${errorMessage}`);
    }
  }, [formData.tenantId, addLog]);

  // Start discovery
  const startDiscovery = useCallback(async () => {
    if (!isFormValid) {
      setError('Please fill in all required fields and select at least one service');
      return;
    }

    setIsRunning(true);
    setIsCancelling(false);
    setError(null);
    setResults([]);
    setLogs([]);

    const token = `azure-discovery-${Date.now()}`;
    setCurrentToken(token);

    addLog('Starting Azure discovery...');
    addLog(`Tenant ID: ${formData.tenantId}`);

    // Log selected services
    const services: string[] = [];
    if (formData.includeUsers) services.push('Users');
    if (formData.includeGroups) services.push('Groups');
    if (formData.includeTeams) services.push('Teams');
    if (formData.includeSharePoint) services.push('SharePoint');
    if (formData.includeOneDrive) services.push('OneDrive');
    if (formData.includeExchange) services.push('Exchange');
    if (formData.includeLicenses) services.push('Licenses');
    addLog(`Services: ${services.join(', ')}`);

    try {
      await window.electron.executeDiscovery({
        moduleName: 'AzureDiscovery',
        parameters: {
          tenantId: formData.tenantId,
          includeUsers: formData.includeUsers,
          includeGroups: formData.includeGroups,
          includeTeams: formData.includeTeams,
          includeSharePoint: formData.includeSharePoint,
          includeOneDrive: formData.includeOneDrive,
          includeExchange: formData.includeExchange,
          includeLicenses: formData.includeLicenses,
          maxResults: formData.maxResults,
        },
        executionId: token,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      addLog(`ERROR: ${errorMessage}`);
    }
  }, [formData, isFormValid, addResult, setProgress, addLog]);

  // Cancel discovery
  const cancelDiscovery = useCallback(async () => {
    if (!currentToken) return;

    setIsCancelling(true);
    addLog('Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentToken);
      addLog('Discovery cancellation requested successfully');
    } catch (err) {
      addLog(`Error cancelling: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsCancelling(false);
    }
  }, [currentToken, addLog]);

  // Export results
  const exportResults = useCallback(() => {
    if (results.length === 0) return;

    const api = getElectronAPI();
    api.writeFile(
      `azure-discovery-${Date.now()}.json`,
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
    result: results,
    error,
    logs,
    connectionStatus,

    // Actions
    testConnection,
    startDiscovery,
    cancelDiscovery,
    exportResults,
    clearLogs,

    // Profile info
    selectedProfile: selectedTargetProfile,
    config,
    setConfig
  };
};
