/**
 * Error Monitoring IPC Handlers
 *
 * IPC handlers for error monitoring and logging service
 */

import { ipcMain, BrowserWindow } from 'electron';

import { getErrorHandlingService } from '../services/errorHandlingService';
import type { LogLevel, LogEntry } from '../services/errorHandlingService';

/**
 * Register all error monitoring IPC handlers
 */
export function registerErrorMonitoringHandlers(mainWindow?: BrowserWindow): void {
  const service = getErrorHandlingService();

  // Forward log events to renderer
  if (mainWindow) {
    service.on('log', logEntry => {
      mainWindow.webContents.send('error-monitoring:log', logEntry);
    });

    service.on('error-reported', errorReport => {
      mainWindow.webContents.send('error-monitoring:error-reported', errorReport);
    });
  }

  // Get error reports
  ipcMain.handle(
    'error-monitoring:get-reports',
    async (event, filter?: { resolved?: boolean; since?: string }) => {
      try {
        const reports = service.getErrorReports(filter);
        return { success: true, reports };
      } catch (error: any) {
        return { success: false, error: error.message, reports: [] };
      }
    }
  );

  // Resolve error
  ipcMain.handle(
    'error-monitoring:resolve',
    async (event, params: { reportId: string; notes?: string }) => {
      try {
        await service.resolveErrorReport(params.reportId, params.notes);
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
  );

  // Log message
  ipcMain.handle(
    'error-monitoring:log',
    async (
      event,
      params: {
        level: LogLevel;
        category: string;
        message: string;
        context?: Record<string, any>;
      }
    ) => {
      try {
        service.log(params.level, params.category, params.message, params.context);
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
  );

  // Report error
  ipcMain.handle(
    'error-monitoring:report-error',
    async (
      event,
      params: {
        error: Error;
        context?: Record<string, any>;
      }
    ) => {
      try {
        const reportId = await service.reportError(params.error, params.context);
        return { success: true, reportId };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
  );

  // Get logs
  ipcMain.handle(
    'error-monitoring:get-logs',
    async (event, filter?: { level?: LogLevel; category?: string; limit?: number }) => {
      try {
        // Return recent logs from buffer
        const logs = service.getRecentLogs(filter?.limit || 100);

        // Apply filters
        let filtered = logs;
        if (filter?.level) {
          filtered = filtered.filter((log: LogEntry) => log.level === filter.level);
        }
        if (filter?.category) {
          filtered = filtered.filter((log: LogEntry) => log.category === filter.category);
        }

        return { success: true, logs: filtered };
      } catch (error: any) {
        return { success: false, error: error.message, logs: [] };
      }
    }
  );

  // Subscribe to log events (return unsubscribe function)
  ipcMain.handle('error-monitoring:subscribe', async (event, handlers: Record<string, any>) => {
    // Note: This is handled via IPC events above
    // This handler exists for compatibility but doesn't need implementation
    return { success: true };
  });
}
