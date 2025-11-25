/**
 * Logic Engine Inference Rules
 * Implementation of all data correlation and inference algorithms
 */

import {
  UserDto, GroupDto, DeviceDto, AppDto, GpoDto, AclEntry,
  ThreatDetectionDTO, DataGovernanceDTO, DataLineageDTO,
  ExternalIdentityDTO, GraphNode, GraphEdge, NodeType, EdgeType
} from '../../renderer/types/models/logicEngine';

/**
 * Mixin class containing all inference rule implementations
 * These methods are designed to be mixed into the main LogicEngineService
 */
export class InferenceRulesMixin {
  // These properties will be available from the main class
  protected usersBySid!: Map<string, UserDto>;
  protected groupsBySid!: Map<string, GroupDto>;
  protected membersByGroupSid!: Map<string, string[]>;
  protected groupsByUserSid!: Map<string, string[]>;
  protected devicesByName!: Map<string, DeviceDto>;
  protected devicesByPrimaryUserSid!: Map<string, DeviceDto[]>;
  protected appsById!: Map<string, AppDto>;
  protected aclByIdentitySid!: Map<string, AclEntry[]>;
  protected drivesByUserSid!: Map<string, any[]>;
  protected gposByGuid!: Map<string, GpoDto>;
  protected gposBySidFilter!: Map<string, GpoDto[]>;
  protected gposByOu!: Map<string, GpoDto[]>;
  protected mailboxByUpn!: Map<string, any>;
  protected rolesByPrincipalId!: Map<string, any[]>;
  protected sqlDbsByKey!: Map<string, any>;
  protected threatsByThreatId!: Map<string, ThreatDetectionDTO>;
  protected threatsByAsset!: Map<string, ThreatDetectionDTO[]>;
  protected governanceByAssetId!: Map<string, DataGovernanceDTO>;
  protected lineageByLineageId!: Map<string, DataLineageDTO>;
  protected lineageBySourceAsset!: Map<string, DataLineageDTO[]>;
  protected lineageByTargetAsset!: Map<string, DataLineageDTO[]>;
  protected externalIdentitiesById!: Map<string, ExternalIdentityDTO>;
  protected nodes!: Map<string, GraphNode>;
  protected edges!: GraphEdge[];
  protected appliedInferenceRules!: string[];

  // Additional properties needed for inference rules
  protected usersByUpn!: Map<string, any>;
  protected threatsByCategory!: Map<string, any[]>;
  protected threatsBySeverity!: Map<string, any[]>;
  protected governanceByOwner!: Map<string, any[]>;
  protected governanceByCompliance!: Map<string, any[]>;
  protected externalIdentitiesByProvider!: Map<string, any[]>;
  protected externalIdentitiesByMappingStatus!: Map<string, any[]>;

  /**
   * Rule 1: ACL Group-User Inference
   * Correlates file system ACLs with group memberships to determine user permissions
   */
  public applyAclGroupUserInference(): void {
    console.log('Applying ACL→Group→User inference rules');
    let aclExpansionCount = 0;

    // Iterate through all ACL entries
    Array.from(this.aclByIdentitySid.entries()).forEach(([identitySid, entries]) => {
      // Check if this identity is a group
      const group = this.groupsBySid.get(identitySid);
      if (group) {
        // Expand ACL entries to all group members
        const members = this.membersByGroupSid.get(identitySid) || [];
        members.forEach(memberSid => {
          // Add ACL entries for each member
          const memberAcls = this.aclByIdentitySid.get(memberSid) || [];
          entries.forEach(entry => {
            // Create derived ACL entry for the member
            const derivedEntry: AclEntry = {
              ...entry,
              IdentitySid: memberSid // Update to member's SID
            };
            memberAcls.push(derivedEntry);
          });
          this.aclByIdentitySid.set(memberSid, memberAcls);
          aclExpansionCount++;
        });

        // Handle nested groups recursively
        if (group.NestedGroups) {
          group.NestedGroups.forEach(nestedGroupSid => {
            const nestedMembers = this.membersByGroupSid.get(nestedGroupSid) || [];
            nestedMembers.forEach(memberSid => {
              const memberAcls = this.aclByIdentitySid.get(memberSid) || [];
              entries.forEach(entry => {
                const derivedEntry: AclEntry = {
                  ...entry,
                  IdentitySid: memberSid,
                  Inherited: true // Mark as inherited through nested group
                };
                memberAcls.push(derivedEntry);
              });
              this.aclByIdentitySid.set(memberSid, memberAcls);
              aclExpansionCount++;
            });
          });
        }
      }
    });

    this.appliedInferenceRules.push(`ACL→Group→User expansion: ${aclExpansionCount} derived permissions`);
    console.log(`Expanded ${aclExpansionCount} ACL entries through group memberships`);
  }

  /**
   * Rule 2: Primary Device Inference
   * Determines primary device for each user based on login frequency and recency
   */
  public applyPrimaryDeviceInference(): void {
    console.log('Applying primary device inference rules');
    let primaryDeviceAssignments = 0;

    // Infer primary devices based on device ownership
    this.devicesByName.forEach(device => {
      if (device.PrimaryUserSid) {
        // Update user's primary device list
        const devices = this.devicesByPrimaryUserSid.get(device.PrimaryUserSid) || [];
        if (!devices.includes(device)) {
          devices.push(device);
          this.devicesByPrimaryUserSid.set(device.PrimaryUserSid, devices);
          primaryDeviceAssignments++;
        }

        // Create graph edge for primary user relationship
        const userNodeId = `User_${device.PrimaryUserSid}`;
        const deviceNodeId = `Device_${device.Name}`;

        this.edges.push({
          SourceId: userNodeId,
          TargetId: deviceNodeId,
          Type: EdgeType.PrimaryUser
        });
      }
    });

    this.appliedInferenceRules.push(`Primary device inference: ${primaryDeviceAssignments} assignments`);
    console.log(`Assigned ${primaryDeviceAssignments} primary device relationships`);
  }

  /**
   * Rule 3: GPO Security Filter Inference
   * Determines which GPOs apply to users based on security filters
   */
  public applyGpoSecurityFilterInference(): void {
    console.log('Applying GPO security filter inference rules');
    let gpoFilterCount = 0;

    this.gposByGuid.forEach(gpo => {
      // Process security filters
      gpo.SecurityFilter.forEach(filterSid => {
        // Check if filter applies to a group
        const group = this.groupsBySid.get(filterSid);
        if (group) {
          // Expand to all group members
          const members = this.membersByGroupSid.get(filterSid) || [];
          members.forEach(memberSid => {
            const userGpos = this.gposBySidFilter.get(memberSid) || [];
            if (!userGpos.includes(gpo)) {
              userGpos.push(gpo);
              this.gposBySidFilter.set(memberSid, userGpos);
              gpoFilterCount++;
            }
          });
        } else {
          // Direct user filter
          const userGpos = this.gposBySidFilter.get(filterSid) || [];
          if (!userGpos.includes(gpo)) {
            userGpos.push(gpo);
            this.gposBySidFilter.set(filterSid, userGpos);
            gpoFilterCount++;
          }
        }
      });

      // Process OU links
      gpo.Links.forEach(ou => {
        const ouGpos = this.gposByOu.get(ou) || [];
        if (!ouGpos.includes(gpo)) {
          ouGpos.push(gpo);
          this.gposByOu.set(ou, ouGpos);
        }
      });
    });

    this.appliedInferenceRules.push(`GPO security filter inference: ${gpoFilterCount} user-GPO links`);
    console.log(`Created ${gpoFilterCount} user-GPO relationships through security filters`);
  }

  /**
   * Rule 4: Application Usage Inference
   * Links users to applications based on device installations and usage patterns
   */
  public applyApplicationUsageInference(): void {
    console.log('Applying application usage inference rules');
    let appUsageLinks = 0;

    // Build app-device relationships from device installed apps
    this.devicesByName.forEach(device => {
      device.InstalledApps.forEach(appName => {
        // Try exact match first
        let app = this.appsById.get(appName);

        // If no exact match, try fuzzy matching
        if (!app) {
          app = this.fuzzyMatchApplication(appName, Array.from(this.appsById.keys()));
        }

        if (app) {
          // Create device-app edge
          const deviceNodeId = `Device_${device.Name}`;
          const appNodeId = `App_${app.Id}`;

          this.edges.push({
            SourceId: deviceNodeId,
            TargetId: appNodeId,
            Type: EdgeType.HasApp
          });

          // If device has a primary user, link user to app
          if (device.PrimaryUserSid) {
            const userNodeId = `User_${device.PrimaryUserSid}`;
            this.edges.push({
              SourceId: userNodeId,
              TargetId: appNodeId,
              Type: EdgeType.HasApp,
              Properties: { via: device.Name }
            });
            appUsageLinks++;
          }
        }
      });
    });

    this.appliedInferenceRules.push(`Application usage inference: ${appUsageLinks} user-app links`);
    console.log(`Created ${appUsageLinks} user-application relationships`);
  }

  /**
   * Rule 5: Azure Role Inference
   * Maps Azure roles to on-premises identities
   */
  public applyAzureRoleInference(): void {
    console.log('Applying Azure role inference rules');
    let linkedRolesCount = 0;
    let azureUserMappings = 0;

    // Link Azure roles to users via Azure Object ID
    this.usersBySid.forEach(user => {
      if (user.AzureObjectId) {
        const roles = this.rolesByPrincipalId.get(user.AzureObjectId);
        if (roles && roles.length > 0) {
          linkedRolesCount += roles.length;
          azureUserMappings++;

          // Create edges for role assignments
          roles.forEach(role => {
            const userNodeId = `User_${user.Sid}`;
            const roleNodeId = `Role_${role.RoleName}_${role.Scope}`;

            // Create role node if it doesn't exist
            if (!this.nodes.has(roleNodeId)) {
              this.nodes.set(roleNodeId, {
                Id: roleNodeId,
                Type: NodeType.Role,
                Properties: { name: role.RoleName, scope: role.Scope }
              });
            }

            this.edges.push({
              SourceId: userNodeId,
              TargetId: roleNodeId,
              Type: EdgeType.AssignedRole
            });
          });
        }
      }
    });

    this.appliedInferenceRules.push(`Azure role inference: ${linkedRolesCount} roles linked to ${azureUserMappings} users`);
    console.log(`Linked ${linkedRolesCount} Azure roles to ${azureUserMappings} users`);
  }

  /**
   * Rule 6: SQL Database Ownership Inference
   * Determines database ownership and access patterns
   */
  public applySqlOwnershipInference(): void {
    console.log('Applying SQL database ownership inference rules');
    let ownershipLinks = 0;

    this.sqlDbsByKey.forEach(sqlDb => {
      sqlDb.Owners.forEach((ownerSid: string) => {
        // Check if owner is a user
        const user = this.usersBySid.get(ownerSid);
        if (user) {
          const dbNodeId = `Db_${sqlDb.Server}_${sqlDb.Database}`;
          const userNodeId = `User_${user.Sid}`;

          // Create database node if it doesn't exist
          if (!this.nodes.has(dbNodeId)) {
            this.nodes.set(dbNodeId, {
              Id: dbNodeId,
              Type: NodeType.Db,
              Properties: {
                server: sqlDb.Server,
                database: sqlDb.Database,
                instance: sqlDb.Instance
              }
            });
          }

          this.edges.push({
            SourceId: userNodeId,
            TargetId: dbNodeId,
            Type: EdgeType.OwnsDb
          });
          ownershipLinks++;
        }

        // Check if owner is a group
        const group = this.groupsBySid.get(ownerSid);
        if (group) {
          // Expand ownership to group members
          const members = this.membersByGroupSid.get(ownerSid) || [];
          members.forEach(memberSid => {
            const dbNodeId = `Db_${sqlDb.Server}_${sqlDb.Database}`;
            const userNodeId = `User_${memberSid}`;

            this.edges.push({
              SourceId: userNodeId,
              TargetId: dbNodeId,
              Type: EdgeType.OwnsDb,
              Properties: { viaGroup: group.Name }
            });
            ownershipLinks++;
          });
        }
      });
    });

    this.appliedInferenceRules.push(`SQL ownership inference: ${ownershipLinks} ownership relationships`);
    console.log(`Created ${ownershipLinks} database ownership relationships`);
  }

  /**
   * Rule 7: Threat Asset Correlation Inference
   * Correlates detected threats with affected assets
   */
  public applyThreatAssetCorrelationInference(): void {
    console.log('Applying threat-asset correlation inference rules');
    let threatCorrelations = 0;

    this.threatsByThreatId.forEach(threat => {
      threat.AffectedAssets.forEach(assetId => {
        // Add to threat-by-asset index
        const assetThreats = this.threatsByAsset.get(assetId) || [];
        if (!assetThreats.includes(threat)) {
          assetThreats.push(threat);
          this.threatsByAsset.set(assetId, assetThreats);
        }

        // Check if asset is a user
        const user = this.usersBySid.get(assetId) || this.usersByUpn.get(assetId);
        if (user) {
          const userNodeId = `User_${user.Sid}`;
          const threatNodeId = `Threat_${threat.ThreatId}`;

          // Create threat node if it doesn't exist
          if (!this.nodes.has(threatNodeId)) {
            this.nodes.set(threatNodeId, {
              Id: threatNodeId,
              Type: NodeType.Threat,
              Properties: {
                name: threat.ThreatName,
                severity: threat.Severity,
                category: threat.Category
              }
            });
          }

          this.edges.push({
            SourceId: threatNodeId,
            TargetId: userNodeId,
            Type: EdgeType.Threatens
          });
          threatCorrelations++;
        }

        // Check if asset is a device
        const device = this.devicesByName.get(assetId);
        if (device) {
          const deviceNodeId = `Device_${device.Name}`;
          const threatNodeId = `Threat_${threat.ThreatId}`;

          this.edges.push({
            SourceId: threatNodeId,
            TargetId: deviceNodeId,
            Type: EdgeType.Threatens
          });
          threatCorrelations++;
        }
      });

      // Index by category and severity
      const categoryThreats = this.threatsByCategory.get(threat.Category) || [];
      if (!categoryThreats.includes(threat)) {
        categoryThreats.push(threat);
        this.threatsByCategory.set(threat.Category, categoryThreats);
      }

      const severityThreats = this.threatsBySeverity.get(threat.Severity) || [];
      if (!severityThreats.includes(threat)) {
        severityThreats.push(threat);
        this.threatsBySeverity.set(threat.Severity, severityThreats);
      }
    });

    this.appliedInferenceRules.push(`Threat-asset correlation: ${threatCorrelations} correlations`);
    console.log(`Created ${threatCorrelations} threat-asset correlations`);
  }

  /**
   * Rule 8: Governance Risk Inference
   * Correlates governance issues with asset ownership
   */
  public applyGovernanceRiskInference(): void {
    console.log('Applying governance risk inference rules');
    let governanceLinks = 0;

    this.governanceByAssetId.forEach(governance => {
      // Link governance issues to asset owners
      if (governance.Owner) {
        const owner = this.usersBySid.get(governance.Owner) ||
                      this.usersByUpn.get(governance.Owner);
        if (owner) {
          const ownerGovIssues = this.governanceByOwner.get(owner.Sid) || [];
          if (!ownerGovIssues.includes(governance)) {
            ownerGovIssues.push(governance);
            this.governanceByOwner.set(owner.Sid, ownerGovIssues);
            governanceLinks++;
          }

          // Create graph edge
          const userNodeId = `User_${owner.Sid}`;
          const assetNodeId = `DataAsset_${governance.AssetId}`;

          if (!this.nodes.has(assetNodeId)) {
            this.nodes.set(assetNodeId, {
              Id: assetNodeId,
              Type: NodeType.DataAsset,
              Properties: {
                name: governance.AssetName,
                type: governance.AssetType,
                classification: governance.Classification
              }
            });
          }

          this.edges.push({
            SourceId: userNodeId,
            TargetId: assetNodeId,
            Type: EdgeType.HasGovernanceIssue
          });
        }
      }

      // Index by compliance status
      const complianceGovIssues = this.governanceByCompliance.get(governance.ComplianceStatus) || [];
      if (!complianceGovIssues.includes(governance)) {
        complianceGovIssues.push(governance);
        this.governanceByCompliance.set(governance.ComplianceStatus, complianceGovIssues);
      }
    });

    this.appliedInferenceRules.push(`Governance risk inference: ${governanceLinks} owner-asset links`);
    console.log(`Created ${governanceLinks} governance-owner relationships`);
  }

  /**
   * Rule 9: Data Lineage Integrity Inference
   * Builds data lineage graph and identifies integrity issues
   */
  public applyLineageIntegrityInference(): void {
    console.log('Applying data lineage integrity inference rules');
    let lineageLinks = 0;
    let orphanedFlows = 0;
    let brokenLinks = 0;

    this.lineageByLineageId.forEach(lineage => {
      // Create lineage flow nodes
      const sourceNodeId = `DataAsset_${lineage.SourceAssetId}`;
      const targetNodeId = `DataAsset_${lineage.TargetAssetId}`;
      const flowNodeId = `LineageFlow_${lineage.LineageId}`;

      // Create nodes if they don't exist
      if (!this.nodes.has(sourceNodeId)) {
        this.nodes.set(sourceNodeId, {
          Id: sourceNodeId,
          Type: NodeType.DataAsset,
          Properties: {
            name: lineage.SourceAssetName,
            type: lineage.SourceAssetType
          }
        });
      }

      if (!this.nodes.has(targetNodeId)) {
        this.nodes.set(targetNodeId, {
          Id: targetNodeId,
          Type: NodeType.DataAsset,
          Properties: {
            name: lineage.TargetAssetName,
            type: lineage.TargetAssetType
          }
        });
      }

      if (!this.nodes.has(flowNodeId)) {
        this.nodes.set(flowNodeId, {
          Id: flowNodeId,
          Type: NodeType.LineageFlow,
          Properties: {
            transformationType: lineage.TransformationType,
            dataFlow: lineage.DataFlow
          }
        });
      }

      // Create edges
      this.edges.push({
        SourceId: sourceNodeId,
        TargetId: flowNodeId,
        Type: EdgeType.DataFlowTo
      });

      this.edges.push({
        SourceId: flowNodeId,
        TargetId: targetNodeId,
        Type: EdgeType.DataFlowTo
      });

      lineageLinks += 2;

      // Index by source and target
      const sourceFlows = this.lineageBySourceAsset.get(lineage.SourceAssetId) || [];
      if (!sourceFlows.includes(lineage)) {
        sourceFlows.push(lineage);
        this.lineageBySourceAsset.set(lineage.SourceAssetId, sourceFlows);
      }

      const targetFlows = this.lineageByTargetAsset.get(lineage.TargetAssetId) || [];
      if (!targetFlows.includes(lineage)) {
        targetFlows.push(lineage);
        this.lineageByTargetAsset.set(lineage.TargetAssetId, targetFlows);
      }

      // Track issues
      if (lineage.IsOrphaned) orphanedFlows++;
      if (lineage.HasBrokenLinks) brokenLinks++;
    });

    this.appliedInferenceRules.push(`Lineage integrity: ${lineageLinks} flows, ${orphanedFlows} orphaned, ${brokenLinks} broken`);
    console.log(`Created ${lineageLinks} lineage relationships, found ${orphanedFlows} orphaned flows and ${brokenLinks} broken links`);
  }

  /**
   * Rule 10: External Identity Mapping Inference
   * Correlates external identities with internal users
   */
  public applyExternalIdentityMappingInference(): void {
    console.log('Applying external identity mapping inference rules');
    let mappedIdentities = 0;
    let conflictedMappings = 0;

    this.externalIdentitiesById.forEach(externalId => {
      // Try to map to internal user
      let mappedUser: UserDto | undefined;

      // Try exact UPN match
      if (externalId.ExternalUserEmail) {
        mappedUser = this.usersByUpn.get(externalId.ExternalUserEmail);
      }

      // Try fuzzy matching if no exact match
      if (!mappedUser && externalId.ExternalDisplayName) {
        mappedUser = this.fuzzyMatchUser(externalId.ExternalDisplayName, 'DisplayName');
      }

      if (mappedUser) {
        // Update mapping
        externalId.InternalUserSid = mappedUser.Sid;
        externalId.MappingStatus = 'Mapped';
        mappedIdentities++;

        // Create graph edge
        const userNodeId = `User_${mappedUser.Sid}`;
        const extIdNodeId = `ExternalIdentity_${externalId.ExternalIdentityId}`;

        if (!this.nodes.has(extIdNodeId)) {
          this.nodes.set(extIdNodeId, {
            Id: extIdNodeId,
            Type: NodeType.ExternalIdentity,
            Properties: {
              provider: externalId.ExternalProvider,
              userId: externalId.ExternalUserId,
              email: externalId.ExternalUserEmail
            }
          });
        }

        this.edges.push({
          SourceId: userNodeId,
          TargetId: extIdNodeId,
          Type: EdgeType.ExternalMapping
        });
      } else {
        // Mark as unmapped
        externalId.MappingStatus = 'Unmapped';
      }

      // Index by provider
      const providerIds = this.externalIdentitiesByProvider.get(externalId.ExternalProvider) || [];
      if (!providerIds.includes(externalId)) {
        providerIds.push(externalId);
        this.externalIdentitiesByProvider.set(externalId.ExternalProvider, providerIds);
      }

      // Index by mapping status
      const statusIds = this.externalIdentitiesByMappingStatus.get(externalId.MappingStatus) || [];
      if (!statusIds.includes(externalId)) {
        statusIds.push(externalId);
        this.externalIdentitiesByMappingStatus.set(externalId.MappingStatus, statusIds);
      }

      if (externalId.MappingStatus === 'Unmapped') {
        conflictedMappings++;
      }
    });

    this.appliedInferenceRules.push(`External identity mapping: ${mappedIdentities} mapped, ${conflictedMappings} conflicts`);
    console.log(`Mapped ${mappedIdentities} external identities, found ${conflictedMappings} conflicts`);
  }

  // Helper methods for fuzzy matching

  private fuzzyMatchApplication(appNameCandidate: string, installedApps: string[]): AppDto | undefined {
    let bestMatch: AppDto | undefined;
    let bestSimilarity = 0;

    installedApps.forEach(appId => {
      const app = this.appsById.get(appId);
      if (app) {
        const similarity = this.calculateLevenshteinSimilarity(appNameCandidate, app.Name);
        if (similarity >= 0.8 && similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = app;
        }
      }
    });

    if (bestMatch) {
      this.appliedInferenceRules.push(`Fuzzy app match: '${appNameCandidate}' -> '${bestMatch.Name}' (similarity: ${(bestSimilarity * 100).toFixed(1)}%)`);
    }

    return bestMatch;
  }

  private fuzzyMatchUser(searchTerm: string, searchType: 'DisplayName' | 'UPN' | 'Mail' = 'DisplayName'): UserDto | undefined {
    let bestMatch: UserDto | undefined;
    let bestSimilarity = 0;

    this.usersBySid.forEach(user => {
      const targetValue = searchType === 'UPN' ? user.UPN :
                         searchType === 'Mail' ? user.Mail :
                         user.DisplayName;

      if (targetValue) {
        const similarity = this.calculateLevenshteinSimilarity(searchTerm, targetValue);
        if (similarity >= 0.8 && similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = user;
        }
      }
    });

    if (bestMatch) {
      this.appliedInferenceRules.push(`Fuzzy user match: '${searchTerm}' -> '${bestMatch.DisplayName}' (similarity: ${(bestSimilarity * 100).toFixed(1)}%)`);
    }

    return bestMatch;
  }

  /**
   * Calculate Levenshtein similarity ratio (0.0 to 1.0)
   */
  private calculateLevenshteinSimilarity(s1: string, s2: string): number {
    if (!s1 || !s2) {
      return (!s1 && !s2) ? 1.0 : 0.0;
    }

    const len1 = s1.length;
    const len2 = s2.length;
    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Calculate distances
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1.0 : 1.0 - (distance / maxLen);
  }
}