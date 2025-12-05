import { useState, useEffect, useCallback } from 'react';

import { useProfileStore } from '../store/useProfileStore';

export interface PrivilegedAccessData {
  user: string;
  role: string;
  lastUsed: string;
  expirationDate: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  permissions: string[];
  assignedDate: string;
  justification: string;
}

export const usePrivilegedAccessLogic = () => {
  const [data, setData] = useState<PrivilegedAccessData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedSourceProfile } = useProfileStore();

  const loadData = useCallback(async () => {
    if (!selectedSourceProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use PowerShell module integration for privileged access data
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Security/GetPrivilegedAccess.psm1',
        functionName: 'Get-PrivilegedAccessData',
        parameters: { profile: selectedSourceProfile.companyName },
        options: {}
      });

      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load privileged access data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading privileged access data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const exportData = useCallback(() => {
    // Export functionality
    const csv = [
      ['User', 'Role', 'Last Used', 'Expiration Date', 'Risk Level', 'Assigned Date', 'Justification'],
      ...data.map(item => [
        item.user,
        item.role,
        item.lastUsed,
        item.expirationDate,
        item.riskLevel,
        item.assignedDate,
        item.justification
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privileged-access-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  return { data, isLoading, error, reload: loadData, exportData };
};
