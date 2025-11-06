/**
 * Web Server Configuration Discovery Types
 */

export type WebServerDiscoveryStatus = 'idle' | 'discovering' | 'completed' | 'failed' | 'cancelled';
export type WebServerType = 'iis' | 'apache' | 'nginx' | 'tomcat' | 'other';

export interface WebServerDiscoveryConfig {
  id: string;
  name: string;
  serverAddresses: string[];
  serverTypes: WebServerType[];
  includeBindings: boolean;
  includeApplicationPools: boolean;
  includeCertificates: boolean;
  timeout: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebServerDiscoveryResult {
  id: string;
  configId: string;
  startTime: Date;
  endTime?: Date;
  status: WebServerDiscoveryStatus;
  servers: WebServer[];
  totalServersFound: number;
  errors: WebServerError[];
  warnings: string[];
}

export interface WebServer {
  id: string;
  name: string;
  serverType: WebServerType;
  version: string;
  operatingSystem: string;
  ipAddress: string;
  sites: WebSite[];
  applicationPools?: ApplicationPool[];
  certificates?: Certificate[];
  totalSites: number;
  status: 'running' | 'stopped' | 'unknown';
}

export interface WebSite {
  id: string;
  name: string;
  physicalPath: string;
  state: 'started' | 'stopped';
  bindings: Binding[];
  applicationPool?: string;
  applications: WebApplication[];
  virtualDirectories: VirtualDirectory[];
  enabledProtocols: string[];
  limits?: {
    maxBandwidth?: number;
    maxConnections?: number;
    connectionTimeout?: number;
  };
  logFile?: {
    directory: string;
    format: string;
    enabled: boolean;
  };
}

export interface Binding {
  protocol: string;
  bindingInformation: string;
  ipAddress: string;
  port: number;
  hostHeader?: string;
  certificateHash?: string;
  certificateStoreName?: string;
  sslFlags?: number;
}

export interface WebApplication {
  path: string;
  physicalPath: string;
  applicationPool?: string;
  enabledProtocols: string[];
  virtualDirectories: VirtualDirectory[];
}

export interface VirtualDirectory {
  path: string;
  physicalPath: string;
  userName?: string;
  logonMethod?: string;
  allowSubDirConfig: boolean;
}

export interface ApplicationPool {
  name: string;
  managedRuntimeVersion: string;
  managedPipelineMode: 'integrated' | 'classic';
  state: 'started' | 'stopped';
  startMode: 'onDemand' | 'alwaysRunning';
  identityType: string;
  enable32BitAppOnWin64: boolean;
  processModel?: {
    identityType: string;
    idleTimeout?: string;
    maxProcesses?: number;
    pingInterval?: string;
    pingingEnabled?: boolean;
  };
  recycling?: {
    periodicRestart?: {
      time?: string;
      memory?: number;
      privateMemory?: number;
    };
  };
}

export interface Certificate {
  thumbprint: string;
  subject: string;
  issuer: string;
  friendlyName?: string;
  notBefore: Date;
  notAfter: Date;
  hasPrivateKey: boolean;
  keyLength: number;
  signatureAlgorithm: string;
  serialNumber: string;
  dnsNames: string[];
  isExpired: boolean;
  daysUntilExpiration: number;
}

export interface WebServerError {
  timestamp: Date;
  serverId: string;
  message: string;
}

export interface WebServerStats {
  totalServers: number;
  serversByType: Record<WebServerType, number>;
  totalSites: number;
  runningServers: number;
  expiringCertificates: number;
}

export interface WebServerFilterState {
  searchText: string;
  selectedServerTypes: WebServerType[];
  selectedStates: string[];
  showOnlyExpiring: boolean;
}
