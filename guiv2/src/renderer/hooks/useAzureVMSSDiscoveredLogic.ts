/**
 * Azure VM Scale Sets Discovered Logic Hook
 * Loads discovered VMSS data from CSV files
 * Provides statistics, filtering, tabs, and export functions
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { useProfileStore } from '../store/useProfileStore';
import { ColDef } from 'ag-grid-community';

interface VMScaleSet {
  ObjectType: string;
  Name: string;
  SubscriptionId: string;
  ResourceGroupName: string;
  Location: string;
  Sku: string;
  Tier: string;
  Capacity: string;
  InstanceCount: string;
  UpgradePolicy: string;
  VirtualNetworkName: string;
  SubnetName: string;
  ProvisioningState: string;
  UniqueId: string;
  Tags: string;
  _DataType: string;
  SessionId: string;
}

type TabType = 'overview' | 'scaleSets';

interface AzureVMSSStats {
  totalScaleSets: number;
  totalInstances: number;
  totalCapacity: number;
  avgInstancesPerSet: number;
  byLocation: Array<{ name: string; count: number }>;
  byResourceGroup: Array<{ name: string; count: number }>;
  bySku: Array<{ name: string; count: number }>;
  byTier: Array<{ name: string; count: number }>;
  byUpgradePolicy: Array<{ name: string; count: number }>;
  byProvisioningState: Array<{ name: string; count: number }>;
  discoverySuccessPercentage: number;
  dataSourcesReceivedCount: number;
  dataSourcesTotal: number;
}

async function loadCsvFile<T>(basePath: string, filename: string): Promise<T[]> {
  const fullPath = `${basePath}\\Raw\\${filename}`;
  try {
    const exists = await window.electronAPI.fileExists(fullPath);
    if (!exists) return [];
    const csvText = await window.electronAPI.fs.readFile(fullPath, 'utf8');
    if (!csvText) return [];
    return new Promise((resolve) => {
      Papa.parse<T>(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => resolve((results.data as T[]) || []),
        error: () => resolve([]),
      });
    });
  } catch {
    return [];
  }
}

export const useAzureVMSSDiscoveredLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  const [scaleSets, setScaleSets] = useState<VMScaleSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!selectedSourceProfile?.companyName) {
        setIsLoading(false);
        setError('No profile selected');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const basePath = selectedSourceProfile.dataPath || `C:\\DiscoveryData\\${selectedSourceProfile.companyName}`;
        const data = await loadCsvFile<VMScaleSet>(basePath, 'AzureResourceDiscovery_VMScaleSets.csv');
        setScaleSets(data);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  const clearError = useCallback(() => setError(null), []);

  const filteredData = useMemo(() => {
    if (!searchText) return scaleSets;
    const search = searchText.toLowerCase();
    return scaleSets.filter(s =>
      s.Name?.toLowerCase().includes(search) ||
      s.ResourceGroupName?.toLowerCase().includes(search) ||
      s.Location?.toLowerCase().includes(search) ||
      s.Sku?.toLowerCase().includes(search)
    );
  }, [scaleSets, searchText]);

  const columns = useMemo<ColDef[]>(() => [
    { field: 'Name', headerName: 'Scale Set Name', width: 200 },
    { field: 'ResourceGroupName', headerName: 'Resource Group', width: 180 },
    { field: 'Location', headerName: 'Location', width: 120 },
    { field: 'Sku', headerName: 'VM Size', width: 150 },
    { field: 'Tier', headerName: 'Tier', width: 100 },
    { field: 'Capacity', headerName: 'Capacity', width: 100, type: 'numericColumn' },
    { field: 'InstanceCount', headerName: 'Instances', width: 100, type: 'numericColumn' },
    { field: 'UpgradePolicy', headerName: 'Upgrade Policy', width: 120 },
    { field: 'VirtualNetworkName', headerName: 'VNet', width: 150 },
    { field: 'SubnetName', headerName: 'Subnet', width: 150 },
    { field: 'ProvisioningState', headerName: 'State', width: 100 },
  ], []);

  const stats = useMemo<AzureVMSSStats | null>(() => {
    if (scaleSets.length === 0) return null;

    // Discovery Success
    const expectedSources = [
      { name: 'VMScaleSets', hasData: scaleSets.length > 0, weight: 100 },
    ];
    const totalWeight = expectedSources.reduce((sum, s) => sum + s.weight, 0);
    const achievedWeight = expectedSources.reduce((sum, s) => sum + (s.hasData ? s.weight : 0), 0);
    const discoverySuccessPercentage = Math.round((achievedWeight / totalWeight) * 100);
    const dataSourcesReceivedCount = expectedSources.filter(s => s.hasData).length;
    const dataSourcesTotal = expectedSources.length;

    const totalInstances = scaleSets.reduce((sum, s) => sum + (parseInt(s.InstanceCount) || 0), 0);
    const totalCapacity = scaleSets.reduce((sum, s) => sum + (parseInt(s.Capacity) || 0), 0);

    // By location
    const locationCounts: Record<string, number> = {};
    scaleSets.forEach(s => {
      const loc = s.Location || 'Unknown';
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    const byLocation = Object.entries(locationCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // By resource group
    const rgCounts: Record<string, number> = {};
    scaleSets.forEach(s => {
      const rg = s.ResourceGroupName || 'Unknown';
      rgCounts[rg] = (rgCounts[rg] || 0) + 1;
    });
    const byResourceGroup = Object.entries(rgCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // By SKU
    const skuCounts: Record<string, number> = {};
    scaleSets.forEach(s => {
      const sku = s.Sku || 'Unknown';
      skuCounts[sku] = (skuCounts[sku] || 0) + 1;
    });
    const bySku = Object.entries(skuCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // By tier
    const tierCounts: Record<string, number> = {};
    scaleSets.forEach(s => {
      const tier = s.Tier || 'Unknown';
      tierCounts[tier] = (tierCounts[tier] || 0) + 1;
    });
    const byTier = Object.entries(tierCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // By upgrade policy
    const policyCounts: Record<string, number> = {};
    scaleSets.forEach(s => {
      const policy = s.UpgradePolicy || 'Unknown';
      policyCounts[policy] = (policyCounts[policy] || 0) + 1;
    });
    const byUpgradePolicy = Object.entries(policyCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // By provisioning state
    const stateCounts: Record<string, number> = {};
    scaleSets.forEach(s => {
      const state = s.ProvisioningState || 'Unknown';
      stateCounts[state] = (stateCounts[state] || 0) + 1;
    });
    const byProvisioningState = Object.entries(stateCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalScaleSets: scaleSets.length,
      totalInstances,
      totalCapacity,
      avgInstancesPerSet: scaleSets.length > 0 ? Math.round(totalInstances / scaleSets.length) : 0,
      byLocation,
      byResourceGroup,
      bySku,
      byTier,
      byUpgradePolicy,
      byProvisioningState,
      discoverySuccessPercentage,
      dataSourcesReceivedCount,
      dataSourcesTotal,
    };
  }, [scaleSets]);

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

  const reloadData = useCallback(async () => {
    setIsLoading(true);
    const basePath = selectedSourceProfile?.dataPath || `C:\\DiscoveryData\\${selectedSourceProfile?.companyName}`;

    if (basePath && selectedSourceProfile?.companyName) {
      try {
        const data = await loadCsvFile<VMScaleSet>(basePath, 'AzureResourceDiscovery_VMScaleSets.csv');
        setScaleSets(data);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    }
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  return {
    scaleSets,
    isLoading,
    error,
    activeTab,
    searchText,
    stats,
    columns,
    filteredData,
    setActiveTab,
    setSearchText,
    clearError,
    exportToCSV,
    reloadData,
  };
};
