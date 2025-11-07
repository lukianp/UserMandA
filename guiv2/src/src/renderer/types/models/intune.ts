/**
 * Microsoft Intune Discovery Types
 */

export type IntuneDiscoveryStatus = 'idle' | 'discovering' | 'completed' | 'failed' | 'cancelled';
export type DevicePlatform = 'windows' | 'ios' | 'android' | 'macos' | 'linux';
export type ComplianceState = 'compliant' | 'noncompliant' | 'inGracePeriod' | 'configManager' | 'unknown';
export type ManagementState = 'managed' | 'unmanaged' | 'retired' | 'wiped';

export interface IntuneDiscoveryConfig {
  id: string;
  name: string;
  tenantId: string;
  includeDevices: boolean;
  includeApplications: boolean;
  includePolicies: boolean;
  includeComplianceReports: boolean;
  includeConfigurationPolicies: boolean;
  includeCompliancePolicies: boolean;
  includeAppProtectionPolicies: boolean;
  platforms: DevicePlatform[];
  timeout: number;
  schedule?: {
    enabled: boolean;
    cronExpression: string;
    nextRun?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IntuneDiscoveryResult {
  id: string;
  configId: string;
  startTime: Date;
  endTime?: Date;
  status: IntuneDiscoveryStatus;
  tenantId: string;
  devices: IntuneDevice[];
  applications: IntuneApplication[];
  configurationPolicies: ConfigurationPolicy[];
  compliancePolicies: CompliancePolicy[];
  appProtectionPolicies: AppProtectionPolicy[];
  totalDevicesFound: number;
  totalApplicationsFound: number;
  totalConfigPoliciesFound: number;
  totalCompliancePoliciesFound: number;
  totalAppProtectionPoliciesFound: number;
  complianceSummary: ComplianceSummary;
  errors: IntuneError[];
  warnings: string[];
}

export interface IntuneDevice {
  id: string;
  deviceName: string;
  managedDeviceName?: string;
  userDisplayName: string;
  userPrincipalName: string;
  deviceType: DevicePlatform;
  operatingSystem: string;
  osVersion: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  imei?: string;
  meid?: string;
  wiFiMacAddress?: string;
  ethernetMacAddress?: string;
  enrolledDateTime: Date;
  lastSyncDateTime: Date;
  managementState: ManagementState;
  complianceState: ComplianceState;
  jailBroken: boolean;
  azureADRegistered: boolean;
  azureADDeviceId?: string;
  enrollmentType: string;
  managementAgent: string;
  ownership: 'company' | 'personal' | 'unknown';
  deviceCategoryDisplayName?: string;
  exchangeAccessState: string;
  exchangeAccessStateReason: string;
  isEncrypted: boolean;
  totalStorageSpaceInBytes?: number;
  freeStorageSpaceInBytes?: number;
  phoneNumber?: string;
  androidSecurityPatchLevel?: string;
  userApprovedEnrollment: boolean;
  configurationManagerClientEnabledFeatures?: ConfigManagerFeatures;
  installedApplications?: InstalledApp[];
  assignedPolicies: string[];
  complianceGracePeriodExpirationDateTime?: Date;
  deviceHealthAttestationState?: DeviceHealthAttestation;
}

export interface ConfigManagerFeatures {
  inventory: boolean;
  modernApps: boolean;
  resourceAccess: boolean;
  deviceConfiguration: boolean;
  compliancePolicy: boolean;
  windowsUpdateForBusiness: boolean;
}

export interface InstalledApp {
  id: string;
  displayName: string;
  version: string;
  publisher?: string;
  installState: string;
  installedDateTime?: Date;
  sizeInBytes?: number;
}

export interface DeviceHealthAttestation {
  bitLockerStatus: string;
  bootManagerVersion: string;
  codeIntegrityCheckVersion: string;
  secureBoot: string;
  bootDebugging: string;
  operatingSystemKernelDebugging: string;
  codeIntegrity: string;
  testSigning: string;
  safeMode: string;
  windowsPE: string;
  earlyLaunchAntiMalwareDriverProtection: string;
  virtualSecureMode: string;
  pcrHashAlgorithm: string;
  bootAppSecurityVersion: string;
  bootManagerSecurityVersion: string;
  tpmVersion: string;
  pcr0: string;
  secureBootConfigurationPolicyFingerPrint: string;
  codeIntegrityPolicy: string;
  bootRevisionListInfo: string;
  operatingSystemRevListInfo: string;
  healthStatusMismatchInfo: string;
  healthAttestationSupportedStatus: string;
}

export interface IntuneApplication {
  id: string;
  displayName: string;
  description?: string;
  publisher: string;
  largeIcon?: {
    type: string;
    value: string;
  };
  createdDateTime: Date;
  lastModifiedDateTime: Date;
  isFeatured: boolean;
  privacyInformationUrl?: string;
  informationUrl?: string;
  owner?: string;
  developer?: string;
  notes?: string;
  uploadState: number;
  publishingState: string;
  appType: string;
  installCommandLine?: string;
  uninstallCommandLine?: string;
  applicableArchitectures?: string;
  minimumSupportedOperatingSystem?: {
    v8_0?: boolean;
    v8_1?: boolean;
    v10_0?: boolean;
    v10_1607?: boolean;
    v10_1703?: boolean;
    v10_1709?: boolean;
    v10_1803?: boolean;
    v10_1809?: boolean;
    v10_1903?: boolean;
    v10_2004?: boolean;
  };
  assignments: AppAssignment[];
  installSummary?: {
    installedDeviceCount: number;
    failedDeviceCount: number;
    pendingInstallDeviceCount: number;
    installedUserCount: number;
    failedUserCount: number;
    pendingInstallUserCount: number;
  };
}

export interface AppAssignment {
  id: string;
  intent: 'required' | 'available' | 'uninstall' | 'availableWithoutEnrollment';
  target: {
    groupId?: string;
    deviceAndAppManagementAssignmentFilterId?: string;
    deviceAndAppManagementAssignmentFilterType?: string;
  };
  settings?: Record<string, any>;
}

export interface ConfigurationPolicy {
  id: string;
  displayName: string;
  description?: string;
  platform: DevicePlatform;
  createdDateTime: Date;
  lastModifiedDateTime: Date;
  version: number;
  assignments: PolicyAssignment[];
  settingsCount: number;
  settings: PolicySetting[];
  deploymentSummary?: {
    configuredDevicesCount: number;
    errorDevicesCount: number;
    notApplicableDevicesCount: number;
    pendingDevicesCount: number;
    succeededDevicesCount: number;
  };
}

export interface PolicySetting {
  id: string;
  definitionId: string;
  settingInstance: {
    settingDefinitionId: string;
    settingInstanceTemplateId?: string;
    choiceSettingValue?: {
      value: string;
      children: any[];
    };
    simpleSettingValue?: {
      value: string | number | boolean;
    };
  };
}

export interface PolicyAssignment {
  id: string;
  target: {
    groupId?: string;
    deviceAndAppManagementAssignmentFilterId?: string;
    deviceAndAppManagementAssignmentFilterType?: string;
  };
}

export interface CompliancePolicy {
  id: string;
  displayName: string;
  description?: string;
  platform: DevicePlatform;
  createdDateTime: Date;
  lastModifiedDateTime: Date;
  version: number;
  scheduledActionsForRule: ScheduledAction[];
  assignments: PolicyAssignment[];
  deviceStatusOverview?: {
    pendingCount: number;
    notApplicableCount: number;
    successCount: number;
    errorCount: number;
    failedCount: number;
    conflictCount: number;
  };
}

export interface ScheduledAction {
  id: string;
  ruleName: string;
  scheduledActionConfigurations: ActionConfiguration[];
}

export interface ActionConfiguration {
  id: string;
  gracePeriodHours: number;
  actionType: 'block' | 'retire' | 'wipe' | 'notification' | 'remoteLock';
  notificationTemplateId?: string;
  notificationMessageCCList?: string[];
}

export interface AppProtectionPolicy {
  id: string;
  displayName: string;
  description?: string;
  createdDateTime: Date;
  lastModifiedDateTime: Date;
  version: string;
  platform: 'ios' | 'android';
  assignments: PolicyAssignment[];
  allowedDataStorageLocations: string[];
  allowedInboundDataTransferSources: string;
  allowedOutboundClipboardSharingLevel: string;
  allowedOutboundDataTransferDestinations: string;
  contactSyncBlocked: boolean;
  dataBackupBlocked: boolean;
  deviceComplianceRequired: boolean;
  managedBrowserToOpenLinksRequired: boolean;
  saveAsBlocked: boolean;
  periodOfflineBeforeWipeIsEnforced: string;
  pinRequired: boolean;
  maximumPinRetries: number;
  simplePinBlocked: boolean;
  minimumPinLength: number;
  pinCharacterSet: string;
  periodBeforePinReset: string;
  allowedDataIngestionLocations: string[];
  faceIdBlocked: boolean;
  printBlocked: boolean;
}

export interface ComplianceSummary {
  compliantDevices: number;
  nonCompliantDevices: number;
  inGracePeriodDevices: number;
  unknownDevices: number;
  complianceRate: number;
  topNonComplianceReasons: { reason: string; count: number; }[];
}

export interface IntuneError {
  timestamp: Date;
  errorType: 'device' | 'application' | 'policy';
  message: string;
  code?: string;
  deviceId?: string;
}

export interface IntuneStats {
  totalDevices: number;
  devicesByPlatform: Record<DevicePlatform, number>;
  devicesByComplianceState: Record<ComplianceState, number>;
  totalApplications: number;
  totalPolicies: number;
  complianceRate: number;
  topDeviceModels: { model: string; count: number; }[];
}

export interface IntuneFilterState {
  searchText: string;
  selectedPlatforms: DevicePlatform[];
  selectedComplianceStates: ComplianceState[];
  selectedManagementStates: ManagementState[];
  showOnlyNonCompliant: boolean;
  lastSyncRange?: { start: Date; end: Date; };
}
