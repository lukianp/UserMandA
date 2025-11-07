/**
 * VMware Discovery Type Definitions
 * Maps to VMwareDiscovery.psm1 PowerShell module
 */

export type VMwarePowerState = 'PoweredOn' | 'PoweredOff' | 'Suspended';
export type VMwareConnectionState = 'Connected' | 'Disconnected' | 'NotResponding';
export type VMwareToolsStatus = 'Running' | 'NotRunning' | 'NotInstalled' | 'OutOfDate';
export type HardwareVersion = 'vmx-04' | 'vmx-07' | 'vmx-08' | 'vmx-09' | 'vmx-10' | 'vmx-11' | 'vmx-13' | 'vmx-14' | 'vmx-15' | 'vmx-17' | 'vmx-18' | 'vmx-19' | 'vmx-20' | 'vmx-21';
export type GuestOSFamily = 'Windows' | 'Linux' | 'Unix' | 'MacOS' | 'Other';

// Alias for VirtualMachine to match hook import
export type VMwareVM = VirtualMachine;

export interface VMwareHost {
  id: string;
  name: string;
  version: string;
  build: string;
  manufacturer: string;
  model: string;
  processorType: string;
  connectionState: VMwareConnectionState;
  powerState: 'PoweredOn' | 'PoweredOff' | 'Standby' | 'Unknown';
  status?: string; // Alias for connectionState
  cluster?: string;
  datacenter: string;
  vcenter: string;
  hardware: {
    cpuCores: number;
    cpuThreads: number;
    cpuMhz: number;
    totalCpuMhz: number;
    memoryGB: number;
    numNics: number;
    numHbas: number;
  };
  cpuCores?: number; // Alias for hardware.cpuCores
  memoryGB?: number; // Alias for hardware.memoryGB
  resources: {
    cpuUsageMhz: number;
    cpuUsagePercent: number;
    memoryUsageGB: number;
    memoryUsagePercent: number;
    totalVMs: number;
    runningVMs: number;
  };
  vmCount?: number; // Alias for resources.totalVMs
  storage: {
    datastores: string[];
    totalCapacityGB: number;
    usedCapacityGB: number;
    freeCapacityGB: number;
  };
  networking: {
    vSwitches: VirtualSwitch[];
    portGroups: PortGroup[];
    physicalNics: PhysicalNic[];
  };
  vms: string[];
  maintenanceMode: boolean;
  lockdownMode: 'Disabled' | 'Normal' | 'Strict';
  biosVersion: string;
  bootTime?: string;
  uptime?: number;
  licenseKey?: string;
}

export interface VirtualMachine {
  id: string;
  name: string;
  powerState: VMwarePowerState;
  connectionState: VMwareConnectionState;
  guestOS: string;
  guestOSFamily: GuestOSFamily;
  guestOSFullName: string;
  vmToolsStatus: VMwareToolsStatus;
  toolsStatus?: VMwareToolsStatus; // Alias for vmToolsStatus
  vmToolsVersion?: string;
  hardwareVersion: HardwareVersion;
  host: string;
  cluster?: string;
  datacenter: string;
  vcenter: string;
  resourcePool?: string;
  folder: string;
  hardware: {
    numCPU: number;
    numCoresPerSocket: number;
    memoryGB: number;
    numDisks: number;
    numNics: number;
    videoRamMB: number;
  };
  cpuCount?: number; // Alias for hardware.numCPU
  memoryGB?: number; // Alias for hardware.memoryGB
  resources: {
    cpuUsageMhz: number;
    cpuUsagePercent: number;
    memoryUsageGB: number;
    memoryUsagePercent: number;
    diskUsageGB: number;
    diskProvisionedGB: number;
    diskThinProvisioned: boolean;
  };
  diskGB?: number; // Alias for resources.diskUsageGB
  disks: VirtualDisk[];
  networks: VirtualNetwork[];
  snapshots: Snapshot[];
  snapshotCount?: number; // Alias for snapshots.length
  guestInfo?: {
    hostname?: string;
    ipAddresses: string[];
    macAddresses: string[];
    guestState: 'Running' | 'NotRunning' | 'Unknown';
    guestFullName?: string;
  };
  configuration: {
    annotation?: string;
    template: boolean;
    changeVersion: string;
    cpuHotAddEnabled: boolean;
    memoryHotAddEnabled: boolean;
    bootDelay: number;
    uuid: string;
    instanceUuid: string;
  };
  bootTime?: string;
  uptime?: number;
  createdDate: string;
  modifiedDate: string;
}

export interface VMwareCluster {
  id: string;
  name: string;
  datacenter: string;
  vcenter: string;
  hosts: string[];
  totalHosts: number;
  hostCount?: number; // Alias for totalHosts
  resources: {
    totalCpuMhz: number;
    usedCpuMhz: number;
    totalMemoryGB: number;
    usedMemoryGB: number;
    totalVMs: number;
    runningVMs: number;
  };
  vmCount?: number; // Alias for resources.totalVMs
  totalCpuCores?: number; // Alias for effectiveCpu from configuration
  totalMemoryGB?: number; // Alias for resources.totalMemoryGB
  drsEnabled?: boolean; // Alias for features.drsEnabled
  haEnabled?: boolean; // Alias for features.haEnabled
  features: {
    drsEnabled: boolean;
    drsAutomationLevel?: string;
    haEnabled: boolean;
    haAdmissionControlEnabled?: boolean;
    evtEnabled: boolean;
    vsanEnabled: boolean;
  };
  configuration: {
    numVmotions: number;
    effectiveCpu: number;
    effectiveMemory: number;
  };
}

export interface VMwareDatastore {
  id: string;
  name: string;
  type: 'VMFS' | 'NFS' | 'vSAN' | 'vVOL';
  capacityGB: number;
  freeSpaceGB: number;
  freeGB?: number; // Alias for freeSpaceGB
  usedSpaceGB: number;
  percentFree: number;
  accessible: boolean;
  multipleHostAccess: boolean;
  hosts: string[];
  vms: string[];
  provisionedGB: number;
  uncommittedGB: number;
  url: string;
  datacenter: string;
  vcenter: string;
}

export interface VirtualDisk {
  id: string;
  label: string;
  capacityGB: number;
  diskPath: string;
  datastore: string;
  thinProvisioned: boolean;
  eagerlyScrub?: boolean;
  controllerKey: number;
  unitNumber: number;
}

export interface VirtualNetwork {
  id: string;
  label: string;
  network: string;
  macAddress: string;
  connected: boolean;
  ipAddresses: string[];
  adapterType: string;
}

export interface Snapshot {
  id: string;
  name: string;
  description?: string;
  created: string;
  sizeGB: number;
  quiesced: boolean;
  children: Snapshot[];
}

export interface VirtualSwitch {
  name: string;
  type: 'Standard' | 'Distributed';
  numPorts: number;
  usedPorts: number;
  mtu: number;
  uplinkPorts: string[];
}

export interface PortGroup {
  name: string;
  vlanId: number;
  vSwitch: string;
  activeNics: string[];
  standbyNics: string[];
}

export interface PhysicalNic {
  device: string;
  mac: string;
  driver: string;
  linkSpeed: number;
  fullDuplex: boolean;
}

export interface VMwareStatistics {
  totalvCenters: number;
  totalDatacenters: number;
  totalClusters: number;
  totalHosts: number;
  totalVMs: number;
  totalTemplates: number;
  totalDatastores: number;
  vmsByPowerState: Record<VMwarePowerState, number>;
  vmsByOS: Record<GuestOSFamily, number>;
  hostsInMaintenance: number;
  totalCpuCores: number;
  totalMemoryGB: number;
  totalStorageGB: number;
  usedStorageGB: number;
  cpuUtilizationPercent: number;
  memoryUtilizationPercent: number;
  storageUtilizationPercent: number;
  totalSnapshots: number;
  totalSnapshotSizeGB: number;
  vmsWithOutdatedTools: number;
  vmsWithoutTools: number;
  averageVMsPerHost: number;
  largestVM: {
    name: string;
    memoryGB: number;
    diskGB: number;
  } | null;
}

export interface VMwareSecurityIssue {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: 'Configuration' | 'Patching' | 'Tools' | 'Snapshot' | 'Resource';
  title: string;
  description: string;
  affectedResource: string;
  resourceType: 'vCenter' | 'Cluster' | 'Host' | 'VM' | 'Datastore';
  recommendation: string;
  detectedDate: string;
}

export interface VMwareDiscoveryConfig {
  vCenters: Array<{
    hostname: string;
    port?: number;
    username: string;
    password: string;
  }>;
  includeHosts: boolean;
  includeVMs: boolean;
  includeClusters: boolean;
  includeDatastores: boolean;
  includeNetworking: boolean;
  includeResourcePools: boolean;
  includeSnapshots: boolean;
  includeTemplates: boolean;
  collectPerformanceMetrics: boolean;
  detectSecurityIssues: boolean;
  timeout: number;
  parallelScans: number;
  excludeFolders?: string[];
}

export interface VMwareDiscoveryResult {
  id: string;
  configId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  vCenters: string[];
  datacenters: string[];
  clusters: VMwareCluster[];
  hosts: VMwareHost[];
  vms: VirtualMachine[];
  datastores: VMwareDatastore[];
  statistics: VMwareStatistics;
  securityIssues: VMwareSecurityIssue[];
  errors: Array<{
    vCenter?: string;
    resource?: string;
    message: string;
    timestamp: string;
  }>;
  warnings: Array<{
    vCenter?: string;
    resource?: string;
    message: string;
    timestamp: string;
  }>;
  metadata: {
    totalvCentersScanned: number;
    totalDatacentersDiscovered: number;
    totalClustersDiscovered: number;
    totalHostsDiscovered: number;
    totalVMsDiscovered: number;
    totalDatastoresDiscovered: number;
  };
}

export interface VMwareDiscoveryTemplate {
  id: string;
  name: string;
  description: string;
  config: Omit<VMwareDiscoveryConfig, 'vCenters'>;
  createdDate: string;
  modifiedDate: string;
  createdBy: string;
  isDefault: boolean;
  category: 'Full' | 'Quick' | 'Inventory' | 'Performance' | 'Security' | 'Custom';
}

export interface VMwareExportOptions {
  format: 'CSV' | 'JSON' | 'Excel' | 'XML';
  includeHosts: boolean;
  includeVMs: boolean;
  includeClusters: boolean;
  includeDatastores: boolean;
  includeSnapshots: boolean;
  includeSecurityIssues: boolean;
  includeStatistics: boolean;
  includeErrors: boolean;
  fileNamePattern?: string;
}

export interface HostFilter {
  cluster?: string;
  datacenter?: string;
  connectionState?: VMwareConnectionState[];
  inMaintenance?: boolean;
  minCpuCores?: number;
  minMemoryGB?: number;
  searchText?: string;
}

export interface VMFilter {
  powerState?: VMwarePowerState[];
  guestOSFamily?: GuestOSFamily[];
  host?: string;
  cluster?: string;
  hasSnapshots?: boolean;
  toolsStatus?: VMwareToolsStatus[];
  isTemplate?: boolean;
  minCPU?: number;
  minMemoryGB?: number;
  searchText?: string;
}

export interface DatastoreFilter {
  type?: ('VMFS' | 'NFS' | 'vSAN' | 'vVOL')[];
  minCapacityGB?: number;
  maxUtilization?: number;
  accessible?: boolean;
  searchText?: string;
}

export interface VMwareValidationResult {
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

export interface VMwareProgress {
  phase: 'initializing' | 'connecting_vcenters' | 'discovering_datacenters' | 'discovering_clusters' | 'discovering_hosts' | 'discovering_vms' | 'discovering_datastores' | 'collecting_metrics' | 'analyzing_security' | 'finalizing';
  currentvCenter?: string;
  currentDatacenter?: string;
  currentCluster?: string;
  vCentersCompleted: number;
  totalvCenters: number;
  hostsCompleted: number;
  totalHosts: number;
  vmsCompleted: number;
  totalVMs: number;
  percentComplete: number;
  estimatedTimeRemaining?: number;
  message: string;
}

export interface VMwareSchedule {
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
    onSecurityIssues: boolean;
  };
}

export const DEFAULT_VMWARE_CONFIG: Omit<VMwareDiscoveryConfig, 'vCenters'> = {
  includeHosts: true,
  includeVMs: true,
  includeClusters: true,
  includeDatastores: true,
  includeNetworking: true,
  includeResourcePools: true,
  includeSnapshots: true,
  includeTemplates: false,
  collectPerformanceMetrics: true,
  detectSecurityIssues: true,
  timeout: 300,
  parallelScans: 5,
};

export const VMWARE_TEMPLATES: Omit<VMwareDiscoveryTemplate, 'id' | 'createdDate' | 'modifiedDate' | 'createdBy'>[] = [
  {
    name: 'Full VMware Discovery',
    description: 'Complete VMware infrastructure discovery',
    isDefault: true,
    category: 'Full',
    config: DEFAULT_VMWARE_CONFIG,
  },
  {
    name: 'Quick Inventory',
    description: 'Fast inventory of VMs and hosts',
    isDefault: false,
    category: 'Quick',
    config: {
      ...DEFAULT_VMWARE_CONFIG,
      includeNetworking: false,
      includeResourcePools: false,
      includeSnapshots: false,
      collectPerformanceMetrics: false,
      detectSecurityIssues: false,
      timeout: 120,
    },
  },
  {
    name: 'VM Inventory',
    description: 'Focus on virtual machine inventory',
    isDefault: false,
    category: 'Inventory',
    config: {
      ...DEFAULT_VMWARE_CONFIG,
      includeHosts: false,
      includeDatastores: false,
      includeNetworking: false,
      includeResourcePools: false,
      collectPerformanceMetrics: false,
      detectSecurityIssues: false,
    },
  },
  {
    name: 'Performance Analysis',
    description: 'Collect performance metrics',
    isDefault: false,
    category: 'Performance',
    config: {
      ...DEFAULT_VMWARE_CONFIG,
      includeNetworking: false,
      includeResourcePools: false,
      includeSnapshots: false,
      detectSecurityIssues: false,
    },
  },
  {
    name: 'Security Audit',
    description: 'Security and compliance scanning',
    isDefault: false,
    category: 'Security',
    config: {
      ...DEFAULT_VMWARE_CONFIG,
      includeNetworking: false,
      includeResourcePools: false,
      collectPerformanceMetrics: false,
    },
  },
];
