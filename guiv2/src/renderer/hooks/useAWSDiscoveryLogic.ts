/**
 * AWS Cloud Infrastructure Discovery View Logic Hook
 * Manages state and business logic for AWS resource discovery operations
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ColDef } from 'ag-grid-community';

import { AWSDiscoveryConfig, AWSDiscoveryResult, AWSFilterState, AWSResourceType, EC2Instance, S3Bucket, RDSInstance } from '../types/models/aws';
import { useDebounce } from './useDebounce';

type TabType = 'overview' | 'ec2' | 's3' | 'rds';

interface AWSDiscoveryProgress {
  phase: string;
  progress: number;
  currentRegion?: string;
  currentResourceType?: string;
  itemsProcessed?: number;
  totalItems?: number;
  message?: string;
}

/**
 * AWS Discovery View State
 */
interface AWSDiscoveryState {
  // Configuration
  config: Partial<AWSDiscoveryConfig>;

  // Results
  result: AWSDiscoveryResult | null;

  // Filtering
  filter: AWSFilterState;

  // UI State
  isDiscovering: boolean;
  progress: AWSDiscoveryProgress | null;
  activeTab: TabType;
  error: string | null;

  // Cancellation
  cancellationToken: string | null;
}

/**
 * AWS Cloud Infrastructure Discovery Logic Hook
 */
export const useAWSDiscoveryLogic = () => {
  // State
  const [state, setState] = useState<AWSDiscoveryState>({
    config: {
      awsRegions: ['us-east-1'],
      resourceTypes: ['ec2', 's3', 'rds'],
      includeTagDetails: true,
      includeCostEstimates: true,
      includeSecurityAnalysis: true,
      timeout: 300000,
    },
    result: null,
    filter: {
      searchText: '',
      selectedRegions: [],
      selectedResourceTypes: [],
      selectedStates: [],
      showOnlySecurityRisks: false,
    },
    isDiscovering: false,
    progress: null,
    activeTab: 'overview',
    error: null,
    cancellationToken: null,
  });

  const debouncedSearch = useDebounce(state.filter.searchText, 300);

  // Subscribe to discovery progress events
  useEffect(() => {
    const unsubscribe = window.electronAPI?.onProgress?.((data: any) => {
      if (data.type === 'aws-discovery' && data.token === state.cancellationToken) {
        setState(prev => ({
          ...prev,
          progress: {
            phase: data.phase || 'discovering',
            progress: data.progress || 0,
            currentRegion: data.currentRegion,
            currentResourceType: data.currentResourceType,
            itemsProcessed: data.itemsProcessed,
            totalItems: data.totalItems,
            message: data.message,
          }
        }));
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [state.cancellationToken]);

  /**
   * Start AWS Discovery
   */
  const startDiscovery = useCallback(async () => {
    const token = `aws-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState(prev => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: { phase: 'initializing', progress: 0 },
      cancellationToken: token,
    }));

    try {
      const discoveryResult = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/AWSCloudDiscovery.psm1',
        functionName: 'Invoke-AWSDiscovery',
        parameters: {
          Regions: state.config.awsRegions,
          AccessKeyId: state.config.accessKeyId,
          SecretAccessKey: state.config.secretAccessKey,
          ResourceTypes: state.config.resourceTypes,
          IncludeTags: state.config.includeTagDetails,
          IncludeCosts: state.config.includeCostEstimates,
          IncludeSecurity: state.config.includeSecurityAnalysis,
          CancellationToken: token,
          StreamProgress: true,
        },
      });

      if (discoveryResult.success && discoveryResult.data) {
        setState(prev => ({
          ...prev,
          result: discoveryResult.data,
          isDiscovering: false,
          progress: null,
          cancellationToken: null,
        }));
      } else {
        throw new Error(discoveryResult.error || 'Discovery failed');
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        error: error.message || 'Unknown error occurred during AWS discovery',
        progress: null,
        cancellationToken: null,
      }));
    }
  }, [state.config]);

  /**
   * Cancel ongoing discovery
   */
  const cancelDiscovery = useCallback(async () => {
    if (!state.cancellationToken) return;

    try {
      await window.electronAPI.cancelExecution(state.cancellationToken);
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        progress: null,
        cancellationToken: null,
      }));
    } catch (error) {
      console.error('Failed to cancel discovery:', error);
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        progress: null,
        cancellationToken: null,
      }));
    }
  }, [state.cancellationToken]);

  /**
   * Update discovery configuration
   */
  const setConfig = useCallback((updates: Partial<AWSDiscoveryConfig> | ((prev: Partial<AWSDiscoveryConfig>) => Partial<AWSDiscoveryConfig>)) => {
    setState(prev => ({
      ...prev,
      config: typeof updates === 'function' ? updates(prev.config) : { ...prev.config, ...updates },
    }));
  }, []);

  /**
   * Update filter state
   */
  const setFilter = useCallback((updates: Partial<AWSFilterState> | ((prev: AWSFilterState) => AWSFilterState)) => {
    setState(prev => ({
      ...prev,
      filter: typeof updates === 'function' ? updates(prev.filter) : { ...prev.filter, ...updates },
    }));
  }, []);

  /**
   * Set active tab
   */
  const setActiveTab = useCallback((tab: TabType) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  /**
   * Export to CSV
   */
  const exportToCSV = useCallback(async () => {
    if (!state.result) return;

    try {
      const dataToExport = getDataForActiveTab();
      const csvContent = convertToCSV(dataToExport);

      await window.electronAPI.executeModule({
        modulePath: 'Modules/Common/ExportUtilities.psm1',
        functionName: 'Export-ToCSV',
        parameters: {
          Data: csvContent,
          FileName: `aws-${state.activeTab}-discovery-${Date.now()}.csv`,
        },
      });
    } catch (error) {
      console.error('Failed to export to CSV:', error);
    }
  }, [state.result, state.activeTab]);

  /**
   * Export to Excel
   */
  const exportToExcel = useCallback(async () => {
    if (!state.result) return;

    try {
      await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/AWSCloudDiscovery.psm1',
        functionName: 'Export-AWSDiscoveryResults',
        parameters: {
          Result: state.result,
          Format: 'Excel',
          FileName: `aws-discovery-${Date.now()}.xlsx`,
        },
      });
    } catch (error) {
      console.error('Failed to export to Excel:', error);
    }
  }, [state.result]);

  /**
   * Get data for the currently active tab
   */
  const getDataForActiveTab = useCallback(() => {
    if (!state.result) return [];

    switch (state.activeTab) {
      case 'ec2':
        return state.result.ec2Instances || [];
      case 's3':
        return state.result.s3Buckets || [];
      case 'rds':
        return state.result.rdsInstances || [];
      case 'overview':
      default:
        return [];
    }
  }, [state.result, state.activeTab]);

  /**
   * Column definitions for EC2 instances
   */
  const ec2Columns: ColDef[] = useMemo(() => [
    { field: 'instanceId', headerName: 'Instance ID', sortable: true, filter: true, flex: 1 },
    { field: 'instanceType', headerName: 'Type', sortable: true, filter: true, flex: 1 },
    { field: 'state', headerName: 'State', sortable: true, filter: true, flex: 1,
      cellStyle: (params: any) => {
        if (params.value === 'running') return { color: 'green' };
        if (params.value === 'stopped') return { color: 'red' };
        return {};
      }
    },
    { field: 'region', headerName: 'Region', sortable: true, filter: true, flex: 1 },
    { field: 'availabilityZone', headerName: 'AZ', sortable: true, filter: true, flex: 1 },
    { field: 'privateIpAddress', headerName: 'Private IP', sortable: true, flex: 1 },
    { field: 'publicIpAddress', headerName: 'Public IP', sortable: true, flex: 1 },
    { field: 'vpcId', headerName: 'VPC', sortable: true, filter: true, flex: 1 },
    { field: 'subnetId', headerName: 'Subnet', sortable: true, filter: true, flex: 1 },
    { field: 'estimatedMonthlyCost', headerName: 'Est. Monthly Cost', sortable: true,
      valueFormatter: (p) => p.value ? `$${p.value.toFixed(2)}` : '-', flex: 1 },
    { field: 'launchTime', headerName: 'Launch Time', sortable: true,
      valueFormatter: (p) => p.value ? new Date(p.value).toLocaleString() : '-', flex: 1 },
  ], []);

  /**
   * Column definitions for S3 buckets
   */
  const s3Columns: ColDef[] = useMemo(() => [
    { field: 'name', headerName: 'Bucket Name', sortable: true, filter: true, flex: 2 },
    { field: 'region', headerName: 'Region', sortable: true, filter: true, flex: 1 },
    { field: 'creationDate', headerName: 'Created', sortable: true,
      valueFormatter: (p) => p.value ? new Date(p.value).toLocaleDateString() : '-', flex: 1 },
    { field: 'encryption.enabled', headerName: 'Encrypted', sortable: true, flex: 1,
      cellRenderer: (params: any) => params.data.encryption?.enabled ? 'Yes' : 'No' },
    { field: 'versioning', headerName: 'Versioning', sortable: true, flex: 1,
      cellRenderer: (params: any) => params.value ? 'Enabled' : 'Disabled' },
    { field: 'publicAccess', headerName: 'Public Access', sortable: true, flex: 1,
      cellStyle: (params: any) => params.value ? { color: 'red', fontWeight: 'bold' } : {} },
    { field: 'totalSize', headerName: 'Size', sortable: true,
      valueFormatter: (p) => p.value ? formatBytes(p.value) : '-', flex: 1 },
    { field: 'objectCount', headerName: 'Objects', sortable: true,
      valueFormatter: (p) => p.value ? p.value.toLocaleString() : '-', flex: 1 },
    { field: 'estimatedMonthlyCost', headerName: 'Est. Monthly Cost', sortable: true,
      valueFormatter: (p) => p.value ? `$${p.value.toFixed(2)}` : '-', flex: 1 },
  ], []);

  /**
   * Column definitions for RDS instances
   */
  const rdsColumns: ColDef[] = useMemo(() => [
    { field: 'instanceIdentifier', headerName: 'Instance ID', sortable: true, filter: true, flex: 2 },
    { field: 'engine', headerName: 'Engine', sortable: true, filter: true, flex: 1 },
    { field: 'engineVersion', headerName: 'Version', sortable: true, flex: 1 },
    { field: 'status', headerName: 'Status', sortable: true, filter: true, flex: 1,
      cellStyle: (params: any) => {
        if (params.value === 'available') return { color: 'green' };
        if (params.value === 'stopped') return { color: 'red' };
        return {};
      }
    },
    { field: 'instanceClass', headerName: 'Class', sortable: true, filter: true, flex: 1 },
    { field: 'region', headerName: 'Region', sortable: true, filter: true, flex: 1 },
    { field: 'availabilityZone', headerName: 'AZ', sortable: true, flex: 1 },
    { field: 'multiAZ', headerName: 'Multi-AZ', sortable: true, flex: 1,
      cellRenderer: (params: any) => params.value ? 'Yes' : 'No' },
    { field: 'storageEncrypted', headerName: 'Encrypted', sortable: true, flex: 1,
      cellRenderer: (params: any) => params.value ? 'Yes' : 'No' },
    { field: 'allocatedStorage', headerName: 'Storage (GB)', sortable: true, flex: 1 },
    { field: 'estimatedMonthlyCost', headerName: 'Est. Monthly Cost', sortable: true,
      valueFormatter: (p) => p.value ? `$${p.value.toFixed(2)}` : '-', flex: 1 },
  ], []);

  /**
   * Filtered data for EC2 instances
   */
  const filteredEC2 = useMemo(() => {
    if (!state.result?.ec2Instances) return [];
    return filterData(state.result.ec2Instances, state.filter, debouncedSearch);
  }, [state.result, state.filter, debouncedSearch]);

  /**
   * Filtered data for S3 buckets
   */
  const filteredS3 = useMemo(() => {
    if (!state.result?.s3Buckets) return [];
    return filterData(state.result.s3Buckets, state.filter, debouncedSearch);
  }, [state.result, state.filter, debouncedSearch]);

  /**
   * Filtered data for RDS instances
   */
  const filteredRDS = useMemo(() => {
    if (!state.result?.rdsInstances) return [];
    return filterData(state.result.rdsInstances, state.filter, debouncedSearch);
  }, [state.result, state.filter, debouncedSearch]);

  /**
   * Dynamic columns based on active tab
   */
  const columns = useMemo(() => {
    switch (state.activeTab) {
      case 'ec2':
        return ec2Columns;
      case 's3':
        return s3Columns;
      case 'rds':
        return rdsColumns;
      case 'overview':
      default:
        return [];
    }
  }, [state.activeTab, ec2Columns, s3Columns, rdsColumns]);

  /**
   * Dynamic filtered data based on active tab
   */
  const filteredData = useMemo(() => {
    switch (state.activeTab) {
      case 'ec2':
        return filteredEC2;
      case 's3':
        return filteredS3;
      case 'rds':
        return filteredRDS;
      case 'overview':
      default:
        return [];
    }
  }, [state.activeTab, filteredEC2, filteredS3, filteredRDS]);

  /**
   * Calculate statistics
   */
  const stats = useMemo(() => {
    if (!state.result) return null;

    const totalResources = (state.result.ec2Instances?.length || 0) +
                          (state.result.s3Buckets?.length || 0) +
                          (state.result.rdsInstances?.length || 0);

    const estimatedCost = (state.result.estimatedMonthlyCost || 0);

    const securityRisks = (state.result.securityFindings?.length || 0);

    return {
      totalResources,
      ec2Count: state.result.ec2Instances?.length || 0,
      s3Count: state.result.s3Buckets?.length || 0,
      rdsCount: state.result.rdsInstances?.length || 0,
      estimatedCost,
      securityRisks,
      totalFound: totalResources,
    };
  }, [state.result]);

  return {
    // Configuration
    config: state.config,
    setConfig,

    // Discovery state
    result: state.result,
    isDiscovering: state.isDiscovering,
    progress: state.progress?.progress || 0,
    error: state.error,

    // Filtering
    filter: state.filter,
    setFilter,

    // Actions
    startDiscovery,
    cancelDiscovery,
    exportToCSV,
    exportToExcel,

    // Tab management
    activeTab: state.activeTab,
    setActiveTab,

    // Data for active tab (dynamic based on activeTab)
    columns,
    filteredData,

    // Statistics
    stats,
  };
};

/**
 * Filter data based on filter state and search text
 */
function filterData(data: any[], filter: AWSFilterState, searchText: string): any[] {
  return data.filter(item => {
    // Search text filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const matchesSearch = Object.values(item).some(value =>
        value && value.toString().toLowerCase().includes(searchLower)
      );
      if (!matchesSearch) return false;
    }

    // Region filter
    if (filter.selectedRegions.length > 0 && !filter.selectedRegions.includes(item.region)) {
      return false;
    }

    // State filter (for EC2 instances)
    if (filter.selectedStates.length > 0 && item.state && !filter.selectedStates.includes(item.state)) {
      return false;
    }

    // Security risks filter
    if (filter.showOnlySecurityRisks && !item.securityFindings?.length) {
      return false;
    }

    return true;
  });
}

/**
 * Convert data to CSV format
 */
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return JSON.stringify(value ?? '');
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
