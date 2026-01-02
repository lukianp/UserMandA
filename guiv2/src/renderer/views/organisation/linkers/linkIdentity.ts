/**
 * Identity Relations Linker
 *
 * Generates relations for identity and access management:
 * - company → user (ownership)
 * - user → mailbox (has-mailbox)
 * - user → group (member-of)
 * - manager → report (manages)
 *
 * Matches based on UPN, ObjectId, email, and display name fields
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
 * Generate identity and access management relations
 */
export function run(ctx: LinkContext): SankeyLink[] {
  const links: SankeyLink[] = [];
  const { indices } = ctx;

  console.log('[linkIdentity] Linking identity and access relations...', {
    users: indices.byType.get('user')?.length || 0,
    mailboxes: indices.byType.get('mailbox')?.length || 0,
    groups: indices.byType.get('group')?.length || 0,
    companies: indices.byType.get('company')?.length || 0
  });

  const users = indices.byType.get('user') || [];
  const mailboxes = indices.byType.get('mailbox') || [];
  const groups = indices.byType.get('group') || [];
  const companies = indices.byType.get('company') || [];

  // 1. Company → User ownership relationships
  for (const company of companies) {
    for (const user of users) {
      addLink(links, company.id, user.id, 'ownership', 85, 'HIGH', [{
        file: 'identity-structure',
        fields: ['company', 'user'],
        sourceValue: company.name,
        targetValue: user.name
      }]);
    }
  }

  // 2. User → Mailbox (has-mailbox) relationships
  console.log('[linkIdentity] Linking users to mailboxes...');
  for (const mailbox of mailboxes) {
    const mailboxRecord = mailbox.metadata.record;
    const upn = mailboxRecord.UserPrincipalName?.toLowerCase();
    const email = mailboxRecord.PrimarySmtpAddress?.toLowerCase();
    const objectId = mailboxRecord.Id?.toLowerCase();

    // Try UPN match first (highest confidence)
    if (upn) {
      const userNode = indices.byUPN.get(upn);
      if (userNode && userNode.id !== mailbox.id) {
        addLink(links, userNode.id, mailbox.id, 'has-mailbox', 100, 'EXACT', [{
          file: mailbox.metadata.source,
          fields: ['UserPrincipalName'],
          sourceValue: upn,
          targetValue: upn
        }]);
        continue;
      }
    }

    // Try ObjectId match (high confidence)
    if (objectId) {
      const userNode = indices.byObjectId.get(objectId);
      if (userNode && userNode.id !== mailbox.id) {
        addLink(links, userNode.id, mailbox.id, 'has-mailbox', 95, 'EXACT', [{
          file: mailbox.metadata.source,
          fields: ['Id'],
          sourceValue: objectId
        }]);
        continue;
      }
    }

    // Try email match (high confidence)
    if (email) {
      const userNode = indices.byMail.get(email);
      if (userNode && userNode.id !== mailbox.id) {
        addLink(links, userNode.id, mailbox.id, 'has-mailbox', 90, 'HIGH', [{
          file: mailbox.metadata.source,
          fields: ['PrimarySmtpAddress'],
          sourceValue: email
        }]);
      }
    }
  }

  // 3. User → Group (member-of) relationships
  console.log('[linkIdentity] Linking users to groups via GroupMemberships...');
  for (const user of users) {
    const userRecord = user.metadata.record;
    const groupMemberships = userRecord.GroupMemberships;

    if (groupMemberships) {
      const membershipList = groupMemberships.split(';').map((g: string) => g.trim()).filter(Boolean);
      for (const groupName of membershipList) {
        // Find group node by name (case-insensitive)
        const groupNodes = indices.byName.get(groupName.toLowerCase());
        if (groupNodes) {
          for (const groupNode of groupNodes) {
            if (groupNode.type === 'group' && groupNode.id !== user.id) {
              // Name-based match is MEDIUM confidence (names can collide)
              addLink(links, user.id, groupNode.id, 'member-of', 75, 'MEDIUM', [{
                file: user.metadata.source,
                fields: ['GroupMemberships'],
                sourceValue: groupName
              }]);
            }
          }
        }
      }
    }
  }

  // 4. Manager → Report (manages) relationships
  console.log('[linkIdentity] Linking managers to direct reports...');
  for (const user of users) {
    const userRecord = user.metadata.record;
    const managerUPN = userRecord.ManagerUPN?.toLowerCase();
    const managerId = userRecord.ManagerId?.toLowerCase();

    // Try ManagerUPN first
    if (managerUPN) {
      const managerNode = indices.byUPN.get(managerUPN);
      if (managerNode && managerNode.id !== user.id) {
        addLink(links, managerNode.id, user.id, 'manages', 100, 'EXACT', [{
          file: user.metadata.source,
          fields: ['ManagerUPN'],
          sourceValue: managerUPN
        }]);
        continue;
      }
    }

    // Try ManagerId
    if (managerId) {
      const managerNode = indices.byObjectId.get(managerId);
      if (managerNode && managerNode.id !== user.id) {
        addLink(links, managerNode.id, user.id, 'manages', 95, 'EXACT', [{
          file: user.metadata.source,
          fields: ['ManagerId'],
          sourceValue: managerId
        }]);
      }
    }
  }

  console.log(`[linkIdentity] Generated ${links.length} identity and access links`);
  return links;
}