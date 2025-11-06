import { useState, useEffect, useCallback } from 'react';

/**
 * Network infrastructure data model
 */
export interface NetworkDeviceData {
  id: string;
  name: string;
  type: 'Router' | 'Switch' | 'Firewall' | 'Load Balancer' | 'Wireless AP' | 'Other';
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  ipAddress?: string;
  macAddress?: string;
  firmwareVersion?: string;
  location?: string;
  vlan?: number;
  subnet?: string;
  ports?: number;
  portsInUse?: number;
  uptime?: string;
  status: 'Online' | 'Offline' | 'Warning' | 'Critical';
  lastSeen?: string;
  managementIP?: string;
  bandwidth?: string;
  utilization?: number;
}

/**
 * Network topology node
 */
export interface NetworkTopologyNode {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  connections: string[];
}

/**
 * Network statistics
 */
interface NetworkStatistics {
  totalDevices: number;
  routers: number;
  switches: number;
  firewalls: number;
  wirelessAPs: number;
  onlineDevices: number;
  offlineDevices: number;
  avgUtilization: number;
  totalPorts: number;
  portsInUse: number;
}

/**
 * Custom hook for network infrastructure with Logic Engine integration
 */
export const useNetworkInfrastructureLogic = () => {
  const [devices, setDevices] = useState<NetworkDeviceData[]>([]);
  const [topology, setTopology] = useState<NetworkTopologyNode[]>([]);
  const [statistics, setStatistics] = useState<NetworkStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  /**
   * Load network infrastructure data
   */
  const loadNetworkData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Query Logic Engine for network statistics
      const statsResult = await window.electronAPI.logicEngine.getStatistics();

      if (statsResult.success && statsResult.data?.statistics) {
        console.info('[NetworkInfrastructure] Logic Engine loaded, generating network data');

        // TODO: Extract real network device data when Logic Engine provides it
        // For now, generate mock network infrastructure data
        const mockData = generateMockNetworkData();
        setDevices(mockData.devices);
        setTopology(mockData.topology);
        setStatistics(mockData.statistics);
      } else {
        console.warn('[NetworkInfrastructure] Logic Engine not loaded, using mock data');
        const mockData = generateMockNetworkData();
        setDevices(mockData.devices);
        setTopology(mockData.topology);
        setStatistics(mockData.statistics);
      }
    } catch (err: any) {
      const errorMsg = `Failed to load network data: ${err.message}`;
      console.error('[NetworkInfrastructure] Error:', err);
      setError(errorMsg);

      // Fallback to mock data
      const mockData = generateMockNetworkData();
      setDevices(mockData.devices);
      setTopology(mockData.topology);
      setStatistics(mockData.statistics);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNetworkData();
  }, [loadNetworkData]);

  /**
   * Filter devices
   */
  const filteredDevices = useCallback(() => {
    return devices.filter(device => {
      const matchesSearch = !searchText ||
        (device.name ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
        device.ipAddress?.toLowerCase().includes(searchText.toLowerCase()) ||
        device.manufacturer?.toLowerCase().includes(searchText.toLowerCase());

      const matchesType = typeFilter === 'All' || device.type === typeFilter;
      const matchesStatus = statusFilter === 'All' || device.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [devices, searchText, typeFilter, statusFilter]);

  /**
   * Export devices to CSV
   */
  const exportDevices = useCallback(async () => {
    try {
      const filtered = filteredDevices();
      const csv = convertDevicesToCSV(filtered);

      await window.electronAPI.invoke('export-data', {
        filename: `network-infrastructure-${new Date().toISOString().split('T')[0]}.csv`,
        data: csv,
      });

      console.info('[NetworkInfrastructure] Exported data successfully');
    } catch (err: any) {
      console.error('[NetworkInfrastructure] Export failed:', err);
      setError(`Export failed: ${err.message}`);
    }
  }, [filteredDevices]);

  return {
    devices: filteredDevices(),
    topology,
    statistics,
    isLoading,
    error,
    searchText,
    setSearchText,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    refreshData: loadNetworkData,
    exportDevices,
  };
};

/**
 * Generate mock network infrastructure data
 */
function generateMockNetworkData() {
  const devices: NetworkDeviceData[] = [];
  const topology: NetworkTopologyNode[] = [];

  // Core router
  devices.push({
    id: 'net-001',
    name: 'CORE-ROUTER-01',
    type: 'Router',
    manufacturer: 'Cisco',
    model: 'ISR 4451',
    serialNumber: 'SN001234567',
    ipAddress: '10.0.0.1',
    macAddress: '00:1A:2B:3C:4D:5E',
    firmwareVersion: '16.12.04',
    location: 'Data Center - Rack A01',
    subnet: '10.0.0.0/24',
    ports: 24,
    portsInUse: 18,
    uptime: '98 days',
    status: 'Online',
    lastSeen: new Date().toISOString(),
    managementIP: '10.0.0.1',
    bandwidth: '10 Gbps',
    utilization: 45,
  });

  // Distribution switches
  for (let i = 0; i < 3; i++) {
    devices.push({
      id: `net-00${i + 2}`,
      name: `DIST-SWITCH-0${i + 1}`,
      type: 'Switch',
      manufacturer: 'Cisco',
      model: 'Catalyst 9300',
      serialNumber: `SN00${i + 2}000000`,
      ipAddress: `10.0.${i + 1}.1`,
      macAddress: `00:1A:2B:3C:${(i + 1).toString(16)}:00`,
      firmwareVersion: '17.6.3',
      location: `Building ${i + 1} - IDF`,
      subnet: `10.0.${i + 1}.0/24`,
      ports: 48,
      portsInUse: 32 + i * 3,
      uptime: `${87 - i * 5} days`,
      status: i === 2 ? 'Warning' : 'Online',
      lastSeen: new Date().toISOString(),
      managementIP: `10.0.${i + 1}.1`,
      bandwidth: '1 Gbps',
      utilization: 55 + i * 10,
    });
  }

  // Firewalls
  devices.push({
    id: 'net-005',
    name: 'FW-PRIMARY',
    type: 'Firewall',
    manufacturer: 'Palo Alto',
    model: 'PA-5250',
    serialNumber: 'SN005000000',
    ipAddress: '192.168.254.1',
    firmwareVersion: '10.1.0',
    location: 'Data Center - Rack A02',
    ports: 16,
    portsInUse: 8,
    uptime: '156 days',
    status: 'Online',
    lastSeen: new Date().toISOString(),
    managementIP: '10.0.0.254',
    bandwidth: '10 Gbps',
    utilization: 38,
  });

  // Wireless APs
  for (let i = 0; i < 5; i++) {
    devices.push({
      id: `net-0${10 + i}`,
      name: `WAP-FLOOR-${i + 1}`,
      type: 'Wireless AP',
      manufacturer: 'Aruba',
      model: 'AP-515',
      serialNumber: `SN0${10 + i}000000`,
      ipAddress: `10.0.10.${10 + i}`,
      macAddress: `00:1A:2B:3C:${(10 + i).toString(16)}:00`,
      firmwareVersion: '8.10.0.0',
      location: `Floor ${i + 1}`,
      vlan: 10,
      uptime: `${45 + i * 3} days`,
      status: i === 3 ? 'Offline' : 'Online',
      lastSeen: new Date(Date.now() - (i === 3 ? 86400000 : 0)).toISOString(),
      bandwidth: 'Wi-Fi 6',
      utilization: 25 + i * 5,
    });
  }

  // Calculate statistics
  const statistics: NetworkStatistics = {
    totalDevices: devices.length,
    routers: devices.filter(d => d.type === 'Router').length,
    switches: devices.filter(d => d.type === 'Switch').length,
    firewalls: devices.filter(d => d.type === 'Firewall').length,
    wirelessAPs: devices.filter(d => d.type === 'Wireless AP').length,
    onlineDevices: devices.filter(d => d.status === 'Online').length,
    offlineDevices: devices.filter(d => d.status === 'Offline').length,
    avgUtilization: devices.reduce((sum, d) => sum + (d.utilization || 0), 0) / devices.length,
    totalPorts: devices.reduce((sum, d) => sum + (d.ports || 0), 0),
    portsInUse: devices.reduce((sum, d) => sum + (d.portsInUse || 0), 0),
  };

  // Build topology
  topology.push(
    { id: 'net-001', label: 'CORE-ROUTER-01', type: 'Router', x: 400, y: 50, connections: ['net-002', 'net-003', 'net-004', 'net-005'] },
    { id: 'net-002', label: 'DIST-SWITCH-01', type: 'Switch', x: 200, y: 200, connections: ['net-010', 'net-011'] },
    { id: 'net-003', label: 'DIST-SWITCH-02', type: 'Switch', x: 400, y: 200, connections: ['net-012', 'net-013'] },
    { id: 'net-004', label: 'DIST-SWITCH-03', type: 'Switch', x: 600, y: 200, connections: ['net-014'] },
    { id: 'net-005', label: 'FW-PRIMARY', type: 'Firewall', x: 400, y: 350, connections: [] },
  );

  return { devices, topology, statistics };
}

/**
 * Convert devices to CSV
 */
function convertDevicesToCSV(devices: NetworkDeviceData[]): string {
  const headers = [
    'ID', 'Name', 'Type', 'Manufacturer', 'Model', 'Serial Number', 'IP Address',
    'MAC Address', 'Firmware Version', 'Location', 'VLAN', 'Subnet', 'Ports',
    'Ports In Use', 'Uptime', 'Status', 'Last Seen', 'Management IP',
    'Bandwidth', 'Utilization %'
  ];

  const rows = devices.map(d => [
    d.id, d.name, d.type, d.manufacturer || '', d.model || '', d.serialNumber || '',
    d.ipAddress || '', d.macAddress || '', d.firmwareVersion || '', d.location || '',
    d.vlan?.toString() || '', d.subnet || '', d.ports?.toString() || '',
    d.portsInUse?.toString() || '', d.uptime || '', d.status, d.lastSeen || '',
    d.managementIP || '', d.bandwidth || '', d.utilization?.toString() || ''
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}
