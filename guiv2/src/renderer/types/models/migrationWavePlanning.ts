/**
 * Migration Wave Planning Type Definitions
 *
 * Extends the existing migration types with wave-based planning capabilities
 * that integrate with the Consolidated Inventory layer.
 */

import { Dictionary } from '../common';
import { InventoryEntity, InventoryEntityType, InventoryRelationType } from './inventory';
import { MigrationPriority, MigrationStatus } from './migration';

// ========================================
// Wave Planning Types
// ========================================

/**
 * Wave status for planning and execution
 */
export type WavePlanningStatus =
  | 'DRAFT'           // Wave is being planned
  | 'PROPOSED'        // Wave submitted for review
  | 'APPROVED'        // Wave approved for execution
  | 'SCHEDULED'       // Wave has scheduled dates
  | 'IN_PROGRESS'     // Wave migration is running
  | 'PAUSED'          // Wave execution paused
  | 'COMPLETED'       // Wave successfully completed
  | 'FAILED'          // Wave failed during execution
  | 'CANCELLED';      // Wave cancelled

/**
 * Wave assignment reason types
 */
export type WaveAssignmentReason =
  | 'DEPENDENCY'      // Assigned due to dependency on another entity
  | 'GROUP_MEMBER'    // Assigned as part of group migration
  | 'APP_USER'        // Assigned as application user
  | 'MANUAL'          // Manually assigned by planner
  | 'PILOT'           // Selected for pilot group
  | 'PRIORITY'        // High priority entity
  | 'COMPLEXITY'      // Low complexity for early waves
  | 'DEPARTMENT'      // Department-based grouping
  | 'LOCATION'        // Location-based grouping
  | 'READINESS';      // Readiness score based

/**
 * Migration wave for inventory-based planning
 */
export interface InventoryMigrationWave {
  /** Unique wave identifier */
  id: string;

  /** Source profile ID */
  sourceProfileId: string;

  /** Target profile ID */
  targetProfileId: string;

  /** Wave name/title */
  name: string;

  /** Wave description */
  description?: string;

  /** Wave order/sequence number */
  order: number;

  /** Priority level */
  priority: MigrationPriority;

  /** Current status */
  status: WavePlanningStatus;

  /** Planned start date */
  plannedStartDate?: Date | string;

  /** Planned cutover date */
  plannedCutoverDate?: Date | string;

  /** Planned end date */
  plannedEndDate?: Date | string;

  /** Actual start date */
  actualStartDate?: Date | string;

  /** Actual end date */
  actualEndDate?: Date | string;

  /** Wave prerequisites */
  prerequisites: WavePrerequisite[];

  /** Go/No-Go criteria */
  goNoGoCriteria: GoNoGoCriterion[];

  /** Notes and comments */
  notes?: string;

  /** Tags for categorization */
  tags: string[];

  /** Custom metadata */
  metadata: Dictionary<any>;

  /** Created by user */
  createdBy?: string;

  /** Approved by user */
  approvedBy?: string;

  /** Approval timestamp */
  approvedAt?: Date | string;

  /** Creation timestamp */
  createdAt: Date | string;

  /** Last update timestamp */
  updatedAt: Date | string;
}

/**
 * Assignment of entity to a wave
 */
export interface WaveAssignment {
  /** Unique assignment ID */
  id: string;

  /** Wave ID */
  waveId: string;

  /** Inventory entity ID */
  inventoryEntityId: string;

  /** Reason for assignment */
  assignmentReason: WaveAssignmentReason;

  /** Detailed reason description */
  reasonDetails?: string;

  /** Dependencies within this wave */
  inWaveDependencies: string[];

  /** Dependencies from prior waves */
  priorWaveDependencies: string[];

  /** Assignment order within wave */
  order?: number;

  /** Estimated duration (minutes) */
  estimatedDuration?: number;

  /** Assignment status */
  status: 'PENDING' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';

  /** Execution result */
  executionResult?: WaveAssignmentResult;

  /** Created by */
  createdBy?: string;

  /** Created timestamp */
  createdAt: Date | string;

  /** Updated timestamp */
  updatedAt: Date | string;
}

/**
 * Result of executing a wave assignment
 */
export interface WaveAssignmentResult {
  /** Whether migration succeeded */
  success: boolean;

  /** Start time */
  startedAt: Date | string;

  /** End time */
  completedAt: Date | string;

  /** Duration in milliseconds */
  duration: number;

  /** Errors encountered */
  errors: string[];

  /** Warnings */
  warnings: string[];

  /** Validation results */
  validationResults?: WaveValidationResult[];

  /** Rollback available */
  rollbackAvailable: boolean;

  /** Rollback ID if applicable */
  rollbackId?: string;
}

/**
 * Wave prerequisite
 */
export interface WavePrerequisite {
  /** Prerequisite ID */
  id: string;

  /** Title */
  title: string;

  /** Description */
  description?: string;

  /** Category */
  category: 'TECHNICAL' | 'BUSINESS' | 'COMMUNICATION' | 'APPROVAL' | 'TRAINING';

  /** Current status */
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'WAIVED';

  /** Assigned to */
  assignedTo?: string;

  /** Due date */
  dueDate?: Date | string;

  /** Completed date */
  completedAt?: Date | string;

  /** Whether this is blocking */
  isBlocking: boolean;

  /** Notes */
  notes?: string;
}

/**
 * Go/No-Go criterion for wave execution
 */
export interface GoNoGoCriterion {
  /** Criterion ID */
  id: string;

  /** Title */
  title: string;

  /** Description */
  description?: string;

  /** Category */
  category: 'TECHNICAL' | 'BUSINESS' | 'SECURITY' | 'COMPLIANCE';

  /** Evaluation type */
  evaluationType: 'AUTOMATIC' | 'MANUAL';

  /** Automatic evaluation script (PowerShell) */
  evaluationScript?: string;

  /** Current status */
  status: 'NOT_EVALUATED' | 'PASS' | 'FAIL' | 'WARNING' | 'WAIVED';

  /** Evaluation timestamp */
  evaluatedAt?: Date | string;

  /** Evaluated by */
  evaluatedBy?: string;

  /** Notes */
  notes?: string;

  /** Whether failure blocks wave */
  isBlocking: boolean;
}

/**
 * Validation result for wave entities
 */
export interface WaveValidationResult {
  /** Entity ID */
  entityId: string;

  /** Validation passed */
  passed: boolean;

  /** Validation checks */
  checks: {
    name: string;
    passed: boolean;
    message?: string;
    severity?: 'INFO' | 'WARNING' | 'ERROR';
  }[];

  /** Timestamp */
  validatedAt: Date | string;
}

// ========================================
// Wave Summary and Statistics
// ========================================

/**
 * Summary statistics for a wave
 */
export interface WaveSummary {
  /** Wave ID */
  waveId: string;

  /** Wave name */
  waveName: string;

  /** Wave status */
  status: WavePlanningStatus;

  /** Entity counts by type */
  entityCountsByType: Record<InventoryEntityType, number>;

  /** Total entities in wave */
  totalEntities: number;

  /** Entities by status */
  entitiesByStatus: {
    pending: number;
    ready: number;
    inProgress: number;
    completed: number;
    failed: number;
    skipped: number;
  };

  /** Average readiness score */
  averageReadinessScore: number;

  /** Average risk score */
  averageRiskScore: number;

  /** Blocking issues count */
  blockingIssuesCount: number;

  /** Blockers list */
  blockers: WaveBlocker[];

  /** Prerequisites status */
  prerequisitesSummary: {
    total: number;
    completed: number;
    pending: number;
    blocked: number;
  };

  /** Go/No-Go summary */
  goNoGoSummary: {
    total: number;
    passed: number;
    failed: number;
    notEvaluated: number;
  };

  /** Estimated total duration (minutes) */
  estimatedDuration?: number;

  /** Actual duration (minutes) */
  actualDuration?: number;

  /** Progress percentage (0-100) */
  progressPercentage: number;
}

/**
 * Blocker for wave execution
 */
export interface WaveBlocker {
  /** Blocker type */
  type: 'MISSING_DEPENDENCY' | 'FAILED_PREREQUISITE' | 'LOW_READINESS' | 'HIGH_RISK' | 'UNRESOLVED_CONFLICT' | 'PRIOR_WAVE_INCOMPLETE';

  /** Affected entity ID */
  entityId?: string;

  /** Affected entity name */
  entityName?: string;

  /** Description */
  description: string;

  /** Severity */
  severity: 'WARNING' | 'ERROR' | 'BLOCKING';

  /** Suggested resolution */
  suggestedResolution?: string;
}

// ========================================
// Wave Suggestion and Planning
// ========================================

/**
 * Wave suggestion from the planning algorithm
 */
export interface WaveSuggestion {
  /** Suggested wave name */
  waveName: string;

  /** Wave order */
  order: number;

  /** Entity IDs to include */
  entityIds: string[];

  /** Rationale for this wave */
  rationale: string;

  /** Entity types included */
  entityTypes: InventoryEntityType[];

  /** Estimated complexity */
  estimatedComplexity: 'LOW' | 'MEDIUM' | 'HIGH';

  /** Dependencies on prior waves */
  priorWaveDependencies: string[];

  /** Confidence score for this suggestion */
  confidence: number;
}

/**
 * Options for wave suggestion algorithm
 */
export interface WaveSuggestionOptions {
  /** Source profile ID */
  sourceProfileId: string;

  /** Target profile ID */
  targetProfileId: string;

  /** Maximum entities per wave */
  maxEntitiesPerWave?: number;

  /** Minimum readiness score for inclusion */
  minReadinessScore?: number;

  /** Maximum risk score for early waves */
  maxRiskScoreForEarlyWaves?: number;

  /** Prioritize by entity types */
  prioritizeTypes?: InventoryEntityType[];

  /** Include dependencies automatically */
  includeDependencies?: boolean;

  /** Group by department/location */
  groupBy?: 'DEPARTMENT' | 'LOCATION' | 'ENTITY_TYPE' | 'COMPLEXITY';
}

// ========================================
// Dependency Analysis
// ========================================

/**
 * Dependency analysis result for wave planning
 */
export interface DependencyAnalysis {
  /** Entity ID */
  entityId: string;

  /** Direct dependencies (must migrate first) */
  directDependencies: DependencyInfo[];

  /** Indirect dependencies (transitive) */
  indirectDependencies: DependencyInfo[];

  /** Dependents (entities depending on this one) */
  dependents: DependencyInfo[];

  /** Circular dependencies detected */
  circularDependencies: string[][];

  /** Recommended wave order */
  recommendedWaveOrder: number;

  /** Dependency depth (longest path to root) */
  dependencyDepth: number;

  /** Critical path indicator */
  isOnCriticalPath: boolean;
}

/**
 * Dependency information
 */
export interface DependencyInfo {
  /** Dependent entity ID */
  entityId: string;

  /** Entity display name */
  displayName: string;

  /** Entity type */
  entityType: InventoryEntityType;

  /** Relation type creating dependency */
  relationType: InventoryRelationType;

  /** Whether dependency is blocking */
  isBlocking: boolean;

  /** Dependency reason */
  reason: string;
}

// ========================================
// Wave Timeline and Gantt
// ========================================

/**
 * Timeline entry for Gantt visualization
 */
export interface WaveTimelineEntry {
  /** Wave ID */
  id: string;

  /** Wave name */
  name: string;

  /** Start date */
  start: Date | string;

  /** End date */
  end: Date | string;

  /** Progress percentage */
  progress: number;

  /** Entry type */
  type: 'wave' | 'milestone' | 'checkpoint';

  /** Dependencies on other waves */
  dependencies: string[];

  /** Color for visualization */
  color?: string;

  /** Is critical path */
  isCriticalPath?: boolean;

  /** Assigned resources */
  assignedTo?: string;

  /** Wave status */
  status: WavePlanningStatus;
}

// ========================================
// Wave Operations
// ========================================

/**
 * Result of wave creation
 */
export interface WaveCreationResult {
  /** Success indicator */
  success: boolean;

  /** Created wave (if successful) */
  wave?: InventoryMigrationWave;

  /** Error message (if failed) */
  error?: string;

  /** Validation warnings */
  warnings?: string[];
}

/**
 * Result of entity assignment to wave
 */
export interface WaveAssignmentBatchResult {
  /** Success indicator */
  success: boolean;

  /** Number of entities assigned */
  assignedCount: number;

  /** Entities that couldn't be assigned */
  failedAssignments: {
    entityId: string;
    reason: string;
  }[];

  /** Warnings */
  warnings: string[];
}

/**
 * Wave validation result
 */
export interface WaveValidation {
  /** Wave ID */
  waveId: string;

  /** Overall validity */
  isValid: boolean;

  /** Validation errors */
  errors: {
    code: string;
    message: string;
    severity: 'ERROR' | 'BLOCKING';
    affectedEntities?: string[];
  }[];

  /** Validation warnings */
  warnings: {
    code: string;
    message: string;
    affectedEntities?: string[];
  }[];

  /** Timestamp */
  validatedAt: Date | string;
}
