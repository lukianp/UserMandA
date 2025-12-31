/**
 * Conditional Access Policies Discovery Types
 */

export type CADiscoveryStatus = 'idle' | 'discovering' | 'completed' | 'failed' | 'cancelled';
export type PolicyState = 'enabled' | 'disabled' | 'enabledForReportingButNotEnforced';

export interface CADiscoveryConfig {
  id: string;
  name: string;
  tenantId: string;
  includeAssignments: boolean;
  includeConditions: boolean;
  includeControls: boolean;
  timeout: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CADiscoveryResult {
  id: string;
  configId: string;
  startTime: Date;
  endTime?: Date;
  status: CADiscoveryStatus;
  policies: ConditionalAccessPolicy[];
  namedLocations: NamedLocation[];
  totalPoliciesFound: number;
  errors: CAError[];
  warnings: string[];
}

export interface ConditionalAccessPolicy {
  id: string;
  displayName: string;
  state: PolicyState;
  createdDateTime: Date;
  modifiedDateTime: Date;
  conditions: PolicyConditions;
  grantControls?: GrantControls;
  sessionControls?: SessionControls;
}

export interface PolicyConditions {
  applications: { includeApplications: string[]; excludeApplications: string[]; };
  users: { includeUsers: string[]; excludeUsers: string[]; includeGroups: string[]; excludeGroups: string[]; includeRoles: string[]; excludeRoles: string[]; };
  locations?: { includeLocations: string[]; excludeLocations: string[]; };
  platforms?: { includePlatforms: string[]; excludePlatforms: string[]; };
  clientAppTypes?: string[];
  deviceStates?: { includeStates: string[]; excludeStates: string[]; };
  devices?: { includeDevices: string[]; excludeDevices: string[]; deviceFilter?: string; };
  signInRiskLevels?: string[];
  userRiskLevels?: string[];
}

export interface GrantControls {
  operator: 'AND' | 'OR';
  builtInControls: string[];
  customAuthenticationFactors: string[];
  termsOfUse: string[];
}

export interface SessionControls {
  applicationEnforcedRestrictions?: { isEnabled: boolean; };
  cloudAppSecurity?: { isEnabled: boolean; cloudAppSecurityType: string; };
  signInFrequency?: { isEnabled: boolean; type: string; value: number; };
  persistentBrowser?: { isEnabled: boolean; mode: string; };
}

export interface NamedLocation {
  id: string;
  displayName: string;
  createdDateTime: Date;
  modifiedDateTime: Date;
  isTrusted: boolean;
  ipRanges?: { cidrAddress: string; }[];
  countriesAndRegions?: string[];
}

export interface CAError {
  timestamp: Date;
  message: string;
  policyId?: string;
}

export interface CAStats {
  totalPolicies: number;
  enabledPolicies: number;
  reportOnlyPolicies: number;
  policiesByCondition: Record<string, number>;
}

export interface CAFilterState {
  searchText: string;
  selectedStates: PolicyState[];
}


