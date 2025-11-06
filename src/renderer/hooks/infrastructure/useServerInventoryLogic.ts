import { useState, useEffect, useCallback } from 'react';

import { useProfileStore } from '../../store/useProfileStore';

export interface ServerInventoryData {
  serverName: string;
  os: string;
  cpu: string;
  memory: string;
  diskSpace: string;
  status: string;
}

export const useServerInventoryLogic = () => {
  const [data, setData] = useState<ServerInventoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedSourceProfile } = useProfileStore();

  const loadData = useCallback(async () => {
    if (!selectedSourceProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Infrastructure/ServerInventory.psm1',
        functionName: 'Get-ServerInventory',
        parameters: {
          ProfileName: selectedSourceProfile.companyName
        }
      });

      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load server inventory data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading server inventory');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, reload: loadData };
};
