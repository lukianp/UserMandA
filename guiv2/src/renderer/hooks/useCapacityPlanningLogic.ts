import { useState, useEffect, useCallback } from 'react';

/**
 * Capacity planning data model
 */
export interface CapacityPlanningData {
  id: string;
  resource: string;
  type: 'CPU' | 'Memory' | 'Storage' | 'Network' | 'Power' | 'Cooling';
  currentUsage: number; // percentage
  maxCapacity: number;
  currentCapacity: number;
  predictedUsage: number; // percentage in 6 months
  growthRate: number; // percentage per month
  threshold: number; // percentage
  status: 'Optimal' | 'Warning' | 'Critical' | 'Overloaded';
  recommendedAction?: string;
  timeToCapacity?: number; // months until capacity reached
}

/**
 * Custom hook for capacity planning logic
 */
export const useCapacityPlanningLogic = () => {
  const [data, setData] = useState<CapacityPlanningData[]>([]);
  const [selectedItems, setSelectedItems] = useState<CapacityPlanningData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [searchText, setSearchText] = useState('');

  /**
   * Load capacity planning data
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock data loading - replace with actual API calls
      const mockData = generateMockCapacityPlanningData();
      setData(mockData);

      console.info('[CapacityPlanning] Loaded capacity planning data');
    } catch (err: any) {
      const errorMsg = `Failed to load capacity planning data: ${err.message}`;
      console.error('[CapacityPlanning] Error:', err);
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
    return data.filter(resource => {
      return !searchText ||
        resource.resource.toLowerCase().includes(searchText.toLowerCase()) ||
        resource.type.toLowerCase().includes(searchText.toLowerCase()) ||
        resource.status.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [data, searchText]);

  /**
   * Export capacity planning data to CSV
   */
  const exportData = useCallback(async () => {
    try {
      const filtered = filteredData();
      const csv = convertCapacityPlanningToCSV(filtered);

      await window.electronAPI.invoke('export-data', {
        filename: `capacity-planning-${new Date().toISOString().split('T')[0]}.csv`,
        data: csv,
      });

      console.info('[CapacityPlanning] Exported capacity planning data successfully');
    } catch (err: any) {
      console.error('[CapacityPlanning] Export failed:', err);
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
 * Generate mock capacity planning data for development
 */
function generateMockCapacityPlanningData(): CapacityPlanningData[] {
  const resources: CapacityPlanningData[] = [
    {
      id: 'capacity-1',
      resource: 'Primary Database Server CPU',
      type: 'CPU',
      currentUsage: 78,
      maxCapacity: 100,
      currentCapacity: 32, // cores
      predictedUsage: 92,
      growthRate: 2.1,
      threshold: 85,
      status: 'Warning',
      recommendedAction: 'Plan for CPU upgrade in Q2',
      timeToCapacity: 8,
    },
    {
      id: 'capacity-2',
      resource: 'Main Data Center Memory',
      type: 'Memory',
      currentUsage: 65,
      maxCapacity: 100,
      currentCapacity: 2048, // GB
      predictedUsage: 88,
      growthRate: 1.8,
      threshold: 90,
      status: 'Optimal',
      timeToCapacity: 15,
    },
    {
      id: 'capacity-3',
      resource: 'SAN Storage Array',
      type: 'Storage',
      currentUsage: 89,
      maxCapacity: 100,
      currentCapacity: 100, // TB
      predictedUsage: 105,
      growthRate: 3.2,
      threshold: 85,
      status: 'Critical',
      recommendedAction: 'Immediate storage expansion required',
      timeToCapacity: 2,
    },
    {
      id: 'capacity-4',
      resource: 'Core Network Bandwidth',
      type: 'Network',
      currentUsage: 45,
      maxCapacity: 100,
      currentCapacity: 10, // Gbps
      predictedUsage: 72,
      growthRate: 4.5,
      threshold: 80,
      status: 'Optimal',
      timeToCapacity: 22,
    },
    {
      id: 'capacity-5',
      resource: 'Data Center Power',
      type: 'Power',
      currentUsage: 94,
      maxCapacity: 100,
      currentCapacity: 500, // kW
      predictedUsage: 110,
      growthRate: 2.8,
      threshold: 95,
      status: 'Critical',
      recommendedAction: 'Power infrastructure upgrade needed',
      timeToCapacity: 1,
    },
    {
      id: 'capacity-6',
      resource: 'HVAC Cooling Capacity',
      type: 'Cooling',
      currentUsage: 58,
      maxCapacity: 100,
      currentCapacity: 200, // tons
      predictedUsage: 85,
      growthRate: 1.5,
      threshold: 75,
      status: 'Optimal',
      timeToCapacity: 18,
    },
  ];

  return resources;
}

/**
 * Convert capacity planning data to CSV format
 */
function convertCapacityPlanningToCSV(resources: CapacityPlanningData[]): string {
  const headers = [
    'ID', 'Resource', 'Type', 'Current Usage (%)', 'Max Capacity',
    'Current Capacity', 'Predicted Usage (%)', 'Growth Rate (%/month)',
    'Threshold (%)', 'Status', 'Recommended Action', 'Time to Capacity (months)'
  ];

  const rows = resources.map(resource => [
    resource.id,
    resource.resource,
    resource.type,
    resource.currentUsage.toString(),
    resource.maxCapacity.toString(),
    resource.currentCapacity.toString(),
    resource.predictedUsage.toString(),
    resource.growthRate.toString(),
    resource.threshold.toString(),
    resource.status,
    resource.recommendedAction || '',
    resource.timeToCapacity?.toString() || '',
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}