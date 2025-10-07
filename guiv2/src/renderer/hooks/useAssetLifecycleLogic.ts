import { useState, useEffect, useCallback } from 'react';

/**
 * Asset lifecycle data model
 */
export interface AssetLifecycleData {
  id: string;
  name: string;
  type: 'Hardware' | 'Software' | 'Cloud Service' | 'License';
  lifecycleStage: 'Planning' | 'Procurement' | 'Deployment' | 'Maintenance' | 'End of Life' | 'Retirement';
  status: 'Active' | 'Inactive' | 'Planned' | 'Retired';
  acquisitionDate?: string;
  expectedLifespan?: number; // in months
  remainingLifespan?: number; // in months
  replacementCost?: number;
  maintenanceCost?: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

/**
 * Custom hook for asset lifecycle logic
 */
export const useAssetLifecycleLogic = () => {
  const [data, setData] = useState<AssetLifecycleData[]>([]);
  const [selectedItems, setSelectedItems] = useState<AssetLifecycleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [searchText, setSearchText] = useState('');

  /**
   * Load asset lifecycle data
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock data loading - replace with actual API calls
      const mockData = generateMockAssetLifecycleData();
      setData(mockData);

      console.info('[AssetLifecycle] Loaded asset lifecycle data');
    } catch (err: any) {
      const errorMsg = `Failed to load asset lifecycle data: ${err.message}`;
      console.error('[AssetLifecycle] Error:', err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load data on mount
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Filter data based on search
   */
  const filteredData = useCallback(() => {
    return data.filter(asset => {
      return !searchText ||
        asset.name.toLowerCase().includes(searchText.toLowerCase()) ||
        asset.type.toLowerCase().includes(searchText.toLowerCase()) ||
        asset.lifecycleStage.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [data, searchText]);

  /**
   * Export asset lifecycle data to CSV
   */
  const exportData = useCallback(async () => {
    try {
      const filtered = filteredData();
      const csv = convertAssetLifecycleToCSV(filtered);

      await window.electronAPI.invoke('export-data', {
        filename: `asset-lifecycle-${new Date().toISOString().split('T')[0]}.csv`,
        data: csv,
      });

      console.info('[AssetLifecycle] Exported asset lifecycle data successfully');
    } catch (err: any) {
      console.error('[AssetLifecycle] Export failed:', err);
      setError(`Export failed: ${err.message}`);
    }
  }, [filteredData]);

  return {
    data: filteredData(),
    selectedItems,
    searchText,
    setSearchText,
    isLoading,
    error,
    exportData,
    refreshData: loadData,
  };
};

/**
 * Generate mock asset lifecycle data for development
 */
function generateMockAssetLifecycleData(): AssetLifecycleData[] {
  const assets: AssetLifecycleData[] = [
    {
      id: 'asset-lifecycle-1',
      name: 'Dell PowerEdge Server R740',
      type: 'Hardware',
      lifecycleStage: 'Maintenance',
      status: 'Active',
      acquisitionDate: '2022-03-15',
      expectedLifespan: 60,
      remainingLifespan: 24,
      replacementCost: 8500,
      maintenanceCost: 1200,
      priority: 'High',
    },
    {
      id: 'asset-lifecycle-2',
      name: 'Microsoft Office 365 License',
      type: 'License',
      lifecycleStage: 'Deployment',
      status: 'Active',
      acquisitionDate: '2023-06-01',
      expectedLifespan: 12,
      remainingLifespan: 8,
      replacementCost: 120,
      maintenanceCost: 0,
      priority: 'Medium',
    },
    {
      id: 'asset-lifecycle-3',
      name: 'AWS EC2 Instance',
      type: 'Cloud Service',
      lifecycleStage: 'Planning',
      status: 'Planned',
      expectedLifespan: 36,
      remainingLifespan: 36,
      replacementCost: 500,
      maintenanceCost: 200,
      priority: 'Medium',
    },
    {
      id: 'asset-lifecycle-4',
      name: 'Windows Server 2019 License',
      type: 'Software',
      lifecycleStage: 'End of Life',
      status: 'Active',
      acquisitionDate: '2020-11-20',
      expectedLifespan: 120,
      remainingLifespan: -6,
      replacementCost: 800,
      maintenanceCost: 400,
      priority: 'Critical',
    },
    {
      id: 'asset-lifecycle-5',
      name: 'HP LaserJet Printer',
      type: 'Hardware',
      lifecycleStage: 'Retirement',
      status: 'Retired',
      acquisitionDate: '2019-08-10',
      expectedLifespan: 84,
      remainingLifespan: -24,
      replacementCost: 600,
      maintenanceCost: 800,
      priority: 'Low',
    },
  ];

  return assets;
}

/**
 * Convert asset lifecycle data to CSV format
 */
function convertAssetLifecycleToCSV(assets: AssetLifecycleData[]): string {
  const headers = [
    'ID', 'Name', 'Type', 'Lifecycle Stage', 'Status', 'Acquisition Date',
    'Expected Lifespan (months)', 'Remaining Lifespan (months)',
    'Replacement Cost', 'Maintenance Cost', 'Priority'
  ];

  const rows = assets.map(asset => [
    asset.id,
    asset.name,
    asset.type,
    asset.lifecycleStage,
    asset.status,
    asset.acquisitionDate || '',
    asset.expectedLifespan?.toString() || '',
    asset.remainingLifespan?.toString() || '',
    asset.replacementCost?.toString() || '',
    asset.maintenanceCost?.toString() || '',
    asset.priority,
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}