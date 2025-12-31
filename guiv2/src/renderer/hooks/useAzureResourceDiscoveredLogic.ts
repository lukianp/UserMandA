/**
 * Azure Resource Discovered Logic Hook
 * Loads discovered Azure resource data from CSV files
 * Provides statistics, filtering, tabs, and export functions
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { useProfileStore } from '../store/useProfileStore';

type TabType = 'overview' | 'subscriptions' | 'resourcegroups' | 'storage' | 'keyvaults' | 'networks' | 'webapps' | 'nsgs';

interface Subscription {
  ObjectType: string;
  Name: string;
  SubscriptionId: string;
  SubscriptionName: string;
  State: string;
  TenantId: string;
}

interface ResourceGroup {
  ObjectType: string;
  Name: string;
  SubscriptionId: string;
  ResourceGroupName: string;
  Location: string;
  ProvisioningState: string;
}

interface StorageAccount {
  ObjectType: string;
  Name: string;
  SubscriptionId: string;
  ResourceGroupName: string;
  Location: string;
  SkuName: string;
  Kind: string;
  AccessTier: string;
  EnableHttpsTrafficOnly: string | boolean;
  MinimumTlsVersion: string;
}

interface KeyVault {
  ObjectType: string;
  Name: string;
  SubscriptionId: string;
  ResourceGroupName: string;
  VaultName: string;
  Location: string;
  Sku: string;
  EnableSoftDelete: string | boolean;
  EnableRbacAuthorization: string | boolean;
  SecretCount: number | string;
  KeyCount: number | string;
  CertificateCount: number | string;
}

interface VirtualNetwork {
  ObjectType: string;
  Name: string;
  SubscriptionId: string;
  ResourceGroupName: string;
  Location: string;
  AddressSpace: string;
  SubnetCount: number | string;
}

interface NetworkSecurityGroup {
  ObjectType: string;
  Name: string;
  SubscriptionId: string;
  ResourceGroupName: string;
  Location: string;
  RuleCount: number | string;
}

interface WebApp {
  ObjectType: string;
  Name: string;
  SubscriptionId: string;
  ResourceGroupName: string;
  Location: string;
  State: string;
  DefaultHostName: string;
  Kind: string;
}

interface AzureResourceStats {
  totalResources: number;
  subscriptions: number;
  resourceGroups: number;
  storageAccounts: number;
  keyVaults: number;
  virtualNetworks: number;
  nsgs: number;
  webApps: number;
  resourcesByLocation: Record<string, number>;
  topLocations: { name: string; count: number }[];
}

interface ColumnDef {
  key: string;
  header: string;
  width: number;
  getValue?: (row: any) => any;
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

export const useAzureResourceDiscoveredLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [resourceGroups, setResourceGroups] = useState<ResourceGroup[]>([]);
  const [storageAccounts, setStorageAccounts] = useState<StorageAccount[]>([]);
  const [keyVaults, setKeyVaults] = useState<KeyVault[]>([]);
  const [virtualNetworks, setVirtualNetworks] = useState<VirtualNetwork[]>([]);
  const [nsgs, setNsgs] = useState<NetworkSecurityGroup[]>([]);
  const [webApps, setWebApps] = useState<WebApp[]>([]);
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

        const [subs, rgs, storage, kv, vnets, nsgData, apps] = await Promise.all([
          loadCsvFile<Subscription>(basePath, 'AzureResourceDiscovery_Subscriptions.csv'),
          loadCsvFile<ResourceGroup>(basePath, 'AzureResourceDiscovery_ResourceGroups.csv'),
          loadCsvFile<StorageAccount>(basePath, 'AzureResourceDiscovery_StorageAccounts.csv'),
          loadCsvFile<KeyVault>(basePath, 'AzureResourceDiscovery_KeyVaults.csv'),
          loadCsvFile<VirtualNetwork>(basePath, 'AzureResourceDiscovery_VirtualNetworks.csv'),
          loadCsvFile<NetworkSecurityGroup>(basePath, 'AzureResourceDiscovery_NetworkSecurityGroups.csv'),
          loadCsvFile<WebApp>(basePath, 'AzureResourceDiscovery_WebApps.csv'),
        ]);

        setSubscriptions(subs);
        setResourceGroups(rgs);
        setStorageAccounts(storage);
        setKeyVaults(kv);
        setVirtualNetworks(vnets);
        setNsgs(nsgData);
        setWebApps(apps);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  const stats = useMemo<AzureResourceStats | null>(() => {
    const total = subscriptions.length + resourceGroups.length + storageAccounts.length +
                  keyVaults.length + virtualNetworks.length + nsgs.length + webApps.length;
    if (total === 0) return null;

    const locationCounts: Record<string, number> = {};
    [...resourceGroups, ...storageAccounts, ...keyVaults, ...virtualNetworks, ...nsgs, ...webApps].forEach((r: any) => {
      const loc = r.Location || 'Unknown';
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });

    const topLocations = Object.entries(locationCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalResources: total,
      subscriptions: subscriptions.length,
      resourceGroups: resourceGroups.length,
      storageAccounts: storageAccounts.length,
      keyVaults: keyVaults.length,
      virtualNetworks: virtualNetworks.length,
      nsgs: nsgs.length,
      webApps: webApps.length,
      resourcesByLocation: locationCounts,
      topLocations,
    };
  }, [subscriptions, resourceGroups, storageAccounts, keyVaults, virtualNetworks, nsgs, webApps]);

  const filteredData = useMemo(() => {
    const search = searchText.toLowerCase();
    const filterFn = (items: any[]) => search ? items.filter(item =>
      Object.values(item).some(v => String(v).toLowerCase().includes(search))
    ) : items;

    switch (activeTab) {
      case 'subscriptions': return filterFn(subscriptions);
      case 'resourcegroups': return filterFn(resourceGroups);
      case 'storage': return filterFn(storageAccounts);
      case 'keyvaults': return filterFn(keyVaults);
      case 'networks': return filterFn(virtualNetworks);
      case 'nsgs': return filterFn(nsgs);
      case 'webapps': return filterFn(webApps);
      default: return [];
    }
  }, [activeTab, searchText, subscriptions, resourceGroups, storageAccounts, keyVaults, virtualNetworks, nsgs, webApps]);

  const columns = useMemo<ColumnDef[]>(() => {
    switch (activeTab) {
      case 'subscriptions':
        return [
          { key: 'Name', header: 'Name', width: 250 },
          { key: 'SubscriptionId', header: 'Subscription ID', width: 300 },
          { key: 'State', header: 'State', width: 100 },
          { key: 'TenantId', header: 'Tenant ID', width: 300 },
        ];
      case 'resourcegroups':
        return [
          { key: 'Name', header: 'Name', width: 200 },
          { key: 'Location', header: 'Location', width: 120 },
          { key: 'ProvisioningState', header: 'State', width: 100 },
          { key: 'SubscriptionId', header: 'Subscription', width: 300 },
        ];
      case 'storage':
        return [
          { key: 'Name', header: 'Name', width: 220 },
          { key: 'ResourceGroupName', header: 'Resource Group', width: 180 },
          { key: 'Location', header: 'Location', width: 120 },
          { key: 'SkuName', header: 'SKU', width: 120 },
          { key: 'Kind', header: 'Kind', width: 100 },
          { key: 'AccessTier', header: 'Access Tier', width: 100 },
          { key: 'MinimumTlsVersion', header: 'TLS', width: 80 },
        ];
      case 'keyvaults':
        return [
          { key: 'VaultName', header: 'Vault Name', width: 200 },
          { key: 'ResourceGroupName', header: 'Resource Group', width: 180 },
          { key: 'Location', header: 'Location', width: 120 },
          { key: 'Sku', header: 'SKU', width: 100 },
          { key: 'SecretCount', header: 'Secrets', width: 80 },
          { key: 'KeyCount', header: 'Keys', width: 80 },
          { key: 'CertificateCount', header: 'Certs', width: 80 },
        ];
      case 'networks':
        return [
          { key: 'Name', header: 'Name', width: 200 },
          { key: 'ResourceGroupName', header: 'Resource Group', width: 180 },
          { key: 'Location', header: 'Location', width: 120 },
          { key: 'AddressSpace', header: 'Address Space', width: 200 },
          { key: 'SubnetCount', header: 'Subnets', width: 80 },
        ];
      case 'nsgs':
        return [
          { key: 'Name', header: 'Name', width: 220 },
          { key: 'ResourceGroupName', header: 'Resource Group', width: 180 },
          { key: 'Location', header: 'Location', width: 120 },
          { key: 'RuleCount', header: 'Rules', width: 80 },
        ];
      case 'webapps':
        return [
          { key: 'Name', header: 'Name', width: 200 },
          { key: 'ResourceGroupName', header: 'Resource Group', width: 180 },
          { key: 'Location', header: 'Location', width: 120 },
          { key: 'State', header: 'State', width: 100 },
          { key: 'Kind', header: 'Kind', width: 100 },
          { key: 'DefaultHostName', header: 'Host Name', width: 250 },
        ];
      default:
        return [];
    }
  }, [activeTab]);

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
        const [subs, rgs, storage, kv, vnets, nsgData, apps] = await Promise.all([
          loadCsvFile<Subscription>(basePath, 'AzureResourceDiscovery_Subscriptions.csv'),
          loadCsvFile<ResourceGroup>(basePath, 'AzureResourceDiscovery_ResourceGroups.csv'),
          loadCsvFile<StorageAccount>(basePath, 'AzureResourceDiscovery_StorageAccounts.csv'),
          loadCsvFile<KeyVault>(basePath, 'AzureResourceDiscovery_KeyVaults.csv'),
          loadCsvFile<VirtualNetwork>(basePath, 'AzureResourceDiscovery_VirtualNetworks.csv'),
          loadCsvFile<NetworkSecurityGroup>(basePath, 'AzureResourceDiscovery_NetworkSecurityGroups.csv'),
          loadCsvFile<WebApp>(basePath, 'AzureResourceDiscovery_WebApps.csv'),
        ]);
        setSubscriptions(subs);
        setResourceGroups(rgs);
        setStorageAccounts(storage);
        setKeyVaults(kv);
        setVirtualNetworks(vnets);
        setNsgs(nsgData);
        setWebApps(apps);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    }
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  return {
    subscriptions, resourceGroups, storageAccounts, keyVaults, virtualNetworks, nsgs, webApps,
    isLoading, error, activeTab, searchText, stats, columns, filteredData,
    setActiveTab, setSearchText, reloadData, exportToCSV,
    clearError: () => setError(null),
  };
};
