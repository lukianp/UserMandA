/**
 * Network infrastructure device data model from CSV files
 */
export interface NetworkDeviceData {
  deviceName: string;
  deviceType: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  ipAddress: string;
  macAddress: string;
  subnet: string;
  vlan: string;
  location: string;
  building: string;
  floor: string;
  room: string;
  rack: string;
  status: string;
  firmware: string;
  configVersion: string;
  portCount: number;
  portsUsed: number;
  uptime: string;
  lastScan: Date | null;
  lastSeen: Date | null;
  installDate: Date | null;
  warrantyExpiry: Date | null;
  typeIcon: string;
  statusIcon: string;
  portUtilization: string;
  portUtilizationColor: string;
  isWarrantyExpiring: boolean;
  isWarrantyExpired: boolean;
  warrantyStatus: string;
}
