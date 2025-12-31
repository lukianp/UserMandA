/**
 * Entra ID & Microsoft 365 Discovered Logic Hook
 * Contains business logic for viewing discovered M365/Entra ID data from CSV files
 * Rich presentation with statistics, tabs, and filtering
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { useProfileStore } from '../store/useProfileStore';

// Tab types for the view
type TabType = 'overview' | 'users' | 'groups' | 'teams' | 'sharepoint' | 'applications' | 'security';

// Data types from CSV
interface M365User {
  Id: string;
  DisplayName: string;
  UserPrincipalName: string;
  Mail: string;
  JobTitle: string;
  Department: string;
  CompanyName: string;
  AccountEnabled: string | boolean;
  UserType: string;
  CreatedDateTime: string;
  LastSignInDateTime: string;
  AssignedLicenses: string;
  LicenseCount: number | string;
  OnPremisesSyncEnabled: string | boolean;
  GroupMembershipCount: number | string;
  GroupMemberships: string;
  ManagerDisplayName: string;
  ManagerUPN: string;
}

interface M365Group {
  Id: string;
  DisplayName: string;
  Mail: string;
  MailEnabled: string | boolean;
  SecurityEnabled: string | boolean;
  GroupType: string;
  GroupTypes: string;
  Description: string;
  Visibility: string;
  CreatedDateTime: string;
  MemberCount: number | string;
  OwnerCount: number | string;
  IsDynamic: string | boolean;
  OnPremisesSyncEnabled: string | boolean;
  Owners: string;
  SampleMembers: string;
}

interface M365Team {
  Id: string;
  DisplayName: string;
  Description: string;
  CreatedDateTime: string;
  Visibility: string;
}

interface SharePointSite {
  Id: string;
  Name: string;
  DisplayName: string;
  WebUrl: string;
  CreatedDateTime: string;
  LastModifiedDateTime: string;
}

interface M365Application {
  Id: string;
  DisplayName: string;
  AppId: string;
  SignInAudience: string;
  CreatedDateTime: string;
  SecretCount: number | string;
  SecretExpirationWarning: string;
}

interface DirectoryRole {
  Id: string;
  DisplayName: string;
  Description: string;
  RoleTemplateId: string;
  MemberCount: number | string;
  Members: string;
}

// Stats interface
interface M365Stats {
  // User metrics
  totalUsers: number;
  activeUsers: number;
  guestUsers: number;
  memberUsers: number;
  licensedUsers: number;
  syncedUsers: number;
  usersWithManagers: number;

  // Department breakdown
  usersByDepartment: Record<string, number>;

  // Group metrics
  totalGroups: number;
  securityGroups: number;
  m365Groups: number;
  distributionLists: number;
  dynamicGroups: number;
  syncedGroups: number;

  // Services
  totalTeams: number;
  totalSharePointSites: number;
  totalApplications: number;
  totalDirectoryRoles: number;

  // Top lists
  topDepartments: { name: string; count: number }[];
  topGroupsByMembers: { name: string; count: number }[];
}

interface EntraIDM365DiscoveredState {
  users: M365User[];
  groups: M365Group[];
  teams: M365Team[];
  sharePointSites: SharePointSite[];
  applications: M365Application[];
  directoryRoles: DirectoryRole[];
  isLoading: boolean;
  error: string | null;
  activeTab: TabType;
  filter: {
    searchText: string;
    userType: 'all' | 'Member' | 'Guest';
    accountEnabled: 'all' | 'enabled' | 'disabled';
    groupType: 'all' | 'Security' | 'Microsoft365Group' | 'DistributionList';
    showOnlySynced: boolean;
    showOnlyLicensed: boolean;
  };
}

// Column definition for data grid
interface ColumnDef {
  key: string;
  header: string;
  width: number;
  getValue?: (row: any) => any;
}

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

// Helper to normalize boolean values from CSV
function toBool(value: string | boolean | undefined | null): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return false;
}

export const useEntraIDM365DiscoveredLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  const [state, setState] = useState<EntraIDM365DiscoveredState>({
    users: [],
    groups: [],
    teams: [],
    sharePointSites: [],
    applications: [],
    directoryRoles: [],
    isLoading: true,
    error: null,
    activeTab: 'overview',
    filter: {
      searchText: '',
      userType: 'all',
      accountEnabled: 'all',
      groupType: 'all',
      showOnlySynced: false,
      showOnlyLicensed: false,
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

        // Load all M365 CSV files in parallel
        const [users, groups, teams, sharePointSites, applications, directoryRoles] = await Promise.all([
          loadCsvFile<M365User>(basePath, 'AzureDiscovery_Users.csv'),
          loadCsvFile<M365Group>(basePath, 'AzureDiscovery_Groups.csv'),
          loadCsvFile<M365Team>(basePath, 'AzureDiscovery_MicrosoftTeams.csv'),
          loadCsvFile<SharePointSite>(basePath, 'AzureDiscovery_SharePointSites.csv'),
          loadCsvFile<M365Application>(basePath, 'AzureDiscovery_Applications.csv'),
          loadCsvFile<DirectoryRole>(basePath, 'AzureDiscovery_DirectoryRoles.csv'),
        ]);

        setState(prev => ({
          ...prev,
          users,
          groups,
          teams,
          sharePointSites,
          applications,
          directoryRoles,
          isLoading: false,
        }));
      } catch (error: any) {
        console.error('[EntraIDM365DiscoveredHook] Failed to load data:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to load M365 data',
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
  const updateFilter = useCallback((updates: Partial<EntraIDM365DiscoveredState['filter']>) => {
    setState(prev => ({
      ...prev,
      filter: { ...prev.filter, ...updates },
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Filtered users
  const filteredUsers = useMemo(() => {
    let filtered = [...state.users];

    if (state.filter.searchText) {
      const search = state.filter.searchText.toLowerCase();
      filtered = filtered.filter(user =>
        user.DisplayName?.toLowerCase().includes(search) ||
        user.UserPrincipalName?.toLowerCase().includes(search) ||
        user.Mail?.toLowerCase().includes(search) ||
        user.Department?.toLowerCase().includes(search) ||
        user.JobTitle?.toLowerCase().includes(search)
      );
    }

    if (state.filter.userType !== 'all') {
      filtered = filtered.filter(user => user.UserType === state.filter.userType);
    }

    if (state.filter.accountEnabled !== 'all') {
      const enabled = state.filter.accountEnabled === 'enabled';
      filtered = filtered.filter(user => toBool(user.AccountEnabled) === enabled);
    }

    if (state.filter.showOnlySynced) {
      filtered = filtered.filter(user => toBool(user.OnPremisesSyncEnabled));
    }

    if (state.filter.showOnlyLicensed) {
      filtered = filtered.filter(user => {
        const count = typeof user.LicenseCount === 'number' ? user.LicenseCount : parseInt(String(user.LicenseCount || '0'));
        return count > 0;
      });
    }

    return filtered;
  }, [state.users, state.filter]);

  // Filtered groups
  const filteredGroups = useMemo(() => {
    let filtered = [...state.groups];

    if (state.filter.searchText) {
      const search = state.filter.searchText.toLowerCase();
      filtered = filtered.filter(group =>
        group.DisplayName?.toLowerCase().includes(search) ||
        group.Mail?.toLowerCase().includes(search) ||
        group.Description?.toLowerCase().includes(search)
      );
    }

    if (state.filter.groupType !== 'all') {
      filtered = filtered.filter(group => group.GroupType === state.filter.groupType);
    }

    if (state.filter.showOnlySynced) {
      filtered = filtered.filter(group => toBool(group.OnPremisesSyncEnabled));
    }

    return filtered;
  }, [state.groups, state.filter]);

  // Filtered teams
  const filteredTeams = useMemo(() => {
    let filtered = [...state.teams];

    if (state.filter.searchText) {
      const search = state.filter.searchText.toLowerCase();
      filtered = filtered.filter(team =>
        team.DisplayName?.toLowerCase().includes(search) ||
        team.Description?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [state.teams, state.filter]);

  // Filtered SharePoint sites
  const filteredSharePointSites = useMemo(() => {
    let filtered = [...state.sharePointSites];

    if (state.filter.searchText) {
      const search = state.filter.searchText.toLowerCase();
      filtered = filtered.filter(site =>
        site.DisplayName?.toLowerCase().includes(search) ||
        site.Name?.toLowerCase().includes(search) ||
        site.WebUrl?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [state.sharePointSites, state.filter]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    let filtered = [...state.applications];

    if (state.filter.searchText) {
      const search = state.filter.searchText.toLowerCase();
      filtered = filtered.filter(app =>
        app.DisplayName?.toLowerCase().includes(search) ||
        app.AppId?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [state.applications, state.filter]);

  // Active tab data
  const filteredData = useMemo(() => {
    switch (state.activeTab) {
      case 'users':
        return filteredUsers;
      case 'groups':
        return filteredGroups;
      case 'teams':
        return filteredTeams;
      case 'sharepoint':
        return filteredSharePointSites;
      case 'applications':
        return filteredApplications;
      case 'security':
        return state.directoryRoles;
      default:
        return filteredUsers;
    }
  }, [state.activeTab, filteredUsers, filteredGroups, filteredTeams, filteredSharePointSites, filteredApplications, state.directoryRoles]);

  // Columns based on active tab
  const columns = useMemo<ColumnDef[]>(() => {
    switch (state.activeTab) {
      case 'users':
        return [
          { key: 'DisplayName', header: 'Display Name', width: 200 },
          { key: 'UserPrincipalName', header: 'UPN', width: 250 },
          { key: 'Mail', header: 'Email', width: 220 },
          { key: 'JobTitle', header: 'Job Title', width: 150 },
          { key: 'Department', header: 'Department', width: 130 },
          { key: 'AccountEnabled', header: 'Enabled', width: 80, getValue: (row: any) => toBool(row.AccountEnabled) ? 'Yes' : 'No' },
          { key: 'UserType', header: 'Type', width: 80 },
          { key: 'LicenseCount', header: 'Licenses', width: 80 },
          { key: 'OnPremisesSyncEnabled', header: 'Synced', width: 80, getValue: (row: any) => toBool(row.OnPremisesSyncEnabled) ? 'Yes' : 'No' },
          { key: 'GroupMembershipCount', header: 'Groups', width: 80 },
          { key: 'CreatedDateTime', header: 'Created', width: 150 },
        ];
      case 'groups':
        return [
          { key: 'DisplayName', header: 'Display Name', width: 220 },
          { key: 'Mail', header: 'Email', width: 220 },
          { key: 'GroupType', header: 'Type', width: 140 },
          { key: 'Visibility', header: 'Visibility', width: 100 },
          { key: 'MemberCount', header: 'Members', width: 90 },
          { key: 'OwnerCount', header: 'Owners', width: 80 },
          { key: 'SecurityEnabled', header: 'Security', width: 80, getValue: (row: any) => toBool(row.SecurityEnabled) ? 'Yes' : 'No' },
          { key: 'MailEnabled', header: 'Mail', width: 70, getValue: (row: any) => toBool(row.MailEnabled) ? 'Yes' : 'No' },
          { key: 'IsDynamic', header: 'Dynamic', width: 80, getValue: (row: any) => toBool(row.IsDynamic) ? 'Yes' : 'No' },
          { key: 'CreatedDateTime', header: 'Created', width: 150 },
        ];
      case 'teams':
        return [
          { key: 'DisplayName', header: 'Team Name', width: 250 },
          { key: 'Description', header: 'Description', width: 350 },
          { key: 'Visibility', header: 'Visibility', width: 100 },
          { key: 'CreatedDateTime', header: 'Created', width: 180 },
        ];
      case 'sharepoint':
        return [
          { key: 'DisplayName', header: 'Site Name', width: 250 },
          { key: 'WebUrl', header: 'URL', width: 400 },
          { key: 'CreatedDateTime', header: 'Created', width: 180 },
          { key: 'LastModifiedDateTime', header: 'Last Modified', width: 180 },
        ];
      case 'applications':
        return [
          { key: 'DisplayName', header: 'Application Name', width: 250 },
          { key: 'AppId', header: 'App ID', width: 300 },
          { key: 'SignInAudience', header: 'Sign-In Audience', width: 180 },
          { key: 'SecretCount', header: 'Secrets', width: 80 },
          { key: 'SecretExpirationWarning', header: 'Secret Warning', width: 150 },
          { key: 'CreatedDateTime', header: 'Created', width: 180 },
        ];
      case 'security':
        return [
          { key: 'DisplayName', header: 'Role Name', width: 280 },
          { key: 'Description', header: 'Description', width: 400 },
          { key: 'MemberCount', header: 'Members', width: 100 },
          { key: 'Members', header: 'Assigned To', width: 300 },
        ];
      default:
        return [
          { key: 'DisplayName', header: 'Name', width: 250 },
        ];
    }
  }, [state.activeTab]);

  // Statistics
  const stats = useMemo<M365Stats | null>(() => {
    const users = state.users;
    const groups = state.groups;

    if (users.length === 0 && groups.length === 0) {
      return null;
    }

    // User metrics
    const totalUsers = users.length;
    const activeUsers = users.filter(u => toBool(u.AccountEnabled)).length;
    const guestUsers = users.filter(u => u.UserType === 'Guest').length;
    const memberUsers = users.filter(u => u.UserType === 'Member').length;
    const licensedUsers = users.filter(u => {
      const count = typeof u.LicenseCount === 'number' ? u.LicenseCount : parseInt(String(u.LicenseCount || '0'));
      return count > 0;
    }).length;
    const syncedUsers = users.filter(u => toBool(u.OnPremisesSyncEnabled)).length;
    const usersWithManagers = users.filter(u => u.ManagerDisplayName).length;

    // Department breakdown
    const usersByDepartment: Record<string, number> = {};
    users.forEach(u => {
      const dept = u.Department || 'Not Set';
      usersByDepartment[dept] = (usersByDepartment[dept] || 0) + 1;
    });

    // Top departments
    const topDepartments = Object.entries(usersByDepartment)
      .map(([name, count]) => ({ name, count }))
      .filter(d => d.name !== 'Not Set')
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Group metrics
    const totalGroups = groups.length;
    const securityGroups = groups.filter(g => toBool(g.SecurityEnabled) && !toBool(g.MailEnabled)).length;
    const m365Groups = groups.filter(g => g.GroupType === 'Microsoft365Group' || (g.GroupTypes || '').includes('Unified')).length;
    const distributionLists = groups.filter(g => g.GroupType === 'DistributionList' || (toBool(g.MailEnabled) && !toBool(g.SecurityEnabled))).length;
    const dynamicGroups = groups.filter(g => toBool(g.IsDynamic)).length;
    const syncedGroups = groups.filter(g => toBool(g.OnPremisesSyncEnabled)).length;

    // Top groups by members
    const topGroupsByMembers = groups
      .map(g => ({
        name: g.DisplayName || 'Unknown',
        count: typeof g.MemberCount === 'number' ? g.MemberCount : parseInt(String(g.MemberCount || '0')),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalUsers,
      activeUsers,
      guestUsers,
      memberUsers,
      licensedUsers,
      syncedUsers,
      usersWithManagers,
      usersByDepartment,
      totalGroups,
      securityGroups,
      m365Groups,
      distributionLists,
      dynamicGroups,
      syncedGroups,
      totalTeams: state.teams.length,
      totalSharePointSites: state.sharePointSites.length,
      totalApplications: state.applications.length,
      totalDirectoryRoles: state.directoryRoles.length,
      topDepartments,
      topGroupsByMembers,
    };
  }, [state.users, state.groups, state.teams, state.sharePointSites, state.applications, state.directoryRoles]);

  // Export functions
  const exportToCSV = useCallback((data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]).filter(k => !k.startsWith('_'));
    const csvContent = [
      headers.join(','),
      ...data.map((row: any) =>
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }, []);

  const exportToExcel = useCallback(async (data: any[], filename: string) => {
    exportToCSV(data, filename.replace('.xlsx', '.csv'));
  }, [exportToCSV]);

  // Reload data
  const reloadData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    const basePath = selectedSourceProfile?.dataPath || `C:\\DiscoveryData\\${selectedSourceProfile?.companyName}`;

    if (basePath && selectedSourceProfile?.companyName) {
      try {
        const [users, groups, teams, sharePointSites, applications, directoryRoles] = await Promise.all([
          loadCsvFile<M365User>(basePath, 'AzureDiscovery_Users.csv'),
          loadCsvFile<M365Group>(basePath, 'AzureDiscovery_Groups.csv'),
          loadCsvFile<M365Team>(basePath, 'AzureDiscovery_MicrosoftTeams.csv'),
          loadCsvFile<SharePointSite>(basePath, 'AzureDiscovery_SharePointSites.csv'),
          loadCsvFile<M365Application>(basePath, 'AzureDiscovery_Applications.csv'),
          loadCsvFile<DirectoryRole>(basePath, 'AzureDiscovery_DirectoryRoles.csv'),
        ]);

        setState(prev => ({
          ...prev,
          users,
          groups,
          teams,
          sharePointSites,
          applications,
          directoryRoles,
          isLoading: false,
        }));
      } catch (error: any) {
        setState(prev => ({ ...prev, isLoading: false, error: error.message }));
      }
    }
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  return {
    // State
    users: state.users,
    groups: state.groups,
    teams: state.teams,
    sharePointSites: state.sharePointSites,
    applications: state.applications,
    directoryRoles: state.directoryRoles,
    isLoading: state.isLoading,
    error: state.error,
    activeTab: state.activeTab,
    filter: state.filter,

    // Computed
    stats,
    columns,
    filteredData,
    filteredUsers,
    filteredGroups,
    filteredTeams,
    filteredSharePointSites,
    filteredApplications,

    // Actions
    setActiveTab,
    updateFilter,
    clearError,
    exportToCSV,
    exportToExcel,
    reloadData,
  };
};
