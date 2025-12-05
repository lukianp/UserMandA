/**
 * Comprehensive Mock Data Fixtures for Tests
 * Centralized mock data to ensure consistency across all tests
 */

// User fixtures
export const mockUser = {
  id: 'user-1',
  displayName: 'John Doe',
  email: 'john.doe@example.com',
  userPrincipalName: 'john.doe@example.com',
  department: 'IT',
  jobTitle: 'Software Engineer',
  enabled: true,
  lastLogon: new Date('2025-01-15'),
  whenCreated: new Date('2020-01-01'),
  memberOf: ['group-1', 'group-2'],
};

export const mockUsers = [
  mockUser,
  {
    id: 'user-2',
    displayName: 'Jane Smith',
    email: 'jane.smith@example.com',
    userPrincipalName: 'jane.smith@example.com',
    department: 'HR',
    jobTitle: 'HR Manager',
    enabled: true,
    lastLogon: new Date('2025-01-16'),
    whenCreated: new Date('2020-02-01'),
    memberOf: ['group-3'],
  },
  {
    id: 'user-3',
    displayName: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    userPrincipalName: 'bob.johnson@example.com',
    department: 'Sales',
    jobTitle: 'Sales Representative',
    enabled: false,
    lastLogon: new Date('2024-12-20'),
    whenCreated: new Date('2019-06-15'),
    memberOf: [],
  },
];

// Group fixtures
export const mockGroup = {
  id: 'group-1',
  name: 'IT Department',
  description: 'IT Department Security Group',
  groupType: 'Security',
  scope: 'Global',
  memberCount: 15,
  whenCreated: new Date('2020-01-01'),
};

export const mockGroups = [
  mockGroup,
  {
    id: 'group-2',
    name: 'Developers',
    description: 'Software Development Team',
    groupType: 'Security',
    scope: 'Global',
    memberCount: 8,
    whenCreated: new Date('2020-03-15'),
  },
  {
    id: 'group-3',
    name: 'HR Team',
    description: 'Human Resources',
    groupType: 'Distribution',
    scope: 'Universal',
    memberCount: 5,
    whenCreated: new Date('2020-02-01'),
  },
];

// Computer fixtures
export const mockComputer = {
  id: 'comp-1',
  name: 'DESKTOP-001',
  dnshostname: 'desktop-001.example.com',
  operatingSystem: 'Windows 11 Enterprise',
  operatingSystemVersion: '10.0.22621',
  enabled: true,
  lastLogon: new Date('2025-01-16'),
  whenCreated: new Date('2024-01-01'),
  location: 'Building A',
  department: 'IT',
};

export const mockComputers = [
  mockComputer,
  {
    id: 'comp-2',
    name: 'LAPTOP-HR-02',
    dnshostname: 'laptop-hr-02.example.com',
    operatingSystem: 'Windows 10 Pro',
    operatingSystemVersion: '10.0.19045',
    enabled: true,
    lastLogon: new Date('2025-01-15'),
    whenCreated: new Date('2023-06-01'),
    location: 'Building B',
    department: 'HR',
  },
];

// License fixtures
export const mockLicense = {
  id: 'lic-1',
  skuId: 'O365_BUSINESS_PREMIUM',
  name: 'Microsoft 365 Business Premium',
  totalLicenses: 100,
  assignedLicenses: 85,
  availableLicenses: 15,
  consumedUnits: 85,
  capabilityStatus: 'Enabled',
};

export const mockLicenses = [
  mockLicense,
  {
    id: 'lic-2',
    skuId: 'ENTERPRISEPACK',
    name: 'Office 365 E3',
    totalLicenses: 50,
    assignedLicenses: 48,
    availableLicenses: 2,
    consumedUnits: 48,
    capabilityStatus: 'Enabled',
  },
];

// Azure profile fixtures
export const mockAzureProfile = {
  id: 'azure-1',
  name: 'Production Azure',
  tenantId: '12345678-1234-1234-1234-123456789012',
  clientId: '87654321-4321-4321-4321-210987654321',
  clientSecret: '***',
  isValid: true,
  lastValidated: new Date('2025-01-16'),
};

export const mockAzureProfiles = [
  mockAzureProfile,
  {
    id: 'azure-2',
    name: 'Development Azure',
    tenantId: '11111111-1111-1111-1111-111111111111',
    clientId: '22222222-2222-2222-2222-222222222222',
    clientSecret: '***',
    isValid: true,
    lastValidated: new Date('2025-01-15'),
  },
];

// Settings fixtures
export const mockSettings = {
  theme: {
    isDarkTheme: false,
    accentColor: '#3B82F6',
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    useAnimations: true,
    windowOpacity: 1.0,
  },
  autoRefreshDashboard: true,
  refreshInterval: 30,
  enableNotifications: true,
  defaultExportFormat: 'CSV' as const,
};

// Discovery data fixtures
export const mockDiscoveryData = {
  users: mockUsers,
  groups: mockGroups,
  computers: mockComputers,
  licenses: mockLicenses,
};

// Statistics fixtures
export const mockStatistics = {
  totalUsers: 150,
  activeUsers: 142,
  disabledUsers: 8,
  totalGroups: 45,
  totalComputers: 98,
  activeComputers: 95,
};

// Chart data fixtures
export const mockChartData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
];

// KPI fixtures
export const mockKpis = [
  { label: 'Total Users', value: 150, change: '+5', trend: 'up' as const },
  { label: 'Active Users', value: 142, change: '+3', trend: 'up' as const },
  { label: 'Total Groups', value: 45, change: '0', trend: 'stable' as const },
  { label: 'Total Computers', value: 98, change: '-2', trend: 'down' as const },
];

// Infrastructure data fixtures
export const mockInfrastructure = {
  servers: [
    { name: 'SRV-DC-01', role: 'Domain Controller', status: 'Online', cpu: 45, memory: 60 },
    { name: 'SRV-SQL-01', role: 'Database', status: 'Online', cpu: 70, memory: 85 },
  ],
  networkDevices: [
    { name: 'RTR-CORE-01', type: 'Router', status: 'Online', uptime: 99.9 },
    { name: 'SW-DIST-01', type: 'Switch', status: 'Online', uptime: 99.8 },
  ],
};

// Cost analysis fixtures
export const mockCostData = {
  totalCost: 125000,
  monthlyCost: 10416.67,
  costByCategory: [
    { category: 'Licensing', amount: 75000 },
    { category: 'Infrastructure', amount: 35000 },
    { category: 'Support', amount: 15000 },
  ],
};

// Compliance fixtures
export const mockComplianceData = {
  totalPolicies: 25,
  compliantPolicies: 20,
  violations: 5,
  resolvedViolations: 15,
  pendingViolations: 5,
  policies: [
    { id: 'pol-1', name: 'Password Policy', status: 'Compliant', lastChecked: new Date() },
    { id: 'pol-2', name: 'MFA Policy', status: 'Non-Compliant', lastChecked: new Date() },
  ],
};

// Application fixtures
export const mockApplications = [
  { id: 'app-1', name: 'Microsoft Office', version: '2021', installs: 98 },
  { id: 'app-2', name: 'Adobe Acrobat', version: 'DC', installs: 45 },
  { id: 'app-3', name: 'Google Chrome', version: '120', installs: 150 },
];

// Active Directory fixtures
export const mockADData = {
  domainControllers: [
    { name: 'DC01', site: 'Default-First-Site', ipAddress: '192.168.1.10', osVersion: 'Windows Server 2022' },
  ],
  organizationalUnits: [
    { name: 'Users', path: 'OU=Users,DC=example,DC=com', objectCount: 150 },
    { name: 'Computers', path: 'OU=Computers,DC=example,DC=com', objectCount: 98 },
  ],
  forestLevel: '7',
  domainLevel: '7',
};

// Hook mock factories
export const createMockHook = (overrides = {}) => ({
  data: null as any,
  isLoading: false,
  error: null,
  refreshData: jest.fn(),
  exportData: jest.fn(),
  ...overrides,
});

export const createMockDiscoveryHook = (overrides = {}) => ({
  isRunning: false,
  progress: { current: 0, total: 100, percentage: 0, message: '' },
  data: null,
  error: null,
  startDiscovery: jest.fn(),
  cancelDiscovery: jest.fn(),
  exportResults: jest.fn(),
  ...overrides,
});

export const createMockAnalyticsHook = (overrides = {}) => ({
  data: null as any,
  chartData: mockChartData,
  kpis: mockKpis,
  isLoading: false,
  error: null,
  exportData: jest.fn(),
  refreshData: jest.fn(),
  ...overrides,
});
