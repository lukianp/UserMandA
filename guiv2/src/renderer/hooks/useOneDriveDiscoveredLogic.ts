/**
 * OneDrive Discovered Logic Hook
 * Contains business logic for viewing discovered OneDrive data from CSV files
 * Handles both provisioned OneDrive users and users without OneDrive access
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { useProfileStore } from '../store/useProfileStore';

// Types for OneDrive data
export interface OneDriveUser {
  UserId: string;
  UserPrincipalName: string;
  DisplayName: string;
  Mail: string;
  JobTitle: string;
  Department: string;
  AccountEnabled: boolean;
  DriveId: string;
  DriveName: string;
  DriveType: string;
  TotalSize: number;
  UsedSize: number;
  RemainingSize: number;
  DeletedSize: number;
  AvailableSize: number;
  UsagePercentage: number;
  StorageStatus: string;
  DaysSinceLastAccess: number;
  LastAccessedDateTime: string;
  CreatedDateTime: string;
  WebUrl: string;
}

export interface OneDriveSite {
  UserId: string;
  UserPrincipalName: string;
  SiteId: string;
  SiteName: string;
  SiteUrl: string;
  CreatedDateTime: string;
  LastModifiedDateTime: string;
  Description: string;
  IsPersonalSite: boolean;
}

export interface OneDriveItem {
  UserId: string;
  UserPrincipalName: string;
  DriveId: string;
  ItemId: string;
  ItemName: string;
  ItemType: string;
  FileCategory: string;
  Size: number;
  CreatedDateTime: string;
  LastModifiedDateTime: string;
  WebUrl: string;
  ParentPath: string;
  MimeType: string;
  Extension: string;
  HasChildren: boolean;
  ChildCount: number;
}

export interface OneDriveSharingLink {
  UserId: string;
  UserPrincipalName: string;
  DriveId: string;
  ItemId: string;
  ItemName: string;
  ItemSize: number;
  FileCategory: string;
  PermissionId: string;
  PermissionType: string;
  ShareType: string;
  ShareScope: string;
  ShareClassification: string;
  RiskLevel: string;
  SharedWithEmail: string;
  SharedWithDisplayName: string;
  IsExternalShare: boolean;
  IsAnonymousLink: boolean;
  CreatedDateTime: string;
  ExpirationDateTime: string;
  HasExpiration: boolean;
}

export interface UserWithoutOneDrive {
  UserId: string;
  UserPrincipalName: string;
  DisplayName: string;
  Mail: string;
  JobTitle: string;
  Department: string;
  AccountEnabled: boolean;
  HasOneDriveLicense: boolean;
  LicenseCount: number;
  Status: 'NoLicense' | 'NotProvisioned' | 'AccessDenied' | 'Error';
  Reason: string;
  ErrorMessage: string;
  DiscoveryTimestamp: string;
}

export interface OneDriveStatistics {
  DiscoveryTimestamp: string;
  TenantName: string;
  TotalUsers: number;
  TotalDrives: number;
  UsersWithOneDrive: number;
  UsersWithoutOneDrive: number;
  UsersWithOneDriveLicense: number;
  UsersWithoutLicense: number;
  UsersNotProvisioned: number;
  UsersWithErrors: number;
  OneDriveAdoptionPercent: number;
  TotalFiles: number;
  TotalFolders: number;
  TotalSizeBytes: number;
  TotalSizeGB: number;
  TotalQuotaBytes: number;
  TotalQuotaGB: number;
  StorageUsagePercent: number;
  SharedItems: number;
  InternalShares: number;
  ExternalShares: number;
  AnonymousLinks: number;
  CompanyWideLinks: number;
  HighStorageUsers: number;
  LowStorageUsers: number;
  InactiveUsers: number;
}

type TabType = 'overview' | 'users' | 'usersWithoutOneDrive' | 'sites' | 'files' | 'sharing';

interface OneDriveDiscoveredState {
  users: OneDriveUser[];
  sites: OneDriveSite[];
  items: OneDriveItem[];
  sharingLinks: OneDriveSharingLink[];
  usersWithoutOneDrive: UserWithoutOneDrive[];
  statistics: OneDriveStatistics | null;
  isLoading: boolean;
  error: string | null;
  activeTab: TabType;
  filter: {
    searchText: string;
    selectedDepartments: string[];
    selectedStatuses: string[];
    selectedFileCategories: string[];
    selectedRiskLevels: string[];
  };
}

// Using AG Grid ColDef - field and headerName are required for proper rendering
import { ColDef } from 'ag-grid-community';

// Helper function to load and parse CSV file
async function loadCsvFile<T>(basePath: string, filename: string): Promise<T[]> {
  const fullPath = `${basePath}\\Raw\\${filename}`;

  try {
    const exists = await window.electronAPI.fileExists(fullPath);
    if (!exists) {
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
          resolve((results.data as T[]) || []);
        },
        error: () => {
          resolve([]);
        },
      });
    });
  } catch {
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

export const useOneDriveDiscoveredLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  const [state, setState] = useState<OneDriveDiscoveredState>({
    users: [],
    sites: [],
    items: [],
    sharingLinks: [],
    usersWithoutOneDrive: [],
    statistics: null,
    isLoading: true,
    error: null,
    activeTab: 'overview',
    filter: {
      searchText: '',
      selectedDepartments: [],
      selectedStatuses: [],
      selectedFileCategories: [],
      selectedRiskLevels: [],
    },
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

        // Load all OneDrive CSV files in parallel
        const [users, sites, items, sharingLinks, usersWithoutOneDrive, statisticsData] = await Promise.all([
          loadCsvFile<OneDriveUser>(basePath, 'OneDriveUsers.csv'),
          loadCsvFile<OneDriveSite>(basePath, 'OneDriveSites.csv'),
          loadCsvFile<OneDriveItem>(basePath, 'OneDriveItems.csv'),
          loadCsvFile<OneDriveSharingLink>(basePath, 'OneDriveSharingLinks.csv'),
          loadCsvFile<UserWithoutOneDrive>(basePath, 'OneDriveUsersWithoutOneDrive.csv'),
          loadCsvFile<OneDriveStatistics>(basePath, 'OneDriveStatistics.csv'),
        ]);

        const statistics = statisticsData.length > 0 ? statisticsData[0] : null;

        setState(prev => ({
          ...prev,
          users,
          sites,
          items,
          sharingLinks,
          usersWithoutOneDrive,
          statistics,
          isLoading: false,
        }));
      } catch (error: any) {
        console.error('[OneDriveDiscoveredHook] Failed to load data:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to load OneDrive data',
        }));
      }
    };

    loadData();
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  // Tab management
  const setActiveTab = useCallback((tab: TabType) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  // Filter management
  const updateFilter = useCallback((updates: Partial<OneDriveDiscoveredState['filter']>) => {
    setState(prev => ({
      ...prev,
      filter: { ...prev.filter, ...updates },
    }));
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

      const [users, sites, items, sharingLinks, usersWithoutOneDrive, statisticsData] = await Promise.all([
        loadCsvFile<OneDriveUser>(basePath, 'OneDriveUsers.csv'),
        loadCsvFile<OneDriveSite>(basePath, 'OneDriveSites.csv'),
        loadCsvFile<OneDriveItem>(basePath, 'OneDriveItems.csv'),
        loadCsvFile<OneDriveSharingLink>(basePath, 'OneDriveSharingLinks.csv'),
        loadCsvFile<UserWithoutOneDrive>(basePath, 'OneDriveUsersWithoutOneDrive.csv'),
        loadCsvFile<OneDriveStatistics>(basePath, 'OneDriveStatistics.csv'),
      ]);

      const statistics = statisticsData.length > 0 ? statisticsData[0] : null;

      setState(prev => ({
        ...prev,
        users,
        sites,
        items,
        sharingLinks,
        usersWithoutOneDrive,
        statistics,
        isLoading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to reload OneDrive data',
      }));
    }
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  // Get unique departments for filter dropdown
  const uniqueDepartments = useMemo(() => {
    const departments = new Set<string>();
    state.users.forEach(u => u.Department && departments.add(u.Department));
    state.usersWithoutOneDrive.forEach(u => u.Department && departments.add(u.Department));
    return Array.from(departments).filter(d => d).sort();
  }, [state.users, state.usersWithoutOneDrive]);

  // Get unique file categories
  const uniqueFileCategories = useMemo(() => {
    const categories = new Set<string>();
    state.items.forEach(i => i.FileCategory && categories.add(i.FileCategory));
    return Array.from(categories).sort();
  }, [state.items]);

  // Filtered users with OneDrive
  const filteredUsers = useMemo(() => {
    let filtered = [...state.users];

    if (state.filter.searchText) {
      const search = state.filter.searchText.toLowerCase();
      filtered = filtered.filter(user =>
        user.UserPrincipalName?.toLowerCase().includes(search) ||
        user.DisplayName?.toLowerCase().includes(search) ||
        user.Department?.toLowerCase().includes(search)
      );
    }

    if (state.filter.selectedDepartments.length > 0) {
      filtered = filtered.filter(user =>
        state.filter.selectedDepartments.includes(user.Department)
      );
    }

    if (state.filter.selectedStatuses.length > 0) {
      filtered = filtered.filter(user =>
        state.filter.selectedStatuses.includes(user.StorageStatus)
      );
    }

    return filtered;
  }, [state.users, state.filter]);

  // Filtered users without OneDrive
  const filteredUsersWithoutOneDrive = useMemo(() => {
    let filtered = [...state.usersWithoutOneDrive];

    if (state.filter.searchText) {
      const search = state.filter.searchText.toLowerCase();
      filtered = filtered.filter(user =>
        user.UserPrincipalName?.toLowerCase().includes(search) ||
        user.DisplayName?.toLowerCase().includes(search) ||
        user.Department?.toLowerCase().includes(search) ||
        user.Reason?.toLowerCase().includes(search)
      );
    }

    if (state.filter.selectedDepartments.length > 0) {
      filtered = filtered.filter(user =>
        state.filter.selectedDepartments.includes(user.Department)
      );
    }

    if (state.filter.selectedStatuses.length > 0) {
      filtered = filtered.filter(user =>
        state.filter.selectedStatuses.includes(user.Status)
      );
    }

    return filtered;
  }, [state.usersWithoutOneDrive, state.filter]);

  // Filtered items
  const filteredItems = useMemo(() => {
    let filtered = [...state.items];

    if (state.filter.searchText) {
      const search = state.filter.searchText.toLowerCase();
      filtered = filtered.filter(item =>
        item.ItemName?.toLowerCase().includes(search) ||
        item.UserPrincipalName?.toLowerCase().includes(search)
      );
    }

    if (state.filter.selectedFileCategories.length > 0) {
      filtered = filtered.filter(item =>
        state.filter.selectedFileCategories.includes(item.FileCategory)
      );
    }

    return filtered;
  }, [state.items, state.filter]);

  // Filtered sharing links
  const filteredSharingLinks = useMemo(() => {
    let filtered = [...state.sharingLinks];

    if (state.filter.searchText) {
      const search = state.filter.searchText.toLowerCase();
      filtered = filtered.filter(link =>
        link.ItemName?.toLowerCase().includes(search) ||
        link.UserPrincipalName?.toLowerCase().includes(search) ||
        link.SharedWithEmail?.toLowerCase().includes(search)
      );
    }

    if (state.filter.selectedRiskLevels.length > 0) {
      filtered = filtered.filter(link =>
        state.filter.selectedRiskLevels.includes(link.RiskLevel)
      );
    }

    return filtered;
  }, [state.sharingLinks, state.filter]);

  // Calculate enhanced statistics
  const enhancedStats = useMemo(() => {
    const stats = state.statistics;

    // Discovery Success Calculation (weighted by importance)
    const expectedSources = [
      { name: 'Users', hasData: state.users.length > 0, weight: 25 },
      { name: 'UsersWithoutOneDrive', hasData: state.usersWithoutOneDrive.length > 0, weight: 20 },
      { name: 'Sites', hasData: state.sites.length > 0, weight: 15 },
      { name: 'Items', hasData: state.items.length > 0, weight: 15 },
      { name: 'SharingLinks', hasData: state.sharingLinks.length > 0, weight: 15 },
      { name: 'Statistics', hasData: state.statistics !== null, weight: 10 },
    ];
    const totalWeight = expectedSources.reduce((sum, s) => sum + s.weight, 0);
    const achievedWeight = expectedSources.reduce((sum, s) => sum + (s.hasData ? s.weight : 0), 0);
    const discoverySuccessPercentage = Math.round((achievedWeight / totalWeight) * 100);
    const dataSourcesReceivedCount = expectedSources.filter(s => s.hasData).length;
    const dataSourcesTotal = expectedSources.length;

    // Status breakdown from users without OneDrive
    const statusBreakdown = {
      NoLicense: state.usersWithoutOneDrive.filter(u => u.Status === 'NoLicense').length,
      NotProvisioned: state.usersWithoutOneDrive.filter(u => u.Status === 'NotProvisioned').length,
      AccessDenied: state.usersWithoutOneDrive.filter(u => u.Status === 'AccessDenied').length,
      Error: state.usersWithoutOneDrive.filter(u => u.Status === 'Error').length,
    };

    // Department breakdown
    const departmentCounts: Record<string, number> = {};
    state.users.forEach(u => {
      const dept = u.Department || 'No Department';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });
    state.usersWithoutOneDrive.forEach(u => {
      const dept = u.Department || 'No Department';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });

    // File type breakdown
    const fileTypeCounts: Record<string, number> = {};
    state.items.forEach(i => {
      const category = i.FileCategory || 'Other';
      fileTypeCounts[category] = (fileTypeCounts[category] || 0) + 1;
    });

    // Sharing risk breakdown
    const riskBreakdown = {
      High: state.sharingLinks.filter(l => l.RiskLevel === 'High').length,
      Medium: state.sharingLinks.filter(l => l.RiskLevel === 'Medium').length,
      Low: state.sharingLinks.filter(l => l.RiskLevel === 'Low').length,
    };

    // Storage breakdown by user
    const topStorageUsers = [...state.users]
      .sort((a, b) => (b.UsedSize || 0) - (a.UsedSize || 0))
      .slice(0, 10);

    return {
      // Discovery Success metrics
      discoverySuccessPercentage,
      dataSourcesReceivedCount,
      dataSourcesTotal,
      // User metrics
      totalUsers: stats?.TotalUsers || (state.users.length + state.usersWithoutOneDrive.length),
      usersWithOneDrive: stats?.UsersWithOneDrive || state.users.length,
      usersWithoutOneDrive: stats?.UsersWithoutOneDrive || state.usersWithoutOneDrive.length,
      adoptionRate: stats?.OneDriveAdoptionPercent ||
        (state.users.length + state.usersWithoutOneDrive.length > 0
          ? Math.round((state.users.length / (state.users.length + state.usersWithoutOneDrive.length)) * 100)
          : 0),
      totalFiles: stats?.TotalFiles || state.items.filter(i => i.ItemType === 'File').length,
      totalFolders: stats?.TotalFolders || state.items.filter(i => i.ItemType === 'Folder').length,
      totalStorageUsed: stats?.TotalSizeGB || 0,
      totalStorageQuota: stats?.TotalQuotaGB || 0,
      storageUsagePercent: stats?.StorageUsagePercent || 0,
      totalShares: stats?.SharedItems || state.sharingLinks.length,
      externalShares: stats?.ExternalShares || state.sharingLinks.filter(l => l.IsExternalShare).length,
      anonymousLinks: stats?.AnonymousLinks || state.sharingLinks.filter(l => l.IsAnonymousLink).length,
      highRiskShares: riskBreakdown.High,
      statusBreakdown,
      departmentCounts,
      fileTypeCounts,
      riskBreakdown,
      topStorageUsers,
      highStorageUsers: stats?.HighStorageUsers || 0,
      inactiveUsers: stats?.InactiveUsers || 0,
    };
  }, [state.statistics, state.users, state.usersWithoutOneDrive, state.items, state.sharingLinks]);

  // Column definitions for data grids - using AG Grid ColDef format
  const userColumns: ColDef[] = [
    { field: 'DisplayName', headerName: 'Display Name', width: 180 },
    { field: 'UserPrincipalName', headerName: 'Email', width: 220 },
    { field: 'Department', headerName: 'Department', width: 120 },
    { field: 'UsedSize', headerName: 'Storage Used', width: 100, valueGetter: (params) => formatBytes(params.data?.UsedSize) },
    { field: 'UsagePercentage', headerName: 'Usage %', width: 80, valueGetter: (params) => `${params.data?.UsagePercentage?.toFixed(1) || 0}%` },
    { field: 'StorageStatus', headerName: 'Status', width: 90 },
    { field: 'DaysSinceLastAccess', headerName: 'Days Inactive', width: 100 },
    { field: 'WebUrl', headerName: 'URL', width: 200 },
  ];

  const usersWithoutOneDriveColumns: ColDef[] = [
    { field: 'DisplayName', headerName: 'Display Name', width: 180 },
    { field: 'UserPrincipalName', headerName: 'Email', width: 220 },
    { field: 'Department', headerName: 'Department', width: 120 },
    { field: 'Status', headerName: 'Status', width: 100 },
    { field: 'Reason', headerName: 'Reason', width: 280 },
    { field: 'HasOneDriveLicense', headerName: 'Has License', width: 90, valueGetter: (params) => params.data?.HasOneDriveLicense ? 'Yes' : 'No' },
    { field: 'LicenseCount', headerName: 'Licenses', width: 70 },
    { field: 'AccountEnabled', headerName: 'Enabled', width: 70, valueGetter: (params) => params.data?.AccountEnabled ? 'Yes' : 'No' },
  ];

  const siteColumns: ColDef[] = [
    { field: 'SiteName', headerName: 'Site Name', width: 180 },
    { field: 'UserPrincipalName', headerName: 'Owner', width: 220 },
    { field: 'SiteUrl', headerName: 'URL', width: 300 },
    { field: 'CreatedDateTime', headerName: 'Created', width: 140 },
    { field: 'LastModifiedDateTime', headerName: 'Last Modified', width: 140 },
  ];

  const itemColumns: ColDef[] = [
    { field: 'ItemName', headerName: 'Name', width: 220 },
    { field: 'ItemType', headerName: 'Type', width: 70 },
    { field: 'FileCategory', headerName: 'Category', width: 90 },
    { field: 'Size', headerName: 'Size', width: 90, valueGetter: (params) => formatBytes(params.data?.Size) },
    { field: 'UserPrincipalName', headerName: 'Owner', width: 180 },
    { field: 'ParentPath', headerName: 'Path', width: 200 },
    { field: 'LastModifiedDateTime', headerName: 'Last Modified', width: 140 },
  ];

  const sharingColumns: ColDef[] = [
    { field: 'ItemName', headerName: 'Item', width: 180 },
    { field: 'ShareClassification', headerName: 'Share Type', width: 110 },
    { field: 'RiskLevel', headerName: 'Risk', width: 70 },
    { field: 'SharedWithEmail', headerName: 'Shared With', width: 180 },
    { field: 'UserPrincipalName', headerName: 'Owner', width: 180 },
    { field: 'PermissionType', headerName: 'Permission', width: 100 },
    { field: 'IsExternalShare', headerName: 'External', width: 70, valueGetter: (params) => params.data?.IsExternalShare ? 'Yes' : 'No' },
    { field: 'HasExpiration', headerName: 'Expires', width: 70, valueGetter: (params) => params.data?.HasExpiration ? 'Yes' : 'No' },
  ];

  // Export functions
  const exportToCSV = useCallback((dataType: 'users' | 'usersWithoutOneDrive' | 'sites' | 'items' | 'sharing') => {
    let data: any[] = [];
    let filename = '';

    switch (dataType) {
      case 'users':
        data = filteredUsers;
        filename = 'OneDrive_Users_Export.csv';
        break;
      case 'usersWithoutOneDrive':
        data = filteredUsersWithoutOneDrive;
        filename = 'OneDrive_UsersWithoutAccess_Export.csv';
        break;
      case 'sites':
        data = state.sites;
        filename = 'OneDrive_Sites_Export.csv';
        break;
      case 'items':
        data = filteredItems;
        filename = 'OneDrive_Items_Export.csv';
        break;
      case 'sharing':
        data = filteredSharingLinks;
        filename = 'OneDrive_Sharing_Export.csv';
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
  }, [filteredUsers, filteredUsersWithoutOneDrive, state.sites, filteredItems, filteredSharingLinks]);

  return {
    // State
    users: filteredUsers,
    sites: state.sites,
    items: filteredItems,
    sharingLinks: filteredSharingLinks,
    usersWithoutOneDrive: filteredUsersWithoutOneDrive,
    statistics: state.statistics,
    enhancedStats,
    isLoading: state.isLoading,
    error: state.error,
    activeTab: state.activeTab,
    filter: state.filter,

    // Column definitions
    userColumns,
    usersWithoutOneDriveColumns,
    siteColumns,
    itemColumns,
    sharingColumns,

    // Unique values for filters
    uniqueDepartments,
    uniqueFileCategories,

    // Actions
    setActiveTab,
    updateFilter,
    clearError,
    reloadData,
    exportToCSV,
    formatBytes,
  };
};
