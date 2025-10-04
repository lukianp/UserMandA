/**
 * IPC Handlers Registration
 *
 * Registers all IPC communication channels between renderer and main process.
 * Provides secure bridge for PowerShell execution, file operations, configuration, and more.
 */

import { ipcMain, dialog, shell, BrowserWindow } from 'electron';
import PowerShellExecutionService from './services/powerShellService';
import ModuleRegistry from './services/moduleRegistry';
import EnvironmentDetectionService from './services/environmentDetectionService';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ScriptExecutionParams, ModuleExecutionParams, ScriptTask } from '../types/shared';
import { MockLogicEngineService } from './services/mockLogicEngineService';
import type { UserDetailProjection } from '../renderer/types/models/userDetail';

// Service instances
let psService: PowerShellExecutionService;
let moduleRegistry: ModuleRegistry;
let environmentDetectionService: EnvironmentDetectionService;
let mockLogicEngineService: MockLogicEngineService;
let mainWindow: BrowserWindow | null = null;

// Configuration storage
const configPath = path.join(process.cwd(), 'config', 'app-config.json');
let appConfig: Record<string, any> = {};

/**
 * Initialize services
 */
async function initializeServices(): Promise<void> {
  console.log('Initializing IPC services...');

  // Initialize PowerShell Execution Service
  psService = new PowerShellExecutionService({
    maxPoolSize: 10,
    minPoolSize: 2,
    sessionTimeout: 300000, // 5 minutes
    queueSize: 100,
    enableModuleCaching: true,
    defaultTimeout: 60000, // 1 minute
    scriptsBaseDir: path.join(process.cwd(), '..'),
  });
  await psService.initialize();

  // Initialize Module Registry
  const registryPath = path.join(process.cwd(), 'config', 'module-registry.json');
  moduleRegistry = new ModuleRegistry(psService, registryPath);

  try {
    await moduleRegistry.loadRegistry();
  } catch (error: any) {
    console.warn(`Could not load module registry: ${error.message}`);
  }

  // Initialize Environment Detection Service
  environmentDetectionService = new EnvironmentDetectionService(psService);
  console.log('Environment Detection Service initialized');

  // Initialize Mock Logic Engine Service
  mockLogicEngineService = MockLogicEngineService.getInstance();
  console.log('Mock Logic Engine Service initialized');

  // Load application configuration
  try {
    const configData = await fs.readFile(configPath, 'utf-8');
    appConfig = JSON.parse(configData);
    console.log('Loaded application configuration');
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log('No configuration file found, starting with defaults');
      appConfig = {};
      // Create config directory
      await fs.mkdir(path.dirname(configPath), { recursive: true });
    } else {
      console.error(`Failed to load config: ${error.message}`);
    }
  }

  console.log('IPC services initialized successfully');
}

/**
 * Save application configuration to disk
 */
async function saveConfig(): Promise<void> {
  try {
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(appConfig, null, 2), 'utf-8');
  } catch (error: any) {
    console.error(`Failed to save config: ${error.message}`);
    throw error;
  }
}

/**
 * Sanitize file path to prevent directory traversal attacks
 */
function sanitizePath(filePath: string): string {
  // Normalize path and resolve to absolute
  const normalized = path.normalize(filePath);
  const resolved = path.resolve(normalized);

  // Ensure path doesn't try to escape base directory
  // This is a basic check - in production, define allowed base directories
  return resolved;
}

/**
 * Register all IPC handlers
 * @param window The main browser window for sending events to renderer
 */
export async function registerIpcHandlers(window?: BrowserWindow): Promise<void> {
  // Store window reference for stream events
  if (window) {
    mainWindow = window;
  }

  // Initialize services first
  await initializeServices();

  // ========================================
  // PowerShell Stream Event Forwarding
  // ========================================

  // Forward all 6 PowerShell streams to renderer process
  if (mainWindow) {
    psService.on('stream:output', (data) => {
      mainWindow?.webContents.send('powershell:stream:output', data);
    });

    psService.on('stream:error', (data) => {
      mainWindow?.webContents.send('powershell:stream:error', data);
    });

    psService.on('stream:warning', (data) => {
      mainWindow?.webContents.send('powershell:stream:warning', data);
    });

    psService.on('stream:verbose', (data) => {
      mainWindow?.webContents.send('powershell:stream:verbose', data);
    });

    psService.on('stream:debug', (data) => {
      mainWindow?.webContents.send('powershell:stream:debug', data);
    });

    psService.on('stream:information', (data) => {
      mainWindow?.webContents.send('powershell:stream:information', data);
    });

    // Forward legacy output event (backward compatibility)
    psService.on('output', (data) => {
      mainWindow?.webContents.send('powershell:output', data);
    });

    // Forward cancellation events
    psService.on('execution:cancelled', (data) => {
      mainWindow?.webContents.send('powershell:execution:cancelled', data);
    });

    console.log('PowerShell stream event forwarding configured');

    // Forward Environment Detection events
    environmentDetectionService.on('detection:started', (data) => {
      mainWindow?.webContents.send('environment:detection:started', data);
    });

    environmentDetectionService.on('detection:progress', (data) => {
      mainWindow?.webContents.send('environment:detection:progress', data);
    });

    environmentDetectionService.on('detection:completed', (data) => {
      mainWindow?.webContents.send('environment:detection:completed', data);
    });

    environmentDetectionService.on('detection:failed', (data) => {
      mainWindow?.webContents.send('environment:detection:failed', data);
    });

    environmentDetectionService.on('detection:cancelled', (data) => {
      mainWindow?.webContents.send('environment:detection:cancelled', data);
    });

    console.log('Environment Detection event forwarding configured');
  }

  // ========================================
  // PowerShell Execution Handlers
  // ========================================

  ipcMain.handle('powershell:executeScript', async (_, params: ScriptExecutionParams) => {
    try {
      console.log(`IPC: executeScript - ${params.scriptPath}`);
      return await psService.executeScript(params.scriptPath, params.args || [], params.options);
    } catch (error: any) {
      console.error(`executeScript error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        duration: 0,
        warnings: [],
      };
    }
  });

  ipcMain.handle('powershell:executeModule', async (_, params: ModuleExecutionParams) => {
    try {
      console.log(`IPC: executeModule - ${params.modulePath} :: ${params.functionName}`);
      return await psService.executeModule(
        params.modulePath,
        params.functionName,
        params.parameters || {},
        params.options
      );
    } catch (error: any) {
      console.error(`executeModule error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        duration: 0,
        warnings: [],
      };
    }
  });

  ipcMain.handle('powershell:cancel', async (_, token: string) => {
    try {
      console.log(`IPC: cancelExecution - ${token}`);
      return psService.cancelExecution(token);
    } catch (error: any) {
      console.error(`cancelExecution error: ${error.message}`);
      return false;
    }
  });

  ipcMain.handle('powershell:getStatistics', async () => {
    try {
      return psService.getStatistics();
    } catch (error: any) {
      console.error(`getStatistics error: ${error.message}`);
      return null;
    }
  });

  // New enhanced PowerShell handlers
  ipcMain.handle('powershell:discoverModules', async () => {
    try {
      console.log('IPC: discoverModules');
      return await psService.discoverModules();
    } catch (error: any) {
      console.error(`discoverModules error: ${error.message}`);
      return [];
    }
  });

  ipcMain.handle('powershell:executeParallel', async (_, scripts: ScriptTask[]) => {
    try {
      console.log(`IPC: executeParallel - ${scripts.length} scripts`);
      return await psService.executeParallel(scripts);
    } catch (error: any) {
      console.error(`executeParallel error: ${error.message}`);
      return scripts.map(() => ({
        success: false,
        error: error.message,
        duration: 0,
        warnings: [],
      }));
    }
  });

  ipcMain.handle('powershell:executeWithRetry', async (_, params: ScriptExecutionParams, retries: number, backoff: number) => {
    try {
      console.log(`IPC: executeWithRetry - ${params.scriptPath} (retries: ${retries})`);
      return await psService.executeWithRetry(
        params.scriptPath,
        params.args || [],
        params.options,
        retries,
        backoff
      );
    } catch (error: any) {
      console.error(`executeWithRetry error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        duration: 0,
        warnings: [],
      };
    }
  });

  // ========================================
  // Module Registry Handlers
  // ========================================

  ipcMain.handle('modules:getByCategory', async (_, category: string) => {
    try {
      return moduleRegistry.getModulesByCategory(category as any);
    } catch (error: any) {
      console.error(`getModulesByCategory error: ${error.message}`);
      return [];
    }
  });

  ipcMain.handle('modules:getAll', async () => {
    try {
      return moduleRegistry.getAllModules();
    } catch (error: any) {
      console.error(`getAllModules error: ${error.message}`);
      return [];
    }
  });

  ipcMain.handle('modules:getById', async (_, moduleId: string) => {
    try {
      return moduleRegistry.getModule(moduleId);
    } catch (error: any) {
      console.error(`getModule error: ${error.message}`);
      return null;
    }
  });

  ipcMain.handle('modules:search', async (_, query: string) => {
    try {
      return moduleRegistry.searchModules(query);
    } catch (error: any) {
      console.error(`searchModules error: ${error.message}`);
      return [];
    }
  });

  ipcMain.handle('modules:execute', async (_, moduleId: string, params: Record<string, any>, options?: any) => {
    try {
      console.log(`IPC: executeModule - ${moduleId}`);
      return await moduleRegistry.executeModule(moduleId, params, options);
    } catch (error: any) {
      console.error(`executeModule error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        duration: 0,
        warnings: [],
      };
    }
  });

  ipcMain.handle('modules:getStatistics', async () => {
    try {
      return moduleRegistry.getStatistics();
    } catch (error: any) {
      console.error(`getModuleStatistics error: ${error.message}`);
      return null;
    }
  });

  // ========================================
  // File Operation Handlers
  // ========================================

  ipcMain.handle('file:read', async (_, filePath: string, encoding = 'utf-8') => {
    try {
      const sanitized = sanitizePath(filePath);
      console.log(`IPC: readFile - ${sanitized}`);
      return await fs.readFile(sanitized, encoding as BufferEncoding);
    } catch (error: any) {
      console.error(`readFile error: ${error.message}`);
      throw new Error(`Failed to read file: ${error.message}`);
    }
  });

  ipcMain.handle('file:write', async (_, filePath: string, content: string, encoding = 'utf-8') => {
    try {
      const sanitized = sanitizePath(filePath);
      console.log(`IPC: writeFile - ${sanitized}`);
      // Ensure directory exists
      await fs.mkdir(path.dirname(sanitized), { recursive: true });
      await fs.writeFile(sanitized, content, encoding as BufferEncoding);
    } catch (error: any) {
      console.error(`writeFile error: ${error.message}`);
      throw new Error(`Failed to write file: ${error.message}`);
    }
  });

  ipcMain.handle('file:exists', async (_, filePath: string) => {
    try {
      const sanitized = sanitizePath(filePath);
      await fs.access(sanitized);
      return true;
    } catch {
      return false;
    }
  });

  ipcMain.handle('file:delete', async (_, filePath: string) => {
    try {
      const sanitized = sanitizePath(filePath);
      console.log(`IPC: deleteFile - ${sanitized}`);
      await fs.unlink(sanitized);
    } catch (error: any) {
      console.error(`deleteFile error: ${error.message}`);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  });

  ipcMain.handle('file:list', async (_, dirPath: string, pattern?: string) => {
    try {
      const sanitized = sanitizePath(dirPath);
      console.log(`IPC: listFiles - ${sanitized}`);
      let files = await fs.readdir(sanitized);

      // Apply pattern filter if provided
      if (pattern) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
        files = files.filter(f => regex.test(f));
      }

      // Return full paths
      return files.map(f => path.join(sanitized, f));
    } catch (error: any) {
      console.error(`listFiles error: ${error.message}`);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  });

  ipcMain.handle('file:stat', async (_, filePath: string) => {
    try {
      const sanitized = sanitizePath(filePath);
      const stats = await fs.stat(sanitized);
      return {
        size: stats.size,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        created: stats.birthtime,
        modified: stats.mtime,
      };
    } catch (error: any) {
      console.error(`statFile error: ${error.message}`);
      throw new Error(`Failed to stat file: ${error.message}`);
    }
  });

  // ========================================
  // Configuration Handlers
  // ========================================

  ipcMain.handle('config:get', async (_, key: string) => {
    return appConfig[key];
  });

  ipcMain.handle('config:set', async (_, key: string, value: any) => {
    appConfig[key] = value;
    await saveConfig();
  });

  ipcMain.handle('config:getAll', async () => {
    return { ...appConfig };
  });

  ipcMain.handle('config:delete', async (_, key: string) => {
    delete appConfig[key];
    await saveConfig();
  });

  ipcMain.handle('config:reset', async () => {
    appConfig = {};
    await saveConfig();
  });

  // ========================================
  // Profile Management Handlers
  // ========================================

  const profilesDir = path.join(process.cwd(), 'config', 'profiles');

  ipcMain.handle('profile:loadAll', async () => {
    try {
      await fs.mkdir(profilesDir, { recursive: true });
      const files = await fs.readdir(profilesDir);
      const profiles = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(profilesDir, file);
          const data = await fs.readFile(filePath, 'utf-8');
          profiles.push(JSON.parse(data));
        }
      }

      console.log(`Loaded ${profiles.length} profiles`);
      return profiles;
    } catch (error: any) {
      console.error(`loadProfiles error: ${error.message}`);
      return [];
    }
  });

  ipcMain.handle('profile:save', async (_, profile: any) => {
    try {
      await fs.mkdir(profilesDir, { recursive: true });
      const filePath = path.join(profilesDir, `${profile.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(profile, null, 2), 'utf-8');
      console.log(`Saved profile: ${profile.id}`);
    } catch (error: any) {
      console.error(`saveProfile error: ${error.message}`);
      throw new Error(`Failed to save profile: ${error.message}`);
    }
  });

  ipcMain.handle('profile:delete', async (_, profileId: string) => {
    try {
      const filePath = path.join(profilesDir, `${profileId}.json`);
      await fs.unlink(filePath);
      console.log(`Deleted profile: ${profileId}`);
    } catch (error: any) {
      console.error(`deleteProfile error: ${error.message}`);
      throw new Error(`Failed to delete profile: ${error.message}`);
    }
  });

  // ========================================
  // System / App Handlers
  // ========================================

  ipcMain.handle('system:getAppVersion', async () => {
    return process.env.npm_package_version || '1.0.0';
  });

  ipcMain.handle('system:getDataPath', async () => {
    return process.cwd();
  });

  ipcMain.handle('system:openExternal', async (_, target: string) => {
    try {
      await shell.openExternal(target);
    } catch (error: any) {
      console.error(`openExternal error: ${error.message}`);
      throw new Error(`Failed to open external: ${error.message}`);
    }
  });

  ipcMain.handle('system:showOpenDialog', async (_, options: any) => {
    try {
      const result = await dialog.showOpenDialog(options);
      return result.canceled ? null : result.filePaths;
    } catch (error: any) {
      console.error(`showOpenDialog error: ${error.message}`);
      return null;
    }
  });

  ipcMain.handle('system:showSaveDialog', async (_, options: any) => {
    try {
      const result = await dialog.showSaveDialog(options);
      return result.canceled ? null : result.filePath;
    } catch (error: any) {
      console.error(`showSaveDialog error: ${error.message}`);
      return null;
    }
  });

  // ========================================
  // Environment Detection Handlers
  // ========================================

  ipcMain.handle('environment:detect', async (_, config: any) => {
    try {
      console.log('IPC: detectEnvironment');
      return await environmentDetectionService.detectEnvironment(config);
    } catch (error: any) {
      console.error(`detectEnvironment error: ${error.message}`);
      return {
        id: 'error',
        startTime: new Date(),
        endTime: new Date(),
        status: 'failed',
        detectedEnvironment: 'unknown',
        detectedServices: [],
        recommendations: [],
        totalServicesFound: 0,
        confidence: 0,
        errors: [{ timestamp: new Date(), serviceType: 'system', message: error.message }],
        warnings: [],
      };
    }
  });

  ipcMain.handle('environment:validateCredentials', async (_, provider: string, credentials: any) => {
    try {
      console.log(`IPC: validateCredentials - ${provider}`);
      return await environmentDetectionService.validateCredentials(provider as any, credentials);
    } catch (error: any) {
      console.error(`validateCredentials error: ${error.message}`);
      return { valid: false, message: error.message };
    }
  });

  ipcMain.handle('environment:cancel', async (_, detectionId: string) => {
    try {
      console.log(`IPC: cancelDetection - ${detectionId}`);
      return await environmentDetectionService.cancelDetection(detectionId);
    } catch (error: any) {
      console.error(`cancelDetection error: ${error.message}`);
      return false;
    }
  });

  ipcMain.handle('environment:getStatistics', async () => {
    try {
      return environmentDetectionService.getStatistics();
    } catch (error: any) {
      console.error(`getEnvironmentStatistics error: ${error.message}`);
      return { activeDetections: 0, totalDetectionsRun: 0 };
    }
  });

  // ========================================
  // File Watcher Handlers
  // ========================================

  ipcMain.handle('filewatcher:start', async (_, profileId: string) => {
    try {
      console.log(`IPC: filewatcher:start for profile "${profileId}"`);
      const { getFileWatcherService } = await import('./services/fileWatcherService');
      const fileWatcher = getFileWatcherService();

      if (mainWindow) {
        fileWatcher.setMainWindow(mainWindow);
      }

      await fileWatcher.watchProfile(profileId);
      return { success: true, profileId };
    } catch (error: any) {
      console.error(`filewatcher:start error: ${error.message}`);
      throw new Error(`Failed to start file watcher: ${error.message}`);
    }
  });

  ipcMain.handle('filewatcher:stop', async (_, profileId: string) => {
    try {
      console.log(`IPC: filewatcher:stop for profile "${profileId}"`);
      const { getFileWatcherService } = await import('./services/fileWatcherService');
      const fileWatcher = getFileWatcherService();

      await fileWatcher.stopWatching(profileId);
      return { success: true, profileId };
    } catch (error: any) {
      console.error(`filewatcher:stop error: ${error.message}`);
      throw new Error(`Failed to stop file watcher: ${error.message}`);
    }
  });

  ipcMain.handle('filewatcher:stopAll', async () => {
    try {
      console.log('IPC: filewatcher:stopAll');
      const { getFileWatcherService } = await import('./services/fileWatcherService');
      const fileWatcher = getFileWatcherService();

      await fileWatcher.stopAll();
      return { success: true };
    } catch (error: any) {
      console.error(`filewatcher:stopAll error: ${error.message}`);
      throw new Error(`Failed to stop all file watchers: ${error.message}`);
    }
  });

  ipcMain.handle('filewatcher:getWatchedFiles', async () => {
    try {
      const { getFileWatcherService } = await import('./services/fileWatcherService');
      const fileWatcher = getFileWatcherService();

      return fileWatcher.getWatchedFiles();
    } catch (error: any) {
      console.error(`filewatcher:getWatchedFiles error: ${error.message}`);
      return [];
    }
  });

  ipcMain.handle('filewatcher:getStatistics', async () => {
    try {
      const { getFileWatcherService } = await import('./services/fileWatcherService');
      const fileWatcher = getFileWatcherService();

      return fileWatcher.getStatistics();
    } catch (error: any) {
      console.error(`filewatcher:getStatistics error: ${error.message}`);
      return {
        activeWatchers: 0,
        watchedDirectories: [],
        totalEvents: 0,
        eventsByType: { added: 0, changed: 0, deleted: 0 }
      };
    }
  });

  // ========================================
  // User Detail Handlers (Epic 1 Task 1.2)
  // ========================================

  /**
   * IPC Handler: get-user-detail
   *
   * Retrieves comprehensive user detail projection from LogicEngineService.
   * Currently using MockLogicEngineService until Epic 4 completes.
   *
   * @param userId - User SID or UPN
   * @returns UserDetailProjection with all correlated data
   */
  ipcMain.handle('get-user-detail', async (_, args: { userId: string }) => {
    const { userId } = args;

    try {
      console.log(`IPC: get-user-detail - ${userId}`);

      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid userId parameter');
      }

      // Use mock service for now (will be replaced with real LogicEngineService in Epic 4)
      const userDetail = await mockLogicEngineService.getUserDetailAsync(userId);

      if (!userDetail) {
        return {
          success: false,
          error: `User not found: ${userId}`,
          data: null,
        };
      }

      return {
        success: true,
        data: userDetail,
      };
    } catch (error: any) {
      console.error('get-user-detail error:', error);
      return {
        success: false,
        error: error.message || 'Failed to retrieve user details',
        data: null,
      };
    }
  });

  /**
   * IPC Handler: clear-user-detail-cache
   *
   * Clears cached user detail data for a specific user.
   * Forces fresh data retrieval on next load.
   */
  ipcMain.handle('clear-user-detail-cache', async (_, args: { userId: string }) => {
    const { userId } = args;

    try {
      console.log(`IPC: clear-user-detail-cache - ${userId}`);
      mockLogicEngineService.clearUserDetailCache(userId);

      return { success: true };
    } catch (error: any) {
      console.error('clear-user-detail-cache error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: export-user-snapshot
   *
   * Exports user detail snapshot to JSON or CSV file.
   *
   * @param userDetail - UserDetailProjection to export
   * @param format - 'json' or 'csv'
   * @param fileName - Output file name
   */
  ipcMain.handle('export-user-snapshot', async (_, args: {
    userDetail: UserDetailProjection;
    format: 'json' | 'csv';
    fileName: string;
  }) => {
    const { userDetail, format, fileName } = args;

    try {
      console.log(`IPC: export-user-snapshot - ${fileName} (${format})`);

      // Use downloads directory
      const downloadsPath = path.join(process.env.USERPROFILE || process.env.HOME || '', 'Downloads');
      const exportPath = path.join(downloadsPath, path.basename(fileName)); // Prevent directory traversal

      if (format === 'json') {
        await fs.writeFile(
          exportPath,
          JSON.stringify(userDetail, null, 2),
          'utf-8'
        );
      } else {
        // Convert to CSV (flatten nested structures)
        const csv = convertUserDetailToCSV(userDetail);
        await fs.writeFile(exportPath, csv, 'utf-8');
      }

      return { success: true, filePath: exportPath };
    } catch (error: any) {
      console.error('export-user-snapshot error:', error);
      return { success: false, error: error.message };
    }
  });

  // ========================================
  // Computer Detail Handlers (Epic 1 Task 1.3)
  // ========================================

  /**
   * IPC Handler: get-computer-detail
   * Retrieves comprehensive computer detail projection from LogicEngineService.
   */
  ipcMain.handle('get-computer-detail', async (_, args: { computerId: string }) => {
    const { computerId } = args;

    try {
      console.log(`IPC: get-computer-detail - ${computerId}`);

      if (!computerId || typeof computerId !== 'string') {
        throw new Error('Invalid computerId parameter');
      }

      const { mockComputerDetailService } = await import('./services/mockLogicEngineService');
      const computerDetail = await mockComputerDetailService.getComputerDetailAsync(computerId);

      if (!computerDetail) {
        return {
          success: false,
          error: `Computer not found: ${computerId}`,
          data: null,
        };
      }

      return {
        success: true,
        data: computerDetail,
      };
    } catch (error: any) {
      console.error('get-computer-detail error:', error);
      return {
        success: false,
        error: error.message || 'Failed to retrieve computer details',
        data: null,
      };
    }
  });

  /**
   * IPC Handler: clear-computer-detail-cache
   * Clears cached computer detail data for a specific computer.
   */
  ipcMain.handle('clear-computer-detail-cache', async (_, args: { computerId: string }) => {
    const { computerId } = args;
    try {
      console.log(`IPC: clear-computer-detail-cache - ${computerId}`);
      const { mockComputerDetailService } = await import('./services/mockLogicEngineService');
      mockComputerDetailService.clearComputerDetailCache(computerId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: export-computer-snapshot
   * Exports computer detail snapshot to JSON or CSV file.
   */
  ipcMain.handle('export-computer-snapshot', async (_, args: { computerDetail: any; format: string; fileName: string }) => {
    try {
      const { computerDetail, format, fileName } = args;
      const downloadsPath = path.join(process.env.USERPROFILE || process.env.HOME || '', 'Downloads');
      const exportPath = path.join(downloadsPath, path.basename(fileName));

      if (format === 'json') {
        await fs.writeFile(exportPath, JSON.stringify(computerDetail, null, 2), 'utf-8');
      } else if (format === 'csv') {
        // Basic CSV export - flatten computer data
        const csv = convertComputerDetailToCSV(computerDetail);
        await fs.writeFile(exportPath, csv, 'utf-8');
      }

      console.log(`Exported computer snapshot: ${exportPath}`);
      return { success: true, path: exportPath };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: remote-connect
   * Initiates remote connection to computer (RDP/PSRemoting)
   */
  ipcMain.handle('remote-connect', async (_, args: { computerId: string; connectionType: string }) => {
    try {
      const { computerId, connectionType } = args;
      console.log(`IPC: remote-connect - ${computerId} (${connectionType})`);

      // TODO: Implement RDP/PSRemoting connection logic in future
      // For now, just log and return success
      return { success: true, message: `${connectionType} connection initiated to ${computerId}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // ========================================
  // Group Detail Handlers (Epic 1 Task 1.4)
  // ========================================

  /**
   * IPC Handler: get-group-detail
   * Retrieves comprehensive group detail projection from LogicEngineService.
   */
  ipcMain.handle('get-group-detail', async (_, args: { groupId: string }) => {
    const { groupId } = args;

    try {
      console.log(`IPC: get-group-detail - ${groupId}`);

      if (!groupId || typeof groupId !== 'string') {
        throw new Error('Invalid groupId parameter');
      }

      const { mockGroupDetailService } = await import('./services/mockLogicEngineService');
      const groupDetail = await mockGroupDetailService.getGroupDetailAsync(groupId);

      if (!groupDetail) {
        return {
          success: false,
          error: `Group not found: ${groupId}`,
          data: null,
        };
      }

      return {
        success: true,
        data: groupDetail,
      };
    } catch (error: any) {
      console.error('get-group-detail error:', error);
      return {
        success: false,
        error: error.message || 'Failed to retrieve group details',
        data: null,
      };
    }
  });

  /**
   * IPC Handler: clear-group-detail-cache
   * Clears cached group detail data for a specific group.
   */
  ipcMain.handle('clear-group-detail-cache', async (_, args: { groupId: string }) => {
    const { groupId } = args;
    try {
      console.log(`IPC: clear-group-detail-cache - ${groupId}`);
      const { mockGroupDetailService } = await import('./services/mockLogicEngineService');
      mockGroupDetailService.clearGroupDetailCache(groupId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: export-group-snapshot
   * Exports group detail snapshot to JSON or CSV file.
   */
  ipcMain.handle('export-group-snapshot', async (_, args: { groupDetail: any; format: string; fileName: string }) => {
    try {
      const { groupDetail, format, fileName } = args;
      const downloadsPath = path.join(process.env.USERPROFILE || process.env.HOME || '', 'Downloads');
      const exportPath = path.join(downloadsPath, path.basename(fileName));

      if (format === 'json') {
        await fs.writeFile(exportPath, JSON.stringify(groupDetail, null, 2), 'utf-8');
      } else if (format === 'csv') {
        // Basic CSV export - flatten group data
        const csv = convertGroupDetailToCSV(groupDetail);
        await fs.writeFile(exportPath, csv, 'utf-8');
      }

      console.log(`Exported group snapshot: ${exportPath}`);
      return { success: true, path: exportPath };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: add-group-members
   * Adds members to a group (mock implementation)
   */
  ipcMain.handle('add-group-members', async (_, args: { groupId: string; memberIds: string[] }) => {
    try {
      const { groupId, memberIds } = args;
      console.log(`IPC: add-group-members - ${groupId} (${memberIds.length} members)`);

      // TODO: Implement add members logic in future
      // For now, just log and return success
      return { success: true, message: `Added ${memberIds.length} members to group ${groupId}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: update-group
   * Updates group properties (mock implementation)
   */
  ipcMain.handle('update-group', async (_, args: { groupId: string; updates: any }) => {
    try {
      const { groupId, updates } = args;
      console.log(`IPC: update-group - ${groupId}`, updates);

      // TODO: Implement update group logic in future
      // For now, just log and return success
      return { success: true, message: `Updated group ${groupId}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  console.log('All IPC handlers registered successfully');
}

/**
 * Helper: Convert UserDetailProjection to CSV format
 */
function convertUserDetailToCSV(userDetail: UserDetailProjection): string {
  const rows: string[] = [];

  // Header
  rows.push('Section,Key,Value');

  // User Info
  rows.push(`User,Display Name,"${escapeCSV(userDetail.user.displayName)}"`);
  rows.push(`User,UPN,"${escapeCSV(userDetail.user.userPrincipalName)}"`);
  rows.push(`User,Email,"${escapeCSV(userDetail.user.mail)}"`);
  rows.push(`User,Department,"${escapeCSV(userDetail.user.department)}"`);
  rows.push(`User,Job Title,"${escapeCSV(userDetail.user.jobTitle)}"`);

  // Groups
  userDetail.groups.forEach((group, i) => {
    rows.push(`Groups,Group ${i + 1},"${escapeCSV(group.name)}"`);
  });

  // Devices
  userDetail.devices.forEach((device, i) => {
    rows.push(`Devices,Device ${i + 1},"${escapeCSV(device.name)}"`);
  });

  // Apps
  userDetail.apps.forEach((app, i) => {
    rows.push(`Apps,App ${i + 1},"${escapeCSV(app.name)}"`);
  });

  // Azure Roles
  userDetail.azureRoles.forEach((role, i) => {
    rows.push(`Azure Roles,Role ${i + 1},"${escapeCSV(role.roleName)}"`);
  });

  // Risks
  userDetail.risks.forEach((risk, i) => {
    rows.push(`Risks,Risk ${i + 1},"${risk.severity}: ${escapeCSV(risk.description)}"`);
  });

  return rows.join('\n');
}

/**
 * Escape CSV field values
 */
function escapeCSV(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace(/"/g, '""');
}

/**
 * Helper: Convert ComputerDetailProjection to CSV format
 */
function convertComputerDetailToCSV(computerDetail: any): string {
  const rows: string[] = [];

  // Header
  rows.push('Section,Key,Value');

  // Computer Info
  rows.push(`Computer,Name,"${escapeCSV(computerDetail.computer.name)}"`);
  rows.push(`Computer,DNS,"${escapeCSV(computerDetail.computer.dns)}"`);
  rows.push(`Computer,Domain,"${escapeCSV(computerDetail.computer.domain)}"`);
  rows.push(`Computer,OS,"${escapeCSV(computerDetail.computer.os)}"`);
  rows.push(`Computer,Status,"${escapeCSV(computerDetail.computer.status)}"`);

  // Users
  computerDetail.users.forEach((user: any, i: number) => {
    rows.push(`Users,User ${i + 1},"${escapeCSV(user.displayName)}"`);
  });

  // Software
  computerDetail.software.forEach((software: any, i: number) => {
    rows.push(`Software,App ${i + 1},"${escapeCSV(software.name)}"`);
  });

  // Groups
  computerDetail.groups.forEach((group: any, i: number) => {
    rows.push(`Groups,Group ${i + 1},"${escapeCSV(group.name)}"`);
  });

  // Risks
  computerDetail.risks.forEach((risk: any, i: number) => {
    rows.push(`Risks,Risk ${i + 1},"${risk.severity}: ${escapeCSV(risk.description)}"`);
  });

  return rows.join('\n');
}

/**
 * Helper: Convert GroupDetailProjection to CSV format
 */
function convertGroupDetailToCSV(groupDetail: any): string {
  const rows: string[] = [];

  // Header
  rows.push('Section,Key,Value');

  // Group Info
  rows.push(`Group,Name,"${escapeCSV(groupDetail.group.name)}"`);
  rows.push(`Group,Display Name,"${escapeCSV(groupDetail.group.displayName)}"`);
  rows.push(`Group,Type,"${escapeCSV(groupDetail.group.groupType)}"`);
  rows.push(`Group,Scope,"${escapeCSV(groupDetail.group.scope)}"`);
  rows.push(`Group,Email,"${escapeCSV(groupDetail.group.email)}"`);

  // Members
  groupDetail.members.forEach((member: any, i: number) => {
    rows.push(`Members,Member ${i + 1},"${escapeCSV(member.displayName)} (${member.userPrincipalName})"`);
  });

  // Owners
  groupDetail.owners.forEach((owner: any, i: number) => {
    rows.push(`Owners,Owner ${i + 1},"${escapeCSV(owner.displayName)}"`);
  });

  // Permissions
  groupDetail.permissions.forEach((permission: any, i: number) => {
    rows.push(`Permissions,Permission ${i + 1},"${escapeCSV(permission.resourceName)} - ${permission.accessLevel}"`);
  });

  // Applications
  groupDetail.applications.forEach((app: any, i: number) => {
    rows.push(`Applications,App ${i + 1},"${escapeCSV(app.applicationName)} - ${app.roleName}"`);
  });

  // Risks
  groupDetail.risks.forEach((risk: any, i: number) => {
    rows.push(`Risks,Risk ${i + 1},"${risk.severity}: ${escapeCSV(risk.description)}"`);
  });

  return rows.join('\n');
}

/**
 * Cleanup function to shutdown services
 */
export async function shutdownIpcHandlers(): Promise<void> {
  console.log('Shutting down IPC services...');

  if (psService) {
    await psService.shutdown();
  }

  // Save configuration one last time
  await saveConfig();

  console.log('IPC services shutdown complete');
}
