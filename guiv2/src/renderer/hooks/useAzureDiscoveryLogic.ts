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

  // Progress streaming handler
  useEffect(() => {
    const api = getElectronAPI();
    if (!api || !api.onProgress) return undefined;

    const unsubscribe = api.onProgress((data: ProgressData) => {
      // Convert ProgressData to DiscoveryProgress
      const progressData: DiscoveryProgress = {
        percentage: data.percentage,
        message: data.message || 'Processing...',
        currentItem: data.currentItem,
        itemsProcessed: data.itemsProcessed,
        totalItems: data.totalItems,
        moduleName: 'AzureDiscovery',
        currentOperation: data.currentItem || 'Processing',
        overallProgress: data.percentage,
        moduleProgress: data.percentage,
        status: 'Running',
        timestamp: new Date().toISOString(),
      };

      if (progressData.moduleName === 'AzureDiscovery') {
        setLocalProgress(progressData);
        setProgress(progressData);
        addLog(`[${new Date().toLocaleTimeString()}] ${progressData.message}`);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [setProgress]);

  // Output streaming handler
  useEffect(() => {
    const api = getElectronAPI();
    if (!api || !api.onOutput) return undefined;

    const unsubscribe = api.onOutput((data: OutputData) => {
      // Convert OutputData to expected format
      if (data.type === 'error' && data.data) {
        addLog(`[ERROR] ${data.data}`);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev, message]);
  }, []);

  // Test connection to Azure
  const testConnection = useCallback(async () => {
    setConnectionStatus('connecting');
    addLog('Testing connection to Azure AD...');

    try {
      const api = getElectronAPI();
      const result = await api.executeModule({
        modulePath: 'Modules/Discovery/AzureDiscovery.psm1',
        functionName: 'Test-AzureConnection',
        parameters: {
          TenantId: formData.tenantId,
        },
        options: {
          timeout: 30000,
        }
      });

      if (result.success) {
        setConnectionStatus('connected');
        addLog(`Connection successful! Tenant: ${result.data.tenantName || formData.tenantId}`);
        if (result.data.tenantName) {
          addLog(`Tenant Name: ${result.data.tenantName}`);
        }
        if (result.data.domain) {
          addLog(`Primary Domain: ${result.data.domain}`);
        }
      } else {
        throw new Error(result.error || 'Connection test failed');
      }
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
      const api = getElectronAPI();
      const result = await api.executeModule({
        modulePath: 'Modules/Discovery/AzureDiscovery.psm1',
        functionName: 'Invoke-AzureDiscovery',
        parameters: {
          TenantId: formData.tenantId,
          IncludeUsers: formData.includeUsers,
          IncludeGroups: formData.includeGroups,
          IncludeTeams: formData.includeTeams,
          IncludeSharePoint: formData.includeSharePoint,
          IncludeOneDrive: formData.includeOneDrive,
          IncludeExchange: formData.includeExchange,
          IncludeLicenses: formData.includeLicenses,
          MaxResults: formData.maxResults,
        },
        options: {
          timeout: formData.timeout * 1000,
          cancellationToken: token,
          streamOutput: true,
        }
      });

      if (result.success) {
        const discoveryResult: DiscoveryResult = {
          id: `azure-discovery-${Date.now()}`,
          name: 'Azure Discovery',
          moduleName: 'AzureDiscovery',
          displayName: 'Microsoft 365 / Azure AD Discovery',
          itemCount: result.data.totalItems || 0,
          discoveryTime: new Date().toISOString(),
          duration: result.duration || 0,
          status: 'Completed',
          filePath: result.data.outputPath || '',
          success: true,
          summary: `Discovered ${result.data.totalItems || 0} items from tenant ${formData.tenantId}`,
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
        if (result.data.teams) addLog(`  - Teams: ${result.data.teams.length}`);
        if (result.data.sites) addLog(`  - SharePoint Sites: ${result.data.sites.length}`);
        if (result.data.drives) addLog(`  - OneDrive Drives: ${result.data.drives.length}`);
        if (result.data.mailboxes) addLog(`  - Mailboxes: ${result.data.mailboxes.length}`);
        if (result.data.licenses) addLog(`  - Licenses: ${result.data.licenses.length}`);
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
      const api = getElectronAPI();
      const cancelled = await api.cancelExecution(currentToken);
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
