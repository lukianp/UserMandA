/**
 * Exchange Discovery Type Definitions
 * Defines all types for Exchange Online and On-Premises discovery
 */

// ============================================================================
// Core Exchange Types
// ============================================================================

export type MailboxType =
  | 'UserMailbox'
  | 'SharedMailbox'
  | 'RoomMailbox'
  | 'EquipmentMailbox'
  | 'DiscoveryMailbox';

export type MailboxPermissionType =
  | 'FullAccess'
  | 'SendAs'
  | 'SendOnBehalf';

export type RecipientType =
  | 'UserMailbox'
  | 'SharedMailbox'
  | 'DistributionGroup'
  | 'MailUser'
  | 'MailContact';

export interface ExchangeMailbox {
  id: string;
  displayName: string;
  userPrincipalName: string;
  primarySmtpAddress: string;
  emailAddresses: string[];
  mailboxType: MailboxType;

  // Size and quotas
  totalItemSize: number; // bytes
  itemCount: number;
  issueWarningQuota: number; // bytes
  prohibitSendQuota: number; // bytes
  prohibitSendReceiveQuota: number; // bytes
  useDatabaseQuotaDefaults: boolean;

  // Archive
  archiveEnabled: boolean;
  archiveSize?: number;
  archiveQuota?: number;
  archiveWarningQuota?: number;

  // Settings
  litigationHoldEnabled: boolean;
  retentionHoldEnabled: boolean;
  retentionPolicy?: string;
  forwardingAddress?: string;
  forwardingSmtpAddress?: string;
  deliverToMailboxAndForward: boolean;

  // Permissions
  permissions: MailboxPermission[];

  // Metadata
  whenCreated: Date;
  whenChanged: Date;
  lastLogonTime?: Date;
  isInactive: boolean;
  recipientTypeDetails: string;

  // Mobile devices
  activeSyncEnabled: boolean;
  mobileDeviceCount: number;

  // Additional properties
  customAttributes?: Record<string, string>;
  extensionAttributes?: Record<string, string>;
}

export interface MailboxPermission {
  user: string;
  permissionType: MailboxPermissionType;
  inherited: boolean;
  grantedOn: Date;
}

export interface ExchangeDistributionGroup {
  id: string;
  displayName: string;
  alias: string;
  primarySmtpAddress: string;
  emailAddresses: string[];
  groupType: 'Security' | 'Distribution';

  // Membership
  memberCount: number;
  members: string[];
  owners: string[];
  moderators: string[];

  // Settings
  requireSenderAuthenticationEnabled: boolean;
  moderationEnabled: boolean;
  sendModerationNotifications: string;
  hiddenFromAddressListsEnabled: boolean;

  // External
  acceptMessagesOnlyFrom: string[];
  acceptMessagesOnlyFromDLMembers: string[];
  rejectMessagesFrom: string[];
  rejectMessagesFromDLMembers: string[];

  // Metadata
  whenCreated: Date;
  whenChanged: Date;
  recipientTypeDetails: string;
}

export interface ExchangeTransportRule {
  id: string;
  name: string;
  description: string;
  priority: number;
  state: 'Enabled' | 'Disabled';

  // Conditions
  conditions: TransportRuleCondition[];
  exceptions: TransportRuleCondition[];

  // Actions
  actions: TransportRuleAction[];

  // Metadata
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;

  // Audit
  ruleErrorAction: 'Ignore' | 'Defer';
  senderAddressLocation: 'Header' | 'Envelope' | 'HeaderOrEnvelope';
}

export interface TransportRuleCondition {
  type: string;
  property: string;
  value: string | string[];
  operator?: 'Equals' | 'Contains' | 'Matches' | 'NotEquals';
}

export interface TransportRuleAction {
  type: string;
  parameters: Record<string, any>;
}

export interface ExchangeConnector {
  id: string;
  name: string;
  connectorType: 'Send' | 'Receive';
  enabled: boolean;

  // Send connector specific
  addressSpaces?: string[];
  smartHosts?: string[];
  tlsDomain?: string;
  requireTLS?: boolean;

  // Receive connector specific
  bindings?: string[];
  remoteIPRanges?: string[];
  permissionGroups?: string[];

  whenCreated: Date;
  whenChanged: Date;
}

export interface ExchangePublicFolder {
  id: string;
  name: string;
  path: string;
  folderClass: string;
  itemCount: number;
  totalItemSize: number;
  hasSubfolders: boolean;
  mailEnabled: boolean;
  emailAddress?: string;
  permissions: PublicFolderPermission[];
}

export interface PublicFolderPermission {
  user: string;
  accessRights: string[];
}

// ============================================================================
// Discovery Configuration
// ============================================================================

export interface ExchangeDiscoveryConfig {
  // What to discover
  discoverMailboxes: boolean;
  discoverDistributionGroups: boolean;
  discoverTransportRules: boolean;
  discoverConnectors: boolean;
  discoverPublicFolders: boolean;

  // v2.0.0 - Mail Flow & Security (requires EXO connection)
  discoverRemoteDomains: boolean;
  discoverSecurityPolicies: boolean;  // DKIM, Anti-Spam, Anti-Phishing, Malware
  discoverMigrationConfig: boolean;   // Migration endpoints and batches
  discoverDnsRecords: boolean;        // MX, SPF, DKIM, DMARC records

  // Mailbox options
  includeArchiveData: boolean;
  includeMailboxPermissions: boolean;
  includeMailboxStatistics: boolean;
  includeMobileDevices: boolean;

  // Distribution group options
  includeGroupMembership: boolean;
  includeNestedGroups: boolean;

  // Filters
  mailboxFilter?: string; // LDAP filter
  onlyInactiveMailboxes?: boolean;
  inactiveDaysThreshold?: number;

  // Performance
  maxConcurrentQueries: number;
  batchSize: number;
  throttleDelay: number;

  // Output
  exportFormat: 'JSON' | 'CSV' | 'XML';
  includeDetailedLogs: boolean;
}

export const DEFAULT_EXCHANGE_CONFIG: ExchangeDiscoveryConfig = {
  discoverMailboxes: true,
  discoverDistributionGroups: true,
  discoverTransportRules: true,
  discoverConnectors: true,
  discoverPublicFolders: false,

  // v2.0.0 - Mail Flow & Security
  discoverRemoteDomains: true,
  discoverSecurityPolicies: true,
  discoverMigrationConfig: true,
  discoverDnsRecords: true,

  includeArchiveData: true,
  includeMailboxPermissions: true,
  includeMailboxStatistics: true,
  includeMobileDevices: false,

  includeGroupMembership: true,
  includeNestedGroups: false,

  maxConcurrentQueries: 5,
  batchSize: 100,
  throttleDelay: 100,

  exportFormat: 'JSON',
  includeDetailedLogs: false,
};

// ============================================================================
// Discovery Results
// ============================================================================

export interface ExchangeDiscoveryResult {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';

  // Configuration used
  config: ExchangeDiscoveryConfig;

  // Results
  mailboxes: ExchangeMailbox[];
  distributionGroups: ExchangeDistributionGroup[];
  transportRules: ExchangeTransportRule[];
  connectors: ExchangeConnector[];
  publicFolders: ExchangePublicFolder[];

  // Statistics
  statistics: ExchangeDiscoveryStatistics;

  // Errors and warnings
  errors: DiscoveryError[];
  warnings: DiscoveryWarning[];

  // Metadata
  discoveredBy: string;
  environment: 'Online' | 'OnPremises' | 'Hybrid';
}

export interface ExchangeDiscoveryStatistics {
  totalMailboxes: number;
  totalMailboxSize: number; // bytes
  totalArchiveSize: number;
  inactiveMailboxes: number;
  sharedMailboxes: number;
  roomMailboxes: number;

  totalDistributionGroups: number;
  securityGroups: number;

  totalTransportRules: number;
  enabledRules: number;
  disabledRules: number;

  totalConnectors: number;
  sendConnectors: number;
  receiveConnectors: number;

  totalPublicFolders: number;
  mailEnabledFolders: number;

  averageMailboxSize: number;
  largestMailbox?: {
    displayName: string;
    size: number;
  };
}

export interface DiscoveryError {
  timestamp: Date;
  severity: 'critical' | 'error' | 'warning';
  category: string;
  message: string;
  details?: string;
  itemId?: string;
}

export interface DiscoveryWarning {
  timestamp: Date;
  category: string;
  message: string;
  itemId?: string;
}

// ============================================================================
// Discovery Progress
// ============================================================================

export interface ExchangeDiscoveryProgress {
  phase: 'initializing' | 'mailboxes' | 'groups' | 'rules' | 'connectors' | 'folders' | 'finalizing';
  phaseLabel: string;
  percentComplete: number;
  currentItem?: string;
  itemsProcessed: number;
  totalItems: number;
  estimatedTimeRemaining?: number;
  errors: number;
  warnings: number;
}

// ============================================================================
// Filters and Sorting
// ============================================================================

export interface ExchangeMailboxFilter {
  searchText?: string;
  mailboxTypes?: MailboxType[];
  minSize?: number;
  maxSize?: number;
  isInactive?: boolean;
  hasArchive?: boolean;
  hasLitigationHold?: boolean;
  lastLogonBefore?: Date;
  lastLogonAfter?: Date;
}

export interface ExchangeGroupFilter {
  searchText?: string;
  groupTypes?: ('Security' | 'Distribution')[];
  minMemberCount?: number;
  maxMemberCount?: number;
  moderationEnabled?: boolean;
  hiddenFromAddressList?: boolean;
}

export interface ExchangeRuleFilter {
  searchText?: string;
  state?: ('Enabled' | 'Disabled')[];
  priority?: {
    min?: number;
    max?: number;
  };
}

// ============================================================================
// Templates
// ============================================================================

export interface ExchangeDiscoveryTemplate {
  id: string;
  name: string;
  description: string;
  config: ExchangeDiscoveryConfig;
  createdBy: string;
  createdDate: Date;
  modifiedDate: Date;
  isDefault: boolean;
  tags: string[];
}

// ============================================================================
// Export Types
// ============================================================================

export interface ExchangeExportOptions {
  format: 'CSV' | 'JSON' | 'Excel' | 'XML';
  includeMailboxes: boolean;
  includeGroups: boolean;
  includeRules: boolean;
  includeConnectors: boolean;
  includePublicFolders: boolean;
  includeStatistics: boolean;
  splitByType: boolean; // Create separate files per entity type
  fileName?: string;
}


