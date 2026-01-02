/**
 * Licensing Relations Linker
 *
 * Generates relations for licensing and subscriptions:
 * - company → license (ownership)
 * - user → license (assigned via LicensingDiscovery_UserAssignments)
 *
 * Matches based on SkuId, SkuPartNumber, and assignment records
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
 * Generate licensing and subscription relations
 */
export function run(ctx: LinkContext): SankeyLink[] {
  const links: SankeyLink[] = [];
  const { indices } = ctx;

  console.log('[linkLicensing] Linking licensing and subscription relations...', {
    licenses: indices.byType.get('license')?.length || 0,
    users: indices.byType.get('user')?.length || 0,
    companies: indices.byType.get('company')?.length || 0
  });

  const licenses = indices.byType.get('license') || [];
  const users = indices.byType.get('user') || [];
  const companies = indices.byType.get('company') || [];

  // 1. Company → License ownership relationships
  for (const company of companies) {
    for (const license of licenses) {
      addLink(links, company.id, license.id, 'ownership', 85, 'HIGH', [{
        file: 'licensing-structure',
        fields: ['company', 'license'],
        sourceValue: company.name,
        targetValue: license.name
      }]);
    }
  }

  // 2. User → License (assigned) relationships via LicensingDiscovery_UserAssignments
  console.log('[linkLicensing] Linking users to licenses via assignments...');

  // Find license assignment nodes (these are created from LicensingDiscovery_UserAssignments.csv)
  const licenseAssignments = ctx.nodes.filter(n =>
    n.metadata.source?.includes('userassignment') ||
    n.metadata.source?.includes('licensingdiscovery_userassignments') ||
    n.metadata.category === 'License Assignment'
  );

  for (const assignment of licenseAssignments) {
    const assignmentRecord = assignment.metadata.record;
    const assignmentUPN = assignmentRecord.UserPrincipalName?.toLowerCase();
    const assignmentDisplayName = assignmentRecord.DisplayName?.toLowerCase();
    const skuPartNumber = assignmentRecord.SkuPartNumber?.toLowerCase();
    const skuId = assignmentRecord.SkuId?.toLowerCase();

    // Find user node
    const userNode = (assignmentUPN && indices.byUPN.get(assignmentUPN)) ||
                     (assignmentDisplayName && indices.byMail.get(assignmentDisplayName));

    // Find license node
    const licenseNode = (skuPartNumber && indices.bySkuPartNumber.get(skuPartNumber)) ||
                        (skuId && indices.bySkuId.get(skuId));

    // Create direct user→license link with 'assigned' type
    if (userNode && licenseNode && userNode.id !== licenseNode.id) {
      addLink(links, userNode.id, licenseNode.id, 'assigned', 100, 'EXACT', [{
        file: assignment.metadata.source,
        fields: ['UserPrincipalName', 'SkuPartNumber'],
        sourceValue: assignmentUPN || assignmentDisplayName,
        targetValue: skuPartNumber || skuId
      }]);
    }
  }

  // 3. User → License via AssignedLicenses field (GUID list in user records)
  console.log('[linkLicensing] Linking users to licenses via AssignedLicenses field...');
  for (const user of users) {
    const userRecord = user.metadata.record;
    const assignedLicenses = userRecord.AssignedLicenses;

    if (assignedLicenses) {
      const licenseGuids = assignedLicenses.split(';').map((g: string) => g.trim().toLowerCase()).filter(Boolean);
      for (const guid of licenseGuids) {
        const licenseNode = indices.bySkuId.get(guid) || indices.bySkuPartNumber.get(guid);
        if (licenseNode && licenseNode.id !== user.id) {
          addLink(links, user.id, licenseNode.id, 'assigned', 90, 'HIGH', [{
            file: user.metadata.source,
            fields: ['AssignedLicenses'],
            sourceValue: guid
          }]);
        }
      }
    }
  }

  console.log(`[linkLicensing] Generated ${links.length} licensing and subscription links`);
  return links;
}