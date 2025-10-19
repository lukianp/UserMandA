/**
 * Logging IPC Handlers
 *
 * Provides IPC handlers for centralized logging from renderer process.
 */

import { ipcMain } from 'electron';
import { getLoggingService, LogLevel } from '../services/loggingService';
import { getErrorHandler, AppError } from '../utils/errorHandler';

const loggingService = getLoggingService();
const errorHandler = getErrorHandler();

/**
 * Register logging IPC handlers
 */
export function registerLoggingHandlers(): void {
  /**
   * Log a message from renderer process
   */
  ipcMain.handle('log:message', async (_, args: {
    level: LogLevel;
    component: string;
    message: string;
    context?: Record<string, any>;
  }) => {
    try {
      const { level, component, message, context } = args;

      switch (level) {
        case LogLevel.DEBUG:
          loggingService.debug(component, message, context);
          break;
        case LogLevel.INFO:
          loggingService.info(component, message, context);
          break;
        case LogLevel.WARN:
          loggingService.warn(component, message, context);
          break;
        case LogLevel.ERROR:
          loggingService.error(component, message, undefined, context);
          break;
        case LogLevel.FATAL:
          loggingService.fatal(component, message, undefined, context);
          break;
      }

      return { success: true };
    } catch (error) {
      console.error('log:message error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * Log an error from renderer process
   */
  ipcMain.handle('log:error', async (_, args: {
    component: string;
    message: string;
    stack?: string;
    context?: Record<string, any>;
  }) => {
    try {
      const { component, message, stack, context } = args;

      const error = new Error(message);
      if (stack) {
        error.stack = stack;
      }

      loggingService.error(component, message, error, context);

      return { success: true };
    } catch (error) {
      console.error('log:error error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * Get recent logs
   */
  ipcMain.handle('log:getRecent', async (_, count: number = 100) => {
    try {
      const logs = loggingService.getRecentLogs(count);
      return { success: true, logs };
    } catch (error) {
      console.error('log:getRecent error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        logs: []
      };
    }
  });

  /**
   * Get logs by level
   */
  ipcMain.handle('log:getByLevel', async (_, args: { level: LogLevel; count?: number }) => {
    try {
      const { level, count = 100 } = args;
      const logs = loggingService.getLogsByLevel(level, count);
      return { success: true, logs };
    } catch (error) {
      console.error('log:getByLevel error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        logs: []
      };
    }
  });

  /**
   * Get logs by component
   */
  ipcMain.handle('log:getByComponent', async (_, args: { component: string; count?: number }) => {
    try {
      const { component, count = 100 } = args;
      const logs = loggingService.getLogsByComponent(component, count);
      return { success: true, logs };
    } catch (error) {
      console.error('log:getByComponent error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        logs: []
      };
    }
  });

  /**
   * Clear log buffer
   */
  ipcMain.handle('log:clear', async () => {
    try {
      loggingService.clearBuffer();
      return { success: true };
    } catch (error) {
      console.error('log:clear error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * Update logging configuration
   */
  ipcMain.handle('log:updateConfig', async (_, config: any) => {
    try {
      loggingService.updateConfig(config);
      return { success: true };
    } catch (error) {
      console.error('log:updateConfig error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * Get logging configuration
   */
  ipcMain.handle('log:getConfig', async () => {
    try {
      const config = loggingService.getConfig();
      return { success: true, config };
    } catch (error) {
      console.error('log:getConfig error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        config: null
      };
    }
  });

  console.log('Logging IPC handlers registered');
}

/**
 * Initialize logging service
 */
export async function initializeLogging(): Promise<void> {
  await loggingService.initialize();
  console.log('Logging service initialized');
}
