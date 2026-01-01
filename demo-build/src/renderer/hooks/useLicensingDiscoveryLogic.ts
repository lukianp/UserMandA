import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { ColDef } from 'ag-grid-community';

import type {
  LicenseDiscoveryResult,
  License,
  LicenseAssignment,
  Subscription,
  LicenseDiscoveryConfig,
  LicenseStatus,
  UserLicenseAssignment,
  ServicePlanDetail,
  LicenseSubscription,
  EnhancedLicenseStats
} from '../types/models/licensing';
import type { LogEntry } from './common/discoveryHookTypes';

import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { getElectronAPI } from '../lib/electron-api-fallback';
import { getLicensePrice, calculateLicenseCost, getLicenseDisplayName } from '../data/licensePricing';

type TabType = 'overview' | 'licenses' | 'userAssignments' | 'servicePlans' | 'subscriptions' | 'compliance' | 'distribution';

// Custom result type for the discovery state (different from LicenseDiscoveryResult)
interface LicensingDiscoveryStateResult {
  data: any[];
  summary: any;
  userAssignments: UserLicenseAssignment[];
  servicePlans: ServicePlanDetail[];
  licenses: LicenseSubscription[];
  subscriptions?: Subscription[];
  complianceStatus?: {
    isCompliant?: boolean;
    underlicensedProducts?: string[];
    overlicensedProducts?: string[];
    expiringSoon?: any[];
    unassignedLicenses?: number;
    utilizationRate?: number;
  };
}

interface LicensingDiscoveryState {
  config: Partial<LicenseDiscoveryConfig>;
  result: LicensingDiscoveryStateResult | null;
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
    assignmentSource: 'all' | 'direct' | 'group';
    servicePlanStatus: 'all' | 'enabled' | 'disabled';
  };
  cancellationToken: string | null;
  error: string | null;
  // Enhanced data from new PowerShell module
  userAssignments: UserLicenseAssignment[];
  servicePlans: ServicePlanDetail[];
  enhancedLicenses: LicenseSubscription[];
}

interface LicenseStats {
  // Core metrics
  totalLicenses: number;
  totalAssigned: number;
  totalAvailable: number;
  totalUnits: number;
  consumedUnits: number;
  availableUnits: number;
  utilizationRate: number;

  // Cost metrics (estimated from pricing data)
  totalCost: number;
  costPerMonth: number;
  estimatedMonthlyCost: number;
  costPerUser: number;
  wastedLicenseCost: number;

  // User-centric metrics
  totalLicensedUsers: number;
  avgLicensesPerUser: number;
  usersWithMultipleLicenses: number;
  usersWithDisabledPlans: number;

  // Assignment analysis
  directAssignments: number;
  groupBasedAssignments: number;
  directAssignmentPercent: number;

  // Service plan analysis
  totalServicePlans: number;
  enabledServicePlans: number;
  disabledServicePlans: number;

  // Breakdown records
  licensesByProduct: Record<string, number>;
  licensesByStatus: Record<LicenseStatus, number>;
  assignmentsBySource: Record<string, number>;
  topCostProducts: Array<{ product: string; cost: number; count: number; utilization: number }>;

  // Compliance
  expiringCount: number;
  underlicensedCount: number;
  overlicensedCount: number;
  underlicensedProducts: string[];
  overlicensedProducts: string[];
  expiringLicenses: Array<{ skuPartNumber: string; expirationDate: string; daysRemaining: number }>;
}

export const useLicensingDiscoveryLogic = () => {
  // Get selected profile from store
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult } = useDiscoveryStore();

  // Additional state for PowerShellExecutionDialog
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);

  /**
   * Add a log entry
   */
  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
    };
    setLogs(prev => [...prev, entry]);
  }, []);

  /**
   * Clear all logs
   */
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

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
      showOnlyUnassigned: false,
      assignmentSource: 'all',
      servicePlanStatus: 'all'
    },
    cancellationToken: null,
    error: null,
    userAssignments: [],
    servicePlans: [],
    enhancedLicenses: []
  });

  const currentTokenRef = useRef<string | null>(null);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[LicensingDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const message = data.message || '';
        const logLevel = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warning' : 'info';
        addLog(logLevel, message);
        setState(prev => ({
          ...prev,
          progress: {
            ...prev.progress,
            message: message
          }
        }));
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const discoveryResult = data.result || data;

        // Debug: Log the raw result structure
        console.log('[LicensingDiscoveryHook] Raw discovery result:', discoveryResult);
        console.log('[LicensingDiscoveryHook] Result data array:', discoveryResult?.data);

        // The PowerShell module returns a flat array with _DataType fields
        // We need to filter/categorize records by their _DataType
        const allRecords = Array.isArray(discoveryResult) ? discoveryResult :
                          Array.isArray(discoveryResult?.data) ? discoveryResult.data : [];

        console.log('[LicensingDiscoveryHook] All records count:', allRecords.length);

        // Filter records by _DataType field
        const userAssignments: UserLicenseAssignment[] = allRecords.filter(
          (r: { _DataType?: string }) => r._DataType === 'UserAssignment'
        );
        const servicePlans: ServicePlanDetail[] = allRecords.filter(
          (r: { _DataType?: string }) => r._DataType === 'ServicePlanDetail'
        );
        const enhancedLicenses: LicenseSubscription[] = allRecords.filter(
          (r: { _DataType?: string }) => r._DataType === 'Subscription' || r._DataType === 'License'
        );
        const summaryRecords = allRecords.filter(
          (r: { _DataType?: string }) => r._DataType === 'Summary'
        );

        console.log('[LicensingDiscoveryHook] Categorized - Licenses:', enhancedLicenses.length,
                    'Users:', userAssignments.length, 'Plans:', servicePlans.length);

        // Calculate user count
        const uniqueUsers = new Set(userAssignments.map((a: UserLicenseAssignment) => a.userId));
        const licensedUserCount = uniqueUsers.size;

        // Get summary data if available
        const summary = summaryRecords.length > 0 ? summaryRecords[0] : null;

        // Use summary data if available, otherwise use categorized counts
        const totalLicenses = summary?.totalLicenses ?? enhancedLicenses.length;
        const totalAssignments = summary?.totalAssignments ?? userAssignments.length;

        const result = {
          id: `licensing-discovery-${Date.now()}`,
          name: 'Licensing Discovery',
          moduleName: 'Licensing',
          displayName: 'Licensing Discovery',
          itemCount: totalLicenses,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: discoveryResult?.outputPath || '',
          success: true,
          summary: `Discovered ${totalLicenses} licenses, ${licensedUserCount} licensed users, ${totalAssignments} assignments`,
          errorMessage: '',
          additionalData: {
            ...discoveryResult,
            userAssignments,
            servicePlans,
            enhancedLicenses,
            summary
          },
          createdAt: new Date().toISOString(),
        };

        setState(prev => ({
          ...prev,
          result: {
            data: allRecords,
            summary,
            userAssignments,
            servicePlans,
            licenses: enhancedLicenses
          },
          userAssignments,
          servicePlans,
          enhancedLicenses,
          isDiscovering: false,
          cancellationToken: null,
          progress: { current: 100, total: 100, message: 'Completed', percentage: 100 }
        }));

        addResult(result);
        console.log(`[LicensingDiscoveryHook] Discovery completed! Found ${totalLicenses} licenses, ${licensedUserCount} users, ${servicePlans.length} service plans.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setState(prev => ({
          ...prev,
          isDiscovering: false,
          cancellationToken: null,
          error: data.error
        }));
        console.error(`[LicensingDiscoveryHook] Discovery failed: ${data.error}`);
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setState(prev => ({
          ...prev,
          isDiscovering: false,
          cancellationToken: null,
          progress: { current: 0, total: 100, message: 'Discovery cancelled', percentage: 0 }
        }));
        console.warn('[LicensingDiscoveryHook] Discovery cancelled by user');
      }
    });

    return () => {
      unsubscribeOutput?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeCancelled?.();
    };
  }, []);

  const startDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      const errorMessage = 'No company profile selected. Please select a profile first.';
      setState(prev => ({ ...prev, error: errorMessage }));
      console.error('[LicensingDiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    const token = `licensing-discovery-${Date.now()}`;
    setShowExecutionDialog(true);

    setState(prev => ({
      ...prev,
      isDiscovering: true,
      error: null,
      cancellationToken: token,
      progress: { current: 0, total: 100, message: 'Starting license discovery...', percentage: 0 }
    }));

    currentTokenRef.current = token;

    console.log(`[LicensingDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log(`[LicensingDiscoveryHook] Parameters:`, {
      IncludeMicrosoft365: state.config.includeMicrosoft365,
      IncludeAzure: state.config.includeAzure,
      IncludeOffice: state.config.includeOffice,
      IncludeWindows: state.config.includeWindows,
      IncludeThirdParty: state.config.includeThirdParty
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'Licensing',
        parameters: {
          IncludeMicrosoft365: state.config.includeMicrosoft365,
          IncludeAzure: state.config.includeAzure,
          IncludeOffice: state.config.includeOffice,
          IncludeWindows: state.config.includeWindows,
          IncludeThirdParty: state.config.includeThirdParty
        },
        executionOptions: {
          timeout: state.config.timeout || 600000,
          showWindow: false,
        },
        executionId: token,
      });

      console.log('[LicensingDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[LicensingDiscoveryHook] Discovery failed:', errorMessage);
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        cancellationToken: null,
        error: errorMessage,
        progress: { current: 0, total: 100, message: '', percentage: 0 }
      }));
      currentTokenRef.current = null;
    }
  }, [selectedSourceProfile, state.config, state.isDiscovering]);

  const cancelDiscovery = useCallback(async () => {
    if (!state.isDiscovering || !state.cancellationToken) return;

    console.warn('[LicensingDiscoveryHook] Cancelling discovery...');
    setIsCancelling(true);

    try {
      await window.electron.cancelDiscovery(state.cancellationToken);
      console.log('[LicensingDiscoveryHook] Discovery cancellation requested successfully');

      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isDiscovering: false,
          cancellationToken: null,
          progress: { current: 0, total: 100, message: 'Discovery cancelled', percentage: 0 }
        }));
        currentTokenRef.current = null;
        setIsCancelling(false);
        console.warn('[LicensingDiscoveryHook] Discovery cancelled');
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'Error cancelling discovery';
      console.error('[LicensingDiscoveryHook]', errorMessage);
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        cancellationToken: null,
        progress: { current: 0, total: 100, message: '', percentage: 0 }
      }));
      currentTokenRef.current = null;
      setIsCancelling(false);
    }
  }, [state.isDiscovering, state.cancellationToken]);

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
      field: 'utilization' as any,
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
        return getLicenseDisplayName(license?.skuPartNumber || skuId) || skuId;
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
      field: 'utilization' as any,
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

  // User Assignment columns (for new enhanced data)
  const userAssignmentColumns = useMemo<ColDef<UserLicenseAssignment>[]>(() => [
    {
      field: 'displayName',
      headerName: 'User Name',
      sortable: true,
      filter: true,
      width: 200
    },
    {
      field: 'userPrincipalName',
      headerName: 'Email / UPN',
      sortable: true,
      filter: true,
      width: 260
    },
    {
      field: 'skuPartNumber',
      headerName: 'License',
      sortable: true,
      filter: true,
      width: 220,
      valueFormatter: (params) => getLicenseDisplayName(params.value || '')
    },
    {
      field: 'assignmentSource',
      headerName: 'Assignment',
      sortable: true,
      filter: true,
      width: 130,
      cellClass: (params) => {
        const source = params.value?.toLowerCase();
        if (source === 'group') return 'text-blue-600';
        if (source === 'direct') return 'text-green-600';
        return '';
      }
    },
    {
      field: 'assignedByGroup',
      headerName: 'Assigned By Group',
      sortable: true,
      filter: true,
      width: 200,
      valueFormatter: (params) => params.value || 'N/A'
    },
    {
      field: 'disabledPlanCount',
      headerName: 'Disabled Plans',
      sortable: true,
      filter: true,
      width: 130,
      cellClass: (params) => params.value > 0 ? 'text-amber-600' : ''
    },
    {
      field: 'lastUpdated',
      headerName: 'Last Updated',
      sortable: true,
      filter: true,
      width: 160,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
    }
  ], []);

  // Service Plan columns (for new enhanced data)
  const servicePlanColumns = useMemo<ColDef<ServicePlanDetail>[]>(() => [
    {
      field: 'displayName',
      headerName: 'User',
      sortable: true,
      filter: true,
      width: 180
    },
    {
      field: 'userPrincipalName',
      headerName: 'Email',
      sortable: true,
      filter: true,
      width: 240
    },
    {
      field: 'skuPartNumber',
      headerName: 'License',
      sortable: true,
      filter: true,
      width: 180,
      valueFormatter: (params) => getLicenseDisplayName(params.value || '')
    },
    {
      field: 'servicePlanName',
      headerName: 'Service Plan',
      sortable: true,
      filter: true,
      width: 250
    },
    {
      field: 'provisioningStatus',
      headerName: 'Status',
      sortable: true,
      filter: true,
      width: 130,
      cellClass: (params) => {
        const status = params.value?.toLowerCase();
        if (status === 'success') return 'text-green-600';
        if (status === 'disabled') return 'text-gray-500';
        if (status === 'error') return 'text-red-600';
        return 'text-amber-600';
      }
    },
    {
      field: 'appliesTo',
      headerName: 'Applies To',
      sortable: true,
      filter: true,
      width: 120
    }
  ], []);

  // Dynamic columns based on active tab
  const columns = useMemo<ColDef[]>(() => {
    switch (state.activeTab) {
      case 'licenses':
        return licenseColumns;
      case 'userAssignments':
        return userAssignmentColumns;
      case 'servicePlans':
        return servicePlanColumns;
      case 'subscriptions':
        return subscriptionColumns;
      default:
        return [];
    }
  }, [state.activeTab, licenseColumns, userAssignmentColumns, servicePlanColumns, subscriptionColumns]);

  // Filtered licenses
  const filteredLicenses = useMemo(() => {
    if (!state.result?.licenses) return [];

    let filtered = state.result.licenses;

    if (state.filter.searchText) {
      const search = state.filter.searchText.toLowerCase();
      filtered = filtered.filter(l =>
        getLicenseDisplayName(l.skuPartNumber)?.toLowerCase().includes(search) ||
        l.skuPartNumber?.toLowerCase().includes(search) ||
        l.skuId?.toLowerCase().includes(search)
      );
    }

    if (state.filter.selectedLicenseTypes.length > 0) {
      filtered = filtered.filter(l =>
        state.filter.selectedLicenseTypes.includes(l.skuPartNumber)
      );
    }

    if (state.filter.selectedStatuses.length > 0) {
      filtered = filtered.filter(l => {
        // Normalize status to lowercase for comparison (LicenseSubscription uses PascalCase, LicenseStatus uses lowercase)
        const normalizedStatus = l.status?.toLowerCase() as LicenseStatus;
        return state.filter.selectedStatuses.includes(normalizedStatus);
      });
    }

    if (state.filter.showOnlyExpiring) {
      // LicenseSubscription from CSV doesn't include expirationDate
      // Filter to licenses with warning status as a proxy for expiring
      filtered = filtered.filter(l =>
        l.status?.toLowerCase() === 'warning'
      );
    }

    if (state.filter.showOnlyUnassigned) {
      filtered = filtered.filter(l => l.availableUnits > 0);
    }

    return filtered;
  }, [state.result?.licenses, state.filter]);

  // Filtered user assignments (for new enhanced data)
  const filteredUserAssignments = useMemo(() => {
    let filtered = state.userAssignments || [];

    if (state.filter.searchText) {
      const search = state.filter.searchText.toLowerCase();
      filtered = filtered.filter(a =>
        a.displayName?.toLowerCase().includes(search) ||
        a.userPrincipalName?.toLowerCase().includes(search) ||
        a.skuPartNumber?.toLowerCase().includes(search) ||
        getLicenseDisplayName(a.skuPartNumber)?.toLowerCase().includes(search)
      );
    }

    if (state.filter.assignmentSource !== 'all') {
      filtered = filtered.filter(a =>
        a.assignmentSource?.toLowerCase() === state.filter.assignmentSource.toLowerCase()
      );
    }

    return filtered;
  }, [state.userAssignments, state.filter.searchText, state.filter.assignmentSource]);

  // Filtered service plans (for new enhanced data)
  const filteredServicePlans = useMemo(() => {
    let filtered = state.servicePlans || [];

    if (state.filter.searchText) {
      const search = state.filter.searchText.toLowerCase();
      filtered = filtered.filter(p =>
        p.displayName?.toLowerCase().includes(search) ||
        p.userPrincipalName?.toLowerCase().includes(search) ||
        p.servicePlanName?.toLowerCase().includes(search) ||
        p.skuPartNumber?.toLowerCase().includes(search)
      );
    }

    if (state.filter.servicePlanStatus !== 'all') {
      if (state.filter.servicePlanStatus === 'enabled') {
        filtered = filtered.filter(p => p.provisioningStatus?.toLowerCase() === 'success');
      } else if (state.filter.servicePlanStatus === 'disabled') {
        filtered = filtered.filter(p => p.provisioningStatus?.toLowerCase() === 'disabled');
      }
    }

    return filtered;
  }, [state.servicePlans, state.filter.searchText, state.filter.servicePlanStatus]);

  // Filtered data based on active tab and filters (for backward compatibility)
  const filteredData = useMemo(() => {
    switch (state.activeTab) {
      case 'licenses':
        return filteredLicenses;
      case 'userAssignments':
        return filteredUserAssignments;
      case 'servicePlans':
        return filteredServicePlans;
      case 'subscriptions':
        return state.result?.subscriptions?.filter((sub: Subscription) => {
          if (!state.filter.searchText) return true;
          const search = state.filter.searchText.toLowerCase();
          return sub.subscriptionName?.toLowerCase().includes(search) ||
                 sub.subscriptionId?.toLowerCase().includes(search);
        }) || [];
      default:
        return [];
    }
  }, [state.result, state.activeTab, state.filter.searchText, filteredLicenses, filteredUserAssignments, filteredServicePlans]);

  // User license map for cross-referencing (maps userId to their licenses)
  const userLicenseMap = useMemo(() => {
    const map = new Map<string, UserLicenseAssignment[]>();
    state.userAssignments.forEach(assignment => {
      const existing = map.get(assignment.userId) || [];
      existing.push(assignment);
      map.set(assignment.userId, existing);
    });
    return map;
  }, [state.userAssignments]);

  // Enhanced Statistics
  const stats = useMemo<LicenseStats | null>(() => {
    if (!state.result && state.enhancedLicenses.length === 0) return null;

    const licenses = state.result?.licenses || [];
    const userAssignments = state.userAssignments || [];
    const servicePlans = state.servicePlans || [];
    const enhancedLicenses = state.enhancedLicenses || [];

    // Use enhanced licenses if available, otherwise fall back to result.licenses
    const licenseData = enhancedLicenses.length > 0 ? enhancedLicenses : licenses;

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

    // Cost calculation using pricing data
    let estimatedMonthlyCost = 0;
    let wastedLicenseCost = 0;
    const costByProduct: Record<string, { cost: number; count: number; consumed: number; enabled: number }> = {};

    // Process licenses
    licenseData.forEach((license: any) => {
      const skuPartNumber = license.skuPartNumber || '';
      const product = getLicenseDisplayName(skuPartNumber) || skuPartNumber || 'Unknown';
      const prepaidUnits = license.prepaidUnits || license.prepaidUnits?.enabled || 0;
      const consumedUnits = license.consumedUnits || 0;
      const availableUnits = license.availableUnits || (prepaidUnits - consumedUnits);

      // Product breakdown
      licensesByProduct[product] = (licensesByProduct[product] || 0) + prepaidUnits;

      // Status breakdown
      const status = license.status?.toLowerCase() as LicenseStatus || 'active';
      if (status in licensesByStatus) {
        licensesByStatus[status] = (licensesByStatus[status] || 0) + 1;
      }

      // Cost calculation using pricing data
      const pricePerMonth = calculateLicenseCost(skuPartNumber, 1);
      const totalLicenseCost = pricePerMonth * prepaidUnits;
      const unusedLicenseCost = pricePerMonth * availableUnits;

      estimatedMonthlyCost += totalLicenseCost;
      wastedLicenseCost += unusedLicenseCost;

      if (!costByProduct[product]) {
        costByProduct[product] = { cost: 0, count: 0, consumed: 0, enabled: 0 };
      }
      costByProduct[product].cost += totalLicenseCost;
      costByProduct[product].count += 1;
      costByProduct[product].consumed += consumedUnits;
      costByProduct[product].enabled += prepaidUnits;
    });

    // Process user assignments
    const uniqueUsers = new Set<string>();
    const userLicenseCounts = new Map<string, number>();
    let directAssignments = 0;
    let groupBasedAssignments = 0;

    userAssignments.forEach(assignment => {
      uniqueUsers.add(assignment.userId);

      const count = userLicenseCounts.get(assignment.userId) || 0;
      userLicenseCounts.set(assignment.userId, count + 1);

      const source = assignment.assignmentSource?.toLowerCase() || 'direct';
      if (source === 'group') {
        groupBasedAssignments++;
        assignmentsBySource['group'] = (assignmentsBySource['group'] || 0) + 1;
      } else if (source === 'inherited') {
        assignmentsBySource['inherited'] = (assignmentsBySource['inherited'] || 0) + 1;
      } else {
        directAssignments++;
        assignmentsBySource['direct'] = (assignmentsBySource['direct'] || 0) + 1;
      }
    });

    const totalLicensedUsers = uniqueUsers.size;
    const usersWithMultipleLicenses = Array.from(userLicenseCounts.values()).filter(c => c > 1).length;
    const usersWithDisabledPlans = new Set(
      userAssignments.filter(a => a.disabledPlanCount > 0).map(a => a.userId)
    ).size;

    // Service plan analysis
    let enabledServicePlans = 0;
    let disabledServicePlans = 0;
    servicePlans.forEach(plan => {
      if (plan.provisioningStatus?.toLowerCase() === 'success') {
        enabledServicePlans++;
      } else if (plan.provisioningStatus?.toLowerCase() === 'disabled') {
        disabledServicePlans++;
      }
    });

    // Top cost products
    const topCostProducts = Object.entries(costByProduct)
      .sort((a, b) => b[1].cost - a[1].cost)
      .slice(0, 5)
      .map(([product, data]) => ({
        product,
        cost: data.cost,
        count: data.count,
        utilization: data.enabled > 0 ? (data.consumed / data.enabled) * 100 : 0
      }));

    // Calculate totals - use summary if available, otherwise calculate from license data
    const summary = state.result?.summary;
    const totalLicenses = summary?.totalLicenses || licenseData.reduce((sum: number, l: any) => sum + (l.prepaidUnits || 0), 0);
    const totalAssigned = summary?.totalAssigned || licenseData.reduce((sum: number, l: any) => sum + (l.consumedUnits || 0), 0);
    const totalAvailable = summary?.totalAvailable || (totalLicenses - totalAssigned);
    const utilizationRate = totalLicenses > 0 ? (totalAssigned / totalLicenses) * 100 : 0;
    const avgLicensesPerUser = totalLicensedUsers > 0 ? userAssignments.length / totalLicensedUsers : 0;
    const totalAssignments = directAssignments + groupBasedAssignments;
    const directAssignmentPercent = totalAssignments > 0 ? (directAssignments / totalAssignments) * 100 : 0;
    const costPerUser = totalLicensedUsers > 0 ? estimatedMonthlyCost / totalLicensedUsers : 0;

    // Expiring licenses - use licenseData cast to any since LicenseSubscription doesn't have expirationDate
    // but raw API data might include it
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringLicenses = (licenseData as any[])
      .filter((l: any) => l.expirationDate && new Date(l.expirationDate) <= thirtyDaysFromNow)
      .map((l: any) => ({
        skuPartNumber: l.skuPartNumber || '',
        expirationDate: l.expirationDate?.toString() || '',
        daysRemaining: Math.ceil((new Date(l.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      }));

    return {
      // Core metrics
      totalLicenses,
      totalAssigned,
      totalAvailable,
      totalUnits: totalLicenses,
      consumedUnits: totalAssigned,
      availableUnits: totalAvailable,
      utilizationRate,

      // Cost metrics
      totalCost: estimatedMonthlyCost,
      costPerMonth: estimatedMonthlyCost,
      estimatedMonthlyCost,
      costPerUser,
      wastedLicenseCost,

      // User-centric metrics
      totalLicensedUsers,
      avgLicensesPerUser,
      usersWithMultipleLicenses,
      usersWithDisabledPlans,

      // Assignment analysis
      directAssignments,
      groupBasedAssignments,
      directAssignmentPercent,

      // Service plan analysis
      totalServicePlans: servicePlans.length,
      enabledServicePlans,
      disabledServicePlans,

      // Breakdown records
      licensesByProduct,
      licensesByStatus,
      assignmentsBySource,
      topCostProducts,

      // Compliance
      expiringCount: expiringLicenses.length,
      underlicensedCount: state.result?.complianceStatus?.underlicensedProducts?.length || 0,
      overlicensedCount: state.result?.complianceStatus?.overlicensedProducts?.length || 0,
      underlicensedProducts: state.result?.complianceStatus?.underlicensedProducts || [],
      overlicensedProducts: state.result?.complianceStatus?.overlicensedProducts || [],
      expiringLicenses
    };
  }, [state.result, state.userAssignments, state.servicePlans, state.enhancedLicenses]);

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

    // PowerShellExecutionDialog integration
    showExecutionDialog,
    setShowExecutionDialog,
    logs,
    clearLogs,
    isCancelling,

    // Data
    columns,
    filteredData,
    filteredLicenses,
    stats,

    // Enhanced data (from new PowerShell module)
    userAssignments: state.userAssignments,
    servicePlans: state.servicePlans,
    enhancedLicenses: state.enhancedLicenses,
    filteredUserAssignments,
    filteredServicePlans,
    userLicenseMap,

    // Column definitions
    licenseColumns,
    assignmentColumns,
    subscriptionColumns,
    userAssignmentColumns,
    servicePlanColumns,

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
