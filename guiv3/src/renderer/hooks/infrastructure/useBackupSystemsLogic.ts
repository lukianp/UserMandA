import { useState, useEffect, useCallback } from 'react';

import { useProfileStore } from '../../store/useProfileStore';

export interface BackupSystemsData {
  systemName: string;
  type: string;
  lastBackup: string;
  status: string;
  capacity: string;
}

export const useBackupSystemsLogic = () => {
  const [data, setData] = useState<BackupSystemsData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedSourceProfile } = useProfileStore();

  const loadData = useCallback(async () => {
    if (!selectedSourceProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Infrastructure/BackupSystems.psm1',
        functionName: 'Get-BackupSystems',
        parameters: {
          ProfileName: selectedSourceProfile.companyName
        }
      });

      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load backup systems data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading backup systems');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, reload: loadData };
};
