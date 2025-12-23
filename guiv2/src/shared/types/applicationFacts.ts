/**
 * Application Fact Sheet Domain Model
 *
 * LeanIX-style application fact sheet types for comprehensive application
 * documentation and migration planning.
 *
 * Features:
 * - Multi-source provenance tracking (which CSV/API provided each field)
 * - Observation-based updates with timestamped history
 * - Rich relationships to other applications and IT components
 * - Migration planning integration
 */

// ============================================================
// Enums and Constants
// ============================================================

/**
 * Application lifecycle states
 */
export type LifecycleState =
  | 'plan'
  | 'phase-in'
  | 'active'
  | 'phase-out'
  | 'end-of-life'
  | 'retired'
  | 'unknown';

/**
 * Business criticality levels
 */
export type BusinessCriticality =
  | 'mission-critical'
  | 'business-critical'
  | 'business-operational'
  | 'administrative'
  | 'unknown';

/**
 * Technical fitness levels
 */
export type TechnicalFitness =
  | 'unrestricted'
  | 'adequate'
  | 'insufficient'
  | 'inappropriate'
  | 'unknown';

/**
 * Functional fitness levels
 */
export type FunctionalFitness =
  | 'perfect'
  | 'adequate'
  | 'insufficient'
  | 'inappropriate'
  | 'unknown';

/**
 * Hosting types
 */
export type HostingType =
  | 'saas'
  | 'paas'
  | 'iaas'
  | 'on-premises'
  | 'hybrid'
  | 'unknown';

/**
 * Data classification levels
 */
export type DataClassification =
  | 'public'
  | 'internal'
  | 'confidential'
  | 'restricted'
  | 'unknown';

/**
 * Migration approach types
 */
export type MigrationApproach =
  | 'rehost'
  | 'refactor'
  | 'rearchitect'
  | 'rebuild'
  | 'replace'
  | 'retire'
  | 'retain'
  | 'unknown';

/**
 * Discovery sources for provenance
 */
export type DiscoverySource =
  | 'EntraIDAppRegistrations'
  | 'EntraIDEnterpriseApps'
  | 'EntraIDServicePrincipals'
  | 'EntraIDApplicationSecrets'
  | 'ActiveDirectory'
  | 'Exchange'
  | 'SharePoint'
  | 'Manual'
  | 'API'
  | 'Unknown';

// ============================================================
// Core Types
// ============================================================

/**
 * Field provenance tracking - records where each piece of data came from
 */
export interface FieldProvenance {
  /** Field name */
  field: string;
  /** Source type (CSV file, API, manual entry) */
  source: DiscoverySource;
  /** Source file name if applicable */
  sourceFile?: string;
  /** When this value was discovered/set */
  discoveredAt: string;
  /** Confidence level (0-1) */
  confidence: number;
  /** Whether this was manually verified */
  verified: boolean;
  /** User who verified (if applicable) */
  verifiedBy?: string;
  /** When verified */
  verifiedAt?: string;
  /** Previous value (for history) */
  previousValue?: string;
}

/**
 * Observation record - an update to a fact sheet
 */
export interface ApplicationObservation {
  /** Unique observation ID */
  id: string;
  /** When this observation was made */
  timestamp: string;
  /** Source of this observation */
  source: DiscoverySource;
  /** Fields updated in this observation */
  fieldsUpdated: string[];
  /** Provenance records for each updated field */
  provenance: FieldProvenance[];
  /** Notes about this observation */
  notes?: string;
}

/**
 * Relationship to another application or entity
 */
export interface FactRelation {
  /** Unique relation ID */
  id: string;
  /** Target entity ID */
  targetId: string;
  /** Target entity type */
  targetType: 'application' | 'it-component' | 'user' | 'group' | 'resource' | 'business-capability';
  /** Target display name */
  targetName: string;
  /** Relationship type */
  relationType:
    | 'depends-on'
    | 'provides-data-to'
    | 'receives-data-from'
    | 'authenticates-via'
    | 'integrates-with'
    | 'hosted-on'
    | 'owned-by'
    | 'used-by'
    | 'manages'
    | 'replaced-by'
    | 'replaces';
  /** Relationship description */
  description?: string;
  /** Direction (inbound, outbound, bidirectional) */
  direction: 'inbound' | 'outbound' | 'bidirectional';
  /** Is this relationship critical? */
  isCritical: boolean;
  /** When this relationship was discovered */
  discoveredAt: string;
  /** Source of this relationship */
  source: DiscoverySource;
}

/**
 * Migration plan for an application
 */
export interface ApplicationMigrationPlan {
  /** Migration approach */
  approach: MigrationApproach;
  /** Target date */
  targetDate?: string;
  /** Planned wave */
  wave?: string;
  /** Migration priority (1=highest) */
  priority: number;
  /** Effort estimate (hours) */
  effortHours?: number;
  /** Cost estimate */
  costEstimate?: number;
  /** Risks identified */
  risks: string[];
  /** Dependencies that must be migrated first */
  dependencies: string[];
  /** Pre-migration tasks */
  preTasks: string[];
  /** Post-migration tasks */
  postTasks: string[];
  /** Migration status */
  status: 'not-started' | 'planning' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
  /** Notes */
  notes?: string;
  /** Last updated */
  lastUpdated: string;
}

/**
 * Security assessment section
 */
export interface SecurityAssessment {
  /** Data classification */
  dataClassification: DataClassification;
  /** Handles PII */
  handlesPII: boolean;
  /** Authentication method */
  authenticationMethod?: string;
  /** SSO enabled */
  ssoEnabled: boolean;
  /** MFA required */
  mfaRequired: boolean;
  /** Last security review date */
  lastSecurityReview?: string;
  /** Compliance frameworks */
  complianceFrameworks: string[];
  /** Security notes */
  notes?: string;
  /** Secrets expiring soon */
  expiringSecrets?: Array<{
    name: string;
    expiresAt: string;
    daysUntilExpiry: number;
  }>;
}

/**
 * Technical details section
 */
export interface TechnicalDetails {
  /** Hosting type */
  hostingType: HostingType;
  /** Primary technology stack */
  technology: string[];
  /** Programming languages */
  languages: string[];
  /** Databases used */
  databases: string[];
  /** APIs exposed */
  apisExposed: string[];
  /** APIs consumed */
  apisConsumed: string[];
  /** Azure resources */
  azureResources: string[];
  /** Technical fitness */
  technicalFitness: TechnicalFitness;
  /** Technical notes */
  notes?: string;
}

/**
 * Business context section
 */
export interface BusinessContext {
  /** Business criticality */
  criticality: BusinessCriticality;
  /** Business capabilities supported */
  capabilities: string[];
  /** Business processes supported */
  processes: string[];
  /** Business owner */
  businessOwner?: string;
  /** IT owner */
  itOwner?: string;
  /** Cost center */
  costCenter?: string;
  /** Annual cost */
  annualCost?: number;
  /** Number of users */
  userCount?: number;
  /** Functional fitness */
  functionalFitness: FunctionalFitness;
  /** Business value score (1-10) */
  businessValue?: number;
  /** Notes */
  notes?: string;
}

/**
 * Lifecycle information
 */
export interface LifecycleInfo {
  /** Current lifecycle state */
  state: LifecycleState;
  /** When the app was introduced */
  introductionDate?: string;
  /** When active state started */
  activeDate?: string;
  /** When phase-out started/planned */
  phaseOutDate?: string;
  /** End of life date */
  endOfLifeDate?: string;
  /** Retirement date */
  retirementDate?: string;
  /** Vendor support end date */
  vendorSupportEndDate?: string;
  /** Lifecycle notes */
  notes?: string;
}

// ============================================================
// Main Application Fact Sheet Type
// ============================================================

/**
 * Complete Application Fact Sheet
 */
export interface ApplicationFact {
  /** Unique identifier (typically AppId or ObjectId) */
  id: string;

  /** Display name */
  displayName: string;

  /** Description */
  description?: string;

  /** Aliases / alternative names */
  aliases: string[];

  /** Tags for categorization */
  tags: string[];

  // === Identity & Source ===
  /** Azure AD App ID (GUID) */
  appId?: string;
  /** Azure AD Object ID */
  objectId?: string;
  /** Service Principal ID */
  servicePrincipalId?: string;
  /** Publisher domain */
  publisherDomain?: string;
  /** Publisher name */
  publisherName?: string;
  /** App owner organization ID */
  appOwnerOrganizationId?: string;
  /** Sign-in audience */
  signInAudience?: string;
  /** Service principal type */
  servicePrincipalType?: string;

  // === Classification (from classifier) ===
  /** Classification category */
  classification: 'MicrosoftDefault' | 'CustomerManaged' | 'ThirdParty' | 'Unknown';
  /** Classification confidence */
  classificationConfidence: number;
  /** Classification reasons */
  classificationReasons: string[];

  // === Sections ===
  /** Lifecycle information */
  lifecycle: LifecycleInfo;
  /** Business context */
  business: BusinessContext;
  /** Technical details */
  technical: TechnicalDetails;
  /** Security assessment */
  security: SecurityAssessment;
  /** Migration plan */
  migration?: ApplicationMigrationPlan;

  // === Relationships ===
  /** All relationships */
  relations: FactRelation[];

  // === Provenance & History ===
  /** Provenance for each field */
  provenance: FieldProvenance[];
  /** Observation history */
  observations: ApplicationObservation[];

  // === Metadata ===
  /** When this fact sheet was created */
  createdAt: string;
  /** When last updated */
  updatedAt: string;
  /** Last discovery sync */
  lastSyncAt?: string;
  /** Profile this belongs to */
  profileId?: string;
}

// ============================================================
// Service Types
// ============================================================

/**
 * Filter options for querying fact sheets
 */
export interface FactSheetFilter {
  /** Filter by classification */
  classification?: ('MicrosoftDefault' | 'CustomerManaged' | 'ThirdParty' | 'Unknown')[];
  /** Filter by lifecycle state */
  lifecycleState?: LifecycleState[];
  /** Filter by business criticality */
  criticality?: BusinessCriticality[];
  /** Filter by hosting type */
  hostingType?: HostingType[];
  /** Filter by tags */
  tags?: string[];
  /** Search in name/description */
  searchText?: string;
  /** Has migration plan */
  hasMigrationPlan?: boolean;
  /** Migration status */
  migrationStatus?: ApplicationMigrationPlan['status'][];
}

/**
 * Statistics about fact sheets
 */
export interface FactSheetStatistics {
  /** Total count */
  total: number;
  /** By classification */
  byClassification: Record<string, number>;
  /** By lifecycle state */
  byLifecycleState: Record<LifecycleState, number>;
  /** By criticality */
  byCriticality: Record<BusinessCriticality, number>;
  /** By hosting type */
  byHostingType: Record<HostingType, number>;
  /** With migration plans */
  withMigrationPlan: number;
  /** By migration status */
  byMigrationStatus: Record<string, number>;
  /** Last updated */
  lastUpdated: string;
}

/**
 * Result of importing/syncing from discovery data
 */
export interface FactSheetSyncResult {
  /** Number of new fact sheets created */
  created: number;
  /** Number of existing fact sheets updated */
  updated: number;
  /** Number unchanged */
  unchanged: number;
  /** Number of errors */
  errors: number;
  /** Error details */
  errorDetails: Array<{ appId: string; error: string }>;
  /** Sync timestamp */
  syncedAt: string;
}

// ============================================================
// Default Values
// ============================================================

/**
 * Default lifecycle info
 */
export const DEFAULT_LIFECYCLE_INFO: LifecycleInfo = {
  state: 'unknown',
};

/**
 * Default business context
 */
export const DEFAULT_BUSINESS_CONTEXT: BusinessContext = {
  criticality: 'unknown',
  capabilities: [],
  processes: [],
  functionalFitness: 'unknown',
};

/**
 * Default technical details
 */
export const DEFAULT_TECHNICAL_DETAILS: TechnicalDetails = {
  hostingType: 'unknown',
  technology: [],
  languages: [],
  databases: [],
  apisExposed: [],
  apisConsumed: [],
  azureResources: [],
  technicalFitness: 'unknown',
};

/**
 * Default security assessment
 */
export const DEFAULT_SECURITY_ASSESSMENT: SecurityAssessment = {
  dataClassification: 'unknown',
  handlesPII: false,
  ssoEnabled: false,
  mfaRequired: false,
  complianceFrameworks: [],
};

/**
 * Create a new empty application fact
 */
export function createEmptyApplicationFact(id: string, displayName: string): ApplicationFact {
  const now = new Date().toISOString();
  return {
    id,
    displayName,
    aliases: [],
    tags: [],
    classification: 'Unknown',
    classificationConfidence: 0,
    classificationReasons: [],
    lifecycle: { ...DEFAULT_LIFECYCLE_INFO },
    business: { ...DEFAULT_BUSINESS_CONTEXT },
    technical: { ...DEFAULT_TECHNICAL_DETAILS },
    security: { ...DEFAULT_SECURITY_ASSESSMENT },
    relations: [],
    provenance: [],
    observations: [],
    createdAt: now,
    updatedAt: now,
  };
}
