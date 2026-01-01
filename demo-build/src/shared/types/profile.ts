export type DomainCredentialValidationStatus = 'valid' | 'invalid' | 'unknown';

export interface DomainCredentialsStored {
  username: string;             // DOMAIN\username
  password: string;             // base64 encrypted blob
  encrypted: true;
  lastValidated?: string;       // ISO datetime
  validationStatus?: DomainCredentialValidationStatus;
  validationError?: string;     // last failure reason (no secrets)
}

export interface CompanyProfileConfiguration {
  domainCredentials?: DomainCredentialsStored;
  [key: string]: any;
}

export interface CompanyProfile {
  id: string;
  companyName: string;
  description: string;
  domainController: string;
  tenantId: string;
  isActive: boolean;
  created: string;
  lastModified: string;
  configuration: CompanyProfileConfiguration;
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