/**
 * OneDrive Discovery View Logic Hook
 * Manages state and business logic for OneDrive discovery operations
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  progress: OneDriveDiscoveryProgress | null;
  selectedTab: 'overview' | 'accounts' | 'files' | 'sharing';
  selectedObjects: any[];

  // Errors
  errors: string[];
}

/**
 * OneDrive Discovery Logic Hook
 */
export const useOneDriveDiscoveryLogic = () => {
  // State
  const [state, setState] = useState<OneDriveDiscoveryState>({
    config: createDefaultOneDriveConfig(),
    templates: [],
    currentResult: null,
    historicalResults: [],
    filter: createDefaultOneDriveFilter(),
    searchText: '',
    isDiscovering: false,
    progress: null,
    selectedTab: 'overview',
    selectedObjects: [],
    errors: [],
  });

  const debouncedSearch = useDebounce(state.searchText, 300);

  // Load templates and historical results on mount
  useEffect(() => {
    loadTemplates();
    loadHistoricalResults();
  }, []);

  // Subscribe to discovery progress
  useEffect(() => {
    const unsubscribe = window.electronAPI?.onProgress?.((data: any) => {
      if (data.type === 'onedrive-discovery') {
        setState(prev => ({ ...prev, progress: data }));
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

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
   */
  const startDiscovery = async () => {
    setState(prev => ({
      ...prev,
      isDiscovering: true,
      progress: null,
      errors: [],
    }));

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/OneDriveDiscovery.psm1',
        functionName: 'Invoke-OneDriveDiscovery',
        parameters: { config: state.config },
        options: { streamOutput: true },
      });

      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          currentResult: result.data,
          isDiscovering: false,
          progress: null,
        }));
        await loadHistoricalResults();
      } else {
        setState(prev => ({
          ...prev,
          errors: [result.error || 'Discovery failed'],
          isDiscovering: false,
          progress: null,
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        errors: [error.message || 'Discovery failed unexpectedly'],
        isDiscovering: false,
        progress: null,
      }));
    }
  };

  /**
   * Cancel ongoing discovery
   */
  const cancelDiscovery = async () => {
    try {
      await window.electronAPI.cancelExecution('onedrive-discovery');
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        progress: null,
      }));
    } catch (error) {
      console.error('Failed to cancel OneDrive discovery:', error);
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
      data = data.filter((item: any) =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply filters based on tab
    if (state.selectedTab === 'accounts' && state.filter.accountStatus) {
      data = data.filter((account: OneDriveAccount) =>
        state.filter.accountStatus?.includes(account.status)
      );
    }

    if (state.selectedTab === 'files' && state.filter.fileTypes) {
      data = data.filter((file: OneDriveFile) =>
        state.filter.fileTypes?.includes(file.extension)
      );
    }

    if (state.selectedTab === 'sharing' && state.filter.riskLevel) {
      data = data.filter((share: OneDriveSharing) =>
        state.filter.riskLevel?.includes(share.securityRisk)
      );
    }

    return data;
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

  return {
    // State
    config: state.config,
    templates: state.templates,
    currentResult: state.currentResult,
    historicalResults: state.historicalResults,
    filter: state.filter,
    searchText: state.searchText,
    isDiscovering: state.isDiscovering,
    progress: state.progress,
    selectedTab: state.selectedTab,
    selectedObjects: state.selectedObjects,
    errors: state.errors,

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
  };
};
