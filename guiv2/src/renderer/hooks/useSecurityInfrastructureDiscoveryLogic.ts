/**
 * Security Infrastructure Discovery View Logic Hook
 * Manages state and business logic for security infrastructure discovery operations
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ColDef } from 'ag-grid-community';

import {
  SecurityDiscoveryConfig,
  SecurityDiscoveryResult,
  SecurityDiscoveryProgress,
  SecurityDiscoveryFilter,
  SecurityDiscoveryTemplate,
  SecurityDevice,
  SecurityPolicy,
  SecurityIncident,
  VulnerabilityAssessment,
  createDefaultSecurityConfig,
  createDefaultSecurityFilter,
} from '../types/models/securityInfrastructure';

import { useDebounce } from './useDebounce';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { useProfileStore } from '../store/useProfileStore';

/**
 * Log entry interface for PowerShell execution dialog
 */
export interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

/**
 * Security Discovery View State
 */
interface SecurityDiscoveryState {
  // Configuration
  config: SecurityDiscoveryConfig;
  templates: SecurityDiscoveryTemplate[];

  // Results
  currentResult: SecurityDiscoveryResult | null;
  historicalResults: SecurityDiscoveryResult[];

  // Filtering
  filter: SecurityDiscoveryFilter;
  searchText: string;

  // UI State
  isDiscovering: boolean;
  progress: SecurityDiscoveryProgress | null;
  selectedTab: 'overview' | 'devices' | 'policies' | 'incidents' | 'vulnerabilities';
  selectedObjects: any[];

  // Errors
  errors: string[];

  // PowerShell Execution Dialog
  isCancelling: boolean;
  logs: LogEntry[];
  showExecutionDialog: boolean;
}

/**
 * Security Infrastructure Discovery Logic Hook
 */
export const useSecurityInfrastructureDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  // State
  const [state, setState] = useState<SecurityDiscoveryState>({
    config: createDefaultSecurityConfig(),
    templates: [],
    currentResult: null,
    historicalResults: [],
    filter: createDefaultSecurityFilter(),
    searchText: '',
    isDiscovering: false,
    progress: null,
    selectedTab: 'overview',
    selectedObjects: [],
    errors: [],
    isCancelling: false,
    logs: [],
    showExecutionDialog: false,
  });

  const debouncedSearch = useDebounce(state.searchText, 300);

  // Load previous discovery results from store on mount
  useEffect(() => {
    const previousResults = getResultsByModuleName('SecurityInfrastructureDiscovery');
    if (previousResults && previousResults.length > 0) {
      console.log('[SecurityInfrastructureDiscoveryHook] Restoring', previousResults.length, 'previous results from store');
      const latestResult = previousResults[previousResults.length - 1];
      setState(prev => ({ ...prev, currentResult: latestResult.additionalData as SecurityDiscoveryResult }));
    }
  }, [getResultsByModuleName]);

  // Load templates and historical results on mount
  useEffect(() => {
    loadTemplates();
    loadHistoricalResults();
  }, []);

  // Event listeners for discovery events - set up ONCE on mount
  useEffect(() => {
    console.log('[SecurityInfrastructureDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[SecurityInfrastructureDiscoveryHook] Discovery output:', data.message);
        // Detect log level from message content
        let level: LogEntry['level'] = 'info';
        const msgLower = (data.message || '').toLowerCase();
        if (msgLower.includes('error') || msgLower.includes('failed')) {
          level = 'error';
        } else if (msgLower.includes('warning') || msgLower.includes('warn')) {
          level = 'warning';
        } else if (msgLower.includes('success') || msgLower.includes('complete')) {
          level = 'success';
        }
        const entry: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          level,
          message: data.message || '',
        };
        setState(prev => ({
          ...prev,
          progress: prev.progress ? {
            ...prev.progress,
            currentOperation: data.message,
          } : null,
          logs: [...prev.logs, entry],
        }));
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[SecurityInfrastructureDiscoveryHook] Discovery complete:', data);

        const result = {
          id: `security-discovery-${Date.now()}`,
          name: 'Security Infrastructure Discovery',
          moduleName: 'SecurityInfrastructureDiscovery',
          displayName: 'Security Infrastructure Discovery',
          itemCount: data?.result?.totalItems || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalItems || 0} security items`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        const successLog: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          level: 'success',
          message: `Discovery completed! Found ${data?.result?.totalItems || 0} security items.`,
        };

        setState(prev => ({
          ...prev,
          currentResult: data.result as SecurityDiscoveryResult,
          isDiscovering: false,
          isCancelling: false,
          progress: null,
          logs: [...prev.logs, successLog],
        }));

        addResult(result);
        loadHistoricalResults();
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[SecurityInfrastructureDiscoveryHook] Discovery error:', data.error);
        const errorLog: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          level: 'error',
          message: `Discovery failed: ${data.error}`,
        };
        setState(prev => ({
          ...prev,
          errors: [data.error],
          isDiscovering: false,
          isCancelling: false,
          progress: null,
          logs: [...prev.logs, errorLog],
        }));
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[SecurityInfrastructureDiscoveryHook] Discovery cancelled');
        const cancelLog: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          level: 'warning',
          message: 'Discovery cancelled by user',
        };
        setState(prev => ({
          ...prev,
          isDiscovering: false,
          isCancelling: false,
          progress: null,
          logs: [...prev.logs, cancelLog],
        }));
      }
    });

    return () => {
      unsubscribeOutput?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeCancelled?.();
    };
  }, []); // Empty dependency array - critical for proper event handling

  /**
   * Load discovery templates
   */
  const loadTemplates = async () => {
    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/SecurityInfrastructureDiscovery.psm1',
        functionName: 'Get-SecurityDiscoveryTemplates',
        parameters: {},
      });

      if (result.success && result.data) {
        setState(prev => ({ ...prev, templates: result.data.templates }));
      }
    } catch (error) {
      console.error('Failed to load security discovery templates:', error);
    }
  };

  /**
   * Load historical discovery results
   */
  const loadHistoricalResults = async () => {
    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/SecurityInfrastructureDiscovery.psm1',
        functionName: 'Get-SecurityDiscoveryHistory',
        parameters: { limit: 10 },
      });

      if (result.success && result.data) {
        setState(prev => ({ ...prev, historicalResults: result.data.results }));
      }
    } catch (error) {
      console.error('Failed to load security discovery history:', error);
    }
  };

  /**
   * Start security infrastructure discovery
   */
  const startDiscovery = async () => {
    if (!selectedSourceProfile) {
      setState(prev => ({
        ...prev,
        errors: ['No company profile selected. Please select a profile first.']
      }));
      return;
    }

    const token = `security-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    currentTokenRef.current = token;

    const initialLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      message: `Starting Security Infrastructure discovery for ${selectedSourceProfile.companyName}...`,
    };

    setState(prev => ({
      ...prev,
      isDiscovering: true,
      progress: null,
      errors: [],
      logs: [initialLog],
      showExecutionDialog: true,
    }));

    try {
      console.log('[SecurityInfrastructureDiscoveryHook] Starting discovery with token:', token);

      const result = await window.electron.executeDiscovery({
        moduleName: 'SecurityInfrastructure',
        parameters: {
          IncludeDevices: state.config.discoverDevices,
          IncludePolicies: state.config.discoverPolicies,
          IncludeIncidents: state.config.discoverIncidents,
          IncludeVulnerabilities: state.config.discoverVulnerabilities,
        },
        executionOptions: {
          timeout: state.config.timeout || 600000,
          showWindow: false,
        },
        executionId: token,
      });

      console.log('[SecurityInfrastructureDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      console.error('[SecurityInfrastructureDiscoveryHook] Discovery error:', error);
      setState(prev => ({
        ...prev,
        errors: [error.message || 'Discovery failed unexpectedly'],
        isDiscovering: false,
        progress: null,
      }));
      currentTokenRef.current = null;
    }
  };

  /**
   * Cancel ongoing discovery
   */
  const cancelDiscovery = async () => {
    if (!currentTokenRef.current) return;

    const cancelLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level: 'warning',
      message: 'Cancelling discovery...',
    };

    setState(prev => ({
      ...prev,
      isCancelling: true,
      logs: [...prev.logs, cancelLog],
    }));

    try {
      console.log('[SecurityInfrastructureDiscoveryHook] Cancelling discovery:', currentTokenRef.current);
      await window.electron.cancelDiscovery(currentTokenRef.current);

      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isDiscovering: false,
          isCancelling: false,
          progress: null,
        }));
        currentTokenRef.current = null;
      }, 2000);
    } catch (error) {
      console.error('[SecurityInfrastructureDiscoveryHook] Failed to cancel discovery:', error);
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        isCancelling: false,
        progress: null,
      }));
      currentTokenRef.current = null;
    }
  };

  /**
   * Update configuration
   */
  const updateConfig = useCallback((updates: Partial<SecurityDiscoveryConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...updates, updatedAt: new Date().toISOString() },
    }));
  }, []);

  /**
   * Load a template
   */
  const loadTemplate = useCallback((template: SecurityDiscoveryTemplate) => {
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
      const template: SecurityDiscoveryTemplate = {
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
        modulePath: 'Modules/Discovery/SecurityInfrastructureDiscovery.psm1',
        functionName: 'Save-SecurityDiscoveryTemplate',
        parameters: { template },
      });

      await loadTemplates();
    } catch (error) {
      console.error('Failed to save security discovery template:', error);
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
        functionName: 'Export-SecurityDiscoveryResults',
        parameters: {
          result: state.currentResult,
          format,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to export security discovery results:', error);
    }
  };

  /**
   * Update filter
   */
  const updateFilter = useCallback((updates: Partial<SecurityDiscoveryFilter>) => {
    setState(prev => ({
      ...prev,
      filter: { ...prev.filter, ...updates },
    }));
  }, []);

  /**
   * Set selected tab
   */
  const setSelectedTab = useCallback((tab: SecurityDiscoveryState['selectedTab']) => {
    setState(prev => ({ ...prev, selectedTab: tab }));
  }, []);

  /**
   * Set search text
   */
  const setSearchText = useCallback((text: string) => {
    setState(prev => ({ ...prev, searchText: text }));
  }, []);

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

  /**
   * Get filtered data based on current tab
   */
  const filteredData = useMemo(() => {
    if (!state.currentResult) return [];

    let data: any[] = [];

    switch (state.selectedTab) {
      case 'devices':
        data = state.currentResult.devices;
        break;
      case 'policies':
        data = state.currentResult.policies;
        break;
      case 'incidents':
        data = state.currentResult.incidents;
        break;
      case 'vulnerabilities':
        data = state.currentResult.vulnerabilities;
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
    if (state.selectedTab === 'devices') {
      if (state.filter.deviceTypes) {
        data = (data ?? []).filter((device: SecurityDevice) =>
          state.filter.deviceTypes?.includes(device.deviceType)
        );
      }
      if (state.filter.deviceStatus) {
        data = (data ?? []).filter((device: SecurityDevice) =>
          state.filter.deviceStatus?.includes(device.operationalStatus)
        );
      }
    }

    if (state.selectedTab === 'incidents' && state.filter.incidentSeverity) {
      data = (data ?? []).filter((incident: SecurityIncident) =>
        state.filter.incidentSeverity?.includes(incident.severity)
      );
    }

    if (state.selectedTab === 'vulnerabilities' && state.filter.vulnerabilitySeverity) {
      data = (data ?? []).filter((vuln: VulnerabilityAssessment) =>
        state.filter.vulnerabilitySeverity?.includes(vuln.severity)
      );
    }

    return data;
  }, [state.currentResult, state.selectedTab, debouncedSearch, state.filter]);

  /**
   * Column definitions for AG Grid
   */
  const columnDefs = useMemo<ColDef[]>(() => {
    switch (state.selectedTab) {
      case 'devices':
        return [
          { field: 'name', headerName: 'Device Name', sortable: true, filter: true, pinned: 'left' },
          { field: 'deviceType', headerName: 'Type', sortable: true, filter: true },
          { field: 'vendor', headerName: 'Vendor', sortable: true, filter: true },
          { field: 'model', headerName: 'Model', sortable: true },
          { field: 'version', headerName: 'Version', sortable: true },
          { field: 'ipAddress', headerName: 'IP Address', sortable: true },
          { field: 'location', headerName: 'Location', sortable: true, filter: true },
          { field: 'operationalStatus', headerName: 'Status', sortable: true, filter: true },
          { field: 'healthStatus', headerName: 'Health', sortable: true, filter: true },
          {
            field: 'riskScore',
            headerName: 'Risk Score',
            sortable: true,
            valueFormatter: (params) => `${params.value}/100`,
          },
          { field: 'vulnerabilitiesCount', headerName: 'Vulnerabilities', sortable: true },
          { field: 'licenseStatus', headerName: 'License', sortable: true, filter: true },
        ];

      case 'policies':
        return [
          { field: 'name', headerName: 'Policy Name', sortable: true, filter: true, pinned: 'left' },
          { field: 'policyType', headerName: 'Type', sortable: true, filter: true },
          { field: 'category', headerName: 'Category', sortable: true, filter: true },
          { field: 'status', headerName: 'Status', sortable: true, filter: true },
          { field: 'enforcementMode', headerName: 'Enforcement', sortable: true, filter: true },
          { field: 'complianceStatus', headerName: 'Compliance', sortable: true, filter: true },
          { field: 'severity', headerName: 'Severity', sortable: true, filter: true },
          { field: 'ruleCount', headerName: 'Rules', sortable: true },
          { field: 'activeRules', headerName: 'Active', sortable: true },
          { field: 'violationCount', headerName: 'Violations', sortable: true },
          {
            field: 'lastModified',
            headerName: 'Last Modified',
            sortable: true,
            valueFormatter: (params) => formatDate(params.value),
          },
          { field: 'modifiedBy', headerName: 'Modified By', sortable: true },
        ];

      case 'incidents':
        return [
          { field: 'title', headerName: 'Incident', sortable: true, filter: true, pinned: 'left' },
          { field: 'incidentType', headerName: 'Type', sortable: true, filter: true },
          { field: 'severity', headerName: 'Severity', sortable: true, filter: true },
          { field: 'priority', headerName: 'Priority', sortable: true, filter: true },
          { field: 'status', headerName: 'Status', sortable: true, filter: true },
          {
            field: 'riskScore',
            headerName: 'Risk Score',
            sortable: true,
            valueFormatter: (params) => `${params.value}/100`,
          },
          {
            field: 'detectedAt',
            headerName: 'Detected',
            sortable: true,
            valueFormatter: (params) => formatDate(params.value),
          },
          { field: 'assignedTo', headerName: 'Assigned To', sortable: true, filter: true },
          { field: 'sourceDevice', headerName: 'Source', sortable: true },
          { field: 'targetAsset', headerName: 'Target', sortable: true },
          {
            field: 'timeToResolve',
            headerName: 'Time to Resolve',
            sortable: true,
            valueFormatter: (params) => params.value ? formatDuration(params.value * 1000) : 'N/A',
          },
        ];

      case 'vulnerabilities':
        return [
          { field: 'title', headerName: 'Vulnerability', sortable: true, filter: true, pinned: 'left' },
          { field: 'cveId', headerName: 'CVE ID', sortable: true, filter: true },
          { field: 'severity', headerName: 'Severity', sortable: true, filter: true },
          { field: 'cvssScore', headerName: 'CVSS Score', sortable: true },
          { field: 'status', headerName: 'Status', sortable: true, filter: true },
          { field: 'affectedCount', headerName: 'Affected', sortable: true },
          { field: 'exploitability', headerName: 'Exploitability', sortable: true, filter: true },
          { field: 'patchAvailable', headerName: 'Patch Available', sortable: true },
          { field: 'remediationStatus', headerName: 'Remediation', sortable: true, filter: true },
          {
            field: 'discoveredAt',
            headerName: 'Discovered',
            sortable: true,
            valueFormatter: (params) => formatDate(params.value),
          },
          {
            field: 'targetRemediationDate',
            headerName: 'Target Date',
            sortable: true,
            valueFormatter: (params) => params.value ? formatDate(params.value) : 'Not set',
          },
        ];

      default:
        return [];
    }
  }, [state.selectedTab]);

  // Helper functions
  const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
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
    isCancelling: state.isCancelling,
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
