/**
 * Azure Key Vault Discovered Logic Hook
 * Loads discovered Key Vault data from CSV files
 * Provides statistics, filtering, tabs, and export functions
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { useProfileStore } from '../store/useProfileStore';

type TabType = 'overview' | 'vaults';

interface KeyVault {
  ObjectType: string;
  Name: string;
  SubscriptionId: string;
  ResourceGroupName: string;
  VaultName: string;
  Location: string;
  VaultUri: string;
  TenantId: string;
  Sku: string;
  EnabledForDeployment: boolean | string;
  EnabledForDiskEncryption: boolean | string;
  EnabledForTemplateDeployment: boolean | string;
  EnableSoftDelete: boolean | string;
  SoftDeleteRetentionInDays: number | string;
  EnableRbacAuthorization: boolean | string;
  EnablePurgeProtection: boolean | string;
  SecretCount: number | string;
  KeyCount: number | string;
  CertificateCount: number | string;
  AccessPolicyCount: number | string;
  AccessPolicies: string;
  NetworkAcls: string;
  Tags: string;
}

interface AzureKeyVaultStats {
  totalVaults: number;
  standardSku: number;
  premiumSku: number;
  softDeleteEnabled: number;
  purgeProtectionEnabled: number;
  rbacEnabled: number;
  deploymentEnabled: number;
  totalSecrets: number;
  totalKeys: number;
  totalCertificates: number;
  totalAccessPolicies: number;
  vaultsByLocation: Record<string, number>;
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

const isTruthy = (val: any): boolean => {
  return val === true || val === 'True' || val === 'true' || val === 1;
};

export const useAzureKeyVaultDiscoveredLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  const [vaults, setVaults] = useState<KeyVault[]>([]);
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
        const kvData = await loadCsvFile<KeyVault>(basePath, 'AzureResourceDiscovery_KeyVaults.csv');
        setVaults(kvData);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  const stats = useMemo<AzureKeyVaultStats | null>(() => {
    if (vaults.length === 0) return null;

    const locationCounts: Record<string, number> = {};
    let standard = 0, premium = 0;
    let softDelete = 0, purgeProtection = 0, rbac = 0, deployment = 0;
    let secrets = 0, keys = 0, certs = 0, policies = 0;

    vaults.forEach((v) => {
      const loc = v.Location || 'Unknown';
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;

      if (v.Sku === 'Standard') standard++;
      if (v.Sku === 'Premium') premium++;

      if (isTruthy(v.EnableSoftDelete)) softDelete++;
      if (isTruthy(v.EnablePurgeProtection)) purgeProtection++;
      if (isTruthy(v.EnableRbacAuthorization)) rbac++;
      if (isTruthy(v.EnabledForDeployment)) deployment++;

      secrets += Number(v.SecretCount) || 0;
      keys += Number(v.KeyCount) || 0;
      certs += Number(v.CertificateCount) || 0;
      policies += Number(v.AccessPolicyCount) || 0;
    });

    const topLocations = Object.entries(locationCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalVaults: vaults.length,
      standardSku: standard,
      premiumSku: premium,
      softDeleteEnabled: softDelete,
      purgeProtectionEnabled: purgeProtection,
      rbacEnabled: rbac,
      deploymentEnabled: deployment,
      totalSecrets: secrets,
      totalKeys: keys,
      totalCertificates: certs,
      totalAccessPolicies: policies,
      vaultsByLocation: locationCounts,
      topLocations,
    };
  }, [vaults]);

  const filteredData = useMemo(() => {
    const search = searchText.toLowerCase();
    if (!search) return vaults;
    return vaults.filter(item =>
      Object.values(item).some(v => String(v).toLowerCase().includes(search))
    );
  }, [searchText, vaults]);

  const columns = useMemo<ColumnDef[]>(() => {
    return [
      { key: 'VaultName', header: 'Vault Name', width: 200 },
      { key: 'Location', header: 'Location', width: 120 },
      { key: 'Sku', header: 'SKU', width: 100 },
      { key: 'ResourceGroupName', header: 'Resource Group', width: 180 },
      { key: 'SecretCount', header: 'Secrets', width: 80 },
      { key: 'KeyCount', header: 'Keys', width: 80 },
      { key: 'CertificateCount', header: 'Certs', width: 80 },
      { key: 'AccessPolicyCount', header: 'Policies', width: 80 },
      { key: 'EnableSoftDelete', header: 'Soft Delete', width: 100 },
      { key: 'EnableRbacAuthorization', header: 'RBAC', width: 80 },
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
        const kvData = await loadCsvFile<KeyVault>(basePath, 'AzureResourceDiscovery_KeyVaults.csv');
        setVaults(kvData);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    }
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  return {
    vaults,
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
