import { useState, useEffect, useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';
import type {
  NetworkDiscoveryConfig,
  NetworkDiscoveryResult,
  NetworkDevice,
  NetworkSubnet,
  NetworkPort,
  NetworkTemplate,
} from '../types/models/network';

export interface NetworkDiscoveryLogicState {
  config: NetworkDiscoveryConfig;
  result: NetworkDiscoveryResult | null;
  isLoading: boolean;
  progress: number;
  error: string | null;
  searchText: string;
  activeTab: 'overview' | 'devices' | 'subnets' | 'ports';
  templates: NetworkTemplate[];
}

export const useNetworkDiscoveryLogic = () => {
  const [config, setConfig] = useState<NetworkDiscoveryConfig>({
    id: '',
    name: 'Network Discovery',
    type: 'network',
    parameters: {
      ipRanges: ['192.168.1.0/24'],
      includeDevices: true,
      includeSubnets: true,
      includePortScan: true,
      includeTopology: false,
      includeVulnerabilityScan: false,
      portRange: '1-1024',
      timeout: 300,
    },
  });

  const [result, setResult] = useState<NetworkDiscoveryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'subnets' | 'ports'>('overview');

  const templates: NetworkTemplate[] = [
    {
      id: 'quick-scan',
      name: 'Quick Network Scan',
      description: 'Fast scan of active devices on primary subnet',
      config: {
        ipRanges: ['192.168.1.0/24'],
        includeDevices: true,
        includeSubnets: true,
        includePortScan: false,
        includeTopology: false,
        includeVulnerabilityScan: false,
        portRange: '1-1024',
        timeout: 60,
      },
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Network Discovery',
      description: 'Full network discovery with topology and vulnerability scanning',
      config: {
        ipRanges: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'],
        includeDevices: true,
        includeSubnets: true,
        includePortScan: true,
        includeTopology: true,
        includeVulnerabilityScan: true,
        portRange: '1-65535',
        timeout: 3600,
      },
    },
    {
      id: 'security-audit',
      name: 'Security Audit Scan',
      description: 'Security-focused scan with port and vulnerability analysis',
      config: {
        ipRanges: ['192.168.1.0/24'],
        includeDevices: true,
        includeSubnets: false,
        includePortScan: true,
        includeTopology: false,
        includeVulnerabilityScan: true,
        portRange: '1-65535',
        timeout: 1800,
      },
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
          IPRanges: config.parameters.ipRanges,
          IncludeDevices: config.parameters.includeDevices,
          IncludeSubnets: config.parameters.includeSubnets,
          IncludePortScan: config.parameters.includePortScan,
          IncludeTopology: config.parameters.includeTopology,
          IncludeVulnerabilityScan: config.parameters.includeVulnerabilityScan,
          PortRange: config.parameters.portRange,
          Timeout: config.parameters.timeout,
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

  const handleApplyTemplate = (template: NetworkTemplate) => {
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
        `${device.deviceType} - ${device.manufacturer || 'Unknown'} ${device.model || ''}`,
      ]);
    });

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  };

  // Filter data based on search text
  const filteredDevices = useMemo(() => {
    if (!result) return [];
    if (!searchText) return result.devices;

    const search = searchText.toLowerCase();
    return result.devices.filter(
      (device) =>
        device.hostname.toLowerCase().includes(search) ||
        device.ipAddress.toLowerCase().includes(search) ||
        device.deviceType.toLowerCase().includes(search)
    );
  }, [result, searchText]);

  const filteredSubnets = useMemo(() => {
    if (!result) return [];
    if (!searchText) return result.subnets;

    const search = searchText.toLowerCase();
    return result.subnets.filter(
      (subnet) =>
        subnet.network.toLowerCase().includes(search) ||
        subnet.gateway?.toLowerCase().includes(search)
    );
  }, [result, searchText]);

  const filteredPorts = useMemo(() => {
    if (!result) return [];
    if (!searchText) return result.openPorts;

    const search = searchText.toLowerCase();
    return result.openPorts.filter(
      (port) =>
        port.port.toString().includes(search) ||
        port.service?.toLowerCase().includes(search) ||
        port.protocol.toLowerCase().includes(search)
    );
  }, [result, searchText]);

  // AG Grid column definitions
  const deviceColumns: ColDef<NetworkDevice>[] = [
    { field: 'hostname', headerName: 'Hostname', sortable: true, filter: true, flex: 1.5 },
    { field: 'ipAddress', headerName: 'IP Address', sortable: true, filter: true, flex: 1 },
    { field: 'deviceType', headerName: 'Type', sortable: true, filter: true, flex: 1 },
    { field: 'status', headerName: 'Status', sortable: true, filter: true, flex: 0.8 },
    { field: 'operatingSystem', headerName: 'Operating System', sortable: true, filter: true, flex: 1.2 },
    { field: 'manufacturer', headerName: 'Vendor', sortable: true, filter: true, flex: 1 },
    { field: 'model', headerName: 'Model', sortable: true, filter: true, flex: 1 },
    { field: 'macAddress', headerName: 'MAC Address', sortable: true, filter: true, flex: 1.2 },
  ];

  const subnetColumns: ColDef<NetworkSubnet>[] = [
    { field: 'network', headerName: 'Network', sortable: true, filter: true, flex: 1.5 },
    { field: 'subnetMask', headerName: 'Subnet Mask', sortable: true, filter: true, flex: 1 },
    { field: 'gateway', headerName: 'Gateway', sortable: true, filter: true, flex: 1 },
    { field: 'dhcpServer', headerName: 'DHCP Server', sortable: true, filter: true, flex: 1 },
    { field: 'deviceCount', headerName: 'Devices', sortable: true, filter: true, flex: 0.8 },
    { field: 'vlanId', headerName: 'VLAN', sortable: true, filter: true, flex: 0.8 },
  ];

  const portColumns: ColDef<NetworkPort>[] = [
    { field: 'ipAddress', headerName: 'IP Address', sortable: true, filter: true, flex: 1.2 },
    { field: 'port', headerName: 'Port', sortable: true, filter: true, flex: 0.8 },
    { field: 'protocol', headerName: 'Protocol', sortable: true, filter: true, flex: 0.8 },
    { field: 'service', headerName: 'Service', sortable: true, filter: true, flex: 1 },
    { field: 'version', headerName: 'Version', sortable: true, filter: true, flex: 1 },
    { field: 'state', headerName: 'State', sortable: true, filter: true, flex: 0.8 },
    { field: 'riskLevel', headerName: 'Risk', sortable: true, filter: true, flex: 0.8 },
  ];

  // Statistics
  const stats = useMemo(() => {
    if (!result) return null;

    const onlineDevices = result.devices.filter((d) => d.status === 'online').length;
    const totalDevices = result.devices.length;
    const subnets = result.subnets.length;
    const openPorts = result.openPorts.length;
    const vulnerabilities = result.vulnerabilities?.length || 0;
    const criticalVulns = result.vulnerabilities?.filter((v) => v.severity === 'critical').length || 0;
    const highVulns = result.vulnerabilities?.filter((v) => v.severity === 'high').length || 0;

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
