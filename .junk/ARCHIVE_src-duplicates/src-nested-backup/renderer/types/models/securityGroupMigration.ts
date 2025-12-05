/**
 * Security group migration models
 */

export interface SecurityGroupItem {
  id: string;
  name: string;
  displayName: string;
  description: string;
  distinguishedName: string;
  samAccountName: string;
  sid: string;
  scope: SecurityGroupScope;
  groupScope: SecurityGroupScope;
  groupType: SecurityGroupType;
  members: string[];
  memberOf: string[];
  nestedGroups: SecurityGroupItem[];
  created: Date;
  modified: Date;
  createdBy: string;
  modifiedBy: string;
  sourceDomain: string;
  targetDomain: string;
  migrationStatus: string;
  customAttributes: Record<string, unknown>;
  isValid: boolean;
}

export enum SecurityGroupScope {
  DomainLocal = 'DomainLocal',
  Global = 'Global',
  Universal = 'Universal',
}

export enum SecurityGroupType {
  Security = 'Security',
  Distribution = 'Distribution',
}

export interface GroupConflict {
  conflictId: string;
  sourceGroup: SecurityGroupItem;
  targetGroup: SecurityGroupItem;
  conflictType: GroupConflictType;
  description: string;
  recommendedResolution: ConflictResolutionStrategy;
  detectedAt: Date;
}

export enum GroupConflictType {
  NameCollision = 'NameCollision',
  SidCollision = 'SidCollision',
  MembershipConflict = 'MembershipConflict',
  PermissionConflict = 'PermissionConflict',
  DependencyConflict = 'DependencyConflict',
}

export enum ConflictResolutionStrategy {
  Skip = 'Skip',
  Rename = 'Rename',
  Merge = 'Merge',
  Replace = 'Replace',
  Manual = 'Manual',
}
