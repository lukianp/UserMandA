/**
 * Azure Infrastructure Linker
 *
 * Generates relations for Azure hierarchy and deployment:
 * - company → subscription (ownership)
 * - subscription → resource-group (scoped-to)
 * - resource-group → resource (scoped-to)
 * - application → resource-group (deployment)
 * - resource → datacenter (deployment via location)
 */

import { SankeyNode, SankeyLink, RelationType, MatchRule, LinkEvidence, EntityType } from '../../../types/models/organisation';

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
 * Generate Azure infrastructure relations
 */
export function run(ctx: LinkContext): SankeyLink[] {
  const links: SankeyLink[] = [];
  const { indices } = ctx;

  console.log('[linkAzureInfra] Linking Azure infrastructure...', {
    companies: indices.byType.get('company')?.length || 0,
    subscriptions: indices.byType.get('subscription')?.length || 0,
    resourceGroups: indices.byType.get('resource-group')?.length || 0,
    itComponents: indices.byType.get('it-component')?.length || 0,
    applications: indices.byType.get('application')?.length || 0,
    datacenters: indices.byType.get('datacenter')?.length || 0
  });

  const companies = indices.byType.get('company') || [];
  const subscriptions = indices.byType.get('subscription') || [];
  const resourceGroups = indices.byType.get('resource-group') || [];
  const itComponents = indices.byType.get('it-component') || [];
  const applications = indices.byType.get('application') || [];
  const datacenters = indices.byType.get('datacenter') || [];

  // 1. Company → Subscription (ownership)
  for (const company of companies) {
    for (const subscription of subscriptions) {
      addLink(links, company.id, subscription.id, 'ownership', 85, 'HIGH', [{
        file: 'azure-hierarchy',
        fields: ['company', 'subscription'],
        sourceValue: company.name,
        targetValue: subscription.name
      }]);
    }
  }

  // 2. Subscription → Resource Group (scoped-to)
  for (const rg of resourceGroups) {
    const record = rg.metadata.record;
    const subscriptionId = record.SubscriptionId?.toLowerCase();
    const subscriptionName = record.SubscriptionName;

    // Try SubscriptionId first (highest confidence)
    if (subscriptionId) {
      const subNode = indices.bySubscriptionId.get(subscriptionId);
      if (subNode && subNode.id !== rg.id) {
        addLink(links, subNode.id, rg.id, 'scoped-to', 100, 'EXACT', [{
          file: rg.metadata.source,
          fields: ['SubscriptionId'],
          sourceValue: subscriptionId,
          targetValue: rg.name
        }]);
        continue;
      }
    }

    // Try SubscriptionName (medium confidence - names can collide)
    if (subscriptionName) {
      const subNodes = indices.byName.get(subscriptionName.toLowerCase());
      const subNode = subNodes?.find(n => n.type === 'subscription');
      if (subNode && subNode.id !== rg.id) {
        addLink(links, subNode.id, rg.id, 'scoped-to', 75, 'MEDIUM', [{
          file: rg.metadata.source,
          fields: ['SubscriptionName'],
          sourceValue: subscriptionName,
          targetValue: rg.name
        }]);
      }
    }
  }

  // 3. Resource Group → IT Component (scoped-to) via ResourceGroupName field
  for (const component of itComponents) {
    const record = component.metadata.record;
    const rgName = record.ResourceGroupName || record.ResourceGroup;

    if (rgName) {
      const rgNodes = indices.byResourceGroupName.get(rgName.toLowerCase());
      if (rgNodes && rgNodes.length > 0) {
        const rgNode = rgNodes[0]; // Take first match
        if (rgNode.id !== component.id) {
          addLink(links, rgNode.id, component.id, 'scoped-to', 90, 'HIGH', [{
            file: component.metadata.source,
            fields: ['ResourceGroupName'],
            sourceValue: rgName,
            targetValue: component.name
          }]);
        }
      }
    }
  }

  // 4. Application → Resource Group (deployment) for Azure apps
  for (const app of applications) {
    const record = app.metadata.record;
    const rgName = record.ResourceGroupName || record.ResourceGroup;

    if (rgName) {
      const rgNodes = indices.byResourceGroupName.get(rgName.toLowerCase());
      if (rgNodes && rgNodes.length > 0) {
        const rgNode = rgNodes[0];
        if (rgNode.id !== app.id) {
          addLink(links, app.id, rgNode.id, 'deployment', 85, 'HIGH', [{
            file: app.metadata.source,
            fields: ['ResourceGroupName'],
            sourceValue: app.name,
            targetValue: rgName
          }]);
        }
      }
    }
  }

  // 5. Resource → Datacenter (deployment via Location field)
  // Create datacenter index by location name
  const dcIndex = new Map<string, SankeyNode>();
  for (const dc of datacenters) {
    const name = dc.name.toLowerCase();
    dcIndex.set(name, dc);
    const record = dc.metadata.record;
    if (record.Location) dcIndex.set(record.Location.toLowerCase(), dc);
    if (record.Region) dcIndex.set(record.Region.toLowerCase(), dc);
  }

  // Link IT components to datacenters via location
  for (const component of itComponents) {
    const record = component.metadata.record;
    const location = record.Location || record.Region || record.DataCenter;

    if (location) {
      const dcNode = dcIndex.get(location.toLowerCase());
      if (dcNode && dcNode.id !== component.id) {
        addLink(links, component.id, dcNode.id, 'deployment', 80, 'HIGH', [{
          file: component.metadata.source,
          fields: ['Location'],
          sourceValue: component.name,
          targetValue: location
        }]);
      }
    }
  }

  // Link applications to datacenters via location
  for (const app of applications) {
    const record = app.metadata.record;
    const location = record.Location || record.Region || record.DataCenter;

    if (location) {
      const dcNode = dcIndex.get(location.toLowerCase());
      if (dcNode && dcNode.id !== app.id) {
        addLink(links, app.id, dcNode.id, 'deployment', 80, 'HIGH', [{
          file: app.metadata.source,
          fields: ['Location'],
          sourceValue: app.name,
          targetValue: location
        }]);
      }
    }
  }

  console.log(`[linkAzureInfra] Generated ${links.length} Azure infrastructure links`);
  return links;
}
