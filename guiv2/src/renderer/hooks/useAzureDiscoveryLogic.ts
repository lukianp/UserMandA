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
import type { PowerShellLog } from '../components/molecules/PowerShellExecutionDialog';

export interface AzureDiscoveryFormData {
  includeUsers: boolean;
  includeGroups: boolean;
  includeTeams: boolean;
  includeSharePoint: boolean;
  includeOneDrive: boolean;
  includeExchange: boolean;
  includeLicenses: boolean;
  maxResults: number;
  timeout: number; // seconds
  showWindow: boolean; // Show PowerShell window during execution
}

export const useAzureDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, setProgress } = useDiscoveryStore();
  // Form state
  const [formData, setFormData] = useState<AzureDiscoveryFormData>({
    includeUsers: true,
    includeGroups: true,
    includeTeams: false,
    includeSharePoint: false,
    includeOneDrive: false,
    includeExchange: false,
    includeLicenses: true,
    maxResults: 50000,
    timeout: 1800, // 30 minutes (allows time for module installation on first run)
    showWindow: false, // Don't show external PowerShell window - use integrated dialog instead
  });

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [progress, setLocalProgress] = useState<DiscoveryProgress | null>(null);
  const [results, setResults] = useState<DiscoveryResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<PowerShellLog[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);

  // Validation
  const isFormValid = useMemo(() => {
    if (!selectedSourceProfile) return false;
    const hasService = formData.includeUsers || formData.includeGroups ||
                      formData.includeTeams || formData.includeSharePoint ||
                      formData.includeOneDrive || formData.includeExchange;
    return hasService;
  }, [formData, selectedSourceProfile]);

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
      includeUsers: true,
      includeGroups: true,
      includeTeams: false,
      includeSharePoint: false,
      includeOneDrive: false,
      includeExchange: false,
      includeLicenses: true,
      maxResults: 50000,
      timeout: 600,
      showWindow: false, // Don't show external PowerShell window
    });
    setError(null);
    setLogs([]);
  }, []);

  // Utility function for adding logs
  const addLog = useCallback((message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, level }]);
  }, []);

  // Safety mechanism: Reset state if discovery is running but hasn't received events for too long
  useEffect(() => {
    if (!isRunning || !currentToken) return;

    let lastEventTime = Date.now();
    const eventMonitor = setInterval(() => {
      const timeSinceLastEvent = Date.now() - lastEventTime;
      // If no events for 5 minutes and process is marked as running, assume it crashed
      if (timeSinceLastEvent > 5 * 60 * 1000) {
        addLog('No activity detected for 5 minutes. Resetting state...', 'warning');
        setIsRunning(false);
        setIsCancelling(false);
        setCurrentToken(null);
        setLocalProgress(null);
      }
    }, 30000); // Check every 30 seconds

    // Update last event time whenever logs change
    const updateEventTime = () => {
      lastEventTime = Date.now();
    };

    // Monitor logs array changes as indicator of activity
    updateEventTime();

    return () => {
      clearInterval(eventMonitor);
    };
  }, [isRunning, currentToken, logs.length, addLog]);

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
        addLog(progressData.message, 'info');
      }
    });

    const unsubscribeOutput = window.electron.onDiscoveryOutput((data) => {
      if (data.executionId === currentToken) {
        const logLevel = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warning' : 'info';
        addLog(data.message, logLevel);
      }
    });

    const unsubscribeComplete = window.electron.onDiscoveryComplete((data) => {
      if (data.executionId === currentToken) {
        const discoveryResult: DiscoveryResult = {
          id: `azure-discovery-${Date.now()}`,
          name: 'Azure Discovery',
          moduleName: 'AzureDiscovery',
          displayName: 'Microsoft 365 / Azure AD Discovery',
          itemCount: data?.result?.totalItems || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalItems || 0} items from ${selectedSourceProfile?.companyName || 'tenant'}`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setResults([discoveryResult]);
        addResult(discoveryResult);
        addLog(`Discovery completed successfully! Found ${data?.result?.totalItems} items.`, 'success');
        setIsRunning(false);
        setIsCancelling(false);
        setCurrentToken(null);
        setLocalProgress(null);
      }
    });

    const unsubscribeError = window.electron.onDiscoveryError((data) => {
      if (data.executionId === currentToken) {
        setError(data.error);
        addLog(`${data.error}`, 'error');
        setIsRunning(false);
        setIsCancelling(false);
        setCurrentToken(null);
        setLocalProgress(null);
      }
    });

    const unsubscribeCancelled = window.electron.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentToken) {
        addLog('Discovery cancelled by user', 'warning');
        setIsRunning(false);
        setIsCancelling(false);
        setCurrentToken(null);
        setLocalProgress(null);
      }
    });

    return () => {
      if (unsubscribeProgress) unsubscribeProgress();
      if (unsubscribeOutput) unsubscribeOutput();
      if (unsubscribeComplete) unsubscribeComplete();
      if (unsubscribeError) unsubscribeError();
      if (unsubscribeCancelled) unsubscribeCancelled();
    };
  }, [currentToken, setProgress, addResult, selectedSourceProfile, addLog]);

  // Test connection to Azure
  const testConnection = useCallback(async () => {
    if (!selectedSourceProfile) {
      setConnectionStatus('error');
      addLog('No company profile selected', 'error');
      return;
    }

    setConnectionStatus('connecting');
    addLog('Testing connection to Azure AD...', 'info');

    try {
      const electronAPI = getElectronAPI();

      await electronAPI.executeDiscoveryModule(
        'Azure',
        selectedSourceProfile.companyName,
        {
          TestConnection: true,
        },
        {
          timeout: 30000,
        }
      );

      setConnectionStatus('connected');
      addLog(`Connection successful! Tenant: ${selectedSourceProfile.tenantId || selectedSourceProfile.companyName}`, 'success');
    } catch (err) {
      setConnectionStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      addLog(`Connection failed: ${errorMessage}`, 'error');
    }
  }, [selectedSourceProfile, addLog]);

  // Start discovery
  const startDiscovery = useCallback(async () => {
    // Check if a profile is selected
    if (!selectedSourceProfile) {
      const errorMessage = 'No company profile selected. Please select a profile first.';
      setError(errorMessage);
      addLog(errorMessage, 'error');
      return;
    }

    if (!isFormValid) {
      const errorMessage = 'Please select at least one service to discover';
      setError(errorMessage);
      addLog(errorMessage, 'error');
      return;
    }

    setIsRunning(true);
    setIsCancelling(false);
    setError(null);
    setResults([]);
    setLogs([]);
    setShowExecutionDialog(true);

    const token = `azure-discovery-${Date.now()}`;
    setCurrentToken(token);

    console.log(`[AzureDiscoveryHook] Starting Azure discovery for company: ${selectedSourceProfile.companyName}`);
    addLog(`Starting Azure discovery for ${selectedSourceProfile.companyName}...`, 'info');
    addLog(`Tenant ID: ${selectedSourceProfile.tenantId || 'N/A'}`, 'info');
    addLog(`Client ID: ${selectedSourceProfile.clientId || 'N/A'}`, 'info');
    addLog(`Has credentials: ${selectedSourceProfile.clientId ? 'Yes' : 'No'}`, 'info');

    // Log selected services
    const services: string[] = [];
    if (formData.includeUsers) services.push('Users');
    if (formData.includeGroups) services.push('Groups');
    if (formData.includeTeams) services.push('Teams');
    if (formData.includeSharePoint) services.push('SharePoint');
    if (formData.includeOneDrive) services.push('OneDrive');
    if (formData.includeExchange) services.push('Exchange');
    if (formData.includeLicenses) services.push('Licenses');
    addLog(`Services: ${services.join(', ')}`, 'info');

    console.log(`[AzureDiscoveryHook] Parameters:`, {
      includeUsers: formData.includeUsers,
      includeGroups: formData.includeGroups,
      includeTeams: formData.includeTeams,
      includeSharePoint: formData.includeSharePoint,
      includeOneDrive: formData.includeOneDrive,
      includeExchange: formData.includeExchange,
      includeLicenses: formData.includeLicenses,
    });

    try {
      // Use the correct discovery:execute handler that emits streaming events
      const result = await window.electron.executeDiscovery({
        moduleName: 'Azure',
        parameters: {
          IncludeUsers: formData.includeUsers,
          IncludeGroups: formData.includeGroups,
          IncludeTeams: formData.includeTeams,
          IncludeSharePoint: formData.includeSharePoint,
          IncludeOneDrive: formData.includeOneDrive,
          IncludeExchange: formData.includeExchange,
          IncludeLicenses: formData.includeLicenses,
          MaxResults: formData.maxResults,
          timeout: formData.timeout * 1000, // Convert to milliseconds
          showWindow: formData.showWindow, // Pass showWindow parameter
        },
        executionId: token, // Pass the token so events are matched correctly
      });

      console.log('[AzureDiscoveryHook] Discovery execution completed:', result);

      // Note: Completion will be handled by the discovery:complete event listener
      // Don't set isRunning to false here as the event listener will do it
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      addLog(errorMessage, 'error');
      setIsRunning(false);
      setCurrentToken(null);
      setLocalProgress(null);
    }
  }, [formData, isFormValid, selectedSourceProfile, addLog]);

  // Cancel discovery
  const cancelDiscovery = useCallback(async () => {
    if (!currentToken) return;

    setIsCancelling(true);
    addLog('Cancelling discovery...', 'warning');

    try {
      await window.electron.cancelDiscovery(currentToken);
      addLog('Discovery cancellation requested successfully', 'info');

      // Set a timeout to reset state in case the cancelled event doesn't fire
      setTimeout(() => {
        setIsRunning(false);
        setIsCancelling(false);
        setCurrentToken(null);
        setLocalProgress(null);
        addLog('Discovery cancelled - reset to start state', 'warning');
      }, 2000);
    } catch (err) {
      addLog(`Error cancelling: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
      // Reset state even on error
      setIsRunning(false);
      setIsCancelling(false);
      setCurrentToken(null);
      setLocalProgress(null);
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
    showExecutionDialog,
    setShowExecutionDialog,

    // Actions
    testConnection,
    startDiscovery,
    cancelDiscovery,
    exportResults,
    clearLogs,

    // Profile info
    selectedProfile: selectedSourceProfile,
    config,
    setConfig,

    // Additional properties for view compatibility
    isDiscovering: isRunning,
    currentResult: results,
  };
};
