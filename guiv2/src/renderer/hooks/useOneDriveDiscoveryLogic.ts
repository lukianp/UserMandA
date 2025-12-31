/**
 * OneDrive Discovery View Logic Hook
 * Manages state and business logic for OneDrive discovery operations
 * ✅ FIXED: Now uses event-driven architecture with streaming support
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ColDef } from 'ag-grid-community';

import {
  OneDriveDiscoveryConfig,
  OneDriveDiscoveryResult,
  OneDriveDiscoveryProgress,
  OneDriveDiscoveryFilter,
  OneDriveDiscoveryTemplate,
  OneDriveAccount,
  OneDriveFile,
  OneDriveSharing,
  createDefaultOneDriveConfig,
  createDefaultOneDriveFilter,
} from '../types/models/onedrive';

import { useDebounce } from './useDebounce';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

/**
 * Log Entry Interface for PowerShellExecutionDialog
 */
export interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

/**
 * OneDrive Discovery View State
 */
interface OneDriveDiscoveryState {
  // Configuration
  config: OneDriveDiscoveryConfig;
  templates: OneDriveDiscoveryTemplate[];

  // Results
  currentResult: OneDriveDiscoveryResult | null;
  historicalResults: OneDriveDiscoveryResult[];

  // Filtering
  filter: OneDriveDiscoveryFilter;
  searchText: string;

  // UI State
  isDiscovering: boolean;
  isCancelling: boolean;
  progress: OneDriveDiscoveryProgress | null;
  selectedTab: 'overview' | 'accounts' | 'files' | 'sharing';
  selectedObjects: any[];

  // PowerShellExecutionDialog state
  logs: LogEntry[];
  showExecutionDialog: boolean;

  // Errors
  errors: string[];
}

/**
 * OneDrive Discovery Logic Hook
 */
export const useOneDriveDiscoveryLogic = () => {
  // Get selected company profile from store
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult } = useDiscoveryStore();

  // State
  const [state, setState] = useState<OneDriveDiscoveryState>({
    config: createDefaultOneDriveConfig(),
    templates: [],
    currentResult: null,
    historicalResults: [],
    filter: createDefaultOneDriveFilter(),
    searchText: '',
    isDiscovering: false,
    isCancelling: false,
    progress: null,
    selectedTab: 'overview',
    selectedObjects: [],
    logs: [],
    showExecutionDialog: false,
    errors: [],
  });

  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const currentTokenRef = useRef<string | null>(null); // ✅ ADDED: Ref for event matching

  const debouncedSearch = useDebounce(state.searchText, 300);

  // Load templates and historical results on mount
  useEffect(() => {
    loadTemplates();
    loadHistoricalResults();
  }, []);

  // ✅ ADDED: Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[OneDriveDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const logLevel: LogEntry['level'] = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warning' : 'info';
        console.log(`[OneDriveDiscoveryHook] ${logLevel}: ${data.message}`);
        const logEntry: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          message: data.message,
          level: logLevel,
        };
        setState(prev => ({
          ...prev,
          logs: [...prev.logs, logEntry],
        }));
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const result = {
          id: `onedrive-discovery-${Date.now()}`,
          name: 'OneDrive Discovery',
          moduleName: 'OneDrive',
          displayName: 'OneDrive Discovery',
          itemCount: data?.result?.totalItems || data?.result?.RecordCount || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalItems || 0} OneDrive items`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        const successLog: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          message: `Discovery completed! Found ${data?.result?.totalItems || 0} OneDrive items.`,
          level: 'success',
        };
        setState(prev => ({
          ...prev,
          currentResult: data.result,
          isDiscovering: false,
          isCancelling: false,
          progress: null,
          logs: [...prev.logs, successLog],
        }));

        addResult(result); // ✅ ADDED: Store in discovery store
        setCurrentToken(null);
        console.log('[OneDriveDiscoveryHook] Discovery completed:', result);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const errorLog: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          message: `Discovery failed: ${data.error || 'Unknown error'}`,
          level: 'error',
        };
        setState(prev => ({
          ...prev,
          errors: [data.error || 'Discovery failed'],
          isDiscovering: false,
          isCancelling: false,
          progress: null,
          logs: [...prev.logs, errorLog],
        }));
        console.error('[OneDriveDiscoveryHook] Discovery failed:', data.error);
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const cancelLog: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          message: 'Discovery cancelled by user',
          level: 'warning',
        };
        setState(prev => ({
          ...prev,
          isDiscovering: false,
          isCancelling: false,
          progress: null,
          logs: [...prev.logs, cancelLog],
        }));
        setCurrentToken(null);
        console.log('[OneDriveDiscoveryHook] Discovery cancelled by user');
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
   * Load discovery templates
   */
  const loadTemplates = async () => {
    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/OneDriveDiscovery.psm1',
        functionName: 'Get-OneDriveDiscoveryTemplates',
        parameters: {},
      });

      if (result.success && result.data) {
        setState(prev => ({ ...prev, templates: result.data.templates }));
      }
    } catch (error) {
      console.error('Failed to load OneDrive discovery templates:', error);
    }
  };

  /**
   * Load historical discovery results
   */
  const loadHistoricalResults = async () => {
    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/OneDriveDiscovery.psm1',
        functionName: 'Get-OneDriveDiscoveryHistory',
        parameters: { limit: 10 },
      });

      if (result.success && result.data) {
        setState(prev => ({ ...prev, historicalResults: result.data.results }));
      }
    } catch (error) {
      console.error('Failed to load OneDrive discovery history:', error);
    }
  };

  /**
   * Start OneDrive discovery
   * ✅ FIXED: Now uses event-driven executeDiscovery API
   */
  const startDiscovery = async () => {
    // Check if a profile is selected
    if (!selectedSourceProfile) {
      const errorMessage = 'No company profile selected. Please select a profile first.';
      setState(prev => ({ ...prev, errors: [errorMessage] }));
      console.error('[OneDriveDiscoveryHook]', errorMessage);
      return;
    }

    const token = `onedrive-discovery-${Date.now()}`;
    setCurrentToken(token);
    currentTokenRef.current = token; // ✅ CRITICAL: Update ref for event matching

    const initialLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      message: `Starting OneDrive discovery for ${selectedSourceProfile.companyName}...`,
      level: 'info',
    };
    setState(prev => ({
      ...prev,
      isDiscovering: true,
      progress: null,
      errors: [],
      logs: [initialLog],
      showExecutionDialog: true,
    }));

    console.log(`[OneDriveDiscoveryHook] Starting OneDrive discovery for ${selectedSourceProfile.companyName}...`);

    try {
      // ✅ FIXED: Use new event-driven API instead of deprecated executeModule
      const result = await window.electron.executeDiscovery({
        moduleName: 'OneDrive',
        parameters: {
          Config: state.config,
        },
        executionOptions: {  // ✅ ADDED: Missing execution options
          timeout: 300000,   // 5 minutes for OneDrive discovery
          showWindow: false, // Use integrated dialog
        },
        executionId: token, // ✅ CRITICAL: Pass token for event matching
      });

      console.log('[OneDriveDiscoveryHook] Discovery execution initiated:', result);
      await loadHistoricalResults();

      // Note: Completion will be handled by the discovery:complete event listener
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      setState(prev => ({
        ...prev,
        errors: [errorMessage],
        isDiscovering: false,
        progress: null,
      }));
      console.error('[OneDriveDiscoveryHook]', errorMessage);
      setCurrentToken(null);
    }
  };

  /**
   * Cancel ongoing discovery
   * ✅ FIXED: Now properly cancels PowerShell process
   */
  const cancelDiscovery = async () => {
    if (!state.isDiscovering || !currentToken) return;

    const cancelLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      message: 'Cancelling discovery...',
      level: 'warning',
    };
    setState(prev => ({
      ...prev,
      isCancelling: true,
      logs: [...prev.logs, cancelLog],
    }));

    console.log('[OneDriveDiscoveryHook] Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentToken);
      console.log('[OneDriveDiscoveryHook] Discovery cancellation requested successfully');

      // Set timeout as fallback in case cancelled event doesn't fire
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isDiscovering: false,
          isCancelling: false,
          progress: null,
        }));
        setCurrentToken(null);
        console.log('[OneDriveDiscoveryHook] Discovery cancelled');
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'Error cancelling discovery';
      console.error('[OneDriveDiscoveryHook]', errorMessage);
      // Reset state even on error
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        isCancelling: false,
        progress: null,
      }));
      setCurrentToken(null);
    }
  };

  /**
   * Update configuration
   */
  const updateConfig = useCallback((updates: Partial<OneDriveDiscoveryConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...updates, updatedAt: new Date().toISOString() },
    }));
  }, []);

  /**
   * Load a template
   */
  const loadTemplate = useCallback((template: OneDriveDiscoveryTemplate) => {
    setState(prev => ({
      ...prev,
      config: { ...template.config, id: crypto.randomUUID() },
    }));
  }, []);

  /**
   * Save current config as template
   */
  const saveAsTemplate = async (name: string, description: string) => {
    try {
      const template: OneDriveDiscoveryTemplate = {
        id: crypto.randomUUID(),
        name,
        description,
        category: 'custom',
        config: state.config,
        isDefault: false,
        isReadOnly: false,
        tags: [],
        author: null,
        version: '1.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/OneDriveDiscovery.psm1',
        functionName: 'Save-OneDriveDiscoveryTemplate',
        parameters: { template },
      });

      await loadTemplates();
    } catch (error) {
      console.error('Failed to save OneDrive discovery template:', error);
    }
  };

  /**
   * Export discovery results
   */
  const exportResults = async (format: 'csv' | 'json' | 'excel') => {
    if (!state.currentResult) return;

    try {
      await window.electronAPI.executeModule({
        modulePath: 'Modules/Reporting/ExportService.psm1',
        functionName: 'Export-OneDriveDiscoveryResults',
        parameters: {
          result: state.currentResult,
          format,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to export OneDrive discovery results:', error);
    }
  };

  /**
   * Update filter
   */
  const updateFilter = useCallback((updates: Partial<OneDriveDiscoveryFilter>) => {
    setState(prev => ({
      ...prev,
      filter: { ...prev.filter, ...updates },
    }));
  }, []);

  /**
   * Set selected tab
   */
  const setSelectedTab = useCallback((tab: OneDriveDiscoveryState['selectedTab']) => {
    setState(prev => ({ ...prev, selectedTab: tab }));
  }, []);

  /**
   * Set search text
   */
  const setSearchText = useCallback((text: string) => {
    setState(prev => ({ ...prev, searchText: text }));
  }, []);

  /**
   * Get filtered data based on current tab
   */
  const filteredData = useMemo(() => {
    if (!state.currentResult) return [];

    let data: any[] = [];

    switch (state.selectedTab) {
      case 'accounts':
        data = state.currentResult.accounts;
        break;
      case 'files':
        data = state.currentResult.files;
        break;
      case 'sharing':
        data = state.currentResult.sharing;
        break;
      default:
        return [];
    }

    // Apply search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      data = (data ?? []).filter((item: any) =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply filters based on tab
    if (state.selectedTab === 'accounts' && state.filter.accountStatus) {
      data = (data ?? []).filter((account: OneDriveAccount) =>
        state.filter.accountStatus?.includes(account.status)
      );
    }

    if (state.selectedTab === 'files' && state.filter.fileTypes) {
      data = (data ?? []).filter((file: OneDriveFile) =>
        state.filter.fileTypes?.includes(file.extension)
      );
    }

    if (state.selectedTab === 'sharing' && state.filter.riskLevel) {
      data = (data ?? []).filter((share: OneDriveSharing) =>
        state.filter.riskLevel?.includes(share.securityRisk)
      );
    }

    return data || [];
  }, [state.currentResult, state.selectedTab, debouncedSearch, state.filter]);

  /**
   * Column definitions for AG Grid
   */
  const columnDefs = useMemo<ColDef[]>(() => {
    switch (state.selectedTab) {
      case 'accounts':
        return [
          { field: 'userPrincipalName', headerName: 'User', sortable: true, filter: true, pinned: 'left' },
          { field: 'displayName', headerName: 'Display Name', sortable: true, filter: true },
          { field: 'accountType', headerName: 'Type', sortable: true, filter: true },
          {
            field: 'storageUsed',
            headerName: 'Storage Used',
            sortable: true,
            valueFormatter: (params) => formatBytes(params.value),
          },
          {
            field: 'storageQuota',
            headerName: 'Quota',
            sortable: true,
            valueFormatter: (params) => formatBytes(params.value),
          },
          {
            field: 'storagePercentUsed',
            headerName: 'Usage %',
            sortable: true,
            valueFormatter: (params) => `${params.value.toFixed(1)}%`,
          },
          { field: 'totalFiles', headerName: 'Files', sortable: true },
          { field: 'totalFolders', headerName: 'Folders', sortable: true },
          { field: 'sharedFiles', headerName: 'Shared', sortable: true },
          { field: 'externalShares', headerName: 'External', sortable: true },
          { field: 'status', headerName: 'Status', sortable: true, filter: true },
        ];

      case 'files':
        return [
          { field: 'name', headerName: 'Name', sortable: true, filter: true, pinned: 'left' },
          { field: 'relativePath', headerName: 'Path', sortable: true, filter: true },
          { field: 'owner', headerName: 'Owner', sortable: true, filter: true },
          {
            field: 'size',
            headerName: 'Size',
            sortable: true,
            valueFormatter: (params) => formatBytes(params.value),
          },
          { field: 'extension', headerName: 'Type', sortable: true, filter: true },
          {
            field: 'modifiedDate',
            headerName: 'Modified',
            sortable: true,
            valueFormatter: (params) => formatDate(params.value),
          },
          { field: 'sharingType', headerName: 'Sharing', sortable: true, filter: true },
          { field: 'shareCount', headerName: 'Share Count', sortable: true },
          { field: 'sensitivityLabel', headerName: 'Label', sortable: true, filter: true },
          { field: 'securityRiskLevel', headerName: 'Risk', sortable: true, filter: true },
        ];

      case 'sharing':
        return [
          { field: 'fileName', headerName: 'File', sortable: true, filter: true, pinned: 'left' },
          { field: 'filePath', headerName: 'Path', sortable: true, filter: true },
          { field: 'fileOwner', headerName: 'Owner', sortable: true, filter: true },
          { field: 'shareType', headerName: 'Type', sortable: true, filter: true },
          { field: 'linkType', headerName: 'Access', sortable: true, filter: true },
          { field: 'recipientCount', headerName: 'Recipients', sortable: true },
          { field: 'externalRecipientCount', headerName: 'External', sortable: true },
          {
            field: 'createdDate',
            headerName: 'Created',
            sortable: true,
            valueFormatter: (params) => formatDate(params.value),
          },
          {
            field: 'expirationDate',
            headerName: 'Expires',
            sortable: true,
            valueFormatter: (params) => params.value ? formatDate(params.value) : 'Never',
          },
          { field: 'viewCount', headerName: 'Views', sortable: true },
          { field: 'downloadCount', headerName: 'Downloads', sortable: true },
          { field: 'securityRisk', headerName: 'Risk', sortable: true, filter: true },
          { field: 'status', headerName: 'Status', sortable: true, filter: true },
        ];

      default:
        return [];
    }
  }, [state.selectedTab]);

  // Helper functions
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  /**
   * Clear all logs
   */
  const clearLogs = useCallback(() => {
    setState(prev => ({ ...prev, logs: [] }));
  }, []);

  /**
   * Set show execution dialog
   */
  const setShowExecutionDialog = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showExecutionDialog: show }));
  }, []);

  return {
    // State
    config: state.config,
    templates: state.templates,
    currentResult: state.currentResult,
    historicalResults: state.historicalResults,
    filter: state.filter,
    searchText: state.searchText,
    isDiscovering: state.isDiscovering,
    isCancelling: state.isCancelling,
    progress: state.progress,
    selectedTab: state.selectedTab,
    selectedObjects: state.selectedObjects,
    errors: state.errors,

    // PowerShellExecutionDialog state
    logs: state.logs,
    showExecutionDialog: state.showExecutionDialog,

    // Data
    filteredData,
    columnDefs,

    // Actions
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    loadTemplate,
    saveAsTemplate,
    exportResults,
    updateFilter,
    setSelectedTab,
    setSearchText,
    clearLogs,
    setShowExecutionDialog,
  };
};


