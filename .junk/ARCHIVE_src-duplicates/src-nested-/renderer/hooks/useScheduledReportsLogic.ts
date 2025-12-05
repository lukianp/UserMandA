import { useState, useEffect, useCallback } from 'react';

/**
 * Scheduled report data model
 */
export interface ScheduledReport {
  id: string;
  name: string;
  templateId: string;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM format
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
  };
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  filters: Record<string, any>;
  isActive: boolean;
  lastRun?: string;
  nextRun: string;
  createdBy: string;
  createdDate: string;
}

/**
 * Report execution data
 */
export interface ReportExecutionData {
  reportId: string;
  executionTime: string;
  status: 'success' | 'failed' | 'running';
  duration: number; // in seconds
  recipientsCount: number;
  errorMessage?: string;
}

/**
 * KPI data for scheduled reports
 */
export interface ScheduledReportKpi {
  label: string;
  value: number;
  change: number;
}

/**
 * Custom hook for scheduled reports logic
 */
export const useScheduledReportsLogic = () => {
  const [data, setData] = useState<ScheduledReport[]>([]);
  const [chartData, setChartData] = useState<ReportExecutionData[]>([]);
  const [kpis, setKpis] = useState<ScheduledReportKpi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  /**
   * Load scheduled reports data
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock data loading - replace with actual API calls
      const mockData = generateMockScheduledReports();
      const mockChartData = generateMockExecutionData();
      const mockKpis = generateMockScheduledReportKpis();

      setData(mockData);
      setChartData(mockChartData);
      setKpis(mockKpis);

      console.info('[ScheduledReports] Loaded scheduled reports data');
    } catch (err: any) {
      const errorMsg = `Failed to load scheduled reports data: ${err.message}`;
      console.error('[ScheduledReports] Error:', err);
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
   * Export scheduled reports data to CSV
   */
  const exportData = useCallback(async () => {
    try {
      const csv = convertScheduledReportsToCSV(data);

      await window.electronAPI.invoke('export-data', {
        filename: `scheduled-reports-${new Date().toISOString().split('T')[0]}.csv`,
        data: csv,
      });

      console.info('[ScheduledReports] Exported scheduled reports data successfully');
    } catch (err: any) {
      console.error('[ScheduledReports] Export failed:', err);
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
 * Generate mock scheduled reports
 */
function generateMockScheduledReports(): ScheduledReport[] {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return [
    {
      id: 'scheduled-1',
      name: 'Weekly User Access Report',
      templateId: 'template-1',
      schedule: {
        frequency: 'weekly',
        time: '09:00',
        dayOfWeek: 1, // Monday
      },
      recipients: ['admin@company.com', 'security@company.com'],
      format: 'pdf',
      filters: { department: 'all', activeUsers: true },
      isActive: true,
      lastRun: now.toISOString().split('T')[0],
      nextRun: nextWeek.toISOString().split('T')[0],
      createdBy: 'admin@company.com',
      createdDate: '2023-01-15',
    },
    {
      id: 'scheduled-2',
      name: 'Monthly Performance Summary',
      templateId: 'template-2',
      schedule: {
        frequency: 'monthly',
        time: '08:00',
        dayOfMonth: 1, // First day of month
      },
      recipients: ['it-admin@company.com', 'management@company.com'],
      format: 'excel',
      filters: { timeframe: 'monthly', includeCharts: true },
      isActive: true,
      lastRun: '2023-12-01',
      nextRun: '2024-01-01',
      createdBy: 'it-admin@company.com',
      createdDate: '2023-02-20',
    },
    {
      id: 'scheduled-3',
      name: 'Daily Compliance Check',
      templateId: 'template-3',
      schedule: {
        frequency: 'daily',
        time: '06:00',
      },
      recipients: ['compliance@company.com'],
      format: 'pdf',
      filters: { regulatoryFramework: 'GDPR', urgentOnly: true },
      isActive: true,
      lastRun: now.toISOString().split('T')[0],
      nextRun: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdBy: 'compliance@company.com',
      createdDate: '2023-03-10',
    },
    {
      id: 'scheduled-4',
      name: 'Quarterly Resource Report',
      templateId: 'template-4',
      schedule: {
        frequency: 'monthly',
        time: '10:00',
        dayOfMonth: 1, // First day of quarter
      },
      recipients: ['finance@company.com', 'operations@company.com'],
      format: 'csv',
      filters: { quarter: 'current', includeCosts: true },
      isActive: false,
      nextRun: '2024-04-01',
      createdBy: 'finance@company.com',
      createdDate: '2023-04-05',
    },
  ];
}

/**
 * Generate mock report execution data
 */
function generateMockExecutionData(): ReportExecutionData[] {
  const executions: ReportExecutionData[] = [];
  const now = new Date();

  for (let i = 0; i < 30; i++) {
    const executionTime = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    executions.push({
      reportId: `scheduled-${(i % 4) + 1}`,
      executionTime: executionTime.toISOString(),
      status: i % 10 === 0 ? 'failed' : 'success',
      duration: Math.random() * 30 + 5, // 5-35 seconds
      recipientsCount: Math.floor(Math.random() * 5) + 1,
      errorMessage: i % 10 === 0 ? 'Connection timeout' : undefined,
    });
  }

  return executions;
}

/**
 * Generate mock scheduled report KPIs
 */
function generateMockScheduledReportKpis(): ScheduledReportKpi[] {
  return [
    { label: 'Active Schedules', value: 8, change: 1 },
    { label: 'Reports Generated Today', value: 12, change: 3 },
    { label: 'Success Rate', value: 94.5, change: 2.1 },
    { label: 'Average Delivery Time', value: 8.3, change: -1.2 },
  ];
}

/**
 * Convert scheduled reports data to CSV format
 */
function convertScheduledReportsToCSV(reports: ScheduledReport[]): string {
  const headers = [
    'ID', 'Name', 'Template ID', 'Frequency', 'Time', 'Recipients',
    'Format', 'Is Active', 'Last Run', 'Next Run', 'Created By', 'Created Date'
  ];

  const rows = reports.map(report => [
    report.id,
    report.name,
    report.templateId,
    report.schedule.frequency,
    report.schedule.time,
    report.recipients.join('; '),
    report.format,
    report.isActive ? 'Yes' : 'No',
    report.lastRun || '',
    report.nextRun,
    report.createdBy,
    report.createdDate,
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}