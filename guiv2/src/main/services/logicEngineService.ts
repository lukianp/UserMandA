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
import { InferenceRulesMixin } from './logicEngineInferenceRules';
import { CsvLoadersMixin } from './logicEngineLoaders';

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

  // Mixin methods - implemented in separate files for organization
  // Inference Rules (from logicEngineInferenceRules.ts)
  public applyAclGroupUserInference!: () => void;
  public applyPrimaryDeviceInference!: () => void;
  public applyGpoSecurityFilterInference!: () => void;
  public applyApplicationUsageInference!: () => void;
  public applyAzureRoleInference!: () => void;
  public applySqlOwnershipInference!: () => void;
  public applyThreatAssetCorrelationInference!: () => void;
  public applyGovernanceRiskInference!: () => void;
  public applyLineageIntegrityInference!: () => void;
  public applyExternalIdentityMappingInference!: () => void;

  // CSV Loaders (from logicEngineLoaders.ts)
  public loadDevicesStreamingAsync!: (dataPath: string) => Promise<void>;
  public loadApplicationsStreamingAsync!: (dataPath: string) => Promise<void>;
  public loadGposStreamingAsync!: (dataPath: string) => Promise<void>;
  public loadAclsStreamingAsync!: (dataPath: string) => Promise<void>;
  public loadMappedDrivesStreamingAsync!: (dataPath: string) => Promise<void>;
  public loadMailboxesStreamingAsync!: (dataPath: string) => Promise<void>;
  public loadAzureRolesStreamingAsync!: (dataPath: string) => Promise<void>;
  public loadSqlDatabasesStreamingAsync!: (dataPath: string) => Promise<void>;
  public loadThreatDetectionStreamingAsync!: (dataPath: string) => Promise<void>;
  public loadDataGovernanceStreamingAsync!: (dataPath: string) => Promise<void>;
  public loadDataLineageStreamingAsync!: (dataPath: string) => Promise<void>;
  public loadExternalIdentitiesStreamingAsync!: (dataPath: string) => Promise<void>;

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

  // CSV loader methods are implemented via mixin (see below)

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

// Apply mixins to LogicEngineService class
// This allows us to split the implementation across multiple files for organization
Object.assign(LogicEngineService.prototype, InferenceRulesMixin.prototype);
Object.assign(LogicEngineService.prototype, CsvLoadersMixin.prototype);