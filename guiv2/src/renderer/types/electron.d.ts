/**
 * Electron IPC Type Definitions
 * Complete type-safe contract between renderer and main process
 */

import { Dictionary } from './common';

/**
 * Discovery execution result
 */
export interface DiscoveryExecutionResult {
  success: boolean;
  executionId?: string;
  result?: any;
  error?: string;
}

/**
 * Discovery cancellation result
 */
export interface DiscoveryCancellationResult {
  success: boolean;
  error?: string;
}

/**
 * Discovery module list result
 */
export interface DiscoveryModuleListResult {
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
}

/**
 * Discovery module info result
 */
export interface DiscoveryModuleInfoResult {
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
}

/**
 * Connection test result
 */
export interface ConnectionTestResult {
  success: boolean;
  message?: string;
  details?: any;
  duration?: number;
  timestamp?: Date;
}

/**
 * Environment test configuration
 */
export interface EnvironmentTestConfig {
  profileName: string;
  domainController?: string;
  exchangeServer?: string;
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
  credential?: { username: string; password: string };
}

/**
 * Environment test result
 */
export interface EnvironmentTestResult {
  success: boolean;
  results?: {
    activeDirectory?: ConnectionTestResult;
    exchange?: ConnectionTestResult;
    azureAD?: ConnectionTestResult;
    overall?: {
      success: boolean;
      message: string;
    };
  };
  error?: string;
}

/**
 * Connection test statistics
 */
export interface ConnectionTestStatistics {
  totalTests: number;
  successfulTests: number;
  failedTests: number;
  averageResponseTime: number;
  lastTestTimestamp?: Date;
}

/**
 * Log entry structure
 */
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  component: string;
  message: string;
  context?: Record<string, any>;
  stack?: string;
}

/**
 * Logging configuration
 */
export interface LoggingConfig {
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  maxFiles?: number;
  maxFileSize?: number;
  console?: boolean;
  file?: boolean;
  format?: 'json' | 'text';
}

/**
 * Logic Engine load result
 */
export interface LogicEngineLoadResult {
  success: boolean;
  statistics?: any;
  error?: string;
}

/**
 * Logic Engine user detail result
 */
export interface LogicEngineUserDetailResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Logic Engine statistics result
 */
export interface LogicEngineStatisticsResult {
  success: boolean;
  data?: {
    statistics: any;
    lastLoadTime?: Date;
    isLoading: boolean;
  };
  error?: string;
}

/**
 * Logic Engine cache result
 */
export interface LogicEngineCacheResult {
  success: boolean;
  error?: string;
}

/**
 * Migration complexity result
 */
export interface MigrationComplexityResult {
  success: boolean;
  data?: {
    score: number;
    level: 'Low' | 'Medium' | 'High';
    factors: string[];
    estimatedDowntime?: number; // minutes
  };
  error?: string;
}

/**
 * Migration complexity batch result
 */
export interface MigrationComplexityBatchResult {
  success: boolean;
  data?: Record<string, {
    score: number;
    level: 'Low' | 'Medium' | 'High';
    factors: string[];
    estimatedDowntime?: number; // minutes
  }>;
  error?: string;
}

/**
 * Migration complexity statistics result
 */
export interface MigrationComplexityStatisticsResult {
  success: boolean;
  data?: {
    total: number;
    low: number;
    medium: number;
    high: number;
    analyzed: number;
  };
  error?: string;
}

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
  /** Back-compat convenience property for stdout (some code expects 'output') */
  output?: string;
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
  message?: string;
  /** Current phase of execution */
  currentPhase?: string;
  /** Current item being processed */
  currentItem?: string;
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
 * Inline script execution parameters
 */
export interface InlineScriptParams {
  /** Inline PowerShell script to execute */
  script: string;
  /** Execution timeout in milliseconds */
  timeout?: number;
}

/**
 * Module execution parameters
 */
export interface ModuleExecutionParams {
  /** Path to PowerShell module file */
  modulePath: string;
  /** Function name to invoke within the module */
  functionName: string;
  /** Named parameters to pass to function */
  parameters?: Record<string, any>;
  /** Execution options */
  options?: {
    /** Maximum execution time in milliseconds */
    timeout?: number;
    /** Unique cancellation token */
    cancellationToken?: string;
    /** Enable output streaming */
    streamOutput?: boolean;
    /** Working directory */
    workingDirectory?: string;
  };
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
   * Execute a PowerShell script file or inline script
   * @param params Script execution parameters (file-based or inline)
   * @returns Promise resolving to execution result
   */
  executeScript: <T = any>(params: ScriptExecutionParams | InlineScriptParams) => Promise<ExecutionResult<T>>;

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
   * File system API for advanced operations
   */
  fs: {
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
    exists: (path: string) => Promise<boolean>;

    /**
     * Create a directory
     * @param path Absolute path to directory
     * @returns Promise resolving when directory is created
     */
    mkdir: (path: string) => Promise<void>;

    /**
     * Remove a directory
     * @param path Absolute path to directory
     * @returns Promise resolving when directory is removed
     */
    rmdir: (path: string) => Promise<void>;

    /**
     * Delete a file
     * @param path Absolute path to file
     * @returns Promise resolving when file is deleted
     */
    unlink: (path: string) => Promise<void>;

    /**
     * Read directory contents
     * @param path Absolute path to directory
     * @returns Promise resolving to array of file/directory names
     */
    readdir: (path: string) => Promise<string[]>;

    /**
     * Get file/directory statistics
     * @param path Absolute path to file or directory
     * @returns Promise resolving to file stats
     */
    stat: (path: string) => Promise<{
      size: number;
      isFile: boolean;
      isDirectory: boolean;
      mtime: Date;
      atime: Date;
      ctime: Date;
    }>;

    /**
     * Count CSV rows in a file (excluding header)
     * @param path Path to CSV file
     * @returns Promise resolving to row count (0 if file doesn't exist)
     */
    countCsvRows: (path: string) => Promise<number>;

    /**
     * Get the raw data path for a profile
     * @param companyName Company name
     * @returns Promise resolving to raw data path
     */
    getRawDataPath: (companyName: string) => Promise<string>;

    /**
     * Get the CSV path for a profile and filename
     * @param companyName Company name
     * @param fileName CSV filename
     * @returns Promise resolving to CSV file path
     */
    getCSVPath: (companyName: string, fileName: string) => Promise<string>;

    /**
     * Watch a directory for file changes
     * @param path Directory path to watch
     * @param pattern Optional glob pattern to match files (e.g., '*.csv')
     * @param callback Function called when files change
     * @returns Cleanup function to stop watching
     */
    watchDirectory: (path: string, pattern?: string, callback?: (filePath: string) => void) => () => void;

    /**
     * List files in a directory
     * @param path Absolute path to directory
     * @param pattern Optional glob pattern filter
     * @returns Promise resolving to array of file paths
     */
    listFiles: (path: string, pattern?: string) => Promise<string[]>;
  };

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

  /**
   * Write log entry to file
   * @param entry Log entry to write
   * @returns Promise resolving when log is written
   */
  logToFile: (entry: any) => Promise<void>;

  /**
   * Discovery module status operations
   */
  discovery: {
    /**
     * Get the status of a discovery module from its status file
     * @param moduleId Discovery module ID (e.g., 'active-directory')
     * @param companyName Company/profile name
     * @returns Promise resolving to status object or null if not found
     */
    getModuleStatus: (moduleId: string, companyName: string) => Promise<{
      moduleId: string;
      moduleName: string;
      status: 'completed' | 'partial' | 'failed';
      lastRun: string;
      recordCount: number;
      duration: number;
      success: boolean;
      hasWarnings: boolean;
      hasErrors: boolean;
      warnings: string[];
      errors: string[];
      csvFiles: string[];
      executedBy: string;
    } | null>;
  };

  /**
   * License management operations
   */
  license: {
    getInfo: () => Promise<{ success: boolean; licenseInfo?: any; error?: string }>;
    activate: (licenseKey: string) => Promise<{ success: boolean; licenseInfo?: any; error?: string }>;
    deactivate: () => Promise<{ success: boolean; error?: string }>;
    onActivated: (callback: (info: any) => void) => () => void;
    onDeactivated: (callback: () => void) => () => void;
  };

  /**
   * Get the profile data path for a company
   * @param companyName Company name
   * @returns Promise resolving to profile data path
   */
  getProfileDataPath?: (companyName: string) => Promise<string>;

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
   * Profile management API with CRUD operations and profile switching
   */
  profile: {
    /**
     * Get all profiles
     * @returns Promise resolving to array of CompanyProfile
     */
    getAll: () => Promise<import('../../../shared/types/profile').CompanyProfile[]>;

    /**
     * Get the current active profile
     * @returns Promise resolving to active CompanyProfile or null
     */
    getCurrent: () => Promise<import('../../../shared/types/profile').CompanyProfile | null>;

    /**
     * Set the active profile
     * @param profileId Profile ID to set as active
     * @returns Promise resolving to success status
     */
    setCurrent: (profileId: string) => Promise<boolean>;

    /**
     * Create a new profile
     * @param profile Profile data (without id, created, lastModified)
     * @returns Promise resolving to created CompanyProfile
     */
    create: (profile: Omit<import('../../../shared/types/profile').CompanyProfile, 'id' | 'created' | 'lastModified'>) => Promise<import('../../../shared/types/profile').CompanyProfile>;

    /**
     * Update an existing profile
     * @param profile Complete profile data
     * @returns Promise resolving to updated CompanyProfile
     */
    update: (profile: import('../../../shared/types/profile').CompanyProfile) => Promise<import('../../../shared/types/profile').CompanyProfile>;

    /**
     * Delete a profile
     * @param profileId Profile ID to delete
     * @returns Promise resolving to success status
     */
    delete: (profileId: string) => Promise<boolean>;

    /**
     * Import profile from file
     * @param filePath Path to profile JSON file
     * @returns Promise resolving to imported CompanyProfile
     */
    import: (filePath: string) => Promise<import('../../../shared/types/profile').CompanyProfile>;

    /**
     * Export profile to file
     * @param profileId Profile ID to export
     * @param filePath Destination file path
     * @returns Promise resolving when export is complete
     */
    export: (profileId: string, filePath: string) => Promise<void>;

    /**
     * Get profile statistics
     * @param profileId Profile ID to get stats for
     * @returns Promise resolving to ProfileStatistics or null
     */
    getStats: (profileId: string) => Promise<import('../../../shared/types/profile').ProfileStatistics | null>;

    /**
     * Validate a profile
     * @param profile Profile data to validate
     * @returns Promise resolving to ProfileValidationResult
     */
    validate: (profile: import('../../../shared/types/profile').CompanyProfile) => Promise<import('../../../shared/types/profile').ProfileValidationResult>;

    /**
     * Get connection configuration for a profile
     * @param profileId Profile ID
     * @returns Promise resolving to ConnectionConfig or null
     */
    getConnectionConfig: (profileId: string) => Promise<import('../../../shared/types/profile').ConnectionConfig | null>;

    /**
     * Save connection configuration for a profile
     * @param profileId Profile ID
     * @param config Connection configuration
     * @returns Promise resolving when saved
     */
    setConnectionConfig: (profileId: string, config: import('../../../shared/types/profile').ConnectionConfig) => Promise<void>;

    /**
     * Test connection for a profile
     * Validates Azure credentials and connectivity
     * @param profileId Profile ID to test
     * @returns Promise with test result
     */
    testConnection: (profileId: string) => Promise<{ success: boolean; error?: string; details?: Record<string, unknown> }>;

    /**
     * Clear credentials for a profile
     * Forces reload from DPAPI file on next access
     * @param profileId Profile ID to clear
     * @returns Promise with success result
     */
    clearCredentials: (profileId: string) => Promise<{ success: boolean; error?: string }>;

    /**
     * Save domain credentials for a profile (encrypted with safeStorage)
     * @param profileId Profile ID
     * @param username Domain username in DOMAIN\user format
     * @param password Plaintext password (will be encrypted)
     * @returns Promise resolving when credentials are saved
     */
    saveDomainCredentials: (profileId: string, username: string, password: string) => Promise<void>;

    /**
     * Clear domain credentials for a profile
     * @param profileId Profile ID
     * @returns Promise resolving when credentials are cleared
     */
    clearDomainCredentials: (profileId: string) => Promise<void>;

    /**
     * Test domain credentials by authenticating with AD
     * @param profileId Profile ID
     * @returns Promise with test result including validity and domain
     */
    testDomainCredentials: (profileId: string) => Promise<{ valid: boolean; domain?: string; error?: string }>;

    /**
     * Test domain credentials with provided values (without saving first)
     * @param username - Domain username (DOMAIN\username)
     * @param password - Plaintext password
     * @returns Promise with test result including validity and domain
     */
    testDomainCredentialsWithValues: (username: string, password: string) => Promise<{ valid: boolean; domain?: string; error?: string }>;

    /**
     * Get domain credential status (no passwords)
     * @param profileId Profile ID
     * @returns Promise with credential status information
     */
    getDomainCredentialStatus: (profileId: string) => Promise<{
      hasCredentials: boolean;
      username?: string;
      validationStatus?: import('../../../shared/types/profile').DomainCredentialValidationStatus;
      lastValidated?: string;
      validationError?: string;
    }>;

    /**
     * Get AD domain from discovery data
     * @param profileId Profile ID
     * @returns Promise resolving to AD domain if AD discovery has run
     */
    getADDomainFromDiscovery: (profileId: string) => Promise<{ domain: string | null }>;

    /**
     * Get Azure tenant domain from discovery data
     * @param profileId Profile ID
     * @returns Promise resolving to tenant domain if Azure discovery has run
     */
    getAzureTenantDomain: (profileId: string) => Promise<{ domain: string | null }>;

    /**
     * Get Azure data (domain and tenant ID) from discovery data
     * @param profileId Profile ID
     * @returns Promise resolving to Azure domain and tenant ID if Azure discovery has run
     */
    getAzureDataFromDiscovery: (profileId: string) => Promise<{ domain: string | null; tenantId: string | null }>;

    /**
     * Register a listener for profile change events
     * @param callback Function to call when profile changes
     * @returns Cleanup function to remove listener
     */
    onProfileChanged: (callback: () => void) => () => void;
  };

  // ========================================
  // Backwards Compatibility Aliases for Profile Loading
  // ========================================

  /**
   * Load all source profiles (alias for profile.getAll)
   * @returns Promise resolving to array of CompanyProfile
   */
  loadSourceProfiles: () => Promise<import('../../../shared/types/profile').CompanyProfile[]>;

  /**
   * Load all target profiles (alias for profile.getAll)
   * @returns Promise resolving to array of CompanyProfile
   */
  loadTargetProfiles: () => Promise<import('../../../shared/types/profile').CompanyProfile[]>;

  /**
   * Update source profile
   * @param id Profile ID
   * @param updates Partial profile updates
   * @returns Promise resolving to updated profile
   */
  updateSourceProfile: (id: string, updates: any) => Promise<any>;

  /**
   * Update target profile
   * @param id Profile ID
   * @param updates Partial profile updates
   * @returns Promise resolving to updated profile
   */
  updateTargetProfile: (id: string, updates: any) => Promise<any>;

  /**
   * Delete source profile
   * @param id Profile ID
   * @returns Promise resolving to success status
   */
  deleteSourceProfile: (id: string) => Promise<boolean>;

  /**
   * Delete target profile
   * @param id Profile ID
   * @returns Promise resolving to success status
   */
  deleteTargetProfile: (id: string) => Promise<boolean>;

  /**
   * Create source profile
   * @param profile Profile data
   * @returns Promise resolving to created profile
   */
  createSourceProfile: (profile: any) => Promise<any>;

  /**
   * Create target profile
   * @param profile Profile data
   * @returns Promise resolving to created profile
   */
  createTargetProfile: (profile: any) => Promise<any>;

  /**
   * Set active profile (deprecated, use setActiveSourceProfile/setActiveTargetProfile)
   * @param id Profile ID
   * @returns Promise resolving to success status
   */
  setActiveProfile: (id: string) => Promise<boolean>;

  /**
   * Set active source profile
   * @param id Profile ID
   * @returns Promise resolving to success status
   */
  setActiveSourceProfile: (id: string) => Promise<boolean>;

  /**
   * Set active target profile
   * @param id Profile ID
   * @returns Promise resolving to success status
   */
  setActiveTargetProfile: (id: string) => Promise<boolean>;

  // ========================================
  // Credential Management
  // ========================================

  /**
   * Load credentials for a profile
   * Uses precedence: ENV > safeStorage > Legacy File
   * @param profileId Profile ID
   * @returns Promise resolving to sanitized credentials (no secrets)
   */
  loadCredentials: (profileId: string) => Promise<{
    ok: boolean;
    credentials?: {
      tenantId?: string;
      clientId?: string;
      hasSecret: boolean;
      connectionType?: string;
      username?: string;
    };
    error?: string;
  }>;

  /**
   * Save credentials for a profile
   * Stores credentials securely using Electron safeStorage
   * @param profileId Profile ID
   * @param username Username or Client ID
   * @param password Password or Client Secret
   * @param connectionType Connection type
   * @param domain Optional domain
   * @returns Promise resolving to operation result
   */
  saveCredentials: (
    profileId: string,
    username: string,
    password: string,
    connectionType: 'ActiveDirectory' | 'AzureAD' | 'Exchange' | 'SharePoint',
    domain?: string
  ) => Promise<{ ok: boolean; error?: string }>;

  /**
   * Delete credentials for a profile
   * @param profileId Profile ID
   * @returns Promise resolving to operation result
   */
  deleteCredentials: (profileId: string) => Promise<{ ok: boolean; error?: string }>;

  /**
   * Check if credentials exist for a profile
   * @param profileId Profile ID
   * @returns Promise resolving to exists status
   */
  credentialsExist: (profileId: string) => Promise<{ ok: boolean; exists?: boolean; error?: string }>;

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
  // Window Management
  // ========================================

  /**
   * Window management API
   */
  window: {
    /**
     * Minimize the main window
     * @returns Promise resolving when window is minimized
     */
    minimize: () => Promise<void>;

    /**
     * Maximize the main window
     * @returns Promise resolving when window is maximized
     */
    maximize: () => Promise<void>;

    /**
     * Close the main window
     * @returns Promise resolving when window is closed
     */
    close: () => Promise<void>;

    /**
     * Restore the main window (from minimized/maximized state)
     * @returns Promise resolving when window is restored
     */
    restore: () => Promise<void>;

    /**
     * Check if the main window is currently maximized
     * @returns Promise resolving to true if maximized
     */
    isMaximized: () => Promise<boolean>;
  };

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
    executionOptions?: {
      timeout?: number;
      showWindow?: boolean;
    };
    executionId?: string;
  }) => Promise<DiscoveryExecutionResult>;

  /**
   * Cancel active discovery execution
   * @param executionId Execution ID to cancel
   * @returns Promise resolving to success status
   */
  cancelDiscovery: (executionId: string) => Promise<DiscoveryCancellationResult>;

  /**
   * Get available discovery modules from registry
   * @returns Promise resolving to array of discovery modules
   */
  getDiscoveryModules: () => Promise<DiscoveryModuleListResult>;

  /**
   * Get detailed information about a specific module
   * @param moduleName Module name/ID
   * @returns Promise resolving to module information
   */
  getDiscoveryModuleInfo: (moduleName: string) => Promise<DiscoveryModuleInfoResult>;

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

  // ========================================
  // Dashboard API (Dashboard Enhancement)
  // ========================================

  /**
   * Dashboard API for statistics, timeline, health, and activity
   */
  dashboard: {
    /**
     * Get aggregated dashboard statistics from Logic Engine
     * @param profileName - Profile name to get statistics for
     * @returns Promise with DashboardStats
     */
    getStats: (profileName: string) => Promise<any>;

    /**
     * Get project timeline information
     * @param profileName - Profile name to get timeline for
     * @returns Promise with ProjectTimeline
     */
    getProjectTimeline: (profileName: string) => Promise<any>;

    /**
     * Get system health status
     * @returns Promise with SystemHealth
     */
    getSystemHealth: () => Promise<any>;

    /**
     * Get recent activity from logs
     * @param profileName - Profile name to get activity for
     * @param limit - Maximum number of items to return (default: 10)
     * @returns Promise with ActivityItem array
     */
    getRecentActivity: (profileName: string, limit?: number) => Promise<any[]>;

    /**
     * Acknowledge a system alert
     * @param alertId - ID of alert to acknowledge
     * @returns Promise with success status
     */
    acknowledgeAlert: (alertId: string) => Promise<void>;
  };

  // ========================================
  // Azure App Registration API
  // ========================================

  /**
   * Azure App Registration API for setting up Azure AD app registrations
   */
  appRegistration: {
    /**
     * Launch Azure App Registration PowerShell script
     * @param options App registration options
     * @returns Promise with launch result
     */
    launch: (options: {
      companyName: string;
      showWindow?: boolean;
      autoInstallModules?: boolean;
      secretValidityYears?: number;
      skipAzureRoles?: boolean;
    }) => Promise<{
      success: boolean;
      message?: string;
      error?: string;
      processId?: number;
    }>;

    /**
     * Check if app registration credentials exist for a company
     * @param companyName Company name
     * @returns Promise with boolean indicating if credentials exist
     */
    hasCredentials: (companyName: string) => Promise<boolean>;

    /**
     * Read app registration credential summary
     * @param companyName Company name
     * @returns Promise with credential summary or null
     */
    readSummary: (companyName: string) => Promise<{
      TenantId: string;
      ClientId: string;
      CredentialFile: string;
      Created: string;
      Domain?: string;
    } | null>;

    /**
     * Decrypt app registration credential file
     * @param credentialFilePath Path to encrypted credential file
     * @returns Promise with decrypted client secret or null
     */
    decryptCredential: (credentialFilePath: string) => Promise<string | null>;

    /**
     * Read registration status from status file (for progress tracking)
     * @param companyName Company name
     * @returns Promise with status object or null
     */
    readStatus: (companyName: string) => Promise<{
      status: 'running' | 'success' | 'failed';
      message: string;
      error: string;
      step: string;
      timestamp: string;
      logFile: string;
    } | null>;

    /**
     * Clear registration status file before starting new registration
     * @param companyName Company name
     */
    clearStatus: (companyName: string) => Promise<void>;
  };

  // ========================================
  // Project Management API
  // ========================================

  /**
   * Project Management API
   */
  project: {
    /**
     * Get project configuration
     * @param profileName - Profile name to load configuration for
     * @returns Promise with ProjectConfig result
     */
    getConfiguration: (profileName: string) => Promise<{ success: boolean; data?: any; error?: string }>;

    /**
     * Save project configuration
     * @param profileName - Profile name to save configuration for
     * @param config - Project configuration to save
     * @returns Promise with success status
     */
    saveConfiguration: (profileName: string, config: any) => Promise<{ success: boolean; error?: string }>;

    /**
     * Update project status
     * @param profileName - Profile name
     * @param status - New project status
     * @returns Promise with success status
     */
    updateStatus: (profileName: string, status: any) => Promise<{ success: boolean; error?: string }>;

    /**
     * Add a migration wave
     * @param profileName - Profile name
     * @param wave - Wave configuration
     * @returns Promise with success status
     */
    addWave: (profileName: string, wave: any) => Promise<{ success: boolean; error?: string }>;

    /**
     * Update wave status
     * @param profileName - Profile name
     * @param waveId - Wave ID
     * @param status - New wave status
     * @returns Promise with success status
     */
    updateWaveStatus: (profileName: string, waveId: string, status: any) => Promise<{ success: boolean; error?: string }>;
  };

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
      Promise<ConnectionTestResult>;

    /**
     * Test Exchange Server connection
     * @param serverUrl - Exchange server URL
     * @param credential - Optional credentials
     * @returns Promise with test result
     */
    testExchange: (serverUrl: string, credential?: { username: string; password: string }) =>
      Promise<ConnectionTestResult>;

    /**
     * Test Azure AD connection
     * @param tenantId - Azure AD tenant ID
     * @param clientId - Application client ID
     * @param clientSecret - Application client secret
     * @returns Promise with test result
     */
    testAzureAD: (tenantId: string, clientId: string, clientSecret: string) =>
      Promise<ConnectionTestResult>;

    /**
     * Test comprehensive environment (T-000)
     * @param config - Environment configuration
     * @returns Promise with environment test result
     */
    testEnvironment: (config: EnvironmentTestConfig) =>
      Promise<EnvironmentTestResult>;

    /**
     * Cancel active connection test
     * @param testId - Test ID to cancel
     * @returns Promise with success status
     */
    cancel: (testId: string) =>
      Promise<{ success: boolean; error?: string }>;

    /**
     * Get connection test statistics
     * @returns Promise with statistics
     */
    getStatistics: () =>
      Promise<ConnectionTestStatistics>;

    /**
     * Listen for test started events
     * @param callback - Called when test starts
     * @returns Cleanup function
     */
    onTestStarted: (callback: (data: any) => void) => () => void;

    /**
     * Listen for test progress events
     * @param callback - Called during test progress
     * @returns Cleanup function
     */
    onTestProgress: (callback: (data: any) => void) => () => void;

    /**
     * Listen for test completed events
     * @param callback - Called when test completes
     * @returns Cleanup function
     */
    onTestCompleted: (callback: (data: any) => void) => () => void;

    /**
     * Listen for test failed events
     * @param callback - Called when test fails
     * @returns Cleanup function
     */
    onTestFailed: (callback: (data: any) => void) => () => void;

    /**
     * Listen for test cancelled events
     * @param callback - Called when test is cancelled
     * @returns Cleanup function
     */
    onTestCancelled: (callback: (data: any) => void) => () => void;
  };

  // ========================================
  // Simple Error/Message Logging (for ErrorBoundary & logger.ts)
  // ========================================

  /**
   * Log an error to the main process
   * @param error - Error object with message, stack, etc.
   * @returns Promise resolving when logged
   */
  logError?: (error: {
    message: string;
    stack?: string;
    componentStack?: string;
    timestamp?: string;
  }) => Promise<void>;

  /**
   * Log a message to the main process
   * @param message - Log message object
   * @returns Promise resolving when logged
   */
  logMessage?: (message: any) => Promise<void>;

  // ========================================
  // Centralized Logging API
  // ========================================

  /**
   * Centralized logging API for structured logging across the application
   */
  logging: {
    /**
     * Log debug message
     * @param component - Component name
     * @param message - Log message
     * @param context - Additional context data
     * @returns Promise resolving when logged
     */
    debug: (component: string, message: string, context?: Record<string, any>) => Promise<void>;

    /**
     * Log info message
     * @param component - Component name
     * @param message - Log message
     * @param context - Additional context data
     * @returns Promise resolving when logged
     */
    info: (component: string, message: string, context?: Record<string, any>) => Promise<void>;

    /**
     * Log warning message
     * @param component - Component name
     * @param message - Log message
     * @param context - Additional context data
     * @returns Promise resolving when logged
     */
    warn: (component: string, message: string, context?: Record<string, any>) => Promise<void>;

    /**
     * Log error message with optional stack trace
     * @param component - Component name
     * @param message - Error message
     * @param stack - Optional stack trace
     * @param context - Additional context data
     * @returns Promise resolving when logged
     */
    error: (component: string, message: string, stack?: string, context?: Record<string, any>) => Promise<void>;

    /**
     * Log fatal error message
     * @param component - Component name
     * @param message - Fatal error message
     * @param stack - Optional stack trace
     * @param context - Additional context data
     * @returns Promise resolving when logged
     */
    fatal: (component: string, message: string, stack?: string, context?: Record<string, any>) => Promise<void>;

    /**
     * Get recent log entries
     * @param count - Number of entries to retrieve (default: 100)
     * @returns Promise resolving to array of log entries
     */
    getRecent: (count?: number) => Promise<LogEntry[]>;

    /**
     * Get log entries by level
     * @param level - Log level to filter by
     * @param count - Number of entries to retrieve (default: 100)
     * @returns Promise resolving to array of log entries
     */
    getByLevel: (level: string, count?: number) => Promise<LogEntry[]>;

    /**
     * Get log entries by component
     * @param component - Component name to filter by
     * @param count - Number of entries to retrieve (default: 100)
     * @returns Promise resolving to array of log entries
     */
    getByComponent: (component: string, count?: number) => Promise<LogEntry[]>;

    /**
     * Clear all log entries
     * @returns Promise resolving when cleared
     */
    clear: () => Promise<void>;

    /**
     * Update logging configuration
     * @param config - New logging configuration
     * @returns Promise resolving when updated
     */
    updateConfig: (config: LoggingConfig) => Promise<void>;

    /**
     * Get current logging configuration
     * @returns Promise resolving to current configuration
     */
    getConfig: () => Promise<LoggingConfig>;
  };

  // ========================================
  // Logic Engine API (Epic 4)
  // ========================================

  /**
   * Logic Engine API for data correlation and inference
   */
  logicEngine: {
    /**
     * Load all discovery data from CSV files
     * @param profilePath - Optional path to profile data directory
     * @returns Promise with success status and statistics
     */
    loadAll: (profilePath?: string) => Promise<LogicEngineLoadResult>;

    /**
     * Get comprehensive user detail projection
     * @param userId - User SID or UPN
     * @returns Promise with UserDetailProjection
     */
    getUserDetail: (userId: string) => Promise<LogicEngineUserDetailResult>;

    /**
     * Get current data load statistics
     * @returns Promise with statistics object
     */
    getStatistics: () => Promise<LogicEngineStatisticsResult>;

    /**
     * Invalidate cache and force reload on next access
     * @returns Promise with success status
     */
    invalidateCache: () => Promise<LogicEngineCacheResult>;

    /**
     * Listen for load progress events
     * @param callback - Called with progress updates
     * @returns Cleanup function
     */
    onProgress: (callback: (progress: any) => void) => () => void;

    /**
     * Listen for load completion events
     * @param callback - Called when load completes
     * @returns Cleanup function
     */
    onLoaded: (callback: (data: any) => void) => () => void;

    /**
     * Listen for load error events
     * @param callback - Called on load errors
     * @returns Cleanup function
     */
    onError: (callback: (error: any) => void) => () => void;

    /**
     * Analyze migration complexity for a user
     * @param userId - User SID or UPN
     * @returns Promise with complexity score, level, and contributing factors
     */
    analyzeMigrationComplexity: (userId: string) => Promise<MigrationComplexityResult>;

    /**
     * Batch analyze migration complexity for multiple users
     * @param userIds - Array of user SIDs or UPNs
     * @returns Promise with complexity results mapped by userId
     */
    batchAnalyzeMigrationComplexity: (userIds: string[]) => Promise<MigrationComplexityBatchResult>;

    /**
     * Get complexity statistics for all analyzed users
     * @returns Promise with complexity statistics
     */
    getComplexityStatistics: () => Promise<MigrationComplexityStatisticsResult>;
  };

  // ========================================
  // Backup and Restore API
  // ========================================

  /**
   * Backup and Restore API for data management
   */
  backup?: {
    /**
     * Create a new backup
     * @param config - Backup configuration
     * @returns Promise with backup result
     */
    createBackup: (config: import('../../../renderer/types/models/backup').BackupConfiguration) =>
      Promise<import('../../../renderer/types/models/backup').BackupResult>;

    /**
     * Cancel an active backup operation
     * @param operationId - Backup operation ID
     * @returns Promise with success status
     */
    cancelBackup: (operationId: string) => Promise<boolean>;

    /**
     * List all available backups
     * @returns Promise with array of backup operations
     */
    listBackups: () => Promise<import('../../../renderer/types/models/backup').BackupOperation[]>;

    /**
     * Delete a backup
     * @param operationId - Backup operation ID
     * @returns Promise with success status
     */
    deleteBackup: (operationId: string) => Promise<boolean>;

    /**
     * Validate a backup file
     * @param backupFilePath - Path to backup file
     * @returns Promise with validation result
     */
    validateBackup: (backupFilePath: string) => Promise<{
      isValid: boolean;
      errors: string[];
      warnings: string[];
    }>;

    /**
     * Listen for backup progress events
     * @param callback - Called with progress updates
     * @returns Cleanup function
     */
    onBackupProgress: (callback: (progress: import('../../../renderer/types/models/backup').BackupRestoreProgress) => void) => () => void;

    /**
     * Listen for backup completion events
     * @param callback - Called when backup completes
     * @returns Cleanup function
     */
    onBackupComplete: (callback: (operation: import('../../../renderer/types/models/backup').BackupOperation) => void) => () => void;
  };

  /**
   * Restore API for data recovery
   */
  restore?: {
    /**
     * Restore from a backup file
     * @param backupFilePath - Path to backup file
     * @param config - Restore configuration
     * @returns Promise with restore result
     */
    restoreFromBackup: (
      backupFilePath: string,
      config: import('../../../renderer/types/models/backup').RestoreConfiguration
    ) => Promise<import('../../../renderer/types/models/backup').RestoreResult>;

    /**
     * Cancel an active restore operation
     * @param operationId - Restore operation ID
     * @returns Promise with success status
     */
    cancelRestore: (operationId: string) => Promise<boolean>;

    /**
     * Listen for restore progress events
     * @param callback - Called with progress updates
     * @returns Cleanup function
     */
    onRestoreProgress: (callback: (progress: import('../../../renderer/types/models/backup').BackupRestoreProgress) => void) => () => void;

    /**
     * Listen for restore completion events
     * @param callback - Called when restore completes
     * @returns Cleanup function
     */
    onRestoreComplete: (callback: (operation: import('../../../renderer/types/models/backup').RestoreOperation) => void) => () => void;
  };

  // ========================================
  // Migration Operations API
  // ========================================

  /**
   * Migration Operations API for advanced migration features
   */
  migration?: {
    /**
     * Plan a migration operation
     * @param config - Migration planning configuration
     * @returns Promise with planning result
     */
    planMigration: (config: {
      provider: string;
      profileId: string;
      args: Record<string, any>;
    }) => Promise<{ runId: string }>;

    /**
     * Execute a planned migration
     * @param config - Migration execution configuration
     * @returns Promise with execution result
     */
    executeMigration: (config: {
      provider: string;
      profileId: string;
      runId?: string;
      args: Record<string, any>;
    }) => Promise<{ runId: string }>;

    /**
     * Cancel an active migration
     * @param config - Cancellation configuration
     * @returns Promise with success status
     */
    cancelMigration: (config: { runId: string }) => Promise<{ success: boolean }>;

    /**
     * Pause an active migration
     * @param config - Pause configuration
     * @returns Promise with success status
     */
    pauseMigration: (config: { runId: string }) => Promise<{ success: boolean }>;

    /**
     * Resume a paused migration
     * @param config - Resume configuration
     * @returns Promise with success status
     */
    resumeMigration: (config: { runId: string }) => Promise<{ success: boolean }>;

    /**
     * Get migration statistics
     * @param config - Statistics configuration
     * @returns Promise with migration statistics
     */
    getMigrationStatistics: (config: { runId: string }) => Promise<any>;

    /**
     * Listen for migration progress events
     * @param callback - Called with progress updates
     * @returns Cleanup function
     */
    onMigrationProgress: (callback: (data: any) => void) => () => void;

    /**
     * Listen for migration result events
     * @param callback - Called when migration completes
     * @returns Cleanup function
     */
    onMigrationResult: (callback: (data: any) => void) => () => void;

    /**
     * Listen for migration error events
     * @param callback - Called when migration fails
     * @returns Cleanup function
     */
    onMigrationError: (callback: (data: any) => void) => () => void;
  };

  // ========================================
  // Domain Mapping API (Migration Control Plane)
  // ========================================

  /**
   * Create a new domain mapping
   * @param data - Domain mapping data
   */
  createDomainMapping: (data: any) => Promise<any>;

  /**
   * Get all domain mappings
   */
  getDomainMappings: () => Promise<any>;

  /**
   * Validate domain mappings
   * @param mappings - Optional array of mappings to validate
   */
  validateDomainMappings: (mappings?: any[]) => Promise<any>;

  // User Migration API
  createUserMigrationPlan: (data: any) => Promise<any>;
  executeUserMigration: (plan: any) => Promise<any>;
  getUserMigrationStatus: (planId: string) => Promise<any>;

  // Azure Resource Migration API
  createAzureResourceMigration: (data: any) => Promise<any>;
  executeAzureResourceMigration: (migration: any) => Promise<any>;
  getAzureResourceMigrationStatus: (migrationId: string) => Promise<any>;

  // Migration Logs & Metrics API
  getMigrationLogs: (filters: any) => Promise<any>;
  getMigrationMetrics: (timeRange: any) => Promise<any>;
  retryMigrationTask: (taskId: string) => Promise<any>;
  rollbackMigration: (migrationId: string) => Promise<any>;
  analyzeCrossDomainDependencies: () => Promise<any>;

  // Migration Event Listeners
  onMigrationProgress: (callback: (data: any) => void) => () => void;
  onMigrationComplete: (callback: (data: any) => void) => () => void;
  onMigrationError: (callback: (data: any) => void) => () => void;

  // ========================================
  // Application Fact Sheet API
  // ========================================

  /**
   * Application Fact Sheet API for LeanIX-style application inventory
   */
  factsheet: {
    /**
     * Create a new application fact sheet
     */
    create: (params: { sourceProfileId: string; name: string; inventoryEntityId?: string }) => Promise<{
      success: boolean;
      data?: any;
      error?: string;
    }>;

    /**
     * Get fact sheet by ID
     */
    getById: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>;

    /**
     * Get fact sheet by inventory entity ID
     */
    getByInventoryEntity: (inventoryEntityId: string) => Promise<{ success: boolean; data?: any; error?: string }>;

    /**
     * Get all fact sheets with optional filters
     */
    getAll: (filters?: {
      sourceProfileId?: string;
      lifecyclePhase?: string[];
      criticality?: string[];
      disposition?: string[];
      waveId?: string;
      search?: string;
      tags?: string[];
      minReadinessScore?: number;
      maxRiskScore?: number;
    }) => Promise<{ success: boolean; data?: any[]; error?: string }>;

    /**
     * Update a section of a fact sheet
     */
    updateSection: (params: {
      id: string;
      section: 'baseInfo' | 'lifecycle' | 'business' | 'technical' | 'security' | 'migration';
      updates: any;
      updatedBy?: string;
    }) => Promise<{ success: boolean; data?: any; error?: string }>;

    /**
     * Delete a fact sheet
     */
    delete: (id: string) => Promise<{ success: boolean; error?: string }>;

    /**
     * Add an observation with provenance
     */
    addObservation: (params: {
      applicationId: string;
      field: string;
      value: any;
      source: string;
      sourceFile?: string;
      confidence?: 'high' | 'medium' | 'low';
    }) => Promise<{ success: boolean; data?: any; error?: string }>;

    /**
     * Verify an observation
     */
    verifyObservation: (params: {
      applicationId: string;
      observationId: string;
      verifiedBy: string;
    }) => Promise<{ success: boolean; data?: any; error?: string }>;

    /**
     * Get observation history
     */
    getObservations: (params: { applicationId: string; field?: string }) => Promise<{
      success: boolean;
      data?: any[];
      error?: string;
    }>;

    /**
     * Add a relation to a fact sheet
     */
    addRelation: (params: {
      sourceId: string;
      sourceType: string;
      targetId: string;
      targetType: string;
      targetName: string;
      relationType: string;
      source: string;
      description?: string;
    }) => Promise<{ success: boolean; data?: any; error?: string }>;

    /**
     * Remove a relation
     */
    removeRelation: (params: { applicationId: string; relationId: string }) => Promise<{
      success: boolean;
      error?: string;
    }>;

    /**
     * Get relations for a fact sheet
     */
    getRelations: (applicationId: string) => Promise<{ success: boolean; data?: any[]; error?: string }>;

    /**
     * Get fact sheet statistics
     */
    getStatistics: (sourceProfileId?: string) => Promise<{ success: boolean; data?: any; error?: string }>;

    /**
     * Import applications from discovery
     */
    importFromDiscovery: (params: {
      sourceProfileId: string;
      applications: any[];
      source: string;
      sourceFile: string;
    }) => Promise<{
      success: boolean;
      data?: { created: number; updated: number; errors: number };
      error?: string;
    }>;
  };

  // ========================================
  // Ticketing API
  // ========================================

  /**
   * Ticketing API for managing support tickets with full CRUD operations
   */
  ticketing?: {
    /**
     * Get tickets with pagination and filtering
     * @param options - Query options
     * @returns Promise with ticket list result
     */
    getTickets: (options?: {
      page?: number;
      pageSize?: number;
      search?: string;
      status?: string;
      priority?: string;
      assignee?: string;
    }) => Promise<{
      success: boolean;
      data?: { tickets: any[]; total: number };
      error?: string;
    }>;

    /**
     * Create a new ticket
     * @param ticketData - Ticket creation data
     * @returns Promise with created ticket
     */
    createTicket: (ticketData: any) => Promise<{
      success: boolean;
      data?: any;
      error?: string;
    }>;

    /**
     * Update an existing ticket
     * @param ticketId - Ticket ID
     * @param updates - Update data
     * @returns Promise with updated ticket
     */
    updateTicket: (ticketId: string, updates: any) => Promise<{
      success: boolean;
      data?: any;
      error?: string;
    }>;

    /**
     * Delete a ticket
     * @param ticketId - Ticket ID
     * @returns Promise with success status
     */
    deleteTicket: (ticketId: string) => Promise<{
      success: boolean;
      error?: string;
    }>;

    /**
     * Add comment to ticket
     * @param ticketId - Ticket ID
     * @param commentData - Comment data
     * @returns Promise with created comment
     */
    addComment: (ticketId: string, commentData: any) => Promise<{
      success: boolean;
      data?: any;
      error?: string;
    }>;

    /**
     * Upload attachment to ticket
     * @param ticketId - Ticket ID
     * @param attachmentData - Attachment data
     * @returns Promise with uploaded attachment
     */
    uploadAttachment: (ticketId: string, attachmentData: any) => Promise<{
      success: boolean;
      data?: any;
      error?: string;
    }>;

    /**
     * Bulk update ticket status
     * @param ticketIds - Array of ticket IDs
     * @param status - New status
     * @returns Promise with success status
     */
    bulkUpdateStatus: (ticketIds: string[], status: string) => Promise<{
      success: boolean;
      error?: string;
    }>;

    /**
     * Export tickets to CSV
     * @param options - Export options
     * @returns Promise with success status
     */
    exportTickets: (options?: {
      search?: string;
      status?: string;
      priority?: string;
      assignee?: string;
    }) => Promise<{
      success: boolean;
      error?: string;
    }>;
  };

  // ========================================
  // Webhooks API
  // ========================================

  /**
   * Webhooks API for managing webhook configuration and delivery tracking
   */
  webhooks?: {
    /**
     * Get webhooks with pagination and filtering
     * @param options - Query options
     * @returns Promise with webhook list result
     */
    getWebhooks: (options?: {
      page?: number;
      pageSize?: number;
      search?: string;
      status?: string;
      event?: string;
    }) => Promise<{
      success: boolean;
      data?: { webhooks: any[]; total: number };
      error?: string;
    }>;

    /**
     * Get webhook deliveries
     * @param options - Query options
     * @returns Promise with deliveries result
     */
    getDeliveries: (options?: {
      webhookId?: string;
      limit?: number;
    }) => Promise<{
      success: boolean;
      data?: { deliveries: any[] };
      error?: string;
    }>;

    /**
     * Get webhook statistics
     * @returns Promise with statistics
     */
    getStatistics: () => Promise<{
      success: boolean;
      data?: { statistics: any };
      error?: string;
    }>;

    /**
     * Create a new webhook
     * @param webhookData - Webhook creation data
     * @returns Promise with created webhook
     */
    createWebhook: (webhookData: any) => Promise<{
      success: boolean;
      data?: any;
      error?: string;
    }>;

    /**
     * Update an existing webhook
     * @param webhookId - Webhook ID
     * @param updates - Update data
     * @returns Promise with updated webhook
     */
    updateWebhook: (webhookId: string, updates: any) => Promise<{
      success: boolean;
      data?: any;
      error?: string;
    }>;

    /**
     * Delete a webhook
     * @param webhookId - Webhook ID
     * @returns Promise with success status
     */
    deleteWebhook: (webhookId: string) => Promise<{
      success: boolean;
      error?: string;
    }>;

    /**
     * Test a webhook
     * @param webhookId - Webhook ID
     * @param testData - Test data
     * @returns Promise with test result
     */
    testWebhook: (webhookId: string, testData: any) => Promise<{
      success: boolean;
      data?: any;
      error?: string;
    }>;

    /**
     * Redeliver a failed webhook
     * @param deliveryId - Delivery ID
     * @returns Promise with redelivery result
     */
    redeliverWebhook: (deliveryId: string) => Promise<{
      success: boolean;
      data?: any;
      error?: string;
    }>;

    /**
     * Bulk toggle webhook status
     * @param webhookIds - Array of webhook IDs
     * @param status - New status
     * @returns Promise with success status
     */
    bulkToggleStatus: (webhookIds: string[], status: string) => Promise<{
      success: boolean;
      error?: string;
    }>;

    /**
     * Export webhooks to CSV
     * @param options - Export options
     * @returns Promise with success status
     */
    exportWebhooks: (options?: {
      search?: string;
      status?: string;
      event?: string;
    }) => Promise<{
      success: boolean;
      error?: string;
    }>;
  };

  // ========================================
  // Workflows API
  // ========================================

  /**
   * Workflows API for managing workflow automation with complete lifecycle
   */
  workflows?: {
    /**
     * Get workflows with pagination and filtering
     * @param options - Query options
     * @returns Promise with workflow list result
     */
    getWorkflows: (options?: {
      page?: number;
      pageSize?: number;
      search?: string;
      status?: string;
      trigger?: string;
    }) => Promise<{
      success: boolean;
      data?: { workflows: any[]; total: number };
      error?: string;
    }>;

    /**
     * Get workflow executions
     * @param options - Query options
     * @returns Promise with executions result
     */
    getExecutions: (options?: {
      workflowId?: string;
      limit?: number;
    }) => Promise<{
      success: boolean;
      data?: { executions: any[] };
      error?: string;
    }>;

    /**
     * Get workflow statistics
     * @returns Promise with statistics
     */
    getStatistics: () => Promise<{
      success: boolean;
      data?: { statistics: any };
      error?: string;
    }>;

    /**
     * Create a new workflow
     * @param workflowData - Workflow creation data
     * @returns Promise with created workflow
     */
    createWorkflow: (workflowData: any) => Promise<{
      success: boolean;
      data?: any;
      error?: string;
    }>;

    /**
     * Update an existing workflow
     * @param workflowId - Workflow ID
     * @param updates - Update data
     * @returns Promise with updated workflow
     */
    updateWorkflow: (workflowId: string, updates: any) => Promise<{
      success: boolean;
      data?: any;
      error?: string;
    }>;

    /**
     * Delete a workflow
     * @param workflowId - Workflow ID
     * @returns Promise with success status
     */
    deleteWorkflow: (workflowId: string) => Promise<{
      success: boolean;
      error?: string;
    }>;

    /**
     * Execute a workflow
     * @param workflowId - Workflow ID
     * @param executionData - Execution data
     * @returns Promise with execution result
     */
    executeWorkflow: (workflowId: string, executionData: any) => Promise<{
      success: boolean;
      data?: any;
      error?: string;
    }>;

    /**
     * Cancel workflow execution
     * @param executionId - Execution ID
     * @returns Promise with success status
     */
    cancelExecution: (executionId: string) => Promise<{
      success: boolean;
      error?: string;
    }>;

    /**
     * Pause workflow execution
     * @param executionId - Execution ID
     * @returns Promise with success status
     */
    pauseExecution: (executionId: string) => Promise<{
      success: boolean;
      error?: string;
    }>;

    /**
     * Resume workflow execution
     * @param executionId - Execution ID
     * @returns Promise with success status
     */
    resumeExecution: (executionId: string) => Promise<{
      success: boolean;
      error?: string;
    }>;

    /**
     * Clone a workflow
     * @param workflowId - Workflow ID to clone
     * @param options - Clone options
     * @returns Promise with cloned workflow
     */
    cloneWorkflow: (workflowId: string, options: any) => Promise<{
      success: boolean;
      data?: any;
      error?: string;
    }>;

    /**
     * Export a workflow
     * @param workflowId - Workflow ID
     * @returns Promise with success status
     */
    exportWorkflow: (workflowId: string) => Promise<{
      success: boolean;
      error?: string;
    }>;

    /**
     * Import a workflow
     * @param importData - Import data
     * @returns Promise with imported workflow
     */
    importWorkflow: (importData: any) => Promise<{
      success: boolean;
      data?: any;
      error?: string;
    }>;

    /**
     * Bulk toggle workflow status
     * @param workflowIds - Array of workflow IDs
     * @param status - New status
     * @returns Promise with success status
     */
    bulkToggleStatus: (workflowIds: string[], status: string) => Promise<{
      success: boolean;
      error?: string;
    }>;

    /**
     * Get execution logs
     * @param executionId - Execution ID
     * @returns Promise with logs
     */
    getExecutionLogs: (executionId: string) => Promise<{
      success: boolean;
      data?: { logs: any[] };
      error?: string;
    }>;

    /**
     * Export workflows to CSV
     * @param options - Export options
     * @returns Promise with success status
     */
    exportWorkflows: (options?: {
      search?: string;
      status?: string;
      trigger?: string;
    }) => Promise<{
      success: boolean;
      error?: string;
    }>;
  };
}

/**
 * Augment the global Window interface with our ElectronAPI
 */
declare global {
  interface Window {
    electronAPI: ElectronAPI;
    /** Back-compat alias: some code references window.electron */
    electron: ElectronAPI;
  }
}

// AG Grid CSS Module Declarations
declare module 'ag-grid-community/styles/ag-grid.css';
declare module 'ag-grid-community/styles/ag-theme-alpine.css';

export {};


