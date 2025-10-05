import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ColDef } from 'ag-grid-community';
import type {
  LicenseDiscoveryResult,
  License,
  LicenseAssignment,
  Subscription,
  LicenseDiscoveryConfig,
  LicenseStatus
} from '../types/models/licensing';

type TabType = 'overview' | 'licenses' | 'assignments' | 'subscriptions' | 'compliance';

interface LicensingDiscoveryState {
  config: Partial<LicenseDiscoveryConfig>;
  result: LicenseDiscoveryResult | null;
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
    selectedLicenseTypes: string[];
    selectedStatuses: LicenseStatus[];
    showOnlyExpiring: boolean;
    showOnlyUnassigned: boolean;
  };
  cancellationToken: string | null;
  error: string | null;
}

interface LicenseStats {
  totalLicenses: number;
  totalAssigned: number;
  totalAvailable: number;
  totalUnits: number;
  consumedUnits: number;
  availableUnits: number;
  utilizationRate: number;
  totalCost: number;
  costPerMonth: number;
  licensesByProduct: Record<string, number>;
  licensesByStatus: Record<LicenseStatus, number>;
  assignmentsBySource: Record<string, number>;
  topCostProducts: Array<{ product: string; cost: number; count: number; utilization: number }>;
  expiringCount: number;
  underlicensedCount: number;
  overlicensedCount: number;
}

export const useLicensingDiscoveryLogic = () => {
  const [state, setState] = useState<LicensingDiscoveryState>({
    config: {
      includeMicrosoft365: true,
      includeAzure: true,
      includeOffice: true,
      includeWindows: true,
      includeThirdParty: false,
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
      selectedLicenseTypes: [],
      selectedStatuses: [],
      showOnlyExpiring: false,
      showOnlyUnassigned: false
    },
    cancellationToken: null,
    error: null
  });

  // IPC progress tracking
  useEffect(() => {
    const unsubscribe = window.electronAPI?.onProgress?.((data: any) => {
      if (data.type === 'licensing-discovery' && data.token === state.cancellationToken) {
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
    const token = `licensing-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState(prev => ({
      ...prev,
      isDiscovering: true,
      error: null,
      cancellationToken: token,
      progress: { current: 0, total: 100, message: 'Starting license discovery...', percentage: 0 }
    }));

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/LicensingDiscovery.psm1',
        functionName: 'Invoke-LicenseDiscovery',
        parameters: {
          IncludeMicrosoft365: state.config.includeMicrosoft365,
          IncludeAzure: state.config.includeAzure,
          IncludeOffice: state.config.includeOffice,
          IncludeWindows: state.config.includeWindows,
          IncludeThirdParty: state.config.includeThirdParty,
          TenantId: state.config.tenantId,
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

  const updateConfig = useCallback((updates: Partial<LicenseDiscoveryConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...updates }
    }));
  }, []);

  const setActiveTab = useCallback((tab: TabType) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const updateFilter = useCallback((updates: Partial<LicensingDiscoveryState['filter']>) => {
    setState(prev => ({
      ...prev,
      filter: { ...prev.filter, ...updates }
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // License columns
  const licenseColumns = useMemo<ColDef<License>[]>(() => [
    {
      field: 'productName',
      headerName: 'Product Name',
      sortable: true,
      filter: true,
      width: 280
    },
    {
      field: 'skuPartNumber',
      headerName: 'SKU',
      sortable: true,
      filter: true,
      width: 180
    },
    {
      field: 'vendor',
      headerName: 'Vendor',
      sortable: true,
      filter: true,
      width: 150
    },
    {
      field: 'prepaidUnits.enabled',
      headerName: 'Total Licenses',
      sortable: true,
      filter: true,
      width: 140,
      valueGetter: (params) => params.data?.prepaidUnits?.enabled || 0
    },
    {
      field: 'consumedUnits',
      headerName: 'Assigned',
      sortable: true,
      filter: true,
      width: 120
    },
    {
      field: 'availableUnits',
      headerName: 'Available',
      sortable: true,
      filter: true,
      width: 120
    },
    {
      field: 'utilization',
      headerName: 'Utilization',
      sortable: true,
      filter: true,
      width: 130,
      valueGetter: (params) => {
        const total = params.data?.prepaidUnits?.enabled || 0;
        const consumed = params.data?.consumedUnits || 0;
        return total > 0 ? ((consumed / total) * 100).toFixed(1) + '%' : '0%';
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      sortable: true,
      filter: true,
      width: 120,
      valueFormatter: (params) => {
        const status = params.value as LicenseStatus;
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
      }
    },
    {
      field: 'expirationDate',
      headerName: 'Expires',
      sortable: true,
      filter: true,
      width: 150,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
    },
    {
      field: 'cost.amount',
      headerName: 'Cost',
      sortable: true,
      filter: true,
      width: 140,
      valueGetter: (params) => {
        const cost = params.data?.cost;
        if (!cost) return 'N/A';
        return `${cost.currency} ${cost.amount.toFixed(2)}/${cost.billingCycle}`;
      }
    }
  ], []);

  // Assignment columns
  const assignmentColumns = useMemo<ColDef<LicenseAssignment>[]>(() => [
    {
      field: 'displayName',
      headerName: 'User Name',
      sortable: true,
      filter: true,
      width: 220
    },
    {
      field: 'userPrincipalName',
      headerName: 'Email',
      sortable: true,
      filter: true,
      width: 260
    },
    {
      field: 'skuId',
      headerName: 'License SKU',
      sortable: true,
      filter: true,
      width: 280,
      valueGetter: (params) => {
        // Map SKU ID to product name from result
        const skuId = params.data?.skuId;
        if (!skuId || !state.result) return skuId || 'Unknown';
        const license = state.result.licenses?.find(l => l.skuId === skuId);
        return license?.productName || skuId;
      }
    },
    {
      field: 'assignmentSource',
      headerName: 'Assignment Source',
      sortable: true,
      filter: true,
      width: 160,
      valueFormatter: (params) => {
        const source = params.value as string;
        return source ? source.charAt(0).toUpperCase() + source.slice(1) : 'Unknown';
      }
    },
    {
      field: 'assignedPlans',
      headerName: 'Active Plans',
      sortable: true,
      filter: true,
      width: 130,
      valueFormatter: (params) => params.value?.length || 0
    },
    {
      field: 'disabledPlans',
      headerName: 'Disabled Plans',
      sortable: true,
      filter: true,
      width: 140,
      valueFormatter: (params) => params.value?.length || 0
    },
    {
      field: 'assignedDateTime',
      headerName: 'Assigned Date',
      sortable: true,
      filter: true,
      width: 180,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
    }
  ], [state.result]);

  // Subscription columns
  const subscriptionColumns = useMemo<ColDef<Subscription>[]>(() => [
    {
      field: 'subscriptionName',
      headerName: 'Subscription Name',
      sortable: true,
      filter: true,
      width: 280
    },
    {
      field: 'subscriptionId',
      headerName: 'Subscription ID',
      sortable: true,
      filter: true,
      width: 280
    },
    {
      field: 'status',
      headerName: 'Status',
      sortable: true,
      filter: true,
      width: 120,
      valueFormatter: (params) => {
        const status = params.value as LicenseStatus;
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
      }
    },
    {
      field: 'totalLicenses',
      headerName: 'Total Licenses',
      sortable: true,
      filter: true,
      width: 140
    },
    {
      field: 'assignedLicenses',
      headerName: 'Assigned',
      sortable: true,
      filter: true,
      width: 120
    },
    {
      field: 'utilization',
      headerName: 'Utilization',
      sortable: true,
      filter: true,
      width: 130,
      valueGetter: (params) => {
        const total = params.data?.totalLicenses || 0;
        const assigned = params.data?.assignedLicenses || 0;
        return total > 0 ? ((assigned / total) * 100).toFixed(1) + '%' : '0%';
      }
    },
    {
      field: 'isTrial',
      headerName: 'Trial',
      sortable: true,
      filter: true,
      width: 100,
      valueFormatter: (params) => params.value ? 'Yes' : 'No'
    },
    {
      field: 'autoRenew',
      headerName: 'Auto Renew',
      sortable: true,
      filter: true,
      width: 120,
      valueFormatter: (params) => params.value ? 'Yes' : 'No'
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      sortable: true,
      filter: true,
      width: 150,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      sortable: true,
      filter: true,
      width: 150,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
    }
  ], []);

  // Dynamic columns based on active tab
  const columns = useMemo<ColDef[]>(() => {
    switch (state.activeTab) {
      case 'licenses':
        return licenseColumns;
      case 'assignments':
        return assignmentColumns;
      case 'subscriptions':
        return subscriptionColumns;
      default:
        return [];
    }
  }, [state.activeTab, licenseColumns, assignmentColumns, subscriptionColumns]);

  // Filtered licenses
  const filteredLicenses = useMemo(() => {
    if (!state.result?.licenses) return [];

    let filtered = state.result.licenses;

    if (state.filter.searchText) {
      const search = state.filter.searchText.toLowerCase();
      filtered = filtered.filter(l =>
        l.productName?.toLowerCase().includes(search) ||
        l.skuPartNumber?.toLowerCase().includes(search) ||
        l.vendor?.toLowerCase().includes(search)
      );
    }

    if (state.filter.selectedLicenseTypes.length > 0) {
      filtered = filtered.filter(l =>
        state.filter.selectedLicenseTypes.includes(l.skuPartNumber)
      );
    }

    if (state.filter.selectedStatuses.length > 0) {
      filtered = filtered.filter(l =>
        state.filter.selectedStatuses.includes(l.status)
      );
    }

    if (state.filter.showOnlyExpiring) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      filtered = filtered.filter(l =>
        l.expirationDate && new Date(l.expirationDate) <= thirtyDaysFromNow
      );
    }

    if (state.filter.showOnlyUnassigned) {
      filtered = filtered.filter(l => l.availableUnits > 0);
    }

    return filtered;
  }, [state.result?.licenses, state.filter]);

  // Filtered data based on active tab and filters (for backward compatibility)
  const filteredData = useMemo(() => {
    switch (state.activeTab) {
      case 'licenses':
        return filteredLicenses;
      case 'assignments':
        return state.result?.assignments?.filter(assignment => {
          if (!state.filter.searchText) return true;
          const search = state.filter.searchText.toLowerCase();
          return assignment.displayName?.toLowerCase().includes(search) ||
                 assignment.userPrincipalName?.toLowerCase().includes(search);
        }) || [];
      case 'subscriptions':
        return state.result?.subscriptions?.filter(sub => {
          if (!state.filter.searchText) return true;
          const search = state.filter.searchText.toLowerCase();
          return sub.subscriptionName?.toLowerCase().includes(search) ||
                 sub.subscriptionId?.toLowerCase().includes(search);
        }) || [];
      default:
        return [];
    }
  }, [state.result, state.activeTab, state.filter.searchText, filteredLicenses]);

  // Statistics
  const stats = useMemo<LicenseStats | null>(() => {
    if (!state.result) return null;

    const licenses = state.result.licenses || [];
    const assignments = state.result.assignments || [];

    const licensesByProduct: Record<string, number> = {};
    const licensesByStatus: Record<LicenseStatus, number> = {
      active: 0,
      expired: 0,
      trial: 0,
      suspended: 0
    };
    const assignmentsBySource: Record<string, number> = {
      direct: 0,
      group: 0,
      inherited: 0
    };

    let totalCost = 0;
    const costByProduct: Record<string, { cost: number; count: number; consumed: number; enabled: number }> = {};

    licenses.forEach(license => {
      // Product breakdown
      const product = license.productName || 'Unknown';
      licensesByProduct[product] = (licensesByProduct[product] || 0) + (license.prepaidUnits?.enabled || 0);

      // Status breakdown
      licensesByStatus[license.status] = (licensesByStatus[license.status] || 0) + 1;

      // Cost calculation
      if (license.cost) {
        const monthlyCost = license.cost.billingCycle === 'annual'
          ? (license.cost.amount / 12) * (license.prepaidUnits?.enabled || 0)
          : license.cost.amount * (license.prepaidUnits?.enabled || 0);
        totalCost += monthlyCost;

        if (!costByProduct[product]) {
          costByProduct[product] = { cost: 0, count: 0, consumed: 0, enabled: 0 };
        }
        costByProduct[product].cost += monthlyCost;
        costByProduct[product].count += 1;
        costByProduct[product].consumed += license.consumedUnits || 0;
        costByProduct[product].enabled += license.prepaidUnits?.enabled || 0;
      }
    });

    assignments.forEach(assignment => {
      const source = assignment.assignmentSource || 'direct';
      assignmentsBySource[source] = (assignmentsBySource[source] || 0) + 1;
    });

    const topCostProducts = Object.entries(costByProduct)
      .sort((a, b) => b[1].cost - a[1].cost)
      .slice(0, 5)
      .map(([product, data]) => ({
        product,
        cost: data.cost,
        count: data.count,
        utilization: data.enabled > 0 ? (data.consumed / data.enabled) * 100 : 0
      }));

    const totalLicenses = state.result.totalLicenses || 0;
    const totalAssigned = state.result.totalAssigned || 0;
    const totalAvailable = state.result.totalAvailable || 0;
    const utilizationRate = totalLicenses > 0 ? (totalAssigned / totalLicenses) * 100 : 0;

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringCount = licenses.filter(l =>
      l.expirationDate && new Date(l.expirationDate) <= thirtyDaysFromNow
    ).length;

    return {
      totalLicenses,
      totalAssigned,
      totalAvailable,
      totalUnits: totalLicenses,
      consumedUnits: totalAssigned,
      availableUnits: totalAvailable,
      utilizationRate,
      totalCost,
      costPerMonth: totalCost,
      licensesByProduct,
      licensesByStatus,
      assignmentsBySource,
      topCostProducts,
      expiringCount,
      underlicensedCount: state.result.complianceStatus?.underlicensedProducts?.length || 0,
      overlicensedCount: state.result.complianceStatus?.overlicensedProducts?.length || 0
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
        functionName: 'Export-LicensingData',
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
    filteredLicenses,
    stats,

    // Column definitions
    licenseColumns,
    assignmentColumns,
    subscriptionColumns,

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
