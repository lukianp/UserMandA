/**
 * Azure Resource Discovered Logic Hook
 * Loads discovered Azure resource data from CSV files
 * Provides statistics, filtering, tabs, and export functions
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { useProfileStore } from '../store/useProfileStore';

type TabType = 'overview' | 'subscriptions' | 'resourcegroups' | 'storage' | 'keyvaults' | 'networks' | 'webapps' | 'nsgs' | 'groupmembers';

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

interface GroupMember {
  ObjectType: string;
  GroupId: string;
  GroupDisplayName: string;
  GroupMail: string;
  GroupType: string;
  IsDynamicGroup: string | boolean;
  MemberId: string;
  MemberDisplayName: string;
  MemberUPN: string;
  MemberMail: string;
  MemberType: string;
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
  groupMembers: number;
  uniqueGroups: number;
  membersByType: Record<string, number>;
  membersByGroupType: Record<string, number>;
  resourcesByLocation: Record<string, number>;
  topLocations: { name: string; count: number }[];
  // Discovery Success metrics
  discoverySuccessPercentage: number;
  dataSourcesReceivedCount: number;
  dataSourcesTotal: number;
  dataSourcesReceived: string[];
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

export const useAzureResourceDiscoveredLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [resourceGroups, setResourceGroups] = useState<ResourceGroup[]>([]);
  const [storageAccounts, setStorageAccounts] = useState<StorageAccount[]>([]);
  const [keyVaults, setKeyVaults] = useState<KeyVault[]>([]);
  const [virtualNetworks, setVirtualNetworks] = useState<VirtualNetwork[]>([]);
  const [nsgs, setNsgs] = useState<NetworkSecurityGroup[]>([]);
  const [webApps, setWebApps] = useState<WebApp[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
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

        const [subs, rgs, storage, kv, vnets, nsgData, apps, members] = await Promise.all([
          loadCsvFile<Subscription>(basePath, 'AzureResourceDiscovery_Subscriptions.csv'),
          loadCsvFile<ResourceGroup>(basePath, 'AzureResourceDiscovery_ResourceGroups.csv'),
          loadCsvFile<StorageAccount>(basePath, 'AzureResourceDiscovery_StorageAccounts.csv'),
          loadCsvFile<KeyVault>(basePath, 'AzureResourceDiscovery_KeyVaults.csv'),
          loadCsvFile<VirtualNetwork>(basePath, 'AzureResourceDiscovery_VirtualNetworks.csv'),
          loadCsvFile<NetworkSecurityGroup>(basePath, 'AzureResourceDiscovery_NetworkSecurityGroups.csv'),
          loadCsvFile<WebApp>(basePath, 'AzureResourceDiscovery_WebApps.csv'),
          loadCsvFile<GroupMember>(basePath, 'AzureDiscovery_GroupMembers.csv'),
        ]);

        setSubscriptions(subs);
        setResourceGroups(rgs);
        setStorageAccounts(storage);
        setKeyVaults(kv);
        setVirtualNetworks(vnets);
        setNsgs(nsgData);
        setWebApps(apps);
        setGroupMembers(members);
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
    if (total === 0 && groupMembers.length === 0) return null;

    const locationCounts: Record<string, number> = {};
    [...resourceGroups, ...storageAccounts, ...keyVaults, ...virtualNetworks, ...nsgs, ...webApps].forEach((r: any) => {
      const loc = r.Location || 'Unknown';
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });

    const topLocations = Object.entries(locationCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Group membership statistics
    const uniqueGroupIds = new Set(groupMembers.map(m => m.GroupId));
    const membersByType: Record<string, number> = {};
    const membersByGroupType: Record<string, number> = {};
    groupMembers.forEach(m => {
      const mType = m.MemberType || 'Unknown';
      membersByType[mType] = (membersByType[mType] || 0) + 1;
      const gType = m.GroupType || 'Unknown';
      membersByGroupType[gType] = (membersByGroupType[gType] || 0) + 1;
    });

    // Calculate Discovery Success % - weighted by importance for migration
    const expectedSources = [
      { name: 'Subscriptions', hasData: subscriptions.length > 0, weight: 20 },
      { name: 'Resource Groups', hasData: resourceGroups.length > 0, weight: 15 },
      { name: 'Storage Accounts', hasData: storageAccounts.length > 0, weight: 15 },
      { name: 'Key Vaults', hasData: keyVaults.length > 0, weight: 10 },
      { name: 'Virtual Networks', hasData: virtualNetworks.length > 0, weight: 15 },
      { name: 'Network Security Groups', hasData: nsgs.length > 0, weight: 10 },
      { name: 'Web Apps', hasData: webApps.length > 0, weight: 5 },
      { name: 'Group Members', hasData: groupMembers.length > 0, weight: 10 },
    ];
    const totalWeight = expectedSources.reduce((sum, s) => sum + s.weight, 0);
    const achievedWeight = expectedSources.reduce((sum, s) => sum + (s.hasData ? s.weight : 0), 0);
    const discoverySuccessPercentage = Math.round((achievedWeight / totalWeight) * 100);
    const dataSourcesReceivedCount = expectedSources.filter(s => s.hasData).length;
    const dataSourcesTotal = expectedSources.length;
    const dataSourcesReceived = expectedSources.filter(s => s.hasData).map(s => s.name);

    return {
      totalResources: total,
      subscriptions: subscriptions.length,
      resourceGroups: resourceGroups.length,
      storageAccounts: storageAccounts.length,
      keyVaults: keyVaults.length,
      virtualNetworks: virtualNetworks.length,
      nsgs: nsgs.length,
      webApps: webApps.length,
      groupMembers: groupMembers.length,
      uniqueGroups: uniqueGroupIds.size,
      membersByType,
      membersByGroupType,
      resourcesByLocation: locationCounts,
      topLocations,
      discoverySuccessPercentage,
      dataSourcesReceivedCount,
      dataSourcesTotal,
      dataSourcesReceived,
    };
  }, [subscriptions, resourceGroups, storageAccounts, keyVaults, virtualNetworks, nsgs, webApps, groupMembers]);

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
      case 'groupmembers': return filterFn(groupMembers);
      default: return [];
    }
  }, [activeTab, searchText, subscriptions, resourceGroups, storageAccounts, keyVaults, virtualNetworks, nsgs, webApps, groupMembers]);

  const columns = useMemo<ColDef[]>(() => {
    switch (activeTab) {
      case 'subscriptions':
        return [
          { field: 'Name', headerName: 'Name', width: 250 },
          { field: 'SubscriptionId', headerName: 'Subscription ID', width: 300 },
          { field: 'State', headerName: 'State', width: 100 },
          { field: 'TenantId', headerName: 'Tenant ID', width: 300 },
        ];
      case 'resourcegroups':
        return [
          { field: 'Name', headerName: 'Name', width: 200 },
          { field: 'Location', headerName: 'Location', width: 120 },
          { field: 'ProvisioningState', headerName: 'State', width: 100 },
          { field: 'SubscriptionId', headerName: 'Subscription', width: 300 },
        ];
      case 'storage':
        return [
          { field: 'Name', headerName: 'Name', width: 220 },
          { field: 'ResourceGroupName', headerName: 'Resource Group', width: 180 },
          { field: 'Location', headerName: 'Location', width: 120 },
          { field: 'SkuName', headerName: 'SKU', width: 120 },
          { field: 'Kind', headerName: 'Kind', width: 100 },
          { field: 'AccessTier', headerName: 'Access Tier', width: 100 },
          { field: 'MinimumTlsVersion', headerName: 'TLS', width: 80 },
        ];
      case 'keyvaults':
        return [
          { field: 'VaultName', headerName: 'Vault Name', width: 200 },
          { field: 'ResourceGroupName', headerName: 'Resource Group', width: 180 },
          { field: 'Location', headerName: 'Location', width: 120 },
          { field: 'Sku', headerName: 'SKU', width: 100 },
          { field: 'SecretCount', headerName: 'Secrets', width: 80 },
          { field: 'KeyCount', headerName: 'Keys', width: 80 },
          { field: 'CertificateCount', headerName: 'Certs', width: 80 },
        ];
      case 'networks':
        return [
          { field: 'Name', headerName: 'Name', width: 200 },
          { field: 'ResourceGroupName', headerName: 'Resource Group', width: 180 },
          { field: 'Location', headerName: 'Location', width: 120 },
          { field: 'AddressSpace', headerName: 'Address Space', width: 200 },
          { field: 'SubnetCount', headerName: 'Subnets', width: 80 },
        ];
      case 'nsgs':
        return [
          { field: 'Name', headerName: 'Name', width: 220 },
          { field: 'ResourceGroupName', headerName: 'Resource Group', width: 180 },
          { field: 'Location', headerName: 'Location', width: 120 },
          { field: 'RuleCount', headerName: 'Rules', width: 80 },
        ];
      case 'webapps':
        return [
          { field: 'Name', headerName: 'Name', width: 200 },
          { field: 'ResourceGroupName', headerName: 'Resource Group', width: 180 },
          { field: 'Location', headerName: 'Location', width: 120 },
          { field: 'State', headerName: 'State', width: 100 },
          { field: 'Kind', headerName: 'Kind', width: 100 },
          { field: 'DefaultHostName', headerName: 'Host Name', width: 250 },
        ];
      case 'groupmembers':
        return [
          { field: 'GroupDisplayName', headerName: 'Group Name', width: 200 },
          { field: 'GroupType', headerName: 'Group Type', width: 140 },
          { field: 'MemberDisplayName', headerName: 'Member Name', width: 200 },
          { field: 'MemberUPN', headerName: 'Member UPN', width: 250 },
          { field: 'MemberType', headerName: 'Member Type', width: 120 },
          { field: 'GroupMail', headerName: 'Group Email', width: 200 },
          { field: 'IsDynamicGroup', headerName: 'Dynamic', width: 80 },
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
        const [subs, rgs, storage, kv, vnets, nsgData, apps, members] = await Promise.all([
          loadCsvFile<Subscription>(basePath, 'AzureResourceDiscovery_Subscriptions.csv'),
          loadCsvFile<ResourceGroup>(basePath, 'AzureResourceDiscovery_ResourceGroups.csv'),
          loadCsvFile<StorageAccount>(basePath, 'AzureResourceDiscovery_StorageAccounts.csv'),
          loadCsvFile<KeyVault>(basePath, 'AzureResourceDiscovery_KeyVaults.csv'),
          loadCsvFile<VirtualNetwork>(basePath, 'AzureResourceDiscovery_VirtualNetworks.csv'),
          loadCsvFile<NetworkSecurityGroup>(basePath, 'AzureResourceDiscovery_NetworkSecurityGroups.csv'),
          loadCsvFile<WebApp>(basePath, 'AzureResourceDiscovery_WebApps.csv'),
          loadCsvFile<GroupMember>(basePath, 'AzureDiscovery_GroupMembers.csv'),
        ]);
        setSubscriptions(subs);
        setResourceGroups(rgs);
        setStorageAccounts(storage);
        setKeyVaults(kv);
        setVirtualNetworks(vnets);
        setNsgs(nsgData);
        setWebApps(apps);
        setGroupMembers(members);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    }
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  return {
    subscriptions, resourceGroups, storageAccounts, keyVaults, virtualNetworks, nsgs, webApps, groupMembers,
    isLoading, error, activeTab, searchText, stats, columns, filteredData,
    setActiveTab, setSearchText, reloadData, exportToCSV,
    clearError: () => setError(null),
  };
};
