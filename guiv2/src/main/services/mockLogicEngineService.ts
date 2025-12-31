/**
 * Mock Logic Engine Service
 *
 * Provides mock data for user detail projections during development.
 * This will be replaced with real LogicEngineService from Epic 4.
 *
 * Epic 1 Task 1.2: UserDetailView Component
 */

import type {
  UserDetailProjection,
  DeviceData,
  MappedDriveData,
  FileAccessEntry,
  GpoData,
  MailboxData,
  AzureRoleAssignment,
  SqlDatabaseData,
  RiskItem,
  MigrationHint,
  UserDetailStats,
  TeamMembership,
  SharePointSiteAccess,
} from '../../renderer/types/models/userDetail';
import type { UserData } from '../../renderer/types/models/user';
import type { GroupData } from '../../renderer/types/models/group';
import { GroupType, GroupScope, MembershipType } from '../../renderer/types/models/group'; // Import as values for runtime use
import type { ApplicationData } from '../../renderer/types/models/application';

/**
 * Mock Logic Engine Service
 * Generates realistic mock data for user detail views
 */
export class MockLogicEngineService {
  private static instance: MockLogicEngineService;
  private cache: Map<string, UserDetailProjection> = new Map();

  public static getInstance(): MockLogicEngineService {
    if (!MockLogicEngineService.instance) {
      MockLogicEngineService.instance = new MockLogicEngineService();
    }
    return MockLogicEngineService.instance;
  }

  /**
   * Get user detail projection by userId
   * Mirrors C# LogicEngineService.getUserDetailAsync
   */
  public async getUserDetailAsync(userId: string): Promise<UserDetailProjection | null> {
    // Check cache first
    if (this.cache.has(userId)) {
      console.log(`[MockLogicEngine] Returning cached user detail for ${userId}`);
      return this.cache.get(userId) as UserDetailProjection;
    }

    // Generate mock data
    console.log(`[MockLogicEngine] Generating mock user detail for ${userId}`);
    const userDetail = this.generateMockUserDetail(userId);

    // Cache for 15 minutes
    this.cache.set(userId, userDetail);
    setTimeout(() => this.cache.delete(userId), 15 * 60 * 1000);

    return userDetail;
  }

  /**
   * Clear cache for specific user
   */
  public clearUserDetailCache(userId: string): void {
    this.cache.delete(userId);
    console.log(`[MockLogicEngine] Cleared cache for ${userId}`);
  }

  /**
   * Clear all cached data
   */
  public clearAllCache(): void {
    this.cache.clear();
    console.log(`[MockLogicEngine] Cleared all cache`);
  }

  /**
   * Check if service is loaded
   */
  public isLoaded(): boolean {
    return true; // Mock service is always ready
  }

  /**
   * Generate mock user detail projection
   */
  private generateMockUserDetail(userId: string): UserDetailProjection {
    const user = this.generateMockUser(userId);
    const groups = this.generateMockGroups(5);
    const devices = this.generateMockDevices(3);
    const apps = this.generateMockApplications(12);
    const drives = this.generateMockDrives(2);
    const fileAccess = this.generateMockFileAccess(8);
    const gpoLinks = this.generateMockGpos(4, 'link');
    const gpoFilters = this.generateMockGpos(2, 'filter');
    const mailbox = this.generateMockMailbox(user.userPrincipalName);
    const azureRoles = this.generateMockAzureRoles(3);
    const sqlDatabases = this.generateMockSqlDatabases(2);
    const risks = this.generateMockRisks(4);
    const migrationHints = this.generateMockMigrationHints(5);
    const teams = this.generateMockTeams(4);
    const sharepointSites = this.generateMockSharePointSites(6);

    // Computed properties
    const memberOfGroups = groups.map(g => g.name);
    const managedGroups = groups.filter((_, i) => i < 1).map(g => g.name);
    const managerUpn = user.managerDisplayName || 'manager@company.com';
    const ownedGroups = managedGroups;

    // Statistics
    const stats: UserDetailStats = {
      totalGroups: groups.length,
      totalDevices: devices.length,
      totalApplications: apps.length,
      totalFileAccess: fileAccess.length,
      totalGpos: gpoLinks.length + gpoFilters.length,
      totalAzureRoles: azureRoles.length,
      totalSqlDatabases: sqlDatabases.length,
      totalRisks: risks.length,
      highRiskCount: risks.filter(r => r.severity === 'High').length,
      criticalRiskCount: risks.filter(r => r.severity === 'Critical').length,
    };

    return {
      user,
      groups,
      devices,
      apps,
      drives,
      fileAccess,
      gpoLinks,
      gpoFilters,
      mailbox,
      azureRoles,
      sqlDatabases,
      risks,
      migrationHints,
      teams,
      sharepointSites,
      memberOfGroups,
      managedGroups,
      managerUpn,
      ownedGroups,
      stats,
    };
  }

  private generateMockUser(userId: string): UserData {
    const id = userId.includes('@') ? userId : `${userId}@company.com`;
    const displayName = `User ${userId.split('@')[0]}`;

    return {
      id: userId,
      name: displayName,
      displayName,
      userPrincipalName: id,
      mail: id,
      email: id,
      department: 'IT Department',
      jobTitle: 'Senior Engineer',
      accountEnabled: true,
      samAccountName: userId.split('@')[0],
      companyName: 'Contoso Corporation',
      managerDisplayName: 'Manager Smith',
      createdDateTime: new Date('2020-01-15'),
      userSource: 'ActiveDirectory',
      firstName: 'John',
      lastName: 'Doe',
      country: 'United States',
      company: 'Contoso Corporation',
      givenName: 'John',
      surname: 'Doe',
      city: 'New York',
      mobilePhone: '+1-555-0123',
      lastSignInDateTime: new Date('2024-10-03'),
      groupMembershipCount: '5',
      assignedLicenses: 'Office 365 E3, Project Plan 3',
      enabled: true,
      title: 'Senior Engineer',
      isPrivileged: false,
      passwordExpiryDate: new Date('2025-01-15'),
      lastLogonDate: new Date('2024-10-03'),
      createdDate: new Date('2020-01-15'),
      canEdit: true,
      canResetPassword: true,
      canToggleAccount: true,
      status: 'Enabled',
      officeLocation: 'Building A',
      manager: 'Manager Smith',
      groups: 'IT Admins, Developers',
      objectType: 'User',
      isSelected: false,
      domain: 'contoso.com',
      createdAt: new Date('2020-01-15'),
    };
  }

  private generateMockGroups(count: number): GroupData[] {
    const groupTypes: GroupType[] = [GroupType.Security, GroupType.Distribution, GroupType.Office365];
    const scopes: GroupScope[] = [GroupScope.Universal, GroupScope.Global, GroupScope.DomainLocal];

    return Array.from({ length: count }, (_, i) => ({
      id: `group-${i}`,
      objectId: `obj-group-${i}`,
      name: `Group ${i + 1}`,
      displayName: `Group ${i + 1}`,
      description: `Mock group ${i + 1} for testing`,
      email: `group${i}@company.com`,
      groupType: groupTypes[i % groupTypes.length],
      scope: scopes[i % scopes.length],
      membershipType: MembershipType.Static,
      memberCount: Math.floor(Math.random() * 50) + 5,
      owners: [`owner-${i}@company.com`],
      createdDate: new Date(2020, i % 12, (i % 28) + 1).toISOString(),
      lastModified: new Date(2024, 9, (i % 28) + 1).toISOString(),
      source: 'ActiveDirectory' as const,
      distinguishedName: `CN=Group ${i + 1},OU=Groups,DC=contoso,DC=com`,
      managedBy: i === 0 ? 'CN=User Test,OU=Users,DC=contoso,DC=com' : undefined,
      isSecurityEnabled: i % 2 === 0,
      isMailEnabled: i % 3 === 0,
    }));
  }

  private generateMockDevices(count: number): DeviceData[] {
    const osList = ['Windows 11 Pro', 'Windows 10 Enterprise', 'Windows Server 2022'];
    const manufacturers = ['Dell', 'HP', 'Lenovo'];
    const sources: Array<'Intune' | 'AD' | 'ConfigMgr'> = ['Intune', 'AD', 'ConfigMgr'];

    return Array.from({ length: count }, (_, i) => ({
      id: `device-${i}`,
      name: `DESKTOP-${1000 + i}`,
      dns: `desktop-${1000 + i}.contoso.com`,
      os: osList[i % osList.length],
      ou: 'OU=Workstations,DC=contoso,DC=com',
      primaryUserSid: 'S-1-5-21-123456789-123456789-123456789-1001',
      lastSeen: new Date(2024, 9, 3 - i),
      ipAddress: `192.168.1.${100 + i}`,
      manufacturer: manufacturers[i % manufacturers.length],
      model: `OptiPlex ${7000 + i * 10}`,
      serialNumber: `SN${10000 + i}`,
      domain: 'contoso.com',
      isEnabled: true,
      source: sources[i % sources.length],
    }));
  }

  private generateMockApplications(count: number): ApplicationData[] {
    const apps = [
      { name: 'Microsoft Office 365', publisher: 'Microsoft', version: '16.0.12345' },
      { name: 'Google Chrome', publisher: 'Google LLC', version: '120.0.6099' },
      { name: 'Adobe Acrobat Reader', publisher: 'Adobe Inc.', version: '2024.001' },
      { name: 'Slack', publisher: 'Slack Technologies', version: '4.35.121' },
      { name: 'Visual Studio Code', publisher: 'Microsoft', version: '1.84.2' },
      { name: 'Zoom', publisher: 'Zoom Video Communications', version: '5.16.5' },
      { name: '7-Zip', publisher: '7-Zip', version: '23.01' },
      { name: 'VLC Media Player', publisher: 'VideoLAN', version: '3.0.20' },
      { name: 'Microsoft Teams', publisher: 'Microsoft', version: '1.6.00.36174' },
      { name: 'Notepad++', publisher: 'Notepad++ Team', version: '8.6.0' },
      { name: 'Postman', publisher: 'Postman Inc.', version: '10.19.0' },
      { name: 'Docker Desktop', publisher: 'Docker Inc.', version: '4.25.2' },
    ];

    const assignmentTypes: Array<'InstalledSoftware' | 'EnterpriseApp' | 'LicenseService'> = [
      'InstalledSoftware',
      'EnterpriseApp',
      'LicenseService',
    ];
    const sources: Array<'Intune' | 'ConfigMgr' | 'AzureAD' | 'License'> = [
      'Intune',
      'ConfigMgr',
      'AzureAD',
      'License',
    ];

    return apps.slice(0, count).map((app, i) => ({
      name: app.name,
      version: app.version,
      publisher: app.publisher,
      type: 'Application',
      userCount: Math.floor(Math.random() * 10) + 1,
      groupCount: Math.floor(Math.random() * 3),
      deviceCount: Math.floor(Math.random() * 5) + 1,
      lastSeen: new Date(2024, 9, 4 - (i % 30)),
      id: `app-${i}`,
      installDate: new Date(2023, i % 12, (i % 28) + 1),
      installCount: Math.floor(Math.random() * 20) + 5,
      status: 'Installed',
      category: i % 3 === 0 ? 'Productivity' : i % 3 === 1 ? 'Development' : 'Communication',
      assignmentType: assignmentTypes[i % assignmentTypes.length],
      source: sources[i % sources.length],
    }));
  }

  private generateMockDrives(count: number): MappedDriveData[] {
    const drives = ['Z:', 'Y:', 'X:', 'W:'];
    const shares = ['\\\\fileserver\\users', '\\\\fileserver\\shared', '\\\\fileserver\\projects', '\\\\fileserver\\department'];

    return Array.from({ length: Math.min(count, drives.length) }, (_, i) => ({
      driveLetter: drives[i],
      uncPath: shares[i],
      userSid: 'S-1-5-21-123456789-123456789-123456789-1001',
      persistent: true,
      label: `Network Drive ${i + 1}`,
      connected: true,
    }));
  }

  private generateMockFileAccess(count: number): FileAccessEntry[] {
    const paths = [
      '\\\\fileserver\\users\\johndoe',
      '\\\\fileserver\\shared\\documents',
      '\\\\fileserver\\projects\\project-alpha',
      'C:\\Shared\\TeamFiles',
      '\\\\fileserver\\department\\IT',
      '\\\\fileserver\\archives\\2024',
      'C:\\Users\\Public\\Documents',
      '\\\\fileserver\\software\\installers',
    ];

    const rights = ['FullControl', 'Modify', 'ReadAndExecute', 'Read', 'Write'];

    return Array.from({ length: Math.min(count, paths.length) }, (_, i) => ({
      path: paths[i],
      rights: rights[i % rights.length],
      inherited: i % 3 !== 0,
      isShare: paths[i].startsWith('\\\\'),
      isNtfs: !paths[i].startsWith('\\\\'),
      identitySid: 'S-1-5-21-123456789-123456789-123456789-1001',
      accessType: 'Allow' as const,
      appliesTo: 'This folder, subfolders and files',
    }));
  }

  private generateMockGpos(count: number, type: 'link' | 'filter'): GpoData[] {
    const gpoNames = type === 'link'
      ? ['Default Domain Policy', 'IT Security Policy', 'Password Policy', 'Desktop Settings']
      : ['User Configuration Filter', 'Security Settings Filter'];

    return Array.from({ length: Math.min(count, gpoNames.length) }, (_, i) => ({
      name: gpoNames[i],
      guid: `{${crypto.randomUUID()}}`,
      enabled: true,
      wmiFilter: type === 'filter' ? 'SELECT * FROM Win32_OperatingSystem WHERE Version LIKE "10.%"' : undefined,
      linkedOu: 'OU=Users,DC=contoso,DC=com',
      gpoStatus: 'Enabled',
      description: `Mock GPO ${type} ${i + 1}`,
      createdDate: new Date(2020, i % 12, 1),
      modifiedDate: new Date(2024, 9, 1),
    }));
  }

  private generateMockMailbox(upn: string | null): MailboxData | null {
    if (!upn) return null;

    return {
      mailboxGuid: crypto.randomUUID(),
      userPrincipalName: upn,
      sizeMb: 4567.89,
      type: 'UserMailbox',
      itemCount: 12345,
      database: 'EXCH-DB01',
      serverName: 'EXCH-SERVER01',
      quotaGB: 50,
      prohibitSendQuotaGB: 49,
      issueWarningQuotaGB: 45,
      lastLogonTime: new Date('2024-10-03T14:30:00Z'),
    };
  }

  private generateMockAzureRoles(count: number): AzureRoleAssignment[] {
    const roles = [
      { name: 'User', scope: 'Directory' },
      { name: 'Application Developer', scope: 'Directory' },
      { name: 'Reader', scope: '/subscriptions/12345678-1234-1234-1234-123456789012' },
    ];

    return roles.slice(0, count).map((role, i) => ({
      roleName: role.name,
      scope: role.scope,
      principalObjectId: `obj-${crypto.randomUUID()}`,
      principalType: 'User' as const,
      assignmentId: crypto.randomUUID(),
      roleDefinitionId: crypto.randomUUID(),
      createdOn: new Date(2023, i % 12, (i % 28) + 1),
      isInherited: false,
    }));
  }

  private generateMockSqlDatabases(count: number): SqlDatabaseData[] {
    const databases = [
      { server: 'SQL-SERVER01', instance: 'PROD', database: 'CRM_Database', role: 'db_datareader' },
      { server: 'SQL-SERVER02', instance: 'DEV', database: 'Analytics_DB', role: 'db_owner' },
    ];

    return databases.slice(0, count).map((db, i) => ({
      server: db.server,
      instance: db.instance,
      database: db.database,
      role: db.role,
      loginType: 'Windows' as const,
      hasAccess: true,
      permissions: ['SELECT', 'INSERT', 'UPDATE'],
      appHints: 'SSMS, Power BI',
      lastAccessed: new Date(2024, 9, 4 - i),
    }));
  }

  private generateMockRisks(count: number): RiskItem[] {
    const riskTypes = [
      {
        type: 'StaleAccount',
        severity: 'Medium' as const,
        description: 'User has not logged in for 90+ days',
        recommendation: 'Review account activity and consider disabling if no longer needed',
        category: 'Security' as const,
      },
      {
        type: 'OverprivilegedUser',
        severity: 'High' as const,
        description: 'User has excessive permissions across multiple systems',
        recommendation: 'Review and reduce permissions following principle of least privilege',
        category: 'Security' as const,
      },
      {
        type: 'MissingMFA',
        severity: 'High' as const,
        description: 'Multi-factor authentication is not enabled for this account',
        recommendation: 'Enable MFA to enhance account security',
        category: 'Security' as const,
      },
      {
        type: 'ExpiredPassword',
        severity: 'Low' as const,
        description: 'Password is set to never expire',
        recommendation: 'Implement password expiration policy',
        category: 'Compliance' as const,
      },
    ];

    return riskTypes.slice(0, count).map((risk, i) => ({
      ...risk,
      affectedEntity: `user-${i}`,
      detectedAt: new Date(2024, 9, 1),
      remediation: risk.recommendation,
      cvssScore: risk.severity === 'High' ? 7.5 : risk.severity === 'Medium' ? 5.0 : 2.0,
    }));
  }

  private generateMockMigrationHints(count: number): MigrationHint[] {
    const hints = [
      {
        category: 'Device',
        priority: 'High' as const,
        message: 'User has 3 devices that need to be migrated. Coordinate device handoff.',
        actionRequired: true,
        impact: 'High' as const,
        complexity: 'Medium' as const,
        estimatedEffort: '4 hours',
        dependencies: ['Device inventory', 'User coordination'],
      },
      {
        category: 'Application',
        priority: 'Medium' as const,
        message: '2 applications (Adobe Acrobat, Visual Studio) require license transfer',
        actionRequired: true,
        impact: 'Medium' as const,
        complexity: 'Low' as const,
        estimatedEffort: '1 hour',
        dependencies: ['License management'],
      },
      {
        category: 'Group',
        priority: 'High' as const,
        message: 'User is member of 5 groups - map to target directory groups',
        actionRequired: true,
        impact: 'High' as const,
        complexity: 'Medium' as const,
        estimatedEffort: '2 hours',
        dependencies: ['Group mapping', 'Access validation'],
      },
      {
        category: 'Mailbox',
        priority: 'High' as const,
        message: 'Mailbox size is 4.5GB - plan for migration window',
        actionRequired: true,
        impact: 'High' as const,
        complexity: 'Medium' as const,
        estimatedEffort: '6 hours',
        dependencies: ['Bandwidth availability', 'User notification'],
      },
      {
        category: 'FileAccess',
        priority: 'Medium' as const,
        message: 'User has 8 file share permissions - verify access in target environment',
        actionRequired: false,
        impact: 'Medium' as const,
        complexity: 'Low' as const,
        estimatedEffort: '1 hour',
        dependencies: ['File share mapping'],
      },
    ];

    return hints.slice(0, count);
  }

  private generateMockTeams(count: number): TeamMembership[] {
    const teamNames = [
      'Engineering Team',
      'Marketing Department',
      'Sales Operations',
      'IT Support',
      'Project Alpha',
      'Customer Success',
    ];

    return Array.from({ length: Math.min(count, teamNames.length) }, (_, i) => ({
      teamName: teamNames[i],
      teamId: `team-${i}-${Date.now()}`,
      userRole: i === 0 ? 'Owner' : 'Member',
      channelCount: Math.floor(Math.random() * 10) + 3,
      channels: i === 0 ? ['General', 'Announcements', 'Private-Leadership'] : undefined,
      source: 'Teams' as const,
    }));
  }

  private generateMockSharePointSites(count: number): SharePointSiteAccess[] {
    const sites = [
      { name: 'Company Intranet', url: 'https://contoso.sharepoint.com/sites/intranet', isOneDrive: false, access: 'Member' },
      { name: 'Engineering Hub', url: 'https://contoso.sharepoint.com/sites/engineering', isOneDrive: false, access: 'Owner' },
      { name: 'Project Documentation', url: 'https://contoso.sharepoint.com/sites/projects', isOneDrive: false, access: 'Member' },
      { name: 'HR Portal', url: 'https://contoso.sharepoint.com/sites/hr', isOneDrive: false, access: 'Visitor' },
      { name: 'Sales Resources', url: 'https://contoso.sharepoint.com/sites/sales', isOneDrive: false, access: 'Member' },
      { name: 'OneDrive - John Doe', url: 'https://contoso-my.sharepoint.com/personal/jdoe', isOneDrive: true, access: 'Owner' },
    ];

    return sites.slice(0, count).map((site, i) => ({
      siteName: site.name,
      siteUrl: site.url,
      accessLevel: site.access,
      isOneDrive: site.isOneDrive,
      source: 'SharePointOnline' as const,
      lastAccessed: new Date(2024, 11, 20 - i),
    }));
  }
}

// ========================================
// Computer Detail Mock Data (Epic 1 Task 1.3)
// ========================================

import type {
  ComputerDetailProjection,
  ComputerData,
  ComputerUserData,
  SoftwareInstallation,
  HardwareSpec,
  SecurityComplianceStatus,
  NetworkInfo,
  ComputerRiskItem,
  ComputerMigrationHint,
} from '../../renderer/types/models/computerDetail';

export class MockComputerDetailService {
  private static instance: MockComputerDetailService;
  private cache: Map<string, ComputerDetailProjection> = new Map();

  public static getInstance(): MockComputerDetailService {
    if (!MockComputerDetailService.instance) {
      MockComputerDetailService.instance = new MockComputerDetailService();
    }
    return MockComputerDetailService.instance;
  }

  public async getComputerDetailAsync(computerId: string): Promise<ComputerDetailProjection | null> {
    if (this.cache.has(computerId)) {
      console.log(`[MockComputerDetail] Returning cached computer detail for ${computerId}`);
      return this.cache.get(computerId) as ComputerDetailProjection;
    }

    console.log(`[MockComputerDetail] Generating mock computer detail for ${computerId}`);
    const computerDetail = this.generateMockComputerDetail(computerId);

    this.cache.set(computerId, computerDetail);
    setTimeout(() => this.cache.delete(computerId), 15 * 60 * 1000);

    return computerDetail;
  }

  public clearComputerDetailCache(computerId: string): void {
    this.cache.delete(computerId);
    console.log(`[MockComputerDetail] Cleared cache for ${computerId}`);
  }

  private generateMockComputerDetail(computerId: string): ComputerDetailProjection {
    const computer = this.generateMockComputer(computerId);
    const users = this.generateMockComputerUsers(3);
    const software = this.generateMockSoftware(45);
    const hardware = this.generateMockHardwareSpec();
    const security = this.generateMockSecurityStatus();
    const network = this.generateMockNetworkInfo();
    const groups = this.generateMockComputerGroups(5);
    const apps = this.generateMockComputerApps(12);
    const risks = this.generateMockComputerRisks(4);
    const migrationHints = this.generateMockComputerMigrationHints(5);

    return {
      computer,
      overview: {
        userCount: users.length,
        softwareCount: software.length,
        groupCount: groups.length,
        networkAdapterCount: network.adapters.length,
        lastBootTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        uptime: '3 days, 12 hours, 45 minutes',
        installDate: new Date(2023, 0, 15),
      },
      users,
      software,
      hardware,
      security,
      network,
      groups,
      apps,
      risks,
      migrationHints,
      primaryUser: users[0]?.userPrincipalName || null,
      assignedUsers: users.map((u) => u.userPrincipalName),
      memberOfGroups: groups.map((g) => g.name),
      stats: {
        totalUsers: users.length,
        totalSoftware: software.length,
        totalGroups: groups.length,
        totalRisks: risks.length,
        highRiskCount: risks.filter((r) => r.severity === 'High').length,
        criticalRiskCount: risks.filter((r) => r.severity === 'Critical').length,
        diskUsagePercentage: Math.floor((1 - (hardware.freeDiskGB / hardware.totalDiskGB)) * 100),
        complianceScore: 85,
      },
    };
  }

  private generateMockComputer(computerId: string): ComputerData {
    const osList = ['Windows 11 Pro', 'Windows 10 Enterprise', 'Windows Server 2022', 'Windows Server 2019'];
    const os = osList[computerId.charCodeAt(0) % osList.length];

    return {
      id: computerId,
      name: `WKS-${computerId.padStart(6, '0')}`,
      dns: `wks-${computerId}.contoso.com`,
      domain: 'contoso.com',
      ou: 'OU=Workstations,OU=Computers,DC=contoso,DC=com',
      os,
      osVersion: os.includes('11') ? '10.0.22631' : os.includes('10') ? '10.0.19045' : '10.0.20348',
      status: computerId.charCodeAt(0) % 3 === 0 ? 'Online' : computerId.charCodeAt(0) % 3 === 1 ? 'Offline' : 'Unknown',
      lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      macAddress: `00:15:5D:${Math.floor(Math.random() * 256)
        .toString(16)
        .toUpperCase()
        .padStart(2, '0')}:${Math.floor(Math.random() * 256)
        .toString(16)
        .toUpperCase()
        .padStart(2, '0')}:${Math.floor(Math.random() * 256)
        .toString(16)
        .toUpperCase()
        .padStart(2, '0')}`,
      manufacturer: ['Dell', 'HP', 'Lenovo'][computerId.charCodeAt(0) % 3],
      model: ['OptiPlex 7090', 'EliteDesk 800', 'ThinkCentre M90'][computerId.charCodeAt(0) % 3],
      serialNumber: `SN${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      isEnabled: true,
      createdDate: new Date(2023, 0, 15),
      modifiedDate: new Date(),
      description: 'Corporate workstation',
    };
  }

  private generateMockComputerUsers(count: number): ComputerUserData[] {
    return Array.from({ length: count }, (_, i) => ({
      userSid: `S-1-5-21-123456789-123456789-123456789-${1000 + i}`,
      userPrincipalName: `user${i}@contoso.com`,
      displayName: `User ${i}`,
      assignmentType: (i === 0 ? 'Primary' : i === 1 ? 'Secondary' : 'LastLogon') as 'Primary' | 'Secondary' | 'LastLogon',
      lastLogon: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      profilePath: `C:\\Users\\user${i}`,
      isPrimaryUser: i === 0,
    }));
  }

  private generateMockSoftware(count: number): SoftwareInstallation[] {
    const softwareList = [
      { name: 'Microsoft Office 365', publisher: 'Microsoft', category: 'Productivity' },
      { name: 'Google Chrome', publisher: 'Google LLC', category: 'Browser' },
      { name: 'Adobe Acrobat Reader', publisher: 'Adobe Inc.', category: 'Productivity' },
      { name: 'Zoom', publisher: 'Zoom Video Communications', category: 'Communication' },
      { name: 'Microsoft Teams', publisher: 'Microsoft', category: 'Communication' },
      { name: 'Visual Studio Code', publisher: 'Microsoft', category: 'Development' },
      { name: 'Slack', publisher: 'Slack Technologies', category: 'Communication' },
      { name: 'Notepad++', publisher: 'Notepad++ Team', category: 'Development' },
      { name: '7-Zip', publisher: '7-Zip', category: 'Utility' },
      { name: 'VLC Media Player', publisher: 'VideoLAN', category: 'Media' },
    ];

    return Array.from({ length: Math.min(count, 50) }, (_, i) => {
      const software = softwareList[i % softwareList.length];
      return {
        name: software.name,
        version: `${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 100)}.${Math.floor(Math.random() * 1000)}`,
        publisher: software.publisher,
        installDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        installPath: `C:\\Program Files\\${software.name.replace(/\s+/g, '')}`,
        category: software.category,
        size: Math.floor(Math.random() * 500) + 10,
        licenseKey: null as string | null,
        licenseType: 'Commercial',
      };
    });
  }

  private generateMockHardwareSpec(): HardwareSpec {
    return {
      processor: 'Intel Core i7-11700 @ 2.50GHz',
      processorCores: 8,
      processorSpeed: '2.50 GHz',
      ramGB: 16,
      totalDiskGB: 512,
      freeDiskGB: 168,
      diskType: 'SSD',
      graphicsCard: 'Intel UHD Graphics 750',
      biosVersion: 'A12',
      biosDate: new Date(2023, 5, 15),
      systemType: '64-bit',
      virtualMachine: false,
      hypervisor: null,
    };
  }

  private generateMockSecurityStatus(): SecurityComplianceStatus {
    return {
      antivirusInstalled: true,
      antivirusProduct: 'Windows Defender',
      antivirusUpToDate: true,
      antivirusLastUpdate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      firewallEnabled: true,
      firewallProfile: 'Domain',
      encryptionEnabled: true,
      encryptionType: 'BitLocker',
      tpmEnabled: true,
      secureBoot: true,
      lastPatchDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      patchLevel: 'Fully Patched',
      complianceStatus: 'Compliant',
      complianceIssues: [],
      vulnerabilityCount: 2,
      criticalVulnerabilityCount: 0,
    };
  }

  private generateMockNetworkInfo(): NetworkInfo {
    return {
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      macAddress: `00:15:5D:${Math.floor(Math.random() * 256)
        .toString(16)
        .toUpperCase()
        .padStart(2, '0')}:${Math.floor(Math.random() * 256)
        .toString(16)
        .toUpperCase()
        .padStart(2, '0')}:${Math.floor(Math.random() * 256)
        .toString(16)
        .toUpperCase()
        .padStart(2, '0')}`,
      subnet: '255.255.255.0',
      gateway: '192.168.1.1',
      dnsServers: ['192.168.1.10', '192.168.1.11'],
      dhcpEnabled: true,
      dhcpServer: '192.168.1.1',
      vlan: null,
      connectionType: 'Wired',
      wifiSSID: null,
      networkSpeed: '1 Gbps',
      adapters: [
        {
          name: 'Ethernet',
          type: 'Ethernet',
          macAddress: '00:15:5D:AB:CD:EF',
          status: 'Connected',
          speed: '1 Gbps',
          ipAddresses: ['192.168.1.100'],
        },
        {
          name: 'Wi-Fi',
          type: 'WiFi',
          macAddress: '00:15:5D:12:34:56',
          status: 'Disconnected',
          speed: null,
          ipAddresses: [],
        },
      ],
    };
  }

  private generateMockComputerGroups(count: number): GroupData[] {
    const groupNames = ['Domain Computers', 'Workstations', 'Finance-Computers', 'IT-Admin-Computers', 'VPN Users'];

    return Array.from({ length: Math.min(count, groupNames.length) }, (_, i) => ({
      id: `group-${i}`,
      objectId: `obj-group-${i}`,
      name: groupNames[i],
      displayName: groupNames[i],
      description: `Computer group ${i}`,
      email: null as string | null,
      groupType: GroupType.Security,
      scope: GroupScope.Global,
      membershipType: MembershipType.Static,
      memberCount: Math.floor(Math.random() * 100) + 10,
      owners: ['admin@contoso.com'],
      createdDate: new Date(2020, i % 12, 1).toISOString(),
      lastModified: new Date().toISOString(),
      source: 'ActiveDirectory' as const,
      distinguishedName: `CN=${groupNames[i]},OU=Groups,DC=contoso,DC=com`,
      managedBy: undefined as string | undefined,
      isSecurityEnabled: true,
      isMailEnabled: false,
    }));
  }

  private generateMockComputerApps(count: number): ApplicationData[] {
    const apps = [
      { name: 'Microsoft Office 365', publisher: 'Microsoft', version: '16.0.12345' },
      { name: 'Google Chrome', publisher: 'Google LLC', version: '120.0.6099' },
      { name: 'Adobe Acrobat Reader', publisher: 'Adobe Inc.', version: '2024.001' },
      { name: 'Slack', publisher: 'Slack Technologies', version: '4.35.121' },
      { name: 'Visual Studio Code', publisher: 'Microsoft', version: '1.84.2' },
      { name: 'Zoom', publisher: 'Zoom Video Communications', version: '5.16.5' },
      { name: '7-Zip', publisher: '7-Zip', version: '23.01' },
      { name: 'VLC Media Player', publisher: 'VideoLAN', version: '3.0.20' },
      { name: 'Microsoft Teams', publisher: 'Microsoft', version: '1.6.00.36174' },
      { name: 'Notepad++', publisher: 'Notepad++ Team', version: '8.6.0' },
      { name: 'Postman', publisher: 'Postman Inc.', version: '10.19.0' },
      { name: 'Docker Desktop', publisher: 'Docker Inc.', version: '4.25.2' },
    ];

    return apps.slice(0, count).map((app, i) => ({
      name: app.name,
      version: app.version,
      publisher: app.publisher,
      type: 'Application',
      userCount: Math.floor(Math.random() * 10) + 1,
      groupCount: Math.floor(Math.random() * 3),
      deviceCount: Math.floor(Math.random() * 5) + 1,
      lastSeen: new Date(2024, 9, 4 - (i % 30)),
      id: `app-${i}`,
      installDate: new Date(2023, i % 12, (i % 28) + 1),
      installCount: Math.floor(Math.random() * 20) + 5,
      status: 'Installed',
      category: i % 3 === 0 ? 'Productivity' : i % 3 === 1 ? 'Development' : 'Communication',
    }));
  }

  private generateMockComputerRisks(count: number): ComputerRiskItem[] {
    const riskTypes = [
      {
        type: 'OutdatedOS',
        severity: 'High' as const,
        description: 'Operating system version is outdated and should be upgraded',
        recommendation: 'Schedule OS upgrade to latest version',
        category: 'Security' as const,
      },
      {
        type: 'MissingPatches',
        severity: 'Medium' as const,
        description: '3 critical security patches are missing',
        recommendation: 'Apply missing patches during next maintenance window',
        category: 'Security' as const,
      },
      {
        type: 'LowDiskSpace',
        severity: 'Low' as const,
        description: 'Free disk space is below 20% threshold',
        recommendation: 'Clean up temporary files or expand disk capacity',
        category: 'Performance' as const,
      },
      {
        type: 'NoBackup',
        severity: 'High' as const,
        description: 'Computer has not been backed up in 30+ days',
        recommendation: 'Enable automated backup schedule',
        category: 'Configuration' as const,
      },
    ];

    return riskTypes.slice(0, count).map((risk, i) => ({
      ...risk,
      affectedComponent: `computer-${i}`,
      detectedAt: new Date(2024, 9, 1),
      remediation: risk.recommendation,
    }));
  }

  private generateMockComputerMigrationHints(count: number): ComputerMigrationHint[] {
    const hints: ComputerMigrationHint[] = [
      {
        category: 'Hardware',
        priority: 'Medium' as const,
        message: 'Computer meets minimum requirements for target environment',
        actionRequired: false,
        impact: 'Low' as const,
        complexity: 'Low' as const,
        estimatedEffort: '30 minutes',
        dependencies: ['Hardware inventory'],
      },
      {
        category: 'Software',
        priority: 'High' as const,
        message: '45 applications installed - verify compatibility with target OS',
        actionRequired: true,
        impact: 'High' as const,
        complexity: 'High' as const,
        estimatedEffort: '8 hours',
        dependencies: ['Application compatibility testing'],
      },
      {
        category: 'User',
        priority: 'High' as const,
        message: '3 users assigned - coordinate migration schedule',
        actionRequired: true,
        impact: 'High' as const,
        complexity: 'Medium' as const,
        estimatedEffort: '2 hours',
        dependencies: ['User coordination', 'Calendar scheduling'],
      },
      {
        category: 'Network',
        priority: 'Low' as const,
        message: 'Network configuration is standard - minimal changes required',
        actionRequired: false,
        impact: 'Low' as const,
        complexity: 'Low' as const,
        estimatedEffort: '15 minutes',
        dependencies: [],
      },
      {
        category: 'Security',
        priority: 'Medium' as const,
        message: 'BitLocker enabled - ensure recovery keys are backed up',
        actionRequired: true,
        impact: 'Medium' as const,
        complexity: 'Low' as const,
        estimatedEffort: '30 minutes',
        dependencies: ['Recovery key backup'],
      },
    ];

    return hints.slice(0, count);
  }
}

// ========================================
// Group Detail Mock Data (Epic 1 Task 1.4)
// ========================================

import type {
  GroupDetailProjection,
  GroupMemberData,
  GroupOwnerData,
  GroupPermissionData,
  GroupApplicationAccess,
  NestedGroupData,
  GroupPolicyAssignment,
  GroupRiskItem,
  GroupMigrationHint,
  GroupSyncStatus,
} from '../../renderer/types/models/groupDetail';

export class MockGroupDetailService {
  private static instance: MockGroupDetailService;
  private cache: Map<string, GroupDetailProjection> = new Map();

  public static getInstance(): MockGroupDetailService {
    if (!MockGroupDetailService.instance) {
      MockGroupDetailService.instance = new MockGroupDetailService();
    }
    return MockGroupDetailService.instance;
  }

  public async getGroupDetailAsync(groupId: string): Promise<GroupDetailProjection | null> {
    if (this.cache.has(groupId)) {
      console.log(`[MockGroupDetail] Returning cached group detail for ${groupId}`);
      return this.cache.get(groupId) as GroupDetailProjection;
    }

    console.log(`[MockGroupDetail] Generating mock group detail for ${groupId}`);
    const groupDetail = this.generateMockGroupDetail(groupId);

    this.cache.set(groupId, groupDetail);
    setTimeout(() => this.cache.delete(groupId), 15 * 60 * 1000);

    return groupDetail;
  }

  public clearGroupDetailCache(groupId: string): void {
    this.cache.delete(groupId);
    console.log(`[MockGroupDetail] Cleared cache for ${groupId}`);
  }

  private generateMockGroupDetail(groupId: string): GroupDetailProjection {
    const group = this.generateMockGroup(groupId);
    const members = this.generateMockGroupMembers(25);
    const owners = this.generateMockGroupOwners(2);
    const permissions = this.generateMockGroupPermissions(12);
    const applications = this.generateMockGroupApplications(8);
    const nestedGroups = this.generateMockNestedGroups(5);
    const policies = this.generateMockGroupPolicies(3);
    const risks = this.generateMockGroupRisks(3);
    const migrationHints = this.generateMockGroupMigrationHints(5);
    const syncStatus = this.generateMockSyncStatus();

    return {
      group,
      overview: {
        memberCount: members.length,
        ownerCount: owners.length,
        permissionCount: permissions.length,
        applicationCount: applications.length,
        nestedGroupCount: nestedGroups.length,
        createdDate: new Date(2022, 0, 1),
        modifiedDate: new Date(),
        description: 'Security group for department access',
        notes: null,
        isHybrid: true,
        isDynamic: false,
        dynamicMembershipRule: null,
      },
      members,
      owners,
      permissions,
      applications,
      nestedGroups,
      policies,
      risks,
      migrationHints,
      syncStatus,
      directMembers: members.filter((m) => m.memberType === 'Direct').map((m) => m.userPrincipalName),
      allMembers: members.map((m) => m.userPrincipalName),
      primaryOwner: owners.find((o) => o.ownershipType === 'Primary')?.userPrincipalName || null,
      allOwners: owners.map((o) => o.userPrincipalName || o.displayName),
      parentGroups: nestedGroups.filter((g) => g.relationshipType === 'Parent').map((g) => g.groupName),
      childGroups: nestedGroups.filter((g) => g.relationshipType === 'Child').map((g) => g.groupName),
      stats: {
        totalMembers: members.length,
        totalOwners: owners.length,
        totalPermissions: permissions.length,
        totalApplications: applications.length,
        totalNestedGroups: nestedGroups.length,
        totalRisks: risks.length,
        highRiskCount: risks.filter((r) => r.severity === 'High').length,
        criticalRiskCount: risks.filter((r) => r.severity === 'Critical').length,
        activeMembers: members.filter((m) => m.accountEnabled).length,
        staleMembers: members.filter((m) => !m.accountEnabled).length,
        securityScore: 82,
      },
    };
  }

  private generateMockGroup(groupId: string): GroupData {
    return {
      id: groupId,
      objectId: `obj-${groupId}`,
      name: `Group-${groupId}`,
      displayName: `Department Group ${groupId}`,
      description: 'Mock group for testing',
      email: `group-${groupId}@contoso.com`,
      groupType: GroupType.Security,
      scope: GroupScope.Universal,
      membershipType: MembershipType.Static,
      memberCount: 25,
      owners: ['admin@contoso.com'],
      createdDate: new Date(2022, 0, 1).toISOString(),
      lastModified: new Date().toISOString(),
      source: 'ActiveDirectory' as const,
      distinguishedName: `CN=Group-${groupId},OU=Groups,DC=contoso,DC=com`,
      managedBy: 'CN=Admin,OU=Users,DC=contoso,DC=com',
      isSecurityEnabled: true,
      isMailEnabled: false,
    };
  }

  private generateMockGroupMembers(count: number): GroupMemberData[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `member-${i}`,
      userPrincipalName: `user${i}@contoso.com`,
      displayName: `User ${i}`,
      email: `user${i}@contoso.com`,
      memberType: (i < 20 ? 'Direct' : i < 23 ? 'Nested' : 'Dynamic') as 'Direct' | 'Nested' | 'Dynamic',
      addedDate: new Date(2023, i % 12, (i % 28) + 1),
      department: ['IT', 'Finance', 'HR', 'Sales'][i % 4],
      jobTitle: ['Engineer', 'Manager', 'Analyst', 'Director'][i % 4],
      accountEnabled: i < 23,
      membershipSource: i < 20 ? 'Manual' : 'Inherited',
      isDirectMember: i < 20,
    }));
  }

  private generateMockGroupOwners(count: number): GroupOwnerData[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `owner-${i}`,
      displayName: `Owner ${i}`,
      type: 'User' as const,
      userPrincipalName: `owner${i}@contoso.com`,
      email: `owner${i}@contoso.com`,
      ownershipType: (i === 0 ? 'Primary' : 'Secondary') as 'Primary' | 'Secondary',
      assignedDate: new Date(2022, 0, 1),
      isPrimaryOwner: i === 0,
    }));
  }

  private generateMockGroupPermissions(count: number): GroupPermissionData[] {
    const resourceTypes = ['SharePoint Site', 'Exchange Mailbox', 'Azure Subscription', 'File Share'];
    const accessLevels = ['Full Control', 'Contribute', 'Read', 'Owner'];

    return Array.from({ length: count }, (_, i) => ({
      resourceType: resourceTypes[i % resourceTypes.length],
      resourceName: `Resource-${i}`,
      permissionLevel: accessLevels[i % accessLevels.length],
      accessLevel: accessLevels[i % accessLevels.length],
      permissionType: i % 2 === 0 ? 'Direct' : 'Inherited',
      scope: i % 3 === 0 ? 'Global' : 'Limited',
      isInherited: i % 2 !== 0,
      inherited: i % 2 !== 0,
      grantedDate: new Date(2023, i % 12, (i % 28) + 1),
      assignedDate: new Date(2023, i % 12, (i % 28) + 1),
      assignedBy: 'admin@contoso.com',
      source: (['Azure', 'ActiveDirectory', 'Exchange', 'SharePoint'] as const)[i % 4],
    }));
  }

  private generateMockGroupApplications(count: number): GroupApplicationAccess[] {
    const apps = [
      'Microsoft 365',
      'Salesforce',
      'Azure DevOps',
      'GitHub',
      'Jira',
      'Confluence',
      'Slack',
      'Zoom',
    ];
    const roles = ['Admin', 'User', 'Contributor', 'Reader'];

    return Array.from({ length: count }, (_, i) => ({
      applicationId: `app-${i}`,
      applicationName: apps[i % apps.length],
      accessLevel: roles[i % roles.length],
      roleName: roles[i % roles.length],
      accessType: i % 2 === 0 ? 'Direct' : 'Inherited',
      roles: [roles[i % roles.length]],
      grantedDate: new Date(2023, i % 12, (i % 28) + 1),
      grantedBy: 'admin@contoso.com',
      source: (['Azure', 'ActiveDirectory'] as const)[i % 2],
      isConditionalAccess: i % 3 === 0,
      isConditional: i % 3 === 0,
      conditions: i % 3 === 0 ? ['MFA Required', 'Compliant Device'] : [],
    }));
  }

  private generateMockNestedGroups(count: number): NestedGroupData[] {
    return Array.from({ length: count }, (_, i) => ({
      groupId: `nested-group-${i}`,
      groupName: `Nested Group ${i}`,
      relationshipType: (i < 3 ? 'Child' : 'Parent') as 'Child' | 'Parent',
      relationship: i < 3 ? 'Child' : 'Parent',
      groupType: 'Security',
      scope: 'Global',
      memberCount: Math.floor(Math.random() * 50) + 5,
      nestingLevel: i % 2 === 0 ? 1 : 2,
      addedDate: new Date(2023, i % 12, (i % 28) + 1),
      isCircular: i === 4,
    }));
  }

  private generateMockGroupPolicies(count: number): GroupPolicyAssignment[] {
    return Array.from({ length: count }, (_, i) => ({
      policyName: `Group Policy ${i}`,
      policyGuid: crypto.randomUUID(),
      policyType: (['User', 'Computer', 'Both'] as const)[i % 3],
      enabled: true,
      linkedOu: 'OU=Groups,DC=contoso,DC=com',
      order: i + 1,
      enforced: i === 0,
      appliesTo: 'All Users',
    }));
  }

  private generateMockGroupRisks(count: number): GroupRiskItem[] {
    const riskTypes = [
      {
        type: 'StaleMembership',
        severity: 'Medium' as const,
        description: '2 members have inactive accounts',
        recommendation: 'Review and remove inactive members',
        category: 'Security' as const,
      },
      {
        type: 'OverprivilegedGroup',
        severity: 'High' as const,
        description: 'Group has excessive permissions across multiple resources',
        recommendation: 'Review and reduce permissions following principle of least privilege',
        category: 'Security' as const,
      },
      {
        type: 'CircularNesting',
        severity: 'High' as const,
        description: 'Circular group nesting detected',
        recommendation: 'Resolve circular dependencies in group membership',
        category: 'Configuration' as const,
      },
    ];

    return riskTypes.slice(0, count).map((risk, i) => ({
      ...risk,
      affectedMembers: [`member-${i}`],
      affectedResources: [`resource-${i}`],
      detectedAt: new Date(2024, 9, 1),
      remediation: risk.recommendation,
    }));
  }

  private generateMockGroupMigrationHints(count: number): GroupMigrationHint[] {
    const hints = [
      {
        category: 'Membership',
        priority: 'High' as const,
        message: 'Group has 25 members - verify all should be migrated',
        actionRequired: true,
        impact: 'High' as const,
        complexity: 'Medium' as const,
        estimatedEffort: '3 hours',
        dependencies: ['Member verification', 'Access validation'],
      },
      {
        category: 'Permissions',
        priority: 'High' as const,
        message: '12 permissions assigned - map to target environment',
        actionRequired: true,
        impact: 'High' as const,
        complexity: 'High' as const,
        estimatedEffort: '4 hours',
        dependencies: ['Permission mapping', 'Resource availability'],
      },
      {
        category: 'NestedGroups',
        priority: 'Medium' as const,
        message: '5 nested group relationships - verify hierarchy in target',
        actionRequired: true,
        impact: 'Medium' as const,
        complexity: 'Medium' as const,
        estimatedEffort: '2 hours',
        dependencies: ['Group hierarchy mapping'],
      },
      {
        category: 'Applications',
        priority: 'High' as const,
        message: '8 application access assignments - verify in target environment',
        actionRequired: true,
        impact: 'High' as const,
        complexity: 'Medium' as const,
        estimatedEffort: '3 hours',
        dependencies: ['Application availability', 'Role mapping'],
      },
      {
        category: 'Sync',
        priority: 'Low' as const,
        message: 'Group is hybrid synced - ensure sync is configured in target',
        actionRequired: false,
        impact: 'Low' as const,
        complexity: 'Low' as const,
        estimatedEffort: '1 hour',
        dependencies: ['Hybrid sync configuration'],
      },
    ];

    return hints.slice(0, count);
  }

  private generateMockSyncStatus(): GroupSyncStatus {
    return {
      isSynced: true,
      lastSyncTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      syncSource: 'ActiveDirectory',
      syncErrors: [],
      deltaChanges: 0,
      syncEnabled: true,
    };
  }
}

// Export singleton instances
export const mockLogicEngineService = MockLogicEngineService.getInstance();
export const mockComputerDetailService = MockComputerDetailService.getInstance();
export const mockGroupDetailService = MockGroupDetailService.getInstance();


