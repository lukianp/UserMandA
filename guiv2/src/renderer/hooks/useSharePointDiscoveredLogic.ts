/**
 * SharePoint Discovered Logic Hook
 * Contains business logic for viewing discovered SharePoint data from CSV files
 * Handles sites, lists, and document libraries
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { useProfileStore } from '../store/useProfileStore';

// Types for SharePoint data (matching CSV columns)
export interface SharePointSite {
  SiteId: string;
  DisplayName: string;
  Name: string;
  WebUrl: string;
  Description: string;
  CreatedDateTime: string;
  LastModifiedDateTime: string;
  IsPersonalSite: boolean;
  SiteCollectionHostname: string;
  Root: boolean;
  StorageUsedGB: number;
  StorageQuotaGB: number;
  StoragePercentUsed: number;
  DriveId: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

export interface SharePointList {
  SiteId: string;
  SiteDisplayName: string;
  SiteWebUrl: string;
  ListId: string;
  DisplayName: string;
  Description: string;
  ListType: string;
  WebUrl: string;
  CreatedDateTime: string;
  LastModifiedDateTime: string;
  CreatedBy: string;
  Template: string;
  Hidden: boolean;
  ItemCount: number;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

export interface SharePointContentType {
  SiteId: string;
  SiteDisplayName: string;
  SiteWebUrl: string;
  ContentTypeId: string;
  Name: string;
  Description: string;
  Group: string;
  IsBuiltIn: boolean;
  IsCustom: boolean;
  Hidden: boolean;
  ReadOnly: boolean;
  Sealed: boolean;
  ParentId: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

export interface SharePointPermission {
  SiteId: string;
  SiteDisplayName: string;
  SiteWebUrl: string;
  PrincipalName: string;
  PrincipalType: string;
  RoleDefinition: string;
  Scope: string;
  InheritanceLevel: string;
  _DataType: string;
}

export interface SharePointSharingLink {
  SiteId: string;
  SiteDisplayName: string;
  ResourceName: string;
  LinkType: string;
  Scope: string;
  SharedWith: string;
  HasPassword: boolean;
  ExpirationDate: string;
  _DataType: string;
}

export interface SharePointSiteAdmin {
  SiteId: string;
  SiteDisplayName: string;
  AdminDisplayName: string;
  AdminEmail: string;
  AdminType: string;
  IsPrimaryAdmin: boolean;
  _DataType: string;
}

export interface SharePointHubSite {
  HubSiteId: string;
  HubSiteName: string;
  HubSiteUrl: string;
  Description: string;
  AssociatedSitesCount: number;
  IsRegistered: boolean;
  _DataType: string;
}

type TabType = 'overview' | 'sites' | 'lists' | 'permissions' | 'contentTypes' | 'sharing' | 'admins' | 'hubs';

interface SharePointDiscoveredState {
  sites: SharePointSite[];
  lists: SharePointList[];
  contentTypes: SharePointContentType[];
  permissions: SharePointPermission[];
  sharingLinks: SharePointSharingLink[];
  siteAdmins: SharePointSiteAdmin[];
  hubSites: SharePointHubSite[];
  isLoading: boolean;
  error: string | null;
  activeTab: TabType;
  searchText: string;
}

// Column definition for data grid (AG Grid format)
export interface ColumnDef {
  field: string;
  headerName: string;
  width?: number;
  flex?: number;
  sortable?: boolean;
  filter?: boolean;
  valueFormatter?: (params: any) => string;
}

// Helper function to load and parse CSV file
async function loadCsvFile<T>(basePath: string, filename: string): Promise<T[]> {
  const fullPath = `${basePath}\\Raw\\${filename}`;

  try {
    const exists = await window.electronAPI.fileExists(fullPath);
    if (!exists) {
      console.log(`[SharePointDiscoveredLogic] File not found: ${fullPath}`);
      return [];
    }

    const csvText = await window.electronAPI.fs.readFile(fullPath, 'utf8');
    if (!csvText || csvText.length === 0) {
      return [];
    }

    return new Promise((resolve) => {
      Papa.parse<T>(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log(`[SharePointDiscoveredLogic] Loaded ${results.data.length} records from ${filename}`);
          resolve((results.data as T[]) || []);
        },
        error: () => {
          resolve([]);
        },
      });
    });
  } catch (error) {
    console.error(`[SharePointDiscoveredLogic] Error loading ${filename}:`, error);
    return [];
  }
}

// Format bytes to human readable
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0 || bytes === null || bytes === undefined) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const useSharePointDiscoveredLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  const [state, setState] = useState<SharePointDiscoveredState>({
    sites: [],
    lists: [],
    contentTypes: [],
    permissions: [],
    sharingLinks: [],
    siteAdmins: [],
    hubSites: [],
    isLoading: true,
    error: null,
    activeTab: 'overview',
    searchText: '',
  });

  // Load data from CSV files on mount
  useEffect(() => {
    const loadData = async () => {
      if (!selectedSourceProfile?.companyName) {
        setState(prev => ({ ...prev, isLoading: false, error: 'No profile selected' }));
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const basePath = selectedSourceProfile.dataPath || `C:\\DiscoveryData\\${selectedSourceProfile.companyName}`;

        console.log('[SharePointDiscoveredLogic] Loading data from:', basePath);

        // Load all SharePoint CSV files in parallel
        const [sites, lists, contentTypes, permissions, sharingLinks, siteAdmins, hubSites] = await Promise.all([
          loadCsvFile<SharePointSite>(basePath, 'SharePointSites.csv'),
          loadCsvFile<SharePointList>(basePath, 'SharePointLists.csv'),
          loadCsvFile<SharePointContentType>(basePath, 'SharePointContentTypes.csv'),
          loadCsvFile<SharePointPermission>(basePath, 'SharePointPermissions.csv'),
          loadCsvFile<SharePointSharingLink>(basePath, 'SharePointSharingLinks.csv'),
          loadCsvFile<SharePointSiteAdmin>(basePath, 'SharePointSiteAdmins.csv'),
          loadCsvFile<SharePointHubSite>(basePath, 'SharePointHubSites.csv'),
        ]);

        console.log('[SharePointDiscoveredLogic] Loaded:', {
          sites: sites.length,
          lists: lists.length,
          contentTypes: contentTypes.length,
          permissions: permissions.length,
          sharingLinks: sharingLinks.length,
          siteAdmins: siteAdmins.length,
          hubSites: hubSites.length
        });

        setState(prev => ({
          ...prev,
          sites,
          lists,
          contentTypes,
          permissions,
          sharingLinks,
          siteAdmins,
          hubSites,
          isLoading: false,
        }));
      } catch (error: any) {
        console.error('[SharePointDiscoveredLogic] Failed to load data:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to load SharePoint data',
        }));
      }
    };

    loadData();
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  // Tab management
  const setActiveTab = useCallback((tab: TabType) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  // Search management
  const setSearchText = useCallback((text: string) => {
    setState(prev => ({ ...prev, searchText: text }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Reload data
  const reloadData = useCallback(async () => {
    if (!selectedSourceProfile?.companyName) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const basePath = selectedSourceProfile.dataPath || `C:\\DiscoveryData\\${selectedSourceProfile.companyName}`;

      const [sites, lists, contentTypes, permissions, sharingLinks, siteAdmins, hubSites] = await Promise.all([
        loadCsvFile<SharePointSite>(basePath, 'SharePointSites.csv'),
        loadCsvFile<SharePointList>(basePath, 'SharePointLists.csv'),
        loadCsvFile<SharePointContentType>(basePath, 'SharePointContentTypes.csv'),
        loadCsvFile<SharePointPermission>(basePath, 'SharePointPermissions.csv'),
        loadCsvFile<SharePointSharingLink>(basePath, 'SharePointSharingLinks.csv'),
        loadCsvFile<SharePointSiteAdmin>(basePath, 'SharePointSiteAdmins.csv'),
        loadCsvFile<SharePointHubSite>(basePath, 'SharePointHubSites.csv'),
      ]);

      setState(prev => ({
        ...prev,
        sites,
        lists,
        contentTypes,
        permissions,
        sharingLinks,
        siteAdmins,
        hubSites,
        isLoading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to reload SharePoint data',
      }));
    }
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  // Filtered sites
  const filteredSites = useMemo(() => {
    let filtered = [...state.sites];

    if (state.searchText) {
      const search = state.searchText.toLowerCase();
      filtered = filtered.filter(site =>
        site.DisplayName?.toLowerCase().includes(search) ||
        site.Name?.toLowerCase().includes(search) ||
        site.WebUrl?.toLowerCase().includes(search) ||
        site.SiteCollectionHostname?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [state.sites, state.searchText]);

  // Filtered lists
  const filteredLists = useMemo(() => {
    let filtered = [...state.lists];

    if (state.searchText) {
      const search = state.searchText.toLowerCase();
      filtered = filtered.filter(list =>
        list.DisplayName?.toLowerCase().includes(search) ||
        list.SiteDisplayName?.toLowerCase().includes(search) ||
        list.ListType?.toLowerCase().includes(search) ||
        list.Template?.toLowerCase().includes(search) ||
        list.WebUrl?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [state.lists, state.searchText]);

  // Filtered content types
  const filteredContentTypes = useMemo(() => {
    let filtered = [...state.contentTypes];

    if (state.searchText) {
      const search = state.searchText.toLowerCase();
      filtered = filtered.filter(ct =>
        ct.Name?.toLowerCase().includes(search) ||
        ct.Description?.toLowerCase().includes(search) ||
        ct.Group?.toLowerCase().includes(search) ||
        ct.SiteDisplayName?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [state.contentTypes, state.searchText]);

  // Filtered permissions
  const filteredPermissions = useMemo(() => {
    let filtered = [...state.permissions];

    if (state.searchText) {
      const search = state.searchText.toLowerCase();
      filtered = filtered.filter(p =>
        p.PrincipalName?.toLowerCase().includes(search) ||
        p.RoleDefinition?.toLowerCase().includes(search) ||
        p.SiteDisplayName?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [state.permissions, state.searchText]);

  // Filtered sharing links
  const filteredSharingLinks = useMemo(() => {
    let filtered = [...state.sharingLinks];

    if (state.searchText) {
      const search = state.searchText.toLowerCase();
      filtered = filtered.filter(s =>
        s.ResourceName?.toLowerCase().includes(search) ||
        s.SharedWith?.toLowerCase().includes(search) ||
        s.SiteDisplayName?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [state.sharingLinks, state.searchText]);

  // Filtered site admins
  const filteredSiteAdmins = useMemo(() => {
    let filtered = [...state.siteAdmins];

    if (state.searchText) {
      const search = state.searchText.toLowerCase();
      filtered = filtered.filter(a =>
        a.AdminDisplayName?.toLowerCase().includes(search) ||
        a.AdminEmail?.toLowerCase().includes(search) ||
        a.SiteDisplayName?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [state.siteAdmins, state.searchText]);

  // Filtered hub sites
  const filteredHubSites = useMemo(() => {
    let filtered = [...state.hubSites];

    if (state.searchText) {
      const search = state.searchText.toLowerCase();
      filtered = filtered.filter(h =>
        h.HubSiteName?.toLowerCase().includes(search) ||
        h.Description?.toLowerCase().includes(search) ||
        h.HubSiteUrl?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [state.hubSites, state.searchText]);

  // Calculate enhanced statistics with Discovery Success %
  const statistics = useMemo(() => {
    const sites = state.sites;
    const lists = state.lists;
    const contentTypes = state.contentTypes;
    const permissions = state.permissions;
    const sharingLinks = state.sharingLinks;
    const siteAdmins = state.siteAdmins;
    const hubSites = state.hubSites;

    // Calculate Discovery Success % based on expected data sources
    // Weighted by migration importance - Sites and Lists are critical
    const expectedSources = [
      { name: 'Sites', hasData: sites.length > 0, weight: 25 },
      { name: 'Lists', hasData: lists.length > 0, weight: 25 },
      { name: 'Permissions', hasData: permissions.length > 0, weight: 15 },
      { name: 'ContentTypes', hasData: contentTypes.length > 0, weight: 10 },
      { name: 'Sharing', hasData: true, weight: 10 },  // 0 is valid (no external sharing)
      { name: 'Admins', hasData: siteAdmins.length > 0, weight: 10 },
      { name: 'HubSites', hasData: true, weight: 5 },   // 0 is valid (no hubs configured)
    ];
    const totalWeight = expectedSources.reduce((sum, s) => sum + s.weight, 0);
    const achievedWeight = expectedSources.reduce((sum, s) => sum + (s.hasData ? s.weight : 0), 0);
    const discoverySuccessPercentage = Math.round((achievedWeight / totalWeight) * 100);
    const dataSourcesReceivedCount = expectedSources.filter(s => s.hasData).length;
    const dataSourcesTotal = expectedSources.length;

    // Site type breakdown
    const personalSites = sites.filter(s => s.IsPersonalSite).length;
    const teamSites = sites.filter(s => !s.IsPersonalSite).length;
    const rootSites = sites.filter(s => s.Root).length;

    // Storage analysis
    const totalStorageUsedGB = sites.reduce((sum, s) => sum + (s.StorageUsedGB || 0), 0);
    const totalStorageQuotaGB = sites.reduce((sum, s) => sum + (s.StorageQuotaGB || 0), 0);
    const avgStoragePercent = sites.length > 0
      ? sites.reduce((sum, s) => sum + (s.StoragePercentUsed || 0), 0) / sites.length
      : 0;

    // List type breakdown
    const documentLibraries = lists.filter(l => l.ListType === 'DocumentLibrary').length;
    const genericLists = lists.filter(l => l.ListType === 'List').length;
    const hiddenLists = lists.filter(l => l.Hidden).length;
    const visibleLists = lists.filter(l => !l.Hidden).length;

    // Template breakdown
    const templateCounts: Record<string, number> = {};
    lists.forEach(l => {
      const template = l.Template || 'Unknown';
      templateCounts[template] = (templateCounts[template] || 0) + 1;
    });

    // Top templates
    const topTemplates = Object.entries(templateCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([template, count]) => ({ template, count }));

    // Site with most lists
    const sitesWithListCounts = state.sites.map(site => {
      const listCount = lists.filter(l => l.SiteId === site.SiteId).length;
      return { ...site, listCount };
    }).sort((a, b) => b.listCount - a.listCount);

    const topSitesByLists = sitesWithListCounts.slice(0, 5);

    // Total items across all lists
    const totalItems = lists.reduce((sum, l) => sum + (l.ItemCount || 0), 0);

    // Sites by hostname
    const hostnameCounts: Record<string, number> = {};
    sites.forEach(s => {
      const hostname = s.SiteCollectionHostname || 'Unknown';
      hostnameCounts[hostname] = (hostnameCounts[hostname] || 0) + 1;
    });

    // Content type breakdown
    const totalContentTypes = contentTypes.length;
    const builtInContentTypes = contentTypes.filter(ct => ct.IsBuiltIn).length;
    const customContentTypes = contentTypes.filter(ct => ct.IsCustom).length;
    const hiddenContentTypes = contentTypes.filter(ct => ct.Hidden).length;

    // Content type groups
    const groupCounts: Record<string, number> = {};
    contentTypes.forEach(ct => {
      const group = ct.Group || 'Unknown';
      groupCounts[group] = (groupCounts[group] || 0) + 1;
    });

    const topGroups = Object.entries(groupCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([group, count]) => ({ group, count }));

    return {
      // Discovery Success
      discoverySuccessPercentage,
      dataSourcesReceivedCount,
      dataSourcesTotal,
      dataSourcesReceived: expectedSources.filter(s => s.hasData).map(s => s.name),

      // Totals
      totalSites: sites.length,
      totalLists: lists.length,
      totalItems,
      totalContentTypes,
      totalPermissions: permissions.length,
      totalSharingLinks: sharingLinks.length,
      totalSiteAdmins: siteAdmins.length,
      totalHubSites: hubSites.length,

      // Site breakdown
      personalSites,
      teamSites,
      rootSites,

      // Storage
      totalStorageUsedGB,
      totalStorageQuotaGB,
      avgStoragePercent,

      // List breakdown
      documentLibraries,
      genericLists,
      hiddenLists,
      visibleLists,

      // Content type breakdown
      builtInContentTypes,
      customContentTypes,
      hiddenContentTypes,

      // Analysis
      templateCounts,
      topTemplates,
      topSitesByLists,
      hostnameCounts,
      groupCounts,
      topGroups,
    };
  }, [state.sites, state.lists, state.contentTypes, state.permissions, state.sharingLinks, state.siteAdmins, state.hubSites]);

  // Column definitions for data grids (AG Grid format)
  const siteColumns: ColumnDef[] = [
    { field: 'DisplayName', headerName: 'Site Name', width: 200, sortable: true, filter: true },
    { field: 'WebUrl', headerName: 'URL', width: 300, sortable: true, filter: true },
    { field: 'IsPersonalSite', headerName: 'Personal', width: 90, sortable: true, filter: true, valueFormatter: (p) => p.value ? 'Yes' : 'No' },
    { field: 'StorageUsedGB', headerName: 'Storage (GB)', width: 110, sortable: true, filter: true, valueFormatter: (p) => p.value?.toFixed(2) || '0' },
    { field: 'StorageQuotaGB', headerName: 'Quota (GB)', width: 100, sortable: true, filter: true, valueFormatter: (p) => p.value?.toFixed(0) || '0' },
    { field: 'StoragePercentUsed', headerName: 'Usage %', width: 90, sortable: true, filter: true, valueFormatter: (p) => `${p.value?.toFixed(1) || 0}%` },
    { field: 'Root', headerName: 'Root', width: 70, sortable: true, filter: true, valueFormatter: (p) => p.value ? 'Yes' : 'No' },
    { field: 'CreatedDateTime', headerName: 'Created', width: 140, sortable: true, filter: true },
    { field: 'SiteCollectionHostname', headerName: 'Hostname', width: 200, sortable: true, filter: true },
  ];

  const listColumns: ColumnDef[] = [
    { field: 'DisplayName', headerName: 'List Name', width: 200, sortable: true, filter: true },
    { field: 'SiteDisplayName', headerName: 'Site', width: 180, sortable: true, filter: true },
    { field: 'ListType', headerName: 'Type', width: 120, sortable: true, filter: true },
    { field: 'Template', headerName: 'Template', width: 130, sortable: true, filter: true },
    { field: 'ItemCount', headerName: 'Items', width: 80, sortable: true, filter: true },
    { field: 'Hidden', headerName: 'Hidden', width: 80, sortable: true, filter: true, valueFormatter: (p) => p.value ? 'Yes' : 'No' },
    { field: 'CreatedBy', headerName: 'Created By', width: 130, sortable: true, filter: true },
    { field: 'CreatedDateTime', headerName: 'Created', width: 140, sortable: true, filter: true },
    { field: 'LastModifiedDateTime', headerName: 'Modified', width: 140, sortable: true, filter: true },
    { field: 'WebUrl', headerName: 'URL', width: 250, sortable: true, filter: true },
  ];

  const contentTypeColumns: ColumnDef[] = [
    { field: 'Name', headerName: 'Content Type', width: 200, sortable: true, filter: true },
    { field: 'Description', headerName: 'Description', width: 250, sortable: true, filter: true },
    { field: 'Group', headerName: 'Group', width: 150, sortable: true, filter: true },
    { field: 'SiteDisplayName', headerName: 'Site', width: 180, sortable: true, filter: true },
    { field: 'IsBuiltIn', headerName: 'Built-In', width: 90, sortable: true, filter: true, valueFormatter: (p) => p.value ? 'Yes' : 'No' },
    { field: 'IsCustom', headerName: 'Custom', width: 90, sortable: true, filter: true, valueFormatter: (p) => p.value ? 'Yes' : 'No' },
    { field: 'Hidden', headerName: 'Hidden', width: 80, sortable: true, filter: true, valueFormatter: (p) => p.value ? 'Yes' : 'No' },
    { field: 'ReadOnly', headerName: 'Read Only', width: 90, sortable: true, filter: true, valueFormatter: (p) => p.value ? 'Yes' : 'No' },
    { field: 'Sealed', headerName: 'Sealed', width: 80, sortable: true, filter: true, valueFormatter: (p) => p.value ? 'Yes' : 'No' },
    { field: 'ContentTypeId', headerName: 'Content Type ID', width: 180, sortable: true, filter: true },
  ];

  const permissionColumns: ColumnDef[] = [
    { field: 'PrincipalName', headerName: 'Principal', width: 200, sortable: true, filter: true },
    { field: 'PrincipalType', headerName: 'Type', width: 100, sortable: true, filter: true },
    { field: 'RoleDefinition', headerName: 'Role', width: 150, sortable: true, filter: true },
    { field: 'Scope', headerName: 'Scope', width: 120, sortable: true, filter: true },
    { field: 'InheritanceLevel', headerName: 'Inheritance', width: 120, sortable: true, filter: true },
    { field: 'SiteDisplayName', headerName: 'Site', width: 180, sortable: true, filter: true },
    { field: 'SiteWebUrl', headerName: 'Site URL', width: 250, sortable: true, filter: true },
  ];

  const sharingLinkColumns: ColumnDef[] = [
    { field: 'ResourceName', headerName: 'Resource', width: 200, sortable: true, filter: true },
    { field: 'LinkType', headerName: 'Link Type', width: 130, sortable: true, filter: true },
    { field: 'Scope', headerName: 'Scope', width: 120, sortable: true, filter: true },
    { field: 'SharedWith', headerName: 'Shared With', width: 180, sortable: true, filter: true },
    { field: 'HasPassword', headerName: 'Password', width: 90, sortable: true, filter: true, valueFormatter: (p) => p.value ? 'Yes' : 'No' },
    { field: 'ExpirationDate', headerName: 'Expires', width: 140, sortable: true, filter: true },
    { field: 'SiteDisplayName', headerName: 'Site', width: 180, sortable: true, filter: true },
  ];

  const siteAdminColumns: ColumnDef[] = [
    { field: 'AdminDisplayName', headerName: 'Admin Name', width: 200, sortable: true, filter: true },
    { field: 'AdminEmail', headerName: 'Email', width: 220, sortable: true, filter: true },
    { field: 'AdminType', headerName: 'Type', width: 120, sortable: true, filter: true },
    { field: 'IsPrimaryAdmin', headerName: 'Primary', width: 90, sortable: true, filter: true, valueFormatter: (p) => p.value ? 'Yes' : 'No' },
    { field: 'SiteDisplayName', headerName: 'Site', width: 200, sortable: true, filter: true },
  ];

  const hubSiteColumns: ColumnDef[] = [
    { field: 'HubSiteName', headerName: 'Hub Name', width: 200, sortable: true, filter: true },
    { field: 'HubSiteUrl', headerName: 'URL', width: 280, sortable: true, filter: true },
    { field: 'Description', headerName: 'Description', width: 250, sortable: true, filter: true },
    { field: 'AssociatedSitesCount', headerName: 'Associated Sites', width: 130, sortable: true, filter: true },
    { field: 'IsRegistered', headerName: 'Registered', width: 100, sortable: true, filter: true, valueFormatter: (p) => p.value ? 'Yes' : 'No' },
  ];

  // Export functions
  const exportToCSV = useCallback((dataType: 'sites' | 'lists' | 'contentTypes' | 'permissions' | 'sharing' | 'admins' | 'hubs') => {
    let data: any[] = [];
    let filename = '';

    switch (dataType) {
      case 'sites':
        data = filteredSites;
        filename = 'SharePoint_Sites_Export.csv';
        break;
      case 'lists':
        data = filteredLists;
        filename = 'SharePoint_Lists_Export.csv';
        break;
      case 'contentTypes':
        data = filteredContentTypes;
        filename = 'SharePoint_ContentTypes_Export.csv';
        break;
      case 'permissions':
        data = filteredPermissions;
        filename = 'SharePoint_Permissions_Export.csv';
        break;
      case 'sharing':
        data = filteredSharingLinks;
        filename = 'SharePoint_SharingLinks_Export.csv';
        break;
      case 'admins':
        data = filteredSiteAdmins;
        filename = 'SharePoint_SiteAdmins_Export.csv';
        break;
      case 'hubs':
        data = filteredHubSites;
        filename = 'SharePoint_HubSites_Export.csv';
        break;
    }

    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredSites, filteredLists, filteredContentTypes, filteredPermissions, filteredSharingLinks, filteredSiteAdmins, filteredHubSites]);

  return {
    // State
    sites: filteredSites,
    lists: filteredLists,
    contentTypes: filteredContentTypes,
    permissions: filteredPermissions,
    sharingLinks: filteredSharingLinks,
    siteAdmins: filteredSiteAdmins,
    hubSites: filteredHubSites,
    statistics,
    isLoading: state.isLoading,
    error: state.error,
    activeTab: state.activeTab,
    searchText: state.searchText,

    // Column definitions
    siteColumns,
    listColumns,
    contentTypeColumns,
    permissionColumns,
    sharingLinkColumns,
    siteAdminColumns,
    hubSiteColumns,

    // Actions
    setActiveTab,
    setSearchText,
    clearError,
    reloadData,
    exportToCSV,
    formatBytes,
  };
};
