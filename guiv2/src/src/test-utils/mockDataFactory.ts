/**
 * Comprehensive Mock Data Factory for GUIv2 Tests
 * Provides consistent, complete mock data structures for all components
 */

import type { TeamsDiscoveryResult } from '../renderer/types/models/teams';
import type { DiscoveryResult, DiscoveryProgress } from '../renderer/types/models/discovery';

// Simplified mock interfaces for testing
interface MockTeamsDiscoveryResult {
  id: string;
  displayName: string;
  itemCount: number;
  discoveryTime: string;
  duration: number;
  status: string;
  filePath: string;
  success: boolean;
  summary: string;
  errorMessage: string;
  statistics: any;
  teams: any[];
  channels: any[];
  members: any[];
  apps: any[];
  startTime: Date;
  endTime: Date;
}

export interface MockUser {
  id: string;
  userPrincipalName: string;
  displayName: string;
  department: string;
}

export interface MockGroup {
  id: string;
  displayName: string;
  mailEnabled: boolean;
  securityEnabled: boolean;
  membersCount: number;
}

export interface MockProfile {
  tenantId: string;
  clientId: string;
  isValid: boolean;
  name?: string;
}

/**
 * Complete Domain Discovery Form Data
 */
export const createMockDomainDiscoveryFormData = (overrides = {}) => ({
  domainController: 'dc.contoso.com',
  searchBase: 'OU=Users,DC=contoso,DC=com',
  includeUsers: true,
  includeGroups: true,
  includeComputers: false,
  includeOUs: false,
  maxResults: 10000,
  timeout: 300,
  ...overrides,
});

/**
 * Complete Teams Discovery Hook Mock
 */
export const createMockTeamsDiscoveryHook = (overrides = {}) => ({
  config: {
    discoverTeams: true,
    discoverChannels: true,
    discoverMembers: true,
    discoverApps: true,
    includeSettings: true,
    discoverTabs: true,
    includeGuestUsers: false,
  },
  templates: [
    { id: 'template-1', name: 'Basic Teams Discovery' },
    { id: 'template-2', name: 'Comprehensive Teams Discovery' },
  ],
  result: createMockTeamsDiscoveryResult(),
  isDiscovering: false,
  progress: null,
  selectedTab: 'overview',
  teamFilter: { searchText: '', type: 'all' },
  setTeamFilter: jest.fn(),
  channelFilter: { searchText: '', type: 'all' },
  setChannelFilter: jest.fn(),
  memberFilter: { searchText: '', type: 'all' },
  setMemberFilter: jest.fn(),
  teams: createMockTeamsData(),
  channels: createMockChannelsData(),
  members: createMockMembersData(),
  apps: createMockAppsData(),
  teamColumns: createMockTeamColumns(),
  channelColumns: createMockChannelColumns(),
  memberColumns: createMockMemberColumns(),
  appColumns: createMockAppColumns(),
  error: null,
  startDiscovery: jest.fn(),
  cancelDiscovery: jest.fn(),
  loadTemplate: jest.fn(),
  saveAsTemplate: jest.fn(),
  exportData: jest.fn(),
  setSelectedTab: jest.fn(),
  statistics: createMockTeamsStatistics(),
  ...overrides,
});

/**
 * Complete Domain Discovery Hook Mock
 */
export const createMockDomainDiscoveryHook = (overrides = {}) => ({
  formData: createMockDomainDiscoveryFormData(),
  updateFormField: jest.fn(),
  resetForm: jest.fn(),
  isFormValid: true,
  isRunning: false,
  isCancelling: false,
  progress: null,
  results: [],
  error: null,
  logs: [],
  startDiscovery: jest.fn(),
  cancelDiscovery: jest.fn(),
  exportResults: jest.fn(),
  clearLogs: jest.fn(),
  selectedProfile: createMockProfile(),
  ...overrides,
});

/**
 * Mock Teams Discovery Result
 */
export const createMockTeamsDiscoveryResult = (): any => ({
  id: 'discovery-123',
  displayName: 'Microsoft Teams Discovery',
  itemCount: 150,
  discoveryTime: new Date().toISOString(),
  duration: 5000,
  status: 'completed',
  filePath: 'C:\\Discovery\\teams-discovery-2024.json',
  success: true,
  summary: 'Successfully discovered Teams environment',
  errorMessage: '',
  statistics: createMockTeamsStatistics(),
  teams: createMockTeamsData(),
  channels: createMockChannelsData(),
  members: createMockMembersData(),
  apps: createMockAppsData(),
  startTime: new Date(Date.now() - 5000),
  endTime: new Date(),
});

/**
 * Mock Teams Statistics
 */
export const createMockTeamsStatistics = () => ({
  totalTeams: 25,
  activeTeams: 20,
  archivedTeams: 5,
  publicTeams: 15,
  privateTeams: 10,
  totalChannels: 120,
  standardChannels: 95,
  privateChannels: 25,
  sharedChannels: 0,
  totalMembers: 2500,
  totalOwners: 25,
  totalGuests: 50,
  totalApps: 15,
  customApps: 8,
  thirdPartyApps: 7,
  mostUsedApps: [{ appName: 'Planner', usageCount: 150 }, { appName: 'OneNote', usageCount: 120 }],
  totalMessages: 12500,
  totalReactions: 3200,
  totalMentions: 890,
  averageMembersPerTeam: 100,
  averageChannelsPerTeam: 4.8,
});

/**
 * Mock Teams Data
 */
export const createMockTeamsData = () => [
  {
    id: 'team-1',
    displayName: 'IT Department',
    description: 'Information Technology Team',
    visibility: 'private' as const,
    webUrl: 'https://teams.microsoft.com/l/team/team1',
    isArchived: false,
    createdDateTime: '2023-01-15T10:00:00Z',
    lastActivityDate: '2024-01-20T14:30:00Z',
    memberCount: 25,
    ownerCount: 3,
    guestCount: 0,
    members: [],
    channelCount: 5,
    privateChannelCount: 1,
    channels: [],
    apps: [],
    settings: {},
    tabs: [],
    funSettings: {},
    meetingSettings: {},
    guestSettings: {},
    messagingSettings: {},
    discoveryMetadata: {},
  },
  {
    id: 'team-2',
    displayName: 'Marketing Team',
    description: 'Marketing and Communications',
    visibility: 'public' as const,
    webUrl: 'https://teams.microsoft.com/l/team/team2',
    isArchived: false,
    createdDateTime: '2023-03-10T09:00:00Z',
    lastActivityDate: '2024-01-19T11:15:00Z',
    memberCount: 40,
    ownerCount: 2,
    guestCount: 5,
    members: [],
    channelCount: 8,
    privateChannelCount: 0,
    channels: [],
    apps: [],
    settings: {},
    tabs: [],
    funSettings: {},
    meetingSettings: {},
    guestSettings: {},
    messagingSettings: {},
    discoveryMetadata: {},
  },
];

/**
 * Mock Channels Data
 */
export const createMockChannelsData = () => [
  {
    id: 'channel-1',
    displayName: 'General',
    description: 'General discussion',
    membershipType: 'standard' as const,
    webUrl: 'https://teams.microsoft.com/l/channel/channel1',
    createdDateTime: '2023-01-15T10:00:00Z',
    teamId: 'team-1',
    memberCount: 25,
    channelType: 'standard',
    messageCount: 150,
    replyCount: 45,
    mentionCount: 12,
    reactionCount: 28,
    tabs: [],
    members: [],
    settings: {},
  },
  {
    id: 'channel-2',
    displayName: 'Announcements',
    description: 'Important announcements',
    membershipType: 'standard' as const,
    webUrl: 'https://teams.microsoft.com/l/channel/channel2',
    createdDateTime: '2023-01-15T10:15:00Z',
    teamId: 'team-1',
    memberCount: 25,
    channelType: 'announcement',
    messageCount: 25,
    replyCount: 5,
    mentionCount: 8,
    reactionCount: 15,
    tabs: [],
    members: [],
    settings: {},
  },
];

/**
 * Mock Members Data
 */
export const createMockMembersData = () => [
  {
    id: 'user-1',
    userId: 'user-1',
    displayName: 'John Doe',
    userPrincipalName: 'john.doe@contoso.com',
    email: 'john.doe@contoso.com',
    roles: ['owner'],
    teamId: 'team-1',
    tenantId: 'tenant-123',
    role: 'owner',
    isGuest: false,
    accountEnabled: true,
    assignedLicenses: [],
    lastActivityDate: '2024-01-20T14:30:00Z',
    joinedDate: '2023-01-15T10:00:00Z',
  },
  {
    id: 'user-2',
    userId: 'user-2',
    displayName: 'Jane Smith',
    userPrincipalName: 'jane.smith@contoso.com',
    email: 'jane.smith@contoso.com',
    roles: ['member'],
    teamId: 'team-1',
    tenantId: 'tenant-123',
    role: 'member',
    isGuest: false,
    accountEnabled: true,
    assignedLicenses: [],
    lastActivityDate: '2024-01-19T11:15:00Z',
    joinedDate: '2023-03-10T09:00:00Z',
  },
];

/**
 * Mock Apps Data
 */
export const createMockAppsData = () => [
  {
    id: 'app-1',
    displayName: 'Microsoft Planner',
    externalId: 'com.microsoft.teamspace.tab.planner',
    appType: 'microsoft' as const,
    distributionMethod: 'Store' as const,
    teamsAppId: 'com.microsoft.teamspace.tab.planner',
    version: '1.0.0',
  },
  {
    id: 'app-2',
    displayName: 'Custom App',
    externalId: 'custom-app-123',
    appType: 'custom' as const,
    distributionMethod: 'Sideloaded' as const,
    teamsAppId: 'custom-app-123',
    version: '2.1.0',
  },
];

/**
 * Mock Grid Columns
 */
export const createMockTeamColumns = () => [
  { field: 'displayName', headerName: 'Team Name', width: 200 },
  { field: 'description', headerName: 'Description', width: 300 },
  { field: 'visibility', headerName: 'Visibility', width: 100 },
  { field: 'memberCount', headerName: 'Members', width: 100 },
];

export const createMockChannelColumns = () => [
  { field: 'displayName', headerName: 'Channel Name', width: 200 },
  { field: 'description', headerName: 'Description', width: 250 },
  { field: 'membershipType', headerName: 'Type', width: 100 },
  { field: 'memberCount', headerName: 'Members', width: 100 },
];

export const createMockMemberColumns = () => [
  { field: 'displayName', headerName: 'Name', width: 200 },
  { field: 'userPrincipalName', headerName: 'Email', width: 250 },
  { field: 'roles', headerName: 'Roles', width: 150 },
];

export const createMockAppColumns = () => [
  { field: 'displayName', headerName: 'App Name', width: 200 },
  { field: 'appType', headerName: 'Type', width: 100 },
  { field: 'version', headerName: 'Version', width: 100 },
];

/**
 * Mock Profile
 */
export const createMockProfile = (overrides = {}): MockProfile => ({
  tenantId: '12345678-1234-1234-1234-123456789012',
  clientId: '87654321-4321-4321-4321-210987654321',
  isValid: true,
  name: 'Test Profile',
  ...overrides,
});

/**
 * Mock Discovery Progress
 */
export const createMockDiscoveryProgress = (overrides = {}): DiscoveryProgress => ({
  percentage: 50,
  message: 'Processing data...',
  currentItem: 'Processing item 50 of 100',
  itemsProcessed: 50,
  totalItems: 100,
  moduleName: 'TestModule',
  currentOperation: 'Processing',
  overallProgress: 50,
  moduleProgress: 50,
  status: 'Running',
  timestamp: new Date().toISOString(),
  ...overrides,
});

/**
 * Mock Discovery Result
 */
export const createMockDiscoveryResult = (overrides = {}): DiscoveryResult => ({
  id: `discovery-${Date.now()}`,
  name: 'Test Discovery',
  moduleName: 'TestModule',
  displayName: 'Test Discovery Module',
  itemCount: 100,
  discoveryTime: new Date().toISOString(),
  duration: 5000,
  status: 'Completed',
  filePath: 'C:\\Discovery\\test-discovery.json',
  success: true,
  summary: 'Test discovery completed successfully',
  errorMessage: '',
  additionalData: {},
  createdAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Mock Users Data
 */
export const createMockUsers = (count = 3): MockUser[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    userPrincipalName: `user${i + 1}@example.com`,
    displayName: `User ${i + 1}`,
    department: i % 2 === 0 ? 'IT' : 'HR',
  }));

/**
 * Mock Groups Data
 */
export const createMockGroups = (count = 3): MockGroup[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `group-${i + 1}`,
    displayName: `Group ${i + 1}`,
    mailEnabled: i % 2 === 0,
    securityEnabled: true,
    membersCount: Math.floor(Math.random() * 20) + 1,
  }));

/**
 * Utility to create complete hook mocks with consistent data
 */
export const createCompleteHookMock = (hookName: string, overrides = {}) => {
  switch (hookName) {
    case 'useTeamsDiscoveryLogic':
      return createMockTeamsDiscoveryHook(overrides);
    case 'useDomainDiscoveryLogic':
      return createMockDomainDiscoveryHook(overrides);
    default:
      return overrides;
  }
};

export default {
  createMockDomainDiscoveryFormData,
  createMockTeamsDiscoveryHook,
  createMockDomainDiscoveryHook,
  createMockTeamsDiscoveryResult,
  createMockTeamsStatistics,
  createMockTeamsData,
  createMockChannelsData,
  createMockMembersData,
  createMockAppsData,
  createMockTeamColumns,
  createMockChannelColumns,
  createMockMemberColumns,
  createMockAppColumns,
  createMockProfile,
  createMockDiscoveryProgress,
  createMockDiscoveryResult,
  createMockUsers,
  createMockGroups,
  createCompleteHookMock,
};