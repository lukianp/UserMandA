import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Import job data model
 */
export interface ImportJob {
  id: string;
  fileName: string;
  fileType: 'csv' | 'json' | 'xml' | 'excel';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  errors: string[];
  createdAt: string;
  updatedAt: string;
  config: ImportConfig;
}

/**
 * Export job data model
 */
export interface ExportJob {
  id: string;
  fileName: string;
  format: 'csv' | 'json' | 'xml' | 'excel' | 'pdf';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  errors: string[];
  createdAt: string;
  updatedAt: string;
  config: ExportConfig;
}

/**
 * Import configuration
 */
export interface ImportConfig {
  delimiter?: string;
  encoding?: string;
  hasHeaders: boolean;
  fieldMappings: { [key: string]: string };
  skipDuplicates: boolean;
  validateData: boolean;
  batchSize: number;
}

/**
 * Export configuration
 */
export interface ExportConfig {
  includeHeaders: boolean;
  dateFormat: string;
  filters: { [key: string]: any };
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  selectedFields: string[];
}

/**
 * Statistics for import/export operations
 */
export interface ImportExportStats {
  totalImports: number;
  totalExports: number;
  successfulImports: number;
  successfulExports: number;
  failedImports: number;
  failedExports: number;
  averageProcessingTime: number;
}

/**
 * Custom hook for data import/export logic
 */
export const useDataImportExportLogic = () => {
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [stats, setStats] = useState<ImportExportStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Create new import job
   */
  const createImportJob = useCallback(async (fileName: string, fileType: ImportJob['fileType'], config: ImportConfig) => {
    try {
      const newJob: ImportJob = {
        id: `import-${Date.now()}`,
        fileName,
        fileType,
        status: 'pending',
        progress: 0,
        totalRecords: 0,
        processedRecords: 0,
        errors: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        config,
      };

      setImportJobs(prev => [...prev, newJob]);
      console.info('[DataImportExport] Created import job:', newJob.id);
      return newJob;
    } catch (err: any) {
      console.error('[DataImportExport] Failed to create import job:', err);
      setError(`Failed to create import job: ${err.message}`);
      return null;
    }
  }, []);

  /**
   * Create new export job
   */
  const createExportJob = useCallback(async (fileName: string, format: ExportJob['format'], config: ExportConfig) => {
    try {
      const newJob: ExportJob = {
        id: `export-${Date.now()}`,
        fileName,
        format,
        status: 'pending',
        progress: 0,
        totalRecords: 0,
        processedRecords: 0,
        errors: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        config,
      };

      setExportJobs(prev => [...prev, newJob]);
      console.info('[DataImportExport] Created export job:', newJob.id);
      return newJob;
    } catch (err: any) {
      console.error('[DataImportExport] Failed to create export job:', err);
      setError(`Failed to create export job: ${err.message}`);
      return null;
    }
  }, []);

  /**
   * Update import job
   */
  const updateImportJob = useCallback(async (id: string, updates: Partial<ImportJob>) => {
    try {
      setImportJobs(prev => prev.map(job => {
        if (job.id !== id) return job;
        return { ...job, ...updates, updatedAt: new Date().toISOString() };
      }));
      console.info('[DataImportExport] Updated import job:', id);
    } catch (err: any) {
      console.error('[DataImportExport] Failed to update import job:', err);
      setError(`Failed to update import job: ${err.message}`);
    }
  }, []);

  /**
   * Update export job
   */
  const updateExportJob = useCallback(async (id: string, updates: Partial<ExportJob>) => {
    try {
      setExportJobs(prev => prev.map(job => {
        if (job.id !== id) return job;
        return { ...job, ...updates, updatedAt: new Date().toISOString() };
      }));
      console.info('[DataImportExport] Updated export job:', id);
    } catch (err: any) {
      console.error('[DataImportExport] Failed to update export job:', err);
      setError(`Failed to update export job: ${err.message}`);
    }
  }, []);

  /**
   * Delete import job
   */
  const deleteImportJob = useCallback(async (id: string) => {
    try {
      setImportJobs(prev => prev.filter(job => job.id !== id));
      console.info('[DataImportExport] Deleted import job:', id);
    } catch (err: any) {
      console.error('[DataImportExport] Failed to delete import job:', err);
      setError(`Failed to delete import job: ${err.message}`);
    }
  }, []);

  /**
   * Delete export job
   */
  const deleteExportJob = useCallback(async (id: string) => {
    try {
      setExportJobs(prev => prev.filter(job => job.id !== id));
      console.info('[DataImportExport] Deleted export job:', id);
    } catch (err: any) {
      console.error('[DataImportExport] Failed to delete export job:', err);
      setError(`Failed to delete export job: ${err.message}`);
    }
  }, []);

  /**
   * Calculate import/export statistics
   */
  const calculateStats = useCallback((): ImportExportStats => {
    const successfulImports = importJobs.filter(job => job.status === 'completed').length;
    const successfulExports = exportJobs.filter(job => job.status === 'completed').length;
    const failedImports = importJobs.filter(job => job.status === 'failed').length;
    const failedExports = exportJobs.filter(job => job.status === 'failed').length;

    const completedImports = importJobs.filter(job => job.status === 'completed');
    const completedExports = exportJobs.filter(job => job.status === 'completed');

    const totalImportTime = completedImports.reduce((sum, job) => {
      return sum + (new Date(job.updatedAt).getTime() - new Date(job.createdAt).getTime());
    }, 0);

    const totalExportTime = completedExports.reduce((sum, job) => {
      return sum + (new Date(job.updatedAt).getTime() - new Date(job.createdAt).getTime());
    }, 0);

    const totalJobs = completedImports.length + completedExports.length;
    const averageProcessingTime = totalJobs > 0 ? (totalImportTime + totalExportTime) / totalJobs : 0;

    return {
      totalImports: importJobs.length,
      totalExports: exportJobs.length,
      successfulImports,
      successfulExports,
      failedImports,
      failedExports,
      averageProcessingTime: Math.round(averageProcessingTime / 1000), // Convert to seconds
    };
  }, [importJobs, exportJobs]);

  /**
   * Load import/export data
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock data loading - replace with actual API calls
      const mockImportJobs = generateMockImportJobs();
      const mockExportJobs = generateMockExportJobs();

      setImportJobs(mockImportJobs);
      setExportJobs(mockExportJobs);
      setStats(calculateStats());

      console.info('[DataImportExport] Loaded import/export data');
    } catch (err: any) {
      const errorMsg = `Failed to load import/export data: ${err.message}`;
      console.error('[DataImportExport] Error:', err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [calculateStats]);

  /**
   * Load data on mount
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Update stats when jobs change
   */
  useEffect(() => {
    if (importJobs.length > 0 || exportJobs.length > 0) {
      setStats(calculateStats());
    }
  }, [importJobs, exportJobs, calculateStats]);

  /**
   * Set up real-time refresh
   */
  const startRealTimeUpdates = useCallback((intervalMs: number = 30000) => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(() => {
      loadData();
    }, intervalMs);

    console.info('[DataImportExport] Started real-time updates');
  }, [loadData]);

  /**
   * Stop real-time updates
   */
  const stopRealTimeUpdates = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
      console.info('[DataImportExport] Stopped real-time updates');
    }
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopRealTimeUpdates();
    };
  }, [stopRealTimeUpdates]);

  /**
   * Start import job processing
   */
  const startImport = useCallback(async (id: string) => {
    await updateImportJob(id, { status: 'processing' });
    // Simulate processing
    setTimeout(() => {
      updateImportJob(id, {
        status: 'completed',
        progress: 100,
        processedRecords: 150,
        totalRecords: 150
      });
    }, 2000);
  }, [updateImportJob]);

  /**
   * Start export job processing
   */
  const startExport = useCallback(async (id: string) => {
    await updateExportJob(id, { status: 'processing' });
    // Simulate processing
    setTimeout(() => {
      updateExportJob(id, {
        status: 'completed',
        progress: 100,
        processedRecords: 200,
        totalRecords: 200
      });
    }, 2500);
  }, [updateExportJob]);

  /**
   * Cancel import job
   */
  const cancelImport = useCallback(async (id: string) => {
    await updateImportJob(id, { status: 'cancelled' });
  }, [updateImportJob]);

  /**
   * Cancel export job
   */
  const cancelExport = useCallback(async (id: string) => {
    await updateExportJob(id, { status: 'cancelled' });
  }, [updateExportJob]);

  return {
    importJobs,
    exportJobs,
    stats,
    isLoading,
    error,
    createImportJob,
    createExportJob,
    updateImportJob,
    updateExportJob,
    deleteImportJob,
    deleteExportJob,
    startImport,
    startExport,
    cancelImport,
    cancelExport,
    refreshData: loadData,
    startRealTimeUpdates,
    stopRealTimeUpdates,
  };
};

/**
 * Generate mock import jobs for development
 */
function generateMockImportJobs(): ImportJob[] {
  const statuses: ImportJob['status'][] = ['pending', 'processing', 'completed', 'failed'];
  const fileTypes: ImportJob['fileType'][] = ['csv', 'json', 'xml', 'excel'];

  return Array.from({ length: 5 }, (_, index) => ({
    id: `import-${index + 1}`,
    fileName: `data_import_${index + 1}.${fileTypes[index % fileTypes.length]}`,
    fileType: fileTypes[index % fileTypes.length],
    status: statuses[index % statuses.length],
    progress: index % 4 === 2 ? 100 : Math.floor(Math.random() * 100),
    totalRecords: 100 + Math.floor(Math.random() * 200),
    processedRecords: 80 + Math.floor(Math.random() * 120),
    errors: index % 4 === 3 ? ['Invalid data format', 'Missing required fields'] : [],
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    config: {
      delimiter: ',',
      encoding: 'utf-8',
      hasHeaders: true,
      fieldMappings: { 'name': 'displayName', 'email': 'mail' },
      skipDuplicates: true,
      validateData: true,
      batchSize: 100,
    },
  }));
}

/**
 * Generate mock export jobs for development
 */
function generateMockExportJobs(): ExportJob[] {
  const statuses: ExportJob['status'][] = ['pending', 'processing', 'completed', 'failed'];
  const formats: ExportJob['format'][] = ['csv', 'json', 'xml', 'excel', 'pdf'];

  return Array.from({ length: 4 }, (_, index) => ({
    id: `export-${index + 1}`,
    fileName: `export_${index + 1}.${formats[index % formats.length]}`,
    format: formats[index % formats.length],
    status: statuses[index % statuses.length],
    progress: index % 4 === 2 ? 100 : Math.floor(Math.random() * 100),
    totalRecords: 150 + Math.floor(Math.random() * 300),
    processedRecords: 120 + Math.floor(Math.random() * 180),
    errors: index % 4 === 3 ? ['Export permission denied'] : [],
    createdAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    config: {
      includeHeaders: true,
      dateFormat: 'YYYY-MM-DD',
      filters: { status: 'active' },
      sortBy: 'name',
      sortOrder: 'asc',
      selectedFields: ['id', 'name', 'email', 'status'],
    },
  }));
}
