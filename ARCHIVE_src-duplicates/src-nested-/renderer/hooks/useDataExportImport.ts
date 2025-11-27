/**
 * Data Export/Import Hook
 *
 * React hook for exporting and importing data
 */

import { useState, useCallback } from 'react';

export type ExportFormat = 'CSV' | 'JSON' | 'XLSX';

export interface ExportOptions {
  format: ExportFormat;
  includeHeaders: boolean;
  includeMetadata: boolean;
  filterFields?: string[];
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  recordCount?: number;
  error?: string;
}

export interface ImportResult {
  success: boolean;
  recordCount?: number;
  errors: string[];
  warnings: string[];
}

export interface DataExportImportState {
  isExporting: boolean;
  isImporting: boolean;
  lastExport?: ExportResult;
  lastImport?: ImportResult;
  error: string | null;
  progress: string;
}

/**
 * Hook for managing data export and import
 */
export function useDataExportImport() {
  const [state, setState] = useState<DataExportImportState>({
    isExporting: false,
    isImporting: false,
    error: null,
    progress: ''
  });

  /**
   * Export data to file
   */
  const exportData = useCallback(
    async (
      data: any[],
      fileName: string,
      format: ExportFormat = 'CSV',
      options?: Partial<ExportOptions>
    ) => {
      setState(prev => ({
        ...prev,
        isExporting: true,
        error: null,
        progress: `Exporting ${data.length} records to ${format}...`
      }));

      try {
        // Use system dialog to get save path
        const savePath = await window.electron.showSaveDialog({
          title: 'Export Data',
          defaultPath: fileName,
          filters: [
            { name: `${format} Files`, extensions: [format.toLowerCase()] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });

        if (!savePath) {
          setState(prev => ({
            ...prev,
            isExporting: false,
            progress: ''
          }));
          return null;
        }

        const exportOptions: ExportOptions = {
          format,
          includeHeaders: options?.includeHeaders ?? true,
          includeMetadata: options?.includeMetadata ?? false,
          filterFields: options?.filterFields
        };

        const result = await window.electron.invoke('data-export:export', {
          data,
          filePath: savePath,
          options: exportOptions
        });

        setState(prev => ({
          ...prev,
          isExporting: false,
          lastExport: result,
          error: result.success ? null : result.error || 'Export failed',
          progress: ''
        }));

        return result;
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isExporting: false,
          error: error.message,
          progress: ''
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Import data from file
   */
  const importData = useCallback(async (format: ExportFormat = 'CSV') => {
    setState(prev => ({
      ...prev,
      isImporting: true,
      error: null,
      progress: `Importing from ${format}...`
    }));

    try {
      // Use system dialog to get file path
      const filePaths = await window.electron.showOpenDialog({
        title: 'Import Data',
        filters: [
          { name: `${format} Files`, extensions: [format.toLowerCase()] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (!filePaths || filePaths.length === 0) {
        setState(prev => ({
          ...prev,
          isImporting: false,
          progress: ''
        }));
        return null;
      }

      const result = await window.electron.invoke('data-import:import', {
        filePath: filePaths[0],
        format
      });

      setState(prev => ({
        ...prev,
        isImporting: false,
        lastImport: result,
        error: result.success ? null : result.errors?.join(', ') || 'Import failed',
        progress: ''
      }));

      return result;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isImporting: false,
        error: error.message,
        progress: ''
      }));
      throw error;
    }
  }, []);

  /**
   * Export users to CSV
   */
  const exportUsers = useCallback(
    async (users: any[], fileName = 'users-export.csv') => {
      return exportData(users, fileName, 'CSV', {
        includeHeaders: true,
        filterFields: [
          'displayName',
          'userPrincipalName',
          'mail',
          'department',
          'jobTitle',
          'enabled'
        ]
      });
    },
    [exportData]
  );

  /**
   * Export groups to CSV
   */
  const exportGroups = useCallback(
    async (groups: any[], fileName = 'groups-export.csv') => {
      return exportData(groups, fileName, 'CSV', {
        includeHeaders: true,
        filterFields: ['name', 'displayName', 'groupType', 'scope', 'memberCount']
      });
    },
    [exportData]
  );

  /**
   * Export computers to CSV
   */
  const exportComputers = useCallback(
    async (computers: any[], fileName = 'computers-export.csv') => {
      return exportData(computers, fileName, 'CSV', {
        includeHeaders: true,
        filterFields: ['name', 'dns', 'domain', 'os', 'status', 'lastLogon']
      });
    },
    [exportData]
  );

  /**
   * Clear results
   */
  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      lastExport: undefined,
      lastImport: undefined,
      error: null
    }));
  }, []);

  return {
    state,
    exportData,
    importData,
    exportUsers,
    exportGroups,
    exportComputers,
    clearResults
  };
}
