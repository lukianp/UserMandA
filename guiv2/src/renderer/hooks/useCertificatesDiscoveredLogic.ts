/**
 * Certificates Discovered Logic Hook
 * Loads discovered certificate data from CSV files
 * Provides statistics, filtering, tabs, and export functions
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { useProfileStore } from '../store/useProfileStore';
import { ColDef } from 'ag-grid-community';

interface LocalCertificate {
  StoreLocation: string;
  StoreName: string;
  Subject: string;
  Issuer: string;
  SerialNumber: string;
  Thumbprint: string;
  NotBefore: string;
  NotAfter: string;
  DaysToExpiry: string;
  IsExpired: string;
  IsExpiringSoon: string;
  SignatureAlgorithm: string;
  KeyAlgorithm: string;
  KeySize: string;
  Version: string;
  HasPrivateKey: string;
  KeyUsage: string;
  EnhancedKeyUsage: string;
  FriendlyName: string;
  Archived: string;
  SubjectAlternativeNames: string;
  SessionId: string;
  _DataType: string;
}

type TabType = 'overview' | 'certificates';

interface CertificatesStats {
  totalCertificates: number;
  expiredCount: number;
  expiringSoonCount: number;
  validCount: number;
  withPrivateKey: number;
  byStoreLocation: Array<{ name: string; count: number }>;
  byStoreName: Array<{ name: string; count: number }>;
  byIssuer: Array<{ name: string; count: number }>;
  bySignatureAlgorithm: Array<{ name: string; count: number }>;
  avgDaysToExpiry: number;
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

export const useCertificatesDiscoveredLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  const [certificates, setCertificates] = useState<LocalCertificate[]>([]);
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
        const data = await loadCsvFile<LocalCertificate>(basePath, 'Certificate_LocalCertificate.csv');
        setCertificates(data);
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
    if (!searchText) return certificates;
    const search = searchText.toLowerCase();
    return certificates.filter(c =>
      c.Subject?.toLowerCase().includes(search) ||
      c.Issuer?.toLowerCase().includes(search) ||
      c.StoreName?.toLowerCase().includes(search) ||
      c.FriendlyName?.toLowerCase().includes(search)
    );
  }, [certificates, searchText]);

  const columns = useMemo<ColDef[]>(() => [
    { field: 'Subject', headerName: 'Subject', width: 300 },
    { field: 'Issuer', headerName: 'Issuer', width: 250 },
    { field: 'StoreLocation', headerName: 'Store Location', width: 120 },
    { field: 'StoreName', headerName: 'Store Name', width: 100 },
    { field: 'NotAfter', headerName: 'Expires', width: 150 },
    { field: 'DaysToExpiry', headerName: 'Days Left', width: 100, type: 'numericColumn' },
    { field: 'IsExpired', headerName: 'Expired', width: 80 },
    { field: 'IsExpiringSoon', headerName: 'Expiring Soon', width: 100 },
    { field: 'HasPrivateKey', headerName: 'Has Key', width: 80 },
    { field: 'SignatureAlgorithm', headerName: 'Algorithm', width: 120 },
    { field: 'KeySize', headerName: 'Key Size', width: 80 },
  ], []);

  const stats = useMemo<CertificatesStats | null>(() => {
    if (certificates.length === 0) return null;

    // Discovery Success
    const expectedSources = [
      { name: 'LocalCertificates', hasData: certificates.length > 0, weight: 100 },
    ];
    const totalWeight = expectedSources.reduce((sum, s) => sum + s.weight, 0);
    const achievedWeight = expectedSources.reduce((sum, s) => sum + (s.hasData ? s.weight : 0), 0);
    const discoverySuccessPercentage = Math.round((achievedWeight / totalWeight) * 100);
    const dataSourcesReceivedCount = expectedSources.filter(s => s.hasData).length;
    const dataSourcesTotal = expectedSources.length;

    // Counts
    const expiredCount = certificates.filter(c => c.IsExpired === 'True' || c.IsExpired === true).length;
    const expiringSoonCount = certificates.filter(c => c.IsExpiringSoon === 'True' || c.IsExpiringSoon === true).length;
    const validCount = certificates.length - expiredCount;
    const withPrivateKey = certificates.filter(c => c.HasPrivateKey === 'True' || c.HasPrivateKey === true).length;

    // By store location
    const locationCounts: Record<string, number> = {};
    certificates.forEach(c => {
      const loc = c.StoreLocation || 'Unknown';
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    const byStoreLocation = Object.entries(locationCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // By store name
    const storeNameCounts: Record<string, number> = {};
    certificates.forEach(c => {
      const name = c.StoreName || 'Unknown';
      storeNameCounts[name] = (storeNameCounts[name] || 0) + 1;
    });
    const byStoreName = Object.entries(storeNameCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // By issuer (extract CN from issuer string)
    const issuerCounts: Record<string, number> = {};
    certificates.forEach(c => {
      const issuer = c.Issuer || 'Unknown';
      const cnMatch = issuer.match(/CN=([^,]+)/);
      const issuerName = cnMatch ? cnMatch[1] : issuer.slice(0, 50);
      issuerCounts[issuerName] = (issuerCounts[issuerName] || 0) + 1;
    });
    const byIssuer = Object.entries(issuerCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // By signature algorithm
    const algoCounts: Record<string, number> = {};
    certificates.forEach(c => {
      const algo = c.SignatureAlgorithm || 'Unknown';
      algoCounts[algo] = (algoCounts[algo] || 0) + 1;
    });
    const bySignatureAlgorithm = Object.entries(algoCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Average days to expiry
    const validCertsWithExpiry = certificates.filter(c => {
      const days = parseInt(c.DaysToExpiry);
      return !isNaN(days) && days > 0;
    });
    const avgDaysToExpiry = validCertsWithExpiry.length > 0
      ? Math.round(validCertsWithExpiry.reduce((sum, c) => sum + parseInt(c.DaysToExpiry), 0) / validCertsWithExpiry.length)
      : 0;

    return {
      totalCertificates: certificates.length,
      expiredCount,
      expiringSoonCount,
      validCount,
      withPrivateKey,
      byStoreLocation,
      byStoreName,
      byIssuer,
      bySignatureAlgorithm,
      avgDaysToExpiry,
      discoverySuccessPercentage,
      dataSourcesReceivedCount,
      dataSourcesTotal,
    };
  }, [certificates]);

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
        const data = await loadCsvFile<LocalCertificate>(basePath, 'Certificate_LocalCertificate.csv');
        setCertificates(data);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    }
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  return {
    certificates,
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
