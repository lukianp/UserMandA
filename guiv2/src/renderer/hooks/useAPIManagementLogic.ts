import { useState, useEffect, useCallback } from 'react';

/**
 * API Management data model
 */
export interface APIData {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'Active' | 'Inactive' | 'Deprecated';
  version: string;
  lastUsed?: string;
  responseTime?: number;
  errorRate?: number;
}

/**
 * Custom hook for API management logic
 */
export const useAPIManagementLogic = () => {
  const [data, setData] = useState<APIData[]>([]);
  const [selectedItems, setSelectedItems] = useState<APIData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [searchText, setSearchText] = useState('');

  /**
   * Load API management data
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock data loading - replace with actual API calls
      const mockData = generateMockAPIData();
      setData(mockData);

      console.info('[APIManagement] Loaded API data');
    } catch (err: any) {
      const errorMsg = `Failed to load API data: ${err.message}`;
      console.error('[APIManagement] Error:', err);
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
    return data.filter(api => {
      return !searchText ||
        api.name.toLowerCase().includes(searchText.toLowerCase()) ||
        api.endpoint.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [data, searchText]);

  /**
   * Export API data to CSV
   */
  const exportData = useCallback(async () => {
    try {
      const filtered = filteredData();
      const csv = convertAPIsToCSV(filtered);

      await window.electronAPI.invoke('export-data', {
        filename: `api-management-${new Date().toISOString().split('T')[0]}.csv`,
        data: csv,
      });

      console.info('[APIManagement] Exported API data successfully');
    } catch (err: any) {
      console.error('[APIManagement] Export failed:', err);
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
 * Generate mock API data for development
 */
function generateMockAPIData(): APIData[] {
  const apis: APIData[] = [
    {
      id: 'api-1',
      name: 'User Management API',
      endpoint: '/api/users',
      method: 'GET',
      status: 'Active',
      version: 'v2.1',
      lastUsed: new Date().toISOString(),
      responseTime: 125,
      errorRate: 0.02,
    },
    {
      id: 'api-2',
      name: 'Asset Inventory API',
      endpoint: '/api/assets',
      method: 'POST',
      status: 'Active',
      version: 'v1.8',
      lastUsed: new Date(Date.now() - 3600000).toISOString(),
      responseTime: 89,
      errorRate: 0.01,
    },
    {
      id: 'api-3',
      name: 'Compliance Report API',
      endpoint: '/api/compliance/reports',
      method: 'GET',
      status: 'Active',
      version: 'v1.5',
      lastUsed: new Date(Date.now() - 7200000).toISOString(),
      responseTime: 234,
      errorRate: 0.05,
    },
    {
      id: 'api-4',
      name: 'Legacy User API',
      endpoint: '/api/v1/users',
      method: 'GET',
      status: 'Deprecated',
      version: 'v1.0',
      lastUsed: new Date(Date.now() - 86400000).toISOString(),
      responseTime: 456,
      errorRate: 0.12,
    },
  ];

  return apis;
}

/**
 * Convert APIs to CSV format
 */
function convertAPIsToCSV(apis: APIData[]): string {
  const headers = [
    'ID', 'Name', 'Endpoint', 'Method', 'Status', 'Version',
    'Last Used', 'Response Time (ms)', 'Error Rate (%)'
  ];

  const rows = apis.map(api => [
    api.id,
    api.name,
    api.endpoint,
    api.method,
    api.status,
    api.version,
    api.lastUsed || '',
    api.responseTime?.toString() || '',
    api.errorRate ? (api.errorRate * 100).toString() : '',
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}