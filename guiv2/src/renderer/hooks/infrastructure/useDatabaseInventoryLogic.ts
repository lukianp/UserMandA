import { useState, useEffect, useCallback } from 'react';
import { useProfileStore } from '../../store/useProfileStore';

export interface DatabaseInventoryData {
  databaseName: string;
  type: string;
  server: string;
  size: string;
  version: string;
  status: string;
}

export const useDatabaseInventoryLogic = () => {
  const [data, setData] = useState<DatabaseInventoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedSourceProfile } = useProfileStore();

  const loadData = useCallback(async () => {
    if (!selectedSourceProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Infrastructure/DatabaseInventory.psm1',
        functionName: 'Get-DatabaseInventory',
        parameters: {
          ProfileName: selectedSourceProfile.companyName
        }
      });

      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load database inventory data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading database inventory');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, reload: loadData };
};
