/**
 * Coexistence Service
 *
 * Coexistence management with:
 * - Free/busy calendar sharing
 * - Mail routing between source/target
 * - GAL (Global Address List) synchronization
 * - Hybrid configuration management
 * - Cross-forest authentication
 * - Proxy address management
 * - Coexistence monitoring
 * - Troubleshoot coexistence issues
 * - Coexistence health checks
 * - Decommission coexistence when done
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import PowerShellExecutionService from './powerShellService';

/**
 * Coexistence type
 */
export type CoexistenceType = 'exchange-hybrid' | 'ad-hybrid' | 'cross-forest' | 'custom';

/**
 * Coexistence status
 */
export type CoexistenceStatus = 'not-configured' | 'configuring' | 'active' | 'decommissioning' | 'decommissioned' | 'error';

/**
 * Coexistence configuration
 */
export interface CoexistenceConfig {
  id: string;
  waveId: string;
  name: string;
  type: CoexistenceType;
  status: CoexistenceStatus;
  sourceEnvironment: EnvironmentConfig;
  targetEnvironment: EnvironmentConfig;
  features: CoexistenceFeatures;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

/**
 * Environment config
 */
interface EnvironmentConfig {
  id: string;
  name: string;
  type: 'on-premises' | 'cloud' | 'hybrid';
  exchangeVersion?: string;
  adDomain?: string;
  endpoints: Record<string, string>;
  credentials?: string; // Encrypted
}

/**
 * Coexistence features
 */
interface CoexistenceFeatures {
  freeBusy: boolean;
  mailRouting: boolean;
  galSync: boolean;
  crossForestAuth: boolean;
  proxyAddresses: boolean;
}

/**
 * Coexistence health
 */
interface CoexistenceHealth {
  configId: string;
  timestamp: Date;
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  issues: CoexistenceIssue[];
}

/**
 * Health check
 */
interface HealthCheck {
  name: string;
  status: 'passed' | 'warning' | 'failed';
  message: string;
  details?: Record<string, any>;
}

/**
 * Coexistence issue
 */
interface CoexistenceIssue {
  id: string;
  type: 'free-busy' | 'mail-routing' | 'gal-sync' | 'auth' | 'proxy';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  affectedUsers: string[];
  detectedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}

/**
 * GAL sync result
 */
interface GALSyncResult {
  timestamp: Date;
  sourceEntries: number;
  targetEntries: number;
  synchronized: number;
  failed: number;
  duration: number;
  errors: string[];
}

/**
 * Coexistence Service
 */
class CoexistenceService extends EventEmitter {
  private powerShellService: PowerShellExecutionService;
  private configurations: Map<string, CoexistenceConfig>;
  private healthHistory: Map<string, CoexistenceHealth[]>;
  private issues: Map<string, CoexistenceIssue>;
  private dataDir: string;
  private monitoringInterval: NodeJS.Timeout | null;

  constructor(powerShellService: PowerShellExecutionService, dataDir?: string) {
    super();
    this.powerShellService = powerShellService;
    this.configurations = new Map();
    this.healthHistory = new Map();
    this.issues = new Map();
    this.dataDir = dataDir || path.join(process.cwd(), 'data', 'coexistence');
    this.monitoringInterval = null;

    this.ensureDataDirectory();
    this.loadData();
    this.startMonitoring();
  }

  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create coexistence data directory:', error);
    }
  }

  /**
   * Configure coexistence
   */
  async configureCoexistence(
    waveId: string,
    sourceEnv: EnvironmentConfig,
    targetEnv: EnvironmentConfig,
    features: CoexistenceFeatures,
    type: CoexistenceType = 'exchange-hybrid'
  ): Promise<CoexistenceConfig> {
    const config: CoexistenceConfig = {
      id: crypto.randomUUID(),
      waveId,
      name: `${sourceEnv.name} ↔ ${targetEnv.name}`,
      type,
      status: 'configuring',
      sourceEnvironment: sourceEnv,
      targetEnvironment: targetEnv,
      features,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
    };

    this.configurations.set(config.id, config);

    console.log(`Configuring coexistence: ${config.name}`);
    this.emit('coexistence:configuring', { config });

    try {
      // Configure free/busy sharing
      if (features.freeBusy) {
        await this.configureFreeBusy(config);
      }

      // Configure mail routing
      if (features.mailRouting) {
        await this.configureMailRouting(config);
      }

      // Configure GAL sync
      if (features.galSync) {
        await this.configureGALSync(config);
      }

      // Configure cross-forest authentication
      if (features.crossForestAuth) {
        await this.configureCrossForestAuth(config);
      }

      // Configure proxy addresses
      if (features.proxyAddresses) {
        await this.configureProxyAddresses(config);
      }

      config.status = 'active';
      config.updatedAt = new Date();

      await this.saveData();

      this.emit('coexistence:configured', { config });

      return config;
    } catch (error: any) {
      console.error('Coexistence configuration failed:', error);
      config.status = 'error';
      config.metadata.error = error.message;

      await this.saveData();

      this.emit('coexistence:failed', { config, error: error.message });

      throw error;
    }
  }

  /**
   * Configure free/busy sharing
   */
  private async configureFreeBusy(config: CoexistenceConfig): Promise<void> {
    console.log('Configuring free/busy calendar sharing');

    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Set-FreeBusySharing.ps1',
      [
        '-SourceEnvironment', JSON.stringify(config.sourceEnvironment),
        '-TargetEnvironment', JSON.stringify(config.targetEnvironment),
      ],
      { timeout: 120000 }
    );

    if (!result.success) {
      throw new Error(`Free/busy configuration failed: ${result.error}`);
    }

    this.emit('coexistence:freebusy-configured', { configId: config.id });
  }

  /**
   * Configure mail routing
   */
  private async configureMailRouting(config: CoexistenceConfig): Promise<void> {
    console.log('Configuring mail routing');

    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Set-MailRouting.ps1',
      [
        '-SourceEnvironment', JSON.stringify(config.sourceEnvironment),
        '-TargetEnvironment', JSON.stringify(config.targetEnvironment),
      ],
      { timeout: 120000 }
    );

    if (!result.success) {
      throw new Error(`Mail routing configuration failed: ${result.error}`);
    }

    this.emit('coexistence:routing-configured', { configId: config.id });
  }

  /**
   * Configure GAL sync
   */
  private async configureGALSync(config: CoexistenceConfig): Promise<void> {
    console.log('Configuring GAL synchronization');

    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Set-GALSync.ps1',
      [
        '-SourceEnvironment', JSON.stringify(config.sourceEnvironment),
        '-TargetEnvironment', JSON.stringify(config.targetEnvironment),
      ],
      { timeout: 180000 }
    );

    if (!result.success) {
      throw new Error(`GAL sync configuration failed: ${result.error}`);
    }

    // Run initial sync
    await this.syncGAL(config.id);

    this.emit('coexistence:gal-configured', { configId: config.id });
  }

  /**
   * Configure cross-forest authentication
   */
  private async configureCrossForestAuth(config: CoexistenceConfig): Promise<void> {
    console.log('Configuring cross-forest authentication');

    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Set-CrossForestAuth.ps1',
      [
        '-SourceEnvironment', JSON.stringify(config.sourceEnvironment),
        '-TargetEnvironment', JSON.stringify(config.targetEnvironment),
      ],
      { timeout: 180000 }
    );

    if (!result.success) {
      throw new Error(`Cross-forest auth configuration failed: ${result.error}`);
    }

    this.emit('coexistence:auth-configured', { configId: config.id });
  }

  /**
   * Configure proxy addresses
   */
  private async configureProxyAddresses(config: CoexistenceConfig): Promise<void> {
    console.log('Configuring proxy addresses');

    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Set-ProxyAddresses.ps1',
      [
        '-SourceEnvironment', JSON.stringify(config.sourceEnvironment),
        '-TargetEnvironment', JSON.stringify(config.targetEnvironment),
      ],
      { timeout: 120000 }
    );

    if (!result.success) {
      throw new Error(`Proxy addresses configuration failed: ${result.error}`);
    }

    this.emit('coexistence:proxy-configured', { configId: config.id });
  }

  /**
   * Synchronize GAL
   */
  async syncGAL(configId: string): Promise<GALSyncResult> {
    const config = this.configurations.get(configId);
    if (!config) {
      throw new Error(`Configuration ${configId} not found`);
    }

    console.log('Running GAL synchronization');
    const startTime = Date.now();

    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Sync-GAL.ps1',
      ['-ConfigId', configId],
      { timeout: 300000, streamOutput: true }
    );

    if (!result.success || !result.data) {
      throw new Error(`GAL sync failed: ${result.error}`);
    }

    const syncResult: GALSyncResult = {
      timestamp: new Date(),
      sourceEntries: result.data.sourceEntries || 0,
      targetEntries: result.data.targetEntries || 0,
      synchronized: result.data.synchronized || 0,
      failed: result.data.failed || 0,
      duration: Date.now() - startTime,
      errors: result.data.errors || [],
    };

    this.emit('coexistence:gal-synced', { configId, result: syncResult });

    return syncResult;
  }

  /**
   * Check coexistence health
   */
  async checkHealth(configId: string): Promise<CoexistenceHealth> {
    const config = this.configurations.get(configId);
    if (!config) {
      throw new Error(`Configuration ${configId} not found`);
    }

    console.log(`Checking coexistence health: ${config.name}`);

    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Test-CoexistenceHealth.ps1',
      ['-ConfigId', configId],
      { timeout: 120000 }
    );

    if (!result.success || !result.data) {
      throw new Error(`Health check failed: ${result.error}`);
    }

    const checks: HealthCheck[] = result.data.checks || [];
    const detectedIssues: CoexistenceIssue[] = result.data.issues || [];

    // Store detected issues
    for (const issue of detectedIssues) {
      this.issues.set(issue.id, issue);
    }

    const failedChecks = checks.filter(c => c.status === 'failed').length;
    const warningChecks = checks.filter(c => c.status === 'warning').length;

    const overallStatus: 'healthy' | 'degraded' | 'unhealthy' =
      failedChecks > 0 ? 'unhealthy' :
      warningChecks > 0 ? 'degraded' :
      'healthy';

    const health: CoexistenceHealth = {
      configId,
      timestamp: new Date(),
      overallStatus,
      checks,
      issues: detectedIssues,
    };

    // Store in history
    if (!this.healthHistory.has(configId)) {
      this.healthHistory.set(configId, []);
    }
    this.healthHistory.get(configId)!.push(health);

    // Keep only last 100 health checks
    const history = this.healthHistory.get(configId)!;
    if (history.length > 100) {
      history.shift();
    }

    await this.saveData();

    this.emit('coexistence:health-checked', { health });

    return health;
  }

  /**
   * Troubleshoot coexistence issue
   */
  async troubleshoot(issueId: string): Promise<{
    diagnosis: string;
    remediation: string[];
    autoFixAvailable: boolean;
  }> {
    const issue = this.issues.get(issueId);
    if (!issue) {
      throw new Error(`Issue ${issueId} not found`);
    }

    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Repair-CoexistenceIssue.ps1',
      ['-IssueId', issueId, '-IssueType', issue.type, '-DiagnoseOnly', '$true'],
      { timeout: 60000 }
    );

    if (!result.success || !result.data) {
      throw new Error(`Troubleshooting failed: ${result.error}`);
    }

    return {
      diagnosis: result.data.diagnosis || 'Unable to diagnose',
      remediation: result.data.remediation || [],
      autoFixAvailable: result.data.autoFixAvailable || false,
    };
  }

  /**
   * Auto-fix coexistence issue
   */
  async autoFix(issueId: string): Promise<void> {
    const issue = this.issues.get(issueId);
    if (!issue) {
      throw new Error(`Issue ${issueId} not found`);
    }

    console.log(`Auto-fixing coexistence issue: ${issue.type}`);

    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Repair-CoexistenceIssue.ps1',
      ['-IssueId', issueId, '-IssueType', issue.type, '-Fix', '$true'],
      { timeout: 180000 }
    );

    if (!result.success) {
      throw new Error(`Auto-fix failed: ${result.error}`);
    }

    issue.resolvedAt = new Date();
    issue.resolution = 'auto-fixed';

    await this.saveData();

    this.emit('coexistence:issue-resolved', { issueId, issue });
  }

  /**
   * Decommission coexistence
   */
  async decommission(configId: string): Promise<void> {
    const config = this.configurations.get(configId);
    if (!config) {
      throw new Error(`Configuration ${configId} not found`);
    }

    console.log(`Decommissioning coexistence: ${config.name}`);
    config.status = 'decommissioning';

    this.emit('coexistence:decommissioning', { configId });

    try {
      const result = await this.powerShellService.executeScript(
        'Modules/Migration/Remove-Coexistence.ps1',
        ['-ConfigId', configId],
        { timeout: 300000 }
      );

      if (!result.success) {
        throw new Error(`Decommission failed: ${result.error}`);
      }

      config.status = 'decommissioned';
      config.updatedAt = new Date();

      await this.saveData();

      this.emit('coexistence:decommissioned', { configId });
    } catch (error: any) {
      config.status = 'error';
      config.metadata.error = error.message;

      await this.saveData();

      throw error;
    }
  }

  /**
   * Start health monitoring
   */
  private startMonitoring(): void {
    // Check health every 5 minutes
    this.monitoringInterval = setInterval(async () => {
      const activeConfigs = Array.from(this.configurations.values())
        .filter(c => c.status === 'active');

      for (const config of activeConfigs) {
        try {
          await this.checkHealth(config.id);
        } catch (error: any) {
          console.error(`Health check failed for ${config.id}:`, error);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Get configuration
   */
  getConfiguration(configId: string): CoexistenceConfig | null {
    return this.configurations.get(configId) || null;
  }

  /**
   * Get configurations for wave
   */
  getConfigurationsForWave(waveId: string): CoexistenceConfig[] {
    return Array.from(this.configurations.values()).filter(c => c.waveId === waveId);
  }

  /**
   * Get health history
   */
  getHealthHistory(configId: string): CoexistenceHealth[] {
    return this.healthHistory.get(configId) || [];
  }

  /**
   * Get active issues
   */
  getActiveIssues(configId?: string): CoexistenceIssue[] {
    const issues = Array.from(this.issues.values()).filter(i => !i.resolvedAt);

    if (configId) {
      // Filter by affected users in this config
      // This would require linking issues to configs
      return issues;
    }

    return issues;
  }

  /**
   * Save data
   */
  private async saveData(): Promise<void> {
    try {
      await Promise.all([
        fs.writeFile(
          path.join(this.dataDir, 'configurations.json'),
          JSON.stringify(Array.from(this.configurations.values()), null, 2),
          'utf-8'
        ),
        fs.writeFile(
          path.join(this.dataDir, 'issues.json'),
          JSON.stringify(Array.from(this.issues.values()), null, 2),
          'utf-8'
        ),
        fs.writeFile(
          path.join(this.dataDir, 'health-history.json'),
          JSON.stringify(Object.fromEntries(this.healthHistory), null, 2),
          'utf-8'
        ),
      ]);
    } catch (error) {
      console.error('Failed to save coexistence data:', error);
    }
  }

  /**
   * Load data
   */
  private async loadData(): Promise<void> {
    try {
      const [configsData, issuesData, healthData] = await Promise.all([
        fs.readFile(path.join(this.dataDir, 'configurations.json'), 'utf-8').catch(() => '[]'),
        fs.readFile(path.join(this.dataDir, 'issues.json'), 'utf-8').catch(() => '[]'),
        fs.readFile(path.join(this.dataDir, 'health-history.json'), 'utf-8').catch(() => '{}'),
      ]);

      const configs: CoexistenceConfig[] = JSON.parse(configsData);
      const issues: CoexistenceIssue[] = JSON.parse(issuesData);
      const health: Record<string, CoexistenceHealth[]> = JSON.parse(healthData);

      this.configurations.clear();
      for (const config of configs) {
        this.configurations.set(config.id, config);
      }

      this.issues.clear();
      for (const issue of issues) {
        this.issues.set(issue.id, issue);
      }

      this.healthHistory.clear();
      for (const [configId, history] of Object.entries(health)) {
        this.healthHistory.set(configId, history);
      }

      console.log(`Loaded ${this.configurations.size} coexistence configurations`);
    } catch (error) {
      // Data files don't exist yet
    }
  }

  /**
   * Shutdown service
   */
  async shutdown(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    await this.saveData();
  }
}

export default CoexistenceService;
export { CoexistenceType, CoexistenceStatus, CoexistenceConfig, CoexistenceHealth, CoexistenceIssue };
