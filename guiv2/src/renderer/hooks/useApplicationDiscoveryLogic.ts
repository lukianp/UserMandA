/**
 * Application Discovery View Logic Hook
 * Manages state and business logic for application discovery operations
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ColDef } from 'ag-grid-community';
import {
  ApplicationDiscoveryConfig,
  ApplicationDiscoveryResult,
  ApplicationDiscoveryProgress,
  ApplicationDiscoveryFilter,
  ApplicationDiscoveryTemplate,
  Application,
  ProcessInfo,
  ServiceInfo,
  NetworkPort,
} from '../types/models/application';
import { useDebounce } from './useDebounce';

/**
 * Application Discovery View State
 */
interface ApplicationDiscoveryState {
  // Configuration
  config: ApplicationDiscoveryConfig;
  templates: ApplicationDiscoveryTemplate[];

  // Results
  currentResult: ApplicationDiscoveryResult | null;
  historicalResults: ApplicationDiscoveryResult[];

  // Filtering
  filter: ApplicationDiscoveryFilter;
  searchText: string;

  // UI State
  isDiscovering: boolean;
  progress: ApplicationDiscoveryProgress | null;
  selectedTab: 'applications' | 'processes' | 'services' | 'ports' | 'overview';
  selectedObjects: any[];

  // Errors
  errors: string[];

  // Data
  applications: Application[];
  processes: ProcessInfo[];
  services: ServiceInfo[];
  ports: NetworkPort[];
}

/**
 * Application Discovery Logic Hook
 */
export const useApplicationDiscoveryLogic = () => {
  // State
  const [state, setState] = useState<ApplicationDiscoveryState>({
    config: createDefaultConfig(),
    templates: [],
    currentResult: null,
    historicalResults: [],
    filter: createDefaultFilter(),
    searchText: '',
    isDiscovering: false,
    progress: null,
    selectedTab: 'overview',
    selectedObjects: [],
    errors: [],
    applications: [],
    processes: [],
    services: [],
    ports: [],
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
      if (data.type === 'application-discovery') {
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
        modulePath: 'Modules/Discovery/ApplicationDiscovery.psm1',
        functionName: 'Get-ApplicationDiscoveryTemplates',
        parameters: {},
      });

      if (result.success && result.data) {
        setState(prev => ({ ...prev, templates: result.data.templates }));
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  /**
   * Load historical discovery results
   */
  const loadHistoricalResults = async () => {
    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/ApplicationDiscovery.psm1',
        functionName: 'Get-ApplicationDiscoveryHistory',
        parameters: { Limit: 10 },
      });

      if (result.success && result.data) {
        setState(prev => ({ ...prev, historicalResults: result.data.results }));
      }
    } catch (error) {
      console.error('Failed to load historical results:', error);
    }
  };

  /**
   * Start Application Discovery
   */
  const startDiscovery = useCallback(async () => {
    setState(prev => ({ ...prev, isDiscovering: true, errors: [], progress: null }));

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/ApplicationDiscovery.psm1',
        functionName: 'Invoke-ApplicationDiscovery',
        parameters: {
          Config: state.config,
          StreamProgress: true,
        },
      });

      if (result.success && result.data) {
        const discoveryResult: ApplicationDiscoveryResult = result.data;
        setState(prev => ({
          ...prev,
          currentResult: discoveryResult,
          applications: discoveryResult.applications || [],
          processes: discoveryResult.processes || [],
          services: discoveryResult.services || [],
          ports: discoveryResult.ports || [],
          isDiscovering: false,
          progress: null,
        }));
      } else {
        throw new Error(result.error || 'Discovery failed');
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        errors: [...prev.errors, error.message || 'Unknown error occurred'],
        progress: null,
      }));
    }
  }, [state.config]);

  /**
   * Cancel ongoing discovery
   */
  const cancelDiscovery = useCallback(async () => {
    if (!state.currentResult?.id) return;

    try {
      await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/ApplicationDiscovery.psm1',
        functionName: 'Stop-ApplicationDiscovery',
        parameters: { ResultId: state.currentResult.id },
      });

      setState(prev => ({ ...prev, isDiscovering: false, progress: null }));
    } catch (error) {
      console.error('Failed to cancel discovery:', error);
    }
  }, [state.currentResult?.id]);

  /**
   * Update discovery configuration
   */
  const updateConfig = useCallback((updates: Partial<ApplicationDiscoveryConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  }, []);

  /**
   * Load a template
   */
  const loadTemplate = useCallback((template: ApplicationDiscoveryTemplate) => {
    setState(prev => ({
      ...prev,
      config: { ...template.config, id: generateId() },
    }));
  }, []);

  /**
   * Save current config as template
   */
  const saveAsTemplate = useCallback(async (name: string, description: string, category: string) => {
    try {
      const template: Omit<ApplicationDiscoveryTemplate, 'id' | 'createdDate' | 'modifiedDate'> = {
        name,
        description,
        category: category as any,
        config: state.config,
        createdBy: 'CurrentUser',
        isSystem: false,
      };

      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/ApplicationDiscovery.psm1',
        functionName: 'Save-ApplicationDiscoveryTemplate',
        parameters: { Template: template },
      });

      if (result.success) {
        await loadTemplates();
      }
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  }, [state.config]);

  /**
   * Export discovery results
   */
  const exportResults = useCallback(async (format: 'csv' | 'excel' | 'json' | 'xml' | 'html') => {
    if (!state.currentResult) return;

    try {
      await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/ApplicationDiscovery.psm1',
        functionName: 'Export-ApplicationDiscoveryResults',
        parameters: {
          ResultId: state.currentResult.id,
          Format: format,
          IncludeAll: true,
        },
      });
    } catch (error) {
      console.error('Failed to export results:', error);
    }
  }, [state.currentResult]);

  /**
   * Filter results based on current filter settings
   */
  const filteredData = useMemo(() => {
    const { filter } = state;
    let data: any[] = [];

    switch (state.selectedTab) {
      case 'applications':
        data = state.applications;
        break;
      case 'processes':
        data = state.processes;
        break;
      case 'services':
        data = state.services;
        break;
      case 'ports':
        data = state.ports;
        break;
      default:
        return [];
    }

    // Apply search text filter
    if (debouncedSearch) {
      data = data.filter((item: any) => {
        const searchLower = debouncedSearch.toLowerCase();
        return (
          item.name?.toLowerCase().includes(searchLower) ||
          item.displayName?.toLowerCase().includes(searchLower) ||
          item.vendor?.toLowerCase().includes(searchLower) ||
          item.version?.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply category filter for applications
    if (state.selectedTab === 'applications' && filter.category !== 'all') {
      data = data.filter((item: any) => item.category === filter.category);
    }

    // Apply vendor filter for applications
    if (state.selectedTab === 'applications' && filter.vendor) {
      data = data.filter((item: any) => item.vendor === filter.vendor);
    }

    // Apply update status filter
    if (state.selectedTab === 'applications' && filter.updateStatus !== 'all') {
      data = data.filter((item: any) => item.updateStatus === filter.updateStatus);
    }

    // Apply license status filter
    if (state.selectedTab === 'applications' && filter.licenseStatus !== 'all') {
      data = data.filter((item: any) => item.licenseStatus === filter.licenseStatus);
    }

    // Apply security status filter
    if (state.selectedTab === 'applications' && filter.securityStatus === 'at-risk') {
      data = data.filter((item: any) => item.securityRisks && item.securityRisks.length > 0);
    } else if (state.selectedTab === 'applications' && filter.securityStatus === 'secure') {
      data = data.filter((item: any) => !item.securityRisks || item.securityRisks.length === 0);
    }

    return data;
  }, [state.selectedTab, state.applications, state.processes, state.services, state.ports, state.filter, debouncedSearch]);

  /**
   * Column definitions for AG Grid
   */
  const columnDefs: Record<string, ColDef[]> = useMemo(() => ({
    applications: [
      { field: 'name', headerName: 'Name', sortable: true, filter: true, flex: 2 },
      { field: 'version', headerName: 'Version', sortable: true, filter: true, flex: 1 },
      { field: 'vendor', headerName: 'Vendor', sortable: true, filter: true, flex: 1 },
      { field: 'category', headerName: 'Category', sortable: true, filter: true, flex: 1 },
      { field: 'installDate', headerName: 'Install Date', sortable: true, filter: true, flex: 1,
        valueFormatter: (params: any) => params.value ? new Date(params.value).toLocaleDateString() : 'Unknown' },
      { field: 'size', headerName: 'Size', sortable: true, filter: true, flex: 1,
        valueFormatter: (params: any) => formatBytes(params.value) },
      { field: 'licenseStatus', headerName: 'License', sortable: true, filter: true, flex: 1 },
      { field: 'updateStatus', headerName: 'Updates', sortable: true, filter: true, flex: 1 },
      { field: 'dependencies', headerName: 'Dependencies', sortable: true, flex: 1,
        valueGetter: (params: any) => params.data.dependencies?.length || 0 },
      { field: 'securityRisks', headerName: 'Security Risks', sortable: true, flex: 1,
        valueGetter: (params: any) => params.data.securityRisks?.length || 0,
        cellStyle: (params: any) => {
          if (params.value > 0) return { color: 'red', fontWeight: 'bold' };
          return {};
        }
      },
    ],
    processes: [
      { field: 'name', headerName: 'Name', sortable: true, filter: true, flex: 2 },
      { field: 'processId', headerName: 'PID', sortable: true, filter: true, flex: 1 },
      { field: 'userName', headerName: 'User', sortable: true, filter: true, flex: 1 },
      { field: 'cpuUsage', headerName: 'CPU %', sortable: true, filter: true, flex: 1,
        valueFormatter: (params: any) => `${params.value.toFixed(2)}%` },
      { field: 'memoryUsage', headerName: 'Memory', sortable: true, filter: true, flex: 1,
        valueFormatter: (params: any) => formatBytes(params.value) },
      { field: 'startTime', headerName: 'Start Time', sortable: true, filter: true, flex: 1,
        valueFormatter: (params: any) => params.value ? new Date(params.value).toLocaleString() : 'Unknown' },
      { field: 'threadCount', headerName: 'Threads', sortable: true, filter: true, flex: 1 },
      { field: 'status', headerName: 'Status', sortable: true, filter: true, flex: 1 },
    ],
    services: [
      { field: 'displayName', headerName: 'Display Name', sortable: true, filter: true, flex: 2 },
      { field: 'name', headerName: 'Service Name', sortable: true, filter: true, flex: 2 },
      { field: 'status', headerName: 'Status', sortable: true, filter: true, flex: 1 },
      { field: 'startType', headerName: 'Start Type', sortable: true, filter: true, flex: 1 },
      { field: 'account', headerName: 'Account', sortable: true, filter: true, flex: 1 },
      { field: 'processId', headerName: 'PID', sortable: true, filter: true, flex: 1 },
      { field: 'description', headerName: 'Description', sortable: true, filter: true, flex: 2 },
      { field: 'dependencies', headerName: 'Dependencies', sortable: true, flex: 1,
        valueGetter: (params: any) => params.data.dependencies?.length || 0 },
    ],
    ports: [
      { field: 'port', headerName: 'Port', sortable: true, filter: true, flex: 1 },
      { field: 'protocol', headerName: 'Protocol', sortable: true, filter: true, flex: 1 },
      { field: 'state', headerName: 'State', sortable: true, filter: true, flex: 1 },
      { field: 'processName', headerName: 'Process', sortable: true, filter: true, flex: 2 },
      { field: 'processId', headerName: 'PID', sortable: true, filter: true, flex: 1 },
    ],
  }), []);

  return {
    // State
    config: state.config,
    templates: state.templates,
    currentResult: state.currentResult,
    historicalResults: state.historicalResults,
    isDiscovering: state.isDiscovering,
    progress: state.progress,
    selectedTab: state.selectedTab,
    selectedObjects: state.selectedObjects,
    errors: state.errors,
    searchText: state.searchText,

    // Data
    filteredData,
    columnDefs: columnDefs[state.selectedTab] || [],

    // Actions
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    loadTemplate,
    saveAsTemplate,
    exportResults,
    setSelectedTab: (tab: typeof state.selectedTab) => setState(prev => ({ ...prev, selectedTab: tab })),
    setSearchText: (text: string) => setState(prev => ({ ...prev, searchText: text })),
    setSelectedObjects: (objects: any[]) => setState(prev => ({ ...prev, selectedObjects: objects })),
    updateFilter: (filter: Partial<ApplicationDiscoveryFilter>) =>
      setState(prev => ({ ...prev, filter: { ...prev.filter, ...filter } })),
  };
};

/**
 * Create default discovery configuration
 */
function createDefaultConfig(): ApplicationDiscoveryConfig {
  return {
    id: generateId(),
    name: 'New Application Discovery',
    targetComputers: [],
    useCurrentComputer: true,
    includeSoftware: true,
    includeProcesses: true,
    includeServices: true,
    scanRegistry: true,
    scanFilesystem: false,
    scanPorts: false,
    registryPaths: [
      'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
      'HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
    ],
    includeUserInstalled: true,
    includeMachineInstalled: true,
    filesystemPaths: ['C:\\Program Files', 'C:\\Program Files (x86)'],
    fileExtensions: ['.exe', '.dll'],
    scanDepth: 2,
    portRanges: [{ start: 1, end: 1024 }],
    portScanTimeout: 1000,
    detectDependencies: true,
    detectLicenses: true,
    checkForUpdates: true,
    performSecurityScan: true,
    resolveVersionInfo: true,
    excludePatterns: ['*\\Windows\\*', '*\\System32\\*'],
    includePatterns: [],
    minSizeBytes: null,
    maxSizeBytes: null,
    useCurrentCredentials: true,
    credentialProfileId: null,
    maxParallelScans: 4,
    timeout: 600,
    isScheduled: false,
    schedule: null,
  };
}

/**
 * Create default filter
 */
function createDefaultFilter(): ApplicationDiscoveryFilter {
  return {
    objectType: 'all',
    searchText: '',
    category: 'all',
    vendor: null,
    updateStatus: 'all',
    licenseStatus: 'all',
    securityStatus: 'all',
  };
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `app-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
