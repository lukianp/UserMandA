/**
 * Logic Engine Service
 * TypeScript port of C# LogicEngineService.cs
 * Core data correlation and processing engine
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as Papa from 'papaparse';
import {
  UserDto, GroupDto, DeviceDto, AppDto, GpoDto, AclEntry,
  MappedDriveDto, MailboxDto, AzureRoleAssignment, SqlDbDto,
  FileShareDto, ThreatDetectionDTO, DataGovernanceDTO, DataLineageDTO,
  ExternalIdentityDTO, GraphNode, GraphEdge, NodeType, EdgeType,
  LogicEngineRisk, MigrationHint, UserDetailProjection, AssetDetailProjection,
  FuzzyMatchingConfig, DataLoadStatistics, DataLoadedEventArgs,
  DataLoadErrorEventArgs, RiskDashboardProjection, ThreatAnalysisProjection
} from '../../renderer/types/models/logicEngine';
// InferenceRulesMixin methods are now implemented inline below (webpack bundling fix)

// In-memory cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Progress event data
export interface LoadProgressEvent {
  stage: string;
  message: string;
  percentage: number;
  currentFile?: string;
}

/**
 * Core Logic Engine Service that unifies CSV data into typed graphs and projections
 * Implements read-optimized data layer with inference capabilities
 */
export class LogicEngineService extends EventEmitter {
  private static instance: LogicEngineService;

  // Inference Rules - implemented inline below (no longer using mixin pattern)

  private readonly dataRoot: string;
  private readonly fuzzyConfig: FuzzyMatchingConfig;
  private readonly memoryCache: Map<string, CacheEntry<any>> = new Map();

  // Semaphores for concurrency control
  private isLoading = false;
  private lastLoadTime?: Date;
  private fileLoadTimes: Map<string, Date> = new Map();

  // In-memory data stores (using Maps instead of ConcurrentDictionary)
  private usersBySid: Map<string, UserDto> = new Map();
  private usersByUpn: Map<string, UserDto> = new Map();
  private groupsBySid: Map<string, GroupDto> = new Map();
  private membersByGroupSid: Map<string, string[]> = new Map();
  private groupsByUserSid: Map<string, string[]> = new Map();
  private devicesByName: Map<string, DeviceDto> = new Map();
  private devicesByPrimaryUserSid: Map<string, DeviceDto[]> = new Map();
  private appsById: Map<string, AppDto> = new Map();
  private appsByDevice: Map<string, string[]> = new Map();
  private aclByIdentitySid: Map<string, AclEntry[]> = new Map();
  private drivesByUserSid: Map<string, MappedDriveDto[]> = new Map();
  private gposByGuid: Map<string, GpoDto> = new Map();
  private gposBySidFilter: Map<string, GpoDto[]> = new Map();
  private gposByOu: Map<string, GpoDto[]> = new Map();
  private mailboxByUpn: Map<string, MailboxDto> = new Map();
  private rolesByPrincipalId: Map<string, AzureRoleAssignment[]> = new Map();
  private sqlDbsByKey: Map<string, SqlDbDto> = new Map();
  private fileSharesByPath: Map<string, FileShareDto> = new Map();

  // T-029: New data stores for expanded modules
  private threatsByThreatId: Map<string, ThreatDetectionDTO> = new Map();
  private threatsByAsset: Map<string, ThreatDetectionDTO[]> = new Map();
  private threatsByCategory: Map<string, ThreatDetectionDTO[]> = new Map();
  private threatsBySeverity: Map<string, ThreatDetectionDTO[]> = new Map();

  private governanceByAssetId: Map<string, DataGovernanceDTO> = new Map();
  private governanceByOwner: Map<string, DataGovernanceDTO[]> = new Map();
  private governanceByCompliance: Map<string, DataGovernanceDTO[]> = new Map();

  private lineageByLineageId: Map<string, DataLineageDTO> = new Map();
  private lineageBySourceAsset: Map<string, DataLineageDTO[]> = new Map();
  private lineageByTargetAsset: Map<string, DataLineageDTO[]> = new Map();

  private externalIdentitiesById: Map<string, ExternalIdentityDTO> = new Map();
  private externalIdentitiesByUpn: Map<string, ExternalIdentityDTO> = new Map();
  private externalIdentitiesByProvider: Map<string, ExternalIdentityDTO[]> = new Map();
  private externalIdentitiesByMappingStatus: Map<string, ExternalIdentityDTO[]> = new Map();

  // Enhanced graph structures
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];
  private entityRelationships: Map<string, string[]> = new Map();
  private entityMetadata: Map<string, Record<string, any>> = new Map();

  // State tracking
  private appliedInferenceRules: string[] = [];
  private lastLoadStats?: DataLoadStatistics;

  private constructor(dataRoot?: string) {
    super();
    this.dataRoot = dataRoot || 'C:\\discoverydata\\ljpops\\Raw';
    this.fuzzyConfig = {
      LevenshteinThreshold: 0.8,
      JaroWinklerThreshold: 0.85,
      SoundexEnabled: false,
      MetaphoneEnabled: false,
      BigramAnalysisEnabled: false
    };
  }

  public static getInstance(dataRoot?: string): LogicEngineService {
    if (!LogicEngineService.instance) {
      LogicEngineService.instance = new LogicEngineService(dataRoot);
      // Note: Inference rules are now implemented inline in the class (no mixin needed)
    }
    return LogicEngineService.instance;
  }

  public getIsLoading(): boolean {
    return this.isLoading;
  }

  public getLastLoadTime(): Date | undefined {
    return this.lastLoadTime;
  }

  /**
   * Main entry point - loads all discovery data from CSV files
   */
  public async loadAllAsync(profilePath?: string): Promise<boolean> {
    if (this.isLoading) {
      console.warn('Load already in progress, skipping duplicate request');
      return false;
    }

    try {
      this.isLoading = true;
      const startTime = new Date();
      this.appliedInferenceRules = [];

      const dataPath = profilePath || this.dataRoot;
      console.log(`Starting LogicEngine data load from ${dataPath}`);
      this.emit('progress', { stage: 'init', message: 'Initializing data load', percentage: 0 });

      // Check if directory exists
      try {
        await fs.access(dataPath);
      } catch {
        const error = new Error(`Data directory not found: ${dataPath}`);
        console.error(`Data directory not found: ${dataPath}`);
        this.emit('error', {
          Error: error,
          Message: error.message
        } as DataLoadErrorEventArgs);
        return false;
      }

      // Get all CSV files
      const files = await fs.readdir(dataPath);
      const csvFiles = files.filter(f => f.toLowerCase().endsWith('.csv'))
        .map(f => path.join(dataPath, f));

      // Check if any files have changed
      const hasChanges = await this.checkForFileChanges(csvFiles);
      if (!hasChanges && this.lastLoadTime) {
        console.log('No CSV changes detected. Using cached data');
        this.emit('progress', { stage: 'cached', message: 'Using cached data', percentage: 100 });
        return true;
      }

      // Clear existing data stores
      await this.clearDataStores();

      // Load CSV data with controlled concurrency
      this.emit('progress', { stage: 'loading', message: 'Loading CSV files', percentage: 10 });

      const loadTasks = [
        this.loadUsersStreamingAsync(dataPath),
        this.loadGroupsStreamingAsync(dataPath),
        this.loadDevicesStreamingAsync(dataPath),
        this.loadApplicationsStreamingAsync(dataPath),
        this.loadGposStreamingAsync(dataPath),
        this.loadAclsStreamingAsync(dataPath),
        this.loadMappedDrivesStreamingAsync(dataPath),
        this.loadMailboxesStreamingAsync(dataPath),
        this.loadAzureRolesStreamingAsync(dataPath),
        this.loadSqlDatabasesStreamingAsync(dataPath),
        // T-029: New module loading tasks
        this.loadThreatDetectionStreamingAsync(dataPath),
        this.loadDataGovernanceStreamingAsync(dataPath),
        this.loadDataLineageStreamingAsync(dataPath),
        this.loadExternalIdentitiesStreamingAsync(dataPath)
      ];

      await Promise.all(loadTasks);

      // Build indices
      this.emit('progress', { stage: 'indexing', message: 'Building indices', percentage: 60 });
      await this.buildIndicesAsync();

      // Apply inference rules
      this.emit('progress', { stage: 'inference', message: 'Applying inference rules', percentage: 80 });
      await this.applyInferenceRulesAsync();

      // Generate statistics
      const duration = new Date().getTime() - startTime.getTime();
      this.lastLoadStats = {
        UserCount: this.usersBySid.size,
        GroupCount: this.groupsBySid.size,
        DeviceCount: this.devicesByName.size,
        AppCount: this.appsById.size,
        GpoCount: this.gposByGuid.size,
        AclEntryCount: Array.from(this.aclByIdentitySid.values()).reduce((sum, list) => sum + list.length, 0),
        MappedDriveCount: Array.from(this.drivesByUserSid.values()).reduce((sum, list) => sum + list.length, 0),
        MailboxCount: this.mailboxByUpn.size,
        AzureRoleCount: Array.from(this.rolesByPrincipalId.values()).reduce((sum, list) => sum + list.length, 0),
        SqlDbCount: this.sqlDbsByKey.size,
        ThreatCount: this.threatsByThreatId.size,
        GovernanceAssetCount: this.governanceByAssetId.size,
        LineageFlowCount: this.lineageByLineageId.size,
        ExternalIdentityCount: this.externalIdentitiesById.size,
        InferenceRulesApplied: this.appliedInferenceRules.length,
        FuzzyMatchesFound: this.getFuzzyMatchCount(),
        LoadDuration: duration,
        LoadTimestamp: startTime
      };

      // Update file timestamps
      for (const file of csvFiles) {
        const stats = await fs.stat(file);
        this.fileLoadTimes.set(file, stats.mtime);
      }

      this.lastLoadTime = new Date();
      console.log(`LogicEngine data load completed successfully in ${duration}ms`);

      this.emit('progress', { stage: 'complete', message: 'Data load complete', percentage: 100 });
      this.emit('loaded', {
        Statistics: this.lastLoadStats,
        AppliedInferenceRules: this.appliedInferenceRules
      } as DataLoadedEventArgs);

      return true;

    } catch (error: any) {
      console.error('Failed to load LogicEngine data:', error);
      this.emit('error', {
        Error: error instanceof Error ? error : new Error(String(error)),
        Message: error.message || String(error)
      } as DataLoadErrorEventArgs);
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Build user detail projection with all correlated data
   */
  public async buildUserDetailProjection(userId: string): Promise<UserDetailProjection | null> {
    const user = this.usersBySid.get(userId) || this.usersByUpn.get(userId);
    if (!user) {
      console.warn(`User not found: ${userId}`);
      return null;
    }

    // Get all correlated data
    const groups = this.getGroupsForUser(user.Sid);
    const devices = this.getDevicesForUser(user.Sid);
    const apps = this.getAppsForUser(user.Sid, devices);
    const drives = this.drivesByUserSid.get(user.Sid) || [];
    const shares = this.getSharesForUser(user.Sid);
    const gpoLinks = this.getGpoLinksForUser(user);
    const gpoFilters = this.getGpoFiltersForUser(user.Sid);
    const mailbox = this.mailboxByUpn.get(user.UPN) || this.mailboxByUpn.get(user.Mail || '');
    const azureRoles = this.rolesByPrincipalId.get(user.AzureObjectId || '') || [];
    const sqlDatabases = this.getSqlDatabasesForUser(user.Sid);
    const risks = this.calculateRisksForUser(user);
    const migrationHints = this.generateMigrationHintsForUser(user);

    // T-029: Get extended data
    const threats = this.getThreatsForAsset(user.Sid);
    const governanceIssues = this.getGovernanceForAsset(user.Sid);
    const dataLineage = this.getLineageForAsset(user.Sid);
    const externalIdentities = this.getExternalIdentitiesForUser(user.Sid);

    // Build projection
    const projection: UserDetailProjection = {
      User: user,
      Groups: groups,
      Devices: devices,
      Apps: apps,
      Drives: drives,
      Shares: shares,
      GpoLinks: gpoLinks,
      GpoFilters: gpoFilters,
      Mailbox: mailbox,
      AzureRoles: azureRoles,
      SqlDatabases: sqlDatabases,
      Risks: risks,
      MigrationHints: migrationHints,
      // T-027 Migration Engine properties
      MemberOfGroups: groups.map(g => g.Name || g.Dn || '').filter(n => n),
      ManagedGroups: groups.filter(g => g.ManagedBy === user.Dn).map(g => g.Name || g.Dn || ''),
      ManagerUpn: user.Manager || '',
      OwnedGroups: groups.filter(g => g.ManagedBy === user.Dn).map(g => g.Name || g.Dn || ''),
      // T-029 Extended properties
      Threats: threats,
      GovernanceIssues: governanceIssues ? [governanceIssues] : [],
      DataLineage: dataLineage,
      ExternalIdentities: externalIdentities
    };

    return projection;
  }

  // Private helper methods

  private async checkForFileChanges(csvFiles: string[]): Promise<boolean> {
    for (const file of csvFiles) {
      const lastLoadTime = this.fileLoadTimes.get(file);
      if (!lastLoadTime) {
        return true; // New file
      }

      const stats = await fs.stat(file);
      if (stats.mtime > lastLoadTime) {
        return true; // File modified
      }
    }
    return false;
  }

  private async clearDataStores(): Promise<void> {
    this.usersBySid.clear();
    this.usersByUpn.clear();
    this.groupsBySid.clear();
    this.membersByGroupSid.clear();
    this.groupsByUserSid.clear();
    this.devicesByName.clear();
    this.devicesByPrimaryUserSid.clear();
    this.appsById.clear();
    this.appsByDevice.clear();
    this.aclByIdentitySid.clear();
    this.drivesByUserSid.clear();
    this.gposByGuid.clear();
    this.gposBySidFilter.clear();
    this.gposByOu.clear();
    this.mailboxByUpn.clear();
    this.rolesByPrincipalId.clear();
    this.sqlDbsByKey.clear();

    // T-029: Clear new data stores
    this.threatsByThreatId.clear();
    this.threatsByAsset.clear();
    this.threatsByCategory.clear();
    this.threatsBySeverity.clear();
    this.governanceByAssetId.clear();
    this.governanceByOwner.clear();
    this.governanceByCompliance.clear();
    this.lineageByLineageId.clear();
    this.lineageBySourceAsset.clear();
    this.lineageByTargetAsset.clear();
    this.externalIdentitiesById.clear();
    this.externalIdentitiesByUpn.clear();
    this.externalIdentitiesByProvider.clear();
    this.externalIdentitiesByMappingStatus.clear();

    // Clear graph structures
    this.nodes.clear();
    this.edges = [];
    this.entityRelationships.clear();
    this.entityMetadata.clear();
    this.memoryCache.clear();
  }

  // CSV Loading Methods

  private async loadUsersStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'Users.csv'),
      path.join(dataPath, 'ADUsers.csv'),
      path.join(dataPath, 'AzureADUsers.csv'),
      path.join(dataPath, 'ExchangeUsers.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const user = this.parseUserFromCsv(row);
              if (user) {
                this.usersBySid.set(user.Sid, user);
                if (user.UPN) {
                  this.usersByUpn.set(user.UPN, user);
                }
              }
            });
          }
        });

        console.log(`Loaded ${this.usersBySid.size} users from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseUserFromCsv(row: any): UserDto | null {
    try {
      // Required fields
      const sid = row.Sid || row.SID || row.ObjectSid;
      const sam = row.Sam || row.SamAccountName || row.SAMAccountName || '';
      const upn = row.UPN || row.UserPrincipalName || row.Mail || '';

      if (!sid) {
        return null; // Skip incomplete records
      }

      // Parse groups array
      const groups = row.Groups ?
        row.Groups.split(';').filter((g: string) => g) : [];

      return {
        UPN: upn,
        Sam: sam,
        Sid: sid,
        Mail: row.Mail || row.EmailAddress,
        DisplayName: row.DisplayName || row.Name || sam,
        Enabled: row.Enabled === 'true' || row.Enabled === 'True' || row.Enabled === '1',
        OU: row.OU || row.OrganizationalUnit,
        ManagerSid: row.ManagerSid || row.Manager,
        Dept: row.Department || row.Dept,
        AzureObjectId: row.AzureObjectId || row.ObjectId,
        Groups: groups,
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'UserDiscovery',
        SessionId: row.SessionId || this.generateSessionId(),
        Manager: row.Manager,
        Dn: row.DN || row.DistinguishedName || sid
      };
    } catch (error) {
      console.warn('Failed to parse user from CSV:', error);
      return null;
    }
  }

  private async loadGroupsStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'Groups.csv'),
      path.join(dataPath, 'ADGroups.csv'),
      path.join(dataPath, 'AzureADGroups.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const group = this.parseGroupFromCsv(row);
              if (group) {
                this.groupsBySid.set(group.Sid, group);
              }
            });
          }
        });

        console.log(`Loaded ${this.groupsBySid.size} groups from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseGroupFromCsv(row: any): GroupDto | null {
    try {
      const sid = row.Sid || row.SID || row.ObjectSid;
      const name = row.Name || row.GroupName || row.CN || '';

      if (!sid || !name) {
        return null;
      }

      // Parse members array
      const members = row.Members ?
        row.Members.split(';').filter((m: string) => m) : [];

      // Parse nested groups
      const nestedGroups = row.NestedGroups ?
        row.NestedGroups.split(';').filter((g: string) => g) : [];

      return {
        Sid: sid,
        Name: name,
        Type: row.Type || row.GroupType || 'Security',
        Members: members,
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'GroupDiscovery',
        SessionId: row.SessionId || this.generateSessionId(),
        NestedGroups: nestedGroups,
        Dn: row.DN || row.DistinguishedName || sid,
        ManagedBy: row.ManagedBy || row.Manager
      };
    } catch (error) {
      console.warn('Failed to parse group from CSV:', error);
      return null;
    }
  }

  /**
   * Load devices/computers from CSV
   */
  private async loadDevicesStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'Computers.csv'),
      path.join(dataPath, 'Devices.csv'),
      path.join(dataPath, 'ADComputers.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const device = this.parseDeviceFromCsv(row);
              if (device) {
                this.devicesByName.set(device.Name, device);
              }
            });
          }
        });

        console.log(`Loaded ${this.devicesByName.size} devices from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseDeviceFromCsv(row: any): DeviceDto | null {
    try {
      const name = row.Name || row.ComputerName || row.DNSHostName || '';
      if (!name) return null;

      const installedApps = row.InstalledApps ?
        row.InstalledApps.split(';').filter((a: string) => a) :
        row.InstalledSoftware ?
          row.InstalledSoftware.split(';').filter((a: string) => a) : [];

      return {
        Name: name,
        DNS: row.DNS || row.DNSHostName || row.FQDN,
        OU: row.OU || row.OrganizationalUnit,
        OS: row.OS || row.OperatingSystem || row.OSVersion,
        PrimaryUserSid: row.PrimaryUserSid || row.PrimaryUser || row.LastLoggedOnUser,
        InstalledApps: installedApps,
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'ComputerDiscovery',
        SessionId: row.SessionId || this.generateSessionId()
      };
    } catch (error) {
      console.warn('Failed to parse device from CSV:', error);
      return null;
    }
  }

  /**
   * Load applications from CSV
   */
  private async loadApplicationsStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'Applications.csv'),
      path.join(dataPath, 'Software.csv'),
      path.join(dataPath, 'InstalledSoftware.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const app = this.parseApplicationFromCsv(row);
              if (app) {
                this.appsById.set(app.Id, app);
              }
            });
          }
        });

        console.log(`Loaded ${this.appsById.size} applications from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseApplicationFromCsv(row: any): AppDto | null {
    try {
      const id = row.Id || row.AppId || row.Name || '';
      const name = row.Name || row.ApplicationName || row.DisplayName || '';

      if (!id || !name) return null;

      const executables = row.Executables ?
        row.Executables.split(';').filter((e: string) => e) : [];
      const publishers = row.Publishers ?
        row.Publishers.split(';').filter((p: string) => p) : [];

      return {
        Id: id,
        Name: name,
        Source: row.Source || row.InstallSource,
        InstallCounts: parseInt(row.InstallCounts || row.InstallCount || '0'),
        Executables: executables,
        Publishers: publishers,
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'ApplicationDiscovery',
        SessionId: row.SessionId || this.generateSessionId()
      };
    } catch (error) {
      console.warn('Failed to parse application from CSV:', error);
      return null;
    }
  }

  /**
   * Load Group Policy Objects from CSV
   */
  private async loadGposStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'GroupPolicies.csv'),
      path.join(dataPath, 'GPOs.csv'),
      path.join(dataPath, 'GroupPolicyObjects.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const gpo = this.parseGpoFromCsv(row);
              if (gpo) {
                this.gposByGuid.set(gpo.Guid, gpo);
              }
            });
          }
        });

        console.log(`Loaded ${this.gposByGuid.size} GPOs from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseGpoFromCsv(row: any): GpoDto | null {
    try {
      const guid = row.Guid || row.GUID || row.Id || '';
      const name = row.Name || row.DisplayName || '';

      if (!guid || !name) return null;

      const links = row.Links ?
        row.Links.split(';').filter((l: string) => l) : [];
      const securityFilter = row.SecurityFilter ?
        row.SecurityFilter.split(';').filter((f: string) => f) : [];

      return {
        Guid: guid,
        Name: name,
        Links: links,
        SecurityFilter: securityFilter,
        WmiFilter: row.WmiFilter || row.WMIFilter,
        Enabled: row.Enabled === 'true' || row.Enabled === 'True' || row.Enabled === '1',
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'GPODiscovery',
        SessionId: row.SessionId || this.generateSessionId()
      };
    } catch (error) {
      console.warn('Failed to parse GPO from CSV:', error);
      return null;
    }
  }

  /**
   * Load ACL entries from CSV
   */
  private async loadAclsStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'ACLs.csv'),
      path.join(dataPath, 'FilePermissions.csv'),
      path.join(dataPath, 'SharePermissions.csv'),
      path.join(dataPath, 'NTFSPermissions.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const acl = this.parseAclFromCsv(row);
              if (acl) {
                const identityAcls = this.aclByIdentitySid.get(acl.IdentitySid) || [];
                identityAcls.push(acl);
                this.aclByIdentitySid.set(acl.IdentitySid, identityAcls);
              }
            });
          }
        });

        console.log(`Loaded ACL entries from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseAclFromCsv(row: any): AclEntry | null {
    try {
      const aclPath = row.Path || row.FilePath || row.SharePath || '';
      const identitySid = row.IdentitySid || row.Identity || row.UserSid || '';

      if (!aclPath || !identitySid) return null;

      return {
        Path: aclPath,
        IdentitySid: identitySid,
        Rights: row.Rights || row.Permissions || row.AccessRights || '',
        Inherited: row.Inherited === 'true' || row.Inherited === 'True' || row.Inherited === '1',
        IsShare: row.IsShare === 'true' || row.Type === 'Share',
        IsNTFS: row.IsNTFS === 'true' || row.Type === 'NTFS',
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'ACLDiscovery',
        SessionId: row.SessionId || this.generateSessionId()
      };
    } catch (error) {
      console.warn('Failed to parse ACL from CSV:', error);
      return null;
    }
  }

  /**
   * Load mapped drives from CSV
   */
  private async loadMappedDrivesStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'MappedDrives.csv'),
      path.join(dataPath, 'NetworkDrives.csv'),
      path.join(dataPath, 'UserDrives.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const drive = this.parseMappedDriveFromCsv(row);
              if (drive) {
                const userDrives = this.drivesByUserSid.get(drive.UserSid) || [];
                userDrives.push(drive);
                this.drivesByUserSid.set(drive.UserSid, userDrives);
              }
            });
          }
        });

        console.log(`Loaded mapped drives from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseMappedDriveFromCsv(row: any): MappedDriveDto | null {
    try {
      const userSid = row.UserSid || row.UserSID || row.User || '';
      const letter = row.Letter || row.DriveLetter || '';
      const unc = row.UNC || row.UNCPath || row.NetworkPath || '';

      if (!userSid || !letter || !unc) return null;

      return {
        UserSid: userSid,
        Letter: letter,
        UNC: unc,
        Label: row.Label || row.DriveLabel,
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'DriveDiscovery',
        SessionId: row.SessionId || this.generateSessionId()
      };
    } catch (error) {
      console.warn('Failed to parse mapped drive from CSV:', error);
      return null;
    }
  }

  /**
   * Load mailboxes from CSV
   */
  private async loadMailboxesStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'Mailboxes.csv'),
      path.join(dataPath, 'ExchangeMailboxes.csv'),
      path.join(dataPath, 'UserMailboxes.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const mailbox = this.parseMailboxFromCsv(row);
              if (mailbox) {
                this.mailboxByUpn.set(mailbox.UPN, mailbox);
                if (mailbox.UserPrincipalName && mailbox.UserPrincipalName !== mailbox.UPN) {
                  this.mailboxByUpn.set(mailbox.UserPrincipalName, mailbox);
                }
              }
            });
          }
        });

        console.log(`Loaded ${this.mailboxByUpn.size} mailboxes from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseMailboxFromCsv(row: any): MailboxDto | null {
    try {
      const upn = row.UPN || row.UserPrincipalName || row.Email || '';

      if (!upn) return null;

      const permissions = row.Permissions ?
        row.Permissions.split(';').filter((p: string) => p) : [];

      return {
        UPN: upn,
        MailboxGuid: row.MailboxGuid || row.MailboxGUID || row.Guid,
        SizeMB: parseFloat(row.SizeMB || row.MailboxSize || '0'),
        Type: row.Type || row.MailboxType || 'UserMailbox',
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'MailboxDiscovery',
        SessionId: row.SessionId || this.generateSessionId(),
        Permissions: permissions,
        UserPrincipalName: row.UserPrincipalName,
        EffectiveUPN: row.UserPrincipalName || upn
      };
    } catch (error) {
      console.warn('Failed to parse mailbox from CSV:', error);
      return null;
    }
  }

  /**
   * Load Azure role assignments from CSV
   */
  private async loadAzureRolesStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'AzureRoles.csv'),
      path.join(dataPath, 'AzureRoleAssignments.csv'),
      path.join(dataPath, 'RoleAssignments.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const role = this.parseAzureRoleFromCsv(row);
              if (role) {
                const principalRoles = this.rolesByPrincipalId.get(role.PrincipalObjectId) || [];
                principalRoles.push(role);
                this.rolesByPrincipalId.set(role.PrincipalObjectId, principalRoles);
              }
            });
          }
        });

        console.log(`Loaded Azure roles from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseAzureRoleFromCsv(row: any): AzureRoleAssignment | null {
    try {
      const principalObjectId = row.PrincipalObjectId || row.PrincipalId || row.ObjectId || '';
      const roleName = row.RoleName || row.Role || '';

      if (!principalObjectId || !roleName) return null;

      return {
        PrincipalObjectId: principalObjectId,
        RoleName: roleName,
        Scope: row.Scope || row.RoleScope || '/',
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'AzureRoleDiscovery',
        SessionId: row.SessionId || this.generateSessionId()
      };
    } catch (error) {
      console.warn('Failed to parse Azure role from CSV:', error);
      return null;
    }
  }

  /**
   * Load SQL databases from CSV
   */
  private async loadSqlDatabasesStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'SqlDatabases.csv'),
      path.join(dataPath, 'Databases.csv'),
      path.join(dataPath, 'SQLServers.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const db = this.parseSqlDbFromCsv(row);
              if (db) {
                const key = `${db.Server}_${db.Database}`;
                this.sqlDbsByKey.set(key, db);
              }
            });
          }
        });

        console.log(`Loaded ${this.sqlDbsByKey.size} SQL databases from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseSqlDbFromCsv(row: any): SqlDbDto | null {
    try {
      const server = row.Server || row.ServerName || '';
      const database = row.Database || row.DatabaseName || row.DB || '';

      if (!server || !database) return null;

      const owners = row.Owners ?
        row.Owners.split(';').filter((o: string) => o) : [];
      const appHints = row.AppHints ?
        row.AppHints.split(';').filter((a: string) => a) : [];

      return {
        Server: server,
        Instance: row.Instance || row.InstanceName,
        Database: database,
        Owners: owners,
        AppHints: appHints,
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'SqlDiscovery',
        SessionId: row.SessionId || this.generateSessionId(),
        Name: database
      };
    } catch (error) {
      console.warn('Failed to parse SQL database from CSV:', error);
      return null;
    }
  }

  /**
   * Load threat detection data from CSV
   */
  private async loadThreatDetectionStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'ThreatDetection.csv'),
      path.join(dataPath, 'Threats.csv'),
      path.join(dataPath, 'SecurityThreats.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const threat = this.parseThreatFromCsv(row);
              if (threat) {
                this.threatsByThreatId.set(threat.ThreatId, threat);
              }
            });
          }
        });

        console.log(`Loaded ${this.threatsByThreatId.size} threats from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseThreatFromCsv(row: any): ThreatDetectionDTO | null {
    try {
      const threatId = row.ThreatId || row.Id || this.generateSessionId();
      const threatName = row.ThreatName || row.Name || '';

      if (!threatName) return null;

      const affectedAssets = row.AffectedAssets ?
        row.AffectedAssets.split(';').filter((a: string) => a) : [];
      const iocs = row.IndicatorsOfCompromise ?
        row.IndicatorsOfCompromise.split(';').filter((i: string) => i) : [];

      let threatDetails = {};
      if (row.ThreatDetails) {
        try {
          threatDetails = JSON.parse(row.ThreatDetails);
        } catch {
          threatDetails = { raw: row.ThreatDetails };
        }
      }

      return {
        ThreatId: threatId,
        ThreatName: threatName,
        Category: row.Category || 'Unknown',
        Severity: row.Severity as 'Critical' | 'High' | 'Medium' | 'Low' || 'Medium',
        Confidence: parseFloat(row.Confidence || '0.5'),
        MitreAttackId: row.MitreAttackId,
        MitreTactic: row.MitreTactic,
        MitreTechnique: row.MitreTechnique,
        AffectedAssets: affectedAssets,
        IndicatorsOfCompromise: iocs,
        ThreatDetails: threatDetails,
        DetectionTimestamp: new Date(row.DetectionTimestamp || Date.now()),
        DetectionSource: row.DetectionSource || 'Unknown',
        SessionId: row.SessionId || this.generateSessionId(),
        DiscoveryModule: row.DiscoveryModule || 'ThreatDetectionEngine',
        ThreatScore: parseFloat(row.ThreatScore || '50')
      };
    } catch (error) {
      console.warn('Failed to parse threat from CSV:', error);
      return null;
    }
  }

  /**
   * Load data governance information from CSV
   */
  private async loadDataGovernanceStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'DataGovernance.csv'),
      path.join(dataPath, 'GovernanceAssets.csv'),
      path.join(dataPath, 'Compliance.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const governance = this.parseGovernanceFromCsv(row);
              if (governance) {
                this.governanceByAssetId.set(governance.AssetId, governance);
              }
            });
          }
        });

        console.log(`Loaded ${this.governanceByAssetId.size} governance records from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseGovernanceFromCsv(row: any): DataGovernanceDTO | null {
    try {
      const assetId = row.AssetId || row.Id || this.generateSessionId();
      const assetName = row.AssetName || row.Name || '';

      if (!assetName) return null;

      const retentionPolicies = row.RetentionPolicies ?
        row.RetentionPolicies.split(';').filter((r: string) => r) : [];
      const complianceFrameworks = row.ComplianceFrameworks ?
        row.ComplianceFrameworks.split(';').filter((c: string) => c) : [];
      const violations = row.ViolationsFound ?
        row.ViolationsFound.split(';').filter((v: string) => v) : [];

      let metadata: Record<string, string> = {};
      if (row.Metadata) {
        try {
          metadata = JSON.parse(row.Metadata);
        } catch {
          row.Metadata.split(';').forEach((item: string) => {
            const [key, value] = item.split('=');
            if (key && value) metadata[key] = value;
          });
        }
      }

      return {
        AssetId: assetId,
        AssetName: assetName,
        AssetType: row.AssetType || 'Unknown',
        Classification: row.Classification || 'Unclassified',
        Owner: row.Owner || 'Unknown',
        Custodian: row.Custodian || 'Unknown',
        RetentionPolicies: retentionPolicies,
        ComplianceFrameworks: complianceFrameworks,
        Metadata: metadata,
        HasPersonalData: row.HasPersonalData === 'true' || row.HasPersonalData === '1',
        HasSensitiveData: row.HasSensitiveData === 'true' || row.HasSensitiveData === '1',
        LastAuditDate: new Date(row.LastAuditDate || Date.now()),
        ComplianceStatus: row.ComplianceStatus || 'Unknown',
        ViolationsFound: violations,
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'DataGovernanceMetadataManagement',
        SessionId: row.SessionId || this.generateSessionId(),
        ComplianceScore: parseFloat(row.ComplianceScore || '0'),
        RiskLevel: row.RiskLevel,
        GovernanceRisk: parseFloat(row.GovernanceRisk || '0')
      };
    } catch (error) {
      console.warn('Failed to parse governance from CSV:', error);
      return null;
    }
  }

  /**
   * Load data lineage information from CSV
   */
  private async loadDataLineageStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'DataLineage.csv'),
      path.join(dataPath, 'DataFlows.csv'),
      path.join(dataPath, 'LineageMapping.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const lineage = this.parseLineageFromCsv(row);
              if (lineage) {
                this.lineageByLineageId.set(lineage.LineageId, lineage);
              }
            });
          }
        });

        console.log(`Loaded ${this.lineageByLineageId.size} lineage records from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseLineageFromCsv(row: any): DataLineageDTO | null {
    try {
      const lineageId = row.LineageId || row.Id || this.generateSessionId();
      const sourceAssetId = row.SourceAssetId || row.Source || '';
      const targetAssetId = row.TargetAssetId || row.Target || '';

      if (!sourceAssetId || !targetAssetId) return null;

      const transformationSteps = row.TransformationSteps ?
        row.TransformationSteps.split(';').filter((t: string) => t) : [];
      const dependencies = row.Dependencies ?
        row.Dependencies.split(';').filter((d: string) => d) : [];
      const issues = row.Issues ?
        row.Issues.split(';').filter((i: string) => i) : [];

      let flowMetadata: Record<string, string> = {};
      if (row.FlowMetadata) {
        try {
          flowMetadata = JSON.parse(row.FlowMetadata);
        } catch {
          row.FlowMetadata.split(';').forEach((item: string) => {
            const [key, value] = item.split('=');
            if (key && value) flowMetadata[key] = value;
          });
        }
      }

      return {
        LineageId: lineageId,
        SourceAssetId: sourceAssetId,
        SourceAssetName: row.SourceAssetName || sourceAssetId,
        SourceAssetType: row.SourceAssetType || 'Unknown',
        TargetAssetId: targetAssetId,
        TargetAssetName: row.TargetAssetName || targetAssetId,
        TargetAssetType: row.TargetAssetType || 'Unknown',
        TransformationType: row.TransformationType || 'Unknown',
        TransformationSteps: transformationSteps,
        DataFlow: row.DataFlow || 'Unknown',
        FlowMetadata: flowMetadata,
        Dependencies: dependencies,
        IsOrphaned: row.IsOrphaned === 'true' || row.IsOrphaned === '1',
        HasBrokenLinks: row.HasBrokenLinks === 'true' || row.HasBrokenLinks === '1',
        LastValidated: new Date(row.LastValidated || Date.now()),
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'DataLineageDependencyEngine',
        SessionId: row.SessionId || this.generateSessionId(),
        Issues: issues,
        LineageRisk: parseFloat(row.LineageRisk || '0')
      };
    } catch (error) {
      console.warn('Failed to parse lineage from CSV:', error);
      return null;
    }
  }

  /**
   * Load external identities from CSV
   */
  private async loadExternalIdentitiesStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'ExternalIdentities.csv'),
      path.join(dataPath, 'FederatedIdentities.csv'),
      path.join(dataPath, 'B2BUsers.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const identity = this.parseExternalIdentityFromCsv(row);
              if (identity) {
                this.externalIdentitiesById.set(identity.ExternalIdentityId, identity);
                if (identity.ExternalUserEmail) {
                  this.externalIdentitiesByUpn.set(identity.ExternalUserEmail, identity);
                }
              }
            });
          }
        });

        console.log(`Loaded ${this.externalIdentitiesById.size} external identities from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseExternalIdentityFromCsv(row: any): ExternalIdentityDTO | null {
    try {
      const externalId = row.ExternalIdentityId || row.Id || this.generateSessionId();
      const externalProvider = row.ExternalProvider || row.Provider || 'Unknown';
      const externalUserId = row.ExternalUserId || row.UserId || '';

      if (!externalUserId) return null;

      const assignedRoles = row.AssignedRoles ?
        row.AssignedRoles.split(';').filter((r: string) => r) : [];
      const permissions = row.Permissions ?
        row.Permissions.split(';').filter((p: string) => p) : [];
      const syncErrors = row.SyncErrors ?
        row.SyncErrors.split(';').filter((e: string) => e) : [];

      return {
        ExternalIdentityId: externalId,
        ExternalProvider: externalProvider,
        ExternalUserId: externalUserId,
        ExternalUserEmail: row.ExternalUserEmail || row.Email,
        ExternalDisplayName: row.ExternalDisplayName || row.DisplayName,
        InternalUserSid: row.InternalUserSid || row.MappedUserSid,
        MappingStatus: row.MappingStatus as 'Mapped' | 'Unmapped' | 'Conflict' || 'Unmapped',
        MappingConfidence: parseFloat(row.MappingConfidence || '0'),
        AssignedRoles: assignedRoles,
        Permissions: permissions,
        LastSynchronized: new Date(row.LastSynchronized || Date.now()),
        SyncErrors: syncErrors,
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'ExternalIdentityMapping',
        SessionId: row.SessionId || this.generateSessionId(),
        IdentityRisk: parseFloat(row.IdentityRisk || '0')
      };
    } catch (error) {
      console.warn('Failed to parse external identity from CSV:', error);
      return null;
    }
  }

  // ========================================
  // INFERENCE RULES (formerly from InferenceRulesMixin)
  // ========================================

  /**
   * Rule 1: ACL Group-User Inference
   * Correlates file system ACLs with group memberships to determine user permissions
   */
  private applyAclGroupUserInference(): void {
    console.log('Applying ACL→Group→User inference rules');
    let aclExpansionCount = 0;

    // Iterate through all ACL entries
    Array.from(this.aclByIdentitySid.entries()).forEach(([identitySid, entries]) => {
      // Check if this identity is a group
      const group = this.groupsBySid.get(identitySid);
      if (group) {
        // Expand ACL entries to all group members
        const members = this.membersByGroupSid.get(identitySid) || [];
        members.forEach(memberSid => {
          // Add ACL entries for each member
          const memberAcls = this.aclByIdentitySid.get(memberSid) || [];
          entries.forEach(entry => {
            // Create derived ACL entry for the member
            const derivedEntry: AclEntry = {
              ...entry,
              IdentitySid: memberSid // Update to member's SID
            };
            memberAcls.push(derivedEntry);
          });
          this.aclByIdentitySid.set(memberSid, memberAcls);
          aclExpansionCount++;
        });

        // Handle nested groups recursively
        if (group.NestedGroups) {
          group.NestedGroups.forEach(nestedGroupSid => {
            const nestedMembers = this.membersByGroupSid.get(nestedGroupSid) || [];
            nestedMembers.forEach(memberSid => {
              const memberAcls = this.aclByIdentitySid.get(memberSid) || [];
              entries.forEach(entry => {
                const derivedEntry: AclEntry = {
                  ...entry,
                  IdentitySid: memberSid,
                  Inherited: true // Mark as inherited through nested group
                };
                memberAcls.push(derivedEntry);
              });
              this.aclByIdentitySid.set(memberSid, memberAcls);
              aclExpansionCount++;
            });
          });
        }
      }
    });

    this.appliedInferenceRules.push(`ACL→Group→User expansion: ${aclExpansionCount} derived permissions`);
    console.log(`Expanded ${aclExpansionCount} ACL entries through group memberships`);
  }

  /**
   * Rule 2: Primary Device Inference
   * Determines primary device for each user based on login frequency and recency
   */
  private applyPrimaryDeviceInference(): void {
    console.log('Applying primary device inference rules');
    let primaryDeviceAssignments = 0;

    // Infer primary devices based on device ownership
    this.devicesByName.forEach(device => {
      if (device.PrimaryUserSid) {
        // Update user's primary device list
        const devices = this.devicesByPrimaryUserSid.get(device.PrimaryUserSid) || [];
        if (!devices.includes(device)) {
          devices.push(device);
          this.devicesByPrimaryUserSid.set(device.PrimaryUserSid, devices);
          primaryDeviceAssignments++;
        }

        // Create graph edge for primary user relationship
        const userNodeId = `User_${device.PrimaryUserSid}`;
        const deviceNodeId = `Device_${device.Name}`;

        this.edges.push({
          SourceId: userNodeId,
          TargetId: deviceNodeId,
          Type: EdgeType.PrimaryUser
        });
      }
    });

    this.appliedInferenceRules.push(`Primary device inference: ${primaryDeviceAssignments} assignments`);
    console.log(`Assigned ${primaryDeviceAssignments} primary device relationships`);
  }

  /**
   * Rule 3: GPO Security Filter Inference
   * Determines which GPOs apply to users based on security filters
   */
  private applyGpoSecurityFilterInference(): void {
    console.log('Applying GPO security filter inference rules');
    let gpoFilterCount = 0;

    this.gposByGuid.forEach(gpo => {
      // Process security filters
      gpo.SecurityFilter.forEach(filterSid => {
        // Check if filter applies to a group
        const group = this.groupsBySid.get(filterSid);
        if (group) {
          // Expand to all group members
          const members = this.membersByGroupSid.get(filterSid) || [];
          members.forEach(memberSid => {
            const userGpos = this.gposBySidFilter.get(memberSid) || [];
            if (!userGpos.includes(gpo)) {
              userGpos.push(gpo);
              this.gposBySidFilter.set(memberSid, userGpos);
              gpoFilterCount++;
            }
          });
        } else {
          // Direct user filter
          const userGpos = this.gposBySidFilter.get(filterSid) || [];
          if (!userGpos.includes(gpo)) {
            userGpos.push(gpo);
            this.gposBySidFilter.set(filterSid, userGpos);
            gpoFilterCount++;
          }
        }
      });

      // Process OU links
      gpo.Links.forEach(ou => {
        const ouGpos = this.gposByOu.get(ou) || [];
        if (!ouGpos.includes(gpo)) {
          ouGpos.push(gpo);
          this.gposByOu.set(ou, ouGpos);
        }
      });
    });

    this.appliedInferenceRules.push(`GPO security filter inference: ${gpoFilterCount} user-GPO links`);
    console.log(`Created ${gpoFilterCount} user-GPO relationships through security filters`);
  }

  /**
   * Rule 4: Application Usage Inference
   * Links users to applications based on device installations and usage patterns
   */
  private applyApplicationUsageInference(): void {
    console.log('Applying application usage inference rules');
    let appUsageLinks = 0;

    // Build app-device relationships from device installed apps
    this.devicesByName.forEach(device => {
      device.InstalledApps.forEach(appName => {
        // Try exact match first
        let app = this.appsById.get(appName);

        // If no exact match, try fuzzy matching
        if (!app) {
          app = this.fuzzyMatchApplication(appName, Array.from(this.appsById.keys()));
        }

        if (app) {
          // Create device-app edge
          const deviceNodeId = `Device_${device.Name}`;
          const appNodeId = `App_${app.Id}`;

          this.edges.push({
            SourceId: deviceNodeId,
            TargetId: appNodeId,
            Type: EdgeType.HasApp
          });

          // If device has a primary user, link user to app
          if (device.PrimaryUserSid) {
            const userNodeId = `User_${device.PrimaryUserSid}`;
            this.edges.push({
              SourceId: userNodeId,
              TargetId: appNodeId,
              Type: EdgeType.HasApp,
              Properties: { via: device.Name }
            });
            appUsageLinks++;
          }
        }
      });
    });

    this.appliedInferenceRules.push(`Application usage inference: ${appUsageLinks} user-app links`);
    console.log(`Created ${appUsageLinks} user-application relationships`);
  }

  /**
   * Rule 5: Azure Role Inference
   * Maps Azure roles to on-premises identities
   */
  private applyAzureRoleInference(): void {
    console.log('Applying Azure role inference rules');
    let linkedRolesCount = 0;
    let azureUserMappings = 0;

    // Link Azure roles to users via Azure Object ID
    this.usersBySid.forEach(user => {
      if (user.AzureObjectId) {
        const roles = this.rolesByPrincipalId.get(user.AzureObjectId);
        if (roles && roles.length > 0) {
          linkedRolesCount += roles.length;
          azureUserMappings++;

          // Create edges for role assignments
          roles.forEach(role => {
            const userNodeId = `User_${user.Sid}`;
            const roleNodeId = `Role_${role.RoleName}_${role.Scope}`;

            // Create role node if it doesn't exist
            if (!this.nodes.has(roleNodeId)) {
              this.nodes.set(roleNodeId, {
                Id: roleNodeId,
                Type: NodeType.Role,
                Properties: { name: role.RoleName, scope: role.Scope }
              });
            }

            this.edges.push({
              SourceId: userNodeId,
              TargetId: roleNodeId,
              Type: EdgeType.AssignedRole
            });
          });
        }
      }
    });

    this.appliedInferenceRules.push(`Azure role inference: ${linkedRolesCount} roles linked to ${azureUserMappings} users`);
    console.log(`Linked ${linkedRolesCount} Azure roles to ${azureUserMappings} users`);
  }

  /**
   * Rule 6: SQL Database Ownership Inference
   * Determines database ownership and access patterns
   */
  private applySqlOwnershipInference(): void {
    console.log('Applying SQL database ownership inference rules');
    let ownershipLinks = 0;

    this.sqlDbsByKey.forEach(sqlDb => {
      sqlDb.Owners.forEach((ownerSid: string) => {
        // Check if owner is a user
        const user = this.usersBySid.get(ownerSid);
        if (user) {
          const dbNodeId = `Db_${sqlDb.Server}_${sqlDb.Database}`;
          const userNodeId = `User_${user.Sid}`;

          // Create database node if it doesn't exist
          if (!this.nodes.has(dbNodeId)) {
            this.nodes.set(dbNodeId, {
              Id: dbNodeId,
              Type: NodeType.Db,
              Properties: {
                server: sqlDb.Server,
                database: sqlDb.Database,
                instance: sqlDb.Instance
              }
            });
          }

          this.edges.push({
            SourceId: userNodeId,
            TargetId: dbNodeId,
            Type: EdgeType.OwnsDb
          });
          ownershipLinks++;
        }

        // Check if owner is a group
        const group = this.groupsBySid.get(ownerSid);
        if (group) {
          // Expand ownership to group members
          const members = this.membersByGroupSid.get(ownerSid) || [];
          members.forEach(memberSid => {
            const dbNodeId = `Db_${sqlDb.Server}_${sqlDb.Database}`;
            const userNodeId = `User_${memberSid}`;

            this.edges.push({
              SourceId: userNodeId,
              TargetId: dbNodeId,
              Type: EdgeType.OwnsDb,
              Properties: { viaGroup: group.Name }
            });
            ownershipLinks++;
          });
        }
      });
    });

    this.appliedInferenceRules.push(`SQL ownership inference: ${ownershipLinks} ownership relationships`);
    console.log(`Created ${ownershipLinks} database ownership relationships`);
  }

  /**
   * Rule 7: Threat Asset Correlation Inference
   * Correlates detected threats with affected assets
   */
  private applyThreatAssetCorrelationInference(): void {
    console.log('Applying threat-asset correlation inference rules');
    let threatCorrelations = 0;

    this.threatsByThreatId.forEach(threat => {
      threat.AffectedAssets.forEach(assetId => {
        // Add to threat-by-asset index
        const assetThreats = this.threatsByAsset.get(assetId) || [];
        if (!assetThreats.includes(threat)) {
          assetThreats.push(threat);
          this.threatsByAsset.set(assetId, assetThreats);
        }

        // Check if asset is a user
        const user = this.usersBySid.get(assetId) || this.usersByUpn.get(assetId);
        if (user) {
          const userNodeId = `User_${user.Sid}`;
          const threatNodeId = `Threat_${threat.ThreatId}`;

          // Create threat node if it doesn't exist
          if (!this.nodes.has(threatNodeId)) {
            this.nodes.set(threatNodeId, {
              Id: threatNodeId,
              Type: NodeType.Threat,
              Properties: {
                name: threat.ThreatName,
                severity: threat.Severity,
                category: threat.Category
              }
            });
          }

          this.edges.push({
            SourceId: threatNodeId,
            TargetId: userNodeId,
            Type: EdgeType.Threatens
          });
          threatCorrelations++;
        }

        // Check if asset is a device
        const device = this.devicesByName.get(assetId);
        if (device) {
          const deviceNodeId = `Device_${device.Name}`;
          const threatNodeId = `Threat_${threat.ThreatId}`;

          this.edges.push({
            SourceId: threatNodeId,
            TargetId: deviceNodeId,
            Type: EdgeType.Threatens
          });
          threatCorrelations++;
        }
      });

      // Index by category and severity
      const categoryThreats = this.threatsByCategory.get(threat.Category) || [];
      if (!categoryThreats.includes(threat)) {
        categoryThreats.push(threat);
        this.threatsByCategory.set(threat.Category, categoryThreats);
      }

      const severityThreats = this.threatsBySeverity.get(threat.Severity) || [];
      if (!severityThreats.includes(threat)) {
        severityThreats.push(threat);
        this.threatsBySeverity.set(threat.Severity, severityThreats);
      }
    });

    this.appliedInferenceRules.push(`Threat-asset correlation: ${threatCorrelations} correlations`);
    console.log(`Created ${threatCorrelations} threat-asset correlations`);
  }

  /**
   * Rule 8: Governance Risk Inference
   * Correlates governance issues with asset ownership
   */
  private applyGovernanceRiskInference(): void {
    console.log('Applying governance risk inference rules');
    let governanceLinks = 0;

    this.governanceByAssetId.forEach(governance => {
      // Link governance issues to asset owners
      if (governance.Owner) {
        const owner = this.usersBySid.get(governance.Owner) ||
                      this.usersByUpn.get(governance.Owner);
        if (owner) {
          const ownerGovIssues = this.governanceByOwner.get(owner.Sid) || [];
          if (!ownerGovIssues.includes(governance)) {
            ownerGovIssues.push(governance);
            this.governanceByOwner.set(owner.Sid, ownerGovIssues);
            governanceLinks++;
          }

          // Create graph edge
          const userNodeId = `User_${owner.Sid}`;
          const assetNodeId = `DataAsset_${governance.AssetId}`;

          if (!this.nodes.has(assetNodeId)) {
            this.nodes.set(assetNodeId, {
              Id: assetNodeId,
              Type: NodeType.DataAsset,
              Properties: {
                name: governance.AssetName,
                type: governance.AssetType,
                classification: governance.Classification
              }
            });
          }

          this.edges.push({
            SourceId: userNodeId,
            TargetId: assetNodeId,
            Type: EdgeType.HasGovernanceIssue
          });
        }
      }

      // Index by compliance status
      const complianceGovIssues = this.governanceByCompliance.get(governance.ComplianceStatus) || [];
      if (!complianceGovIssues.includes(governance)) {
        complianceGovIssues.push(governance);
        this.governanceByCompliance.set(governance.ComplianceStatus, complianceGovIssues);
      }
    });

    this.appliedInferenceRules.push(`Governance risk inference: ${governanceLinks} owner-asset links`);
    console.log(`Created ${governanceLinks} governance-owner relationships`);
  }

  /**
   * Rule 9: Data Lineage Integrity Inference
   * Builds data lineage graph and identifies integrity issues
   */
  private applyLineageIntegrityInference(): void {
    console.log('Applying data lineage integrity inference rules');
    let lineageLinks = 0;
    let orphanedFlows = 0;
    let brokenLinks = 0;

    this.lineageByLineageId.forEach(lineage => {
      // Create lineage flow nodes
      const sourceNodeId = `DataAsset_${lineage.SourceAssetId}`;
      const targetNodeId = `DataAsset_${lineage.TargetAssetId}`;
      const flowNodeId = `LineageFlow_${lineage.LineageId}`;

      // Create nodes if they don't exist
      if (!this.nodes.has(sourceNodeId)) {
        this.nodes.set(sourceNodeId, {
          Id: sourceNodeId,
          Type: NodeType.DataAsset,
          Properties: {
            name: lineage.SourceAssetName,
            type: lineage.SourceAssetType
          }
        });
      }

      if (!this.nodes.has(targetNodeId)) {
        this.nodes.set(targetNodeId, {
          Id: targetNodeId,
          Type: NodeType.DataAsset,
          Properties: {
            name: lineage.TargetAssetName,
            type: lineage.TargetAssetType
          }
        });
      }

      if (!this.nodes.has(flowNodeId)) {
        this.nodes.set(flowNodeId, {
          Id: flowNodeId,
          Type: NodeType.LineageFlow,
          Properties: {
            transformationType: lineage.TransformationType,
            dataFlow: lineage.DataFlow
          }
        });
      }

      // Create edges
      this.edges.push({
        SourceId: sourceNodeId,
        TargetId: flowNodeId,
        Type: EdgeType.DataFlowTo
      });

      this.edges.push({
        SourceId: flowNodeId,
        TargetId: targetNodeId,
        Type: EdgeType.DataFlowTo
      });

      lineageLinks += 2;

      // Index by source and target
      const sourceFlows = this.lineageBySourceAsset.get(lineage.SourceAssetId) || [];
      if (!sourceFlows.includes(lineage)) {
        sourceFlows.push(lineage);
        this.lineageBySourceAsset.set(lineage.SourceAssetId, sourceFlows);
      }

      const targetFlows = this.lineageByTargetAsset.get(lineage.TargetAssetId) || [];
      if (!targetFlows.includes(lineage)) {
        targetFlows.push(lineage);
        this.lineageByTargetAsset.set(lineage.TargetAssetId, targetFlows);
      }

      // Track issues
      if (lineage.IsOrphaned) orphanedFlows++;
      if (lineage.HasBrokenLinks) brokenLinks++;
    });

    this.appliedInferenceRules.push(`Lineage integrity: ${lineageLinks} flows, ${orphanedFlows} orphaned, ${brokenLinks} broken`);
    console.log(`Created ${lineageLinks} lineage relationships, found ${orphanedFlows} orphaned flows and ${brokenLinks} broken links`);
  }

  /**
   * Rule 10: External Identity Mapping Inference
   * Correlates external identities with internal users
   */
  private applyExternalIdentityMappingInference(): void {
    console.log('Applying external identity mapping inference rules');
    let mappedIdentities = 0;
    let conflictedMappings = 0;

    this.externalIdentitiesById.forEach(externalId => {
      // Try to map to internal user
      let mappedUser: UserDto | undefined;

      // Try exact UPN match
      if (externalId.ExternalUserEmail) {
        mappedUser = this.usersByUpn.get(externalId.ExternalUserEmail);
      }

      // Try fuzzy matching if no exact match
      if (!mappedUser && externalId.ExternalDisplayName) {
        mappedUser = this.fuzzyMatchUser(externalId.ExternalDisplayName, 'DisplayName');
      }

      if (mappedUser) {
        // Update mapping
        externalId.InternalUserSid = mappedUser.Sid;
        externalId.MappingStatus = 'Mapped';
        mappedIdentities++;

        // Create graph edge
        const userNodeId = `User_${mappedUser.Sid}`;
        const extIdNodeId = `ExternalIdentity_${externalId.ExternalIdentityId}`;

        if (!this.nodes.has(extIdNodeId)) {
          this.nodes.set(extIdNodeId, {
            Id: extIdNodeId,
            Type: NodeType.ExternalIdentity,
            Properties: {
              provider: externalId.ExternalProvider,
              userId: externalId.ExternalUserId,
              email: externalId.ExternalUserEmail
            }
          });
        }

        this.edges.push({
          SourceId: userNodeId,
          TargetId: extIdNodeId,
          Type: EdgeType.ExternalMapping
        });
      } else {
        // Mark as unmapped
        externalId.MappingStatus = 'Unmapped';
      }

      // Index by provider
      const providerIds = this.externalIdentitiesByProvider.get(externalId.ExternalProvider) || [];
      if (!providerIds.includes(externalId)) {
        providerIds.push(externalId);
        this.externalIdentitiesByProvider.set(externalId.ExternalProvider, providerIds);
      }

      // Index by mapping status
      const statusIds = this.externalIdentitiesByMappingStatus.get(externalId.MappingStatus) || [];
      if (!statusIds.includes(externalId)) {
        statusIds.push(externalId);
        this.externalIdentitiesByMappingStatus.set(externalId.MappingStatus, statusIds);
      }

      if (externalId.MappingStatus === 'Unmapped') {
        conflictedMappings++;
      }
    });

    this.appliedInferenceRules.push(`External identity mapping: ${mappedIdentities} mapped, ${conflictedMappings} conflicts`);
    console.log(`Mapped ${mappedIdentities} external identities, found ${conflictedMappings} conflicts`);
  }

  /**
   * Helper: Fuzzy match application by name
   */
  private fuzzyMatchApplication(appNameCandidate: string, installedApps: string[]): AppDto | undefined {
    let bestMatch: AppDto | undefined;
    let bestSimilarity = 0;

    installedApps.forEach(appId => {
      const app = this.appsById.get(appId);
      if (app) {
        const similarity = this.calculateLevenshteinSimilarity(appNameCandidate, app.Name);
        if (similarity >= 0.8 && similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = app;
        }
      }
    });

    if (bestMatch) {
      this.appliedInferenceRules.push(`Fuzzy app match: '${appNameCandidate}' -> '${bestMatch.Name}' (similarity: ${(bestSimilarity * 100).toFixed(1)}%)`);
    }

    return bestMatch;
  }

  /**
   * Helper: Fuzzy match user by display name, UPN, or email
   */
  private fuzzyMatchUser(searchTerm: string, searchType: 'DisplayName' | 'UPN' | 'Mail' = 'DisplayName'): UserDto | undefined {
    let bestMatch: UserDto | undefined;
    let bestSimilarity = 0;

    this.usersBySid.forEach(user => {
      const targetValue = searchType === 'UPN' ? user.UPN :
                         searchType === 'Mail' ? user.Mail :
                         user.DisplayName;

      if (targetValue) {
        const similarity = this.calculateLevenshteinSimilarity(searchTerm, targetValue);
        if (similarity >= 0.8 && similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = user;
        }
      }
    });

    if (bestMatch) {
      this.appliedInferenceRules.push(`Fuzzy user match: '${searchTerm}' -> '${bestMatch.DisplayName}' (similarity: ${(bestSimilarity * 100).toFixed(1)}%)`);
    }

    return bestMatch;
  }

  /**
   * Calculate Levenshtein similarity ratio (0.0 to 1.0)
   */
  private calculateLevenshteinSimilarity(s1: string, s2: string): number {
    if (!s1 || !s2) {
      return (!s1 && !s2) ? 1.0 : 0.0;
    }

    const len1 = s1.length;
    const len2 = s2.length;
    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Calculate distances
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1.0 : 1.0 - (distance / maxLen);
  }

  // ========================================
  // END OF INFERENCE RULES
  // ========================================

  // Index building
  private async buildIndicesAsync(): Promise<void> {
    // Build user-group relationships
    this.groupsBySid.forEach((group, groupSid) => {
      group.Members.forEach(memberSid => {
        // Add to membersByGroupSid
        const members = this.membersByGroupSid.get(groupSid) || [];
        members.push(memberSid);
        this.membersByGroupSid.set(groupSid, members);

        // Add to groupsByUserSid
        const groups = this.groupsByUserSid.get(memberSid) || [];
        groups.push(groupSid);
        this.groupsByUserSid.set(memberSid, groups);
      });
    });

    // Build device indices
    this.devicesByName.forEach(device => {
      if (device.PrimaryUserSid) {
        const devices = this.devicesByPrimaryUserSid.get(device.PrimaryUserSid) || [];
        devices.push(device);
        this.devicesByPrimaryUserSid.set(device.PrimaryUserSid, devices);
      }
    });

    console.log('Indices built successfully');
  }

  // Inference rules
  private async applyInferenceRulesAsync(): Promise<void> {
    console.log('Applying inference rules...');

    // Apply all inference rules
    this.applyAclGroupUserInference();
    this.applyPrimaryDeviceInference();
    this.applyGpoSecurityFilterInference();
    this.applyApplicationUsageInference();
    this.applyAzureRoleInference();
    this.applySqlOwnershipInference();

    // T-029: New cross-module correlation inference rules
    this.applyThreatAssetCorrelationInference();
    this.applyGovernanceRiskInference();
    this.applyLineageIntegrityInference();
    this.applyExternalIdentityMappingInference();

    // T-010: Enhanced fuzzy matching
    this.appliedInferenceRules.push('Fuzzy matching enabled for identity resolution');
    this.appliedInferenceRules.push('File share loader implemented with ACL correlation');

    console.log(`Applied ${this.appliedInferenceRules.length} inference rules`);
  }

  // Inference rule methods are implemented via mixin (see below)

  // Helper methods

  private getGroupsForUser(userSid: string): GroupDto[] {
    const groupSids = this.groupsByUserSid.get(userSid) || [];
    return groupSids.map(sid => this.groupsBySid.get(sid)).filter(g => g) as GroupDto[];
  }

  private getDevicesForUser(userSid: string): DeviceDto[] {
    return this.devicesByPrimaryUserSid.get(userSid) || [];
  }

  private getAppsForUser(userSid: string, devices: DeviceDto[]): AppDto[] {
    const apps = new Set<AppDto>();
    devices.forEach(device => {
      device.InstalledApps.forEach(appId => {
        const app = this.appsById.get(appId);
        if (app) {
          apps.add(app);
        }
      });
    });
    return Array.from(apps);
  }

  private getSharesForUser(userSid: string): AclEntry[] {
    return this.aclByIdentitySid.get(userSid) || [];
  }

  private getGpoLinksForUser(user: UserDto): GpoDto[] {
    const gpos: GpoDto[] = [];
    if (user.OU) {
      const ouGpos = this.gposByOu.get(user.OU) || [];
      gpos.push(...ouGpos);
    }
    return gpos;
  }

  private getGpoFiltersForUser(userSid: string): GpoDto[] {
    return this.gposBySidFilter.get(userSid) || [];
  }

  private getSqlDatabasesForUser(userSid: string): SqlDbDto[] {
    const databases: SqlDbDto[] = [];
    this.sqlDbsByKey.forEach(db => {
      if (db.Owners.includes(userSid)) {
        databases.push(db);
      }
    });
    return databases;
  }

  private calculateRisksForUser(user: UserDto): LogicEngineRisk[] {
    const risks: LogicEngineRisk[] = [];

    // Check for missing mappings
    const missingMappings: string[] = [];
    if (!user.AzureObjectId) {
      missingMappings.push('No Azure AD mapping');
    }
    if (!this.mailboxByUpn.has(user.UPN)) {
      missingMappings.push('No mailbox found');
    }

    if (missingMappings.length > 0) {
      risks.push({
        EntityId: user.Sid,
        EntityType: 'User',
        MissingMappings: missingMappings,
        OrphanedAcls: [],
        UnresolvableSidRefs: [],
        Severity: missingMappings.length > 1 ? 'High' : 'Medium',
        Type: 'User',
        Description: `Risk assessment for User ${user.DisplayName || user.Sam}`,
        Recommendation: missingMappings.length > 1
          ? 'Requires immediate attention before migration'
          : 'Should be reviewed and resolved during migration planning'
      });
    }

    return risks;
  }

  private generateMigrationHintsForUser(user: UserDto): MigrationHint[] {
    const hints: MigrationHint[] = [];

    // Generate migration hints based on user properties
    if (user.Manager) {
      hints.push({
        EntityId: user.Sid,
        EntityType: 'User',
        HintType: 'ManagerMapping',
        Description: 'User has a manager that needs to be mapped in target',
        RequiredActions: {
          'Map Manager': `Ensure manager ${user.Manager} is migrated first`,
          'Update Hierarchy': 'Update reporting structure after migration'
        }
      });
    }

    return hints;
  }

  private getThreatsForAsset(assetId: string): ThreatDetectionDTO[] {
    return this.threatsByAsset.get(assetId) || [];
  }

  private getGovernanceForAsset(assetId: string): DataGovernanceDTO | undefined {
    return this.governanceByAssetId.get(assetId);
  }

  private getLineageForAsset(assetId: string): DataLineageDTO[] {
    const sourceFlows = this.lineageBySourceAsset.get(assetId) || [];
    const targetFlows = this.lineageByTargetAsset.get(assetId) || [];
    return [...sourceFlows, ...targetFlows];
  }

  private getExternalIdentitiesForUser(userSid: string): ExternalIdentityDTO[] {
    const identities: ExternalIdentityDTO[] = [];
    this.externalIdentitiesById.forEach(identity => {
      if (identity.InternalUserSid === userSid) {
        identities.push(identity);
      }
    });
    return identities;
  }

  private getFuzzyMatchCount(): number {
    return this.appliedInferenceRules.filter(rule =>
      rule.toLowerCase().includes('fuzzy') ||
      rule.toLowerCase().includes('similarity') ||
      rule.toLowerCase().includes('match')
    ).length;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ========================================
  // Dashboard-Specific Aggregation Methods
  // ========================================

  /**
   * Get total user count
   */
  public getUserCount(): number {
    return this.usersBySid.size;
  }

  /**
   * Get total group count
   */
  public getGroupCount(): number {
    return this.groupsBySid.size;
  }

  /**
   * Get total device count
   */
  public getDeviceCount(): number {
    return this.devicesByName.size;
  }

  /**
   * Get total infrastructure count (servers + databases + file shares)
   */
  public getInfrastructureCount(): number {
    return this.sqlDbsByKey.size + this.fileSharesByPath.size;
  }

  /**
   * Get total application count
   */
  public getApplicationCount(): number {
    return this.appsById.size;
  }

  /**
   * Get users discovered in last N days
   */
  public getDiscoveredUserCount(days: number = 7): number {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    let count = 0;

    this.usersBySid.forEach(user => {
      if (user.DiscoveryTimestamp && new Date(user.DiscoveryTimestamp) > cutoffDate) {
        count++;
      }
    });

    return count;
  }

  /**
   * Get groups discovered in last N days
   */
  public getDiscoveredGroupCount(days: number = 7): number {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    let count = 0;

    this.groupsBySid.forEach(group => {
      if (group.DiscoveryTimestamp && new Date(group.DiscoveryTimestamp) > cutoffDate) {
        count++;
      }
    });

    return count;
  }

  /**
   * Get devices discovered in last N days
   */
  public getDiscoveredDeviceCount(days: number = 7): number {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    let count = 0;

    this.devicesByName.forEach(device => {
      if (device.DiscoveryTimestamp && new Date(device.DiscoveryTimestamp) > cutoffDate) {
        count++;
      }
    });

    return count;
  }

  /**
   * Get the timestamp of the last discovery run
   */
  public getLastDiscoveryRun(): string | undefined {
    let latestTimestamp: Date | undefined;

    this.usersBySid.forEach(user => {
      if (user.DiscoveryTimestamp) {
        const timestamp = new Date(user.DiscoveryTimestamp);
        if (!latestTimestamp || timestamp > latestTimestamp) {
          latestTimestamp = timestamp;
        }
      }
    });

    return latestTimestamp?.toISOString();
  }

  /**
   * Get all users from the in-memory store
   */
  public getAllUsers(): UserDto[] {
    return Array.from(this.usersBySid.values());
  }

  /**
   * Get all groups from the in-memory store
   */
  public getAllGroups(): GroupDto[] {
    return Array.from(this.groupsBySid.values());
  }

  /**
   * Get all devices from the in-memory store
   */
  public getAllDevices(): DeviceDto[] {
    return Array.from(this.devicesByName.values());
  }

  /**
   * Get all applications from the in-memory store
   */
  public getAllApplications(): AppDto[] {
    return Array.from(this.appsById.values());
  }

  /**
   * Get all mailboxes from the in-memory store
   */
  public getAllMailboxes(): MailboxDto[] {
    return Array.from(this.mailboxByUpn.values());
  }

  /**
   * Analyze migration complexity for a user
   * Returns complexity score based on group memberships, permissions, and service dependencies
   */
  public async analyzeMigrationComplexity(userId: string): Promise<{
    score: number;
    level: 'Low' | 'Medium' | 'High';
    factors: string[];
  }> {
    const user = this.usersBySid.get(userId) || this.usersByUpn.get(userId);

    if (!user) {
      console.warn(`User not found for complexity analysis: ${userId}`);
      return {
        score: 0,
        level: 'Low',
        factors: ['User not found in discovery data']
      };
    }

    let score = 0;
    const factors: string[] = [];

    // Get correlated data
    const groups = this.getGroupsForUser(user.Sid);
    const devices = this.getDevicesForUser(user.Sid);
    const mailbox = this.mailboxByUpn.get(user.UPN) || this.mailboxByUpn.get(user.Mail || '');
    const azureRoles = this.rolesByPrincipalId.get(user.AzureObjectId || '') || [];
    const drives = this.drivesByUserSid.get(user.Sid) || [];
    const acls = this.aclByIdentitySid.get(user.Sid) || [];

    // Group membership complexity (0-10 points)
    if (groups.length > 20) {
      score += 10;
      factors.push(`High group membership count (${groups.length} groups)`);
    } else if (groups.length > 10) {
      score += 5;
      factors.push(`Moderate group membership count (${groups.length} groups)`);
    } else if (groups.length > 5) {
      score += 2;
      factors.push(`Several group memberships (${groups.length} groups)`);
    }

    // Permission complexity - check for administrative roles (0-15 points)
    const adminGroups = groups.filter(g =>
      g.Name?.toLowerCase().includes('admin') ||
      g.Name?.toLowerCase().includes('domain') ||
      g.Type?.toLowerCase().includes('privileged')
    );

    if (adminGroups.length > 0) {
      score += 15;
      factors.push(`Administrative permissions detected (${adminGroups.length} admin groups)`);
    }

    // Azure role assignments (0-10 points)
    if (azureRoles.length > 5) {
      score += 10;
      factors.push(`Multiple Azure role assignments (${azureRoles.length} roles)`);
    } else if (azureRoles.length > 0) {
      score += 5;
      factors.push(`Azure role assignments (${azureRoles.length} roles)`);
    }

    // External system dependencies (0-8 points)
    const hasMailbox = !!mailbox;
    const hasDevices = devices.length > 0;
    const hasDrives = drives.length > 0;

    if (hasMailbox && hasDevices) {
      score += 4;
      factors.push('Multiple Microsoft 365 services (Mailbox + Devices)');
    }

    if (hasDrives) {
      score += 2;
      factors.push(`Mapped network drives (${drives.length} drives)`);
    }

    if (hasDevices && devices.length > 1) {
      score += 2;
      factors.push(`Multiple devices (${devices.length} devices)`);
    }

    // SharePoint/file share access (0-7 points)
    if (acls.length > 10) {
      score += 7;
      factors.push(`Extensive file share permissions (${acls.length} ACL entries)`);
    } else if (acls.length > 0) {
      score += 3;
      factors.push(`File share permissions (${acls.length} ACL entries)`);
    }

    // Teams ownership - check if user manages teams (0-5 points)
    const teamsOwned = groups.filter(g =>
      (g.Type === 'Team' || g.Name?.toLowerCase().includes('team')) &&
      g.ManagedBy === user.Dn
    );

    if (teamsOwned.length > 0) {
      score += 5;
      factors.push(`Teams owner (${teamsOwned.length} teams)`);
    }

    // Manager role - adds complexity if user has direct reports (0-5 points)
    if (user.Manager) {
      const directReports = Array.from(this.usersBySid.values()).filter(u =>
        u.Manager === user.Dn || u.ManagerSid === user.Sid
      );

      if (directReports.length > 0) {
        score += 5;
        factors.push(`Manager with direct reports (${directReports.length} reports)`);
      }
    }

    // Calculate complexity level based on score
    // Score ranges: 0-15 = Low, 16-35 = Medium, 36+ = High
    let level: 'Low' | 'Medium' | 'High';

    if (score <= 15) {
      level = 'Low';
    } else if (score <= 35) {
      level = 'Medium';
    } else {
      level = 'High';
    }

    // Add summary factor
    if (factors.length === 0) {
      factors.push('Minimal dependencies - straightforward migration');
    }

    console.log(`Complexity analysis for ${user.DisplayName || user.Sam}: Score=${score}, Level=${level}, Factors=${factors.length}`);

    return {
      score,
      level,
      factors
    };
  }

  /**
   * Batch analyze complexity for multiple users
   */
  public async batchAnalyzeMigrationComplexity(userIds: string[]): Promise<Map<string, {
    score: number;
    level: 'Low' | 'Medium' | 'High';
    factors: string[];
  }>> {
    const results = new Map<string, {
      score: number;
      level: 'Low' | 'Medium' | 'High';
      factors: string[];
    }>();

    for (const userId of userIds) {
      const complexity = await this.analyzeMigrationComplexity(userId);
      results.set(userId, complexity);
    }

    return results;
  }

  /**
   * Get complexity statistics for all users
   */
  public getComplexityStatistics(): {
    total: number;
    low: number;
    medium: number;
    high: number;
    analyzed: number;
  } {
    // This would be populated by running analysis
    // For now, return empty stats
    return {
      total: this.usersBySid.size,
      low: 0,
      medium: 0,
      high: 0,
      analyzed: 0
    };
  }
}

// Note: All CSV loaders and inference rules are now implemented directly in the class above
// This bypasses webpack bundling issues with the mixin pattern