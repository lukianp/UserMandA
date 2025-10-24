import { useState, useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';

import type {
  NetworkDiscoveryConfig,
  NetworkDiscoveryResult,
  NetworkDevice,
  NetworkSubnet,
  NetworkPort,
  NetworkDiscoveryTemplate,
} from '../types/models/network';

export interface NetworkDiscoveryLogicState {
  config: NetworkDiscoveryConfig;
  result: NetworkDiscoveryResult | null;
  isLoading: boolean;
  progress: number;
  error: string | null;
  searchText: string;
  activeTab: 'overview' | 'devices' | 'subnets' | 'ports';
  templates: NetworkDiscoveryTemplate[];
}

export const useNetworkDiscoveryLogic = () => {
  const [config, setConfig] = useState<NetworkDiscoveryConfig>({
    subnets: ['192.168.1.0/24'],
    scanType: 'Standard',
    includePingSweep: true,
    includePortScan: true,
    portScanRange: '1-1024',
    commonPortsOnly: false,
    includeServiceDetection: true,
    includeOsDetection: false,
    includeTopologyMapping: false,
    includeVulnerabilityDetection: false,
    timeout: 300,
    maxThreads: 50,
    retryAttempts: 2,
  });

  const [result, setResult] = useState<NetworkDiscoveryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'subnets' | 'ports'>('overview');

  const templates: NetworkDiscoveryTemplate[] = [
    {
      id: 'quick-scan',
      name: 'Quick Network Scan',
      description: 'Fast scan of active devices on primary subnet',
      config: {
        subnets: ['192.168.1.0/24'],
        scanType: 'Quick',
        includePingSweep: true,
        includePortScan: false,
        commonPortsOnly: true,
        includeServiceDetection: false,
        includeOsDetection: false,
        includeTopologyMapping: false,
        includeVulnerabilityDetection: false,
        timeout: 60,
        maxThreads: 50,
        retryAttempts: 2,
      },
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      createdBy: 'system',
      isDefault: false,
      category: 'Quick',
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Network Discovery',
      description: 'Full network discovery with topology and vulnerability scanning',
      config: {
        subnets: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'],
        scanType: 'Comprehensive',
        includePingSweep: true,
        includePortScan: true,
        commonPortsOnly: false,
        includeServiceDetection: true,
        includeOsDetection: true,
        includeTopologyMapping: true,
        includeVulnerabilityDetection: true,
        timeout: 3600,
        maxThreads: 100,
        retryAttempts: 3,
      },
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      createdBy: 'system',
      isDefault: true,
      category: 'Full',
    },
    {
      id: 'security-audit',
      name: 'Security Audit Scan',
      description: 'Security-focused scan with port and vulnerability analysis',
      config: {
        subnets: ['192.168.1.0/24'],
        scanType: 'Comprehensive',
        includePingSweep: true,
        includePortScan: true,
        commonPortsOnly: false,
        includeServiceDetection: true,
        includeOsDetection: false,
        includeTopologyMapping: false,
        includeVulnerabilityDetection: true,
        timeout: 1800,
        maxThreads: 75,
        retryAttempts: 2,
      },
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      createdBy: 'system',
      isDefault: false,
      category: 'Security',
    },
  ];

  const handleStartDiscovery = async () => {
    setIsLoading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 15, 95));
      }, 500);

      const scriptResult = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/NetworkDiscovery.psm1',
        functionName: 'Invoke-NetworkDiscovery',
        parameters: {
          IPRanges: config.subnets,
          IncludeDevices: config.includePingSweep,
          IncludeSubnets: true,
          IncludePortScan: config.includePortScan,
          IncludeTopology: config.includeTopologyMapping,
          IncludeVulnerabilityScan: config.includeVulnerabilityDetection,
          PortRange: config.portScanRange || '1-1024',
          Timeout: config.timeout,
        },
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (scriptResult.success) {
        setResult(scriptResult.data as NetworkDiscoveryResult);
      } else {
        setError(scriptResult.error || 'Network discovery failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyTemplate = (template: NetworkDiscoveryTemplate) => {
    setConfig((prev) => ({
      ...prev,
      name: template.name,
      parameters: { ...template.config },
    }));
  };

  const handleExport = async () => {
    if (!result) return;

    try {
      const csvContent = generateCSV(result);
      await window.electronAPI.writeFile(
        `NetworkDiscovery_${new Date().toISOString().split('T')[0]}.csv`,
        csvContent
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  const generateCSV = (data: NetworkDiscoveryResult): string => {
    const headers = ['Type', 'Name', 'IP Address', 'Status', 'Details'];
    const rows: string[][] = [];

    data.devices.forEach((device) => {
      rows.push([
        'Device',
        device.hostname,
        device.ipAddress,
        device.status,
        `${device.type} - ${device.manufacturer || 'Unknown'} ${device.model || ''}`,
      ]);
    });

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  };

  // Filter data based on search text
  const filteredDevices = useMemo(() => {
    if (!result) return [];
    const devices = result?.devices ?? [];
    if (!searchText) return devices;

    const search = searchText.toLowerCase();
    return devices.filter(
      (device) =>
        device.hostname.toLowerCase().includes(search) ||
        device.ipAddress.toLowerCase().includes(search) ||
        device.type.toLowerCase().includes(search)
    );
  }, [result, searchText]);

  const filteredSubnets = useMemo(() => {
    if (!result) return [];
    const subnets = result?.subnets ?? [];
    if (!searchText) return subnets;

    const search = searchText.toLowerCase();
    return subnets.filter(
      (subnet) =>
        subnet.network.toLowerCase().includes(search) ||
        subnet.gateway?.toLowerCase().includes(search)
    );
  }, [result, searchText]);

  const filteredPorts = useMemo(() => {
    if (!result) return [];
    const ports = result?.ports ?? [];
    if (!searchText) return ports;

    const search = searchText.toLowerCase();
    return ports.filter(
      (port: NetworkPort) =>
        port.portNumber.toString().includes(search) ||
        port.service?.toLowerCase().includes(search) ||
        port.protocol.toLowerCase().includes(search)
    );
  }, [result, searchText]);

  // AG Grid column definitions
  const deviceColumns: ColDef<NetworkDevice>[] = [
    { field: 'hostname', headerName: 'Hostname', sortable: true, filter: true, flex: 1.5 },
    { field: 'ipAddress', headerName: 'IP Address', sortable: true, filter: true, flex: 1 },
    { field: 'type', headerName: 'Type', sortable: true, filter: true, flex: 1 },
    { field: 'status', headerName: 'Status', sortable: true, filter: true, flex: 0.8 },
    { field: 'operatingSystem', headerName: 'Operating System', sortable: true, filter: true, flex: 1.2 },
    { field: 'manufacturer', headerName: 'Vendor', sortable: true, filter: true, flex: 1 },
    { field: 'model', headerName: 'Model', sortable: true, filter: true, flex: 1 },
    { field: 'macAddress', headerName: 'MAC Address', sortable: true, filter: true, flex: 1.2 },
  ];

  const subnetColumns: ColDef<NetworkSubnet>[] = [
    { field: 'network', headerName: 'Network', sortable: true, filter: true, flex: 1.5 },
    { field: 'mask', headerName: 'Subnet Mask', sortable: true, filter: true, flex: 1 },
    { field: 'gateway', headerName: 'Gateway', sortable: true, filter: true, flex: 1 },
    { field: 'dhcpServer', headerName: 'DHCP Server', sortable: true, filter: true, flex: 1 },
    { field: 'totalHosts', headerName: 'Devices', sortable: true, filter: true, flex: 0.8 },
    { field: 'vlan', headerName: 'VLAN', sortable: true, filter: true, flex: 0.8 },
  ];

  const portColumns: ColDef<NetworkPort>[] = [
    { field: 'deviceId', headerName: 'IP Address', sortable: true, filter: true, flex: 1.2 },
    { field: 'portNumber', headerName: 'Port', sortable: true, filter: true, flex: 0.8 },
    { field: 'protocol', headerName: 'Protocol', sortable: true, filter: true, flex: 0.8 },
    { field: 'service', headerName: 'Service', sortable: true, filter: true, flex: 1 },
    { field: 'version', headerName: 'Version', sortable: true, filter: true, flex: 1 },
    { field: 'status', headerName: 'State', sortable: true, filter: true, flex: 0.8 },
    { field: 'riskLevel', headerName: 'Risk', sortable: true, filter: true, flex: 0.8 },
  ];

  // Statistics
  const stats = useMemo(() => {
    if (!result) return null;

    const devices = result?.devices ?? [];
    const onlineDevices = devices.filter((d) => d.status === 'Online').length;
    const totalDevices = devices.length;
    const subnets = result?.subnets?.length ?? 0;
    const openPorts = result?.ports?.length ?? 0;
    const vulnerabilities = result?.vulnerabilities?.length ?? 0;
    const criticalVulns = (result?.vulnerabilities ?? []).filter((v) => v.severity === 'Critical').length;
    const highVulns = (result?.vulnerabilities ?? []).filter((v) => v.severity === 'High').length;

    return {
      totalDevices,
      onlineDevices,
      subnets,
      openPorts,
      vulnerabilities,
      criticalVulns,
      highVulns,
    };
  }, [result]);

  return {
    config,
    setConfig,
    result,
    isLoading,
    progress,
    error,
    searchText,
    setSearchText,
    activeTab,
    setActiveTab,
    templates,
    handleStartDiscovery,
    handleApplyTemplate,
    handleExport,
    filteredDevices,
    filteredSubnets,
    filteredPorts,
    deviceColumns,
    subnetColumns,
    portColumns,
    stats,
  };
};
