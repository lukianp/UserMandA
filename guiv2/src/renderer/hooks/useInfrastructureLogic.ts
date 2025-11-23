/**
 * Infrastructure View Logic Hook
 * Handles network infrastructure and server discovery
 */

import { useState, useCallback, useEffect } from 'react';

import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { useProfileStore } from '../store/useProfileStore';
import { DiscoveryResult } from '../types/models/discovery';
import { getElectronAPI } from '../lib/electron-api-fallback';

export interface InfrastructureData {
  id: string;
  name: string;
  type: 'server' | 'network' | 'storage' | 'virtualization';
  ipAddress: string;
  status: 'online' | 'offline' | 'unknown';
  os: string;
  lastSeen: Date | string;
  details: Record<string, any>;
}

export const useInfrastructureLogic = () => {
  const { addResult } = useDiscoveryStore();

  const [infrastructure, setInfrastructure] = useState<InfrastructureData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedItems, setSelectedItems] = useState<InfrastructureData[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  // Subscribe to selected source profile changes
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  // Load infrastructure on mount and when profile changes
  useEffect(() => {
    loadInfrastructure();
  }, [selectedSourceProfile]);

  const loadInfrastructure = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('[InfrastructureView] Loading devices from LogicEngine...');

      // Get devices from Logic Engine
      const result = await window.electronAPI.invoke('logicEngine:getAllDevices');

      if (!result.success) {
        throw new Error(result.error || 'Failed to load devices from LogicEngine');
      }

      if (!Array.isArray(result.data)) {
        throw new Error('Invalid response format from LogicEngine');
      }

      // Map device DTOs to InfrastructureData
      const mappedDevices: InfrastructureData[] = result.data.map((device: any) => ({
        id: device.Id || device.Name || `device-${Date.now()}`,
        name: device.Name || 'Unknown Device',
        type: device.Type || 'server',
        ipAddress: device.IpAddress || 'Unknown',
        status: 'online' as const,
        os: device.Os || device.OperatingSystem || 'Unknown',
        lastSeen: device.DiscoveryTimestamp || new Date().toISOString(),
        details: device,
      }));

      setInfrastructure(mappedDevices);
      console.log(`[InfrastructureView] Loaded ${mappedDevices.length} devices from LogicEngine`);
    } catch (error: any) {
      console.error('[InfrastructureView] Failed to load devices:', error);
      setInfrastructure([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  const filteredInfrastructure = infrastructure.filter(item => {
    const matchesSearch = !searchText ||
      (item.name ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
      item.ipAddress.includes(searchText);
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleExport = useCallback(() => {
    const electronAPI = getElectronAPI();
    electronAPI.writeFile(
      `infrastructure-${Date.now()}.json`,
      JSON.stringify(filteredInfrastructure, null, 2)
    );
  }, [filteredInfrastructure]);

  return {
    infrastructure: filteredInfrastructure,
    isLoading,
    searchText,
    setSearchText,
    selectedItems,
    setSelectedItems,
    filterType,
    setFilterType,
    loadInfrastructure,
    handleExport,
  };
};
