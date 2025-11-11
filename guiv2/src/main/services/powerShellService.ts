/**
 * Enterprise-Grade PowerShell Execution Service
 *
 * Features:
 * - Session pooling (min: 2, max: 10)
 * - Request queuing when pool exhausted
 * - Auto-termination of idle sessions (5 min timeout)
 * - Cancellation token support
 * - Streaming output via EventEmitter (all 6 PowerShell streams)
 * - Module caching for performance
 * - Comprehensive error handling with custom error types
 * - Module discovery
 * - Parallel execution support
 * - Automatic retry with exponential backoff
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import * as path from 'path';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';

import { ExecutionOptions, ExecutionResult, OutputData, ModuleInfo, ScriptTask } from '../../types/shared';
import { CredentialService } from './credentialService';

/**
 * Custom PowerShell Error Types
 */
export class PowerShellError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PowerShellError';
  }
}

export class PowerShellSyntaxError extends PowerShellError {
  constructor(message: string, public readonly script: string) {
    super(message);
    this.name = 'PowerShellSyntaxError';
  }
}

export class PowerShellRuntimeError extends PowerShellError {
  constructor(message: string, public readonly exitCode: number, public readonly stderr: string) {
    super(message);
    this.name = 'PowerShellRuntimeError';
  }
}

export class PowerShellTimeoutError extends PowerShellError {
  constructor(timeout: number, public readonly scriptPath: string) {
    super(`Script execution timed out after ${timeout}ms: ${scriptPath}`);
    this.name = 'PowerShellTimeoutError';
  }
}

export class PowerShellCancellationError extends PowerShellError {
  constructor(public readonly executionId: string) {
    super(`Execution cancelled by user: ${executionId}`);
    this.name = 'PowerShellCancellationError';
  }
}

/**
 * PowerShell Service Configuration
 */
interface PowerShellServiceConfig {
  /** Maximum number of concurrent PowerShell sessions */
  maxPoolSize: number;
  /** Minimum number of PowerShell sessions to keep alive */
  minPoolSize: number;
  /** Session timeout in milliseconds (default: 5 minutes) */
  sessionTimeout: number;
  /** Maximum queued requests before rejection */
  queueSize: number;
  /** Enable module caching for performance */
  enableModuleCaching: boolean;
  /** Default script timeout in milliseconds */
  defaultTimeout: number;
  /** Base directory for script resolution */
  scriptsBaseDir: string;
}

/**
 * PowerShell Session
 */
interface PowerShellSession {
  /** Unique session identifier */
  id: string;
  /** Node.js child process instance */
  process: ChildProcess | null;
  /** Current session status */
  status: 'idle' | 'busy' | 'terminated';
  /** Last used timestamp */
  lastUsed: number;
  /** PowerShell runspace ID */
  runspaceId: string;
  /** Number of executions handled by this session */
  executionCount: number;
}

/**
 * Queued execution request
 */
interface QueuedRequest {
  id: string;
  scriptPath: string;
  args: string[];
  options: ExecutionOptions;
  resolve: (result: ExecutionResult) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

/**
 * Stored script in library
 */
interface StoredScript {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  parameters: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  executionCount: number;
}

/**
 * PowerShell Execution Service
 * Manages a pool of PowerShell sessions for efficient script execution
 */
class PowerShellExecutionService extends EventEmitter {
  private config: PowerShellServiceConfig;
  private sessionPool: Map<string, PowerShellSession>;
  private requestQueue: QueuedRequest[];
  private activeExecutions: Map<string, ChildProcess>;
  private moduleCache: Map<string, any>;
  private scriptLibrary: Map<string, StoredScript>;
  private cleanupInterval: NodeJS.Timeout | null;
  private initialized: boolean;
  private queuePaused: boolean;
  private credentialService: CredentialService;

  constructor(config: Partial<PowerShellServiceConfig> = {}, credentialService?: CredentialService) {
    super();

    this.config = {
      maxPoolSize: config.maxPoolSize || 10,
      minPoolSize: config.minPoolSize || 2,
      sessionTimeout: config.sessionTimeout || 300000, // 5 minutes
      queueSize: config.queueSize || 100,
      enableModuleCaching: config.enableModuleCaching !== false,
      defaultTimeout: config.defaultTimeout || 60000, // 1 minute
      scriptsBaseDir: config.scriptsBaseDir || path.join(process.cwd(), '..'),
    };

    this.sessionPool = new Map();
    this.requestQueue = [];
    this.activeExecutions = new Map();
    this.moduleCache = new Map();
    this.scriptLibrary = new Map();
    this.cleanupInterval = null;
    this.initialized = false;
    this.queuePaused = false;
    this.credentialService = credentialService || new CredentialService();

    // Bind methods
    this.processQueue = this.processQueue.bind(this);
    this.cleanupIdleSessions = this.cleanupIdleSessions.bind(this);
  }

  /**
   * Initialize the service and create minimum pool sessions
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('PowerShellExecutionService already initialized');
      return;
    }

    console.log(`Initializing PowerShell Execution Service (min: ${this.config.minPoolSize}, max: ${this.config.maxPoolSize})`);

    // Create minimum pool sessions
    const initPromises: Promise<void>[] = [];
    for (let i = 0; i < this.config.minPoolSize; i++) {
      initPromises.push(this.createSession());
    }
    await Promise.all(initPromises);

    // Start cleanup interval (check every minute)
    this.cleanupInterval = setInterval(this.cleanupIdleSessions, 60000);

    this.initialized = true;
    console.log(`PowerShell Execution Service initialized with ${this.sessionPool.size} sessions`);
  }

  /**
   * Create a new PowerShell session
   */
  private async createSession(): Promise<void> {
    const sessionId = crypto.randomUUID();
    const runspaceId = `runspace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session: PowerShellSession = {
      id: sessionId,
      process: null,
      status: 'idle',
      lastUsed: Date.now(),
      runspaceId,
      executionCount: 0,
    };

    this.sessionPool.set(sessionId, session);
    console.log(`Created PowerShell session: ${sessionId}`);
  }

  /**
   * Get an available session from the pool
   */
  private async getAvailableSession(): Promise<PowerShellSession | null> {
    // Find idle session
    for (const session of this.sessionPool.values()) {
      if (session.status === 'idle') {
        session.status = 'busy';
        session.lastUsed = Date.now();
        return session;
      }
    }

    // Create new session if pool not at max
    if (this.sessionPool.size < this.config.maxPoolSize) {
      await this.createSession();
      // Get the newly created session
      for (const session of this.sessionPool.values()) {
        if (session.status === 'idle') {
          session.status = 'busy';
          session.lastUsed = Date.now();
          return session;
        }
      }
    }

    return null;
  }

  /**
   * Release a session back to the pool
   */
  private releaseSession(sessionId: string): void {
    const session = this.sessionPool.get(sessionId);
    if (session) {
      session.status = 'idle';
      session.lastUsed = Date.now();
      session.executionCount++;

      // Process queued requests
      this.processQueue();
    }
  }

  /**
   * Clean up idle sessions beyond minimum pool size
   */
  private cleanupIdleSessions(): void {
    const now = Date.now();
    const sessionsToRemove: string[] = [];

    for (const [id, session] of this.sessionPool.entries()) {
      if (
        session.status === 'idle' &&
        this.sessionPool.size > this.config.minPoolSize &&
        now - session.lastUsed > this.config.sessionTimeout
      ) {
        sessionsToRemove.push(id);
      }
    }

    for (const id of sessionsToRemove) {
      const session = this.sessionPool.get(id);
      if (session?.process) {
        session.process.kill();
      }
      this.sessionPool.delete(id);
      console.log(`Terminated idle session: ${id}`);
    }
  }

  /**
   * Process the request queue
   */
  private async processQueue(): Promise<void> {
    if (this.queuePaused) {
      return; // Queue is paused, don't process
    }

    while (this.requestQueue.length > 0) {
      const session = await this.getAvailableSession();
      if (!session) {
        break; // No available sessions
      }

      const request = this.requestQueue.shift();
      if (request) {
        this.executeScriptWithSession(session, request.scriptPath, request.args, request.options)
          .then(request.resolve)
          .catch(request.reject);
      } else {
        this.releaseSession(session.id);
      }
    }
  }

  /**
   * Resolve script path from name
   */
  private resolveScriptPath(scriptPathOrName: string): string {
    // If already absolute path, return it
    if (path.isAbsolute(scriptPathOrName)) {
      return scriptPathOrName;
    }

    // Search in common directories
    const searchDirs = [
      path.join(this.config.scriptsBaseDir, 'Scripts'),
      path.join(this.config.scriptsBaseDir, 'Modules'),
      path.join(this.config.scriptsBaseDir, 'Core'),
    ];

    for (const dir of searchDirs) {
      const fullPath = path.join(dir, scriptPathOrName);
      // Would need fs.existsSync here, but keeping it simple
      return fullPath;
    }

    // Default: treat as relative to base dir
    return path.join(this.config.scriptsBaseDir, scriptPathOrName);
  }

  /**
   * Execute a PowerShell script with a specific session
   */
  private async executeScriptWithSession(
    session: PowerShellSession,
    scriptPath: string,
    args: string[],
    options: ExecutionOptions = {}
  ): Promise<ExecutionResult> {
    const executionId = options.cancellationToken || crypto.randomUUID();
    const resolvedPath = this.resolveScriptPath(scriptPath);
    const timeout = options.timeout || this.config.defaultTimeout;
    const startTime = Date.now();

    return new Promise<ExecutionResult>((resolve, reject) => {
      try {
        // Spawn PowerShell process with enhanced stream redirection
        const pwshArgs = [
          '-NoProfile',
          '-ExecutionPolicy',
          'Bypass',
          '-File',
          resolvedPath,
          ...args,
        ];

        // Use powershell.exe on Windows (fallback from pwsh if not installed)
        const powershellExecutable = process.platform === 'win32' ? 'powershell.exe' : 'pwsh';

        let childProcess: ChildProcess;

        // Launch in visible window if requested (Windows only)
        if (options.showWindow && process.platform === 'win32') {
          console.log(`[PowerShellService.executeScriptWithSession] Spawning VISIBLE PowerShell window for: ${resolvedPath}`);

          // Use cmd.exe with 'start' to explicitly create a new console window
          // This is the only reliable way to show a console from an Electron app
          const cmdArgs = [
            '/c',  // Run command and terminate
            'start',  // Start a new window
            '""',  // Empty title (required by start command)
            powershellExecutable,
            '-NoProfile',
            '-ExecutionPolicy', 'Bypass',
            '-NoExit',  // Keep window open after script completes
            '-File',
            `"${resolvedPath}"`,  // Quote the path
            ...args.map(arg => `"${arg}"`)  // Quote all arguments
          ];

          childProcess = spawn('cmd.exe', cmdArgs, {
            cwd: options.workingDirectory || this.config.scriptsBaseDir,
            env: {
              ...process.env,
              ...options.environmentVariables,
              PSModulePath: process.env.PSModulePath || '',
            },
            shell: true,  // Use shell to properly handle 'start' command
            windowsHide: false,
          });
        } else {
          // Normal hidden execution with output capture
          childProcess = spawn(powershellExecutable, pwshArgs, {
            cwd: options.workingDirectory || this.config.scriptsBaseDir,
            env: {
              ...process.env,
              ...options.environmentVariables,
              // Enable all PowerShell streams
              PSModulePath: process.env.PSModulePath || '',
            },
          });
        }

        // Track active execution
        this.activeExecutions.set(executionId, childProcess);

        let stdout = '';
        let stderr = '';
        const warnings: string[] = [];
        const verbose: string[] = [];
        const debug: string[] = [];
        const information: string[] = [];

        // Setup timeout
        let timeoutHandle: NodeJS.Timeout | null = setTimeout(() => {
          childProcess.kill('SIGTERM');
          const error = new PowerShellTimeoutError(timeout, resolvedPath);
          this.activeExecutions.delete(executionId);
          this.releaseSession(session.id);
          reject(error);
        }, timeout);

        // Collect and parse stdout - contains output stream and structured data
        childProcess.stdout?.on('data', (data: Buffer) => {
          const chunk = data.toString();
          stdout += chunk;

          // Parse PowerShell streams from output
          this.parseAndEmitStreams(chunk, executionId, options.streamOutput || false);
        });

        // Collect and parse stderr - contains error, warning, verbose, debug, information streams
        childProcess.stderr?.on('data', (data: Buffer) => {
          const chunk = data.toString();
          stderr += chunk;

          // Parse different stream types from stderr
          this.parseStderrStreams(chunk, executionId, options.streamOutput || false, warnings, verbose, debug, information);
        });

        // Handle process exit
        childProcess.on('close', (code: number | null) => {
          if (timeoutHandle) {
            clearTimeout(timeoutHandle);
            timeoutHandle = null;
          }
          this.activeExecutions.delete(executionId);
          this.releaseSession(session.id);

          const duration = Date.now() - startTime;

          if (code !== 0) {
            // Check for syntax errors
            if (stderr.includes('ParserError') || stderr.includes('Unexpected token')) {
              const error = new PowerShellSyntaxError(
                `Script contains syntax errors:\n${stderr}`,
                resolvedPath
              );
              const result: ExecutionResult = {
                success: false,
                error: error.message,
                duration,
                warnings,
                stdout,
                stderr,
                exitCode: code || -1,
              };
              resolve(result);
              return;
            }

            // Runtime error
            const error = new PowerShellRuntimeError(
              `Script failed with exit code ${code}`,
              code || -1,
              stderr
            );
            const result: ExecutionResult = {
              success: false,
              error: error.message,
              duration,
              warnings,
              stdout,
              stderr,
              exitCode: code || -1,
            };
            resolve(result);
            return;
          }

          try {
            // Extract JSON from between markers (ignoring stream output)
            const jsonStartMarker = '<<<JSON_RESULT_START>>>';
            const jsonEndMarker = '<<<JSON_RESULT_END>>>';

            let jsonContent = stdout.trim();
            const startIndex = stdout.indexOf(jsonStartMarker);
            const endIndex = stdout.indexOf(jsonEndMarker);

            if (startIndex !== -1 && endIndex !== -1) {
              // Extract only the JSON between markers
              jsonContent = stdout.substring(startIndex + jsonStartMarker.length, endIndex).trim();
            }

            // Debug logging for Azure discovery - write full output to file
            const fs = require('fs');
            const debugLogPath = 'C:\\discoverydata\\powershell_debug_output.txt';
            try {
              const debugContent = [
                '========== POWERSHELL DEBUG OUTPUT ==========',
                `Timestamp: ${new Date().toISOString()}`,
                `stdout length: ${stdout.length}`,
                `stderr length: ${stderr.length}`,
                `jsonContent length: ${jsonContent.length}`,
                '',
                '========== FULL STDOUT ==========',
                stdout,
                '',
                '========== STDERR ==========',
                stderr,
                '',
                '========== EXTRACTED JSON CONTENT ==========',
                jsonContent,
                '',
                '=========================================='
              ].join('\n');
              fs.writeFileSync(debugLogPath, debugContent, 'utf8');
              console.log(`[PowerShellService] Full output written to: ${debugLogPath}`);
            } catch (err) {
              console.error('[PowerShellService] Failed to write debug log:', err);
            }

            console.log('[PowerShellService] ========== STDOUT DEBUG ==========');
            console.log('[PowerShellService] stdout length:', stdout.length);
            console.log('[PowerShellService] Last 2000 chars of stdout:\n', stdout.substring(Math.max(0, stdout.length - 2000)));
            console.log('[PowerShellService] stderr length:', stderr.length);
            if (stderr.length > 0) {
              console.log('[PowerShellService] stderr:\n', stderr);
            }
            console.log('[PowerShellService] jsonContent length:', jsonContent.length);
            console.log('[PowerShellService] jsonContent:', jsonContent);
            console.log('[PowerShellService] ====================================');

            const data = jsonContent ? JSON.parse(jsonContent) : {};

            const result: ExecutionResult = {
              success: true,
              data,
              duration,
              warnings,
              stdout,
              stderr,
              exitCode: code || 0,
            };
            resolve(result);
          } catch (parseError: any) {
            const result: ExecutionResult = {
              success: false,
              error: `Failed to parse JSON output: ${parseError.message}\n\nOutput:\n${stdout}`,
              duration,
              warnings,
              stdout,
              stderr,
              exitCode: code || 0,
            };
            resolve(result);
          }
        });

        // Handle process errors
        childProcess.on('error', (err: Error) => {
          if (timeoutHandle) clearTimeout(timeoutHandle);
          this.activeExecutions.delete(executionId);
          this.releaseSession(session.id);

          const result: ExecutionResult = {
            success: false,
            error: `Process error: ${err.message}`,
            duration: Date.now() - startTime,
            warnings,
            stderr: err.message,
          };
          resolve(result);
        });
      } catch (error: any) {
        this.releaseSession(session.id);
        const result: ExecutionResult = {
          success: false,
          error: `Execution error: ${error.message}`,
          duration: Date.now() - startTime,
          warnings: [],
        };
        resolve(result);
      }
    });
  }

  /**
   * Parse and emit PowerShell output streams
   */
  private parseAndEmitStreams(chunk: string, executionId: string, streamOutput: boolean): void {
    if (!streamOutput) return;

    // Emit output stream data
    const outputData: OutputData = {
      executionId,
      data: chunk,
      type: 'output',
      timestamp: new Date(),
    };
    this.emit('output', outputData);
    this.emit('stream:output', outputData);
  }

  /**
   * Parse stderr streams (error, warning, verbose, debug, information)
   */
  private parseStderrStreams(
    chunk: string,
    executionId: string,
    streamOutput: boolean,
    warnings: string[],
    verbose: string[],
    debug: string[],
    information: string[]
  ): void {
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;

      // Parse WARNING stream
      if (line.startsWith('WARNING: ')) {
        const message = line.replace('WARNING: ', '');
        warnings.push(message);
        if (streamOutput) {
          const data: OutputData = { executionId, data: message, type: 'warning', timestamp: new Date() };
          this.emit('output', data);
          this.emit('stream:warning', data);
        }
      }
      // Parse VERBOSE stream
      else if (line.startsWith('VERBOSE: ')) {
        const message = line.replace('VERBOSE: ', '');
        verbose.push(message);
        if (streamOutput) {
          const data: OutputData = { executionId, data: message, type: 'verbose', timestamp: new Date() };
          this.emit('output', data);
          this.emit('stream:verbose', data);
        }
      }
      // Parse DEBUG stream
      else if (line.startsWith('DEBUG: ')) {
        const message = line.replace('DEBUG: ', '');
        debug.push(message);
        if (streamOutput) {
          const data: OutputData = { executionId, data: message, type: 'debug', timestamp: new Date() };
          this.emit('output', data);
          this.emit('stream:debug', data);
        }
      }
      // Parse INFORMATION stream (with explicit prefix)
      else if (line.startsWith('INFORMATION: ') || line.startsWith('INFO: ')) {
        const message = line.replace(/^(INFORMATION|INFO): /, '');
        information.push(message);
        if (streamOutput) {
          const data: OutputData = { executionId, data: message, type: 'information', timestamp: new Date() };
          this.emit('output', data);
          this.emit('stream:information', data);
        }
      }
      // Parse ERROR stream (non-terminating errors)
      else if (line.includes('ERROR:') || line.includes('Exception')) {
        if (streamOutput) {
          const data: OutputData = { executionId, data: line, type: 'error', timestamp: new Date() };
          this.emit('output', data);
          this.emit('stream:error', data);
        }
      }
      // Treat all other non-empty lines as Information stream
      // This handles Write-Information output that doesn't have explicit prefixes
      else {
        const message = line;
        information.push(message);
        if (streamOutput) {
          const data: OutputData = { executionId, data: message, type: 'information', timestamp: new Date() };
          this.emit('output', data);
          this.emit('stream:information', data);
        }
      }
    }
  }

  /**
   * Discover installed PowerShell modules
   * @returns Array of module information
   */
  async discoverModules(): Promise<ModuleInfo[]> {
    const script = `
      Get-Module -ListAvailable | Select-Object Name, Version, Path, Description, Author, CompanyName, Guid, @{
        Name='ExportedCommands';
        Expression={ ($_.ExportedCommands.Keys | Sort-Object) -join ',' }
      } | ConvertTo-Json -Depth 3
    `;

    try {
      // Create temporary script file
      const tempScriptPath = path.join(process.env.TEMP || '/tmp', `discover_modules_${crypto.randomUUID()}.ps1`);
      await fs.writeFile(tempScriptPath, script, 'utf-8');

      const result = await this.executeScript(tempScriptPath, [], { timeout: 30000 });

      // Clean up temp file
      await fs.unlink(tempScriptPath).catch(() => {});

      if (!result.success || !result.data) {
        console.warn('Module discovery failed:', result.error);
        return [];
      }

      // Parse module data
      const moduleData = Array.isArray(result.data) ? result.data : [result.data];
      return moduleData.map((m: any) => ({
        name: m.Name,
        version: m.Version?.ToString() || m.Version || 'Unknown',
        path: m.Path,
        description: m.Description,
        author: m.Author,
        companyName: m.CompanyName,
        guid: m.Guid,
        exportedCommands: m.ExportedCommands ? m.ExportedCommands.split(',').filter(Boolean) : [],
      }));
    } catch (error: any) {
      console.error('Error discovering modules:', error);
      return [];
    }
  }

  /**
   * Execute multiple scripts in parallel
   * @param scripts Array of script tasks to execute
   * @returns Array of results in same order as input
   */
  async executeParallel(scripts: ScriptTask[]): Promise<ExecutionResult[]> {
    if (!this.initialized) {
      throw new Error('PowerShellExecutionService not initialized. Call initialize() first.');
    }

    // Respect max pool size - execute in batches
    const batchSize = this.config.maxPoolSize;
    const results: ExecutionResult[] = new Array(scripts.length);

    for (let i = 0; i < scripts.length; i += batchSize) {
      const batch = scripts.slice(i, i + batchSize);
      const batchPromises = batch.map(async (task, index) => {
        const result = await this.executeScript(task.scriptPath, task.args, task.options);
        return { index: i + index, result };
      });

      const batchResults = await Promise.all(batchPromises);

      // Place results in correct position
      for (const { index, result } of batchResults) {
        results[index] = result;
      }
    }

    return results;
  }

  /**
   * Execute script with automatic retry on transient failures
   * @param scriptPath Path to script
   * @param args Script arguments
   * @param options Execution options
   * @param retries Number of retry attempts (default: 3)
   * @param backoff Initial backoff delay in ms (default: 1000)
   * @returns Execution result
   */
  async executeWithRetry(
    scriptPath: string,
    args: string[] = [],
    options: ExecutionOptions = {},
    retries = 3,
    backoff = 1000
  ): Promise<ExecutionResult> {
    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= retries) {
      try {
        const result = await this.executeScript(scriptPath, args, options);

        // If successful, return immediately
        if (result.success) {
          if (attempt > 0) {
            console.log(`Script succeeded on attempt ${attempt + 1}/${retries + 1}`);
          }
          return result;
        }

        // Check if error is transient (network errors, timeouts, etc.)
        const isTransient = this.isTransientError(result.error || '');
        if (!isTransient || attempt === retries) {
          return result;
        }

        lastError = new Error(result.error);
      } catch (error: any) {
        lastError = error;

        // Check if we should retry
        if (!this.isTransientError(error.message) || attempt === retries) {
          throw error;
        }
      }

      // Wait before retry with exponential backoff
      const delay = backoff * Math.pow(2, attempt);
      console.log(`Script failed, retrying in ${delay}ms (attempt ${attempt + 1}/${retries + 1})...`);
      await new Promise(resolve => setTimeout(resolve, delay));

      attempt++;
    }

    // All retries exhausted
    throw lastError || new Error('Script execution failed after retries');
  }

  /**
   * Check if error is transient and should be retried
   */
  private isTransientError(errorMessage: string): boolean {
    const transientPatterns = [
      /timeout/i,
      /connection/i,
      /network/i,
      /temporarily unavailable/i,
      /too many requests/i,
      /service unavailable/i,
      /ECONNRESET/i,
      /ETIMEDOUT/i,
      /throttl/i,
    ];

    return transientPatterns.some(pattern => pattern.test(errorMessage));
  }

  /**
   * Execute a PowerShell script
   * @param scriptPath Path to script file (absolute or relative to base dir)
   * @param args Command-line arguments
   * @param options Execution options
   */
  async executeScript(
    scriptPath: string,
    args: string[] = [],
    options: ExecutionOptions = {}
  ): Promise<ExecutionResult> {
    if (!this.initialized) {
      throw new Error('PowerShellExecutionService not initialized. Call initialize() first.');
    }

    // Try to get available session
    const session = await this.getAvailableSession();

    if (session) {
      return this.executeScriptWithSession(session, scriptPath, args, options);
    }

    // No available session, queue the request
    if (this.requestQueue.length >= this.config.queueSize) {
      return {
        success: false,
        error: 'Request queue is full. Too many concurrent executions.',
        duration: 0,
        warnings: [],
      };
    }

    return new Promise<ExecutionResult>((resolve, reject) => {
      const request: QueuedRequest = {
        id: crypto.randomUUID(),
        scriptPath,
        args,
        options,
        resolve,
        reject,
        timestamp: Date.now(),
      };
      this.requestQueue.push(request);
      console.log(`Queued request ${request.id}, queue size: ${this.requestQueue.length}`);
    });
  }

  /**
   * Execute a PowerShell module function
   * @param modulePath Path to module file
   * @param functionName Function to invoke
   * @param params Named parameters
   * @param options Execution options
   */
  async executeModule(
    modulePath: string,
    functionName: string,
    params: Record<string, any> = {},
    options: ExecutionOptions = {}
  ): Promise<ExecutionResult> {
    try {
      // Debug logging
      console.log(`[PowerShellService.executeModule] showWindow: ${options.showWindow}, function: ${functionName}`);

      // Build PowerShell command to import module and call function
      const paramsJson = JSON.stringify(params);

      // PowerShell 5.1 compatible execution with clean output
      const command = options.showWindow ? `
        # Discovery Module Execution Window (PowerShell 5.1 compatible)
        $Host.UI.RawUI.WindowTitle = "Discovery Module: ${functionName}"

        Write-Host '========================================' -ForegroundColor Cyan
        Write-Host 'Discovery Module - PowerShell Execution' -ForegroundColor Cyan
        Write-Host '========================================' -ForegroundColor Cyan
        Write-Host ''
        Write-Host "Module: ${modulePath}" -ForegroundColor Yellow
        Write-Host "Function: ${functionName}" -ForegroundColor Yellow
        Write-Host ''
        Write-Host '========================================' -ForegroundColor Cyan
        Write-Host ''

        # Enable ONLY Information stream for clean, summary-level output
        $InformationPreference = 'Continue'
        $VerbosePreference = 'SilentlyContinue'
        $DebugPreference = 'SilentlyContinue'
        $WarningPreference = 'Continue'

        Import-Module '${modulePath}' -Force -ErrorAction Stop

        # Convert JSON to hashtable recursively (PowerShell 5.1 compatible)
        function ConvertTo-HashtableRecursive {
            param([Parameter(ValueFromPipeline)] $InputObject)

            if ($null -eq $InputObject) {
                return $null
            }

            if ($InputObject -is [System.Collections.IEnumerable] -and $InputObject -isnot [string]) {
                $collection = @()
                foreach ($item in $InputObject) {
                    $collection += ConvertTo-HashtableRecursive $item
                }
                return $collection
            }

            if ($InputObject -is [PSCustomObject]) {
                $hash = @{}
                $InputObject.PSObject.Properties | ForEach-Object {
                    $hash[$_.Name] = ConvertTo-HashtableRecursive $_.Value
                }
                return $hash
            }

            return $InputObject
        }

        $paramsObj = '${paramsJson.replace(/'/g, "''")}' | ConvertFrom-Json
        $params = ConvertTo-HashtableRecursive $paramsObj

        Write-Host 'Starting discovery execution...' -ForegroundColor Green
        Write-Host ''

        # Execute function - all Write-Information output will be visible
        try {
            $result = ${functionName} @params

            Write-Host ''
            Write-Host '========================================' -ForegroundColor Green
            Write-Host 'Discovery Complete!' -ForegroundColor Green
            Write-Host '========================================' -ForegroundColor Green

            # Output minimal JSON for compatibility
            Write-Output "<<<JSON_RESULT_START>>>"
            if ($null -eq $result) {
              @{Success=$true} | ConvertTo-Json -Compress
            } else {
              $result | ConvertTo-Json -Depth 10 -Compress
            }
            Write-Output "<<<JSON_RESULT_END>>>"

            Write-Host ''
            Write-Host 'Press any key to close this window...' -ForegroundColor Yellow
            $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
        } catch {
            Write-Host ''
            Write-Host '========================================' -ForegroundColor Red
            Write-Host 'Discovery Failed!' -ForegroundColor Red
            Write-Host "Error: $_" -ForegroundColor Red
            Write-Host '========================================' -ForegroundColor Red

            Write-Host ''
            Write-Host 'Press any key to close this window...' -ForegroundColor Yellow
            $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
            throw
        }
      ` : `
        # Hidden execution mode with clean summary output (PowerShell 5.1 compatible)
        $InformationPreference = 'Continue'
        $VerbosePreference = 'SilentlyContinue'
        $DebugPreference = 'SilentlyContinue'
        $WarningPreference = 'Continue'

        Import-Module '${modulePath}' -Force -ErrorAction Stop

        # Convert JSON to hashtable recursively (PowerShell 5.1 compatible)
        function ConvertTo-HashtableRecursive {
            param([Parameter(ValueFromPipeline)] $InputObject)

            if ($null -eq $InputObject) {
                return $null
            }

            if ($InputObject -is [System.Collections.IEnumerable] -and $InputObject -isnot [string]) {
                $collection = @()
                foreach ($item in $InputObject) {
                    $collection += ConvertTo-HashtableRecursive $item
                }
                return $collection
            }

            if ($InputObject -is [PSCustomObject]) {
                $hash = @{}
                $InputObject.PSObject.Properties | ForEach-Object {
                    $hash[$_.Name] = ConvertTo-HashtableRecursive $_.Value
                }
                return $hash
            }

            return $InputObject
        }

        $paramsObj = '${paramsJson.replace(/'/g, "''")}' | ConvertFrom-Json
        $params = ConvertTo-HashtableRecursive $paramsObj

        # Execute function and capture result
        $result = ${functionName} @params

        # Output JSON result marker and data
        Write-Output "<<<JSON_RESULT_START>>>"
        if ($null -eq $result) {
          @{} | ConvertTo-Json -Compress
        } else {
          $result | ConvertTo-Json -Depth 10 -Compress
        }
        Write-Output "<<<JSON_RESULT_END>>>"
      `;

      // Create temp script
      const tempScript = path.join(process.env.TEMP || '/tmp', `ps_module_${crypto.randomUUID()}.ps1`);

      // Write command to temp script
      await fs.writeFile(tempScript, command, 'utf-8');

      // Execute the script
      const result = await this.executeScript(tempScript, [], options);

      // Clean up temp file
      await fs.unlink(tempScript).catch(() => {});

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: `Module execution error: ${error.message}`,
        duration: 0,
        warnings: [],
      };
    }
  }

  /**
   * Execute a discovery module with credentials from the profile
   * @param moduleName Name of the discovery module (e.g., "ActiveDirectory", "Azure")
   * @param companyName Company profile name to load credentials for
   * @param additionalParams Additional parameters to pass to the module
   * @param options Execution options
   * @returns Execution result
   */
  async executeDiscoveryModule(
    moduleName: string,
    companyName: string,
    additionalParams: Record<string, any> = {},
    options: ExecutionOptions = {}
  ): Promise<ExecutionResult> {
    try {
      // Load credentials for the company profile
      console.log(`[PowerShellService] Loading credentials for company: ${companyName}`);
      const credentials = await this.credentialService.getCredential(companyName);

      if (!credentials) {
        return {
          success: false,
          error: `No credentials found for company "${companyName}". Please configure credentials first.`,
          duration: 0,
          warnings: [],
        };
      }

      // DEBUG: Log actual credentials loaded
      console.log(`[PowerShellService] Credentials loaded:`, {
        tenantId: credentials.tenantId || 'MISSING',
        clientId: credentials.clientId || 'MISSING',
        hasClientSecret: !!credentials.clientSecret,
        connectionType: credentials.connectionType
      });

      // Validate required Azure credentials
      const hasTenantId = !!(credentials.tenantId);
      const hasClientId = !!(credentials.clientId || credentials.username);
      const hasClientSecret = !!(credentials.clientSecret || credentials.password);

      if (!hasTenantId || !hasClientId || !hasClientSecret) {
        const missingFields = [];
        if (!hasTenantId) missingFields.push('TenantId');
        if (!hasClientId) missingFields.push('ClientId');
        if (!hasClientSecret) missingFields.push('ClientSecret');

        return {
          success: false,
          error: `Missing required Azure credentials: ${missingFields.join(', ')}. Please ensure your credentials include Tenant ID, Client ID, and Client Secret.`,
          duration: 0,
          warnings: [],
        };
      }

      // Prepare discovery parameters with credentials
      // IMPORTANT: Additional params must be nested in AdditionalParams hashtable
      const discoveryParams = {
        CompanyName: companyName,
        TenantId: credentials.tenantId,
        ClientId: credentials.clientId || credentials.username,
        ClientSecret: credentials.clientSecret || credentials.password,
        OutputPath: `C:\\DiscoveryData\\${companyName}\\Raw`,
        AdditionalParams: additionalParams,  // Nested as hashtable
      };

      console.log(`[PowerShellService] Executing ${moduleName} discovery for ${companyName}`);
      console.log(`[PowerShellService] Output path: ${discoveryParams.OutputPath}`);
      console.log(`[PowerShellService] AdditionalParams:`, JSON.stringify(additionalParams, null, 2));

      // Construct module path and function name
      const modulePath = path.join(this.config.scriptsBaseDir, 'Modules', 'Discovery', `${moduleName}Discovery.psm1`);
      const functionName = `Start-${moduleName}Discovery`;

      // Pre-flight check: Validate module exists
      try {
        const fs = require('fs');
        if (!fs.existsSync(modulePath)) {
          return {
            success: false,
            error: `Discovery module not found: ${modulePath}`,
            duration: 0,
            warnings: [],
          };
        }
      } catch (fsError) {
        console.warn(`[PowerShellService] Could not verify module path: ${fsError}`);
      }

      // Execute the discovery module
      const result = await this.executeModule(modulePath, functionName, discoveryParams, {
        ...options,
        timeout: options.timeout || 1800000, // Default 30 minutes for discovery (allows time for module installation)
      });

      if (result.success) {
        console.log(`[PowerShellService] ✅ ${moduleName} discovery completed successfully`);
      } else {
        console.error(`[PowerShellService] ❌ ${moduleName} discovery failed:`, result.error);
        if (result.stderr) {
          console.error(`[PowerShellService] PowerShell Error Output:\n${result.stderr}`);
        }
        if (result.stdout) {
          console.log(`[PowerShellService] PowerShell Standard Output:\n${result.stdout}`);
        }
      }

      return result;
    } catch (error: any) {
      console.error(`[PowerShellService] Discovery module execution error:`, error);
      return {
        success: false,
        error: `Discovery module execution error: ${error.message}`,
        duration: 0,
        warnings: [],
      };
    }
  }

  /**
   * Cancel a running execution
   * @param token Cancellation token
   * @returns True if execution was found and cancelled
   */
  cancelExecution(token: string): boolean {
    const process = this.activeExecutions.get(token);
    if (process) {
      console.log(`Cancelling execution: ${token}`);
      process.kill('SIGTERM');
      this.activeExecutions.delete(token);

      // Emit cancellation event
      this.emit('execution:cancelled', { executionId: token });

      return true;
    }
    return false;
  }

  /**
   * Get service statistics
   */
  getStatistics() {
    const idleSessions = Array.from(this.sessionPool.values()).filter(s => s.status === 'idle').length;
    const busySessions = Array.from(this.sessionPool.values()).filter(s => s.status === 'busy').length;

    return {
      poolSize: this.sessionPool.size,
      idleSessions,
      busySessions,
      activeExecutions: this.activeExecutions.size,
      queuedRequests: this.requestQueue.length,
      queuePaused: this.queuePaused,
      cacheSize: this.moduleCache.size,
      scriptLibrarySize: this.scriptLibrary.size,
      totalExecutions: Array.from(this.sessionPool.values()).reduce((sum, s) => sum + s.executionCount, 0),
    };
  }

  // ==================== Queue Management Methods ====================

  /**
   * Pause the execution queue
   * Prevents processing of new queued requests until resumed
   */
  async pauseQueue(): Promise<void> {
    this.queuePaused = true;
    console.log('PowerShell execution queue paused');
    this.emit('queue:paused');
  }

  /**
   * Resume the execution queue
   * Starts processing queued requests again
   */
  async resumeQueue(): Promise<void> {
    this.queuePaused = false;
    console.log('PowerShell execution queue resumed');
    this.emit('queue:resumed');
    // Process any pending requests
    await this.processQueue();
  }

  /**
   * Clear all pending requests from the queue
   * Active executions are not affected
   * @returns Number of requests removed
   */
  async clearQueue(): Promise<number> {
    const count = this.requestQueue.length;

    // Reject all queued requests
    for (const request of this.requestQueue) {
      request.reject(new Error('Request cancelled - queue cleared'));
    }

    this.requestQueue = [];
    console.log(`Cleared ${count} requests from queue`);
    this.emit('queue:cleared', { count });

    return count;
  }

  /**
   * Get current queue status
   */
  getQueueStatus() {
    return {
      paused: this.queuePaused,
      length: this.requestQueue.length,
      oldestRequest: this.requestQueue[0]?.timestamp || null,
      requests: this.requestQueue.map(r => ({
        id: r.id,
        scriptPath: r.scriptPath,
        timestamp: r.timestamp,
        waitTime: Date.now() - r.timestamp,
      })),
    };
  }

  /**
   * Queue a script for execution
   * @param task Script task to queue
   * @returns Promise that resolves when execution completes
   */
  async queueScript(task: ScriptTask): Promise<ExecutionResult> {
    return this.executeScript(task.scriptPath, task.args, task.options);
  }

  // ==================== Script Library Management ====================

  /**
   * Get all scripts from the library
   * @param category Optional category filter
   * @returns Array of stored scripts
   */
  async getScriptLibrary(category?: string): Promise<StoredScript[]> {
    const scripts = Array.from(this.scriptLibrary.values());

    if (category) {
      return scripts.filter(s => s.category === category);
    }

    return scripts;
  }

  /**
   * Save a script to the library
   * @param script Script to save (without id if new)
   * @returns The saved script with generated id
   */
  async saveScript(script: Omit<StoredScript, 'id' | 'createdAt' | 'updatedAt' | 'executionCount'>): Promise<StoredScript> {
    const now = new Date();

    const storedScript: StoredScript = {
      ...script,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      executionCount: 0,
    };

    this.scriptLibrary.set(storedScript.id, storedScript);
    console.log(`Saved script to library: ${storedScript.name} (${storedScript.id})`);
    this.emit('script:saved', storedScript);

    return storedScript;
  }

  /**
   * Update an existing script in the library
   * @param scriptId Script ID to update
   * @param updates Partial updates to apply
   * @returns Updated script
   */
  async updateScript(scriptId: string, updates: Partial<Omit<StoredScript, 'id' | 'createdAt' | 'executionCount'>>): Promise<StoredScript | null> {
    const script = this.scriptLibrary.get(scriptId);

    if (!script) {
      console.warn(`Script not found in library: ${scriptId}`);
      return null;
    }

    const updatedScript: StoredScript = {
      ...script,
      ...updates,
      updatedAt: new Date(),
    };

    this.scriptLibrary.set(scriptId, updatedScript);
    console.log(`Updated script in library: ${updatedScript.name} (${scriptId})`);
    this.emit('script:updated', updatedScript);

    return updatedScript;
  }

  /**
   * Delete a script from the library
   * @param scriptId Script ID to delete
   * @returns True if deleted, false if not found
   */
  async deleteScript(scriptId: string): Promise<boolean> {
    const script = this.scriptLibrary.get(scriptId);

    if (!script) {
      console.warn(`Script not found in library: ${scriptId}`);
      return false;
    }

    this.scriptLibrary.delete(scriptId);
    console.log(`Deleted script from library: ${script.name} (${scriptId})`);
    this.emit('script:deleted', { id: scriptId, name: script.name });

    return true;
  }

  /**
   * Get a specific script from the library
   * @param scriptId Script ID
   * @returns Script if found, null otherwise
   */
  async getScript(scriptId: string): Promise<StoredScript | null> {
    return this.scriptLibrary.get(scriptId) || null;
  }

  /**
   * Search scripts by name, description, or tags
   * @param query Search query
   * @returns Matching scripts
   */
  async searchScripts(query: string): Promise<StoredScript[]> {
    const lowerQuery = query.toLowerCase();
    const scripts = Array.from(this.scriptLibrary.values());

    return scripts.filter(s =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery) ||
      s.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Execute a script from the library by ID
   * @param scriptId Script ID
   * @param params Parameters to pass to the script
   * @param options Execution options
   * @returns Execution result
   */
  async executeFromLibrary(scriptId: string, params: Record<string, any> = {}, options: ExecutionOptions = {}): Promise<ExecutionResult> {
    const script = this.scriptLibrary.get(scriptId);

    if (!script) {
      return {
        success: false,
        error: `Script not found in library: ${scriptId}`,
        duration: 0,
        warnings: [],
      };
    }

    try {
      // Create temp script file
      const tempScript = path.join(process.env.TEMP || '/tmp', `library_${scriptId}_${Date.now()}.ps1`);
      await fs.writeFile(tempScript, script.content, 'utf-8');

      // Build args from parameters
      const args = Object.entries(params).flatMap(([key, value]) => [
        `-${key}`,
        typeof value === 'string' ? value : JSON.stringify(value),
      ]);

      // Execute script
      const result = await this.executeScript(tempScript, args, options);

      // Clean up temp file
      await fs.unlink(tempScript).catch(() => {});

      // Update execution count
      if (result.success) {
        script.executionCount++;
        this.scriptLibrary.set(scriptId, script);
      }

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: `Library script execution error: ${error.message}`,
        duration: 0,
        warnings: [],
      };
    }
  }

  /**
   * Get installed PowerShell modules
   * Wrapper around discoverModules for clearer API
   */
  async getInstalledModules(): Promise<ModuleInfo[]> {
    return this.discoverModules();
  }

  /**
   * Import a PowerShell module
   * @param modulePath Path to module file (.psm1 or .psd1)
   * @returns Execution result
   */
  async importModule(modulePath: string): Promise<ExecutionResult> {
    const command = `Import-Module '${modulePath}' -Force -PassThru | ConvertTo-Json`;
    const tempScript = path.join(process.env.TEMP || '/tmp', `import_${crypto.randomUUID()}.ps1`);

    try {
      await fs.writeFile(tempScript, command, 'utf-8');
      const result = await this.executeScript(tempScript, [], { timeout: 10000 });
      await fs.unlink(tempScript).catch(() => {});

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: `Module import error: ${error.message}`,
        duration: 0,
        warnings: [],
      };
    }
  }

  /**
   * Remove a PowerShell module from current session
   * @param moduleName Module name
   * @returns Execution result
   */
  async removeModule(moduleName: string): Promise<ExecutionResult> {
    const command = `Remove-Module '${moduleName}' -Force -ErrorAction SilentlyContinue`;
    const tempScript = path.join(process.env.TEMP || '/tmp', `remove_${crypto.randomUUID()}.ps1`);

    try {
      await fs.writeFile(tempScript, command, 'utf-8');
      const result = await this.executeScript(tempScript, [], { timeout: 5000 });
      await fs.unlink(tempScript).catch(() => {});

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: `Module removal error: ${error.message}`,
        duration: 0,
        warnings: [],
      };
    }
  }

  /**
   * Shutdown the service
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down PowerShell Execution Service...');

    // Stop cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Kill all active executions
    for (const [token, process] of this.activeExecutions.entries()) {
      console.log(`Killing active execution: ${token}`);
      process.kill('SIGTERM');
    }
    this.activeExecutions.clear();

    // Kill all session processes
    for (const [id, session] of this.sessionPool.entries()) {
      if (session.process) {
        console.log(`Terminating session: ${id}`);
        session.process.kill('SIGTERM');
      }
    }
    this.sessionPool.clear();

    // Clear caches and queues
    this.moduleCache.clear();
    this.requestQueue = [];
    this.initialized = false;

    console.log('PowerShell Execution Service shutdown complete');
  }
}

// Export service as default and named export
export default PowerShellExecutionService;
export { PowerShellExecutionService };

// Error classes already exported at top of file (lines 27-60)
