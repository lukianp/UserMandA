import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { useProfileStore } from '../store/useProfileStore';

// TypeScript interfaces for each CSV file
interface OperatingSystem {
  OSName: string;
  OSVersion: string;
  OSBuildNumber: string;
  OSArchitecture: string;
  ServicePackMajorVersion: string;
  ServicePackMinorVersion: string;
  InstallDate: string;
  LastBootUpTime: string;
  SystemDirectory: string;
  WindowsDirectory: string;
  TotalPhysicalMemoryGB: string;
  FreePhysicalMemoryGB: string;
  VirtualMemoryMaxSizeGB: string;
  Manufacturer: string;
  RegisteredUser: string;
  Organization: string;
  SerialNumber: string;
  SystemDrive: string;
  PowerShellVersion: string;
  DotNetFrameworkVersion: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface Hardware {
  Manufacturer: string;
  Model: string;
  SystemType: string;
  TotalPhysicalMemoryGB: string;
  NumberOfProcessors: string;
  NumberOfLogicalProcessors: string;
  ProcessorName: string;
  ProcessorManufacturer: string;
  ProcessorArchitecture: string;
  ProcessorMaxClockSpeed: string;
  ProcessorCurrentClockSpeed: string;
  ProcessorCores: string;
  ProcessorLogicalProcessors: string;
  BIOSVersion: string;
  BIOSManufacturer: string;
  BIOSReleaseDate: string;
  SerialNumber: string;
  SystemFamily: string;
  SystemSKUNumber: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface NetworkAdapter {
  AdapterName: string;
  InterfaceDescription: string;
  InterfaceIndex: string;
  MACAddress: string;
  LinkSpeed: string;
  FullDuplex: string;
  MediaType: string;
  PhysicalMediaType: string;
  IPAddress: string;
  SubnetMask: string;
  DefaultGateway: string;
  DNSServers: string;
  DHCPEnabled: string;
  ConnectionSpecificSuffix: string;
  Status: string;
  AdminStatus: string;
  OperationalStatus: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface DomainEnvironment {
  ComputerName: string;
  Domain: string;
  Workgroup: string;
  PartOfDomain: string;
  DomainRole: string;
  PrimaryOwnerName: string;
  UserName: string;
  LogonServer: string;
  UserDomain: string;
  UserDNSDomain: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface VirtualizationEnvironment {
  IsVirtual: string;
  VirtualizationType: string;
  HypervisorVendor: string;
  Manufacturer: string;
  Model: string;
  BIOSManufacturer: string;
  BIOSVersion: string;
  Error?: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface CloudEnvironment {
  IsCloudInstance: string;
  CloudProvider: string;
  InstanceId: string;
  InstanceType: string;
  Location: string;
  Zone: string;
  AvailabilityZone: string;
  ResourceGroup: string;
  SubscriptionId: string;
  MachineType: string;
  Error?: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface SecurityEnvironment {
  WindowsDefenderStatus: string;
  AntivirusProducts: string;
  FirewallDomainEnabled: string;
  FirewallPrivateEnabled: string;
  FirewallPublicEnabled: string;
  UACEnabled: string;
  BitLockerVolumes: string;
  Error?: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface SoftwareEnvironment {
  PowerShellVersion: string;
  PowerShellModuleCount: string;
  DotNetFrameworkVersions: string;
  WindowsFeaturesEnabled: string;
  IISInstalled: string;
  IISSiteCount: string;
  SQLServerServicesRunning: string;
  Error?: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface InstalledApplication {
  ApplicationName: string;
  Version: string;
  Publisher: string;
  InstallDate: string;
  EstimatedSizeMB: string;
  InstallLocation: string;
  UninstallString: string;
  Architecture: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface StorageVolume {
  DriveLetter: string;
  VolumeName: string;
  DriveType: string;
  FileSystem: string;
  TotalSizeGB: string;
  FreeSpaceGB: string;
  UsedSpaceGB: string;
  PercentFree: string;
  Compressed: string;
  SupportsFileBasedCompression: string;
  MediaType?: string;
  BusType?: string;
  HealthStatus?: string;
  OperationalStatus?: string;
  SpindleSpeed?: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface NetworkRoute {
  DestinationPrefix: string;
  NextHop: string;
  InterfaceIndex: string;
  InterfaceAlias: string;
  RouteMetric: string;
  Protocol: string;
  AddressFamily: string;
  State: string;
  PreferredLifetime: string;
  ValidLifetime: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface AzureConnectivity {
  IsAzureConnected: boolean | string;
  TenantId: string | null;
  TenantName: string | null;
  TenantType: string | null;
  VerifiedDomains: string;
  SubscriptionCount: number | string;
  ConnectionMethod: string | null;
  ErrorDetails: string | null;
  LastTestTime: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface ADConnectSync {
  DirSyncEnabled: boolean | string;
  LastDirSyncTime: string | null;
  OnPremisesNetBiosName: string | null;
  OnPremisesDomainName: string | null;
  SyncedUserCount: number | string;
  CloudOnlyUserCount: number | string;
  TotalUserCount: number | string;
  SyncPercentage: number | string;
  SyncType: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface HybridClassification {
  EnvironmentType: string;
  Description: string;
  IsDomainJoined: boolean | string;
  IsAzureConnected: boolean | string;
  IsDirSyncEnabled: boolean | string;
  SyncType: string;
  SyncPercentage: number | string;
  OnPremDomain: string | null;
  AzureTenantName: string | null;
  ClassificationTime: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

export function useEnvironmentDetectionDiscoveredLogic() {
  const { selectedSourceProfile } = useProfileStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for all data types
  const [osData, setOsData] = useState<OperatingSystem[]>([]);
  const [hardwareData, setHardwareData] = useState<Hardware[]>([]);
  const [networkData, setNetworkData] = useState<NetworkAdapter[]>([]);
  const [domainData, setDomainData] = useState<DomainEnvironment[]>([]);
  const [virtualizationData, setVirtualizationData] = useState<VirtualizationEnvironment[]>([]);
  const [cloudData, setCloudData] = useState<CloudEnvironment[]>([]);
  const [securityData, setSecurityData] = useState<SecurityEnvironment[]>([]);
  const [softwareData, setSoftwareData] = useState<SoftwareEnvironment[]>([]);
  const [applicationsData, setApplicationsData] = useState<InstalledApplication[]>([]);
  const [storageData, setStorageData] = useState<StorageVolume[]>([]);
  const [routesData, setRoutesData] = useState<NetworkRoute[]>([]);
  const [azureConnectivity, setAzureConnectivity] = useState<AzureConnectivity[]>([]);
  const [adConnectSync, setAdConnectSync] = useState<ADConnectSync[]>([]);
  const [hybridClassification, setHybridClassification] = useState<HybridClassification[]>([]);

  // Helper function to load CSV
  const loadCSV = <T,>(filePath: string): Promise<T[]> => {
    return new Promise((resolve) => {
      Papa.parse(filePath, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as T[]);
        },
        error: (error) => {
          // Silently handle errors (file not found is expected before discovery runs)
          console.debug(`CSV load failed for ${filePath}:`, error.message);
          resolve([]);
        },
        // Suppress Papa.parse console warnings
        worker: false,
        delimitersToGuess: [',', '\t', '|', ';'],
      });
    });
  };

  // Load all CSV files
  useEffect(() => {
    const loadData = async () => {
      if (!selectedSourceProfile) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const profileName = selectedSourceProfile.companyName || selectedSourceProfile.id;
        const basePath = `C:\\DiscoveryData\\${profileName}\\Raw`;

        const [os, hw, net, dom, virt, cloud, sec, soft, apps, storage, routes, azure, sync, hybrid] = await Promise.all([
          loadCSV<OperatingSystem>(`${basePath}\\EnvironmentDetection_OperatingSystem.csv`),
          loadCSV<Hardware>(`${basePath}\\EnvironmentDetection_Hardware.csv`),
          loadCSV<NetworkAdapter>(`${basePath}\\EnvironmentDetection_NetworkAdapter.csv`),
          loadCSV<DomainEnvironment>(`${basePath}\\EnvironmentDetection_DomainEnvironment.csv`),
          loadCSV<VirtualizationEnvironment>(`${basePath}\\EnvironmentDetection_VirtualizationEnvironment.csv`),
          loadCSV<CloudEnvironment>(`${basePath}\\EnvironmentDetection_CloudEnvironment.csv`),
          loadCSV<SecurityEnvironment>(`${basePath}\\EnvironmentDetection_SecurityEnvironment.csv`),
          loadCSV<SoftwareEnvironment>(`${basePath}\\EnvironmentDetection_SoftwareEnvironment.csv`),
          loadCSV<InstalledApplication>(`${basePath}\\EnvironmentDetection_InstalledApplication.csv`),
          loadCSV<StorageVolume>(`${basePath}\\EnvironmentDetection_StorageVolume.csv`),
          loadCSV<NetworkRoute>(`${basePath}\\EnvironmentDetection_NetworkRoute.csv`),
          loadCSV<AzureConnectivity>(`${basePath}\\EnvironmentDetection_AzureConnectivity.csv`),
          loadCSV<ADConnectSync>(`${basePath}\\EnvironmentDetection_ADConnectSync.csv`),
          loadCSV<HybridClassification>(`${basePath}\\EnvironmentDetection_HybridClassification.csv`),
        ]);

        setOsData(os);
        setHardwareData(hw);
        setNetworkData(net);
        setDomainData(dom);
        setVirtualizationData(virt);
        setCloudData(cloud);
        setSecurityData(sec);
        setSoftwareData(soft);
        setApplicationsData(apps);
        setStorageData(storage);
        setRoutesData(routes);
        setAzureConnectivity(azure);
        setAdConnectSync(sync);
        setHybridClassification(hybrid);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedSourceProfile]);

  // Calculate comprehensive statistics
  const statistics = useMemo(() => {
    const os = osData[0];
    const hw = hardwareData[0];
    const domain = domainData[0];
    const virt = virtualizationData[0];
    const cloud = cloudData[0];
    const security = securityData[0];
    const software = softwareData[0];
    const azure = azureConnectivity[0];
    const sync = adConnectSync[0];
    const hybrid = hybridClassification[0];

    // Discovery Success % calculation (11 primary sources + 3 optional)
    const expectedSources = [
      { name: 'OperatingSystem', hasData: osData.length > 0, weight: 12 },
      { name: 'Hardware', hasData: hardwareData.length > 0, weight: 12 },
      { name: 'NetworkAdapter', hasData: networkData.length > 0, weight: 10 },
      { name: 'DomainEnvironment', hasData: domainData.length > 0, weight: 10 },
      { name: 'VirtualizationEnvironment', hasData: virtualizationData.length > 0, weight: 8 },
      { name: 'CloudEnvironment', hasData: cloudData.length > 0, weight: 8 },
      { name: 'SecurityEnvironment', hasData: securityData.length > 0, weight: 10 },
      { name: 'SoftwareEnvironment', hasData: softwareData.length > 0, weight: 10 },
      { name: 'AzureConnectivity', hasData: azureConnectivity.length > 0, weight: 10 },
      { name: 'ADConnectSync', hasData: adConnectSync.length > 0, weight: 5 },
      { name: 'HybridClassification', hasData: hybridClassification.length > 0, weight: 5 },
    ];
    const totalWeight = expectedSources.reduce((sum, s) => sum + s.weight, 0);
    const achievedWeight = expectedSources.reduce((sum, s) => sum + (s.hasData ? s.weight : 0), 0);

    return {
      // Discovery Success
      discoverySuccessPercentage: Math.round((achievedWeight / totalWeight) * 100),
      dataSourcesReceivedCount: expectedSources.filter(s => s.hasData).length,
      dataSourcesTotal: expectedSources.length,
      dataSourcesReceived: expectedSources.filter(s => s.hasData).map(s => s.name),

      // OS Stats
      osName: os?.OSName || 'Unknown',
      osVersion: os?.OSVersion || 'Unknown',
      osBuild: os?.OSBuildNumber || 'Unknown',
      osArchitecture: os?.OSArchitecture || 'Unknown',
      osMemoryGB: parseFloat(os?.TotalPhysicalMemoryGB || '0'),
      osFreeMemoryGB: parseFloat(os?.FreePhysicalMemoryGB || '0'),
      osMemoryUsagePercent: os ? Math.round(((parseFloat(os.TotalPhysicalMemoryGB) - parseFloat(os.FreePhysicalMemoryGB)) / parseFloat(os.TotalPhysicalMemoryGB)) * 100) : 0,
      osInstallDate: os?.InstallDate || 'Unknown',
      osLastBoot: os?.LastBootUpTime || 'Unknown',

      // Hardware Stats
      hardwareManufacturer: hw?.Manufacturer || 'Unknown',
      hardwareModel: hw?.Model || 'Unknown',
      processorName: hw?.ProcessorName || 'Unknown',
      processorCores: parseInt(hw?.ProcessorCores || '0'),
      processorLogicalProcessors: parseInt(hw?.ProcessorLogicalProcessors || '0'),
      processorMaxClockSpeed: parseInt(hw?.ProcessorMaxClockSpeed || '0'),
      totalPhysicalMemoryGB: parseFloat(hw?.TotalPhysicalMemoryGB || '0'),
      biosVersion: hw?.BIOSVersion || 'Unknown',
      biosManufacturer: hw?.BIOSManufacturer || 'Unknown',

      // Network Stats
      networkAdapterCount: networkData.length,
      activeAdapters: networkData.filter(n => n.Status === 'Up').length,
      totalLinkSpeedGbps: networkData.reduce((sum, n) => {
        const speed = parseFloat(n.LinkSpeed?.replace(' Gbps', '').replace(' Mbps', '') || '0');
        const isGbps = n.LinkSpeed?.includes('Gbps');
        return sum + (isGbps ? speed : speed / 1000);
      }, 0),
      adaptersWithIP: networkData.filter(n => n.IPAddress && n.IPAddress.trim() !== '').length,

      // Domain Stats
      domainName: domain?.Domain || 'WORKGROUP',
      isDomainJoined: domain?.PartOfDomain === 'True',
      domainRole: domain?.DomainRole || 'Unknown',
      computerName: domain?.ComputerName || 'Unknown',
      logonServer: domain?.LogonServer || 'Unknown',

      // Virtualization Stats
      isVirtual: virt?.IsVirtual === 'True',
      virtualizationType: virt?.VirtualizationType || 'Physical',
      hypervisorVendor: virt?.HypervisorVendor || 'None',

      // Cloud Stats
      isCloudInstance: cloud?.IsCloudInstance === 'True',
      cloudProvider: cloud?.CloudProvider || 'None',
      instanceId: cloud?.InstanceId || 'N/A',
      instanceType: cloud?.InstanceType || 'N/A',

      // Security Stats
      windowsDefenderStatus: security?.WindowsDefenderStatus || 'Unknown',
      firewallEnabled: security?.FirewallDomainEnabled === 'True' || security?.FirewallPrivateEnabled === 'True',
      uacEnabled: security?.UACEnabled === 'True',
      antivirusCount: (() => {
        try {
          const av = JSON.parse(security?.AntivirusProducts || '[]');
          return Array.isArray(av) ? av.length : 0;
        } catch {
          return 0;
        }
      })(),
      bitlockerVolumes: (() => {
        try {
          const bl = JSON.parse(security?.BitLockerVolumes || '[]');
          return Array.isArray(bl) ? bl.length : 0;
        } catch {
          return 0;
        }
      })(),

      // Software Stats
      powerShellVersion: software?.PowerShellVersion || 'Unknown',
      powerShellModuleCount: parseInt(software?.PowerShellModuleCount || '0'),
      dotNetVersions: software?.DotNetFrameworkVersions || 'Unknown',
      windowsFeaturesEnabled: parseInt(software?.WindowsFeaturesEnabled || '0'),
      iisInstalled: software?.IISInstalled === 'True',
      iisSiteCount: parseInt(software?.IISSiteCount || '0'),
      sqlServerRunning: parseInt(software?.SQLServerServicesRunning || '0'),

      // Application Stats
      totalApplications: applicationsData.length,
      applicationsByArchitecture: {
        x64: applicationsData.filter(a => a.Architecture === 'x64').length,
        x86: applicationsData.filter(a => a.Architecture === 'x86').length,
        user: applicationsData.filter(a => a.Architecture === 'User').length,
      },
      topPublishers: (() => {
        const publishers = applicationsData.reduce((acc, app) => {
          const pub = app.Publisher || 'Unknown';
          acc[pub] = (acc[pub] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        return Object.entries(publishers)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, count]) => ({ name, count }));
      })(),

      // Storage Stats
      totalStorageVolumes: storageData.length,
      totalStorageCapacityGB: storageData.reduce((sum, v) => sum + parseFloat(v.TotalSizeGB || '0'), 0),
      totalStorageUsedGB: storageData.reduce((sum, v) => sum + parseFloat(v.UsedSpaceGB || '0'), 0),
      totalStorageFreeGB: storageData.reduce((sum, v) => sum + parseFloat(v.FreeSpaceGB || '0'), 0),
      storageUsagePercent: (() => {
        const total = storageData.reduce((sum, v) => sum + parseFloat(v.TotalSizeGB || '0'), 0);
        const used = storageData.reduce((sum, v) => sum + parseFloat(v.UsedSpaceGB || '0'), 0);
        return total > 0 ? Math.round((used / total) * 100) : 0;
      })(),
      volumesByType: storageData.reduce((acc, v) => {
        acc[v.DriveType] = (acc[v.DriveType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),

      // Network Route Stats
      totalRoutes: routesData.length,
      ipv4Routes: routesData.filter(r => r.AddressFamily === 'IPv4').length,
      ipv6Routes: routesData.filter(r => r.AddressFamily === 'IPv6').length,
      routeProtocols: routesData.reduce((acc, r) => {
        acc[r.Protocol] = (acc[r.Protocol] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),

      // Hybrid Environment Stats
      environmentType: hybrid?.EnvironmentType || 'Unknown',
      environmentDescription: hybrid?.Description || 'Not classified',
      isAzureConnected: (azure?.IsAzureConnected === true || azure?.IsAzureConnected === 'True'),
      azureTenantName: azure?.TenantName || 'Not connected',
      azureTenantId: azure?.TenantId || 'N/A',
      azureTenantType: azure?.TenantType || 'N/A',
      azureVerifiedDomains: azure?.VerifiedDomains || 'N/A',
      azureConnectionMethod: azure?.ConnectionMethod || 'N/A',
      azureErrorDetails: azure?.ErrorDetails || null,
      azureLastTestTime: azure?.LastTestTime || 'Never',
      isDirSyncEnabled: (sync?.DirSyncEnabled === true || sync?.DirSyncEnabled === 'True'),
      syncType: sync?.SyncType || 'None',
      syncPercentage: typeof sync?.SyncPercentage === 'string' ? parseFloat(sync.SyncPercentage) : (sync?.SyncPercentage || 0),
      syncedUserCount: typeof sync?.SyncedUserCount === 'string' ? parseInt(sync.SyncedUserCount) : (sync?.SyncedUserCount || 0),
      cloudOnlyUserCount: typeof sync?.CloudOnlyUserCount === 'string' ? parseInt(sync.CloudOnlyUserCount) : (sync?.CloudOnlyUserCount || 0),
      totalUserCount: typeof sync?.TotalUserCount === 'string' ? parseInt(sync.TotalUserCount) : (sync?.TotalUserCount || 0),
      lastDirSyncTime: sync?.LastDirSyncTime || 'Never',
      onPremisesNetBiosName: sync?.OnPremisesNetBiosName || 'N/A',
      onPremisesDomainName: sync?.OnPremisesDomainName || 'N/A',
    };
  }, [osData, hardwareData, networkData, domainData, virtualizationData, cloudData, securityData, softwareData, applicationsData, storageData, routesData, azureConnectivity, adConnectSync, hybridClassification]);

  // Filtered data based on active tab and search
  const filteredData = useMemo(() => {
    let data: any[] = [];

    switch (activeTab) {
      case 'os':
        data = osData;
        break;
      case 'hardware':
        data = hardwareData;
        break;
      case 'network':
        data = networkData;
        break;
      case 'domain':
        data = domainData;
        break;
      case 'virtualization':
        data = virtualizationData;
        break;
      case 'cloud':
        data = cloudData;
        break;
      case 'security':
        data = securityData;
        break;
      case 'software':
        data = softwareData;
        break;
      case 'applications':
        data = applicationsData;
        break;
      case 'storage':
        data = storageData;
        break;
      case 'routes':
        data = routesData;
        break;
      case 'azure':
        data = azureConnectivity;
        break;
      case 'sync':
        data = adConnectSync;
        break;
      case 'hybrid':
        data = hybridClassification;
        break;
      default:
        return [];
    }

    if (!searchTerm) return data;

    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(lowerSearch)
      )
    );
  }, [activeTab, searchTerm, osData, hardwareData, networkData, domainData, virtualizationData, cloudData, securityData, softwareData, applicationsData, storageData, routesData]);

  // Export to CSV function
  const exportToCSV = () => {
    if (filteredData.length === 0) return;

    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `EnvironmentDetection_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    exportToCSV,
    // Individual datasets for overview tab
    osData,
    hardwareData,
    networkData,
    domainData,
    virtualizationData,
    cloudData,
    securityData,
    softwareData,
    applicationsData,
    storageData,
    routesData,
    azureConnectivity,
    adConnectSync,
    hybridClassification,
  };
}
