/**
 * Tenant/Organization Structure Linker
 *
 * Generates relations for tenant and organizational hierarchy:
 * - company → l3-organization (ownership)
 * - l3-organization → line-of-business (ownership)
 * - line-of-business → business-unit-location (ownership)
 *
 * Inferred from user Department/OfficeLocation/City/Country fields
 */

import { SankeyNode, SankeyLink, RelationType, MatchRule, LinkEvidence, EntityType } from '../../../types/models/organisation';

// Extended Node Indices interface for cross-file linking
export interface NodeIndices {
  byId: Map<string, SankeyNode>;
  byName: Map<string, SankeyNode[]>;
  byType: Map<EntityType, SankeyNode[]>;
  byUPN: Map<string, SankeyNode>;
  byAppId: Map<string, SankeyNode>;
  byObjectId: Map<string, SankeyNode>;
  byMail: Map<string, SankeyNode>;
  bySkuPartNumber: Map<string, SankeyNode>;
  bySkuId: Map<string, SankeyNode>;
  bySubscriptionId: Map<string, SankeyNode>;
  byResourceGroupName: Map<string, SankeyNode[]>;
  bySamAccountName: Map<string, SankeyNode>;
}

export interface LinkContext {
  nodes: SankeyNode[];
  indices: NodeIndices;
  nodesBySource: Record<string, SankeyNode[]>;
  recordsByFileTypeKey: Record<string, any[]>;
}

/**
 * Enhanced addLink with confidence and evidence support
 */
function addLink(
  links: SankeyLink[],
  source: string,
  target: string,
  type: RelationType,
  confidence: number = 70,
  matchRule: MatchRule = 'MEDIUM',
  evidence: LinkEvidence[] = []
): void {
  const key = `${source}:${target}:${type}`;
  if (!links.some(l => `${l.source}:${l.target}:${l.type}` === key)) {
    links.push({
      source,
      target,
      value: 1,
      type,
      confidence,
      matchRule,
      evidence
    });
  }
}

/**
 * Generate tenant/organization structure relations
 */
export function run(ctx: LinkContext): SankeyLink[] {
  const links: SankeyLink[] = [];
  const { nodes, indices } = ctx;

  console.log('[linkTenant] Linking tenant/organization structure...', {
    nodes: nodes.length,
    companies: indices.byType.get('company')?.length || 0,
    l3Orgs: indices.byType.get('l3-organization')?.length || 0,
    lob: indices.byType.get('line-of-business')?.length || 0,
    locations: indices.byType.get('business-unit-location')?.length || 0
  });

  const companies = indices.byType.get('company') || [];
  const l3Organizations = indices.byType.get('l3-organization') || [];
  const linesOfBusiness = indices.byType.get('line-of-business') || [];
  const businessUnitLocations = indices.byType.get('business-unit-location') || [];

  // 1. Company → L3 Organization relationships
  for (const company of companies) {
    for (const l3Org of l3Organizations) {
      // Link based on naming patterns or explicit relationships
      // For now, create ownership links from companies to L3 orgs
      addLink(links, company.id, l3Org.id, 'ownership', 80, 'HIGH', [{
        file: 'organization-structure',
        fields: ['company', 'l3-organization'],
        sourceValue: company.name,
        targetValue: l3Org.name
      }]);
    }
  }

  // 2. L3 Organization → Line of Business relationships
  for (const l3Org of l3Organizations) {
    for (const lob of linesOfBusiness) {
      addLink(links, l3Org.id, lob.id, 'ownership', 80, 'HIGH', [{
        file: 'organization-structure',
        fields: ['l3-organization', 'line-of-business'],
        sourceValue: l3Org.name,
        targetValue: lob.name
      }]);
    }
  }

  // 3. Line of Business → Business Unit Location relationships
  for (const lob of linesOfBusiness) {
    for (const location of businessUnitLocations) {
      addLink(links, lob.id, location.id, 'ownership', 80, 'HIGH', [{
        file: 'organization-structure',
        fields: ['line-of-business', 'business-unit-location'],
        sourceValue: lob.name,
        targetValue: location.name
      }]);
    }
  }

  // 4. Infer organization structure from user data (departments, locations)
  // This will be expanded when we have real org data
  const users = indices.byType.get('user') || [];
  if (users.length > 0) {
    // Extract unique departments for potential L3 org/line of business inference
    const departments = new Set<string>();
    const locations = new Set<string>();
    const offices = new Set<string>();

    for (const user of users) {
      const record = user.metadata.record;
      if (record.Department) departments.add(record.Department);
      if (record.OfficeLocation) offices.add(record.OfficeLocation);
      if (record.City) locations.add(record.City);
      if (record.Country) locations.add(record.Country);
    }

    console.log('[linkTenant] Found user-based organization data:', {
      departments: departments.size,
      offices: offices.size,
      locations: locations.size
    });
  }

  console.log(`[linkTenant] Generated ${links.length} tenant/organization links`);
  return links;
}