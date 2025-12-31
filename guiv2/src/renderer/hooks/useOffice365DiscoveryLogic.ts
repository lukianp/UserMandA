/**
 * Office 365 Discovery View Logic Hook
 * Manages state and business logic for Office 365 discovery operations
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ColDef } from 'ag-grid-community';

import {
  Office365DiscoveryConfig,
  Office365DiscoveryResult,
  Office365DiscoveryProgress,
  Office365DiscoveryFilter,
  Office365DiscoveryTemplate,
  Office365User,
  Office365License,
  Office365Service,
  ConditionalAccessPolicy,
} from '../types/models/office365';

import { useDebounce } from './useDebounce';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { useProfileStore } from '../store/useProfileStore';

/**
 * Log Entry Interface for PowerShellExecutionDialog
 */
export interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

/**
 * Office 365 Discovery View State
 */
interface Office365DiscoveryState {
  // Configuration
  config: Office365DiscoveryConfig;
  templates: Office365DiscoveryTemplate[];

  // Results
  currentResult: Office365DiscoveryResult | null;
  historicalResults: Office365DiscoveryResult[];

  // Filtering
  filter: Office365DiscoveryFilter;
  searchText: string;

  // UI State
  isDiscovering: boolean;
  isCancelling: boolean;
  progress: Office365DiscoveryProgress | null;
  selectedTab: 'overview' | 'users' | 'licenses' | 'services' | 'security';
  selectedObjects: any[];

  // PowerShellExecutionDialog state
  logs: LogEntry[];
  showExecutionDialog: boolean;

  // Errors
  errors: string[];
}

/**
 * Office 365 Discovery Logic Hook
 */
export const useOffice365DiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  // State
  const [state, setState] = useState<Office365DiscoveryState>({
    config: createDefaultConfig(),
    templates: [],
    currentResult: null,
    historicalResults: [],
    filter: createDefaultFilter(),
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

  const debouncedSearch = useDebounce(state.searchText, 300);

  // Load previous discovery results from store on mount
  useEffect(() => {
    const previousResults = getResultsByModuleName('Office365Discovery');
    if (previousResults && previousResults.length > 0) {
      console.log('[Office365DiscoveryHook] Restoring', previousResults.length, 'previous results from store');
      const latestResult = previousResults[previousResults.length - 1];
      setState(prev => ({ ...prev, currentResult: latestResult.additionalData as Office365DiscoveryResult }));
    }
  }, [getResultsByModuleName]);

  // Load templates and historical results on mount
  useEffect(() => {
    loadTemplates();
    loadHistoricalResults();
  }, []);

  // Event listeners for discovery events - set up ONCE on mount
  useEffect(() => {
    console.log('[Office365DiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[Office365DiscoveryHook] Discovery output:', data.message);
        const logLevel: LogEntry['level'] = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warning' : 'info';
        const logEntry: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          message: data.message,
          level: logLevel,
        };
        setState(prev => ({
          ...prev,
          logs: [...prev.logs, logEntry],
          progress: prev.progress ? {
            ...prev.progress,
            currentOperation: data.message,
          } : null
        }));
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[Office365DiscoveryHook] Discovery complete:', data);

        const result = {
          id: `office365-discovery-${Date.now()}`,
          name: 'Office 365 Discovery',
          moduleName: 'Office365Discovery',
          displayName: 'Office 365 Discovery',
          itemCount: data?.result?.totalItems || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalItems || 0} Office 365 items`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        // Transform the raw PowerShell result to the expected structure
        let transformedResult: Office365DiscoveryResult;
        const rawResult = data.result;

        if (rawResult && rawResult.Data && Array.isArray(rawResult.Data)) {
          // Group data by _DataType
          const groupedData = rawResult.Data.reduce((acc: any, item: any) => {
            const type = item._DataType;
            if (!acc[type]) acc[type] = [];
            acc[type].push(item);
            return acc;
          }, {});

          transformedResult = {
            id: `office365-discovery-${Date.now()}`,
            configId: state.config.id,
            configName: state.config.name,
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            status: 'completed',
            progress: 100,
            tenant: null,
            users: groupedData.User || [],
            guestUsers: groupedData.GuestUser || [],
            licenses: groupedData.License || [],
            services: groupedData.Service || [],
            securityConfig: {
              conditionalAccessPolicies: groupedData.ConditionalAccessPolicy || [],
              mfaEnforced: false,
              mfaRegisteredUsers: 0,
              mfaEnabledUsers: 0,
              mfaCoverage: 0,
              securityDefaultsEnabled: false,
              passwordPolicies: [],
              dlpPolicies: groupedData.DLPPolicy || [],
              threatProtectionEnabled: false,
              advancedThreatProtectionEnabled: false,
              retentionPolicies: groupedData.RetentionPolicy || [],
              sensitivityLabels: [],
              auditLogEnabled: false,
              unifiedAuditLogEnabled: false,
            },
            stats: {
              totalUsers: (groupedData.User?.length || 0) + (groupedData.GuestUser?.length || 0),
              enabledUsers: 0,
              disabledUsers: 0,
              guestUsers: groupedData.GuestUser?.length || 0,
              adminUsers: 0,
              mfaEnabledUsers: 0,
              mfaRegisteredUsers: 0,
              totalLicenses: groupedData.License?.length || 0,
              assignedLicenses: 0,
              availableLicenses: 0,
              totalServices: groupedData.Service?.length || 0,
              healthyServices: 0,
              degradedServices: 0,
              unavailableServices: 0,
              conditionalAccessPolicies: groupedData.ConditionalAccessPolicy?.length || 0,
              dlpPolicies: groupedData.DLPPolicy?.length || 0,
              retentionPolicies: groupedData.RetentionPolicy?.length || 0,
            },
            errors: rawResult.Errors || [],
            warnings: rawResult.Warnings || [],
            duration: data.duration,
            objectsPerSecond: 0,
          };
        } else {
          // Fallback to default structure if transformation fails
          console.log('[Office365DiscoveryHook] Data transformation failed, using default structure');
          transformedResult = {
            id: `office365-discovery-${Date.now()}`,
            configId: state.config.id,
            configName: state.config.name,
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            status: 'completed',
            progress: 100,
            tenant: null,
            users: [],
            guestUsers: [],
            licenses: [],
            services: [],
            securityConfig: {
              conditionalAccessPolicies: [],
              mfaEnforced: false,
              mfaRegisteredUsers: 0,
              mfaEnabledUsers: 0,
              mfaCoverage: 0,
              securityDefaultsEnabled: false,
              passwordPolicies: [],
              dlpPolicies: [],
              threatProtectionEnabled: false,
              advancedThreatProtectionEnabled: false,
              retentionPolicies: [],
              sensitivityLabels: [],
              auditLogEnabled: false,
              unifiedAuditLogEnabled: false,
            },
            stats: {
              totalUsers: 0,
              enabledUsers: 0,
              disabledUsers: 0,
              guestUsers: 0,
              adminUsers: 0,
              mfaEnabledUsers: 0,
              mfaRegisteredUsers: 0,
              totalLicenses: 0,
              assignedLicenses: 0,
              availableLicenses: 0,
              totalServices: 0,
              healthyServices: 0,
              degradedServices: 0,
              unavailableServices: 0,
              conditionalAccessPolicies: 0,
              dlpPolicies: 0,
              retentionPolicies: 0,
            },
            errors: rawResult?.Errors || [],
            warnings: rawResult?.Warnings || [],
            duration: data.duration,
            objectsPerSecond: 0,
          };
        }

        const successLog: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          message: `Discovery completed! Found ${data?.result?.totalItems || transformedResult.stats?.totalUsers || 0} Office 365 items.`,
          level: 'success',
        };
        setState(prev => ({
          ...prev,
          currentResult: transformedResult,
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
        console.error('[Office365DiscoveryHook] Discovery error:', data.error);
        const errorLog: LogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          message: `Discovery failed: ${data.error}`,
          level: 'error',
        };
        setState(prev => ({
          ...prev,
          isDiscovering: false,
          isCancelling: false,
          errors: [...prev.errors, data.error],
          progress: null,
          logs: [...prev.logs, errorLog],
        }));
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[Office365DiscoveryHook] Discovery cancelled');
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
        modulePath: 'Modules/Discovery/Office365Discovery.psm1',
        functionName: 'Get-Office365DiscoveryTemplates',
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
        modulePath: 'Modules/Discovery/Office365Discovery.psm1',
        functionName: 'Get-Office365DiscoveryHistory',
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
   * Start Office 365 Discovery
   */
  const startDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      setState(prev => ({
        ...prev,
        errors: ['No company profile selected. Please select a profile first.']
      }));
      return;
    }

    const token = `office365-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    currentTokenRef.current = token;

    const initialLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      message: `Starting Office 365 discovery for ${selectedSourceProfile.companyName}...`,
      level: 'info',
    };
    setState(prev => ({
      ...prev,
      isDiscovering: true,
      errors: [],
      progress: null,
      logs: [initialLog],
      showExecutionDialog: true,
    }));

    try {
      console.log('[Office365DiscoveryHook] Starting discovery with token:', token);

      const result = await window.electron.executeDiscovery({
        moduleName: 'Office365',
        parameters: {
          IncludeUsers: state.config.includeUsers,
          IncludeGuests: state.config.includeGuests,
          IncludeLicenses: state.config.includeLicenses,
          IncludeServices: state.config.includeServices,
          IncludeSecurity: state.config.includeSecurity,
          IncludeCompliance: state.config.includeCompliance,
          IncludeConditionalAccess: state.config.includeConditionalAccess,
          IncludeMFAStatus: state.config.includeMFAStatus,
          IncludeAdminRoles: state.config.includeAdminRoles,
          IncludeServiceHealth: state.config.includeServiceHealth,
        },
        executionOptions: {
          timeout: state.config.timeout || 600000,
          showWindow: false,
        },
        executionId: token,
      });

      console.log('[Office365DiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      console.error('[Office365DiscoveryHook] Discovery error:', error);
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        errors: [...prev.errors, error.message || 'Unknown error occurred'],
        progress: null,
      }));
      currentTokenRef.current = null;
    }
  }, [state.config, selectedSourceProfile]);

  /**
   * Cancel ongoing discovery
   */
  const cancelDiscovery = useCallback(async () => {
    if (!currentTokenRef.current) return;

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

    try {
      console.log('[Office365DiscoveryHook] Cancelling discovery:', currentTokenRef.current);
      await window.electron.cancelDiscovery(currentTokenRef.current);

      setTimeout(() => {
        setState(prev => ({ ...prev, isDiscovering: false, isCancelling: false, progress: null }));
        currentTokenRef.current = null;
      }, 2000);
    } catch (error) {
      console.error('[Office365DiscoveryHook] Failed to cancel discovery:', error);
      setState(prev => ({ ...prev, isDiscovering: false, isCancelling: false, progress: null }));
      currentTokenRef.current = null;
    }
  }, []);

  /**
   * Update discovery configuration
   */
  const updateConfig = useCallback((updates: Partial<Office365DiscoveryConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  }, []);

  /**
   * Load a template
   */
  const loadTemplate = useCallback((template: Office365DiscoveryTemplate) => {
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
      const template: Omit<Office365DiscoveryTemplate, 'id' | 'createdDate' | 'modifiedDate'> = {
        name,
        description,
        category: category as any,
        config: state.config,
        createdBy: 'CurrentUser',
        isSystem: false,
      };

      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/Office365Discovery.psm1',
        functionName: 'Save-Office365DiscoveryTemplate',
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
        modulePath: 'Modules/Discovery/Office365Discovery.psm1',
        functionName: 'Export-Office365DiscoveryResults',
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
    if (!state.currentResult) return [];

    const { filter } = state;
    let data: any[] = [];

    switch (state.selectedTab) {
      case 'users':
        const users = state.currentResult.users || [];
        const guestUsers = state.currentResult.guestUsers || [];
        data = [...users, ...guestUsers];
        break;
      case 'licenses':
        data = state.currentResult.licenses || [];
        break;
      case 'services':
        data = state.currentResult.services || [];
        break;
      case 'security':
        data = state.currentResult.securityConfig?.conditionalAccessPolicies || [];
        break;
      default:
        return [];
    }

    // Apply search text filter
    if (debouncedSearch) {
      data = (data ?? []).filter((item: any) => {
        const searchLower = debouncedSearch.toLowerCase();
        return (
          item.displayName?.toLowerCase().includes(searchLower) ||
          item.userPrincipalName?.toLowerCase().includes(searchLower) ||
          item.mail?.toLowerCase().includes(searchLower) ||
          item.productName?.toLowerCase().includes(searchLower) ||
          item.serviceName?.toLowerCase().includes(searchLower) ||
          item.name?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply user type filter
    if (state.selectedTab === 'users' && filter.userType !== 'all') {
      data = (data ?? []).filter((item: any) => item.userType === filter.userType);
    }

    // Apply account status filter
    if (state.selectedTab === 'users' && filter.accountStatus !== 'all') {
      const enabled = filter.accountStatus === 'enabled';
      data = (data ?? []).filter((item: any) => item.accountEnabled === enabled);
    }

    // Apply MFA status filter
    if (state.selectedTab === 'users' && filter.mfaStatus !== 'all') {
      const mfaEnabled = filter.mfaStatus === 'enabled';
      data = (data ?? []).filter((item: any) => {
        const hasMFA = item.mfaStatus?.state === 'enabled' || item.mfaStatus?.state === 'enforced';
        return hasMFA === mfaEnabled;
      });
    }

    // Apply license status filter
    if (state.selectedTab === 'users' && filter.licenseStatus !== 'all') {
      const isLicensed = filter.licenseStatus === 'licensed';
      data = (data ?? []).filter((item: any) => {
        const hasLicense = item.licenses && item.licenses.length > 0;
        return hasLicense === isLicensed;
      });
    }

    // Apply admin status filter
    if (state.selectedTab === 'users' && filter.adminStatus !== 'all') {
      const isAdmin = filter.adminStatus === 'admin';
      data = (data ?? []).filter((item: any) => item.isAdmin === isAdmin);
    }

    return data || [];
  }, [state.selectedTab, state.currentResult, state.filter, debouncedSearch]);

  /**
   * Column definitions for AG Grid
   */
  const columnDefs: Record<string, any> = useMemo(() => ({
    users: [
      { field: 'displayName', headerName: 'Display Name', sortable: true, filter: true, flex: 2, pinned: 'left' },
      { field: 'userPrincipalName', headerName: 'UPN', sortable: true, filter: true, flex: 2 },
      { field: 'mail', headerName: 'Email', sortable: true, filter: true, flex: 2 },
      { field: 'userType', headerName: 'Type', sortable: true, filter: true, flex: 1 },
      {
        field: 'accountEnabled',
        headerName: 'Status',
        sortable: true,
        filter: true,
        flex: 1,
        cellRenderer: (params: any) => params.value ? '✓ Enabled' : '✗ Disabled',
        cellStyle: (params: any) => params.value ? { color: 'green' } : { color: 'red' }
      },
      {
        field: 'mfaStatus.state',
        headerName: 'MFA',
        sortable: true,
        filter: true,
        flex: 1,
        valueGetter: (params: any) => params.data.mfaStatus?.state || 'disabled',
        cellStyle: (params: any) => {
          const state = params.data.mfaStatus?.state;
          if (state === 'enabled' || state === 'enforced') return { color: 'green', fontWeight: 'bold' as const };
          return { color: 'red' };
        }
      },
      {
        field: 'licenses',
        headerName: 'Licenses',
        sortable: true,
        flex: 1,
        valueGetter: (params: any) => params.data.licenses?.length || 0
      },
      {
        field: 'isAdmin',
        headerName: 'Admin',
        sortable: true,
        filter: true,
        flex: 1,
        cellRenderer: (params: any) => params.value ? '✓ Admin' : '',
        cellStyle: (params: any) => params.value ? { color: 'orange', fontWeight: 'bold' as const } : {}
      },
      { field: 'department', headerName: 'Department', sortable: true, filter: true, flex: 1 },
      { field: 'jobTitle', headerName: 'Job Title', sortable: true, filter: true, flex: 2 },
      {
        field: 'lastSignIn',
        headerName: 'Last Sign In',
        sortable: true,
        filter: true,
        flex: 1,
        valueFormatter: (params: any) => params.value ? new Date(params.value).toLocaleDateString() : 'Never'
      },
    ],
    licenses: [
      { field: 'productName', headerName: 'Product', sortable: true, filter: true, flex: 2, pinned: 'left' },
      { field: 'skuPartNumber', headerName: 'SKU', sortable: true, filter: true, flex: 1 },
      {
        field: 'status',
        headerName: 'Status',
        sortable: true,
        filter: true,
        flex: 1,
        cellStyle: (params: any) => {
          if (params.value === 'active') return { color: 'green', fontWeight: 'bold' };
          if (params.value === 'warning') return { color: 'orange', fontWeight: 'bold' };
          return { color: 'red' };
        }
      },
      {
        field: 'assignedDate',
        headerName: 'Assigned Date',
        sortable: true,
        filter: true,
        flex: 1,
        valueFormatter: (params: any) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
      },
      {
        field: 'servicePlans',
        headerName: 'Service Plans',
        sortable: true,
        flex: 1,
        valueGetter: (params: any) => params.data.servicePlans?.length || 0
      },
      {
        field: 'disabledPlans',
        headerName: 'Disabled Plans',
        sortable: true,
        flex: 1,
        valueGetter: (params: any) => params.data.disabledPlans?.length || 0
      },
    ],
    services: [
      { field: 'displayName', headerName: 'Service', sortable: true, filter: true, flex: 2, pinned: 'left' },
      { field: 'serviceName', headerName: 'Service Name', sortable: true, filter: true, flex: 2 },
      { field: 'featureName', headerName: 'Feature', sortable: true, filter: true, flex: 2 },
      {
        field: 'healthStatus',
        headerName: 'Health Status',
        sortable: true,
        filter: true,
        flex: 2,
        cellStyle: (params: any) => {
          if (params.value === 'serviceOperational') return { color: 'green', fontWeight: 'bold' };
          if (params.value?.includes('Degradation') || params.value?.includes('investigating')) return { color: 'orange', fontWeight: 'bold' };
          return { color: 'red', fontWeight: 'bold' };
        }
      },
      {
        field: 'status.activeIncidents',
        headerName: 'Active Incidents',
        sortable: true,
        flex: 1,
        valueGetter: (params: any) => params.data.status?.activeIncidents || 0,
        cellStyle: (params: any) => {
          if (params.value > 0) return { color: 'red', fontWeight: 'bold' };
          return {};
        }
      },
      {
        field: 'status.activeAdvisories',
        headerName: 'Active Advisories',
        sortable: true,
        flex: 1,
        valueGetter: (params: any) => params.data.status?.activeAdvisories || 0
      },
      {
        field: 'lastUpdated',
        headerName: 'Last Updated',
        sortable: true,
        filter: true,
        flex: 1,
        valueFormatter: (params: any) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
      },
    ],
    security: [
      { field: 'displayName', headerName: 'Policy Name', sortable: true, filter: true, flex: 2, pinned: 'left' },
      {
        field: 'state',
        headerName: 'State',
        sortable: true,
        filter: true,
        flex: 1,
        cellStyle: (params: any) => {
          if (params.value === 'enabled') return { color: 'green', fontWeight: 'bold' };
          if (params.value === 'disabled') return { color: 'red' };
          return { color: 'orange' };
        }
      },
      {
        field: 'createdDateTime',
        headerName: 'Created',
        sortable: true,
        filter: true,
        flex: 1,
        valueFormatter: (params: any) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
      },
      {
        field: 'modifiedDateTime',
        headerName: 'Modified',
        sortable: true,
        filter: true,
        flex: 1,
        valueFormatter: (params: any) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
      },
    ],
  }), []);

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
    isDiscovering: state.isDiscovering,
    isCancelling: state.isCancelling,
    progress: state.progress,
    selectedTab: state.selectedTab,
    selectedObjects: state.selectedObjects,
    errors: state.errors,
    searchText: state.searchText,

    // PowerShellExecutionDialog state
    logs: state.logs,
    showExecutionDialog: state.showExecutionDialog,

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
    clearLogs,
    setShowExecutionDialog,
    setSelectedTab: (tab: typeof state.selectedTab) => setState(prev => ({ ...prev, selectedTab: tab })),
    setSearchText: (text: string) => setState(prev => ({ ...prev, searchText: text })),
    setSelectedObjects: (objects: any[]) => setState(prev => ({ ...prev, selectedObjects: objects })),
    updateFilter: (filter: Partial<Office365DiscoveryFilter>) =>
      setState(prev => ({ ...prev, filter: { ...prev.filter, ...filter } })),
  };
};

/**
 * Create default discovery configuration
 */
function createDefaultConfig(): Office365DiscoveryConfig {
  return {
    id: generateId(),
    name: 'New Office 365 Discovery',
    tenantId: null,
    tenantDomain: null,
    useCurrentCredentials: true,
    credentialProfileId: null,
    includeTenantInfo: true,
    includeUsers: true,
    includeGuests: true,
    includeLicenses: true,
    includeServices: true,
    includeSecurity: true,
    includeCompliance: true,
    includeConditionalAccess: true,
    includeMFAStatus: true,
    includeAdminRoles: true,
    includeServiceHealth: true,
    includeDomains: true,
    userFilter: null,
    licenseFilter: null,
    departmentFilter: null,
    includeDisabledUsers: false,
    includeDeletedUsers: false,
    maxUsers: null,
    timeout: 600,
    batchSize: 100,
    isScheduled: false,
    schedule: null,
  };
}

/**
 * Create default filter
 */
function createDefaultFilter(): Office365DiscoveryFilter {
  return {
    objectType: 'all',
    searchText: '',
    userType: 'all',
    accountStatus: 'all',
    mfaStatus: 'all',
    licenseStatus: 'all',
    adminStatus: 'all',
  };
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `o365-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}


