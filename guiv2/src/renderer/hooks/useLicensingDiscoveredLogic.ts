/**
 * Licensing Discovered Logic Hook
 * Contains business logic for viewing discovered licensing data from CSV files
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { useProfileStore } from '../store/useProfileStore';

type LicenseStatus = 'active' | 'expired' | 'trial' | 'suspended';

interface LicenseData {
  productName?: string;
  skuId?: string;
  status?: LicenseStatus;
  prepaidUnits?: { enabled?: number; suspended?: number; warning?: number };
  consumedUnits?: number;
  expirationDate?: string;
  cost?: { amount: number; currency: string; billingCycle: 'monthly' | 'annual' };
  [key: string]: any;
}

interface AssignmentData {
  userId?: string;
  userPrincipalName?: string;
  displayName?: string;
  skuId?: string;
  productName?: string;
  assignmentSource?: string;
  assignedDate?: string;
  [key: string]: any;
}

interface SubscriptionData {
  subscriptionId?: string;
  subscriptionName?: string;
  status?: string;
  quantity?: number;
  [key: string]: any;
}

interface LicenseStats {
  totalLicenses: number;
  totalAssigned: number;
  totalAvailable: number;
  utilizationRate: number;
  costPerMonth: number;
  expiringCount: number;
  underlicensedCount: number;
  overlicensedCount: number;
  licensesByStatus: Record<LicenseStatus, number>;
  assignmentsBySource: Record<string, number>;
  topCostProducts: Array<{ product: string; cost: number; count: number; utilization: number }>;
}

interface LicensingDiscoveredState {
  licenses: LicenseData[];
  assignments: AssignmentData[];
  subscriptions: SubscriptionData[];
  isLoading: boolean;
  error: string | null;
  activeTab: 'overview' | 'licenses' | 'assignments' | 'subscriptions';
  filter: {
    searchText: string;
    selectedStatuses: LicenseStatus[];
    showOnlyExpiring: boolean;
    showOnlyUnassigned: boolean;
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
async function loadCsvFile(basePath: string, filename: string): Promise<any[]> {
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
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data || []);
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

export const useLicensingDiscoveredLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  const [state, setState] = useState<LicensingDiscoveredState>({
    licenses: [],
    assignments: [],
    subscriptions: [],
    isLoading: true,
    error: null,
    activeTab: 'overview',
    filter: {
      searchText: '',
      selectedStatuses: [],
      showOnlyExpiring: false,
      showOnlyUnassigned: false,
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

        // Try multiple naming patterns for licenses
        let licenses = await loadCsvFile(basePath, 'LicensingDiscoveryLicenses.csv');
        if (licenses.length === 0) {
          licenses = await loadCsvFile(basePath, 'LicensingDiscovery_Licenses.csv');
        }

        // Try multiple naming patterns for assignments
        let assignments = await loadCsvFile(basePath, 'LicensingDiscoveryAssignments.csv');
        if (assignments.length === 0) {
          assignments = await loadCsvFile(basePath, 'LicensingDiscovery_Assignments.csv');
        }

        // Try multiple naming patterns for subscriptions
        let subscriptions = await loadCsvFile(basePath, 'LicensingDiscoverySubscriptions.csv');
        if (subscriptions.length === 0) {
          subscriptions = await loadCsvFile(basePath, 'LicensingDiscoveryLicensingSubscriptions.csv');
        }

        setState(prev => ({
          ...prev,
          licenses,
          assignments,
          subscriptions,
          isLoading: false,
        }));
      } catch (error: any) {
        console.error('[LicensingDiscoveredHook] Failed to load data:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to load licensing data',
        }));
      }
    };

    loadData();
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  // Tab management
  const setActiveTab = useCallback((tab: LicensingDiscoveredState['activeTab']) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  // Filter management
  const updateFilter = useCallback((updates: Partial<LicensingDiscoveredState['filter']>) => {
    setState(prev => ({
      ...prev,
      filter: { ...prev.filter, ...updates },
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Filtered licenses
  const filteredLicenses = useMemo(() => {
    let filtered = [...state.licenses];

    // Search filter
    if (state.filter.searchText) {
      const search = state.filter.searchText.toLowerCase();
      filtered = filtered.filter(license =>
        license.productName?.toLowerCase().includes(search) ||
        license.skuId?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (state.filter.selectedStatuses.length > 0) {
      filtered = filtered.filter(license =>
        state.filter.selectedStatuses.includes(license.status as LicenseStatus)
      );
    }

    // Expiring soon filter
    if (state.filter.showOnlyExpiring) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      filtered = filtered.filter(license =>
        license.expirationDate && new Date(license.expirationDate) <= thirtyDaysFromNow
      );
    }

    // Unassigned filter
    if (state.filter.showOnlyUnassigned) {
      filtered = filtered.filter(license =>
        (license.prepaidUnits?.enabled || 0) > (license.consumedUnits || 0)
      );
    }

    return filtered;
  }, [state.licenses, state.filter]);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    if (!state.filter.searchText) return state.assignments;

    const search = state.filter.searchText.toLowerCase();
    return state.assignments.filter(assignment =>
      assignment.displayName?.toLowerCase().includes(search) ||
      assignment.userPrincipalName?.toLowerCase().includes(search) ||
      assignment.productName?.toLowerCase().includes(search)
    );
  }, [state.assignments, state.filter.searchText]);

  // Filtered subscriptions
  const filteredSubscriptions = useMemo(() => {
    if (!state.filter.searchText) return state.subscriptions;

    const search = state.filter.searchText.toLowerCase();
    return state.subscriptions.filter(sub =>
      sub.subscriptionName?.toLowerCase().includes(search) ||
      sub.subscriptionId?.toLowerCase().includes(search)
    );
  }, [state.subscriptions, state.filter.searchText]);

  // Active tab data
  const filteredData = useMemo(() => {
    switch (state.activeTab) {
      case 'licenses':
        return filteredLicenses;
      case 'assignments':
        return filteredAssignments;
      case 'subscriptions':
        return filteredSubscriptions;
      default:
        return filteredLicenses;
    }
  }, [state.activeTab, filteredLicenses, filteredAssignments, filteredSubscriptions]);

  // Columns based on active tab
  const columns = useMemo<ColumnDef[]>(() => {
    switch (state.activeTab) {
      case 'licenses':
        return [
          { key: 'productName', header: 'Product', width: 250 },
          { key: 'skuId', header: 'SKU ID', width: 200 },
          { key: 'status', header: 'Status', width: 100 },
          { key: 'prepaidUnits.enabled', header: 'Total', width: 80, getValue: (row: any) => row.prepaidUnits?.enabled || row.TotalUnits || 0 },
          { key: 'consumedUnits', header: 'Assigned', width: 80, getValue: (row: any) => row.consumedUnits || row.AssignedUnits || 0 },
          { key: 'available', header: 'Available', width: 80, getValue: (row: any) => (row.prepaidUnits?.enabled || row.TotalUnits || 0) - (row.consumedUnits || row.AssignedUnits || 0) },
          { key: 'expirationDate', header: 'Expires', width: 120 },
        ];
      case 'assignments':
        return [
          { key: 'displayName', header: 'User', width: 200, getValue: (row: any) => row.displayName || row.DisplayName },
          { key: 'userPrincipalName', header: 'Email', width: 250, getValue: (row: any) => row.userPrincipalName || row.UserPrincipalName },
          { key: 'productName', header: 'License', width: 250, getValue: (row: any) => row.productName || row.ProductName || row.SkuPartNumber },
          { key: 'assignmentSource', header: 'Source', width: 100, getValue: (row: any) => row.assignmentSource || row.AssignmentSource || 'Direct' },
          { key: 'assignedDate', header: 'Assigned', width: 120, getValue: (row: any) => row.assignedDate || row.AssignedDate },
        ];
      case 'subscriptions':
        return [
          { key: 'subscriptionName', header: 'Name', width: 300, getValue: (row: any) => row.subscriptionName || row.SubscriptionName || row.SkuPartNumber },
          { key: 'subscriptionId', header: 'ID', width: 200, getValue: (row: any) => row.subscriptionId || row.SubscriptionId || row.SkuId },
          { key: 'status', header: 'Status', width: 100, getValue: (row: any) => row.status || row.Status || row.CapabilityStatus },
          { key: 'quantity', header: 'Quantity', width: 100, getValue: (row: any) => row.quantity || row.Quantity || row.PrepaidUnits },
        ];
      default:
        return [
          { key: 'productName', header: 'Product', width: 250 },
          { key: 'status', header: 'Status', width: 100 },
        ];
    }
  }, [state.activeTab]);

  // Statistics
  const stats = useMemo<LicenseStats | null>(() => {
    if (state.licenses.length === 0 && state.assignments.length === 0) return null;

    const licensesByStatus: Record<LicenseStatus, number> = {
      active: 0,
      expired: 0,
      trial: 0,
      suspended: 0,
    };

    const assignmentsBySource: Record<string, number> = {
      direct: 0,
      group: 0,
      inherited: 0,
    };

    let totalLicenses = 0;
    let totalAssigned = 0;
    let totalCost = 0;
    const costByProduct: Record<string, { cost: number; count: number; consumed: number; enabled: number }> = {};

    state.licenses.forEach(license => {
      const enabled = license.prepaidUnits?.enabled || parseInt(license.TotalUnits as string) || 0;
      const consumed = license.consumedUnits || parseInt(license.AssignedUnits as string) || 0;
      totalLicenses += enabled;
      totalAssigned += consumed;

      // Status breakdown
      const status = (license.status || license.Status || 'active').toLowerCase() as LicenseStatus;
      if (licensesByStatus[status] !== undefined) {
        licensesByStatus[status]++;
      }

      // Cost calculation
      const product = license.productName || license.ProductName || license.SkuPartNumber || 'Unknown';
      if (license.cost?.amount) {
        const monthlyCost = license.cost.billingCycle === 'annual'
          ? (license.cost.amount / 12) * enabled
          : license.cost.amount * enabled;
        totalCost += monthlyCost;

        if (!costByProduct[product]) {
          costByProduct[product] = { cost: 0, count: 0, consumed: 0, enabled: 0 };
        }
        costByProduct[product].cost += monthlyCost;
        costByProduct[product].count++;
        costByProduct[product].consumed += consumed;
        costByProduct[product].enabled += enabled;
      } else if (!costByProduct[product]) {
        costByProduct[product] = { cost: 0, count: 1, consumed, enabled };
      } else {
        costByProduct[product].count++;
        costByProduct[product].consumed += consumed;
        costByProduct[product].enabled += enabled;
      }
    });

    state.assignments.forEach(assignment => {
      const source = (assignment.assignmentSource || assignment.AssignmentSource || 'direct').toLowerCase();
      if (assignmentsBySource[source] !== undefined) {
        assignmentsBySource[source]++;
      } else {
        assignmentsBySource.direct++;
      }
    });

    const topCostProducts = Object.entries(costByProduct)
      .sort((a, b) => b[1].enabled - a[1].enabled) // Sort by license count if no cost data
      .slice(0, 5)
      .map(([product, data]) => ({
        product,
        cost: data.cost,
        count: data.count,
        utilization: data.enabled > 0 ? (data.consumed / data.enabled) * 100 : 0,
      }));

    const totalAvailable = totalLicenses - totalAssigned;
    const utilizationRate = totalLicenses > 0 ? (totalAssigned / totalLicenses) * 100 : 0;

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringCount = state.licenses.filter(l =>
      l.expirationDate && new Date(l.expirationDate) <= thirtyDaysFromNow
    ).length;

    return {
      totalLicenses,
      totalAssigned,
      totalAvailable,
      utilizationRate,
      costPerMonth: totalCost,
      expiringCount,
      underlicensedCount: 0, // Would need compliance data
      overlicensedCount: totalAvailable > 0 ? topCostProducts.filter(p => p.utilization < 50).length : 0,
      licensesByStatus,
      assignmentsBySource,
      topCostProducts,
    };
  }, [state.licenses, state.assignments]);

  // Export functions
  const exportToCSV = useCallback((data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
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
    // For now, just export as CSV with .xlsx extension
    exportToCSV(data, filename.replace('.xlsx', '.csv'));
  }, [exportToCSV]);

  // Reload data
  const reloadData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    const basePath = selectedSourceProfile?.dataPath || `C:\\DiscoveryData\\${selectedSourceProfile?.companyName}`;

    if (basePath && selectedSourceProfile?.companyName) {
      try {
        let licenses = await loadCsvFile(basePath, 'LicensingDiscoveryLicenses.csv');
        if (licenses.length === 0) {
          licenses = await loadCsvFile(basePath, 'LicensingDiscovery_Licenses.csv');
        }

        let assignments = await loadCsvFile(basePath, 'LicensingDiscoveryAssignments.csv');
        if (assignments.length === 0) {
          assignments = await loadCsvFile(basePath, 'LicensingDiscovery_Assignments.csv');
        }

        let subscriptions = await loadCsvFile(basePath, 'LicensingDiscoverySubscriptions.csv');
        if (subscriptions.length === 0) {
          subscriptions = await loadCsvFile(basePath, 'LicensingDiscoveryLicensingSubscriptions.csv');
        }

        setState(prev => ({
          ...prev,
          licenses,
          assignments,
          subscriptions,
          isLoading: false,
        }));
      } catch (error: any) {
        setState(prev => ({ ...prev, isLoading: false, error: error.message }));
      }
    }
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  return {
    // State
    licenses: state.licenses,
    assignments: state.assignments,
    subscriptions: state.subscriptions,
    isLoading: state.isLoading,
    error: state.error,
    activeTab: state.activeTab,
    filter: state.filter,

    // Computed
    stats,
    columns,
    filteredData,
    filteredLicenses,
    filteredAssignments,
    filteredSubscriptions,

    // Actions
    setActiveTab,
    updateFilter,
    clearError,
    exportToCSV,
    exportToExcel,
    reloadData,
  };
};
