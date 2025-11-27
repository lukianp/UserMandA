/**
 * IPC Contract - Shared Types
 *
 * Defines the typed IPC communication contract between renderer and main process.
 * This is the single source of truth for all IPC channels and payload types.
 */

export const IPC = {
  // Discovery
  DISCOVERY_START: "discovery:start",
  DISCOVERY_CANCEL: "discovery:cancel",
  DISCOVERY_PROGRESS: "discovery:progress",
  DISCOVERY_RESULT: "discovery:result",
  DISCOVERY_ERROR: "discovery:error",

  // Migration
  MIGRATION_PLAN: "migration:plan",
  MIGRATION_EXECUTE: "migration:execute",
  MIGRATION_CANCEL: "migration:cancel",
  MIGRATION_PROGRESS: "migration:progress",
  MIGRATION_RESULT: "migration:result",
  MIGRATION_ERROR: "migration:error",

  // Credentials
  CREDENTIALS_LOAD: "credentials:load",
  CREDENTIALS_SAVE: "credentials:save",
} as const;

/**
 * Discovery Module Types
 * Matches PowerShell discovery modules in /modules/Discovery/
 */
export type DiscoveryType =
  | "ActiveDirectory"
  | "Exchange"
  | "SharePoint"
  | "Teams"
  | "OneDrive"
  | "ConditionalAccess"
  | "IdentityGovernance"
  | "DataLossPrevention"
  | "Intune"
  | "AzureResources"
  | "Application"
  | "ApplicationDependencyMapping"
  | "AWS"
  | "Azure"
  | "BackupRecovery"
  | "CertificateAuthority"
  | "Certificate"
  | "DatabaseSchema"
  | "DataClassification"
  | "DLP"
  | "DNSDHCP"
  | "EntraIDApp"
  | "EnvironmentDetection"
  | "ExternalIdentity"
  | "FileServer"
  | "GCP"
  | "GPO"
  | "Graph"
  | "Infrastructure"
  | "Licensing"
  | "MultiDomainForest"
  | "NetworkInfrastructure"
  | "PaloAlto"
  | "PhysicalServer"
  | "PowerBI"
  | "PowerPlatform"
  | "Printer"
  | "RealTimeDiscoveryEngine"
  | "ScheduledTask"
  | "SecurityGroupAnalysis"
  | "SecurityInfrastructure"
  | "SQLServer"
  | "StorageArray"
  | "Virtualization"
  | "VMware"
  | "WebServerConfig";

/**
 * Start Discovery Payload
 */
export interface StartDiscoveryPayload<T = Record<string, unknown>> {
  type: DiscoveryType;
  profileId: string;
  args: T;
}

/**
 * Progress Event
 */
export interface ProgressEvent {
  runId: string;
  pct?: number;              // 0–100
  msg?: string;              // human text
  stage?: string;            // machine stage
  row?: Record<string, any>; // optional NDJSON row
}

/**
 * Result Event
 */
export interface ResultEvent {
  runId: string;
  rowsFile?: string; // path to temp NDJSON/CSV file
  stats?: Record<string, number>;
  durationMs: number;
}

/**
 * IPC Error
 */
export interface IpcError {
  runId?: string;
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

/**
 * Credentials Payload
 */
export interface CredentialsPayload {
  tenantId: string;
  clientId: string;
  clientSecret?: string;
  certPath?: string;
}

/**
 * Legacy Discovery Credential Format
 * From C:\DiscoveryData\{profile}\Credentials\discoverycredentials.config
 */
export interface LegacyDiscoveryCredential {
  TenantId: string;
  ClientId: string;
  ClientSecret: string;
  ApplicationObjectId?: string;
  ApplicationName?: string;
  ExpiryDate?: string;
  PermissionCount?: number;
  SecretKeyId?: string;
  CreatedDate?: string;
  ScriptVersion?: string;
  ValidityYears?: number;
  AzureRoles?: string;
  AzureSubscriptionCount?: number;
  DaysUntilExpiry?: number;
  AzureADRoles?: string[];
  ComputerName?: string;
  Domain?: string;
  PowerShellVersion?: string;
  CreatedBy?: string;
  CreatedOnComputer?: string;
  RoleAssignmentSuccess?: boolean;
}
