import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { useProfileStore } from '../store/useProfileStore';

// TypeScript interfaces matching CSV structures
interface DNSServer {
  IPAddress: string;
  Name: string;
  ComputerName: string;
  Source: string;
  AdapterName: string;
  InterfaceIndex: string;
  Forest: string;
  Domain: string;
  Status: string;
  Version: string;
  LastChecked: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface DNSZone {
  ZoneName: string;
  ZoneType: string;
  IsDsIntegrated: string;
  IsAutoCreated: string;
  IsPaused: string;
  IsReadOnly: string;
  IsReverseLookupZone: string;
  IsShutdown: string;
  DirectoryPartitionName: string;
  ReplicationScope: string;
  SecureSecondaries: string;
  NotifyServers: string;
  ZoneFile: string;
  DynamicUpdate: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface DNSRecord {
  ZoneName: string;
  RecordName: string;
  RecordType: string;
  Timestamp: string;
  TimeToLive: string;
  RecordData: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface DHCPServer {
  Name: string;
  ComputerName: string;
  IPAddress: string;
  Source: string;
  Status: string;
  LastChecked: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface DHCPScope {
  ServerName: string;
  ServerIPAddress: string;
  ScopeId: string;
  Name: string;
  Description: string;
  StartRange: string;
  EndRange: string;
  SubnetMask: string;
  State: string;
  Type: string;
  LeaseDuration: string;
  AddressesInUse: string;
  AddressesFree: string;
  PercentageInUse: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface DHCPLease {
  ServerName: string;
  ScopeId: string;
  IPAddress: string;
  ClientId: string;
  HostName: string;
  AddressState: string;
  LeaseExpiryTime: string;
  ProbationEnds: string;
  ClientType: string;
  Description: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface DHCPReservation {
  ServerName: string;
  ScopeId: string;
  IPAddress: string;
  ClientId: string;
  Name: string;
  Description: string;
  Type: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface DNSForwarder {
  ServerName: string;
  ForwarderIPAddress: string;
  Timeout: string;
  UseRootHint: string;
  EnableReordering: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface DNSConditionalForwarder {
  ZoneName: string;
  MasterServers: string;
  ReplicationScope: string;
  DirectoryPartitionName: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface DNSServerSetting {
  ServerName: string;
  RecursionEnabled: string;
  ForwardingEnabled: string;
  EventLogLevel: string;
  BootMethod: string;
  ListenAddresses: string;
  RoundRobin: string;
  LocalNetPriority: string;
  StrictFileParsing: string;
  WriteAuthorityNS: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface DNSZoneAging {
  ZoneName: string;
  AgingEnabled: string;
  ScavengingEnabled: string;
  RefreshInterval: string;
  NoRefreshInterval: string;
  AvailForScavengeTime: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface DHCPServerOption {
  ServerName: string;
  OptionId: string;
  Name: string;
  Type: string;
  Value: string;
  VendorClass: string;
  UserClass: string;
  PolicyName: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface DHCPScopeOption {
  ServerName: string;
  ScopeId: string;
  ScopeName: string;
  OptionId: string;
  Name: string;
  Type: string;
  Value: string;
  VendorClass: string;
  UserClass: string;
  PolicyName: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface DHCPFailover {
  ServerName: string;
  Name: string;
  PartnerServer: string;
  Mode: string;
  State: string;
  LoadBalancePercent: string;
  MaxClientLeadTime: string;
  StateSwitchInterval: string;
  ScopeIds: string;
  AutoStateTransition: string;
  EnableAuth: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

type TabType = 'overview' | 'dns-servers' | 'dns-zones' | 'dns-records' | 'dns-forwarders' | 'dns-conditional-forwarders' | 'dns-server-settings' | 'dns-zone-aging' | 'dhcp-servers' | 'dhcp-scopes' | 'dhcp-leases' | 'dhcp-reservations' | 'dhcp-server-options' | 'dhcp-scope-options' | 'dhcp-failover';

interface Statistics {
  // Discovery success metrics
  discoverySuccessPercentage: number;
  dataSourcesReceivedCount: number;
  dataSourcesTotal: number;
  dataSourcesReceived: string[];

  // DNS metrics
  totalDNSServers: number;
  responsiveDNSServers: number;
  unresponsiveDNSServers: number;
  totalDNSZones: number;
  totalDNSRecords: number;

  // DHCP metrics
  totalDHCPServers: number;
  accessibleDHCPServers: number;
  inaccessibleDHCPServers: number;
  totalDHCPScopes: number;
  totalDHCPLeases: number;
  totalDHCPReservations: number;

  // Breakdowns
  dnsServerSourceBreakdown: Record<string, number>;
  dnsServerStatusBreakdown: Record<string, number>;
  dhcpServerSourceBreakdown: Record<string, number>;
  dnsZoneTypeBreakdown: Record<string, number>;
  dnsRecordTypeBreakdown: Record<string, number>;

  // Top lists
  topDNSZonesByRecords: Array<{ zone: string; count: number }>;
  topDHCPScopesByUtilization: Array<{ scope: string; utilization: number }>;
  topDNSRecordTypes: Array<{ type: string; count: number }>;
}

export function useDNSDHCPDiscoveredLogic() {
  const { selectedSourceProfile } = useProfileStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for CSV data
  const [dnsServers, setDnsServers] = useState<DNSServer[]>([]);
  const [dnsZones, setDnsZones] = useState<DNSZone[]>([]);
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);
  const [dnsForwarders, setDnsForwarders] = useState<DNSForwarder[]>([]);
  const [dnsConditionalForwarders, setDnsConditionalForwarders] = useState<DNSConditionalForwarder[]>([]);
  const [dnsServerSettings, setDnsServerSettings] = useState<DNSServerSetting[]>([]);
  const [dnsZoneAging, setDnsZoneAging] = useState<DNSZoneAging[]>([]);
  const [dhcpServers, setDhcpServers] = useState<DHCPServer[]>([]);
  const [dhcpScopes, setDhcpScopes] = useState<DHCPScope[]>([]);
  const [dhcpLeases, setDhcpLeases] = useState<DHCPLease[]>([]);
  const [dhcpReservations, setDhcpReservations] = useState<DHCPReservation[]>([]);
  const [dhcpServerOptions, setDhcpServerOptions] = useState<DHCPServerOption[]>([]);
  const [dhcpScopeOptions, setDhcpScopeOptions] = useState<DHCPScopeOption[]>([]);
  const [dhcpFailover, setDhcpFailover] = useState<DHCPFailover[]>([]);

  const profileName = selectedSourceProfile?.companyName || 'default';
  const basePath = `C:\\DiscoveryData\\${profileName}\\Raw`;

  // Helper to load CSV
  const loadCSV = async <T,>(filePath: string): Promise<T[]> => {
    try {
      const fileContent = await window.electronAPI.readFile(filePath);
      return new Promise((resolve, reject) => {
        Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data as T[]),
          error: (error: Error) => reject(error)
        });
      });
    } catch (error) {
      console.warn(`File not found or error loading: ${filePath}`);
      return [];
    }
  };

  // Load CSV files
  useEffect(() => {
    const loadData = async () => {
      if (!selectedSourceProfile) {
        setError('No profile selected');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [
          serversData,
          zonesData,
          recordsData,
          forwardersData,
          conditionalForwardersData,
          serverSettingsData,
          zoneAgingData,
          dhcpServersData,
          scopesData,
          leasesData,
          reservationsData,
          serverOptionsData,
          scopeOptionsData,
          failoverData
        ] = await Promise.all([
          loadCSV<DNSServer>(`${basePath}\\Network_DNSServers.csv`),
          loadCSV<DNSZone>(`${basePath}\\Network_DNSZones.csv`),
          loadCSV<DNSRecord>(`${basePath}\\Network_DNSRecords.csv`),
          loadCSV<DNSForwarder>(`${basePath}\\Network_DNSForwarders.csv`),
          loadCSV<DNSConditionalForwarder>(`${basePath}\\Network_DNSConditionalForwarders.csv`),
          loadCSV<DNSServerSetting>(`${basePath}\\Network_DNSServerSettings.csv`),
          loadCSV<DNSZoneAging>(`${basePath}\\Network_DNSZoneAging.csv`),
          loadCSV<DHCPServer>(`${basePath}\\Network_DHCPServers.csv`),
          loadCSV<DHCPScope>(`${basePath}\\Network_DHCPScopes.csv`),
          loadCSV<DHCPLease>(`${basePath}\\Network_DHCPLeases.csv`),
          loadCSV<DHCPReservation>(`${basePath}\\Network_DHCPReservations.csv`),
          loadCSV<DHCPServerOption>(`${basePath}\\Network_DHCPServerOptions.csv`),
          loadCSV<DHCPScopeOption>(`${basePath}\\Network_DHCPScopeOptions.csv`),
          loadCSV<DHCPFailover>(`${basePath}\\Network_DHCPFailover.csv`)
        ]);

        setDnsServers(serversData);
        setDnsZones(zonesData);
        setDnsRecords(recordsData);
        setDnsForwarders(forwardersData);
        setDnsConditionalForwarders(conditionalForwardersData);
        setDnsServerSettings(serverSettingsData);
        setDnsZoneAging(zoneAgingData);
        setDhcpServers(dhcpServersData);
        setDhcpScopes(scopesData);
        setDhcpLeases(leasesData);
        setDhcpReservations(reservationsData);
        setDhcpServerOptions(serverOptionsData);
        setDhcpScopeOptions(scopeOptionsData);
        setDhcpFailover(failoverData);

      } catch (err) {
        console.error('Error loading DNS/DHCP data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error loading data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedSourceProfile, basePath]);

  // Calculate statistics
  const statistics = useMemo((): Statistics => {
    // Discovery success calculation (weighted by importance) - 14 sources, total weight = 100
    const expectedSources = [
      { name: 'DNS Servers', hasData: dnsServers.length > 0, weight: 12 },
      { name: 'DNS Zones', hasData: dnsZones.length > 0, weight: 10 },
      { name: 'DNS Records', hasData: dnsRecords.length > 0, weight: 8 },
      { name: 'DNS Forwarders', hasData: dnsForwarders.length > 0, weight: 8 },
      { name: 'DNS Conditional Forwarders', hasData: dnsConditionalForwarders.length > 0, weight: 6 },
      { name: 'DNS Server Settings', hasData: dnsServerSettings.length > 0, weight: 6 },
      { name: 'DNS Zone Aging', hasData: dnsZoneAging.length > 0, weight: 4 },
      { name: 'DHCP Servers', hasData: dhcpServers.length > 0, weight: 12 },
      { name: 'DHCP Scopes', hasData: dhcpScopes.length > 0, weight: 10 },
      { name: 'DHCP Leases', hasData: dhcpLeases.length > 0, weight: 8 },
      { name: 'DHCP Reservations', hasData: dhcpReservations.length > 0, weight: 6 },
      { name: 'DHCP Server Options', hasData: dhcpServerOptions.length > 0, weight: 4 },
      { name: 'DHCP Scope Options', hasData: dhcpScopeOptions.length > 0, weight: 4 },
      { name: 'DHCP Failover', hasData: dhcpFailover.length > 0, weight: 2 }
    ];
    const totalWeight = expectedSources.reduce((sum, s) => sum + s.weight, 0);
    const achievedWeight = expectedSources.reduce((sum, s) => sum + (s.hasData ? s.weight : 0), 0);
    const discoverySuccessPercentage = Math.round((achievedWeight / totalWeight) * 100);

    // DNS server metrics
    const responsiveDNS = dnsServers.filter(s => s.Status?.toLowerCase() === 'responsive').length;
    const unresponsiveDNS = dnsServers.filter(s => s.Status?.toLowerCase() === 'unresponsive').length;

    // DHCP server metrics
    const accessibleDHCP = dhcpServers.filter(s => s.Status?.toLowerCase() === 'accessible').length;
    const inaccessibleDHCP = dhcpServers.filter(s => s.Status?.toLowerCase() === 'inaccessible').length;

    // DNS server source breakdown
    const dnsServerSourceBreakdown: Record<string, number> = {};
    dnsServers.forEach(server => {
      const source = server.Source || 'Unknown';
      dnsServerSourceBreakdown[source] = (dnsServerSourceBreakdown[source] || 0) + 1;
    });

    // DNS server status breakdown
    const dnsServerStatusBreakdown: Record<string, number> = {};
    dnsServers.forEach(server => {
      const status = server.Status || 'Unknown';
      dnsServerStatusBreakdown[status] = (dnsServerStatusBreakdown[status] || 0) + 1;
    });

    // DHCP server source breakdown
    const dhcpServerSourceBreakdown: Record<string, number> = {};
    dhcpServers.forEach(server => {
      const source = server.Source || 'Unknown';
      dhcpServerSourceBreakdown[source] = (dhcpServerSourceBreakdown[source] || 0) + 1;
    });

    // DNS zone type breakdown
    const dnsZoneTypeBreakdown: Record<string, number> = {};
    dnsZones.forEach(zone => {
      const type = zone.ZoneType || 'Unknown';
      dnsZoneTypeBreakdown[type] = (dnsZoneTypeBreakdown[type] || 0) + 1;
    });

    // DNS record type breakdown
    const dnsRecordTypeBreakdown: Record<string, number> = {};
    dnsRecords.forEach(record => {
      const type = record.RecordType || 'Unknown';
      dnsRecordTypeBreakdown[type] = (dnsRecordTypeBreakdown[type] || 0) + 1;
    });

    // Top DNS zones by record count
    const zoneRecordCounts: Record<string, number> = {};
    dnsRecords.forEach(record => {
      zoneRecordCounts[record.ZoneName] = (zoneRecordCounts[record.ZoneName] || 0) + 1;
    });
    const topDNSZonesByRecords = Object.entries(zoneRecordCounts)
      .map(([zone, count]) => ({ zone, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top DHCP scopes by utilization
    const topDHCPScopesByUtilization = dhcpScopes
      .map(scope => ({
        scope: scope.Name || scope.ScopeId,
        utilization: parseFloat(scope.PercentageInUse) || 0
      }))
      .sort((a, b) => b.utilization - a.utilization)
      .slice(0, 10);

    // Top DNS record types
    const topDNSRecordTypes = Object.entries(dnsRecordTypeBreakdown)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      discoverySuccessPercentage,
      dataSourcesReceivedCount: expectedSources.filter(s => s.hasData).length,
      dataSourcesTotal: expectedSources.length,
      dataSourcesReceived: expectedSources.filter(s => s.hasData).map(s => s.name),

      totalDNSServers: dnsServers.length,
      responsiveDNSServers: responsiveDNS,
      unresponsiveDNSServers: unresponsiveDNS,
      totalDNSZones: dnsZones.length,
      totalDNSRecords: dnsRecords.length,

      totalDHCPServers: dhcpServers.length,
      accessibleDHCPServers: accessibleDHCP,
      inaccessibleDHCPServers: inaccessibleDHCP,
      totalDHCPScopes: dhcpScopes.length,
      totalDHCPLeases: dhcpLeases.length,
      totalDHCPReservations: dhcpReservations.length,

      dnsServerSourceBreakdown,
      dnsServerStatusBreakdown,
      dhcpServerSourceBreakdown,
      dnsZoneTypeBreakdown,
      dnsRecordTypeBreakdown,

      topDNSZonesByRecords,
      topDHCPScopesByUtilization,
      topDNSRecordTypes
    };
  }, [dnsServers, dnsZones, dnsRecords, dnsForwarders, dnsConditionalForwarders, dnsServerSettings, dnsZoneAging, dhcpServers, dhcpScopes, dhcpLeases, dhcpReservations, dhcpServerOptions, dhcpScopeOptions, dhcpFailover]);

  // Filtered data based on active tab and search
  const filteredData = useMemo(() => {
    const search = searchTerm.toLowerCase();

    switch (activeTab) {
      case 'dns-servers':
        return dnsServers.filter(s =>
          (s.IPAddress?.toLowerCase().includes(search)) ||
          (s.Name?.toLowerCase().includes(search)) ||
          (s.Source?.toLowerCase().includes(search)) ||
          (s.Status?.toLowerCase().includes(search))
        );

      case 'dns-zones':
        return dnsZones.filter(z =>
          (z.ZoneName?.toLowerCase().includes(search)) ||
          (z.ZoneType?.toLowerCase().includes(search))
        );

      case 'dns-records':
        return dnsRecords.filter(r =>
          (r.ZoneName?.toLowerCase().includes(search)) ||
          (r.RecordName?.toLowerCase().includes(search)) ||
          (r.RecordType?.toLowerCase().includes(search)) ||
          (r.RecordData?.toLowerCase().includes(search))
        );

      case 'dhcp-servers':
        return dhcpServers.filter(s =>
          (s.Name?.toLowerCase().includes(search)) ||
          (s.IPAddress?.toLowerCase().includes(search)) ||
          (s.Source?.toLowerCase().includes(search)) ||
          (s.Status?.toLowerCase().includes(search))
        );

      case 'dhcp-scopes':
        return dhcpScopes.filter(s =>
          (s.Name?.toLowerCase().includes(search)) ||
          (s.ScopeId?.toLowerCase().includes(search)) ||
          (s.ServerName?.toLowerCase().includes(search))
        );

      case 'dhcp-leases':
        return dhcpLeases.filter(l =>
          (l.IPAddress?.toLowerCase().includes(search)) ||
          (l.HostName?.toLowerCase().includes(search)) ||
          (l.ClientId?.toLowerCase().includes(search))
        );

      case 'dhcp-reservations':
        return dhcpReservations.filter(r =>
          (r.IPAddress?.toLowerCase().includes(search)) ||
          (r.Name?.toLowerCase().includes(search)) ||
          (r.ClientId?.toLowerCase().includes(search))
        );

      default:
        return [];
    }
  }, [activeTab, searchTerm, dnsServers, dnsZones, dnsRecords, dhcpServers, dhcpScopes, dhcpLeases, dhcpReservations]);

  // Export to CSV
  const exportToCSV = () => {
    let dataToExport: any[] = [];
    let filename = '';

    switch (activeTab) {
      case 'dns-servers':
        dataToExport = dnsServers;
        filename = 'Network_DNSServers_Export.csv';
        break;
      case 'dns-zones':
        dataToExport = dnsZones;
        filename = 'Network_DNSZones_Export.csv';
        break;
      case 'dns-records':
        dataToExport = dnsRecords;
        filename = 'Network_DNSRecords_Export.csv';
        break;
      case 'dhcp-servers':
        dataToExport = dhcpServers;
        filename = 'Network_DHCPServers_Export.csv';
        break;
      case 'dhcp-scopes':
        dataToExport = dhcpScopes;
        filename = 'Network_DHCPScopes_Export.csv';
        break;
      case 'dhcp-leases':
        dataToExport = dhcpLeases;
        filename = 'Network_DHCPLeases_Export.csv';
        break;
      case 'dhcp-reservations':
        dataToExport = dhcpReservations;
        filename = 'Network_DHCPReservations_Export.csv';
        break;
      default:
        return;
    }

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    statistics,
    filteredData,
    dnsServers,
    dnsZones,
    dnsRecords,
    dhcpServers,
    dhcpScopes,
    dhcpLeases,
    dhcpReservations,
    exportToCSV
  };
}
