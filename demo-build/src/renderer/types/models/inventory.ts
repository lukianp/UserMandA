/**
 * Consolidated Inventory Domain Model
 *
 * Provides a unified canonical layer over raw discovery outputs.
 * Enables entity consolidation, evidence tracking, typed relationships,
 * and migration wave integration.
 */

/**
 * Core entity types in the inventory
 */
export type EntityType = 'USER' | 'GROUP' | 'APPLICATION' | 'INFRASTRUCTURE';

/**
 * Entity lifecycle status progression
 */
export type EntityStatus =
  | 'DISCOVERED'       // Raw discovery, not yet validated
  | 'TRIAGED'          // Reviewed by analyst
  | 'VERIFIED'         // Confirmed as accurate
  | 'ENRICHED'         // Additional data added
  | 'MIGRATION_READY'  // Prepared for migration
  | 'MIGRATED';        // Successfully migrated

/**
 * Typed relationship categories between entities
 */
export type RelationType =
  | 'MEMBER_OF_GROUP'      // User → Group
  | 'OWNS_APPLICATION'     // User/Group → Application
  | 'APP_USES_IDENTITY'    // Application → User (service account)
  | 'HOSTED_ON'            // Application → Infrastructure
  | 'DEPENDS_ON'           // Application → Application, Infrastructure → Infrastructure
  | 'CONNECTS_TO';         // Infrastructure → Infrastructure

/**
 * Consolidated inventory entity
 *
 * Represents a canonical entity with evidence from multiple discovery sources
 */
export interface InventoryEntity {
  /** Unique identifier */
  id: string;

  /** Source profile (company/environment) */
  sourceProfileId: string;

  /** Target profile for migration (optional) */
  targetProfileId?: string;

  /** Entity type category */
  entityType: EntityType;

  /** Human-readable name */
  displayName: string;

  /** External identifiers from various systems */
  externalIds: Record<string, string>; // objectId, appId, resourceId, upn, email, etc.

  /** Current lifecycle status */
  status: EntityStatus;

  /** Migration readiness score (0.0 - 1.0) */
  readinessScore?: number;

  /** Risk assessment score (0.0 - 1.0) */
  riskScore?: number;

  /** Assigned migration wave ID */
  waveId?: string;

  /** Entity creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Evidence from a discovery module
 *
 * Tracks which discovery modules observed this entity and when
 */
export interface InventoryEntityEvidence {
  /** Evidence record ID */
  id: string;

  /** Parent inventory entity */
  inventoryEntityId: string;

  /** Discovery module name (e.g., 'ENTRA_USERS', 'AZURE_RESOURCES') */
  module: string;

  /** Reference to raw discovery record (ID/key in source file) */
  sourceRecordRef: string;

  /** When this evidence was observed */
  observedAt: Date;

  /** Snapshot of raw data from discovery (optional) */
  payloadSnapshot?: Record<string, any>;
}

/**
 * Typed relationship between entities
 */
export interface InventoryRelation {
  /** Relation ID */
  id: string;

  /** Source profile */
  sourceProfileId: string;

  /** Source entity ID */
  fromEntityId: string;

  /** Target entity ID */
  toEntityId: string;

  /** Relationship type */
  relationType: RelationType;

  /** Additional metadata (confidence, source, permissions, etc.) */
  metadata?: Record<string, any>;

  /** When relationship was created/discovered */
  createdAt: Date;
}

/**
 * Cross-profile entity matching
 *
 * Links entities between source and target environments
 */
export interface InventoryMatch {
  /** Match record ID */
  id: string;

  /** Source profile ID */
  sourceProfileId: string;

  /** Target profile ID */
  targetProfileId: string;

  /** Source entity ID */
  sourceEntityId: string;

  /** Target entity ID */
  targetEntityId: string;

  /** Matching method used */
  matchType: 'EXACT_ID' | 'EMAIL_UPN' | 'DISPLAYNAME_HEURISTIC' | 'MANUAL';

  /** Confidence score (0.0 - 1.0) */
  confidence: number;

  /** Match creation timestamp */
  createdAt: Date;
}

/**
 * Migration wave for consolidated entities
 */
export type WaveStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETE';

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

/**
 * Inventory statistics
 */
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


