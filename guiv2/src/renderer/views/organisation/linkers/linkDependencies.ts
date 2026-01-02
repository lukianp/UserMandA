/**
 * Dependencies Linker
 *
 * Generates relations for service and process dependencies:
 * - ServiceDependency: A → B (dependency)
 * - ProcessDependency: process/app → process/app (dependency)
 * - NetworkConnection: server → server (dependency)
 * - IntegrationFlow: app → app via API/connector references
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
 * Parse hostname from URL or connection string
 */
function extractHostname(value: string): string | null {
  if (!value) return null;

  // Try URL parsing
  try {
    const url = new URL(value);
    return url.hostname.toLowerCase();
  } catch {
    // Not a valid URL, try connection string patterns
  }

  // Try connection string patterns like "Server=hostname;..."
  const serverMatch = value.match(/(?:Server|Host|Data Source|Hostname)=([^;]+)/i);
  if (serverMatch) {
    return serverMatch[1].toLowerCase().split(',')[0]; // Remove port if present
  }

  // Try simple hostname extraction (alphanumeric with dots)
  const hostnameMatch = value.match(/^[a-z0-9][a-z0-9.-]+[a-z0-9]$/i);
  if (hostnameMatch) {
    return value.toLowerCase();
  }

  return null;
}

/**
 * Generate dependency relations
 */
export function run(ctx: LinkContext): SankeyLink[] {
  const links: SankeyLink[] = [];
  const { indices, nodesBySource } = ctx;

  console.log('[linkDependencies] Analyzing dependencies...', {
    applications: indices.byType.get('application')?.length || 0,
    itComponents: indices.byType.get('it-component')?.length || 0
  });

  const applications = indices.byType.get('application') || [];
  const itComponents = indices.byType.get('it-component') || [];
  const allServicesAndApps = [...applications, ...itComponents];

  // Build hostname index for network/service matching
  const hostnameIndex = new Map<string, SankeyNode>();
  for (const node of allServicesAndApps) {
    const record = node.metadata.record;
    const hostnames = [
      record.Hostname,
      record.ServerName,
      record.ComputerName,
      record.FQDN,
      record.DNSName
    ].filter(Boolean);

    for (const hostname of hostnames) {
      hostnameIndex.set(hostname.toLowerCase(), node);
    }
  }

  // Build app name index for API/integration matching
  const appNameIndex = new Map<string, SankeyNode>();
  for (const app of applications) {
    appNameIndex.set(app.name.toLowerCase(), app);
    const record = app.metadata.record;
    if (record.DisplayName) appNameIndex.set(record.DisplayName.toLowerCase(), app);
    if (record.ServiceName) appNameIndex.set(record.ServiceName.toLowerCase(), app);
  }

  // 1. Network Dependencies via ConnectionString / Endpoint references
  for (const node of allServicesAndApps) {
    const record = node.metadata.record;
    const endpoints = [
      record.ConnectionString,
      record.Endpoint,
      record.ServiceEndpoint,
      record.ApiUrl,
      record.BaseUrl,
      record.TargetServer,
      record.RemoteHost
    ].filter(Boolean);

    for (const endpoint of endpoints) {
      const hostname = extractHostname(endpoint);
      if (hostname) {
        const targetNode = hostnameIndex.get(hostname);
        if (targetNode && targetNode.id !== node.id) {
          addLink(links, node.id, targetNode.id, 'dependency', 75, 'MEDIUM', [{
            file: node.metadata.source,
            fields: ['ConnectionString', 'Endpoint', 'ServiceEndpoint'],
            sourceValue: node.name,
            targetValue: hostname
          }]);
        }
      }
    }
  }

  // 2. Service Dependencies via DependsOn / RequiredServices fields
  for (const node of allServicesAndApps) {
    const record = node.metadata.record;
    const dependencies = [
      record.DependsOn,
      record.RequiredServices,
      record.Dependencies,
      record.UpstreamServices
    ].filter(Boolean);

    for (const depField of dependencies) {
      // Split by common delimiters
      const depList = depField.split(/[;,|]/).map((d: string) => d.trim()).filter(Boolean);

      for (const depName of depList) {
        const targetNode = appNameIndex.get(depName.toLowerCase()) ||
                          hostnameIndex.get(depName.toLowerCase());
        if (targetNode && targetNode.id !== node.id) {
          addLink(links, node.id, targetNode.id, 'dependency', 85, 'HIGH', [{
            file: node.metadata.source,
            fields: ['DependsOn', 'RequiredServices', 'Dependencies'],
            sourceValue: node.name,
            targetValue: depName
          }]);
        }
      }
    }
  }

  // 3. Integration/Connector Dependencies via ConnectedApps / IntegratedWith
  for (const app of applications) {
    const record = app.metadata.record;
    const integrations = [
      record.ConnectedApps,
      record.IntegratedWith,
      record.ConnectedServices,
      record.APIConsumers,
      record.DownstreamApps
    ].filter(Boolean);

    for (const intField of integrations) {
      const intList = intField.split(/[;,|]/).map((i: string) => i.trim()).filter(Boolean);

      for (const intName of intList) {
        const targetNode = appNameIndex.get(intName.toLowerCase());
        if (targetNode && targetNode.id !== app.id) {
          // Application consumes another application's services
          addLink(links, app.id, targetNode.id, 'consumes', 80, 'HIGH', [{
            file: app.metadata.source,
            fields: ['ConnectedApps', 'IntegratedWith', 'ConnectedServices'],
            sourceValue: app.name,
            targetValue: intName
          }]);
        }
      }
    }
  }

  // 4. Power Platform / Logic App Connector Dependencies
  const connectorSources = Object.keys(nodesBySource).filter(s =>
    s.includes('connector') || s.includes('powerplatform') || s.includes('logicapp')
  );

  for (const source of connectorSources) {
    const connectorNodes = nodesBySource[source] || [];
    for (const connector of connectorNodes) {
      const record = connector.metadata.record;
      const targetApp = record.ConnectedApp || record.TargetService || record.ServiceName;

      if (targetApp) {
        const targetNode = appNameIndex.get(targetApp.toLowerCase());
        if (targetNode && targetNode.id !== connector.id) {
          addLink(links, connector.id, targetNode.id, 'consumes', 85, 'HIGH', [{
            file: connector.metadata.source,
            fields: ['ConnectedApp', 'TargetService', 'ServiceName'],
            sourceValue: connector.name,
            targetValue: targetApp
          }]);
        }
      }
    }
  }

  console.log(`[linkDependencies] Generated ${links.length} dependency links`);
  return links;
}
