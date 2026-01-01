/**
 * Licensing Discovered Logic Hook
 * Contains business logic for viewing discovered licensing data from CSV files
 * Enhanced version with user assignments, service plans, and cost analysis
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { useProfileStore } from '../store/useProfileStore';
import {
  LicenseSubscription,
  UserLicenseAssignment,
  ServicePlanDetail,
  LicensingSummary,
  EnhancedLicenseStats,
  LicenseStatus,
} from '../types/models/licensing';
import { getLicensePrice, calculateLicenseCost, getLicenseDisplayName } from '../data/licensePricing';

type TabType = 'overview' | 'licenses' | 'userAssignments' | 'servicePlans' | 'compliance';

interface LicensingDiscoveredState {
  licenses: LicenseSubscription[];
  userAssignments: UserLicenseAssignment[];
  servicePlans: ServicePlanDetail[];
  summary: LicensingSummary | null;
  isLoading: boolean;
  error: string | null;
  activeTab: TabType;
  filter: {
    searchText: string;
    selectedProducts: string[];
    selectedStatuses: string[];
    assignmentSource: 'all' | 'Direct' | 'Group';
    showOnlyWithDisabledPlans: boolean;
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

export const useLicensingDiscoveredLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  const [state, setState] = useState<LicensingDiscoveredState>({
    licenses: [],
    userAssignments: [],
    servicePlans: [],
    summary: null,
    isLoading: true,
    error: null,
    activeTab: 'overview',
    filter: {
      searchText: '',
      selectedProducts: [],
      selectedStatuses: [],
      assignmentSource: 'all',
      showOnlyWithDisabledPlans: false,
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

        // Load all licensing CSV files
        const [licenses, userAssignments, servicePlans, summaryData] = await Promise.all([
          loadCsvFile<LicenseSubscription>(basePath, 'LicensingDiscovery_Licenses.csv'),
          loadCsvFile<UserLicenseAssignment>(basePath, 'LicensingDiscovery_UserAssignments.csv'),
          loadCsvFile<ServicePlanDetail>(basePath, 'LicensingDiscovery_ServicePlans.csv'),
          loadCsvFile<LicensingSummary>(basePath, 'LicensingDiscovery_Summary.csv'),
        ]);

        // Fallback to old naming if new files don't exist
        let finalLicenses = licenses;
        if (licenses.length === 0) {
          finalLicenses = await loadCsvFile<LicenseSubscription>(basePath, 'LicensingSubscriptions.csv');
        }

        const summary = summaryData.length > 0 ? summaryData[0] : null;

        setState(prev => ({
          ...prev,
          licenses: finalLicenses,
          userAssignments,
          servicePlans,
          summary,
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
  const setActiveTab = useCallback((tab: TabType) => {
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

  // Get unique products for filter dropdown
  const uniqueProducts = useMemo(() => {
    const products = new Set<string>();
    state.licenses.forEach(l => products.add(l.skuPartNumber));
    state.userAssignments.forEach(a => products.add(a.skuPartNumber));
    return Array.from(products).sort();
  }, [state.licenses, state.userAssignments]);

  // Filtered licenses
  const filteredLicenses = useMemo(() => {
    let filtered = [...state.licenses];

    if (state.filter.searchText) {
      const search = state.filter.searchText.toLowerCase();
      filtered = filtered.filter(license =>
        license.skuPartNumber?.toLowerCase().includes(search) ||
        getLicenseDisplayName(license.skuPartNumber)?.toLowerCase().includes(search)
      );
    }

    if (state.filter.selectedProducts.length > 0) {
      filtered = filtered.filter(license =>
        state.filter.selectedProducts.includes(license.skuPartNumber)
      );
    }

    if (state.filter.selectedStatuses.length > 0) {
      filtered = filtered.filter(license =>
        state.filter.selectedStatuses.includes(license.status)
      );
    }

    return filtered;
  }, [state.licenses, state.filter]);

  // Filtered user assignments
  const filteredUserAssignments = useMemo(() => {
    let filtered = [...state.userAssignments];

    if (state.filter.searchText) {
      const search = state.filter.searchText.toLowerCase();
      filtered = filtered.filter(assignment =>
        assignment.displayName?.toLowerCase().includes(search) ||
        assignment.userPrincipalName?.toLowerCase().includes(search) ||
        assignment.skuPartNumber?.toLowerCase().includes(search)
      );
    }

    if (state.filter.selectedProducts.length > 0) {
      filtered = filtered.filter(assignment =>
        state.filter.selectedProducts.includes(assignment.skuPartNumber)
      );
    }

    if (state.filter.assignmentSource !== 'all') {
      filtered = filtered.filter(assignment =>
        assignment.assignmentSource === state.filter.assignmentSource
      );
    }

    if (state.filter.showOnlyWithDisabledPlans) {
      filtered = filtered.filter(assignment =>
        assignment.disabledPlanCount > 0
      );
    }

    return filtered;
  }, [state.userAssignments, state.filter]);

  // Filtered service plans
  const filteredServicePlans = useMemo(() => {
    let filtered = [...state.servicePlans];

    if (state.filter.searchText) {
      const search = state.filter.searchText.toLowerCase();
      filtered = filtered.filter(plan =>
        plan.displayName?.toLowerCase().includes(search) ||
        plan.userPrincipalName?.toLowerCase().includes(search) ||
        plan.servicePlanName?.toLowerCase().includes(search) ||
        plan.skuPartNumber?.toLowerCase().includes(search)
      );
    }

    if (state.filter.selectedProducts.length > 0) {
      filtered = filtered.filter(plan =>
        state.filter.selectedProducts.includes(plan.skuPartNumber)
      );
    }

    return filtered;
  }, [state.servicePlans, state.filter]);

  // Active tab data
  const filteredData = useMemo(() => {
    switch (state.activeTab) {
      case 'licenses':
        return filteredLicenses;
      case 'userAssignments':
        return filteredUserAssignments;
      case 'servicePlans':
        return filteredServicePlans;
      default:
        return filteredLicenses;
    }
  }, [state.activeTab, filteredLicenses, filteredUserAssignments, filteredServicePlans]);

  // Columns based on active tab
  const columns = useMemo<ColumnDef[]>(() => {
    switch (state.activeTab) {
      case 'licenses':
        return [
          { key: 'skuPartNumber', header: 'Product', width: 250, getValue: (row: any) => getLicenseDisplayName(row.skuPartNumber) || row.skuPartNumber },
          { key: 'status', header: 'Status', width: 100 },
          { key: 'prepaidUnits', header: 'Total', width: 80, getValue: (row: any) => row.prepaidUnits || row.PrepaidUnits || 0 },
          { key: 'consumedUnits', header: 'Assigned', width: 80, getValue: (row: any) => row.consumedUnits || row.ConsumedUnits || 0 },
          { key: 'availableUnits', header: 'Available', width: 80, getValue: (row: any) => row.availableUnits || row.AvailableUnits || 0 },
          { key: 'utilizationPercent', header: 'Utilization', width: 100, getValue: (row: any) => `${row.utilizationPercent || row.UtilizationPercent || 0}%` },
          { key: 'estimatedCost', header: 'Est. Monthly Cost', width: 120, getValue: (row: any) => {
            const cost = calculateLicenseCost(row.skuPartNumber || row.SkuPartNumber, row.prepaidUnits || row.PrepaidUnits || 0);
            return cost > 0 ? `$${cost.toLocaleString()}` : '-';
          }},
        ];
      case 'userAssignments':
        return [
          { key: 'displayName', header: 'User', width: 200, getValue: (row: any) => row.displayName || row.DisplayName },
          { key: 'userPrincipalName', header: 'Email', width: 250, getValue: (row: any) => row.userPrincipalName || row.UserPrincipalName },
          { key: 'skuPartNumber', header: 'License', width: 200, getValue: (row: any) => getLicenseDisplayName(row.skuPartNumber || row.SkuPartNumber) },
          { key: 'assignmentSource', header: 'Source', width: 100, getValue: (row: any) => row.assignmentSource || row.AssignmentSource || 'Direct' },
          { key: 'disabledPlanCount', header: 'Disabled Plans', width: 120, getValue: (row: any) => row.disabledPlanCount || row.DisabledPlanCount || 0 },
          { key: 'lastUpdated', header: 'Last Updated', width: 150, getValue: (row: any) => row.lastUpdated || row.LastUpdated || '-' },
        ];
      case 'servicePlans':
        return [
          { key: 'displayName', header: 'User', width: 180, getValue: (row: any) => row.displayName || row.DisplayName },
          { key: 'skuPartNumber', header: 'License', width: 180, getValue: (row: any) => getLicenseDisplayName(row.skuPartNumber || row.SkuPartNumber) },
          { key: 'servicePlanName', header: 'Service Plan', width: 250, getValue: (row: any) => row.servicePlanName || row.ServicePlanName },
          { key: 'provisioningStatus', header: 'Status', width: 120, getValue: (row: any) => row.provisioningStatus || row.ProvisioningStatus },
        ];
      default:
        return [
          { key: 'skuPartNumber', header: 'Product', width: 250 },
          { key: 'status', header: 'Status', width: 100 },
        ];
    }
  }, [state.activeTab]);

  // Enhanced Statistics
  const stats = useMemo<EnhancedLicenseStats | null>(() => {
    // Use summary data if available, otherwise calculate
    const summary = state.summary;

    // Calculate from raw data if no summary or for additional metrics
    const totalLicenses = summary?.totalLicenses ||
      state.licenses.reduce((sum, l) => sum + (l.prepaidUnits || 0), 0);
    const totalAssigned = summary?.totalAssigned ||
      state.licenses.reduce((sum, l) => sum + (l.consumedUnits || 0), 0);
    const totalAvailable = totalLicenses - totalAssigned;
    const utilizationRate = totalLicenses > 0 ? (totalAssigned / totalLicenses) * 100 : 0;

    // User metrics
    const uniqueUsers = new Set(state.userAssignments.map(a => a.userId));
    const totalLicensedUsers = summary?.licensedUsers || uniqueUsers.size;

    // Count users with multiple licenses
    const userLicenseCounts = new Map<string, number>();
    state.userAssignments.forEach(a => {
      const count = userLicenseCounts.get(a.userId) || 0;
      userLicenseCounts.set(a.userId, count + 1);
    });
    const usersWithMultipleLicenses = Array.from(userLicenseCounts.values()).filter(c => c > 1).length;

    // Users with disabled plans
    const usersWithDisabledPlans = new Set(
      state.userAssignments.filter(a => a.disabledPlanCount > 0).map(a => a.userId)
    ).size;

    // Assignment source analysis
    const directAssignments = summary?.directAssignments ||
      state.userAssignments.filter(a => a.assignmentSource === 'Direct').length;
    const groupBasedAssignments = summary?.groupBasedAssignments ||
      state.userAssignments.filter(a => a.assignmentSource === 'Group').length;
    const totalAssignments = state.userAssignments.length;
    const directAssignmentPercent = totalAssignments > 0
      ? (directAssignments / totalAssignments) * 100
      : 0;

    // Service plan analysis
    const totalServicePlans = summary?.totalServicePlans || state.servicePlans.length;
    const enabledServicePlans = summary?.enabledServicePlans ||
      state.servicePlans.filter(p => p.provisioningStatus === 'Success').length;
    const disabledServicePlans = summary?.disabledServicePlans ||
      state.servicePlans.filter(p => p.provisioningStatus === 'Disabled').length;

    // Cost analysis
    let estimatedMonthlyCost = 0;
    let wastedLicenseCost = 0;
    const licensesByProduct: Record<string, number> = {};
    const licensesByStatus: Record<LicenseStatus, number> = {
      active: 0,
      expired: 0,
      trial: 0,
      suspended: 0,
    };

    state.licenses.forEach(license => {
      const sku = license.skuPartNumber;
      const prepaid = license.prepaidUnits || 0;
      const consumed = license.consumedUnits || 0;
      const unused = prepaid - consumed;

      // Cost calculation
      const totalCost = calculateLicenseCost(sku, prepaid);
      const unusedCost = calculateLicenseCost(sku, Math.max(0, unused));
      estimatedMonthlyCost += totalCost;
      wastedLicenseCost += unusedCost;

      // Product breakdown
      licensesByProduct[sku] = (licensesByProduct[sku] || 0) + prepaid;

      // Status breakdown
      const status = (license.status || 'Active').toLowerCase() as LicenseStatus;
      if (status === 'active' || status === 'expired' || status === 'trial' || status === 'suspended') {
        licensesByStatus[status]++;
      }
    });

    const costPerUser = totalLicensedUsers > 0 ? estimatedMonthlyCost / totalLicensedUsers : 0;
    const avgLicensesPerUser = totalLicensedUsers > 0 ? totalAssignments / totalLicensedUsers : 0;

    // Top cost products (with utilization)
    const topCostProducts = Object.entries(licensesByProduct)
      .map(([product, count]) => {
        const license = state.licenses.find(l => l.skuPartNumber === product);
        const utilization = license && license.prepaidUnits > 0
          ? (license.consumedUnits / license.prepaidUnits) * 100
          : 0;
        return {
          product,
          cost: calculateLicenseCost(product, count),
          count,
          utilization,
        };
      })
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);

    // Compliance - find products with low utilization (overlicensed)
    const overlicensedProducts = state.licenses
      .filter(l => {
        const utilization = l.prepaidUnits > 0 ? (l.consumedUnits / l.prepaidUnits) * 100 : 100;
        return utilization < 50 && l.prepaidUnits > 0;
      })
      .map(l => l.skuPartNumber);

    // Underlicensed - consumed > prepaid (shouldn't happen normally)
    const underlicensedProducts = state.licenses
      .filter(l => l.consumedUnits > l.prepaidUnits)
      .map(l => l.skuPartNumber);

    // Assignment source breakdown
    const assignmentsBySource: Record<string, number> = {
      Direct: directAssignments,
      Group: groupBasedAssignments,
    };

    return {
      totalLicenses,
      totalAssigned,
      totalAvailable,
      utilizationRate,
      totalCost: estimatedMonthlyCost,
      licensesByProduct,
      licensesByStatus,
      topCostProducts,
      totalLicensedUsers,
      avgLicensesPerUser,
      usersWithMultipleLicenses,
      usersWithDisabledPlans,
      directAssignments,
      groupBasedAssignments,
      directAssignmentPercent,
      assignmentsBySource,
      totalServicePlans,
      enabledServicePlans,
      disabledServicePlans,
      estimatedMonthlyCost,
      costPerMonth: estimatedMonthlyCost,
      costPerUser,
      wastedLicenseCost,
      expiringCount: 0, // Would need expiration date data
      underlicensedCount: underlicensedProducts.length,
      overlicensedCount: overlicensedProducts.length,
      underlicensedProducts,
      overlicensedProducts,
      expiringLicenses: [], // Would need expiration date data
    };
  }, [state.licenses, state.userAssignments, state.servicePlans, state.summary]);

  // User license lookup map (for cross-referencing in user views)
  const userLicenseMap = useMemo(() => {
    const map = new Map<string, UserLicenseAssignment[]>();
    state.userAssignments.forEach(assignment => {
      const existing = map.get(assignment.userId) || [];
      existing.push(assignment);
      map.set(assignment.userId, existing);
    });
    return map;
  }, [state.userAssignments]);

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
        const [licenses, userAssignments, servicePlans, summaryData] = await Promise.all([
          loadCsvFile<LicenseSubscription>(basePath, 'LicensingDiscovery_Licenses.csv'),
          loadCsvFile<UserLicenseAssignment>(basePath, 'LicensingDiscovery_UserAssignments.csv'),
          loadCsvFile<ServicePlanDetail>(basePath, 'LicensingDiscovery_ServicePlans.csv'),
          loadCsvFile<LicensingSummary>(basePath, 'LicensingDiscovery_Summary.csv'),
        ]);

        let finalLicenses = licenses;
        if (licenses.length === 0) {
          finalLicenses = await loadCsvFile<LicenseSubscription>(basePath, 'LicensingSubscriptions.csv');
        }

        const summary = summaryData.length > 0 ? summaryData[0] : null;

        setState(prev => ({
          ...prev,
          licenses: finalLicenses,
          userAssignments,
          servicePlans,
          summary,
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
    userAssignments: state.userAssignments,
    servicePlans: state.servicePlans,
    summary: state.summary,
    isLoading: state.isLoading,
    error: state.error,
    activeTab: state.activeTab,
    filter: state.filter,

    // Computed
    stats,
    columns,
    filteredData,
    filteredLicenses,
    filteredUserAssignments,
    filteredServicePlans,
    uniqueProducts,
    userLicenseMap,

    // Actions
    setActiveTab,
    updateFilter,
    clearError,
    exportToCSV,
    exportToExcel,
    reloadData,
  };
};


