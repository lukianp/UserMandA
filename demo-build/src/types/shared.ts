/**
 * Shared Type Definitions
 * Types used by both main and renderer processes
 */

/**
 * Dictionary/Record type
 */
export type Dictionary<T> = Record<string, T>;

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
  /** Show PowerShell window (Windows only) - launches in separate visible console */
  showWindow?: boolean;
}

/**
 * Result from PowerShell execution
 */
export interface ExecutionResult<T = unknown> {
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
  parameters: Dictionary<unknown>;
  /** Execution options */
  options?: ExecutionOptions;
}

/**
 * PowerShell Service Configuration
 */
export interface PowerShellServiceConfig {
  /** Maximum number of PowerShell sessions in pool */
  maxPoolSize: number;
  /** Minimum number of PowerShell sessions to keep alive */
  minPoolSize: number;
  /** Idle timeout before session is closed (milliseconds) */
  sessionTimeout: number;
  /** Maximum size of request queue when pool is exhausted */
  queueSize: number;
  /** Default execution timeout (milliseconds) */
  defaultTimeout: number;
}

/**
 * Module Definition (for registry)
 */
export interface ModuleDefinition {
  /** Unique module identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description of module's purpose */
  description: string;
  /** Module category */
  category: 'discovery' | 'migration' | 'reporting' | 'security' | 'compliance' | 'management';
  /** Path to PowerShell module file */
  modulePath: string;
  /** Available functions in the module */
  functions: ModuleFunctionDefinition[];
  /** Required PowerShell version */
  requiredPSVersion?: string;
  /** Required modules/dependencies */
  dependencies?: string[];
  /** Author information */
  author?: string;
  /** Version string */
  version?: string;
}

/**
 * Module Function Definition
 */
export interface ModuleFunctionDefinition {
  /** Function name */
  name: string;
  /** Function description */
  description: string;
  /** Parameter definitions */
  parameters: ModuleParameterDefinition[];
  /** Whether function requires elevated permissions */
  requiresElevation?: boolean;
  /** Estimated execution time */
  estimatedDuration?: number;
  /** Return type description */
  returnType?: string;
}

/**
 * Module Parameter Definition
 */
export interface ModuleParameterDefinition {
  /** Parameter name */
  name: string;
  /** Parameter type */
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  /** Whether parameter is required */
  required: boolean;
  /** Default value if not provided */
  defaultValue?: unknown;
  /** Parameter description */
  description?: string;
  /** Validation pattern (for strings) */
  pattern?: string;
  /** Minimum value (for numbers) */
  min?: number;
  /** Maximum value (for numbers) */
  max?: number;
  /** Allowed values (enum) */
  allowedValues?: unknown[];
}

/**
 * Validation Result
 */
export interface ValidationResult {
  /** Whether validation passed */
  passed: boolean;
  /** Validation errors */
  errors: ValidationError[];
  /** Validation warnings */
  warnings: ValidationWarning[];
}

/**
 * Validation Error
 */
export interface ValidationError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Field that failed validation */
  field?: string;
  /** Additional context */
  context?: Dictionary<unknown>;
}

/**
 * Validation Warning
 */
export interface ValidationWarning {
  /** Warning code */
  code: string;
  /** Warning message */
  message: string;
  /** Field that triggered warning */
  field?: string;
  /** Additional context */
  context?: Dictionary<unknown>;
}


