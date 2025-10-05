/**
 * Electron IPC Type Definitions
 * Complete type-safe contract between renderer and main process
 */

import { Dictionary } from './common';

/**
 * Execution options for PowerShell scripts
 */
export interface ExecutionOptions {
  /** Maximum execution time in milliseconds */
  timeout?: number;
  /** Cancellation token for aborting execution */
  cancellationToken?: string;
  /** Enable streaming output via progress events */
  streamOutput?: boolean;
  /** Execution priority level */
  priority?: 'low' | 'normal' | 'high';
  /** Whether script requires elevated permissions */
  requiresElevation?: boolean;
  /** Working directory for script execution */
  workingDirectory?: string;
  /** Environment variables to pass to PowerShell */
  environmentVariables?: Dictionary<string>;
}

/**
 * Result from PowerShell execution
 */
export interface ExecutionResult<T = any> {
  /** Whether execution was successful */
  success: boolean;
  /** Parsed output data (if success) */
  data?: T;
  /** Error message (if failure) */
  error?: string;
  /** Execution duration in milliseconds */
  duration: number;
  /** Non-fatal warnings from execution */
  warnings: string[];
  /** Raw stdout output */
  stdout?: string;
  /** Raw stderr output */
  stderr?: string;
  /** Exit code from PowerShell process */
  exitCode?: number;
}

/**
 * Progress data for long-running operations
 */
export interface ProgressData {
  /** Unique execution ID */
  executionId: string;
  /** Progress percentage (0-100) */
  percentage: number;
  /** Human-readable progress message */
  message: string;
  /** Current item being processed */
  currentItem: string;
  /** Number of items processed */
  itemsProcessed?: number;
  /** Total number of items */
  totalItems?: number;
  /** Estimated time remaining (milliseconds) */
  estimatedTimeRemaining?: number;
}

/**
 * Output data from streaming execution
 */
export interface OutputData {
  /** Unique execution ID */
  executionId: string;
  /** Output data chunk */
  data: string;
  /** Output stream type - all 6 PowerShell streams */
  type: 'output' | 'error' | 'warning' | 'verbose' | 'debug' | 'information';
  /** Timestamp of output */
  timestamp: Date | string;
}

/**
 * PowerShell Module Information
 */
export interface ModuleInfo {
  /** Module name */
  name: string;
  /** Module version */
  version: string;
  /** Module path */
  path: string;
  /** Module description */
  description?: string;
  /** Exported commands */
  exportedCommands?: string[];
  /** Module author */
  author?: string;
  /** Company name */
  companyName?: string;
  /** Module GUID */
  guid?: string;
}

/**
 * Script execution task for parallel execution
 */
export interface ScriptTask {
  /** Task identifier */
  id: string;
  /** Script path */
  scriptPath: string;
  /** Script arguments */
  args: string[];
  /** Execution options */
  options?: ExecutionOptions;
}

/**
 * Script execution parameters
 */
export interface ScriptExecutionParams {
  /** Path to PowerShell script file */
  scriptPath: string;
  /** Command-line arguments to pass to script */
  args: string[];
  /** Execution options */
  options?: ExecutionOptions;
}

/**
 * Module execution parameters
 */
export interface ModuleExecutionParams {
  /** Path to PowerShell module */
  modulePath: string;
  /** Function name to invoke */
  functionName: string;
  /** Named parameters to pass to function */
  parameters: Dictionary<any>;
  /** Execution options */
  options?: ExecutionOptions;
}

/**
 * File operation result
 */
export interface FileOperationResult {
  /** Whether operation was successful */
  success: boolean;
  /** Result data (path, content, etc.) */
  data?: any;
  /** Error message if failed */
  error?: string;
}

/**
 * Configuration key-value pair
 */
export interface ConfigEntry {
  /** Configuration key */
  key: string;
  /** Configuration value */
  value: any;
}

/**
 * Electron API exposed to renderer process
 */
export interface ElectronAPI {
  // ========================================
  // PowerShell Execution
  // ========================================

  /**
   * Execute a PowerShell script file
   * @param params Script execution parameters
   * @returns Promise resolving to execution result
   */
  executeScript: <T = any>(params: ScriptExecutionParams) => Promise<ExecutionResult<T>>;

  /**
   * Execute a PowerShell module function
   * @param params Module execution parameters
   * @returns Promise resolving to execution result
   */
  executeModule: <T = any>(params: ModuleExecutionParams) => Promise<ExecutionResult<T>>;

  /**
   * Cancel a running PowerShell execution
   * @param token Cancellation token
   * @returns Promise resolving to true if cancelled successfully
   */
  cancelExecution: (token: string) => Promise<boolean>;

  /**
   * Discover all installed PowerShell modules
   * @returns Promise resolving to array of module information
   */
  discoverModules: () => Promise<ModuleInfo[]>;

  /**
   * Execute multiple scripts in parallel
   * @param scripts Array of script tasks to execute
   * @returns Promise resolving to array of results (in same order as input)
   */
  executeParallel: (scripts: ScriptTask[]) => Promise<ExecutionResult[]>;

  /**
   * Execute a script with automatic retry on transient failures
   * @param params Script execution parameters
   * @param retries Number of retry attempts (default: 3)
   * @param backoff Initial backoff delay in ms (default: 1000)
   * @returns Promise resolving to execution result
   */
  executeWithRetry: (params: ScriptExecutionParams, retries?: number, backoff?: number) => Promise<ExecutionResult>;

  // ========================================
  // File Operations
  // ========================================

  /**
   * Read a file from the file system
   * @param path Absolute path to file
   * @param encoding File encoding (default: 'utf8')
   * @returns Promise resolving to file contents
   */
  readFile: (path: string, encoding?: string) => Promise<string>;

  /**
   * Write content to a file
   * @param path Absolute path to file
   * @param content Content to write
   * @param encoding File encoding (default: 'utf8')
   * @returns Promise resolving when write is complete
   */
  writeFile: (path: string, content: string, encoding?: string) => Promise<void>;

  /**
   * Check if a file exists
   * @param path Absolute path to file
   * @returns Promise resolving to true if file exists
   */
  fileExists: (path: string) => Promise<boolean>;

  /**
   * Delete a file
   * @param path Absolute path to file
   * @returns Promise resolving when file is deleted
   */
  deleteFile: (path: string) => Promise<void>;

  /**
   * List files in a directory
   * @param path Absolute path to directory
   * @param pattern Optional glob pattern filter
   * @returns Promise resolving to array of file paths
   */
  listFiles: (path: string, pattern?: string) => Promise<string[]>;

  // ========================================
  // Configuration Management
  // ========================================

  /**
   * Get a configuration value
   * @param key Configuration key
   * @returns Promise resolving to configuration value
   */
  getConfig: <T = any>(key: string) => Promise<T>;

  /**
   * Set a configuration value
   * @param key Configuration key
   * @param value Configuration value
   * @returns Promise resolving when config is saved
   */
  setConfig: (key: string, value: any) => Promise<void>;

  /**
   * Get all configuration
   * @returns Promise resolving to complete configuration object
   */
  getAllConfig: () => Promise<Dictionary<any>>;

  /**
   * Delete a configuration key
   * @param key Configuration key
   * @returns Promise resolving when key is deleted
   */
  deleteConfig: (key: string) => Promise<void>;

  // ========================================
  // Profile Management
  // ========================================

  /**
   * Load all profiles from disk
   * @returns Promise resolving to array of profiles
   */
  loadProfiles: () => Promise<any[]>;

  /**
   * Save a profile to disk
   * @param profile Profile data
   * @returns Promise resolving when profile is saved
   */
  saveProfile: (profile: any) => Promise<void>;

  /**
   * Delete a profile from disk
   * @param profileId Profile ID
   * @returns Promise resolving when profile is deleted
   */
  deleteProfile: (profileId: string) => Promise<void>;

  // ========================================
  // Event Listeners (for progress/output streaming)
  // ========================================

  /**
   * Register a progress event listener
   * @param callback Function to call when progress updates are received
   * @returns Cleanup function to remove listener
   */
  onProgress: (callback: (data: ProgressData) => void) => () => void;

  /**
   * Register an output event listener
   * @param callback Function to call when output data is received
   * @returns Cleanup function to remove listener
   */
  onOutput: (callback: (data: OutputData) => void) => () => void;

  /**
   * Register a listener for PowerShell output stream (success/result stream)
   * @param callback Function to call when output stream data is received
   * @returns Cleanup function to remove listener
   */
  onOutputStream: (callback: (data: OutputData) => void) => () => void;

  /**
   * Register a listener for PowerShell error stream
   * @param callback Function to call when error stream data is received
   * @returns Cleanup function to remove listener
   */
  onErrorStream: (callback: (data: OutputData) => void) => () => void;

  /**
   * Register a listener for PowerShell warning stream
   * @param callback Function to call when warning stream data is received
   * @returns Cleanup function to remove listener
   */
  onWarningStream: (callback: (data: OutputData) => void) => () => void;

  /**
   * Register a listener for PowerShell verbose stream
   * @param callback Function to call when verbose stream data is received
   * @returns Cleanup function to remove listener
   */
  onVerboseStream: (callback: (data: OutputData) => void) => () => void;

  /**
   * Register a listener for PowerShell debug stream
   * @param callback Function to call when debug stream data is received
   * @returns Cleanup function to remove listener
   */
  onDebugStream: (callback: (data: OutputData) => void) => () => void;

  /**
   * Register a listener for PowerShell information stream
   * @param callback Function to call when information stream data is received
   * @returns Cleanup function to remove listener
   */
  onInformationStream: (callback: (data: OutputData) => void) => () => void;

  /**
   * Register a listener for execution cancellation events
   * @param callback Function to call when an execution is cancelled
   * @returns Cleanup function to remove listener
   */
  onExecutionCancelled: (callback: (data: { executionId: string }) => void) => () => void;

  // ========================================
  // File Watcher Operations
  // ========================================

  /**
   * Start watching discovery data directories for a specific profile
   * @param profileId Profile ID to watch
   * @returns Promise resolving to operation result
   */
  startFileWatcher: (profileId: string) => Promise<{ success: boolean; profileId: string }>;

  /**
   * Stop watching a specific profile's directories
   * @param profileId Profile ID to stop watching
   * @returns Promise resolving to operation result
   */
  stopFileWatcher: (profileId: string) => Promise<{ success: boolean; profileId: string }>;

  /**
   * Stop all active file watchers
   * @returns Promise resolving to operation result
   */
  stopAllFileWatchers: () => Promise<{ success: boolean }>;

  /**
   * Get list of currently watched files
   * @returns Promise resolving to array of watched file paths
   */
  getWatchedFiles: () => Promise<string[]>;

  /**
   * Get file watcher statistics
   * @returns Promise resolving to watcher statistics
   */
  getFileWatcherStatistics: () => Promise<{
    activeWatchers: number;
    watchedDirectories: string[];
    totalEvents: number;
    eventsByType: {
      added: number;
      changed: number;
      deleted: number;
    };
    lastEventTimestamp?: Date;
  }>;

  /**
   * Register a listener for file change events
   * @param callback Function to call when files change
   * @returns Cleanup function to remove listener
   */
  onFileChanged: (callback: (data: {
    type: 'added' | 'changed' | 'deleted';
    filePath: string;
    fileName: string;
    directory: 'raw' | 'logs';
    profileId: string;
    timestamp: Date;
    fileSize?: number;
    extension?: string;
  }) => void) => () => void;

  // ========================================
  // System / App Operations
  // ========================================

  /**
   * Get the application version
   * @returns Promise resolving to version string
   */
  getAppVersion: () => Promise<string>;

  /**
   * Get the user's data directory path
   * @returns Promise resolving to data directory path
   */
  getDataPath: () => Promise<string>;

  /**
   * Open a file or URL in the default external application
   * @param target File path or URL
   * @returns Promise resolving when opened
   */
  openExternal: (target: string) => Promise<void>;

  /**
   * Show a native file/folder selection dialog
   * @param options Dialog options
   * @returns Promise resolving to selected paths (or null if cancelled)
   */
  showOpenDialog: (options: {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
    properties?: Array<'openFile' | 'openDirectory' | 'multiSelections'>;
  }) => Promise<string[] | null>;

  /**
   * Show a native save file dialog
   * @param options Dialog options
   * @returns Promise resolving to selected path (or null if cancelled)
   */
  showSaveDialog: (options: {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
  }) => Promise<string | null>;

  // ========================================
  // Generic IPC Invoke (for custom handlers)
  // ========================================

  /**
   * Generic IPC invoke method for calling custom IPC handlers
   * This allows invoking any registered IPC handler without adding explicit method definitions
   *
   * @param channel The IPC channel name (e.g., 'get-user-detail')
   * @param args Optional arguments to pass to the handler
   * @returns Promise resolving to the handler's return value
   *
   * @example
   * ```typescript
   * const result = await window.electronAPI.invoke<UserDetailProjection>('get-user-detail', { userId: 'user@company.com' });
   * ```
   */
  invoke: <T = any>(channel: string, args?: any) => Promise<T>;

  // ========================================
  // Environment Detection
  // ========================================

  /**
   * Detect environment type and available services
   * @param config Detection configuration
   * @returns Promise resolving to detection result
   */
  detectEnvironment: (config?: {
    credentials?: {
      tenantId?: string;
      subscriptionId?: string;
      clientId?: string;
      clientSecret?: string;
      awsAccessKey?: string;
      awsSecretKey?: string;
      gcpProjectId?: string;
      gcpServiceAccountKey?: string;
    };
    detectAzure?: boolean;
    detectOnPremises?: boolean;
    detectAWS?: boolean;
    detectGCP?: boolean;
    timeout?: number;
  }) => Promise<any>;

  /**
   * Validate credentials for a specific provider
   * @param provider Environment provider type
   * @param credentials Provider-specific credentials
   * @returns Promise resolving to validation result
   */
  validateEnvironmentCredentials: (
    provider: 'azure' | 'on-premises' | 'aws' | 'gcp',
    credentials: Record<string, string>
  ) => Promise<{ valid: boolean; message: string; details?: any }>;

  /**
   * Cancel active environment detection
   * @param detectionId Detection ID to cancel
   * @returns Promise resolving to true if cancelled successfully
   */
  cancelEnvironmentDetection: (detectionId: string) => Promise<boolean>;

  /**
   * Get environment detection statistics
   * @returns Promise resolving to statistics
   */
  getEnvironmentStatistics: () => Promise<{ activeDetections: number; totalDetectionsRun: number }>;

  /**
   * Register a listener for environment detection started events
   * @param callback Function to call when detection starts
   * @returns Cleanup function to remove listener
   */
  onEnvironmentDetectionStarted: (callback: (data: any) => void) => () => void;

  /**
   * Register a listener for environment detection progress events
   * @param callback Function to call when detection progress updates
   * @returns Cleanup function to remove listener
   */
  onEnvironmentDetectionProgress: (callback: (data: any) => void) => () => void;

  /**
   * Register a listener for environment detection completed events
   * @param callback Function to call when detection completes
   * @returns Cleanup function to remove listener
   */
  onEnvironmentDetectionCompleted: (callback: (data: any) => void) => () => void;

  /**
   * Register a listener for environment detection failed events
   * @param callback Function to call when detection fails
   * @returns Cleanup function to remove listener
   */
  onEnvironmentDetectionFailed: (callback: (data: any) => void) => () => void;

  /**
   * Register a listener for environment detection cancelled events
   * @param callback Function to call when detection is cancelled
   * @returns Cleanup function to remove listener
   */
  onEnvironmentDetectionCancelled: (callback: (data: any) => void) => () => void;

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
  }) => Promise<{
    success: boolean;
    executionId?: string;
    result?: any;
    error?: string;
  }>;

  /**
   * Cancel active discovery execution
   * @param executionId Execution ID to cancel
   * @returns Promise resolving to success status
   */
  cancelDiscovery: (executionId: string) => Promise<{
    success: boolean;
    error?: string;
  }>;

  /**
   * Get available discovery modules from registry
   * @returns Promise resolving to array of discovery modules
   */
  getDiscoveryModules: () => Promise<{
    success: boolean;
    modules?: Array<{
      id: string;
      name: string;
      displayName: string;
      description: string;
      category: string;
      version: string;
      parameters: Array<{
        name: string;
        type: string;
        required: boolean;
        default?: any;
        description?: string;
      }>;
    }>;
    error?: string;
  }>;

  /**
   * Get detailed information about a specific module
   * @param moduleName Module name/ID
   * @returns Promise resolving to module information
   */
  getDiscoveryModuleInfo: (moduleName: string) => Promise<{
    success: boolean;
    info?: {
      id: string;
      name: string;
      displayName: string;
      description: string;
      version: string;
      category: string;
      parameters: Array<{
        name: string;
        type: string;
        required: boolean;
        default?: any;
        description?: string;
      }>;
      outputs?: Array<{
        name: string;
        type: string;
        description?: string;
      }>;
      examples?: Array<{
        description: string;
        code: string;
      }>;
    };
    error?: string;
  }>;

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
  }) => void) => () => void;

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
  }) => void) => () => void;

  /**
   * Register a listener for discovery completion events
   * @param callback Function to call when execution completes
   * @returns Cleanup function to remove listener
   */
  onDiscoveryComplete: (callback: (data: {
    executionId: string;
    result: any;
    duration: number;
  }) => void) => () => void;

  /**
   * Register a listener for discovery error events
   * @param callback Function to call when an error occurs
   * @returns Cleanup function to remove listener
   */
  onDiscoveryError: (callback: (data: {
    executionId: string;
    error: string;
  }) => void) => () => void;

  /**
   * Register a listener for discovery cancellation events
   * @param callback Function to call when execution is cancelled
   * @returns Cleanup function to remove listener
   */
  onDiscoveryCancelled: (callback: (data: {
    executionId: string;
  }) => void) => () => void;
}

/**
 * Augment the global Window interface with our ElectronAPI
 */
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
