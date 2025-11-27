/**
 * Network Discovery Type Definitions
 * Maps to NetworkDiscovery.psm1 PowerShell module
 */

export type DeviceType = 'Router' | 'Switch' | 'Firewall' | 'Server' | 'Workstation' | 'Printer' | 'AP' | 'IoT' | 'Unknown';
export type DeviceStatus = 'Online' | 'Offline' | 'Unreachable' | 'Degraded';
export type PortStatus = 'Open' | 'Closed' | 'Filtered';
export type Protocol = 'TCP' | 'UDP' | 'ICMP';

export interface NetworkDevice {
  id: string;
  hostname: string;
  ipAddress: string;
  macAddress: string;
  type: DeviceType;
  status: DeviceStatus;
  manufacturer?: string;
  model?: string;
  operatingSystem?: string;
  osVersion?: string;
  subnet: string;
  gateway?: string;
  dnsServers: string[];
  openPorts: NetworkPort[];
  services: NetworkService[];
  responseTime: number;
  lastSeen: string;
  firstSeen: string;
  uptime?: number;
  description?: string;
  location?: string;
  managementUrl?: string;
  snmpEnabled: boolean;
  vulnerabilities: NetworkVulnerability[];
}

export interface NetworkPort {
  id: string;
  deviceId: string;
  portNumber: number;
  protocol: Protocol;
  status: PortStatus;
  service?: string;
  version?: string;
  banner?: string;
  isSecure: boolean;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low' | 'None';
}

export interface NetworkService {
  id: string;
  deviceId: string;
  name: string;
  port: number;
  protocol: Protocol;
  version?: string;
  vendor?: string;
  isRunning: boolean;
  startMode?: 'Auto' | 'Manual' | 'Disabled';
  description?: string;
}

export interface NetworkSubnet {
  id: string;
  cidr: string;
  network: string;
  mask: string;
  gateway?: string;
  vlan?: number;
  vlanName?: string;
  totalHosts: number;
  usedHosts: number;
  availableHosts: number;
  utilizationPercent: number;
  devices: string[];
  dhcpEnabled: boolean;
  dhcpServer?: string;
  dnsServers: string[];
  description?: string;
  location?: string;
}

export interface NetworkTopology {
  id: string;
  discoveryId: string;
  nodes: TopologyNode[];
  links: TopologyLink[];
  subnets: string[];
  gateways: string[];
  coreDevices: string[];
  edgeDevices: string[];
  isolatedDevices: string[];
}

export interface TopologyNode {
  id: string;
  deviceId: string;
  label: string;
  type: DeviceType;
  ipAddress: string;
  subnet: string;
  isCore: boolean;
  isGateway: boolean;
  connectedDevices: number;
  x?: number;
  y?: number;
}

export interface TopologyLink {
  id: string;
  source: string;
  target: string;
  type: 'Direct' | 'Gateway' | 'Virtual';
  bandwidth?: number;
  latency?: number;
  protocol?: string;
}

export interface NetworkVulnerability {
  id: string;
  deviceId: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: 'Configuration' | 'Service' | 'Port' | 'Protocol' | 'Encryption';
  title: string;
  description: string;
  cveId?: string;
  affectedService?: string;
  affectedPort?: number;
  recommendation: string;
  detectedDate: string;
}

export interface NetworkStatistics {
  totalDevices: number;
  devicesByType: Record<DeviceType, number>;
  devicesByStatus: Record<DeviceStatus, number>;
  totalSubnets: number;
  totalOpenPorts: number;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  mediumVulnerabilities: number;
  lowVulnerabilities: number;
  averageResponseTime: number;
  subnetUtilization: {
    average: number;
    highest: {
      subnet: string;
      percent: number;
    } | null;
  };
  topServices: Array<{
    name: string;
    count: number;
  }>;
  topPorts: Array<{
    port: number;
    protocol: Protocol;
    count: number;
  }>;
}

export interface NetworkDiscoveryConfig {
  subnets: string[];
  scanType: 'Quick' | 'Standard' | 'Comprehensive';
  includePingSweep: boolean;
  includePortScan: boolean;
  portScanRange?: string;
  commonPortsOnly: boolean;
  includeServiceDetection: boolean;
  includeOsDetection: boolean;
  includeTopologyMapping: boolean;
  includeVulnerabilityDetection: boolean;
  timeout: number;
  maxThreads: number;
  retryAttempts: number;
  excludeHosts?: string[];
  credentials?: {
    snmpCommunity?: string;
    wmiUsername?: string;
    wmiPassword?: string;
    sshUsername?: string;
    sshPassword?: string;
  };
}

export interface NetworkDiscoveryResult {
  id: string;
  configId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  subnets: NetworkSubnet[];
  devices: NetworkDevice[];
  ports: NetworkPort[];
  services: NetworkService[];
  topology: NetworkTopology | null;
  vulnerabilities: NetworkVulnerability[];
  statistics: NetworkStatistics;
  errors: Array<{
    subnet?: string;
    host?: string;
    message: string;
    timestamp: string;
  }>;
  warnings: Array<{
    subnet?: string;
    host?: string;
    message: string;
    timestamp: string;
  }>;
  metadata: {
    totalSubnetsScanned: number;
    totalHostsScanned: number;
    totalPortsScanned: number;
    totalServicesDetected: number;
    totalVulnerabilitiesFound: number;
  };
}

export interface NetworkDiscoveryTemplate {
  id: string;
  name: string;
  description: string;
  config: NetworkDiscoveryConfig;
  createdDate: string;
  modifiedDate: string;
  createdBy: string;
  isDefault: boolean;
  category: 'Full' | 'Quick' | 'Security' | 'Topology' | 'Custom';
}

export interface NetworkExportOptions {
  format: 'CSV' | 'JSON' | 'Excel' | 'XML' | 'NMAP';
  includeDevices: boolean;
  includeSubnets: boolean;
  includePorts: boolean;
  includeServices: boolean;
  includeTopology: boolean;
  includeVulnerabilities: boolean;
  includeStatistics: boolean;
  includeErrors: boolean;
  fileNamePattern?: string;
}

export interface DeviceFilter {
  type?: DeviceType[];
  status?: DeviceStatus[];
  subnet?: string;
  hasVulnerabilities?: boolean;
  manufacturer?: string;
  searchText?: string;
}

export interface SubnetFilter {
  minUtilization?: number;
  maxUtilization?: number;
  hasDhcp?: boolean;
  vlan?: number;
  searchText?: string;
}

export interface PortFilter {
  status?: PortStatus[];
  protocol?: Protocol[];
  portRange?: {
    min: number;
    max: number;
  };
  riskLevel?: ('Critical' | 'High' | 'Medium' | 'Low' | 'None')[];
  searchText?: string;
}

export interface NetworkValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
  }>;
}

export interface NetworkProgress {
  phase: 'initializing' | 'ping_sweep' | 'port_scanning' | 'service_detection' | 'os_detection' | 'topology_mapping' | 'vulnerability_detection' | 'finalizing';
  currentSubnet?: string;
  currentHost?: string;
  subnetsCompleted: number;
  totalSubnets: number;
  hostsCompleted: number;
  totalHosts: number;
  portsCompleted: number;
  totalPorts: number;
  percentComplete: number;
  estimatedTimeRemaining?: number;
  message: string;
}

export interface NetworkSchedule {
  id: string;
  name: string;
  configId: string;
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  schedule: string;
  nextRun?: string;
  lastRun?: string;
  lastStatus?: 'success' | 'failed' | 'cancelled';
  notifications: {
    email?: string[];
    onSuccess: boolean;
    onFailure: boolean;
    onVulnerabilitiesDetected: boolean;
  };
}

export const DEFAULT_NETWORK_CONFIG: NetworkDiscoveryConfig = {
  subnets: [],
  scanType: 'Standard',
  includePingSweep: true,
  includePortScan: true,
  commonPortsOnly: true,
  includeServiceDetection: true,
  includeOsDetection: true,
  includeTopologyMapping: true,
  includeVulnerabilityDetection: true,
  timeout: 180,
  maxThreads: 50,
  retryAttempts: 2,
};

export const NETWORK_TEMPLATES: Omit<NetworkDiscoveryTemplate, 'id' | 'createdDate' | 'modifiedDate' | 'createdBy'>[] = [
  {
    name: 'Full Network Scan',
    description: 'Comprehensive network discovery with all features',
    isDefault: true,
    category: 'Full',
    config: DEFAULT_NETWORK_CONFIG,
  },
  {
    name: 'Quick Scan',
    description: 'Fast network scan with basic device detection',
    isDefault: false,
    category: 'Quick',
    config: {
      ...DEFAULT_NETWORK_CONFIG,
      scanType: 'Quick',
      includePortScan: false,
      includeServiceDetection: false,
      includeOsDetection: false,
      includeTopologyMapping: false,
      includeVulnerabilityDetection: false,
      timeout: 60,
    },
  },
  {
    name: 'Security Scan',
    description: 'Focus on vulnerability detection and security analysis',
    isDefault: false,
    category: 'Security',
    config: {
      ...DEFAULT_NETWORK_CONFIG,
      scanType: 'Comprehensive',
      commonPortsOnly: false,
      portScanRange: '1-65535',
      includeTopologyMapping: false,
    },
  },
  {
    name: 'Topology Mapping',
    description: 'Map network topology and device relationships',
    isDefault: false,
    category: 'Topology',
    config: {
      ...DEFAULT_NETWORK_CONFIG,
      includePortScan: false,
      includeVulnerabilityDetection: false,
      timeout: 120,
    },
  },
];

export const COMMON_PORTS = [
  { port: 21, protocol: 'TCP' as Protocol, service: 'FTP' },
  { port: 22, protocol: 'TCP' as Protocol, service: 'SSH' },
  { port: 23, protocol: 'TCP' as Protocol, service: 'Telnet' },
  { port: 25, protocol: 'TCP' as Protocol, service: 'SMTP' },
  { port: 53, protocol: 'UDP' as Protocol, service: 'DNS' },
  { port: 80, protocol: 'TCP' as Protocol, service: 'HTTP' },
  { port: 110, protocol: 'TCP' as Protocol, service: 'POP3' },
  { port: 135, protocol: 'TCP' as Protocol, service: 'RPC' },
  { port: 139, protocol: 'TCP' as Protocol, service: 'NetBIOS' },
  { port: 143, protocol: 'TCP' as Protocol, service: 'IMAP' },
  { port: 443, protocol: 'TCP' as Protocol, service: 'HTTPS' },
  { port: 445, protocol: 'TCP' as Protocol, service: 'SMB' },
  { port: 1433, protocol: 'TCP' as Protocol, service: 'MSSQL' },
  { port: 3306, protocol: 'TCP' as Protocol, service: 'MySQL' },
  { port: 3389, protocol: 'TCP' as Protocol, service: 'RDP' },
  { port: 5432, protocol: 'TCP' as Protocol, service: 'PostgreSQL' },
  { port: 8080, protocol: 'TCP' as Protocol, service: 'HTTP-Alt' },
];
