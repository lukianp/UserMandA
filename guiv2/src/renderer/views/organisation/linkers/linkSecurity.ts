/**
 * Security Relations Linker
 *
 * Generates relations for security and compliance:
 * - CA policy → apps/groups/users (consumes/controls)
 * - certificate → server/app by hostname/CN match
 * - permission → resource (assigned)
 * - security group → protected resources (ownership)
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
 * Extract hostnames from certificate CN/SAN
 */
function extractCertHostnames(record: any): string[] {
  const hostnames: string[] = [];

  // Common Name
  if (record.Subject) {
    const cnMatch = record.Subject.match(/CN=([^,]+)/i);
    if (cnMatch) hostnames.push(cnMatch[1].toLowerCase());
  }

  // Subject Alternative Names
  const sanFields = [record.SubjectAlternativeNames, record.SAN, record.DNSNames];
  for (const san of sanFields) {
    if (san) {
      const names = san.split(/[;,]/).map((n: string) => n.trim().toLowerCase()).filter(Boolean);
      hostnames.push(...names);
    }
  }

  return [...new Set(hostnames)]; // Deduplicate
}

/**
 * Generate security relations
 */
export function run(ctx: LinkContext): SankeyLink[] {
  const links: SankeyLink[] = [];
  const { indices, nodesBySource } = ctx;

  console.log('[linkSecurity] Analyzing security relations...');

  const applications = indices.byType.get('application') || [];
  const itComponents = indices.byType.get('it-component') || [];
  const users = indices.byType.get('user') || [];
  const groups = indices.byType.get('group') || [];
  const platforms = indices.byType.get('platform') || [];

  // Build hostname index for certificate matching
  const hostnameIndex = new Map<string, SankeyNode>();
  for (const node of [...applications, ...itComponents]) {
    const record = node.metadata.record;
    const hostnames = [
      record.Hostname,
      record.ServerName,
      record.ComputerName,
      record.FQDN,
      record.DNSName,
      record.URL
    ].filter(Boolean);

    for (const hostname of hostnames) {
      // Extract hostname from URL if needed
      let cleanHost = hostname.toLowerCase();
      try {
        const url = new URL(hostname);
        cleanHost = url.hostname;
      } catch {
        // Not a URL, use as-is
      }
      hostnameIndex.set(cleanHost, node);
    }
  }

  // 1. Conditional Access Policy → Apps/Groups/Users
  const caPolicySources = Object.keys(nodesBySource).filter(s =>
    s.includes('conditionalaccess') || s.includes('capolicy')
  );

  for (const source of caPolicySources) {
    const policies = nodesBySource[source] || [];
    for (const policy of policies) {
      const record = policy.metadata.record;

      // Link to included applications
      const includedApps = (record.IncludedApplications || record.TargetApps || '')
        .split(/[;,]/).map((a: string) => a.trim().toLowerCase()).filter(Boolean);

      for (const appRef of includedApps) {
        // Try AppId first
        let appNode = indices.byAppId.get(appRef);
        // Try name match
        if (!appNode) {
          const nameNodes = indices.byName.get(appRef);
          appNode = nameNodes?.find(n => n.type === 'application');
        }

        if (appNode && appNode.id !== policy.id) {
          addLink(links, policy.id, appNode.id, 'consumes', 90, 'HIGH', [{
            file: policy.metadata.source,
            fields: ['IncludedApplications', 'TargetApps'],
            sourceValue: policy.name,
            targetValue: appRef
          }]);
        }
      }

      // Link to included groups
      const includedGroups = (record.IncludedGroups || record.TargetGroups || '')
        .split(/[;,]/).map((g: string) => g.trim().toLowerCase()).filter(Boolean);

      for (const groupRef of includedGroups) {
        let groupNode = indices.byObjectId.get(groupRef);
        if (!groupNode) {
          const nameNodes = indices.byName.get(groupRef);
          groupNode = nameNodes?.find(n => n.type === 'group');
        }

        if (groupNode && groupNode.id !== policy.id) {
          addLink(links, policy.id, groupNode.id, 'consumes', 85, 'HIGH', [{
            file: policy.metadata.source,
            fields: ['IncludedGroups', 'TargetGroups'],
            sourceValue: policy.name,
            targetValue: groupRef
          }]);
        }
      }

      // Link to included users
      const includedUsers = (record.IncludedUsers || record.TargetUsers || '')
        .split(/[;,]/).map((u: string) => u.trim().toLowerCase()).filter(Boolean);

      for (const userRef of includedUsers) {
        let userNode = indices.byUPN.get(userRef) ||
                       indices.byObjectId.get(userRef) ||
                       indices.byMail.get(userRef);

        if (userNode && userNode.id !== policy.id) {
          addLink(links, policy.id, userNode.id, 'consumes', 85, 'HIGH', [{
            file: policy.metadata.source,
            fields: ['IncludedUsers', 'TargetUsers'],
            sourceValue: policy.name,
            targetValue: userRef
          }]);
        }
      }
    }
  }

  // 2. Certificate → Server/App by hostname/CN match
  const certSources = Object.keys(nodesBySource).filter(s =>
    s.includes('certificate') || s.includes('cert') || s.includes('ssl')
  );

  for (const source of certSources) {
    const certificates = nodesBySource[source] || [];
    for (const cert of certificates) {
      const certHostnames = extractCertHostnames(cert.metadata.record);

      for (const hostname of certHostnames) {
        const targetNode = hostnameIndex.get(hostname);
        if (targetNode && targetNode.id !== cert.id) {
          addLink(links, cert.id, targetNode.id, 'provides', 90, 'HIGH', [{
            file: cert.metadata.source,
            fields: ['Subject', 'SubjectAlternativeNames'],
            sourceValue: cert.name,
            targetValue: hostname
          }]);
        }
      }
    }
  }

  // 3. Security Group → Protected Resources (via membership)
  const securityGroups = groups.filter(g =>
    g.metadata.source?.includes('security') ||
    g.metadata.record.GroupType?.includes('Security')
  );

  for (const secGroup of securityGroups) {
    const record = secGroup.metadata.record;
    const members = (record.Members || record.GroupMembers || '')
      .split(/[;,]/).map((m: string) => m.trim().toLowerCase()).filter(Boolean);

    for (const memberRef of members) {
      // Try to find member by various identifiers
      let memberNode = indices.byUPN.get(memberRef) ||
                       indices.byObjectId.get(memberRef) ||
                       indices.byAppId.get(memberRef) ||
                       indices.bySamAccountName.get(memberRef);

      if (!memberNode) {
        const nameNodes = indices.byName.get(memberRef);
        memberNode = nameNodes?.[0]; // Take first match
      }

      if (memberNode && memberNode.id !== secGroup.id) {
        addLink(links, memberNode.id, secGroup.id, 'member-of', 85, 'HIGH', [{
          file: secGroup.metadata.source,
          fields: ['Members', 'GroupMembers'],
          sourceValue: memberRef,
          targetValue: secGroup.name
        }]);
      }
    }
  }

  // 4. Role Assignment → User/Group/App
  const roleAssignmentSources = Object.keys(nodesBySource).filter(s =>
    s.includes('roleassignment') || s.includes('rbac') || s.includes('directoryrole')
  );

  for (const source of roleAssignmentSources) {
    const roleAssignments = nodesBySource[source] || [];
    for (const assignment of roleAssignments) {
      const record = assignment.metadata.record;
      const principalId = record.PrincipalId?.toLowerCase() ||
                         record.ObjectId?.toLowerCase() ||
                         record.AssigneeId?.toLowerCase();

      if (principalId) {
        const principalNode = indices.byObjectId.get(principalId) ||
                             indices.byUPN.get(principalId) ||
                             indices.byAppId.get(principalId);

        if (principalNode && principalNode.id !== assignment.id) {
          addLink(links, assignment.id, principalNode.id, 'assigned', 90, 'EXACT', [{
            file: assignment.metadata.source,
            fields: ['PrincipalId', 'ObjectId', 'AssigneeId'],
            sourceValue: assignment.name,
            targetValue: principalId
          }]);
        }
      }
    }
  }

  console.log(`[linkSecurity] Generated ${links.length} security links`);
  return links;
}
