/**
 * Universal Discovery Mocks
 * Complete mock structures that match ALL discovery view expectations
 * Prevents null/undefined errors in tests
 */

/**
 * Universal Stats Object
 * Contains all possible stats properties used across all discovery views
 */
export const createUniversalStats = (overrides = {}) => ({
  // Common stats
  total: 0,
  totalItems: 0,
  totalServicesDetected: 0,
  totalEnvironments: 0,
  onPremiseEnvironments: 0,
  cloudEnvironments: 0,
  hybridEnvironments: 0,
  criticalRecommendations: 0,

  // Provider-specific stats
  servicesByProvider: {
    azure: 0,
    microsoft365: 0,
    'on-premises': 0,
    aws: 0,
    gcp: 0,
    google: 0,
  },

  // Category stats
  byCategory: {
    identity: 0,
    storage: 0,
    compute: 0,
    network: 0,
    security: 0,
    databases: 0,
  },

  // Risk levels
  byRiskLevel: {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  },

  // Compliance
  complianceRate: 0,
  compliantDevices: 0,
  nonCompliantDevices: 0,
  totalDevices: 0,

  // Authentication
  byAuthMethod: {
    'With MFA': 0,
    'Without MFA': 0,
    unknown: 0,
  },

  // Status
  byStatus: {
    active: 0,
    inactive: 0,
    disabled: 0,
    pending: 0,
  },

  // License
  byLicense: {
    licensed: 0,
    unlicensed: 0,
    trial: 0,
  },

  // Teams/Groups
  totalTeams: 0,
  activeTeams: 0,
  archivedTeams: 0,
  publicTeams: 0,
  privateTeams: 0,
  totalChannels: 0,
  totalMembers: 0,
  totalOwners: 0,
  totalGuests: 0,

  // Infrastructure
  totalServers: 0,
  windowsServers: 0,
  linuxServers: 0,
  totalVMs: 0,
  runningVMs: 0,
  stoppedVMs: 0,

  // Network
  totalNetworkDevices: 0,
  routers: 0,
  switches: 0,
  firewalls: 0,

  // Storage
  totalStorageGB: 0,
  usedStorageGB: 0,
  freeStorageGB: 0,

  // Allow overrides
  ...overrides,
});

/**
 * Universal Config Object
 */
export const createUniversalConfig = (overrides = {}) => ({
  // Common config
  timeout: 300,
  maxResults: 10000,
  includeDetails: true,

  // Discovery targets
  discoverUsers: true,
  discoverGroups: true,
  discoverDevices: true,
  discoverApplications: true,
  discoverTeams: true,
  discoverChannels: true,
  discoverMembers: true,
  discoverApps: true,

  // Environment detection
  detectAzure: true,
  detectOnPremises: true,
  detectAWS: true,
  detectGCP: true,

  // Security
  includeSettings: true,
  scanVulnerabilities: false,
  checkCompliance: false,

  // Authentication
  enableMFA: false,
  requireAuth: true,

  ...overrides,
});

/**
 * Universal Progress Object
 */
export const createUniversalProgress = (overrides = {}) => ({
  current: 0,
  total: 100,
  percentage: 0,
  message: '',
  currentItem: '',
  itemsProcessed: 0,
  totalItems: 100,
  moduleName: 'TestModule',
  currentOperation: 'Idle',
  overallProgress: 0,
  moduleProgress: 0,
  status: 'Idle',
  timestamp: new Date().toISOString(),
  ...overrides,
});

/**
 * Universal Filter Object
 */
export const createUniversalFilter = (overrides = {}) => ({
  searchText: '',
  type: 'all',
  status: 'all',
  category: 'all',
  provider: 'all',
  riskLevel: 'all',
  ...overrides,
});

/**
 * Universal Discovery Hook Mock
 * This provides ALL properties that ANY discovery view might expect
 */
export const createUniversalDiscoveryHook = (overrides = {}) => ({
  // State
  config: createUniversalConfig(),
  result: null,
  isDiscovering: false,
  isDetecting: false,
  isRunning: false,
  isCancelling: false,
  progress: createUniversalProgress(),
  activeTab: 'overview' as const,
  selectedTab: 'overview' as const,
  filter: createUniversalFilter(),
  teamFilter: createUniversalFilter(),
  channelFilter: createUniversalFilter(),
  memberFilter: createUniversalFilter(),
  error: null,
  logs: [],

  // Data
  columns: [],
  teamColumns: [],
  channelColumns: [],
  memberColumns: [],
  appColumns: [],
  filteredData: [],
  teams: [],
  channels: [],
  members: [],
  apps: [],
  results: [],
  items: [],
  stats: createUniversalStats(),
  statistics: createUniversalStats(),

  // Actions - Core
  startDiscovery: jest.fn(),
  cancelDiscovery: jest.fn(),
  exportResults: jest.fn(),
  clearLogs: jest.fn(),

  // Actions - Variations
  startDetection: jest.fn(),
  cancelDetection: jest.fn(),

  // Actions - Config
  updateConfig: jest.fn(),
  updateFormField: jest.fn(),
  resetForm: jest.fn(),

  // Actions - Filter
  updateFilter: jest.fn(),
  setFilter: jest.fn(),
  setTeamFilter: jest.fn(),
  setChannelFilter: jest.fn(),
  setMemberFilter: jest.fn(),

  // Actions - Tabs
  setActiveTab: jest.fn(),
  setSelectedTab: jest.fn(),

  // Actions - Export
  exportToCSV: jest.fn(),
  exportToExcel: jest.fn(),
  exportData: jest.fn(),

  // Actions - Templates
  loadTemplate: jest.fn(),
  saveAsTemplate: jest.fn(),
  templates: [],

  // Actions - Profile
  selectedProfile: {
    tenantId: '12345678-1234-1234-1234-123456789012',
    clientId: '87654321-4321-4321-4321-210987654321',
    isValid: true,
    name: 'Test Profile',
  },

  // Validation
  isFormValid: true,
  validationErrors: [],

  // Allow overrides
  ...overrides,
});

export default {
  createUniversalStats,
  createUniversalConfig,
  createUniversalProgress,
  createUniversalFilter,
  createUniversalDiscoveryHook,
};
