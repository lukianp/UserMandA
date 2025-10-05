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
import {
  ElectronAPI,
  ScriptExecutionParams,
  ModuleExecutionParams,
  ExecutionOptions,
  ProgressData,
  OutputData,
  ScriptTask,
  ModuleInfo,
} from './types/shared';

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

  loadProfiles: () => {
    return ipcRenderer.invoke('profile:loadAll');
  },

  saveProfile: (profile: unknown) => {
    return ipcRenderer.invoke('profile:save', profile);
  },

  deleteProfile: (profileId: string) => {
    return ipcRenderer.invoke('profile:delete', profileId);
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
    parameters: Record<string, any>;
    executionId?: string;
  }) => {
    return ipcRenderer.invoke('discovery:execute', params);
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
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('discovery:output', subscription);
    return () => ipcRenderer.removeListener('discovery:output', subscription);
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
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('discovery:progress', subscription);
    return () => ipcRenderer.removeListener('discovery:progress', subscription);
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
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('discovery:complete', subscription);
    return () => ipcRenderer.removeListener('discovery:complete', subscription);
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
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('discovery:error', subscription);
    return () => ipcRenderer.removeListener('discovery:error', subscription);
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
  },
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

console.log('Preload script loaded successfully - Secure bridge established')
