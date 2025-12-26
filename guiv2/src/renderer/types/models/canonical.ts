/**
 * Canonical Entity and Relationship Models
 *
 * These types define the "system of record" for migration decisions.
 * Based on Decision Traces architecture addendum in CLAUDE.local.md.
 *
 * Key Principles:
 * - Separate data plane (facts) from decision plane (why)
 * - Every canonical entity/relation carries provenance
 * - Everything is versioned for replayability
 * - Conflicts are explicitly modeled
 */

// ============================================================================
// Entity Types
// ============================================================================

/**
 * Core entity types in the consolidated view
 */
export type EntityType = 'USER' | 'GROUP' | 'APPLICATION' | 'INFRASTRUCTURE';

/**
 * Source systems that contribute data to canonical entities
 */
export type SourceSystem =
  | 'AD'                    // Active Directory
  | 'ENTRA'                 // Microsoft Entra ID (Azure AD)
  | 'INTUNE'                // Microsoft Intune
  | 'EXCHANGE'              // Exchange Server
  | 'SHAREPOINT'            // SharePoint Online/Server
  | 'AZURE'                 // Azure Resources
  | 'LOCAL'                 // Local discovery scans
  | 'OTHER';

/**
 * External identifier from a source system
 */
export interface ExternalId {
  system: SourceSystem;
  id: string;               // objectId, appId, deviceId, SID, GUID, etc.
  tenantOrDomain?: string;  // e.g., "contoso.com", "tenant-guid"
}

/**
 * Conflict when sources disagree on a field value
 */
export interface FieldConflict {
  field: string;
  values: Array<{
    value: any;
    source: string;
    confidence?: number;
  }>;
}

/**
 * Source record reference for provenance tracing
 */
export interface SourceRecordRef {
  file: string;             // CSV filename or API endpoint
  rowId?: string;           // Row number or record ID
  hash?: string;            // Content hash for change detection
  observedAt?: string;      // When this record was observed (ISO 8601)
}

/**
 * Provenance metadata for entities and relationships
 */
export interface Provenance {
  sources: string[];                    // Systems contributing (e.g., ["AD", "ENTRA"])
  sourceRecordRefs: SourceRecordRef[];  // Traceable back to raw data
  confidence: number;                   // 0..1 confidence score
  lastObservedAt: string;               // Most recent observation (ISO 8601)
  observedAtRange?: {                   // Temporal validity
    start: string;
    end?: string;
  };
  conflicts?: FieldConflict[];          // Detected conflicts between sources
}

// ============================================================================
// Canonical Entity (Inventory Entity)
// ============================================================================

/**
 * Base shape for all consolidated entities
 *
 * Every entity in consolidated views (Users, Groups, Apps, Infrastructure)
 * follows this canonical shape with provenance and versioning.
 */
export interface CanonicalEntity {
  id: string;                           // Stable UUID
  entityType: EntityType;
  displayName: string;

  /**
   * External IDs from various source systems
   * Enables cross-system identity resolution
   */
  externalIds: ExternalId[];

  /**
   * Entity-specific attributes
   * Typed per entityType in concrete implementations
   */
  attributes: Record<string, any>;

  /**
   * Provenance: Where did this entity come from?
   * Critical for decision tracing and audit
   */
  provenance: Provenance;

  /**
   * Version tracking for replayability
   * Incremented on every canonical state change
   */
  version: number;

  /**
   * Last update timestamp
   */
  updatedAt: string;                    // ISO 8601

  /**
   * Soft delete marker (don't physically delete for audit trail)
   */
  isDeleted?: boolean;
  deletedAt?: string;
}

// ============================================================================
// Canonical Relationships (Edges)
// ============================================================================

/**
 * Relationship types between canonical entities
 * Maps to real-world enterprise relationships
 */
export type RelationType =
  | 'MEMBER_OF'             // User/Computer is member of Group
  | 'HAS_DEVICE'            // User has Device
  | 'HAS_MAILBOX'           // User has Mailbox
  | 'HAS_ACCESS_TO'         // User/Group has access to Resource
  | 'USES_APPLICATION'      // User uses Application
  | 'HOSTS_APPLICATION'     // Infrastructure hosts Application
  | 'DEPENDS_ON'            // Entity depends on another Entity
  | 'APPLIES_POLICY'        // Policy applies to Entity
  | 'OWNS'                  // User/Group owns Resource
  | 'MANAGED_BY';           // Entity is managed by User/Group

/**
 * Relationship between two canonical entities
 *
 * Relationships are first-class citizens with full provenance.
 * Can be inferred (by system) or asserted (by human).
 */
export interface CanonicalRelation {
  id: string;                           // Stable UUID
  type: RelationType;
  fromEntityId: string;                 // Source entity UUID
  toEntityId: string;                   // Target entity UUID

  /**
   * Relationship-specific attributes
   * e.g., for MEMBER_OF: { role: "Owner", membershipType: "Direct" }
   */
  attributes?: Record<string, any>;

  /**
   * Relationship provenance
   * Critical: Was this inferred or manually asserted?
   */
  provenance: {
    inferred: boolean;                  // true = system inferred, false = human asserted
    sources: string[];                  // Source systems providing evidence
    sourceRecordRefs: SourceRecordRef[];
    confidence: number;                 // 0..1 confidence in this relationship
    rationale?: string;                 // Human/machine-readable explanation
  };

  /**
   * Version tracking
   */
  version: number;
  updatedAt: string;

  /**
   * Soft delete / superseded marker
   * When a relationship is overridden, we mark it superseded
   * rather than deleting it (preserves audit trail)
   */
  isActive?: boolean;
  supersededBy?: string;                // ID of relation that replaced this one
  supersededAt?: string;
}

// ============================================================================
// Decision Trace (Audit Log)
// ============================================================================

/**
 * Types of decisions that generate traces
 */
export type DecisionKind =
  | 'CONSOLIDATION_RUN'         // Full consolidation execution
  | 'IDENTITY_MATCH'            // Matched entities across systems
  | 'ENTITY_MERGE'              // Merged duplicate entities
  | 'RELATIONSHIP_INFERRED'     // System inferred a relationship
  | 'RELATIONSHIP_OVERRIDDEN'   // Human overrode an inferred relationship
  | 'CLASSIFICATION_CHANGED'    // Entity type/category changed
  | 'MIGRATION_WAVE_ASSIGNED'   // Entity assigned to migration wave
  | 'DISPOSITION_SET'           // Migration disposition set (Retain/Retire/Rehost/etc)
  | 'EXCEPTION_GRANTED'         // Policy exception approved
  | 'POLICY_EVALUATED';         // Policy rule evaluated

/**
 * Actor who made the decision
 */
export interface DecisionActor {
  type: 'HUMAN' | 'AGENT' | 'SYSTEM';
  id?: string;                  // User ID, Agent ID, or system identifier
  displayName?: string;         // Human-readable name
}

/**
 * Subject of the decision
 */
export interface DecisionSubject {
  entityId?: string;            // UUID of affected entity
  relationId?: string;          // UUID of affected relation
  entityType?: EntityType;
}

/**
 * Input snapshot reference
 */
export interface DecisionInput {
  system: string;               // Source system
  ref: {
    file?: string;              // CSV file or API endpoint
    rowId?: string;             // Row number or record ID
    externalId?: string;        // External system identifier
  };
  snapshotHash?: string;        // Hash of input data for replayability
}

/**
 * Policy that drove the decision
 */
export interface PolicyReference {
  policyId: string;
  policyVersion: string;
  rule?: string;                // Specific rule that applied
}

/**
 * Precedent reference (previous similar decisions)
 */
export interface PrecedentReference {
  traceIds: string[];           // IDs of previous decision traces
  note?: string;                // Explanation of how precedent applies
}

/**
 * Evidence type for decision rationale
 */
export type EvidenceType =
  | 'FIELD_MATCH'               // Fields matched across sources
  | 'MEMBERSHIP'                // Group membership evidence
  | 'OWNER'                     // Ownership evidence
  | 'ACCESS'                    // Access pattern evidence
  | 'HEURISTIC';                // Pattern-based heuristic

/**
 * Evidence supporting a decision
 */
export interface DecisionEvidence {
  type: EvidenceType;
  detail: string;               // Human-readable description
  weight?: number;              // Relative importance (0..1)
}

/**
 * Exception approval metadata
 */
export interface ExceptionMetadata {
  requestedBy?: string;         // Who requested the exception
  approvedBy?: string;          // Who approved it
  reason: string;               // Justification
}

/**
 * Decision rationale
 */
export interface DecisionRationale {
  summary: string;              // Human-readable summary
  evidence: DecisionEvidence[]; // Supporting evidence
  confidence: number;           // 0..1 confidence in decision
  exception?: ExceptionMetadata;
}

/**
 * Decision outcomes (what changed)
 */
export interface DecisionOutcomes {
  entityVersionBumps?: string[];        // Entity IDs whose versions changed
  relationVersionBumps?: string[];      // Relation IDs whose versions changed
}

/**
 * The "why" record: Complete audit trail for a decision
 *
 * Every significant transformation (merge, link, classify, assign wave)
 * must emit a DecisionTrace. This is the foundation for:
 * - Audit ("who changed this and why?")
 * - Replayability ("what did we know when we decided?")
 * - Precedent ("how did we handle similar cases?")
 * - Agent safety ("what evidence supports this recommendation?")
 */
export interface DecisionTrace {
  id: string;                   // Trace UUID
  profileId: string;            // Source profile/tenant context
  occurredAt: string;           // When decision was made (ISO 8601)
  actor: DecisionActor;         // Who/what made the decision

  kind: DecisionKind;           // Type of decision
  subject: DecisionSubject;     // What was affected

  /**
   * Inputs that informed this decision
   * Critical for replayability
   */
  inputs: DecisionInput[];

  /**
   * Policy and precedent
   */
  policy?: PolicyReference;
  precedent?: PrecedentReference;

  /**
   * The decision itself
   */
  decision: {
    action: string;             // e.g., "MERGE", "LINK", "SET_WAVE", "OVERRIDE"
    before?: any;               // State before (JSON snapshot)
    after?: any;                // State after (JSON snapshot)
  };

  /**
   * Why this decision was made
   */
  rationale: DecisionRationale;

  /**
   * What changed as a result
   */
  outcomes: DecisionOutcomes;
}

// ============================================================================
// Consolidated Entity Variants (Concrete Types)
// ============================================================================

/**
 * User entity with specific attributes
 */
export interface CanonicalUser extends CanonicalEntity {
  entityType: 'USER';
  attributes: {
    userPrincipalName?: string;
    email?: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    department?: string;
    jobTitle?: string;
    manager?: string;
    accountEnabled?: boolean;
    // ... additional user-specific fields
  };
}

/**
 * Group entity with specific attributes
 */
export interface CanonicalGroup extends CanonicalEntity {
  entityType: 'GROUP';
  attributes: {
    groupType?: string;
    scope?: string;
    description?: string;
    email?: string;
    memberCount?: number;
    isSecurityEnabled?: boolean;
    isMailEnabled?: boolean;
    // ... additional group-specific fields
  };
}

/**
 * Application entity with specific attributes
 */
export interface CanonicalApplication extends CanonicalEntity {
  entityType: 'APPLICATION';
  attributes: {
    publisher?: string;
    version?: string;
    category?: string;
    criticality?: 'Critical' | 'High' | 'Medium' | 'Low';
    complexity?: 'Complex' | 'Moderate' | 'Simple';
    // ... additional application-specific fields
  };
}

/**
 * Infrastructure entity with specific attributes
 */
export interface CanonicalInfrastructure extends CanonicalEntity {
  entityType: 'INFRASTRUCTURE';
  attributes: {
    computerName?: string;
    os?: string;
    osVersion?: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    ipAddress?: string;
    // ... additional infrastructure-specific fields
  };
}
