/**
 * Computers View Logic Hook
 * Manages state and logic for the Computers view
 *
 * Replicates /gui/ UsersViewModel.cs LoadAsync() pattern:
 * - Loads data from LogicEngine on mount
 * - Reloads when profile changes
 * - Auto-refreshes on file changes
 */

import { useState, useEffect } from 'react';

import { useProfileStore } from '../store/useProfileStore';

interface Computer {
  id: string;
  name: string;
  os?: string;
  domain?: string;
  ipAddress?: string;
  status?: string;
  lastSeen?: string;
}

export const useComputersViewLogic = () => {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to selected source profile changes
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  // Load computers on mount and when profile changes
  useEffect(() => {
    loadComputers();
  }, [selectedSourceProfile]); // Reload when profile changes

  // Subscribe to file change events for auto-refresh
  useEffect(() => {
    const handleDataRefresh = (dataType: string) => {
      if ((dataType === 'Computers' || dataType === 'All') && !isLoading) {
        console.log('[ComputersView] Auto-refreshing due to file changes');
        loadComputers();
      }
    };

    // TODO: Subscribe to file watcher events when available
    // window.electronAPI.on('filewatcher:dataChanged', handleDataRefresh);

    return () => {
      // TODO: Cleanup subscription
      // window.electronAPI.off('filewatcher:dataChanged', handleDataRefresh);
    };
  }, [isLoading]);

  /**
   * Load computers from Logic Engine
   * Replicates /gui/ UsersViewModel.LoadAsync() pattern
   */
  const loadComputers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[ComputersView] Loading computers from LogicEngine...');

      // Call LogicEngine to get all devices (computers)
      const result = await window.electronAPI.invoke('logicEngine:getAllDevices');

      if (!result.success) {
        throw new Error(result.error || 'Failed to load devices from LogicEngine');
      }

      const devices = result.data || [];
      console.log(`[ComputersView] Loaded ${devices.length} computers from LogicEngine`);

      // Map LogicEngine device format to Computer interface
      const mappedComputers: Computer[] = devices.map((device: any) => ({
        id: device.sid || device.name || crypto.randomUUID(),
        name: device.name || device.computerName || 'Unknown',
        os: device.os || device.operatingSystem,
        domain: device.domain,
        ipAddress: device.ipAddress || device.ip,
        status: device.enabled ? 'Active' : 'Disabled',
        lastSeen: device.lastLogon || device.lastSeen,
      }));

      setComputers(mappedComputers);
      setError(null);

    } catch (err) {
      console.error('[ComputersView] Failed to load computers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load computers from Logic Engine.');
      setComputers([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle export computers to CSV
   */
  const handleExport = async () => {
    try {
      const filePath = await window.electronAPI.showSaveDialog({
        title: 'Export Computers',
        defaultPath: `computers-export-${new Date().toISOString().split('T')[0]}.csv`,
        filters: [
          { name: 'CSV Files', extensions: ['csv'] },
        ],
      });

      if (!filePath) return;

      const headers = ['Name', 'OS', 'Domain', 'IP Address', 'Status', 'Last Seen'];
      const rows = computers.map((c) => [
        c.name,
        c.os || '',
        c.domain || '',
        c.ipAddress || '',
        c.status || '',
        c.lastSeen || '',
      ]);

      const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
      await window.electronAPI.writeFile(filePath, csv);

      console.log(`Exported ${computers.length} computers to ${filePath}`);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export computers.');
    }
  };

  /**
   * Handle refresh computers
   */
  const handleRefresh = () => {
    loadComputers();
  };

  return {
    computers,
    isLoading,
    error,
    handleExport,
    handleRefresh,
  };
};


