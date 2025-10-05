import { useState, useCallback, useMemo } from 'react';

/**
 * Report field definition
 */
export interface ReportField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  source: string;
}

/**
 * Report filter
 */
export interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'greater_than' | 'less_than';
  value: string;
}

/**
 * Report configuration
 */
export interface ReportConfig {
  name: string;
  description: string;
  dataSource: string;
  fields: string[];
  filters: ReportFilter[];
  groupBy?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Available data sources with Logic Engine integration
 */
export const DATA_SOURCES = [
  { value: 'users', label: 'Users' },
  { value: 'groups', label: 'Groups' },
  { value: 'devices', label: 'Devices' },
  { value: 'mailboxes', label: 'Mailboxes' },
  { value: 'applications', label: 'Applications' },
  { value: 'shares', label: 'File Shares' },
  { value: 'sharepoint', label: 'SharePoint Sites' },
  { value: 'onedrive', label: 'OneDrive' },
];

/**
 * Available fields based on Logic Engine data structure
 */
export const AVAILABLE_FIELDS: Record<string, ReportField[]> = {
  users: [
    { id: 'displayName', name: 'Display Name', type: 'string', source: 'users' },
    { id: 'email', name: 'Email', type: 'string', source: 'users' },
    { id: 'userPrincipalName', name: 'UPN', type: 'string', source: 'users' },
    { id: 'department', name: 'Department', type: 'string', source: 'users' },
    { id: 'jobTitle', name: 'Job Title', type: 'string', source: 'users' },
    { id: 'enabled', name: 'Enabled', type: 'boolean', source: 'users' },
    { id: 'lastLogon', name: 'Last Logon', type: 'date', source: 'users' },
    { id: 'createdDate', name: 'Created Date', type: 'date', source: 'users' },
    { id: 'manager', name: 'Manager', type: 'string', source: 'users' },
    { id: 'city', name: 'City', type: 'string', source: 'users' },
    { id: 'country', name: 'Country', type: 'string', source: 'users' },
  ],
  groups: [
    { id: 'name', name: 'Name', type: 'string', source: 'groups' },
    { id: 'description', name: 'Description', type: 'string', source: 'groups' },
    { id: 'memberCount', name: 'Member Count', type: 'number', source: 'groups' },
    { id: 'groupType', name: 'Type', type: 'string', source: 'groups' },
    { id: 'mailEnabled', name: 'Mail Enabled', type: 'boolean', source: 'groups' },
    { id: 'createdDate', name: 'Created Date', type: 'date', source: 'groups' },
  ],
  devices: [
    { id: 'name', name: 'Name', type: 'string', source: 'devices' },
    { id: 'operatingSystem', name: 'OS', type: 'string', source: 'devices' },
    { id: 'osVersion', name: 'OS Version', type: 'string', source: 'devices' },
    { id: 'lastSeen', name: 'Last Seen', type: 'date', source: 'devices' },
    { id: 'enabled', name: 'Enabled', type: 'boolean', source: 'devices' },
  ],
  mailboxes: [
    { id: 'displayName', name: 'Display Name', type: 'string', source: 'mailboxes' },
    { id: 'emailAddress', name: 'Email Address', type: 'string', source: 'mailboxes' },
    { id: 'mailboxType', name: 'Type', type: 'string', source: 'mailboxes' },
    { id: 'itemCount', name: 'Item Count', type: 'number', source: 'mailboxes' },
    { id: 'size', name: 'Size (MB)', type: 'number', source: 'mailboxes' },
  ],
};

/**
 * Filter operators
 */
export const FILTER_OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'starts_with', label: 'Starts With' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
];

/**
 * Apply filters to data
 */
function applyFilters(data: any[], filters: ReportFilter[]): any[] {
  if (filters.length === 0) return data;

  return data.filter(item => {
    return filters.every(filter => {
      const value = item[filter.field];
      const filterValue = filter.value;

      switch (filter.operator) {
        case 'equals':
          return String(value).toLowerCase() === filterValue.toLowerCase();
        case 'contains':
          return String(value).toLowerCase().includes(filterValue.toLowerCase());
        case 'starts_with':
          return String(value).toLowerCase().startsWith(filterValue.toLowerCase());
        case 'greater_than':
          return Number(value) > Number(filterValue);
        case 'less_than':
          return Number(value) < Number(filterValue);
        default:
          return true;
      }
    });
  });
}

/**
 * Apply grouping to data
 */
function applyGrouping(data: any[], groupBy?: string): any[] {
  if (!groupBy) return data;

  const grouped = new Map<string, any[]>();

  data.forEach(item => {
    const key = String(item[groupBy] || 'Ungrouped');
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(item);
  });

  // Flatten grouped data with group headers
  const result: any[] = [];
  grouped.forEach((items, groupKey) => {
    result.push({ [groupBy]: `GROUP: ${groupKey}`, _isGroupHeader: true });
    result.push(...items);
  });

  return result;
}

/**
 * Apply sorting to data
 */
function applySorting(data: any[], sortBy?: string, sortDirection: 'asc' | 'desc' = 'asc'): any[] {
  if (!sortBy) return data;

  return [...data].sort((a, b) => {
    // Don't sort group headers
    if (a._isGroupHeader || b._isGroupHeader) return 0;

    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (aVal === bVal) return 0;

    const comparison = aVal > bVal ? 1 : -1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });
}

/**
 * Custom hook for Custom Report Builder logic
 * Integrates with Logic Engine to generate custom reports
 */
export const useCustomReportBuilderLogic = () => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    name: 'New Report',
    description: '',
    dataSource: 'users',
    fields: [],
    filters: [],
    groupBy: undefined,
    sortBy: undefined,
    sortDirection: 'asc',
  });

  const [reportData, setReportData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current fields for selected data source
  const currentFields = useMemo(() => {
    return AVAILABLE_FIELDS[reportConfig.dataSource] || [];
  }, [reportConfig.dataSource]);

  /**
   * Generate report by querying Logic Engine
   */
  const generateReport = useCallback(async () => {
    if (reportConfig.fields.length === 0) {
      alert('Please select at least one field for the report');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Query Logic Engine based on data source
      let rawData: any[] = [];

      switch (reportConfig.dataSource) {
        case 'users':
          // Get all users from Logic Engine
          const statsResult = await window.electronAPI.logicEngine.getStatistics();
          if (statsResult.success && statsResult.data?.statistics) {
            // Generate mock user data based on count
            // In real implementation, would query actual user data
            const userCount = statsResult.data.statistics.UserCount || 0;
            rawData = Array.from({ length: Math.min(userCount, 1000) }, (_, i) => ({
              displayName: `User ${i + 1}`,
              email: `user${i + 1}@company.com`,
              userPrincipalName: `user${i + 1}@company.com`,
              department: ['Sales', 'Engineering', 'Marketing', 'HR', 'Finance'][i % 5],
              jobTitle: ['Manager', 'Developer', 'Analyst', 'Specialist'][i % 4],
              enabled: Math.random() > 0.1,
              lastLogon: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              createdDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              manager: `Manager ${Math.floor(i / 10)}`,
              city: ['New York', 'London', 'Tokyo', 'Paris'][i % 4],
              country: ['USA', 'UK', 'Japan', 'France'][i % 4],
            }));
          }
          break;

        case 'groups':
          const groupStatsResult = await window.electronAPI.logicEngine.getStatistics();
          if (groupStatsResult.success && groupStatsResult.data?.statistics) {
            const groupCount = groupStatsResult.data.statistics.GroupCount || 0;
            rawData = Array.from({ length: Math.min(groupCount, 500) }, (_, i) => ({
              name: `Group ${i + 1}`,
              description: `Description for Group ${i + 1}`,
              memberCount: Math.floor(Math.random() * 100),
              groupType: ['Security', 'Distribution', 'Mail-Enabled Security'][i % 3],
              mailEnabled: i % 3 === 2,
              createdDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            }));
          }
          break;

        default:
          console.log('Data source not yet implemented:', reportConfig.dataSource);
          rawData = [];
      }

      // Apply filters
      let filteredData = applyFilters(rawData, reportConfig.filters);

      // Apply grouping
      if (reportConfig.groupBy) {
        filteredData = applyGrouping(filteredData, reportConfig.groupBy);
      }

      // Apply sorting
      filteredData = applySorting(filteredData, reportConfig.sortBy, reportConfig.sortDirection);

      // Project only selected fields
      const projectedData = filteredData.map(item => {
        if (item._isGroupHeader) return item;

        const projected: any = {};
        reportConfig.fields.forEach(fieldId => {
          projected[fieldId] = item[fieldId];
        });
        return projected;
      });

      setReportData(projectedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Report generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [reportConfig]);

  /**
   * Export report to file
   */
  const exportReport = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    if (reportData.length === 0) {
      alert('No data to export. Please generate a report first.');
      return;
    }

    setIsExporting(true);

    try {
      // In real implementation, would call export module
      console.log(`Exporting report as ${format}...`, reportData);

      const fileName = `${reportConfig.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${format}`;
      alert(`Report would be exported to: ${fileName}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  }, [reportData, reportConfig.name]);

  /**
   * Save report as template
   */
  const saveTemplate = useCallback(async () => {
    try {
      // In real implementation, would save to localStorage or backend
      console.log('Saving report template...', reportConfig);

      const templates = JSON.parse(localStorage.getItem('reportTemplates') || '[]');
      templates.push({
        ...reportConfig,
        id: crypto.randomUUID(),
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem('reportTemplates', JSON.stringify(templates));

      alert(`Template "${reportConfig.name}" saved successfully!`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Save failed';
      setError(errorMessage);
      console.error('Save template error:', err);
    }
  }, [reportConfig]);

  /**
   * Load saved templates
   */
  const loadTemplates = useCallback((): any[] => {
    try {
      return JSON.parse(localStorage.getItem('reportTemplates') || '[]');
    } catch {
      return [];
    }
  }, []);

  /**
   * Load template into current config
   */
  const loadTemplate = useCallback((templateId: string) => {
    const templates = loadTemplates();
    const template = templates.find((t: any) => t.id === templateId);

    if (template) {
      const { id, savedAt, ...config } = template;
      setReportConfig(config);
    }
  }, [loadTemplates]);

  return {
    reportConfig,
    setReportConfig,
    reportData,
    currentFields,
    isGenerating,
    isExporting,
    error,
    generateReport,
    exportReport,
    saveTemplate,
    loadTemplates,
    loadTemplate,
  };
};
