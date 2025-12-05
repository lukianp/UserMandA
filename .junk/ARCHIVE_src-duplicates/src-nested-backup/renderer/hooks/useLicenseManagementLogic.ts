import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * License management data interfaces
 */
interface LicenseData {
  id: string;
  productName: string;
  vendor: string;
  totalLicenses: number;
  usedLicenses: number;
  availableLicenses: number;
  utilizationRate: number;
  costPerLicense: number;
  totalCost: number;
  expirationDate: Date;
  category: string;
  autoRenew: boolean;
}

interface LicenseUsage {
  licenseId: string;
  userId: string;
  userName: string;
  assignedDate: Date;
  lastUsed?: Date;
  department: string;
}

interface LicenseAlert {
  id: string;
  type: 'expiration' | 'overutilization' | 'underutilization' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  licenseId: string;
  recommendedAction: string;
}

interface LicenseMetrics {
  totalLicenses: number;
  totalCost: number;
  averageUtilization: number;
  expiringSoon: number; // Within 90 days
  overUtilized: number; // >100% utilization
  underUtilized: number; // <50% utilization
}

interface LicenseManagementData {
  licenses: LicenseData[];
  usage: LicenseUsage[];
  alerts: LicenseAlert[];
  metrics: LicenseMetrics;
  lastUpdated: Date;
}

/**
 * Generate mock license management data
 */
function getMockLicenseManagementData(): LicenseManagementData {
  const licenses: LicenseData[] = [
    {
      id: '1',
      productName: 'Microsoft 365 E3',
      vendor: 'Microsoft',
      totalLicenses: 12500,
      usedLicenses: 11875,
      availableLicenses: 625,
      utilizationRate: 95,
      costPerLicense: 32,
      totalCost: 400000,
      expirationDate: new Date('2025-06-15'),
      category: 'Productivity',
      autoRenew: true,
    },
    {
      id: '2',
      productName: 'Adobe Creative Cloud',
      vendor: 'Adobe',
      totalLicenses: 500,
      usedLicenses: 387,
      availableLicenses: 113,
      utilizationRate: 77,
      costPerLicense: 72,
      totalCost: 36000,
      expirationDate: new Date('2025-03-20'),
      category: 'Creative',
      autoRenew: false,
    },
    {
      id: '3',
      productName: 'Slack Enterprise',
      vendor: 'Salesforce',
      totalLicenses: 8000,
      usedLicenses: 7420,
      availableLicenses: 580,
      utilizationRate: 93,
      costPerLicense: 12,
      totalCost: 96000,
      expirationDate: new Date('2024-11-30'),
      category: 'Communication',
      autoRenew: true,
    },
    {
      id: '4',
      productName: 'Zoom Pro',
      vendor: 'Zoom',
      totalLicenses: 6000,
      usedLicenses: 4230,
      availableLicenses: 1770,
      utilizationRate: 71,
      costPerLicense: 15,
      totalCost: 90000,
      expirationDate: new Date('2024-12-15'),
      category: 'Communication',
      autoRenew: true,
    },
    {
      id: '5',
      productName: 'Atlassian Suite',
      vendor: 'Atlassian',
      totalLicenses: 1200,
      usedLicenses: 1080,
      availableLicenses: 120,
      utilizationRate: 90,
      costPerLicense: 8,
      totalCost: 9600,
      expirationDate: new Date('2025-08-10'),
      category: 'Development',
      autoRenew: true,
    },
  ];

  const usage: LicenseUsage[] = [
    {
      licenseId: '1',
      userId: 'user1',
      userName: 'John Doe',
      assignedDate: new Date('2023-01-15'),
      lastUsed: new Date('2024-10-01'),
      department: 'IT',
    },
    {
      licenseId: '1',
      userId: 'user2',
      userName: 'Jane Smith',
      assignedDate: new Date('2023-02-01'),
      lastUsed: new Date('2024-09-28'),
      department: 'Marketing',
    },
  ];

  const alerts: LicenseAlert[] = [
    {
      id: '1',
      type: 'expiration',
      severity: 'high',
      message: 'Adobe Creative Cloud licenses expire in 45 days',
      licenseId: '2',
      recommendedAction: 'Renew licenses or redistribute unused ones',
    },
    {
      id: '2',
      type: 'underutilization',
      severity: 'medium',
      message: 'Zoom Pro utilization below 80%',
      licenseId: '4',
      recommendedAction: 'Reclaim unused licenses',
    },
    {
      id: '3',
      type: 'compliance',
      severity: 'critical',
      message: 'Microsoft 365 over-allocation detected',
      licenseId: '1',
      recommendedAction: 'Audit license assignments and remove unused licenses',
    },
  ];

  const metrics: LicenseMetrics = {
    totalLicenses: licenses.reduce((sum, lic) => sum + lic.totalLicenses, 0),
    totalCost: licenses.reduce((sum, lic) => sum + lic.totalCost, 0),
    averageUtilization: Math.round(
      licenses.reduce((sum, lic) => sum + lic.utilizationRate, 0) / licenses.length
    ),
    expiringSoon: licenses.filter(lic =>
      (lic.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24) < 90
    ).length,
    overUtilized: licenses.filter(lic => lic.utilizationRate > 100).length,
    underUtilized: licenses.filter(lic => lic.utilizationRate < 50).length,
  };

  return {
    licenses,
    usage,
    alerts,
    metrics,
    lastUpdated: new Date(),
  };
}

/**
 * Custom hook for License Management logic
 * Provides comprehensive license tracking and optimization
 */
export const useLicenseManagementLogic = () => {
  const [licenseData, setLicenseData] = useState<LicenseManagementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'utilization' | 'cost' | 'expiration'>('utilization');
  const [filterAlerts, setFilterAlerts] = useState<boolean>(false);

  const fetchLicenseData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In real implementation, this would integrate with:
      // - Microsoft License Management
      // - Adobe Admin Console
      // - Local license servers
      // - Procurement systems

      const data = getMockLicenseManagementData();
      setLicenseData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch license data';
      setError(errorMessage);
      console.error('License management fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchLicenseData();
  }, [fetchLicenseData]);

  // Filtered and sorted licenses
  const processedLicenses = useMemo(() => {
    if (!licenseData) return [];

    let filtered = licenseData.licenses;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(lic => lic.category === selectedCategory);
    }

    // Sort by selected field
    filtered = filtered.slice().sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.productName.localeCompare(b.productName);
        case 'utilization':
          return b.utilizationRate - a.utilizationRate;
        case 'cost':
          return b.totalCost - a.totalCost;
        case 'expiration':
          return a.expirationDate.getTime() - b.expirationDate.getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [licenseData, selectedCategory, sortBy]);

  // Filtered alerts
  const processedAlerts = useMemo(() => {
    if (!licenseData || !filterAlerts) return licenseData?.alerts || [];
    return licenseData.alerts.filter(alert => alert.severity === 'high' || alert.severity === 'critical');
  }, [licenseData, filterAlerts]);

  // Available categories
  const availableCategories = useMemo(() => {
    if (!licenseData) return [];
    const categories = [...new Set(licenseData.licenses.map(lic => lic.category))];
    return categories.map(cat => ({ id: cat, name: cat }));
  }, [licenseData]);

  return {
    licenseData,
    processedLicenses,
    processedAlerts,
    isLoading,
    error,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    filterAlerts,
    setFilterAlerts,
    availableCategories,
    refreshData: fetchLicenseData,
  };
};