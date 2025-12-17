/**
 * Application Dependency Mapping Discovery Logic Hook
 * Contains all business logic for application dependency mapping discovery
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import type { PowerShellLog } from '../components/molecules/PowerShellExecutionDialog';
import type { BaseDiscoveryHookResult } from './common/discoveryHookTypes';

interface ApplicationDependencyMappingDiscoveryConfig {
  includeNetworkDependencies: boolean;
  includeDatabaseDependencies: boolean;
  includeAPIEndpoints: boolean;
  includeServiceDependencies: boolean;
  includeFileDependencies: boolean;
  analyzeCircularDependencies: boolean;
  timeout: number;
  scanDepth: number;
}

interface ApplicationDependencyMappingDiscoveryResult {
  totalDependencies?: number;
  totalApplications?: number;
  criticalDependencies?: number;
  totalItems?: number;
  outputPath?: string;
  dependencies?: any[];
  applications?: any[];
  dependencyGraph?: any;
  statistics?: {
    networkDependencies?: number;
    databaseDependencies?: number;
    apiDependencies?: number;
    serviceDependencies?: number;
    fileDependencies?: number;
    circularDependencies?: number;
  };
}

interface ApplicationDependencyMappingDiscoveryState {
  config: ApplicationDependencyMappingDiscoveryConfig;
  result: ApplicationDependencyMappingDiscoveryResult | null;
  isDiscovering: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
}

interface ApplicationDependencyMappingDiscoveryHookResult extends BaseDiscoveryHookResult {
  config: ApplicationDependencyMappingDiscoveryConfig;
  result: ApplicationDependencyMappingDiscoveryResult | null;
  isDiscovering: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
  startDiscovery: () => Promise<void>;
  cancelDiscovery: () => Promise<void>;
  updateConfig: (updates: Partial<ApplicationDependencyMappingDiscoveryConfig>) => void;
  clearError: () => void;
  showExecutionDialog: boolean;
  setShowExecutionDialog: (show: boolean) => void;
  logs: PowerShellLog[];
  clearLogs: () => void;
  isCancelling: boolean;
  activeTab: string;
  filter: any;
  columns: any[];
  filteredData: any[];
  stats: any;
  setActiveTab: (tab: string) => void;
  updateFilter: (updates: any) => void;
  exportToCSV: (data: any[], filename: string) => Promise<void>;
  exportToExcel: (data: any[], filename: string) => Promise<void>;
  selectedProfile: any;
  templates: any[];
  currentResult: ApplicationDependencyMappingDiscoveryResult | null;
  selectedTab: string;
  searchText: string;
  columnDefs: any[];
  errors: string[];
  loadTemplate: (template: any) => void;
  saveAsTemplate: (name: string) => void;
  setSelectedTab: (tab: string) => void;
  setSearchText: (text: string) => void;
  exportData: (format: string) => Promise<void>;
}

export const useApplicationDependencyMappingDiscoveryLogic = (): ApplicationDependencyMappingDiscoveryHookResult => {


  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);
  const [logs, setLogs] = useState<PowerShellLog[]>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Additional state for view compatibility
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [filter, setFilter] = useState<any>({
    searchText: '',
    showCriticalOnly: false,
    selectedApplications: [],
  });
  const [selectedTab, setSelectedTab] = useState<string>('overview');
  const [searchText, setSearchText] = useState<string>('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const [state, setState] = useState<ApplicationDependencyMappingDiscoveryState>({
    config: {
      includeNetworkDependencies: true,
      includeDatabaseDependencies: true,
      includeAPIEndpoints: true,
      includeServiceDependencies: true,
      includeFileDependencies: true,
      analyzeCircularDependencies: false,
      timeout: 300000,
      scanDepth: 3,
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
    console.log('[ApplicationDependencyMappingDiscoveryHook] Loading previous results');
    const previousResults = getResultsByModuleName('ApplicationDependencyMappingDiscovery');
    if (previousResults && previousResults.length > 0) {
      const latestResult = previousResults[previousResults.length - 1];
      console.log('[ApplicationDependencyMappingDiscoveryHook] Found previous result:', latestResult);
      setState((prev) => ({
        ...prev,
        result: latestResult.additionalData as ApplicationDependencyMappingDiscoveryResult,
      }));
    }
  }, [getResultsByModuleName]);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[ApplicationDependencyMappingDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[ApplicationDependencyMappingDiscoveryHook] Discovery output:', data.message);
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
        console.log('[ApplicationDependencyMappingDiscoveryHook] Discovery completed:', data);

        const discoveryResult = {
          id: `appdependencymapping-discovery-${Date.now()}`,
          name: 'Application Dependency Mapping Discovery',
          moduleName: 'ApplicationDependencyMappingDiscovery',
          displayName: 'Application Dependency Mapping Discovery',
          itemCount: data?.result?.totalItems || data?.result?.totalDependencies || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Mapped ${data?.result?.totalDependencies || 0} dependencies across ${data?.result?.totalApplications || 0} applications (${data?.result?.criticalDependencies || 0} critical)`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          result: data.result as ApplicationDependencyMappingDiscoveryResult,
          isDiscovering: false,
          progress: {
            current: 100,
            total: 100,
            message: 'Completed',
            percentage: 100,
          },
        }));

        addResult(discoveryResult);
        console.log(`[ApplicationDependencyMappingDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[ApplicationDependencyMappingDiscoveryHook] Discovery error:', data.error);
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
        console.warn('[ApplicationDependencyMappingDiscoveryHook] Discovery cancelled');
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

  const addLog = useCallback((level: PowerShellLog['level'], message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, level, message }]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const startDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      const errorMessage = 'No company profile selected. Please select a profile first.';
      setState((prev) => ({ ...prev, error: errorMessage }));
      console.error('[ApplicationDependencyMappingDiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    setShowExecutionDialog(true);
    const token = `appdependencymapping-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        message: 'Starting Application Dependency Mapping discovery...',
        percentage: 0,
      },
    }));

    currentTokenRef.current = token;

    console.log(`[ApplicationDependencyMappingDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log('[ApplicationDependencyMappingDiscoveryHook] Parameters:', {
      IncludeNetworkDependencies: state.config.includeNetworkDependencies,
      IncludeDatabaseDependencies: state.config.includeDatabaseDependencies,
      IncludeAPIEndpoints: state.config.includeAPIEndpoints,
      IncludeServiceDependencies: state.config.includeServiceDependencies,
      IncludeFileDependencies: state.config.includeFileDependencies,
      AnalyzeCircularDependencies: state.config.analyzeCircularDependencies,
      Timeout: state.config.timeout,
      ScanDepth: state.config.scanDepth,
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'ApplicationDependencyMapping',
        parameters: {
          IncludeNetworkDependencies: state.config.includeNetworkDependencies,
          IncludeDatabaseDependencies: state.config.includeDatabaseDependencies,
          IncludeAPIEndpoints: state.config.includeAPIEndpoints,
          IncludeServiceDependencies: state.config.includeServiceDependencies,
          IncludeFileDependencies: state.config.includeFileDependencies,
          AnalyzeCircularDependencies: state.config.analyzeCircularDependencies,
          Timeout: state.config.timeout,
          ScanDepth: state.config.scanDepth,
        },
        executionOptions: {
          timeout: state.config.timeout,
          showWindow: false,
        },
        executionId: token,
      });

      console.log('[ApplicationDependencyMappingDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[ApplicationDependencyMappingDiscoveryHook] Discovery failed:', errorMessage);
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
    console.warn('[ApplicationDependencyMappingDiscoveryHook] Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[ApplicationDependencyMappingDiscoveryHook] Discovery cancellation requested successfully');

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
      console.error('[ApplicationDependencyMappingDiscoveryHook]', errorMessage);
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
    }
  }, [state.isDiscovering]);

  const updateConfig = useCallback((updates: Partial<ApplicationDependencyMappingDiscoveryConfig>) => {
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Additional functions for view compatibility
  const updateFilter = useCallback((updates: any) => {
    setFilter((prev: any) => ({ ...prev, ...updates }));
  }, []);

  const loadTemplate = useCallback((template: any) => {
    setState((prev) => ({
      ...prev,
      config: template.config || prev.config,
    }));
    addLog('info', `Loaded template: ${template.name}`);
  }, [addLog]);

  const saveAsTemplate = useCallback((name: string) => {
    const template = { name, config: state.config };
    setTemplates((prev) => [...prev, template]);
    addLog('info', `Saved template: ${name}`);
  }, [state.config, addLog]);

  const exportData = useCallback(async (format: string) => {
    addLog('info', `Exporting data as ${format}...`);
    // Mock export functionality
    if (state.result) {
      const dataStr = JSON.stringify(state.result, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `app-dependency-mapping-results-${new Date().toISOString().split('T')[0]}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      addLog('info', 'Data exported successfully.');
    }
  }, [state.result, addLog]);

  const exportToCSV = useCallback(async (data: any[], filename: string) => {
    // Mock CSV export
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent('Mock CSV export');
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', csvContent);
    linkElement.setAttribute('download', filename);
    linkElement.click();
    addLog('info', `Exported to CSV: ${filename}`);
  }, [addLog]);

  const exportToExcel = useCallback(async (data: any[], filename: string) => {
    // Mock Excel export
    const excelContent = 'data:application/vnd.ms-excel;charset=utf-8,' + encodeURIComponent('Mock Excel export');
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', excelContent);
    linkElement.setAttribute('download', filename);
    linkElement.click();
    addLog('info', `Exported to Excel: ${filename}`);
  }, [addLog]);

  // Computed properties
  const columns = [
    { key: 'name', header: 'Application Name', width: 200 },
    { key: 'type', header: 'Type', width: 100 },
    { key: 'dependencies', header: 'Dependencies', width: 150 },
    { key: 'critical', header: 'Critical', width: 100 },
  ];

  const filteredData = state.result?.applications?.filter((app: any) => {
    if (filter.searchText && !app.name?.toLowerCase().includes(filter.searchText.toLowerCase())) {
      return false;
    }
    if (filter.showCriticalOnly && !app.critical) {
      return false;
    }
    return true;
  }) || [];

  const stats = state.result ? {
    totalApplications: state.result.totalApplications || 0,
    totalDependencies: state.result.totalDependencies || 0,
    criticalDependencies: state.result.criticalDependencies || 0,
    orphanedApplications: 0,
    maxDependencyDepth: 0,
    circularDependencies: state.result.statistics?.circularDependencies || 0,
    totalIntegrationPoints: 0,
    avgDependenciesPerApp: state.result.totalApplications ? (state.result.totalDependencies || 0) / state.result.totalApplications : 0,
    networkDependencies: state.result.statistics?.networkDependencies || 0,
    databaseDependencies: state.result.statistics?.databaseDependencies || 0,
    apiDependencies: state.result.statistics?.apiDependencies || 0,
    serviceDependencies: state.result.statistics?.serviceDependencies || 0,
    fileDependencies: state.result.statistics?.fileDependencies || 0,
    riskScore: 0,
  } : null;

  return {
    config: state.config,
    result: state.result,
    isDiscovering: state.isDiscovering,
    progress: state.progress,
    error: state.error,
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    clearError,
    showExecutionDialog,
    setShowExecutionDialog,
    logs,
    clearLogs,
    isCancelling,
    isRunning: state.isDiscovering,
    results: state.result,
    exportResults: () => exportData('json'),

    // Additional properties for view compatibility
    activeTab,
    filter,
    columns,
    filteredData,
    stats,
    setActiveTab,
    updateFilter,
    exportToCSV,
    exportToExcel,
    selectedProfile: selectedSourceProfile,
    templates,
    currentResult: state.result,
    selectedTab,
    searchText,
    columnDefs: columns,
    errors,
    loadTemplate,
    saveAsTemplate,
    setSelectedTab,
    setSearchText,
    exportData,
  };
};
