import { useState, useEffect, useCallback } from 'react';

/**
 * Custom fields data model
 */
export interface CustomFieldData {
  id: string;
  name: string;
  label: string;
  type: 'Text' | 'Number' | 'Date' | 'Boolean' | 'Select' | 'Multiselect' | 'Email' | 'URL';
  required: boolean;
  entityType: 'User' | 'Asset' | 'Group' | 'Application' | 'Device' | 'Organization';
  options?: string[]; // For select/multiselect fields
  defaultValue?: any;
  validation?: string; // Regex pattern or validation rules
  description?: string;
  createdBy: string;
  createdDate: string;
  isActive: boolean;
  usageCount: number; // How many records use this field
}

/**
 * Custom hook for custom fields logic
 */
export const useCustomFieldsLogic = () => {
  const [data, setData] = useState<CustomFieldData[]>([]);
  const [selectedItems, setSelectedItems] = useState<CustomFieldData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [searchText, setSearchText] = useState('');

  /**
   * Load custom fields data
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock data loading - replace with actual API calls
      const mockData = generateMockCustomFieldsData();
      setData(mockData);

      console.info('[CustomFields] Loaded custom fields data');
    } catch (err: any) {
      const errorMsg = `Failed to load custom fields data: ${err.message}`;
      console.error('[CustomFields] Error:', err);
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
    return (data ?? []).filter(field => {
      return !searchText ||
        (field.name ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
        (field.label ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
        (field.entityType ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
        (field.type ?? '').toLowerCase().includes(searchText.toLowerCase());
    });
  }, [data, searchText]);

  /**
   * Export custom fields data to CSV
   */
  const exportData = useCallback(async () => {
    try {
      const filtered = filteredData();
      const csv = convertCustomFieldsToCSV(filtered);

      await window.electronAPI.invoke('export-data', {
        filename: `custom-fields-${new Date().toISOString().split('T')[0]}.csv`,
        data: csv,
      });

      console.info('[CustomFields] Exported custom fields data successfully');
    } catch (err: any) {
      console.error('[CustomFields] Export failed:', err);
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
 * Generate mock custom fields data for development
 */
function generateMockCustomFieldsData(): CustomFieldData[] {
  const fields: CustomFieldData[] = [
    {
      id: 'custom-field-1',
      name: 'employee_id',
      label: 'Employee ID',
      type: 'Text',
      required: true,
      entityType: 'User',
      validation: '^[A-Z]{2}\\d{6}$',
      description: 'Company employee identification number',
      createdBy: 'admin@company.com',
      createdDate: '2023-01-15',
      isActive: true,
      usageCount: 1250,
    },
    {
      id: 'custom-field-2',
      name: 'budget_code',
      label: 'Budget Code',
      type: 'Select',
      required: false,
      entityType: 'Asset',
      options: ['IT-001', 'IT-002', 'HR-001', 'FIN-001', 'MKT-001'],
      defaultValue: 'IT-001',
      description: 'Cost center budget code for asset allocation',
      createdBy: 'finance-admin@company.com',
      createdDate: '2023-03-22',
      isActive: true,
      usageCount: 890,
    },
    {
      id: 'custom-field-3',
      name: 'compliance_level',
      label: 'Compliance Level',
      type: 'Select',
      required: true,
      entityType: 'Application',
      options: ['Standard', 'Enhanced', 'High', 'Critical'],
      defaultValue: 'Standard',
      description: 'Security compliance requirements level',
      createdBy: 'security-admin@company.com',
      createdDate: '2023-02-08',
      isActive: true,
      usageCount: 67,
    },
    {
      id: 'custom-field-4',
      name: 'warranty_expiry',
      label: 'Warranty Expiry Date',
      type: 'Date',
      required: false,
      entityType: 'Asset',
      description: 'Asset warranty expiration date',
      createdBy: 'procurement@company.com',
      createdDate: '2023-04-10',
      isActive: true,
      usageCount: 543,
    },
    {
      id: 'custom-field-5',
      name: 'is_remote_enabled',
      label: 'Remote Access Enabled',
      type: 'Boolean',
      required: false,
      entityType: 'Device',
      defaultValue: false,
      description: 'Whether device allows remote access',
      createdBy: 'it-admin@company.com',
      createdDate: '2023-05-03',
      isActive: true,
      usageCount: 324,
    },
    {
      id: 'custom-field-6',
      name: 'vendor_contact',
      label: 'Vendor Contact Email',
      type: 'Email',
      required: false,
      entityType: 'Asset',
      description: 'Primary vendor contact for support',
      createdBy: 'vendor-mgmt@company.com',
      createdDate: '2023-06-15',
      isActive: true,
      usageCount: 156,
    },
    {
      id: 'custom-field-7',
      name: 'department_tags',
      label: 'Department Tags',
      type: 'Multiselect',
      required: false,
      entityType: 'Group',
      options: ['IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations'],
      description: 'Departments that use this group',
      createdBy: 'org-admin@company.com',
      createdDate: '2023-07-20',
      isActive: false,
      usageCount: 0,
    },
  ];

  return fields;
}

/**
 * Convert custom fields data to CSV format
 */
function convertCustomFieldsToCSV(fields: CustomFieldData[]): string {
  const headers = [
    'ID', 'Name', 'Label', 'Type', 'Required', 'Entity Type',
    'Options', 'Default Value', 'Validation', 'Description',
    'Created By', 'Created Date', 'Is Active', 'Usage Count'
  ];

  const rows = fields.map(field => [
    field.id,
    field.name,
    field.label,
    field.type,
    field.required ? 'Yes' : 'No',
    field.entityType,
    field.options?.join('; ') || '',
    field.defaultValue?.toString() || '',
    field.validation || '',
    field.description || '',
    field.createdBy,
    field.createdDate,
    field.isActive ? 'Yes' : 'No',
    field.usageCount.toString(),
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}