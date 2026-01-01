/**
 * Data Export/Import IPC Handlers
 *
 * IPC handlers for data export and import service
 */

import { ipcMain } from 'electron';

import { getDataExportImportService } from '../services/dataExportImportService';
import type { ExportFormat, ExportOptions } from '../services/dataExportImportService';

/**
 * Register all data export/import IPC handlers
 */
export function registerDataExportImportHandlers(): void {
  const service = getDataExportImportService();

  // Export data
  ipcMain.handle(
    'data-export:export',
    async (
      event,
      params: {
        data: any[];
        filePath: string;
        options?: ExportOptions;
      }
    ) => {
      try {
        const { data, filePath, options } = params;

        // Determine format from file extension
        const format: ExportFormat = filePath.endsWith('.json')
          ? 'JSON'
          : filePath.endsWith('.xlsx')
            ? 'XLSX'
            : 'CSV';

        let result;

        switch (format) {
          case 'JSON':
            result = await service.exportToJSON(data, filePath, options);
            break;
          case 'XLSX':
            result = await service.exportToExcel(data, filePath, options);
            break;
          default:
            result = await service.exportToCSV(data, filePath, options);
        }

        return result;
      } catch (error: any) {
        return {
          success: false,
          error: error.message
        };
      }
    }
  );

  // Import data
  ipcMain.handle(
    'data-import:import',
    async (event, params: { filePath: string; format: ExportFormat }) => {
      try {
        const { filePath, format } = params;

        let result;

        switch (format) {
          case 'JSON':
            result = await service.importFromJSON(filePath);
            break;
          case 'XLSX':
            result = await service.importFromExcel(filePath);
            break;
          default:
            result = await service.importFromCSV(filePath);
        }

        return result;
      } catch (error: any) {
        return {
          success: false,
          errors: [error.message],
          warnings: []
        };
      }
    }
  );
}


