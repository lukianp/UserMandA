/**
 * Google Workspace Discovery Types
 */

export type GoogleWorkspaceDiscoveryStatus = 'idle' | 'discovering' | 'completed' | 'failed' | 'cancelled';
export type GoogleServiceType = 'users' | 'groups' | 'gmail' | 'drive' | 'calendar' | 'meet' | 'sites';
export type UserStatus = 'active' | 'suspended' | 'archived' | 'deleted';
export type OrgUnitType = 'root' | 'organizational_unit';

export interface GoogleWorkspaceDiscoveryConfig {
  id: string;
  name: string;
  domain: string;
  adminEmail: string;
  serviceAccountKeyPath: string;
  serviceTypes: GoogleServiceType[];
  includeUserDetails: boolean;
  includeGroupMembership: boolean;
  includeMailboxSize: boolean;
  includeDriveUsage: boolean;
  includeCalendarDetails: boolean;
  orgUnits: string[];
  timeout: number;
  schedule?: {
    enabled: boolean;
    cronExpression: string;
    nextRun?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface GoogleWorkspaceDiscoveryResult {
  id: string;
  configId: string;
  startTime: Date;
  endTime?: Date;
  status: GoogleWorkspaceDiscoveryStatus;
  domain: string;
  users: GoogleUser[];
  groups: GoogleGroup[];
  orgUnits: OrgUnit[];
  gmailData?: GmailData;
  driveData?: DriveData;
  calendarData?: CalendarData;
  totalUsersFound: number;
  totalGroupsFound: number;
  totalStorageUsed: number;
  licenseInfo: LicenseInfo[];
  errors: GoogleWorkspaceError[];
  warnings: string[];
}

export interface GoogleUser {
  id: string;
  primaryEmail: string;
  name: {
    fullName: string;
    givenName: string;
    familyName: string;
  };
  isAdmin: boolean;
  isDelegatedAdmin: boolean;
  agreedToTerms: boolean;
  suspended: boolean;
  archived: boolean;
  changePasswordAtNextLogin: boolean;
  ipWhitelisted: boolean;
  creationTime: Date;
  lastLoginTime?: Date;
  orgUnitPath: string;
  customerId: string;
  aliases?: string[];
  nonEditableAliases?: string[];
  emails?: EmailAddress[];
  phones?: Phone[];
  organizations?: Organization[];
  recoveryEmail?: string;
  recoveryPhone?: string;
  thumbnailPhotoUrl?: string;
  includeInGlobalAddressList: boolean;
  mailboxSetup: boolean;
  mailboxSize?: number;
  driveUsage?: number;
  totalQuota?: number;
  licenses: string[];
  groups: string[];
  lastAccessTime?: Date;
  twoStepVerificationEnrolled: boolean;
}

export interface EmailAddress {
  address: string;
  type: string;
  customType?: string;
  primary?: boolean;
}

export interface Phone {
  value: string;
  type: string;
  customType?: string;
  primary?: boolean;
}

export interface Organization {
  name: string;
  title?: string;
  department?: string;
  description?: string;
  costCenter?: string;
  location?: string;
  primary?: boolean;
}

export interface GoogleGroup {
  id: string;
  email: string;
  name: string;
  description?: string;
  directMembersCount: number;
  adminCreated: boolean;
  nonEditableAliases?: string[];
  aliases?: string[];
  settings?: GroupSettings;
  members: GroupMember[];
  createdTime?: Date;
  lastUpdateTime?: Date;
}

export interface GroupSettings {
  whoCanJoin: string;
  whoCanViewMembership: string;
  whoCanViewGroup: string;
  whoCanInvite: string;
  whoCanAdd: string;
  allowExternalMembers: boolean;
  whoCanPostMessage: string;
  allowWebPosting: boolean;
  primaryLanguage: string;
  isArchived: boolean;
  messageModerationLevel: string;
  spamModerationLevel: string;
  replyTo: string;
  customReplyTo?: string;
  includeCustomFooter: boolean;
  customFooterText?: string;
  sendMessageDenyNotification: boolean;
  membersCanPostAsTheGroup: boolean;
  includeInGlobalAddressList: boolean;
  whoCanLeaveGroup: string;
  whoCanContactOwner: string;
  favoriteRepliesOnTop: boolean;
  whoCanApproveMembers: string;
  whoCanBanUsers: string;
  whoCanModerateMembers: string;
  whoCanModerateContent: string;
  whoCanAssistContent: string;
}

export interface GroupMember {
  id: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'MEMBER';
  type: 'USER' | 'GROUP' | 'CUSTOMER';
  status: string;
  deliverySettings?: string;
}

export interface OrgUnit {
  name: string;
  description?: string;
  orgUnitPath: string;
  orgUnitId: string;
  parentOrgUnitPath: string;
  parentOrgUnitId?: string;
  blockInheritance: boolean;
  userCount?: number;
}

export interface GmailData {
  totalMailboxes: number;
  totalStorageUsed: number;
  averageMailboxSize: number;
  largestMailboxes: MailboxInfo[];
  messageStats: {
    totalMessages: number;
    averageMessagesPerUser: number;
  };
}

export interface MailboxInfo {
  userEmail: string;
  userName: string;
  size: number;
  messageCount?: number;
  lastActivityTime?: Date;
}

export interface DriveData {
  totalUsers: number;
  totalStorageUsed: number;
  totalFilesCount: number;
  sharedDrives: SharedDrive[];
  largestUsers: DriveUserInfo[];
  fileTypeDistribution: Record<string, number>;
}

export interface SharedDrive {
  id: string;
  name: string;
  createdTime: Date;
  hidden: boolean;
  restrictions?: {
    adminManagedRestrictions: boolean;
    copyRequiresWriterPermission: boolean;
    domainUsersOnly: boolean;
    driveMembersOnly: boolean;
  };
  capabilities?: {
    canAddChildren: boolean;
    canComment: boolean;
    canCopy: boolean;
    canDeleteDrive: boolean;
    canDownload: boolean;
    canEdit: boolean;
    canManageMembers: boolean;
    canReadRevisions: boolean;
    canRename: boolean;
    canRenameDrive: boolean;
    canShare: boolean;
  };
  storageUsed?: number;
  fileCount?: number;
  memberCount?: number;
}

export interface DriveUserInfo {
  userEmail: string;
  userName: string;
  storageUsed: number;
  fileCount: number;
  sharedFileCount: number;
  lastActivityTime?: Date;
}

export interface CalendarData {
  totalCalendars: number;
  primaryCalendars: number;
  sharedCalendars: number;
  resourceCalendars: CalendarResource[];
  topUsers: CalendarUserInfo[];
}

export interface CalendarResource {
  resourceId: string;
  resourceName: string;
  resourceEmail: string;
  resourceType: string;
  resourceCategory: string;
  resourceDescription?: string;
  capacity?: number;
  buildingId?: string;
  floorName?: string;
  floorSection?: string;
}

export interface CalendarUserInfo {
  userEmail: string;
  userName: string;
  calendarCount: number;
  eventCount?: number;
  sharedCalendars: number;
}

export interface LicenseInfo {
  skuId: string;
  skuName: string;
  productId: string;
  productName: string;
  assignedLicenses: number;
  availableLicenses: number;
}

export interface GoogleWorkspaceError {
  timestamp: Date;
  serviceType: GoogleServiceType;
  message: string;
  code?: string;
  userEmail?: string;
}

export interface GoogleWorkspaceStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalGroups: number;
  totalStorageUsed: number;
  averageStoragePerUser: number;
  licenseUtilization: Record<string, number>;
  topStorageUsers: { email: string; name: string; storage: number; }[];
}

export interface GoogleWorkspaceFilterState {
  searchText: string;
  selectedOrgUnits: string[];
  selectedStatuses: UserStatus[];
  selectedServiceTypes: GoogleServiceType[];
  showOnlyAdmins: boolean;
  storageRange?: { min: number; max: number; };
}


