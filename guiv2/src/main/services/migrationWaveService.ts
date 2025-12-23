/**
 * Migration Wave Service
 *
 * Manages migration waves for inventory-based planning.
 * Handles wave creation, entity assignment, and execution tracking.
 */

import { v4 as uuidv4 } from 'uuid';
import { inventoryService } from './inventoryService';

// Type definitions (matching migrationWavePlanning.ts)
type WavePlanningStatus = 'DRAFT' | 'PROPOSED' | 'APPROVED' | 'SCHEDULED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
type WaveAssignmentReason = 'DEPENDENCY' | 'GROUP_MEMBER' | 'APP_USER' | 'MANUAL' | 'PILOT' | 'PRIORITY' | 'COMPLEXITY' | 'DEPARTMENT' | 'LOCATION' | 'READINESS';
type MigrationPriority = 'Low' | 'Normal' | 'High' | 'Critical';
type InventoryEntityType = 'USER' | 'GROUP' | 'APPLICATION' | 'INFRASTRUCTURE' | 'MAILBOX' | 'SHAREPOINT_SITE' | 'TEAMS_TEAM' | 'DEVICE' | 'SERVER' | 'DATABASE' | 'VIRTUAL_MACHINE' | 'STORAGE' | 'NETWORK_RESOURCE';

interface InventoryMigrationWave {
  id: string;
  sourceProfileId: string;
  targetProfileId: string;
  name: string;
  description?: string;
  order: number;
  priority: MigrationPriority;
  status: WavePlanningStatus;
  plannedStartDate?: string;
  plannedCutoverDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  prerequisites: WavePrerequisite[];
  goNoGoCriteria: GoNoGoCriterion[];
  notes?: string;
  tags: string[];
  metadata: Record<string, any>;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface WaveAssignment {
  id: string;
  waveId: string;
  inventoryEntityId: string;
  assignmentReason: WaveAssignmentReason;
  reasonDetails?: string;
  inWaveDependencies: string[];
  priorWaveDependencies: string[];
  order?: number;
  estimatedDuration?: number;
  status: 'PENDING' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface WavePrerequisite {
  id: string;
  title: string;
  description?: string;
  category: 'TECHNICAL' | 'BUSINESS' | 'COMMUNICATION' | 'APPROVAL' | 'TRAINING';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'WAIVED';
  assignedTo?: string;
  dueDate?: string;
  completedAt?: string;
  isBlocking: boolean;
  notes?: string;
}

interface GoNoGoCriterion {
  id: string;
  title: string;
  description?: string;
  category: 'TECHNICAL' | 'BUSINESS' | 'SECURITY' | 'COMPLIANCE';
  evaluationType: 'AUTOMATIC' | 'MANUAL';
  evaluationScript?: string;
  status: 'NOT_EVALUATED' | 'PASS' | 'FAIL' | 'WARNING' | 'WAIVED';
  evaluatedAt?: string;
  evaluatedBy?: string;
  notes?: string;
  isBlocking: boolean;
}

interface WaveSummary {
  waveId: string;
  waveName: string;
  status: WavePlanningStatus;
  entityCountsByType: Record<InventoryEntityType, number>;
  totalEntities: number;
  entitiesByStatus: {
    pending: number;
    ready: number;
    inProgress: number;
    completed: number;
    failed: number;
    skipped: number;
  };
  averageReadinessScore: number;
  averageRiskScore: number;
  blockingIssuesCount: number;
  blockers: WaveBlocker[];
  prerequisitesSummary: {
    total: number;
    completed: number;
    pending: number;
    blocked: number;
  };
  goNoGoSummary: {
    total: number;
    passed: number;
    failed: number;
    notEvaluated: number;
  };
  estimatedDuration?: number;
  actualDuration?: number;
  progressPercentage: number;
}

interface WaveBlocker {
  type: 'MISSING_DEPENDENCY' | 'FAILED_PREREQUISITE' | 'LOW_READINESS' | 'HIGH_RISK' | 'UNRESOLVED_CONFLICT' | 'PRIOR_WAVE_INCOMPLETE';
  entityId?: string;
  entityName?: string;
  description: string;
  severity: 'WARNING' | 'ERROR' | 'BLOCKING';
  suggestedResolution?: string;
}

interface WaveSuggestion {
  waveName: string;
  order: number;
  entityIds: string[];
  rationale: string;
  entityTypes: InventoryEntityType[];
  estimatedComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
  priorWaveDependencies: string[];
  confidence: number;
}

interface WaveFilter {
  sourceProfileId?: string;
  targetProfileId?: string;
  statuses?: WavePlanningStatus[];
}

/**
 * MigrationWaveService - Manages wave-based migration planning
 */
export class MigrationWaveService {
  private waves: Map<string, InventoryMigrationWave> = new Map();
  private assignments: Map<string, WaveAssignment[]> = new Map(); // waveId -> assignments

  // ========================================
  // Wave CRUD Operations
  // ========================================

  /**
   * Create a new migration wave
   */
  async createWave(
    waveData: Omit<InventoryMigrationWave, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<InventoryMigrationWave> {
    const wave: InventoryMigrationWave = {
      ...waveData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.waves.set(wave.id, wave);
    this.assignments.set(wave.id, []);

    console.log(`[MigrationWaveService] Created wave: ${wave.name} (order: ${wave.order})`);
    return wave;
  }

  /**
   * Get waves with filtering
   */
  async getWaves(filter?: WaveFilter): Promise<InventoryMigrationWave[]> {
    let waves = Array.from(this.waves.values());

    if (filter) {
      if (filter.sourceProfileId) {
        waves = waves.filter(w => w.sourceProfileId === filter.sourceProfileId);
      }
      if (filter.targetProfileId) {
        waves = waves.filter(w => w.targetProfileId === filter.targetProfileId);
      }
      if (filter.statuses && filter.statuses.length > 0) {
        waves = waves.filter(w => filter.statuses!.includes(w.status));
      }
    }

    // Sort by order
    waves.sort((a, b) => a.order - b.order);

    return waves;
  }

  /**
   * Get a single wave by ID
   */
  async getWave(id: string): Promise<InventoryMigrationWave | null> {
    return this.waves.get(id) || null;
  }

  /**
   * Update a wave
   */
  async updateWave(
    id: string,
    updates: Partial<InventoryMigrationWave>
  ): Promise<InventoryMigrationWave | null> {
    const wave = this.waves.get(id);
    if (!wave) return null;

    const updatedWave: InventoryMigrationWave = {
      ...wave,
      ...updates,
      id: wave.id,
      createdAt: wave.createdAt,
      updatedAt: new Date().toISOString(),
    };

    this.waves.set(id, updatedWave);
    return updatedWave;
  }

  /**
   * Delete a wave
   */
  async deleteWave(id: string): Promise<boolean> {
    const wave = this.waves.get(id);
    if (!wave) return false;

    // Unassign all entities from this wave
    const assignments = this.assignments.get(id) || [];
    for (const assignment of assignments) {
      await inventoryService.updateEntity(assignment.inventoryEntityId, {
        waveId: undefined,
        status: 'MIGRATION_READY',
      });
    }

    this.waves.delete(id);
    this.assignments.delete(id);

    console.log(`[MigrationWaveService] Deleted wave: ${wave.name}`);
    return true;
  }

  // ========================================
  // Wave Assignment Operations
  // ========================================

  /**
   * Assign entities to a wave
   */
  async assignEntitiesToWave(
    waveId: string,
    entityIds: string[],
    reason: WaveAssignmentReason = 'MANUAL',
    reasonDetails?: string
  ): Promise<{ assigned: number; failed: { entityId: string; reason: string }[] }> {
    const wave = this.waves.get(waveId);
    if (!wave) {
      return {
        assigned: 0,
        failed: entityIds.map(id => ({ entityId: id, reason: 'Wave not found' })),
      };
    }

    let assigned = 0;
    const failed: { entityId: string; reason: string }[] = [];

    for (const entityId of entityIds) {
      try {
        // Check if already assigned to another wave
        const entity = await inventoryService.getEntity(entityId);
        if (!entity) {
          failed.push({ entityId, reason: 'Entity not found' });
          continue;
        }

        if (entity.waveId && entity.waveId !== waveId) {
          failed.push({ entityId, reason: `Already assigned to wave ${entity.waveId}` });
          continue;
        }

        // Create assignment
        const assignment: WaveAssignment = {
          id: uuidv4(),
          waveId,
          inventoryEntityId: entityId,
          assignmentReason: reason,
          reasonDetails,
          inWaveDependencies: [],
          priorWaveDependencies: [],
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (!this.assignments.has(waveId)) {
          this.assignments.set(waveId, []);
        }
        this.assignments.get(waveId)!.push(assignment);

        // Update entity
        await inventoryService.updateEntity(entityId, {
          waveId,
          status: 'MIGRATION_PLANNED',
        });

        assigned++;
      } catch (error) {
        failed.push({ entityId, reason: (error as Error).message });
      }
    }

    console.log(`[MigrationWaveService] Assigned ${assigned} entities to wave ${wave.name}`);
    return { assigned, failed };
  }

  /**
   * Unassign entities from a wave
   */
  async unassignEntitiesFromWave(
    waveId: string,
    entityIds: string[]
  ): Promise<{ unassigned: number }> {
    const assignments = this.assignments.get(waveId) || [];
    const remaining = assignments.filter(a => !entityIds.includes(a.inventoryEntityId));
    this.assignments.set(waveId, remaining);

    let unassigned = 0;
    for (const entityId of entityIds) {
      const entity = await inventoryService.getEntity(entityId);
      if (entity && entity.waveId === waveId) {
        await inventoryService.updateEntity(entityId, {
          waveId: undefined,
          status: 'MIGRATION_READY',
        });
        unassigned++;
      }
    }

    return { unassigned };
  }

  /**
   * Get assignments for a wave
   */
  async getWaveAssignments(waveId: string): Promise<WaveAssignment[]> {
    return this.assignments.get(waveId) || [];
  }

  /**
   * Update assignment status
   */
  async updateAssignmentStatus(
    waveId: string,
    entityId: string,
    status: WaveAssignment['status']
  ): Promise<WaveAssignment | null> {
    const assignments = this.assignments.get(waveId) || [];
    const assignment = assignments.find(a => a.inventoryEntityId === entityId);

    if (!assignment) return null;

    assignment.status = status;
    assignment.updatedAt = new Date().toISOString();

    return assignment;
  }

  // ========================================
  // Wave Summary and Statistics
  // ========================================

  /**
   * Get wave summary with statistics
   */
  async getWaveSummary(waveId: string): Promise<WaveSummary | null> {
    const wave = this.waves.get(waveId);
    if (!wave) return null;

    const assignments = this.assignments.get(waveId) || [];
    const entityIds = assignments.map(a => a.inventoryEntityId);

    // Get entities for this wave
    const entities = await inventoryService.getEntities({
      waveId,
    });

    // Calculate statistics
    const entityCountsByType: Record<InventoryEntityType, number> = {} as any;
    let totalReadiness = 0;
    let totalRisk = 0;
    let readinessCount = 0;
    let riskCount = 0;

    const entitiesByStatus = {
      pending: 0,
      ready: 0,
      inProgress: 0,
      completed: 0,
      failed: 0,
      skipped: 0,
    };

    for (const entity of entities) {
      entityCountsByType[entity.entityType] = (entityCountsByType[entity.entityType] || 0) + 1;

      if (typeof entity.readinessScore === 'number') {
        totalReadiness += entity.readinessScore;
        readinessCount++;
      }
      if (typeof entity.riskScore === 'number') {
        totalRisk += entity.riskScore;
        riskCount++;
      }
    }

    // Map assignment statuses
    for (const assignment of assignments) {
      switch (assignment.status) {
        case 'PENDING':
          entitiesByStatus.pending++;
          break;
        case 'READY':
          entitiesByStatus.ready++;
          break;
        case 'IN_PROGRESS':
          entitiesByStatus.inProgress++;
          break;
        case 'COMPLETED':
          entitiesByStatus.completed++;
          break;
        case 'FAILED':
          entitiesByStatus.failed++;
          break;
        case 'SKIPPED':
          entitiesByStatus.skipped++;
          break;
      }
    }

    // Prerequisites summary
    const prerequisitesSummary = {
      total: wave.prerequisites.length,
      completed: wave.prerequisites.filter(p => p.status === 'COMPLETED').length,
      pending: wave.prerequisites.filter(p => p.status === 'PENDING' || p.status === 'IN_PROGRESS').length,
      blocked: wave.prerequisites.filter(p => p.status === 'BLOCKED').length,
    };

    // Go/No-Go summary
    const goNoGoSummary = {
      total: wave.goNoGoCriteria.length,
      passed: wave.goNoGoCriteria.filter(c => c.status === 'PASS').length,
      failed: wave.goNoGoCriteria.filter(c => c.status === 'FAIL').length,
      notEvaluated: wave.goNoGoCriteria.filter(c => c.status === 'NOT_EVALUATED').length,
    };

    // Identify blockers
    const blockers: WaveBlocker[] = [];

    // Blocked prerequisites
    for (const prereq of wave.prerequisites.filter(p => p.status === 'BLOCKED' && p.isBlocking)) {
      blockers.push({
        type: 'FAILED_PREREQUISITE',
        description: `Prerequisite blocked: ${prereq.title}`,
        severity: 'BLOCKING',
        suggestedResolution: prereq.notes,
      });
    }

    // Failed Go/No-Go
    for (const criterion of wave.goNoGoCriteria.filter(c => c.status === 'FAIL' && c.isBlocking)) {
      blockers.push({
        type: 'FAILED_PREREQUISITE',
        description: `Go/No-Go failed: ${criterion.title}`,
        severity: 'BLOCKING',
        suggestedResolution: criterion.notes,
      });
    }

    // Low readiness entities
    const lowReadinessEntities = entities.filter(e => (e.readinessScore ?? 0) < 0.5);
    if (lowReadinessEntities.length > 0) {
      blockers.push({
        type: 'LOW_READINESS',
        description: `${lowReadinessEntities.length} entities have low readiness scores`,
        severity: 'WARNING',
        suggestedResolution: 'Review and enrich entity data before migration',
      });
    }

    // High risk entities
    const highRiskEntities = entities.filter(e => (e.riskScore ?? 0) > 0.7);
    if (highRiskEntities.length > 0) {
      blockers.push({
        type: 'HIGH_RISK',
        description: `${highRiskEntities.length} entities have high risk scores`,
        severity: 'WARNING',
        suggestedResolution: 'Review high-risk entities and create mitigation plans',
      });
    }

    // Progress calculation
    const totalAssignments = assignments.length;
    const completedAssignments = entitiesByStatus.completed + entitiesByStatus.skipped;
    const progressPercentage = totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0;

    return {
      waveId,
      waveName: wave.name,
      status: wave.status,
      entityCountsByType,
      totalEntities: entities.length,
      entitiesByStatus,
      averageReadinessScore: readinessCount > 0 ? totalReadiness / readinessCount : 0,
      averageRiskScore: riskCount > 0 ? totalRisk / riskCount : 0,
      blockingIssuesCount: blockers.filter(b => b.severity === 'BLOCKING').length,
      blockers,
      prerequisitesSummary,
      goNoGoSummary,
      progressPercentage,
    };
  }

  // ========================================
  // Wave Suggestions
  // ========================================

  /**
   * Suggest wave assignments based on entity analysis
   */
  async suggestWaveAssignments(
    sourceProfileId: string,
    targetProfileId: string,
    options?: {
      maxEntitiesPerWave?: number;
      minReadinessScore?: number;
      prioritizeTypes?: InventoryEntityType[];
    }
  ): Promise<WaveSuggestion[]> {
    const maxPerWave = options?.maxEntitiesPerWave || 100;
    const minReadiness = options?.minReadinessScore || 0.3;
    const priorityTypes = options?.prioritizeTypes || ['USER', 'GROUP'];

    // Get all entities for the source profile
    const entities = await inventoryService.getEntities({
      sourceProfileId,
      statuses: ['DISCOVERED', 'TRIAGED', 'VERIFIED', 'ENRICHED', 'MIGRATION_READY'],
    });

    // Filter by readiness
    const eligibleEntities = entities.filter(e =>
      (e.readinessScore ?? 0) >= minReadiness && !e.waveId
    );

    // Sort by readiness (high first), then by complexity (low first)
    eligibleEntities.sort((a, b) => {
      const readinessDiff = (b.readinessScore ?? 0) - (a.readinessScore ?? 0);
      if (Math.abs(readinessDiff) > 0.1) return readinessDiff;
      return (a.complexityScore ?? 0) - (b.complexityScore ?? 0);
    });

    const suggestions: WaveSuggestion[] = [];
    const assigned = new Set<string>();

    // Wave 1: Foundation - Users and Groups with high readiness
    const wave1Entities = eligibleEntities
      .filter(e => ['USER', 'GROUP'].includes(e.entityType) && (e.readinessScore ?? 0) >= 0.7)
      .slice(0, maxPerWave);

    if (wave1Entities.length > 0) {
      wave1Entities.forEach(e => assigned.add(e.id));
      suggestions.push({
        waveName: 'Wave 1 - Foundation Users & Groups',
        order: 1,
        entityIds: wave1Entities.map(e => e.id),
        rationale: 'High-readiness users and groups form the foundation for other migrations',
        entityTypes: ['USER', 'GROUP'],
        estimatedComplexity: 'LOW',
        priorWaveDependencies: [],
        confidence: 0.9,
      });
    }

    // Wave 2: Core Applications with owners
    const wave2Entities = eligibleEntities
      .filter(e =>
        e.entityType === 'APPLICATION' &&
        !assigned.has(e.id) &&
        (e.readinessScore ?? 0) >= 0.6
      )
      .slice(0, maxPerWave);

    if (wave2Entities.length > 0) {
      wave2Entities.forEach(e => assigned.add(e.id));
      suggestions.push({
        waveName: 'Wave 2 - Core Applications',
        order: 2,
        entityIds: wave2Entities.map(e => e.id),
        rationale: 'Applications with clear ownership and good readiness scores',
        entityTypes: ['APPLICATION'],
        estimatedComplexity: 'MEDIUM',
        priorWaveDependencies: suggestions.length > 0 ? [suggestions[0].waveName] : [],
        confidence: 0.8,
      });
    }

    // Wave 3: Remaining users and groups
    const wave3Entities = eligibleEntities
      .filter(e =>
        ['USER', 'GROUP'].includes(e.entityType) &&
        !assigned.has(e.id)
      )
      .slice(0, maxPerWave);

    if (wave3Entities.length > 0) {
      wave3Entities.forEach(e => assigned.add(e.id));
      suggestions.push({
        waveName: 'Wave 3 - Extended Users & Groups',
        order: 3,
        entityIds: wave3Entities.map(e => e.id),
        rationale: 'Remaining users and groups after foundation wave',
        entityTypes: ['USER', 'GROUP'],
        estimatedComplexity: 'MEDIUM',
        priorWaveDependencies: suggestions.slice(0, 2).map(s => s.waveName),
        confidence: 0.75,
      });
    }

    // Wave 4: Infrastructure and remaining applications
    const wave4Entities = eligibleEntities
      .filter(e =>
        !assigned.has(e.id) &&
        ['APPLICATION', 'INFRASTRUCTURE', 'SERVER', 'DATABASE', 'VIRTUAL_MACHINE'].includes(e.entityType)
      )
      .slice(0, maxPerWave);

    if (wave4Entities.length > 0) {
      wave4Entities.forEach(e => assigned.add(e.id));
      const types = [...new Set(wave4Entities.map(e => e.entityType))] as InventoryEntityType[];
      suggestions.push({
        waveName: 'Wave 4 - Infrastructure & Advanced Apps',
        order: 4,
        entityIds: wave4Entities.map(e => e.id),
        rationale: 'Infrastructure and complex applications requiring additional dependencies',
        entityTypes: types,
        estimatedComplexity: 'HIGH',
        priorWaveDependencies: suggestions.map(s => s.waveName),
        confidence: 0.7,
      });
    }

    // Wave 5: Collaboration (SharePoint, Teams, etc.)
    const wave5Entities = eligibleEntities
      .filter(e =>
        !assigned.has(e.id) &&
        ['SHAREPOINT_SITE', 'TEAMS_TEAM', 'MAILBOX'].includes(e.entityType)
      )
      .slice(0, maxPerWave);

    if (wave5Entities.length > 0) {
      wave5Entities.forEach(e => assigned.add(e.id));
      const types = [...new Set(wave5Entities.map(e => e.entityType))] as InventoryEntityType[];
      suggestions.push({
        waveName: 'Wave 5 - Collaboration Services',
        order: 5,
        entityIds: wave5Entities.map(e => e.id),
        rationale: 'SharePoint, Teams, and mailbox migrations after user foundation',
        entityTypes: types,
        estimatedComplexity: 'HIGH',
        priorWaveDependencies: suggestions.slice(0, 3).map(s => s.waveName),
        confidence: 0.65,
      });
    }

    console.log(`[MigrationWaveService] Generated ${suggestions.length} wave suggestions`);
    return suggestions;
  }

  /**
   * Apply wave suggestions - create waves and assign entities
   */
  async applySuggestions(
    sourceProfileId: string,
    targetProfileId: string,
    suggestions: WaveSuggestion[]
  ): Promise<{ wavesCreated: number; entitiesAssigned: number }> {
    let wavesCreated = 0;
    let entitiesAssigned = 0;

    for (const suggestion of suggestions) {
      // Create wave
      const wave = await this.createWave({
        sourceProfileId,
        targetProfileId,
        name: suggestion.waveName,
        description: suggestion.rationale,
        order: suggestion.order,
        priority: suggestion.estimatedComplexity === 'LOW' ? 'High' :
          suggestion.estimatedComplexity === 'MEDIUM' ? 'Normal' : 'Low',
        status: 'DRAFT',
        prerequisites: [],
        goNoGoCriteria: [],
        tags: suggestion.entityTypes,
        metadata: {
          suggestedComplexity: suggestion.estimatedComplexity,
          confidence: suggestion.confidence,
        },
      });

      wavesCreated++;

      // Assign entities
      const result = await this.assignEntitiesToWave(
        wave.id,
        suggestion.entityIds,
        'READINESS',
        'Auto-assigned based on readiness score analysis'
      );

      entitiesAssigned += result.assigned;
    }

    return { wavesCreated, entitiesAssigned };
  }

  // ========================================
  // Wave Validation
  // ========================================

  /**
   * Validate a wave is ready for execution
   */
  async validateWave(waveId: string): Promise<{
    isValid: boolean;
    errors: { code: string; message: string; severity: string }[];
    warnings: { code: string; message: string }[];
  }> {
    const wave = this.waves.get(waveId);
    if (!wave) {
      return {
        isValid: false,
        errors: [{ code: 'WAVE_NOT_FOUND', message: 'Wave not found', severity: 'ERROR' }],
        warnings: [],
      };
    }

    const errors: { code: string; message: string; severity: string }[] = [];
    const warnings: { code: string; message: string }[] = [];

    // Check status
    if (wave.status === 'IN_PROGRESS' || wave.status === 'COMPLETED') {
      errors.push({
        code: 'INVALID_STATUS',
        message: `Wave is already ${wave.status}`,
        severity: 'ERROR',
      });
    }

    // Check assignments
    const assignments = this.assignments.get(waveId) || [];
    if (assignments.length === 0) {
      warnings.push({
        code: 'NO_ASSIGNMENTS',
        message: 'Wave has no entities assigned',
      });
    }

    // Check prerequisites
    const blockedPrereqs = wave.prerequisites.filter(p => p.isBlocking && p.status !== 'COMPLETED' && p.status !== 'WAIVED');
    if (blockedPrereqs.length > 0) {
      errors.push({
        code: 'PREREQ_INCOMPLETE',
        message: `${blockedPrereqs.length} blocking prerequisite(s) not completed`,
        severity: 'BLOCKING',
      });
    }

    // Check Go/No-Go
    const failedCriteria = wave.goNoGoCriteria.filter(c => c.isBlocking && c.status === 'FAIL');
    if (failedCriteria.length > 0) {
      errors.push({
        code: 'GONOGO_FAILED',
        message: `${failedCriteria.length} blocking Go/No-Go criterion failed`,
        severity: 'BLOCKING',
      });
    }

    const notEvaluated = wave.goNoGoCriteria.filter(c => c.status === 'NOT_EVALUATED');
    if (notEvaluated.length > 0) {
      warnings.push({
        code: 'GONOGO_PENDING',
        message: `${notEvaluated.length} Go/No-Go criterion not yet evaluated`,
      });
    }

    // Check prior waves
    const priorWaves = Array.from(this.waves.values())
      .filter(w => w.sourceProfileId === wave.sourceProfileId && w.order < wave.order);

    const incompletePriorWaves = priorWaves.filter(w =>
      w.status !== 'COMPLETED' && w.status !== 'CANCELLED'
    );

    if (incompletePriorWaves.length > 0) {
      warnings.push({
        code: 'PRIOR_WAVES_INCOMPLETE',
        message: `${incompletePriorWaves.length} prior wave(s) not yet completed`,
      });
    }

    const isValid = errors.filter(e => e.severity === 'BLOCKING' || e.severity === 'ERROR').length === 0;

    return { isValid, errors, warnings };
  }

  // ========================================
  // Wave Status Management
  // ========================================

  /**
   * Start wave execution
   */
  async startWave(waveId: string): Promise<{ success: boolean; error?: string }> {
    const wave = this.waves.get(waveId);
    if (!wave) {
      return { success: false, error: 'Wave not found' };
    }

    const validation = await this.validateWave(waveId);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.map(e => e.message).join('; ') };
    }

    await this.updateWave(waveId, {
      status: 'IN_PROGRESS',
      actualStartDate: new Date().toISOString(),
    });

    // Update all assignments to READY
    const assignments = this.assignments.get(waveId) || [];
    for (const assignment of assignments) {
      assignment.status = 'READY';
      assignment.updatedAt = new Date().toISOString();
    }

    console.log(`[MigrationWaveService] Started wave: ${wave.name}`);
    return { success: true };
  }

  /**
   * Complete wave
   */
  async completeWave(waveId: string): Promise<{ success: boolean; error?: string }> {
    const wave = this.waves.get(waveId);
    if (!wave) {
      return { success: false, error: 'Wave not found' };
    }

    await this.updateWave(waveId, {
      status: 'COMPLETED',
      actualEndDate: new Date().toISOString(),
    });

    // Update entities status
    const assignments = this.assignments.get(waveId) || [];
    for (const assignment of assignments) {
      await inventoryService.updateEntity(assignment.inventoryEntityId, {
        status: 'MIGRATED',
      });
    }

    console.log(`[MigrationWaveService] Completed wave: ${wave.name}`);
    return { success: true };
  }

  /**
   * Pause wave
   */
  async pauseWave(waveId: string): Promise<{ success: boolean; error?: string }> {
    const wave = this.waves.get(waveId);
    if (!wave || wave.status !== 'IN_PROGRESS') {
      return { success: false, error: 'Wave not in progress' };
    }

    await this.updateWave(waveId, { status: 'PAUSED' });
    console.log(`[MigrationWaveService] Paused wave: ${wave.name}`);
    return { success: true };
  }

  /**
   * Resume wave
   */
  async resumeWave(waveId: string): Promise<{ success: boolean; error?: string }> {
    const wave = this.waves.get(waveId);
    if (!wave || wave.status !== 'PAUSED') {
      return { success: false, error: 'Wave not paused' };
    }

    await this.updateWave(waveId, { status: 'IN_PROGRESS' });
    console.log(`[MigrationWaveService] Resumed wave: ${wave.name}`);
    return { success: true };
  }
}

// Export singleton instance
export const migrationWaveService = new MigrationWaveService();
