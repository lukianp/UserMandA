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
const electronAPI = {
  // ========================================
  // PowerShell Execution
  // ========================================

  executeScript: (params: ScriptExecutionParams | InlineScriptParams) => {
    return ipcRenderer.invoke('powershell:executeScript', params);
  },

  executeModule: (params: ModuleExecutionParams) => {
    return ipcRenderer.invoke('powershell:executeModule', params);
  },

  cancelExecution: (token) => {
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
    readFile: (path, encoding?) => {
      return ipcRenderer.invoke('file:read', path, encoding);
    },

    writeFile: (path, content, encoding?) => {
      return ipcRenderer.invoke('file:write', path, content, encoding);
    },

    exists: (path) => {
      return ipcRenderer.invoke('file:exists', path);
    },

    mkdir: (path) => {
      return ipcRenderer.invoke('file:mkdir', path);
    },

    rmdir: (path) => {
      return ipcRenderer.invoke('file:rmdir', path);
    },

    unlink: (path) => {
      return ipcRenderer.invoke('file:delete', path);
    },

    readdir: (path) => {
      return ipcRenderer.invoke('file:readdir', path);
    },

    stat: (path) => {
      return ipcRenderer.invoke('file:stat', path);
    },

    countCsvRows: (path) => {
      return ipcRenderer.invoke('file:countCsvRows', path);
    },

    getRawDataPath: (companyName) => {
      return ipcRenderer.invoke('file:getRawDataPath', companyName);
    },

    getCSVPath: (companyName, fileName) => {
      return ipcRenderer.invoke('file:getCSVPath', companyName, fileName);
    },

    watchDirectory: (path, pattern?, callback?: (filePath) => void) => {
      const subscription = (_, filePath) => {
        if (callback) callback(filePath);
      };
      ipcRenderer.on('file:changed', subscription);
      return () => ipcRenderer.removeListener('file:changed', subscription);
    },

    listFiles: (path, pattern?) => {
      return ipcRenderer.invoke('file:list', path, pattern);
    },
  },

  readFile: (path, encoding?) => {
    return ipcRenderer.invoke('file:read', path, encoding);
  },

  writeFile: (path, content, encoding?) => {
    return ipcRenderer.invoke('file:write', path, content, encoding);
  },

  fileExists: (path) => {
    return ipcRenderer.invoke('file:exists', path);
  },

  deleteFile: (path) => {
    return ipcRenderer.invoke('file:delete', path);
  },

  listFiles: (path, pattern?) => {
    return ipcRenderer.invoke('file:list', path, pattern);
  },

  logToFile: (entry) => {
    return ipcRenderer.invoke('logging:write', entry);
  },

  discovery: {
    getModuleStatus: (moduleId, companyName) => {
      return ipcRenderer.invoke('discovery:getModuleStatus', moduleId, companyName);
    },
  },

  // ========================================
  // Centralized Logging API
  // ========================================

  logging: {
    debug: (component, message, context?: Record<string, any>) =>
      ipcRenderer.invoke('log:message', { level: 'DEBUG', component, message, context }),

    info: (component, message, context?: Record<string, any>) =>
      ipcRenderer.invoke('log:message', { level: 'INFO', component, message, context }),

    warn: (component, message, context?: Record<string, any>) =>
      ipcRenderer.invoke('log:message', { level: 'WARN', component, message, context }),

    error: (component, message, stack?, context?: Record<string, any>) =>
      ipcRenderer.invoke('log:error', { component, message, stack, context }),

    fatal: (component, message, stack?, context?: Record<string, any>) =>
      ipcRenderer.invoke('log:message', { level: 'FATAL', component, message, context }),

    getRecent: (count?: number) =>
      ipcRenderer.invoke('log:getRecent', count),

    getByLevel: (level, count?: number) =>
      ipcRenderer.invoke('log:getByLevel', { level, count }),

    getByComponent: (component, count?: number) =>
      ipcRenderer.invoke('log:getByComponent', { component, count }),

    clear: () =>
      ipcRenderer.invoke('log:clear'),

    updateConfig: (config) =>
      ipcRenderer.invoke('log:updateConfig', config),

    getConfig: () =>
      ipcRenderer.invoke('log:getConfig'),
  },

  // ========================================
  // Configuration Management
  // ========================================

  getConfig: (key) => {
    return ipcRenderer.invoke('config:get', key);
  },

  setConfig: (key, value) => {
    return ipcRenderer.invoke('config:set', key, value);
  },

  getAllConfig: () => {
    return ipcRenderer.invoke('config:getAll');
  },

  deleteConfig: (key) => {
    return ipcRenderer.invoke('config:delete', key);
  },

  // ========================================
  // Profile Management
  // ========================================

  profile: {
    getAll: () => ipcRenderer.invoke('profile:getAll'),
    getCurrent: () => ipcRenderer.invoke('profile:getCurrent'),
    setCurrent: (profileId) => ipcRenderer.invoke('profile:setCurrent', profileId),
    create: (profile) => ipcRenderer.invoke('profile:create', profile),
    update: (profile) => ipcRenderer.invoke('profile:update', profile),
    delete: (profileId) => ipcRenderer.invoke('profile:delete', profileId),
    import: (filePath) => ipcRenderer.invoke('profile:import', filePath),
    export: (profileId, filePath) => ipcRenderer.invoke('profile:export', profileId, filePath),
    getStats: (profileId) => ipcRenderer.invoke('profile:getStats', profileId),
    validate: (profile) => ipcRenderer.invoke('profile:validate', profile),
    getConnectionConfig: (profileId) => ipcRenderer.invoke('profile:getConnectionConfig', profileId),
    setConnectionConfig: (profileId, config) => ipcRenderer.invoke('profile:setConnectionConfig', profileId, config),

    // Domain Credentials
    saveDomainCredentials: (profileId, username, password) =>
      ipcRenderer.invoke('profile:saveDomainCredentials', profileId, username, password),
    clearDomainCredentials: (profileId) =>
      ipcRenderer.invoke('profile:clearDomainCredentials', profileId),
    testDomainCredentials: (profileId) =>
      ipcRenderer.invoke('profile:testDomainCredentials', profileId),
    testDomainCredentialsWithValues: (username, password) =>
      ipcRenderer.invoke('profile:testDomainCredentialsWithValues', username, password),
    getDomainCredentialStatus: (profileId) =>
      ipcRenderer.invoke('profile:getDomainCredentialStatus', profileId),

    // Discovery Data
    getADDomainFromDiscovery: (profileId) =>
      ipcRenderer.invoke('profile:getADDomainFromDiscovery', profileId),
    getAzureTenantDomain: (profileId) =>
      ipcRenderer.invoke('profile:getAzureTenantDomain', profileId),
    getAzureDataFromDiscovery: (profileId) =>
      ipcRenderer.invoke('profile:getAzureDataFromDiscovery', profileId),

    /**
     * Test connection for a profile
     * Validates Azure credentials and connectivity
     * @param profileId - Profile ID to test
     * @returns Promise with test result
     */
    testConnection: (profileId) => ipcRenderer.invoke('profile:testConnection', profileId),
    /**
     * Clear credentials for a profile
     * Forces reload from DPAPI file on next access
     * @param profileId - Profile ID to clear
     * @returns Promise with success result
     */
    clearCredentials: (profileId) => ipcRenderer.invoke('profile:clearCredentials', profileId),
    onProfileChanged: (callback: () => void) => {
      ipcRenderer.on('profile:changed', callback);
      return () => ipcRenderer.removeListener('profile:changed', callback);
    }
  },

  // Backwards compatibility aliases for profile loading
  loadSourceProfiles: () => ipcRenderer.invoke('profile:getAll'),
  loadTargetProfiles: () => ipcRenderer.invoke('profile:getAll'),
  // FIXED: Use profile:updateSource instead of profile:update to properly merge with existing profile
  updateSourceProfile: (id, updates) => ipcRenderer.invoke('profile:updateSource', id, updates),
  updateTargetProfile: (id, updates) => ipcRenderer.invoke('profile:updateTarget', id, updates),
  deleteSourceProfile: (id) => ipcRenderer.invoke('profile:deleteSource', id),
  deleteTargetProfile: (id) => ipcRenderer.invoke('profile:deleteTarget', id),
  createSourceProfile: (profile) => ipcRenderer.invoke('profile:createSource', profile),
  createTargetProfile: (profile) => ipcRenderer.invoke('profile:createTarget', profile),
  setActiveProfile: (id) => ipcRenderer.invoke('profile:setCurrent', id),
  setActiveSourceProfile: (id) => ipcRenderer.invoke('profile:setActiveSource', id),
  setActiveTargetProfile: (id) => ipcRenderer.invoke('profile:setActiveTarget', id),

  // ========================================
  // Credential Management
  // ========================================

  loadCredentials: (profileId) => {
    return ipcRenderer.invoke('credentials:load', { profileId });
  },

  saveCredentials: (
    profileId,
    username,
    password,
    connectionType: 'ActiveDirectory' | 'AzureAD' | 'Exchange' | 'SharePoint',
    domain?
  ) => {
    return ipcRenderer.invoke('credentials:save', {
      profileId,
      username,
      password,
      connectionType,
      domain
    });
  },

  deleteCredentials: (profileId) => {
    return ipcRenderer.invoke('credentials:delete', { profileId });
  },

  credentialsExist: (profileId) => {
    return ipcRenderer.invoke('credentials:exists', { profileId });
  },

  // ========================================
  // Event Listeners (for streaming)
  // ========================================

  onProgress: (callback: (data) => void) => {
    const subscription = (_, data) => callback(data);
    ipcRenderer.on('powershell:progress', subscription);

    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('powershell:progress', subscription);
    };
  },

  onOutput: (callback: (data) => void) => {
    const subscription = (_, data) => callback(data);
    ipcRenderer.on('powershell:output', subscription);

    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('powershell:output', subscription);
    };
  },

  // Enhanced stream listeners for all 6 PowerShell streams
  onOutputStream: (callback: (data) => void) => {
    const subscription = (_, data) => callback(data);
    ipcRenderer.on('powershell:stream:output', subscription);
    return () => ipcRenderer.removeListener('powershell:stream:output', subscription);
  },

  onErrorStream: (callback: (data) => void) => {
    const subscription = (_, data) => callback(data);
    ipcRenderer.on('powershell:stream:error', subscription);
    return () => ipcRenderer.removeListener('powershell:stream:error', subscription);
  },

  onWarningStream: (callback: (data) => void) => {
    const subscription = (_, data) => callback(data);
    ipcRenderer.on('powershell:stream:warning', subscription);
    return () => ipcRenderer.removeListener('powershell:stream:warning', subscription);
  },

  onVerboseStream: (callback: (data) => void) => {
    const subscription = (_, data) => callback(data);
    ipcRenderer.on('powershell:stream:verbose', subscription);
    return () => ipcRenderer.removeListener('powershell:stream:verbose', subscription);
  },

  onDebugStream: (callback: (data) => void) => {
    const subscription = (_, data) => callback(data);
    ipcRenderer.on('powershell:stream:debug', subscription);
    return () => ipcRenderer.removeListener('powershell:stream:debug', subscription);
  },

  onInformationStream: (callback: (data) => void) => {
    const subscription = (_, data) => callback(data);
    ipcRenderer.on('powershell:stream:information', subscription);
    return () => ipcRenderer.removeListener('powershell:stream:information', subscription);
  },

  onExecutionCancelled: (callback: (data: { executionId }) => void) => {
    const subscription = (_, data: { executionId }) => callback(data);
    ipcRenderer.on('powershell:execution:cancelled', subscription);
    return () => ipcRenderer.removeListener('powershell:execution:cancelled', subscription);
  },

  // ========================================
  // File Watcher Operations
  // ========================================

  startFileWatcher: (profileId) => {
    return ipcRenderer.invoke('filewatcher:start', profileId);
  },

  stopFileWatcher: (profileId) => {
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

  onFileChanged: (callback: (data) => void) => {
    const subscription = (_, data) => callback(data);
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

  openExternal: (target) => {
    return ipcRenderer.invoke('system:openExternal', target);
  },

  showOpenDialog: (options: {
    title?;
    defaultPath?;
    buttonLabel?;
    filters?: Array<{ name; extensions[] }>;
    properties?: Array<'openFile' | 'openDirectory' | 'multiSelections'>;
  }) => {
    return ipcRenderer.invoke('system:showOpenDialog', options);
  },

  showSaveDialog: (options: {
    title?;
    defaultPath?;
    buttonLabel?;
    filters?: Array<{ name; extensions[] }>;
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

  invoke: (channel, args?): Promise<T> => {
    return ipcRenderer.invoke(channel, args);
  },

  // ========================================
  // Environment Detection
  // ========================================

  detectEnvironment: (config?: Record<string, unknown>) => {
    return ipcRenderer.invoke('environment:detect', config);
  },

  validateEnvironmentCredentials: (provider, credentials: Record<string, string>) => {
    return ipcRenderer.invoke('environment:validateCredentials', provider, credentials);
  },

  cancelEnvironmentDetection: (detectionId) => {
    return ipcRenderer.invoke('environment:cancel', detectionId);
  },

  getEnvironmentStatistics: () => {
    return ipcRenderer.invoke('environment:getStatistics');
  },

  onEnvironmentDetectionStarted: (callback: (data) => void) => {
    const subscription = (_, data) => callback(data);
    ipcRenderer.on('environment:detection:started', subscription);
    return () => ipcRenderer.removeListener('environment:detection:started', subscription);
  },

  onEnvironmentDetectionProgress: (callback: (data) => void) => {
    const subscription = (_, data) => callback(data);
    ipcRenderer.on('environment:detection:progress', subscription);
    return () => ipcRenderer.removeListener('environment:detection:progress', subscription);
  },

  onEnvironmentDetectionCompleted: (callback: (data) => void) => {
    const subscription = (_, data) => callback(data);
    ipcRenderer.on('environment:detection:completed', subscription);
    return () => ipcRenderer.removeListener('environment:detection:completed', subscription);
  },

  onEnvironmentDetectionFailed: (callback: (data) => void) => {
    const subscription = (_, data) => callback(data);
    ipcRenderer.on('environment:detection:failed', subscription);
    return () => ipcRenderer.removeListener('environment:detection:failed', subscription);
  },

  onEnvironmentDetectionCancelled: (callback: (data) => void) => {
    const subscription = (_, data) => callback(data);
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
    moduleName;
    companyName?;
    configuration?: Record<string, any>;
    parameters?: Record<string, any>;
    executionId?;
    executionOptions?: Record<string, any>;
  }) => {
    console.log('[PRELOAD] ========== executeDiscovery CALLED ==========');
    console.log('[PRELOAD] params:', JSON.stringify(params, null, 2));
    console.log('[PRELOAD] Calling ipcRenderer.invoke with channel: discovery:execute');

    const promise = ipcRenderer.invoke('discovery:execute', params);
    console.log('[PRELOAD] ipcRenderer.invoke called, promise created');

    promise.then((result) => {
      console.log('[PRELOAD] ✅ executeDiscovery promise resolved');
      console.log('[PRELOAD] Result type:', typeof result);
      console.log('[PRELOAD] Result keys:', result ? Object.keys(result as object) : 'NULL');
      console.log('[PRELOAD] Result.success:', (result as { success? })?.success);
      console.log('[PRELOAD] Result.error:', (result as { error? })?.error);
    }).catch((err) => {
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
  cancelDiscovery: (executionId) => {
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
  getDiscoveryModuleInfo: (moduleName) => {
    return ipcRenderer.invoke('discovery:get-module-info', { moduleName });
  },

  /**
   * Register a listener for discovery output events (all 6 PowerShell streams)
   * @param callback Function to call when output is received
   * @returns Cleanup function to remove listener
   */
  onDiscoveryOutput: (callback: (data: {
    executionId;
    timestamp;
    level: 'output' | 'error' | 'warning' | 'verbose' | 'debug' | 'information';
    message;
    source;
  }) => void) => {
    const subscription = (_, data) => {
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
    executionId;
    percentage: number;
    currentPhase;
    itemsProcessed?: number;
    totalItems?: number;
  }) => void) => {
    const subscription = (_, data) => {
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
    executionId;
    result;
    duration: number;
  }) => void) => {
    const subscription = (_, data) => {
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
    executionId;
    error;
  }) => void) => {
    const subscription = (_, data) => {
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
    executionId;
  }) => void) => {
    const subscription = (_, data) => callback(data);
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
    loadAll: (profilePath?) =>
      ipcRenderer.invoke('logic-engine:load-all', { profilePath }),

    /**
     * Get comprehensive user detail projection
     * @param userId - User SID or UPN
     * @returns Promise with UserDetailProjection
     */
    getUserDetail: (userId) =>
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
    onProgress: (callback: (progress) => void) => {
      const handler = (_, data) => callback(data);
      ipcRenderer.on('logic-engine:progress', handler);
      return () => ipcRenderer.removeListener('logic-engine:progress', handler);
    },

    /**
     * Listen for load completion events
     * @param callback - Called when load completes
     * @returns Cleanup function
     */
    onLoaded: (callback: (data) => void) => {
      const handler = (_, data) => callback(data);
      ipcRenderer.on('logic-engine:loaded', handler);
      return () => ipcRenderer.removeListener('logic-engine:loaded', handler);
    },

    /**
     * Listen for load error events
     * @param callback - Called on load errors
     * @returns Cleanup function
     */
    onError: (callback: (error) => void) => {
      const handler = (_, data) => callback(data);
      ipcRenderer.on('logic-engine:error', handler);
      return () => ipcRenderer.removeListener('logic-engine:error', handler);
    },

    /**
     * Analyze migration complexity for a user
     * @param userId - User SID or UPN
     * @returns Promise with complexity score, level, and contributing factors
     */
    analyzeMigrationComplexity: (userId) =>
      ipcRenderer.invoke('logicEngine:analyzeMigrationComplexity', userId),

    /**
     * Batch analyze migration complexity for multiple users
     * @param userIds - Array of user SIDs or UPNs
     * @returns Promise with complexity results mapped by userId
     */
    batchAnalyzeMigrationComplexity: (userIds[]) =>
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
    getStats: (profileName) =>
      ipcRenderer.invoke('dashboard:getStats', profileName),

    /**
     * Get project timeline and wave information
     * @param profileName - Profile name to get timeline for
     * @returns Promise with ProjectTimeline
     */
    getProjectTimeline: (profileName) =>
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
    getRecentActivity: (profileName, limit?: number) =>
      ipcRenderer.invoke('dashboard:getRecentActivity', profileName, limit),

    /**
     * Acknowledge a system alert
     * @param alertId - Alert ID to acknowledge
     * @returns Promise with success status
     */
    acknowledgeAlert: (alertId) =>
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
      companyName;
      showWindow?;
      autoInstallModules?;
      secretValidityYears?: number;
      skipAzureRoles?;
    }) =>
      ipcRenderer.invoke('app-registration:launch', options),

    /**
     * Check if app registration credentials exist for a company
     * @param companyName - Company name
     * @returns Promise with boolean indicating if credentials exist
     */
    hasCredentials: (companyName) =>
      ipcRenderer.invoke('app-registration:has-credentials', companyName),

    /**
     * Read app registration credential summary
     * @param companyName - Company name
     * @returns Promise with credential summary or null
     */
    readSummary: (companyName) =>
      ipcRenderer.invoke('app-registration:read-summary', companyName),

    /**
     * Decrypt app registration credential file
     * @param credentialFilePath - Path to encrypted credential file
     * @returns Promise with decrypted client secret or null
     */
    decryptCredential: (credentialFilePath) =>
      ipcRenderer.invoke('app-registration:decrypt-credential', credentialFilePath),

    /**
     * Read registration status from status file (for progress tracking)
     * @param companyName - Company name
     * @returns Promise with status object or null
     */
    readStatus: (companyName) =>
      ipcRenderer.invoke('app-registration:read-status', companyName),

    /**
     * Clear registration status file before starting new registration
     * @param companyName - Company name
     */
    clearStatus: (companyName) =>
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
    testActiveDirectory: (domainController, credential?: { username; password }) =>
      ipcRenderer.invoke('connection-test:active-directory', domainController, credential),

    /**
     * Test Exchange Server connection
     * @param serverUrl - Exchange server URL
     * @param credential - Optional credentials
     * @returns Promise with test result
     */
    testExchange: (serverUrl, credential?: { username; password }) =>
      ipcRenderer.invoke('connection-test:exchange', serverUrl, credential),

    /**
     * Test Azure AD connection
     * @param tenantId - Azure AD tenant ID
     * @param clientId - Application client ID
     * @param clientSecret - Application client secret
     * @returns Promise with test result
     */
    testAzureAD: (tenantId, clientId, clientSecret) =>
      ipcRenderer.invoke('connection-test:azure-ad', tenantId, clientId, clientSecret),

    /**
     * Test comprehensive environment (T-000)
     * @param config - Environment configuration
     * @returns Promise with environment test result
     */
    testEnvironment: (config: {
      profileName;
      domainController?;
      exchangeServer?;
      tenantId?;
      clientId?;
      clientSecret?;
      credential?: { username; password };
    }) =>
      ipcRenderer.invoke('connection-test:environment', config),

    /**
     * Cancel active connection test
     * @param testId - Test ID to cancel
     * @returns Promise with success status
     */
    cancel: (testId) =>
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
    onTestStarted: (callback: (data) => void) => {
      const handler = (_, data) => callback(data);
      ipcRenderer.on('connection-test:started', handler);
      return () => ipcRenderer.removeListener('connection-test:started', handler);
    },

    /**
     * Listen for test progress events
     * @param callback - Called during test progress
     * @returns Cleanup function
     */
    onTestProgress: (callback: (data) => void) => {
      const handler = (_, data) => callback(data);
      ipcRenderer.on('connection-test:progress', handler);
      return () => ipcRenderer.removeListener('connection-test:progress', handler);
    },

    /**
     * Listen for test completed events
     * @param callback - Called when test completes
     * @returns Cleanup function
     */
    onTestCompleted: (callback: (data) => void) => {
      const handler = (_, data) => callback(data);
      ipcRenderer.on('connection-test:completed', handler);
      return () => ipcRenderer.removeListener('connection-test:completed', handler);
    },

    /**
     * Listen for test failed events
     * @param callback - Called when test fails
     * @returns Cleanup function
     */
    onTestFailed: (callback: (data) => void) => {
      const handler = (_, data) => callback(data);
      ipcRenderer.on('connection-test:failed', handler);
      return () => ipcRenderer.removeListener('connection-test:failed', handler);
    },

    /**
     * Listen for test cancelled events
     * @param callback - Called when test is cancelled
     * @returns Cleanup function
     */
    onTestCancelled: (callback: (data) => void) => {
      const handler = (_, data) => callback(data);
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
    getConfiguration: (profileName) =>
      ipcRenderer.invoke('project:getConfiguration', profileName),

    /**
     * Save project configuration
     * @param profileName - Profile name to save configuration for
     * @param config - Project configuration object
     * @returns Promise with success status
     */
    saveConfiguration: (profileName, config) =>
      ipcRenderer.invoke('project:saveConfiguration', profileName, config),

    /**
     * Update project status
     * @param profileName - Profile name
     * @param status - New project status
     * @returns Promise with success status
     */
    updateStatus: (profileName, status) =>
      ipcRenderer.invoke('project:updateStatus', profileName, status),

    /**
     * Add a new migration wave
     * @param profileName - Profile name
     * @param wave - Wave configuration
     * @returns Promise with created wave
     */
    addWave: (profileName, wave) =>
      ipcRenderer.invoke('project:addWave', profileName, wave),

    /**
     * Update migration wave status
     * @param profileName - Profile name
     * @param waveId - Wave ID
     * @param status - New wave status
     * @returns Promise with success status
     */
    updateWaveStatus: (profileName, waveId, status) =>
      ipcRenderer.invoke('project:updateWaveStatus', profileName, waveId, status),
  },

  // ========================================
  // Enhanced Migration Control Plane APIs
  // ========================================

  /**
   * Create domain mapping
   */
  createDomainMapping: (data) =>
    ipcRenderer.invoke('migration:createDomainMapping', data),

  /**
   * Get domain mappings
   */
  getDomainMappings: () =>
    ipcRenderer.invoke('migration:getDomainMappings'),

  /**
   * Validate domain mappings
   */
  validateDomainMappings: (mappings?[]) =>
    ipcRenderer.invoke('migration:validateDomainMappings', mappings),

  /**
   * Create user migration plan
   */
  createUserMigrationPlan: (data) =>
    ipcRenderer.invoke('migration:createUserMigrationPlan', data),

  /**
   * Execute user migration
   */
  executeUserMigration: (plan) =>
    ipcRenderer.invoke('migration:executeUserMigration', plan),

  /**
   * Get user migration status
   */
  getUserMigrationStatus: (planId) =>
    ipcRenderer.invoke('migration:getUserMigrationStatus', planId),

  /**
   * Create Azure resource migration
   */
  createAzureResourceMigration: (data) =>
    ipcRenderer.invoke('migration:createAzureResourceMigration', data),

  /**
   * Execute Azure resource migration
   */
  executeAzureResourceMigration: (migration) =>
    ipcRenderer.invoke('migration:executeAzureResourceMigration', migration),

  /**
   * Get Azure resource migration status
   */
  getAzureResourceMigrationStatus: (migrationId) =>
    ipcRenderer.invoke('migration:getAzureResourceMigrationStatus', migrationId),

  /**
   * Get migration logs
   */
  getMigrationLogs: (filters) =>
    ipcRenderer.invoke('migration:getMigrationLogs', filters),

  /**
   * Get migration metrics
   */
  getMigrationMetrics: (timeRange) =>
    ipcRenderer.invoke('migration:getMigrationMetrics', timeRange),

  /**
   * Retry migration task
   */
  retryMigrationTask: (taskId) =>
    ipcRenderer.invoke('migration:retryMigrationTask', taskId),

  /**
   * Rollback migration
   */
  rollbackMigration: (migrationId) =>
    ipcRenderer.invoke('migration:rollbackMigration', migrationId),

  /**
   * Analyze cross-domain dependencies
   */
  analyzeCrossDomainDependencies: () =>
    ipcRenderer.invoke('migration:analyzeCrossDomainDependencies'),

  /**
   * Register listener for migration progress events
   */
  onMigrationProgress: (callback: (data) => void) => {
    const subscription = (_, data) => callback(data);
    ipcRenderer.on('migration:progress', subscription);
    return () => ipcRenderer.removeListener('migration:progress', subscription);
  },

  /**
   * Register listener for migration complete events
   */
  onMigrationComplete: (callback: (data) => void) => {
    const subscription = (_, data) => callback(data);
    ipcRenderer.on('migration:complete', subscription);
    return () => ipcRenderer.removeListener('migration:complete', subscription);
  },

  /**
   * Register listener for migration error events
   */
  onMigrationError: (callback: (data) => void) => {
    const subscription = (_, data) => callback(data);
    ipcRenderer.on('migration:error', subscription);
    return () => ipcRenderer.removeListener('migration:error', subscription);
  },

  // ========================================
  // Application Fact Sheet API
  // ========================================

  factsheet: {
    create: (params: { sourceProfileId; name; inventoryEntityId? }) =>
      ipcRenderer.invoke('factsheet:create', params),

    getById: (id) =>
      ipcRenderer.invoke('factsheet:getById', id),

    getByInventoryEntity: (inventoryEntityId) =>
      ipcRenderer.invoke('factsheet:getByInventoryEntity', inventoryEntityId),

    getAll: (filters?) =>
      ipcRenderer.invoke('factsheet:getAll', filters),

    updateSection: (params: { id; section; updates; updatedBy? }) =>
      ipcRenderer.invoke('factsheet:updateSection', params),

    delete: (id) =>
      ipcRenderer.invoke('factsheet:delete', id),

    addObservation: (params: {
      applicationId;
      field;
      value;
      source;
      sourceFile?;
      confidence?: 'high' | 'medium' | 'low';
    }) => ipcRenderer.invoke('factsheet:addObservation', params),

    verifyObservation: (params: { applicationId; observationId; verifiedBy }) =>
      ipcRenderer.invoke('factsheet:verifyObservation', params),

    getObservations: (params: { applicationId; field? }) =>
      ipcRenderer.invoke('factsheet:getObservations', params),

    addRelation: (params: {
      sourceId;
      sourceType;
      targetId;
      targetType;
      targetName;
      relationType;
      source;
      description?;
    }) => ipcRenderer.invoke('factsheet:addRelation', params),

    removeRelation: (params: { applicationId; relationId }) =>
      ipcRenderer.invoke('factsheet:removeRelation', params),

    getRelations: (applicationId) =>
      ipcRenderer.invoke('factsheet:getRelations', applicationId),

    getStatistics: (sourceProfileId?) =>
      ipcRenderer.invoke('factsheet:getStatistics', sourceProfileId),

    importFromDiscovery: (params: {
      sourceProfileId;
      applications[];
      source;
      sourceFile;
    }) => ipcRenderer.invoke('factsheet:importFromDiscovery', params),
  },

  // ========================================
  // License Management
  // ========================================

  license: {
    activate: (licenseKey) =>
      ipcRenderer.invoke('license:activate', licenseKey),

    getInfo: () =>
      ipcRenderer.invoke('license:getInfo'),

    deactivate: () =>
      ipcRenderer.invoke('license:deactivate'),

    // Event listeners
    onActivated: (callback: (licenseInfo) => void) => {
      const subscription = (_, licenseInfo) => callback(licenseInfo);
      ipcRenderer.on('license:activated', subscription);
      return () => ipcRenderer.removeListener('license:activated', subscription);
    },

    onDeactivated: (callback: () => void) => {
      const subscription = () => callback();
      ipcRenderer.on('license:deactivated', subscription);
      return () => ipcRenderer.removeListener('license:deactivated', subscription);
    },
  },

  // ========================================
  // Update Management
  // ========================================

  updates: {
    check: () =>
      ipcRenderer.invoke('update:check'),

    download: (updateInfo) =>
      ipcRenderer.invoke('update:download', updateInfo),

    apply: (installerPath, mode?: 'prompt' | 'silent') =>
      ipcRenderer.invoke('update:apply', installerPath, mode),

    rollback: () =>
      ipcRenderer.invoke('update:rollback'),

    getHistory: () =>
      ipcRenderer.invoke('update:getHistory'),

    setAutoUpdate: (enabled) =>
      ipcRenderer.invoke('update:setAutoUpdate', enabled),

    // Event listeners
    onAvailable: (callback: (updateInfo) => void) => {
      const subscription = (_, updateInfo) => callback(updateInfo);
      ipcRenderer.on('update:available', subscription);
      return () => ipcRenderer.removeListener('update:available', subscription);
    },

    onDownloadProgress: (callback: (progress) => void) => {
      const subscription = (_, progress) => callback(progress);
      ipcRenderer.on('update:download-progress', subscription);
      return () => ipcRenderer.removeListener('update:download-progress', subscription);
    },

    onDownloadComplete: (callback: (data) => void) => {
      const subscription = (_, data) => callback(data);
      ipcRenderer.on('update:download-complete', subscription);
      return () => ipcRenderer.removeListener('update:download-complete', subscription);
    },

    onInstallStarted: (callback: () => void) => {
      const subscription = () => callback();
      ipcRenderer.on('update:install-started', subscription);
      return () => ipcRenderer.removeListener('update:install-started', subscription);
    },

    onInstallComplete: (callback: () => void) => {
      const subscription = () => callback();
      ipcRenderer.on('update:install-complete', subscription);
      return () => ipcRenderer.removeListener('update:install-complete', subscription);
    },
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


