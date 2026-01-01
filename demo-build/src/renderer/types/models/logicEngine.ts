/**
 * Logic Engine Data Models
 * TypeScript ports of C# LogicEngineModels.cs
 */

// Core DTOs for the Logic Engine data fabric
export interface UserDto {
  UPN: string;
  Sam: string;
  Sid: string;
  Mail?: string;
  DisplayName?: string;
  Enabled: boolean;
  OU?: string;
  ManagerSid?: string;
  Dept?: string;
  AzureObjectId?: string;
  Groups: string[];
  DiscoveryTimestamp: Date;
  DiscoveryModule: string;
  SessionId: string;
  // Migration Engine compatibility properties
  Manager?: string; // Manager DN for compatibility
  Dn?: string; // Distinguished Name for compatibility
}

export interface GroupDto {
  Sid: string;
  Name: string;
  Type: string;
  Members: string[];
  DiscoveryTimestamp: Date;
  DiscoveryModule: string;
  SessionId: string;
  NestedGroups?: string[];
  // Migration Engine compatibility properties
  Dn?: string; // Distinguished Name for compatibility
  ManagedBy?: string; // Manager DN
}

export interface DeviceDto {
  Name: string;
  DNS?: string;
  OU?: string;
  OS?: string;
  PrimaryUserSid?: string;
  InstalledApps: string[];
  DiscoveryTimestamp: Date;
  DiscoveryModule: string;
  SessionId: string;
}

export interface AppDto {
  Id: string;
  Name: string;
  Source?: string;
  InstallCounts: number;
  Executables: string[];
  Publishers: string[];
  DiscoveryTimestamp: Date;
  DiscoveryModule: string;
  SessionId: string;
}

export interface GpoDto {
  Guid: string;
  Name: string;
  Links: string[];
  SecurityFilter: string[];
  WmiFilter?: string;
  Enabled: boolean;
  DiscoveryTimestamp: Date;
  DiscoveryModule: string;
  SessionId: string;
}

export interface AclEntry {
  Path: string;
  IdentitySid: string;
  Rights: string;
  Inherited: boolean;
  IsShare: boolean;
  IsNTFS: boolean;
  DiscoveryTimestamp: Date;
  DiscoveryModule: string;
  SessionId: string;
}

export interface MappedDriveDto {
  UserSid: string;
  Letter: string;
  UNC: string;
  Label?: string;
  DiscoveryTimestamp: Date;
  DiscoveryModule: string;
  SessionId: string;
}

export interface MailboxDto {
  UPN: string;
  MailboxGuid?: string;
  SizeMB: number;
  Type: string;
  DiscoveryTimestamp: Date;
  DiscoveryModule: string;
  SessionId: string;
  Permissions?: string[];
  UserPrincipalName?: string;
  // Migration Engine compatibility
  EffectiveUPN: string;
}

export interface AzureRoleAssignment {
  PrincipalObjectId: string;
  RoleName: string;
  Scope: string;
  DiscoveryTimestamp: Date;
  DiscoveryModule: string;
  SessionId: string;
}

export interface SqlDbDto {
  Server: string;
  Instance?: string;
  Database: string;
  Owners: string[];
  AppHints: string[];
  DiscoveryTimestamp: Date;
  DiscoveryModule: string;
  SessionId: string;
  Name: string;
}

export interface FileShareDto {
  Name: string;
  Path: string;
  Description?: string;
  Server?: string;
  Permissions: string[];
  DiscoveryTimestamp: Date;
  DiscoveryModule: string;
  SessionId: string;
  AclEntries?: AclEntry[];
}

// T-029: New module DTOs
export interface ThreatDetectionDTO {
  ThreatId: string;
  ThreatName: string;
  Category: string;
  Severity: 'Critical' | 'High' | 'Medium' | 'Low';
  Confidence: number;
  MitreAttackId?: string;
  MitreTactic?: string;
  MitreTechnique?: string;
  AffectedAssets: string[];
  IndicatorsOfCompromise: string[];
  ThreatDetails: Record<string, any>;
  DetectionTimestamp: Date;
  DetectionSource: string;
  SessionId: string;
  DiscoveryModule: string;
  ThreatScore?: number;
}

export interface DataGovernanceDTO {
  AssetId: string;
  AssetName: string;
  AssetType: string;
  Classification: string;
  Owner: string;
  Custodian: string;
  RetentionPolicies: string[];
  ComplianceFrameworks: string[];
  Metadata: Record<string, string>;
  HasPersonalData: boolean;
  HasSensitiveData: boolean;
  LastAuditDate: Date;
  ComplianceStatus: string;
  ViolationsFound: string[];
  DiscoveryTimestamp: Date;
  DiscoveryModule: string;
  SessionId: string;
  ComplianceScore?: number;
  RiskLevel?: string;
  GovernanceRisk?: number;
}

export interface DataLineageDTO {
  LineageId: string;
  SourceAssetId: string;
  SourceAssetName: string;
  SourceAssetType: string;
  TargetAssetId: string;
  TargetAssetName: string;
  TargetAssetType: string;
  TransformationType: string;
  TransformationSteps: string[];
  DataFlow: string;
  FlowMetadata: Record<string, string>;
  Dependencies: string[];
  IsOrphaned: boolean;
  HasBrokenLinks: boolean;
  LastValidated: Date;
  DiscoveryTimestamp: Date;
  DiscoveryModule: string;
  SessionId: string;
  Issues?: string[];
  LineageRisk?: number;
}

export interface ExternalIdentityDTO {
  ExternalIdentityId: string;
  ExternalProvider: string;
  ExternalUserId: string;
  ExternalUserEmail?: string;
  ExternalDisplayName?: string;
  InternalUserSid?: string;
  MappingStatus: 'Mapped' | 'Unmapped' | 'Conflict';
  MappingConfidence: number;
  AssignedRoles: string[];
  Permissions: string[];
  LastSynchronized: Date;
  SyncErrors: string[];
  DiscoveryTimestamp: Date;
  DiscoveryModule: string;
  SessionId: string;
  IdentityRisk?: number;
}

// Azure-specific DTOs
export interface ServicePrincipalDto {
  ObjectType: string;
  Id: string;
  AppId: string;
  DisplayName: string;
  CreatedDateTime: Date;
  ServicePrincipalType: string;
  Tags: string[];
  Homepage?: string;
  ReplyUrls: string[];
  ServicePrincipalNames: string[];
  OwnerCount: number;
  Owners: string[];
  OwnerTypes: string[];
  DiscoveryTimestamp: Date;
  DiscoveryModule: string;
  SessionId: string;
}

export interface DirectoryRoleDto {
  ObjectType: string;
  Id: string;
  DisplayName: string;
  Description?: string;
  RoleTemplateId: string;
  MemberCount: number;
  DiscoveryTimestamp: Date;
  DiscoveryModule: string;
  SessionId: string;
}

export interface SharePointSiteDto {
  ObjectType: string;
  Id: string;
  Name: string;
  DisplayName: string;
  WebUrl: string;
  CreatedDateTime: Date;
  LastModifiedDateTime?: Date;
  DiscoveryTimestamp: Date;
  DiscoveryModule: string;
  SessionId: string;
}

export interface MicrosoftTeamDto {
  ObjectType: string;
  Id: string;
  DisplayName: string;
  Description?: string;
  CreatedDateTime: Date;
  Visibility: string;
  DiscoveryTimestamp: Date;
  DiscoveryModule: string;
  SessionId: string;
}

export interface TenantDto {
  ObjectType: string;
  Id: string;
  DisplayName: string;
  CreatedDateTime: Date;
  Country?: string;
  CountryLetterCode?: string;
  City?: string;
  State?: string;
  Street?: string;
  PostalCode?: string;
  BusinessPhones?: string;
  TechnicalNotificationMails?: string;
  MarketingNotificationEmails?: string;
  VerifiedDomains: string[];
  DiscoveryTimestamp: Date;
  DiscoveryModule: string;
  SessionId: string;
}

export interface ApplicationSecretDto {
  ObjectType: string;
  AppId: string;
  AppDisplayName: string;
  CredentialType: string;
  KeyId: string;
  DisplayName?: string;
  Hint?: string;
  StartDateTime: Date;
  EndDateTime: Date;
  DaysUntilExpiry: number;
  Status: string;
  DiscoveryTimestamp: Date;
  DiscoveryModule: string;
  SessionId: string;
}

// Graph node types
export enum NodeType {
  User = 'User',
  Group = 'Group',
  Device = 'Device',
  App = 'App',
  Share = 'Share',
  Path = 'Path',
  Gpo = 'Gpo',
  Mailbox = 'Mailbox',
  Role = 'Role',
  Db = 'Db',
  Threat = 'Threat',
  DataAsset = 'DataAsset',
  LineageFlow = 'LineageFlow',
  ExternalIdentity = 'ExternalIdentity'
}

// Edge types for the logic engine graph
export enum EdgeType {
  MemberOf = 'MemberOf',
  PrimaryUser = 'PrimaryUser',
  HasApp = 'HasApp',
  AclOn = 'AclOn',
  MapsTo = 'MapsTo',
  LinkedByGpo = 'LinkedByGpo',
  HasMailbox = 'HasMailbox',
  AssignedRole = 'AssignedRole',
  OwnsDb = 'OwnsDb',
  DependsOn = 'DependsOn',
  Threatens = 'Threatens',
  HasGovernanceIssue = 'HasGovernanceIssue',
  DataFlowTo = 'DataFlowTo',
  ExternalMapping = 'ExternalMapping',
  Correlates = 'Correlates',
  Violates = 'Violates'
}

// Graph node representing an entity
export interface GraphNode {
  Id: string;
  Type: NodeType;
  Properties: Record<string, any>;
}

// Graph edge representing a relationship
export interface GraphEdge {
  SourceId: string;
  TargetId: string;
  Type: EdgeType;
  Properties?: Record<string, any>;
}

// Risk assessment for entities
export interface LogicEngineRisk {
  EntityId: string;
  EntityType: string;
  MissingMappings: string[];
  OrphanedAcls: string[];
  UnresolvableSidRefs: string[];
  Severity: 'High' | 'Medium' | 'Low';
  Type?: string;
  Description?: string;
  Recommendation?: string;
}

// Migration hint for entitlements
export interface MigrationHint {
  EntityId: string;
  EntityType: string;
  HintType: string;
  Description: string;
  RequiredActions: Record<string, string>;
}

// Projection models for UI ViewModels
export interface UserDetailProjection {
  User: UserDto;
  Groups: GroupDto[];
  Devices: DeviceDto[];
  Apps: AppDto[];
  Drives: MappedDriveDto[];
  Shares: AclEntry[];
  GpoLinks: GpoDto[];
  GpoFilters: GpoDto[];
  Mailbox?: MailboxDto;
  AzureRoles: AzureRoleAssignment[];
  SqlDatabases: SqlDbDto[];
  Risks: LogicEngineRisk[];
  MigrationHints: MigrationHint[];
  // T-027 Migration Engine required properties
  MemberOfGroups?: string[];
  ManagedGroups?: string[];
  ManagerUpn?: string;
  OwnedGroups?: string[];
  // T-029 Extended properties
  Threats?: ThreatDetectionDTO[];
  GovernanceIssues?: DataGovernanceDTO[];
  DataLineage?: DataLineageDTO[];
  ExternalIdentities?: ExternalIdentityDTO[];
}

export interface AssetDetailProjection {
  Device: DeviceDto;
  PrimaryUser?: UserDto;
  InstalledApps: AppDto[];
  SharesUsed: AclEntry[];
  GposApplied: GpoDto[];
  Backups: string[];
  VulnFindings: string[];
  Risks: LogicEngineRisk[];
}

// Configuration for fuzzy matching
export interface FuzzyMatchingConfig {
  LevenshteinThreshold: number;
  JaroWinklerThreshold: number;
  SoundexEnabled: boolean;
  MetaphoneEnabled: boolean;
  BigramAnalysisEnabled: boolean;
}

// Data load statistics
export interface DataLoadStatistics {
  UserCount: number;
  GroupCount: number;
  DeviceCount: number;
  AppCount: number;
  GpoCount: number;
  AclEntryCount: number;
  MappedDriveCount: number;
  MailboxCount: number;
  AzureRoleCount: number;
  SqlDbCount: number;
  ThreatCount: number;
  GovernanceAssetCount: number;
  LineageFlowCount: number;
  ExternalIdentityCount: number;
  InferenceRulesApplied: number;
  FuzzyMatchesFound: number;
  LoadDuration: number;
  LoadTimestamp: Date;
}

// Events
export interface DataLoadedEventArgs {
  Statistics: DataLoadStatistics;
  AppliedInferenceRules: string[];
}

export interface DataLoadErrorEventArgs {
  Error: Error;
  Message: string;
}

// Risk dashboard projection
export interface RiskDashboardProjection {
  TotalThreats: number;
  CriticalThreats: number;
  HighThreats: number;
  AverageThreatScore: number;
  TopThreats: ThreatDetectionDTO[];

  TotalGovernanceIssues: number;
  CriticalComplianceViolations: number;
  AverageComplianceScore: number;
  TopGovernanceRisks: DataGovernanceDTO[];

  TotalLineageGaps: number;
  OrphanedDataSources: number;
  BrokenLineageLinks: number;
  TopLineageIssues: DataLineageDTO[];

  TotalExternalIdentities: number;
  UnmappedIdentities: number;
  ConflictedMappings: number;
  AverageIdentityRisk: number;
  TopIdentityRisks: ExternalIdentityDTO[];

  OverallRiskScore: number;
  TopRecommendations: string[];
  GeneratedAt: Date;
}

// Threat analysis projection
export interface ThreatAnalysisProjection {
  AllThreats: ThreatDetectionDTO[];
  ThreatsByCategory: Record<string, ThreatDetectionDTO[]>;
  ThreatsBySeverity: Record<string, ThreatDetectionDTO[]>;
  ThreatsByAsset: Record<string, ThreatDetectionDTO[]>;
  ThreatCorrelations: Array<{ threat1: string; threat2: string; correlation: number }>;
  MitreTactics: Record<string, number>;
  GeneratedAt: Date;
}

