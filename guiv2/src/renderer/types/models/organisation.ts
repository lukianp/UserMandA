/**
 * Organisation Map Type Definitions
 *
 * Complete type system for LeanIX-style Enterprise Architecture visualization
 */

// @ts-expect-error - d3-sankey types not installed, runtime functionality works
import { SankeyNodeMinimal, SankeyLinkMinimal } from 'd3-sankey';

/**
 * Entity Types in Organisation Hierarchy
 * Extended with identity/access types for LeanIX-style navigation
 */
export type EntityType =
  | 'company'
  | 'platform'
  | 'application'
  | 'datacenter'
  | 'provider-interface'
  | 'consumer-interface'
  | 'business-capability'
  | 'it-component'
  // Identity & Access types (NEW)
  | 'user'
  | 'group'
  | 'mailbox'
  | 'license'
  // Azure hierarchy types (NEW)
  | 'subscription'
  | 'resource-group'
  // Organization hierarchy types (NEW)
  | 'l3-organization'
  | 'line-of-business'
  | 'business-unit-location';

/**
 * Entity Status
 */
export type EntityStatus =
  | 'active'
  | 'plan'
  | 'phase-in'
  | 'phase-out'
  | 'end-of-life';

/**
 * Lifecycle Phase
 */
export type LifecyclePhase =
  | 'plan'
  | 'phase-in'
  | 'active'
  | 'phase-out'
  | 'end-of-life';

/**
 * Relation Types (matching LeanIX + Identity/Access semantics)
 */
export type RelationType =
  | 'ownership'        // Company → Platform → Application
  | 'deployment'       // Application → Data Center
  | 'provides'         // Application → Provider Interface
  | 'consumes'         // Consumer Interface → Application
  | 'dependency'       // Application → Application
  | 'realizes'         // Application → Business Capability
  // Identity & Access types (NEW)
  | 'has-mailbox'      // User → Mailbox
  | 'assigned'         // User → License
  | 'member-of'        // User → Group
  | 'manages'          // Manager → Direct Report
  // Azure hierarchy types (NEW)
  | 'scoped-to';       // Resource → Resource Group, RG → Subscription

/**
 * Match Rule for confidence scoring
 */
export type MatchRule = 'EXACT' | 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Evidence for link provenance
 */
export interface LinkEvidence {
  file: string;
  fields: string[];
  sourceValue?: string;
  targetValue?: string;
}

/**
 * Canonical Identifiers for entity matching
 */
export interface CanonicalIdentifiers {
  objectId?: string;         // Azure AD Object ID
  upn?: string;              // User Principal Name (normalized lowercase)
  mail?: string;             // Email address (normalized lowercase)
  appId?: string;            // Application ID
  subscriptionId?: string;   // Azure Subscription ID
  resourceGroupName?: string;// Azure Resource Group name
  skuId?: string;            // License SKU ID
  skuPartNumber?: string;    // License SKU Part Number
  samAccountName?: string;   // On-prem SAM Account Name
}

/**
 * Base Sankey Node (extends d3-sankey)
 * Enhanced with canonical identifiers for cross-file matching
 */
export interface SankeyNode extends SankeyNodeMinimal<SankeyNode, SankeyLink> {
  id: string;
  name: string;
  type: EntityType;
  factSheet: FactSheetData;
  metadata: {
    source: string;
    sourceFile?: string; // Full path to source file
    record: any;
    priority: number; // For LeanIX layer ordering (1=Infrastructure, 4=Business Capabilities)
    category?: string; // LeanIX-style entity category
    // Classification fields (for SP/App promotion/demotion logic)
    originalType?: EntityType; // Type before classification override
    classificationReason?: 'microsoft-first-party' | 'no-enterprise-usage' | 'enterprise-app-promoted' | 'default-mapping';
  };
  // Canonical identifiers for cross-file matching (NEW)
  identifiers?: CanonicalIdentifiers;
}

/**
 * Base Sankey Link (extends d3-sankey)
 * Enhanced with confidence scoring and evidence tracking
 */
export interface SankeyLink extends SankeyLinkMinimal<SankeyNode, SankeyLink> {
  source: string | SankeyNode;
  target: string | SankeyNode;
  value: number;
  type: RelationType;
  // Confidence & Evidence (NEW)
  confidence?: number;          // 0-100 score
  matchRule?: MatchRule;        // How the match was determined
  evidence?: LinkEvidence[];    // Source files and fields used
}

/**
 * Fact Sheet Base Info
 */
export interface FactSheetBaseInfo {
  name: string;
  type: EntityType;
  description: string;
  owner: string;
  status: EntityStatus;
  lifecycle?: LifecyclePhase;
  tags?: string[];
}

/**
 * Relation (incoming/outgoing)
 */
export interface Relation {
  id: string;
  type: RelationType;
  targetId: string;
  targetName: string;
  targetType: EntityType;
  description?: string;
}

/**
 * IT Component
 */
export interface ITComponent {
  id: string;
  name: string;
  type: string;
  version?: string;
  vendor?: string;
  status: EntityStatus;
  description?: string;
}

/**
 * Subscription
 */
export interface Subscription {
  id: string;
  name: string;
  type: string;
  provider: string;
  cost?: number;
  currency?: string;
  renewalDate?: Date;
  status: 'active' | 'cancelled' | 'pending';
}

/**
 * Comment
 */
export interface Comment {
  id: string;
  author: string;
  authorEmail: string;
  timestamp: Date;
  content: string;
  attachments?: string[];
}

/**
 * Todo Item
 */
export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  assignedToEmail?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Resource (documents, links)
 */
export interface Resource {
  id: string;
  name: string;
  type: 'document' | 'link' | 'diagram' | 'spreadsheet';
  url?: string;
  filePath?: string;
  description?: string;
  uploadedBy?: string;
  uploadedAt: Date;
}

/**
 * Metric
 */
export interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  category: string;
  timestamp: Date;
  trend?: 'up' | 'down' | 'stable';
}

/**
 * Survey Response
 */
export interface SurveyResponse {
  id: string;
  surveyName: string;
  question: string;
  answer: string;
  respondent?: string;
  timestamp: Date;
}

/**
 * Complete Fact Sheet Data (9 tabs matching LeanIX)
 */
export interface FactSheetData {
  // Tab 1: Overview
  baseInfo: FactSheetBaseInfo;

  // Tab 2: Relations Explorer
  relations: {
    incoming: Relation[];
    outgoing: Relation[];
  };

  // Tab 3: IT Components
  itComponents: ITComponent[];

  // Tab 4: Subscriptions
  subscriptions: Subscription[];

  // Tab 5: Comments
  comments: Comment[];

  // Tab 6: To-dos
  todos: TodoItem[];

  // Tab 7: Resources
  resources: Resource[];

  // Tab 8: Metrics
  metrics: Metric[];

  // Tab 9: Surveys
  surveys: SurveyResponse[];

  // Metadata
  lastUpdate: Date;
}

/**
 * Organisation Map Data Structure
 */
export interface OrganisationMapData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

/**
 * Filter State
 */
export interface FilterState {
  entityTypes: Set<EntityType>;
  statuses: Set<EntityStatus>;
  searchQuery: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Zoom State
 */
export interface ZoomState {
  level: number;
  minLevel: number;
  maxLevel: number;
  x: number;
  y: number;
}

/**
 * Export Options
 */
export interface ExportOptions {
  format: 'png' | 'pdf' | 'svg' | 'json';
  includeFilters: boolean;
  includeMetadata: boolean;
  paperSize?: 'A4' | 'A3' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

/**
 * CSV Discovery File Reference
 */
export interface DiscoveryFile {
  path: string;
  type: 'users' | 'groups' | 'applications' | 'infrastructure' | 'exchange' | 'generic';
  modifiedDate?: Date;
  recordCount?: number;
}


