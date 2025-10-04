import { useState, useEffect, useMemo, useCallback } from 'react';

interface MigrationStatistics {
  totalAttempted: number;
  totalSucceeded: number;
  totalFailed: number;
  successRate: number;
  averageDurationMinutes: number;
  totalErrors: number;
}

interface WaveTimelineData {
  waveName: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'in_progress' | 'failed' | 'pending';
  progress: number;
  duration: number;
}

interface ErrorBreakdownData {
  errorType: string;
  count: number;
  percentage: number;
}

interface TopErrorData {
  errorMessage: string;
  count: number;
  affectedUsers: number;
  lastOccurrence: string;
}

interface SuccessRateByType {
  type: string;
  successRate: number;
  total: number;
  succeeded: number;
  failed: number;
}

interface ReportData {
  statistics: MigrationStatistics;
  waveTimeline: WaveTimelineData[];
  errorBreakdown: ErrorBreakdownData[];
  topErrors: TopErrorData[];
  successRateByType: SuccessRateByType[];
}

export const useMigrationReportLogic = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedWave, setSelectedWave] = useState<string>('all');

  const fetchReportData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Execute PowerShell script to get migration report data
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Analytics/MigrationReport.psm1',
        functionName: 'Get-MigrationReportData',
        parameters: {
          waveId: selectedWave === 'all' ? null : selectedWave,
        },
      });

      if (result.success && result.data) {
        const data: ReportData = {
          statistics: calculateStatistics(result.data),
          waveTimeline: result.data.waveTimeline || [],
          errorBreakdown: calculateErrorBreakdown(result.data.errors || []),
          topErrors: result.data.topErrors || [],
          successRateByType: result.data.successRateByType || [],
        };

        setReportData(data);
      } else {
        throw new Error(result.error || 'Failed to fetch report data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Migration report fetch error:', err);

      // Set mock data for development/testing
      setReportData(getMockReportData());
    } finally {
      setIsLoading(false);
    }
  }, [selectedWave]);

  // Calculate migration statistics
  const calculateStatistics = (data: any): MigrationStatistics => {
    const totalAttempted = data.totalAttempted || 0;
    const totalSucceeded = data.totalSucceeded || 0;
    const totalFailed = data.totalFailed || 0;
    const successRate = totalAttempted > 0 ? Math.round((totalSucceeded / totalAttempted) * 100) : 0;

    return {
      totalAttempted,
      totalSucceeded,
      totalFailed,
      successRate,
      averageDurationMinutes: data.averageDurationMinutes || 0,
      totalErrors: data.totalErrors || 0,
    };
  };

  // Calculate error breakdown with percentages
  const calculateErrorBreakdown = (errors: any[]): ErrorBreakdownData[] => {
    const errorCounts = errors.reduce((acc: Record<string, number>, error: any) => {
      const type = error.type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const total = Object.values(errorCounts).reduce((sum, count) => sum + count, 0);
    if (total === 0) return [];

    return Object.entries(errorCounts)
      .map(([errorType, count]) => ({
        errorType,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Mock data for development/testing
  const getMockReportData = (): ReportData => ({
    statistics: {
      totalAttempted: 12547,
      totalSucceeded: 11834,
      totalFailed: 713,
      successRate: 94,
      averageDurationMinutes: 23,
      totalErrors: 1247,
    },
    waveTimeline: [
      {
        waveName: 'Wave 1 - Executive Team',
        startDate: '2025-09-01',
        endDate: '2025-09-05',
        status: 'completed',
        progress: 100,
        duration: 4,
      },
      {
        waveName: 'Wave 2 - Sales Department',
        startDate: '2025-09-08',
        endDate: '2025-09-15',
        status: 'completed',
        progress: 100,
        duration: 7,
      },
      {
        waveName: 'Wave 3 - Engineering',
        startDate: '2025-09-16',
        endDate: '2025-09-25',
        status: 'completed',
        progress: 100,
        duration: 9,
      },
      {
        waveName: 'Wave 4 - Operations',
        startDate: '2025-09-26',
        endDate: '2025-10-02',
        status: 'in_progress',
        progress: 75,
        duration: 6,
      },
      {
        waveName: 'Wave 5 - Support & Admin',
        startDate: '2025-10-05',
        endDate: '2025-10-12',
        status: 'pending',
        progress: 0,
        duration: 0,
      },
    ],
    errorBreakdown: [
      { errorType: 'Authentication Failed', count: 423, percentage: 34 },
      { errorType: 'Mailbox Size Limit', count: 312, percentage: 25 },
      { errorType: 'License Assignment', count: 234, percentage: 19 },
      { errorType: 'Network Timeout', count: 156, percentage: 12 },
      { errorType: 'Permission Denied', count: 122, percentage: 10 },
    ],
    topErrors: [
      {
        errorMessage: 'Failed to authenticate with source tenant',
        count: 423,
        affectedUsers: 389,
        lastOccurrence: '2025-10-02 14:32:15',
      },
      {
        errorMessage: 'Mailbox exceeds maximum size for migration',
        count: 312,
        affectedUsers: 312,
        lastOccurrence: '2025-10-02 16:45:23',
      },
      {
        errorMessage: 'Unable to assign required license',
        count: 234,
        affectedUsers: 198,
        lastOccurrence: '2025-10-01 11:20:45',
      },
      {
        errorMessage: 'Connection timeout during data transfer',
        count: 156,
        affectedUsers: 142,
        lastOccurrence: '2025-09-30 09:15:30',
      },
      {
        errorMessage: 'Insufficient permissions on target',
        count: 122,
        affectedUsers: 115,
        lastOccurrence: '2025-09-29 15:40:12',
      },
    ],
    successRateByType: [
      { type: 'User Accounts', successRate: 96, total: 8500, succeeded: 8160, failed: 340 },
      { type: 'Mailboxes', successRate: 92, total: 8200, succeeded: 7544, failed: 656 },
      { type: 'OneDrive', successRate: 94, total: 7800, succeeded: 7332, failed: 468 },
      { type: 'SharePoint Sites', successRate: 89, total: 450, succeeded: 401, failed: 49 },
      { type: 'Teams', successRate: 91, total: 350, succeeded: 319, failed: 31 },
    ],
  });

  // Initial load
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Export PDF Report
  const handleExportPDF = useCallback(async () => {
    if (!reportData) return;

    setIsExporting(true);
    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Analytics/ExportReport.psm1',
        functionName: 'Export-MigrationReport',
        parameters: {
          data: reportData,
          waveId: selectedWave,
          format: 'pdf',
        },
      });

      if (result.success) {
        console.log('PDF report exported successfully:', result.data.filePath);
        // Could trigger a success notification here
      } else {
        throw new Error(result.error || 'PDF export failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'PDF export failed';
      setError(errorMessage);
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  }, [reportData, selectedWave]);

  // Export Excel Report
  const handleExportExcel = useCallback(async () => {
    if (!reportData) return;

    setIsExporting(true);
    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Analytics/ExportReport.psm1',
        functionName: 'Export-MigrationReport',
        parameters: {
          data: reportData,
          waveId: selectedWave,
          format: 'excel',
        },
      });

      if (result.success) {
        console.log('Excel report exported successfully:', result.data.filePath);
      } else {
        throw new Error(result.error || 'Excel export failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Excel export failed';
      setError(errorMessage);
      console.error('Excel export error:', err);
    } finally {
      setIsExporting(false);
    }
  }, [reportData, selectedWave]);

  // Get available waves for filter
  const availableWaves = useMemo(() => {
    if (!reportData) return [];
    return reportData.waveTimeline.map(w => ({ id: w.waveName, name: w.waveName }));
  }, [reportData]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (!reportData || reportData.waveTimeline.length === 0) return 0;
    const totalProgress = reportData.waveTimeline.reduce((sum, wave) => sum + wave.progress, 0);
    return Math.round(totalProgress / reportData.waveTimeline.length);
  }, [reportData]);

  return {
    reportData,
    isLoading,
    error,
    isExporting,
    selectedWave,
    setSelectedWave,
    availableWaves,
    overallProgress,
    handleExportPDF,
    handleExportExcel,
  };
};
