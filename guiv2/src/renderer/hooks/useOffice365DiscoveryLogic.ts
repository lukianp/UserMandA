/**
 * Office 365 Discovery View Logic Hook
 * Manages state and business logic for Office 365 discovery operations
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  progress: Office365DiscoveryProgress | null;
  selectedTab: 'overview' | 'users' | 'licenses' | 'services' | 'security';
  selectedObjects: any[];

  // Errors
  errors: string[];
}

/**
 * Office 365 Discovery Logic Hook
 */
export const useOffice365DiscoveryLogic = () => {
  // State
  const [state, setState] = useState<Office365DiscoveryState>({
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
      if (data.type === 'office365-discovery') {
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
    setState(prev => ({ ...prev, isDiscovering: true, errors: [], progress: null }));

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/Office365Discovery.psm1',
        functionName: 'Invoke-Office365Discovery',
        parameters: {
          TenantId: state.config.tenantId,
          TenantDomain: state.config.tenantDomain,
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
          StreamProgress: true,
        },
      });

      if (result.success && result.data) {
        const discoveryResult: Office365DiscoveryResult = result.data;
        setState(prev => ({
          ...prev,
          currentResult: discoveryResult,
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
        modulePath: 'Modules/Discovery/Office365Discovery.psm1',
        functionName: 'Stop-Office365Discovery',
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
        data = [...state.currentResult.users, ...(state.currentResult.guestUsers || [])];
        break;
      case 'licenses':
        data = state.currentResult.licenses;
        break;
      case 'services':
        data = state.currentResult.services;
        break;
      case 'security':
        data = state.currentResult.securityConfig?.conditionalAccessPolicies || [];
        break;
      default:
        return [];
    }

    // Apply search text filter
    if (debouncedSearch) {
      data = data.filter((item: any) => {
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
      data = data.filter((item: any) => item.userType === filter.userType);
    }

    // Apply account status filter
    if (state.selectedTab === 'users' && filter.accountStatus !== 'all') {
      const enabled = filter.accountStatus === 'enabled';
      data = data.filter((item: any) => item.accountEnabled === enabled);
    }

    // Apply MFA status filter
    if (state.selectedTab === 'users' && filter.mfaStatus !== 'all') {
      const mfaEnabled = filter.mfaStatus === 'enabled';
      data = data.filter((item: any) => {
        const hasMFA = item.mfaStatus?.state === 'enabled' || item.mfaStatus?.state === 'enforced';
        return hasMFA === mfaEnabled;
      });
    }

    // Apply license status filter
    if (state.selectedTab === 'users' && filter.licenseStatus !== 'all') {
      const isLicensed = filter.licenseStatus === 'licensed';
      data = data.filter((item: any) => {
        const hasLicense = item.licenses && item.licenses.length > 0;
        return hasLicense === isLicensed;
      });
    }

    // Apply admin status filter
    if (state.selectedTab === 'users' && filter.adminStatus !== 'all') {
      const isAdmin = filter.adminStatus === 'admin';
      data = data.filter((item: any) => item.isAdmin === isAdmin);
    }

    return data;
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
