/**
 * Discovery Service Orchestrator
 *
 * Central orchestration service for all discovery operations including:
 * - Discovery execution and scheduling
 * - Template management
 * - Discovery history and results
 * - Incremental discovery
 * - Result comparison
 */

import * as cron from 'node-cron';
import { cacheService } from './cacheService';

import {
  DiscoveryConfig,
  DiscoveryResult,
  ScheduledDiscovery,
  DiscoveryTemplate,
  DiscoveryRun,
  ComparisonResult,
  ValidationResult,
  ConnectionResult,
  HistoryFilter,
} from '../types/models/discovery';


/**
 * Discovery Service Class
 * Manages discovery orchestration, templates, and history
 */
class DiscoveryService {
  private discoveryHistory: Map<string, DiscoveryRun>;
  private discoveryTemplates: Map<string, DiscoveryTemplate>;
  private scheduledDiscoveries: Map<string, ScheduledDiscovery>;
  private activeDiscoveries: Map<string, AbortController>;
  private cronJobs: Map<string, cron.ScheduledTask>;
  private cacheService = cacheService;
  private eventCleanupFunctions: (() => void)[] = [];

  constructor() {
    this.discoveryHistory = new Map();
    this.discoveryTemplates = new Map();
    this.scheduledDiscoveries = new Map();
    this.activeDiscoveries = new Map();
    this.cronJobs = new Map();

    // Load persisted data
    this.loadPersistedData();

    // Setup real-time event listeners
    this.setupEventListeners();
  }

  /**
   * Setup real-time event listeners for discovery streaming
   */
  private setupEventListeners(): void {
    // Listen for discovery output events
    const outputCleanup = window.electron.onDiscoveryOutput((data: any) => {
      const run = this.discoveryHistory.get(data.executionId);
      if (run) {
        // Update run with output data
        if (!run.output) run.output = [];
        run.output.push({
          timestamp: new Date(data.timestamp),
          level: data.level,
          message: data.message,
          source: data.source,
        });
      }
    });

    // Listen for discovery progress events
    const progressCleanup = window.electron.onDiscoveryProgress((data: any) => {
      const run = this.discoveryHistory.get(data.executionId);
      if (run) {
        run.progress = data.percentage;
        run.currentPhase = data.currentPhase;
        run.itemsProcessed = data.itemsProcessed;
        run.totalItems = data.totalItems;
      }
    });

    // Listen for discovery completion events
    const completeCleanup = window.electron.onDiscoveryComplete((data: any) => {
      const run = this.discoveryHistory.get(data.executionId);
      if (run) {
        run.endTime = new Date();
        run.status = 'completed';
        run.result = data.result;
        run.progress = 100;
        this.discoveryHistory.set(data.executionId, run);
        this.saveDiscoveryHistory();
      }
    });

    // Listen for discovery error events
    const errorCleanup = window.electron.onDiscoveryError((data: any) => {
      const run = this.discoveryHistory.get(data.executionId);
      if (run) {
        run.status = 'failed';
        run.endTime = new Date();
        run.error = data.error;
        this.discoveryHistory.set(data.executionId, run);
        this.saveDiscoveryHistory();
      }
    });

    // Store cleanup functions
    this.eventCleanupFunctions = [outputCleanup, progressCleanup, completeCleanup, errorCleanup];
  }

  // ==================== Discovery Orchestration ====================

  /**
   * Run a discovery operation
   * @param config Discovery configuration
   * @returns Discovery result
   */
  async runDiscovery(config: DiscoveryConfig): Promise<DiscoveryResult> {
    const runId = crypto.randomUUID();
    const startTime = new Date();

    // Create abort controller for cancellation
    const abortController = new AbortController();
    this.activeDiscoveries.set(runId, abortController);

    try {
      // Validate configuration
      const validation = await this.validateConfig(config);
      if (!validation.passed) {
        return {
          id: runId,
          name: config.name || 'Discovery',
          moduleName: config.moduleName || config.type || 'unknown',
          displayName: config.name || 'Discovery',
          itemCount: 0,
          discoveryTime: new Date(),
          duration: 0,
          status: 'failed',
          filePath: '',
          createdAt: new Date(),
          success: false,
          summary: 'Discovery failed',
          errorMessage: validation.errors.map(e => e.message).join(', '),
          additionalData: {},
          errors: validation.errors.map(e => e.message),
          warnings: validation.warnings.map(w => w.message),
          data: [],
        };
      }

      // Create discovery run record
      const run: DiscoveryRun = {
        id: runId,
        configId: config.id ?? runId,
        config,
        startTime,
        status: 'running',
        progress: 0,
        createdAt: new Date(),
      };

      this.discoveryHistory.set(runId, run);

      // Execute discovery based on type
      const result = await this.executeDiscoveryByType(config, abortController.signal);

      // Update run record
      run.endTime = new Date();
      run.status = result.status as DiscoveryRun['status'];
      run.result = result;
      run.progress = 100;
      this.discoveryHistory.set(runId, run);

      // Persist history
      await this.saveDiscoveryHistory();

      return result;
    } catch (error: any) {
      const endTime = new Date();
      const errorResult: DiscoveryResult = {
        id: runId,
        name: config.name || 'Discovery',
        moduleName: config.moduleName || config.type || 'unknown',
        displayName: config.name || 'Discovery',
        itemCount: 0,
        discoveryTime: endTime,
        duration: endTime.getTime() - startTime.getTime(),
        status: 'failed',
        filePath: '',
        createdAt: endTime,
        success: false,
        summary: 'Discovery failed',
        errorMessage: error.message,
        additionalData: {},
        data: [],
        errors: [error.message],
        warnings: [],
      };

      // Update history
      const run = this.discoveryHistory.get(runId);
      if (run) {
        run.status = 'failed';
        run.endTime = endTime;
        run.result = errorResult;
        this.discoveryHistory.set(runId, run);
      }

      return errorResult;
    } finally {
      this.activeDiscoveries.delete(runId);
    }
  }

  /**
   * Execute discovery using window.electron.executeDiscovery API
   */
  private async executeDiscoveryByType(config: DiscoveryConfig, signal: AbortSignal): Promise<DiscoveryResult> {
    const startTime = new Date();
    const executionId = crypto.randomUUID();

    try {
      // Use the new executeDiscovery API
      const result = await window.electron.executeDiscovery({
        moduleName: config.moduleName || config.type || 'domain',
        parameters: config.parameters ?? {},
        executionId: executionId,
      });

      const endTime = new Date();

      if (!result.success) {
        return {
          id: executionId,
          name: config.name || 'Discovery',
          moduleName: config.moduleName || config.type || 'unknown',
          displayName: config.name || 'Discovery',
          itemCount: 0,
          discoveryTime: endTime,
          duration: endTime.getTime() - startTime.getTime(),
          status: 'failed',
          filePath: '',
          createdAt: endTime,
          success: false,
          summary: 'Discovery execution failed',
          errorMessage: result.error || 'Discovery execution failed',
          additionalData: {},
          data: [],
          errors: [result.error || 'Discovery execution failed'],
          warnings: [],
        };
      }

      // Parse result data
      const data = Array.isArray(result.result) ? result.result : result.result ? [result.result] : [];

      return {
        id: executionId,
        name: config.name || 'Discovery',
        moduleName: config.moduleName || config.type || 'unknown',
        displayName: config.name || 'Discovery',
        itemCount: data.length,
        discoveryTime: endTime,
        duration: endTime.getTime() - startTime.getTime(),
        status: 'completed',
        filePath: '',
        createdAt: endTime,
        success: true,
        summary: `Discovery completed - ${data.length} items found`,
        errorMessage: '',
        additionalData: {},
        data,
        errors: [],
        warnings: [],
      };
    } catch (error: any) {
      const endTime = new Date();
      throw new Error(`Discovery execution failed: ${error.message}`);
    }
  }

  /**
   * Schedule a discovery operation
   * @param config Scheduled discovery configuration
   */
  async scheduleDiscovery(config: ScheduledDiscovery): Promise<void> {
    // Validate schedule (cron expression)
    if (!cron.validate(config.schedule)) {
      throw new Error(`Invalid cron schedule: ${config.schedule}`);
    }

    // Cancel existing job if rescheduling
    const existingJob = this.cronJobs.get(config.id);
    if (existingJob) {
      existingJob.stop();
      this.cronJobs.delete(config.id);
    }

    // Create cron job
    const task = cron.schedule(
      config.schedule,
      async () => {
        try {
          console.log(`Running scheduled discovery: ${config.name}`);

          // Build discovery config from scheduled config
          const discoveryConfig: DiscoveryConfig = {
            id: crypto.randomUUID(),
            name: config.name ?? 'Scheduled Discovery',
            type: config.type ?? 'domain',
            moduleName: config.type ?? 'domain',
            isEnabled: true,
            settings: {},
            priority: 1,
            parallelExecution: false,
            timeout: config.timeout || 300000,
            parameters: config.parameters,
            credentials: config.credentials,
            retryPolicy: config.retryPolicy,
          };

          // Run discovery
          await this.runDiscovery(discoveryConfig);
        } catch (error) {
          console.error(`Scheduled discovery failed: ${config.name}`, error);
        }
      },
      {
        scheduled: config.enabled !== false,
        timezone: 'America/New_York', // Use system timezone or make configurable
      } as any // TODO: Fix cron job options type
    );

    // Store job and config
    this.cronJobs.set(config.id, task);
    this.scheduledDiscoveries.set(config.id, config);

    console.log(`Scheduled discovery: ${config.name} (${config.schedule})`);

    await this.saveScheduledDiscoveries();
  }

  /**
   * Cancel a running discovery
   * @param id Discovery run ID
   */
  async cancelDiscovery(id: string): Promise<void> {
    const abortController = this.activeDiscoveries.get(id);
    if (abortController) {
      abortController.abort();
      this.activeDiscoveries.delete(id);

      // Update history
      const run = this.discoveryHistory.get(id);
      if (run) {
        run.status = 'cancelled';
        run.endTime = new Date();
        this.discoveryHistory.set(id, run);
        await this.saveDiscoveryHistory();
      }

      console.log(`Cancelled discovery: ${id}`);
    } else {
      throw new Error(`Active discovery not found: ${id}`);
    }
  }

  /**
   * Pause a running discovery (if supported)
   * @param id Discovery run ID
   */
  async pauseDiscovery(id: string): Promise<void> {
    const run = this.discoveryHistory.get(id);
    if (!run) {
      throw new Error(`Discovery not found: ${id}`);
    }

    if (run.status !== 'running') {
      throw new Error(`Discovery is not running: ${id}`);
    }

    run.status = 'paused';
    this.discoveryHistory.set(id, run);
    await this.saveDiscoveryHistory();

    console.log(`Paused discovery: ${id}`);
  }

  /**
   * Resume a paused discovery
   * @param id Discovery run ID
   */
  async resumeDiscovery(id: string): Promise<void> {
    const run = this.discoveryHistory.get(id);
    if (!run) {
      throw new Error(`Discovery not found: ${id}`);
    }

    if (run.status !== 'paused') {
      throw new Error(`Discovery is not paused: ${id}`);
    }

    run.status = 'running';
    this.discoveryHistory.set(id, run);
    await this.saveDiscoveryHistory();

    console.log(`Resumed discovery: ${id}`);

    // Resume PowerShell execution by re-running the discovery
    // Note: PowerShell doesn't have native pause/resume capability
    // So we re-run the discovery from the beginning
    try {
      if (!run.config) {
        throw new Error('Discovery configuration not found');
      }
      const result = await this.runDiscovery(run.config);

      // Update the run with new result
      run.endTime = new Date();
      run.status = result.status as DiscoveryRun['status'];
      run.result = result;
      run.progress = 100;
      this.discoveryHistory.set(id, run);
      await this.saveDiscoveryHistory();
    } catch (error: any) {
      run.status = 'failed';
      run.endTime = new Date();
      this.discoveryHistory.set(id, run);
      await this.saveDiscoveryHistory();
      throw error;
    }
  }

  /**
   * Cancel a scheduled discovery
   * @param id Scheduled discovery ID
   */
  async cancelScheduledDiscovery(id: string): Promise<void> {
    const job = this.cronJobs.get(id);
    if (job) {
      job.stop();
      this.cronJobs.delete(id);
    }

    this.scheduledDiscoveries.delete(id);
    await this.saveScheduledDiscoveries();

    console.log(`Cancelled scheduled discovery: ${id}`);
  }

  /**
   * Get all scheduled discoveries
   * @returns Array of scheduled discoveries
   */
  async getScheduledDiscoveries(): Promise<ScheduledDiscovery[]> {
    return this.cacheService.getOrSet(
      'discovery:scheduled',
      async () => Array.from(this.scheduledDiscoveries.values()),
      { ttl: 60 * 1000 } // 1 minute
    );
  }

  /**
   * Enable/disable a scheduled discovery
   * @param id Scheduled discovery ID
   * @param enabled Whether to enable or disable
   */
  async toggleScheduledDiscovery(id: string, enabled: boolean): Promise<void> {
    const scheduled = this.scheduledDiscoveries.get(id);
    if (!scheduled) {
      throw new Error(`Scheduled discovery not found: ${id}`);
    }

    const job = this.cronJobs.get(id);
    if (job) {
      if (enabled) {
        job.start();
      } else {
        job.stop();
      }
    }

    scheduled.enabled = enabled;
    this.scheduledDiscoveries.set(id, scheduled);
    await this.saveScheduledDiscoveries();
  }

  // ==================== Discovery Templates ====================

  /**
   * Get all discovery templates
   * @returns Array of templates
   */
  async getTemplates(): Promise<DiscoveryTemplate[]> {
    return this.cacheService.getOrSet(
      'discovery:templates',
      async () => Array.from(this.discoveryTemplates.values()),
      { ttl: 5 * 60 * 1000 } // 5 minutes
    );
  }

  // ==================== Module Information ====================

  /**
   * Get list of available discovery modules
   * @returns Array of discovery modules
   */
  async getDiscoveryModules(): Promise<any[]> {
    try {
      const result = await window.electron.getDiscoveryModules();
      if (result.success) {
        return result.modules || [];
      }
      return [];
    } catch (error: any) {
      console.error('Failed to get discovery modules:', error);
      return [];
    }
  }

  /**
   * Get detailed information about a discovery module
   * @param moduleName Module name
   * @returns Module information
   */
  async getDiscoveryModuleInfo(moduleName: string): Promise<any | null> {
    try {
      const result = await window.electron.getDiscoveryModuleInfo(moduleName);
      if (result.success) {
        return result.info || null;
      }
      return null;
    } catch (error: any) {
      console.error(`Failed to get module info for ${moduleName}:`, error);
      return null;
    }
  }

  /**
   * Save a discovery template
   * @param template Template to save
   */
  async saveTemplate(template: DiscoveryTemplate): Promise<void> {
    this.discoveryTemplates.set(template.id, template);
    await this.saveDiscoveryTemplates();

    // Invalidate templates cache
    this.cacheService.delete('discovery:templates');

    console.log(`Saved discovery template: ${template.name}`);
  }

  /**
   * Delete a discovery template
   * @param id Template ID
   */
  async deleteTemplate(id: string): Promise<void> {
    if (!this.discoveryTemplates.has(id)) {
      throw new Error(`Template not found: ${id}`);
    }

    this.discoveryTemplates.delete(id);
    await this.saveDiscoveryTemplates();

    // Invalidate templates cache
    this.cacheService.delete('discovery:templates');

    console.log(`Deleted discovery template: ${id}`);
  }

  /**
   * Apply a template to create a discovery configuration
   * @param templateId Template ID
   * @returns Discovery configuration
   */
  async applyTemplate(templateId: string): Promise<DiscoveryConfig> {
    const template = this.discoveryTemplates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const config: DiscoveryConfig = {
      id: crypto.randomUUID(),
      name: template.name ?? 'Template Discovery',
      type: template.type ?? 'domain',
      moduleName: template.config.moduleName || template.type || 'domain',
      isEnabled: true,
      settings: template.config.settings || {},
      priority: template.config.priority || 1,
      parallelExecution: template.config.parallelExecution || false,
      timeout: template.timeout || 300000,
      parameters: { ...template.parameters },
      credentials: template.credentials,
      retryPolicy: template.retryPolicy,
    };

    return config;
  }

  // ==================== Discovery History ====================

  /**
   * Get discovery history with optional filtering
   * @param filter Optional filter criteria
   * @returns Array of discovery runs
   */
  async getHistory(filter?: HistoryFilter): Promise<DiscoveryRun[]> {
    // Generate cache key based on filter
    const cacheKey = `discovery:history:${JSON.stringify(filter || {})}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        let runs = Array.from(this.discoveryHistory.values());

        if (filter) {
          // Filter by type
          if (filter.type) {
            runs = runs.filter(r => r.config?.type === filter.type);
          }

          // Filter by status
          if (filter.status) {
            runs = runs.filter(r => r.status === filter.status);
          }

          // Filter by date range
          if (filter.startDate) {
            runs = runs.filter(r => r.startTime && r.startTime >= filter.startDate);
          }
          if (filter.endDate) {
            runs = runs.filter(r => r.startTime && r.startTime <= filter.endDate);
          }

          // Limit results
          if (filter.limit) {
            runs = runs.slice(0, filter.limit);
          }
        }

        // Sort by start time (newest first)
        runs.sort((a, b) => {
          const aTime = a.startTime ? (typeof a.startTime === 'string' ? new Date(a.startTime) : a.startTime) : new Date(0);
          const bTime = b.startTime ? (typeof b.startTime === 'string' ? new Date(b.startTime) : b.startTime) : new Date(0);
          return bTime.getTime() - aTime.getTime();
        });

        return runs;
      },
      { ttl: 30 * 1000 } // 30 seconds
    );
  }

  /**
   * Get specific discovery results
   * @param runId Discovery run ID
   * @returns Discovery result
   */
  async getResults(runId: string): Promise<DiscoveryResult> {
    return this.cacheService.getOrSet(
      `discovery:results:${runId}`,
      async () => {
        const run = this.discoveryHistory.get(runId);
        if (!run || !run.result) {
          throw new Error(`Discovery results not found: ${runId}`);
        }

        return run.result;
      },
      { ttl: 5 * 60 * 1000 } // 5 minutes
    );
  }

  /**
   * Delete discovery history entry
   * @param runId Discovery run ID
   */
  async deleteHistory(runId: string): Promise<void> {
    if (!this.discoveryHistory.has(runId)) {
      throw new Error(`Discovery history not found: ${runId}`);
    }

    this.discoveryHistory.delete(runId);
    await this.saveDiscoveryHistory();

    // Invalidate caches
    this.cacheService.delete(`discovery:results:${runId}`);
    this.cacheService.invalidatePrefix('discovery:history:');
    this.cacheService.invalidatePrefix('discovery:comparison:');

    console.log(`Deleted discovery history: ${runId}`);
  }

  /**
   * Export discovery history to file
   * @param runId Discovery run ID
   * @param format Export format
   */
  async exportHistory(runId: string, format: 'json' | 'csv'): Promise<void> {
    const result = await this.getResults(runId);

    if (format === 'json') {
      const json = JSON.stringify(result, null, 2);
      await this.downloadFile(`discovery_${runId}.json`, json, 'application/json');
    } else if (format === 'csv') {
      const csv = this.convertToCSV(result.data ?? []);
      await this.downloadFile(`discovery_${runId}.csv`, csv, 'text/csv');
    }
  }

  // ==================== Incremental Discovery ====================

  /**
   * Run incremental discovery (discover only changes since last run)
   * @param lastRunId Previous discovery run ID
   * @returns Discovery result with only changes
   */
  async runIncremental(lastRunId: string): Promise<DiscoveryResult> {
    const lastRun = this.discoveryHistory.get(lastRunId);
    if (!lastRun || !lastRun.result) {
      throw new Error(`Previous discovery run not found: ${lastRunId}`);
    }

    // Run new discovery with same configuration
    if (!lastRun.config) {
      throw new Error('Previous discovery configuration not found');
    }
    const newResult = await this.runDiscovery(lastRun.config);

    // Compare results to find changes
    const comparison = await this.compareResults(lastRunId, newResult.id);

    // Return only changed/new items
    const incrementalResult: DiscoveryResult = {
      ...newResult,
      data: [...(comparison.added ?? []), ...(comparison.modified?.map(m => m.item) ?? [])],
      itemCount: (comparison.added?.length ?? 0) + (comparison.modified?.length ?? 0),
    };

    return incrementalResult;
  }

  /**
   * Compare two discovery results
   * @param runId1 First run ID
   * @param runId2 Second run ID
   * @returns Comparison result
   */
  async compareResults(runId1: string, runId2: string): Promise<ComparisonResult> {
    // Cache comparison results as they are computationally expensive
    const cacheKey = `discovery:comparison:${runId1}:${runId2}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const result1 = await this.getResults(runId1);
        const result2 = await this.getResults(runId2);

        // Simple comparison based on ID field
        const data1Map = new Map((result1.data ?? []).map(item => [item.id || item.Id || item.ID, item]));
        const data2Map = new Map((result2.data ?? []).map(item => [item.id || item.Id || item.ID, item]));

        const added: any[] = [];
        const removed: any[] = [];
        const modified: any[] = [];
        const unchanged: any[] = [];

        // Find added and modified
        for (const [id, item2] of data2Map) {
          const item1 = data1Map.get(id);
          if (!item1) {
            added.push(item2);
          } else if (JSON.stringify(item1) !== JSON.stringify(item2)) {
            modified.push(item2);
          } else {
            unchanged.push(item2);
          }
        }

        // Find removed
        for (const [id, item1] of data1Map) {
          if (!data2Map.has(id)) {
            removed.push(item1);
          }
        }

        return {
          runId1,
          runId2,
          timestamp: new Date(),
          differences: {
            added,
            removed,
            modified,
          },
          summary: {
            totalAdded: added.length,
            totalRemoved: removed.length,
            totalModified: modified.length,
          },
        };
      },
      { ttl: 10 * 60 * 1000 } // 10 minutes - comparison results are expensive to compute
    );
  }

  // ==================== Discovery Validation ====================

  /**
   * Validate discovery configuration against module schemas
   * @param config Discovery configuration
   * @returns Validation result
   */
  async validateConfig(config: DiscoveryConfig): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];

    // Check required fields
    if (!config.name) {
      errors.push({ code: 'MISSING_NAME', message: 'Discovery name is required', severity: 'error' });
    }

    if (!config.type) {
      errors.push({ code: 'MISSING_TYPE', message: 'Discovery type is required', severity: 'error' });
    }

    // Get module information for schema validation
    try {
      const moduleInfo = await window.electron.getDiscoveryModuleInfo(config.moduleName || config.type || 'domain');
      if (moduleInfo.success && moduleInfo.info) {
        const schema = moduleInfo.info.parameters;

        // Validate parameters against schema
        if (schema && config.parameters) {
          for (const param of schema) {
            const value = config.parameters[param.name];

            // Check required parameters
            if (param.required && (value === undefined || value === null || value === '')) {
              errors.push({
                code: 'MISSING_REQUIRED_PARAM',
                message: `${param.name} is required`,
                severity: 'error'
              });
            }

            // Check parameter types (basic validation)
            if (value !== undefined && value !== null) {
              switch (param.type.toLowerCase()) {
                case 'boolean':
                  if (typeof value !== 'boolean') {
                    errors.push({
                      code: 'INVALID_PARAM_TYPE',
                      message: `${param.name} must be a boolean`,
                      severity: 'error'
                    });
                  }
                  break;
                case 'number':
                  if (typeof value !== 'number' && isNaN(Number(value))) {
                    errors.push({
                      code: 'INVALID_PARAM_TYPE',
                      message: `${param.name} must be a number`,
                      severity: 'error'
                    });
                  }
                  break;
                case 'string':
                  if (typeof value !== 'string') {
                    errors.push({
                      code: 'INVALID_PARAM_TYPE',
                      message: `${param.name} must be a string`,
                      severity: 'error'
                    });
                  }
                  break;
              }
            }
          }
        }
      } else {
        // Fallback to basic validation if module info not available
        if (config.type === 'active-directory' && config.parameters && !config.parameters.Domain && !config.parameters.Forest) {
          errors.push({ code: 'MISSING_DOMAIN', message: 'Domain or Forest parameter is required for AD discovery', severity: 'error' });
        }
      }
    } catch (error: any) {
      console.warn('Failed to get module info for validation:', error);
      // Continue with basic validation
    }

    // Validate timeout
    if (config.timeout && config.timeout < 1000) {
      warnings.push({ code: 'LOW_TIMEOUT', message: 'Timeout is very low, may cause failures', severity: 'warning' });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Test connection with discovery configuration
   * @param config Discovery configuration
   * @returns Connection test result
   */
  async testConnection(config: DiscoveryConfig): Promise<ConnectionResult> {
    try {
      // Attempt a minimal discovery to test connectivity
      const testConfig: DiscoveryConfig = {
        ...config,
        parameters: { ...config.parameters, Test: true, MaxResults: 1 },
        timeout: 10000, // 10 second timeout for test
      };

      const result = await this.runDiscovery(testConfig);

      return {
        success: result.status === 'completed',
        message: result.status === 'completed' ? 'Connection successful' : 'Connection failed',
        details: result.errors && result.errors.length > 0 ? { error: result.errors[0] } : undefined,
        timestamp: new Date(),
        latency: result.endTime && result.startTime ? (typeof result.endTime === 'string' ? new Date(result.endTime).getTime() : result.endTime.getTime()) - (typeof result.startTime === 'string' ? new Date(result.startTime).getTime() : result.startTime.getTime()) : 0,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Connection test failed',
        details: { error: error.message },
        timestamp: new Date(),
        latency: 0,
      };
    }
  }

  // ==================== Helper Methods ====================

  /**
   * Load persisted data from localStorage
   */
  private async loadPersistedData(): Promise<void> {
    try {
      // Load discovery history
      const historyData = localStorage.getItem('discovery_history');
      if (historyData) {
        const history = JSON.parse(historyData);
        this.discoveryHistory = new Map(Object.entries(history));
      }

      // Load templates
      const templatesData = localStorage.getItem('discovery_templates');
      if (templatesData) {
        const templates = JSON.parse(templatesData);
        this.discoveryTemplates = new Map(Object.entries(templates));
      }

      // Load scheduled discoveries
      const scheduledData = localStorage.getItem('scheduled_discoveries');
      if (scheduledData) {
        const scheduled = JSON.parse(scheduledData);
        this.scheduledDiscoveries = new Map(Object.entries(scheduled));
      }
    } catch (error) {
      console.error('Failed to load persisted discovery data:', error);
    }
  }

  /**
   * Save discovery history to localStorage
   */
  private async saveDiscoveryHistory(): Promise<void> {
    try {
      const history = Object.fromEntries(this.discoveryHistory);
      localStorage.setItem('discovery_history', JSON.stringify(history));

      // Invalidate all history caches when history is updated
      this.cacheService.invalidatePrefix('discovery:history:');
    } catch (error) {
      console.error('Failed to save discovery history:', error);
    }
  }

  /**
   * Save discovery templates to localStorage
   */
  private async saveDiscoveryTemplates(): Promise<void> {
    try {
      const templates = Object.fromEntries(this.discoveryTemplates);
      localStorage.setItem('discovery_templates', JSON.stringify(templates));
    } catch (error) {
      console.error('Failed to save discovery templates:', error);
    }
  }

  /**
   * Save scheduled discoveries to localStorage
   */
  private async saveScheduledDiscoveries(): Promise<void> {
    try {
      const scheduled = Object.fromEntries(this.scheduledDiscoveries);
      localStorage.setItem('scheduled_discoveries', JSON.stringify(scheduled));

      // Invalidate scheduled discoveries cache
      this.cacheService.delete('discovery:scheduled');
    } catch (error) {
      console.error('Failed to save scheduled discoveries:', error);
    }
  }


  /**
   * Convert array of objects to CSV
   */
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        const escaped = ('' + value).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Download file to user's system
   */
  private async downloadFile(filename: string, content: string, mimeType: string): Promise<void> {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Cleanup all resources and event listeners
   */
  dispose(): void {
    // Clean up event listeners
    this.eventCleanupFunctions.forEach(cleanup => cleanup());

    // Cancel all active discoveries
    this.activeDiscoveries.forEach((controller, id) => {
      try {
        window.electron.cancelDiscovery(id);
      } catch (error) {
        console.error(`Failed to cancel discovery ${id}:`, error);
      }
    });
    this.activeDiscoveries.clear();

    // Stop all cron jobs
    this.cronJobs.forEach(job => job.stop());
    this.cronJobs.clear();

    // Clear all data
    this.discoveryHistory.clear();
    this.discoveryTemplates.clear();
    this.scheduledDiscoveries.clear();
  }
}

// Export singleton instance
export default new DiscoveryService();
