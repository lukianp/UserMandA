/**
 * Hyper-V Discovery Types
 */

export type HyperVDiscoveryStatus = 'idle' | 'discovering' | 'completed' | 'failed' | 'cancelled';
export type VMState = 'running' | 'off' | 'paused' | 'saved' | 'starting' | 'stopping' | 'saving' | 'pausing' | 'resuming';

export interface HyperVDiscoveryConfig {
  id?: string;
  name?: string;
  hostAddresses: string[];
  includeVMs: boolean;
  includeVirtualSwitches: boolean;
  includeVHDs: boolean;
  includeVirtualNetworks: boolean;
  includeStorage: boolean;
  timeout: number;
  companyName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HyperVDiscoveryResult {
  id: string;
  configId: string;
  startTime: Date;
  endTime?: Date;
  status: HyperVDiscoveryStatus;
  hosts: HyperVHost[];
  totalHostsFound: number;
  totalVMsFound: number;
  errors: HyperVError[];
  warnings: string[];
}

export interface HyperVHost {
  id: string;
  name: string;
  fqdn: string;
  version: string;
  operatingSystem: string;
  virtualMachines: VirtualMachine[];
  virtualSwitches: VirtualSwitch[];
  processorInfo: { logicalProcessorCount: number; cores: number; };
  memoryInfo: { totalMemory: number; availableMemory: number; };
  totalVMs: number;
  runningVMs: number;
}

export interface VirtualMachine {
  id: string;
  name: string;
  state: VMState;
  generation: 1 | 2;
  version: string;
  cpuCount: number;
  memoryAssigned: number;
  memoryMinimum?: number;
  memoryMaximum?: number;
  dynamicMemoryEnabled: boolean;
  uptime?: string;
  status: string;
  networkAdapters: NetworkAdapter[];
  hardDrives: HardDrive[];
  dvdDrives: DVDDrive[];
  checkpoints: Checkpoint[];
  integrationServicesState: Record<string, string>;
  notes?: string;
  creationTime: Date;
}

export interface NetworkAdapter {
  name: string;
  switchName: string;
  macAddress: string;
  ipAddresses: string[];
  connected: boolean;
  vlanId?: number;
}

export interface HardDrive {
  controllerType: string;
  controllerNumber: number;
  controllerLocation: number;
  path: string;
  size?: number;
  maxSize?: number;
  fileSize?: number;
  attached: boolean;
}

export interface DVDDrive {
  controllerNumber: number;
  controllerLocation: number;
  path?: string;
}

export interface Checkpoint {
  id: string;
  name: string;
  snapshotType: 'standard' | 'production';
  creationTime: Date;
  parentCheckpointId?: string;
}

export interface VirtualSwitch {
  id: string;
  name: string;
  switchType: 'external' | 'internal' | 'private';
  notes?: string;
  allowManagementOS: boolean;
  netAdapterInterfaceDescription?: string;
  extensions: SwitchExtension[];
}

export interface SwitchExtension {
  name: string;
  vendor: string;
  version: string;
  enabled: boolean;
}

export interface HyperVError {
  timestamp: Date;
  hostId: string;
  message: string;
}

export interface HyperVStats {
  totalHosts: number;
  totalVMs: number;
  runningVMs: number;
  vmsByState: Record<VMState, number>;
  totalMemoryAllocated: number;
  totalVCPUs: number;
}

export interface HyperVFilterState {
  searchText: string;
  selectedHosts: string[];
  selectedStates: VMState[];
  showOnlyRunning: boolean;
}


