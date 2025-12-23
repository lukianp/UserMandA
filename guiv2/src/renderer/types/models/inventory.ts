/**
 * Consolidated Inventory Type Definitions
 *
 * This module defines the canonical entity layer that unifies raw discovery outputs
 * into typed entities with relationships, enabling migration wave planning and
 * Organisation Map integration.
 */

import { Dictionary } from '../common';

// ========================================
// Core Entity Types
// ========================================

/**
 * Primary entity classifications in the consolidated inventory
 */
export type InventoryEntityType =
  | 'USER'
  | 'GROUP'
  | 'APPLICATION'
  | 'INFRASTRUCTURE'
  | 'MAILBOX'
  | 'SHAREPOINT_SITE'
  | 'TEAMS_TEAM'
  | 'DEVICE'
  | 'SERVER'
  | 'DATABASE'
  | 'VIRTUAL_MACHINE'
  | 'STORAGE'
  | 'NETWORK_RESOURCE';

/**
 * Entity lifecycle status in the inventory pipeline
 */
export type InventoryEntityStatus =
  | 'DISCOVERED'        // Initially discovered from raw data
  | 'TRIAGED'           // Reviewed and categorized
  | 'VERIFIED'          // Data validated against source
  | 'ENRICHED'          // Additional metadata added
  | 'MAPPED'            // Matched to target entity
  | 'MIGRATION_READY'   // Ready for migration wave assignment
  | 'MIGRATION_PLANNED' // Assigned to a wave
  | 'MIGRATING'         // Currently being migrated
  | 'MIGRATED'          // Successfully migrated
  | 'MIGRATION_FAILED'  // Migration failed
  | 'ARCHIVED';         // No longer active

/**
 * Typed relationship types between inventory entities
 */
export type InventoryRelationType =
  // Identity & Access relationships
  | 'MEMBER_OF_GROUP'       // User/Group → Group
  | 'OWNER_OF_GROUP'        // User → Group
  | 'OWNS_APPLICATION'      // User/Group → Application
  | 'ASSIGNED_TO_APP'       // User/Group → Application (app role assignment)
  | 'CONSENTS_TO_APP'       // User → Application (delegated permission)
  | 'ADMIN_OF_APP'          // User → Application (admin consent)

  // Application relationships
  | 'APP_USES_IDENTITY'     // Application → User/Group (service principal)
  | 'APP_DEPENDS_ON'        // Application → Application
  | 'APP_PROVIDES_API'      // Application → Application (API exposure)
  | 'APP_CONSUMES_API'      // Application → Application (API consumption)

  // Infrastructure relationships
  | 'HOSTED_ON'             // Application/Database → Server/VM
  | 'CONNECTS_TO'           // Any → Any (network connectivity)
  | 'STORES_DATA_IN'        // Application → Database/Storage
  | 'BACKED_UP_BY'          // Any → Backup system
  | 'MONITORED_BY'          // Any → Monitoring system

  // Collaboration relationships
  | 'HAS_MAILBOX'           // User → Mailbox
  | 'MEMBER_OF_TEAM'        // User → Teams Team
  | 'OWNER_OF_SITE'         // User/Group → SharePoint Site
  | 'HAS_ONEDRIVE'          // User → OneDrive

  // Device relationships
  | 'OWNS_DEVICE'           // User → Device
  | 'REGISTERED_DEVICE'     // User → Device (Entra registration)
  | 'MANAGED_DEVICE';       // Device → Management system

/**
 * Discovery module identifiers for evidence tracking
 */
export type DiscoveryModule =
  | 'ENTRA_USERS'
  | 'ENTRA_GROUPS'
  | 'ENTRA_APPLICATIONS'
  | 'ENTRA_SERVICE_PRINCIPALS'
  | 'ACTIVE_DIRECTORY_USERS'
  | 'ACTIVE_DIRECTORY_GROUPS'
  | 'ACTIVE_DIRECTORY_COMPUTERS'
  | 'AZURE_RESOURCES'
  | 'AZURE_SUBSCRIPTIONS'
  | 'AZURE_VIRTUAL_MACHINES'
  | 'EXCHANGE_MAILBOXES'
  | 'EXCHANGE_DISTRIBUTION_LISTS'
  | 'SHAREPOINT_SITES'
  | 'TEAMS_TEAMS'
  | 'ONEDRIVE_ACCOUNTS'
  | 'INTUNE_DEVICES'
  | 'SQL_SERVERS'
  | 'FILE_SERVERS'
  | 'NETWORK_INFRASTRUCTURE'
  | 'VMWARE_VMS'
  | 'HYPERV_VMS'
  | 'CONDITIONAL_ACCESS'
  | 'LICENSES'
  | 'UNKNOWN';

/**
 * Match type for cross-tenant/domain entity matching
 */
export type EntityMatchType =
  | 'EXACT_ID'              // Same object ID
  | 'EMAIL_UPN'             // Email or UPN match
  | 'DISPLAYNAME_HEURISTIC' // Display name similarity
  | 'SID_MATCH'             // Security identifier match
  | 'IMMUTABLE_ID'          // Immutable ID match
  | 'ANCHOR_ATTRIBUTE'      // Custom anchor attribute
  | 'MANUAL';               // Manual mapping by user

// ========================================
// Core Entity Interfaces
// ========================================

/**
 * Canonical inventory entity - the unified representation of any discovered resource
 */
export interface InventoryEntity {
  /** Unique identifier for this inventory entity */
  id: string;

  /** Source profile ID this entity belongs to */
  sourceProfileId: string;

  /** Target profile ID for migration (if mapped) */
  targetProfileId?: string;

  /** Entity classification */
  entityType: InventoryEntityType;

  /** Human-readable name */
  displayName: string;

  /** Canonical description */
  description?: string;

  /** External identifiers from source systems */
  externalIds: ExternalIdentifiers;

  /** Current status in the inventory pipeline */
  status: InventoryEntityStatus;

  /** Migration readiness score (0.0 - 1.0) */
  readinessScore?: number;

  /** Risk assessment score (0.0 - 1.0) */
  riskScore?: number;

  /** Complexity score for migration planning (0.0 - 1.0) */
  complexityScore?: number;

  /** Assigned migration wave ID */
  waveId?: string;

  /** Wave assignment priority (1 = highest) */
  wavePriority?: number;

  /** Tags for categorization and filtering */
  tags: string[];

  /** Custom metadata */
  metadata: Dictionary<any>;

  /** Discovery modules that found this entity */
  discoveredBy: DiscoveryModule[];

  /** Number of evidence records supporting this entity */
  evidenceCount: number;

  /** Entity creation timestamp */
  createdAt: Date | string;

  /** Last update timestamp */
  updatedAt: Date | string;

  /** Last discovery scan timestamp */
  lastDiscoveredAt?: Date | string;
}

/**
 * External identifiers from various source systems
 */
export interface ExternalIdentifiers {
  /** Azure AD / Entra ID object ID */
  objectId?: string;

  /** User Principal Name */
  upn?: string;

  /** Email address */
  email?: string;

  /** On-premises Security Identifier */
  onPremisesSid?: string;

  /** Immutable ID (for hybrid sync) */
  immutableId?: string;

  /** Application ID (for apps) */
  appId?: string;

  /** Service Principal ID */
  servicePrincipalId?: string;

  /** Azure Resource ID */
  azureResourceId?: string;

  /** On-premises SAM Account Name */
  samAccountName?: string;

  /** Distinguished Name (AD) */
  distinguishedName?: string;

  /** Hostname or FQDN */
  hostname?: string;

  /** IP Address */
  ipAddress?: string;

  /** MAC Address */
  macAddress?: string;

  /** Custom identifiers */
  custom?: Dictionary<string>;
}

/**
 * Evidence record linking inventory entity to raw discovery data
 */
export interface InventoryEntityEvidence {
  /** Unique identifier for this evidence record */
  id: string;

  /** Parent inventory entity ID */
  inventoryEntityId: string;

  /** Discovery module that produced this evidence */
  module: DiscoveryModule;

  /** Reference to the original record (ID or key) */
  sourceRecordRef: string;

  /** Path to source file */
  sourceFilePath?: string;

  /** Line number in source file (for CSV) */
  sourceLineNumber?: number;

  /** When this evidence was observed */
  observedAt: Date | string;

  /** Confidence score for this evidence (0.0 - 1.0) */
  confidence: number;

  /** Snapshot of relevant fields from source record */
  payloadSnapshot?: Dictionary<any>;

  /** Whether this evidence is still current */
  isActive: boolean;
}

/**
 * Relationship between two inventory entities
 */
export interface InventoryRelation {
  /** Unique identifier for this relation */
  id: string;

  /** Source profile ID */
  sourceProfileId: string;

  /** From entity ID */
  fromEntityId: string;

  /** To entity ID */
  toEntityId: string;

  /** Relationship type */
  relationType: InventoryRelationType;

  /** Relationship direction */
  direction: 'OUTBOUND' | 'INBOUND' | 'BIDIRECTIONAL';

  /** Confidence score (0.0 - 1.0) */
  confidence: number;

  /** Additional relationship metadata */
  metadata?: RelationMetadata;

  /** Discovery module that established this relation */
  derivedFrom?: DiscoveryModule;

  /** When this relation was created */
  createdAt: Date | string;

  /** Whether this relation is still valid */
  isActive: boolean;
}

/**
 * Metadata for relationships
 */
export interface RelationMetadata {
  /** Role or permission level */
  role?: string;

  /** Permission type (delegated, application) */
  permissionType?: string;

  /** Permission scopes */
  scopes?: string[];

  /** Whether inherited (e.g., nested group membership) */
  isInherited?: boolean;

  /** Inheritance path */
  inheritancePath?: string[];

  /** Additional properties */
  properties?: Dictionary<any>;
}

/**
 * Match between source and target entities for migration
 */
export interface InventoryMatch {
  /** Unique identifier for this match */
  id: string;

  /** Source profile ID */
  sourceProfileId: string;

  /** Target profile ID */
  targetProfileId: string;

  /** Source entity ID */
  sourceEntityId: string;

  /** Target entity ID */
  targetEntityId: string;

  /** How the match was determined */
  matchType: EntityMatchType;

  /** Match confidence score (0.0 - 1.0) */
  confidence: number;

  /** Attribute mappings for this match */
  attributeMappings?: AttributeMapping[];

  /** Whether this match has been verified by user */
  isVerified: boolean;

  /** User who verified this match */
  verifiedBy?: string;

  /** When the match was verified */
  verifiedAt?: Date | string;

  /** Match conflicts or issues */
  conflicts?: MatchConflict[];

  /** When this match was created */
  createdAt: Date | string;
}

/**
 * Attribute mapping for entity migration
 */
export interface AttributeMapping {
  /** Source attribute name */
  sourceAttribute: string;

  /** Target attribute name */
  targetAttribute: string;

  /** Transformation type */
  transformationType: 'DIRECT' | 'TRANSFORM' | 'CONCATENATE' | 'SPLIT' | 'LOOKUP' | 'DEFAULT' | 'IGNORE';

  /** Transformation rule (if applicable) */
  transformationRule?: string;

  /** Default value if source is empty */
  defaultValue?: string;

  /** Whether this mapping is required */
  isRequired: boolean;

  /** Whether this mapping is enabled */
  isEnabled: boolean;
}

/**
 * Conflict detected during matching
 */
export interface MatchConflict {
  /** Conflict type */
  type: 'DUPLICATE_TARGET' | 'ATTRIBUTE_MISMATCH' | 'TYPE_MISMATCH' | 'PERMISSION_CONFLICT' | 'DEPENDENCY_CONFLICT';

  /** Conflict severity */
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'BLOCKING';

  /** Human-readable description */
  description: string;

  /** Suggested resolution */
  suggestedResolution?: string;

  /** Whether conflict has been resolved */
  isResolved: boolean;

  /** Resolution applied */
  resolution?: string;
}

// ========================================
// Filter and Query Types
// ========================================

/**
 * Filter options for querying inventory entities
 */
export interface InventoryEntityFilter {
  /** Filter by source profile */
  sourceProfileId?: string;

  /** Filter by target profile */
  targetProfileId?: string;

  /** Filter by entity types */
  entityTypes?: InventoryEntityType[];

  /** Filter by statuses */
  statuses?: InventoryEntityStatus[];

  /** Filter by wave ID */
  waveId?: string;

  /** Filter by assigned vs unassigned to wave */
  hasWaveAssignment?: boolean;

  /** Search query (matches display name, IDs) */
  search?: string;

  /** Filter by tags (any match) */
  tags?: string[];

  /** Filter by minimum readiness score */
  minReadinessScore?: number;

  /** Filter by maximum risk score */
  maxRiskScore?: number;

  /** Filter by discovery modules */
  discoveredBy?: DiscoveryModule[];

  /** Filter by created date range */
  createdAfter?: Date | string;
  createdBefore?: Date | string;

  /** Filter by updated date range */
  updatedAfter?: Date | string;
  updatedBefore?: Date | string;

  /** Pagination - skip */
  offset?: number;

  /** Pagination - limit */
  limit?: number;

  /** Sort field */
  sortBy?: 'displayName' | 'createdAt' | 'updatedAt' | 'readinessScore' | 'riskScore' | 'status';

  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Filter options for querying relations
 */
export interface InventoryRelationFilter {
  /** Filter by source profile */
  sourceProfileId?: string;

  /** Filter by entity ID (either side) */
  entityId?: string;

  /** Filter by from entity ID */
  fromEntityId?: string;

  /** Filter by to entity ID */
  toEntityId?: string;

  /** Filter by relation types */
  relationTypes?: InventoryRelationType[];

  /** Include only active relations */
  activeOnly?: boolean;

  /** Minimum confidence score */
  minConfidence?: number;
}

// ========================================
// Statistics and Summary Types
// ========================================

/**
 * Summary statistics for the inventory
 */
export interface InventoryStatistics {
  /** Total entity count by type */
  entityCountByType: Record<InventoryEntityType, number>;

  /** Entity count by status */
  entityCountByStatus: Record<InventoryEntityStatus, number>;

  /** Total relation count by type */
  relationCountByType: Record<InventoryRelationType, number>;

  /** Total entities */
  totalEntities: number;

  /** Total relations */
  totalRelations: number;

  /** Total evidence records */
  totalEvidence: number;

  /** Entities with wave assignments */
  assignedToWaves: number;

  /** Entities ready for migration */
  migrationReady: number;

  /** Average readiness score */
  averageReadinessScore: number;

  /** Average risk score */
  averageRiskScore: number;

  /** Discovery coverage (entities with multiple evidence sources) */
  multiSourceEntities: number;

  /** Last consolidation run timestamp */
  lastConsolidatedAt?: Date | string;

  /** Last consolidation duration (ms) */
  lastConsolidationDuration?: number;
}

/**
 * Entity detail view with related data
 */
export interface InventoryEntityDetail {
  /** The entity itself */
  entity: InventoryEntity;

  /** Evidence records */
  evidence: InventoryEntityEvidence[];

  /** Outbound relations */
  outboundRelations: InventoryRelationWithTarget[];

  /** Inbound relations */
  inboundRelations: InventoryRelationWithSource[];

  /** Match to target entity (if mapped) */
  targetMatch?: InventoryMatch;

  /** Matched target entity (if mapped) */
  targetEntity?: InventoryEntity;
}

/**
 * Relation with target entity info included
 */
export interface InventoryRelationWithTarget extends InventoryRelation {
  targetEntity: InventoryEntity;
}

/**
 * Relation with source entity info included
 */
export interface InventoryRelationWithSource extends InventoryRelation {
  sourceEntity: InventoryEntity;
}

// ========================================
// Consolidation Types
// ========================================

/**
 * Result of a consolidation run
 */
export interface ConsolidationResult {
  /** Whether the consolidation succeeded */
  success: boolean;

  /** Error message if failed */
  error?: string;

  /** Entities created */
  entitiesCreated: number;

  /** Entities updated */
  entitiesUpdated: number;

  /** Relations created */
  relationsCreated: number;

  /** Evidence records added */
  evidenceAdded: number;

  /** Duration in milliseconds */
  duration: number;

  /** Files processed */
  filesProcessed: string[];

  /** Timestamp */
  completedAt: Date | string;
}

/**
 * Options for consolidation
 */
export interface ConsolidationOptions {
  /** Source profile ID to consolidate */
  sourceProfileId: string;

  /** Force full rebuild (ignores incremental) */
  forceFullRebuild?: boolean;

  /** Specific modules to process */
  modules?: DiscoveryModule[];

  /** Recalculate scores */
  recalculateScores?: boolean;

  /** Rebuild relations */
  rebuildRelations?: boolean;
}

// ========================================
// Export Types for Organisation Map Integration
// ========================================

/**
 * Node for Organisation Map visualization
 */
export interface InventoryMapNode {
  /** Inventory entity ID */
  id: string;

  /** Display name */
  name: string;

  /** Entity type for styling */
  type: InventoryEntityType;

  /** LeanIX-style priority for layer ordering */
  priority: number;

  /** Category for grouping */
  category: string;

  /** Full entity reference */
  entity: InventoryEntity;
}

/**
 * Link for Organisation Map visualization
 */
export interface InventoryMapLink {
  /** Source entity ID */
  source: string;

  /** Target entity ID */
  target: string;

  /** Link weight/value */
  value: number;

  /** Relation type for styling */
  type: InventoryRelationType;

  /** Full relation reference */
  relation: InventoryRelation;
}

/**
 * Organisation Map data from inventory
 */
export interface InventoryMapData {
  nodes: InventoryMapNode[];
  links: InventoryMapLink[];
  statistics: InventoryStatistics;
}
