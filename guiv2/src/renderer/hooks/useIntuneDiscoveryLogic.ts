import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ColDef } from 'ag-grid-community';
import type {
  IntuneDiscoveryResult,
  IntuneDevice,
  IntuneApplication,
  ConfigurationPolicy,
  CompliancePolicy,
  AppProtectionPolicy,
  IntuneDiscoveryConfig
} from '../types/models/intune';

type TabType = 'overview' | 'devices' | 'applications' | 'config-policies' | 'compliance-policies' | 'app-protection';

interface IntuneDiscoveryState {
  config: IntuneDiscoveryConfig;
  result: IntuneDiscoveryResult | null;
  isDiscovering: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  activeTab: TabType;
  filter: {
    searchText: string;
    selectedPlatforms: string[];
    selectedComplianceStates: string[];
    selectedManagementStates: string[];
    showNonCompliantOnly: boolean;
  };
  cancellationToken: string | null;
  error: string | null;
}

interface IntuneStats {
  totalDevices: number;
  compliantDevices: number;
  nonCompliantDevices: number;
  devicesByPlatform: Record<string, number>;
  devicesByComplianceState: Record<string, number>;
  totalApplications: number;
  totalConfigPolicies: number;
  totalCompliancePolicies: number;
  totalAppProtectionPolicies: number;
  totalPolicies: number;
  totalConfigurations: number;
  complianceRate: number;
  topDeviceModels: Array<{ model: string; count: number }>;
  topNonComplianceReasons: Array<{ reason: string; count: number }>;
}

export const useIntuneDiscoveryLogic = () => {
  const [state, setState] = useState<IntuneDiscoveryState>({
    config: {
      id: 'default-intune-config',
      name: 'Default Intune Discovery',
      tenantId: '',
      includeDevices: true,
      includeApplications: true,
      includePolicies: true,
      includeComplianceReports: true,
      includeConfigurationPolicies: true,
      includeCompliancePolicies: true,
      includeAppProtectionPolicies: true,
      platforms: [],
      timeout: 600000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    result: null,
    isDiscovering: false,
    progress: {
      current: 0,
      total: 100,
      message: '',
      percentage: 0
    },
    activeTab: 'overview',
    filter: {
      searchText: '',
      selectedPlatforms: [],
      selectedComplianceStates: [],
      selectedManagementStates: [],
      showNonCompliantOnly: false
    },
    cancellationToken: null,
    error: null
  });

  // IPC progress tracking
  useEffect(() => {
    const unsubscribe = window.electronAPI?.onProgress?.((data: any) => {
      if (data.type === 'intune-discovery' && data.token === state.cancellationToken) {
        setState(prev => ({
          ...prev,
          progress: {
            current: data.current || 0,
            total: data.total || 100,
            message: data.message || '',
            percentage: data.percentage || 0
          }
        }));
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [state.cancellationToken]);

  const startDiscovery = useCallback(async () => {
    const token = `intune-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState(prev => ({
      ...prev,
      isDiscovering: true,
      error: null,
      cancellationToken: token,
      progress: { current: 0, total: 100, message: 'Starting Intune discovery...', percentage: 0 }
    }));

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/IntuneDiscovery.psm1',
        functionName: 'Invoke-IntuneDiscovery',
        parameters: {
          IncludeDevices: state.config.includeDevices,
          IncludeApplications: state.config.includeApplications,
          IncludeConfigurationPolicies: state.config.includeConfigurationPolicies,
          IncludeCompliancePolicies: state.config.includeCompliancePolicies,
          IncludeAppProtectionPolicies: state.config.includeAppProtectionPolicies,
          Timeout: state.config.timeout,
          CancellationToken: token
        },
        options: {
          timeout: state.config.timeout,
          streamOutput: true
        }
      });

      setState(prev => ({
        ...prev,
        result: result.data,
        isDiscovering: false,
        progress: { current: 100, total: 100, message: 'Discovery completed', percentage: 100 }
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        error: error.message || 'Discovery failed',
        progress: { current: 0, total: 100, message: 'Discovery failed', percentage: 0 }
      }));
    }
  }, [state.config]);

  const cancelDiscovery = useCallback(async () => {
    if (state.cancellationToken) {
      try {
        await window.electronAPI.cancelExecution(state.cancellationToken);
        setState(prev => ({
          ...prev,
          isDiscovering: false,
          cancellationToken: null,
          progress: { current: 0, total: 100, message: 'Discovery cancelled', percentage: 0 }
        }));
      } catch (error: any) {
        console.error('Failed to cancel discovery:', error);
      }
    }
  }, [state.cancellationToken]);

  const updateConfig = useCallback((updates: Partial<IntuneDiscoveryConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...updates }
    }));
  }, []);

  const setActiveTab = useCallback((tab: TabType) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const updateFilter = useCallback((updates: Partial<IntuneDiscoveryState['filter']>) => {
    setState(prev => ({
      ...prev,
      filter: { ...prev.filter, ...updates }
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Device columns
  const deviceColumns = useMemo<ColDef<IntuneDevice>[]>(() => [
    {
      field: 'deviceName',
      headerName: 'Device Name',
      sortable: true,
      filter: true,
      width: 200
    },
    {
      field: 'userPrincipalName',
      headerName: 'User',
      sortable: true,
      filter: true,
      width: 220
    },
    {
      field: 'operatingSystem',
      headerName: 'Platform',
      sortable: true,
      filter: true,
      width: 120
    },
    {
      field: 'osVersion',
      headerName: 'OS Version',
      sortable: true,
      filter: true,
      width: 140
    },
    {
      field: 'complianceState',
      headerName: 'Compliance',
      sortable: true,
      filter: true,
      width: 130,
      valueFormatter: (params) => params.value || 'Unknown'
    },
    {
      field: 'managementState',
      headerName: 'Management',
      sortable: true,
      filter: true,
      width: 130
    },
    {
      field: 'lastSyncDateTime',
      headerName: 'Last Sync',
      sortable: true,
      filter: true,
      width: 180,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'Never'
    },
    {
      field: 'isEncrypted',
      headerName: 'Encrypted',
      sortable: true,
      filter: true,
      width: 110,
      valueFormatter: (params) => params.value ? 'Yes' : 'No'
    },
    {
      field: 'totalStorageSpaceInBytes',
      headerName: 'Storage',
      sortable: true,
      filter: true,
      width: 130,
      valueFormatter: (params) => {
        if (!params.value) return 'N/A';
        const gb = params.value / (1024 * 1024 * 1024);
        return `${gb.toFixed(2)} GB`;
      }
    },
  ], []);

  // Application columns
  const applicationColumns = useMemo<ColDef<IntuneApplication>[]>(() => [
    {
      field: 'displayName',
      headerName: 'Application Name',
      sortable: true,
      filter: true,
      width: 250
    },
    {
      field: 'publisher',
      headerName: 'Publisher',
      sortable: true,
      filter: true,
      width: 200
    },
    {
      field: 'appType',
      headerName: 'Type',
      sortable: true,
      filter: true,
      width: 150
    },
    {
      field: 'installSummary.installedDeviceCount',
      headerName: 'Installed',
      sortable: true,
      filter: true,
      width: 120,
      valueGetter: (params) => params.data?.installSummary?.installedDeviceCount || 0
    },
    {
      field: 'installSummary.failedDeviceCount',
      headerName: 'Failed',
      sortable: true,
      filter: true,
      width: 110,
      valueGetter: (params) => params.data?.installSummary?.failedDeviceCount || 0
    },
    {
      field: 'installSummary.pendingInstallDeviceCount',
      headerName: 'Pending',
      sortable: true,
      filter: true,
      width: 110,
      valueGetter: (params) => params.data?.installSummary?.pendingInstallDeviceCount || 0
    },
    {
      field: 'createdDateTime',
      headerName: 'Created',
      sortable: true,
      filter: true,
      width: 180,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
    }
  ], []);

  // Configuration policy columns
  const configPolicyColumns = useMemo<ColDef<ConfigurationPolicy>[]>(() => [
    {
      field: 'displayName',
      headerName: 'Policy Name',
      sortable: true,
      filter: true,
      width: 250
    },
    {
      field: 'description',
      headerName: 'Description',
      sortable: true,
      filter: true,
      width: 300
    },
    {
      field: 'platform',
      headerName: 'Platform',
      sortable: true,
      filter: true,
      width: 180,
      valueFormatter: (params) => params.value || 'N/A'
    },
    {
      field: 'assignments',
      headerName: 'Assignments',
      sortable: true,
      filter: true,
      width: 130,
      valueFormatter: (params) => params.value?.length || 0
    },
    {
      field: 'deploymentSummary.succeededDevicesCount',
      headerName: 'Succeeded',
      sortable: true,
      filter: true,
      width: 120,
      valueGetter: (params) => params.data?.deploymentSummary?.succeededDevicesCount || 0
    },
    {
      field: 'deploymentSummary.errorDevicesCount',
      headerName: 'Errors',
      sortable: true,
      filter: true,
      width: 100,
      valueGetter: (params) => params.data?.deploymentSummary?.errorDevicesCount || 0
    },
    {
      field: 'lastModifiedDateTime',
      headerName: 'Modified',
      sortable: true,
      filter: true,
      width: 180,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
    }
  ], []);

  // Compliance policy columns
  const compliancePolicyColumns = useMemo<ColDef<CompliancePolicy>[]>(() => [
    {
      field: 'displayName',
      headerName: 'Policy Name',
      sortable: true,
      filter: true,
      width: 250
    },
    {
      field: 'description',
      headerName: 'Description',
      sortable: true,
      filter: true,
      width: 300
    },
    {
      field: 'platform',
      headerName: 'Platform',
      sortable: true,
      filter: true,
      width: 180,
      valueFormatter: (params) => params.value || 'N/A'
    },
    {
      field: 'scheduledActionsForRule',
      headerName: 'Actions',
      sortable: true,
      filter: true,
      width: 130,
      valueFormatter: (params) => params.value?.length || 0
    },
    {
      field: 'deviceStatusOverview.successCount',
      headerName: 'Success',
      sortable: true,
      filter: true,
      width: 120,
      valueGetter: (params) => params.data?.deviceStatusOverview?.successCount || 0
    },
    {
      field: 'deviceStatusOverview.errorCount',
      headerName: 'Errors',
      sortable: true,
      filter: true,
      width: 100,
      valueGetter: (params) => params.data?.deviceStatusOverview?.errorCount || 0
    },
    {
      field: 'version',
      headerName: 'Version',
      sortable: true,
      filter: true,
      width: 100
    }
  ], []);

  // App protection policy columns
  const appProtectionPolicyColumns = useMemo<ColDef<AppProtectionPolicy>[]>(() => [
    {
      field: 'displayName',
      headerName: 'Policy Name',
      sortable: true,
      filter: true,
      width: 250
    },
    {
      field: 'description',
      headerName: 'Description',
      sortable: true,
      filter: true,
      width: 300
    },
    {
      field: 'platform',
      headerName: 'Platform',
      sortable: true,
      filter: true,
      width: 130
    },
    {
      field: 'pinRequired',
      headerName: 'PIN Required',
      sortable: true,
      filter: true,
      width: 140,
      valueFormatter: (params) => params.value ? 'Yes' : 'No'
    },
    {
      field: 'dataBackupBlocked',
      headerName: 'Backup Blocked',
      sortable: true,
      filter: true,
      width: 150,
      valueFormatter: (params) => params.value ? 'Yes' : 'No'
    },
    {
      field: 'deviceComplianceRequired',
      headerName: 'Compliance Required',
      sortable: true,
      filter: true,
      width: 180,
      valueFormatter: (params) => params.value ? 'Yes' : 'No'
    },
    {
      field: 'createdDateTime',
      headerName: 'Created',
      sortable: true,
      filter: true,
      width: 180,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
    }
  ], []);

  // Dynamic columns based on active tab
  const columns = useMemo<ColDef[]>(() => {
    switch (state.activeTab) {
      case 'devices':
        return deviceColumns;
      case 'applications':
        return applicationColumns;
      case 'config-policies':
        return configPolicyColumns;
      case 'compliance-policies':
        return compliancePolicyColumns;
      case 'app-protection':
        return appProtectionPolicyColumns;
      default:
        return [];
    }
  }, [state.activeTab, deviceColumns, applicationColumns, configPolicyColumns, compliancePolicyColumns, appProtectionPolicyColumns]);

  // Filtered devices
  const filteredDevices = useMemo(() => {
    if (!state.result?.devices) return [];

    let filtered = state.result.devices;

    if (state.filter.searchText) {
      const search = state.filter.searchText.toLowerCase();
      filtered = filtered.filter(d =>
        d.deviceName?.toLowerCase().includes(search) ||
        d.userPrincipalName?.toLowerCase().includes(search) ||
        d.model?.toLowerCase().includes(search)
      );
    }

    if (state.filter.selectedPlatforms.length > 0) {
      filtered = filtered.filter(d =>
        state.filter.selectedPlatforms.includes(d.operatingSystem)
      );
    }

    if (state.filter.selectedComplianceStates.length > 0) {
      filtered = filtered.filter(d =>
        state.filter.selectedComplianceStates.includes(d.complianceState)
      );
    }

    if (state.filter.selectedManagementStates.length > 0) {
      filtered = filtered.filter(d =>
        state.filter.selectedManagementStates.includes(d.managementState)
      );
    }

    if (state.filter.showNonCompliantOnly) {
      filtered = filtered.filter(d => d.complianceState !== 'compliant');
    }

    return filtered;
  }, [state.result?.devices, state.filter]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    if (!state.result?.applications) return [];

    let filtered = state.result.applications;

    if (state.filter.searchText) {
      const search = state.filter.searchText.toLowerCase();
      filtered = filtered.filter(app =>
        app.displayName?.toLowerCase().includes(search) ||
        app.description?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [state.result?.applications, state.filter.searchText]);

  // Filtered configuration policies
  const filteredConfigurations = useMemo(() => {
    if (!state.result?.configurationPolicies) return [];

    let filtered = state.result.configurationPolicies;

    if (state.filter.searchText) {
      const search = state.filter.searchText.toLowerCase();
      filtered = filtered.filter(policy =>
        policy.displayName?.toLowerCase().includes(search) ||
        policy.description?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [state.result?.configurationPolicies, state.filter.searchText]);

  // Filtered data based on active tab and filters (for backward compatibility)
  const filteredData = useMemo(() => {
    switch (state.activeTab) {
      case 'devices':
        return filteredDevices;
      case 'applications':
        return filteredApplications;
      case 'config-policies':
        return filteredConfigurations;
      case 'compliance-policies':
        return state.result?.compliancePolicies?.filter(policy => {
          if (!state.filter.searchText) return true;
          const search = state.filter.searchText.toLowerCase();
          return policy.displayName?.toLowerCase().includes(search) ||
                 policy.description?.toLowerCase().includes(search);
        }) || [];
      case 'app-protection':
        return state.result?.appProtectionPolicies?.filter(policy => {
          if (!state.filter.searchText) return true;
          const search = state.filter.searchText.toLowerCase();
          return policy.displayName?.toLowerCase().includes(search) ||
                 policy.description?.toLowerCase().includes(search);
        }) || [];
      default:
        return [];
    }
  }, [state.result, state.activeTab, state.filter.searchText, filteredDevices, filteredApplications, filteredConfigurations]);

  // Statistics
  const stats = useMemo<IntuneStats | null>(() => {
    if (!state.result) return null;

    const devices = state.result.devices || [];

    const devicesByPlatform: Record<string, number> = {};
    const devicesByComplianceState: Record<string, number> = {};
    const deviceModelCounts: Record<string, number> = {};
    const nonComplianceReasonCounts: Record<string, number> = {};

    devices.forEach(device => {
      // Platform breakdown
      const platform = device.operatingSystem || 'Unknown';
      devicesByPlatform[platform] = (devicesByPlatform[platform] || 0) + 1;

      // Compliance state breakdown
      const complianceState = device.complianceState || 'Unknown';
      devicesByComplianceState[complianceState] = (devicesByComplianceState[complianceState] || 0) + 1;

      // Device model counts
      if (device.model) {
        deviceModelCounts[device.model] = (deviceModelCounts[device.model] || 0) + 1;
      }

      // Non-compliance reasons
      if (device.complianceState !== 'compliant' && device.complianceGracePeriodExpirationDateTime) {
        // This is simplified - in real implementation, parse actual non-compliance details
        const reason = 'Compliance grace period expired';
        nonComplianceReasonCounts[reason] = (nonComplianceReasonCounts[reason] || 0) + 1;
      }
    });

    const topDeviceModels = Object.entries(deviceModelCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([model, count]) => ({ model, count }));

    const topNonComplianceReasons = Object.entries(nonComplianceReasonCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }));

    const compliantDevices = devicesByComplianceState['compliant'] || 0;
    const totalDevices = devices.length;
    const complianceRate = totalDevices > 0 ? (compliantDevices / totalDevices) * 100 : 0;

    return {
      totalDevices,
      compliantDevices,
      nonCompliantDevices: totalDevices - compliantDevices,
      devicesByPlatform,
      devicesByComplianceState,
      totalApplications: state.result.totalApplicationsFound || 0,
      totalConfigPolicies: state.result.totalConfigPoliciesFound || 0,
      totalCompliancePolicies: state.result.totalCompliancePoliciesFound || 0,
      totalAppProtectionPolicies: state.result.totalAppProtectionPoliciesFound || 0,
      totalPolicies: (state.result.totalConfigPoliciesFound || 0) + (state.result.totalCompliancePoliciesFound || 0) + (state.result.totalAppProtectionPoliciesFound || 0),
      totalConfigurations: state.result.totalConfigPoliciesFound || 0,
      complianceRate,
      topDeviceModels,
      topNonComplianceReasons
    };
  }, [state.result]);

  // CSV Export with advanced flattening
  const exportToCSV = useCallback((data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
      const flattened: Record<string, any> = {};

      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value === null || value === undefined) {
          flattened[newKey] = '';
        } else if (value instanceof Date) {
          flattened[newKey] = value.toISOString();
        } else if (Array.isArray(value)) {
          flattened[newKey] = value.map(v =>
            typeof v === 'object' ? JSON.stringify(v) : v
          ).join('; ');
        } else if (typeof value === 'object') {
          Object.assign(flattened, flattenObject(value, newKey));
        } else {
          flattened[newKey] = value;
        }
      });

      return flattened;
    };

    const flattenedData = data.map(item => flattenObject(item));
    const headers = Object.keys(flattenedData[0]);

    const csvContent = [
      headers.join(','),
      ...flattenedData.map(row =>
        headers.map(header => {
          const value = row[header];
          const stringValue = value?.toString() || '';
          return stringValue.includes(',') || stringValue.includes('"')
            ? `"${stringValue.replace(/"/g, '""')}"`
            : stringValue;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }, []);

  // Excel Export
  const exportToExcel = useCallback(async (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      await window.electronAPI.executeModule({
        modulePath: 'Modules/Export/ExportToExcel.psm1',
        functionName: 'Export-IntuneData',
        parameters: {
          Data: data,
          SheetName: state.activeTab,
          FileName: filename
        }
      });
    } catch (error: any) {
      console.error('Excel export failed:', error);
      alert('Excel export failed: ' + error.message);
    }
  }, [state.activeTab]);

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
    filteredDevices,
    filteredApplications,
    filteredConfigurations,
    stats,

    // Column definitions
    deviceColumns,
    policyColumns: configPolicyColumns,
    applicationColumns,
    configurationColumns: compliancePolicyColumns,

    // Actions
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    setActiveTab,
    updateFilter,
    clearError,
    exportToCSV,
    exportToExcel
  };
};
