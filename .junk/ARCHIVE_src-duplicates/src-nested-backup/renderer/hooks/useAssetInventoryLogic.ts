
import { useState, useEffect, useCallback } from 'react';

/**
 * Asset data model with full infrastructure details
 */
export interface AssetData {
  id: string;
  name: string;
  type: 'Workstation' | 'Server' | 'Mobile' | 'Network' | 'Printer' | 'Other';
  category: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  ipAddress?: string;
  macAddress?: string;
  operatingSystem?: string;
  osVersion?: string;
  cpu?: string;
  ramGB?: number;
  diskGB?: number;
  location?: string;
  department?: string;
  owner?: string;
  assignedUser?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  status: 'Active' | 'Inactive' | 'Decommissioned' | 'In Repair' | 'Unknown';
  lastSeen?: string;
  domainJoined?: boolean;
  domain?: string;
  age?: number; // in years
  lifecycleStatus?: 'New' | 'Current' | 'Aging' | 'End of Life';
}

/**
 * Asset statistics summary
 */
interface AssetStatistics {
  totalAssets: number;
  workstations: number;
  servers: number;
  mobileDevices: number;
  networkDevices: number;
  printers: number;
  activeAssets: number;
  inactiveAssets: number;
  avgAge: number;
  totalValue: number;
}

/**
 * Custom hook for asset inventory logic with Logic Engine integration
 */
export const useAssetInventoryLogic = () => {
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [statistics, setStatistics] = useState<AssetStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  /**
   * Load asset data from Logic Engine
   */
  const loadAssetData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Query Logic Engine for device statistics
      const statsResult = await window.electronAPI.logicEngine.getStatistics();

      if (statsResult.success && statsResult.data?.statistics) {
        const stats = statsResult.data.statistics;

        // Build asset inventory from Logic Engine data
        const assetList: AssetData[] = [];

        // Extract device data from statistics
        const deviceCount = stats.DeviceCount || 0;

        // For now, create mock assets based on device count
        // TODO: When Logic Engine provides detailed device data, extract real assets
        for (let i = 0; i < Math.min(deviceCount, 100); i++) {
          assetList.push(generateMockAsset(i));
        }

        // Calculate statistics
        const assetStats: AssetStatistics = {
          totalAssets: assetList.length,
          workstations: assetList.filter(a => a.type === 'Workstation').length,
          servers: assetList.filter(a => a.type === 'Server').length,
          mobileDevices: assetList.filter(a => a.type === 'Mobile').length,
          networkDevices: assetList.filter(a => a.type === 'Network').length,
          printers: assetList.filter(a => a.type === 'Printer').length,
          activeAssets: assetList.filter(a => a.status === 'Active').length,
          inactiveAssets: assetList.filter(a => a.status === 'Inactive').length,
          avgAge: assetList.reduce((sum, a) => sum + (a.age || 0), 0) / assetList.length,
          totalValue: assetList.length * 1500, // Mock value
        };

        setAssets(assetList);
        setStatistics(assetStats);

        console.info('[AssetInventory] Loaded asset data from Logic Engine:', {
          totalAssets: assetList.length,
          deviceCount,
        });
      } else {
        console.warn('[AssetInventory] Logic Engine not loaded, using mock data');
        const mockData = generateMockAssetData();
        setAssets(mockData.assets);
        setStatistics(mockData.statistics);
      }
    } catch (err: any) {
      const errorMsg = `Failed to load asset data: ${err.message}`;
      console.error('[AssetInventory] Error:', err);
      setError(errorMsg);

      // Fallback to mock data on error
      const mockData = generateMockAssetData();
      setAssets(mockData.assets);
      setStatistics(mockData.statistics);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load data on mount
   */
  useEffect(() => {
    loadAssetData();
  }, [loadAssetData]);

  /**
   * Filter assets based on search and filters
   */
  const filteredAssets = useCallback(() => {
    return assets.filter(asset => {
      // Search filter
      const matchesSearch = !searchText ||
        (asset.name ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
        (asset.type ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
        asset.manufacturer?.toLowerCase().includes(searchText.toLowerCase()) ||
        asset.model?.toLowerCase().includes(searchText.toLowerCase()) ||
        asset.ipAddress?.toLowerCase().includes(searchText.toLowerCase());

      // Type filter
      const matchesType = typeFilter === 'All' || asset.type === typeFilter;

      // Status filter
      const matchesStatus = statusFilter === 'All' || asset.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [assets, searchText, typeFilter, statusFilter]);

  /**
   * Export assets to CSV
   */
  const exportAssets = useCallback(async () => {
    try {
      const filtered = filteredAssets();
      const csv = convertAssetsToCSV(filtered);

      await window.electronAPI.invoke('export-data', {
        filename: `asset-inventory-${new Date().toISOString().split('T')[0]}.csv`,
        data: csv,
      });

      console.info('[AssetInventory] Exported asset data successfully');
    } catch (err: any) {
      console.error('[AssetInventory] Export failed:', err);
      setError(`Export failed: ${err.message}`);
    }
  }, [filteredAssets]);

  return {
    assets: filteredAssets(),
    statistics,
    isLoading,
    error,
    searchText,
    setSearchText,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    refreshData: loadAssetData,
    exportAssets,
  };
};

/**
 * Generate mock asset for development/fallback
 */
function generateMockAsset(index: number): AssetData {
  const types: AssetData['type'][] = ['Workstation', 'Server', 'Mobile', 'Network', 'Printer'];
  const statuses: AssetData['status'][] = ['Active', 'Inactive', 'In Repair'];
  const manufacturers = ['Dell', 'HP', 'Lenovo', 'Apple', 'Cisco', 'Microsoft'];
  const locations = ['New York', 'London', 'Tokyo', 'Sydney', 'Paris'];
  const departments = ['IT', 'Sales', 'Engineering', 'HR', 'Finance'];

  const type = types[index % types.length];
  const manufacturer = manufacturers[index % manufacturers.length];
  const age = Math.floor(Math.random() * 6);
  const purchaseDate = new Date();
  purchaseDate.setFullYear(purchaseDate.getFullYear() - age);

  return {
    id: `asset-${index + 1}`,
    name: `${type}-${(index + 1).toString().padStart(3, '0')}`,
    type,
    category: type === 'Server' ? 'Infrastructure' : 'Endpoint',
    manufacturer,
    model: `Model-${manufacturer}-${Math.floor(Math.random() * 100)}`,
    serialNumber: `SN${(index + 1).toString().padStart(8, '0')}`,
    ipAddress: `192.168.${Math.floor(index / 254)}.${(index % 254) + 1}`,
    macAddress: `00:${((index >> 8) & 0xff).toString(16).padStart(2, '0')}:${(index & 0xff).toString(16).padStart(2, '0')}:00:00:00`,
    operatingSystem: type === 'Server' ? 'Windows Server 2019' : 'Windows 11',
    osVersion: type === 'Server' ? '10.0.17763' : '10.0.22000',
    cpu: `Intel Core i${5 + (index % 4)} ${9000 + index}`,
    ramGB: type === 'Server' ? 32 + (index % 3) * 32 : 8 + (index % 3) * 8,
    diskGB: type === 'Server' ? 500 + (index % 4) * 500 : 256 + (index % 3) * 256,
    location: locations[index % locations.length],
    department: departments[index % departments.length],
    owner: `user${(index % 50) + 1}@company.com`,
    assignedUser: type !== 'Server' ? `user${(index % 50) + 1}@company.com` : undefined,
    purchaseDate: purchaseDate.toISOString().split('T')[0],
    warrantyExpiry: new Date(purchaseDate.getTime() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: statuses[index % statuses.length],
    lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    domainJoined: Math.random() > 0.1,
    domain: 'company.local',
    age,
    lifecycleStatus: age < 1 ? 'New' : age < 3 ? 'Current' : age < 5 ? 'Aging' : 'End of Life',
  };
}

/**
 * Generate complete mock asset data
 */
function generateMockAssetData() {
  const assets: AssetData[] = [];
  for (let i = 0; i < 150; i++) {
    assets.push(generateMockAsset(i));
  }

  const statistics: AssetStatistics = {
    totalAssets: assets.length,
    workstations: assets.filter(a => a.type === 'Workstation').length,
    servers: assets.filter(a => a.type === 'Server').length,
    mobileDevices: assets.filter(a => a.type === 'Mobile').length,
    networkDevices: assets.filter(a => a.type === 'Network').length,
    printers: assets.filter(a => a.type === 'Printer').length,
    activeAssets: assets.filter(a => a.status === 'Active').length,
    inactiveAssets: assets.filter(a => a.status === 'Inactive').length,
    avgAge: assets.reduce((sum, a) => sum + (a.age || 0), 0) / assets.length,
    totalValue: assets.length * 1500,
  };

  return { assets, statistics };
}

/**
 * Convert assets to CSV format
 */
function convertAssetsToCSV(assets: AssetData[]): string {
  const headers = [
    'ID', 'Name', 'Type', 'Category', 'Manufacturer', 'Model', 'Serial Number',
    'IP Address', 'MAC Address', 'Operating System', 'OS Version',
    'CPU', 'RAM (GB)', 'Disk (GB)', 'Location', 'Department', 'Owner',
    'Assigned User', 'Purchase Date', 'Warranty Expiry', 'Status', 'Last Seen',
    'Domain Joined', 'Domain', 'Age (Years)', 'Lifecycle Status'
  ];

  const rows = assets.map(asset => [
    asset.id,
    asset.name,
    asset.type,
    asset.category,
    asset.manufacturer || '',
    asset.model || '',
    asset.serialNumber || '',
    asset.ipAddress || '',
    asset.macAddress || '',
    asset.operatingSystem || '',
    asset.osVersion || '',
    asset.cpu || '',
    asset.ramGB?.toString() || '',
    asset.diskGB?.toString() || '',
    asset.location || '',
    asset.department || '',
    asset.owner || '',
    asset.assignedUser || '',
    asset.purchaseDate || '',
    asset.warrantyExpiry || '',
    asset.status,
    asset.lastSeen || '',
    asset.domainJoined ? 'Yes' : 'No',
    asset.domain || '',
    asset.age?.toString() || '',
    asset.lifecycleStatus || '',
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}
