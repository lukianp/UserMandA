import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { ColDef } from 'ag-grid-community';

import type {
  NetworkDiscoveryConfig,
  NetworkDiscoveryResult,
  NetworkDevice,
  NetworkSubnet,
  NetworkPort,
  NetworkDiscoveryTemplate,
} from '../types/models/network';

import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import type { PowerShellLog } from '../components/molecules/PowerShellExecutionDialog';

export interface NetworkDiscoveryLogicState {
  config: NetworkDiscoveryConfig;
  result: NetworkDiscoveryResult | null;
  isLoading: boolean;
  progress: number;
  error: string | null;
  searchText: string;
  activeTab: 'overview' | 'devices' | 'subnets' | 'ports';
  templates: NetworkDiscoveryTemplate[];
  logs: PowerShellLog[];
  showExecutionDialog: boolean;
}

export const useNetworkDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult } = useDiscoveryStore();

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
  const [cancellationToken, setCancellationToken] = useState<string | null>(null);
  const [logs, setLogs] = useState<PowerShellLog[]>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);

  const currentTokenRef = useRef<string | null>(null);

  // Utility function to add logs
  const addLog = useCallback((message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newLog: PowerShellLog = { timestamp: new Date().toISOString(), message, level };
    setLogs((prevLogs) => [...prevLogs, newLog]);
  }, []);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[NetworkDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const message = data.message || '';
        console.log('[NetworkDiscoveryHook] Progress:', message);
        addLog(message, 'info');
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const discoveryResult = {
          id: `network-discovery-${Date.now()}`,
          name: 'Network Discovery',
          moduleName: 'Network',
          displayName: 'Network Discovery',
          itemCount: data?.result?.devices?.length || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.devices?.length || 0} network devices`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setResult(data.result as NetworkDiscoveryResult);
        setIsLoading(false);
        setProgress(100);
        setCancellationToken(null);
        setShowExecutionDialog(false);
        currentTokenRef.current = null;

        addResult(discoveryResult);
        addLog('Network discovery completed successfully', 'success');
        addLog(`Found ${discoveryResult.itemCount} devices`, 'success');
        console.log(`[NetworkDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} devices.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setError(data.error);
        setIsLoading(false);
        setCancellationToken(null);
        setShowExecutionDialog(false);
        currentTokenRef.current = null;
        addLog(`Discovery failed: ${data.error}`, 'error');
        console.error(`[NetworkDiscoveryHook] Discovery failed: ${data.error}`);
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setIsLoading(false);
        setProgress(0);
        setCancellationToken(null);
        setShowExecutionDialog(false);
        currentTokenRef.current = null;
        addLog('Discovery cancelled by user', 'warning');
        console.warn('[NetworkDiscoveryHook] Discovery cancelled by user');
      }
    });

    return () => {
      unsubscribeOutput?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeCancelled?.();
    };
  }, [addLog, addResult]);

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

  const handleStartDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      const errorMessage = 'No company profile selected. Please select a profile first.';
      setError(errorMessage);
      console.error('[NetworkDiscoveryHook]', errorMessage);
      return;
    }

    if (isLoading) return;

    const token = `network-discovery-${Date.now()}`;

    setIsLoading(true);
    setProgress(0);
    setError(null);
    setResult(null);
    setLogs([]);
    setShowExecutionDialog(true);
    setCancellationToken(token);

    currentTokenRef.current = token;

    console.log(`[NetworkDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log(`[NetworkDiscoveryHook] Parameters:`, {
      IPRanges: config.subnets,
      IncludePortScan: config.includePortScan,
      PortRange: config.portScanRange
    });

    addLog('Starting Network discovery...', 'info');
    addLog(`Company: ${selectedSourceProfile.companyName}`, 'info');
    addLog(`Subnets: ${config.subnets.join(', ')}`, 'info');
    addLog(`Port scan: ${config.includePortScan ? 'Enabled' : 'Disabled'}`, 'info');

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'Network',
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
        executionOptions: {
          timeout: (config.timeout || 300) * 1000,
          showWindow: false,
        },
        executionId: token,
      });

      console.log('[NetworkDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[NetworkDiscoveryHook] Discovery failed:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);
      setShowExecutionDialog(false);
      setCancellationToken(null);
      currentTokenRef.current = null;
      addLog(`Error: ${errorMessage}`, 'error');
    }
  }, [selectedSourceProfile, config, isLoading, addLog]);

  const cancelDiscovery = useCallback(async () => {
    if (!isLoading || !cancellationToken) return;

    console.warn('[NetworkDiscoveryHook] Cancelling discovery...');

    try {
      addLog('Cancelling Network discovery...', 'warning');
      await window.electron.cancelDiscovery(cancellationToken);
      console.log('[NetworkDiscoveryHook] Discovery cancellation requested successfully');

      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
        setShowExecutionDialog(false);
        setCancellationToken(null);
        currentTokenRef.current = null;
        addLog('Network discovery cancelled', 'warning');
        console.warn('[NetworkDiscoveryHook] Discovery cancelled');
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'Error cancelling discovery';
      console.error('[NetworkDiscoveryHook]', errorMessage);
      setIsLoading(false);
      setShowExecutionDialog(false);
      setCancellationToken(null);
      currentTokenRef.current = null;
      addLog(`Failed to cancel: ${errorMessage}`, 'error');
    }
  }, [isLoading, cancellationToken, addLog]);

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

    data?.devices?.forEach((device) => {
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
        (device.hostname ?? '').toLowerCase().includes(search) ||
        (device.ipAddress ?? '').toLowerCase().includes(search) ||
        (device.type ?? '').toLowerCase().includes(search)
    );
  }, [result, searchText]);

  const filteredSubnets = useMemo(() => {
    if (!result) return [];
    const subnets = result?.subnets ?? [];
    if (!searchText) return subnets;

    const search = searchText.toLowerCase();
    return subnets.filter(
      (subnet) =>
        (subnet.network ?? '').toLowerCase().includes(search) ||
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
        (port.protocol ?? '').toLowerCase().includes(search)
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
    cancelDiscovery,
    handleApplyTemplate,
    handleExport,
    filteredDevices,
    filteredSubnets,
    filteredPorts,
    deviceColumns,
    subnetColumns,
    portColumns,
    stats,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
  };
};
