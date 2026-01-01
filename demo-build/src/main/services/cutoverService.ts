/**
 * Cutover Service
 *
 * Cutover automation with:
 * - Pre-cutover checklist validation
 * - Cutover window management (scheduled time)
 * - DNS/MX record updates
 * - Mailbox redirection
 * - Source decommissioning steps
 * - Target activation steps
 * - Communication templates (user notifications)
 * - Cutover rollback plan
 * - Cutover status dashboard
 * - Post-cutover validation
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

import PowerShellExecutionService from './powerShellService';

/**
 * PowerShell script return types for cutover operations
 */
interface PostCutoverValidationResult {
  passed: boolean;
  warnings: string[];
}

/**
 * Cutover phase
 */
export type CutoverPhase =
  | 'planning'
  | 'pre-cutover'
  | 'cutover-window'
  | 'dns-update'
  | 'mailbox-redirect'
  | 'activation'
  | 'decommission'
  | 'post-validation'
  | 'completed'
  | 'rolled-back';

/**
 * Cutover status
 */
export type CutoverStatus = 'planned' | 'in-progress' | 'completed' | 'failed' | 'rolled-back';

/**
 * Cutover plan
 */
export interface CutoverPlan {
  id: string;
  waveId: string;
  name: string;
  description: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  status: CutoverStatus;
  currentPhase: CutoverPhase;
  checklist: ChecklistItem[];
  dnsRecords: DNSRecord[];
  notifications: NotificationTemplate[];
  rollbackPlan: RollbackStep[];
  metadata: Record<string, any>;
}

/**
 * Checklist item
 */
interface ChecklistItem {
  id: string;
  phase: CutoverPhase;
  name: string;
  description: string;
  required: boolean;
  completed: boolean;
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
}

/**
 * DNS record
 */
interface DNSRecord {
  id: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'SPF';
  name: string;
  currentValue: string;
  newValue: string;
  ttl: number;
  updated: boolean;
  updatedAt?: Date;
}

/**
 * Notification template
 */
interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'teams' | 'sms';
  recipients: string[];
  subject: string;
  body: string;
  sendAt: 'pre-cutover' | 'cutover-start' | 'cutover-end' | 'post-validation';
  sent: boolean;
  sentAt?: Date;
}

/**
 * Rollback step
 */
interface RollbackStep {
  id: string;
  phase: CutoverPhase;
  action: string;
  scriptPath: string;
  parameters: Record<string, any>;
  executed: boolean;
}

/**
 * Cutover result
 */
interface CutoverResult {
  planId: string;
  success: boolean;
  startTime: Date;
  endTime: Date;
  duration: number;
  phasesCompleted: CutoverPhase[];
  phasesFailed: CutoverPhase[];
  errors: string[];
  warnings: string[];
}

/**
 * Cutover Service
 */
class CutoverService extends EventEmitter {
  private powerShellService: PowerShellExecutionService;
  private cutoverPlans: Map<string, CutoverPlan>;
  private dataDir: string;

  constructor(powerShellService: PowerShellExecutionService, dataDir?: string) {
    super();
    this.powerShellService = powerShellService;
    this.cutoverPlans = new Map();
    this.dataDir = dataDir || path.join(process.cwd(), 'data', 'cutover');

    this.ensureDataDirectory();
    this.loadCutoverPlans();
  }

  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create cutover data directory:', error);
    }
  }

  /**
   * Create cutover plan
   */
  async createCutoverPlan(plan: Omit<CutoverPlan, 'id' | 'status' | 'currentPhase'>): Promise<CutoverPlan> {
    const cutoverPlan: CutoverPlan = {
      ...plan,
      id: crypto.randomUUID(),
      status: 'planned',
      currentPhase: 'planning',
    };

    this.cutoverPlans.set(cutoverPlan.id, cutoverPlan);
    await this.saveCutoverPlans();

    this.emit('cutover:planned', { plan: cutoverPlan });

    return cutoverPlan;
  }

  /**
   * Execute cutover
   */
  async executeCutover(planId: string): Promise<CutoverResult> {
    const plan = this.cutoverPlans.get(planId);
    if (!plan) {
      throw new Error(`Cutover plan ${planId} not found`);
    }

    const startTime = new Date();
    const errors: string[] = [];
    const warnings: string[] = [];
    const phasesCompleted: CutoverPhase[] = [];
    const phasesFailed: CutoverPhase[] = [];

    console.log(`Executing cutover: ${plan.name}`);
    this.emit('cutover:started', { planId, plan });

    plan.status = 'in-progress';
    plan.actualStart = startTime;

    try {
      // Phase 1: Pre-cutover validation
      await this.executePhase(plan, 'pre-cutover');
      phasesCompleted.push('pre-cutover');

      // Phase 2: Wait for cutover window
      await this.waitForCutoverWindow(plan);
      phasesCompleted.push('cutover-window');

      // Phase 3: Send pre-cutover notifications
      await this.sendNotifications(plan, 'pre-cutover');

      // Phase 4: Send cutover start notifications
      await this.sendNotifications(plan, 'cutover-start');

      // Phase 5: Update DNS records
      await this.executePhase(plan, 'dns-update');
      await this.updateDNSRecords(plan);
      phasesCompleted.push('dns-update');

      // Phase 6: Configure mailbox redirection
      await this.executePhase(plan, 'mailbox-redirect');
      await this.configureMailboxRedirection(plan);
      phasesCompleted.push('mailbox-redirect');

      // Phase 7: Activate target environment
      await this.executePhase(plan, 'activation');
      await this.activateTargetEnvironment(plan);
      phasesCompleted.push('activation');

      // Phase 8: Decommission source (if specified)
      if (plan.metadata.decommissionSource) {
        await this.executePhase(plan, 'decommission');
        await this.decommissionSource(plan);
        phasesCompleted.push('decommission');
      }

      // Phase 9: Post-cutover validation
      await this.executePhase(plan, 'post-validation');
      const validationResult = await this.validatePostCutover(plan);
      if (!validationResult.passed) {
        warnings.push(...validationResult.warnings);
      }
      phasesCompleted.push('post-validation');

      // Phase 10: Send completion notifications
      await this.sendNotifications(plan, 'cutover-end');
      await this.sendNotifications(plan, 'post-validation');

      plan.status = 'completed';
      plan.currentPhase = 'completed';
      plan.actualEnd = new Date();

      await this.saveCutoverPlans();

      const result: CutoverResult = {
        planId,
        success: true,
        startTime,
        endTime: new Date(),
        duration: Date.now() - startTime.getTime(),
        phasesCompleted,
        phasesFailed,
        errors,
        warnings,
      };

      this.emit('cutover:completed', { result });

      return result;
    } catch (error: any) {
      console.error('Cutover failed:', error);
      errors.push(error.message);
      phasesFailed.push(plan.currentPhase);

      plan.status = 'failed';

      // Execute rollback if configured
      if (plan.rollbackPlan.length > 0) {
        await this.executeRollback(plan);
      }

      const result: CutoverResult = {
        planId,
        success: false,
        startTime,
        endTime: new Date(),
        duration: Date.now() - startTime.getTime(),
        phasesCompleted,
        phasesFailed,
        errors,
        warnings,
      };

      this.emit('cutover:failed', { result });

      return result;
    }
  }

  /**
   * Execute cutover phase
   */
  private async executePhase(plan: CutoverPlan, phase: CutoverPhase): Promise<void> {
    plan.currentPhase = phase;
    console.log(`Executing cutover phase: ${phase}`);
    this.emit('cutover:phase-started', { planId: plan.id, phase });

    // Get checklist items for this phase
    const checklistItems = plan.checklist.filter(item => item.phase === phase);

    for (const item of checklistItems) {
      if (item.required && !item.completed) {
        throw new Error(`Required checklist item not completed: ${item.name}`);
      }
    }

    this.emit('cutover:phase-completed', { planId: plan.id, phase });
  }

  /**
   * Wait for cutover window
   */
  private async waitForCutoverWindow(plan: CutoverPlan): Promise<void> {
    const now = Date.now();
    const scheduledStart = plan.scheduledStart.getTime();

    if (now < scheduledStart) {
      const waitTime = scheduledStart - now;
      console.log(`Waiting for cutover window: ${waitTime}ms`);

      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    console.log('Cutover window opened');
    this.emit('cutover:window-opened', { planId: plan.id });
  }

  /**
   * Update DNS records
   */
  private async updateDNSRecords(plan: CutoverPlan): Promise<void> {
    console.log(`Updating ${plan.dnsRecords.length} DNS records`);

    for (const record of plan.dnsRecords) {
      try {
        const result = await this.powerShellService.executeScript(
          'Modules/Migration/Update-DNSRecord.ps1',
          [
            '-Type', record.type,
            '-Name', record.name,
            '-OldValue', record.currentValue,
            '-NewValue', record.newValue,
            '-TTL', record.ttl.toString(),
          ],
          { timeout: 60000 }
        );

        if (!result.success) {
          throw new Error(`Failed to update DNS record ${record.name}: ${result.error}`);
        }

        record.updated = true;
        record.updatedAt = new Date();

        this.emit('cutover:dns-updated', { planId: plan.id, record });
      } catch (error: any) {
        console.error(`DNS update failed for ${record.name}:`, error);
        throw error;
      }
    }
  }

  /**
   * Configure mailbox redirection
   */
  private async configureMailboxRedirection(plan: CutoverPlan): Promise<void> {
    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Set-MailboxRedirection.ps1',
      ['-WaveId', plan.waveId, '-Enable', '$true'],
      { timeout: 180000 }
    );

    if (!result.success) {
      throw new Error(`Mailbox redirection failed: ${result.error}`);
    }

    console.log('Mailbox redirection configured');
    this.emit('cutover:redirection-configured', { planId: plan.id });
  }

  /**
   * Activate target environment
   */
  private async activateTargetEnvironment(plan: CutoverPlan): Promise<void> {
    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Enable-TargetEnvironment.ps1',
      ['-WaveId', plan.waveId],
      { timeout: 300000 }
    );

    if (!result.success) {
      throw new Error(`Target activation failed: ${result.error}`);
    }

    console.log('Target environment activated');
    this.emit('cutover:target-activated', { planId: plan.id });
  }

  /**
   * Decommission source
   */
  private async decommissionSource(plan: CutoverPlan): Promise<void> {
    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Disable-SourceEnvironment.ps1',
      ['-WaveId', plan.waveId, '-Confirm', '$false'],
      { timeout: 300000 }
    );

    if (!result.success) {
      throw new Error(`Source decommission failed: ${result.error}`);
    }

    console.log('Source environment decommissioned');
    this.emit('cutover:source-decommissioned', { planId: plan.id });
  }

  /**
   * Validate post-cutover
   */
  private async validatePostCutover(plan: CutoverPlan): Promise<{
    passed: boolean;
    warnings: string[];
  }> {
    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Test-PostCutover.ps1',
      ['-WaveId', plan.waveId],
      { timeout: 180000 }
    );

    if (!result.success || !result.data) {
      return { passed: false, warnings: [result.error || 'Validation failed'] };
    }

    const validationData = result.data as PostCutoverValidationResult;
    return {
      passed: validationData.passed !== false,
      warnings: validationData.warnings || [],
    };
  }

  /**
   * Send notifications
   */
  private async sendNotifications(
    plan: CutoverPlan,
    stage: 'pre-cutover' | 'cutover-start' | 'cutover-end' | 'post-validation'
  ): Promise<void> {
    const notifications = plan.notifications.filter(n => n.sendAt === stage && !n.sent);

    for (const notification of notifications) {
      try {
        const result = await this.powerShellService.executeScript(
          'Modules/Migration/Send-Notification.ps1',
          [
            '-Type', notification.type,
            '-Recipients', JSON.stringify(notification.recipients),
            '-Subject', notification.subject,
            '-Body', notification.body,
          ],
          { timeout: 30000 }
        );

        if (result.success) {
          notification.sent = true;
          notification.sentAt = new Date();
        }

        this.emit('cutover:notification-sent', { planId: plan.id, notification });
      } catch (error: any) {
        console.error(`Failed to send notification ${notification.name}:`, error);
      }
    }

    await this.saveCutoverPlans();
  }

  /**
   * Execute rollback
   */
  private async executeRollback(plan: CutoverPlan): Promise<void> {
    console.log(`Executing cutover rollback for ${plan.name}`);
    this.emit('cutover:rollback-started', { planId: plan.id });

    // Execute rollback steps in reverse order
    const steps = [...plan.rollbackPlan].reverse();

    for (const step of steps) {
      try {
        const result = await this.powerShellService.executeScript(
          step.scriptPath,
          this.buildScriptArgs(step.parameters),
          { timeout: 300000 }
        );

        if (!result.success) {
          console.error(`Rollback step failed: ${step.action}`);
        }

        step.executed = true;
      } catch (error: any) {
        console.error(`Rollback step failed: ${step.action}`, error);
      }
    }

    plan.status = 'rolled-back';
    plan.currentPhase = 'rolled-back';
    await this.saveCutoverPlans();

    this.emit('cutover:rollback-completed', { planId: plan.id });
  }

  /**
   * Update checklist item
   */
  async updateChecklistItem(
    planId: string,
    itemId: string,
    updates: { completed?: boolean; notes?: string; completedBy?: string }
  ): Promise<void> {
    const plan = this.cutoverPlans.get(planId);
    if (!plan) {
      throw new Error(`Cutover plan ${planId} not found`);
    }

    const item = plan.checklist.find(i => i.id === itemId);
    if (!item) {
      throw new Error(`Checklist item ${itemId} not found`);
    }

    if (updates.completed !== undefined) {
      item.completed = updates.completed;
      item.completedAt = updates.completed ? new Date() : undefined;
    }

    if (updates.notes !== undefined) {
      item.notes = updates.notes;
    }

    if (updates.completedBy !== undefined) {
      item.completedBy = updates.completedBy;
    }

    await this.saveCutoverPlans();

    this.emit('cutover:checklist-updated', { planId, itemId, item });
  }

  /**
   * Get cutover plan
   */
  getCutoverPlan(planId: string): CutoverPlan | null {
    return this.cutoverPlans.get(planId) || null;
  }

  /**
   * Get cutover plans for wave
   */
  getCutoverPlansForWave(waveId: string): CutoverPlan[] {
    return Array.from(this.cutoverPlans.values()).filter(p => p.waveId === waveId);
  }

  /**
   * Build script arguments
   */
  private buildScriptArgs(parameters: Record<string, any>): string[] {
    const args: string[] = [];
    for (const [key, value] of Object.entries(parameters)) {
      args.push(`-${key}`, typeof value === 'object' ? JSON.stringify(value) : String(value));
    }
    return args;
  }

  /**
   * Save cutover plans
   */
  private async saveCutoverPlans(): Promise<void> {
    try {
      const plans = Array.from(this.cutoverPlans.values());
      const filepath = path.join(this.dataDir, 'cutover-plans.json');
      await fs.writeFile(filepath, JSON.stringify(plans, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save cutover plans:', error);
    }
  }

  /**
   * Load cutover plans
   */
  private async loadCutoverPlans(): Promise<void> {
    try {
      const filepath = path.join(this.dataDir, 'cutover-plans.json');
      const content = await fs.readFile(filepath, 'utf-8');
      const plans: CutoverPlan[] = JSON.parse(content);

      this.cutoverPlans.clear();
      for (const plan of plans) {
        this.cutoverPlans.set(plan.id, plan);
      }

      console.log(`Loaded ${this.cutoverPlans.size} cutover plans`);
    } catch (error) {
      // File doesn't exist yet
    }
  }
}

export default CutoverService;


