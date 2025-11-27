/**
 * Universal Mock Discovery Data Templates
 * Phase 5: Standardized mock data for all discovery tests
 */

export interface MockDiscoveryResult {
  items: any[];
  totalCount: number;
  filteredCount: number;
  categories: string[];
  stats: {
    total: number;
    active: number;
    inactive: number;
    healthy: number;
    warning: number;
    critical: number;
    compliant: number;
    nonCompliant: number;
    [key: string]: number;
  };
  metadata: {
    timestamp: string;
    duration: number;
    source: string;
    version: string;
  };
}

/**
 * Create a mock discovery result with optional overrides
 */
export function createMockDiscoveryResult(overrides: Partial<MockDiscoveryResult> = {}): MockDiscoveryResult {
  return {
    items: [],
    totalCount: 0,
    filteredCount: 0,
    categories: ['All'],
    stats: {
      total: 0,
      active: 0,
      inactive: 0,
      healthy: 0,
      warning: 0,
      critical: 0,
      compliant: 0,
      nonCompliant: 0,
    },
    metadata: {
      timestamp: new Date().toISOString(),
      duration: 1000,
      source: 'mock',
      version: '1.0.0',
    },
    ...overrides,
  };
}

/**
 * Create mock Active Directory discovery result
 */
export function createMockADDiscoveryResult(itemCount: number = 10) {
  const items = Array.from({ length: itemCount }, (_, i) => ({
    id: `user-${i + 1}`,
    samAccountName: `user${i + 1}`,
    displayName: `Test User ${i + 1}`,
    email: `user${i + 1}@test.com`,
    enabled: i % 2 === 0,
    lastLogon: new Date(Date.now() - i * 86400000).toISOString(),
    department: i % 3 === 0 ? 'IT' : i % 3 === 1 ? 'HR' : 'Finance',
    title: `Position ${i + 1}`,
    memberOf: [`Group ${i % 5}`],
  }));

  return createMockDiscoveryResult({
    items,
    totalCount: itemCount,
    filteredCount: itemCount,
    categories: ['All', 'Enabled', 'Disabled', 'IT', 'HR', 'Finance'],
    stats: {
      total: itemCount,
      active: Math.floor(itemCount / 2),
      inactive: Math.ceil(itemCount / 2),
      healthy: itemCount,
      warning: 0,
      critical: 0,
      compliant: itemCount,
      nonCompliant: 0,
    },
  });
}

/**
 * Create mock Azure discovery result
 */
export function createMockAzureDiscoveryResult(itemCount: number = 10) {
  const items = Array.from({ length: itemCount }, (_, i) => ({
    id: `azure-user-${i + 1}`,
    userPrincipalName: `user${i + 1}@contoso.onmicrosoft.com`,
    displayName: `Azure User ${i + 1}`,
    mail: `user${i + 1}@contoso.com`,
    accountEnabled: i % 2 === 0,
    createdDateTime: new Date(Date.now() - i * 86400000).toISOString(),
    department: i % 3 === 0 ? 'IT' : i % 3 === 1 ? 'HR' : 'Finance',
    jobTitle: `Azure Position ${i + 1}`,
    assignedLicenses: [`License ${i % 3}`],
  }));

  return createMockDiscoveryResult({
    items,
    totalCount: itemCount,
    filteredCount: itemCount,
    categories: ['All', 'Licensed', 'Unlicensed', 'IT', 'HR', 'Finance'],
    stats: {
      total: itemCount,
      active: Math.floor(itemCount / 2),
      inactive: Math.ceil(itemCount / 2),
      healthy: itemCount,
      warning: 0,
      critical: 0,
      compliant: itemCount,
      nonCompliant: 0,
    },
  });
}

/**
 * Create mock Exchange discovery result
 */
export function createMockExchangeDiscoveryResult(itemCount: number = 10) {
  const items = Array.from({ length: itemCount }, (_, i) => ({
    id: `mailbox-${i + 1}`,
    primarySmtpAddress: `user${i + 1}@contoso.com`,
    displayName: `Mailbox ${i + 1}`,
    mailboxType: i % 3 === 0 ? 'UserMailbox' : i % 3 === 1 ? 'SharedMailbox' : 'RoomMailbox',
    itemCount: Math.floor(Math.random() * 10000),
    totalItemSize: Math.floor(Math.random() * 10000000000),
    lastLogonTime: new Date(Date.now() - i * 86400000).toISOString(),
    prohibitSendQuota: '50 GB',
    useDatabaseQuotaDefaults: false,
  }));

  return createMockDiscoveryResult({
    items,
    totalCount: itemCount,
    filteredCount: itemCount,
    categories: ['All', 'UserMailbox', 'SharedMailbox', 'RoomMailbox'],
    stats: {
      total: itemCount,
      active: Math.floor(itemCount * 0.8),
      inactive: Math.ceil(itemCount * 0.2),
      healthy: Math.floor(itemCount * 0.9),
      warning: Math.floor(itemCount * 0.1),
      critical: 0,
      compliant: itemCount,
      nonCompliant: 0,
    },
  });
}

/**
 * Create mock Google Workspace discovery result
 */
export function createMockGoogleWorkspaceDiscoveryResult(itemCount: number = 10) {
  const items = Array.from({ length: itemCount }, (_, i) => ({
    id: `google-user-${i + 1}`,
    primaryEmail: `user${i + 1}@contoso.com`,
    name: {
      fullName: `Google User ${i + 1}`,
      givenName: `Google`,
      familyName: `User ${i + 1}`,
    },
    suspended: i % 5 === 0,
    orgUnitPath: i % 2 === 0 ? '/IT' : '/Finance',
    creationTime: new Date(Date.now() - i * 86400000).toISOString(),
    lastLoginTime: new Date(Date.now() - i * 3600000).toISOString(),
    isAdmin: i % 10 === 0,
    agreedToTerms: true,
  }));

  return createMockDiscoveryResult({
    items,
    totalCount: itemCount,
    filteredCount: itemCount,
    categories: ['All', 'Active', 'Suspended', 'Admin', 'User'],
    stats: {
      total: itemCount,
      active: Math.floor(itemCount * 0.8),
      inactive: Math.ceil(itemCount * 0.2),
      healthy: Math.floor(itemCount * 0.9),
      warning: Math.floor(itemCount * 0.1),
      critical: 0,
      compliant: itemCount,
      nonCompliant: 0,
    },
  });
}

/**
 * Create mock VMware discovery result
 */
export function createMockVMwareDiscoveryResult(itemCount: number = 10) {
  const items = Array.from({ length: itemCount }, (_, i) => ({
    id: `vm-${i + 1}`,
    name: `VM-${i + 1}`,
    powerState: i % 3 === 0 ? 'poweredOn' : i % 3 === 1 ? 'poweredOff' : 'suspended',
    guestOS: i % 2 === 0 ? 'Windows Server 2019' : 'Ubuntu 20.04 LTS',
    cpuCount: 2 + (i % 4),
    memoryMB: 4096 * (1 + i % 4),
    diskGB: 100 + i * 50,
    host: `esxi-host-${(i % 3) + 1}`,
    cluster: `Cluster ${(i % 2) + 1}`,
    ipAddress: `192.168.1.${10 + i}`,
  }));

  return createMockDiscoveryResult({
    items,
    totalCount: itemCount,
    filteredCount: itemCount,
    categories: ['All', 'Powered On', 'Powered Off', 'Suspended', 'Windows', 'Linux'],
    stats: {
      total: itemCount,
      active: Math.floor(itemCount * 0.7),
      inactive: Math.ceil(itemCount * 0.3),
      healthy: Math.floor(itemCount * 0.85),
      warning: Math.floor(itemCount * 0.1),
      critical: Math.floor(itemCount * 0.05),
      compliant: itemCount,
      nonCompliant: 0,
    },
  });
}

/**
 * Create mock Intune discovery result
 */
export function createMockIntuneDiscoveryResult(itemCount: number = 10) {
  const items = Array.from({ length: itemCount }, (_, i) => ({
    id: `device-${i + 1}`,
    deviceName: `Device-${i + 1}`,
    operatingSystem: i % 2 === 0 ? 'Windows' : i % 3 === 0 ? 'iOS' : 'Android',
    osVersion: i % 2 === 0 ? '10.0.19043' : '14.7.1',
    complianceState: i % 4 === 0 ? 'noncompliant' : 'compliant',
    lastSyncDateTime: new Date(Date.now() - i * 3600000).toISOString(),
    enrolledDateTime: new Date(Date.now() - i * 86400000).toISOString(),
    managementAgent: 'mdm',
    userPrincipalName: `user${i + 1}@contoso.com`,
    model: i % 2 === 0 ? 'Dell Latitude 5410' : 'iPhone 12',
  }));

  return createMockDiscoveryResult({
    items,
    totalCount: itemCount,
    filteredCount: itemCount,
    categories: ['All', 'Compliant', 'Non-Compliant', 'Windows', 'iOS', 'Android'],
    stats: {
      total: itemCount,
      active: Math.floor(itemCount * 0.9),
      inactive: Math.ceil(itemCount * 0.1),
      healthy: Math.floor(itemCount * 0.75),
      warning: Math.floor(itemCount * 0.2),
      critical: Math.floor(itemCount * 0.05),
      compliant: Math.floor(itemCount * 0.75),
      nonCompliant: Math.ceil(itemCount * 0.25),
    },
  });
}

/**
 * Create mock SQL Server discovery result
 */
export function createMockSQLServerDiscoveryResult(itemCount: number = 5) {
  const items = Array.from({ length: itemCount }, (_, i) => ({
    id: `sql-${i + 1}`,
    serverName: `SQL-SERVER-${i + 1}`,
    instanceName: i % 2 === 0 ? 'MSSQLSERVER' : `INSTANCE${i}`,
    version: i % 2 === 0 ? '15.0.2000.5' : '14.0.3294.2',
    edition: i % 3 === 0 ? 'Enterprise' : i % 3 === 1 ? 'Standard' : 'Developer',
    databases: Array.from({ length: 5 + i }, (_, j) => `Database${j + 1}`),
    status: i % 5 === 0 ? 'offline' : 'online',
    totalSizeGB: 100 + i * 250,
    cpuCount: 8 + i * 4,
    memoryGB: 32 + i * 16,
  }));

  return createMockDiscoveryResult({
    items,
    totalCount: itemCount,
    filteredCount: itemCount,
    categories: ['All', 'Enterprise', 'Standard', 'Developer', 'Online', 'Offline'],
    stats: {
      total: itemCount,
      active: Math.floor(itemCount * 0.8),
      inactive: Math.ceil(itemCount * 0.2),
      healthy: Math.floor(itemCount * 0.9),
      warning: Math.floor(itemCount * 0.1),
      critical: 0,
      compliant: itemCount,
      nonCompliant: 0,
    },
  });
}

/**
 * Export all mock creator functions
 */
export const mockDiscoveryCreators = {
  activeDirectory: createMockADDiscoveryResult,
  azure: createMockAzureDiscoveryResult,
  exchange: createMockExchangeDiscoveryResult,
  googleWorkspace: createMockGoogleWorkspaceDiscoveryResult,
  vmware: createMockVMwareDiscoveryResult,
  intune: createMockIntuneDiscoveryResult,
  sqlServer: createMockSQLServerDiscoveryResult,
};
