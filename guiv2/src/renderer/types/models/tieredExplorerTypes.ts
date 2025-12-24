/**
 * Tiered Explorer Types (LeanIX-style column layout)
 *
 * These types support the column-based relations explorer view
 */

import { EntityType, RelationType, SankeyNode } from './organisation';

/**
 * Explorer Node - simplified node for tiered display
 */
export interface ExplorerNode {
  id: string;
  label: string;
  factSheetType: EntityType;
  category?: string;
  iconKey?: string;
  metadata?: Record<string, unknown>;
  sourceNode?: SankeyNode; // Reference to original node
}

/**
 * Relation Group - collapsible bucket of related entities
 */
export interface RelationGroup {
  key: string;
  label: string;
  relationType: RelationType;
  count: number;
  colorKey: string;
  iconKey?: string;
  entityIds: string[]; // IDs of entities in this group
}

/**
 * Explorer Column - single column in the tiered layout
 */
export interface ExplorerColumn {
  id: string;
  type: 'entity' | 'relationGroups' | 'entities';
  parentEntityId: string;
  parentRelationGroup?: string;
  selectedItemId?: string;
  items: RelationGroup[] | ExplorerNode[];
}

/**
 * Breadcrumb Item - for navigation trail
 */
export interface BreadcrumbItem {
  id: string;
  label: string;
  type: EntityType;
  columnIndex: number;
}

/**
 * Explorer State - complete state for tiered explorer
 */
export interface ExplorerState {
  rootEntityId: string;
  columns: ExplorerColumn[];
  selectedEntityId?: string;
  breadcrumb: BreadcrumbItem[];
  detailPanelOpen: boolean;
}

/**
 * Relation group color mapping
 */
export const RELATION_GROUP_COLORS: Record<string, string> = {
  'applications': '#10b981',      // emerald
  'it-components': '#84cc16',     // lime
  'platforms': '#8b5cf6',         // violet
  'infrastructure': '#f59e0b',    // amber
  'users': '#22d3ee',             // cyan
  'groups': '#a855f7',            // purple
  'business-capabilities': '#6366f1', // indigo
  'interfaces': '#ec4899',        // pink
  'company': '#3b82f6',           // blue
  'default': '#6b7280'            // gray
};

/**
 * Entity type to relation group key mapping
 */
export const ENTITY_TYPE_TO_GROUP: Record<EntityType, string> = {
  'application': 'applications',
  'it-component': 'it-components',
  'platform': 'platforms',
  'datacenter': 'infrastructure',
  'company': 'company',
  'business-capability': 'business-capabilities',
  'provider-interface': 'interfaces',
  'consumer-interface': 'interfaces'
};

/**
 * Category-based grouping (takes precedence over EntityType)
 * Maps metadata.category values to relation group keys
 */
export const CATEGORY_TO_GROUP: Record<string, string> = {
  // Users & Identity
  'User': 'users',
  'External User': 'users',
  'Guest User': 'users',

  // Groups & Teams
  'Group': 'groups',
  'Microsoft Teams': 'groups',
  'Distribution List': 'groups',
  'Security Group': 'groups',

  // Azure/Cloud Infrastructure
  'Subscription': 'infrastructure',
  'Tenant': 'infrastructure',
  'Resource Group': 'infrastructure',
  'Storage': 'infrastructure',

  // Identity/Security
  'Service Principal': 'platforms',
  'Directory Role': 'platforms',
  'EntraID App': 'applications',

  // Databases
  'Database': 'it-components',

  // Network
  'Network': 'it-components'
};

/**
 * Get the relation group key for a node, considering both category and type
 */
export function getGroupKeyForNode(type: EntityType, category?: string): string {
  // Category takes precedence if it maps to a specific group
  if (category && CATEGORY_TO_GROUP[category]) {
    return CATEGORY_TO_GROUP[category];
  }
  // Fall back to entity type mapping
  return ENTITY_TYPE_TO_GROUP[type] || 'default';
}
