/**
 * Power Platform Discovery Types
 */

export type PowerPlatformDiscoveryStatus = 'idle' | 'discovering' | 'completed' | 'failed' | 'cancelled';

export interface PowerPlatformDiscoveryConfig {
  id: string;
  name: string;
  tenantId: string;
  includeApps: boolean;
  includeFlows: boolean;
  includeConnectors: boolean;
  includeEnvironments: boolean;
  timeout: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PowerPlatformDiscoveryResult {
  id: string;
  configId: string;
  startTime: Date;
  endTime?: Date;
  status: PowerPlatformDiscoveryStatus;
  environments: PowerEnvironment[];
  apps: PowerApp[];
  flows: PowerFlow[];
  connectors: PowerConnector[];
  totalAppsFound: number;
  totalFlowsFound: number;
  errors: PowerPlatformError[];
  warnings: string[];
}

export interface PowerEnvironment {
  id: string;
  name: string;
  displayName: string;
  location: string;
  type: 'production' | 'sandbox' | 'trial' | 'default';
  createdTime: Date;
  createdBy: { id: string; displayName: string; };
  isDefault: boolean;
  securityGroupId?: string;
  databaseType?: string;
  commonDataServiceDatabaseProvisioningState?: string;
  apps: number;
  flows: number;
}

export interface PowerApp {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  environmentId: string;
  owner: { id: string; displayName: string; email: string; };
  createdTime: Date;
  lastModifiedTime: Date;
  appType: 'canvas' | 'model-driven';
  isFeaturedApp: boolean;
  isHeroApp: boolean;
  bypassConsent: boolean;
  sharedGroupsCount: number;
  sharedUsersCount: number;
  appOpenProtocol?: string;
  appOpenUri?: string;
  permissions: AppPermission[];
}

export interface AppPermission {
  principal: { id: string; displayName: string; type: string; };
  roleName: 'CanView' | 'CanViewWithShare' | 'CanEdit';
}

export interface PowerFlow {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  environmentId: string;
  owner: { id: string; displayName: string; email: string; };
  createdTime: Date;
  lastModifiedTime: Date;
  state: 'started' | 'stopped' | 'suspended';
  flowTrigger: string;
  triggerType: 'automated' | 'instant' | 'scheduled';
  suspensionReason?: string;
  connectionReferences: ConnectionReference[];
  runHistory?: { successCount: number; failedCount: number; last30Days: number; };
}

export interface ConnectionReference {
  id: string;
  connectionName: string;
  connectorName: string;
  displayName: string;
}

export interface PowerConnector {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  iconUri?: string;
  tier: 'standard' | 'premium';
  publisher: string;
  isCustomApi: boolean;
  connectionParametersSet?: any;
}

export interface PowerPlatformError {
  timestamp: Date;
  message: string;
  environmentId?: string;
}

export interface PowerPlatformStats {
  totalEnvironments: number;
  totalApps: number;
  totalFlows: number;
  appsByType: Record<string, number>;
  flowsByState: Record<string, number>;
}

export interface PowerPlatformFilterState {
  searchText: string;
  selectedEnvironments: string[];
  selectedAppTypes: string[];
  selectedFlowStates: string[];
}


