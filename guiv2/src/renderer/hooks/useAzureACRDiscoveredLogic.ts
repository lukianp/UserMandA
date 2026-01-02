/**
 * Azure Container Registry Discovered Logic Hook
 * Loads discovered ACR data from CSV files
 * Provides statistics, filtering, tabs, and export functions
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { useProfileStore } from '../store/useProfileStore';

type TabType = 'overview' | 'registries';

interface ContainerRegistry {
  ObjectType: string;
  Name: string;
  SubscriptionId: string;
  ResourceGroupName: string;
  RegistryName: string;
  LoginServer: string;
  Location: string;
  Sku: string;
  AdminUserEnabled: boolean | string;
  PublicNetworkAccess: string;
  ZoneRedundancy: string;
  ProvisioningState: string;
  CreationDate: string;
  NetworkRuleSet: string;
  Tags: string;
}

interface AzureACRStats {
  totalRegistries: number;
  premiumCount: number;
  standardCount: number;
  basicCount: number;
  adminEnabledCount: number;
  publicAccessCount: number;
  zoneRedundantCount: number;
  registriesByLocation: Record<string, number>;
  topLocations: { name: string; count: number }[];
  registriesBySku: { sku: string; count: number }[];
  discoverySuccessPercentage: number;
  dataSourcesReceivedCount: number;
  dataSourcesTotal: number;
}

// Using AG Grid ColDef - field and headerName are required for proper rendering
import { ColDef } from 'ag-grid-community';

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

export const useAzureACRDiscoveredLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  const [registries, setRegistries] = useState<ContainerRegistry[]>([]);
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

        // Try both possible CSV filenames
        let acrs = await loadCsvFile<ContainerRegistry>(basePath, 'AzureResourceDiscovery_ContainerRegistries.csv');
        if (acrs.length === 0) {
          acrs = await loadCsvFile<ContainerRegistry>(basePath, 'AzureACRDiscovery.csv');
        }

        setRegistries(acrs);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  const stats = useMemo<AzureACRStats | null>(() => {
    if (registries.length === 0) return null;

    // Discovery Success
    const expectedSources = [
      { name: 'ContainerRegistries', hasData: registries.length > 0, weight: 100 },
    ];
    const totalWeight = expectedSources.reduce((sum, s) => sum + s.weight, 0);
    const achievedWeight = expectedSources.reduce((sum, s) => sum + (s.hasData ? s.weight : 0), 0);
    const discoverySuccessPercentage = Math.round((achievedWeight / totalWeight) * 100);
    const dataSourcesReceivedCount = expectedSources.filter(s => s.hasData).length;
    const dataSourcesTotal = expectedSources.length;

    const locationCounts: Record<string, number> = {};
    const skuCounts: Record<string, number> = { Premium: 0, Standard: 0, Basic: 0 };
    let adminEnabled = 0;
    let publicAccess = 0;
    let zoneRedundant = 0;

    registries.forEach((r) => {
      const loc = r.Location || 'Unknown';
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;

      const sku = r.Sku || 'Unknown';
      if (sku in skuCounts) {
        skuCounts[sku]++;
      }

      if (r.AdminUserEnabled === true || r.AdminUserEnabled === 'True' || r.AdminUserEnabled === 'true') {
        adminEnabled++;
      }
      if (r.PublicNetworkAccess === 'Enabled') {
        publicAccess++;
      }
      if (r.ZoneRedundancy === 'Enabled') {
        zoneRedundant++;
      }
    });

    const topLocations = Object.entries(locationCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const registriesBySku = Object.entries(skuCounts)
      .map(([sku, count]) => ({ sku, count }))
      .filter(s => s.count > 0);

    return {
      totalRegistries: registries.length,
      premiumCount: skuCounts.Premium,
      standardCount: skuCounts.Standard,
      basicCount: skuCounts.Basic,
      adminEnabledCount: adminEnabled,
      publicAccessCount: publicAccess,
      zoneRedundantCount: zoneRedundant,
      registriesByLocation: locationCounts,
      topLocations,
      registriesBySku,
      discoverySuccessPercentage,
      dataSourcesReceivedCount,
      dataSourcesTotal,
    };
  }, [registries]);

  const filteredData = useMemo(() => {
    const search = searchText.toLowerCase();
    if (!search) return registries;
    return registries.filter(item =>
      Object.values(item).some(v => String(v).toLowerCase().includes(search))
    );
  }, [searchText, registries]);

  const columns = useMemo<ColDef[]>(() => {
    return [
      { field: 'Name', headerName: 'Registry Name', width: 200 },
      { field: 'LoginServer', headerName: 'Login Server', width: 250 },
      { field: 'Location', headerName: 'Location', width: 120 },
      { field: 'Sku', headerName: 'SKU', width: 100 },
      { field: 'ResourceGroupName', headerName: 'Resource Group', width: 180 },
      { field: 'AdminUserEnabled', headerName: 'Admin Enabled', width: 120 },
      { field: 'PublicNetworkAccess', headerName: 'Public Access', width: 120 },
      { field: 'ProvisioningState', headerName: 'State', width: 100 },
    ];
  }, []);

  const exportToCSV = useCallback((data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).filter(k => !k.startsWith('_'));
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const v = row[h];
        if (v == null) return '';
        if (typeof v === 'string' && (v.includes(',') || v.includes('"'))) return `"${v.replace(/"/g, '""')}"`;
        return v;
      }).join(','))
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
        let acrs = await loadCsvFile<ContainerRegistry>(basePath, 'AzureResourceDiscovery_ContainerRegistries.csv');
        if (acrs.length === 0) {
          acrs = await loadCsvFile<ContainerRegistry>(basePath, 'AzureACRDiscovery.csv');
        }
        setRegistries(acrs);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    }
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  return {
    registries,
    isLoading,
    error,
    activeTab,
    searchText,
    stats,
    columns,
    filteredData,
    setActiveTab,
    setSearchText,
    reloadData,
    exportToCSV,
    clearError: () => setError(null),
  };
};
