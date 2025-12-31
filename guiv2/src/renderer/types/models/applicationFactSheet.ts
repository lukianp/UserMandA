/**
 * Application Fact Sheet Domain Model
 *
 * LeanIX-style fact sheets for discovered applications with:
 * - Provenance tracking (which discovery module found what)
 * - Multi-source evidence aggregation
 * - Migration planning integration
 * - Business context and technical details
 */

// ============================================================================
// Core Enums
// ============================================================================

export type ApplicationLifecyclePhase =
  | 'plan'
  | 'phase_in'
  | 'active'
  | 'phase_out'
  | 'end_of_life';

export type ApplicationCriticality =
  | 'mission_critical'
  | 'business_critical'
  | 'business_operational'
  | 'administrative';

export type ApplicationComplexity =
  | 'simple'
  | 'standard'
  | 'complex'
  | 'highly_complex';

export type DataClassification =
  | 'public'
  | 'internal'
  | 'confidential'
  | 'restricted';

export type MigrationDisposition =
  | 'retain'
  | 'retire'
  | 'replace'
  | 'rehost'
  | 'refactor'
  | 'replatform'
  | 'repurchase';

export type ObservationConfidence =
  | 'high'      // Direct evidence from authoritative source
  | 'medium'    // Inferred from related data
  | 'low';      // Guessed or uncertain

export type RelationType =
  | 'uses'
  | 'used_by'
  | 'depends_on'
  | 'depended_by'
  | 'integrates_with'
  | 'owns'
  | 'owned_by'
  | 'authenticates_via'
  | 'hosts'
  | 'hosted_by'
  | 'accesses_data_from'
  | 'provides_data_to';

// ============================================================================
// Field Provenance - Track where each piece of data came from
// ============================================================================

export interface FieldProvenance {
  /** Discovery module that found this value */
  source: string;
  /** When this value was discovered */
  discoveredAt: string;
  /** Confidence level */
  confidence: ObservationConfidence;
  /** Source file containing the evidence */
  sourceFile?: string;
  /** Whether this was manually verified */
  verified: boolean;
  /** User who verified (if applicable) */
  verifiedBy?: string;
  /** When it was verified */
  verifiedAt?: string;
}

// ============================================================================
// Application Observation - A single piece of discovered information
// ============================================================================

export interface ApplicationObservation {
  id: string;
  /** The application this observation belongs to */
  applicationId: string;
  /** Field name this observation is about */
  field: string;
  /** The observed value */
  value: any;
  /** Provenance information */
  provenance: FieldProvenance;
  /** Whether this is the current "winning" value for the field */
  isActive: boolean;
  /** Notes about this observation */
  notes?: string;
}

// ============================================================================
// Fact Relation - Relationship between applications and other entities
// ============================================================================

export interface FactRelation {
  id: string;
  /** Source entity ID */
  sourceId: string;
  /** Source entity type */
  sourceType: string;
  /** Target entity ID */
  targetId: string;
  /** Target entity type */
  targetType: string;
  /** Target entity display name */
  targetName: string;
  /** Type of relationship */
  relationType: RelationType;
  /** Description of the relationship */
  description?: string;
  /** Provenance of this relationship discovery */
  provenance: FieldProvenance;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

// ============================================================================
// Migration Plan - Application-specific migration details
// ============================================================================

export interface ApplicationMigrationPlan {
  /** Migration disposition (6 Rs) */
  disposition: MigrationDisposition;
  /** Target environment/tenant */
  targetEnvironment?: string;
  /** Assigned migration wave */
  waveId?: string;
  /** Wave name for display */
  waveName?: string;
  /** Planned migration date */
  plannedDate?: string;
  /** Actual completion date */
  completedDate?: string;
  /** Migration status */
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  /** Blockers preventing migration */
  blockers: string[];
  /** Prerequisites that must be completed first */
  prerequisites: string[];
  /** Post-migration validation steps */
  validationSteps: string[];
  /** Migration notes */
  notes?: string;
  /** Estimated effort in hours */
  estimatedEffort?: number;
  /** Actual effort in hours */
  actualEffort?: number;
  /** Risk assessment */
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  /** Risk factors */
  riskFactors: string[];
}

// ============================================================================
// Section Data Structures
// ============================================================================

export interface BaseInfoSection {
  /** Display name */
  name: string;
  /** Internal/technical name */
  technicalName?: string;
  /** Application ID from source system */
  externalId?: string;
  /** Description */
  description?: string;
  /** Vendor/publisher */
  vendor?: string;
  /** Version */
  version?: string;
  /** Application type */
  applicationType?: 'custom' | 'cots' | 'saas' | 'paas' | 'open_source';
  /** Tags/categories */
  tags: string[];
  /** Aliases/alternative names */
  aliases: string[];
}

export interface LifecycleSection {
  /** Current lifecycle phase */
  phase: ApplicationLifecyclePhase;
  /** Phase start date */
  phaseStartDate?: string;
  /** Planned end-of-life date */
  endOfLifeDate?: string;
  /** Last review date */
  lastReviewDate?: string;
  /** Next review date */
  nextReviewDate?: string;
  /** Lifecycle notes */
  notes?: string;
}

export interface BusinessSection {
  /** Business criticality */
  criticality: ApplicationCriticality;
  /** Business capabilities supported */
  businessCapabilities: string[];
  /** Business processes supported */
  businessProcesses: string[];
  /** Cost center */
  costCenter?: string;
  /** Annual cost */
  annualCost?: number;
  /** Currency */
  currency?: string;
  /** Business owner */
  businessOwner?: string;
  /** Business owner email */
  businessOwnerEmail?: string;
  /** Departments using this application */
  departments: string[];
  /** User count estimate */
  userCount?: number;
  /** Business value score (1-10) */
  businessValueScore?: number;
}

export interface TechnicalSection {
  /** Technical complexity */
  complexity: ApplicationComplexity;
  /** Technical owner */
  technicalOwner?: string;
  /** Technical owner email */
  technicalOwnerEmail?: string;
  /** Programming languages */
  languages: string[];
  /** Frameworks */
  frameworks: string[];
  /** Hosting type */
  hostingType?: 'on_premises' | 'iaas' | 'paas' | 'saas' | 'hybrid';
  /** Infrastructure requirements */
  infrastructure: string[];
  /** Database dependencies */
  databases: string[];
  /** Integration points */
  integrations: string[];
  /** APIs exposed */
  apisExposed: string[];
  /** APIs consumed */
  apisConsumed: string[];
  /** Documentation links */
  documentationUrls: string[];
  /** Source code repository */
  repositoryUrl?: string;
  /** Health score (0-100) */
  healthScore?: number;
}

export interface SecuritySection {
  /** Data classification */
  dataClassification: DataClassification;
  /** Contains PII */
  containsPII: boolean;
  /** Contains PHI (health information) */
  containsPHI: boolean;
  /** Contains financial data */
  containsFinancialData: boolean;
  /** Regulatory compliance requirements */
  complianceRequirements: string[];
  /** Authentication method */
  authenticationMethod?: string;
  /** Single sign-on enabled */
  ssoEnabled: boolean;
  /** SSO provider */
  ssoProvider?: string;
  /** Last security review date */
  lastSecurityReview?: string;
  /** Security notes */
  securityNotes?: string;
  /** Known vulnerabilities */
  vulnerabilities: string[];
  /** Risk score (0-100) */
  riskScore?: number;
}

// ============================================================================
// Main Application Fact Sheet
// ============================================================================

export interface ApplicationFactSheet {
  /** Unique identifier */
  id: string;
  /** Source profile ID */
  sourceProfileId: string;
  /** Link to inventory entity if consolidated */
  inventoryEntityId?: string;

  // Sections
  baseInfo: BaseInfoSection;
  lifecycle: LifecycleSection;
  business: BusinessSection;
  technical: TechnicalSection;
  security: SecuritySection;
  migration: ApplicationMigrationPlan;

  // Relations
  relations: FactRelation[];

  // Provenance tracking
  observations: ApplicationObservation[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;

  // Scores
  /** Overall readiness for migration (0-100) */
  readinessScore: number;
  /** Overall risk score (0-100) */
  overallRiskScore: number;
  /** Completeness score - how much data we have (0-100) */
  completenessScore: number;
}

// ============================================================================
// API Types
// ============================================================================

export interface CreateApplicationFactSheetRequest {
  sourceProfileId: string;
  baseInfo: Partial<BaseInfoSection> & { name: string };
  inventoryEntityId?: string;
}

export interface UpdateApplicationFactSheetRequest {
  id: string;
  section: 'baseInfo' | 'lifecycle' | 'business' | 'technical' | 'security' | 'migration';
  updates: Partial<BaseInfoSection | LifecycleSection | BusinessSection | TechnicalSection | SecuritySection | ApplicationMigrationPlan>;
  /** User making the update */
  updatedBy?: string;
}

export interface AddObservationRequest {
  applicationId: string;
  field: string;
  value: any;
  source: string;
  sourceFile?: string;
  confidence: ObservationConfidence;
}

export interface AddRelationRequest {
  sourceId: string;
  sourceType: string;
  targetId: string;
  targetType: string;
  targetName: string;
  relationType: RelationType;
  description?: string;
  source: string;
}

export interface FactSheetFilters {
  sourceProfileId?: string;
  lifecyclePhase?: ApplicationLifecyclePhase[];
  criticality?: ApplicationCriticality[];
  disposition?: MigrationDisposition[];
  waveId?: string;
  search?: string;
  tags?: string[];
  minReadinessScore?: number;
  maxRiskScore?: number;
}

export interface FactSheetSummary {
  id: string;
  name: string;
  vendor?: string;
  lifecyclePhase: ApplicationLifecyclePhase;
  criticality: ApplicationCriticality;
  disposition: MigrationDisposition;
  readinessScore: number;
  riskScore: number;
  relationCount: number;
  completenessScore: number;
}

export interface FactSheetStatistics {
  total: number;
  byLifecycle: Record<ApplicationLifecyclePhase, number>;
  byCriticality: Record<ApplicationCriticality, number>;
  byDisposition: Record<MigrationDisposition, number>;
  byWave: Record<string, number>;
  averageReadiness: number;
  averageRisk: number;
  averageCompleteness: number;
}

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_BASE_INFO: BaseInfoSection = {
  name: '',
  tags: [],
  aliases: [],
};

export const DEFAULT_LIFECYCLE: LifecycleSection = {
  phase: 'active',
};

export const DEFAULT_BUSINESS: BusinessSection = {
  criticality: 'business_operational',
  businessCapabilities: [],
  businessProcesses: [],
  departments: [],
};

export const DEFAULT_TECHNICAL: TechnicalSection = {
  complexity: 'standard',
  languages: [],
  frameworks: [],
  infrastructure: [],
  databases: [],
  integrations: [],
  apisExposed: [],
  apisConsumed: [],
  documentationUrls: [],
};

export const DEFAULT_SECURITY: SecuritySection = {
  dataClassification: 'internal',
  containsPII: false,
  containsPHI: false,
  containsFinancialData: false,
  complianceRequirements: [],
  ssoEnabled: false,
  vulnerabilities: [],
};

export const DEFAULT_MIGRATION: ApplicationMigrationPlan = {
  disposition: 'retain',
  status: 'not_started',
  blockers: [],
  prerequisites: [],
  validationSteps: [],
  riskLevel: 'medium',
  riskFactors: [],
};

export function createDefaultFactSheet(
  id: string,
  sourceProfileId: string,
  name: string
): ApplicationFactSheet {
  const now = new Date().toISOString();
  return {
    id,
    sourceProfileId,
    baseInfo: { ...DEFAULT_BASE_INFO, name },
    lifecycle: { ...DEFAULT_LIFECYCLE },
    business: { ...DEFAULT_BUSINESS },
    technical: { ...DEFAULT_TECHNICAL },
    security: { ...DEFAULT_SECURITY },
    migration: { ...DEFAULT_MIGRATION },
    relations: [],
    observations: [],
    createdAt: now,
    updatedAt: now,
    readinessScore: 0,
    overallRiskScore: 50,
    completenessScore: 0,
  };
}


