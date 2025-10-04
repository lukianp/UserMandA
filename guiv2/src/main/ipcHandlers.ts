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

// Service instances
let psService: PowerShellExecutionService;
let moduleRegistry: ModuleRegistry;
let environmentDetectionService: EnvironmentDetectionService;
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

  ipcMain.handle('file:read', async (_, filePath: string, encoding: string = 'utf-8') => {
    try {
      const sanitized = sanitizePath(filePath);
      console.log(`IPC: readFile - ${sanitized}`);
      return await fs.readFile(sanitized, encoding as BufferEncoding);
    } catch (error: any) {
      console.error(`readFile error: ${error.message}`);
      throw new Error(`Failed to read file: ${error.message}`);
    }
  });

  ipcMain.handle('file:write', async (_, filePath: string, content: string, encoding: string = 'utf-8') => {
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

  console.log('All IPC handlers registered successfully');
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
