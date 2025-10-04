/**
 * Active Directory Discovery View Logic Hook
 * Manages state and business logic for AD discovery operations
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ColDef } from 'ag-grid-community';
import {
  ADDiscoveryConfig,
  ADDiscoveryResult,
  ADDiscoveryProgress,
  ADDiscoveryFilter,
  ADDiscoveryTemplate,
  ADUser,
  ADGroup,
  ADComputer,
  ADOrganizationalUnit,
  ADGroupPolicy,
  ADObject,
} from '../types/models/activeDirectory';
import { useDebounce } from './useDebounce';

/**
 * Active Directory Discovery View State
 */
interface ADDiscoveryState {
  // Configuration
  config: ADDiscoveryConfig;
  templates: ADDiscoveryTemplate[];

  // Results
  currentResult: ADDiscoveryResult | null;
  historicalResults: ADDiscoveryResult[];

  // Filtering
  filter: ADDiscoveryFilter;
  searchText: string;

  // UI State
  isDiscovering: boolean;
  progress: ADDiscoveryProgress | null;
  selectedTab: 'users' | 'groups' | 'computers' | 'ous' | 'gpos' | 'trusts' | 'overview';
  selectedObjects: ADObject[];

  // Errors
  errors: string[];

  // Data
  users: ADUser[];
  groups: ADGroup[];
  computers: ADComputer[];
  ous: ADOrganizationalUnit[];
  gpos: ADGroupPolicy[];
}

/**
 * Active Directory Discovery Logic Hook
 */
export const useActiveDirectoryDiscoveryLogic = () => {
  // State
  const [state, setState] = useState<ADDiscoveryState>({
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
    users: [],
    groups: [],
    computers: [],
    ous: [],
    gpos: [],
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
      if (data.type === 'ad-discovery') {
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
        modulePath: 'Modules/Discovery/ActiveDirectoryDiscovery.psm1',
        functionName: 'Get-ADDiscoveryTemplates',
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
        modulePath: 'Modules/Discovery/ActiveDirectoryDiscovery.psm1',
        functionName: 'Get-ADDiscoveryHistory',
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
   * Start Active Directory Discovery
   */
  const startDiscovery = useCallback(async () => {
    setState(prev => ({ ...prev, isDiscovering: true, errors: [], progress: null }));

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/ActiveDirectoryDiscovery.psm1',
        functionName: 'Invoke-ADDiscovery',
        parameters: {
          Config: state.config,
          StreamProgress: true,
        },
      });

      if (result.success && result.data) {
        const discoveryResult: ADDiscoveryResult = result.data;
        setState(prev => ({
          ...prev,
          currentResult: discoveryResult,
          users: discoveryResult.users || [],
          groups: discoveryResult.groups || [],
          computers: discoveryResult.computers || [],
          ous: discoveryResult.ous || [],
          gpos: discoveryResult.gpos || [],
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
        modulePath: 'Modules/Discovery/ActiveDirectoryDiscovery.psm1',
        functionName: 'Stop-ADDiscovery',
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
  const updateConfig = useCallback((updates: Partial<ADDiscoveryConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  }, []);

  /**
   * Load a template
   */
  const loadTemplate = useCallback((template: ADDiscoveryTemplate) => {
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
      const template: Omit<ADDiscoveryTemplate, 'id' | 'createdDate' | 'modifiedDate'> = {
        name,
        description,
        category: category as any,
        config: state.config,
        createdBy: 'CurrentUser', // TODO: Get from auth service
        isSystem: false,
      };

      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/ActiveDirectoryDiscovery.psm1',
        functionName: 'Save-ADDiscoveryTemplate',
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
        modulePath: 'Modules/Discovery/ActiveDirectoryDiscovery.psm1',
        functionName: 'Export-ADDiscoveryResults',
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
    let data: ADObject[] = [];

    switch (state.selectedTab) {
      case 'users':
        data = state.users;
        break;
      case 'groups':
        data = state.groups;
        break;
      case 'computers':
        data = state.computers;
        break;
      case 'ous':
        data = state.ous;
        break;
      case 'gpos':
        data = state.gpos;
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
          item.distinguishedName?.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply enabled/disabled filter
    if (!filter.includeDisabled && 'enabled' in data[0]) {
      data = data.filter((item: any) => item.enabled !== false && item.accountEnabled !== false);
    }

    return data;
  }, [state.selectedTab, state.users, state.groups, state.computers, state.ous, state.gpos, state.filter, debouncedSearch]);

  /**
   * Column definitions for AG Grid
   */
  const columnDefs: Record<string, ColDef[]> = useMemo(() => ({
    users: [
      { field: 'displayName', headerName: 'Display Name', sortable: true, filter: true, flex: 2 },
      { field: 'userPrincipalName', headerName: 'UPN', sortable: true, filter: true, flex: 2 },
      { field: 'samAccountName', headerName: 'SAM Account', sortable: true, filter: true, flex: 1 },
      { field: 'mail', headerName: 'Email', sortable: true, filter: true, flex: 2 },
      { field: 'department', headerName: 'Department', sortable: true, filter: true, flex: 1 },
      { field: 'jobTitle', headerName: 'Job Title', sortable: true, filter: true, flex: 1 },
      { field: 'accountEnabled', headerName: 'Enabled', sortable: true, filter: true, flex: 1,
        cellRenderer: (params: any) => params.value ? 'Yes' : 'No' },
      { field: 'lastLogon', headerName: 'Last Logon', sortable: true, filter: true, flex: 1,
        valueFormatter: (params: any) => params.value ? new Date(params.value).toLocaleDateString() : 'Never' },
    ],
    groups: [
      { field: 'name', headerName: 'Name', sortable: true, filter: true, flex: 2 },
      { field: 'distinguishedName', headerName: 'Distinguished Name', sortable: true, filter: true, flex: 3 },
      { field: 'groupType', headerName: 'Type', sortable: true, filter: true, flex: 1 },
      { field: 'groupScope', headerName: 'Scope', sortable: true, filter: true, flex: 1 },
      { field: 'description', headerName: 'Description', sortable: true, filter: true, flex: 2 },
      { field: 'members', headerName: 'Members', sortable: true, flex: 1,
        valueGetter: (params: any) => params.data.members?.length || 0 },
    ],
    computers: [
      { field: 'name', headerName: 'Name', sortable: true, filter: true, flex: 2 },
      { field: 'dnsHostName', headerName: 'DNS Name', sortable: true, filter: true, flex: 2 },
      { field: 'operatingSystem', headerName: 'OS', sortable: true, filter: true, flex: 2 },
      { field: 'operatingSystemVersion', headerName: 'OS Version', sortable: true, filter: true, flex: 1 },
      { field: 'enabled', headerName: 'Enabled', sortable: true, filter: true, flex: 1,
        cellRenderer: (params: any) => params.value ? 'Yes' : 'No' },
      { field: 'lastLogon', headerName: 'Last Logon', sortable: true, filter: true, flex: 1,
        valueFormatter: (params: any) => params.value ? new Date(params.value).toLocaleDateString() : 'Never' },
    ],
    ous: [
      { field: 'name', headerName: 'Name', sortable: true, filter: true, flex: 2 },
      { field: 'distinguishedName', headerName: 'Distinguished Name', sortable: true, filter: true, flex: 4 },
      { field: 'description', headerName: 'Description', sortable: true, filter: true, flex: 2 },
      { field: 'childObjects', headerName: 'Child Objects', sortable: true, filter: true, flex: 1 },
      { field: 'protectedFromAccidentalDeletion', headerName: 'Protected', sortable: true, flex: 1,
        cellRenderer: (params: any) => params.value ? 'Yes' : 'No' },
    ],
    gpos: [
      { field: 'displayName', headerName: 'Name', sortable: true, filter: true, flex: 2 },
      { field: 'gpoId', headerName: 'GUID', sortable: true, filter: true, flex: 2 },
      { field: 'gpoStatus', headerName: 'Status', sortable: true, filter: true, flex: 1 },
      { field: 'description', headerName: 'Description', sortable: true, filter: true, flex: 2 },
      { field: 'modified', headerName: 'Modified', sortable: true, filter: true, flex: 1,
        valueFormatter: (params: any) => params.value ? new Date(params.value).toLocaleDateString() : 'Unknown' },
      { field: 'links', headerName: 'Links', sortable: true, flex: 1,
        valueGetter: (params: any) => params.data.links?.length || 0 },
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
    setSelectedObjects: (objects: ADObject[]) => setState(prev => ({ ...prev, selectedObjects: objects })),
    updateFilter: (filter: Partial<ADDiscoveryFilter>) =>
      setState(prev => ({ ...prev, filter: { ...prev.filter, ...filter } })),
  };
};

/**
 * Create default discovery configuration
 */
function createDefaultConfig(): ADDiscoveryConfig {
  return {
    id: generateId(),
    name: 'New Discovery',
    targetForest: null,
    targetDomains: [],
    includeUsers: true,
    includeGroups: true,
    includeComputers: true,
    includeOUs: true,
    includeGPOs: true,
    includeTrusts: true,
    includeSchema: true,
    includeSites: true,
    userFilter: null,
    groupFilter: null,
    computerFilter: null,
    ouSearchBase: null,
    maxResults: null,
    pageSize: 1000,
    timeout: 600,
    includeDisabledAccounts: false,
    includeSystemAccounts: false,
    resolveNestedGroups: true,
    retrieveThumbnails: false,
    useCurrentCredentials: true,
    credentialProfileId: null,
    isScheduled: false,
    schedule: null,
    ldapFilter: null,
    attributes: null,
    searchScope: 'Subtree',
  };
}

/**
 * Create default filter
 */
function createDefaultFilter(): ADDiscoveryFilter {
  return {
    objectType: 'all',
    searchText: '',
    includeDisabled: false,
    domain: null,
    ou: null,
    advanced: null,
  };
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `ad-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
