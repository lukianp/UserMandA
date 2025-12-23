/**
 * Preload Script - Secure IPC Bridge
 *
 * This script runs in an isolated context with access to both Node.js and the renderer.
 * It exposes a secure, limited API to the renderer process via contextBridge.
 *
 * Security principles:
 * - contextIsolation: true (configured in main.ts)
 * - nodeIntegration: false (configured in main.ts)
 * - Only explicitly exposed APIs are accessible from renderer
 * - No direct access to ipcRenderer, require, or Node APIs
 */

import { contextBridge, ipcRenderer } from 'electron';

import type { ElectronAPI } from './renderer/types/electron';
import type {
  ScriptExecutionParams,
  ModuleExecutionParams,
  ScriptTask,
  ProgressData,
  OutputData
} from './shared/types';
import type { ExecutionOptions } from './types/shared';

/**
// ========================================
// Window Management
// ========================================

/**
 * Expose secure Electron API to renderer process
 */
const electronAPI: ElectronAPI = {
  // ========================================
  // PowerShell Execution
  // ========================================

  executeScript: <T = unknown>(params: ScriptExecutionParams) => {
    return ipcRenderer.invoke('powershell:executeScript', params);
  },

  executeModule: <T = unknown>(params: ModuleExecutionParams) => {
    return ipcRenderer.invoke('powershell:executeModule', params);
  },

  cancelExecution: (token: string) => {
    return ipcRenderer.invoke('powershell:cancel', token);
  },

  discoverModules: () => {
    return ipcRenderer.invoke('powershell:discoverModules');
  },

  executeParallel: (scripts: ScriptTask[]) => {
    return ipcRenderer.invoke('powershell:executeParallel', scripts);
  },

  executeWithRetry: (params: ScriptExecutionParams, retries?: number, backoff?: number) => {
    return ipcRenderer.invoke('powershell:executeWithRetry', params, retries, backoff);
  },

  // ========================================
  // File Operations
  // ========================================

  fs: {
    readFile: (path: string, encoding?: string) => {
      return ipcRenderer.invoke('file:read', path, encoding);
    },

    writeFile: (path: string, content: string, encoding?: string) => {
      return ipcRenderer.invoke('file:write', path, content, encoding);
    },

    exists: (path: string) => {
      return ipcRenderer.invoke('file:exists', path);
    },

    mkdir: (path: string) => {
      return ipcRenderer.invoke('file:mkdir', path);
    },

    rmdir: (path: string) => {
      return ipcRenderer.invoke('file:rmdir', path);
    },

    unlink: (path: string) => {
      return ipcRenderer.invoke('file:delete', path);
    },

    readdir: (path: string) => {
      return ipcRenderer.invoke('file:readdir', path);
    },

    stat: (path: string) => {
      return ipcRenderer.invoke('file:stat', path);
    },

    getRawDataPath: (companyName: string) => {
      return ipcRenderer.invoke('file:getRawDataPath', companyName);
    },

    getCSVPath: (companyName: string, fileName: string) => {
      return ipcRenderer.invoke('file:getCSVPath', companyName, fileName);
    },

    watchDirectory: (path: string, pattern?: string, callback?: (filePath: string) => void) => {
      const subscription = (_: any, filePath: string) => {
        if (callback) callback(filePath);
      };
      ipcRenderer.on('file:changed', subscription);
      return () => ipcRenderer.removeListener('file:changed', subscription);
    },

    listFiles: (path: string, pattern?: string) => {
      return ipcRenderer.invoke('file:list', path, pattern);
    },
  },

  readFile: (path: string, encoding?: string) => {
    return ipcRenderer.invoke('file:read', path, encoding);
  },

  writeFile: (path: string, content: string, encoding?: string) => {
    return ipcRenderer.invoke('file:write', path, content, encoding);
  },

  fileExists: (path: string) => {
    return ipcRenderer.invoke('file:exists', path);
  },

  deleteFile: (path: string) => {
    return ipcRenderer.invoke('file:delete', path);
  },

  listFiles: (path: string, pattern?: string) => {
    return ipcRenderer.invoke('file:list', path, pattern);
  },

  logToFile: (entry: any) => {
    return ipcRenderer.invoke('logging:write', entry);
  },

  // ========================================
  // Centralized Logging API
  // ========================================

  logging: {
    debug: (component: string, message: string, context?: Record<string, any>) =>
      ipcRenderer.invoke('log:message', { level: 'DEBUG', component, message, context }),

    info: (component: string, message: string, context?: Record<string, any>) =>
      ipcRenderer.invoke('log:message', { level: 'INFO', component, message, context }),

    warn: (component: string, message: string, context?: Record<string, any>) =>
      ipcRenderer.invoke('log:message', { level: 'WARN', component, message, context }),

    error: (component: string, message: string, stack?: string, context?: Record<string, any>) =>
      ipcRenderer.invoke('log:error', { component, message, stack, context }),

    fatal: (component: string, message: string, stack?: string, context?: Record<string, any>) =>
      ipcRenderer.invoke('log:message', { level: 'FATAL', component, message, context }),

    getRecent: (count?: number) =>
      ipcRenderer.invoke('log:getRecent', count),

    getByLevel: (level: string, count?: number) =>
      ipcRenderer.invoke('log:getByLevel', { level, count }),

    getByComponent: (component: string, count?: number) =>
      ipcRenderer.invoke('log:getByComponent', { component, count }),

    clear: () =>
      ipcRenderer.invoke('log:clear'),

    updateConfig: (config: any) =>
      ipcRenderer.invoke('log:updateConfig', config),

    getConfig: () =>
      ipcRenderer.invoke('log:getConfig'),
  },

  // ========================================
  // Configuration Management
  // ========================================

  getConfig: <T = unknown>(key: string) => {
    return ipcRenderer.invoke('config:get', key);
  },

  setConfig: (key: string, value: unknown) => {
    return ipcRenderer.invoke('config:set', key, value);
  },

  getAllConfig: () => {
    return ipcRenderer.invoke('config:getAll');
  },

  deleteConfig: (key: string) => {
    return ipcRenderer.invoke('config:delete', key);
  },

  // ========================================
  // Profile Management
  // ========================================

  profile: {
    getAll: () => ipcRenderer.invoke('profile:getAll'),
    getCurrent: () => ipcRenderer.invoke('profile:getCurrent'),
    setCurrent: (profileId: string) => ipcRenderer.invoke('profile:setCurrent', profileId),
    create: (profile: any) => ipcRenderer.invoke('profile:create', profile),
    update: (profile: any) => ipcRenderer.invoke('profile:update', profile),
    delete: (profileId: string) => ipcRenderer.invoke('profile:delete', profileId),
    import: (filePath: string) => ipcRenderer.invoke('profile:import', filePath),
    export: (profileId: string, filePath: string) => ipcRenderer.invoke('profile:export', profileId, filePath),
    getStats: (profileId: string) => ipcRenderer.invoke('profile:getStats', profileId),
    validate: (profile: any) => ipcRenderer.invoke('profile:validate', profile),
    getConnectionConfig: (profileId: string) => ipcRenderer.invoke('profile:getConnectionConfig', profileId),
    setConnectionConfig: (profileId: string, config: any) => ipcRenderer.invoke('profile:setConnectionConfig', profileId, config),
    /**
     * Test connection for a profile
     * Validates Azure credentials and connectivity
     * @param profileId - Profile ID to test
     * @returns Promise with test result
     */
    testConnection: (profileId: string) => ipcRenderer.invoke('profile:testConnection', profileId),
    /**
     * Clear credentials for a profile
     * Forces reload from DPAPI file on next access
     * @param profileId - Profile ID to clear
     * @returns Promise with success result
     */
    clearCredentials: (profileId: string) => ipcRenderer.invoke('profile:clearCredentials', profileId),
    /**
     * Get application filter settings for the active profile
     * @param profileId - Optional profile ID, uses active profile if not specified
     * @returns Promise with ApplicationFilterSettings
     */
    getApplicationFilterSettings: (profileId?: string) =>
      ipcRenderer.invoke('profile:getApplicationFilterSettings', profileId),
    /**
     * Save application filter settings for the active profile
     * @param settings - ApplicationFilterSettings to save
     * @param profileId - Optional profile ID, uses active profile if not specified
     * @returns Promise with success status
     */
    setApplicationFilterSettings: (settings: any, profileId?: string) =>
      ipcRenderer.invoke('profile:setApplicationFilterSettings', settings, profileId),
    /**
     * Get tenant domain information for the active profile
     * @param profileId - Optional profile ID, uses active profile if not specified
     * @returns Promise with TenantDomainInfo or null
     */
    getTenantDomains: (profileId?: string) =>
      ipcRenderer.invoke('profile:getTenantDomains', profileId),
    /**
     * Save tenant domain information for the active profile
     * @param domains - TenantDomainInfo to save
     * @param profileId - Optional profile ID, uses active profile if not specified
     * @returns Promise with success status
     */
    setTenantDomains: (domains: any, profileId?: string) =>
      ipcRenderer.invoke('profile:setTenantDomains', domains, profileId),
    onProfileChanged: (callback: () => void) => {
      ipcRenderer.on('profile:changed', callback);
      return () => ipcRenderer.removeListener('profile:changed', callback);
    }
  },

  // Backwards compatibility aliases for profile loading
  loadSourceProfiles: () => ipcRenderer.invoke('profile:getAll'),
  loadTargetProfiles: () => ipcRenderer.invoke('profile:getAll'),
  // FIXED: Use profile:updateSource instead of profile:update to properly merge with existing profile
  updateSourceProfile: (id: string, updates: any) => ipcRenderer.invoke('profile:updateSource', id, updates),
  updateTargetProfile: (id: string, updates: any) => ipcRenderer.invoke('profile:updateTarget', id, updates),
  deleteSourceProfile: (id: string) => ipcRenderer.invoke('profile:deleteSource', id),
  deleteTargetProfile: (id: string) => ipcRenderer.invoke('profile:deleteTarget', id),
  createSourceProfile: (profile: any) => ipcRenderer.invoke('profile:createSource', profile),
  createTargetProfile: (profile: any) => ipcRenderer.invoke('profile:createTarget', profile),
  setActiveProfile: (id: string) => ipcRenderer.invoke('profile:setCurrent', id),
  setActiveSourceProfile: (id: string) => ipcRenderer.invoke('profile:setActiveSource', id),
  setActiveTargetProfile: (id: string) => ipcRenderer.invoke('profile:setActiveTarget', id),

  // ========================================
  // Credential Management
  // ========================================

  loadCredentials: (profileId: string) => {
    return ipcRenderer.invoke('credentials:load', { profileId });
  },

  saveCredentials: (
    profileId: string,
    username: string,
    password: string,
    connectionType: 'ActiveDirectory' | 'AzureAD' | 'Exchange' | 'SharePoint',
    domain?: string
  ) => {
    return ipcRenderer.invoke('credentials:save', {
      profileId,
      username,
      password,
      connectionType,
      domain
    });
  },

  deleteCredentials: (profileId: string) => {
    return ipcRenderer.invoke('credentials:delete', { profileId });
  },

  credentialsExist: (profileId: string) => {
    return ipcRenderer.invoke('credentials:exists', { profileId });
  },

  // ========================================
  // Event Listeners (for streaming)
  // ========================================

  onProgress: (callback: (data: ProgressData) => void) => {
    const subscription = (_: any, data: ProgressData) => callback(data);
    ipcRenderer.on('powershell:progress', subscription);

    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('powershell:progress', subscription);
    };
  },

  onOutput: (callback: (data: OutputData) => void) => {
    const subscription = (_: any, data: OutputData) => callback(data);
    ipcRenderer.on('powershell:output', subscription);

    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('powershell:output', subscription);
    };
  },

  // Enhanced stream listeners for all 6 PowerShell streams
  onOutputStream: (callback: (data: OutputData) => void) => {
    const subscription = (_: any, data: OutputData) => callback(data);
    ipcRenderer.on('powershell:stream:output', subscription);
    return () => ipcRenderer.removeListener('powershell:stream:output', subscription);
  },

  onErrorStream: (callback: (data: OutputData) => void) => {
    const subscription = (_: any, data: OutputData) => callback(data);
    ipcRenderer.on('powershell:stream:error', subscription);
    return () => ipcRenderer.removeListener('powershell:stream:error', subscription);
  },

  onWarningStream: (callback: (data: OutputData) => void) => {
    const subscription = (_: any, data: OutputData) => callback(data);
    ipcRenderer.on('powershell:stream:warning', subscription);
    return () => ipcRenderer.removeListener('powershell:stream:warning', subscription);
  },

  onVerboseStream: (callback: (data: OutputData) => void) => {
    const subscription = (_: any, data: OutputData) => callback(data);
    ipcRenderer.on('powershell:stream:verbose', subscription);
    return () => ipcRenderer.removeListener('powershell:stream:verbose', subscription);
  },

  onDebugStream: (callback: (data: OutputData) => void) => {
    const subscription = (_: any, data: OutputData) => callback(data);
    ipcRenderer.on('powershell:stream:debug', subscription);
    return () => ipcRenderer.removeListener('powershell:stream:debug', subscription);
  },

  onInformationStream: (callback: (data: OutputData) => void) => {
    const subscription = (_: any, data: OutputData) => callback(data);
    ipcRenderer.on('powershell:stream:information', subscription);
    return () => ipcRenderer.removeListener('powershell:stream:information', subscription);
  },

  onExecutionCancelled: (callback: (data: { executionId: string }) => void) => {
    const subscription = (_: any, data: { executionId: string }) => callback(data);
    ipcRenderer.on('powershell:execution:cancelled', subscription);
    return () => ipcRenderer.removeListener('powershell:execution:cancelled', subscription);
  },

  // ========================================
  // File Watcher Operations
  // ========================================

  startFileWatcher: (profileId: string) => {
    return ipcRenderer.invoke('filewatcher:start', profileId);
  },

  stopFileWatcher: (profileId: string) => {
    return ipcRenderer.invoke('filewatcher:stop', profileId);
  },

  stopAllFileWatchers: () => {
    return ipcRenderer.invoke('filewatcher:stopAll');
  },

  getWatchedFiles: () => {
    return ipcRenderer.invoke('filewatcher:getWatchedFiles');
  },

  getFileWatcherStatistics: () => {
    return ipcRenderer.invoke('filewatcher:getStatistics');
  },

  onFileChanged: (callback: (data: any) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('file:changed', subscription);
    return () => ipcRenderer.removeListener('file:changed', subscription);
  },

  // ========================================
  // System / App Operations
  // ========================================

  getAppVersion: () => {
    return ipcRenderer.invoke('system:getAppVersion');
  },

  getDataPath: () => {
    return ipcRenderer.invoke('system:getDataPath');
  },

  openExternal: (target: string) => {
    return ipcRenderer.invoke('system:openExternal', target);
  },

  showOpenDialog: (options: {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
    properties?: Array<'openFile' | 'openDirectory' | 'multiSelections'>;
  }) => {
    return ipcRenderer.invoke('system:showOpenDialog', options);
  },

  showSaveDialog: (options: {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
  }) => {
    return ipcRenderer.invoke('system:showSaveDialog', options);
  },

  // ========================================
  // Window Management
  // ========================================

  window: {
    minimize: () => {
      return ipcRenderer.invoke('window:minimize');
    },

    maximize: () => {
      return ipcRenderer.invoke('window:maximize');
    },

    close: () => {
      return ipcRenderer.invoke('window:close');
    },

    restore: () => {
      return ipcRenderer.invoke('window:restore');
    },

    isMaximized: () => {
      return ipcRenderer.invoke('window:isMaximized');
    },
  },

  // ========================================
  // Generic IPC Invoke (for custom handlers)
  // ========================================

  invoke: <T = unknown>(channel: string, args?: unknown): Promise<T> => {
    return ipcRenderer.invoke(channel, args);
  },

  // ========================================
  // Environment Detection
  // ========================================

  detectEnvironment: (config?: Record<string, unknown>) => {
    return ipcRenderer.invoke('environment:detect', config);
  },

  validateEnvironmentCredentials: (provider: string, credentials: Record<string, string>) => {
    return ipcRenderer.invoke('environment:validateCredentials', provider, credentials);
  },

  cancelEnvironmentDetection: (detectionId: string) => {
    return ipcRenderer.invoke('environment:cancel', detectionId);
  },

  getEnvironmentStatistics: () => {
    return ipcRenderer.invoke('environment:getStatistics');
  },

  onEnvironmentDetectionStarted: (callback: (data: any) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('environment:detection:started', subscription);
    return () => ipcRenderer.removeListener('environment:detection:started', subscription);
  },

  onEnvironmentDetectionProgress: (callback: (data: any) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('environment:detection:progress', subscription);
    return () => ipcRenderer.removeListener('environment:detection:progress', subscription);
  },

  onEnvironmentDetectionCompleted: (callback: (data: any) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('environment:detection:completed', subscription);
    return () => ipcRenderer.removeListener('environment:detection:completed', subscription);
  },

  onEnvironmentDetectionFailed: (callback: (data: any) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('environment:detection:failed', subscription);
    return () => ipcRenderer.removeListener('environment:detection:failed', subscription);
  },

  onEnvironmentDetectionCancelled: (callback: (data: any) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('environment:detection:cancelled', subscription);
    return () => ipcRenderer.removeListener('environment:detection:cancelled', subscription);
  },

  // ========================================
  // Discovery Module Execution (Epic 3)
  // ========================================

  /**
   * Execute discovery module with real-time streaming
   * @param params Discovery execution parameters
   * @returns Promise resolving to execution result
   */
  executeDiscovery: (params: {
    moduleName: string;
    companyName?: string;
    configuration?: Record<string, any>;
    parameters?: Record<string, any>;
    executionId?: string;
    executionOptions?: Record<string, any>;
  }) => {
    console.log('[PRELOAD] ========== executeDiscovery CALLED ==========');
    console.log('[PRELOAD] params:', JSON.stringify(params, null, 2));
    console.log('[PRELOAD] Calling ipcRenderer.invoke with channel: discovery:execute');

    const promise = ipcRenderer.invoke('discovery:execute', params);
    console.log('[PRELOAD] ipcRenderer.invoke called, promise created');

    promise.then((result: unknown) => {
      console.log('[PRELOAD] ✅ executeDiscovery promise resolved');
      console.log('[PRELOAD] Result type:', typeof result);
      console.log('[PRELOAD] Result keys:', result ? Object.keys(result as object) : 'NULL');
      console.log('[PRELOAD] Result.success:', (result as { success?: boolean })?.success);
      console.log('[PRELOAD] Result.error:', (result as { error?: string })?.error);
    }).catch((err: unknown) => {
      console.error('[PRELOAD] ❌ executeDiscovery promise rejected');
      console.error('[PRELOAD] Error:', err);
      console.error('[PRELOAD] Error message:', (err as Error)?.message);
    });

    return promise;
  },

  /**
   * Cancel active discovery execution
   * @param executionId Execution ID to cancel
   * @returns Promise resolving to success status
   */
  cancelDiscovery: (executionId: string) => {
    return ipcRenderer.invoke('discovery:cancel', { executionId });
  },

  /**
   * Get available discovery modules from registry
   * @returns Promise resolving to array of discovery modules
   */
  getDiscoveryModules: () => {
    return ipcRenderer.invoke('discovery:get-modules');
  },

  /**
   * Get detailed information about a specific module
   * @param moduleName Module name/ID
   * @returns Promise resolving to module information
   */
  getDiscoveryModuleInfo: (moduleName: string) => {
    return ipcRenderer.invoke('discovery:get-module-info', { moduleName });
  },

  /**
   * Register a listener for discovery output events (all 6 PowerShell streams)
   * @param callback Function to call when output is received
   * @returns Cleanup function to remove listener
   */
  onDiscoveryOutput: (callback: (data: {
    executionId: string;
    timestamp: string;
    level: 'output' | 'error' | 'warning' | 'verbose' | 'debug' | 'information';
    message: string;
    source: string;
  }) => void) => {
    const subscription = (_: any, data: any) => {
      console.log('[PRELOAD] 📩 Received discovery:output event from main process:', data);
      callback(data);
    };
    ipcRenderer.on('discovery:output', subscription);
    console.log('[PRELOAD] ✅ Registered listener for discovery:output events');
    return () => {
      console.log('[PRELOAD] 🧹 Removing listener for discovery:output');
      ipcRenderer.removeListener('discovery:output', subscription);
    };
  },

  /**
   * Register a listener for discovery progress events
   * @param callback Function to call when progress updates
   * @returns Cleanup function to remove listener
   */
  onDiscoveryProgress: (callback: (data: {
    executionId: string;
    percentage: number;
    currentPhase: string;
    itemsProcessed?: number;
    totalItems?: number;
  }) => void) => {
    const subscription = (_: any, data: any) => {
      console.log('[PRELOAD] 📊 Received discovery:progress event from main process:', data);
      callback(data);
    };
    ipcRenderer.on('discovery:progress', subscription);
    console.log('[PRELOAD] ✅ Registered listener for discovery:progress events');
    return () => {
      console.log('[PRELOAD] 🧹 Removing listener for discovery:progress');
      ipcRenderer.removeListener('discovery:progress', subscription);
    };
  },

  /**
   * Register a listener for discovery completion events
   * @param callback Function to call when execution completes
   * @returns Cleanup function to remove listener
   */
  onDiscoveryComplete: (callback: (data: {
    executionId: string;
    result: any;
    duration: number;
  }) => void) => {
    const subscription = (_: any, data: any) => {
      console.log('[PRELOAD] ✅ Received discovery:complete event from main process:', data);
      callback(data);
    };
    ipcRenderer.on('discovery:complete', subscription);
    console.log('[PRELOAD] ✅ Registered listener for discovery:complete events');
    return () => {
      console.log('[PRELOAD] 🧹 Removing listener for discovery:complete');
      ipcRenderer.removeListener('discovery:complete', subscription);
    };
  },

  /**
   * Register a listener for discovery error events
   * @param callback Function to call when an error occurs
   * @returns Cleanup function to remove listener
   */
  onDiscoveryError: (callback: (data: {
    executionId: string;
    error: string;
  }) => void) => {
    const subscription = (_: any, data: any) => {
      console.log('[PRELOAD] ❌ Received discovery:error event from main process:', data);
      callback(data);
    };
    ipcRenderer.on('discovery:error', subscription);
    console.log('[PRELOAD] ✅ Registered listener for discovery:error events');
    return () => {
      console.log('[PRELOAD] 🧹 Removing listener for discovery:error');
      ipcRenderer.removeListener('discovery:error', subscription);
    };
  },

  /**
   * Register a listener for discovery cancellation events
   * @param callback Function to call when execution is cancelled
   * @returns Cleanup function to remove listener
   */
  onDiscoveryCancelled: (callback: (data: {
    executionId: string;
  }) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('discovery:cancelled', subscription);
    return () => ipcRenderer.removeListener('discovery:cancelled', subscription);
  },

  // ========================================
  // Logic Engine API (Epic 4)
  // ========================================

  /**
   * Load all discovery data from CSV files
   * @param profilePath - Optional path to profile data directory
   * @returns Promise with success status and statistics
   */
  logicEngine: {
    loadAll: (profilePath?: string) =>
      ipcRenderer.invoke('logic-engine:load-all', { profilePath }),

    /**
     * Get comprehensive user detail projection
     * @param userId - User SID or UPN
     * @returns Promise with UserDetailProjection
     */
    getUserDetail: (userId: string) =>
      ipcRenderer.invoke('logic-engine:get-user-detail', { userId }),

    /**
     * Get current data load statistics
     * @returns Promise with statistics object
     */
    getStatistics: () =>
      ipcRenderer.invoke('logic-engine:get-statistics'),

    /**
     * Invalidate cache and force reload on next access
     * @returns Promise with success status
     */
    invalidateCache: () =>
      ipcRenderer.invoke('logic-engine:invalidate-cache'),

    /**
     * Listen for load progress events
     * @param callback - Called with progress updates
     * @returns Cleanup function
     */
    onProgress: (callback: (progress: any) => void) => {
      const handler = (_: any, data: any) => callback(data);
      ipcRenderer.on('logic-engine:progress', handler);
      return () => ipcRenderer.removeListener('logic-engine:progress', handler);
    },

    /**
     * Listen for load completion events
     * @param callback - Called when load completes
     * @returns Cleanup function
     */
    onLoaded: (callback: (data: any) => void) => {
      const handler = (_: any, data: any) => callback(data);
      ipcRenderer.on('logic-engine:loaded', handler);
      return () => ipcRenderer.removeListener('logic-engine:loaded', handler);
    },

    /**
     * Listen for load error events
     * @param callback - Called on load errors
     * @returns Cleanup function
     */
    onError: (callback: (error: any) => void) => {
      const handler = (_: any, data: any) => callback(data);
      ipcRenderer.on('logic-engine:error', handler);
      return () => ipcRenderer.removeListener('logic-engine:error', handler);
    },

    /**
     * Analyze migration complexity for a user
     * @param userId - User SID or UPN
     * @returns Promise with complexity score, level, and contributing factors
     */
    analyzeMigrationComplexity: (userId: string) =>
      ipcRenderer.invoke('logicEngine:analyzeMigrationComplexity', userId),

    /**
     * Batch analyze migration complexity for multiple users
     * @param userIds - Array of user SIDs or UPNs
     * @returns Promise with complexity results mapped by userId
     */
    batchAnalyzeMigrationComplexity: (userIds: string[]) =>
      ipcRenderer.invoke('logicEngine:batchAnalyzeMigrationComplexity', userIds),

    /**
     * Get complexity statistics for all analyzed users
     * @returns Promise with complexity statistics
     */
    getComplexityStatistics: () =>
      ipcRenderer.invoke('logicEngine:getComplexityStatistics'),
  },

  // ========================================
  // Dashboard API (Phases 1-3 Backend)
  // ========================================

  dashboard: {
    /**
     * Get dashboard statistics from Logic Engine
     * @param profileName - Profile name to get stats for
     * @returns Promise with DashboardStats
     */
    getStats: (profileName: string) =>
      ipcRenderer.invoke('dashboard:getStats', profileName),

    /**
     * Get project timeline and wave information
     * @param profileName - Profile name to get timeline for
     * @returns Promise with ProjectTimeline
     */
    getProjectTimeline: (profileName: string) =>
      ipcRenderer.invoke('dashboard:getProjectTimeline', profileName),

    /**
     * Get system health metrics
     * @returns Promise with SystemHealth
     */
    getSystemHealth: () =>
      ipcRenderer.invoke('dashboard:getSystemHealth'),

    /**
     * Get recent activity feed
     * @param profileName - Profile name to get activity for
     * @param limit - Maximum number of activities to return
     * @returns Promise with ActivityItem array
     */
    getRecentActivity: (profileName: string, limit?: number) =>
      ipcRenderer.invoke('dashboard:getRecentActivity', profileName, limit),

    /**
     * Acknowledge a system alert
     * @param alertId - Alert ID to acknowledge
     * @returns Promise with success status
     */
    acknowledgeAlert: (alertId: string) =>
      ipcRenderer.invoke('dashboard:acknowledgeAlert', alertId),
  },

  // ========================================
  // Azure App Registration API
  // ========================================

  appRegistration: {
    /**
     * Launch Azure App Registration PowerShell script
     * @param options - App registration options
     * @returns Promise with launch result
     */
    launch: (options: {
      companyName: string;
      showWindow?: boolean;
      autoInstallModules?: boolean;
      secretValidityYears?: number;
      skipAzureRoles?: boolean;
    }) =>
      ipcRenderer.invoke('app-registration:launch', options),

    /**
     * Check if app registration credentials exist for a company
     * @param companyName - Company name
     * @returns Promise with boolean indicating if credentials exist
     */
    hasCredentials: (companyName: string) =>
      ipcRenderer.invoke('app-registration:has-credentials', companyName),

    /**
     * Read app registration credential summary
     * @param companyName - Company name
     * @returns Promise with credential summary or null
     */
    readSummary: (companyName: string) =>
      ipcRenderer.invoke('app-registration:read-summary', companyName),

    /**
     * Decrypt app registration credential file
     * @param credentialFilePath - Path to encrypted credential file
     * @returns Promise with decrypted client secret or null
     */
    decryptCredential: (credentialFilePath: string) =>
      ipcRenderer.invoke('app-registration:decrypt-credential', credentialFilePath),

    /**
     * Read registration status from status file (for progress tracking)
     * @param companyName - Company name
     * @returns Promise with status object or null
     */
    readStatus: (companyName: string) =>
      ipcRenderer.invoke('app-registration:read-status', companyName),

    /**
     * Clear registration status file before starting new registration
     * @param companyName - Company name
     */
    clearStatus: (companyName: string) =>
      ipcRenderer.invoke('app-registration:clear-status', companyName),
  },

  // ========================================
  // Connection Testing API (Task 5)
  // ========================================

  connectionTest: {
    /**
     * Test Active Directory connection
     * @param domainController - Domain controller hostname
     * @param credential - Optional credentials
     * @returns Promise with test result
     */
    testActiveDirectory: (domainController: string, credential?: { username: string; password: string }) =>
      ipcRenderer.invoke('connection-test:active-directory', domainController, credential),

    /**
     * Test Exchange Server connection
     * @param serverUrl - Exchange server URL
     * @param credential - Optional credentials
     * @returns Promise with test result
     */
    testExchange: (serverUrl: string, credential?: { username: string; password: string }) =>
      ipcRenderer.invoke('connection-test:exchange', serverUrl, credential),

    /**
     * Test Azure AD connection
     * @param tenantId - Azure AD tenant ID
     * @param clientId - Application client ID
     * @param clientSecret - Application client secret
     * @returns Promise with test result
     */
    testAzureAD: (tenantId: string, clientId: string, clientSecret: string) =>
      ipcRenderer.invoke('connection-test:azure-ad', tenantId, clientId, clientSecret),

    /**
     * Test comprehensive environment (T-000)
     * @param config - Environment configuration
     * @returns Promise with environment test result
     */
    testEnvironment: (config: {
      profileName: string;
      domainController?: string;
      exchangeServer?: string;
      tenantId?: string;
      clientId?: string;
      clientSecret?: string;
      credential?: { username: string; password: string };
    }) =>
      ipcRenderer.invoke('connection-test:environment', config),

    /**
     * Cancel active connection test
     * @param testId - Test ID to cancel
     * @returns Promise with success status
     */
    cancel: (testId: string) =>
      ipcRenderer.invoke('connection-test:cancel', testId),

    /**
     * Get connection test statistics
     * @returns Promise with statistics
     */
    getStatistics: () =>
      ipcRenderer.invoke('connection-test:statistics'),

    /**
     * Listen for test started events
     * @param callback - Called when test starts
     * @returns Cleanup function
     */
    onTestStarted: (callback: (data: any) => void) => {
      const handler = (_: any, data: any) => callback(data);
      ipcRenderer.on('connection-test:started', handler);
      return () => ipcRenderer.removeListener('connection-test:started', handler);
    },

    /**
     * Listen for test progress events
     * @param callback - Called during test progress
     * @returns Cleanup function
     */
    onTestProgress: (callback: (data: any) => void) => {
      const handler = (_: any, data: any) => callback(data);
      ipcRenderer.on('connection-test:progress', handler);
      return () => ipcRenderer.removeListener('connection-test:progress', handler);
    },

    /**
     * Listen for test completed events
     * @param callback - Called when test completes
     * @returns Cleanup function
     */
    onTestCompleted: (callback: (data: any) => void) => {
      const handler = (_: any, data: any) => callback(data);
      ipcRenderer.on('connection-test:completed', handler);
      return () => ipcRenderer.removeListener('connection-test:completed', handler);
    },

    /**
     * Listen for test failed events
     * @param callback - Called when test fails
     * @returns Cleanup function
     */
    onTestFailed: (callback: (data: any) => void) => {
      const handler = (_: any, data: any) => callback(data);
      ipcRenderer.on('connection-test:failed', handler);
      return () => ipcRenderer.removeListener('connection-test:failed', handler);
    },

    /**
     * Listen for test cancelled events
     * @param callback - Called when test is cancelled
     * @returns Cleanup function
     */
    onTestCancelled: (callback: (data: any) => void) => {
      const handler = (_: any, data: any) => callback(data);
      ipcRenderer.on('connection-test:cancelled', handler);
      return () => ipcRenderer.removeListener('connection-test:cancelled', handler);
    },
  },

  // ========================================
  // Project Management API
  // ========================================

  project: {
    /**
     * Get current project configuration
     * @param profileName - Profile name to load configuration for
     * @returns Promise with ProjectConfig
     */
    getConfiguration: (profileName: string) =>
      ipcRenderer.invoke('project:getConfiguration', profileName),

    /**
     * Save project configuration
     * @param profileName - Profile name to save configuration for
     * @param config - Project configuration object
     * @returns Promise with success status
     */
    saveConfiguration: (profileName: string, config: any) =>
      ipcRenderer.invoke('project:saveConfiguration', profileName, config),

    /**
     * Update project status
     * @param profileName - Profile name
     * @param status - New project status
     * @returns Promise with success status
     */
    updateStatus: (profileName: string, status: any) =>
      ipcRenderer.invoke('project:updateStatus', profileName, status),

    /**
     * Add a new migration wave
     * @param profileName - Profile name
     * @param wave - Wave configuration
     * @returns Promise with created wave
     */
    addWave: (profileName: string, wave: any) =>
      ipcRenderer.invoke('project:addWave', profileName, wave),

    /**
     * Update migration wave status
     * @param profileName - Profile name
     * @param waveId - Wave ID
     * @param status - New wave status
     * @returns Promise with success status
     */
    updateWaveStatus: (profileName: string, waveId: string, status: any) =>
      ipcRenderer.invoke('project:updateWaveStatus', profileName, waveId, status),
  },

  // ========================================
  // Application Facts API
  // ========================================

  facts: {
    /**
     * Get all application facts
     * @param filter - Optional filter criteria
     * @returns Promise with array of ApplicationFact
     */
    getAll: (filter?: any) =>
      ipcRenderer.invoke('facts:getAll', filter),

    /**
     * Get a single fact by ID
     * @param id - Fact ID
     * @returns Promise with ApplicationFact or null
     */
    getById: (id: string) =>
      ipcRenderer.invoke('facts:getById', id),

    /**
     * Get a fact by Azure AD App ID
     * @param appId - Azure AD application ID
     * @returns Promise with ApplicationFact or null
     */
    getByAppId: (appId: string) =>
      ipcRenderer.invoke('facts:getByAppId', appId),

    /**
     * Create a new application fact
     * @param data - Partial ApplicationFact data
     * @returns Promise with created ApplicationFact
     */
    create: (data: any) =>
      ipcRenderer.invoke('facts:create', data),

    /**
     * Update an existing fact
     * @param id - Fact ID
     * @param updates - Partial updates
     * @param source - Discovery source
     * @param notes - Optional notes
     * @returns Promise with updated ApplicationFact
     */
    update: (id: string, updates: any, source?: string, notes?: string) =>
      ipcRenderer.invoke('facts:update', id, updates, source, notes),

    /**
     * Delete a fact
     * @param id - Fact ID
     * @returns Promise with success boolean
     */
    delete: (id: string) =>
      ipcRenderer.invoke('facts:delete', id),

    /**
     * Add a relation to a fact
     * @param factId - Fact ID
     * @param relation - Relation data
     * @returns Promise with created FactRelation
     */
    addRelation: (factId: string, relation: any) =>
      ipcRenderer.invoke('facts:addRelation', factId, relation),

    /**
     * Remove a relation from a fact
     * @param factId - Fact ID
     * @param relationId - Relation ID
     * @returns Promise with success boolean
     */
    removeRelation: (factId: string, relationId: string) =>
      ipcRenderer.invoke('facts:removeRelation', factId, relationId),

    /**
     * Get all relations for an app
     * @param appId - App ID
     * @returns Promise with inbound and outbound relations
     */
    getRelations: (appId: string) =>
      ipcRenderer.invoke('facts:getRelations', appId),

    /**
     * Set migration plan for a fact
     * @param factId - Fact ID
     * @param plan - Migration plan
     * @returns Promise with updated ApplicationFact
     */
    setMigrationPlan: (factId: string, plan: any) =>
      ipcRenderer.invoke('facts:setMigrationPlan', factId, plan),

    /**
     * Get facts by migration status
     * @param status - Migration status
     * @returns Promise with array of ApplicationFact
     */
    getByMigrationStatus: (status: string) =>
      ipcRenderer.invoke('facts:getByMigrationStatus', status),

    /**
     * Get statistics about all facts
     * @returns Promise with FactSheetStatistics
     */
    getStatistics: () =>
      ipcRenderer.invoke('facts:getStatistics'),

    /**
     * Sync facts from discovery data
     * @param companyName - Company name
     * @param classificationResults - Optional classification results
     * @returns Promise with FactSheetSyncResult
     */
    syncFromDiscovery: (companyName: string, classificationResults?: any) =>
      ipcRenderer.invoke('facts:syncFromDiscovery', companyName, classificationResults),
  },

  // ========================================
  // Consolidated Inventory API
  // ========================================

  inventory: {
    /**
     * Consolidate discovery data into inventory entities
     * @param params - Consolidation parameters
     * @returns Promise with consolidation result
     */
    consolidate: (params: {
      sourceProfileId: string;
      companyName: string;
      options?: { forceFullRebuild?: boolean };
    }) =>
      ipcRenderer.invoke('inventory:consolidate', params),

    /**
     * Get inventory entities with optional filtering
     * @param filters - Entity filters
     * @returns Promise with array of entities
     */
    getEntities: (filters?: any) =>
      ipcRenderer.invoke('inventory:getEntities', filters),

    /**
     * Get a single inventory entity by ID
     * @param entityId - Entity ID
     * @returns Promise with entity or null
     */
    getEntity: (entityId: string) =>
      ipcRenderer.invoke('inventory:getEntity', entityId),

    /**
     * Get entity with full details (evidence, relations)
     * @param entityId - Entity ID
     * @returns Promise with entity detail
     */
    getEntityDetail: (entityId: string) =>
      ipcRenderer.invoke('inventory:getEntityDetail', entityId),

    /**
     * Update an inventory entity
     * @param entityId - Entity ID
     * @param updates - Partial updates
     * @returns Promise with updated entity
     */
    updateEntity: (entityId: string, updates: any) =>
      ipcRenderer.invoke('inventory:updateEntity', { entityId, updates }),

    /**
     * Delete an inventory entity
     * @param entityId - Entity ID
     * @returns Promise with success status
     */
    deleteEntity: (entityId: string) =>
      ipcRenderer.invoke('inventory:deleteEntity', entityId),

    /**
     * Get inventory statistics
     * @param sourceProfileId - Optional profile filter
     * @returns Promise with statistics
     */
    getStatistics: (sourceProfileId?: string) =>
      ipcRenderer.invoke('inventory:getStatistics', sourceProfileId),

    /**
     * Get relations for an entity
     * @param entityId - Entity ID
     * @returns Promise with array of relations
     */
    getRelations: (entityId: string) =>
      ipcRenderer.invoke('inventory:getRelations', entityId),

    /**
     * Get all relations
     * @param filter - Optional filter
     * @returns Promise with array of relations
     */
    getAllRelations: (filter?: { sourceProfileId?: string; relationTypes?: string[] }) =>
      ipcRenderer.invoke('inventory:getAllRelations', filter),

    /**
     * Get evidence for an entity
     * @param entityId - Entity ID
     * @returns Promise with array of evidence
     */
    getEvidence: (entityId: string) =>
      ipcRenderer.invoke('inventory:getEvidence', entityId),
  },

  // ========================================
  // Migration Wave Planning API
  // ========================================

  waves: {
    /**
     * Create a new migration wave
     * @param waveData - Wave data
     * @returns Promise with created wave
     */
    create: (waveData: any) =>
      ipcRenderer.invoke('waves:create', waveData),

    /**
     * Get all migration waves
     * @param filter - Optional filter
     * @returns Promise with array of waves
     */
    getAll: (filter?: { sourceProfileId?: string; targetProfileId?: string; statuses?: string[] }) =>
      ipcRenderer.invoke('waves:getAll', filter),

    /**
     * Get a single wave by ID
     * @param waveId - Wave ID
     * @returns Promise with wave or null
     */
    get: (waveId: string) =>
      ipcRenderer.invoke('waves:get', waveId),

    /**
     * Update a wave
     * @param waveId - Wave ID
     * @param updates - Partial updates
     * @returns Promise with updated wave
     */
    update: (waveId: string, updates: any) =>
      ipcRenderer.invoke('waves:update', { waveId, updates }),

    /**
     * Delete a wave
     * @param waveId - Wave ID
     * @returns Promise with success status
     */
    delete: (waveId: string) =>
      ipcRenderer.invoke('waves:delete', waveId),

    /**
     * Get wave summary with statistics
     * @param waveId - Wave ID
     * @returns Promise with wave summary
     */
    getSummary: (waveId: string) =>
      ipcRenderer.invoke('waves:getSummary', waveId),

    /**
     * Assign entities to a wave
     * @param waveId - Wave ID
     * @param entityIds - Array of entity IDs
     * @param reason - Assignment reason
     * @param reasonDetails - Optional details
     * @returns Promise with assignment result
     */
    assignEntities: (waveId: string, entityIds: string[], reason?: string, reasonDetails?: string) =>
      ipcRenderer.invoke('waves:assignEntities', { waveId, entityIds, reason, reasonDetails }),

    /**
     * Unassign entities from a wave
     * @param waveId - Wave ID
     * @param entityIds - Array of entity IDs
     * @returns Promise with unassignment result
     */
    unassignEntities: (waveId: string, entityIds: string[]) =>
      ipcRenderer.invoke('waves:unassignEntities', { waveId, entityIds }),

    /**
     * Get wave assignments
     * @param waveId - Wave ID
     * @returns Promise with array of assignments
     */
    getAssignments: (waveId: string) =>
      ipcRenderer.invoke('waves:getAssignments', waveId),

    /**
     * Get wave assignment suggestions
     * @param params - Suggestion parameters
     * @returns Promise with array of suggestions
     */
    suggestAssignments: (params: {
      sourceProfileId: string;
      targetProfileId: string;
      options?: { maxEntitiesPerWave?: number; minReadinessScore?: number; prioritizeTypes?: string[] };
    }) =>
      ipcRenderer.invoke('waves:suggestAssignments', params),

    /**
     * Apply wave suggestions
     * @param params - Suggestion application parameters
     * @returns Promise with result
     */
    applySuggestions: (params: {
      sourceProfileId: string;
      targetProfileId: string;
      suggestions: any[];
    }) =>
      ipcRenderer.invoke('waves:applySuggestions', params),

    /**
     * Validate a wave is ready for execution
     * @param waveId - Wave ID
     * @returns Promise with validation result
     */
    validate: (waveId: string) =>
      ipcRenderer.invoke('waves:validate', waveId),

    /**
     * Start wave execution
     * @param waveId - Wave ID
     * @returns Promise with result
     */
    start: (waveId: string) =>
      ipcRenderer.invoke('waves:start', waveId),

    /**
     * Pause wave execution
     * @param waveId - Wave ID
     * @returns Promise with result
     */
    pause: (waveId: string) =>
      ipcRenderer.invoke('waves:pause', waveId),

    /**
     * Resume wave execution
     * @param waveId - Wave ID
     * @returns Promise with result
     */
    resume: (waveId: string) =>
      ipcRenderer.invoke('waves:resume', waveId),

    /**
     * Complete wave
     * @param waveId - Wave ID
     * @returns Promise with result
     */
    complete: (waveId: string) =>
      ipcRenderer.invoke('waves:complete', waveId),
  },
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electron', electronAPI);
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

console.log('========================================');
console.log('[PRELOAD] ✅ Preload script loaded successfully - Secure bridge established');
console.log('[PRELOAD] electronAPI exposed to window.electronAPI');
console.log('[PRELOAD] electronAPI keys:', Object.keys(electronAPI).slice(0, 10).join(', '), '...');
console.log('[PRELOAD] Total API methods:', Object.keys(electronAPI).length);
console.log('[PRELOAD] dashboard methods:', electronAPI.dashboard ? Object.keys(electronAPI.dashboard).length : 'UNDEFINED');
console.log('[PRELOAD] logicEngine methods:', electronAPI.logicEngine ? Object.keys(electronAPI.logicEngine).length : 'UNDEFINED');
console.log('[PRELOAD] project methods:', electronAPI.project ? Object.keys(electronAPI.project).length : 'UNDEFINED');
console.log('[PRELOAD] profile methods:', electronAPI.profile ? Object.keys(electronAPI.profile).length : 'UNDEFINED');
console.log('[PRELOAD] Context isolation:', true);
console.log('========================================');
