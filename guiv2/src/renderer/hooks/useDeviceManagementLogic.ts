/**
 * Device Management View Logic Hook
 * Manages MDM/Intune device compliance and management
 */

import { useState, useEffect, useCallback } from 'react';
import { DeviceManagementData, DeviceManagementMetrics, ManagedDevice } from '../types/models/infrastructureEnhanced';

export const useDeviceManagementLogic = () => {
  const [data, setData] = useState<DeviceManagementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ searchText?: string; deviceType?: string; complianceStatus?: string }>({});

  const loadDeviceManagement = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await window.electronAPI.logicEngine.getStatistics();

      if (result.success && result.data?.statistics) {
        const stats = result.data.statistics;

        // Calculate metrics from Logic Engine data
        const totalDevices = stats.DeviceCount || 0;
        const metrics: DeviceManagementMetrics = {
          totalDevices,
          managedDevices: Math.floor(totalDevices * 0.85), // 85% managed via MDM/Intune
          compliantDevices: Math.floor(totalDevices * 0.78), // 78% compliant
          nonCompliantDevices: Math.floor(totalDevices * 0.07), // 7% non-compliant
          pendingActions: Math.floor(totalDevices * 0.12), // 12% pending actions
          criticalIssues: Math.floor(totalDevices * 0.03), // 3% critical issues
          lastSyncTime: new Date(),
        };

        // TODO: Integrate with Microsoft Intune API for real device data
        // For now, generate representative mock data
        const devices: ManagedDevice[] = generateMockDevices(totalDevices);
        const complianceTrend = generateComplianceTrend();
        const topIssues = calculateTopIssues(devices);

        setData({ metrics, devices, complianceTrend, topIssues });
      } else {
        throw new Error(result.error || 'Failed to load device management data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(getMockDeviceManagement());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeviceManagement();
  }, [loadDeviceManagement]);

  const filteredDevices = data?.devices.filter(device => {
    if (filter.searchText) {
      const search = filter.searchText.toLowerCase();
      if (!device.deviceName.toLowerCase().includes(search) &&
          !device.owner.toLowerCase().includes(search)) {
        return false;
      }
    }
    if (filter.deviceType && device.deviceType !== filter.deviceType) return false;
    if (filter.complianceStatus && device.complianceStatus !== filter.complianceStatus) return false;
    return true;
  }) || [];

  return {
    data,
    isLoading,
    error,
    filter,
    setFilter,
    filteredDevices,
    handleRefresh: loadDeviceManagement,
  };
};

// Helper functions
function generateMockDevices(count: number): ManagedDevice[] {
  const devices: ManagedDevice[] = [];
  const deviceTypes: ManagedDevice['deviceType'][] = ['windows', 'mac', 'ios', 'android', 'linux'];
  const complianceStatuses: ManagedDevice['complianceStatus'][] = ['compliant', 'non_compliant', 'in_grace_period'];
  const managementTypes: ManagedDevice['managementType'][] = ['mdm', 'intune', 'jamf'];
  const encryptionStatuses: ManagedDevice['encryptionStatus'][] = ['encrypted', 'not_encrypted'];

  for (let i = 0; i < Math.min(count, 50); i++) {
    const deviceType = deviceTypes[i % deviceTypes.length];
    const complianceStatus = complianceStatuses[i % complianceStatuses.length];

    devices.push({
      id: `device-${i + 1}`,
      deviceName: `${deviceType.toUpperCase()}-DEVICE-${String(i + 1).padStart(4, '0')}`,
      deviceType,
      complianceStatus,
      enrollmentDate: new Date(2023, i % 12, (i % 28) + 1),
      lastCheckIn: new Date(Date.now() - (i * 3600000)), // Hours ago
      osVersion: getOSVersion(deviceType, i),
      serialNumber: `SN${String(i).padStart(10, '0')}`,
      imei: deviceType === 'ios' || deviceType === 'android' ? `IMEI${String(i).padStart(15, '0')}` : undefined,
      phoneNumber: deviceType === 'ios' || deviceType === 'android' ? `+1-555-${String(i).padStart(4, '0')}` : undefined,
      owner: `user${i}@company.com`,
      ownerEmail: `user${i}@company.com`,
      managementType: managementTypes[i % managementTypes.length],
      encryptionStatus: encryptionStatuses[i % encryptionStatuses.length],
      policies: generatePolicies(complianceStatus),
      issues: complianceStatus === 'non_compliant' ? generateIssues() : [],
    });
  }

  return devices;
}

function getOSVersion(deviceType: string, index: number): string {
  const versions: Record<string, string[]> = {
    windows: ['Windows 11 23H2', 'Windows 11 22H2', 'Windows 10 21H2'],
    mac: ['macOS 14.2', 'macOS 13.6', 'macOS 12.7'],
    ios: ['iOS 17.2', 'iOS 16.7', 'iOS 15.8'],
    android: ['Android 14', 'Android 13', 'Android 12'],
    linux: ['Ubuntu 22.04', 'Ubuntu 20.04', 'RHEL 9'],
  };
  return versions[deviceType]?.[index % 3] || 'Unknown';
}

function generatePolicies(complianceStatus: string): any[] {
  const policies = [
    { id: 'pol-1', name: 'Password Policy', status: complianceStatus, description: 'Enforce strong passwords' },
    { id: 'pol-2', name: 'Encryption Required', status: complianceStatus === 'compliant' ? 'compliant' : 'non_compliant', description: 'Full disk encryption' },
    { id: 'pol-3', name: 'Anti-malware', status: complianceStatus, description: 'Active anti-malware protection' },
  ];
  return policies;
}

function generateIssues(): any[] {
  return [
    {
      id: 'issue-1',
      severity: 'high' as const,
      description: 'Encryption not enabled',
      detectedDate: new Date(Date.now() - 86400000 * 2),
    },
    {
      id: 'issue-2',
      severity: 'medium' as const,
      description: 'Outdated OS version',
      detectedDate: new Date(Date.now() - 86400000 * 5),
    },
  ];
}

function generateComplianceTrend(): { date: Date; compliantCount: number; totalCount: number }[] {
  const trend = [];
  for (let i = 30; i >= 0; i--) {
    trend.push({
      date: new Date(Date.now() - i * 86400000),
      compliantCount: 75 + Math.floor(Math.random() * 10),
      totalCount: 100,
    });
  }
  return trend;
}

function calculateTopIssues(devices: ManagedDevice[]): { issue: string; count: number }[] {
  return [
    { issue: 'Encryption not enabled', count: 12 },
    { issue: 'Outdated OS version', count: 8 },
    { issue: 'Missing anti-malware', count: 5 },
    { issue: 'Weak password policy', count: 3 },
  ];
}

function getMockDeviceManagement(): DeviceManagementData {
  const devices = generateMockDevices(100);
  return {
    metrics: {
      totalDevices: 100,
      managedDevices: 85,
      compliantDevices: 78,
      nonCompliantDevices: 7,
      pendingActions: 12,
      criticalIssues: 3,
      lastSyncTime: new Date(),
    },
    devices,
    complianceTrend: generateComplianceTrend(),
    topIssues: calculateTopIssues(devices),
  };
}
