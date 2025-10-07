import { useState, useEffect, useCallback } from 'react';

/**
 * Change management data model
 */
export interface ChangeManagementData {
  id: string;
  title: string;
  type: 'Software Update' | 'Hardware Change' | 'Configuration Change' | 'Security Patch' | 'Infrastructure Change';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Draft' | 'Submitted' | 'Approved' | 'Scheduled' | 'In Progress' | 'Completed' | 'Rejected' | 'Rolled Back';
  requestedBy: string;
  approvedBy?: string;
  scheduledDate?: string;
  completedDate?: string;
  impact: 'No Impact' | 'Low' | 'Medium' | 'High' | 'Very High';
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  rollbackPlan: boolean;
  testingRequired: boolean;
}

/**
 * Custom hook for change management logic
 */
export const useChangeManagementLogic = () => {
  const [data, setData] = useState<ChangeManagementData[]>([]);
  const [selectedItems, setSelectedItems] = useState<ChangeManagementData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [searchText, setSearchText] = useState('');

  /**
   * Load change management data
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock data loading - replace with actual API calls
      const mockData = generateMockChangeManagementData();
      setData(mockData);

      console.info('[ChangeManagement] Loaded change management data');
    } catch (err: any) {
      const errorMsg = `Failed to load change management data: ${err.message}`;
      console.error('[ChangeManagement] Error:', err);
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
    return data.filter(change => {
      return !searchText ||
        change.title.toLowerCase().includes(searchText.toLowerCase()) ||
        change.type.toLowerCase().includes(searchText.toLowerCase()) ||
        change.status.toLowerCase().includes(searchText.toLowerCase()) ||
        change.requestedBy.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [data, searchText]);

  /**
   * Export change management data to CSV
   */
  const exportData = useCallback(async () => {
    try {
      const filtered = filteredData();
      const csv = convertChangeManagementToCSV(filtered);

      await window.electronAPI.invoke('export-data', {
        filename: `change-management-${new Date().toISOString().split('T')[0]}.csv`,
        data: csv,
      });

      console.info('[ChangeManagement] Exported change management data successfully');
    } catch (err: any) {
      console.error('[ChangeManagement] Export failed:', err);
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
 * Generate mock change management data for development
 */
function generateMockChangeManagementData(): ChangeManagementData[] {
  const changes: ChangeManagementData[] = [
    {
      id: 'change-1',
      title: 'Windows Server 2022 Feature Update',
      type: 'Software Update',
      priority: 'High',
      status: 'Scheduled',
      requestedBy: 'it-admin@company.com',
      scheduledDate: new Date(Date.now() + 86400000).toISOString(),
      impact: 'Medium',
      risk: 'Medium',
      rollbackPlan: true,
      testingRequired: true,
    },
    {
      id: 'change-2',
      title: 'Firewall Rule Update - Remote Access',
      type: 'Security Patch',
      priority: 'Critical',
      status: 'Approved',
      requestedBy: 'security-team@company.com',
      approvedBy: 'ciso@company.com',
      scheduledDate: new Date(Date.now() + 3600000).toISOString(),
      impact: 'Low',
      risk: 'Low',
      rollbackPlan: true,
      testingRequired: false,
    },
    {
      id: 'change-3',
      title: 'Database Server Memory Upgrade',
      type: 'Hardware Change',
      priority: 'Medium',
      status: 'In Progress',
      requestedBy: 'db-admin@company.com',
      approvedBy: 'it-director@company.com',
      scheduledDate: new Date(Date.now() - 1800000).toISOString(),
      impact: 'High',
      risk: 'Medium',
      rollbackPlan: true,
      testingRequired: true,
    },
    {
      id: 'change-4',
      title: 'VPN Configuration Update',
      type: 'Configuration Change',
      priority: 'High',
      status: 'Completed',
      requestedBy: 'network-admin@company.com',
      approvedBy: 'it-manager@company.com',
      scheduledDate: new Date(Date.now() - 86400000).toISOString(),
      completedDate: new Date(Date.now() - 7200000).toISOString(),
      impact: 'Medium',
      risk: 'Low',
      rollbackPlan: true,
      testingRequired: true,
    },
    {
      id: 'change-5',
      title: 'Legacy Application Decommission',
      type: 'Infrastructure Change',
      priority: 'Low',
      status: 'Rejected',
      requestedBy: 'app-owner@company.com',
      approvedBy: 'change-board@company.com',
      impact: 'Low',
      risk: 'Low',
      rollbackPlan: false,
      testingRequired: false,
    },
    {
      id: 'change-6',
      title: 'Critical Security Patch Deployment',
      type: 'Security Patch',
      priority: 'Critical',
      status: 'Draft',
      requestedBy: 'security-team@company.com',
      impact: 'Very High',
      risk: 'Critical',
      rollbackPlan: true,
      testingRequired: true,
    },
  ];

  return changes;
}

/**
 * Convert change management data to CSV format
 */
function convertChangeManagementToCSV(changes: ChangeManagementData[]): string {
  const headers = [
    'ID', 'Title', 'Type', 'Priority', 'Status', 'Requested By',
    'Approved By', 'Scheduled Date', 'Completed Date', 'Impact',
    'Risk', 'Rollback Plan', 'Testing Required'
  ];

  const rows = changes.map(change => [
    change.id,
    change.title,
    change.type,
    change.priority,
    change.status,
    change.requestedBy,
    change.approvedBy || '',
    change.scheduledDate || '',
    change.completedDate || '',
    change.impact,
    change.risk,
    change.rollbackPlan ? 'Yes' : 'No',
    change.testingRequired ? 'Yes' : 'No',
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}