/**
 * IPC Handlers Registration
 *
 * Registers all IPC communication channels between renderer and main process.
 * Provides secure bridge for PowerShell execution, file operations, configuration, and more.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

import { ipcMain, dialog, shell, BrowserWindow } from 'electron';

import { ScriptExecutionParams, ModuleExecutionParams, ScriptTask } from '../types/shared';
import type { UserDetailProjection } from '../renderer/types/models/userDetail';

import { PowerShellExecutionService } from './services/powerShellService';
import ModuleRegistry from './services/moduleRegistry';
import EnvironmentDetectionService from './services/environmentDetectionService';
import { MockLogicEngineService } from './services/mockLogicEngineService';
import { LogicEngineService } from './services/logicEngineService';
import { ProjectService } from './services/projectService';
import { DashboardService } from './services/dashboardService';
import { ProfileService } from './services/profileService';


// Service instances
let psService: PowerShellExecutionService;
let moduleRegistry: ModuleRegistry;
let environmentDetectionService: EnvironmentDetectionService;
let mockLogicEngineService: MockLogicEngineService;
let logicEngineService: LogicEngineService;
let projectService: ProjectService;
let dashboardService: DashboardService;
let profileService: ProfileService;
let mainWindow: BrowserWindow | null = null;

// Configuration storage
const configPath = path.join(process.cwd(), 'config', 'app-config.json');
interface AppConfig {
  [key: string]: string | number | boolean | null | undefined;
}
let appConfig: AppConfig = {};

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
  } catch (error: unknown) {
    console.warn(`Could not load module registry: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Initialize Environment Detection Service
  environmentDetectionService = new EnvironmentDetectionService(psService);
  console.log('Environment Detection Service initialized');

  // Initialize Mock Logic Engine Service
  mockLogicEngineService = MockLogicEngineService.getInstance();
  console.log('Mock Logic Engine Service initialized');

  // Initialize Real Logic Engine Service
  const defaultDataRoot = path.join('C:', 'discoverydata', 'ljpops', 'Raw');
  logicEngineService = LogicEngineService.getInstance(defaultDataRoot);
  console.log('Logic Engine Service initialized');

  // Initialize Project Service
  projectService = new ProjectService();
  console.log('Project Service initialized');

  // Initialize Dashboard Service (depends on LogicEngine and Project Service)
  dashboardService = new DashboardService(logicEngineService, projectService);
  console.log('Dashboard Service initialized');

  // Initialize Profile Service with auto-discovery
  profileService = new ProfileService();
  await profileService.initialize();

  // Initialize FileSystem Service
  const { FileSystemService } = await import('./services/FileSystemService');
  const fsService = new FileSystemService();

  console.log('Profile Service initialized');
  console.log('FileSystem Service initialized');

  // Get active profile and load its data into Logic Engine
  const activeProfile = await profileService.getCurrentProfile();
  if (activeProfile) {
    console.log(`[ProfileService] Active profile found: ${activeProfile.companyName}`);
    const dataPath = profileService.getCompanyDataPath(activeProfile.companyName);
    const rawPath = path.join(dataPath, 'Raw');
    console.log(`[ProfileService] Loading data from: ${rawPath}`);

    // Update Logic Engine to use active profile's data path
    logicEngineService = LogicEngineService.getInstance(rawPath);

    // Load all CSV data asynchronously (don't block startup)
    logicEngineService.loadAllAsync(rawPath).then((success) => {
      if (success) {
        console.log(`[LogicEngine] Successfully loaded data for profile: ${activeProfile.companyName}`);
      } else {
        console.warn(`[LogicEngine] Failed to load data for profile: ${activeProfile.companyName}`);
      }
    }).catch((error) => {
      console.error(`[LogicEngine] Error loading data: ${error}`);
    });
  } else {
    console.warn('[ProfileService] No active profile found - Logic Engine will use default hardcoded path');
  }

  // Load application configuration
  try {
    const configData = await fs.readFile(configPath, 'utf-8');
    appConfig = JSON.parse(configData);
    console.log('Loaded application configuration');
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.log('No configuration file found, starting with defaults');
      appConfig = {};
      // Create config directory
      await fs.mkdir(path.dirname(configPath), { recursive: true });
    } else {
      console.error(`Failed to load config: ${error instanceof Error ? error.message : String(error)}`);
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
  } catch (error: unknown) {
    console.error(`Failed to save config: ${error instanceof Error ? error.message : String(error)}`);
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
    } catch (error: unknown) {
      console.error(`executeScript error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
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
    } catch (error: unknown) {
      console.error(`executeModule error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: 0,
        warnings: [] as string[],
      };
    }
  });

  ipcMain.handle('powershell:cancel', async (_, token: string) => {
    try {
      console.log(`IPC: cancelExecution - ${token}`);
      return psService.cancelExecution(token);
    } catch (error: unknown) {
      console.error(`cancelExecution error: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  });

  ipcMain.handle('powershell:getStatistics', async () => {
    try {
      return psService.getStatistics();
    } catch (error: unknown) {
      console.error(`getStatistics error: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  });

  // New enhanced PowerShell handlers
  ipcMain.handle('powershell:discoverModules', async () => {
    try {
      console.log('IPC: discoverModules');
      return await psService.discoverModules();
    } catch (error: unknown) {
      console.error(`discoverModules error: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  });

  ipcMain.handle('powershell:executeParallel', async (_, scripts: ScriptTask[]) => {
    try {
      console.log(`IPC: executeParallel - ${scripts.length} scripts`);
      return await psService.executeParallel(scripts);
    } catch (error: unknown) {
      console.error(`executeParallel error: ${error instanceof Error ? error.message : String(error)}`);
      return scripts.map(() => ({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: 0,
        warnings: [] as string[],
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
    } catch (error: unknown) {
      console.error(`executeWithRetry error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
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
    } catch (error: unknown) {
      console.error(`getModulesByCategory error: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  });

  ipcMain.handle('modules:getAll', async () => {
    try {
      return moduleRegistry.getAllModules();
    } catch (error: unknown) {
      console.error(`getAllModules error: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  });

  ipcMain.handle('modules:getById', async (_, moduleId: string) => {
    try {
      return moduleRegistry.getModule(moduleId);
    } catch (error: unknown) {
      console.error(`getModule error: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  });

  ipcMain.handle('modules:search', async (_, query: string) => {
    try {
      return moduleRegistry.searchModules(query);
    } catch (error: unknown) {
      console.error(`searchModules error: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  });

  ipcMain.handle('modules:execute', async (_, moduleId: string, params: Record<string, any>, options?: any) => {
    try {
      console.log(`IPC: executeModule - ${moduleId}`);
      return await moduleRegistry.executeModule(moduleId, params, options);
    } catch (error: unknown) {
      console.error(`executeModule error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: 0,
        warnings: [],
      };
    }
  });

  ipcMain.handle('modules:getStatistics', async () => {
    try {
      return moduleRegistry.getStatistics();
    } catch (error: unknown) {
      console.error(`getModuleStatistics error: ${error instanceof Error ? error.message : String(error)}`);
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
    } catch (error: unknown) {
      console.error(`readFile error: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to read file: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  ipcMain.handle('file:write', async (_, filePath: string, content: string, encoding = 'utf-8') => {
    try {
      const sanitized = sanitizePath(filePath);
      console.log(`IPC: writeFile - ${sanitized}`);
      // Ensure directory exists
      await fs.mkdir(path.dirname(sanitized), { recursive: true });
      await fs.writeFile(sanitized, content, encoding as BufferEncoding);
    } catch (error: unknown) {
      console.error(`writeFile error: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to write file: ${error instanceof Error ? error.message : String(error)}`);
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
    } catch (error: unknown) {
      console.error(`deleteFile error: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : String(error)}`);
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
    } catch (error: unknown) {
      console.error(`listFiles error: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to list files: ${error instanceof Error ? error.message : String(error)}`);
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
    } catch (error: unknown) {
      console.error(`statFile error: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to stat file: ${error instanceof Error ? error.message : String(error)}`);
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

  /**
   * Load all source profiles (includes auto-discovered profiles from C:\DiscoveryData)
   */
  ipcMain.handle('profile:loadSourceProfiles', async () => {
    try {
      const profiles = await profileService.getProfiles();
      console.log(`Loaded ${profiles.length} source profiles`);
      return profiles;
    } catch (error: unknown) {
      console.error(`loadSourceProfiles error: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  });

  // NOTE: 'profile:loadTargetProfiles' handler is registered in ./ipc/targetProfileHandlers.ts

  /**
   * Get active source profile
   */
  ipcMain.handle('profile:getActiveSource', async () => {
    try {
      const profile = await profileService.getCurrentProfile();
      return profile;
    } catch (error: unknown) {
      console.error(`getActiveSource error: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  });

  /**
   * Get active target profile
   */
  ipcMain.handle('profile:getActiveTarget', async () => {
    try {
      // For now, return same as active profile (target profiles not yet implemented)
      const profile = await profileService.getCurrentProfile();
      return profile;
    } catch (error: unknown) {
      console.error(`getActiveTarget error: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  });

  /**
   * Create a new source profile
   */
  ipcMain.handle('profile:createSource', async (_, profile: any) => {
    try {
      const newProfile = await profileService.createProfile(profile);
      console.log(`Created source profile: ${newProfile.id}`);
      return { success: true, profile: newProfile };
    } catch (error: unknown) {
      console.error(`createSource error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  // NOTE: 'profile:createTarget' handler is registered in ./ipc/targetProfileHandlers.ts

  /**
   * Update a source profile
   */
  ipcMain.handle('profile:updateSource', async (_, id: string, updates: any) => {
    try {
      const profile = await profileService.updateProfile({ id, ...updates });
      console.log(`Updated source profile: ${id}`);
      return { success: true, profile };
    } catch (error: unknown) {
      console.error(`updateSource error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  // NOTE: 'profile:updateTarget' handler is registered in ./ipc/targetProfileHandlers.ts

  /**
   * Delete a source profile
   */
  ipcMain.handle('profile:deleteSource', async (_, profileId: string) => {
    try {
      const success = await profileService.deleteProfile(profileId);
      console.log(`Deleted source profile: ${profileId}`);
      return { success };
    } catch (error: unknown) {
      console.error(`deleteSource error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  // NOTE: 'profile:deleteTarget' handler is registered in ./ipc/targetProfileHandlers.ts

  /**
   * Set active source profile
   */
  ipcMain.handle('profile:setActiveSource', async (_, profileId: string) => {
    try {
      const success = await profileService.setCurrentProfile(profileId);
      console.log(`Set active source profile: ${profileId}`);

      // Update Logic Engine data path to use this profile's data
      const dataPath = profileService.getCompanyDataPath(profileId);
      const rawPath = path.join(dataPath, 'Raw');
      console.log(`Updating Logic Engine data path to: ${rawPath}`);

      // Reinitialize Logic Engine with new data path
      logicEngineService = LogicEngineService.getInstance(rawPath);

      return { success, dataPath: rawPath };
    } catch (error: unknown) {
      console.error(`setActiveSource error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * Set active target profile
   */
  ipcMain.handle('profile:setActiveTarget', async (_, profileId: string) => {
    try {
      const profileService = getProfileService();
      await profileService.setActiveTargetProfile(profileId);
      console.log(`Set active target profile: ${profileId}`);
      return { success: true };
    } catch (error: unknown) {
      console.error(`setActiveTarget error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * Refresh profiles (re-run auto-discovery)
   */
  ipcMain.handle('profile:refresh', async () => {
    try {
      const profileService = getProfileService();
      await profileService.refreshProfiles();
      const sourceProfiles = profileService.getSourceProfiles();
      console.log(`Refreshed profiles: ${sourceProfiles.length} source profiles found`);
      return { success: true, profiles: sourceProfiles };
    } catch (error: unknown) {
      console.error(`refresh profiles error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * Get profile data path for a source profile
   */
  ipcMain.handle('profile:getDataPath', async (_, profileId: string) => {
    try {
      const profileService = getProfileService();
      const dataPath = profileService.getProfileDataPath(profileId);
      return { success: true, dataPath };
    } catch (error: unknown) {
      console.error(`getDataPath error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  // ========================================
  // Credential Management Handlers
  // ========================================

  /**
   * Load credentials for a profile
   * Uses precedence: ENV > safeStorage > Legacy File
   */
  ipcMain.handle('credentials:load', async (_, args: { profileId: string }) => {
    const { profileId } = args;
    try {
      console.log(`IPC: credentials:load - ${profileId}`);
      const { CredentialService } = await import('./services/credentialService');
      const credService = new CredentialService();
      await credService.initialize();

      const creds = await credService.getCredential(profileId);

      if (creds) {
        // Return sanitized credentials (no secrets to renderer)
        return {
          ok: true,
          credentials: {
            tenantId: creds.tenantId,
            clientId: creds.clientId,
            hasSecret: !!(creds.clientSecret || creds.password),
            connectionType: creds.connectionType,
            username: creds.username,
          }
        };
      }

      return { ok: false, error: 'No credentials found for profile' };
    } catch (error: unknown) {
      console.error(`credentials:load error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * Save credentials for a profile
   */
  ipcMain.handle('credentials:save', async (_, args: {
    profileId: string;
    username: string;
    password: string;
    connectionType: 'ActiveDirectory' | 'AzureAD' | 'Exchange' | 'SharePoint';
    domain?: string;
  }) => {
    const { profileId, username, password, connectionType, domain } = args;
    try {
      console.log(`IPC: credentials:save - ${profileId}`);
      const { CredentialService } = await import('./services/credentialService');
      const credService = new CredentialService();
      await credService.initialize();

      await credService.storeCredential(profileId, username, password, connectionType, domain);

      return { ok: true };
    } catch (error: unknown) {
      console.error(`credentials:save error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * Delete credentials for a profile
   */
  ipcMain.handle('credentials:delete', async (_, args: { profileId: string }) => {
    const { profileId } = args;
    try {
      console.log(`IPC: credentials:delete - ${profileId}`);
      const { CredentialService } = await import('./services/credentialService');
      const credService = new CredentialService();
      await credService.initialize();

      await credService.deleteCredential(profileId);

      return { ok: true };
    } catch (error: unknown) {
      console.error(`credentials:delete error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * Check if credentials exist for a profile
   */
  ipcMain.handle('credentials:exists', async (_, args: { profileId: string }) => {
    const { profileId } = args;
    try {
      const { CredentialService } = await import('./services/credentialService');
      const credService = new CredentialService();
      await credService.initialize();

      const exists = await credService.hasCredential(profileId);

      return { ok: true, exists };
    } catch (error: unknown) {
      console.error(`credentials:exists error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      };
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
    } catch (error: unknown) {
      console.error(`openExternal error: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to open external: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  ipcMain.handle('system:showOpenDialog', async (_, options: any) => {
    try {
      const result = await dialog.showOpenDialog(options);
      return result.canceled ? null : result.filePaths;
    } catch (error: unknown) {
      console.error(`showOpenDialog error: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  });

  ipcMain.handle('system:showSaveDialog', async (_, options: any) => {
    try {
      const result = await dialog.showSaveDialog(options);
      return result.canceled ? null : result.filePath;
    } catch (error: unknown) {
      console.error(`showSaveDialog error: ${error instanceof Error ? error.message : String(error)}`);
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
    } catch (error: unknown) {
      console.error(`detectEnvironment error: ${error instanceof Error ? error.message : String(error)}`);
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
        errors: [{ timestamp: new Date(), serviceType: 'system', message: error instanceof Error ? error.message : String(error) }],
        warnings: [] as any[], // TODO: Define proper warning type
      };
    }
  });

  ipcMain.handle('environment:validateCredentials', async (_, provider: string, credentials: any) => {
    try {
      console.log(`IPC: validateCredentials - ${provider}`);
      return await environmentDetectionService.validateCredentials(provider as any, credentials);
    } catch (error: unknown) {
      console.error(`validateCredentials error: ${error instanceof Error ? error.message : String(error)}`);
      return { valid: false, message: error instanceof Error ? error.message : String(error) };
    }
  });

  ipcMain.handle('environment:cancel', async (_, detectionId: string) => {
    try {
      console.log(`IPC: cancelDetection - ${detectionId}`);
      return await environmentDetectionService.cancelDetection(detectionId);
    } catch (error: unknown) {
      console.error(`cancelDetection error: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  });

  ipcMain.handle('environment:getStatistics', async () => {
    try {
      return environmentDetectionService.getStatistics();
    } catch (error: unknown) {
      console.error(`getEnvironmentStatistics error: ${error instanceof Error ? error.message : String(error)}`);
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
    } catch (error: unknown) {
      console.error(`filewatcher:start error: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to start file watcher: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  ipcMain.handle('filewatcher:stop', async (_, profileId: string) => {
    try {
      console.log(`IPC: filewatcher:stop for profile "${profileId}"`);
      const { getFileWatcherService } = await import('./services/fileWatcherService');
      const fileWatcher = getFileWatcherService();

      await fileWatcher.stopWatching(profileId);
      return { success: true, profileId };
    } catch (error: unknown) {
      console.error(`filewatcher:stop error: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to stop file watcher: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  ipcMain.handle('filewatcher:stopAll', async () => {
    try {
      console.log('IPC: filewatcher:stopAll');
      const { getFileWatcherService } = await import('./services/fileWatcherService');
      const fileWatcher = getFileWatcherService();

      await fileWatcher.stopAll();
      return { success: true };
    } catch (error: unknown) {
      console.error(`filewatcher:stopAll error: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to stop all file watchers: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  ipcMain.handle('filewatcher:getWatchedFiles', async () => {
    try {
      const { getFileWatcherService } = await import('./services/fileWatcherService');
      const fileWatcher = getFileWatcherService();

      return fileWatcher.getWatchedFiles();
    } catch (error: unknown) {
      console.error(`filewatcher:getWatchedFiles error: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  });

  ipcMain.handle('filewatcher:getStatistics', async () => {
    try {
      const { getFileWatcherService } = await import('./services/fileWatcherService');
      const fileWatcher = getFileWatcherService();

      return fileWatcher.getStatistics();
    } catch (error: unknown) {
      console.error(`filewatcher:getStatistics error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        activeWatchers: 0,
        watchedDirectories: [] as string[],
        totalEvents: 0,
        eventsByType: { added: 0, changed: 0, deleted: 0 }
      };
    }
  });

  // ========================================
  // Logic Engine Handlers (Epic 4)
  // ========================================

  /**
   * IPC Handler: logic-engine:load-all
   *
   * Loads all discovery data from CSV files into the Logic Engine.
   * Performs data correlation, inference rule application, and graph building.
   *
   * @param profilePath - Optional path to profile data directory
   * @returns Success status and load statistics
   */
  ipcMain.handle('logic-engine:load-all', async (_, args: { profilePath?: string }) => {
    const { profilePath } = args;

    try {
      console.log(`IPC: logic-engine:load-all - ${profilePath || 'default'}`);

      // Set up progress event listener
      const progressHandler = (progress: any) => {
        if (mainWindow) {
          mainWindow.webContents.send('logic-engine:progress', progress);
        }
      };

      const loadedHandler = (data: any) => {
        if (mainWindow) {
          mainWindow.webContents.send('logic-engine:loaded', data);
        }
      };

      const errorHandler = (error: any) => {
        if (mainWindow) {
          mainWindow.webContents.send('logic-engine:error', error);
        }
      };

      logicEngineService.on('progress', progressHandler);
      logicEngineService.on('loaded', loadedHandler);
      logicEngineService.on('error', errorHandler);

      // Perform the load
      const success = await logicEngineService.loadAllAsync(profilePath);

      // Remove listeners
      logicEngineService.removeListener('progress', progressHandler);
      logicEngineService.removeListener('loaded', loadedHandler);
      logicEngineService.removeListener('error', errorHandler);

      return {
        success,
        statistics: success ? logicEngineService['lastLoadStats'] : null
      };
    } catch (error: unknown) {
      console.error('logic-engine:load-all error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * IPC Handler: logic-engine:get-user-detail
   *
   * Retrieves comprehensive user detail projection with all correlated data.
   * Includes groups, devices, apps, permissions, risks, and migration hints.
   *
   * @param userId - User SID or UPN
   * @returns UserDetailProjection with complete user context
   */
  ipcMain.handle('logic-engine:get-user-detail', async (_, args: { userId: string }) => {
    const { userId } = args;

    try {
      console.log(`IPC: logic-engine:get-user-detail - ${userId}`);

      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid userId parameter');
      }

      const projection = await logicEngineService.buildUserDetailProjection(userId);

      if (!projection) {
        return {
          success: false,
          error: `User not found: ${userId}`
        };
      }

      return {
        success: true,
        data: projection
      };
    } catch (error: unknown) {
      console.error('logic-engine:get-user-detail error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * IPC Handler: logic-engine:get-statistics
   *
   * Returns current data load statistics from the Logic Engine.
   *
   * @returns Data load statistics including entity counts and inference metrics
   */
  ipcMain.handle('logic-engine:get-statistics', async () => {
    try {
      return {
        success: true,
        data: {
          statistics: logicEngineService['lastLoadStats'],
          lastLoadTime: logicEngineService.getLastLoadTime(),
          isLoading: logicEngineService.getIsLoading()
        }
      };
    } catch (error: unknown) {
      console.error('logic-engine:get-statistics error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * IPC Handler: logic-engine:invalidate-cache
   *
   * Forces the Logic Engine to reload data on next access.
   * Useful after external data changes.
   *
   * @returns Success status
   */
  ipcMain.handle('logic-engine:invalidate-cache', async () => {
    try {
      // Clear file load times to force reload
      logicEngineService['fileLoadTimes'].clear();

      return {
        success: true
      };
    } catch (error: unknown) {
      console.error('logic-engine:invalidate-cache error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  // ========================================
  // Dashboard & Project Handlers (Dashboard Enhancement)
  // ========================================

  /**
   * IPC Handler: dashboard:getStats
   *
   * Get aggregated dashboard statistics from Logic Engine
   */
  ipcMain.handle('dashboard:getStats', async (_, profileName: string) => {
    try {
      const stats = await dashboardService.getStats(profileName);
      return { success: true, data: stats };
    } catch (error: unknown) {
      console.error('dashboard:getStats error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * IPC Handler: dashboard:getProjectTimeline
   *
   * Get project timeline information
   */
  ipcMain.handle('dashboard:getProjectTimeline', async (_, profileName: string) => {
    try {
      const timeline = await dashboardService.getProjectTimeline(profileName);
      return { success: true, data: timeline };
    } catch (error: unknown) {
      console.error('dashboard:getProjectTimeline error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * IPC Handler: dashboard:getSystemHealth
   *
   * Get system health status
   */
  ipcMain.handle('dashboard:getSystemHealth', async () => {
    try {
      const health = await dashboardService.getSystemHealth();
      return { success: true, data: health };
    } catch (error: unknown) {
      console.error('dashboard:getSystemHealth error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * IPC Handler: dashboard:getRecentActivity
   *
   * Get recent activity from logs
   */
  ipcMain.handle('dashboard:getRecentActivity', async (_, profileName: string, limit = 10) => {
    try {
      const activities = await dashboardService.getRecentActivity(profileName, limit);
      return { success: true, data: activities };
    } catch (error: unknown) {
      console.error('dashboard:getRecentActivity error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * IPC Handler: dashboard:acknowledgeAlert
   *
   * Acknowledge a system alert
   */
  ipcMain.handle('dashboard:acknowledgeAlert', async (_, alertId: string) => {
    try {
      await dashboardService.acknowledgeAlert(alertId);
      return { success: true };
    } catch (error: unknown) {
      console.error('dashboard:acknowledgeAlert error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  // ========================================
  // Migration Analysis Handlers (TASK 5)
  // ========================================

  /**
   * IPC Handler: logicEngine:analyzeMigrationComplexity
   *
   * Analyze migration complexity for a user
   * Returns complexity score with level and contributing factors
   */
  ipcMain.handle('logicEngine:analyzeMigrationComplexity', async (_, userId: string) => {
    try {
      console.log(`Analyzing migration complexity for user: ${userId}`);

      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid userId parameter');
      }

      // Call Logic Engine complexity analysis
      const complexity = await logicEngineService.analyzeMigrationComplexity(userId);

      return {
        success: true,
        data: complexity
      };
    } catch (error: unknown) {
      console.error('logicEngine:analyzeMigrationComplexity error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * IPC Handler: logicEngine:batchAnalyzeMigrationComplexity
   *
   * Batch analyze migration complexity for multiple users
   */
  ipcMain.handle('logicEngine:batchAnalyzeMigrationComplexity', async (_, userIds: string[]) => {
    try {
      console.log(`Batch analyzing migration complexity for ${userIds.length} users`);

      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new Error('Invalid userIds parameter');
      }

      // Call Logic Engine batch analysis
      const results = await logicEngineService.batchAnalyzeMigrationComplexity(userIds);

      // Convert Map to object for JSON serialization
      const resultsObj: Record<string, any> = {};
      results.forEach((value, key) => {
        resultsObj[key] = value;
      });

      return {
        success: true,
        data: resultsObj
      };
    } catch (error: unknown) {
      console.error('logicEngine:batchAnalyzeMigrationComplexity error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * IPC Handler: logicEngine:getComplexityStatistics
   *
   * Get complexity statistics for all analyzed users
   */
  ipcMain.handle('logicEngine:getComplexityStatistics', async () => {
    try {
      const stats = logicEngineService.getComplexityStatistics();

      return {
        success: true,
        data: stats
      };
    } catch (error: unknown) {
      console.error('logicEngine:getComplexityStatistics error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * IPC Handler: logicEngine:getAllUsers
   *
   * Get all users from the Logic Engine
   */
  ipcMain.handle('logicEngine:getAllUsers', async () => {
    try {
      const users = logicEngineService.getAllUsers();
      console.log(`[LogicEngine] Retrieved ${users.length} users`);

      return {
        success: true,
        data: users
      };
    } catch (error: unknown) {
      console.error('logicEngine:getAllUsers error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * IPC Handler: logicEngine:getAllGroups
   *
   * Get all groups from the Logic Engine
   */
  ipcMain.handle('logicEngine:getAllGroups', async () => {
    try {
      const groups = logicEngineService.getAllGroups();
      console.log(`[LogicEngine] Retrieved ${groups.length} groups`);

      return {
        success: true,
        data: groups
      };
    } catch (error: unknown) {
      console.error('logicEngine:getAllGroups error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * IPC Handler: logicEngine:getAllDevices
   *
   * Get all devices from the Logic Engine
   */
  ipcMain.handle('logicEngine:getAllDevices', async () => {
    try {
      const devices = logicEngineService.getAllDevices();
      console.log(`[LogicEngine] Retrieved ${devices.length} devices`);

      return {
        success: true,
        data: devices
      };
    } catch (error: unknown) {
      console.error('logicEngine:getAllDevices error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * IPC Handler: logicEngine:getAllApplications
   *
   * Get all applications from the Logic Engine
   */
  ipcMain.handle('logicEngine:getAllApplications', async () => {
    try {
      const apps = logicEngineService.getAllApplications();
      console.log(`[LogicEngine] Retrieved ${apps.length} applications`);

      return {
        success: true,
        data: apps
      };
    } catch (error: unknown) {
      console.error('logicEngine:getAllApplications error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * IPC Handler: project:getConfiguration
   *
   * Get project configuration for a profile
   */
  ipcMain.handle('project:getConfiguration', async (_, profileName: string) => {
    try {
      const config = await projectService.loadProjectConfig(profileName);
      return { success: true, data: config };
    } catch (error: unknown) {
      console.error('project:getConfiguration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * IPC Handler: project:saveConfiguration
   *
   * Save project configuration
   */
  ipcMain.handle('project:saveConfiguration', async (_, profileName: string, config: any) => {
    try {
      await projectService.saveProjectConfig(profileName, config);
      return { success: true };
    } catch (error: unknown) {
      console.error('project:saveConfiguration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * IPC Handler: project:updateStatus
   *
   * Update project status
   */
  ipcMain.handle('project:updateStatus', async (_, profileName: string, status: string) => {
    try {
      await projectService.updateProjectStatus(profileName, status as any);
      return { success: true };
    } catch (error: unknown) {
      console.error('project:updateStatus error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * IPC Handler: project:addWave
   *
   * Add a migration wave
   */
  ipcMain.handle('project:addWave', async (_, profileName: string, wave: any) => {
    try {
      await projectService.addMigrationWave(profileName, wave);
      return { success: true };
    } catch (error: unknown) {
      console.error('project:addWave error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  /**
   * IPC Handler: project:updateWaveStatus
   *
   * Update wave status
   */
  ipcMain.handle('project:updateWaveStatus', async (_, profileName: string, waveId: string, status: string) => {
    try {
      await projectService.updateWaveStatus(profileName, waveId, status as any);
      return { success: true };
    } catch (error: unknown) {
      console.error('project:updateWaveStatus error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
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
    } catch (error: unknown) {
      console.error('get-user-detail error:', error);
      return {
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Failed to retrieve user details',
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
    } catch (error: unknown) {
      console.error('clear-user-detail-cache error:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
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
    } catch (error: unknown) {
      console.error('export-user-snapshot error:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
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
    } catch (error: unknown) {
      console.error('get-computer-detail error:', error);
      return {
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Failed to retrieve computer details',
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
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
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
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
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
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
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
    } catch (error: unknown) {
      console.error('get-group-detail error:', error);
      return {
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Failed to retrieve group details',
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
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
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
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
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
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
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
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  // ========================================
  // Discovery Module Execution Handlers (Epic 3)
  // ========================================

  /**
   * Execute discovery module with real-time streaming
   * Emits events: discovery:output, discovery:progress, discovery:complete, discovery:error
   */
  ipcMain.handle('discovery:execute', async (event, args: {
    moduleName: string;
    parameters: Record<string, any>;
    executionId?: string;
  }) => {
    const { moduleName, parameters, executionId } = args;

    try {
      // Generate execution ID if not provided
      const execId = executionId || crypto.randomUUID();

      console.log(`IPC: discovery:execute - ${moduleName} (executionId: ${execId})`);

      // Create execution context
      const execution = {
        id: execId,
        moduleName,
        parameters,
        startTime: Date.now(),
      };

      // Stream output events back to renderer
      const outputListeners: Array<() => void> = [];

      // Listen to all 6 PowerShell streams
      const onOutputStream = (data: any) => {
        if (mainWindow) {
          mainWindow.webContents.send('discovery:output', {
            executionId: execId,
            timestamp: new Date().toISOString(),
            level: 'output',
            message: data.data,
            source: moduleName,
          });
        }
      };

      const onErrorStream = (data: any) => {
        if (mainWindow) {
          mainWindow.webContents.send('discovery:output', {
            executionId: execId,
            timestamp: new Date().toISOString(),
            level: 'error',
            message: data.data,
            source: moduleName,
          });
        }
      };

      const onWarningStream = (data: any) => {
        if (mainWindow) {
          mainWindow.webContents.send('discovery:output', {
            executionId: execId,
            timestamp: new Date().toISOString(),
            level: 'warning',
            message: data.data,
            source: moduleName,
          });
        }
      };

      const onVerboseStream = (data: any) => {
        if (mainWindow) {
          mainWindow.webContents.send('discovery:output', {
            executionId: execId,
            timestamp: new Date().toISOString(),
            level: 'verbose',
            message: data.data,
            source: moduleName,
          });
        }
      };

      const onDebugStream = (data: any) => {
        if (mainWindow) {
          mainWindow.webContents.send('discovery:output', {
            executionId: execId,
            timestamp: new Date().toISOString(),
            level: 'debug',
            message: data.data,
            source: moduleName,
          });
        }
      };

      const onInformationStream = (data: any) => {
        if (mainWindow) {
          mainWindow.webContents.send('discovery:output', {
            executionId: execId,
            timestamp: new Date().toISOString(),
            level: 'information',
            message: data.data,
            source: moduleName,
          });
        }
      };

      // Register listeners
      psService.on('stream:output', onOutputStream);
      psService.on('stream:error', onErrorStream);
      psService.on('stream:warning', onWarningStream);
      psService.on('stream:verbose', onVerboseStream);
      psService.on('stream:debug', onDebugStream);
      psService.on('stream:information', onInformationStream);

      // Store cleanup functions
      outputListeners.push(() => psService.off('stream:output', onOutputStream));
      outputListeners.push(() => psService.off('stream:error', onErrorStream));
      outputListeners.push(() => psService.off('stream:warning', onWarningStream));
      outputListeners.push(() => psService.off('stream:verbose', onVerboseStream));
      outputListeners.push(() => psService.off('stream:debug', onDebugStream));
      outputListeners.push(() => psService.off('stream:information', onInformationStream));

      // Execute PowerShell module
      const result = await psService.executeScript(
        moduleName,
        Object.entries(parameters).map(([key, value]) => `-${key} ${JSON.stringify(value)}`),
        {
          cancellationToken: execId,
          streamOutput: true,
        }
      );

      // Cleanup listeners
      outputListeners.forEach(cleanup => cleanup());

      // Send completion event
      if (mainWindow) {
        mainWindow.webContents.send('discovery:complete', {
          executionId: execId,
          result,
          duration: Date.now() - execution.startTime,
        });
      }

      return {
        success: true,
        executionId: execId,
        result,
      };

    } catch (error: unknown) {
      console.error('discovery:execute error:', error);

      // Send error event
      if (mainWindow && executionId) {
        mainWindow.webContents.send('discovery:error', {
          executionId: executionId || 'unknown',
          error: error instanceof Error ? error.message : String(error),
        });
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  /**
   * Cancel discovery execution
   */
  ipcMain.handle('discovery:cancel', async (_, args: { executionId: string }) => {
    const { executionId } = args;

    try {
      console.log(`IPC: discovery:cancel - ${executionId}`);
      const success = await psService.cancelExecution(executionId);

      if (success && mainWindow) {
        mainWindow.webContents.send('discovery:cancelled', { executionId });
      }

      return { success };
    } catch (error: unknown) {
      console.error('discovery:cancel error:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  /**
   * Get execution status for a specific discovery execution
   */
  ipcMain.handle('discovery:get-status', async (_, args: { executionId: string }) => {
    const { executionId } = args;

    try {
      console.log(`IPC: discovery:get-status - ${executionId}`);

      // For now, return a basic status
      // TODO: Implement execution status tracking in PowerShellExecutionService
      return {
        success: true,
        status: {
          state: 'running',
          progress: 0,
          message: 'Execution in progress'
        }
      };
    } catch (error: unknown) {
      console.error('discovery:get-status error:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  /**
   * Clear logs for a specific discovery execution
   */
  ipcMain.handle('discovery:clear-logs', async (_, args: { executionId: string }) => {
    const { executionId } = args;

    try {
      console.log(`IPC: discovery:clear-logs - ${executionId}`);

      // Send event to renderer to clear logs
      if (mainWindow) {
        mainWindow.webContents.send('discovery:logs-cleared', { executionId });
      }

      return { success: true };
    } catch (error: unknown) {
      console.error('discovery:clear-logs error:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  /**
   * Get available discovery modules from registry
   */
  ipcMain.handle('discovery:get-modules', async () => {
    try {
      console.log('IPC: discovery:get-modules');
      const allModules = moduleRegistry.getAllModules();

      // Filter for discovery-category modules
      const discoveryModules = allModules.filter(
        (module: any) => module.category === 'discovery'
      );

      return { success: true, modules: discoveryModules };
    } catch (error: unknown) {
      console.error('discovery:get-modules error:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error), modules: [] };
    }
  });

  /**
   * Get module information (description, parameters, etc.)
   */
  ipcMain.handle('discovery:get-module-info', async (_, args: { moduleName: string }) => {
    const { moduleName } = args;

    try {
      console.log(`IPC: discovery:get-module-info - ${moduleName}`);
      const moduleInfo = moduleRegistry.getModule(moduleName);

      if (!moduleInfo) {
        return {
          success: false,
          error: `Module not found: ${moduleName}`,
          info: null,
        };
      }

      return {
        success: true,
        info: moduleInfo,
      };
    } catch (error: unknown) {
      console.error('discovery:get-module-info error:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error), info: null };
    }
  });

  // ========================================
  // Migration Plan Persistence (Epic 2)
  // ========================================
  const { registerMigrationHandlers } = await import('./ipcHandlers.migration');
  registerMigrationHandlers();

  // ========================================
  // Azure App Registration (Task 3)
  // ========================================
  const { registerAppRegistrationHandlers } = await import('./ipc/appRegistrationHandlers');
  registerAppRegistrationHandlers();

  // ========================================
  // Target Profile Management (Task 4)
  // ========================================
  const { registerTargetProfileHandlers } = await import('./ipc/targetProfileHandlers');
  registerTargetProfileHandlers();

  // ========================================
  // Connection Testing (Task 5)
  // ========================================
  const { registerConnectionTestHandlers } = await import('./ipc/connectionTestHandlers');
  registerConnectionTestHandlers(mainWindow || undefined);

  // ========================================
  // Migration Planning (Task 7)
  // ========================================
  const { registerMigrationPlanningHandlers } = await import('./ipc/migrationPlanningHandlers');
  registerMigrationPlanningHandlers();

  // ========================================
  // Module Discovery (Task 6)
  // ========================================
  const { registerModuleDiscoveryHandlers } = await import('./ipc/moduleDiscoveryHandlers');
  registerModuleDiscoveryHandlers();

  // ========================================
  // Data Export/Import (Task 8)
  // ========================================
  const { registerDataExportImportHandlers } = await import('./ipc/dataExportImportHandlers');
  registerDataExportImportHandlers();

  // ========================================
  // Error Monitoring (Task 9)
  // ========================================
  const { registerErrorMonitoringHandlers } = await import('./ipc/errorMonitoringHandlers');
  registerErrorMonitoringHandlers(mainWindow || undefined);

  // ========================================
  // Centralized Logging (Task 10)
  // ========================================
  const { registerLoggingHandlers, initializeLogging } = await import('./ipc/loggingHandlers');
  await initializeLogging();
  registerLoggingHandlers();

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
