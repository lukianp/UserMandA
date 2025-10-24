/**
 * Microsoft Teams Discovery Type Definitions
 * Defines all types for Microsoft Teams discovery
 */

// ============================================================================
// Core Teams Types
// ============================================================================

export type TeamVisibility = 'Public' | 'Private' | 'HiddenMembership';
export type TeamMemberRole = 'Owner' | 'Member' | 'Guest';
export type ChannelType = 'Standard' | 'Private' | 'Shared';
export type TeamStatus = 'Active' | 'Archived' | 'Deleted';

export interface Team {
  id: string;
  displayName: string;
  description: string;
  visibility: TeamVisibility;
  classification?: string;
  specialization?: 'None' | 'EducationStandard' | 'EducationClass' | 'EducationProfessionalLearningCommunity' | 'HealthcareStandard' | 'HealthcareCareCoordination';

  // Membership
  memberCount: number;
  ownerCount: number;
  guestCount: number;
  members: TeamMember[];

  // Channels
  channelCount: number;
  privateChannelCount: number;
  channels: TeamChannel[];

  // Settings
  memberSettings: TeamMemberSettings;
  guestSettings: TeamGuestSettings;
  messagingSettings: TeamMessagingSettings;
  funSettings: TeamFunSettings;
  discoverySettings: TeamDiscoverySettings;

  // Office 365 Group
  groupId: string;
  mailNickname: string;
  mail?: string;
  webUrl: string;

  // SharePoint
  sharepointSiteUrl?: string;

  // Activity
  lastActivityDate?: Date | string;
  messageCount?: number;
  reactionCount?: number;
  mentionCount?: number;

  // Apps and tabs
  installedApps: TeamApp[];
  tabs: TeamTab[];

  // Metadata
  createdDateTime: Date | string;
  archivedDateTime?: Date | string;
  isArchived: boolean;
  internalId: string;
  tenantId: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  userPrincipalName: string;
  role: TeamMemberRole;
  isGuest: boolean;

  // Activity
  lastActiveDate?: Date | string;
  messageCount?: number;
  reactionCount?: number;

  // Status
  accountEnabled: boolean;
  assignedLicenses: string[];
}

export interface TeamChannel {
  id: string;
  teamId: string;
  displayName: string;
  description: string;
  channelType: ChannelType;
  email?: string;
  webUrl: string;

  // Membership (for private channels)
  membershipType?: 'Standard' | 'Private' | 'Shared';
  memberCount?: number;
  ownerCount?: number;

  // Content
  messageCount: number;
  replyCount: number;
  mentionCount: number;

  // Tabs and apps
  tabs: TeamTab[];
  apps: TeamApp[];

  // Files
  filesFolder?: string;
  fileCount?: number;

  // Activity
  lastMessageDate?: Date | string;
  lastActivityDate?: Date | string;

  // Settings
  isFavoriteByDefault: boolean;
  moderationSettings?: ChannelModerationSettings;

  // Metadata
  createdDateTime: Date | string;
}

export interface TeamMemberSettings {
  allowCreateUpdateChannels: boolean;
  allowCreatePrivateChannels: boolean;
  allowDeleteChannels: boolean;
  allowAddRemoveApps: boolean;
  allowCreateUpdateRemoveTabs: boolean;
  allowCreateUpdateRemoveConnectors: boolean;
}

export interface TeamGuestSettings {
  allowCreateUpdateChannels: boolean;
  allowDeleteChannels: boolean;
}

export interface TeamMessagingSettings {
  allowUserEditMessages: boolean;
  allowUserDeleteMessages: boolean;
  allowOwnerDeleteMessages: boolean;
  allowTeamMentions: boolean;
  allowChannelMentions: boolean;
}

export interface TeamFunSettings {
  allowGiphy: boolean;
  giphyContentRating: 'Strict' | 'Moderate';
  allowStickersAndMemes: boolean;
  allowCustomMemes: boolean;
}

export interface TeamDiscoverySettings {
  showInTeamsSearchAndSuggestions: boolean;
}

export interface ChannelModerationSettings {
  userNewMessageRestriction: 'Everyone' | 'Moderators' | 'EveryoneExceptGuests';
  replyRestriction: 'Everyone' | 'AuthorAndModerators' | 'EveryoneExceptGuests';
  allowNewMessageFromBots: boolean;
  allowNewMessageFromConnectors: boolean;
}

export interface TeamApp {
  id: string;
  teamsAppId: string;
  displayName: string;
  version: string;
  distributionMethod: 'Store' | 'Organization' | 'Sideloaded';

  // Installation
  installedBy?: string;
  installedDate?: Date | string;

  // Permissions
  resourceSpecificPermissions?: string[];
}

export interface TeamTab {
  id: string;
  displayName: string;
  webUrl: string;
  teamsAppId?: string;
  configuration?: Record<string, any>;
  sortOrderIndex: number;
}

// ============================================================================
// Discovery Configuration
// ============================================================================

export interface TeamsDiscoveryConfig {
  // What to discover
  discoverTeams: boolean;
  discoverChannels: boolean;
  discoverMembers: boolean;
  discoverApps: boolean;
  discoverTabs: boolean;

  // Team options
  includeArchivedTeams: boolean;
  includeActivity: boolean;
  includeSettings: boolean;
  includeSharePointIntegration: boolean;

  // Channel options
  includePrivateChannels: boolean;
  includeSharedChannels: boolean;
  includeChannelMessages: boolean;
  maxMessagesToScan: number;

  // Member options
  includeGuestUsers: boolean;
  includeMemberActivity: boolean;
  includeLicenseInfo: boolean;

  // App options
  includeCustomApps: boolean;
  includeThirdPartyApps: boolean;
  analyzeAppPermissions: boolean;

  // Tab options
  includeTabConfigurations: boolean;

  // Filters
  teamNamePattern?: string;
  visibilityFilter?: TeamVisibility[];
  minMemberCount?: number;
  maxMemberCount?: number;
  lastActivityDays?: number;

  // Performance
  maxConcurrentQueries: number;
  batchSize: number;
  throttleDelay: number;

  // Output
  exportFormat: 'json' | 'csv' | 'xml';
  includeDetailedLogs: boolean;
}

export const DEFAULT_TEAMS_CONFIG: TeamsDiscoveryConfig = {
  discoverTeams: true,
  discoverChannels: true,
  discoverMembers: true,
  discoverApps: true,
  discoverTabs: false,

  includeArchivedTeams: false,
  includeActivity: true,
  includeSettings: true,
  includeSharePointIntegration: true,

  includePrivateChannels: true,
  includeSharedChannels: true,
  includeChannelMessages: false,
  maxMessagesToScan: 1000,

  includeGuestUsers: true,
  includeMemberActivity: false,
  includeLicenseInfo: false,

  includeCustomApps: true,
  includeThirdPartyApps: true,
  analyzeAppPermissions: false,

  includeTabConfigurations: false,

  maxConcurrentQueries: 5,
  batchSize: 50,
  throttleDelay: 100,

  exportFormat: 'json',
  includeDetailedLogs: false,
};

// ============================================================================
// Discovery Results
// ============================================================================

export interface TeamsDiscoveryResult {
  id: string;
  startTime: Date | string;
  endTime?: Date | string;
  duration?: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';

  // Configuration used
  config: TeamsDiscoveryConfig;

  // Results
  teams: Team[];
  channels: TeamChannel[];
  members: TeamMember[];
  apps: TeamApp[];

  // Statistics
  statistics: TeamsDiscoveryStatistics;

  // Errors and warnings
  errors: DiscoveryError[];
  warnings: DiscoveryWarning[];

  // Metadata
  discoveredBy: string;
  tenantId: string;
}

export interface TeamsDiscoveryStatistics {
  totalTeams: number;
  activeTeams: number;
  archivedTeams: number;
  publicTeams: number;
  privateTeams: number;

  totalMembers: number;
  totalOwners: number;
  totalGuests: number;
  averageMembersPerTeam: number;

  totalChannels: number;
  standardChannels: number;
  privateChannels: number;
  sharedChannels: number;
  averageChannelsPerTeam: number;

  totalApps: number;
  customApps: number;
  thirdPartyApps: number;
  mostUsedApps: AppUsageCount[];

  totalMessages: number;
  totalReactions: number;
  totalMentions: number;

  largestTeam?: {
    displayName: string;
    memberCount: number;
  };

  mostActiveTeam?: {
    displayName: string;
    messageCount: number;
  };
}

export interface AppUsageCount {
  appId: string;
  displayName: string;
  installCount: number;
  teamCount: number;
}

export interface DiscoveryError {
  timestamp: Date | string;
  severity: 'critical' | 'error' | 'warning';
  category: string;
  message: string;
  details?: string;
  teamId?: string;
  channelId?: string;
}

export interface DiscoveryWarning {
  timestamp: Date | string;
  category: string;
  message: string;
  teamId?: string;
  channelId?: string;
}

// ============================================================================
// Discovery Progress
// ============================================================================

export interface TeamsDiscoveryProgress {
  phase: 'initializing' | 'teams' | 'channels' | 'members' | 'apps' | 'activity' | 'finalizing';
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

export interface TeamFilter {
  searchText?: string;
  visibility?: TeamVisibility[];
  minMemberCount?: number;
  maxMemberCount?: number;
  isArchived?: boolean;
  hasGuests?: boolean;
  lastActivityBefore?: Date | string;
  lastActivityAfter?: Date | string;
  classification?: string[];
}

export interface ChannelFilter {
  searchText?: string;
  channelTypes?: ChannelType[];
  minMessageCount?: number;
  hasFiles?: boolean;
  lastActivityBefore?: Date | string;
  lastActivityAfter?: Date | string;
}

export interface MemberFilter {
  searchText?: string;
  roles?: TeamMemberRole[];
  isGuest?: boolean;
  accountEnabled?: boolean;
  hasLicense?: boolean;
  lastActiveBefore?: Date | string;
  lastActiveAfter?: Date | string;
}

export interface AppFilter {
  searchText?: string;
  distributionMethods?: string[];
  installedInMultipleTeams?: boolean;
}

// ============================================================================
// Templates
// ============================================================================

export interface TeamsDiscoveryTemplate {
  id: string;
  name: string;
  description: string;
  config: TeamsDiscoveryConfig;
  createdBy: string;
  createdDate: Date | string;
  modifiedDate: Date | string;
  isDefault: boolean;
  tags: string[];
}

// ============================================================================
// Export Types
// ============================================================================

export interface TeamsExportOptions {
  format: 'csv' | 'json' | 'excel' | 'xml';
  includeTeams: boolean;
  includeChannels: boolean;
  includeMembers: boolean;
  includeApps: boolean;
  includeStatistics: boolean;
  splitByType: boolean;
  fileName?: string;
}

// ============================================================================
// Security and Governance
// ============================================================================

export interface TeamsGovernanceInsight {
  type: 'guest_access' | 'external_app' | 'large_team' | 'inactive_team' | 'permission_issue';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedTeams: string[];
  recommendation: string;
  count: number;
}

export interface TeamComplianceStatus {
  teamId: string;
  displayName: string;
  hasClassification: boolean;
  hasSensitivityLabel: boolean;
  hasRetentionPolicy: boolean;
  hasDataLossPreventionPolicy: boolean;
  externalSharingEnabled: boolean;
  guestAccessEnabled: boolean;
  complianceScore: number; // 0-100
  issues: string[];
}
