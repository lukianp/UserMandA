export interface CompanyProfile {
  id: string;
  companyName: string;
  description: string;
  domainController: string;
  tenantId: string;
  isActive: boolean;
  created: string;
  lastModified: string;
  configuration: Record<string, any>;
}

export interface ProfileDatabase {
  profiles: CompanyProfile[];
  version: number;
}

export interface ProfileStatistics {
  profileId: string;
  companyName: string;
  created: string;
  lastModified: string;
  lastDiscoveryRun: string | null;
  totalDiscoveryRuns: number;
  dataSizeBytes: number;
}

export interface ProfileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface ConnectionConfig {
  graphClientId: string;
  tenantId: string;
  authority?: string;
  certificateThumbprint?: string;
  clientSecretKeyName?: string;
  endpoints?: Record<string, string>;
  scopes?: string[];
}

/**
 * Application Filter Settings - stored per profile
 */
export interface ApplicationFilterSettings {
  hideMicrosoftDefaults: boolean;
  hideThirdParty: boolean;
  hideUnknown: boolean;
  classificationThreshold: number; // Confidence threshold (0-1) for auto-hiding
  showExcludedReasons: boolean;
  customExcludedAppIds: string[]; // User-defined exclusions
  customIncludedAppIds: string[]; // Force-include even if classified as MS
}

/**
 * Tenant Domain Info - discovered from Azure AD
 */
export interface TenantDomainInfo {
  verifiedDomains: string[];
  primaryDomain?: string;
  onmicrosoftDomain?: string;
  discoveredAt?: string;
}

/**
 * Extended profile configuration
 */
export interface ProfileConfiguration extends Record<string, any> {
  applicationFilters?: ApplicationFilterSettings;
  tenantDomains?: TenantDomainInfo;
}

/**
 * Default application filter settings
 */
export const DEFAULT_APPLICATION_FILTER_SETTINGS: ApplicationFilterSettings = {
  hideMicrosoftDefaults: true,
  hideThirdParty: false,
  hideUnknown: false,
  classificationThreshold: 0.7,
  showExcludedReasons: false,
  customExcludedAppIds: [],
  customIncludedAppIds: []
};