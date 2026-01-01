/**
 * useIntuneDiscoveredLogic.ts
 * Logic hook for Intune Discovered View - loads CSV data and calculates statistics
 * Version: 1.1.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { useProfileStore } from '../store/useProfileStore';

// ============================================================================
// INTERFACES - Based on IntuneDiscovery.psm1 CSV exports
// ============================================================================

export interface IntuneManagedDevice {
  DeviceId: string;
  DeviceName: string;
  ManagedDeviceName: string;
  SerialNumber: string;
  UserPrincipalName: string;
  UserDisplayName: string;
  UserId: string;
  EmailAddress: string;
  OperatingSystem: string;
  OSVersion: string;
  Model: string;
  Manufacturer: string;
  DeviceType: string;
  IMEI: string;
  WiFiMacAddress: string;
  ManagementAgent: string;
  ManagedDeviceOwnerType: string;
  DeviceEnrollmentType: string;
  DeviceRegistrationState: string;
  ManagementState: string;
  ComplianceState: string;
  IsEncrypted: string;
  IsSupervised: string;
  JailBroken: string;
  EnrolledDateTime: string;
  LastSyncDateTime: string;
  AzureADDeviceId: string;
  AzureADRegistered: string;
  TotalStorageSpaceInGB: string;
  FreeStorageSpaceInGB: string;
  AutopilotEnrolled: string;
}

export interface IntuneDeviceConfiguration {
  ConfigurationId: string;
  DisplayName: string;
  Description: string;
  CreatedDateTime: string;
  LastModifiedDateTime: string;
  Version: string;
  ConfigurationType: string;
  RoleScopeTagIds: string;
  SupportsScopeTags: string;
  AssignmentCount: string;
  AssignmentTargets: string;
}

export interface IntuneCompliancePolicy {
  PolicyId: string;
  DisplayName: string;
  Description: string;
  CreatedDateTime: string;
  LastModifiedDateTime: string;
  Version: string;
  Platform: string;
  RoleScopeTagIds: string;
  ScheduledActionsForRule: string;
  AssignmentCount: string;
  AssignmentTargets: string;
}

export interface IntuneAppProtectionPolicy {
  PolicyId: string;
  DisplayName: string;
  Description: string;
  CreatedDateTime: string;
  LastModifiedDateTime: string;
  Platform: string;
  PolicyType: string;
  Version: string;
  PinRequired: string;
  MinimumPinLength: string;
  AllowedDataStorageLocations: string;
  ContactSyncBlocked: string;
  PrintBlocked: string;
  FingerprintBlocked: string;
}

export interface IntuneManagedApp {
  AppId: string;
  DisplayName: string;
  Description: string;
  Publisher: string;
  CreatedDateTime: string;
  LastModifiedDateTime: string;
  AppType: string;
  IsFeatured: string;
  Owner: string;
  Developer: string;
  PublishingState: string;
  Version: string;
  FileName: string;
  Size: string;
  AssignmentCount: string;
  AssignmentTargets: string;
}

export interface IntuneStatistics {
  // Device stats
  totalDevices: number;
  compliantDevices: number;
  nonCompliantDevices: number;
  unknownComplianceDevices: number;
  encryptedDevices: number;
  autopilotDevices: number;

  // Platform breakdown
  windowsDevices: number;
  iosDevices: number;
  androidDevices: number;
  macOSDevices: number;

  // Configuration stats
  totalConfigurations: number;
  assignedConfigurations: number;

  // Compliance policy stats
  totalCompliancePolicies: number;
  windowsPolicies: number;
  iosPolicies: number;
  androidPolicies: number;

  // App protection stats
  totalAppProtectionPolicies: number;
  iosAppPolicies: number;
  androidAppPolicies: number;

  // App stats
  totalApps: number;
  assignedApps: number;
  featuredApps: number;

  // Discovery Success
  expectedDataSources: number;
  receivedDataSources: number;
  discoverySuccessPercent: number;

  // Top items
  topManufacturers: { name: string; count: number }[];
  topModels: { name: string; count: number }[];
  topAppTypes: { name: string; count: number }[];
  devicesByOS: { name: string; count: number }[];
  devicesByComplianceState: { name: string; count: number }[];
}

export type IntuneTab = 'overview' | 'devices' | 'configurations' | 'compliance' | 'appProtection' | 'apps';

// ============================================================================
// HOOK
// ============================================================================

export function useIntuneDiscoveredLogic() {
  const { selectedSourceProfile } = useProfileStore();

  // State
  const [devices, setDevices] = useState<IntuneManagedDevice[]>([]);
  const [configurations, setConfigurations] = useState<IntuneDeviceConfiguration[]>([]);
  const [compliancePolicies, setCompliancePolicies] = useState<IntuneCompliancePolicy[]>([]);
  const [appProtectionPolicies, setAppProtectionPolicies] = useState<IntuneAppProtectionPolicy[]>([]);
  const [apps, setApps] = useState<IntuneManagedApp[]>([]);

  const [activeTab, setActiveTab] = useState<IntuneTab>('overview');
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // ============================================================================
  // CSV LOADING
  // ============================================================================

  const loadCSV = useCallback(async <T>(fileName: string): Promise<T[]> => {
    if (!selectedSourceProfile?.companyName) return [];

    const filePath = `C:\\DiscoveryData\\${selectedSourceProfile.companyName}\\Raw\\${fileName}`;

    try {
      const exists = await window.electronAPI.fileExists(filePath);
      if (!exists) {
        console.log(`[IntuneDiscovered] File not found: ${fileName}`);
        return [];
      }

      const content = await window.electronAPI.readFile(filePath);

      return new Promise((resolve) => {
        Papa.parse<T>(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log(`[IntuneDiscovered] Loaded ${results.data.length} records from ${fileName}`);
            resolve(results.data);
          },
          error: () => resolve([])
        });
      });
    } catch (err) {
      console.error(`[IntuneDiscovered] Error loading ${fileName}:`, err);
      return [];
    }
  }, [selectedSourceProfile?.companyName]);

  const loadAllData = useCallback(async () => {
    if (!selectedSourceProfile?.companyName) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[IntuneDiscovered] Loading Intune discovery data...');

      const [
        devicesData,
        configurationsData,
        complianceData,
        appProtectionData,
        appsData
      ] = await Promise.all([
        loadCSV<IntuneManagedDevice>('IntuneManagedDevices.csv'),
        loadCSV<IntuneDeviceConfiguration>('IntuneDeviceConfigurations.csv'),
        loadCSV<IntuneCompliancePolicy>('IntuneCompliancePolicies.csv'),
        loadCSV<IntuneAppProtectionPolicy>('IntuneAppProtectionPolicies.csv'),
        loadCSV<IntuneManagedApp>('IntuneManagedApps.csv')
      ]);

      setDevices(devicesData);
      setConfigurations(configurationsData);
      setCompliancePolicies(complianceData);
      setAppProtectionPolicies(appProtectionData);
      setApps(appsData);
      setLastUpdated(new Date());

      console.log('[IntuneDiscovered] Data loaded successfully:', {
        devices: devicesData.length,
        configurations: configurationsData.length,
        compliancePolicies: complianceData.length,
        appProtectionPolicies: appProtectionData.length,
        apps: appsData.length
      });

    } catch (err) {
      console.error('[IntuneDiscovered] Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load Intune data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile?.companyName, loadCSV]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ============================================================================
  // STATISTICS CALCULATION
  // ============================================================================

  const statistics: IntuneStatistics = useMemo(() => {
    // Count data sources with data
    const dataSources = [
      { name: 'Managed Devices', hasData: devices.length > 0 },
      { name: 'Device Configurations', hasData: configurations.length > 0 },
      { name: 'Compliance Policies', hasData: compliancePolicies.length > 0 },
      { name: 'App Protection Policies', hasData: appProtectionPolicies.length > 0 },
      { name: 'Managed Apps', hasData: apps.length > 0 }
    ];

    const expectedDataSources = dataSources.length;
    const receivedDataSources = dataSources.filter(ds => ds.hasData).length;
    const discoverySuccessPercent = expectedDataSources > 0
      ? Math.round((receivedDataSources / expectedDataSources) * 100)
      : 0;

    // Device compliance stats
    const compliantDevices = devices.filter(d => d.ComplianceState?.toLowerCase() === 'compliant').length;
    const nonCompliantDevices = devices.filter(d => d.ComplianceState?.toLowerCase() === 'noncompliant').length;
    const unknownComplianceDevices = devices.filter(d =>
      !d.ComplianceState || d.ComplianceState.toLowerCase() === 'unknown'
    ).length;
    const encryptedDevices = devices.filter(d => d.IsEncrypted?.toLowerCase() === 'true').length;
    const autopilotDevices = devices.filter(d => d.AutopilotEnrolled?.toLowerCase() === 'true').length;

    // Platform breakdown
    const windowsDevices = devices.filter(d => d.OperatingSystem?.toLowerCase().includes('windows')).length;
    const iosDevices = devices.filter(d => d.OperatingSystem?.toLowerCase().includes('ios')).length;
    const androidDevices = devices.filter(d => d.OperatingSystem?.toLowerCase().includes('android')).length;
    const macOSDevices = devices.filter(d => d.OperatingSystem?.toLowerCase().includes('macos')).length;

    // Configuration stats
    const assignedConfigurations = configurations.filter(c => parseInt(c.AssignmentCount || '0') > 0).length;

    // Compliance policy stats
    const windowsPolicies = compliancePolicies.filter(p => p.Platform?.toLowerCase().includes('windows')).length;
    const iosPolicies = compliancePolicies.filter(p => p.Platform?.toLowerCase().includes('ios')).length;
    const androidPolicies = compliancePolicies.filter(p => p.Platform?.toLowerCase().includes('android')).length;

    // App protection stats
    const iosAppPolicies = appProtectionPolicies.filter(p => p.Platform?.toLowerCase() === 'ios').length;
    const androidAppPolicies = appProtectionPolicies.filter(p => p.Platform?.toLowerCase() === 'android').length;

    // App stats
    const assignedApps = apps.filter(a => parseInt(a.AssignmentCount || '0') > 0).length;
    const featuredApps = apps.filter(a => a.IsFeatured?.toLowerCase() === 'true').length;

    // Top manufacturers
    const manufacturerCounts: Record<string, number> = {};
    devices.forEach(d => {
      const mfr = d.Manufacturer || 'Unknown';
      manufacturerCounts[mfr] = (manufacturerCounts[mfr] || 0) + 1;
    });
    const topManufacturers = Object.entries(manufacturerCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top models
    const modelCounts: Record<string, number> = {};
    devices.forEach(d => {
      const model = d.Model || 'Unknown';
      modelCounts[model] = (modelCounts[model] || 0) + 1;
    });
    const topModels = Object.entries(modelCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top app types
    const appTypeCounts: Record<string, number> = {};
    apps.forEach(a => {
      const appType = a.AppType || 'Unknown';
      appTypeCounts[appType] = (appTypeCounts[appType] || 0) + 1;
    });
    const topAppTypes = Object.entries(appTypeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Devices by OS
    const osCounts: Record<string, number> = {};
    devices.forEach(d => {
      const os = d.OperatingSystem || 'Unknown';
      osCounts[os] = (osCounts[os] || 0) + 1;
    });
    const devicesByOS = Object.entries(osCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Devices by compliance state
    const complianceCounts: Record<string, number> = {};
    devices.forEach(d => {
      const state = d.ComplianceState || 'Unknown';
      complianceCounts[state] = (complianceCounts[state] || 0) + 1;
    });
    const devicesByComplianceState = Object.entries(complianceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalDevices: devices.length,
      compliantDevices,
      nonCompliantDevices,
      unknownComplianceDevices,
      encryptedDevices,
      autopilotDevices,
      windowsDevices,
      iosDevices,
      androidDevices,
      macOSDevices,
      totalConfigurations: configurations.length,
      assignedConfigurations,
      totalCompliancePolicies: compliancePolicies.length,
      windowsPolicies,
      iosPolicies,
      androidPolicies,
      totalAppProtectionPolicies: appProtectionPolicies.length,
      iosAppPolicies,
      androidAppPolicies,
      totalApps: apps.length,
      assignedApps,
      featuredApps,
      expectedDataSources,
      receivedDataSources,
      discoverySuccessPercent,
      topManufacturers,
      topModels,
      topAppTypes,
      devicesByOS,
      devicesByComplianceState
    };
  }, [devices, configurations, compliancePolicies, appProtectionPolicies, apps]);

  // ============================================================================
  // FILTERING
  // ============================================================================

  const filteredDevices = useMemo(() => {
    if (!searchText) return devices;
    const search = searchText.toLowerCase();
    return devices.filter(d =>
      d.DeviceName?.toLowerCase().includes(search) ||
      d.UserPrincipalName?.toLowerCase().includes(search) ||
      d.Model?.toLowerCase().includes(search) ||
      d.Manufacturer?.toLowerCase().includes(search) ||
      d.OperatingSystem?.toLowerCase().includes(search)
    );
  }, [devices, searchText]);

  const filteredConfigurations = useMemo(() => {
    if (!searchText) return configurations;
    const search = searchText.toLowerCase();
    return configurations.filter(c =>
      c.DisplayName?.toLowerCase().includes(search) ||
      c.ConfigurationType?.toLowerCase().includes(search)
    );
  }, [configurations, searchText]);

  const filteredCompliancePolicies = useMemo(() => {
    if (!searchText) return compliancePolicies;
    const search = searchText.toLowerCase();
    return compliancePolicies.filter(p =>
      p.DisplayName?.toLowerCase().includes(search) ||
      p.Platform?.toLowerCase().includes(search)
    );
  }, [compliancePolicies, searchText]);

  const filteredAppProtectionPolicies = useMemo(() => {
    if (!searchText) return appProtectionPolicies;
    const search = searchText.toLowerCase();
    return appProtectionPolicies.filter(p =>
      p.DisplayName?.toLowerCase().includes(search) ||
      p.Platform?.toLowerCase().includes(search)
    );
  }, [appProtectionPolicies, searchText]);

  const filteredApps = useMemo(() => {
    if (!searchText) return apps;
    const search = searchText.toLowerCase();
    return apps.filter(a =>
      a.DisplayName?.toLowerCase().includes(search) ||
      a.Publisher?.toLowerCase().includes(search) ||
      a.AppType?.toLowerCase().includes(search)
    );
  }, [apps, searchText]);

  // ============================================================================
  // COLUMN DEFINITIONS
  // ============================================================================

  const deviceColumns = [
    { field: 'DeviceName', headerName: 'Device Name', width: 180, sortable: true },
    { field: 'UserPrincipalName', headerName: 'User', width: 200, sortable: true },
    { field: 'OperatingSystem', headerName: 'OS', width: 120, sortable: true },
    { field: 'OSVersion', headerName: 'OS Version', width: 120, sortable: true },
    { field: 'Model', headerName: 'Model', width: 150, sortable: true },
    { field: 'Manufacturer', headerName: 'Manufacturer', width: 130, sortable: true },
    { field: 'ComplianceState', headerName: 'Compliance', width: 120, sortable: true },
    { field: 'IsEncrypted', headerName: 'Encrypted', width: 100, sortable: true },
    { field: 'ManagementState', headerName: 'Mgmt State', width: 120, sortable: true },
    { field: 'LastSyncDateTime', headerName: 'Last Sync', width: 160, sortable: true },
    { field: 'EnrolledDateTime', headerName: 'Enrolled', width: 160, sortable: true }
  ];

  const configurationColumns = [
    { field: 'DisplayName', headerName: 'Configuration Name', width: 250, sortable: true },
    { field: 'ConfigurationType', headerName: 'Type', width: 200, sortable: true },
    { field: 'Version', headerName: 'Version', width: 80, sortable: true },
    { field: 'AssignmentCount', headerName: 'Assignments', width: 110, sortable: true },
    { field: 'CreatedDateTime', headerName: 'Created', width: 160, sortable: true },
    { field: 'LastModifiedDateTime', headerName: 'Modified', width: 160, sortable: true }
  ];

  const compliancePolicyColumns = [
    { field: 'DisplayName', headerName: 'Policy Name', width: 250, sortable: true },
    { field: 'Platform', headerName: 'Platform', width: 150, sortable: true },
    { field: 'Version', headerName: 'Version', width: 80, sortable: true },
    { field: 'AssignmentCount', headerName: 'Assignments', width: 110, sortable: true },
    { field: 'CreatedDateTime', headerName: 'Created', width: 160, sortable: true },
    { field: 'LastModifiedDateTime', headerName: 'Modified', width: 160, sortable: true }
  ];

  const appProtectionColumns = [
    { field: 'DisplayName', headerName: 'Policy Name', width: 250, sortable: true },
    { field: 'Platform', headerName: 'Platform', width: 100, sortable: true },
    { field: 'PolicyType', headerName: 'Type', width: 120, sortable: true },
    { field: 'PinRequired', headerName: 'PIN Required', width: 110, sortable: true },
    { field: 'MinimumPinLength', headerName: 'Min PIN', width: 90, sortable: true },
    { field: 'PrintBlocked', headerName: 'Print Blocked', width: 110, sortable: true },
    { field: 'CreatedDateTime', headerName: 'Created', width: 160, sortable: true }
  ];

  const appColumns = [
    { field: 'DisplayName', headerName: 'App Name', width: 250, sortable: true },
    { field: 'Publisher', headerName: 'Publisher', width: 150, sortable: true },
    { field: 'AppType', headerName: 'Type', width: 180, sortable: true },
    { field: 'Version', headerName: 'Version', width: 100, sortable: true },
    { field: 'AssignmentCount', headerName: 'Assignments', width: 110, sortable: true },
    { field: 'PublishingState', headerName: 'State', width: 100, sortable: true },
    { field: 'IsFeatured', headerName: 'Featured', width: 90, sortable: true }
  ];

  // ============================================================================
  // EXPORT FUNCTIONS
  // ============================================================================

  const exportToCSV = useCallback((data: any[], filename: string) => {
    if (!data.length) return;

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportToExcel = useCallback(async (data: any[], filename: string) => {
    // For now, export as CSV with xlsx extension hint
    exportToCSV(data, filename.replace('.xlsx', '.csv'));
  }, [exportToCSV]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    devices: filteredDevices,
    configurations: filteredConfigurations,
    compliancePolicies: filteredCompliancePolicies,
    appProtectionPolicies: filteredAppProtectionPolicies,
    apps: filteredApps,

    // Raw data for exports
    allDevices: devices,
    allConfigurations: configurations,
    allCompliancePolicies: compliancePolicies,
    allAppProtectionPolicies: appProtectionPolicies,
    allApps: apps,

    // Statistics
    statistics,

    // State
    activeTab,
    setActiveTab,
    searchText,
    setSearchText,
    isLoading,
    error,
    lastUpdated,

    // Actions
    refresh: loadAllData,
    exportToCSV,
    exportToExcel,

    // Column definitions
    deviceColumns,
    configurationColumns,
    compliancePolicyColumns,
    appProtectionColumns,
    appColumns
  };
}

export default useIntuneDiscoveredLogic;
