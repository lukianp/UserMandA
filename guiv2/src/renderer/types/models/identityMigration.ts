/**
 * Identity migration models for T-041: User Account Migration and Synchronization
 * These models are extensive and include all identity, synchronization, and B2B invitation functionality
 */

// Migration Result Base
export interface MigrationResultBase {
  isSuccess: boolean;
  errorMessage: string | null;
  warnings: string[];
  startTime: Date;
  endTime: Date | null;
  duration: number; // milliseconds
  sessionId: string;
}

// License Assignment
export interface LicenseAssignmentResult extends MigrationResultBase {
  targetUserId: string;
  assignedLicenses: string[];
  failedLicenses: string[];
  skippedLicenses: string[];
}

// Identity Migration Result
export interface IdentityMigrationResult {
  sourceUserSid: string;
  targetUserSid: string;
  targetUserUpn: string;
  attributeMappings: Record<string, string>;
  migratedGroups: string[];
  unmappedGroups: string[];
  sidHistoryCreated: boolean;
  conflictResolutionApplied: boolean;
  creationMethod: string;
  syncRegistered: boolean;
  licenseAssignmentResult: LicenseAssignmentResult | null;
  customProperties: Record<string, unknown>;
  isSuccessful: boolean;
  totalAttributesMapped: number;
  totalGroupsMigrated: number;
  hasLicenses: boolean;
  migrationSummary: string;
}

// Conflict Resolution
export interface ConflictResolutionResult extends MigrationResultBase {
  recommendedAction: string;
  resolutionStrategy: string;
  conflictResolutionApplied: boolean;
  resolvedUserPrincipalName: string;
  resolvedSamAccountName: string;
  resolvedEmailAddress: string;
  existingUserId: string;
  conflictType: string;
  detectedConflicts: UserConflict[];
  resolutionMetadata: Record<string, unknown>;
}

export interface UserConflict {
  conflictType: string;
  conflictingValue: string;
  existingUserId: string;
  existingUserPrincipalName: string;
  severity: string;
  recommendedAction: string;
  detectedDate: Date;
  description: string;
  resolutionOptions: string[];
  isBlocking: boolean;
  conflictMetadata: Record<string, unknown>;
}

// Attribute Mapping
export interface AttributeMappingResult extends MigrationResultBase {
  userUpn: string;
  sourceAttributes: Record<string, string>;
  mappedAttributes: Record<string, string>;
  unmappedAttributes: string[];
  attributeTransformations: Record<string, string>;
  mappingDate: Date;
  mappingIssues: AttributeMappingIssue[];
  hasTransformations: boolean;
  hasIssues: boolean;
}

export interface AttributeMappingIssue {
  sourceAttribute: string;
  targetAttribute: string;
  issueType: string;
  severity: string;
  description: string;
  recommendedAction: string;
  detectedDate: Date;
  isBlocking: boolean;
}

// User Creation
export interface AdvancedUserCreationResult extends MigrationResultBase {
  creationMethod: string;
  targetUserUpn: string;
  targetUserId: string;
  passwordProvisioned: boolean;
  temporaryPassword: boolean;
  invitationSent: boolean;
  invitationId: string;
  existingUserUsed: boolean;
  creationMetadata: Record<string, unknown>;
  requiresUserAction: boolean;
  creationSummary: string;
}

// B2B Invitation
export interface B2BInvitationResult extends MigrationResultBase {
  invitationId: string;
  invitedUserPrincipalName: string;
  invitedUserId: string;
  invitationUrl: string;
  invitationSentDate: Date;
  invitationAccepted: boolean;
  invitationAcceptedDate: Date | null;
  invitationStatus: string;
  invitationExpiry: number | null; // milliseconds
  invitationSent: boolean;
  isExpired: boolean;
}

// User Sync
export interface UserSyncRegistrationResult extends MigrationResultBase {
  sourceUserPrincipalName: string;
  targetUserPrincipalName: string;
  syncSchedule: string;
  nextSyncTime: Date;
  attributesToSync: string[];
  enableBidirectionalSync: boolean;
  syncConfiguration: string;
  isSyncActive: boolean;
}

export interface UserSyncResult extends MigrationResultBase {
  userPrincipalName: string;
  attributesSynced: number;
  attributesFailed: number;
  lastSyncTime: Date;
  nextSyncTime: Date;
  syncedAttributes: Record<string, string>;
  failedAttributes: string[];
  syncConflicts: SyncConflict[];
  syncSuccessRate: number;
  hasConflicts: boolean;
}

export interface SyncConflict {
  attributeName: string;
  sourceValue: string;
  targetValue: string;
  conflictType: string;
  resolution: string;
  detectedDate: Date;
  isResolved: boolean;
  resolutionOptions: string[];
}

// Password Provisioning
export interface PasswordProvisioningResult extends MigrationResultBase {
  password: string;
  isTemporary: boolean;
  expirationDate: Date;
  forceChangeOnFirstLogin: boolean;
  passwordComplexity: string;
  passwordRequirements: string[];
  meetsComplexityRequirements: boolean;
}

// User Sync Configuration
export interface UserSyncConfiguration {
  sourceUserPrincipalName: string;
  targetUserPrincipalName: string;
  attributesToSync: string[];
  syncInterval: number; // milliseconds
  enableBidirectionalSync: boolean;
  isActive: boolean;
  lastSyncTime: Date;
  nextSyncTime: Date;
  conflictResolutionStrategy: Record<string, string>;
  excludedAttributes: string[];
  syncJobId: string;
}

// Migration Settings
export interface UserMigrationSettings {
  migrationStrategy: MigrationStrategy;
  enableConflictResolution: boolean;
  enableAttributeMapping: boolean;
  enablePasswordProvisioning: boolean;
  enableMfaConfiguration: boolean;
  enableLicenseAssignment: boolean;
  enableGroupMigration: boolean;
  batchSize: number;
  timeout: number; // milliseconds
  attributeMapping: UserAttributeMapping;
  conflictResolution: ConflictResolutionStrategyConfig;
  passwordRequirements: PasswordRequirements;
  mfaSettings: MfaSettings;
  defaultLicenseSkus: string[];
  customSettings: Record<string, unknown>;
}

export enum MigrationStrategy {
  DirectCreation = 'DirectCreation',
  B2BInvitation = 'B2BInvitation',
  HybridSync = 'HybridSync',
  UseExisting = 'UseExisting',
}

export interface UserAttributeMapping {
  attributeMap: Record<string, string>;
  transformationRules: Record<string, string>;
  requiredAttributes: string[];
  optionalAttributes: string[];
  validateMappedAttributes: boolean;
  skipMissingAttributes: boolean;
  defaultDomain: string;
  customMappings: Record<string, unknown>;
}

export interface ConflictResolutionStrategyConfig {
  upnConflictResolution: ConflictResolutionMode;
  emailConflictResolution: ConflictResolutionMode;
  displayNameConflictResolution: ConflictResolutionMode;
  enableAutomaticResolution: boolean;
  renamingPattern: string;
  appendPattern: string;
  maxRenameAttempts: number;
  customResolutions: Record<string, ConflictResolutionMode>;
}

export enum ConflictResolutionMode {
  Skip = 'Skip',
  Rename = 'Rename',
  Append = 'Append',
  Overwrite = 'Overwrite',
  UseExisting = 'UseExisting',
  PromptUser = 'PromptUser',
}

export interface PasswordRequirements {
  minimumLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialCharacters: boolean;
  forceChangeOnFirstLogin: boolean;
  expirationPeriod: number; // milliseconds
  excludedCharacters: string[];
  excludedWords: string[];
  preventPasswordReuse: boolean;
  passwordHistoryCount: number;
}

export interface MfaSettings {
  enableMfa: boolean;
  enforcementMode: MfaEnforcementMode;
  allowedMethods: MfaMethod[];
  requireMfaRegistration: boolean;
  gracePeriod: number; // milliseconds
  customMfaSettings: Record<string, unknown>;
}

export enum MfaEnforcementMode {
  Disabled = 'Disabled',
  Optional = 'Optional',
  Required = 'Required',
  RequiredForAdmins = 'RequiredForAdmins',
}

export enum MfaMethod {
  PhoneCall = 'PhoneCall',
  TextMessage = 'TextMessage',
  MobileApp = 'MobileApp',
  HardwareToken = 'HardwareToken',
  Email = 'Email',
}

// Result Models
export interface UserMigrationResult extends MigrationResultBase {
  sourceUserPrincipalName: string;
  targetUserPrincipalName: string;
  targetUserId: string;
  strategyUsed: MigrationStrategy;
  attributeMapping: AttributeMappingResult;
  conflictResolution: ConflictResolutionResult;
  passwordProvisioning: PasswordProvisioningResult;
  b2bInvitation: B2BInvitationResult;
  syncRegistration: UserSyncRegistrationResult;
  licenseAssignment: LicenseAssignmentResult;
  mfaConfiguration: MfaConfigurationResult[];
  createdGroups: string[];
  extendedProperties: Record<string, unknown>;
  isFullyMigrated: boolean;
  hasLicenses: boolean;
  requiresUserAction: boolean;
  migrationSummary: string;
}

export interface MfaConfigurationResult extends MigrationResultBase {
  targetUserId: string;
  userPrincipalName: string;
  mfaEnabled: boolean;
  configuredMethods: MfaMethod[];
  requiresUserRegistration: boolean;
  configuredDate: Date;
  configurationErrors: string[];
}

// Event Args
export interface UserMigrationProgressEventArgs {
  userPrincipalName: string;
  currentStep: string;
  progressPercentage: number;
  statusMessage: string;
  timestamp: Date;
  extendedData: Record<string, unknown>;
}

export interface BatchMigrationProgress {
  totalUsers: number;
  processedUsers: number;
  successfulUsers: number;
  failedUsers: number;
  skippedUsers: number;
  currentUserPrincipalName: string;
  progressPercentage: number;
  progressTime: Date;
  estimatedTimeRemaining: number; // milliseconds
  statusMessage: string;
  message: string;
  itemsProcessed: number;
  processedItems: number;
  itemsTotal: number;
  totalItems: number;
  currentItemName: string;
  currentItem: string;
}


