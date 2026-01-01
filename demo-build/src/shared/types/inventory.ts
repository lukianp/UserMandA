/**
 * Shared Inventory Types
 *
 * Types shared between main and renderer processes
 */

export type EntityType = 'USER' | 'GROUP' | 'APPLICATION' | 'INFRASTRUCTURE';

export type EntityStatus =
  | 'DISCOVERED'
  | 'TRIAGED'
  | 'VERIFIED'
  | 'ENRICHED'
  | 'MIGRATION_READY'
  | 'MIGRATED';

export type RelationType =
  | 'MEMBER_OF_GROUP'
  | 'OWNS_APPLICATION'
  | 'APP_USES_IDENTITY'
  | 'HOSTED_ON'
  | 'DEPENDS_ON'
  | 'CONNECTS_TO';

export type ConflictSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ConflictDetails {
  sources: string[]; // Module names that provided conflicting values
  values: Record<string, any>; // module -> value mapping
  resolvedValue?: any; // The value chosen to use
  resolvedBy?: string; // 'SYSTEM' | 'USER' | module name
  resolvedAt?: Date;
  severity: ConflictSeverity;
}

export interface InventoryEntity {
  id: string;
  sourceProfileId: string;
  targetProfileId?: string;
  entityType: EntityType;
  displayName: string;
  externalIds: Record<string, string>;
  status: EntityStatus;
  readinessScore?: number;
  riskScore?: number;
  waveId?: string;
  conflicts?: Record<string, ConflictDetails>; // attributeName -> conflict details
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryEntityEvidence {
  id: string;
  inventoryEntityId: string;
  module: string;
  sourceRecordRef: string;
  observedAt: Date;
  payloadSnapshot?: Record<string, any>;
}

export interface InventoryRelation {
  id: string;
  sourceProfileId: string;
  fromEntityId: string;
  toEntityId: string;
  relationType: RelationType;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface InventoryStats {
  totalEntities: number;
  byType: Record<EntityType, number>;
  byStatus: Record<EntityStatus, number>;
  averageReadiness: number;
  averageRisk: number;
  entitiesWithEvidence: number;
  entitiesWithRelations: number;
  entitiesAssignedToWaves: number;
}

/**
 * Migration wave status
 */
export type WaveStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETE';

/**
 * Migration wave for consolidated entities
 */
export interface MigrationWaveExtended {
  id: string;
  sourceProfileId: string;
  targetProfileId: string;
  name: string;
  plannedStartDate?: Date;
  plannedCutoverDate?: Date;
  status: WaveStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Wave assignment linking entities to waves
 */
export interface WaveAssignment {
  /** Assignment ID */
  id: string;

  /** Wave ID */
  waveId: string;

  /** Inventory entity ID */
  inventoryEntityId: string;

  /** Assignment reason/metadata */
  assignmentReason?: Record<string, any>;

  /** Assignment timestamp */
  createdAt: Date;
}

/**
 * Wave summary statistics
 */
export interface WaveSummary {
  /** Wave ID */
  waveId: string;

  /** Entity counts by type */
  entityCounts: Record<EntityType, number>;

  /** Average readiness score */
  readinessAverage: number;

  /** Blockers preventing wave execution */
  blockers: string[];

  /** Total entities in wave */
  totalEntities: number;
}

export type MatchType = 'EXACT_ID' | 'EMAIL_UPN' | 'DISPLAYNAME_HEURISTIC' | 'MANUAL' | 'FUZZY';

export type MergeKey = 'GUID' | 'UPN' | 'EMAIL' | 'SAMACCOUNTNAME' | 'DISPLAYNAME';

export interface InventoryMatch {
  id: string;
  sourceProfileId: string;
  targetProfileId: string;
  sourceEntityId: string;
  targetEntityId: string;
  matchType: MatchType;
  confidence: number; // 0-1
  fuzzyDistance?: number; // Levenshtein distance for fuzzy matches
  mergeKey?: MergeKey; // Which key was used for the match
  createdAt: Date;
}


