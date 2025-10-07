import { useState, useEffect, useCallback } from 'react';

/**
 * Cloud migration planner data model
 */
export interface CloudMigrationData {
  id: string;
  application: string;
  currentEnvironment: 'On-Premises' | 'Private Cloud' | 'Hybrid';
  targetCloud: 'AWS' | 'Azure' | 'GCP' | 'IBM Cloud' | 'Oracle Cloud';
  migrationStrategy: 'Rehost' | 'Refactor' | 'Rearchitect' | 'Rebuild' | 'Replace';
  complexity: 'Low' | 'Medium' | 'High' | 'Very High';
  estimatedCost: number;
  estimatedDuration: number; // months
  status: 'Planning' | 'Assessment' | 'Migration' | 'Testing' | 'Completed' | 'On Hold';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dependencies?: string[];
  risks?: string[];
  businessValue: number; // ROI percentage
}

/**
 * Custom hook for cloud migration planner logic
 */
export const useCloudMigrationPlannerLogic = () => {
  const [data, setData] = useState<CloudMigrationData[]>([]);
  const [selectedItems, setSelectedItems] = useState<CloudMigrationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [searchText, setSearchText] = useState('');

  /**
   * Load cloud migration planner data
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock data loading - replace with actual API calls
      const mockData = generateMockCloudMigrationData();
      setData(mockData);

      console.info('[CloudMigrationPlanner] Loaded cloud migration data');
    } catch (err: any) {
      const errorMsg = `Failed to load cloud migration data: ${err.message}`;
      console.error('[CloudMigrationPlanner] Error:', err);
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
    return data.filter(migration => {
      return !searchText ||
        migration.application.toLowerCase().includes(searchText.toLowerCase()) ||
        migration.targetCloud.toLowerCase().includes(searchText.toLowerCase()) ||
        migration.status.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [data, searchText]);

  /**
   * Export cloud migration data to CSV
   */
  const exportData = useCallback(async () => {
    try {
      const filtered = filteredData();
      const csv = convertCloudMigrationToCSV(filtered);

      await window.electronAPI.invoke('export-data', {
        filename: `cloud-migration-planner-${new Date().toISOString().split('T')[0]}.csv`,
        data: csv,
      });

      console.info('[CloudMigrationPlanner] Exported cloud migration data successfully');
    } catch (err: any) {
      console.error('[CloudMigrationPlanner] Export failed:', err);
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
 * Generate mock cloud migration data for development
 */
function generateMockCloudMigrationData(): CloudMigrationData[] {
  const migrations: CloudMigrationData[] = [
    {
      id: 'migration-1',
      application: 'HR Management System',
      currentEnvironment: 'On-Premises',
      targetCloud: 'Azure',
      migrationStrategy: 'Refactor',
      complexity: 'High',
      estimatedCost: 250000,
      estimatedDuration: 8,
      status: 'Assessment',
      priority: 'High',
      dependencies: ['Employee Database', 'Active Directory'],
      risks: ['Data compliance requirements', 'Integration complexity'],
      businessValue: 35,
    },
    {
      id: 'migration-2',
      application: 'E-commerce Platform',
      currentEnvironment: 'Private Cloud',
      targetCloud: 'AWS',
      migrationStrategy: 'Rehost',
      complexity: 'Medium',
      estimatedCost: 180000,
      estimatedDuration: 4,
      status: 'Migration',
      priority: 'Critical',
      dependencies: ['Payment Gateway', 'Inventory System'],
      risks: ['Downtime during migration'],
      businessValue: 65,
    },
    {
      id: 'migration-3',
      application: 'Analytics Dashboard',
      currentEnvironment: 'On-Premises',
      targetCloud: 'GCP',
      migrationStrategy: 'Rearchitect',
      complexity: 'Very High',
      estimatedCost: 320000,
      estimatedDuration: 12,
      status: 'Planning',
      priority: 'Medium',
      dependencies: ['Data Warehouse', 'ML Models'],
      risks: ['Performance requirements', 'Cost optimization'],
      businessValue: 45,
    },
    {
      id: 'migration-4',
      application: 'Document Management System',
      currentEnvironment: 'Hybrid',
      targetCloud: 'Azure',
      migrationStrategy: 'Rehost',
      complexity: 'Low',
      estimatedCost: 95000,
      estimatedDuration: 3,
      status: 'Testing',
      priority: 'Medium',
      dependencies: ['File Storage', 'Search Index'],
      risks: ['Data migration volume'],
      businessValue: 25,
    },
    {
      id: 'migration-5',
      application: 'Legacy CRM System',
      currentEnvironment: 'On-Premises',
      targetCloud: 'AWS',
      migrationStrategy: 'Replace',
      complexity: 'High',
      estimatedCost: 400000,
      estimatedDuration: 10,
      status: 'On Hold',
      priority: 'Low',
      dependencies: ['Customer Database', 'Email Integration'],
      risks: ['Business process changes', 'User training'],
      businessValue: 55,
    },
    {
      id: 'migration-6',
      application: 'DevOps Pipeline',
      currentEnvironment: 'On-Premises',
      targetCloud: 'Azure',
      migrationStrategy: 'Rebuild',
      complexity: 'Medium',
      estimatedCost: 150000,
      estimatedDuration: 6,
      status: 'Completed',
      priority: 'High',
      dependencies: ['Version Control', 'CI/CD Tools'],
      risks: ['Tool compatibility'],
      businessValue: 40,
    },
  ];

  return migrations;
}

/**
 * Convert cloud migration data to CSV format
 */
function convertCloudMigrationToCSV(migrations: CloudMigrationData[]): string {
  const headers = [
    'ID', 'Application', 'Current Environment', 'Target Cloud',
    'Migration Strategy', 'Complexity', 'Estimated Cost', 'Estimated Duration (months)',
    'Status', 'Priority', 'Dependencies', 'Risks', 'Business Value (%)'
  ];

  const rows = migrations.map(migration => [
    migration.id,
    migration.application,
    migration.currentEnvironment,
    migration.targetCloud,
    migration.migrationStrategy,
    migration.complexity,
    migration.estimatedCost.toString(),
    migration.estimatedDuration.toString(),
    migration.status,
    migration.priority,
    migration.dependencies?.join('; ') || '',
    migration.risks?.join('; ') || '',
    migration.businessValue.toString(),
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}