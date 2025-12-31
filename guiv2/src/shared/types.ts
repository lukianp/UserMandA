/**
 * Shared types for IPC communication between main and renderer processes
 * These types must match the definitions in electron.d.ts
 */

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
 * Script execution task for parallel execution
 */
export interface ScriptTask {
  /** Task identifier */
  id: string;
  /** Script path */
  scriptPath: string;
  /** Script arguments */
  args?: Record<string, any>;
}

/**
 * Script execution parameters
 */
export interface ScriptExecutionParams {
  /** Path to PowerShell script file */
  scriptPath: string;
  /** Command-line arguments to pass to script */
  args?: Record<string, any>;
  /** Working directory for script execution */
  workingDirectory?: string;
  /** Maximum execution time in milliseconds */
  timeout?: number;
  /** Unique execution ID */
  executionId?: string;
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


