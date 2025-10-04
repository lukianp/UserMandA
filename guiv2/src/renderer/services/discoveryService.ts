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
import cron from 'node-cron';

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

  constructor() {
    this.discoveryHistory = new Map();
    this.discoveryTemplates = new Map();
    this.scheduledDiscoveries = new Map();
    this.activeDiscoveries = new Map();
    this.cronJobs = new Map();

    // Load persisted data
    this.loadPersistedData();
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
          configId: config.id,
          startTime,
          endTime: new Date(),
          status: 'failed',
          itemsDiscovered: 0,
          errors: validation.errors,
          warnings: validation.warnings,
          data: [],
        };
      }

      // Create discovery run record
      const run: DiscoveryRun = {
        id: runId,
        configId: config.id,
        config,
        startTime,
        status: 'running',
        progress: 0,
      };

      this.discoveryHistory.set(runId, run);

      // Execute discovery based on type
      const result = await this.executeDiscoveryByType(config, abortController.signal);

      // Update run record
      run.endTime = new Date();
      run.status = result.status;
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
        configId: config.id,
        startTime,
        endTime,
        status: 'failed',
        itemsDiscovered: 0,
        errors: [
          {
            code: 'DISCOVERY_ERROR',
            message: error.message,
            severity: 'error',
            details: error.stack,
          },
        ],
        warnings: [],
        data: [],
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
   * Execute discovery based on type
   */
  private async executeDiscoveryByType(config: DiscoveryConfig, signal: AbortSignal): Promise<DiscoveryResult> {
    const startTime = new Date();

    // Build module execution parameters based on discovery type
    const moduleMapping: Record<string, { module: string; function: string }> = {
      'active-directory': { module: 'Modules/Discovery/ActiveDirectoryDiscovery.psm1', function: 'Invoke-ADDiscovery' },
      'azure': { module: 'Modules/Discovery/AzureDiscovery.psm1', function: 'Invoke-AzureDiscovery' },
      'office365': { module: 'Modules/Discovery/Office365Discovery.psm1', function: 'Invoke-O365Discovery' },
      'exchange': { module: 'Modules/Discovery/ExchangeDiscovery.psm1', function: 'Invoke-ExchangeDiscovery' },
      'sharepoint': { module: 'Modules/Discovery/SharePointDiscovery.psm1', function: 'Invoke-SharePointDiscovery' },
      'teams': { module: 'Modules/Discovery/TeamsDiscovery.psm1', function: 'Invoke-TeamsDiscovery' },
      'intune': { module: 'Modules/Discovery/IntuneDiscovery.psm1', function: 'Invoke-IntuneDiscovery' },
      'google-workspace': { module: 'Modules/Discovery/GoogleWorkspaceDiscovery.psm1', function: 'Invoke-GoogleWorkspaceDiscovery' },
      'aws': { module: 'Modules/Discovery/AWSDiscovery.psm1', function: 'Invoke-AWSDiscovery' },
      'vmware': { module: 'Modules/Discovery/VMwareDiscovery.psm1', function: 'Invoke-VMwareDiscovery' },
      'hyperv': { module: 'Modules/Discovery/HyperVDiscovery.psm1', function: 'Invoke-HyperVDiscovery' },
      'network': { module: 'Modules/Discovery/NetworkDiscovery.psm1', function: 'Invoke-NetworkDiscovery' },
      'applications': { module: 'Modules/Discovery/ApplicationDiscovery.psm1', function: 'Invoke-ApplicationDiscovery' },
      'filesystem': { module: 'Modules/Discovery/FileSystemDiscovery.psm1', function: 'Invoke-FileSystemDiscovery' },
      'security-infrastructure': { module: 'Modules/Discovery/SecurityInfrastructureDiscovery.psm1', function: 'Invoke-SecurityInfrastructureDiscovery' },
      'licensing': { module: 'Modules/Discovery/LicensingDiscovery.psm1', function: 'Invoke-LicensingDiscovery' },
      'power-platform': { module: 'Modules/Discovery/PowerPlatformDiscovery.psm1', function: 'Invoke-PowerPlatformDiscovery' },
      'sql-server': { module: 'Modules/Discovery/SQLServerDiscovery.psm1', function: 'Invoke-SQLServerDiscovery' },
      'web-server': { module: 'Modules/Discovery/WebServerDiscovery.psm1', function: 'Invoke-WebServerDiscovery' },
      'conditional-access': { module: 'Modules/Discovery/ConditionalAccessDiscovery.psm1', function: 'Invoke-ConditionalAccessDiscovery' },
      'dlp': { module: 'Modules/Discovery/DLPDiscovery.psm1', function: 'Invoke-DLPDiscovery' },
      'identity-governance': { module: 'Modules/Discovery/IdentityGovernanceDiscovery.psm1', function: 'Invoke-IdentityGovernanceDiscovery' },
      'onedrive': { module: 'Modules/Discovery/OneDriveDiscovery.psm1', function: 'Invoke-OneDriveDiscovery' },
      'environment-detection': { module: 'Modules/Discovery/EnvironmentDetection.psm1', function: 'Invoke-EnvironmentDetection' },
    };

    const moduleConfig = moduleMapping[config.type];
    if (!moduleConfig) {
      throw new Error(`Unknown discovery type: ${config.type}`);
    }

    // Execute via IPC
    try {
      const psResult = await window.electronAPI.executeModule({
        modulePath: moduleConfig.module,
        functionName: moduleConfig.function,
        parameters: config.parameters,
        options: {
          timeout: config.timeout || 300000, // 5 minutes default
          streamOutput: true,
        },
      });

      const endTime = new Date();

      if (!psResult.success) {
        return {
          id: crypto.randomUUID(),
          configId: config.id,
          startTime,
          endTime,
          status: 'failed',
          itemsDiscovered: 0,
          errors: [
            {
              code: 'EXECUTION_ERROR',
              message: psResult.error || 'Discovery execution failed',
              severity: 'error',
            },
          ],
          warnings: psResult.warnings?.map(w => ({
            code: 'DISCOVERY_WARNING',
            message: w,
            severity: 'warning',
          })) || [],
          data: [],
        };
      }

      // Parse result data
      const data = Array.isArray(psResult.data) ? psResult.data : psResult.data ? [psResult.data] : [];

      return {
        id: crypto.randomUUID(),
        configId: config.id,
        startTime,
        endTime,
        status: 'completed',
        itemsDiscovered: data.length,
        errors: [],
        warnings: psResult.warnings?.map(w => ({
          code: 'DISCOVERY_WARNING',
          message: w,
          severity: 'warning',
        })) || [],
        data,
      };
    } catch (error: any) {
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
            name: config.name,
            type: config.type,
            parameters: config.parameters,
            credentials: config.credentials,
            timeout: config.timeout,
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
      }
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
      const result = await this.runDiscovery(run.config);

      // Update the run with new result
      run.endTime = new Date();
      run.status = result.status;
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
  getScheduledDiscoveries(): ScheduledDiscovery[] {
    return Array.from(this.scheduledDiscoveries.values());
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
    return Array.from(this.discoveryTemplates.values());
  }

  /**
   * Save a discovery template
   * @param template Template to save
   */
  async saveTemplate(template: DiscoveryTemplate): Promise<void> {
    this.discoveryTemplates.set(template.id, template);
    await this.saveDiscoveryTemplates();
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
      name: template.name,
      type: template.type,
      parameters: { ...template.parameters },
      credentials: template.credentials,
      timeout: template.timeout,
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
    let runs = Array.from(this.discoveryHistory.values());

    if (filter) {
      // Filter by type
      if (filter.type) {
        runs = runs.filter(r => r.config.type === filter.type);
      }

      // Filter by status
      if (filter.status) {
        runs = runs.filter(r => r.status === filter.status);
      }

      // Filter by date range
      if (filter.startDate) {
        runs = runs.filter(r => r.startTime >= filter.startDate!);
      }
      if (filter.endDate) {
        runs = runs.filter(r => r.startTime <= filter.endDate!);
      }

      // Limit results
      if (filter.limit) {
        runs = runs.slice(0, filter.limit);
      }
    }

    // Sort by start time (newest first)
    runs.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

    return runs;
  }

  /**
   * Get specific discovery results
   * @param runId Discovery run ID
   * @returns Discovery result
   */
  async getResults(runId: string): Promise<DiscoveryResult> {
    const run = this.discoveryHistory.get(runId);
    if (!run || !run.result) {
      throw new Error(`Discovery results not found: ${runId}`);
    }

    return run.result;
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
      const csv = this.convertToCSV(result.data);
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
    const newResult = await this.runDiscovery(lastRun.config);

    // Compare results to find changes
    const comparison = await this.compareResults(lastRunId, newResult.id);

    // Return only changed/new items
    const incrementalResult: DiscoveryResult = {
      ...newResult,
      data: [...comparison.added, ...comparison.modified],
      itemsDiscovered: comparison.added.length + comparison.modified.length,
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
    const result1 = await this.getResults(runId1);
    const result2 = await this.getResults(runId2);

    // Simple comparison based on ID field
    const data1Map = new Map(result1.data.map(item => [item.id || item.Id || item.ID, item]));
    const data2Map = new Map(result2.data.map(item => [item.id || item.Id || item.ID, item]));

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
      added,
      removed,
      modified,
      unchanged,
      summary: {
        totalItems1: result1.data.length,
        totalItems2: result2.data.length,
        addedCount: added.length,
        removedCount: removed.length,
        modifiedCount: modified.length,
        unchangedCount: unchanged.length,
      },
    };
  }

  // ==================== Discovery Validation ====================

  /**
   * Validate discovery configuration
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

    // Validate timeout
    if (config.timeout && config.timeout < 1000) {
      warnings.push({ code: 'LOW_TIMEOUT', message: 'Timeout is very low, may cause failures', severity: 'warning' });
    }

    // Validate parameters based on type
    if (config.type === 'active-directory' && !config.parameters.Domain && !config.parameters.Forest) {
      errors.push({ code: 'MISSING_DOMAIN', message: 'Domain or Forest parameter is required for AD discovery', severity: 'error' });
    }

    return {
      passed: errors.length === 0,
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
        details: result.errors.length > 0 ? result.errors[0].message : undefined,
        latency: result.endTime && result.startTime ? result.endTime.getTime() - result.startTime.getTime() : 0,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Connection test failed',
        details: error.message,
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
}

// Export singleton instance
export default new DiscoveryService();
