import { useState, useEffect, useCallback } from 'react';

/**
 * Report template data model
 */
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: string[];
  filters: Record<string, any>;
  format: 'pdf' | 'excel' | 'csv' | 'html';
  isActive: boolean;
  createdBy: string;
  createdDate: string;
  usageCount: number;
}

/**
 * Template usage statistics
 */
export interface TemplateUsageData {
  templateId: string;
  usageCount: number;
  lastUsed: string;
  averageGenerationTime: number;
}

/**
 * KPI data for report templates
 */
export interface TemplateKpi {
  label: string;
  value: number;
  change: number;
}

/**
 * Custom hook for report templates logic
 */
export const useReportTemplatesLogic = () => {
  const [data, setData] = useState<ReportTemplate[]>([]);
  const [chartData, setChartData] = useState<TemplateUsageData[]>([]);
  const [kpis, setKpis] = useState<TemplateKpi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  /**
   * Load report templates data
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock data loading - replace with actual API calls
      const mockData = generateMockReportTemplates();
      const mockChartData = generateMockTemplateUsageData();
      const mockKpis = generateMockTemplateKpis();

      setData(mockData);
      setChartData(mockChartData);
      setKpis(mockKpis);

      console.info('[ReportTemplates] Loaded report templates data');
    } catch (err: any) {
      const errorMsg = `Failed to load report templates data: ${err.message}`;
      console.error('[ReportTemplates] Error:', err);
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
   * Export report templates data to CSV
   */
  const exportData = useCallback(async () => {
    try {
      const csv = convertTemplatesToCSV(data);

      await window.electronAPI.invoke('export-data', {
        filename: `report-templates-${new Date().toISOString().split('T')[0]}.csv`,
        data: csv,
      });

      console.info('[ReportTemplates] Exported templates data successfully');
    } catch (err: any) {
      console.error('[ReportTemplates] Export failed:', err);
      setError(`Export failed: ${err.message}`);
    }
  }, [data]);

  return {
    data,
    chartData,
    kpis,
    isLoading,
    error,
    exportData,
    refreshData: loadData,
  };
};

/**
 * Generate mock report templates
 */
function generateMockReportTemplates(): ReportTemplate[] {
  return [
    {
      id: 'template-1',
      name: 'User Access Report',
      description: 'Comprehensive report of user access rights and permissions',
      category: 'Security',
      fields: ['userId', 'permissions', 'lastLogin', 'department'],
      filters: { activeUsers: true, dateRange: '30d' },
      format: 'pdf',
      isActive: true,
      createdBy: 'admin@company.com',
      createdDate: '2023-01-15',
      usageCount: 245,
    },
    {
      id: 'template-2',
      name: 'System Performance Summary',
      description: 'Monthly system performance metrics and KPIs',
      category: 'Performance',
      fields: ['cpuUsage', 'memoryUsage', 'diskSpace', 'responseTime'],
      filters: { timeframe: 'monthly' },
      format: 'excel',
      isActive: true,
      createdBy: 'it-admin@company.com',
      createdDate: '2023-02-20',
      usageCount: 89,
    },
    {
      id: 'template-3',
      name: 'Compliance Audit Report',
      description: 'Regulatory compliance status and audit findings',
      category: 'Compliance',
      fields: ['complianceScore', 'violations', 'remediationStatus'],
      filters: { regulatoryFramework: 'GDPR' },
      format: 'pdf',
      isActive: true,
      createdBy: 'compliance@company.com',
      createdDate: '2023-03-10',
      usageCount: 67,
    },
    {
      id: 'template-4',
      name: 'Resource Utilization Report',
      description: 'Detailed resource usage across departments',
      category: 'Operations',
      fields: ['department', 'resourceType', 'utilization', 'cost'],
      filters: { department: 'all' },
      format: 'csv',
      isActive: false,
      createdBy: 'finance@company.com',
      createdDate: '2023-04-05',
      usageCount: 0,
    },
  ];
}

/**
 * Generate mock template usage data
 */
function generateMockTemplateUsageData(): TemplateUsageData[] {
  const templates = ['template-1', 'template-2', 'template-3', 'template-4'];

  return templates.map(templateId => ({
    templateId,
    usageCount: Math.floor(Math.random() * 100) + 10,
    lastUsed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    averageGenerationTime: Math.random() * 10 + 2, // 2-12 seconds
  }));
}

/**
 * Generate mock template KPIs
 */
function generateMockTemplateKpis(): TemplateKpi[] {
  return [
    { label: 'Total Templates', value: 12, change: 2 },
    { label: 'Active Templates', value: 8, change: 1 },
    { label: 'Total Generations', value: 1250, change: 15.3 },
    { label: 'Average Generation Time', value: 4.2, change: -0.8 },
  ];
}

/**
 * Convert report templates data to CSV format
 */
function convertTemplatesToCSV(templates: ReportTemplate[]): string {
  const headers = [
    'ID', 'Name', 'Description', 'Category', 'Fields', 'Format',
    'Is Active', 'Created By', 'Created Date', 'Usage Count'
  ];

  const rows = templates.map(template => [
    template.id,
    template.name,
    template.description,
    template.category,
    template.fields.join('; '),
    template.format,
    template.isActive ? 'Yes' : 'No',
    template.createdBy,
    template.createdDate,
    template.usageCount.toString(),
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}