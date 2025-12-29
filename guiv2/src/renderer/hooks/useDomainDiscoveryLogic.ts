/**
 * Domain Discovery Logic Hook
 * ✅ FIXED: Now uses event-driven architecture with streaming support
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

export interface DomainDiscoveryFormData {
  domainController: string;
  searchBase: string;
  maxResults: number;
  timeout: number;
  includeUsers: boolean;
  includeGroups: boolean;
  includeComputers: boolean;
  includeOUs: boolean;
}

export interface DomainDiscoveryProgress {
  currentOperation: string;
  overallProgress: number;
}

export interface DomainDiscoveryResult {
  users: number;
  groups: number;
  computers: number;
  ous: number;
  timestamp: string;
}

export interface DomainDiscoveryLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
}

/**
 * Log entry interface for PowerShellExecutionDialog
 */
export interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

export interface SelectedProfile {
  id: string;
  name: string;
}

export interface DomainDiscoveryHookReturn {
  // State
  isRunning: boolean;
  isCancelling: boolean;
  isComplete: boolean;
  progress: DomainDiscoveryProgress | null;
  results: DomainDiscoveryResult[] | null;
  logs: LogEntry[];
  showExecutionDialog: boolean;
  error: string | null;
  formData: DomainDiscoveryFormData;
  selectedProfile: SelectedProfile | null;

  // Computed
  isFormValid: boolean;

  // Methods
  startDiscovery: () => Promise<void>;
  stopDiscovery: () => void;
  resetDiscovery: () => void;
  clearLogs: () => void;
  setShowExecutionDialog: (show: boolean) => void;
  updateFormData: (data: Partial<DomainDiscoveryFormData>) => void;
  updateFormField: (field: keyof DomainDiscoveryFormData, value: any) => void;
  resetForm: () => void;
  cancelDiscovery: () => void;
  exportResults: () => void;
}

/**
 * Custom hook for Domain discovery logic
 * ✅ FIXED: Now uses event-driven executeDiscovery API
 */
export function useDomainDiscoveryLogic(): DomainDiscoveryHookReturn {
  // Get selected company profile from store
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult } = useDiscoveryStore();

  const [isRunning, setIsRunning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState<DomainDiscoveryProgress | null>(null);
  const [results, setResults] = useState<DomainDiscoveryResult[] | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<DomainDiscoveryFormData>({
    domainController: 'dc.contoso.com',
    searchBase: '',
    maxResults: 10000,
    timeout: 300,
    includeUsers: true,
    includeGroups: true,
    includeComputers: true,
    includeOUs: true,
  });

  const [selectedProfile, setSelectedProfile] = useState<SelectedProfile | null>({
    id: 'test-profile',
    name: 'Test Profile',
  });

  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const currentTokenRef = useRef<string | null>(null); // ✅ ADDED: Ref for event matching

  // Computed values
  const isFormValid = !!(formData.domainController && formData.domainController.trim() !== '');

  const [config, setConfig] = useState<any>({});

  /**
   * Add a log entry
   */
  const addLog = useCallback((message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      message,
      level,
    };
    setLogs(prev => [...prev, entry]);
  }, []);

  // ✅ ADDED: Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[DomainDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const message = data.message || '';
        let level: 'info' | 'success' | 'warning' | 'error' = 'info';
        if (message.toLowerCase().includes('error') || message.toLowerCase().includes('failed')) {
          level = 'error';
        } else if (message.toLowerCase().includes('warning') || message.toLowerCase().includes('warn')) {
          level = 'warning';
        } else if (message.toLowerCase().includes('success') || message.toLowerCase().includes('completed') || message.toLowerCase().includes('found')) {
          level = 'success';
        }
        addLog(message, level);
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setIsRunning(false);
        setIsCancelling(false);
        setIsComplete(true);
        setCurrentToken(null);

        const result = {
          id: `domain-discovery-${Date.now()}`,
          name: 'Domain Discovery',
          moduleName: 'Domain',
          displayName: 'Domain Discovery',
          itemCount: data?.result?.totalItems || data?.result?.RecordCount || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalItems || 0} domain objects`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        // Set results from discovery data
        if (data.result) {
          setResults([data.result]);
        }

        addResult(result); // ✅ ADDED: Store in discovery store
        addLog(`Discovery completed! Found ${result.itemCount} items.`, 'success');
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setIsRunning(false);
        setIsCancelling(false);
        setError(data.error);
        addLog(`Discovery failed: ${data.error}`, 'error');
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setIsRunning(false);
        setIsCancelling(false);
        setCurrentToken(null);
        addLog('Discovery cancelled by user', 'warning');
      }
    });

    return () => {
      unsubscribeOutput?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeCancelled?.();
    };
  }, []); // ✅ FIXED: Empty dependency array - critical for proper event handling

  /**
   * Start the Domain discovery process
   * ✅ FIXED: Now uses event-driven executeDiscovery API
   */
  const startDiscovery = useCallback(async () => {
    if (isRunning) return;

    // Check if a profile is selected
    if (!selectedSourceProfile) {
      const errorMessage = 'No company profile selected. Please select a profile first.';
      setError(errorMessage);
      addLog(errorMessage);
      return;
    }

    setIsRunning(true);
    setIsCancelling(false);
    setIsComplete(false);
    setError(null);
    setProgress({
      currentOperation: 'Connecting to domain controller...',
      overallProgress: 0,
    });
    setLogs([{ timestamp: new Date().toISOString(), message: 'Starting discovery...', level: 'info' as const }]);
    setShowExecutionDialog(true);

    const token = `domain-discovery-${Date.now()}`;
    setCurrentToken(token);
    currentTokenRef.current = token; // ✅ CRITICAL: Update ref for event matching

    addLog(`Starting Domain discovery for ${selectedSourceProfile.companyName}...`);

    try {
      // ✅ FIXED: Use new event-driven API instead of mock code
      const result = await window.electron.executeDiscovery({
        moduleName: 'Domain',
        parameters: {
          DomainController: formData.domainController,
          SearchBase: formData.searchBase,
          MaxResults: formData.maxResults,
          IncludeUsers: formData.includeUsers,
          IncludeGroups: formData.includeGroups,
          IncludeComputers: formData.includeComputers,
          IncludeOUs: formData.includeOUs,
        },
        executionOptions: {  // ✅ ADDED: Missing execution options
          timeout: formData.timeout * 1000, // Convert to ms
          showWindow: false, // Use integrated dialog
        },
        executionId: token, // ✅ CRITICAL: Pass token for event matching
      });

      console.log('[DomainDiscoveryHook] Discovery execution initiated:', result);
      addLog('Discovery execution started - monitoring progress...');

      // Note: Completion will be handled by the discovery:complete event listener
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred during discovery';
      setError(errorMessage);
      addLog(errorMessage);
      setIsRunning(false);
      setCurrentToken(null);
      setProgress(null);
    }
  }, [isRunning, formData, addLog, selectedSourceProfile, addResult]);

  /**
   * Cancel the ongoing discovery process
   * ✅ FIXED: Now properly cancels PowerShell process
   */
  const stopDiscovery = useCallback(() => {
    if (!isRunning || !currentToken) return;

    setIsCancelling(true);
    addLog('Cancelling discovery...', 'warning');

    window.electron.cancelDiscovery(currentToken)
      .then(() => {
        addLog('Discovery cancellation requested successfully', 'info');

        // Set timeout as fallback in case cancelled event doesn't fire
        setTimeout(() => {
          setIsRunning(false);
          setIsCancelling(false);
          setCurrentToken(null);
          addLog('Discovery cancelled', 'warning');
        }, 2000);
      })
      .catch((err: any) => {
        const errorMessage = err.message || 'Error cancelling discovery';
        addLog(errorMessage, 'error');
        // Reset state even on error
        setIsRunning(false);
        setIsCancelling(false);
        setCurrentToken(null);
      });
  }, [isRunning, currentToken, addLog]);

  const resetDiscovery = useCallback(() => {
    setIsRunning(false);
    setIsCancelling(false);
    setIsComplete(false);
    setProgress(null);
    setResults(null);
    setError(null);
    setLogs([]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const updateFormData = useCallback((newData: Partial<DomainDiscoveryFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  }, []);

  const updateFormField = useCallback((field: keyof DomainDiscoveryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      domainController: 'dc.contoso.com',
      searchBase: '',
      maxResults: 10000,
      timeout: 300,
      includeUsers: true,
      includeGroups: true,
      includeComputers: true,
      includeOUs: true,
    });
  }, []);

  const cancelDiscovery = useCallback(() => {
    stopDiscovery();
  }, [stopDiscovery]);

  const exportResults = useCallback(() => {
    if (results && results.length > 0) {
      // Mock export
      console.log('Exporting results:', results);
    }
  }, [results]);

  return {
    // State
    isRunning,
    isCancelling,
    isComplete,
    progress,
    results,
    logs,
    showExecutionDialog,
    error,
    formData,
    selectedProfile,

    // Computed
    isFormValid,

    // Methods
    startDiscovery,
    stopDiscovery,
    resetDiscovery,
    clearLogs,
    setShowExecutionDialog,
    updateFormData,
    updateFormField,
    resetForm,
    cancelDiscovery,
    exportResults,
  };
}
