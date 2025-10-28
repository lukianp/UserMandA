/**
 * Google Workspace Discovery Logic Hook
 * FULLY FUNCTIONAL production-ready business logic for Google Workspace discovery
 * NO PLACEHOLDERS - Complete implementation with Users, Groups, Gmail, Drive, Calendar
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { ColDef } from 'ag-grid-community';

import {
  GoogleWorkspaceDiscoveryConfig,
  GoogleWorkspaceDiscoveryResult,
  GoogleWorkspaceFilterState,
  GoogleUser,
  GoogleGroup,
  GoogleWorkspaceStats,
  MailboxInfo,
  DriveUserInfo,
  CalendarUserInfo
} from '../types/models/googleworkspace';

type TabType = 'overview' | 'users' | 'groups' | 'gmail' | 'drive' | 'calendar' | 'licenses';

interface DiscoveryProgress {
  current: number;
  total: number;
  message: string;
  percentage: number;
}

interface GoogleWorkspaceDiscoveryState {
  config: Partial<GoogleWorkspaceDiscoveryConfig>;
  result: GoogleWorkspaceDiscoveryResult | null;
  isDiscovering: boolean;
  progress: DiscoveryProgress;
  activeTab: TabType;
  filter: GoogleWorkspaceFilterState;
  cancellationToken: string | null;
  error: string | null;
}

export const useGoogleWorkspaceDiscoveryLogic = () => {
  const [state, setState] = useState<GoogleWorkspaceDiscoveryState>({
    config: {
      serviceTypes: ['users', 'groups', 'gmail', 'drive'],
      includeUserDetails: true,
      includeGroupMembership: true,
      includeMailboxSize: true,
      includeDriveUsage: true,
      includeCalendarDetails: false,
      timeout: 300000
    },
    result: null,
    isDiscovering: false,
    progress: { current: 0, total: 100, message: '', percentage: 0 },
    activeTab: 'overview',
    filter: {
      searchText: '',
      selectedOrgUnits: [],
      selectedStatuses: [],
      selectedServiceTypes: [],
      showOnlyAdmins: false
    },
    cancellationToken: null,
    error: null
  });

  // Real-time progress tracking via IPC
  useEffect(() => {
    const unsubscribeProgress = window.electron.onDiscoveryProgress((data) => {
      if (data.executionId === state.cancellationToken) {
        setState(prev => ({
          ...prev,
          progress: {
            current: data.itemsProcessed || 0,
            total: data.totalItems || 100,
            message: `${data.currentPhase} (${data.itemsProcessed || 0}/${data.totalItems || 0})`,
            percentage: data.percentage || 0
          }
        }));
      }
    });

    const unsubscribeOutput = window.electron.onDiscoveryOutput((data) => {
      // Handle output if needed
    });

    const unsubscribeComplete = window.electron.onDiscoveryComplete((data) => {
      if (data.executionId === state.cancellationToken) {
        setState(prev => ({
          ...prev,
          result: data.result,
          isDiscovering: false,
          cancellationToken: null,
          progress: { current: 100, total: 100, message: 'Discovery completed', percentage: 100 }
        }));
      }
    });

    const unsubscribeError = window.electron.onDiscoveryError((data) => {
      if (data.executionId === state.cancellationToken) {
        setState(prev => ({
          ...prev,
          isDiscovering: false,
          cancellationToken: null,
          error: data.error,
          progress: { current: 0, total: 100, message: 'Error occurred', percentage: 0 }
        }));
      }
    });

    return () => {
      if (unsubscribeProgress) unsubscribeProgress();
      if (unsubscribeOutput) unsubscribeOutput();
      if (unsubscribeComplete) unsubscribeComplete();
      if (unsubscribeError) unsubscribeError();
    };
  }, [state.cancellationToken]);

  // Start discovery
  const startDiscovery = useCallback(async () => {
    const token = `google-workspace-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setState(prev => ({
      ...prev,
      isDiscovering: true,
      cancellationToken: token,
      error: null,
      progress: { current: 0, total: 100, message: 'Initializing Google Workspace discovery...', percentage: 0 }
    }));

    try {
      await window.electron.executeDiscovery({
        moduleName: 'GoogleWorkspaceDiscovery',
        parameters: {
          domain: state.config.domain,
          adminEmail: state.config.adminEmail,
          serviceAccountKeyPath: state.config.serviceAccountKeyPath,
          serviceTypes: state.config.serviceTypes,
          includeUserDetails: state.config.includeUserDetails,
          includeGroupMembership: state.config.includeGroupMembership,
          includeMailboxSize: state.config.includeMailboxSize,
          includeDriveUsage: state.config.includeDriveUsage,
          includeCalendarDetails: state.config.includeCalendarDetails,
          orgUnits: state.config.orgUnits,
        },
        executionId: token,
      });
    } catch (error: any) {
      console.error('Google Workspace discovery failed:', error);
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        cancellationToken: null,
        error: error.message || 'Discovery failed'
      }));
    }
  }, [state.config]);

  // Cancel discovery
  const cancelDiscovery = useCallback(async () => {
    if (state.cancellationToken) {
      try {
        await window.electron.cancelDiscovery(state.cancellationToken);
      } catch (error) {
        console.error('Failed to cancel discovery:', error);
      }
    }
    setState(prev => ({
      ...prev,
      isDiscovering: false,
      cancellationToken: null,
      progress: { current: 0, total: 100, message: 'Cancelled', percentage: 0 }
    }));
  }, [state.cancellationToken]);

  // Export to CSV
  const exportToCSV = useCallback(async () => {
    if (!state.result) return;
    try {
      let data: any[] = [];
      switch (state.activeTab) {
        case 'users':
          data = state.result.users;
          break;
        case 'groups':
          data = state.result.groups;
          break;
        case 'gmail':
          data = state.result.gmailData?.largestMailboxes || [];
          break;
        case 'drive':
          data = state.result.driveData?.largestUsers || [];
          break;
        case 'calendar':
          data = state.result.calendarData?.topUsers || [];
          break;
        case 'licenses':
          data = state.result.licenseInfo;
          break;
      }

      const csvData = convertToCSV(data);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `google-workspace-${state.activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV export failed:', error);
    }
  }, [state.result, state.activeTab]);

  // Export to Excel
  const exportToExcel = useCallback(async () => {
    if (!state.result) return;
    try {
      await window.electronAPI.executeModule({
        modulePath: 'Modules/Export/ExportToExcel.psm1',
        functionName: 'Export-GoogleWorkspaceData',
        parameters: {
          data: state.result,
          tab: state.activeTab,
          filename: `google-workspace-${state.activeTab}-${new Date().toISOString().split('T')[0]}.xlsx`
        }
      });
    } catch (error) {
      console.error('Excel export failed:', error);
    }
  }, [state.result, state.activeTab]);

  // Users columns
  const usersColumns = useMemo<ColDef[]>(() => [
    { field: 'primaryEmail', headerName: 'Email', sortable: true, filter: true, width: 300 },
    { field: 'name.fullName', headerName: 'Name', sortable: true, filter: true, width: 250 },
    { field: 'isAdmin', headerName: 'Admin', sortable: true, filter: true, width: 100,
      valueFormatter: (params) => params.value ? 'Yes' : 'No' },
    { field: 'suspended', headerName: 'Suspended', sortable: true, filter: true, width: 120,
      valueFormatter: (params) => params.value ? 'Yes' : 'No' },
    { field: 'orgUnitPath', headerName: 'Org Unit', sortable: true, filter: true, width: 250 },
    { field: 'mailboxSize', headerName: 'Mailbox Size', sortable: true, filter: true, width: 150,
      valueFormatter: (params) => params.value ? `${(params.value / 1024 / 1024 / 1024).toFixed(2)} GB` : 'N/A' },
    { field: 'driveUsage', headerName: 'Drive Usage', sortable: true, filter: true, width: 150,
      valueFormatter: (params) => params.value ? `${(params.value / 1024 / 1024 / 1024).toFixed(2)} GB` : 'N/A' },
    { field: 'lastLoginTime', headerName: 'Last Login', sortable: true, filter: true, width: 180,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'Never' },
    { field: 'twoStepVerificationEnrolled', headerName: '2FA', sortable: true, filter: true, width: 80,
      valueFormatter: (params) => params.value ? 'Yes' : 'No' }
  ], []);

  // Groups columns
  const groupsColumns = useMemo<ColDef[]>(() => [
    { field: 'email', headerName: 'Email', sortable: true, filter: true, width: 300 },
    { field: 'name', headerName: 'Name', sortable: true, filter: true, width: 250 },
    { field: 'description', headerName: 'Description', sortable: true, filter: true, width: 300 },
    { field: 'directMembersCount', headerName: 'Members', sortable: true, filter: true, width: 120 },
    { field: 'adminCreated', headerName: 'Admin Created', sortable: true, filter: true, width: 150,
      valueFormatter: (params) => params.value ? 'Yes' : 'No' },
    { field: 'settings.allowExternalMembers', headerName: 'External Members', sortable: true, filter: true, width: 160,
      valueFormatter: (params) => params.value ? 'Allowed' : 'Not Allowed' },
    { field: 'settings.whoCanPostMessage', headerName: 'Who Can Post', sortable: true, filter: true, width: 180 }
  ], []);

  // Gmail columns
  const gmailColumns = useMemo<ColDef[]>(() => [
    { field: 'userEmail', headerName: 'Email', sortable: true, filter: true, width: 300 },
    { field: 'userName', headerName: 'Name', sortable: true, filter: true, width: 250 },
    { field: 'size', headerName: 'Mailbox Size', sortable: true, filter: true, width: 180,
      valueFormatter: (params) => `${(params.value / 1024 / 1024 / 1024).toFixed(2)} GB` },
    { field: 'messageCount', headerName: 'Messages', sortable: true, filter: true, width: 120,
      valueFormatter: (params) => params.value?.toLocaleString() || 'N/A' },
    { field: 'lastActivityTime', headerName: 'Last Activity', sortable: true, filter: true, width: 180,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A' }
  ], []);

  // Drive columns
  const driveColumns = useMemo<ColDef[]>(() => [
    { field: 'userEmail', headerName: 'Email', sortable: true, filter: true, width: 300 },
    { field: 'userName', headerName: 'Name', sortable: true, filter: true, width: 250 },
    { field: 'storageUsed', headerName: 'Storage Used', sortable: true, filter: true, width: 180,
      valueFormatter: (params) => `${(params.value / 1024 / 1024 / 1024).toFixed(2)} GB` },
    { field: 'fileCount', headerName: 'Files', sortable: true, filter: true, width: 120,
      valueFormatter: (params) => params.value?.toLocaleString() || '0' },
    { field: 'sharedFileCount', headerName: 'Shared Files', sortable: true, filter: true, width: 150,
      valueFormatter: (params) => params.value?.toLocaleString() || '0' },
    { field: 'lastActivityTime', headerName: 'Last Activity', sortable: true, filter: true, width: 180,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A' }
  ], []);

  // Calendar columns
  const calendarColumns = useMemo<ColDef[]>(() => [
    { field: 'userEmail', headerName: 'Email', sortable: true, filter: true, width: 300 },
    { field: 'userName', headerName: 'Name', sortable: true, filter: true, width: 250 },
    { field: 'calendarCount', headerName: 'Calendars', sortable: true, filter: true, width: 120 },
    { field: 'eventCount', headerName: 'Events', sortable: true, filter: true, width: 120,
      valueFormatter: (params) => params.value?.toLocaleString() || 'N/A' },
    { field: 'sharedCalendars', headerName: 'Shared', sortable: true, filter: true, width: 120 }
  ], []);

  // Licenses columns
  const licensesColumns = useMemo<ColDef[]>(() => [
    { field: 'skuName', headerName: 'License SKU', sortable: true, filter: true, width: 300 },
    { field: 'productName', headerName: 'Product', sortable: true, filter: true, width: 250 },
    { field: 'assignedLicenses', headerName: 'Assigned', sortable: true, filter: true, width: 120 },
    { field: 'availableLicenses', headerName: 'Available', sortable: true, filter: true, width: 120 },
    { field: 'utilization', headerName: 'Utilization', sortable: true, filter: true, width: 150,
      valueGetter: (params) => {
        const assigned = params.data.assignedLicenses || 0;
        const total = assigned + (params.data.availableLicenses || 0);
        return total > 0 ? ((assigned / total) * 100).toFixed(1) + '%' : 'N/A';
      }
    }
  ], []);

  // Dynamic columns based on active tab
  const columns = useMemo(() => {
    switch (state.activeTab) {
      case 'users':
        return usersColumns;
      case 'groups':
        return groupsColumns;
      case 'gmail':
        return gmailColumns;
      case 'drive':
        return driveColumns;
      case 'calendar':
        return calendarColumns;
      case 'licenses':
        return licensesColumns;
      default:
        return [];
    }
  }, [state.activeTab, usersColumns, groupsColumns, gmailColumns, driveColumns, calendarColumns, licensesColumns]);

  // Filtered data
  const filteredData = useMemo(() => {
    let data: any[] = [];

    switch (state.activeTab) {
      case 'users':
        data = state.result?.users || [];
        // Filter by org units
        if (state.filter.selectedOrgUnits.length > 0) {
          data = (data ?? []).filter((u: GoogleUser) => state.filter.selectedOrgUnits.includes(u.orgUnitPath));
        }
        // Filter by status
        if (state.filter.selectedStatuses.length > 0) {
          data = (data ?? []).filter((u: GoogleUser) => {
            if (u.suspended && state.filter.selectedStatuses.includes('suspended')) return true;
            if (u.archived && state.filter.selectedStatuses.includes('archived')) return true;
            if (!u.suspended && !u.archived && state.filter.selectedStatuses.includes('active')) return true;
            return false;
          });
        }
        // Filter by admin status
        if (state.filter.showOnlyAdmins) {
          data = (data ?? []).filter((u: GoogleUser) => u.isAdmin);
        }
        break;
      case 'groups':
        data = state.result?.groups || [];
        break;
      case 'gmail':
        data = state.result?.gmailData?.largestMailboxes || [];
        break;
      case 'drive':
        data = state.result?.driveData?.largestUsers || [];
        break;
      case 'calendar':
        data = state.result?.calendarData?.topUsers || [];
        break;
      case 'licenses':
        data = state.result?.licenseInfo || [];
        break;
      default:
        return [];
    }

    // Apply search filter
    if (state.filter.searchText) {
      const searchLower = state.filter.searchText.toLowerCase();
      data = (data ?? []).filter(item =>
        JSON.stringify(item).toLowerCase().includes(searchLower)
      );
    }

    return data;
  }, [state.result, state.activeTab, state.filter]);

  // Statistics calculation
  const stats = useMemo<GoogleWorkspaceStats | null>(() => {
    if (!state.result) return null;

    const users = state.result.users || [];
    const totalStorageUsed = state.result.totalStorageUsed || 0;

    return {
      totalUsers: state.result.totalUsersFound,
      activeUsers: users.filter(u => !u.suspended && !u.archived).length,
      suspendedUsers: users.filter(u => u.suspended).length,
      totalGroups: state.result.totalGroupsFound,
      totalStorageUsed,
      averageStoragePerUser: state.result.totalUsersFound > 0 ? totalStorageUsed / state.result.totalUsersFound : 0,
      licenseUtilization: state.result.licenseInfo?.reduce((acc, lic) => {
        const total = lic.assignedLicenses + lic.availableLicenses;
        acc[lic.skuName] = total > 0 ? (lic.assignedLicenses / total) * 100 : 0;
        return acc;
      }, {} as Record<string, number>) || {},
      topStorageUsers: users
        .sort((a, b) => (b.driveUsage || 0) - (a.driveUsage || 0))
        .slice(0, 5)
        .map(u => ({
          email: u.primaryEmail,
          name: u.name.fullName,
          storage: u.driveUsage || 0
        }))
    };
  }, [state.result]);

  // Update config
  const updateConfig = useCallback((updates: Partial<GoogleWorkspaceDiscoveryConfig>) => {
    setState(prev => ({ ...prev, config: { ...prev.config, ...updates } }));
  }, []);

  // Update filter
  const updateFilter = useCallback((updates: Partial<GoogleWorkspaceFilterState>) => {
    setState(prev => ({ ...prev, filter: { ...prev.filter, ...updates } }));
  }, []);

  // Set active tab
  const setActiveTab = useCallback((tab: TabType) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  return {
    // State
    config: state.config,
    result: state.result,
    isDiscovering: state.isDiscovering,
    progress: state.progress,
    activeTab: state.activeTab,
    filter: state.filter,
    error: state.error,

    // Data
    columns,
    filteredData,
    stats,

    // Actions
    updateConfig,
    updateFilter,
    setActiveTab,
    startDiscovery,
    cancelDiscovery,
    exportToCSV,
    exportToExcel
  
  };
};

// Helper function to convert data to CSV
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return '';

  const flattenObject = (obj: any, prefix = ''): any => {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value === null || value === undefined) {
        acc[newKey] = '';
      } else if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        Object.assign(acc, flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        acc[newKey] = value.length;
      } else if (value instanceof Date) {
        acc[newKey] = value.toISOString();
      } else {
        acc[newKey] = value;
      }

      return acc;
    }, {});
  };

  const flatData = (data ?? []).map(item => flattenObject(item));
  const headers = Object.keys(flatData[0]);

  const rows = flatData.map(item =>
    headers.map(header => {
      const value = item[header];
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}
