/**
 * Conflict Resolution Service
 *
 * Handles:
 * - Duplicate user detection (same email, UPN, SID)
 * - Conflicting group memberships
 * - Permission conflicts
 * - Naming conflicts (add suffix, prefix, numbering)
 * - Merge strategies (source wins, target wins, manual)
 * - Conflict resolution workflows
 * - Approval queue for manual resolution
 * - Conflict audit trail
 * - Automatic vs manual resolution modes
 * - Resolution templates
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

import PowerShellExecutionService from './powerShellService';


/**
 * PowerShell script return types for conflict detection
 */
interface ConflictDetectionResult {
  conflicts: Array<{
    type: string;
    severity?: string;
    source: any;
    target?: any;
    related?: any[];
    description: string;
    details?: Record<string, unknown>;
  }>;
}

/**
 * Conflict type
 */
export type ConflictType =
  | 'duplicate-user'
  | 'duplicate-email'
  | 'duplicate-upn'
  | 'duplicate-sid'
  | 'group-membership'
  | 'permission-conflict'
  | 'naming-conflict'
  | 'mailbox-exists'
  | 'license-conflict';

/**
 * Resolution strategy
 */
export type ResolutionStrategy =
  | 'source-wins'
  | 'target-wins'
  | 'merge'
  | 'rename-source'
  | 'rename-target'
  | 'skip'
  | 'manual';

/**
 * Conflict severity
 */
export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Conflict
 */
export interface Conflict {
  id: string;
  waveId: string;
  type: ConflictType;
  severity: ConflictSeverity;
  sourceResource: Resource;
  targetResource?: Resource;
  relatedResources: Resource[];
  description: string;
  details: Record<string, any>;
  suggestedStrategy: ResolutionStrategy;
  status: 'detected' | 'pending-approval' | 'resolved' | 'skipped' | 'failed';
  resolution?: ConflictResolution;
  detectedAt: Date;
  resolvedAt?: Date;
}

/**
 * Resource
 */
interface Resource {
  id: string;
  name: string;
  type: string;
  attributes: Record<string, any>;
}

/**
 * Conflict resolution
 */
export interface ConflictResolution {
  conflictId: string;
  strategy: ResolutionStrategy;
  action: string;
  parameters: Record<string, any>;
  appliedBy: string;
  appliedAt: Date;
  result?: any;
  notes?: string;
}

/**
 * Resolution template
 */
interface ResolutionTemplate {
  id: string;
  name: string;
  description: string;
  conflictType: ConflictType;
  strategy: ResolutionStrategy;
  autoApply: boolean;
  conditions: string[]; // JavaScript expressions
  parameters: Record<string, any>;
}

/**
 * Approval request
 */
interface ApprovalRequest {
  id: string;
  conflictId: string;
  requestedBy: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  comments?: string;
}

/**
 * Conflict Resolution Service
 */
class ConflictResolutionService extends EventEmitter {
  private powerShellService: PowerShellExecutionService;
  private conflicts: Map<string, Conflict>;
  private templates: Map<string, ResolutionTemplate>;
  private approvalQueue: Map<string, ApprovalRequest>;
  private auditLog: ConflictResolution[];
  private dataDir: string;

  constructor(powerShellService: PowerShellExecutionService, dataDir?: string) {
    super();
    this.powerShellService = powerShellService;
    this.conflicts = new Map();
    this.templates = new Map();
    this.approvalQueue = new Map();
    this.auditLog = [];
    this.dataDir = dataDir || path.join(process.cwd(), 'data', 'conflicts');

    this.ensureDataDirectory();
    this.loadData();
  }

  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create conflict data directory:', error);
    }
  }

  /**
   * Detect conflicts for wave
   */
  async detectConflicts(waveId: string, users: string[]): Promise<Conflict[]> {
    console.log(`Detecting conflicts for wave ${waveId} with ${users.length} users`);
    this.emit('detection:started', { waveId, userCount: users.length });

    const detectedConflicts: Conflict[] = [];

    try {
      // Call PowerShell to detect conflicts
      const result = await this.powerShellService.executeScript(
        'Modules/Migration/Find-MigrationConflicts.ps1',
        ['-WaveId', waveId, '-Users', JSON.stringify(users)],
        { timeout: 120000 }
      );

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Conflict detection failed');
      }

      const conflictDetectionData = result.data as ConflictDetectionResult;
      const { conflicts } = conflictDetectionData;

      for (const conflictData of conflicts || []) {
        const conflict: Conflict = {
          id: crypto.randomUUID(),
          waveId,
          type: conflictData.type as ConflictType,
          severity: (conflictData.severity || 'medium') as ConflictSeverity,
          sourceResource: conflictData.source,
          targetResource: conflictData.target,
          relatedResources: conflictData.related || [],
          description: conflictData.description,
          details: conflictData.details || {},
          suggestedStrategy: this.suggestResolutionStrategy(conflictData.type as ConflictType),
          status: 'detected',
          detectedAt: new Date(),
        };

        detectedConflicts.push(conflict);
        this.conflicts.set(conflict.id, conflict);
      }

      await this.saveConflicts();

      this.emit('detection:completed', { waveId, count: detectedConflicts.length });

      return detectedConflicts;
    } catch (error: any) {
      console.error('Conflict detection failed:', error);
      this.emit('detection:failed', { waveId, error: error.message });
      throw error;
    }
  }

  /**
   * Suggest resolution strategy
   */
  private suggestResolutionStrategy(conflictType: ConflictType): ResolutionStrategy {
    switch (conflictType) {
      case 'duplicate-user':
      case 'duplicate-email':
      case 'duplicate-upn':
        return 'rename-source';
      case 'mailbox-exists':
        return 'merge';
      case 'group-membership':
        return 'merge';
      case 'permission-conflict':
        return 'target-wins';
      case 'naming-conflict':
        return 'rename-source';
      default:
        return 'manual';
    }
  }

  /**
   * Resolve conflict
   */
  async resolveConflict(
    conflictId: string,
    strategy: ResolutionStrategy,
    parameters: Record<string, any> = {},
    appliedBy = 'system'
  ): Promise<void> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }

    if (conflict.status === 'resolved') {
      throw new Error('Conflict already resolved');
    }

    console.log(`Resolving conflict ${conflictId} using strategy: ${strategy}`);
    this.emit('resolution:started', { conflictId, strategy });

    try {
      let result: any;

      switch (strategy) {
        case 'source-wins':
          result = await this.applySourceWins(conflict);
          break;
        case 'target-wins':
          result = await this.applyTargetWins(conflict);
          break;
        case 'merge':
          result = await this.applyMerge(conflict, parameters);
          break;
        case 'rename-source':
          result = await this.applyRenameSource(conflict, parameters);
          break;
        case 'rename-target':
          result = await this.applyRenameTarget(conflict, parameters);
          break;
        case 'skip':
          result = { action: 'skipped', message: 'Conflict skipped' };
          conflict.status = 'skipped';
          break;
        case 'manual':
          // Queue for manual approval
          await this.queueForApproval(conflictId, appliedBy);
          return;
        default:
          throw new Error(`Unknown resolution strategy: ${strategy}`);
      }

      // Record resolution
      const resolution: ConflictResolution = {
        conflictId,
        strategy,
        action: result.action || strategy,
        parameters,
        appliedBy,
        appliedAt: new Date(),
        result,
      };

      conflict.resolution = resolution;
      conflict.status = 'resolved';
      conflict.resolvedAt = new Date();

      this.auditLog.push(resolution);
      await this.saveData();

      this.emit('resolution:completed', { conflictId, resolution });
    } catch (error: any) {
      conflict.status = 'failed';
      console.error(`Failed to resolve conflict ${conflictId}:`, error);
      this.emit('resolution:failed', { conflictId, error: error.message });
      throw error;
    }
  }

  /**
   * Apply source wins strategy
   */
  private async applySourceWins(conflict: Conflict): Promise<any> {
    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Resolve-ConflictSourceWins.ps1',
      [
        '-ConflictId', conflict.id,
        '-SourceId', conflict.sourceResource.id,
        '-TargetId', conflict.targetResource?.id || '',
      ],
      { timeout: 60000 }
    );

    if (!result.success) {
      throw new Error(result.error || 'Source wins resolution failed');
    }

    return { action: 'source-wins', ...(result.data as Record<string, unknown>) };
  }

  /**
   * Apply target wins strategy
   */
  private async applyTargetWins(conflict: Conflict): Promise<any> {
    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Resolve-ConflictTargetWins.ps1',
      [
        '-ConflictId', conflict.id,
        '-SourceId', conflict.sourceResource.id,
        '-TargetId', conflict.targetResource?.id || '',
      ],
      { timeout: 60000 }
    );

    if (!result.success) {
      throw new Error(result.error || 'Target wins resolution failed');
    }

    return { action: 'target-wins', ...(result.data as Record<string, unknown>) };
  }

  /**
   * Apply merge strategy
   */
  private async applyMerge(conflict: Conflict, parameters: Record<string, any>): Promise<any> {
    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Resolve-ConflictMerge.ps1',
      [
        '-ConflictId', conflict.id,
        '-SourceId', conflict.sourceResource.id,
        '-TargetId', conflict.targetResource?.id || '',
        '-MergeStrategy', parameters.mergeStrategy || 'smart',
      ],
      { timeout: 60000 }
    );

    if (!result.success) {
      throw new Error(result.error || 'Merge resolution failed');
    }

    return { action: 'merge', ...(result.data as Record<string, unknown>) };
  }

  /**
   * Apply rename source strategy
   */
  private async applyRenameSource(conflict: Conflict, parameters: Record<string, any>): Promise<any> {
    const newName = parameters.newName || this.generateUniqueName(
      conflict.sourceResource.name,
      parameters.suffix || '_migrated',
      parameters.prefix || '',
      parameters.numberSuffix !== false
    );

    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Rename-SourceResource.ps1',
      [
        '-ConflictId', conflict.id,
        '-SourceId', conflict.sourceResource.id,
        '-NewName', newName,
      ],
      { timeout: 60000 }
    );

    if (!result.success) {
      throw new Error(result.error || 'Rename source resolution failed');
    }

    return { action: 'rename-source', newName, ...(result.data as Record<string, unknown>) };
  }

  /**
   * Apply rename target strategy
   */
  private async applyRenameTarget(conflict: Conflict, parameters: Record<string, any>): Promise<any> {
    if (!conflict.targetResource) {
      throw new Error('No target resource to rename');
    }

    const newName = parameters.newName || this.generateUniqueName(
      conflict.targetResource.name,
      parameters.suffix || '_existing',
      parameters.prefix || '',
      parameters.numberSuffix !== false
    );

    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Rename-TargetResource.ps1',
      [
        '-ConflictId', conflict.id,
        '-TargetId', conflict.targetResource.id,
        '-NewName', newName,
      ],
      { timeout: 60000 }
    );

    if (!result.success) {
      throw new Error(result.error || 'Rename target resolution failed');
    }

    return { action: 'rename-target', newName, ...(result.data as Record<string, unknown>) };
  }

  /**
   * Generate unique name
   */
  private generateUniqueName(
    baseName: string,
    suffix = '',
    prefix = '',
    addNumber = true
  ): string {
    let name = `${prefix}${baseName}${suffix}`;

    if (addNumber) {
      const timestamp = Date.now().toString().slice(-6);
      name = `${name}_${timestamp}`;
    }

    return name;
  }

  /**
   * Auto-resolve conflicts using templates
   */
  async autoResolveConflicts(waveId: string): Promise<void> {
    const waveConflicts = Array.from(this.conflicts.values()).filter(
      c => c.waveId === waveId && c.status === 'detected'
    );

    console.log(`Auto-resolving ${waveConflicts.length} conflicts for wave ${waveId}`);
    this.emit('autoresolve:started', { waveId, count: waveConflicts.length });

    let resolvedCount = 0;
    let failedCount = 0;

    for (const conflict of waveConflicts) {
      // Find matching template
      const template = this.findMatchingTemplate(conflict);

      if (template && template.autoApply) {
        try {
          await this.resolveConflict(conflict.id, template.strategy, template.parameters, 'auto-resolver');
          resolvedCount++;
        } catch (error: any) {
          console.error(`Auto-resolve failed for conflict ${conflict.id}:`, error);
          failedCount++;
        }
      }
    }

    this.emit('autoresolve:completed', { waveId, resolved: resolvedCount, failed: failedCount });
  }

  /**
   * Find matching template
   */
  private findMatchingTemplate(conflict: Conflict): ResolutionTemplate | null {
    for (const template of this.templates.values()) {
      if (template.conflictType === conflict.type) {
        // Check conditions
        if (this.evaluateConditions(template.conditions, conflict)) {
          return template;
        }
      }
    }
    return null;
  }

  /**
   * Evaluate template conditions
   */
  private evaluateConditions(conditions: string[], conflict: Conflict): boolean {
    // Simplified condition evaluation
    // In production, would use a safe expression evaluator
    return conditions.length === 0; // Auto-apply if no conditions
  }

  /**
   * Queue conflict for manual approval
   */
  private async queueForApproval(conflictId: string, requestedBy: string): Promise<void> {
    const request: ApprovalRequest = {
      id: crypto.randomUUID(),
      conflictId,
      requestedBy,
      requestedAt: new Date(),
      status: 'pending',
    };

    this.approvalQueue.set(request.id, request);

    const conflict = this.conflicts.get(conflictId);
    if (conflict) {
      conflict.status = 'pending-approval';
    }

    await this.saveData();

    this.emit('approval:requested', { requestId: request.id, conflictId });
  }

  /**
   * Approve conflict resolution
   */
  async approveResolution(
    requestId: string,
    approvedBy: string,
    strategy: ResolutionStrategy,
    parameters: Record<string, any> = {},
    comments?: string
  ): Promise<void> {
    const request = this.approvalQueue.get(requestId);
    if (!request) {
      throw new Error(`Approval request ${requestId} not found`);
    }

    request.status = 'approved';
    request.approvedBy = approvedBy;
    request.approvedAt = new Date();
    request.comments = comments;

    await this.saveData();

    // Resolve the conflict
    await this.resolveConflict(request.conflictId, strategy, parameters, approvedBy);

    this.emit('approval:granted', { requestId, conflictId: request.conflictId });
  }

  /**
   * Reject conflict resolution
   */
  async rejectResolution(requestId: string, rejectedBy: string, comments?: string): Promise<void> {
    const request = this.approvalQueue.get(requestId);
    if (!request) {
      throw new Error(`Approval request ${requestId} not found`);
    }

    request.status = 'rejected';
    request.approvedBy = rejectedBy;
    request.approvedAt = new Date();
    request.comments = comments;

    const conflict = this.conflicts.get(request.conflictId);
    if (conflict) {
      conflict.status = 'detected';
    }

    await this.saveData();

    this.emit('approval:rejected', { requestId, conflictId: request.conflictId });
  }

  /**
   * Create resolution template
   */
  async createTemplate(template: Omit<ResolutionTemplate, 'id'>): Promise<ResolutionTemplate> {
    const newTemplate: ResolutionTemplate = {
      ...template,
      id: crypto.randomUUID(),
    };

    this.templates.set(newTemplate.id, newTemplate);
    await this.saveData();

    return newTemplate;
  }

  /**
   * Get conflicts
   */
  getConflicts(waveId?: string, type?: ConflictType, status?: string): Conflict[] {
    let conflicts = Array.from(this.conflicts.values());

    if (waveId) {
      conflicts = conflicts.filter(c => c.waveId === waveId);
    }

    if (type) {
      conflicts = conflicts.filter(c => c.type === type);
    }

    if (status) {
      conflicts = conflicts.filter(c => c.status === status);
    }

    return conflicts;
  }

  /**
   * Get approval queue
   */
  getApprovalQueue(status?: 'pending' | 'approved' | 'rejected'): ApprovalRequest[] {
    const requests = Array.from(this.approvalQueue.values());

    if (status) {
      return requests.filter(r => r.status === status);
    }

    return requests;
  }

  /**
   * Get audit log
   */
  getAuditLog(conflictId?: string): ConflictResolution[] {
    if (conflictId) {
      return this.auditLog.filter(r => r.conflictId === conflictId);
    }
    return this.auditLog;
  }

  /**
   * Save data
   */
  private async saveData(): Promise<void> {
    try {
      await Promise.all([
        this.saveConflicts(),
        fs.writeFile(
          path.join(this.dataDir, 'templates.json'),
          JSON.stringify(Array.from(this.templates.values()), null, 2),
          'utf-8'
        ),
        fs.writeFile(
          path.join(this.dataDir, 'approvals.json'),
          JSON.stringify(Array.from(this.approvalQueue.values()), null, 2),
          'utf-8'
        ),
        fs.writeFile(
          path.join(this.dataDir, 'audit.json'),
          JSON.stringify(this.auditLog, null, 2),
          'utf-8'
        ),
      ]);
    } catch (error) {
      console.error('Failed to save conflict data:', error);
    }
  }

  private async saveConflicts(): Promise<void> {
    await fs.writeFile(
      path.join(this.dataDir, 'conflicts.json'),
      JSON.stringify(Array.from(this.conflicts.values()), null, 2),
      'utf-8'
    );
  }

  /**
   * Load data
   */
  private async loadData(): Promise<void> {
    try {
      const [conflictsData, templatesData, approvalsData, auditData] = await Promise.all([
        fs.readFile(path.join(this.dataDir, 'conflicts.json'), 'utf-8').catch(() => '[]'),
        fs.readFile(path.join(this.dataDir, 'templates.json'), 'utf-8').catch(() => '[]'),
        fs.readFile(path.join(this.dataDir, 'approvals.json'), 'utf-8').catch(() => '[]'),
        fs.readFile(path.join(this.dataDir, 'audit.json'), 'utf-8').catch(() => '[]'),
      ]);

      const conflicts: Conflict[] = JSON.parse(conflictsData);
      const templates: ResolutionTemplate[] = JSON.parse(templatesData);
      const approvals: ApprovalRequest[] = JSON.parse(approvalsData);
      this.auditLog = JSON.parse(auditData);

      this.conflicts.clear();
      for (const conflict of conflicts) {
        this.conflicts.set(conflict.id, conflict);
      }

      this.templates.clear();
      for (const template of templates) {
        this.templates.set(template.id, template);
      }

      this.approvalQueue.clear();
      for (const approval of approvals) {
        this.approvalQueue.set(approval.id, approval);
      }

      console.log(`Loaded ${this.conflicts.size} conflicts, ${this.templates.size} templates`);
    } catch (error) {
      // Data files don't exist yet
    }
  }
}

export default ConflictResolutionService;
