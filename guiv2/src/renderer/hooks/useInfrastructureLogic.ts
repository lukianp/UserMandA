/**
 * Infrastructure View Logic Hook
 * Handles network infrastructure and server discovery
 */

import { useState, useCallback } from 'react';

import { useDiscoveryStore } from '../store/useDiscoveryStore';
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

  const loadInfrastructure = useCallback(async () => {
    setIsLoading(true);
    try {
      const electronAPI = getElectronAPI();
      const result = await electronAPI.executeModule({
        modulePath: 'Modules/Discovery/InfrastructureDiscovery.psm1',
        functionName: 'Get-InfrastructureInventory',
        parameters: {},
      });

      if (result.success) {
        setInfrastructure(result.data.infrastructure || []);

        const discoveryResult: DiscoveryResult = {
          id: `infra-${Date.now()}`,
          name: 'Infrastructure Discovery',
          moduleName: 'InfrastructureDiscovery',
          displayName: 'Network Infrastructure Discovery',
          itemCount: result.data.infrastructure?.length || 0,
          discoveryTime: new Date().toISOString(),
          duration: result.duration || 0,
          status: 'Completed',
          filePath: result.data.outputPath || '',
          success: true,
          summary: `Discovered ${result.data.infrastructure?.length || 0} infrastructure items`,
          errorMessage: '',
          additionalData: result.data,
          createdAt: new Date().toISOString(),
        };
        addResult(discoveryResult);
      }
    } catch (error) {
      console.error('Failed to load infrastructure:', error);
    } finally {
      setIsLoading(false);
    }
  }, [addResult]);

  const filteredInfrastructure = infrastructure.filter(item => {
    const matchesSearch = !searchText ||
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
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
