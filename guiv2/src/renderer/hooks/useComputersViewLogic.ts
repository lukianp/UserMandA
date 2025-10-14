/**
 * Computers View Logic Hook
 * Manages state and logic for the Computers view
 */

import { useState, useEffect } from 'react';

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

  // Load computers on mount
  useEffect(() => {
    loadComputers();
  }, []);

  /**
   * Load computers from Logic Engine
   */
  const loadComputers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Placeholder: would call Logic Engine to get computers
      // const result = await window.electronAPI.invoke('logicEngine:getAllComputers');
      // For now, return empty array
      setComputers([]);
      console.log('Loaded computers from Logic Engine');
    } catch (err) {
      console.error('Failed to load computers:', err);
      setError('Failed to load computers from Logic Engine.');
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
