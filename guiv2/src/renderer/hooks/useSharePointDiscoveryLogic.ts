/**
 * SharePoint Discovery Logic Hook
 * Contains all business logic for SharePoint discovery view
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ColDef } from 'ag-grid-community';

import {
  SharePointDiscoveryConfig,
  SharePointDiscoveryResult,
  SharePointDiscoveryProgress,
  SharePointDiscoveryTemplate,
  SharePointSite,
  SharePointList,
  SharePointPermission,
  SharePointSiteFilter,
  SharePointListFilter,
  SharePointPermissionFilter,
  SharePointExportOptions,
  DEFAULT_SHAREPOINT_CONFIG,
} from '../types/models/sharepoint';
import type { ProgressData } from '../../shared/types';

export function useSharePointDiscoveryLogic() {
  // ============================================================================
  // State Management
  // ============================================================================

  const [config, setConfig] = useState<SharePointDiscoveryConfig>(DEFAULT_SHAREPOINT_CONFIG);
  const [result, setResult] = useState<SharePointDiscoveryResult | null>(null);
  const [progress, setProgress] = useState<SharePointDiscoveryProgress | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Templates
  const [templates, setTemplates] = useState<SharePointDiscoveryTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<SharePointDiscoveryTemplate | null>(null);

  // Filters
  const [siteFilter, setSiteFilter] = useState<SharePointSiteFilter>({});
  const [listFilter, setListFilter] = useState<SharePointListFilter>({});
  const [permissionFilter, setPermissionFilter] = useState<SharePointPermissionFilter>({});

  // UI state
  const [selectedTab, setSelectedTab] = useState<'overview' | 'sites' | 'lists' | 'permissions'>('overview');

  // ============================================================================
  // Data Fetching
  // ============================================================================

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/SharePointDiscovery.psm1',
        functionName: 'Get-SharePointDiscoveryTemplates',
        parameters: {},
      });
      setTemplates(result.data?.templates || []);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  // ============================================================================
  // Discovery Execution
  // ============================================================================

  const startDiscovery = useCallback(async () => {
    setIsDiscovering(true);
    setError(null);
    setProgress({
      phase: 'initializing',
      phaseLabel: 'Initializing SharePoint discovery...',
      percentComplete: 0,
      itemsProcessed: 0,
      totalItems: 0,
      errors: 0,
      warnings: 0,
    });

    try {
      const unsubscribe = window.electronAPI.onProgress((data: ProgressData) => {
        // Convert ProgressData to SharePointDiscoveryProgress
        const progressData: SharePointDiscoveryProgress = {
          phase: 'initializing',
          phaseLabel: data.message || 'Processing...',
          percentComplete: data.percentage,
          itemsProcessed: data.itemsProcessed || 0,
          totalItems: data.totalItems || 0,
          errors: 0,
          warnings: 0,
        };
        setProgress(progressData);
      });

      const discoveryResult = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/SharePointDiscovery.psm1',
        functionName: 'Invoke-SharePointDiscovery',
        parameters: {
          Config: config,
        },
      });

      if (discoveryResult.success && discoveryResult.data) {
        setResult(discoveryResult.data as SharePointDiscoveryResult);
      } else {
        throw new Error(discoveryResult.error || 'Discovery failed');
      }
      setProgress(null);
      unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Discovery failed');
      setProgress(null);
    } finally {
      setIsDiscovering(false);
    }
  }, [config]);

  const cancelDiscovery = useCallback(async () => {
    try {
      await window.electronAPI.cancelExecution('sharepoint-discovery');
      setIsDiscovering(false);
      setProgress(null);
    } catch (err) {
      console.error('Failed to cancel discovery:', err);
    }
  }, []);

  // ============================================================================
  // Template Management
  // ============================================================================

  const loadTemplate = useCallback((template: SharePointDiscoveryTemplate) => {
    setSelectedTemplate(template);
    setConfig(template.config);
  }, []);

  const saveAsTemplate = useCallback(async (name: string, description: string) => {
    try {
      await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/SharePointDiscovery.psm1',
        functionName: 'Save-SharePointDiscoveryTemplate',
        parameters: {
          Name: name,
          Description: description,
          Config: config,
        },
      });
      await loadTemplates();
    } catch (err) {
      console.error('Failed to save template:', err);
      throw err;
    }
  }, [config]);

  // ============================================================================
  // Filtered Data
  // ============================================================================

  const filteredSites = useMemo(() => {
    if (!result?.sites) return [];

    return result.sites.filter((site) => {
      if (siteFilter.searchText) {
        const search = siteFilter.searchText.toLowerCase();
        const matches =
          site.title.toLowerCase().includes(search) ||
          site.url.toLowerCase().includes(search) ||
          site.description?.toLowerCase().includes(search);
        if (!matches) return false;
      }

      if (siteFilter.templates?.length) {
        if (!siteFilter.templates.includes(site.templateName)) return false;
      }

      if (siteFilter.minStorage !== undefined && site.storageUsage < siteFilter.minStorage) {
        return false;
      }

      if (siteFilter.maxStorage !== undefined && site.storageUsage > siteFilter.maxStorage) {
        return false;
      }

      if (siteFilter.isHubSite !== undefined && site.isHubSite !== siteFilter.isHubSite) {
        return false;
      }

      if (siteFilter.hasGroupConnection !== undefined) {
        const hasGroup = !!site.groupId;
        if (hasGroup !== siteFilter.hasGroupConnection) return false;
      }

      if (siteFilter.externalSharingEnabled !== undefined && site.externalSharingEnabled !== siteFilter.externalSharingEnabled) {
        return false;
      }

      return true;
    });
  }, [result?.sites, siteFilter]);

  const filteredLists = useMemo(() => {
    if (!result?.lists) return [];

    return result.lists.filter((list) => {
      if (listFilter.searchText) {
        const search = listFilter.searchText.toLowerCase();
        const matches =
          list.title.toLowerCase().includes(search) ||
          list.listUrl.toLowerCase().includes(search) ||
          list.description?.toLowerCase().includes(search);
        if (!matches) return false;
      }

      if (listFilter.baseTypes?.length) {
        if (!listFilter.baseTypes.includes(list.baseType)) return false;
      }

      if (listFilter.minItemCount !== undefined && list.itemCount < listFilter.minItemCount) {
        return false;
      }

      if (listFilter.maxItemCount !== undefined && list.itemCount > listFilter.maxItemCount) {
        return false;
      }

      if (listFilter.hasUniquePermissions !== undefined && list.hasUniquePermissions !== listFilter.hasUniquePermissions) {
        return false;
      }

      if (listFilter.versioningEnabled !== undefined && list.enableVersioning !== listFilter.versioningEnabled) {
        return false;
      }

      if (listFilter.moderationEnabled !== undefined && list.enableModeration !== listFilter.moderationEnabled) {
        return false;
      }

      return true;
    });
  }, [result?.lists, listFilter]);

  const filteredPermissions = useMemo(() => {
    if (!result?.permissions) return [];

    return result.permissions.filter((permission) => {
      if (permissionFilter.searchText) {
        const search = permissionFilter.searchText.toLowerCase();
        const matches =
          permission.principalName.toLowerCase().includes(search) ||
          permission.principalEmail?.toLowerCase().includes(search) ||
          permission.scopeUrl.toLowerCase().includes(search);
        if (!matches) return false;
      }

      if (permissionFilter.principalTypes?.length) {
        if (!permissionFilter.principalTypes.includes(permission.principalType)) return false;
      }

      if (permissionFilter.permissionLevels?.length) {
        if (!permissionFilter.permissionLevels.includes(permission.permissionLevel)) return false;
      }

      if (permissionFilter.scopes?.length) {
        if (!permissionFilter.scopes.includes(permission.scope)) return false;
      }

      if (permissionFilter.directOnly === true && !permission.directPermission) {
        return false;
      }

      return true;
    });
  }, [result?.permissions, permissionFilter]);

  // ============================================================================
  // AG Grid Column Definitions
  // ============================================================================

  const siteColumns = useMemo<ColDef<SharePointSite>[]>(
    () => [
      {
        field: 'title',
        headerName: 'Site Title',
        sortable: true,
        filter: true,
        pinned: 'left',
        width: 250,
      },
      {
        field: 'url',
        headerName: 'URL',
        sortable: true,
        filter: true,
        width: 350,
      },
      {
        field: 'templateName',
        headerName: 'Template',
        sortable: true,
        filter: true,
        width: 150,
      },
      {
        field: 'owner',
        headerName: 'Owner',
        sortable: true,
        filter: true,
        width: 200,
      },
      {
        field: 'storageUsage',
        headerName: 'Storage (MB)',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => params.value.toFixed(2),
        width: 120,
      },
      {
        field: 'storageQuota',
        headerName: 'Quota (MB)',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => params.value.toFixed(2),
        width: 120,
      },
      {
        field: 'isHubSite',
        headerName: 'Hub Site',
        sortable: true,
        filter: true,
        valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
        width: 100,
      },
      {
        field: 'subsiteCount',
        headerName: 'Subsites',
        sortable: true,
        filter: 'agNumberColumnFilter',
        width: 100,
      },
      {
        field: 'listCount',
        headerName: 'Lists',
        sortable: true,
        filter: 'agNumberColumnFilter',
        width: 80,
      },
      {
        field: 'externalSharingEnabled',
        headerName: 'External Sharing',
        sortable: true,
        filter: true,
        valueFormatter: (params) => (params.value ? 'Enabled' : 'Disabled'),
        width: 140,
      },
      {
        field: 'lastItemModifiedDate',
        headerName: 'Last Modified',
        sortable: true,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) =>
          params.value ? new Date(params.value).toLocaleDateString() : 'N/A',
        width: 130,
      },
    ],
    []
  );

  const listColumns = useMemo<ColDef<SharePointList>[]>(
    () => [
      {
        field: 'title',
        headerName: 'List Title',
        sortable: true,
        filter: true,
        pinned: 'left',
        width: 250,
      },
      {
        field: 'siteUrl',
        headerName: 'Site',
        sortable: true,
        filter: true,
        width: 300,
      },
      {
        field: 'baseType',
        headerName: 'Type',
        sortable: true,
        filter: true,
        width: 150,
      },
      {
        field: 'itemCount',
        headerName: 'Items',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => params.value.toLocaleString(),
        width: 100,
      },
      {
        field: 'documentCount',
        headerName: 'Documents',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => params.value.toLocaleString(),
        width: 120,
      },
      {
        field: 'totalFileSize',
        headerName: 'Size (MB)',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => (params.value / 1024 / 1024).toFixed(2),
        width: 110,
      },
      {
        field: 'enableVersioning',
        headerName: 'Versioning',
        sortable: true,
        filter: true,
        valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
        width: 110,
      },
      {
        field: 'hasUniquePermissions',
        headerName: 'Unique Perms',
        sortable: true,
        filter: true,
        valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
        width: 130,
      },
      {
        field: 'lastItemModifiedDate',
        headerName: 'Last Modified',
        sortable: true,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) =>
          params.value ? new Date(params.value).toLocaleDateString() : 'N/A',
        width: 130,
      },
    ],
    []
  );

  const permissionColumns = useMemo<ColDef<SharePointPermission>[]>(
    () => [
      {
        field: 'principalName',
        headerName: 'User/Group',
        sortable: true,
        filter: true,
        pinned: 'left',
        width: 250,
      },
      {
        field: 'principalType',
        headerName: 'Type',
        sortable: true,
        filter: true,
        width: 130,
      },
      {
        field: 'permissionLevel',
        headerName: 'Permission Level',
        sortable: true,
        filter: true,
        width: 150,
      },
      {
        field: 'scope',
        headerName: 'Scope',
        sortable: true,
        filter: true,
        width: 100,
      },
      {
        field: 'scopeUrl',
        headerName: 'Location',
        sortable: true,
        filter: true,
        width: 350,
      },
      {
        field: 'directPermission',
        headerName: 'Direct',
        sortable: true,
        filter: true,
        valueFormatter: (params) => (params.value ? 'Yes' : 'Inherited'),
        width: 100,
      },
    ],
    []
  );

  // ============================================================================
  // Export Functionality
  // ============================================================================

  const exportData = useCallback(async (options: SharePointExportOptions) => {
    if (!result) return;

    try {
      await window.electronAPI.executeModule({
        modulePath: 'Modules/Export/ExportService.psm1',
        functionName: 'Export-SharePointDiscoveryData',
        parameters: {
          Result: result,
          Options: options,
        },
      });
    } catch (err) {
      console.error('Failed to export data:', err);
      throw err;
    }
  }, [result]);

  // ============================================================================
  // Return Hook API
  // ============================================================================

  return {
    // State
    config,
    setConfig,
    result,
    currentResult: result,
    progress,
    isDiscovering,
    error,

    // Templates
    templates,
    selectedTemplate,
    loadTemplate,
    saveAsTemplate,

    // Discovery control
    startDiscovery,
    cancelDiscovery,

    // Filtered data
    sites: filteredSites,
    lists: filteredLists,
    permissions: filteredPermissions,

    // Filters
    siteFilter,
    setSiteFilter,
    listFilter,
    setListFilter,
    permissionFilter,
    setPermissionFilter,

    // AG Grid columns
    siteColumns,
    listColumns,
    permissionColumns,

    // Export
    exportData,

    // UI
    selectedTab,
    setSelectedTab,

    // Statistics
    statistics: result?.statistics,
  
  };
}
