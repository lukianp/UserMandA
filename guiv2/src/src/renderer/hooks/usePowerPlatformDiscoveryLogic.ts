import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ColDef } from 'ag-grid-community';

import type {
  PowerPlatformDiscoveryResult,
  PowerEnvironment,
  PowerApp,
  PowerFlow,
  PowerConnector,
  PowerPlatformDiscoveryConfig
} from '../types/models/powerplatform';

type TabType = 'overview' | 'environments' | 'apps' | 'flows' | 'connectors';

interface PowerPlatformDiscoveryState {
  config: Partial<PowerPlatformDiscoveryConfig>;
  result: PowerPlatformDiscoveryResult | null;
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
    selectedEnvironments: string[];
    selectedAppTypes: string[];
    selectedFlowStates: string[];
  };
  cancellationToken: string | null;
  error: string | null;
}

interface PowerPlatformStats {
  totalEnvironments: number;
  totalApps: number;
  totalFlows: number;
  totalConnectors: number;
  appsByType: Record<string, number>;
  flowsByState: Record<string, number>;
  environmentsByType: Record<string, number>;
  topAppOwners: Array<{ owner: string; count: number }>;
  topFlowOwners: Array<{ owner: string; count: number }>;
  flowRunStats: { successCount: number; failedCount: number };
}

export const usePowerPlatformDiscoveryLogic = () => {
  const [state, setState] = useState<PowerPlatformDiscoveryState>({
    config: {
      tenantId: '',
      includeApps: true,
      includeFlows: true,
      includeConnectors: true,
      includeEnvironments: true,
      timeout: 600000
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
      selectedEnvironments: [],
      selectedAppTypes: [],
      selectedFlowStates: []
    },
    cancellationToken: null,
    error: null
  });

  // IPC progress tracking
  useEffect(() => {
    const unsubscribe = window.electronAPI?.onProgress?.((data: any) => {
      if (data.type === 'powerplatform-discovery' && data.token === state.cancellationToken) {
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
    const token = `powerplatform-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState(prev => ({
      ...prev,
      isDiscovering: true,
      error: null,
      cancellationToken: token,
      progress: { current: 0, total: 100, message: 'Starting Power Platform discovery...', percentage: 0 }
    }));

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/PowerPlatformDiscovery.psm1',
        functionName: 'Invoke-PowerPlatformDiscovery',
        parameters: {
          TenantId: state.config.tenantId,
          IncludeApps: state.config.includeApps,
          IncludeFlows: state.config.includeFlows,
          IncludeConnectors: state.config.includeConnectors,
          IncludeEnvironments: state.config.includeEnvironments,
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

  const updateConfig = useCallback((updates: Partial<PowerPlatformDiscoveryConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...updates }
    }));
  }, []);

  const setActiveTab = useCallback((tab: TabType) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const updateFilter = useCallback((updates: Partial<PowerPlatformDiscoveryState['filter']>) => {
    setState(prev => ({
      ...prev,
      filter: { ...prev.filter, ...updates }
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Environment columns
  const environmentColumns = useMemo<ColDef<PowerEnvironment>[]>(() => [
    {
      field: 'displayName',
      headerName: 'Environment Name',
      sortable: true,
      filter: true,
      width: 250
    },
    {
      field: 'type',
      headerName: 'Type',
      sortable: true,
      filter: true,
      width: 130,
      valueFormatter: (params) => {
        const type = params.value as string;
        return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown';
      }
    },
    {
      field: 'location',
      headerName: 'Location',
      sortable: true,
      filter: true,
      width: 180
    },
    {
      field: 'apps',
      headerName: 'Apps',
      sortable: true,
      filter: true,
      width: 100
    },
    {
      field: 'flows',
      headerName: 'Flows',
      sortable: true,
      filter: true,
      width: 100
    },
    {
      field: 'isDefault',
      headerName: 'Default',
      sortable: true,
      filter: true,
      width: 110,
      valueFormatter: (params) => params.value ? 'Yes' : 'No'
    },
    {
      field: 'createdBy.displayName',
      headerName: 'Created By',
      sortable: true,
      filter: true,
      width: 200,
      valueGetter: (params) => params.data?.createdBy?.displayName || 'Unknown'
    },
    {
      field: 'createdTime',
      headerName: 'Created',
      sortable: true,
      filter: true,
      width: 180,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
    }
  ], []);

  // App columns
  const appColumns = useMemo<ColDef<PowerApp>[]>(() => [
    {
      field: 'displayName',
      headerName: 'App Name',
      sortable: true,
      filter: true,
      width: 250
    },
    {
      field: 'appType',
      headerName: 'Type',
      sortable: true,
      filter: true,
      width: 140,
      valueFormatter: (params) => {
        const type = params.value as string;
        return type === 'canvas' ? 'Canvas' : type === 'model-driven' ? 'Model-Driven' : 'Unknown';
      }
    },
    {
      field: 'owner.displayName',
      headerName: 'Owner',
      sortable: true,
      filter: true,
      width: 200,
      valueGetter: (params) => params.data?.owner?.displayName || 'Unknown'
    },
    {
      field: 'owner.email',
      headerName: 'Owner Email',
      sortable: true,
      filter: true,
      width: 240,
      valueGetter: (params) => params.data?.owner?.email || 'N/A'
    },
    {
      field: 'environmentId',
      headerName: 'Environment',
      sortable: true,
      filter: true,
      width: 200,
      valueGetter: (params) => {
        const envId = params.data?.environmentId;
        if (!envId || !state.result) return envId || 'Unknown';
        const env = state.result.environments?.find(e => e.id === envId);
        return env?.displayName || envId;
      }
    },
    {
      field: 'sharedUsersCount',
      headerName: 'Shared Users',
      sortable: true,
      filter: true,
      width: 140
    },
    {
      field: 'sharedGroupsCount',
      headerName: 'Shared Groups',
      sortable: true,
      filter: true,
      width: 150
    },
    {
      field: 'isFeaturedApp',
      headerName: 'Featured',
      sortable: true,
      filter: true,
      width: 110,
      valueFormatter: (params) => params.value ? 'Yes' : 'No'
    },
    {
      field: 'createdTime',
      headerName: 'Created',
      sortable: true,
      filter: true,
      width: 180,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
    },
    {
      field: 'lastModifiedTime',
      headerName: 'Modified',
      sortable: true,
      filter: true,
      width: 180,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
    }
  ], [state.result]);

  // Flow columns
  const flowColumns = useMemo<ColDef<PowerFlow>[]>(() => [
    {
      field: 'displayName',
      headerName: 'Flow Name',
      sortable: true,
      filter: true,
      width: 250
    },
    {
      field: 'triggerType',
      headerName: 'Trigger Type',
      sortable: true,
      filter: true,
      width: 140,
      valueFormatter: (params) => {
        const type = params.value as string;
        return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown';
      }
    },
    {
      field: 'state',
      headerName: 'State',
      sortable: true,
      filter: true,
      width: 120,
      valueFormatter: (params) => {
        const state = params.value as string;
        return state ? state.charAt(0).toUpperCase() + state.slice(1) : 'Unknown';
      }
    },
    {
      field: 'owner.displayName',
      headerName: 'Owner',
      sortable: true,
      filter: true,
      width: 200,
      valueGetter: (params) => params.data?.owner?.displayName || 'Unknown'
    },
    {
      field: 'owner.email',
      headerName: 'Owner Email',
      sortable: true,
      filter: true,
      width: 240,
      valueGetter: (params) => params.data?.owner?.email || 'N/A'
    },
    {
      field: 'environmentId',
      headerName: 'Environment',
      sortable: true,
      filter: true,
      width: 200,
      valueGetter: (params) => {
        const envId = params.data?.environmentId;
        if (!envId || !state.result) return envId || 'Unknown';
        const env = state.result.environments?.find(e => e.id === envId);
        return env?.displayName || envId;
      }
    },
    {
      field: 'runHistory.successCount',
      headerName: 'Success Runs',
      sortable: true,
      filter: true,
      width: 140,
      valueGetter: (params) => params.data?.runHistory?.successCount || 0
    },
    {
      field: 'runHistory.failedCount',
      headerName: 'Failed Runs',
      sortable: true,
      filter: true,
      width: 130,
      valueGetter: (params) => params.data?.runHistory?.failedCount || 0
    },
    {
      field: 'connectionReferences',
      headerName: 'Connections',
      sortable: true,
      filter: true,
      width: 140,
      valueFormatter: (params) => params.value?.length || 0
    },
    {
      field: 'createdTime',
      headerName: 'Created',
      sortable: true,
      filter: true,
      width: 180,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
    }
  ], [state.result]);

  // Connector columns
  const connectorColumns = useMemo<ColDef<PowerConnector>[]>(() => [
    {
      field: 'displayName',
      headerName: 'Connector Name',
      sortable: true,
      filter: true,
      width: 280
    },
    {
      field: 'publisher',
      headerName: 'Publisher',
      sortable: true,
      filter: true,
      width: 200
    },
    {
      field: 'tier',
      headerName: 'Tier',
      sortable: true,
      filter: true,
      width: 120,
      valueFormatter: (params) => {
        const tier = params.value as string;
        return tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Unknown';
      }
    },
    {
      field: 'isCustomApi',
      headerName: 'Custom',
      sortable: true,
      filter: true,
      width: 110,
      valueFormatter: (params) => params.value ? 'Yes' : 'No'
    },
    {
      field: 'description',
      headerName: 'Description',
      sortable: true,
      filter: true,
      width: 400
    }
  ], []);

  // Dynamic columns based on active tab
  const columns = useMemo<ColDef[]>(() => {
    switch (state.activeTab) {
      case 'environments':
        return environmentColumns;
      case 'apps':
        return appColumns;
      case 'flows':
        return flowColumns;
      case 'connectors':
        return connectorColumns;
      default:
        return [];
    }
  }, [state.activeTab, environmentColumns, appColumns, flowColumns, connectorColumns]);

  // Filtered data based on active tab and filters
  const filteredData = useMemo(() => {
    if (!state.result) return [];

    let data: any[] = [];

    switch (state.activeTab) {
      case 'environments':
        data = state.result.environments || [];
        break;
      case 'apps':
        data = state.result.apps || [];
        break;
      case 'flows':
        data = state.result.flows || [];
        break;
      case 'connectors':
        data = state.result.connectors || [];
        break;
      default:
        return [];
    }

    // Apply filters
    if (state.activeTab === 'apps') {
      const apps = data as PowerApp[];
      let filtered = apps;

      if (state.filter.searchText) {
        const search = state.filter.searchText.toLowerCase();
        filtered = filtered.filter(a =>
          a.displayName?.toLowerCase().includes(search) ||
          a.owner?.displayName?.toLowerCase().includes(search) ||
          a.owner?.email?.toLowerCase().includes(search)
        );
      }

      if (state.filter.selectedEnvironments.length > 0) {
        filtered = filtered.filter(a =>
          state.filter.selectedEnvironments.includes(a.environmentId)
        );
      }

      if (state.filter.selectedAppTypes.length > 0) {
        filtered = filtered.filter(a =>
          state.filter.selectedAppTypes.includes(a.appType)
        );
      }

      return filtered;
    }

    if (state.activeTab === 'flows') {
      const flows = data as PowerFlow[];
      let filtered = flows;

      if (state.filter.searchText) {
        const search = state.filter.searchText.toLowerCase();
        filtered = filtered.filter(f =>
          f.displayName?.toLowerCase().includes(search) ||
          f.owner?.displayName?.toLowerCase().includes(search) ||
          f.owner?.email?.toLowerCase().includes(search)
        );
      }

      if (state.filter.selectedEnvironments.length > 0) {
        filtered = filtered.filter(f =>
          state.filter.selectedEnvironments.includes(f.environmentId)
        );
      }

      if (state.filter.selectedFlowStates.length > 0) {
        filtered = filtered.filter(f =>
          state.filter.selectedFlowStates.includes(f.state)
        );
      }

      return filtered;
    }

    // For other tabs, just apply search filter
    if (state.filter.searchText) {
      const search = state.filter.searchText.toLowerCase();
      return (data ?? []).filter((item: any) =>
        JSON.stringify(item).toLowerCase().includes(search)
      );
    }

    return data;
  }, [state.result, state.activeTab, state.filter]);

  // Statistics
  const stats = useMemo<PowerPlatformStats | null>(() => {
    if (!state.result) return null;

    const environments = state.result.environments || [];
    const apps = state.result.apps || [];
    const flows = state.result.flows || [];
    const connectors = state.result.connectors || [];

    const appsByType: Record<string, number> = {};
    const flowsByState: Record<string, number> = {};
    const environmentsByType: Record<string, number> = {};
    const appOwnerCounts: Record<string, number> = {};
    const flowOwnerCounts: Record<string, number> = {};

    let totalSuccessRuns = 0;
    let totalFailedRuns = 0;

    environments.forEach(env => {
      const type = env.type || 'Unknown';
      environmentsByType[type] = (environmentsByType[type] || 0) + 1;
    });

    apps.forEach(app => {
      const type = app.appType || 'Unknown';
      appsByType[type] = (appsByType[type] || 0) + 1;

      const owner = app.owner?.displayName || 'Unknown';
      appOwnerCounts[owner] = (appOwnerCounts[owner] || 0) + 1;
    });

    flows.forEach(flow => {
      const state = flow.state || 'Unknown';
      flowsByState[state] = (flowsByState[state] || 0) + 1;

      const owner = flow.owner?.displayName || 'Unknown';
      flowOwnerCounts[owner] = (flowOwnerCounts[owner] || 0) + 1;

      if (flow.runHistory) {
        totalSuccessRuns += flow.runHistory.successCount || 0;
        totalFailedRuns += flow.runHistory.failedCount || 0;
      }
    });

    const topAppOwners = Object.entries(appOwnerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([owner, count]) => ({ owner, count }));

    const topFlowOwners = Object.entries(flowOwnerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([owner, count]) => ({ owner, count }));

    return {
      totalEnvironments: environments.length,
      totalApps: apps.length,
      totalFlows: flows.length,
      totalConnectors: connectors.length,
      appsByType,
      flowsByState,
      environmentsByType,
      topAppOwners,
      topFlowOwners,
      flowRunStats: { successCount: totalSuccessRuns, failedCount: totalFailedRuns }
    };
  }, [state.result]);

  // CSV Export
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

    const flattenedData = (data ?? []).map(item => flattenObject(item));
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
        functionName: 'Export-PowerPlatformData',
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
    currentResult: state.result,
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
