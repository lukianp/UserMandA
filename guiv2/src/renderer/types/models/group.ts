/**
 * Group data model interfaces
 *
 * Represents Active Directory and Azure AD groups
 */

export interface GroupData {
  id: string;
  objectId: string;
  name: string;
  displayName: string;
  description?: string;
  email?: string;
  groupType: GroupType;
  scope: GroupScope;
  membershipType: MembershipType;
  memberCount: number;
  owners: string[];
  createdDate: string;
  lastModified: string;
  source: 'ActiveDirectory' | 'AzureAD' | 'Hybrid';
  syncStatus?: SyncStatus;
  distinguishedName?: string;
  managedBy?: string;
  isSecurityEnabled: boolean;
  isMailEnabled: boolean;
  proxyAddresses?: string[];
  attributes?: Record<string, any>;
}

export enum GroupType {
  Security = 'Security',
  Distribution = 'Distribution',
  MailEnabled = 'MailEnabled',
  Office365 = 'Office365',
  Dynamic = 'Dynamic'
}

export enum GroupScope {
  Universal = 'Universal',
  Global = 'Global',
  DomainLocal = 'DomainLocal',
  None = 'None'
}

export enum MembershipType {
  Static = 'Static',
  Dynamic = 'Dynamic',
  RuleBased = 'RuleBased'
}

export interface SyncStatus {
  isSynced: boolean;
  lastSyncTime?: string;
  syncErrors?: string[];
  pendingChanges?: number;
}

export interface GroupMember {
  id: string;
  type: 'User' | 'Group' | 'Device' | 'ServicePrincipal';
  displayName: string;
  email?: string;
  addedDate: string;
  membershipRule?: string;
}

export interface GroupOwner {
  id: string;
  displayName: string;
  email: string;
  type: 'User' | 'ServicePrincipal';
}

export interface GroupCreationRequest {
  name: string;
  displayName: string;
  description?: string;
  groupType: GroupType;
  scope: GroupScope;
  membershipType: MembershipType;
  owners?: string[];
  members?: string[];
  isSecurityEnabled: boolean;
  isMailEnabled: boolean;
  mailNickname?: string;
  membershipRule?: string;
}

export interface GroupUpdateRequest {
  displayName?: string;
  description?: string;
  owners?: string[];
  members?: string[];
  membershipRule?: string;
  managedBy?: string;
}

export interface GroupValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface GroupMigrationMapping {
  sourceGroupId: string;
  targetGroupId?: string;
  mappingStatus: 'Pending' | 'Mapped' | 'Validated' | 'Migrated' | 'Failed';
  validationResult?: GroupValidation;
  conflictResolution?: 'Skip' | 'Merge' | 'Replace' | 'CreateNew';
  lastAttempt?: string;
  error?: string;
}

